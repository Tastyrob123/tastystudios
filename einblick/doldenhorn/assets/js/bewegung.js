/* Waldhotel Doldenhorn — Bewegung beim Scrollen (13.10.2026). Gestalt und Werte: assets/css/bewegung.css, dort steht auch das Rezept.
   Dieses Skript rechnet nichts im Takt. Es verteilt einmal Klassen und überlässt die Bewegung dem Browser:
   - dh-za        der Browser kann die Scroll-Zeitachse (dann gleiten die Fotos über sie, main.js lässt sein eigenes Gleiten ruhen)
   - dh-gr        eine Gruppe aus Fotos oder Karten, die als Ganzes kommt; dh-da, sobald sie unten ins Fenster rückt (Vorlauf 6 %)
   - dh-puls      nur pulsieren, kein Weg (Foto-Gruppen mit Drift, Karten, die auf einem Foto liegen)
   - dh-oben      steht beim Laden schon im Bild: kein Weg, nur pulsieren
   - dh-hoch      sehr hohes Blatt: steigt nur kurz, wird nicht kleiner
   - --dh-bis     nahe am Seitenende endet der Weg früher, damit nichts versetzt stehen bleibt
   - dh-fertig    das Pulsieren ist vorbei (ein Stück pulsiert genau einmal)
   - dh-bild, dh-gleit, dh-quelle, --dh-glw   Foto im Rahmen: Auftritt aus der Vergrösserung und Gleiten an der Zeitachse des Rahmens
   - dh-roll      Überschrift, deren Zeilen nach dem echten Umbruch in Schlitze (.z) gelegt sind; dh-rollt, sobald sie im Fenster steht: dann rollen die Zeilen hoch
   Läuft vor main.js (beide «defer»), damit main.js weiss, ob es selbst gleiten soll. */
(function () {
  'use strict';
  var doc = document.documentElement, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = false; try { ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search); } catch (e) {}
  /* ?ohneza: Prüfschalter, stellt den Weg ohne Scroll-Zeitachse nach (ältere Browser): Weg und Pulsieren nach der Uhr, Gleiten rechnet main.js */
  var za = !ruhig && !/[?&]ohneza/.test(location.search) && !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()') && CSS.supports('overflow: clip') && CSS.supports('translate: 0 1px'));
  window.__bewegung = { za: za, ruhig: ruhig };
  if (ruhig) { doc.classList.add('dh-ruhig'); return; }
  if (za) doc.classList.add('dh-za');
  /* Jede Seite öffnet oben (Oberchef 18.10.2026): der Browser stellt beim Neuladen keine alte Lage wieder her; mit Anker bleibt der Anker */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  if (!location.hash) { window.scrollTo(0, 0); window.addEventListener('load', function () { if (!location.hash && window.scrollY < 4) window.scrollTo(0, 0); }); }
  doc.classList.add('dh-mitte');   /* Abschnitt 9 in bewegung.css: los bei einem Fünftel, 0,85 s, 40 px, 1,04 → 1 (Robert 18.10.2026, 18:17) */
  var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= window.innerHeight * 0.2); }, FUENFTEL = { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] };

  var K = '[data-r="bild"],[data-r="schweb"],.blatt[data-r],.dn-karte-dunkel[data-r],.dn-rechner[data-r],.dn-summe[data-r],.dn-gs-form[data-r]';
  var NICHT = '.auftakt,.seitenkopf,.wahl,dialog';
  var einzeln = $$(K).filter(function (el) { return !el.closest(NICHT) && !el.closest('[data-gruppe]') && !el.classList.contains('stapel') && !el.classList.contains('freude__bild'); });
  /* Gruppen: jede [data-gruppe], in der Fotos oder Karten stehen, dazu die vier Häuser im Fuss */
  var gruppen = $$('[data-gruppe]').filter(function (g) { return !g.closest(NICHT) && g.querySelector(K); }).concat($$('.fuss__haeuser'));
  gruppen.forEach(function (g) { g.classList.add('dh-gr'); if (g.matches('.trio,[data-drift],.termine--kante') || g.closest('[data-drift]')) g.classList.add('dh-puls'); });
  einzeln.forEach(function (el) { if (el.matches('.tafelkarte,.kkasten') || el.closest('.weit__unten,[data-drift]')) el.classList.add('dh-puls'); });

  /* Lage: schon im Bild, sehr hoch, nahe am Seitenende */
  function lage() {
    var vh = window.innerHeight, hoehe = Math.max(doc.scrollHeight, document.body ? document.body.scrollHeight : 0), y = window.scrollY;
    einzeln.concat(gruppen).forEach(function (el) {
      var r = el.getBoundingClientRect(); if (!r.width && !r.height) return;
      if (!el._dhLage) { el._dhLage = 1; if (r.top < vh) el.classList.add('dh-oben'); }
      if (!el.classList.contains('dh-gr')) el.classList.toggle('dh-hoch', r.height > vh * 1.15 && !el.classList.contains('da'));
      var rest = hoehe - (r.top + y);   /* so weit kann die Oberkante höchstens über den unteren Fensterrand steigen */
      if (rest < vh * 0.62) el.style.setProperty('--dh-bis', Math.max(40, Math.round(rest * 0.7)) + 'px'); else el.style.removeProperty('--dh-bis');
    });
  }
  lage();
  var ruhe = 0; window.addEventListener('resize', function () { clearTimeout(ruhe); ruhe = setTimeout(function () { lage(); wege(); }, 160); }, { passive: true });
  window.addEventListener('load', function () { lage(); wege(); });

  /* Gruppen kommen als Ganzes: Auslöser kurz vor dem unteren Rand */
  if ('IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (fuenftel(e)) { gio.unobserve(e.target); e.target.classList.add('dh-da'); } }); }, FUENFTEL);
    gruppen.forEach(function (g) { gio.observe(g); });
  } else gruppen.forEach(function (g) { g.classList.add('dh-da'); });

  /* ein Stück pulsiert genau einmal */
  document.addEventListener('animationend', function (e) {
    if ((e.animationName === 'dh-puls' || e.animationName === 'dh-feder') && e.target && e.target.classList) e.target.classList.add('dh-fertig');
  }, true);

  /* Foto im Rahmen: Auftritt aus der Vergrösserung, Gleiten an der Zeitachse (dieselben Fotos, die main.js sonst selbst bewegt) */
  var fotos = [];
  var frei = function (o) { return o === 'visible' || o === 'clip'; };
  var wurzelFrei = function (el) { for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) { var s = getComputedStyle(a); if (!frei(s.overflowX) || !frei(s.overflowY)) return false; } return true; };
  function quelle(rahmen) {   /* wessen Lage im Fenster zählt: der Rahmen selbst; in einem Band zum Blättern das Band (alle Fotos einer Reihe stehen gleich hoch) */
    for (var a = rahmen.parentElement; a && a !== document.body; a = a.parentElement) {
      var s = getComputedStyle(a); if (frei(s.overflowX) && frei(s.overflowY)) continue;
      if (/auto|scroll/.test(s.overflowX)) return wurzelFrei(a) ? a : null;
      return null;
    }
    return rahmen;
  }
  function wege() { fotos.forEach(function (f) { if (f.gleit) f.el.style.setProperty('--dh-glw', Math.min(58, f.rahmen.offsetHeight * 0.07).toFixed(1) + 'px'); }); }
  if (za) {
    $$('[data-r="bild"] .rahmen__k img, [data-r="schweb"] .rahmen__k img, [data-r="schweb"] .frei__b img, [data-r="schweb"] .bk__b img, [data-r="schweb"] .dk__b img, [data-r="schweb"].trio__b img, [data-r] .lk__b img').forEach(function (im) {
      if (im.closest(NICHT) || im.closest('.stapel,.freude__bild') || im.parentNode.querySelectorAll('img').length > 1) return;
      var f = { el: im, rahmen: im.parentNode, gleit: false }; im.classList.add('dh-bild');
      var q = quelle(f.rahmen); if (q) { f.gleit = true; q.classList.add('dh-quelle'); im.classList.add('dh-gleit'); }
      fotos.push(f);
    });
    wege();
  }
  /* ---------- Überschriften rollen Zeile für Zeile aus dem Schlitz (Robert 13.10.2026: «die Schriften in den Fenstern und die Überschriften sollen schon
     hochrollen, nicht so wie jetzt erscheinen»). Baustein «Zeilen-Maske» des Hauses (.z > span). Hier bekommt ihn jede Überschrift in der Titelschrift,
     die ihn noch nicht hat, und jede Zeile folgt dem echten Umbruch: Wörter messen, je Bildschirmzeile ein Schlitz. Nach Drehen oder Breitenwechsel neu.
     Ausgenommen: Auftakt und Seitenkopf (bleiben, wie sie sind), Fenster zum Buchen, die Vorschau des Studios (dort sind die Texte gekennzeichnet). ---------- */
  var ROLL = 'main h1, main h2, main h3, main .ende__satz, main .gross, main .zahlensatz, main .gruss__gross, footer h3, footer .fuss__satz';
  var INLINE = { SPAN: 1, B: 1, EM: 1, I: 1, STRONG: 1, SMALL: 1, BR: 1, WBR: 1, A: 1 };
  var rollen = [];
  function taugt(el) {
    if (el.closest(NICHT) || !(el.hasAttribute('data-r') || el.closest('[data-r]')) || el.closest('[data-e],[data-lauf]') || el.querySelector('[data-e],[data-lauf]')) return false;
    var alle = el.querySelectorAll('*'); for (var i = 0; i < alle.length; i++) if (!INLINE[alle[i].tagName]) return false;
    return !!el.textContent.trim();
  }
  function woerter(c) {   /* jedes Wort in eine Spanne, damit seine Zeile messbar ist; Auszeichnungen (z. B. Gold) bleiben um das Wort */
    var tw = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, null), n, texte = [];
    while ((n = tw.nextNode())) texte.push(n);
    texte.forEach(function (t) {
      var teile = t.nodeValue.split(/(\s+)/), f = document.createDocumentFragment();
      teile.forEach(function (x) { if (!x) return; if (/^\s+$/.test(x)) f.appendChild(document.createTextNode(' ')); else { var w = document.createElement('span'); w.className = 'dh-w'; w.textContent = x; f.appendChild(w); } });
      t.parentNode.replaceChild(f, t);
    });
    return [].slice.call(c.querySelectorAll('.dh-w'));
  }
  function huelle(w, c) {   /* das Wort samt seinen Auszeichnungen bis zum Abschnitt c, als HTML */
    var h = w.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    for (var a = w.parentNode; a && a !== c; a = a.parentNode) { var k = a.cloneNode(false); k.removeAttribute('style'); var o = k.outerHTML, i = o.lastIndexOf('</'); h = o.slice(0, i) + h + o.slice(i); }
    return h;
  }
  function teile(el) {
    if (el._dhRoh == null) el._dhRoh = el.innerHTML; else el.innerHTML = el._dhRoh;
    var abschnitte = [].slice.call(el.children).filter(function (k) { return k.classList.contains('z'); }).map(function (z) { return z.firstElementChild || z; });
    if (!abschnitte.length) abschnitte = [el];
    var zeilen = [];
    abschnitte.forEach(function (c) {
      var ws = woerter(c), oben = null, lauf = null;
      ws.forEach(function (w) { var t = w.offsetTop; if (oben === null || Math.abs(t - oben) > 3) { lauf = []; zeilen.push(lauf); oben = t; } lauf.push(huelle(w, c)); });
    });
    if (!zeilen.length) { el.innerHTML = el._dhRoh; return; }
    el.innerHTML = zeilen.map(function (z, i) { return '<span class="z" style="--i:' + i + '"><span>' + z.join(' ') + '</span></span>'; }).join('');
    el.classList.add('dh-roll');
  }
  /* Das Rollen startet, wenn die Überschrift wirklich im Fenster steht (8 % über dem unteren Rand), nicht schon davor: sonst ist der schnelle Anfang
     der Bewegung vorbei, bevor man sie sieht. Sätze in den Fenstern (.bruch) starten wie bisher, sobald das Fenster sie freigibt (main.js). Am Seitenende rollt, was noch aussteht. */
  var rio = null;
  function lausche(el) {
    if (el._dhLauscht || el.closest('.bruch')) return; el._dhLauscht = 1;
    if (!('IntersectionObserver' in window)) { el.classList.add('dh-rollt'); return; }
    if (!rio) {
      rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (fuenftel(e)) { rio.unobserve(e.target); e.target.classList.add('dh-rollt'); } }); }, FUENFTEL);
      var ende = document.querySelector('.fuss__unten') || document.querySelector('footer');
      if (ende) new IntersectionObserver(function (es) { if (es[0].isIntersecting) rollen.forEach(function (x) { if (x.getBoundingClientRect().top < window.innerHeight) x.classList.add('dh-rollt'); }); }, { threshold: 0 }).observe(ende);
    }
    rio.observe(el);
  }
  var rollBreite = 0;
  function rolle(zwang) {
    var b = doc.clientWidth; if (!zwang && b === rollBreite) return; rollBreite = b;
    if (!rollen.length) rollen = $$(ROLL).filter(taugt);
    rollen.forEach(function (el) { try { teile(el); lausche(el); } catch (e) { if (el._dhRoh != null) el.innerHTML = el._dhRoh; el.classList.add('dh-rollt'); } });
  }
  rolle(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { rolle(true); });
  window.addEventListener('load', function () { rolle(true); lage(); });
  var rollRuhe = 0; window.addEventListener('resize', function () { clearTimeout(rollRuhe); rollRuhe = setTimeout(function () { rolle(false); }, 180); }, { passive: true });

  /* Schein über den Karten «Demnächst im Haus»: einmal, sobald eine Karte gut im Bild steht (auch beim Blättern im Band) */
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dh-schein'); sio.unobserve(e.target); } }); }, { threshold: .6 });
    $$('.lk').forEach(function (k) { sio.observe(k); });
  }

  window.__bewegung.stand = function () { return { einzeln: einzeln.length, gruppen: gruppen.length, rollen: rollen.length, fotos: fotos.length, gleiten: fotos.filter(function (f) { return f.gleit; }).length }; };
})();
