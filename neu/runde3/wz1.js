/* Werkzeuge-Seite, Fassung 01 (Robert 03.11.2026): Auftritte und Vorführung im Fenster. Aufbau wz1.py, Stil wz1.css. */
(function () {
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Auftritte: deckend von unten, sobald das Stück am unteren Rand auftaucht */
  var vs = $$('[data-v]');
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches || !('IntersectionObserver' in window)) vs.forEach(function (el) { el.classList.add('da'); });
  else {
    var io = new IntersectionObserver(function (ein) {
      ein.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('da'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px 8% 0px' });
    vs.forEach(function (el) { io.observe(el); });
  }

  /* Vorführung des Werkzeugs (werkzeuge/<schlüssel>/index.html) im Fenster */
  var fenster = document.createElement('div');
  fenster.className = 'wv-fenster'; fenster.hidden = true; fenster.setAttribute('role', 'dialog'); fenster.setAttribute('aria-modal', 'true'); fenster.setAttribute('aria-label', 'Vorführung');
  fenster.innerHTML = '<div class="wv-fenster__kopf"><b></b><span class="r-mono">Vorführung</span><button type="button" class="wv-zu" aria-label="Schliessen">'
    + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><iframe title="Vorführung des Werkzeugs"></iframe>';
  document.body.appendChild(fenster);
  var fr = fenster.querySelector('iframe'), titel = fenster.querySelector('b'), zuletzt, eintrag = false;
  /* «Zurück» im Browser schliesst nur das Werkzeug, man bleibt an derselben Stelle der Seite (Robert 04.11.2026: «… aus dem Werkzeug
     rausgehen und genau da landen, wo ich reingegangen bin»). Das offene Fenster bekommt einen eigenen Verlaufseintrag; was im Werkzeug
     geklickt wird, ersetzt die Ansicht, statt neue Einträge anzulegen, sonst bräuchte es mehrere «Zurück», bis man draussen ist. */
  fr.addEventListener('load', function () {
    try {
      var w = fr.contentWindow, h = w.history;
      h.pushState = function (s, t, u) { return w.History.prototype.replaceState.call(h, s, t, u); };
      w.document.addEventListener('click', function (ev) {
        var a = ev.target.closest && ev.target.closest('a[href]');
        if (!a || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        if ((a.target && a.target !== '_self') || a.hasAttribute('download') || /^(mailto|tel|javascript):/i.test(a.getAttribute('href'))) return;
        ev.preventDefault(); w.location.replace(a.href);
      });
    } catch (e) {}
  });
  function lade(u) { try { fr.contentWindow.location.replace(new URL(u, location.href).href); } catch (x) { fr.src = u; } }
  function oeffne(k, name) {
    zuletzt = document.activeElement;
    titel.textContent = name;
    lade((k.indexOf('/') >= 0 ? '' : 'werkzeuge/') + k + '/index.html');   /* mit Ordner (z. B. werkzeuge-mj/kontor): Vorführungen eines anderen Beispiels */
    fenster.hidden = false;
    document.documentElement.classList.add('wv-offen');
    requestAnimationFrame(function () { fenster.classList.add('da'); });
    fenster.querySelector('.wv-zu').focus();
    if (!eintrag) { history.pushState({ wv: k }, ''); eintrag = true; }
  }
  function zu() {
    fenster.classList.remove('da');
    document.documentElement.classList.remove('wv-offen');
    setTimeout(function () { fenster.hidden = true; lade('about:blank'); }, 350);
    if (zuletzt) zuletzt.focus({ preventScroll: true });
  }
  function schliesse() { if (eintrag) history.back(); else zu(); }
  addEventListener('popstate', function () { if (eintrag) { eintrag = false; zu(); } });
  $$('[data-oeffne]').forEach(function (b) {
    b.addEventListener('click', function () { var h = b.closest('article').querySelector('.wv-name'); oeffne(b.dataset.oeffne, h ? h.textContent : ''); });
  });
  fenster.querySelector('.wv-zu').addEventListener('click', schliesse);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !fenster.hidden) schliesse(); });
})();

/* Bildschirme mit dem echten Werkzeug (Robert 04.11.2026: «… in die Bildschirme klicken … durch die Tools scrollen, wie ich das auch bei der
   Website tun kann. Im Atelier zum Beispiel»). Aufbau wie ar.js: Aufnahme zuerst, Werkzeug lädt beim Darüberfahren, Klick gibt es frei.
   Erst wenn der Auftritt des Kapitels fertig ist (Klasse «frei»). Immer nur ein Werkzeug geladen; was weit weg ist, wird entladen. */
(function () {
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  var hatIO = 'IntersectionObserver' in window, geladen = [], zuletzt = 0;
  function skaliere(l) { var f = l.querySelector('.live-f'); if (f) f.style.transform = 'scale(' + (l.clientWidth / +l.dataset.vw) + ')'; }
  function entlade(l) { var f = l.querySelector('.live-f'); if (f) f.remove(); l.classList.remove('bereit', 'aktiv'); var i = geladen.indexOf(l); if (i >= 0) geladen.splice(i, 1); }
  function frei(l) { var r = l.closest('.v1-r'); return !r || r.classList.contains('frei'); }
  function lade(l, vorab) {
    if ((!vorab && !frei(l)) || l.querySelector('.live-f')) return;
    // den Bildschirm, in dem gerade gescrollt wird, nie entladen
    while (geladen.length >= 3) { var alt = geladen.filter(function (x) { return !x.classList.contains('aktiv') && x !== l; })[0]; if (!alt) break; entlade(alt); }
    var f = document.createElement('iframe');
    f.className = 'live-f'; f.src = l.dataset.lokal; f.title = l.dataset.titel || '';
    f.style.width = l.dataset.vw + 'px'; f.style.height = l.dataset.vh + 'px';
    f.addEventListener('load', function () { l.classList.add('bereit'); }, { once: true });   // sofort bereit, ohne Wartezeit (Robert 04.11.2026)
    l.appendChild(f); skaliere(l); geladen.push(l);
  }
  // Ein Klick gilt sofort, auch wenn das Kapitel noch auftaucht (Robert 04.11.2026: «dann reagiert es nicht»)
  function aktiviere(l) { var r = l.closest('.v1-r'); if (r) r.classList.add('frei'); alle('.live.aktiv').forEach(function (x) { if (x !== l) x.classList.remove('aktiv'); }); lade(l); l.classList.add('aktiv'); }

  // «frei», sobald das Kapitel aufgetaucht ist und sein Auftritt (1,5 s Hochschweben, 2,4 s Zoom) vorbei ist
  alle('.v1-r').forEach(function (r) {
    if (!hatIO) { r.classList.add('frei'); return; }
    var o = new MutationObserver(function () { if (r.classList.contains('da')) { o.disconnect(); setTimeout(function () { r.classList.add('frei'); }, 2400); } });
    o.observe(r, { attributes: true, attributeFilter: ['class'] });
    if (r.classList.contains('da')) setTimeout(function () { r.classList.add('frei'); }, 2400);
  });

  function drauf(l, ev) { var r = l.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }
  // Erst wenn die Maus ausserhalb des Bildschirms über die Seite fährt, ruht er wieder
  document.addEventListener('pointermove', function (ev) { if (ev.pointerType !== 'mouse') return; alle('.live.aktiv').forEach(function (x) { if (!drauf(x, ev)) x.classList.remove('aktiv'); }); }, { passive: true });
  var lives = alle('.wv .live');
  addEventListener('scroll', function () { zuletzt = Date.now(); lives.forEach(function (l) { clearTimeout(l._t); l._t = 0; }); }, { passive: true });
  var weg = hatIO ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) entlade(e.target); }); }, { rootMargin: '150% 0px' }) : null;
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { skaliere(e.target); }); }) : null;
  lives.forEach(function (l) {
    l.setAttribute('role', 'button'); l.tabIndex = 0;
    l.setAttribute('aria-label', (l.dataset.titel || 'Werkzeug') + ': klicken und darin ausprobieren');
    l.addEventListener('pointerenter', function (ev) { if (ev.pointerType !== 'mouse') return; clearTimeout(l._t); l._t = setTimeout(function () { if (Date.now() - zuletzt > 350) lade(l); }, 450); });
    // Nach dem Klick den Fokus wieder abgeben: solange der Bildschirm ihn hält, scrollt das Mausrad bei Seiten von fremden Adressen die Hauptseite
    l.addEventListener('click', function () { if (!l.classList.contains('aktiv')) aktiviere(l); l.blur(); });
    l.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); aktiviere(l); } });
    // Wandert die Maus in die geladene Seite, meldet der Browser ein «Verlassen», obwohl sie noch auf dem Bildschirm ist.
    // Dann bleibt der Bildschirm frei, sonst sperrt er das Scrollen sofort wieder (Robert 04.11.2026: «dann reagiert es nicht»).
    // Geht die Maus in die eingebettete Seite, ist relatedTarget leer oder der Rahmen: dann bleibt er frei. Nur echtes Verlassen auf die Seite gibt ihn zurück
    // (04.11.2026: lief der Auftritt noch, lag der Mauspunkt kurz ausserhalb und der gerade angeklickte Bildschirm sperrte wieder).
    l.addEventListener('pointerleave', function (ev) { clearTimeout(l._t); l._t = 0; var z = ev.relatedTarget; if (ev.pointerType === 'mouse' && z && !l.contains(z) && !drauf(l, ev)) l.classList.remove('aktiv'); });
    if (weg) weg.observe(l);
    if (ro) ro.observe(l);
  });
  document.addEventListener('pointerdown', function (ev) { if (ev.target.closest && ev.target.closest('.live')) return; alle('.live.aktiv').forEach(function (x) { x.classList.remove('aktiv'); }); }, { passive: true });
  // Robert 04.11.2026: «Ich klicke drauf, da muss ich 3 Sekunden warten». Am Computer lädt jeder Bildschirm, sobald er im Bild ist,
  // damit der Klick sofort ins Scrollen führt. Höchstens zwei geladen, am Handy weiter erst beim Antippen (Leitung).
  if (hatIO && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    // Geladen wird nur, wenn das Scrollen ruht: eine Website laden heisst Arbeit für den Rechner, und die darf nie in eine Scrollbewegung fallen
    // (04.11.2026, gemessen: Vorladen beim Hineinscrollen gab bis 280 ms lange Bilder). Immer der Bildschirm nahe der Mitte zuerst, einer nach dem anderen.
    var sicht = [], pt = 0;
    var plane = function () {
      clearTimeout(pt);
      pt = setTimeout(function () {
        if (Date.now() - zuletzt < 240) return plane();
        var mitte = innerHeight / 2, offen = sicht.filter(function (l) { return !l.querySelector('.live-f'); });
        offen.sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return Math.abs(ra.top + ra.height / 2 - mitte) - Math.abs(rb.top + rb.height / 2 - mitte); });
        // höchstens drei im Bild geladen, sonst würde der älteste entladen und gleich wieder geladen
        if (offen[0] && sicht.length - offen.length < 3) { lade(offen[0], true); plane(); }
      }, 280);
    };
    var vor = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var i = sicht.indexOf(e.target); if (e.isIntersecting) { if (i < 0) sicht.push(e.target); } else if (i >= 0) sicht.splice(i, 1); });
      plane();
    }, { rootMargin: '10% 0px', threshold: 0 });
    lives.forEach(function (l) { vor.observe(l); });
    addEventListener('scroll', plane, { passive: true });
  }
})();

/* Schluss: «Ein erstes Gespräch» fährt auf wie auf der Teamseite (tm.js), sobald er zu zwei Dritteln im Bild ist */
(function () {
  var fin = document.querySelector('.s-fin [data-w="fin"]'); if (!fin) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { fin.classList.add('los'); return; }
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { fin.classList.add('los'); io.disconnect(); } }, { rootMargin: '0px 0px -28% 0px' });
  io.observe(fin);
})();

/* Beigaben als Register mit Vorschau (Robert 04.11.2026, Fassung 01 aus paket-20): Überfahren wählt Bild und Satz, Klick öffnet die Seite der Beigabe */
(function () {
  var w = document.querySelector('[data-bz-wahl]'); if (!w) return;
  var maus = matchMedia('(hover:hover)').matches;
  function setze(i) {
    Array.prototype.forEach.call(w.querySelectorAll('[data-bz]'), function (el) {
      var an = +el.dataset.bz === i; el.classList.toggle('an', an);
          });
  }
  Array.prototype.forEach.call(w.querySelectorAll('.bz-w[data-bz]'), function (b) {
    var i = +b.dataset.bz;
    if (maus) b.addEventListener('mouseenter', function () { setze(i); });
    b.addEventListener('focus', function () { setze(i); });
  });
})();
