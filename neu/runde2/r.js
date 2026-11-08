/* Runde 2: Erklär-Animationen wie in der AI Masterclass. Ein Takt, nativer Scroll, bewegt wird nur transform und opacity
   (die feinen Linien zeichnen sich über stroke-dashoffset). Was nicht im Bild ist, läuft nicht. Erster Blick komplett. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /* ---------- Geräte: Beispielseite auf Bildschirmbreite skalieren, Laufweg messen */
  function skaliere() {
    alle('.demo').forEach(function (d) {
      var schirm = d.parentElement, dw = parseFloat(d.style.getPropertyValue('--dw')) || 1280;
      var s = schirm.clientWidth / dw; if (!s) return;
      d.style.transform = 'scale(' + s + ')';
      var lauf = d.firstElementChild, sichtbar = schirm.clientHeight / s;
      d.style.setProperty('--weg', Math.max(0, lauf.offsetHeight - sichtbar) + 'px');
    });
  }
  skaliere(); addEventListener('resize', skaliere); addEventListener('load', skaliere);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(skaliere);

  /* ---------- erster Blick: unsichtbar, bis jedes Bild im ersten Ausschnitt geladen ist, dann alles in einem Moment */
  /* Link mit #Abschnitt: solange die Seite unsichtbar ist, geht der Sprung des Browsers verloren, deshalb hier nachholen */
  function springe() { var z = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (z) z.scrollIntoView({ block: 'start' }); }
  springe();
  var erste = alle('img').filter(function (im) { var r = im.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width > 0; });
  var offen = erste.length, gezeigt = false;
  function zeigen() { if (gezeigt) return; gezeigt = true; skaliere(); doc.classList.remove('kw'); springe(); requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add('los'); }); }); }
  if (!offen) zeigen();
  erste.forEach(function (im) {
    im.loading = 'eager';
    var eins = function () { if (--offen <= 0) zeigen(); };
    if (im.complete && im.naturalWidth) eins(); else { im.addEventListener('load', eins, { once: true }); im.addEventListener('error', eins, { once: true }); }
  });
  setTimeout(zeigen, 2600);

  var hatIO = 'IntersectionObserver' in window;
  if (hatIO) {
    var nah = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { nah.unobserve(e.target); e.target.loading = 'eager'; } }); }, { rootMargin: '220% 0px 220% 0px' });
    alle('img[loading="lazy"]').forEach(function (im) { nah.observe(im); });
  }

  /* ---------- Auftritte */
  function da(el) { el.classList.add('da'); }
  if (ruhig || !hatIO) { alle('[data-kg],[data-k],.zl').forEach(da); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { da(e.target); io.unobserve(e.target); } }); }, { rootMargin: '100000px 0px -6% 0px', threshold: 0 });
    alle('[data-kg]').forEach(function (g) { io.observe(g); });
    alle('[data-k],.zl').forEach(function (el) { if (el.closest('.r-hero') || el.closest('[data-kg]') || el.closest('.b-stufe') || el.hasAttribute('data-spaet')) return; io.observe(el); });
  }

  /* ---------- Abläufe: eine Folge von Schritten, die sich wiederholt, solange das Stück im Bild ist */
  function folge(el, schritte, dauer, schleife) {
    var uhren = [], an = false;
    function einmal() {
      schritte.forEach(function (s) { uhren.push(setTimeout(s[1], s[0])); });
      if (schleife) uhren.push(setTimeout(einmal, dauer));
    }
    el._start = function () { if (an) return; an = true; einmal(); };
    el._stop = function () { an = false; uhren.forEach(clearTimeout); uhren = []; };
    el._einmal = !schleife;
  }
  function k(el, c, ja) { el.classList.toggle(c, ja !== false); }

  var STEUER = {
    chaos: function (w) {
      var q = alle('.q', w);
      folge(w, [
        [0, function () { k(w, 'z-streit', false); k(w, 'z-kern', false); k(w, 'z-linien', false); q.forEach(function (x) { k(x, 'neu', false); }); }],
        [500, function () { k(w, 'z-streit'); }],
        [2600, function () { k(w, 'z-kern'); }],
        [3100, function () { k(w, 'z-linien'); }],
        [3700, function () { k(q[0], 'neu'); }], [4000, function () { k(q[1], 'neu'); }], [4300, function () { k(q[2], 'neu'); }], [4600, function () { k(q[3], 'neu'); }],
      ], 10500, true);
    },
    merk: function (w) {
      var m = alle('[data-m]', w), i = 0;
      folge(w, [[0, function () { m.forEach(function (x) { k(x, 'an', +x.getAttribute('data-m') === i % 4); }); i++; }]], 2300, true);
    },
    ki: function (w) {
      var d = alle('.kd', w), s = alle('.w-ki__strom i', w);
      folge(w, [
        [0, function () { ['z-frage', 'z-denkt', 'z-antwort'].forEach(function (c) { k(w, c, false); }); d.concat(s).forEach(function (x) { k(x, 'an', false); }); }],
        [400, function () { k(w, 'z-frage'); }],
        [1500, function () { k(w, 'z-denkt'); }],
        [2000, function () { k(d[0], 'an'); k(s[0], 'an'); }], [2450, function () { k(d[1], 'an'); k(s[1], 'an'); }],
        [2900, function () { k(d[2], 'an'); k(s[2], 'an'); }], [3350, function () { k(d[3], 'an'); k(s[3], 'an'); }],
        [4100, function () { k(w, 'z-denkt', false); k(w, 'z-antwort'); }],
      ], 11500, true);
    },
    kette: function (w) {
      var z = alle('.kz', w), b = false;
      folge(w, [
        [0, function () { k(w, 'z-linien', false); k(w, 'z-fokus', false); z.forEach(function (x) { k(x, 'blitz', false); }); }],
        [500, function () { k(w, 'z-fokus'); }],
        [1300, function () { b = !b; k(w.querySelector('.kq .wert'), 'b', b); }],
        [1900, function () { k(w, 'z-fokus', false); k(w, 'z-linien'); }],
      ].concat(z.map(function (x, i) { return [2400 + i * 280, function () { k(x.querySelector('.wert'), 'b', b); k(x, 'blitz'); }]; })), 7200, true);
    },
    gaeste: function (w) {
      var tabs = alle('[data-g]', w), bl = alle('.gb', w), ord = JSON.parse(w.getAttribute('data-ordnung')), g = 0;
      function setze() {
        var h = bl[0].offsetHeight + 10;
        w.querySelector('.gl').style.height = (h * bl.length - 10) + 'px';
        tabs.forEach(function (t, i) { k(t, 'an', i === g); });
        bl.forEach(function (b, i) { var p = ord[g].indexOf(i); b.style.transform = 'translate3d(0,' + (p * h) + 'px,0)'; k(b, 'oben', p === 0); });
      }
      setze(); addEventListener('resize', setze);
      folge(w, [[0, function () { setze(); }], [3200, function () { g = (g + 1) % 3; setze(); }]], 3200, true);
    },
    partner: function (w) { folge(w, [[0, function () { k(w, 'los'); }]], 0, false); },
    weg: function (w) { folge(w, [[0, function () { k(w, 'los'); }]], 0, false); },
  };
  alle('[data-w]').forEach(function (w) { var f = STEUER[w.getAttribute('data-w')]; if (f) f(w); });

  /* Sichtbarkeit: Animationen und Gerätefilme laufen nur im Bild */
  if (hatIO && !ruhig) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var w = e.target;
        if (w.closest('.b-platz')) return;
        if (e.isIntersecting) { if (w._start) w._start(); k(w, 'spielt'); }
        else { if (w._stop && !w._einmal) w._stop(); k(w, 'spielt', false); }
      });
    }, { threshold: .25 });
    alle('[data-w]').forEach(function (w) { sio.observe(w); });
    var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { k(e.target, 'spielt', e.isIntersecting); }); }, { threshold: 0 });
    alle('.lap,.tel').forEach(function (g) { gio.observe(g); });
  } else {
    alle('[data-w]').forEach(function (w) { if (w._start) w._start(); k(w, 'spielt'); });
    alle('.lap,.tel').forEach(function (g) { k(g, 'spielt'); });
  }

  /* ---------- Bühne (Fassung 3): links die Geschichte, rechts die Animation der aktuellen Stufe */
  var buehnen = alle('[data-buehne]').map(function (b) { return { b: b, st: alle('.b-stufe', b), pl: alle('.b-platz', b), akt: -2 }; });
  /* Hero-Laptop (Fassung 3) steigt beim Scrollen leicht auf */
  var h3 = document.querySelector('.h3-lap');
  var faellig = false;
  function takt() {
    faellig = false;
    var h = innerHeight;
    if (h3) { var y = Math.min(scrollY, h); h3.style.transform = 'translate3d(0,' + (-y * .18).toFixed(1) + 'px,0)'; }
    buehnen.forEach(function (B) {
      var r = B.b.getBoundingClientRect(), n = B.st.length;
      var p = clamp(-r.top / Math.max(1, r.height - h), 0, .9999);
      var i = r.top > h * .4 || r.bottom < h * .3 ? -1 : Math.floor(p * n);
      if (i === B.akt) return; B.akt = i;
      B.st.forEach(function (s, j) { k(s, 'an', j === i); k(s, 'weg', i > -1 && j < i); });
      B.pl.forEach(function (pl, j) {
        k(pl, 'an', j === i);
        alle('[data-w]', pl).forEach(function (w) { if (j === i) { if (w._start) w._start(); k(w, 'spielt'); } else { if (w._stop) w._stop(); k(w, 'spielt', false); } });
        if (j === i) alle('.zl,[data-k]', B.st[j]).forEach(da);
      });
    });
  }
  function anstossen() { if (!faellig) { faellig = true; requestAnimationFrame(takt); } }
  addEventListener('scroll', anstossen, { passive: true }); addEventListener('resize', anstossen); takt();
})();
