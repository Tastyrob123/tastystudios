/* Angebote-Seite · gewählte Fassungen (01.11.2026): Bewegung für «Zu zweit», die Anlässe und den Gutschein (je aus ihrer Runde). */
/* Zu zweit · Fassungen (01.11.2026).
   1) Anderthalb Bildschirme vor dem Block werden alle Fotos geladen (nichts ploppt).
   2) Jedes [data-zl] bekommt «zz-los», sobald es unten ins Bild kommt; die Bewegung selbst steht je Fassung in zz.css. Nur transform. */
(function(){
var blk=document.getElementById('zu-zweit');if(!blk||!blk.classList.contains('zzw'))return;
var ims=[].slice.call(blk.querySelectorAll('img')),bereit=null;
function laden(){if(bereit)return bereit;ims.forEach(function(i){i.loading='eager'});
 bereit=Promise.all(ims.map(function(i){return i.complete?Promise.resolve():new Promise(function(r){i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})}));return bereit}
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){laden();o.disconnect()}},{rootMargin:'0px 0px 150% 0px'}).observe(blk);
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);var el=x.target,los=false,go=function(){if(!los){los=true;requestAnimationFrame(function(){el.classList.add('zz-los')})}};
 laden().then(go);setTimeout(go,450)})},{rootMargin:'0px 0px 8% 0px'});
[blk].concat([].slice.call(blk.querySelectorAll('[data-zl]'))).forEach(function(el){io.observe(el)});
})();

/* Angebote · Anlass-Blöcke, 15 Fassungen (01.11.2026).
   1) Anderthalb Bildschirme vor dem Bereich werden alle Fotos geladen (nichts ploppt nach).
   2) Jedes Stück mit data-an bekommt «a-da», sobald es den unteren Rand berührt und seine Fotos geladen sind (höchstens 0,4 s warten).
 */
(function(){
var w=document.querySelector('.anl');if(!w)return;
var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var ims=$$('img',w);
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){ims.forEach(function(i){i.loading='eager'});o.disconnect()}},{rootMargin:'0px 0px 150% 0px'}).observe(w);
if(matchMedia('(prefers-reduced-motion: reduce)').matches){$$('[data-an]',w).forEach(function(t){t.classList.add('a-da')})}
else{
 w.classList.add('a-bereit');
 var geladen=function(t){return Promise.all($$('img',t).map(function(i){return i.complete?1:new Promise(function(r){i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})}))};
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;var t=x.target;io.unobserve(t);var los=false,go=function(){if(!los){los=true;requestAnimationFrame(function(){t.classList.add('a-da')})}};
  geladen(t).then(go);setTimeout(go,400)})},{rootMargin:'0px 0px 6% 0px'});
 $$('[data-an]',w).forEach(function(t){io.observe(t)});
}
})();

/* Gutschein-Fassungen (01.11.2026): 1) anderthalb Bildschirme vor dem Abschnitt werden alle Fotos geladen (nichts ploppt);
   2) jedes Stück mit data-gv bekommt «gv-an», sobald es den unteren Rand berührt und seine Bilder da sind. Nur Klassen, Bewegung in gv.css. */
(function(){
var s=document.querySelector('.gv');if(!s)return;
var ims=[].slice.call(s.querySelectorAll('img'));
function laden(){ims.forEach(function(i){i.loading='eager'})}
function da(el){var l=[].slice.call(el.querySelectorAll('img'));if(el.tagName==='IMG')l.push(el);
 return Promise.all(l.map(function(i){return i.complete?0:new Promise(function(r){i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true})})}))}
if(!('IntersectionObserver' in window)){laden();s.querySelectorAll('[data-gv]').forEach(function(x){x.classList.add('gv-an')});return}
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){laden();o.disconnect()}},{rootMargin:'0px 0px 150% 0px'}).observe(s);
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);var el=x.target,los=false,
 go=function(){if(los)return;los=true;requestAnimationFrame(function(){el.classList.add('gv-an')})};da(el).then(go);setTimeout(go,600)})},{rootMargin:'0px 0px -4% 0px'});
s.querySelectorAll('[data-gv]').forEach(function(x){io.observe(x)});
})();
