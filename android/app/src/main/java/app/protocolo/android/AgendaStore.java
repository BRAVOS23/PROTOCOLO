package app.protocolo.android;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

final class AgendaStore {
    static SharedPreferences prefs(Context context) { return context.getSharedPreferences("agenda", Context.MODE_PRIVATE); }

    static List<AgendaEvent> events(Context context) {
        List<AgendaEvent> result = new ArrayList<>();
        try {
            JSONArray array = new JSONArray(prefs(context).getString("events", "[]"));
            Set<String> ids = new HashSet<>();
            for (int i = 0; i < Math.min(array.length(), 1000); i++) {
                try {
                    AgendaEvent event = new AgendaEvent(array.getJSONObject(i));
                    if (ids.add(event.id)) result.add(event);
                } catch (Exception ignored) { /* An invalid legacy row does not block valid events. */ }
            }
        } catch (Exception ignored) { }
        Collections.sort(result, Comparator.comparingLong(event -> event.at));
        return result;
    }

    static List<AgendaEvent> upcoming(Context context, long now) {
        List<AgendaEvent> result = new ArrayList<>();
        for (AgendaEvent event : events(context)) if (event.visibleUntil > now) result.add(event);
        return result;
    }

    static Set<String> fired(Context context) { return new HashSet<>(prefs(context).getStringSet("fired", Collections.emptySet())); }

    static void retainFired(Context context) {
        Set<String> valid = new HashSet<>();
        for (AgendaEvent event : events(context)) valid.add(event.key);
        Set<String> fired = fired(context);
        fired.retainAll(valid);
        prefs(context).edit().putStringSet("fired", fired).apply();
    }
}
