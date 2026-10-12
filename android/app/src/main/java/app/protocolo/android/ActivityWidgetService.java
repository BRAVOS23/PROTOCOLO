package app.protocolo.android;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import java.util.ArrayList;
import java.util.List;

public final class ActivityWidgetService extends RemoteViewsService {
    @Override public RemoteViewsFactory onGetViewFactory(Intent intent) {return new Rows(getApplicationContext());}
    private static final class Rows implements RemoteViewsFactory {
        private final Context context;
        private List<ActivitySchedule.Occurrence> rows=new ArrayList<>();
        Rows(Context context){this.context=context;}
        @Override public void onCreate(){onDataSetChanged();}
        @Override public void onDataSetChanged(){rows=ActivityStore.rows(context,1);}
        @Override public void onDestroy(){rows.clear();}
        @Override public int getCount(){return rows.size();}
        @Override public RemoteViews getViewAt(int position){
            if(position<0 || position>=rows.size())return null;
            ActivitySchedule.Occurrence row=rows.get(position);
            RemoteViews view=new RemoteViews(context.getPackageName(),R.layout.activity_widget_row);
            view.setTextViewText(R.id.activity_widget_check,row.done?"✓":"○");
            view.setTextColor(R.id.activity_widget_check,Color.parseColor(row.done?"#43DDC8":"#A4B3CD"));
            view.setTextViewText(R.id.activity_widget_title,row.title);
            view.setTextColor(R.id.activity_widget_title,Color.parseColor(row.done?"#A4B3CD":"#F1F5FF"));
            String clock=row.time.isEmpty()?"Sem horário":row.time;
            view.setTextViewText(R.id.activity_widget_time,clock+" · "+(row.done?"Concluída":"Pendente"));
            view.setOnClickFillInIntent(R.id.activity_widget_row,new Intent().putExtra("eventId",row.id));
            return view;
        }
        @Override public RemoteViews getLoadingView(){return null;}
        @Override public int getViewTypeCount(){return 1;}
        @Override public long getItemId(int position){return position;}
        @Override public boolean hasStableIds(){return false;}
    }
}
