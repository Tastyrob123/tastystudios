/* Anfragen & Chat · Vorführ-Betrieb (Ihr Haus). Ersetzt den Server-Teil des Werkzeugs: reception.js fragt VORF.api(was, daten) statt /api/…
   und bekommt Antworten in derselben Form wie vom Server. Alles lebt nur im Arbeitsspeicher; Neuladen stellt den Anfangsstand her.
   Keine echte KI: Briefe, Übersetzungen und Antworten des Chats sind vorgeschrieben (daten.js) und erscheinen, als würden sie gerade geschrieben.
   Fakten des Hauses kommen aus window.HAUS (haus.py), nie erfunden. */
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
  const KONTAKT = 'Empfang Ihr Haus · ' + H.HAUS.telefon + ' · ' + H.HAUS.mail;
  const HAUSNAME = H.HAUS.name;

  /* ------------------------------------------------------------ Anfragen in der Form des Servers */
  const ARTMAP = { zimmer: 'zimmer', tafel: 'tafel', feier: 'feier', gruppe: 'feier', frage: 'nachricht' };
  const ABT = { zimmer: 'Empfang', tafel: 'Tafel', feier: 'Feiern', nachricht: 'Nachrichten' };
  const ABT_X = { gruppe: 'Gruppen' };   // Gruppen (mehrere Zimmer) laufen als Art «Feier», gehören aber zu den Gruppen
  /* Je Anfrage: wann, über welchen Weg, und für Anfragen aus dem Chat das Gespräch */
  const ZUSATZ = {
    a01: { tage: 0, uhr: '14:12', web: true, formular: 'zimmer', seite: 'Zimmer', kueche: ['kein Fisch (eine Person)'] },
    a02: { tage: 0, uhr: '11:48', web: true, formular: 'tafel', seite: 'Die Tafel', kueche: ['vegetarisch (eine Person)', 'Nüsse (eine Person)'] },
    a03: { tage: 1, uhr: '18:30', web: true, formular: 'feier', seite: 'Kontakt' },
    a04: { tage: 1, uhr: '10:05', web: true, formular: 'feier', seite: 'Kontakt' },
    a05: { tage: 0, uhr: '09:20', chat: [
      ['user', 'Guten Morgen. Dürfen Hunde mit ins Zimmer?'],
      ['assistant', 'Sehr gern. Hunde sind willkommen, 20 € je Nacht, mit Decke, Napf und Handtuch auf dem Zimmer. In die Bar darf Ihr Hund mit, während der Tafel bleibt er bitte auf dem Zimmer. Lotte, unser Hund, liegt meistens neben dem Empfang.'],
      ['user', 'Wir reisen mit Ole, einem ruhigen Labrador. Ist das in Ordnung, und verträgt er sich mit Lotte? Abends würden wir gern in die Bar. Speicherzimmer vom 20. bis 22. November, Ina Lorenzen, ina.lorenzen@example.com'],
      ['assistant', 'Vielen Dank, Frau Lorenzen. Ihre Anfrage liegt jetzt am Empfang. Tomke Claussen meldet sich heute noch bei Ihnen.']] },
    a06: { tage: 0, uhr: '07:55', chat: [
      ['user', 'Wie komme ich mit der Fähre zu Ihnen?'],
      ['assistant', 'Von den Landungsbrücken fährt die Hafenfähre 72 bis zur Elbphilharmonie. Wenn Sie dort aussteigen, sehen Sie das Haus schon, am Sandtorkai 7.'],
      ['user', 'Wir kommen am Freitag mit dem Zug und möchten das letzte Stück mit der Fähre zu Ihnen fahren. Geht das mit zwei Koffern? Wir sind schon gegen 12 Uhr in Hamburg. Gisela Rautenberg, g.rautenberg@example.com'],
      ['assistant', 'Danke, Frau Rautenberg. Ich gebe Ihre Frage an den Empfang, Sie hören heute noch von uns.']] },
    a07: { tage: 1, uhr: '21:40', web: true, formular: 'zimmer', seite: 'Zimmer' },
    a08: { tage: 2, uhr: '16:10', web: true, formular: 'zimmer', seite: 'Zimmer' },
    a09: { tage: 3, uhr: '08:30', chat: [
      ['user', 'Bis wann müssen wir am Sonntag aus dem Zimmer?'],
      ['assistant', 'Abreise ist bis 11 Uhr. Wenn das Zimmer frei ist, bleiben Sie gegen 30 € bis 14 Uhr.'],
      ['user', 'Können wir am Sonntag etwas länger bleiben? Unser Zug geht erst um 16 Uhr. Annika Brüggemann, Kranzimmer, a.brueggemann@example.com'],
      ['assistant', 'Danke, Frau Brüggemann. Der Empfang sieht nach, ob das Kranzimmer frei ist, und meldet sich gleich.']] },
    a10: { tage: 2, uhr: '11:00', web: true, formular: 'zimmer', seite: 'Anreise' },
    a11: { tage: 0, uhr: '13:05', web: true, formular: 'feier', seite: 'Die Tafel' },
    a12: { tage: 4, uhr: '19:20', web: true, formular: 'zimmer', seite: 'Zimmer' },
    a13: { tage: 5, uhr: '15:45', kueche: ['Gluten (Zöliakie)'], chat: [
      ['user', 'Kann die Küche glutenfrei kochen?'],
      ['assistant', 'Bitte melden Sie Unverträglichkeiten bis zum Vortag, dann richtet sich die Küche danach. Mareike Voss richtet einzelne Gänge eigens für Sie an.'],
      ['user', 'Wir wohnen am Wochenende bei Ihnen und möchten am Samstag an die Tafel. Ich habe Zöliakie und darf nichts mit Gluten essen. Marlene Voigt, marlene.voigt@example.com'],
      ['assistant', 'Danke, Frau Voigt. Ihre Anfrage für Samstag liegt jetzt beim Service, die Küche weiss Bescheid.']] },
    a14: { tage: 6, uhr: '12:10', chat: [
      ['user', 'Wo kann ich parken?'],
      ['assistant', 'Einen eigenen Parkplatz hat das Haus nicht. Sie halten zum Ausladen direkt vor der Tür am Sandtorkai 7. Danach sind es drei Minuten zu Fuss ins Parkhaus Speicherstadt, 24 € je Tag.'],
      ['user', 'Wir kommen mit dem Auto und viel Gepäck. Können Sie uns dort einen Platz reservieren? Thomas Behrendt, t.behrendt@example.com'],
      ['assistant', 'Gern, Herr Behrendt. Ich gebe es an den Empfang, er reserviert und meldet sich bei Ihnen.']] },
    a15: { tage: 0, uhr: '16:02', web: true, formular: 'feier', seite: 'Kontakt' }
  };
  /* Offene Stellen im Brief, die das Team selbst einsetzt (wie in der Vorlage als [Klammer]) */
  const OFFEN = {
    a08: [['Den Preis für den Jahreswechsel schickt Ihnen Henrike Rademacher bis morgen Mittag.', 'Für die zwei Nächte zum Jahreswechsel berechnen wir [Preis Silvester, zwei Nächte].']],
    a12: [['Den Preis für die Weihnachtstage schickt Ihnen Henrike Rademacher bis morgen. Wir halten das Zimmer so lange für Sie.', 'Für die drei Weihnachtsnächte berechnen wir [Preis Weihnachten, drei Nächte]. Wir halten das Zimmer bis [Datum] für Sie.']],
    a03: [['Sagen Sie mir einfach, wann es Ihnen passt.', 'Passt es Ihnen am [Tag und Uhrzeit für die Besichtigung]?']]
  };
  const hinweisArt = t => /Hund/.test(t) ? 'hund' : /Küche|Nüsse|Fisch|Gluten|vegetarisch|Unverträglich/i.test(t) ? 'allergie' : /Preis auf Anfrage/.test(t) ? 'termin'
    : /Hauptsaison/.test(t) ? 'saison' : /\d+ Gäste|Dachboden: bis|fasst|Zimmern für eine Nacht/.test(t) ? 'gruppe' : 'info';
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
      entwurf: { betreff: b.betreff, text: brief, team: 'Grundlage: ' + x.weg + ', die Seiten und Regeln des Hauses.' + ((OFFEN[x.id] || []).length ? '\nOffen: was in Klammern steht, setzt das Team ein.' : ''),
        vorlage: art, absender: KONTAKT, zeit, fassung: 1, original: { text: brief, betreff: b.betreff }, gestalt: {} }
    };
    if (z.web) Object.assign(a, { web: true, formular: z.formular, seite: '/kontakt.html', seite_name: z.seite, nachricht: felder,
      verlauf: [{ rolle: 'user', text: 'Über ein Formular der Website (Seite ' + z.seite + '): ' + felder }] });
    else a.verlauf = (z.chat || [['user', x.nachricht]]).map(([rolle, t]) => ({ rolle, text: t }));
    if (x.sprache === 'en') {
      const de = 'Sehr geehrter Herr Whitfield,\n\n' + x.brief_de + '\n\nHerzliche Grüsse vom Sandtorkai\n\nTomke Claussen\nEmpfang · ' + HAUSNAME;
      a.entwurf.deutsch = { betreff: 'Ihr Aufenthalt am Hafen · 4. bis 7. Dezember', text: de, quelle: 'beispiel' };
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
    const hs = H.HAUS, a = hs.adresse, r = Object.fromEntries(H.REGELN), fr = H.FRUEHSTUECK, t = H.TAFEL, bar = H.BAR;
    B('Das Haus', [['Auf einen Blick', [['Was es ist', hs.kurz], ['Adresse', a.strasse + ', ' + a.plz + ' ' + a.ort], ['Gebaut', hs.baujahr + ', als Speicher für Kaffee und Tabak', H.GESCHICHTE[0][1]],
      ['Eröffnet', 'im Mai ' + hs.eroeffnet + ' mit zwölf Zimmern, der Tafel und der Bar', H.GESCHICHTE[4][1]], ['Böden', hs.boeden + ' Böden, Aufzug zu allen']]],
      ['Kontakt', [['Telefon', hs.telefon], ['E-Mail', hs.mail], ['Empfang', 'sieben Tage die Woche, Tomke Claussen und zwei Kolleginnen im Wechsel', H.FIRMA.struktur[3][2]]]]]);
    B('Zimmer', [['Die vier Zimmerarten', H.ZIMMER.map(z => [z.name, `${z.qm} m², ${z.lage}, Bett ${z.bett}, ${z.boden}`, z.satz])],
      ['Ausstattung', [['In jedem Zimmer', 'Leinenbettwäsche, Bad mit Regendusche, Lesebeleuchtung aus Messing'], ['Wanne', 'freistehend in den Kranzimmern und in der Dachsuite']]]]);
    B('Preise & Saison', [['Je Nacht für zwei mit Frühstück', H.ZIMMER.map(z => [z.name, `${z.preis.neben} € (${H.SAISON.neben}), ${z.preis.haupt} € (${H.SAISON.haupt})`])],
      ['Gut zu wissen', [['Einzelbelegung', '30 € weniger', H.SAISON.hinweis], ['Feiertage', 'Hafengeburtstag, Weihnachten und Silvester auf Anfrage', H.SAISON.hinweis]]]]);
    B('Anreise & Abreise', [['Zeiten', [['Anreise', r.Anreise], ['Abreise', r.Abreise]]], ['Gepäck', [['Gepäck', 'nehmen wir jederzeit an, auch vor der Anreise und nach der Abreise', r.Anreise]]]]);
    B('Wege zum Haus', [['So kommen Sie', H.ANREISE.map(([w, s]) => [w, s])], ['Vor Ort', [['Parken', r.Parken], ['Räder', r['Räder']]]]]);
    B('Frühstück', [['Frühstück', [['Zeit', fr.zeit + ', sonntags ' + fr.sonntag], ['Was es gibt', 'Brot aus dem Ofen, Franzbrötchen, Eier wie gewünscht, Fisch vom Markt, Obst, Kaffee aus der Speicherstadt', fr.satz],
      ['Für Hausgäste', 'eingeschlossen, aufs Zimmer gegen 12 €', fr.satz], ['Für Gäste von aussen', fr.preis_extern + ' €']]]]);
    B('Die Tafel', [['Der Abend', [['Tage', t.tage + ', ab ' + t.ab + ', Einlass ' + t.einlass], ['Menü', t.gaenge + ' Gänge, ' + t.preis + ' €, Weinbegleitung ' + t.wein + ' €', t.satz],
      ['Vegetarisch', 'immer eine vegetarische Fassung', t.satz], ['Plätze', t.plaetze + ' Plätze']]], ['Regeln', [['Reservierung', t.regeln[0]], ['Unverträglichkeiten', t.regeln[1]], ['Kinder an der Tafel', t.regeln[2]], ['Tischgrössen', t.regeln[3]]]],
      ['Woher', t.lieferanten.map(([w, s]) => [w, s])]]);
    B('Die Bar', [['Die Bar', [['Geöffnet', bar.zeit], ['Plätze', bar.plaetze + ' Plätze an einer Theke aus Messing', bar.satz], ['Nach Schluss', 'Hausgäste bekommen auch nach Schluss noch ein Glas', bar.satz]]],
      ['Karte', bar.karte.map(([n, s, p]) => [n, s + ', ' + p + ' €'])]]);
    B('Hunde & Kinder', [['Hunde', [['Hunde', r.Hunde], ['Lotte', H.FIRMA.hund.satz]]], ['Kinder', [['Kinder', r.Kinder], ['An der Tafel', t.regeln[2]]]]]);
    B('Feiern', [['Orte', H.FEIERN.orte.map(([n, s]) => [n, s])], ['Planung', [['Wer plant', H.FEIERN.satz]]]]);
    B('Regeln im Haus', [['Regeln', [['Stornierung', r.Stornierung], ['Zahlung', r.Zahlung], ['Rauchen', r.Rauchen], ['Ruhe', r.Ruhe], ['Barrierefreiheit', r.Barrierefreiheit], ['WLAN', r.WLAN]]]]);
    B('Team', [['Wer was macht', H.FIRMA.struktur.map(([rolle, wer, s]) => [rolle, wer, s])]]);
    B('Umgebung', [['Zu Fuss und mit der Fähre', H.UMGEBUNG.map(([o, s]) => [o, s])]]);
    return sb;
  }
  const BEREICHE = ['Das Haus', 'Zimmer', 'Preise & Saison', 'Anreise & Abreise', 'Wege zum Haus', 'Frühstück', 'Die Tafel', 'Die Bar', 'Hunde & Kinder', 'Feiern', 'Regeln im Haus', 'Team', 'Umgebung', 'Veranstaltungen', 'Fragen & Antworten'];
  const THEMEN = [['Allergien & Unverträglichkeiten', /allerg|gluten|laktose|zöliak|unverträg|nuss|nüss|vegan|vegetar|celiac|nuts|intoleran/i], ['Hunde & Kinder', /hund|dog|lotte|kind|baby|zustellbett|child/i],
    ['Feiern & Gruppen', /feier|geburtstag|hochzeit|firmen|gruppe|dachboden|exklusiv|party\b|birthday|wedding|group|attic|celebrat/i], ['Die Tafel', /tafel|menü|menu|gang|gänge|abendessen|dinner|tisch|table|wein/i],
    ['Frühstück & Bar', /frühstück|breakfast|\bbar\b|cocktail|drink/i], ['Anreise & Abreise', /check|anreise|abreise|ankunft|auschecken|einchecken|früher|später|arrive|late|gepäck|storn|cancel|sonntag/i],
    ['Wege & Parken', /park|auto|fähre|faehre|bahn|flughafen|taxi|weg\b|elbphilharmonie|\brad\b|ferry|airport|station|laden/i], ['Zimmer & Preise', /zimmer|room|wanne|bath|preis|kost|€|suite|wlan|sauna|gym/i]];
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
  const merke = (art, titel, bereich, ref) => D.verlauf.unshift({ zeit: jetzt(), art, titel, bereich, ref, wer: 'Empfang Ihr Haus' });
  const fehler = t => { throw new Error(t); };
  const nachId = id => D.anfragen.find(a => a.id === id) || fehler('ANFRAGE · Diese Anfrage gibt es nicht mehr.');
  const sortiert = l => l.slice().sort((x, y) => String(y.zeit).localeCompare(String(x.zeit)));

  /* ------------------------------------------------------------ Der Chat: vorgeschriebene Antworten aus dem Wissen */
  const ORDNUNG = ['q5', 'q8', 'q3', 'q10', 'q7', 'q14', 'q12', 'q13', 'q11', 'q15', 'q4', 'q2', 'q1', 'q6'];
  /* welche Zeilen des Steckbriefs hinter einer Antwort stehen: ändert das Team sie, antwortet der Chat mit der neuen Angabe */
  const BELEG = { q1: [['Anreise & Abreise', 'Anreise']], q2: [['Anreise & Abreise', 'Abreise']], q3: [['Wege zum Haus', 'Parken']], q4: [['Frühstück', 'Zeit'], ['Frühstück', 'Für Hausgäste']],
    q5: [['Hunde & Kinder', 'Hunde'], ['Hunde & Kinder', 'Lotte']], q6: [['Die Tafel', 'Tage'], ['Die Tafel', 'Menü']], q7: [['Die Tafel', 'Unverträglichkeiten']], q8: [['Wege zum Haus', 'Mit dem Schiff']],
    q10: [['Zimmer', 'Kranzimmer'], ['Zimmer', 'Dachsuite']], q11: [['Regeln im Haus', 'Stornierung'], ['Regeln im Haus', 'Zahlung']], q12: [['Hunde & Kinder', 'Kinder']],
    q13: [['Feiern', 'Der Dachboden'], ['Feiern', 'Die Tafel exklusiv'], ['Feiern', 'Das ganze Haus']], q14: [['Regeln im Haus', 'Barrierefreiheit']], q15: [['Die Bar', 'Geöffnet']] };
  const englisch = t => /\b(the|is|are|can|could|do|does|you|your|what|when|where|how|which|room|breakfast|dog|parking|check|we|would|like|table|dinner|book|please|our|have|guests|people|night|nights|stay)\b/i.test(t) && !/[äöüß]|\b(ich|wir|sie|ist|gibt|kann|wann|wie|wo)\b/i.test(t);
  const STOPP = new Set(('gibt es ich wir sie kann können könnte man wann wie was wo wer welche welcher welches der die das den dem des ein eine einen einem einer und oder an am auf im in ins für bei zu zum zur '
    + 'ihr ihre ihren ihnen haben habt hat ist sind sein mein meine noch auch bitte uns euch mit von vom nach über unter nicht nur gern gerne schon dort hier da so sehr '
    + 'the is are can could do does you your what when where how which there a an of to for in on at and or my me we our').split(' '));
  const woerter = t => String(t || '').toLowerCase().normalize('NFC').split(/[^a-zäöüß0-9]+/).filter(w => w.length > 2 && !STOPP.has(w));
  /* gehört ein Wort schon zu einer festen Antwort (Bar, Parken, Frühstück …), entscheidet es nicht allein für einen Eintrag des Teams */
  const allgemein = w => W.FRAGEN.some(q => q.s.test(w)) || W.STICHWORTE.some(k => k.s.test(w));
  function antwort(text) {
    const t = String(text || ''), en = englisch(t), klein = t.toLowerCase();
    /* Was das Team eingetragen oder nachgetragen hat, geht vor: es reicht ein Wort der Frage, das in Titel oder Text steht
       und nicht schon zu einer festen Antwort gehört (Grog, Sauna, Ladesäule …), auch kurze Hauptwörter */
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
  /* Angaben aus dem Gespräch: Tage, Zimmer, Gäste (wie der Assistent der Vorlage, nur fest gerechnet) */
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
    const ZEN = { speicher: /warehouse room/, wasser: /room by the water|water room|room with (?:a )?view of the (?:water|elbe)/, kran: /crane room/, dach: /roof suite|attic suite/ };
    const z = H.ZIMMER.find(x => k.includes(x.name.toLowerCase()) || (x.id === 'kran' && k.includes('kranzimmer')) || (x.id === 'dach' && k.includes('suite')) || ZEN[x.id].test(k));
    if (z) r.zimmer = z;
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
  const TAFELTAGE = (() => { const t = H.TAFEL.tage.toLowerCase(), von = TAGE.findIndex(x => t.startsWith(x.toLowerCase())), bis = TAGE.findIndex(x => t.endsWith(x.toLowerCase())); const l = []; for (let k = von; ; k = (k + 1) % 7) { l.push(k); if (k === bis) break; } return l; })();
  /* Stornierung aus den Regeln des Hauses: allgemein und für die Dachsuite */
  const STORNO = (() => { const r = Object.fromEntries(H.REGELN).Stornierung || ''; return { sonst: (r.match(/bis (\S+) Tage(?:n)? vor Anreise/) || [, 'sieben'])[1], dach: (r.match(/Dachsuite bis (\S+) Tage/) || [, '14'])[1] }; })();
  /* Angaben eines Gesprächs: der jüngste Satz des Gastes zählt, ältere Sätze derselben Anfrage ergänzen nur, was dort fehlt */
  function angabenGespraech(saetze) {
    const g = {}, felder = ['von', 'bis', 'monat', 'tage', 'naechte', 'tag', 'tagNr', 'zimmer', 'personen'];
    saetze.slice().reverse().forEach(t => { const x = angabenAus(t); if (g.tage == null && g.tag == null && (x.tage || x.tag)) felder.slice(0, 7).forEach(k => { if (x[k] != null) g[k] = x[k]; }); if (!g.zimmer && x.zimmer) g.zimmer = x.zimmer; if (g.personen == null && x.personen != null) g.personen = x.personen; });
    return g;
  }
  function artVon(saetze) {
    for (const t of saetze.slice().reverse()) { if (/feier|geburtstag|hochzeit|dachboden|gruppe|celebrat|party|wedding|birthday|attic|group/i.test(t)) return 'feier'; if (/tafel|tisch|abendessen|menü|dinner|table/i.test(t)) return 'tafel'; if (/zimmer|suite|übernacht|nächte|nacht\b|room|night|stay/i.test(t)) return 'zimmer'; }
    return 'zimmer';
  }
  /* Brief und Hinweise einer Anfrage aus dem Chat, aus Angaben und Regeln des Hauses gerechnet (wie reception.hinweise der Vorlage) */
  let TAFEL_INFO = null;
  function briefFuer(art, g, nm, alles) {
    TAFEL_INFO = null;
    const hinweise = [], kueche = [];
    const nachname = nm === 'Gast aus dem Chat' ? '' : nm;
    const anrede = nachname ? 'Guten Tag ' + nachname + ',' : 'Guten Tag,';
    const tage = g.tage || g.tag || '[Tage des Aufenthalts]', fuer = g.tage ? 'Vom ' + g.tage : g.tag ? 'Für den ' + g.tag : 'Für [Tage des Aufenthalts]';
    const saison = g.monat == null ? null : (g.monat >= 3 && g.monat <= 9 ? 'haupt' : 'neben');
    const feiertag = g.monat === 11 && g.von != null && (g.von >= 24 || g.bis >= 24);
    if (/hund/i.test(alles)) hinweise.push({ art: 'hund', text: 'Hund: ' + Object.fromEntries(H.REGELN).Hunde.split('.')[0] });
    const KUECHE = [[/zöliak|celiac|coeliac/i, 'Gluten (Zöliakie)'], [/gluten/i, 'Gluten'], [/nuss|nüss|\bnuts?\b/i, 'Nüsse'], [/laktose|lactose|milch|dairy/i, 'Laktose'], [/vegan/i, 'vegan'],
      [/vegetar/i, 'vegetarisch'], [/meeresfrücht|shellfish|seafood/i, 'Meeresfrüchte'], [/kein(?:en)? fisch|no fish|fischallerg|fish allerg/i, 'kein Fisch'], [/sellerie|celery/i, 'Sellerie'], [/\beier?\b|\beggs?\b/i, 'Ei']];
    const allerg = KUECHE.filter(([re]) => re.test(alles)).map(([, n]) => n).filter((n, k, l) => !(n === 'Gluten' && l.includes('Gluten (Zöliakie)')));
    if (allerg.length) { kueche.push(...allerg); hinweise.push({ art: 'allergie', text: 'Für die Küche: ' + allerg.join(', ') + '. Bis zum Vortag melden' }); }
    let betreff, absatz;
    if (art === 'zimmer') {
      const z = g.zimmer, dach = z && z.id === 'dach';
      const zimmer = z ? (dach ? 'die Dachsuite' : 'ein ' + z.name) : '[Zimmer]';
      if (saison === 'haupt') hinweise.push({ art: 'saison', text: 'Hauptsaison (' + H.SAISON.haupt + ')' });
      if (feiertag) hinweise.push({ art: 'termin', text: 'Weihnachten und Silvester: Preis auf Anfrage' });
      if (g.personen > 2) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: ' + Object.fromEntries(H.REGELN).Kinder });
      const preis = feiertag ? 'Für die Feiertage berechnen wir [Preis Weihnachten oder Silvester], das Frühstück ist eingeschlossen.'
        : z && saison && g.naechte ? (g.naechte === 1 ? 'Eine Nacht kostet ' : (g.naechte === 2 ? 'Zwei' : g.naechte === 3 ? 'Drei' : g.naechte) + ' Nächte kosten ') + (z.preis[saison] * g.naechte) + ' €, das Frühstück ist eingeschlossen.'
        : 'Der Preis für Ihre Nächte: [Preis], das Frühstück ist eingeschlossen.';
      const storno = dach ? 'Kostenlos stornieren können Sie die Dachsuite bis ' + STORNO.dach + ' Tage vor Anreise.' : 'Kostenlos stornieren können Sie bis ' + STORNO.sonst + ' Tage vor Anreise.';
      betreff = 'Ihr Zimmer am Sandtorkai · ' + tage;
      absatz = 'vielen Dank für Ihre Anfrage im Chat. ' + fuer + ' halten wir Ihnen ' + zimmer + ' frei' + (g.personen ? ', für ' + (g.personen === 1 ? 'eine Person' : g.personen + ' Personen') : '') + '. ' + (z ? z.satz : '') + '\n\n' + preis
        + ' Ihr Zimmer ist ab 15 Uhr bereit, Ihr Gepäck nehmen wir gern auch früher an.\n\nFür eine verbindliche Buchung genügt eine kurze Antwort. ' + storno;
    } else if (art === 'tafel') {
      const plaetze = g.personen ? (g.personen === 1 ? 'einen Platz' : g.personen + ' Plätze') : '[Zahl] Plätze';
      let tagText = g.tag ? 'den ' + g.tag : g.tage ? 'den ' + g.tage : '[Tag]', geschlossen = false, vorschlag = '';
      let vorschlagD = null, tagD = null;
      if (g.tagNr != null && g.monat != null) {
        const d = datumVon(g.tagNr, g.monat), wt = d.getDay(); tagD = d;
        tagText = TAGE[wt] + ', den ' + g.tag;
        if (!TAFELTAGE.includes(wt)) {
          geschlossen = true;
          const n = new Date(d); do n.setDate(n.getDate() + 1); while (!TAFELTAGE.includes(n.getDay()));
          vorschlag = TAGE[n.getDay()] + ', den ' + n.getDate() + '. ' + MONAT_NAME(n.getMonth()); vorschlagD = n;
          hinweise.unshift({ art: 'ruhetag', text: 'Am ' + TAGE[wt] + ' ist die Tafel geschlossen: ' + H.TAFEL.tage + '. Nächster Abend ' + vorschlag });
        }
      }
      if (g.personen > H.TAFEL.plaetze) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: mehr als die Tafel fasst (' + H.TAFEL.plaetze + ')' });
      TAFEL_INFO = { geschlossen, tagD, vorschlagD };
      betreff = 'Ihr Abend an der Tafel · ' + (geschlossen ? vorschlag : (g.tag || g.tage || '[Tag]'));
      absatz = geschlossen
        ? 'vielen Dank für Ihre Anfrage im Chat. Die Tafel ist von ' + H.TAFEL.tage + ' geöffnet; am ' + tagText + ', kocht die Küche keinen Abend. Gern halten wir Ihnen ' + plaetze + ' am ' + vorschlag + ', frei, Einlass ab ' + H.TAFEL.einlass + ', um ' + H.TAFEL.ab + ' beginnt das Menü.'
        : 'vielen Dank für Ihre Anfrage im Chat. Für ' + (tagText.includes(', den ') ? tagText + ',' : tagText) + ' haben wir Ihnen ' + plaetze + ' an der Tafel vorgemerkt. Einlass ist ab ' + H.TAFEL.einlass + ', um ' + H.TAFEL.ab + ' beginnt das Menü.';
      absatz += '\n\nGekocht wird, was der Hafenmarkt am Morgen hatte, in fünf Gängen und von Hand angerichtet. Das Menü kostet ' + H.TAFEL.preis + ' € je Person, die Weinbegleitung ' + H.TAFEL.wein + ' €. Eine vegetarische Fassung gibt es immer.\n\n'
        + (kueche.length ? 'Ihre Wünsche für die Küche haben wir notiert, Mareike Voss richtet die Gänge danach an.' : 'Unverträglichkeiten nennen Sie uns bitte bis zum Vortag, dann richtet sich die Küche danach.')
        + (/hund/i.test(alles) ? ' Ihr Hund ist in der Bar willkommen, während der Tafel bleibt er bitte auf dem Zimmer.' : '');
    } else {
      if (g.personen > 28) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: mehr als Dachboden (24) und Tafel (28), nur das ganze Haus' });
      else if (g.personen > 24) hinweise.push({ art: 'gruppe', text: g.personen + ' Gäste: mehr als der Dachboden fasst (24), die Tafel exklusiv bis 28' });
      betreff = 'Ihre Feier im Haus · ' + (g.tag || g.tage || '[Tag]');
      absatz = 'vielen Dank für Ihre Anfrage im Chat. ' + (g.tag ? 'Für den ' + g.tag : g.tage ? 'Für den ' + g.tage : 'Für [Tag]') + (g.personen ? ' und ' + g.personen + ' Gäste' : '') + ' sehen wir nach, was frei ist: der Dachboden für bis zu 24 Gäste, die Tafel für bis zu 28 oder das ganze Haus.'
        + '\n\nWas der Abend kostet, hängt vom Menü und vom Wein ab. Am liebsten zeige ich Ihnen die Räume einmal selbst. Danach schicke ich Ihnen einen genauen Vorschlag.';
    }
    const v = { zimmer: ['Wir freuen uns auf Sie. Herzliche Grüsse vom Sandtorkai', 'Tomke Claussen', 'Empfang'], tafel: ['Herzliche Grüsse', 'Tomke Claussen', 'Empfang'], feier: ['Herzliche Grüsse', 'Henrike Rademacher', 'Gastgeberin'] }[art];
    const text = anrede + '\n\n' + absatz + '\n\n' + v[0] + '\n\n' + v[1] + '\n' + v[2] + ' · ' + HAUSNAME;
    return { betreff, text, hinweise, kueche, tafel: art === 'tafel' ? TAFEL_INFO : null };
  }
  /* Englischer Brief für Gäste, die englisch schreiben (wie der Brief an James Whitfield); die deutsche Fassung wird zur Lesefassung */
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = m => MONATE_EN[m].charAt(0).toUpperCase() + MONATE_EN[m].slice(1);
  const ZIMMER_EN = { speicher: ['the Warehouse Room', 'Under the old beam, with brick on two sides and oak floorboards. The window looks onto the canal.'],
    wasser: ['a Room by the Water', 'The bed is placed so that your first glance in the morning falls on the water. By the window stands an oak desk.'],
    kran: ['a Crane Room', 'Two tall windows with the cranes outside, and a bath from which you can see them.'],
    dach: ['the Roof Suite', 'Right at the top under the roof timbers of 1888, with a skylight, a freestanding bath and a bathroom in bottle green.'] };
  function briefEnglisch(art, g, nm, tafel, kueche) {
    const anrede = nm !== 'Gast aus dem Chat' ? 'Dear ' + nm + ',' : 'Dear guest,';
    const zahl = n => ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'][n] || String(n);
    const tageEn = g.tage ? g.von + ' to ' + g.bis + ' ' + MONTH(g.monat) : g.tag ? g.tagNr + ' ' + MONTH(g.monat) : null;
    const tagEn = d => DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH(d.getMonth());
    const saison = g.monat == null ? null : (g.monat >= 3 && g.monat <= 9 ? 'haupt' : 'neben');
    const feiertag = g.monat === 11 && g.von != null && (g.von >= 24 || g.bis >= 24);
    let betreff, absatz, gruss = 'Warm regards from Sandtorkai', von = 'Tomke Claussen', rolle = 'Reception';
    if (art === 'zimmer') {
      const z = g.zimmer, dach = z && z.id === 'dach', zn = z ? ZIMMER_EN[z.id] : null;
      const preis = feiertag ? 'For the holidays we charge [price for Christmas or New Year], breakfast included.'
        : z && saison && g.naechte ? (g.naechte === 1 ? 'One night comes to ' : zahl(g.naechte).replace(/^./, c => c.toUpperCase()) + ' nights come to ') + (z.preis[saison] * g.naechte) + ' €, breakfast in the room by the water is included.'
        : 'Your nights come to [price], breakfast is included.';
      betreff = 'Your room at Sandtorkai · ' + (tageEn || '[dates of stay]');
      absatz = 'thank you for your enquiry in our chat. ' + (g.tage ? 'From ' + tageEn : g.tag ? 'For ' + tageEn : 'For [dates of stay]') + ' we are holding ' + (zn ? zn[0] : '[room]') + ' for you' + (g.personen ? ', for ' + (g.personen === 1 ? 'one guest' : zahl(g.personen) + ' guests') : '') + '. ' + (zn ? zn[1] : '')
        + '\n\n' + preis + ' Your room is ready from 3 pm, and we are happy to take your luggage earlier.\n\nA short reply is all it takes to confirm. You can cancel free of charge up to ' + (dach ? STORNO.dach.replace('sieben', 'seven') : STORNO.sonst.replace('sieben', 'seven')) + ' days before arrival.';
    } else if (art === 'tafel') {
      const plaetze = g.personen ? (g.personen === 1 ? 'one place' : zahl(g.personen) + ' places') : '[number] places';
      const t = tafel || {};
      betreff = 'Your evening at our table · ' + (t.geschlossen ? tagEn(t.vorschlagD) : t.tagD ? tagEn(t.tagD) : (tageEn || '[day]'));
      absatz = (t.geschlossen
        ? 'thank you for your enquiry in our chat. Our table is open Thursday to Saturday; on ' + tagEn(t.tagD) + ' the kitchen does not cook an evening. We would gladly hold ' + plaetze + ' for you on ' + tagEn(t.vorschlagD) + '. Doors open at 6.30 pm, the menu begins at 7 pm.'
        : 'thank you for your enquiry in our chat. For ' + (t.tagD ? tagEn(t.tagD) : (tageEn || '[day]')) + ' we have reserved ' + plaetze + ' at our table for you. Doors open at 6.30 pm, the menu begins at 7 pm.')
        + '\n\nWe cook what the harbour market had that morning, in five courses, each plate arranged by hand. The menu is ' + H.TAFEL.preis + ' € per person, the wine pairing ' + H.TAFEL.wein + ' €. There is always a vegetarian version.\n\n'
        + (kueche.length ? 'We have noted your wishes for the kitchen; Mareike Voss will prepare your courses accordingly.' : 'Please let us know of any intolerances by the day before, and the kitchen will cook accordingly.');
    } else {
      betreff = 'Your celebration at the house · ' + (tageEn || '[day]');
      absatz = 'thank you for your enquiry in our chat. For ' + (tageEn || '[day]') + (g.personen ? ' and ' + g.personen + ' guests' : '') + ' we are checking what is available: the attic for up to 24 guests, the table for up to 28, or the whole house.'
        + '\n\nWhat the evening costs depends on the menu and the wine. I would love to show you the rooms in person; afterwards I will send you a detailed proposal.';
      gruss = 'Warm regards'; von = 'Henrike Rademacher'; rolle = 'Host';
    }
    return { betreff, text: anrede + '\n\n' + absatz + '\n\n' + gruss + '\n\n' + von + '\n' + rolle + ' · ' + HAUSNAME };
  }
  function deutschVon(t) {
    const q = W.FRAGEN.find(x => x.ae === t || x.en === t); if (q) return q.ae === t ? q.a : q.de;
    const k = W.STICHWORTE.find(x => x.ae === t); if (k) return k.a;
    if (t === W.CHAT.weiter_en) return W.CHAT.weiter; if (t === W.CHAT.gruss_en) return W.CHAT.gruss;
    if (/^Thank you/.test(t) && /reception/.test(t)) return 'Vielen Dank. Ihre Anfrage liegt jetzt am Empfang. Tomke Claussen meldet sich heute noch bei Ihnen.';
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
    const alles = saetze.join(' '), art = alt && !/feier|tafel|tisch|zimmer|suite/i.test(letzte) ? alt.art : artVon(saetze);
    const nm = alt ? alt.name : ((mailSatz.match(/(?:ich bin|mein name ist|name:|ich heisse|ich heiße)\s*([A-ZÄÖÜ][\wäöüß-]+(?:\s+[A-ZÄÖÜ][\wäöüß-]+)?)/i) || mailSatz.match(/([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)\s*,?\s*[\w.+-]+@/) || [])[1] || 'Gast aus dem Chat');
    const g = angabenGespraech(saetze), b = briefFuer(art, g, nm, alles), en = englisch(alles);
    const e = en ? briefEnglisch(art, g, nm, b.tafel, b.kueche) : null;   // Brief in der Sprache des Gastes, die deutsche Fassung wird zur Lesefassung
    const zeit = jetzt(), id = alt ? alt.id : 'anfragen/' + tagPfad(zeit) + '/' + new Date().toTimeString().slice(0, 8).replace(/:/g, '-') + '-' + Math.random().toString(36).slice(2, 6) + '_chat.json';
    const brief = e || b, offen = (brief.text + brief.betreff).match(/\[[^\]]+\]/g) || [];
    const a = { id, zeit: alt ? alt.zeit : zeit, art, name: nm, kontakt: mail, datum: g.tage || g.tag || '', uhrzeit: art === 'zimmer' && g.naechte ? g.naechte + (g.naechte === 1 ? ' Nacht' : ' Nächte') : art === 'tafel' ? H.TAFEL.ab : '',
      personen: g.personen || '', platz: art === 'zimmer' && g.zimmer ? g.zimmer.name : '', anliegen: alles.slice(0, 200), sprache: en ? 'en' : 'de', status: 'neu', beispiel: false,
      an: KONTAKT, abteilung: ABT[art], bild: art === 'zimmer' && g.zimmer ? g.zimmer.bilder[0][0] : ({ zimmer: 'zimmer', tafel: 'r-gastraum', feier: 's-dachboden' })[art], hinweise: b.hinweise, allergene_lang: b.kueche,
      verlauf: verlauf.map(x => ({ rolle: x.role, text: x.content })), saetze,
      entwurf: { betreff: brief.betreff, text: brief.text, team: 'Grundlage: das Gespräch im Chat, Zimmer, Preise und Regeln des Hauses.' + (en ? ' Brief auf Englisch, die deutsche Fassung zum Mitlesen.' : '') + (offen.length ? '\nOffen: ' + offen.join(', ') + ', setzt das Team ein.' : ''), vorlage: art, absender: KONTAKT, zeit, fassung: alt ? (alt.entwurf.fassung || 0) + 1 : 1, original: { text: brief.text, betreff: brief.betreff }, gestalt: {},
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
      const e = { oid: 'o' + Date.now(), thema, an: String(d.an || ''), zeit: jetzt(), von: d.von || 'Empfang Ihr Haus' }; D.offen.unshift(e); merke('offen', thema + (e.an ? ' · ' + e.an + ' gefragt' : ''), '', e.oid);
      return { ok: true, offen: kopie(e) };
    }
    if (was === 'wissen_offen_weg') { D.offen = D.offen.filter(x => x.oid !== d.oid); return { ok: true }; }
    if (was === 'wissen_fakt') {
      const z = faktZeilen().find(x => x.fid === d.fid) || fehler('WISSEN · Diese Angabe gibt es nicht mehr. Bitte neu laden.');
      let art;
      if (d.zurueck) { delete D.fakten[z.fid]; art = 'zurueck'; }
      else if (d.aus) { D.fakten[z.fid] = { aus: true, zeit: jetzt(), von: d.von || 'Empfang Ihr Haus' }; art = 'aus'; }
      else {
        const angabe = String(d.angabe || '').trim().slice(0, 600);
        if (!angabe) fehler('EINGABE · Bitte die Angabe ausfüllen. Gilt sie nicht mehr, «Nicht mehr nennen» wählen.');
        if (angabe === z.angabe) { delete D.fakten[z.fid]; art = 'zurueck'; } else { D.fakten[z.fid] = { angabe, zeit: jetzt(), von: d.von || 'Empfang Ihr Haus' }; art = 'geaendert'; }
      }
      merke(art, z.was + ' (' + z.gruppe + ')', z.bereich, z.fid);
      return { ok: true };
    }
    if (was === 'wissen_eintrag') {
      const titel = String(d.titel || '').trim().slice(0, 140), text = String(d.text || '').trim().slice(0, 4000);
      if (titel.length < 2 || text.length < 3) fehler('EINGABE · Bitte Titel und Text ausfüllen.');
      const bereich = BEREICHE.includes(d.bereich) ? d.bereich : 'Das Haus';
      let e = D.eintraege.find(x => x.wid === d.wid);
      if (e) Object.assign(e, { titel, text, bereich, gueltig_bis: d.gueltig_bis || null, geaendert: jetzt(), von: d.von || 'Empfang Ihr Haus' });
      else { e = { wid: 't' + Date.now(), bereich, titel, text, gueltig_bis: d.gueltig_bis || null, zeit: jetzt(), geaendert: jetzt(), quelle: { art: 'team' }, von: d.von || 'Empfang Ihr Haus' }; D.eintraege.push(e); }
      merke(d.wid ? 'geaendert' : 'neu', titel, bereich, e.wid);
      return kopie({ ok: true, eintrag: e });
    }
    if (was === 'wissen_eintrag_weg') { const e = D.eintraege.find(x => x.wid === d.wid) || fehler('WISSEN · Diesen Eintrag gibt es nicht mehr.'); D.eintraege = D.eintraege.filter(x => x !== e); merke('entfernt', e.titel, e.bereich, e.wid); return { ok: true }; }
    if (was === 'wissen_eintrag_aus') { const e = D.eintraege.find(x => x.wid === d.wid) || fehler('WISSEN · Diesen Eintrag gibt es nicht mehr.'); e.aus = !!d.aus; merke(e.aus ? 'aus' : 'an', e.titel, e.bereich, e.wid); return { ok: true }; }
    if (was === 'wissen_einlesen') {
      const text = String(d.text || '').trim(), dateien = d.dateien || [], links = text.match(/https?:\/\/\S+/g) || [];
      if (!links.length && !dateien.length && text.length < 3) fehler('EINGABE · Bitte etwas schreiben, einen Link einfügen oder eine Datei dazulegen.');
      if (!links.length && !dateien.length) {   // eigener Text: direkt ins Wissen (ohne Bereich: «Das Haus»)
        const erste = text.split(/(?<=[^\d\s][.!?])\s+|\n/)[0].replace(/\.$/, ''), titel = erste.length <= 70 ? erste : erste.slice(0, 67).replace(/\s\S*$/, '') + ' …';
        const r = await api('wissen_eintrag', { bereich: BEREICHE.includes(d.bereich) ? d.bereich : 'Das Haus', titel, text, von: d.von });
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
      a = { text: englisch(t) ? 'Thank you' + nm + '. Your enquiry is now with reception. Tomke Claussen will get back to you today.'
        : r.geaendert ? 'Gern' + nm + ', ich habe Ihre Anfrage angepasst' + (r.a.datum ? ': ' + r.a.datum : '') + '.' + (zu ? ' Die Tafel ist von ' + H.TAFEL.tage + ' geöffnet; der Empfang schlägt Ihnen den nächsten Abend vor.' : '') + ' Der Empfang meldet sich heute noch bei Ihnen.'
        : 'Vielen Dank' + nm + '. Ihre Anfrage liegt jetzt am Empfang.' + (zu ? ' Die Tafel ist von ' + H.TAFEL.tage + ' geöffnet; der Empfang schlägt Ihnen den nächsten Abend vor.' : '') + ' Tomke Claussen meldet sich heute noch bei Ihnen.', belegt: true };
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
      <p>So steht der Brief an ${esc(a.name || 'den Gast')} auf dem Papier des Hauses. In der Vorführung entsteht keine Datei.</p>
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

  /* Sprungadressen für die Bilder im Atelier: #eingang-a07, #brief-a01, #gefragt-luecke, #wissen-zimmer, #probe, #probe-gespraech */
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
        ['q1', 'q5', 'q6'].forEach(id => { const q = W.FRAGEN.find(x => x.id === id); b(q.de, 'gast'); b(q.a, 'haus'); });
        l.scrollTop = l.scrollHeight;
      }
    }
  }

  /* Meldungen aus ../_kleid/demo.js erscheinen im Werkzeug wie jede Meldung der Vorlage (quit in reception.js) */
  if (window.DEMO) { const roh = DEMO.hinweis; DEMO.hinweis = function (t) { if (typeof quit === 'function' && document.getElementById('meldung')) return quit('Vorführung', t || 'Ihre Änderung wirkt nur hier und ist nach dem Neuladen wieder wie vorher.', [], false, 6500); return roh.call(DEMO, t); }; }
  window.VORF = { api, gast, tippe, pdf, sprung, nachSprung, zuruecksetzen: anfang, bildFuer: id => { const a = D.anfragen.find(x => x.id === id); return a && a.bild ? a.bild + '-800' : ''; },
    probefragen: ['q1', 'q5', 'q6'].map(id => W.FRAGEN.find(q => q.id === id).de).concat([W.FRAGEN.find(q => q.id === 'q4').en]) };   // vier zum Antippen wie in der Vorlage, eine davon auf Englisch; jede andere Frage geht über das Feld
})();
