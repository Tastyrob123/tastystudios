/* treten Sie ein · Drei Räume mit Namen: .da beim Ankommen (Räume steigen herauf), Zahlen zählen hoch wie beim Spa. */
(function () {
  var S = document.querySelector('.ed'); if (!S) return;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sicht = function (el, an) {
    if (!('IntersectionObserver' in window)) { an(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { an(); io.disconnect(); } }); }, { rootMargin: '0px 0px -14% 0px' });
    io.observe(el);
  };
  [].forEach.call(S.querySelectorAll('[data-ed]'), function (x) { sicht(x, function () { x.classList.add('da'); }); });
  if (ruhig) return;
  [].forEach.call(S.querySelectorAll('[data-z]'), function (z) {
    var ziel = +z.dataset.z, von = ziel - 60;
    z.textContent = von;
    sicht(z, function () {
      var t0 = performance.now();
      (function lauf(t) { var q = Math.min(1, (t - t0) / 1600), k = 1 - Math.pow(1 - q, 3); z.textContent = Math.round(von + (ziel - von) * k); if (q < 1) requestAnimationFrame(lauf); })(t0);
    });
  });
})();
