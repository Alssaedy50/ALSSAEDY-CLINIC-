function saveReceiptLocally() {
    const recNo = document.getElementById('digReceiptNo').value || ('REC-' + Math.floor(100 + Math.random()*900));
    const record = {
        id: Date.now(),
        recNo: recNo,
        date: document.getElementById('digDate').value || new Date().toISOString().split('T')[0],
        name: document.getElementById('digClientName').value || 'مريض بدون اسم',
        paid: document.getElementById('digPaid').value || '0',
        total: document.getElementById('digTotal').value || '0',
        balance: document.getElementById('digBalance').value || '0',
        tooth: document.getElementById('digTooth').value || '',
        tafqeet: document.getElementById('digTafqeet').value || ''
    };

    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    history.unshift(record);
    localStorage.setItem('alssaedy_receipts_history', JSON.stringify(history));
    updateHistoryCount();
    alert('تم حفظ السند في السجل المحلي بنجاح.');
}

function updateHistoryCount() {
    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    const badge = document.getElementById('historyCount');
    if (badge) badge.innerText = history.length;
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    const container = document.getElementById('historyList');
    if (!history.length) {
        container.innerHTML = '<p style="text-align:center; padding:15px; color:#64748b; font-size:11px;">لا توجد سندات محفوظة حتى الآن.</p>';
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-entry">
            <div>
                <strong>${item.name} (${item.recNo})</strong>
                <small>التاريخ: ${item.date} | المدفوع: ${item.paid} ريال | المتبقي: ${item.balance} ريال</small>
            </div>
            <div class="history-entry-btns">
                <button type="button" onclick="loadReceipt(${item.id})">📥 استرجاع</button>
                <button type="button" onclick="deleteReceipt(${item.id})" style="color:#b91c1c;">✕</button>
            </div>
        </div>
    `).join('');
}

function loadReceipt(id) {
    const history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    const item = history.find(r => r.id === id);
    if (!item) return;

    setMode('digital');
    document.getElementById('digReceiptNo').value = item.recNo;
    document.getElementById('digDate').value = item.date;
    document.getElementById('digClientName').value = item.name;
    document.getElementById('digPaid').value = item.paid;
    document.getElementById('digTotal').value = item.total;
    document.getElementById('digPaidTable').value = item.paid;
    document.getElementById('digBalance').value = item.balance;
    document.getElementById('digTooth').value = item.tooth;
    document.getElementById('digTafqeet').value = item.tafqeet;
    calculateLedger();
    closeHistoryModal();
}

function deleteReceipt(id) {
    let history = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
    history = history.filter(r => r.id !== id);
    localStorage.setItem('alssaedy_receipts_history', JSON.stringify(history));
    renderHistory();
    updateHistoryCount();
}

function clearAllHistory() {
    if (confirm('هل أنت متأكد من حذف كامل سجل السندات؟')) {
        localStorage.removeItem('alssaedy_receipts_history');
        renderHistory();
        updateHistoryCount();
    }
}
