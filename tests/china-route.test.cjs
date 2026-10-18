const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('a nova rota conserva integralmente o texto fornecido',()=>{
 const context={};vm.runInNewContext(fs.readFileSync(require.resolve('../js/data.js'),'utf8')+'\nglobalThis.routeText=CHINA_2029_TEXT;',context);
 assert.equal(context.routeText,fs.readFileSync(require.resolve('../docs/ROTA_CHINA_2029.md'),'utf8').replace(/\n$/,''));
 assert.ok(context.routeText.endsWith('Vou então verificar se os 45 minutos cabem realmente na semana e ajustar a rota ao tempo disponível.'));
});
test('blocos preservam as fases, os parágrafos e todas as linhas das duas tabelas',()=>{
 const {planDocumentSections}=require('../js/logic.js');
 const source=fs.readFileSync(require.resolve('../docs/ROTA_CHINA_2029.md'),'utf8');
 const sections=planDocumentSections(source);
 assert.equal(sections.length,9);
 assert.equal(sections.filter(s=>s.title.startsWith('Fase ')).length,4);
 const tables=sections.flatMap(s=>s.items).filter(i=>i.type==='table');
 assert.deepEqual(tables.map(t=>t.rows.length),[8,6]);
 assert.equal(tables[0].rows[0][1],'Iniciar mandarim com 20–30 minutos, 4 vezes por semana, se a rotina permitir');
 assert.equal(sections[8].items.at(-1).text,'Quando terminares sábado e domingo na aplicação, envia uma nova exportação. Vou então verificar se os 45 minutos cabem realmente na semana e ajustar a rota ao tempo disponível.');
 assert.equal(sections.flatMap(s=>s.items).filter(i=>i.type==='bullet').length,4);
});
