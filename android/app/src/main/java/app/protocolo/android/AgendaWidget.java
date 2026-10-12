package app.protocolo.android;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

public final class AgendaWidget extends AppWidgetProvider {
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
        List<ActivitySchedule.Occurrence> rows=ActivityStore.rows(context,1);
        long done=rows.stream().filter(row->row.done).count();
        String date=LocalDate.now().format(DateTimeFormatter.ofPattern("EEE, d MMM",new Locale("pt","PT")));
        for(int widget:widgets) {
            RemoteViews views=new RemoteViews(context.getPackageName(),R.layout.agenda_widget);
            views.setTextViewText(R.id.widget_progress,date+" · "+done+"/"+rows.size()+" cumpridas");
            views.setOnClickPendingIntent(R.id.widget_open,openEvent(context,"activities"));
            Intent adapter=new Intent(context,ActivityWidgetService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,widget).setData(Uri.parse("protocolo-widget://activities/"+widget));
            views.setRemoteAdapter(R.id.widget_list,adapter);
            views.setEmptyView(R.id.widget_list,R.id.widget_empty);
            Intent open=new Intent(context,MainActivity.class).setAction("widget-activity:"+widget).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags=PendingIntent.FLAG_UPDATE_CURRENT|(Build.VERSION.SDK_INT>=31?PendingIntent.FLAG_MUTABLE:0);
            views.setPendingIntentTemplate(R.id.widget_list,PendingIntent.getActivity(context,widget,open,flags));
            manager.updateAppWidget(widget,views);
        }
        manager.notifyAppWidgetViewDataChanged(widgets,R.id.widget_list);
    }
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        update(context,manager,ids);ReminderController.reschedule(context);
    }
    @Override public void onDisabled(Context context) { ReminderController.reschedule(context); }
    @Override public void onEnabled(Context context) { ReminderController.reschedule(context); }
}
