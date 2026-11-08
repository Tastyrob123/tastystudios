/* Aus dem Chat des Carlton-Europe übernommen von «Familie Maeder — Vier Häuser/gast_haeuser.py». Nicht hier ändern, sondern in der Vorlage. */
/* Rezeption im Chat — Fenster unten rechts (und als Zimmermappe ganzseitig auf mappe.html).
   Fragt die Funktion /api/gast (Claude mit dem Wissen der Website, siehe _gast/gast.py); fällt sie aus, sucht das Fenster
   die passende Stelle aus «Gut zu wissen» (Hotelinformation A-Z). Die Buchungsmaske kommt, wenn die Funktion sie anfordert,
   und übergibt mit Daten und Gästen an «Zimmer buchen» (SimpleBooking), die Zahlung bleibt dort.
   Wissen und Zimmerkategorien schreibt gast.py hinein, nie von Hand ändern. Bewegung nur über transform und opacity. */
(function () {
  var WISSEN = /*WISSEN*/[]/*ENDE*/;
  var ZIMMER = /*ZIMMER*/[]/*ENDEZ*/;
  /* Das Haus: Name, Kontakt, Gesicht der Rezeption, Buchung, Startkarten. Schreibt gast.py hinein (für jedes Haus der Familie eigen). */
  var HAUS = /*HAUS*/{"fahrplan": true, "knopfart": "schrift", "zeichen": "<svg viewBox=\"0 0 48 30\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M2 28 17 6l7 10 6-7 16 19z\"/><path d=\"m13 12 4 3 3-3\"/></svg>", "datenschutz": "rechtliches.html#ki-assistent", "name": "Berghotel Gasterntal", "tel": "+41 33 675 81 81", "mail": "gasterntal@doldenhorn.ch", "person": "Familie Maeder", "foto": "assets/img/gast-familie.webp", "buchung": "https://www.booking.com/hotel/ch/berghotel-gasterntal.de.html", "art": "booking", "einbetten": false, "bilder": ["assets/img/t-strasse-s.webp", "assets/img/e-plaettli-s.webp", "assets/img/z-doppel-s.webp", "assets/img/tal-blick-s.webp"], "karten": {"de": [["Anreise", "Strasse und Bus ins Tal", "Wie komme ich ins Gasterntal?"], ["Essen", "Stube und Karte", "Was gibt es bei Ihnen zu essen?"], ["Zimmer", "Vom Lager bis zum Doppel", "Welche Zimmer haben Sie?"], ["Saison", "Wann das Haus offen ist", "Wann ist das Berghotel geöffnet?"]]}, "vorM": {"de": ["Sauna reservieren", "Bis wann gibt es warme Küche?", "Wann darf ich hinunterfahren?", "Zimmerreinigung gewünscht", "Wo bekomme ich die Bewilligung fürs Auto?", "Was kann ich heute im Tal unternehmen?"], "en": ["Book the sauna", "Until when are hot meals served?", "When may I drive down?", "Room cleaning, please", "Where do I get the car permit?", "What can I do in the valley today?"], "fr": ["Réserver le sauna", "Repas chauds jusqu’à quelle heure ?", "Quand puis-je descendre ?", "Nettoyage de la chambre", "Où obtenir l’autorisation pour la voiture ?", "Que faire aujourd’hui dans la vallée ?"]}, "hund": null, "grussM": {"de": "Grüezi und herzlich willkommen im Berghotel Gasterntal. Fragen Sie, was Sie brauchen: Sauna, Küche, der Takt an der Chluse, die Bewilligung fürs Auto.", "en": "Welcome to the Berghotel Gasterntal. Ask for whatever you need: sauna, kitchen, the schedule at the Chluse, the car permit.", "fr": "Bienvenue au Berghotel Gasterntal. Demandez ce dont vous avez besoin : sauna, cuisine, l’horaire de la Chluse, l’autorisation pour la voiture."}, "vorBild": ["kaeserei", "stube", "chluse", "z-familie", "haus-profil", "tal-luft"]}/*ENDEH*/;
  var TEL = HAUS.tel;
  var FP = !!HAUS.fahrplan;   // Fassung «Fahrplan» (Robert 18.10.2026): nur die Maeder-Häuser; Salt & Silver baut aus derselben Vorlage ohne
  var MAPPE = !!document.querySelector('[data-mappe]');
  /* Sprache: die der Seite (de/en/fr). In der Zimmermappe die des Handys, weil der Gast dort direkt vom QR-Code kommt. */
  var SP = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase();
  if (MAPPE) { var hl = (navigator.language || 'de').slice(0, 2).toLowerCase(); SP = hl === 'en' || hl === 'fr' ? hl : 'de'; }
  if (['de', 'en', 'fr'].indexOf(SP) < 0) SP = 'en';
  // Wurzel der Website aus der Adresse dieses Skripts: stimmt auf Seiten in Unterordnern (en/, fr/, rezeption/) ebenso
  var BASIS = ((document.querySelector('script[src*="assets/js/gast.js"]') || {}).src || '').replace(/assets\/js\/gast\.js.*$/, '');
  var T = {
    de: { knopf: 'Rezeption', fragen: 'Fragen an die Rezeption', rolle: 'Rezeption · antwortet sofort', neu: 'Neues Gespräch', zu: 'Schliessen', frage: 'Ihre Frage', feld: 'Fragen Sie die Rezeption', feldM: 'Was brauchen Sie?',
      buchen: 'Zimmer buchen', senden: 'Senden', fuss: 'Entwurf von Tasty Studios: Fragen und Antworten werden zur Probe bei Tasty Studios gespeichert, nicht beim Haus. Verbindlich sind Buchung und Rezeption.', datenschutz: 'Datenschutz', start1: 'Wie dürfen wir<br>Ihnen helfen?', start2: 'Fragen Sie alles rund um Ihren Aufenthalt.',
      karten: [['Frühstück', 'Zeiten und Box', 'Bis wann gibt es Frühstück?'], ['Mit Hund', 'Was im Haus gilt', 'Kann ich mit meinem Hund kommen?'], ['Parkplatz', 'Aussen oder Garage', 'Was kostet ein Parkplatz?'], ['Spät ankommen', 'Eingang nach 23 Uhr', 'Wie komme ich nach 23 Uhr ins Haus?']],
      vorM: ['Sauna heizen lassen', 'Zimmerservice bestellen', 'Bis wann gibt es Frühstück?', 'Was unternehme ich heute bei diesem Wetter?', 'Wäsche abgeben', 'Taxi bestellen'],
      grussM: 'Grüezi und herzlich willkommen im ' + HAUS.name + '. Ich bin für Sie da, solange Sie bei uns sind: Sauna, Zimmerservice, Frühstück, Wäsche, Taxi, Ausflüge. Fragen Sie einfach.',
      hallo: 'Grüezi. Womit kann ich Ihnen helfen?', gerne: 'Gerne. Wählen Sie Daten und Zimmer, die Buchung übernimmt den Rest.',
      mKopf: 'Ihre Buchung', mText: 'Daten und Zimmer wählen, die Buchung übernimmt den Rest.', an: 'Anreise', ab: 'Abreise', gaeste: 'Gäste', person: ' Person', personen: ' Personen', hund: 'Mit Hund', kat: 'Zimmerkategorie',
      nacht: ' Nacht', naechte: ' Nächte', bis: ' bis ', mitHund: ' · mit Hund', los: 'Zur Buchung', mFuss: 'Verfügbarkeit und Tagespreis zeigt die Buchungsseite des Hauses, dort zahlen Sie auch.',
      mHund: (HAUS.hund || {}).de || '',
      offen: 'Die Buchungsseite ist in einem neuen Fenster offen.', offenHund: ' Bitte geben Sie dort im Feld für Bemerkungen an, dass Ihr Hund mitkommt, dann bereiten wir alles vor.', offenEnde: ' Wenn ich sonst noch helfen kann, bin ich hier.',
      keine: 'Dazu habe ich gerade keine gesicherte Auskunft. Die Rezeption hilft Ihnen gerne weiter: ' + TEL + ' oder ' + HAUS.mail + '.', quelle: 'Aus der Hotelinformation A–Z · ', ort: 'de-CH', lang: 'DE', bTitel: 'Buchung', bZurueck: 'Zurück zum Gespräch', bFenster: 'In neuem Fenster öffnen', bHinweis: 'Sichere Buchung über das Buchungssystem des Hauses (SimpleBooking).' },
    en: { knopf: 'Reception', fragen: 'Ask reception', rolle: 'Reception · replies instantly', neu: 'New conversation', zu: 'Close', frage: 'Your question', feld: 'Ask reception', feldM: 'What do you need?',
      buchen: 'Book a room', senden: 'Send', fuss: 'Draft by Tasty Studios: questions and answers are stored for testing by Tasty Studios, not by the hotel. Booking and reception are binding.', datenschutz: 'Privacy', start1: 'How may we<br>help you?', start2: 'Ask anything about your stay.',
      karten: [['Breakfast', 'Times and box', 'Until when is breakfast served?'], ['With a dog', 'House rules', 'Can I bring my dog?'], ['Parking', 'Outdoor or garage', 'How much is parking?'], ['Late arrival', 'Entrance after 11 pm', 'How do I get in after 11 pm?']],
      vorM: ['Have the sauna heated', 'Order room service', 'Until when is breakfast served?', 'What can I do today in this weather?', 'Hand in laundry', 'Order a taxi'],
      grussM: 'Welcome to the ' + HAUS.name + '. I am here for you throughout your stay: sauna, room service, breakfast, laundry, taxi, excursions. Just ask.',
      hallo: 'Hello. How can I help you?', gerne: 'Of course. Choose your dates and room, the booking page does the rest.',
      mKopf: 'Your booking', mText: 'Choose dates and room, the booking page does the rest.', an: 'Arrival', ab: 'Departure', gaeste: 'Guests', person: ' guest', personen: ' guests', hund: 'With dog', kat: 'Room category',
      nacht: ' night', naechte: ' nights', bis: ' to ', mitHund: ' · with dog', los: 'Continue to booking', mFuss: 'Availability and the rate of the day are shown on the hotel’s booking page, where you also pay.',
      mHund: (HAUS.hund || {}).en || '',
      offen: 'The booking page has opened in a new window.', offenHund: ' Please mention in the remarks that your dog is coming, so we can prepare everything.', offenEnde: ' If I can help with anything else, I am here.',
      keine: 'I have no confirmed information on that right now. Reception will gladly help: ' + TEL + ' or ' + HAUS.mail + '.', quelle: 'From the hotel information A–Z · ', ort: 'en-GB', lang: 'EN', bTitel: 'Booking', bZurueck: 'Back to the conversation', bFenster: 'Open in a new window', bHinweis: 'Secure booking through the hotel’s booking system (SimpleBooking).' },
    fr: { knopf: 'Réception', fragen: 'Questions à la réception', rolle: 'Réception · répond tout de suite', neu: 'Nouvelle conversation', zu: 'Fermer', frage: 'Votre question', feld: 'Posez votre question', feldM: 'De quoi avez-vous besoin ?',
      buchen: 'Réserver une chambre', senden: 'Envoyer', fuss: 'Ébauche de Tasty Studios : questions et réponses sont enregistrées à titre d’essai par Tasty Studios, pas par l’hôtel. Seules la réservation et la réception font foi.', datenschutz: 'Confidentialité', start1: 'Comment pouvons-nous<br>vous aider ?', start2: 'Posez toutes vos questions sur votre séjour.',
      karten: [['Petit-déjeuner', 'Horaires et box', 'Jusqu’à quelle heure le petit-déjeuner est-il servi ?'], ['Avec un chien', 'Règles de la maison', 'Puis-je venir avec mon chien ?'], ['Parking', 'Extérieur ou garage', 'Combien coûte une place de parc ?'], ['Arrivée tardive', 'Entrée après 23 h', 'Comment entrer après 23 h ?']],
      vorM: ['Faire chauffer le sauna', 'Commander le service en chambre', 'Jusqu’à quelle heure le petit-déjeuner est-il servi ?', 'Que faire aujourd’hui avec ce temps ?', 'Donner du linge à laver', 'Commander un taxi'],
      grussM: 'Bienvenue au ' + HAUS.name + '. Je suis là pour vous pendant tout votre séjour : sauna, service en chambre, petit-déjeuner, linge, taxi, excursions. Demandez simplement.',
      hallo: 'Bonjour. Comment puis-je vous aider ?', gerne: 'Volontiers. Choisissez vos dates et votre chambre, la réservation fait le reste.',
      mKopf: 'Votre réservation', mText: 'Choisissez dates et chambre, la réservation fait le reste.', an: 'Arrivée', ab: 'Départ', gaeste: 'Personnes', person: ' personne', personen: ' personnes', hund: 'Avec chien', kat: 'Catégorie de chambre',
      nacht: ' nuit', naechte: ' nuits', bis: ' au ', mitHund: ' · avec chien', los: 'Vers la réservation', mFuss: 'Disponibilités et tarif du jour figurent sur la page de réservation de l’hôtel, où vous payez aussi.',
      mHund: (HAUS.hund || {}).fr || '',
      offen: 'La page de réservation s’est ouverte dans une nouvelle fenêtre.', offenHund: ' Merci d’indiquer dans les remarques que votre chien vous accompagne, nous préparerons tout.', offenEnde: ' Si je peux encore vous aider, je suis là.',
      keine: 'Je n’ai pas d’information confirmée à ce sujet. La réception vous aide volontiers : ' + TEL + ' ou ' + HAUS.mail + '.', quelle: 'Selon l’information hôtelière A–Z · ', ort: 'fr-CH', lang: 'FR', bTitel: 'Réservation', bZurueck: 'Retour à la conversation', bFenster: 'Ouvrir dans une nouvelle fenêtre', bHinweis: 'Réservation sécurisée via le système de réservation de l’hôtel (SimpleBooking).' }
  }[SP];
  if (HAUS.karten && HAUS.karten[SP]) T.karten = HAUS.karten[SP];
  if (HAUS.vorM && HAUS.vorM[SP]) T.vorM = HAUS.vorM[SP];
  if (HAUS.grussM && HAUS.grussM[SP]) T.grussM = HAUS.grussM[SP];   // Berghotel Gasterntal: eigener Gruss (bau.py mappe_text)
  var VORSCHLAG = MAPPE ? T.vorM : [T.karten[0][2], T.karten[1][2], T.buchen];
  var V = ((document.querySelector('script[src*="gast.js"]') || { src: '' }).src.split('v=')[1] || '');
  var BUCHUNG = document.documentElement.getAttribute('data-buchung') || HAUS.buchung;
  var ZI = (ZIMMER && ZIMMER[SP]) || (ZIMMER && ZIMMER.de) || ZIMMER;

  var css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = BASIS + 'assets/css/gast.css?v=' + V;
  document.head.appendChild(css);

  var CE = HAUS.zeichen || '<svg viewBox="87 0 112 68" aria-hidden="true" fill="currentColor"><use href="#ce"/></svg>';   // Zeichen des Hauses
  var KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var HOCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4"/></svg>';
  var PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>';
  var NEU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z"/></svg>';
  /* Start im leeren Fenster: vier Karten, jede stellt eine Frage */
  // Startkacheln: echte Fotos des Hauses, Titel, Zeile, Frage an die Rezeption. Bildpfade ausgeschrieben, sonst nimmt online.py sie nicht mit
  var BILDER = HAUS.bilder;
  var KARTEN = T.karten.map(function (k, i) { return [k[0], k[1], k[2], BASIS + BILDER[i]]; });

  var knopf = null;
  if (!MAPPE) {
    knopf = document.createElement('button');
    knopf.className = 'gast-knopf' + (FP ? ' gast-knopf--fp' : '') + (FP && HAUS.knopfart === 'rund' ? ' gast-knopf--rund' : ''); knopf.type = 'button';   // rund: Kreis mit Zeichen (Carlton, Doldenhorn), sonst Knopf mit Schrift (Robert 18.10.2026)
    knopf.setAttribute('aria-label', T.fragen); knopf.setAttribute('aria-expanded', 'false');
    knopf.innerHTML = FP ? '<span class="gast-knopf__ce">' + CE + '<em>' + T.knopf + '</em></span><span class="gast-knopf__x">' + KREUZ + '<em>' + T.zu + '</em></span>'
      : '<span class="gast-knopf__ce">' + CE + '</span><span class="gast-knopf__x">' + KREUZ + '</span>';
  }

  var fen = document.createElement('section');
  fen.className = 'gast' + (MAPPE ? ' gast--seite' : '') + (FP ? ' gast--fp' : '') + (FP && HAUS.knopfart === 'rund' ? ' gast--rund' : '');
  fen.setAttribute('role', MAPPE ? 'region' : 'dialog'); fen.setAttribute('aria-label', T.fragen);
  fen.innerHTML =
    (FP ? '<header class="gast__kopf"><span class="gast__ce">' + CE + '</span><div><b>' + HAUS.name + '</b><span>' + HAUS.person + ' · ' + T.rolle.split(' · ').pop() + '</span></div>'
      : '<header class="gast__kopf"><span class="gast__foto"><img src="' + BASIS + HAUS.foto + '" alt="" width="240" height="240" decoding="async"><i aria-hidden="true"></i></span><div><b>' + HAUS.person + '</b><span>' + T.rolle + '</span></div>') +
    '<button type="button" class="gast__neu" aria-label="' + T.neu + '" title="' + T.neu + '">' + NEU + '</button>' +
    (MAPPE ? '' : '<button type="button" class="gast__zu" aria-label="' + T.zu + '">' + KREUZ + '</button>') + '</header>' +
    '<div class="gast__lauf" aria-live="polite"></div>' +
    '<form class="gast__feld"><label><span class="sr">' + T.frage + '</span><textarea rows="1" autocomplete="off" enterkeyhint="send" placeholder="' + (MAPPE ? T.feldM : T.feld) + '"></textarea></label>' +
    '<div class="gast__leiste"><button type="button" class="gast__plus" aria-label="' + T.buchen + '" title="' + T.buchen + '">' + PLUS + '</button>' +
    '<button type="submit" class="gast__send" aria-label="' + T.senden + '">' + HOCH + '</button></div></form>' +
    '<p class="gast__fuss">' + T.fuss + ' <a href="' + BASIS + (HAUS.datenschutz || 'datenschutz.html#ki-assistent') + '">' + T.datenschutz + '</a></p>';

  (document.querySelector('[data-mappe]') || document.body).appendChild(fen);
  if (knopf) {
    var dunkel = document.createElement('div');
    dunkel.className = 'gast-dunkel'; dunkel.setAttribute('aria-hidden', 'true');
    dunkel.addEventListener('click', function () { auf(false); });
    document.body.appendChild(dunkel);
    document.body.appendChild(knopf);
  }
  /* Nichts zeigen, bevor der Stil da ist: gast.css kommt erst mit diesem Skript, das Fenster blitzte sonst beim Seitenaufbau
     ungestylt auf (Robert 10.10.2026). Rückfall nach 4 s, falls das Laden des Stils scheitert. */
  var teile = [fen, knopf, typeof dunkel !== 'undefined' ? dunkel : null].filter(Boolean);
  /* Ohne Stil hat die dunkle Fläche Deckkraft 1; kommt gast.css erst nach dem ersten Bild, würde sie sonst mit ihrem Übergang
     von 1 auf 0 ausblenden: ein dunkles Aufflackern über der ganzen Seite bei jedem Seitenwechsel (Robert 10.10.2026, online gemessen). */
  teile.forEach(function (el) { el.style.visibility = 'hidden'; el.style.transition = 'none'; });
  var dunkelEl = typeof dunkel !== 'undefined' ? dunkel : null;
  if (dunkelEl) dunkelEl.style.opacity = '0';
  var stilDa = false;
  function zeigen() {
    if (stilDa) return; stilDa = true;
    teile.forEach(function (el) { el.style.visibility = ''; void el.offsetWidth; });
    if (dunkelEl) dunkelEl.style.opacity = '';
    teile.forEach(function (el) { void el.offsetWidth; el.style.transition = ''; });
  }
  css.addEventListener('load', zeigen); css.addEventListener('error', zeigen); setTimeout(zeigen, 4000);
  if (css.sheet) zeigen();
  /* Bilder der Startkacheln und das Gesicht vorab holen und entpacken, sobald die Seite ruht (und sofort, wenn die Maus zum Knopf
     kommt): sonst luden sie erst beim Öffnen des Chats (Robert 10.10.2026). */
  var vorab = false;
  function vorladen() {
    if (vorab) return; vorab = true;
    [BASIS + HAUS.foto].concat(KARTEN.map(function (k) { return k[3] + '?v=' + V; })).forEach(function (src) {
      var i = new Image(); i.decoding = 'async'; i.src = src; if (i.decode) i.decode().catch(function () {});
    });
  }
  if (document.readyState === 'complete') setTimeout(vorladen, 800); else addEventListener('load', function () { setTimeout(vorladen, 800); });
  if (knopf) { knopf.addEventListener('pointerenter', vorladen); knopf.addEventListener('focus', vorladen); }
  var lauf = fen.querySelector('.gast__lauf'), feld = fen.querySelector('.gast__feld textarea'), form = fen.querySelector('form');
  var offen = false, begruesst = false, beschaeftigt = false, verlauf = [];

  function auf(an) {
    offen = an;
    document.documentElement.classList.toggle('gast-offen', an);
    if (knopf) knopf.setAttribute('aria-expanded', String(an));
    if (an) {
      if (!begruesst) { begruesst = true; gruss(); }
      if (window.matchMedia('(hover:hover)').matches) setTimeout(function () { feld.focus({ preventScroll: true }); }, 350);
    }
  }
  if (knopf) {
    knopf.addEventListener('click', function () { auf(!offen); });
    fen.querySelector('.gast__zu').addEventListener('click', function () { auf(false); knopf.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) auf(false); });
  } else {
    auf(true);
  }

  function runter() { lauf.scrollTop = lauf.scrollHeight; }
  function blase(wer, text) {
    var b = document.createElement('div');
    b.className = 'gast__b gast__b--' + wer;
    if (text) b.textContent = text;
    lauf.appendChild(b); runter();
    return b;
  }
  function absaetze(b, text) {
    // Antwort in Absätze und Listen: jede Zeile mit «- » wird ein Punkt, aufeinanderfolgende Punkte eine Liste.
    // «Stichwort: Angabe» am Zeilenanfang wird als Stichwort hervorgehoben. Fettdruck-Sterne und Zwischentitel-Sterne fallen weg.
    var ul = null, p = null;
    text.replace(/\*\*/g, '').split('\n').forEach(function (z) {
      z = z.trim();
      if (!z) { ul = null; p = null; return; }
      var punkt = /^[-•*]\s+/.test(z);
      var inhalt = z.replace(/^[-•*]\s+/, '');
      var el;
      if (punkt) {
        if (!ul) { ul = document.createElement('ul'); b.appendChild(ul); }
        p = null; el = document.createElement('li'); ul.appendChild(el);
      } else {
        ul = null;
        if (!p) { p = document.createElement('p'); b.appendChild(p); } else p.appendChild(document.createTextNode(' '));
        el = p;
      }
      var m = punkt && inhalt.match(/^([^:]{2,32}):\s+(.+)$/);
      if (m) { var st = document.createElement('b'); st.textContent = m[1]; el.appendChild(st); el.appendChild(document.createTextNode(' ')); var wert = document.createElement('span'); zeiten(wert, m[2]); el.appendChild(wert);
        if (/^(CHF\s*)?\d[\d.]*(\.–|\.\d{2})?(\s*(bis|–|-)\s*(CHF\s*)?\d[\d.]*(\.–|\.\d{2})?)?$/.test(m[2].trim())) el.className = 'gast__pz'; }   // Gericht und Preis: wie eine Karte
      else if (FP && !punkt && /^[^.!?]{2,40}:$/.test(inhalt)) { p.className = 'gast__zt'; p.appendChild(document.createTextNode(inhalt.slice(0, -1))); p = null; }
      else zeiten(el, inhalt);
    });
    // Eine Liste, in der mindestens die Hälfte der Zeilen Uhrzeiten trägt, wird zur dunklen Tafel
    b.querySelectorAll('ul').forEach(function (u) {
      var li = Array.prototype.slice.call(u.children), z = li.filter(function (x) { return x.querySelector('.gast__zeit'); }).length;
      if (z && z * 2 >= li.length) u.classList.add('gast__tafel');
    });
  }
  // Uhrzeiten (07:00, 8:00 – 22:00) und Beträge (29.00, 15.–) in Schreibmaschinenschrift; der Wortlaut bleibt unverändert
  function zeiten(el, text) {
    text.split(/(\b\d{1,2}:\d{2}(?:\s?[–-]\s?\d{1,2}:\d{2})?\b|\b\d{1,4}\.(?:\d{2}|–)(?![\d.]))/).forEach(function (t, i) {
      if (!t) return;
      if (i % 2) { var z = document.createElement('span'); z.className = /:/.test(t) ? 'gast__zeit' : 'gast__betrag'; z.textContent = t; el.appendChild(z); }
      else el.appendChild(document.createTextNode(t));
    });
  }
  function tippe(b, text, quelle, fertig) {
    // Wort für Wort, aber gleich in der fertigen Form (Absätze, Punkte, Stichworte): vorher lief erst Fliesstext durch
    // und sprang am Ende in die Liste um (Robert 10.10.2026)
    var w = text.split(' '), i = 0;
    (function weiter() {
      i++;
      b.innerHTML = ''; absaetze(b, w.slice(0, i).join(' ')); runter();
      if (i < w.length) return setTimeout(weiter, 14 + Math.random() * 20);
      if (quelle) { var q = document.createElement('small'); q.textContent = quelle; b.appendChild(q); }
      runter(); fertig && fertig();
    })();
  }
  function denkt() {
    var b = blase('haus'); b.classList.add('gast__b--denkt'); b.innerHTML = '<i></i><i></i><i></i>'; return b;
  }
  function vorschlaege(liste) {
    var v = document.createElement('div'); v.className = 'gast__vor';
    var bilder = MAPPE && HAUS.vorBild && HAUS.vorBild.length && liste === VORSCHLAG ? HAUS.vorBild : null;   // Gasterntal: Kacheln mit Foto (bau.py mappe_text)
    if (bilder) v.className += ' gast__vor--kacheln';
    liste.forEach(function (f, i) {
      var k = document.createElement('button'); k.type = 'button';
      k.innerHTML = '<span></span>' + PFEIL; k.firstChild.textContent = f;
      if (bilder && bilder[i]) k.insertAdjacentHTML('afterbegin', '<span class="gast__vk-b"><img src="assets/img/mappe/k-' + bilder[i] + '.webp?v=' + V + '" alt="" width="480" height="320"></span>');
      k.addEventListener('click', function () { v.remove(); frage(f); });
      v.appendChild(k);
    });
    lauf.appendChild(v); runter();
  }
  function start() {
    var st = document.createElement('div'); st.className = 'gast__start';
    st.innerHTML = FP ? '<h3>' + T.hallo + '</h3><div class="gast__karten"></div>' : '<span class="gast__start-ce">' + CE + '</span><h3>' + T.start1 + '</h3><p>' + T.start2 + '</p><div class="gast__karten"></div>';
    KARTEN.forEach(function (k, i) {
      var b = document.createElement('button'); b.type = 'button';
      if (FP && i === 0) b.className = 'gast__k--gross';
      b.innerHTML = '<span class="gast__k-bild"><img src="' + k[3] + '?v=' + V + '" alt="" decoding="async"></span><span class="gast__k-text"><b></b><span></span>' + (FP && i === 0 ? '<em><i></i>' + PFEIL + '</em>' : '') + '</span>';
      b.querySelector('b').textContent = k[0]; b.querySelector('.gast__k-text span').textContent = k[1]; b.setAttribute('aria-label', k[0] + ': ' + k[1]);
      if (FP && i === 0) b.querySelector('em i').textContent = k[2];
      b.addEventListener('click', function () { frage(k[2]); });
      st.lastChild.appendChild(b);
    });
    lauf.appendChild(st);
  }
  function gruss() {
    if (!MAPPE) return start();
    beschaeftigt = true;
    var b = denkt();
    setTimeout(function () {
      b.classList.remove('gast__b--denkt'); b.innerHTML = '';
      var t = T.grussM;
      tippe(b, t, '', function () { beschaeftigt = false; vorschlaege(VORSCHLAG); });
    }, 500);
  }

  /* ---- Rückfall ohne Funktion: die passende Stelle aus «Gut zu wissen» ---- */
  function norm(s) { return s.toLowerCase().replace(/[^a-zäöüéèà0-9\- ]/g, ' '); }
  function finde(f) {
    var n = ' ' + norm(f) + ' ', best = null, punkte = 0;
    WISSEN.forEach(function (w) {
      var p = 0;
      w.s.forEach(function (s) { if (n.indexOf(s) > -1) p += s.length > 4 ? 2 : 1; });
      if (n.indexOf(norm(w.t)) > -1) p += 3;
      if (p > punkte) { punkte = p; best = w; }
    });
    return best;
  }

  /* ---- Buchungsmaske im Gespräch ---- */
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function schoen(s) { var d = new Date(s + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString(T.ort, { weekday: 'short', day: 'numeric', month: 'long' }); }
  function maske(m) {
    m = m || {};
    var heute = new Date(), morgen = new Date(heute.getTime() + 864e5);
    var an = m.anreise || iso(morgen), ab = m.abreise || iso(new Date(new Date(an + 'T12:00:00').getTime() + 2 * 864e5));
    if (ab <= an) ab = iso(new Date(new Date(an + 'T12:00:00').getTime() + 864e5));
    var g = Math.min(4, Math.max(1, +m.gaeste || 2)), hund = !!m.hund, kat = m.kategorie || '';
    var k = document.createElement('div'); k.className = 'gast__maske';
    k.innerHTML =
      '<div class="gast__m-kopf"><b>' + T.mKopf + '</b><span>' + T.mText + '</span></div>' +
      '<div class="gast__m-zeile">' +
        '<label><span>' + T.an + '</span><input type="date" name="an" min="' + iso(heute) + '" value="' + an + '"></label>' +
        '<label><span>' + T.ab + '</span><input type="date" name="ab" min="' + iso(morgen) + '" value="' + ab + '"></label>' +
        '<label><span>' + T.gaeste + '</span><select name="g">' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + (n === g ? ' selected' : '') + '>' + n + (n === 1 ? T.person : T.personen) + '</option>'; }).join('') + '</select></label>' +
        '<label class="gast__m-hund"><input type="checkbox" name="hund"' + (hund ? ' checked' : '') + '><span>' + T.hund + '</span></label>' +
      '</div>' +
      '<div class="gast__m-zimmer" role="group" aria-label="' + T.kat + '">' +
        ZI.map(function (z) {
          return '<button type="button" class="gast__m-z" data-k="' + z.k + '" aria-pressed="' + (z.k === kat) + '">' +
            '<img src="' + BASIS + 'assets/img/' + z.bild + '-s.webp" alt="' + z.alt.replace(/"/g, '&quot;') + '" decoding="async">' +
            '<span><b>' + z.name + '</b><i>' + z.klein + '</i><em>' + z.text + '</em>' + (z.preis ? '<u>' + z.preis + '</u>' : '') + '</span></button>';
        }).join('') +
      '</div>' +
      '<div class="gast__m-fuss"><span class="gast__m-summe"></span><button type="button" class="kn gast__m-los">' + T.los + '<i>' + PFEIL + '</i></button></div>' +
      '<small>' + T.mFuss + ' ' + (hund ? T.mHund : '') + '</small>';
    lauf.appendChild(k);
    var fan = k.querySelector('[name=an]'), fab = k.querySelector('[name=ab]'), fg = k.querySelector('[name=g]'), fh = k.querySelector('[name=hund]'), summe = k.querySelector('.gast__m-summe');
    var zs = Array.prototype.slice.call(k.querySelectorAll('.gast__m-z'));
    function gewaehlt() { var z = zs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0]; return z ? z.getAttribute('data-k') : ''; }
    function zeige() {
      var n = Math.round((new Date(fab.value) - new Date(fan.value)) / 864e5);
      var z = ZI.filter(function (x) { return x.k === gewaehlt(); })[0];
      summe.textContent = (n > 0 ? n + (n === 1 ? T.nacht : T.naechte) + ' · ' : '') + schoen(fan.value) + T.bis + schoen(fab.value) + ' · ' + fg.value + (fg.value === '1' ? T.person : T.personen) + (fh.checked ? T.mitHund : '') + (z ? ' · ' + z.name : '');
    }
    fan.addEventListener('change', function () { var t = new Date(fan.value); if (isNaN(t)) return; var n = iso(new Date(t.getTime() + 864e5)); fab.min = n; if (fab.value <= fan.value) fab.value = n; zeige(); });
    [fab, fg, fh].forEach(function (x) { x.addEventListener('change', zeige); });
    zs.forEach(function (b) { b.addEventListener('click', function () { var war = b.getAttribute('aria-pressed') === 'true'; zs.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); if (!war) b.setAttribute('aria-pressed', 'true'); zeige(); }); });
    k.querySelector('.gast__m-los').addEventListener('click', function () {
      var z = ZI.filter(function (x) { return x.k === gewaehlt(); })[0];
      var gl = []; for (var i = 0; i < +fg.value; i++) gl.push('A');
      var ziel = (z && z.ziel) || BUCHUNG;
      var adr = HAUS.art === 'booking'
        ? ziel + '?checkin=' + fan.value + '&checkout=' + fab.value + '&group_adults=' + fg.value + '&group_children=0&no_rooms=1&lang=' + T.lang.toLowerCase()
        : ziel + '?lang=' + T.lang + '&cur=CHF&in=' + fan.value + '&out=' + fab.value + '&guests=' + encodeURIComponent(gl.join(','));
      var t;
      if (HAUS.einbetten === false) {   // dieses Buchungssystem lässt sich nicht einbetten: neues Fenster
        window.open(adr, '_blank', 'noopener');
        t = T.offen + (fh.checked ? T.offenHund : '') + T.offenEnde;
      } else {
        buchung(adr);
        t = (fh.checked ? T.offenHund.trim() + ' ' : '') + T.offenEnde.trim();
      }
      verlauf.push({ role: 'assistant', content: t });
      var b = blase('haus'); absaetze(b, t); runter();
    });
    zeige();
    fen.classList.add('gast--breit');
    // Die Maske kommt oben ins Bild, nicht ihr Ende: der Lauf fährt auf ihren Anfang
    setTimeout(function () { lauf.scrollTo({ top: Math.max(0, lauf.scrollTop + k.getBoundingClientRect().top - lauf.getBoundingClientRect().top - 12), behavior: 'smooth' }); }, 60);
  }

  /* ---- Buchung im grossen Fenster: das Buchungssystem des Hauses (SimpleBooking) mit Daten und Gästen, ohne die Seite zu verlassen.
     Bleibt es leer (Browser sperrt eingebettete Seiten), steht oben der Weg in ein neues Fenster. */
  var bf = null;
  function buchung(adr) {
    if (!bf) {
      bf = document.createElement('div');
      bf.className = 'gast-buchung'; bf.setAttribute('role', 'dialog'); bf.setAttribute('aria-label', T.bTitel);
      bf.innerHTML = '<div class="gast-buchung__rahmen"><header class="gast-buchung__kopf"><span class="gast__foto"><img src="' + BASIS + HAUS.foto + '" alt="" width="240" height="240"><i aria-hidden="true"></i></span>' +
        '<div><b>' + T.bTitel + '</b><span>' + T.bHinweis + '</span></div>' +
        '<a class="gast-buchung__neu" target="_blank" rel="noopener">' + T.bFenster + '</a><button type="button" class="kn kn--klein gast-buchung__zu">' + T.bZurueck + '</button></header>' +
        '<div class="gast-buchung__buehne"><div class="gast-buchung__lade"><i></i><i></i><i></i></div><iframe title="' + T.bTitel + '" allow="payment"></iframe></div></div>';
      document.body.appendChild(bf);
      bf.querySelector('.gast-buchung__zu').addEventListener('click', function () { zu(); });
      bf.addEventListener('click', function (e) { if (e.target === bf) zu(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.documentElement.classList.contains('gast-bucht')) zu(); });
      bf.querySelector('iframe').addEventListener('load', function () { bf.classList.add('geladen'); });
    }
    function zu() { document.documentElement.classList.remove('gast-bucht'); setTimeout(function () { feld.focus({ preventScroll: true }); }, 300); }
    bf.classList.remove('geladen');
    bf.querySelector('.gast-buchung__neu').href = adr;
    bf.querySelector('iframe').src = adr;
    requestAnimationFrame(function () { document.documentElement.classList.add('gast-bucht'); });
  }

  function frage(f) {
    if (beschaeftigt || !f.trim()) return;
    var alt = lauf.querySelector('.gast__vor'); if (alt) alt.remove();
    var st = lauf.querySelector('.gast__start'); if (st) st.remove();
    blase('gast', f.trim());
    if (/^\s*(hallo|hi|hey|grüezi|gruezi|guten (tag|morgen|abend)|servus)[\s!.]*$/i.test(f)) {
      beschaeftigt = true; var b0 = denkt();
      return setTimeout(function () { b0.classList.remove('gast__b--denkt'); b0.innerHTML = ''; tippe(b0, T.hallo, '', function () { beschaeftigt = false; }); }, 500);
    }
    verlauf.push({ role: 'user', content: f.trim() });
    beschaeftigt = true;
    var b = denkt();
    function zeige(text, quelle, m) {
      b.classList.remove('gast__b--denkt'); b.innerHTML = '';
      tippe(b, text, quelle, function () { beschaeftigt = false; if (m) maske(m); });
    }
    fetch(BASIS + 'api/gast', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: verlauf.slice(-12), mappe: MAPPE, sprache: SP, heute: iso(new Date()) }) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (a) {
        if (!a || !a.text) throw 0;
        verlauf.push({ role: 'assistant', content: a.text });
        zeige(a.text, '', a.maske);
      })
      .catch(function () {
        if (/(buchen|reservier|frei|verfügbar|book|reserv|availab|libre|disponib)/i.test(f) && !/park|garage|tisch|table/i.test(f)) {
          var t0 = T.gerne;
          verlauf.push({ role: 'assistant', content: t0 });
          return zeige(t0, '', {});
        }
        var w = finde(f);
        if (SP !== 'de') w = null;   // der Rückfall kennt nur den deutschen Wortlaut
        var t = w ? w.a : T.keine;
        verlauf.push({ role: 'assistant', content: t });
        zeige(t, w ? T.quelle + w.t : '');
      });
  }
  fen.querySelector('.gast__neu').addEventListener('click', function () {
    if (beschaeftigt) return;
    verlauf = []; lauf.innerHTML = ''; fen.classList.remove('gast--breit'); gruss(); feld.focus({ preventScroll: true });
  });
  fen.querySelector('.gast__plus').addEventListener('click', function () {
    if (beschaeftigt) return;
    var st = lauf.querySelector('.gast__start'); if (st) st.remove();
    var alt = lauf.querySelector('.gast__vor'); if (alt) alt.remove();
    var t = T.gerne;
    verlauf.push({ role: 'assistant', content: t });
    var b = blase('haus'); absaetze(b, t); maske({});
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = feld.value; feld.value = ''; hoehe();
    frage(f);
  });
  /* Chatfeld (Robert 15.10.2026): am rechten Rand bricht die Zeile um und das Feld wächst mit, bis fünf Zeilen. Enter sendet, Umschalt+Enter macht eine neue Zeile. */
  function hoehe() { feld.style.height = 'auto'; if (feld.value) feld.style.height = Math.min(feld.scrollHeight, 132) + 'px'; else feld.style.height = ''; }
  feld.addEventListener('input', hoehe);
  feld.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
  });
})();
