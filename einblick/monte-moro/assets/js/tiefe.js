/* Hotel Monte-Moro · Tiefe und Bewegung (Probe 19.10.2026, Master 2.1 Punkt 6d). Läuft nach montemoro.js.
   - Auftakt: Himmel, Sonne, Grat, Haus und Titel laufen beim Scrollen mit eigenem Faktor gegeneinander ([data-lauf]).
   - Kompositionen (.komp): jede Ebene wandert mit ihrem Faktor (Drift, Gegenlauf: [data-tiefe] mit Vorzeichen), das Foto gleitet im Rahmen
     (±min(58px, 7 %)), der Rahmen schwebt herein, sobald sein Foto geladen ist (.da, Werte in bewegung.css).
   - Zimmer: zwei Läden aus Lärche gehen mit dem Scrollen auf ([data-laden]).
   - Bon: fliegt herein und landet schräg ([data-bonflug]); Zahlen zählen hoch ([data-zahl]); Text steigt ([data-steig]).
   Ein rAF-Takt, nur transform, translate und scale; gerechnet wird nur, was im Bild ist (Regel 55). */
(function () {
  'use strict';
  var D = document, W = window, $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var klemm = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var sanft = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var vh = innerHeight, handy = innerWidth < 800;

  /* Reihenfolge der steigenden Stücke je Gruppe */
  var gruppe = new Map();
  $$('[data-steig]').forEach(function (el) { var g = el.parentElement, n = gruppe.get(g) || 0; gruppe.set(g, n + 1); el.style.setProperty('--i', Math.min(n, 5)); });

  var auftritte = $$('.fo[data-r],[data-steig]'), boene = $$('[data-bonflug]'), zahlen = $$('[data-zahl]');
  if (ruhig || !('IntersectionObserver' in W)) { auftritte.concat(boene).forEach(function (el) { el.classList.add('da'); }); $$('[data-lift]').forEach(function (L) { L.classList.add('da'); var v = L.querySelector('svg'); v.classList.add('nah', 'flieg'); L.querySelector('[data-flugkarte]').setAttribute('transform', 'translate(-3947 -2085) scale(7.5)'); }); return; }

  /* ---------- Auftritt: der Rahmen kommt erst, wenn sein Foto da ist (nie ein leerer Rahmen in Bewegung) ---------- */
  function bereit(fig, f) {
    var im = fig.querySelector('img'), fertig = false, los = function () { if (fertig) return; fertig = true; f(); };
    if (!im || (im.complete && im.naturalWidth > 1)) { los(); return; }
    im.addEventListener('load', los, { once: true }); im.addEventListener('error', los, { once: true }); setTimeout(los, 1400);
  }
  var aio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; aio.unobserve(e.target); var t = e.target;
      if (t.classList.contains('fo')) bereit(t, function () { t.classList.add('da'); }); else t.classList.add('da');
    });
  }, { rootMargin: '0px 0px 4% 0px' });
  auftritte.forEach(function (el) { aio.observe(el); });

  /* ---------- Der Bon fliegt, sobald die Bilder gut im Blick sind ---------- */
  var bio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { bio.unobserve(e.target); e.target.__bon.classList.add('da'); } }); }, { rootMargin: '0px 0px -24% 0px' });
  boene.forEach(function (b) { var k = b.closest('.komp') || b; k.__bon = b; bio.observe(k); });

  /* ---------- Zahlen zählen hoch (Breite steht vorher fest, nichts springt) ---------- */
  function form(v, dez) { return dez ? v.toFixed(dez).replace('.', ',') : String(Math.round(v)); }
  zahlen.forEach(function (el) {
    var z = el.dataset.zahl; el.__dez = (z.split(/[.,]/)[1] || '').length; el.__n = parseFloat(z.replace(',', '.'));
    el.style.display = 'inline-block'; el.style.minWidth = z.length + 'ch'; el.style.textAlign = 'right';
    el.__v = el.__dez ? Math.round(el.__n * .7 * 10) / 10 : Math.max(1, Math.round(el.__n * .7));   /* ab rund 70 %, nie eine Null (Nachprüfung 19.10.2026) */
    var r = el.getBoundingClientRect(); if (r.top > vh) el.textContent = form(el.__v, el.__dez);
  });
  function zaehle(el) {
    var t0 = 0, dauer = 850, v0 = el.__v;
    (function schritt(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dauer); el.textContent = form(v0 + (el.__n - v0) * (1 - Math.pow(1 - k, 3)), el.__dez); if (k < 1) requestAnimationFrame(schritt); })(performance.now());
  }
  var zio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { zio.unobserve(e.target); zaehle(e.target); } }); }, { rootMargin: '0px 0px -12% 0px' });
  zahlen.forEach(function (el) { zio.observe(el); });

  /* ---------- Zwei Minuten bis zum Lift (Korrektur 19.10.2026): nicht am Scrollen. Sobald die Platte gut im Blick ist, steigt sie von unten herein;
     danach fliegt die Kamera von selbst nach Saas-Almagell. Kino-Fahrt: anfahren, auf drei Vierteln langsamer, dann satt ans Ziel (Tasty-Sprache Stufe 3, Punkt 2).
     Die Fussspuren laufen danach von selbst (CSS, je Abdruck 45 ms). ---------- */
  var KINO = (function () {   /* Geschwindigkeit: Sinusbogen mit einer Senke bei 62 %, aufsummiert und normiert */
    var n = 240, t = [0], s = 0;
    for (var i = 1; i <= n; i++) { var k = (i - .5) / n; s += Math.sin(Math.PI * k) * (1 - .68 * Math.exp(-Math.pow((k - .62) / .11, 2))); t.push(s); }
    return function (k) { var x = klemm(k, 0, 1) * n, i = Math.floor(x), f = x - i; return (t[i] + (i < n ? (t[i + 1] - t[i]) * f : 0)) / s; };
  })();
  $$('[data-lift]').forEach(function (L) {
    var svg = L.querySelector('svg'), g = L.querySelector('[data-flugkarte]');
    function zeige(z) {
      L.__z = z; var klein = innerWidth < 800, s0 = klein ? .52 : 1, s1 = klein ? 7.2 : 7.5, sk = s0 + z * (s1 - s0);
      var cx = 500 + ((klein ? 578 : 593) - 500) * z, cy = 300 + ((klein ? 321 : 318) - 300) * z;
      g.setAttribute('transform', 'translate(' + (500 - cx * sk).toFixed(2) + ' ' + (300 - cy * sk).toFixed(2) + ') scale(' + sk.toFixed(4) + ')');
      svg.classList.toggle('flieg', z > .1); svg.classList.toggle('nah', z > .55);
    }
    zeige(0);
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io2.disconnect(); L.classList.add('da');
        setTimeout(function () {
          var t0 = 0, dauer = 3600;
          (function schritt(t) { if (!t0) t0 = t; var k = (t - t0) / dauer; zeige(KINO(k)); if (k < 1) requestAnimationFrame(schritt); })(performance.now());
        }, 700);
      });
    }, { rootMargin: '0px 0px -20% 0px' });
    io2.observe(L);
    addEventListener('resize', function () { if (L.__z !== undefined) zeige(L.__z); }, { passive: true });
  });

  /* ---------- Am Scrollen: Auftakt-Schichten, Ebenen, Gleiten, Läden ---------- */
  var lauf = $$('[data-auf] [data-lauf]').map(function (el) { return { el: el, f: parseFloat(el.dataset.lauf) }; });
  var komps = $$('.komp').map(function (k) {
    return { k: k, an: false, eb: $$('[data-tiefe]', k).map(function (el) { var fig = el.querySelector('.fo'); return { el: el, f: parseFloat(el.dataset.tiefe), fig: fig, img: fig && fig.querySelector('img'), h: 0 }; }),
      laden: $$('[data-laden]', k).map(function (f) { return { fig: f, l: f.querySelector('.laden--l'), r: f.querySelector('.laden--r'), q: -1 }; }) };
  });
  function masse() { vh = innerHeight; handy = innerWidth < 800; komps.forEach(function (K) { K.eb.forEach(function (o) { if (o.fig) o.h = o.fig.offsetHeight; }); }); }
  masse();
  var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { var K = e.target.__K; if (K) K.an = e.isIntersecting; }); takt(); }, { rootMargin: '25% 0px 25% 0px' });
  komps.forEach(function (K) { K.k.__K = K; kio.observe(K.k); });

  var lt = false, aufFertig = false;
  function bild() {
    lt = false;
    var y = scrollY;
    if (y < vh * 1.4) { aufFertig = false; lauf.forEach(function (o) { o.el.style.transform = 'translate3d(0,' + (y * o.f).toFixed(1) + 'px,0)'; }); }
    else if (!aufFertig) { aufFertig = true; lauf.forEach(function (o) { o.el.style.transform = 'translate3d(0,' + (vh * 1.4 * o.f).toFixed(1) + 'px,0)'; }); }
    var weg = handy ? Math.min(64, vh * .08) : Math.min(150, vh * .17);
    komps.forEach(function (K) {
      if (!K.an) return;
      var r = K.k.getBoundingClientRect(), p = klemm((r.top + r.height / 2 - vh / 2) / vh, -1.3, 1.3);
      K.eb.forEach(function (o) {
        o.el.style.transform = 'translate3d(0,' + (p * o.f * weg).toFixed(1) + 'px,0)';
        if (o.img) o.img.style.translate = '0 ' + (klemm(p, -1, 1) * Math.min(58, o.h * .07)).toFixed(1) + 'px';
      });
      K.laden.forEach(function (L) {
        var rf = L.fig.getBoundingClientRect(), q = sanft(klemm((vh * .86 - rf.top) / (vh * .58), 0, 1)); q = Math.round(q * 500) / 500;
        if (q === L.q) return; L.q = q;
        L.l.style.transform = 'translate3d(' + (-q * 101).toFixed(2) + '%,0,0)'; L.r.style.transform = 'translate3d(' + (q * 101).toFixed(2) + '%,0,0)';
      });
    });
  }
  function takt() { if (!lt) { lt = true; requestAnimationFrame(bild); } }
  addEventListener('scroll', takt, { passive: true });
  addEventListener('resize', function () { masse(); takt(); }, { passive: true });
  addEventListener('load', function () { masse(); takt(); });
  bild();
})();
