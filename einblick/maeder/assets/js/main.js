/* Die Seite öffnet immer oben im Auftakt, ausser die Adresse trägt selbst einen Anker (Robert 18.10.2026 18:30, Link aus dem PDF landete bei «Bis bald.»:
   «bitte stell sicher, dass … die Links oben die Seite zeigen»). Der Browser stellt keine alte Scroll-Stelle wieder her; Sprungmarken schreiben nichts in die Adresse. */
(function () {
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  var nie = false; document.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('a[href^="#"]')) nie = true; }, true);
  if (!location.hash) { window.scrollTo(0, 0); addEventListener('load', function () { if (!location.hash && !nie && window.pageYOffset > 0) window.scrollTo(0, 0); }); }
  addEventListener('pageshow', function (ev) { if (ev.persisted && !location.hash) window.scrollTo(0, 0); });
})();
/* Familie Maeder — ein Takt, nativer Scroll, Bewegung nur über transform/opacity (Bausteine der vier Haus-Seiten) */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var vorhang = !doc.classList.contains('kein-vorhang');
  try { sessionStorage.setItem('fm-da', '1'); } catch (e) {}

  /* ---------- Zahlen fürs Haus: Besuch, gewähltes Haus, «Zum Haus», Buchen. Keine Kekse, keine Adressen, keine Namen; Prüfläufe (?nomotion) zählen nicht ---------- */
  var zaehlt = !/[?&](nomotion|zaehlt=0)/.test(location.search) && !navigator.webdriver;
  function zahl(t, k) {
    if (!zaehlt) return;
    var roh = JSON.stringify({ t: t, k: k || '', sp: 'de', l: ((navigator.language || '').split('-')[1] || '').toUpperCase() });
    try { fetch('/api/zahlen', { method: 'POST', headers: { 'content-type': 'application/json' }, body: roh, keepalive: true, credentials: 'omit' }).catch(function () {}); } catch (e) {}
  }
  zahl('seite');

  /* ---------- Einblenden ---------- */
  var ziele = $$('[data-r]'), auftakt = $('.auftakt');
  var OBEN = '100000px';   /* die Beobachter reichen nach oben weit über das Fenster hinaus: wer per Anker springt, überspringt nichts */
  if (ruhig || !('IntersectionObserver' in window)) {
    ziele.concat($$('.z'), $$('.in__t'), $$('[data-weg]')).forEach(function (el) { el.classList.add('da'); });
  } else {
    /* Bilder erst zeigen, wenn sie geladen und entpackt sind – sonst blitzen sie beim Einblenden auf */
    var wennBereit = function (el, dann) {
      var offen = $$('img', el).filter(function (im) { return im.offsetParent !== null; }), n = offen.length, los = false;
      var fertig = function () { if (los) return; los = true; dann(); };
      if (!n) return fertig();
      var eins = function () { if (--n <= 0) fertig(); };
      offen.forEach(function (im) {
        var entpackt = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
        if (im.complete && im.naturalWidth) return entpackt();
        im.loading = 'eager';
        im.addEventListener('load', entpackt, { once: true });
        im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 700);
    };
    /* Text und Flächen starten, sobald sie unten ins Fenster rücken: sie steigen sichtbar von unten auf */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: OBEN + ' 0px 4% 0px', threshold: 0 });
    /* Bilder starten erst, wenn ihre Oberkante im Fenster steht: das Heraufschweben passiert im Blick */
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { bio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, { rootMargin: OBEN + ' 0px -7% 0px', threshold: 0 });
    /* Reihen: die Bilder starten gemeinsam und steigen nacheinander auf (eines nach dem anderen, nicht alle im selben Augenblick) */
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        dio.unobserve(e.target);
        wennBereit(e.target, function () { $$('[data-r]', e.target).forEach(function (k, n) { k.style.transitionDelay = '0s'; setTimeout(function () { k.classList.add('da'); }, n * 150); }); });
      });
    }, { rootMargin: OBEN + ' 0px -7% 0px', threshold: 0 });
    $$('[data-gruppe]').forEach(function (d) { dio.observe(d); });
    /* Fenster: der Satz steht fest hinter dem Ausschnitt und rollt Zeile für Zeile herauf, sobald der Ausschnitt ihn zu einem Drittel freigegeben hat */
    $$('.bruch').forEach(function (b) {
      var t = $('.in__t', b), fio = null;
      if (!t) return;
      var lausche = function () {
        if (fio) fio.disconnect();
        var r = t.getBoundingClientRect(), linie = r.top + r.height * 0.3;
        fio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            fio.disconnect(); fio = null; window.removeEventListener('resize', lausche);
            t.classList.add('da');
          });
        }, { rootMargin: OBEN + ' 0px -' + Math.max(0, Math.round(window.innerHeight - linie)) + 'px 0px', threshold: 0 });
        fio.observe(b);
      };
      lausche();
      window.addEventListener('resize', lausche, { passive: true });
    });
    /* der Weg von Haus zu Haus zeichnet sich, sobald er zu einem Viertel im Fenster steht */
    var wio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); wio.unobserve(e.target); } }); }, { rootMargin: OBEN + ' 0px -14% 0px', threshold: 0 });
    $$('[data-weg]').forEach(function (w) { wio.observe(w); });
    ziele.forEach(function (el) {
      if (el.closest('.auftakt') || el.closest('[data-gruppe]')) return;
      var art = el.getAttribute('data-r');
      if (art === 'bild' || art === 'schweb') bio.observe(el); else io.observe(el);
    });
  }
  /* Auftakt: startet mit dem Laden (nach dem Vorhang) */
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    doc.classList.add('los');
    if (auftakt) { auftakt.classList.add('da'); $$('[data-r]', auftakt).forEach(function (el) { el.classList.add('da'); }); }
  }); });

  /* ---------- Laufband: läuft nur, solange es im Bild ist ---------- */
  if (!ruhig && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); }, { rootMargin: '80px 0px' });
    $$('[data-laufband]').forEach(function (z) { lio.observe(z); });
  }

  /* ---------- Grosse Zahlen: hochzählen, sobald sie im Bild sind ---------- */
  var zahlen = $$('[data-zahl]');
  if (zahlen.length && !ruhig && 'IntersectionObserver' in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        zio.unobserve(e.target);
        var el = e.target, ziel = +el.getAttribute('data-zahl'), von = ziel > 1000 ? ziel - 24 : 0, t0 = null, dauer = ziel > 1000 ? 2100 : 1500;
        function schritt(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(von + (ziel - von) * w);
          if (p < 1) requestAnimationFrame(schritt);
        }
        el.textContent = von;
        setTimeout(function () { requestAnimationFrame(schritt); }, 250);
      });
    }, { threshold: 0.3 });
    zahlen.forEach(function (z) { zio.observe(z); });
  }

  /* ---------- Leiste und Menü ---------- */
  var nav = $('.nav'), burger = $('.burger');
  function menueZu() { doc.classList.remove('offen'); document.body.style.overflow = ''; if (burger) burger.setAttribute('aria-expanded', 'false'); }
  if (burger) {
    burger.addEventListener('click', function () {
      var an = doc.classList.toggle('offen');
      burger.setAttribute('aria-expanded', an);
      document.body.style.overflow = an ? 'hidden' : '';
    });
    $$('.menue a,.menue button').forEach(function (a) { a.addEventListener('click', menueZu); });
  }
  /* Buchstaben der Menüpunkte einzeln fassen, damit sie beim Überfahren durchrollen */
  $$('[data-rl]').forEach(function (el) {
    var t = el.textContent; el.setAttribute('aria-label', t); el.textContent = '';
    t.split('').forEach(function (b, n) { var i = document.createElement('i'); i.textContent = b; i.setAttribute('data-b', b); i.setAttribute('aria-hidden', 'true'); i.style.setProperty('--k', n); el.appendChild(i); });
  });
  /* Sprungmarken: weich an die Stelle, die Leiste verdeckt nichts */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var z = document.getElementById(a.getAttribute('href').slice(1)); if (!z) return;
      e.preventDefault();
      window.scrollTo({ top: z.getBoundingClientRect().top + window.scrollY, behavior: ruhig ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Auftakt: die Hausleiste. Eine dunkle Taste wandert unter das gewählte Haus, das Foto dahinter blendet über ---------- */
  var wahl = $('.wahl');
  if (wahl) (function () {
    var tasten = $$('.wahl__z', wahl), taste = $('.wahl__taste', wahl), lagen = $$('.auftakt__bild picture'), zum = $('[data-zum]', wahl);
    var aktiv = 0, uhr = null, selbst = true, imBild = true, TAKT = +wahl.getAttribute('data-takt') || 6500;   /* Takt aus dem Empfang (Angabe «Hausleiste») */
    function lege() {   /* Lage der Taste aus dem gewählten Feld */
      var t = tasten[aktiv], st = getComputedStyle(t);
      taste.style.setProperty('--x', t.offsetLeft + 'px'); taste.style.setProperty('--y', t.offsetTop + 'px');
      taste.style.setProperty('--b', t.offsetWidth + 'px'); taste.style.setProperty('--h', t.offsetHeight + 'px');
      ['l', 'k', 'n', 'g'].forEach(function (c) { taste.style.setProperty('--t' + c, st.getPropertyValue('--h' + c)); });
    }
    function hole(p) {   /* Foto eines weiteren Hauses nachladen */
      if (p._geholt) return; p._geholt = true;
      $$('[data-srcset]', p).forEach(function (q) { q.setAttribute('srcset', q.getAttribute('data-srcset')); q.removeAttribute('data-srcset'); });
    }
    function zeige(n, vonHand) {
      var p = lagen[n], im = $('img', p);
      hole(p);
      var los = function () {
        aktiv = n;
        tasten.forEach(function (t, i) { t.setAttribute('aria-selected', i === n ? 'true' : 'false'); t.tabIndex = i === n ? 0 : -1; });
        lagen.forEach(function (l, i) { l.classList.toggle('an', i === n); });
        zum.href = tasten[n].getAttribute('data-ziel'); zum.setAttribute('aria-label', 'Zum Haus: ' + tasten[n].getAttribute('data-name'));
        lege();
        if (vonHand) { selbst = false; clearTimeout(uhr); wahl.classList.remove('laeuft'); wahl.classList.add('steht'); }
        else lauf();
      };
      if (im.complete && im.naturalWidth) (im.decode ? im.decode() : Promise.resolve()).then(los, los);
      else { im.addEventListener('load', los, { once: true }); im.addEventListener('error', los, { once: true }); }
    }
    function lauf() {   /* der Strich in der Taste füllt sich, dann kommt das nächste Haus */
      clearTimeout(uhr); wahl.classList.remove('laeuft');
      if (!selbst || ruhig || !imBild || document.hidden || window.scrollY > 80) return;   /* beim Scrollen wechselt kein Bild: dann bewegt sich nur die Seite */
      void wahl.offsetWidth; wahl.classList.add('laeuft');
      uhr = setTimeout(function () { zeige((aktiv + 1) % tasten.length); }, TAKT);
      hole(lagen[(aktiv + 1) % lagen.length]);
    }
    wahl.style.setProperty('--takt', TAKT + 'ms');
    tasten.forEach(function (t, i) {
      t.addEventListener('click', function () { zeige(i, true); zahl('haus', t.getAttribute('data-k')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); var n = (i + (e.key === 'ArrowRight' ? 1 : tasten.length - 1)) % tasten.length; zeige(n, true); tasten[n].focus();
      });
    });
    zum.addEventListener('click', function () { zahl('zum', tasten[aktiv].getAttribute('data-k')); });
    lege();
    window.addEventListener('resize', lege, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lege);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      imBild = es[0].isIntersecting; wahl.style.animationPlayState = imBild ? '' : 'paused';
      if (imBild) { if (wahl._bereit) lauf(); } else { clearTimeout(uhr); wahl.classList.remove('laeuft'); }
    }, { threshold: 0.2 }).observe(wahl);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimeout(uhr); wahl.classList.remove('laeuft'); } else if (wahl._bereit) lauf(); });
    window.addEventListener('load', function () { setTimeout(function () { wahl._bereit = true; lauf(); }, vorhang ? 2900 : 1500); });
    if (ruhig) wahl.classList.add('steht');
    var oben = true;
    window.addEventListener('scroll', function () {
      var o = window.scrollY <= 80; if (o === oben) return; oben = o;
      if (!o) { clearTimeout(uhr); wahl.classList.remove('laeuft'); } else if (wahl._bereit) lauf();
    }, { passive: true });
  })();

  /* ---------- Gleiten: das Bild wandert beim Scrollen sacht in seinem Rahmen und kommt in der Bildschirmmitte am nächsten.
     Gerechnet wird nur, was im Fenster steht; die Bewegung läuft dem Scrollen weich nach ---------- */
  var gl = [], glLaeuft = false;
  if (!ruhig && 'IntersectionObserver' in window) {
    $$('[data-r="bild"] .rahmen__k img, [data-r="schweb"] .rahmen__k img, .pola__b img, .fh__bild img').forEach(function (im) {
      gl.push({ el: im, rahmen: im.parentNode, da: false, ziel: 0, ist: 0, zs: 1.16, is: 1.16 });
    });
    var glIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].da = e.isIntersecting; });
      gleitLies();
    }, { rootMargin: '12% 0px 12% 0px' });
    gl.forEach(function (g) { glIO.observe(g.rahmen); });
  }
  function gleitLies() {
    if (!gl.length) return; var vh = window.innerHeight;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da) continue;
      var r = g.rahmen.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p)); g.ziel = p * Math.min(58, r.height * 0.07); g.zs = 1.115 + Math.abs(p) * 0.045; }
    if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
  }
  function gleitLauf() {
    var weiter = false;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da) continue;
      g.ist += (g.ziel - g.ist) * 0.1; g.is += (g.zs - g.is) * 0.1;
      if (Math.abs(g.ziel - g.ist) > 0.12 || Math.abs(g.zs - g.is) > 0.0006) weiter = true;
      g.el.style.transform = 'translate3d(0,' + g.ist.toFixed(2) + 'px,0) scale(' + g.is.toFixed(4) + ')'; }
    if (weiter) requestAnimationFrame(gleitLauf); else glLaeuft = false;
  }

  /* ---------- Fenster und Schluss: das Bild hinter dem Ausschnitt wandert beim Scrollen langsam mit (15 % der Fensterhöhe),
     der Satz sitzt fest auf dem Bild ---------- */
  var fe = [], feLaeuft = false;
  if (!ruhig && 'IntersectionObserver' in window) {
    // Fenster (.bruch) nicht mehr per Skript mitziehen (Robert 18.10.2026 18:15: «wenn ich da scrolle zittert die Seite auch und das Bild»): Bild und Satz liegen fest
    // (position:fixed), das nachlaufende Verschieben per Skript kam in Safari einen Takt hinter dem Scrollen an und liess beides zittern. Der Fenster-Effekt bleibt.
    $$('.schluss').forEach(function (b) { var im = $('.schluss__bild img', b); if (im) fe.push({ el: im, text: null, bezug: b, da: false, ziel: 0, ist: 0, weg: 0.07 }); });
    var feIO = new IntersectionObserver(function (es) { es.forEach(function (e) { for (var i = 0; i < fe.length; i++) if (fe[i].bezug === e.target) fe[i].da = e.isIntersecting; }); fensterLies(); }, { rootMargin: '10% 0px 10% 0px' });
    fe.forEach(function (x) { feIO.observe(x.bezug); });
  }
  function fensterLies() {
    if (!fe.length) return; var vh = window.innerHeight, los = false;
    for (var i = 0; i < fe.length; i++) { var x = fe[i]; if (!x.da) continue;
      var r = x.bezug.getBoundingClientRect(); x.ziel = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * vh * x.weg; los = true; }
    if (los && !feLaeuft) { feLaeuft = true; requestAnimationFrame(fensterLauf); }
  }
  function fensterLauf() {
    var weiter = false;
    for (var i = 0; i < fe.length; i++) { var x = fe[i]; if (!x.da) continue;
      x.ist += (x.ziel - x.ist) * 0.14;
      if (Math.abs(x.ziel - x.ist) > 0.2) weiter = true; else x.ist = x.ziel;
      x.el.style.transform = 'translate3d(0,' + x.ist.toFixed(1) + 'px,0)';
      if (x.text) x.text.style.transform = x.el.style.transform; }
    if (weiter) requestAnimationFrame(fensterLauf); else feLaeuft = false;
  }

  /* ---------- Scroll-Takt: Leiste, Auftaktbild (zieht mit 16 % des Scrollwegs mit) ---------- */
  var heroBild = $('.auftakt__bild'), yAlt = window.scrollY, ziel = 0, ist = 0, laeuft = false;
  function lies() {
    gleitLies(); fensterLies();
    var y = window.scrollY;
    if (nav && !doc.classList.contains('offen')) {
      if (y > 140 && y > yAlt + 6) nav.classList.add('weg');
      else if (y < yAlt - 6 || y < 140) nav.classList.remove('weg');
    }
    yAlt = y;
    if (heroBild && !ruhig) ziel = Math.min(y, auftakt.offsetHeight) * 0.16;
  }
  function bild() {
    ist += (ziel - ist) * 0.12;
    if (Math.abs(ziel - ist) < 0.2) { ist = ziel; laeuft = false; }
    heroBild.style.transform = 'translate3d(0,' + ist.toFixed(1) + 'px,0)';
    if (laeuft) requestAnimationFrame(bild);
  }
  var wartet = false;
  window.addEventListener('scroll', function () {
    if (wartet) return; wartet = true;
    requestAnimationFrame(function () {
      wartet = false; lies();
      if (heroBild && !ruhig && !laeuft && Math.abs(ziel - ist) > 0.2 && window.scrollY < auftakt.offsetHeight * 1.1) { laeuft = true; requestAnimationFrame(bild); }
    });
  }, { passive: true });
  window.addEventListener('resize', function () { gleitLies(); fensterLies(); }, { passive: true });
  lies();

  $$('.haus .kn-reihe a.kn[target], .halt .kn-reihe a.kn[target], .fh__kn a.kn[target], a.fp__s[target]').forEach(function (a) { a.addEventListener('click', function () { var h = a.closest('.ks__h, .halt, .haus, .fh, .fp__s'); var k = h ? (h.className.match(/h-([a-z]+)/) || [])[1] : ''; zahl('zum', k); }); });

  /* ---------- Buchen: erst das Haus, dann Anreise, Abreise und Gäste. Drei Häuser führen in ihr Buchungssystem,
     das Berghotel Gasterntal nimmt die Anfrage per E-Mail entgegen (so hält es das Haus), daneben steht Booking.com ---------- */
  var dlg = $('dialog.buchen');
  if (dlg && dlg.showModal) (function () {
    var f = $('form', dlg), D = JSON.parse($('#haeuser').textContent), an = f.elements.an, ab = f.elements.ab, ga = f.elements.gaeste;
    var hinweis = $('[data-hinweis]', dlg), losText = $('[data-los]', dlg), zweit = $('[data-zweit]', dlg);
    var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
    var tag = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
    var kurz = function (d) { return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear(); };
    var plus = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
    var jetzt = new Date(), heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
    var schluss = tag(D.saison.schluss), eroeffnung = tag(D.saison.auf);
    var haus = function () { return f.elements.haus.value; };
    var geschlossen = function (d) { return haus() === 'gasterntal' && d > schluss && d < eroeffnung; };
    var felder = $('.felder', f), tasten = $$('[data-kal]', f), modus = 'an', monat = null;
    var kal = document.createElement('div'); kal.className = 'kal'; kal.hidden = true; kal.setAttribute('role', 'group'); kal.setAttribute('aria-label', 'Datum wählen'); felder.appendChild(kal);
    an.value = iso(heute); ab.value = iso(plus(heute, 1));
    function zeig() {
      $('[data-zeig="an"]', f).textContent = kurz(tag(an.value)); $('[data-zeig="ab"]', f).textContent = kurz(tag(ab.value));
      $('[data-zeig="gaeste"]', f).textContent = ga.value + (+ga.value > 1 ? ' Personen' : ' Person');
      $$('[data-stufe]', f).forEach(function (x) { x.disabled = (+x.getAttribute('data-stufe') < 0 && +ga.value <= 1) || (+x.getAttribute('data-stufe') > 0 && +ga.value >= 8); });
      var k = haus(), h = D.h[k], post = h.art === 'mail';
      losText.textContent = post ? 'Anfrage schreiben' : 'Verfügbarkeit prüfen';
      zweit.hidden = !post; if (post) zweit.href = h.ziel;
      var text = '';
      if (k === 'carlton') text = 'Im Carlton-Europe sind Hotelgäste ab 16 Jahren willkommen.';
      if (k === 'doldenhorn' || k === 'ruedihus') text = 'Waldhotel Doldenhorn und Landgasthof Ruedihus haben ein gemeinsames Buchungssystem. Das Haus wählen Sie dort in der Liste.';
      if (k === 'gasterntal') text = (geschlossen(tag(an.value)) || geschlossen(plus(tag(ab.value), -1)) ? 'In dieser Zeit ist das Berghotel geschlossen. ' : '') + 'Saisonschluss 2026: ' + kurz(schluss) + ' · Eröffnung 2027: ' + kurz(eroeffnung) + ' (falls das Wetter mitspielt). Die Anfrage geht per E-Mail ans Haus.';
      hinweis.textContent = text; hinweis.hidden = !text;
    }
    function zu() { if (kal.hidden) return; kal.hidden = true; tasten.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); }); }
    function male() {
      var a = tag(an.value), b = tag(ab.value), j = monat.getFullYear(), m = monat.getMonth(), tage = new Date(j, m + 1, 0).getDate(), leer = (new Date(j, m, 1).getDay() + 6) % 7;
      var h = '<div class="kal__kopf"><div><small>' + (modus === 'an' ? 'Anreise wählen' : 'Abreise wählen') + '</small><b>' + MONATE[m] + ' ' + j + '</b></div><div class="kal__pf"><button type="button" data-m="-1" aria-label="Monat zurück"' + (new Date(j, m, 1) <= new Date(heute.getFullYear(), heute.getMonth(), 1) ? ' disabled' : '') + '><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg></button><button type="button" data-m="1" aria-label="Monat vor"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button></div></div>';
      h += '<div class="kal__woche"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div><div class="kal__raster">';
      for (var l = 0; l < leer; l++) h += '<i></i>';
      for (var d = 1; d <= tage; d++) {
        var t = new Date(j, m, d), aus = modus === 'an' ? t < heute : t <= a, kl = [];
        if (+t === +a) kl.push('an'); if (+t === +b) kl.push('ab'); if (t > a && t < b) kl.push('zw'); if (+t === +heute) kl.push('heute'); if (geschlossen(t)) kl.push('ges');   /* geschlossene Tage (nicht «zu»: das ist der Schliessen-Knopf des Fensters) */
        h += '<button type="button" data-t="' + iso(t) + '"' + (kl.length ? ' class="' + kl.join(' ') + '"' : '') + (aus ? ' disabled' : '') + '>' + d + '</button>';
      }
      kal.innerHTML = h + '</div>';
    }
    function auf(taste) {
      modus = taste.getAttribute('data-kal'); var bezug = tag((modus === 'an' ? an : ab).value); monat = new Date(bezug.getFullYear(), bezug.getMonth(), 1);
      tasten.forEach(function (x) { x.setAttribute('aria-expanded', x === taste ? 'true' : 'false'); });
      male(); kal.hidden = false; kal.scrollIntoView({ block: 'nearest', behavior: ruhig ? 'auto' : 'smooth' });
    }
    tasten.forEach(function (x) { x.addEventListener('click', function () { if (!kal.hidden && x.getAttribute('aria-expanded') === 'true') zu(); else auf(x); }); });
    kal.addEventListener('click', function (e) {
      var k = e.target.closest('button'); if (!k) return;
      if (k.hasAttribute('data-m')) { monat = new Date(monat.getFullYear(), monat.getMonth() + (+k.getAttribute('data-m')), 1); male(); return; }
      var t = k.getAttribute('data-t');
      if (modus === 'an') {
        an.value = t; if (tag(ab.value) <= tag(t)) ab.value = iso(plus(tag(t), 1));
        modus = 'ab'; tasten.forEach(function (x) { x.setAttribute('aria-expanded', x.getAttribute('data-kal') === 'ab' ? 'true' : 'false'); });
        zeig(); male();
      } else { ab.value = t; zeig(); zu(); }
    });
    $$('[data-stufe]', f).forEach(function (x) { x.addEventListener('click', function () { ga.value = Math.max(1, Math.min(8, +ga.value + (+x.getAttribute('data-stufe')))); zeig(); }); });
    $$('input[name="haus"]', f).forEach(function (r) { r.addEventListener('change', function () { zeig(); if (!kal.hidden) male(); }); });
    function oeffne(k) {
      menueZu();
      if (k && D.h[k]) f.elements.haus.value = k;
      zu(); zeig(); doc.style.overflow = 'hidden'; dlg.showModal();
    }
    $$('[data-buchen]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); oeffne(b.getAttribute('data-buchen')); }); });
    dlg.addEventListener('close', function () { doc.style.overflow = ''; });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('.zu', dlg).addEventListener('click', function () { dlg.close(); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !kal.hidden) { e.preventDefault(); zu(); } });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var h = D.h[haus()], n = +ga.value;
      zahl('buchen', haus());
      if (h.art === 'mail') {
        var text = 'Guten Tag\n\nGerne frage ich ein Zimmer im ' + h.name + ' an.\n\nAnreise: ' + kurz(tag(an.value)) + '\nAbreise: ' + kurz(tag(ab.value)) + '\nGäste: ' + n + '\n\nFreundliche Grüsse';
        location.href = 'mailto:' + h.mail + '?subject=' + encodeURIComponent('Zimmeranfrage ' + h.name) + '&body=' + encodeURIComponent(text);
      } else {
        var g = []; for (var i = 0; i < n; i++) g.push('A');
        window.open(h.ziel + '?lang=DE&cur=CHF&in=' + an.value + '&out=' + ab.value + '&guests=' + encodeURIComponent(g.join(',')), '_blank', 'noopener');
      }
      dlg.close();
    });
    zeig();
  })();
})();
