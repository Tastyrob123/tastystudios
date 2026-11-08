/* Berghotel Gasterntal — ein Takt, nativer Scroll, Bewegung nur über transform und opacity (Bausteine nach Salt & Silver und Carlton-Europe) */
(function () {
  'use strict';
/* Jede Seite öffnet oben, auch nach Neuladen und Zurück (Robert 18.10.2026 18:30: «… dass … die Links oben die Seite zeigen») */
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  /* Kopfbild in zwei Stufen (Robert 18.10.2026 23:40 «im Hero … laden erst sehr spät»): die mittlere Fassung steht sofort, die volle legt sich nach dem Laden der Seite still darüber */
  [].forEach.call(document.querySelectorAll('img[data-voll]'), function (im) {
    var mehr = function () { if (im.dataset.vollDa) return; im.dataset.vollDa = 1;
      var pic = im.parentElement; if (pic && pic.tagName === 'PICTURE' && [].some.call(pic.querySelectorAll('source[media]'), function (s) { return matchMedia(s.media).matches; })) return;   /* am Handy zeigt die Startseite ein eigenes Bild */ var v = new Image(); v.onload = function () { im.srcset = im.srcset + ', ' + im.dataset.voll; }; v.src = im.dataset.voll.split(' ')[0]; };
    var los = function () { if (document.readyState === 'complete') setTimeout(mehr, 150); else addEventListener('load', function () { setTimeout(mehr, 150); }, { once: true }); };
    if (im.complete && im.naturalWidth) los(); else im.addEventListener('load', los, { once: true });
  });
  if (ruhig) doc.classList.add('still');

  /* ---------- Einblenden ---------- */
  var ziele = $$('[data-r]'), linien = $$('.linie:not([data-r]), .zahlen, .weglinie'), auf = $('.auftakt');
  if (ruhig || !('IntersectionObserver' in window)) {
    ziele.concat(linien, $$('.z'), auf ? [auf] : []).forEach(function (el) { el.classList.add('da'); });
    $$('[data-an], .nicht').forEach(function (el) { el.classList.add('an'); });
  } else {
    /* Bilder erst zeigen, wenn sie geladen und entpackt sind – sonst blitzen sie beim Einblenden auf */
    var wennBereit = function (el, dann) {
      var offen = $$('img', el).filter(function (im) { return im.offsetParent !== null; }), n = offen.length, los = false;
      var fertig = function () { if (los) return; los = true; dann(); };
      if (!n) return fertig();
      var eins = function () { if (--n <= 0) fertig(); };
      offen.forEach(function (im) {
        var entpackt = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
        if (im.complete && im.naturalWidth) return eins();   /* schon geladen: nicht mehr aufs Entpacken warten (BEWEGUNG 13.10.2026, die Stücke stehen deckend da) */
        im.loading = 'eager';
        im.addEventListener('load', entpackt, { once: true });
        im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 250);   /* Robert 18.10.2026 17:18: «direkt reinschweben, nicht warten» */
    };
    /* Die Beobachter reichen nach oben weit über das Fenster hinaus: wer per Anker springt, überspringt nichts */
    /* Robert 18.10.2026 18:17 («zu früh, zu schnell»): ein Auftritt startet, wenn rund ein Fünftel des Elements im Bild ist; bei sehr hohen Elementen ein Fünftel des Fensters */
    var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= window.innerHeight * 0.2); }, FUENFTEL = { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, FUENFTEL);   /* Schrift und Zeilen starten kurz vor dem unteren Rand (BEWEGUNG 13.10.2026, vorher 12 %): mit dem längeren, weicheren Lauf sieht man sie im Fenster aufsteigen */
    /* grosse Bilder kommen früher: sobald die Oberkante unten ins Fenster rückt */
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (fuenftel(e)) { bio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, FUENFTEL);   /* BEWEGUNG 13.10.2026, vorher -7 %: Bilder stehen deckend da, ihr Foto kommt aus der Vergrösserung, sobald sie unten ins Fenster rücken */
    /* Gruppen, deren Bilder gemeinsam starten und nacheinander aufsteigen (Reihen auf einer Höhe) */
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!fuenftel(e)) return;
        dio.unobserve(e.target);
        wennBereit(e.target, function () { $$('[data-r]', e.target).forEach(function (k) { k.classList.add('da'); }); });
      });
    }, FUENFTEL);   /* BEWEGUNG 13.10.2026, vorher -7 %: Bilder stehen deckend da, ihr Foto kommt aus der Vergrösserung, sobald sie unten ins Fenster rücken */
    $$('[data-gruppe]').forEach(function (d) { dio.observe(d); });
    /* Fenster: Bild und Satz stehen fest dahinter. Der Satz rollt Zeile für Zeile herauf, sobald der Ausschnitt ihn freigegeben hat. */
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
        }, { rootMargin: '100000px 0px -' + Math.max(0, Math.round(window.innerHeight - linie)) + 'px 0px', threshold: 0 });
        fio.observe(b);
      };
      lausche();
      window.addEventListener('resize', lausche, { passive: true });
    });
    ziele.forEach(function (el) {
      if (el.closest('.auftakt')) return;
      if (!el.closest('[data-gruppe]')) {
        var art = el.getAttribute('data-r');
        if (art === 'bild' || art === 'schweb' || art === 'rechts' || art === 'links') bio.observe(el); else io.observe(el);
      }
    });
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (fuenftel(e)) { e.target.classList.add('da'); sio.unobserve(e.target); } }); }, FUENFTEL);
    linien.forEach(function (el) { sio.observe(el); });
    var aio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('an'); var n = e.target.closest('.nicht'); if (n) n.classList.add('an'); aio.unobserve(e.target); } }); }, { rootMargin: '100000px 0px -22% 0px', threshold: 0.12 });
    $$('[data-an]').forEach(function (el) { aio.observe(el); });
    /* Seitenkopf der Unterseiten (Robert 18.10.2026 17:46 «stell das bitte überall sicher»): das Titelbild zoomt einmal von 1,04 an seinen Platz, sobald es geladen ist */
    var sk = $('.seitenkopf'), skb = $('.seitenkopf__bild img');
    if (sk && skb) { var skLos = function () { requestAnimationFrame(function () { sk.classList.add('bild-da'); }); };
      if (skb.complete && skb.naturalWidth) skLos(); else { skb.addEventListener('load', skLos, { once: true }); skb.addEventListener('error', skLos, { once: true }); setTimeout(skLos, 1500); } }
    /* Auftakt: sobald das Bild des Hauses da ist, kommt es zur Ruhe und der Titel fährt hoch */
    if (auf) {
      var start = function () { requestAnimationFrame(function () { auf.classList.add('da'); $$('[data-r]', auf).forEach(function (k) { k.classList.add('da'); }); }); };
      var hb = $('.auftakt__haus img');
      if (!hb || (hb.complete && hb.naturalWidth)) start(); else { hb.addEventListener('load', start, { once: true }); hb.addEventListener('error', start, { once: true }); setTimeout(start, 1500); }
    }
  }

  /* ---------- Laufband: läuft nur, solange es im Bild ist ---------- */
  if ('IntersectionObserver' in window && !ruhig) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); });
    $$('.laufband').forEach(function (l) { lio.observe(l); });
  }

  /* ---------- Leiste und Menü ---------- */
  var nav = $('.nav'), burger = $('.burger'), ecken = $$('.glanz');
  /* SPRACHEN 18.10.2026: noch nicht übersetzte Sprachen sind wählbar, schliessen aber nur ruhig die Liste; die Seite bleibt (Robert 14:40). Klick daneben oder Esc schliesst auch. */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-folgt]');
    if (b) { ev.preventDefault(); var d = b.closest('details'); if (d) d.removeAttribute('open'); return; }
    $$('details.sprache[open]').forEach(function (d) { if (!d.contains(ev.target)) d.removeAttribute('open'); });
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') $$('details.sprache[open]').forEach(function (d) { d.removeAttribute('open'); }); });
  function menueZu() { doc.classList.remove('offen'); document.body.style.overflow = ''; if (burger) burger.setAttribute('aria-expanded', 'false'); }
  if (burger) {
    burger.addEventListener('click', function () {
      var an = doc.classList.toggle('offen');
      burger.setAttribute('aria-expanded', an);
      document.body.style.overflow = an ? 'hidden' : '';
    });
    $$('.menue a,.menue button').forEach(function (a) { if (!a.hasAttribute('data-folgt')) a.addEventListener('click', menueZu); });   /* «folgt»-Sprachen lassen das Menü offen, es passiert nichts */
  }

  /* ---------- Saison: eine Stelle (data-schluss, data-auf am <html>), alle Anzeigen lesen von dort ---------- */
  var tag = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var kurz = function (d) { return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear(); };
  var heute = new Date(); heute = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
  var schluss = tag(doc.getAttribute('data-schluss')), eroeffnung = tag(doc.getAttribute('data-auf')), vorbehalt = doc.getAttribute('data-vorbehalt');
  var offen = heute <= schluss || heute >= eroeffnung;
  var tageBis = Math.round(((offen ? schluss : eroeffnung) - heute) / 864e5);
  if (heute >= eroeffnung) { offen = true; tageBis = -1; }   /* neue Saison läuft, der neue Schluss steht noch nicht in den Daten */
  $$('[data-saison="kurz"]').forEach(function (el) { el.textContent = offen ? (tageBis >= 0 ? 'Offen bis ' + kurz(schluss) : 'Offen') : 'Eröffnung ' + kurz(eroeffnung); });
  $$('[data-saison="zahl"]').forEach(function (el) { el.textContent = tageBis >= 0 ? tageBis : ''; if (tageBis > 3) el.setAttribute('data-zaehl', ''); });
  $$('[data-saison="wort"]').forEach(function (el) {
    el.textContent = tageBis < 0 ? 'Die Saison läuft.' : offen ? (tageBis === 1 ? 'Tag' : 'Tage') + ' bis Saisonschluss am ' + kurz(schluss) : (tageBis === 1 ? 'Tag' : 'Tage') + ' bis zur Eröffnung am ' + kurz(eroeffnung) + ', ' + vorbehalt;
  });

  /* ---------- Anlass: verschwindet nach seinem Datum ---------- */
  $$('[data-bis]').forEach(function (el) { if (heute > tag(el.getAttribute('data-bis'))) el.hidden = true; });

  /* ---------- Takt der Chluse: Bergfahrt Minute 45 bis 05, Talfahrt Minute 15 bis 35. Der Zeiger steht auf der Minute des Gastes ---------- */
  var uhr = $('[data-uhr]');
  if (uhr) {
    var zeiger = $('[data-zeiger]', uhr), jetzt = $('[data-jetzt]', uhr), dann = $('[data-dann]', uhr), imBild = true;
    var takt = function () {
      if (!imBild) return;
      var d = new Date(), mm = d.getMinutes(), m = mm + d.getSeconds() / 60;
      if (zeiger) zeiger.style.transform = 'rotate(' + (m * 6).toFixed(1) + 'deg)';
      var bis = function (ziel) { return (ziel - mm + 60) % 60 || 60; };
      var vor = jetzt.hasAttribute('data-kurz') ? '' : 'Jetzt: ';
      /* die vier Minuten kommen aus dem Studio (data-hv … data-rb am Takt), Standard: Bergfahrt 45 bis 05, Talfahrt 15 bis 35 */
      var z = function (n, s) { var v = parseInt(uhr.getAttribute(n), 10); return isNaN(v) ? s : ((v % 60) + 60) % 60; };
      var hv = z('data-hv', 45), hb = z('data-hb', 5), rv = z('data-rv', 15), rb = z('data-rb', 35);
      var drin = function (v, b) { return v < b ? (mm >= v && mm < b) : (mm >= v || mm < b); };
      if (drin(hv, hb)) { jetzt.textContent = vor + 'Bergfahrt offen'; dann.textContent = 'noch ' + bis(hb) + ' Min., Talfahrt in ' + bis(rv) + ' Min.'; }
      else if (drin(rv, rb)) { jetzt.textContent = vor + 'Talfahrt offen'; dann.textContent = 'noch ' + bis(rb) + ' Min., Bergfahrt in ' + bis(hv) + ' Min.'; }
      else if (bis(rv) < bis(hv)) { jetzt.textContent = (vor ? vor + 'beide Richtungen warten' : 'Beide Richtungen warten'); dann.textContent = 'Talfahrt in ' + bis(rv) + ' Min., Bergfahrt in ' + bis(hv) + ' Min.'; }
      else { jetzt.textContent = (vor ? vor + 'beide Richtungen warten' : 'Beide Richtungen warten'); dann.textContent = 'Bergfahrt in ' + bis(hv) + ' Min., Talfahrt in ' + bis(rv) + ' Min.'; }
    };
    takt(); setInterval(takt, 15000);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { imBild = es[0].isIntersecting; if (imBild) takt(); }).observe(uhr);
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
  $$('[data-reiter]').forEach(function (r) { if (!r.closest('dialog')) reiter(r); });

  /* ---------- Zimmer nach Personenzahl: zeigt nur die Zeilen, die zur Wahl passen ---------- */
  $$('[data-wahl]').forEach(function (balken) {
    var feld = document.getElementById(balken.getAttribute('data-wahl')), zeilen = $$('.zeile', feld), stand = $('[data-stand]', balken.parentNode);
    var zeige = function (n) {
      var da = 0;
      zeilen.forEach(function (z) { var ok = z.getAttribute('data-p').split(' ').indexOf(n) > -1; z.hidden = !ok; if (ok) da++; });
      $$('button', balken).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-n') === n ? 'true' : 'false'); });
      if (stand) stand.textContent = da + ' von ' + zeilen.length + ' passen';
    };
    balken.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) zeige(b.getAttribute('data-n')); });
    zeige('2');
  });

  /* ---------- Buchen: Fenster mit zwei Reitern. «Zimmer» schreibt eine Anfrage ans Haus (Datum und Gäste stehen schon in der Mail),
     der zweite Knopf führt zu Booking.com. «Tisch und Sauna» zeigt Telefon und E-Mail. ---------- */
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var plus = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); };
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var gtext = function (n) { return n >= 9 ? 'mehr als 8 Personen' : n + (n > 1 ? ' Personen' : ' Person'); };
  var PFL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>', PFR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
  /* Ein Formular mit Anreise, Abreise und Gästen. Der Kalender ist ein eigenes Blatt im Stil der Seite:
     erst die Anreise wählen, dann die Abreise. Tage ausserhalb der Saison sind durchgestrichen. */
  function datum(f) {
    var an = f.elements.an, ab = f.elements.ab, ga = f.elements.gaeste, erster = offen ? heute : eroeffnung;
    var wirt = $('.felder', f) || f, frei = wirt === f, tasten = $$('[data-kal]', f), modus = 'an', monat = null;
    var kal = document.createElement('div'); kal.className = 'kal'; kal.hidden = true; kal.setAttribute('role', 'dialog'); kal.setAttribute('aria-label', 'Datum wählen'); wirt.appendChild(kal);
    an.value = iso(erster); ab.value = iso(plus(erster, 1));
    var zuAn = function (d) { return d < erster || (d > schluss && d < eroeffnung); };
    var zuAb = function (d) { var a = tag(an.value); return d <= a || (a <= schluss && d > plus(schluss, 1)); };
    function zeig() {
      $$('[data-zeig="an"]', f).forEach(function (x) { x.textContent = kurz(tag(an.value)); });
      $$('[data-zeig="ab"]', f).forEach(function (x) { x.textContent = kurz(tag(ab.value)); });
      $$('[data-zeig="gaeste"]', f).forEach(function (x) { x.textContent = gtext(+ga.value); });
      $$('[data-stufe]', f).forEach(function (x) { x.disabled = (+x.getAttribute('data-stufe') < 0 && +ga.value <= 1) || (+x.getAttribute('data-stufe') > 0 && +ga.value >= 9); });
    }
    function melde(feld) { feld.dispatchEvent(new Event('change', { bubbles: true })); }
    function zu() { if (kal.hidden) return; kal.hidden = true; tasten.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); }); }
    function male() {
      var a = tag(an.value), b = tag(ab.value), j = monat.getFullYear(), m = monat.getMonth(), tage = new Date(j, m + 1, 0).getDate(), leer = (new Date(j, m, 1).getDay() + 6) % 7;
      var h = '<div class="kal__kopf"><div><small>' + (modus === 'an' ? 'Anreise wählen' : 'Abreise wählen') + '</small><b>' + MONATE[m] + ' ' + j + '</b></div><div class="kal__pf"><button type="button" data-m="-1" aria-label="Monat zurück"' + (new Date(j, m, 1) <= new Date(erster.getFullYear(), erster.getMonth(), 1) ? ' disabled' : '') + '>' + PFL + '</button><button type="button" data-m="1" aria-label="Monat vor">' + PFR + '</button></div></div>';
      h += '<div class="kal__woche"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div><div class="kal__raster">';
      for (var l = 0; l < leer; l++) h += '<i></i>';
      for (var d = 1; d <= tage; d++) {
        var t = new Date(j, m, d), aus = modus === 'an' ? zuAn(t) : zuAb(t), geschl = t > (modus === 'an' ? schluss : plus(schluss, 1)) && t < eroeffnung, kl = [];
        if (+t === +a) kl.push('an'); if (+t === +b) kl.push('ab'); if (t > a && t < b) kl.push('zw'); if (+t === +heute) kl.push('heute'); if (geschl) kl.push('zu');
        h += '<button type="button" data-t="' + iso(t) + '"' + (kl.length ? ' class="' + kl.join(' ') + '"' : '') + (aus ? ' disabled' : '') + '>' + d + '</button>';
      }
      kal.innerHTML = h + '</div><p class="kal__fuss">Saisonschluss ' + kurz(schluss) + ' · Eröffnung ' + kurz(eroeffnung) + ', ' + vorbehalt + '</p>';
    }
    function auf(taste) {
      modus = taste.getAttribute('data-kal'); var bezug = tag((modus === 'an' ? an : ab).value); monat = new Date(bezug.getFullYear(), bezug.getMonth(), 1);
      tasten.forEach(function (x) { x.setAttribute('aria-expanded', x === taste ? 'true' : 'false'); });
      male(); kal.hidden = false;
      if (frei) kal.style.left = Math.max(0, Math.min(taste.offsetLeft, f.clientWidth - 372)) + 'px';
    }
    tasten.forEach(function (x) { x.addEventListener('click', function () { if (!kal.hidden && x.getAttribute('aria-expanded') === 'true') zu(); else auf(x); }); });
    kal.addEventListener('click', function (e) {
      var k = e.target.closest('button'); if (!k) return;
      if (k.hasAttribute('data-m')) { monat = new Date(monat.getFullYear(), monat.getMonth() + (+k.getAttribute('data-m')), 1); male(); return; }
      var t = k.getAttribute('data-t');
      if (modus === 'an') {
        an.value = t; if (zuAb(tag(ab.value))) ab.value = iso(plus(tag(t), 1));
        modus = 'ab'; tasten.forEach(function (x) { x.setAttribute('aria-expanded', x.getAttribute('data-kal') === 'ab' ? 'true' : 'false'); });
        zeig(); melde(an); male();
      } else { ab.value = t; zeig(); melde(ab); zu(); }
    });
    document.addEventListener('pointerdown', function (e) { if (!kal.hidden && !kal.contains(e.target) && !e.target.closest('[data-kal]')) zu(); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !kal.hidden) { e.preventDefault(); e.stopPropagation(); zu(); } });
    $$('[data-stufe]', f).forEach(function (x) { x.addEventListener('click', function () { ga.value = Math.max(1, Math.min(9, +ga.value + (+x.getAttribute('data-stufe')))); zeig(); }); });
    f._zeig = zeig; f._zu = zu; zeig();
  }
  $$('form[data-zimmer]').forEach(datum);
  /* Das Licht am Rand (Leiste, Takt, Eck-Knopf) läuft als eigene Lage, die nur gedreht wird: die Grafikkarte dreht sie, der Browser malt nichts neu.
     Vorher drehte sich der Verlauf selbst (Winkel als Variable) und jedes Bild wurde neu gerechnet und gemalt, auch im Stillstand (gemessen 09.10.2026).
     Ohne Skript bleibt der Rand stehen, wie er gemalt ist. Leiste und Takt drehen nur, solange sie im Bild sind. */
  $$('.glanz, .leiste, .takt').forEach(function (el) { var r = document.createElement('i'); r.className = 'ring'; r.setAttribute('aria-hidden', 'true'); var w = el.tagName === 'DETAILS' ? el.querySelector('summary') : el; w.insertBefore(r, w.firstChild); });   /* Sprachwahl: Ring in die summary, sonst gehört er zum Aufklappteil */
  if ('IntersectionObserver' in window) $$('.leiste, .takt').forEach(function (el) { new IntersectionObserver(function (es) { el.classList.toggle('ruht', !es[0].isIntersecting); }).observe(el); });
  var dlg = $('dialog.buchen');
  if (dlg && dlg.showModal) {
    var wahl = reiter($('[data-reiter]', dlg)), tabs = $$('[role="tab"]', dlg), form = $('form', dlg), zuText = $('.buchen__zu', dlg);
    var pruefe = function () {
      var a = tag(form.elements.an.value), b = tag(form.elements.ab.value), zu = (a > schluss && a < eroeffnung) || (b > new Date(schluss.getTime() + 864e5) && b <= eroeffnung && a <= schluss);
      zuText.hidden = !zu;
      return !zu;
    };
    form.elements.an.addEventListener('change', pruefe); form.elements.ab.addEventListener('change', pruefe);
    var oeffne = function (welcher, von) {
      menueZu();
      if (von) { form.elements.an.value = von.elements.an.value; form.elements.ab.value = von.elements.ab.value; form.elements.gaeste.value = von.elements.gaeste.value; if (von._zu) von._zu(); }
      form._zeig();
      wahl(welcher === 'tisch' ? tabs[1] : tabs[0]); pruefe(); dlg.showModal();
    };
    $$('[data-buchen]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); oeffne(b.getAttribute('data-buchen')); }); });
    $$('form.leiste').forEach(function (l) { l.addEventListener('submit', function (e) { e.preventDefault(); oeffne('zimmer', l); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!pruefe()) return;
      var a = kurz(tag(form.elements.an.value)), b = kurz(tag(form.elements.ab.value)), g = gtext(+form.elements.gaeste.value);
      var betreff = 'Anfrage Zimmer ' + a + ' bis ' + b + ', ' + g;
      var text = 'Guten Tag\n\nIch möchte gern ein Zimmer anfragen.\n\nAnreise: ' + a + '\nAbreise: ' + b + '\nGäste: ' + g + '\n' + (form._extra ? form._extra() : '') + '\nFreundliche Grüsse\n';   // _extra: Zimmer, Anreise, Hund aus dienste.js
      var zl = ['Ich möchte gern ein Zimmer anfragen.', 'Anreise: ' + a, 'Abreise: ' + b, 'Gäste: ' + g].concat((form._extra ? form._extra() : '').split('\n').filter(Boolean));
      if (window.bgSchreibe) { return window.bgSchreibe(betreff, zl, form.elements.an.value, +form.elements.gaeste.value); }   // Robert 17.10.2026: Anfrage-Fenster auf der Seite statt Mailprogramm (assets/js/anfrage.js)
      window.location.href = 'mailto:' + form.getAttribute('data-mail') + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text);
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { form._zu(); });
    $('.zu', dlg).addEventListener('click', function () { dlg.close(); });
  }

  /* ---------- Bühne mit Schalter: zwei Bilder füllen dieselbe Fläche, der Schalter blendet um ---------- */
  $$('[data-schalter]').forEach(function (sb) {
    var tabs = $$('[role="tab"]', sb), bilder = $$('.zbuehne__bild button', sb);
    tabs.forEach(function (x, i) { x.addEventListener('click', function () {
      tabs.forEach(function (y, k) { y.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      var im = $('img', bilder[i]), an = function () { bilder.forEach(function (b, k) { b.classList.toggle('an', k === i); }); };
      im.loading = 'eager'; if (im.decode) im.decode().then(an, an); else an();
    }); });
  });

  /* ---------- Polaroid-Stapel durchblättern: Pfeile unter dem Stapel, das oberste Bild wandert nach unten oder das unterste nach oben ---------- */
  $$('.stapel').forEach(function (st) {
    var karten = $$('.pola', st), folge = karten.map(function (k, i) { return i; }), laeuft = false;
    var lege = function () { folge.forEach(function (n, z) { karten[n].style.zIndex = z + 1; }); };
    var blaettere = function (r) {
      if (laeuft || !st.classList.contains('an')) return; laeuft = true; st.classList.add('bedient');
      var n = r > 0 ? folge[folge.length - 1] : folge[0], kl = r > 0 ? 'raus' : 'raus-l';
      karten[n].classList.add(kl);
      setTimeout(function () {
        if (r > 0) { folge.pop(); folge.unshift(n); } else { folge.shift(); folge.push(n); }
        lege(); karten[n].classList.remove(kl);
        setTimeout(function () { laeuft = false; }, ruhig ? 0 : 380);
      }, ruhig ? 0 : 430);
    };
    lege();
    $$('[data-stapel]', st.parentNode).forEach(function (b) { b.addEventListener('click', function () { blaettere(+b.getAttribute('data-stapel')); }); });
    st.addEventListener('click', function () { blaettere(1); });
  });

  /* ---------- Die Zimmer: eine Wahl in grosser Schrift, das Bild daneben wechselt mit ---------- */
  $$('[data-zimmerwahl]').forEach(function (zb) {
    var tasten = $$('.zw', zb), bilder = $$('.zbuehne__bild button:not([hidden])', zb), name = $('[data-name]', zb);
    var waehle = function (i) {
      tasten.forEach(function (x, k) { x.setAttribute('aria-expanded', k === i ? 'true' : 'false'); document.getElementById(x.getAttribute('aria-controls')).hidden = k !== i; });
      var im = $('img', bilder[i]), an = function () { bilder.forEach(function (b, k) { b.classList.toggle('an', k === i); }); name.textContent = bilder[i].getAttribute('data-leg'); };
      im.loading = 'eager'; if (im.decode) im.decode().then(an, an); else an();
    };
    tasten.forEach(function (x, i) { x.addEventListener('click', function () { waehle(i); }); });
  });

  /* ---------- Bühne: alle Fotos einer Reihe gross, Daumenreihe, Pfeile und Pfeiltasten ---------- */
  var bn = $('dialog.buehne');
  if (bn && bn.showModal) {
    var gross = $('.buehne__bild img', bn), reihe = $('.buehne__daumen', bn), titel = $('.buehne__kopf h2', bn), fotos = [], stelle = 0;
    var zeige = function (i) {
      stelle = (i + fotos.length) % fotos.length; var f = fotos[stelle];
      gross.src = f[0]; gross.alt = f[1]; titel.textContent = f[1];
      $$('button', reihe).forEach(function (b, k) { b.setAttribute('aria-current', k === stelle); });
    };
    $$('[data-buehne]').forEach(function (gruppe) {
      var karten = $$('[data-foto]', gruppe);
      karten.forEach(function (k, nr) {
        k.addEventListener('click', function () {
          fotos = karten.map(function (x) { return JSON.parse(x.getAttribute('data-foto')); });
          reihe.innerHTML = '';
          fotos.forEach(function (f, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', f[1]); var im = new Image(); im.src = f[2]; im.alt = ''; b.appendChild(im); b.addEventListener('click', function () { zeige(i); }); reihe.appendChild(b); });
          zeige(nr); bn.showModal();
        });
      });
    });
    $('[data-vor]', bn).addEventListener('click', function () { zeige(stelle + 1); });
    $('[data-zurueck]', bn).addEventListener('click', function () { zeige(stelle - 1); });
    $('.zu', bn).addEventListener('click', function () { bn.close(); });
    bn.addEventListener('click', function (e) { if (e.target === bn) bn.close(); });
    bn.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') zeige(stelle + 1); if (e.key === 'ArrowLeft') zeige(stelle - 1); });
  }

  /* ---------- Gleiten: jedes Bild wandert beim Scrollen sacht in seinem Rahmen und ist in der Bildschirmmitte am nächsten.
     Gerechnet wird nur, was im Fenster steht; die Bewegung läuft dem Scrollen weich nach (0,1 je Bild). ---------- */
  var breit = matchMedia('(min-width: 901px)');
  var gl = [], glLaeuft = false;
  if (!ruhig && 'IntersectionObserver' in window) {
    $$('.rahmen__k img, .frei__b img, .bogen__b img, .fh__bild img, .polas .pola__b img, .tisch__p .pola__b img').forEach(function (im) {
      if (im.closest('dialog') || im.closest('[data-ruht]')) return;
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
            if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
          } } });
      });
      gl.forEach(function (g) { if (g.auf === 0) glMO.observe(g.fig, { attributes: true, attributeFilter: ['class'] }); });
    } else gl.forEach(function (g) { g.auf = -1; });
    /* BEWEGUNG 13.10.2026: kann der Browser die Scroll-Zeitachse (Safari ab 26, Chrome), fährt das Foto selbst am Scroll (bewegung.css: .bw-rahmen, img.bw-gleit),
       ohne Nachlauf, ohne Rechnen im Takt und ohne will-change. Das Skript macht dort nur noch den Auftritt aus der Vergrösserung. Fotos in einer eigenen
       Scroll-Fläche (Band zum Blättern, beschnittene Bühnen) bleiben beim Rechnen im Takt. */
    var ZA = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()') && CSS.supports('view-timeline: --a block'));
    var eigeneFlaeche = function (el) { for (var v = el.parentNode; v && v !== document.documentElement && v.nodeType === 1; v = v.parentNode) { var o = getComputedStyle(v); if (/auto|scroll|hidden/.test(o.overflowY + ' ' + o.overflowX)) return true; } return false; };
    var glMass = function () { gl.forEach(function (g) { if (g.za) g.el.style.setProperty('--bw-glw', Math.min(58, g.rahmen.getBoundingClientRect().height * 0.07).toFixed(1) + 'px'); }); };
    if (ZA) { gl.forEach(function (g) { if (eigeneFlaeche(g.rahmen)) return; g.za = true; g.rahmen.classList.add('bw-rahmen'); if (g.auf === 0) g.el.style.transform = 'scale(' + (1.16 * (1 + g.az)).toFixed(4) + ')'; });
      glMass(); window.addEventListener('resize', glMass, { passive: true }); window.addEventListener('load', glMass); }
    var glIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].da = e.isIntersecting; });
      gleitLies();
    }, { rootMargin: '12% 0px 12% 0px' });
    gl.forEach(function (g) { glIO.observe(g.rahmen); });
    /* Grafik-Lage (will-change) nur in der Nähe des Fensters, gut eine halbe Fensterhöhe voraus; weit weg gibt das Bild seine Lage frei */
    var wachIO = new IntersectionObserver(function (es) {
      /* an der Zeitachse (za): das Foto hängt nur nahe am Fenster am Scroll (bw-gleit), weit weg ruht es; so entstehen die Bild-Ebenen nach und nach statt alle beim ersten Scrollen */
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].el.classList.toggle(gl[i].za ? 'bw-gleit' : 'wach', e.isIntersecting); });
    }, { rootMargin: '60% 0px 60% 0px' });
    gl.forEach(function (g) { wachIO.observe(g.rahmen); });
  }
  function gleitLies() {
    if (!gl.length) return; var vh = window.innerHeight;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da || g.za) continue;
      var r = g.rahmen.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p)); g.ziel = p * Math.min(58, r.height * 0.07); g.zs = 1.115 + Math.abs(p) * 0.045; }
    if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
  }
  function gleitLauf() {
    var weiter = false, jetzt = performance.now();
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da && g.auf <= 0) continue;
      if (g.za) {   /* an der Zeitachse: nur der Auftritt aus der Vergrösserung, danach steht die Grösse */
        if (g.auf > 0) { var tz = (jetzt - g.auf) / g.ad; if (tz >= 1) { g.auf = -1; g.el.style.transform = ''; } else { weiter = true; tz = Math.max(0, tz); g.el.style.transform = 'scale(' + (1.16 * (1 + g.az * (1 - (1 - Math.pow(2, -10 * tz)) / 0.99902))).toFixed(4) + ')'; } }
        continue; }
      g.ist += (g.ziel - g.ist) * 0.1; g.is += (g.zs - g.is) * 0.1;
      if (Math.abs(g.ziel - g.ist) > 0.12 || Math.abs(g.zs - g.is) > 0.0006) weiter = true;
      var e = 1;
      if (g.auf === 0) e = 1 + g.az;
      else if (g.auf > 0) { var t = (jetzt - g.auf) / g.ad;
        if (t >= 1) g.auf = -1; else { weiter = true; t = Math.max(0, t); e = 1 + g.az * (1 - (1 - Math.pow(2, -10 * t)) / 0.99902); } }
      g.el.style.transform = 'translate3d(0,' + g.ist.toFixed(2) + 'px,0) scale(' + (g.is * e).toFixed(4) + ')'; }
    if (weiter) requestAnimationFrame(gleitLauf); else glLaeuft = false;
  }

  /* ---------- Wandern: Stücke mit data-tempo bewegen sich etwas anders als die Seite (kleines Bild vor grossem, Uhr, Blatt).
     Wert = grösster Weg in Pixeln; gerechnet nur am Rechner und nur, was im Fenster steht. ---------- */
  var wd = [], wdLaeuft = false;
  if (!ruhig && 'IntersectionObserver' in window) {
    $$('[data-tempo]').forEach(function (el) { wd.push({ el: el, bezug: el.closest('.bildpaar,.paar,.nicht,.lage,.zstage') || el.parentNode, tempo: +el.getAttribute('data-tempo'), da: false, ziel: 0, ist: 0 }); });
    var wdIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < wd.length; i++) if (wd[i].bezug === e.target) wd[i].da = e.isIntersecting; });
      wandernLies();
    }, { rootMargin: '10% 0px 10% 0px' });
    wd.forEach(function (w) { wdIO.observe(w.bezug); });
  }
  function wandernLies() {
    if (!wd.length) return;
    if (!breit.matches) { for (var k = 0; k < wd.length; k++) if (wd[k].ist) { wd[k].ist = wd[k].ziel = 0; wd[k].el.style.transform = ''; } return; }
    var vh = window.innerHeight, los = false;
    for (var i = 0; i < wd.length; i++) { var w = wd[i]; if (!w.da) continue;
      var r = w.bezug.getBoundingClientRect(); w.ziel = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * w.tempo; los = true; }
    if (los && !wdLaeuft) { wdLaeuft = true; requestAnimationFrame(wandernLauf); }
  }
  function wandernLauf() {
    var weiter = false;
    for (var i = 0; i < wd.length; i++) { var w = wd[i]; if (!w.da) continue;
      w.ist += (w.ziel - w.ist) * 0.12;
      if (Math.abs(w.ziel - w.ist) > 0.2) weiter = true; else w.ist = w.ziel;
      w.el.style.transform = 'translate3d(0,' + w.ist.toFixed(1) + 'px,0)'; }
    if (weiter) requestAnimationFrame(wandernLauf); else wdLaeuft = false;
  }

  /* ---------- Fenster: das Foto steht fest hinter dem Ausschnitt und wandert beim Scrollen sacht mit, der Satz bleibt stehen
     (eins zu eins wie das Fenster der Ruedihus-Seite: 7 % der Fensterhöhe, weich nachlaufend, nur transform) ---------- */
  var fe = [], feLaeuft = false;
  if (!ruhig) $$('.bruch').forEach(function (b) { var w = $('.bruch__bild', b); if (w) fe.push({ el: w, bezug: b, ziel: 0, ist: 0 }); });
  /* Fenster weit ausserhalb des Bildes (mehr als eine Fensterhöhe) geben ihre festen Lagen frei (CSS .fern), sonst halten alle drei dauerhaft eine Lage in Schirmgrösse */
  if ('IntersectionObserver' in window) {
    var fernIO = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('fern', !e.isIntersecting); }); }, { rootMargin: '120% 0px 120% 0px' });
    $$('.bruch').forEach(function (b) { fernIO.observe(b); });
  }
  function fensterLies() {
    if (!fe.length) return; var vh = window.innerHeight, los = false;
    for (var i = 0; i < fe.length; i++) { var x = fe[i], r = x.bezug.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      x.ziel = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * -vh * 0.07; los = true; }
    if (los && !feLaeuft) { feLaeuft = true; requestAnimationFrame(fensterLauf); }
  }
  function fensterLauf() {
    var weiter = false;
    for (var i = 0; i < fe.length; i++) { var x = fe[i]; x.ist += (x.ziel - x.ist) * 0.12; if (Math.abs(x.ziel - x.ist) > 0.15) weiter = true; else x.ist = x.ziel;
      x.el.style.transform = 'translate3d(0,' + x.ist.toFixed(1) + 'px,0)'; }
    if (weiter) requestAnimationFrame(fensterLauf); else feLaeuft = false;
  }

  /* ---------- Band zum Blättern: Pfeile, Laufbalken, Ziehen mit der Maus (das Blättern selbst bleibt nativ) ---------- */
  function richte(g) {
    var band = $('.band', g), balken = $('.laufbalken', g), pf = $$('.pfeile button', g); if (!band) return;
    var weg = band.scrollWidth - band.clientWidth, teil = band.scrollWidth ? Math.min(1, band.clientWidth / band.scrollWidth) : 1, p = weg > 0 ? band.scrollLeft / weg : 0;
    if (balken) { var strich = $('i', balken); strich.style.width = (teil * 100).toFixed(1) + '%'; balken.style.visibility = weg > 4 ? 'visible' : 'hidden'; strich.style.transform = 'translateX(' + (p * (balken.clientWidth * (1 - teil))).toFixed(1) + 'px)'; }
    if (pf.length) { pf[0].disabled = band.scrollLeft < 4; pf[1].disabled = band.scrollLeft > weg - 4; }
  }
  var blaetter = $$('.blaetter');
  blaetter.forEach(function (g) {
    var band = $('.band', g), frei = true, senkT = 0; if (!band) return;
    band.addEventListener('scroll', function () { if (!frei) return; frei = false; requestAnimationFrame(function () { frei = true; richte(g); }); }, { passive: true });
    $$('.pfeile button', g).forEach(function (b) {
      b.addEventListener('click', function () { var k = band.firstElementChild; if (!k) return; band.scrollBy({ left: (+b.getAttribute('data-richtung')) * (k.offsetWidth + parseFloat(getComputedStyle(band).columnGap || 0)), behavior: ruhig ? 'auto' : 'smooth' }); });
    });
    /* Senkrechtes Scrollen mit kleinem Seitenanteil nimmt das Band nicht mit.
       Seit 09.10.2026 (Robert am Waldhotel: «das nach rechts scrollen hakt»): entschieden wird je Geste aus der Summe der ersten Schritte, nicht je Ereignis;
       sonst sperrt ein kleiner senkrechter Schritt im Anlauf oder Auslauf eines seitlichen Wischs das Band mitten im Blättern.
       art: 0 offen, 1 senkrecht (Band hält still), 2 seitlich (Band wird nie gesperrt). Eine Pause von 160 ms beginnt eine neue Geste. */
    var art = 0, sx = 0, sy = 0, zuletzt = 0, quer = 0, hoch = 0;
    function los() { clearTimeout(senkT); senkT = 0; band.classList.remove('senk'); }
    band.addEventListener('wheel', function (e) {
      var m = e.deltaMode === 1 ? 16 : 1, ax = Math.abs(e.deltaX) * m, ay = Math.abs(e.deltaY) * m; if (!ax && !ay) return;
      if (e.timeStamp - zuletzt > 160) { art = 0; sx = sy = quer = hoch = 0; } zuletzt = e.timeStamp;
      if (!art) { sx += ax; sy += ay; if (sx + sy >= 8) art = sy >= sx * 1.5 ? 1 : 2; }
      else if (art === 1) { quer = ax >= 2 && ax > ay * 2 ? quer + 1 : 0; if (quer > 1) { art = 2; hoch = 0; } }
      else { hoch = ay >= 4 && ay > ax * 2 ? hoch + 1 : 0; if (hoch > 2) { art = 1; quer = 0; } }
      if (art !== 1) { if (senkT) los(); return; }
      if (!senkT) band.classList.add('senk'); clearTimeout(senkT); senkT = setTimeout(los, 160);
    }, { passive: true });
    var unten = false, x0 = 0, s0 = 0, weit = false;
    band.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button) return; unten = true; weit = false; x0 = e.clientX; s0 = band.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!unten) return; var d = e.clientX - x0; if (Math.abs(d) > 4) { weit = true; band.classList.add('zieht'); } if (weit) band.scrollLeft = s0 - d; });
    window.addEventListener('pointerup', function () { if (!unten) return; unten = false; band.classList.remove('zieht'); });
    band.addEventListener('click', function (e) { if (weit) { e.preventDefault(); e.stopPropagation(); weit = false; } }, true);
    richte(g);
  });
  if (blaetter.length) { var ra = function () { blaetter.forEach(richte); }; window.addEventListener('resize', ra, { passive: true }); window.addEventListener('load', ra); }

  /* ---------- Grosse Zahlen zählen hoch, sobald sie im Bild sind ---------- */
  var zaehler = $$('[data-zaehl]');
  if (zaehler.length && !ruhig && 'IntersectionObserver' in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; zio.unobserve(e.target);
        var el = e.target, ziel = +el.textContent, t0 = null, dauer = 1500;
        if (!(ziel > 3)) return;
        function schritt(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(ziel * w); if (p < 1) requestAnimationFrame(schritt); }
        el.textContent = '0'; setTimeout(function () { requestAnimationFrame(schritt); }, 250);
      });
    }, { threshold: 0.3 });
    zaehler.forEach(function (z) { zio.observe(z); });
  }

  /* ---------- Scroll-Takt: ein Lauscher für Leiste, Auftaktbild, Seitenkopf, Gleiten und Wandern ---------- */
  var heroBild = $('.auftakt__haus') || $('.seitenkopf__bild'), hero = $('.auftakt') || $('.seitenkopf'), heroKopf = $('.auftakt__kopf');
  var hZiel = 0, hIst = 0, hLaeuft = false;
  function heroLauf() {
    hIst += (hZiel - hIst) * 0.12;
    if (Math.abs(hZiel - hIst) < 0.2) { hIst = hZiel; hLaeuft = false; }
    heroBild.style.transform = 'translate3d(0,' + hIst.toFixed(1) + 'px,0)';
    if (heroKopf) { heroKopf.style.transform = 'translate3d(0,' + (-hIst * 0.55).toFixed(1) + 'px,0)'; heroKopf.style.opacity = Math.max(0, 1 - hIst / (hero.offsetHeight * 0.085)).toFixed(3); }
    if (hLaeuft) requestAnimationFrame(heroLauf);
  }
  var yAlt = window.scrollY, tAlt = performance.now(), wartet = false;
  /* Leiste und Ecken sind spätestens am Ende des Kopfbilds weg, unabhängig vom Tempo (Robert 18.10.2026): die Fahrt wird so kurz,
     dass sie vor dem Ende des Kopfbilds fertig ist; bleibt dafür keine Zeit, sind sie sofort weg. Zurück beim Hochscrollen wie bisher. */
  function dauer(el, ms) { el.style.transitionDuration = ms === null ? '' : ms + 'ms'; }
  function lies() {
    var y = window.scrollY, t = performance.now();
    if (nav && !doc.classList.contains('offen')) {
      var weg = y > 140 && y > yAlt + 6, da = y < yAlt - 6 || y < 140;
      if (weg && !nav.classList.contains('weg')) {
        var ende = hero ? hero.offsetTop + hero.offsetHeight - 120 : 900, tempo = (y - yAlt) / Math.min(34, Math.max(8, t - tAlt)), ms = Math.min(800, (ende - y) / tempo);
        ms = ms < 120 ? 0 : Math.round(ms); dauer(nav, ms); ecken.forEach(function (k) { dauer(k, ms); });
      } else if (da) { dauer(nav, null); ecken.forEach(function (k) { dauer(k, null); }); }
      if (weg || da) { nav.classList.toggle('weg', weg); ecken.forEach(function (k) { k.classList.toggle('weg', weg); }); }
    }
    yAlt = y; tAlt = t;
    if (heroBild && !ruhig && breit.matches && y < hero.offsetHeight * 1.1) {
      hZiel = Math.min(y, hero.offsetHeight) * 0.16;
      if (!hLaeuft && Math.abs(hZiel - hIst) > 0.2) { hLaeuft = true; requestAnimationFrame(heroLauf); }
    }
    gleitLies(); wandernLies(); fensterLies();
  }
  window.addEventListener('scroll', function () {
    if (wartet) return; wartet = true;
    requestAnimationFrame(function () { wartet = false; lies(); });
  }, { passive: true });
  window.addEventListener('resize', function () { lies(); }, { passive: true });
  lies();
})();
