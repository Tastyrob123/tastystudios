/* Gourmet-Seite · Kopf «Papier und Mappe» (01.11.2026, aus _varianten/gourmet-kopf-15b). Erster Blick komplett: die Seite bleibt unsichtbar (html.gq-warte), bis jedes Bild des Kopfs,
   das im ersten Bild liegt, geladen ist (nur «load», kein decode) und die drei Schriften des Kopfs bereitstehen; dann wird alles in einem
   Moment sichtbar und der Kopf bekommt «los»: Titel aus dem Schlitz und der eigene Moment der Fassung starten genau dann. Sicherheitsnetz 4 s. */
(function(){
var d=document.documentElement,h=document.querySelector('.gq');
function zeig(){if(zeig.da)return;zeig.da=1;d.classList.remove('gq-warte');
 var los=function(){if(los.da)return;los.da=1;if(h)h.classList.add('los','da')};requestAnimationFrame(function(){requestAnimationFrame(los)});setTimeout(los,80)}
if(!h){zeig();return}
var vh=innerHeight,ims=[].slice.call(h.querySelectorAll('img')).filter(function(i){var r=i.getBoundingClientRect();return r.top<vh&&r.bottom>0});
var offen=ims.length+1;function eins(){if(--offen<=0)zeig()}
ims.forEach(function(i){if(i.complete&&i.naturalWidth)eins();else{i.addEventListener('load',eins,{once:true});i.addEventListener('error',eins,{once:true})}});
var f=document.fonts;(f&&f.load?Promise.all(['300 100px Montserrat','400 100px Montserrat','400 20px "Instrument Sans"','400 12px "DM Mono"'].map(function(x){return f.load(x)})):Promise.resolve()).then(eins,eins);
setTimeout(zeig,4000);
})();
