function toggleDrawer(open) {
    document.getElementById('settingsPanel').classList.toggle('open', open);
}

function setMode(mode) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual').classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital').classList.toggle('active', mode === 'digital');
    
    if (mode === 'digital' && !document.getElementById('digDate').value) {
        document.getElementById('digDate').value = new Date().toISOString().split('T')[0];
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

function setFont(fontFamily) {
    document.body.style.fontFamily = fontFamily;
}

let currentScale = 100;
function adjustFontSize(delta) {
    currentScale = Math.max(85, Math.min(125, currentScale + (delta * 5)));
    document.documentElement.style.setProperty('--font-scale', currentScale / 100);
    document.getElementById('fontScaleLabel').innerText = currentScale + '%';
}

function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('clinicLogoImg').src = e.target.result;
            localStorage.setItem('alssaedy_logo', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function uploadBg(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('watermarkLayer').style.backgroundImage = `url('${e.target.result}')`;
            localStorage.setItem('alssaedy_bg', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

let isEditing = false;
function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.innerText = isEditing ? '💾 حفظ التعديلات' : '✏️ تعديل النصوص مباشرة';
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

window.addEventListener('DOMContentLoaded', () => {
    const savedTexts = localStorage.getItem('alssaedy_texts');
    if (savedTexts) {
        try {
            const data = JSON.parse(savedTexts);
            document.querySelectorAll('.editable').forEach(el => {
                if (data[el.dataset.key]) el.innerText = data[el.dataset.key];
            });
        } catch(e){}
    }
    const savedLogo = localStorage.getItem('alssaedy_logo');
    if (savedLogo) document.getElementById('clinicLogoImg').src = savedLogo;
    const savedBg = localStorage.getItem('alssaedy_bg');
    if (savedBg) document.getElementById('watermarkLayer').style.backgroundImage = `url('${savedBg}')`;
});

function calculateLedger() {
    const paid = parseFloat(document.getElementById('digPaid').value) || 0;
    const total = parseFloat(document.getElementById('digTotal').value) || 0;
    document.getElementById('digPaidTable').value = paid;
    document.getElementById('digBalance').value = Math.max(0, total - paid);
}

function openShareModal() { document.getElementById('shareModal').classList.add('open'); }
function closeShareModal() { document.getElementById('shareModal').classList.remove('open'); }

function getReceiptText() {
    const name = document.getElementById('digClientName').value || 'العميل الكريم';
    const paid = document.getElementById('digPaid').value || '0';
    const total = document.getElementById('digTotal').value || '0';
    const balance = document.getElementById('digBalance').value || '0';
    const date = document.getElementById('digDate').value || new Date().toISOString().split('T')[0];
    const recNo = document.getElementById('digReceiptNo').value || '---';

    return `*سند قبض مالي - عيادة الدكتور صلاح الدين السعيدي*
رقم السند: ${recNo}
التاريخ: ${date}
المريض: ${name}
-----------------------------
المبلغ المدفوع: ${paid} ريال يمني
إجمالي الحساب: ${total} ريال يمني
المتبقي: ${balance} ريال يمني
-----------------------------
شكراً لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.
ريمة - كسمة - عزلة الضبارة
+967 716 339 366`;
}

function shareWhatsApp() {
    closeShareModal();
    const text = getReceiptText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyReceiptText() {
    closeShareModal();
    const text = getReceiptText();
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ بيانات السند بنجاح!');
    }).catch(() => {
        alert(text);
    });
}
