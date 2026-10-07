function getExportBox(profile) {
    // Export must use the same physical sheet dimensions as print CSS.
    // Do not introduce an artificial safety margin here: the receipt itself
    // already owns its internal padding.
    return { width: profile.width, height: profile.height === 'auto' ? 'auto' : profile.height };
}

function getPdfPageSizeMm(profile, canvas) {
    if (profile.pdfFormat === 'a4') return { w: 210, h: 297, format: 'a4' };
    if (Array.isArray(profile.pdfFormat)) {
        const w = Number(profile.pdfFormat[0]) || 80;
        const h = canvas && canvas.width ? w * (canvas.height / canvas.width) : (Number(profile.pdfFormat[1]) || 240);
        return { w, h: Math.max(40, h), format: null };
    }
    return { w: 148, h: 210, format: 'a5' };
}

let __jspdfLoadingPromise = null;
function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (__jspdfLoadingPromise) return __jspdfLoadingPromise;
    __jspdfLoadingPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-jspdf-retry]');
        if (existing) {
            existing.addEventListener('load', () => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF غير متاح.')), { once: true });
            existing.addEventListener('error', () => reject(new Error('تعذر تحميل مكتبة PDF.')), { once: true });
            setTimeout(() => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF غير متاح.')), 3000);
            return;
        }
        const script = document.createElement('script');
        script.src = 'vendor/jspdf/jspdf.umd.min.js?v=1.1.0';
        script.dataset.jspdfRetry = '1';
        script.onload = () => window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF غير متاح.'));
        script.onerror = () => reject(new Error('تعذر تحميل مكتبة PDF.'));
        document.head.appendChild(script);
    });
    return __jspdfLoadingPromise;
}

async function ensureLibraries() {
    if (typeof html2canvas === 'function') return;
    // Android/local deployments can occasionally finish parsing before the vendor
    // script is available. Retry the bundled local library instead of showing
    // the misleading "image tool unavailable" message.
    await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-html2canvas-retry]');
        if (existing) {
            existing.addEventListener('load', resolve, {once:true});
            existing.addEventListener('error', () => reject(new Error('تعذر تحميل مكتبة إنشاء الصور المحلية.')), {once:true});
            setTimeout(() => typeof html2canvas === 'function' ? resolve() : reject(new Error('مكتبة إنشاء الصور المحلية غير متاحة.')), 3000);
            return;
        }
        const script = document.createElement('script');
        script.src = 'vendor/html2canvas/html2canvas.min.js';
        script.dataset.html2canvasRetry = '1';
        script.onload = () => typeof html2canvas === 'function' ? resolve() : reject(new Error('مكتبة إنشاء الصور المحلية غير متاحة.'));
        script.onerror = () => reject(new Error('تعذر تحميل مكتبة إنشاء الصور المحلية.'));
        document.head.appendChild(script);
    });
}

function withCaptureState(callback) {
    document.body.classList.add('is-capturing');
    return Promise.resolve(callback()).finally(() => document.body.classList.remove('is-capturing'));
}

function materializeReceiptDate(sourceReceipt, clonedReceipt) {
    // Blank/manual paper templates are deliberately date-free. The pre-printed
    // year marker is rendered by #paperDateYear; never copy the digital date into it.
    const isBlankTemplate =
        document.body.classList.contains('blank-template-export') ||
        document.body.getAttribute('data-mode') === 'manual';
    const source = sourceReceipt.querySelector('#digDate');
    const cloned = clonedReceipt.querySelector('#digDate');
    const clonedPrintDate = clonedReceipt.querySelector('#printDateValue');
    const clonedPaperYear = clonedReceipt.querySelector('#paperDateYear');

    if (isBlankTemplate) {
        if (cloned) {
            cloned.value = '';
            cloned.removeAttribute('value');
        }
        if (clonedPrintDate) clonedPrintDate.textContent = '';
        if (clonedPaperYear) {
            clonedPaperYear.innerHTML =
                '<span class="paper-year-digits" dir="ltr">202</span>' +
                '<span class="paper-year-era" dir="rtl">م</span>';
            clonedPaperYear.setAttribute('dir', 'rtl');
            clonedPaperYear.style.direction = 'rtl';
            clonedPaperYear.style.unicodeBidi = 'isolate';
        }
        return;
    }

    if (cloned) {
        const value = String(source?.value || '').trim();
        cloned.value = value;
        cloned.setAttribute('value', value);
    }
    // Mirror the human-readable date into the print-only element so the rendered
    // PNG/PDF shows "DD/MM/YYYY م" instead of the raw typed text.
    if (clonedPrintDate && typeof formatReceiptDate === 'function') {
        clonedPrintDate.textContent = formatReceiptDate(source?.value || '');
    }
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

async function generateReceiptCanvas(options = {}) {
    await ensureLibraries();
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
            scale: options.scale || 6,
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
                materializeReceiptDate(receipt, clonedReceipt);
                materializeReceiptControls(receipt, clonedReceipt, clonedDocument);
                const logo=clonedReceipt.querySelector('#clinicLogoImg'); if(logo){logo.style.opacity='1';logo.style.filter='none';}
            }
        });
    }).finally(() => document.body.classList.remove('exporting-receipt'));
}

function canvasToPngBlob(canvas) {
    return new Promise(resolve => {
        if (canvas.toBlob) canvas.toBlob(blob => resolve(blob), 'image/png');
        else {
            const dataUrl = canvas.toDataURL('image/png');
            const bin = atob(dataUrl.split(',')[1]);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            resolve(new Blob([arr], { type: 'image/png' }));
        }
    });
}

// Renders the live receipt to a correctly sized, single-page, text-crisp PDF
// without any print dialog. Works on desktop and inside the Android WebView.
async function buildReceiptPdfBlob() {
    const jsPDF = await ensureJsPdf();
    const canvas = await generateReceiptCanvas({ fullPage: true, scale: 3 });
    const profile = getSizeProfile();
    const page = getPdfPageSizeMm(profile, canvas);
    // PNG avoids JPEG ringing around Arabic text and thin borders.
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: page.format || [page.w, page.h],
        compress: true
    });
    doc.addImage(imgData, 'PNG', 0, 0, page.w, page.h, undefined, 'FAST');
    return doc.output('blob');
}

async function downloadReceiptPDF() {
    try {
        const recNo = (document.getElementById('digReceiptNo')?.value || 'سند').trim();
        if (window.Android && typeof Android.savePdf === 'function') {
            // Native path: rasterize the exact sheet into a real PDF file.
            const blob = await buildReceiptPdfBlob();
            const reader = await blobToDataUrl(blob);
            Android.savePdfFromData(reader, 'سند_قبض_' + recNo);
            return;
        }
        const blob = await buildReceiptPdfBlob();
        downloadBlob(blob, 'سند_قبض_' + recNo + '.pdf');
        if (typeof toast === 'function') toast('تم إنشاء ملف PDF بالمقاس المحدد وتنزيله.'); else alert('تم إنشاء ملف PDF وتنزيله.');
    } catch (err) {
        // Fallback: browser native print-to-PDF never fails silently.
        try {
            const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
            const oldTitle = document.title;
            document.title = 'سند_قبض_' + recNo;
            injectPrintPageStyle();
            window.addEventListener('afterprint', () => { document.title = oldTitle; document.getElementById('dynamic-print-size')?.remove(); }, { once: true });
            setTimeout(() => window.print(), 150);
        } catch (e2) {
            alert('تعذر إنشاء PDF: ' + err.message);
        }
    }
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---- print preview ---- */
async function openPreviewModal() {
    const modal = document.getElementById('previewModal');
    const stage = document.getElementById('previewStage');
    if (!modal || !stage) return;
    modal.classList.add('open');
    stage.innerHTML = '<div class="preview-loading">جارٍ تجهيز المعاينة...</div>';
    try {
        const canvas = await generateReceiptCanvas({ fullPage: true, scale: 2 });
        const dataUrl = canvas.toDataURL('image/png');
        stage.innerHTML = '';
        const img = document.createElement('img');
        img.alt = 'معاينة السند';
        img.src = dataUrl;
        stage.appendChild(img);
    } catch (e) {
        stage.innerHTML = '<div class="preview-loading">تعذر تجهيز المعاينة: ' + escapePreviewText(e.message) + '</div>';
    }
}
function closePreviewModal() { document.getElementById('previewModal')?.classList.remove('open'); }
function escapePreviewText(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
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
    const parsed = typeof parseAnyDate === 'function' ? parseAnyDate(value) : null;
    if (parsed) return parsed.d + '/' + parsed.m + '/' + parsed.y + ' م';
    return String(value || '');
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
    const customService = document.getElementById('digCustomService')?.value?.trim();
    if (customService && !services.includes(customService)) services.push(customService);
    const srvText = services.length ? 'الخدمات: ' + services.join('، ') : '';
    const refText = ref ? '\nالمرجع: ' + bidiIsolate(ref) : '';
    const patientPhoneText = patientPhone ? '\nرقم الهاتف: ' + bidiIsolate(patientPhone) : '';
    const currency = typeof getCurrencyInfo === 'function' ? getCurrencyInfo() : {nameAr:'ريال يمني',symbol:'ر.ي'};
    const changeText = change > 0 ? '\nالزيادة/المبلغ المستحق للمريض: ' + bidiIsolate(change) + ' ' + currency.nameAr : '';
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
        'المبلغ المدفوع: ' + bidiIsolate(paid) + ' ' + currency.nameAr + ' (' + currency.symbol + ')\n' +
        'إجمالي الحساب: ' + bidiIsolate(total) + ' ' + currency.nameAr + ' (' + currency.symbol + ')\n' +
        'المتبقي: ' + bidiIsolate(balance) + ' ' + currency.nameAr + ' (' + currency.symbol + ')' + changeText + '\n' +
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

async async function saveCanvasImage(canvas, filename) {
    if (window.Android && typeof Android.beginImageSave === 'function') {
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1), chunkSize = 65536;
        Android.beginImageSave(filename);
        for (let i = 0; i < base64.length; i += chunkSize) Android.appendImageChunk(base64.substring(i, i + chunkSize));
        Android.finishImageSave();
        return;
    }
    const blob = await canvasToPngBlob(canvas);
    downloadBlob(blob, filename + '.png');
}

async function downloadReceiptImage() {
    try {
        const canvas = await generateReceiptCanvas({ fullPage: true });
        const recNo = (document.getElementById('digReceiptNo')?.value || 'سند').trim();
        await saveCanvasImage(canvas, 'سند_قبض_' + recNo);
        if (typeof toast === 'function') toast('تم تنزيل صورة السند بنجاح.');
    } catch (e) {
        if (typeof toast === 'function') toast('تعذر إنشاء الصورة: ' + e.message, 'error'); else alert('تعذر إنشاء الصورة: ' + e.message);
    }
}

function copyReceiptText() {
    closeShareModal();
    const text = getReceiptText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert('تم نسخ بيانات السند إلى الحافظة بنجاح.')).catch(() => alert(text));
    } else alert(text);
}
/* Blank printable template workflow. It never saves template data. */
function snapshotReceiptForTemplate(){
  const ids=['digReceiptNo','digDate','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digTooth','digCustomService'];
  const fields={}; ids.forEach(id=>{const el=document.getElementById(id); if(el) fields[id]=el.value;});
  return {mode:document.body.getAttribute('data-mode')||'digital',size:getSelectedSize(),payMethod:document.getElementById('selectedPayMethod')?.value||'',services:Array.from(document.querySelectorAll('.custom-check-item')).map(el=>el.classList.contains('active')),fields};
}
function restoreReceiptAfterTemplate(snapshot){
  if(!snapshot)return;
  Object.entries(snapshot.fields||{}).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value;});
  document.querySelectorAll('.custom-check-item').forEach((el,i)=>el.classList.toggle('active',!!snapshot.services?.[i]));
  setPayMethod(snapshot.payMethod||''); setSize(snapshot.size||'a5'); setMode(snapshot.mode||'digital');
  if(typeof calculateLedger==='function')calculateLedger();
  if(typeof syncReceiptDateFromInput==='function')syncReceiptDateFromInput();
}
function prepareBlankTemplate(){
  const snapshot=snapshotReceiptForTemplate();
  setMode('manual');
  ['digReceiptNo','digDate','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digTooth'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.querySelectorAll('.custom-check-item').forEach(el=>el.classList.remove('active'));
  setPayMethod(''); syncPaperDate(''); document.body.classList.add('blank-template-export');
  return snapshot;
}
function finishBlankTemplate(snapshot){document.body.classList.remove('blank-template-export');restoreReceiptAfterTemplate(snapshot);}
async function downloadBlankTemplateImage(){
  const snapshot=prepareBlankTemplate();
  try{
    const canvas=await generateReceiptCanvas({fullPage:true});
    const filename='ALSSAEDY_Clinic_Blank_Template_'+getSelectedSize().toUpperCase();
    await saveCanvasImage(canvas, filename);
    if(typeof toast==='function')toast('تم تنزيل النموذج الفارغ بنجاح.');
  }
  catch(e){if(typeof toast==='function')toast('تعذر إنشاء نموذج الطباعة: '+e.message,'error');else alert('تعذر إنشاء نموذج الطباعة: '+e.message);}
  finally{finishBlankTemplate(snapshot);}
}
async function downloadBlankTemplatePDF(){
  const snapshot=prepareBlankTemplate();
  const baseName='ALSSAEDY_Clinic_Blank_Template_'+getSelectedSize().toUpperCase();
  try{
    const blob=await buildReceiptPdfBlob();
    if(window.Android&&typeof Android.savePdfFromData==='function'){
      Android.savePdfFromData(await blobToDataUrl(blob),baseName);
    } else {
      downloadBlob(blob,baseName+'.pdf');
    }
    if(typeof toast==='function')toast('تم إنشاء نموذج PDF فارغ.');
  }
  catch(e){
    const oldTitle=document.title;
    document.title=baseName;
    injectPrintPageStyle();
    window.addEventListener('afterprint',()=>{
      document.title=oldTitle;
      document.getElementById('dynamic-print-size')?.remove();
      finishBlankTemplate(snapshot);
    },{once:true});
    setTimeout(()=>window.print(),120);
    return;
  }
  finishBlankTemplate(snapshot);
}
