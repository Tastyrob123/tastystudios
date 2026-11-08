/* Hotel Monte-Moro · Lader mit Reihenfolge (Bauart Salt & Silver 14.10.2026, vereinfacht): zuerst der erste Bildschirm, dann das Nahe (gut eine
   Bildschirmhöhe voraus), dann der Rest der Reihe nach, nie mehr als drei zugleich. Fotos unter dem ersten Schirm stehen gehalten (data-src/data-srcset),
   hinter jedem liegt das winzige echte Abbild als Grund (bau.py), nie ein dunkler Kasten. Fenster-Bilder erst, wenn der Abschnitt naht. */
(function () {
  'use strict';
  var W = window, doc = document, GLEICH = 3, laeuft = 0, frei_ = false, schlange = [];
  function gehalten(im) { return im.hasAttribute('data-src') || im.hasAttribute('data-srcset'); }
  function frei(im) { if (!gehalten(im)) return; var ss = im.getAttribute('data-srcset'), s = im.getAttribute('data-src'); im.removeAttribute('data-srcset'); im.removeAttribute('data-src'); if (ss) im.setAttribute('srcset', ss); if (s) im.setAttribute('src', s); }
  function da(im) { return !gehalten(im) && im.complete && im.naturalWidth > 1; }
  function entpacke(im) { if (im.__e || !im.decode) return; im.__e = 1; var los = function () { im.decode().catch(function () {}); }; if (da(im)) los(); else im.addEventListener('load', los, { once: true }); }
  function hole(im) { if (im.__h) return; im.__h = 1; frei(im); im.loading = 'eager'; entpacke(im); }
  function starte(im) { if (im.__h || da(im)) { hole(im); return; } laeuft++; var fertig = function () { if (im.__w) return; im.__w = 1; laeuft--; weiter(); }; im.addEventListener('load', fertig, { once: true }); im.addEventListener('error', fertig, { once: true }); setTimeout(fertig, 8000); hole(im); }
  function abstand(im) { var el = im.closest('.bruch') || im; var r = el.getBoundingClientRect(), h = W.innerHeight; return r.bottom < 0 ? -r.bottom * 1.5 : (r.top > h ? r.top - h : 0); }
  var neu = true;
  function weiter() {
    if (!frei_) return;
    while (laeuft < GLEICH && schlange.length) {
      if (neu) { neu = false; schlange = schlange.filter(function (im) { return !im.__h && !da(im); }); schlange.forEach(function (im) { im.__a = abstand(im); }); schlange.sort(function (a, b) { return a.__a - b.__a; }); if (!schlange.length) return; }
      starte(schlange.shift());
    }
  }
  W.addEventListener('scroll', function () { neu = true; }, { passive: true });
  var alle = [].slice.call(doc.querySelectorAll('img[data-src],img[data-srcset],img[loading="lazy"]'));
  schlange = alle.slice();
  if (!('IntersectionObserver' in W)) { alle.forEach(hole); return; }
  var nah = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; nah.unobserve(e.target); var z = e.target, ims = z.tagName === 'IMG' ? [z] : [].slice.call(z.querySelectorAll('img')); ims.forEach(function (im) { if (!im.__h) { laeuft++; var f = function () { if (im.__w) return; im.__w = 1; laeuft--; weiter(); }; im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }); setTimeout(f, 8000); hole(im); if (da(im)) f(); } }); }); }, { rootMargin: '160% 20% 160% 20%' });
  alle.forEach(function (im) { nah.observe(im.closest('.bruch') || im); });
  /* später eingefügte Bilder (Schlüsselbrett, Fach) */
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && n.tagName === 'IMG' && (n.loading === 'lazy' || gehalten(n))) { alle.push(n); schlange.push(n); nah.observe(n); neu = true; weiter(); } }); }); }).observe(doc.body, { childList: true, subtree: true });
  /* erst der erste Bildschirm */
  function erster() {
    var h = W.innerHeight, vorn = [].slice.call(doc.images).filter(function (im) { var r = im.getBoundingClientRect(); return r.top < h && r.bottom > 0 && !gehalten(im); });
    var warten = vorn.filter(function (im) { return !da(im); }), n = warten.length;
    var los = function () { if (frei_) return; frei_ = true; neu = true; weiter(); };
    if (!n) { los(); return; }
    warten.forEach(function (im) { var f = function () { if (--n <= 0) los(); }; im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }); });
    setTimeout(los, 2500);
  }
  if (doc.readyState === 'complete') erster(); else W.addEventListener('load', erster, { once: true });
})();
