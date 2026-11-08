/* Handy-Fassung der Startseiten (Robert 04.11.2026), nur unter 860 px.
   Am Handy sind manche Abschnitte viel höher als der Bildschirm. Der Beobachter in r.js startet erst ab 25 % im Bild,
   das erreichen hohe Abschnitte nie. Hier starten sie, sobald ihr Anfang ins Bild kommt. */
(function () {
  if (!window.matchMedia || !matchMedia('(max-width:860px)').matches || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var w = e.target;
      if (w.closest('.b-platz')) return;
      if (w._start) w._start();
      w.classList.add('spielt');
      io.unobserve(w);
    });
  }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
  // Karten und Drucksachen: die Blätter in Rechner-Grösse (440 px, handy.css) auf die Breite des Fächer-Platzes verkleinern
  function papier() { document.querySelectorAll('.fo-papier').forEach(function (p) { var b = p.closest('.fa-b'); if (b && b.clientWidth) p.style.setProperty('--ps', (b.clientWidth / 440).toFixed(3)); }); }
  addEventListener('resize', papier);
  function los() { papier(); document.querySelectorAll('[data-w]').forEach(function (w) { io.observe(w); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', los); else los();
})();
