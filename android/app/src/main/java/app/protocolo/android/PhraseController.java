package app.protocolo.android;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

final class PhraseController {
    static final String ACTION="app.protocolo.android.PHRASE", CHANNEL="phrases";
    private static final int ALARM_CODE=200, NOTIFICATION_CODE=2001;
    static SharedPreferences prefs(Context c){return c.getSharedPreferences("phrase-notifications",Context.MODE_PRIVATE);}
    static void channel(Context c){NotificationChannel ch=new NotificationChannel(CHANNEL,"Frases",NotificationManager.IMPORTANCE_DEFAULT);ch.setDescription("Uma frase tua de hora a hora.");c.getSystemService(NotificationManager.class).createNotificationChannel(ch);}
    static boolean allowed(Context c){if(Build.VERSION.SDK_INT>=33&&c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return false;NotificationManager m=c.getSystemService(NotificationManager.class);NotificationChannel ch=m.getNotificationChannel(CHANNEL);return m.areNotificationsEnabled()&&(ch==null||ch.getImportance()!=NotificationManager.IMPORTANCE_NONE);}
    static List<String> read(String json){List<String> list=new ArrayList<>();try{JSONArray a=new JSONArray(json);for(int i=0;i<a.length();i++){String text=a.optString(i,"").trim();if(!text.isEmpty()&&text.length()<=2000)list.add(text);}}catch(Exception ignored){}return PhraseCycle.unique(list);}
    private static String json(List<String> list){return new JSONArray(list).toString();}
    static synchronized void sync(Context c,String payload){try{JSONObject o=new JSONObject(payload);JSONArray input=o.getJSONArray("items");if(input.length()>1000)return;List<String> list=read(input.toString());SharedPreferences p=prefs(c);boolean enabled=o.optBoolean("enabled",false)&&list.size()>=2;SharedPreferences.Editor edit=p.edit();String value=json(list);if(!value.equals(p.getString("items","[]")))edit.putString("items",value).putString("bag","[]");boolean was=p.getBoolean("enabled",false);edit.putBoolean("enabled",enabled);if(!enabled)edit.remove("next");else if(!was)edit.putLong("next",PhraseCycle.next(System.currentTimeMillis()));edit.commit();if(!enabled)c.getSystemService(NotificationManager.class).cancel(NOTIFICATION_CODE);schedule(c);}catch(Exception ignored){}}
    private static PendingIntent alarm(Context c){return PendingIntent.getBroadcast(c,ALARM_CODE,new Intent(c,EventReceiver.class).setAction(ACTION),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
    static synchronized void schedule(Context c){channel(c);AlarmManager manager=c.getSystemService(AlarmManager.class);PendingIntent intent=alarm(c);manager.cancel(intent);SharedPreferences p=prefs(c);if(!p.getBoolean("enabled",false)||read(p.getString("items","[]")).size()<2||!allowed(c))return;long now=System.currentTimeMillis(),at=p.getLong("next",0);if(at==0||at>now+PhraseCycle.HOUR){at=PhraseCycle.next(now);p.edit().putLong("next",at).commit();}at=Math.max(now+1000,at);if(ReminderController.exactAllowed(c)){try{manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,intent);return;}catch(SecurityException ignored){}}manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,at,intent);}
    static synchronized void fire(Context c,boolean test){channel(c);SharedPreferences p=prefs(c);long now=System.currentTimeMillis();if(!p.getBoolean("enabled",false)||!allowed(c)){schedule(c);return;}if(!test&&p.getLong("next",Long.MAX_VALUE)>now+1000){schedule(c);return;}PhraseCycle.Draw draw=PhraseCycle.draw(read(p.getString("items","[]")),read(p.getString("bag","[]")),p.getString("previous",""),new Random());if(draw.text==null){schedule(c);return;}String oldBag=p.getString("bag","[]"),oldPrevious=p.getString("previous","");SharedPreferences.Editor edit=p.edit().putString("bag",json(draw.remaining)).putString("previous",draw.text);if(!test)edit.putLong("next",PhraseCycle.next(now));if(!edit.commit()){schedule(c);return;}
        try{Intent open=new Intent(c,MainActivity.class).setAction(ACTION+".OPEN").putExtra("eventId","phrases").addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);PendingIntent tap=PendingIntent.getActivity(c,201,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification publicVersion=new Notification.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_notification).setContentTitle("Protocolo").setContentText("Tens uma nova frase.").build();Notification n=new Notification.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_notification).setContentTitle("Uma frase para ti").setContentText(draw.text).setStyle(new Notification.BigTextStyle().bigText(draw.text)).setCategory(Notification.CATEGORY_REMINDER).setColor(0xff853bff).setAutoCancel(true).setOnlyAlertOnce(false).setTimeoutAfter(PhraseCycle.HOUR).setVisibility(Notification.VISIBILITY_PRIVATE).setPublicVersion(publicVersion).setContentIntent(tap).build();c.getSystemService(NotificationManager.class).notify(NOTIFICATION_CODE,n);}catch(SecurityException e){p.edit().putString("bag",oldBag).putString("previous",oldPrevious).commit();}schedule(c);
    }
    static String status(Context c){try{SharedPreferences p=prefs(c);return new JSONObject().put("enabled",p.getBoolean("enabled",false)).put("notificationsAllowed",allowed(c)).put("exactAllowed",ReminderController.exactAllowed(c)).put("next",p.getLong("next",0)).toString();}catch(Exception e){return "{}";}}
}
