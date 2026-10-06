function getExportBox(profile) {
    // Keep a precise 2mm printable safety margin while filling the selected paper.
    if (profile.pdfFormat === 'a5') return { width: '144mm', height: '206mm' };
    if (profile.pdfFormat === 'a4') return { width: '206mm', height: '293mm' };
    if (Array.isArray(profile.pdfFormat)) return { width: '76mm', height: 'auto' };
    return { width: profile.width, height: profile.height === 'auto' ? 'auto' : profile.height };
}

function ensureLibraries() {
    if (typeof html2canvas !== 'function') throw new Error('مكتبة إنشاء الصور غير متاحة. تحقق من الاتصال بالإنترنت.');
}

function withCaptureState(callback) {
    document.body.classList.add('is-capturing');
    return Promise.resolve(callback()).finally(() => document.body.classList.remove('is-capturing'));
}

async function generateReceiptCanvas() {
    ensureLibraries();
    await document.fonts.ready;
    const receipt = document.getElementById('receiptPrintArea');
    const profile = getSizeProfile();
    document.documentElement.style.setProperty('--export-width', profile.width);
    document.documentElement.style.setProperty('--export-height', profile.height === 'auto' ? 'auto' : profile.height);
    return withCaptureState(() => {
        document.body.classList.add('exporting-receipt');
        return html2canvas(receipt, {
            scale: 4,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            imageTimeout: 15000
        });
    }).finally(() => document.body.classList.remove('exporting-receipt'));
}

async function downloadReceiptPDF() {
    try {
        if (typeof html2pdf !== 'function') throw new Error('مكتبة PDF غير متاحة. تحقق من الاتصال بالإنترنت.');
        const profile = getSizeProfile();
        const receipt = document.getElementById('receiptPrintArea');
        const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
        await document.fonts.ready;
        document.body.classList.add('is-capturing');
        document.body.classList.add('exporting-receipt');
        const exportBox = getExportBox(profile);
        document.documentElement.style.setProperty('--export-width', exportBox.width);
        document.documentElement.style.setProperty('--export-height', exportBox.height);
        const options = {
            margin: profile.pdfFormat === 'a5' ? 0 : 0,
            filename: 'سند_قبض_' + recNo + '.pdf',
            image: { type: 'png' },
            html2canvas: { scale: 4, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', imageTimeout: 15000 },
            jsPDF: { unit: 'mm', format: profile.pdfFormat, orientation: profile.orientation }
        };
        await html2pdf().set(options).from(receipt).save();
    } catch (err) {
        alert('حدث خطأ أثناء تنزيل ملف PDF: ' + err.message);
    } finally {
        document.body.classList.remove('is-capturing');
        document.body.classList.remove('exporting-receipt');
    }
}

function injectPrintPageStyle() {
    const old = document.getElementById('dynamic-print-size');
    if (old) old.remove();
    const profile = getSizeProfile();
    const style = document.createElement('style');
    style.id = 'dynamic-print-size';
    style.textContent = '@page { size: ' + profile.printSize + '; margin: 0 !important; }';
    document.head.appendChild(style);
}

function triggerNativePrint() {
    injectPrintPageStyle();
    window.focus();
    setTimeout(() => window.print(), 100);
    window.addEventListener('afterprint', () => {
        const style = document.getElementById('dynamic-print-size');
        if (style) style.remove();
    }, { once: true });
}

function getReceiptText() {
    const name = document.getElementById('digClientName').value || 'المريض الكريم';
    const paid = document.getElementById('digPaid').value || '0';
    const total = document.getElementById('digTotal').value || '0';
    const balance = document.getElementById('digBalance').value || '0';
    const change = Math.max(0, Number(paid) - Number(total));
    const date = document.getElementById('digDate').value || getLocalDateISO();
    const recNo = document.getElementById('digReceiptNo').value || '---';
    const method = document.getElementById('selectedPayMethod').value || 'نقداً';
    const ref = document.getElementById('digRef').value || '';
    const services = Array.from(document.querySelectorAll('.custom-check-item.active')).map(item => item.innerText.replace('✓','').trim());
    const srvText = services.length ? 'الخدمات: ' + services.join('، ') : '';
    const refText = ref ? '\nالمرجع: ' + ref : '';
    const changeText = change > 0 ? '\nالزيادة/المبلغ المستحق للمريض: ' + change + ' ريال يمني' : '';
    return '*سند قبض مالي - عيادة الدكتور صلاح الدين السعيدي*\nرقم السند: ' + recNo + '\nالتاريخ: ' + date + '\nالمريض: ' + name + '\n' + srvText + '\nطريقة الدفع: ' + method + refText + '\n-----------------------------\nالمبلغ المدفوع: ' + paid + ' ريال يمني\nإجمالي الحساب: ' + total + ' ريال يمني\nالمتبقي: ' + balance + ' ريال يمني' + changeText + '\n-----------------------------\nشكراً لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.\nريمة - كسمة - عزلة الضبارة\n+967 716 339 366';
}

function shareWhatsAppText() {
    closeShareModal();
    window.open('https://wa.me/?text=' + encodeURIComponent(getReceiptText()), '_blank', 'noopener,noreferrer');
}

async function shareReceiptImage() {
    closeShareModal();
    try {
        const canvas = await generateReceiptCanvas();
        canvas.toBlob(async blob => {
            if (!blob) return shareWhatsAppText();
            const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
            const file = new File([blob], 'سند_قبض_' + recNo + '.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'سند قبض مالي', text: getReceiptText() });
            } else {
                downloadReceiptImage();
                setTimeout(shareWhatsAppText, 1000);
            }
        }, 'image/png', 0.95);
    } catch(e) {
        shareWhatsAppText();
    }
}

async function downloadReceiptImage() {
    try {
        const canvas = await generateReceiptCanvas();
        const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
        const link = document.createElement('a');
        link.download = 'سند_قبض_' + recNo + '.png';
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();
    } catch(e) {
        alert('تعذر إنشاء الصورة: ' + e.message);
    }
}

function copyReceiptText() {
    closeShareModal();
    const text = getReceiptText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert('تم نسخ بيانات السند إلى الحافظة بنجاح.')).catch(() => alert(text));
    } else alert(text);
}