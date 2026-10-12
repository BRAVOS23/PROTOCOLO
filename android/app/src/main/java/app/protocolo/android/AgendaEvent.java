package app.protocolo.android;

import org.json.JSONObject;
import java.time.ZoneId;

final class AgendaEvent {
    final String id, title, date, time, key;
    final long at, visibleUntil;

    AgendaEvent(JSONObject value) {
        id = value.optString("id");
        title = value.optString("title", "Evento");
        date = value.optString("date");
        time = value.optString("time");
        if (id.isEmpty() || id.length() > 200 || title.length() > 1000) throw new IllegalArgumentException("Invalid event");
        at = EventTiming.eventMillis(date, time, ZoneId.systemDefault());
        visibleUntil = EventTiming.visibleUntilMillis(date, time, ZoneId.systemDefault());
        key = EventTiming.eventKey(id, date, time);
    }
}
