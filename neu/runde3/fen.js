/* Fenster: der Satz steht fest in der Bildschirmmitte, das Fenster zieht darüber. Er rollt erst hoch, wenn die Oberkante des Fensters
   ihn zu einem Drittel freigegeben hat, wie beim Grand Beau-Rivage (Robert 02.11.2026: «sobald die Texte sichtbar werden, nicht früher, nicht später»).
   Vorher löste der allgemeine Beobachter aus, sobald die Hülle (ein Bildschirm über dem Fenster) ins Bild kam: der Satz war schon fertig, bevor man ihn sah. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('fenjs');
  [].forEach.call(document.querySelectorAll('.fen'), function (f) {
    var t = f.querySelector('.fen__satz'), fio = null; if (!t) return;
    var lausche = function () {
      if (fio) fio.disconnect();
      var hh = t.offsetHeight, linie = window.innerHeight / 2 - hh / 2 + hh * 0.68;   /* Lage aus der Geometrie: Satz mittig im Schirm */
      fio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          fio.disconnect(); fio = null; window.removeEventListener('resize', lausche);
          f.classList.add('los');
        });
      }, { rootMargin: '0px 0px -' + Math.max(0, Math.round(window.innerHeight - linie)) + 'px 0px', threshold: 0 });
      fio.observe(f);
    };
    lausche();
    window.addEventListener('resize', lausche, { passive: true });
  });
})();

/* Letztes Fenster vor dem Fuss: Hülle endet mit dem Fuss (Mass siehe fen.css) */
(function () {
  var f = document.querySelector('main>.fen:last-child'), m = f && f.parentElement, fuss = m && m.nextElementSibling;
  if (!fuss) return;
  var miss = function () { f.style.setProperty('--fuss', Math.max(0, fuss.getBoundingClientRect().bottom - f.getBoundingClientRect().bottom) + 'px'); };
  miss(); addEventListener('load', miss); addEventListener('resize', miss, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(miss).observe(fuss);
})();
