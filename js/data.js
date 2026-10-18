/* Conteúdo estático dos dois planos. Sem lógica aqui — só dados. */

const LANG_META = {
  title: 'Rota para B1',
  eyebrow: 'Plano · 3 meses · A2 → B1',
  sub: 'A mesma rotina que já tens na agenda — conteúdo reordenado com base em Cambridge English, British Council e investigação em aquisição de línguas.',
  weeks: 13,
  hoursActive: '5h30/semana',
  hoursTotal: '71,5h em 13 semanas',
};

const LANG_ROUTINE = [
  {
    id: 'a',
    days: 'Segunda · Quarta · Sexta',
    time: '14h00 – 14h30 · 30 min',
    items: [
      { t: '10 min', d: 'Anki — revisão dos cards agendados para hoje' },
      { t: '20 min', d: 'Gramática do dia — explicação curta + exercícios' },
    ],
  },
  {
    id: 'b',
    days: 'Terça · Quinta · Sábado · Domingo',
    time: '18h00 – 19h00 · 1h',
    items: [
      { t: '10 min', d: 'Vocabulário do dia — reler + criar 2-3 frases novas' },
      { t: '20 min', d: 'Prática escrita ligada à tua vida (negócio, família, dia a dia)' },
      { t: '15 min', d: 'Listening — vídeo ou podcast curto (A2/B1)' },
      { t: '15 min', d: 'Speaking — shadowing ou (a partir do mês 3) conversa real' },
    ],
  },
];

const LANG_MONTHS = [
  {
    id: 'mes1',
    title: 'Mês 1',
    sub: 'Consolidar A2',
    weeks: [
      {
        num: 1,
        grammar: ['Present simple', 'Present continuous', 'There is/are', 'Imperatives'],
        vocab: [
          { k: 'w1-1', label: 'Personalidade e sentimentos' },
          { k: 'w1-2', label: 'Educação e emprego' },
        ],
      },
      {
        num: 2,
        grammar: ["Past simple", "Modals: can/can't/do/doesn't", 'Comparatives & superlatives'],
        vocab: [
          { k: 'w2-1', label: 'Tempo (meteorologia)' },
          { k: 'w2-2', label: 'Tempos livres' },
        ],
      },
      {
        num: 3,
        grammar: ['Present perfect simple', 'Preposições de tempo/lugar', 'Future: will vs going to'],
        vocab: [
          { k: 'w3-1', label: 'Lugares na cidade' },
          { k: 'w3-2', label: 'Corpo e saúde' },
        ],
      },
      {
        num: 4,
        grammar: ['Past continuous', 'Adverbs of frequency', 'Like + ing', { text: 'Introdução B1: Present perfect continuous', novo: true }],
        vocab: [
          { k: 'w4-1', label: 'Transporte e viagens' },
          { k: 'w4-2', label: 'Revisão geral do vocabulário do Mês 1' },
        ],
        milestone: {
          tag: 'Checkpoint · domingo da semana 4',
          html: 'Escreve um texto de 150 palavras sobre "A minha rotina e o meu trabalho", usando o máximo de gramática e vocabulário destas 4 semanas. Guarda-o — é a tua linha de base para comparar com o texto final da semana 13.',
        },
      },
    ],
  },
  {
    id: 'mes2',
    title: 'Mês 2',
    sub: 'Núcleo do B1',
    weeks: [
      {
        num: 5,
        grammar: ['Adverbs: time/degree/manner', 'Present continuous (futuro)', 'Modals: should have / might have'],
        vocab: [
          { k: 'w5-1', label: 'Sentimentos e emoções' },
          { k: 'w5-2', label: 'Viagens e transporte' },
        ],
      },
      {
        num: 6,
        grammar: ['Used to', 'Present perfect simple (aprofundar)', 'Past continuous (aprofundar)'],
        vocab: [
          { k: 'w6-1', label: 'Entretenimento' },
          { k: 'w6-2', label: 'Atividades de lazer' },
        ],
      },
      {
        num: 7,
        grammar: ['Past perfect simple', 'Present perfect continuous', { text: 'Novo: orações relativas (defining)', novo: true }],
        vocab: [
          { k: 'w7-1', label: 'Desporto, saúde e fitness' },
          { k: 'w7-2', label: 'Educação' },
        ],
      },
      {
        num: 8,
        grammar: ['Conditionals: 1st & 2nd', 'Future continuous', { text: 'Novo: voz passiva (presente/passado simples)', novo: true }],
        vocab: [
          { k: 'w8-1', label: 'Notícias e media' },
          { k: 'w8-2', label: 'Tecnologia' },
        ],
      },
    ],
  },
  {
    id: 'mes3',
    title: 'Mês 3',
    sub: 'Fechar o B1 a sério',
    weeks: [
      {
        num: 9,
        grammar: [{ text: 'Novo: discurso indireto (afirmações/perguntas)', novo: true }, 'Multi-word verbs comuns'],
        vocab: [
          { k: 'w9-1', label: 'Expressões de tempo (passado/futuro)' },
          { k: 'w9-2', label: 'Trabalho e educação' },
        ],
      },
      {
        num: 10,
        grammar: ['Revisão em contexto: condicionais + passiva + discurso indireto juntos, em emails/textos do negócio'],
        vocab: [
          { k: 'w10-1', label: 'Estilos de vida' },
          { k: 'w10-2', label: 'Dinheiro' },
        ],
      },
      {
        num: 11,
        grammar: ['Linking expressions', 'O trio que mais confunde: present perfect vs past simple vs past perfect'],
        vocab: [
          { k: 'w11-1', label: 'Tecnologia (aprofundar)' },
          { k: 'w11-2', label: 'Media e comunicação' },
        ],
      },
      {
        num: 12,
        grammar: ['Revisão intensiva de tudo', { text: '2 conversas reais esta semana (Tandem/HelloTalk)', novo: true }],
        vocab: [{ k: 'w12-1', label: 'Questões globais (só vocabulário, sem gramática nova)' }],
      },
      {
        num: 13,
        grammar: ['Consolidação total'],
        vocab: [],
        milestone: {
          tag: 'Mock test B1 final',
          html: '<ol><li><strong>Reading:</strong> lê um artigo curto de nível B1 e responde a 5 perguntas tuas sobre ele.</li><li><strong>Listening:</strong> vídeo/podcast de 5 min, escreve um resumo.</li><li><strong>Writing:</strong> email informal de 120–150 palavras.</li><li><strong>Speaking:</strong> grava-te 3 min a falar sobre "planos para os próximos 6 meses".</li></ol><p>Compara com a semana 4 — é aí que vês a diferença a olho nu.</p>',
        },
      },
    ],
  },
];

const LANG_RESOURCES = [
  { name: 'BBC Learning English', badge: 'Oficial', badgeType: 'official', desc: '"6 Minute English" — a melhor opção gratuita para listening B1/B2 com transcrição.' },
  { name: 'British Council · LearnEnglish', badge: 'Oficial', badgeType: 'official', desc: 'Textos de reading e gramática organizados por nível CEFR.' },
  { name: 'Cambridge Write & Improve', badge: 'Oficial', badgeType: 'official', desc: 'Corrige os teus textos automaticamente e dá o nível estimado.' },
  { name: 'Tandem / HelloTalk', badge: 'Grátis', badgeType: 'new', desc: 'Troca de idiomas com falantes nativos — pratica speaking com outra pessoa.' },
];

const LANG_SOURCES = [
  'Cambridge English — Guided learning hours (horas necessárias entre níveis CEFR)',
  'Cambridge English Blog — How Long Does It Take To Learn A Language?',
  'British Council LearnEnglish — Understand your English level',
  'British Council — Best free English learning resources',
  'Test-English — Table of grammar contents, B1',
  'Comprehensible Output (Swain) & Input Hypothesis (Krashen)',
];

/* ---------------- Fitness / emagrecimento ---------------- */

const FIT_META = {
  title: 'Judo, Tiros e Emagrecimento',
  eyebrow: 'Plano pessoal de treino e alimentação',
  age: 19,
  heightCm: 175,
  startWeight: 100,
  goalRate: 1, // kg/semana
  bowlMl: 450,
};

const FIT_TRAINING = [
  { day: 'Segunda', time: '15h30', tag: 'judo', label: 'Judo técnico', focus: 'Kuzushi → tsukuri → kake em 2 golpes escolhidos, sem pressão de combate — foco na forma' },
  { day: 'Terça', time: '18h', tag: 'tiros', label: 'Tiros na areia', focus: '6–10 tiros de 15–30m a 100%, descanso de 1–2min a caminhar entre tiros' },
  { day: 'Quarta', time: '15h30', tag: 'judo', label: 'Judo combate', focus: 'Treino explosivo, com carga e luta de pegas' },
  { day: 'Quinta', time: '18h', tag: 'tiros', label: 'Tiros na areia', focus: '6–10 tiros de 15–30m a 100%, descanso de 1–2min a caminhar entre tiros' },
  { day: 'Sexta', time: '15h', tag: 'judo', label: 'Judo randori', focus: 'Randori a 100%, sem hesitação' },
  { day: 'Sábado', time: '—', tag: 'rest', label: 'Descanso ativo', focus: 'Caminhada de 30–45min, sem barra, 7–8h de sono' },
  { day: 'Domingo', time: '—', tag: 'rest', label: 'Descanso ativo', focus: 'Caminhada de 30–45min, sem barra, 7–8h de sono' },
];

const FIT_PROTOCOLS = [
  { title: 'Aquecimento judo (seg / qua / sex)', text: 'Mobilidade de pescoço, ombros, quadril, mãos e pernas/panturrilhas. Ukemi (quedas). Uchikomi com elástico 3×15 por técnica do dia. Depois: 2 técnicas em pé (3×10 cada) + 4 técnicas no chão.' },
  { title: 'Protocolo tiros (ter / qui)', text: '10min de mobilidade de tornozelos e joelhos + trote leve na areia. Água constante durante o treino. No fim: alongamento de panturrilhas e tendão de Aquiles, 3×30seg cada.' },
  { title: 'Barra diária (seg–sex)', text: 'Aquece com elástico antes da barra. 3 a 5 séries até à falha, descanso de 2min. Segue com exercícios de lordose.' },
  { title: 'Café pré-treino', text: '1 café sem açúcar, 30min antes do judo ou dos tiros. Extra opcional, não obrigatório.' },
];

const FIT_MEALS = {
  judo: {
    label: 'Dia de judo', days: 'seg · qua · sex', tag: 'judo',
    rows: [
      { time: '06h–07h', name: 'Pequeno-almoço', desc: 'Aveia ou rhale (tigela a metade) + 1 banana + leite 1 copo (se disponível)' },
      { time: '10h–11h', name: 'Merenda', desc: '1 fruta + 1 ovo cozido (se disponível) ou pão de trigo 1 fatia' },
      { time: '12h–13h', name: 'Almoço', desc: 'Moela 150g ou frango 200g + arroz, xima ou massa (tigela cheia) + feijão (tigela cheia) + cove ou matapa', note: 'Almoço mais cheio — combustível para o treino das 15h/15h30' },
      { time: '1h antes', name: 'Pré-treino', desc: '1–2 bananas ou pão de trigo 1 fatia' },
      { time: 'Pós-treino', name: 'Jantar', desc: 'Frango 150g ou moela 120g + arroz/xima (tigela 3/4) + feijão (meia tigela) + cove ou matapa', note: 'Refeição completa para a recuperação muscular' },
    ],
  },
  tiros: {
    label: 'Dia de tiros', days: 'ter · qui', tag: 'tiros',
    rows: [
      { time: '06h–07h', name: 'Pequeno-almoço', desc: 'Aveia ou rhale (tigela a metade) + 1 banana + leite (se disponível)' },
      { time: '10h–11h', name: 'Merenda', desc: '1 fruta + 1 ovo cozido (se disponível)' },
      { time: '12h–13h', name: 'Almoço', desc: 'Moela 150g ou frango 200g + massa, arroz ou xima (tigela cheia) + feijão (tigela cheia) + cove ou matapa' },
      { time: '17h', name: 'Pré-tiro', desc: '2 bananas ou pão de trigo com pouca manteiga', note: '1h30 antes dos tiros — comida pesada causa enjoo' },
      { time: '19h30–20h30', name: 'Jantar', desc: 'Frango 150g ou moela 120g + arroz/xima (tigela 3/4) + feijão (meia tigela) + cove ou matapa' },
    ],
  },
  rest: {
    label: 'Fim de semana', days: 'sáb · dom', tag: 'rest',
    rows: [
      { time: '06h–07h', name: 'Pequeno-almoço', desc: 'Aveia ou rhale (tigela a metade) + 1 banana + pão de trigo + manteiga (pouca)' },
      { time: '10h–11h', name: 'Merenda', desc: '1 fruta (+ pão de trigo se tiveres fome)' },
      { time: '13h–14h', name: 'Almoço', desc: 'Moela ou frango 120g + arroz, xima ou massa (tigela cheia) + feijão + cove ou matapa', note: 'Dia de descanso — não precisas de comer a mais' },
      { time: '19h–20h', name: 'Jantar leve', desc: 'Ovo ou frango 100g + xima ou trigo cozido (tigela 3/4) + feijão + cove ou salada', note: 'Menos carboidrato no dia de descanso' },
    ],
  },
};

const FIT_RULES = [
  { k: 'Água', v: '2 litros por dia — mais nos dias de tiros na areia, o calor e o esforço desidratam depressa' },
  { k: 'Sono', v: '7 a 8 horas por noite — é a dormir que o corpo repara o músculo e queima gordura' },
  { k: 'Piri-piri', v: 'Usa fresco nas refeições — acelera o metabolismo e é grátis em Moçambique' },
  { k: 'Ordem da refeição', v: 'Começa pela salada/cove, depois a proteína, o carboidrato por último' },
  { k: 'Preparo', v: 'Prefere grelhado ou cozido a frito — o óleo do frito soma muitas calorias sem encher mais' },
  { k: 'Sal nos tiros', v: 'Uma pitada de sal na água ou um lanche salgado nos dias de tiros' },
];

const FIT_FOODS = {
  base: ['Arroz branco', 'Xima', 'Batata', 'Massa', 'Pão de trigo', 'Manteiga', 'Aveia', 'Rhale', 'Trigo', 'Banana', 'Frango', 'Salada', 'Cove', 'Matapa', 'Feijão'],
  extra: ['Ovo', 'Leite', 'Maçã', 'Pera maçã', 'Laranja / tangerina', 'Batata doce', 'Mandioca', 'Moela'],
};

/* ---------------- Protocolo: identidade + rotina diária editável ---------------- */

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const DAY_TYPE = {
  Segunda: 'foco', Terça: 'restauracao', Quarta: 'foco', Quinta: 'restauracao',
  Sexta: 'foco', Sábado: 'restauracao', Domingo: 'restauracao',
};

const DAY_TYPE_LABEL = {
  foco: 'Dia de foco',
  restauracao: 'Dia de restauração',
};

/* áreas por defeito para uma atividade (cor + rótulo) — só usadas para semear
   instalações novas ou utilizadores antigos; a partir daqui a lista vive em
   state.areas e o próprio utilizador pode renomear/recolorir/apagar/criar. */
const DEFAULT_AREAS = [
  { id: 'trabalho', label: 'Trabalho', color: '#2563eb' },
  { id: 'fitness', label: 'Judo & Tiros', color: '#00c896' },
  { id: 'linguas', label: 'Línguas', color: '#a855f7' },
  { id: 'leitura', label: 'Leitura', color: '#f59e0b' },
  { id: 'revisao', label: 'Revisão', color: '#ec4899' },
  { id: 'pessoal', label: 'Cuidados pessoais', color: '#06b6d4' },
  { id: 'domestico', label: 'Doméstico', color: '#f97316' },
  { id: 'diario', label: 'Diário', color: '#10b981' },
  { id: 'outro', label: 'Outro', color: '#818cf8' },
];

/* itens fixos do AIF — Autenticidade: entram no fim da checklist de todos os dias */
const AIF_DIARIO_TITLES = ['Escrevi no diário — incluindo o que correu mal', 'O que fiz hoje foi por mim, não para mostrar'];

/* Estado inicial (seed) — o utilizador pode editar/apagar/adicionar tudo isto dentro do app. */
function seedActivities() {
  var mk = function (area, title, detail, time) { return { area: area, title: title, detail: detail || '', time: time || '' }; };
  var acordar = function(){ return mk('pessoal', 'Acordar', '', '05h30'); };
  var lordose = function(){ return mk('fitness', 'Exercícios de lordose', 'Alongamento + abdominal + prancha + fortalecimento', '05h30'); };
  var godMoment = function(){ return mk('pessoal', 'God Moment', '', '05h40'); };
  return {
    Segunda: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Espionagem', 'Ofertas vencedoras, produtos com potencial, levar criativos · importar produtos (remodelar fotos, copy, achar comentários)'),
      mk('fitness', 'Judo técnico', 'Kuzushi → tsukuri → kake, sem pressão de combate — foco na forma', '15h30'),
      mk('linguas', 'Inglês — Anki + gramática', 'Revisão dos cards + explicação curta e exercícios', '14h00'),
      mk('leitura', 'Leitura', ''),
    ],
    Terça: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Loja', 'Melhorar a credibilidade, aprimorar landpages para converter mais, trabalhar nas seções e abas'),
      mk('fitness', 'Tiros na areia', '6–10 tiros de 15–30m a 100%, descanso de 1–2min a caminhar', '18h00'),
      mk('linguas', 'Inglês — vocabulário, escrita, listening, speaking', ''),
      mk('revisao', 'Revisão da matéria', '', '11h00'),
      mk('pessoal', 'Cuidados pessoais', ''),
      mk('domestico', 'Trabalhos domésticos', ''),
    ],
    Quarta: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Criativos', 'Criar novos ADS'),
      mk('fitness', 'Judo combate', 'Treino explosivo, com carga e luta de pegas', '15h30'),
      mk('linguas', 'Inglês — Anki + gramática', '', '14h00'),
      mk('leitura', 'Leitura', ''),
    ],
    Quinta: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Campanhas', 'Como estão as métricas, levantar teste de ADS, produto ou landingpage'),
      mk('fitness', 'Tiros na areia', '6–10 tiros de 15–30m a 100%', '18h00'),
      mk('linguas', 'Inglês — vocabulário, escrita, listening, speaking', ''),
      mk('revisao', 'Revisão da matéria', '', '11h00'),
      mk('pessoal', 'Cuidados pessoais', ''),
      mk('domestico', 'Trabalhos domésticos', ''),
    ],
    Sexta: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Minerar & Aprender', 'Minerar e aprender coisas novas'),
      mk('fitness', 'Judo randori', 'Randori a 100%, sem hesitação', '15h00'),
      mk('linguas', 'Inglês — Anki + gramática', '', '14h00'),
      mk('leitura', 'Leitura', ''),
    ],
    Sábado: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Remarketing', 'Remarketing e pausar ADS'),
      mk('fitness', 'Descanso ativo', 'Caminhada de 30–45min, sem barra, 7–8h de sono'),
      mk('revisao', 'Revisão da matéria', '', '14h00'),
    ],
    Domingo: [
      acordar(), lordose(), godMoment(),
      mk('trabalho', 'DROP — Campanhas', 'Como estão as métricas, levantar teste de ADS, produto ou landingpage'),
      mk('linguas', 'Inglês — vocabulário, escrita, listening, speaking', ''),
      mk('revisao', 'Revisão da matéria', '', '17h00'),
      mk('pessoal', 'Cuidados pessoais', ''),
      mk('fitness', 'Descanso ativo', 'Caminhada de 30–45min, sem barra, 7–8h de sono'),
      mk('domestico', 'Marmitas da semana', '', '18h–19h'),
    ],
  };
}
function appendDailyClose(data){
  WEEKDAYS.forEach(function(day){
    data[day].push(
      { area:'diario', title: AIF_DIARIO_TITLES[0], detail:'', time:'' },
      { area:'diario', title: AIF_DIARIO_TITLES[1], detail:'', time:'' },
      { area:'pessoal', title:'Dormir', detail:'', time:'22h00' }
    );
  });
  return data;
}

function seedActivitiesWithIds() {
  var data = appendDailyClose(seedActivities());
  WEEKDAYS.forEach(function (day) {
    (data[day] || []).forEach(function (act, i) {
      act.id = day + '-' + i;
    });
  });
  return data;
}

/* ---------------- seeds para conteúdo editável (notas) ----------------
   Convertem o conteúdo original em notas título+texto simples, para que
   o utilizador possa editar tudo dentro do app. Só correm uma vez, na
   primeira utilização — depois disso o que manda é o que está guardado. */

function stripHtml(html){
  return String(html)
    .replace(/<li>/gi, '\n- ')
    .replace(/<\/(p|li|ol|ul)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&minus;/g,'−')
    .split('\n').map(function(l){ return l.trim(); }).filter(Boolean).join('\n')
    .trim();
}

function rid(prefix){ return prefix + Math.random().toString(36).slice(2, 9); }

function seedFitNotes(){
  var protocolos = FIT_PROTOCOLS.map(function(p){ return { id: rid('n'), title: p.title, body: p.text }; });
  var refeicoes = ['judo', 'tiros', 'rest'].map(function(key){
    var m = FIT_MEALS[key];
    return {
      id: rid('n'), title: m.label, days: m.days, tag: m.tag,
      rows: m.rows.map(function(r){ return { id: rid('r'), time: r.time, name: r.name, desc: r.desc, note: r.note || '' }; }),
    };
  });
  var regras = FIT_RULES.map(function(r){ return { id: rid('n'), title: r.k, body: r.v }; });
  var alimentos = [
    { id: rid('n'), title: 'Sempre disponíveis', items: FIT_FOODS.base.slice() },
    { id: rid('n'), title: 'Envolvem custo', items: FIT_FOODS.extra.slice() },
  ];
  return { protocolos: protocolos, refeicoes: refeicoes, regras: regras, alimentos: alimentos };
}

function seedLangNotes(){
  var rotina = LANG_ROUTINE.map(function(r){
    return {
      id: rid('n'), days: r.days, time: r.time,
      items: r.items.map(function(it){ return { id: rid('i'), t: it.t, d: it.d }; }),
    };
  });
  var recursos = LANG_RESOURCES.map(function(r){
    return { id: rid('n'), name: r.name, badge: r.badge, badgeType: r.badgeType, desc: r.desc };
  });
  return { rotina: rotina, recursos: recursos };
}

function seedLangWeeks(){
  var weeks = [];
  LANG_MONTHS.forEach(function(m){
    m.weeks.forEach(function(w){
      var grammarLines = w.grammar.map(function(g){
        if(typeof g === 'string') return g;
        return (g.novo ? 'NOVO: ' : '') + g.text;
      }).join('\n');
      var milestoneText = w.milestone ? (w.milestone.tag + '\n' + stripHtml(w.milestone.html)) : '';
      weeks.push({
        id: 'w' + w.num,
        num: w.num,
        monthTitle: m.title,
        monthId: m.id,
        grammarNote: grammarLines,
        milestoneNote: milestoneText,
        vocab: w.vocab.map(function(v){ return { key: v.k, label: v.label }; }),
      });
    });
  });
  return weeks;
}

const DEFAULT_PROTOCOLO = {
  manifesto: 'Antes dos 22, ponho as bases em ordem para expandir o negócio e mudar de país. Os meus objetivos não são negociáveis — cada dia de foco e cada dia de restauração serve esse rumo.',
  metas: [
    { label: 'Vendas', value: '2/dia' },
    { label: 'Peso', value: '85 kg' },
    { label: 'Inglês', value: 'Imersão B1' },
  ],
};

/* ---------------- AIF: Autenticidade · Intensidade · Fidelidade ---------------- */
/* Compromisso feito no crisma, 2025. Não é um tracker novo — é uma lente sobre a
   checklist diária que já existe. As cores são fixas por letra (identidade),
   o texto de cada letra é editável pelo utilizador dentro do app. */
const AIF_LETTERS = {
  a: {
    letter: 'A', color: 'var(--cat-fit)',
    title: 'Autenticidade que inspira',
    body: 'Não ser cópia. O problema nunca é a ideia vir de fora — tudo vem de fora. O problema é adotar sem testar.',
    test: 'De onde veio isto, e quando testo contra a minha vida, aguenta?',
  },
  i: {
    letter: 'I', color: 'var(--accent)',
    title: 'Intensidade que marca',
    body: 'Presença não é entrega. Intensidade não é espalhar esforço por muitas frentes — é o que dou àquilo que amo.',
    test: 'Dei tudo, ou só marquei presença?',
  },
  f: {
    letter: 'F', color: 'var(--cat-lang)',
    title: 'Fidelidade que define',
    body: 'Cumprir o combinado quando ninguém vê e ninguém saberia.',
    test: 'Faria isto na mesma se ninguém ficasse a saber?',
  },
};


const AIF_STREAK_RULE_TEXT = 'A regra é uma só: nunca falhar dois dias seguidos. Um dia mau é ruído. Dois seguidos é o início de uma desistência.';

/* ---------------- Rota: linha do tempo até à candidatura na China ---------------- */
const ROTA_META = {
  countdownStart: '2026-09-01',
  countdownTarget: '2028-12-01',
  countdownLabel: 'até à abertura da janela de candidatura',
  chips: ['2º ano · 2º semestre', 'Meta: HSK 4', '22 anos na candidatura'],
  note: 'O IELTS é o exame que carrega a candidatura; o HSK 4 é objetivo esticado. Se o inglês e o mandarim competirem por tempo até 2028, o inglês ganha.',
};

function seedRotaTimeline(){
  var mk = function(year, period, title, detail, tag){ return { id: rid('rt'), year: year, period: period, title: title, detail: detail || '', tag: tag || '' }; };
  return [
    mk(2026, 'Set 2026', 'Estás aqui', '2º semestre do 2º ano. Até ao fim do ano só estudo inglês; o mandarim fica adiado para janeiro.', 'aqui'),
    mk(2026, 'Out – Dez 2026', 'Fecha o 2º semestre', 'Estas notas entram no histórico em definitivo.'),
    mk(2026, 'Dez 2026', 'Inglês em B1', ''),
    mk(2027, 'Jan 2027', 'Mandarim começa do zero', 'O relógio do HSK só conta a partir daqui.'),
    mk(2027, 'Meio de 2027', 'HSK 1', '150 palavras.'),
    mk(2027, 'Dez 2027', 'HSK 2', '300 palavras. Inglês a entrar em B2.'),
    mk(2028, 'Jun 2028', 'IELTS', 'Nota válida 2 anos, cobre a candidatura de 2029. Programas em inglês pedem banda 6.0 a 6.5.'),
    mk(2028, 'Jun 2028', 'HSK 3', '600 palavras.'),
    mk(2028, 'Out 2028', 'HSK 4', '1200 palavras. Objetivo esticado, não requisito.'),
    mk(2028, 'Nov – Dez 2028', 'Fim da licenciatura, 22 anos', 'Começar a juntar documentos em setembro: diploma, histórico traduzido, 2 cartas de recomendação, plano de estudos, exame médico (validade 6 meses), passaporte e legalizações.'),
    mk(2029, 'Dez 2028 – Mar 2029', 'Janela de candidatura', 'campuschina.org, via Instituto Confúcio (UEM, em Maputo) e edital do IBE. Candidatar por mais de uma via — são processos separados.', 'janela'),
    mk(2029, 'Set 2029', 'Início das aulas na China', ''),
  ];
}

/* Nova rota: texto integral fornecido pelo utilizador em 18/10/2026. */
const CHINA_2029_TEXT = "### 2\\. Nova Rota para a China — tarefas concretas\n\nVou tratar a candidatura de 2029 como um projeto com entregas mensais. Não basta escrever «melhorar as notas» ou «ganhar experiência»: precisamos de definir o que fazer, quando fazer e como comprovar o resultado.\n\n### Fase 1 — Outubro a dezembro de 2026\n\nMissões para os próximos 75 dias\n\n18 out. – 31 dez.\n\nCriar um dossier China 2029\n\nCria uma pasta com cinco subpastas: Notas, Idiomas, Projetos, Recomendações e Bolsas. Guarda aí todos os comprovativos.\n\nRegistar as notas de RI\n\nEscreve as disciplinas do semestre, notas atuais e avaliações restantes. Identifica as duas disciplinas em que mais precisas de melhorar.\n\nIdentificar dois docentes\n\nEscolhe dois professores que conheçam o teu desempenho. Participa nas aulas, entrega bons trabalhos e pede orientação académica, sem solicitar ainda cartas.\n\nContinuar o programa de inglês\n\nCumpre as sessões previstas e realiza o checkpoint de escrita na semana 4. Guarda um texto corrigido e uma gravação oral por mês.\n\nPreparar um tema China–Moçambique\n\nEscreve uma página com uma pergunta de investigação, a razão da escolha e três questões que pretendes estudar.\n\nDocumentar o dropshipping\n\nCria um registo mensal com produtos testados, campanhas, vendas, custos e aprendizagens. Não precisas de divulgar dados de clientes.\n\nMissões concluídas\n\n0 / 6\n\nO objetivo até dezembro não é acumular certificados. É terminar o semestre com boas notas e estabelecer uma base documental que possa crescer nos próximos dois anos.\n\n### Fase 2 — Janeiro a dezembro de 2027\n\n| Quando            | O que deves fazer                                                                        | Resultado concreto                     |\n| ----------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |\n| Janeiro           | Iniciar mandarim com 20–30 minutos, 4 vezes por semana, se a rotina permitir             | Primeiro registo de aprendizagem       |\n| Fevereiro         | Selecionar um tema de investigação ligado à China e Moçambique                           | Pergunta de investigação definida      |\n| Março–abril       | Ler 4–6 artigos ou relatórios relevantes e fazer resumos                                 | Pequena revisão bibliográfica          |\n| Maio–junho        | Produzir um trabalho de 5–8 páginas sobre o tema                                         | Primeiro estudo de caso                |\n| Julho             | Pedir a um docente que avalie o trabalho                                                 | Comentários e versão revista           |\n| Agosto–setembro   | Participar numa iniciativa académica, palestra, clube ou atividade comunitária relevante | Participação documentada               |\n| Outubro           | Organizar os resultados do dropshipping num estudo de caso                               | Relatório com indicadores reais        |\n| Novembro–dezembro | Fazer avaliação de inglês e rever a evolução do mandarim                                 | Plano linguístico atualizado para 2028 |\n\nA experiência extracurricular não precisa de ser um conjunto de dez atividades. Uma iniciativa relevante, realizada com consistência e resultados comprováveis, vale mais para o teu portefólio do que muitas participações superficiais. Isto é uma recomendação estratégica, não uma regra oficial das bolsas.\n\n### Fase 3 — Janeiro a dezembro de 2028\n\nJaneiro–junho: comprovar competências linguísticas\n\nFazer simulados de IELTS, identificar a pontuação exigida pelos programas selecionados e realizar o exame quando estiveres preparado. A meta inicial de planeamento pode ser 6.5, mas não é um requisito universal.\n\nAbril–julho: pesquisar 8–12 programas\n\nCriar uma tabela com universidade, curso, idioma, bolsa, requisitos, documentos, prazo e contacto oficial. Eliminar os programas para os quais não sejas elegível.\n\nJulho–setembro: preparar a candidatura\n\nEscrever currículo académico, plano de estudos e uma primeira versão da carta de motivação. Pedir a dois docentes autorização para futuras recomendações.\n\nSetembro–dezembro: contactar universidades\n\nConfirmar a abertura das candidaturas, os requisitos de pré-admissão e os procedimentos de bolsas. Solicitar recomendações e reunir os documentos disponíveis.\n\n### Fase 4 — 2029\n\nA tarefa deixa de ser preparar o perfil e passa a ser executar candidaturas: verificar os editais oficiais, confirmar elegibilidade para cidadãos moçambicanos, obter pré-admissões quando exigidas, submeter os formulários e acompanhar os resultados.\n\nSe a licenciatura ou os documentos não estiverem concluídos a tempo, 2030 continua a ser uma alternativa válida, sem transformar 2029 numa obrigação a qualquer custo.\n\n### 3\\. O primeiro projeto que recomendo para o teu perfil\n\nEm vez de criares uma atividade extracurricular artificial, podemos aproveitar o teu negócio e a tua formação em Relações Internacionais.\n\nPROJETO PROPOSTO\n\n### China–Moçambique: comércio eletrónico e oportunidades para jovens empreendedores\n\nPergunta principal: Como podem pequenos empreendedores moçambicanos aproveitar o comércio com fornecedores chineses e quais são os principais obstáculos?\n\nPrimeira tarefa — até 31 de outubro de 2026: escrever uma página contendo:\n\n* O problema que pretendes estudar.\n\n* A tua experiência prática relacionada com o tema.\n\n* Três perguntas que gostarias de investigar.\n\n* Três fontes ou instituições onde procurar informação.\n\nEntrega: um documento de uma página, que depois poderemos desenvolver num estudo mais completo.\n\nEste projeto poderá demonstrar capacidade de investigação, pensamento crítico e experiência empreendedora. Não garante uma bolsa, mas pode tornar a tua candidatura mais coerente, especialmente se escolheres uma área ligada a negócios, comércio ou desenvolvimento internacional.\n\n### 4\\. Onde encaixar a preparação para a China?\n\nNa exportação atual, sábado e domingo continuam praticamente vazios. Isso não significa que estejam livres — apenas que ainda não os organizaste completamente.\n\nA minha proposta inicial é reservar 45 minutos ao sábado, uma vez por semana, exclusivamente para a Rota para a China.\n\n| Semana         | Missão de sábado                                       |\n| -------------- | ------------------------------------------------------ |\n| 24 de outubro  | Criar o dossier China 2029                             |\n| 31 de outubro  | Escrever a primeira página do projeto China–Moçambique |\n| 7 de novembro  | Organizar as notas e avaliações de RI                  |\n| 14 de novembro | Registar o primeiro estudo de caso do dropshipping     |\n| 21 de novembro | Identificar dois possíveis docentes orientadores       |\n| 28 de novembro | Rever as entregas e planear dezembro                   |\n\nIsto equivale a apenas 45 minutos semanais de preparação específica, além do inglês e da faculdade, que já fazem parte da tua rotina.\n\n### 5\\. O que ainda corrigiria no Protocolo Pessoal\n\nHá mais dois detalhes na exportação: terça e quinta aparecem com tarefas domésticas das 7h às 10h, embora anteriormente tenhas indicado das 6h às 10h; e sábado e domingo ainda não incluem as atividades principais, incluindo a igreja às 10h de domingo.\n\nAntes de fechar a avaliação de sustentabilidade, precisamos de harmonizar esses horários. Também convém rever o sono, pois acordar às 5h depois de te deitares às 22h deixa pouca margem para adormecer e descansar suficientemente.\n\nA minha recomendação para já: mantém as prioridades atuais e acrescenta somente a sessão de 45 minutos para a China. Nada de mandarim antes de janeiro, conforme o teu plano original.\n\nA partir de agora, cada etapa da Rota para a China terá uma tarefa, um prazo e uma entrega verificável. Assim saberemos não apenas o que pretendes alcançar, mas o que efetivamente construíste para a candidatura.\n\nQuando terminares sábado e domingo na aplicação, envia uma nova exportação. Vou então verificar se os 45 minutos cabem realmente na semana e ajustar a rota ao tempo disponível.";

/* Texto integral do ficheiro fornecido pelo utilizador; não resumir. */
const CHINA_WEEKLY_TEXT = "# ROTA PARA A CHINA 2029 — MISSÕES SEMANAIS\n\nObjetivo: construir uma candidatura forte a bolsa de estudos na China, sem assumir antecipadamente o curso.\nInício: 24/10/2026 | Horizonte: setembro de 2029.\n\nREGRAS: uma missão principal por semana, normalmente 45 minutos de preparação específica; trabalhos mais longos podem ocupar várias sessões ou ser desdobrados sem sacrificar faculdade, inglês, saúde, sono ou dropshipping. Inglês e revisão de RI seguem a rotina habitual. Não marcar como concluído sem prova. Editais e requisitos mudam: verificar sempre fontes oficiais do ano da candidatura. O plano 2030 é alternativa se houver atraso na licenciatura ou falta de financiamento.\n\nFontes de pesquisa: https://www.campuschina.org/ ; sites oficiais de universidades chinesas; canais oficiais da Embaixada da China em Moçambique; secretaria/departamento de RI; fontes académicas.\n\n## 2026-10 — 2 missões\n### Semana 001 — 24/10/2026 | Fazer diagnóstico do teu perfil\n**FAZ ISTO:** Abre uma nota com as disciplinas de RI, notas conhecidas, inglês A2, trabalhos feitos e experiência de negócio; assinala o que ainda não tens.\n**OPÇÕES / ALTERNATIVAS:** Se não tiveres notas finais, usa avaliações parciais e escreve «por confirmar».\n**PROVA DE CONCLUSÃO:** Ficha de perfil de uma página.\n\n### Semana 002 — 31/10/2026 | Comparar três áreas de mestrado\n**FAZ ISTO:** Procura planos curriculares de Marketing, Negócios Internacionais e RI; anota cinco disciplinas, oportunidades profissionais e presença de matemática.\n**OPÇÕES / ALTERNATIVAS:** Troca uma área por Comunicação, Políticas Públicas ou Desenvolvimento Internacional se te interessar mais.\n**PROVA DE CONCLUSÃO:** Tabela com três áreas e nota pessoal de interesse 0–10.\n\n## 2026-11 — 4 missões\n### Semana 003 — 07/11/2026 | Encontrar seis programas reais\n**FAZ ISTO:** Procura em sites oficiais de universidades chinesas dois mestrados por área; regista idioma, requisitos de licenciatura e links.\n**OPÇÕES / ALTERNATIVAS:** Se uma área não oferecer programas compatíveis, substitui-a por Comunicação ou Gestão Pública.\n**PROVA DE CONCLUSÃO:** Tabela com seis programas e seis links oficiais.\n\n### Semana 004 — 14/11/2026 | Pesquisar bolsas e elegibilidade\n**FAZ ISTO:** Consulta Campus China e canais oficiais da Embaixada da China em Moçambique; anota o ano do edital, tipos de bolsa, requisitos e dúvidas.\n**OPÇÕES / ALTERNATIVAS:** Se não houver edital 2029, usa o mais recente apenas como referência e marca «confirmar em 2028/29».\n**PROVA DE CONCLUSÃO:** Ficha comparativa de duas vias de bolsa.\n\n### Semana 005 — 21/11/2026 | Localizar três atividades extracurriculares\n**FAZ ISTO:** Pergunta ao departamento de RI, associação de estudantes e representante da turma por jornadas científicas, MUN, debates, palestras ou voluntariado.\n**OPÇÕES / ALTERNATIVAS:** Se não houver atividades, pergunta a dois colegas se organizariam uma sessão de debate com um docente.\n**PROVA DE CONCLUSÃO:** Três contactos, links ou respostas registadas.\n\n### Semana 006 — 28/11/2026 | Escrever o primeiro CV académico\n**FAZ ISTO:** Cria CV de uma página com RI, línguas, competências verificáveis, trabalhos e atividades reais; não inventes certificados.\n**OPÇÕES / ALTERNATIVAS:** Podes usar modelo Europass ou documento simples com secções claras.\n**PROVA DE CONCLUSÃO:** CV v1 guardado em PDF.\n\n## 2026-12 — 4 missões\n### Semana 007 — 05/12/2026 | Rever um trabalho universitário\n**FAZ ISTO:** Escolhe um trabalho de RI, melhora introdução, argumento, bibliografia e conclusão; pede comentário a um docente se possível.\n**OPÇÕES / ALTERNATIVAS:** Se não houver trabalho recuperável, escreve análise de duas páginas de um tema dado nas aulas.\n**PROVA DE CONCLUSÃO:** Versão inicial e revista guardadas.\n\n### Semana 008 — 12/12/2026 | Criar amostra de inglês\n**FAZ ISTO:** Escreve 180–220 palavras sobre os teus estudos e grava 2 minutos a falar do tema; corrige erros com recursos de aprendizagem.\n**OPÇÕES / ALTERNATIVAS:** Usa British Council ou BBC Learning English; se tiveres professor, pede correção.\n**PROVA DE CONCLUSÃO:** Texto corrigido e áudio datados.\n\n### Semana 009 — 19/12/2026 | Comparar a experiência de estudar na China\n**FAZ ISTO:** Lê páginas oficiais de vida estudantil de três universidades da lista; verifica cidade, clima, alojamento e clubes.\n**OPÇÕES / ALTERNATIVAS:** Inclui cidade mais fria e cidade tecnológica para comparação.\n**PROVA DE CONCLUSÃO:** Quadro de vantagens e limitações das três cidades.\n\n### Semana 010 — 26/12/2026 | Fechar diagnóstico anual\n**FAZ ISTO:** Reúne notas disponíveis, tarefas feitas e obstáculos; seleciona duas áreas para explorar em 2027 e define uma atividade a tentar.\n**OPÇÕES / ALTERNATIVAS:** Se continuares indeciso, mantém três áreas, mas escreve critérios de desempate.\n**PROVA DE CONCLUSÃO:** Relatório de uma página + prioridades de janeiro.\n\n## 2027-01 — 5 missões\n### Semana 011 — 02/01/2027 | Preparar estudo de mandarim\n**FAZ ISTO:** Escolhe um curso introdutório de pinyin e tons, define quatro sessões semanais de 20 minutos e faz lição 1.\n**OPÇÕES / ALTERNATIVAS:** HelloChinese, Chinese Zero to Hero ou material aberto de universidade; escolhe só um curso principal.\n**PROVA DE CONCLUSÃO:** Plano de quatro dias + primeira lição concluída.\n\n### Semana 012 — 09/01/2027 | Praticar pronúncia e tons\n**FAZ ISTO:** Treina quatro tons com 20 palavras, grava a tua voz e compara com áudio de referência.\n**OPÇÕES / ALTERNATIVAS:** Se não conseguires áudio confiável, usa material de um curso estruturado.\n**PROVA DE CONCLUSÃO:** Gravação inicial e lista de 20 palavras.\n\n### Semana 013 — 16/01/2027 | Aprender apresentação pessoal\n**FAZ ISTO:** Estuda nome, país, curso e saudações; escreve dez frases curtas em pinyin e caracteres quando possível.\n**OPÇÕES / ALTERNATIVAS:** Pede correção num grupo de estudo ou ferramenta linguística, verificando erros.\n**PROVA DE CONCLUSÃO:** Dez frases e gravação de 60 segundos.\n\n### Semana 014 — 23/01/2027 | Rever carga de estudo\n**FAZ ISTO:** Conta sessões realmente realizadas, avalia se o mandarim prejudicou inglês/RI e ajusta horários.\n**OPÇÕES / ALTERNATIVAS:** Reduz para duas sessões se estiveres sobrecarregado; não sacrifiques inglês.\n**PROVA DE CONCLUSÃO:** Registo de sessões e horário de fevereiro.\n\n### Semana 015 — 30/01/2027 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2027-02 — 4 missões\n### Semana 016 — 06/02/2027 | Encontrar três profissionais/estudantes\n**FAZ ISTO:** Identifica uma pessoa de Marketing, uma de Negócios Internacionais e uma de RI/Comunicação; procura contactos públicos ou conhecidos.\n**OPÇÕES / ALTERNATIVAS:** Professores, finalistas, alumni, LinkedIn ou grupos universitários.\n**PROVA DE CONCLUSÃO:** Três nomes e perguntas preparadas.\n\n### Semana 017 — 13/02/2027 | Conversar com alguém de Marketing\n**FAZ ISTO:** Pergunta sobre disciplinas, ferramentas, matemática, oportunidades e rotina de trabalho; regista respostas.\n**OPÇÕES / ALTERNATIVAS:** Se não houver contacto, assiste a palestra pública e anota perguntas respondidas.\n**PROVA DE CONCLUSÃO:** Resumo de uma conversa ou palestra.\n\n### Semana 018 — 20/02/2027 | Conversar com alguém de negócios\n**FAZ ISTO:** Pergunta sobre importação, gestão, logística, análise de dados e saídas profissionais.\n**OPÇÕES / ALTERNATIVAS:** Pode ser empresário local, docente ou finalista de gestão.\n**PROVA DE CONCLUSÃO:** Resumo com cinco aprendizagens.\n\n### Semana 019 — 27/02/2027 | Conversar com alguém de RI/Comunicação\n**FAZ ISTO:** Pergunta sobre investigação, diplomacia, ONGs, escrita e carreira; compara com as outras áreas.\n**OPÇÕES / ALTERNATIVAS:** Se não encontrares pessoa, entrevista um docente de RI.\n**PROVA DE CONCLUSÃO:** Quadro com diferenças entre três áreas.\n\n## 2027-03 — 4 missões\n### Semana 020 — 06/03/2027 | Escolher primeiro projeto experimental\n**FAZ ISTO:** Escolhe a área mais interessante neste momento e formula uma pergunta pequena, respondível em três semanas.\n**OPÇÕES / ALTERNATIVAS:** Marketing: comparar mensagens publicitárias; Negócios: mapear importação; RI: analisar posição diplomática; Comunicação: avaliar campanha pública.\n**PROVA DE CONCLUSÃO:** Pergunta e plano de uma página.\n\n### Semana 021 — 13/03/2027 | Reunir fontes para projeto 1\n**FAZ ISTO:** Localiza quatro fontes credíveis e dois dados observáveis; regista autores, datas e links.\n**OPÇÕES / ALTERNATIVAS:** Fontes: artigos académicos, INE, Banco Mundial, documentos oficiais ou métricas próprias anonimizadas.\n**PROVA DE CONCLUSÃO:** Bibliografia inicial com seis itens.\n\n### Semana 022 — 20/03/2027 | Executar análise do projeto 1\n**FAZ ISTO:** Escreve método simples, apresenta dados reais e explica o que observaste sem inventar resultados.\n**OPÇÕES / ALTERNATIVAS:** Se não houver dados quantitativos, faz análise documental com critérios explícitos.\n**PROVA DE CONCLUSÃO:** Rascunho de 2–3 páginas.\n\n### Semana 023 — 27/03/2027 | Concluir projeto 1\n**FAZ ISTO:** Revê texto, limitações e referências; pede feedback a colega ou docente.\n**OPÇÕES / ALTERNATIVAS:** Se ninguém puder rever, usa lista de verificação de escrita académica.\n**PROVA DE CONCLUSÃO:** Projeto 1 final de 3–5 páginas.\n\n## 2027-04 — 4 missões\n### Semana 024 — 03/04/2027 | Identificar evento académico do semestre\n**FAZ ISTO:** Consulta mural, secretaria, associação estudantil e redes oficiais para conferência, jornada científica, debate ou palestra.\n**OPÇÕES / ALTERNATIVAS:** Se não houver evento, propõe encontro de leitura sobre RI com 2–3 colegas.\n**PROVA DE CONCLUSÃO:** Evento escolhido com data ou plano alternativo.\n\n### Semana 025 — 10/04/2027 | Preparar participação ativa\n**FAZ ISTO:** Lê duas fontes sobre tema do evento e escreve três perguntas pertinentes; inscreve-te se necessário.\n**OPÇÕES / ALTERNATIVAS:** Se for debate, prepara argumento de 2 minutos e contra-argumento.\n**PROVA DE CONCLUSÃO:** Inscrição ou roteiro de participação.\n\n### Semana 026 — 17/04/2027 | Participar ou realizar sessão\n**FAZ ISTO:** Assiste, faz pelo menos uma pergunta ou ajuda na organização; se não houver evento, realiza a sessão de leitura com colegas.\n**OPÇÕES / ALTERNATIVAS:** Exemplos: MUN, jornada científica, clube de debate, palestra de embaixada, sessão departamental.\n**PROVA DE CONCLUSÃO:** Programa, foto autorizada, ata ou certificado real.\n\n### Semana 027 — 24/04/2027 | Documentar experiência\n**FAZ ISTO:** Escreve 200 palavras sobre o que aprendeste, o teu papel e como melhorar; arquiva comprovativos.\n**OPÇÕES / ALTERNATIVAS:** Sem certificado, regista data, tema, participantes e atividade efetiva.\n**PROVA DE CONCLUSÃO:** Relatório de participação de uma página.\n\n## 2027-05 — 5 missões\n### Semana 028 — 01/05/2027 | Escolher segunda área para testar\n**FAZ ISTO:** Seleciona área diferente da do projeto 1 e formula pergunta concreta; explica por que a escolheste.\n**OPÇÕES / ALTERNATIVAS:** Se testaste Marketing, tenta RI ou Negócios; se testaste RI, tenta Comunicação ou Marketing.\n**PROVA DE CONCLUSÃO:** Plano do projeto 2.\n\n### Semana 029 — 08/05/2027 | Reunir fontes para projeto 2\n**FAZ ISTO:** Procura quatro referências e define o que vais observar ou comparar.\n**OPÇÕES / ALTERNATIVAS:** Podes usar entrevista com consentimento, documentos públicos ou dados do negócio sem informações de clientes.\n**PROVA DE CONCLUSÃO:** Lista de fontes e método.\n\n### Semana 030 — 15/05/2027 | Produzir análise do projeto 2\n**FAZ ISTO:** Escreve introdução, dados, análise e conclusão; regista limites.\n**OPÇÕES / ALTERNATIVAS:** Marketing: comparar dois anúncios; RI: duas políticas; Negócios: duas rotas de fornecimento.\n**PROVA DE CONCLUSÃO:** Rascunho de três páginas.\n\n### Semana 031 — 22/05/2027 | Finalizar e comparar projetos\n**FAZ ISTO:** Conclui projeto 2 e avalia qual tema gostaste mais de pesquisar e escrever.\n**OPÇÕES / ALTERNATIVAS:** Avalia motivação, dificuldade com números, relevância e oportunidades.\n**PROVA DE CONCLUSÃO:** Projeto 2 final e tabela comparativa.\n\n### Semana 032 — 29/05/2027 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2027-06 — 4 missões\n### Semana 033 — 05/06/2027 | Avaliar o inglês\n**FAZ ISTO:** Faz teste de nível e amostras de escrita e fala; compara com dezembro de 2026.\n**OPÇÕES / ALTERNATIVAS:** Usa teste de nivelamento reconhecido para diagnóstico, não o chames certificado oficial.\n**PROVA DE CONCLUSÃO:** Resultados e amostras guardadas.\n\n### Semana 034 — 12/06/2027 | Avaliar mandarim\n**FAZ ISTO:** Faz teste de vocabulário, pinyin e compreensão das lições concluídas.\n**OPÇÕES / ALTERNATIVAS:** Considera HSK 1 apenas se o conteúdo e formato oficial vigente forem compatíveis.\n**PROVA DE CONCLUSÃO:** Relatório de pontos fortes e fracos.\n\n### Semana 035 — 19/06/2027 | Decidir área principal provisória\n**FAZ ISTO:** Atribui notas 0–10 a interesse, empregabilidade, requisitos, matemática e compatibilidade com RI para cada área.\n**OPÇÕES / ALTERNATIVAS:** Se empatarem, mantém duas áreas e define investigação adicional.\n**PROVA DE CONCLUSÃO:** Tabela de decisão assinada e datada.\n\n### Semana 036 — 26/06/2027 | Desenhar projeto aprofundado\n**FAZ ISTO:** Escolhe o melhor dos projetos 1 e 2 para aprofundar no segundo semestre; escreve objetivo, método e calendário.\n**OPÇÕES / ALTERNATIVAS:** Não é obrigatório que o tema seja China–Moçambique.\n**PROVA DE CONCLUSÃO:** Proposta de duas páginas.\n\n## 2027-07 — 5 missões\n### Semana 037 — 03/07/2027 | Procurar orientador informal\n**FAZ ISTO:** Escolhe docente cuja disciplina combine com o tema e escreve mensagem curta pedindo 15 minutos de orientação.\n**OPÇÕES / ALTERNATIVAS:** Se não houver resposta, tenta outro docente ou tutor de escrita académica.\n**PROVA DE CONCLUSÃO:** Mensagem enviada e feedback, se obtido.\n\n### Semana 038 — 10/07/2027 | Construir bibliografia ampliada\n**FAZ ISTO:** Reúne seis a oito fontes relevantes e faz ficha de cada uma: argumento, método, utilidade.\n**OPÇÕES / ALTERNATIVAS:** Google Scholar, repositórios universitários, revistas e documentos institucionais.\n**PROVA DE CONCLUSÃO:** Seis fichas de leitura.\n\n### Semana 039 — 17/07/2027 | Escrever introdução e enquadramento\n**FAZ ISTO:** Produz 2–3 páginas com problema, relevância e conceitos, citando fontes.\n**OPÇÕES / ALTERNATIVAS:** Usa estrutura de trabalhos da tua faculdade.\n**PROVA DE CONCLUSÃO:** Introdução e enquadramento escritos.\n\n### Semana 040 — 24/07/2027 | Rever pergunta e método\n**FAZ ISTO:** Verifica se a pergunta pode ser respondida com fontes e tempo disponíveis; simplifica se necessário.\n**OPÇÕES / ALTERNATIVAS:** Se dados faltarem, transforma em análise documental.\n**PROVA DE CONCLUSÃO:** Pergunta e método revistos.\n\n### Semana 041 — 31/07/2027 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2027-08 — 4 missões\n### Semana 042 — 07/08/2027 | Escrever análise principal\n**FAZ ISTO:** Produz duas páginas com evidências e interpretação, separando factos de opinião.\n**OPÇÕES / ALTERNATIVAS:** Usa tabelas simples apenas se ajudarem; não precisas de estatística avançada.\n**PROVA DE CONCLUSÃO:** Duas páginas de análise.\n\n### Semana 043 — 14/08/2027 | Escrever conclusão e limitações\n**FAZ ISTO:** Responde à pergunta, reconhece o que não conseguiste provar e sugere pesquisa futura.\n**OPÇÕES / ALTERNATIVAS:** Evita conclusões que ultrapassem os dados.\n**PROVA DE CONCLUSÃO:** Conclusão e limitações.\n\n### Semana 044 — 21/08/2027 | Pedir revisão\n**FAZ ISTO:** Envia trabalho de 8–12 páginas a docente ou colega com três perguntas específicas sobre clareza e método.\n**OPÇÕES / ALTERNATIVAS:** Se ninguém puder rever, usa grelha de avaliação da faculdade.\n**PROVA DE CONCLUSÃO:** Comentários recebidos ou grelha preenchida.\n\n### Semana 045 — 28/08/2027 | Preparar apresentação curta\n**FAZ ISTO:** Cria cinco diapositivos: pergunta, método, fontes, resultados e conclusão; ensaia cinco minutos.\n**OPÇÕES / ALTERNATIVAS:** Podes apresentar a colegas mesmo sem conferência.\n**PROVA DE CONCLUSÃO:** Slides e gravação de ensaio.\n\n## 2027-09 — 4 missões\n### Semana 046 — 04/09/2027 | Apresentar o trabalho\n**FAZ ISTO:** Procura seminário estudantil; se não houver, apresenta a três colegas e recolhe perguntas.\n**OPÇÕES / ALTERNATIVAS:** Jornada científica, reunião de grupo de RI ou sessão informal orientada.\n**PROVA DE CONCLUSÃO:** Slides, data e feedback documentado.\n\n### Semana 047 — 11/09/2027 | Escolher experiência de liderança\n**FAZ ISTO:** Seleciona uma atividade com responsabilidade: organizar debate, orientar colegas ou voluntariado educativo.\n**OPÇÕES / ALTERNATIVAS:** Evita inscrever-te em muitas organizações ao mesmo tempo.\n**PROVA DE CONCLUSÃO:** Plano de atividade com objetivo e participantes.\n\n### Semana 048 — 18/09/2027 | Convidar participantes\n**FAZ ISTO:** Fala com 2–4 colegas, define público, local, data e divisão de tarefas.\n**OPÇÕES / ALTERNATIVAS:** Alternativa: sessão online de 30 minutos com autorização dos envolvidos.\n**PROVA DE CONCLUSÃO:** Convite e plano de execução.\n\n### Semana 049 — 25/09/2027 | Executar primeira sessão\n**FAZ ISTO:** Realiza debate, workshop ou apoio educativo; regista participantes sem expor dados pessoais.\n**OPÇÕES / ALTERNATIVAS:** Exemplos: debate sobre União Africana, oficina de CV, introdução a ferramentas digitais.\n**PROVA DE CONCLUSÃO:** Ata de sessão e material utilizado.\n\n## 2027-10 — 5 missões\n### Semana 050 — 02/10/2027 | Escolher caso real do negócio\n**FAZ ISTO:** Seleciona uma campanha ou produto com dados completos e sem informação identificável de clientes.\n**OPÇÕES / ALTERNATIVAS:** Pode ser anúncio com baixo desempenho e melhorias, não precisa ser sucesso.\n**PROVA DE CONCLUSÃO:** Descrição do problema e métricas disponíveis.\n\n### Semana 051 — 09/10/2027 | Organizar dados do caso\n**FAZ ISTO:** Regista período, orçamento, visitas, pedidos, vendas e custos quando disponíveis; assinala dados ausentes.\n**OPÇÕES / ALTERNATIVAS:** Se não tiveres números confiáveis, descreve processo e decisões sem inventar métricas.\n**PROVA DE CONCLUSÃO:** Tabela de evidências.\n\n### Semana 052 — 16/10/2027 | Analisar decisões\n**FAZ ISTO:** Explica hipóteses, mudanças realizadas e resultados observados; distingue correlação de causalidade.\n**OPÇÕES / ALTERNATIVAS:** Exemplo: testar duas headlines ou mudar página de produto.\n**PROVA DE CONCLUSÃO:** Relatório de 2–3 páginas.\n\n### Semana 053 — 23/10/2027 | Concluir estudo de caso\n**FAZ ISTO:** Resume competências demonstradas: comunicação, planeamento, aprendizagem e gestão.\n**OPÇÕES / ALTERNATIVAS:** Retira dados comerciais confidenciais antes de partilhar.\n**PROVA DE CONCLUSÃO:** Estudo de caso final em PDF.\n\n### Semana 054 — 30/10/2027 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2027-11 — 4 missões\n### Semana 055 — 06/11/2027 | Pesquisar três bolsas concretas\n**FAZ ISTO:** Consulta páginas oficiais de CSC e bolsas universitárias; regista condições do edital vigente.\n**OPÇÕES / ALTERNATIVAS:** Não assumes que estarão disponíveis em 2029.\n**PROVA DE CONCLUSÃO:** Tabela de três opções com links e datas.\n\n### Semana 056 — 13/11/2027 | Verificar compatibilidade académica\n**FAZ ISTO:** Para cinco programas, anota se aceitam licenciatura em RI e requisitos de notas/idioma.\n**OPÇÕES / ALTERNATIVAS:** Escreve «a confirmar» quando o site não for claro.\n**PROVA DE CONCLUSÃO:** Matriz de elegibilidade preliminar.\n\n### Semana 057 — 20/11/2027 | Fazer revisão do CV\n**FAZ ISTO:** Acrescenta projeto, participação e estudo de caso apenas se concluídos; melhora descrições com verbos e resultados.\n**OPÇÕES / ALTERNATIVAS:** Pede a um docente ou colega revisão da clareza.\n**PROVA DE CONCLUSÃO:** CV versão 2.\n\n### Semana 058 — 27/11/2027 | Definir lacunas prioritárias\n**FAZ ISTO:** Escolhe três lacunas reais: idioma, notas, investigação, liderança ou requisitos específicos.\n**OPÇÕES / ALTERNATIVAS:** Não escolhas mais de três para o próximo trimestre.\n**PROVA DE CONCLUSÃO:** Plano de correção com prioridades.\n\n## 2027-12 — 4 missões\n### Semana 059 — 04/12/2027 | Rever notas do ano\n**FAZ ISTO:** Calcula média apenas com notas disponíveis; regista evolução e disciplinas fortes.\n**OPÇÕES / ALTERNATIVAS:** Se o ano ainda não terminou, marca resultados pendentes.\n**PROVA DE CONCLUSÃO:** Ficha académica atualizada.\n\n### Semana 060 — 11/12/2027 | Reavaliar inglês e mandarim\n**FAZ ISTO:** Faz prova diagnóstica, grava fala e compara com amostras anteriores.\n**OPÇÕES / ALTERNATIVAS:** HSK 2 só se o nível e formato atual permitirem.\n**PROVA DE CONCLUSÃO:** Relatório linguístico anual.\n\n### Semana 061 — 18/12/2027 | Auditar portefólio\n**FAZ ISTO:** Verifica se tens CV, dois projetos, atividade documentada e estudo de caso; identifica o que falta.\n**OPÇÕES / ALTERNATIVAS:** Não assinales como concluído o que ainda é só plano.\n**PROVA DE CONCLUSÃO:** Checklist de evidências.\n\n### Semana 062 — 25/12/2027 | Planear 2028\n**FAZ ISTO:** Escolhe cinco programas prioritários provisórios e estabelece cronograma de IELTS e documentos.\n**OPÇÕES / ALTERNATIVAS:** Ajusta datas às avaliações universitárias.\n**PROVA DE CONCLUSÃO:** Plano trimestral de 2028.\n\n## 2028-01 — 5 missões\n### Semana 063 — 01/01/2028 | Diagnosticar IELTS\n**FAZ ISTO:** Faz um simulado diagnóstico com listening, reading, writing e speaking; anota pontuação estimada por competência.\n**OPÇÕES / ALTERNATIVAS:** Usa materiais oficiais de preparação quando possível.\n**PROVA DE CONCLUSÃO:** Tabela de resultados por competência.\n\n### Semana 064 — 08/01/2028 | Criar plano de preparação\n**FAZ ISTO:** Escolhe duas competências mais fracas e distribui exercícios dentro da hora diária de inglês.\n**OPÇÕES / ALTERNATIVAS:** Não acrescentes uma segunda hora automaticamente.\n**PROVA DE CONCLUSÃO:** Plano de quatro semanas.\n\n### Semana 065 — 15/01/2028 | Treinar writing académico\n**FAZ ISTO:** Escreve uma resposta tipo IELTS, compara com critérios oficiais e reescreve.\n**OPÇÕES / ALTERNATIVAS:** Se o programa aceitar outro exame, adapta a preparação.\n**PROVA DE CONCLUSÃO:** Texto inicial e corrigido.\n\n### Semana 066 — 22/01/2028 | Treinar speaking\n**FAZ ISTO:** Grava duas respostas de 2 minutos e avalia fluência, vocabulário e organização.\n**OPÇÕES / ALTERNATIVAS:** Pede feedback a professor/parceiro quando possível.\n**PROVA DE CONCLUSÃO:** Duas gravações e lista de erros.\n\n### Semana 067 — 29/01/2028 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2028-02 — 4 missões\n### Semana 068 — 05/02/2028 | Fazer simulado IELTS 2\n**FAZ ISTO:** Executa simulado cronometrado e compara com janeiro.\n**OPÇÕES / ALTERNATIVAS:** Se não houver tempo para quatro competências no mesmo dia, divide sem alterar tempo total de cada secção.\n**PROVA DE CONCLUSÃO:** Resultados comparativos.\n\n### Semana 069 — 12/02/2028 | Pesquisar provas aceites\n**FAZ ISTO:** Abre páginas oficiais de cinco programas e anota IELTS, TOEFL, Duolingo ou alternativas efetivamente aceites.\n**OPÇÕES / ALTERNATIVAS:** Não assumes equivalência sem confirmação.\n**PROVA DE CONCLUSÃO:** Matriz de exames aceites.\n\n### Semana 070 — 19/02/2028 | Verificar validade de certificados\n**FAZ ISTO:** Anota prazos de validade e requisitos dos programas, incluindo emissão do resultado antes da candidatura.\n**OPÇÕES / ALTERNATIVAS:** Se houver dúvidas, envia e-mail ao departamento de admissões.\n**PROVA DE CONCLUSÃO:** Calendário de exame e validade.\n\n### Semana 071 — 26/02/2028 | Rever estratégia linguística\n**FAZ ISTO:** Decide se manténs meta IELTS 6.5 ou outra meta alinhada com requisitos concretos.\n**OPÇÕES / ALTERNATIVAS:** Se resultado atual for distante, planeia exame para mais tarde.\n**PROVA DE CONCLUSÃO:** Meta justificada e plano revisto.\n\n## 2028-03 — 4 missões\n### Semana 072 — 04/03/2028 | Fazer simulado IELTS 3\n**FAZ ISTO:** Repete prova e identifica padrão de erros mais frequentes.\n**OPÇÕES / ALTERNATIVAS:** Usa uma lista de 10 erros para rever durante o mês.\n**PROVA DE CONCLUSÃO:** Tabela de erros e notas.\n\n### Semana 073 — 11/03/2028 | Verificar progresso de mandarim\n**FAZ ISTO:** Avalia se mandarim continua sustentável e se algum curso escolhido exige HSK.\n**OPÇÕES / ALTERNATIVAS:** Se programas forem em inglês, mandarim é diferencial, não obrigação automática.\n**PROVA DE CONCLUSÃO:** Decisão sobre prioridade do mandarim.\n\n### Semana 074 — 18/03/2028 | Escolher data provável de exame\n**FAZ ISTO:** Consulta centro autorizado e datas disponíveis; compara com provas da faculdade.\n**OPÇÕES / ALTERNATIVAS:** Não pagues inscrição antes de confirmar preparação e necessidade.\n**PROVA DE CONCLUSÃO:** Janela provável e orçamento.\n\n### Semana 075 — 25/03/2028 | Pedir revisão de redação\n**FAZ ISTO:** Envia uma redação a professor/tutor e aplica comentários.\n**OPÇÕES / ALTERNATIVAS:** Se não houver revisor, usa critérios oficiais e marca limitações da autoavaliação.\n**PROVA DE CONCLUSÃO:** Redação antes/depois.\n\n## 2028-04 — 5 missões\n### Semana 076 — 01/04/2028 | Expandir lista para dez programas\n**FAZ ISTO:** Procura dez programas em universidades chinesas com cursos compatíveis com RI ou área escolhida.\n**OPÇÕES / ALTERNATIVAS:** Inclui universidades de diferentes níveis de seletividade e cidades.\n**PROVA DE CONCLUSÃO:** Tabela com dez links oficiais.\n\n### Semana 077 — 08/04/2028 | Registar requisitos por programa\n**FAZ ISTO:** Anota formação, notas, idioma, exames, proposta de estudos, recomendações e eventuais orientadores.\n**OPÇÕES / ALTERNATIVAS:** Escreve ano da informação consultada.\n**PROVA DE CONCLUSÃO:** Matriz de requisitos completa.\n\n### Semana 078 — 15/04/2028 | Comparar bolsas e custos\n**FAZ ISTO:** Para cada programa, regista cobertura de propinas, alojamento, seguro, bolsa mensal e custos não cobertos.\n**OPÇÕES / ALTERNATIVAS:** Não chames «integral» a bolsa que só cobre propinas.\n**PROVA DE CONCLUSÃO:** Tabela de financiamento.\n\n### Semana 079 — 22/04/2028 | Avaliar estilo de vida\n**FAZ ISTO:** Pesquisa alojamento, clima, localização, clubes, calendário académico e oportunidades de convívio de cinco universidades.\n**OPÇÕES / ALTERNATIVAS:** Usa páginas oficiais e testemunhos apenas como complemento.\n**PROVA DE CONCLUSÃO:** Ranking pessoal com critérios explícitos.\n\n### Semana 080 — 29/04/2028 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2028-05 — 4 missões\n### Semana 081 — 06/05/2028 | Fazer simulado IELTS 4\n**FAZ ISTO:** Executa simulado completo e compara evolução desde janeiro.\n**OPÇÕES / ALTERNATIVAS:** Se a meta estiver próxima, considera inscrição; senão mantém treino.\n**PROVA DE CONCLUSÃO:** Histórico de quatro simulados.\n\n### Semana 082 — 13/05/2028 | Reduzir lista a oito programas\n**FAZ ISTO:** Elimina programas incompatíveis com licenciatura, idioma ou financiamento.\n**OPÇÕES / ALTERNATIVAS:** Mantém alternativas em diferentes cidades.\n**PROVA DE CONCLUSÃO:** Lista de oito com justificativa.\n\n### Semana 083 — 20/05/2028 | Confirmar dúvidas de admissão\n**FAZ ISTO:** Escreve três perguntas objetivas para departamentos sobre elegibilidade, idioma e documentação provisória.\n**OPÇÕES / ALTERNATIVAS:** Usa formulário ou e-mail oficial.\n**PROVA DE CONCLUSÃO:** Mensagens enviadas e respostas guardadas.\n\n### Semana 084 — 27/05/2028 | Criar orçamento de candidatura\n**FAZ ISTO:** Estima custo de teste de idioma, traduções, autenticações, exames e passaporte.\n**OPÇÕES / ALTERNATIVAS:** Regista preços como estimativas a confirmar localmente.\n**PROVA DE CONCLUSÃO:** Orçamento em meticais com fontes.\n\n## 2028-06 — 4 missões\n### Semana 085 — 03/06/2028 | Decidir inscrição IELTS\n**FAZ ISTO:** Compara simulados com requisitos reais; inscreve-te se estiveres preparado e o exame for necessário.\n**OPÇÕES / ALTERNATIVAS:** Se não estiveres, marca nova janela realista.\n**PROVA DE CONCLUSÃO:** Comprovativo de inscrição ou decisão documentada.\n\n### Semana 086 — 10/06/2028 | Rever desempenho universitário\n**FAZ ISTO:** Pede histórico atualizado e verifica disciplinas pendentes e data provável de conclusão.\n**OPÇÕES / ALTERNATIVAS:** Pergunta à secretaria sobre declaração provisória de conclusão.\n**PROVA DE CONCLUSÃO:** Calendário académico documentado.\n\n### Semana 087 — 17/06/2028 | Atualizar projeto académico\n**FAZ ISTO:** Escolhe melhor trabalho, incorpora comentários e prepara resumo de 250 palavras em inglês.\n**OPÇÕES / ALTERNATIVAS:** Se ainda não houver trabalho sólido, prioriza qualidade antes de apresentar.\n**PROVA DE CONCLUSÃO:** Resumo e versão revista.\n\n### Semana 088 — 24/06/2028 | Rever viabilidade 2029\n**FAZ ISTO:** Compara data de conclusão da licenciatura com editais de referência e prazos estimados.\n**OPÇÕES / ALTERNATIVAS:** Se houver risco de atraso, prepara plano 2030 sem abandonar 2029.\n**PROVA DE CONCLUSÃO:** Matriz de riscos e plano alternativo.\n\n## 2028-07 — 5 missões\n### Semana 089 — 01/07/2028 | Escrever CV académico em inglês\n**FAZ ISTO:** Traduz e adapta CV com datas, experiências e resultados comprováveis; pede revisão linguística.\n**OPÇÕES / ALTERNATIVAS:** Usa uma ou duas páginas conforme normas dos programas.\n**PROVA DE CONCLUSÃO:** CV em inglês v3.\n\n### Semana 090 — 08/07/2028 | Escrever plano de estudos v1\n**FAZ ISTO:** Produz 600–900 palavras: formação, interesse académico, motivo da China, objetivos e plano futuro.\n**OPÇÕES / ALTERNATIVAS:** Não inventes professor ou projeto; adapta depois a cada curso.\n**PROVA DE CONCLUSÃO:** Plano de estudos v1.\n\n### Semana 091 — 15/07/2028 | Preparar carta de motivação v1\n**FAZ ISTO:** Explica três experiências reais e o que aprendeste; evita frases genéricas sobre amar a China.\n**OPÇÕES / ALTERNATIVAS:** Usa um exemplo de RI, um de projeto e um de iniciativa.\n**PROVA DE CONCLUSÃO:** Carta v1.\n\n### Semana 092 — 22/07/2028 | Rever documentos com terceiros\n**FAZ ISTO:** Pede a docente ou pessoa experiente comentários sobre CV e plano de estudos.\n**OPÇÕES / ALTERNATIVAS:** Se não houver resposta, faz revisão estruturada com critérios de clareza e evidências.\n**PROVA DE CONCLUSÃO:** Versões comentadas ou grelha de revisão.\n\n### Semana 093 — 29/07/2028 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2028-08 — 4 missões\n### Semana 094 — 05/08/2028 | Identificar dois recomendadores\n**FAZ ISTO:** Escolhe docentes que conheçam trabalho e desempenho; prepara resumo de notas, projetos e objetivos.\n**OPÇÕES / ALTERNATIVAS:** Não peças recomendação a quem não te conhece academicamente.\n**PROVA DE CONCLUSÃO:** Lista de dois docentes e dossier de apoio.\n\n### Semana 095 — 12/08/2028 | Pedir disponibilidade para recomendar\n**FAZ ISTO:** Contacta docentes com antecedência e pergunta se poderão escrever cartas quando o edital abrir.\n**OPÇÕES / ALTERNATIVAS:** Se recusarem, procura docente alternativo.\n**PROVA DE CONCLUSÃO:** Confirmação ou resposta documentada.\n\n### Semana 096 — 19/08/2028 | Verificar passaporte e identificação\n**FAZ ISTO:** Confirma validade do passaporte e documentos necessários para candidatura internacional.\n**OPÇÕES / ALTERNATIVAS:** Se estiver a expirar, informa-te sobre renovação.\n**PROVA DE CONCLUSÃO:** Checklist documental atualizada.\n\n### Semana 097 — 26/08/2028 | Pesquisar tradução/autenticação\n**FAZ ISTO:** Pergunta à secretaria e às fontes oficiais quais documentos exigem tradução ou certificação.\n**OPÇÕES / ALTERNATIVAS:** Não pagues serviços antes de saber o que cada programa pede.\n**PROVA DE CONCLUSÃO:** Lista de documentos e procedimentos.\n\n## 2028-09 — 5 missões\n### Semana 098 — 02/09/2028 | Escolher cinco programas prioritários\n**FAZ ISTO:** Classifica por compatibilidade, financiamento, curso, cidade e chances relativas sem inventar probabilidades.\n**OPÇÕES / ALTERNATIVAS:** Mantém três opções reserva.\n**PROVA DE CONCLUSÃO:** Ranking fundamentado de cinco + três.\n\n### Semana 099 — 09/09/2028 | Verificar pré-admissão\n**FAZ ISTO:** Lê as instruções atuais de cada universidade sobre candidatura e carta de pré-admissão.\n**OPÇÕES / ALTERNATIVAS:** Se a informação for ambígua, envia e-mail.\n**PROVA DE CONCLUSÃO:** Quadro de pré-admissão por programa.\n\n### Semana 100 — 16/09/2028 | Contactar departamento de admissão\n**FAZ ISTO:** Envia e-mail objetivo para dois programas prioritários sobre documentos e formação em RI.\n**OPÇÕES / ALTERNATIVAS:** Não envies e-mails genéricos em massa.\n**PROVA DE CONCLUSÃO:** Dois e-mails e respostas registadas.\n\n### Semana 101 — 23/09/2028 | Personalizar plano de estudos\n**FAZ ISTO:** Adapta objetivo e módulos pretendidos a dois programas, usando currículos oficiais.\n**OPÇÕES / ALTERNATIVAS:** Não cites docente específico sem verificar investigação atual.\n**PROVA DE CONCLUSÃO:** Duas versões do plano de estudos.\n\n### Semana 102 — 30/09/2028 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2028-10 — 4 missões\n### Semana 103 — 07/10/2028 | Rever editais publicados\n**FAZ ISTO:** Verifica Campus China, embaixada e páginas oficiais das universidades para editais recentes.\n**OPÇÕES / ALTERNATIVAS:** Se 2029 ainda não estiver publicado, marca calendário de nova verificação.\n**PROVA DE CONCLUSÃO:** Registo datado de fontes.\n\n### Semana 104 — 14/10/2028 | Preparar documentos académicos\n**FAZ ISTO:** Pede histórico, declaração de frequência/conclusão ou diploma conforme disponibilidade.\n**OPÇÕES / ALTERNATIVAS:** Confirma na secretaria prazos e formatos.\n**PROVA DE CONCLUSÃO:** Documentos obtidos ou protocolos de pedido.\n\n### Semana 105 — 21/10/2028 | Confirmar recomendações\n**FAZ ISTO:** Informa recomendadores dos programas, prazos prováveis e materiais de apoio.\n**OPÇÕES / ALTERNATIVAS:** Não escrevas cartas em nome deles sem acordo explícito.\n**PROVA DE CONCLUSÃO:** Lista de contactos e prazos.\n\n### Semana 106 — 28/10/2028 | Revisar prova de idioma\n**FAZ ISTO:** Confirma que resultado de IELTS ou equivalente cumpre requisitos dos programas escolhidos.\n**OPÇÕES / ALTERNATIVAS:** Se não cumprir, prioriza opções elegíveis e eventual nova prova.\n**PROVA DE CONCLUSÃO:** Tabela de compatibilidade linguística.\n\n## 2028-11 — 4 missões\n### Semana 107 — 04/11/2028 | Montar dossier do programa 1\n**FAZ ISTO:** Cria pasta com requisitos e documentos específicos, marcando pendências.\n**OPÇÕES / ALTERNATIVAS:** Começa pelo programa com prazo mais próximo confirmado.\n**PROVA DE CONCLUSÃO:** Checklist programa 1.\n\n### Semana 108 — 11/11/2028 | Montar dossier do programa 2\n**FAZ ISTO:** Repete processo, adaptando plano de estudos e nome correto do curso.\n**OPÇÕES / ALTERNATIVAS:** Confere limite de páginas e idioma.\n**PROVA DE CONCLUSÃO:** Checklist programa 2.\n\n### Semana 109 — 18/11/2028 | Montar dossiers dos restantes\n**FAZ ISTO:** Prepara documentos e cartas para os outros programas prioritários.\n**OPÇÕES / ALTERNATIVAS:** Mantém versões distintas, sem trocar nomes de universidades.\n**PROVA DE CONCLUSÃO:** Cinco pastas de candidatura.\n\n### Semana 110 — 25/11/2028 | Fazer revisão de conformidade\n**FAZ ISTO:** Verifica nomes, datas, documentos, assinaturas, traduções e formatos de ficheiro.\n**OPÇÕES / ALTERNATIVAS:** Pede revisão de uma segunda pessoa se possível.\n**PROVA DE CONCLUSÃO:** Lista de erros corrigidos.\n\n## 2028-12 — 5 missões\n### Semana 111 — 02/12/2028 | Confirmar calendário oficial\n**FAZ ISTO:** Atualiza datas e vias de submissão de cada bolsa para 2029, quando disponíveis.\n**OPÇÕES / ALTERNATIVAS:** Se edital não saiu, regista próxima data de verificação.\n**PROVA DE CONCLUSÃO:** Calendário de candidaturas com fontes.\n\n### Semana 112 — 09/12/2028 | Confirmar elegibilidade moçambicana\n**FAZ ISTO:** Lê requisitos de nacionalidade, formação, idade, idioma e modalidade de candidatura.\n**OPÇÕES / ALTERNATIVAS:** Contacta a instituição quando não houver informação clara.\n**PROVA DE CONCLUSÃO:** Matriz elegível / dúvida / não elegível.\n\n### Semana 113 — 16/12/2028 | Obter pré-admissões necessárias\n**FAZ ISTO:** Segue o procedimento oficial dos programas que exigirem documento de pré-admissão.\n**OPÇÕES / ALTERNATIVAS:** Não presumas que todas as universidades usam o mesmo processo.\n**PROVA DE CONCLUSÃO:** Pedidos submetidos ou documentos recebidos.\n\n### Semana 114 — 23/12/2028 | Simular candidatura completa\n**FAZ ISTO:** Preenche checklist de uma candidatura sem submeter; verifica anexos e respostas.\n**OPÇÕES / ALTERNATIVAS:** Usa cópia offline das perguntas quando permitido.\n**PROVA DE CONCLUSÃO:** Checklist de prontidão final.\n\n### Semana 115 — 30/12/2028 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2029-01 — 4 missões\n### Semana 116 — 06/01/2029 | Verificar editais da semana\n**FAZ ISTO:** Consulta portais oficiais de bolsas e universidades da lista; anota alterações e prazos.\n**OPÇÕES / ALTERNATIVAS:** Se ainda não abriram, agenda verificação semanal, sem criar submissão fictícia.\n**PROVA DE CONCLUSÃO:** Registo datado de editais.\n\n### Semana 117 — 13/01/2029 | Submeter primeira candidatura elegível\n**FAZ ISTO:** Revisa documentos, personaliza plano e submete no portal oficial se a janela estiver aberta.\n**OPÇÕES / ALTERNATIVAS:** Se não estiver aberta, conclui dossier pronto para envio.\n**PROVA DE CONCLUSÃO:** Comprovativo ou dossier pronto.\n\n### Semana 118 — 20/01/2029 | Submeter segunda candidatura elegível\n**FAZ ISTO:** Repete com requisitos específicos; verifica pré-admissão e cartas.\n**OPÇÕES / ALTERNATIVAS:** Não uses documento do curso errado.\n**PROVA DE CONCLUSÃO:** Comprovativo ou dossier pronto.\n\n### Semana 119 — 27/01/2029 | Atualizar rastreador de candidaturas\n**FAZ ISTO:** Regista programa, bolsa, prazo, data de submissão, ID e documentos pendentes.\n**OPÇÕES / ALTERNATIVAS:** Guarda IDs de candidatura em local privado.\n**PROVA DE CONCLUSÃO:** Tabela de acompanhamento atualizada.\n\n## 2029-02 — 4 missões\n### Semana 120 — 03/02/2029 | Verificar prazos ainda abertos\n**FAZ ISTO:** Consulta todas as opções restantes e elimina as que não são elegíveis.\n**OPÇÕES / ALTERNATIVAS:** Prioriza candidaturas com prazo confirmado mais próximo.\n**PROVA DE CONCLUSÃO:** Lista de oportunidades ativas.\n\n### Semana 121 — 10/02/2029 | Submeter candidatura prioritária 3\n**FAZ ISTO:** Confere elegibilidade e anexos e envia se janela estiver aberta.\n**OPÇÕES / ALTERNATIVAS:** Se não, prepara dossier alternativo.\n**PROVA DE CONCLUSÃO:** Comprovativo ou checklist final.\n\n### Semana 122 — 17/02/2029 | Submeter candidatura prioritária 4\n**FAZ ISTO:** Personaliza documentos e envia segundo regras do programa.\n**OPÇÕES / ALTERNATIVAS:** Se houver limite de candidaturas por via, respeita-o.\n**PROVA DE CONCLUSÃO:** Comprovativo ou checklist final.\n\n### Semana 123 — 24/02/2029 | Confirmar receção das candidaturas\n**FAZ ISTO:** Verifica e-mails e portais para mensagens de confirmação e pedidos de correção.\n**OPÇÕES / ALTERNATIVAS:** Não assumes submissão concluída só porque carregaste ficheiros.\n**PROVA DE CONCLUSÃO:** Estado atualizado de cada processo.\n\n## 2029-03 — 5 missões\n### Semana 124 — 03/03/2029 | Fechar candidaturas pendentes\n**FAZ ISTO:** Revisa últimas oportunidades elegíveis e prazos oficiais.\n**OPÇÕES / ALTERNATIVAS:** Não pagues taxas não verificadas nem uses intermediários suspeitos.\n**PROVA DE CONCLUSÃO:** Comprovativos finais.\n\n### Semana 125 — 10/03/2029 | Preparar entrevista académica\n**FAZ ISTO:** Escreve respostas sobre trajetória, interesse no curso, projeto e objetivos em Moçambique.\n**OPÇÕES / ALTERNATIVAS:** Ensaiar em inglês se programa exigir.\n**PROVA DE CONCLUSÃO:** Roteiro de 10 perguntas.\n\n### Semana 126 — 17/03/2029 | Fazer simulação de entrevista\n**FAZ ISTO:** Pede a amigo/docente para entrevistar durante 20 minutos; grava apenas com consentimento.\n**OPÇÕES / ALTERNATIVAS:** Se estiveres sozinho, grava respostas e autoavalia clareza.\n**PROVA DE CONCLUSÃO:** Feedback e respostas revistas.\n\n### Semana 127 — 24/03/2029 | Auditar submissões\n**FAZ ISTO:** Verifica se todas as candidaturas têm confirmação, documentos corretos e contactos.\n**OPÇÕES / ALTERNATIVAS:** Regista pendências sem inventar estado de aprovação.\n**PROVA DE CONCLUSÃO:** Rastreador final auditado.\n\n### Semana 128 — 31/03/2029 | Preparar plano alternativo 2030\n**FAZ ISTO:** Se licenciatura/documentos/bolsas forem incertos, define quais melhorias fazer caso precises de reaplicar.\n**OPÇÕES / ALTERNATIVAS:** Não abandones 2029 sem resultados oficiais.\n**PROVA DE CONCLUSÃO:** Plano de contingência de uma página.\n\n## 2029-04 — 4 missões\n### Semana 129 — 07/04/2029 | Acompanhar portais e e-mails\n**FAZ ISTO:** Consulta mensagens oficiais uma vez por semana; responde a pedidos dentro do prazo.\n**OPÇÕES / ALTERNATIVAS:** Guarda anexos e comprovativos de resposta.\n**PROVA DE CONCLUSÃO:** Registo de contactos.\n\n### Semana 130 — 14/04/2029 | Rever documentação complementar\n**FAZ ISTO:** Confere exames médicos, declarações ou formulários apenas se exigidos oficialmente.\n**OPÇÕES / ALTERNATIVAS:** Não faças exames desnecessários com muita antecedência.\n**PROVA DE CONCLUSÃO:** Checklist documental atualizada.\n\n### Semana 131 — 21/04/2029 | Praticar entrevista específica\n**FAZ ISTO:** Prepara explicação de 90 segundos do teu projeto e motivo do programa.\n**OPÇÕES / ALTERNATIVAS:** Usa curso escolhido, não um discurso genérico.\n**PROVA DE CONCLUSÃO:** Gravação de ensaio.\n\n### Semana 132 — 28/04/2029 | Atualizar orçamento de mudança\n**FAZ ISTO:** Lista custos possíveis não cobertos: passaporte, visto, deslocação, cauções e primeiros dias.\n**OPÇÕES / ALTERNATIVAS:** Confirma valores atuais antes de qualquer pagamento.\n**PROVA DE CONCLUSÃO:** Orçamento de chegada.\n\n## 2029-05 — 4 missões\n### Semana 133 — 05/05/2029 | Rever resultados oficiais\n**FAZ ISTO:** Verifica estado de cada candidatura e regista apenas decisões comunicadas oficialmente.\n**OPÇÕES / ALTERNATIVAS:** Se não houver resposta, mantém «pendente».\n**PROVA DE CONCLUSÃO:** Rastreador atualizado.\n\n### Semana 134 — 12/05/2029 | Responder a pedidos adicionais\n**FAZ ISTO:** Reúne e envia documentos complementares solicitados por canais oficiais.\n**OPÇÕES / ALTERNATIVAS:** Verifica autenticidade de pedidos antes de partilhar dados.\n**PROVA DE CONCLUSÃO:** Comprovativos de envio.\n\n### Semana 135 — 19/05/2029 | Comparar ofertas recebidas\n**FAZ ISTO:** Se houver ofertas, compara cobertura, curso, cidade, alojamento e condições.\n**OPÇÕES / ALTERNATIVAS:** Não aceites oferta sem ler condições.\n**PROVA DE CONCLUSÃO:** Tabela de ofertas ou estado pendente.\n\n### Semana 136 — 26/05/2029 | Preparar perguntas sobre admissão\n**FAZ ISTO:** Escreve dúvidas sobre chegada, alojamento, matrícula e seguro para universidades que responderem.\n**OPÇÕES / ALTERNATIVAS:** Usa contacto oficial de estudantes internacionais.\n**PROVA DE CONCLUSÃO:** Lista de perguntas e respostas.\n\n## 2029-06 — 5 missões\n### Semana 137 — 02/06/2029 | Confirmar situação académica\n**FAZ ISTO:** Obtém documento de conclusão ou previsão oficial, conforme exigido.\n**OPÇÕES / ALTERNATIVAS:** Se defesa atrasar, informa a universidade antes de prometer documento.\n**PROVA DE CONCLUSÃO:** Comprovativo académico atualizado.\n\n### Semana 138 — 09/06/2029 | Confirmar financiamento\n**FAZ ISTO:** Lê carta oficial de bolsa e identifica exatamente o que cobre e o que não cobre.\n**OPÇÕES / ALTERNATIVAS:** Não confundir pré-admissão com bolsa concedida.\n**PROVA DE CONCLUSÃO:** Ficha de financiamento.\n\n### Semana 139 — 16/06/2029 | Rever passaporte e visto\n**FAZ ISTO:** Consulta procedimentos oficiais de visto de estudante aplicáveis após admissão.\n**OPÇÕES / ALTERNATIVAS:** Não reserves viagem irreversível sem documentos necessários.\n**PROVA DE CONCLUSÃO:** Checklist de visto.\n\n### Semana 140 — 23/06/2029 | Planejar alternativa em caso de recusa\n**FAZ ISTO:** Se houver recusas, anota causas conhecidas e cursos/bolsas a rever para 2030.\n**OPÇÕES / ALTERNATIVAS:** Se ainda pendente, não concluas que foi recusado.\n**PROVA DE CONCLUSÃO:** Plano alternativo atualizado.\n\n### Semana 141 — 30/06/2029 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n\n## 2029-07 — 4 missões\n### Semana 142 — 07/07/2029 | Escolher oferta confirmada\n**FAZ ISTO:** Se tiveres mais de uma oferta válida, compara e decide dentro dos prazos.\n**OPÇÕES / ALTERNATIVAS:** Se não houver ofertas, continua a acompanhar resultados.\n**PROVA DE CONCLUSÃO:** Decisão e aceite oficial, se aplicável.\n\n### Semana 143 — 14/07/2029 | Preparar processo de visto\n**FAZ ISTO:** Reúne documentos oficiais solicitados para visto e marca atendimento quando aplicável.\n**OPÇÕES / ALTERNATIVAS:** Confirma tipo de visto e documentos nas fontes oficiais.\n**PROVA DE CONCLUSÃO:** Pedido ou checklist concluída.\n\n### Semana 144 — 21/07/2029 | Contactar alojamento universitário\n**FAZ ISTO:** Pergunta sobre reserva, regras, data de entrada e custos.\n**OPÇÕES / ALTERNATIVAS:** Não envies depósitos para contas não verificadas.\n**PROVA DE CONCLUSÃO:** Confirmação de alojamento ou resposta oficial.\n\n### Semana 145 — 28/07/2029 | Organizar viagem provisória\n**FAZ ISTO:** Pesquisa rotas, bagagem e chegada sem comprar antes da documentação necessária.\n**OPÇÕES / ALTERNATIVAS:** Prioriza data de matrícula e instruções da universidade.\n**PROVA DE CONCLUSÃO:** Plano de viagem com custos estimados.\n\n## 2029-08 — 4 missões\n### Semana 146 — 04/08/2029 | Confirmar visto e matrícula\n**FAZ ISTO:** Verifica visto emitido, datas de registo e documentos de entrada.\n**OPÇÕES / ALTERNATIVAS:** Se faltar visto, contacta os canais oficiais e evita viagens precipitadas.\n**PROVA DE CONCLUSÃO:** Checklist final validada.\n\n### Semana 147 — 11/08/2029 | Organizar documentação de viagem\n**FAZ ISTO:** Prepara cópias físicas e digitais seguras de passaporte, admissão, bolsa, seguro e contactos.\n**OPÇÕES / ALTERNATIVAS:** Guarda cópias em local protegido e não partilhes números publicamente.\n**PROVA DE CONCLUSÃO:** Pasta de viagem completa.\n\n### Semana 148 — 18/08/2029 | Preparar chegada e comunicação\n**FAZ ISTO:** Anota transporte aeroporto-campus, contacto da universidade, regras de chegada e comunicação com família.\n**OPÇÕES / ALTERNATIVAS:** Usa instruções oficiais de acolhimento internacional.\n**PROVA DE CONCLUSÃO:** Plano de chegada de uma página.\n\n### Semana 149 — 25/08/2029 | Preparar adaptação académica\n**FAZ ISTO:** Lê orientações sobre matrícula, aulas, bibliotecas, clubes e serviços de apoio.\n**OPÇÕES / ALTERNATIVAS:** Faz lista de duas atividades sociais que gostarias de experimentar.\n**PROVA DE CONCLUSÃO:** Checklist de primeira semana.\n\n## 2029-09 — 5 missões\n### Semana 150 — 01/09/2029 | Realizar chegada e registo\n**FAZ ISTO:** Se admitido e com visto, segue instruções oficiais de chegada, alojamento e matrícula.\n**OPÇÕES / ALTERNATIVAS:** Se entrada adiada, confirma nova data por escrito.\n**PROVA DE CONCLUSÃO:** Registo de chegada e matrícula.\n\n### Semana 151 — 08/09/2029 | Confirmar bolsa e serviços\n**FAZ ISTO:** Verifica procedimentos para subsídio, seguro, conta bancária e apoio estudantil.\n**OPÇÕES / ALTERNATIVAS:** Não assumes datas de pagamento; pergunta ao gabinete internacional.\n**PROVA DE CONCLUSÃO:** Checklist de serviços concluída.\n\n### Semana 152 — 15/09/2029 | Criar rotina inicial na China\n**FAZ ISTO:** Distribui aulas, inglês/mandarim, saúde, convívio e trabalho permitido segundo regras locais.\n**OPÇÕES / ALTERNATIVAS:** Participa numa atividade de integração e conhece colegas.\n**PROVA DE CONCLUSÃO:** Rotina das primeiras quatro semanas.\n\n### Semana 153 — 22/09/2029 | Avaliar primeira etapa\n**FAZ ISTO:** Escreve balanço de chegada, custos, adaptação e próximos objetivos académicos.\n**OPÇÕES / ALTERNATIVAS:** Se a viagem não ocorreu, documenta plano de reaplicação 2030.\n**PROVA DE CONCLUSÃO:** Relatório de encerramento da Rota 2029.\n\n### Semana 154 — 29/09/2029 | Semana de consolidação e recuperação\n**FAZ ISTO:** Verifica provas das missões deste mês, conclui a tarefa pendente mais importante e arquiva ficheiros com data; se tudo estiver pronto, revê um documento e corrige três falhas.\n**OPÇÕES / ALTERNATIVAS:** Se houver exames universitários, usa esta semana para manter apenas o essencial, sem adicionar tarefas novas.\n**PROVA DE CONCLUSÃO:** Checklist mensal e evidências arquivadas.\n";
