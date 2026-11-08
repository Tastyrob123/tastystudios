/* Vorschau (Robert 17.10.2026, Werkbank-Regel 12: «Die Formulare schicken Mails an die echte Adresse des Hauses … abstellen oder als Demo kennzeichnen»):
   nichts geht an eine Adresse des Hauses; jede Anfrage landet im Eingang von La Réception dieser Vorschau, das Fenster sagt es sichtbar.
   Anfrage-Fenster des Waldhotel Doldenhorn (Robert 16.10.2026: «wir landen nirgendwo auf der gesamten Seite in irgendwelchen E-Mail-Bereichen,
   die wir selber schreiben müssen, sondern immer in irgendwelchen Anfrageformularen»). Vorbild: Anfrage-Fenster des Grand Beau-Rivage (Briefbogen auf der Seite).
   - Jeder Verweis auf eine Mail-Adresse des Hauses öffnet dieses Fenster statt des Mailprogramms (Adresse, Betreff und Text aus dem Verweis). Ausnahme: rechtliches.html.
   - Die Formulare der Seite (Tisch, Feste-Rechner, Vor der Anreise, Unterseiten) rufen window.DHAnfrage.oeffne({an, betreff, text}) und landen ebenso hier.
   - «Anfrage senden» legt die Anfrage per POST /api/anfragen im Speicher des Hauses ab (online: api/anfragen.js mit dem Blob-Speicher, lokal: serve.py → _dienste/anfragen.jsonl).
   Fenster mit show() und eigenem Hintergrund; Auftritt nur über transform, das Blatt ist ab dem ersten Bild deckend. Stil: assets/css/anfrage.css. */
(function () {
  if (window.DHAnfrage) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var DATEN = {}; try { DATEN = JSON.parse(($('#dn-daten') || {}).textContent || '{}'); } catch (e) {}
  var TEL = DATEN.tel || '+41 33 675 81 81';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  /* wer die Anfrage bekommt: aus der Mail-Adresse des Verweises */
  var TEAM = { info: ['Rezeption', 'Ihre Anfrage'], spa: ['Spa-Team', 'Termin im Doldenhorn Spa'], event: ['Event-Team', 'Ihr Anlass im Doldenhorn'], jobs: ['Personal', 'Ihre Bewerbung'] };
  var team = function (an) { return TEAM[String(an || '').split('@')[0]] || TEAM.info; };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var zeichen = function () { var z = document.getElementById('zeichen'); return z ? '<svg class="anf__zeichen" viewBox="282.26 400.65 31.24 45.18" aria-hidden="true">' + z.innerHTML + '</svg>' : ''; };

  var hinter, dlg, f, E, eingabe, danke, meldung, senden, an = 'info@doldenhorn.ch', vorher = null;
  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'anf__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'anf'; dlg.setAttribute('aria-labelledby', 'anf-titel');
    dlg.innerHTML = '<div class="anf__blatt">' +
      '<button class="anf__zu" type="button" aria-label="Schliessen"><span></span><span></span></button>' +
      '<header class="anf__kopf">' + zeichen() + '<p class="anf__kl">Anfrage · <span data-team></span> · Vorschau</p><h2 class="anf__titel" id="anf-titel" data-titel></h2><span class="anf__linie" aria-hidden="true"></span></header>' +
      '<form class="anf__form" data-seite="eingabe" novalidate>' +
        '<label class="anf__feld anf__feld--ganz"><span>Ihr Anliegen</span><input name="anliegen" maxlength="160"></label>' +
        '<label class="anf__feld" data-mit-datum><span>Wunschdatum</span><input type="date" name="tag"></label>' +
        '<label class="anf__feld" data-mit-datum><span>Personen</span><input type="number" name="personen" min="1" max="500" inputmode="numeric"></label>' +
        '<label class="anf__feld anf__feld--ganz"><span>Ihre Nachricht</span><textarea name="nachricht" rows="5" maxlength="4000"></textarea></label>' +
        '<label class="anf__feld"><span>Ihr Name</span><input name="name" autocomplete="name" maxlength="120"></label>' +
        '<label class="anf__feld"><span>E-Mail oder Telefon</span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
        '<input class="anf__honig" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="anf__meldung" role="alert" hidden></p>' +
        '<div class="anf__fuss"><button class="kn kn--dunkel" type="submit">Anfrage senden<i>' + PFEIL + '</i></button>' +
        '<p class="anf__klein">Vorschau von Tasty Studios: Ihre Anfrage landet im Eingang von La Réception und geht nicht an das <span data-team></span> des Hauses.</p></div>' +
      '</form>' +
      '<div class="anf__danke" data-seite="danke" hidden><p class="anf__dank" data-danke></p><p class="anf__dank-satz">Ihre Anfrage liegt jetzt im Eingang von La Réception, beim <span data-team></span>. In dieser Vorschau geht sie nicht an das Haus.</p>' +
        '<dl class="anf__zettel" data-zettel></dl><div class="anf__fuss anf__fuss--mitte"><button class="kn" type="button" data-zu>Schliessen<i>' + PFEIL + '</i></button></div></div>' +
      '</div>';
    f = $('form', dlg); E = f.elements; eingabe = f; danke = $('[data-seite=danke]', dlg); meldung = $('.anf__meldung', dlg); senden = $('button[type=submit]', f);
    E.tag.min = iso(new Date());
    hinter.addEventListener('click', zu); $('.anf__zu', dlg).addEventListener('click', zu); $('[data-zu]', dlg).addEventListener('click', zu);
    dlg.addEventListener('close', function () {
      hinter.hidden = true; document.documentElement.classList.remove('anf-offen'); document.removeEventListener('keydown', taste);
      if (vorher && vorher.focus) vorher.focus({ preventScroll: true });
    });
    f.addEventListener('submit', schicke);
  }
  var taste = function (e) { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); zu(); } };
  function zu() { if (dlg && dlg.open) dlg.close(); }

  /* o = {an, betreff, text}: Fenster öffnen, vorbelegt */
  function oeffne(o) {
    o = o || {}; if (!dlg) baue();
    /* Robert 17.10.2026: «Tisch anfragen» im Fenster «Wann dürfen wir Sie begrüssen?» tat scheinbar nichts, die Anfrage lag hinter dem Fenster.
       Ein durchgehender Ablauf: jedes andere offene Fenster schliesst, die Anfrage steht vorn, Tag und Personen sind schon eingetragen. */
    [].forEach.call(document.querySelectorAll('dialog[open]'), function (d) { if (d !== dlg) d.close(); });
    an = /^[\w.+-]+@doldenhorn\.ch$/i.test(o.an || '') ? o.an.toLowerCase() : 'info@doldenhorn.ch';
    var t = team(an), text = String(o.text || '').trim(), name = (text.match(/^Name: *(.+)$/m) || [])[1] || '';
    [].forEach.call(dlg.querySelectorAll('[data-team]'), function (s) { s.textContent = t[0]; });
    $('[data-titel]', dlg).textContent = o.betreff ? String(o.betreff).replace(/ im (Waldhotel )?Doldenhorn( Spa)?$/, '') : t[1];
    E.anliegen.value = o.betreff || t[1];
    E.nachricht.value = text; if (name && !E.name.value) E.name.value = name.trim();
    E.tag.value = /^\d{4}-\d{2}-\d{2}$/.test(o.tag || '') ? o.tag : ''; E.personen.value = +o.personen > 0 ? String(+o.personen) : '';
    [E.tag, E.personen].forEach(function (x) { x.dispatchEvent(new Event('input', { bubbles: true })); x.dispatchEvent(new Event('change', { bubbles: true })); });
    [].forEach.call(dlg.querySelectorAll('[data-mit-datum]'), function (l) { l.hidden = an.indexOf('jobs@') === 0; });
    eingabe.hidden = false; danke.hidden = true; meldung.hidden = true;
    [].forEach.call(dlg.querySelectorAll('.falsch'), function (x) { x.classList.remove('falsch'); });
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0;
    document.documentElement.classList.add('anf-offen'); document.addEventListener('keydown', taste);
    setTimeout(function () { (E.name.value ? E.kontakt : E.name).focus({ preventScroll: true }); }, 80);
  }

  function schicke(e) {
    e.preventDefault();
    var name = E.name.value.trim(), kontakt = E.kontakt.value.trim();
    E.name.parentNode.classList.toggle('falsch', !name); E.kontakt.parentNode.classList.toggle('falsch', !kontakt);
    if (!name || !kontakt) { meldung.textContent = 'Bitte Ihren Namen und eine E-Mail-Adresse oder Telefonnummer angeben, damit wir Ihnen antworten können.'; meldung.hidden = false; (name ? E.kontakt : E.name).focus(); return; }
    var t = E.tag.value ? new Date(E.tag.value + 'T12:00') : null, datum = t && !isNaN(t) ? t.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
    var mitDatum = an.indexOf('jobs@') !== 0;
    senden.disabled = true; var knText = senden.firstChild.nodeValue; senden.firstChild.nodeValue = 'Wird gesendet'; meldung.hidden = true;
    fetch('/api/anfragen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ an: an, anliegen: E.anliegen.value.trim(), datum: mitDatum ? datum : '', personen: mitDatum ? E.personen.value : '', nachricht: E.nachricht.value.trim(),
        name: name, kontakt: kontakt, seite: location.pathname, sprache: (document.documentElement.lang || 'de').slice(0, 2), website: E.website.value })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.ok) throw new Error(d.fehler || r.status); return d; }); })
      .then(function () {
        $('[data-danke]', dlg).textContent = 'Vielen Dank, ' + name.split(' ')[0] + '.';
        $('[data-zettel]', dlg).innerHTML = [['Anliegen', E.anliegen.value.trim()], ['Datum', mitDatum ? datum : ''], ['Personen', mitDatum ? E.personen.value : ''], ['Antwort an', kontakt]]
          .filter(function (z) { return z[1]; }).map(function (z) { return '<div><dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd></div>'; }).join('');
        eingabe.hidden = true; danke.hidden = false; dlg.scrollTop = 0; f.reset();
        try { if (window.dhZaehle) window.dhZaehle('formular', { f: 'anfrage' }); } catch (x) {}
      })
      .catch(function () { meldung.innerHTML = 'Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder rufen Sie uns an: <a href="tel:' + esc(TEL.replace(/[^+\d]/g, '')) + '">' + esc(TEL) + '</a>'; meldung.hidden = false; })
      .then(function () { senden.disabled = false; senden.firstChild.nodeValue = knText; });
  }

  /* Verweise auf Mail-Adressen des Hauses → Fenster (nur die Rechtstexte behalten die Adresse zum Anklicken) */
  var RECHT = /rechtliches\.html$/.test(location.pathname);
  document.addEventListener('click', function (e) {
    if (RECHT || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]'); if (!a) return;
    if (a.hasAttribute('data-stelle') || a.hasAttribute('data-spa-termin') || /^mailto:spa@doldenhorn\.ch\?subject=Termin/i.test(a.getAttribute('href'))) return;   /* Spa-Termine öffnen das Termin-Fenster über Calendly (Robert 18.10.2026: «A») */   /* Robert 17.10.2026: eine Stelle öffnet ihr Blatt, nicht zugleich das Bewerbungsfenster dahinter (das Kreuz führte sonst in die Bewerbung) */
    var h = a.getAttribute('href').slice(7), adr = decodeURIComponent(h.split('?')[0]), q = h.split('?')[1] || '', p = {};
    q.split('&').forEach(function (x) { var i = x.indexOf('='); if (i > 0) { try { p[x.slice(0, i).toLowerCase()] = decodeURIComponent(x.slice(i + 1).replace(/\+/g, ' ')); } catch (y) {} } });
    if (!/@doldenhorn\.ch$/i.test(adr)) return;
    e.preventDefault(); oeffne({ an: adr, betreff: p.subject || '', text: p.body || '' });
  }, true);

  window.DHAnfrage = { oeffne: oeffne };
})();

/* ---------- Stellenausschreibungen (Robert 16.10.2026): ein Klick auf eine offene Stelle öffnet ihr Blatt; «Jetzt bewerben» führt ins Anfrage-Fenster an jobs@.
   Inhalt aus <template id="stelle-N"> (bau.py stellen_vorlagen, Texte in daten.py STELLEN_TEXT). Gleiche Hülle und Bewegung wie das Anfrage-Fenster. */
(function () {
  var hinter, dlg, inhalt, titel, aktuell = '', vorher = null;
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'anf__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'anf anf--stelle'; dlg.setAttribute('aria-labelledby', 'stb-titel');
    var z = document.getElementById('zeichen');
    dlg.innerHTML = '<div class="anf__blatt"><button class="anf__zu" type="button" aria-label="Schliessen"><span></span><span></span></button>' +
      '<header class="anf__kopf">' + (z ? '<svg class="anf__zeichen" viewBox="282.26 400.65 31.24 45.18" aria-hidden="true">' + z.innerHTML + '</svg>' : '') +
      '<p class="anf__kl">Offene Stelle · Waldhotel Doldenhorn</p><h2 class="anf__titel" id="stb-titel"></h2><span class="anf__linie" aria-hidden="true"></span></header>' +
      '<div class="stb"></div><div class="anf__fuss anf__fuss--mitte"><button class="kn kn--dunkel" type="button" data-bewerben>Jetzt bewerben<i>' + PFEIL + '</i></button></div></div>';
    inhalt = dlg.querySelector('.stb'); titel = dlg.querySelector('#stb-titel');
    var zu = function () { if (dlg.open) dlg.close(); };
    hinter.addEventListener('click', zu); dlg.querySelector('.anf__zu').addEventListener('click', zu);
    dlg.addEventListener('close', function () { hinter.hidden = true; document.documentElement.classList.remove('anf-offen'); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } });
    dlg.querySelector('[data-bewerben]').addEventListener('click', function () {
      dlg.close(); if (window.DHAnfrage) window.DHAnfrage.oeffne({ an: 'jobs@doldenhorn.ch', betreff: 'Bewerbung als ' + aktuell, text: '' });
    });
  }
  document.addEventListener('click', function (e) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('[data-stelle]'); if (!a) return;
    var t = document.getElementById('stelle-' + a.getAttribute('data-stelle')); if (!t) return;
    e.preventDefault(); e.stopPropagation(); if (!dlg) baue();
    aktuell = t.getAttribute('data-titel') || ''; titel.textContent = aktuell;
    inhalt.innerHTML = ''; inhalt.appendChild(t.content.cloneNode(true));
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0; document.documentElement.classList.add('anf-offen');
    setTimeout(function () { dlg.querySelector('.anf__zu').focus({ preventScroll: true }); }, 60);
  }, true);
})();

/* ---------- Termin im Spa (Robert 17.10.2026: «eigenes Termin-Fenster im Stil des Hauses: Behandlung, Tag und Uhrzeit wählen, die Anfrage geht an das Spa-Team, das bestätigt»).
   Ersetzt den Weg zum Calendly des Hauses: jeder Verweis darauf und jede Zeile im Massage-Menü öffnet dieses Fenster.
   Die freien Zeiten liest /api/dienste?was=spazeiten aus dem Kalender des Spa-Teams (nur lesen, nichts buchen). Ohne Kalender (Maniküre/Pediküre) oder wenn er
   nicht antwortet, wählt der Gast eine Wunschzeit. Abgeschickt wird über /api/anfragen an spa@ (Eingang im Studio), wie jede Anfrage der Seite.
   Behandlungen aus <script id="dn-spa"> (bau.py spa_daten(), Quelle daten.py MASSAGE). Hülle und Bewegung wie das Anfrage-Fenster.
   Calendly, Idee A (Robert 18.10.2026, 13:41: «A»): Fenster bleibt im Kleid des Hauses mit dem Hinweis «über Calendly», Zeiten weiter live aus dem Calendly des Hauses;
   der letzte Knopf zeigt in der Vorschau nur «So käme Ihr Termin in Calendly an», nichts wird gebucht, nichts geschickt. Echtes Konto erst nach dem Auftrag. ---------- */
(function () {
  var roh = document.getElementById('dn-spa'); if (!roh) return;
  var LISTE = []; try { LISTE = JSON.parse(roh.textContent); } catch (e) { return; }
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; }, iso = function (d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], MON = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  var TAGE = 14, hinter, dlg, f, stand = { b: null, tag: '', zeit: '', frei: null }, vorher = null, abruf = 0;

  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'anf__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'anf anf--termin'; dlg.setAttribute('aria-labelledby', 'ter-titel');
    var z = document.getElementById('zeichen'), gruppen = [];
    LISTE.forEach(function (b) { if (gruppen.indexOf(b.g) < 0) gruppen.push(b.g); });
    dlg.innerHTML = '<div class="anf__blatt"><button class="anf__zu" type="button" aria-label="Schliessen"><span></span><span></span></button>' +
      '<header class="anf__kopf">' + (z ? '<svg class="anf__zeichen" viewBox="282.26 400.65 31.24 45.18" aria-hidden="true">' + z.innerHTML + '</svg>' : '') +
      '<p class="anf__kl">Termin · Doldenhorn Spa · über Calendly · Vorschau</p><h2 class="anf__titel" id="ter-titel">Ihr Termin im Spa.</h2><span class="anf__linie" aria-hidden="true"></span></header>' +
      '<form class="ter" novalidate data-eigene-wahl>' +
        '<section class="ter__schritt"><p class="ter__nr"><span>I</span>Behandlung</p>' +
          '<div class="ter__gruppen" role="tablist">' + gruppen.map(function (g, i) { return '<button type="button" role="tab" data-gruppe="' + esc(g) + '" aria-selected="' + (i === 0) + '">' + esc(g) + '</button>'; }).join('') + '</div>' +
          '<div class="ter__liste">' + LISTE.map(function (b, i) { return '<label class="ter__b" data-g="' + esc(b.g) + '"><input type="radio" name="b" value="' + i + '"><span><b>' + esc(b.n) + '</b><small>' + esc(b.d) + '</small></span><em>' + esc(b.p) + '</em></label>'; }).join('') + '</div>' +
        '</section>' +
        '<section class="ter__schritt" data-tag-teil><p class="ter__nr"><span>II</span>Tag</p><div class="ter__tage" data-tage></div></section>' +
        '<section class="ter__schritt" data-zeit-teil><p class="ter__nr"><span>III</span>Uhrzeit</p><p class="ter__hinweis" data-zeit-hinweis></p><div class="ter__zeiten" data-zeiten></div>' +
          '<label class="ter__wunsch" data-wunsch hidden><span>Ihre Wunschzeit</span><input type="time" name="wunsch" step="900" value="10:00"></label></section>' +
        '<section class="ter__schritt"><p class="ter__nr"><span>IV</span>Für wen</p><div class="ter__felder">' +
          '<label class="anf__feld"><span>Ihr Name</span><input name="name" autocomplete="name" maxlength="120"></label>' +
          '<label class="anf__feld"><span>E-Mail oder Telefon</span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
          '<label class="anf__feld anf__feld--ganz"><span>Zimmer oder Anreise, Wünsche (freiwillig)</span><input name="notiz" maxlength="400"></label></div></section>' +
        '<input class="anf__honig" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="ter__zettel" data-zettel></div>' +
        '<p class="anf__meldung" role="alert" hidden></p>' +
        '<div class="anf__fuss"><button class="kn kn--dunkel" type="submit">So käme Ihr Termin in Calendly an<i>' + PFEIL + '</i></button>' +
        '<p class="anf__klein">Vorschau von Tasty Studios: Die freien Zeiten kommen live aus dem Calendly des Spa. Gebucht wird hier nichts, und nichts geht an das Haus. Stornierung bitte mindestens 12 Stunden im Voraus.</p></div>' +
      '</form>' +
      '<div class="anf__danke" data-danke hidden><p class="anf__dank" data-dank></p><p class="anf__dank-satz">So stünde der Termin im Kalender des Spa-Teams, und Calendly schickte Ihnen die Bestätigung. In dieser Vorschau ist nichts gebucht und nichts an das Haus gegangen.</p>' +
        '<dl class="anf__zettel" data-dzettel></dl><div class="anf__fuss anf__fuss--mitte"><button class="kn" type="button" data-zu>Schliessen<i>' + PFEIL + '</i></button></div></div></div>';
    f = $('form', dlg);
    var zu = function () { if (dlg.open) dlg.close(); };
    hinter.addEventListener('click', zu); $('.anf__zu', dlg).addEventListener('click', zu); $('[data-zu]', dlg).addEventListener('click', zu);
    dlg.addEventListener('close', function () { hinter.hidden = true; document.documentElement.classList.remove('anf-offen'); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } });
    $$('[data-gruppe]', dlg).forEach(function (t) { t.addEventListener('click', function () { zeigeGruppe(t.getAttribute('data-gruppe')); }); });
    $$('input[name=b]', f).forEach(function (r) { r.addEventListener('change', function () { waehle(+r.value); }); });
    f.wunsch.addEventListener('change', function () { stand.zeit = f.wunsch.value; zettel(); });
    f.addEventListener('submit', schicke);
  }
  function zeigeGruppe(g) {
    $$('[data-gruppe]', dlg).forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-gruppe') === g)); });
    $$('.ter__b', dlg).forEach(function (l) { l.hidden = l.getAttribute('data-g') !== g; });
  }
  function waehle(i) {
    var b = LISTE[i]; if (!b) return; stand.b = b; stand.zeit = ''; stand.frei = null;
    var r = $('input[name=b][value="' + i + '"]', f); if (r) r.checked = true;
    zeigeGruppe(b.g); tage(); zettel();
    if (!b.k) { stand.frei = false; tage(); zeiten(); return; }
    var mein = ++abruf; $('[data-zeit-hinweis]', dlg).textContent = 'Freie Zeiten werden geladen …';
    fetch('/api/dienste?was=spazeiten&art=' + encodeURIComponent(b.k) + '&tage=' + TAGE).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { if (mein !== abruf) return; stand.frei = d.frei || {}; tage(); zeiten(); })
      .catch(function () { if (mein !== abruf) return; stand.frei = false; tage(); zeiten(); });
  }
  function frei(tag) { return stand.frei ? (stand.frei[tag] || []) : null; }
  function tage() {
    var h = '', heute = new Date(); heute.setHours(12, 0, 0, 0);
    for (var n = 0; n < TAGE; n++) {
      var d = new Date(heute.getTime() + n * 864e5), t = iso(d), fr = frei(t), aus = !!stand.b && stand.frei && !fr.length;
      h += '<button type="button" class="ter__tag' + (t === stand.tag ? ' an' : '') + '" data-tag="' + t + '"' + (aus ? ' disabled' : '') + ' aria-pressed="' + (t === stand.tag) + '"' + (aus ? ' title="An diesem Tag ist nichts mehr frei"' : '') + '><small>' + WT[d.getDay()] + '</small><b>' + d.getDate() + '</b><small>' + MON[d.getMonth()] + '</small>' + '</button>';
    }
    var w = $('[data-tage]', dlg); w.innerHTML = h;
    $$('[data-tag]', w).forEach(function (k) { k.addEventListener('click', function () { stand.tag = k.getAttribute('data-tag'); stand.zeit = ''; tage(); zeiten(); zettel(); }); });
    if (stand.tag && stand.frei && !frei(stand.tag).length) { stand.tag = ''; }
  }
  function zeiten() {
    var w = $('[data-zeiten]', dlg), hw = $('[data-zeit-hinweis]', dlg), wu = $('[data-wunsch]', dlg);
    if (!stand.b) { hw.textContent = 'Wählen Sie zuerst eine Behandlung.'; w.innerHTML = ''; wu.hidden = true; return; }
    if (stand.frei === false) { hw.textContent = stand.b.k ? 'Der Kalender des Spa antwortet gerade nicht. Nennen Sie uns Ihre Wunschzeit.' : 'Für diese Behandlung nennen Sie uns Ihre Wunschzeit.'; w.innerHTML = ''; wu.hidden = false; stand.zeit = f.wunsch.value; zettel(); return; }
    wu.hidden = true;
    if (!stand.tag) { hw.textContent = 'Wählen Sie einen Tag.'; w.innerHTML = ''; return; }
    var alle = frei(stand.tag) || [], halb = {}, auswahl = [];
    alle.forEach(function (z) { var k = z.slice(0, 2) + (+z.slice(3) < 30 ? 'a' : 'b'); if (!halb[k]) { halb[k] = 1; auswahl.push(z); } });
    hw.textContent = auswahl.length ? 'Freie Zeiten live aus dem Calendly des Spa.' : 'An diesem Tag ist nichts mehr frei.';
    var teil = function (titel, von, bis) { var l = auswahl.filter(function (z) { return z >= von && z < bis; }); return l.length ? '<div class="ter__block"><p>' + titel + '</p><div>' + l.map(function (z) { return '<button type="button" class="ter__zeit' + (z === stand.zeit ? ' an' : '') + '" data-zeit="' + z + '" aria-pressed="' + (z === stand.zeit) + '">' + z + '</button>'; }).join('') + '</div></div>' : ''; };
    w.innerHTML = teil('Vormittag', '00:00', '12:00') + teil('Nachmittag', '12:00', '17:00') + teil('Abend', '17:00', '24:00');
    $$('[data-zeit]', w).forEach(function (k) { k.addEventListener('click', function () { stand.zeit = k.getAttribute('data-zeit'); zeiten(); zettel(); }); });
  }
  function lang(t) { var d = new Date(t + 'T12:00'); return d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function zettel() {
    var z = $('[data-zettel]', dlg), b = stand.b;
    if (!b) { z.innerHTML = ''; return; }
    z.innerHTML = '<span>' + esc(b.g) + ' · ' + esc(b.n) + '</span><span>' + esc(b.d) + '</span>' + (stand.tag ? '<span>' + esc(lang(stand.tag)) + (stand.zeit ? ', ' + esc(stand.zeit) + ' Uhr' : '') + '</span>' : '') + '<b>CHF ' + esc(b.p) + '</b>';
  }
  function oeffne(o) {
    o = o || {}; if (!dlg) baue();
    $$('dialog[open]').forEach(function (d) { if (d !== dlg) d.close(); });
    $('[data-danke]', dlg).hidden = true; f.hidden = false; $('.anf__meldung', dlg).hidden = true;
    stand = { b: null, tag: '', zeit: '', frei: null }; $$('input[name=b]', f).forEach(function (r) { r.checked = false; });
    var i = -1; if (o.name) { var s = String(o.name).toLowerCase(); LISTE.forEach(function (b, n) { if (i < 0 && (b.g + ' · ' + b.n).toLowerCase() === s) i = n; }); [true, false].forEach(function (streng) { if (i < 0) LISTE.forEach(function (b, n) { if (i < 0 && s.indexOf(b.n.toLowerCase()) >= 0 && (!o.gruppe || b.g === o.gruppe) && (!streng || !o.dauer || b.d === o.dauer)) i = n; }); }); }
    zeigeGruppe(LISTE[0].g); tage(); zeiten(); zettel();
    if (i >= 0) waehle(i);
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0; document.documentElement.classList.add('anf-offen');
    setTimeout(function () { $('.anf__zu', dlg).focus({ preventScroll: true }); }, 60);
  }
  function schicke(e) {
    e.preventDefault();
    var m = $('.anf__meldung', dlg), name = f.name.value.trim(), kontakt = f.kontakt.value.trim(), b = stand.b, fehlt = [];
    if (!b) fehlt.push('eine Behandlung'); if (!stand.tag && stand.frei !== false) fehlt.push('einen Tag'); if (!stand.zeit) fehlt.push('eine Uhrzeit');
    if (!name) fehlt.push('Ihren Namen'); if (!kontakt) fehlt.push('E-Mail oder Telefon');
    f.name.parentNode.classList.toggle('falsch', !name); f.kontakt.parentNode.classList.toggle('falsch', !kontakt);
    if (fehlt.length) { m.textContent = 'Bitte wählen oder ergänzen Sie noch ' + fehlt.join(', ') + '.'; m.hidden = false; return; }
    var tagText = stand.tag ? lang(stand.tag) : 'nach Absprache', knopf = $('button[type=submit]', f), alt = knopf.firstChild.nodeValue;
    knopf.disabled = true; knopf.firstChild.nodeValue = 'Einen Moment'; m.hidden = true;
    var text = ['Behandlung: ' + b.g + ' · ' + b.n + ' (' + b.d + ', CHF ' + b.p + ')', 'Tag: ' + tagText, 'Uhrzeit: ' + stand.zeit + (stand.frei ? ' (laut Kalender frei)' : ' (Wunschzeit)'), 'Name: ' + name];
    if (f.notiz.value.trim()) text.push('Hinweis: ' + f.notiz.value.trim());
    new Promise(function (ok) { setTimeout(ok, 450); })  /* Calendly A: in der Vorschau wird nichts gebucht und nichts geschickt (früher /api/anfragen an spa@) */
      .then(function () {
        $('[data-dank]', dlg).textContent = 'So käme Ihr Termin in Calendly an.';
        $('[data-dzettel]', dlg).innerHTML = [['Behandlung', b.g + ' · ' + b.n], ['Termin', tagText + ', ' + stand.zeit + ' Uhr'], ['Preis', 'CHF ' + b.p], ['Bestätigung an', kontakt], ['Kalender', 'Calendly · Doldenhorn Spa']].map(function (z) { return '<div><dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd></div>'; }).join('');
        f.hidden = true; $('[data-danke]', dlg).hidden = false; dlg.scrollTop = 0; f.reset();
        try { if (window.dhZaehle) window.dhZaehle('formular', { f: 'spa' }); } catch (x) {}
      })
      .catch(function () { m.innerHTML = 'Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder rufen Sie uns an: <a href="tel:+41336758181">+41 33 675 81 81</a>'; m.hidden = false; })
      .then(function () { knopf.disabled = false; knopf.firstChild.nodeValue = alt; });
  }
  /* Calendly-Verweise und Zeilen des Massage-Menüs öffnen das Fenster */
  document.addEventListener('click', function (e) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href*="calendly.com/spa-doldenhorn"], [data-spa-termin], a[href^="mailto:spa@doldenhorn.ch?subject=Termin"]');
    var zeile = !a && e.target.closest && e.target.closest('[data-spa-menu] .gang');
    if (!a && !zeile) return;
    e.preventDefault(); e.stopPropagation();
    if (zeile) { var gr = zeile.closest('section') && $('.gruppe', zeile.closest('section')); oeffne({ name: $('b', zeile).textContent, gruppe: gr ? gr.textContent.trim() : '', dauer: ($('span', zeile) || {}).textContent || '' }); }
    else oeffne({ name: a.getAttribute('data-spa-termin') || '' });
  }, true);
  window.DHTermin = { oeffne: oeffne };
})();
