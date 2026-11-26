package app.protocolo.android;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;

final class PhraseSchedule {
    final String text;
    final SortedSet<Integer> days;
    final SortedSet<LocalTime> times;

    PhraseSchedule(String text, SortedSet<Integer> days, SortedSet<LocalTime> times) {
        this.text = text;
        this.days = new TreeSet<>(days);
        this.times = new TreeSet<>(times);
    }

    private static long occurrence(LocalDate date, LocalTime time, ZoneId zone) {
        LocalDateTime local = date.atTime(time);
        List<ZoneOffset> offsets = zone.getRules().getValidOffsets(local);
        // Skip nonexistent times and only use the first occurrence of a repeated hour.
        return offsets.isEmpty() ? 0 : local.toInstant(offsets.get(0)).toEpochMilli();
    }

    static long next(List<PhraseSchedule> phrases, long now, ZoneId zone) {
        LocalDate today = Instant.ofEpochMilli(now).atZone(zone).toLocalDate();
        // The extra week covers a selected weekday whose chosen time is skipped by DST.
        for (int offset = 0; offset <= 14; offset++) {
            LocalDate date = today.plusDays(offset);
            long earliest = Long.MAX_VALUE;
            for (PhraseSchedule phrase : phrases) {
                if (!phrase.days.contains(date.getDayOfWeek().getValue())) continue;
                for (LocalTime time : phrase.times) {
                    long candidate = occurrence(date, time, zone);
                    if (candidate > now) {
                        earliest = Math.min(earliest, candidate);
                        break;
                    }
                }
            }
            if (earliest != Long.MAX_VALUE) return earliest;
        }
        return 0;
    }

    static List<String> at(List<PhraseSchedule> phrases, long instant, ZoneId zone) {
        ZonedDateTime local = Instant.ofEpochMilli(instant).atZone(zone);
        List<String> due = new ArrayList<>();
        if (occurrence(local.toLocalDate(), local.toLocalTime(), zone) != instant) return due;
        for (PhraseSchedule phrase : phrases) {
            if (phrase.days.contains(local.getDayOfWeek().getValue()) && phrase.times.contains(local.toLocalTime())) {
                due.add(phrase.text);
            }
        }
        return due;
    }
}
