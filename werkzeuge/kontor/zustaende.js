/* zustaende.js · Website bearbeiten (Ihr Haus), Vorführung: Sprungadressen für das Atelier (index.html#<zustand>, Liste in ZUSTAENDE.md).
   Vor website.js laden: die Adresse wird in die Ansicht der Vorlage übersetzt (?ansicht=…), die das Werkzeug beim Start liest.
   Zustände mit einer offenen Stelle, einem Fenster oder einem Beispiel-Entwurf werden nach dem Start mit denselben Wegen hergestellt, die ein Klick nimmt. */
(function () {
  'use strict';
  var ANSICHT = { uebersicht: 'start', startseite: 'b:start', 'seite-zimmer': 'b:zimmer', tafel: 'b:tafel', anreise: 'b:anreise', kontakt: 'b:kontakt', impressum: 'b:recht',
    'zeiten-preise': 'zahlen', angaben: 'angaben', google: 'google', hinweis: 'hinweis', zimmer: 'haus:zimmer', entwurf: 'entwurf', verlauf: 'verlauf', termine: 'e:termine',
    stelle: 'b:start', foto: 'b:start', vergleich: 'entwurf', veroeffentlichen: 'entwurf' };
  var z = location.hash.slice(1);
  if (!ANSICHT[z]) return;
  try { history.replaceState(null, '', location.pathname + '?ansicht=' + encodeURIComponent(ANSICHT[z]) + location.hash); } catch (e) { return; }
  if (z === 'vergleich' || z === 'veroeffentlichen') WS_VORFUEHRUNG.beispiel();

  function warte(probe, dann, n) {
    n = n || 0;
    var x = probe();
    if (x) return dann(x);
    if (n < 120) setTimeout(function () { warte(probe, dann, n + 1); }, 100);
  }
  function vorschauBereit() {   // die Seite steht in der Vorschau, die Marken sind gesetzt
    var f = document.querySelector('.ws-rahmen iframe'), lage = document.querySelector('.ws-vorschau__lage');
    return f && lage && lage.hidden && f.contentDocument && f.contentDocument.querySelector('[data-ws-e]') ? f : null;
  }
  function ausDerSeite(f, nachricht) { f.contentWindow.Function('d', 'parent.postMessage(d, "*")')(nachricht); }   // als käme der Klick aus der Seite
  if (z === 'stelle') warte(vorschauBereit, function (f) {
    var t = f.contentDocument.querySelector('h1 [data-ws-e]');
    ausDerSeite(f, { ws: 'text', h: t.getAttribute('data-ws-e'), n: +t.getAttribute('data-ws-n') });
    warte(function () { return document.querySelector('.ws-ed .ws-text'); }, function (feld) {
      feld.textContent = 'Ein Haus'; feld.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(function () { var ed = document.querySelector('.ws-ed'); if (ed) { ed.scrollIntoView({ block: 'center' }); if (window.innerWidth >= 1180) window.scrollTo(0, 0); } }, 400);   // die offene Stelle steht im Bild
    });
  });
  if (z === 'foto') warte(function () { return document.querySelector('.ws-rahmen iframe'); }, function (f) {   // das Fenster braucht nur die Stelle, nicht die fertig gesetzte Seite
    ausDerSeite(f, { ws: 'bild', b: 'empfang', n: 0 });
    warte(function () { return document.querySelector('[data-ws-fenster] img[loading="lazy"]'); }, function () {   // für das Bild im Atelier: alle Fotos der Wahl sofort geladen
      document.querySelectorAll('[data-ws-fenster] img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
    });
  });
  if (z === 'veroeffentlichen') warte(function () { var k = document.querySelector('#ws-raus'); return k && !k.disabled ? k : null; }, function (k) { k.click(); });
})();
