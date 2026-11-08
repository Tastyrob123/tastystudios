/* Zweiter Durchgang Runde 3: Oberflächen in den Geräten skalieren, Abläufe (Hero-Chat, Weg des Gastes, Farben, KI, Werkzeuge, Partner, Fächer, Weg).
   Läuft vor runde2/r.js, das die Sichtbarkeit steuert und _start/_stop aufruft. Bewegt wird nur transform und opacity. */
(function () {
  'use strict';
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  function k(el, c, ja) { el.classList.toggle(c, ja !== false); }
  function folge(el, schritte, dauer, schleife) {
    var uhren = [], an = false;
    function einmal() { schritte.forEach(function (s) { uhren.push(setTimeout(s[1], s[0])); }); if (schleife) uhren.push(setTimeout(einmal, dauer)); }
    el._start = function () { if (an) return; an = true; einmal(); };
    el._stop = function () { an = false; uhren.forEach(clearTimeout); uhren = []; };
    el._einmal = !schleife;
  }

  /* Oberflächen in Originalgrösse auf den Bildschirm skalieren */
  function skaliere() {
    alle('[data-fix]').forEach(function (f) { var b = f.parentElement.clientWidth; if (b) f.style.transform = 'scale(' + (b / +f.getAttribute('data-fix')) + ')'; });
  }
  skaliere(); addEventListener('resize', skaliere); addEventListener('load', skaliere);

  /* Hero: der Gast fragt, die Rezeption antwortet; die Bestätigung zeichnet ihr Siegel */
  alle('[data-w="hchat"]').forEach(function (w) {
    var cw = w.querySelector('.cw'), bb = document.querySelector('.h5-buch .bb');
    function s(n) { ['s1', 's2', 's3', 's4'].forEach(function (c) { k(cw, c, c === 's' + n); }); }
    folge(w, [[0, function () { s(0); }], [900, function () { s(1); }], [1900, function () { s(2); }], [3400, function () { s(3); }], [4300, function () { s(4); if (bb) k(bb, 'an'); }]], 12000, true);
  });

  /* Weg des Gastes: Stationen links, Handy rechts, von selbst weiter, Antippen springt */
  alle('[data-w="reise"]').forEach(function (w) {
    var rw = alle('.rw', w), sek = w.closest('section'), sch = alle('.rp-s', sek), i = 0, uhr = null, an = false, DAUER = 4800;
    function zeige(n) {
      i = (n + rw.length) % rw.length;
      rw.forEach(function (r, j) { k(r, 'an', j === i); k(r, 'war', j < i); });
      sch.forEach(function (s, j) { k(s, 'an', j === i); });
      clearTimeout(uhr); if (an) uhr = setTimeout(function () { zeige(i + 1); }, DAUER + (i === rw.length - 1 ? 1500 : 0));
    }
    rw.forEach(function (r, j) { r.addEventListener('click', function () { zeige(j); }); });
    w.style.setProperty('--rwz', DAUER + 'ms');
    w._start = function () { if (an) return; an = true; zeige(i); };
    w._stop = function () { an = false; clearTimeout(uhr); };
    zeige(0); an = false; clearTimeout(uhr);
  });

  /* Farbbeispiel: Streifen füllen sich von links nach rechts, dann die Palette */
  alle('[data-w="farben"]').forEach(function (w) { folge(w, [[200, function () { k(w, 'los'); }]], 0, false); });
  alle('[data-w="ul"]').forEach(function (w) { folge(w, [[200, function () { k(w, 'los'); }]], 0, false); });   // Überblick «Licht an»

  /* KI: Text wird lesbar markiert, dann die Daten, dann fragt ChatGPT und antwortet */
  alle('[data-w="ki4"]').forEach(function (w) {
    var m = alle('mark', w), p = alle('.kp', w.closest('section'));
    function punkt(n) { p.forEach(function (x, j) { k(x, 'an', j === n); }); }
    var s = [[0, function () { ['z-code', 'z-frage', 'z-denkt', 'z-antwort'].forEach(function (c) { k(w, c, false); }); m.forEach(function (x) { k(x, 'an', false); }); punkt(0); }]];
    m.forEach(function (x, j) { s.push([300 + j * 380, function () { k(x, 'an'); }]); });
    s.push([2000, function () { k(w, 'z-code'); punkt(1); }], [3000, function () { k(w, 'z-frage'); punkt(2); }], [3700, function () { k(w, 'z-denkt'); }],
           [4700, function () { k(w, 'z-denkt', false); k(w, 'z-antwort'); }]);
    folge(w, s, 13000, true);
  });

  /* Werkzeuge: im Kontrollpanel wird ein Gericht eingetragen und veröffentlicht, dann erscheint es auf Karte, Zimmermappe und im Chat */
  alle('[data-w="wz"]').forEach(function (w) {
    var ziele = alle('.pn-ziele li', w);
    var s = [[0, function () { ['z-tippen', 'z-pub'].forEach(function (c) { k(w, c, false); }); ziele.forEach(function (z) { k(z, 'ok', false); }); }],
             [700, function () { k(w, 'z-tippen'); }], [3600, function () { k(w, 'z-pub'); }]];
    ziele.forEach(function (z, j) { s.push([4100 + j * 380, function () { k(z, 'ok'); }]); });
    folge(w, s, 12000, true);
  });

  /* Weg des Gastes und Jedem Gast seine Seite: einmal beim Hereinkommen */
  alle('[data-w="rzw"]').forEach(function (w) { folge(w, [[150, function () { k(w, 'los'); }]], 0, false); });
  alle('[data-w="vg"]').forEach(function (w) { folge(w, [[300, function () { k(w, 'los'); }]], 0, false); });
  alle('[data-w="vo"]').forEach(function (w) {
    function linien() {
      var svg = w.querySelector('.vo-li'); if (!svg) return; var r0 = w.getBoundingClientRect(), sp = alle('.vo-s', w), d = '';
      for (var j = 0; j < sp.length - 1; j++) alle('.vo-b', sp[j]).forEach(function (b) {
        var t = b.getAttribute('data-t'), z = sp[j + 1].querySelector('[data-t="' + t + '"]'); if (!z) return;
        var a = b.getBoundingClientRect(), c = z.getBoundingClientRect();
        var x1 = a.right - r0.left, y1 = a.top + a.height / 2 - r0.top, x2 = c.left - r0.left, y2 = c.top + c.height / 2 - r0.top, m = (x1 + x2) / 2;
        d += '<path pathLength="1" d="M' + x1 + ' ' + y1 + ' C ' + m + ' ' + y1 + ' ' + m + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>';
      });
      svg.innerHTML = d;
    }
    linien(); addEventListener('resize', linien); addEventListener('load', linien);
    folge(w, [[100, function () { linien(); k(w, 'los'); }]], 0, false);
  });

  alle('[data-w="partner4"],[data-w="weg4"],[data-w="fin"]').forEach(function (w) { folge(w, [[150, function () { k(w, 'los'); }]], 0, false); });

  /* Fächer der sechs Leistungen: vorn eine, je zwei dahinter; Pfeile, Antippen, Wischen, von selbst weiter */
  alle('[data-faecher]').forEach(function (f) {
    var bl = alle('.fa-b', f), tx = alle('.fa-texte>div', f), zahl = f.querySelector('[data-f-zahl]'), n = bl.length, ist = 0, halb = Math.floor(n / 2), uhr = null, an = false;
    function zeige(x) {
      ist = (x % n + n) % n;
      bl.forEach(function (b, i) { var p = ((i - ist + n + halb) % n) - halb; b.setAttribute('data-p', p); });
      tx.forEach(function (t, i) { k(t, 'an', i === ist); });
      if (zahl) zahl.textContent = ist + 1;
      /* läuft nicht mehr von allein weiter (Robert 02.11.2026), nur Pfeile, Antippen, Wischen */
    }
    alle('[data-f]', f).forEach(function (b) { b.addEventListener('click', function () { zeige(ist + (+b.getAttribute('data-f'))); }); });
    bl.forEach(function (b, i) { b.addEventListener('click', function () { if (i !== ist) zeige(i); }); });
    var x0 = null, bu = f.querySelector('.fa-buehne');
    bu.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    bu.addEventListener('touchend', function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 40) zeige(ist + (d < 0 ? 1 : -1)); }, { passive: true });
    f._start = function () { if (an) return; an = true; zeige(ist); };
    f._stop = function () { an = false; clearTimeout(uhr); };
    zeige(0);
  });
})();
/* Ergänzung 02.11.2026: Von Hand (Code und Vorschau leuchten paarweise), Haltung und Hausbuch einmal beim Hereinkommen */
(function () {
  'use strict';
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  alle('[data-w="vh"]').forEach(function (w) {
    var gr = alle('.vh-g', w), vo = alle('.vh-p', w), n = gr.length, i = -1, uhr = null;
    function zeige(x) {
      i = x % n;
      gr.forEach(function (g, j) { g.classList.toggle('an', j === i); });
      vo.forEach(function (p) { p.classList.toggle('an', +p.getAttribute('data-g') === i); });
      uhr = setTimeout(function () { zeige(i + 1); }, 2600);
    }
    w._start = function () { if (uhr) return; uhr = setTimeout(function () { zeige(i + 1); }, 500); };
    w._stop = function () { clearTimeout(uhr); uhr = null; };
  });
  alle('[data-w="hal"],[data-w="hb"]').forEach(function (w) {
    w._start = function () { setTimeout(function () { w.classList.add('los'); }, 150); };
    w._einmal = true;
  });

  /* ---------- Fragen: Band zum Blättern */
  [].slice.call(document.querySelectorAll('[data-frband]')).forEach(function (band) {
    var ab = band.closest('section');
    [].slice.call(ab.querySelectorAll('[data-band]')).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = band.querySelector('.fr-k'), w = k ? k.getBoundingClientRect().width + 2 : 400;
        band.scrollBy({ left: +b.dataset.band * w, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    });
  });
})();

/* Betreuung (02.11.2026): die goldene Linie folgt dem Scrollen, erreichte Stationen werden hell mit ihrem Foto */
(function () {
  var w = document.querySelector('[data-hbl]'); if (!w) return;
  var st = [].slice.call(w.querySelectorAll('[data-hs]')), tick = false;
  function rechne() {
    tick = false; var vh = innerHeight, r = w.getBoundingClientRect(); if (r.bottom < -300 || r.top > vh + 300) return;
    w.style.setProperty('--p', Math.min(1, Math.max(0, (vh * .62 - r.top) / (r.height - 72))).toFixed(4));
    st.forEach(function (x) { var q = x.getBoundingClientRect(); x.classList.toggle('an', q.top + q.height / 2 < vh * .62); });
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(rechne); } }, { passive: true });
  addEventListener('resize', rechne); rechne();
})();
/* Von Hand als Ebenen (02.11.2026): die Seite klappt in ihre Schichten auf, jede leuchtet mit ihrem Code, dann klappt sie zu */
(function () {
  'use strict';
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  alle('[data-w="eb"]').forEach(function (w) {
    var ls = alle('.eb-l', w), ns = alle('.eb-n', w), k = 0, uhr = null;
    function je(i) { ls.forEach(function (x, j) { x.classList.toggle('an', j === i); }); ns.forEach(function (x, j) { x.classList.toggle('an', j === i); }); }
    function schritt() {
      if (k === 0) { w.classList.add('auf'); je(-1); }
      else if (k <= 4) je(k - 1);
      else { je(-1); w.classList.remove('auf'); }
      k = k < 5 ? k + 1 : 0;
      uhr = setTimeout(schritt, k === 0 ? 2200 : 1150);
    }
    w._start = function () { if (uhr) return; uhr = setTimeout(schritt, 400); };
    w._stop = function () { clearTimeout(uhr); uhr = null; };
  });
})();


/* Erster Eindruck (02.11.2026): drei Stellen nacheinander, nur solange sichtbar, Antippen springt */
(function () {
  'use strict';
  var w = document.querySelector('[data-e="drei"]'); if (!w) return;
  var teile = [].slice.call(w.querySelectorAll('[data-i]')), n = 3, dauer = +w.getAttribute('data-dauer') || 5600, i = 0, uhr = null, an = false, erst = true;
  function zeige(j) {
    i = (j + n) % n;
    teile.forEach(function (el) { var x = +el.getAttribute('data-i'); el.classList.toggle('an', x === i); el.classList.toggle('war', x < i); });
    clearTimeout(uhr); if (an) uhr = setTimeout(function () { zeige(i + 1); }, dauer + (i === n - 1 ? 2400 : 0));
  }
  [].slice.call(w.querySelectorAll('[data-sprung]')).forEach(function (b) { b.addEventListener('click', function () { zeige(+b.getAttribute('data-sprung')); }); });
  zeige(0);
  new IntersectionObserver(function (es) {
    es.forEach(function (x) {
      if (x.isIntersecting && !an) { an = true; zeige(erst ? 0 : i); erst = false; }
      else if (!x.isIntersecting && an) { an = false; clearTimeout(uhr); }
    });
  }, { threshold: .3 }).observe(w);
})();

/* «Wie wir arbeiten», Fassung 02 «Wortlinie» (Robert 02.11.2026): die Wörter füllen sich nacheinander mit Licht, solange der Block in die obere Bildhälfte wandert */
(function () {
  'use strict';
  var W = [].slice.call(document.querySelectorAll('[data-wl]')); if (!W.length) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('an'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -4% 0px' });
  W.forEach(function (w) { io.observe(w); });
  var lauf = false;
  function rechne() {
    lauf = false; var vh = innerHeight;
    W.forEach(function (w) {
      var r = w.getBoundingClientRect(); if (r.bottom < -vh || r.top > 2 * vh) return;
      w.style.setProperty('--p', Math.max(0, Math.min(1, (vh * 0.92 - r.top) / (vh * 0.62))).toFixed(4));
    });
  }
  function tick() { if (!lauf) { lauf = true; requestAnimationFrame(rechne); } }
  addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); rechne();
  /* Robert 04.11.2026: «Von Ihnen» steht in allen vier Spalten auf einer Höhe, egal wie lang der Satz darüber ist */
  function hoehe() {
    W.forEach(function (w) {
      var P = [].slice.call(w.querySelectorAll('.wl-t > p'));
      P.forEach(function (p) { p.style.minHeight = ''; });
      if (innerWidth <= 860) return;
      var m = Math.max.apply(null, P.map(function (p) { return p.offsetHeight; }));
      P.forEach(function (p) { p.style.minHeight = m + 'px'; });
    });
  }
  hoehe(); addEventListener('resize', hoehe); if (document.fonts) document.fonts.ready.then(hoehe);
})();

/* Robert 04.11.2026: die vier Kacheln an der Goldlinie fliegen einen Moment später herein als der Rest, aber sobald man in die Fläche scrollt, nie erst auf leerer Fläche (zweite Korrektur: nicht zu spät) */
(function () {
  'use strict';
  var S = [].slice.call(document.querySelectorAll('[data-spaet]')); if (!S.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('da'); io.unobserve(x.target); } }); }, { rootMargin: '100000px 0px -16% 0px', threshold: 0 });
  S.forEach(function (s) { io.observe(s); });
})();
