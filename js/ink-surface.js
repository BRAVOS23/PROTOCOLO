/* Vector page with independent writing coordinates and viewport gestures. */
(function(){
'use strict';
window.InkSurface={create:function(o){
 var view=o.viewport,canvas=o.canvas,ctx=canvas.getContext('2d'),points=new Map(),stroke=null,before=null,gesture=null,pan=null,penId=null,zoom=1,fit=1,x=12,y=12,tool='pen',color='#635bff',width=3,undo=[],redo=[],destroyed=false,resolution=1,fingerWrites=true,restored=false,paintFrame=null,textCache=null,textLines=[],oldSize=null;
 function copy(){return JSON.parse(JSON.stringify(o.note.strokes));}
 function clamp(){var w=700*fit*zoom,h=1100*fit*zoom;x=w<view.clientWidth?(view.clientWidth-w)/2:Math.max(view.clientWidth-w-12,Math.min(12,x));y=h<view.clientHeight?(view.clientHeight-h)/2:Math.max(view.clientHeight-h-12,Math.min(12,y));}
 function apply(){var target=Math.min(3,Math.max(1,Math.ceil(fit*zoom*(window.devicePixelRatio||1)*2)/2));if(target!==resolution){resolution=target;canvas.width=700*resolution;canvas.height=1100*resolution;ctx.setTransform(resolution,0,0,resolution,0,0);paint();}clamp();canvas.style.transform='translate('+x+'px,'+y+'px) scale('+(fit*zoom)+')';o.onView(Math.round(zoom*100));}
 function queuePaint(){if(paintFrame===null)paintFrame=requestAnimationFrame(function(){paintFrame=null;paint();});}
 function rememberView(){o.note.viewport={layoutVersion:2,zoom:zoom,center:page({x:view.clientWidth/2,y:view.clientHeight/2})};if(o.onViewport)o.onViewport();}
 function paint(){ctx.globalAlpha=1;ctx.clearRect(0,0,700,1100);if(o.note.text){ctx.fillStyle='#222222';ctx.font='20px sans-serif';if(textCache!==o.note.text){textCache=o.note.text;textLines=[];var line='';for(var ch of String(o.note.text).slice(0,20000)){if(ch==='\n'||ctx.measureText(line+ch).width>620){textLines.push(line);line='';if(textLines.length>=35)break;if(ch==='\n')continue;}line+=ch;}if(textLines.length<35)textLines.push(line);}textLines.forEach(function(line,i){ctx.fillText(line,40,50+i*30);});}o.note.strokes.forEach(function(s){ctx.beginPath();ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.globalAlpha=s.kind==='highlighter'?.28:1;ctx.lineCap='round';ctx.lineJoin='round';s.points.forEach(function(p,i){if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});ctx.stroke();});ctx.globalAlpha=1;}
 function local(e){var r=view.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 function page(p){return [(p.x-x)/(fit*zoom),(p.y-y)/(fit*zoom)];}
 function commit(){if(before){if(stroke&&stroke.points.length===1){var p=stroke.points[0];stroke.points.push([p[0]+.1,p[1]+.1]);}if(JSON.stringify(before)!==JSON.stringify(o.note.strokes)){undo.push(before);if(undo.length>40)undo.shift();redo=[];o.onChange();}before=null;}stroke=null;penId=null;paint();}
 function cancelStroke(){if(before){o.note.strokes=before;before=null;stroke=null;penId=null;paint();}}
 function erase(p){var radius=18/(fit*zoom);function near(a,b){var dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<radius;}o.note.strokes=o.note.strokes.filter(function(s){return !s.points.some(function(q,i){return near(q,s.points[Math.max(0,i-1)]);});});paint();}
 function pair(){return Array.from(points.values()).slice(0,2);}
 function startGesture(){cancelStroke();pan=null;var a=pair(),mid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};gesture={distance:Math.max(1,Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)),zoom:zoom,anchor:page(mid)};}
 function down(e){if(e.pointerType==='mouse'&&e.button!==0)return;if(penId!==null&&e.pointerType!=='pen')return;e.preventDefault();points.set(e.pointerId,local(e));try{view.setPointerCapture(e.pointerId);}catch(ignore){}if(points.size>1){startGesture();return;}var p=local(e);if(tool==='hand'||(e.pointerType==='touch'&&!fingerWrites)||e.button===1){pan={x:p.x,y:p.y,startX:x,startY:y};return;}var q=page(p);if(q[0]<0||q[0]>700||q[1]<0||q[1]>1100)return;before=copy();if(e.pointerType==='pen')penId=e.pointerId;if(tool==='eraser')erase(q);else{stroke={color:color,width:tool==='highlighter'?Math.max(12,width*3):width,kind:tool==='highlighter'?'highlighter':'pen',points:[q]};o.note.strokes.push(stroke);paint();}}
 function move(e){if(!points.has(e.pointerId))return;e.preventDefault();var p=local(e);points.set(e.pointerId,p);if(gesture&&points.size>=2){var a=pair(),mid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};zoom=Math.max(.5,Math.min(5,gesture.zoom*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/gesture.distance));x=mid.x-gesture.anchor[0]*fit*zoom;y=mid.y-gesture.anchor[1]*fit*zoom;apply();return;}if(gesture)return;if(pan){x=pan.startX+p.x-pan.x;y=pan.startY+p.y-pan.y;apply();return;}if(!before)return;var events=e.getCoalescedEvents?e.getCoalescedEvents():[e];if(!events.length)events=[e];events.forEach(function(ev){var q=page(local(ev));if(tool==='eraser')erase(q);else if(stroke){var last=stroke.points[stroke.points.length-1];if(Math.hypot(q[0]-last[0],q[1]-last[1])>.25)stroke.points.push([Math.max(0,Math.min(700,q[0])),Math.max(0,Math.min(1100,q[1]))]);}});queuePaint();}
 function up(e){if(!points.has(e.pointerId))return;points.delete(e.pointerId);if(!points.size){var moved=!!gesture||!!pan;gesture=null;pan=null;commit();if(moved)rememberView();}}
 function cancelled(e){if(!points.has(e.pointerId))return;points.delete(e.pointerId);cancelStroke();if(!points.size){gesture=null;pan=null;}}
 function setZoom(value,anchor){commit();anchor=anchor||{x:view.clientWidth/2,y:view.clientHeight/2};var q=page(anchor);zoom=Math.max(.5,Math.min(5,value));x=anchor.x-q[0]*fit*zoom;y=anchor.y-q[1]*fit*zoom;apply();rememberView();}
 function wheel(e){e.preventDefault();if(e.ctrlKey||e.metaKey)setZoom(zoom*Math.exp(-e.deltaY*.008),local(e));else{x-=e.deltaX;y-=e.deltaY;apply();}}
 function resize(){
  if(!view.clientWidth||!view.clientHeight)return;
  var anchor=oldSize?page({x:oldSize.width/2,y:oldSize.height/2}):null,migrate=false;
  fit=Math.max(.1,(view.clientWidth-24)/700);
  if(!restored){restored=true;var v=o.note.viewport;
   if(v&&Number.isFinite(v.zoom)&&Array.isArray(v.center)&&v.center.every(Number.isFinite)){
    zoom=Math.max(.5,Math.min(5,v.zoom));
    if(view.clientWidth>=700&&v.layoutVersion!==2&&zoom<.8){zoom=1;x=12;y=12;}
    else{x=view.clientWidth/2-v.center[0]*fit*zoom;y=view.clientHeight/2-v.center[1]*fit*zoom;}
   }
   migrate=view.clientWidth>=700&&(!v||v.layoutVersion!==2);
  }else if(anchor){x=view.clientWidth/2-anchor[0]*fit*zoom;y=view.clientHeight/2-anchor[1]*fit*zoom;}
  oldSize={width:view.clientWidth,height:view.clientHeight};apply();if(migrate)rememberView();
 }

 view.addEventListener('pointerdown',down);view.addEventListener('pointermove',move);view.addEventListener('pointerup',up);view.addEventListener('pointercancel',cancelled);view.addEventListener('lostpointercapture',up);view.addEventListener('wheel',wheel,{passive:false});var observer=new ResizeObserver(resize);observer.observe(view);resize();paint();
 return {setFingerWriting:function(enabled){fingerWrites=!!enabled;},setTool:function(t,c,w){commit();tool=t;color=c;width=w;view.dataset.inkTool=t;},zoomBy:function(factor){setZoom(zoom*factor);},reset:function(){commit();zoom=1;x=12;y=12;apply();rememberView();},undo:function(){commit();if(!undo.length){if(!o.note.strokes.length)return;undo.push(copy());var previous=copy();previous.pop();redo.push(undo.pop());o.note.strokes=previous;}else{redo.push(copy());o.note.strokes=undo.pop();}paint();o.onChange();},redo:function(){commit();if(!redo.length)return;undo.push(copy());o.note.strokes=redo.pop();paint();o.onChange();},finish:commit,destroy:function(){if(destroyed)return;destroyed=true;commit();if(paintFrame!==null)cancelAnimationFrame(paintFrame);observer.disconnect();view.removeEventListener('pointerdown',down);view.removeEventListener('pointermove',move);view.removeEventListener('pointerup',up);view.removeEventListener('pointercancel',cancelled);view.removeEventListener('lostpointercapture',up);view.removeEventListener('wheel',wheel);}};
}};
})();
