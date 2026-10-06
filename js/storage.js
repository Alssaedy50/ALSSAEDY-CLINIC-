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
    const paid = Math.max(0, Number.parseFloat(document.getElementById('digPaid').value) || 0);
    const total = Math.max(0, Number.parseFloat(document.getElementById('digTotal').value) || 0);
    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        recNo: document.getElementById('digReceiptNo').value.trim(),
        date: document.getElementById('digDate').value || getLocalDateISO(),
        name: document.getElementById('digClientName').value.trim() || 'مريض بدون اسم',
        patientPhone: document.getElementById('digPatientPhone')?.value.trim() || '',
        paid: String(paid),
        total: String(total),
        balance: String(Math.max(0, total - paid)),
        change: String(Math.max(0, paid - total)),
        tooth: document.getElementById('digTooth').value.trim(),
        tafqeet: document.getElementById('digTafqeet').value.trim(),
        payMethod: document.getElementById('selectedPayMethod').value || 'نقداً',
        ref: document.getElementById('digRef').value.trim(),
        services: getSelectedServices(),
        mode: 'digital',
        size: getSelectedSize()
    };
}

function saveReceiptLocally() {
    if (document.body.getAttribute('data-mode') !== 'digital') {
        alert('الحفظ في السجل متاح للسند الرقمي فقط.');
        return;
    }
    const data = collectReceiptData();
    if (!data.recNo) generateNextReceiptNo();
    const refreshed = collectReceiptData();

    if (Number(refreshed.paid) < 0 || Number(refreshed.total) < 0) {
        alert('لا يمكن إدخال مبالغ سالبة.');
        return;
    }

    const history = safeHistory();
    const duplicate = history.some(item => item.recNo === refreshed.recNo);
    if (duplicate) {
        if (!confirm('رقم السند موجود مسبقاً. هل تريد حفظ نسخة جديدة بنفس الرقم؟')) return;
    }
    history.unshift(refreshed);
    localStorage.setItem('alssaedy_receipts_history', JSON.stringify(history));
    updateHistoryCount();
    alert('تم حفظ السند في السجل المحلي بنجاح.');
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