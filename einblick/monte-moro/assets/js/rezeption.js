/* Hotel Monte-Moro · Rezeption im Chat, Probe ohne KI (Regel 54: keine KI-Aufrufe vor der Kostenrunde).
   Antwortet aus den Fragen und Antworten des Hauses (assets/js/wissen.json, gebaut von bau.py aus inhalt/daten.py, jede Antwort aus den Seiten des Hauses).
   Suche: Worte der Frage gegen Frage und Antwort jedes Eintrags, seltene Worte zählen mehr. Findet sich nichts Passendes, geht die Frage an die Rezeption.
   Das Eingabefeld bricht um und wächst bis fünf Zeilen, Enter sendet, Umschalt+Enter macht eine neue Zeile. Nichts wird verschickt. */
(function () {
  'use strict';
  var knopf = document.querySelector('[data-chat-auf]'), box = document.querySelector('[data-chat]'); if (!knopf || !box) return;
  var verlauf = box.querySelector('[data-chat-verlauf]'), form = box.querySelector('[data-chat-form]'), feld = box.querySelector('[data-chat-feld]'), vorschlag = box.querySelector('[data-chat-vorschlag]');
  var W = null, IDF = {}, laden = null;
  var STOP = 'der die das und oder ist sind ein eine einen einem einer im in am an auf aus bei mit für von zu zum zur den dem des wie was wer wo ich sie wir es kann können gibt gibt’s gibt es hat haben man mein meine ihr ihre ihren noch auch nicht nur sehr bitte monte moro hotel'.split(' ');
  function norm(t) { return String(t).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9 ]+/g, ' '); }
  /* Alltagsworte der Gäste auf die Worte der Antworten des Hauses (Hund → Haustiere, Auto → Parkplatz …) */
  var NAH = { pools: 'pool', hunde: 'hund', tier: 'hund', tiere: 'hund', parken: 'parkplatz', auto: 'parkplatz', mietwagen: 'parkplatz', kind: 'kinder', baby: 'kinder', wohnung: 'ferienwohnung', bahn: 'zug', postauto: 'postauto zug', wellness: 'spa', sauna: 'spa', pool: 'spa', fliege: 'flughafen', flug: 'flughafen', airport: 'flughafen', taxi: 'transfer', essen: 'restaurant', abendessen: 'restaurant', schwimmbad: 'pool', schwimmen: 'pool', hochzeit: 'hochzeiten', anreise: 'check in', abreise: 'check out', einchecken: 'check in', auschecken: 'check out', oeffnet: 'geoeffnet oeffnungszeiten', offen: 'geoeffnet oeffnungszeiten', massage: 'massage spa', auf: 'geoeffnet', darf: 'erlaubt', duerfen: 'erlaubt', heiraten: 'hochzeiten' };
  var THEMA = ['spa', 'roesti', 'raclet', 'fruehs', 'kinder', 'kidscl', 'hund', 'parkpl', 'wein', 'ferien', 'apollo', 'arizon', 'alpenh', 'kurtax', 'euro', 'zug', 'auto', 'bergba', 'postau', 'cordon'];
  function worte(t) { var aus = []; norm(t).split(/\s+/).forEach(function (w) { if (w.length > 2 && STOP.indexOf(w) < 0) { aus.push(w); if (NAH[w]) NAH[w].split(' ').forEach(function (x) { aus.push(x); }); } }); return aus.map(function (w) { return w.length > 6 ? w.slice(0, 6) : w; }); }
  function hol() {
    if (laden) return laden;
    laden = fetch('assets/js/wissen.json').then(function (r) { return r.json(); }).then(function (d) {
      W = d; var df = {};
      d.eintraege.forEach(function (e) { e._q = worte(e.q); e._a = worte(e.a); var s = {}; e._q.concat(e._a).forEach(function (w) { s[w] = 1; }); Object.keys(s).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
      var N = d.eintraege.length; Object.keys(df).forEach(function (w) { IDF[w] = Math.log(1 + N / df[w]); }); ['wann', 'check'].forEach(function (w) { if (IDF[w]) IDF[w] *= 0.35; }); /* Fragewort und «Check» allein tragen keine Antwort */
      return d;
    });
    return laden;
  }
  function suche(frage) {
    var f = worte(frage), treffer = [];
    if (!f.length) return [];
    /* nur Einträge, deren Frage mindestens ein Wort der Gastfrage teilt: lieber an die Rezeption verweisen als falsch antworten */
    W.eintraege.forEach(function (e) { var s = 0, inFrage = 0; /* jedes Themawort der Gastfrage (Spa, Pool …), das das Haus kennt, muss im Eintrag vorkommen */ if (f.some(function (w) { return THEMA.indexOf(w) >= 0 && e._q.indexOf(w) < 0 && e._a.indexOf(w) < 0; })) return; f.forEach(function (w) { var g = IDF[w] || 1; if (e._q.indexOf(w) >= 0) { s += 2.2 * g; inFrage += g; } else if (e._a.indexOf(w) >= 0) s += g; }); if (inFrage >= 1.5) { e._q.forEach(function (w) { if (f.indexOf(w) < 0 && (IDF[w] || 1) > 3) s -= 0.5 * (IDF[w] || 1); }); /* fremde Worte der Hausfrage (z. B. «barrierefrei») kosten */ treffer.push({ e: e, s: s / Math.sqrt(4 + e._q.length) }); } });
    treffer.sort(function (a, b) { return b.s - a.s; });
    return treffer;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nachricht(html, wer) { var m = document.createElement('div'); m.className = 'chat__m chat__m--' + wer; m.innerHTML = html; verlauf.insertBefore(m, vorschlag); verlauf.scrollTop = verlauf.scrollHeight; }
  function vorschlaege(liste) { vorschlag.innerHTML = liste.map(function (q) { return '<button type="button">' + esc(q) + '</button>'; }).join(''); }
  function antworte(frage) {
    nachricht('<p>' + esc(frage) + '</p>', 'gast');
    hol().then(function () {
      var t = suche(frage);
      if (t.length && t[0].s > 1.1) {
        var e = t[0].e;
        nachricht('<p>' + esc(e.a) + '</p><small>Aus «' + esc(e.k) + '» · Haben wir Ihre Frage beantwortet?</small>', 'haus');
        vorschlaege(t.slice(1, 4).map(function (x) { return x.e.q; }));
      } else {
        nachricht('<p>Dazu steht in unseren Antworten nichts Genaues. Die Rezeption hilft Ihnen gern weiter: <a href="tel:' + W.telefon.replace(/\s/g, '') + '">' + esc(W.telefon) + '</a> oder <a href="mailto:' + W.mail + '?subject=' + encodeURIComponent('Frage') + '&body=' + encodeURIComponent(frage) + '">' + esc(W.mail) + '</a>.</p>', 'haus');
        vorschlaege(['Was ist im Preis inbegriffen?', 'Gibt es einen Kidsclub?', 'Welche Röstis gibt es?']);
      }
    });
  }
  function auf() { box.hidden = false; requestAnimationFrame(function () { box.classList.add('auf'); }); hol(); if (!vorschlag.children.length) vorschlaege(['Was ist im Preis inbegriffen?', 'Was kostet das Spa nebenan?', 'Wie komme ich mit dem Zug zu Ihnen?', 'Sind Hunde erlaubt?']); setTimeout(function () { feld.focus({ preventScroll: true }); }, 300); }
  function zu() { box.classList.remove('auf'); setTimeout(function () { box.hidden = true; }, 350); }
  knopf.addEventListener('click', function () { box.hidden ? auf() : zu(); });
  box.querySelector('[data-chat-zu]').addEventListener('click', zu);
  vorschlag.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) antworte(b.textContent); });
  function hoehe() { feld.style.height = 'auto'; feld.style.height = Math.min(feld.scrollHeight, parseFloat(getComputedStyle(feld).lineHeight) * 5 + 22) + 'px'; }
  feld.addEventListener('input', hoehe);
  feld.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); var f = feld.value.trim(); if (!f) return; feld.value = ''; hoehe(); antworte(f); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) zu(); });
  /* Adresse mit #chat öffnet die Rezeption gleich (Link von der Karte der Kette) */
  if (location.hash === '#chat') auf();
})();
