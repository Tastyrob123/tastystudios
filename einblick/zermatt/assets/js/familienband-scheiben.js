// Familienband «Vier Scheiben»: jede Scheibe schwebt herauf, sobald ihre Oberkante den unteren Rand erreicht; Fotos werden vorher geladen. Nur transform.
(function(){
var L=[].slice.call(document.querySelectorAll('.familienband .fb__haus'));if(!L.length)return;
L.forEach(function(x,i){x.style.setProperty('--n',i)});
var g=false,w=0;
function f(){w=0;var h=innerHeight,b=L[0].getBoundingClientRect();
 if(!g&&b.top<h*2.5){g=true;L.forEach(function(x){x.querySelectorAll('img').forEach(function(i){i.loading='eager'})})}
 L.forEach(function(x){if(!x.classList.contains('da')&&x.getBoundingClientRect().top<h*1.02)x.classList.add('da')})}
addEventListener('scroll',function(){if(!w)w=requestAnimationFrame(f)},{passive:true});
addEventListener('resize',f);f();
})();
