/* Restaurant-Fassung der Werkzeuge und Beigaben (werkzeuge_gastro.py): Oberflächen in Originalgrösse auf ihren Rahmen skalieren, wie in r4.js,
   aber mit ResizeObserver, damit auch Stücke auf noch verborgenen Bühnen stimmen, sobald sie sichtbar werden. */
(function () {
  var fx = [].slice.call(document.querySelectorAll('[data-fix]'));
  function setze(f) { var b = f.parentElement.clientWidth; if (b) f.style.transform = 'scale(' + (b / +f.getAttribute('data-fix')) + ')'; }
  fx.forEach(setze);
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(function (es) { es.forEach(function (x) { x.target._fx.forEach(setze); }); });
    fx.forEach(function (f) { var p = f.parentElement; (p._fx = p._fx || []).push(f); ro.observe(p); }); }
  addEventListener('load', function () { fx.forEach(setze); });
})();
