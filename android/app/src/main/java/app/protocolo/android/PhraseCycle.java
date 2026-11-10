package app.protocolo.android;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Random;

/** A shuffled cycle uses every distinct phrase and never repeats the previous one. */
final class PhraseCycle {
    static final long HOUR = 60L * 60L * 1000L;
    static final class Draw {
        final String text; final List<String> remaining;
        Draw(String text, List<String> remaining) { this.text=text; this.remaining=remaining; }
    }
    static List<String> unique(List<String> source) {
        LinkedHashSet<String> set=new LinkedHashSet<>();
        for(String text:source) if(text!=null && !text.trim().isEmpty())set.add(text.trim());
        return new ArrayList<>(set);
    }
    static Draw draw(List<String> source, List<String> saved, String previous, Random random) {
        List<String> pool=unique(source),bag=new ArrayList<>();
        if(pool.size()<2)return new Draw(null,bag);
        for(String text:unique(saved))if(pool.contains(text))bag.add(text);
        if(bag.isEmpty())bag.addAll(pool);
        List<String> eligible=new ArrayList<>(bag);eligible.remove(previous);
        if(eligible.isEmpty()){bag=new ArrayList<>(pool);eligible=new ArrayList<>(pool);eligible.remove(previous);}
        String next=eligible.get(random.nextInt(eligible.size()));bag.remove(next);
        return new Draw(next,bag);
    }
    static long next(long now) { return now+HOUR; }
}
