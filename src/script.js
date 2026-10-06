// ALSSAEDY RECEIPT - CONTROLLER V4.0
const STORAGE_KEY = 'alssaedy_receipt_state_v4';
let isEditing = false;

function localISODate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function getState() {
    const inputs = {};
    document.querySelectorAll('.live-input').forEach((el) => {
        if (el.id) inputs[el.id] = el.value;
    });
    const checks = Array.from(document.querySelectorAll('.check-interactive')).map((el) => ({
        name: el.name || '',
        value: el.value || '',
        checked: el.checked
    }));
    const texts = {};
    document.querySelectorAll('.editable').forEach((el) => {
        if (el.dataset.key) texts[el.dataset.key] = el.textContent;
    });
    return {
        version: 4,
        mode: document.body.dataset.mode || 'manual',
        size: document.body.dataset.size || 'a5',
        theme: document.body.dataset.theme || 'classic',
        inputs,
        checks,
        texts,
        logo: document.getElementById('clinicLogoImg')?.src || '',
        watermark: document.getElementById('watermarkLayer')?.style.backgroundImage || ''
    };
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
    } catch (error) {
        console.error('Unable to save receipt state:', error);
    }
}

function applySavedState() {
    let state;
    try {
        state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (error) {
        console.error('Unable to read saved receipt state:', error);
        return;
    }
    if (!state || state.version !== 4) return;

    if (state.mode) setMode(state.mode, false);
    if (state.size) setSize(state.size, false);
    if (state.theme) setTheme(state.theme, false);

    Object.entries(state.inputs || {}).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });

    const checks = document.querySelectorAll('.check-interactive');
    (state.checks || []).forEach((saved, index) => {
        if (checks[index]) checks[index].checked = Boolean(saved.checked);
    });

    Object.entries(state.texts || {}).forEach(([key, value]) => {
        const el = document.querySelector(`.editable[data-key="${CSS.escape(key)}"]`);
        if (el) el.textContent = value;
    });

    const logo = document.getElementById('clinicLogoImg');
    const watermark = document.getElementById('watermarkLayer');
    if (state.logo && logo) logo.src = state.logo;
    if (state.watermark && watermark) watermark.style.backgroundImage = state.watermark;
    calculateFinancials(false);
}

function setMode(mode, persist = true) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual').classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital').classList.toggle('active', mode === 'digital');
    if (mode === 'digital') {
        const dateInput = document.getElementById('digitalDate');
        if (dateInput && !dateInput.value) dateInput.value = localISODate();
    }
    if (persist) saveState();
}

function setSize(size, persist = true) {
    document.body.setAttribute('data-size', size);
    document.body.style.page = size === 'a5' ? 'receipt-a5' : size === 'a4' ? 'receipt-a4' : 'receipt-thermal';
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
    if (persist) saveState();
}

function setTheme(theme, persist = true) {
    document.body.setAttribute('data-theme', theme);
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach((button) => button.classList.toggle('active', button.dataset.theme === theme));
    if (persist) saveState();
}

function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.textContent = isEditing ? '💾 حفظ التعديلات' : '✏️ تعديل النصوص والشعار';
    btn.style.background = isEditing ? '#10b981' : '#f59e0b';
    document.querySelectorAll('.editable').forEach((el) => {
        el.setAttribute('contenteditable', isEditing ? 'true' : 'false');
        el.setAttribute('spellcheck', 'false');
    });
    if (!isEditing) saveState();
}

function triggerLogoUpload() {
    if (isEditing) document.getElementById('logoUploader').click();
}

function uploadLogo(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('clinicLogoImg').src = e.target.result;
        saveState();
    };
    reader.readAsDataURL(file);
}

function uploadBackground(event) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('watermarkLayer').style.backgroundImage = `url("${e.target.result}")`;
        saveState();
    };
    reader.readAsDataURL(file);
}

function calculateFinancials(persist = true) {
    const paid = Number.parseFloat(document.getElementById('digitalPaidAmount').value) || 0;
    const total = Number.parseFloat(document.getElementById('digitalTotal').value) || 0;
    document.getElementById('digitalPaidTable').value = paid;
    document.getElementById('digitalBalance').value = total - paid;
    if (persist) saveState();
}

function getPaymentMethod() {
    return document.querySelector('input[name="paymentMethod"]:checked')?.value || '';
}

function shareReceipt() {
    const clientName = document.getElementById('digitalClientName').value || 'العميل الكريم';
    const paidAmount = document.getElementById('digitalPaidAmount').value || '0';
    const totalAmount = document.getElementById('digitalTotal').value || '0';
    const balance = document.getElementById('digitalBalance').value || '0';
    const date = document.getElementById('digitalDate').value || localISODate();
    const receiptNo = document.getElementById('digitalReceiptNo').value || '---';
    const paymentMethod = getPaymentMethod();
    const paymentReference = document.getElementById('digitalPayRef').value || '---';
    const methodText = paymentMethod === 'cash' ? 'نقداً' : paymentMethod === 'wallet-bank' ? 'محفظة / بنك' : 'غير محددة';

    const msg = `*سند قبض مالي - ALSSAEDY CLINIC FOR DENTISTRY*
د/.صلاح الدين السعيدي
رقم السند: ${receiptNo}
التاريخ: ${date}
المريض: ${clientName}
------------------------------
المبلغ المدفوع: ${paidAmount} ريال يمني
إجمالي الحساب: ${totalAmount} ريال يمني
المتبقي: ${balance} ريال يمني
طريقة الدفع: ${methodText}
مرجع الدفع: ${paymentReference}
------------------------------
شكراً لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.
ريمة – كسمة – عزلة الضبارة
+967 716 339 366 | +967 739 550 138 | +967 775 956 520`;

    if (navigator.share) {
        navigator.share({ title: 'سند قبض - عيادة السعيدي', text: msg }).catch(() => {});
    } else {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-btn').forEach((button) => {
        button.addEventListener('click', () => setTheme(button.dataset.theme));
    });

    applySavedState();

    document.querySelectorAll('.live-input').forEach((el) => {
        el.addEventListener('input', () => {
            if (el.id === 'digitalPaidAmount' || el.id === 'digitalTotal') calculateFinancials(false);
            saveState();
        });
        el.addEventListener('change', saveState);
    });
    document.querySelectorAll('.check-interactive').forEach((el) => el.addEventListener('change', saveState));
    document.querySelectorAll('.editable').forEach((el) => {
        el.addEventListener('input', () => {
            if (isEditing) saveState();
        });
        el.addEventListener('paste', (event) => {
            event.preventDefault();
            const text = event.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    });

    if (!document.getElementById('digitalDate').value) document.getElementById('digitalDate').value = localISODate();
    setSize(document.body.dataset.size || 'a5', false);
    setTheme(document.body.dataset.theme || 'classic', false);
    saveState();
});
