/* Bewerbung im Fenster, Carlton-Europe (Robert 17.10.2026: «stell beim Carlton die Bewerbung auch aufs Fenster um, kein Mailprogramm»; Regel Master «Website-Bau» 3a,
   Vorbild Waldhotel Doldenhorn und Landgasthof Ruedihus).
   - «Bewerben», «Zur Bewerbung», «Spontan bewerben» und die Mail-Verweise mit Betreff Bewerbung öffnen ein Fenster in der Mitte: links das Bild vom Empfang,
     rechts das Blatt mit den Feldern der Kurzbewerbung.
   - «Bewerbung senden» (im Fenster und im Blatt «Kurzbewerbung» auf «Jobs») legt die Bewerbung per POST /api/anfragen ab
     (online: api/anfragen.js mit dem Blob-Speicher des Hauses, am Rechner: studio.py → _dienste/anfragen.jsonl). Nie das Mailprogramm.
   Auftritt nur über transform, das Blatt ist ab dem ersten Bild deckend, kein Weichzeichner. Stil: assets/css/bewerbung.css. */
(function () {
  if (window.CEBewerbung) return;
  var doc = document.documentElement, SP = (doc.lang || 'de').slice(0, 2), WURZEL = SP === 'de' ? '' : '../';
  var T = {
    de: { kl: 'Bewerbung · Carlton-Europe', titel: 'Ihre Bewerbung.', satz: 'Sollten Sie sich interessieren, bei uns zu arbeiten, schreiben Sie uns ein paar Zeilen. Vielleicht werden auch Sie in der Zukunft ein Stück Geschichte des Carlton-Europe Hotels schreiben!',
          name: 'Ihr Name', kontakt: 'E-Mail oder Telefon', als: 'Bewerbung als', optionen: ['Spontanbewerbung', 'Teilzeitangestellte'], text: 'Ein paar Zeilen zu Ihnen',
          senden: 'Bewerbung senden', klein: 'Entwurf von Tasty Studios: Bewerbungen gehen noch nicht an das Haus, sie liegen zur Probe bei Tasty Studios. Den Lebenslauf können Sie auch per Post senden: Carlton-Europe Hotel, Höheweg 92–94, 3800 Interlaken.',
          fehlt: 'Bitte Ihren Namen und eine E-Mail-Adresse oder Telefonnummer angeben, damit wir Ihnen antworten können.', laeuft: 'Wird gesendet',
          fehler: 'Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder rufen Sie uns an: ', dank: 'Vielen Dank, ', dankSatz: 'Das ist ein Entwurf: Ihre Bewerbung ist nicht beim Haus angekommen, sie liegt zur Probe bei Tasty Studios.',
          stelle: 'Bewerbung als', antwort: 'Antwort an', zu: 'Schliessen', bild: 'Empfang des Hotels mit roter Theke und Holzbalkendecke', danke: 'Das ist ein Entwurf: Ihre Bewerbung ist nicht beim Haus angekommen, sie liegt zur Probe bei Tasty Studios.' },
    en: { kl: 'Application · Carlton-Europe', titel: 'Your application.', satz: 'If you are interested in working with us, write us a few lines. Perhaps you too will write a piece of the Carlton-Europe Hotel’s history in the future!',
          name: 'Your name', kontakt: 'Email or phone', als: 'Applying as', optionen: ['Unsolicited application', 'Part-time staff'], text: 'A few lines about you',
          senden: 'Send application', klein: 'Draft by Tasty Studios: applications do not yet go to the hotel, they are kept for testing by Tasty Studios. You can also send your CV by post: Carlton-Europe Hotel, Höheweg 92–94, 3800 Interlaken.',
          fehlt: 'Please enter your name and an email address or phone number so that we can reply.', laeuft: 'Sending',
          fehler: 'That did not work just now. Please try again or call us: ', dank: 'Thank you, ', dankSatz: 'This is a draft: your application has not reached the hotel, it is kept for testing by Tasty Studios.',
          stelle: 'Applying as', antwort: 'Reply to', zu: 'Close', bild: 'Hotel reception with red counter and wooden beam ceiling', danke: 'This is a draft: your application has not reached the hotel, it is kept for testing by Tasty Studios.' },
    fr: { kl: 'Candidature · Carlton-Europe', titel: 'Votre candidature.', satz: 'Si vous souhaitez travailler chez nous, écrivez-nous quelques lignes. Peut-être écrirez-vous vous aussi, à l’avenir, une page de l’histoire du Carlton-Europe Hotel !',
          name: 'Votre nom', kontakt: 'E-mail ou téléphone', als: 'Candidature pour', optionen: ['Candidature spontanée', 'Temps partiel'], text: 'Quelques lignes sur vous',
          senden: 'Envoyer la candidature', klein: 'Ébauche de Tasty Studios : les candidatures ne parviennent pas encore à l’hôtel, elles sont conservées à titre d’essai par Tasty Studios. Vous pouvez aussi envoyer votre CV par la poste : Carlton-Europe Hotel, Höheweg 92–94, 3800 Interlaken.',
          fehlt: 'Merci d’indiquer votre nom et une adresse e-mail ou un numéro de téléphone pour que nous puissions vous répondre.', laeuft: 'Envoi en cours',
          fehler: 'Cela n’a pas fonctionné. Merci de réessayer ou de nous appeler : ', dank: 'Merci, ', dankSatz: 'Ceci est une ébauche : votre candidature n’est pas parvenue à l’hôtel, elle est conservée à titre d’essai par Tasty Studios.',
          stelle: 'Candidature pour', antwort: 'Réponse à', zu: 'Fermer', bild: 'Réception de l’hôtel avec comptoir rouge et plafond à poutres', danke: 'Ceci est une ébauche : votre candidature n’est pas parvenue à l’hôtel, elle est conservée à titre d’essai par Tasty Studios.' }
  }[SP] || null;
  if (!T) return;
  var TEL = '+41 33 826 01 60', TEL_ROH = '+41338260160', AN = 'info@carltoneurope.ch';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';

  /* eine Bewerbung an das Haus schicken; gibt ein Versprechen zurück */
  function schicke(d) {
    return fetch(WURZEL + 'api/anfragen', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ an: AN, anliegen: 'Bewerbung: ' + (d.als || T.optionen[0]), datum: '', personen: '', nachricht: [d.als ? T.stelle + ': ' + d.als : '', d.tel ? 'Telefon: ' + d.tel : '', d.text || ''].filter(Boolean).join('\n'),
        name: d.name, kontakt: d.kontakt, seite: location.pathname, sprache: SP, website: d.falle || '' }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (x) { if (!r.ok || !x.ok) throw new Error(x.fehler || r.status); }); });
  }

  var hinter, dlg, f, danke, meldung, knopf, vorher = null;
  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'cb__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'cb'; dlg.setAttribute('aria-labelledby', 'cb-titel');
    var z = $('svg use[href="#ce"]'), vb = z && z.closest('svg').getAttribute('viewBox');
    dlg.innerHTML = '<div class="cb__in">' +
      '<figure class="cb__bild"><img src="' + WURZEL + 'assets/img/reception-s.webp" width="900" height="600" alt="' + esc(T.bild) + '" decoding="async"></figure>' +
      '<div class="cb__blatt blatt">' +
        '<button class="cb__zu" type="button" aria-label="' + esc(T.zu) + '"><span></span><span></span></button>' +
        '<header class="cb__kopf">' + (vb ? '<svg class="cb__zeichen" viewBox="' + vb + '" aria-hidden="true" fill="currentColor"><use href="#ce"/></svg>' : '') +
          '<p class="mono mono--k">' + esc(T.kl) + '</p><h2 class="d2" id="cb-titel">' + esc(T.titel).replace(/^(\S+)\s/, '$1 <em>') + '</em></h2><p class="cb__satz">' + esc(T.satz) + '</p></header>' +
        '<form class="cb__form" novalidate><div class="felder">' +
          '<label class="feld"><span>' + esc(T.name) + '</span><input name="name" autocomplete="name" maxlength="120"></label>' +
          '<label class="feld"><span>' + esc(T.kontakt) + '</span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
          '<label class="feld feld--ganz"><span>' + esc(T.als) + '</span><select name="als">' + T.optionen.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></label>' +
          '<label class="feld feld--ganz"><span>' + esc(T.text) + '</span><textarea name="text" rows="4" maxlength="4000"></textarea></label>' +
          '<input class="cb__honig" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"></div>' +
          '<p class="cb__meldung" role="alert" hidden></p>' +
          '<div class="kn-reihe"><button class="kn" type="submit">' + esc(T.senden) + '<i>' + PFEIL + '</i></button></div>' +
          '<p class="cb__klein">' + esc(T.klein) + '</p></form>' +
        '<div class="cb__danke" hidden><p class="d3" data-dank></p><p class="cb__satz">' + esc(T.dankSatz) + '</p><dl class="cb__zettel" data-zettel></dl>' +
          '<div class="kn-reihe"><button class="kn" type="button" data-zu>' + esc(T.zu) + '<i>' + PFEIL + '</i></button></div></div>' +
      '</div></div>';
    f = $('form', dlg); danke = $('.cb__danke', dlg); meldung = $('.cb__meldung', dlg); knopf = $('button[type=submit]', f);
    var zu = function () { if (dlg.open) dlg.close(); };
    hinter.addEventListener('click', zu); $('.cb__zu', dlg).addEventListener('click', zu); $('[data-zu]', dlg).addEventListener('click', zu);
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } });
    dlg.addEventListener('close', function () { hinter.hidden = true; doc.classList.remove('cb-offen'); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var E = f.elements, name = E.name.value.trim(), kontakt = E.kontakt.value.trim();
      E.name.parentNode.classList.toggle('falsch', !name); E.kontakt.parentNode.classList.toggle('falsch', !kontakt);
      if (!name || !kontakt) { meldung.textContent = T.fehlt; meldung.hidden = false; (name ? E.kontakt : E.name).focus(); return; }
      var alt = knopf.firstChild.nodeValue; knopf.disabled = true; knopf.firstChild.nodeValue = T.laeuft; meldung.hidden = true;
      schicke({ name: name, kontakt: kontakt, als: E.als.value, text: E.text.value.trim(), falle: E.website.value })
        .then(function () {
          $('[data-dank]', dlg).textContent = T.dank + name.split(' ')[0] + '.';
          $('[data-zettel]', dlg).innerHTML = [[T.stelle, E.als.value], [T.antwort, kontakt]].map(function (z) { return '<div><dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd></div>'; }).join('');
          f.hidden = true; danke.hidden = false; f.reset(); dlg.scrollTop = 0;
        })
        .catch(function () { meldung.innerHTML = esc(T.fehler) + '<a href="tel:' + TEL_ROH + '">' + TEL + '</a>'; meldung.hidden = false; })
        .then(function () { knopf.disabled = false; knopf.firstChild.nodeValue = alt; });
    });
  }
  function oeffne(o) {
    o = o || {}; if (!dlg) baue();
    $$('dialog[open]').forEach(function (d) { if (d !== dlg) d.close(); });
    f.hidden = false; danke.hidden = true; meldung.hidden = true;
    $$('.falsch', dlg).forEach(function (x) { x.classList.remove('falsch'); });
    if (o.als) f.elements.als.value = o.als;
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0; doc.classList.add('cb-offen');
    setTimeout(function () { f.elements.name.focus({ preventScroll: true }); }, 80);
  }
  window.CEBewerbung = { oeffne: oeffne };

  /* Wege ins Fenster: Knöpfe zur Bewerbung, Mail-Verweise mit Betreff Bewerbung oder Spontanbewerbung */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href');
    var hin = h === '#bewerbung' || /^mailto:[^?]*\?subject=(Spontan)?[Bb]ewerbung\b/.test(h);
    if (!hin) return;
    e.preventDefault(); e.stopPropagation();
    oeffne({ als: /Spontan/.test(h) ? T.optionen[0] : '' });
  }, true);

  /* Das Blatt «Kurzbewerbung» auf «Jobs» schickt ebenso an das Haus statt ins Mailprogramm (fängt das Absenden vor main.js ab) */
  document.addEventListener('submit', function (e) {
    var fo = e.target; if (!fo || !fo.matches || !fo.matches('form[data-formular="bewerbung"]')) return;
    e.preventDefault(); e.stopPropagation();
    var w = function (n) { var x = fo.querySelector('[data-name="' + n + '"]'); return x ? x.value.trim() : ''; };
    var name = w('Name'), tel = w('Telefon'), kn = fo.querySelector('button[type=submit]'), alt = fo.querySelector('.formular__danke');
    if (alt) alt.remove();
    var p = document.createElement('p'); p.className = 'lauf formular__danke'; p.setAttribute('role', 'status');
    if (!name || !tel) { p.textContent = T.fehlt; fo.appendChild(p); return; }
    if (kn) kn.disabled = true;
    schicke({ name: name, kontakt: tel, tel: '', als: w('Bewerbung als'), text: w('Nachricht') })
      .then(function () { fo.reset(); p.textContent = T.danke; })
      .catch(function () { p.innerHTML = esc(T.fehler) + '<a href="tel:' + TEL_ROH + '">' + TEL + '</a>'; })
      .then(function () { fo.appendChild(p); if (kn) kn.disabled = false; });
  }, true);
})();
