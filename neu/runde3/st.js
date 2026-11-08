/* Studio-Seite (Robert 02.11.2026): Auftritte, sobald ein Stück gut im Bild ist; die kleinen Oberflächen spielen nur, solange man sie sieht.
   Nativer Scroll, nur transform. */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  var hatIO = 'IntersectionObserver' in window;

  /* Oberflächen im Telefon auf die Breite des Bildschirms skalieren (wie r4.js) */
  function skaliere() { alle('[data-fix]').forEach(function (f) { var b = f.parentElement.clientWidth; if (b) f.style.transform = 'scale(' + (b / +f.getAttribute('data-fix')) + ')'; }); }
  skaliere(); addEventListener('resize', skaliere); addEventListener('load', skaliere);

  /* einmalige Auftritte */
  var stuecke = alle('[data-st-fu],[data-st-weg],[data-st-k],[data-st-tel],[data-st-im],[data-ab],.st-fin [data-w="fin"]');
  function an(el) { el.classList.add(el.matches('[data-w="fin"]') ? 'los' : 'an'); }
  if (ruhig || !hatIO) stuecke.forEach(an);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { an(x.target); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -28% 0px' });
    stuecke.forEach(function (el) { io.observe(el); });
  }

  /* ein Ablauf, der nur läuft, solange das Stück zu gut einem Drittel im Bild ist */
  function solangeSichtbar(el, schritt, takt) {
    var uhr = null;
    function start() { if (!uhr) uhr = setInterval(schritt, takt); }
    function stop() { clearInterval(uhr); uhr = null; }
    if (ruhig || !hatIO) return;
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: .35 }).observe(el);
  }
  function einmal(el, los) {
    if (ruhig || !hatIO) { los(true); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); los(false); } }, { rootMargin: '0px 0px -30% 0px' });
    o.observe(el);
  }
  /* Rolle mit n Einträgen plus Wiederholung des ersten: läuft weiter und springt am Ende unsichtbar zurück */
  function rolle(zug, n, i) {
    zug.style.setProperty('--z', i);
    if (i === n) setTimeout(function () { zug.style.transition = 'none'; zug.style.setProperty('--z', 0); zug.offsetHeight; zug.style.transition = ''; }, 1000);
  }

  /* Zimmer-Finder: die Wünsche rollen, ein Zeiger tippt auf «Zimmer zeigen», dann ordnen sich die Zimmer, das passendste bekommt den Goldrand */
  alle('[data-zf]').forEach(function (zf) {
    var faelle = zf.getAttribute('data-raenge').split('|').map(function (s) { return s.split(',').map(Number); });
    var karten = alle('[data-zf-k]', zf), zuege = alle('.zf-zug', zf), knopf = zf.querySelector('.zf-knopf'), maus = zf.querySelector('.zf-maus'), k = 0;
    function ordne(i) { var r = faelle[i % faelle.length]; karten.forEach(function (c, j) { c.style.setProperty('--r', r[j]); c.classList.toggle('erst', r[j] === 0); }); }
    function hin(el, dx, dy) {
      if (!maus || !el) return; var a = zf.getBoundingClientRect(), b = el.getBoundingClientRect();
      maus.style.transform = 'translate(' + (b.left - a.left + b.width * dx - 11).toFixed(0) + 'px,' + (b.top - a.top + b.height * dy - 11).toFixed(0) + 'px)';
    }
    var ruhe = function () { hin(zf, .9, .9); };
    ordne(0); ruhe();
    solangeSichtbar(zf, function () {
      k = k + 1; var i = k;
      zuege.forEach(function (z) { rolle(z, faelle.length, i); });
      setTimeout(function () { hin(knopf, .5, .55); }, 700);
      setTimeout(function () { maus.classList.remove('klick'); maus.offsetWidth; maus.classList.add('klick'); knopf.classList.add('gedrueckt'); }, 1750);
      setTimeout(function () { knopf.classList.remove('gedrueckt'); ordne(i); }, 1950);
      setTimeout(ruhe, 2700);
      if (k === faelle.length) k = 0;
    }, 4600);
    addEventListener('resize', ruhe);
  });

  /* Sprachen rollen */
  alle('[data-st-spr]').forEach(function (s) {
    var zug = s.firstElementChild, n = zug.children.length - 1, k = 0;
    solangeSichtbar(s, function () { k = k + 1; rolle(zug, n, k); if (k === n) k = 0; }, 1900);
  });

  /* Vor Ihrer Anreise: die Angaben werden eingetippt, dann geht alles an die Rezeption */
  alle('[data-va]').forEach(function (va) {
    var felder = alle('dd[data-va-t]', va);
    einmal(va, function (sofort) {
      if (sofort) { felder.forEach(function (f) { f.firstChild.textContent = f.getAttribute('data-va-t'); }); va.classList.add('fertig'); return; }
      var i = 0;
      (function feld() {
        if (i >= felder.length) { setTimeout(function () { va.classList.add('fertig'); }, 450); return; }
        var f = felder[i], t = f.getAttribute('data-va-t'), c = 0; f.classList.add('tippt');
        (function zeichen() {
          f.firstChild.textContent = t.slice(0, ++c);
          if (c < t.length) setTimeout(zeichen, 38);
          else { f.classList.remove('tippt'); i++; setTimeout(feld, 260); }
        })();
      })();
    });
  });

  /* Planer: ein Ausflug nach dem anderen wird gewählt und springt in seinen Tag */
  alle('[data-pl]').forEach(function (pl) {
    var chips = alle('.pl-c', pl), eintr = alle('[data-pl-e]', pl);
    einmal(pl, function (sofort) {
      chips.forEach(function (c, i) {
        var e = eintr.filter(function (x) { return +x.getAttribute('data-pl-e') === i; })[0];
        if (sofort) { c.classList.add('an'); if (e) e.classList.add('an'); return; }
        setTimeout(function () { c.classList.add('an'); }, 300 + i * 900);
        setTimeout(function () { if (e) e.classList.add('an'); }, 650 + i * 900);
      });
    });
  });

  /* Abfahrten: Minuten bis zur Abfahrt, gerechnet ab 10:58 */
  alle('[data-ab]').forEach(function (ab) {
    alle('.ab-z', ab).forEach(function (z) {
      var t = z.querySelector('b').textContent.split(':'), m = (+t[0]) * 60 + (+t[1]) - (10 * 60 + 58);
      z.querySelector('em').textContent = 'in ' + m + ' Min.';
    });
  });

  /* Im Haus: Punkt in der Liste und Zeile im Telefon leuchten gemeinsam */
  alle('[data-st-s3]').forEach(function (l) {
    var li = alle('li', l), zeilen = alle('[data-st-tel] .zm-liste li'), k = -1;
    function zeige(i) { li.forEach(function (x, j) { x.classList.toggle('an', j === i); }); zeilen.forEach(function (x, j) { x.classList.toggle('hl', j === i); }); }
    solangeSichtbar(l, function () { k = (k + 1) % li.length; zeige(k); }, 2200);
  });

  /* Abreise: die Uhr läuft, die Minuten bis zur Abfahrt zählen mit */
  alle('[data-ab-uhr]').forEach(function (u) {
    var ab = u.closest('[data-ab]'), sek = 10 * 3600 + 58 * 60;
    function zwei(n) { return (n < 10 ? '0' : '') + n; }
    solangeSichtbar(ab, function () {
      sek++; u.textContent = zwei(Math.floor(sek / 3600)) + ':' + zwei(Math.floor(sek / 60) % 60) + ':' + zwei(sek % 60);
      alle('.ab-z', ab).forEach(function (z) {
        var t = z.querySelector('b').textContent.split(':'), m = Math.ceil(((+t[0]) * 3600 + (+t[1]) * 60 - sek) / 60);
        z.querySelector('em').textContent = m > 0 ? 'in ' + m + ' Min.' : 'jetzt';
      });
    }, 1000);
  });

  /* Für Ihr Team (Fassung 5): sechs Nachrichten nacheinander, dann die eine vollständige Anfrage; läuft nur, solange man hinsieht */
  alle('[data-fzn]').forEach(function (el) {
    var n = +el.getAttribute('data-fzn'), t = el.getAttribute('data-fzt').split(',').map(Number), k = 0, uhr = null;
    function setze(j) { for (var i = 1; i <= n; i++) el.classList.toggle('s' + i, i <= j); }
    function tick() { k = (k + 1) % (n + 1); setze(k); uhr = setTimeout(tick, t[Math.min(k, t.length - 1)]); }
    if (ruhig || !hatIO) { setze(+el.getAttribute('data-fzende')); return; }
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) {
        /* Robert 03.11.2026: nie leer. Beim ersten Hinsehen steht das ganze Gespräch da, dann folgt die Karte und der Ablauf beginnt von vorn; ohne Skript bleibt alles sichtbar */
        if (!el.classList.contains('laeuft')) { k = n - 2; setze(k); el.classList.add('laeuft'); }
        if (!uhr) uhr = setTimeout(tick, t[Math.min(k, t.length - 1)]);
      } else { clearTimeout(uhr); uhr = null; }
    }, { threshold: .3 }).observe(el);
  });

  /* Für Ihr Team: der Lichtpunkt läuft nur, solange man hinsieht */
  alle('[data-st-fl]').forEach(function (f) {
    if (ruhig || !hatIO) return;
    new IntersectionObserver(function (es) { f.classList.toggle('spielt', es[0].isIntersecting); }, { threshold: .4 }).observe(f);
  });

  /* Auftakt: das Bild zieht beim Scrollen langsamer mit */
  (function () {
    var b = document.querySelector('.st-auf__b'); if (!b || ruhig) return; var wartet = false;
    function setze() { wartet = false; var y = scrollY; if (y > innerHeight * 1.2) return; b.style.transform = 'translate3d(0,' + (y * .32).toFixed(1) + 'px,0)'; }
    addEventListener('scroll', function () { if (!wartet) { wartet = true; requestAnimationFrame(setze); } }, { passive: true });
  })();

  /* Diese Fragen kennen wir: eine nach der anderen leuchtet auf */
  alle('[data-st-fr]').forEach(function (l) {
    var li = alle('li', l), k = 0;
    li[0].classList.add('an');
    solangeSichtbar(l, function () { li[k].classList.remove('an'); k = (k + 1) % li.length; li[k].classList.add('an'); }, 2300);
  });
})();

/* Nach der Buchung (Robert 02.11.2026): was der Gast eintippt, steht im Haus bereit (aus _varianten/vorfreude-15/v.js) */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  /* 07: was der Gast eintippt, steht im Haus bereit */
  alle('[data-vf07-g]').forEach(function (g) {
    var dd = alle('dd[data-va-t]', g), li = alle('[data-vf07]', g);
    if (ruhig || !window.MutationObserver) { li.forEach(function (x) { x.classList.add('an'); }); return; }
    new MutationObserver(function () {
      var irgend = false;
      dd.forEach(function (d, i) {
        if (d.classList.contains('tippt')) irgend = true;
        else if (d.firstChild.textContent === d.getAttribute('data-va-t') && li[i] && !li[i].classList.contains('an')) setTimeout(function () { li[i].classList.add('an'); }, 500);
      });
      g.classList.toggle('laeuft', irgend);
    }).observe(g, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });

})();

/* «Bevor er bucht» = Fassung 10 «Kino» aus _varianten/zimmer-15 (Robert 02.11.2026): die Wünsche rollen, das passende Zimmer zieht herein. */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches, hatIO = 'IntersectionObserver' in window;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  function rolle(zug, n, i) {
    zug.style.setProperty('--z', i);
    if (i === n) setTimeout(function () { zug.style.transition = 'none'; zug.style.setProperty('--z', 0); zug.offsetHeight; zug.style.transition = ''; }, 1000);
  }

  /* Wunsch → Zimmer */
  alle('[data-vf]').forEach(function (c) {
    var R = c.getAttribute('data-raenge').split('|').map(function (s) { return s.split(',').map(Number); }), n = R.length, k = 0, uhr = null;
    var zi = alle('[data-zi]', c), zuege = alle('.vr-zug', c);
    function setze(i) {
      var r = R[i % n];
      c.style.setProperty('--b', r.indexOf(0));
      var vorher = zi.filter(function (el) { return el.classList.contains('erst'); });
      zi.forEach(function (el) {
        var j = +el.getAttribute('data-zi');
        el.classList.remove('vorher');
        el.style.setProperty('--r', r[j]);
        el.classList.toggle('erst', r[j] === 0);
      });
      vorher.forEach(function (el) { if (!el.classList.contains('erst')) el.classList.add('vorher'); });
    }
    setze(0);
    if (ruhig || !hatIO) return;
    function schritt() {
      k = k + 1; var i = k;
      zuege.forEach(function (z) { rolle(z, n, i); });
      setTimeout(function () { setze(i); }, 450);
      if (k === n) k = 0;
    }
    /* Robert 03.11.2026: schneller wechseln, damit man den Zweck versteht, aber lesbar bleiben (vorher alle 4,4 s) */
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!uhr) uhr = setInterval(schritt, 2600); }
      else { clearInterval(uhr); uhr = null; }
    }, { threshold: .35 }).observe(c);
  });

  /* einmalige Auftritte */
  var einmal = alle('[data-van]');
  if (ruhig || !hatIO) einmal.forEach(function (el) { el.classList.add('an'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('an'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -22% 0px' });
    einmal.forEach(function (el) { io.observe(el); });
  }

})();

/* Am Abreisetag: Zwei Wege (Robert 02.11.2026, Fassung 4 aus _varianten/abreise-15b): die beiden Hälften steigen versetzt herein,
   die Minuten bis zur Abfahrt zählen ab 10:58 mit und die Linie füllt sich bis zum nächsten Zug, nur solange man hinsieht. */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches, hatIO = 'IntersectionObserver' in window;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  function abfahrt(t) { var x = t.split(':'); return (+x[0]) * 3600 + (+x[1]) * 60; }
  var START = 10 * 3600 + 58 * 60;
  alle('.ab15 [data-a]').forEach(function (el) {
    if (ruhig || !hatIO) { el.classList.add('an'); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); el.classList.add('an'); } }, { rootMargin: '0px 0px -18% 0px' });
    o.observe(el);
  });
  function minuten(box, sek) {
    alle('[data-t]', box).forEach(function (m) { var r = Math.ceil((abfahrt(m.getAttribute('data-t')) - sek) / 60); m.textContent = r > 0 ? 'in ' + r + ' Min.' : 'jetzt'; });
    alle('[data-bar]', box).forEach(function (b) { var ab = abfahrt(b.getAttribute('data-bar')); b.style.setProperty('--p', Math.max(0, Math.min(1, 1 - (ab - sek) / (ab - START + 60))).toFixed(3)); });
  }
  alle('.ab15 [data-uhrbox]').forEach(function (box) {
    var sek = START, uhr = null; minuten(box, sek);
    if (ruhig || !hatIO) return;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!uhr) uhr = setInterval(function () { sek++; minuten(box, sek); }, 1000); }
      else { clearInterval(uhr); uhr = null; }
    }, { threshold: .3 }).observe(box);
  });
})();

/* Tage in Hamburg (Robert 03.11.2026): die drei Fenster steigen auf, sobald sie gut im Bild sind (aus nachbuchung/b.js) */
(function () {
  'use strict';
  var els = [].slice.call(document.querySelectorAll('[data-nb-an]'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('an'); }); return; }
  els.forEach(function (el) {
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); el.classList.add('an'); } }, { rootMargin: '0px 0px -25% 0px' });
    o.observe(el);
  });
})();

/* Vorbereitung (Robert 03.11.2026): Haken im Takt der getippten Angaben (aus nachbuchung/b.js) */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  /* Haken im Takt: sobald eine Angabe fertig getippt ist, bekommt das Ziel mit derselben Nummer .an; nach dem Senden .fertig */
  alle('[data-sync]').forEach(function (g) {
    var dd = alle('dd[data-va-t]', g), va = g.querySelector('[data-va]');
    function ziel(i) { return alle('[data-s="' + i + '"]', g); }
    if (ruhig || !window.MutationObserver) { alle('[data-s]', g).forEach(function (x) { x.classList.add('an'); }); g.classList.add('fertig'); return; }
    new MutationObserver(function () {
      var irgend = false;
      dd.forEach(function (d, i) {
        if (d.classList.contains('tippt')) irgend = true;
        else if (d.firstChild.textContent === d.getAttribute('data-va-t')) ziel(i).forEach(function (x) { if (!x.classList.contains('an')) setTimeout(function () { x.classList.add('an'); }, 450); });
      });
      g.classList.toggle('laeuft', irgend);
      if (va && va.classList.contains('fertig') && !g.classList.contains('fertig')) setTimeout(function () { g.classList.add('fertig'); }, 700);
    }).observe(g, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });

})();

/* «Diese Fragen kennen wir.»: Band zum Blättern wie auf der Startseite (r4.js), Pfeile schieben um eine Karte */
(function () {
  [].slice.call(document.querySelectorAll('.st [data-frband]')).forEach(function (band) {
    var ab = band.closest('section');
    [].slice.call(ab.querySelectorAll('[data-band]')).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = band.querySelector('.fr-k'), w = k ? k.getBoundingClientRect().width + 2 : 400;
        band.scrollBy({ left: +b.dataset.band * w, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    });
  });
})();

/* Fragen-Band: Karten schweben beim Hineinscrollen einmal herein (Stile «Reinschweben von rechts edel» in st.css) */
(function () {
  var ab = document.querySelector('.st-frb');
  if (!ab || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].slice.call(ab.querySelectorAll('.fr-k')).forEach(function (k, i) { k.style.setProperty('--i', i); });
  if (ab.getBoundingClientRect().top < innerHeight * .8) return;   // schon im Bild (Sprung per Anker): nicht verstecken
  ab.classList.add('vor');
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); ab.classList.remove('vor');
  }, { rootMargin: '0px 0px -22% 0px' });
  io.observe(ab.querySelector('.fr-band'));
})();
