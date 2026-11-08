/* Anfragen & Chat · Inhalte der Vorführung (Ihr Haus). Erfundene Gäste mit example.com, Fakten des Hauses aus window.HAUS (haus.py). */
window.WINDE = window.WINDE || {};
WINDE.HEUTE = '2026-11-03T16:40';

WINDE.ARTEN = {
  zimmer: { name: 'Zimmer', lang: 'Zimmeranfrage', bild: 'zimmer' },
  tafel:  { name: 'Tafel',  lang: 'Tisch an der Tafel', bild: 'r-gastraum' },
  feier:  { name: 'Feier',  lang: 'Feier und Anlass', bild: 's-dachboden' },
  gruppe: { name: 'Gruppe', lang: 'Gruppe', bild: 's-lobby' },
  frage:  { name: 'Frage',  lang: 'Frage an den Empfang', bild: 'empfang' }
};

WINDE.ANFRAGEN = [
{
  id: 'a01', art: 'zimmer', status: 'neu', zeit: '2026-11-03T14:12', bild: 'zimmer',
  name: 'Katrin Hollmann', mail: 'katrin.hollmann@example.com', tel: '+49 151 000 00 12', sprache: 'de',
  weg: 'Anfrage-Fenster der Website, Seite Zimmer',
  angaben: [['Tag', 'Fr 13. bis So 15. November'], ['Nächte', '2'], ['Personen', '2'], ['Zimmer', 'Zimmer zum Wasser']],
  nachricht: 'Wir feiern unseren zehnten Hochzeitstag und hätten gern ein Zimmer, in dem man morgens zuerst das Wasser sieht. Gibt es am Samstag noch zwei Plätze an der Tafel? Mein Mann isst keinen Fisch.',
  hinweise: ['Zimmer zum Wasser, Nebensaison: 189 € je Nacht, zwei Nächte 378 €', 'Tafel am Samstag, 14. November: eigene Reservierung nötig', 'Kein Fisch: Küche bis zum Vortag informieren'],
  brief: {
    betreff: 'Ihr Hochzeitstag am Wasser · 13. bis 15. November',
    anrede: 'Liebe Frau Hollmann,',
    text: 'vielen Dank für Ihre Anfrage und herzlichen Glückwunsch zu zehn gemeinsamen Jahren. Wir freuen uns, dass Sie diesen Tag bei uns verbringen möchten.\n\nFür Freitag, den 13., bis Sonntag, den 15. November, halten wir Ihnen ein Zimmer zum Wasser frei. Das Bett steht so, dass der erste Blick am Morgen der Elbe gilt, am Fenster wartet ein Schreibtisch aus Eiche. Zwei Nächte kosten 378 €, das Frühstück im Raum zum Wasser ist eingeschlossen.\n\nFür Samstagabend haben wir Ihnen zwei Plätze an der Tafel vorgemerkt. Einlass ist ab 18.30 Uhr, das Menü beginnt um 19 Uhr. Mareike Voss, unsere Küchenchefin, weiss, dass Ihr Mann keinen Fisch isst, und richtet seine Gänge eigens für ihn an. Fünf Gänge kosten 89 €, die Weinbegleitung 48 €.\n\nWenn Sie mögen, bestätigen Sie uns beides mit einer kurzen Antwort. Ihr Zimmer ist ab 15 Uhr bereit, Ihr Gepäck nehmen wir gern auch früher an.',
    gruss: 'Wir freuen uns auf Sie. Herzliche Grüsse vom Sandtorkai',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a02', art: 'tafel', status: 'neu', zeit: '2026-11-03T11:48', bild: 'r-tisch-fenster',
  name: 'Jonas Petersen', mail: 'j.petersen@example.com', tel: '+49 170 000 00 48', sprache: 'de',
  weg: 'Anfrage-Fenster der Website, Seite Die Tafel',
  angaben: [['Tag', 'Do 5. November'], ['Zeit', '19 Uhr'], ['Personen', '4'], ['Platz', 'Die Tafel zu viert']],
  nachricht: 'Wir möchten am Donnerstag mit meinen Eltern an die Tafel kommen. Meine Mutter isst vegetarisch, mein Vater verträgt keine Nüsse. Geht das?',
  hinweise: ['Donnerstag: die Tafel ist geöffnet, Einlass 18.30 Uhr', 'Eine vegetarische Fassung: Rote Bete, Steckrübe, Pilze', 'Nüsse: Küche bis Mittwoch informieren (Steckrübe mit Haselnuss)'],
  brief: {
    betreff: 'Ihr Abend an der Tafel · Donnerstag, 5. November',
    anrede: 'Lieber Herr Petersen,',
    text: 'schön, dass Sie mit Ihren Eltern zu uns kommen. Für Donnerstag, den 5. November, haben wir Ihnen vier Plätze an der Tafel reserviert. Einlass ist ab 18.30 Uhr, um 19 Uhr beginnt das Menü.\n\nIhre Mutter bekommt die vegetarische Fassung der Woche: geräucherte Rote Bete mit Meerrettich, glasierte Steckrübe mit brauner Butter, Pilze aus dem Ofen mit Graupen. Für Ihren Vater lässt die Küche alle Nüsse weg, auch die Haselnuss an der Steckrübe. Mareike Voss hat es sich notiert und spricht am Abend kurz mit ihm, wenn er mag.\n\nFünf Gänge kosten 89 € je Person, die Weinbegleitung 48 €. Gekocht wird, was der Hafenmarkt am Morgen hatte, und jeder Teller wird von Hand angerichtet.',
    gruss: 'Bis Donnerstag. Herzliche Grüsse',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a03', art: 'feier', status: 'offen', zeit: '2026-11-02T18:30', bild: 's-dachboden',
  name: 'Dr. Ulrike Brandes', mail: 'u.brandes@example.com', tel: '+49 40 000 00 731', sprache: 'de',
  weg: 'Anfrage-Fenster der Website, Seite Kontakt',
  angaben: [['Tag', 'Sa 28. November'], ['Anlass', '60. Geburtstag'], ['Personen', '22'], ['Ort', 'Der Dachboden']],
  nachricht: 'Mein Mann wird sechzig. Wir möchten mit 22 Gästen unter dem Dachstuhl feiern, gern mit einem Menü und Platz für eine kurze Rede. Einige Gäste würden auch bei Ihnen übernachten.',
  hinweise: ['Dachboden: bis 24 Gäste an einer langen Tafel, passt', 'Übernachtung: Zimmer für den 28. November vorhalten', 'Feiern plant Henrike Rademacher persönlich'],
  brief: {
    betreff: 'Der sechzigste Geburtstag unter dem Dachstuhl · 28. November',
    anrede: 'Liebe Frau Dr. Brandes,',
    text: 'vielen Dank für Ihre Nachricht. Ein sechzigster Geburtstag unter dem Dachstuhl von 1888, mit Blick über den Hafen: Das ist ein Abend, auf den wir uns schon jetzt freuen.\n\nDer Dachboden ist am Samstag, den 28. November, frei. Ihre 22 Gäste sitzen an einer langen Tafel, an der Stirnseite ist Platz für eine Rede. Mareike Voss kocht das Menü der Woche in fünf Gängen oder ein eigenes Menü, das wir gemeinsam mit Ihnen zusammenstellen.\n\nFür Gäste, die übernachten möchten, halten wir Ihnen bis Ende der Woche sechs Zimmer vor. Was der Abend kostet, hängt vom Menü und vom Wein ab. Am liebsten zeige ich Ihnen den Dachboden einmal selbst, bei einer Tasse Kaffee aus der Rösterei nebenan.\n\nSagen Sie mir einfach, wann es Ihnen passt.',
    gruss: 'Herzliche Grüsse',
    von: 'Henrike Rademacher', rolle: 'Gastgeberin'
  }
},
{
  id: 'a04', art: 'gruppe', status: 'offen', zeit: '2026-11-02T10:05', bild: 's-lobby',
  name: 'Miriam Kessler', mail: 'm.kessler@example.com', tel: '+49 89 000 00 26', sprache: 'de', firma: 'Studio Nordlicht, München',
  weg: 'Anfrage-Fenster der Website, Seite Kontakt',
  angaben: [['Tag', 'Do 26. bis Fr 27. November'], ['Nächte', '1'], ['Personen', '8'], ['Zimmer', '8 Einzelzimmer']],
  nachricht: 'Wir sind ein kleines Designbüro und kommen zu acht für einen Tag nach Hamburg. Jede und jeder bräuchte ein eigenes Zimmer. Am Donnerstagabend würden wir gern gemeinsam an der Tafel essen. Die Rechnung sollte an das Büro gehen.',
  hinweise: ['Acht von zwölf Zimmern für eine Nacht', 'Einzelbelegung: 30 € weniger je Zimmer', 'Tafel am Donnerstag, 26. November: acht Plätze', 'Zahlung: Überweisung vorab möglich'],
  brief: {
    betreff: 'Ihre Reise nach Hamburg · 26. bis 27. November',
    anrede: 'Liebe Frau Kessler,',
    text: 'vielen Dank für Ihre Anfrage. Wir freuen uns, Ihr Büro für eine Nacht am Sandtorkai zu haben.\n\nFür Donnerstag, den 26., bis Freitag, den 27. November, halten wir acht Zimmer für Sie frei: fünf Speicherzimmer mit Blick auf den Kanal und drei Zimmer zum Wasser. In Einzelbelegung kostet ein Speicherzimmer 129 €, ein Zimmer zum Wasser 159 €, zusammen 1.122 €. Das Frühstück ist eingeschlossen.\n\nAm Donnerstagabend sitzen Sie zu acht an der Tafel, Einlass ab 18.30 Uhr. Fünf Gänge kosten 89 € je Person, die Weinbegleitung 48 €. Ein vegetarisches Menü gibt es immer, Unverträglichkeiten nennen Sie uns bitte bis zum Vortag.\n\nDie Rechnung stellen wir gern auf Studio Nordlicht aus, Sie können vorab überweisen oder vor Ort mit Karte zahlen. Für eine verbindliche Buchung genügt eine kurze Antwort.',
    gruss: 'Herzliche Grüsse vom Sandtorkai',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a05', art: 'zimmer', status: 'neu', zeit: '2026-11-03T09:20', bild: 's-hundeplatz',
  name: 'Ina Lorenzen', mail: 'ina.lorenzen@example.com', tel: '+49 160 000 00 05', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Fr 20. bis So 22. November'], ['Nächte', '2'], ['Personen', '2 und ein Hund'], ['Zimmer', 'Speicherzimmer']],
  nachricht: 'Wir reisen mit Ole, einem ruhigen Labrador. Ist das in Ordnung, und verträgt er sich mit Lotte? Abends würden wir gern in die Bar.',
  hinweise: ['Hund: 20 € je Nacht, mit Decke, Napf und Handtuch', 'Bar mit Hund gern, an der Tafel ohne Hund', 'Speicherzimmer, Nebensaison: 159 € je Nacht'],
  brief: {
    betreff: 'Sie und Ole am Sandtorkai · 20. bis 22. November',
    anrede: 'Liebe Frau Lorenzen,',
    text: 'Ole ist bei uns herzlich willkommen. Für Freitag, den 20., bis Sonntag, den 22. November, halten wir Ihnen ein Speicherzimmer frei, unter dem alten Balken, mit Dielen aus Eiche und dem Fenster zum Kanal. Eine Decke, ein Napf und ein Handtuch für Ole liegen bereit, wenn Sie ankommen.\n\nLotte, unser Hund, liegt meistens neben dem Empfang und begrüsst jeden, der durch die Tür kommt. Ole wird sie also als Erste kennenlernen.\n\nIn die Bar darf Ole gern mit, sie liegt zum Wasser und hat abends ab 17 Uhr geöffnet. An der Tafel bleibt er bitte auf dem Zimmer.\n\nZwei Nächte kosten 318 €, dazu 40 € für Ole, das Frühstück ist eingeschlossen.',
    gruss: 'Herzliche Grüsse, auch von Lotte',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a06', art: 'frage', status: 'neu', zeit: '2026-11-03T07:55', bild: 'a-faehre',
  name: 'Gisela Rautenberg', mail: 'g.rautenberg@example.com', tel: '+49 171 000 00 66', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Fr 6. bis So 8. November'], ['Gebucht', 'Zimmer zum Wasser'], ['Personen', '2'], ['Thema', 'Anreise mit dem Schiff']],
  nachricht: 'Wir kommen am Freitag mit dem Zug und möchten das letzte Stück mit der Fähre zu Ihnen fahren. Geht das mit zwei Koffern? Wir sind schon gegen 12 Uhr in Hamburg.',
  hinweise: ['Schon gebucht: Fr 6. bis So 8. November', 'Fähre 72 von den Landungsbrücken bis zur Elbphilharmonie', 'Frühe Ankunft: Gepäck jederzeit, Zimmer ab 15 Uhr'],
  brief: {
    betreff: 'Mit der Fähre zum Sandtorkai · Freitag, 6. November',
    anrede: 'Liebe Frau Rautenberg,',
    text: 'was für eine schöne Idee, mit dem Schiff anzukommen. Vom Hauptbahnhof fahren Sie mit der S-Bahn zu den Landungsbrücken. Dort legt die Hafenfähre 72 ab, die Sie bis zur Elbphilharmonie bringt. Wenn Sie aussteigen, sehen Sie unser Haus schon, am Sandtorkai 7. Koffer nehmen Sie auf der Fähre einfach mit.\n\nIhr Zimmer zum Wasser ist ab 15 Uhr für Sie bereit. Kommen Sie gegen Mittag an, nehmen wir Ihre Koffer am Empfang an, und Sie haben den Nachmittag für die Speicherstadt, die hinter der nächsten Brücke beginnt. Zwei Hotelräder stehen auch für Sie bereit.\n\nWir freuen uns auf Freitag.',
    gruss: 'Herzliche Grüsse vom Wasser',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a07', art: 'zimmer', status: 'neu', zeit: '2026-11-02T21:40', bild: 'z-wanne',
  name: 'James Whitfield', mail: 'j.whitfield@example.com', tel: '+44 20 0000 0071', sprache: 'en',
  weg: 'Anfrage-Fenster der Website, Seite Zimmer (englisch)',
  angaben: [['Tag', 'Fr 4. bis Mo 7. Dezember'], ['Nächte', '3'], ['Personen', '2'], ['Zimmer', 'Kranzimmer']],
  nachricht: 'We are coming to Hamburg for a concert at the Elbphilharmonie on Saturday. Could we have a room with a bath and a view of the cranes? And would it be possible to have dinner at your table on Friday?',
  nachricht_de: 'Wir kommen für ein Konzert in der Elbphilharmonie am Samstag nach Hamburg. Könnten wir ein Zimmer mit Badewanne und Blick auf die Kräne bekommen? Und wäre es möglich, am Freitag an Ihrer Tafel zu essen?',
  hinweise: ['Kranzimmer, Nebensaison: 229 € je Nacht, drei Nächte 687 €', 'Tafel am Freitag, 4. Dezember: zwei Plätze', 'Elbphilharmonie: 8 Minuten zu Fuss', 'Antwort auf Englisch'],
  brief: {
    betreff: 'Your stay by the harbour · 4 to 7 December',
    anrede: 'Dear Mr Whitfield,',
    text: 'thank you for your enquiry. We would be delighted to welcome you for your concert weekend.\n\nFrom Friday 4 to Monday 7 December we are holding one of our two Crane Rooms for you. It is a corner room on the fourth floor with two tall windows, the cranes right outside, and a freestanding bath from which you can see them. Three nights come to 687 €, breakfast in the room by the water is included.\n\nOn Friday evening we have reserved two places for you at our table. Doors open at 6.30 pm, the five-course menu begins at 7 pm, cooked from what the harbour market had that morning. The menu is 89 € per person, the wine pairing 48 €.\n\nThe Elbphilharmonie is an eight-minute walk along the water. Please just reply to confirm, and let us know if there is anything you do not eat.',
    gruss: 'Warm regards from Sandtorkai',
    von: 'Tomke Claussen', rolle: 'Reception'
  },
  brief_de: 'Vielen Dank für Ihre Anfrage. Wir freuen uns, Sie zu Ihrem Konzertwochenende bei uns zu haben.\n\nVon Freitag, 4., bis Montag, 7. Dezember, halten wir Ihnen eines unserer beiden Kranzimmer frei: ein Eckzimmer im vierten Boden mit zwei hohen Fenstern, davor die Kräne, und einer freistehenden Wanne, von der aus man sie sieht. Drei Nächte kosten 687 €, das Frühstück im Raum zum Wasser ist eingeschlossen.\n\nFür Freitagabend haben wir Ihnen zwei Plätze an der Tafel reserviert. Einlass 18.30 Uhr, das Menü in fünf Gängen beginnt um 19 Uhr, gekocht wird, was der Hafenmarkt am Morgen hatte. 89 € je Person, die Weinbegleitung 48 €.\n\nZur Elbphilharmonie sind es acht Minuten zu Fuss am Wasser entlang. Eine kurze Antwort zur Bestätigung genügt, und sagen Sie uns, was Sie nicht essen.'
},
{
  id: 'a08', art: 'zimmer', status: 'offen', zeit: '2026-11-01T16:10', bild: 'z-dachsuite',
  name: 'Felix Aydin', mail: 'felix.aydin@example.com', tel: '+49 176 000 00 08', sprache: 'de',
  weg: 'Anfrage-Fenster der Website, Seite Zimmer',
  angaben: [['Tag', 'Mi 30. Dezember bis Fr 1. Januar'], ['Nächte', '2'], ['Personen', '2'], ['Zimmer', 'Dachsuite']],
  nachricht: 'Ich möchte meiner Freundin zum Jahreswechsel einen Antrag machen. Ist die Dachsuite noch frei, und kann man am Neujahrsmorgen das Frühstück aufs Zimmer bekommen?',
  hinweise: ['Silvester: Preis auf Anfrage', 'Dachsuite: kostenlos stornierbar bis 14 Tage vor Anreise', 'Frühstück aufs Zimmer: in der Dachsuite auf Wunsch'],
  brief: {
    betreff: 'Die Dachsuite zum Jahreswechsel · 30. Dezember bis 1. Januar',
    anrede: 'Lieber Herr Aydin,',
    text: 'vielen Dank für Ihr Vertrauen. Wir behalten Ihr Vorhaben selbstverständlich für uns.\n\nDie Dachsuite ist vom 30. Dezember bis zum 1. Januar noch frei, und wir halten sie ab heute für Sie. Sie liegt ganz oben unter dem Dachstuhl von 1888, mit Oberlicht, einer freistehenden Wanne und einem Bad in Flaschengrün.\n\nAm Neujahrsmorgen bringen wir Ihnen das Frühstück aufs Zimmer, zu der Zeit, die Ihnen passt. Den Preis für den Jahreswechsel schickt Ihnen Henrike Rademacher bis morgen Mittag. Stornieren können Sie die Dachsuite bis 14 Tage vor Anreise kostenlos.\n\nWenn wir an dem Abend etwas vorbereiten sollen, sagen Sie es mir. Es bleibt unter uns.',
    gruss: 'Herzliche Grüsse',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a09', art: 'frage', status: 'erledigt', zeit: '2026-10-31T08:30', bild: 'z-kranzimmer', gesendet: '31. Oktober, 8.52 Uhr',
  name: 'Annika Brüggemann', mail: 'a.brueggemann@example.com', tel: '+49 152 000 00 09', sprache: 'de',
  weg: 'Chat der Website, Hausgast im Kranzimmer',
  angaben: [['Tag', 'So 1. November'], ['Zimmer', 'Kranzimmer'], ['Personen', '2'], ['Thema', 'Später abreisen']],
  nachricht: 'Können wir am Sonntag etwas länger bleiben? Unser Zug geht erst um 16 Uhr.',
  hinweise: ['Später abreisen: bis 14 Uhr gegen 30 €, wenn das Zimmer frei ist', 'Gepäck danach am Empfang'],
  brief: {
    betreff: 'Ihr Sonntag im Kranzimmer',
    anrede: 'Liebe Frau Brüggemann,',
    text: 'gern. Das Kranzimmer ist am Sonntag nicht wieder belegt, Sie können also bis 14 Uhr bleiben. Wir berechnen dafür 30 €.\n\nDanach nehmen wir Ihr Gepäck am Empfang, bis Ihr Zug geht. Wenn Sie den Nachmittag noch am Wasser verbringen möchten: Zur Elbphilharmonie sind es acht Minuten zu Fuss, und die Bar öffnet um 17 Uhr, falls der Zug doch später fährt.',
    gruss: 'Einen ruhigen Sonntag wünscht Ihnen',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a10', art: 'zimmer', status: 'offen', zeit: '2026-11-01T11:00', bild: 'z-speicherzimmer',
  name: 'Renate Schöning', mail: 'r.schoening@example.com', tel: '+49 511 000 00 10', sprache: 'de',
  weg: 'Anfrage-Fenster der Website, Seite Anreise',
  angaben: [['Tag', 'Do 10. bis Sa 12. Dezember'], ['Nächte', '2'], ['Personen', '2'], ['Zimmer', 'Speicherzimmer, stufenlos']],
  nachricht: 'Ich komme mit meiner Mutter, sie sitzt im Rollstuhl. Gibt es ein Zimmer ohne Stufen, und kommen wir mit dem Rollstuhl auch an die Tafel?',
  hinweise: ['Stufenloses Speicherzimmer auf dem 1. Boden, breite Tür, ebene Dusche', 'Aufzug zu allen Böden', 'Tafel am Donnerstag oder Freitag möglich'],
  brief: {
    betreff: 'Ein Zimmer ohne Stufen · 10. bis 12. Dezember',
    anrede: 'Liebe Frau Schöning,',
    text: 'vielen Dank, dass Sie uns gleich Bescheid geben. So können wir alles vorbereiten.\n\nFür Donnerstag, den 10., bis Samstag, den 12. Dezember, halten wir Ihnen unser stufenloses Speicherzimmer auf dem ersten Boden frei. Es hat eine breite Tür und eine ebene Dusche, der Aufzug fährt zu allen Böden. Zwei Nächte kosten 318 €, das Frühstück ist eingeschlossen.\n\nAn der Tafel richtet Lennart Brinkmann Ihnen einen Platz mit genug Raum für den Rollstuhl ein. Sagen Sie uns nur, ob Sie am Donnerstag oder am Freitag essen möchten.\n\nWenn Ihre Mutter noch etwas braucht, ein zweites Kissen, einen Stuhl in der Dusche, schreiben Sie es mir. Wir richten es gern.',
    gruss: 'Herzliche Grüsse',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a11', art: 'feier', status: 'neu', zeit: '2026-11-03T13:05', bild: 'r-gastraum',
  name: 'Hauke Jensen', mail: 'h.jensen@example.com', tel: '+49 40 000 00 211', sprache: 'de', firma: 'Jensen & Hoff Schiffsmakler',
  weg: 'Anfrage-Fenster der Website, Seite Die Tafel',
  angaben: [['Tag', 'Fr 11. Dezember'], ['Anlass', 'Weihnachtsessen'], ['Personen', '24'], ['Ort', 'Die Tafel exklusiv']],
  nachricht: 'Wir möchten mit unserem Team zum Jahresende an Ihrer Tafel essen, am liebsten mit der ganzen Tafel für uns. Gibt es ein Menü, das ein bisschen nach Weihnachten schmeckt?',
  hinweise: ['Tafel exklusiv: bis 28 Gäste, Donnerstag bis Samstag', 'An diesem Abend keine Einzelplätze für andere Gäste', 'Feiern plant Henrike Rademacher persönlich'],
  brief: {
    betreff: 'Ihr Weihnachtsessen an der Tafel · Freitag, 11. Dezember',
    anrede: 'Lieber Herr Jensen,',
    text: 'vielen Dank für Ihre Anfrage. Wir freuen uns, dass Ihr Team das Jahr bei uns beschliessen möchte.\n\nAm Freitag, den 11. Dezember, gehört die Tafel Ihnen. Ihre 24 Gäste sitzen bequem zwischen Fliesen und Wänden in Flaschengrün.\n\nMareike Voss stellt Ihnen gern ein Menü für den Abend zusammen, mit dem, was der Dezember am Hafenmarkt bringt, und einer vegetarischen Fassung für alle, die sie wünschen. Ich schicke Ihnen bis Freitag einen ersten Vorschlag mit Menü, Wein und Preis.\n\nWenn Sie möchten, kommen Sie vorher einmal auf einen Kaffee vorbei und sehen sich den Raum an.',
    gruss: 'Herzliche Grüsse vom Sandtorkai',
    von: 'Henrike Rademacher', rolle: 'Gastgeberin'
  }
},
{
  id: 'a12', art: 'zimmer', status: 'offen', zeit: '2026-10-30T19:20', bild: 'z-schreibtisch',
  name: 'Chidi Okafor', mail: 'chidi.okafor@example.com', tel: '+49 157 000 00 12', sprache: 'de',
  weg: 'Anfrage-Fenster der Website, Seite Zimmer',
  angaben: [['Tag', 'Mi 23. bis Sa 26. Dezember'], ['Nächte', '3'], ['Personen', '2 Erwachsene, 2 Kinder (1 und 8)'], ['Zimmer', 'Zimmer zum Wasser']],
  nachricht: 'Wir möchten Weihnachten mit unseren beiden Kindern in Hamburg verbringen. Passt ein Kinderbett und ein Zustellbett in ein Zimmer zum Wasser?',
  hinweise: ['Weihnachten: Preis auf Anfrage', 'Kinderbett bis zwei Jahre kostenlos', 'Zustellbett bis zwölf Jahre: 40 € mit Frühstück', 'Tafel: Kinder ab zehn Jahren, jüngere nach Absprache'],
  brief: {
    betreff: 'Weihnachten am Wasser · 23. bis 26. Dezember',
    anrede: 'Lieber Herr Okafor,',
    text: 'wie schön, dass Sie Weihnachten mit Ihren Kindern bei uns verbringen möchten.\n\nIm Zimmer zum Wasser ist Platz für beides: Das Kinderbett für Ihr Jüngstes stellen wir kostenlos dazu, das Zustellbett für Ihr älteres Kind kostet 40 €, das Frühstück ist dabei. Morgens sehen alle vier zuerst auf die Elbe.\n\nDen Preis für die Weihnachtstage schickt Ihnen Henrike Rademacher bis morgen. Wir halten das Zimmer so lange für Sie.\n\nAn der Tafel sind Kinder ab zehn Jahren willkommen, für jüngere finden wir gern einen Weg. Sagen Sie uns, ob Sie an einem der Abende mit uns essen möchten.',
    gruss: 'Herzliche Grüsse vom Sandtorkai',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a13', art: 'tafel', status: 'erledigt', zeit: '2026-10-29T15:45', bild: 'r-brot', gesendet: '29. Oktober, 16.20 Uhr',
  name: 'Marlene Voigt', mail: 'marlene.voigt@example.com', tel: '+49 162 000 00 13', sprache: 'de',
  weg: 'Chat der Website, Hausgäste',
  angaben: [['Tag', 'Sa 7. November'], ['Zeit', '19 Uhr'], ['Personen', '2'], ['Platz', 'Die Tafel zu zweit']],
  nachricht: 'Wir wohnen am Wochenende bei Ihnen und möchten am Samstag an die Tafel. Ich habe Zöliakie und darf nichts mit Gluten essen.',
  hinweise: ['Glutenfrei: Küche bis zum Vortag informieren', 'Auch Hausgäste reservieren an der Tafel'],
  brief: {
    betreff: 'Ihr Abend an der Tafel · Samstag, 7. November',
    anrede: 'Liebe Frau Voigt,',
    text: 'für Samstag, den 7. November, haben wir Ihnen zwei Plätze an der Tafel reserviert, Einlass ab 18.30 Uhr.\n\nMareike Voss weiss von Ihrer Zöliakie und richtet jeden Ihrer fünf Gänge ohne Gluten an, auch für das Brot am Anfang findet sie eine eigene Lösung. In der Küche wird Ihr Teller für sich vorbereitet.\n\nWenn Sie am Abend noch eine Frage zu einem Gang haben, sprechen Sie Lennart Brinkmann an. Er kennt jede Zutat.',
    gruss: 'Herzliche Grüsse',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a14', art: 'frage', status: 'erledigt', zeit: '2026-10-28T12:10', bild: 'a-koffer', gesendet: '28. Oktober, 12.41 Uhr',
  name: 'Thomas Behrendt', mail: 't.behrendt@example.com', tel: '+49 173 000 00 14', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Do 12. bis So 15. November'], ['Nächte', '3'], ['Gebucht', 'Speicherzimmer'], ['Thema', 'Parken']],
  nachricht: 'Wir kommen mit dem Auto und viel Gepäck. Wo können wir parken, und kann man vor dem Haus ausladen?',
  hinweise: ['Kein eigener Parkplatz', 'Vor der Tür halten zum Ausladen', 'Parkhaus Speicherstadt: 24 € je Tag, Reservierung auf Wunsch'],
  brief: {
    betreff: 'Ankunft mit dem Auto · 12. November',
    anrede: 'Lieber Herr Behrendt,',
    text: 'geben Sie in die Navigation einfach Sandtorkai 7 ein. Vor der Tür können Sie halten und in Ruhe ausladen, wir helfen Ihnen mit dem Gepäck.\n\nEinen eigenen Parkplatz hat das Haus nicht. Das Parkhaus Speicherstadt liegt drei Minuten zu Fuss entfernt und kostet 24 € je Tag. Wir haben Ihnen dort für Donnerstag bis Sonntag einen Platz reserviert, zusammen 72 €.\n\nIhr Speicherzimmer ist ab 15 Uhr bereit.',
    gruss: 'Gute Fahrt und herzliche Grüsse',
    von: 'Tomke Claussen', rolle: 'Empfang'
  }
},
{
  id: 'a15', art: 'feier', status: 'neu', zeit: '2026-11-03T16:02', bild: 'aussen',
  name: 'Lea Martens', mail: 'lea.martens@example.com', tel: '+49 151 000 00 15', sprache: 'de', firma: 'mit Paul Ahrens',
  weg: 'Anfrage-Fenster der Website, Seite Kontakt',
  angaben: [['Tag', 'Fr 7. bis So 9. Mai 2027'], ['Anlass', 'Hochzeit'], ['Personen', '26'], ['Ort', 'Das ganze Haus']],
  nachricht: 'Wir heiraten im Mai 2027 und träumen davon, das ganze Haus für ein Wochenende zu haben: nach dem Standesamt ein Essen an der Tafel, am Samstag tanzen auf dem Dachboden. Wir wären etwa 26 Gäste.',
  hinweise: ['Das ganze Haus: zwölf Zimmer, Tafel, Bar und Dachboden', '26 Gäste: die Tafel fasst bis 28', 'Mai: Hauptsaison', 'Feiern plant Henrike Rademacher persönlich'],
  brief: {
    betreff: 'Ihre Hochzeit im ganzen Haus · 7. bis 9. Mai 2027',
    anrede: 'Liebe Frau Martens, lieber Herr Ahrens,',
    text: 'herzlichen Glückwunsch. Wir haben uns über Ihre Nachricht sehr gefreut.\n\nDas Wochenende vom 7. bis 9. Mai 2027 ist noch frei. Das ganze Haus gehört dann Ihnen und Ihren Gästen: zwölf Zimmer auf fünf Böden, die Tafel für Ihr Essen nach dem Standesamt, die Bar mit der Theke aus Messing und am Samstag der Dachboden unter dem Dachstuhl zum Tanzen. 26 Gäste sitzen an der Tafel bequem.\n\nAm liebsten lernen wir uns einmal persönlich kennen. Ich zeige Ihnen das Haus vom Kai bis unters Dach, und wir sprechen über Menü, Ablauf und Zimmer. Danach schicke ich Ihnen einen genauen Vorschlag mit allen Preisen.\n\nBis dahin halten wir Ihnen das Wochenende für vier Wochen frei.',
    gruss: 'Herzliche Grüsse',
    von: 'Henrike Rademacher', rolle: 'Gastgeberin'
  }
}
];

/* Wissen des Chats: woraus er antwortet. Bearbeiten wirkt nur im Arbeitsspeicher. */
WINDE.WISSEN = [
  { id: 'anreise', bereich: 'Regeln', titel: 'Anreise und Abreise', bild: 's-schluesselbrett',
    text: 'Anreise ab 15 Uhr. Frühere Ankunft nach Absprache, Gepäck nehmen wir jederzeit an. Abreise bis 11 Uhr. Später gegen 30 € bis 14 Uhr, wenn das Zimmer frei ist.' },
  { id: 'parken', bereich: 'Anreise', titel: 'Parken und Auto', bild: 'a-koffer',
    text: 'Kein eigener Parkplatz. Navigation auf Sandtorkai 7, vor der Tür halten zum Ausladen. Parkhaus Speicherstadt, drei Minuten zu Fuss, 24 € je Tag; wir reservieren auf Wunsch.' },
  { id: 'wege', bereich: 'Anreise', titel: 'Wege zum Haus', bild: 'a-faehre',
    text: 'Bahn: vom Hauptbahnhof mit der U4 bis Überseequartier, dann ein paar Minuten am Wasser, 15 Minuten. Schiff: von den Landungsbrücken mit der Hafenfähre 72 bis zur Elbphilharmonie. Flughafen: S1 bis Hauptbahnhof, dann U4; Taxi 30 Minuten, um 35 €. Zwei Hotelräder stehen kostenlos bereit.' },
  { id: 'zimmer', bereich: 'Zimmer', titel: 'Die vier Zimmerarten', bild: 'zimmer',
    text: 'Speicherzimmer 22 m², Blick auf den Kanal, 159 € / 199 €. Zimmer zum Wasser 28 m², Blick auf die Elbe, 189 € / 239 €. Kranzimmer 34 m², zwei Fenster zum Hafen, Wanne vor dem Fenster, 229 € / 289 €. Dachsuite 48 m² unter dem Dachstuhl, Oberlicht, Wanne, 340 € / 420 €. Preise je Nacht für zwei mit Frühstück, November bis März / April bis Oktober. Einzelbelegung 30 € weniger.' },
  { id: 'fruehstueck', bereich: 'Essen', titel: 'Frühstück', bild: 'r-franzbroetchen',
    text: 'Von 7.30 bis 10.30 Uhr, sonntags bis 12 Uhr, im Raum zum Wasser: Brot aus dem Ofen, Franzbrötchen, Eier wie gewünscht, Fisch vom Markt, Obst, Kaffee aus der Speicherstadt. Für Hausgäste eingeschlossen, aufs Zimmer gegen 12 €, für Gäste von aussen 28 €.' },
  { id: 'tafel', bereich: 'Tafel', titel: 'Die Tafel', bild: 'r-gastraum',
    text: 'Donnerstag bis Samstag, Einlass 18.30 Uhr, ab 19 Uhr. Fünf Gänge 89 €, Weinbegleitung 48 €, immer auch vegetarisch. 28 Plätze. Reservierung nötig, auch für Hausgäste. Kinder ab zehn Jahren, kleinere nach Absprache.' },
  { id: 'allergien', bereich: 'Tafel', titel: 'Unverträglichkeiten', bild: 'r-zutaten',
    text: 'Unverträglichkeiten bis zum Vortag melden, die Küche richtet sich danach. Gekocht wird, was der Hafenmarkt am Morgen hatte; einzelne Gänge richtet die Küche eigens an.' },
  { id: 'bar', bereich: 'Haus', titel: 'Die Bar', bild: 'bar',
    text: 'Täglich ab 17 Uhr, Donnerstag bis Samstag bis 1 Uhr. 18 Plätze an einer Theke aus Messing, Blick aufs Wasser, eine kurze Karte. Hausgäste bekommen auch nach Schluss noch ein Glas.' },
  { id: 'hunde', bereich: 'Regeln', titel: 'Hunde und Lotte', bild: 's-hundeplatz',
    text: 'Hunde willkommen, 20 € je Nacht, mit Decke, Napf und Handtuch. Nicht in der Tafel, in der Bar gern. Lotte gehört zum Haus, liegt meistens neben dem Empfang und begrüsst, wer durch die Tür kommt.' },
  { id: 'kinder', bereich: 'Regeln', titel: 'Kinder', bild: 'z-bettdetail',
    text: 'Kinder willkommen. Kinderbett bis zwei Jahre kostenlos, Zustellbett bis zwölf Jahre 40 € mit Frühstück.' },
  { id: 'storno', bereich: 'Regeln', titel: 'Stornierung und Zahlung', bild: 'm-papier',
    text: 'Kostenlos bis sieben Tage vor Anreise, danach 80 % der ersten Nacht. Die Dachsuite bis 14 Tage vorher. Zahlung mit Karte, Überweisung vorab oder bar. Die Rechnung kommt per Mail.' },
  { id: 'feiern', bereich: 'Feiern', titel: 'Feiern im Haus', bild: 's-dachboden',
    text: 'Der Dachboden: bis 24 Gäste an einer langen Tafel unter dem Dachstuhl. Die Tafel exklusiv: bis 28 Gäste, Donnerstag bis Samstag. Das ganze Haus: zwölf Zimmer, Tafel, Bar und Dachboden für ein Wochenende. Henrike Rademacher plant persönlich.' },
  { id: 'barrierefrei', bereich: 'Zimmer', titel: 'Barrierefreiheit', bild: 'z-speicherzimmer',
    text: 'Aufzug zu allen Böden. Ein Speicherzimmer auf dem 1. Boden ist stufenlos, mit breiter Tür und ebener Dusche.' },
  { id: 'haus', bereich: 'Haus', titel: 'Haus, WLAN, Ruhe', bild: 'aussen',
    text: 'Speicher von 1888 am Sandtorkai 7, seit 2021 Hotel, zwölf Zimmer auf fünf Böden. WLAN im ganzen Haus ohne Passwort. Rauchen nur auf dem Anleger. Ruhe ab 22 Uhr in den Fluren. Speicherstadt 3 Minuten, Elbphilharmonie 8 Minuten zu Fuss.' }
];

/* Fragen zum Antippen. w = Wissensblock, aus dem die Antwort stammt. s = Stichworte für freie Eingabe. */
WINDE.FRAGEN = [
  { id: 'q1', w: 'anreise', s: /einchecken|check.?in|anreise|ankunft|ankommen|früher|wann.*zimmer|arrive|arrival|early/i,
    de: 'Ab wann kann ich einchecken?', en: 'When can I check in?',
    a: 'Ihr Zimmer ist ab 15 Uhr für Sie bereit. Kommen Sie früher an, nehmen wir Ihr Gepäck jederzeit an, und Sie haben Zeit für die Speicherstadt, die hinter der nächsten Brücke beginnt. Eine frühere Ankunft im Zimmer richten wir gern ein, wenn Sie uns vorher Bescheid geben.',
    ae: 'Your room is ready from 3 pm. If you arrive earlier, we will gladly take your luggage at any time, and you can explore the Speicherstadt just over the next bridge. An earlier check-in can often be arranged if you let us know in advance.' },
  { id: 'q2', w: 'anreise', s: /auschecken|check.?out|abreise|länger bleiben|später|late/i,
    de: 'Kann ich später auschecken?', en: 'Can I check out later?',
    a: 'Abreise ist bis 11 Uhr. Wenn das Zimmer frei ist, bleiben Sie gegen 30 € bis 14 Uhr. Sagen Sie es am besten am Abend vorher am Empfang. Ihr Gepäck bewahren wir danach gern auf.',
    ae: 'Check-out is by 11 am. If the room is free, you can stay until 2 pm for 30 €. Just let reception know the evening before. We are happy to keep your luggage afterwards.' },
  { id: 'q3', w: 'parken', s: /park|auto|garage|wagen|car\b/i,
    de: 'Wo kann ich parken?', en: 'Where can I park?',
    a: 'Einen eigenen Parkplatz hat das Haus nicht. Sie halten zum Ausladen direkt vor der Tür am Sandtorkai 7. Danach sind es drei Minuten zu Fuss ins Parkhaus Speicherstadt, 24 € je Tag. Auf Wunsch reservieren wir Ihnen dort einen Platz.',
    ae: 'The house has no car park of its own. You can stop right outside at Sandtorkai 7 to unload. The Speicherstadt car park is a three-minute walk away, 24 € per day. We are happy to reserve a space for you.' },
  { id: 'q4', w: 'fruehstueck', s: /frühstück|fruehstueck|breakfast|morgens essen/i,
    de: 'Wann gibt es Frühstück?', en: 'When is breakfast served?',
    a: 'Frühstück gibt es von 7.30 bis 10.30 Uhr, sonntags bis 12 Uhr, im Raum zum Wasser: Brot aus dem Ofen, Franzbrötchen, Eier wie gewünscht, Fisch vom Markt, Obst und Kaffee aus der Speicherstadt. Für Hausgäste ist es eingeschlossen. Aufs Zimmer bringen wir es gegen 12 €.',
    ae: 'Breakfast is served from 7.30 to 10.30 am, on Sundays until noon, in the room by the water: bread from the oven, Franzbrötchen, eggs as you like them, fish from the market, fruit and coffee roasted in the Speicherstadt. It is included for hotel guests. We bring it to your room for 12 €.' },
  { id: 'q5', w: 'hunde', s: /hund|dog|lotte|haustier|pet/i,
    de: 'Darf mein Hund mitkommen?', en: 'Can I bring my dog?',
    a: 'Sehr gern. Hunde sind willkommen, 20 € je Nacht, mit Decke, Napf und Handtuch auf dem Zimmer. In die Bar darf Ihr Hund mit, während der Tafel bleibt er bitte auf dem Zimmer. Lotte, unser Hund, liegt meistens neben dem Empfang und begrüsst jeden, der hereinkommt.',
    ae: 'Of course. Dogs are welcome for 20 € per night, with a blanket, bowl and towel in your room. Your dog is welcome in the bar; during dinner at the table, please leave it in your room. Lotte, our own dog, usually lies next to reception and greets everyone who comes in.' },
  { id: 'q6', w: 'tafel', s: /tafel|reserv|abendessen|essen gehen|menü|menu|dinner|tisch|table/i,
    de: 'Wie reserviere ich an der Tafel?', en: 'How do I book a table for dinner?',
    a: 'Die Tafel ist von Donnerstag bis Samstag geöffnet, Einlass 18.30 Uhr, gegessen wird ab 19 Uhr. Fünf Gänge kosten 89 €, die Weinbegleitung 48 €, eine vegetarische Fassung gibt es immer. Reservieren müssen auch Hausgäste. Nennen Sie mir Tag und Personenzahl, dann gebe ich Ihren Wunsch an den Empfang.',
    ae: 'The table is open Thursday to Saturday, doors at 6.30 pm, dinner from 7 pm. Five courses are 89 €, the wine pairing 48 €, and there is always a vegetarian version. Hotel guests need to book too. Tell me the day and the number of guests and I will pass your request to reception.' },
  { id: 'q7', w: 'allergien', s: /allergi|unverträg|gluten|laktose|nuss|nüsse|zöliak|vegan|vegetar|intoleran|celiac/i,
    de: 'Ich habe eine Lebensmittelallergie.', en: 'I have a food allergy.',
    a: 'Bitte melden Sie Unverträglichkeiten bis zum Vortag, dann richtet sich die Küche danach. Mareike Voss kocht jeden Abend, was der Hafenmarkt am Morgen hatte, und richtet einzelne Gänge eigens für Sie an. Eine vegetarische Fassung gibt es immer. Schreiben Sie mir, worauf Sie achten müssen, ich gebe es an die Küche weiter.',
    ae: 'Please let us know about any intolerance by the day before, and the kitchen will cook accordingly. Mareike Voss cooks each evening from what the harbour market had that morning and will prepare individual courses especially for you. There is always a vegetarian version. Tell me what to look out for and I will pass it on to the kitchen.' },
  { id: 'q8', w: 'wege', s: /fähre|faehre|schiff|boot|ferry|landungsbrücken|hafenfähre/i,
    de: 'Wie komme ich mit der Fähre?', en: 'Can I come by ferry?',
    a: 'Von den Landungsbrücken fährt die Hafenfähre 72 bis zur Elbphilharmonie. Wenn Sie dort aussteigen, sehen Sie das Haus schon, am Sandtorkai 7. Ein schöner erster Blick auf den Hafen.',
    ae: 'From the Landungsbrücken, harbour ferry 72 runs to the Elbphilharmonie. When you step off, you can already see the house at Sandtorkai 7. A lovely first view of the harbour.' },
  { id: 'q10', w: 'zimmer', s: /wanne|badewanne|bath|kranzimmer|dachsuite|suite/i,
    de: 'Gibt es ein Zimmer mit Badewanne?', en: 'Is there a room with a bath?',
    a: 'Ja, zwei Zimmerarten. Die Kranzimmer, 34 m² im vierten Boden, haben eine freistehende Wanne vor dem Fenster, davor die Kräne, ab 229 €. Die Dachsuite, 48 m² unter dem Dachstuhl von 1888, hat ihre Wanne unter dem Oberlicht, ab 340 €. Preise je Nacht für zwei Personen mit Frühstück.',
    ae: 'Yes, two kinds of room. The Crane Rooms, 34 m² on the fourth floor, have a freestanding bath by the window with the cranes outside, from 229 €. The Roof Suite, 48 m² under the roof timbers of 1888, has its bath beneath the skylight, from 340 €. Prices per night for two, breakfast included.' },
  { id: 'q11', w: 'storno', s: /storn|absagen|cancel|zahlung|bezahl|karte|rechnung|pay/i,
    de: 'Kann ich kostenlos stornieren?', en: 'Can I cancel free of charge?',
    a: 'Bis sieben Tage vor Anreise stornieren Sie kostenlos, danach berechnen wir 80 % der ersten Nacht. Für die Dachsuite gilt eine Frist von 14 Tagen. Bezahlen können Sie mit Karte, per Überweisung vorab oder bar.',
    ae: 'You can cancel free of charge up to seven days before arrival; after that we charge 80 % of the first night. For the Roof Suite the period is 14 days. You can pay by card, bank transfer in advance or cash.' },
  { id: 'q12', w: 'kinder', s: /kind|baby|familie|zustellbett|kinderbett|child|kids|family/i,
    de: 'Sind Kinder willkommen?', en: 'Are children welcome?',
    a: 'Kinder sind herzlich willkommen. Ein Kinderbett bis zwei Jahre stellen wir kostenlos ins Zimmer, ein Zustellbett bis zwölf Jahre kostet 40 € mit Frühstück. An der Tafel sind Kinder ab zehn Jahren willkommen, jüngere nach Absprache.',
    ae: 'Children are very welcome. A cot for children up to two is free of charge, an extra bed for children up to twelve is 40 € including breakfast. At the table, children from ten are welcome, younger ones by arrangement.' },
  { id: 'q13', w: 'feiern', s: /feier|geburtstag|hochzeit|dachboden|firmen|weihnachtsfeier|party|wedding|celebrat|event/i,
    de: 'Kann man bei Ihnen feiern?', en: 'Can we hold a celebration with you?',
    a: 'Ja. Auf dem Dachboden sitzen bis 24 Gäste an einer langen Tafel unter dem Dachstuhl, mit Blick über den Hafen. Die Tafel können Sie von Donnerstag bis Samstag für bis zu 28 Gäste ganz für sich haben, und für ein Wochenende auch das ganze Haus. Henrike Rademacher plant mit Ihnen persönlich.',
    ae: 'Yes. Up to 24 guests sit at one long table under the roof timbers in the attic, overlooking the harbour. From Thursday to Saturday you can have the whole table for up to 28 guests, and for a weekend even the whole house. Henrike Rademacher plans it with you personally.' },
  { id: 'q14', w: 'barrierefrei', s: /barriere|rollstuhl|stufen|aufzug|lift|wheelchair|accessib/i,
    de: 'Ist das Haus barrierefrei?', en: 'Is the house accessible?',
    a: 'Ein Aufzug fährt zu allen Böden. Ein Speicherzimmer auf dem ersten Boden ist stufenlos, mit breiter Tür und ebener Dusche. Sagen Sie uns bei der Anfrage Bescheid, dann halten wir es für Sie frei.',
    ae: 'A lift serves every floor. One Warehouse Room on the first floor is step-free, with a wide door and a level shower. Let us know when you enquire and we will keep it for you.' },
  { id: 'q15', w: 'bar', s: /\bbar\b|cocktail|drink|trinken|theke/i,
    de: 'Wann hat die Bar geöffnet?', en: 'When is the bar open?',
    a: 'Die Bar öffnet täglich ab 17 Uhr, Donnerstag bis Samstag bis 1 Uhr. Eine Theke aus Messing, achtzehn Plätze, der Blick aufs Wasser. Hausgäste bekommen auch nach Schluss noch ein Glas.',
    ae: 'The bar opens daily from 5 pm, Thursday to Saturday until 1 am. A brass counter, eighteen seats, a view of the water. Hotel guests can still have a glass after closing.' }
];

/* Weitere Antworten, nur über Stichworte erreichbar (nicht zum Antippen). */
WINDE.STICHWORTE = [
  { w: 'wege', s: /flughafen|airport|taxi|flug/i,
    a: 'Mit der S1 bis Hauptbahnhof, dann mit der U4 bis Überseequartier und ein paar Minuten am Wasser entlang. Ein Taxi braucht etwa 30 Minuten und kostet um 35 €.',
    ae: 'Take the S1 to the main station, then the U4 to Überseequartier and walk a few minutes along the water. A taxi takes about 30 minutes and costs around 35 €.' },
  { w: 'haus', s: /wlan|wifi|wi-fi|internet|passwort/i,
    a: 'Das WLAN reicht durchs ganze Haus, ohne Passwort und ohne Anmeldung.',
    ae: 'Wi-Fi covers the whole house, with no password and no sign-in.' },
  { w: 'haus', s: /rauch|zigarette|smok/i,
    a: 'Im ganzen Haus wird nicht geraucht. Auf dem Anleger vor der Tür ist es erlaubt.',
    ae: 'Smoking is not permitted anywhere in the house, but you are welcome to smoke on the jetty outside.' },
  { w: 'wege', s: /\brad\b|fahrrad|räder|hotelrad|bike|bicycle/i,
    a: 'Zwei Hotelräder stehen kostenlos bereit, mit Schloss und Korb. Tragen Sie sich einfach am Empfang ein.',
    ae: 'Two hotel bicycles are free to use, with lock and basket. Just sign up at reception.' },
  { w: 'wege', s: /bahn|zug|hauptbahnhof|train|station|u4/i,
    a: 'Vom Hauptbahnhof mit der U4 bis Überseequartier, dann ein paar Minuten am Wasser entlang. Vom Bahnhof sind es 15 Minuten.',
    ae: 'From the main station take the U4 to Überseequartier, then walk a few minutes along the water. It takes 15 minutes from the station.' },
  { w: 'zimmer', s: /preis|kostet|kosten|zimmer|room|price|nacht|night/i,
    a: 'Wir haben vier Zimmerarten: Speicherzimmer ab 159 €, Zimmer zum Wasser ab 189 €, Kranzimmer ab 229 € und die Dachsuite ab 340 €. Preise je Nacht für zwei Personen mit Frühstück, von November bis März. Bei Einzelbelegung 30 € weniger.',
    ae: 'We have four kinds of room: Warehouse Room from 159 €, Room by the Water from 189 €, Crane Room from 229 € and the Roof Suite from 340 €. Prices per night for two with breakfast, November to March. 30 € less for single occupancy.' },
  { w: 'haus', s: /elbphilharmonie|speicherstadt|umgebung|fischmarkt|sehenswürd|nearby/i,
    a: 'Die Speicherstadt beginnt drei Minuten von der Tür, zur Elbphilharmonie sind es acht Minuten zu Fuss, zu den Landungsbrücken fünfzehn. Der Fischmarkt öffnet sonntags ab 5 Uhr, mit der Fähre 15 Minuten.',
    ae: 'The Speicherstadt is three minutes from the door, the Elbphilharmonie eight minutes on foot, the Landungsbrücken fifteen. The fish market opens on Sundays from 5 am, 15 minutes by ferry.' }
];

WINDE.CHAT = {
  gruss: 'Guten Tag. Ich bin der Chat von Ihr Haus am Sandtorkai. Fragen Sie mich nach Zimmern, der Tafel, der Anreise oder nach Lotte. Für alles andere ist der Empfang da.',
  gruss_en: 'Good day. I am the chat of Ihr Haus at Sandtorkai. Ask me about rooms, dinner at the table, how to get here or about Lotte. For everything else, reception is happy to help.',
  weiter: 'Dazu weiss ich nichts Sicheres, und raten möchte ich nicht. Ich gebe Ihre Frage an den Empfang, an Tomke Claussen und ihre Kolleginnen. Sie antworten Ihnen heute noch.',
  weiter_en: 'I do not know enough about that to give you a reliable answer. I will pass your question to reception, to Tomke Claussen and her colleagues. They will reply to you today.',
  aus: 'Dazu darf ich gerade nichts sagen. Ich gebe Ihre Frage gern an den Empfang weiter, dort hilft man Ihnen persönlich.',
  aus_en: 'I cannot answer that at the moment. I will gladly pass your question to reception, where someone will help you personally.'
};

/* Das wurde gefragt: Beispielfragen der letzten Tage. Zwei mit Absicht ohne Antwort. */
WINDE.GEFRAGT = [
  { id: 'f01', zeit: '2026-11-03T15:58', sprache: 'de', frage: 'Gibt es bei Ihnen eine Sauna?', ohne: true, bild: 'm-seife',
    vorschlag: 'Eine Sauna hat das Haus nicht. Für einen warmen Abend empfehlen wir die freistehende Wanne im Kranzimmer oder in der Dachsuite.' },
  { id: 'f02', zeit: '2026-11-03T15:21', sprache: 'de', frage: 'Darf mein Hund mit in die Bar?', q: 'q5', bild: 's-hundeplatz' },
  { id: 'f03', zeit: '2026-11-03T13:47', sprache: 'en', frage: 'Is breakfast included in the room rate?', q: 'q4', bild: 'r-franzbroetchen' },
  { id: 'f04', zeit: '2026-11-03T12:30', sprache: 'de', frage: 'Bis wann muss ich am Sonntag aus dem Zimmer?', q: 'q2', bild: 's-schluesselbrett' },
  { id: 'f05', zeit: '2026-11-03T10:12', sprache: 'de', frage: 'Kann ich in der Nähe mein Elektroauto laden?', ohne: true, bild: 'a-koffer',
    vorschlag: 'Im Haus selbst gibt es keine Ladesäule. Fragen Sie im Parkhaus Speicherstadt nach einem Ladeplatz, drei Minuten zu Fuss; wir reservieren Ihnen dort gern einen Platz.' },
  { id: 'f06', zeit: '2026-11-02T22:05', sprache: 'de', frage: 'Ist die Tafel am Freitag noch frei?', q: 'q6', bild: 'r-gastraum' },
  { id: 'f07', zeit: '2026-11-02T19:40', sprache: 'en', frage: 'How far is the Elbphilharmonie?', k: 6, bild: 'a-speicherstadt' },
  { id: 'f08', zeit: '2026-11-02T17:15', sprache: 'de', frage: 'Gibt es vegetarisches Essen an der Tafel?', q: 'q7', bild: 'r-zutaten' },
  { id: 'f09', zeit: '2026-11-02T11:02', sprache: 'de', frage: 'Wie komme ich vom Hauptbahnhof zu Ihnen?', k: 4, bild: 'a-anleger' },
  { id: 'f10', zeit: '2026-11-01T20:48', sprache: 'de', frage: 'Welches Zimmer hat eine Badewanne?', q: 'q10', bild: 'z-wanne' },
  { id: 'f11', zeit: '2026-11-01T16:33', sprache: 'en', frage: 'Can we celebrate a birthday in the attic?', q: 'q13', bild: 's-dachboden' },
  { id: 'f12', zeit: '2026-11-01T09:20', sprache: 'de', frage: 'Habt ihr WLAN auf den Zimmern?', k: 1, bild: 'aussen' },
  { id: 'f13', zeit: '2026-10-31T18:10', sprache: 'de', frage: 'Wie lange hat die Bar am Samstag offen?', q: 'q15', bild: 'bar' },
  { id: 'f14', zeit: '2026-10-31T08:05', sprache: 'de', frage: 'Was kostet das Parkhaus?', q: 'q3', bild: 'a-raeder' }
];

WINDE.VORLAGEN = [
  { id: 'v01', art: 'zimmer', titel: 'Zimmer frei', satz: 'Zusage mit Zimmer, Preis und Anreise', bild: 'zimmer',
    betreff: 'Ihr Zimmer am Sandtorkai · {{13. bis 15. November}}',
    anrede: 'Liebe {{Frau Albers}},',
    text: 'vielen Dank für Ihre Anfrage. Für {{Freitag, den 13., bis Sonntag, den 15. November}}, halten wir Ihnen ein {{Zimmer zum Wasser}} frei. {{Das Bett steht so, dass der erste Blick am Morgen der Elbe gilt.}}\n\n{{Zwei Nächte}} kosten {{378 €}}, das Frühstück im Raum zum Wasser ist eingeschlossen. Ihr Zimmer ist ab 15 Uhr bereit, Ihr Gepäck nehmen wir gern auch früher an.\n\nFür eine verbindliche Buchung genügt eine kurze Antwort. Kostenlos stornieren können Sie bis sieben Tage vor Anreise.',
    gruss: 'Wir freuen uns auf Sie. Herzliche Grüsse vom Sandtorkai', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v02', art: 'zimmer', titel: 'Zimmer belegt, ein anderes frei', satz: 'Freundliche Absage mit einem anderen Zimmer', bild: 'z-speicherzimmer',
    betreff: 'Ihre Anfrage für {{den 20. November}}',
    anrede: 'Lieber {{Herr Matthiesen}},',
    text: 'vielen Dank für Ihre Anfrage. Die {{Kranzimmer}} sind an {{diesem Wochenende}} leider schon vergeben.\n\nFrei ist noch ein {{Zimmer zum Wasser auf dem dritten Boden, mit Blick auf die Elbe und einem Schreibtisch aus Eiche am Fenster}}. Es kostet {{189 €}} je Nacht für zwei Personen, mit Frühstück.\n\nWenn es Ihnen gefällt, halten wir es bis {{Freitag}} für Sie. Und wenn Sie lieber auf ein Kranzimmer warten: An {{den Wochenenden danach}} ist wieder eines frei.',
    gruss: 'Herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v03', art: 'tafel', titel: 'Tisch an der Tafel', satz: 'Reservierung mit Einlass, Menü und Preis', bild: 'r-tisch-fenster',
    betreff: 'Ihr Abend an der Tafel · {{Donnerstag, 5. November}}',
    anrede: 'Liebe {{Frau Kröger}},',
    text: 'für {{Donnerstag, den 5. November}}, haben wir Ihnen {{zwei Plätze}} an der Tafel reserviert. Einlass ist ab 18.30 Uhr, um 19 Uhr beginnt das Menü.\n\nGekocht wird, was der Hafenmarkt am Morgen hatte, in fünf Gängen und von Hand angerichtet. Das Menü kostet 89 € je Person, die Weinbegleitung 48 €. Eine vegetarische Fassung gibt es immer.\n\nUnverträglichkeiten nennen Sie uns bitte bis zum Vortag, dann richtet sich die Küche danach.',
    gruss: 'Bis {{Donnerstag}}. Herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v04', art: 'tafel', titel: 'Tafel ausgebucht', satz: 'Ein anderer Abend und die Bar als Vorschlag', bild: 'r-pass',
    betreff: 'Ihr Wunsch für {{Samstag, 14. November}}',
    anrede: 'Lieber {{Herr Thiel}},',
    text: 'vielen Dank, dass Sie an unserer Tafel essen möchten. Am {{Samstag, den 14. November}}, sind alle 28 Plätze vergeben.\n\nAm {{Freitag davor}} haben wir noch {{zwei Plätze}} frei, gern halten wir sie bis {{morgen Abend}} für Sie. Und wenn Sie am Samstag trotzdem kommen möchten: Die Bar hat ab 17 Uhr geöffnet, mit Blick aufs Wasser.',
    gruss: 'Herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v05', art: 'tafel', titel: 'Unverträglichkeit', satz: 'Die Küche weiss Bescheid', bild: 'r-zutaten',
    betreff: 'Ihr Menü an der Tafel · {{Freitag, 6. November}}',
    anrede: 'Liebe {{Frau Hennings}},',
    text: 'danke, dass Sie uns Ihre {{Laktoseunverträglichkeit}} schon jetzt nennen. Mareike Voss, unsere Küchenchefin, hat es sich notiert und richtet jeden Ihrer fünf Gänge eigens für Sie an.\n\nAm Abend kennt auch Lennart Brinkmann im Service Ihren Wunsch. Wenn Sie zu einem Gang eine Frage haben, sprechen Sie ihn einfach an.',
    gruss: 'Herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v06', art: 'feier', titel: 'Feier auf dem Dachboden', satz: 'Erster Vorschlag und Einladung zum Ansehen', bild: 's-dachboden',
    betreff: 'Ihre Feier unter dem Dachstuhl · {{Samstag, 28. November}}',
    anrede: 'Liebe {{Frau Asmussen}},',
    text: 'vielen Dank für Ihre Nachricht. Der Dachboden ist am {{Samstag, den 28. November}}, frei. Bis 24 Gäste sitzen an einer langen Tafel unter dem Dachstuhl von 1888, mit Blick über den Hafen.\n\nMareike Voss kocht das Menü der Woche in fünf Gängen oder ein eigenes Menü, das wir mit Ihnen zusammenstellen. Was der Abend kostet, hängt vom Menü und vom Wein ab.\n\nAm liebsten zeige ich Ihnen den Raum einmal selbst. Danach schicke ich Ihnen einen genauen Vorschlag.',
    gruss: 'Herzliche Grüsse', von: 'Henrike Rademacher', rolle: 'Gastgeberin' },
  { id: 'v07', art: 'feier', titel: 'Die Tafel exklusiv', satz: 'Firmenessen und Feste bis 28 Gäste', bild: 'r-gastraum',
    betreff: 'Die Tafel für Sie allein · {{Freitag, 11. Dezember}}',
    anrede: 'Lieber {{Herr Sommer}},',
    text: 'am {{Freitag, den 11. Dezember}}, gehört die Tafel gern Ihnen. Bis 28 Gäste sitzen zwischen Fliesen und Wänden in Flaschengrün.\n\nSie wählen das Menü der Woche oder ein eigenes, das Mareike Voss für Ihren Abend zusammenstellt, immer auch in einer vegetarischen Fassung. Ich schicke Ihnen bis {{Freitag}} einen ersten Vorschlag mit Menü, Wein und Preis.',
    gruss: 'Herzliche Grüsse vom Sandtorkai', von: 'Henrike Rademacher', rolle: 'Gastgeberin' },
  { id: 'v08', art: 'gruppe', titel: 'Gruppe', satz: 'Mehrere Zimmer, ein Abend an der Tafel, Rechnung', bild: 's-lobby',
    betreff: 'Ihre Gruppe am Sandtorkai · {{26. bis 27. November}}',
    anrede: 'Liebe {{Frau Kessler}},',
    text: 'für {{Donnerstag, den 26., bis Freitag, den 27. November}}, halten wir {{acht Zimmer}} für Sie frei: {{fünf Speicherzimmer und drei Zimmer zum Wasser}}. Zusammen kosten sie {{1.122 €}} in Einzelbelegung, mit Frühstück.\n\nAm Abend sitzen Sie gemeinsam an der Tafel, fünf Gänge zu 89 € je Person. Die Rechnung stellen wir auf {{Ihr Büro}} aus; Sie können vorab überweisen oder vor Ort mit Karte zahlen.',
    gruss: 'Herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v09', art: 'zimmer', titel: 'Mit Hund', satz: 'Willkommen für den Vierbeiner, Lotte inklusive', bild: 's-hundeplatz',
    betreff: 'Sie und {{Bruno}} am Sandtorkai',
    anrede: 'Liebe {{Frau Carstens}},',
    text: '{{Bruno}} ist bei uns herzlich willkommen. Eine Decke, ein Napf und ein Handtuch liegen auf dem Zimmer bereit, wenn Sie ankommen. Für ihn berechnen wir 20 € je Nacht.\n\nIn die Bar darf {{Bruno}} gern mit, während der Tafel bleibt er bitte auf dem Zimmer. Lotte, unser Hund, liegt meistens neben dem Empfang und wird ihn als Erste begrüssen.',
    gruss: 'Herzliche Grüsse, auch von Lotte', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v10', art: 'frage', titel: 'Der Weg zu uns', satz: 'Bahn, Schiff, Auto und Flughafen', bild: 'a-faehre',
    betreff: 'Ihr Weg zum Sandtorkai',
    anrede: 'Lieber {{Herr Wendt}},',
    text: 'wir freuen uns auf Ihre Ankunft am {{Freitag}}. Vom Hauptbahnhof fahren Sie mit der U4 bis Überseequartier und gehen ein paar Minuten am Wasser entlang. Schöner ist der Weg übers Wasser: Von den Landungsbrücken bringt Sie die Hafenfähre 72 bis zur Elbphilharmonie, von dort sehen Sie das Haus schon.\n\nMit dem Auto halten Sie zum Ausladen vor der Tür, danach geht es ins Parkhaus Speicherstadt, drei Minuten zu Fuss. Vom Flughafen nehmen Sie die S1 bis Hauptbahnhof und dann die U4, ein Taxi braucht etwa 30 Minuten.',
    gruss: 'Gute Reise und herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v11', art: 'frage', titel: 'Später abreisen', satz: 'Zusage für den späten Abschied', bild: 'z-kranzimmer',
    betreff: 'Ihr letzter Tag im {{Kranzimmer}}',
    anrede: 'Liebe {{Frau Brüggemann}},',
    text: 'gern. Ihr Zimmer ist am {{Sonntag}} nicht wieder belegt, Sie können also bis 14 Uhr bleiben. Wir berechnen dafür 30 €.\n\nDanach bewahren wir Ihr Gepäck am Empfang auf, so lange Sie möchten.',
    gruss: 'Einen ruhigen Tag wünscht Ihnen', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v12', art: 'zimmer', titel: 'Ohne Stufen', satz: 'Das stufenlose Zimmer und der Aufzug', bild: 'z-leseecke',
    betreff: 'Ein Zimmer ohne Stufen · {{10. bis 12. Dezember}}',
    anrede: 'Liebe {{Frau Schöning}},',
    text: 'für {{Donnerstag, den 10., bis Samstag, den 12. Dezember}}, halten wir Ihnen unser stufenloses Speicherzimmer auf dem ersten Boden frei. Es hat eine breite Tür und eine ebene Dusche, und der Aufzug fährt zu allen Böden.\n\nWenn Sie noch etwas brauchen, schreiben Sie es mir. Wir richten es gern vor Ihrer Ankunft.',
    gruss: 'Herzliche Grüsse', von: 'Tomke Claussen', rolle: 'Empfang' },
  { id: 'v13', art: 'zimmer', titel: 'Room confirmation (English)', satz: 'Zusage auf Englisch für Gäste aus dem Ausland', bild: 'z-wanne', sprache: 'en',
    betreff: 'Your stay by the harbour · {{4 to 7 December}}',
    anrede: 'Dear {{Mr Whitfield}},',
    text: 'thank you for your enquiry. From {{Friday 4 to Monday 7 December}} we are holding a {{Crane Room}} for you, {{a corner room with two tall windows and a freestanding bath facing the cranes}}.\n\n{{Three nights}} come to {{687 €}}, breakfast in the room by the water is included. Your room is ready from 3 pm, and we are happy to take your luggage earlier.\n\nThe Elbphilharmonie is an eight-minute walk along the water. Please just reply to confirm.',
    gruss: 'Warm regards from Sandtorkai', von: 'Tomke Claussen', rolle: 'Reception' },
  { id: 'v14', art: 'frage', titel: 'Nach dem Aufenthalt', satz: 'Ein Dank, ein paar Tage nach der Abreise', bild: 'schluss',
    betreff: 'Danke für Ihren Besuch',
    anrede: 'Liebe {{Frau Hollmann}},',
    text: 'ein paar Tage sind vergangen, seit Sie bei uns am Sandtorkai waren. Wir hoffen, Sie denken gern an {{den Abend an der Tafel und den Blick aufs Wasser}} zurück.\n\nDanke, dass Sie bei uns gewohnt haben. Wenn Sie wiederkommen, sagen Sie es uns direkt, dann suchen wir Ihnen wieder {{Ihr Zimmer zum Wasser}} aus. Lotte lässt grüssen.',
    gruss: 'Herzliche Grüsse vom Sandtorkai', von: 'Henrike Rademacher', rolle: 'Gastgeberin' }
];
