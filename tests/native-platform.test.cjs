const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function platform(){
  const calls=[],elements={};
  const document={getElementById(id){return elements[id]||(elements[id]={hidden:false,setAttribute(){},addEventListener(){}});}};
  const window={ProtocoloNative:{syncActivities:json=>calls.push(JSON.parse(json)),getStatus:()=>JSON.stringify({})},addEventListener(){}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/native-platform.js'),'utf8'),{window,document,Date,ProtocolLogic:require('../js/logic.js')});
  return {native:window.NativePlatform,calls};
}
test('projects all weekly activities and today completion without private details',()=>{
  const {native,calls}=platform();
  const today=new Date();const date=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  const week={Segunda:[{id:'a',title:'Acordar',time:'05h30',detail:'private'},{id:'g',title:'God Moment',time:'05h40'}],Domingo:[{id:'l',title:'Leitura',time:''}]};
  native.syncActivities(week,{[date+'|a']:true,'2000-01-01|a':true});
  assert.equal(calls[0].week[1][0].title,'Acordar');assert.equal(calls[0].week[1][1].time,'05h40');
  assert.equal(calls[0].week[0][0].title,'Leitura');assert.equal(calls[0].week.length,7);
  assert.equal(calls[0].week[1][0].detail,undefined);assert.equal(calls[0].done[date+'|a'],true);assert.equal(calls[0].done['2000-01-01|a'],undefined);
});
test('completion, edit and removal update native state; identical saves do not',()=>{
  const {native,calls}=platform();const week={Segunda:[{id:'a',title:'Acordar',time:'05h30'}]};
  native.syncActivities(week,{});native.syncActivities(week,{});assert.equal(calls.length,1);
  const now=new Date();const date=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  native.syncActivities(week,{[date+'|a']:true});assert.equal(calls.length,2);
  week.Segunda[0].time='06h30';native.syncActivities(week,{});assert.equal(calls[2].week[1][0].time,'06h30');
  week.Segunda=[];native.syncActivities(week,{});assert.equal(calls[3].week[1].length,0);
});
test('manual order reaches the widget while event clock times remain intact',()=>{
 const {native,calls}=platform();
 native.syncActivities({Segunda:[{id:'first',title:'First',time:'8h',manualOrder:0},{id:'second',title:'Second',time:'5h',manualOrder:1}]},{});
 assert.deepEqual(calls[0].week[1].map(a=>a.id),['first','second']);
 assert.equal(calls[0].week[1][0].manualOrder,0);
 assert.equal(calls[0].week[1][1].time,'5h');
});
