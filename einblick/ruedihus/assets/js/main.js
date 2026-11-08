/* Landgasthof Ruedihus — ein Takt, nativer Scroll, Bewegung nur über transform und opacity (Bausteine nach Salt & Silver und Carlton-Europe) */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var breit = matchMedia('(min-width: 901px)');
  if (ruhig) doc.classList.add('still');

  /* Bilder holen und entpacken: allein assets/js/bilder.js (ein Lader, Reihenfolge nach Nähe). Hier wird kein Foto mehr vorgezogen. */

  /* ---------- Einblenden ---------- */
  var ziele = $$('[data-r]'), linien = $$('.linie:not([data-r])'), jahre = $$('.jahre');
  if (ruhig || !('IntersectionObserver' in window)) {
    ziele.concat(linien, jahre, $$('.z')).forEach(function (el) { el.classList.add('da'); });
  } else {
    /* Bilder erst zeigen, wenn sie geladen und entpackt sind – sonst blitzen sie beim Einblenden auf */
    var wennBereit = function (el, dann) {
      var offen = $$('img', el).filter(function (im) { return im.offsetParent !== null; }), n = offen.length, los = false;
      var fertig = function () { if (los) return; los = true; dann(); };
      if (!n) return fertig();
      var eins = function () { if (--n <= 0) fertig(); };
      offen.forEach(function (im) {
        var entpackt = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
        if (im.complete && im.naturalWidth) return eins();   /* BEWEGUNG 13.10.2026: schon geladene Bilder warten nicht mehr aufs Entpacken, die Stücke stehen deckend da und kommen mit dem Scrollen (vorher: return entpackt()) */
        try { im.fetchPriority = 'high'; } catch (x) {}
        im.loading = 'eager';
        im.addEventListener('load', entpackt, { once: true });
        im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 900);   /* BEWEGUNG 13.10.2026: vorher 2200 */
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px 4% 0px', threshold: 0 });   /* BEWEGUNG 13.10.2026: Schrift startet kurz vor dem unteren Rand (vorher 12 %), man sieht sie im Fenster hereinschweben */
    /* grosse Bilder kommen früher: sobald die Oberkante unten ins Fenster rückt */
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { bio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });   /* BEWEGUNG 13.10.2026: vorher 16 % */
    /* Gruppen, deren Bilder gemeinsam starten und nacheinander aufsteigen (Reihen auf einer Höhe) */
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        dio.unobserve(e.target);
        wennBereit(e.target, function () { var takt = +e.target.getAttribute('data-takt') || 95; $$('[data-r]', e.target).forEach(function (k, n) { k.style.transitionDelay = '0s'; setTimeout(function () { k.classList.add('da'); }, n * takt); }); });
      });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });   /* BEWEGUNG 13.10.2026: vorher 16 % */
    $$('[data-gruppe]').forEach(function (d) { dio.observe(d); });
    /* Fenster: der Satz steht fest in der Bildschirmmitte, der Ausschnitt wandert darüber. Der Satz startet erst,
       wenn die Oberkante des Ausschnitts ihn zu etwa einem Drittel freigegeben hat. */
    $$('.bruch').forEach(function (b) {
      var t = $('.in', b), fio = null;
      var lausche = function () {
        if (fio) fio.disconnect();
        var r = t.getBoundingClientRect(), linie = r.top + r.height * 0.68;
        fio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            fio.disconnect(); fio = null; window.removeEventListener('resize', lausche);
            $$('[data-r]', b).forEach(function (k) { k.classList.add('da'); });
          });
        }, { rootMargin: '0px 0px -' + Math.max(0, Math.round(window.innerHeight - linie)) + 'px 0px', threshold: 0 });
        fio.observe(b);
      };
      lausche();
      window.addEventListener('resize', lausche, { passive: true });
    });
    ziele.forEach(function (el) {
      if (el.closest('.auftakt__steh')) { requestAnimationFrame(function () { el.classList.add('da'); }); }
      else if (!el.closest('.bruch') && !el.closest('[data-gruppe],[data-flug]')) {
        var art = el.getAttribute('data-r');
        if (art === 'bild' || art === 'schweb') bio.observe(el); else io.observe(el);
      }
    });
    linien.concat(jahre).forEach(function (el) { io.observe(el); });
  }

  /* ---------- Laufband: läuft nur, solange es im Bild ist ---------- */
  if ('IntersectionObserver' in window && !ruhig) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); });
    $$('.laufband').forEach(function (l) { lio.observe(l); });
  }

  /* ---------- Leiste und Menü ---------- */
  var nav = $('.nav'), burger = $('.burger'), ecken = $$('.glanz');
  /* SPRACHEN 18.10.2026: noch nicht übersetzte Sprachen sind wählbar, schliessen aber nur ruhig die Liste; die Seite bleibt (Robert 14:40) */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-folgt]'); if (!b) return;
    ev.preventDefault(); var d = b.closest('details'); if (d) d.removeAttribute('open');
  });
  if (burger) {
    burger.addEventListener('click', function () {
      var an = doc.classList.toggle('offen');
      burger.setAttribute('aria-expanded', an);
      document.body.style.overflow = an ? 'hidden' : '';
    });
    $$('.menue a,.menue button').forEach(function (a) { a.addEventListener('click', function () { doc.classList.remove('offen'); document.body.style.overflow = ''; burger.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- Reiter: eine Fläche wechselt mit dem Reiter (über hidden, ohne Bewegung) ---------- */
  function reiter(wurzel) {
    var tasten = $$('[role="tab"]', wurzel);
    function waehle(t) {
      tasten.forEach(function (x) { var an = x === t; x.setAttribute('aria-selected', an); x.tabIndex = an ? 0 : -1; var f = document.getElementById(x.getAttribute('aria-controls')); if (f) f.hidden = !an; });
    }
    tasten.forEach(function (t, i) {
      t.addEventListener('click', function () { waehle(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var n = tasten[(i + (e.key === 'ArrowRight' ? 1 : tasten.length - 1)) % tasten.length]; n.focus(); waehle(n);
      });
    });
    return waehle;
  }
  $$('[data-reiter]').forEach(function (r) { reiter(r); });

  /* ---------- Buchen: Fenster mit zwei Reitern. «Zimmer» übergibt Datum und Gäste an das Buchungssystem des Hauses, «Tisch» zeigt Telefon und E-Mail ---------- */
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  function datum(f) {
    var an = f.elements.an, ab = f.elements.ab, heute = new Date();
    an.min = iso(heute); an.value = iso(heute); ab.min = iso(new Date(heute.getTime() + 864e5)); ab.value = iso(new Date(heute.getTime() + 2 * 864e5));
    an.addEventListener('change', function () { var t = new Date(an.value); if (isNaN(t)) return; var n = new Date(t.getTime() + 864e5); ab.min = iso(n); if (ab.value <= an.value) ab.value = iso(n); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = []; for (var i = 0; i < +f.elements.gaeste.value; i++) g.push('A');
      window.open(f.getAttribute('action') + '?lang=DE&cur=CHF&in=' + an.value + '&out=' + ab.value + '&guests=' + encodeURIComponent(g.join(',')), '_blank', 'noopener');
      var d = f.closest('dialog'); if (d) d.close();
    });
  }
  $$('form[data-zimmer]').forEach(datum);
  var dlg = $('dialog.buchen');
  if (dlg && dlg.showModal) {
    var wahl = reiter($('[data-reiter]', dlg)), tabs = $$('[role="tab"]', dlg);
    $$('[data-buchen]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        doc.classList.remove('offen'); document.body.style.overflow = '';
        wahl(b.getAttribute('data-buchen') === 'tisch' ? tabs[1] : tabs[0]);
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('.zu', dlg).addEventListener('click', function () { dlg.close(); });
  }

  /* ---------- Frage an den Gast: vier Bilder, darunter wechselt die Antwort ---------- */
  

  /* ---------- Ein Zimmer einzeln aufgemacht: Bühne mit allen Fotos, Daumenreihe, Pfeile und Pfeiltasten ---------- */
  var bn = $('dialog.buehne');
  if (bn && bn.showModal) {
    var gross = $('.buehne__bild img', bn), reihe = $('.buehne__daumen', bn), titel = $('.buehne__kopf h2', bn), fotos = [], stand = 0;
    var zeige = function (i) {
      stand = (i + fotos.length) % fotos.length; var f = fotos[stand];
      gross.src = f[0]; gross.alt = f[1];
      $$('button', reihe).forEach(function (b, k) { b.setAttribute('aria-current', k === stand); });
    };
    $$('[data-fotos]').forEach(function (k) {
      k.addEventListener('click', function () {
        fotos = JSON.parse(k.getAttribute('data-fotos')); titel.textContent = k.getAttribute('data-name');
        reihe.innerHTML = '';
        fotos.forEach(function (f, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', f[1]); var im = new Image(); im.src = f[2]; im.alt = ''; b.appendChild(im); b.addEventListener('click', function () { zeige(i); }); reihe.appendChild(b); });
        zeige(0); bn.showModal();
      });
    });
    $('[data-vor]', bn).addEventListener('click', function () { zeige(stand + 1); });
    $('[data-zurueck]', bn).addEventListener('click', function () { zeige(stand - 1); });
    $('.zu', bn).addEventListener('click', function () { bn.close(); });
    bn.addEventListener('click', function (e) { if (e.target === bn) bn.close(); });
    bn.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') zeige(stand + 1); if (e.key === 'ArrowLeft') zeige(stand - 1); });
  }

  /* ---------- Film des Hauses: startet nur auf Tastendruck und hält an, sobald er aus dem Bild läuft (kein Film, der von selbst hinter dem Scrollen läuft) ---------- */
  $$('.film').forEach(function (f) {
    var v = $('video', f), t = $('.film__taste', f);
    var setze = function () { t.setAttribute('aria-label', v.paused ? 'Film abspielen' : 'Film anhalten'); f.classList.toggle('laeuft', !v.paused); };
    t.addEventListener('click', function () { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    v.addEventListener('play', setze); v.addEventListener('pause', setze);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.intersectionRatio < 0.5 && !v.paused) v.pause(); });
    }, { threshold: [0, 0.5, 1] }).observe(f);
    setze();
  });

  /* ---------- Auftakt und Fenster: das Foto wandert beim Scrollen sacht mit (nur transform, weich nachlaufend) ---------- */
  var mit = [], mitLaeuft = false;
  if (!ruhig) {
    var hb = $('.auftakt__haus img'); if (hb) mit.push({ el: hb, wurzel: $('.auftakt'), art: 'kopf', ziel: 0, ist: 0 });
    $$('.bruch').forEach(function (b) { var w = $('.bruch__bild', b); if (w) mit.push({ el: w, wurzel: b, art: 'fenster', ziel: 0, ist: 0 }); });
  }
  function mitLies() {
    if (!mit.length) return; var vh = window.innerHeight, los = false;
    for (var i = 0; i < mit.length; i++) { var o = mit[i], r = o.wurzel.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      o.ziel = o.art === 'kopf' ? Math.min(-r.top, r.height) * 0.16 : Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * -vh * 0.07;
      los = true; }
    if (los) mitLaeuft = true;
  }
  function mitLauf() {
    if (!mitLaeuft) return false;
    var weiter = false;
    for (var i = 0; i < mit.length; i++) { var o = mit[i]; o.ist += (o.ziel - o.ist) * 0.12; if (Math.abs(o.ziel - o.ist) > 0.15) weiter = true; else o.ist = o.ziel;
      o.el.style.transform = 'translate3d(0,' + o.ist.toFixed(1) + 'px,0)'; }
    mitLaeuft = weiter; return weiter;
  }

  /* ---------- Gleiten: das Bild wandert beim Scrollen sacht in seinem Rahmen und kommt in der Bildschirmmitte am nächsten.
     Gerechnet wird nur, was im Fenster steht; die Bewegung läuft dem Scrollen weich nach (0,1 je Bild). ---------- */
  var gl = [], glLaeuft = false;
  if (!ruhig && 'IntersectionObserver' in window) {
    $$('[data-r="bild"] .rahmen__k img, [data-r="schweb"] .rahmen__k img, [data-r="haeng"] .rahmen__k img').forEach(function (im) {
      if (im.closest('.zs,.pola,.zk3,dialog')) return;
      if (im.parentNode.querySelectorAll('img').length > 1) return;
      var fig = im.closest('[data-r]'), bild = fig && fig.getAttribute('data-r') === 'bild';
      /* BEWEGUNG 13.10.2026: Kann der Browser die Scroll-Zeitachse, gleitet das Foto dort (assets/css/bewegung.css, .rb-rahmen / .rb-gleit), ohne Rechnen im Takt und ohne eigene Ebene */
      if (window.CSS && CSS.supports && CSS.supports('animation-timeline:view()')) { im.parentNode.classList.add('rb-rahmen'); im.classList.add('rb-gleit'); return; }
      im.classList.add('gleit'); gl.push({ el: im, rahmen: im.parentNode, fig: fig, da: false, ziel: 0, ist: 0, zs: 1.16, is: 1.16,
        auf: fig && !fig.classList.contains('da') ? 0 : -1, az: bild ? 0.13 : 0.14, ad: bild ? 1900 : 1400 });
    });
    /* Auftritt (Robert 10.10.2026: «die sollen ganz elegant mit dem Zoom rein»): sobald das Foto auftaucht, zoomt es von selbst aus der Vergrösserung
       in seine Ruhe, nach der Uhr und nicht nach dem Scrollen (vorher stand es still und bewegte sich nur, solange gescrollt wurde). Danach gleitet es wie bisher. */
    if ('MutationObserver' in window) {
      var glMO = new MutationObserver(function (ms) {
        ms.forEach(function (m) { for (var i = 0; i < gl.length; i++) { var g = gl[i];
          if (g.fig === m.target && g.auf === 0 && g.fig.classList.contains('da')) {
            g.auf = performance.now() + (parseFloat(getComputedStyle(g.el).transitionDelay) || 0) * 1000;
            neuLesen();
          } } });
      });
      gl.forEach(function (g) { if (g.auf === 0) glMO.observe(g.fig, { attributes: true, attributeFilter: ['class'] }); });
    } else gl.forEach(function (g) { g.auf = -1; });
    var glIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].da = e.isIntersecting; });
      neuLesen();
    }, { rootMargin: '12% 0px 12% 0px' });
    gl.forEach(function (g) { glIO.observe(g.rahmen); });
  }
  function gleitLies() {
    if (!gl.length) return; var vh = window.innerHeight;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da) continue;
      var r = g.rahmen.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p)); g.ziel = p * Math.min(58, r.height * 0.07); g.zs = 1.115 + Math.abs(p) * 0.045; }
    glLaeuft = true;
  }
  function gleitLauf() {
    if (!glLaeuft) return false;
    var weiter = false, jetzt = performance.now();
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da && g.auf <= 0) continue;
      g.ist += (g.ziel - g.ist) * 0.1; g.is += (g.zs - g.is) * 0.1;
      if (Math.abs(g.ziel - g.ist) > 0.12 || Math.abs(g.zs - g.is) > 0.0006) weiter = true;
      var e = 1;
      if (g.auf === 0) e = 1 + g.az;
      else if (g.auf > 0) { var t = (jetzt - g.auf) / g.ad;
        if (t >= 1) g.auf = -1; else { weiter = true; t = Math.max(0, t); e = 1 + g.az * (1 - (1 - Math.pow(2, -10 * t)) / 0.99902); } }
      g.el.style.transform = 'translate3d(0,' + g.ist.toFixed(2) + 'px,0) scale(' + (g.is * e).toFixed(4) + ')'; }
    glLaeuft = weiter; return weiter;
  }

  /* ---------- 3D-Kacheln mit einer aufgeklappten Karte: die gewählte Karte ist gross, die anderen stehen klein darüber.
     Wechsel ohne Wartezeit: Lage vorher messen, Anordnung sofort umstellen, Lage nachher messen und jede Karte samt Bild
     über transform von der alten zur neuen Lage fahren lassen. Rahmen, Bildfeld und Foto bekommen je ihre eigene Fahrt, nichts verzerrt. ---------- */
  $$('[data-zs]').forEach(function (zs) {
    var ks = $$('.zs__k', zs), text = $('.zs__text', zs), felder = $$('[data-feld]', text), offen = -1;
    function setze(i) { offen = i; ks.forEach(function (k, j) { k.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); felder.forEach(function (f, j) { f.hidden = j !== i; }); }
    var DAUER = 620, SCHRITTE = 28, lauf = [];
    var lage = function (e) { var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    var misch = function (a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t }; };
    var fuell = function (b, a) { var w = Math.max(b.w, b.h * a), h = w / a; return { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w: w, h: h }; };
    var weich = function (t) { return 1 - Math.pow(1 - t, 3.4); };
    var bezug = function (R, L, PR, PL) {
      var sx = PR.w / PL.w, sy = PR.h / PL.h;
      return 'translate(' + ((R.x - (PR.x + (L.x - PL.x) * sx)) / sx).toFixed(2) + 'px,' + ((R.y - (PR.y + (L.y - PL.y) * sy)) / sy).toFixed(2) + 'px) scale(' + (R.w / (L.w * sx)).toFixed(5) + ',' + (R.h / (L.h * sy)).toFixed(5) + ')';
    };
    var raeume = function () { lauf.forEach(function (a) { try { a.cancel(); } catch (e) {} }); lauf = []; ks.forEach(function (k) { var b = $('.zs__b', k), im = $('img', k); k.style.transformOrigin = b.style.transformOrigin = ''; if (im) im.style.cssText = im.dataset.st || ''; }); };
    function wechsle(i) {
      if (i === offen) return;
      ks.forEach(function (k) { k.classList.add('da'); k.style.transitionDelay = '0s'; });
      if (ruhig || !zs.animate) { setze(i); return; }
      raeume();
      var vor = ks.map(function (k) { return { k: lage(k), b: lage($('.zs__b', k)) }; });
      zs.classList.add('zs--faehrt'); setze(i);
      var nach = ks.map(function (k) { return { k: lage(k), b: lage($('.zs__b', k)) }; }), zeit = { duration: DAUER, easing: 'linear' };
      ks.forEach(function (k, j) {
        var b = $('.zs__b', k), im = $('img', k), F = vor[j], L = nach[j], a = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1.5;
        if (Math.abs(F.k.x - L.k.x) < 1 && Math.abs(F.k.y - L.k.y) < 1 && Math.abs(F.k.w - L.k.w) < 1 && Math.abs(F.k.h - L.k.h) < 1) return;
        var CL = fuell(L.b, a);
        if (im) { if (im.dataset.st === undefined) im.dataset.st = im.style.cssText; im.style.cssText += ';inset:auto;left:' + (CL.x - L.b.x).toFixed(2) + 'px;top:' + (CL.y - L.b.y).toFixed(2) + 'px;width:' + CL.w.toFixed(2) + 'px;height:' + CL.h.toFixed(2) + 'px;max-width:none;object-fit:fill;transform-origin:0 0;transition:none'; }
        k.style.transformOrigin = b.style.transformOrigin = '0 0';
        var fk = [], fb = [], fi = [];
        for (var n = 0; n <= SCHRITTE; n++) {
          var t = weich(n / SCHRITTE), Rk = misch(F.k, L.k, t), Rb = misch(F.b, L.b, t);
          fk.push({ transform: 'translate(' + (Rk.x - L.k.x).toFixed(2) + 'px,' + (Rk.y - L.k.y).toFixed(2) + 'px) scale(' + (Rk.w / L.k.w).toFixed(5) + ',' + (Rk.h / L.k.h).toFixed(5) + ')' });
          fb.push({ transform: bezug(Rb, L.b, Rk, L.k) });
          fi.push({ transform: bezug(fuell(Rb, a), CL, Rb, L.b) });
        }
        lauf.push(k.animate(fk, zeit), b.animate(fb, zeit)); if (im) lauf.push(im.animate(fi, zeit));
        lauf.push($('.zs__n', k).animate([{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }], zeit));
        k.style.zIndex = j === i ? 3 : 1;
      });
      lauf.push(text.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
      var meins = lauf;
      setTimeout(function () { if (lauf !== meins) return; raeume(); zs.classList.remove('zs--faehrt'); ks.forEach(function (k) { k.style.zIndex = ''; }); }, DAUER + 60);
    }
    ks.forEach(function (k, i) { k.addEventListener('click', function () { wechsle(i); }); });
    setze(0);
  });

  /* ---------- Lupe: Bilder ohne eigenes Ziel reagieren auf den Zeiger, wachsen beim Klick an ihrem Platz zur grossen Ansicht und lassen sich durchblättern ---------- */
  var lupen = $$('figure.frei, figure.rahmen, figure.pola-f').filter(function (f) { return !$('a,button,video', f) && $('img', f) && !f.closest('a,button,dialog,.zs,.ort,.schicht--ruhig'); });
  if (lupen.length) {
    var lu = document.createElement('div'); lu.className = 'lupe'; lu.hidden = true; lu.setAttribute('role', 'dialog'); lu.setAttribute('aria-modal', 'true'); lu.setAttribute('aria-label', 'Bild in gross');
    var pf = function (d) { return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5') + '"/></svg>'; };
    lu.innerHTML = '<button class="lupe__zu" type="button" aria-label="Schliessen"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg></button><button class="lupe__pf lupe__pf--l" type="button" aria-label="Vorheriges Bild">' + pf(-1) + '</button><figure><img alt=""><figcaption></figcaption></figure><button class="lupe__pf lupe__pf--r" type="button" aria-label="Nächstes Bild">' + pf(1) + '</button>';
    document.body.appendChild(lu);
    var lim = $('img', lu), lcap = $('figcaption', lu), lsatz = [], lpos = 0, lvon = null, lvt = !ruhig && !!document.startViewTransition;
    /* grosse Fassung: aus den Bildstufen (srcset) die kleinste, die den Schirm füllt, sonst die grösste */
    var luGross = function (f) {
      var im = $('img', f), ziel = Math.min(screen.width, innerWidth) * (window.devicePixelRatio || 1) * .9, best = null, groesste = null;
      (im.getAttribute('srcset') || '').split(',').forEach(function (t) { var m = t.trim().match(/^(\S+)\s+(\d+)w$/); if (!m) return; var w = +m[2];
        if (!groesste || w > groesste[1]) groesste = [m[1], w]; if (w >= ziel && (!best || w < best[1])) best = [m[1], w]; });
      return (best || groesste || [(im.getAttribute('src') || '').replace(/-s\.webp/, '-l.webp')])[0];
    };
    var luName = function (f) { var c = $('b,.kerbe', f), im = $('img', f); return c ? c.textContent : im.alt; };
    var luFuelle = function (i) { lpos = (i + lsatz.length) % lsatz.length; var f = lsatz[lpos]; lim.src = luGross(f); lim.alt = $('img', f).alt; lcap.textContent = luName(f); lu.classList.toggle('lupe--eins', lsatz.length < 2); };
    var luAuf = function (f) {
      lsatz = $$('figure', f.closest('[data-gruppe]') || f.parentNode).filter(function (x) { return lupen.indexOf(x) > -1; }); if (lsatz.indexOf(f) < 0) lsatz = [f]; lvon = f; var i = lsatz.indexOf(f), k = $('.rahmen__k', f), pre = new Image();
      var tu = function () { k.style.viewTransitionName = ''; luFuelle(i); lu.hidden = false; lim.style.viewTransitionName = 'lupe'; document.body.style.overflow = 'hidden'; $('.lupe__zu', lu).focus(); };
      var los = function () { if (lvt) { k.style.viewTransitionName = 'lupe'; document.startViewTransition(tu).finished.then(function () { lim.style.viewTransitionName = ''; }, function () { lim.style.viewTransitionName = ''; }); } else tu(); };
      pre.src = luGross(f); (pre.decode ? pre.decode() : Promise.resolve()).then(los, los);
    };
    var luZu = function () {
      if (lu.hidden) return; var f = lsatz[lpos], k = $('.rahmen__k', f);
      var tu = function () { lim.style.viewTransitionName = ''; lu.hidden = true; k.style.viewTransitionName = 'lupe'; document.body.style.overflow = ''; };
      if (lvt) { lim.style.viewTransitionName = 'lupe'; document.startViewTransition(tu).finished.then(function () { k.style.viewTransitionName = ''; }, function () { k.style.viewTransitionName = ''; }); } else tu();
      if (lvon) lvon.focus({ preventScroll: true });
    };
    lupen.forEach(function (f) {
      f.classList.add('lupe-f'); f.setAttribute('role', 'button'); f.setAttribute('tabindex', '0');
      f.addEventListener('click', function () { luAuf(f); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); luAuf(f); } });
    });
    $('.lupe__zu', lu).addEventListener('click', luZu);
    $('.lupe__pf--l', lu).addEventListener('click', function (e) { e.stopPropagation(); luFuelle(lpos - 1); });
    $('.lupe__pf--r', lu).addEventListener('click', function (e) { e.stopPropagation(); luFuelle(lpos + 1); });
    lu.addEventListener('click', function (e) { if (e.target === lu || e.target.tagName === 'FIGURE') luZu(); });
    document.addEventListener('keydown', function (e) { if (lu.hidden) return; if (e.key === 'Escape') luZu(); else if (e.key === 'ArrowRight') luFuelle(lpos + 1); else if (e.key === 'ArrowLeft') luFuelle(lpos - 1); });
  }

  /* ---------- Zeitstrahl: die Linie zieht sich mit dem Scrollen nach unten ---------- */
  var zeit = $$('.zeit').map(function (z) { return { el: z, linie: $('.zeit__linie', z), ziel: 0, ist: 0 }; }), ztLaeuft = false;
  function zeitLies() {
    if (ruhig || !zeit.length) return; var vh = window.innerHeight, los = false;
    for (var i = 0; i < zeit.length; i++) { var o = zeit[i], r = o.el.getBoundingClientRect();
      if (r.bottom < -60 || r.top > vh + 60) continue;
      o.ziel = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height)); los = true; }
    if (los) ztLaeuft = true;
  }
  function zeitLauf() {
    if (!ztLaeuft) return false;
    var weiter = false;
    for (var i = 0; i < zeit.length; i++) { var o = zeit[i]; o.ist += (o.ziel - o.ist) * 0.12; if (Math.abs(o.ziel - o.ist) > 0.0008) weiter = true; o.linie.style.transform = 'scaleY(' + o.ist.toFixed(4) + ')'; }
    ztLaeuft = weiter; return weiter;
  }


  /* =====================================================================
     FASSUNG 6 und 7: Abzüge kommen von unten herein · Galerie zum Durchklicken · Fächer
     ===================================================================== */
  /* ---------- Abzüge fliegen herein: erst wenn die Reihe ein Stück im Bild steht, einer nach dem anderen ---------- */
  if (!ruhig && 'IntersectionObserver' in window) {
    var flIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; flIO.unobserve(e.target);
        var ks = $$('[data-r]', e.target), ims = $$('img', e.target), offen = ims.length, los = false;
        var start = function () { if (los) return; los = true; ks.forEach(function (k, n) { setTimeout(function () { k.classList.add('da'); }, n * 170); }); };
        if (!offen) return start();
        ims.forEach(function (im) {
          var eins = function () { if (--offen <= 0) start(); };
          im.loading = 'eager';
          if (im.complete && im.naturalWidth) (im.decode ? im.decode() : Promise.resolve()).then(eins, eins);
          else { im.addEventListener('load', eins, { once: true }); im.addEventListener('error', eins, { once: true }); }
        });
        setTimeout(start, 900);
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });
    $$('[data-flug]').forEach(function (d) { flIO.observe(d); });
  }

  /* ---------- Galerie zum Durchklicken: die Bahn fährt um ein Bild weiter (ein Element in Bewegung), das Bild ausserhalb des Fensters
     wird vorher auf die Seite gesetzt, von der es hereinkommt. So läuft die Galerie im Kreis, ohne dass etwas springt. ---------- */
  $$('[data-rk]').forEach(function (rk) {
    var sek = rk.closest('section'), bahn = $('.rk__bahn', rk), ss = $$('.rk__s', rk), n = ss.length, a = 0, sperre = false, ziel = null;
    var namen = $$('.rk__namen button', sek), felder = $$('.rk__text [data-feld]', sek), lauf = $('.rk__lauf i', sek);
    var mod = function (x) { return ((x % n) + n) % n; };
    var lege = function (ri) { var von = ri > 0 ? a - 1 : a - (n - 2); for (var k = von; k < von + n; k++) ss[mod(k)].style.setProperty('--k', k); };
    var zeige = function () {
      var i = mod(a); bahn.style.setProperty('--a', a); if (lauf) lauf.style.setProperty('--n', i);
      ss.forEach(function (s, j) { s.classList.toggle('an', j === i); });
      namen.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      felder.forEach(function (f, j) { var an = j === i; f.classList.toggle('an', an); });
    };
    var geh = function (ri) {
      if (sperre) return; sperre = true; lege(ri); void bahn.offsetWidth; a += ri; zeige();
      setTimeout(function () { sperre = false; if (ziel !== null) { if (mod(a) === ziel) ziel = null; else geh(ri); } }, ruhig ? 0 : 640);
    };
    lege(1); zeige();
    $('[data-vor]', rk).addEventListener('click', function () { ziel = null; geh(1); });
    $('[data-zurueck]', rk).addEventListener('click', function () { ziel = null; geh(-1); });
    ss.forEach(function (s) { s.addEventListener('click', function () { var k = +s.style.getPropertyValue('--k'); ziel = null; if (k > a) geh(1); else if (k < a) geh(-1); }); });
    namen.forEach(function (b, j) { b.addEventListener('click', function () { var d = mod(j - a); if (!d) return; ziel = j; geh(d > n / 2 ? -1 : 1); }); });
    rk.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { ziel = null; geh(1); } else if (e.key === 'ArrowLeft') { ziel = null; geh(-1); } });
    var tx = 0, ty = 0;
    rk.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    rk.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.4) { ziel = null; geh(dx < 0 ? 1 : -1); } }, { passive: true });
  });

  /* ---------- Fächer: das Blatt unter dem Zeiger (oder mit Tastatur, am Tablett mit dem ersten Tipp) öffnet sich; ohne Zeiger wandert die Auswahl von selbst weiter ---------- */
  $$('[data-fa]').forEach(function (fa) {
    var ps = $$('.fa__p', fa), akt = 0, uhr = null, absicht = null, imBild = false, drauf = false;
    var unten = $('.fa__u', fa.parentNode), uts = unten ? $$('.fa__ut', unten) : [];
    var setze = function (i) { if (i === akt) return; ps[akt].classList.remove('an'); ps[i].classList.add('an'); if (uts.length) { uts[akt].classList.remove('an'); uts[i].classList.add('an'); unten.style.setProperty('--akt', i); } akt = i; };
    var takt = function () {
      clearInterval(uhr); uhr = null;
      if (!imBild || drauf || ruhig || !breit.matches) return;
      uhr = setInterval(function () { setze((akt + 1) % ps.length); }, 4600);
    };
    ps.forEach(function (p, i) {
      p.addEventListener('mouseenter', function () { if (!breit.matches) return; drauf = true; takt(); clearTimeout(absicht); absicht = setTimeout(function () { setze(i); }, 110); });
      p.addEventListener('focus', function () { if (!breit.matches) return; drauf = true; takt(); setze(i); });
      p.addEventListener('blur', function () { drauf = false; takt(); });
      p.addEventListener('click', function (e) { if (breit.matches && i !== akt) { e.preventDefault(); clearTimeout(absicht); setze(i); } });
    });
    fa.addEventListener('mouseleave', function () { clearTimeout(absicht); drauf = false; takt(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { imBild = es[0].isIntersecting; takt(); }, { threshold: 0.35 }).observe(fa);
  });

  /* ---------- Herkunft-Kompass: erst baut er sich auf, dann wandert die Auswahl von Ort zu Ort; Zeiger oder Klick wählt selbst ---------- */
  $$('[data-hk]').forEach(function (hk) {
    var os = $$('.hk__o', hk), ts = $$('.hk__t', hk), ns = $$('.hk__namen button', hk), puls = $('.hk__puls', hk), nadel = $('.hk__nadel', hk), winkel = 0, akt = -1, uhr = null, imBild = false, drauf = false, bereit = false, gestartet = false;
    /* die Nadel schwingt auf dem kürzesten Weg zur Peilung des Orts (ein Element, nur transform) */
    var zeige = function (i, runden) { if (!nadel) return; var z = +os[i].getAttribute('data-peil') || 0, d = ((z - winkel) % 360 + 540) % 360 - 180; winkel += d + (runden || 0) * 360; nadel.style.transform = 'rotate(' + winkel.toFixed(1) + 'deg)'; };
    var setze = function (i) {
      if (i === akt) return; var erst = akt < 0; akt = i; zeige(i, erst && !ruhig ? 1 : 0);
      os.forEach(function (o, j) { o.classList.toggle('an', j === i); });
      ts.forEach(function (t, j) { t.classList.toggle('an', j === i); });
      ns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      if (puls && !ruhig) { puls.classList.remove('los'); void puls.getBoundingClientRect(); puls.classList.add('los'); }
    };
    var takt = function () { clearInterval(uhr); uhr = null; if (!bereit || !imBild || drauf || ruhig) return; uhr = setInterval(function () { setze((akt + 1) % os.length); }, 4200); };
    var start = function () { if (gestartet) return; gestartet = true; hk.classList.add('da'); setTimeout(function () { hk.classList.add('fertig'); bereit = true; setze(0); takt(); }, ruhig ? 0 : (nadel ? 1300 : 2700)); };
    os.forEach(function (o, i) { o.addEventListener('mouseenter', function () { if (!bereit) return; drauf = true; takt(); setze(i); }); o.addEventListener('click', function () { if (bereit) setze(i); }); });
    ns.forEach(function (b, i) { b.addEventListener('click', function () { if (!bereit) return; drauf = true; takt(); setze(i); }); b.addEventListener('mouseenter', function () { if (!bereit) return; drauf = true; takt(); setze(i); }); });
    hk.addEventListener('mouseleave', function () { drauf = false; takt(); });
    if ('IntersectionObserver' in window && !ruhig) new IntersectionObserver(function (es) { imBild = es[0].isIntersecting; if (imBild) start(); takt(); }, { threshold: 0.3 }).observe($('.hk__karte', hk));
    else { imBild = true; start(); }
  });

  /* ---------- Jahreslauf: die Karte unter dem Zeiger lässt ihre Marke auf dem Lineal aufleuchten ---------- */
  $$('[data-jl]').forEach(function (jl) {
    var ms = $$('.jl__bahn i', jl);
    $$('.jl__k', jl).forEach(function (k, i) {
      k.addEventListener('mouseenter', function () { if (ms[i]) ms[i].classList.add('an'); });
      k.addEventListener('mouseleave', function () { if (ms[i]) ms[i].classList.remove('an'); });
    });
  });

  /* ---------- Grosse Zahlen zählen hoch, sobald sie im Bild sind ---------- */
  if ('IntersectionObserver' in window && !ruhig) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; zio.unobserve(e.target);
        $$('[data-zahl]', e.target).forEach(function (el) {
          var ziel = parseFloat(el.getAttribute('data-zahl')), komma = +el.getAttribute('data-komma') || 0, t0 = null;
          if (ziel <= 3) return;
          /* wie Carlton: Jahreszahlen laufen nur die letzten 24 ein, kleine Zahlen kurz von null */
          var von = ziel > 1000 ? ziel - 24 : 0, dauer = ziel > 1000 ? 2100 : 1500;
          var schritt = function (t) { if (t0 === null) t0 = t; var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 4);
            el.textContent = (von + (ziel - von) * w).toFixed(komma).replace('.', ','); if (p < 1) requestAnimationFrame(schritt); };
          el.textContent = von.toFixed(komma).replace('.', ',');
          setTimeout(function () { requestAnimationFrame(schritt); }, 250);
        });
      });
    }, { threshold: 0.3 });
    $$('[data-zaehlt]').forEach(function (j) { zio.observe(j); });
  }

  /* ---------- Band zum Blättern: Pfeile und Laufbalken, das Blättern selbst bleibt nativ ---------- */
  $$('[data-band]').forEach(function (w) {
    var b = $('.band', w), vor = $('[data-bvor]', w), zur = $('[data-bzurueck]', w), lb = $('.laufbalken i', w), offen = false;
    var schritt = function () { var k = b.children[0]; return k ? k.getBoundingClientRect().width + 20 : 320; };
    var stand = function () { offen = false; var max = b.scrollWidth - b.clientWidth, p = max > 0 ? b.scrollLeft / max : 0;
      if (lb) lb.style.transform = 'translateX(' + (p * 300).toFixed(1) + '%)'; zur.disabled = p < 0.01; vor.disabled = p > 0.99; };
    vor.addEventListener('click', function () { b.scrollBy({ left: schritt(), behavior: ruhig ? 'auto' : 'smooth' }); });
    zur.addEventListener('click', function () { b.scrollBy({ left: -schritt(), behavior: ruhig ? 'auto' : 'smooth' }); });
    b.addEventListener('scroll', function () { if (offen) return; offen = true; requestAnimationFrame(stand); }, { passive: true });
    stand();
  });

  /* ---------- Gastgeber: Titel und Familie kommen, sobald die Karte zur Hälfte im Bild steht ---------- */
  if (!ruhig && 'IntersectionObserver' in window) { var ggio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; ggio.unobserve(e.target); var im = $('img', e.target), los = function () { e.target.classList.add('da'); }; (im && im.decode ? im.decode() : Promise.resolve()).then(los, los); }); }, { threshold: 0, rootMargin: '0px 0px -10% 0px' }); $$('[data-gg]').forEach(function (k) { ggio.observe(k); }); }   // GASTGEBER 18.10.2026: früh auslösen, sobald die Karte hereinkommt (vorher erst halb im Bild)
  else $$('[data-gg]').forEach(function (k) { k.classList.add('da'); });

  /* ---------- Wort für Wort: der Satz wird mit dem Scrollen hell (nur Deckkraft, umgeschaltet wird nur, was sich ändert) ---------- */
  var worte = ruhig ? [] : $$('[data-worte]').map(function (el) { return { el: el, w: $$('.w', el), n: 0 }; });
  if (worte.length) doc.classList.add('liest');
  function worteLies() {
    var vh = window.innerHeight;
    for (var i = 0; i < worte.length; i++) {
      var o = worte[i], r = o.el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) continue;
      var p = (vh * 0.86 - r.top) / (r.height + vh * 0.36), n = Math.round(Math.max(0, Math.min(1, p)) * o.w.length);
      if (n === o.n) continue;
      for (var k = Math.min(n, o.n); k < Math.max(n, o.n); k++) o.w[k].classList.toggle('an', k < n);
      o.n = n;
    }
  }

  /* ---------- Scroll-Takt: ein Lauscher, ein Bild-Takt. Je Bild erst alle Lagen lesen, dann alle Bewegungen schreiben
     (vorher lief jede Bewegung in einem eigenen requestAnimationFrame und las danach wieder Lagen: der Browser musste je Bild
     die Stile zweimal rechnen). ---------- */
  var yAlt = window.scrollY, taktAn = false, lesen = true, heroEnde = -1;
  window.addEventListener('resize', function () { heroEnde = -1; }, { passive: true });
  var eingabe = -1e9, fingerY = null, jetzt = function () { eingabe = performance.now(); };   // letzte Eingabe NACH OBEN
  window.addEventListener('wheel', function (ev) { if (ev.deltaY < 0) jetzt(); }, { passive: true });
  window.addEventListener('touchstart', function (ev) { fingerY = ev.touches[0] ? ev.touches[0].clientY : null; }, { passive: true });
  window.addEventListener('touchmove', function (ev) { var t = ev.touches[0]; if (t && fingerY !== null && t.clientY > fingerY) jetzt(); if (t) fingerY = t.clientY; }, { passive: true });
  window.addEventListener('keydown', function (ev) { if (/^(ArrowUp|PageUp|Home)$/.test(ev.key) || (ev.key === ' ' && ev.shiftKey)) jetzt(); }, { passive: true });
  window.addEventListener('pointerdown', function (ev) { if (ev.clientX > document.documentElement.clientWidth) jetzt(); }, { passive: true });   // Rollbalken
  function lies() {
    var y = window.scrollY;
    gleitLies(); mitLies(); zeitLies();
    if (nav && !doc.classList.contains('offen')) {
      // Robert 18.10.2026 14:00: Leiste und Ecken spätestens am Ende des Heros weg, egal wie schnell oder langsam (vorher nur bei mehr als 6 px je Bild)
      if (heroEnde < 0) { var hb = document.querySelector('.auftakt'); heroEnde = hb ? hb.offsetTop + hb.offsetHeight : 900; }
      // Zurück nur, wenn der Gast selbst nach oben scrollt (Rad oder Finger nach oben, Taste, Rollbalken in der letzten halben Sekunde): rückt die Seite beim Laden
      // um ein paar Pixel zurück (Bilder darüber werden fertig), kam die Leiste sonst hinter dem Hero wieder (Startseite, Safari, 18.10.2026)
      var selbst = performance.now() - eingabe < 500;
      var weg = y > 140 && (y > yAlt + 6 || (y >= heroEnde && y > yAlt)), da = !weg && ((y < yAlt - 6 && selbst) || y < 140);
      if (weg || da) { nav.classList.toggle('weg', weg); ecken.forEach(function (k) { k.classList.toggle('weg', weg); }); doc.classList.toggle('leiste-weg', weg); }   // Robert 18.10.2026 19:21: die Rezeption geht und kommt mit der Leiste wie im Carlton
    }
    yAlt = y;
    worteLies();
  }
  function takt() {
    taktAn = false;
    if (lesen) { lesen = false; lies(); }
    var a = gleitLauf(), b = mitLauf(), c = zeitLauf();
    if (a || b || c) plane();
  }
  function plane() { if (!taktAn) { taktAn = true; requestAnimationFrame(takt); } }
  function neuLesen() { lesen = true; plane(); }
  window.addEventListener('scroll', neuLesen, { passive: true });
  neuLesen();
})();

/* WAS FÜHRT SIE EINKERBUNG 17.10.2026: vier Bilder wählen Bild und Text der eingekerbten Fläche (Nr. 31 aus frage-2.html) */
(function () {
  document.querySelectorAll('[data-ke]').forEach(function (ke) {
    var W = ke.querySelectorAll('[data-i]'), P = ke.querySelectorAll('[data-p]');
    W.forEach(function (w) {
      w.addEventListener('click', function () {
        var n = w.getAttribute('data-i');
        W.forEach(function (x) { var an = x.getAttribute('data-i') === n; x.classList.toggle('an', an); x.setAttribute('aria-pressed', an ? 'true' : 'false'); });
        P.forEach(function (x) { x.classList.toggle('an', x.getAttribute('data-p') === n); });
      });
    });
  });
})();

/* KOPFLEISTE SCHLÜSSELBRETT 18.10.2026 (Robert, Fassung 19): über «Zimmer» klappt das Brett mit den vier Zimmern auf. Mit Maus beim Darüberfahren,
   mit Finger beim ersten Tippen (das zweite führt zur Zimmerseite), mit Tastatur beim Hinkommen; Esc schliesst, verschwindet die Leiste, schliesst es mit. */
(function () {
  var zi = document.querySelector('.nav__zi'); if (!zi) return;
  var a = zi.querySelector('a[aria-controls]'), nav = zi.closest('.nav'), uhr = 0, maus = matchMedia('(hover:hover) and (pointer:fine)');
  function setz(an) { clearTimeout(uhr); zi.classList.toggle('auf', an); a.setAttribute('aria-expanded', an ? 'true' : 'false'); }
  zi.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') setz(true); });
  zi.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') { clearTimeout(uhr); uhr = setTimeout(function () { setz(false); }, 160); } });
  a.addEventListener('click', function (ev) { if (!maus.matches && !zi.classList.contains('auf')) { ev.preventDefault(); setz(true); } });
  zi.addEventListener('focusin', function () { setz(true); });
  zi.addEventListener('focusout', function (ev) { if (!zi.contains(ev.relatedTarget)) setz(false); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && zi.classList.contains('auf')) { setz(false); a.focus({ preventScroll: true }); zi.classList.remove('auf'); a.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('pointerdown', function (ev) { if (zi.classList.contains('auf') && !zi.contains(ev.target)) setz(false); });
  if (nav) new MutationObserver(function () { if (nav.classList.contains('weg')) setz(false); }).observe(nav, { attributes: true, attributeFilter: ['class'] });
})();
