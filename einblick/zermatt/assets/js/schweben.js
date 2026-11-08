/* Unterseiten: Schweben wie bei Monte-Moro (Robert 02.11.2026: «auf der gesamten Seite … nicht nur vorne auf der Landingpage»).
   Dieselbe Bewegung wie auf der Startseite (gegenueber.js): jedes Stück startet, sobald es am unteren Rand auftaucht (4 % vor dem Rand),
   Fotos schweben von unten oder von rechts herein und zoomen dabei in den Rahmen (Werte in schweben.css), danach stehen sie still.
   Fotos laden anderthalb Bildschirme im Voraus; ein Rahmen wartet höchstens 900 ms auf sein Foto. Die Startseite hat ihre eigene Fassung. */
(function () {
  'use strict';
  var W = window, D = document, Z = W.ZM; if (!Z || D.querySelector('main.gg')) return;
  var $$ = Z.$$;
  var GRUPPE = '.lb-buehne,.g2-gast__kante,.g2-zimmer__gruppe,.s4__bilder,.gr-3,.su-band,.su-paar,.rahmen,.su-mehr,.dz__paar,.halb';
  var FOTO = 'figure[data-r]:not([data-r=text])';
  var laden = function (el) { $$('img[loading=lazy]', el).forEach(function (i) { i.loading = 'eager'; }); };
  var bereit = function (el, f) {
    var bilder = $$('img', el).filter(function (i) { return !(i.complete && i.naturalWidth > 1); }), n = bilder.length, fertig = false;
    var los = function () { if (!fertig) { fertig = true; f(); } };
    if (!n) return los();
    bilder.forEach(function (i) { var eins = function () { if (--n <= 0) los(); }; i.addEventListener('load', eins, { once: true }); i.addEventListener('error', eins, { once: true }); });
    setTimeout(los, 900);
  };

  /* Schmale Fotos in der rechten Hälfte kommen am Rechner von rechts, alle anderen von unten; in einer Gruppe ohne Staffelung */
  var seiten = function () {
    $$('main ' + FOTO).forEach(function (f) {
      var r = f.getBoundingClientRect(), mitte = (r.left + r.width / 2) / innerWidth;
      if (innerWidth > 760 && r.width < innerWidth * .55 && mitte > .6) f.setAttribute('data-seite', 'rechts'); else f.removeAttribute('data-seite');
    });
  };
  /* Zoomen nur, wo das Foto seinen Rahmen ganz füllt; hat der Rahmen eine Unterschrift darunter, bleibt das Foto ohne Zoom (sonst ragt es über Nachbar und Schrift) */
  $$('main ' + FOTO).forEach(function (f) {
    var i = f.querySelector('img'); if (!i) return;
    var a = f.getBoundingClientRect(), b = i.getBoundingClientRect();
    if (Math.abs(a.height - b.height) < 3 && Math.abs(a.width - b.width) < 3) f.setAttribute('data-zoom', '');
  });
  seiten();
  /* Jedes Foto zoomt (Robert 02.11.2026: «der luxuriöse Zoom-Effekt ist nicht bei allen Bildern»): auch Fotos ohne schwebenden Rahmen,
     Hintergründe und Fotos mit Unterschrift. Füllt das Foto seinen Behälter, zoomt es darin; sonst bekommt es eine eigene Hülle in seiner Grösse,
     damit es nie über Nachbar oder Schrift ragt. Ausgenommen: Kopf der Seite, Fuss, Menü, Fenster und Grundrisse. */
  var AUSSEN = 'header,.g2-fuss,.familienband,dialog,.auf,#auftakt,[class*=plan],[data-zoom]';
  $$('main img').forEach(function (i) {
    if (i.closest(AUSSEN)) return;
    var r = i.getBoundingClientRect(); if (r.width < 80 || r.height < 80 || r.top + scrollY < innerHeight * .9) return;
    var p = i.parentElement, a = p.getBoundingClientRect(), h = p;
    if (Math.abs(a.width - r.width) > 3 || Math.abs(a.height - r.height) > 3) {
      h = D.createElement('span'); h.className = 'zoomhuelle'; h.style.borderRadius = getComputedStyle(i).borderRadius; i.before(h); h.appendChild(i);
    }
    h.setAttribute('data-zoom2', '');
  });
  $$(GRUPPE).forEach(function (g) { $$(FOTO, g).forEach(function (f) { f.style.setProperty('--i', 0); }); });

  /* Gruppen: nur, was in derselben Reihe am Rand steht, startet gemeinsam; was weiter unten liegt, startet selbst, wenn es auftaucht.
     Am Fenster, vor dem Gruppen-Zug aus guss2.js, der sonst die ganze Bühne auf einmal startet (auch, was noch niemand sieht). */
  W.addEventListener('da', function (ev) {
    var t = ev.target, g = t.closest && t.closest(GRUPPE);
    if (!g) return;
    if (t.matches(FOTO)) $$(FOTO, g).forEach(function (x) { if (x.getBoundingClientRect().top < innerHeight * 1.1) x.classList.add('da'); });
    ev.stopImmediatePropagation();
  }, true);

  if (Z.ruhig || !('IntersectionObserver' in W)) return;
  var vio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { laden(en.target); vio.unobserve(en.target); } }); }, { rootMargin: '150% 0px 150% 0px' });
  $$('main>section').forEach(function (el) { vio.observe(el); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return; var t = en.target; io.unobserve(t);
      var an = function () { if (t.classList.contains('da')) return; t.classList.add('da'); t.dispatchEvent(new Event('da')); };
      if (t.querySelector('img')) { laden(t); bereit(t, an); } else an();
    });
  }, { rootMargin: '0px 0px 4% 0px' });
  $$('main [data-r],main [data-zeilen]').forEach(function (el) { io.observe(el); });
  var zio = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (!en.isIntersecting) return; var t = en.target; zio.unobserve(t); laden(t); bereit(t, function () { t.classList.add('zoom-da'); }); });
  }, { rootMargin: '0px 0px 4% 0px' });
  $$('[data-zoom2]').forEach(function (el) { zio.observe(el); });
  var bw = innerWidth; addEventListener('resize', function () { if (innerWidth !== bw) { bw = innerWidth; seiten(); } }, { passive: true });
})();
