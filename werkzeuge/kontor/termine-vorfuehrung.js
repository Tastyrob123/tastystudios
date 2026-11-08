/* termine-vorfuehrung.js · Website bearbeiten (Ihr Haus), Vorführung: die Termine der Tafel im Arbeitsspeicher.
   Nachbau des Servers der Vorlage für die Ansicht «Termine» (termine.py: lage, speichern, veroeffentlichen, verwerfen, zurueckholen, pruefung),
   dieselben Antworten, dieselben Stichworte. termine-ansicht.js ruft statt fetch() WS_TERMINE(methode, weg, daten).
   Die Abende: die Tafel von Ihr Haus, Donnerstag bis Samstag ab 19 Uhr, fünf Gänge zu 89 €, 28 Plätze (Ihr Haus/haus.py › TAFEL).
   Nichts wird gespeichert: neu laden stellt den Anfang wieder her. Vor termine-ansicht.js laden. */
(function () {
  'use strict';
  var HOECHSTENS = 40;
  function abend(datum, gebucht) { return { id: 'a-' + datum.slice(5).replace('-', ''), datum: datum, zeit: '19:00', preis: 89, plaetze: 28, gebucht: gebucht }; }
  /* Wie die Website gebaut ist: die Abende im November */
  var URSPRUNG = [abend('2026-11-05', 22), abend('2026-11-06', 26), abend('2026-11-07', 27), abend('2026-11-12', 16), abend('2026-11-13', 21), abend('2026-11-14', 0),
    abend('2026-11-19', 12), abend('2026-11-20', 17), abend('2026-11-21', 19), abend('2026-11-26', 6), abend('2026-11-27', 9), abend('2026-11-28', 14)];
  function mit(liste, aenderung) { return liste.map(function (t) { var n = JSON.parse(JSON.stringify(t)); return aenderung[t.id] ? Object.assign(n, aenderung[t.id]) : n; }); }
  /* Frühere Veröffentlichungen, älteste zuerst; die letzte ist der Stand auf der Website */
  var V1 = mit(URSPRUNG, {});
  var V2 = mit(URSPRUNG, { 'a-1114': { gebucht: 28 } });
  var V3 = V2.concat([abend('2026-12-03', 4), abend('2026-12-04', 2), abend('2026-12-05', 8)]);
  var VERLAUF = [
    { zeit: '2026-10-01T10:20:00', art: 'veroeffentlicht', notiz: 'Abende im November', termine: V1 },
    { zeit: '2026-10-15T16:45:00', art: 'veroeffentlicht', notiz: 'Am 14. November die ganze Tafel vergeben', termine: V2 },
    { zeit: '2026-10-29T09:15:00', art: 'veroeffentlicht', notiz: 'Erste Abende im Dezember', termine: V3 }];
  var SP;
  function kopie(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function anfang() { SP = { entwurf: null, stand: kopie(V3), verlauf: kopie(VERLAUF), protokoll: [] }; }
  anfang();

  function Fehler(status, stichwort, fehler) { return { status: status, stichwort: stichwort, fehler: fehler }; }
  function sortiert(x) { if (Array.isArray(x)) return x.map(sortiert); if (x && typeof x === 'object') { var o = {}; Object.keys(x).sort().forEach(function (k) { o[k] = sortiert(x[k]); }); return o; } return x; }
  function fingerabdruck(l) { var s = JSON.stringify(sortiert(l)), h = 5381, i; for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return ('00000000' + h.toString(16)).slice(-8) + ('0000' + (s.length % 65536).toString(16)).slice(-4); }
  function gleich(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function jetzt() { var d = new Date(), z = function (n) { return ('0' + n).slice(-2); }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()); }
  function gibtTag(d) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(d); if (!m) return false; var x = new Date(+m[1], +m[2] - 1, +m[3]); return x.getFullYear() === +m[1] && x.getMonth() === +m[2] - 1 && x.getDate() === +m[3]; }

  function pruefeEinen(t, i) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) throw Fehler(400, 'termin-falsch', 'TERMIN · Ein Eintrag ist kein Termin.');
    var nr = 'Termin ' + (i + 1) + ': ', tid = String(t.id || '');
    if (!/^[a-z0-9-]{1,24}$/.test(tid)) throw Fehler(400, 'termin-falsch', 'TERMIN · ' + nr + 'Kennung fehlt.');
    var d = String(t.datum || '');
    if (!gibtTag(d)) throw Fehler(400, 'termin-datum', 'DATUM · ' + nr + 'Das Datum fehlt oder gibt es nicht.');
    var z = String(t.zeit || '');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(z)) throw Fehler(400, 'termin-zeit', 'BEGINN · ' + nr + 'Bitte die Uhrzeit als Stunden und Minuten, zum Beispiel 19:00.');
    var preis = parseFloat(t.preis), plaetze = parseInt(t.plaetze, 10), gebucht = parseInt(t.gebucht || 0, 10);
    if (isNaN(preis) || isNaN(plaetze) || isNaN(gebucht)) throw Fehler(400, 'termin-zahl', 'ZAHL · ' + nr + 'Preis und Plätze brauchen eine Zahl.');
    if (!(preis > 0 && preis <= 999) || Math.round(preis * 100) !== preis * 100) throw Fehler(400, 'termin-preis', 'PREIS · ' + nr + 'Der Preis liegt zwischen 1 und 999 Euro, höchstens mit Cent.');
    if (!(plaetze >= 1 && plaetze <= 40)) throw Fehler(400, 'termin-plaetze', 'PLÄTZE · ' + nr + 'Ein Abend hat zwischen 1 und 40 Plätze.');
    if (!(gebucht >= 0 && gebucht <= plaetze)) throw Fehler(400, 'termin-plaetze', 'PLÄTZE · ' + nr + 'Es sind mehr Plätze vergeben, als der Abend hat.');
    return { id: tid, datum: d, zeit: z, preis: preis, plaetze: plaetze, gebucht: gebucht };
  }
  function pruefe(liste) {
    if (!Array.isArray(liste)) throw Fehler(400, 'termin-falsch', 'TERMIN · Die Anfrage enthält keine Liste von Terminen.');
    if (liste.length > HOECHSTENS) throw Fehler(400, 'termin-viele', 'TERMINE · Höchstens ' + HOECHSTENS + ' Termine stehen gleichzeitig auf der Website.');
    var aus = liste.map(pruefeEinen), ids = {}, wann = {};
    aus.forEach(function (t) { ids[t.id] = 1; wann[t.datum + ' ' + t.zeit] = 1; });
    if (Object.keys(ids).length !== aus.length) throw Fehler(400, 'termin-falsch', 'TERMIN · Zwei Termine tragen dieselbe Kennung.');
    if (Object.keys(wann).length !== aus.length) throw Fehler(400, 'termin-doppelt', 'DOPPELT · Zwei Termine stehen am selben Tag zur selben Zeit.');
    return aus.sort(function (a, b) { return (a.datum + a.zeit) < (b.datum + b.zeit) ? -1 : (a.datum + a.zeit) > (b.datum + b.zeit) ? 1 : 0; });
  }

  function lage() {
    var stand = SP.stand, entwurf = SP.entwurf, zuletzt = null;
    SP.verlauf.forEach(function (v) { if (v.art === 'veroeffentlicht') zuletzt = v; });
    return { ursprung: kopie(URSPRUNG), stand: kopie(stand), entwurf: kopie(entwurf), wartet: entwurf != null && !gleich(entwurf, stand),
      kennung: fingerabdruck(entwurf != null ? entwurf : stand), zuletzt: kopie(zuletzt),
      verlauf: SP.verlauf.map(function (v, i) { return { nr: i, zeit: v.zeit, art: v.art, notiz: v.notiz || '', zahl: v.termine.length }; }).reverse(),
      quelle: 'die Tafel der Website, Donnerstag bis Samstag ab 19 Uhr' };
  }
  function mitLage(o) { var l = lage(); Object.keys(o).forEach(function (k) { l[k] = o[k]; }); return l; }
  function bewache(erwartet) {
    var l = lage();
    if (erwartet !== l.kennung) throw Fehler(409, 'konflikt', 'KONFLIKT · In einem anderen Fenster wurden die Termine inzwischen geändert. Die Liste lädt neu, Ihre Eingaben bleiben stehen.');
    return l;
  }
  function protokoll(was) { SP.protokoll = SP.protokoll.concat([{ zeit: jetzt(), wer: 'Ihr Haus', was: was }]).slice(-400); }

  function speichern(d) {
    var l = bewache(d.erwartet), neu = pruefe(d.termine), alt = l.entwurf != null ? l.entwurf : l.stand;
    if (gleich(neu, alt)) return mitLage({ nichts: true, meldung: 'Nichts geändert, nichts gespeichert.' });
    SP.entwurf = gleich(neu, l.stand) ? null : neu;
    protokoll('Termine im Entwurf gespeichert');
    return mitLage({ vorher: alt });
  }
  function veroeffentlichen(d) {
    var l = bewache(d.erwartet);
    if (!l.wartet) return mitLage({ nichts: true, meldung: 'Nichts geändert, nichts veröffentlicht.' });
    SP.stand = SP.entwurf; SP.entwurf = null;
    SP.verlauf = SP.verlauf.concat([{ zeit: jetzt(), art: 'veroeffentlicht', notiz: String(d.notiz || '').slice(0, 200), termine: kopie(SP.stand) }]).slice(-60);
    protokoll('Termine veröffentlicht');
    setTimeout(function () { if (window.DEMO) DEMO.hinweis('Vorführung: Es ging nichts online. Die Vorschau zeigt, wie die Website jetzt aussähe.'); }, 600);
    return lage();
  }
  function verwerfen(d) {
    bewache(d.erwartet);
    var vorher = SP.entwurf; SP.entwurf = null;
    protokoll('Entwurf der Termine verworfen');
    return mitLage({ vorher: vorher });
  }
  function zurueckholen(d) {
    var l = bewache(d.erwartet), t;
    if (d.nr === 'ursprung') t = l.ursprung;
    else { var v = SP.verlauf[parseInt(d.nr, 10)]; if (!v) throw Fehler(404, 'fassung-unbekannt', 'FASSUNG · Diese frühere Fassung gibt es nicht.'); t = kopie(v.termine); }
    SP.entwurf = gleich(t, l.stand) ? null : t;
    protokoll('Frühere Fassung der Termine in den Entwurf geholt');
    return lage();
  }
  function pruefung() {
    return [{ gut: true, titel: 'Termine der Website', text: URSPRUNG.length + ' Termine der Tafel gelesen.' },
      { gut: true, titel: 'Speicher der Termine', text: 'lesbar, Sicherung der letzten guten Fassung liegt daneben.' }];
  }

  function bearbeite(methode, weg, d) {
    if (methode === 'GET' && weg === '') return lage();
    if (methode === 'GET' && weg === 'pruefung') return { punkte: pruefung() };
    d = d || {};
    if (methode === 'POST' && weg === 'speichern') return speichern(d);
    if (methode === 'POST' && weg === 'veroeffentlichen') return veroeffentlichen(d);
    if (methode === 'POST' && weg === 'verwerfen') return verwerfen(d);
    if (methode === 'POST' && weg === 'zurueckholen') return zurueckholen(d);
    throw Fehler(404, 'nicht-gefunden', 'Nicht gefunden');
  }
  /* wie WS_RUF: Antwort nach einem Augenblick, Fehler als {status, stichwort, fehler} */
  window.WS_TERMINE = function (methode, weg, daten) {
    return new Promise(function (ja, nein) {
      setTimeout(function () {
        try { ja(kopie(bearbeite(methode, weg || '', kopie(daten)))); }
        catch (e) { if (e && e.status) nein(e); else { if (window.console) console.error(e); nein(Fehler(500, 'unerwartet', 'Unerwarteter Fehler: ' + (e && e.message || e))); } }
      }, methode === 'GET' ? 40 : 160);
    });
  };
  window.WS_TERMINE.zuruecksetzen = anfang;
})();
