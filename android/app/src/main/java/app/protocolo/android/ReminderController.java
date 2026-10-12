package app.protocolo.android;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;

final class ReminderController {
    static final String CHANNEL = "agenda";
    static final String REMIND = "app.protocolo.android.REMIND";
    static final String REFRESH = "app.protocolo.android.REFRESH_WIDGET";
    private static final int REMIND_CODE = 100, REFRESH_CODE = 101;

    static void createChannel(Context context) {
        NotificationChannel channel = new NotificationChannel(CHANNEL, "Agenda e lembretes", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Lembretes dos eventos guardados no Protocolo deste celular.");
        context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }

    static boolean notificationsAllowed(Context context) {
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        NotificationChannel channel = manager.getNotificationChannel(CHANNEL);
        return manager.areNotificationsEnabled() && (channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE);
    }

    static boolean exactAllowed(Context context) {
        return Build.VERSION.SDK_INT < 31 || context.getSystemService(AlarmManager.class).canScheduleExactAlarms();
    }

    private static PendingIntent alarmIntent(Context context, String action, int code) {
        return PendingIntent.getBroadcast(context, code, new Intent(context, EventReceiver.class).setAction(action), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void arm(Context context, long at, PendingIntent intent) {
        AlarmManager manager = context.getSystemService(AlarmManager.class);
        if (exactAllowed(context)) {
            try { manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent); return; }
            catch (SecurityException ignored) { /* Access can be revoked between checking and scheduling. */ }
        }
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent);
    }

    static synchronized void reschedule(Context context) {
        AlarmManager manager = context.getSystemService(AlarmManager.class);
        PendingIntent reminder = alarmIntent(context, REMIND, REMIND_CODE);
        PendingIntent refresh = alarmIntent(context, REFRESH, REFRESH_CODE);
        manager.cancel(reminder); manager.cancel(refresh);
        long now = System.currentTimeMillis();
        List<AgendaEvent> events = AgendaStore.upcoming(context, now);
        long expires = Long.MAX_VALUE;
        for (AgendaEvent event : events) expires = Math.min(expires, event.visibleUntil);
        if (expires != Long.MAX_VALUE && android.appwidget.AppWidgetManager.getInstance(context).getAppWidgetIds(new android.content.ComponentName(context, AgendaWidget.class)).length>0) arm(context, expires + 1000L, refresh);
        if (!AgendaStore.prefs(context).getBoolean("enabled", false) || !notificationsAllowed(context)) return;
        Set<String> fired = AgendaStore.fired(context);
        int lead = AgendaStore.prefs(context).getInt("lead", 30);
        for (AgendaEvent event : events) {
            if (event.at > now && !fired.contains(event.key)) {
                arm(context, EventTiming.reminderMillis(event.at, lead, now), reminder);
                break;
            }
        }
    }

    static synchronized void fireDue(Context context) {
        createChannel(context);
        if (AgendaStore.prefs(context).getBoolean("enabled", false) && notificationsAllowed(context)) {
            long now = System.currentTimeMillis();
            int lead = AgendaStore.prefs(context).getInt("lead", 30);
            Set<String> fired = AgendaStore.fired(context);
            int count = 0;
            for (AgendaEvent event : AgendaStore.upcoming(context, now)) {
                if (event.at <= now || fired.contains(event.key) || event.at - lead * 60000L > now + 1000L) continue;
                // Persist before posting: a process restart cannot repeat a reminder.
                fired.add(event.key);
                AgendaStore.prefs(context).edit().putStringSet("fired", fired).commit();
                try { post(context, event, now); }
                catch (SecurityException e) {
                    fired.remove(event.key);
                    AgendaStore.prefs(context).edit().putStringSet("fired", fired).commit();
                    break;
                }
                if (++count >= 10) break;
            }
        }
        AgendaWidget.updateAll(context);
        reschedule(context);
    }

    private static void post(Context context, AgendaEvent event, long now) {
        long minutes = Math.max(1, (event.at - now + 59999L) / 60000L);
        String clock = DateTimeFormatter.ofPattern("d MMM · HH:mm", new Locale("pt", "PT")).format(Instant.ofEpochMilli(event.at).atZone(ZoneId.systemDefault()));
        String text = minutes < 60 ? "Começa em " + minutes + " min · " + clock : "Próximo evento · " + clock;
        if (event.time.isEmpty()) text += " · sem horário definido, considerado às 09:00";
        Notification publicVersion = new Notification.Builder(context, CHANNEL).setSmallIcon(R.drawable.ic_notification).setContentTitle("Lembrete do Protocolo").setContentText("Tens um evento na agenda.").build();
        Notification notification = new Notification.Builder(context, CHANNEL)
                .setSmallIcon(R.drawable.ic_notification).setContentTitle(event.title).setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text)).setColor(0xff2458e6)
                .setCategory(Notification.CATEGORY_EVENT).setAutoCancel(true).setOnlyAlertOnce(true)
                .setVisibility(Notification.VISIBILITY_PRIVATE).setPublicVersion(publicVersion)
                .setContentIntent(AgendaWidget.openEvent(context, event.id)).build();
        context.getSystemService(NotificationManager.class).notify(event.id, 1, notification);
    }
}
