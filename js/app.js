const OFFICIAL_LOGO_URL = (window.OFFICIAL_LOGO_DATA) ? window.OFFICIAL_LOGO_DATA : document.getElementById('clinicLogoImg').src;

const SIZE_PROFILES = {
    a5: { label: 'A5', width: '148mm', height: '210mm', pdfFormat: 'a5', orientation: 'portrait', printSize: '148mm 210mm' },
    a4: { label: 'A4', width: '210mm', height: '297mm', pdfFormat: 'a4', orientation: 'portrait', printSize: '210mm 297mm' },
    thermal: { label: '80mm', width: '80mm', height: 'auto', pdfFormat: [80, 240], orientation: 'portrait', printSize: '80mm auto' }
};

function getSelectedSize() {
    return document.documentElement.getAttribute('data-size') || 'a5';
}

function getSizeProfile() {
    return SIZE_PROFILES[getSelectedSize()] || SIZE_PROFILES.a5;
}

function toggleDrawer(open) {
    document.getElementById('settingsPanel').classList.toggle('open', open);
}

function setMode(mode) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual').classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital').classList.toggle('active', mode === 'digital');
    if (mode === 'digital') {
        if (!document.getElementById('digDate').value) setTodayDate();
        if (!document.getElementById('digReceiptNo').value) generateNextReceiptNo();
    }
    updateActionAvailability();
}

function setSize(size) {
    if (!SIZE_PROFILES[size]) return;
    document.documentElement.setAttribute('data-size', size);
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
    localStorage.setItem('alssaedy_receipt_size', size);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeClassic').classList.toggle('active', theme === 'classic');
    document.getElementById('themeModern').classList.toggle('active', theme === 'modern');
    document.getElementById('themeMono').classList.toggle('active', theme === 'mono');
    localStorage.setItem('alssaedy_theme', theme);
}

function getLocalDateISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function setTodayDate() {
    document.getElementById('digDate').value = getLocalDateISO();
}

function generateNextReceiptNo() {
    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    const storedNext = parseInt(localStorage.getItem('alssaedy_next_receipt_number') || '1', 10);
    const maxExisting = history.reduce((max, item) => {
        const match = String(item.recNo || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextNum = Math.max(storedNext, maxExisting + 1);
    document.getElementById('digReceiptNo').value = 'REC-' + String(nextNum).padStart(3, '0');
    localStorage.setItem('alssaedy_next_receipt_number', String(nextNum + 1));
}

function clearReceiptInputs() {
    if (confirm('هل تريد تفريغ حقول السند الحالية؟')) {
        ['digReceiptNo','digClientName','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digTooth'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        setPayMethod('نقداً');
        document.querySelectorAll('.custom-check-item').forEach(el => el.classList.remove('active'));
    }
}

function setPayMethod(method) {
    document.getElementById('selectedPayMethod').value = method;
    document.getElementById('optCash').classList.toggle('active', method === 'نقداً');
    document.getElementById('optBank').classList.toggle('active', method !== 'نقداً');
}

function toggleService(element) {
    element.classList.toggle('active');
}

function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            applyLogo(e.target.result);
            localStorage.setItem('alssaedy_custom_logo', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function applyLogo(url) {
    document.getElementById('clinicLogoImg').src = url;
    document.getElementById('watermarkLayer').style.backgroundImage = "url('" + url + "')";
}

function resetOfficialLogo() {
    localStorage.removeItem('alssaedy_custom_logo');
    applyLogo(OFFICIAL_LOGO_URL);
    alert('تمت استعادة الشعار الرسمي المعتمد للعيادة بنجاح.');
}

function toggleWatermark() {
    document.body.classList.toggle('hide-watermark');
    localStorage.setItem('alssaedy_watermark', document.body.classList.contains('hide-watermark') ? 'off' : 'on');
}

let isEditing = false;
function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.innerText = isEditing ? '💾 حفظ التعديلات' : '✏️ تفعيل التعديل المباشر';
    btn.style.background = isEditing ? '#10b981' : '#f59e0b';
    document.querySelectorAll('.editable').forEach(el => {
        el.setAttribute('contenteditable', isEditing ? 'true' : 'false');
    });
    if (!isEditing) {
        const data = {};
        document.querySelectorAll('.editable').forEach(el => { data[el.dataset.key] = el.innerText.trim(); });
        localStorage.setItem('alssaedy_texts', JSON.stringify(data));
    }
}

function updateActionAvailability() {
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.disabled = document.body.getAttribute('data-mode') === 'manual';
        saveBtn.title = saveBtn.disabled ? 'الحفظ متاح للسند الرقمي فقط' : 'حفظ بالسجل';
    }
}

function openShareModal() { document.getElementById('shareModal').classList.add('open'); }
function closeShareModal() { document.getElementById('shareModal').classList.remove('open'); }
function openHistoryModal() { renderHistory(); document.getElementById('historyModal').classList.add('open'); }
function closeHistoryModal() { document.getElementById('historyModal').classList.remove('open'); }

window.addEventListener('DOMContentLoaded', () => {
    const customLogo = localStorage.getItem('alssaedy_custom_logo');
    applyLogo(customLogo || OFFICIAL_LOGO_URL);

    const savedTexts = localStorage.getItem('alssaedy_texts');
    if (savedTexts) {
        try {
            const data = JSON.parse(savedTexts);
            document.querySelectorAll('.editable').forEach(el => {
                if (data[el.dataset.key]) el.innerText = data[el.dataset.key];
            });
        } catch(e) {}
    }

    const savedSize = localStorage.getItem('alssaedy_receipt_size');
    setSize(SIZE_PROFILES[savedSize] ? savedSize : 'a5');
    const savedTheme = localStorage.getItem('alssaedy_theme');
    if (savedTheme) setTheme(savedTheme);
    if (localStorage.getItem('alssaedy_watermark') === 'off') document.body.classList.add('hide-watermark');

    updateHistoryCount();
    updateActionAvailability();
});