const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('a nova rota conserva integralmente o texto fornecido',()=>{
 const context={};vm.runInNewContext(fs.readFileSync(require.resolve('../js/data.js'),'utf8')+'\nglobalThis.routeText=CHINA_2029_TEXT;',context);
 assert.equal(context.routeText,fs.readFileSync(require.resolve('../docs/ROTA_CHINA_2029.md'),'utf8').replace(/\n$/,''));
 assert.ok(context.routeText.endsWith('Vou então verificar se os 45 minutos cabem realmente na semana e ajustar a rota ao tempo disponível.'));
});
