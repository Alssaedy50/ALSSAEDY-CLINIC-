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
        id:crypto?.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2),
        recNo:document.getElementById('digReceiptNo').value.trim(),
        date:document.getElementById('digDate').value||getLocalDateISO(),
        name:document.getElementById('digClientName').value.trim()||'مريض بدون اسم',
        patientPhone:document.getElementById('digPatientPhone')?.value.trim()||'',
        patientId:window.currentPatientId||'',
        paid:String(paid),total:String(total),
        balance:String(Math.max(0,total-paid)),change:String(Math.max(0,paid-total)),
        tooth:document.getElementById('digTooth').value.trim(),
        tafqeet:document.getElementById('digTafqeet').value.trim(),
        payMethod:document.getElementById('selectedPayMethod').value||'نقداً',
        ref:document.getElementById('digRef').value.trim(),
        services:getSelectedServices(),mode:'digital',size:getSelectedSize(),
        currency:currency.code,currencyName:currency.nameAr,currencySymbol:currency.symbol
    };
}
function receiptFingerprint(item){
    return JSON.stringify([item.recNo,item.date,item.name,item.patientPhone,item.patientId,item.paid,item.total,item.balance,item.change,item.tooth,item.tafqeet,item.payMethod,item.ref,(item.services||[]).slice().sort(),item.currency]);
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
    const item = safeHistory().find(r => Number(r.id) === Number(id));
    if (!item) return;
    setMode('digital');
    document.getElementById('digReceiptNo').value = item.recNo || '';
    document.getElementById('digDate').value = item.date || getLocalDateISO();
    document.getElementById('digClientName').value = item.name || '';
    document.getElementById('digPatientPhone').value = item.patientPhone || '';
    document.getElementById('digPaid').value = item.paid || '';
    document.getElementById('digTotal').value = item.total || '';
    document.getElementById('digTooth').value = item.tooth || '';
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
    const history = safeHistory().filter(r => Number(r.id) !== Number(id));
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