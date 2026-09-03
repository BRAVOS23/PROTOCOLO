(function(){
  'use strict';

  /* ---------------- storage ---------------- */
  var STORE_KEY = 'protocolo:v1:state';
  function freshDefaultState(){
    return {
      vocab:{}, langDone:{}, workouts:{}, weight:[], theme:'system',
      activities: seedActivitiesWithIds(),
      activityDone: {},
      protocolo: clone(DEFAULT_PROTOCOLO),
      finance: [],
      shoppingLists: [ { id:'default', name:'Compras', items: [] } ],
      pendentes: [],
      agenda: [],
      planos: [],
      fitNotes: seedFitNotes(),
      langNotes: seedLangNotes(),
      langWeeks: seedLangWeeks(),
      tabLabels: { inicio:'Início', linguas:'Línguas', forma:'Forma', trabalho:'Trabalho', vida:'Vida' },
    };
  }

  /* Dados reais puxados do Notion (BORN TO MAKE HISTORY!) — entram uma única vez,
     tanto para quem começa de novo como para quem já tinha o app instalado. */
  function migrateNotionImports(s){
    delete s.financeAccounts; // secção "Contas" removida a pedido do utilizador
    // v6: restaura refeições/alimentos/rotina/recursos para a forma estruturada
    // (tabelas, listas com itens soltos) em vez do texto plano da v4/v5.
    if(!s.fitNotes.refeicoes.length || !s.fitNotes.refeicoes[0].rows){
      s.fitNotes.refeicoes = seedFitNotes().refeicoes;
    }else{
      // remove cartões corrompidos por um bug antigo (botões "+" com dois handlers)
      // que injetava itens no formato errado {title,body} sem "rows".
      s.fitNotes.refeicoes = s.fitNotes.refeicoes.filter(function(m){ return Array.isArray(m.rows); });
    }
    if(!s.fitNotes.alimentos.length || !s.fitNotes.alimentos[0].items){
      s.fitNotes.alimentos = seedFitNotes().alimentos;
    }else{
      s.fitNotes.alimentos = s.fitNotes.alimentos.filter(function(g){ return Array.isArray(g.items); });
    }
    if(!s.langNotes.rotina.length || !s.langNotes.rotina[0].items){
      s.langNotes.rotina = seedLangNotes().rotina;
    }else{
      s.langNotes.rotina = s.langNotes.rotina.filter(function(r){ return Array.isArray(r.items); });
    }
    if(!s.langNotes.recursos.length || !s.langNotes.recursos[0].badge){
      s.langNotes.recursos = seedLangNotes().recursos;
    }else{
      s.langNotes.recursos = s.langNotes.recursos.filter(function(r){ return typeof r.name === 'string'; });
    }
    if(!s.fitNotes.protocolos.some(function(p){ return /hiperlordose/i.test(p.title); })){
      s.fitNotes.protocolos.push({
        id:'n-hiperlordose',
        title:'Hiperlordose',
        body:'Alongamento de flexores — 30s cada lado\nAbdominal infra — 15x, 2 séries\nPrancha — 15s\nFortalecimento — 15r cada lado',
      });
    }
    if(!s.shoppingLists.some(function(l){ return l.name === 'Necessário'; })){
      s.shoppingLists.push({
        id:'sl-necessario', name:'Necessário',
        items: [
          { id:'ni-1', text:'Protetor (Aliexpress / Cidade)', done:false },
          { id:'ni-2', text:'Zip pasta Nike', done:false },
          { id:'ni-3', text:'Lesinho + esfregão — 150 MT (na Pepe)', done:false },
          { id:'ni-4', text:'Protetor + capa com espaço de caneta (e a caneta original)', done:false },
          { id:'ni-5', text:"3 Month's Challenge", done:false },
        ],
      });
    }
    return s;
  }

  function loadState(){
    try{
      var raw = localStorage.getItem(STORE_KEY);
      if(!raw) return migrateNotionImports(freshDefaultState());
      var parsed = JSON.parse(raw);
      var merged = Object.assign(freshDefaultState(), parsed);
      // migração: versões antigas guardavam "shopping" como lista simples
      if(Array.isArray(parsed.shopping) && parsed.shopping.length && !parsed.shoppingLists){
        merged.shoppingLists = [{ id:'default', name:'Compras', items: parsed.shopping }];
      }
      delete merged.shopping;
      return migrateNotionImports(merged);
    }catch(e){ return migrateNotionImports(freshDefaultState()); }
  }
  function saveState(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  var state = loadState();
  saveState(); // persiste já qualquer limpeza feita pela migração (itens corrompidos removidos)

  /* ---------------- date helpers ---------------- */
  var WEEKDAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  function iso(d){
    var y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
    return y+'-'+m+'-'+day;
  }
  function todayDate(){ var d=new Date(); d.setHours(0,0,0,0); return d; }
  function addDays(d,n){ var r=new Date(d); r.setDate(r.getDate()+n); return r; }
  function weekDates(d){
    var dow = d.getDay(); // 0=Sun
    var mondayOffset = dow===0 ? -6 : 1-dow;
    var monday = addDays(d, mondayOffset);
    var arr=[]; for(var i=0;i<7;i++) arr.push(addDays(monday,i));
    return arr;
  }
  function fmtDateShort(d){
    return d.toLocaleDateString('pt-PT',{ day:'2-digit', month:'short' });
  }

  var TODAY = todayDate();
  var TODAY_ISO = iso(TODAY);
  var TODAY_WEEKDAY = WEEKDAYS_PT[TODAY.getDay()];

  /* ---------------- streaks ---------------- */
  function computeStreak(map){
    var n=0, d=new Date(TODAY);
    if(!map[iso(d)]) d = addDays(d,-1);
    while(map[iso(d)]){ n++; d = addDays(d,-1); }
    return n;
  }

  /* ---------------- toast ---------------- */
  var toastEl = document.getElementById('toast');
  var toastTimer=null;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2200);
  }

  /* ---------------- icons ---------------- */
  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var TRASH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path></svg>';
  var PENCIL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>';

  /* ---------------- tabs ---------------- */
  var views = { inicio:'view-inicio', linguas:'view-linguas', forma:'view-forma', trabalho:'view-trabalho', vida:'view-vida' };
  function goTab(tab){
    Object.keys(views).forEach(function(k){
      document.getElementById(views[k]).classList.toggle('active', k===tab);
    });
    document.querySelectorAll('.tabbtn').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-tab')===tab);
    });
    document.getElementById('pageTitle').textContent = state.tabLabels[tab];
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant':'auto'});
  }
  function applyTabLabels(){
    Object.keys(views).forEach(function(k){
      var span = document.querySelector('.tabbtn[data-tab="'+k+'"] span:last-child');
      if(span) span.textContent = state.tabLabels[k];
    });
    var activeBtn = document.querySelector('.tabbtn.active');
    if(activeBtn) document.getElementById('pageTitle').textContent = state.tabLabels[activeBtn.getAttribute('data-tab')];
  }
  function renderTabNameInputs(){
    var box = document.getElementById('tabNameInputs');
    box.innerHTML = Object.keys(views).map(function(k){
      return '<input data-tabkey="'+k+'" type="text" value="'+escAttr(state.tabLabels[k])+'" ' +
        'style="border:1px solid var(--line); background:var(--surface-2); border-radius:8px; padding:8px 11px; font-size:13.5px; color:var(--ink); font-family:var(--font-body);">';
    }).join('');
    box.querySelectorAll('input').forEach(function(inp){
      inp.addEventListener('input', function(){
        var k = inp.getAttribute('data-tabkey');
        state.tabLabels[k] = inp.value.trim() || k;
        saveState();
        applyTabLabels();
      });
    });
  }
  document.querySelectorAll('.tabbtn').forEach(function(b){
    b.addEventListener('click', function(){ goTab(b.getAttribute('data-tab')); });
  });
  document.querySelectorAll('[data-goto]').forEach(function(b){
    b.addEventListener('click', function(){ goTab(b.getAttribute('data-goto')); });
  });
  document.querySelectorAll('.subtabs [data-anchor]').forEach(function(b){
    b.addEventListener('click', function(){
      var el = document.querySelector(b.getAttribute('data-anchor'));
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  /* ================= LÍNGUAS ================= */
  function getAllVocabKeys(){
    var keys = [];
    state.langWeeks.forEach(function(w){ w.vocab.forEach(function(v){ keys.push(v.key); }); });
    return keys;
  }

  function renderLangStatic(){
    document.getElementById('langEyebrow').textContent = LANG_META.eyebrow;
    document.getElementById('langSub').textContent = LANG_META.sub;
    document.getElementById('langStats').innerHTML =
      stat('Duração', LANG_META.weeks + ' sem') +
      stat('Estudo ativo', LANG_META.hoursActive) +
      stat('Total 13 sem', LANG_META.hoursTotal, true) +
      stat('Meta', 'B1 funcional');

    renderRotinaCards();
    renderRecursosGrid();

    document.getElementById('langMonths').innerHTML = LANG_MONTHS.map(function(m){
      var weeksHtml = state.langWeeks.filter(function(w){ return w.monthId===m.id; }).map(renderWeek).join('');
      return '<section class="blk month-block '+m.id+'" id="lg-'+m.id+'">' +
        '<div class="month-head"><h3>'+m.title+'</h3><span class="m-sub">'+m.sub+'</span></div>' +
        '<div class="week-list">' + weeksHtml + '</div>' +
        '</section>';
    }).join('');
    bindWeekHandlers();
    bindVocabHandlers();

    document.getElementById('langSources').innerHTML = LANG_SOURCES.map(function(s){ return '<li>'+s+'</li>'; }).join('');
  }

  /* ---- rotina semanal (sched-cards, visual original + edição inline) ---- */
  var openRotinaEdit = null;
  function renderRotinaCards(){
    var box = document.getElementById('langRotinaNotes');
    box.className = 'sched-grid';
    box.innerHTML = state.langNotes.rotina.map(function(r, i){
      var variant = i % 2 === 0 ? 'a' : 'b';
      if(r.id === openRotinaEdit) return rotinaEditForm(r);
      var items = r.items.map(function(it){
        return '<div class="sched-item"><span class="t">'+escHtml(it.t)+'</span><span class="d">'+escHtml(it.d)+'</span></div>';
      }).join('');
      return '<div class="sched-card '+variant+'" data-id="'+r.id+'" style="position:relative;">' +
        '<button class="cardedit" data-act="edit" type="button" style="position:absolute;top:10px;right:10px;">'+PENCIL_SVG+'</button>' +
        '<div class="sched-head"><div class="days" style="padding-right:26px;">'+escHtml(r.days)+'</div><div class="time">'+escHtml(r.time)+'</div></div>' +
        '<div class="sched-body">'+items+'</div></div>';
    }).join('');
    bindRotinaHandlers();
  }
  function rotinaEditForm(r){
    var rows = r.items.map(function(it, i){
      return '<div class="itemrow2" data-i="'+i+'">' +
        '<input data-if="t" value="'+escAttr(it.t)+'" placeholder="ex.: 10min">' +
        '<input data-if="d" value="'+escAttr(it.d)+'" placeholder="Descrição">' +
        '<span class="mx" data-idel="'+i+'">✕</span></div>';
    }).join('');
    return '<div class="sched-card editing" data-id="'+r.id+'" style="grid-column:1/-1;">' +
      '<div class="activity-edit-form" style="padding:14px;">' +
        '<div class="row2"><input data-f="days" value="'+escAttr(r.days)+'" placeholder="Dias"><input data-f="time" value="'+escAttr(r.time)+'" placeholder="Hora"></div>' +
        '<div id="rotinaItems-'+r.id+'">'+rows+'</div>' +
        '<button type="button" class="pc-add-meta" data-act="additem" style="color:var(--ink-soft);border-color:var(--line-strong);align-self:flex-start;">+ item</button>' +
        '<div class="form-actions" style="justify-content:space-between;"><button class="btn ghost" data-act="del" type="button">Apagar</button><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancel" type="button">Cancelar</button><button class="btn" data-act="save" type="button">Guardar</button></span></div>' +
      '</div></div>';
  }
  function bindRotinaHandlers(){
    var box = document.getElementById('langRotinaNotes');
    box.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openRotinaEdit = btn.closest('[data-id]').getAttribute('data-id'); renderRotinaCards(); });
    });
    box.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openRotinaEdit=null; renderRotinaCards(); });
    });
    box.querySelectorAll('[data-act="del"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!confirm('Apagar esta sessão?')) return;
        var id = btn.closest('[data-id]').getAttribute('data-id');
        state.langNotes.rotina = state.langNotes.rotina.filter(function(r){ return r.id!==id; });
        saveState(); openRotinaEdit=null; renderRotinaCards();
      });
    });
    box.querySelectorAll('[data-act="additem"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.closest('[data-id]').getAttribute('data-id');
        var r = state.langNotes.rotina.find(function(x){ return x.id===id; });
        r.items.push({ id:'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), t:'', d:'' });
        renderRotinaCards();
      });
    });
    box.querySelectorAll('[data-idel]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.closest('[data-id]').getAttribute('data-id');
        var r = state.langNotes.rotina.find(function(x){ return x.id===id; });
        r.items.splice(+btn.getAttribute('data-idel'), 1);
        renderRotinaCards();
      });
    });
    box.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('[data-id]');
        var id = card.getAttribute('data-id');
        var r = state.langNotes.rotina.find(function(x){ return x.id===id; });
        r.days = card.querySelector('[data-f="days"]').value.trim();
        r.time = card.querySelector('[data-f="time"]').value.trim();
        card.querySelectorAll('.itemrow2').forEach(function(row, i){
          r.items[i].t = row.querySelector('[data-if="t"]').value.trim();
          r.items[i].d = row.querySelector('[data-if="d"]').value.trim();
        });
        r.items = r.items.filter(function(it){ return it.t || it.d; });
        saveState(); openRotinaEdit=null; renderRotinaCards();
      });
    });
  }
  document.getElementById('btnAddRotina').addEventListener('click', function(){
    var r = { id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), days:'Nova sessão', time:'', items:[] };
    state.langNotes.rotina.push(r);
    saveState(); openRotinaEdit = r.id; renderRotinaCards();
  });

  /* ---- recursos (res-cards, visual original + edição inline) ---- */
  var openRecursoEdit = null;
  function renderRecursosGrid(){
    var box = document.getElementById('langResourcesNotes');
    box.className = 'res-grid';
    box.innerHTML = state.langNotes.recursos.map(function(r){
      if(r.id === openRecursoEdit){
        return '<div class="res-card editing" data-id="'+r.id+'" style="grid-column:1/-1;">' +
          '<div class="activity-edit-form" style="padding:0;border-top:none;">' +
          '<input data-f="name" value="'+escAttr(r.name)+'" placeholder="Nome">' +
          '<select data-f="badgeType"><option value="official"'+(r.badgeType==='official'?' selected':'')+'>Oficial</option><option value="new"'+(r.badgeType==='new'?' selected':'')+'>Novo/Grátis</option></select>' +
          '<textarea data-f="desc" placeholder="Descrição">'+escHtml(r.desc)+'</textarea>' +
          '<div class="form-actions" style="justify-content:space-between;"><button class="btn ghost" data-act="del" type="button">Apagar</button><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancel" type="button">Cancelar</button><button class="btn" data-act="save" type="button">Guardar</button></span></div>' +
          '</div></div>';
      }
      var badgeLabel = r.badgeType === 'official' ? 'Oficial' : (r.badge || 'Novo');
      return '<div class="res-card" data-id="'+r.id+'" style="position:relative;">' +
        '<button class="cardedit" data-act="edit" type="button" style="position:absolute;top:10px;right:10px;color:var(--ink-faint);background:var(--surface-2);">'+PENCIL_SVG+'</button>' +
        '<div class="res-top" style="padding-right:26px;"><h4>'+escHtml(r.name)+'</h4><span class="badge '+r.badgeType+'">'+escHtml(badgeLabel)+'</span></div>' +
        '<p>'+escHtml(r.desc)+'</p></div>';
    }).join('');
    bindRecursosHandlers();
  }
  function bindRecursosHandlers(){
    var box = document.getElementById('langResourcesNotes');
    box.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openRecursoEdit = btn.closest('[data-id]').getAttribute('data-id'); renderRecursosGrid(); });
    });
    box.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openRecursoEdit=null; renderRecursosGrid(); });
    });
    box.querySelectorAll('[data-act="del"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!confirm('Apagar este recurso?')) return;
        var id = btn.closest('[data-id]').getAttribute('data-id');
        state.langNotes.recursos = state.langNotes.recursos.filter(function(r){ return r.id!==id; });
        saveState(); openRecursoEdit=null; renderRecursosGrid();
      });
    });
    box.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('[data-id]');
        var id = card.getAttribute('data-id');
        var r = state.langNotes.recursos.find(function(x){ return x.id===id; });
        r.name = card.querySelector('[data-f="name"]').value.trim() || 'Sem título';
        r.badgeType = card.querySelector('[data-f="badgeType"]').value;
        r.badge = r.badgeType === 'official' ? 'Oficial' : 'Novo';
        r.desc = card.querySelector('[data-f="desc"]').value.trim();
        saveState(); openRecursoEdit=null; renderRecursosGrid();
      });
    });
  }
  document.getElementById('btnAddRecurso').addEventListener('click', function(){
    var r = { id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), name:'Novo recurso', badge:'Novo', badgeType:'new', desc:'' };
    state.langNotes.recursos.push(r);
    saveState(); openRecursoEdit = r.id; renderRecursosGrid();
  });

  var openWeekEditId = null;
  function renderWeek(w){
    if(w.id === openWeekEditId) return weekEditForm(w);
    var gram = (w.grammarNote||'').split('\n').filter(Boolean).map(function(line){
      var isNew = /^NOVO:\s*/i.test(line);
      var text = line.replace(/^NOVO:\s*/i, '');
      return '<span class="pill'+(isNew?' new':'')+'">'+escHtml(text)+'</span>';
    }).join('');
    var vocab = w.vocab.map(function(v){
      return '<li><label><input type="checkbox" data-k="'+v.key+'"><span>'+escHtml(v.label)+'</span></label></li>';
    }).join('');
    var milestone = w.milestoneNote ? ('<div class="milestone">' + w.milestoneNote.split('\n').map(function(l,i){
      return i===0 ? '<span class="m-tag">'+escHtml(l)+'</span>' : '<p>'+escHtml(l)+'</p>';
    }).join('') + '</div>') : '';
    return '<div class="week-card" data-id="'+w.id+'"><div class="week-num">Sem<b>'+w.num+'</b>' +
      '<button class="ar-icon-btn" data-act="editweek" style="margin-top:8px;" type="button">'+PENCIL_SVG+'</button></div>' +
      '<div class="week-body">' +
      (gram ? '<div class="g-line"><span class="lab">Foco</span>'+gram+'</div>' : '') +
      (vocab ? '<ul class="vocab-list">'+vocab+'</ul>' : '') +
      milestone + '</div></div>';
  }

  function weekEditForm(w){
    var vocabRows = w.vocab.map(function(v,i){
      return '<span style="display:flex;gap:4px;align-items:center;">' +
        '<input class="mv-in" style="width:auto;flex:1;" data-vi="'+i+'" value="'+escAttr(v.label)+'" placeholder="Palavra">' +
        '<span class="mx" data-vdel="'+i+'">✕</span></span>';
    }).join('');
    return '<div class="week-card" data-id="'+w.id+'" style="grid-template-columns:1fr;">' +
      '<div class="activity-edit-form" style="padding:0; border-top:none;">' +
        '<label class="lab" style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;color:var(--ink-faint);">Gramática (uma por linha, "NOVO: " para destacar)</label>' +
        '<textarea data-f="grammarNote" style="min-height:70px;">'+escHtml(w.grammarNote||'')+'</textarea>' +
        '<label class="lab" style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;color:var(--ink-faint);">Vocabulário</label>' +
        '<div class="meta-edit-row" style="background:var(--surface-2); padding:8px; border-radius:8px;" id="weekVocabRows-'+w.id+'">'+vocabRows+'<button type="button" class="pc-add-meta" data-act="addvocab" style="color:var(--ink-soft);border-color:var(--line-strong);">+ palavra</button></div>' +
        '<label class="lab" style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;color:var(--ink-faint);">Marco / checkpoint (opcional)</label>' +
        '<textarea data-f="milestoneNote" placeholder="Deixa em branco se não houver checkpoint nesta semana">'+escHtml(w.milestoneNote||'')+'</textarea>' +
        '<div class="form-actions"><button class="btn ghost" data-act="cancelweek" type="button">Cancelar</button><button class="btn" data-act="saveweek" type="button">Guardar</button></div>' +
      '</div></div>';
  }

  function bindWeekHandlers(){
    document.querySelectorAll('.week-card [data-act="editweek"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openWeekEditId = btn.closest('.week-card').getAttribute('data-id'); renderLangStatic(); });
    });
    document.querySelectorAll('.week-card [data-act="cancelweek"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openWeekEditId = null; renderLangStatic(); });
    });
    document.querySelectorAll('.week-card [data-act="addvocab"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.closest('.week-card').getAttribute('data-id');
        var w = state.langWeeks.find(function(x){ return x.id===id; });
        w.vocab.push({ key:'v'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), label:'' });
        renderLangStatic();
      });
    });
    document.querySelectorAll('.week-card [data-vdel]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.closest('.week-card').getAttribute('data-id');
        var w = state.langWeeks.find(function(x){ return x.id===id; });
        w.vocab.splice(+btn.getAttribute('data-vdel'), 1);
        renderLangStatic();
      });
    });
    document.querySelectorAll('.week-card [data-act="saveweek"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('.week-card');
        var id = card.getAttribute('data-id');
        var w = state.langWeeks.find(function(x){ return x.id===id; });
        w.grammarNote = card.querySelector('[data-f="grammarNote"]').value.trim();
        w.milestoneNote = card.querySelector('[data-f="milestoneNote"]').value.trim();
        card.querySelectorAll('[data-vi]').forEach(function(inp){
          w.vocab[+inp.getAttribute('data-vi')].label = inp.value.trim();
        });
        w.vocab = w.vocab.filter(function(v){ return v.label; });
        saveState();
        openWeekEditId = null;
        renderLangStatic();
        renderDashboard();
      });
    });
  }

  function bindVocabHandlers(){
    document.querySelectorAll('.vocab-list input[type="checkbox"]').forEach(function(box){
      var key = box.getAttribute('data-k');
      box.checked = !!state.vocab[key];
      box.addEventListener('change', function(){
        state.vocab[key] = box.checked;
        saveState();
        renderVocabProgress();
        renderDashboard();
      });
    });
  }

  function renderVocabProgress(){
    var allVocabKeys = getAllVocabKeys();
    var total = allVocabKeys.length;
    var done = allVocabKeys.filter(function(k){ return state.vocab[k]; }).length;
    document.getElementById('vocabChip').textContent = done + '/' + total + ' vocab';
    var pct = total ? done/total : 0;
    setRing('ringLang', pct);
    document.getElementById('langSummary').textContent = Math.round(pct*100) + '% do vocabulário';
    return { done:total, pct:pct };
  }

  /* ================= FORMA ================= */
  var openFitRowDay = null;
  function renderFitStatic(){
    document.getElementById('fitStats').innerHTML =
      stat('Idade', FIT_META.age + ' anos') +
      stat('Altura', FIT_META.heightCm + ' cm') +
      stat('Treinos/sem', '5', false, true) +
      stat('Meta', '−'+FIT_META.goalRate+' kg/sem', true);

    var weekdaysThisWeek = weekDates(TODAY);
    document.getElementById('fitTraining').innerHTML = WEEKDAYS.map(function(day, i){
      var act = fitnessActivityForDay(day);
      if(!act) return '';
      var dISO = iso(weekdaysThisWeek[i]);
      var isToday = dISO === TODAY_ISO;
      var area = AREAS.fitness;
      if(day === openFitRowDay){
        return '<tr class="editing-row" data-day="'+day+'"><td colspan="5" style="padding:10px 16px;">' +
          '<div style="max-width:min(320px,80vw);">' +
          '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
          '<input data-f="time" value="'+escAttr(act.time||'')+'" placeholder="Hora" style="width:90px;flex-shrink:0;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;font-family:var(--font-mono);">' +
          '<input data-f="title" value="'+escAttr(act.title)+'" placeholder="Treino" style="flex:1;min-width:0;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;font-weight:600;"></div>' +
          '<textarea data-f="detail" placeholder="Foco" style="width:100%;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;min-height:40px;font-family:inherit;">'+escHtml(act.detail||'')+'</textarea>' +
          '<div class="form-actions" style="justify-content:flex-end;margin-top:6px;"><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancelrow" type="button">Cancelar</button><button class="btn" data-act="saverow" type="button">Guardar</button></span></div>' +
          '</div></td></tr>';
      }
      var checkbox = '<span class="done-check" data-date="'+dISO+'" data-day="'+day+'" data-act="'+act.id+'">'+CHECK_SVG+'</span>';
      return '<tr'+(isToday?' class="today"':'')+' data-act="editrow" data-day="'+day+'" style="cursor:pointer;">' +
        '<td>'+checkbox+'</td>' +
        '<td class="day">'+day+'</td>' +
        '<td class="time mono">'+escHtml(act.time||'—')+'</td>' +
        '<td><span class="area-tag"><span class="area-dot" style="background:'+area.color+'"></span>'+escHtml(act.title)+'</span></td>' +
        '<td style="color:var(--ink-soft);font-size:12.5px;">'+escHtml(act.detail||'')+'</td>' +
        '</tr>';
    }).join('');

    renderProtocolosGrid();
    renderRefeicoesCards();
    renderRegrasGrid();
    renderAlimentosBoxes();

    bindTrainHandlers();
    renderWeightAll();
  }

  /* ---- protocolos (grelha 2-col, visual original + edição inline) ---- */
  var openProtoEdit = null;
  function renderProtocolosGrid(){
    var box = document.getElementById('fitProtocolosNotes');
    box.className = 'protocols';
    box.innerHTML = state.fitNotes.protocolos.map(function(p){
      if(p.id === openProtoEdit){
        return '<div class="proto editing" data-id="'+p.id+'" style="grid-column:1/-1;">' +
          '<input data-f="title" type="text" value="'+escAttr(p.title)+'" style="width:100%;margin-bottom:6px;border:1px solid var(--line);background:var(--surface-2);border-radius:6px;padding:7px 9px;font-size:13px;font-weight:600;">' +
          '<textarea data-f="body" style="width:100%;min-height:60px;border:1px solid var(--line);background:var(--surface-2);border-radius:6px;padding:7px 9px;font-size:12.5px;font-family:inherit;">'+escHtml(p.body)+'</textarea>' +
          '<div class="form-actions" style="justify-content:space-between;margin-top:8px;"><button class="btn ghost" data-act="del" type="button">Apagar</button><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancel" type="button">Cancelar</button><button class="btn" data-act="save" type="button">Guardar</button></span></div>' +
          '</div>';
      }
      return '<div class="proto" data-id="'+p.id+'" style="position:relative;">' +
        '<button class="cardedit" data-act="edit" type="button" style="position:absolute;top:10px;right:10px;background:var(--surface-2);color:var(--ink-faint);">'+PENCIL_SVG+'</button>' +
        '<h3 style="padding-right:22px;">'+escHtml(p.title)+'</h3><p>'+escHtml(p.body)+'</p></div>';
    }).join('');
    var box2 = box;
    box2.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openProtoEdit = btn.closest('[data-id]').getAttribute('data-id'); renderProtocolosGrid(); });
    });
    box2.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openProtoEdit=null; renderProtocolosGrid(); });
    });
    box2.querySelectorAll('[data-act="del"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!confirm('Apagar este protocolo?')) return;
        var id = btn.closest('[data-id]').getAttribute('data-id');
        state.fitNotes.protocolos = state.fitNotes.protocolos.filter(function(p){ return p.id!==id; });
        saveState(); openProtoEdit=null; renderProtocolosGrid();
      });
    });
    box2.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('[data-id]');
        var id = card.getAttribute('data-id');
        var p = state.fitNotes.protocolos.find(function(x){ return x.id===id; });
        p.title = card.querySelector('[data-f="title"]').value.trim() || 'Sem título';
        p.body = card.querySelector('[data-f="body"]').value.trim();
        saveState(); openProtoEdit=null; renderProtocolosGrid();
      });
    });
  }
  document.getElementById('btnAddProtocolo').addEventListener('click', function(){
    var p = { id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), title:'Novo protocolo', body:'' };
    state.fitNotes.protocolos.push(p);
    saveState(); openProtoEdit = p.id; renderProtocolosGrid();
  });

  /* ---- regras de ouro (grelha 2-col k/v, visual original + edição inline) ---- */
  var openRegraEdit = null;
  function renderRegrasGrid(){
    var box = document.getElementById('fitRegrasNotes');
    box.className = 'rules';
    box.innerHTML = state.fitNotes.regras.map(function(r){
      if(r.id === openRegraEdit){
        return '<div class="rule editing" data-id="'+r.id+'" style="background:var(--accent-soft);">' +
          '<input data-f="title" value="'+escAttr(r.title)+'" style="width:100%;margin-bottom:5px;border:1px solid var(--line-strong);background:var(--surface);border-radius:6px;padding:5px 7px;font-size:12px;font-weight:600;">' +
          '<input data-f="body" value="'+escAttr(r.body)+'" style="width:100%;border:1px solid var(--line-strong);background:var(--surface);border-radius:6px;padding:5px 7px;font-size:12px;">' +
          '<div class="miniactions" style="display:flex;justify-content:space-between;margin-top:6px;"><span class="btnmini" data-act="del" style="cursor:pointer;color:var(--bad);font-size:11px;">Apagar</span><span style="display:flex;gap:6px;"><span class="btnmini" data-act="cancel" style="cursor:pointer;font-size:11px;">✕</span><span class="btnmini" data-act="save" style="cursor:pointer;font-size:11px;font-weight:700;">✓</span></span></div>' +
          '</div>';
      }
      return '<div class="rule" data-id="'+r.id+'" style="position:relative;">' +
        '<button class="cardedit" data-act="edit" type="button" style="position:absolute;top:8px;right:8px;width:20px;height:20px;background:none;border:none;color:var(--ink-faint);padding:0;">'+PENCIL_SVG+'</button>' +
        '<div class="k">'+escHtml(r.title)+'</div><p class="v">'+escHtml(r.body)+'</p></div>';
    }).join('');
    var box2 = box;
    box2.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openRegraEdit = btn.closest('[data-id]').getAttribute('data-id'); renderRegrasGrid(); });
    });
    box2.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openRegraEdit=null; renderRegrasGrid(); });
    });
    box2.querySelectorAll('[data-act="del"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!confirm('Apagar esta regra?')) return;
        var id = btn.closest('[data-id]').getAttribute('data-id');
        state.fitNotes.regras = state.fitNotes.regras.filter(function(r){ return r.id!==id; });
        saveState(); openRegraEdit=null; renderRegrasGrid();
      });
    });
    box2.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('[data-id]');
        var id = card.getAttribute('data-id');
        var r = state.fitNotes.regras.find(function(x){ return x.id===id; });
        r.title = card.querySelector('[data-f="title"]').value.trim() || 'Sem título';
        r.body = card.querySelector('[data-f="body"]').value.trim();
        saveState(); openRegraEdit=null; renderRegrasGrid();
      });
    });
  }
  document.getElementById('btnAddRegra').addEventListener('click', function(){
    var r = { id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), title:'Nova regra', body:'' };
    state.fitNotes.regras.push(r);
    saveState(); openRegraEdit = r.id; renderRegrasGrid();
  });

  /* ---- alimentos (2 colunas com itens soltos, visual original) ---- */
  function renderAlimentosBoxes(){
    var box = document.getElementById('fitAlimentosNotes');
    box.className = 'foods';
    box.innerHTML = state.fitNotes.alimentos.map(function(g){
      var items = g.items.map(function(food, i){
        return '<li>'+escHtml(food)+'<span class="x" data-gid="'+g.id+'" data-fi="'+i+'">✕</span></li>';
      }).join('');
      return '<div class="foodbox" data-id="'+g.id+'">' +
        '<h3>'+escHtml(g.title)+'</h3><ul>'+items+'</ul>' +
        '<form class="foodadd" data-gid="'+g.id+'"><input type="text" placeholder="+ adicionar…"><button type="submit" hidden></button></form></div>';
    }).join('');

    box.querySelectorAll('.x').forEach(function(el){
      el.addEventListener('click', function(){
        var g = state.fitNotes.alimentos.find(function(x){ return x.id===el.getAttribute('data-gid'); });
        g.items.splice(+el.getAttribute('data-fi'), 1);
        saveState(); renderAlimentosBoxes();
      });
    });
    box.querySelectorAll('.foodadd').forEach(function(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var inp = form.querySelector('input');
        var v = inp.value.trim(); if(!v) return;
        var g = state.fitNotes.alimentos.find(function(x){ return x.id===form.getAttribute('data-gid'); });
        g.items.push(v);
        saveState(); renderAlimentosBoxes();
      });
    });
  }
  document.getElementById('btnAddAlimento').addEventListener('click', function(){
    state.fitNotes.alimentos.push({ id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), title:'Novo grupo', items:[] });
    saveState(); renderAlimentosBoxes();
  });

  /* ---- refeições (mealcard colorido + linhas editáveis, visual original) ---- */
  var MEAL_TAG_COLOR = { judo:'var(--cat-fit)', tiros:'var(--warn)', rest:'var(--ink-faint)' };
  var openRefeicaoHeadEdit = null;
  var openRefeicaoRowEdit = null;
  function renderRefeicoesCards(){
    var box = document.getElementById('fitRefeicoesNotes');
    box.innerHTML = state.fitNotes.refeicoes.map(function(m){
      var headEditing = m.id === openRefeicaoHeadEdit;
      var headHtml = headEditing
        ? '<div style="padding:12px 16px;background:var(--surface-2);display:flex;flex-direction:column;gap:6px;">' +
            '<input data-f="title" value="'+escAttr(m.title)+'" style="border:1px solid var(--line-strong);border-radius:6px;padding:6px 8px;font-size:13px;">' +
            '<div style="display:flex;gap:6px;"><input data-f="days" value="'+escAttr(m.days)+'" style="flex:1;border:1px solid var(--line-strong);border-radius:6px;padding:6px 8px;font-size:12px;">' +
            '<select data-f="tag" style="border:1px solid var(--line-strong);border-radius:6px;font-size:12px;"><option value="judo"'+(m.tag==='judo'?' selected':'')+'>Verde</option><option value="tiros"'+(m.tag==='tiros'?' selected':'')+'>Âmbar</option><option value="rest"'+(m.tag==='rest'?' selected':'')+'>Neutro</option></select></div>' +
            '<div class="form-actions" style="justify-content:space-between;"><button class="btn ghost" data-act="delcard" type="button">Apagar cartão</button><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancelhead" type="button">Cancelar</button><button class="btn" data-act="savehead" type="button">Guardar</button></span></div>' +
          '</div>'
        : '<div class="head" style="background:'+(MEAL_TAG_COLOR[m.tag]||'var(--ink-faint)')+';cursor:pointer;" data-act="edithead">' +
            '<h3>'+escHtml(m.title)+'</h3><span>'+escHtml(m.days)+'</span></div>';

      var rows = m.rows.map(function(r){
        if(m.id+'|'+r.id === openRefeicaoRowEdit){
          return '<tr class="editing-row" data-rid="'+r.id+'"><td colspan="3" style="padding:10px 16px;">' +
            '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
            '<input data-rf="time" value="'+escAttr(r.time)+'" style="width:90px;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;font-family:var(--font-mono);">' +
            '<input data-rf="name" value="'+escAttr(r.name)+'" style="flex:1;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;font-weight:600;"></div>' +
            '<textarea data-rf="desc" style="width:100%;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;min-height:40px;">'+escHtml(r.desc)+'</textarea>' +
            '<div class="form-actions" style="justify-content:space-between;margin-top:6px;"><button class="btn ghost" data-act="delrow" type="button">Apagar</button><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancelrow" type="button">Cancelar</button><button class="btn" data-act="saverow" type="button">Guardar</button></span></div>' +
            '</td></tr>';
        }
        return '<tr data-rid="'+r.id+'" data-act="editrow" style="cursor:pointer;">' +
          '<td class="mtime">'+escHtml(r.time)+'</td><td class="mname">'+escHtml(r.name)+'</td>' +
          '<td>'+escHtml(r.desc)+(r.note?'<span class="note">'+escHtml(r.note)+'</span>':'')+'</td></tr>';
      }).join('');

      return '<div class="mealcard" data-id="'+m.id+'">' + headHtml +
        '<table><tbody>'+rows+'<tr data-act="addrow"><td colspan="3" style="text-align:center;color:var(--ink-faint);font-size:12px;cursor:pointer;padding:10px;">+ adicionar refeição</td></tr></tbody></table></div>';
    }).join('');

    var box2 = box;
    box2.querySelectorAll('[data-act="edithead"]').forEach(function(el){
      el.addEventListener('click', function(){ openRefeicaoHeadEdit = el.closest('[data-id]').getAttribute('data-id'); openRefeicaoRowEdit=null; renderRefeicoesCards(); });
    });
    box2.querySelectorAll('[data-act="cancelhead"]').forEach(function(el){
      el.addEventListener('click', function(){ openRefeicaoHeadEdit=null; renderRefeicoesCards(); });
    });
    box2.querySelectorAll('[data-act="delcard"]').forEach(function(el){
      el.addEventListener('click', function(){
        if(!confirm('Apagar este cartão de refeições?')) return;
        var id = el.closest('[data-id]').getAttribute('data-id');
        state.fitNotes.refeicoes = state.fitNotes.refeicoes.filter(function(m){ return m.id!==id; });
        saveState(); openRefeicaoHeadEdit=null; renderRefeicoesCards();
      });
    });
    box2.querySelectorAll('[data-act="savehead"]').forEach(function(el){
      el.addEventListener('click', function(){
        var card = el.closest('[data-id]');
        var id = card.getAttribute('data-id');
        var m = state.fitNotes.refeicoes.find(function(x){ return x.id===id; });
        m.title = card.querySelector('[data-f="title"]').value.trim() || 'Sem título';
        m.days = card.querySelector('[data-f="days"]').value.trim();
        m.tag = card.querySelector('[data-f="tag"]').value;
        saveState(); openRefeicaoHeadEdit=null; renderRefeicoesCards();
      });
    });
    box2.querySelectorAll('[data-act="editrow"]').forEach(function(el){
      el.addEventListener('click', function(){
        var mid = el.closest('[data-id]').getAttribute('data-id');
        openRefeicaoRowEdit = mid+'|'+el.getAttribute('data-rid');
        renderRefeicoesCards();
      });
    });
    box2.querySelectorAll('[data-act="cancelrow"]').forEach(function(el){
      el.addEventListener('click', function(){ openRefeicaoRowEdit=null; renderRefeicoesCards(); });
    });
    box2.querySelectorAll('[data-act="delrow"]').forEach(function(el){
      el.addEventListener('click', function(){
        var card = el.closest('[data-id]');
        var mid = card.getAttribute('data-id');
        var rid = el.closest('tr').getAttribute('data-rid');
        var m = state.fitNotes.refeicoes.find(function(x){ return x.id===mid; });
        m.rows = m.rows.filter(function(r){ return r.id!==rid; });
        saveState(); openRefeicaoRowEdit=null; renderRefeicoesCards();
      });
    });
    box2.querySelectorAll('[data-act="saverow"]').forEach(function(el){
      el.addEventListener('click', function(){
        var card = el.closest('[data-id]');
        var mid = card.getAttribute('data-id');
        var rid = el.closest('tr').getAttribute('data-rid');
        var m = state.fitNotes.refeicoes.find(function(x){ return x.id===mid; });
        var r = m.rows.find(function(x){ return x.id===rid; });
        r.time = el.closest('tr').querySelector('[data-rf="time"]').value.trim();
        r.name = el.closest('tr').querySelector('[data-rf="name"]').value.trim();
        r.desc = el.closest('tr').querySelector('[data-rf="desc"]').value.trim();
        saveState(); openRefeicaoRowEdit=null; renderRefeicoesCards();
      });
    });
    box2.querySelectorAll('[data-act="addrow"]').forEach(function(el){
      el.addEventListener('click', function(){
        var mid = el.closest('[data-id]').getAttribute('data-id');
        var m = state.fitNotes.refeicoes.find(function(x){ return x.id===mid; });
        var row = { id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), time:'', name:'Nova refeição', desc:'' };
        m.rows.push(row);
        openRefeicaoRowEdit = mid+'|'+row.id;
        renderRefeicoesCards();
      });
    });
  }
  document.getElementById('btnAddRefeicao').addEventListener('click', function(){
    var m = { id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), title:'Novo dia', days:'', tag:'rest', rows:[] };
    state.fitNotes.refeicoes.push(m);
    saveState(); openRefeicaoHeadEdit = m.id; renderRefeicoesCards();
  });

  function bindTrainHandlers(){
    var table = document.getElementById('fitTraining');
    table.querySelectorAll('.done-check[data-act]').forEach(function(el){
      var d = el.getAttribute('data-date');
      var day = el.getAttribute('data-day');
      var actId = el.getAttribute('data-act');
      el.classList.toggle('on', isActDone(d, actId));
      el.addEventListener('click', function(e){
        e.stopPropagation();
        toggleActivityDone(d, day, actId);
        el.classList.toggle('on', isActDone(d, actId));
        renderTrainProgress();
        renderDashboard();
      });
    });
    table.querySelectorAll('[data-act="editrow"]').forEach(function(tr){
      tr.addEventListener('click', function(){
        openFitRowDay = tr.getAttribute('data-day');
        renderFitStatic();
      });
    });
    table.querySelectorAll('[data-act="cancelrow"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openFitRowDay=null; renderFitStatic(); });
    });
    table.querySelectorAll('[data-act="saverow"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var tr = btn.closest('[data-day]');
        var day = tr.getAttribute('data-day');
        var act = fitnessActivityForDay(day);
        var time = tr.querySelector('[data-f="time"]').value.trim();
        var title = tr.querySelector('[data-f="title"]').value.trim() || act.title;
        var detail = tr.querySelector('[data-f="detail"]').value.trim();
        updateActivity(day, act.id, { time:time, title:title, detail:detail });
        openFitRowDay=null; renderFitStatic();
      });
    });
    renderTrainProgress();
  }

  function renderTrainProgress(){
    var dates = trackableDatesThisWeek();
    var done = dates.filter(function(x){ return isActDone(x.date, x.id); }).length;
    document.getElementById('trainChip').textContent = done + '/' + dates.length + ' esta semana';
    setRing('ringFit', dates.length ? done/dates.length : 0);
    document.getElementById('fitSummary').textContent = done + '/' + dates.length + ' treinos esta semana';
  }

  /* ================= PESO ================= */
  function currentWeight(){
    if(!state.weight.length) return null;
    return state.weight[state.weight.length-1];
  }
  function addWeight(kg){
    var idx = state.weight.findIndex(function(e){ return e.date === TODAY_ISO; });
    if(idx >= 0) state.weight[idx].kg = kg;
    else state.weight.push({date:TODAY_ISO, kg:kg});
    state.weight.sort(function(a,b){ return a.date < b.date ? -1 : 1; });
    saveState();
    renderWeightAll();
    renderDashboard();
    toast('Peso registado');
  }
  function removeWeight(date){
    state.weight = state.weight.filter(function(e){ return e.date !== date; });
    saveState();
    renderWeightAll();
    renderDashboard();
  }

  function weightTrend(){
    var list = state.weight;
    if(list.length < 2) return null;
    var last = list[list.length-1];
    var lastDate = new Date(last.date);
    var cutoff = addDays(lastDate, -7);
    var ref = list[0];
    for(var i=list.length-2;i>=0;i--){
      if(new Date(list[i].date) <= cutoff){ ref = list[i]; break; }
      ref = list[i];
    }
    var days = Math.max(1, (new Date(last.date) - new Date(ref.date)) / 86400000);
    var rate = (last.kg - ref.kg) / (days/7);
    return rate;
  }

  document.getElementById('weightForm').addEventListener('submit', function(e){
    e.preventDefault();
    var input = document.getElementById('weightInput');
    var v = parseFloat(input.value);
    if(!v || v<30 || v>300) return;
    addWeight(Math.round(v*10)/10);
    input.value='';
  });

  function renderWeightAll(){
    var cur = currentWeight();
    var rate = weightTrend();

    [['dashWeightNow','dashWeightTrend','dashWeightChart'], ['fitWeightNow','fitWeightTrend','fitWeightChart']].forEach(function(ids){
      var nowEl = document.getElementById(ids[0]);
      var trendEl = document.getElementById(ids[1]);
      var chartEl = document.getElementById(ids[2]);
      if(cur){
        nowEl.innerHTML = cur.kg.toFixed(1) + ' <span>kg</span>';
      } else {
        nowEl.innerHTML = FIT_META.startWeight + ' <span>kg · inicial</span>';
      }
      if(rate === null){
        trendEl.className = 'weight-trend flat'; trendEl.textContent = 'regista 2+ pesagens';
      } else {
        var cls = rate <= -FIT_META.goalRate*0.6 ? 'good' : (rate < 0 ? 'warn' : 'bad');
        trendEl.className = 'weight-trend ' + cls;
        var sign = rate<0 ? '−' : '+';
        trendEl.textContent = sign + Math.abs(rate).toFixed(1) + ' kg/sem';
      }
      drawWeightChart(chartEl, state.weight);
    });

    var log = document.getElementById('weightLog');
    log.innerHTML = state.weight.slice().reverse().map(function(e){
      var d = new Date(e.date+'T00:00:00');
      return '<div class="weight-log-row"><span>'+fmtDateShort(d)+'</span><span class="mono">'+e.kg.toFixed(1)+' kg</span><span class="del" data-date="'+e.date+'">'+TRASH_SVG+'</span></div>';
    }).join('') || '<div class="weight-log-row" style="color:var(--ink-faint)">Sem registos ainda.</div>';
    log.querySelectorAll('.del').forEach(function(el){
      el.addEventListener('click', function(){ removeWeight(el.getAttribute('data-date')); });
    });
  }

  function drawWeightChart(svg, entries){
    var W=300, H=120, padX=6, padY=14;
    if(entries.length < 2){
      svg.innerHTML = '<text x="'+(W/2)+'" y="'+(H/2)+'" text-anchor="middle" fill="var(--ink-faint)" font-size="11" font-family="Inter, sans-serif">'+(entries.length===1 ? entries[0].kg.toFixed(1)+' kg registados' : 'Regista o teu peso para veres o gráfico')+'</text>';
      return;
    }
    var xs = entries.map(function(e){ return new Date(e.date).getTime(); });
    var ys = entries.map(function(e){ return e.kg; });
    var minX=Math.min.apply(null,xs), maxX=Math.max.apply(null,xs);
    var minY=Math.min.apply(null,ys), maxY=Math.max.apply(null,ys);
    if(minY===maxY){ minY -= 1; maxY += 1; }
    function px(x){ return padX + (maxX>minX ? (x-minX)/(maxX-minX) : 0.5) * (W-padX*2); }
    function py(y){ return padY + (1 - (y-minY)/(maxY-minY)) * (H-padY*2); }
    var pts = entries.map(function(e){ return px(new Date(e.date).getTime()) + ',' + py(e.kg); });
    var goalY = py(minY); // reference bottom line only for visual baseline
    var line = 'M' + pts.join(' L');
    var area = line + ' L' + px(maxX) + ',' + (H-2) + ' L' + px(minX) + ',' + (H-2) + ' Z';
    svg.innerHTML =
      '<defs><linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--cat-fit)" stop-opacity="0.25"/>' +
      '<stop offset="100%" stop-color="var(--cat-fit)" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="'+area+'" fill="url(#wgrad)" stroke="none"></path>' +
      '<path d="'+line+'" fill="none" stroke="var(--cat-fit)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
      entries.map(function(e){ return '<circle cx="'+px(new Date(e.date).getTime())+'" cy="'+py(e.kg)+'" r="2.6" fill="var(--surface)" stroke="var(--cat-fit)" stroke-width="2"></circle>'; }).join('');
  }

  /* ================= ATIVIDADES (editável) ================= */
  function dayActivities(day){ return state.activities[day] || []; }
  function fitnessActivityForDay(day){ return dayActivities(day).find(function(a){ return a.area==='fitness'; }); }
  function doneKey(dateISO, actId){ return dateISO + '|' + actId; }
  function isActDone(dateISO, actId){ return !!state.activityDone[doneKey(dateISO, actId)]; }

  function recomputeDerived(dateISO, day){
    var acts = dayActivities(day);
    var fitAny = acts.some(function(a){ return a.area==='fitness' && isActDone(dateISO, a.id); });
    var langAny = acts.some(function(a){ return a.area==='linguas' && isActDone(dateISO, a.id); });
    if(fitAny) state.workouts[dateISO] = true; else delete state.workouts[dateISO];
    if(langAny) state.langDone[dateISO] = true; else delete state.langDone[dateISO];
  }

  function toggleActivityDone(dateISO, day, actId){
    var key = doneKey(dateISO, actId);
    if(state.activityDone[key]) delete state.activityDone[key];
    else state.activityDone[key] = true;
    recomputeDerived(dateISO, day);
    saveState();
  }

  function addActivity(day, obj){
    var id = day + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    var act = { id:id, area:obj.area||'outro', title:obj.title||'Nova atividade', detail:obj.detail||'', time:obj.time||'' };
    if(!state.activities[day]) state.activities[day] = [];
    state.activities[day].push(act);
    saveState();
    return act;
  }
  function updateActivity(day, id, patch){
    var act = dayActivities(day).find(function(a){ return a.id===id; });
    if(!act) return;
    Object.assign(act, patch);
    saveState();
  }
  function removeActivity(day, id){
    state.activities[day] = dayActivities(day).filter(function(a){ return a.id!==id; });
    saveState();
  }

  function trackableDatesThisWeek(){
    var wd = weekDates(TODAY);
    return WEEKDAYS.map(function(day, i){
      var act = fitnessActivityForDay(day);
      return act ? { date: iso(wd[i]), id: act.id } : null;
    }).filter(Boolean);
  }

  /* ---- aba Trabalho (DROP) ---- */
  var openWorkRowDay = null;
  function renderWorkStatic(){
    var weekdaysThisWeek = weekDates(TODAY);
    document.getElementById('workList').innerHTML =
      '<div class="tbl-scroll"><table class="week"><thead><tr><th>Feito</th><th>Dia</th><th>Tarefa</th><th>Detalhe</th></tr></thead><tbody>' +
      WEEKDAYS.map(function(day, i){
        var act = dayActivities(day).find(function(a){ return a.area==='trabalho'; });
        if(!act) return '';
        var dISO = iso(weekdaysThisWeek[i]);
        var isToday = dISO === TODAY_ISO;
        if(day === openWorkRowDay){
          return '<tr class="editing-row" data-day="'+day+'"><td colspan="4" style="padding:10px 16px;">' +
            '<div style="max-width:min(320px,80vw);">' +
            '<input data-f="title" value="'+escAttr(act.title)+'" placeholder="Tarefa" style="width:100%;margin-bottom:6px;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;font-weight:600;">' +
            '<textarea data-f="detail" placeholder="Detalhe" style="width:100%;border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;min-height:40px;font-family:inherit;">'+escHtml(act.detail||'')+'</textarea>' +
            '<div class="form-actions" style="justify-content:flex-end;margin-top:6px;"><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancelrow" type="button">Cancelar</button><button class="btn" data-act="saverow" type="button">Guardar</button></span></div>' +
            '</div></td></tr>';
        }
        var checkbox = '<span class="done-check" data-date="'+dISO+'" data-day="'+day+'" data-act="'+act.id+'">'+CHECK_SVG+'</span>';
        return '<tr'+(isToday?' class="today"':'')+' data-act="editrow" data-day="'+day+'" style="cursor:pointer;">' +
          '<td>'+checkbox+'</td><td class="day">'+day+'</td><td>'+escHtml(act.title.replace(/^DROP\s*—\s*/,''))+'</td>' +
          '<td style="color:var(--ink-soft);font-size:12.5px;">'+escHtml(act.detail||'')+'</td></tr>';
      }).join('') + '</tbody></table></div>';

    var table = document.getElementById('workList');
    table.querySelectorAll('.done-check').forEach(function(el){
      var d = el.getAttribute('data-date'), day = el.getAttribute('data-day'), actId = el.getAttribute('data-act');
      el.classList.toggle('on', isActDone(d, actId));
      el.addEventListener('click', function(e){
        e.stopPropagation();
        toggleActivityDone(d, day, actId);
        el.classList.toggle('on', isActDone(d, actId));
        renderDashboard();
      });
    });
    table.querySelectorAll('[data-act="editrow"]').forEach(function(tr){
      tr.addEventListener('click', function(){
        openWorkRowDay = tr.getAttribute('data-day');
        renderWorkStatic();
      });
    });
    table.querySelectorAll('[data-act="cancelrow"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openWorkRowDay=null; renderWorkStatic(); });
    });
    table.querySelectorAll('[data-act="saverow"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var tr = btn.closest('[data-day]');
        var day = tr.getAttribute('data-day');
        var act = dayActivities(day).find(function(a){ return a.area==='trabalho'; });
        var title = tr.querySelector('[data-f="title"]').value.trim() || act.title;
        var detail = tr.querySelector('[data-f="detail"]').value.trim();
        updateActivity(day, act.id, { title:title, detail:detail });
        openWorkRowDay=null; renderWorkStatic();
      });
    });
  }

  /* ---- editor sheet ---- */
  var editingDay = TODAY_WEEKDAY;
  function renderDayPicker(){
    document.getElementById('dayPicker').innerHTML = WEEKDAYS.map(function(day){
      var type = DAY_TYPE[day];
      var color = type==='foco' ? 'var(--accent)' : 'var(--cat-lang)';
      return '<button data-day="'+day+'" class="'+(day===editingDay?'active':'')+'">' +
        '<span class="dtdot" style="background:'+color+'"></span>' + day.slice(0,3) + '</button>';
    }).join('');
    document.querySelectorAll('#dayPicker button').forEach(function(b){
      b.addEventListener('click', function(){ editingDay = b.getAttribute('data-day'); renderDayPicker(); renderActivityList(); });
    });
  }

  function activityRowView(day, act){
    var area = AREAS[act.area] || AREAS.outro;
    return '<div class="activity-row" data-id="'+act.id+'">' +
      '<span class="area-dot" style="background:'+area.color+'; margin-top:6px;"></span>' +
      '<div class="ar-body">' +
        '<div class="ar-title">'+escHtml(act.title)+(act.time?' <span class="mono" style="color:var(--ink-faint);font-weight:500;font-size:11.5px;">· '+escHtml(act.time)+'</span>':'')+'</div>' +
        (act.detail ? '<div class="ar-detail">'+escHtml(act.detail)+'</div>' : '') +
      '</div>' +
      '<div class="ar-actions">' +
        '<button class="ar-icon-btn" data-act="edit" type="button">'+PENCIL_SVG+'</button>' +
        '<button class="ar-icon-btn danger" data-act="del" type="button">'+TRASH_SVG+'</button>' +
      '</div></div>';
  }

  function activityRowEdit(day, act){
    return '<div class="activity-edit-form" data-id="'+act.id+'">' +
      '<select data-f="area">' + Object.keys(AREAS).map(function(k){ return '<option value="'+k+'"'+(k===act.area?' selected':'')+'>'+AREAS[k].label+'</option>'; }).join('') + '</select>' +
      '<div class="row2">' +
        '<input data-f="title" type="text" placeholder="Título" value="'+escAttr(act.title)+'">' +
        '<input data-f="time" type="text" placeholder="Hora" value="'+escAttr(act.time||'')+'">' +
      '</div>' +
      '<textarea data-f="detail" placeholder="Detalhe (opcional)">'+escHtml(act.detail||'')+'</textarea>' +
      '<div class="form-actions">' +
        '<button class="btn ghost" data-act="cancel" type="button">Cancelar</button>' +
        '<button class="btn" data-act="save" type="button">Guardar</button>' +
      '</div></div>';
  }

  var openEditId = null;
  function renderActivityList(){
    var acts = dayActivities(editingDay);
    var list = document.getElementById('activityList');
    if(!acts.length){
      list.innerHTML = '<p style="color:var(--ink-faint); font-size:13px; padding:14px 4px;">Sem atividades para '+editingDay+' ainda.</p>';
      return;
    }
    list.innerHTML = acts.map(function(act){
      return act.id === openEditId ? activityRowEdit(editingDay, act) : activityRowView(editingDay, act);
    }).join('');

    list.querySelectorAll('.activity-row [data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        openEditId = btn.closest('.activity-row').getAttribute('data-id');
        renderActivityList();
      });
    });
    list.querySelectorAll('.activity-row [data-act="del"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.closest('.activity-row').getAttribute('data-id');
        if(!confirm('Remover esta atividade?')) return;
        removeActivity(editingDay, id);
        renderActivityList();
        renderDashboard();
        renderFitStatic();
      });
    });
    list.querySelectorAll('.activity-edit-form [data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openEditId = null; renderActivityList(); });
    });
    list.querySelectorAll('.activity-edit-form [data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var form = btn.closest('.activity-edit-form');
        var id = form.getAttribute('data-id');
        var patch = {
          area: form.querySelector('[data-f="area"]').value,
          title: form.querySelector('[data-f="title"]').value.trim() || 'Sem título',
          time: form.querySelector('[data-f="time"]').value.trim(),
          detail: form.querySelector('[data-f="detail"]').value.trim(),
        };
        updateActivity(editingDay, id, patch);
        openEditId = null;
        renderActivityList();
        renderDashboard();
        renderFitStatic();
      });
    });
  }

  function escAttr(s){ return String(s).replace(/"/g,'&quot;'); }
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  document.getElementById('btnAddActivity').addEventListener('click', function(){
    var act = addActivity(editingDay, { area:'outro', title:'Nova atividade' });
    openEditId = act.id;
    renderActivityList();
    renderDashboard();
    renderFitStatic();
  });

  document.getElementById('btnEditDay').addEventListener('click', function(){
    editingDay = TODAY_WEEKDAY;
    openEditId = null;
    renderDayPicker();
    renderActivityList();
    openSheet(activitySheet);
  });

  /* ================= PROTOCOLO (identidade + metas) ================= */
  var protocoloEditing = false;
  var editMetas = [];

  function renderProtocolo(){
    if(!protocoloEditing){
      document.getElementById('pcManifestoText').textContent = state.protocolo.manifesto;
      document.getElementById('pcManifestoText').hidden = false;
      document.getElementById('pcManifestoEdit').hidden = true;
      document.getElementById('pcMetas').hidden = false;
      document.getElementById('pcMetaEdit').hidden = true;
      document.getElementById('pcMetas').innerHTML = state.protocolo.metas.map(function(m){
        return '<span class="meta-chip"><span class="ml">'+escHtml(m.label)+'</span><span class="mv">'+escHtml(m.value)+'</span></span>';
      }).join('');
    } else {
      document.getElementById('pcManifestoText').hidden = true;
      var edit = document.getElementById('pcManifestoEdit');
      edit.hidden = false; edit.value = state.protocolo.manifesto;
      document.getElementById('pcMetas').hidden = true;
      document.getElementById('pcMetaEdit').hidden = false;
      renderMetaEdit();
    }
  }

  function renderMetaEdit(){
    var box = document.getElementById('pcMetaEdit');
    box.innerHTML = editMetas.map(function(m, i){
      return '<span style="display:flex;gap:4px;align-items:center;">' +
        '<input class="ml-in" data-i="'+i+'" data-f="label" value="'+escAttr(m.label)+'" placeholder="Meta">' +
        '<input class="mv-in" data-i="'+i+'" data-f="value" value="'+escAttr(m.value)+'" placeholder="Valor">' +
        '<span class="mx" data-i="'+i+'">✕</span></span>';
    }).join('') + '<button type="button" class="pc-add-meta" id="pcAddMeta">+ meta</button>';

    box.querySelectorAll('input').forEach(function(inp){
      inp.addEventListener('input', function(){
        var i = +inp.getAttribute('data-i'), f = inp.getAttribute('data-f');
        editMetas[i][f] = inp.value;
      });
    });
    box.querySelectorAll('.mx').forEach(function(x){
      x.addEventListener('click', function(){
        editMetas.splice(+x.getAttribute('data-i'), 1);
        renderMetaEdit();
      });
    });
    document.getElementById('pcAddMeta').addEventListener('click', function(){
      editMetas.push({label:'', value:''});
      renderMetaEdit();
    });
  }

  document.getElementById('btnEditProtocolo').addEventListener('click', function(){
    if(!protocoloEditing){
      editMetas = clone(state.protocolo.metas);
      protocoloEditing = true;
      document.getElementById('btnEditProtocolo').innerHTML = CHECK_SVG;
    } else {
      state.protocolo.manifesto = document.getElementById('pcManifestoEdit').value.trim() || state.protocolo.manifesto;
      state.protocolo.metas = editMetas.filter(function(m){ return m.label.trim() || m.value.trim(); });
      saveState();
      protocoloEditing = false;
      document.getElementById('btnEditProtocolo').innerHTML = PENCIL_SVG;
    }
    renderProtocolo();
  });

  /* ================= VIDA (finanças / compras / agenda / pendentes / planos) ================= */
  function fmtMT(n){ return (n<0?'−':'') + Math.abs(n).toLocaleString('pt-PT',{minimumFractionDigits:0, maximumFractionDigits:2}) + ' MT'; }

  function renderFinance(){
    var mk = TODAY_ISO.slice(0,7);
    var monthTx = state.finance.filter(function(t){ return t.date.slice(0,7)===mk; });
    var totalIn = monthTx.filter(function(t){ return t.type==='entrada'; }).reduce(function(s,t){ return s+t.amount; },0);
    var totalOut = monthTx.filter(function(t){ return t.type==='saida'; }).reduce(function(s,t){ return s+t.amount; },0);
    document.getElementById('financeStats').innerHTML =
      stat('Entradas', fmtMT(totalIn)) +
      stat('Saídas', fmtMT(totalOut)) +
      stat('Saldo do mês', fmtMT(totalIn-totalOut), totalIn-totalOut>=0);

    var log = document.getElementById('financeLog');
    var list = state.finance.slice().sort(function(a,b){ return a.date<b.date?1:-1; });
    log.innerHTML = list.length ? list.map(function(t){
      var d = new Date(t.date+'T00:00:00');
      return '<div class="list-row"><div class="lr-main"><div class="lr-title">'+escHtml(t.desc)+'</div>' +
        '<div class="lr-sub">'+fmtDateShort(d)+' · '+t.category+'</div></div>' +
        '<div class="lr-right"><span class="lr-amount '+(t.type==='entrada'?'in':'out')+'">'+(t.type==='entrada'?'+':'−')+fmtMT(t.amount)+'</span>' +
        '<span class="del" data-id="'+t.id+'">'+TRASH_SVG+'</span></div></div>';
    }).join('') : '<div class="list-row" style="color:var(--ink-faint)">Sem registos ainda.</div>';
    log.querySelectorAll('.del').forEach(function(el){
      el.addEventListener('click', function(){
        state.finance = state.finance.filter(function(t){ return t.id!==el.getAttribute('data-id'); });
        saveState(); renderFinance();
      });
    });
  }
  document.getElementById('financeCategory').innerHTML = FINANCE_CATEGORIES.map(function(c){ return '<option>'+c+'</option>'; }).join('');
  document.getElementById('financeForm').addEventListener('submit', function(e){
    e.preventDefault();
    var amount = parseFloat(document.getElementById('financeAmount').value);
    if(!amount || amount<=0) return;
    state.finance.push({
      id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),
      date: TODAY_ISO,
      type: document.getElementById('financeType').value,
      desc: document.getElementById('financeDesc').value.trim() || 'Sem descrição',
      amount: amount,
      category: document.getElementById('financeCategory').value,
    });
    saveState();
    document.getElementById('financeForm').reset();
    renderFinance();
    toast('Registado');
  });

  function pendenteDueDate(it){
    if(!it || !it.due) return null;
    return new Date(it.due + 'T' + (it.dueTime || '23:59') + ':00');
  }
  function dueHoursLabel(d){
    var diffMs = d - new Date();
    if(diffMs < 0) return 'atrasado';
    var diffH = diffMs / 3600000;
    if(diffH < 1) return 'em ' + Math.max(1, Math.round(diffMs/60000)) + ' min';
    if(diffH < 24) return 'em ' + Math.round(diffH) + 'h';
    var days = Math.round(diffH/24);
    return 'em ' + days + (days===1?' dia':' dias');
  }
  function formatDueFull(it){
    var d = new Date(it.due+'T00:00:00');
    var label = d.toLocaleDateString('pt-PT',{day:'2-digit',month:'short'});
    return it.dueTime ? label+' · '+it.dueTime : label;
  }

  var openPendenteEdit = null;
  function renderChecklist(stateKey, containerId){
    var arr = state[stateKey];
    var isPendentes = stateKey === 'pendentes';
    var el = document.getElementById(containerId);
    el.innerHTML = arr.length ? arr.map(function(it){
      if(isPendentes && it.id === openPendenteEdit){
        return '<div class="today-item editing-item" data-id="'+it.id+'" style="display:block;padding:12px;">' +
          '<input data-f="text" value="'+escAttr(it.text)+'" style="width:100%;margin-bottom:6px;border:1px solid var(--line-strong);border-radius:6px;padding:6px 8px;font-size:13px;">' +
          '<div style="display:flex;gap:6px;margin-bottom:8px;">' +
          '<input data-f="date" type="date" value="'+(it.due||'')+'" style="border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;">' +
          '<input data-f="time" type="time" value="'+(it.dueTime||'')+'" style="border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;">' +
          '</div>' +
          '<div class="form-actions" style="justify-content:flex-end;"><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancel" type="button">Cancelar</button><button class="btn" data-act="save" type="button">Guardar</button></span></div>' +
          '</div>';
      }
      var due = isPendentes && it.due ? pendenteDueDate(it) : null;
      var dueHtml = due ? '<div class="ts" style="color:'+(due-new Date()<0?'var(--bad)':'var(--ink-faint)')+';">'+formatDueFull(it)+' · '+dueHoursLabel(due)+'</div>' : '';
      return '<div class="today-item'+(it.done?' done':'')+'" data-id="'+it.id+'">' +
        '<span class="today-check'+(it.done?' on':'')+'">'+CHECK_SVG+'</span>' +
        '<div class="today-txt"><div class="tt">'+escHtml(it.text)+'</div>'+dueHtml+'</div>' +
        (isPendentes ? '<button class="ar-icon-btn" data-act="editdue" data-id="'+it.id+'" type="button">'+PENCIL_SVG+'</button>' : '') +
        '<span class="del" data-id="'+it.id+'">'+TRASH_SVG+'</span></div>';
    }).join('') : '<p style="color:var(--ink-faint); font-size:13px;">Nada por aqui ainda.</p>';

    el.querySelectorAll('.today-item:not(.editing-item)').forEach(function(row){
      row.addEventListener('click', function(ev){
        if(ev.target.closest('.del') || ev.target.closest('[data-act="editdue"]')) return;
        var it = arr.find(function(x){ return x.id===row.getAttribute('data-id'); });
        it.done = !it.done;
        saveState();
        renderChecklist(stateKey, containerId);
        if(isPendentes) renderDashPendentes();
      });
    });
    el.querySelectorAll('.del').forEach(function(btn){
      btn.addEventListener('click', function(ev){
        ev.stopPropagation();
        state[stateKey] = state[stateKey].filter(function(x){ return x.id!==btn.getAttribute('data-id'); });
        saveState();
        renderChecklist(stateKey, containerId);
        if(isPendentes) renderDashPendentes();
      });
    });
    el.querySelectorAll('[data-act="editdue"]').forEach(function(btn){
      btn.addEventListener('click', function(ev){
        ev.stopPropagation();
        openPendenteEdit = btn.getAttribute('data-id');
        renderChecklist(stateKey, containerId);
      });
    });
    el.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openPendenteEdit=null; renderChecklist(stateKey, containerId); });
    });
    el.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var row = btn.closest('[data-id]');
        var id = row.getAttribute('data-id');
        var it = arr.find(function(x){ return x.id===id; });
        it.text = row.querySelector('[data-f="text"]').value.trim() || it.text;
        it.due = row.querySelector('[data-f="date"]').value || null;
        it.dueTime = row.querySelector('[data-f="time"]').value || null;
        saveState();
        openPendenteEdit=null;
        renderChecklist(stateKey, containerId);
        renderDashPendentes();
      });
    });
  }
  /* ---- compras: várias listas nomeadas (ao estilo sub-páginas) ---- */
  var currentShoppingListId = null;
  function currentShoppingList(){
    if(!state.shoppingLists.length) state.shoppingLists.push({ id:'default', name:'Compras', items:[] });
    if(!currentShoppingListId || !state.shoppingLists.some(function(l){ return l.id===currentShoppingListId; })){
      currentShoppingListId = state.shoppingLists[0].id;
    }
    return state.shoppingLists.find(function(l){ return l.id===currentShoppingListId; });
  }
  var renamingShoppingList = false;
  function renderShopping(){
    var list = currentShoppingList();
    var picker = document.getElementById('shoppingListPicker');
    picker.innerHTML = state.shoppingLists.map(function(l){
      return '<button data-id="'+l.id+'" class="'+(l.id===list.id?'active':'')+'">'+escHtml(l.name)+' <span class="mono" style="opacity:.6;">'+l.items.length+'</span></button>';
    }).join('');
    picker.querySelectorAll('button').forEach(function(b){
      b.addEventListener('click', function(){ currentShoppingListId = b.getAttribute('data-id'); renamingShoppingList=false; renderShopping(); });
    });

    var cur = document.getElementById('shoppingListCurrent');
    if(renamingShoppingList){
      cur.innerHTML = '<input id="shoppingListRenameInput" value="'+escAttr(list.name)+'" style="flex:1;border:1px solid var(--line-strong);border-radius:6px;padding:6px 8px;font-size:13px;">' +
        '<span style="display:flex;gap:6px;margin-left:8px;"><button class="btn ghost" id="btnCancelRenameList" type="button">Cancelar</button><button class="btn" id="btnSaveRenameList" type="button">Guardar</button></span>';
      document.getElementById('btnCancelRenameList').addEventListener('click', function(){ renamingShoppingList=false; renderShopping(); });
      document.getElementById('btnSaveRenameList').addEventListener('click', function(){
        var v = document.getElementById('shoppingListRenameInput').value.trim();
        if(v) list.name = v;
        saveState(); renamingShoppingList=false; renderShopping();
      });
    } else {
      cur.innerHTML = '<span style="font-weight:600;font-size:13.5px;">'+escHtml(list.name)+'</span>' +
        '<span style="display:flex;gap:6px;">' +
        '<button class="ar-icon-btn" id="btnRenameList" type="button">'+PENCIL_SVG+'</button>' +
        (state.shoppingLists.length>1 ? '<button class="ar-icon-btn danger" id="btnDeleteList" type="button">'+TRASH_SVG+'</button>' : '') +
        '</span>';
      document.getElementById('btnRenameList').addEventListener('click', function(){ renamingShoppingList=true; renderShopping(); });
      var delBtn = document.getElementById('btnDeleteList');
      if(delBtn) delBtn.addEventListener('click', function(){
        if(!confirm('Apagar a lista "'+list.name+'" e todos os seus itens?')) return;
        state.shoppingLists = state.shoppingLists.filter(function(l){ return l.id!==list.id; });
        currentShoppingListId = null;
        saveState(); renderShopping();
      });
    }

    var el = document.getElementById('shoppingList');
    el.innerHTML = list.items.length ? list.items.map(function(it){
      return '<div class="today-item'+(it.done?' done':'')+'" data-id="'+it.id+'">' +
        '<span class="today-check'+(it.done?' on':'')+'">'+CHECK_SVG+'</span>' +
        '<div class="today-txt"><div class="tt">'+escHtml(it.text)+'</div></div>' +
        '<span class="del" data-id="'+it.id+'">'+TRASH_SVG+'</span></div>';
    }).join('') : '<p style="color:var(--ink-faint); font-size:13px;">Lista vazia.</p>';

    el.querySelectorAll('.today-item').forEach(function(row){
      row.addEventListener('click', function(ev){
        if(ev.target.closest('.del')) return;
        var it = list.items.find(function(x){ return x.id===row.getAttribute('data-id'); });
        it.done = !it.done;
        saveState(); renderShopping();
      });
    });
    el.querySelectorAll('.del').forEach(function(btn){
      btn.addEventListener('click', function(ev){
        ev.stopPropagation();
        list.items = list.items.filter(function(x){ return x.id!==btn.getAttribute('data-id'); });
        saveState(); renderShopping();
      });
    });
  }
  document.getElementById('shoppingListForm').addEventListener('submit', function(e){
    e.preventDefault();
    var input = document.getElementById('shoppingListNameInput');
    var v = input.value.trim(); if(!v) return;
    var l = { id:'sl'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), name:v, items:[] };
    state.shoppingLists.push(l);
    saveState(); input.value=''; currentShoppingListId=l.id; renderShopping();
  });
  document.getElementById('shoppingForm').addEventListener('submit', function(e){
    e.preventDefault();
    var input = document.getElementById('shoppingInput');
    var v = input.value.trim(); if(!v) return;
    currentShoppingList().items.push({ id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), text:v, done:false });
    saveState(); input.value=''; renderShopping();
  });
  document.getElementById('pendentesForm').addEventListener('submit', function(e){
    e.preventDefault();
    var input = document.getElementById('pendentesInput');
    var dateInput = document.getElementById('pendentesDate');
    var timeInput = document.getElementById('pendentesTime');
    var v = input.value.trim(); if(!v) return;
    state.pendentes.push({
      id:'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), text:v, done:false,
      due: dateInput.value || null, dueTime: timeInput.value || null,
    });
    saveState();
    document.getElementById('pendentesForm').reset();
    renderChecklist('pendentes','pendentesList');
    renderDashPendentes();
  });

  function daysUntil(dateISO){ return Math.round((new Date(dateISO) - new Date(TODAY_ISO)) / 86400000); }
  function dueLabel(days){
    if(days < 0) return 'passou';
    if(days === 0) return 'hoje';
    if(days === 1) return 'amanhã';
    return 'em ' + days + ' dias';
  }
  function sortedAgenda(){
    return state.agenda.slice().sort(function(a,b){
      var pa = a.date<TODAY_ISO ? 1:0, pb = b.date<TODAY_ISO ? 1:0;
      if(pa!==pb) return pa-pb;
      if(a.date!==b.date) return a.date<b.date ? -1 : 1;
      return (a.time||'')<(b.time||'') ? -1 : 1;
    });
  }
  var openAgendaEdit = null;
  function renderAgenda(){
    var list = document.getElementById('agendaList');
    var arr = sortedAgenda();
    list.innerHTML = arr.length ? arr.map(function(ev){
      if(ev.id === openAgendaEdit){
        return '<div class="list-row" data-id="'+ev.id+'" style="display:block;padding:12px 4px;">' +
          '<input data-f="title" value="'+escAttr(ev.title)+'" style="width:100%;margin-bottom:6px;border:1px solid var(--line-strong);border-radius:6px;padding:6px 8px;font-size:13px;">' +
          '<div style="display:flex;gap:6px;margin-bottom:8px;">' +
          '<input data-f="date" type="date" value="'+ev.date+'" style="border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;">' +
          '<input data-f="time" type="time" value="'+escAttr(ev.time||'')+'" style="border:1px solid var(--line-strong);border-radius:6px;padding:5px 7px;font-size:12px;">' +
          '</div>' +
          '<div class="form-actions" style="justify-content:flex-end;"><span style="display:flex;gap:8px;"><button class="btn ghost" data-act="cancel" type="button">Cancelar</button><button class="btn" data-act="save" type="button">Guardar</button></span></div>' +
          '</div>';
      }
      var d = new Date(ev.date+'T00:00:00');
      var isPast = ev.date < TODAY_ISO;
      var days = daysUntil(ev.date);
      return '<div class="list-row'+(isPast?' past':'')+'" data-id="'+ev.id+'"><div class="lr-main"><div class="lr-title">'+escHtml(ev.title)+'</div>' +
        '<div class="lr-sub">'+d.toLocaleDateString('pt-PT',{day:'2-digit',month:'long',year:'numeric'})+(ev.time?' · '+escHtml(ev.time):'')+(!isPast?' · '+dueLabel(days):'')+'</div></div>' +
        '<span class="lr-right"><button class="ar-icon-btn" data-act="edit" data-id="'+ev.id+'" type="button">'+PENCIL_SVG+'</button><span class="del" data-id="'+ev.id+'">'+TRASH_SVG+'</span></span></div>';
    }).join('') : '<div class="list-row" style="color:var(--ink-faint)">Sem eventos agendados.</div>';
    list.querySelectorAll('.del').forEach(function(btn){
      btn.addEventListener('click', function(){
        state.agenda = state.agenda.filter(function(x){ return x.id!==btn.getAttribute('data-id'); });
        saveState(); renderAgenda(); renderDashAgenda();
      });
    });
    list.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        openAgendaEdit = btn.getAttribute('data-id');
        renderAgenda();
      });
    });
    list.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openAgendaEdit=null; renderAgenda(); });
    });
    list.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var row = btn.closest('[data-id]');
        var ev = state.agenda.find(function(x){ return x.id===row.getAttribute('data-id'); });
        var title = row.querySelector('[data-f="title"]').value.trim();
        var date = row.querySelector('[data-f="date"]').value;
        if(title) ev.title = title;
        if(date) ev.date = date;
        ev.time = row.querySelector('[data-f="time"]').value || '';
        saveState();
        openAgendaEdit=null;
        renderAgenda();
        renderDashAgenda();
      });
    });
  }
  document.getElementById('agendaForm').addEventListener('submit', function(e){
    e.preventDefault();
    var date = document.getElementById('agendaDate').value;
    var time = document.getElementById('agendaTime').value;
    var title = document.getElementById('agendaTitle').value.trim();
    if(!date || !title) return;
    state.agenda.push({ id:'ag'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), date:date, time:time||'', title:title });
    saveState();
    document.getElementById('agendaForm').reset();
    renderAgenda();
    renderDashAgenda();
  });

  function renderDashAgenda(){
    var upcoming = sortedAgenda().filter(function(ev){ return ev.date >= TODAY_ISO; }).slice(0, 3);
    var blk = document.getElementById('dashAgendaBlk');
    blk.hidden = upcoming.length === 0;
    if(upcoming.length){
      document.getElementById('dashAgenda').innerHTML = upcoming.map(function(ev){
        var days = daysUntil(ev.date);
        var soon = days <= 3;
        return '<div class="today-item" style="cursor:default;">' +
          '<span class="area-tag" style="background:'+(soon?'var(--accent-soft)':'var(--surface-2)')+'; color:'+(soon?'var(--accent-strong)':'var(--ink-soft)')+'; font-weight:700;">'+dueLabel(days)+'</span>' +
          '<div class="today-txt"><div class="tt">'+escHtml(ev.title)+'</div>'+(ev.time?'<div class="ts">'+escHtml(ev.time)+'</div>':'')+'</div></div>';
      }).join('');
    }
    var soonest = upcoming[0];
    document.querySelector('.tabbtn[data-tab="vida"]').classList.toggle('has-today', !!soonest && daysUntil(soonest.date) <= 3);
  }

  function pendentesDueSoon(){
    return state.pendentes.filter(function(it){
      if(it.done || !it.due) return false;
      var d = pendenteDueDate(it);
      return (d - new Date()) <= 24*3600*1000;
    }).sort(function(a,b){ return pendenteDueDate(a) - pendenteDueDate(b); });
  }
  function renderDashPendentes(){
    var soon = pendentesDueSoon();
    var blk = document.getElementById('dashPendentesBlk');
    blk.hidden = soon.length === 0;
    if(soon.length){
      document.getElementById('dashPendentes').innerHTML = soon.map(function(it){
        var d = pendenteDueDate(it);
        var late = (d - new Date()) < 0;
        return '<div class="today-item" style="cursor:default;">' +
          '<span class="area-tag" style="background:'+(late?'var(--bad-soft, var(--accent-soft))':'var(--accent-soft)')+'; color:'+(late?'var(--bad)':'var(--accent-strong)')+'; font-weight:700;">'+dueHoursLabel(d)+'</span>' +
          '<div class="today-txt"><div class="tt">'+escHtml(it.text)+'</div><div class="ts">'+formatDueFull(it)+'</div></div></div>';
      }).join('');
    }
  }

  /* ---- sistema genérico de notas (título + texto) — reutilizado em vários sítios ---- */
  var openNoteEditId = {};
  function notesRowView(note){
    return '<div class="plano-card" data-id="'+note.id+'">' +
      '<div class="pl-top"><h3>'+escHtml(note.title)+'</h3>' +
      '<div class="pl-actions"><button class="ar-icon-btn" data-act="edit" type="button">'+PENCIL_SVG+'</button><button class="ar-icon-btn danger" data-act="del" type="button">'+TRASH_SVG+'</button></div></div>' +
      (note.body ? '<p>'+escHtml(note.body)+'</p>' : '') + '</div>';
  }
  function notesRowEdit(note){
    return '<div class="plano-card plano-edit" data-id="'+note.id+'">' +
      '<input data-f="title" type="text" placeholder="Título" value="'+escAttr(note.title)+'">' +
      '<textarea data-f="body" placeholder="Notas…">'+escHtml(note.body)+'</textarea>' +
      '<div class="form-actions"><button class="btn ghost" data-act="cancel" type="button">Cancelar</button><button class="btn" data-act="save" type="button">Guardar</button></div></div>';
  }
  function renderNotesGroup(arr, containerId){
    var list = document.getElementById(containerId);
    if(!list) return;
    if(!arr.length){
      list.innerHTML = '<p style="color:var(--ink-faint); font-size:13px; padding:8px 0;">Nada aqui ainda — toca no + para criar.</p>';
      return;
    }
    var openId = openNoteEditId[containerId];
    list.innerHTML = arr.map(function(n){ return n.id===openId ? notesRowEdit(n) : notesRowView(n); }).join('');

    list.querySelectorAll('[data-act="edit"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openNoteEditId[containerId] = btn.closest('.plano-card').getAttribute('data-id'); renderNotesGroup(arr, containerId); });
    });
    list.querySelectorAll('[data-act="del"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(!confirm('Apagar isto?')) return;
        var id = btn.closest('.plano-card').getAttribute('data-id');
        var idx = arr.findIndex(function(n){ return n.id===id; });
        if(idx>=0) arr.splice(idx,1);
        saveState(); renderNotesGroup(arr, containerId);
      });
    });
    list.querySelectorAll('[data-act="cancel"]').forEach(function(btn){
      btn.addEventListener('click', function(){ openNoteEditId[containerId]=null; renderNotesGroup(arr, containerId); });
    });
    list.querySelectorAll('[data-act="save"]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('.plano-edit');
        var id = card.getAttribute('data-id');
        var n = arr.find(function(x){ return x.id===id; });
        n.title = card.querySelector('[data-f="title"]').value.trim() || 'Sem título';
        n.body = card.querySelector('[data-f="body"]').value.trim();
        saveState(); openNoteEditId[containerId]=null; renderNotesGroup(arr, containerId);
      });
    });
  }
  function addNoteToGroup(arr, containerId, defaultTitle){
    var n = { id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), title: defaultTitle||'Novo', body:'' };
    arr.push(n);
    saveState();
    openNoteEditId[containerId] = n.id;
    renderNotesGroup(arr, containerId);
  }
  document.getElementById('btnAddPlano').addEventListener('click', function(){ addNoteToGroup(state.planos, 'planosList', 'Novo plano'); });

  function renderVida(){
    renderFinance();
    renderShopping();
    renderChecklist('pendentes', 'pendentesList');
    renderAgenda();
    renderNotesGroup(state.planos, 'planosList');
    renderVidaHub();
  }

  /* ---- Vida: hub + navegação por ecrã (evita scroll infinito com tudo junto) ---- */
  var vidaScreen = 'hub';
  var HUB_ICONS = {
    financas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2.5"></circle></svg>',
    compras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"></path><path d="M6 6 5 2H2"></path><circle cx="9" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg>',
    agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2"></rect><path d="M3 9.5h18M8 2.5v4M16 2.5v4"></path></svg>',
    pendentes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11"></path></svg>',
    planos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"></path><path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>',
  };
  function renderVidaHub(){
    var mk = TODAY_ISO.slice(0,7);
    var monthTx = state.finance.filter(function(t){ return t.date.slice(0,7)===mk; });
    var totalIn = monthTx.filter(function(t){ return t.type==='entrada'; }).reduce(function(s,t){ return s+t.amount; },0);
    var totalOut = monthTx.filter(function(t){ return t.type==='saida'; }).reduce(function(s,t){ return s+t.amount; },0);
    var saldo = totalIn - totalOut;

    var pendingShopping = state.shoppingLists.reduce(function(s,l){ return s + l.items.filter(function(it){ return !it.done; }).length; }, 0);

    var upcoming = sortedAgenda().filter(function(ev){ return ev.date >= TODAY_ISO; })[0];

    var pendentesOpen = state.pendentes.filter(function(p){ return !p.done; }).length;

    var planosCount = state.planos.length;
    var planosSub = planosCount ? (state.planos[0].title + (planosCount>1 ? ' + ' + (planosCount-1) : '')) : 'Nenhum ainda';

    var cards = [
      { key:'financas', label:'Finanças', sum:'Saldo do mês', val:fmtMT(saldo), valColor: saldo>=0?'var(--good)':'var(--bad)' },
      { key:'compras', label:'Compras', sum: state.shoppingLists.length + ' lista'+(state.shoppingLists.length===1?'':'s'), count: pendingShopping },
      { key:'agenda', label:'Agenda', sum: upcoming ? upcoming.title : 'Sem eventos', val: upcoming ? dueLabel(daysUntil(upcoming.date)) : '', valColor:'var(--accent-strong)' },
      { key:'pendentes', label:'Pendentes', sum:'Fora da rotina diária', count: pendentesOpen },
      { key:'planos', label:'Planos futuros', sum: planosSub },
    ];

    document.getElementById('vidaHubCards').innerHTML = cards.map(function(c){
      var right = c.count !== undefined
        ? (c.count > 0 ? '<span class="hcount">'+c.count+'</span>' : '')
        : (c.val ? '<span class="hval" style="color:'+(c.valColor||'var(--ink)')+'">'+c.val+'</span>' : '');
      return '<button class="hcard" data-vida-go="'+c.key+'" type="button">' +
        '<span class="hicn '+c.key+'">'+HUB_ICONS[c.key]+'</span>' +
        '<span class="hbody"><span class="hname">'+c.label+'</span><span class="hsum">'+escHtml(c.sum)+'</span></span>' +
        right +
        '<span class="hchev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg></span>' +
        '</button>';
    }).join('');

    document.querySelectorAll('#vidaHubCards [data-vida-go]').forEach(function(btn){
      btn.addEventListener('click', function(){ goVida(btn.getAttribute('data-vida-go')); });
    });

    var vidaBtn = document.querySelector('.tabbtn[data-tab="vida"]');
    if(vidaBtn) vidaBtn.classList.toggle('has-today', (pendingShopping+pendentesOpen)>0 || (!!upcoming && daysUntil(upcoming.date)<=3));
  }
  function goVida(screen){
    vidaScreen = screen;
    document.querySelectorAll('#view-vida .subview').forEach(function(el){
      el.classList.toggle('active', el.id === (screen==='hub' ? 'vida-hub' : 'vida-'+screen));
    });
    document.getElementById('view-vida').scrollTop = 0;
    window.scrollTo({ top:0, behavior:'instant' in window ? 'instant':'auto' });
  }
  document.querySelectorAll('#view-vida [data-vida-back]').forEach(function(btn){
    btn.addEventListener('click', function(){ goVida('hub'); });
  });
  // ao voltar à aba Vida a partir de outra aba, mostra sempre o hub primeiro
  document.querySelector('.tabbtn[data-tab="vida"]').addEventListener('click', function(){ goVida('hub'); });

  /* ================= DASHBOARD ================= */
  function renderDashboard(){
    document.getElementById('dashDate').textContent = TODAY.toLocaleDateString('pt-PT',{ weekday:'long', day:'numeric', month:'long' });
    document.getElementById('streakLang').textContent = computeStreak(state.langDone);
    document.getElementById('streakFit').textContent = computeStreak(state.workouts);

    var dayType = DAY_TYPE[TODAY_WEEKDAY];
    var badge = document.getElementById('daytypeBadge');
    badge.textContent = DAY_TYPE_LABEL[dayType] || '—';
    badge.className = 'daytype-badge ' + dayType;
    document.getElementById('hojeTitle').textContent = TODAY_WEEKDAY + ' — marca o que fizeste';

    var acts = dayActivities(TODAY_WEEKDAY);
    document.getElementById('todayList').innerHTML = acts.length ? acts.map(function(act){
      var area = AREAS[act.area] || AREAS.outro;
      var done = isActDone(TODAY_ISO, act.id);
      var sub = escHtml([act.time, act.detail].filter(Boolean).join(' · '));
      return '<div class="today-item'+(done?' done':'')+'" data-act="'+act.id+'">' +
        '<span class="today-check'+(done?' on':'')+'">'+CHECK_SVG+'</span>' +
        '<div class="today-txt"><div class="tt">'+escHtml(act.title)+'</div>' +
        '<div class="ts"><span class="area-tag"><span class="area-dot" style="background:'+area.color+'"></span>'+area.label+'</span>'+(sub?'<span>'+sub+'</span>':'')+'</div></div>' +
        '</div>';
    }).join('') : '<p style="color:var(--ink-faint); font-size:13px;">Sem atividades para hoje — toca no lápis para adicionar.</p>';

    document.querySelectorAll('#todayList .today-item').forEach(function(el){
      el.addEventListener('click', function(){
        var actId = el.getAttribute('data-act');
        toggleActivityDone(TODAY_ISO, TODAY_WEEKDAY, actId);
        renderDashboard();
        renderVocabProgress();
        renderTrainProgress();
        var box = document.querySelector('.done-check[data-date="'+TODAY_ISO+'"][data-act="'+actId+'"]');
        if(box) box.classList.toggle('on', isActDone(TODAY_ISO, actId));
      });
    });

    renderProtocolo();
    renderVocabProgress();
    renderTrainProgress();
    renderWeightAll();
    renderDashAgenda();
    renderDashPendentes();
    updateTabDots();
  }

  function updateTabDots(){
    var langBtn = document.querySelector('.tabbtn[data-tab="linguas"]');
    var fitBtn = document.querySelector('.tabbtn[data-tab="forma"]');
    langBtn.classList.toggle('has-today', !state.langDone[TODAY_ISO]);
    fitBtn.classList.toggle('has-today', !state.workouts[TODAY_ISO]);
  }

  /* ---------------- helpers ---------------- */
  function stat(k,v,hl,hl2){
    return '<div class="stat'+(hl?' hl':'')+'"><div class="k">'+k+'</div><div class="v mono">'+v+'</div></div>';
  }
  var RING_C = 2*Math.PI*15.5;
  function setRing(id, pct){
    var el = document.getElementById(id);
    if(!el) return;
    pct = Math.max(0, Math.min(1, pct));
    el.setAttribute('stroke-dasharray', RING_C.toFixed(1));
    el.setAttribute('stroke-dashoffset', (RING_C*(1-pct)).toFixed(1));
  }

  /* ---------------- sheets (definições + editor de atividades) ---------------- */
  var settingsSheet = document.getElementById('settingsSheet');
  var activitySheet = document.getElementById('activitySheet');
  var backdrop = document.getElementById('sheetBackdrop');
  var currentSheet = null;
  function openSheet(el){ currentSheet = el; el.classList.add('open'); backdrop.classList.add('open'); }
  function closeSheet(){ if(currentSheet) currentSheet.classList.remove('open'); backdrop.classList.remove('open'); currentSheet=null; }
  document.getElementById('btnSettings').addEventListener('click', function(){ openSheet(settingsSheet); });
  document.getElementById('btnCloseSheet').addEventListener('click', closeSheet);
  document.getElementById('btnCloseActivitySheet').addEventListener('click', closeSheet);
  backdrop.addEventListener('click', closeSheet);

  function applyTheme(t){
    var root = document.documentElement;
    if(t==='light' || t==='dark') root.setAttribute('data-theme', t);
    else root.removeAttribute('data-theme');
    document.querySelectorAll('#themeSeg button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-theme')===t);
    });
  }
  document.querySelectorAll('#themeSeg button').forEach(function(b){
    b.addEventListener('click', function(){
      state.theme = b.getAttribute('data-theme');
      saveState();
      applyTheme(state.theme);
    });
  });

  document.getElementById('btnExport').addEventListener('click', function(){
    var blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'protocolo-backup-' + TODAY_ISO + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('Backup exportado');
  });

  document.getElementById('importFile').addEventListener('change', function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var data = JSON.parse(reader.result);
        state = Object.assign(freshDefaultState(), data);
        saveState();
        applyTheme(state.theme);
        renderAll();
        toast('Dados importados');
        closeSheet();
      }catch(err){ toast('Ficheiro inválido'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('btnReset').addEventListener('click', function(){
    if(!confirm('Apagar todo o progresso guardado neste aparelho? Esta ação não pode ser desfeita.')) return;
    state = freshDefaultState();
    saveState();
    applyTheme(state.theme);
    renderAll();
    toast('Progresso reposto');
    closeSheet();
  });

  /* ---------------- boot ---------------- */
  function renderAll(){
    applyTabLabels();
    renderTabNameInputs();
    renderLangStatic();
    renderFitStatic();
    renderWorkStatic();
    renderVida();
    renderDashboard();
  }
  applyTheme(state.theme);
  renderAll();

  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){});
    });
  }
})();
