import { chromium } from 'playwright';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 1 });

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
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
  visibleDigitalDateFields: Array.from(document.querySelectorAll('.date-field-wrapper .digital-only')).filter(el => getComputedStyle(el).display !== 'none' && el.id !== 'hiddenDatePicker').length,
  visibleManualDateFields: Array.from(document.querySelectorAll('.date-field-wrapper .manual-only')).filter(el => getComputedStyle(el).display !== 'none').length
}));
if (dateCheck.digitalDate !== '2026-10-07' || dateCheck.visibleDigitalDateFields !== 1 || dateCheck.visibleManualDateFields !== 0) {
  throw new Error('Digital receipt date visibility failed: ' + JSON.stringify(dateCheck));
}

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
if (Object.values(blankCheck.values).some(Boolean) ||
    blankCheck.date.day !== '' || blankCheck.date.month !== '' || blankCheck.date.year !== '202م' ||
    blankCheck.visibleDigital !== 0 || blankCheck.visibleManual !== 1) {
  throw new Error('Blank printable template is not empty: ' + JSON.stringify(blankCheck));
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

const result = await page.evaluate(async () => {
  if (typeof html2canvas !== 'function') throw new Error('Bundled html2canvas is unavailable');
  const canvas = await generateReceiptCanvas();
  const cloneCheck = (() => {
    const source = document.getElementById('receiptPrintArea');
    const cloned = source.cloneNode(true);
    materializeReceiptControls(source, cloned, document);
    materializeReceiptDate(source, cloned);
    const fields = Array.from(cloned.querySelectorAll('.export-field-value')).map(el => el.textContent.trim());
    return fields.includes('2026-10-07') && fields.includes('مريض الاختبار') && fields.includes('TEST-001');
  })();
  if (!cloneCheck) throw new Error('Export clone did not preserve receipt fields.');
  return {
    width: canvas.width,
    height: canvas.height,
    dataUrl: canvas.toDataURL('image/png')
  };
});

const base64 = result.dataUrl.split(',')[1];
const pngPath = '/tmp/alssaedy-receipt-export.png';
fs.writeFileSync(pngPath, Buffer.from(base64, 'base64'));

const png = PNG.sync.read(fs.readFileSync(pngPath));
if (png.width !== result.width || png.height !== result.height) throw new Error('PNG dimensions mismatch');
if (png.width < 1000 || png.height < 1200) throw new Error(`Export unexpectedly small: ${png.width}x${png.height}`);

let lowerInk = 0;
const yStart = Math.floor(png.height * 0.55);
for (let y = yStart; y < png.height; y += 4) {
  for (let x = 0; x < png.width; x += 4) {
    const i = (y * png.width + x) * 4;
    const r = png.data[i], g = png.data[i+1], b = png.data[i+2], a = png.data[i+3];
    if (a > 0 && (r < 245 || g < 245 || b < 245)) lowerInk++;
  }
}
if (lowerInk < 500) throw new Error(`Lower receipt area appears blank; ink samples=${lowerInk}`);

console.log(JSON.stringify({ ok: true, width: png.width, height: png.height, lowerInkSamples: lowerInk, pngPath }));
await browser.close();
