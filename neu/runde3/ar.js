/* Arbeiten als Atelier (Robert 02.11.2026): Auftritte und die Bildschirme mit echter Website.
   «bau die richtigen Websites da ein und dann kann man mit Klick auf den Bildschirm scrollen innerhalb des Bildschirmes».
   Jeder Bildschirm zeigt zuerst die Aufnahme. Die echte Seite lädt beim Darüberfahren (am Handy beim Antippen) und legt sich darüber;
   ein Klick gibt das Scrollen darin frei, beim Verlassen ruht sie wieder und die Seite scrollt normal weiter.
   Immer nur eine Seite ist geladen; was weit weg ist, wird entladen. Nativer Scroll, bewegt wird nur transform und opacity. */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hatIO = 'IntersectionObserver' in window;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }

  /* ---------- Auftritt einmal, sobald gut ein Drittel im Bild ist */
  var raeume = alle('[data-ar],.ar-fin [data-w="fin"]');
  function an(el) { el.classList.add(el.matches('[data-w="fin"]') ? 'los' : 'an'); }
  if (!hatIO || ruhig) raeume.forEach(an);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { an(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    raeume.forEach(function (el) { io.observe(el); });
  }

  /* Auftakt: die Wand ruht, wenn sie nicht im Bild ist */
  var auf = document.querySelector('.ar-auf');
  if (auf && hatIO) new IntersectionObserver(function (es) { auf.classList.toggle('ruht', !es[0].isIntersecting); }).observe(auf);

  /* ---------- Bildschirme mit echter Website */
  var lokal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var geladen = [];   // Reihenfolge des Ladens, die älteste fliegt zuerst
  var MAX = 3;   // höchstens zwei Websites geladen (die im Bild), damit nichts die Leitung verstopft

  function skaliere(l) {
    var f = l.querySelector('.live-f'); if (!f) return;
    f.style.transform = 'scale(' + (l.clientWidth / +l.dataset.vw) + ')';
  }
  function entlade(l) {
    var f = l.querySelector('.live-f'); if (f) f.remove();
    l.classList.remove('bereit', 'aktiv');
    var i = geladen.indexOf(l); if (i >= 0) geladen.splice(i, 1);
  }
  function lade(l) {
    if (l.querySelector('.live-f') || !l._url) return;
    // den Bildschirm, in dem gerade gescrollt wird, nie entladen
    while (geladen.length >= MAX) { var alt = geladen.filter(function (x) { return !x.classList.contains('aktiv') && x !== l; })[0]; if (!alt) break; entlade(alt); }
    var f = document.createElement('iframe');
    f.className = 'live-f'; f.src = l._url; f.title = l.dataset.titel || '';
    f.width = l.dataset.vw; f.height = l.dataset.vh; f.setAttribute('loading', 'eager');
    f.style.width = l.dataset.vw + 'px'; f.style.height = l.dataset.vh + 'px';
    f.addEventListener('load', function () { l.classList.add('bereit'); }, { once: true });   // sofort bereit, ohne Wartezeit (Robert 04.11.2026)
    l.appendChild(f); skaliere(l); geladen.push(l);
  }
  function aktiviere(l) {
    alle('.live.aktiv').forEach(function (x) { if (x !== l) x.classList.remove('aktiv'); });
    lade(l); l.classList.add('aktiv');
  }

  function drauf(l, ev) { var r = l.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }
  // Erst wenn die Maus ausserhalb des Bildschirms über die Seite fährt, ruht er wieder
  document.addEventListener('pointermove', function (ev) { if (ev.pointerType !== 'mouse') return; alle('.live.aktiv').forEach(function (x) { if (!drauf(x, ev)) x.classList.remove('aktiv'); }); }, { passive: true });
  var lives = alle('.live'), zuletzt = 0;
  addEventListener('scroll', function () { zuletzt = Date.now(); lives.forEach(function (l) { clearTimeout(l._t); l._t = 0; }); }, { passive: true });
  var weg = hatIO ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting) entlade(e.target); });
  }, { rootMargin: '150% 0px' }) : null;
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { skaliere(e.target); }); }) : null;

  lives.forEach(function (l) {
    l._url = lokal ? (l.dataset.lokal || l.dataset.online) : l.dataset.online;
    if (!l._url) { l.classList.add('still'); return; }
    l.setAttribute('role', 'button'); l.tabIndex = 0;
    l.setAttribute('aria-label', (l.dataset.titel || 'Website') + ': klicken und darin scrollen');
    // vorladen erst, wenn die Maus kurz ruhig auf dem Bildschirm liegt; beim Scrollen gleitet sie nur darüber und lädt nichts
    l.addEventListener('pointerenter', function (ev) { if (ev.pointerType !== 'mouse') return; clearTimeout(l._t); l._t = setTimeout(function () { if (Date.now() - zuletzt > 350) lade(l); }, 450); });
    l.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse' && !l._t && !l.querySelector('.live-f')) l._t = setTimeout(function () { l._t = 0; if (Date.now() - zuletzt > 350) lade(l); }, 450); });
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
  // Antippen ausserhalb gibt am Handy den Bildschirm wieder frei
  document.addEventListener('pointerdown', function (ev) {
    if (ev.target.closest && ev.target.closest('.live')) return;
    alle('.live.aktiv').forEach(function (x) { x.classList.remove('aktiv'); });
  }, { passive: true });

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
        var mitte = innerHeight / 2, offen = sicht.filter(function (l) { return l._url && !l.querySelector('.live-f'); });
        offen.sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return Math.abs(ra.top + ra.height / 2 - mitte) - Math.abs(rb.top + rb.height / 2 - mitte); });
        // höchstens drei im Bild geladen, sonst würde der älteste entladen und gleich wieder geladen
        if (offen[0] && sicht.length - offen.length < 3) { lade(offen[0], true); plane(); }
      }, 280);
    };
    var vor = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var i = sicht.indexOf(e.target); if (e.isIntersecting) { if (i < 0) sicht.push(e.target); } else if (i >= 0) sicht.splice(i, 1); });
      plane();
    }, { rootMargin: '10% 0px', threshold: 0 });
    lives.forEach(function (l) { if (l._url) vor.observe(l); });
    addEventListener('scroll', plane, { passive: true });
  }
  if (!ro) addEventListener('resize', function () { lives.forEach(skaliere); });
})();
