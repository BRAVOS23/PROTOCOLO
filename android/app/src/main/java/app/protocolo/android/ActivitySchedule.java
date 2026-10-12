package app.protocolo.android;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Weekly activities are expanded locally, so tomorrow works without reopening the app. */
public final class ActivitySchedule {
    private static final Pattern CLOCK = Pattern.compile("^(\\d{1,2})(?:[hH](\\d{2})?|:(\\d{2}))(?:\\s*(?:[–—-].*|[·].*))?$");
    public static final class Template {
        public final int weekday;
        public final String id, title, displayTime;
        public Template(int weekday, String id, String title, String time) {
            this.weekday=weekday;this.id=id;this.title=title;this.displayTime=time;
        }
    }
    public static final class Occurrence {
        public final String id, activityId, date, title, time, displayTime;
        public final boolean done;
        public final long at, visibleUntil;
        Occurrence(Template item, LocalDate day, Set<String> doneKeys, ZoneId zone) {
            activityId=item.id;date=day.toString();id="activity:"+date+":"+activityId;
            title=item.title;displayTime=item.displayTime;time=clock(displayTime);
            done=doneKeys.contains(date+"|"+activityId);
            at=EventTiming.eventMillis(date,time,zone);
            visibleUntil=day.plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli();
        }
        public boolean remindable(long now) {return !done && !time.isEmpty() && at>now;}
    }
    public static String clock(String text) {
        if(text==null)return "";
        Matcher match=CLOCK.matcher(text.trim());
        if(!match.matches())return "";
        int hour=Integer.parseInt(match.group(1));
        String minutes=match.group(2)!=null?match.group(2):match.group(3);
        int minute=minutes==null?0:Integer.parseInt(minutes);
        if(hour>23 || minute>59)return "";
        return String.format(Locale.ROOT,"%02d:%02d",hour,minute);
    }
    public static List<Occurrence> occurrences(List<Template> week, Set<String> done, LocalDate first, int days, ZoneId zone) {
        List<Occurrence> rows=new ArrayList<>();
        for(int n=0;n<days;n++) {
            LocalDate day=first.plusDays(n);
            for(Template item:week)if(item.weekday==day.getDayOfWeek().getValue()%7)rows.add(new Occurrence(item,day,done,zone));
        }
        return rows;
    }
    public static long nextMidnight(long now, ZoneId zone) {
        return java.time.Instant.ofEpochMilli(now).atZone(zone).toLocalDate().plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli();
    }
}
