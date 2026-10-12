/* Calendário e indicadores puros: dias civis, independentemente do horário de verão. */
(function(root){
  'use strict';
  function dayOrdinal(value){
    if(value instanceof Date){
      if(!Number.isFinite(value.getTime())) return null;
      return dayOrdinal(value.getFullYear()+'-'+String(value.getMonth()+1).padStart(2,'0')+'-'+String(value.getDate()).padStart(2,'0'));
    }
    if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var parts=value.split('-').map(Number), date=new Date(0);
    date.setUTCFullYear(parts[0],parts[1]-1,parts[2]); date.setUTCHours(0,0,0,0);
    if(date.getUTCFullYear()!==parts[0] || date.getUTCMonth()!==parts[1]-1 || date.getUTCDate()!==parts[2]) return null;
    return date.getTime()/86400000;
  }
  function daysBetween(start,end){
    var a=dayOrdinal(start),b=dayOrdinal(end);
    return a===null || b===null ? null : b-a;
  }
  function intervalProgress(start,end,today){
    var duration=daysBetween(start,end), elapsed=daysBetween(start,today);
    if(duration===null || elapsed===null || duration<0) return {valid:false,day:0,total:0,percent:0,remaining:0,status:'invalid'};
    var total=duration+1, day=Math.max(0,Math.min(total,elapsed+1));
    return {valid:true,day:day,total:total,percent:day/total*100,remaining:Math.max(0,duration-elapsed),untilStart:Math.max(0,-elapsed),status:elapsed<0?'before':elapsed>duration?'after':'active'};
  }
  function aifScores(activities){
    var groups={a:[],i:[],f:activities};
    activities.forEach(function(a){if(a.aif==='autenticidade') groups.a.push(a);if(a.aif==='intensidade') groups.i.push(a);});
    var result={a:0,i:0,f:0,total:0,applicable:[]};
    Object.keys(groups).forEach(function(k){
      var list=groups[k];if(!list.length)return;
      result.applicable.push(k);
      result[k]=list.filter(function(a){return a.done && (k!=='i' || a.full);}).length/list.length*100;
    });
    if(result.applicable.length) result.total=result.applicable.reduce(function(sum,k){return sum+result[k];},0)/result.applicable.length;
    return result;
  }
  var api={dayOrdinal:dayOrdinal,daysBetween:daysBetween,intervalProgress:intervalProgress,aifScores:aifScores};
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.ProtocolLogic=api;
})(typeof globalThis!=='undefined'?globalThis:this);
