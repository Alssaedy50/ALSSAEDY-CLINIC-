async function downloadReceiptPDF() {
    const receipt = document.getElementById('receiptPrintArea');
    const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
    
    document.body.classList.add('is-capturing');
    await document.fonts.ready;

    const opt = {
        margin: [4, 4, 4, 4],
        filename: `سند_قبض_${recNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.8, useCORS: true, letterRendering: false },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(receipt).save().then(() => {
        document.body.classList.remove('is-capturing');
    }).catch(err => {
        document.body.classList.remove('is-capturing');
        alert('حدث خطأ أثناء تنزيل ملف PDF: ' + err.message);
    });
}

function triggerNativePrint() {
    window.focus();
    setTimeout(() => { window.print(); }, 150);
}

async function generateReceiptCanvas() {
    document.body.classList.add('is-capturing');
    await document.fonts.ready;
    const receipt = document.getElementById('receiptPrintArea');
    
    const canvas = await html2canvas(receipt, {
        scale: 2.8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: false
    });
    
    document.body.classList.remove('is-capturing');
    return canvas;
}

async function downloadReceiptImage() {
    try {
        const canvas = await generateReceiptCanvas();
        const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
        const link = document.createElement('a');
        link.download = `سند_قبض_${recNo}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();
    } catch(e) {
        alert('تعذر إنشاء الصورة: ' + e.message);
    }
}

function getReceiptText() {
    const name = document.getElementById('digClientName').value || 'المريض الكريم';
    const paid = document.getElementById('digPaid').value || '0';
    const total = document.getElementById('digTotal').value || '0';
    const balance = document.getElementById('digBalance').value || '0';
    const date = document.getElementById('digDate').value || new Date().toISOString().split('T')[0];
    const recNo = document.getElementById('digReceiptNo').value || '---';

    let selectedServices = [];
    document.querySelectorAll('.custom-check-item.active').forEach(item => {
        selectedServices.push(item.innerText.replace('✓', '').trim());
    });
    let srvText = selectedServices.length ? `الخدمات: ${selectedServices.join('، ')}` : '';

    return `*سند قبض مالي - عيادة الدكتور صلاح الدين السعيدي*
رقم السند: ${recNo}
التاريخ: ${date}
المريض: ${name}
${srvText}
-----------------------------
المبلغ المدفوع: ${paid} ريال يمني
إجمالي الحساب: ${total} ريال يمني
المتبقي: ${balance} ريال يمني
-----------------------------
شكراً لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.
ريمة - كسمة - عزلة الضبارة
+967 716 339 366`;
}

function shareWhatsAppText() {
    closeShareModal();
    const text = getReceiptText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

async function shareReceiptImage() {
    closeShareModal();
    try {
        const canvas = await generateReceiptCanvas();
        canvas.toBlob(async (blob) => {
            if (!blob) return shareWhatsAppText();
            const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
            const file = new File([blob], `سند_قبض_${recNo}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'سند قبض مالي',
                    text: getReceiptText()
                });
            } else {
                downloadReceiptImage();
                setTimeout(shareWhatsAppText, 1000);
            }
        }, 'image/png', 0.95);
    } catch(e) {
        shareWhatsAppText();
    }
}

function copyReceiptText() {
    closeShareModal();
    const text = getReceiptText();
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ بيانات السند إلى الحافظة بنجاح.');
    }).catch(() => { alert(text); });
}
