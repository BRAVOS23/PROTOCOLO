const test=require('node:test');const assert=require('node:assert/strict');
const {dayOrdinal,daysBetween,intervalProgress,aifScores}=require('../js/logic.js');
test('rejeita datas inválidas e intervalos invertidos sem produzir NaN',()=>{
 for(const date of ['',null,'2026-02-29','2026-13-01','2026-04-31','12/10/2026']) assert.equal(dayOrdinal(date),null);
 assert.equal(intervalProgress('2026-10-12','2026-10-01','2026-10-12').valid,false);
});
test('contagem inclusiva e progresso coerente no primeiro/último dia',()=>{
 assert.deepEqual([intervalProgress('2026-09-01','2026-11-29','2026-10-12').day,intervalProgress('2026-09-01','2026-11-29','2026-10-12').total],[42,90]);
 const start=intervalProgress('2026-10-01','2026-10-10','2026-10-01');assert.equal(start.day,1);assert.equal(start.percent,10);
 const end=intervalProgress('2026-10-01','2026-10-10','2026-10-10');assert.equal(end.day,10);assert.equal(end.remaining,0);assert.equal(end.percent,100);
});
test('períodos futuros, terminados e de um único dia',()=>{
 const future=intervalProgress('2026-10-15','2026-10-20','2026-10-12');assert.equal(future.day,0);assert.equal(future.status,'before');assert.equal(future.untilStart,3);
 const after=intervalProgress('2026-10-01','2026-10-05','2026-10-12');assert.equal(after.day,5);assert.equal(after.status,'after');assert.equal(after.percent,100);
 const single=intervalProgress('2026-10-12','2026-10-12','2026-10-12');assert.equal(single.total,1);assert.equal(single.percent,100);
});
test('Rota para a China mantém início de setembro e destino existente',()=>{
 const p=intervalProgress('2026-09-01','2028-12-01','2026-10-12');assert.equal(p.day,42);assert.equal(p.total,823);assert.equal(p.remaining,781);
});
test('dias civis atravessam mudanças de horário e anos bissextos',()=>{
 assert.equal(daysBetween('2026-03-07','2026-03-09'),2);assert.equal(daysBetween('2026-10-31','2026-11-02'),2);
 assert.equal(daysBetween('2028-02-28','2028-03-01'),2);assert.equal(daysBetween('2026-02-28','2026-03-01'),1);
});
test('categorias ausentes não penalizam um dia totalmente cumprido',()=>{
 const p=aifScores([{done:true,aif:'fidelidade'}]);assert.equal(p.total,100);assert.deepEqual(p.applicable,['f']);
 assert.equal(aifScores([]).total,0);
});
test('intensidade conta tarefas previstas, sem premiar só a primeira conclusão',()=>{
 const p=aifScores([{done:true,full:true,aif:'intensidade'},{done:false,full:false,aif:'intensidade'}]);assert.equal(p.i,50);assert.equal(p.f,50);assert.equal(p.total,50);
});
test('a chama só contribui quando a tarefa também está concluída',()=>{
 assert.equal(aifScores([{done:false,full:true,aif:'intensidade'}]).i,0);
 const p=aifScores([{done:true,full:true,aif:'intensidade'},{done:true,aif:'autenticidade'}]);assert.equal(p.total,100);
});
test('ordena horários portugueses, intervalos e horas sem zero inicial',()=>{
  const {sortSchedule,clockMinutes}=require('../js/logic.js');
  const input=[{id:'blank',time:''},{id:'six',time:'06:00'},{id:'five',time:'5h'},{id:'later',time:'18h–19h'},{id:'morning',time:'05h40'}];
  assert.deepEqual(sortSchedule(input).map(x=>x.id),['five','morning','six','later','blank']);
  assert.deepEqual(input.map(x=>x.id),['blank','six','five','later','morning']);
  assert.equal(clockMinutes('5h · God Moment'),300);
  assert.equal(clockMinutes('25h00'),null);assert.equal(clockMinutes('1h antes'),null);
});
test('a data tem prioridade sobre a hora; sem data ou hora fica no fim',()=>{
  const {sortSchedule}=require('../js/logic.js');
  const input=[{id:'undated',date:'',time:''},{id:'tomorrow',date:'2026-10-13',time:'05:00'},{id:'today-untimed',date:'2026-10-12',time:''},{id:'today-six',date:'2026-10-12',time:'06:00'},{id:'today-five',date:'2026-10-12',time:'05:00'}];
  assert.deepEqual(sortSchedule(input,'date').map(x=>x.id),['today-five','today-six','today-untimed','tomorrow','undated']);
  const tasks=input.map(x=>({id:x.id,due:x.date,dueTime:x.time}));
  assert.deepEqual(sortSchedule(tasks,'due','dueTime').map(x=>x.id),['today-five','today-six','today-untimed','tomorrow','undated']);
});
test('horários iguais conservam a ordem e concluir não muda a cronologia',()=>{
  const {sortSchedule}=require('../js/logic.js');
  const items=[{id:'one',time:'5h',done:true},{id:'two',time:'05:00',done:false},{id:'blank',time:''},{id:'unknown',time:'Depois do almoço'}];
  assert.deepEqual(sortSchedule(items).map(x=>x.id),['one','two','blank','unknown']);
  items[1].time='04:00';assert.deepEqual(sortSchedule(items).map(x=>x.id),['two','one','blank','unknown']);
});

test('horas livres e com espaços mantêm a ordem cronológica',()=>{
  const {clockMinutes,sortSchedule}=require('../js/logic.js');
  for(const [text,minutes] of [['5',300],['às 5 h 30',330],['6 horas',360],['5 : 40',340],['05h 45',345],['23h59',1439],['6h (treino)',360]]) assert.equal(clockMinutes(text),minutes,text);
  for(const text of ['1h antes','5h300','24h','12:60','30 minutos','05:4'])assert.equal(clockMinutes(text),null,text);
  assert.deepEqual(sortSchedule([{time:'6 horas'},{time:''},{time:'às 5 h 30'},{time:'5'}]).map(a=>a.time),['5','às 5 h 30','6 horas','']);
});

test('uma chama reúne os três princípios sem reutilizar a antiga intensidade',()=>{
  const {principlesScore}=require('../js/logic.js');
  assert.deepEqual(principlesScore([]),{total:0,marked:0,planned:0,completed:0});
  const score=principlesScore([{done:true,full:true},{done:true,principles:true},{done:false,principles:true},{done:true,aif:'autenticidade',principles:true}]);
  assert.deepEqual(score,{total:50,marked:2,planned:4,completed:3});
});

test('treinos reconhecem Gym com ID próprio e respeitam a seleção explícita',()=>{
  const {isTrainingArea}=require('../js/logic.js');
  assert.equal(isTrainingArea({id:'ar-123',label:'Gym'}),true);
  assert.equal(isTrainingArea({id:'ar-124',label:'Ginásio'}),true);
  assert.equal(isTrainingArea({id:'ar-125',label:'Judo & Tiros'}),true);
  assert.equal(isTrainingArea({id:'fitness',label:'Saúde'}),true);
  assert.equal(isTrainingArea({id:'ar-126',label:'Saúde',training:true}),true);
  assert.equal(isTrainingArea({id:'fitness',label:'Gym',training:false}),false);
  assert.equal(isTrainingArea({id:'leitura',label:'Leitura'}),false);
  assert.equal(isTrainingArea(null),false);
});

test('áreas de trabalho criadas pelo utilizador aparecem sem depender do ID antigo',()=>{
 const {isWorkArea}=require('../js/logic.js');
 assert.equal(isWorkArea({id:'ar-1',label:'Negócio'}),true);
 assert.equal(isWorkArea({id:'ar-2',label:'DROP'}),true);
 assert.equal(isWorkArea({id:'ar-3',label:'E-commerce'}),true);
 assert.equal(isWorkArea({id:'ar-4',label:'Projetos',work:true}),true);
 assert.equal(isWorkArea({id:'trabalho',label:'Trabalho',work:false}),false);
 assert.equal(isWorkArea({id:'outro',label:'Outro'}),false);
});
test('ordem manual vence os horários e novas atividades ficam no fim',()=>{
 const {sortActivities}=require('../js/logic.js');
 const acts=[{id:'early',time:'5h',manualOrder:1},{id:'late',time:'6h',manualOrder:0},{id:'new',time:'4h'}];
 assert.deepEqual(sortActivities(acts).map(a=>a.id),['late','early','new']);
 assert.deepEqual(acts.map(a=>a.id),['early','late','new']);
 const reset=acts.map(({manualOrder,...act})=>act);
 assert.deepEqual(sortActivities(reset).map(a=>a.id),['new','early','late']);
});
