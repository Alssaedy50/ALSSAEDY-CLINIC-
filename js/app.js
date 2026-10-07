
const CURRENCY_PROFILES={
 YER:{code:'YER',nameAr:'ريال يمني',symbol:'ر.ي'},
 SAR:{code:'SAR',nameAr:'ريال سعودي',symbol:'ر.س'},
 USD:{code:'USD',nameAr:'دولار أمريكي',symbol:'$'}
};
function getCurrencyInfo(){return CURRENCY_PROFILES[localStorage.getItem('alssaedy_currency')||'YER']||CURRENCY_PROFILES.YER;}
function setCurrency(code){
 const info=CURRENCY_PROFILES[code]||CURRENCY_PROFILES.YER;
 localStorage.setItem('alssaedy_currency',info.code);
 const select=document.getElementById('currencySelect');if(select)select.value=info.code;
 ['paidCurrencyLabel'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=info.nameAr;});
 ['totalCurrencyLabel','paidTableCurrencyLabel','balanceCurrencyLabel'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=info.symbol;}); const badge=document.getElementById('receiptCurrencyBadge');if(badge){badge.textContent=info.code;badge.setAttribute('aria-label',info.nameAr+' ('+info.code+')');}
 updateCurrencyInText(info);
}
function updateCurrencyInText(info){
 const labels=document.querySelectorAll('.currency-label');labels.forEach(el=>{el.textContent=info.symbol;});
 const paid=document.getElementById('paidCurrencyLabel');if(paid)paid.textContent=info.nameAr;
 const end=document.querySelector('.tafqeet-closing');if(end)end.textContent=info.nameAr + ' فقط لا غير.';
}
const DESIGN_CONTRACT_VERSION='1.0';
const OFFICIAL_LOGO_URL = (window.OFFICIAL_LOGO_DATA && String(window.OFFICIAL_LOGO_DATA).trim()) ? window.OFFICIAL_LOGO_DATA : 'assets/Saedy_Dental_Logo.svg';

// Protected physical-size contract. Change only after print/export regression review.
const SIZE_PROFILES = {
    a5: { label: 'A5', width: '148mm', height: '210mm', pdfFormat: 'a5', orientation: 'portrait', printSize: '148mm 210mm' },
    a4: { label: 'A4', width: '210mm', height: '297mm', pdfFormat: 'a4', orientation: 'portrait', printSize: '210mm 297mm' },
    thermal: { label: '80mm', width: '80mm', height: 'auto', pdfFormat: [80, 240], orientation: 'portrait', printSize: '80mm auto' }
};

function getSelectedSize() {
    return document.documentElement.getAttribute('data-size') || 'a5';
}

function getSizeProfile() {
    return SIZE_PROFILES[getSelectedSize()] || SIZE_PROFILES.a5;
}

function toggleDrawer(open, skipHistory=false){document.getElementById('settingsPanel').classList.toggle('open',open);if(open){pushPanelState('settings');activateAppTabVisual('settings');}else if(!skipHistory)closePanelState('settings');}

function setMode(mode) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual')?.classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital')?.classList.toggle('active', mode === 'digital');
    document.getElementById('btnModeTemplates')?.classList.toggle('active', false);
    // Manual mode is used only by the blank printable-template generator.
    // It must NEVER inherit the digital receipt date or patient/account data.
    if (mode === 'manual') {
        setPayMethod('');
        syncPaperDate('');
    } else {
        if (!document.getElementById('digDate').value) setTodayDate();
        if (!document.getElementById('digReceiptNo').value) generateNextReceiptNo();
        if (!document.getElementById('selectedPayMethod').value) setPayMethod('نقداً');
    }
    updateActionAvailability();
}

function setSize(size) {
    if (!SIZE_PROFILES[size]) return;
    document.documentElement.setAttribute('data-size', size);
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
    localStorage.setItem('alssaedy_receipt_size', size);
}

function getLogoScale(){ return Math.min(1.35, Math.max(0.75, Number(localStorage.getItem('alssaedy_logo_scale')) || 1)); }
function setLogoScale(scale){
  const safe=Math.min(1.35, Math.max(0.75, Number(scale)||1));
  document.documentElement.style.setProperty('--logo-scale', safe);
  localStorage.setItem('alssaedy_logo_scale', String(safe));
  const el=document.getElementById('logoSizeValue'); if(el) el.textContent=Math.round(safe*100)+'%';
}
function adjustLogoSize(direction){ setLogoScale(getLogoScale()+direction*0.05); }

function setReceiptFont(fontFamily) {
    document.documentElement.style.setProperty('--receipt-font-family', fontFamily);
    localStorage.setItem('alssaedy_font_family', fontFamily);
    const el=document.getElementById('fontFamilySelect'); if(el) el.value=fontFamily;
}
function setReceiptScale(scale) {
    const safe=Math.min(1.2, Math.max(0.9, Number(scale)||1));
    document.documentElement.style.setProperty('--font-scale', safe);
    document.documentElement.style.setProperty('--receipt-body-scale', safe);
    document.documentElement.style.setProperty('--receipt-heading-scale', safe);
    document.documentElement.style.setProperty('--receipt-title-scale', safe);
    localStorage.setItem('alssaedy_font_scale', String(safe));
    const el=document.getElementById('fontSizeValue'); if(el) el.textContent=Math.round(safe*100)+'%';
    updateTypographyOutputs();
}
function getTextScale(type){
    const key = type === 'heading' ? 'alssaedy_heading_scale' : type === 'title' ? 'alssaedy_title_scale' : 'alssaedy_body_scale';
    const fallback = type === 'heading' ? 1 : type === 'title' ? 1 : 1;
    return Math.min(1.2, Math.max(0.9, Number(localStorage.getItem(key)) || fallback));
}
function setReceiptTextSize(type, scale){
    const safe=Math.min(1.2, Math.max(0.9, Number(scale)||1));
    const cssVar=type === 'heading' ? '--receipt-heading-scale' : type === 'title' ? '--receipt-title-scale' : '--receipt-body-scale';
    const key=type === 'heading' ? 'alssaedy_heading_scale' : type === 'title' ? 'alssaedy_title_scale' : 'alssaedy_body_scale';
    document.documentElement.style.setProperty(cssVar, safe);
    localStorage.setItem(key, String(safe));
    updateTypographyOutputs();
}
function adjustReceiptTextSize(type,direction){
    setReceiptTextSize(type, getTextScale(type) + direction*0.05);
}
function updateTypographyOutputs(){
    const map={body:'bodyFontSizeValue',heading:'headingFontSizeValue',title:'titleFontSizeValue'};
    Object.keys(map).forEach(type=>{
        const el=document.getElementById(map[type]);
        if(el) el.textContent=Math.round(getTextScale(type)*100)+'%';
    });
}
function adjustReceiptFont(direction) {
    const current=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-scale')) || 1;
    setReceiptScale(current + direction*0.05);
}
function setReceiptColor(color) {
    if(!/^#[0-9a-fA-F]{6}$/.test(color)) return;
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--teal', color);
    localStorage.setItem('alssaedy_receipt_color', color);
    const el=document.getElementById('accentColorInput'); if(el) el.value=color;
}
function setReceiptWeight(weight) {
    const safe=weight>=800?800:700;
    document.documentElement.style.setProperty('--receipt-font-weight', String(safe));
    const receipt=document.getElementById('receiptPrintArea');
    if(receipt){
        receipt.querySelectorAll('*').forEach(el=>{
            if(!el.dataset.baseFontWeight) el.dataset.baseFontWeight=getComputedStyle(el).fontWeight;
            const base=parseInt(el.dataset.baseFontWeight,10);
            if(Number.isFinite(base) && base>=600) el.style.fontWeight=String(safe);
        });
    }
    localStorage.setItem('alssaedy_receipt_weight', String(safe));
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeClassic').classList.toggle('active', theme === 'classic');
    document.getElementById('themeModern').classList.toggle('active', theme === 'modern');
    document.getElementById('themeMono').classList.toggle('active', theme === 'mono');
    localStorage.setItem('alssaedy_theme', theme);
}

function getLocalDateISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function parseAnyDate(value) {
    // Accepts ISO (YYYY-MM-DD), D/M/Y, D-M-Y, YYYY/M/D and Arabic-Indic digits.
    // Returns {y,m,d} strings or null. Never throws.
    const normalized = String(value ?? '')
        .trim()
        .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[.\\]/g, '-');
    if (!normalized) return null;
    let m = normalized.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (m) return { y: m[1], m: m[2].padStart(2, '0'), d: m[3].padStart(2, '0') };
    m = normalized.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
    if (m) {
        let y = m[3];
        if (y.length === 2) y = (Number(y) > 50 ? '19' : '20') + y;
        return { y, m: m[2].padStart(2, '0'), d: m[1].padStart(2, '0') };
    }
    return null;
}

function syncPaperDate(dateValue) {
    const parsed = parseAnyDate(dateValue);
    const day = document.getElementById('paperDateDay');
    const month = document.getElementById('paperDateMonth');
    const yearDigits = document.getElementById('paperYearDigits');
    const yearEra = document.getElementById('paperYearEra');

    if (day) day.textContent = parsed ? parsed.d : '';
    if (month) month.textContent = parsed ? parsed.m : '';
    if (yearDigits) yearDigits.textContent = parsed ? parsed.y : '202';
    if (yearEra) yearEra.textContent = 'م';
}
function openDatePicker() {
    const picker = document.getElementById('hiddenDatePicker');
    if (!picker) return;
    const input = document.getElementById('digDate');
    if (input && /^\d{4}-\d{2}-\d{2}$/.test(input.value)) picker.value = input.value;
    try {
        if (typeof picker.showPicker === 'function') picker.showPicker();
        else { picker.focus(); picker.click(); }
    } catch (_) {
        try { picker.focus(); picker.click(); } catch (_) {}
    }
}

function updatePrintDate(value){ const el=document.getElementById('printDateValue'); if(el) el.textContent=formatReceiptDate(value||''); }
function setTodayDate() {
    const value = getLocalDateISO();
    const input = document.getElementById('digDate');
    if (input) input.value = value;
    syncPaperDate(value); updatePrintDate(value);
}

function syncReceiptDateFromInput() {
    const input = document.getElementById('digDate');
    if (input) { syncPaperDate(input.value); updatePrintDate(input.value); }
}

function generateNextReceiptNo() {
    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    const storedNext = parseInt(localStorage.getItem('alssaedy_next_receipt_number') || '1', 10);
    const maxExisting = history.reduce((max, item) => {
        const match = String(item.recNo || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextNum = Math.max(storedNext, maxExisting + 1);
    document.getElementById('digReceiptNo').value = 'REC-' + String(nextNum).padStart(3, '0');
    localStorage.setItem('alssaedy_next_receipt_number', String(nextNum + 1));
}

function clearReceiptInputs() {
    if (confirm('هل تريد تفريغ حقول السند الحالية؟')) {
        ['digReceiptNo','digClientName','digPatientPhone','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digTooth','digCustomService'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        setPayMethod(document.body.getAttribute('data-mode') === 'digital' ? 'نقداً' : '');
        document.querySelectorAll('.custom-check-item').forEach(el => el.classList.remove('active'));
        localStorage.removeItem('alssaedy_draft');
        if (typeof calculateLedger === 'function') calculateLedger();
        if (typeof toast === 'function') toast('تم تفريغ حقول السند.', 'info');
    }
}

function setPayMethod(method) {
    const safeMethod = method === 'نقداً' || method === 'محفظة / تحويل بنكي' ? method : '';
    const hidden = document.getElementById('selectedPayMethod');
    if (hidden) hidden.value = safeMethod;
    document.getElementById('optCash')?.classList.toggle('active', safeMethod === 'نقداً');
    document.getElementById('optBank')?.classList.toggle('active', safeMethod === 'محفظة / تحويل بنكي');
}

function toggleService(element) {
    element.classList.toggle('active');
}

function uploadLogo(event){
  const input=event?.target;
  const file=input?.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    const raw=String(reader.result||'');
    if(file.type==='image/svg+xml' || /\\.svg$/i.test(file.name)){
      try{localStorage.setItem('alssaedy_custom_logo',raw);applyLogo(raw);alert('تم حفظ الشعار الجديد بجودة أصلية.');}
      catch(e){alert('تعذر حفظ الشعار. اختر SVG أصغر أو صورة PNG/JPG مناسبة.');}
      if(input) input.value='';
      return;
    }
    const img=new Image();
    img.onload=()=>{
      const sourceW=img.naturalWidth||img.width||1, sourceH=img.naturalHeight||img.height||1;
      const max=1600;
      const scale=Math.min(1,max/Math.max(sourceW,sourceH));
      const width=Math.max(1,Math.round(sourceW*scale));
      const height=Math.max(1,Math.round(sourceH*scale));
      const canvas=document.createElement('canvas');
      canvas.width=width; canvas.height=height;
      const ctx=canvas.getContext('2d',{alpha:true});
      if(!ctx){alert('تعذر معالجة الشعار.');if(input)input.value='';return;}
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.clearRect(0,0,width,height);
      ctx.drawImage(img,0,0,width,height);
      let output='';
      try { output=canvas.toDataURL('image/webp',0.94); } catch (_) {}
      if(!output || output.length<100) output=canvas.toDataURL('image/png');
      try{
        localStorage.setItem('alssaedy_custom_logo',output);
        applyLogo(output);
        alert('تم حفظ الشعار الجديد بجودة عالية.');
      }catch(e){
        alert('تعذر حفظ الشعار بسبب مساحة التخزين. استخدم صورة أصغر أو SVG.');
      }
      if(input) input.value='';
    };
    img.onerror=()=>alert('صيغة الشعار غير مدعومة. اختر PNG أو JPG أو SVG.');
    img.src=raw;
  };
  reader.readAsDataURL(file);
}
function applyLogo(url) {
    document.getElementById('clinicLogoImg').src = url;
    document.getElementById('watermarkLayer').style.backgroundImage = "url('" + url + "')";
}

function resetOfficialLogo() {
    localStorage.removeItem('alssaedy_custom_logo');
    const uploader=document.getElementById('logoUploader');
    if(uploader) uploader.value='';
    applyLogo(OFFICIAL_LOGO_URL);
    alert('تمت استعادة الشعار الرسمي المعتمد للعيادة بنجاح.');
}

function toggleWatermark() {
    document.body.classList.toggle('hide-watermark');
    localStorage.setItem('alssaedy_watermark', document.body.classList.contains('hide-watermark') ? 'off' : 'on');
}

let isEditing = false;
function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.innerText = isEditing ? '💾 حفظ التعديلات' : '✏️ تفعيل التعديل المباشر';
    btn.style.background = isEditing ? '#10b981' : '#f59e0b';
    document.querySelectorAll('.editable').forEach(el => {
        el.setAttribute('contenteditable', isEditing ? 'true' : 'false');
    });
    if (!isEditing) {
        const data = {};
        document.querySelectorAll('.editable').forEach(el => { data[el.dataset.key] = el.innerText.trim(); });
        localStorage.setItem('alssaedy_texts', JSON.stringify(data));
    }
}

function updateActionAvailability() {
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.disabled = document.body.getAttribute('data-mode') === 'manual';
        saveBtn.title = saveBtn.disabled ? 'الحفظ متاح للسند الرقمي فقط' : 'حفظ بالسجل';
    }
}

let activeAppTab='receipt';
function activateAppTab(tab){ activeAppTab=tab; ['receipt','patients','history','settings'].forEach(t=>document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1))?.classList.toggle('active',t===tab)); if(tab==='receipt'){closePatientsModal(true);closeHistoryModal(true);toggleDrawer(false,true);window.scrollTo({top:0,behavior:'smooth'});} if(tab==='patients')openPatientsModal(); if(tab==='history')openHistoryModal(); if(tab==='settings')toggleDrawer(true); }
function activateAppTabVisual(tab){ ['receipt','patients','history','settings'].forEach(t=>document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1))?.classList.toggle('active',t===tab)); }
function pushPanelState(name){ if(history.state?.alssaedyPanel===name)return; history.pushState({alssaedyPanel:name},'', '#'+name); }
function closePanelState(name){ if(history.state?.alssaedyPanel===name){history.back();return true;} return false; }
window.addEventListener('popstate',(e)=>{ const panel=e.state?.alssaedyPanel||''; if(panel==='patients'){document.getElementById('patientsModal')?.classList.add('open');showPatientListView();activateAppTabVisual('patients');} else if(panel==='patient-detail'){document.getElementById('patientsModal')?.classList.add('open');showPatientDetailView();activateAppTabVisual('patients');} else if(panel==='history'){document.getElementById('historyModal')?.classList.add('open');activateAppTabVisual('history');} else if(panel==='settings'){document.getElementById('settingsPanel')?.classList.add('open');activateAppTabVisual('settings');} else {document.getElementById('patientsModal')?.classList.remove('open');document.getElementById('historyModal')?.classList.remove('open');document.getElementById('settingsPanel')?.classList.remove('open');document.getElementById('shareModal')?.classList.remove('open');showPatientListView();activateAppTabVisual('receipt');} });
function openShareModal(){document.getElementById('shareModal').classList.add('open');}
function closeShareModal(){document.getElementById('shareModal').classList.remove('open');}
function openHistoryModal(){renderHistory();document.getElementById('historyModal').classList.add('open');pushPanelState('history');activateAppTabVisual('history');}
function closeHistoryModal(skipHistory=false){document.getElementById('historyModal').classList.remove('open');if(!skipHistory)closePanelState('history');}
function showPatientListView(){document.querySelector('.patient-form')?.classList.remove('patient-detail-hidden');document.querySelector('.patients-list-title')?.classList.remove('patient-detail-hidden');document.getElementById('patientsList')?.classList.remove('patient-detail-hidden');document.getElementById('patientAccountPanel')?.setAttribute('hidden','');}
function showPatientDetailView(){document.querySelector('.patient-form')?.classList.add('patient-detail-hidden');document.querySelector('.patients-list-title')?.classList.add('patient-detail-hidden');document.getElementById('patientsList')?.classList.add('patient-detail-hidden');document.getElementById('patientAccountPanel')?.removeAttribute('hidden');}

window.addEventListener('DOMContentLoaded', () => {
    const datePicker = document.getElementById('hiddenDatePicker');
    const dateInput = document.getElementById('digDate');
    if (datePicker && dateInput) {
        datePicker.addEventListener('change', () => {
            dateInput.value = datePicker.value || '';
            syncReceiptDateFromInput();
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }
    const customLogo=localStorage.getItem('alssaedy_custom_logo');
    applyLogo(customLogo||OFFICIAL_LOGO_URL);
    setCurrency(localStorage.getItem('alssaedy_currency')||'YER');

    const savedTexts = localStorage.getItem('alssaedy_texts');
    if (savedTexts) {
        try {
            const data = JSON.parse(savedTexts);
            document.querySelectorAll('.editable').forEach(el => {
                if (data[el.dataset.key]) el.innerText = data[el.dataset.key];
            });
        } catch(e) {}
    }

    const savedFont = localStorage.getItem('alssaedy_font_family');
    if (savedFont) setReceiptFont(savedFont);
    setReceiptScale(localStorage.getItem('alssaedy_font_scale') || 1);
    setLogoScale(localStorage.getItem('alssaedy_logo_scale') || 1);
    setReceiptTextSize('body', localStorage.getItem('alssaedy_body_scale') || 1);
    setReceiptTextSize('heading', localStorage.getItem('alssaedy_heading_scale') || 1);
    setReceiptTextSize('title', localStorage.getItem('alssaedy_title_scale') || 1);
    const savedColor = localStorage.getItem('alssaedy_receipt_color');
    if (savedColor) setReceiptColor(savedColor);
    const savedWeight = localStorage.getItem('alssaedy_receipt_weight');
    if (savedWeight) setReceiptWeight(savedWeight);

    const savedSize = localStorage.getItem('alssaedy_receipt_size');
    setSize(SIZE_PROFILES[savedSize] ? savedSize : 'a5');
    const savedTheme = localStorage.getItem('alssaedy_theme');
    if (savedTheme) setTheme(savedTheme);
    if (localStorage.getItem('alssaedy_watermark') === 'off') document.body.classList.add('hide-watermark');

    // Digital receipt is the primary/default workflow.
    // The paper template is generated separately and starts completely blank.
    syncPaperDate('');
    setMode('digital');
    const dateInput = document.getElementById('digDate');
    if (dateInput) dateInput.addEventListener('input', syncReceiptDateFromInput);
    updatePrintDate(dateInput?.value||'');
    hydrateDurableReceipts().then(()=>updateHistoryCount()).catch(()=>updateHistoryCount());
    updateActionAvailability();
});