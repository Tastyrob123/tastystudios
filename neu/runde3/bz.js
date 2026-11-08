/* Bühne der Beigaben (bz.py): im Feed-Handy lässt sich das Profil nach einem Tipp scrollen, beim Verlassen springt es zurück. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-fh]'), function (f) {
    var l = f.querySelector('.fh-l');
    f.addEventListener('click', function () { f.classList.add('live'); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (E) {
      if (!E[0].isIntersecting) { f.classList.remove('live'); l.scrollTop = 0; }
    }).observe(f);
  });
})();
