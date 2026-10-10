import { chromium } from 'playwright';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 1 });

const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err)));
await page.goto('http://127.0.0.1:4173/index.html#product-dental-clinic', { waitUntil: 'networkidle' });
await page.locator('#productWorkspace').waitFor({state:'visible'});
if (pageErrors.length) throw new Error('JavaScript page errors: ' + pageErrors.join(' | '));
await page.evaluate(() => {
  if (typeof setMode !== 'function') throw new Error('setMode is unavailable');
  setMode('digital');
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (!el) throw new Error('Missing #' + id);
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  set('digReceiptNo', 'TEST-001');
  set('digDate', '2026-10-07');
  set('digClientName', 'مريض الاختبار');
  set('digPatientPhone', '771234567');
  set('digPaid', '25000');
  const ref = document.getElementById('digRef');
  if (ref) ref.value = 'REF-TEST-001';
  const method = document.getElementById('selectedPayMethod');
  if (method) method.value = 'نقداً';
  if (typeof calculateLedger === 'function') calculateLedger();
  if (typeof syncReceiptDateFromInput === 'function') syncReceiptDateFromInput();
});

await page.waitForTimeout(500);

// Canonical blank-paper write-in date line. It is dot-free and uses non-breaking
// spaces so the handwriting gaps survive `white-space: nowrap`.
const EXPECTED_BLANK_DATE = await page.evaluate(() => getDefaultBlankDateFormat());
if (EXPECTED_BLANK_DATE.includes('.')) throw new Error('Blank date default still contains dots: ' + JSON.stringify(EXPECTED_BLANK_DATE));

const dateCheck = await page.evaluate(() => ({
  digitalDate: document.getElementById('digDate')?.value || '',
  digitalDateInputs: document.querySelectorAll('#digDate').length,
  visibleDigitalDateFields: Array.from(document.querySelectorAll('.date-field-wrapper .digital-only')).filter(el => getComputedStyle(el).display !== 'none').length,
  visibleManualDateFields: Array.from(document.querySelectorAll('.date-field-wrapper .manual-only')).filter(el => getComputedStyle(el).display !== 'none').length,
  printDateValue: document.getElementById('printDateValue')?.textContent || '',
  blankDateSlots: document.getElementById('blankDateSlots')?.textContent || '',
  blankDateEra: document.querySelector('.blank-date-era')?.textContent || '',
  blankDateEraIsolate: getComputedStyle(document.querySelector('.blank-date-era') || document.body).unicodeBidi,
  pickerHandler: typeof openDatePicker === 'function'
}));
if (dateCheck.digitalDate !== '2026-10-07' || dateCheck.digitalDateInputs !== 1 || dateCheck.visibleDigitalDateFields !== 1 || dateCheck.visibleManualDateFields !== 0 || !dateCheck.pickerHandler || dateCheck.printDateValue !== '07/10/2026 م' || dateCheck.blankDateSlots !== EXPECTED_BLANK_DATE || dateCheck.blankDateSlots.includes('.') || dateCheck.blankDateEra !== 'م' || !String(dateCheck.blankDateEraIsolate).includes('isolate')) {
  throw new Error('Digital receipt date visibility failed: ' + JSON.stringify(dateCheck));
}

await page.emulateMedia({ media: 'print' });
const nativePrintDateCheck = await page.evaluate(() => ({
  printDate: document.getElementById('printDateValue')?.textContent || '',
  printDateDisplay: getComputedStyle(document.getElementById('printDateValue')).display,
  digitalInputDisplay: getComputedStyle(document.getElementById('digDate')).display,
  pickerDisplay: getComputedStyle(document.getElementById('hiddenDatePicker')).display,
  blankDateSlots: document.getElementById('blankDateSlots')?.textContent || '',
  blankDateEra: document.querySelector('.blank-date-era')?.textContent || ''
}));
if (nativePrintDateCheck.printDate !== '07/10/2026 م' ||
    nativePrintDateCheck.printDateDisplay === 'none' ||
    nativePrintDateCheck.digitalInputDisplay !== 'none' ||
    nativePrintDateCheck.pickerDisplay !== 'none' ||
    nativePrintDateCheck.blankDateSlots !== EXPECTED_BLANK_DATE ||
    nativePrintDateCheck.blankDateSlots.includes('.') ||
    nativePrintDateCheck.blankDateEra !== 'م') {
  throw new Error('Native print date contract failed: ' + JSON.stringify(nativePrintDateCheck));
}
await page.emulateMedia({ media: 'screen' });

// Blank date format is a configurable setting; the era token must stay isolated.
// The dotted legacy format must be normalized away, not persisted.
const blankFormatCheck = await page.evaluate(() => {
  setBlankDateFormat('__ / __ / 2026__');
  const custom = {
    settingValue: document.getElementById('settingBlankDateFormat')?.value || '',
    slots: document.getElementById('blankDateSlots')?.textContent || '',
    stored: localStorage.getItem('alssaedy_blank_date_format') || ''
  };
  setBlankDateFormat('..... / ..... / 202...');
  const dotted = {
    stored: localStorage.getItem('alssaedy_blank_date_format') || '',
    hasDots: (document.getElementById('blankDateSlots')?.textContent || '').includes('.')
  };
  setBlankDateFormat(getDefaultBlankDateFormat());
  return { custom, dotted };
});
if (blankFormatCheck.custom.settingValue !== '__ / __ / 2026__' || blankFormatCheck.custom.slots !== '__ / __ / 2026__' || blankFormatCheck.custom.stored !== '__ / __ / 2026__') {
  throw new Error('Configurable blank date format failed: ' + JSON.stringify(blankFormatCheck.custom));
}
if (blankFormatCheck.dotted.hasDots || blankFormatCheck.dotted.stored.includes('.')) {
  throw new Error('Legacy dotted blank date format was not normalized away: ' + JSON.stringify(blankFormatCheck.dotted));
}

const blankCheck = await page.evaluate(() => {
  const snapshot = prepareBlankTemplate();
  const fields = ['digReceiptNo','digDate','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digCustomService'];
  const values = Object.fromEntries(fields.map(id => [id, document.getElementById(id)?.value || '']));
  const slotsEl = document.querySelector('.blank-date-view .blank-date-slots');
  const eraEl = document.querySelector('.blank-date-view .blank-date-era');
  const date = {
    slots: document.getElementById('blankDateSlots')?.textContent || '',
    era: eraEl?.textContent || '',
    slotsIsolate: getComputedStyle(slotsEl || document.body).unicodeBidi,
    eraIsolate: getComputedStyle(eraEl || document.body).unicodeBidi,
    // The era token must be the last laid-out child in the blank date view.
    eraIsLastChild: document.querySelector('.blank-date-view')?.lastElementChild === eraEl
  };
  const visibleDigital = Array.from(document.querySelectorAll('.date-field-wrapper .digital-only')).filter(el => getComputedStyle(el).display !== 'none' && el.id !== 'hiddenDatePicker').length;
  const visibleManual = Array.from(document.querySelectorAll('.date-field-wrapper .manual-only')).filter(el => getComputedStyle(el).display !== 'none').length;
  const result={values,date,visibleDigital,visibleManual};
  finishBlankTemplate(snapshot);
  return result;
});
if (blankCheck.date.slots !== EXPECTED_BLANK_DATE ||
    blankCheck.date.slots.includes('.') ||
    blankCheck.date.era !== 'م' ||
    !String(blankCheck.date.slotsIsolate).includes('isolate') ||
    !String(blankCheck.date.eraIsolate).includes('isolate') ||
    !blankCheck.date.eraIsLastChild ||
    Object.values(blankCheck.values).some(Boolean) ||
    blankCheck.visibleDigital !== 0 || blankCheck.visibleManual !== 1) {
  throw new Error('Blank printable template is not empty: ' + JSON.stringify(blankCheck));
}

// Phase 8.9 — preparing the blank paper master must restore the original
// digital transaction and must not switch the receipt into manual mode.
const restoredAfterBlank = await page.evaluate(() => ({
  mode: document.body.getAttribute('data-mode'),
  receiptNo: document.getElementById('digReceiptNo')?.value || '',
  date: document.getElementById('digDate')?.value || '',
  name: document.getElementById('digClientName')?.value || '',
  phone: document.getElementById('digPatientPhone')?.value || '',
  paid: document.getElementById('digPaid')?.value || ''
}));
if (restoredAfterBlank.mode !== 'digital' ||
    restoredAfterBlank.receiptNo !== 'TEST-001' ||
    restoredAfterBlank.date !== '2026-10-07' ||
    restoredAfterBlank.name !== 'مريض الاختبار' ||
    restoredAfterBlank.phone !== '771234567' ||
    restoredAfterBlank.paid !== '25000') {
  throw new Error('Phase 8.9 blank-template preparation corrupted the digital receipt: ' + JSON.stringify(restoredAfterBlank));
}

const blankTemplateContract = await page.evaluate(() => {
  document.getElementById('digDate').value='07/10/2026';
  setMode('manual');
  const result={
    digitalDate:document.getElementById('digDate')?.value||'',
    blankDateSlots:document.getElementById('blankDateSlots')?.textContent||'',
    blankDateEra:document.querySelector('.blank-date-era')?.textContent||''
  };
  setMode('digital');
  return result;
});
if (blankTemplateContract.digitalDate !== '07/10/2026' || blankTemplateContract.blankDateSlots !== EXPECTED_BLANK_DATE || blankTemplateContract.blankDateEra !== 'م') {
  throw new Error('Blank paper template boundary failed: '+JSON.stringify(blankTemplateContract));
}

await page.evaluate(() => { window.__templateSnapshot=prepareBlankTemplate(); });
await page.emulateMedia({ media: 'print' });
const pdfPath='/tmp/alssaedy-blank-template.pdf';
await page.pdf({path:pdfPath,preferCSSPageSize:true,printBackground:true});
await page.evaluate(() => { finishBlankTemplate(window.__templateSnapshot || null); setMode('digital'); });
import { execFileSync } from 'node:child_process';
let pdfText='';
try { pdfText=execFileSync('pdftotext',[pdfPath,'-'],{encoding:'utf8'}); } catch(e) { throw new Error('pdftotext unavailable or PDF generation failed: '+e.message); }
for(const forbidden of ['2026-10-07','مريض الاختبار','TEST-001','25000']) {
  if(pdfText.includes(forbidden)) throw new Error('Blank PDF contains digital data: '+forbidden);
}

// REGRESSION (commit 9e0bfaf): exporting the blank template captured the
// editable HTML form chrome (inputs, browser datepicker icon, checkboxes from
// the receipt workspace) instead of the clean printable paper. Capture the
// html2canvas clone and assert it is the sanitized #receiptPrintArea sheet:
// no form controls, only the blank date view, pinned to the fixed A5 width.
const blankCapture = await page.evaluate(async () => {
  const snapshot = prepareBlankTemplate();
  setSize('a5');
  const out = {};
  const orig = window.html2canvas;
  window.html2canvas = function(el, opts) {
    const wrapped = Object.assign({}, opts, { onclone: (doc) => {
      const ret = opts.onclone ? opts.onclone(doc) : undefined;
      try {
        const r = doc.getElementById('receiptPrintArea');
        out.targetId = el && el.id;
        out.inputs = r.querySelectorAll('input, select, textarea').length;
        out.buttons = r.querySelectorAll('button, .date-picker-btn').length;
        out.hasDigitalDateView = !!r.querySelector('.digital-date-view');
        out.digitalDateDisplay = (() => { const d = r.querySelector('.digital-date-view'); return d ? doc.defaultView.getComputedStyle(d).display : 'missing'; })();
        out.blankDateDisplay = (() => { const d = r.querySelector('.blank-date-view'); return d ? doc.defaultView.getComputedStyle(d).display : 'missing'; })();
        out.blankSlots = r.querySelector('#blankDateSlots')?.textContent || '';
        out.pinnedWidth = r.style.getPropertyValue('width');
        out.rectWidth = Math.round(r.getBoundingClientRect().width);
      } catch (e) { out.err = String(e); }
      return ret;
    }});
    return orig(el, wrapped);
  };
  await generateReceiptCanvas({ fullPage: true, scale: 2 });
  window.html2canvas = orig;
  finishBlankTemplate(snapshot);
  setMode('digital');
  return out;
});
if (blankCapture.err) throw new Error('Blank capture clone inspection failed: ' + blankCapture.err);
if (blankCapture.targetId !== 'receiptPrintArea') throw new Error('Export did not target #receiptPrintArea: ' + blankCapture.targetId);
if (blankCapture.inputs !== 0) throw new Error('Blank capture leaked form inputs: ' + blankCapture.inputs);
if (blankCapture.buttons !== 0) throw new Error('Blank capture leaked interactive buttons/datepicker: ' + blankCapture.buttons);
if (blankCapture.hasDigitalDateView && blankCapture.digitalDateDisplay !== 'none') throw new Error('Blank capture rendered the digital date view: ' + blankCapture.digitalDateDisplay);
if (blankCapture.blankDateDisplay !== 'flex') throw new Error('Blank capture did not render the blank date view: ' + blankCapture.blankDateDisplay);
if (blankCapture.blankSlots !== EXPECTED_BLANK_DATE || blankCapture.blankSlots.includes('.')) throw new Error('Blank capture blank date format wrong: ' + JSON.stringify(blankCapture.blankSlots));
if (blankCapture.pinnedWidth !== '559px' || blankCapture.rectWidth !== 559) throw new Error('Blank A5 capture was not pinned to the physical 559px width: ' + JSON.stringify({pinned:blankCapture.pinnedWidth,rect:blankCapture.rectWidth}));

const result = await page.evaluate(async () => {
  if (typeof html2canvas !== 'function') throw new Error('Bundled html2canvas is unavailable');
  if (!document.fonts.check('900 16px "Cairo"', 'سند قبض مالي')) {
    throw new Error('Cairo Arabic font is not ready before Canvas capture.');
  }
  if (typeof generateReceiptCanvas !== 'function') {
    throw new Error('Image export pipeline is unavailable.');
  }

  // TASK 3: the official raster logo must be reachable and inlinable as Base64
  // so html2canvas never drops it due to a relative-path/CORS failure.
  const logoDataUrl = await inlineReceiptLogoDataUrl();
  if (!String(logoDataUrl).startsWith('data:image/')) {
    throw new Error('Official logo could not be inlined as a data URI.');
  }

  const source = document.getElementById('receiptPrintArea');
  const titleBox = source.querySelector('.main-voucher-title')?.getBoundingClientRect();
  const titleStrip = source.querySelector('.title-strip')?.getBoundingClientRect();
  if (!titleBox || !titleStrip || titleBox.width <= 0 || titleBox.height <= 0 ||
      titleBox.right > titleStrip.right + 1 || titleBox.left < titleStrip.left - 1) {
    throw new Error('Receipt title layout is invalid before Canvas capture.');
  }
  const cloned = source.cloneNode(true);
  materializeReceiptDate(source, cloned);
  materializeReceiptControls(source, cloned, document);
  const fields = Array.from(cloned.querySelectorAll('.export-field-value')).map(el => el.textContent.trim());
  const formattedDate = formatReceiptDate(document.getElementById('digDate')?.value || '');
  if (!fields.includes('مريض الاختبار') || !fields.includes('TEST-001') ||
      (!fields.includes(formattedDate) && cloned.querySelector('#printDateValue')?.textContent.trim() !== formattedDate)) {
    throw new Error('Export clone did not preserve receipt fields.');
  }

  const sizes = [
    { id: 'a5', ratio: 148 / 210 },
    { id: 'a4', ratio: 210 / 297 },
    { id: 'thermal', ratio: null }
  ];
  const exports = {};
  for (const size of sizes) {
    setSize(size.id);
    const canvas = await generateReceiptCanvas({ fullPage: true, scale: 4 });
    if (size.ratio) {
      const actual = canvas.width / canvas.height;
      if (Math.abs(actual - size.ratio) > 0.01) {
        throw new Error('Wrong physical aspect ratio for ' + size.id + ': ' + actual);
      }
    }
    exports[size.id] = {
      width: canvas.width,
      height: canvas.height,
      dataUrl: canvas.toDataURL('image/png')
    };
  }
  setSize('a5');
  return exports;
});const outputs = {};
for (const [size, item] of Object.entries(result)) {
  const pngPath = '/tmp/alssaedy-' + size + '.png';
  fs.writeFileSync(pngPath, Buffer.from(item.dataUrl.split(',')[1], 'base64'));
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  if (png.width !== item.width || png.height !== item.height) throw new Error('PNG dimensions mismatch for ' + size);
  if (png.width < 1000 || png.height < 1000) throw new Error('Export unexpectedly small for ' + size + ': ' + png.width + 'x' + png.height);
  let ink = 0;
  for (let y = Math.floor(png.height * 0.55); y < png.height; y += 4) {
    for (let x = 0; x < png.width; x += 4) {
      const i = (y * png.width + x) * 4;
      if (png.data[i + 3] > 0 && (png.data[i] < 245 || png.data[i + 1] < 245 || png.data[i + 2] < 245)) ink++;
    }
  }
  if (ink < 500) throw new Error('Lower receipt area appears blank for ' + size);
  outputs[size] = { png: [png.width, png.height], ink };
}

// The production PDF path is the browser/WebView print engine, not a screenshot.
// Chromium page.pdf() exercises the same vector/text print pipeline and lets us
// verify that the generated PDF contains selectable text.
for (const size of ['a5','a4']) {
  await page.evaluate(size => setSize(size), size);
  await page.emulateMedia({ media: 'print' });
  const pdfPath='/tmp/alssaedy-vector-' + size + '.pdf';
  await page.pdf({path:pdfPath,preferCSSPageSize:true,printBackground:true});
  const info=execFileSync('pdfinfo',[pdfPath],{encoding:'utf8'});
  const pages=/Pages:\s+(\d+)/.exec(info)?.[1];
  if(pages!=='1') throw new Error('Vector print PDF must contain exactly one page for '+size);
  const text=execFileSync('pdftotext',[pdfPath,'-'],{encoding:'utf8'});
  // pdftotext may insert whitespace and bidi control marks between glyph runs,
  // especially for Arabic and mixed Arabic/Latin text. Normalize the extracted
  // text before asserting selectable content; do not weaken the actual content contract.
  const normalizedText=text
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,'')
    .replace(/\s+/g,'');
  const arabicCharCount=(normalizedText.match(/\p{Script=Arabic}/gu)||[]).length;
  if(arabicCharCount < 20 || !normalizedText.includes('TEST-001') || !normalizedText.includes('07/10/2026') || !normalizedText.includes('771234567')) {
    throw new Error('PDF is missing selectable receipt text for '+size+': '+text.slice(0,500));
  }
  if(normalizedText.includes('2026-10-07')) throw new Error('PDF exposed the native ISO input value for '+size);
  outputs[size].pdf={pages:Number(pages),selectableText:true};
}
await page.emulateMedia({media:'screen'});
await browser.close();
console.log(JSON.stringify({ok:true,outputs}));
