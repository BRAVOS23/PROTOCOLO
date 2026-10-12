package app.protocolo.android;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class EventReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (ReminderController.REMIND.equals(intent.getAction())) ReminderController.fireDue(context);
        else {
            ReminderController.createChannel(context);
            AgendaWidget.updateAll(context);
            ReminderController.reschedule(context);
        }
    }
}
