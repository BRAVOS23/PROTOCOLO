package app.protocolo.android;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Collectors;

public final class PhraseScheduleTest {
    private static PhraseSchedule phrase(String text, List<Integer> days, String... times) {
        return new PhraseSchedule(text, new TreeSet<>(days),
            List.of(times).stream().map(LocalTime::parse).collect(Collectors.toCollection(TreeSet::new)));
    }

    private static long at(String instant) {
        return Instant.parse(instant).toEpochMilli();
    }

    private static void equal(Object actual, Object expected) {
        if (!actual.equals(expected)) throw new AssertionError(actual + " != " + expected);
    }

    public static void main(String[] args) {
        ZoneId maputo = ZoneId.of("Africa/Maputo");
        List<PhraseSchedule> phrases = List.of(
            phrase("A", List.of(1, 4), "07:00", "18:30"),
            phrase("B", List.of(4), "18:30"));
        equal(PhraseSchedule.next(phrases, at("2026-11-26T04:59:59Z"), maputo), at("2026-11-26T05:00:00Z"));
        long evening = at("2026-11-26T16:30:00Z");
        equal(PhraseSchedule.next(phrases, at("2026-11-26T05:00:00Z"), maputo), evening);
        equal(PhraseSchedule.at(phrases, evening, maputo), List.of("A", "B"));
        equal(PhraseSchedule.at(phrases, evening + 60000, maputo), List.of());
        equal(PhraseSchedule.next(phrases, evening, maputo), at("2026-11-30T05:00:00Z"));
        equal(PhraseSchedule.next(List.of(), evening, maputo), 0L);
        equal(PhraseSchedule.next(phrases, at("2026-11-26T05:00:00Z"), ZoneId.of("UTC")), at("2026-11-26T07:00:00Z"));

        ZoneId newYork = ZoneId.of("America/New_York");
        List<PhraseSchedule> spring = List.of(phrase("Spring", List.of(7), "02:30"));
        equal(PhraseSchedule.next(spring, at("2026-03-08T05:00:00Z"), newYork), at("2026-03-15T06:30:00Z"));
        List<PhraseSchedule> autumn = List.of(phrase("Autumn", List.of(7), "01:30"));
        equal(PhraseSchedule.next(autumn, at("2026-11-01T04:00:00Z"), newYork), at("2026-11-01T05:30:00Z"));
        equal(PhraseSchedule.at(autumn, at("2026-11-01T06:30:00Z"), newYork), List.of());
        equal(PhraseSchedule.next(autumn, at("2026-11-01T05:30:00Z"), newYork), at("2026-11-08T06:30:00Z"));
        System.out.println("PASS 11 phrase schedule checks");
    }
}
