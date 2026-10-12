package app.protocolo.android;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

/** Calendar values are local to the phone, matching the web agenda. */
public final class EventTiming {
    private EventTiming() {}

    public static long eventMillis(String date, String time, ZoneId zone) {
        if (date == null || !date.matches("\\d{4}-\\d{2}-\\d{2}")) throw new IllegalArgumentException("Invalid date");
        String clock = time == null || time.isEmpty() ? "09:00" : time;
        if (!clock.matches("(?:[01]\\d|2[0-3]):[0-5]\\d")) throw new IllegalArgumentException("Invalid time");
        return LocalDate.parse(date).atTime(LocalTime.parse(clock)).atZone(zone).toInstant().toEpochMilli();
    }

    public static long visibleUntilMillis(String date, String time, ZoneId zone) {
        return time == null || time.isEmpty() ? LocalDate.parse(date).plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli() : eventMillis(date, time, zone);
    }

    public static long reminderMillis(long eventMillis, int leadMinutes, long now) {
        if (eventMillis <= now) return -1;
        return Math.max(now + 2000L, eventMillis - leadMinutes * 60000L);
    }

    // Changing the title/lead time must not notify an already-reminded event again.
    public static String eventKey(String id, String date, String time) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest((id + "\n" + date + "\n" + time).getBytes(StandardCharsets.UTF_8));
            StringBuilder key = new StringBuilder();
            for (byte b : hash) key.append(String.format("%02x", b & 255));
            return key.toString();
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    public static boolean validLead(int minutes) { return minutes == 10 || minutes == 30 || minutes == 60 || minutes == 1440; }
}
