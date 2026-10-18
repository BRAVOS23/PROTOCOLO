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
  function isTrainingArea(area){
    if(!area)return false;
    if(typeof area.training==='boolean')return area.training;
    if(area.id==='fitness')return true;
    var name=String(area.label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return /\b(gym|ginasio|academia|fitness|treinos?|exercicios?|musculacao|judo|jiu jitsu|tiros|corrida|desporto)\b/.test(name);
  }
  function isWorkArea(area){
    if(!area)return false;
    if(typeof area.work==='boolean')return area.work;
    if(area.id==='trabalho')return true;
    var name=String(area.label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return /\b(trabalho|drop|negocios?|profissional|work|e[ -]?commerce)\b/.test(name);
  }
  function sortActivities(items){
    if(!(items||[]).some(function(a){return Number.isFinite(a.manualOrder);}))return sortSchedule(items);
    return (items||[]).map(function(item,index){return {item:item,index:index};}).sort(function(a,b){
      var first=Number.isFinite(a.item.manualOrder)?a.item.manualOrder:Infinity;
      var second=Number.isFinite(b.item.manualOrder)?b.item.manualOrder:Infinity;
      return (first-second)||a.index-b.index;
    }).map(function(row){return row.item;});
  }
  function principlesScore(activities){
    var marked=activities.filter(function(a){return a.done && a.principles;}).length;
    return {total:activities.length?marked/activities.length*100:0,marked:marked,planned:activities.length,completed:activities.filter(function(a){return a.done;}).length};
  }
  function clockMinutes(value){
    if(typeof value!=='string')return null;
    var match=/^(?:[àa]s\s+)?(\d{1,2})(?:\s*[hH](?:oras)?(?:\s*(\d{2}))?|\s*:\s*(\d{2}))?(?:\s*(?:[–—·-].*|\(.*\)))?$/.exec(value.trim());
    if(!match)return null;
    var hour=Number(match[1]),minute=Number(match[2]||match[3]||0);
    return hour>23 || minute>59 ? null : hour*60+minute;
  }
  function compareScheduled(a,b,dateField,timeField){
    if(dateField){
      var first=dayOrdinal(a[dateField]),second=dayOrdinal(b[dateField]);
      if(first!==second){if(first===null)return 1;if(second===null)return -1;return first-second;}
    }
    var firstTime=clockMinutes(a[timeField||'time']),secondTime=clockMinutes(b[timeField||'time']);
    if(firstTime===secondTime)return 0;
    if(firstTime===null)return 1;if(secondTime===null)return -1;
    return firstTime-secondTime;
  }
  function sortSchedule(items,dateField,timeField){
    return (items||[]).map(function(item,index){return {item:item,index:index};}).sort(function(a,b){return compareScheduled(a.item,b.item,dateField,timeField)||a.index-b.index;}).map(function(row){return row.item;});
  }
  var api={dayOrdinal:dayOrdinal,daysBetween:daysBetween,intervalProgress:intervalProgress,aifScores:aifScores,principlesScore:principlesScore,isTrainingArea:isTrainingArea,clockMinutes:clockMinutes,compareScheduled:compareScheduled,sortSchedule:sortSchedule,sortActivities:sortActivities,isWorkArea:isWorkArea};
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.ProtocolLogic=api;
})(typeof globalThis!=='undefined'?globalThis:this);
