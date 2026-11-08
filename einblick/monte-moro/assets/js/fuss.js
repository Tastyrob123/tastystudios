/* Fuss Fassung 19 «Eingelassen» (Robert 20.10.2026), 1:1 aus _varianten/fuss-2026-10-20c/fuss.js: Auftritte deckend von unten, sobald der Bereich den Rand berührt; Gruppen in einem Zug (--i). Aufnahme-Modus ?aufnahme zeigt den Endstand. */
(function () {
  var auf = /aufnahme/.test(location.search);
  if (auf) document.documentElement.classList.add('aufnahme');
  var ziele = [].slice.call(document.querySelectorAll('.f3 [data-f3]'));
  var gruppe = new Map();
  ziele.forEach(function (el) {
    var g = el.closest('ul,nav,.f3-kt,.f3-drei,.f3-zwei,.f3-tri,.f3-zw,.f3-wz,.f3-hf,.f3-karte,.f3-drei-sp') || el.parentElement;
    var n = gruppe.get(g) || 0; gruppe.set(g, n + 1); el.style.setProperty('--i', Math.min(n, 7));
  });
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (auf || ruhig || !('IntersectionObserver' in window)) { ziele.forEach(function (el) { el.classList.add('da'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px' });
  ziele.forEach(function (el) { io.observe(el); });
})();
