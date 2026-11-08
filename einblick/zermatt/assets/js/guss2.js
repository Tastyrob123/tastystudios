/* Probe 2 «Aus einem Guss»: die Szenen der Kapitel. Eine Schleife (W.ZM.szene aus zm.js), nur transform. */
(function () {
  'use strict';
  var W = window, D = document, Z = W.ZM; if (!Z) return;
  var $ = Z.$, $$ = Z.$$, st = Z.stueck, weich = Z.weich, raus = Z.raus, klemm = Z.klemm;

  /* 1 Das Fenster geht auf: Rahmen wächst von einem Drittel auf den ganzen Bildschirm, das Bild darin setzt sich, der Satz steigt */
  $$('[data-fenster]').forEach(function (s) {
    var r = $('.g2-fenster__rahmen', s), i = $('.g2-fenster__innen', s), satz = $('.g2-fenster__satz', s), b = $('.g2-fenster__buehne', s), k = $('.g2-fenster__kopf', s);
    var s0 = innerWidth < 761 ? .5 : .34;
    Z.szene(s, function (p) {
      var a = weich(st(p, 0, .72)), c = raus(st(p, .62, 1));
      r.style.transform = 'scale(' + (s0 + (1 - s0) * a) + ')';
      i.style.transform = 'scale(' + (1.5 - .5 * a) + ')';
      k.style.transform = 'translate3d(0,' + (-a * 12) + 'svh,0)';
      satz.style.transform = 'translate3d(0,' + ((1 - c) * 40) + 'svh,0)';
      b.style.setProperty('--schatten', c.toFixed(3));
    });
  });

  /* 5 Kamerafahrt über den Balkon: das Bild gleitet langsam im Rahmen, der Satz steigt etwas schneller */
  $$('[data-kamera]').forEach(function (s) {
    var bild = $('.g2-balkon__bild', s), satz = $('.g2-balkon__satz', s);
    Z.szene(s, function (p) {
      bild.style.transform = 'translate3d(0,' + ((.5 - p) * 22) + '%,0)';
      satz.style.transform = 'translate3d(0,' + ((.5 - p) * 30) + 'svh,0)';
    }, { ganz: true, vor: 1 });
  });

  /* 8 Der Schlitz öffnet sich: Rahmen von schmal auf ganz, das Bild darin bleibt unverzerrt */
  $$('[data-schlitz]').forEach(function (s) {
    var r = $('.g2-schlitz__rahmen', s), bild = $('.g2-schlitz__bild', s), satz = $('.g2-schlitz__satz', s), s0 = .06;
    Z.szene(s, function (p) {
      var a = weich(st(p, .05, .7)), x = s0 + (1 - s0) * a;
      r.style.transform = 'scaleX(' + x + ')';
      bild.style.transform = 'scaleX(' + (1 / x) + ') scale(' + (1.12 - .12 * a) + ')';
      satz.style.transform = 'translate3d(0,' + ((1 - raus(st(p, .45, .95))) * 30) + 'svh,0)';
    });
  });

  /* 11 Schluss: das Matterhorn steigt wieder herauf, wie im Auftakt */
  $$('[data-start]').forEach(function (s) {
    var berg = $('.g2-start__berg', s);
    Z.szene(s, function (p) { berg.style.transform = 'translate3d(0,' + ((1 - weich(st(p, 0, .85))) * 40) + '%,0)'; }, { ganz: true, vor: 1 });
  });

  /* 6 Die Bestellplatte hakt die Wünsche nacheinander ab, sobald sie ankommt */
  var mo = $('.g2-morgen .mo');
  if (mo && 'IntersectionObserver' in W) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { mo.classList.add('ja'); o.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' }).observe(mo);
  else if (mo) mo.classList.add('ja');

  /* Wellness-Liste: Zeilen nacheinander */
  $$('.g2-warm__namen li').forEach(function (li, n) { li.style.setProperty('--n', n); });

  /* Gruppen kommen in einem Zug: berührt ein Foto den Rand, kommen alle Fotos der Gruppe */
  D.addEventListener('da', function (ev) {
    var g = ev.target.closest && ev.target.closest('.g2-gast__kante,.g2-zimmer__gruppe,.lb-buehne,.s4__bilder,.gr-3');
    if (g) $$('[data-r]', g).forEach(function (x) { x.classList.add('da'); });
  }, true);

  /* LEBEN (Wandern der Ebenen beim Scrollen) entfernt (Robert 02.11.2026: «diese Perspektive will ich nicht», auf allen Seiten).
     Die Kacheln stehen bündig still; das Hereinschweben wie bei Monte-Moro macht schweben.js. Alter Stand: guss2.js.vor-schweben-alle-2026-11-02 */

  /* Die grossen Zahlen zählen beim Ankommen hoch; die Breite steht vorher fest, nichts springt */
  $$('[data-zahl]').forEach(function (el) {
    var n = parseFloat(el.dataset.zahl), z = el.dataset.zahl; el.style.display = 'inline-block'; el.style.minWidth = (z.length * .62) + 'em';
    if (Z.ruhig || !('IntersectionObserver' in W)) return;
    var v0 = n < 10 ? 1 : Math.round(n * .6); el.textContent = String(v0);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = 0, dauer = n < 10 ? 700 : 1100;
      (function schritt(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dauer); el.textContent = String(Math.round(v0 + (n - v0) * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(schritt); })(performance.now());
    }, { rootMargin: '0px 0px -12% 0px' }).observe(el);
  });

  Z.messen();
})();
