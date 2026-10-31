/* Screen class is independent of orientation; viewport width only controls density. */
(function(){'use strict';var root=document.documentElement,queued=false;
 function update(){queued=false;var nativeTablet=null;try{if(window.ProtocoloNative&&ProtocoloNative.getDeviceProfile){var p=JSON.parse(ProtocoloNative.getDeviceProfile());if(typeof p.tablet==='boolean')nativeTablet=p.tablet;}}catch(ignore){}
  var w=window.innerWidth||root.clientWidth,h=window.innerHeight,screenSide=Math.min(screen.width||w,screen.height||h),tablet=nativeTablet===true||(nativeTablet===null&&screenSide>=600),rail;
  if(w>=1100)rail=true;else if(nativeTablet===true)rail=w>=480;else if(nativeTablet===false)rail=false;else rail=w>=768||(tablet&&w>=480)||(w>=600&&h>=600);
  root.classList.toggle('tablet-layout',rail);root.dataset.device=nativeTablet===false?'phone':tablet?'tablet':'responsive';root.dataset.layout=w>=1100?'desktop':rail?'tablet':'phone';
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 update();window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);window.addEventListener('pageshow',schedule);
})();
