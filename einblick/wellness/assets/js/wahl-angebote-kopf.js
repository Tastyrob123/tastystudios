/* Angebote · Kopf «Mit wem kommen Sie?» (01.11.2026). Erster Blick komplett: die Seite bleibt unsichtbar (html.mw-warte), bis jedes Bild
   im Kopf geladen ist (nur load, nie decode; die Bilder tragen decoding="sync"), dann wird alles in einem Moment sichtbar und im nächsten
   Bild startet der Moment des Kopfes (header.mw-los: Titel aus dem Schlitz, Bilder schweben, setzen sich oder gleiten). Notbremse 4 s. */
(function(){
var h=document.querySelector('header.mw'),de=document.documentElement;if(!h){de.classList.remove('mw-warte');return}
var fertig=false;
function los(){if(fertig)return;fertig=true;de.classList.remove('mw-warte');
 var an=function(){h.classList.add('mw-los')};requestAnimationFrame(function(){requestAnimationFrame(an)});setTimeout(an,80)}
var offen=[].slice.call(h.querySelectorAll('img')).filter(function(i){return !(i.complete&&i.naturalWidth)}),n=offen.length;
if(!n)los();else offen.forEach(function(i){var f=function(){if(--n<=0)los()};i.addEventListener('load',f,{once:true});i.addEventListener('error',f,{once:true})});
setTimeout(los,4000);
})();
