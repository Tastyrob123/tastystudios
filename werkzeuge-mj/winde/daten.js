/* Anfragen & Chat · Inhalte der Vorführung (Maloja). Erfundene Gäste mit example.com; Zeiten, Plätze, Preise, Gänge und Regeln des Restaurants
   wie in window.HAUS (Website-Projekte/Maloja/maloja.py), nie anders. */
window.WINDE = window.WINDE || {};
WINDE.HEUTE = '2026-11-03T16:40';

WINDE.ANFRAGEN = [
{
  id: 'a01', art: 'tafel', status: 'neu', zeit: '2026-11-03T14:12', bild: 'm-fenster',
  name: 'Katrin Hollmann', mail: 'katrin.hollmann@example.com', tel: '+49 151 000 00 12', sprache: 'de',
  weg: 'Reservierung auf der Website, Seite Reservieren',
  angaben: [['Tag', 'Fr 13. November'], ['Zeit', '19.00 Uhr'], ['Personen', '2'], ['Platz', 'Kontorsaal, am Fenster']],
  nachricht: 'Wir feiern unseren zehnten Hochzeitstag und hätten gern einen Tisch am Fenster zum Fleet. Mein Mann isst keinen Fisch. Geht das beim Menü mit sieben Gängen?',
  hinweise: ['Freitag, 13. November: geöffnet, ab 18.30 Uhr', 'Kein Fisch: Gerstensuppe mit Aal, Capuns mit Saibling und Steinbutt für ihn ersetzen', 'Sieben Gänge 168 €, Weinbegleitung 98 €'],
  brief: {
    betreff: 'Ihr Hochzeitstag im Kontorsaal · Freitag, 13. November',
    anrede: 'Liebe Frau Hollmann,',
    text: 'vielen Dank für Ihre Reservierung und herzlichen Glückwunsch zu zehn gemeinsamen Jahren. Wir freuen uns, dass Sie diesen Abend bei uns verbringen möchten.\n\nFür Freitag, den 13. November, um 19 Uhr haben wir Ihnen einen Tisch für zwei am Fenster zum Fleet reserviert.\n\nDas Menü hat sieben Gänge und kostet 168 € je Person, die Weinbegleitung aus der Schweiz und Deutschland 98 €. Dass Ihr Mann keinen Fisch isst, weiss unsere Küche: Statt Gerstensuppe mit Aal, Capuns mit Saibling und Steinbutt richtet sie ihm die Gänge aus dem vegetarischen Menü an, jeden von Hand.\n\nWenn Sie mögen, bestätigen Sie uns den Abend mit einer kurzen Antwort.',
    gruss: 'Wir freuen uns auf Sie. Herzliche Grüsse vom Pickhuben',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a02', art: 'tafel', status: 'neu', zeit: '2026-11-03T11:48', bild: 'm-saal',
  name: 'Jonas Petersen', mail: 'j.petersen@example.com', tel: '+49 170 000 00 48', sprache: 'de',
  weg: 'Reservierung auf der Website, Seite Reservieren',
  angaben: [['Tag', 'Do 5. November'], ['Zeit', '19.30 Uhr'], ['Personen', '4'], ['Platz', 'Kontorsaal']],
  nachricht: 'Wir möchten am Donnerstag mit meinen Eltern zu Ihnen kommen. Meine Mutter isst vegetarisch, mein Vater verträgt keine Nüsse. Geht das?',
  hinweise: ['Donnerstag, 5. November: geöffnet, ab 18.30 Uhr', 'Vegetarisch: das Menü gibt es ebenso in sieben Gängen', 'Nüsse: Engadiner Nusstorte für eine Person ersetzen, Küche informieren'],
  brief: {
    betreff: 'Ihr Abend im Maloja · Donnerstag, 5. November',
    anrede: 'Lieber Herr Petersen,',
    text: 'vielen Dank für Ihre Reservierung. Für Donnerstag, den 5. November, um 19.30 Uhr haben wir Ihnen einen Tisch für vier im Kontorsaal reserviert.\n\nDas Menü gibt es ebenso vegetarisch in sieben Gängen, zum selben Preis. Ihre Mutter isst also jeden Gang mit, vom Bündner Zopf bis zur Nusstorte.\n\nDass Ihr Vater keine Nüsse verträgt, hat sich unsere Küche notiert. Statt der Engadiner Nusstorte bekommt er zum Schluss ein eigenes Dessert. Allergene stehen bei jedem Gericht auf der Karte, unser Service berät Sie am Abend gern.',
    gruss: 'Bis Donnerstag. Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a03', art: 'feier', status: 'offen', zeit: '2026-11-02T18:30', bild: 'm-stube',
  name: 'Dr. Ulrike Brandes', mail: 'u.brandes@example.com', tel: '+49 40 000 00 731', sprache: 'de',
  weg: 'Anfrage auf der Website, Seite Feiern',
  angaben: [['Tag', 'Sa 28. November'], ['Anlass', '60. Geburtstag'], ['Personen', '12'], ['Ort', 'Die Arvenstube']],
  nachricht: 'Mein Mann wird sechzig. Wir möchten mit zwölf Gästen in der Arvenstube feiern, gern mit dem Menü und Platz für eine kurze Rede.',
  hinweise: ['Arvenstube: bis 12 Gäste an einem langen Tisch, passt genau', 'Menü mit der Gastgeberin zusammenstellen, aus der Karte der Saison', 'Besichtigung anbieten'],
  brief: {
    betreff: 'Sechzig Jahre in der Arvenstube · Samstag, 28. November',
    anrede: 'Liebe Frau Dr. Brandes,',
    text: 'vielen Dank für Ihre Nachricht und schon jetzt alles Gute für Ihren Mann. Die Arvenstube ist am Samstag, den 28. November, frei. Sie ist ganz aus Arvenholz, wie im Engadin, mit einem Kachelofen und einem langen Tisch für bis zu zwölf Gäste, an diesem Abend nur für Sie.\n\nDas Menü stellen wir mit Ihnen zusammen, aus der Karte der Saison, mit Weinbegleitung aus der Schweiz und Deutschland. Für die Rede ist Platz am Kopf des Tisches, vor dem Kachelofen.\n\nAm liebsten zeige ich Ihnen die Stube einmal selbst. Sagen Sie mir einfach, wann es Ihnen passt.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a04', art: 'gruppe', status: 'offen', zeit: '2026-11-02T10:05', bild: 'm-saal-abend',
  name: 'Miriam Kessler', mail: 'm.kessler@example.com', tel: '+49 89 000 00 26', sprache: 'de', firma: 'Studio Nordlicht, München',
  weg: 'Anfrage auf der Website, Seite Feiern',
  angaben: [['Tag', 'Do 10. Dezember'], ['Anlass', 'Jahresabschluss'], ['Personen', '26'], ['Ort', 'Der Kontorsaal']],
  nachricht: 'Wir sind ein Designbüro und möchten das Jahr mit 26 Gästen bei Ihnen abschliessen, an einem Abend nur für uns. Die Rechnung sollte an das Büro gehen.',
  hinweise: ['Kontorsaal: bis 34 Gäste, der ganze Saal mit Blick aufs Fleet', 'Sieben Gänge 168 € je Gast, Weinbegleitung 98 €', 'Rechnung an Studio Nordlicht'],
  brief: {
    betreff: 'Ihr Jahresabschluss im Kontorsaal · Donnerstag, 10. Dezember',
    anrede: 'Liebe Frau Kessler,',
    text: 'vielen Dank für Ihre Anfrage. Am Donnerstag, den 10. Dezember, gehört Ihnen gern der ganze Kontorsaal: hohe Fenster zum Fleet, weisses Leinen, Wände aus Arvenholz, Platz für bis zu 34 Gäste. Für Ihre 26 Gäste decken wir einen langen Tisch durch den Saal.\n\nDas Menü hat sieben Gänge und kostet 168 € je Gast, die Weinbegleitung 98 €. Gern stellen wir es auch mit Ihnen zusammen, aus der Karte der Saison. Die Rechnung geht an Studio Nordlicht, wie Sie es wünschen.\n\nWenn Sie mögen, halte ich Ihnen den Abend bis Ende der Woche frei.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a05', art: 'tafel', status: 'neu', zeit: '2026-11-03T09:20', bild: 'm-bar',
  name: 'Ina Lorenzen', mail: 'ina.lorenzen@example.com', tel: '+49 160 000 00 05', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Fr 20. November'], ['Zeit', 'ab 18 Uhr'], ['Personen', '2 und ein Hund'], ['Platz', 'An der Bar']],
  nachricht: 'Wir kommen mit Ole, einem ruhigen Labrador. Dürfen wir mit ihm an die Bar und dort etwas essen?',
  hinweise: ['Hunde: gut erzogene Hunde sind in der Bar willkommen', 'Bar ab 18 Uhr, auch ohne Reservierung, die Gerichte auch einzeln', 'Im Kontorsaal ohne Hund'],
  brief: {
    betreff: 'Sie und Ole an der Bar · Freitag, 20. November',
    anrede: 'Liebe Frau Lorenzen,',
    text: 'Ole ist bei uns herzlich willkommen. Gut erzogene Hunde dürfen in die Bar, und ein ruhiger Labrador passt dort gut hin.\n\nDie Bar öffnet um 18 Uhr, auch ohne Reservierung. Dort gibt es die Gerichte auch einzeln, etwa die Gerstensuppe mit geräuchertem Aal oder das Kalb Zürcher Art mit Rösti. Für Freitag, den 20. November, halten wir Ihnen gern zwei Plätze am Fenster frei.',
    gruss: 'Herzliche Grüsse, bis Freitag',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a06', art: 'frage', status: 'neu', zeit: '2026-11-03T07:55', bild: 'm-bruecke',
  name: 'Gisela Rautenberg', mail: 'g.rautenberg@example.com', tel: '+49 171 000 00 66', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Sa 7. November'], ['Reserviert', '19.00 Uhr, zwei Personen'], ['Thema', 'Anfahrt mit dem Auto']],
  nachricht: 'Wir kommen am Samstag mit dem Auto aus Lüneburg. Wo stellen wir es am besten ab, und wie finden wir den Eingang?',
  hinweise: ['Reserviert: Samstag, 7. November, 19 Uhr', 'Parkhaus am Brooktorkai, von dort wenige Minuten zu Fuss', 'Pickhuben 6, erster Stock'],
  brief: {
    betreff: 'Ihr Weg zum Pickhuben · Samstag, 7. November',
    anrede: 'Liebe Frau Rautenberg,',
    text: 'schön, dass Sie am Samstag zu uns kommen. Mit dem Auto stellen Sie es am besten ins Parkhaus am Brooktorkai. Von dort sind es wenige Minuten zu Fuss über die Brücken in die Speicherstadt.\n\nUnser Haus ist der Pickhuben 6. Durch die Tür im Sandsteinportal führt eine breite Granittreppe in den ersten Stock, dort beginnt der Kontorsaal.\n\nIhr Tisch für zwei ist um 19 Uhr bereit. Kommen Sie gern schon etwas früher, die Bar öffnet um 18 Uhr.',
    gruss: 'Gute Fahrt und herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a07', art: 'tafel', status: 'neu', zeit: '2026-11-02T21:40', bild: 'm-glas',
  name: 'James Whitfield', mail: 'j.whitfield@example.com', tel: '+44 20 0000 0071', sprache: 'en',
  weg: 'Reservierung auf der Website, Seite Reservieren (englisch)',
  angaben: [['Tag', 'Fr 4. Dezember'], ['Zeit', '19.00 Uhr'], ['Personen', '2'], ['Platz', 'Kontorsaal, Weinbegleitung']],
  nachricht: 'We are coming to Hamburg for a concert at the Elbphilharmonie on Saturday. Could we have dinner with you on Friday, with the wine pairing? My wife would love to try Swiss wine.',
  nachricht_de: 'Wir kommen für ein Konzert in der Elbphilharmonie am Samstag nach Hamburg. Könnten wir am Freitag bei Ihnen essen, mit der Weinbegleitung? Meine Frau würde gern Schweizer Wein probieren.',
  hinweise: ['Freitag, 4. Dezember: geöffnet, ab 18.30 Uhr', 'Weinbegleitung 98 €: Chasselas aus der Waadt, Riesling von der Mosel', 'Antwort auf Englisch'],
  brief: {
    betreff: 'Your evening at Maloja · Friday 4 December',
    anrede: 'Dear Mr Whitfield,',
    text: 'thank you for your reservation. We would be delighted to welcome you before your concert weekend.\n\nFor Friday 4 December at 7 pm we have reserved a table for two in the Kontor hall, by one of the tall windows overlooking the canal.\n\nThe menu has seven courses and is 168 € per person. The wine pairing is 98 € and comes from Switzerland and Germany: your wife will taste a Chasselas from Vaud alongside a Riesling from the Moselle.\n\nA short reply is all it takes to confirm.',
    gruss: 'Warm regards from Pickhuben',
    von: 'Lena Hartmann', rolle: 'Host'
  },
  brief_de: 'Vielen Dank für Ihre Reservierung. Wir freuen uns, Sie vor Ihrem Konzertwochenende bei uns zu haben.\n\nFür Freitag, den 4. Dezember, um 19 Uhr haben wir Ihnen einen Tisch für zwei im Kontorsaal reserviert, an einem der hohen Fenster zum Fleet.\n\nDas Menü hat sieben Gänge und kostet 168 € je Person. Die Weinbegleitung kostet 98 € und kommt aus der Schweiz und aus Deutschland: Ihre Frau probiert einen Chasselas aus der Waadt neben einem Riesling von der Mosel.\n\nEine kurze Antwort genügt zur Bestätigung.'
},
{
  id: 'a08', art: 'tafel', status: 'offen', zeit: '2026-11-01T16:10', bild: 'm-stube',
  name: 'Henning Matthiesen', mail: 'h.matthiesen@example.com', tel: '+49 40 000 00 518', sprache: 'de',
  weg: 'Reservierung auf der Website, Seite Reservieren',
  angaben: [['Tag', 'Sa 21. November'], ['Zeit', '19.00 Uhr'], ['Personen', '9'], ['Platz', 'Kontorsaal']],
  nachricht: 'Wir sind neun Freunde und treffen uns einmal im Jahr. Können wir zusammen an einem Tisch sitzen?',
  hinweise: ['9 Gäste: Tische bis sechs reserviert man online, grössere Runden schreiben', 'Vorschlag: die Arvenstube, bis 12 Gäste an einem langen Tisch', 'Antwort am selben Tag'],
  brief: {
    betreff: 'Neun an einem Tisch · Samstag, 21. November',
    anrede: 'Lieber Herr Matthiesen,',
    text: 'vielen Dank für Ihre Nachricht. Im Kontorsaal decken wir Tische bis sechs Gäste. Für neun Freunde, die sich einmal im Jahr sehen, haben wir etwas Schöneres: die Arvenstube, ganz aus Arvenholz, mit einem Kachelofen und einem langen Tisch für bis zu zwölf Gäste, an diesem Abend nur für Sie.\n\nAm Samstag, den 21. November, ist sie [frei oder belegt]. Das Menü hat sieben Gänge und kostet 168 € je Person, die Weinbegleitung 98 €.\n\nSagen Sie mir, ob Ihnen die Stube gefällt, dann halte ich sie für Sie fest.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a09', art: 'frage', status: 'erledigt', zeit: '2026-10-31T08:30', bild: 'm-gedeck', gesendet: '31. Oktober, 9.10 Uhr',
  name: 'Annika Brüggemann', mail: 'a.brueggemann@example.com', tel: '+49 151 000 00 93', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Di 3. November'], ['Reserviert', '18.30 Uhr, vier Personen'], ['Thema', 'Absage']],
  nachricht: 'Leider müssen wir unseren Tisch am Dienstag absagen, meine Schwester ist krank geworden. Entstehen dafür Kosten?',
  hinweise: ['Absage drei Tage vorher: bis 48 Stunden vorher kostenfrei', 'Tisch am Dienstag wieder freigeben'],
  brief: {
    betreff: 'Ihre Absage für Dienstag, 3. November',
    anrede: 'Liebe Frau Brüggemann,',
    text: 'danke, dass Sie uns so früh Bescheid geben, und gute Besserung für Ihre Schwester. Bis 48 Stunden vor dem Abend sagen Sie bei uns kostenfrei ab, es entstehen Ihnen also keine Kosten.\n\nWir haben Ihren Tisch für Dienstag gelöst. Wenn Sie einen neuen Abend suchen, schreiben Sie mir einfach, wir finden gern einen Tisch für Sie vier.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a10', art: 'frage', status: 'offen', zeit: '2026-11-01T11:00', bild: 'm-karten',
  name: 'Felix Andersen', mail: 'felix.andersen@example.com', tel: '+49 176 000 00 34', sprache: 'de',
  weg: 'Anfrage auf der Website, Seite Reservieren',
  angaben: [['Anlass', 'Geschenk zum Jahrestag'], ['Personen', '2'], ['Thema', 'Gutschein']],
  nachricht: 'Ich möchte meinen Eltern einen Abend bei Ihnen schenken, das ganze Menü mit Wein. Geht das als Gutschein?',
  hinweise: ['Sieben Gänge für zwei mit Weinbegleitung: 2 × (168 € + 98 €) = 532 €', 'Gutschein gedruckt oder als Mail'],
  brief: {
    betreff: 'Ein Abend im Kontor zum Verschenken',
    anrede: 'Lieber Herr Andersen,',
    text: 'was für ein schönes Geschenk. Einen Abend bei uns gibt es als Gutschein: sieben Gänge für zwei mit der Weinbegleitung aus der Schweiz und Deutschland, zusammen 532 €.\n\nSie bekommen den Gutschein gedruckt auf unserem Papier oder als Mail, ganz wie Sie möchten. Ihre Eltern reservieren dann selbst einen Abend, Dienstag bis Samstag ab 18.30 Uhr.\n\nSchreiben Sie mir, auf welchen Namen der Gutschein lauten soll und wohin wir ihn schicken dürfen.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a11', art: 'feier', status: 'neu', zeit: '2026-11-03T13:05', bild: 'm-saal-abend',
  name: 'Lea Albers', mail: 'lea.albers@example.com', tel: '+49 162 000 00 77', sprache: 'de',
  weg: 'Anfrage auf der Website, Seite Feiern',
  angaben: [['Tag', 'Sa 12. Juni 2027'], ['Anlass', 'Hochzeit'], ['Personen', '34'], ['Ort', 'Der Kontorsaal']],
  nachricht: 'Wir heiraten im Juni und suchen einen Ort für das Essen danach, mit 34 Gästen. Geht der ganze Saal? Einige Gäste essen vegetarisch.',
  hinweise: ['Kontorsaal: bis 34 Gäste, passt genau', 'Vegetarisch: das Menü gibt es ebenso in sieben Gängen', 'Besichtigung anbieten'],
  brief: {
    betreff: 'Ihre Hochzeit im Kontorsaal · Samstag, 12. Juni 2027',
    anrede: 'Liebe Frau Albers,',
    text: 'herzlichen Glückwunsch und vielen Dank, dass Sie an uns denken. Der ganze Kontorsaal fasst bis zu 34 Gäste, mit den hohen Fenstern zum Fleet. Für Ihre Hochzeit am Samstag, den 12. Juni 2027, halten wir ihn gern für Sie vor.\n\nDas Menü stellen wir mit Ihnen zusammen, aus der Karte der Saison, mit Weinbegleitung aus der Schweiz und Deutschland. Wer vegetarisch isst, bekommt jeden Gang in der vegetarischen Fassung.\n\nAm schönsten ist es, den Saal einmal am Abend zu sehen. Passt es Ihnen am [Tag und Uhrzeit für die Besichtigung]?',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a12', art: 'tafel', status: 'offen', zeit: '2026-10-30T19:20', bild: 'm-brot',
  name: 'Sophie Carstens', mail: 's.carstens@example.com', tel: '+49 172 000 00 81', sprache: 'de',
  weg: 'Reservierung auf der Website, Seite Reservieren',
  angaben: [['Tag', 'Sa 21. November'], ['Zeit', '18.30 Uhr'], ['Personen', '4, davon zwei Kinder'], ['Platz', 'Kontorsaal']],
  nachricht: 'Wir kommen mit unseren Kindern, acht und elf Jahre alt. Ist das in Ordnung, und gibt es etwas für sie?',
  hinweise: ['Kinder sind willkommen, auf Wunsch eine kleine Karte', 'Samstag, 21. November: ab 18.30 Uhr'],
  brief: {
    betreff: 'Ihr Abend mit den Kindern · Samstag, 21. November',
    anrede: 'Liebe Frau Carstens,',
    text: 'Kinder sind bei uns herzlich willkommen. Für Samstag, den 21. November, um 18.30 Uhr haben wir Ihnen einen Tisch für vier im Kontorsaal reserviert.\n\nFür Ihre Kinder gibt es auf Wunsch eine kleine Karte. Und wer mag, schaut zum Käsewagen hinüber, wenn er durch den Saal fährt.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a13', art: 'tafel', status: 'erledigt', zeit: '2026-10-29T15:45', bild: 'm-pass', gesendet: '29. Oktober, 16.20 Uhr',
  name: 'Marlene Voigt', mail: 'marlene.voigt@example.com', tel: '+49 157 000 00 29', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Sa 31. Oktober'], ['Zeit', '19.00 Uhr'], ['Personen', '2'], ['Küche', 'glutenfrei (Zöliakie)']],
  nachricht: 'Wir möchten am Samstag zu Ihnen. Ich habe Zöliakie und darf nichts mit Gluten essen.',
  hinweise: ['Gluten (Zöliakie): Küche bei der Reservierung informieren', 'Brot, Capuns, Kalb und Nusstorte eigens anrichten'],
  brief: {
    betreff: 'Ihr Menü ohne Gluten · Samstag, 31. Oktober',
    anrede: 'Liebe Frau Voigt,',
    text: 'danke, dass Sie uns Ihre Zöliakie schon bei der Reservierung nennen. Für Samstag, den 31. Oktober, um 19 Uhr ist Ihr Tisch für zwei bereit.\n\nUnsere Küche hat es sich notiert und richtet jeden Ihrer sieben Gänge ohne Gluten an, auch das Brot zu Beginn und das Dessert. Am Abend weiss auch der Service Bescheid; bei jedem Gericht stehen die Allergene auf der Karte.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a14', art: 'frage', status: 'erledigt', zeit: '2026-10-28T12:10', bild: 'm-bar', gesendet: '28. Oktober, 12.40 Uhr',
  name: 'Thomas Behrendt', mail: 't.behrendt@example.com', tel: '+49 173 000 00 14', sprache: 'de',
  weg: 'Chat der Website',
  angaben: [['Tag', 'Fr 30. Oktober'], ['Thema', 'Ohne Menü an der Bar']],
  nachricht: 'Kann man bei Ihnen auch ohne das ganze Menü essen? Wir hätten am Freitag nur Lust auf ein, zwei Gerichte.',
  hinweise: ['Bar ab 18 Uhr, auch ohne Reservierung', 'Gerichte einzeln: Gerstensuppe 24 €, Capuns 32 €, Kalb Zürcher Art 52 €, Steinbutt 48 €'],
  brief: {
    betreff: 'Ein, zwei Gerichte an der Bar',
    anrede: 'Lieber Herr Behrendt,',
    text: 'sehr gern. Die Bar öffnet um 18 Uhr, auch ohne Reservierung, und dort gibt es die Gerichte auch einzeln: die Gerstensuppe mit geräuchertem Aal für 24 €, die Capuns mit Saibling aus der Ostsee für 32 € und das Kalb Zürcher Art mit Rösti für 52 €. Neu dazu kommt gerade der Steinbutt mit Chasselas-Sauce für 48 €.\n\nWir freuen uns auf Ihren Freitag.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
},
{
  id: 'a15', art: 'feier', status: 'neu', zeit: '2026-11-03T16:02', bild: 'm-aussen',
  name: 'Christian Brandt', mail: 'c.brandt@example.com', tel: '+49 40 000 00 902', sprache: 'de',
  weg: 'Anfrage auf der Website, Seite Feiern',
  angaben: [['Tag', 'Sa 12. Dezember'], ['Anlass', 'Goldene Hochzeit der Eltern'], ['Personen', '12'], ['Ort', 'Die Arvenstube']],
  nachricht: 'Meine Eltern feiern goldene Hochzeit. Wir wären zwölf, mit den Enkeln. Gibt es die Stube an diesem Samstag noch, und können wir das Menü vorher besprechen?',
  hinweise: ['Arvenstube: bis 12 Gäste, passt genau', 'Menü mit der Gastgeberin besprechen', 'Kinder sind willkommen, kleine Karte auf Wunsch'],
  brief: {
    betreff: 'Goldene Hochzeit in der Arvenstube · Samstag, 12. Dezember',
    anrede: 'Lieber Herr Brandt,',
    text: 'was für ein Anlass. Die Arvenstube ist am Samstag, den 12. Dezember, noch frei, und zwölf Gäste ist genau die Zahl, für die ihr langer Tisch gemacht ist. Am Kachelofen sitzt man in der Adventszeit besonders gut.\n\nDas Menü besprechen wir gern vorher mit Ihnen, aus der Karte der Saison und mit Weinbegleitung aus der Schweiz und Deutschland. Für die Enkel gibt es auf Wunsch eine kleine Karte.\n\nIch halte Ihnen die Stube bis Ende der Woche frei.',
    gruss: 'Herzliche Grüsse',
    von: 'Lena Hartmann', rolle: 'Gastgeberin'
  }
}
];

/* Fragen zum Antippen. s = Stichworte für freie Eingabe. */
WINDE.FRAGEN = [
  { id: 'q1', w: 'zeiten', s: /öffnungszeit|geöffnet|offen|wann.*(auf|offen)|uhrzeit|abends|open|opening|hours/i,
    de: 'Wann haben Sie geöffnet?', en: 'When are you open?',
    a: 'Wir haben Dienstag bis Samstag ab 18.30 Uhr geöffnet, der letzte Einlass ist um 21 Uhr. Sonntag und Montag ist Ruhetag. Die Bar öffnet schon um 18 Uhr, auch ohne Reservierung.',
    ae: 'We are open Tuesday to Saturday from 6.30 pm, with the last seating at 9 pm. Sunday and Monday we are closed. The bar opens at 6 pm, no reservation needed.' },
  { id: 'q2', w: 'reservieren', s: /reserv|tisch|platz frei|plätze|table|book|booking/i,
    de: 'Wie reserviere ich einen Tisch?', en: 'How do I book a table?',
    a: 'Tische bis sechs Gäste reservieren Sie direkt auf unserer Website. Für grössere Runden schreiben Sie uns, wir antworten am selben Tag. Nennen Sie mir gern Tag, Uhrzeit und Personenzahl, dann gebe ich Ihren Wunsch weiter.',
    ae: 'You can book tables for up to six guests directly on our website. For larger groups, write to us and we will reply the same day. Tell me the day, time and number of guests and I will pass your request on.' },
  { id: 'q3', w: 'anfahrt', s: /park|auto|wagen|car\b|anfahrt|anreise|bahn|u3|baumwall|weg zu|finden|directions/i,
    de: 'Wie komme ich zu Ihnen?', en: 'How do I get to you?',
    a: 'Sie finden uns am Pickhuben 6, im ersten Stock eines Kontors in der Speicherstadt. Mit der Bahn fahren Sie mit der U3 bis Baumwall, dann sind es wenige Minuten über die Brücken. Mit dem Auto parken Sie am besten im Parkhaus am Brooktorkai, von dort wenige Minuten zu Fuss.',
    ae: 'You will find us at Pickhuben 6, on the first floor of a Kontor building in the Speicherstadt. By train, take the U3 to Baumwall, then it is a few minutes over the bridges. By car, the car park at Brooktorkai is best, a few minutes on foot from there.' },
  { id: 'q4', w: 'menue', s: /menü|menu|kostet|preis|price|gänge|gang|courses|was gibt es/i,
    de: 'Was kostet das Menü?', en: 'How much is the menu?',
    a: 'Das Menü hat sieben Gänge und kostet 168 €, mit fünf Gängen 138 €. Beide gibt es auch vegetarisch. Die Weinbegleitung aus der Schweiz und Deutschland kostet 98 €.',
    ae: 'The menu has seven courses and is 168 €, or 138 € with five courses. Both are also available vegetarian. The wine pairing from Switzerland and Germany is 98 €.' },
  { id: 'q5', w: 'hunde', s: /hund|dog|haustier|pet/i,
    de: 'Darf mein Hund mitkommen?', en: 'Can I bring my dog?',
    a: 'Gut erzogene Hunde sind in der Bar willkommen. Dort gibt es die Gerichte auch einzeln, ab 18 Uhr und auch ohne Reservierung.',
    ae: 'Well-behaved dogs are welcome in the bar. The dishes are also served individually there, from 6 pm and without a reservation.' },
  { id: 'q6', w: 'vegetarisch', s: /vegetar|vegan|ohne fleisch|kein fleisch|meat/i,
    de: 'Gibt es das Menü vegetarisch?', en: 'Is there a vegetarian menu?',
    a: 'Ja, das Menü gibt es ebenso vegetarisch in sieben Gängen, zum selben Preis: vom Bündner Zopf über das Alpkäse-Soufflé mit Holunder bis zur Engadiner Nusstorte.',
    ae: 'Yes, the menu is also available vegetarian in seven courses, at the same price: from the Bündner plait and the alpine cheese soufflé with elderflower to the Engadine walnut tart.' },
  { id: 'q7', w: 'allergien', s: /allergi|unverträg|gluten|laktose|nuss|nüsse|zöliak|intoleran|celiac/i,
    de: 'Ich habe eine Lebensmittelallergie.', en: 'I have a food allergy.',
    a: 'Sagen Sie es uns bitte bei der Reservierung, dann richtet sich unsere Küche danach und richtet einzelne Gänge eigens für Sie an. Allergene stehen bei jedem Gericht auf der Karte. Schreiben Sie mir, worauf Sie achten müssen, ich gebe es an die Küche weiter.',
    ae: 'Please let us know when you book, and our kitchen will prepare individual courses especially for you. Allergens are listed with every dish on the menu. Tell me what to look out for and I will pass it on to the kitchen.' },
  { id: 'q8', w: 'bar', s: /\bbar\b|einzeln|ohne menü|kleine.*essen|drink|glas wein/i,
    de: 'Kann ich auch nur an der Bar essen?', en: 'Can I just eat at the bar?',
    a: 'Gern. Die Bar öffnet um 18 Uhr, auch ohne Reservierung. Dort gibt es die Gerichte auch einzeln, etwa die Gerstensuppe mit geräuchertem Aal für 24 € oder das Kalb Zürcher Art für 52 €.',
    ae: 'Of course. The bar opens at 6 pm, no reservation needed. The dishes are also served individually there, such as the barley soup with smoked eel for 24 € or the veal Zurich style for 52 €.' },
  { id: 'q10', w: 'feiern', s: /feier|geburtstag|hochzeit|jubiläum|firmen|gesellschaft|arvenstube|stube|saal|party|wedding|celebrat|event|private/i,
    de: 'Kann man bei Ihnen feiern?', en: 'Can we hold a celebration with you?',
    a: 'Ja. Die Arvenstube ist ganz aus Arvenholz, wie im Engadin, mit einem Kachelofen und einem langen Tisch für bis zu zwölf Gäste, nur für Sie. Für bis zu 34 Gäste gehört Ihnen der ganze Kontorsaal mit den hohen Fenstern zum Fleet. Das Menü stellen wir mit Ihnen zusammen.',
    ae: 'Yes. The Arvenstube is panelled entirely in Swiss stone pine, like a parlour in the Engadine, with a tiled stove and one long table for up to twelve guests, just for you. For up to 34 guests, the whole Kontor hall with its tall windows onto the canal is yours. We put the menu together with you.' },
  { id: 'q11', w: 'absage', s: /absag|storn|cancel|verschieb|kosten.*absage/i,
    de: 'Kann ich kostenlos absagen?', en: 'Can I cancel free of charge?',
    a: 'Bis 48 Stunden vor dem Abend sagen Sie kostenfrei ab. Danach berechnen wir das Menü.',
    ae: 'You can cancel free of charge up to 48 hours before the evening. After that we charge for the menu.' },
  { id: 'q12', w: 'kinder', s: /kind|baby|familie|child|kids|family/i,
    de: 'Sind Kinder willkommen?', en: 'Are children welcome?',
    a: 'Kinder sind bei uns willkommen. Für sie gibt es auf Wunsch eine kleine Karte.',
    ae: 'Children are welcome. On request there is a small menu for them.' },
  { id: 'q13', w: 'wein', s: /wein|wine|chasselas|riesling|begleitung|pairing/i,
    de: 'Was ist in der Weinbegleitung?', en: 'What is in the wine pairing?',
    a: 'Die Weinbegleitung kommt aus der Schweiz und aus Deutschland: Chasselas aus der Waadt neben Riesling von der Mosel. Sie kostet 98 €.',
    ae: 'The wine pairing comes from Switzerland and Germany: Chasselas from Vaud alongside Riesling from the Moselle. It is 98 €.' },
  { id: 'q14', w: 'ruhetag', s: /sonntag|montag|ruhetag|sunday|monday|closed/i,
    de: 'Haben Sie am Sonntag geöffnet?', en: 'Are you open on Sunday?',
    a: 'Sonntag und Montag ist bei uns Ruhetag. Dienstag bis Samstag decken wir ab 18.30 Uhr für Sie ein.',
    ae: 'Sunday and Monday we are closed. Tuesday to Saturday we set the tables for you from 6.30 pm.' },
  { id: 'q15', w: 'herkunft', s: /woher|herkunft|regional|schweiz|swiss|alp|nordsee|zutaten|ingredients/i,
    de: 'Woher kommen Ihre Zutaten?', en: 'Where do your ingredients come from?',
    a: 'Aus den Bergen und von der Küste. Aus den Bergen: Alpkäse aus Graubünden, Bündner Gerste, Nüsse und Mehl aus dem Engadin, Weine aus der Waadt und dem Wallis. Von der Küste: Steinbutt aus der Nordsee, Saibling aus der Ostsee, Aal aus der Elbe, Gemüse aus den Vierlanden vor der Stadt.',
    ae: 'From the mountains and from the coast. From the mountains: alpine cheese from Graubünden, barley from Graubünden, nuts and flour from the Engadine, wines from Vaud and Valais. From the coast: turbot from the North Sea, char from the Baltic, eel from the Elbe, vegetables from the Vierlande just outside the city.' }
];

/* Weitere Antworten, nur über Stichworte erreichbar (nicht zum Antippen). */
WINDE.STICHWORTE = [
  { w: 'restaurant', s: /adresse|wo sind|wo liegt|pickhuben|address|where are/i,
    a: 'Sie finden uns am Pickhuben 6, 20457 Hamburg, im ersten Stock eines Kontors in der Speicherstadt.',
    ae: 'You will find us at Pickhuben 6, 20457 Hamburg, on the first floor of a Kontor building in the Speicherstadt.' },
  { w: 'restaurant', s: /telefon|anrufen|nummer|mail|phone|call/i,
    a: 'Sie erreichen uns unter 040 3290 1180 oder per Mail an tisch@maloja-hamburg.de.',
    ae: 'You can reach us on 040 3290 1180 or by email at tisch@maloja-hamburg.de.' },
  { w: 'menue', s: /fünf gänge|5 gänge|kürzer|five courses/i,
    a: 'Das Menü gibt es auch mit fünf Gängen für 138 €: Brot und Butter, Gerstensuppe, Steinbutt, Kalb Zürcher Art und Engadiner Nusstorte.',
    ae: 'The menu is also available with five courses for 138 €: bread and butter, barley soup, turbot, veal Zurich style and Engadine walnut tart.' },
  { w: 'restaurant', s: /fenster|fleet|aussicht|blick|view|window/i,
    a: 'Der Kontorsaal hat hohe Fenster zum Fleet, nur 34 Plätze, jeder mit Blick auf die Speicherstadt. Einen Tisch direkt am Fenster wünschen Sie sich am besten bei der Reservierung.',
    ae: 'The Kontor hall has tall windows onto the canal and only 34 seats, each with a view of the Speicherstadt. Ask for a table right by the window when you book.' },
  { w: 'menue', s: /käse|kaese|cheese/i,
    a: 'Zum Menü gehört der Käse vom Wagen: Alpkäse aus Graubünden mit Feigensenf.',
    ae: 'The menu includes cheese from the trolley: alpine cheese from Graubünden with fig mustard.' }
];

WINDE.CHAT = {
  gruss: 'Guten Abend. Ich bin der Chat von Maloja am Pickhuben. Fragen Sie mich nach dem Menü, einem Tisch, der Arvenstube oder dem Weg zu uns. Für alles andere ist Lena Hartmann da.',
  gruss_en: 'Good evening. I am the chat of Maloja at Pickhuben. Ask me about the menu, a table, the Arvenstube or how to find us. For everything else, Lena Hartmann is happy to help.',
  weiter: 'Dazu weiss ich nichts Sicheres, und raten möchte ich nicht. Ich gebe Ihre Frage an Lena Hartmann, unsere Gastgeberin. Sie antwortet Ihnen heute noch.',
  weiter_en: 'I do not know enough about that to give you a reliable answer. I will pass your question to Lena Hartmann, our host. She will reply to you today.',
  aus: 'Dazu darf ich gerade nichts sagen. Ich gebe Ihre Frage gern an unsere Gastgeberin weiter, sie hilft Ihnen persönlich.',
  aus_en: 'I cannot answer that at the moment. I will gladly pass your question to our host, who will help you personally.'
};

/* Das wurde gefragt: Beispielfragen der letzten Tage. Zwei mit Absicht ohne Antwort. */
WINDE.GEFRAGT = [
  { id: 'f01', zeit: '2026-11-03T15:58', sprache: 'de', frage: 'Gibt es bei Ihnen einen Dresscode?', ohne: true, bild: 'm-gedeck',
    vorschlag: 'Einen festen Dresscode gibt es nicht. Kommen Sie so, wie Sie einen besonderen Abend verbringen möchten.' },
  { id: 'f02', zeit: '2026-11-03T15:21', sprache: 'de', frage: 'Darf mein Hund mit in die Bar?', q: 'q5', bild: 'm-bar' },
  { id: 'f03', zeit: '2026-11-03T13:47', sprache: 'en', frage: 'Is there a vegetarian menu?', q: 'q6', bild: 'm-souffle' },
  { id: 'f04', zeit: '2026-11-03T12:30', sprache: 'de', frage: 'Haben Sie am Montag offen?', q: 'q14', bild: 'm-aussen' },
  { id: 'f05', zeit: '2026-11-03T10:12', sprache: 'de', frage: 'Können Sie uns nach dem Essen ein Taxi rufen?', ohne: true, bild: 'm-bruecke',
    vorschlag: 'Gern rufen wir Ihnen am Ende des Abends ein Taxi. Sagen Sie es einfach dem Service.' },
  { id: 'f06', zeit: '2026-11-02T22:05', sprache: 'de', frage: 'Ist am Freitag noch ein Tisch für zwei frei?', q: 'q2', bild: 'm-fenster' },
  { id: 'f07', zeit: '2026-11-02T19:40', sprache: 'en', frage: 'Where exactly are you?', k: 0, bild: 'm-fleet' },
  { id: 'f08', zeit: '2026-11-02T17:15', sprache: 'de', frage: 'Was ist in der Weinbegleitung?', q: 'q13', bild: 'm-glas' },
  { id: 'f09', zeit: '2026-11-02T11:02', sprache: 'de', frage: 'Wie komme ich vom Hauptbahnhof zu Ihnen?', q: 'q3', bild: 'm-bruecke' },
  { id: 'f10', zeit: '2026-11-01T20:48', sprache: 'de', frage: 'Was kostet das Menü mit sieben Gängen?', q: 'q4', bild: 'm-steinbutt' },
  { id: 'f11', zeit: '2026-11-01T16:33', sprache: 'en', frage: 'Can we celebrate a birthday in the Arvenstube?', q: 'q10', bild: 'm-stube' },
  { id: 'f12', zeit: '2026-11-01T09:20', sprache: 'de', frage: 'Gibt es einen Tisch direkt am Fenster?', k: 3, bild: 'm-blick' },
  { id: 'f13', zeit: '2026-10-31T18:10', sprache: 'de', frage: 'Woher kommt Ihr Fisch?', q: 'q15', bild: 'm-fisch' },
  { id: 'f14', zeit: '2026-10-31T08:05', sprache: 'de', frage: 'Bis wann kann ich absagen?', q: 'q11', bild: 'm-gedeck' }
];
