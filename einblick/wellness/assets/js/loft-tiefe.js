// Loft-Suite «Collage»: jede Kachel wandert beim Scrollen mit ihrer eigenen Tiefe (--k aus loft-seite.css), vorn mehr, hinten weniger.
// Nur transform, ein requestAnimationFrame je Bild; aus am Handy und bei reduzierter Bewegung.
(function(){
var mm=matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)');
var B=[].slice.call(document.querySelectorAll('.v6-box')).map(function(b){
 return [b,[].slice.call(b.children).map(function(x){return [x,parseFloat(getComputedStyle(x).getPropertyValue('--k'))||0]})]});
if(!B.length)return;var w=0;
function f(){w=0;var h=innerHeight;
 B.forEach(function(p){var r=p[0].getBoundingClientRect();
  if(!mm.matches){p[1].forEach(function(c){c[0].style.removeProperty('--y')});return}
  if(r.bottom<-200||r.top>h+200)return;
  var q=r.top+r.height/2-h/2;
  p[1].forEach(function(c){c[0].style.setProperty('--y',(-q*c[1]).toFixed(1)+'px')})})}
addEventListener('scroll',function(){if(!w)w=requestAnimationFrame(f)},{passive:true});
addEventListener('resize',f);f();
})();
