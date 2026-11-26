package app.protocolo.android;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class EventReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (PhraseController.ACTION.equals(intent.getAction())) PhraseController.fire(context,false);
        else if (ReminderController.REMIND.equals(intent.getAction())) ReminderController.fireDue(context);
        else {
            ReminderController.createChannel(context);
            AgendaWidget.updateAll(context);
            ReminderController.reschedule(context);
            if (Intent.ACTION_TIME_CHANGED.equals(intent.getAction()) || Intent.ACTION_TIMEZONE_CHANGED.equals(intent.getAction())) {
                PhraseController.resetSchedule(context);
            } else {
                PhraseController.schedule(context);
            }
        }
    }
}
