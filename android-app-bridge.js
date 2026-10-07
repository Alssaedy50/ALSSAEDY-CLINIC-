(function () {
    if (!window.Android) return;

    // Native-only bridge. Export generation lives in js/export.js so browser and
    // Android use exactly the same rendering pipeline.
    window.print = function () {
        Android.printReceipt(typeof getSelectedSize === 'function' ? getSelectedSize() : 'a5');
    };
    window.open = function (url) {
        if (url) Android.openUrl(String(url));
        return null;
    };
    if (!navigator.clipboard) navigator.clipboard = {};
    navigator.clipboard.writeText = function (text) {
        Android.copyText(String(text || ''));
        return Promise.resolve();
    };
})();
