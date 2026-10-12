package app.protocolo.android;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public final class MainActivity extends Activity {
    private static final String HOST = "protocolo.local";
    private static final int IMPORT = 201, EXPORT = 202, NOTIFICATIONS = 203;
    private WebView web;
    private FrameLayout container;
    private boolean pageReady;
    private String pendingEvent, pendingBackup;
    private ValueCallback<Uri[]> fileCallback;

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        ReminderController.createChannel(this);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        boolean dark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        int background = dark ? Color.rgb(12, 20, 39) : Color.rgb(243, 246, 255);
        getWindow().setStatusBarColor(background);
        getWindow().setNavigationBarColor(background);
        FrameLayout root = new FrameLayout(this);container=root;
        root.setBackgroundColor(background);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            } else view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        web = new WebView(this);
        web.setBackgroundColor(background);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(true); // Only user-selected backup documents.
        web.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= 33) web.getSettings().setAlgorithmicDarkeningAllowed(false);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        web.addJavascriptInterface(new NativeBridge(), "ProtocoloNative");
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !HOST.equals(uri.getHost())) return rejected();
                String path = uri.getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                if (path.contains("..") || path.indexOf('\\') >= 0) return rejected();
                String type = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".svg") ? "image/svg+xml" : path.endsWith(".png") ? "image/png" : "application/octet-stream";
                try { return new WebResourceResponse(type, "UTF-8", getAssets().open("web" + path)); }
                catch (Exception e) { return rejected(); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) return false;
                if (request.hasGesture() && ("https".equals(uri.getScheme()) || "http".equals(uri.getScheme()))) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
                }
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                pageReady = true;
                dispatchPendingEvent();
                signal("status", true, "");
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
                    startActivityForResult(intent, IMPORT);
                } catch (Exception e) { fileCallback.onReceiveValue(null); fileCallback = null; }
                return true;
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (saved != null && saved.getBoolean("pendingBackup", false)) {
            try { pendingBackup = new String(java.nio.file.Files.readAllBytes(new java.io.File(getCacheDir(), "pending-backup.json").toPath()), StandardCharsets.UTF_8); }
            catch (Exception ignored) { }
        }
        if (getIntent().hasExtra("eventId")) pendingEvent = getIntent().getStringExtra("eventId");
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        web.loadUrl("https://" + HOST + "/index.html");
        ReminderController.reschedule(this);
        AgendaWidget.updateAll(this);
    }

    private WebResourceResponse rejected() {
        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not available", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent); setIntent(intent);
        if (intent.hasExtra("eventId")) { pendingEvent = intent.getStringExtra("eventId"); dispatchPendingEvent(); }
    }
    private void dispatchPendingEvent() {
        if (!pageReady || pendingEvent == null) return;
        web.evaluateJavascript("window.dispatchEvent(new CustomEvent('protocolo-open-event',{detail:{id:" + JSONObject.quote(pendingEvent) + "}}));", null);
        pendingEvent = null;getIntent().removeExtra("eventId");
    }
    @Override protected void onResume() {
        super.onResume();
        if (web != null) { ReminderController.reschedule(this); AgendaWidget.updateAll(this); signal("status", true, ""); }
    }
    @Override protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (pendingBackup != null) out.putBoolean("pendingBackup", true);
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        if (web != null) { web.removeJavascriptInterface("ProtocoloNative"); web.destroy();web=null;pageReady=false; }
        super.onDestroy();
    }
    @Override public void onBackPressed() { handleBack(); }
    private void handleBack() {
        if (!pageReady) { finish(); return; }
        web.evaluateJavascript("(function(){if(!window.NativePlatform)return false;window.dispatchEvent(new CustomEvent('protocolo-native-back'));return true;})()", value -> {if(!"true".equals(value))finish();});
    }

    private void signal(String kind, boolean success, String message) {
        if (!pageReady || web == null || isFinishing() || isDestroyed()) return;
        try {
            JSONObject detail = new JSONObject().put("kind", kind).put("success", success).put("message", message);
            web.evaluateJavascript("window.dispatchEvent(new CustomEvent('protocolo-native-status',{detail:" + detail + "}));", null);
        } catch (Exception ignored) { }
    }

    private void enableReminders() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            AgendaStore.prefs(this).edit().putBoolean("permissionRequested", true).apply();
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATIONS); return;
        }
        AgendaStore.prefs(this).edit().putBoolean("enabled", true).apply();
        ReminderController.reschedule(this);
        signal("status", true, ReminderController.notificationsAllowed(this) ? "Lembretes ativados." : "Permite as notificações nas configurações do Android.");
    }
    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == NOTIFICATIONS) {
            boolean granted = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
            AgendaStore.prefs(this).edit().putBoolean("enabled", granted).apply();
            ReminderController.reschedule(this);
            signal("status", granted, granted ? "Lembretes ativados." : "Notificações não permitidas. Podes ativá-las nas configurações do Android.");
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == IMPORT && fileCallback != null) {
            fileCallback.onReceiveValue(result == RESULT_OK && data != null && data.getData() != null ? new Uri[]{data.getData()} : null);
            fileCallback = null;
        }
        if (request == EXPORT) {
            if (result == RESULT_OK && data != null && data.getData() != null && pendingBackup != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out == null) throw new IllegalStateException("No document");
                    out.write(pendingBackup.getBytes(StandardCharsets.UTF_8));
                    signal("backup", true, "Backup guardado.");
                } catch (Exception e) { signal("backup", false, "Não foi possível guardar o backup."); }
            } else signal("backup", false, "Exportação cancelada.");
            pendingBackup = null;
            new java.io.File(getCacheDir(), "pending-backup.json").delete();
        }
    }

    public final class NativeBridge {
        @JavascriptInterface public void setAppearance(String color, boolean dark) {
            if(color==null || !color.matches("#[0-9a-fA-F]{6}"))return;
            runOnUiThread(() -> {
                if(web==null)return;
                int background=Color.parseColor(color);
                container.setBackgroundColor(background);web.setBackgroundColor(background);
                getWindow().setStatusBarColor(background);getWindow().setNavigationBarColor(background);
                if(Build.VERSION.SDK_INT>=30 && getWindow().getInsetsController()!=null){
                    int mask=android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                    getWindow().getInsetsController().setSystemBarsAppearance(dark?0:mask,mask);
                }else{
                    int flags=getWindow().getDecorView().getSystemUiVisibility();
                    int mask=View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR|View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    getWindow().getDecorView().setSystemUiVisibility(dark?flags&~mask:flags|mask);
                }
            });
        }
        @JavascriptInterface public String getStatus() {
            try {
                return new JSONObject().put("enabled", AgendaStore.prefs(MainActivity.this).getBoolean("enabled", false))
                    .put("notificationsAllowed", ReminderController.notificationsAllowed(MainActivity.this))
                    .put("permissionRequested", AgendaStore.prefs(MainActivity.this).getBoolean("permissionRequested", false))
                    .put("exactAllowed", ReminderController.exactAllowed(MainActivity.this))
                    .put("leadMinutes", AgendaStore.prefs(MainActivity.this).getInt("lead", 30))
                    .put("widgetSupported", AppWidgetManager.getInstance(MainActivity.this).isRequestPinAppWidgetSupported()).toString();
            } catch (Exception e) { return "{}"; }
        }
        @JavascriptInterface public void syncAgenda(String json) {
            if (json == null || json.length() > 2000000) return;
            try { if (new JSONArray(json).length() > 1000) return; } catch (Exception e) { return; }
            runOnUiThread(() -> {
                if (json.equals(AgendaStore.prefs(MainActivity.this).getString("events", "[]"))) return;
                List<AgendaEvent> old = AgendaStore.events(MainActivity.this);
                AgendaStore.prefs(MainActivity.this).edit().putString("events", json).apply();
                java.util.Map<String, String> retained = new java.util.HashMap<>();
                for (AgendaEvent event : AgendaStore.events(MainActivity.this)) retained.put(event.id, event.key);
                for (AgendaEvent event : old) if (!event.key.equals(retained.get(event.id))) getSystemService(NotificationManager.class).cancel(event.id, 1);
                AgendaStore.retainFired(MainActivity.this);
                ReminderController.reschedule(MainActivity.this); AgendaWidget.updateAll(MainActivity.this);
            });
        }
        @JavascriptInterface public void syncActivities(String json) {
            if(json==null || json.length()>2000000)return;
            try {if(new JSONObject(json).getJSONArray("week").length()!=7)return;}catch(Exception e){return;}
            runOnUiThread(() -> {
                if(json.equals(AgendaStore.prefs(MainActivity.this).getString("activities","{}")))return;
                List<AgendaEvent> old=ActivityStore.events(MainActivity.this);
                AgendaStore.prefs(MainActivity.this).edit().putString("activities",json).apply();
                java.util.Map<String,String> retained=new java.util.HashMap<>();
                for(AgendaEvent event:ActivityStore.events(MainActivity.this))if(!event.done)retained.put(event.id,event.key);
                for(AgendaEvent event:old)if(!event.key.equals(retained.get(event.id)))getSystemService(NotificationManager.class).cancel(event.id,1);
                AgendaStore.retainFired(MainActivity.this);
                ReminderController.reschedule(MainActivity.this);AgendaWidget.updateAll(MainActivity.this);
            });
        }
        @JavascriptInterface public void requestReminders() { runOnUiThread(() -> enableReminders()); }
        @JavascriptInterface public void disableReminders() {
            runOnUiThread(() -> { AgendaStore.prefs(MainActivity.this).edit().putBoolean("enabled", false).apply(); ReminderController.reschedule(MainActivity.this); signal("status", true, "Lembretes desativados."); });
        }
        @JavascriptInterface public void setLeadMinutes(int minutes) {
            if (!EventTiming.validLead(minutes)) return;
            runOnUiThread(() -> { AgendaStore.prefs(MainActivity.this).edit().putInt("lead", minutes).apply(); ReminderController.reschedule(MainActivity.this); signal("status", true, "Antecedência atualizada."); });
        }
        @JavascriptInterface public void requestExactAlarms() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 31 && !ReminderController.exactAllowed(MainActivity.this)) {
                    try { startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName()))); }
                    catch (Exception e) { signal("status", false, "Abre as permissões do app nas configurações do Android."); }
                }
            });
        }
        @JavascriptInterface public void openNotificationSettings() {
            runOnUiThread(() -> startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName())));
        }
        @JavascriptInterface public void requestWidget() {
            runOnUiThread(() -> {
                AppWidgetManager manager = AppWidgetManager.getInstance(MainActivity.this);
                if (!manager.isRequestPinAppWidgetSupported()) { signal("widget", false, "Mantém pressionada a tela inicial e escolhe Widgets → Protocolo."); return; }
                try {
                    boolean requested = manager.requestPinAppWidget(new ComponentName(MainActivity.this, AgendaWidget.class), null, null);
                    signal("widget", requested, requested ? "Confirma a adição do widget no Android." : "Adiciona Protocolo pelo menu Widgets da tela inicial.");
                }catch(RuntimeException e){signal("widget",false,"Adiciona Protocolo pelo menu Widgets da tela inicial.");}
            });
        }
        @JavascriptInterface public void exportBackup(String json) {
            if (json == null || json.length() > 10000000) return;
            runOnUiThread(() -> {
                if (pendingBackup != null) return;
                pendingBackup = json;
                try { java.nio.file.Files.write(new java.io.File(getCacheDir(), "pending-backup.json").toPath(), json.getBytes(StandardCharsets.UTF_8)); }
                catch (Exception e) { pendingBackup = null; signal("backup", false, "Não foi possível preparar o backup."); return; }
                try { startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE, "protocolo-backup-" + java.time.LocalDate.now() + ".json"), EXPORT); }
                catch (Exception e) { pendingBackup = null; signal("backup", false, "Não foi possível abrir o seletor de documentos."); }
            });
        }
        @JavascriptInterface public void exitApp() { runOnUiThread(() -> finish()); }
    }
}
