/* Speisekarten · Prüfseite (Vorführung, 1:1 aus La Carte der Vorlage, R23): läuft ohne carte.js. Liest den Zustand aus dem Vorführ-Betrieb (LB_API),
   zeigt Browser, Betrieb, Karten, Druck, Sicherungen und Fehler; Reparaturen mit zwei Klicks (in der Vorführung ändert keine etwas). */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var h = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var zeile = function (t, wert, ok) { return '<div><span>' + h(t) + '</span><b class="' + (ok === true ? 'ja' : ok === false ? 'nein' : '') + '">' + h(wert) + '</b></div>'; };
  var NAME = {};   // Namen der Karten kommen aus den Karten des Hauses (daten.js)
  var W = { node: 'Druck der PDF', playwright: 'Druckprogramm', pdftotext: 'Prüfung der PDF', speicher: 'Speicher', druck: 'Druck der PDF', pdfpruefung: 'Prüfung der PDF' };
  var wer = 'Team Maloja', rolle = 'direktion', lokal = [];   // Robert 20.10.2026: keine Abfrage «Wer arbeitet hier?», fester Eintrag bis zur Auslieferung
  try { lokal = JSON.parse(localStorage.getItem('lc-fehler') || '[]'); } catch (e) { /* ohne Speicher */ }

  var sp = true; try { localStorage.setItem('lc-probe', '1'); localStorage.removeItem('lc-probe'); } catch (e) { sp = false; }
  $('#p-browser').innerHTML = zeile('Verbindungen (fetch)', typeof fetch === 'function' ? 'vorhanden' : 'fehlt', typeof fetch === 'function') +
    zeile('Speicher im Browser (Ansicht)', sp ? 'in Ordnung' : 'gesperrt, das Werkzeug merkt sich nichts', sp) +
    zeile('Eintrag im Protokoll', 'Team Maloja · Direktion (Vorführung, ohne Anmeldung)', true) +
    zeile('Fenster', innerWidth + ' × ' + innerHeight + ' px', true);

  function lade() {
    var t0 = performance.now();
    return window.LB_API('pruefung').then(function (g) {
      $('#p-server').innerHTML = zeile('Antwort (Vorführung im Browser)', Math.round(performance.now() - t0) + ' ms', true) + zeile('Läuft seit', Math.round(g.seit / 60) + ' Minuten', true) +
        zeile('Betrieb', g.vorfuehrung ? 'Vorführung im Browser (nichts wird gespeichert, gewollt)' : g.online ? 'online mit Speicher' : 'auf dem Rechner des Hauses', true) +
        zeile('Daten des Werkzeugs', g.speicher_mb + ' MB', true) +
        zeile('Veröffentlichen', g.bau && g.bau.laeuft ? 'läuft gerade (' + (g.bau.schritt || '') + ')' : (g.bau && g.bau.fehler ? 'zuletzt abgebrochen: ' + g.bau.fehler.slice(0, 120) : 'bereit'), !(g.bau && g.bau.fehler));
      $('#p-karten').innerHTML = (g.kartenliste || []).map(function (k) {
        return zeile(NAME[k.ziel] || k.name, k.lesbar ? (k.entwurf ? 'Entwurf wartet' : 'veröffentlicht') + (k.stand ? ' · Stand ' + k.stand : '') + ' · ' + k.verlauf + ' frühere Fassung' + (k.verlauf === 1 ? '' : 'en') + (k.grundstand ? '' : ' · Ursprung fehlt') : 'nicht lesbar', k.lesbar && k.grundstand);
      }).join('');
      $('#p-druck').innerHTML = Object.keys(g.werkzeug || {}).map(function (k) { return zeile(W[k] || k, g.werkzeug[k] ? 'in Ordnung' : 'fehlt', !!g.werkzeug[k]); }).join('') + (g.online ? '' : zeile('Gedruckte Proben', g.probe_pdfs + ' PDF', true));
      var s = g.sicherungen || [];
      $('#p-sich').innerHTML = g.online ? zeile('Sicherung', 'Speicher online; jede Veröffentlichung bleibt unter «Frühere Fassungen»', true)
        : zeile('Letzte tägliche Sicherung', s.length ? s[0].datei.replace('.tar.gz', '') + ' · ' + s[0].mb + ' MB' : 'keine', s.length > 0) + zeile('Aufbewahrt', s.length + ' von höchstens 14 Tagen', s.length > 0) + zeile('Kopie ausserhalb des Rechners', 'nicht eingerichtet', false);
      var f = (g.fehler || []).slice().reverse().map(function (x) { return zeile('Server', x.slice(0, 220), false); })
        .concat((g.browserfehler || []).map(function (x) { return zeile('Browser · ' + x.zeit + (x.seite ? ' · ' + x.seite : ''), x.text, false); }))
        .concat(lokal.slice(-5).reverse().map(function (x) { return zeile('Dieser Browser · ' + String(x.zeit).slice(0, 19).replace('T', ' '), x.text, false); }));
      $('#p-fehler').innerHTML = f.join('') || zeile('Fehler', 'keine mitgeschrieben', true);
    }).catch(function (e) {
      $('#p-server').innerHTML = zeile('Antwort des Servers', 'keine: ' + e.message, false);
      $('#p-fehler').innerHTML = lokal.slice(-5).reverse().map(function (x) { return zeile('Dieser Browser · ' + String(x.zeit).slice(0, 19).replace('T', ' '), x.text, false); }).join('') || zeile('Fehler', 'keine im Browser', true);
    });
  }
  lade();

  var scharf = null, uhr = 0;
  $('#p-rep').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-rep]'); if (!b) return;
    if (scharf !== b) {
      if (scharf) { scharf.removeAttribute('data-scharf'); scharf.textContent = scharf.dataset.t; }
      scharf = b; b.dataset.t = b.dataset.t || b.textContent; b.setAttribute('data-scharf', ''); b.textContent = 'Noch einmal klicken';
      clearTimeout(uhr); uhr = setTimeout(function () { if (scharf) { scharf.removeAttribute('data-scharf'); scharf.textContent = scharf.dataset.t; scharf = null; } }, 5000);
      return;
    }
    clearTimeout(uhr); b.removeAttribute('data-scharf'); b.textContent = b.dataset.t; scharf = null;
    window.LB_API('reparatur', { art: b.dataset.rep, wer: wer, rolle: rolle })
      .then(function (j) { $('#p-quit').textContent = j.text || 'Erledigt.'; if (b.dataset.rep === 'fehler') { try { localStorage.removeItem('lc-fehler'); lokal = []; } catch (e) { /* egal */ } } lade(); })
      .catch(function (e) { $('#p-quit').textContent = 'Nicht ausgeführt: ' + e.message; });
  });
})();
