/* kleid/ihrhaus.js · Hauswerte für oberflaeche.js (Maloja am Hafen, Food-Pairing-Abende «das Team x Rudi» in der Bar Maloja am Hafen, Hamburg; 28.10.2026).
   Im <head> VOR allen Stilen laden (ohne defer). Rahmen «Die Bühne»: Kopf dunkel wie die Nacht der Bar, Raum hell wie das Warmweiss der Plakate.
   Liegt unter _werkzeuge/oberflaeche/ und wird von den Werkzeug-Servern unter oberflaeche/ ausgeliefert (einziger Schreiber: Chat «ihrhaus-maison»).
   Fotos und Schriften kommen aus der Website (/assets/bild/<schlüssel>-<breite>.webp, /assets/schrift/), Wortmarke aus /assets/zeichen/marke.svg. */
window.WO_HAUS = { kurz: 'ihrhaus', name: 'Maloja', voll: 'Maloja, Restaurant in der Speicherstadt', ort: 'Pickhuben · Hamburg', bar: 'Die Bar', welt: 'hotel', rahmen: 'buehne', anrede: 'du',   /* Robert 29.10.2026: das Team wird geduzt */
  /* Aussenfoto des Startbilds: die Fenster der Bar am Abend (Bildregister BILD in website/bau.py, Schlüssel «fassade»; der Bilder-Chat schärft, der Pfad bleibt). 1000 px statt 1600 (29.10.2026): das Startbild ist am Desktop rund 640 px breit, 1000 reicht bei 2×, und wer WO_HAUS.foto vorlädt, lädt dasselbe Bild wie das Startbild */
  foto: '../_haus/img/m-aussen-1400.webp', fotoKlein: '../_haus/img/m-aussen-800.webp', fotoFarbe: '#4c3f3b',   /* Motivfarbe der Fassade als Platzhalter (Mittelwert des Fotos) */
  /* Zeichen im Ring: das «C» der Wortmarke, unverändert aus marke.svg #wm (die Website baut sie aus Rudis Original, website/bau.py LOGO); die ganze Wortmarke unter wortmarke */
  zeichen: '../_haus/marke/zeichen.svg', zeichenMass: 1, wortmarke: '../_haus/marke/wortmarke.svg', wortmarkeMass: 6.44,
  /* Namen der sieben Werkzeuge: die EINE Stelle. Robert 28.10.2026 wählte Satz A «An der Bar» (wörtlich: «a», Namenstafel _Oberchef/zeigen/ihrhaus/namen-tafel.png). 29.10.2026: Robert benennt die Marke um in «Das Markenbuch».
     Dateien, Schlüssel und Adressen bleiben (maison, bureau, carte …). Je Werkzeug dazu sein Satz von der Tafel (saetze). */
  namen: { zentrale: 'Kontrollpanel', website: 'Website bearbeiten', karten: 'Speisekarten', gaeste: 'Anfragen & Chat', marke: 'Markenbuch', besuche: 'Besucher', druck: 'Drucksachen & Feed' },
  saetze: { zentrale: 'Hier beginnt alles: ein Blick auf alle Werkzeuge und ihren Stand.',
    website: 'Die Website selbst pflegen: Texte, Fotos, Abende, Hinweise.',
    karten: 'Gänge und Drinks je Abend schreiben, daraus entstehen Karte und PDF.',
    gaeste: 'Fragen der Gäste zu Abenden, Plätzen und Unverträglichkeiten, mit Antwortentwurf.',
    marke: 'Wortmarke, Fotos, Farben und Schriften des Hauses an einem Ort.',
    besuche: 'Wer die Website besucht: woher, wann, welche Abende, wer reservieren geht.',
    druck: 'Menükarten, Tischkarten, Gutscheine, Aushänge und der Feed in der Sprache des Restaurants.' },
  wege: { zentrale: '../giebel/index.html', website: '../kontor/index.html', karten: '../lagerbuch/index.html', gaeste: '../winde/index.html', marke: '../musterkammer/index.html', besuche: '../logbuch/index.html', druck: '../werkstatt/index.html' },
  /* Prüfserver je Werkzeug (gemeinsamer Auftrag 28.10.2026); Wege zwischen Werkzeugen immer 127.0.0.1, nie localhost (Fehlerbuch 10a) */
  ports: { zentrale: 9081, website: 9082, karten: 9083, gaeste: 9084, marke: 9085, besuche: 9086, druck: 9087, werkbank: 9088, website_lokal: 8765 } };
/* Lokal (Prüfserver je Werkzeug) zeigen die Wege zu den ANDEREN Werkzeugen auf deren eigenen Server unter 127.0.0.1, nie auf den eigenen Port
   (Fund ihrhaus-reception 28.10.2026: der Knopf «La Maison» öffnete /_werkzeuge/maison/ auf 9084 ohne Stand-Wege; Fehlerbuch 10a). Online bleiben sie relativ.
   Wer selbst schon absolute Wege setzt: nur Wege umschreiben, die noch mit «/» beginnen (WO_HAUS.wegeLokal = true zeigt, dass es hier geschah). */
(function () {
  return;   // Vorführung: alle Wege bleiben relativ im Ordner werkzeuge/
  Object.keys(WO_HAUS.wege).forEach(function (k) {
    var p = WO_HAUS.ports[k], w = WO_HAUS.wege[k];
    if (p && String(p) !== location.port && w.charAt(0) === '/') WO_HAUS.wege[k] = 'http://127.0.0.1:' + p + w;
  });
  WO_HAUS.wegeLokal = true;
})();
document.documentElement.setAttribute('data-wo-haus', WO_HAUS.kurz);
document.documentElement.setAttribute('data-wo-rahmen', WO_HAUS.rahmen);
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
/* Bewegung der Werkzeuge (29.10.2026): bewegung.js neben oberflaeche.js, async und mit wenig Vorrang nachgeladen, damit es nie vor dem ersten Knopf steht */
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
