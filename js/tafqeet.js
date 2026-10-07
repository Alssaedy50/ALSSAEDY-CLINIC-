function currencyWordsName() {
    if (typeof getCurrencyInfo === 'function') {
        const info = getCurrencyInfo();
        if (info && info.nameAr) return info.nameAr;
    }
    return 'ريال يمني';
}

function tafqeetRial(number, currencyName) {
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

    function scaleWord(count, singular, dual, few, many) {
        if (count === 1) return singular;
        if (count === 2) return dual;
        if (count >= 3 && count <= 10) return convertGroup(count) + ' ' + few;
        return convertGroup(count) + ' ' + many;
    }

    if (millions > 0) parts.push(scaleWord(millions, 'مليون', 'مليونان', 'ملايين', 'مليون'));
    if (thousands > 0) parts.push(scaleWord(thousands, 'ألف', 'ألفان', 'آلاف', 'ألف'));
    if (rest > 0) {
        parts.push(convertGroup(rest));
    }

    return parts.join(' و') + ' ' + (currencyName || currencyWordsName()) + ' فقط لا غير';
}

function calculateLedger() {
    const paidEl = document.getElementById('digPaid');
    const totalEl = document.getElementById('digTotal');
    if (!paidEl || !totalEl) return;
    const paidTableEl = document.getElementById('digPaidTable');
    const balanceEl = document.getElementById('digBalance');
    const tafqeetEl = document.getElementById('digTafqeet');

    const paid = Math.max(0, parseFloat(paidEl.value) || 0);
    const total = Math.max(0, parseFloat(totalEl.value) || 0);

    if (paidTableEl) paidTableEl.value = paid ? paid : '';
    if (balanceEl) balanceEl.value = (total || paid) ? Math.max(0, total - paid) : '';
    // Clear the words field when there is no paid amount so stale text never
    // survives a "تفريغ" or a receipt edited back to zero.
    if (tafqeetEl) tafqeetEl.value = paid > 0 ? tafqeetRial(paid) : '';
}
