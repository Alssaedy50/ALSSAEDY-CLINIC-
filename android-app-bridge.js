(function () {
    if (!window.Android) return;

    window.print = function () {
        Android.printReceipt();
    };

    window.open = function (url) {
        if (url) Android.openUrl(String(url));
        return null;
    };

    if (!navigator.clipboard) {
        navigator.clipboard = {};
    }
    navigator.clipboard.writeText = function (text) {
        Android.copyText(String(text || ""));
        return Promise.resolve();
    };

    window.downloadReceiptImage = async function () {
        try {
            const canvas = await generateReceiptCanvas();
            const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
            const filename = 'سند_قبض_' + recNo;
            Android.saveImage(canvas.toDataURL('image/png', 0.95), filename);
        } catch (e) {
            alert('تعذر إنشاء الصورة: ' + e.message);
        }
    };

    window.shareReceiptImage = async function () {
        try {
            closeShareModal();
            const canvas = await generateReceiptCanvas();
            const recNo = document.getElementById('digReceiptNo')?.value || 'سند';
            Android.shareImage(
                canvas.toDataURL('image/png', 0.95),
                'سند_قبض_' + recNo,
                getReceiptText()
            );
        } catch (e) {
            shareWhatsAppText();
        }
    };
})();