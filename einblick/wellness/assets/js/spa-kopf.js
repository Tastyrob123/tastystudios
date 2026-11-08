/* Wellness & Spa · Spa-Seite, Kopf «Je nach Tageszeit» (Fassung 7 aus _varianten/spahero). */
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var k=$('.sh');if(k)requestAnimationFrame(function(){requestAnimationFrame(function(){k.classList.add('da')})});
// 07 Tageszeit: bis 17 Uhr Tag, danach Abend; das Bild der Stunde blendet über das andere
var tz=$$('.sh-tz');if(tz.length){var h=new Date().getHours(),abend=h>=17||h<7,zeit=abend?'abend':'tag';
 $('[data-tz]').textContent=abend?'Am Abend im Spa · die Holzsauna':h<12?'Am Morgen im Spa · das Schwimmbad':'Am Nachmittag im Spa · das Schwimmbad';
 tz.forEach(function(f){if(f.dataset.zeit!==zeit)f.classList.add('vorher')});
 requestAnimationFrame(function(){requestAnimationFrame(function(){tz.forEach(function(f){if(f.dataset.zeit===zeit)f.classList.add('jetzt')})})})}
})();
