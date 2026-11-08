/* Carlton-Europe — Fotos sind da, bevor man sie sieht, und zwar in der Reihenfolge, in der man sie sieht.
   Im HTML stehen sie auf "lazy" (ohne Skript lädt die Seite wie gewohnt). Hier wird geordnet:
   1. Zuerst gehört die Leitung dem ersten Bildschirm (Kopfbild und was daneben steht). Solange der nicht scharf ist, startet nichts anderes.
   2. Was sich dem Fenster nähert (gut eine Fensterhöhe voraus), kommt sofort und wird entpackt, an der Schlange vorbei.
   3. Alles Übrige der Seite kommt danach der Reihe nach, das Nächstliegende zuerst, nie mehr als drei gleichzeitig.
      So hält ein schweres Bild weiter unten nie das Bild auf, das gerade im Blick ist (vorher starteten bis zu zwanzig auf einmal).
   Fenster (.bruch): ihr Bild steht fest über dem ganzen Schirm und gilt für den Browser deshalb immer als sichtbar. Es bleibt aus dem Bild
   (CSS: .bruch:not(.nah)>img), bis der Abschnitt naht, sonst lädt es beim Öffnen jeder Seite mit dem Kopfbild um die Wette.
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
  if (!('IntersectionObserver' in W)) { fenster.forEach(function (b) { b.classList.add('nah'); }); alle.forEach(hole); return; }
  if (!alle.length) { fenster.forEach(function (b) { b.classList.add('nah'); }); return; }
  var netz = navigator.connection || {}, sparsam = !!netz.saveData || /2g/.test(netz.effectiveType || '');

  /* ---------- die Schlange: höchstens GLEICH Fotos unterwegs, Dringendes zählt mit und geht vor ---------- */
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
    hole(im);
    if (da(im)) fertig();
  }
  /* wie weit ist ein Foto vom Fenster weg (unten zählt einfach, oben anderthalbfach, seitlich doppelt, Verdecktes zuletzt) */
  function abstand(im) {
    var el = im.parentNode && im.parentNode.classList.contains('bruch') ? im.parentNode : im;
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
  /* Wer wird beobachtet: das Foto selbst. Fotos in einem stehenden Fenster, einem Band zum Blättern oder einem Stapel hängen an ihrem Abschnitt. */
  /* Robert 17.10.2026 («dass die alle schneller laden»): Wechselbilder, die versteckt im Stapel liegen (Lieferanten, Zimmer-Galerien, Auswahl-Felder),
     hängen an ihrem sichtbaren Stapel: sie kommen mit, sobald der Stapel naht, statt erst nach allem anderen oder beim Klick */
  function stapel(im) {
    if (im.offsetParent !== null) return im;
    for (var e = im.parentElement, n = 0; e && n < 4; e = e.parentElement, n++) {
      if (/^(BODY|MAIN|SECTION|DIALOG|HEADER|FOOTER|NAV)$/.test(e.tagName) || e.closest('dialog,nav,header,footer')) return im;
      if (e.offsetParent !== null) return e;
    }
    return im;
  }
  var gruppen = [], ziel = function (im) { return im.closest('.bruch,.band,.polas,.wahl__b,.stufe__b,.pakete__b,.lv-b') || stapel(im); };
  function fotos(el) { return el.tagName === 'IMG' ? [el] : [].slice.call(el.querySelectorAll('img[loading]')); }
  var wartet = [];
  function nahe(z) {
    if (z.classList.contains('bruch')) z.classList.add('nah');
    var hinten = [];
    fotos(z).forEach(function (im) {
      /* in einem Band oder Stapel: sofort nur, was man gleich sieht; der Rest rückt in der Schlange nach vorn */
      var sichtbar = z === im || (im.getBoundingClientRect().left < W.innerWidth * 1.25 && getComputedStyle(im).opacity !== '0');
      if (sichtbar) { starte(im); entpacke(im); } else if (!im.__h && !da(im)) hinten.push(im);
    });
    if (hinten.length) { schlange = hinten.concat(schlange.filter(function (im) { return hinten.indexOf(im) < 0; })); weiter(); }
  }
  var gleich = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var z = e.target; gleich.unobserve(z);
      /* solange der erste Bildschirm lädt, wartet, was erst darunter kommt (es ist danach als Erstes dran) */
      if (!frei && z.getBoundingClientRect().top >= W.innerHeight) { wartet.push(z); return; }
      nahe(z);
    });
  }, { rootMargin: '120% 25% 120% 25%' });
  /* Fenster-Bilder sind leicht (um 60 KB), werden aber erst geholt, wenn .nah sie sichtbar macht: deshalb schon zweieinhalb Fensterhöhen vorher
     (gemessen 09.10.: mit 120 % kam das Keller-Fenster der Startseite beim zügigen Scrollen bis 1,1 s zu spät) */
  var weit = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; weit.unobserve(e.target); if (frei) nahe(e.target); else wartet.push(e.target); }); }, { rootMargin: '250% 0px 250% 0px' });
  alle.forEach(function (im) {
    var z = ziel(im);
    if (z !== im) { if (gruppen.indexOf(z) > -1) return; gruppen.push(z); }
    if (z.classList.contains('bruch')) weit.observe(z); else gleich.observe(z);
  });

  /* ---------- erst der erste Bildschirm, dann der Rest ---------- */
  function los() { if (frei) return; frei = true; neu = true; if (!geladen) setTimeout(nachLoad, 3000); wartet.splice(0).forEach(nahe); weiter(); }
  function erster() {
    var h = W.innerHeight, w = W.innerWidth;
    var vorn = [].slice.call(doc.images).filter(function (im) {
      if (da(im) || im.offsetParent === null || (im.parentNode && im.parentNode.classList.contains('bruch'))) return false;
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
    setTimeout(los, 6000);
  }
  erster();
})();

/* Kopfbild in zwei Stufen (Robert 18.10.2026, 17:25: «wenn ich Hero lade, dann sind die Bilder blurr»): Das Kopfbild lädt zuerst die leichte
   Fassung (Ansage in sizes). Sobald sie steht, gilt die volle Ansage aus data-scharf; der Browser holt die grosse Datei und tauscht erst,
   wenn sie da ist. Bilder mit leerem data-scharf bleiben, wie sie sind. */
(function () {
  var stufe = function (im) {
    var voll = im.getAttribute('data-scharf'); if (!voll || im.sizes === voll) return;
    /* 18.10.2026 23:40 (Robert: «im Hero die Bilder … laden erst sehr spät»): Safari gab beim Umschalten die leichte Fassung auf und wartete auf die
       grosse. Die grosse wird jetzt zuerst im Hintergrund geholt; erst wenn sie fertig ist, schaltet das Bild um, aus dem Speicher, ohne Lücke. */
    var los = function () {
      var v = new Image(); v.decoding = 'async'; v.sizes = voll; v.srcset = im.srcset; v.src = im.src;
      var tausch = function () { im.sizes = voll; };
      if (v.decode) v.decode().then(tausch, tausch); else v.onload = tausch;
    };
    var bereit = function () { if (document.readyState === 'complete') los(); else window.addEventListener('load', los, { once: true }); };
    if (im.complete && im.naturalWidth) bereit(); else im.addEventListener('load', bereit, { once: true });
  };
  var alle = function () { Array.prototype.forEach.call(document.querySelectorAll('img[data-scharf]'), stufe); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', alle); else alle();
})();
