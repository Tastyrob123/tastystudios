/* Werkzeuge «Ordner»: von jeder Datei ([data-von]) läuft im Hintergrund eine Linie zu ihrer Kachel ([data-zu]), im Takt der Haken
   (Kachel j: 1,15 s + j·.6 s nach dem Veröffentlichen). Der Ablauf startet, sobald der obere Teil im Bild ist. Bewegt wird nur opacity. */
(function () {
  'use strict';
  var box = document.querySelector('.s-wzg [data-linien]'); if (!box) return;
  var raster = box.querySelector('.d-raster');
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'wz-linien'); svg.setAttribute('aria-hidden', 'true'); box.insertBefore(svg, box.firstChild);
  function f(v) { return Math.round(v) + .5; }
  function zeichne() {
    var r0 = box.getBoundingClientRect(); if (!r0.width || getComputedStyle(svg).display === 'none') return;
    var alle = '', hell = '', punkte = '';
    [].slice.call(box.querySelectorAll('[data-von]')).forEach(function (a) {
      var id = a.getAttribute('data-von'), b = box.querySelector('[data-zu="' + id + '"]'); if (!b) return;
      var A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
      var x1 = A.right - r0.left, y1 = A.top + A.height / 2 - r0.top, x2 = B.left - r0.left, y2 = B.top + B.height / 2 - r0.top;
      /* senkrecht immer in der Lücke zwischen Dateien und Kacheln, nie zwischen den Kacheln: so kreuzt keine Linie eine Beschriftung */
      var j = +id.slice(1), xm = (x1 + raster.getBoundingClientRect().left - r0.left) / 2 + (j - 2.5) * 7;
      var d = 'M' + f(x1) + ' ' + f(y1) + 'H' + f(xm) + 'V' + f(y2) + 'H' + f(x2), t = (1.15 + j * .6).toFixed(2);
      alle += d + ' '; hell += '<path class="b" style="--t:' + t + 's" d="' + d + '"/>';
      punkte += '<circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="3.5" style="--t:' + t + 's"/>';
    });
    svg.setAttribute('width', Math.round(r0.width)); svg.setAttribute('height', Math.round(r0.height));
    svg.innerHTML = '<path class="a" d="' + alle + '"/>' + hell + punkte;
  }
  zeichne(); addEventListener('resize', zeichne); addEventListener('load', zeichne); setTimeout(zeichne, 700);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { zeichne(); if (box._start) { box._start(); box.classList.add('spielt'); } } });
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0 }).observe(box);
  }
})();
/* Robert 04.11.2026: Einflug aus allen Richtungen (wz.css .flug/.fliegt). Wenn alles steht, die Linien neu ziehen und einblenden. */
(function () {
  'use strict';
  var box = document.querySelector('.s-wzg .wzo');
  if (!box || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(min-width: 861px)').matches) return;
  box.classList.add('flug');
  /* das Eintragen im Kontrollpanel beginnt erst, wenn alles gelandet ist */
  var los = box._start, wartet = false;
  if (los) box._start = function () { if (box.classList.contains('steht')) los(); else wartet = true; };
  var io = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return; io.disconnect(); box.classList.add('fliegt');
    setTimeout(function () { dispatchEvent(new Event('resize')); box.classList.add('steht'); if (wartet && los) los(); }, 2400);
  }, { rootMargin: '100000px 0px -10% 0px', threshold: 0 });
  io.observe(box);
})();
