/* kleid/ihrhaus.js · Hauswerte für oberflaeche.js (Ihr Haus, ein Speicher von 1888 am Sandtorkai, Hamburg; Vorführung).
   Im <head> VOR allen Stilen laden (ohne defer), nach ../_kleid/demo.js. Rahmen «Die Bühne»: Kopf in Nacht, Raum in Leinen.
   Fotos, Schriften und Zeichen kommen nur aus ../_haus/ (img/<schlüssel>-<breite>.webp, fonts/, marke/). Namen der Werkzeuge aus window.HAUS.WERKZEUGE. */
window.WO_HAUS = { kurz: 'ihrhaus', name: 'Ihr Haus', voll: 'Ihr Haus · Am Hafen', ort: 'Am Hafen · Hamburg', welt: 'stadt', rahmen: 'buehne', anrede: 'sie',
  /* Aussenfoto des Startbilds: der Speicher vom Wasser aus in der Dämmerung (Bildregister _haus/img/bilder.json, Schlüssel «s-aussen-wasser») */
  foto: '../_haus/img/s-aussen-wasser-1400.webp', fotoKlein: '../_haus/img/s-aussen-wasser-800.webp', fotoFarbe: '#2b2a2c',
  /* Zeichen im Ring: der Hafenkran als Linie (_haus/marke/zeichen.svg); die Wortmarke unter wortmarke */
  zeichen: '../_haus/marke/zeichen.svg', zeichenMass: 1, wortmarke: '../_haus/marke/wortmarke.svg', wortmarkeMass: 9.79,
  /* Namen der sieben Werkzeuge nach dem Zweck: die EINE Stelle ist window.HAUS.WERKZEUGE (haus.py); Ordner und Schlüssel bleiben */
  namen: (function () { var W = (window.HAUS && HAUS.WERKZEUGE) || []; var k = ['zentrale', 'website', 'karten', 'gaeste', 'marke', 'druck', 'besuche'], n = {};
    k.forEach(function (x, i) { if (W[i]) n[x] = W[i][0]; }); return n; })(),
  saetze: { zentrale: 'Der Überblick: alle Werkzeuge und der Stand des Hauses.',
    website: 'Texte, Preise, Zeiten und Fotos auf jeder Seite ändern.',
    karten: 'Tafel, Frühstück, Bar und Wochenmenü als Karte und PDF.',
    gaeste: 'Anfragen aus der Website und Antwortbriefe im Ton des Hauses.',
    marke: 'Bilder, Logo, Farben und Schriften des Hauses an einem Ort.',
    besuche: 'Wer die Website öffnet, woher, wie lange, was zur Buchung führt.',
    druck: 'Briefpapier, Tischkarten, Kofferetiketten, Aushänge und Feed.' },
  /* Wege zu den anderen Werkzeugen: Nachbarordner der Vorführung, nie zur Website */
  wege: { zentrale: '../giebel/index.html', website: '../kontor/index.html', karten: '../lagerbuch/index.html', gaeste: '../winde/index.html', marke: '../musterkammer/index.html', besuche: '../logbuch/index.html', druck: '../werkstatt/index.html' } };
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge: bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
(function () {
  var me = document.currentScript, s = document.createElement('script');
  s.src = (me && me.src ? new URL('../bewegung.js', me.src).href : 'oberflaeche/bewegung.js') + '?v=3';   /* Fassung hochzählen, wenn bewegung.js sich ändert */
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
