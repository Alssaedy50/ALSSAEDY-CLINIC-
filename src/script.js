// ALSSAEDY RECEIPT - CONTROLLER V3.0

// تبديل النمط: ورقي يدوي للمطابع أم إلكتروني تفاعلي
function setMode(mode) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual').classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital').classList.toggle('active', mode === 'digital');
    
    // إذا كان إلكتروني، نضع تاريخ اليوم تلقائياً
    if (mode === 'digital' && !document.getElementById('digitalDate').value) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('digitalDate').value = today;
    }
}

// تبديل المقاس ديناميكياً بدون تداخل
function setSize(size) {
    document.body.setAttribute('data-size', size);
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
}

// تبديل المظهر والألوان
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
}

// تفعيل وضع تعديل النصوص المباشر
let isEditing = false;
function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.innerHTML = isEditing ? '💾 حفظ التعديلات' : '✏️ تعديل النصوص والشعار';
    btn.style.background = isEditing ? '#10b981' : '#f59e0b';

    const editables = document.querySelectorAll('.editable');
    editables.forEach(el => {
        el.setAttribute('contenteditable', isEditing ? 'true' : 'false');
    });

    if (!isEditing) {
        // حفظ النصوص محلياً
        const dataToSave = {};
        editables.forEach(el => {
            dataToSave[el.dataset.key] = el.innerText;
        });
        localStorage.setItem('alssaedy_receipt_texts', JSON.stringify(dataToSave));
    }
}

// استعادة النصوص المحفوظة محلياً عند التحميل
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('alssaedy_receipt_texts');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            document.querySelectorAll('.editable').forEach(el => {
                if (parsed[el.dataset.key]) el.innerText = parsed[el.dataset.key];
            });
        } catch (e) {
            console.error('Error loading saved texts', e);
        }
    }

    const savedLogo = localStorage.getItem('alssaedy_clinic_logo');
    if (savedLogo) {
        document.getElementById('clinicLogoImg').src = savedLogo;
    }
});

// رفع وتغيير الشعار
function triggerLogoUpload() {
    if (isEditing) {
        document.getElementById('logoUploader').click();
    }
}

function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('clinicLogoImg').src = e.target.result;
            localStorage.setItem('alssaedy_clinic_logo', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// رفع خلفية أو علامة مائية
function uploadBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('watermarkLayer').style.backgroundImage = `url('${e.target.result}')`;
        };
        reader.readAsDataURL(file);
    }
}

// الحساب المالي التلقائي في السند الرقمي
function calculateFinancials() {
    const paid = parseFloat(document.getElementById('digitalPaidAmount').value) || 0;
    const total = parseFloat(document.getElementById('digitalTotal').value) || 0;
    
    document.getElementById('digitalPaidTable').value = paid;
    const balance = Math.max(0, total - paid);
    document.getElementById('digitalBalance').value = balance;
}

// مشاركة السند عبر واتساب أو النظام المدمج
function shareReceipt() {
    const clientName = document.getElementById('digitalClientName').value || 'العميل الكريم';
    const paidAmount = document.getElementById('digitalPaidAmount').value || '0';
    const totalAmount = document.getElementById('digitalTotal').value || '0';
    const balance = document.getElementById('digitalBalance').value || '0';
    const date = document.getElementById('digitalDate').value || new Date().toISOString().split('T')[0];
    const receiptNo = document.getElementById('digitalReceiptNo').value || '---';

    const msg = `*سند قبض مالي - عيادة الدكتور صلاح الدين السعيدي*
رقم السند: ${receiptNo}
التاريخ: ${date}
المريض: ${clientName}
------------------------------
المبلغ المدفوع: ${paidAmount} ريال يمني
إجمالي الحساب: ${totalAmount} ريال يمني
المتبقي: ${balance} ريال يمني
------------------------------
شكراً لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.
ريمة - كسمة - عزلة الضبارة
+967 716 339 366`;

    if (navigator.share) {
        navigator.share({
            title: 'سند قبض - عيادة السعيدي',
            text: msg
        }).catch(() => {});
    } else {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    }
}
