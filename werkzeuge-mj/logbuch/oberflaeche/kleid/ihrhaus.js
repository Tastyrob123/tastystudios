/* kleid/ihrhaus.js · Hauswerte für oberflaeche.js (Maloja, ein Speicher von 1888 am Sandtorkai, Hamburg; Vorführung für das Atelier von Tasty Studios).
   Im <head> VOR allen Stilen laden (ohne defer), nach ../_kleid/haus.js. Rahmen «Die Bühne»: Kopf dunkel wie das Wasser bei Nacht, Raum hell wie Leinen.
   Fotos und Schriften kommen aus ../_haus/ (img/<schlüssel>-800|1400.webp, fonts/), das Zeichen (der Hafenkran) aus ../_haus/marke/zeichen.svg. */
(function () {
  var W = (window.HAUS && window.HAUS.WERKZEUGE) || [];
  var nm = function (i, ers) { return W[i] && W[i][0] ? W[i][0] : ers; };
  window.WO_HAUS = { kurz: 'ihrhaus', name: 'Maloja', voll: 'Maloja, Restaurant in der Speicherstadt', ort: 'Pickhuben · Hamburg', welt: 'hotel', rahmen: 'buehne', anrede: 'sie',
    /* Aussenfoto des Startbilds: der Speicher am Sandtorkai bei Nacht */
    foto: '../_haus/img/m-aussen-1400.webp', fotoKlein: '../_haus/img/m-aussen-800.webp', fotoFarbe: '#4c3f3b',
    /* Zeichen im Ring: der Hafenkran als klare Linie (haus.py MARKE, Fassung 2) */
    zeichen: '../_haus/marke/zeichen.svg', zeichenMass: 1, wortmarke: '../_haus/marke/wortmarke.svg', wortmarkeMass: 6.44,
    /* Namen der sieben Werkzeuge: nach dem Zweck (window.HAUS.WERKZEUGE, haus.py). Ordner und Schlüssel bleiben (giebel, kontor …). */
    namen: { zentrale: nm(0, 'Kontrollpanel'), website: nm(1, 'Website bearbeiten'), karten: nm(2, 'Speisekarten'), gaeste: nm(3, 'Anfragen & Chat'), marke: nm(4, 'Markenbuch'), besuche: nm(6, 'Besucher'), druck: nm(5, 'Drucksachen & Feed') },
    saetze: { zentrale: 'Hier beginnt alles: ein Blick auf alle Werkzeuge und ihren Stand.',
      website: 'Die Website selbst pflegen: Texte, Preise, Zeiten und Fotos.',
      karten: 'Menü, vegetarisches Menü, Bar und Weinbegleitung als Karte und PDF.',
      gaeste: 'Tisch- und Feieranfragen mit Antwortentwurf, dazu der Chat.',
      marke: 'Zeichen, Fotos, Farben und Schriften des Hauses an einem Ort.',
      besuche: 'Wer die Website besucht: woher, wann, welche Seiten, wer anfragt.',
      druck: 'Menükarten, Tischkarten, Gutscheine und Aushänge.' },
    /* Wege zwischen den Werkzeugen: Nachbarordner unter werkzeuge/ */
    wege: { zentrale: '../giebel/index.html', website: '../kontor/index.html', karten: '../lagerbuch/index.html', gaeste: '../winde/index.html', marke: '../musterkammer/index.html', besuche: '../logbuch/index.html', druck: '../werkstatt/index.html' } };
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge: bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = me && me.src ? new URL('../bewegung.js', me.src).href : 'oberflaeche/bewegung.js';
  s.async = true; s.setAttribute('fetchpriority', 'low'); document.head.appendChild(s);
})();
/* Titel fliegen zeilenweise hoch (Kriterium 37, 30.10.2026). WO_ZEILEN(el) setzt jedes Wort eines Titels in <span class="wo-w"> und schreibt die Zeile als --z daran;
   die Wörter einer Zeile steigen zusammen, Zeile für Zeile gestaffelt. Ändert sich dabei der Umbruch (Silbentrennung, sehr lange Wörter), bleibt der Titel unberührt.
   Hier im Kleid (ohne defer), damit der Titel des Startbilds schon vor dem ersten Bild geteilt ist; bewegung.js nutzt dieselbe Funktion für die Zwischentitel. */
window.WO_ZEILEN = function (el) {
  if (!el || el.hasAttribute('data-wo-zl')) return !!(el && el.classList.contains('wo-zl'));
  var h0 = el.offsetHeight; if (!h0) return false;   /* verborgen: später, wenn er zu sehen ist */
  el.setAttribute('data-wo-zl', '');
  var w0 = Math.max(el.scrollWidth, el.clientWidth), roh = el.innerHTML, tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), t, ts = [];
  while ((t = tw.nextNode())) if (/\S/.test(t.data) && !t.parentNode.closest('svg')) ts.push(t);
  if (!ts.length) return false;
  ts.forEach(function (t) {
    var f = document.createDocumentFragment();
    t.data.split(/(\s+)/).forEach(function (s) {
      if (!s) return;
      if (/^\s+$/.test(s)) { f.appendChild(document.createTextNode(s)); return; }
      var w = document.createElement('span'); w.className = 'wo-w'; w.textContent = s; f.appendChild(w);
    });
    t.parentNode.replaceChild(f, t);
  });
  if (el.offsetHeight !== h0 || el.scrollWidth > w0 + 1) { el.innerHTML = roh; return false; }
  var z = -1, oben = -1e9, halb = parseFloat(getComputedStyle(el).fontSize) * 0.5;
  el.querySelectorAll('.wo-w').forEach(function (w) { var y = w.getBoundingClientRect().top; if (y > oben + halb) { z++; oben = y; } if (z) w.style.setProperty('--z', z); });
  el.classList.add('wo-zl');
  return true;
};
/* Der Titel des Startbilds: geteilt, sobald er im Dokument steht (vor dem ersten Bild, der Auftritt beginnt erst nach 0,18 s) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('MutationObserver' in window)) return;
  var plan = 0;
  function teile() {
    plan = 0;
    document.querySelectorAll('.wo-sb__h:not([data-wo-zl])').forEach(function (h) {
      if (document.documentElement.classList.contains('still')) return;
      var a = h.getAnimations ? h.getAnimations() : [];
      if (a.some(function (x) { return (x.currentTime || 0) > 120; })) { h.setAttribute('data-wo-zl', ''); return; }   /* läuft schon: bleibt ein Block, nie zurückspringen */
      WO_ZEILEN(h);
    });
  }
  new MutationObserver(function () { if (!plan && document.querySelector('.wo-sb__h:not([data-wo-zl])')) { plan = 1; Promise.resolve().then(teile); } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
