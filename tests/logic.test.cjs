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
