/* Landgasthof Ruedihus — Fotos sind da, bevor man sie sieht, und was man sieht, kommt zuerst (Robert 09.10.2026: «Bilder laden sichtbar zu spät»).
   Der einzige Lader der Seite (main.js setzt keine Fotos mehr selbst auf "eager", ausser für ein Bild, das gerade erscheint).
   Im HTML stehen die Fotos auf "lazy" (ohne Skript lädt die Seite wie gewohnt). Hier bekommt jedes seinen Platz in der Reihe:
   1. was im Bild steht, sofort und mit Vorrang;
   2. was in den nächsten zwei Fensterhöhen liegt, höchstens vier zugleich, das Nächstgelegene zuerst, und schon entpackt;
   3. der Rest der Seite, sobald 1 und 2 fertig sind, zwei zugleich, wieder das Nächstgelegene zuerst: die Leitung steht nie still.
   Vorher setzten fünf Stellen (bilder.js und vier Beobachter in main.js) ganze Abschnitte auf einmal auf "eager"; auf einer Leitung
   mit 250 KB/s teilten sich dann bis zu zwanzig Fotos die Leitung und das Foto vor den Augen wartete auf alle anderen.
   Fenster (.bruch): ihr Foto steht fest über dem ganzen Schirm und gilt für den Browser deshalb immer als sichtbar. Es bleibt aus dem Bild
   (CSS: .bruch:not(.nah) .bruch__bild img), bis der Abschnitt naht, und wird ausgeblendet, solange der Abschnitt weit weg ist (.bruch.weg),
   damit der Browser nicht drei Vollbild-Fotos mitzeichnet.
   Kein Eingriff in den Scroll, keine Arbeit im Takt: nur Beobachter und das Lade-Ereignis der Fotos.
   Gebaut nach assets/js/bilder.js im Waldhotel Doldenhorn (dort gemessen: von 28 auf 0–1 späte Fotos). */
(function () {
  'use strict';
  if ('IntersectionObserver' in window) document.documentElement.classList.add('lader');
  var alle = [].slice.call(document.querySelectorAll('img[loading="lazy"]'));
  var netz = navigator.connection || {}, sparsam = !!netz.saveData || /2g/.test(netz.effectiveType || '');
  /* Vorrat: die Kopfbilder der anderen Seiten (Liste im HTML, #vorrat). Steht diese Seite fertig da, werden sie leise eines nach dem anderen geholt,
     in genau der Grösse, die die andere Seite verlangen wird. Beim Seitenwechsel liegt das Kopfbild dann schon beim Gast und steht sofort scharf da. */
  var vorratDa = false, halte = [];
  function vorrat() {
    if (vorratDa || sparsam) return; vorratDa = true;
    var el = document.getElementById('vorrat'), liste, i = 0; if (!el) return;
    try { liste = JSON.parse(el.textContent); } catch (x) { return; }
    (function weiter() {
      var e = liste[i++]; if (!e) return;
      if (e[2] && !matchMedia(e[2]).matches) { weiter(); return; }
      var im = new Image(); try { im.fetchPriority = 'low'; } catch (x) {}
      im.onload = im.onerror = function () { setTimeout(weiter, 60); };
      im.sizes = e[1]; im.srcset = e[0]; halte.push(im);
    })();
  }
  /* KOPFBILD 18.10.2026: die volle Schärfe holt der Browser, sobald die leichte Fassung steht, nicht erst nach allen anderen Fotos
     (Robert 17:25 «wenn ich Hero lade, dann sind die Bilder blurr»). Das leichte Bild bleibt stehen, bis das volle ganz da ist. */
  (function () {
    var k = document.querySelector('img[fetchpriority="high"][data-scharf]'); if (!k || sparsam) return;
    /* Robert 18.10.2026 23:19 («komplett Blur»): Safari verwirft beim Umschalten das schon geladene leichte Bild und zeigt bis zur vollen Fassung nur die
       Unschärfe. Deshalb wird die volle Fassung erst unsichtbar geholt und entschlüsselt, getauscht wird danach aus dem Speicher, ohne Lücke. */
    var voll = function () { if (k.__voll) return; k.__voll = 1; var gross = k.getAttribute('data-scharf'), v = new Image();
      v.decoding = 'async'; v.sizes = gross; v.srcset = k.getAttribute('srcset') || ''; if (!v.srcset) return;
      var tausch = function () { requestAnimationFrame(function () { k.sizes = gross; }); };
      v.onload = function () { (v.decode ? v.decode() : Promise.resolve()).then(tausch, tausch); }; };
    if (k.complete && k.naturalWidth) voll(); else { k.addEventListener('load', voll, { once: true }); }
  })();
  if (!alle.length) { if (document.readyState === 'complete') setTimeout(vorrat, 800); else window.addEventListener('load', function () { setTimeout(vorrat, 800); }); return; }
  var MAX = sparsam ? 2 : 4, laeuft = 0, nahe = [], rest = [], restFrei = false;
  function da(im) { return im.complete && im.naturalWidth > 0; }
  function fertig(im) { if (im.__f) return; im.__f = 1; laeuft--; pumpe(); }
  function hole(im, vorrang) {
    if (im.__h) return; im.__h = 1;
    try { im.fetchPriority = vorrang; } catch (x) {}
    im.loading = 'eager';
    if (da(im)) return;
    laeuft++;
    im.addEventListener('load', function () { fertig(im); }, { once: true });
    im.addEventListener('error', function () { fertig(im); }, { once: true });
    setTimeout(function () { fertig(im); }, 9000);
  }
  function entpacke(im) {
    if (im.__e || !im.decode) return; im.__e = 1;
    var los = function () { im.decode().catch(function () {}); };
    if (da(im)) los(); else im.addEventListener('load', los, { once: true });
  }
  /* Entfernung eines Fotos zum Fenster (unterhalb zählt einfach, oberhalb mehr: man scrollt meist nach unten) */
  function weit(im) {
    var r = im.getBoundingClientRect(); if (!r.width && !r.height) return 1e7;
    var y = r.top > innerHeight ? r.top - innerHeight : r.bottom < 0 ? -r.bottom * 1.6 : 0, x = r.left > innerWidth ? r.left - innerWidth : r.right < 0 ? -r.right : 0;
    return y + x * .5;
  }
  function naechstes(liste) {
    var i, w, best = -1, bw = 1e9;
    for (i = liste.length - 1; i >= 0; i--) if (liste[i].__h || da(liste[i])) liste.splice(i, 1);
    for (i = 0; i < liste.length && i < 48; i++) { w = weit(liste[i]); if (w < bw) { bw = w; best = i; } }
    return best < 0 ? null : liste.splice(best, 1)[0];
  }
  /* Fotos mit data-scharf (der Auftakt) kommen zuerst in einer leichteren Fassung; steht die Seite, holt der Browser die volle Schärfe nach
     und tauscht ohne Flackern (das alte Bild bleibt stehen, bis das neue ganz da ist) */
  var scharf = false;
  function schaerfe() {
    if (scharf || sparsam) return; scharf = true;
    [].slice.call(document.querySelectorAll('img[data-scharf]')).forEach(function (im) { try { im.fetchPriority = 'low'; } catch (x) {} im.sizes = im.getAttribute('data-scharf'); });
  }
  /* Das Kopfbild hat die Leitung für sich: Fotos ausserhalb des Bildes warten, bis es da ist (höchstens vier Sekunden) */
  var kopf = document.querySelector('img[fetchpriority="high"]'), kopfDa = !kopf || da(kopf);
  if (!kopfDa) { var frei = function () { if (kopfDa) return; kopfDa = true; pumpe(); }; kopf.addEventListener('load', frei, { once: true }); kopf.addEventListener('error', frei, { once: true }); setTimeout(frei, 4000); }
  function pumpe() {
    var im;
    if (!kopfDa) return;
    while (laeuft < MAX && (im = naechstes(nahe))) hole(im, 'auto');
    if (!restFrei || sparsam || nahe.length) return;
    while (laeuft < 2 && (im = naechstes(rest))) hole(im, 'low');
    if (!laeuft && !rest.length) { schaerfe(); vorrat(); }
  }
  if (!('IntersectionObserver' in window)) { alle.forEach(function (im) { im.loading = 'eager'; }); return; }

  /* Wer wird beobachtet: das Foto selbst. Fotos in einem stehenden Fenster oder in einem Band zum Blättern hängen an ihrem Abschnitt,
     weil sie dort abgeschnitten sind, bis man hinkommt – kommt der Abschnitt näher, kommen seine Fotos (die sichtbaren zuerst). */
  var gruppen = [], ziel = function (im) { return im.closest('.bruch,.band,.polas,.rk,.fa,.wahl__b,.stufe__b,.pakete__b') || im; };
  function fotos(el) { return el.tagName === 'IMG' ? [el] : [].slice.call(el.querySelectorAll('img[loading]')); }
  function vorn(im) { var r = im.getBoundingClientRect(); return r.width > 0 && r.left < innerWidth * 1.15 && r.right > -innerWidth * .15; }
  var sicht = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      sicht.unobserve(e.target);
      fotos(e.target).forEach(function (im) { if (e.target === im || vorn(im)) { hole(im, 'high'); entpacke(im); } else if (!im.__h) nahe.push(im); });
    });
    pumpe();
  }, { rootMargin: '18% 10% 18% 10%' });
  var nah = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting) return; nah.unobserve(e.target); fotos(e.target).forEach(function (im) { if (!im.__h) { nahe.push(im); entpacke(im); } }); });
    pumpe();
  }, { rootMargin: '200% 40% 200% 40%' });
  /* Fenster: Foto erst zeigen (und damit laden), wenn der Abschnitt zwei Fensterhöhen nah ist; weit weg wieder ausblenden */
  var fen = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('weg', !e.isIntersecting); if (e.isIntersecting) e.target.classList.add('nah'); });
  }, { rootMargin: '200% 0px 200% 0px' });
  [].slice.call(document.querySelectorAll('.bruch')).forEach(function (b) { fen.observe(b); });
  alle.forEach(function (im) {
    var z = ziel(im);
    if (z !== im) { if (gruppen.indexOf(z) > -1) return; gruppen.push(z); }
    sicht.observe(z); nah.observe(z);
  });

  /* der Rest der Seite (auch Bänder zum Blättern, Reiter, Tischwahl): erst wenn der erste Schirm steht und nichts Näheres mehr wartet */
  function los() { rest = alle.filter(function (im) { return !im.__h && !da(im); }); restFrei = true; pumpe(); setTimeout(vorrat, 6000); }   /* spätestens nach sechs Sekunden, auch wenn unten noch Fotos laden */
  if (document.readyState === 'complete') setTimeout(los, 300);
  else window.addEventListener('load', function () { setTimeout(los, 300); });
})();
