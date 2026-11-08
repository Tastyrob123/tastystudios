/* Neubau «Ein Tag im Haus» (26.10.2026): die Szenen der neuen Abschnitte. Ein Takt (ZM.szene aus zm.js), nur transform und opacity,
   gerechnet wird nur, was im Bild ist (zm.js schläft Szenen ausserhalb). */
(function () {
  'use strict';
  var W = window, Z = W.ZM; if (!Z) return;
  var $ = Z.$, $$ = Z.$$, st = Z.stueck, weich = Z.weich, klemm = Z.klemm;
  var schmal = function () { return innerWidth < 761; };

  /* Gastgeber: die linke Bildspalte läuft schneller hinauf, die rechte langsamer; der Text dazwischen steht */
  $$('[data-gegenlauf]').forEach(function (s) {
    var a = $('.ta-gast__spalte--a', s), b = $('.ta-gast__spalte--b', s);
    Z.szene(s, function (p) {
      if (Z.ruhig || schmal()) { a.style.transform = b.style.transform = ''; return; }
      var w = Math.min(180, innerHeight * .2), d = (.5 - p) * 2 * w;
      a.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
      b.style.transform = 'translate3d(0,' + (-d).toFixed(1) + 'px,0)';
    }, { ganz: true, vor: 1 });
  });

  /* Südbalkon: die Kamera tritt beim Vorbeiscrollen zurück, aus 1,18 auf 1 */
  $$('[data-blick]').forEach(function (s) {
    var i = $('.ta-blick__bild img', s);
    Z.szene(s, function (p) {
      if (Z.ruhig) return;
      i.style.transform = 'scale(' + (1.18 - .18 * weich(st(p, .05, .95))).toFixed(4) + ')';
    }, { ganz: true, vor: 1 });
  });

  /* Dämmerung: die Nacht legt sich über den Schnee; 18.00 steht zweimal übereinander und kippt so von dunkel auf hell */
  $$('[data-daemmerung]').forEach(function (s) {
    var n = $('.ta-daemmerung__nacht', s), zeiten = $$('.ta-daemmerung__zeit', s);
    Z.szene(s, function (p) {
      n.style.opacity = Z.ruhig ? 1 : weich(st(p, .22, .58)).toFixed(3);
      var h = ((.5 - p) * (schmal() ? 50 : 110)).toFixed(1) + 'px';
      zeiten.forEach(function (z) { z.style.setProperty('--hoch', h); });
    }, { ganz: true, vor: 1 });
  });

  /* Schluss: die blaue Stunde gleitet langsam im Rahmen */
  $$('[data-drift]').forEach(function (s) {
    var b = $('.ta-schluss__bild', s);
    Z.szene(s, function (p) { if (!Z.ruhig) b.style.transform = 'translate3d(0,' + ((.5 - p) * 12).toFixed(2) + '%,0)'; }, { ganz: true, vor: 1 });
  });

  /* Wellness: Kamerafahrt im hohen Bild, vom Wasser mit den Kerzen hinauf zum Gipfel. Nicht am Scrollen (Robert 02.11.2026): sobald der Rahmen
     am unteren Rand auftaucht und das Foto geladen ist, fährt die Kamera von selbst einmal hinauf (4,2 s, wie die Flugfahrt bei Monte-Moro) und steht dann */
  $$('[data-fahrt]').forEach(function (s) {
    var r = $('.wl-fahrt', s), b = $('.wl-fahrt__bild', s), img = $('img', b), los = false;
    var weg = function () { return Math.max(0, b.offsetHeight - r.clientHeight); };
    var setze = function () { if (!los) b.style.transform = 'translate3d(0,' + (-weg()).toFixed(1) + 'px,0)'; };
    if (Z.ruhig || !('IntersectionObserver' in W)) return;
    setze(); if (img && !img.complete) img.addEventListener('load', setze); addEventListener('resize', setze, { passive: true });
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var fahr = function () { setze(); los = true; requestAnimationFrame(function () { b.style.transition = 'transform 4.2s cubic-bezier(.45,0,.15,1)'; b.style.transform = 'translate3d(0,0,0)'; }); };
      if (img && !(img.complete && img.naturalWidth > 1)) { img.addEventListener('load', fahr, { once: true }); setTimeout(fahr, 900); } else fahr();
    }, { rootMargin: '0px 0px 4% 0px' }).observe(r);
  });

  /* Anreise: die rote Linie füllt sich mit dem Weg vom Bahnhof bis auf die Piste */
  $$('[data-weg]').forEach(function (s) {
    var f = $('.an-weg__fuell', s), l = $('.an-weg__liste', s);
    Z.szene(l, function (p) { f.style.transform = 'scaleY(' + (Z.ruhig ? 1 : klemm(st(p, .12, .82), 0, 1)).toFixed(4) + ')'; }, { ganz: true, vor: 1 });
  });

  Z.messen();
})();
