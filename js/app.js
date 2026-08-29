(function(){
  'use strict';

  /* ---------------- storage ---------------- */
  var STORE_KEY = 'protocolo:v1:state';
  var DEFAULT_STATE = { vocab:{}, langDone:{}, workouts:{}, weight:[], theme:'system' };

  function loadState(){
    try{
      var raw = localStorage.getItem(STORE_KEY);
      if(!raw) return clone(DEFAULT_STATE);
      var parsed = JSON.parse(raw);
      return Object.assign(clone(DEFAULT_STATE), parsed);
    }catch(e){ return clone(DEFAULT_STATE); }
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
      var checkbox = t.tag !== 'rest'
        ? '<span class="done-check" data-date="'+dISO+'" data-kind="train">'+CHECK_SVG+'</span>'
        : '<span class="done-check" data-date="'+dISO+'" data-kind="train" style="opacity:.55">'+CHECK_SVG+'</span>';
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
    document.querySelectorAll('.done-check[data-kind="train"]').forEach(function(el){
      var d = el.getAttribute('data-date');
      el.classList.toggle('on', !!state.workouts[d]);
      el.addEventListener('click', function(){
        state.workouts[d] = !state.workouts[d];
        el.classList.toggle('on', state.workouts[d]);
        saveState();
        renderTrainProgress();
        renderDashboard();
      });
    });
    renderTrainProgress();
  }

  function trackableDatesThisWeek(){
    var wd = weekDates(TODAY);
    return FIT_TRAINING.map(function(t,i){ return {date:iso(wd[i]), tag:t.tag}; }).filter(function(x){ return x.tag!=='rest'; });
  }

  function renderTrainProgress(){
    var dates = trackableDatesThisWeek();
    var done = dates.filter(function(x){ return state.workouts[x.date]; }).length;
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

  /* ================= DASHBOARD ================= */
  var QUOTES = [
    'Nunca estudes uma palavra isolada — cria sempre 2-3 frases tuas, sobre a tua vida real.',
    'Água, sono e consistência valem mais do que qualquer truque de última hora.',
    'B1 funcional em 3 meses é um objetivo esticado mas realista — se precisares de mais tempo, não é falhar.',
    'A balança manda: ajusta as porções pelo que vês a cada 2 semanas, não pela fórmula.',
    'Fala com pessoas reais, não só contigo mesmo — é isso que treina reagir em tempo real.',
    'Grelhado ou cozido em vez de frito: o óleo soma calorias sem encher mais.',
  ];
  function dayOfYear(d){ var start=new Date(d.getFullYear(),0,0); return Math.floor((d-start)/86400000); }

  function renderDashboard(){
    document.getElementById('dashDate').textContent = TODAY.toLocaleDateString('pt-PT',{ weekday:'long', day:'numeric', month:'long' });
    document.getElementById('streakLang').textContent = computeStreak(state.langDone);
    document.getElementById('streakFit').textContent = computeStreak(state.workouts);
    document.getElementById('quoteText').textContent = QUOTES[dayOfYear(TODAY) % QUOTES.length];

    var isSessionA = ['Segunda','Quarta','Sexta'].indexOf(TODAY_WEEKDAY) >= 0;
    var langLabel = isSessionA ? 'Anki + gramática (30 min)' : 'Vocabulário + escrita + listening + speaking (1h)';
    var fitEntry = FIT_TRAINING.find(function(t){ return t.day === TODAY_WEEKDAY; });
    var fitLabel = fitEntry ? (fitEntry.tag==='rest' ? 'Descanso ativo — caminhada 30–45min' : fitEntry.label + ' · ' + fitEntry.time) : '—';

    var items = [
      { key:'lang', title:'Sessão de línguas', sub:langLabel, done: !!state.langDone[TODAY_ISO] },
      { key:'fit', title:'Treino / forma', sub:fitLabel, done: !!state.workouts[TODAY_ISO] },
    ];
    document.getElementById('todayList').innerHTML = items.map(function(it){
      return '<div class="today-item'+(it.done?' done':'')+'" data-key="'+it.key+'">' +
        '<span class="today-check'+(it.done?' on':'')+'">'+CHECK_SVG+'</span>' +
        '<div class="today-txt"><div class="tt">'+it.title+'</div><div class="ts">'+it.sub+'</div></div>' +
        '</div>';
    }).join('');
    document.querySelectorAll('#todayList .today-item').forEach(function(el){
      el.addEventListener('click', function(){
        var key = el.getAttribute('data-key');
        if(key==='lang'){ state.langDone[TODAY_ISO] = !state.langDone[TODAY_ISO]; }
        else { state.workouts[TODAY_ISO] = !state.workouts[TODAY_ISO]; }
        saveState();
        renderDashboard();
        renderVocabProgress();
        renderTrainProgress();
        // keep training table checkbox in sync
        var box = document.querySelector('.done-check[data-date="'+TODAY_ISO+'"][data-kind="train"]');
        if(box) box.classList.toggle('on', !!state.workouts[TODAY_ISO]);
      });
    });

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

  /* ---------------- settings sheet ---------------- */
  var sheet = document.getElementById('settingsSheet');
  var backdrop = document.getElementById('sheetBackdrop');
  function openSheet(){ sheet.classList.add('open'); backdrop.classList.add('open'); }
  function closeSheet(){ sheet.classList.remove('open'); backdrop.classList.remove('open'); }
  document.getElementById('btnSettings').addEventListener('click', openSheet);
  document.getElementById('btnCloseSheet').addEventListener('click', closeSheet);
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
        state = Object.assign(clone(DEFAULT_STATE), data);
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
    state = clone(DEFAULT_STATE);
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
