package app.protocolo.android;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;

final class PhraseController {
    static final String ACTION = "app.protocolo.android.PHRASE", CHANNEL = "phrases";
    private static final int ALARM_CODE = 200, NOTIFICATION_CODE = 2001;
    private static final long HOUR = 3600000;
    private static final String ITEMS = "scheduled-items", NEXT = "scheduled-next";

    static SharedPreferences prefs(Context c){
        return c.getSharedPreferences("phrase-notifications", Context.MODE_PRIVATE);
    }

    static void channel(Context c){
        NotificationChannel channel = new NotificationChannel(CHANNEL, "Frases", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Frases nos dias e horários que escolheste.");
        c.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }

    static boolean allowed(Context c){
        if (Build.VERSION.SDK_INT >= 33 && c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        NotificationManager manager = c.getSystemService(NotificationManager.class);
        NotificationChannel channel = manager.getNotificationChannel(CHANNEL);
        return manager.areNotificationsEnabled() && (channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE);
    }

    private static List<PhraseSchedule> read(JSONArray items) {
        List<PhraseSchedule> phrases = new ArrayList<>();
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null) continue;
            String text = item.optString("text", "").trim();
            JSONArray rawDays = item.optJSONArray("days"), rawTimes = item.optJSONArray("times");
            if (text.isEmpty() || text.length() > 2000 || rawDays == null || rawTimes == null) continue;
            SortedSet<Integer> days = new TreeSet<>();
            SortedSet<LocalTime> times = new TreeSet<>();
            for (int j = 0; j < rawDays.length(); j++) {
                int day = rawDays.optInt(j);
                if (day >= 1 && day <= 7) days.add(day);
            }
            for (int j = 0; j < rawTimes.length(); j++) {
                String time = rawTimes.optString(j);
                if (time.matches("(?:[01][0-9]|2[0-3]):[0-5][0-9]")) times.add(LocalTime.parse(time));
            }
            if (!days.isEmpty() && !times.isEmpty()) phrases.add(new PhraseSchedule(text, days, times));
        }
        return phrases;
    }

    private static List<PhraseSchedule> read(SharedPreferences p) {
        try {
            return read(new JSONArray(p.getString(ITEMS, "[]")));
        } catch (JSONException e) {
            return Collections.emptyList();
        }
    }

    static synchronized void sync(Context c, String payload) {
        try {
            JSONObject input = new JSONObject(payload);
            JSONArray items = input.getJSONArray("items");
            if (items.length() > 1000) return;
            SharedPreferences p = prefs(c);
            String value = items.toString();
            boolean enabled = input.optBoolean("enabled") && !read(items).isEmpty();
            SharedPreferences.Editor edit = p.edit().putBoolean("enabled", enabled).putString(ITEMS, value);
            if (!enabled || !p.getBoolean("enabled", false) || !value.equals(p.getString(ITEMS, "[]"))) edit.remove(NEXT);
            if (!edit.commit()) return;
            if (!enabled) c.getSystemService(NotificationManager.class).cancel(NOTIFICATION_CODE);
            schedule(c);
        } catch (JSONException ignored) {}
    }

    private static PendingIntent alarm(Context c){
        return PendingIntent.getBroadcast(c, ALARM_CODE, new Intent(c, EventReceiver.class).setAction(ACTION),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static synchronized void resetSchedule(Context c) {
        prefs(c).edit().remove(NEXT).apply();
        schedule(c);
    }

    static synchronized void schedule(Context c){
        channel(c);
        AlarmManager manager = c.getSystemService(AlarmManager.class);
        PendingIntent intent = alarm(c);
        manager.cancel(intent);
        SharedPreferences p = prefs(c);
        if (!p.getBoolean("enabled", false) || !allowed(c)) {
            p.edit().remove(NEXT).apply();
            return;
        }
        long now = System.currentTimeMillis();
        long at = p.getLong(NEXT, 0);
        if (at == 0 || at <= now - HOUR) {
            at = PhraseSchedule.next(read(p), now, ZoneId.systemDefault());
            if (!p.edit().putLong(NEXT, at).commit()) return;
        }
        if (at == 0) return;
        long trigger = Math.max(now + 1000, at);
        if (ReminderController.exactAllowed(c)) {
            try {
                manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, intent);
                return;
            } catch (SecurityException ignored) {}
        }
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, intent);
    }

    static synchronized void fire(Context c, boolean test) {
        channel(c);
        SharedPreferences p = prefs(c);
        if (!p.getBoolean("enabled", false) || !allowed(c)) {
            schedule(c);
            return;
        }
        List<PhraseSchedule> phrases = read(p);
        long now = System.currentTimeMillis(), planned = p.getLong(NEXT, 0);
        List<String> due = Collections.emptyList();
        if (test && !phrases.isEmpty()) {
            due = Collections.singletonList(phrases.get(0).text);
        } else if (!test && planned > 0 && planned <= now) {
            ZoneId zone = ZoneId.systemDefault();
            if (planned > now - HOUR) due = PhraseSchedule.at(phrases, planned, zone);
            long next = PhraseSchedule.next(phrases, now, zone);
            if (!p.edit().putLong(NEXT, next).commit()) return;
        }
        if (!due.isEmpty()) notify(c, due);
        schedule(c);
    }

    private static void notify(Context c, List<String> due) {
        Intent open = new Intent(c, MainActivity.class).setAction(ACTION + ".OPEN").putExtra("eventId", "phrases")
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent tap = PendingIntent.getActivity(c, 201, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String title = due.size() == 1 ? "Uma frase para ti" : due.size() + " frases para ti";
        String text = String.join("\n\n", due);
        Notification publicVersion = new Notification.Builder(c, CHANNEL).setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Protocolo").setContentText("Tens frases programadas.").build();
        Notification notification = new Notification.Builder(c, CHANNEL).setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title).setContentText(due.get(0)).setStyle(new Notification.BigTextStyle().bigText(text))
            .setCategory(Notification.CATEGORY_REMINDER).setColor(0xff853bff).setAutoCancel(true)
            .setTimeoutAfter(HOUR).setVisibility(Notification.VISIBILITY_PRIVATE).setPublicVersion(publicVersion)
            .setContentIntent(tap).build();
        try {
            c.getSystemService(NotificationManager.class).notify(NOTIFICATION_CODE, notification);
        } catch (SecurityException ignored) {}
    }

    static String status(Context c) {
        try {
            SharedPreferences p = prefs(c);
            return new JSONObject().put("enabled", p.getBoolean("enabled", false) && !p.getString(ITEMS, "[]").equals("[]"))
                .put("notificationsAllowed", allowed(c)).put("exactAllowed", ReminderController.exactAllowed(c))
                .put("next", p.getLong(NEXT, 0)).toString();
        } catch (JSONException e) {
            return "{}";
        }
    }
}
