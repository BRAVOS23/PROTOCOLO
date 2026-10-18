/* Missões semanais: conteúdo integral, páginas por missão e progresso local. */
(function(root){
  'use strict';
  function create(config){
    var planId=null,view='index',activeId=null,focusId=null,restoring=false,scrollTimer=null,generation=0;
    var cachedText=null,cachedModel=null;
    function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    function model(plan){if(cachedText!==plan.documentText){cachedText=plan.documentText;cachedModel=ProtocolLogic.weeklyRouteModel(cachedText);}return cachedModel;}
    function current(){var p=config.getPlan();return p && p.weeklyRouteVersion && p.id===planId?p:null;}
    function record(plan,id,write){
      if(write){if(!plan.weeklyProgress)plan.weeklyProgress={};if(!plan.weeklyProgress[id])plan.weeklyProgress[id]={action:false,proof:false,notes:'',evidence:'',scrollY:0};}
      return (plan.weeklyProgress||{})[id]||{};
    }
    function done(plan,id){return ProtocolLogic.weeklyMissionDone(record(plan,id));}
    function resume(plan){return ProtocolLogic.weeklyResumeMission(model(plan),plan.weeklyProgress,plan.weeklyResume);}
    function save(){clearTimeout(scrollTimer);scrollTimer=null;config.save();}
    function capture(immediate){
      var plan=current();if(!plan || restoring || !config.isActive())return;
      if(view==='mission' && activeId)record(plan,activeId,true).scrollY=window.scrollY;
      plan.weeklyResume={view:view,missionId:activeId||focusId,scrollY:window.scrollY};
      clearTimeout(scrollTimer);if(immediate===false)scrollTimer=setTimeout(save,250);else save();
    }
    function restore(plan,callback){
      restoring=true;var token=++generation;
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        if(token!==generation)return;
        if(current()===plan && config.isActive())callback();
        requestAnimationFrame(function(){if(token===generation)restoring=false;});
      });});
    }
    function findMission(plan,id){return model(plan).missions.find(function(m){return m.id===id;});}
    function update(plan){
      var box=config.root(),data=model(plan),total=data.missions.filter(function(m){return done(plan,m.id);}).length;
      box.querySelectorAll('[data-weekly-total]').forEach(function(el){el.textContent=total+' / '+data.missions.length;});
      box.querySelectorAll('[data-weekly-progress]').forEach(function(el){el.max=data.missions.length||1;el.value=total;});
      box.querySelectorAll('[data-week-done]').forEach(function(input){input.checked=done(plan,input.dataset.weekDone);var row=input.closest('.weekly-mission-row,.weekly-mission-completion');if(row)row.classList.toggle('done',input.checked);});
      box.querySelectorAll('[data-week-month-count]').forEach(function(el){var month=data.months.find(function(m){return m.id===el.dataset.weekMonthCount;});el.textContent=month.missions.filter(function(m){return done(plan,m.id);}).length+' / '+month.missions.length;});
      box.querySelectorAll('[data-week-year-count]').forEach(function(el){var list=data.missions.filter(function(m){return m.date.slice(0,4)===el.dataset.weekYearCount;});el.textContent=list.filter(function(m){return done(plan,m.id);}).length+' / '+list.length;});
      if(view==='mission' && activeId){
        var r=record(plan,activeId),steps=(r.action?1:0)+(r.proof && String(r.evidence||'').trim()?1:0);
        box.querySelectorAll('[data-week-step]').forEach(function(input){input.checked=!!r[input.dataset.weekStep];input.closest('.weekly-field').classList.toggle('done',input.checked);});
        var count=box.querySelector('[data-week-step-count]');if(count)count.textContent=steps+' / 2';
      }
    }
    function requireEvidence(plan,id){
      config.toast('Não marcar como concluído sem prova.');
      if(view!=='mission' || activeId!==id)showMission(plan,id,true);
      else {var field=config.root().querySelector('[data-week-evidence]');field.scrollIntoView({block:'center',behavior:'instant'});field.focus({preventScroll:true});}
    }
    function setDone(plan,id,checked){
      var r=record(plan,id,true);
      if(checked && !String(r.evidence||'').trim()){update(plan);requireEvidence(plan,id);return;}
      r.action=checked;r.proof=checked;r.done=ProtocolLogic.weeklyMissionDone(r);focusId=id;save();update(plan);
    }
    function bindChecks(plan){config.root().querySelectorAll('[data-week-done]').forEach(function(input){input.addEventListener('change',function(){setDone(plan,input.dataset.weekDone,input.checked);});});}
    function showIndex(plan,targetId,firstOpen){
      planId=plan.id;view='index';activeId=null;
      var data=model(plan),target=findMission(plan,targetId)||resume(plan);focusId=target?target.id:null;
      plan.weeklyResume={view:'index',missionId:focusId,scrollY:0};
      config.title('ROTA PARA A CHINA 2029',false);
      var years=[];data.months.forEach(function(month){var year=month.id.slice(0,4);if(years.indexOf(year)===-1)years.push(year);});
      config.root().innerHTML='<article class="weekly-route"><section class="weekly-hero"><h1>'+esc(data.title)+'</h1><div class="weekly-overall"><span>Missões</span><strong data-weekly-total></strong><progress data-weekly-progress aria-label="Progresso das missões"></progress></div><details class="weekly-intro"'+(firstOpen?' open':'')+'><summary>'+esc(data.title)+'</summary>'+data.intro.map(function(line){return '<p>'+esc(line)+'</p>';}).join('')+'</details>'+(target?'<button class="btn" type="button" data-week-resume>Retomar · Semana '+esc(target.number)+'</button>':'')+'</section><div class="weekly-folders">'+years.map(function(year){
        return '<details class="weekly-year"'+(target && target.date.slice(0,4)===year?' open':'')+'><summary><span>▸ '+esc(year)+'</span><strong data-week-year-count="'+esc(year)+'"></strong></summary>'+data.months.filter(function(month){return month.id.slice(0,4)===year;}).map(function(month){
          return '<details class="weekly-month"'+(target && target.monthId===month.id?' open':'')+'><summary><span>'+esc(month.heading)+'</span><strong data-week-month-count="'+esc(month.id)+'"></strong></summary><div class="weekly-month-list">'+month.missions.map(function(m){
            var split=m.heading.indexOf('|'),prefix=m.heading.slice(0,split+1),title=m.heading.slice(split+1).trim();
            return '<div class="weekly-mission-row" data-week-row="'+esc(m.id)+'"><input type="checkbox" data-week-done="'+esc(m.id)+'" aria-label="Concluir '+esc(m.heading)+'"><button type="button" data-week-open="'+esc(m.id)+'"><span>'+esc(prefix)+'</span><strong>'+esc(title)+'</strong></button></div>';
          }).join('')+'</div></details>';
        }).join('')+'</details>';
      }).join('')+'</div></article>';
      update(plan);bindChecks(plan);
      config.root().querySelectorAll('[data-week-open]').forEach(function(button){button.addEventListener('click',function(){capture();showMission(plan,button.dataset.weekOpen);});});
      var button=config.root().querySelector('[data-week-resume]');if(button)button.addEventListener('click',function(){var next=resume(plan);if(next){capture();showMission(plan,next.id);}});
      save();restore(plan,function(){
        var row=target && config.root().querySelector('[data-week-row="'+target.id+'"]');
        if(!firstOpen && row)row.scrollIntoView({block:'center',behavior:'instant'});else window.scrollTo({top:0,behavior:'instant'});
      });
    }
    function showMission(plan,id,focusEvidence){
      var data=model(plan),mission=findMission(plan,id);if(!mission)return;
      planId=plan.id;view='mission';activeId=id;focusId=id;
      var r=record(plan,id),month=data.months.find(function(m){return m.id===mission.monthId;}),position=data.missions.indexOf(mission);
      plan.weeklyResume={view:'mission',missionId:id,scrollY:r.scrollY||0};
      config.title('Semana '+mission.number,true);
      config.root().innerHTML='<article class="weekly-route weekly-mission-page"><nav class="weekly-breadcrumb"><button type="button" data-week-index>ROTA PARA A CHINA 2029</button><span>› '+esc(month.heading)+'</span></nav><section class="weekly-hero"><h1>'+esc(mission.heading)+'</h1><label class="weekly-mission-completion"><input type="checkbox" data-week-done="'+esc(id)+'" aria-label="Concluir '+esc(mission.heading)+'"><strong>Semana '+esc(mission.number)+'</strong><span data-week-step-count></span></label></section>'+mission.fields.map(function(field){
        var step=field.label==='FAZ ISTO:'?'action':field.label==='PROVA DE CONCLUSÃO:'?'proof':null;
        return '<section class="weekly-field '+(step||'options')+'">'+(step?'<label class="weekly-field-label"><input type="checkbox" data-week-step="'+step+'"><strong>'+esc(field.label)+'</strong></label>':'<h2>'+esc(field.label)+'</h2>')+'<p>'+esc(field.text)+'</p></section>';
      }).join('')+'<section class="weekly-journal"><label class="field-label"><span>Registo do processo</span><textarea data-week-notes>'+esc(r.notes||'')+'</textarea></label><label class="field-label"><span>Prova / referência</span><textarea data-week-evidence>'+esc(r.evidence||'')+'</textarea></label><span class="weekly-save-state" aria-live="polite" data-week-saved></span></section><nav class="weekly-navigation">'+(position>0?'<button class="btn ghost" type="button" data-week-previous>Anterior</button>':'')+'<button class="btn ghost" type="button" data-week-index>Missões</button>'+(position<data.missions.length-1?'<button class="btn" type="button" data-week-next>Seguinte</button>':'')+'</nav></article>';
      update(plan);bindChecks(plan);
      config.root().querySelectorAll('[data-week-step]').forEach(function(input){input.addEventListener('change',function(){
        var value=record(plan,id,true);
        if(input.dataset.weekStep==='proof' && input.checked && !String(value.evidence||'').trim()){input.checked=false;requireEvidence(plan,id);return;}
        value[input.dataset.weekStep]=input.checked;value.done=ProtocolLogic.weeklyMissionDone(value);save();update(plan);
      });});
      function bindText(selector,key){var field=config.root().querySelector(selector);field.addEventListener('input',function(){
        var value=record(plan,id,true);value[key]=field.value;
        if(key==='evidence' && !field.value.trim())value.proof=false;
        value.done=ProtocolLogic.weeklyMissionDone(value);save();update(plan);config.root().querySelector('[data-week-saved]').textContent='Guardado';
      });}
      bindText('[data-week-notes]','notes');bindText('[data-week-evidence]','evidence');
      config.root().querySelectorAll('[data-week-index]').forEach(function(button){button.addEventListener('click',function(){capture();showIndex(plan,id,false);});});
      var previous=config.root().querySelector('[data-week-previous]'),next=config.root().querySelector('[data-week-next]');
      if(previous)previous.addEventListener('click',function(){capture();showMission(plan,data.missions[position-1].id);});
      if(next)next.addEventListener('click',function(){capture();showMission(plan,data.missions[position+1].id);});
      save();restore(plan,function(){
        if(focusEvidence){var field=config.root().querySelector('[data-week-evidence]');field.scrollIntoView({block:'center',behavior:'instant'});field.focus({preventScroll:true});}
        else window.scrollTo({top:r.scrollY||0,behavior:'instant'});
      });
    }
    function open(plan){
      var first=!plan.weeklyResume,target=resume(plan);planId=plan.id;
      if(plan.weeklyResume && plan.weeklyResume.view==='mission' && target)showMission(plan,target.id);
      else showIndex(plan,target?target.id:null,first);
    }
    function back(){var p=current();if(!p || !config.isActive() || view!=='mission')return false;capture();showIndex(p,activeId,false);return true;}
    window.addEventListener('scroll',function(){capture(false);},{passive:true});
    document.addEventListener('visibilitychange',function(){if(document.hidden)capture();});
    window.addEventListener('pagehide',function(){capture();});
    return {open:open,back:back,capture:capture,suspend:function(){restoring=true;generation++;}};
  }
  root.WeeklyRouteUI={create:create};
})(window);
