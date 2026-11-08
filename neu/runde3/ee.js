/* Erster Eindruck, Fassung 01: deckende Auftritte von unten, sobald am Rand (nur transform). Oberflächen auf Bildschirmbreite skalieren. */
(function () {
  'use strict';
  var S = document.getElementById('reise'); if (!S) return;
  function alle(s) { return [].slice.call(S.querySelectorAll(s)); }
  function skaliere() { alle('[data-fix]').forEach(function (f) { var b = f.parentElement.clientWidth; if (b) f.style.transform = 'scale(' + (b / +f.getAttribute('data-fix')) + ')'; }); }
  skaliere(); addEventListener('resize', skaliere); addEventListener('load', skaliere);
  var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('los'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px 8% 0px' });
  alle('[data-a]').forEach(function (x) { io.observe(x); });
})();
/* Ablauf links und rechts (Robert 02.11.2026): startet, wenn die Seite gut im Bild ist; rechts zählt die Provision von 0 auf 45 € hoch. */
(function () {
  'use strict';
  var S = document.getElementById('reise'); if (!S) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seiten = [].slice.call(S.querySelectorAll('.ee-seite'));
  /* eigene Zeile: jeder Buchstabe bekommt seinen Platz im Wisch (0 links … 1 rechts) */
  [].slice.call(S.querySelectorAll('div.ee-dir')).forEach(function (z) {
    var teile = [].slice.call(z.children), alle = 0;
    teile.forEach(function (t) { alle += t.textContent.length; });
    var n = 0;
    teile.forEach(function (t) {
      var txt = t.textContent; t.textContent = '';
      for (var i = 0; i < txt.length; i++) { var b = document.createElement('span'); b.className = 'ee-bu'; b.textContent = txt[i]; b.style.setProperty('--p', (n++ / Math.max(1, alle - 1)).toFixed(3)); t.appendChild(b); }
    });
  });
  var minus = S.querySelector('dd.ee-minus'), ziel = minus ? parseInt(minus.textContent.replace(/\D/g, ''), 10) : 0, vor = minus ? minus.textContent.replace(/\d+/, '#') : '';
  if (minus && !ruhig) minus.textContent = vor.replace('#', '0');
  function zaehle() {
    if (!minus || ruhig) return;
    var t0 = null, dauer = 800;
    setTimeout(function () { requestAnimationFrame(function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dauer); p = 1 - Math.pow(1 - p, 3); minus.textContent = vor.replace('#', Math.round(ziel * p)); if (p < 1) requestAnimationFrame(f); }); }, 350);
  }
  var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (!x.isIntersecting) return; x.target.classList.add('spielt'); if (x.target.classList.contains('ee-r')) zaehle(); io.unobserve(x.target); }); }, { threshold: .6 });
  seiten.forEach(function (s) { io.observe(s); });
})();
/* Robert 04.11.2026: Einflug aus allen Richtungen. Ein Takt für den ganzen Bereich, startet, sobald die Bühne ins Bild kommt (ee.css, .flug/.fliegt). */
(function () {
  'use strict';
  var S = document.getElementById('reise'), B = S && S.querySelector('.ee-buehne');
  if (!B || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  S.classList.add('flug');
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { S.classList.add('fliegt'); io.disconnect(); } }, { rootMargin: '100000px 0px -10% 0px', threshold: 0 });
  io.observe(B);
})();
