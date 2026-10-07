/* Cloud sync layer — keyed snapshot backup/restore with version conflict handling.
   Works against the bundled scripts/serve.py API or any compatible endpoint.
   The feature is fully optional: the app remains usable offline with no key. */

const SYNC_KEY_STORAGE = 'alssaedy_sync_key';
const SYNC_URL_STORAGE = 'alssaedy_sync_url';
const SYNC_AUTO_STORAGE = 'alssaedy_sync_auto';
const SYNC_CLIENT_STORAGE = 'alssaedy_sync_client';

function getSyncKey() { return (localStorage.getItem(SYNC_KEY_STORAGE) || '').trim(); }
function getSyncUrl() {
    const stored = (localStorage.getItem(SYNC_URL_STORAGE) || '').trim();
    if (stored) return stored.replace(/\/+$/, '');
    // Default: same-origin backup endpoint.
    return location.origin.replace(/\/+$/, '') + '/api/clinic-sync';
}
function getSyncClientId() {
    let id = localStorage.getItem(SYNC_CLIENT_STORAGE);
    if (!id) {
        id = (window.crypto?.randomUUID ? window.crypto.randomUUID() : 'C-' + Date.now());
        localStorage.setItem(SYNC_CLIENT_STORAGE, id);
    }
    return id;
}
function isSyncConfigured() { return Boolean(getSyncKey()); }
function isAutoSyncEnabled() { return localStorage.getItem(SYNC_AUTO_STORAGE) === 'on'; }

function setSyncStatus(text, kind = 'info') {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'sync-status sync-' + kind;
}
function updateSyncUI() {
    const keyInput = document.getElementById('syncKeyInput');
    if (keyInput && document.activeElement !== keyInput) keyInput.value = getSyncKey();
    const urlInput = document.getElementById('syncUrlInput');
    if (urlInput && document.activeElement !== urlInput) urlInput.value = localStorage.getItem(SYNC_URL_STORAGE) || '';
    const auto = document.getElementById('syncAutoToggle');
    if (auto) auto.checked = isAutoSyncEnabled();
    const badge = document.getElementById('syncBadge');
    if (badge) badge.textContent = isSyncConfigured() ? (isAutoSyncEnabled() ? 'مفعّل تلقائي' : 'جاهز') : 'غير مفعّل';
    setSyncStatus(isSyncConfigured() ? 'المزامنة جاهزة. اضغط «نسخ احتياطي» للرفع أو «استعادة» للجلب.' : 'أدخل مفتاح العيادة لتشغيل المزامنة.', isSyncConfigured() ? 'ok' : 'idle');
}

function saveSyncKey(value) {
    localStorage.setItem(SYNC_KEY_STORAGE, String(value || '').trim());
    updateSyncUI();
}
function saveSyncUrl(value) {
    localStorage.setItem(SYNC_URL_STORAGE, String(value || '').trim());
    updateSyncUI();
}
function toggleSyncAuto(checked) {
    localStorage.setItem(SYNC_AUTO_STORAGE, checked ? 'on' : 'off');
    updateSyncUI();
    if (checked && isSyncConfigured()) autoSyncIfEnabled(true);
}

async function buildSyncSnapshot() {
    const base = (typeof buildFullBackup === 'function') ? await buildFullBackup() : {};
    return {
        app: 'ALSSAEDY_CLINIC',
        snapshotVersion: 1,
        updatedAt: new Date().toISOString(),
        receipts: await clinicDBAll('receipts'),
        patients: await clinicDBAll('patients'),
        settings: base.settings || {}
    };
}

async function syncRequest(method, options = {}) {
    const key = getSyncKey();
    if (!key) throw new Error('لم يتم إدخال مفتاح العيادة للمزامنة.');
    const url = getSyncUrl() + '?key=' + encodeURIComponent(key);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 20000);
    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, data };
    } finally {
        clearTimeout(timer);
    }
}

async function syncBackupNow(force = false) {
    if (!isSyncConfigured()) { if (typeof toast === 'function') toast('أدخل مفتاح العيادة أولاً.', 'error'); return; }
    setSyncStatus('جارٍ رفع النسخة الاحتياطية...', 'busy');
    try {
        const payload = await buildSyncSnapshot();
        // Read current server version for optimistic concurrency.
        let baseVersion = 0;
        const current = await syncRequest('GET');
        if (current.status === 200 && current.data?.record) baseVersion = Number(current.data.record.version) || 0;
        const body = { baseVersion, clientId: getSyncClientId(), updatedAt: payload.updatedAt, payload };
        let res = await syncRequest('PUT', { body });
        if (res.status === 409 && force) {
            baseVersion = Number(res.data?.record?.version) || 0;
            res = await syncRequest('PUT', { body: { ...body, baseVersion } });
        }
        if (res.status === 409) {
            setSyncStatus('يوجد إصدار أحدث على الخادم. اضغط «نسخ احتياطي» مرة أخرى للدمج/التجاوز.', 'warn');
            if (typeof toast === 'function') toast('تعارض مزامنة: ستُدمج النسخة عند إعادة المحاولة.', 'info');
            return;
        }
        if (res.status !== 200 || !res.data?.ok) throw new Error(res.data?.error || ('HTTP ' + res.status));
        localStorage.setItem('alssaedy_last_sync', new Date().toISOString());
        setSyncStatus('تم رفع النسخة الاحتياطية بنجاح (إصدار ' + res.data.record.version + ').', 'ok');
        if (typeof toast === 'function') toast('تم رفع النسخة الاحتياطية السحابية.');
    } catch (e) {
        setSyncStatus('تعذر رفع النسخة: ' + e.message, 'error');
        if (typeof toast === 'function') toast('تعذر رفع النسخة: ' + e.message, 'error');
    }
}

async function syncRestoreNow() {
    if (!isSyncConfigured()) { if (typeof toast === 'function') toast('أدخل مفتاح العيادة أولاً.', 'error'); return; }
    setSyncStatus('جارٍ جلب النسخة من الخادم...', 'busy');
    try {
        const res = await syncRequest('GET');
        if (res.status !== 200) throw new Error(res.data?.error || ('HTTP ' + res.status));
        if (!res.data?.found) { setSyncStatus('لا توجد نسخة سحابية بعد لهذا المفتاح.', 'warn'); return; }
        const snap = res.data.record.payload || {};
        let addedReceipts = 0, addedPatients = 0;
        const existingReceipts = await clinicDBAll('receipts');
        for (const item of (snap.receipts || [])) {
            const dup = existingReceipts.some(x => receiptFingerprint(x) === receiptFingerprint(item));
            if (!dup) { await clinicDBPut('receipts', item); existingReceipts.push(item); addedReceipts++; }
        }
        const existingPatients = await clinicDBAll('patients');
        for (const p of (snap.patients || [])) {
            const dup = existingPatients.find(x => x.id === p.id || (p.phone && x.phone === p.phone) || (!p.phone && x.name === p.name));
            if (!dup) { await clinicDBPut('patients', p); addedPatients++; }
        }
        localStorage.setItem('alssaedy_receipts_history', JSON.stringify(await clinicDBAll('receipts')));
        if (snap.settings) {
            if (snap.settings.customLogo) localStorage.setItem('alssaedy_custom_logo', snap.settings.customLogo);
            if (snap.settings.currency) localStorage.setItem('alssaedy_currency', snap.settings.currency);
            if (snap.settings.size) localStorage.setItem('alssaedy_receipt_size', snap.settings.size);
            if (snap.settings.theme) localStorage.setItem('alssaedy_theme', snap.settings.theme);
            if (snap.settings.texts) localStorage.setItem('alssaedy_texts', snap.settings.texts);
        }
        localStorage.setItem('alssaedy_last_sync', new Date().toISOString());
        if (typeof updateHistoryCount === 'function') updateHistoryCount();
        if (typeof renderHistory === 'function') renderHistory();
        setSyncStatus('تمت الاستعادة: ' + addedReceipts + ' سند و' + addedPatients + ' ملف مريض جديد.', 'ok');
        if (typeof toast === 'function') toast('تمت المزامنة من السحابة (بدون تكرار).');
    } catch (e) {
        setSyncStatus('تعذر الجلب: ' + e.message, 'error');
        if (typeof toast === 'function') toast('تعذر الجلب: ' + e.message, 'error');
    }
}

let __autoSyncTimer = null;
function autoSyncIfEnabled(immediate = false) {
    if (!isAutoSyncEnabled() || !isSyncConfigured()) return;
    if (__autoSyncTimer) clearTimeout(__autoSyncTimer);
    __autoSyncTimer = setTimeout(() => syncBackupNow(), immediate ? 0 : 8000);
}

window.addEventListener('DOMContentLoaded', () => {
    updateSyncUI();
    setTimeout(() => autoSyncIfEnabled(false), 3000);
});
