/* Suitenhotel Zurbriggen, Zermatt · Startseite «Vom Gipfel bis ins Ziel» (Station 07, Neubau 18.10.2026). Nur transform, nativer Scroll, nichts springt,
   nichts startet unsichtbar. Aufbau: 1 Zeilen und Auftritte · 2 Szenen am Scrollen (eine Schleife, je Szene eine Funktion) · 3 Kopf, Menü, Fenster ·
   4 Auswahl im Hausstil (Kalender, Liste) · 5 die Gegenstände der Abschnitte (Zieltafel, Glastür, Türanhänger, Gondel, Spuren, Rennkarte, Täler). */
(function () {
  'use strict';
  var D = document, W = window, ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]ruhig/.test(location.search);
  var $ = function (s, c) { return (c || D).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var klemm = function (v, a, b) { return v < a ? a : v > b ? b : v; }, stueck = function (p, a, b) { return klemm((p - a) / (b - a), 0, 1); };
  var weich = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var raus = function (t) { return 1 - Math.pow(1 - t, 3); };
  W.ZM = { $: $, $$: $$, klemm: klemm, stueck: stueck, weich: weich, raus: raus, ruhig: ruhig };

  /* ---------- 1 Titel in echte Zeilen schneiden (je Zeile ein Schlitz), Auftritte beim Ankommen ---------- */
  function zeilen(el) {
    if (!el.dataset.orig) el.dataset.orig = el.innerHTML; else el.innerHTML = el.dataset.orig;
    var worte = [];
    (function teile(knoten, hulle) {
      [].slice.call(knoten.childNodes).forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return; if (/^\s+$/.test(t)) { worte.push(null); return; }
          var s = D.createElement(hulle || 'span'); s.className = 'w'; s.textContent = t; worte.push(s);
        });
        else if (n.nodeType === 1) { if (n.tagName === 'BR') { worte.push('br'); return; } teile(n, n.tagName.toLowerCase()); }
      });
    })(el, null);
    el.innerHTML = '';
    worte.forEach(function (w) { el.appendChild(w === null ? D.createTextNode(' ') : (w === 'br' ? D.createElement('br') : w)); });
    var reihen = [], oben = null;
    $$('.w', el).forEach(function (w) { var t = w.offsetTop; if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; } reihen[reihen.length - 1].push(w); });
    el.innerHTML = '';
    reihen.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'z'; var s = D.createElement('span'); z.style.setProperty('--z', i);
      s.style.setProperty('--z', i);
      r.forEach(function (w, j) { if (j) s.appendChild(D.createTextNode(' ')); s.appendChild(w); }); z.appendChild(s); el.appendChild(z);
    });
  }
  var titel = $$('[data-zeilen]');
  (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(function () {
    titel.forEach(zeilen); D.documentElement.classList.add('bereit'); messen(); jetzt();
  });
  var bw = innerWidth, t0;
  addEventListener('resize', function () { clearTimeout(t0); t0 = setTimeout(function () { if (innerWidth !== bw) { bw = innerWidth; titel.forEach(zeilen); } messen(); jetzt(); }, 160); });

  var gruppe = new Map();
  $$('[data-r]').forEach(function (el) { var g = el.parentElement, n = gruppe.get(g) || 0; gruppe.set(g, n + 1); if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(n, 6)); });
  var ziele = $$('[data-r],[data-zeilen],[data-da]');
  if (ruhig || !('IntersectionObserver' in W)) ziele.forEach(function (e) { e.classList.add('da'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); e.target.dispatchEvent(new Event('da')); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -7% 0px' });
    ziele.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 2 Szenen: hohe Abschnitte mit stehender Bühne; p = 0 … 1 über den Weg der Bühne ---------- */
  var szenen = [];
  W.ZM.szene = function (el, fn, opt) { szenen.push({ el: el, fn: fn, opt: opt || {}, oben: 0, weg: 1, p: -1 }); };
  function messen() {
    var y = scrollY, vh = innerHeight;
    szenen.forEach(function (s) { var r = s.el.getBoundingClientRect(); s.oben = r.top + y - (s.opt.vor ? vh * s.opt.vor : 0); s.weg = Math.max(1, r.height - (s.opt.ganz ? 0 : vh) + (s.opt.vor ? vh * s.opt.vor : 0)); s.vh = vh; s.p = -1; });
  }
  W.ZM.messen = messen;
  var laeuft = false;
  function jetzt() {
    laeuft = false; var y = scrollY;
    for (var i = 0; i < szenen.length; i++) {
      var s = szenen[i], p = klemm((y - s.oben) / s.weg, 0, 1);
      if (y + s.vh * 1.5 < s.oben || y - s.vh > s.oben + s.weg + s.vh) { if (s.p !== -2) { s.fn(y < s.oben ? 0 : 1, s); s.p = -2; } continue; }
      if (Math.abs(p - s.p) > .0004) { s.p = p; s.fn(ruhig ? (p > .5 ? 1 : p) : p, s); }
    }
  }
  addEventListener('scroll', function () { if (!laeuft) { laeuft = true; requestAnimationFrame(jetzt); } }, { passive: true });
  addEventListener('load', function () { messen(); jetzt(); });
  if ('ResizeObserver' in W) new ResizeObserver(function () { messen(); jetzt(); }).observe(D.body);

  /* Auftakt: Gipfel steigt und wächst, Wort bleibt zurück, die blaue Stunde schiebt sich herein, dann Gruss und Startliste */
  var auf = $('.auf');
  if (auf) {
    var wort = $('.auf__wort', auf), berg = $('.auf__berg', auf), pinsel = $('.auf__pinsel', auf), abend = $('.auf__abend', auf), abendB = $('.auf__abend > .bild', auf),
      abendI = $('.auf__abend img', auf), gruss = $('.auf__gruss', auf), ort = $('.auf__name', auf), runter = $('.auf__runter', auf);
    W.ZM.szene(auf, function (p) {
      var a = weich(stueck(p, 0, .62)), b = weich(stueck(p, .3, .8)), c = raus(stueck(p, .72, 1));
      wort.style.transform = 'translate3d(0,' + (-a * 26) + 'svh,0) scale(' + (1 - a * .08) + ')';
      berg.style.transform = 'translate3d(0,' + (-a * 22) + '%,0) scale(' + (1 + a * .32) + ')';
      pinsel.style.transform = 'translate3d(' + (a * 6) + 'vw,' + (-a * 70) + 'svh,0) rotate(' + (a * -8) + 'deg)';
      abend.style.transform = 'translate3d(0,' + ((1 - b) * 100) + '%,0)';
      abendB.style.transform = 'translate3d(0,' + (-(1 - b) * 100) + '%,0)';
      abendI.style.transform = 'scale(' + (1.18 - b * .18) + ')';
      gruss.style.transform = 'translate3d(0,' + ((1 - c) * 100) + 'svh,0)';
      ort.style.transform = runter.style.transform = 'translate3d(0,' + (b * 30) + 'svh,0)';
      if (c > .2 && !gruss.classList.contains('da')) { gruss.classList.add('da'); $$('[data-zeilen]', gruss).forEach(function (t) { t.classList.add('da'); }); }
    });
  }


  /* Pirmins Abfahrt: das Zeichen fährt das Profil hinunter, die Welt rollt mit, Spur, Tore, Jahr */
  var abf = $('.abf');
  if (abf) {
    var welt = $('.abf__welt', abf), stuecke = $$('.abf__stueck', abf), fahrer = $('.abf__fahrer', abf), jahrEl = $('[data-jahr]', $('.abf__uhr', abf)),
      hoehen = JSON.parse($('.abf__daten', abf).textContent), tore = $$('.abf__tor,.abf__ziel', abf), buehne = $('.abf__buehne', abf), bergB = $('.abf__berg', abf);
    var hBei = function (x) { var f = klemm(x, 0, 1) * (hoehen.length - 1), i = Math.floor(f), t = f - i; return hoehen[i] + ((hoehen[Math.min(i + 1, hoehen.length - 1)] - hoehen[i]) * t); };
    var masse = {};
    var neuMessen = function () { masse.vw = buehne.clientWidth; masse.vh = buehne.clientHeight; masse.sw = stuecke[0].offsetWidth; masse.ww = masse.sw * stuecke.length; masse.fw = fahrer.offsetWidth; masse.fh = fahrer.offsetHeight; };
    neuMessen(); addEventListener('resize', neuMessen);
    /* Safari misst die Bühne beim Start teils mit anderer Breite: bei jeder Grössenänderung der Bühne neu messen, sonst bleibt rechts ein Streifen frei */
    if ('ResizeObserver' in W) new ResizeObserver(function () { neuMessen(); messen(); jetzt(); }).observe(buehne);
    addEventListener('load', neuMessen);
    W.ZM.szene(abf, function (p) {
      if (!masse.ww) neuMessen();
      var xf = .03 + p * .93, x = xf * masse.ww, y = hBei(xf) * masse.vh;
      var schub = klemm(x - masse.vw * (masse.vw < 761 ? .3 : .4), 0, masse.ww - masse.vw);
      stuecke.forEach(function (st, i) {
        var links = i * masse.sw - schub, sichtbar = links < masse.vw + 400 && links + masse.sw > -400;
        st.style.visibility = sichtbar ? '' : 'hidden'; if (!sichtbar) return;
        st.style.transform = 'translate3d(' + links + 'px,0,0)';
        var rest = klemm((i + 1) * masse.sw - x, 0, masse.sw), box = st.children[1], sv = box.firstChild;
        box.style.transform = 'translate3d(' + (-rest) + 'px,0,0)'; sv.style.transform = 'translate3d(' + rest + 'px,0,0)';
      });
      if (bergB) bergB.style.transform = 'translate3d(' + (masse.ww * .8 - masse.vw * .5 - schub * 1) + 'px,0,0)';
      var dy = (hBei(xf + .004) - hBei(xf - .004)) * masse.vh, dx = .008 * masse.ww, winkel = Math.atan2(dy, dx) * 180 / Math.PI;
      fahrer.style.transform = 'translate3d(' + (x - schub - masse.fw * .5) + 'px,' + (y - masse.fh * .92) + 'px,0) rotate(' + (winkel * .6) + 'deg)';
      var jahr = '1963';
      tore.forEach(function (t) { var an = xf >= +t.dataset.x - .004; t.classList.toggle('durch', an); if (an) jahr = t.dataset.jahr; });
      if (jahrEl.textContent !== jahr) jahrEl.textContent = jahr;
    });
  }


  /* Zieltafel: Klappziffern fallen beim Ankommen an ihren Platz; Zeile antippen → Foto der Suite schiebt sich als Vorhang über das alte */
  /* Zeitmessung: jede Ziffer dreht sich einmal langsam an ihren Platz (kein Klappern) */
  $$('[data-dreh]').forEach(function (z) {
    $$('.fl:not(.leer)', z).forEach(function (fl, i) { fl.style.setProperty('--n', i); });
    z.addEventListener('da', function () { z.classList.add('gedreht'); });
    if (ruhig) z.classList.add('gedreht');
  });
  var tafel = $('[data-tafel]');
  if (tafel) {
    var buehne2 = $('.buehne'), bilder2 = $$('.buehne__bild', buehne2), info = JSON.parse($('script[type="application/json"]', buehne2).textContent);
    var nameEl = $('[data-name]', buehne2), datEl = $('[data-daten]', buehne2), zeilen2 = $$('.tafel__zeile', tafel), aktiv = 0;
    zeilen2.forEach(function (z) {
      z.addEventListener('click', function () {
        var i = +z.dataset.i; if (i === aktiv) return;
        zeilen2.forEach(function (x) { x.setAttribute('aria-pressed', x === z ? 'true' : 'false'); });
        var alt = bilder2[aktiv], neu2 = bilder2[i], im = $('img', neu2);
        neu2.classList.remove('rein'); neu2.style.zIndex = 2; alt.style.zIndex = 1;
        neu2.style.transform = 'translateX(-101%)'; im.style.transform = 'translateX(101%) scale(1.1)';
        void neu2.offsetWidth; neu2.classList.add('rein');
        neu2.style.transform = 'translateX(0)'; im.style.transform = 'translateX(0) scale(1)';
        setTimeout(function () { alt.classList.remove('an'); alt.style.transform = ''; neu2.classList.add('an'); }, ruhig ? 0 : 1000);
        nameEl.textContent = info[i].name; datEl.textContent = info[i].daten; aktiv = i;
      });
    });
  }


  /* Glastür: zwei Flügel gleiten auseinander, der Blick wird weit, dann der Satz */
  var tuer = $('.tuer');
  if (tuer) {
    var fl = $('.tuer__fluegel--l', tuer), fr = $('.tuer__fluegel--r', tuer), blick = $('.tuer__blick img', tuer), tsatz = $('.tuer__satz', tuer);
    W.ZM.szene(tuer, function (p) {
      var a = weich(stueck(p, .12, .7)), c = raus(stueck(p, .6, .95));
      fl.style.transform = 'translate3d(' + (-a * 101) + '%,0,0)'; fr.style.transform = 'translate3d(' + (a * 101) + '%,0,0)';
      blick.style.transform = 'scale(' + (1.18 - a * .18) + ')';
      tsatz.style.transform = 'translate3d(0,' + ((1 - c) * 50) + 'svh,0)';
    });
  }

  /* Servierglocke: hebt sich beim Durchscrollen vom Tablett und kippt zur Seite */
  var glocke = $('[data-glocke]');
  if (glocke) {
    var haube = $('.glocke__haube', glocke);
    W.ZM.szene(glocke, function (p) {
      var a = weich(stueck(p, .18, .62));
      haube.style.transform = 'translate3d(' + (a * 34) + '%,' + (-a * 118) + '%,0) rotate(' + (a * 16) + 'deg)';
    }, { vor: .9, ganz: true });
  }
  /* Türanhänger: abschicken → die Karte dreht sich um («Bis morgen») */


  /* Gondel: die Kabine fährt das Seil hinauf; auf halber Strecke wechseln die Scheiben vom Winter in den Sommer */
  var gon = $('.gon');
  if (gon) {
    var kab = $('.gon__kabine', gon), streifen = $$('.gon__streifen', gon), jz = $$('[data-jz] span', gon), gb = $('.gon__buehne', gon), sommer = null;
    W.ZM.szene(gon, function (p) {
      var w = gb.clientWidth, h = gb.clientHeight, kw = kab.offsetWidth, t = stueck(p, 0, 1);
      var schm = w < 761, y0 = schm ? .78 : .82, fall = schm ? .40 : .73, x = -kw * .6 + t * (w + kw * .2), seilY = (y0 - (x + kw / 2) / w * fall) * h;
      kab.style.transform = 'translate3d(' + x + 'px,' + (seilY + 124) + 'px,0)';
      var so = p > .5;
      if (so !== sommer) { sommer = so; streifen.forEach(function (st, i) { st.style.transition = 'transform 1.8s cubic-bezier(.65,0,.25,1) ' + (i * 160) + 'ms'; st.style.transform = so ? 'translate3d(0,-50%,0)' : 'none'; }); jz[0].classList.toggle('an', !so); jz[1].classList.toggle('an', so); }
    });
  }

  /* Spuren im Schnee: Abdrücke entlang eines Wegs durch die freien Stellen zwischen den Halten; jeder drückt sich beim Ankommen ein */
  var spu = $('.spu');
  if (spu) {
    var lage = $('.spu__abdruecke', spu), halte = $$('[data-halt]', spu), sio;
    var FUSS = '<svg viewBox="0 0 20 44"><path d="M10 1 C 16 1, 19 8, 18 16 C 17 23, 14 26, 13 28 L7 28 C 6 26, 3 23, 2 16 C 1 8, 4 1, 10 1 Z"/><path class="in" d="M6 32 C 6 30, 14 30, 14 32 L 14 39 C 14 43, 6 43, 6 39 Z"/></svg>';
    var spuren = function () {
      lage.innerHTML = ''; if (sio) sio.disconnect();
      var r0 = spu.getBoundingClientRect(), w = r0.width, schmal = w < 761, zuege = [];
      if (schmal) {
        /* am Handy nur quer durch die Lücken zwischen den Halten, nie über Bild oder Text */
        var teile2 = [$('.spu__kopf', spu)].concat(halte);
        for (var g = 0; g < teile2.length - 1; g++) {
          var u2 = teile2[g].getBoundingClientRect().bottom - r0.top, o2 = teile2[g + 1].getBoundingClientRect().top - r0.top, m = (u2 + o2) / 2;
          zuege.push(g % 2 ? [[w * .9, m - 12], [w * .1, m + 12]] : [[w * .1, m - 12], [w * .9, m + 12]]);
        }
      } else {
        var pts = [];
        halte.forEach(function (h) {
          var r = h.getBoundingClientRect(), oben = r.top - r0.top, unten = r.bottom - r0.top, rechtsFrei = !h.classList.contains('halt--r');
          var fx = rechtsFrei ? Math.min(w - 60, r.right - r0.left + (w - (r.right - r0.left)) / 2) : Math.max(60, (r.left - r0.left) / 2);
          pts.push([fx, oben - 44]); pts.push([fx + (rechtsFrei ? 24 : -24), unten + 44]);
        });
        zuege.push(pts);
      }
      var weg = [], schritt = schmal ? 46 : 84;
      zuege.forEach(function (pts) {
        for (var i = 0; i < pts.length - 1; i++) {
          var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n = Math.max(1, Math.floor(l / schritt));
          for (var k = 0; k < n; k++) weg.push([a[0] + dx * k / n, a[1] + dy * k / n, Math.atan2(dy, dx) * 180 / Math.PI + 90]);
        }
      });
      sio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('da'); sio.unobserve(en.target); } }); }, { rootMargin: '0px 0px -18% 0px' });
      weg.forEach(function (q, j) {
        var seite = j % 2 ? 7 : -7, rad = (q[2] - 90) * Math.PI / 180, ox = -Math.sin(rad) * seite, oy = Math.cos(rad) * seite;
        var el = D.createElement('i'); el.className = 'spur' + (ruhig ? ' da' : ''); el.innerHTML = FUSS;
        el.style.left = (q[0] + ox) + 'px'; el.style.top = (q[1] + oy) + 'px'; el.style.setProperty('--d', 'rotate(' + q[2] + 'deg)' + (j % 2 ? ' scaleX(-1)' : ''));
        lage.appendChild(el); if (!ruhig) sio.observe(el);
      });
    };
    (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(function () { setTimeout(spuren, 300); });
    var sw = innerWidth; addEventListener('resize', function () { if (innerWidth !== sw) { sw = innerWidth; setTimeout(spuren, 300); } });
  }

  /* Sprung: das stehende Bild ist nur sichtbar, solange sein Abschnitt im Blick ist */
  var fio = new IntersectionObserver(function (es) { es.forEach(function (en) { en.target.classList.toggle('an', en.isIntersecting); }); }, { rootMargin: '5% 0px 5% 0px' });
  $$('.sprung').forEach(function (b) { fio.observe(b); });

  /* Rennkarte: die Felder klappen nacheinander auf; die Zieluhr läuft auf 18.00 */
  var karte = $('[data-karte]');
  if (karte) {
    var felder = $$('.karte__feld', karte), schmalK = function () { return innerWidth <= 860; };
    W.ZM.szene(karte, function (p) {
      felder.forEach(function (f, i) {
        var a = weich(stueck(p, .1 + i * .14, .36 + i * .14));
        f.style.transform = schmalK() ? 'rotateX(' + ((1 - a) * -90) + 'deg)' : 'rotateY(' + ((1 - a) * -100) + 'deg)';
        f.style.transformOrigin = schmalK() ? 'center top' : 'left center';
      });
    }, { vor: .95, ganz: true });
    var uhr = $('[data-uhr]'), uz = $('[data-uhrzeit]');
    var lauf = function () { var s2 = 50; var t = setInterval(function () { s2++; if (s2 >= 60) { clearInterval(t); uz.textContent = '18.00.00'; uhr.classList.add('ziel'); } else uz.textContent = '17.59.' + s2; }, 320); };
    if (ruhig) { uz.textContent = '18.00.00'; uhr.classList.add('ziel'); }
    else new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { lauf(); o.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' }).observe(uhr);
  }

  /* Zwei Täler: eine Regel trifft nur, wenn alle ihre Fragen beantwortet sind; das gewählte Tal hellt auf, im Saastal zieht das passende Haus herein */
  $$('[data-finder]').forEach(function (f) {
    var wahl = {}, daten = JSON.parse($('script[type="application/json"]', f).textContent), seiten = $$('.tal__seite', f);
    var zeige = function () {
      var t = daten.regeln.find(function (r) { return Object.keys(r.wenn).every(function (k) { return wahl[k] && r.wenn[k].indexOf(wahl[k]) >= 0; }); });
      if (!t && wahl.wo) t = daten.regeln.filter(function (r) { return r.wenn.wo && r.wenn.wo.indexOf(wahl.wo) >= 0 && Object.keys(r.wenn).length === 1; })[0];
      if (!t) return;
      var h = daten.haeuser[t.haus];
      seiten.forEach(function (sd) {
        var an = sd.dataset.tal === h.tal; sd.classList.toggle('an', an); sd.classList.toggle('aus', !an);
        if (!an) return;
        var im = $('.tal__bild img', sd);
        if (im.getAttribute('src') !== h.bild) { im.src = h.bild; im.alt = h.name; var fg = $('.tal__bild', sd); fg.classList.remove('wechsel'); void fg.offsetWidth; fg.classList.add('wechsel'); }
        $('b', sd).textContent = h.name; $('.tal__text p:not(.mono)', sd).textContent = t.satz;
        var a = $('a', sd); a.href = h.link; $('span', a).textContent = h.knopf; if (/^http/.test(h.link)) { a.target = '_blank'; a.rel = 'noopener'; } else a.removeAttribute('target');
      });
    };
    $$('.schalter', f).forEach(function (sc) {
      $$('button', sc).forEach(function (b) {
        b.addEventListener('click', function () { $$('button', sc).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); wahl[sc.dataset.frage] = b.dataset.wert; zeige(); });
      });
    });
  });

  /* Unterseiten · Vorhang (Suiten): ein Bild nach dem anderen zieht von rechts herein, die Bühne steht */
  $$('[data-vorhang]').forEach(function (v) {
    var fr = $$('.vh__bild', v), nr = $('[data-vh-nr]', v), n = fr.length, zuletzt = -1;
    if (n < 2) return;
    W.ZM.szene(v, function (p) {
      var k = p * (n - 1);
      for (var i = 1; i < n; i++) {
        var t = weich(klemm(k - (i - 1), 0, 1)), im = fr[i].firstElementChild;
        fr[i].style.transform = 'translate3d(' + ((1 - t) * 101) + '%,0,0)';
        im.style.transform = 'translate3d(' + (-(1 - t) * 60) + '%,0,0)';
      }
      var akt = Math.min(n, Math.round(k) + 1); if (nr && akt !== zuletzt) { nr.textContent = akt; zuletzt = akt; }
    });
  });

  /* Zermatt · Schneegrenze: der Winter weicht nach oben, die Grenze wandert mit, darunter der Sommer */
  var sch = $('.schnee');
  if (sch) {
    var wi = $('.schnee__winter', sch), wf = $('.schnee__winter figure', sch), gr = $('.schnee__grenze', sch), sb = $('.schnee__buehne', sch);
    W.ZM.szene(sch, function (p) {
      var h = sb.clientHeight, t = weich(stueck(p, .08, .9)), y = (1 - t) * h;
      wi.style.transform = 'translate3d(0,' + (-(t) * 100) + '%,0)'; wf.style.transform = 'translate3d(0,' + (t * 100) + '%,0)';
      gr.style.transform = 'translate3d(0,' + (y - 1) + 'px,0)';
    });
  }

  /* Wellness · warm und kalt laufen gegeneinander (nur am Rechner) */
  var geg = $('[data-gegen]');
  if (geg) {
    var warmS = $('.wk__spalte--warm', geg), kaltS = $('.wk__spalte--kalt', geg);
    W.ZM.szene(geg, function (p) {
      if (innerWidth < 761) { warmS.style.transform = kaltS.style.transform = ''; return; }
      var d = (p - .5) * 2 * 90;
      warmS.style.transform = 'translate3d(0,' + (d) + 'px,0)'; kaltS.style.transform = 'translate3d(0,' + (-d) + 'px,0)';
    }, { vor: 1, ganz: true });
  }

  /* Kapitel 4 · Suitenwahl: der Name wählt, die Bilder wechseln an derselben Stelle, nichts verschiebt sich */
  $$('[data-suitenwahl]').forEach(function (w) {
    var d = JSON.parse($('script[type="application/json"]', w).textContent), knoepfe = $$('.wahlzeile button', w), bilder = $$('.rahmen img', w);
    knoepfe.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i, x = d[i]; knoepfe.forEach(function (k) { k.setAttribute('aria-pressed', k === b ? 'true' : 'false'); });
        bilder.forEach(function (im, j) { var q = x.bilder[j]; if (!q) return; im.srcset = q.srcset; im.src = q.src; im.alt = q.alt; im.classList.remove('neu'); void im.offsetWidth; im.classList.add('neu'); });
        $('[data-feld=name]', w).textContent = x.name; $('[data-feld=m2]', w).textContent = x.m2; $('[data-feld=rest]', w).textContent = x.sz + ' · ' + x.p;
      });
    });
  });
  /* Kapitel 5 · Frühstück vorab wählen: abschicken zeigt «Bis morgen» an derselben Stelle */
  $$('.mo__platte form').forEach(function (fm) { fm.addEventListener('gesendet', function () { fm.parentNode.classList.add('gedreht'); }); });

  /* Zahlen zählen beim Ankommen (Kapitel 3: 1963 → 1998) */
  function zaehlen(el, von, bis, dauer) {
    if (ruhig) { el.textContent = bis; return; }
    var t0 = performance.now();
    (function schritt(t) { var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(von + (bis - von) * w); if (p < 1) requestAnimationFrame(schritt); })(t0);
  }
  $$('.z3__jahr[data-zaehl]').forEach(function (el) {
    el.textContent = el.dataset.zaehl;
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { zaehlen(el, +el.dataset.zaehl, +el.dataset.bis, 2600); o.disconnect(); } }, { rootMargin: '0px 0px -20% 0px' }).observe(el);
  });

  /* Kapitel 4 · Startliste: eine Suite wählen → die drei Fotos kommen nacheinander von unten an ihren Platz, die Fläche zählt */
  $$('[data-suiten4]').forEach(function (w) {
    var d = JSON.parse($('script[type="application/json"]', w).textContent), knoepfe = $$('.s4__liste button', w), plaetze = $$('[data-platz]', w), m2 = $('[data-feld=m2]', w), aktiv = 0;
    knoepfe.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i; if (i === aktiv) return; var alt = +d[aktiv].m2; aktiv = i; var x = d[i];
        knoepfe.forEach(function (k) { k.setAttribute('aria-pressed', k === b ? 'true' : 'false'); });
        plaetze.forEach(function (f, j) {
          var q = x.bilder[j]; if (!q) return; var im = new Image(); im.className = 'neu'; im.alt = q.alt; im.sizes = j ? '24vw' : '62vw'; im.srcset = q.srcset; im.src = q.src;
          var los = function () { f.appendChild(im); setTimeout(function () { im.classList.add('rein'); }, 30 + j * 160);
            setTimeout(function () { $$('img', f).forEach(function (o) { if (o !== im) o.remove(); }); im.classList.remove('neu', 'rein'); }, ruhig ? 0 : 1500 + j * 160); };
          if (im.complete) los(); else { im.onload = los; im.onerror = los; }
        });
        $('[data-feld=nr]', w).textContent = 'Suite ' + ('0' + (i + 1)).slice(-2); $('[data-feld=name]', w).textContent = x.name; $('[data-feld=rest]', w).textContent = x.sz + ' · ' + x.p;
        zaehlen(m2, alt, +x.m2, 1200);
      });
    });
  });

  /* ---------- 3 Kopf weicht beim Runterscrollen, kommt beim Hochscrollen; Menü; Fenster ---------- */
  var kopf = $('[data-kopf]'), zuletzt = scrollY;
  var aufK = $('#auftakt');
  function kopfHell() { if (kopf) kopf.classList.toggle('kopf--hell', !!aufK && scrollY < aufK.offsetHeight - innerHeight * .6); }
  kopfHell();
  addEventListener('scroll', function () { var y = scrollY; if (kopf) kopf.classList.toggle('weg', y > zuletzt && y > 240); zuletzt = y; kopfHell(); }, { passive: true });
  $$('[data-oeffne]').forEach(function (k) {
    k.addEventListener('click', function (ev) {
      var d = D.getElementById(k.dataset.oeffne); if (!d) return; ev.preventDefault();
      var q = k.closest('.startliste');
      if (q && d.id === 'buchen') { ['an', 'ab', 'pers'].forEach(function (n) { var a = $('[data-feld=' + n + ']', q), b = $('[data-feld=' + n + ']', d); if (a && b && a.dataset.wert) { b.dataset.wert = a.dataset.wert; $('b', b).textContent = $('b', a).textContent; } }); }
      d.showModal(); d.dispatchEvent(new Event('auf'));
    });
  });
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $$('[data-zu]', d).forEach(function (z) { z.addEventListener('click', function () { d.close(); }); });
    $$('a[href^="#"]', d).forEach(function (a) { a.addEventListener('click', function () { d.close(); }); });
  });
  $$('form[data-studie]').forEach(function (fm) { fm.addEventListener('submit', function (e) { e.preventDefault(); fm.classList.add('gesendet'); fm.dispatchEvent(new Event('gesendet')); }); });

  /* ---------- 4 Auswahl im Hausstil: Zeitraum-Kalender und Liste (nie die Auswahl des Browsers) ---------- */
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var TAG = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var heute = new Date(); heute.setHours(0, 0, 0, 0);
  var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var lesbar = function (d) { return d.getDate() + '. ' + MON[d.getMonth()].slice(0, 3) + (MON[d.getMonth()].length > 4 ? '.' : '') + ' ' + d.getFullYear(); };
  var offen = null;
  function zu() { if (offen) { offen.remove(); offen = null; } }
  D.addEventListener('pointerdown', function (e) { if (offen && !offen.contains(e.target) && !e.target.closest('[data-feld],[data-liste]')) zu(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  function legen(box, knopf) {
    (knopf.closest('dialog') || D.body).appendChild(box); offen = box;
    var r = knopf.getBoundingClientRect(), bw2 = box.offsetWidth, bh = box.offsetHeight;
    var x = klemm(r.left, 12, innerWidth - bw2 - 12), y = r.bottom + 10; if (y + bh > innerHeight - 12) y = Math.max(12, r.top - bh - 10);
    box.style.left = x + 'px'; box.style.top = y + 'px';
  }
  function kalender(knopf) {
    var gruppe2 = knopf.closest('[data-zeitraum]'), anK = $('[data-feld=an]', gruppe2), abK = $('[data-feld=ab]', gruppe2);
    var an = anK.dataset.wert ? new Date(anK.dataset.wert) : null, ab = abK.dataset.wert ? new Date(abK.dataset.wert) : null;
    var wahlAb = knopf === abK && an;
    var m = new Date((wahlAb ? an : (an || heute)).getTime()); m.setDate(1);
    var box = D.createElement('div'); box.className = 'wahl'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', wahlAb ? 'Abreise wählen' : 'Anreise wählen');
    function zeichne() {
      var h = '<div class="wahl__kopf"><button type="button" data-schritt="-1" aria-label="Monat zurück"></button><b>' + MON[m.getMonth()] + ' ' + m.getFullYear() + '</b><button type="button" data-schritt="1" aria-label="Monat vor"></button></div><div class="wahl__tage">';
      TAG.forEach(function (t) { h += '<span>' + t + '</span>'; });
      var erst = (m.getDay() + 6) % 7; for (var i = 0; i < erst; i++) h += '<i></i>';
      var tage = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= tage; d++) {
        var dt = new Date(m.getFullYear(), m.getMonth(), d), k = '';
        if (an && +dt === +an) k = 'an'; else if (ab && +dt === +ab) k = 'ab'; else if (an && ab && dt > an && dt < ab) k = 'zw';
        var aus = dt < heute || (wahlAb && dt <= an);
        h += '<button type="button" class="' + k + '" data-tag="' + iso(dt) + '"' + (aus ? ' disabled' : '') + '>' + d + '</button>';
      }
      box.innerHTML = h + '</div><p class="wahl__hinweis">' + (wahlAb ? 'Abreise wählen' : 'Anreise wählen') + '</p>';
    }
    zeichne();
    box.addEventListener('click', function (e) {
      var s = e.target.closest('[data-schritt]'); if (s) { m.setMonth(m.getMonth() + (+s.dataset.schritt)); zeichne(); return; }
      var t = e.target.closest('[data-tag]'); if (!t || t.disabled) return;
      var dt = new Date(t.dataset.tag);
      if (!wahlAb) { anK.dataset.wert = t.dataset.tag; $('b', anK).textContent = lesbar(dt); if (!ab || ab <= dt) { var n = new Date(dt); n.setDate(n.getDate() + 3); abK.dataset.wert = iso(n); $('b', abK).textContent = lesbar(n); } zu(); kalender(abK); }
      else { abK.dataset.wert = t.dataset.tag; $('b', abK).textContent = lesbar(dt); zu(); }
    });
    legen(box, knopf);
  }
  function liste(knopf) {
    var werte = JSON.parse(knopf.dataset.liste), box = D.createElement('div'); box.className = 'wahl'; box.setAttribute('role', 'listbox');
    box.innerHTML = '<div class="wahl__liste">' + werte.map(function (w) { return '<button type="button" role="option" aria-selected="' + (String(w[0]) === knopf.dataset.wert) + '" data-w="' + w[0] + '">' + w[1] + '</button>'; }).join('') + '</div>';
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (!b) return; knopf.dataset.wert = b.dataset.w; $('b', knopf).textContent = b.textContent; var inp = knopf.querySelector('input'); if (inp) inp.value = b.dataset.w; knopf.dispatchEvent(new Event('change', { bubbles: true })); zu(); });
    legen(box, knopf);
  }
  D.addEventListener('click', function (e) {
    var k = e.target.closest('[data-feld=an],[data-feld=ab]'); if (k) { e.preventDefault(); zu(); kalender(k); return; }
    var l = e.target.closest('[data-liste]'); if (l) { e.preventDefault(); var war = offen; zu(); if (!war) liste(l); }
  });
  /* Anfangswerte: heute in 30 Tagen, drei Nächte */
  $$('[data-zeitraum]').forEach(function (g) {
    var a = new Date(heute); a.setDate(a.getDate() + 30); var b = new Date(a); b.setDate(b.getDate() + 3);
    var anK = $('[data-feld=an]', g), abK = $('[data-feld=ab]', g); if (!anK || !abK) return;
    anK.dataset.wert = iso(a); $('b', anK).textContent = lesbar(a); abK.dataset.wert = iso(b); $('b', abK).textContent = lesbar(b);
  });

  /* Zimmer-Finder im Fenster «Buchen»: Personen → passende Suiten, grösste zuerst; gebucht wird über Mews */
  var buchen = D.getElementById('buchen');
  if (buchen) {
    var passend = $('.passend', buchen), pers = $('[data-feld=pers]', buchen), alle = JSON.parse($('script[type="application/json"]', buchen).textContent);
    var neu = function () {
      var p = +(pers.dataset.wert || 2), h = '';
      alle.filter(function (z) { return !z.max || z.max >= p; }).forEach(function (z) {
        h += '<a href="' + buchen.dataset.mews + '" target="_blank" rel="noopener"><img src="' + z.bild + '" alt="" loading="lazy"><span><b>' + z.name + '</b><small>' + z.daten + '</small></span>' + (z.nr ? '<span class="nr">' + ('0' + z.nr).slice(-2) + '</span>' : '<span></span>') + '</a>';
      });
      passend.innerHTML = h || '<p class="hinweis">Für so viele Gäste hilft die Rezeption gern weiter.</p>';
    };
    pers.addEventListener('change', neu); buchen.addEventListener('auf', neu); neu();
  }
})();
