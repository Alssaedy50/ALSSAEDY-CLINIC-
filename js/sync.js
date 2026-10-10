/* AQSA7 bidirectional cloud sync — merge by stable record ID and updatedAt.
   IndexedDB remains the local durable source; the cloud stores a merged, versioned snapshot.
   Deletions propagate as scoped tombstones. Offline use remains available. */
const SYNC_KEY_STORAGE = 'alssaedy_sync_key';
const SYNC_URL_STORAGE = 'alssaedy_sync_url';
const SYNC_AUTO_STORAGE = 'alssaedy_sync_auto';
const SYNC_CLIENT_STORAGE = 'alssaedy_sync_client';
const SYNC_TOMBSTONES_STORAGE = 'aqsa7_sync_tombstones_v1';
const SYNC_MAX_CONFLICT_RETRIES = 5;
let __autoSyncTimer = null;
let __syncInProgress = false;
let __syncRequestedAgain = false;

function getSyncKey() { return (localStorage.getItem(SYNC_KEY_STORAGE) || '').trim(); }
function getSyncUrl() {
    const stored = (localStorage.getItem(SYNC_URL_STORAGE) || '').trim();
    if (stored) return stored.replace(/\/+$/, '');
    return location.origin.replace(/\/+$/, '') + '/api/clinic-sync';
}
function getSyncClientId() {
    let id = localStorage.getItem(SYNC_CLIENT_STORAGE);
    if (!id) {
        id = (window.crypto?.randomUUID ? window.crypto.randomUUID() : 'C-' + Date.now() + '-' + Math.random().toString(36).slice(2));
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
    if (badge) badge.textContent = isSyncConfigured() ? (isAutoSyncEnabled() ? 'مزامنة تلقائية' : 'مزامنة جاهزة') : 'غير مفعّل';
    setSyncStatus(isSyncConfigured() ? 'المزامنة ثنائية الاتجاه جاهزة. استخدم نفس مفتاح العيادة على أجهزتك.' : 'أدخل مفتاح العيادة لتشغيل المزامنة.', isSyncConfigured() ? 'ok' : 'idle');
}
function saveSyncKey(value) { localStorage.setItem(SYNC_KEY_STORAGE, String(value || '').trim()); updateSyncUI(); }
function saveSyncUrl(value) { localStorage.setItem(SYNC_URL_STORAGE, String(value || '').trim()); updateSyncUI(); }
function toggleSyncAuto(checked) {
    localStorage.setItem(SYNC_AUTO_STORAGE, checked ? 'on' : 'off');
    updateSyncUI();
    if (checked && isSyncConfigured()) autoSyncIfEnabled(true);
}

function syncTimestamp(item) {
    for (const key of ['updatedAt','modifiedAt','createdAt','issuedAt','date']) {
        const value = item?.[key];
        if (!value) continue;
        const time = Date.parse(value);
        if (Number.isFinite(time)) return time;
    }
    return 0;
}
function syncStableJSON(value) {
    if (Array.isArray(value)) return '[' + value.map(syncStableJSON).join(',') + ']';
    if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + syncStableJSON(value[k])).join(',') + '}';
    return JSON.stringify(value);
}
function syncPickNewest(a, b) {
    if (!a) return b;
    if (!b) return a;
    const ta = syncTimestamp(a), tb = syncTimestamp(b);
    if (ta !== tb) return ta > tb ? a : b;
    // Stable tie-break means two devices resolve equal timestamps identically.
    return syncStableJSON(a) >= syncStableJSON(b) ? a : b;
}
function syncMergeRecords(localItems, remoteItems, keyName = 'id') {
    const map = new Map();
    for (const item of [...(Array.isArray(localItems) ? localItems : []), ...(Array.isArray(remoteItems) ? remoteItems : [])]) {
        if (!item || item[keyName] === undefined || item[keyName] === null || String(item[keyName]) === '') continue;
        const key = String(item[keyName]);
        map.set(key, syncPickNewest(map.get(key), item));
    }
    return [...map.values()];
}
function syncMergeTombstones(localItems, remoteItems) {
    const map = new Map();
    for (const item of [...(Array.isArray(localItems) ? localItems : []), ...(Array.isArray(remoteItems) ? remoteItems : [])]) {
        if (!item || !['patients','receipts'].includes(item.store) || item.id === undefined || !Number.isFinite(Date.parse(item.deletedAt || ''))) continue;
        const key = item.store + ':' + String(item.id);
        const old = map.get(key);
        if (!old || Date.parse(item.deletedAt) > Date.parse(old.deletedAt)) map.set(key, {...item,id:String(item.id)});
    }
    return [...map.values()];
}
function syncApplyTombstones(items, tombstones) {
    const latest = new Map((tombstones || []).map(t => [t.store + ':' + String(t.id), Date.parse(t.deletedAt)]));
    return (items || []).filter(item => {
        const deletedAt = latest.get(item.store + ':' + String(item.id));
        return deletedAt === undefined || syncTimestamp(item) > deletedAt;
    });
}
function syncValidateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('النسخة السحابية غير صالحة.');
    if (snapshot.app && snapshot.app !== 'ALSSAEDY_CLINIC') throw new Error('هذه النسخة لا تخص تطبيق العيادة.');
    if (snapshot.receipts !== undefined && !Array.isArray(snapshot.receipts)) throw new Error('قائمة السندات السحابية غير صالحة.');
    if (snapshot.patients !== undefined && !Array.isArray(snapshot.patients)) throw new Error('قائمة المرضى السحابية غير صالحة.');
    return snapshot;
}
function mergeSyncSnapshots(localSnapshot, remoteSnapshot) {
    const local = syncValidateSnapshot(localSnapshot || {});
    const remote = syncValidateSnapshot(remoteSnapshot || {});
    const tombstones = syncMergeTombstones(local.tombstones, remote.tombstones);
    const receipts = syncApplyTombstones(syncMergeRecords(local.receipts, remote.receipts), tombstones.filter(t => t.store === 'receipts').map(t => ({...t,store:'receipts'})));
    const patients = syncApplyTombstones(syncMergeRecords(local.patients, remote.patients), tombstones.filter(t => t.store === 'patients').map(t => ({...t,store:'patients'})));
    const settingsRecords = syncMergeRecords(local.settingsRecords, remote.settingsRecords);
    const identity = typeof window.aqsa7GetInstanceIdentity === 'function' ? window.aqsa7GetInstanceIdentity() : {};
    const localSettingsTime = Math.max(0, ...(local.settingsRecords || []).map(syncTimestamp));
    const remoteSettingsTime = Math.max(0, ...(remote.settingsRecords || []).map(syncTimestamp));
    const settings = localSettingsTime > remoteSettingsTime ? (local.settings || remote.settings || {}) :
        remoteSettingsTime > localSettingsTime ? (remote.settings || local.settings || {}) :
        syncStableJSON(local.settings || {}) >= syncStableJSON(remote.settings || {}) ? (local.settings || remote.settings || {}) : (remote.settings || local.settings || {});
    return {
        app:'ALSSAEDY_CLINIC',
        snapshotVersion:3,
        updatedAt:new Date().toISOString(),
        identity,
        receipts,
        patients,
        settings,
        settingsRecords,
        tombstones
    };
}

async function buildSyncSnapshot() {
    const base = (typeof buildFullBackup === 'function') ? await buildFullBackup() : {};
    const identity = typeof window.aqsa7GetInstanceIdentity === 'function' ? window.aqsa7GetInstanceIdentity() : {};
    const localTombstones = typeof clinicRepositoryGetSyncTombstones === 'function' ? clinicRepositoryGetSyncTombstones() :
        (() => { try { return JSON.parse(localStorage.getItem(SYNC_TOMBSTONES_STORAGE)||'[]'); } catch (_) { return []; } })();
    return {
        app:'ALSSAEDY_CLINIC',
        snapshotVersion:3,
        updatedAt:new Date().toISOString(),
        identity,
        receipts:await clinicDBAll('receipts'),
        patients:await clinicDBAll('patients'),
        settings:base.settings || {},
        settingsRecords:await clinicDBAll('settings'),
        tombstones:localTombstones
    };
}
async function syncRequest(method, options = {}) {
    const key = getSyncKey();
    if (!key) throw new Error('لم يتم إدخال مفتاح العيادة للمزامنة.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs || 20000);
    try {
        const res = await fetch(getSyncUrl(), {
            method,
            headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
            body:options.body ? JSON.stringify(options.body) : undefined,
            signal:controller.signal
        });
        const data = await res.json().catch(() => ({}));
        return {status:res.status,data};
    } finally { clearTimeout(timer); }
}

function validateSyncRecordOwnership(snapshot) {
    const own = typeof window.aqsa7OwnRecord === 'function'
        ? item => window.aqsa7OwnRecord(item,{allowUnscoped:true})
        : item => item;
    const receipts = (snapshot.receipts || []).map(own);
    const patients = (snapshot.patients || []).map(own);
    // Validate all records before writing any, so a foreign Instance cannot partially restore.
    return {...snapshot,receipts,patients};
}
async function applyMergedSyncSnapshot(rawSnapshot) {
    let snapshot = validateSyncRecordOwnership(syncValidateSnapshot(rawSnapshot));
    if (typeof clinicRepositoryMergeSyncTombstones === 'function') {
        snapshot.tombstones = clinicRepositoryMergeSyncTombstones(snapshot.tombstones);
    } else {
        const existing = (()=>{try{return JSON.parse(localStorage.getItem(SYNC_TOMBSTONES_STORAGE)||'[]')}catch(_){return []}})();
        snapshot.tombstones = syncMergeTombstones(existing,snapshot.tombstones);
        localStorage.setItem(SYNC_TOMBSTONES_STORAGE,JSON.stringify(snapshot.tombstones));
    }
    const tombstoneMap = new Map(snapshot.tombstones.map(t => [t.store+':'+String(t.id),Date.parse(t.deletedAt)]));
    for (const [store,items] of [['patients',snapshot.patients],['receipts',snapshot.receipts]]) {
        const incomingIds = new Set();
        for (const item of items) {
            if (item.productId && item.tenantId && item.instanceId) {
                const identity = typeof window.aqsa7GetInstanceIdentity === 'function' ? window.aqsa7GetInstanceIdentity() : {};
                if (item.productId !== identity.productId || item.tenantId !== identity.tenantId || item.instanceId !== identity.instanceId) {
                    throw new Error('تم رفض سجل من عيادة أو مساحة عمل مختلفة.');
                }
            }
            const tombstoneAt = tombstoneMap.get(store+':'+String(item.id));
            if (tombstoneAt !== undefined && tombstoneAt >= syncTimestamp(item)) continue;
            await clinicDBPut(store,item);
            incomingIds.add(String(item.id));
        }
        for (const tombstone of snapshot.tombstones.filter(t=>t.store===store)) {
            const tombstoneAt = Date.parse(tombstone.deletedAt);
            const current = (await clinicDBAll(store)).find(item=>String(item.id)===String(tombstone.id));
            if (current && tombstoneAt >= syncTimestamp(current)) await clinicDBDelete(store,tombstone.id);
        }
    }
    for (const item of snapshot.settingsRecords || []) {
        if (!item || item.id === undefined || item.id === null) continue;
        await clinicDBPut('settings',item);
    }
    await clinicRepositoryHydrate();
    // Compatibility for older cloud snapshots that predate per-setting records.
    if (!(snapshot.settingsRecords || []).length && snapshot.settings) {
        const incoming = snapshot.settings.clinic || snapshot.settings;
        if (incoming && typeof incoming === 'object') {
            const values = {};
            if (Object.prototype.hasOwnProperty.call(incoming,'customLogo')) values.customLogo = incoming.customLogo || '';
            if (Object.prototype.hasOwnProperty.call(incoming,'currency')) values.currency = incoming.currency || 'YER';
            if (Object.prototype.hasOwnProperty.call(incoming,'size')) values.receiptSize = incoming.size || 'a5';
            if (Object.prototype.hasOwnProperty.call(incoming,'texts')) values.receiptTexts = incoming.texts || '';
            if (Object.keys(values).length) await clinicRepositoryPutSettings(values);
        }
        if (snapshot.settings.ui?.theme) localStorage.setItem('alssaedy_theme',snapshot.settings.ui.theme);
        if (snapshot.settings.ui?.watermark) localStorage.setItem('alssaedy_watermark',snapshot.settings.ui.watermark);
    }
    if (typeof applyLogo === 'function') applyLogo(clinicRepositoryGetSettingSync('customLogo') || (typeof OFFICIAL_LOGO_URL !== 'undefined' ? OFFICIAL_LOGO_URL : ''));
    if (typeof setCurrency === 'function') setCurrency(clinicRepositoryGetSettingSync('currency') || 'YER');
    if (typeof setSize === 'function') setSize(clinicRepositoryGetSettingSync('receiptSize') || 'a5');
    if (typeof updateHistoryCount === 'function') updateHistoryCount();
    if (typeof renderHistory === 'function') renderHistory();
    return {receipts:snapshot.receipts.length,patients:snapshot.patients.length};
}

async function runBidirectionalSync(actionLabel) {
    if (!isSyncConfigured()) {
        if (typeof toast === 'function') toast('أدخل مفتاح العيادة أولاً.','error');
        return {status:'not-configured'};
    }
    if (__syncInProgress) { __syncRequestedAgain = true; return {status:'already-running'}; }
    __syncInProgress = true;
    setSyncStatus(actionLabel === 'restore' ? 'جارٍ جلب ودمج بيانات السحابة...' : 'جارٍ دمج بيانات هذا الجهاز مع بقية الأجهزة...', 'busy');
    try {
        let merged = await buildSyncSnapshot();
        let remote = await syncRequest('GET');
        if (remote.status !== 200) throw new Error(remote.data?.error || ('HTTP '+remote.status));
        let baseVersion = 0;
        if (remote.data?.found && remote.data?.record) {
            baseVersion = Number(remote.data.record.version) || 0;
            merged = mergeSyncSnapshots(merged, remote.data.record.payload);
        }
        await applyMergedSyncSnapshot(merged);
        for (let attempt=0; attempt<SYNC_MAX_CONFLICT_RETRIES; attempt++) {
            merged.updatedAt = new Date().toISOString();
            const response = await syncRequest('PUT',{body:{baseVersion,clientId:getSyncClientId(),updatedAt:merged.updatedAt,payload:merged}});
            if (response.status === 200 && response.data?.ok && response.data?.record) {
                localStorage.setItem('alssaedy_last_sync',new Date().toISOString());
                localStorage.setItem('alssaedy_last_sync_version',String(response.data.record.version));
                setSyncStatus('اكتملت المزامنة بين الأجهزة. الإصدار السحابي '+response.data.record.version+'؛ '+merged.patients.length+' مريض و'+merged.receipts.length+' سند.', 'ok');
                if (typeof toast === 'function') toast('اكتملت المزامنة السحابية ثنائية الاتجاه.');
                return {status:'success',version:response.data.record.version,patients:merged.patients.length,receipts:merged.receipts.length};
            }
            if (response.status !== 409 || !response.data?.record?.payload) {
                throw new Error(response.data?.error || ('HTTP '+response.status));
            }
            // A device wrote while this one was syncing. Merge the returned revision and retry.
            baseVersion = Number(response.data.record.version) || 0;
            merged = mergeSyncSnapshots(merged,response.data.record.payload);
            await applyMergedSyncSnapshot(merged);
        }
        throw new Error('تغيّرت البيانات على الخادم عدة مرات. أعد المحاولة بعد لحظات.');
    } catch (error) {
        setSyncStatus('تعذرت المزامنة: '+(error?.message || 'خطأ غير معروف'), 'error');
        if (typeof toast === 'function') toast('تعذرت المزامنة: '+(error?.message || 'خطأ غير معروف'),'error');
        return {status:'error',error:error?.message || String(error)};
    } finally {
        __syncInProgress = false;
        if (__syncRequestedAgain) {
            __syncRequestedAgain = false;
            autoSyncIfEnabled(false);
        }
    }
}
function syncBackupNow() { return runBidirectionalSync('sync'); }
function syncRestoreNow() { return runBidirectionalSync('restore'); }
function autoSyncIfEnabled(immediate = false) {
    if (!isAutoSyncEnabled() || !isSyncConfigured()) return;
    if (__autoSyncTimer) clearTimeout(__autoSyncTimer);
    __autoSyncTimer = setTimeout(() => runBidirectionalSync('sync'), immediate ? 0 : 8000);
}

window.AQSA7_SYNC_ENGINE = Object.freeze({
    version:3,
    mergeSnapshots:mergeSyncSnapshots,
    mergeRecords:syncMergeRecords,
    mergeTombstones:syncMergeTombstones,
    recordTimestamp:syncTimestamp
});
window.addEventListener('DOMContentLoaded', () => {
    updateSyncUI();
    setTimeout(() => autoSyncIfEnabled(false), 3000);
});
