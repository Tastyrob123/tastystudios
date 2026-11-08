/* Saastal · Ski-Abschnitt «Horizont oben» (01.11.2026). Der Abschnitt bekommt «da» vom Skript der Seite (.ri); das Familienbild ([data-sk])
   bekommt «sk-da», sobald es selbst den Rand berührt. Anderthalb Bildschirme vorher werden die Fotos geladen, damit nichts nachlädt. Nur transform. */
(function(){
var s=document.querySelector('.skv');if(!s)return;
var t=[].slice.call(s.querySelectorAll('[data-sk]'));
if(!('IntersectionObserver' in window)){t.forEach(function(x){x.classList.add('sk-da')});return}
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();[].forEach.call(s.querySelectorAll('img'),function(i){i.loading='eager'})}},{rootMargin:'0px 0px 150% 0px'}).observe(s);
var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('sk-da');io.unobserve(x.target)}})},{rootMargin:'0px 0px -6% 0px'});
t.forEach(function(x){io.observe(x)});
})();
