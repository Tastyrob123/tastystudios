/* Carlton-Europe — Gäste-Funktionen (Tasty Studios, 10.10.2026)
   Zimmer-Finder mit Live-Preis im Buchen-Fenster · Wetter mit Tagesvorschlag · Anfrage-Rechner mit Offerte · Gutschein online ·
   Vor Ihrer Anreise · Zahlen fürs Haus · Sprache merken. Preise kommen aus /api/dienste (Buchungssystem des Hauses), nichts geschätzt.
   Fällt ein Dienst aus, bleibt der bisherige Weg: Buchen öffnet Simplebooking, Formulare gehen wie gehabt an das Haus. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var SP = (doc.lang || 'de').slice(0, 2), WURZEL = SP === 'de' ? '' : '../', PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var DATEN = {}; try { DATEN = JSON.parse(($('#dn-daten') || {}).textContent || '{}'); } catch (e) {}
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var zahl = function (s) { var m = String(s || '').replace(/[’']/g, '').match(/\d+(?:[.,]\d+)?/); return m ? parseFloat(m[0].replace(',', '.')) : null; };
  var chf = function (n, nachkomma) {
    var r = Math.round(n * 100) / 100, ganz = Math.floor(r), rest = Math.round((r - ganz) * 100);
    var t = String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return (nachkomma || rest) ? t + '.' + (rest < 10 ? '0' : '') + rest : t;
  };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var tageZw = function (a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); };

  var T = {
    de: {
      classicOhne: 'Gemütlich und dezent: Jedes Zimmer ist anders und keines vergleichbar.', beispielAlles: 'Beispiel mit erfundenen Zahlen, keine echten Preise. So erscheint der Vergleich, sobald das Buchungssystem des Hauses die Preise für Ihre Daten und die der Portale liefert.',
      preisZeigen: 'Preis und buchen', ohnePreis: 'Den Preis für genau diese Daten zeigt Ihnen unser Buchungssystem. Diese Zimmer sind für Ihre Reise gemacht:', auch: 'Ebenfalls für Sie',
      weniger: 'CHF # günstiger',
      wTitel: 'Wetter in Interlaken für Ihre Tage', wVorhersage: 'Mit Zeichen: Vorhersage.', wMittel: function (j) { return 'Mit Ø: gemessenes Mittel dieser Tage ' + j + ', Messstation Interlaken der MeteoSchweiz, keine Vorhersage.'; },
      mitwem: 'Mit wem? Gäste ab 16 Jahren', allein: 'Allein', zwei: 'Zu zweit', drei: 'Zu dritt', vier: 'Zu viert', hund: 'Kommt ein Hund mit?', nein: 'Nein', ja: 'Ja',
      zeigen: 'Zimmer und Preise zeigen', laedt: 'Einen Moment, wir fragen die freien Zimmer ab.', zurueck: 'Andere Daten', naechte: function (n) { return n === 1 ? 'eine Nacht' : n + ' Nächte'; },
      gaeste: function (g) { return g === 1 ? '1 Person' : g + ' Personen'; }, passt: 'Passt am besten', weitere: 'Ebenfalls frei', buchen: 'Buchen',
      fruehstueck: 'Frühstück inklusive', ohneFr: 'ohne Frühstück', kurtaxe: 'exkl. Kurtaxe', fuer: 'für', keine: 'Für diese Daten zeigt das Buchungssystem kein freies Zimmer. Versuchen Sie andere Daten oder rufen Sie uns an.',
      hundFrei: 'Ihr Hund übernachtet hier kostenlos.', hundPreis: function (p) { return 'Dazu Ihr Hund: CHF ' + p + '.'; }, hundRez: 'Hundepreis für diese Kategorie an der Rezeption.',
      bsp: { rate: 'Classic · 24./25. Oktober 2026', bed: 'Gleiches Zimmer, gleiche Nacht, zwei Personen, beide mit Frühstück. Booking.com: alles inbegriffen, teilweise erstattbar. Direkt: CHF 210 und CHF 7 Kurtaxe, kostenlos stornierbar bis 21. Oktober. Abgerufen am 16. und 18. Oktober 2026.', satz: 'Ein Beispiel am Carlton-Europe, nicht der Preis für Ihre Daten. So erscheint der Vergleich für Ihre Daten, sobald das Buchungssystem die Preise der Portale liefert.' },   // Oberchef 18.10. nach Robert 19:00: dieselben Werte wie die Werkbank
      direkt: 'Direkt bei uns', portal: 'Auf Portalen', vergleich: 'Preisvergleich für Ihre Daten', ab: 'ab', beispiel: 'Beispielwerte', bedingung: 'Verglichen wird dasselbe Zimmer für dieselben Daten, mit Frühstück, Steuern und Kurtaxe und derselben Stornierung.',
      beispielSatz: 'So erscheint der Vergleich, sobald das Haus ihn im Buchungssystem einschaltet. Dann stehen hier die echten Preise der Portale für genau Ihre Daten.',
      sparen: function (x) { return 'Direkt gebucht sparen Sie bis zu <b>CHF ' + x + '</b>.'; },
      grund: { einzel: 'Für eine Person, im Classic-Stil.', classic: 'Das günstigste Zimmer für Ihre Daten.', superior: 'Grösser, teilweise mit Balkon. Das Wellnessdörfli ist inklusive.',
        signature: 'Whirlpool, Kitchenette, Terrasse oder Balkon. Wellnessdörfli inklusive.', dreier: 'Platz für Sie alle in einem Zimmer.', apt2: 'Eigene Küche, separates Schlafzimmer und ein sonniger Sitzplatz: gemacht für länger.',
        apt3: 'Zwei Schlafzimmer und eine eigene Küche: gemacht für länger.', aar: 'Zwei Schlafzimmer, Küche, zwei Bäder und die Dachterrasse über Interlaken.' },
      lang: 'Für längere Aufenthalte empfehlen wir ein Apartment mit eigener Küche.', guenstigerHund: 'Mit Hund insgesamt am günstigsten.',
      namen: { einzel: 'Einzelzimmer', classic: 'Classic-Zimmer', superior: 'Superior-Zimmer', signature: 'Signature-Suite', dreier: 'Superior-Dreibettzimmer', apt2: 'Serviced Apartment, 2 Zimmer', apt3: 'Serviced Apartment, 3 Zimmer', aar: 'Aarmühle-Penthouse-Suite' },
      wmo: ['klar', 'heiter', 'teils bewölkt', 'bedeckt', 'Nebel', 'Niesel', 'Regen', 'Schnee', 'Schauer', 'Schneeschauer', 'Gewitter'],
      jetzt: 'jetzt', heute: 'Heute', regen: 'Niederschlag', sicht: 'Sicht', klar: 'klar', mittel: 'wechselnd', zu: 'zu', laedtW: 'Das Wetter wird geladen.', keinW: 'Das Wetter ist gerade nicht abrufbar. Aktuelle Werte bei MeteoSchweiz.',
      tage: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], tageLang: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      vJoch: ['Klare Sicht', 'auf dem Jungfraujoch.', 'Heute ist es oben fast wolkenlos. Ein Tag für das Top of Europe, mit einer Lunchbox aus unserer Küche im Rucksack.', 'Lunchboxen', 'Fahrplan'],
      vJochTag: function (t) { return ['Am ' + t, 'ist das Joch am klarsten.', 'Planen Sie den Ausflug aufs Top of Europe für diesen Tag. Die Lunchbox bestellen Sie am Vorabend an der Rezeption.', 'Lunchboxen', 'Fahrplan']; },
      vRegen: ['Ein Tag', 'fürs Wellnessdörfli.', 'Draussen regnet es. Im Oberländer Wellnessdörfli ist geöffnet', 'Wellness', 'Wellness'],
      vHarder: function (u) { return ['Abends', 'auf den Harder Kulm.', 'Der Hausberg ist frei. Die Sonne geht heute um ' + u + ' Uhr unter, von oben sehen Sie beide Seen und Eiger, Mönch und Jungfrau.', 'Fahrplan']; },
      vHund: function (u) { return ['Ein Spaziergang', 'mit Aussicht.', 'Trocken genug für eine lange Runde. Auf den Harder Kulm fährt Ihr Hund frei mit, die Sonne geht um ' + u + ' Uhr unter.', 'Fahrplan']; },
      vHundNass: ['Kurze Runde,', 'dann trocknen.', 'Nach dem Regenspaziergang wartet die Hundedusche im eingezäunten Aussenbereich, an der Rezeption gibt es Frotteetücher und Biskuits.', 'Ferien mit Hund'],
      rTitel: { seminar: 'Pauschale', bankett: 'Menü', hochzeit: 'Package' }, rPP: 'pro Person', rGaeste: 'Gäste', rWell: 'Wellnessdörfli', rKlein: 'Raum für Gruppen unter 8 Personen, pro Tag',
      rSaal: function (n, z) { return 'Passender Saal: <b>' + n + '</b>, bis ' + z + ' Personen.'; }, rKeinSaal: 'So viele Gäste fasst kein einzelner Saal. Hansen-Ritschard-Saal und Salon Elisabeth lassen sich verbinden: bis 250 Personen.',
      rAb: function (n) { return 'Buchbar ab ' + n + ' Gästen.'; }, rHoch: 'Zwischen 1. April und 30. September kommt laut Preisliste ein Hochsaisonzuschlag von CHF 75 dazu.', rTaxe: 'Kur- und Beherbergungstaxen exklusive.', rZeit: 'Die Pauschalen gelten von 18 bis 22 Uhr.',
      rOfferte: 'Erster Entwurf', rRicht: 'Richtpreis', rDatum: 'Datum', rOffen: 'noch offen', rStand: 'Stand', rKlausel: 'Erster Entwurf nach den Preislisten des Hauses, keine Offerte und keine Bestätigung. Der endgültige Preis hängt von vielen Dingen ab: Essen und Getränke, Raum und Technik, Dauer, Dekoration und Ihre Wünsche. Die verbindliche Offerte erhalten Sie von unserer Anlassorganisation.',
      rNachricht: 'Gerechnet auf der Website:', anlass: { seminar: 'Seminar', bankett: 'Bankett', hochzeit: 'Hochzeit' },
      gWeiter: 'Weiter zur Zahlung', gZahl: 'Bezahlen', gProbe: 'Probe: In diesem Entwurf wird nichts abgebucht. Mit dem Zahlungsanbieter des Hauses läuft hier die echte Zahlung, und der Gutschein geht von selbst per E-Mail hinaus.',
      gBezahlt: 'Bezahlt.', gNr: 'Gutschein-Nummer', gPdf: 'Gutschein als PDF', gNeu: 'Neuer Gutschein', gZurueck: 'Ändern', gFuer: 'für', gGutschein: 'Gutschein', gWert: 'Wertgutschein', gVon: 'von',
      gFertig: 'Ihr Gutschein ist fertig. Sichern Sie ihn als PDF, drucken Sie ihn aus oder schicken Sie ihn weiter.',
      aKissen: 'Kissen', aLunch: 'Lunchboxen', aHund: 'Hund', aTisch: 'Tisch', aKein: 'Noch nichts gewählt.', aKeinHund: 'kein Hund', aFrei: 'kostenlos', aRez: 'Preis an der Rezeption', aAm: 'am', aUm: 'um', aPers: 'Personen'
    },
    en: {
      classicOhne: 'Cosy and understated: every room is different, none is like another.', beispielAlles: 'Example with made-up figures, not real prices. This is how the comparison appears once the hotel’s booking system supplies the prices for your dates and those of the portals.',
      preisZeigen: 'Price and booking', ohnePreis: 'Our booking system shows you the price for exactly these dates. These rooms are made for your trip:', auch: 'Also for you',
      weniger: 'CHF # less',
      wTitel: 'Weather in Interlaken for your days', wVorhersage: 'With symbol: forecast.', wMittel: function (j) { return 'With Ø: measured average for these days ' + j.replace(' bis ', ' to ') + ', MeteoSwiss station Interlaken, not a forecast.'; },
      mitwem: 'Who? Guests aged 16 and over', allein: 'Just me', zwei: 'Two of us', drei: 'Three of us', vier: 'Four of us', hund: 'Bringing a dog?', nein: 'No', ja: 'Yes',
      zeigen: 'Show rooms and prices', laedt: 'One moment, we are checking the free rooms.', zurueck: 'Other dates', naechte: function (n) { return n === 1 ? 'one night' : n + ' nights'; },
      gaeste: function (g) { return g === 1 ? '1 person' : g + ' people'; }, passt: 'Best fit', weitere: 'Also available', buchen: 'Book',
      fruehstueck: 'breakfast included', ohneFr: 'without breakfast', kurtaxe: 'excl. visitor’s tax', fuer: 'for', keine: 'The booking system shows no free room for these dates. Try other dates or give us a call.',
      hundFrei: 'Your dog stays free of charge.', hundPreis: function (p) { return 'Plus your dog: CHF ' + p + '.'; }, hundRez: 'Dog rate for this category at reception.',
      bsp: { rate: 'Classic · 24/25 October 2026', bed: 'Same room, same night, two guests, both with breakfast. Booking.com: all included, partly refundable. Direct: CHF 210 plus CHF 7 tourist tax, free cancellation until 21 October. Retrieved on 16 and 18 October 2026.', satz: 'An example at the Carlton-Europe, not the price for your dates. This is how the comparison appears for your dates once the booking system supplies the portal prices.' },   // Oberchef 18.10. nach Robert 19:00: dieselben Werte wie die Werkbank
      direkt: 'Directly with us', portal: 'On booking portals', vergleich: 'Price comparison for your dates', ab: 'from', beispiel: 'Sample values', bedingung: 'Same room, same dates, with breakfast, taxes and tourist tax, and the same cancellation terms.',
      beispielSatz: 'This is how the comparison appears once the hotel switches it on in its booking system. The real portal prices for exactly your dates will then show here.',
      sparen: function (x) { return 'Booking directly saves you up to <b>CHF ' + x + '</b>.'; },
      grund: { einzel: 'For one person, in Classic style.', classic: 'The best price for your dates.', superior: 'Larger, some with a balcony. The Wellnessdörfli is included.',
        signature: 'Whirlpool, kitchenette, terrace or balcony. Wellnessdörfli included.', dreier: 'Room for all of you in one room.', apt2: 'Your own kitchen, a separate bedroom and a sunny seating area: made for longer stays.',
        apt3: 'Two bedrooms and your own kitchen: made for longer stays.', aar: 'Two bedrooms, kitchen, two bathrooms and the roof terrace above Interlaken.' },
      lang: 'For longer stays we recommend an apartment with its own kitchen.', guenstigerHund: 'With your dog, the best price overall.',
      namen: { einzel: 'Single room', classic: 'Classic room', superior: 'Superior room', signature: 'Signature Suite', dreier: 'Superior triple room', apt2: 'Serviced Apartment, 2 rooms', apt3: 'Serviced Apartment, 3 rooms', aar: 'Aarmühle Penthouse Suite' },
      wmo: ['clear', 'mostly clear', 'partly cloudy', 'overcast', 'fog', 'drizzle', 'rain', 'snow', 'showers', 'snow showers', 'thunderstorm'],
      jetzt: 'now', heute: 'Today', regen: 'Precipitation', sicht: 'View', klar: 'clear', mittel: 'changing', zu: 'cloudy', laedtW: 'Loading the weather.', keinW: 'The weather is not available right now. Current values at MeteoSwiss.',
      tage: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], tageLang: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      vJoch: ['Clear views', 'on the Jungfraujoch.', 'Almost no clouds up there today. A day for the Top of Europe, with a lunch box from our kitchen in your backpack.', 'Lunch boxes', 'Timetable'],
      vJochTag: function (t) { return ['On ' + t, 'the Jungfraujoch is clearest.', 'Plan your trip to the Top of Europe for that day. Order your lunch box at reception the evening before.', 'Lunch boxes', 'Timetable']; },
      vRegen: ['A day', 'for the Wellnessdörfli.', 'It is raining outside. The Oberländer Wellnessdörfli is open', 'Wellness', 'Wellness'],
      vHarder: function (u) { return ['In the evening', 'up to Harder Kulm.', 'Our local mountain is clear. The sun sets at ' + u + ' today; from the top you see both lakes and the Eiger, Mönch and Jungfrau.', 'Timetable']; },
      vHund: function (u) { return ['A walk', 'with a view.', 'Dry enough for a long walk. Your dog rides up Harder Kulm for free, the sun sets at ' + u + '.', 'Timetable']; },
      vHundNass: ['A short walk,', 'then dry off.', 'After a rainy walk, the dog shower waits in the fenced outdoor area, and reception has towels and biscuits.', 'Holidays with your dog'],
      rTitel: { seminar: 'Package', bankett: 'Menu', hochzeit: 'Package' }, rPP: 'per person', rGaeste: 'guests', rWell: 'Wellnessdörfli', rKlein: 'Room for groups under 8 people, per day',
      rSaal: function (n, z) { return 'Suitable room: <b>' + n + '</b>, up to ' + z + ' people.'; }, rKeinSaal: 'No single room holds this many guests. The Hansen-Ritschard-Saal and Salon Elisabeth can be combined: up to 250 people.',
      rAb: function (n) { return 'Bookable from ' + n + ' guests.'; }, rHoch: 'Between 1 April and 30 September, the price list adds a high-season surcharge of CHF 75.', rTaxe: 'Tourist and accommodation taxes not included.', rZeit: 'The packages apply from 6 pm to 10 pm.',
      rOfferte: 'First draft', rRicht: 'Guide price', rDatum: 'Date', rOffen: 'not set', rStand: 'As of', rKlausel: 'First draft based on the hotel’s price lists, not a quote and not a confirmation. The final price depends on many things: food and drinks, room and technology, duration, decoration and your wishes. Our events team will send you the binding quote.',
      rNachricht: 'Calculated on the website:', anlass: { seminar: 'Seminar', bankett: 'Banquet', hochzeit: 'Wedding' },
      gWeiter: 'Continue to payment', gZahl: 'Pay', gProbe: 'Preview: nothing is charged in this draft. With the hotel’s payment provider, the real payment runs here and the voucher is emailed automatically.',
      gBezahlt: 'Paid.', gNr: 'Voucher number', gPdf: 'Voucher as PDF', gNeu: 'New voucher', gZurueck: 'Change', gFuer: 'for', gGutschein: 'Voucher', gWert: 'Gift voucher', gVon: 'from',
      gFertig: 'Your voucher is ready. Save it as a PDF, print it or send it on.',
      aKissen: 'Pillow', aLunch: 'Lunch boxes', aHund: 'Dog', aTisch: 'Table', aKein: 'Nothing chosen yet.', aKeinHund: 'no dog', aFrei: 'free of charge', aRez: 'rate at reception', aAm: 'on', aUm: 'at', aPers: 'people'
    },
    fr: {
      classicOhne: 'Confortable et discrète\u00a0: chaque chambre est différente, aucune ne se compare.', beispielAlles: 'Exemple avec des chiffres inventés, pas de vrais prix. Voici la comparaison dès que le système de réservation de l’hôtel fournit les prix pour vos dates et ceux des portails.',
      preisZeigen: 'Prix et réservation', ohnePreis: 'Notre système de réservation vous indique le prix pour ces dates exactes. Ces chambres sont faites pour votre voyage\u00a0:', auch: 'Aussi pour vous',
      weniger: 'CHF # de moins',
      wTitel: 'La météo à Interlaken pour vos jours', wVorhersage: 'Avec symbole\u00a0: prévision.', wMittel: function (j) { return 'Avec Ø\u00a0: moyenne mesurée de ces jours ' + j.replace(' bis ', ' à ') + ', station MétéoSuisse d’Interlaken, pas une prévision.'; },
      mitwem: 'Avec qui\u00a0? Hôtes dès 16 ans', allein: 'Seul', zwei: 'À deux', drei: 'À trois', vier: 'À quatre', hund: 'Un chien vous accompagne ?', nein: 'Non', ja: 'Oui',
      zeigen: 'Voir chambres et prix', laedt: 'Un instant, nous consultons les chambres libres.', zurueck: 'Autres dates', naechte: function (n) { return n === 1 ? 'une nuit' : n + ' nuits'; },
      gaeste: function (g) { return g === 1 ? '1 personne' : g + ' personnes'; }, passt: 'Le meilleur choix', weitere: 'Également libres', buchen: 'Réserver',
      fruehstueck: 'petit-déjeuner inclus', ohneFr: 'sans petit-déjeuner', kurtaxe: 'taxe de séjour en sus', fuer: 'pour', keine: 'Le système de réservation n’affiche aucune chambre libre pour ces dates. Essayez d’autres dates ou appelez-nous.',
      hundFrei: 'Votre chien dort ici gratuitement.', hundPreis: function (p) { return 'En plus, votre chien : CHF ' + p + '.'; }, hundRez: 'Tarif chien pour cette catégorie à la réception.',
      bsp: { rate: 'Classic · 24/25 octobre 2026', bed: 'Même chambre, même nuit, deux personnes, petit-déjeuner compris des deux côtés. Booking.com : tout compris, partiellement remboursable. En direct : CHF 210 et CHF 7 de taxe de séjour, annulation gratuite jusqu’au 21 octobre. Relevé les 16 et 18 octobre 2026.', satz: 'Un exemple au Carlton-Europe, pas le prix pour vos dates. Voici la comparaison pour vos dates dès que le système de réservation fournit les prix des portails.' },   // Oberchef 18.10. nach Robert 19:00: dieselben Werte wie die Werkbank
      direkt: 'Directement chez nous', portal: 'Sur les portails', vergleich: 'Comparaison des prix pour vos dates', ab: 'dès', beispiel: 'Valeurs d’exemple', bedingung: 'Même chambre, mêmes dates, petit-déjeuner, taxes et taxe de séjour compris, mêmes conditions d’annulation.',
      beispielSatz: 'Voici comment la comparaison s’affiche dès que l’hôtel l’active dans son système de réservation. Les vrais prix des portails pour vos dates figureront alors ici.',
      sparen: function (x) { return 'En réservant directement, vous économisez jusqu’à <b>CHF ' + x + '</b>.'; },
      grund: { einzel: 'Pour une personne, dans le style Classic.', classic: 'La chambre la plus avantageuse pour vos dates.', superior: 'Plus grande, parfois avec balcon. Le Wellnessdörfli est inclus.',
        signature: 'Whirlpool, kitchenette, terrasse ou balcon. Wellnessdörfli inclus.', dreier: 'De la place pour vous tous dans une chambre.', apt2: 'Votre cuisine, une chambre séparée et une place au soleil : pensé pour les longs séjours.',
        apt3: 'Deux chambres et votre propre cuisine : pensé pour les longs séjours.', aar: 'Deux chambres, cuisine, deux salles de bain et le toit-terrasse au-dessus d’Interlaken.' },
      lang: 'Pour un long séjour, nous recommandons un appartement avec cuisine.', guenstigerHund: 'Avec votre chien, le meilleur prix au total.',
      namen: { einzel: 'Chambre simple', classic: 'Chambre Classic', superior: 'Chambre Supérieure', signature: 'Signature Suite', dreier: 'Chambre triple Supérieure', apt2: 'Appartement, 2 pièces', apt3: 'Appartement, 3 pièces', aar: 'Suite Penthouse Aarmühle' },
      wmo: ['dégagé', 'peu nuageux', 'partiellement nuageux', 'couvert', 'brouillard', 'bruine', 'pluie', 'neige', 'averses', 'averses de neige', 'orage'],
      jetzt: 'maintenant', heute: 'Aujourd’hui', regen: 'Précipitations', sicht: 'Vue', klar: 'dégagée', mittel: 'variable', zu: 'bouchée', laedtW: 'Chargement de la météo.', keinW: 'La météo n’est pas disponible pour le moment. Valeurs actuelles chez MétéoSuisse.',
      tage: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'], tageLang: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      vJoch: ['Vue dégagée', 'au Jungfraujoch.', 'Presque aucun nuage là-haut aujourd’hui. Une journée pour le Top of Europe, avec une lunch box de notre cuisine dans le sac.', 'Lunch boxes', 'Horaire'],
      vJochTag: function (t) { return ['Le ' + t, 'le Jungfraujoch est le plus dégagé.', 'Prévoyez l’excursion au Top of Europe ce jour-là. Commandez votre lunch box la veille à la réception.', 'Lunch boxes', 'Horaire']; },
      vRegen: ['Une journée', 'pour le Wellnessdörfli.', 'Il pleut dehors. Le Wellnessdörfli de l’Oberland est ouvert', 'Wellness', 'Wellness'],
      vHarder: function (u) { return ['Le soir', 'au Harder Kulm.', 'Notre montagne est dégagée. Le soleil se couche à ' + u + ' ; d’en haut, vous voyez les deux lacs et l’Eiger, le Mönch et la Jungfrau.', 'Horaire']; },
      vHund: function (u) { return ['Une promenade', 'avec vue.', 'Assez sec pour une longue balade. Votre chien monte gratuitement au Harder Kulm, le soleil se couche à ' + u + '.', 'Horaire']; },
      vHundNass: ['Un petit tour,', 'puis on sèche.', 'Après la promenade sous la pluie, la douche pour chiens attend dans l’espace extérieur clôturé, la réception a des serviettes et des biscuits.', 'Vacances avec chien'],
      rTitel: { seminar: 'Forfait', bankett: 'Menu', hochzeit: 'Forfait' }, rPP: 'par personne', rGaeste: 'invités', rWell: 'Wellnessdörfli', rKlein: 'Salle pour groupes de moins de 8 personnes, par jour',
      rSaal: function (n, z) { return 'Salle adaptée : <b>' + n + '</b>, jusqu’à ' + z + ' personnes.'; }, rKeinSaal: 'Aucune salle seule n’accueille autant d’invités. La salle Hansen-Ritschard et le Salon Elisabeth se combinent : jusqu’à 250 personnes.',
      rAb: function (n) { return 'Réservable dès ' + n + ' invités.'; }, rHoch: 'Du 1er avril au 30 septembre, la liste de prix ajoute un supplément haute saison de CHF 75.', rTaxe: 'Taxes de séjour et d’hébergement en sus.', rZeit: 'Les forfaits s’entendent de 18 h à 22 h.',
      rOfferte: 'Premier projet', rRicht: 'Prix indicatif', rDatum: 'Date', rOffen: 'à définir', rStand: 'État au', rKlausel: 'Premier projet selon les listes de prix de l’hôtel, ni offre ni confirmation. Le prix final dépend de nombreux éléments\u00a0: repas et boissons, salle et technique, durée, décoration et vos souhaits. Notre organisation d’événements vous envoie l’offre ferme.',
      rNachricht: 'Calculé sur le site :', anlass: { seminar: 'Séminaire', bankett: 'Banquet', hochzeit: 'Mariage' },
      gWeiter: 'Continuer vers le paiement', gZahl: 'Payer', gProbe: 'Aperçu : rien n’est débité dans ce projet. Avec le prestataire de paiement de l’hôtel, le vrai paiement se fait ici et le bon part tout seul par e-mail.',
      gBezahlt: 'Payé.', gNr: 'Numéro du bon', gPdf: 'Bon en PDF', gNeu: 'Nouveau bon', gZurueck: 'Modifier', gFuer: 'pour', gGutschein: 'Bon cadeau', gWert: 'Bon de valeur', gVon: 'de',
      gFertig: 'Votre bon est prêt. Enregistrez-le en PDF, imprimez-le ou transférez-le.',
      aKissen: 'Oreiller', aLunch: 'Lunch boxes', aHund: 'Chien', aTisch: 'Table', aKein: 'Rien de choisi pour l’instant.', aKeinHund: 'pas de chien', aFrei: 'gratuit', aRez: 'tarif à la réception', aAm: 'le', aUm: 'à', aPers: 'personnes'
    }
  }[SP] || {};
  var LOC = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH' }[SP] || 'de-CH';

  /* ---------- Sprache: jede Wahl am Schalter merken (der Kopf der Seite leitet nur beim allerersten Besuch um) ---------- */
  try {
    if (!localStorage.getItem('ce-sp')) localStorage.setItem('ce-sp', SP);
    $$('.sprache a[lang]').forEach(function (a) { a.addEventListener('click', function () { try { localStorage.setItem('ce-sp', a.getAttribute('lang')); } catch (e) {} }); });
  } catch (e) {}

  /* ---------- Zahlen fürs Haus: was angeklickt wird, ohne Keks, ohne Adresse, ohne Namen ---------- */
  var LAND = ((navigator.language || '').split('-')[1] || '').toUpperCase().slice(0, 2);
  var SEITE = (location.pathname.split('/').pop() || 'index.html');
  function zaehle(t, mehr) {
    if (navigator.webdriver || !window.fetch) return;       // Prüfläufe zählen nicht mit
    var d = { t: t, s: SEITE, sp: SP, l: LAND };
    for (var k in mehr) d[k] = mehr[k];
    var roh = JSON.stringify(d);
    try { if (navigator.sendBeacon && navigator.sendBeacon(WURZEL + 'api/zahlen', new Blob([roh], { type: 'application/json' }))) return; } catch (e) {}
    try { fetch(WURZEL + 'api/zahlen', { method: 'POST', headers: { 'content-type': 'application/json' }, body: roh, keepalive: true }).catch(function () {}); } catch (e) {}
  }
  zaehle('seite');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-buchen]');
    if (b) zaehle('buchen');
    var a = e.target.closest && e.target.closest('a[href*="angebote.html#"], #pakete [data-paket], .pakete .tab');
    if (a) zaehle('package', { p: (a.getAttribute('href') || '').split('#')[1] || a.textContent.trim().slice(0, 60) });
  }, true);
  document.addEventListener('submit', function (e) { var f = e.target; if (f && f.dataset && f.dataset.formular && (!f.hasAttribute('data-gutschein') || f._dnSchritt === 'senden')) zaehle('formular', { f: f.dataset.formular }); }, true);

  /* ---------- Wetter: Wortlaut je Wettercode und Zeichen (Finder, Wetter-Abschnitte, Vor der Anreise) ---------- */
  var wmo = function (c) { var w = T.wmo; return c === 0 ? w[0] : c === 1 ? w[1] : c === 2 ? w[2] : c === 3 ? w[3] : c < 50 ? w[4] : c < 60 ? w[5] : c < 70 ? w[6] : c < 80 ? w[7] : c < 83 ? w[8] : c < 90 ? w[9] : w[10]; };
  var icon = function (c, tag) {
    var s = '<svg viewBox="0 0 32 32" aria-hidden="true">';
    if (c <= 1) s += tag === 0 ? '<path d="M20 6a10 10 0 1 0 6 16A12 12 0 0 1 20 6Z"/>' : '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';
    else if (c <= 3 || (c >= 45 && c < 50)) s += (c === 2 ? '<circle cx="12" cy="11" r="4.5"/>' : '') + '<path d="M9 25h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 25Z"/>';
    else if ((c >= 71 && c < 80) || c === 85 || c === 86) s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="M11 24v4M16 23v4M21 24v4"/>';
    else s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="m11 23-1.5 4M16 23l-1.5 4M21 23l-1.5 4"/>';
    return s + '</svg>';
  };
  /* Wetter für die Tage des Aufenthalts: bis 15 Tage voraus Vorhersage, sonst gemessenes Mittel der Station Interlaken (10 Jahre), so beschriftet */
  function reiseWetter(an, ab, ziel) {
    if (!ziel || !an || !ab || !window.fetch) return;
    ziel.innerHTML = '';
    fetch(WURZEL + 'api/dienste?was=reisewetter&an=' + an + '&ab=' + ab).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var vh = w.tage.some(function (t) { return t.art === 'vorhersage'; }), mi = w.tage.some(function (t) { return t.art === 'mittel' && t.max != null; });
      var L = w.tage.filter(function (t) { return t.max != null; });
      if (!L.length) return;
      var nassMax = 100;
      var karten = L.map(function (t, i) {
        var d = new Date(t.datum + 'T12:00'), mittel = t.art === 'mittel';
        return '<div class="dn-rw__tag' + (mittel ? ' dn-rw__tag--mittel' : '') + '" style="--i:' + i + '">' +
          '<span class="dn-rw__wt">' + T.tageLang[d.getDay()] + '</span><span class="dn-rw__dt">' + d.getDate() + '.' + (d.getMonth() + 1) + '.</span>' +
          '<span class="dn-rw__ic">' + (mittel ? '<i class="dn-rw__oe">Ø</i>' : icon(t.code, 1)) + '</span>' +
          '<b class="dn-rw__max"><span data-hoch="' + Math.round(t.max) + '">' + Math.round(t.max) + '</span>°</b><span class="dn-rw__min">' + Math.round(t.min) + '°</span>' +
          (t.regen != null ? '<span class="dn-rw__nass" title="' + T.regen + ' ' + t.regen + ' %"><i style="--h:' + Math.max(.04, t.regen / nassMax) + '"></i></span><em>' + T.regen + ' ' + t.regen + ' %</em>' : '') + '</div>';
      }).join('');
      var fuss = (vh ? T.wVorhersage : '') + (vh && mi ? ' ' : '') + (mi ? T.wMittel(w.jahre) : '');
      ziel.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono mono--k">' + T.wTitel + '</span></div><div class="dn-rw__reihe">' + karten + '</div><p class="dn-edel__satz">' + fuss + '</p></div>';
      belebe(ziel);
    }).catch(function () {});
  }

  /* Preisvergleich: Goldbalken wachsen, Preise zählen hoch, ein Siegel nennt die Ersparnis. o = { wir, rate, portale: [{name, chf}], beispiel, satz } */
  function vergleichHTML(o) {
    var alle = [o.wir].concat(o.portale.map(function (p) { return p.chf; })), hoechst = Math.max.apply(null, alle), spar = hoechst - o.wir;
    var zeile = function (name, klein, v, i, wir) {
      var weniger = wir && spar > 0 ? '<span class="dn-pv__weniger">' + T.weniger.replace('#', '<span data-hoch="' + spar + '">' + chf(spar) + '</span>') + '</span>' : '';   // Ersparnis als Zahl beim Direktpreis (Robert 10.10.2026, statt Siegel)
      return '<li class="dn-pv__z' + (wir ? ' dn-pv__z--wir' : '') + '" style="--i:' + i + '"><span class="dn-pv__n">' + esc(name) + (klein ? '<small>' + esc(klein) + '</small>' : '') + '</span>' +
        '<span class="dn-pv__spur"><i style="--w:' + Math.max(.08, v / hoechst).toFixed(3) + '"></i></span><span class="dn-pv__preis"><b>CHF <span data-hoch="' + v + '">' + chf(v) + '</span></b>' + weniger + '</span></li>';
    };
    return '<div class="dn-pv' + (o.beispiel ? ' dn-pv--beispiel' : '') + '" data-anim><div class="dn-edel__kopf"><span class="mono mono--k">' + T.vergleich + '</span>' + (o.beispiel ? '<em>' + T.beispiel + '</em>' : '') + '</div>' +
      '<div class="dn-pv__leib"><ul class="dn-pv__liste">' + zeile(T.direkt, o.rate, o.wir, 0, true) + o.portale.map(function (p, i) { return zeile(p.name, '', p.chf, i + 1, false); }).join('') + '</ul>' +
      '</div>' +
      '<p class="dn-pv__bed">' + esc(o.bed || T.bedingung) + '</p>' +   // Robert 18.10.2026 19:00: «die Buchungsbedingungen müssen wirklich übereinstimmen»
      (o.satz ? '<p class="dn-edel__satz">' + o.satz + '</p>' : '') + '</div>';
  }
  /* Auftritt: erst wenn der Block im Fenster steht, zählen die Zahlen in 1,1 s hoch (nur Text, keine Masse), Bewegung sonst über CSS (transform, opacity) */
  var RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  function belebe(wurzel) {
    $$('[data-anim]', wurzel).forEach(function (el) {
      if (RUHIG) { el.classList.add('dn-los', 'dn-ruhig'); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('dn-los'); }); });
      $$('[data-hoch]', el).forEach(function (z) {
        var ziel = +z.getAttribute('data-hoch'), start = null, i = +((z.closest('[style*="--i"]') || {}).style || { getPropertyValue: function () { return 0; } }).getPropertyValue('--i') || 0;
        var warte = 250 + i * 140, dauer = 1100, schritt = function (t) {
          if (start === null) start = t;
          var p = Math.min(1, Math.max(0, (t - start - warte) / dauer)), e = 1 - Math.pow(1 - p, 3);
          z.textContent = p < 1 ? chf(Math.round(ziel * e)) : chf(ziel);
          if (p < 1) requestAnimationFrame(schritt);
        };
        z.textContent = chf(0); requestAnimationFrame(schritt);
      });
    });
  }

  /* ---------- Zimmer-Finder im Buchen-Fenster: drei Fragen, dann die freien Zimmer mit dem Preis des Hauses ---------- */
  var dlg = $('dialog.buchen');
  if (dlg) (function () {
    var f = $('form', dlg), g = f.elements.gaeste, hundWert = 0;
    var lbl = g.closest('label'); if (lbl) { $('span', lbl).textContent = T.mitwem; }
    [T.allein, T.zwei, T.drei, T.vier].forEach(function (t, i) { if (g.options[i]) g.options[i].textContent = t; });
    var hund = document.createElement('div');
    hund.className = 'feld feld--ganz dn-hundwahl';
    hund.innerHTML = '<span>' + T.hund + '</span><div class="tabs tabs--schalter" role="group" aria-label="' + esc(T.hund) + '"><button class="tab" type="button" aria-pressed="true" data-hw="0">' + T.nein + '</button><button class="tab" type="button" aria-pressed="false" data-hw="1">' + T.ja + '</button></div>';
    $('.felder', f).appendChild(hund);
    function setzeHund(v) { hundWert = v; $$('[data-hw]', hund).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.hw === v)); }); }
    $$('[data-hw]', hund).forEach(function (b) { b.addEventListener('click', function () { setzeHund(+b.dataset.hw); }); });
    var knopf = $('button[type=submit]', f); if (knopf) knopf.firstChild.nodeValue = T.zeigen;
    var raum = document.createElement('div'); raum.className = 'dn-treffer'; raum.hidden = true;
    f.parentNode.insertBefore(raum, f.nextSibling);
    var titelH = $('h2', dlg), titelAlt = titelH ? titelH.innerHTML : '', vorteil = $('.buchen__vorteil', dlg);
    function zurueck() { raum.hidden = true; raum.innerHTML = ''; f.hidden = false; if (vorteil) vorteil.hidden = false; if (titelH) titelH.innerHTML = titelAlt; dlg.classList.remove('dn-breit'); }
    $$('[data-buchen]').forEach(function (b) { b.addEventListener('click', function () { zurueck(); setzeHund(b.hasAttribute('data-hund') ? 1 : 0); }); });

    var BILD = { einzel: 'z-classic-klein', classic: 'z-classic', superior: 'z-superior-2', signature: 'z-signature-253', dreier: 'z-superior', apt2: 'apt-wohnen', apt3: 'apt-kueche', aar: 'dach-bett' };
    var HUND_FREI = { superior: 1, signature: 1 }, HUND_PREIS = { einzel: 1, classic: 1, apt2: 1, apt3: 1 };   // Hunde-Flyer 2025 und Apartment-Preisliste; Dreibettzimmer und Suite nennt keine Unterlage
    function hundKosten(id, n, hunde) {
      if (!hunde) return 0;
      if (HUND_FREI[id]) return 0;
      if (!HUND_PREIS[id]) return null;
      var a = zahl(DATEN['preis.hund_erste']), b = zahl(DATEN['preis.hund_folge']);
      if (a == null || b == null) return null;
      return (a + b * (n - 1)) * hunde;
    }
    function link(an, ab, gz) {
      var gl = []; for (var i = 0; i < gz; i++) gl.push('A');
      return (f.dataset.ziel || doc.getAttribute('data-buchung') || 'https://www.simplebooking.it/ibe2/hotel/4401').split('?')[0] + '?lang=' + SP.toUpperCase() + '&cur=CHF&in=' + an + '&out=' + ab + '&guests=' + encodeURIComponent(gl.join(','));
    }
    function rate(r) { return '<span class="dn-rate"><i>' + esc(r.rate) + '</i><b>CHF ' + chf(r.chf) + '</b></span>'; }
    function karte(z, d, oben, grund) {
      var hk = hundKosten(z.id, d.naechte, hundWert), fr = /Frühstück|breakfast/i.test((z.raten[0] || {}).essen || '');
      var hz = !hundWert ? '' : hk === 0 ? T.hundFrei : hk == null ? T.hundRez : T.hundPreis(chf(hk));
      var bild = BILD[z.id] ? '<img src="' + WURZEL + 'assets/img/' + BILD[z.id] + '-s.webp" alt="" loading="lazy" decoding="async">' : '';
      return '<article class="dn-zi' + (oben ? ' dn-zi--oben' : '') + '">' + (oben ? '<span class="dn-zi__b">' + bild + '</span>' : '') +
        '<div class="dn-zi__t">' + (oben ? '<span class="mono mono--k">' + T.passt + '</span>' : '') + '<h3>' + esc(T.namen[z.id] || z.name) + '</h3>' +
        (grund ? '<p>' + esc(grund) + '</p>' : '') + (hz ? '<p class="dn-zi__hund">' + esc(hz) + '</p>' : '') +
        '<div class="dn-zi__raten">' + z.raten.slice(0, 2).map(rate).join('') + '</div>' +
        '<small>' + T.fuer + ' ' + T.naechte(d.naechte) + ', ' + (fr ? T.fruehstueck : T.ohneFr) + ', ' + T.kurtaxe + '</small></div>' +
        '<a class="kn' + (oben ? '' : ' kn--klein kn--linie') + '" href="' + esc(link(d.an, d.ab, d.gaeste)) + '" target="_blank" rel="noopener" data-zimmer-wahl="' + esc(z.id) + '">' + T.buchen + '<i>' + PFEIL + '</i></a></article>';
    }
    /* Ohne Live-Preis: die Kategorien, die für so viele Gäste gebaut sind (Belegung laut Buchungssystem), mit Hund-Hinweis, dazu Wetter und Buchung */
    var PLATZ = { einzel: 1, classic: 2, superior: 2, signature: 2, apt2: 2, dreier: 4, apt3: 4, aar: 4 };
    /* Preisvergleich nur als Beispiel, wenn das Buchungssystem gerade keinen Preis liefert (Roberts Auftrag: das Haus soll sehen, wie es aussähe).
       Alle Zahlen sind erfunden und stehen ausdrücklich so da. */
    function beispielVergleich(n) {
      return vergleichHTML({ wir: 217, rate: T.bsp.rate, portale: [{ name: 'Booking.com', chf: 269 }], beispiel: true, bed: T.bsp.bed, satz: T.bsp.satz });   // gemessen am Haus, 16. und 18.10.2026
    }
    function ohnePreis(an, ab, gz) {
      var n = Math.max(1, tageZw(an, ab)), d = { an: an, ab: ab, naechte: n, gaeste: gz };
      var L = Object.keys(PLATZ).filter(function (k) { return PLATZ[k] >= gz && (gz > 2 || PLATZ[k] <= 2); });
      var zeile = function (id, oben) {
        var hk = hundKosten(id, n, hundWert), hz = !hundWert ? '' : hk === 0 ? T.hundFrei : hk == null ? T.hundRez : T.hundPreis(chf(hk));
        var bild = oben && BILD[id] ? '<span class="dn-zi__b"><img src="' + WURZEL + 'assets/img/' + BILD[id] + '-s.webp" alt="" loading="lazy" decoding="async"></span>' : '';
        return '<article class="dn-zi' + (oben ? ' dn-zi--oben' : '') + '">' + bild + '<div class="dn-zi__t">' + (oben ? '<span class="mono mono--k">' + T.passt + '</span>' : '') + '<h3>' + esc(T.namen[id]) + '</h3>' +
          ((id === 'classic' ? T.classicOhne : T.grund[id]) ? '<p>' + esc(id === 'classic' ? T.classicOhne : T.grund[id]) + '</p>' : '') + (hz ? '<p class="dn-zi__hund">' + esc(hz) + '</p>' : '') + '</div>' +
          '<a class="kn' + (oben ? '' : ' kn--klein kn--linie') + '" href="' + esc(link(an, ab, gz)) + '" target="_blank" rel="noopener" data-zimmer-wahl="' + id + '">' + T.preisZeigen + '<i>' + PFEIL + '</i></a></article>';
      };
      var best = hundWert && L.indexOf('superior') > -1 ? 'superior' : (n >= 7 && L.indexOf(gz > 2 ? 'apt3' : 'apt2') > -1 ? (gz > 2 ? 'apt3' : 'apt2') : L[0]);
      dlg.classList.add('dn-breit');
      raum.innerHTML = '<p class="dn-treffer__kopf"><span>' + new Date(an).toLocaleDateString(LOC, { day: 'numeric', month: 'short' }) + ' – ' + new Date(ab).toLocaleDateString(LOC, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + T.naechte(n) + ' · ' + T.gaeste(gz) + '</span><button type="button" class="pfeil" data-zurueck>' + T.zurueck + '</button></p>' +
        '<p class="dn-ohnepreis">' + T.ohnePreis + '</p>' + zeile(best, true) + beispielVergleich(n) +
        (L.length > 1 ? '<p class="mono mono--k dn-treffer__mehr">' + T.auch + '</p>' + L.filter(function (k) { return k !== best; }).map(function (k) { return zeile(k, false); }).join('') : '') +
        (vorteil ? '<p class="buchen__vorteil">' + vorteil.innerHTML + '</p>' : '');
      zaehle('finder', { z: best });
      belebe(raum);
    }
    function zeige(d) {
      dlg.classList.add('dn-breit');
      var L = d.zimmer.slice();
      if (!L.length) { raum.innerHTML = '<p class="lauf">' + T.keine + '</p><div class="kn-reihe"><a class="kn" href="tel:+41338260160">+41 33 826 01 60<i>' + PFEIL + '</i></a><button class="kn kn--linie" type="button" data-zurueck>' + T.zurueck + '</button></div>'; return; }
      L.forEach(function (z) { var hk = hundKosten(z.id, d.naechte, hundWert); z._summe = z.ab + (hk || 0); });
      var best = L.slice().sort(function (a, b) { return a._summe - b._summe; })[0], grund = T.grund[best.id] || '';
      var apt = L.filter(function (z) { return /^apt/.test(z.id); })[0];
      if (d.naechte >= 7 && apt) { best = apt; grund = T.lang + ' ' + (T.grund[apt.id] || ''); }
      else if (hundWert && L.length > 1) { var ohne = L.slice().sort(function (a, b) { return a.ab - b.ab; })[0]; if (ohne !== best) grund = T.guenstigerHund + ' ' + grund; }
      var rest = L.filter(function (z) { return z !== best; });
      /* Preisvergleich: echte Portalpreise, wenn das Buchungssystem sie liefert (Rate Match). Sonst Beispielwerte, deutlich als solche beschriftet,
         damit das Haus sieht, wie es aussähe (Roberts Auftrag 10.10.2026). Verglichen wird die Rate mit Best-Preis-Garantie, falls es sie gibt. */
      var wir = best.flexibel || best.ab, echt = !!(d.portale && d.portale.length);
      var rateName = ((best.raten || []).filter(function (r) { return r.chf === wir; })[0] || {}).rate || '';
      var portale = echt ? vergleichHTML({ wir: wir, rate: rateName, portale: d.portale, beispiel: false, satz: '' }) : beispielVergleich(d.naechte);
      raum.innerHTML = '<p class="dn-treffer__kopf"><span>' + new Date(d.an).toLocaleDateString(LOC, { day: 'numeric', month: 'short' }) + ' – ' + new Date(d.ab).toLocaleDateString(LOC, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + T.naechte(d.naechte) + ' · ' + T.gaeste(d.gaeste) + '</span><button type="button" class="pfeil" data-zurueck>' + T.zurueck + '</button></p>' +
        karte(best, d, true, grund) + portale +
        (rest.length ? '<p class="mono mono--k dn-treffer__mehr">' + T.weitere + '</p>' + rest.map(function (z) { return karte(z, d, false, ''); }).join('') : '') +
        (vorteil ? '<p class="buchen__vorteil">' + vorteil.innerHTML + '</p>' : '');
      zaehle('finder', { z: best.id });
      belebe(raum);
    }
    raum.addEventListener('click', function (e) {
      if (e.target.closest('[data-zurueck]')) { zurueck(); return; }
      var w = e.target.closest('[data-zimmer-wahl]'); if (w) zaehle('zimmer', { z: w.getAttribute('data-zimmer-wahl') });
    });
    var durch = false;
    document.addEventListener('submit', function (e) {
      if (e.target !== f || durch || !window.fetch || dlg.classList.contains('buchen--paket')) return;   // Packages: Übergabe in main.js, kein Zimmer-Finder
      e.preventDefault(); e.stopImmediatePropagation();
      var an = f.elements.an.value, ab = f.elements.ab.value, gz = +g.value;
      f.hidden = true; if (vorteil) vorteil.hidden = true; raum.hidden = false;
      if (titelH) titelH.innerHTML = { de: 'Ihr <em>Zimmer.</em>', en: 'Your <em>room.</em>', fr: 'Votre <em>chambre.</em>' }[SP] || '';
      raum.innerHTML = '<p class="dn-warte">' + T.laedt + '</p>';
      fetch(WURZEL + 'api/dienste?was=preise&an=' + an + '&ab=' + ab + '&g=' + gz + '&sp=' + SP.toUpperCase())
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(zeige)
        .catch(function () { ohnePreis(an, ab, gz); });   // Buchungssystem gerade nicht erreichbar: passende Zimmer ohne Preis, Wetter, Weg zur Buchung
    }, true);
  })();

  /* ---------- Wetter mit Tagesvorschlag ---------- */
  var orte = $$('[data-wetter]');
  if (orte.length) {
    var istKlar = function (t) { return t && t.code <= 2 && t.wolken < 35 && t.regen < 40; };   // klar nur, wenn Wetterlage, Bewölkung und Niederschlag es alle sagen
    var sicht = function (t) { return istKlar(t) ? T.klar : (!t || t.code >= 45 || t.wolken >= 70) ? T.zu : T.mittel; };
    var tagName = function (d, lang) { var t = new Date(d + 'T12:00'); return (lang ? T.tageLang : T.tage)[t.getDay()]; };
    var vorschlag = function (titel, satz, knoepfe) {
      return '<span class="dn-vorschlag__z" aria-hidden="true">' + ($('.nav__logo svg') ? $('.nav__logo svg').outerHTML : '') + '</span><div><h3 class="d3">' + titel[0] + ' <em>' + titel[1] + '</em></h3><p class="lauf">' + satz + '</p><div class="kn-reihe">' + knoepfe + '</div></div>';
    };
    var kn = function (t, h, linie, ext) { return '<a class="kn kn--klein' + (linie ? ' kn--linie' : '') + '" href="' + h + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '<i>' + PFEIL + '</i></a>'; };
    var FAHRPLAN = 'https://www.jungfrau.ch/' + (SP === 'de' ? 'de-ch' : SP === 'fr' ? 'fr' : 'en-gb') + '/fahrplan/';
    fetch(WURZEL + 'api/dienste?was=wetter').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var I = w.interlaken, H = w.harder, J = w.joch, ih = I.tage[0], jh = J.tage[0];
      orte.forEach(function (box) {
        var art = box.getAttribute('data-wetter'), feld = $('.dn-wetter__orte', box), vs = $('[data-vorschlag]', box);
        var reise = box.closest('form[data-anreise]');
        if (art === 'tage' && reise && reise.elements.an.value && reise.elements.ab.value) reiseWetter(reise.elements.an.value, reise.elements.ab.value, feld);   // gebuchte Tage
        else if (art === 'tage') {
          feld.innerHTML = '<div class="dn-tage">' + I.tage.map(function (t, i) {
            var j = J.tage[i] || {};
            return '<div class="dn-tag"><span class="mono mono--k">' + (i === 0 ? T.heute : tagName(t.datum)) + '</span>' + icon(t.code, 1) + '<b>' + Math.round(t.max) + '°<small> / ' + Math.round(t.min) + '°</small></b><span>' + esc(wmo(t.code)) + '</span><span class="dn-tag__klein">' + T.regen + ' ' + t.regen + ' %</span><span class="dn-tag__klein">Jungfraujoch: ' + sicht(j) + '</span></div>';
          }).join('') + '</div>';
        } else {
          var orteL = art === 'hund' ? [I, H] : [I, H, J];
          feld.innerHTML = '<div class="dn-orte dn-orte--' + orteL.length + '">' + orteL.map(function (o) {
            var t = o.tage[0];
            return '<div class="dn-ort">' + icon(o.jetzt.code, o.jetzt.tag) + '<div><span class="mono mono--k">' + esc(o.name) + '</span><b>' + Math.round(o.jetzt.temp) + '°</b><span>' + esc(wmo(o.jetzt.code)) + ', ' + T.jetzt + '</span><span class="dn-tag__klein">' + T.heute + ' ' + Math.round(t.min) + '° – ' + Math.round(t.max) + '° · ' + T.regen + ' ' + t.regen + ' %</span></div></div>';
          }).join('') + '</div>';
        }
        // Vorschlag aus dem Angebot des Hauses
        var nass = ih.regen >= 60 || I.jetzt.code >= 51, jochKlar = istKlar(jh) && ih.regen < 50, html = '';
        if (art === 'hund') {
          html = nass ? vorschlag(T.vHundNass, T.vHundNass[2], kn(T.vHundNass[3], WURZEL + 'hunde.html#zimmer-hund', false))
                      : vorschlag(T.vHund(ih.unter), T.vHund(ih.unter)[2], kn(T.vHund(ih.unter)[3], FAHRPLAN, true, true));
        } else if (art === 'tage') {
          var vonR = reise && reise.elements.an.value, bisR = reise && reise.elements.ab.value;   // mit gebuchten Daten: nur Tage des Aufenthalts
          var drin = function (t) { return !vonR || !bisR || (t.datum >= vonR && t.datum <= bisR); };
          var bester = -1; J.tage.forEach(function (t, i) { if (drin(t) && istKlar(t) && (bester < 0 || t.wolken < J.tage[bester].wolken)) bester = i; }); var jb = J.tage[bester];
          if (vonR && bisR && !J.tage.some(drin)) { vs.hidden = true; return; }   // Aufenthalt liegt hinter der Vorhersage: kein Vorschlag
          if (jb) { var tv = T.vJochTag(bester === 0 ? T.heute : tagName(jb.datum, true)); html = vorschlag(tv, tv[2], kn(tv[3], WURZEL + 'aktiv.html#wandern', false) + kn(tv[4], FAHRPLAN, true, true)); }
          else html = vorschlag(T.vRegen, T.vRegen[2] + (SP === 'de' && DATEN['zeit.wellness'] ? ', täglich ' + esc(DATEN['zeit.wellness']) + '.' : '.'), kn(T.vRegen[3], WURZEL + 'wellness.html', false));
        } else if (jochKlar) html = vorschlag(T.vJoch, T.vJoch[2], kn(T.vJoch[3], WURZEL + 'aktiv.html#wandern', false) + kn(T.vJoch[4], FAHRPLAN, true, true));
        else if (nass) html = vorschlag(T.vRegen, T.vRegen[2] + (SP === 'de' && DATEN['zeit.wellness'] ? ', täglich ' + esc(DATEN['zeit.wellness']) + '.' : '.'), kn(T.vRegen[3], WURZEL + 'wellness.html', false));
        else html = vorschlag(T.vHarder(ih.unter), T.vHarder(ih.unter)[2], kn(T.vHarder(ih.unter)[3], FAHRPLAN, true, true));
        vs.innerHTML = html; vs.hidden = false;
      });
    }).catch(function () { orte.forEach(function (box) { $('.dn-wetter__orte', box).innerHTML = '<p class="dn-wetter__warte">' + T.keinW + ' <a href="https://www.meteoschweiz.admin.ch/" target="_blank" rel="noopener">meteoschweiz.admin.ch</a></p>'; }); });
  }

  /* ---------- Drucken: Offerte und Gutschein als PDF (Druckansicht nur mit dem einen Blatt) ---------- */
  function drucke(html) {
    var d = $('#dn-druck') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dn-druck' }));
    d.innerHTML = html; doc.classList.add('dn-druckt');
    var weg = function () { doc.classList.remove('dn-druckt'); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    setTimeout(function () { window.print(); setTimeout(weg, 1500); }, 60);
  }
  var LOGO = function () { var l = $('.fuss__marke > svg'); return l ? l.outerHTML : ''; };

  /* ---------- Anfrage-Rechner (Tagen & Feiern) ---------- */
  $$('[data-rechner]').forEach(function (box) {
    var D; try { D = JSON.parse($('[data-rechner-daten]', box).textContent); } catch (e) { return; }
    var anlass = 'seminar', pers = $('[name=personen]', box), datum = $('[name=datum]', box), wahl = $('[name=wahl]', box), well = $('[name=wellness]', box), stand = null;
    function optionen() {
      var L = D[anlass] || [];
      wahl.innerHTML = L.map(function (x, i) { return '<option value="' + i + '">' + esc(x.name) + ' · CHF ' + chf(x.preis) + (x.ab ? ' · ' + T.rAb(x.ab).replace(/\.$/, '') : '') + '</option>'; }).join('');
      $('[data-wahl-titel]', box).textContent = T.rTitel[anlass];
      $$('[data-nur]', box).forEach(function (el) { el.hidden = el.getAttribute('data-nur') !== anlass; });
    }
    function rechne() {
      var n = Math.max(1, Math.min(250, parseInt(pers.value, 10) || 1)), x = (D[anlass] || [])[+wahl.value] || {}, zeilen = [], summe = 0, hinweise = [];
      summe += x.preis * n; zeilen.push([x.name + ', ' + n + ' × CHF ' + chf(x.preis, true), x.preis * n]);
      if (anlass === 'seminar') {
        if (well.checked && D.wellness) { summe += D.wellness * n; zeilen.push([T.rWell + ', ' + n + ' × CHF ' + chf(D.wellness, true), D.wellness * n]); }
        if (n < D.klein_ab) { summe += D.klein_raum; zeilen.push([T.rKlein, D.klein_raum]); }
        var m = datum.value ? new Date(datum.value).getMonth() : -1;
        if (/relax/i.test(x.name) && m >= 3 && m <= 8) hinweise.push(T.rHoch);
        hinweise.push(T.rTaxe);
      } else {
        if (x.ab && n < x.ab) hinweise.push(T.rAb(x.ab));
        if (anlass === 'hochzeit') hinweise.push(T.rZeit);
      }
      var saele = D.saele.slice().sort(function (a, b) { return a.pers - b.pers; });
      var platz = function (s) { return anlass === 'seminar' ? (s.sitz || s.pers) : (s.rund || s.pers); };   // Seminar: grösste Bestuhlung mit Tischen oder Stühlen, Fest: runde Tische
      var saal = saele.filter(function (s) { return platz(s) >= n; }).sort(function (a, b) { return platz(a) - platz(b); })[0];
      $('[data-summe]', box).textContent = chf(summe);
      $('[data-zeilen]', box).innerHTML = zeilen.map(function (z) { return '<li><span>' + esc(z[0]) + '</span><b>' + chf(z[1], true) + '</b></li>'; }).join('');
      $('[data-saal]', box).innerHTML = saal ? T.rSaal(esc(saal.name), platz(saal)) : T.rKeinSaal;
      $('[data-hinweis]', box).textContent = hinweise.join(' ');
      stand = { n: n, x: x, zeilen: zeilen, summe: summe, saal: saal, platz: saal ? platz(saal) : 0, hinweise: hinweise };
      var setz = function (k, v) { var el = $('[data-k="' + k + '"]', box); if (el) el.value = v; };   // was mit der Anfrage an das Haus geht
      setz('anlass', T.anlass[anlass]); setz('auswahl', x.name || ''); setz('well', anlass === 'seminar' && well.checked ? T.ja : '');
      setz('richt', 'CHF ' + chf(summe, true)); setz('saal', saal ? saal.name : '');
    }
    $$('[data-anlass]', box).forEach(function (b) { b.addEventListener('click', function () { anlass = b.getAttribute('data-anlass'); $$('[data-anlass]', box).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); optionen(); rechne(); }); });
    [pers, datum, wahl, well].forEach(function (el) { el.addEventListener('input', rechne); el.addEventListener('change', rechne); });
    $('[data-offerte]', box).addEventListener('click', function () {
      if (!stand) return;
      var heute = new Date().toLocaleDateString(LOC, { day: 'numeric', month: 'long', year: 'numeric' });
      drucke('<div class="dn-blatt-druck">' + LOGO() + '<p class="dn-d-kl">' + esc(D.haus.adresse) + ' · ' + esc(D.haus.tel) + ' · ' + esc(D.haus.mail) + '</p>' +
        '<h1>' + T.rOfferte + ' <em>' + T.anlass[anlass] + '</em></h1><p class="dn-d-kl">' + T.rStand + ' ' + heute + ' · ' + T.rDatum + ': ' + (datum.value ? new Date(datum.value).toLocaleDateString(LOC, { day: 'numeric', month: 'long', year: 'numeric' }) : T.rOffen) + ' · ' + stand.n + ' ' + T.rGaeste + '</p>' +
        '<table>' + stand.zeilen.map(function (z) { return '<tr><td>' + esc(z[0]) + '</td><td>CHF ' + chf(z[1], true) + '</td></tr>'; }).join('') + '<tr class="dn-d-summe"><td>' + T.rRicht + '</td><td>CHF ' + chf(stand.summe, true) + '</td></tr></table>' +
        (stand.saal ? '<p>' + T.rSaal(esc(stand.saal.name), stand.platz) + '</p>' : '') +
        (stand.hinweise.length ? '<p>' + esc(stand.hinweise.join(' ')) + '</p>' : '') + '<p class="dn-d-kl">' + T.rKlausel + '</p></div>');
    });
    optionen(); rechne();
  });

  /* ---------- Gutschein online: wählen, bezahlen (Probe), als PDF ---------- */
  $$('form[data-gutschein]').forEach(function (fo) {
    var betraege = []; try { betraege = JSON.parse(fo.getAttribute('data-gutschein') || '[]'); } catch (e) {}
    var betrag = $('[data-k="betrag"]', fo), art = $('[data-k="art"]', fo), reihe = $('.dn-betraege', fo);
    if (!betrag || !art || !reihe) return;
    var feld = function (k) { var el = $('[data-k="' + k + '"]', fo); return el ? el.value.trim() : ''; };   // feste Kennungen: data-name wird in en/ und fr/ übersetzt
    reihe.innerHTML = betraege.map(function (b) { return '<button class="opt taste" type="button" aria-pressed="' + (String(b) === betrag.value) + '" data-betrag="' + b + '">CHF ' + chf(b) + '</button>'; }).join('');
    var markiere = function () { $$('[data-betrag]', reihe).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.betrag === betrag.value)); }); };
    reihe.addEventListener('click', function (e) { var b = e.target.closest('[data-betrag]'); if (b) { betrag.value = b.dataset.betrag; markiere(); } });
    betrag.addEventListener('input', markiere);
    var teile = [$('.gutschein__satz', fo), $('.felder', fo), $('.kn-reihe', fo)], schritt = document.createElement('div'); schritt.className = 'dn-gs'; schritt.hidden = true; fo.appendChild(schritt);
    var nr = '';
    function karte() {
      var was = art.selectedIndex === 0 ? T.gWert : art.value;
      return '<div class="dn-gk">' + ($('.nav__logo svg') ? $('.nav__logo svg').outerHTML : '') + '<span class="mono mono--k">' + T.gGutschein + '</span><b class="dn-gk__wert">CHF ' + chf(+betrag.value || 0) + '</b><span class="dn-gk__was">' + esc(was) + '</span>' +
        (feld('fuer') ? '<span class="dn-gk__fuer">' + T.gFuer + ' ' + esc(feld('fuer')) + '</span>' : '') + (feld('widmung') ? '<span class="dn-gk__widmung">«' + esc(feld('widmung')) + '»</span>' : '') +
        (feld('name') ? '<span class="dn-gk__von">' + T.gVon + ' ' + esc(feld('name')) + '</span>' : '') + (nr ? '<span class="dn-gk__nr">' + T.gNr + ' ' + nr + '</span>' : '') + '</div>';
    }
    function zeigeSchritt(html) { teile.forEach(function (t) { if (t) t.hidden = true; }); schritt.hidden = false; schritt.innerHTML = html; }
    function anfang() { nr = ''; teile.forEach(function (t) { if (t) t.hidden = false; }); schritt.hidden = true; schritt.innerHTML = ''; }
    fo.addEventListener('submit', function (e) {
      if (fo._dnSchritt === 'senden') return;            // letzter Schritt: geht über den Weg der Seite an das Haus (Mail oder Eingang)
      e.preventDefault(); e.stopImmediatePropagation();
      zeigeSchritt(karte() + '<p class="dn-gs__satz">' + T.gProbe + '</p><div class="kn-reihe"><button class="kn" type="button" data-zahlen>' + T.gZahl + ' CHF ' + chf(+betrag.value || 0) + '<i>' + PFEIL + '</i></button><button class="kn kn--linie" type="button" data-aendern>' + T.gZurueck + '</button></div>');
    }, true);
    schritt.addEventListener('click', function (e) {
      if (e.target.closest('[data-aendern]') || e.target.closest('[data-neu]')) { if (e.target.closest('[data-neu]')) fo.reset(), markiere(); anfang(); return; }
      if (e.target.closest('[data-zahlen]')) {
        var t = new Date(); nr = 'CE-' + String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        zeigeSchritt('<p class="dn-gs__ok">' + T.gBezahlt + '</p>' + karte() + '<p class="dn-gs__satz">' + T.gFertig + '</p><div class="kn-reihe"><button class="kn" type="button" data-pdf>' + T.gPdf + '<i>' + PFEIL + '</i></button><button class="kn kn--linie" type="button" data-neu>' + T.gNeu + '</button></div>');
        if (doc.getAttribute('data-formulare') === 'eingang') {   // Bestellung an das Haus, nur wenn der Eingang eingeschaltet ist (sonst öffnete sich mitten im Ablauf das Mailprogramm)
          var w = $('[data-k="widmung"]', fo), alt = w.value; w.value = (alt ? alt + ' · ' : '') + T.gNr + ' ' + nr;
          fo._dnSchritt = 'senden'; try { fo.requestSubmit(); } finally { fo._dnSchritt = ''; w.value = alt; }
        }
      }
      if (e.target.closest('[data-pdf]')) drucke('<div class="dn-gutschein-druck">' + karte() + '<p class="dn-d-kl">Carlton-Europe Vintage Adults Hotel · Höheweg 92–94 · 3800 Interlaken · +41 33 826 01 60 · info@carltoneurope.ch</p></div>');
    });
  });

  /* ---------- Vor Ihrer Anreise ---------- */
  $$('[data-zaehler]').forEach(function (z) {
    var inp = $('input', z);
    $$('[data-schritt]', z).forEach(function (b) { b.addEventListener('click', function () { var v = Math.max(+inp.min || 0, Math.min(+inp.max || 99, (+inp.value || 0) + (+b.dataset.schritt))); inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); }); });
  });
  $$('form[data-anreise]').forEach(function (fo) {
    var q = new URLSearchParams(location.search), an = fo.elements.an, ab = fo.elements.ab;
    var heute = new Date(); an.min = iso(heute);
    if (/^\d{4}-\d{2}-\d{2}$/.test(q.get('an') || '')) an.value = q.get('an');
    if (/^\d{4}-\d{2}-\d{2}$/.test(q.get('ab') || '')) ab.value = q.get('ab');
    if (q.get('name') && $('[data-k="name"]', fo)) $('[data-k="name"]', fo).value = q.get('name').slice(0, 80);
    if (q.get('nr') && $('[data-k="nr"]', fo)) $('[data-k="nr"]', fo).value = q.get('nr').slice(0, 40);
    var erste = +fo.getAttribute('data-hund-erste') || 0, folge = +fo.getAttribute('data-hund-folge') || 0;
    function setz(k, v) { var el = $('input[type=hidden][data-k="' + k + '"]', fo); if (el) el.value = v; }
    function neu() {
      var nacht = an.value && ab.value ? Math.max(1, tageZw(an.value, ab.value)) : 1, w = [], extras = 0;
      var k = $('input[name=kissen]:checked', fo); setz('kissen', k ? k.value : ''); if (k) w.push(T.aKissen + ': ' + k.value);
      var lunch = [], tag = fo.elements.lunchtag.value;
      $$('[data-lunch]', fo).forEach(function (z) { var n = +$('input', z).value || 0; z.classList.toggle('dn-lunch--an', n > 0); if (n) { lunch.push(n + ' × ' + z.dataset.lunch); extras += n * (+z.dataset.preis || 0); } });
      var lt = lunch.length ? lunch.join(', ') + (tag ? ' ' + T.aAm + ' ' + new Date(tag).toLocaleDateString(LOC, { weekday: 'short', day: 'numeric', month: 'short' }) : '') : '';
      setz('lunch', lt); if (lt) w.push(T.aLunch + ': ' + lt);
      var hunde = +fo.elements.hunde.value || 0, za = fo.elements.zimmerart.value, hp = null, ht = T.aKeinHund;
      if (hunde) {
        if (za === 'superior' || za === 'signature') { hp = 0; ht = hunde + ' × ' + T.aHund + ', ' + T.aFrei; }
        else if (za === 'aar') { ht = hunde + ' × ' + T.aHund + ', ' + T.aRez; }
        else { hp = (erste + folge * (nacht - 1)) * hunde; ht = hunde + ' × ' + T.aHund + ', ' + T.naechte(nacht) + ', CHF ' + chf(hp, true); extras += hp; }
        w.push(ht);
      }
      $('[data-hundpreis]', fo).textContent = hunde ? (hp === 0 ? T.aFrei : hp == null ? T.aRez : 'CHF ' + chf(hp, true)) : T.aKeinHund;
      setz('hund', hunde ? ht : '');
      var lok = fo.elements.lokal.value, tt = '';
      if (lok) { tt = (fo.elements.tischtag.value ? new Date(fo.elements.tischtag.value).toLocaleDateString(LOC, { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' : '') + (fo.elements.tischzeit.value || '') + ', ' + (fo.elements.tischpers.value || 2) + ' ' + T.aPers; w.push(T.aTisch + ', ' + lok + ': ' + tt); }
      setz('tisch', lok ? lok + ': ' + tt : ''); setz('extras', chf(extras, true));
      $('[data-extras]', fo).textContent = chf(extras, true);
      $('[data-wuensche]', fo).innerHTML = w.length ? w.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') : '<li>' + T.aKein + '</li>';
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    /* Tisch in einem der drei Lokale: Kachel → Fenster → «Tisch vormerken» (Robert 14.10.2026) */
    var rf = $('[data-res-fenster]', fo);
    if (rf && rf.showModal) {
      var lokIn = fo.elements.lokal, tagIn = fo.elements.tischtag, gewaehlt = '';
      if (tagIn) tagIn.min = iso(heute);
      function kacheln() {
        $$('[data-lokal]', fo).forEach(function (k) {
          var an = k.getAttribute('data-lokal') === lokIn.value && lokIn.value, p = $('[data-lokal-wahl]', k);
          k.classList.toggle('dn-lokal--an', !!an);
          if (p) { p.hidden = !an; p.textContent = an ? ($('input[type=hidden][data-k="tisch"]', fo).value.split(': ').slice(1).join(': ')) : ''; }
        });
      }
      $$('[data-res]', fo).forEach(function (b) {
        b.addEventListener('click', function () {
          gewaehlt = b.getAttribute('data-res');
          $('[data-res-name]', rf).textContent = gewaehlt + '.';
          $$('[data-res-bild]', rf).forEach(function (x) { x.hidden = x.getAttribute('data-res-bild') !== gewaehlt; var im = $('img', x); if (!x.hidden && im) im.loading = 'eager'; });
          var tel = b.getAttribute('data-tel') || '', a = $('[data-res-tel]', rf);
          a.textContent = tel; a.href = 'tel:' + tel.replace(/[^0-9+]/g, ''); a.parentNode.hidden = !tel;
          $('[data-res-weg]', rf).hidden = lokIn.value !== gewaehlt;
          if (!tagIn.value && an.value) tagIn.value = an.value, tagIn.dispatchEvent(new Event('change', { bubbles: true }));
          rf.showModal(); document.body.style.overflow = 'hidden';
        });
      });
      function zu() { if (rf.open) rf.close(); }
      rf.addEventListener('close', function () { document.body.style.overflow = ''; });
      $('[data-res-zu]', rf).addEventListener('click', zu);
      rf.addEventListener('click', function (e) { if (e.target === rf) zu(); });
      $('[data-res-ok]', rf).addEventListener('click', function () { lokIn.value = gewaehlt; neu(); kacheln(); zu(); });
      $('[data-res-weg]', rf).addEventListener('click', function () { lokIn.value = ''; neu(); kacheln(); zu(); });
      fo.addEventListener('change', kacheln);
    }
    var wf = $('[data-wetter="tage"] .dn-wetter__orte', fo);
    [an, ab].forEach(function (el) { el.addEventListener('change', function () { if (an.value && ab.value && ab.value > an.value) reiseWetter(an.value, ab.value, wf); }); });
  });
})();
