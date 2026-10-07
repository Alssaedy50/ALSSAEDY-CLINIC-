/* UI polish layer: toast notifications, night mode, shortcuts, draft recovery. */

function toast(message, type = 'success', timeout = 3200) {
    const stack = document.getElementById('toastStack');
    if (!stack) {
        if (type === 'error') console.warn(message); else console.log(message);
        return;
    }
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type === 'error' ? 'error' : type === 'info' ? 'info' : 'success');
    const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';
    el.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-text"></span>';
    el.querySelector('.toast-text').textContent = String(message ?? '');
    stack.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 320);
    }, timeout);
}

/* ---------- Night mode ---------- */
function isNightMode() { return document.documentElement.getAttribute('data-night') === 'on'; }
function applyNightMode(on) {
    document.documentElement.setAttribute('data-night', on ? 'on' : 'off');
    localStorage.setItem('alssaedy_night', on ? 'on' : 'off');
    const btn = document.getElementById('btnNight');
    if (btn) btn.textContent = on ? '☀️ وضع نهاري' : '🌙 وضع ليلي';
}
function toggleNightMode() { applyNightMode(!isNightMode()); }

/* ---------- Draft recovery ---------- */
const DRAFT_FIELDS = ['digReceiptNo', 'digDate', 'digClientName', 'digPatientPhone', 'digPaid', 'digTotal', 'digTafqeet', 'digRef', 'digTooth', 'digCustomService', 'selectedPayMethod'];
function saveDraft() {
    try {
        const fields = {};
        DRAFT_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) fields[id] = el.value; });
        fields.services = Array.from(document.querySelectorAll('.custom-check-item')).map(el => el.classList.contains('active'));
        localStorage.setItem('alssaedy_draft', JSON.stringify(fields));
    } catch (e) { /* storage full or unavailable */ }
}
function restoreDraft(fields) {
    Object.entries(fields || {}).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el && typeof value === 'string') el.value = value;
    });
    if (Array.isArray(fields?.services)) {
        document.querySelectorAll('.custom-check-item').forEach((el, i) => el.classList.toggle('active', !!fields.services[i]));
    }
    if (typeof calculateLedger === 'function') calculateLedger();
    if (typeof setPayMethod === 'function') setPayMethod(document.getElementById('selectedPayMethod')?.value || 'نقداً');
    if (typeof syncReceiptDateFromInput === 'function') syncReceiptDateFromInput();
}
function maybeRestoreDraft() {
    const raw = localStorage.getItem('alssaedy_draft');
    if (!raw) return;
    // Only offer recovery when the user has not started a fresh receipt.
    // Receipt number and date are auto-filled, so they are ignored here.
    const hasUserContent = ['digClientName', 'digPaid', 'digTotal'].some(id => document.getElementById(id)?.value);
    if (hasUserContent) return;
    try {
        const fields = JSON.parse(raw);
        const meaningful = fields.digClientName || fields.digPaid || fields.digReceiptNo;
        if (!meaningful) return;
        restoreDraft(fields);
        toast('تم استرجاع مسودة سابقة غير محفوظة. يمكنك "تفريغ" لبدء سند جديد.', 'info', 4200);
    } catch (e) { /* ignore malformed draft */ }
}

/* ---------- Global shortcuts ---------- */
function initShortcuts() {
    window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();
        if (key === 's') { e.preventDefault(); if (typeof saveReceiptLocally === 'function') saveReceiptLocally(); }
        else if (key === 'p') { e.preventDefault(); if (typeof triggerNativePrint === 'function') triggerNativePrint(); }
        else if (key === 'e') { e.preventDefault(); if (typeof downloadReceiptImage === 'function') downloadReceiptImage(); }
        else if (key === 'k' && !typing) { e.preventDefault(); if (typeof openHistoryModal === 'function') openHistoryModal(); }
    });
}

/* ---------- PWA install / service worker ---------- */
function initPWA() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    applyNightMode(localStorage.getItem('alssaedy_night') === 'on');
    maybeRestoreDraft();
    initShortcuts();
    initPWA();

    const receiptArea = document.getElementById('receiptPrintArea');
    if (receiptArea) {
        receiptArea.addEventListener('input', saveDraft, { passive: true });
        receiptArea.addEventListener('click', (e) => {
            if (e.target.closest('.custom-check-item')) saveDraft();
        });
    }
});
