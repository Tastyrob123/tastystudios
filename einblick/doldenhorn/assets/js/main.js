/* Landgasthof Ruedihus — ein Takt, nativer Scroll, Bewegung nur über transform und opacity (Bausteine nach Salt & Silver und Carlton-Europe) */
/* Angebote, «Noch offene Wochen»: ein Blatt verschwindet, sobald sein Anreisetag vorbei ist (data-ab = Jahr-Monat-Tag). Bleibt keines, verschwindet auch die Zeile darüber.
   Läuft vor allem anderen, damit die Auftritte nur die Blätter zählen, die bleiben. */
(function () {
  var g = document.querySelector('[data-wochen]'); if (!g) return;
  var h = new Date(), heute = h.getFullYear() + '-' + ('0' + (h.getMonth() + 1)).slice(-2) + '-' + ('0' + h.getDate()).slice(-2);
  [].slice.call(g.children).forEach(function (el) { var ab = el.getAttribute('data-ab'); if (ab && ab < heute) g.removeChild(el); });
  var n = g.children.length; g.setAttribute('data-zahl', n);
  [].slice.call(g.children).forEach(function (el, i) { el.style.setProperty('--i', i); });
  if (!n) { g.hidden = true; var o = g.previousElementSibling; if (o && o.classList.contains('reise__o')) o.hidden = true; }
})();
/* Takt-Wächter (Robert 09.10.2026: «alles muss flüssig laufen in allen Zuständen, egal ob Leistung reduziert vom Gerät oder nicht»).
   Im Stromsparmodus rechnen Safari und Chrome nur 30 Bilder je Sekunde, die Seite selbst scrollt aber weiter mit 60. Alles, was das Skript beim Scrollen
   mitbewegt (Fotos gleiten im Rahmen, Auftaktfoto und Karten wandern), läuft dann nur in jedem zweiten Bild mit und zittert gegen die Seite.
   Der Wächter misst deshalb den Takt zweimal in Ruhe. Ist er gedeckelt, stehen diese Bewegungen still (Klasse «lahm» am html); Auftritte, Blättern und
   Filme bleiben, sie rechnet der Browser selbst. Kommt der volle Takt zurück (Netzteil, Modus aus), laufen sie wieder. */
(function () {
  var T = window.__takt = { lahm: false, wenn: [] };
  function setze(l) { if (l === T.lahm) return; T.lahm = l; document.documentElement.classList.toggle('lahm', l); T.wenn.forEach(function (f) { try { f(l); } catch (x) {} }); }
  function miss(fertig) {
    var n = 0, vor = 0, d = [];
    requestAnimationFrame(function f(t) { if (vor) d.push(t - vor); vor = t; if (++n < 22) requestAnimationFrame(f); else { d.sort(function (a, b) { return a - b; }); fertig(d[d.length >> 1]); } });
  }
  var laeuft = false;
  function pruefe() {
    if (document.hidden || laeuft) return; laeuft = true;
    miss(function (m1) { setTimeout(function () { miss(function (m2) { laeuft = false; if (m1 > 25 && m2 > 25) setze(true); else if (m1 < 21 && m2 < 21) setze(false); }); }, 600); });
  }
  if (!window.requestAnimationFrame) return;
  if (document.readyState === 'complete') setTimeout(pruefe, 500); else window.addEventListener('load', function () { setTimeout(pruefe, 500); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) setTimeout(pruefe, 500); });
  setInterval(pruefe, 30000);
})();
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var breit = matchMedia('(min-width: 901px)');
  if (ruhig) doc.classList.add('still');

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
        if (im.complete && im.naturalWidth) return eins();   /* schon geladen: nicht mehr aufs Entpacken warten (13.10.2026, Bewegung: die Stücke stehen deckend da und kommen mit dem Scrollen herauf; bilder.js entpackt im Voraus) */
        im.loading = 'eager';
        im.addEventListener('load', entpackt, { once: true });
        im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 700);
    };
    /* Robert 18.10.2026, 18:17 («zu früh, zu schnell»): los, wenn rund ein Fünftel im Bild ist; oben weit offen, damit beim Springen nichts liegen bleibt */
    var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= window.innerHeight * 0.2); }, FUENFTEL = { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, FUENFTEL);   /* 13.10.2026 (Bewegung, assets/css/bewegung.css): Schrift startet kurz vor dem unteren Rand, vorher 12 %; mit dem längeren, weicheren Lauf sieht man sie im Fenster aufsteigen */
    /* grosse Bilder kommen früher: sobald die Oberkante unten ins Fenster rückt */
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { bio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, FUENFTEL);   /* 13.10.2026 (Bewegung): vorher 16 % */
    /* Gruppen, deren Bilder gemeinsam starten und nacheinander aufsteigen (Reihen auf einer Höhe) */
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!fuenftel(e)) return;
        dio.unobserve(e.target);
        /* nacheinander starten (nicht alle im selben Augenblick): so verteilt sich das Zeichnen der Karten auf mehrere Bilder */
        wennBereit(e.target, function () { $$('[data-r]', e.target).forEach(function (k, n) { k.style.transitionDelay = '0s'; setTimeout(function () { k.classList.add('da'); }, n * 120); }); });
      });
    }, FUENFTEL);   /* 13.10.2026 (Bewegung): vorher 16 % */
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
      else if (!el.closest('.bruch') && !el.closest('[data-gruppe]')) {
        var art = el.getAttribute('data-r');
        if (art === 'bild' || art === 'schweb') bio.observe(el); else io.observe(el);
      }
    });
    linien.concat(jahre).forEach(function (el) { io.observe(el); });
  }

  /* ---------- Laufband: läuft nur, solange es im Bild ist ---------- */
  if ('IntersectionObserver' in window && !ruhig) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); });
    $$('.laufband,.ehren').forEach(function (l) { lio.observe(l); });
  }

  /* ---------- Leiste und Menü ---------- */
  var nav = $('.nav'), burger = $('.burger'), ecken = $$('.glanz');
  /* Sprachwahl und «Zimmer buchen» gleich breit (Robert 16.10.2026: «damit das nicht so ungleich aussieht») */
  var eckL = $('.glanz--l'), eckR = $('.glanz--r');
  function eckenGleich() { if (!eckL || !eckR) return; eckL.style.minWidth = eckR.style.minWidth = ''; var b = Math.max(eckL.offsetWidth, eckR.offsetWidth); eckL.style.minWidth = eckR.style.minWidth = b + 'px'; document.documentElement.style.setProperty('--eck', b + 'px'); }
  eckenGleich(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(eckenGleich); addEventListener('resize', eckenGleich);
  /* Formwechsel der Leiste, zweite Fassung (Robert 17.10.2026, 18:50: «viel flüssiger und schneller … richtig aufwendig und hochwertig»).
     Die Form (.nav__form) besteht aus Mitte, zwei runden Enden, Hals und zwei Kehlen; eine Feder führt p von 0 (Wortmarke hängt) nach 1 (Leiste) und zurück.
     Jeder Teil wird nur verschoben oder gestreckt (transform), die Kehlen giessen beim Fliessen die Ecke zwischen Hals und Leiste aus. Masse einmal aus dem Aufbau. */
  var form = { p: 0, v: 0, ziel: 0, laeuft: false, t: 0, g: null };
  function formMass() {
    var ins = $('.nav__insel'), lo = $('.nav__logo'), L = $('.nav__seite--l'), R = $('.nav__seite--r'), img = lo && lo.querySelector('img'), box = $('.nav__form');
    form.g = null;
    if (!ins || !lo || !L || !R || !img || !box || innerWidth < 901) { if (L) L.style.transform = ''; if (R) R.style.transform = ''; if (img) img.style.transform = ''; return; }
    L.style.transform = R.style.transform = img.style.transform = '';
    var bi = ins.getBoundingClientRect(), bl = lo.getBoundingClientRect(), a = L.getBoundingClientRect(), c = R.getBoundingClientRect();
    var d = parseFloat(getComputedStyle(ins).getPropertyValue('--fl-d')) || 0, mx = (bl.left + bl.right) / 2;
    var g = { C: mx - bi.left, tw: lo.offsetWidth, tb: lo.offsetHeight, bw: 2 * (Math.max(mx - a.left, c.right - mx) - d + 28), d: d, ly: 60 - (img.offsetTop + img.offsetHeight / 2), R: 13, L: L, Rr: R, img: img };
    g.mw = g.bw - 2 * g.R + 2;
    /* Robert 18.10.2026: «wenn die so breit ist, dann ist da links neben dem Zimmer noch unverhältnismäßig viel Platz». Die Leiste endet jetzt je Seite
       28 px hinter der äussersten Verknüpfung, statt gleich weit links und rechts der Wortmarke (die linke Gruppe ist kürzer als die rechte). */
    g.hl = (mx - a.left) - d + 28; g.hr = (c.right - mx) - d + 28;
    g.links = [].slice.call(ins.querySelectorAll('.nav__seite > a, .nav__seite > .nav__g > a')).map(function (e) { var q = e.getBoundingClientRect(); return { e: e, rand: Math.abs((q.left + q.right) / 2 - mx), links: (q.left + q.right) / 2 < mx, auf: null }; });
    g.gruppen = [L, R].map(function (e, i) { var q = e.getBoundingClientRect(); return { e: e, links: i === 0, innen: Math.min(Math.abs(q.left - mx), Math.abs(q.right - mx)), aussen: Math.max(Math.abs(q.left - mx), Math.abs(q.right - mx)) }; });
    var st = function (k, l, t, w, h) { var e = box.querySelector(k); e.style.left = l + 'px'; e.style.top = t + 'px'; e.style.width = w + 'px'; e.style.height = h + 'px'; return e; };
    g.m = st('.f-m', g.C - g.mw / 2, 30, g.mw, 66); g.l = st('.f-l', g.C, 30, g.R + 1, 66); g.r = st('.f-r', g.C - g.R - 1, 30, g.R + 1, 66);
    g.h = st('.f-h', g.C - g.tw / 2, -40, g.tw, 103); g.kl = st('.f-kl', g.C - g.tw / 2 - 20, 10, 20, 20); g.kr = st('.f-kr', g.C + g.tw / 2, 10, 20, 20);
    form.g = g; formZeichne();
  }
  function formZeichne() {
    var g = form.g; if (!g) return;
    var k = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; }, p = form.p;
    var pb = Math.max(p, 0), pn = k((p - 0.06) / 0.94), ps = k(p);  /* Robert 18.10.2026, 13:27: beim Zurückgehen nie schmaler als die Lasche, sonst stehen unten Kanten des Halses heraus */
    var HL = g.tw / 2 + (g.hl - g.tw / 2) * pb, HR = g.tw / 2 + (g.hr - g.tw / 2) * pb, W = HL + HR, dy = (g.tb - 96) * (1 - ps), Y = 'px,' + dy.toFixed(2) + 'px,0)';
    g.m.style.transform = 'translate3d(' + ((HR - HL) / 2).toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) scaleX(' + ((W - 2 * g.R + 2) / g.mw).toFixed(4) + ')';
    g.l.style.transform = 'translate3d(' + (-HL).toFixed(2) + Y;
    g.r.style.transform = 'translate3d(' + HR.toFixed(2) + Y;
    var oben = -40 + 40 * k(pn / 0.12) + 34 * k((pn - 0.05) / 0.95), sy = (63 + dy - oben) / 103;  /* der Hals löst sich sofort vom Rand und sinkt in die Leiste */
    var sxn = 1 - 0.22 * pn, rein = g.tw / 2 * (1 - sxn);  /* der Hals verjüngt sich beim Einsinken wie ein Tropfen, die Kehlen wandern mit */
    g.h.style.transform = 'translate3d(0,' + dy.toFixed(2) + 'px,0) scale(' + sxn.toFixed(4) + ',' + sy.toFixed(4) + ')';
    g.h.style.opacity = (1 - k((pn - 0.86) / 0.14)).toFixed(3);
    var kehle = (Math.sin(Math.PI * pn) * Math.min(1, Math.max(0, (W - g.tw) / 40))).toFixed(3);
    g.kl.style.transform = 'translate3d(' + rein.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) scale(' + kehle + ')';
    g.kr.style.transform = 'translate3d(' + (-rein).toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0) scale(' + kehle + ')';
    g.L.style.transform = 'translate3d(' + (g.d * ps).toFixed(2) + 'px,0,0)';
    g.Rr.style.transform = 'translate3d(' + (-g.d * ps).toFixed(2) + 'px,0,0)';
    g.img.style.transform = 'translate3d(0,' + (g.ly * ps).toFixed(2) + 'px,0) scale(' + (1 - 0.08 * ps).toFixed(4) + ')';
    /* jeder Link färbt um, wenn die Fläche unter ihm ankommt; der dunkle Hof hinter den Gruppen geht im selben Mass */
    var halbL = HL + g.d * ps, halbR = HR + g.d * ps;
    g.links.forEach(function (l) { var auf = (l.links ? halbL : halbR) >= l.rand; if (auf !== l.auf) { l.auf = auf; l.e.classList.toggle('auf', auf); } });
    g.gruppen.forEach(function (q) { var halb = q.links ? halbL : halbR; q.e.style.setProperty('--hof', (1 - k((halb - q.innen) / Math.max(1, q.aussen - q.innen))).toFixed(3)); });
  }
  function formLauf(t) {
    var dt = form.t ? Math.min(0.033, (t - form.t) / 1000) : 0.016; form.t = t;
    var w = 20, z = form.ziel === 0 ? 1 : 0.66, a = -w * w * (form.p - form.ziel) - 2 * z * w * form.v;  /* zurück zur Lasche ohne Nachschwingen (Robert 18.10.2026: «springt das beim zurückgehen») */
    form.v += a * dt; form.p += form.v * dt;
    if (Math.abs(form.p - form.ziel) < 0.0008 && Math.abs(form.v) < 0.01) { form.p = form.ziel; form.v = 0; form.laeuft = false; form.t = 0; formZeichne(); if (typeof lies === 'function') lies(); return; }  /* nach dem Wechsel noch einmal nachsehen: stand die Seite schon tiefer, fährt die Leiste jetzt weg (Robert 18.10.2026, 14:00) */
    formZeichne(); requestAnimationFrame(formLauf);
  }
  function formZiel(z, sofort) {
    form.ziel = z;
    if (sofort || ruhig || doc.classList.contains('still')) { form.p = z; form.v = 0; formZeichne(); return; }
    if (!form.laeuft) { form.laeuft = true; form.t = 0; requestAnimationFrame(formLauf); }
  }
  formMass(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(formMass); addEventListener('resize', formMass);
  if (/[?&]formprobe/.test(location.search)) window.formProbe = function (p) { form.p = form.ziel = p; form.v = 0; formZeichne(); };  /* nur Prüfwerkzeug: Zwischenstufen festhalten (_qa/formwechsel_stufen.js) */
  document.addEventListener('click', function (ev) { var d = $('.sprache'); if (d && d.open && !d.contains(ev.target)) d.open = false; });
  document.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('[data-folgt-m]')) ev.preventDefault(); });   /* Menü am Handy: antippbar, die Seite bleibt */
  /* Sprachen, die noch folgen (Robert 18.10.2026, 14:40): wählbar, ein Klick schliesst nur die Liste, die Seite bleibt */
  document.addEventListener('click', function (ev) { var k = ev.target.closest && ev.target.closest('.sprache [data-folgt]'); if (!k) return; ev.preventDefault(); var d = k.closest('.sprache'); if (d) { d.open = false; var su = d.querySelector('summary'); if (su) su.focus({ preventScroll: true }); } });
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
  $$('[data-fragen]').forEach(function (f) { reiter(f); });

  /* ---------- Ein Zimmer einzeln aufgemacht: Bühne mit allen Fotos, Daumenreihe, Pfeile und Pfeiltasten ---------- */
  var bn = $('dialog.buehne');
  if (bn && bn.showModal) {
    var gross = $('.buehne__bild img', bn), reihe = $('.buehne__daumen', bn), titel = $('.buehne__kopf h2', bn), fotos = [], stand = 0;
    var zeige = function (i) {
      stand = (i + fotos.length) % fotos.length; var f = fotos[stand];
      /* sofort die kleine Fassung (liegt schon in der Daumenreihe), die grosse wird im Hintergrund geholt und erst gezeigt, wenn sie ganz da ist:
         kein leeres Feld beim Blättern (Robert 09.10.2026) */
      gross.alt = f[1]; gross.src = f[2];
      var voll = new Image(), mein = stand;
      voll.onload = function () { if (mein === stand && bn.open) gross.src = f[0]; };
      voll.src = f[0];
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
    /* Robert 17.10.2026: läuft der Film, ist die Taste weg; ein Tippen auf den Film hält ihn an, dann steht die Taste wieder in der Mitte */
    f.addEventListener('click', function (e) { if (!f.classList.contains('von-selbst') && !v.paused && !e.target.closest('.film__taste')) v.pause(); });
    /* Robert 18.10.2026, 14:02 (spa.html): «Kannst du auf der Seite das Video einfach abspielen lassen, wenn man die Seite runterscrollt. Nicht mit Play-Button.»
       Der Film läuft von selbst, sobald er zur Hälfte im Bild ist, und hält an, wenn er hinausläuft; keine Taste. Wer weniger Bewegung eingestellt hat, behält die Taste. */
    var vonSelbst = !ruhig && 'IntersectionObserver' in window;
    if (vonSelbst) { f.classList.add('von-selbst'); t.hidden = true; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.intersectionRatio < 0.5) { if (!v.paused) v.pause(); }
        else if (vonSelbst && v.paused) f._los();
      });
    }, { threshold: [0, 0.5, 1] }).observe(f);
    /* Robert 18.10.2026, 23:41 «Da bitte das Video einfach abspielen lassen auch»: lehnt der Browser das Abspielen ab (Safari im Stromsparmodus), kommt keine Taste,
       das Standbild bleibt stehen und der Film startet beim nächsten Tippen, Scrollen oder Zurückkehren auf die Seite von selbst */
    f._sicht = false;
    new IntersectionObserver(function (es) { f._sicht = es[0].intersectionRatio >= 0.5; }, { threshold: [0, 0.5, 1] }).observe(f);
    f._los = function () { v.muted = true; v.defaultMuted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (vonSelbst) ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { if (f._sicht && v.paused) f._los(); }, { passive: true }); });
    if (vonSelbst) document.addEventListener('visibilitychange', function () { if (!document.hidden && f._sicht && v.paused) f._los(); });
    setze();
  });

  /* ---------- Auftakt: aus der erleuchteten Fensterreihe wächst das Bild der Stube. Ein einziges Element bewegt sich (transform), zwei Lagen blenden (opacity) ---------- */
  var auf = $('.auftakt'), stube = $('.auftakt__stube'), drin = $('.auftakt__drin'), t1 = $('.auftakt__t'), t2 = $('.auftakt__t2'), hausBild = $('.auftakt__haus img');
  var pin = false, pZiel = 0, pIst = 0, pLaeuft = false, masse = null;
  /* Wo die Fensterreihe im Foto sitzt (Anteile der Bildbreite und -höhe, am Original abgelesen) */
  var FX = 0.552, FY = 0.585, S0 = 0.17, OY = 0.46;
  function messe() {
    var vw = window.innerWidth, vh = window.innerHeight, iw = hausBild.naturalWidth || 2560, ih = hausBild.naturalHeight || 1668;
    var m = Math.max(vw / iw, vh / ih), dw = iw * m, dh = ih * m;
    masse = { vw: vw, vh: vh, x: (vw - dw) / 2 + FX * dw - vw * S0 / 2, y: (vh - dh) * OY + FY * dh - vh * S0 / 2, weg: auf.offsetHeight - vh };
  }
  function pinAn() {
    var soll = !!auf && !ruhig && breit.matches && window.innerHeight >= 560;
    if (soll === pin) { if (pin) messe(); return; }
    pin = soll; doc.classList.toggle('pin', pin);
    if (pin) { messe(); zeichne(true); } else { stube.style.transform = ''; stube.style.opacity = ''; t1.style.opacity = ''; t2.style.opacity = ''; }
  }
  function zeichne(sofort) {
    if (!pin) { pLaeuft = false; return; }
    pIst = sofort ? pZiel : pIst + (pZiel - pIst) * 0.14;
    if (Math.abs(pZiel - pIst) < 0.0006) pIst = pZiel;
    var p = pIst, k = Math.max(0, Math.min(1, (p - 0.06) / 0.8)), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    var s = S0 + (1 - S0) * e, x = masse.x * (1 - e), y = masse.y * (1 - e);
    stube.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    stube.style.opacity = Math.max(0, Math.min(1, p / 0.06)).toFixed(3);
    t1.style.opacity = (1 - Math.max(0, Math.min(1, p / 0.16))).toFixed(3);
    t1.style.pointerEvents = p > 0.1 ? 'none' : '';
    var o2 = Math.max(0, Math.min(1, (p - 0.84) / 0.13)); t2.style.opacity = o2.toFixed(3);
    drin.classList.toggle('drin', o2 > 0.6);
    if (pIst !== pZiel) requestAnimationFrame(function () { zeichne(false); }); else pLaeuft = false;
  }
  if (auf && stube) {
    if (hausBild.complete) pinAn(); else hausBild.addEventListener('load', pinAn, { once: true });
    pinAn();
    window.addEventListener('resize', pinAn, { passive: true });
    if (breit.addEventListener) breit.addEventListener('change', pinAn);
  }

  /* ---------- Gleiten: das Bild wandert beim Scrollen sacht in seinem Rahmen und kommt in der Bildschirmmitte am nächsten.
     Gerechnet wird nur, was im Fenster steht; die Bewegung läuft dem Scrollen weich nach (0,1 je Bild). ---------- */
  var gl = [], glLaeuft = false;
  /* 13.10.2026: Kann der Browser die Scroll-Zeitachse, gleiten die Fotos über sie (assets/js/bewegung.js + bewegung.css, ohne Rechnen im Takt). Dann bleibt diese Liste leer. */
  if (!ruhig && !(window.__bewegung && window.__bewegung.za) && 'IntersectionObserver' in window) {
    /* wie auf der Carlton-Seite: jedes gerahmte Foto gleitet, ausser es liegen mehrere Fotos übereinander (Bildstapel) */
    /* seit 08.10.2026 22:30 auch die Kacheln ohne Rahmen (Begrüssung, Zimmer, Bänder, wandernde Karten, Foto-Gruppen): auf der Carlton-Seite sitzt jedes Foto in einem Rahmen und gleitet, hier fehlte das den meisten */
    $$('[data-r="bild"] .rahmen__k img, [data-r="schweb"] .rahmen__k img, [data-r="schweb"] .frei__b img, [data-r="schweb"] .bk__b img, [data-r="schweb"] .dk__b img, [data-r="schweb"].trio__b img, [data-r] .lk__b img').forEach(function (im) {
      if (im.parentNode.querySelectorAll('img').length > 1) return;
      var fig = im.closest('[data-r]'), bild = fig && fig.getAttribute('data-r') === 'bild';
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
            if (!glLaeuft && !(window.__takt && window.__takt.lahm)) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
          } } });
      });
      gl.forEach(function (g) { if (g.auf === 0) glMO.observe(g.fig, { attributes: true, attributeFilter: ['class'] }); });
    } else gl.forEach(function (g) { g.auf = -1; });
    var glIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].da = e.isIntersecting; });
      gleitLies();
    }, { rootMargin: '12% 0px 12% 0px' });
    gl.forEach(function (g) { glIO.observe(g.rahmen); });
  }
  function gleitLies() {
    if (!gl.length || (window.__takt && window.__takt.lahm)) return; var vh = window.innerHeight;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da) continue;
      var r = g.rahmen.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p)); g.ziel = p * Math.min(58, r.height * 0.07); g.zs = 1.115 + Math.abs(p) * 0.045; }
    if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
  }
  if (window.__takt) window.__takt.wenn.push(function (lahm) { if (lahm) { gl.forEach(function (g) { g.el.style.transform = ''; g.ist = 0; g.is = 1.13; }); } else gleitLies(); });
  function gleitLauf() {
    if (window.__takt && window.__takt.lahm) { glLaeuft = false; return; }
    var weiter = false, jetzt = performance.now();
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da && g.auf <= 0) continue;
      g.ist += (g.ziel - g.ist) * 0.1; g.is += (g.zs - g.is) * 0.1;
      if (Math.abs(g.ziel - g.ist) > 0.12 || Math.abs(g.zs - g.is) > 0.0006) weiter = true;
      var e = 1;
      if (g.auf === 0) e = 1 + g.az;
      else if (g.auf > 0) { var t = (jetzt - g.auf) / g.ad;
        if (t >= 1) g.auf = -1; else { weiter = true; t = Math.max(0, t); e = 1 + g.az * (1 - (1 - Math.pow(2, -10 * t)) / 0.99902); } }
      g.el.style.transform = 'translate3d(0,' + g.ist.toFixed(2) + 'px,0) scale(' + (g.is * e).toFixed(4) + ')'; }
    if (weiter) requestAnimationFrame(gleitLauf); else glLaeuft = false;
  }

  /* ---------- Scroll-Takt: ein Lauscher für Leiste, Auftakt und Gleiten ---------- */
  var yAlt = window.scrollY, wartet = false, runter = false;
  /* Robert 18.10.2026, 14:00: «Wenn man schnell scrollt, dann verschwindet dieser Balken da oben nicht … verschwinden, sobald er quasi das Ende des heros erreicht hat, allerspätestens.»
     Leiste und Eck-Knöpfe fahren spätestens am Ende des Kopfbilds weg, nur nach der Lage, unabhängig von Tempo und Pause; zurück kommen sie beim Hochscrollen wie bisher. */
  var heroEnde = 1e9;
  function heroMass() { var h = document.querySelector('.auftakt, .seitenkopf') || document.querySelector('main section, section'); heroEnde = h ? Math.max(140, h.getBoundingClientRect().bottom + window.scrollY - 120) : 140; }
  heroMass(); addEventListener('resize', heroMass); addEventListener('load', heroMass);
  /* Startseite: über dem Auftaktfoto stehen Leiste und Eck-Knöpfe in Creme (Klasse am body), danach in Nachtblau */
  var aufFoto = document.body.classList.contains('auf-foto') ? document.querySelector('.auftakt, .seitenkopf--nacht') : null, warOben = true;
  function fotoLage(y) { if (!aufFoto) return; var ob = y < aufFoto.offsetHeight - 120; if (ob !== warOben) { warOben = ob; document.body.classList.toggle('auf-foto', ob); } }
  /* Wortmarke hängt vom Rand (Robert 17.10.2026, leiste-varianten2.html Nr. 02): ganz oben hängt die Wortmarke, die Links stehen frei daneben; ab 48 px fliesst die Form zur Leiste (Feder oben bei formZiel; beim Laden ohne Übergang) */
  var kopfUnten = null;
  function kopfLage(y) { var u = y > 48; if (u !== kopfUnten) { var erst = kopfUnten === null; kopfUnten = u; document.body.classList.toggle('kopf-unten', u); formZiel(u ? 1 : 0, erst); } }
  doc.classList.add('ohne-wechsel'); fotoLage(window.scrollY); kopfLage(window.scrollY);
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.remove('ohne-wechsel'); }); });
  function lies() {
    var y = window.scrollY;
    fotoLage(y); kopfLage(y);
    if (nav && !doc.classList.contains('offen')) {
      if (y > yAlt + 6) runter = true; else if (y < yAlt - 6) runter = false;
      var da = y < yAlt - 6 || y < 140, weg = !da && runter && (y >= heroEnde || (y > 140 && !form.laeuft));  /* sonst erst wegfahren, wenn der Formwechsel fertig ist; am Ende des Kopfbilds in jedem Fall */
      if (weg || da) { nav.classList.toggle('weg', weg); ecken.forEach(function (k) { k.classList.toggle('weg', weg); }); }
    }
    yAlt = y;
    if (pin && masse && y < auf.offsetTop + auf.offsetHeight) {
      pZiel = masse.weg > 0 ? Math.max(0, Math.min(1, (y - auf.offsetTop) / masse.weg)) : 0;
      if (!pLaeuft && pZiel !== pIst) { pLaeuft = true; requestAnimationFrame(function () { zeichne(false); }); }
    }
    gleitLies();
  }
  window.addEventListener('scroll', function () {
    if (wartet) return; wartet = true;
    requestAnimationFrame(function () { wartet = false; lies(); });
  }, { passive: true });
  lies();
})();

/* ---------- Startseite Fassung 3: Bildwechsel, Band zum Blättern, wandernde Karten, gleitendes Auftaktfoto. Nur transform und opacity, ein Lauscher fürs Scrollen ---------- */
(function () {
  'use strict';
  var doc = document.documentElement, still = doc.classList.contains('still');
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var fein = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Bildwechsel: Zeilen oder Verweise wählen ein Foto im Stapel. Das neue blendet über das alte, das alte bleibt darunter stehen */
  $$('[data-wechsel]').forEach(function (w) {
    var t = $$('[data-zeige]', w), b = $$('.stapel .rahmen__k img, .stapel .rahmen__k video', w), k = $$('.stapel .kerbe', w), f = $$('[data-feld]', w), lf = w.querySelector('.freude__laeufer');
    var jetzt = 0, uhr = 0, hoch = 2, raeumen = 0;
    var ruhe = w.hasAttribute('data-ruhe') ? +w.getAttribute('data-ruhe') : -1;
    function taste(n) { for (var q = 0; q < t.length; q++) if (+t[q].getAttribute('data-zeige') === n) return t[q]; return null; }
    function laeufer() { var x = taste(jetzt); if (lf && x) { lf.style.setProperty('--y', x.offsetTop + 'px'); lf.style.setProperty('--h', x.offsetHeight + 'px'); } }
    if (b[0]) b[0].style.zIndex = 2;
    function waehle(i) {
      if (i === jetzt || !b[i]) return;
      jetzt = i; clearTimeout(raeumen);
      if (b[i].classList.contains('an')) {
        /* das gewünschte Foto steht noch darunter: was darüber liegt, blendet wieder aus (kein Sprung) */
        var eb = +b[i].style.zIndex || 0;
        b.forEach(function (x, n) { if (n !== i && (+x.style.zIndex || 0) > eb) x.classList.remove('an'); });
      } else {
        /* sonst kommt es nach oben und blendet über alles, was gerade zu sehen ist */
        b[i].style.zIndex = ++hoch; b[i].classList.add('an');
      }
      /* ist es ganz da, darf alles darunter ausblenden (unsichtbar, weil verdeckt) */
      raeumen = setTimeout(function () { b.forEach(function (x, n) { if (n !== jetzt) x.classList.remove('an'); }); }, 1350);
      k.forEach(function (x, n) { x.classList.toggle('an', n === i); });
      f.forEach(function (x, n) { x.classList.toggle('an', n === i); });
      t.forEach(function (x) {
        var an = +x.getAttribute('data-zeige') === i;
        if (x.getAttribute('role') === 'tab') { x.setAttribute('aria-selected', an); x.tabIndex = an ? 0 : -1; } else x.setAttribute('aria-current', an);
      });
      laeufer();
    }
    t.forEach(function (x) {
      var i = +x.getAttribute('data-zeige');
      if (x.tagName === 'BUTTON') x.addEventListener('click', function () { waehle(i); });
      x.addEventListener('focus', function () { waehle(i); });
      /* Verweise ohne Maus: der erste Fingertipp wählt, erst der zweite öffnet die Seite */
      if (!fein && x.tagName === 'A') {
        var vorDruck = -1;
        x.addEventListener('pointerdown', function () { vorDruck = jetzt; });
        x.addEventListener('click', function (ev) { if (vorDruck !== i) { ev.preventDefault(); waehle(i); } });
      }
      if (fein) {
        x.addEventListener('mouseenter', function () { clearTimeout(uhr); uhr = setTimeout(function () { waehle(i); }, 110); });
        x.addEventListener('mouseleave', function () { clearTimeout(uhr); if (ruhe >= 0) uhr = setTimeout(function () { waehle(ruhe); }, 420); });
      }
      if (ruhe >= 0) x.addEventListener('blur', function () { waehle(ruhe); });
      x.addEventListener('keydown', function (e) {
        if (x.getAttribute('role') !== 'tab') return;
        var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        e.preventDefault(); var nb = taste((i + d + t.length) % t.length); if (nb) nb.focus();
      });
    });
    laeufer(); window.addEventListener('resize', laeufer, { passive: true }); window.addEventListener('load', laeufer);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(laeufer);
  });

  /* Kurze Filme des Hauses: laufen ohne Ton von selbst, aber nur, solange sie gut im Bild stehen. Wer weniger Bewegung wünscht oder Daten spart, sieht das Standbild */
  var filme = $$('video.auto'), netz = navigator.connection || {};
  /* Die Filme laufen in jedem Zustand (Robert 08.10.2026, wie auf der txtme-Seite): stumm als Eigenschaft, play() bei jeder Gelegenheit.
     Verweigert Safari im Stromsparmodus das Abspielen, läuft der Film als Bild weiter (img mit der Adresse des Films, das spielt Safari immer). */
  var safari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent), nah = [];
  function alsBild(v) {
    if (!safari || v._bild) return; var src = v.currentSrc || v.getAttribute('src'); if (!src) return;
    var im = document.createElement('img'); im.src = src; im.alt = ''; im.setAttribute('aria-hidden', 'true'); im.className = v.className; im.style.zIndex = v.style.zIndex;
    /* Der Film als Bild muss erst ganz geladen sein (rund 2 MB). Bis dahin bleibt das Standbild des Films stehen; vorher wurde der Film sofort
       versteckt und der Rahmen war schwarz (Robert 09.10.2026, Safari im Stromsparmodus). */
    im.style.opacity = '0';
    im.addEventListener('load', function () { im.style.opacity = ''; v.style.visibility = 'hidden'; }, { once: true });
    im.addEventListener('error', function () { im.remove(); v._bild = null; }, { once: true });
    v._bild = im; v.after(im);
    new MutationObserver(function () { im.className = v.className; im.style.zIndex = v.style.zIndex; }).observe(v, { attributes: true, attributeFilter: ['class', 'style'] });
  }
  function spiele(v) {
    if (v._bild || !v.paused) return; v.muted = true; v.defaultMuted = true;
    var pr = v.play(); if (pr && pr.catch) pr.catch(function (er) { if (er && er.name === 'NotAllowedError') alsBild(v); });
  }
  function anstoss() { for (var q = 0; q < nah.length; q++) spiele(nah[q]); }
  if (filme.length && !still && 'IntersectionObserver' in window) {
    ['touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, anstoss, { passive: true }); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) anstoss(); });
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        var k = nah.indexOf(v);
        if (e.isIntersecting && e.intersectionRatio > 0.3) { if (k < 0) nah.push(v); spiele(v); }
        else { if (k >= 0) nah.splice(k, 1); if (!v.paused) v.pause(); }
      });
    }, { threshold: [0, 0.3, 0.6] });
    filme.forEach(function (v) { vio.observe(v); });
    /* Filme mit data-einmal: kurz vor dem Ende des ersten Durchlaufs dunkelt der Rahmen ab und die Wortmarke erscheint (Klasse «ende»).
       Der Film läuft darunter ruhig weiter, so ist der Sprung an den Anfang nicht zu sehen. */
    filme.forEach(function (v) {
      if (!v.hasAttribute('data-einmal')) return;
      var zu = function () {
        if (!v.duration || v.duration - v.currentTime > 1.1) return;
        v.removeEventListener('timeupdate', zu); var st = v.closest('.stapel'); if (st) st.classList.add('ende');
      };
      v.addEventListener('timeupdate', zu);
    });
    /* vorwärmen: lange bevor der Film ins Bild kommt, lädt er an und macht sich bereit; so fällt der Start nicht ins Scrollen */
    var warm = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; warm.unobserve(e.target); var v = e.target; v.preload = 'auto'; if (v.paused && v.readyState === 0) { try { v.load(); } catch (x) {} } });   /* läuft er schon an, wird nicht neu geladen (sonst bräche der Start ab) */
    }, { rootMargin: '150% 0px 150% 0px' });
    filme.forEach(function (v) { warm.observe(v); });
  }

  /* Band: blättern mit Pfeilen, Laufbalken, Ziehen mit der Maus (das Blättern selbst bleibt nativ) */
  function richte(g) {
    var band = g.querySelector('.band'), balken = g.querySelector('.laufbalken'), pf = $$('.pfeile button', g); if (!band) return;
    var weg = band.scrollWidth - band.clientWidth, teil = band.scrollWidth ? Math.min(1, band.clientWidth / band.scrollWidth) : 1, p = weg > 0 ? band.scrollLeft / weg : 0;
    if (balken) { var strich = balken.querySelector('i'), br = (teil * 100).toFixed(1) + '%'; if (strich.style.width !== br) strich.style.width = br; balken.style.visibility = weg > 4 ? 'visible' : 'hidden'; strich.style.transform ='translateX(' + (p * (balken.clientWidth * (1 - teil))).toFixed(1) + 'px)'; }
    if (pf.length) { pf[0].disabled = band.scrollLeft < 4; pf[1].disabled = band.scrollLeft > weg - 4; }
  }
  var gaenge = $$('.blaetter');
  gaenge.forEach(function (g) {
    var band = g.querySelector('.band'), frei = true; if (!band) return;
    band.addEventListener('scroll', function () { if (!frei) return; frei = false; requestAnimationFrame(function () { frei = true; richte(g); }); }, { passive: true });
    $$('.pfeile button', g).forEach(function (b) {
      b.addEventListener('click', function () { var k = band.firstElementChild; if (!k) return; band.scrollBy({ left: (+b.getAttribute('data-richtung')) * (k.offsetWidth + 22), behavior: still ? 'auto' : 'smooth' }); });
    });
    var unten = false, x0 = 0, s0 = 0, weit = false;
    band.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; unten = true; weit = false; x0 = e.clientX; s0 = band.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!unten) return; var d = e.clientX - x0; if (Math.abs(d) > 4) { weit = true; band.classList.add('zieht'); } band.scrollLeft = s0 - d; });
    window.addEventListener('pointerup', function () { unten = false; band.classList.remove('zieht'); });
    band.addEventListener('click', function (e) { if (weit) { e.preventDefault(); e.stopPropagation(); } }, true);
    /* Senkrecht über das Band scrollen (Robert 08.10.2026: «dann ruckelt das einmal nach rechts»): ein Mausrad mit leichtem Seitenanteil nahm das Band mit,
       und es rastete eine Karte weiter. Solange die Bewegung überwiegend senkrecht ist, hält das Band seitlich still; seitliches Wischen blättert wie bisher. */
    /* Seit 09.10.2026 (Robert: «das nach rechts scrollen hakt»): entschieden wird je Geste aus der Summe der ersten Schritte, nicht mehr je Ereignis.
       Vorher sperrte jeder kleine Schritt ohne klaren Seitenanteil (Anlauf und Auslauf eines Wischs, auch 0/0) das Band für 220 ms, mitten im seitlichen Blättern.
       art: 0 offen, 1 senkrecht (Band hält still), 2 seitlich (Band wird nie gesperrt). Eine Pause von 160 ms beginnt eine neue Geste. */
    /* Seit 09.10.2026 abends (Robert: «da springt das bisschen nach links alles, wenn ich drüberscrolle»): bis die Geste entschieden war, liess das Band die ersten
       Schritte seitlich durch und rastete danach zurück. Jetzt ist das Band schon gesperrt, solange die SEITE senkrecht scrollt und die Geste ausserhalb
       des Bandes begonnen hat (das Band läuft unter dem Zeiger durch). Versucht und verworfen: früher entscheiden (3 statt 8 Pixel) und zurückstellen,
       das liess den Anfang eines seitlichen Wischs zurückspringen (band_seitlich.js: 5 Rücksprünge). */
    var halt = 0, art = 0, sx = 0, sy = 0, zuletzt = 0, quer = 0, hoch = 0, l0 = 0, seiteZeit = 0, seiteUhr = 0;
    function los() { clearTimeout(halt); halt = 0; band.classList.remove('senk'); }
    window.addEventListener('scroll', function () {
      seiteZeit = performance.now();
      if (seiteUhr) return;
      /* gesperrt wird nur, wenn die Geste AUSSERHALB des Bandes begonnen hat (das Band läuft unter dem Zeiger durch). Steht der Zeiger schon auf dem Band,
         entscheidet wie bisher die Geste selbst: ein seitlicher Wisch mit etwas Höhenanteil bewegt die Seite ein paar Pixel und darf das Band nicht sperren. */
      var sperrt = art !== 2 && !band.matches(':hover');
      if (sperrt) band.classList.add('senk');
      seiteUhr = setInterval(function () { if (performance.now() - seiteZeit < 170) return; clearInterval(seiteUhr); seiteUhr = 0; if (sperrt && !halt) band.classList.remove('senk'); }, 90);
    }, { passive: true });
    band.addEventListener('wheel', function (e) {
      var m = e.deltaMode === 1 ? 16 : 1, ax = Math.abs(e.deltaX) * m, ay = Math.abs(e.deltaY) * m; if (!ax && !ay) return;
      if (e.timeStamp - zuletzt > 160) { art = 0; sx = sy = quer = hoch = 0; l0 = band.scrollLeft; } zuletzt = e.timeStamp;
      if (!art) { sx += ax; sy += ay; if (sx + sy >= 8) art = sy >= sx * 1.5 ? 1 : 2; }
      else if (art === 1) { quer = ax >= 2 && ax > ay * 2 ? quer + 1 : 0; if (quer > 1) { art = 2; hoch = 0; } }
      else { hoch = ay >= 4 && ay > ax * 2 ? hoch + 1 : 0; if (hoch > 2) { art = 1; quer = 0; } }
      if (art !== 1) { if (halt) los(); return; }
      if (!halt) band.classList.add('senk'); clearTimeout(halt); halt = setTimeout(los, 160);
    }, { passive: true });
    richte(g);
  });
  if (gaenge.length) { var ra = function () { gaenge.forEach(richte); }; window.addEventListener('resize', ra, { passive: true }); window.addEventListener('load', ra); }

  /* Scroll-Takt dieses Blocks: das Auftaktfoto wandert langsamer als die Seite (0,16), die drei Karten bei «Feste» wandern verschieden schnell.
     Beides läuft dem Scrollen weich nach (0,12 je Bild) und rechnet nur, solange die Stelle im Fenster steht. */
  if (still) return;
  var breit = matchMedia('(min-width: 901px)');
  var auf = document.querySelector('.auftakt__steh'), haus = document.querySelector('.auftakt__haus'), mitHaus = auf && haus && !document.querySelector('.auftakt__stube');
  var hZiel = 0, hIst = 0, hLaeuft = false;
  function hausLauf() {
    if (window.__takt && window.__takt.lahm) { hLaeuft = false; return; }
    hIst += (hZiel - hIst) * 0.12;
    if (Math.abs(hZiel - hIst) < 0.2) { hIst = hZiel; hLaeuft = false; }
    haus.style.transform = 'translate3d(0,' + hIst.toFixed(1) + 'px,0)';
    if (hLaeuft) requestAnimationFrame(hausLauf);
  }
  /* Felder mit wandernden Karten: mehrere je Seite möglich; data-drift nennt den Weg in Pixeln (leer = 90) */
  var felder = $$('[data-drift]').map(function (f) { return { el: f, karten: $$('.drift', f), ziel: 0, ist: 0, laeuft: false, weg: +(f.getAttribute('data-drift') || 90) }; });
  function driftLauf(F) {
    if (window.__takt && window.__takt.lahm) { F.laeuft = false; return; }
    F.ist += (F.ziel - F.ist) * 0.12;
    if (Math.abs(F.ziel - F.ist) < 0.15) { F.ist = F.ziel; F.laeuft = false; }
    for (var i = 0; i < F.karten.length; i++) F.karten[i].style.transform = 'translate3d(0,' + (F.ist * (+F.karten[i].getAttribute('data-tempo'))).toFixed(1) + 'px,0)';
    if (F.laeuft) requestAnimationFrame(function () { driftLauf(F); });
  }
  function driftStart(F) { if (!F.laeuft) { F.laeuft = true; requestAnimationFrame(function () { driftLauf(F); }); } }
  if (window.__takt) window.__takt.wenn.push(function (lahm) {
    if (!lahm) { lies(); return; }
    if (mitHaus) { hZiel = hIst = 0; haus.style.transform = ''; }
    felder.forEach(function (F) { F.ziel = F.ist = 0; F.karten.forEach(function (k) { k.style.transform = ''; }); });
  });
  function lies() {
    if (window.__takt && window.__takt.lahm) return;
    var y = window.scrollY, vh = window.innerHeight;
    if (mitHaus && y < auf.offsetHeight * 1.1) {
      hZiel = Math.min(y, auf.offsetHeight) * 0.16;
      if (!hLaeuft && Math.abs(hZiel - hIst) > 0.2) { hLaeuft = true; requestAnimationFrame(hausLauf); }
    }
    for (var n = 0; n < felder.length; n++) {
      var F = felder[n];
      if (breit.matches) {
        var r = F.el.getBoundingClientRect();
        if (r.bottom > -120 && r.top < vh + 120) {
          F.ziel = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * F.weg;
          if (Math.abs(F.ziel - F.ist) > 0.15) driftStart(F);
        }
      } else if (F.ist !== 0) { F.ziel = 0; driftStart(F); }
    }
  }
  var wartet = false;
  window.addEventListener('scroll', function () { if (wartet) return; wartet = true; requestAnimationFrame(function () { wartet = false; lies(); }); }, { passive: true });
  lies();
})();

/* ---------- «Worauf freuen Sie sich?»: Galerie mit Tiefe. Vorn steht ein Blatt mit seinem Text darunter. Beim Weitergehen wandert es nach links hinten
   und wird blass, von rechts hinten kommt das nächste nach vorn (Robert 09.10.2026: Pfeil rechts zeigt das Blatt, das rechts steht). Weiter mit Pfeilen, Reitern, Klick auf ein Blatt im Hintergrund, Wischen oder seitlichem Scrollen.
   Bewegt wird nur transform und opacity (Stile in main.css), hier wird nur die Lage je Blatt gesetzt. ---------- */
(function () {
  var b = document.querySelector('[data-wahl]'); if (!b) return;
  var band = b.querySelector('.wahl__band'), bl = [].slice.call(band.children), rt = [].slice.call(document.querySelectorAll('.wahl__reiter button')), pf = [].slice.call(b.querySelectorAll('.wahl__pf'));
  var n = bl.length, ist = 0;
  function lage(k, i) { var d = ((k - i) % n + n) % n; return d === 0 ? 'vorn' : d === 1 ? 'rechts' : d === n - 1 ? 'links' : 'fern'; }
  function setze(i, vor) {
    bl.forEach(function (el, k) {
      var alt = el.getAttribute('data-lage') || 'fern-r', neu = lage(k, i);
      if (neu === 'fern') neu = alt === 'rechts' ? 'fern-r' : alt === 'links' ? 'fern-l' : alt === 'vorn' ? (vor ? 'fern-l' : 'fern-r') : alt;
      /* kommt ein Blatt aus dem Unsichtbaren, startet es auf seiner Seite: ohne Übergang dorthin gesetzt, dann erst bewegt */
      var start = neu === 'links' && alt === 'fern-r' ? 'fern-l' : neu === 'rechts' && alt === 'fern-l' ? 'fern-r' : '';
      if (start) { el.classList.add('sprung'); el.setAttribute('data-lage', start); void el.offsetWidth; el.classList.remove('sprung'); }
      el.setAttribute('data-lage', neu); el.classList.toggle('an', neu === 'vorn');
      var t = el.querySelector('.wahl__t'); if (t) t.inert = neu !== 'vorn';
    });
    rt.forEach(function (x, k) { x.setAttribute('aria-selected', k === i); x.tabIndex = k === i ? 0 : -1; });
  }
  function geh(i) { i = ((i % n) + n) % n; if (i === ist) return; var d = ((i - ist) % n + n) % n, vor = d <= n / 2; ist = i; setze(i, vor); }
  setze(0, true);
  rt.forEach(function (x, k) {
    x.addEventListener('click', function () { geh(k); });
    x.addEventListener('keydown', function (e) { var r = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!r) return; e.preventDefault(); var z = (k + r + n) % n; rt[z].focus(); geh(z); });
  });
  pf.forEach(function (x) { x.addEventListener('click', function () { geh(ist + (+x.getAttribute('data-richtung'))); }); });
  bl.forEach(function (el, k) { el.querySelector('.rahmen').addEventListener('click', function () { if (k !== ist) geh(k); }); });
  /* Wischen: das Blatt folgt der Hand nach links hinten (weiter) oder nach rechts (zurück). Senkrechtes Scrollen bleibt unberührt (touch-action: pan-y) */
  var x0 = null, y0 = 0;
  band.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; });
  band.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) geh(ist + (dx < 0 ? 1 : -1)); });
  band.addEventListener('pointercancel', function () { x0 = null; });
  /* seitliches Scrollen am Trackpad blättert; nur dann wird das Ereignis angehalten (sonst ginge Safari eine Seite zurück) */
  var summe = 0, ruhe = 0;
  band.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;
    e.preventDefault(); var jetzt = Date.now(); if (jetzt < ruhe) return;
    summe += e.deltaX; if (Math.abs(summe) > 70) { geh(ist + (summe > 0 ? 1 : -1)); summe = 0; ruhe = jetzt + 900; }
  }, { passive: false });
})();

/* ---------- Grosse Zahlen zählen hoch, sobald sie im Bild stehen (Robert 08.10.2026: «überall, wo solche Zahlen sind»). Jahreszahlen starten 60 davor, alles andere bei null.
   Die Breite der fertigen Zahl wird vorher festgehalten, damit beim Zählen nichts daneben verrutscht. ---------- */
(function () {
  if (!('IntersectionObserver' in window) || document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var z = [].slice.call(document.querySelectorAll('.jahr b span')).filter(function (el) {
    var m = el.textContent.trim().match(/^(\d+(?:\.\d+)?)(\D*)$/); if (!m) return false;
    el._ziel = parseFloat(m[1]); el._st = (m[1].split('.')[1] || '').length; el._rest = m[2]; el._von = el._ziel >= 1000 ? el._ziel - 60 : 0; return true;
  });
  if (!z.length) return;
  function zeige(el, n) { el.textContent = n.toFixed(el._st) + el._rest; }
  function zaehle(el) {
    var t0 = 0, dauer = 1500;
    (function schritt(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - k, 3); zeige(el, k < 1 ? (el._st ? el._von + (el._ziel - el._von) * w : Math.round(el._von + (el._ziel - el._von) * w)) : el._ziel); if (k < 1) requestAnimationFrame(schritt); })(performance.now());
  }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); zaehle(e.target); }); }, { threshold: 0.6 });
  function bereit() { z.forEach(function (el) { el.style.display = 'inline-block'; el.style.minWidth = el.getBoundingClientRect().width + 'px'; zeige(el, el._von); io.observe(el); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(bereit); else bereit();
})();


/* 16.10.2026 · «Demnächst im Haus» als Bühne: Leiste, Pfeile und Wischen wählen einen Termin. Gewechselt wird erst, wenn das neue Foto entpackt ist,
   damit es nie leer überblendet; Foto, Text und Leiste wechseln im selben Augenblick. Die Höhe der Fläche bleibt dabei gleich. */
(function () {
  [].forEach.call(document.querySelectorAll('[data-dmn]'), function (dmn) {
    var alle = function (s) { return [].slice.call(dmn.querySelectorAll(s)); };
    var bilder = alle('.dmn__bilder img'), texte = alle('.dmn__t'), knoepfe = alle('.dmn__leiste button'), leiste = dmn.querySelector('.dmn__leiste');
    var jetzt = 0, wunsch = 0, uhr = 0, n = bilder.length; if (n < 2) return;
    function bereit(im) { if (im.loading === 'lazy') im.loading = 'eager'; return im.complete && im.naturalWidth ? Promise.resolve() : (im.decode ? im.decode() : Promise.resolve()).catch(function () {}); }
    function zeige(z) {
      z = (z + n) % n; wunsch = z; if (z === jetzt) return;
      bereit(bilder[z]).then(function () {
        if (wunsch !== z || z === jetzt) return;
        var alt = jetzt; jetzt = z;
        bilder.forEach(function (b, i) { if (i !== alt && i !== z) b.classList.remove('an', 'war', 'kommt'); });
        bilder[alt].classList.remove('an', 'kommt'); bilder[alt].classList.add('war');
        bilder[z].classList.remove('war'); bilder[z].classList.add('an', 'kommt');
        clearTimeout(uhr); uhr = setTimeout(function () { bilder[alt].classList.remove('war'); bilder[z].classList.remove('kommt'); }, 950);
        texte[alt].classList.remove('an', 'kommt'); texte[z].classList.remove('kommt'); void texte[z].offsetWidth; texte[z].classList.add('an', 'kommt');
        knoepfe.forEach(function (k, i) { k.classList.toggle('an', i === z); k.setAttribute('aria-selected', i === z ? 'true' : 'false'); });
        if (leiste && leiste.scrollWidth > leiste.clientWidth + 4) leiste.scrollTo({ left: knoepfe[z].offsetLeft - parseFloat(getComputedStyle(leiste).paddingLeft || 0), behavior: 'smooth' });
      });
    }
    /* das nächste Foto schon holen, sobald die Bühne naht, damit der erste Klick nicht wartet */
    if ('IntersectionObserver' in window) {
      var nah = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { nah.disconnect(); bilder.forEach(function (b) { bereit(b); }); } }, { rootMargin: '60% 0px' });
      nah.observe(dmn);
    }
    knoepfe.forEach(function (k, i) {
      k.addEventListener('click', function () { zeige(i); });
      k.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var z = (jetzt + (e.key === 'ArrowRight' ? 1 : -1) + n) % n; zeige(z); knoepfe[z].focus(); } });
    });
    alle('.pfeile button').forEach(function (b) { b.addEventListener('click', function () { zeige(jetzt + (+b.getAttribute('data-richtung') || 1)); }); });
    /* Wischen über das Foto (Handy): deutlich seitwärts wechselt, senkrecht scrollt die Seite wie immer */
    var x0 = 0, y0 = 0;
    dmn.addEventListener('touchstart', function (e) { if (e.target.closest('.dmn__leiste')) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    dmn.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) zeige(jetzt + (dx < 0 ? 1 : -1)); }, { passive: true });
  });
})();

/* 16.10.2026 «Worauf freuen Sie sich?»: Überfahren einer Karte zeigt darunter ihre Angaben. Am Touchgerät zeigt das erste Tippen die Angaben, das zweite öffnet die Seite. */
(function () {
  var k = [].slice.call(document.querySelectorAll('[data-vf]')); if (!k.length) return;
  var tx = [].slice.call(document.querySelectorAll('[data-vf-text]')), jetzt = 0;
  var maus = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  /* die Fotos der verborgenen Angaben laden, sobald der Abschnitt naht: beim Wechseln steht das Foto dann sofort scharf da */
  var fotos = [].slice.call(document.querySelectorAll('.vf__foto img')), geholt = false;
  function hol() { if (geholt) return; geholt = true; fotos.forEach(function (im) { im.loading = 'eager'; }); }
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); hol(); } }, { rootMargin: '0px 0px 120% 0px' }); io.observe(k[0]); } else hol();
  function zeige(i) {
    if (i === jetzt) return; jetzt = i;
    k.forEach(function (a, n) { a.classList.toggle('an', n === i); });
    tx.forEach(function (t, n) { var an = n === i; t.hidden = !an; t.classList.toggle('an', an); t.classList.remove('kommt'); if (an) { void t.offsetWidth; t.classList.add('kommt'); } });
  }
  k.forEach(function (a, n) {
    a.addEventListener('mouseenter', function () { zeige(n); });
    a.addEventListener('focus', function () { zeige(n); });
    a.addEventListener('click', function (e) { if (!maus && n !== jetzt) { e.preventDefault(); zeige(n); } });
  });
})();
