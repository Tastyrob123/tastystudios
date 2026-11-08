/* Gourmet-Seite · gewählte Fassungen (01.11.2026, wahl/gourmet.py; Abend 02.11.: Fassung 1, .gx → x-da): Abend 13, Tag 3, Spezial-Kost 13.
   1) Anderthalb Bildschirme vor jedem der drei Abschnitte werden seine Fotos geladen (nichts ploppt nach).
   2) Jedes bewegte Stück bekommt seine Klasse, sobald es den unteren Rand berührt und seine Fotos fertig sind (spätestens nach 0,6 s):
      Abend data-los/data-auf → los, Tag data-tg → tg-an, Spezial-Kost data-sk → sk-an. Die Bewegung steht in wahl-gourmet.css, nur transform. */
(function(){
if(!('IntersectionObserver' in window))return;
function fertig(el){return Promise.all([].slice.call(el.querySelectorAll('img')).map(function(i){return (i.complete&&i.naturalWidth)?0:new Promise(function(r){i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})}))}
[['.ga','[data-los],[data-auf]','los'],['.gx','.g1-l,.g1-r','x-da'],['.tg','[data-tg]','tg-an'],['.sk','[data-sk]','sk-an']].forEach(function(t){
 var sek=document.querySelector(t[0]);if(!sek)return;
 new IntersectionObserver(function(es,o){if(es[0].isIntersecting){[].forEach.call(sek.querySelectorAll('img'),function(i){i.loading='eager'});o.disconnect()}},{rootMargin:'0px 0px 150% 0px'}).observe(sek);
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);var el=x.target,los=false,
  go=function(){if(!los){los=true;requestAnimationFrame(function(){el.classList.add(t[2])})}};fertig(el).then(go);setTimeout(go,600)})},{rootMargin:'0px 0px -4% 0px'});
 [].forEach.call(sek.querySelectorAll(t[1]),function(el){io.observe(el)});
});
})();
