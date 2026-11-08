/* Wellness & Spa · «setzen Sie sich», fünf Teller und die Menükarte (26.10.2026).
   1) Anderthalb Bildschirme vor dem Abschnitt werden alle Fotos geladen und entschlüsselt (nichts ploppt).
   2) Die Teller schweben in einem Zug herein (essen-gaenge.css), schon kurz bevor die Reihe unten ins Bild kommt.
   3) Die Karte legt sich aus leichter Schräge flach, sobald ihr oberer Rand ins Bild kommt. Nur transform. */
(function(){
var sek=document.querySelector('.gt'),reihe=sek&&sek.querySelector('.gt-reihe'),blatt=sek&&sek.querySelector('.gt-blatt');if(!sek||!reihe)return;
var ims=[].slice.call(sek.querySelectorAll('img')),bereit=null;
function laden(){if(bereit)return bereit;ims.forEach(function(i){i.loading='eager'});
 bereit=Promise.all(ims.map(function(i){return i.decode?i.decode().catch(function(){}):Promise.resolve()}));return bereit}
new IntersectionObserver(function(es,o){if(es[0].isIntersecting){laden();o.disconnect()}},{rootMargin:'0px 0px 150% 0px'}).observe(sek);
new IntersectionObserver(function(es,o){if(!es[0].isIntersecting)return;o.disconnect();var los=false,go=function(){if(!los){los=true;requestAnimationFrame(function(){reihe.classList.add('gt-los')})}};
 laden().then(go);setTimeout(go,500)},{rootMargin:'0px 0px 12% 0px'}).observe(reihe);
if(blatt)new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();requestAnimationFrame(function(){blatt.classList.add('gt-liegt')})}},{rootMargin:'0px 0px -4% 0px'}).observe(blatt);
})();
