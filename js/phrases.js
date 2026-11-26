/* Phrase texts and weekly schedules travel together in the offline backup. */
(function(){
  'use strict';
  var weekdays=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

  function schedule(item){
    return {
      days:Array.from(new Set(Array.isArray(item.days)?item.days:[]))
        .filter(function(day){return Number.isInteger(day)&&day>=1&&day<=7;}).sort(),
      times:Array.from(new Set(Array.isArray(item.times)?item.times:[]))
        .filter(function(time){return typeof time==='string'&&/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(time);}).sort()
    };
  }

  window.PhraseUI={schedule:schedule,create:function(c){
    var root=c.root, bridge=window.ProtocoloNative, editing=null;

    function supported(){
      return !!(bridge&&typeof bridge.syncPhrases==='function'&&typeof bridge.getPhraseStatus==='function');
    }

    function data(){
      var current=c.state().phrases||{};
      return {items:Array.isArray(current.items)?current.items.filter(function(item){return item&&typeof item.text==='string';}):[],enabled:!!current.enabled};
    }

    function scheduled(item){
      var slots=schedule(item);
      return slots.days.length>0&&slots.times.length>0;
    }

    function save(next){
      var state=c.state(), previous=state.phrases;
      state.phrases=next;
      if(c.save()!==false)return true;
      state.phrases=previous;
      c.save();
      c.toast('Não foi possível guardar as frases. Exporta uma cópia dos dados.');
      return false;
    }

    function status(){
      var label=root.querySelector('[data-phrase-status]');
      if(!label)return;
      var d=data(), native={};
      try{if(supported())native=JSON.parse(bridge.getPhraseStatus());}catch(e){}
      var hasSchedule=d.items.some(scheduled);
      var active=d.enabled&&hasSchedule;
      label.textContent=!hasSchedule?'Escolhe os dias e horários de uma frase para programar os avisos.':
        !supported()?'Horários guardados. Os avisos funcionam no APK Android.':
        !active?'Notificações pausadas':
        native.notificationsAllowed===false?'Permite as notificações no Android.':
        native.next?'Próxima frase · '+new Date(native.next).toLocaleString('pt-PT',{weekday:'short',hour:'2-digit',minute:'2-digit'}):
        'Notificações programadas';
      root.querySelector('[data-phrase-permission]').hidden=!supported()||!active||native.notificationsAllowed!==false;
      root.querySelector('[data-phrase-exact]').hidden=!supported()||!active||native.exactAllowed!==false;
      root.querySelector('[data-phrase-test]').hidden=!supported()||!active||native.notificationsAllowed!==true;
      root.querySelector('[data-phrase-timing]').hidden=!supported()||!active||native.exactAllowed!==false;
    }

    function addTime(list,value){
      var row=document.createElement('div');
      row.className='phrase-time';
      row.innerHTML='<input type="time" aria-label="Horário da frase"><button type="button" class="iconbtn" aria-label="Remover horário">×</button>';
      row.firstElementChild.value=value;
      row.lastElementChild.onclick=function(){row.remove();};
      list.append(row);
      return row.firstElementChild;
    }

    function render(){
      var d=data(), existing=d.items.find(function(item){return item.id===editing;});
      var slots=schedule(existing||{});
      var active=d.enabled&&d.items.some(scheduled);
      root.innerHTML='<div class="phrase-heading"><button class="btn" type="button" data-phrase-toggle></button></div>'+
        '<div class="phrase-notifications"><span role="status" data-phrase-status></span><div class="phrase-permissions">'+
        '<button class="btn ghost" type="button" data-phrase-permission hidden>Permitir notificações</button>'+
        '<button class="btn ghost" type="button" data-phrase-exact hidden>Permitir horário exato</button>'+
        '<button class="btn ghost" type="button" data-phrase-test hidden>Enviar teste</button></div>'+
        '<small data-phrase-timing hidden>O Android pode atrasar os avisos sem permissão de horário exato.</small></div>'+
        '<form class="phrase-form"><label class="field-label">'+(existing?'Editar frase':'Nova frase')+
        '<textarea name="phrase" aria-label="Frase" maxlength="2000" required></textarea></label>'+
        '<fieldset><legend>Dias da semana</legend><div class="phrase-days">'+weekdays.map(function(day,i){
          return '<label><input type="checkbox" name="day" value="'+(i+1)+'">'+day+'</label>';
        }).join('')+'</div></fieldset>'+
        '<fieldset><legend>Horários em cada dia escolhido</legend><div class="phrase-times"></div>'+
        '<button type="button" class="btn ghost" data-add-time>Adicionar horário</button></fieldset>'+
        '<div class="form-actions">'+(existing?'<button type="button" class="btn ghost" data-phrase-cancel>Cancelar</button>':'')+
        '<button type="submit" class="btn">'+(existing?'Guardar':'Adicionar frase')+'</button></div></form>'+
        '<div class="phrase-list"></div>';

      var toggle=root.querySelector('[data-phrase-toggle]');
      toggle.textContent=active?'Pausar notificações':'Ativar notificações';
      toggle.setAttribute('aria-pressed',String(active));
      toggle.disabled=!d.items.some(scheduled);
      toggle.onclick=function(){
        if(!save({items:d.items,enabled:!active}))return;
        if(!active&&supported())bridge.requestPhraseNotifications();
        render();
      };
      root.querySelector('[data-phrase-permission]').onclick=function(){bridge.requestPhraseNotifications();};
      root.querySelector('[data-phrase-exact]').onclick=function(){bridge.requestExactAlarms();};
      root.querySelector('[data-phrase-test]').onclick=function(){bridge.testPhraseNotification();};
      var form=root.querySelector('form'), times=form.querySelector('.phrase-times');
      if(existing)form.elements.phrase.value=existing.text;
      form.querySelectorAll('[name=day]').forEach(function(input){input.checked=slots.days.includes(Number(input.value));});
      (slots.times.length?slots.times:['']).forEach(function(value){addTime(times,value);});
      form.querySelector('[data-add-time]').onclick=function(){addTime(times,'').focus();};
      var cancel=form.querySelector('[data-phrase-cancel]');
      if(cancel)cancel.onclick=function(){editing=null;render();};
      form.onsubmit=function(event){
        event.preventDefault();
        var text=form.elements.phrase.value.trim();
        if(!text){c.toast('Escreve uma frase.');return;}
        if(d.items.some(function(item){return item.id!==editing&&item.text.trim()===text;})){
          c.toast('Esta frase já está na lista.');return;
        }
        if(!existing&&d.items.length>=1000){c.toast('A lista já tem 1000 frases.');return;}
        var nextSlots=schedule({
          days:Array.from(form.querySelectorAll('[name=day]:checked'),function(input){return Number(input.value);}),
          times:Array.from(times.querySelectorAll('input'),function(input){return input.value;})
        });
        if(!!nextSlots.days.length!==!!nextSlots.times.length){
          c.toast('Escolhe pelo menos um dia e um horário para programar a frase.');return;
        }
        var item=Object.assign({},existing,{id:existing?existing.id:'phrase-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:text},nextSlots);
        var items=existing?d.items.map(function(p){return p.id===editing?item:p;}):d.items.concat(item);
        if(save({items:items,enabled:d.enabled})){
          editing=null;
          render();
          root.querySelector('textarea').focus();
        }
      };

      var list=root.querySelector('.phrase-list');
      d.items.forEach(function(item){
        var row=document.createElement('article');
        row.dataset.phraseId=item.id;
        row.className='phrase-row';
        row.innerHTML='<div><blockquote></blockquote><small></small></div><div class="phrase-row-actions">'+
          '<button type="button" class="iconbtn" aria-label="Editar frase">✎</button>'+
          '<button type="button" class="iconbtn" aria-label="Apagar frase">×</button></div>';
        row.querySelector('blockquote').textContent=item.text;
        var timing=schedule(item);
        row.querySelector('small').textContent=scheduled(item)?
          timing.days.map(function(day){return weekdays[day-1];}).join(', ')+' · '+timing.times.join(', '):'Sem horário';
        var actions=row.querySelectorAll('button');
        actions[0].onclick=function(){editing=item.id;render();root.querySelector('textarea').focus();};
        actions[1].onclick=function(){
          c.confirm('Apagar esta frase?',function(){
            var current=data(), items=current.items.filter(function(p){return p.id!==item.id;});
            if(save({items:items,enabled:current.enabled&&items.some(scheduled)})){
              if(editing===item.id)editing=null;
              render();
            }
          });
        };
        list.append(row);
      });
      status();
    }

    window.addEventListener('protocolo-native-status',status);
    window.addEventListener('focus',status);
    render();
    return {render:render};
  }};
})();
