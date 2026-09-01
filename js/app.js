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
    };
  }

  function loadState(){
    try{
      var raw = localStorage.getItem(STORE_KEY);
      if(!raw) return freshDefaultState();
      var parsed = JSON.parse(raw);
      return Object.assign(freshDefaultState(), parsed);
    }catch(e){ return freshDefaultState(); }
  }
  function saveState(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  var state = loadState();

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
  var views = { inicio:'view-inicio', linguas:'view-linguas', forma:'view-forma' };
  var titles = { inicio:'Início', linguas:'Rota para B1', forma:'Judo & Forma' };
  function goTab(tab){
    Object.keys(views).forEach(function(k){
      document.getElementById(views[k]).classList.toggle('active', k===tab);
    });
    document.querySelectorAll('.tabbtn').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-tab')===tab);
    });
    document.getElementById('pageTitle').textContent = titles[tab];
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant':'auto'});
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
  var allVocabKeys = [];
  LANG_MONTHS.forEach(function(m){ m.weeks.forEach(function(w){ w.vocab.forEach(function(v){ allVocabKeys.push(v.k); }); }); });

  function renderLangStatic(){
    document.getElementById('langEyebrow').textContent = LANG_META.eyebrow;
    document.getElementById('langSub').textContent = LANG_META.sub;
    document.getElementById('langStats').innerHTML =
      stat('Duração', LANG_META.weeks + ' sem') +
      stat('Estudo ativo', LANG_META.hoursActive) +
      stat('Total 13 sem', LANG_META.hoursTotal, true) +
      stat('Meta', 'B1 funcional');

    document.getElementById('langRoutine').innerHTML = LANG_ROUTINE.map(function(r){
      return '<div class="sched-card '+r.id+'">' +
        '<div class="sched-head"><div class="days">'+r.days+'</div><div class="time">'+r.time+'</div></div>' +
        '<div class="sched-body">' + r.items.map(function(it){
          return '<div class="sched-item"><span class="t">'+it.t+'</span><span class="d">'+it.d+'</span></div>';
        }).join('') + '</div></div>';
    }).join('');

    document.getElementById('langMonths').innerHTML = LANG_MONTHS.map(function(m){
      return '<section class="blk month-block '+m.id+'" id="lg-'+m.id+'">' +
        '<div class="month-head"><h3>'+m.title+'</h3><span class="m-sub">'+m.sub+'</span></div>' +
        '<div class="week-list">' + m.weeks.map(renderWeek).join('') + '</div>' +
        '</section>';
    }).join('');

    document.getElementById('langResources').innerHTML = LANG_RESOURCES.map(function(r){
      return '<div class="res-card"><div class="res-top"><h4>'+r.name+'</h4><span class="badge '+r.badgeType+'">'+r.badge+'</span></div><p>'+r.desc+'</p></div>';
    }).join('');

    document.getElementById('langSources').innerHTML = LANG_SOURCES.map(function(s){ return '<li>'+s+'</li>'; }).join('');

    bindVocabHandlers();
  }

  function renderWeek(w){
    var gram = w.grammar.map(function(g){
      if(typeof g === 'string') return '<span class="pill">'+g+'</span>';
      return '<span class="pill new">'+g.text+'</span>';
    }).join('');
    var vocab = w.vocab.map(function(v){
      return '<li><label><input type="checkbox" data-k="'+v.k+'"><span>'+v.label+'</span></label></li>';
    }).join('');
    var milestone = w.milestone ? ('<div class="milestone"><span class="m-tag">'+w.milestone.tag+'</span>' + w.milestone.html + '</div>') : '';
    return '<div class="week-card"><div class="week-num">Sem<b>'+w.num+'</b></div><div class="week-body">' +
      (gram ? '<div class="g-line"><span class="lab">Foco</span>'+gram+'</div>' : '') +
      (vocab ? '<ul class="vocab-list">'+vocab+'</ul>' : '') +
      milestone + '</div></div>';
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
    var total = allVocabKeys.length;
    var done = allVocabKeys.filter(function(k){ return state.vocab[k]; }).length;
    document.getElementById('vocabChip').textContent = done + '/' + total + ' vocab';
    var pct = total ? done/total : 0;
    setRing('ringLang', pct);
    document.getElementById('langSummary').textContent = Math.round(pct*100) + '% do vocabulário';
    return { done:total, pct:pct };
  }

  /* ================= FORMA ================= */
  function renderFitStatic(){
    document.getElementById('fitStats').innerHTML =
      stat('Idade', FIT_META.age + ' anos') +
      stat('Altura', FIT_META.heightCm + ' cm') +
      stat('Treinos/sem', '5', false, true) +
      stat('Meta', '−'+FIT_META.goalRate+' kg/sem', true);

    var weekdaysThisWeek = weekDates(TODAY);
    document.getElementById('fitTraining').innerHTML = FIT_TRAINING.map(function(t, i){
      var d = weekdaysThisWeek[i];
      var dISO = iso(d);
      var isToday = dISO === TODAY_ISO;
      var act = fitnessActivityForDay(t.day);
      var checkbox = act
        ? '<span class="done-check" data-date="'+dISO+'" data-day="'+t.day+'" data-act="'+act.id+'"'+(t.tag==='rest'?' style="opacity:.55"':'')+'>'+CHECK_SVG+'</span>'
        : '';
      return '<tr'+(isToday?' class="today"':'')+'>' +
        '<td>'+checkbox+'</td>' +
        '<td class="day">'+t.day+'</td>' +
        '<td class="time mono">'+t.time+'</td>' +
        '<td><span class="tag '+t.tag+'">'+t.label+'</span></td>' +
        '<td style="color:var(--ink-soft);font-size:12.5px;">'+t.focus+'</td>' +
        '</tr>';
    }).join('');

    document.getElementById('fitProtocols').innerHTML = FIT_PROTOCOLS.map(function(p){
      return '<div class="proto"><h3>'+p.title+'</h3><p>'+p.text+'</p></div>';
    }).join('');

    var mealOrder = ['judo','tiros','rest'];
    document.getElementById('fitMeals').innerHTML = mealOrder.map(function(key){
      var m = FIT_MEALS[key];
      var isTodayGroup = mealMatchesToday(key);
      var rows = m.rows.map(function(r){
        return '<tr><td class="mtime">'+r.time+'</td><td class="mname">'+r.name+'</td><td>'+r.desc+(r.note?'<span class="note">'+r.note+'</span>':'')+'</td></tr>';
      }).join('');
      return '<details class="mealcard '+m.tag+'"'+(isTodayGroup?' open':'')+'>' +
        '<summary><div class="head"><h3>'+m.label+(isTodayGroup?' · hoje':'')+'</h3><span class="days">'+m.days+'</span></div></summary>' +
        '<table>'+rows+'</table></details>';
    }).join('');

    document.getElementById('fitRules').innerHTML = FIT_RULES.map(function(r){
      return '<div class="rule"><div class="k">'+r.k+'</div><p class="v">'+r.v+'</p></div>';
    }).join('');

    document.getElementById('foodsBase').innerHTML = FIT_FOODS.base.map(function(f){ return '<li>'+f+'</li>'; }).join('');
    document.getElementById('foodsExtra').innerHTML = FIT_FOODS.extra.map(function(f){ return '<li>'+f+'</li>'; }).join('');

    bindTrainHandlers();
    bindWeightForm();
  }

  function mealMatchesToday(key){
    var isWeekend = TODAY_WEEKDAY === 'Sábado' || TODAY_WEEKDAY === 'Domingo';
    var entry = FIT_TRAINING.find(function(t){ return t.day === TODAY_WEEKDAY; });
    if(key === 'rest') return isWeekend;
    if(!entry) return false;
    return entry.tag === key;
  }

  function bindTrainHandlers(){
    document.querySelectorAll('.done-check[data-act]').forEach(function(el){
      var d = el.getAttribute('data-date');
      var day = el.getAttribute('data-day');
      var actId = el.getAttribute('data-act');
      el.classList.toggle('on', isActDone(d, actId));
      el.addEventListener('click', function(){
        toggleActivityDone(d, day, actId);
        el.classList.toggle('on', isActDone(d, actId));
        renderTrainProgress();
        renderDashboard();
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

  function bindWeightForm(){
    var form = document.getElementById('weightForm');
    var input = document.getElementById('weightInput');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = parseFloat(input.value);
      if(!v || v<30 || v>300) return;
      addWeight(Math.round(v*10)/10);
      input.value='';
    });
    renderWeightAll();
  }

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
        '<div class="ar-title">'+act.title+(act.time?' <span class="mono" style="color:var(--ink-faint);font-weight:500;font-size:11.5px;">· '+act.time+'</span>':'')+'</div>' +
        (act.detail ? '<div class="ar-detail">'+act.detail+'</div>' : '') +
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
        return '<span class="meta-chip"><span class="ml">'+m.label+'</span><span class="mv">'+m.value+'</span></span>';
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
      var sub = [act.time, act.detail].filter(Boolean).join(' · ');
      return '<div class="today-item'+(done?' done':'')+'" data-act="'+act.id+'">' +
        '<span class="today-check'+(done?' on':'')+'">'+CHECK_SVG+'</span>' +
        '<div class="today-txt"><div class="tt">'+act.title+'</div>' +
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
    renderLangStatic();
    renderFitStatic();
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
