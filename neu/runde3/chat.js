/* Chat unten rechts (Robert 04.11.2026: «unten rechts mein Logo in so einem kleinen Kreis … ein richtig luxuriöser Chat, so wie beim Rivage,
   mit den häufigen Fragen. Die werden erstmal nur lokal beantwortet mit hinterlegten Antworten»).
   Aufbau wie die Rezeption im Chat des Grand Beau-Rivage (gast.js): Knopf, Fenster mit Kopf, vier Startkarten mit Foto, Antwort Wort für Wort,
   Vorschläge, Eingabefeld. Hier ohne Funktion im Hintergrund: jede Frage wird mit dem Antwortbuch unten beantwortet.
   Antworten nur aus den Texten der Website, nichts dazu erfunden. Bewegt wird nur transform und opacity. */
(function () {
  if (window.top !== window.self || document.querySelector('.fc-knopf')) return;
  var MAIL = 'robert@tasty-studios.de';
  var IMG = '/assets/img/';

  /* ---- Antwortbuch: k = Schlüssel, f = Frage (auf Knöpfen), s = Suchwörter, a = Antwort («- » wird ein Punkt), w = weitere Fragen ---- */
  var BUCH = [
    { k: 'leistung', f: 'Was bekomme ich alles von Ihnen?', s: ['bekomm', 'leistung', 'angebot', 'was macht', 'was bietet', 'alles', 'umfang', 'paket', 'dienstleist', 'partner', 'aus einer hand'],
      a: 'Was ein Hotel sonst bei fünf oder sechs Firmen einkauft, bauen wir als eins:\n- Website: gestaltet und programmiert, mit Ihrer Buchung verbunden.\n- Karten und Unterlagen: Speisekarten, Preislisten, Angebote für Gruppen, druckfertig aus einer Quelle.\n- Gefunden werden: bei Google und bei ChatGPT.\n- Rezeption im Chat: beantwortet Gästefragen zu Zimmern, Karten und Umgebung, sofort.\n- Betreuung: Updates, Server und Sicherheit, jeden Monat geprüft.\n- Social Media: Strategie und Vorlagen im Stil des Hauses, auf Wunsch begleitet.',
      w: ['werkzeuge', 'ablauf', 'preis'] },
    { k: 'werkzeuge', f: 'Kann unser Team die Website selbst pflegen?', s: ['werkzeug', 'selbst', 'pflegen', 'pflege', 'ändern', 'aendern', 'kontrollpanel', 'speisekarte', 'markenbuch', 'besucher', 'drucksachen', 'statistik', 'ohne agentur', 'aktualis'],
      a: 'Ja. Mit sieben Werkzeugen führt Ihr Team Website, Karten, Anfragen und Drucksachen selbst:\n- Kontrollpanel: jeden Morgen der Überblick über das ganze Haus.\n- Website bearbeiten: Texte, Preise, Zeiten und Fotos ändert Ihr Team selbst.\n- Speisekarten: eine Karte eintragen, und sie stimmt überall.\n- Anfragen & Chat: jede Anfrage beantwortet, auch nachts.\n- Markenbuch: Bilder, Logo, Farben und Schriften des Hauses an einem Ort.\n- Drucksachen & Feed: vom Briefpapier bis zum Kofferetikett, alles im Stil des Hauses.\n- Besucher: wer Ihre Seite liest und was zur Buchung führt.\nAusprobieren können Sie alle sieben auf der Seite Werkzeuge.',
      w: ['eigentum', 'chat', 'kontakt'] },
    { k: 'ablauf', f: 'Wie läuft ein Projekt ab?', s: ['ablauf', 'ablaeuft', 'läuft', 'laeuft', 'schritte', 'prozess', 'vorgehen', 'wie arbeitet', 'wie arbeiten', 'start', 'beginn', 'brauchen sie von', 'was brauchen'],
      a: 'In vier Schritten:\n- Verstehen: Gäste, Geschichte, Betrieb und alles, was es digital schon gibt.\n- Entwerfen: um den Charakter des Hauses herum, nicht um unseren. Sie sehen jeden Entwurf als fertige Seite und entscheiden.\n- Verbinden: Inhalte, Karten, KI und Werkzeuge werden ein System.\n- Übergeben: Prüfung, Einarbeitung, Start. Danach ändern Sie selbst.\nVon Ihnen brauchen wir ein Gespräch, das, was schon da ist (Fotos, Karten, Preislisten), und den Zugang zu Ihrer Buchung. Alles Weitere richten wir ein.',
      w: ['preis', 'fotos', 'kontakt'] },
    { k: 'team', f: 'Wer steht hinter Tasty Studios?', s: [' wer ', 'team', 'anna', 'robert', 'gründer', 'gruender', 'hinter', 'erfahrung', 'hamburg', 'über euch', 'ueber euch', 'über sie', 'ueber sie'],
      a: 'Anna Llorens und Robert Reff, ein Studio in Hamburg. Anna kommt aus der Hotellerie, Robert aus der Gastronomie, zusammen 25 Jahre.\nWir haben selbst hinter dem Tresen gestanden und an der Rezeption. Wir wissen, wie sich ein voller Abend anfühlt, eine Anreise um Mitternacht und eine Karte, die morgen neu sein muss.',
      w: ['arbeiten', 'ablauf', 'kontakt'] },
    { k: 'preis', f: 'Was kostet eine Website?', s: ['kost', 'preis', 'budget', 'teuer', 'euro', 'honorar', 'angebot erhalten', 'festpreis', 'monatlich', 'gebühr', 'gebuehr'],
      a: 'Einen Festpreis gibt es nicht, weil wir jede Website eigens für ein Haus bauen und nicht aus einer Vorlage. Was Ihr Haus braucht, besprechen wir in einem ersten Gespräch. Danach erhalten Sie von uns ein Angebot.',
      w: ['kontakt', 'leistung'] },
    { k: 'ki', f: 'Findet ChatGPT dann unser Haus?', s: ['chatgpt', 'gemini', 'ki ', ' ki', 'künstlich', 'kuenstlich', 'google', 'gefunden', 'seo', 'suchmaschine', 'ranking', 'sichtbar'],
      a: 'Gäste fragen heute eine KI, bevor sie buchen. ChatGPT, Gemini und Co. antworten mit dem, was sie über Ihr Haus lesen können.\n- Lesbar statt nur im Bild: Zimmer, Zeiten, Preise und Lage stehen als echter Text auf jeder Seite.\n- Für Maschinen hinterlegt: zusätzlich in der Form, mit der Suchmaschinen und Assistenten arbeiten.\n- Vor dem Start geprüft: Wir fragen ChatGPT nach Ihrem Haus, bevor die Seite online geht.',
      w: ['chat', 'leistung'] },
    { k: 'chat', f: 'Was kann die Rezeption im Chat?', s: ['rezeption', 'chatbot', 'chat', 'gästefragen', 'gaestefragen', 'nachts', 'rund um die uhr', 'assistent'],
      a: 'Sie antwortet Gästen rund um die Uhr aus Ihren eigenen Seiten: zu Zimmern, Karten und Umgebung, sofort. Was offen bleibt, liegt als Entwurf beim Team. So kommen weniger Fragen an der Rezeption an, und der Chat antwortet auch nachts.',
      w: ['werkzeuge', 'ki'] },
    { k: 'betreuung', f: 'Wie geht es nach dem Start weiter?', s: ['betreuung', 'nach dem start', 'danach', 'wartung', 'update', 'server', 'sicherheit', 'hosting', 'support', 'weiter'],
      a: 'Nach der Übergabe führt Ihr Team die Website selbst. Um die Technik kümmern wir uns: Updates, Server und Sicherheit, jeden Monat geprüft.',
      w: ['eigentum', 'werkzeuge'] },
    { k: 'eigentum', f: 'Wem gehört das System?', s: ['gehört', 'gehoert', 'eigentum', 'besitz', 'abhängig', 'abhaengig', 'gebunden'],
      a: 'Nach der Übergabe gehört das System Ihrem Team. Karte, Zimmer, Preise und Zeiten ändern Sie an einer Stelle, ohne Agentur.',
      w: ['betreuung', 'kontakt'] },
    { k: 'fotos', f: 'Brauchen wir neue Fotos?', s: ['foto', 'bild', 'shooting', 'fotograf', 'kamera'],
      a: 'Wir arbeiten mit Ihren Fotos und bearbeiten sie mit KI nach. Die Farben der Website kommen aus genau diesen Fotos.',
      w: ['ablauf', 'social'] },
    { k: 'druck', f: 'Gestalten Sie auch unsere Karten?', s: ['speisekarte', 'karte', 'druck', 'preisliste', 'flyer', 'unterlagen', 'menü', 'menue', 'pdf'],
      a: 'Ja. Speisekarten, Preislisten und Angebote für Gruppen kommen druckfertig aus einer Quelle. Ändert die Küche ein Gericht, ist es auf der Website, der Karte, in der Zimmermappe und im Chat im selben Moment richtig.',
      w: ['werkzeuge', 'leistung'] },
    { k: 'social', f: 'Kümmern Sie sich auch um Social Media?', s: ['social', 'instagram', 'facebook', 'tiktok', 'linkedin', 'beiträge', 'beitraege', 'posts'],
      a: 'Ja: Strategie und Vorlagen im Stil des Hauses, auf Wunsch begleitet.',
      w: ['leistung', 'fotos'] },
    { k: 'restaurant', f: 'Arbeiten Sie auch für Restaurants?', s: ['restaurant', 'gastronomie', 'café', 'cafe', 'bar ', 'bistro', 'gasthof', 'nur hotel'],
      a: 'Ja. Wir bauen Websites für Hotels und Restaurants und die Werkzeuge dahinter.',
      w: ['arbeiten', 'leistung'] },
    { k: 'arbeiten', f: 'Welche Arbeiten kann ich mir ansehen?', s: ['arbeiten', 'referenz', 'beispiel', 'kunden', 'projekte', 'portfolio', 'gemacht'],
      a: 'Auf der Seite Arbeiten: unsere Partner txtme.social, Culinarium, Walk on the Wild Side und Salt & Silver, dazu Designstudien für Hotels und Restaurants.',
      w: ['team', 'kontakt'] },
    { k: 'kontakt', f: 'Wie erreiche ich Sie?', s: ['kontakt', 'erreich', 'termin', 'gespräch', 'gespraech', 'anruf', 'mail', 'schreiben', 'treffen', 'projekt starten', 'anfrage'],
      a: 'Schreiben Sie uns an ' + MAIL + ' und erzählen Sie uns von Ihrem Haus. Wir sehen es uns an, wie ein Gast es sieht, und sagen Ihnen, was eine Website dort leisten kann.',
      w: ['ablauf', 'preis'] }
  ];
  /* Restaurant-Fassung (restaurant.html, Robert 04.11.2026): dieselben Fragen, die Antworten auf ein Restaurant bezogen, nur aus den Texten dieser Seite */
  if (document.documentElement.getAttribute('data-welt') === 'gastro') {
    var GASTRO = {
      leistung: { a: 'Was ein Restaurant sonst bei fünf oder sechs Firmen einkauft, bauen wir als eins:\n- Website: gestaltet und programmiert, mit Ihrer Reservierung verbunden.\n- Karten und Drucksachen: Speisekarten, Getränkekarten, Menüs für Feiern, druckfertig aus einer Quelle.\n- Gefunden werden: bei Google und bei ChatGPT.\n- Gastgeber im Chat: beantwortet Gästefragen zu Karte, Tischen und Anfahrt, sofort.\n- Betreuung: Updates, Server und Sicherheit, jeden Monat geprüft.\n- Social Media: Strategie und Vorlagen im Stil des Hauses, auf Wunsch begleitet.' },
      ki: { f: 'Findet ChatGPT dann unser Restaurant?', a: 'Gäste fragen heute eine KI, bevor sie reservieren. ChatGPT, Gemini und Co. antworten mit dem, was sie über Ihr Restaurant lesen können. Steht die Karte nur als Foto oder in einer PDF, nehmen sie fremde Quellen.\n- Die Karte als Text: Gerichte, Preise, Zeiten und Lage stehen als echter Text auf jeder Seite, nicht nur im Foto.\n- Für Maschinen hinterlegt: zusätzlich in der Form, mit der Suchmaschinen und Assistenten arbeiten.\n- Vor dem Start geprüft: Wir fragen ChatGPT nach Ihrem Restaurant, bevor die Seite online geht.' },
      chat: { f: 'Was kann der Gastgeber im Chat?', a: 'Er antwortet Gästen rund um die Uhr aus Ihren eigenen Seiten: zu Karte, Tischen und Anfahrt, sofort. Was offen bleibt, liegt als Entwurf beim Team. So kommen weniger Anrufe im Service an, und der Chat antwortet auch nach Küchenschluss.' },
      eigentum: { a: 'Nach der Übergabe gehört das System Ihrem Team. Karte, Preise, Zeiten und Ruhetage ändern Sie an einer Stelle, ohne Agentur.' },
      druck: { a: 'Ja. Speisekarten, Getränkekarten und Menüs für Feiern kommen druckfertig aus einer Quelle. Ändert die Küche ein Gericht, ist es auf der Website, der Karte und im Chat im selben Moment richtig.' },
      restaurant: { f: 'Arbeiten Sie auch für Hotels?', s: ['hotel', 'hotellerie', 'zimmer', 'pension', 'gasthof', 'herberge'], a: 'Ja. Wir bauen Websites für Hotels und Restaurants und die Werkzeuge dahinter. Oben in der Leiste wechseln Sie zur Fassung für Hotels.' },
      kontakt: { a: 'Schreiben Sie uns an ' + MAIL + ' und erzählen Sie uns von Ihrem Restaurant. Wir sehen es uns an, wie ein Gast es sieht, und sagen Ihnen, was eine Website dort leisten kann.' }
    };
    BUCH.forEach(function (x) { var g = GASTRO[x.k]; if (!g) return; if (g.f) x.f = g.f; if (g.a) x.a = g.a; if (g.s) x.s = g.s; });
  }
  var OHNE = 'Dazu habe ich hier keine hinterlegte Antwort. Schreiben Sie uns gern direkt an ' + MAIL + ', wir antworten persönlich.';
  var KARTEN = [['Was Sie bekommen', 'Ein Partner statt sechs', 'leistung', 'k-empfang-900.webp'], ['Die Werkzeuge', 'Ihr Team pflegt selbst', 'werkzeuge', 'k-kn-bildschirm-900.webp'],
                ['Der Ablauf', 'Vier Schritte bis zum Start', 'ablauf', 'k-kn-plan-900.webp'], ['Das Team', 'Anna Llorens, Robert Reff', 'team', 'k-studio-900.webp']];

  var ZEICHEN = '<span class="t" aria-hidden="true"></span>';
  var KREUZ = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var HOCH = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4"/></svg>';
  var NEU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z"/></svg>';

  var knopf = document.createElement('button');
  knopf.className = 'fc-knopf'; knopf.type = 'button';
  knopf.setAttribute('aria-label', 'Häufige Fragen an Tasty Studios'); knopf.setAttribute('aria-expanded', 'false');
  knopf.innerHTML = '<span class="fc-knopf__z">' + ZEICHEN + '</span><span class="fc-knopf__x">' + KREUZ + '</span>';

  var fen = document.createElement('section');
  fen.className = 'fc'; fen.setAttribute('role', 'dialog'); fen.setAttribute('aria-label', 'Häufige Fragen an Tasty Studios');
  fen.innerHTML =
    '<header class="fc__kopf"><span class="fc__marke">' + ZEICHEN + '</span><div><b>Tasty Studios</b><span>Häufige Fragen</span></div>' +
    '<button type="button" class="fc__neu" aria-label="Neues Gespräch" title="Neues Gespräch">' + NEU + '</button>' +
    '<button type="button" class="fc__zu" aria-label="Schliessen">' + KREUZ + '</button></header>' +
    '<div class="fc__lauf" aria-live="polite"></div>' +
    '<form class="fc__feld"><label><span class="sr">Ihre Frage</span><textarea rows="1" autocomplete="off" enterkeyhint="send" placeholder="Ihre Frage an uns"></textarea></label>' +
    '<button type="submit" class="fc__send" aria-label="Senden">' + HOCH + '</button></form>' +
    '<p class="fc__fuss">Hinterlegte Antworten. Verbindlich ist, was wir Ihnen schreiben. <a href="mailto:' + MAIL + '">' + MAIL + '</a></p>';
  var dunkel = document.createElement('div'); dunkel.className = 'fc-dunkel'; dunkel.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dunkel); document.body.appendChild(fen); document.body.appendChild(knopf);

  var lauf = fen.querySelector('.fc__lauf'), feld = fen.querySelector('textarea'), form = fen.querySelector('form');
  var offen = false, begonnen = false, beschaeftigt = false;
  var d = document.documentElement;

  function auf(an) {
    offen = an; d.classList.toggle('fc-offen', an); knopf.setAttribute('aria-expanded', String(an));
    if (an) { if (!begonnen) { begonnen = true; start(); } if (matchMedia('(hover:hover)').matches) setTimeout(function () { feld.focus({ preventScroll: true }); }, 350); }
  }
  knopf.addEventListener('click', function () { auf(!offen); });
  fen.querySelector('.fc__zu').addEventListener('click', function () { auf(false); knopf.focus(); });
  fen.querySelector('.fc__neu').addEventListener('click', function () { if (beschaeftigt) return; lauf.innerHTML = ''; start(); });
  dunkel.addEventListener('click', function () { auf(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) auf(false); });

  /* Fotos der Startkarten vorab holen, sobald die Seite ruht, damit sie beim Öffnen schon da sind */
  var vorab = false;
  function vorladen() { if (vorab) return; vorab = true; KARTEN.forEach(function (k) { var i = new Image(); i.decoding = 'async'; i.src = IMG + k[3]; }); }
  if (document.readyState === 'complete') setTimeout(vorladen, 1200); else addEventListener('load', function () { setTimeout(vorladen, 1200); });
  knopf.addEventListener('pointerenter', vorladen); knopf.addEventListener('focus', vorladen);

  function runter() { lauf.scrollTop = lauf.scrollHeight; }
  function blase(wer, text) { var b = document.createElement('div'); b.className = 'fc__b fc__b--' + wer; if (text) b.textContent = text; lauf.appendChild(b); runter(); return b; }
  function absaetze(b, text) {
    var ul = null, p = null;
    text.split('\n').forEach(function (z) {
      z = z.trim(); if (!z) { ul = null; p = null; return; }
      var punkt = /^-\s+/.test(z), inhalt = z.replace(/^-\s+/, ''), el;
      if (punkt) { if (!ul) { ul = document.createElement('ul'); b.appendChild(ul); } p = null; el = document.createElement('li'); ul.appendChild(el); }
      else { ul = null; p = document.createElement('p'); b.appendChild(p); el = p; }
      var m = punkt && inhalt.match(/^([^:]{2,32}):\s+(.+)$/);
      if (m) { var st = document.createElement('b'); st.textContent = m[1]; el.appendChild(st); el.appendChild(document.createTextNode(' ' + m[2])); }
      else el.appendChild(document.createTextNode(inhalt));
    });
  }
  function tippe(b, text, fertig) {
    var w = text.split(' '), i = 0;
    (function weiter() {
      i++; b.innerHTML = ''; absaetze(b, w.slice(0, i).join(' ')); runter();
      if (i < w.length) return setTimeout(weiter, 12 + Math.random() * 18);
      fertig && fertig();
    })();
  }
  function denkt() { var b = blase('wir'); b.classList.add('fc__b--denkt'); b.innerHTML = '<i></i><i></i><i></i>'; return b; }
  function vorschlaege(keys) {
    var v = document.createElement('div'); v.className = 'fc__vor';
    keys.forEach(function (k) {
      var t = BUCH.filter(function (x) { return x.k === k; })[0]; if (!t) return;
      var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<span></span>' + PFEIL; b.firstChild.textContent = t.f;
      b.addEventListener('click', function () { v.remove(); frage(t.f); });
      v.appendChild(b);
    });
    lauf.appendChild(v); runter();
  }
  function start() {
    var st = document.createElement('div'); st.className = 'fc__start';
    st.innerHTML = '<span class="fc__start-z">' + ZEICHEN + '</span><h3>Was möchten Sie<br>wissen?</h3><p>Die häufigsten Fragen zu Website, Werkzeugen und Ablauf.</p><div class="fc__karten"></div>';
    KARTEN.forEach(function (k) {
      var t = BUCH.filter(function (x) { return x.k === k[2]; })[0];
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<span class="fc__k-bild"><img src="' + IMG + k[3] + '" alt="" decoding="async"></span><span class="fc__k-text"><b></b><span></span></span>';
      b.querySelector('b').textContent = k[0]; b.querySelector('.fc__k-text span').textContent = k[1]; b.setAttribute('aria-label', k[0] + ': ' + k[1]);
      b.addEventListener('click', function () { frage(t.f); });
      st.lastChild.appendChild(b);
    });
    lauf.appendChild(st);
  }

  function norm(s) { s = String(s || '').toLowerCase(); return ' ' + s.replace(/[?!.,;:«»"()]/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function finde(f) {
    var n = norm(f), best = null, punkte = 0;
    BUCH.forEach(function (t) {
      var p = norm(t.f) === n ? 100 : 0;
      t.s.forEach(function (s) { if (n.indexOf(s) > -1) p += s.trim().length > 4 ? 2 : 1; });
      if (p > punkte) { punkte = p; best = t; }
    });
    return best;
  }
  function frage(text) {
    text = String(text || '').trim(); if (!text || beschaeftigt) return;
    beschaeftigt = true;
    var st = lauf.querySelector('.fc__start'); if (st) st.remove();
    lauf.querySelectorAll('.fc__vor').forEach(function (v) { v.remove(); });
    blase('gast', text);
    var t = finde(text), b = denkt();
    setTimeout(function () {
      b.classList.remove('fc__b--denkt'); b.innerHTML = '';
      tippe(b, t ? t.a : OHNE, function () { beschaeftigt = false; vorschlaege(t ? t.w : ['leistung', 'ablauf', 'kontakt']); });
    }, 650);
  }
  function hoehe() { feld.style.height = 'auto'; feld.style.height = Math.min(feld.scrollHeight, 132) + 'px'; }
  feld.addEventListener('input', hoehe);
  feld.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit')); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); var t = feld.value; feld.value = ''; hoehe(); frage(t); });
})();
