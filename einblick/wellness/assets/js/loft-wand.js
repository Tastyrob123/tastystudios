/* Wellness & Spa · Startseite, Loft-Suite «Text in der Mitte der Wand» (01.11.2026, aus _varianten/loft-start-15 Nr. 5).
   1) Anderthalb Bildschirme vor dem Abschnitt werden alle Fotos geladen (nichts ploppt nach).
   2) Sobald der Abschnitt den unteren Rand berührt und die Fotos da sind: Klasse ls-los, die Wand kommt herauf (loft-wand.css). Nur transform. */
(function(){
var sek=document.querySelector('.lsx');if(!sek)return;
var ims=[].slice.call(sek.querySelectorAll('img')),bereit=null;
function laden(){if(bereit)return bereit;
 bereit=Promise.all(ims.map(function(i){i.loading='eager';return (i.complete&&i.naturalWidth)?Promise.resolve():new Promise(function(r){i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})}));return bereit}
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){laden();o.disconnect()}},{rootMargin:'0px 0px 150% 0px'}).observe(sek);
new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();var los=false,go=function(){if(!los){los=true;requestAnimationFrame(function(){sek.classList.add('ls-los')})}};
 laden().then(go);setTimeout(go,500)},{rootMargin:'0px 0px 8% 0px'}).observe(sek);
})();
