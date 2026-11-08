/* Berghotel Gasterntal — Fotos sind da, bevor man sie sieht, und zwar in der Reihenfolge, in der man sie sieht (Bauart Carlton-Europe, 09.10.2026).
   Im HTML stehen sie auf "lazy" (ohne Skript lädt die Seite wie gewohnt). Hier wird geordnet:
   1. Zuerst gehört die Leitung dem ersten Bildschirm. Solange der nicht scharf ist, startet nichts, was erst darunter kommt.
   2. Was sich dem Fenster nähert (gut zwei Fensterhöhen voraus), kommt sofort und wird entpackt, an der Schlange vorbei.
   3. Alles Übrige kommt danach der Reihe nach, das Nächstliegende zuerst, nie mehr als drei gleichzeitig.
   Fenster (.bruch): ihr Bild steht fest über dem ganzen Schirm und gilt für den Browser deshalb immer als sichtbar. Es bleibt aus dem Bild
   (CSS: .bruch:not(.nah) img), bis der Abschnitt naht. Vorher luden alle drei Fenster der Startseite (1,7 MB) beim Öffnen mit dem Kopfbild um die Wette,
   und auf einer Leitung mit 400 KB/s waren die ersten Bilder darunter erst nach 15 Sekunden da.
   Kein Eingriff in den Scroll, keine Arbeit im Takt: nur Beobachter und eine Merkzahl. */
(function () {
  'use strict';
  var doc = document, W = window;
  var alle = [].slice.call(doc.querySelectorAll('img[loading="lazy"]'));
  var fenster = [].slice.call(doc.querySelectorAll('.bruch'));
  function da(im) { return im.complete && im.naturalWidth > 0; }
  function hole(im) { if (im.__h) return; im.__h = 1; im.loading = 'eager'; }
  function entpacke(im) {
    if (im.__e || !im.decode) return; im.__e = 1;
    var los = function () { im.decode().catch(function () {}); };
    if (da(im)) los(); else im.addEventListener('load', los, { once: true });
  }
  function bruchVon(im) { return im.closest('.bruch'); }
  if (!('IntersectionObserver' in W) || !alle.length) { fenster.forEach(function (b) { b.classList.add('nah'); }); alle.forEach(hole); return; }
  var netz = navigator.connection || {}, sparsam = !!netz.saveData || /2g/.test(netz.effectiveType || '');

  /* ---------- die Schlange: höchstens GLEICH Fotos unterwegs; Dringendes startet sofort und zählt mit ---------- */
  var GLEICH = 3, laeuft = 0, frei = false, schlange = alle.slice(), neu = true;
  /* Firefox (und teils Safari) zählt jedes Foto, das vor dem load-Ereignis startet, zum Ladevorgang der Seite: die Schlange hielt ihn offen, bis das
     letzte ferne Foto da war (nachgestellt am Grand Beau-Rivage 14.10.2026: Firefox 28 bis 49 s). Fernes startet deshalb erst nach load,
     spätestens 3 s nachdem der erste Bildschirm steht. Nahes kommt wie bisher sofort. */
  var geladen = doc.readyState === 'complete';
  function nachLoad() { if (geladen) return; geladen = true; neu = true; weiter(); }
  if (!geladen) W.addEventListener('load', nachLoad, { once: true });
  function starte(im) {
    if (im.__h || da(im)) { hole(im); return; }
    laeuft++;
    var fertig = function () { if (im.__w) return; im.__w = 1; laeuft--; weiter(); };
    im.addEventListener('load', fertig, { once: true });
    im.addEventListener('error', fertig, { once: true });
    setTimeout(fertig, 8000);
    var b = bruchVon(im); if (b) b.classList.add('nah');
    hole(im);
    if (da(im)) fertig();
  }
  /* wie weit ist ein Foto vom Fenster weg (unten zählt einfach, oben anderthalbfach, seitlich doppelt, Verdecktes zuletzt) */
  function abstand(im) {
    var el = bruchVon(im) || im;
    if (el === im && im.offsetParent === null) return 1e7;
    var r = el.getBoundingClientRect(), h = W.innerHeight, w = W.innerWidth;
    var dy = r.bottom < 0 ? -r.bottom * 1.5 : (r.top > h ? r.top - h : 0);
    var dx = r.left > w ? r.left - w : (r.right < 0 ? -r.right : 0);
    return dy + dx * 2;
  }
  function weiter() {
    if (!frei || !geladen || sparsam) return;
    while (laeuft < GLEICH && schlange.length) {
      if (neu) {
        neu = false;
        schlange = schlange.filter(function (im) { return !im.__h && !da(im); });
        schlange.forEach(function (im) { im.__a = abstand(im); });
        schlange.sort(function (a, b) { return a.__a - b.__a; });
        if (!schlange.length) return;
      }
      var im = schlange.shift();
      if (im.__h || da(im)) continue;
      starte(im);
    }
  }
  /* nach dem Scrollen liegt anderes am nächsten: beim nächsten freien Platz neu ordnen (nur eine Merkzahl, keine Arbeit im Takt) */
  W.addEventListener('scroll', function () { neu = true; }, { passive: true });

  /* ---------- was sich dem Fenster nähert: sofort ---------- */
  /* Beobachtet wird das Foto selbst. Fotos in einem Fenster, einem Band zum Blättern, einem Stapel oder einer Wahl hängen an ihrem Abschnitt. */
  var gruppen = [], ziel = function (im) { return im.closest('.bruch,.band,.polas,.wahl__b,.stufe__b,.pakete__b') || im; };
  function fotos(el) { return el.tagName === 'IMG' ? [el] : [].slice.call(el.querySelectorAll('img[loading]')); }
  var wartet = [];
  function nahe(z) {
    if (z.classList.contains('bruch')) z.classList.add('nah');
    var hinten = [];
    fotos(z).forEach(function (im) {
      /* in einem Band oder Stapel: sofort nur, was man gleich sieht; der Rest rückt in der Schlange nach vorn */
      var sichtbar = z === im || z.classList.contains('bruch') || (im.getBoundingClientRect().left < W.innerWidth * 1.25 && getComputedStyle(im).opacity !== '0');
      if (sichtbar) { starte(im); entpacke(im); } else if (!im.__h && !da(im)) hinten.push(im);
    });
    if (hinten.length) { schlange = hinten.concat(schlange.filter(function (im) { return hinten.indexOf(im) < 0; })); weiter(); }
  }
  function beobachter(rand) {
    return new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var z = e.target; obs.unobserve(z);
        /* solange der erste Bildschirm lädt, wartet, was erst darunter kommt (es ist danach als Erstes dran) */
        if (!frei) { wartet.push(z); return; }   /* Robert 18.10.2026 23:40 («im Hero … laden erst sehr spät»): bis das Kopfbild steht, wartet jedes andere Foto, auch im ersten Bildschirm */
        nahe(z);
      });
    }, { rootMargin: rand });
  }
  /* Fenster tragen die schwersten Bilder (bis 0,8 MB): sie starten drei Fensterhöhen voraus, alles andere zwei */
  var gleich = beobachter('200% 25% 200% 25%'), weit = beobachter('300% 0px 300% 0px');
  alle.forEach(function (im) {
    var z = ziel(im);
    if (z !== im) { if (gruppen.indexOf(z) > -1) return; gruppen.push(z); }
    (z.classList.contains('bruch') ? weit : gleich).observe(z);
  });

  /* ---------- erst der erste Bildschirm, dann der Rest ---------- */
  function los() { if (frei) return; frei = true; neu = true; if (!geladen) setTimeout(nachLoad, 3000); wartet.splice(0).forEach(nahe); weiter(); }
  function erster() {
    var h = W.innerHeight, w = W.innerWidth;
    var vorn = [].slice.call(doc.images).filter(function (im) {
      if (da(im) || im.offsetParent === null || bruchVon(im) || im.getAttribute('loading') === 'lazy') return false;   /* nur die Kopfbilder (nicht lazy) */
      var r = im.getBoundingClientRect();
      return r.width > 40 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
    });
    if (!vorn.length) { los(); return; }
    var offen = vorn.length, eins = function () { if (--offen <= 0) los(); };
    vorn.forEach(function (im) {
      var f = function () { if (im.__v) return; im.__v = 1; eins(); };
      im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true });
      if (da(im)) f();
    });
    setTimeout(los, 2500);
  }
  erster();
})();
