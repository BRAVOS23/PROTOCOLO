/* Android local features. The website keeps its existing behavior without a bridge. */
(function(){
  'use strict';
  var bridge=window.ProtocoloNative, lastAgenda=null, lastActivities=null;
  window.NativePlatform={
    available:!!bridge,
    setAppearance:function(color,dark){if(bridge && typeof bridge.setAppearance==='function')bridge.setAppearance(color,dark);},
    syncActivities:function(activities,done){
      if(!bridge || typeof bridge.syncActivities!=='function')return;
      var days=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
      var today=new Date();today.setHours(0,0,0,0);
      var end=new Date(today);end.setDate(end.getDate()+8);
      function dateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
      var from=dateKey(today),until=dateKey(end),marks={};
      Object.keys(done||{}).forEach(function(key){if(done[key] && key.slice(0,10)>=from && key.slice(0,10)<until)marks[key]=true;});
      var payload=JSON.stringify({week:days.map(function(day){return ProtocolLogic.sortSchedule(activities[day]).slice(0,1000).map(function(act){return {id:act.id,title:String(act.title||'Atividade').slice(0,500),time:String(act.time||'').slice(0,100)};});}),done:marks});
      if(payload===lastActivities)return;
      try{bridge.syncActivities(payload);lastActivities=payload;}catch(e){lastActivities=null;}
    },
    syncAgenda:function(events){
      if(!bridge)return;
      var now=new Date(),today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
      var upcoming=ProtocolLogic.sortSchedule((events||[]).filter(function(event){return event.date>=today;}),'date','time').slice(0,1000);
      var payload=JSON.stringify(upcoming.map(function(event){return {id:event.id,title:String(event.title||'Evento da agenda').slice(0,500),date:event.date,time:event.time||''};}));
      if(payload===lastAgenda)return;
      try{bridge.syncAgenda(payload);lastAgenda=payload;}catch(e){lastAgenda=null;}
    },
    exportBackup:function(json){if(!bridge)return false;bridge.exportBackup(json);return true;}
  };
  document.getElementById('androidDownload').hidden=!!bridge;
  if(!bridge)return;
  var box=document.getElementById('nativeFeatures');
  box.hidden=false;
  function refresh(){
    var status;
    try{status=JSON.parse(bridge.getStatus());}catch(e){return;}
    document.getElementById('nativeLeadMinutes').value=String(status.leadMinutes||30);
    document.getElementById('nativeEnableReminders').textContent=status.enabled?'Desativar lembretes':'Ativar lembretes';
    document.getElementById('nativeEnableReminders').setAttribute('aria-pressed',String(!!status.enabled));
    document.getElementById('nativeReminderStatus').textContent=!status.enabled?'Os lembretes estão desativados.':!status.notificationsAllowed?'As notificações estão bloqueadas no Android.':status.exactAllowed?'Lembretes ativos, mesmo com o app fechado.':'Lembretes ativos. Permite o horário exato para evitar atrasos do Android.';
    document.getElementById('nativeExactAlarms').hidden=!status.enabled||status.exactAllowed;
    document.getElementById('nativeNotificationSettings').hidden=!!status.notificationsAllowed||(!status.enabled&&!status.permissionRequested);
    document.getElementById('nativeWidgetHint').textContent=status.widgetSupported?'Mostra as atividades do Início; desliza a lista para ver todas.':'Mantém pressionada a tela inicial e escolhe Widgets → Protocolo.';
  }
  document.getElementById('nativeEnableReminders').addEventListener('click',function(){
    var status=JSON.parse(bridge.getStatus());if(status.enabled)bridge.disableReminders();else bridge.requestReminders();
  });
  document.getElementById('nativeLeadMinutes').addEventListener('change',function(){bridge.setLeadMinutes(Number(this.value));});
  document.getElementById('nativeExactAlarms').addEventListener('click',function(){bridge.requestExactAlarms();});
  document.getElementById('nativeNotificationSettings').addEventListener('click',function(){bridge.openNotificationSettings();});
  document.getElementById('nativeAddWidget').addEventListener('click',function(){bridge.requestWidget();});
  window.addEventListener('protocolo-native-status',function(event){
    refresh();
    if(event.detail&&event.detail.message)window.dispatchEvent(new CustomEvent('protocolo-native-message',{detail:event.detail.message}));
  });
  window.addEventListener('focus',refresh);
  refresh();
})();
