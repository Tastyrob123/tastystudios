/* Teamseite (Robert 02.11.2026): Auftritte, sobald ein Stück zu gut zwei Dritteln im Bild ist; Roberts Bildband zieht beim Scrollen.
   Ein Takt, nativer Scroll, nur transform. */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alle(s) { return [].slice.call(document.querySelectorAll(s)); }
  var stuecke = alle('[data-tz],[data-ts],[data-tr],[data-zk],[data-lb],.tm-fin [data-w="fin"]');
  function an(el) { el.classList.add(el.matches('[data-w="fin"]') ? 'los' : 'an'); }
  if (ruhig || !('IntersectionObserver' in window)) { stuecke.forEach(an); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { an(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -28% 0px', threshold: 0 });
  stuecke.forEach(function (el) { io.observe(el); });

  /* Vorne und dahinter: die Hälften fahren mit dem Hereinscrollen zusammen, fertig, wenn die Oberkante bei einem Fünftel der Höhe steht */
  var sn = document.querySelector('.sn');
  if (sn) {
    var snSicht = false, snWartet = false;
    var snSetze = function () {
      snWartet = false;
      var r = sn.getBoundingClientRect(), p = (innerHeight - r.top) / (innerHeight * .8);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      sn.style.setProperty('--off', Math.pow(1 - p, 3).toFixed(4));
    };
    var snTakt = function () { if (snSicht && !snWartet) { snWartet = true; requestAnimationFrame(snSetze); } };
    new IntersectionObserver(function (es) { snSicht = es[0].isIntersecting; snSetze(); }, { rootMargin: '10% 0px 10% 0px' }).observe(sn);
    addEventListener('scroll', snTakt, { passive: true }); addEventListener('resize', snTakt); snSetze();
  }

  var band = document.querySelector('.tm-r--robert'), zug = band && band.firstElementChild, sicht = false, wartet = false;
  if (!zug) return;
  new IntersectionObserver(function (es) { sicht = es[0].isIntersecting; if (sicht) takt(); }).observe(band);
  function setze() {
    wartet = false;
    if (innerWidth <= 860) { zug.style.transform = ''; return; }
    var r = band.getBoundingClientRect(), p = (innerHeight - r.top) / (innerHeight + r.height);
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    zug.style.transform = 'translate3d(' + (-p * 7.2).toFixed(3) + '%,0,0)';
  }
  function takt() { if (sicht && !wartet) { wartet = true; requestAnimationFrame(setze); } }
  addEventListener('scroll', takt, { passive: true });
  addEventListener('resize', takt);
})();
