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

function materializeReceiptControls(sourceReceipt, clonedReceipt, clonedDocument) {
    // Android WebView/html2canvas can render the form control chrome but omit the
    // live .value property. Convert visible controls into ordinary text elements
    // inside html2canvas's cloned document so the exported PNG contains the data.
    const sourceControls = Array.from(sourceReceipt.querySelectorAll('input, textarea, select'));
    const clonedControls = Array.from(clonedReceipt.querySelectorAll('input, textarea, select'));

    clonedControls.forEach((control, index) => {
        const source = sourceControls[index];
        if (!source) return;

        const type = String(source.getAttribute('type') || '').toLowerCase();
        const computed = window.getComputedStyle(source);
        if (type === 'hidden' || source.id === 'hiddenDatePicker' ||
            computed.display === 'none' || computed.visibility === 'hidden' ||
            Number(computed.opacity) === 0) {
            return;
        }

        let value = '';
        if (source.tagName === 'SELECT') {
            value = source.options[source.selectedIndex]?.textContent || '';
        } else {
            value = source.value ?? '';
        }

        const span = clonedDocument.createElement('span');
        span.className = control.className + ' export-field-value';
        span.textContent = String(value);
        if (control.id) span.id = control.id + '-export';
        if (control.getAttribute('dir')) span.setAttribute('dir', control.getAttribute('dir'));

        // Preserve the sizing/layout classes from the original input.
        // These inline rules only normalize the replacement from form-control
        // semantics to a normal text node; the existing project CSS remains
        // responsible for fonts, colors, borders and widths.
        span.style.display = 'inline-block';
        span.style.boxSizing = 'border-box';
        span.style.whiteSpace = 'pre-wrap';
        span.style.overflowWrap = 'anywhere';
        span.style.verticalAlign = 'middle';
        span.style.minHeight = '15px';

        control.replaceWith(span);
    });
}

async function generateReceiptCanvas() {
    ensureLibraries();
    await document.fonts.ready;

    const receipt = document.getElementById('receiptPrintArea');
    if (!receipt) throw new Error('منطقة السند غير موجودة.');

    const profile = getSizeProfile();
    const exportBox = getExportBox(profile);
    document.documentElement.style.setProperty('--export-width', exportBox.width);
    document.documentElement.style.setProperty('--export-height', exportBox.height);

    return withCaptureState(() => {
        document.body.classList.add('exporting-receipt');

        const captureWidth = Math.max(
            document.documentElement.clientWidth || 0,
            receipt.scrollWidth || 0,
            receipt.offsetWidth || 0
        );
        const captureHeight = Math.max(
            document.documentElement.clientHeight || 0,
            receipt.scrollHeight || 0,
            receipt.offsetHeight || 0
        );

        return html2canvas(receipt, {
            scale: 4,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            letterRendering: true,
            imageTimeout: 15000,
            windowWidth: captureWidth,
            windowHeight: captureHeight,
            onclone: (clonedDocument) => {
                const clonedReceipt = clonedDocument.getElementById('receiptPrintArea');
                if (!clonedReceipt) return;
                materializeReceiptControls(receipt, clonedReceipt, clonedDocument);
            }
        });
    }).finally(() => document.body.classList.remove('exporting-receipt'));
}

async function downloadReceiptPDF() {
    // Native print is the authoritative PDF path: text stays sharp instead of becoming a raster screenshot.
    try {
        await document.fonts.ready;
        const oldTitle=document.title;
        const recNo=document.getElementById('digReceiptNo')?.value||'سند';
        document.title='سند_قبض_'+recNo;
        injectPrintPageStyle();
        alert('سيتم فتح نافذة الطباعة. اختر «حفظ كملف PDF» ثم احفظ السند بالمقاس الظاهر.');
        setTimeout(()=>window.print(),120);
        window.addEventListener('afterprint',()=>{
            document.title=oldTitle;
            const style=document.getElementById('dynamic-print-size');
            if(style)style.remove();
        },{once:true});
    }catch(err){alert('تعذر تجهيز ملف PDF للطباعة: '+err.message);}
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

function normalizeWhatsAppNumber(value) {
    const digits = String(value || '')
        .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('00967')) return digits.slice(2);
    if (digits.startsWith('967') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return '967' + digits.slice(1);
    if (digits.startsWith('7') && digits.length === 9) return '967' + digits;
    return '';
}

function formatReceiptDate(value) {
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? m[3] + '/' + m[2] + '/' + m[1] + ' م' : String(value || '');
}

function bidiIsolate(value) {
    return '\u2068' + String(value ?? '') + '\u2069';
}

function getReceiptText() {
    const name = document.getElementById('digClientName')?.value || 'المريض الكريم';
    const patientPhoneRaw = document.getElementById('digPatientPhone')?.value || '';
    const patientPhone = patientPhoneRaw.trim();
    const paid = document.getElementById('digPaid')?.value || '0';
    const total = document.getElementById('digTotal')?.value || '0';
    const balance = document.getElementById('digBalance')?.value || '0';
    const change = Math.max(0, Number(paid) - Number(total));
    const dateRaw = document.getElementById('digDate')?.value || getLocalDateISO();
    const date = formatReceiptDate(dateRaw);
    const recNo = document.getElementById('digReceiptNo')?.value || '---';
    const method = document.getElementById('selectedPayMethod')?.value || 'غير محددة';
    const ref = document.getElementById('digRef')?.value || '';
    const services = Array.from(document.querySelectorAll('.custom-check-item.active'))
        .map(item => item.innerText.replace('✓','').trim());
    const srvText = services.length ? 'الخدمات: ' + services.join('، ') : '';
    const refText = ref ? '\nالمرجع: ' + bidiIsolate(ref) : '';
    const patientPhoneText = patientPhone ? '\nرقم الهاتف: ' + bidiIsolate(patientPhone) : '';
    const changeText = change > 0 ? '\nالزيادة/المبلغ المستحق للمريض: ' + bidiIsolate(change) + ' ريال يمني' : '';
    const clinicPhones = [
        '+967 716 339 366',
        '+967 739 550 138',
        '+967 775 956 520'
    ].map(bidiIsolate).join(' • ');
    return '*سند قبض مالي - عيادة الدكتور صلاح الدين السعيدي*\n' +
        'رقم السند: ' + bidiIsolate(recNo) + '\n' +
        'التاريخ: ' + bidiIsolate(date) + '\n' +
        'المريض: ' + name + patientPhoneText + '\n' +
        srvText + (srvText ? '\n' : '') +
        'طريقة الدفع: ' + method + refText + '\n' +
        '-----------------------------\n' +
        'المبلغ المدفوع: ' + bidiIsolate(paid) + ' ريال يمني\n' +
        'إجمالي الحساب: ' + bidiIsolate(total) + ' ريال يمني\n' +
        'المتبقي: ' + bidiIsolate(balance) + ' ريال يمني' + changeText + '\n' +
        '-----------------------------\n' +
        'شاكرين ثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.\n' +
        'ريمة – كسمة – عزلة الضبارة\n' +
        'هاتف العيادة: ' + clinicPhones;
}

function shareWhatsAppText() {
    closeShareModal();
    window.open('https://wa.me/?text=' + encodeURIComponent(getReceiptText()), '_blank', 'noopener,noreferrer');
}

function sharePatientWhatsApp() {
    const raw = document.getElementById('digPatientPhone')?.value || '';
    const phone = normalizeWhatsAppNumber(raw);
    if (!phone) {
        alert('أدخل رقم المريض بصيغة يمنية صحيحة (مثال: 77XXXXXXXX أو +967 77XXXXXXX) أولاً.');
        return;
    }
    closeShareModal();
    const url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(getReceiptText());
    const popup = window.open(url, '_blank', 'noopener,noreferrer');
    if (!popup) window.location.href = url;
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
                setTimeout(() => {
                    if (normalizeWhatsAppNumber(document.getElementById('digPatientPhone')?.value || '')) {
                        sharePatientWhatsApp();
                    } else {
                        shareWhatsAppText();
                    }
                }, 1000);
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