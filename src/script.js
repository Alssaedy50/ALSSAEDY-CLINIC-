function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

// الشعار الرسمي الافتراضي المعتمد
const OFFICIAL_LOGO_URL = (window.OFFICIAL_LOGO_DATA) ? window.OFFICIAL_LOGO_DATA : document.getElementById('clinicLogoImg').src;

// محرك التفقيط المالي بالريال اليمني (Auto-Tafqeet)
function tafqeetRial(number) {
    if (isNaN(number) || number <= 0) return '';
    number = Math.floor(number);

    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
                  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

    function convertGroup(n) {
        let h = Math.floor(n / 100);
        let rem = n % 100;
        let parts = [];
        if (h > 0) parts.push(hundreds[h]);
        if (rem > 0) {
            if (rem < 20) {
                parts.push(ones[rem]);
            } else {
                let o = rem % 10;
                let t = Math.floor(rem / 10);
                if (o > 0) parts.push(ones[o] + ' و' + tens[t]);
                else parts.push(tens[t]);
            }
        }
        return parts.join(' و');
    }

    let parts = [];
    let millions = Math.floor(number / 1000000);
    let thousands = Math.floor((number % 1000000) / 1000);
    let rest = number % 1000;

    if (millions > 0) {
        if (millions === 1) parts.push('مليون');
        else if (millions === 2) parts.push('مليونان');
        else if (millions >= 3 && millions <= 10) parts.push(convertGroup(millions) + ' ملايين');
        else parts.push(convertGroup(millions) + ' مليون');
    }

    if (thousands > 0) {
        if (thousands === 1) parts.push('ألف');
        else if (thousands === 2) parts.push('ألفان');
        else if (thousands >= 3 && thousands <= 10) parts.push(convertGroup(thousands) + ' آلاف');
        else parts.push(convertGroup(thousands) + ' ألف');
    }

    if (rest > 0) {
        parts.push(convertGroup(rest));
    }

    return parts.join(' و') + ' ريال يمني فقط لا غير';
}

function toggleDrawer(open) {
    document.getElementById('settingsPanel').classList.toggle('open', open);
}

function setMode(mode) {
    document.body.setAttribute('data-mode', mode);
    document.getElementById('btnModeManual').classList.toggle('active', mode === 'manual');
    document.getElementById('btnModeDigital').classList.toggle('active', mode === 'digital');
    
    if (mode === 'digital') {
        if (!document.getElementById('digDate').value) setTodayDate();
        if (!document.getElementById('digReceiptNo').value) generateNextReceiptNo();
    }
}

function setSize(size) {
    document.documentElement.setAttribute('data-size', size);
    document.getElementById('btnSizeA5').classList.toggle('active', size === 'a5');
    document.getElementById('btnSizeA4').classList.toggle('active', size === 'a4');
    document.getElementById('btnSizeThermal').classList.toggle('active', size === 'thermal');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeClassic').classList.toggle('active', theme === 'classic');
    document.getElementById('themeModern').classList.toggle('active', theme === 'modern');
    document.getElementById('themeMono').classList.toggle('active', theme === 'mono');
}

function setFont(fontFamily) {
    document.body.style.fontFamily = fontFamily;
}

let currentScale = 100;
function adjustFontSize(delta) {
    currentScale = Math.max(85, Math.min(125, currentScale + (delta * 5)));
    document.documentElement.style.setProperty('--font-scale', currentScale / 100);
    document.getElementById('fontScaleLabel').innerText = currentScale + '%';
}

// أدوات الإدخال السريع
function localDateISO() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}
function readHistory() {
    try {
        const value = JSON.parse(localStorage.getItem('alssaedy_receipts_history') || '[]');
        return Array.isArray(value) ? value : [];
    } catch (e) { return []; }
}
function nextReceiptNumber() {
    const history = readHistory();
    const stored = parseInt(localStorage.getItem('alssaedy_next_receipt_no') || '0', 10);
    const maxExisting = history.reduce((max, item) => {
        const match = String(item?.recNo || '').match(/^REC-(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const next = Math.max(stored, maxExisting) + 1;
    localStorage.setItem('alssaedy_next_receipt_no', String(next));
    return 'REC-' + String(next).padStart(3, '0');
}
function setTodayDate() {
    document.getElementById('digDate').value = localDateISO();
}
function generateNextReceiptNo() {
    document.getElementById('digReceiptNo').value = nextReceiptNumber();
}

function clearReceiptInputs() {
    if (!confirm('هل تريد تفريغ حقول السند الحالية؟')) return;
    document.getElementById('digReceiptNo').value = nextReceiptNumber();
    setTodayDate();
    ['digClientName','digPaid','digTotal','digPaidTable','digBalance','digTafqeet','digRef','digTooth'].forEach(id => document.getElementById(id).value = '');
    document.querySelectorAll('.srv-check').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => radio.checked = radio.value === 'نقداً');
}

function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            applyLogo(e.target.result);
            localStorage.setItem('alssaedy_custom_logo', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function applyLogo(url) {
    document.getElementById('clinicLogoImg').src = url;
    document.getElementById('watermarkLayer').style.backgroundImage = `url('${url}')`;
}

function resetOfficialLogo() {
    localStorage.removeItem('alssaedy_custom_logo');
    applyLogo(OFFICIAL_LOGO_URL);
    alert('تمت استعادة الشعار الرسمي المعتمد للعيادة بنجاح.');
}

function toggleWatermark() {
    document.body.classList.toggle('hide-watermark');
}

let isEditing = false;
function toggleEditMode() {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    const btn = document.getElementById('btnEdit');
    btn.innerText = isEditing ? '💾 حفظ التعديلات' : '✏️ تفعيل التعديل المباشر';
    btn.style.background = isEditing ? '#10b981' : '#f59e0b';

    const editables = document.querySelectorAll('.editable');
    editables.forEach(el => {
        el.setAttribute('contenteditable', isEditing ? 'true' : 'false');
    });

    if (!isEditing) {
        const data = {};
        editables.forEach(el => { data[el.dataset.key] = el.innerText; });
        localStorage.setItem('alssaedy_texts', JSON.stringify(data));
    }
}

// حساب المبالغ والتفقيط التلقائي الفوري
function calculateLedger() {
    const paidVal = document.getElementById('digPaid').value;
    const paid = parseFloat(paidVal) || 0;
    const total = parseFloat(document.getElementById('digTotal').value) || 0;
    
    document.getElementById('digPaidTable').value = paid ? paid : '';
    document.getElementById('digBalance').value = (total || paid) ? (total - paid) : '';

    // التفقيط التلقائي فور كتابة المبلغ المدفوع
    if (paid > 0) {
        document.getElementById('digTafqeet').value = tafqeetRial(paid);
    }
}

// تشغيل الطباعة بطريقة موثوقة في جميع المتصفحات
function triggerPrint() {
    window.focus();
    setTimeout(() => {
        window.print();
    }, 150);
}

// توليد صورة نقية خالية من تشوهات النصوص
async function generateReceiptCanvas() {
    document.body.classList.add('is-capturing');
    await document.fonts.ready;
    const receipt = document.getElementById('receiptPrintArea');
    
    const canvas = await html2canvas(receipt, {
        scale: 2.8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: false
    });
    
    document.body.classList.remove('is-capturing');
    return canvas;
}

async function downloadReceiptImage() {
    try {
        const canvas = await generateReceiptCanvas();
        const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
        const link = document.createElement('a');
        link.download = `سند_قبض_${recNo}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();
    } catch(e) {
        alert('تعذر إنشاء الصورة: ' + e.message);
    }
}

function openShareModal() { document.getElementById('shareModal').classList.add('open'); }
function closeShareModal() { document.getElementById('shareModal').classList.remove('open'); }
function openHistoryModal() {
    renderHistory();
    document.getElementById('historyModal').classList.add('open');
}
function closeHistoryModal() { document.getElementById('historyModal').classList.remove('open'); }

function getReceiptText() {
    const name = document.getElementById('digClientName').value || 'المريض الكريم';
    const paid = document.getElementById('digPaid').value || '0';
    const total = document.getElementById('digTotal').value || '0';
    const balance = document.getElementById('digBalance').value || '0';
    const date = document.getElementById('digDate').value || localDateISO();
    const recNo = document.getElementById('digReceiptNo').value || '---';
    const payment = document.querySelector('input[name="payMethod"]:checked')?.value || 'نقداً';
    const ref = document.getElementById('digRef').value || '';
    const tooth = document.getElementById('digTooth').value || '';
    const services = [...document.querySelectorAll('.srv-check:checked')].map(cb => cb.value);
    const lines = ['*سند قبض - عيادة الدكتور صلاح الدين السعيدي*', 'رقم السند: ' + recNo, 'التاريخ: ' + date, 'المريض: ' + name];
    if (services.length) lines.push('الخدمات: ' + services.join('، '));
    if (tooth) lines.push('رقم السن أو الموضع: ' + tooth);
    lines.push('-----------------------------', 'المبلغ المدفوع: ' + paid + ' ريال يمني', 'إجمالي الحساب: ' + total + ' ريال يمني', 'المتبقي: ' + balance + ' ريال يمني', 'طريقة الدفع: ' + payment);
    if (ref) lines.push('مرجع التحويل: ' + ref);
    lines.push('-----------------------------', 'شكرًا لثقتكم بنا، مع تمنياتنا لكم بدوام الصحة والعافية.', 'ريمة – كسمة – عزلة الضبارة', '+967 716 339 366 • +967 739 550 138 • +967 775 956 520');
    return lines.join('\n');
}
function shareWhatsAppText() {
    closeShareModal();
    const text = getReceiptText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

async function shareReceiptImage() {
    closeShareModal();
    try {
        const canvas = await generateReceiptCanvas();
        canvas.toBlob(async (blob) => {
            if (!blob) return shareWhatsAppText();
            const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
            const file = new File([blob], `سند_قبض_${recNo}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'سند قبض مالي',
                    text: getReceiptText()
                });
            } else {
                downloadReceiptImage();
                setTimeout(shareWhatsAppText, 1000);
            }
        }, 'image/png', 0.95);
    } catch(e) {
        shareWhatsAppText();
    }
}

function copyReceiptText() {
    closeShareModal();
    const text = getReceiptText();
    navigator.clipboard.writeText(text).then(() => {
        alert('تم نسخ بيانات السند إلى الحافظة بنجاح.');
    }).catch(() => { alert(text); });
}

// السجل المحلي
function saveReceiptLocally() {
    const recNoInput = document.getElementById('digReceiptNo').value.trim();
    const recNo = recNoInput || nextReceiptNumber();
    const record = {
        id: Date.now(), recNo,
        date: document.getElementById('digDate').value || localDateISO(),
        name: document.getElementById('digClientName').value || 'مريض بدون اسم',
        paid: document.getElementById('digPaid').value || '0',
        total: document.getElementById('digTotal').value || '0',
        balance: document.getElementById('digBalance').value || '0',
        tooth: document.getElementById('digTooth').value || '',
        tafqeet: document.getElementById('digTafqeet').value || '',
        paymentMethod: document.querySelector('input[name="payMethod"]:checked')?.value || 'نقداً',
        ref: document.getElementById('digRef').value || '',
        services: [...document.querySelectorAll('.srv-check:checked')].map(cb => cb.value)
    };
    const history = readHistory();
    if (history.some(item => item.recNo === record.recNo)) {
        record.recNo = nextReceiptNumber();
        document.getElementById('digReceiptNo').value = record.recNo;
    }
    history.unshift(record);
    localStorage.setItem('alssaedy_receipts_history', JSON.stringify(history));
    updateHistoryCount();
    alert('تم حفظ السند في السجل المحلي بنجاح.');
}
function updateHistoryCount() {
    const history = readHistory();
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
                <strong>${escapeHTML(item.name)} (${escapeHTML(item.recNo)})</strong>
                <small>التاريخ: ${escapeHTML(item.date)} | المدفوع: ${escapeHTML(item.paid)} ريال | المتبقي: ${escapeHTML(item.balance)} ريال</small>
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
    document.getElementById('digTooth').value = item.tooth || '';
    document.getElementById('digTafqeet').value = item.tafqeet || '';
    document.getElementById('digRef').value = item.ref || '';
    document.querySelectorAll('input[name="payMethod"]').forEach(radio => radio.checked = radio.value === (item.paymentMethod || 'نقداً'));
    document.querySelectorAll('.srv-check').forEach(cb => cb.checked = Array.isArray(item.services) && item.services.includes(cb.value));
    calculateLedger();
    closeHistoryModal();
}

function deleteReceipt(id) {
    let history = readHistory();
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

window.addEventListener('DOMContentLoaded', () => {
    const customLogo = localStorage.getItem('alssaedy_custom_logo');
    applyLogo(customLogo || OFFICIAL_LOGO_URL);

    const savedTexts = localStorage.getItem('alssaedy_texts');
    if (savedTexts) {
        try {
            const data = JSON.parse(savedTexts);
            document.querySelectorAll('.editable').forEach(el => {
                if (data[el.dataset.key]) el.innerText = data[el.dataset.key];
            });
        } catch(e){}
    }
    updateHistoryCount();
    if (!document.getElementById('digDate').value) setTodayDate();
    if (!document.getElementById('digReceiptNo').value) generateNextReceiptNo();
});
