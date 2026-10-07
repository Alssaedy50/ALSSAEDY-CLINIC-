/* Durable local store: IndexedDB with localStorage compatibility mirror. */
const CLINIC_DB_NAME='ALSSAEDY_CLINIC_DB';
const CLINIC_DB_VERSION=2;
function clinicDBOpen(){
  if(window.__clinicDBPromise)return window.__clinicDBPromise;
  window.__clinicDBPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(CLINIC_DB_NAME,CLINIC_DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;['receipts','patients','settings'].forEach(s=>{if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:'id'});});};
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  }); return window.__clinicDBPromise;
}
async function clinicDBAll(store){const db=await clinicDBOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly');const q=tx.objectStore(store).getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>reject(q.error);});}
async function clinicDBPut(store,item){const db=await clinicDBOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(item);tx.oncomplete=()=>resolve(item);tx.onerror=()=>reject(tx.error);});}
async function clinicDBDelete(store,id){const db=await clinicDBOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
async function clinicDBClear(store){const db=await clinicDBOpen();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
async function hydrateDurableReceipts(){
  try{
    const durable=await clinicDBAll('receipts');
    const legacy=safeHistory();
    if(!durable.length && legacy.length){for(const item of legacy)await clinicDBPut('receipts',item);}
    const merged=await clinicDBAll('receipts');
    if(merged.length)localStorage.setItem('alssaedy_receipts_history',JSON.stringify(merged));
  }catch(e){}
}
function safeHistory() {
    try {
        const parsed = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[char]));
}

function getSelectedServices() {
    return Array.from(document.querySelectorAll('.custom-check-item.active'))
        .map(item => item.querySelector('.check-mark') ? item.innerText.replace('✓', '').trim() : item.innerText.trim());
}

function collectReceiptData() {
    const paid=Math.max(0,Number.parseFloat(document.getElementById('digPaid').value)||0);
    const total=Math.max(0,Number.parseFloat(document.getElementById('digTotal').value)||0);
    const currency=typeof getCurrencyInfo==='function'?getCurrencyInfo():{code:'YER',nameAr:'ريال يمني',symbol:'ر.ي'};
    return {
        id:window.crypto?.randomUUID?window.crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2),
        recNo:document.getElementById('digReceiptNo').value.trim(),
        date:document.getElementById('digDate').value||getLocalDateISO(),
        name:document.getElementById('digClientName').value.trim()||'مريض بدون اسم',
        patientPhone:document.getElementById('digPatientPhone')?.value.trim()||'',
        patientId:window.currentPatientId||'',
        paid:String(paid),total:String(total),
        balance:String(Math.max(0,total-paid)),change:String(Math.max(0,paid-total)),
        tooth:document.getElementById('digTooth').value.trim(),
        customService:document.getElementById('digCustomService')?.value.trim()||'',
        tafqeet:document.getElementById('digTafqeet').value.trim(),
        payMethod:document.getElementById('selectedPayMethod').value||'نقداً',
        ref:document.getElementById('digRef').value.trim(),
        services:[...getSelectedServices(), ...(document.getElementById('digCustomService')?.value.trim() ? [document.getElementById('digCustomService').value.trim()] : [])].filter((v,i,a)=>a.indexOf(v)===i),mode:'digital',size:getSelectedSize(),
        currency:currency.code,currencyName:currency.nameAr,currencySymbol:currency.symbol
    };
}
function receiptFingerprint(item){
    return JSON.stringify([item.recNo,item.date,item.name,item.patientPhone,item.patientId,item.paid,item.total,item.balance,item.change,item.tooth,item.customService,item.tafqeet,item.payMethod,item.ref,(item.services||[]).slice().sort(),item.currency]);
}

function saveReceiptLocally(){
  if(document.body.getAttribute('data-mode')!=='digital'){alert('الحفظ متاح للسند الرقمي فقط.');return;}
  if(!document.getElementById('digReceiptNo').value)generateNextReceiptNo();
  const data=collectReceiptData();
  if(Number(data.paid)<0||Number(data.total)<0){alert('لا يمكن إدخال مبالغ سالبة.');return;}
  const history=safeHistory();
  const fp=receiptFingerprint(data);
  if(history.some(item=>receiptFingerprint(item)===fp)){
    alert('⚠️ هذا السند مطابق تماماً لسند محفوظ سابقاً. تم رفض الحفظ المكرر.');
    return;
  }
  const numberDuplicate=history.some(item=>String(item.recNo)===String(data.recNo));
  if(numberDuplicate){alert('⚠️ رقم السند مستخدم بالفعل. تم رفض الحفظ لتجنب إنشاء سند مكرر.');return;}
  history.unshift(data);
  localStorage.setItem('alssaedy_receipts_history',JSON.stringify(history));
  clinicDBPut('receipts',data).then(()=>clinicDBAll('receipts').then(all=>localStorage.setItem('alssaedy_receipts_history',JSON.stringify(all)))).catch(()=>{});
  if(typeof upsertCurrentPatient==='function')upsertCurrentPatient(data);
  updateHistoryCount();
  alert('تم حفظ السند بنجاح في السجل الدائم.');
}

function getAllReceiptHistory() {
    return safeHistory().slice();
}

function csvEscape(value) {
    const text = String(value ?? '');
    return '"' + text.replace(/"/g, '""') + '"';
}

function buildTransactionsExport(format) {
    const history = getAllReceiptHistory();
    const exportedAt = new Date().toISOString();
    const clinic = 'ALSSAEDY CLINIC FOR DENTISTRY';

    if (format === 'csv') {
        const headers = [
            'ID','Receipt No','Date','Patient Name','Patient Phone','Paid',
            'Total','Balance','Change','Tooth / Location','Amount in Words',
            'Payment Method','Reference','Services','Mode','Size','Exported At'
        ];
        const rows = history.map(item => [
            item.id,item.recNo,item.date,item.name,item.patientPhone,item.paid,
            item.total,item.balance,item.change,item.tooth,item.tafqeet,
            item.payMethod,item.ref,Array.isArray(item.services) ? item.services.join(' | ') : '',
            item.mode,item.size,exportedAt
        ]);
        // UTF-8 BOM makes Arabic display correctly in Excel and mobile spreadsheet apps.
        return '\uFEFF' + [headers, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
    }

    return JSON.stringify({
        schema: 'ALSSAEDY_CLINIC_TRANSACTIONS',
        schemaVersion: 1,
        clinic,
        exportedAt,
        count: history.length,
        receipts: history
    }, null, 2);
}

function downloadTextFile(filename, content, mimeType) {
    if (window.Android && typeof Android.saveTransactionsFile === 'function') {
        Android.saveTransactionsFile(content, filename, mimeType);
        return;
    }
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportTransactionsFile(format) {
    const history = getAllReceiptHistory();
    if (!history.length) {
        alert('لا توجد سندات محفوظة لتصديرها حتى الآن.');
        return;
    }
    const stamp = getLocalDateISO().replace(/-/g, '');
    if (format === 'csv') {
        downloadTextFile(
            'ALSSAEDY_Clinic_Transactions_' + stamp + '.csv',
            buildTransactionsExport('csv'),
            'text/csv'
        );
        alert('تم تجهيز ملف سجل المعاملات بصيغة CSV.');
        return;
    }
    downloadTextFile(
        'ALSSAEDY_Clinic_Transactions_' + stamp + '.json',
        buildTransactionsExport('json'),
        'application/json'
    );
    alert('تم تجهيز النسخة الاحتياطية الكاملة للسندات بصيغة JSON.');
}

function getTransactionsSummary() {
    const history = getAllReceiptHistory();
    const totalPaid = history.reduce((sum, item) => sum + (Number(item.paid) || 0), 0);
    return { count: history.length, totalPaid };
}

function updateHistoryCount() {
    const badge = document.getElementById('historyCount');
    if (badge) badge.innerText = safeHistory().length;
}

function renderHistory() {
    const history = safeHistory();
    const container = document.getElementById('historyList');
    if (!container) return;
    if (!history.length) {
        container.innerHTML = '<p style="text-align:center; padding:15px; color:#64748b; font-size:11px;">لا توجد سندات محفوظة حتى الآن.</p>';
        return;
    }
    container.innerHTML = history.map(item => {
        const name = escapeHTML(item.name || 'مريض بدون اسم');
        const recNo = escapeHTML(item.recNo || '---');
        const date = escapeHTML(item.date || '---');
        const paid = escapeHTML(item.paid || '0');
        const balance = escapeHTML(item.balance || '0');
        return '<div class="history-entry"><div><strong>' + name + ' (' + recNo + ')</strong><small>التاريخ: ' + date + ' | المدفوع: ' + paid + ' ريال | المتبقي: ' + balance + ' ريال</small></div><div class="history-entry-btns"><button type="button" onclick="loadReceipt(' + Number(item.id) + ')">📥 استرجاع</button><button type="button" onclick="deleteReceipt(' + Number(item.id) + ')" style="color:#b91c1c;">✕</button></div></div>';
    }).join('');
}

function loadReceipt(id) {
    const item = safeHistory().find(r => String(r.id) === String(id));
    if (!item) return;
    setMode('digital');
    document.getElementById('digReceiptNo').value = item.recNo || '';
    document.getElementById('digDate').value = item.date || getLocalDateISO();
    document.getElementById('digClientName').value = item.name || '';
    document.getElementById('digPatientPhone').value = item.patientPhone || '';
    document.getElementById('digPaid').value = item.paid || '';
    document.getElementById('digTotal').value = item.total || '';
    document.getElementById('digTooth').value = item.tooth || '';
    if(document.getElementById('digCustomService'))document.getElementById('digCustomService').value=item.customService||'';
    document.getElementById('digTafqeet').value = item.tafqeet || '';
    document.getElementById('digRef').value = item.ref || '';
    if (typeof setCurrency === 'function') setCurrency(item.currency || 'YER');
    window.currentPatientId = item.patientId || '';
    setPayMethod(item.payMethod || 'نقداً');
    document.querySelectorAll('.custom-check-item').forEach((el, index) => {
        const label = el.innerText.replace('✓', '').trim();
        el.classList.toggle('active', Array.isArray(item.services) && item.services.includes(label));
    });
    if (item.size && typeof setSize === 'function') setSize(item.size);
    calculateLedger();
    closeHistoryModal();
}

function deleteReceipt(id) {
    const history = safeHistory().filter(r => String(r.id) !== String(id));
    localStorage.setItem('alssaedy_receipts_history', JSON.stringify(history));
    clinicDBDelete('receipts', id).catch(()=>{});
    renderHistory();
    updateHistoryCount();
}

function clearAllHistory() {
    if (confirm('هل أنت متأكد من حذف كامل سجل السندات؟')) {
        localStorage.removeItem('alssaedy_receipts_history');
        clinicDBClear('receipts').catch(()=>{});
        renderHistory();
        updateHistoryCount();
    }
}
let currentPatientId='';

function patientId(){
  return (window.currentPatientId||'').trim();
}
async function getPatients(){
  try{return await clinicDBAll('patients');}
  catch(e){return JSON.parse(localStorage.getItem('alssaedy_patients')||'[]');}
}
function patientFormValue(id){return document.getElementById(id)?.value?.trim()||'';}

async function upsertCurrentPatient(receipt){
  const name=(receipt.name||'').trim(), phone=(receipt.patientPhone||'').trim();
  if(!name||name==='مريض بدون اسم')return null;
  const list=await getPatients();
  let p=list.find(x=>receipt.patientId&&x.id===receipt.patientId)
      ||list.find(x=>phone&&x.phone===phone)
      ||list.find(x=>x.name===name&&(!phone||x.phone===phone));
  if(!p)p={id:(window.crypto?.randomUUID?window.crypto.randomUUID():'P-'+Date.now()),name,phone,gender:'',age:'',medicalHistory:'',problem:'',createdAt:new Date().toISOString(),nextVisit:'',notes:'',visits:[]};
  p.name=name;p.phone=phone;p.lastVisit=receipt.date;p.updatedAt=new Date().toISOString();
  if(!Array.isArray(p.visits))p.visits=[];
  if(!p.visits.some(v=>v.receiptId===receipt.id))p.visits.push({receiptId:receipt.id,date:receipt.date,total:receipt.total,paid:receipt.paid,currency:receipt.currency,services:receipt.services||[],tooth:receipt.tooth||''});
  await clinicDBPut('patients',p);
  localStorage.setItem('alssaedy_patients',JSON.stringify(await clinicDBAll('patients')));
  currentPatientId=p.id; window.currentPatientId=p.id;
  return p;
}

async function savePatientManual(){
  const name=patientFormValue('patientFormName');
  const gender=patientFormValue('patientFormGender');
  const age=patientFormValue('patientFormAge');
  const phone=patientFormValue('patientFormPhone');
  const nextVisit=patientFormValue('patientFormVisit');
  const problem=patientFormValue('patientFormProblem');
  const medicalHistory=patientFormValue('patientFormHistory');
  const notes=patientFormValue('patientFormNotes');
  const existingId=patientFormValue('patientFormId');
  if(!name){alert('أدخل اسم المريض أولاً.');return;}
  if(!gender){alert('اختر جنس المريض.');return;}
  const list=await getPatients();
  let p=list.find(x=>x.id===existingId)||list.find(x=>phone&&x.phone===phone);
  if(!p)p={id:(window.crypto?.randomUUID?window.crypto.randomUUID():'P-'+Date.now()),createdAt:new Date().toISOString(),visits:[]};
  p.name=name;p.gender=gender;p.age=age;p.phone=phone;p.nextVisit=nextVisit;
  p.problem=problem;p.medicalHistory=medicalHistory;p.notes=notes;p.updatedAt=new Date().toISOString();
  await clinicDBPut('patients',p);
  localStorage.setItem('alssaedy_patients',JSON.stringify(await clinicDBAll('patients')));
  currentPatientId=p.id;window.currentPatientId=p.id;
  renderPatients();renderPatientAccount(p);
  schedulePatientReminder(p);
  alert('تم حفظ ملف المريض وتحديث حسابه الطبي والمالي.');
}

function schedulePatientReminder(p){
  if(!p?.nextVisit||!window.Android||typeof Android.scheduleReminder!=='function')return;
  const parts=String(p.nextVisit).split('-').map(Number);
  if(parts.length!==3)return;
  const when=new Date(parts[0],parts[1]-1,parts[2],9,0,0,0).getTime();
  if(when>Date.now())Android.scheduleReminder(when,'موعد عودة المريض: '+p.name,'لديك موعد متابعة مسجل في عيادة السعيدي.');
}

function patientReceipts(p){
  const receipts=safeHistory();
  return receipts.filter(r=>r.patientId===p.id||(p.phone&&r.patientPhone===p.phone));
}
function patientFinancialSummary(p){
  const rs=patientReceipts(p);
  return {
    receipts:rs,
    total:rs.reduce((s,r)=>s+(Number(r.total)||0),0),
    paid:rs.reduce((s,r)=>s+(Number(r.paid)||0),0),
    balance:rs.reduce((s,r)=>s+(Number(r.balance)||0),0)
  };
}

async function renderPatients(){
  const box=document.getElementById('patientsList');if(!box)return;
  const list=await getPatients();
  if(!list.length){box.innerHTML='<div class="empty-state">لا توجد ملفات مرضى بعد.</div>';return;}
  box.innerHTML=list.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).map(p=>{
    const f=patientFinancialSummary(p),cur=f.receipts[0]?.currencyName||'ريال يمني';
    return '<div class="patient-card"><div><strong>'+escapeHTML(p.name)+'</strong><small>'+escapeHTML((p.gender||'—')+' • '+(p.age||'—')+' سنة • '+(p.phone||'بدون هاتف'))+'</small><small>المشكلة: '+escapeHTML(p.problem||'غير مسجلة')+'</small></div><div class="patient-balance">'+f.balance.toLocaleString()+' '+escapeHTML(cur)+'</div><div class="patient-list-actions"><button type="button" onclick="selectPatient(\''+p.id+'\')">فتح الحساب</button></div></div>';
  }).join('');
}

async function selectPatient(id){
  const list=await getPatients(),p=list.find(x=>x.id===id);if(!p)return;
  currentPatientId=p.id;window.currentPatientId=p.id;
  document.getElementById('patientFormId').value=p.id;
  document.getElementById('patientFormName').value=p.name||'';
  document.getElementById('patientFormGender').value=p.gender||'';
  document.getElementById('patientFormAge').value=p.age||'';
  document.getElementById('patientFormPhone').value=p.phone||'';
  document.getElementById('patientFormVisit').value=p.nextVisit||'';
  document.getElementById('patientFormProblem').value=p.problem||'';
  document.getElementById('patientFormHistory').value=p.medicalHistory||'';
  document.getElementById('patientFormNotes').value=p.notes||'';
  document.getElementById('digClientName').value=p.name||'';
  document.getElementById('digPatientPhone').value=p.phone||'';
  renderPatientAccount(p);
}

function renderPatientAccount(p){
  const panel=document.getElementById('patientAccountPanel');if(!panel||!p)return;
  const f=patientFinancialSummary(p);
  const rows=(f.receipts||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,10).map(r=>
    '<div class="history-entry"><div><strong>'+escapeHTML(r.recNo||'---')+' — '+escapeHTML((r.services||[]).join('، ')||'زيارة')+'</strong><small>'+escapeHTML(r.date||'')+' | '+escapeHTML(r.paid||'0')+' '+escapeHTML(r.currencyName||'ريال يمني')+' مدفوع | متبقٍ '+escapeHTML(r.balance||'0')+'</small></div><button type="button" onclick="loadReceipt(\''+String(r.id).replace(/'/g,'')+'\')">فتح</button></div>'
  ).join('');
  panel.hidden=false;
  panel.innerHTML='<div class="patient-account-head"><strong>📒 حساب '+escapeHTML(p.name)+'</strong><button type="button" class="tool-btn" onclick="startPatientVisit()">➕ زيارة / سند جديد</button></div>'+
    '<div class="patient-profile-meta"><b>الجنس:</b> '+escapeHTML(p.gender||'—')+' &nbsp; <b>العمر:</b> '+escapeHTML(p.age||'—')+' &nbsp; <b>الهاتف:</b> '+escapeHTML(p.phone||'—')+'<br><b>المشكلة:</b> '+escapeHTML(p.problem||'—')+'<br><b>التاريخ المرضي:</b> '+escapeHTML(p.medicalHistory||'—')+'</div>'+
    '<div class="patient-account-grid"><input id="accountServiceName" class="live-input" placeholder="الخدمة المقدمة"><input id="accountServicePrice" class="live-input" type="number" min="0" placeholder="سعر الخدمة"><input id="accountServicePaid" class="live-input" type="number" min="0" placeholder="المدفوع الآن"><input id="accountServiceTooth" class="live-input" placeholder="رقم السن / الموضع"><textarea id="accountServiceNotes" class="live-input" placeholder="تفاصيل الزيارة / ملاحظات"></textarea></div>'+
    '<div class="patient-account-services"><button type="button" class="tool-btn wide" onclick="createReceiptFromPatientAccount()">🧾 إنشاء سند من حساب المريض</button></div>'+
    '<div class="patient-account-summary"><div>الإجمالي<br>'+f.total.toLocaleString()+'</div><div>المدفوع<br>'+f.paid.toLocaleString()+'</div><div>المتبقي<br>'+f.balance.toLocaleString()+'</div></div>'+
    '<div class="patient-account-services"><h4>آخر الزيارات والسندات</h4>'+(rows||'<div class="empty-state">لا توجد زيارات محفوظة.</div>')+'</div>';
}

function startPatientVisit(){
  closePatientsModal();setMode('digital');document.getElementById('digClientName').value=document.getElementById('patientFormName').value||'';document.getElementById('digPatientPhone').value=document.getElementById('patientFormPhone').value||'';clearPatientVisitFields();
}

function clearPatientVisitFields(){
  ['accountServiceName','accountServicePrice','accountServicePaid','accountServiceTooth','accountServiceNotes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
}

function createReceiptFromPatientAccount(){
  const pName=patientFormValue('patientFormName');
  const service=patientFormValue('accountServiceName');
  const price=Number(document.getElementById('accountServicePrice')?.value||0);
  const paid=Number(document.getElementById('accountServicePaid')?.value||0);
  const tooth=patientFormValue('accountServiceTooth');
  const notes=patientFormValue('accountServiceNotes');
  if(!pName||!patientId()){alert('اختر أو احفظ ملف المريض أولاً.');return;}
  if(!service){alert('أدخل الخدمة المقدمة.');return;}
  if(price<=0){alert('أدخل سعر الخدمة.');return;}
  setMode('digital');generateNextReceiptNo();setTodayDate();
  document.getElementById('digClientName').value=pName;
  document.getElementById('digPatientPhone').value=patientFormValue('patientFormPhone');
  document.getElementById('digTotal').value=String(price);
  document.getElementById('digPaid').value=String(Math.min(Math.max(0,paid),price));
  document.getElementById('digTooth').value=tooth;
  if(document.getElementById('digCustomService'))document.getElementById('digCustomService').value=service;
  document.getElementById('digTafqeet').value=notes;
  document.querySelectorAll('.custom-check-item').forEach(el=>el.classList.remove('active'));
  const match=Array.from(document.querySelectorAll('.custom-check-item')).find(el=>el.innerText.replace('✓','').trim()===service);
  if(match)match.classList.add('active');
  calculateLedger();
  closePatientsModal();
  alert('تم تجهيز السند من حساب المريض. راجعه ثم اضغط حفظ.');
}

function openPatientsModal(){document.getElementById('patientsModal')?.classList.add('open');renderPatients();}
function closePatientsModal(){document.getElementById('patientsModal')?.classList.remove('open');}
async function buildFullBackup(){
  const receipts=await clinicDBAll('receipts'),patients=await clinicDBAll('patients');
  return {schema:'ALSSAEDY_CLINIC_BACKUP',schemaVersion:2,exportedAt:new Date().toISOString(),receipts,patients,settings:{
    size:localStorage.getItem('alssaedy_receipt_size')||'a5',
    theme:localStorage.getItem('alssaedy_theme')||'classic',
    customLogo:localStorage.getItem('alssaedy_custom_logo')||'',
    texts:localStorage.getItem('alssaedy_texts')||'',
    currency:localStorage.getItem('alssaedy_currency')||'YER'
  }};
}
async function exportFullBackup(){
  try{
    const payload=await buildFullBackup(),name='ALSSAEDY_Clinic_FULL_BACKUP_'+getLocalDateISO().replace(/-/g,'')+'.json';
    downloadTextFile(name,JSON.stringify(payload,null,2),'application/json');
    alert('تم إنشاء النسخة الاحتياطية الكاملة: المرضى + السندات + الإعدادات.');
  }catch(e){alert('تعذر إنشاء النسخة الاحتياطية: '+e.message);}
}
async function importFullBackup(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
    const payload=JSON.parse(await file.text());
    if(payload.schema!=='ALSSAEDY_CLINIC_BACKUP')throw new Error('صيغة النسخة غير معتمدة.');
    const merge=confirm('هل تريد دمج البيانات مع البيانات الحالية؟ اضغط «إلغاء» للاستبدال الكامل.');
    if(!merge&& !confirm('سيتم استبدال السجل الحالي. هل أنت متأكد؟'))return;
    if(!merge){await clinicDBClear('receipts');await clinicDBClear('patients');}
    for(const p of (payload.patients||[]))await clinicDBPut('patients',p);
    for(const item of (payload.receipts||[])){
      const exists=(await clinicDBAll('receipts')).some(x=>receiptFingerprint(x)===receiptFingerprint(item));
      if(!exists)await clinicDBPut('receipts',item);
    }
    if(payload.settings?.customLogo)localStorage.setItem('alssaedy_custom_logo',payload.settings.customLogo);
    if(payload.settings?.currency)localStorage.setItem('alssaedy_currency',payload.settings.currency);
    if(payload.settings?.size)localStorage.setItem('alssaedy_receipt_size',payload.settings.size);
    if(payload.settings?.theme)localStorage.setItem('alssaedy_theme',payload.settings.theme);
    if(payload.settings?.texts)localStorage.setItem('alssaedy_texts',payload.settings.texts);
    localStorage.setItem('alssaedy_receipts_history',JSON.stringify(await clinicDBAll('receipts')));
    if(typeof applyLogo==='function')applyLogo(localStorage.getItem('alssaedy_custom_logo')||OFFICIAL_LOGO_URL);
    updateHistoryCount();renderHistory();
    alert('تمت استعادة البيانات بنجاح مع منع التكرارات.');
  }catch(e){alert('تعذر استيراد النسخة: '+e.message);}
  event.target.value='';
}

async function importDataFile(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
    const text=await file.text();
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    let imported=[];
    if(ext==='csv'){
      const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean);
      if(lines.length<2)throw new Error('ملف CSV فارغ.');
      const parseLine=line=>{const out=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'){cur+='"';i++;continue}if(c==='"'){quoted=!quoted;continue}if(c===','&&!quoted){out.push(cur);cur='';continue}cur+=c;}out.push(cur);return out;};
      const headers=parseLine(lines[0]);imported=lines.slice(1).map(line=>{const vals=parseLine(line),o={};headers.forEach((h,i)=>o[h]=vals[i]||'');return {id:o.ID||('IMP-'+Date.now()+'-'+Math.random()),recNo:o['Receipt No']||o.recNo,date:o.Date||o.date,name:o['Patient Name']||o.name,patientPhone:o['Patient Phone']||'',paid:o.Paid||'0',total:o.Total||'0',balance:o.Balance||'0',change:o.Change||'0',tooth:o['Tooth / Location']||'',tafqeet:o['Amount in Words']||'',payMethod:o['Payment Method']||'نقداً',ref:o.Reference||'',services:String(o.Services||'').split(' | ').filter(Boolean),mode:o.Mode||'digital',size:o.Size||'a5',currency:o.Currency||'YER',currencyName:o.CurrencyName||'ريال يمني',currencySymbol:o.CurrencySymbol||'ر.ي'};});
    }else{
      const payload=JSON.parse(text);
      imported=Array.isArray(payload)?payload:(payload.receipts||[]);
    }
    if(!imported.length)throw new Error('لم يتم العثور على سندات في الملف.');
    let added=0;
    const existing=await clinicDBAll('receipts');
    for(const raw of imported){
      const item={...raw,id:raw.id||('IMP-'+Date.now()+'-'+Math.random().toString(36).slice(2))};
      if(!item.recNo)item.recNo='IMP-'+Date.now();
      if(!item.date)item.date=getLocalDateISO();
      if(!item.name)item.name='مريض بدون اسم';
      if(existing.some(x=>receiptFingerprint(x)===receiptFingerprint(item)))continue;
      if(existing.some(x=>String(x.recNo)===String(item.recNo)))continue;
      await clinicDBPut('receipts',item);existing.push(item);added++;
    }
    localStorage.setItem('alssaedy_receipts_history',JSON.stringify(existing));
    updateHistoryCount();renderHistory();
    alert('تم استيراد '+added+' سند جديد مع منع التكرارات.');
  }catch(e){alert('تعذر استيراد الملف: '+e.message);}
  event.target.value='';
}
