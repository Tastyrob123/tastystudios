/* Wellness & Spa · Zimmerseite: grosses Bild, kleine Bilder zum Antippen, Wischen (Robert 25.10.2026, Fassung 1 «Klassisch»). Wechsel nur über Deckkraft. */
(function(){
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
$$('.zg').forEach(function(g){
 var bs=$$('.zg-b',g),ms=$$('.zg-m',g),a=0,n=bs.length;if(n<2)return;
 function zeig(i){a=(i+n)%n;bs.forEach(function(b,j){b.classList.toggle('an',j===a);if(j===a){var im=b.querySelector('img');if(im)im.loading='eager'}});
  ms.forEach(function(m,j){m.classList.toggle('an',j===a);m.setAttribute('aria-current',j===a?'true':'false')})}
 ms.forEach(function(m){m.addEventListener('click',function(){zeig(+m.dataset.i)})});
 var gr=g.querySelector('.zg-gross'),x0=null;
 gr.addEventListener('pointerdown',function(ev){x0=ev.clientX});
 gr.addEventListener('pointerup',function(ev){if(x0===null)return;var dx=ev.clientX-x0;x0=null;if(Math.abs(dx)>40)zeig(a+(dx<0?1:-1))});
});
})();
