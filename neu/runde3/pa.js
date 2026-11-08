/* Partner-Grafik (Robert 02.11.2026): jede Linie beginnt an der Mitte ihres Kastens und endet an der Mitte der Kachel, bei jeder Fenstergrösse */
(function(){
function setze(){document.querySelectorAll('.pa').forEach(function(pa){
 var svg=pa.querySelector('.pa-li'),eins=pa.querySelector('.pa-eins');if(!svg||!eins||!svg.getBoundingClientRect().width)return;
 var s=svg.getBoundingClientRect(),w=s.width,h=s.height,e=eins.getBoundingClientRect(),zy=e.top+e.height/2-s.top;
 svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('preserveAspectRatio','none');
 var wege=svg.querySelectorAll('path');
 pa.querySelectorAll('.pa-a').forEach(function(a,i){if(!wege[i])return;var r=a.getBoundingClientRect(),y=r.top+r.height/2-s.top;
  wege[i].setAttribute('d','M0 '+y.toFixed(1)+' C '+(w*.45).toFixed(1)+' '+y.toFixed(1)+' '+(w*.55).toFixed(1)+' '+zy.toFixed(1)+' '+w.toFixed(1)+' '+zy.toFixed(1))})})}
addEventListener('load',setze);addEventListener('resize',setze);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setze);setze();
})();
/* Bühne der Lieferungen: der Lichtschein erscheint erst, wenn das vordere Teil angekommen ist (Robert 02.11.2026) */
(function(){
document.querySelectorAll('[data-faecher]').forEach(function(f){
 var bu=f.querySelector('.fa-buehne'),uhr=null;if(!bu)return;
 /* eigenes Lichtfeld neben den Geräten: an der Bühne selbst wird nichts umgeschaltet, sonst springen die Geräte in Safari nach links */
 var li=document.createElement('i');li.className='fa-licht';li.setAttribute('aria-hidden','true');bu.appendChild(li);
 function warte(){li.classList.remove('an');clearTimeout(uhr);uhr=setTimeout(function(){li.classList.add('an')},1000)}
 new MutationObserver(warte).observe(bu,{subtree:true,attributes:true,attributeFilter:['data-p']});warte()})
})();
