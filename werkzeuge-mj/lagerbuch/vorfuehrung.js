/* Speisekarten · Maloja — Vorführ-Betrieb. Statt des Servers der Vorlage (carte.py über serve.py) beantwortet LB_API dieselben Wege im
   Arbeitsspeicher: status, karte, entwurf, verwerfen, probe, veroeffentlichen, verlauf, version, zurueckholen, protokoll, gesund, einstellungen.
   Nichts wird gespeichert, gesendet oder gedruckt; nach dem Neuladen ist alles wie vorher (window.LB_DATEN aus daten.js bleibt unberührt). */
(function () {
  'use strict';
  var D0 = window.LB_DATEN || { reihe: [], karten: {} };
  var kopie = function (x) { return JSON.parse(JSON.stringify(x)); };
  var S, E, V, P, BAU, EINST;
  function jetzt() { var d = new Date(), z = function (n) { return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()); }
  function deutsch(t) { return t ? t.slice(8, 10) + '.' + t.slice(5, 7) + '.' + t.slice(0, 4) + ' ' + t.slice(11, 16) : ''; }
  function anfang() {
    S = {}; E = {}; V = {}; P = {}; BAU = { laeuft: false, schritt: '', schritte: [], fehler: '', fertig: '', bericht: {} }; EINST = { anschluss_pdf: false, demo: true };
    D0.reihe.forEach(function (z) {
      S[z] = kopie(D0.karten[z]); V[z] = [];
      P[z] = (D0.nie || []).indexOf(z) >= 0 ? '' : deutsch(S[z].veroeffentlicht);
    });
    (D0.entwurf || []).forEach(function (z) { if (S[z]) E[z] = kopie(S[z]); });
  }
  anfang();
  var inhalt = function (d) { return JSON.stringify({ seiten: d.seiten, abend: d.abend, css: d.css }); };
  var PROTO = [
    { zeit: '2026-11-02 16:30:12', wer: 'Lena', rolle: 'direktion', was: 'entwurf', karte: 'feier-stube', text: 'Menü für Familie Brandt angelegt' },
    { zeit: '2026-11-02 09:40:03', wer: 'Marc', rolle: 'kueche', was: 'veroeffentlicht', karte: 'woche', seiten: 1 },
    { zeit: '2026-10-27 10:12:44', wer: 'Marc', rolle: 'kueche', was: 'veroeffentlicht', karte: 'menue-herbst', seiten: 1 },
    { zeit: '2026-10-20 11:02:10', wer: 'Lena', rolle: 'direktion', was: 'veroeffentlicht', karte: 'bar', seiten: 1 }
  ];
  function merke(was, z, mehr) { PROTO.unshift(Object.assign({ zeit: jetzt(), wer: 'Team Maloja', rolle: 'direktion', was: was, karte: z }, mehr || {})); }
  function fehler(text, stichwort, status) { var e = new Error(text); e.stichwort = stichwort || ''; e.status = status || 400; return e; }
  function liste() {
    return D0.reihe.filter(function (z) { return S[z]; }).map(function (z) {
      var s = S[z], e = E[z];
      return { live: !!P[z], ziel: z, name: s.name, unter: s.unter || '', gruppe: s.gruppe || '', art: s.art, format: s.format,
        seiten: s.art === 'abend' ? 1 : (s.seiten || []).filter(function (x) { return !x.aus; }).length, ab: (s.abend || {}).ab || s.ab || '',
        entwurf: !!e && inhalt(e) !== inhalt(s), entwurf_zeit: e ? (e.gespeichert || '') : '', entwurf_wer: e ? (e.wer || '') : '',
        pdf_zeit: P[z], stand_zeit: s.veroeffentlicht || '', stand_wer: s.wer || '', verlauf: V[z].length };
    });
  }
  var SCHRITTE = ['Der Entwurf wird geprüft', 'Die Karte wird gesetzt und gedruckt', 'PDF und Daten werden verglichen', 'Die neue Fassung wird übernommen'];
  function woerter(d) { return JSON.stringify(d.seiten || d.abend || '').replace(/<[^>]+>|"fn"|"el"|"a"/g, ' ').split(/\s+/).filter(function (w) { return /\p{L}/u.test(w); }).length; }
  function veroeffentlichen(z) {
    var e = E[z], s = S[z];
    if (BAU.laeuft) throw fehler('Gerade wird schon eine Karte veröffentlicht. Bitte kurz warten.', 'BAU', 409);
    if (!e || inhalt(e) === inhalt(s)) return { ok: true, geaendert: false };
    BAU = { laeuft: true, ziel: z, schritt: SCHRITTE[0], schritte: SCHRITTE, fehler: '', fertig: '', bericht: {} };
    var i = 0;
    (function weiter() {
      i++;
      if (i < SCHRITTE.length) { BAU.schritt = SCHRITTE[i]; setTimeout(weiter, 900); return; }
      var alt = kopie(s); alt.datei = jetzt().replace(/\D/g, '').slice(0, 8) + '-' + jetzt().replace(/\D/g, '').slice(8, 14) + '.json';
      V[z].unshift(alt);
      S[z] = Object.assign(kopie(e), { veroeffentlicht: jetzt(), wer: 'Team Maloja' }); delete S[z].gespeichert;
      delete E[z]; P[z] = deutsch(jetzt());
      var n = S[z].art === 'abend' ? 1 : S[z].seiten.filter(function (x) { return !x.aus; }).length, w = woerter(S[z]);
      BAU = { laeuft: false, schritt: '', schritte: SCHRITTE, fehler: '', fertig: n + ' Seite' + (n === 1 ? '' : 'n') + ', ' + w + ' Wörter geprüft', bericht: { woerter: w, mass: [92, 100], anschluss: 'demo' } };
      merke('veroeffentlicht', z, { seiten: n, woerter: w });
      if (window.DEMO) DEMO.hinweis('Vorführung: Es entsteht keine PDF und nichts geht auf die Website. So würde die neue Karte überall stehen.');
    })();
    setTimeout(function () {}, 0);
    return { ok: true, gestartet: true };
  }
  function get(was, q) {
    var z = q.z || '';
    if (was === 'status') return { karten: liste(), bau: kopie(BAU), einstellungen: kopie(EINST), rollen: { kueche: 'Küche', service: 'Service', direktion: 'Direktion' }, rechte: { veroeffentlichen: ['direktion', 'kueche'] } };
    if (!S[z] && /^(karte|verlauf|version|grundstand)$/.test(was)) throw fehler('Diese Karte gibt es nicht.', 'KARTE', 404);
    if (was === 'karte') { var e = E[z]; return { stand: kopie(S[z]), entwurf: e && inhalt(e) !== inhalt(S[z]) ? kopie(e) : null, entwurf_zeit: e ? (e.gespeichert || '') : '', entwurf_wer: e ? (e.wer || '') : '' }; }
    if (was === 'grundstand') return kopie(D0.karten[z]);
    if (was === 'verlauf') return { liste: V[z].map(function (x) { return { datei: x.datei, art: 'stand', zeit: x.veroeffentlicht || '', wer: x.wer || '', pdf: true }; }) };
    if (was === 'version') { if (q.datei === 'grundstand') return kopie(D0.karten[z]); var f = V[z].filter(function (x) { return x.datei === q.datei; })[0]; if (!f) throw fehler('Diese Fassung gibt es nicht.', 'DATEI', 404); return kopie(f); }
    if (was === 'protokoll') return { liste: PROTO.filter(function (x) { return !z || x.karte === z; }).slice(0, 80) };
    if (was === 'gesund') { var k = {}; D0.reihe.forEach(function (x) { k[x] = !!S[x]; }); return { ok: true, karten: k, werkzeug: { node: true, pdftotext: true, playwright: true }, speicher_mb: 0.4, seit: Math.round(performance.now() / 1000), fehler: [], browserfehler: [] }; }
    if (was === 'export') { DEMO.hinweis('In der Vorführung entsteht keine Datei.'); return {}; }
    if (was === 'pruefung') return { seit: Math.round(performance.now() / 1000), online: true, vorfuehrung: true, speicher_mb: 0.4, bau: kopie(BAU),
      kartenliste: liste().map(function (k) { return { ziel: k.ziel, name: k.name, lesbar: true, entwurf: k.entwurf, stand: k.stand_zeit, verlauf: k.verlauf, grundstand: true }; }),
      werkzeug: { druck: true, pdfpruefung: true }, sicherungen: [], fehler: [], browserfehler: [] };
    throw fehler('Unbekannte Anfrage.', 'WEG', 404);
  }
  function post(was, d) {
    var z = d.z || '';
    if (was === 'entwurf') {
      var alt = E[z] || S[z];
      if (alt && inhalt(alt) === inhalt(d.daten)) return { ok: true, geaendert: false, zeit: alt.gespeichert || alt.veroeffentlicht || '' };
      var neu = Object.assign(kopie(d.daten), { gespeichert: jetzt(), wer: 'Team Maloja' }); delete neu.veroeffentlicht;
      E[z] = neu; merke('entwurf', z, { text: String(d.was || '').slice(0, 200) });
      return { ok: true, geaendert: true, zeit: neu.gespeichert };
    }
    if (was === 'verwerfen') { if (E[z]) { var v = kopie(E[z]); delete E[z]; merke('verworfen', z); void v; } return { ok: true }; }
    if (was === 'probe') { var x = E[z] || S[z]; merke('probe', z); return { ok: true, url: '', seiten: x.art === 'abend' ? 1 : x.seiten.filter(function (y) { return !y.aus; }).length, art: E[z] ? 'entwurf' : 'stand', mass: [100], warn: [] }; }
    if (was === 'veroeffentlichen') return veroeffentlichen(z);
    if (was === 'zurueckholen') { var f = get('version', { z: z, datei: d.datei }); ['veroeffentlicht', 'gespeichert', 'wer', 'datei'].forEach(function (k) { delete f[k]; }); return post('entwurf', { z: z, daten: f, was: 'Fassung in den Entwurf geholt' }); }
    if (was === 'einstellungen') { EINST.anschluss_pdf = false; DEMO.hinweis('In der Vorführung bleibt die Website, wie sie ist.'); return { ok: true }; }
    if (was === 'reparatur') return { ok: true, text: 'Vorführung: Diese Reparatur liefe im echten Werkzeug jetzt. Hier ändert sich nichts.' };
    if (was === 'fehler') return { ok: true };
    throw fehler('Unbekannte Anfrage.', 'WEG', 404);
  }
  /* api(was, daten) wie in der Vorlage: ohne daten lesen (GET), mit daten schreiben (POST); kurze Pause wie ein Server, Antworten als Kopie */
  window.LB_API = function (was, daten) {
    return new Promise(function (ok, nein) {
      setTimeout(function () {
        try {
          var t = String(was).split('?'), q = {};
          (t[1] || '').split('&').forEach(function (p) { if (!p) return; var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
          ok(daten === undefined ? get(t[0], q) : post(t[0], kopie(daten)));
        } catch (e) { nein(e); }
      }, daten === undefined ? 30 : 90);
    });
  };
  window.LB_API.anfang = anfang;
})();
