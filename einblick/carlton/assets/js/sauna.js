/* Sauna reservieren über Calendly, Vorschau (Robert 18.10.2026, 15:05: «ja» zur Idee: «Zeit reservieren» öffnet ein Fenster mit Tag und Uhrzeit,
   Hinweis «über Calendly», der letzte Knopf zeigt nur «So käme Ihr Termin in Calendly an»; kein echtes Konto, nichts geht an das Haus, der Anruf
   bleibt als zweiter Weg; Massage und Coiffeur bleiben beim Telefon). Vorbild: Waldhotel Doldenhorn, spa.html (assets/js/anfrage.js, Termin im Spa).
   Angaben nur von der Seite des Hauses: täglich 8 bis 22 Uhr, zum Heizen etwa 60 Minuten, darum frühestens eine Stunde ab jetzt (Uhr von Interlaken),
   Eintritt CHF 30, ab Superior inklusive. Hülle und Stil wie die Bewerbung (assets/css/bewerbung.css, Klassen cb__…). */
(function () {
  if (window.CESauna) return;
  var doc = document.documentElement, SP = (doc.lang || 'de').slice(0, 2), WURZEL = SP === 'de' ? '' : '../';
  var T = {
    de: { kl: 'Sauna · Oberländer Wellnessdörfli · über Calendly · Vorschau', titel: 'Ihre Zeit in der Sauna.', satz: 'Zum Heizen brauchen wir etwa 60 Minuten, darum beginnen die Zeiten frühestens in einer Stunde. Täglich 8 bis 22 Uhr, Eintritt CHF 30, ab Superior inklusive.',
          tag: 'Tag', zeit: 'Uhrzeit', personen: 'Personen', name: 'Ihr Name', kontakt: 'E-Mail oder Telefon', zimmer: 'Zimmer (freiwillig)',
          senden: 'So käme Ihr Termin in Calendly an', anruf: 'Lieber anrufen', klein: 'Vorschau von Tasty Studios: Im Betrieb kämen die freien Zeiten aus dem Calendly des Hauses. Gebucht wird hier nichts, und nichts geht an das Haus.',
          fehlt: 'Bitte wählen oder ergänzen Sie noch ', und: ', ', w: { tag: 'einen Tag', zeit: 'eine Uhrzeit', name: 'Ihren Namen', kontakt: 'E-Mail oder Telefon' },
          keine: 'An diesem Tag ist keine Zeit mehr frei.', erst: 'Wählen Sie zuerst einen Tag.',
          dank: 'So käme Ihr Termin in Calendly an.', dankSatz: 'So stünde die Zeit im Kalender der Rezeption, und Calendly schickte Ihnen die Bestätigung. In dieser Vorschau ist nichts gebucht und nichts an das Haus gegangen.',
          zSauna: 'Sauna', zTermin: 'Termin', zPers: 'Personen', zAn: 'Bestätigung an', zKal: 'Kalender', kal: 'Calendly · Carlton-Europe Wellness', sauna: 'Oberländer Wellnessdörfli', uhr: ' Uhr', zu: 'Schliessen', bild: 'Holzhäuschen, Liegen und Wasserfall im Wellnessdörfli', loc: 'de-CH' },
    en: { kl: 'Sauna · Oberländer Wellnessdörfli · via Calendly · preview', titel: 'Your time in the sauna.', satz: 'Heating takes about 60 minutes, so the earliest time is one hour from now. Daily 8 am to 10 pm, entry CHF 30, included from Superior.',
          tag: 'Day', zeit: 'Time', personen: 'Guests', name: 'Your name', kontakt: 'Email or phone', zimmer: 'Room (optional)',
          senden: 'How your booking would arrive in Calendly', anruf: 'Rather call', klein: 'Preview by Tasty Studios: in operation, free times would come from the hotel’s Calendly. Nothing is booked here and nothing is sent to the hotel.',
          fehlt: 'Please still choose or add ', und: ', ', w: { tag: 'a day', zeit: 'a time', name: 'your name', kontakt: 'email or phone' },
          keine: 'No time left on this day.', erst: 'Please choose a day first.',
          dank: 'This is how your booking would arrive in Calendly.', dankSatz: 'The time would be in the reception’s calendar, and Calendly would send you the confirmation. In this preview nothing has been booked and nothing has gone to the hotel.',
          zSauna: 'Sauna', zTermin: 'Time', zPers: 'Guests', zAn: 'Confirmation to', zKal: 'Calendar', kal: 'Calendly · Carlton-Europe Wellness', sauna: 'Oberländer Wellnessdörfli', uhr: '', zu: 'Close', bild: 'Wooden huts, loungers and waterfall in the wellness village', loc: 'en-GB' },
    fr: { kl: 'Sauna · Oberländer Wellnessdörfli · via Calendly · aperçu', titel: 'Votre moment au sauna.', satz: 'Le chauffage demande environ 60 minutes : les créneaux commencent donc au plus tôt dans une heure. Tous les jours de 8 h à 22 h, entrée CHF 30, incluse dès la Superior.',
          tag: 'Jour', zeit: 'Heure', personen: 'Personnes', name: 'Votre nom', kontakt: 'E-mail ou téléphone', zimmer: 'Chambre (facultatif)',
          senden: 'Ainsi arriverait votre rendez-vous dans Calendly', anruf: 'Plutôt appeler', klein: 'Aperçu de Tasty Studios : en service, les créneaux libres viendraient du Calendly de l’hôtel. Rien n’est réservé ici et rien n’est envoyé à l’hôtel.',
          fehlt: 'Merci de choisir ou de compléter encore ', und: ', ', w: { tag: 'un jour', zeit: 'une heure', name: 'votre nom', kontakt: 'e-mail ou téléphone' },
          keine: 'Plus aucun créneau libre ce jour-là.', erst: 'Choisissez d’abord un jour.',
          dank: 'Ainsi arriverait votre rendez-vous dans Calendly.', dankSatz: 'Le créneau figurerait dans le calendrier de la réception, et Calendly vous enverrait la confirmation. Dans cet aperçu, rien n’a été réservé ni envoyé à l’hôtel.',
          zSauna: 'Sauna', zTermin: 'Rendez-vous', zPers: 'Personnes', zAn: 'Confirmation à', zKal: 'Calendrier', kal: 'Calendly · Carlton-Europe Wellness', sauna: 'Oberländer Wellnessdörfli', uhr: ' h', zu: 'Fermer', bild: 'Chalets en bois, transats et cascade du village bien-être', loc: 'fr-CH' }
  }[SP];
  if (!T) return;
  var TEL = '+41 33 826 01 60', TEL_ROH = '+41338260160', TAGE = 14, VON = 8, BIS = 21;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  /* jetzt in Interlaken: Datum (JJJJ-MM-TT) und Minuten seit Mitternacht */
  function jetzt() {
    var t = {}; new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (p) { t[p.type] = p.value; });
    return { tag: t.year + '-' + t.month + '-' + t.day, min: (+t.hour % 24) * 60 + (+t.minute) };
  }
  function plus(iso, n) { var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function frei(iso) { var j = jetzt(), l = []; for (var h = VON; h <= BIS; h++) { if (iso === j.tag && h * 60 < j.min + 60) continue; l.push(zwei(h) + ':00'); } return l; }
  function lang(iso, o) { return new Date(iso + 'T12:00:00Z').toLocaleDateString(T.loc, Object.assign({ timeZone: 'UTC' }, o)); }

  var hinter, dlg, f, danke, meldung, stand = { tag: '', zeit: '' }, vorher = null;
  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'cb__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'cb cb--sauna'; dlg.setAttribute('aria-labelledby', 'cs-titel');
    var z = $('svg use[href="#ce"]'), vb = z && z.closest('svg').getAttribute('viewBox');
    dlg.innerHTML = '<div class="cb__in">' +
      '<figure class="cb__bild"><img src="' + WURZEL + 'assets/img/wellness-s.webp" width="900" height="600" alt="' + esc(T.bild) + '" decoding="async"></figure>' +
      '<div class="cb__blatt blatt">' +
        '<button class="cb__zu" type="button" aria-label="' + esc(T.zu) + '"><span></span><span></span></button>' +
        '<header class="cb__kopf">' + (vb ? '<svg class="cb__zeichen" viewBox="' + vb + '" aria-hidden="true" fill="currentColor"><use href="#ce"/></svg>' : '') +
          '<p class="mono mono--k">' + esc(T.kl) + '</p><h2 class="d2" id="cs-titel">' + esc(T.titel).replace(/^(\S+\s\S+)\s/, '$1 <em>') + '</em></h2><p class="cb__satz">' + esc(T.satz) + '</p></header>' +
        '<form class="cb__form" novalidate>' +
          '<p class="cs__nr">' + esc(T.tag) + '</p><div class="cs__tage" data-tage></div>' +
          '<p class="cs__nr">' + esc(T.zeit) + '</p><p class="cs__hinweis" data-hinweis></p><div class="cs__zeiten" data-zeiten></div>' +
          '<div class="felder">' +
            '<label class="feld"><span>' + esc(T.personen) + '</span><select name="personen"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>' +
            '<label class="feld"><span>' + esc(T.zimmer) + '</span><input name="zimmer" maxlength="40"></label>' +
            '<label class="feld"><span>' + esc(T.name) + '</span><input name="name" autocomplete="name" maxlength="120"></label>' +
            '<label class="feld"><span>' + esc(T.kontakt) + '</span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
          '</div>' +
          '<p class="cb__meldung" role="alert" hidden></p>' +
          '<div class="kn-reihe"><button class="kn" type="submit">' + esc(T.senden) + '<i>' + PFEIL + '</i></button><a class="kn kn--linie" href="tel:' + TEL_ROH + '">' + esc(T.anruf) + ' · ' + TEL + '<i>' + PFEIL + '</i></a></div>' +
          '<p class="cb__klein">' + esc(T.klein) + '</p></form>' +
        '<div class="cb__danke" hidden><p class="d3" data-dank></p><p class="cb__satz">' + esc(T.dankSatz) + '</p><dl class="cb__zettel" data-zettel></dl>' +
          '<div class="kn-reihe"><button class="kn" type="button" data-zu>' + esc(T.zu) + '<i>' + PFEIL + '</i></button></div></div>' +
      '</div></div>';
    f = $('form', dlg); danke = $('.cb__danke', dlg); meldung = $('.cb__meldung', dlg);
    var zu = function () { if (dlg.open) dlg.close(); };
    hinter.addEventListener('click', zu); $('.cb__zu', dlg).addEventListener('click', zu); $('[data-zu]', dlg).addEventListener('click', zu);
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } });
    dlg.addEventListener('close', function () { hinter.hidden = true; doc.classList.remove('cb-offen'); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
    f.addEventListener('submit', schicke);
  }
  function tage() {
    var j = jetzt(), h = '';
    for (var n = 0; n < TAGE; n++) {
      var t = plus(j.tag, n), aus = !frei(t).length;
      h += '<button type="button" class="cs__tag' + (t === stand.tag ? ' an' : '') + '" data-tag="' + t + '"' + (aus ? ' disabled' : '') + ' aria-pressed="' + (t === stand.tag) + '"><small>' + esc(lang(t, { weekday: 'short' })) + '</small><b>' + +t.slice(8) + '</b><small>' + esc(lang(t, { month: 'short' })) + '</small></button>';
    }
    var w = $('[data-tage]', dlg); w.innerHTML = h;
    $$('[data-tag]', w).forEach(function (k) { k.addEventListener('click', function () { stand.tag = k.getAttribute('data-tag'); stand.zeit = ''; tage(); zeiten(); }); });
  }
  function zeiten() {
    var w = $('[data-zeiten]', dlg), hw = $('[data-hinweis]', dlg);
    if (!stand.tag) { hw.textContent = T.erst; w.innerHTML = ''; return; }
    var l = frei(stand.tag);
    hw.textContent = l.length ? '' : T.keine; hw.hidden = !!l.length;
    w.innerHTML = l.map(function (z) { return '<button type="button" class="cs__zeit' + (z === stand.zeit ? ' an' : '') + '" data-zeit="' + z + '" aria-pressed="' + (z === stand.zeit) + '">' + z + '</button>'; }).join('');
    $$('[data-zeit]', w).forEach(function (k) { k.addEventListener('click', function () { stand.zeit = k.getAttribute('data-zeit'); zeiten(); }); });
  }
  function schicke(e) {
    e.preventDefault();
    var E = f.elements, name = E.name.value.trim(), kontakt = E.kontakt.value.trim(), fehlt = [];
    if (!stand.tag) fehlt.push(T.w.tag); if (!stand.zeit) fehlt.push(T.w.zeit); if (!name) fehlt.push(T.w.name); if (!kontakt) fehlt.push(T.w.kontakt);
    E.name.parentNode.classList.toggle('falsch', !name); E.kontakt.parentNode.classList.toggle('falsch', !kontakt);
    if (fehlt.length) { meldung.textContent = T.fehlt + fehlt.join(T.und) + '.'; meldung.hidden = false; return; }
    meldung.hidden = true;
    $('[data-dank]', dlg).textContent = T.dank;
    $('[data-zettel]', dlg).innerHTML = [[T.zSauna, T.sauna], [T.zTermin, lang(stand.tag, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + stand.zeit + T.uhr], [T.zPers, E.personen.value + (E.zimmer.value.trim() ? ' · ' + E.zimmer.value.trim() : '')], [T.zAn, kontakt], [T.zKal, T.kal]]
      .map(function (z) { return '<div><dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd></div>'; }).join('');
    f.hidden = true; danke.hidden = false; dlg.scrollTop = 0;
  }
  function oeffne() {
    if (!dlg) baue();
    $$('dialog[open]').forEach(function (d) { if (d !== dlg) d.close(); });
    f.reset(); f.hidden = false; danke.hidden = true; meldung.hidden = true; $$('.falsch', dlg).forEach(function (x) { x.classList.remove('falsch'); });
    stand = { tag: '', zeit: '' }; var j = jetzt(); if (frei(j.tag).length) stand.tag = j.tag; else stand.tag = plus(j.tag, 1);
    tage(); zeiten();
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0; doc.classList.add('cb-offen');
    setTimeout(function () { $('.cb__zu', dlg).focus({ preventScroll: true }); }, 80);
  }
  window.CESauna = { oeffne: oeffne };
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('[data-sauna]'); if (!a) return;
    e.preventDefault(); e.stopPropagation(); oeffne();
  }, true);
})();
