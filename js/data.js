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
      { time: '16h30–17h', name: 'Pré-tiro', desc: '2 bananas ou pão de trigo com pouca manteiga', note: 'Come 1h–1h30 antes — comida pesada causa enjoo nos tiros' },
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

/* áreas disponíveis para uma atividade — cor + rótulo */
const AREAS = {
  trabalho: { label: 'Trabalho', color: 'var(--slate, #3F6472)' },
  fitness: { label: 'Judo & Tiros', color: 'var(--cat-fit)' },
  linguas: { label: 'Línguas', color: 'var(--cat-lang)' },
  leitura: { label: 'Leitura', color: 'var(--warn)' },
  revisao: { label: 'Revisão', color: 'var(--warn)' },
  pessoal: { label: 'Cuidados pessoais', color: 'var(--accent)' },
  domestico: { label: 'Doméstico', color: 'var(--accent)' },
  outro: { label: 'Outro', color: 'var(--ink-faint)' },
};

/* Estado inicial (seed) — o utilizador pode editar/apagar/adicionar tudo isto dentro do app. */
function seedActivities() {
  var mk = function (area, title, detail, time) { return { area: area, title: title, detail: detail || '', time: time || '' }; };
  return {
    Segunda: [
      mk('trabalho', 'DROP — Espionagem', 'Ofertas vencedoras, produtos com potencial, levar criativos · importar produtos (remodelar fotos, copy, achar comentários)'),
      mk('fitness', 'Judo técnico', 'Kuzushi → tsukuri → kake, sem pressão de combate — foco na forma', '15h30'),
      mk('linguas', 'Inglês — Anki + gramática', 'Revisão dos cards + explicação curta e exercícios', '14h00'),
      mk('leitura', 'Leitura', ''),
    ],
    Terça: [
      mk('trabalho', 'DROP — Loja', 'Melhorar a credibilidade, aprimorar landpages para converter mais, trabalhar nas seções e abas'),
      mk('fitness', 'Tiros na areia', '6–10 tiros de 15–30m a 100%, descanso de 1–2min a caminhar', '18h00'),
      mk('linguas', 'Inglês — vocabulário, escrita, listening, speaking', ''),
      mk('linguas', 'Mandarim', ''),
      mk('revisao', 'Revisão da matéria', ''),
      mk('pessoal', 'Cuidados pessoais', ''),
      mk('domestico', 'Trabalhos domésticos', ''),
    ],
    Quarta: [
      mk('trabalho', 'DROP — Criativos', 'Criar novos ADS'),
      mk('fitness', 'Judo combate', 'Treino explosivo, com carga e luta de pegas', '15h30'),
      mk('linguas', 'Inglês — Anki + gramática', '', '14h00'),
      mk('leitura', 'Leitura', ''),
    ],
    Quinta: [
      mk('trabalho', 'DROP — Campanhas', 'Como estão as métricas, levantar teste de ADS, produto ou landingpage'),
      mk('fitness', 'Tiros na areia', '6–10 tiros de 15–30m a 100%', '18h00'),
      mk('linguas', 'Inglês — vocabulário, escrita, listening, speaking', ''),
      mk('linguas', 'Mandarim', ''),
      mk('revisao', 'Revisão da matéria', ''),
      mk('pessoal', 'Cuidados pessoais', ''),
      mk('domestico', 'Trabalhos domésticos', ''),
    ],
    Sexta: [
      mk('trabalho', 'DROP — Minerar & Aprender', 'Minerar e aprender coisas novas'),
      mk('fitness', 'Judo randori', 'Randori a 100%, sem hesitação', '15h00'),
      mk('linguas', 'Inglês — Anki + gramática', '', '14h00'),
      mk('leitura', 'Leitura', ''),
    ],
    Sábado: [
      mk('trabalho', 'DROP — Remarketing', 'Remarketing e pausar ADS'),
      mk('fitness', 'Descanso ativo', 'Caminhada de 30–45min, sem barra, 7–8h de sono'),
    ],
    Domingo: [
      mk('trabalho', 'DROP — Campanhas', 'Como estão as métricas, levantar teste de ADS, produto ou landingpage'),
      mk('linguas', 'Inglês — vocabulário, escrita, listening, speaking', ''),
      mk('linguas', 'Mandarim', ''),
      mk('revisao', 'Revisão da matéria', ''),
      mk('pessoal', 'Cuidados pessoais', ''),
      mk('fitness', 'Descanso ativo', 'Caminhada de 30–45min, sem barra, 7–8h de sono'),
    ],
  };
}

function seedActivitiesWithIds() {
  var data = seedActivities();
  WEEKDAYS.forEach(function (day) {
    (data[day] || []).forEach(function (act, i) {
      act.id = day + '-' + i;
    });
  });
  return data;
}

const DEFAULT_PROTOCOLO = {
  manifesto: 'Antes dos 22, ponho as bases em ordem para expandir o negócio e mudar de país. Os meus objetivos não são negociáveis — cada dia de foco e cada dia de restauração serve esse rumo.',
  metas: [
    { label: 'Vendas', value: '2/dia' },
    { label: 'Peso', value: '85 kg' },
    { label: 'Inglês', value: 'Imersão B1' },
  ],
};
