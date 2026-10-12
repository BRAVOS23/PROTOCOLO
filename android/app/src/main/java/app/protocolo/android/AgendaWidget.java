package app.protocolo.android;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

public final class AgendaWidget extends AppWidgetProvider {
    private static final int[] ROW = {R.id.widget_row_0, R.id.widget_row_1, R.id.widget_row_2};
    private static final int[] TITLE = {R.id.widget_title_0, R.id.widget_title_1, R.id.widget_title_2};
    private static final int[] DATE = {R.id.widget_date_0, R.id.widget_date_1, R.id.widget_date_2};

    static PendingIntent openEvent(Context context, String id) {
        Intent intent = new Intent(context, MainActivity.class).setAction("open-event:" + id).putExtra("eventId", id).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, id.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] widgets = manager.getAppWidgetIds(new ComponentName(context, AgendaWidget.class));
        if (widgets.length > 0) update(context, manager, widgets);
    }

    private static void update(Context context, AppWidgetManager manager, int[] widgets) {
        List<AgendaEvent> events = AgendaStore.upcoming(context, System.currentTimeMillis());
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.agenda_widget);
        views.setOnClickPendingIntent(R.id.widget_open, openEvent(context, ""));
        views.setOnClickPendingIntent(R.id.widget_root, openEvent(context, ""));
        views.setViewVisibility(R.id.widget_empty, events.isEmpty() ? View.VISIBLE : View.GONE);
        for (int i = 0; i < 3; i++) {
            boolean exists = i < events.size();
            views.setViewVisibility(ROW[i], exists ? View.VISIBLE : View.GONE);
            if (!exists) continue;
            AgendaEvent event = events.get(i);
            views.setTextViewText(TITLE[i], event.title);
            views.setTextViewText(DATE[i], dateLabel(event));
            views.setOnClickPendingIntent(ROW[i], openEvent(context, event.id));
        }
        manager.updateAppWidget(widgets, views);
    }

    private static String dateLabel(AgendaEvent event) {
        LocalDate date = LocalDate.parse(event.date), today = LocalDate.now();
        String label = date.equals(today) ? "Hoje" : date.equals(today.plusDays(1)) ? "Amanhã" : date.format(DateTimeFormatter.ofPattern("d MMM", new Locale("pt", "PT")));
        return label + " · " + (event.time.isEmpty() ? "sem horário" : event.time);
    }

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        update(context, manager, ids);
        ReminderController.reschedule(context);
    }
    @Override public void onDisabled(Context context) { ReminderController.reschedule(context); }
    @Override public void onEnabled(Context context) { ReminderController.reschedule(context); }
}
