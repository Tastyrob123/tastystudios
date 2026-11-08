/* Berghotel Gasterntal — Gäste-Funktionen (Tasty Studios, 10.10.2026, Vorlage Carlton-Europe, Waldhotel Doldenhorn, Landgasthof Ruedihus)
   Anfrage mit Zimmer, Anreise und Hund · Tisch, Sauna und Transport anfragen · Gewitter-Hinweis für die Strasse · Hotel exklusiv mit Richtpreis ·
   Gutschein online · Vor Ihrer Anreise · Zahlen fürs Haus. Preise aus den Listen des Hauses (#dn-daten), Wetter aus /api/dienste, nichts geschätzt. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var DATEN = {}; try { DATEN = JSON.parse(($('#dn-daten') || {}).textContent || '{}'); } catch (e) {}
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var chf = function (n, nachkomma) {
    var neg = n < 0; n = Math.abs(n);
    var r = Math.round(n * 100) / 100, ganz = Math.floor(r), rest = Math.round((r - ganz) * 100);
    var t = String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return (neg ? '-' : '') + ((nachkomma || rest) ? t + '.' + (rest < 10 ? '0' : '') + rest : t);
  };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var tageZw = function (a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); };
  var TAGE_L = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var transport = function (p) { return Math.max((DATEN.transport || 0) * p, DATEN.transport_min || 0); };
  var schalter = function (wurzel, wenn) {   // Ja/Nein ohne Punkte: gewählt = Fläche
    var w = 0;
    $$('[data-hund]', wurzel).forEach(function (b) { b.addEventListener('click', function () { w = +b.dataset.hund; $$('[data-hund]', wurzel).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); if (wenn) wenn(w); }); });
    return function () { return w; };
  };

  /* ---------- Zahlen fürs Haus: was angeklickt wird, ohne Keks, ohne Adresse, ohne Namen ---------- */
  var SEITE = location.pathname.split('/').pop() || 'index.html', LAND = ((navigator.language || '').split('-')[1] || '').toUpperCase().slice(0, 2);
  function zaehle(t, mehr) {
    if (navigator.webdriver || !window.fetch || /\/(entwurf|vorher)\//.test(location.pathname)) return;
    var d = { t: t, s: SEITE, sp: 'de', l: LAND }; for (var k in mehr) d[k] = mehr[k];
    var roh = JSON.stringify(d);
    try { if (navigator.sendBeacon && navigator.sendBeacon('/api/zahlen', new Blob([roh], { type: 'application/json' }))) return; } catch (e) {}
    try { fetch('/api/zahlen', { method: 'POST', headers: { 'content-type': 'application/json' }, body: roh, keepalive: true }).catch(function () {}); } catch (e) {}
  }
  zaehle('seite');
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-buchen]'); if (b) zaehle('buchen', { p: b.getAttribute('data-buchen') || '' }); }, true);
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.tagName === 'SELECT' && t.closest('.dn-sel, .dn-karte-dunkel')) t.blur(); });

  /* ---------- Wetter ---------- */
  var icon = function (c, tag) {
    var s = '<svg viewBox="0 0 32 32" aria-hidden="true">';
    if (c <= 1) s += tag === 0 ? '<path d="M20 6a10 10 0 1 0 6 16A12 12 0 0 1 20 6Z"/>' : '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';
    else if (c <= 3 || (c >= 45 && c < 50)) s += (c === 2 ? '<circle cx="12" cy="11" r="4.5"/>' : '') + '<path d="M9 25h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 25Z"/>';
    else if (c >= 95) s += '<path d="M9 19h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 19Z"/><path d="m16 20-3 5h4l-2 5"/>';
    else if ((c >= 71 && c < 80) || c === 85 || c === 86) s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="M11 24v4M16 23v4M21 24v4"/>';
    else s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="m11 23-1.5 4M16 23l-1.5 4M21 23l-1.5 4"/>';
    return s + '</svg>';
  };
  function belebe(wurzel) {
    $$('[data-anim]', wurzel).forEach(function (el) {
      if (RUHIG) { el.classList.add('dn-los', 'dn-ruhig'); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('dn-los'); }); });
      $$('[data-hoch]', el).forEach(function (z) {
        var ziel = +z.getAttribute('data-hoch'), zeile = z.closest('[style*="--i"]'), i = zeile ? +zeile.style.getPropertyValue('--i') || 0 : 0, start = null;
        var schritt = function (t) { if (start === null) start = t; var p = Math.min(1, Math.max(0, (t - start - 250 - i * 140) / 1100)), e = 1 - Math.pow(1 - p, 3); z.textContent = p < 1 ? chf(Math.round(ziel * e)) : chf(ziel); if (p < 1) requestAnimationFrame(schritt); };
        z.textContent = chf(0); requestAnimationFrame(schritt);
      });
    });
  }
  var sturm = function (t) { return t && (t.code >= 95 || t.code === 65 || t.code === 82); };   // Gewitter oder Starkregen laut Vorhersage
  function gewitter(tage) {
    var t = tage.filter(sturm)[0], box = $$('[data-gewitter]');
    if (!t) { box.forEach(function (b) { b.hidden = true; }); return; }
    var d = new Date(t.datum + 'T12:00'), heute = t.datum === iso(new Date()), morgen = t.datum === iso(new Date(Date.now() + 864e5));
    var wann = heute ? 'heute' : morgen ? 'morgen' : 'am ' + TAGE_L[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
    var was = t.code >= 95 ? 'Gewitter' : 'Starkregen';
    box.forEach(function (b) { b.innerHTML = '<span class="dn-gewitter__ic">' + icon(t.code, 1) + '</span><div><b>Für ' + wann + ' sagt die Vorhersage ' + was + ' an.</b><p>«' + esc(DATEN.sperrung) + '» Vor der Fahrt kurz anrufen: <a href="tel:+41336758181">' + esc(DATEN.tel) + '</a></p></div>'; b.hidden = false; });
  }
  var WETTER = null;
  var holeWetter = function () { if (!WETTER) WETTER = fetch('/api/dienste?was=wetter').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); return WETTER; };
  if ($('[data-gewitter]') && window.fetch) holeWetter().then(function (w) { if (w.selden) gewitter(w.selden.tage.slice(0, 2)); }).catch(function () {});

  function reiseWetter(an, ab, ziel) {
    if (!ziel || !an || !ab || !window.fetch) return;
    ziel.innerHTML = '';
    fetch('/api/dienste?was=reisewetter&an=' + an + '&ab=' + ab).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var L = w.tage.filter(function (t) { return t.max != null; });
      if (!L.length) return;
      var vh = L.some(function (t) { return t.art === 'vorhersage'; }), mi = L.some(function (t) { return t.art === 'mittel'; });
      var karten = L.map(function (t, i) {
        var d = new Date(t.datum + 'T12:00'), mittel = t.art === 'mittel';
        return '<div class="dn-rw__tag" style="--i:' + i + '"><span class="dn-rw__wt">' + TAGE_L[d.getDay()] + '</span><span class="dn-rw__dt">' + d.getDate() + '.' + (d.getMonth() + 1) + '.</span>' +
          '<span class="dn-rw__ic">' + (mittel ? '<i class="dn-rw__oe">Ø</i>' : icon(t.code, 1)) + '</span>' +
          '<b class="dn-rw__max"><span data-hoch="' + Math.round(t.max) + '">' + Math.round(t.max) + '</span>°</b><span class="dn-rw__min">' + Math.round(t.min) + '°</span>' +
          (t.regen != null ? '<span class="dn-rw__nass"><i style="--h:' + Math.max(.04, t.regen / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em>' : '') + '</div>';
      }).join('');
      var fuss = (vh ? 'Mit Zeichen: Vorhersage.' : '') + (vh && mi ? ' ' : '') + (mi ? 'Mit Ø: gemessenes Mittel dieser Tage ' + w.jahre + ', ' + (w.klima || 'MeteoSchweiz') + ' (Station auf ähnlicher Höhe), keine Vorhersage.' : '');
      ziel.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Wetter in Selden für Ihre Tage</span></div><div class="dn-rw__reihe">' + karten + '</div><p class="dn-edel__satz">' + fuss + '</p></div>';
      var wv = ziel.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', L.length);
      belebe(ziel);
      gewitter(L.filter(function (t) { return t.art === 'vorhersage'; }));
    }).catch(function () {});
  }

  /* ---------- Reiter «Zimmer»: Zimmer, Anreise, Hund → Preis laut Liste und Kosten der Anreise, alles in die Anfrage ---------- */
  var dlg = $('dialog.buchen'), zf = dlg && $('form[data-zimmer]', dlg);
  if (zf) (function () {
    var hund = schalter(zf, function () { neu(); }), rp = $('[data-richtpreis]', zf), el = zf.elements;
    var naechte = function () { return el.an.value && el.ab.value ? Math.max(1, tageZw(el.an.value, el.ab.value)) : 0; };
    function zeilen() {
      var z = [], kosten = 0, zi = DATEN.zimmer[+el.zimmer.value], g = +el.gaeste.value || 1, n = naechte();
      if (el.zimmer.value !== '' && zi) z.push(['Zimmer: ' + zi.name + (zi.zusatz ? ', ' + zi.zusatz : '') + ', laut Preisliste ' + zi.preis.replace(/^Von /, 'von '), null]);
      if (el.weg.value === 'auto') { z.push(['Bewilligung für das Auto, Hin- und Rückfahrt', DATEN.bewilligung]); kosten += DATEN.bewilligung; if (n > 4) z.push(['Bei mehr als 4 Tagen gibt es die Jahresbewilligung für CHF ' + DATEN.jahres + '.', null]); }
      if (el.weg.value === 'transport') { var t = transport(g); z.push(['Transport ab Kandersteg, ' + g + ' × CHF ' + DATEN.transport + (t > DATEN.transport * g ? ', mindestens CHF ' + DATEN.transport_min : ''), t]); kosten += t; }
      if (el.weg.value === 'bus') z.push(['Anreise mit dem Bus oder zu Fuss', null]);
      if (hund()) z.push(['Ein Hund kommt mit', null]);
      return { z: z, kosten: kosten };
    }
    function neu() {
      var r = zeilen();
      rp.innerHTML = r.z.map(function (x) { return '<span>' + esc(x[0]) + (x[1] ? '<b>CHF ' + chf(x[1]) + '</b>' : '') + '</span>'; }).join('');
      rp.hidden = !r.z.length;
    }
    zf._extra = function () { var r = zeilen(); return r.z.length ? '\n' + r.z.map(function (x) { return x[0] + (x[1] ? ': CHF ' + chf(x[1], true) : ''); }).join('\n') + '\n' : ''; };
    zf.addEventListener('change', neu); zf.addEventListener('click', function () { setTimeout(neu, 0); }); neu();
    zf.addEventListener('submit', function () { zaehle('formular', { f: 'zimmer', z: el.zimmer.value !== '' && DATEN.zimmer[+el.zimmer.value] ? DATEN.zimmer[+el.zimmer.value].name.slice(0, 40) : '' }); });
  })();

  /* ---------- Reiter «Tisch und Sauna»: Tisch, Sauna oder Transport → Anfrage per E-Mail ---------- */
  $$('form[data-tisch]').forEach(function (t) {
    var el = t.elements, info = $('p[data-info]', t), preis = $('[data-preis]', t);
    el.tag.min = iso(new Date()); el.tag.value = iso(new Date());
    function neu() {
      var o = el.was.options[el.was.selectedIndex], p = +el.pers.value || 1, was = el.was.value, txt = '';
      info.textContent = o.getAttribute('data-info') || '';
      if (was === 'sauna' && DATEN.sauna) txt = 'Sauna: CHF ' + DATEN.sauna + ' pauschal' + (DATEN.sauna_gast ? ', für Hotelgäste CHF ' + DATEN.sauna_gast : '');
      if (was === 'transport') txt = 'Transport: CHF ' + chf(transport(p));
      if (was === 'sauna' && el.tag.value === iso(new Date())) {
        var jetzt = new Date(), z = (el.zeit.value || '00:00').split(':'), w = new Date(); w.setHours(+z[0], +z[1], 0, 0);
        if (w - jetzt < 2 * 36e5) txt += (txt ? '. ' : '') + 'Für heute frühestens ' + ('0' + new Date(jetzt.getTime() + 2 * 36e5).getHours()).slice(-2) + ':' + ('0' + new Date(jetzt.getTime() + 2 * 36e5).getMinutes()).slice(-2) + ' Uhr.';
      }
      preis.textContent = txt; preis.hidden = !txt;
      el.zeit.value = el.zeit.value || (was === 'sauna' ? '17:00' : '12:00');
    }
    t.addEventListener('change', neu); neu();
    t.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new Date(el.tag.value + 'T12:00'), wasT = el.was.options[el.was.selectedIndex].text;
      var z = ['Reservation: ' + wasT, 'Tag: ' + TAGE_L[d.getDay()] + ', ' + d.toLocaleDateString('de-CH'), 'Uhrzeit: ' + el.zeit.value, 'Personen: ' + el.pers.value, 'Name: ' + el.name.value];
      if (preis.textContent) z.push(preis.textContent);
      if (el.wunsch.value) z.push('Wünsche: ' + el.wunsch.value);
      zaehle('tisch', { p: el.was.value });
      if (window.bgSchreibe) return window.bgSchreibe(wasT + ', ' + d.toLocaleDateString('de-CH'), z, el.tag.value, +el.pers.value);   // Robert 17.10.2026: Anfrage-Fenster auf der Seite statt Mailprogramm (assets/js/anfrage.js)
      location.href = 'mailto:' + (DATEN.mail || '') + '?subject=' + encodeURIComponent(wasT + ', ' + d.toLocaleDateString('de-CH')) + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
  });

  /* ---------- Drucken ---------- */
  function drucke(html) {
    var d = $('#dn-druck') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dn-druck' }));
    d.innerHTML = html; doc.classList.add('dn-druckt');
    var weg = function () { doc.classList.remove('dn-druckt'); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    setTimeout(function () { window.print(); setTimeout(weg, 1500); }, 60);
  }
  var MARKE = function () { var h = $('.buchen__t svg.hand'); return '<div class="dn-d-marke">' + (h ? h.outerHTML : '<b>Berghotel Gasterntal</b>') + '</div>'; };
  var ADRESSE = 'Berghotel Gasterntal · Selden · 3718 Kandersteg · ' + (DATEN.tel || '') + ' · ' + (DATEN.mail || '');

  /* ---------- Das Hotel exklusiv: Gäste → Richtpreis aus den Preisen des Hauses ---------- */
  $$('form[data-exklusiv]').forEach(function (box) {
    var X = DATEN.exklusiv || {}, el = box.elements, stand = null;
    var n = function (k) { return Math.max(0, parseInt(el[k].value, 10) || 0); };
    function rechne() {
      var erw = n('erw'), ki = n('kinder'), alle = erw + ki, zeilen = [], summe = X.basis || 0;
      var kiBasis = Math.min(ki, X.ab), extraKi = ki - kiBasis, extraErw = Math.max(0, alle - X.ab - extraKi);   // die ersten Plätze zählen zuerst für die Kinder, so steht nie zu wenig da
      zeilen.push(['Das ganze Hotel, ab ' + X.ab + ' Personen (Erwachsene und Kinder)', X.basis]);
      if (extraErw && X.weitere) { zeilen.push(['Jede weitere Person, ' + extraErw + ' × CHF ' + chf(X.weitere), extraErw * X.weitere]); summe += extraErw * X.weitere; }
      if (extraKi && X.kind) { zeilen.push([X.kind_text + ', ' + extraKi + ' × CHF ' + chf(X.kind), extraKi * X.kind]); summe += extraKi * X.kind; }
      var satz = alle < X.ab ? 'Der Preis gilt ab ' + X.ab + ' Personen. Für ' + alle + ' Gäste bleibt es beim Grundpreis.' :
        DATEN.nacht && alle > DATEN.nacht ? 'Über Nacht haben bis zu ' + DATEN.nacht + ' Personen Platz, am Fest bis zu ' + DATEN.maxfest + '.' : alle + ' Gäste, Zimmer und Bettenlager.';
      $('[data-summe]', box).textContent = chf(summe);
      $('[data-zeilen]', box).innerHTML = zeilen.map(function (z) { return '<li><span>' + esc(z[0]) + '</span><b>' + chf(z[1], true) + '</b></li>'; }).join('');
      $('[data-saal]', box).textContent = satz;
      stand = { zeilen: zeilen, summe: summe, alle: alle, satz: satz };
    }
    box.addEventListener('input', rechne); box.addEventListener('change', rechne);
    $('[data-offerte]', box).addEventListener('click', function () {
      var datum = el.datum.value ? new Date(el.datum.value).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'noch offen';
      drucke('<div class="dn-blatt-druck">' + MARKE() + '<p class="dn-d-kl">' + esc(ADRESSE) + '</p><h1>Erster Entwurf <em>Das Hotel exklusiv</em></h1><p class="dn-d-kl">Stand ' + new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · Datum: ' + datum + ' · ' + stand.alle + ' Gäste · ' + esc(el.anlass.value) + '</p>' +
        '<table>' + stand.zeilen.map(function (z) { return '<tr><td>' + esc(z[0]) + '</td><td>CHF ' + chf(z[1], true) + '</td></tr>'; }).join('') + '<tr class="dn-d-summe"><td>Richtpreis</td><td>CHF ' + chf(stand.summe, true) + '</td></tr></table>' +
        '<p>' + esc(stand.satz) + '</p><p class="dn-d-kl">Erster Entwurf nach den Preisen des Hauses für eine Nacht, keine Offerte und keine Bestätigung. Inbegriffen: Übernachtung mit Frühstück, Aperitif, rustikales Nachtessen (3 Gänge), Wein, Mineral und Kaffee, Digestiv. Exklusive Kurtaxe. Die verbindliche Offerte schreibt Ihnen das Haus.</p></div>');
    });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Das Hotel exklusiv', 'Anlass: ' + el.anlass.value, 'Datum: ' + (el.datum.value || 'offen'), 'Erwachsene: ' + n('erw'), 'Kinder ab 6 Jahren: ' + n('kinder')].concat(stand.zeilen.map(function (x) { return x[0] + ': CHF ' + chf(x[1], true); }));
      z.push('Richtpreis (erster Entwurf): CHF ' + chf(stand.summe, true)); if (el.name.value) z.push('Name: ' + el.name.value); if (el.wunsch.value) z.push('Wünsche: ' + el.wunsch.value);
      zaehle('formular', { f: 'exklusiv' });
      if (window.bgSchreibe) return window.bgSchreibe('Das Hotel exklusiv, ' + el.anlass.value, z, el.datum.value, n('erw') + n('kinder'));   // Robert 17.10.2026: Anfrage-Fenster auf der Seite statt Mailprogramm (assets/js/anfrage.js)
      location.href = 'mailto:' + DATEN.mail + '?subject=' + encodeURIComponent('Das Hotel exklusiv, ' + el.anlass.value) + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
    rechne();
  });

  /* ---------- Gutschein online: Wert, Sauna oder Package, Bezahlschritt als Probe, Gutschein als PDF ---------- */
  $$('form[data-gutschein]').forEach(function (fo) {
    var el = fo.elements, art = 'wert', nr = '', teile = $$('[data-teil]', fo), schritt = $('.dn-gs', fo), reihe = $('.dn-betraege', fo), P = DATEN.package || [];
    reihe.innerHTML = [50, 100, 200, 300].map(function (b) { return '<button class="taste" type="button" data-betrag="' + b + '">CHF ' + b + '</button>'; }).join('');
    el.paket.innerHTML = P.map(function (p, i) { return '<option value="' + i + '">' + esc(p.name.split(' pro Person')[0].split(' im ')[0]) + '</option>'; }).join('');
    function wert() {
      if (art === 'sauna') return DATEN.sauna || 0;
      if (art === 'package') return (+el.anzahl.value || 1) * ((P[+el.paket.value] || {}).preis || 0);
      return Math.max(0, +el.betrag.value || 0);
    }
    function was() {
      if (art === 'sauna') return 'Sauna in der alten Käserei, 90 Minuten, pauschal für 1 bis 4 Personen';
      if (art === 'package') return 'Package Einfach – Luxuriös, ' + el.anzahl.value + ' × ' + ((P[+el.paket.value] || {}).name || '') + ': 1 Nacht im Berghotel Gasterntal, 1 Nacht im Waldhotel Doldenhorn';
      return 'Wertgutschein';
    }
    function neu() {
      fo.setAttribute('data-art', art);
      $$('[data-nur-art]', fo).forEach(function (t) { t.hidden = t.getAttribute('data-nur-art').split(' ').indexOf(art) < 0; });
      $$('[data-betrag]', reihe).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.betrag === el.betrag.value)); });
      (function (n) { if (n) n.textContent = chf(wert()); })($('[data-wert]', fo));  // fehlt das Feld (Text im Studio umgeschrieben), läuft der Rest weiter
      (function (n) { if (n) n.textContent = art === 'package' ? 'Wert, ab' : 'Wert'; })($('.dn-gs-summe .mono', fo));
    }
    $$('[data-art]', fo).forEach(function (b) { b.addEventListener('click', function () { art = b.getAttribute('data-art'); $$('[data-art]', fo).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); neu(); }); });
    reihe.addEventListener('click', function (e) { var b = e.target.closest('[data-betrag]'); if (b) { el.betrag.value = b.dataset.betrag; neu(); } });
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    function karte() {
      return '<div class="dn-gk"><span class="mono">Gutschein · Berghotel Gasterntal</span><b class="dn-gk__wert">CHF ' + chf(wert()) + '</b><span class="dn-gk__was">' + esc(was()) + '</span>' +
        (el.fuer.value ? '<span class="dn-gk__fuer">für ' + esc(el.fuer.value) + '</span>' : '') + (el.widmung.value ? '<span class="dn-gk__widmung">«' + esc(el.widmung.value) + '»</span>' : '') +
        (el.von.value ? '<span class="dn-gk__von">von ' + esc(el.von.value) + '</span>' : '') + (nr ? '<span class="dn-gk__nr">Gutschein-Nummer ' + nr + '</span>' : '') + '</div>';
    }
    function zeige(html) { teile.forEach(function (t) { t.hidden = true; }); $$('.tabs--rechner', fo).forEach(function (t) { t.hidden = true; }); schritt.hidden = false; schritt.innerHTML = html; }
    function anfang() { nr = ''; teile.forEach(function (t) { t.hidden = false; }); $$('.tabs--rechner', fo).forEach(function (t) { t.hidden = false; }); schritt.hidden = true; schritt.innerHTML = ''; neu(); }
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      zeige(karte() + '<p class="dn-gs__satz">Probe: In diesem Entwurf wird nichts abgebucht. Mit dem Zahlungsanbieter des Hauses läuft hier die echte Zahlung, und der Gutschein geht von selbst per E-Mail hinaus.</p><div class="knoepfe"><button class="kn" type="button" data-zahlen>Bezahlen CHF ' + chf(wert()) + '<i>' + PFEIL + '</i></button><button class="kn kn--dunkel" type="button" data-aendern>Ändern<i>' + PFEIL + '</i></button></div>');
    });
    schritt.addEventListener('click', function (e) {
      if (e.target.closest('[data-aendern]')) return anfang();
      if (e.target.closest('[data-neu]')) { fo.reset(); return anfang(); }
      if (e.target.closest('[data-zahlen]')) {
        var t = new Date(); nr = 'BG-' + String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        zaehle('formular', { f: 'gutschein' });
        zeige('<p class="dn-gs__ok">Bezahlt.</p>' + karte() + '<p class="dn-gs__satz">Ihr Gutschein ist fertig. Sichern Sie ihn als PDF, drucken Sie ihn aus oder schicken Sie ihn weiter.</p><div class="knoepfe"><button class="kn" type="button" data-pdf>Gutschein als PDF<i>' + PFEIL + '</i></button><button class="kn kn--dunkel" type="button" data-neu>Neuer Gutschein<i>' + PFEIL + '</i></button></div>');
      }
      if (e.target.closest('[data-pdf]')) drucke('<div class="dn-gutschein-druck">' + MARKE() + karte() + '<p class="dn-d-kl">' + esc(ADRESSE) + '</p></div>');
    });
  });

  /* ---------- Vorschlag aus dem Haus: klar → draussen im Tal, nass → Sauna ---------- */
  var istKlar = function (t) { return t && t.code <= 2 && t.wolken < 35 && (t.regen == null || t.regen < 40); };
  function vorschlag(box, tage) {
    if (!box) return;
    var klar = tage.filter(istKlar)[0], titel, satz, kn;
    var knA = function (t, h, dunkel) { return '<a class="kn kn--klein' + (dunkel ? ' kn--dunkel' : '') + '" href="' + h + '">' + t + '<i>' + PFEIL + '</i></a>'; };
    if (klar) {
      var d = new Date(klar.datum + 'T12:00');
      titel = [klar.datum === iso(new Date()) ? 'Heute klar' : 'Am ' + TAGE_L[d.getDay()] + ' klar', 'im Tal.']; satz = 'Ein Tag draussen: die Hängebrücke über die Kander gleich bei Selden, die Weiden und der Talboden. Am Abend Fondue in der Stube.'; kn = knA('Ässe u trinke', 'essen.html') + knA('Der Weg hinauf', 'index.html#weg', true);
    } else {
      titel = ['Ein Tag', 'für die Sauna.']; satz = '90 Minuten in der alten Käserei, mit Holz eingeheizt' + (DATEN.sauna_gast ? ', für Hotelgäste CHF ' + DATEN.sauna_gast : '') + '. Reservation mindestens 2 Stunden im Voraus.'; kn = knA('Zur Sauna', 'index.html#sauna') + knA('Ässe u trinke', 'essen.html', true);
    }
    box.innerHTML = '<div><h3 class="d3">' + titel[0] + ' <span class="akz">' + titel[1] + '</span></h3><p>' + satz + '</p><div class="knoepfe">' + kn + '</div></div>';
    box.hidden = false;
  }

  /* ---------- Vor Ihrer Anreise ---------- */
  $$('form[data-anreise]').forEach(function (fo) {
    var el = fo.elements, q = new URLSearchParams(location.search), hund = schalter(fo, function () { neu(); });
    el.an.min = iso(new Date());
    ['an', 'ab'].forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(q.get(k) || '')) el[k].value = q.get(k); });
    if (q.get('name')) el.name.value = q.get('name').slice(0, 80);
    if (q.get('nr')) el.nr.value = q.get('nr').slice(0, 40);
    var wf = $('[data-anreise-wetter]', fo), vs = $('[data-vorschlag]', fo), stand = { z: [], extras: 0 };
    function wetter() {
      if (!wf) return;   // Wetter-Abschnitt entfernt (Robert 10.10.2026)
      if (!(el.an.value && el.ab.value && el.ab.value > el.an.value)) { wf.innerHTML = '<p class="dn-hinweis">Mit Anreise und Abreise steht hier das Wetter für Ihre Tage.</p>'; vs.hidden = true; var wv = wf.closest('[data-wv]'); if (wv) wv.removeAttribute('data-tage'); return; }
      reiseWetter(el.an.value, el.ab.value, wf);
      holeWetter().then(function (w) {
        var drin = (w.selden ? w.selden.tage : []).filter(function (t) { return t.datum >= el.an.value && t.datum <= el.ab.value; });
        if (drin.length) vorschlag(vs, drin); else vs.hidden = true;
      }).catch(function () { vs.hidden = true; });
    }
    function neu() {
      var z = [], extras = 0, w = el.weg.value, n = el.an.value && el.ab.value ? tageZw(el.an.value, el.ab.value) : 0;
      $$('[data-nur-weg]', fo).forEach(function (t) { t.hidden = t.getAttribute('data-nur-weg') !== w; });
      var info = $('[data-weg-info]', fo);
      z.push('Ankunft: ' + el.ankunft.value);
      if (w === 'auto') { info.textContent = 'Die Bewilligung erhalten Sie bei uns: CHF ' + DATEN.bewilligung + ' für die Hin- und Rückfahrt' + (n > 4 ? ', bei mehr als 4 Tagen die Jahresbewilligung für CHF ' + DATEN.jahres : '') + '.'; z.push('Anreise mit dem Auto, Bewilligung bei Ihnen: CHF ' + DATEN.bewilligung); extras += DATEN.bewilligung; }
      if (w === 'transport') { var p = +el.tpers.value || 1, t = transport(p); info.textContent = 'CHF ' + DATEN.transport + ' pro Person, mindestens CHF ' + DATEN.transport_min + '.'; z.push('Transport ab Kandersteg um ' + el.tzeit.value + ', ' + p + (p === 1 ? ' Person' : ' Personen') + ': CHF ' + chf(t)); extras += t; }
      if (w === 'bus') { info.textContent = 'Fahrplan des Gasternbus: kander-reisen.ch'; z.push('Anreise mit dem Bus oder zu Fuss'); }
      if (el.saunatag.value) { var sp = DATEN.sauna_gast || DATEN.sauna || 0; z.push('Sauna: ' + new Date(el.saunatag.value + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + el.saunazeit.value + ' Uhr' + (sp ? ': CHF ' + sp : '')); extras += sp; }
      if (el.tischtag.value) z.push('Tisch: ' + new Date(el.tischtag.value + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + el.tischzeit.value + ' Uhr, ' + el.tischpers.value + ' Personen');
      if (hund()) z.push('Ein Hund kommt mit');
      $('[data-extras]', fo).textContent = chf(extras);
      $('[data-wuensche]', fo).innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      stand = { z: z, extras: extras };
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', function (e) { neu(); if (e.target === el.an || e.target === el.ab) wetter(); }); neu(); wetter();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Name: ' + el.name.value, 'Buchungsnummer: ' + (el.nr.value || '-'), 'Anreise: ' + el.an.value, 'Abreise: ' + el.ab.value].concat(stand.z, ['Anreise und Extras: CHF ' + chf(stand.extras, true)]);
      zaehle('formular', { f: 'anreise' });
      if (window.bgSchreibe) return window.bgSchreibe('Vor der Anreise: ' + el.name.value + ', ' + el.an.value, z, el.an.value);   // Robert 17.10.2026: Anfrage-Fenster auf der Seite statt Mailprogramm (assets/js/anfrage.js)
      location.href = 'mailto:' + (DATEN.mail || '') + '?subject=' + encodeURIComponent('Vor der Anreise: ' + el.name.value + ', ' + el.an.value) + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
  });
})();
