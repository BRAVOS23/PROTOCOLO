import app.protocolo.android.EventTiming;
import java.time.Instant;
import java.time.ZoneId;

public final class EventTimingTest {
    private static int passed;
    private static void equal(long actual, long expected, String label) {
        if (actual != expected) throw new AssertionError(label + ": " + actual + " != " + expected);
        passed++;
    }
    private static void invalid(String date, String time) {
        try { EventTiming.eventMillis(date, time, ZoneId.of("Africa/Maputo")); throw new AssertionError("Invalid date/time accepted"); }
        catch (java.time.DateTimeException | IllegalArgumentException e) { passed++; }
    }
    public static void main(String[] args) {
        ZoneId maputo = ZoneId.of("Africa/Maputo");
        long event = EventTiming.eventMillis("2026-10-13", "10:00", maputo);
        equal(event, Instant.parse("2026-10-13T08:00:00Z").toEpochMilli(), "Phone timezone");
        equal(EventTiming.eventMillis("2026-10-13", "", maputo), Instant.parse("2026-10-13T07:00:00Z").toEpochMilli(), "Default 09:00");
        equal(EventTiming.visibleUntilMillis("2026-10-13", "", maputo), Instant.parse("2026-10-13T22:00:00Z").toEpochMilli(), "All-day widget remains until midnight");
        equal(EventTiming.visibleUntilMillis("2026-10-13", "10:00", maputo), event, "Timed event expires at start");
        equal(EventTiming.reminderMillis(event, 30, event - 3600000), event - 1800000, "30 minutes before");
        equal(EventTiming.reminderMillis(event, 30, event - 600000), event - 600000 + 2000, "Event created inside lead window");
        equal(EventTiming.reminderMillis(event, 30, event), -1, "No past-event alarm");
        equal(EventTiming.eventMillis("2026-03-08", "02:30", ZoneId.of("America/New_York")), Instant.parse("2026-03-08T07:30:00Z").toEpochMilli(), "Daylight saving gap");
        invalid("2026-02-29", "10:00"); invalid("2026-10-13", "24:00"); invalid("2026-10-13", "10:60");
        if (EventTiming.eventKey("event", "2026-10-13", "10:00").equals(EventTiming.eventKey("event", "2026-10-14", "10:00"))) throw new AssertionError("Rescheduled event shares old fired key");
        passed++;
        if (!EventTiming.validLead(1440) || EventTiming.validLead(-30) || EventTiming.validLead(0)) throw new AssertionError("Unsafe lead accepted");
        passed++;
        System.out.println("PASS " + passed + " Android reminder/calendar checks");
    }
}
