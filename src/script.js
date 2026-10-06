function setMode(mode) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual').classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital').classList.toggle('active', mode === 'digital');
    
    if (mode === 'digital' && !document.getElementById('digDate').value) {
        document.getElementById('digDate').value = new Date().toISOString().split('T')[0];
    }
}

function calculateLedger() {
    const paid = parseFloat(document.getElementById('digPaid').value) || 0;
    const total = parseFloat(document.getElementById('digTotal').value) || 0;
    
    document.getElementById('digPaidTable').value = paid;
    document.getElementById('digBalance').value = Math.max(0, total - paid);
}

function shareWhatsApp() {
    const name = document.getElementById('digClientName').value || 'العميل الكريم';
    const paid = document.getElementById('digPaid').value || '0';
    const total = document.getElementById('digTotal').value || '0';
    const balance = document.getElementById('digBalance').value || '0';
    const date = document.getElementById('digDate').value || new Date().toISOString().split('T')[0];
    const recNo = document.getElementById('digReceiptNo').value || '---';

    const text = `*سند قبض مالي - عيادة الدكتور صلاح الدين السعيدي*
رقم السند: ${recNo}
التاريخ: ${date}
المريض: ${name}
-----------------------------
المبلغ المدفوع: ${paid} ريال يمني
إجمالي الحساب: ${total} ريال يمني
المتبقي: ${balance} ريال يمني
-----------------------------
ريمة - كسمة - عزلة الضبارة
+967 716 339 366`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
