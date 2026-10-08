import { chromium } from 'playwright';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 1 });

const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err)));
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
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

const dateCheck = await page.evaluate(() => ({
  digitalDate: document.getElementById('digDate')?.value || '',
  digitalDateInputs: document.querySelectorAll('#digDate').length,
  visibleDigitalDateFields: Array.from(document.querySelectorAll('.date-field-wrapper .digital-only')).filter(el => getComputedStyle(el).display !== 'none').length,
  visibleManualDateFields: Array.from(document.querySelectorAll('.date-field-wrapper .manual-only')).filter(el => getComputedStyle(el).display !== 'none').length,
  printDateValue: document.getElementById('printDateValue')?.textContent || '',
  paperYear: document.getElementById('paperDateYear')?.textContent || '',
  paperYearDigits: document.getElementById('paperYearDigits')?.textContent || '',
  paperYearEra: document.getElementById('paperYearEra')?.textContent || '',
  paperYearDirection: getComputedStyle(document.getElementById('paperDateYear') || document.body).direction,
  paperYearDisplay: getComputedStyle(document.getElementById('paperDateYear') || document.body).display,
  pickerHandler: typeof openDatePicker === 'function'
}));
if (dateCheck.digitalDate !== '2026-10-07' || dateCheck.digitalDateInputs !== 1 || dateCheck.visibleDigitalDateFields !== 1 || dateCheck.visibleManualDateFields !== 0 || !dateCheck.pickerHandler || dateCheck.printDateValue !== '07/10/2026 م' || dateCheck.paperYearDigits !== '2026' || dateCheck.paperYearEra !== 'م' || !['flex','inline-flex'].includes(dateCheck.paperYearDisplay)) {
  throw new Error('Digital receipt date visibility failed: ' + JSON.stringify(dateCheck));
}

await page.emulateMedia({ media: 'print' });
const nativePrintDateCheck = await page.evaluate(() => ({
  printDate: document.getElementById('printDateValue')?.textContent || '',
  printDateDisplay: getComputedStyle(document.getElementById('printDateValue')).display,
  digitalInputDisplay: getComputedStyle(document.getElementById('digDate')).display,
  pickerDisplay: getComputedStyle(document.getElementById('hiddenDatePicker')).display,
  yearDigits: document.getElementById('paperYearDigits')?.textContent || '',
  yearEra: document.getElementById('paperYearEra')?.textContent || ''
}));
if (nativePrintDateCheck.printDate !== '07/10/2026 م' ||
    nativePrintDateCheck.printDateDisplay === 'none' ||
    nativePrintDateCheck.digitalInputDisplay !== 'none' ||
    nativePrintDateCheck.pickerDisplay !== 'none' ||
    nativePrintDateCheck.yearDigits !== '2026' ||
    nativePrintDateCheck.yearEra !== 'م') {
  throw new Error('Native print date contract failed: ' + JSON.stringify(nativePrintDateCheck));
}
await page.emulateMedia({ media: 'screen' });

const blankCheck = await page.evaluate(() => {
  const snapshot = prepareBlankTemplate();
  const fields = ['digReceiptNo','digDate','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digTooth'];
  const values = Object.fromEntries(fields.map(id => [id, document.getElementById(id)?.value || '']));
  const date = {
    day: document.getElementById('paperDateDay')?.textContent || '',
    month: document.getElementById('paperDateMonth')?.textContent || '',
    year: document.getElementById('paperDateYear')?.textContent || ''
  };
  const visibleDigital = Array.from(document.querySelectorAll('.date-field-wrapper .digital-only')).filter(el => getComputedStyle(el).display !== 'none' && el.id !== 'hiddenDatePicker').length;
  const visibleManual = Array.from(document.querySelectorAll('.date-field-wrapper .manual-only')).filter(el => getComputedStyle(el).display !== 'none').length;
  const result={values,date,visibleDigital,visibleManual};
  finishBlankTemplate(snapshot);
  return result;
});
if (blankCheck.date.year !== new Date().getFullYear() + 'م' ||
    blankCheck.date.year.includes('202م') ||
    Object.values(blankCheck.values).some(Boolean) ||
    blankCheck.date.day !== '' || blankCheck.date.month !== '' ||
    blankCheck.visibleDigital !== 0 || blankCheck.visibleManual !== 1) {
  throw new Error('Blank printable template is not empty: ' + JSON.stringify(blankCheck));
}

const dateFormats = await page.evaluate(() => {
  const input = document.getElementById('paperTemplateDate');
  if (!input) throw new Error('Missing #paperTemplateDate');
  const cases = [
    ['07/10/2026', ['07','10','2026']],
    ['7-10-2026', ['07','10','2026']],
    ['2026/10/07', ['07','10','2026']],
    ['٢٠٢٦/١٠/٠٧', ['07','10','2026']],
    ['2026.10.07', ['07','10','2026']],
    ['7 10 2026', ['07','10','2026']]
  ];
  return cases.map(([value, expected]) => {
    setPaperTemplateDate(value);
    return {
      value,
      day: document.getElementById('paperDateDay')?.textContent || '',
      month: document.getElementById('paperDateMonth')?.textContent || '',
      year: document.getElementById('paperYearDigits')?.textContent || '',
      era: document.getElementById('paperYearEra')?.textContent || ''
    };
  });
});
for (const item of dateFormats) {
  if (item.day !== '07' || item.month !== '10' || item.year !== '2026' || item.era !== 'م') {
    throw new Error('Paper date format parsing failed: ' + JSON.stringify(item));
  }
}
await page.evaluate(() => clearPaperTemplateDate());

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

const result = await page.evaluate(async () => {
  if (typeof html2canvas !== 'function') throw new Error('Bundled html2canvas is unavailable');
  if (!document.fonts.check('900 16px "Cairo"', 'سند قبض مالي')) {
    throw new Error('Cairo Arabic font is not ready before Canvas capture.');
  }
  if (typeof generateReceiptCanvas !== 'function') {
    throw new Error('Image export pipeline is unavailable.');
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
  const patientNameTokens=['مريض','اختبار'];
  if(!patientNameTokens.every(token => normalizedText.includes(token)) || !normalizedText.includes('TEST-001') || !normalizedText.includes('07/10/2026')) {
    throw new Error('PDF is missing selectable receipt text for '+size+': '+text.slice(0,500));
  }
  if(normalizedText.includes('2026-10-07')) throw new Error('PDF exposed the native ISO input value for '+size);
  outputs[size].pdf={pages:Number(pages),selectableText:true};
}
await page.emulateMedia({media:'screen'});
await browser.close();
console.log(JSON.stringify({ok:true,outputs}));
