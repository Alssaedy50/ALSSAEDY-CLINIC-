package com.alssaedy.clinic;

import android.app.Activity;
import android.print.PrintManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.content.pm.PackageManager;
import android.os.Environment;
import android.provider.MediaStore;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.Base64;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        webView = new WebView(this);
        setContentView(webView);
        createReminderChannel();
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 2001);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setSupportZoom(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " ALSSAEDY-CLINIC-Android/1.0");

        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new AndroidBridge(this), "Android");
        webView.setWebViewClient(new ClinicWebViewClient());

        webView.loadUrl("file:///android_asset/web/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) { webView.goBack(); return; }
        super.onBackPressed();
    }

    private class ClinicWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String scheme = uri.getScheme();
            if ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme) ||
                "whatsapp".equalsIgnoreCase(scheme) || "mailto".equalsIgnoreCase(scheme) ||
                "tel".equalsIgnoreCase(scheme)) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "لا يوجد تطبيق مناسب لهذا الرابط.", Toast.LENGTH_SHORT).show();
                }
                return true;
            }
            return false;
        }
    }

    public static class ReminderReceiver extends android.content.BroadcastReceiver {
        @Override public void onReceive(Context context, Intent intent) {
            String title=intent.getStringExtra("title");
            String text=intent.getStringExtra("text");
            NotificationManager nm=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
            if(Build.VERSION.SDK_INT>=26){
                NotificationChannel ch=new NotificationChannel("clinic_reminders","تنبيهات عيادة السعيدي",NotificationManager.IMPORTANCE_HIGH);
                nm.createNotificationChannel(ch);
            }
            android.app.Notification.Builder b=Build.VERSION.SDK_INT>=26?new android.app.Notification.Builder(context,"clinic_reminders"):new android.app.Notification.Builder(context);
            b.setSmallIcon(com.alssaedy.clinic.R.drawable.clinic_logo).setContentTitle(title).setContentText(text).setAutoCancel(true).setPriority(android.app.Notification.PRIORITY_HIGH);
            nm.notify((int)System.currentTimeMillis(),b.build());
        }
    }

    private void createReminderChannel(){
        if(Build.VERSION.SDK_INT>=26){
            NotificationManager nm=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
            nm.createNotificationChannel(new NotificationChannel("clinic_reminders","تنبيهات عيادة السعيدي",NotificationManager.IMPORTANCE_HIGH));
        }
    }

    public class AndroidBridge {
        private final Context context;

        AndroidBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void printReceipt() {
            printReceipt("a5");
        }

        @JavascriptInterface
        public void printReceipt(String size) {
            runOnUiThread(() -> {
                PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter("ALSSAEDY-Receipt");
                PrintAttributes.MediaSize mediaSize = getPrintMediaSize(size);
                printManager.print(
                    "ALSSAEDY-Receipt",
                    adapter,
                    new PrintAttributes.Builder()
                        .setMediaSize(mediaSize)
                        .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                        .setResolution(new PrintAttributes.Resolution("alssaedy", "ALSSAEDY", 300, 300))
                        .build()
                );
            });
        }

        private PrintAttributes.MediaSize getPrintMediaSize(String size) {
            if ("a4".equalsIgnoreCase(size)) return PrintAttributes.MediaSize.ISO_A4;
            if ("thermal".equalsIgnoreCase(size)) {
                // Android PrintAttributes uses mils (1/1000 inch): 80 x 240 mm.
                return new PrintAttributes.MediaSize(
                    "ALSSAEDY_THERMAL_80MM",
                    "80mm Thermal",
                    3150,
                    9449
                );
            }
            return PrintAttributes.MediaSize.ISO_A5;
        }

        @JavascriptInterface
        public void scheduleReminder(long triggerAtMillis, String title, String text) {
            try {
                AlarmManager alarm=(AlarmManager)getSystemService(ALARM_SERVICE);
                Intent intent=new Intent(MainActivity.this, ReminderReceiver.class);
                intent.putExtra("title", title==null?"موعد عودة":title);
                intent.putExtra("text", text==null?"لديك موعد متابعة في العيادة.":text);
                int request=(int)(triggerAtMillis ^ (triggerAtMillis >>> 32));
                PendingIntent pi=PendingIntent.getBroadcast(MainActivity.this,request,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
                if(alarm!=null) alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,triggerAtMillis,pi);
            } catch(Exception e) {}
        }

        @JavascriptInterface
        public void shareText(String text) {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_TEXT, text == null ? "" : text);
                startActivity(Intent.createChooser(intent, "إرسال سند القبض"));
            });
        }

        @JavascriptInterface
        public void copyText(String text) {
            ClipboardManager clipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
            clipboard.setPrimaryClip(ClipData.newPlainText("ALSSAEDY", text == null ? "" : text));
            runOnUiThread(() -> Toast.makeText(MainActivity.this, "تم نسخ بيانات السند إلى الحافظة.", Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void openUrl(String url) {
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "تعذر فتح الرابط.", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void saveImage(String dataUrl, String fileName) {
            try {
                Uri uri = writeImageToMediaStore(dataUrl, fileName);
                if (uri != null) {
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "تم حفظ الصورة في صور العيادة.", Toast.LENGTH_SHORT).show());
                }
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "تعذر حفظ الصورة.", Toast.LENGTH_SHORT).show());
            }
        }

        @JavascriptInterface
        public void saveTransactionsFile(String content, String fileName, String mimeType) {
            try {
                Uri uri = writeTextToDownloads(content, fileName, mimeType);
                if (uri != null) {
                    runOnUiThread(() -> Toast.makeText(
                        MainActivity.this,
                        "تم حفظ ملف سجل المعاملات في مجلد التنزيلات.",
                        Toast.LENGTH_LONG
                    ).show());
                }
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(
                    MainActivity.this,
                    "تعذر حفظ ملف سجل المعاملات.",
                    Toast.LENGTH_SHORT
                ).show());
            }
        }

        private Uri writeTextToDownloads(String content, String fileName, String mimeType) throws Exception {
            String safeName = (fileName == null || fileName.trim().isEmpty() ? "ALSSAEDY_Clinic_Transactions.json" : fileName)
                    .replaceAll("[^A-Za-z0-9_.\u0600-\u06FF-]", "_");

            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, safeName);
            values.put(MediaStore.Downloads.MIME_TYPE, mimeType == null ? "application/octet-stream" : mimeType);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ALSSAEDY Clinic");
            values.put(MediaStore.Downloads.IS_PENDING, 1);

            Uri collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
            Uri uri = getContentResolver().insert(collection, values);
            if (uri == null) return null;

            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                out.write((content == null ? "" : content).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }

            values.clear();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            getContentResolver().update(uri, values, null, null);
            return uri;
        }

        @JavascriptInterface
        public void shareImage(String dataUrl, String fileName, String text) {
            try {
                Uri uri = writeImageToMediaStore(dataUrl, fileName);
                if (uri == null) return;
                runOnUiThread(() -> {
                    Intent intent = new Intent(Intent.ACTION_SEND);
                    intent.setType("image/png");
                    intent.putExtra(Intent.EXTRA_STREAM, uri);
                    intent.putExtra(Intent.EXTRA_TEXT, text == null ? "" : text);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(intent, "إرسال سند القبض"));
                });
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "تعذر مشاركة الصورة.", Toast.LENGTH_SHORT).show());
            }
        }

        private Uri writeImageToMediaStore(String dataUrl, String fileName) throws Exception {
            if (dataUrl == null || !dataUrl.contains(",")) return null;
            byte[] bytes = Base64.getDecoder().decode(dataUrl.substring(dataUrl.indexOf(',') + 1));
            String safeName = (fileName == null || fileName.trim().isEmpty() ? "receipt" : fileName)
                    .replaceAll("[^A-Za-z0-9_\\-\\u0600-\\u06FF]", "_") + ".png";

            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, safeName);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/ALSSAEDY Clinic");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);

            Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) return null;

            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                out.write(bytes);
            }

            values.clear();
            values.put(MediaStore.Images.Media.IS_PENDING, 0);
            getContentResolver().update(uri, values, null, null);
            return uri;
        }
    }
}
