/* Anleitung · Besucher · Ihr Haus: Bild gross mit Klick, Esc schliesst (eigene Datei wie in der Vorlage). Das Zeichen kommt als Maske aus ../_haus/marke/zeichen.svg. */
(function () {
  var g = document.getElementById('gross'), im = g.querySelector('img');
  function zu() { g.hidden = true; }
  document.addEventListener('click', function (e) { var b = e.target.closest('.bild'); if (b) { im.src = b.querySelector('img').src; im.alt = b.querySelector('img').alt; g.hidden = false; } else if (e.target.closest('#gross')) zu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
})();
