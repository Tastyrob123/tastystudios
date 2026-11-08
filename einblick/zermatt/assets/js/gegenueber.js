/* Startseite «Gegenüber» (01.11.2026, gegenueber.py): die Bewegungen der Kapitel nach dem Auftakt.
   Ein Takt (ZM.szene aus zm.js), nur transform und opacity; Breiten werden nie animiert. Der Auftakt bleibt unberührt in zm.js. */
(function () {
  'use strict';
  var W = window, D = document, Z = W.ZM; if (!Z) return;
  var $ = Z.$, $$ = Z.$$, st = Z.stueck, weich = Z.weich, klemm = Z.klemm;
  var schmal = function () { return innerWidth < 761; };
  var maus = W.matchMedia && W.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Vorladen: alle Bilder unter dem Auftakt laden anderthalb Bildschirme im Voraus, damit beim Hereinschweben nie ein Rahmen auf sein Foto wartet */
  var vor = $$('main>section:not(#auftakt)');
  var laden = function (el) { $$('img[loading=lazy]', el).forEach(function (i) { i.loading = 'eager'; }); };
  if ('IntersectionObserver' in W) {
    var vio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { laden(en.target); vio.unobserve(en.target); } }); }, { rootMargin: '150% 0px 150% 0px' });
    vor.forEach(function (el) { vio.observe(el); });
  } else vor.forEach(laden);

  /* Bereit: wartet, bis die Fotos eines Stücks geladen sind (höchstens 900 ms), dann geht es los; nie ein leerer Rahmen in Bewegung */
  var bereit = function (el, f) {
    var bilder = $$('img', el).filter(function (i) { return !(i.complete && i.naturalWidth > 1); }), n = bilder.length, fertig = false;
    var los = function () { if (!fertig) { fertig = true; f(); } };
    if (!n) return los();
    bilder.forEach(function (i) { var eins = function () { if (--n <= 0) los(); }; i.addEventListener('load', eins, { once: true }); i.addEventListener('error', eins, { once: true }); });
    setTimeout(los, 900);
  };

  /* Schweben wie bei Monte-Moro (Robert 02.11.2026): jedes Stück startet, sobald es am unteren Rand auftaucht (4 % vor dem Rand, wie tiefe.js
     in Monte-Moro), nicht erst, wenn es schon im Bild steht. Fotos schweben von unten oder von der Seite herein und zoomen dabei in den Rahmen
     (Werte in gegenueber.css «SCHWEBEN»); Titel steigen aus dem Schlitz, Texte steigen nach. */
  if (!Z.ruhig && 'IntersectionObserver' in W) {
    var fio0 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return; var t = en.target; fio0.unobserve(t);
        var an = function () { if (t.classList.contains('da')) return; t.classList.add('da'); t.dispatchEvent(new Event('da')); };
        if (t.querySelector('img')) { laden(t); bereit(t, an); } else an();
      });
    }, { rootMargin: '0px 0px 4% 0px' });
    $$('main>section:not(#auftakt) [data-r],main>section:not(#auftakt) [data-zeilen]').forEach(function (el) { fio0.observe(el); });
  }

  /* 1 · Suiten: fünf Streifen. Jeder Streifen ist so breit wie der offene; die rechten Nachbarn liegen darüber und gleiten beim Öffnen zur Seite.
     Das Bild im Streifen rückt so, dass im schmalen Ausschnitt das Motiv steht und im offenen die ganze Suite. Am Handy dasselbe senkrecht. */
  $$('[data-streifen]').forEach(function (box) {
    var teile = $$('.gg-st', box), offen = 0, m = {};
    var lege = function () {
      var hoch = schmal(), n = teile.length;
      if (hoch) { m.a = Math.round(Math.min(innerHeight * .58, 520)); m.c = 66; box.style.height = (m.a + (n - 1) * m.c) + 'px'; }
      else { box.style.height = ''; var bw = box.clientWidth; m.a = Math.round(bw * .58); m.c = (bw - m.a) / (n - 1); }
      box.style.setProperty('--c', m.c + 'px');
      teile.forEach(function (t, k) {
        var pos = k <= offen ? k * m.c : m.a + (k - 1) * m.c, auf = k === offen;
        var f = +(hoch ? t.dataset.fy : t.dataset.fx), s = auf ? 0 : klemm(m.c / 2 - f * m.a, m.c - m.a, 0);
        if (hoch) { t.style.width = ''; t.style.height = m.a + 'px'; t.style.transform = 'translate3d(0,' + pos.toFixed(1) + 'px,0)'; }
        else { t.style.height = ''; t.style.width = m.a + 'px'; t.style.transform = 'translate3d(' + pos.toFixed(1) + 'px,0,0)'; }
        t.firstElementChild.style.transform = hoch ? 'translate3d(0,' + s.toFixed(1) + 'px,0)' : 'translate3d(' + s.toFixed(1) + 'px,0,0)';
        t.classList.toggle('an', auf); t.setAttribute('aria-expanded', auf ? 'true' : 'false');
      });
    };
    var oeffne = function (k) { if (k === offen) return; offen = k; lege(); };
    var warte;
    teile.forEach(function (t, k) {
      if (maus) {
        t.addEventListener('mouseenter', function () { clearTimeout(warte); warte = setTimeout(function () { oeffne(k); }, 90); });
        t.addEventListener('mouseleave', function () { clearTimeout(warte); });
      }
      t.addEventListener('click', function (ev) { if (k !== offen) { ev.preventDefault(); oeffne(k); } });
      t.addEventListener('focus', function () { oeffne(k); });
    });
    lege();
    var bw0 = innerWidth; addEventListener('resize', function () { if (innerWidth !== bw0 || schmal()) { bw0 = innerWidth; lege(); } }, { passive: true });
    if ('ResizeObserver' in W) new ResizeObserver(function () { lege(); }).observe(box);
  });

  /* 3 · Morgen und 4 · Vor der Tür: wie bei Monte-Moro (Robert 02.11.2026: «nicht mit dem Scrollen»). Kommt die Reihe ins Bild und sind ihre Fotos geladen,
     zoomen sie einmal von selbst aus der Nähe in ihren Rahmen (CSS-Übergang .zoom-da, 2,4 s), danach stehen sie still */
  var nah = $$('[data-naehe],[data-gg-zoom]');
  if (Z.ruhig || !('IntersectionObserver' in W)) nah.forEach(function (el) { el.classList.add('zoom-da'); });
  else {
    var nio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; nio.unobserve(en.target); laden(en.target); bereit(en.target, function () { en.target.classList.add('zoom-da'); }); }); }, { rootMargin: '0px 0px 4% 0px' });
    nah.forEach(function (el) { nio.observe(el); });
  }

  /* 4 · Vor der Tür: Winter und Sommer; die Jahreszeit fährt im Rahmen, der Text wechselt kurz und hart */
  $$('[data-jahreszeit]').forEach(function (s) {
    var knoepfe = $$('[data-jz]', s), teile = $$('[data-teil]', s);
    knoepfe.forEach(function (b) {
      b.addEventListener('click', function () {
        var jz = b.dataset.jz; laden(s);
        s.setAttribute('data-jahreszeit', jz);
        knoepfe.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        teile.forEach(function (t) { t.classList.toggle('an', t.dataset.teil === jz); });
      });
    });
  });

  /* 5 · Wasser und Wärme: die Station in der Mitte des Bildschirms ist die helle; ihr Bild und alle davor liegen im Rahmen, die folgenden darunter */
  $$('[data-raeume]').forEach(function (s) {
    var stationen = $$('.gg-station', s), bilder = $$('.gg-raum__b', s), jetzt = 0;
    var setze = function (i) {
      if (i === jetzt) return; jetzt = i;
      stationen.forEach(function (x, j) { x.classList.toggle('an', j === i); });
      bilder.forEach(function (b, j) { b.classList.toggle('an', j <= i); });
    };
    Z.szene(s, function () {
      if (schmal()) return;
      var mitte = innerHeight * .52, i = 0;
      stationen.forEach(function (x, j) { if (x.getBoundingClientRect().top < mitte) i = j; });
      setze(i);
    }, { ganz: true, vor: 1 });
  });

  /* 6 · Fenster: das stehende Bild ist nur sichtbar, solange sein Abschnitt im Blick ist */
  if ('IntersectionObserver' in W) {
    var fio = new IntersectionObserver(function (es) { es.forEach(function (en) { en.target.classList.toggle('an', en.isIntersecting); }); }, { rootMargin: '4% 0px 4% 0px' });
    $$('.gg-fenster').forEach(function (f) { fio.observe(f); });
    /* der stehende Satz steigt, sobald der Abschnitt ihn zu etwa einem Drittel freigibt */
    var zio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('zeigt'); zio.unobserve(en.target); } }); }, { rootMargin: '0px 0px -20% 0px' });
    $$('.gg-fenster').forEach(function (f) { zio.observe(f); });
  } else $$('.gg-fenster').forEach(function (f) { f.classList.add('an', 'zeigt'); });

  /* Bildgruppen wie bei Monte-Moro (Robert 02.11.2026): berührt ein Foto den Rand, schwebt die ganze Gruppe in einem Zug herein,
     danach stehen alle Fotos still und bündig in ihren Kacheln (kein Wandern, kein Gleiten am Scrollen) */
  var GRUPPE = '.wb12-buehne,.gg-gast__raster,.ww13-drei,.ww13-zwei,.gg-abend,.gg-zut';
  $$(GRUPPE).forEach(function (g) { $$('figure[data-r],.gg-abend__seite[data-r]', g).forEach(function (f) { f.style.setProperty('--i', 0); }); });
  W.addEventListener('da', function (ev) {   /* am Fenster, vor dem Gruppen-Zug aus guss2.js, der sonst die ganze Bühne auf einmal startet */
    var g = ev.target.closest && ev.target.closest(GRUPPE);
    /* nur, was schon am Rand steht (gleiche Reihe); was weiter unten liegt (am Handy untereinander), startet selbst, wenn es auftaucht */
    if (g && ev.target.matches('figure[data-r],.gg-abend__seite[data-r]')) $$('figure[data-r],.gg-abend__seite[data-r]', g).forEach(function (x) { if (x.getBoundingClientRect().top < innerHeight * 1.1) x.classList.add('da'); });
    if (g) ev.stopImmediatePropagation();
  }, true);

  Z.messen();
})();
