/* Familie Maeder — Weg B «Eine Reise in einem Zug» (17.10.2026): Auftritte, Bildtausch, Laden.
   Der Weg der Fotos nach oben hängt in reise.css an der Scroll-Zeitachse; hier wird nur der Moment gesetzt, in dem ein Stück den Rand erreicht (.da):
   dann setzt sich das Foto in seinen Rahmen, Überschriften rollen aus dem Schlitz, Texte steigen. Nichts startet unsichtbar, nichts wartet. */
(function () {
  'use strict';
  var doc = document.documentElement, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var ruhig = doc.classList.contains('ruhig');
  var stuecke = $$('[data-m], .abz');

  /* ---------- Auftakt: startet mit dem Laden ---------- */
  var auf = document.querySelector('.rb-auf');
  if (auf) requestAnimationFrame(function () { requestAnimationFrame(function () {
    auf.classList.add('da'); $$('[data-m]', auf).forEach(function (el) { el.classList.add('da'); });
  }); });

  /* ---------- Alles andere: sobald es den unteren Rand erreicht ---------- */
  if (ruhig || !('IntersectionObserver' in window)) {
    stuecke.forEach(function (el) { el.classList.add('da'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
    stuecke.forEach(function (el) { if (!auf || !auf.contains(el)) io.observe(el); });
    /* Fäden und Spuren ohne Scroll-Zeitachse (ältere Browser): zeichnen sich, sobald sie im Bild sind */
    $$('.faden').forEach(function (f) { io.observe(f); });
  }

  /* ---------- Bildgruppe: ein kleines Bild fährt an die Stelle des grossen, das grosse nimmt seinen Platz ein (keine Lightbox) ---------- */
  $$('[data-bildgruppe]').forEach(function (g) {
    var gross = g.querySelector('.bg__gross .rk__b');
    $$('.bg__k', g).forEach(function (knopf) {
      knopf.addEventListener('click', function () {
        if (g._fliegt) return;
        var klein = knopf.querySelector('.rk__b'), ik = klein.querySelector('img'), ig = gross.querySelector('img');
        var rk = klein.getBoundingClientRect(), rg = gross.getBoundingClientRect();
        var tausch = function () {
          ['src', 'srcset', 'alt', 'data-n'].forEach(function (a) { var x = ik.getAttribute(a), y = ig.getAttribute(a); if (y !== null) ik.setAttribute(a, y); if (x !== null) ig.setAttribute(a, x); });
          var bk = klein.style.backgroundImage; klein.style.backgroundImage = gross.style.backgroundImage; gross.style.backgroundImage = bk;
          knopf.setAttribute('aria-label', 'Bild gross zeigen: ' + ik.getAttribute('alt'));
          var kerbe = g.querySelector('.bg__gross .rk__kerbe span'); if (kerbe && ig.getAttribute('data-n')) kerbe.textContent = ig.getAttribute('data-n');
        };
        if (ruhig) { tausch(); return; }
        g._fliegt = true;
        var flug = document.createElement('figure'); flug.className = 'bildflug';
        var bild = new Image(); bild.src = ik.currentSrc || ik.src; bild.alt = '';
        flug.appendChild(bild);
        flug.style.cssText = 'left:' + rg.left + 'px;top:' + rg.top + 'px;width:' + rg.width + 'px;height:' + rg.height + 'px;border-radius:26px;transform:translate(' + (rk.left - rg.left) + 'px,' + (rk.top - rg.top) + 'px) scale(' + (rk.width / rg.width) + ',' + (rk.height / rg.height) + ')';
        document.body.appendChild(flug);
        flug.getBoundingClientRect();
        requestAnimationFrame(function () { flug.style.transform = 'none'; });
        var fertig = function () { tausch(); requestAnimationFrame(function () { flug.remove(); g._fliegt = false; }); };
        flug.addEventListener('transitionend', function f(e) { if (e.propertyName !== 'transform') return; flug.removeEventListener('transitionend', f); fertig(); });
        setTimeout(function () { if (g._fliegt && flug.isConnected) fertig(); }, 1300);
      });
    });
  });

  /* ---------- Laden: nach dem ersten Bildschirm alle Fotos der Reihe nach holen, damit sie fertig dastehen, bevor man hinkommt ---------- */
  window.addEventListener('load', function () {
    var faul = $$('main img[loading="lazy"]'), n = 0;
    (function weiter() {
      var los = faul.slice(n, n + 4); n += 4;
      if (!los.length) return;
      var offen = los.length, eins = function () { if (--offen === 0) setTimeout(weiter, 60); };
      los.forEach(function (im) { if (im.complete && im.naturalWidth) { eins(); return; } im.addEventListener('load', eins, { once: true }); im.addEventListener('error', eins, { once: true }); im.loading = 'eager'; });
    })();
  });
})();
