
const CURRENCY_PROFILES={
 YER:{code:'YER',nameAr:'ريال يمني',symbol:'ر.ي'},
 SAR:{code:'SAR',nameAr:'ريال سعودي',symbol:'ر.س'},
 USD:{code:'USD',nameAr:'دولار أمريكي',symbol:'$'}
};
function getCurrencyInfo(){const code=clinicRepositoryGetSettingSync('currency')||localStorage.getItem('alssaedy_currency')||'YER';return CURRENCY_PROFILES[code]||CURRENCY_PROFILES.YER;}
function setCurrency(code){
 const info=CURRENCY_PROFILES[code]||CURRENCY_PROFILES.YER;
 clinicRepositoryPutSetting('currency',info.code).catch(()=>{});
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
async function saveLogoDurably(value){ return clinicRepositoryPutSetting('customLogo',value||''); }
function loadLogoDurably(){ return Promise.resolve(clinicRepositoryGetSettingSync('customLogo')); }

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

function syncPrintPageSize(size) {
    const profile = SIZE_PROFILES[size] || SIZE_PROFILES.a5;
    let style = document.getElementById('dynamicPrintPageSize');
    if (!style) {
        style = document.createElement('style');
        style.id = 'dynamicPrintPageSize';
        document.head.appendChild(style);
    }
    style.textContent = '@page{size:'+profile.printSize+';margin:0!important}';
}

function setSize(size) {
    if (!SIZE_PROFILES[size]) return;
    document.documentElement.setAttribute('data-size', size);
    syncPrintPageSize(size);
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
    clinicRepositoryPutSetting('receiptSize', size).catch(()=>{});
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
    // Common numeric forms: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD,
    // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY, DD MM YYYY, with Arabic/Persian digits.
    const normalized = String(value ?? '')
        .trim()
        .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[./\\]/g, '-')
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-');
    if (!normalized) return null;

    const valid = (y, m, d) => {
        const year = Number(y), month = Number(m), day = Number(d);
        if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1) return null;
        const probe = new Date(year, month - 1, day);
        if (probe.getFullYear() !== year || probe.getMonth() !== month - 1 || probe.getDate() !== day) return null;
        return { y: String(year).padStart(4, '0'), m: String(month).padStart(2, '0'), d: String(day).padStart(2, '0') };
    };

    let m = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return valid(m[1], m[2], m[3]);

    m = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (m) {
        let y = m[3];
        if (y.length === 2) y = (Number(y) > 50 ? '19' : '20') + y;
        return valid(y, m[2], m[1]);
    }
    return null;
}

function getPaperTemplateDateValue() {
    return document.getElementById('paperTemplateDate')?.value?.trim() || '';
}

function syncPaperDate(dateValue) {
    const parsed = parseAnyDate(dateValue);
    const day = document.getElementById('paperDateDay');
    const month = document.getElementById('paperDateMonth');
    const yearDigits = document.getElementById('paperYearDigits');
    const yearEra = document.getElementById('paperYearEra');

    if (day) day.textContent = parsed ? parsed.d : '';
    if (month) month.textContent = parsed ? parsed.m : '';
    if (yearDigits) yearDigits.textContent = parsed ? parsed.y : String(new Date().getFullYear());
    if (yearEra) yearEra.textContent = 'م';
}

function setPaperTemplateDate(value) {
    const input = document.getElementById('paperTemplateDate');
    if (input && input.value !== String(value ?? '')) input.value = String(value ?? '');
    syncPaperDate(value);
}

function setPaperTemplateToday() {
    setPaperTemplateDate(getLocalDateISO());
}

function clearPaperTemplateDate() {
    setPaperTemplateDate('');
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
    const history = typeof safeHistory === 'function' ? safeHistory() : [];
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
    if (typeof updateReceiptIssuancePanel === 'function') updateReceiptIssuancePanel();
}

function toggleService(element) {
    element.classList.toggle('active');
    if (typeof updateReceiptIssuancePanel === 'function') updateReceiptIssuancePanel();
}


async function uploadLogo(event){
  const input=event?.target, file=input?.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=async()=>{
    try{
      const raw=String(reader.result||'');
      let output=raw;
      if(file.type!=='image/svg+xml' && !/\.svg$/i.test(file.name)){
        const img=new Image();
        await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=raw;});
        const w=img.naturalWidth||img.width||1, h=img.naturalHeight||img.height||1, max=4096;
        if(Math.max(w,h)>max){
          const scale=max/Math.max(w,h), canvas=document.createElement('canvas');
          canvas.width=Math.round(w*scale); canvas.height=Math.round(h*scale);
          const ctx=canvas.getContext('2d',{alpha:true});
          ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          output=file.type==='image/jpeg' ? canvas.toDataURL('image/jpeg',0.98) : canvas.toDataURL('image/png');
        }
      }
      await saveLogoDurably(output); applyLogo(output);
      if(typeof toast==='function')toast('تم حفظ الشعار بجودة عالية.');else alert('تم حفظ الشعار بجودة عالية.');
    }catch(e){alert('تعذر حفظ الشعار: '+(e?.message||'خطأ غير معروف'));}finally{if(input)input.value='';}
  };
  reader.readAsDataURL(file);
}
function applyLogo(url){
  const safe=String(url||OFFICIAL_LOGO_URL), img=document.getElementById('clinicLogoImg'), wm=document.getElementById('watermarkLayer');
  if(img){img.src=safe;img.removeAttribute('width');img.removeAttribute('height');img.style.aspectRatio='1 / 1';img.style.objectFit='contain';img.style.objectPosition='center';}
  if(wm)wm.style.backgroundImage='url('+JSON.stringify(safe)+')';
}
function resetOfficialLogo(){
  clinicRepositoryDeleteSetting('customLogo').catch(()=>{});
  const uploader=document.getElementById('logoUploader');if(uploader)uploader.value='';
  applyLogo(OFFICIAL_LOGO_URL);
  if(typeof toast==='function')toast('تمت استعادة الشعار الرسمي.');else alert('تمت استعادة الشعار الرسمي.');
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
        clinicRepositoryPutSetting('receiptTexts', JSON.stringify(data)).catch(()=>{});
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
let appRoute={screen:'platform-home',patientId:'',productId:'',instanceId:''};
let aqsa7PlatformRoute='home';
const AQSA7_DENTAL_PRODUCT_ID='dental-clinic';

function getAQSA7InstanceIdentitySafe(){
  try{return typeof aqsa7GetInstanceIdentity==='function'?aqsa7GetInstanceIdentity():{productId:AQSA7_DENTAL_PRODUCT_ID,tenantId:'alssaedy-clinic',instanceId:'alssaedy-clinic-sana-a'};}
  catch(_){return {productId:AQSA7_DENTAL_PRODUCT_ID,tenantId:'alssaedy-clinic',instanceId:'alssaedy-clinic-sana-a'};}
}
function setPlatformVisual(route){
  const home=document.getElementById('platformHome'), products=document.getElementById('platformProducts'), workspace=document.getElementById('productWorkspace');
  const context=document.getElementById('aqsa7ProductContext'), dentalTabs=document.getElementById('dentalProductTabs');
  const isProduct=route==='dental';
  if(home) home.hidden=route!=='home';
  if(products) products.hidden=route!=='products';
  if(workspace) workspace.hidden=!isProduct;
  if(context) context.hidden=!isProduct;
  if(dentalTabs) dentalTabs.hidden=!isProduct;
  document.getElementById('tabPlatformHome')?.classList.toggle('active',route==='home');
  document.getElementById('tabPlatformProducts')?.classList.toggle('active',route==='products');
  const badge=document.getElementById('platformContextBadge');
  const title=document.getElementById('platformBrandTitle');
  if(isProduct){
    if(badge) badge.textContent='Dental Clinic';
    if(title) title.textContent='ALSSAEDY CLINIC';
  }else{
    if(badge) badge.textContent='Platform';
    if(title) title.textContent='منصة AQSA7';
  }
}
function setAQSA7Route(route, push=true){
  const identity=getAQSA7InstanceIdentitySafe();
  aqsa7PlatformRoute=route;
  if(route==='dental'){
    appRoute={screen:'product',patientId:'',productId:identity.productId,instanceId:identity.instanceId};
  }else{
    appRoute={screen:route==='products'?'platform-products':'platform-home',patientId:'',productId:'',instanceId:''};
  }
  setPlatformVisual(route);
  const hash=route==='home'?'#platform':route==='products'?'#products':'#product-dental-clinic';
  if(push && location.hash!==hash) history.pushState({aqsa7Route:route},'',hash);
}
function navigatePlatform(route){
  if(route==='dental'){openConfiguredDentalProduct();return;}
  setAQSA7Route(route,true);
  if(route!=='dental'){
    closeAllAppPanels();
    window.scrollTo({top:0,behavior:'smooth'});
  }
}
function openConfiguredDentalProduct(){
  const identity=getAQSA7InstanceIdentitySafe();
  if(identity.productId!==AQSA7_DENTAL_PRODUCT_ID){toast?.('المنتج المكوّن غير متاح حالياً.','error');return;}
  setAQSA7Route('dental',true);
  activeAppTab='receipt';
  activateAppTabVisual('receipt');
  if(!document.getElementById('digDate')?.value) setTodayDate();
  if(!document.getElementById('digReceiptNo')?.value) generateNextReceiptNo();
  if(!document.getElementById('selectedPayMethod')?.value) setPayMethod('نقداً');
  window.scrollTo({top:0,behavior:'smooth'});
}
function activateAppTab(tab){
  if(aqsa7PlatformRoute!=='dental') openConfiguredDentalProduct();
  if(tab==='receipt'){
    activeAppTab='receipt'; appRoute={screen:'product',patientId:'',productId:AQSA7_DENTAL_PRODUCT_ID,instanceId:getAQSA7InstanceIdentitySafe().instanceId};
    closePatientsModal(true);closeHistoryModal(true);toggleDrawer(false,true);activateAppTabVisual('receipt');window.scrollTo({top:0,behavior:'smooth'});return;
  }
  if(tab==='patients'){openPatientsModal();return;}
  if(tab==='history'){openHistoryModal();return;}
  if(tab==='settings'){toggleDrawer(true);return;}
}
function activateAppTabVisual(tab){
  ['receipt','patients','history','settings'].forEach(t=>{
    const button=document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1));
    if(!button)return;
    const active=t===tab;
    button.classList.toggle('active',active);
    if(active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
}
function pushPanelState(name){
  if(history.state?.alssaedyPanel===name)return;
  history.pushState({alssaedyPanel:name,aqsa7Route:'dental'},'', '#product-dental-clinic/'+name);
}
function closePanelState(name){if(history.state?.alssaedyPanel===name){history.back();return true;}return false;}
function closeAllAppPanels(){
  document.getElementById('patientsModal')?.classList.remove('open');
  document.getElementById('historyModal')?.classList.remove('open');
  document.getElementById('settingsPanel')?.classList.remove('open');
  document.getElementById('shareModal')?.classList.remove('open');
  document.getElementById('templateModal')?.classList.remove('open');
  document.getElementById('previewModal')?.classList.remove('open');
  showPatientListView();activateAppTabVisual('receipt');
}
window.addEventListener('popstate',(e)=>{
  const panel=e.state?.alssaedyPanel||'';
  if(panel==='patients'){setAQSA7Route('dental',false);appRoute={screen:'patients',patientId:''};document.getElementById('patientsModal')?.classList.add('open');showPatientListView();activateAppTabVisual('patients');return;}
  if(panel==='patient-detail'){setAQSA7Route('dental',false);appRoute={screen:'patient-detail',patientId:window.currentPatientId||''};document.getElementById('patientsModal')?.classList.add('open');showPatientDetailView();activateAppTabVisual('patients');return;}
  if(panel==='history'){setAQSA7Route('dental',false);document.getElementById('historyModal')?.classList.add('open');activateAppTabVisual('history');return;}
  if(panel==='settings'){setAQSA7Route('dental',false);document.getElementById('settingsPanel')?.classList.add('open');activateAppTabVisual('settings');return;}
  const hash=location.hash;
  if(hash==='#products'){setAQSA7Route('products',false);return;}
  if(hash==='#product-dental-clinic'){setAQSA7Route('dental',false);return;}
  setAQSA7Route('home',false);
});
function openShareModal(){document.getElementById('shareModal').classList.add('open');}
function closeShareModal(){document.getElementById('shareModal').classList.remove('open');}
function openHistoryModal(skipHistory=false){renderHistory();document.getElementById('historyModal')?.classList.add('open');activateAppTabVisual('history');appRoute={screen:'history',patientId:'',productId:AQSA7_DENTAL_PRODUCT_ID,instanceId:getAQSA7InstanceIdentitySafe().instanceId};if(!skipHistory)pushPanelState('history');}
function closeHistoryModal(skipHistory=false){document.getElementById('historyModal')?.classList.remove('open');if(!skipHistory)closePanelState('history');if(appRoute.screen==='history')appRoute={screen:'product',patientId:'',productId:AQSA7_DENTAL_PRODUCT_ID,instanceId:getAQSA7InstanceIdentitySafe().instanceId};}
function showPatientListView(){const form=document.querySelector('.patient-form');form?.classList.remove('patient-detail-hidden','patient-detail-edit-open');document.querySelector('.patients-list-title')?.classList.remove('patient-detail-hidden');document.getElementById('patientsList')?.classList.remove('patient-detail-hidden');document.getElementById('patientAccountPanel')?.setAttribute('hidden','');}
function showPatientDetailView(){const form=document.querySelector('.patient-form');form?.classList.add('patient-detail-hidden');form?.classList.remove('patient-detail-edit-open');document.querySelector('.patients-list-title')?.classList.add('patient-detail-hidden');document.getElementById('patientsList')?.classList.add('patient-detail-hidden');document.getElementById('patientAccountPanel')?.removeAttribute('hidden');}

window.addEventListener('DOMContentLoaded', async () => {
    const datePicker = document.getElementById('hiddenDatePicker');
    const dateInput = document.getElementById('digDate');
    if (dateInput) {
        dateInput.addEventListener('input', syncReceiptDateFromInput);
        dateInput.addEventListener('change', syncReceiptDateFromInput);
    }
    if (datePicker && dateInput) {
        datePicker.addEventListener('change', () => {
            dateInput.value = datePicker.value || '';
            syncReceiptDateFromInput();
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }
    await hydrateDurableReceipts();
    const durableSettings = clinicRepositoryGetSettingsSync();
    applyLogo(durableSettings.customLogo || OFFICIAL_LOGO_URL);
    setCurrency(durableSettings.currency || 'YER');

    const savedTexts = durableSettings.receiptTexts || '';
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

    const savedSize = durableSettings.receiptSize || '';
    setSize(SIZE_PROFILES[savedSize] ? savedSize : 'a5');
    const savedTheme = localStorage.getItem('alssaedy_theme');
    if (savedTheme) setTheme(savedTheme);
    if (localStorage.getItem('alssaedy_watermark') === 'off') document.body.classList.add('hide-watermark');

    // Digital receipt is the primary/default workflow.
    // The paper template is generated separately and starts completely blank.
    syncPaperDate('');
    setMode('digital');
    updateHistoryCount();
    updateActionAvailability();
});