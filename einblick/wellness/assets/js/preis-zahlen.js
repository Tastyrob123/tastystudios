// Zimmerseite · «In Zahlen»: jedes Bild schwebt herauf, sobald seine Oberkante den unteren Rand erreicht; die Bilder werden vorher geladen. Nur transform.
(function(){
var Z=[].slice.call(document.querySelectorAll('.inz-z'));if(!Z.length)return;
Z.forEach(function(x,i){x.style.setProperty('--n',i)});
var g=false,w=0;
function f(){w=0;var h=innerHeight,b=Z[0].getBoundingClientRect();
 if(!g&&b.top<h*2.5){g=true;Z.forEach(function(x){x.querySelectorAll('img').forEach(function(i){i.loading='eager'})})}
 Z.forEach(function(x){if(!x.classList.contains('da')&&x.getBoundingClientRect().top<h*1.02)x.classList.add('da')})}
addEventListener('scroll',function(){if(!w)w=requestAnimationFrame(f)},{passive:true});
addEventListener('resize',f);f();
})();
