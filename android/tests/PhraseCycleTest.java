package app.protocolo.android;
import java.util.*;
public final class PhraseCycleTest {
 public static void main(String[] args){int checks=0;List<String> pool=Arrays.asList("A","B","C","D"),bag=new ArrayList<>();String previous="";Random random=new Random(42);Set<String> round=new HashSet<>();for(int i=0;i<10000;i++){PhraseCycle.Draw d=PhraseCycle.draw(pool,bag,previous,random);if(d.text.equals(previous))throw new AssertionError("consecutive repeat");if(!round.add(d.text))throw new AssertionError("repeated before cycle ended");previous=d.text;bag=d.remaining;if((i+1)%4==0){if(round.size()!=4)throw new AssertionError();round.clear();}checks++;}
 if(PhraseCycle.draw(Arrays.asList("A"," A "),Arrays.asList("A"),"A",random).text!=null)throw new AssertionError("two distinct phrases required");checks++;
 PhraseCycle.Draw changed=PhraseCycle.draw(Arrays.asList("A","B"),Arrays.asList("removed","A"),"A",random);if(!"B".equals(changed.text))throw new AssertionError("edit cannot cause repeat");checks++;
 for(int i=0;i<100;i++){PhraseCycle.Draw d=PhraseCycle.draw(Arrays.asList("A","B"),Collections.emptyList(),"A",random);if(!"B".equals(d.text))throw new AssertionError();checks++;}
 if(PhraseCycle.next(1000)!=3601000)throw new AssertionError("one hour");checks++;
 System.out.println("PASS "+checks+" phrase cycle checks: random rounds, no adjacent repeats, edits, duplicate removal and hourly interval");
 }
}
