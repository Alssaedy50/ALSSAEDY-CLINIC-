/* Receipt, patient and export domain logic. Persistence is owned by repository.js. */
function safeHistory(){ return clinicRepositoryReceipts(); }

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[char]));
}

function getSelectedServices() {
    return Array.from(document.querySelectorAll('.custom-check-item.active'))
        .map(item => item.querySelector('.check-mark') ? item.innerText.replace('✓', '').trim() : item.innerText.trim());
}

function updateReceiptIssuancePanel(){
  const panel=document.getElementById('receiptIssuancePanel');if(!panel)return;
  const value=id=>document.getElementById(id)?.value||'';
  const info=typeof getCurrencyInfo==='function'?getCurrencyInfo():{symbol:'ر.ي'};
  const total=Math.max(0,Number.parseFloat(value('digTotal'))||0), paid=Math.max(0,Number.parseFloat(value('digPaid'))||0), balance=Math.max(0,total-paid);
  const services=getSelectedServices();
  const set=(id,text)=>{const e=document.getElementById(id);if(e)e.textContent=text;};
  set('issuancePatientName',value('digClientName')||'مريض جديد');set('issuancePatientPhone',value('digPatientPhone')||'لم يتم اختيار ملف');
  set('issuanceServiceCount',String(services.length));set('issuanceServices',services.length?services.join('، '):'لم تُحدد خدمة بعد');
  set('issuanceReceiptNo',value('digReceiptNo')||'—');set('issuanceDate',value('digDate')||'—');
  set('issuanceTotal',total.toLocaleString());set('issuancePaid',paid.toLocaleString());set('issuanceBalance',balance.toLocaleString());
  ['issuanceTotalCurrency','issuancePaidCurrency','issuanceBalanceCurrency'].forEach(id=>set(id,info.symbol));
  set('issuancePayMethod',document.getElementById('selectedPayMethod')?.value||'نقداً');set('issuanceReference',value('digRef')?'المرجع: '+value('digRef'):'بدون مرجع');
  panel.classList.toggle('has-balance',balance>0);panel.classList.toggle('is-settled',balance<=0&&total>0);panel.classList.toggle('is-manual',document.body.getAttribute('data-mode')==='manual');
  const mode=document.getElementById('receiptIssuanceMode');if(mode)mode.textContent=document.body.getAttribute('data-mode')==='manual'?'نموذج طباعة':'سند رقمي';
}
function calculateLedger(){
  const billing=window.aqsa7BillingContract;
  const paid=billing ? billing.normalizeAmount(document.getElementById('digPaid')?.value) : Math.max(0,Number.parseFloat(document.getElementById('digPaid')?.value)||0);
  const total=billing ? billing.normalizeAmount(document.getElementById('digTotal')?.value) : Math.max(0,Number.parseFloat(document.getElementById('digTotal')?.value)||0);
  const paidTable=document.getElementById('digPaidTable'),balance=document.getElementById('digBalance'),taf=document.getElementById('digTafqeet');
  if(paidTable)paidTable.value=paid?paid:'';
  if(balance)balance.value=(total||paid)?(billing ? billing.calculateBalance(total,paid) : Math.max(0,total-paid)):'';
  if(paid>0&&taf&&typeof tafqeetRial==='function')taf.value=tafqeetRial(paid);
  updateReceiptIssuancePanel();
}

function collectReceiptData() {
    const billing = window.aqsa7BillingContract;
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
        balance:String(billing ? billing.calculateBalance(total,paid) : Math.max(0,total-paid)),change:String(billing ? billing.calculateChange(total,paid) : Math.max(0,paid-total)),
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

async function saveReceiptLocally(){
  if(document.body.getAttribute('data-mode')!=='digital'){alert('الحفظ متاح للسند الرقمي فقط.');return;}
  if(!document.getElementById('digReceiptNo').value)generateNextReceiptNo();
  const data=collectReceiptData();
  const history=safeHistory();
  const fp=receiptFingerprint(data);
  if(history.some(item=>receiptFingerprint(item)===fp)){toast?.('هذا السند مطابق تماماً لسند محفوظ سابقاً. تم رفض الحفظ المكرر.','error');return;}
  if(history.some(item=>String(item.recNo)===String(data.recNo))){toast?.('رقم السند مستخدم بالفعل. تم رفض الحفظ لتجنب إنشاء سند مكرر.','error');return;}
  try{
    await clinicRepositoryPutReceipt(data);
    if(typeof upsertCurrentPatient==='function') await upsertCurrentPatient(data);
    updateHistoryCount();
    localStorage.removeItem('alssaedy_draft');
    toast?.('تم حفظ السند بنجاح في السجل الدائم.');
    if(typeof autoSyncIfEnabled==='function')autoSyncIfEnabled();
  }catch(e){ toast?.('تعذر حفظ السند: '+(e?.message||'خطأ غير معروف'),'error'); }
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
            'ID','Receipt No','Date','Patient Name','Patient Phone','Paid','Currency','Currency Name',
            'Total','Balance','Change','Tooth / Location','Amount in Words',
            'Payment Method','Reference','Services','Mode','Size','Exported At'
        ];
        const rows = history.map(item => [
            item.id,item.recNo,item.date,item.name,item.patientPhone,item.paid,item.currency||'YER',item.currencyName||'ريال يمني',
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

function updateHistoryCount() {
    const badge = document.getElementById('historyCount');
    if (badge) badge.innerText = safeHistory().length;
}

function getHistoryStats(list) {
    const items = Array.isArray(list) ? list : safeHistory();
    const billing = window.aqsa7BillingContract;
    if (billing) return billing.summarizeReceivables(items);
    const totals = items.reduce((acc, item) => {
        acc.total += Number(item.total) || 0;
        acc.paid += Number(item.paid) || 0;
        acc.balance += Number(item.balance) || 0;
        return acc;
    }, { total: 0, paid: 0, balance: 0 });
    return { count: items.length, total: totals.total, paid: totals.paid, balance: totals.balance };
}

function renderHistoryStats(list) {
    const box = document.getElementById('historyStats');
    if (!box) return;
    const s = getHistoryStats(list);
    const fmt = n => Number(n || 0).toLocaleString('ar-EG');
    box.innerHTML =
        '<div class="stat-cell"><span class="stat-label">عدد السندات</span><strong>' + fmt(s.count) + '</strong></div>' +
        '<div class="stat-cell"><span class="stat-label">إجمالي الحسابات</span><strong>' + fmt(s.total) + '</strong></div>' +
        '<div class="stat-cell"><span class="stat-label">إجمالي المدفوع</span><strong>' + fmt(s.paid) + '</strong></div>' +
        '<div class="stat-cell stat-balance"><span class="stat-label">إجمالي المتبقي</span><strong>' + fmt(s.balance) + '</strong></div>';
}

function filterHistory(list, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(item => {
        const haystack = [
            item.recNo, item.name, item.date, item.patientPhone, item.ref,
            item.customService, item.tooth, item.tafqeet,
            Array.isArray(item.services) ? item.services.join(' ') : ''
        ].join(' ').toLowerCase();
        return haystack.includes(q);
    });
}

function renderHistory() {
    const history = safeHistory();
    const container = document.getElementById('historyList');
    if (!container) return;
    const query = document.getElementById('historySearch')?.value || '';
    const filter = document.getElementById('historyFilter')?.value || 'all';
    let filtered = filterHistory(history, query);

    if (filter === 'balance') filtered = filtered.filter(item => Number(item.balance) > 0);
    if (filter === 'settled') filtered = filtered.filter(item => Number(item.balance) <= 0 && Number(item.total) > 0);

    filtered = filtered.slice().sort((a, b) => {
        const dateA = String(a.date || '');
        const dateB = String(b.date || '');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return String(b.recNo || '').localeCompare(String(a.recNo || ''), undefined, {numeric:true});
    });

    renderHistoryStats(filtered.length === history.length && !query && filter === 'all' ? history : filtered);

    const count = document.getElementById('historyLedgerCount');
    if (count) count.textContent = filtered.length + ' سند';

    if (!history.length) {
        container.innerHTML = '<div class="history-ledger-empty"><strong>لا توجد سندات محفوظة حتى الآن.</strong><span>أنشئ سنداً رقمياً واحفظه ليظهر هنا في السجل.</span></div>';
        return;
    }
    if (!filtered.length) {
        container.innerHTML = '<div class="history-ledger-empty"><strong>لا توجد نتائج مطابقة.</strong><span>جرّب تغيير البحث أو التصفية.</span></div>';
        return;
    }

    const rows = filtered.map(item => {
        const name = escapeHTML(item.name || 'مريض بدون اسم');
        const phone = escapeHTML(item.patientPhone || '—');
        const recNo = escapeHTML(item.recNo || '---');
        const date = escapeHTML(typeof formatReceiptDate === 'function' ? formatReceiptDate(item.date) : (item.date || '---'));
        const paid = escapeHTML(Number(item.paid || 0).toLocaleString());
        const total = escapeHTML(Number(item.total || 0).toLocaleString());
        const balanceValue = Number(item.balance || 0);
        const balance = escapeHTML(balanceValue.toLocaleString());
        const cur = escapeHTML(item.currencySymbol || item.currencyName || 'ر.ي');
        const services = Array.isArray(item.services) && item.services.length ? escapeHTML(item.services.join('، ')) : '—';
        const id = escapeHTML(String(item.id || '').replace(/'/g, ''));
        const settled = balanceValue <= 0 && Number(item.total || 0) > 0;
        const status = settled
            ? '<span class="history-status history-status-paid">مسدد</span>'
            : '<span class="history-status history-status-due">متبقي</span>';

        return '<div class="history-ledger-row">' +
            '<div class="history-receipt-cell" data-label="السند"><strong>' + recNo + '</strong><small>' + date + '</small></div>' +
            '<div class="history-patient-cell" data-label="المريض"><strong>' + name + '</strong><small>' + phone + '</small></div>' +
            '<div class="history-service-cell" data-label="الخدمة">' + services + '</div>' +
            '<div class="history-money" data-label="الإجمالي"><span>' + total + '</span><small>' + cur + '</small></div>' +
            '<div class="history-money" data-label="المدفوع"><span>' + paid + '</span><small>' + cur + '</small></div>' +
            '<div class="history-money" data-label="المتبقي"><span>' + balance + '</span><small>' + cur + '</small></div>' +
            '<div class="history-status-cell" data-label="الحالة">' + status + '</div>' +
            '<div class="history-list-actions" aria-label="إجراءات السند">' +
              '<button type="button" class="history-action history-open" title="فتح السند" aria-label="فتح السند ' + recNo + '" onclick="loadReceipt(\'' + id + '\')">📥 فتح</button>' +
              '<button type="button" class="history-action history-delete" title="حذف السند" aria-label="حذف السند ' + recNo + '" onclick="deleteReceipt(\'' + id + '\')">🗑️ حذف</button>' +
            '</div>' +
        '</div>';
    }).join('');

    container.innerHTML = rows;
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

async function deleteReceipt(id){
  try{await clinicRepositoryDeleteReceipt(id);renderHistory();updateHistoryCount();}
  catch(e){toast?.('تعذر حذف السند: '+(e?.message||'خطأ غير معروف'),'error');}
}

async function clearAllHistory(){
  if(!confirm('هل أنت متأكد من حذف كامل سجل السندات؟'))return;
  try{await clinicRepositoryClearReceipts();renderHistory();updateHistoryCount();}
  catch(e){toast?.('تعذر مسح السجل: '+(e?.message||'خطأ غير معروف'),'error');}
}
let currentPatientId='';

function patientId(){
  return (window.currentPatientId||'').trim();
}
async function getPatients(){ return clinicRepositoryPatients(); }
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
  await clinicRepositoryPutPatient(p);
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
  await clinicRepositoryPutPatient(p);
  currentPatientId=p.id;window.currentPatientId=p.id;
  renderPatients();renderPatientAccount(p);showPatientDetailView();
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
  const billing=window.aqsa7BillingContract;
  const summary=billing ? billing.summarizeReceivables(rs) : rs.reduce((s,r)=>({
    count:s.count+1,
    total:s.total+(Number(r.total)||0),
    paid:s.paid+(Number(r.paid)||0),
    balance:s.balance+(Number(r.balance)||0)
  }),{count:0,total:0,paid:0,balance:0});
  return {receipts:rs,total:summary.total,paid:summary.paid,balance:summary.balance};
}

async function renderPatients(){
  const box=document.getElementById('patientsList'); if(!box)return;
  const list=await getPatients();
  const query=String(document.getElementById('patientDirectorySearch')?.value||'').trim().toLocaleLowerCase();
  const filter=document.getElementById('patientDirectoryFilter')?.value||'all';
  const now=new Date(); now.setHours(0,0,0,0);
  const rows=list.map(p=>{
    const f=patientFinancialSummary(p);
    const next=p.nextVisit?new Date(p.nextVisit+'T00:00:00'):null;
    return {...p,financial:f,nextDate:next};
  }).filter(p=>{
    const hay=[p.name,p.phone,p.problem,p.medicalHistory].map(v=>String(v||'').toLocaleLowerCase()).join(' ');
    if(query&&!hay.includes(query))return false;
    if(filter==='balance'&&!(p.financial.balance>0))return false;
    if(filter==='settled'&&p.financial.balance>0)return false;
    if(filter==='visit'&&!(p.nextDate&&p.nextDate>=now))return false;
    return true;
  }).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));

  const count=document.getElementById('patientsDirectoryCount');
  if(count)count.textContent=rows.length+' مريض'+(rows.length===1?'':'');
  const currency=p=>p.financial.receipts[0]?.currencyName||'ريال يمني';
  const status=p=>p.financial.balance>0
    ? '<span class="patient-status patient-status-balance">متبقي</span>'
    : '<span class="patient-status patient-status-settled">مسدد</span>';
  const visit=p=>p.nextVisit
    ? '<span class="patient-next-visit">'+escapeHTML(p.nextVisit)+'</span>'
    : '<span class="patient-muted">—</span>';
  const desktopHead='<div class="patient-ledger-head"><span>المريض</span><span>الهاتف</span><span>آخر زيارة</span><span>الإجمالي</span><span>المدفوع</span><span>المتبقي</span><span>الحالة</span><span>إجراء</span></div>';
  const cards=rows.map(p=>'<article class="patient-ledger-row">'+
    '<div class="patient-identity"><strong>'+escapeHTML(p.name)+'</strong><small>'+escapeHTML((p.gender||'—')+' • '+(p.age||'—')+' سنة')+'</small><small>'+escapeHTML(p.problem||'لا توجد مشكلة مسجلة')+'</small></div>'+
    '<div class="patient-phone" dir="ltr">'+escapeHTML(p.phone||'—')+'</div>'+
    '<div class="patient-last-visit">'+escapeHTML(p.lastVisit||'—')+'</div>'+
    '<div class="patient-money" data-label="الإجمالي">'+p.financial.total.toLocaleString()+' <small>'+escapeHTML(currency(p))+'</small></div>'+
    '<div class="patient-money patient-paid" data-label="المدفوع">'+p.financial.paid.toLocaleString()+'</div>'+
    '<div class="patient-money '+(p.financial.balance>0?'patient-due':'patient-zero')+'" data-label="المتبقي">'+p.financial.balance.toLocaleString()+'</div>'+
    '<div class="patient-status-cell" data-label="الحالة">'+status(p)+'<small>موعد: '+visit(p)+'</small></div>'+
    '<div class="patient-list-actions"><button type="button" class="patient-open-btn" onclick="selectPatient(\''+String(p.id).replace(/'/g,'')+'\')">فتح الحساب</button></div>'+
    '</article>').join('');
  box.innerHTML=desktopHead+(cards||'<div class="empty-state patient-ledger-empty">لا توجد نتائج مطابقة للبحث أو التصفية.</div>');
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
  showPatientDetailView();
  appRoute={screen:'patient-detail',patientId:p.id};
  pushPanelState('patient-detail');
}

function renderPatientAccount(p){
  const panel=document.getElementById('patientAccountPanel');if(!panel||!p)return;
  const f=patientFinancialSummary(p);
  const receipts=(f.receipts||[]).slice().sort((a,b)=>{
    const da=parseAnyDate(a.date), db=parseAnyDate(b.date);
    return String(db?.y||'').localeCompare(String(da?.y||''))||String(db?.m||'').localeCompare(String(da?.m||''))||String(db?.d||'').localeCompare(String(da?.d||''));
  });
  const status=f.balance>0?'<span class="patient-detail-status patient-detail-status-due">عليه متبقي</span>':'<span class="patient-detail-status patient-detail-status-paid">الحساب مسدد</span>';
  const nextVisit=p.nextVisit?'<div class="patient-detail-meta-item"><span>موعد المتابعة</span><strong dir="ltr">'+escapeHTML(p.nextVisit)+'</strong></div>':'';
  const timeline=receipts.length?receipts.map(r=>{
    const services=Array.isArray(r.services)&&r.services.length?r.services.join('، '):(r.customService||'زيارة');
    const balance=Number(r.balance)||0;
    const financialClass=balance>0?'patient-timeline-due':'patient-timeline-paid';
    return '<article class="patient-timeline-item"><div class="patient-timeline-marker" aria-hidden="true"></div><div class="patient-timeline-card"><div class="patient-timeline-head"><div><strong>'+escapeHTML(services)+'</strong><small dir="ltr">'+escapeHTML(r.date||'—')+' • '+escapeHTML(r.recNo||'—')+'</small></div><span class="'+financialClass+'">'+(balance>0?'متبقي '+escapeHTML(r.balance||'0'):'مسدد')+'</span></div><div class="patient-timeline-finance"><span>الإجمالي <b>'+escapeHTML(r.total||'0')+' '+escapeHTML(r.currencySymbol||r.currencyName||'ر.ي')+'</b></span><span>المدفوع <b>'+escapeHTML(r.paid||'0')+'</b></span><span>طريقة الدفع <b>'+escapeHTML(r.payMethod||'—')+'</b></span></div>'+((r.tooth||r.tafqeet)?'<div class="patient-timeline-notes">'+(r.tooth?'<span>السن/الموضع: '+escapeHTML(r.tooth)+'</span>':'')+(r.tafqeet?'<span>ملاحظة: '+escapeHTML(r.tafqeet)+'</span>':'')+'</div>':'')+'<div class="patient-timeline-actions"><button type="button" class="tool-btn patient-timeline-open" onclick="loadReceipt(\''+String(r.id).replace(/'/g,'')+'\')">فتح السند</button></div></div></article>';
  }).join(''):'<div class="patient-detail-empty"><strong>لا توجد زيارات محفوظة بعد.</strong><span>أنشئ أول زيارة من زر «زيارة / سند جديد».</span></div>';
  panel.hidden=false;
  panel.innerHTML='<div class="patient-detail-sticky"><div class="patient-detail-topline"><button type="button" class="tool-btn patient-detail-back" onclick="returnToPatientDirectory()">← قائمة المرضى</button><span class="directory-kicker">PATIENT ACCOUNT</span></div><div class="patient-detail-identity"><div class="patient-detail-avatar" aria-hidden="true">'+escapeHTML(String(p.name||'م').trim().charAt(0)||'م')+'</div><div class="patient-detail-name"><strong>'+escapeHTML(p.name||'مريض بدون اسم')+'</strong><span>'+escapeHTML((p.gender||'—')+' • '+(p.age||'—')+' سنة')+' • <span dir="ltr">'+escapeHTML(p.phone||'لا يوجد هاتف')+'</span></span></div><div class="patient-detail-actions"><button type="button" class="tool-btn patient-detail-edit" onclick="togglePatientEdit()">✏️ تعديل الملف</button><button type="button" class="tool-btn patient-detail-primary" onclick="startPatientVisit()">＋ زيارة / سند جديد</button></div></div><div class="patient-detail-finance"><div><span>إجمالي الحساب</span><strong>'+f.total.toLocaleString()+'</strong><small>'+escapeHTML(f.receipts[0]?.currencyName||'ريال يمني')+'</small></div><div><span>المدفوع</span><strong class="is-paid">'+f.paid.toLocaleString()+'</strong><small>مدفوع</small></div><div><span>المتبقي</span><strong class="'+(f.balance>0?'is-due':'is-settled')+'">'+f.balance.toLocaleString()+'</strong><small>'+status+'</small></div></div><div class="patient-detail-meta"><div class="patient-detail-meta-item"><span>المشكلة / التشخيص</span><strong>'+escapeHTML(p.problem||'غير مسجل')+'</strong></div><div class="patient-detail-meta-item"><span>التاريخ المرضي</span><strong>'+escapeHTML(p.medicalHistory||'غير مسجل')+'</strong></div>'+nextVisit+'</div></div><div class="patient-detail-content"><div class="patient-detail-section-title"><div><span class="directory-kicker">VISIT TIMELINE</span><h4>سجل الزيارات والسندات</h4></div><span>'+receipts.length+' زيارة</span></div><div class="patient-timeline">'+timeline+'</div></div>';
}
function togglePatientEdit(){const form=document.querySelector('.patient-form'),button=document.querySelector('.patient-detail-edit');if(!form)return;const open=form.classList.toggle('patient-detail-edit-open');if(button)button.textContent=open?'✕ إغلاق التعديل':'✏️ تعديل الملف';if(open)form.scrollIntoView({behavior:'smooth',block:'start'});}
function returnToPatientDirectory(){showPatientListView();renderPatients();appRoute={screen:'patients',patientId:''};activateAppTabVisual('patients');if(history.state?.alssaedyPanel==='patient-detail')history.back();else if(location.hash==='#patient-detail')history.replaceState({alssaedyPanel:'patients'},'', '#patients');}

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

function openPatientsModal(skipHistory=false){document.getElementById('patientsModal')?.classList.add('open');renderPatients();showPatientListView();activateAppTabVisual('patients');appRoute={screen:'patients',patientId:''};if(!skipHistory)pushPanelState('patients');}
function closePatientsModal(skipHistory=false){
  document.getElementById('patientsModal')?.classList.remove('open');showPatientListView();
  if(!skipHistory && (appRoute.screen==='patients'||appRoute.screen==='patient-detail')){
    history.replaceState(null,'',location.pathname+location.search);
  }
  appRoute={screen:'receipt',patientId:''};
}

/* Local backup cryptography: password-derived AES-GCM; keys never persist in AQSA7. */
const AQSA7_BACKUP_CRYPTO = Object.freeze({
  version: 1,
  artifactType: 'AQSA7_BACKUP_ARTIFACT',
  artifactVersion: 1,
  schemaVersion: 5,
  algorithm: 'AES-GCM-256',
  kdf: 'PBKDF2-HMAC-SHA256',
  iterations: 600000,
  saltBytes: 16,
  ivBytes: 12,
  tagLength: 128
});
function aqsa7BackupCryptoAvailable(){
  return Boolean(window.crypto?.subtle && window.crypto?.getRandomValues);
}
function aqsa7BackupBase64(bytes){
  let binary=''; const view=bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for(let i=0;i<view.length;i+=0x8000) binary+=String.fromCharCode(...view.subarray(i,i+0x8000));
  return btoa(binary);
}
function aqsa7BackupFromBase64(value){
  const binary=atob(String(value||'')), out=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) out[i]=binary.charCodeAt(i);
  return out;
}
function aqsa7BackupCryptoHeader(){
  return [
    AQSA7_BACKUP_CRYPTO.artifactType,
    AQSA7_BACKUP_CRYPTO.artifactVersion,
    AQSA7_BACKUP_CRYPTO.schemaVersion,
    AQSA7_BACKUP_CRYPTO.algorithm,
    AQSA7_BACKUP_CRYPTO.kdf,
    AQSA7_BACKUP_CRYPTO.iterations
  ].join('|');
}
async function aqsa7BackupDeriveKey(password,salt){
  if(!aqsa7BackupCryptoAvailable()) throw new Error('Web Crypto API غير متاح. لا يمكن إنشاء نسخة احتياطية مشفرة بأمان.');
  const material=await window.crypto.subtle.importKey(
    'raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {name:'PBKDF2',salt,iterations:AQSA7_BACKUP_CRYPTO.iterations,hash:'SHA-256'},
    material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']
  );
}
async function aqsa7EncryptBackupArtifact(artifact,password){
  if(!password || String(password).length<8) throw new Error('كلمة مرور النسخة الاحتياطية يجب أن تحتوي على 8 أحرف على الأقل.');
  if(!aqsa7BackupCryptoAvailable()) throw new Error('Web Crypto API غير متاح. لا يمكن إنشاء نسخة احتياطية مشفرة بأمان.');
  const artifactVersion=Number(artifact?.artifactVersion||AQSA7_BACKUP_CRYPTO.artifactVersion);
  const schemaVersion=Number(artifact?.schemaVersion||AQSA7_BACKUP_CRYPTO.schemaVersion);
  const salt=window.crypto.getRandomValues(new Uint8Array(AQSA7_BACKUP_CRYPTO.saltBytes));
  const iv=window.crypto.getRandomValues(new Uint8Array(AQSA7_BACKUP_CRYPTO.ivBytes));
  const key=await aqsa7BackupDeriveKey(password,salt);
  const aad=new TextEncoder().encode([
    AQSA7_BACKUP_CRYPTO.artifactType,artifactVersion,schemaVersion,
    AQSA7_BACKUP_CRYPTO.algorithm,AQSA7_BACKUP_CRYPTO.kdf,AQSA7_BACKUP_CRYPTO.iterations
  ].join('|'));
  const plaintext=new TextEncoder().encode(JSON.stringify(artifact));
  const ciphertext=await window.crypto.subtle.encrypt(
    {name:'AES-GCM',iv,additionalData:aad,tagLength:AQSA7_BACKUP_CRYPTO.tagLength},
    key,plaintext
  );
  return {
    artifactType:AQSA7_BACKUP_CRYPTO.artifactType,
    artifactVersion,
    schemaVersion,
    crypto:{
      version:AQSA7_BACKUP_CRYPTO.version,
      algorithm:AQSA7_BACKUP_CRYPTO.algorithm,
      kdf:AQSA7_BACKUP_CRYPTO.kdf,
      iterations:AQSA7_BACKUP_CRYPTO.iterations,
      salt:aqsa7BackupBase64(salt),
      iv:aqsa7BackupBase64(iv),
      tagLength:AQSA7_BACKUP_CRYPTO.tagLength,
      encoding:'base64'
    },
    ciphertext:aqsa7BackupBase64(new Uint8Array(ciphertext))
  };
}
async function aqsa7DecryptBackupArtifact(envelope,password){
  if(!envelope || envelope.artifactType!==AQSA7_BACKUP_CRYPTO.artifactType || Number(envelope.artifactVersion)!==AQSA7_BACKUP_CRYPTO.artifactVersion){
    throw new Error('صيغة النسخة المشفرة غير متوافقة.');
  }
  const cryptoMeta=envelope.crypto;
  if(!cryptoMeta || Number(cryptoMeta.version)!==AQSA7_BACKUP_CRYPTO.version ||
     cryptoMeta.algorithm!==AQSA7_BACKUP_CRYPTO.algorithm ||
     cryptoMeta.kdf!==AQSA7_BACKUP_CRYPTO.kdf ||
     Number(cryptoMeta.iterations)!==AQSA7_BACKUP_CRYPTO.iterations ||
     Number(cryptoMeta.tagLength)!==AQSA7_BACKUP_CRYPTO.tagLength ||
     cryptoMeta.encoding!=='base64'){
    throw new Error('بيانات التشفير غير متوافقة أو تم العبث بها.');
  }
  if(Number(envelope.schemaVersion)!==AQSA7_BACKUP_CRYPTO.schemaVersion){
    throw new Error('إصدار مخطط النسخة غير مدعوم.');
  }
  if(!password || String(password).length<8) throw new Error('كلمة مرور النسخة الاحتياطية غير صالحة.');
  const salt=aqsa7BackupFromBase64(cryptoMeta.salt),iv=aqsa7BackupFromBase64(cryptoMeta.iv);
  const ciphertext=aqsa7BackupFromBase64(envelope.ciphertext);
  if(salt.length!==AQSA7_BACKUP_CRYPTO.saltBytes || iv.length!==AQSA7_BACKUP_CRYPTO.ivBytes || !ciphertext.length) throw new Error('بيانات النسخة المشفرة تالفة.');
  const key=await aqsa7BackupDeriveKey(password,salt);
  const aad=new TextEncoder().encode([
    envelope.artifactType,Number(envelope.artifactVersion),Number(envelope.schemaVersion),
    cryptoMeta.algorithm,cryptoMeta.kdf,Number(cryptoMeta.iterations)
  ].join('|'));
  let plaintext;
  try{
    plaintext=await window.crypto.subtle.decrypt(
      {name:'AES-GCM',iv,additionalData:aad,tagLength:Number(cryptoMeta.tagLength)},
      key,ciphertext
    );
  }catch(_){
    throw new Error('تعذر فك النسخة الاحتياطية: كلمة المرور خاطئة أو النسخة تالفة/تم العبث بها.');
  }
  let artifact;
  try{ artifact=JSON.parse(new TextDecoder().decode(plaintext)); }
  catch(_){ throw new Error('محتوى النسخة بعد فك التشفير غير صالح.'); }
  if(artifact?.artifactType && artifact.artifactType!==AQSA7_BACKUP_CRYPTO.artifactType) throw new Error('هوية النسخة غير متوافقة.');
  if(Number(artifact?.artifactVersion||0)!==Number(envelope.artifactVersion) || Number(artifact?.schemaVersion||0)!==Number(envelope.schemaVersion)){
    throw new Error('إصدار النسخة الداخلية غير متوافق.');
  }
  return artifact;
}
function aqsa7RequestBackupPassword(confirmPassword=false){
  const password=window.prompt(confirmPassword?'أنشئ كلمة مرور للنسخة الاحتياطية المشفرة (8 أحرف على الأقل):':'أدخل كلمة مرور النسخة الاحتياطية:');
  if(password===null) throw new Error('تم إلغاء عملية النسخ الاحتياطي.');
  if(String(password).length<8) throw new Error('كلمة مرور النسخة الاحتياطية يجب أن تحتوي على 8 أحرف على الأقل.');
  if(confirmPassword){
    const confirmation=window.prompt('أعد إدخال كلمة مرور النسخة الاحتياطية للتأكيد:');
    if(confirmation===null) throw new Error('تم إلغاء عملية النسخ الاحتياطي.');
    if(password!==confirmation) throw new Error('كلمتا المرور غير متطابقتين.');
  }
  return password;
}
Object.assign(window,{
  aqsa7EncryptBackupArtifact,
  aqsa7DecryptBackupArtifact,
  aqsa7BackupCryptoManifest:AQSA7_BACKUP_CRYPTO
});

async function buildFullBackup(){
  const receipts=clinicRepositoryReceipts(),patients=clinicRepositoryPatients();
  const clinicSettings=clinicRepositoryGetSettingsSync();
  const product=typeof aqsa7GetProductManifest==='function'?aqsa7GetProductManifest():{productId:'dental-clinic'};
  const clinic=typeof aqsa7GetClinicConfig==='function'?aqsa7GetClinicConfig():{tenantId:'alssaedy-clinic',instanceId:'alssaedy-clinic-sana-a'};
  const identity=typeof aqsa7GetInstanceIdentity==='function'
    ? aqsa7GetInstanceIdentity()
    : {productId:product.productId,tenantId:clinic.tenantId,instanceId:clinic.instanceId};
  const storage=typeof aqsa7GetInstanceStorageConfig==='function'
    ? aqsa7GetInstanceStorageConfig()
    : {databaseName:'ALSSAEDY_CLINIC_DB'};
  return {
    schema:'AQSA7_PRODUCT_BACKUP',
    legacySchema:'ALSSAEDY_CLINIC_BACKUP',
    schemaVersion:5,
    exportedAt:new Date().toISOString(),
    ownership:{scope:'instance',...identity,databaseName:storage.databaseName},
    ...identity,
    receipts,
    patients,
    settings:{
      clinic:{
        currency:clinicSettings.currency||'YER',
        size:clinicSettings.receiptSize||'a5',
        texts:clinicSettings.receiptTexts||'',
        customLogo:clinicSettings.customLogo||''
      },
      ui:{
        theme:localStorage.getItem('alssaedy_theme')||'classic',
        watermark:localStorage.getItem('alssaedy_watermark')||'on'
      }
    }
  };
}

window.aqsa7BuildFullBackup=buildFullBackup;async function exportFullBackup(){
  if(typeof window.aqsa7BackupEngine?.exportFullBackup!=='function'){
    throw new Error('Backup Engine غير متاح.');
  }
  return window.aqsa7BackupEngine.exportFullBackup();
}
async function importFullBackup(event){
  if(typeof window.aqsa7BackupEngine?.importFullBackup!=='function'){
    alert('تعذر استعادة النسخة: Backup Engine غير متاح.');
    if(event?.target)event.target.value='';
    return;
  }
  return window.aqsa7BackupEngine.importFullBackup(event);
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
      await clinicRepositoryPutReceipt(item);existing.push(item);added++;
    }
    updateHistoryCount();renderHistory();
    alert('تم استيراد '+added+' سند جديد مع منع التكرارات.');
  }catch(e){alert('تعذر استيراد الملف: '+e.message);}
  event.target.value='';
}
