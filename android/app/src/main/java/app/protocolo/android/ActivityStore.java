package app.protocolo.android;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

final class ActivityStore {
    static List<ActivitySchedule.Occurrence> rows(Context context, int days) {
        List<ActivitySchedule.Template> week=new ArrayList<>();
        Set<String> done=new HashSet<>();
        try {
            JSONObject stored=new JSONObject(AgendaStore.prefs(context).getString("activities","{}"));
            JSONArray entries=stored.optJSONArray("week");
            if(entries!=null)for(int day=0;day<Math.min(7,entries.length());day++) {
                JSONArray items=entries.optJSONArray(day);
                if(items==null)continue;
                Set<String> seen=new HashSet<>();
                for(int i=0;i<Math.min(1000,items.length());i++) {
                    JSONObject item=items.optJSONObject(i);
                    if(item==null)continue;
                    String id=item.optString("id"),title=item.optString("title","Atividade"),time=item.optString("time");
                    if(id.isEmpty() || id.length()>160 || title.length()>1000 || time.length()>100 || !seen.add(id))continue;
                    week.add(new ActivitySchedule.Template(day,id,title,time));
                }
            }
            JSONObject marks=stored.optJSONObject("done");
            if(marks!=null)for(Iterator<String> keys=marks.keys();keys.hasNext();) {String key=keys.next();if(marks.optBoolean(key))done.add(key);}
        }catch(Exception ignored) { }
        return ActivitySchedule.occurrences(week,done,LocalDate.now(),days,ZoneId.systemDefault());
    }
    static List<AgendaEvent> events(Context context) {
        List<AgendaEvent> events=new ArrayList<>();
        for(ActivitySchedule.Occurrence row:rows(context,8)) {
            try {events.add(new AgendaEvent(new JSONObject().put("id",row.id).put("title",row.title).put("date",row.date).put("time",row.time).put("activity",true).put("done",row.done)));}
            catch(Exception ignored) { }
        }
        return events;
    }
}
