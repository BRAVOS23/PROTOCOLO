import app.protocolo.android.ActivitySchedule;
import app.protocolo.android.EventTiming;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

public final class ActivityScheduleTest {
    private static int count;
    private static void check(boolean condition,String label){if(!condition)throw new AssertionError(label);count++;}
    public static void main(String[] args){
        check(ActivitySchedule.clock("05h40").equals("05:40"),"God Moment clock");
        check(ActivitySchedule.clock("5h").equals("05:00"),"Acordar hour only");
        check(ActivitySchedule.clock("18h–19h").equals("18:00"),"Range starts at 18");
        check(ActivitySchedule.clock("06h00 – 07h00").equals("06:00"),"Range with minutes");
        check(ActivitySchedule.clock("5h · God Moment").equals("05:00"),"Legacy clock with note");
        check(ActivitySchedule.clock("5").equals("05:00"),"Plain hour");
        check(ActivitySchedule.clock("às 5 h 30").equals("05:30"),"Spaced hour with prefix");
        check(ActivitySchedule.clock("6 horas").equals("06:00"),"Written hours");
        check(ActivitySchedule.clock("14:30").equals("14:30"),"Colon clock");
        for(String bad:new String[]{"","—","amanhã","25h00","10h60","1h antes","05:4","5h300"})check(ActivitySchedule.clock(bad).isEmpty(),"Reject ambiguous clock: "+bad);
        ZoneId zone=ZoneId.of("Africa/Maputo");
        LocalDate monday=LocalDate.of(2026,10,12);
        List<ActivitySchedule.Template> week=Arrays.asList(new ActivitySchedule.Template(1,"a","Acordar","05h30"),new ActivitySchedule.Template(1,"b","God Moment","05h40"),new ActivitySchedule.Template(1,"c","Leitura",""),new ActivitySchedule.Template(2,"a","Acordar","05h30"),new ActivitySchedule.Template(0,"sun","Domingo","10h"));
        List<ActivitySchedule.Occurrence> today=ActivitySchedule.occurrences(week,new HashSet<>(Arrays.asList("2026-10-12|a")),monday,1,zone);
        check(today.size()==3 && today.get(0).title.equals("Acordar") && today.get(1).title.equals("God Moment"),"Widget follows Home order including completed tasks");
        long before=EventTiming.eventMillis("2026-10-12","04:00",zone);
        check(today.get(0).done && !today.get(0).remindable(before),"Completed task cancels its reminder");
        check(today.get(1).remindable(before),"Pending timed task is notified");
        check(!today.get(2).remindable(before),"No invented clock for untimed activity");
        check(!today.get(1).remindable(today.get(1).at),"No reminder for past task");
        check(today.get(1).visibleUntil==EventTiming.visibleUntilMillis("2026-10-12","",zone),"Past timed activity remains in daily widget");
        List<ActivitySchedule.Occurrence> future=ActivitySchedule.occurrences(week,new HashSet<>(Arrays.asList("2026-10-12|a")),monday,8,zone);
        check(future.size()==8,"Weekly schedule includes Tuesday, Sunday and following Monday without opening app");
        check(!future.get(3).done && future.get(3).date.equals("2026-10-13"),"Tomorrow completion is independent");
        check(future.get(4).activityId.equals("sun"),"Sunday mapping");
        check(!EventTiming.eventKey(today.get(0).id,today.get(0).date,today.get(0).time).equals(EventTiming.eventKey(future.get(5).id,future.get(5).date,future.get(5).time)),"Next week gets a new reminder identity");
        check(ActivitySchedule.occurrences(Collections.emptyList(),Collections.emptySet(),monday,1,zone).isEmpty(),"Removed activities disappear");
        long now=Instant.parse("2026-03-08T05:30:00Z").toEpochMilli();
        check(ActivitySchedule.nextMidnight(now,ZoneId.of("America/New_York"))==Instant.parse("2026-03-09T04:00:00Z").toEpochMilli(),"Midnight refresh respects DST rather than adding 24h");
        List<ActivitySchedule.Template> mixed=Arrays.asList(new ActivitySchedule.Template(1,"blank","Sem hora",""),new ActivitySchedule.Template(1,"six","Seis","06:00"),new ActivitySchedule.Template(1,"five","Cinco","5h"),new ActivitySchedule.Template(1,"tie","Empate","05:00"),new ActivitySchedule.Template(2,"tomorrow","Amanhã","04h"));
        List<ActivitySchedule.Occurrence> ordered=ActivitySchedule.occurrences(mixed,new HashSet<>(Arrays.asList("2026-10-12|five")),monday,2,zone);
        check(ordered.get(0).activityId.equals("five") && ordered.get(1).activityId.equals("tie"),"Earlier completed task first, equal times stable");
        check(ordered.get(2).activityId.equals("six") && ordered.get(3).activityId.equals("blank"),"Widget orders 5h before 6h and untimed last");
        check(ordered.get(4).date.equals("2026-10-13"),"Tomorrow is after all of today");
        check(mixed.get(0).id.equals("blank"),"Sorting preserves stored weekly templates");
        System.out.println("PASS "+count+" daily activity/widget checks");
    }
}
