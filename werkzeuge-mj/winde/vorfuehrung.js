/* Anfragen & Chat · Vorführ-Betrieb (Maloja). Ersetzt den Server-Teil des Werkzeugs: reception.js fragt VORF.api(was, daten) statt /api/…
   und bekommt Antworten in derselben Form wie vom Server. Alles lebt nur im Arbeitsspeicher; Neuladen stellt den Anfangsstand her.
   Keine echte KI: Briefe, Übersetzungen und Antworten des Chats sind vorgeschrieben (daten.js) und erscheinen, als würden sie gerade geschrieben.
   Fakten des Restaurants kommen aus window.HAUS (Maloja/maloja.py), nie erfunden. */
(function () {
  'use strict';
  const H = window.HAUS, W = window.WINDE;
  const kopie = o => JSON.parse(JSON.stringify(o));
  const warte = ms => new Promise(r => setTimeout(r, ms));
  const jetzt = () => new Date().toISOString();
  /* Zeiten relativ zu heute, damit der Eingang immer «Heute», «Gestern» … zeigt */
  /* Heute: so viele Minuten vor jetzt, wie die Zeit vor 16.40 Uhr lag (nie in der Zukunft, neue Anfragen aus dem Chat stehen oben) */
  const vor = (tage, hm) => { const [h, m] = hm.split(':').map(Number);
    if (!tage) return new Date(Date.now() - Math.max(1, 16 * 60 + 40 - (h * 60 + m)) * 60000).toISOString();
    const d = new Date(); d.setDate(d.getDate() - tage); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const tagPfad = iso => { const d = new Date(iso); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const KONTAKT = 'Maloja · ' + H.HAUS.telefon + ' · ' + H.HAUS.mail;
  const HAUSNAME = H.HAUS.name;
  /* Der Abend von Maloja (maloja.py ZEITEN, PLAETZE, PREISE): wie die Tafel der Vorlage, nur mit den Angaben des Restaurants */
  const ABEND = { tage: H.ZEITEN.tage, ab: H.ZEITEN.ab, einlass: H.ZEITEN.einlass, preis: H.PREISE.sieben, fuenf: H.PREISE.fuenf, wein: H.PREISE.wein, plaetze: H.PLAETZE.saal,
    tisch: 6, stube: H.PLAETZE.stube, saal: H.PLAETZE.saal };
  const REGEL = Object.fromEntries(H.REGELN);

  /* ------------------------------------------------------------ Anfragen in der Form des Servers */
  const ARTMAP = { tafel: 'tafel', feier: 'feier', gruppe: 'feier', frage: 'nachricht' };
  const ABT = { tafel: 'Reservierung', feier: 'Feiern', nachricht: 'Nachrichten' };
  const ABT_X = { gruppe: 'Gruppen' };   // Gruppen und Firmen laufen als Art «Feier», gehören aber zu den Gruppen
  /* Je Anfrage: wann, über welchen Weg, und für Anfragen aus dem Chat das Gespräch */
  const ZUSATZ = {
    a01: { tage: 0, uhr: '14:12', web: true, formular: 'tafel', seite: 'Reservieren', kueche: ['kein Fisch (eine Person)'] },
    a02: { tage: 0, uhr: '11:48', web: true, formular: 'tafel', seite: 'Reservieren', kueche: ['vegetarisch (eine Person)', 'Nüsse (eine Person)'] },
    a03: { tage: 1, uhr: '18:30', web: true, formular: 'feier', seite: 'Feiern' },
    a04: { tage: 1, uhr: '10:05', web: true, formular: 'feier', seite: 'Feiern' },
    a05: { tage: 0, uhr: '09:20', chat: [
      ['user', 'Guten Morgen. Dürfen Hunde mit zu Ihnen?'],
      ['assistant', 'Gut erzogene Hunde sind in der Bar willkommen. Dort gibt es die Gerichte auch einzeln, ab 18 Uhr und auch ohne Reservierung.'],
      ['user', 'Wir kommen mit Ole, einem ruhigen Labrador. Dürfen wir mit ihm an die Bar und dort etwas essen? Freitag, 20. November, zu zweit. Ina Lorenzen, ina.lorenzen@example.com'],
      ['assistant', 'Vielen Dank, Frau Lorenzen. Ihre Anfrage liegt jetzt bei Lena Hartmann, unserer Gastgeberin. Sie meldet sich heute noch bei Ihnen.']] },
    a06: { tage: 0, uhr: '07:55', chat: [
      ['user', 'Wie komme ich zu Ihnen?'],
      ['assistant', 'Sie finden uns am Pickhuben 6, im ersten Stock eines Kontors in der Speicherstadt. Mit dem Auto parken Sie am besten im Parkhaus am Brooktorkai, von dort wenige Minuten zu Fuss.'],
      ['user', 'Wir kommen am Samstag mit dem Auto aus Lüneburg. Wo stellen wir es am besten ab, und wie finden wir den Eingang? Gisela Rautenberg, g.rautenberg@example.com'],
      ['assistant', 'Danke, Frau Rautenberg. Ich gebe Ihre Frage an unsere Gastgeberin, Sie hören heute noch von uns.']] },
    a07: { tage: 1, uhr: '21:40', web: true, formular: 'tafel', seite: 'Reservieren' },
    a08: { tage: 2, uhr: '16:10', web: true, formular: 'tafel', seite: 'Reservieren' },
    a09: { tage: 3, uhr: '08:30', chat: [
      ['user', 'Bis wann kann ich absagen?'],
      ['assistant', 'Bis 48 Stunden vor dem Abend sagen Sie kostenfrei ab. Danach berechnen wir das Menü.'],
      ['user', 'Leider müssen wir unseren Tisch am Dienstag absagen, meine Schwester ist krank geworden. Entstehen dafür Kosten? Annika Brüggemann, a.brueggemann@example.com'],
      ['assistant', 'Danke, Frau Brüggemann. Unsere Gastgeberin sieht nach und meldet sich gleich.']] },
    a10: { tage: 2, uhr: '11:00', web: true, formular: 'allgemein', seite: 'Reservieren' },
    a11: { tage: 0, uhr: '13:05', web: true, formular: 'feier', seite: 'Feiern' },
    a12: { tage: 4, uhr: '19:20', web: true, formular: 'tafel', seite: 'Reservieren' },
    a13: { tage: 5, uhr: '15:45', kueche: ['Gluten (Zöliakie)'], chat: [
      ['user', 'Kann die Küche glutenfrei kochen?'],
      ['assistant', 'Sagen Sie es uns bitte bei der Reservierung, dann richtet sich unsere Küche danach und richtet einzelne Gänge eigens für Sie an.'],
      ['user', 'Wir möchten am Samstag zu Ihnen, um 19 Uhr zu zweit. Ich habe Zöliakie und darf nichts mit Gluten essen. Marlene Voigt, marlene.voigt@example.com'],
      ['assistant', 'Danke, Frau Voigt. Ihre Anfrage für Samstag liegt jetzt bei unserer Gastgeberin, die Küche weiss Bescheid.']] },
    a14: { tage: 6, uhr: '12:10', chat: [
      ['user', 'Kann ich auch nur an der Bar essen?'],
      ['assistant', 'Gern. Die Bar öffnet um 18 Uhr, auch ohne Reservierung. Dort gibt es die Gerichte auch einzeln.'],
      ['user', 'Kann man bei Ihnen auch ohne das ganze Menü essen? Wir hätten am Freitag nur Lust auf ein, zwei Gerichte. Thomas Behrendt, t.behrendt@example.com'],
      ['assistant', 'Gern, Herr Behrendt. Ich gebe es an unsere Gastgeberin, sie meldet sich bei Ihnen.']] },
    a15: { tage: 0, uhr: '16:02', web: true, formular: 'feier', seite: 'Feiern' }
  };
  /* Offene Stellen im Brief, die das Team selbst einsetzt (wie in der Vorlage als [Klammer]) */
  const OFFEN = {};
  const hinweisArt = t => /Hund/.test(t) ? 'hund' : /Küche|Nüsse|Fisch|Gluten|vegetarisch|Vegetarisch|Unverträglich/i.test(t) ? 'allergie' : /Preis auf Anfrage|Besichtigung/.test(t) ? 'termin'
    : /\d+ Gäste|bis \d+ Gäste|passt genau|Runden/.test(t) ? 'gruppe' : 'info';
  function alsAnfrage(x) {
    const z = ZUSATZ[x.id] || {}, art = ARTMAP[x.art] || 'nachricht', ang = Object.fromEntries(x.angaben), zeit = vor(z.tage || 0, z.uhr || '12:00');
    const id = 'anfragen/' + tagPfad(zeit) + '/' + (z.uhr || '12:00').replace(':', '-') + '-00_' + x.id + '.json';
    const b = x.brief;
    let text = b.text;
    (OFFEN[x.id] || []).forEach(([alt, neu]) => { text = text.replace(alt, neu); });
    const brief = b.anrede + '\n\n' + text + '\n\n' + b.gruss + '\n\n' + b.von + '\n' + b.rolle + ' · ' + HAUSNAME;
    const felder = x.angaben.map(([k, v]) => k + ': ' + v).join('\n') + (x.firma ? '\nFirma: ' + x.firma : '') + '\nIhre Nachricht: ' + x.nachricht;
    const a = {
      id, zeit, art, name: x.name, kontakt: x.mail, telefon: x.tel, datum: ang.Tag || '', uhrzeit: ang.Zeit || (ang['Nächte'] ? ang['Nächte'] + (ang['Nächte'] === '1' ? ' Nacht' : ' Nächte') : ''),
      personen: ang.Personen || '', platz: ang.Zimmer || ang.Platz || ang.Ort || ang.Gebucht || '', anliegen: x.nachricht.slice(0, 200), sprache: x.sprache,
      status: x.status === 'offen' ? 'gelesen' : x.status, beispiel: false, an: KONTAKT, abteilung: ABT_X[x.art] || ABT[art], bild: x.bild,
      hinweise: x.hinweise.map(t => ({ art: hinweisArt(t), text: t })), allergene_lang: z.kueche || [],
      entwurf: { betreff: b.betreff, text: brief, team: 'Grundlage: ' + x.weg + ', die Seiten und Regeln des Restaurants.' + ((OFFEN[x.id] || []).length ? '\nOffen: was in Klammern steht, setzt das Team ein.' : ''),
        vorlage: art, absender: KONTAKT, zeit, fassung: 1, original: { text: brief, betreff: b.betreff }, gestalt: {} }
    };
    if (z.web) Object.assign(a, { web: true, formular: z.formular, seite: '/reservieren.html', seite_name: z.seite, nachricht: felder,
      verlauf: [{ rolle: 'user', text: 'Über ein Formular der Website (Seite ' + z.seite + '): ' + felder }] });
    else a.verlauf = (z.chat || [['user', x.nachricht]]).map(([rolle, t]) => ({ rolle, text: t }));
    if (x.sprache === 'en') {
      const de = 'Sehr geehrter Herr Whitfield,\n\n' + x.brief_de + '\n\nHerzliche Grüsse vom Pickhuben\n\nLena Hartmann\nGastgeberin · ' + HAUSNAME;
      a.entwurf.deutsch = { betreff: 'Ihr Abend im Maloja · Freitag, 4. Dezember', text: de, quelle: 'beispiel' };
      const felderDe = x.angaben.map(([k, v]) => k + ': ' + v).join('\n') + '\nIhre Nachricht: ' + x.nachricht_de;
      a.verlauf_de = [{ text: 'Über ein Formular der Website (Seite ' + z.seite + '): ' + felderDe }];
    }
    if (x.gesendet) a.gesendet = x.gesendet;
    return a;
  }

  /* ------------------------------------------------------------ Das Wissen des Chats: Steckbrief aus window.HAUS */
  const fidVon = (b, was) => (b + '|' + was).toLowerCase().normalize('NFD').replace(/[^\w|]+/g, '-').slice(0, 60);
  function steckbriefRoh() {
    const sb = [];
    const B = (bereich, gruppen) => sb.push({ bereich, gruppen: gruppen.map(([gruppe, zeilen]) => ({ gruppe, zeilen: zeilen.map(([was, angabe, beleg]) => ({ fid: fidVon(bereich, was), was, angabe, beleg: beleg || angabe, datei: 'Website', mehr: [] })) })) });
    const hs = H.HAUS, a = hs.adresse, r = REGEL, Z = H.ZEITEN, P = H.PREISE, PL = H.PLAETZE;
    B('Das Restaurant', [['Auf einen Blick', [['Was es ist', hs.satz], ['Adresse', a.strasse + ', ' + a.plz + ' ' + a.ort], ['Lage', hs.lage], ['Räume', 'Kontorsaal mit ' + PL.saal + ' Plätzen, Arvenstube bis ' + PL.stube + ' Gäste, ' + PL.bar + ' Plätze an der Bar']]],
      ['Kontakt', [['Telefon', hs.telefon], ['E-Mail', hs.mail], ['Instagram', hs.instagram]]]]);
    B('Zeiten', [['Geöffnet', [['Tage', Z.tage + ' ab ' + Z.ab], ['Letzter Einlass', Z.einlass], ['Ruhetag', Z.ruhe], ['Bar', Z.bar]]]]);
    B('Das Menü', [['Preise', [['Sieben Gänge', P.sieben + ' €'], ['Fünf Gänge', P.fuenf + ' €'], ['Vegetarisch', 'beide Menüs auch vegetarisch, zum selben Preis'], ['Weinbegleitung', P.wein + ' €', H.WEIN]]],
      ['Sieben Gänge', H.MENUE.map(([g, z, her]) => [g, z, her])], ['Vegetarisch', H.VEGETARISCH.map(([g, z]) => [g, z])], ['Fünf Gänge', [['Gänge', H.FUENF.join(', ')]]]]);
    B('Woher', [['Zwei Herkünfte', H.HERKUNFT.map(([t, s]) => [t, s])], ['Wein', [['Weinbegleitung', H.WEIN]]]]);
    B('An der Bar', [['Die Bar', [['Geöffnet', Z.bar], ['Plätze', PL.bar + ' Plätze']]], ['Einzeln', H.KARTE_BAR.concat([H.NEU]).map(([n, s, p]) => [n, s + ', ' + p + ' €'])]]);
    B('Feiern', [['Räume', H.FEIERN.map(([n, s]) => [n, s])]]);
    B('Regeln', [['Regeln', H.REGELN.map(([w, s]) => [w, s])]]);
    B('Anfahrt', [['So kommen Sie', [['Mit der Bahn', 'U3 bis Baumwall, dann wenige Minuten über die Brücken.'], ['Mit dem Auto', 'Parkhaus am Brooktorkai, von dort wenige Minuten zu Fuss.'], ['Eingang', 'Pickhuben 6, eine breite Granittreppe hinauf in den ersten Stock']]]]);
    B('Team', [['Wer was macht', [['Gastgeberin', 'Lena Hartmann', 'Reservierungen, Feiern, Fragen der Gäste'], ['Küche', 'Marc und seine Küche', 'Menü, Unverträglichkeiten, Karte der Saison']]]]);
    return sb;
  }
  const BEREICHE = ['Das Restaurant', 'Zeiten', 'Das Menü', 'Woher', 'An der Bar', 'Feiern', 'Regeln', 'Anfahrt', 'Team', 'Veranstaltungen', 'Fragen & Antworten'];
  const THEMEN = [['Allergien & Unverträglichkeiten', /allerg|gluten|laktose|zöliak|unverträg|nuss|nüss|vegan|celiac|nuts|intoleran/i], ['Hunde & Kinder', /hund|dog|kind|baby|child|family|familie/i],
    ['Feiern & Gruppen', /feier|geburtstag|hochzeit|jubiläum|firmen|gruppe|arvenstube|stube|saal|party\b|birthday|wedding|group|celebrat/i], ['Das Menü', /menü|menu|gang|gänge|vegetar|wein|wine|käse|fisch|woher|zutaten|courses/i],
    ['Die Bar', /\bbar\b|einzeln|drink|glas/i], ['Zeiten & Reservierung', /reserv|tisch|table|book|geöffnet|offen|open|sonntag|montag|ruhetag|absag|storn|cancel|fenster|dresscode/i],
    ['Anfahrt & Parken', /park|auto|bahn|weg\b|wo genau|where|adresse|baumwall|hauptbahnhof|taxi|station/i]];
  const themaVon = t => (THEMEN.find(([, re]) => re.test(t || '')) || ['Weitere Fragen'])[0];

  /* ------------------------------------------------------------ Stand im Arbeitsspeicher */
  let D;
  function anfang() {
    const fragen = W.GEFRAGT.map((f, i) => {
      const zeit = vor(Math.max(0, Math.round((new Date(W.HEUTE) - new Date(f.zeit)) / 864e5)), f.zeit.slice(11, 16));
      const en = f.sprache === 'en';
      let antwort = '', belegt = true;
      if (f.q) { const q = W.FRAGEN.find(x => x.id === f.q); antwort = en ? q.ae : q.a; }
      else if (f.k != null) { const k = W.STICHWORTE[f.k]; antwort = en ? k.ae : k.a; }
      else { belegt = false; antwort = en ? W.CHAT.weiter_en : W.CHAT.weiter; }
      return { zeit, frage: f.frage, antwort, belegt, thema: f.ohne ? f.frage.replace(/^(Gibt es bei Ihnen eine |Kann ich in der Nähe mein )/, '').replace(/[?]$/, '').replace(/ laden$/, '') : '',
        gruppe: themaVon(f.frage), sprache: f.sprache, buchung: false, mappe: false, anfrage: '', beispiel: false, id: 'fragen/' + tagPfad(zeit) + '/' + f.zeit.slice(11, 16).replace(':', '-') + '-00_' + f.id + '.json', erledigt: false };
    });
    D = { anfragen: W.ANFRAGEN.map(alsAnfrage), fragen, nachgetragen: [], fakten: {}, eintraege: [], offen: [], links: [], verlauf: [] };
  }
  anfang();

  const ueberblick = () => {
    const f = D.fragen;
    return { anfragen_neu: D.anfragen.filter(a => a.status === 'neu').length, anfragen_offen: D.anfragen.filter(a => a.status !== 'erledigt').length, anfragen_gesamt: D.anfragen.length,
      fragen_gesamt: f.length, ohne_antwort: f.filter(x => !x.belegt && !x.erledigt).length, nachgetragen_gesamt: D.nachgetragen.length,
      letzte_frage: f.length ? f.map(x => x.zeit).sort().pop() : '', speicher: 'Arbeitsspeicher (Vorführung)' };
  };
  const steckbrief = () => steckbriefRoh().map(b => ({ ...b, gruppen: b.gruppen.map(g => ({ ...g, zeilen: g.zeilen.map(z => D.fakten[z.fid] ? { ...z, team: D.fakten[z.fid] } : z) })) }));
  const faktZeilen = () => steckbrief().flatMap(b => b.gruppen.flatMap(g => g.zeilen.map(z => ({ ...z, bereich: b.bereich, gruppe: g.gruppe }))));
  const merke = (art, titel, bereich, ref) => D.verlauf.unshift({ zeit: jetzt(), art, titel, bereich, ref, wer: 'Team Maloja' });
  const fehler = t => { throw new Error(t); };
  const nachId = id => D.anfragen.find(a => a.id === id) || fehler('ANFRAGE · Diese Anfrage gibt es nicht mehr.');
  const sortiert = l => l.slice().sort((x, y) => String(y.zeit).localeCompare(String(x.zeit)));

  /* ------------------------------------------------------------ Der Chat: vorgeschriebene Antworten aus dem Wissen */
  const ORDNUNG = ['q5', 'q7', 'q6', 'q12', 'q10', 'q11', 'q14', 'q13', 'q15', 'q8', 'q3', 'q4', 'q2', 'q1'];
  /* welche Zeilen des Steckbriefs hinter einer Antwort stehen: ändert das Team sie, antwortet der Chat mit der neuen Angabe */
  const BELEG = { q1: [['Zeiten', 'Tage'], ['Zeiten', 'Letzter Einlass'], ['Zeiten', 'Ruhetag']], q2: [['Regeln', 'Tische']], q3: [['Anfahrt', 'Mit der Bahn'], ['Anfahrt', 'Mit dem Auto']],
    q4: [['Das Menü', 'Sieben Gänge'], ['Das Menü', 'Fünf Gänge'], ['Das Menü', 'Weinbegleitung']], q5: [['Regeln', 'Hunde']], q6: [['Das Menü', 'Vegetarisch']], q7: [['Regeln', 'Unverträglichkeiten']],
    q8: [['An der Bar', 'Geöffnet']], q10: [['Feiern', 'Die Arvenstube'], ['Feiern', 'Der Kontorsaal']], q11: [['Regeln', 'Absage']], q12: [['Regeln', 'Kinder']], q13: [['Das Menü', 'Weinbegleitung']],
    q14: [['Zeiten', 'Ruhetag']], q15: [['Woher', 'Aus den Bergen'], ['Woher', 'Von der Küste']] };
  const englisch = t => /\b(the|is|are|can|could|do|does|you|your|what|when|where|how|which|menu|wine|dog|parking|we|would|like|table|dinner|book|please|our|have|guests|people|evening|open)\b/i.test(t) && !/[äöüß]|\b(ich|wir|sie|ist|gibt|kann|wann|wie|wo)\b/i.test(t);
  const STOPP = new Set(('gibt es ich wir sie kann können könnte man wann wie was wo wer welche welcher welches der die das den dem des ein eine einen einem einer und oder an am auf im in ins für bei zu zum zur '
    + 'ihr ihre ihren ihnen haben habt hat ist sind sein mein meine noch auch bitte uns euch mit von vom nach über unter nicht nur gern gerne schon dort hier da so sehr '
    + 'the is are can could do does you your what when where how which there a an of to for in on at and or my me we our').split(' '));
  const woerter = t => String(t || '').toLowerCase().normalize('NFC').split(/[^a-zäöüß0-9]+/).filter(w => w.length > 2 && !STOPP.has(w));
  /* gehört ein Wort schon zu einer festen Antwort (Bar, Parken, Wein …), entscheidet es nicht allein für einen Eintrag des Teams */
  const allgemein = w => W.FRAGEN.some(q => q.s.test(w)) || W.STICHWORTE.some(k => k.s.test(w));
  function antwort(text) {
    const t = String(text || ''), en = englisch(t), klein = t.toLowerCase();
    /* Was das Team eingetragen oder nachgetragen hat, geht vor: es reicht ein Wort der Frage, das in Titel oder Text steht
       und nicht schon zu einer festen Antwort gehört (Dresscode, Taxi, Garderobe …), auch kurze Hauptwörter */
    const worte = woerter(t), eigen = worte.filter(w => !allgemein(w));
    const passt = (titel, text) => { const h = ' ' + woerter(titel + ' ' + text).join(' ') + ' '; return eigen.filter(w => h.includes(' ' + w + ' ') || (w.length > 4 && h.includes(' ' + w))).length; };
    const kandidaten = D.nachgetragen.map(x => ({ text: x.antwort, n: passt(x.frage, x.antwort), zeit: x.zeit }))
      .concat(D.eintraege.filter(e => !e.aus).map(e => ({ text: e.text, n: passt(e.titel, e.text), zeit: e.geaendert || e.zeit })))
      .filter(k => k.n > 0).sort((x, y) => y.n - x.n || String(y.zeit).localeCompare(String(x.zeit)));
    if (kandidaten.length) return { text: kandidaten[0].text, belegt: true };
    for (const id of ORDNUNG) {
      const q = W.FRAGEN.find(x => x.id === id);
      if (!q.s.test(t)) continue;
      const z = faktZeilen(), belege = (BELEG[id] || []).map(([b, w]) => z.find(x => x.bereich === b && x.was.startsWith(w))).filter(Boolean);
      if (belege.some(x => x.team && x.team.aus)) return { text: en ? W.CHAT.aus_en : W.CHAT.aus, belegt: false };
      const neu = belege.filter(x => x.team && x.team.angabe);
      if (neu.length && !en) return { text: belege.map(x => x.was + ': ' + (x.team && x.team.angabe ? x.team.angabe : x.angabe).replace(/\.$/, '')).join('. ') + '.', belegt: true };
      return { text: en ? q.ae : q.a, belegt: true };
    }
    for (const k of W.STICHWORTE) if (k.s.test(t)) return { text: en ? k.ae : k.a, belegt: true };
    return { text: en ? W.CHAT.weiter_en : W.CHAT.weiter, belegt: false };
  }
  const MAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  /* Angaben aus dem Gespräch: Tag, Gäste (wie der Assistent der Vorlage, nur fest gerechnet) */
  const MONATE_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const MONATE = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
  const MONAT_NAME = m => MONATE[m].charAt(0).toUpperCase() + MONATE[m].slice(1);
  function angabenAus(t) {
    const k = t.toLowerCase(), r = {};
    let m = k.match(/(\d{1,2})\.?\s*(?:bis|-|–)\s*(\d{1,2})\.\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)/);
    if (m) { r.von = +m[1]; r.bis = +m[2]; r.monat = MONATE.indexOf(m[3]); r.tage = m[1] + '. bis ' + m[2] + '. ' + m[3].charAt(0).toUpperCase() + m[3].slice(1); r.naechte = Math.max(1, r.bis - r.von); }
    else if ((m = k.match(/(?:am\s+)?(\d{1,2})\.\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)/))) { r.tag = m[1] + '. ' + m[2].charAt(0).toUpperCase() + m[2].slice(1); r.monat = MONATE.indexOf(m[2]); r.tagNr = +m[1]; }
    if (!r.tage && !r.tag) {   // englisch: «10 to 12 June», «10-12 June», «June 10–12», «on 14 November», «November 14»
      const ME = '(january|february|march|april|may|june|july|august|september|october|november|december)';
      const satz = (von, bis, mon) => { r.von = von; r.bis = bis; r.monat = MONATE_EN.indexOf(mon); r.tage = von + '. bis ' + bis + '. ' + MONAT_NAME(r.monat); r.naechte = Math.max(1, bis - von); };
      const tag = (t, mon) => { r.tagNr = t; r.monat = MONATE_EN.indexOf(mon); r.tag = t + '. ' + MONAT_NAME(r.monat); };
      if ((m = k.match(new RegExp('(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:to|until|till|-|–)\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?' + ME)))) satz(+m[1], +m[2], m[3]);
      else if ((m = k.match(new RegExp(ME + '\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:to|until|till|-|–)\\s*(\\d{1,2})')))) satz(+m[2], +m[3], m[1]);
      else if ((m = k.match(new RegExp('(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?' + ME)))) tag(+m[1], m[2]);
      else if ((m = k.match(new RegExp(ME + '\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b')))) tag(+m[2], m[1]);
    }
    if ((m = k.match(/(\d{1,2})\s*(?:personen|gäste|leute|plätze|erwachsene|people|persons|guests|adults)/))) r.personen = +m[1];
    else if (/two of us|for two\b|my wife|my husband|my partner/.test(k)) r.personen = 2;
    else if (/zu zweit|wir zwei|mit meiner frau|mit meinem mann|mit meiner freundin|mit meinem freund/.test(k)) r.personen = 2;
    else if (/zu dritt/.test(k)) r.personen = 3; else if (/zu viert/.test(k)) r.personen = 4;
    return r;
  }
  /* Wochentag eines genannten Tages (nächstes Vorkommen ab heute) */
  const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function datumVon(tag, monat) {
    const h = new Date(); h.setHours(0, 0, 0, 0);
    let d = new Date(h.getFullYear(), monat, tag); if (d < h) d = new Date(h.getFullYear() + 1, monat, tag);
    return d;
  }
  const TAFELTAGE = (() => { const t = ABEND.tage.toLowerCase(), von = TAGE.findIndex(x => t.startsWith(x.toLowerCase())), bis = TAGE.findIndex(x => t.endsWith(x.toLowerCase())); const l = []; for (let k = von; ; k = (k + 1) % 7) { l.push(k); if (k === bis) break; } return l; })();
  /* Angaben eines Gesprächs: der jüngste Satz des Gastes zählt, ältere Sätze derselben Anfrage ergänzen nur, was dort fehlt */
  function angabenGespraech(saetze) {
    const g = {}, felder = ['von', 'bis', 'monat', 'tage', 'naechte', 'tag', 'tagNr', 'personen'];
    saetze.slice().reverse().forEach(t => { const x = angabenAus(t); if (g.tage == null && g.tag == null && (x.tage || x.tag)) felder.slice(0, 7).forEach(k => { if (x[k] != null) g[k] = x[k]; }); if (g.personen == null && x.personen != null) g.personen = x.personen; });
    return g;
  }
  function artVon(saetze) {
    for (const t of saetze.slice().reverse()) { if (/feier|geburtstag|hochzeit|jubiläum|arvenstube|stube|kontorsaal|gruppe|firma|celebrat|party|wedding|birthday|group/i.test(t)) return 'feier'; if (/tisch|reserv|abend|menü|dinner|table|bar\b/i.test(t)) return 'tafel'; }
    return 'tafel';
  }
  /* Brief und Hinweise einer Anfrage aus dem Chat, aus Angaben und Regeln des Hauses gerechnet (wie reception.hinweise der Vorlage) */
  let TAFEL_INFO = null;
  function briefFuer(art, g, nm, alles) {
    TAFEL_INFO = null;
    const hinweise = [], kueche = [];
    const nachname = nm === 'Gast aus dem Chat' ? '' : nm;
    const anrede = nachname ? 'Guten Tag ' + nachname + ',' : 'Guten Tag,';
    if (/hund/i.test(alles)) hinweise.push({ art: 'hund', text: 'Hund: ' + REGEL.Hunde });
    const KUECHE = [[/zöliak|celiac|coeliac/i, 'Gluten (Zöliakie)'], [/gluten/i, 'Gluten'], [/nuss|nüss|\bnuts?\b/i, 'Nüsse'], [/laktose|lactose|milch|dairy/i, 'Laktose'], [/vegan/i, 'vegan'],
      [/vegetar/i, 'vegetarisch'], [/meeresfrücht|shellfish|seafood/i, 'Meeresfrüchte'], [/kein(?:en)? fisch|no fish|fischallerg|fish allerg/i, 'kein Fisch'], [/sellerie|celery/i, 'Sellerie'], [/\beier?\b|\beggs?\b/i, 'Ei']];
    const allerg = KUECHE.filter(([re]) => re.test(alles)).map(([, n]) => n).filter((n, k, l) => !(n === 'Gluten' && l.includes('Gluten (Zöliakie)')));
    if (allerg.length) { kueche.push(...allerg); hinweise.push({ art: 'allergie', text: 'Für die Küche: ' + allerg.join(', ') + '. Bei der Reservierung melden' }); }
    let betreff, absatz;
    if (art === 'tafel') {
      const plaetze = g.personen ? (g.personen === 1 ? 'einen Platz' : 'einen Tisch für ' + g.personen) : 'einen Tisch für [Zahl]';
      let tagText = g.tag ? 'den ' + g.tag : g.tage ? 'den ' + g.tage : '[Tag]', geschlossen = false, vorschlag = '';
      let vorschlagD = null, tagD = null;
      if (g.tagNr != null && g.monat != null) {
        const d = datumVon(g.tagNr, g.monat), wt = d.getDay(); tagD = d;
        tagText = TAGE[wt] + ', den ' + g.tag;
        if (!TAFELTAGE.includes(wt)) {
          geschlossen = true;
          const n = new Date(d); do n.setDate(n.getDate() + 1); while (!TAFELTAGE.includes(n.getDay()));
          vorschlag = TAGE[n.getDay()] + ', den ' + n.getDate() + '. ' + MONAT_NAME(n.getMonth()); vorschlagD = n;
          hinweise.unshift({ art: 'ruhetag', text: 'Am ' + TAGE[wt] + ' ist Ruhetag: geöffnet ' + ABEND.tage + '. Nächster Abend ' + vorschlag });
        }
      }
      if (g.personen > ABEND.tisch) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: Tische bis ' + ABEND.tisch + ', vorschlagen: die Arvenstube bis ' + ABEND.stube + ' Gäste' });
      TAFEL_INFO = { geschlossen, tagD, vorschlagD };
      betreff = 'Ihr Abend im Maloja · ' + (geschlossen ? vorschlag : (g.tag || g.tage || '[Tag]'));
      absatz = geschlossen
        ? 'vielen Dank für Ihre Anfrage im Chat. Wir haben ' + ABEND.tage + ' ab ' + ABEND.ab + ' geöffnet; am ' + tagText + ', ist bei uns Ruhetag. Gern halten wir Ihnen ' + plaetze + ' am ' + vorschlag + ', frei.'
        : 'vielen Dank für Ihre Anfrage im Chat. Für ' + (tagText.includes(', den ') ? tagText + ',' : tagText) + ' haben wir Ihnen ' + plaetze + ' im Kontorsaal vorgemerkt, ab ' + ABEND.ab + '.';
      absatz += '\n\nDas Menü hat sieben Gänge, jeder von Hand angerichtet, und kostet ' + ABEND.preis + ' € je Person, mit fünf Gängen ' + ABEND.fuenf + ' €. Beide gibt es auch vegetarisch. Die Weinbegleitung aus der Schweiz und Deutschland kostet ' + ABEND.wein + ' €.\n\n'
        + (kueche.length ? 'Ihre Wünsche für die Küche haben wir notiert, unsere Küche richtet die Gänge danach an.' : 'Unverträglichkeiten sagen Sie uns bitte bei der Reservierung, dann richtet sich unsere Küche danach.')
        + (/hund/i.test(alles) ? ' Ihr Hund ist in der Bar willkommen.' : '');
    } else {
      if (g.personen > ABEND.saal) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: mehr als der Kontorsaal fasst (' + ABEND.saal + ')' });
      else if (g.personen > ABEND.stube) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: mehr als die Arvenstube fasst (' + ABEND.stube + '), der Kontorsaal bis ' + ABEND.saal });
      betreff = 'Ihre Feier im Maloja · ' + (g.tag || g.tage || '[Tag]');
      absatz = 'vielen Dank für Ihre Anfrage im Chat. ' + (g.tag ? 'Für den ' + g.tag : g.tage ? 'Für den ' + g.tage : 'Für [Tag]') + (g.personen ? ' und ' + g.personen + ' Gäste' : '') + ' sehen wir nach, was frei ist: die Arvenstube für bis zu ' + ABEND.stube + ' Gäste an einem langen Tisch oder der ganze Kontorsaal für bis zu ' + ABEND.saal + '.'
        + '\n\nDas Menü stellen wir mit Ihnen zusammen, aus der Karte der Saison, mit Weinbegleitung aus der Schweiz und Deutschland. Am liebsten zeige ich Ihnen die Räume einmal selbst. Danach schicke ich Ihnen einen genauen Vorschlag.';
    }
    const v = { tafel: ['Herzliche Grüsse vom Pickhuben', 'Lena Hartmann', 'Gastgeberin'], feier: ['Herzliche Grüsse', 'Lena Hartmann', 'Gastgeberin'] }[art] || ['Herzliche Grüsse', 'Lena Hartmann', 'Gastgeberin'];
    const text = anrede + '\n\n' + absatz + '\n\n' + v[0] + '\n\n' + v[1] + '\n' + v[2] + ' · ' + HAUSNAME;
    return { betreff, text, hinweise, kueche, tafel: art === 'tafel' ? TAFEL_INFO : null };
  }
  /* Englischer Brief für Gäste, die englisch schreiben (wie der Brief an James Whitfield); die deutsche Fassung wird zur Lesefassung */
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = m => MONATE_EN[m].charAt(0).toUpperCase() + MONATE_EN[m].slice(1);
  function briefEnglisch(art, g, nm, tafel, kueche) {
    const anrede = nm !== 'Gast aus dem Chat' ? 'Dear ' + nm + ',' : 'Dear guest,';
    const zahl = n => ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][n] || String(n);
    const tageEn = g.tage ? g.von + ' to ' + g.bis + ' ' + MONTH(g.monat) : g.tag ? g.tagNr + ' ' + MONTH(g.monat) : null;
    const tagEn = d => DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH(d.getMonth());
    let betreff, absatz, gruss = 'Warm regards from Pickhuben', von = 'Lena Hartmann', rolle = 'Host';
    if (art === 'tafel') {
      const plaetze = g.personen ? (g.personen === 1 ? 'a place' : 'a table for ' + zahl(g.personen)) : 'a table for [number]';
      const t = tafel || {};
      betreff = 'Your evening at Maloja · ' + (t.geschlossen ? tagEn(t.vorschlagD) : t.tagD ? tagEn(t.tagD) : (tageEn || '[day]'));
      absatz = (t.geschlossen
        ? 'thank you for your enquiry in our chat. We are open Tuesday to Saturday from 6.30 pm; on ' + tagEn(t.tagD) + ' we are closed. We would gladly hold ' + plaetze + ' for you on ' + tagEn(t.vorschlagD) + '.'
        : 'thank you for your enquiry in our chat. For ' + (t.tagD ? tagEn(t.tagD) : (tageEn || '[day]')) + ' we have reserved ' + plaetze + ' in the Kontor hall, from 6.30 pm.')
        + '\n\nThe menu has seven courses, each arranged by hand, and is ' + ABEND.preis + ' € per person, or ' + ABEND.fuenf + ' € with five courses. Both are also available vegetarian. The wine pairing from Switzerland and Germany is ' + ABEND.wein + ' €.\n\n'
        + (kueche.length ? 'We have noted your wishes for the kitchen; our kitchen will prepare your courses accordingly.' : 'Please let us know of any intolerances when you book, and our kitchen will cook accordingly.');
    } else {
      betreff = 'Your celebration at Maloja · ' + (tageEn || '[day]');
      absatz = 'thank you for your enquiry in our chat. For ' + (tageEn || '[day]') + (g.personen ? ' and ' + g.personen + ' guests' : '') + ' we are checking what is available: the Arvenstube for up to ' + ABEND.stube + ' guests at one long table, or the whole Kontor hall for up to ' + ABEND.saal + '.'
        + '\n\nWe put the menu together with you, from the seasonal menu, with wine pairing from Switzerland and Germany. I would love to show you the rooms in person; afterwards I will send you a detailed proposal.';
      gruss = 'Warm regards';
    }
    return { betreff, text: anrede + '\n\n' + absatz + '\n\n' + gruss + '\n\n' + von + '\n' + rolle + ' · ' + HAUSNAME };
  }
  function deutschVon(t) {
    const q = W.FRAGEN.find(x => x.ae === t || x.en === t); if (q) return q.ae === t ? q.a : q.de;
    const k = W.STICHWORTE.find(x => x.ae === t); if (k) return k.a;
    if (t === W.CHAT.weiter_en) return W.CHAT.weiter; if (t === W.CHAT.gruss_en) return W.CHAT.gruss;
    if (/^Thank you/.test(t) && /host/.test(t)) return 'Vielen Dank. Ihre Anfrage liegt jetzt bei Lena Hartmann, unserer Gastgeberin. Sie meldet sich heute noch bei Ihnen.';
    return t;   // Worte des Gastes im Wortlaut
  }
  const ANFRAGE_IM_GESPRAECH = new WeakMap();   // je Gespräch die Anfrage, die zuletzt daraus entstand (fürs Nachfassen)
  function anfrageAusChat(verlauf, nachfassen) {   // nennt der Gast Name und Kontakt, liegt die Anfrage danach im Eingang, mit Brief aus dem Gespräch
    const saetzeAlle = verlauf.filter(v => v.role === 'user').map(v => v.content);
    /* nur die Sätze seit der letzten Anfrage in diesem Gespräch: eine neue Anfrage erbt nichts von der vorigen */
    let ab = 0; saetzeAlle.forEach((t, k) => { if (k < saetzeAlle.length - 1 && MAIL.test(t)) ab = k + 1; });
    const alt = nachfassen ? D.anfragen.find(a => a.id === ANFRAGE_IM_GESPRAECH.get(verlauf)) : null;
    const saetze = alt ? (alt.saetze || []).concat(saetzeAlle.slice(-1)) : saetzeAlle.slice(ab);
    const letzte = saetze[saetze.length - 1], mailSatz = saetze.slice().reverse().find(t => MAIL.test(t)) || letzte, mail = alt ? alt.kontakt : (mailSatz.match(MAIL) || [''])[0];
    const alles = saetze.join(' '), art = alt && !/feier|tisch|reserv|stube|saal/i.test(letzte) ? alt.art : artVon(saetze);
    const nm = alt ? alt.name : ((mailSatz.match(/(?:ich bin|mein name ist|name:|ich heisse|ich heiße)\s*([A-ZÄÖÜ][\wäöüß-]+(?:\s+[A-ZÄÖÜ][\wäöüß-]+)?)/i) || mailSatz.match(/([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)\s*,?\s*[\w.+-]+@/) || [])[1] || 'Gast aus dem Chat');
    const g = angabenGespraech(saetze), b = briefFuer(art, g, nm, alles), en = englisch(alles);
    const e = en ? briefEnglisch(art, g, nm, b.tafel, b.kueche) : null;   // Brief in der Sprache des Gastes, die deutsche Fassung wird zur Lesefassung
    const zeit = jetzt(), id = alt ? alt.id : 'anfragen/' + tagPfad(zeit) + '/' + new Date().toTimeString().slice(0, 8).replace(/:/g, '-') + '-' + Math.random().toString(36).slice(2, 6) + '_chat.json';
    const brief = e || b, offen = (brief.text + brief.betreff).match(/\[[^\]]+\]/g) || [];
    const a = { id, zeit: alt ? alt.zeit : zeit, art, name: nm, kontakt: mail, datum: g.tage || g.tag || '', uhrzeit: art === 'tafel' ? ABEND.ab : '',
      personen: g.personen || '', platz: art === 'tafel' ? 'Kontorsaal' : '', anliegen: alles.slice(0, 200), sprache: en ? 'en' : 'de', status: 'neu', beispiel: false,
      an: KONTAKT, abteilung: ABT[art], bild: ({ tafel: 'm-saal', feier: 'm-stube' })[art] || 'm-saal', hinweise: b.hinweise, allergene_lang: b.kueche,
      verlauf: verlauf.map(x => ({ rolle: x.role, text: x.content })), saetze,
      entwurf: { betreff: brief.betreff, text: brief.text, team: 'Grundlage: das Gespräch im Chat, Menü, Preise und Regeln des Restaurants.' + (en ? ' Brief auf Englisch, die deutsche Fassung zum Mitlesen.' : '') + (offen.length ? '\nOffen: ' + offen.join(', ') + ', setzt das Team ein.' : ''), vorlage: art, absender: KONTAKT, zeit, fassung: alt ? (alt.entwurf.fassung || 0) + 1 : 1, original: { text: brief.text, betreff: brief.betreff }, gestalt: {},
        ...(en ? { deutsch: { betreff: b.betreff, text: b.text, quelle: 'beispiel' } } : {}) } };
    if (en) a.verlauf_de = verlauf.map(x => ({ text: deutschVon(x.content) }));
    if (alt) D.anfragen[D.anfragen.indexOf(alt)] = a; else D.anfragen.unshift(a);
    ANFRAGE_IM_GESPRAECH.set(verlauf, id);
    return { nm, a, geaendert: !!alt };
  }

  /* ------------------------------------------------------------ Die Schnittstelle: dieselben Wege wie der Server */
  async function api(was, d) {
    await warte(was === 'entwurf' ? 1400 : was === 'uebersetzen' ? 1100 : was === 'wissen_probe' ? 900 : 60);
    const ue = ueberblick;
    if (d === undefined) {
      if (was === 'ueberblick') return kopie(ue());
      if (was === 'anfragen') return kopie({ anfragen: sortiert(D.anfragen), ...ue() });
      if (was === 'fragen') return kopie({ fragen: sortiert(D.fragen), nachgetragen: D.nachgetragen, ...ue() });
      if (was === 'wissen') return kopie({ steckbrief: steckbrief(), offen: D.offen, abschnitte: [], eintraege: D.eintraege.map(e => ({ ...e, abgelaufen: !!(e.gueltig_bis && e.gueltig_bis < tagPfad(jetzt())) })),
        links: D.links, verlauf: D.verlauf, bereiche: BEREICHE, heute: tagPfad(jetzt()), nachgetragen: D.nachgetragen });
      if (was === 'wissen_links') return kopie({ links: D.links });
      fehler('ANFRAGE · Unbekannte Ansicht.');
    }
    if (was === 'anfrage') {
      const a = nachId(d.id);
      if (d.status && ['neu', 'gelesen', 'erledigt'].includes(d.status)) a.status = d.status;
      if (a.entwurf && (typeof d.entwurf_text === 'string' || d.gestalt)) a.entwurf.fassung = (a.entwurf.fassung || 0) + 1;
      if (typeof d.entwurf_text === 'string' && a.entwurf) { a.entwurf.text = d.entwurf_text.slice(0, 12000); if (typeof d.betreff === 'string') a.entwurf.betreff = d.betreff.slice(0, 300); a.entwurf.geaendert = jetzt(); }
      if (d.gestalt && a.entwurf) a.entwurf.gestalt = kopie(d.gestalt);
      return kopie({ ok: true, fassung: a.entwurf ? a.entwurf.fassung : 0, ...ue() });
    }
    if (was === 'entwurf') {   // «Neu schreiben lassen»: der vorgeschriebene Brief kommt wieder, als neue Fassung
      const a = nachId(d.id), o = a.entwurf.original;
      a.entwurf = { ...a.entwurf, text: o.text, betreff: o.betreff, gestalt: {}, fassung: (a.entwurf.fassung || 0) + 1 };
      if (a.status === 'neu') a.status = 'gelesen';
      return kopie({ entwurf: a.entwurf, ...ue() });
    }
    if (was === 'uebersetzen') {
      const a = nachId(d.id);
      if (!a.entwurf.deutsch) a.entwurf.deutsch = { betreff: a.entwurf.betreff, text: a.entwurf.text, quelle: 'beispiel' };
      return kopie({ deutsch: a.entwurf.deutsch, verlauf_de: a.verlauf_de || a.verlauf.map(v => ({ text: v.text })), ...ue() });
    }
    if (was === 'weg') { D.anfragen = D.anfragen.filter(a => a.id !== d.id); D.fragen = D.fragen.filter(f => f.id !== d.id); return kopie({ ok: true, ...ue() }); }
    if (was === 'frage') { const f = D.fragen.find(x => x.id === d.id) || fehler('FRAGE · Diese Frage gibt es nicht mehr.'); f.erledigt = !!d.erledigt; return kopie({ ok: true, ...ue() }); }
    if (was === 'nachtragen') {
      const frage = String(d.frage || '').trim().slice(0, 400), antw = String(d.antwort || '').trim().slice(0, 2000);
      if (frage.length < 3 || antw.length < 3) fehler('EINGABE · Bitte Frage und Antwort ausfüllen.');
      const nid = d.nid || ('n' + Date.now()), alt = D.nachgetragen.find(x => x.nid === nid);
      const worte = frage.toLowerCase().replace(/^[^:]*:\s*/, '').split(/[^a-zäöüß]+/).filter(w => w.length > 4 && !/^(gibt|haben|ihnen|kann|können|meine|nähe|wann|einen|einer|bitte)$/.test(w));
      const e = { nid, frage, antwort: antw, zeit: jetzt(), quelle: d.quelle || (alt || {}).quelle || '', worte };
      D.nachgetragen = D.nachgetragen.filter(x => x.nid !== nid).concat([e]);
      const f = D.fragen.find(x => x.id === d.quelle); if (f) f.erledigt = true;
      return kopie({ ok: true, eintrag: e, ...ue() });
    }
    if (was === 'nachtragen_weg') { D.nachgetragen = D.nachgetragen.filter(x => x.nid !== d.nid); return kopie({ ok: true, ...ue() }); }
    if (was === 'wissen_offen') {
      const thema = String(d.thema || '').trim().slice(0, 120); if (thema.length < 2) fehler('EINGABE · Bitte das Thema nennen.');
      const e = { oid: 'o' + Date.now(), thema, an: String(d.an || ''), zeit: jetzt(), von: d.von || 'Team Maloja' }; D.offen.unshift(e); merke('offen', thema + (e.an ? ' · ' + e.an + ' gefragt' : ''), '', e.oid);
      return { ok: true, offen: kopie(e) };
    }
    if (was === 'wissen_offen_weg') { D.offen = D.offen.filter(x => x.oid !== d.oid); return { ok: true }; }
    if (was === 'wissen_fakt') {
      const z = faktZeilen().find(x => x.fid === d.fid) || fehler('WISSEN · Diese Angabe gibt es nicht mehr. Bitte neu laden.');
      let art;
      if (d.zurueck) { delete D.fakten[z.fid]; art = 'zurueck'; }
      else if (d.aus) { D.fakten[z.fid] = { aus: true, zeit: jetzt(), von: d.von || 'Team Maloja' }; art = 'aus'; }
      else {
        const angabe = String(d.angabe || '').trim().slice(0, 600);
        if (!angabe) fehler('EINGABE · Bitte die Angabe ausfüllen. Gilt sie nicht mehr, «Nicht mehr nennen» wählen.');
        if (angabe === z.angabe) { delete D.fakten[z.fid]; art = 'zurueck'; } else { D.fakten[z.fid] = { angabe, zeit: jetzt(), von: d.von || 'Team Maloja' }; art = 'geaendert'; }
      }
      merke(art, z.was + ' (' + z.gruppe + ')', z.bereich, z.fid);
      return { ok: true };
    }
    if (was === 'wissen_eintrag') {
      const titel = String(d.titel || '').trim().slice(0, 140), text = String(d.text || '').trim().slice(0, 4000);
      if (titel.length < 2 || text.length < 3) fehler('EINGABE · Bitte Titel und Text ausfüllen.');
      const bereich = BEREICHE.includes(d.bereich) ? d.bereich : 'Das Restaurant';
      let e = D.eintraege.find(x => x.wid === d.wid);
      if (e) Object.assign(e, { titel, text, bereich, gueltig_bis: d.gueltig_bis || null, geaendert: jetzt(), von: d.von || 'Team Maloja' });
      else { e = { wid: 't' + Date.now(), bereich, titel, text, gueltig_bis: d.gueltig_bis || null, zeit: jetzt(), geaendert: jetzt(), quelle: { art: 'team' }, von: d.von || 'Team Maloja' }; D.eintraege.push(e); }
      merke(d.wid ? 'geaendert' : 'neu', titel, bereich, e.wid);
      return kopie({ ok: true, eintrag: e });
    }
    if (was === 'wissen_eintrag_weg') { const e = D.eintraege.find(x => x.wid === d.wid) || fehler('WISSEN · Diesen Eintrag gibt es nicht mehr.'); D.eintraege = D.eintraege.filter(x => x !== e); merke('entfernt', e.titel, e.bereich, e.wid); return { ok: true }; }
    if (was === 'wissen_eintrag_aus') { const e = D.eintraege.find(x => x.wid === d.wid) || fehler('WISSEN · Diesen Eintrag gibt es nicht mehr.'); e.aus = !!d.aus; merke(e.aus ? 'aus' : 'an', e.titel, e.bereich, e.wid); return { ok: true }; }
    if (was === 'wissen_einlesen') {
      const text = String(d.text || '').trim(), dateien = d.dateien || [], links = text.match(/https?:\/\/\S+/g) || [];
      if (!links.length && !dateien.length && text.length < 3) fehler('EINGABE · Bitte etwas schreiben, einen Link einfügen oder eine Datei dazulegen.');
      if (!links.length && !dateien.length) {   // eigener Text: direkt ins Wissen (ohne Bereich: «Das Restaurant»)
        const erste = text.split(/(?<=[^\d\s][.!?])\s+|\n/)[0].replace(/\.$/, ''), titel = erste.length <= 70 ? erste : erste.slice(0, 67).replace(/\s\S*$/, '') + ' …';
        const r = await api('wissen_eintrag', { bereich: BEREICHE.includes(d.bereich) ? d.bereich : 'Das Restaurant', titel, text, von: d.von });
        return { ok: true, direkt: r.eintrag };
      }
      const lid = 'l' + Date.now();   // Vorführung: Links und Dateien werden nicht gelesen, es geht nichts ins Netz
      D.links.unshift({ lid, url: links[0] || '', titel: dateien.length ? dateien[0].name : (links[0] || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0], status: 'liest', wids: [], zeit: jetzt(), von: d.von });
      setTimeout(() => { const l = D.links.find(x => x.lid === lid); if (l) Object.assign(l, { status: 'leer', fertig: jetzt(), meldung: 'In der Vorführung werden keine Links und Dateien gelesen. Eigener Text mit Bereich steht sofort im Wissen.' }); if (window.DEMO) DEMO.hinweis('Vorführung: Links und Dateien werden hier nicht gelesen, es geht nichts hinaus.'); }, 2600);
      return { ok: true };
    }
    if (was === 'wissen_link_weg') { D.links = D.links.filter(x => x.lid !== d.lid); return { ok: true }; }
    if (was === 'wissen_probe') { const f = String(d.frage || '').trim(); if (f.length < 3) fehler('EINGABE · Bitte eine Frage eingeben.'); return antwort(f); }
    fehler('ANFRAGE · Unbekannter Auftrag.');
  }

  /* Chat ausprobieren: Antwort wie der Chat der Website; jede Frage steht danach unter «Das wurde gefragt» */
  async function gast(verlauf) {
    await warte(650);
    const t = verlauf[verlauf.length - 1].content;
    let a;
    const angaben = angabenAus(t), hatAngaben = !!(angaben.tage || angaben.tag || angaben.personen);   // Nachfassen: ein anderer Tag oder eine andere Zahl Gäste
    if (MAIL.test(t) || (hatAngaben && ANFRAGE_IM_GESPRAECH.has(verlauf) && !MAIL.test(t) && D.anfragen.some(x => x.id === ANFRAGE_IM_GESPRAECH.get(verlauf)))) {
      const r = anfrageAusChat(verlauf, !MAIL.test(t)), nm = r.nm !== 'Gast aus dem Chat' ? ', ' + r.nm : '', zu = r.a.hinweise.find(h => h.art === 'ruhetag');
      a = { text: englisch(t) ? 'Thank you' + nm + '. Your enquiry is now with our host. Lena Hartmann will get back to you today.'
        : r.geaendert ? 'Gern' + nm + ', ich habe Ihre Anfrage angepasst' + (r.a.datum ? ': ' + r.a.datum : '') + '.' + (zu ? ' Wir haben ' + ABEND.tage + ' geöffnet; unsere Gastgeberin schlägt Ihnen den nächsten Abend vor.' : '') + ' Sie meldet sich heute noch bei Ihnen.'
        : 'Vielen Dank' + nm + '. Ihre Anfrage liegt jetzt bei unserer Gastgeberin.' + (zu ? ' Wir haben ' + ABEND.tage + ' geöffnet; sie schlägt Ihnen den nächsten Abend vor.' : '') + ' Lena Hartmann meldet sich heute noch bei Ihnen.', belegt: true };
    }
    else a = antwort(t);
    const zeit = jetzt();
    D.fragen.unshift({ zeit, frage: t, antwort: a.text, belegt: a.belegt, thema: a.belegt ? '' : t.replace(/[?!.]+$/, '').slice(0, 60), gruppe: themaVon(t), sprache: englisch(t) ? 'en' : 'de',
      buchung: false, mappe: false, anfrage: MAIL.test(t) ? 'ja' : '', beispiel: false, id: 'fragen/' + tagPfad(zeit) + '/' + Date.now() + '_chat.json', erledigt: false });
    return { text: a.text };
  }
  /* Die Antwort erscheint, als würde sie gerade geschrieben */
  function tippe(el, text) {
    return new Promise(fertig => {
      const w = String(text).split(/(\s+)/); let i = 0;
      el.textContent = '';
      const l = el.parentElement;
      const lauf = () => { i = Math.min(w.length, i + 3); el.textContent = w.slice(0, i).join(''); if (l) l.scrollTop = l.scrollHeight; if (i < w.length) setTimeout(lauf, 40); else fertig(); };
      lauf();
    });
  }

  /* PDF: derselbe A4-Satz wie beim Server (brief-pdf.html, BRIEF_SETZEN), als Vorschau im Fenster; es entsteht keine Datei */
  function pdf(a) {
    const e = a.entwurf || {};
    const daten = { name: a.name || '', kontakt: a.kontakt || '', absender: e.absender || KONTAKT, betreff: e.betreff || '', text: e.text || '', gestalt: e.gestalt || {} };
    quit('Das PDF wird gesetzt', 'Das dauert einen Moment.', [], false, 2500);
    fenster(`<span class="mono">Als PDF</span><h2>Der Brief <em>auf A4.</em></h2>
      <p>So steht der Brief an ${esc(a.name || 'den Gast')} auf dem Papier des Restaurants. In der Vorführung entsteht keine Datei.</p>
      <div class="vf-a4" id="vf-a4"><iframe src="brief-pdf.html" title="Brief als A4-Seite" id="vf-a4-f" scrolling="no"></iframe></div>
      <div class="fenster__kn"><button class="link" type="button" data-zu>Schliessen</button><button class="kn kn--gold" type="button" id="f-los">Herunterladen<i>${SYM.post}</i></button></div>`, false,
      () => { if (window.DEMO) DEMO.hinweis('In der Vorführung entsteht keine Datei. So sähe Ihr Brief als PDF aus.'); });
    const f = document.getElementById('vf-a4-f');
    f.addEventListener('load', async () => {
      try {
        await f.contentWindow.BRIEF_SETZEN(daten);
        const seiten = f.contentDocument.querySelectorAll('.seite').length || 1, box = document.getElementById('vf-a4');
        const s = box.clientWidth / 794;
        f.style.height = (1123 * seiten + 24 * (seiten - 1)) + 'px'; f.style.transform = `scale(${s})`;
        box.style.height = Math.ceil((1123 * seiten + 24 * (seiten - 1)) * s) + 'px';
      } catch (x) { /* Vorschau bleibt leer, das Fenster bleibt bedienbar */ }
    }, { once: true });
  }

  /* Sprungadressen für die Bilder im Atelier: #eingang-a07, #brief-a01, #gefragt-luecke, #wissen-das-menue, #probe, #probe-gespraech */
  function sprung(h) {
    let m;
    if ((m = /^(eingang|brief)-(a\d+)$/.exec(h))) { const a = D.anfragen.find(x => x.id.endsWith('_' + m[2] + '.json')); if (a) { S.ansicht = 'eingang'; S.wahl = a.id; if (a.status === 'neu') a.status = 'gelesen'; } }
    if (h === 'gefragt-luecke') { S.ansicht = 'gefragt'; S.wahl = 'luecke'; }
    if ((m = /^wissen-(.+)$/.exec(h))) { S.ansicht = 'wissen'; S.bereich = BEREICHE.find(b => b.toLowerCase().normalize('NFD').replace(/[^\w]+/g, '-').startsWith(m[1])) || ''; }
    if (/^probe/.test(h)) S.ansicht = 'start';
  }
  function nachSprung(h) {
    if (/^brief-/.test(h)) setTimeout(() => { const p = document.querySelector('.re-post'); if (p) scrollTo({ top: p.getBoundingClientRect().top + scrollY - 90 }); }, 50);
    if (/^probe/.test(h)) {
      probe();
      if (h === 'probe-gespraech') {
        const l = document.getElementById('probe-l'), b = (t, w) => { const p = document.createElement('p'); p.className = 'ws-bl ws-bl--' + w; p.setAttribute('dir', 'auto'); p.textContent = t; l.appendChild(p); };
        ['q4', 'q6', 'q10'].forEach(id => { const q = W.FRAGEN.find(x => x.id === id); b(q.de, 'gast'); b(q.a, 'haus'); });
        l.scrollTop = l.scrollHeight;
      }
    }
  }

  /* Meldungen aus ../_kleid/demo.js erscheinen im Werkzeug wie jede Meldung der Vorlage (quit in reception.js) */
  if (window.DEMO) { const roh = DEMO.hinweis; DEMO.hinweis = function (t) { if (typeof quit === 'function' && document.getElementById('meldung')) return quit('Vorführung', t || 'Ihre Änderung wirkt nur hier und ist nach dem Neuladen wieder wie vorher.', [], false, 6500); return roh.call(DEMO, t); }; }
  window.VORF = { api, gast, tippe, pdf, sprung, nachSprung, zuruecksetzen: anfang, bildFuer: id => { const a = D.anfragen.find(x => x.id === id); return a && a.bild ? a.bild + '-800' : ''; },
    probefragen: ['q4', 'q6', 'q10'].map(id => W.FRAGEN.find(q => q.id === id).de).concat([W.FRAGEN.find(q => q.id === 'q1').en]) };   // vier zum Antippen wie in der Vorlage, eine davon auf Englisch; jede andere Frage geht über das Feld
})();
