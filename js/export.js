function getExportBox(profile) {
    // Export must use the same physical sheet dimensions as print CSS.
    // Do not introduce an artificial safety margin here: the receipt itself
    // already owns its internal padding.
    return { width: profile.width, height: profile.height === 'auto' ? 'auto' : profile.height };
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

function isBlankTemplateCapture() {
    return document.body.classList.contains('blank-template-export') ||
        document.body.getAttribute('data-mode') === 'manual';
}

function materializeReceiptDate(sourceReceipt, clonedReceipt) {
    const isBlankTemplate = isBlankTemplateCapture();
    const source = sourceReceipt.querySelector('#digDate');
    const cloned = clonedReceipt.querySelector('#digDate');
    const clonedPrintDate = clonedReceipt.querySelector('#printDateValue');

    if (isBlankTemplate) {
        if (cloned) {
            cloned.value='';
            cloned.removeAttribute('value');
            cloned.style.display='none';
        }
        if (clonedPrintDate) clonedPrintDate.remove();
        // In blank template mode the digital view must never render. html2canvas
        // can re-evaluate the cloned document independently of the live page, so
        // the hidden state is enforced inline on the clone itself rather than
        // relying only on the [data-mode="manual"] CSS cascade.
        const digitalView = clonedReceipt.querySelector('.digital-date-view');
        if (digitalView) {
            digitalView.style.setProperty('display','none','important');
            digitalView.setAttribute('aria-hidden','true');
        }
        const blankView = clonedReceipt.querySelector('.blank-date-view');
        if (blankView) {
            blankView.style.setProperty('display','flex','important');
            blankView.style.setProperty('visibility','visible','important');
        }
        // The blank date line is a configurable write-in sequence. Rewrite the
        // slot text from the saved preference and keep the era token isolated
        // so RTL ordering can never move "م" across the numerals.
        const blankSlots = clonedReceipt.querySelector('#blankDateSlots') || clonedReceipt.querySelector('.blank-date-slots');
        const era = clonedReceipt.querySelector('#blankDateEra') || clonedReceipt.querySelector('.blank-date-era');
        if (blankSlots) {
            let format = '';
            try { format = (typeof getBlankDateFormat === 'function' ? getBlankDateFormat() : '') || ''; } catch (_) { format = ''; }
            if (!format) {
                format = (typeof getDefaultBlankDateFormat === 'function')
                    ? getDefaultBlankDateFormat()
                    : '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 / \u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 / 202\u00a0\u00a0';
            }
            blankSlots.textContent = format;
            blankSlots.setAttribute('dir','rtl');
            blankSlots.style.unicodeBidi = 'isolate';
        }
        if (era) {
            era.textContent = 'م';
            era.setAttribute('dir','rtl');
            era.style.unicodeBidi = 'isolate';
        }
        return;
    }

    // Keep the original input in the clone so materializeReceiptControls()
    // retains one-to-one control mapping. Hide that input and add exactly one
    // ordinary text node for the exported/printed date.
    const value=String(source?.value||'').trim();
    if (cloned) {
        cloned.value=value;
        cloned.setAttribute('value',value);
        cloned.style.display='none';
    }
    if (clonedPrintDate) clonedPrintDate.remove();
    const span=clonedReceipt.ownerDocument.createElement('span');
    span.id='printDateValue';
    span.className='exported-receipt-date export-field-value';
    span.textContent=(typeof formatReceiptDate==='function' ? formatReceiptDate(value) : value);
    span.setAttribute('dir','ltr');
    span.style.cssText='display:inline-block!important;direction:ltr!important;unicode-bidi:isolate!important;font-weight:800!important;text-align:center!important;white-space:nowrap!important;width:120px!important;';
    if (cloned) cloned.parentNode.insertBefore(span,cloned.nextSibling);
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

/* Blank-template capture must be a clean printable sheet, never the editable
   form. Strip every residual form control (inputs, selects, textareas), any
   interactive button (e.g. the date-picker icon) and the hidden native date
   input from the cloned #receiptPrintArea before rasterising. */
function stripInteractiveControlsFromClone(clonedReceipt) {
    if (!clonedReceipt) return;
    clonedReceipt.querySelectorAll('input, textarea, select, button, .date-picker-btn, .hidden-date-picker').forEach(control => control.remove());
}

/* Freeze the cloned paper at the fixed physical desktop width during capture so
   html2canvas can never re-collapse the sheet into the mobile single-column
   view. Widths are the exact A5/A4 desktop pixel widths owned by the profile. */
function pinCloneToDesktopWidth(clonedReceipt, forcedWidth) {
    if (!clonedReceipt || !Number.isFinite(forcedWidth)) return;
    clonedReceipt.style.setProperty('width', forcedWidth + 'px', 'important');
    clonedReceipt.style.setProperty('min-width', forcedWidth + 'px', 'important');
    clonedReceipt.style.setProperty('max-width', forcedWidth + 'px', 'important');
    clonedReceipt.style.setProperty('display', 'block', 'important');
    clonedReceipt.style.setProperty('margin', '0 auto', 'important');
    clonedReceipt.style.setProperty('transform', 'none', 'important');
}

async function waitForReceiptFonts() {
    // html2canvas must capture shaped Arabic glyphs, not the fallback font.
    // Explicitly request the weights used by the receipt before the clone is made.
    const weights = [400, 600, 700, 800, 900];
    await Promise.all(weights.map(weight =>
        document.fonts.load(`${weight} 16px "Cairo"`, "سند قبض مالي")
    ));
    await document.fonts.ready;
}

const MM_TO_PX = 96 / 25.4;
// Desktop floor keeps the cloned capture document from matching the mobile
// media queries, which would otherwise re-collapse the sheet into one column.
const EXPORT_DESKTOP_VIEWPORT = 1024;

function getExportCaptureWidth(profile) {
    // Force a strict desktop sheet width for the capture. Derived from the
    // physical profile so the exported aspect ratio stays exact (A5 = 559px,
    // A4 = 794px, 80mm = 302px) regardless of the mobile viewport.
    const mm = parseFloat(String(profile?.width || ''));
    if (Number.isFinite(mm) && mm > 0) return Math.round(mm * MM_TO_PX);
    return Math.round(148 * MM_TO_PX);
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

async function inlineImageAsDataUrl(url) {
    const src = String(url || '').trim();
    if (!src || /^data:/i.test(src)) return src;
    try {
        const response = await fetch(src, { mode: 'cors', credentials: 'same-origin' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const contentType = response.headers.get('content-type') || 'image/png';
        return 'data:' + contentType + ';base64,' + arrayBufferToBase64(await response.arrayBuffer());
    } catch (_) {
        return src;
    }
}

function inlineReceiptLogoDataUrl() {
    // html2canvas can silently drop a relative-path logo. Inlining it as a
    // Base64 data URI guarantees the official logo renders in the export.
    const img = document.getElementById('clinicLogoImg');
    const fallback = typeof OFFICIAL_LOGO_URL !== 'undefined' ? OFFICIAL_LOGO_URL : 'assets/logo.png';
    return inlineImageAsDataUrl(img?.getAttribute('src') || fallback);
}

// The receipt sheet lives inside the product workspace (#receiptWorkspace),
// which is hidden while the dashboard tab is active. Capturing a hidden element
// yields a 0-size box, so any export path (share menu, blank template, etc.)
// must first surface the receipt tab deterministically.
function ensureReceiptWorkspaceActive() {
    const receipt = document.getElementById('receiptPrintArea');
    if (!receipt) return;
    const workspace = document.getElementById('receiptWorkspace') || receipt.closest('.page-canvas-wrapper');
    if (workspace && getComputedStyle(workspace).display !== 'none') return;
    if (typeof activateAppTab === 'function') activateAppTab('receipt');
    else if (typeof setClinicWorkspaceView === 'function') setClinicWorkspaceView('receipt');
}

async function generateReceiptCanvas(options = {}) {
    await ensureLibraries();
    await waitForReceiptFonts();

    ensureReceiptWorkspaceActive();
    const receipt = document.getElementById('receiptPrintArea');
    if (!receipt) throw new Error('منطقة السند غير موجودة.');

    const profile = getSizeProfile();
    const exportBox = getExportBox(profile);
    document.documentElement.style.setProperty('--export-width', exportBox.width);
    document.documentElement.style.setProperty('--export-height', exportBox.height);

    const forcedWidth = getExportCaptureWidth(profile);
    const logoDataUrl = await inlineReceiptLogoDataUrl();

    return withCaptureState(async () => {
        document.body.classList.add('exporting-receipt');

        const previousWidth = receipt.style.getPropertyValue('width');
        const previousWidthPriority = receipt.style.getPropertyPriority('width');
        const previousMaxWidth = receipt.style.getPropertyValue('max-width');
        const previousMaxWidthPriority = receipt.style.getPropertyPriority('max-width');
        receipt.style.setProperty('width', forcedWidth + 'px', 'important');
        receipt.style.setProperty('max-width', forcedWidth + 'px', 'important');

        try {
            const captureWindowWidth = Math.max(
                document.documentElement.clientWidth || 0,
                receipt.scrollWidth || 0,
                receipt.offsetWidth || 0,
                forcedWidth,
                EXPORT_DESKTOP_VIEWPORT
            );
            const captureWindowHeight = Math.max(
                document.documentElement.clientHeight || 0,
                receipt.scrollHeight || 0,
                receipt.offsetHeight || 0
            );

            // Thermal (80mm) has a single logical column, so the matrix overrides
            // must not force three columns onto it.
            const captureProfileKey = typeof getSelectedSize === 'function' ? getSelectedSize() : 'a5';
            const matrixFlexCss = captureProfileKey === 'thermal'
                ? `#receiptPrintArea .services-grid-matrix > * { flex: 0 0 100% !important; min-width: 0 !important; }
                   #receiptPrintArea .ledger-grid-wrap { display: flex !important; flex-direction: column !important; gap: 5px !important; }
                   #receiptPrintArea .ledger-grid-wrap > * { flex: 1 1 auto !important; min-width: 0 !important; }`
                : `#receiptPrintArea .services-grid-matrix > * { flex: 0 0 32% !important; min-width: 0 !important; }
                   #receiptPrintArea .ledger-grid-wrap { display: flex !important; flex-wrap: nowrap !important; align-items: stretch !important; gap: 6px !important; }
                   #receiptPrintArea .ledger-grid-wrap > * { flex: 1 1 32% !important; min-width: 0 !important; }`;

            return await html2canvas(receipt, {
                scale: options.scale || 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                // Do NOT use html2canvas letterRendering for Arabic: it can split
                // joined glyphs and place individual letters on top of each other.
                letterRendering: false,
                imageTimeout: 20000,
                removeContainer: true,
                windowWidth: captureWindowWidth,
                windowHeight: captureWindowHeight,
                onclone: (clonedDocument) => {
                    try {
                        const clonedReceipt = clonedDocument.getElementById('receiptPrintArea');
                        if (!clonedReceipt) return;

                        // html2canvas captures the cloned document at the mobile
                        // viewport width, which collapses the sheet. Pin the clone
                        // to the exact physical desktop width before rasterising.
                        pinCloneToDesktopWidth(clonedReceipt, forcedWidth);

                        // Freeze typography/layout for Canvas. The live UI may use
                        // responsive transforms, flex sizing and editable controls;
                        // the exported sheet must not inherit those behaviours.
                        // html2canvas mis-renders CSS Grid, so the header and the
                        // two multi-column matrices are re-expressed as Flexbox with
                        // explicit column percentages that mirror the grid tracks.
                        const style = clonedDocument.createElement('style');
                        style.textContent = `
                            #receiptPrintArea, #receiptPrintArea * {
                                font-family: "Cairo", "Noto Kufi Arabic", "Tajawal", sans-serif !important;
                                letter-spacing: normal !important;
                                font-feature-settings: "liga" 1, "calt" 1 !important;
                                -webkit-font-feature-settings: "liga" 1, "calt" 1 !important;
                                text-rendering: geometricPrecision !important;
                            }
                            #receiptPrintArea .main-voucher-title,
                            #receiptPrintArea .row-label,
                            #receiptPrintArea .meta-label,
                            #receiptPrintArea .paid-title,
                            #receiptPrintArea .paid-unit,
                            #receiptPrintArea .tafqeet-text,
                            #receiptPrintArea .tafqeet-closing,
                            #receiptPrintArea .services-banner,
                            #receiptPrintArea .custom-check-item,
                            #receiptPrintArea .ledger-header,
                            #receiptPrintArea .sig-title,
                            #receiptPrintArea .footer-blessing,
                            #receiptPrintArea .footer-address {
                                direction: rtl !important;
                                unicode-bidi: isolate !important;
                                letter-spacing: normal !important;
                            }
                            #receiptPrintArea .receipt-header,
                            #receiptPrintArea .title-strip,
                            #receiptPrintArea .meta-data-strip,
                            #receiptPrintArea .row-flex,
                            #receiptPrintArea .paid-hero-bar,
                            #receiptPrintArea .pay-opts-row,
                            #receiptPrintArea .section-signatures {
                                transform: none !important;
                            }
                            /* Grid → Flexbox, mirroring the original track sizes. */
                            #receiptPrintArea .receipt-header {
                                display: flex !important;
                                flex-direction: row !important;
                                flex-wrap: nowrap !important;
                                align-items: center !important;
                                justify-content: space-between !important;
                                gap: 8px !important;
                            }
                            #receiptPrintArea .receipt-header > .header-doc { flex: 1 1 0 !important; min-width: 0 !important; }
                            #receiptPrintArea .receipt-header > .header-logo-wrap { flex: 0 0 auto !important; }
                            #receiptPrintArea .receipt-header > .header-clinic { flex: 1 1 0 !important; min-width: 0 !important; }
                            #receiptPrintArea .services-grid-matrix {
                                display: flex !important;
                                flex-wrap: wrap !important;
                                align-items: center !important;
                                gap: 3px 6px !important;
                            }
                            ${matrixFlexCss}
                            #receiptPrintArea .main-voucher-title { display: inline-block !important; white-space: nowrap !important; }
                            #receiptPrintArea .title-strip { display: flex !important; }
                            #receiptPrintArea .row-label { flex: 0 0 auto !important; }
                        `;
                        clonedDocument.head.appendChild(style);

                        materializeReceiptDate(receipt, clonedReceipt);
                        materializeReceiptControls(receipt, clonedReceipt, clonedDocument);
                        // Capture the clean printable paper only: strip residual
                        // interactive form chrome (hidden inputs, the .no-print
                        // datepicker button/icon) that survived the clone. Receipt
                        // data was already materialised into text spans above, so
                        // nothing visible is lost.
                        stripInteractiveControlsFromClone(clonedReceipt);
                        pinCloneToDesktopWidth(clonedReceipt, forcedWidth);
                        const logo = clonedReceipt.querySelector('#clinicLogoImg');
                        if (logo) {
                            if (logoDataUrl) logo.setAttribute('src', logoDataUrl);
                            logo.style.opacity = '1';
                            logo.style.filter = 'none';
                            logo.style.imageRendering = 'auto';
                            logo.style.background = 'transparent';
                            logo.style.border = '0';
                            logo.style.borderRadius = '0';
                            logo.style.boxShadow = 'none';
                            logo.style.padding = '0';
                            logo.removeAttribute('width');
                            logo.removeAttribute('height');
                        }
                    } catch (error) {
                        // A malformed clone must never abort the whole export.
                        if (window.console && console.warn) console.warn('receipt clone preparation failed', error);
                    }
                }
            });
        } finally {
            if (previousWidth) receipt.style.setProperty('width', previousWidth, previousWidthPriority);
            else receipt.style.removeProperty('width');
            if (previousMaxWidth) receipt.style.setProperty('max-width', previousMaxWidth, previousMaxWidthPriority);
            else receipt.style.removeProperty('max-width');
        }
    }).finally(() => document.body.classList.remove('exporting-receipt'));
}

function canvasToPngBlob(canvas) {
    return new Promise((resolve, reject) => {
        const fail = () => reject(new Error('تعذر تحويل السند إلى صورة.'));
        if (canvas.toBlob) {
            try {
                canvas.toBlob(blob => blob ? resolve(blob) : fail(), 'image/png');
            } catch (_) { fail(); }
        } else {
            try {
                const dataUrl = canvas.toDataURL('image/png');
                const bin = atob(dataUrl.split(',')[1]);
                const arr = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                resolve(new Blob([arr], { type: 'image/png' }));
            } catch (_) { fail(); }
        }
    });
}

function downloadBlob(blob, filename) {
    if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('ملف التصدير غير صالح.');
    }
    let url = '';
    try {
        url = URL.createObjectURL(blob);
    } catch (error) {
        throw new Error('تعذر إنشاء رابط التنزيل: ' + (error?.message || 'خطأ غير معروف'));
    }
    try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
    } finally {
        setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, 2000);
    }
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
    // Native print uses the live DOM (unlike Canvas export), so materialize the
    // display-only date before opening the system print dialog.
    const dateInput = document.getElementById('digDate');
    updatePrintDate(dateInput?.value || '');
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
    const editing = typeof getEditingReceipt === 'function' ? getEditingReceipt() : null;
    const lifecycle = typeof getReceiptLifecycleStatus === 'function' ? getReceiptLifecycleStatus(editing) : 'issued';
    const serviceItems = typeof getClinicServiceItems === 'function' ? getClinicServiceItems() : [];
    const services = Array.from(document.querySelectorAll('.custom-check-item.active'))
        .map(item => item.innerText.replace('✓','').trim());
    const customService = document.getElementById('digCustomService')?.value?.trim();
    if (customService && !services.includes(customService)) services.push(customService);
    const srvText = services.length ? 'الخدمات: ' + services.join('، ') : '';
    const refText = ref ? '\nالمرجع: ' + bidiIsolate(ref) : '';
    const patientPhoneText = patientPhone ? '\nرقم الهاتف: ' + bidiIsolate(patientPhone) : '';
    const currency = typeof getCurrencyInfo === 'function' ? getCurrencyInfo() : {nameAr:'ريال يمني',symbol:'ر.ي'};
    const lineText = serviceItems.length ? '\nتفاصيل الخدمات: ' + serviceItems.map(item => (item.name || 'خدمة') + ' × ' + (Number(item.qty)||1) + ' = ' + (((Number(item.qty)||1)*(Number(item.unitPrice)||0)).toLocaleString()) + ' ' + currency.symbol).join('؛ ') : '';
    const statusText = lifecycle === 'voided' ? '\n⚠️ حالة السند: ملغى — لا يمثل مطالبة مالية سارية' : '';
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
        statusText +
        srvText + lineText + ((srvText || lineText) ? '\n' : '') +
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

async function saveCanvasImage(canvas, filename) {
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
  const ids=['digReceiptNo','digDate','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digCustomService'];
  const fields={}; ids.forEach(id=>{const el=document.getElementById(id); if(el) fields[id]=el.value;});
  return {
    mode:document.body.getAttribute('data-mode')||'digital',
    size:getSelectedSize(),
    payMethod:document.getElementById('selectedPayMethod')?.value||'',
    blankDateFormat:getBlankDateFormat(),
    services:Array.from(document.querySelectorAll('.custom-check-item')).map(el=>el.classList.contains('active')),
    fields
  };
}
function restoreReceiptAfterTemplate(snapshot){
  if(!snapshot)return;
  Object.entries(snapshot.fields||{}).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.value=value;});
  document.querySelectorAll('.custom-check-item').forEach((el,i)=>el.classList.toggle('active',!!snapshot.services?.[i]));
  setPayMethod(snapshot.payMethod||'');
  setSize(snapshot.size||'a5');
  if (snapshot.blankDateFormat) setBlankDateFormat(snapshot.blankDateFormat);
  setMode(snapshot.mode||'digital');
  if(typeof calculateLedger==='function')calculateLedger();
  if(typeof syncReceiptDateFromInput==='function')syncReceiptDateFromInput();
}
function prepareBlankTemplate(){
  const snapshot=snapshotReceiptForTemplate();
  setMode('manual');
  ['digReceiptNo','digDate','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digCustomService'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.querySelectorAll('.custom-check-item').forEach(el=>el.classList.remove('active'));
  setPayMethod('');
  syncPaperDate();
  document.body.classList.add('blank-template-export');
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
  ensureReceiptWorkspaceActive();
  const baseName='ALSSAEDY_Clinic_Blank_Template_'+getSelectedSize().toUpperCase();
  const oldTitle=document.title;
  document.title=baseName;
  injectPrintPageStyle();
  if(typeof toast==='function')toast('اختر «حفظ كـ PDF» من نافذة الطباعة للحصول على نموذج نصي عالي الدقة.');
  window.addEventListener('afterprint',()=>{
    document.title=oldTitle;
    document.getElementById('dynamic-print-size')?.remove();
    finishBlankTemplate(snapshot);
  },{once:true});
  setTimeout(()=>window.print(),120);
}
