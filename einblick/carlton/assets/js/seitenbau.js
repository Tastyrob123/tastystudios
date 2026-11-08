/* Carlton-Europe — Seitenbau 13.10.2026: Bedienung der neuen Seiten.
   Abfahrten ab Interlaken Ost und West (SBB über /api/dienste?was=zuege) · Ihre Abreise (Wünsche an die Rezeption) ·
   Veranstaltungen nach Reisedaten · Pass-Berater · Umgebungskarte. Fällt ein Dienst aus, steht der Weg zum Anbieter da.
   Uhrzeiten immer in Schweizer Zeit, egal wo der Gast sitzt. Bewegung nur über transform. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var SP = (doc.lang || 'de').slice(0, 2), WURZEL = SP === 'de' ? '' : '../', ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH' }[SP] || 'de-CH', ZH = 'Europe/Zurich';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (t) { return t.getFullYear() + '-' + zwei(t.getMonth() + 1) + '-' + zwei(t.getDate()); };
  var chf = function (n) { var r = Math.round(n * 100) / 100, g = Math.floor(r), rest = Math.round((r - g) * 100); var t = String(g).replace(/\B(?=(\d{3})+(?!\d))/g, '’'); return rest ? t + '.' + zwei(rest) : t; };
  var melde = function (el) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  var W = {
    de: { laedt: 'Die Abfahrten werden geladen.', keine: 'Die Abfahrten sind gerade nicht abrufbar. Den Fahrplan zeigt Ihnen die SBB:', sbb: 'Fahrplan bei der SBB', gleis: 'Gleis', stand: function (z) { return 'Abfahrten: SBB, über transport.opendata.ch. Stand ' + z + ' Uhr, Schweizer Zeit.'; },
      keinZug: 'kein Zug gewählt', zug: function (z, n) { return z + ' Uhr nach ' + n; }, uhr: ' Uhr', plus: function (m) { return '+' + m + ' Min.'; },
      wAb: function (d) { return 'Abreise am ' + d; }, wZug: function (z, n) { return 'Zug um ' + z + ' Uhr' + (n ? ' nach ' + n : ''); }, wSpaet: function (h, p) { return h + (h === 1 ? ' Stunde' : ' Stunden') + ' länger im Zimmer: CHF ' + p; },
      wGep: 'Gepäck an der Rezeption deponieren', wDusche: 'Dusche nach der Abreise im Wellnessbereich', wKoffer: function (n) { return 'Portier für ' + n + (n === 1 ? ' Koffer' : ' Koffer'); }, wFahrt: function (a, z) { return a + (z ? ' um ' + z + ' Uhr' : ''); },
      wFbox: 'Frühstücks-Box statt Frühstücksbuffet', wLeer: 'Wählen Sie oben, was wir für Sie richten dürfen.', ja: 'Ja',
      tAlle: '', tZeit: function (n) { return n === 0 ? 'In diesen Tagen steht in der Region kein Termin aus unserer Liste an.' : n === 1 ? 'Ein Termin in der Region während Ihrer Reise.' : n + ' Termine in der Region während Ihrer Reise.'; }, tHaus: function (l) { return ' Im Haus: ' + l + '.'; },
      einzel: 'Einzelfahrten', pass: 'Pass', frei: 'freie Fahrt', nicht: 'nicht im Pass', tag: 'Tagespreis beim Anbieter', mind: 'ab', summe: 'Summe der gewählten Fahrten', offenE: 'Nur belegte Preise sind gerechnet, die übrigen nennt der Anbieter beim Kauf.',
      fuer: 'für', tage: 'Tage', fahrt: 'Fahrt', fahrten: 'Fahrten', zuschlag: 'Anschlussticket Jungfraujoch', kind: 'Kinder von 6 bis 15 Jahren CHF', best: 'Günstigster belegter Weg', nurPass: 'nur der Pass, ohne die Fahrten mit Ermässigung', keinZiel: 'Wählen Sie mindestens einen Ausflug.', gelesen: 'gelesen am' },
    en: { laedt: 'Loading departures.', keine: 'Departures are not available right now. The SBB timetable shows them:', sbb: 'SBB timetable', gleis: 'Platform', stand: function (z) { return 'Departures: SBB, via transport.opendata.ch. As of ' + z + ', Swiss time.'; },
      keinZug: 'no train chosen', zug: function (z, n) { return z + ' to ' + n; }, uhr: '', plus: function (m) { return '+' + m + ' min'; },
      wAb: function (d) { return 'Departure on ' + d; }, wZug: function (z, n) { return 'Train at ' + z + (n ? ' to ' + n : ''); }, wSpaet: function (h, p) { return h + (h === 1 ? ' hour' : ' hours') + ' longer in the room: CHF ' + p; },
      wGep: 'Leave luggage at reception', wDusche: 'Shower in the wellness area after check-out', wKoffer: function (n) { return 'Porter for ' + n + (n === 1 ? ' suitcase' : ' suitcases'); }, wFahrt: function (a, z) { return a + (z ? ' at ' + z : ''); },
      wFbox: 'Breakfast box instead of the breakfast buffet', wLeer: 'Choose above what we may arrange for you.', ja: 'Yes',
      tAlle: '', tZeit: function (n) { return n === 0 ? 'No event from our list takes place in the region on these days.' : n === 1 ? 'One event in the region during your stay.' : n + ' events in the region during your stay.'; }, tHaus: function (l) { return ' At the hotel: ' + l + '.'; },
      einzel: 'Single tickets', pass: 'Pass', frei: 'free travel', nicht: 'not in the pass', tag: 'day price from the operator', mind: 'from', summe: 'Total of the chosen trips', offenE: 'Only documented prices are counted, the operator states the others at purchase.',
      fuer: 'for', tage: 'days', fahrt: 'trip', fahrten: 'trips', zuschlag: 'connecting ticket Jungfraujoch', kind: 'Children aged 6 to 15 CHF', best: 'Cheapest documented option', nurPass: 'the pass alone, without the discounted trips', keinZiel: 'Choose at least one excursion.', gelesen: 'read on' },
    fr: { laedt: 'Chargement des départs.', keine: 'Les départs ne sont pas disponibles pour le moment. L’horaire des CFF les affiche :', sbb: 'Horaire des CFF', gleis: 'Voie', stand: function (z) { return 'Départs : CFF, via transport.opendata.ch. État à ' + z + ', heure suisse.'; },
      keinZug: 'aucun train choisi', zug: function (z, n) { return z + ' pour ' + n; }, uhr: '', plus: function (m) { return '+' + m + ' min'; },
      wAb: function (d) { return 'Départ le ' + d; }, wZug: function (z, n) { return 'Train de ' + z + (n ? ' pour ' + n : ''); }, wSpaet: function (h, p) { return h + (h === 1 ? ' heure' : ' heures') + ' de plus en chambre : CHF ' + p; },
      wGep: 'Déposer les bagages à la réception', wDusche: 'Douche à l’espace bien-être après le départ', wKoffer: function (n) { return 'Portier pour ' + n + (n === 1 ? ' valise' : ' valises'); }, wFahrt: function (a, z) { return a + (z ? ' à ' + z : ''); },
      wFbox: 'Boîte petit-déjeuner à la place du buffet', wLeer: 'Choisissez ci-dessus ce que nous pouvons préparer pour vous.', ja: 'Oui',
      tAlle: '', tZeit: function (n) { return n === 0 ? 'Aucun rendez-vous de notre liste n’a lieu dans la région ces jours-là.' : n === 1 ? 'Un rendez-vous dans la région pendant votre séjour.' : n + ' rendez-vous dans la région pendant votre séjour.'; }, tHaus: function (l) { return ' À l’hôtel : ' + l + '.'; },
      einzel: 'Billets individuels', pass: 'Pass', frei: 'libre parcours', nicht: 'pas dans le pass', tag: 'prix du jour auprès de l’exploitant', mind: 'dès', summe: 'Total des trajets choisis', offenE: 'Seuls les prix attestés sont comptés, l’exploitant indique les autres à l’achat.',
      fuer: 'pour', tage: 'jours', fahrt: 'trajet', fahrten: 'trajets', zuschlag: 'billet de correspondance Jungfraujoch', kind: 'Enfants de 6 à 15 ans CHF', best: 'Option attestée la moins chère', nurPass: 'le pass seul, sans les trajets à prix réduit', keinZiel: 'Choisissez au moins une excursion.', gelesen: 'lu le' }
  }[SP];
  if (!W) return;
  var uhr = function (d) { return d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZH }).replace('.', ':'); };   // immer hh:mm, Schweizer Zeit
  var zeig = function (hhmm) { return SP === 'de' ? hhmm.replace(':', '.') : hhmm; };
  var datum = function (s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString(ORT, { weekday: 'long', day: 'numeric', month: 'long' }); };

  /* ---------- Abfahrten ---------- */
  var abreise = $('form[data-abreise]');
  $$('[data-zuege]').forEach(function (box) {
    var liste = $('[data-zuege-liste]', box), stand = $('[data-zuege-stand]', box), bf = 'ost', gewaehlt = '', uhrwerk = 0, erstes = true;
    var leer = function () { liste.innerHTML = '<li class="sb-zug__leer">' + W.keine + ' <a href="https://www.sbb.ch/' + (SP === 'de' ? 'de' : SP) + '" target="_blank" rel="noopener">' + W.sbb + '</a></li>'; };
    function male(d) {
      var jetzt = Date.now(), z = (d.zuege || []).filter(function (x) { return new Date(x.zeit).getTime() > jetzt - 60000; }).slice(0, 7);
      if (!z.length) { leer(); return; }
      liste.innerHTML = z.map(function (x, i) {
        var t = uhr(new Date(x.zeit)), schl = bf + '|' + x.zeit + '|' + x.nach;
        return '<li><button type="button" class="sb-zugzeile" style="--i:' + i + '" aria-pressed="' + (schl === gewaehlt) + '" data-schl="' + esc(schl) + '" data-zeit="' + t + '" data-nach="' + esc(x.nach) + '"><b>' + zeig(t) + '</b>' +
          '<span class="sb-zugzeile__nach">' + esc(x.nach) + (x.plus ? '<small>' + W.plus(x.plus) + '</small>' : '') + '</span><span class="sb-zugzeile__linie">' + esc(x.linie) + '</span><span class="sb-zugzeile__gleis">' + (x.gleis ? W.gleis + ' ' + esc(x.gleis) : '') + '</span></button></li>';
      }).join('');
      liste.classList.toggle('sb-neu', erstes); erstes = false;
      if (stand) stand.textContent = W.stand(zeig(uhr(new Date())));
    }
    function hole() {
      if (!window.fetch) { leer(); return; }
      var welcher = bf;
      fetch(WURZEL + 'api/dienste?was=zuege&bf=' + welcher).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) { if (welcher === bf) male(d); }).catch(function () { if (welcher === bf) leer(); });
    }
    $$('[data-bf]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-bf') === bf) return;
        bf = b.getAttribute('data-bf'); erstes = true;
        $$('[data-bf]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $$('[data-bf-zeile]', box).forEach(function (x) { x.hidden = x.getAttribute('data-bf-zeile') !== bf; });
        hole();
      });
    });
    liste.addEventListener('click', function (e) {
      var b = e.target.closest('.sb-zugzeile'); if (!b) return;
      gewaehlt = b.getAttribute('aria-pressed') === 'true' ? '' : b.getAttribute('data-schl');
      $$('.sb-zugzeile', liste).forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-schl') === gewaehlt)); });
      if (abreise) {
        var f = abreise.elements.zug; f.value = gewaehlt ? b.getAttribute('data-zeit') : ''; abreise.dataset.nach = gewaehlt ? b.getAttribute('data-nach') : ''; melde(f);
      }
    });
    /* erst holen, wenn der Abschnitt in die Nähe kommt; danach jede Minute, solange die Seite offen und sichtbar ist */
    var los = function () { hole(); uhrwerk = setInterval(function () { if (!document.hidden) hole(); }, 60000); };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); los(); } }, { rootMargin: '600px 0px' }).observe(box); else los();
  });

  /* ---------- Ihre Abreise: Wünsche sammeln, Extras rechnen, an die Rezeption ---------- */
  if (abreise) (function (fo) {
    var el = fo.elements, late = +fo.dataset.late || 0, k = function (n) { return $('[data-k="' + n + '"]', fo); }, q = new URLSearchParams(location.search);
    var heute = new Date(); el.ab.min = iso(heute);
    if (/^\d{4}-\d\d-\d\d$/.test(q.get('ab') || '') && q.get('ab') >= iso(heute)) el.ab.value = q.get('ab');
    if (q.get('name')) k('name').value = q.get('name').slice(0, 80);
    if (q.get('zimmer')) k('zimmer').value = q.get('zimmer').slice(0, 12);
    var wunsch = $('[data-wuensche]', fo), extras = $('[data-extras]', fo), wahl = $('[data-zug-wahl]', fo), nurFahrt = $('[data-nur-fahrt]', fo);
    function neu() {
      var z = [], summe = 0, h = +el.spaet.value || 0, koffer = +el.koffer.value || 0, zug = el.zug.value, nach = fo.dataset.nach || '';
      if (el.ab.value) z.push(W.wAb(datum(el.ab.value)));
      if (zug) z.push(W.wZug(zeig(zug), nach));
      if (wahl) wahl.textContent = zug ? W.zug(zeig(zug), nach || '…').replace(/ (nach|to|pour) …$/, '') : W.keinZug;
      k('spaet').value = h ? W.wSpaet(h, chf(h * late)) : ''; if (h) { z.push(k('spaet').value); summe += h * late; }
      k('gepaeck').value = el.gepaeck.checked ? W.ja : ''; if (el.gepaeck.checked) z.push(W.wGep);
      k('dusche').value = el.dusche.checked ? W.ja : ''; if (el.dusche.checked) z.push(W.wDusche);
      k('koffer').value = koffer ? String(koffer) : ''; if (koffer) z.push(W.wKoffer(koffer));
      var fahrt = el.fahrt.value; nurFahrt.hidden = !fahrt; if (!fahrt) el.fahrtzeit.value = '';
      if (fahrt) z.push(W.wFahrt(el.fahrt.options[el.fahrt.selectedIndex].textContent, el.fahrtzeit.value ? zeig(el.fahrtzeit.value) : ''));
      k('fbox').value = el.fbox.checked ? W.ja : ''; if (el.fbox.checked) z.push(W.wFbox);
      var boxen = [];
      $$('[data-box]', fo).forEach(function (r) { var n = +$('input', r).value || 0; if (n) { boxen.push(n + ' × ' + r.getAttribute('data-box')); summe += n * (+r.getAttribute('data-preis') || 0); } });
      k('lunch').value = boxen.join(', '); if (boxen.length) z.push(boxen.join(', '));
      k('extras').value = summe ? chf(summe) : '';
      wunsch.innerHTML = z.length ? z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') : '<li>' + W.wLeer + '</li>';
      extras.textContent = chf(summe);
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); fo.addEventListener('reset', function () { fo.dataset.nach = ''; setTimeout(neu, 0); });
    el.zug.addEventListener('change', function () { if (!el.zug.value) fo.dataset.nach = ''; });
    neu();
  })(abreise);

  /* ---------- Veranstaltungen nach Reisedaten ---------- */
  $$('[data-termine]').forEach(function (box) {
    var fo = $('form[data-reise]', box), stand = $('[data-termine-stand]', box), el = fo.elements, heute = iso(new Date());
    el.an.min = heute; el.ab.min = heute;
    el.an.addEventListener('change', function () { if (el.an.value) { el.ab.min = el.an.value; if (el.ab.value && el.ab.value < el.an.value) { el.ab.value = el.an.value; melde(el.ab); } } });
    function neu() {
      var an = el.an.value, ab = el.ab.value || an, n = 0, haus = [];
      $$('.sb-termin', box).forEach(function (t) {
        var von = t.getAttribute('data-von'), bis = t.getAttribute('data-bis') || von, drin = !an || !von || (von <= ab && bis >= an);
        t.classList.toggle('aus', !drin); if (drin) n++;
      });
      $$('.sb-ev[data-termin]').forEach(function (t) { var von = t.getAttribute('data-von'), bis = t.getAttribute('data-bis') || von; if (an && von && von <= ab && bis >= an) haus.push($('.st__n', t).textContent.trim()); });
      stand.textContent = an ? W.tZeit(n) + (haus.length ? W.tHaus(haus.join(', ')) : '') : '';
    }
    fo.addEventListener('change', neu); fo.addEventListener('reset', function () { setTimeout(function () { el.ab.min = heute; neu(); }, 0); });
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var dlg = $('dialog.buchen'), df = dlg && $('form', dlg), offner = $('.eckknopf[data-buchen]') || $('[data-buchen]');
      if (df && el.an.value) { df.elements.an.value = el.an.value; melde(df.elements.an); if (el.ab.value > el.an.value) { df.elements.ab.value = el.ab.value; melde(df.elements.ab); } }
      if (offner) offner.click();
    });
    neu();
  });

  /* ---------- Pass-Berater ---------- */
  $$('[data-pass]').forEach(function (box) {
    var D; try { D = JSON.parse($('#pb-daten').textContent); } catch (e) { return; }
    var NAME = {}; D.ziele.forEach(function (z) { NAME[z.id] = z.name; });
    var aus = $('[data-pass-aus]', box), fo = $('form', box), el = fo.elements, heute = iso(new Date());
    var halb = function () { return el.halbtax.value === '1'; };
    $$('[data-ziel]', box).forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); neu(); }); });
    fo.addEventListener('change', neu); fo.addEventListener('submit', function (e) { e.preventDefault(); });
    /* Lange Leiste (14.10.2026): jede Taste schreibt ihren Wert in das verborgene Feld ihrer Gruppe; ab der ersten Wahl drehen sich die Pässe bei jedem Wechsel einmal herein */
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-wert]'), g = t && t.closest('[data-wahl]');
      if (g) { el[g.getAttribute('data-wahl')].value = t.getAttribute('data-wert'); $$('[data-wert]', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === t)); }); neu(); }
      if (g || e.target.closest('[data-ziel]')) aus.classList.add('gewaehlt');
    }, true);
    function passPreis(p) {   // die nächste erhältliche Dauer, die die Tage deckt
      var ks = Object.keys(p.tage).map(Number).sort(function (a, b) { return a - b; }), t = +el.tage.value || 3, d = ks.filter(function (x) { return x >= t; })[0] || ks[ks.length - 1];
      return { tage: d, chf: p.tage[d][halb() ? 1 : 0] };
    }
    /* Das Motiv über dem Namen (Robert 14.10.2026, Fassung 4 um 01:55: «wie richtige edle Karten, edle Tickets, im Stil von einem Luxushotel»): das Billett des Hauses, wie es auf
       apartments.html und aktiv.html steht (Nachtblau mit Verlauf, feine Goldlinie, gekerbte Ecken, gestrichelter Abriss, Zeichen in Gold), als Zeichnung: links der Name mit den
       drei Gipfeln, im Abriss die Zahl der Tage oder Fahrten. Gerade, nichts bewegt sich. Keine Marke der Anbieter. */
    var tkNr = 0, TK_FORM = 'M7 0H134.5A5.5 5.5 0 0 0 145.5 0H193A7 7 0 0 0 200 7V101A7 7 0 0 0 193 108H145.5A5.5 5.5 0 0 0 134.5 108H7A7 7 0 0 0 0 101V7A7 7 0 0 0 7 0Z';
    function tkCe(x, y, b, f) { return '<g transform="translate(' + x + ',' + y + ') scale(' + b / 112 + ')" fill="' + f + '"><g transform="translate(-87,0)"><use href="#ce"/></g></g>'; }
    function passBild(k, tg, name) {
      var n = ++tkNr, w = name.split(' '), z = w.length > 2 ? [w.slice(0, 2).join(' '), w.slice(2).join(' ')] : w.length > 1 ? [w[0], w.slice(1).join(' ')] : [name];
      if (k === 'jtp' && w.length > 2) z = [w[0], w.slice(1).join(' ')];
      var gr = function (t, max) { return Math.min(max, 106 / (t.length * .56)); }, g = Math.min.apply(null, z.map(function (t) { return gr(t, z.length > 1 ? 15.5 : 17); }));
      var titel = z.length > 1 ? '<text x="16" y="' + (58 - g * .12) + '" class="et-s" font-size="' + g + '" fill="#fbf3e2">' + esc(z[0]) + '</text><text x="16" y="' + (58 + g * 1.02) + '" class="et-s" font-size="' + g + '" fill="#fbf3e2">' + esc(z[1]) + '</text>'
        : '<text x="16" y="62" class="et-s" font-size="' + g + '" fill="#fbf3e2">' + esc(z[0]) + '</text>', u = z.length > 1 ? 58 + g * 1.02 + 8 : 71;
      var einheit = (k === 'einzel' ? (tg === 1 ? W.fahrt : W.fahrten) : W.tage).toUpperCase(), gold = 'url(#tk-g' + n + ')';
      return '<div class="pb-pass pb-pass--' + k + '" aria-hidden="true"><svg class="et et--tk" viewBox="-4 -3 208 124" aria-hidden="true"><defs>' +
        '<linearGradient id="tk-n' + n + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#21498a"/><stop offset=".6" stop-color="#12305e"/><stop offset="1" stop-color="#0b2148"/></linearGradient>' +
        '<linearGradient id="tk-g' + n + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeec2"/><stop offset=".5" stop-color="#dcc68f"/><stop offset="1" stop-color="#b3913f"/></linearGradient>' +
        '<radialGradient id="tk-s' + n + '"><stop offset="0" stop-color="rgba(40,30,10,.6)"/><stop offset=".55" stop-color="rgba(40,30,10,.3)"/><stop offset="1" stop-color="rgba(40,30,10,0)"/></radialGradient></defs>' +
        '<ellipse cx="100" cy="110.5" rx="82" ry="9.5" fill="url(#tk-s' + n + ')"/><path d="' + TK_FORM + '" fill="url(#tk-n' + n + ')"/>' +
        '<path d="M13 4.5H129M151 4.5H187M13 103.5H129M151 103.5H187M4.5 13V95M195.5 13V95" fill="none" stroke="#ecd69d" stroke-opacity=".6" stroke-width=".55"/>' +
        '<path d="M140 9V99" fill="none" stroke="#ecd69d" stroke-opacity=".75" stroke-width=".8" stroke-dasharray="2.4 2.2"/>' +
        '<path d="M16 28.5 23.4 19.4l2.6 3L32.4 13l5.6 8 3.6-4.4 9.2 11.9M20.2 28.5h31.6M30.2 16.3l2.2 2.4 2.1-1.7M39.8 19.1l1.8 1.9 1.9-1.4" fill="none" stroke="' + gold + '" stroke-width=".7" stroke-linejoin="round" stroke-linecap="round"/>' +
        tkCe(108.5, 14.5, 18, gold) + titel +
        '<path d="M16 ' + u + 'H126" fill="none" stroke="#ecd69d" stroke-opacity=".65" stroke-width=".5"/><path d="M16 ' + (u + 1.7) + 'H126" fill="none" stroke="#ecd69d" stroke-opacity=".3" stroke-width=".5"/>' +
        '<text x="170" y="25" text-anchor="middle" class="et-m" font-size="4.1" letter-spacing=".26em" fill="#dcc68f">' + esc(einheit) + '</text>' +
        '<text x="170" y="69" text-anchor="middle" class="et-s et-z" font-size="42" fill="' + gold + '">' + tg + '</text>' +
        '<path d="M161 81.2H179" fill="none" stroke="#ecd69d" stroke-opacity=".6" stroke-width=".5"/><path d="M170 85.6l2.4 2.4-2.4 2.4-2.4-2.4z" fill="' + gold + '"/></svg></div>';
    }
    function karte(i, k, tg, name, preis, unter, zeilen, best) {
      return '<article class="pb-k pb-k--' + k + (best ? ' pb-k--best' : '') + '" style="--i:' + i + '">' + passBild(k, tg, name) + (best ? '<span class="pb-k__marke">' + W.best + '</span>' : '') + '<h3 class="pb-k__name">' + esc(name) + '</h3>' +
        '<p class="pb-k__unter">' + unter + '</p><ul class="pb-k__liste">' + zeilen + '</ul><p class="pb-k__preis">' + preis + '</p></article>';
    }
    function zeile(p, z) {
      if (p.frei.indexOf(z) >= 0) return '<li class="frei"><span>' + esc(NAME[z]) + '</span><b>' + W.frei + '</b></li>';
      if (p.teil && p.teil[z]) return '<li><span>' + esc(NAME[z]) + '</span><b>' + esc(p.teil[z]) + '</b></li>';
      return '<li><span>' + esc(NAME[z]) + '</span><i>' + W.nicht + '</i></li>';
    }
    function neu() {
      var Z = $$('[data-ziel][aria-pressed="true"]', box).map(function (b) { return b.getAttribute('data-ziel'); }), h = halb();
      if (!Z.length) { aus.innerHTML = '<p class="pb__leer">' + W.keinZiel + '</p>'; return; }
      // Einzelfahrten: nur belegte Preise zählen
      var e = 0, offen = 0, ez = Z.map(function (z) {
        var p = D.einzel[z];
        if (p) { var v = h ? p.halb : p.voll; e += v; return '<li><span>' + esc(NAME[z]) + '</span><b>CHF ' + chf(v) + '</b></li>'; }
        offen++; return '<li><span>' + esc(NAME[z]) + '</span><i>' + W.tag + '</i></li>';
      }).join('');
      // Jungfrau Travel Pass: Jungfraujoch nur mit Anschlussticket
      var j = D.jtp, jp = passPreis(j), jSumme = jp.chf, jz = Z.map(function (z) {
        if (z === 'joch') { var s = heute >= j.joch.von && heute <= j.joch.bis ? j.joch.sommer : j.joch.winter; jSumme += s; return '<li><span>' + esc(NAME[z]) + '</span><b>+ CHF ' + chf(s) + '</b></li>'; }
        return zeile(j, z);
      }).join('');
      var b = D.bop, bp = passPreis(b), bz = Z.map(function (z) { return zeile(b, z); }).join('');
      // «Günstigster belegter Weg» nur unter Wegen, deren Summe vollständig belegt ist
      var jVoll = Z.every(function (z) { return z === 'joch' || j.frei.indexOf(z) >= 0; }), bVoll = Z.every(function (z) { return b.frei.indexOf(z) >= 0; });
      var kand = []; if (jVoll) kand.push({ k: 'jtp', v: jSumme }); if (bVoll) kand.push({ k: 'bop', v: bp.chf }); if (!offen && e) kand.push({ k: 'einzel', v: e });
      var best = kand.length > 1 ? kand.sort(function (a, c) { return a.v - c.v; })[0].k : '';
      var unterP = function (p, voll, mehr) { return W.fuer + ' ' + p.tage + ' ' + W.tage + (mehr || '') + (voll ? '' : ' · ' + W.nurPass) + ' · ' + W.kind + ' ' + D.jtp.kind; };
      aus.innerHTML = karte(0, 'einzel', Z.length, W.einzel, e ? '<small>' + (offen ? W.mind + ' ' : '') + 'CHF</small>' + chf(e) : '<em>' + W.tag + '</em>', offen ? W.offenE : W.summe, ez, best === 'einzel') +
        karte(1, 'jtp', jp.tage, j.name, '<small>CHF</small>' + chf(jSumme), unterP(jp, jVoll, jSumme !== jp.chf ? ' · CHF ' + chf(jp.chf) + ' + ' + W.zuschlag : ''), jz, best === 'jtp') +
        karte(2, 'bop', bp.tage, b.name, '<small>' + (bVoll ? '' : W.mind + ' ') + 'CHF</small>' + chf(bp.chf), unterP(bp, bVoll), bz, best === 'bop');
    }
    neu();
  });

  /* ---------- Umgebungskarte: Nummer und Zeile der Legende gehören zusammen; am Handy beginnt die Karte beim Haus ---------- */
  $$('[data-karte]').forEach(function (k) {
    var zug = $('[data-karte-zug]', k), haus = $('[data-haus]', k);
    var mitte = function (el, weich) { if (zug.scrollWidth <= zug.clientWidth + 2) return; var x = el.offsetLeft - zug.clientWidth / 2; if (weich && zug.scrollTo) zug.scrollTo({ left: x, behavior: 'smooth' }); else zug.scrollLeft = x; };
    if (haus) { mitte(haus); addEventListener('load', function () { mitte(haus); }); }
    k.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ort]'); if (!b) return;
      var nr = b.getAttribute('data-ort'), an = b.getAttribute('aria-pressed') !== 'true';
      $$('[data-ort]', k).forEach(function (x) { x.setAttribute('aria-pressed', String(an && x.getAttribute('data-ort') === nr)); });
      if (an && b.classList.contains('uk-l')) { var p = $('.uk-p[data-ort="' + nr + '"]', k); if (p) mitte(p, true); }
    });
  });
})();

/* ---------- Bewegung: ohne Bewegung (Systemwunsch oder ?nomotion) laufen auch die federnden Auftritte nicht ---------- */
(function () {
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search)) document.documentElement.classList.add('ce-ruhig'); } catch (e) {}
})();

/* Ein Stück federt genau einmal, auch wenn sein Reiter oder Fenster später wieder aufgeht. */
(function () {
  var fertig = function (e) { if ((e.animationName === 'ce-feder' || e.animationName === 'ce-heben' || e.animationName === 'ce-puls') && e.target && e.target.classList) e.target.classList.add('ce-fertig'); };
  document.addEventListener('animationend', fertig, true); document.addEventListener('animationcancel', fertig, true);
})();

/* ---------- Fotos tauschen den Platz (Robert 13.10.2026, 16:52: «wenn ich auf diese Bilder klicke, dass sich dann nicht jedes Mal das Zimmer öffnet,
   sondern dass die Bilder sich austauschen und das Bild gross wird, genauso wie auf der Startseite; für die ganze Zimmerseite; der Zwischenschritt mit den
   Miniaturen ist erstmal nur Grand Beau-Rivage»). Ein Klick auf ein kleines Foto: es fährt an den grossen Platz, das grosse an seinen. Nur transform, 0,8 s.
   Der Knopf «Alle Fotos» öffnet weiter die Übersicht. Wechselt der Gast den Reiter (Sommer, Winter), stehen die Fotos wieder wie am Anfang. ---------- */
(function () {
  var WAS = ['src', 'srcset', 'alt', 'width', 'height'];
  var still = function () { return document.documentElement.classList.contains('ce-ruhig'); };
  var bild = function (el) { return el.querySelector('img.an') || el.querySelector('img'); };
  var platte = function (el) { return el.classList.contains('zmos__b') ? el : (el.querySelector('.rahmen') || el); };
  var schild = function (el) { return el.querySelector('.legende span'); };
  var merke = function (im) { if (im._ce0) return; im._ce0 = {}; WAS.forEach(function (n) { im._ce0[n] = im.getAttribute(n); }); im._ce0.pos = im.style.objectPosition; im._ce0.hg = im.style.background; };
  var setze = function (im, w) { WAS.forEach(function (n) { if (w[n] === null || w[n] === undefined) im.removeAttribute(n); else im.setAttribute(n, w[n]); }); im.style.objectPosition = w.pos || ''; im.style.background = w.hg || ''; };
  var lies = function (im) { var w = {}; WAS.forEach(function (n) { w[n] = im.getAttribute(n); }); w.pos = im.style.objectPosition; w.hg = im.style.background; return w; };
  /* die Bühne mit Reitern: jedes ihrer Bilder heisst wie sein Reiter */
  [].forEach.call(document.querySelectorAll('[data-reiter]'), function (leiste) {
    var ziel = document.getElementById(leiste.getAttribute('data-reiter')); if (!ziel) return;
    var tabs = leiste.querySelectorAll('.tab'), bi = ziel.querySelectorAll('[data-bilder] img');
    [].forEach.call(bi, function (im, i) { if (tabs[i]) im.setAttribute('data-name', tabs[i].textContent.trim()); });
    [].forEach.call(tabs, function (t) { t.addEventListener('click', function () { zurueck(ziel.closest('section') || ziel); }); });
    /* Sommer hell, Winter blau (Robert 13.10.2026, 17:56): der Abschnitt wechselt mit dem Reiter seine Farbwelt */
    var sj = ziel.closest('.sb-jahr');
    if (sj) [].forEach.call(tabs, function (t, i) { t.addEventListener('click', function () { sj.classList.toggle('fl--navy', i === 1); sj.classList.toggle('fl--creme', i !== 1); sj.classList.toggle('sb-jahr--winter', i === 1); }); });
  });
  function zurueck(sec) {
    [].forEach.call(sec.querySelectorAll('img'), function (im) { if (im._ce0) { setze(im, im._ce0); if (im._ceName !== undefined) im.setAttribute('data-name', im._ceName); } });
    [].forEach.call(sec.querySelectorAll('[data-ce-foto]'), function (el) { el.setAttribute('data-foto', el.getAttribute('data-ce-foto')); });
    [].forEach.call(sec.querySelectorAll('[data-ce-schild]'), function (el) { var s = schild(el); if (s) s.textContent = el.getAttribute('data-ce-schild'); });
  }
  var weich = function (t) { return 1 - Math.pow(1 - t, 3.2); };
  /* Ruhelage eines Fotos in seinem Rahmen: Fotos, die beim Scrollen gleiten, stehen leicht vergrössert und ein Stück versetzt (main.js). Die Fahrt beginnt in der Ruhelage
     des einen Rahmens und endet in der des anderen; sonst stünde das Foto kurz vor dem Ende passgenau im Rahmen und rastete dann in die versetzte Lage ein
     (Robert 13.10.2026, 18:19: «ein blauer Balken oberhalb des Bildes, bevor es einrastet»). */
  function ruhe(im) {
    var c = getComputedStyle(im), m = c.transform && c.transform !== 'none' ? c.transform.match(/-?[\d.e]+/g).map(Number) : null, s = 1, y = 0;
    if (m) { s = m[0] || 1; y = m.length > 6 ? m[13] : m[5]; }
    if (c.translate && c.translate !== 'none') y += parseFloat(c.translate.split(' ')[1]) || 0;
    return { s: s, y: y || 0 };
  }
  function flug(el, von, im, r0, r1) {
    var k = platte(el), L = k.getBoundingClientRect(); if (still() || !k.animate || L.width < 2 || von.width < 2) return;
    var a = (+im.getAttribute('width') || im.naturalWidth || 3) / (+im.getAttribute('height') || im.naturalHeight || 2);
    var fuell = function (w, h) { var cw = Math.max(w, h * a); return { w: cw, h: cw / a }; }, CL = fuell(L.width, L.height), alt = im.style.cssText;
    im.style.cssText += ';position:absolute;inset:auto;left:' + ((L.width - CL.w) / 2).toFixed(2) + 'px;top:' + ((L.height - CL.h) / 2).toFixed(2) + 'px;width:' + CL.w.toFixed(2) + 'px;height:' + CL.h.toFixed(2) + 'px;max-width:none;object-fit:fill;transform-origin:50% 50%;transition:none;animation:none;translate:none;opacity:1';
    var fk = [], fi = [], N = 24, i, t, x, y, w, h, sx, sy, CR, g, v;
    for (i = 0; i <= N; i++) { t = weich(i / N); x = von.left + (L.left - von.left) * t; y = von.top + (L.top - von.top) * t; w = von.width + (L.width - von.width) * t; h = von.height + (L.height - von.height) * t;
      sx = w / L.width; sy = h / L.height; CR = fuell(w, h); g = r0.s + (r1.s - r0.s) * t; v = r0.y + (r1.y - r0.y) * t;
      fk.push({ transform: 'translate(' + (x - L.left).toFixed(2) + 'px,' + (y - L.top).toFixed(2) + 'px) scale(' + sx.toFixed(5) + ',' + sy.toFixed(5) + ')' });
      fi.push({ transform: 'translate(0,' + (v / sy).toFixed(2) + 'px) scale(' + (g * CR.w / CL.w / sx).toFixed(5) + ',' + (g * CR.h / CL.h / sy).toFixed(5) + ')' }); }
    var o0 = k.style.transformOrigin, z0 = k.style.zIndex; k.style.transformOrigin = '0 0'; k.style.zIndex = 6; k._faehrt = 1;
    var zeit = { duration: 820, easing: 'linear', fill: 'forwards' }, bi = im.animate(fi, zeit), lauf = k.animate(fk, zeit);
    var ende = function () { im.style.cssText = alt; k.style.transformOrigin = o0; k.style.zIndex = z0; k._faehrt = 0; try { bi.cancel(); lauf.cancel(); } catch (e) {} };
    lauf.onfinish = ende; lauf.oncancel = function () { if (k._faehrt) ende(); };
  }
  function tausche(a, b) {
    var ia = bild(a), ib = bild(b), ka = platte(a), kb = platte(b); if (!ia || !ib || ka._faehrt || kb._faehrt) return;
    merke(ia); merke(ib); if (ia._ceName === undefined) ia._ceName = ia.getAttribute('data-name') || ''; if (ib._ceName === undefined) ib._ceName = ib.getAttribute('data-name') || '';
    var ra = ka.getBoundingClientRect(), rb = kb.getBoundingClientRect(), wa = lies(ia), wb = lies(ib), sa = schild(a), sb = schild(b);
    var ua = ruhe(ia), ub = ruhe(ib);
    var na = (sa && sa.textContent) || ia.getAttribute('data-name') || '', nb = (sb && sb.textContent) || ib.getAttribute('data-name') || '';
    [a, b].forEach(function (el) { if (el.hasAttribute('data-foto') && !el.hasAttribute('data-ce-foto')) el.setAttribute('data-ce-foto', el.getAttribute('data-foto')); var s = schild(el); if (s && !el.hasAttribute('data-ce-schild')) el.setAttribute('data-ce-schild', s.textContent); });
    setze(ia, wb); setze(ib, wa);
    if (sa) sa.textContent = nb || sa.textContent; else ia.setAttribute('data-name', nb); if (sb) sb.textContent = na || sb.textContent; else ib.setAttribute('data-name', na);
    var fa = a.getAttribute('data-foto'), fb = b.getAttribute('data-foto'); if (fa !== null && fb !== null) { a.setAttribute('data-foto', fb); b.setAttribute('data-foto', fa); }
    var la = a.getAttribute('aria-label'), lb = b.getAttribute('aria-label'); if (la && lb) { a.setAttribute('aria-label', lb); b.setAttribute('aria-label', la); }
    flug(a, rb, ia, ub, ua); flug(b, ra, ib, ua, ub);
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.zmos__b[data-zimmer], figure[role="button"][data-zimmer]'); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    var gross = t.classList.contains('zmos__b') ? t.parentNode.firstElementChild : ((t.closest('section') || document).querySelector('[data-bilder]'));
    if (gross && gross !== t) tausche(t, gross);
  }, true);
})();

/* ---------- «Wie viel Zeit haben Sie?»: jede Kachel pulsiert herein, sobald ihre eigene Oberkante unten ins Fenster rückt.
   (17:24 startete der Auftritt schon mit dem Abschnitt: dann war das Pulsieren vorbei, bevor die Kacheln im Bild standen, Robert 17:46: «ist das weg jetzt?».
   Gemessen mit _qa/sb_rad.js.) Eigene Klassen (ce-wart, ce-los), damit der frühe Gruppen-Auslöser in main.js (.da) den Auftritt nicht vorwegnimmt. ---------- */
(function () {
  var zs = document.querySelector('#zeitfrage [data-zs]'); if (!zs) return;
  var ks = [].slice.call(zs.querySelectorAll('.zs__k'));
  if (document.documentElement.classList.contains('ce-ruhig') || !('IntersectionObserver' in window)) return;
  var los = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; los.unobserve(e.target); e.target.classList.remove('ce-wart'); e.target.classList.add('ce-los'); }); }, { rootMargin: '0px 0px 2% 0px', threshold: 0 });
  ks.forEach(function (k) { if (k.getBoundingClientRect().top < window.innerHeight) return; k.classList.add('ce-wart'); los.observe(k); });
})();

/* ---------- Tagen & Feiern: wählt der Gast einen Saal an seiner Kachel, fliegt dessen Foto auf die Bühne und das bisherige zurück an seinen Platz
   (Robert 13.10.2026, 18:27: «den Effekt mit dem Austauschen»). Zwei Abzüge über der Seite, nur transform, 0,8 s; die Bühne darunter wechselt wie bisher. ---------- */
(function () {
  var w = document.querySelector('[data-saalwahl]'); if (!w || !w.animate) return;
  var buehne = w.querySelector('.sbuehne__b'); if (!buehne) return;
  var weich = function (t) { return 1 - Math.pow(1 - t, 3.2); };
  function abzug(im, von, nach, z, rund) {
    var wr = w.getBoundingClientRect(), g = document.createElement('div'), b = document.createElement('img');
    var a = (im.naturalWidth || 3) / (im.naturalHeight || 2), fuell = function (bw, bh) { var cw = Math.max(bw, bh * a); return { w: cw, h: cw / a }; }, C = fuell(nach.width, nach.height);
    g.className = 'sb-flug'; g.setAttribute('aria-hidden', 'true');
    g.style.cssText = 'left:' + (nach.left - wr.left).toFixed(1) + 'px;top:' + (nach.top - wr.top).toFixed(1) + 'px;width:' + nach.width.toFixed(1) + 'px;height:' + nach.height.toFixed(1) + 'px;z-index:' + z + ';border-radius:' + rund;
    b.alt = ''; b.src = im.currentSrc || im.src;
    b.style.cssText = 'position:absolute;max-width:none;left:' + ((nach.width - C.w) / 2).toFixed(1) + 'px;top:' + ((nach.height - C.h) / 2).toFixed(1) + 'px;width:' + C.w.toFixed(1) + 'px;height:' + C.h.toFixed(1) + 'px';
    g.appendChild(b); w.appendChild(g);
    var fk = [], fi = [], N = 24, i, t, x, y, bw, bh, sx, sy, R;
    for (i = 0; i <= N; i++) { t = weich(i / N); x = von.left + (nach.left - von.left) * t; y = von.top + (nach.top - von.top) * t; bw = von.width + (nach.width - von.width) * t; bh = von.height + (nach.height - von.height) * t;
      sx = bw / nach.width; sy = bh / nach.height; R = fuell(bw, bh);
      fk.push({ transform: 'translate(' + (x - nach.left).toFixed(2) + 'px,' + (y - nach.top).toFixed(2) + 'px) scale(' + sx.toFixed(5) + ',' + sy.toFixed(5) + ')' });
      fi.push({ transform: 'scale(' + (R.w / C.w / sx).toFixed(5) + ',' + (R.h / C.h / sy).toFixed(5) + ')' }); }
    var zeit = { duration: 820, easing: 'linear', fill: 'forwards' }, lauf = g.animate(fk, zeit), weg = function () { if (g.parentNode) g.parentNode.removeChild(g); };
    b.animate(fi, zeit);
    return { g: g, lauf: lauf, weg: weg };
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.sth'); if (!t || !w.contains(t) || document.documentElement.classList.contains('ce-ruhig')) return;
    var alt = w.querySelector('.sth[aria-pressed="true"]'); if (!alt || alt === t) return;
    [].forEach.call(w.querySelectorAll('.sb-flug'), function (g) { g.parentNode.removeChild(g); });
    /* Robert 17.10.2026: nie doppelt, nichts über dem Text. Nur das neue Foto fliegt (unter der Textspalte, die liegt darüber), das alte bleibt auf der Bühne
       stehen und fliegt nicht mehr zurück; main.js wartet mit dem Wechsel auf w._flug und schaltet bei der Landung um, erst dann geht der Abzug weg. */
    var bn = t.querySelector('.sth__b'), imN = bn && bn.querySelector('img'), ziel = w.querySelector('.sbuehne__bild[data-bild="' + t.getAttribute('data-i') + '"]');
    if (!imN || !ziel) return;
    var gross = ziel.querySelector('img'), fertig;
    w._flug = new Promise(function (r) { fertig = r; });
    requestAnimationFrame(function () {
      var f = abzug(gross && gross.complete && gross.naturalWidth ? gross : imN, bn.getBoundingClientRect(), buehne.getBoundingClientRect(), 6, getComputedStyle(buehne).borderRadius);
      var ende = function () {
        fertig(); w._flug = null;
        var n = 0; (function warte() { if (ziel.classList.contains('an') || ++n > 90) { requestAnimationFrame(f.weg); return; } requestAnimationFrame(warte); })();
      };
      f.lauf.onfinish = ende; f.lauf.oncancel = function () { fertig(); w._flug = null; f.weg(); };
    });
  }, true);
})();

/* Packages: Auswahl nach Anlass und Pfeile (Robert 15.10.2026) */
(function () {
  document.querySelectorAll('.pk9-wrap').forEach(function (w) {
    var g = w.querySelector('.pk9-g'), sec = w.closest('section') || document;
    /* Hereinschweben nach der Uhr, sobald die Reihe ins Bild kommt (Robert 15.10.2026) */
    /* Robert 16.10.2026 («krachelig … hakeln unschön ein»): kein Einflug nach der Uhr mehr, die Reihe schwebt nur noch am Scrollen herauf (seitenbau.css) */
    if (false) {
      g.classList.add('pk-bereit');
      var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { g.classList.add('schwebt'); pio.disconnect(); } }); }, { rootMargin: '0px 0px -18% 0px' });
      pio.observe(g);
      g.addEventListener('animationend', function (e) { if (e.animationName === 'pkRein') e.target.classList.add('pk-fertig'); });
    }
    /* Robert 16.10.2026 (Safari, «kein Effekt mehr»): Hereinschweben am Scrollen per Skript, damit es in jedem Browser läuft.
       Jede Kachel steigt von unten auf, die rechte etwas später; nur translate, kein Nachfedern, folgt genau dem Scrollen */
    /* Robert 16.10.2026, 19:40: «nicht zusätzlich scrollen, die Karten einfach hochgeschleppt»: nicht mehr ans Scrollen gekoppelt.
       Sobald die Reihe ins Bild kommt, steigen die Kacheln einmal nach der Uhr auf (wie region.html), deckend, nur translate, ohne Nachfedern. */
    if (w.closest('#pakete') && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      g.classList.add('pk-uhr');
      var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { g.classList.add('pk-auf'); pio.disconnect(); } }); }, { rootMargin: '0px 0px -12% 0px' });
      pio.observe(g);
    }
    function schritt() { var k = g.querySelector('.pk9'); return k ? k.getBoundingClientRect().width + parseFloat(getComputedStyle(g).columnGap || 0) : g.clientWidth; }
    sec.querySelectorAll('[data-pk-weiter]').forEach(function (b) {
      b.addEventListener('click', function () { g.scrollBy({ left: schritt() * +b.getAttribute('data-pk-weiter'), behavior: 'smooth' }); });
    });
    w.querySelectorAll('[data-pk-anlass]').forEach(function (t) {
      t.addEventListener('click', function () {
        var a = t.getAttribute('data-pk-anlass'), erste = null;
        w.querySelectorAll('[data-pk-anlass]').forEach(function (x) { x.classList.toggle('an', x === t); });
        g.classList.toggle('gewaehlt', a !== '0');
        g.querySelectorAll('.pk9').forEach(function (k) {
          var drin = k.getAttribute('data-pk-gruppen').split(' ').indexOf(a) >= 0;
          k.classList.toggle('weg', !drin);
          if (drin && !erste) erste = k;
        });
        g.scrollTo({ left: 0, behavior: 'auto' });   /* Robert 15.10.2026: nur die passenden Kacheln, von der Mitte aus */
      });
    });
  });
})();

