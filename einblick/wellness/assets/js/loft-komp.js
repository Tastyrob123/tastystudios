// Zimmerseite · Loft-Suite «Komposition»: jedes Foto schwebt herauf, sobald seine Oberkante den unteren Rand erreicht, danach treibt es in eigener
// Tiefe (--k). Die Fotos werden gut zwei Bildschirme vorher geladen, damit nichts leer heraufschwebt. Nur transform.
(function(){
var k=document.querySelector('.lk-komp');if(!k)return;
var E=[].slice.call(k.querySelectorAll('.lk-eb')).map(function(x,i){x.style.setProperty('--n',i);return [x,parseFloat(x.style.getPropertyValue('--k'))||0]}),t=k.querySelector('.lk-t'),g=false,w=0;
var mm=matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)');
function f(){w=0;var h=innerHeight,b=k.getBoundingClientRect();
 if(!g&&b.top<h*2.5){g=true;k.querySelectorAll('img').forEach(function(i){i.loading='eager'})}
 if(b.top>h*1.05||b.bottom<0)return;
 E.forEach(function(p){if(!p[0].classList.contains('da')&&p[0].getBoundingClientRect().top<h*1.02)p[0].classList.add('da')});
 if(!k.classList.contains('da')&&t.getBoundingClientRect().top<h*1.02)k.classList.add('da');
 if(!mm.matches)return;var q=b.top+b.height/2-h/2;
 E.forEach(function(p){p[0].style.setProperty('--y',(-q*p[1]).toFixed(1)+'px')})}
addEventListener('scroll',function(){if(!w)w=requestAnimationFrame(f)},{passive:true});
addEventListener('resize',f);f();
})();
