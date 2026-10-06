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

function calculateLedger() {
    const paidVal = document.getElementById('digPaid').value;
    const paid = parseFloat(paidVal) || 0;
    const total = parseFloat(document.getElementById('digTotal').value) || 0;
    
    document.getElementById('digPaidTable').value = paid ? paid : '';
    document.getElementById('digBalance').value = (total || paid) ? Math.max(0, total - paid) : '';

    if (paid > 0) {
        document.getElementById('digTafqeet').value = tafqeetRial(paid);
    }
}
