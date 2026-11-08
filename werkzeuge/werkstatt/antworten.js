/* Drucksachen & Feed · Vorführung: vorgeschriebene Antworten statt KI und Server (holen.js fragt hier nach).
   api/entwurf  wie die Probe-Antwort des Prüfservers der Vorlage (serve.py probe): die passendste fertige Vorlage des Hauses, als ein Entwurf oder fünf Varianten
   api/plakat   Vorschläge aus den Fotos des Hauses (motive.json), ohne KI-Bilder
   api/vorschau keine fertigen Vorschaubilder, das Werkzeug rechnet jede Vorschau selbst; nichts wird hochgeladen */
(function () {
  'use strict';
  const D = () => window.DS_DATEIEN || {};
  const VZ = 'haeuser/ihrhaus/vorlagen/';
  const ART_WORT = { tischkarte: ['platzkarte', 'tischkarte', 'namensschild', 'tischnummer'], menuekarte: ['menükarte', 'menuekarte', 'speisekarte', 'menü'],
    abendplakat: ['plakat für die tafel', 'plakat der woche'], plakat: ['plakat', 'aushang an der wand'], flyer: ['flyer'], story: ['story'], instagram: ['instagram', 'beitrag', 'feed'],
    gutschein: ['gutschein'], einladung: ['einladung'], aushang: ['aushang'], hinweiskarte: ['hinweis', 'zimmer'], newsletter: ['newsletter', 'e-mail'], etikett: ['kofferetikett', 'etikett', 'koffer', 'gepäck'] };
  const NAMEN = ['Johanna Albers', 'Jonas Petersen', 'Merle Jacobsen', 'Kai Brandt', 'Frauke Ohlsen'];
  const T = { dunkel: 'Nacht', creme: 'Leinen', hell: 'Warmweiss', dc: 'Flaschengrün' };
  const kopie = o => JSON.parse(JSON.stringify(o));
  const warte = ms => new Promise(ok => setTimeout(ok, ms));

  function alleVorlagen(format) {
    const ix = D()[VZ + 'index.json'] || [], out = [];
    ix.forEach(x => { if (x.eingebaut) return; const d = D()[VZ + x.art + '.json']; if (!d || (format && d.format !== format)) return; d.vorlagen.forEach(v => out.push({ v, art: x.art, fmt: v.format || d.format })); });
    return out;
  }

  async function entwurf(daten) {
    await warte(1600);
    if (daten && daten.bildtext) {   // Bildtext aus dem Beitrag selbst: Titel, Satz und Ort, im Ton des Hauses
      const bt = daten.bildtext, S = (bt.seiten || []).map(x => x || {}), e = S[0] || {}, en = bt.sprache === 'en';
      const titel = String(e.titel || (e.texte || [])[0] || 'Ihr Haus am Hafen').replace(/\s+/g, ' ').trim();
      const satz = String(e.text || (e.texte || [])[1] || '').replace(/\s+/g, ' ').trim();
      const weiter = S.slice(1).map(x => x.titel || (x.texte || [])[0]).filter(Boolean);
      const text = en ? titel + '. ' + (satz ? satz + ' ' : '') + 'Twelve rooms in a warehouse from 1888 on the Sandtorkai, Hamburg.'
        : titel + (/[.?]$/.test(titel) ? '' : '.') + (satz ? '\n\n' + satz : '') + (weiter.length ? '\n\nIm Karussell: ' + weiter.map((w, i) => i && /^(Ein|Eine|Der|Die|Das) /.test(w) ? w[0].toLowerCase() + w.slice(1) : w).join(', ') + '.' : '') + '\n\nIhr Haus am Hafen · Sandtorkai 7, Hamburg';
      return { bildtext: { text, hashtags: ['Hamburg', 'Speicherstadt', 'IhrHausAmHafen'], hinweise: [], sprache: bt.sprache || 'de' }, verbrauch: {} };
    }
    const auftrag = String((daten && daten.auftrag) || '').trim().slice(0, 1500);
    if (auftrag.length < 4) throw new Error('Auftrag fehlt');
    const a = auftrag.toLowerCase(), woerter = new Set((a.match(/[a-zäöüé]{4,}/g) || []));
    const trifft = (w, t) => t.includes(w) || (w.length > 6 && (t.includes(w.slice(0, -1)) || t.includes(w.slice(0, -2))));
    const beste = alleVorlagen(daten.format).map(x => {
      const t = (x.v.titel + ' ' + JSON.stringify(x.v.inhalt)).toLowerCase();
      const bonus = a.includes(x.art) || (ART_WORT[x.art] || []).some(w => a.includes(w)) ? 3 : 0;
      let p = 0; woerter.forEach(w => { if (trifft(w, t)) p++; });
      return { p: p + bonus, x };
    }).sort((m, n) => n.p - m.p);
    if (!beste.length) throw new Error('Keine passende Vorlage');
    const { v, art, fmt } = beste[0].x;
    const textInhalt = v.inhalt.titel ? v.inhalt : ((beste.find(b => b.x.v.inhalt.titel && b.x.art === art) || beste.find(b => b.x.v.inhalt.titel) || { x: { v: { inhalt: {} } } }).x.v.inhalt);
    const inhaltFuer = vorlage => {
      if (vorlage === v.vorlage) return kopie(v.inhalt);
      const i = kopie(textInhalt); if (!['karte', 'menue', 'programm'].includes(vorlage)) delete i.liste;
      if (v.inhalt.bild) i.bild = v.inhalt.bild;
      if (!i.bild && ['buehne', 'fenster', 'geteilt'].includes(vorlage)) i.bild = 'hero';
      return i;
    };
    const seite = (vorlage, ton, n = 0) => {
      let i = inhaltFuer(vorlage);
      if (art === 'tischkarte' && a.includes('namen') && i.titel) i = Object.assign(i, { titel: NAMEN[n % NAMEN.length] });
      return { vorlage, ton, inhalt: i };
    };
    const hinweis = [];   // wie im echten Betrieb: keine Hinweise über dem Entwurf
    if (daten.varianten) {
      const varianten = [{ titel: 'Wie die Vorlage', seiten: [Object.assign(seite(v.vorlage, v.ton, 0), { stil: v.stil })] }];
      const andere = v.vorlage === 'menue' ? [['menue', 'dunkel'], ['menue', 'creme'], ['karte', 'hell'], ['menue', 'dc']] : [['buehne', 'dunkel'], ['fenster', 'creme'], ['geteilt', 'hell'], ['aushang', 'dunkel'], ['deckel', 'creme']];
      const NAME = { buehne: 'Foto gross', fenster: 'Ruhig im Rahmen', geteilt: 'Foto und Text', aushang: 'Nur Schrift', deckel: 'Titelblatt', menue: 'Menükarte', karte: 'Gänge als Liste' };
      for (const [x, t] of andere) {
        if (varianten.length === 5) break;
        if (x === v.vorlage && t === v.ton) continue;
        varianten.push({ titel: NAME[x] + ', ' + T[t], seiten: [seite(x, t, varianten.length)] });
      }
      for (const [x, t] of [['deckel', 'hell'], ['deckel', 'dunkel'], ['aushang', 'creme']]) { if (varianten.length < 5) varianten.push({ titel: NAME[x] + ', ' + T[t], seiten: [seite(x, t, varianten.length)] }); }
      return { entwuerfe: { name: v.titel, format: fmt, varianten, hinweise: hinweis }, verbrauch: {} };
    }
    if (/karussell/i.test(auftrag)) {   // Feed-Karussell: mehrere Beiträge im selben Grund
      const n = Math.max(2, Math.min(10, +((auftrag.match(/genau (\d+)/) || [])[1] || 5)));
      const feed = (D()[VZ + 'instagram.json'] || { vorlagen: [] }).vorlagen;
      return { entwurf: { name: 'Karussell', format: 'insta', seiten: feed.slice(0, n).map(x => ({ vorlage: x.vorlage, ton: x.ton, inhalt: kopie(x.inhalt) })), hinweise: hinweis }, verbrauch: {} };
    }
    return { entwurf: { name: v.titel, format: fmt, seiten: [seite(v.vorlage, v.ton)], hinweise: hinweis }, verbrauch: {} };
  }

  /* ---------- Abend beschreiben: Plakate aus den Fotos des Hauses ---------- */
  const JZ = { 12: 'Winter', 1: 'Winter', 2: 'Winter', 3: 'Frühling', 4: 'Frühling', 5: 'Frühling', 6: 'Sommer', 7: 'Sommer', 8: 'Sommer', 9: 'Herbst', 10: 'Herbst', 11: 'Herbst' };
  function motive() { return D()['haeuser/ihrhaus/motive.json'] || []; }
  function waehle(d) {
    const text = ((d.thema || '') + ' ' + (d.konzept || '')).toLowerCase(), jz = JZ[+d.monat] || '', woerter = text.match(/[a-zäöü]{4,}/g) || [];
    return motive().map(m => {
      const s = m.schlagworte, t = [m.titel, s.thema, s.farbe, s.stimmung, s.jahreszeit].join(' ').toLowerCase();
      return { m, p: woerter.filter(w => t.includes(w)).length * 3 + (s.jahreszeit === jz ? 2 : 0) + (/tafel|gang|essen|menü|wein/.test(text) && s.thema === 'Tafel' ? 3 : 0) };
    }).sort((a, b) => b.p - a.p).map(x => x.m);
  }
  const IDEEN = ['Das Haus selbst als Bild: der Speicher, und davor der Abend.', 'Ein Teller vom Pass, ruhig und nah, der Abend in einem Gericht.', 'Der Raum mit Kerzen: wer kommt, sieht schon den Platz.',
    'Das Wasser vor dem Haus, still, und oben die Zeile des Abends.', 'Ein Detail aus dem Haus, das den Abend trägt.'];
  async function plakat(d) {
    if (!d) {   // GET: alle schon angelegten Vorschläge
      const ab = [['Die Tafel im Advent', 'Kerzen am Fenster, fünf Gänge vom Hafenmarkt', '', ['r-gastraum', 'r-zander', 'schluss', 'm-nebel']], ['Ein Abend mit Weinen von der Mosel', 'Fünf Gänge, zu jedem ein Wein', 'ein Winzer von der Mosel', ['r-gruetze', 'bar', 'hero']]];
      const M = motive();
      return { abende: ab.map(([thema, konzept, gast, keys], n) => ({ id: 'probe-' + n, thema, konzept, gast, wochenende: '', erzeugt: '', vorschlaege: keys.map((k, i) => Object.assign({}, M.find(m => m.key === k) || { key: k }, { motiv: k, titel: thema, idee: IDEEN[i % IDEEN.length] })) })), bilder: [] };
    }
    await warte(700);
    if ((String(d.thema || '') + String(d.konzept || '')).trim().length < 3) throw new Error('THEMA · Bitte ein Thema oder ein paar Worte zum Abend eingeben.');
    const zahl = Math.max(3, Math.min(5, +d.zahl || 4)), w = waehle(d);
    if (d.nr == null) {
      return { vorschlaege: w.slice(0, zahl).map((m, i) => ({ idee: IDEEN[i % IDEEN.length], bildauftrag: 'Foto des Hauses: ' + m.titel + '. Ruhig im oberen Viertel, damit die Kopfzeile Platz hat.', entwurf: { motiv: m.key } })),
        live: true, konzepte: 'probe', hinweis: 'Vorführung: Die Vorschläge kommen aus den Fotos des Hauses, ohne KI. Jeder lässt sich im Editor fertig machen: Texte, Datum, Farbe, Motiv.' };
    }
    await warte(500 + 300 * (+d.nr || 0));
    const m = w[+d.nr % w.length] || motive()[0];
    return { vorschlag: Object.assign({}, m, { motiv: m.key, titel: String(d.thema || '').slice(0, 40), warum: 'Motiv «' + m.titel + '» · ' + m.schlagworte.jahreszeit + ' · ' + m.schlagworte.stimmung, bildauftrag: 'Foto des Hauses: ' + m.titel }), bilder: [] };
  }

  /* ---------- Markenprüfung (lelivre.js «Mit dem Markenbuch prüfen»): vorgeschriebenes Ergebnis in den Farben des Hauses ---------- */
  /* Markenprüfung: vorgeschrieben, aber nach dem, was auf dem geprüften Blatt steht (Texte, Foto, Zeichen, Ränder aus der Druckprüfung) */
  const WERBUNG = [[/!/g, '.'], [/\b(der|die|das|den|dem|des) schönste[nmrs]? /gi, '$1 '], [/\bschönste[nmrs]? /gi, ''], [/\bunvergessliche?[nmrs]? /gi, ''], [/\beinzigartige?[nmrs]? /gi, ''], [/\bperfekte?[nmrs]? /gi, ''], [/\btraumhafte?[nmrs]? /gi, ''], [/\bErleben Sie\b/g, 'Verbringen Sie']];
  async function pruefen() {
    await warte(1800);
    const st = window.DSStudio, doc = st && st.doc(), se = st && st.seite ? st.seite() : null, el = se ? se.el || [] : [];
    const texte = el.filter(e => e.typ === 'text' && String(e.text || '').trim());
    const bild = el.some(e => e.typ === 'bild' && e.bild), zeichen = el.some(e => e.typ === 'zeichen');
    let rand = [];
    try { rand = (window.DS && DS.pruefe ? DS.pruefe(DS.M, doc) : []).filter(p => p.seite === (st.seiteNr ? st.seiteNr() : 0) && /am Rand|Beschnitt/.test(p.text)); } catch (e) { rand = []; }
    const ton = [];
    for (const e of texte) {
      const saetze = String(e.text).replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]*/g) || [];
      for (const satz of saetze) {
        const t = satz.trim(); let neu = t; WERBUNG.forEach(([re, ers]) => { neu = neu.replace(re, ers); });
        if (neu !== t) ton.push({ stelle: t, vorschlag: neu });
        if (ton.length >= 2) break;
      }
      if (ton.length >= 2) break;
    }
    const punkte = [
      { urteil: 'passt', bereich: 'farben', titel: 'Farben aus der Palette', text: 'Nacht, Leinen, Messing und Licht, kein fremder Ton.' },
      { urteil: 'passt', bereich: 'schrift', titel: 'Cormorant für den Titel, Instrument Sans für den Text', text: 'Titel nie fett, nie kursiv, wie im Markenbuch.' },
      zeichen ? { urteil: 'passt', bereich: 'zeichen', titel: 'Der Kran steht frei', text: 'Genug Luft um das Zeichen, nicht verzerrt.' }
        : { urteil: 'passt', bereich: 'zeichen', titel: 'Wortmarke statt Zeichen', text: 'Die Seite trägt den Namen des Hauses; das Zeichen darf fehlen, wenn die Wortmarke steht.' },
      rand.length ? { urteil: 'achten', bereich: 'abstand', titel: 'Nah an der Schnittkante', text: rand[0].text.replace(/^Seite \d+: /, '') + '. Etwas weiter nach innen setzen.' }
        : { urteil: 'passt', bereich: 'abstand', titel: 'Ruhige Ränder', text: 'Alles steht mit Abstand zur Schnittkante, nichts drängt an den Rand.' },
      bild ? { urteil: 'passt', bereich: 'bild', titel: 'Foto des Hauses', text: 'Das Foto zeigt das Haus selbst, ruhig und dunkel genug für Schrift.' }
        : { urteil: 'passt', bereich: 'bild', titel: 'Ohne Foto', text: 'Die Seite lebt von Schrift und Fläche; das passt zu Karte und Aushang.' },
      ton.length ? { urteil: 'achten', bereich: 'ton', titel: 'Ein Satz klingt nach Werbung', text: 'Sätze sagen, was ist. Ohne Superlativ, ohne Ausrufezeichen.' }
        : { urteil: 'passt', bereich: 'ton', titel: 'Ruhiger Ton', text: 'Die Sätze sagen, was ist, und siezen den Gast.' } ];
    const n = punkte.filter(p => p.urteil !== 'passt').length;
    const gesamt = 'Die Seite spricht die Sprache des Hauses: ruhig, viel Nacht und Leinen, Licht nur als Linie.' + (n === 0 ? ' Nichts zu ändern.' : n === 1 ? ' Eine Kleinigkeit lohnt einen Blick.' : ' Zwei Kleinigkeiten lohnen einen Blick.');
    return { messung: { im_rahmen: .94, schwarz: 0, tuerkis: 0, rot: 0, toene: [
        { hex: '#10151d', anteil: .46, name: 'Nacht', urteil: 'gleich', de: 0.8 }, { hex: '#efe7da', anteil: .31, name: 'Leinen', urteil: 'gleich', de: 1.1 },
        { hex: '#a8844f', anteil: .07, name: 'Messing', urteil: 'nah', de: 2.4 }, { hex: '#e2ae68', anteil: .04, name: 'Licht', urteil: 'gleich', de: 0.9 }, { hex: '#2a3241', anteil: .06, name: 'Nacht', urteil: 'nah', de: 4.2 } ] },
      ki: { art: 'Drucksache', gesamt, punkte, ton } };
  }

  window.DS_ANTWORTEN = {
    'api/entwurf': entwurf,
    'api/plakat': plakat,
    'api/vorschau': () => ({}),
    '_haus/api/pruefen': pruefen,
  };
})();
