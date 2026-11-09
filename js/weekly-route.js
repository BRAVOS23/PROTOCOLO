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
      if(write){if(!plan.weeklyProgress)plan.weeklyProgress={};if(!plan.weeklyProgress[id])plan.weeklyProgress[id]={action:false,proof:false,proofVersion:2,scrollY:0};}
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
        var status=box.querySelector('[data-week-completion-state]');if(status)status.textContent=done(plan,activeId)?'Concluída':'Por concluir';
      }
    }

    function requireEvidence(plan,id){
      config.toast('Anexa a prova em PDF antes de concluir.');
      if(view!=='mission' || activeId!==id)showMission(plan,id,true);
      else {var field=config.root().querySelector('[for="weeklyPdfInput"]');field.tabIndex=0;field.scrollIntoView({block:'center',behavior:'instant'});field.focus({preventScroll:true});}
    }
    function setDone(plan,id,checked){
      var r=record(plan,id,true);
      if(checked && !ProtocolLogic.hasMissionPdf(r)){update(plan);requireEvidence(plan,id);return;}
      r.action=checked;r.proof=checked;r.done=ProtocolLogic.weeklyMissionDone(r);focusId=id;save();update(plan);
    }
    function bindChecks(plan){config.root().querySelectorAll('[data-week-done]').forEach(function(input){input.addEventListener('change',function(){setDone(plan,input.dataset.weekDone,input.checked);});});}
    function showIndex(plan,targetId,firstOpen){
      planId=plan.id;view='index';activeId=null;
      var data=model(plan),target=findMission(plan,targetId)||resume(plan);focusId=target?target.id:null;
      plan.weeklyResume={view:'index',missionId:focusId,scrollY:0};
      config.title('ROTA PARA A CHINA 2029',false);
      var years=[];data.months.forEach(function(month){var year=month.id.slice(0,4);if(years.indexOf(year)===-1)years.push(year);});
      config.root().innerHTML='<article class="weekly-route"><section class="weekly-hero"><h1>'+esc(data.title)+'</h1><div class="weekly-overall"><span>Missões</span><strong data-weekly-total></strong><progress data-weekly-progress aria-label="Progresso das missões"></progress></div><details class="weekly-intro"'+(firstOpen?' open':'')+'><summary>Sobre esta rota</summary>'+data.intro.map(function(line){return '<p>'+esc(line)+'</p>';}).join('')+'</details>'+(target?'<button class="btn" type="button" data-week-resume>Retomar · Semana '+esc(target.number)+'</button>':'')+'</section><div class="weekly-folders">'+years.map(function(year){
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
      config.title('Rota para a China',true);
      var attachment='<div class="weekly-pdf"><div class="weekly-pdf-name" data-week-pdf-name>'+esc(r.evidencePdf?r.evidencePdf.name:'Nenhum PDF anexado')+'</div><div class="weekly-attachment-actions"><label class="btn" for="weeklyPdfInput">'+(r.evidencePdf?'Substituir PDF':'Anexar PDF')+'</label><input id="weeklyPdfInput" type="file" accept="application/pdf,.pdf" data-week-pdf hidden><button class="btn ghost" type="button" data-week-pdf-open '+(!r.evidencePdf?'hidden':'')+'>Abrir PDF</button><button class="btn ghost" type="button" data-week-pdf-remove '+(!r.evidencePdf?'hidden':'')+'>Remover PDF</button></div><small>PDF até 10 MB</small><span class="weekly-save-state" role="status" data-week-saved></span></div>';
      config.root().innerHTML='<article class="weekly-route weekly-mission-page"><header class="weekly-hero"><span class="weekly-page-month">'+esc(month.heading)+'</span><h1>'+esc(mission.heading)+'</h1></header>'+mission.fields.map(function(field){
        var kind=field.label==='FAZ ISTO:'?'action':field.label==='PROVA DE CONCLUSÃO:'?'proof':'options';
        return '<section class="weekly-field '+kind+'"><h2>'+esc(field.label)+'</h2><p>'+esc(field.text)+'</p>'+(kind==='proof'?attachment:'')+'</section>';
      }).join('')+'<label class="weekly-mission-completion"><input type="checkbox" data-week-done="'+esc(id)+'" aria-label="Concluir '+esc(mission.heading)+'"><strong>Concluir missão</strong><span data-week-completion-state></span></label><blockquote class="weekly-reflection">O resultado ajudou a tomar uma decisão ou a melhorar o perfil?</blockquote><nav class="weekly-navigation">'+(position>0?'<button class="btn ghost" type="button" data-week-previous>Anterior</button>':'')+'<button class="btn ghost" type="button" data-week-index>Missões</button>'+(position<data.missions.length-1?'<button class="btn" type="button" data-week-next>Seguinte</button>':'')+'</nav></article>';
      update(plan);bindChecks(plan);
      var fileInput=config.root().querySelector('[data-week-pdf]');
      fileInput.addEventListener('change',async function(){var file=this.files[0];if(!file)return;var status=config.root().querySelector('[data-week-saved]');status.textContent='A guardar PDF…';fileInput.disabled=true;try{var meta=await PDFVault.attach(file),value=record(plan,id,true);value.evidencePdf=meta;value.proofVersion=2;value.done=ProtocolLogic.weeklyMissionDone(value);save();if(current()===plan && activeId===id){config.root().querySelector('[data-week-pdf-name]').textContent=meta.name;config.root().querySelectorAll('[data-week-pdf-open],[data-week-pdf-remove]').forEach(function(b){b.hidden=false;});config.root().querySelector('[for="weeklyPdfInput"]').textContent='Substituir PDF';status.textContent='PDF guardado';update(plan);}}catch(e){config.toast(e.message||'Não foi possível guardar o PDF.');status.textContent='Não foi possível anexar o PDF.';}finally{fileInput.disabled=false;fileInput.value='';}});
      config.root().querySelector('[data-week-pdf-open]').onclick=async function(){try{await PDFVault.open(record(plan,id).evidencePdf);}catch(e){config.toast(e.message);}};
      config.root().querySelector('[data-week-pdf-remove]').onclick=function(){var value=record(plan,id,true);delete value.evidencePdf;value.proofVersion=2;value.proof=false;value.done=false;save();config.root().querySelector('[data-week-pdf-name]').textContent='Nenhum PDF anexado';config.root().querySelector('[data-week-saved]').textContent='';config.root().querySelectorAll('[data-week-pdf-open],[data-week-pdf-remove]').forEach(function(b){b.hidden=true;});config.root().querySelector('[for="weeklyPdfInput"]').textContent='Anexar PDF';update(plan);};
      config.root().querySelectorAll('[data-week-index]').forEach(function(button){button.addEventListener('click',function(){capture();showIndex(plan,id,false);});});
      var previous=config.root().querySelector('[data-week-previous]'),next=config.root().querySelector('[data-week-next]');
      if(previous)previous.addEventListener('click',function(){capture();showMission(plan,data.missions[position-1].id);});
      if(next)next.addEventListener('click',function(){capture();showMission(plan,data.missions[position+1].id);});
      save();restore(plan,function(){
        if(focusEvidence){var field=config.root().querySelector('[for="weeklyPdfInput"]');field.tabIndex=0;field.scrollIntoView({block:'center',behavior:'instant'});field.focus({preventScroll:true});}
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
