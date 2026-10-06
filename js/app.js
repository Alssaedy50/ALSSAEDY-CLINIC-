const OFFICIAL_LOGO_URL = (window.OFFICIAL_LOGO_DATA) ? window.OFFICIAL_LOGO_DATA : document.getElementById('clinicLogoImg').src;

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
}

function setSize(size) {
    document.documentElement.setAttribute('data-size', size);
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeClassic').classList.toggle('active', theme === 'classic');
    document.getElementById('themeModern').classList.toggle('active', theme === 'modern');
    document.getElementById('themeMono').classList.toggle('active', theme === 'mono');
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('digDate').value = today;
}

function generateNextReceiptNo() {
    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    let nextNum = history.length + 1;
    document.getElementById('digReceiptNo').value = 'REC-' + String(nextNum).padStart(3, '0');
}

function clearReceiptInputs() {
    if (confirm('هل تريد تفريغ حقول السند الحالية؟')) {
        document.getElementById('digClientName').value = '';
        document.getElementById('digPaid').value = '';
        document.getElementById('digTotal').value = '';
        document.getElementById('digPaidTable').value = '';
        document.getElementById('digBalance').value = '';
        document.getElementById('digTafqeet').value = '';
        document.getElementById('digRef').value = '';
        document.getElementById('digTooth').value = '';
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
    document.getElementById('watermarkLayer').style.backgroundImage = `url('${url}')`;
}

function resetOfficialLogo() {
    localStorage.removeItem('alssaedy_custom_logo');
    applyLogo(OFFICIAL_LOGO_URL);
    alert('تمت استعادة الشعار الرسمي المعتمد للعيادة بنجاح.');
}

function toggleWatermark() {
    document.body.classList.toggle('hide-watermark');
}

let isEditing = false;
function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.innerText = isEditing ? '💾 حفظ التعديلات' : '✏️ تفعيل التعديل المباشر';
    btn.style.background = isEditing ? '#10b981' : '#f59e0b';

    const editables = document.querySelectorAll('.editable');
    editables.forEach(el => {
        el.setAttribute('contenteditable', isEditing ? 'true' : 'false');
    });

    if (!isEditing) {
        const data = {};
        editables.forEach(el => { data[el.dataset.key] = el.innerText; });
        localStorage.setItem('alssaedy_texts', JSON.stringify(data));
    }
}

function openShareModal() { document.getElementById('shareModal').classList.add('open'); }
function closeShareModal() { document.getElementById('shareModal').classList.remove('open'); }
function openHistoryModal() {
    renderHistory();
    document.getElementById('historyModal').classList.add('open');
}
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
        } catch(e){}
    }
    updateHistoryCount();
});
