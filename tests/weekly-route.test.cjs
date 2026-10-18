const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const logic=require('../js/logic.js');
const source=fs.readFileSync(require.resolve('../docs/ROTA_CHINA_2029_MISSOES_SEMANAIS.md'),'utf8');
const model=logic.weeklyRouteModel(source);
test('o ficheiro de 154 missões é preservado sem alterar nenhum byte',()=>{
 assert.equal(crypto.createHash('sha256').update(source).digest('hex'),'ba5c5ed67466ba05b6115630b17a3c40b85a122a7d2ec27842eed81c5dece0d9');
 const ctx={};vm.runInNewContext(fs.readFileSync(require.resolve('../js/data.js'),'utf8')+'\nglobalThis.weeklyText=CHINA_WEEKLY_TEXT;',ctx);assert.equal(ctx.weeklyText,source);
 const roundtrip=['# '+model.title,...model.intro];model.months.forEach(month=>{roundtrip.push('## '+month.heading);month.missions.forEach(m=>roundtrip.push('### '+m.heading,...m.lines));});
 assert.deepEqual(roundtrip,source.split('\n').filter(line=>line.trim()));
});
test('36 meses, 154 semanas e os três campos completos por missão',()=>{
 assert.equal(model.months.length,36);assert.equal(model.missions.length,154);
 model.missions.forEach((m,i)=>{assert.equal(m.id,'week-'+String(i+1).padStart(3,'0'));assert.equal(m.fields.length,3);assert.deepEqual(m.fields.map(f=>f.label),['FAZ ISTO:','OPÇÕES / ALTERNATIVAS:','PROVA DE CONCLUSÃO:']);if(i)assert.equal(logic.daysBetween(model.missions[i-1].date,m.date),7);});
 assert.equal(model.missions[0].date,'2026-10-24');assert.equal(model.missions.at(-1).date,'2029-09-29');
});
test('retoma a missão pendente guardada e avança depois de concluir com prova',()=>{
 const progress={};assert.equal(logic.weeklyResumeMission(model,progress,null).id,'week-001');
 assert.equal(logic.weeklyResumeMission(model,progress,{missionId:'week-050'}).id,'week-050');
 progress['week-050']={action:true,proof:true,evidence:'Documento guardado'};
 assert.equal(logic.weeklyResumeMission(model,progress,{missionId:'week-050'}).id,'week-001');
 progress['week-001']={action:true,proof:true,evidence:'Ficha de perfil'};
 assert.equal(logic.weeklyResumeMission(model,progress,{missionId:'week-001'}).id,'week-002');
 assert.equal(logic.weeklyMissionDone({action:true,proof:true,evidence:'  '}),false);
 assert.equal(logic.weeklyMissionDone({action:false,proof:true,evidence:'Ficha'}),false);
 model.missions.forEach(m=>progress[m.id]={action:true,proof:true,evidence:'Documento'});
 assert.equal(logic.weeklyResumeMission(model,progress,{missionId:'week-154'}).id,'week-154');
});
