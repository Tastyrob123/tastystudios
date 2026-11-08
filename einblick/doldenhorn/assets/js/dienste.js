/* Waldhotel Doldenhorn — Gäste-Funktionen (Tasty Studios, 10.10.2026, Vorlage Carlton-Europe)
   Zimmer-Finder mit Live-Preis aus dem Buchungssystem der Familie Maeder, echter Preisvergleich des Buchungssystems (Rate Match), Wetter für die
   gewählten Tage, Tisch-Anfrage, Zahlen fürs Haus. Preise kommen aus /api/dienste, nichts geschätzt. Fällt ein Dienst aus, bleibt der bisherige Weg. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var DATEN = {}; try { DATEN = JSON.parse(($('#dn-daten') || {}).textContent || '{}'); } catch (e) {}
  var ZIM = DATEN.zimmer || {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var chf = function (n, nachkomma) {
    var neg = n < 0; n = Math.abs(n);
    var r = Math.round(n * 100) / 100, ganz = Math.floor(r), rest = Math.round((r - ganz) * 100);
    var t = String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return (neg ? '-' : '') + ((nachkomma || rest) ? t + '.' + (rest < 10 ? '0' : '') + rest : t);
  };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var tageZw = function (a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); };
  var TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], TAGE_L = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);

  /* ---------- Zahlen fürs Haus: was angeklickt wird, ohne Keks, ohne Adresse, ohne Namen ---------- */
  var SEITE = location.pathname.split('/').pop() || 'index.html', LAND = ((navigator.language || '').split('-')[1] || '').toUpperCase().slice(0, 2);
  function zaehle(t, mehr) {
    if (navigator.webdriver || !window.fetch) return;
    var d = { t: t, s: SEITE, sp: 'de', l: LAND }; for (var k in mehr) d[k] = mehr[k];
    var roh = JSON.stringify(d);
    try { if (navigator.sendBeacon && navigator.sendBeacon('/api/zahlen', new Blob([roh], { type: 'application/json' }))) return; } catch (e) {}
    try { fetch('/api/zahlen', { method: 'POST', headers: { 'content-type': 'application/json' }, body: roh, keepalive: true }).catch(function () {}); } catch (e) {}
  }
  zaehle('seite');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-buchen]'); if (b) zaehle('buchen', { p: b.getAttribute('data-buchen') || '' });
    var a = e.target.closest && e.target.closest('a[href*="angebote.html#"]'); if (a) zaehle('package', { p: (a.getAttribute('href') || '').split('#')[1] || '' });
  }, true);

  /* ---------- Wetter-Zeichen ---------- */
  var WMO = ['klar', 'heiter', 'teils bewölkt', 'bedeckt', 'Nebel', 'Niesel', 'Regen', 'Schnee', 'Schauer', 'Schneeschauer', 'Gewitter'];
  var wmo = function (c) { var w = WMO; return c === 0 ? w[0] : c === 1 ? w[1] : c === 2 ? w[2] : c === 3 ? w[3] : c < 50 ? w[4] : c < 60 ? w[5] : c < 70 ? w[6] : c < 80 ? w[7] : c < 83 ? w[8] : c < 90 ? w[9] : w[10]; };
  var icon = function (c, tag) {
    var s = '<svg viewBox="0 0 32 32" aria-hidden="true">';
    if (c <= 1) s += tag === 0 ? '<path d="M20 6a10 10 0 1 0 6 16A12 12 0 0 1 20 6Z"/>' : '<circle cx="16" cy="16" r="6"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';
    else if (c <= 3 || (c >= 45 && c < 50)) s += (c === 2 ? '<circle cx="12" cy="11" r="4.5"/>' : '') + '<path d="M9 25h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 25Z"/>';
    else if ((c >= 71 && c < 80) || c === 85 || c === 86) s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="M11 24v4M16 23v4M21 24v4"/>';
    else s += '<path d="M9 20h14a5 5 0 0 0 0-10 7 7 0 0 0-13.4 2A4 4 0 0 0 9 20Z"/><path d="m11 23-1.5 4M16 23l-1.5 4M21 23l-1.5 4"/>';
    return s + '</svg>';
  };

  /* ---------- Auftritt: Zahlen zählen hoch, Bewegung sonst über CSS (transform, opacity) ---------- */
  function belebe(wurzel) {
    $$('[data-anim]', wurzel).forEach(function (el) {
      if (RUHIG) { el.classList.add('dn-los', 'dn-ruhig'); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('dn-los'); }); });
      $$('[data-hoch]', el).forEach(function (z) {
        var ziel = +z.getAttribute('data-hoch'), zeile = z.closest('[style*="--i"]'), i = zeile ? +zeile.style.getPropertyValue('--i') || 0 : 0, start = null;
        var schritt = function (t) {
          if (start === null) start = t;
          var p = Math.min(1, Math.max(0, (t - start - 250 - i * 140) / 1100)), e = 1 - Math.pow(1 - p, 3);
          z.textContent = p < 1 ? chf(Math.round(ziel * e)) : chf(ziel);
          if (p < 1) requestAnimationFrame(schritt);
        };
        z.textContent = chf(0); requestAnimationFrame(schritt);
      });
    });
  }

  /* ---------- Wetter für die Tage des Aufenthalts (bis 15 Tage voraus Vorhersage, sonst gemessenes Mittel der Station Adelboden, so beschriftet) ---------- */
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
      var fuss = (vh ? 'Mit Zeichen: Vorhersage.' : '') + (vh && mi ? ' ' : '') + (mi ? 'Mit Ø: gemessenes Mittel dieser Tage ' + w.jahre + ', ' + (w.klima || 'MeteoSchweiz') + ' (nächste Station auf ähnlicher Höhe), keine Vorhersage.' : '');
      ziel.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Wetter in Kandersteg für Ihre Tage</span></div><div class="dn-rw__reihe">' + karten + '</div><p class="dn-edel__satz">' + fuss + '</p></div>';
      var wv = ziel.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', L.length);   // bis drei Tage: Wetter und Vorschlag nebeneinander
      belebe(ziel);
    }).catch(function () {});
  }

  /* ---------- Preisvergleich: Goldbalken wachsen, Preise zählen hoch, die Ersparnis steht als Zahl beim Direktpreis ---------- */
  function vergleichHTML(o) {
    var alle = [o.wir].concat(o.portale.map(function (p) { return p.chf; })), hoechst = Math.max.apply(null, alle), spar = hoechst - o.wir;
    var zeile = function (name, klein, v, i, wir) {
      var weniger = wir && spar > 0 ? '<span class="dn-pv__weniger">CHF <span data-hoch="' + spar + '">' + chf(spar) + '</span> günstiger</span>' : '';
      return '<li class="dn-pv__z' + (wir ? ' dn-pv__z--wir' : '') + '" style="--i:' + i + '"><span class="dn-pv__n">' + esc(name) + (klein ? '<small>' + esc(klein) + '</small>' : '') + '</span>' +
        '<span class="dn-pv__spur"><i style="--w:' + Math.max(.08, v / hoechst).toFixed(3) + '"></i></span><span class="dn-pv__preis"><b>CHF <span data-hoch="' + v + '">' + chf(v) + '</span></b>' + weniger + '</span></li>';
    };
    return '<div class="dn-pv' + (o.beispiel ? ' dn-pv--beispiel' : '') + '" data-anim><div class="dn-edel__kopf"><span class="mono">Preisvergleich für Ihre Daten</span>' + (o.beispiel ? '<em>Beispielwerte</em>' : '') + '</div>' +
      '<ul class="dn-pv__liste">' + zeile('Direkt bei uns', o.klein, o.wir, 0, true) + o.portale.map(function (p, i) { return zeile(p.name, '', p.chf, i + 1, false); }).join('') + '</ul>' +
      (o.satz ? '<p class="dn-edel__satz">' + o.satz + '</p>' : '') + '</div>';
  }

  /* ---------- Buchen-Fenster: Foto passt zum Reiter (Zimmer: Haus am Abend, Tisch: Au Gourmet) ---------- */
  var dlgF = $('dialog.buchen'), tTisch = $('#t-tisch');
  if (dlgF && tTisch) {
    var setzeTab = function () { dlgF.setAttribute('data-tab', tTisch.getAttribute('aria-selected') === 'true' ? 'tisch' : 'zimmer'); };
    setzeTab(); new MutationObserver(setzeTab).observe(tTisch, { attributes: true, attributeFilter: ['aria-selected'] });
  }
  /* Auswahlfelder: nach der Wahl kein Rahmen mehr stehen lassen */
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.tagName === 'SELECT' && t.closest('.dn-karte-dunkel, .dn-tisch, .dn-gs-form, .dn-rechner, dialog.buchen')) t.blur(); });

  /* ---------- Zimmer-Finder im Buchen-Fenster ---------- */
  var dlg = $('dialog.buchen'), f = dlg && $('form[data-zimmer]', dlg);
  if (f) (function () {
    var g = f.elements.gaeste, panel = $('#b-zimmer', dlg), klein = $('.buchen__klein', panel), titelH = $('h2', dlg), titelAlt = titelH ? titelH.innerHTML : '';
    var lbl = g.closest('label'); if (lbl) $('span', lbl).textContent = 'Mit wem reisen Sie?';
    ['Allein', 'Zu zweit', 'Zu dritt', 'Zu viert'].forEach(function (t, i) { if (g.options[i]) g.options[i].textContent = t; });
    var knopf = $('button[type=submit]', f); if (knopf && knopf.firstChild) knopf.firstChild.nodeValue = 'Zimmer und Preise zeigen';
    var raum = document.createElement('div'); raum.className = 'dn-treffer'; raum.hidden = true; panel.appendChild(raum);
    function zurueck() { raum.hidden = true; raum.innerHTML = ''; f.hidden = false; if (klein) klein.hidden = false; if (titelH) titelH.innerHTML = titelAlt; dlg.classList.remove('dn-breit'); }
    $$('[data-buchen]').forEach(function (b) { b.addEventListener('click', zurueck); });
    var tT = $('#t-tisch', dlg);   // Reiter «Tisch» während der Treffer: eigener Titel, normales Fenster; zurück auf «Zimmer»: wieder die Treffer
    if (tT) new MutationObserver(function () {
      if (raum.hidden) return;
      var tisch = tT.getAttribute('aria-selected') === 'true';
      if (titelH) titelH.innerHTML = tisch ? titelAlt : 'Ihr <span class="gold">Zimmer.</span>';
      dlg.classList.toggle('dn-breit', !tisch);
    }).observe(tT, { attributes: true, attributeFilter: ['aria-selected'] });
    var link = function (an, ab, gz) { var gl = []; for (var i = 0; i < gz; i++) gl.push('A'); return f.getAttribute('action') + '?lang=DE&cur=CHF&in=' + an + '&out=' + ab + '&guests=' + encodeURIComponent(gl.join(',')); };
    var kopfZeile = function (an, ab, n, gz) {
      return '<p class="dn-treffer__kopf"><span>' + new Date(an).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' }) + ' – ' + new Date(ab).toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + (n === 1 ? 'eine Nacht' : n + ' Nächte') + ' · ' + (gz === 1 ? '1 Person' : gz + ' Personen') + '</span><button type="button" class="dn-zurueck" data-zurueck>Andere Daten</button></p>';
    };
    function karte(z, d, oben) {
      var info = ZIM[z.id] || { name: z.name }, fr = z.raten.filter(function (r) { return /Frühstück/i.test(r.essen); })[0], hp = z.raten.filter(function (r) { return /Halbpension/i.test(r.essen); })[0];
      var raten = (fr ? '<span class="dn-rate"><i>mit Frühstück</i><b>CHF ' + chf(fr.chf) + '</b></span>' : '') + (hp ? '<span class="dn-rate"><i>mit Halbpension</i><b>CHF ' + chf(hp.chf) + '</b></span>' : '');
      return '<article class="dn-zi' + (oben ? ' dn-zi--oben' : '') + '">' + (oben && info.bild ? '<span class="dn-zi__b"><img src="' + esc(info.bild) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
        '<div class="dn-zi__t">' + (oben ? '<span class="mono">Passt am besten</span>' : '') + '<h3>' + esc(info.name) + '</h3>' + (info.satz ? '<p>' + esc(info.satz) + '</p>' : '') +
        '<div class="dn-zi__raten">' + raten + '</div><small>für ' + (d.naechte === 1 ? 'eine Nacht' : d.naechte + ' Nächte') + ', alle Personen, exkl. Kurtaxe</small></div>' +
        '<a class="kn' + (oben ? '' : ' kn--klein kn--dunkel') + '" href="' + esc(link(d.an, d.ab, d.gaeste)) + '" target="_blank" rel="noopener" data-zimmer-wahl="' + esc(z.id) + '">Buchen<i>' + PFEIL + '</i></a></article>';
    }
    function zeige(d) {
      dlg.classList.add('dn-breit');
      var L = d.zimmer.slice(), haus = L.filter(function (z) { return !(ZIM[z.id] || {}).ruedihus; }), rue = L.filter(function (z) { return (ZIM[z.id] || {}).ruedihus; });
      if (!L.length) { raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + '<p class="dn-hinweis">Für diese Daten zeigt das Buchungssystem kein freies Zimmer. Versuchen Sie andere Daten oder rufen Sie uns an: ' + esc(DATEN.tel) + '.</p>'; return; }
      var best = (haus.length ? haus : L)[0], rest = haus.filter(function (z) { return z !== best; });
      var vg = '';
      if (d.portale && d.portale.length && d.unser) {
        var r = L.filter(function (z) { return z.raten.some(function (x) { return x.chf === d.unser; }); })[0];
        if (!r) { r = L.slice().sort(function (a, b) { return a.raten[0].chf - b.raten[0].chf; })[0]; d.unser = r.raten[0].chf; }   // der Vergleich nennt nur einen Preis, der auch in der Liste steht
        vg = vergleichHTML({ wir: d.unser, klein: r ? (ZIM[r.id] || {}).name + ((ZIM[r.id] || {}).ruedihus ? ', Landgasthof Ruedihus' : '') : '', portale: d.portale.map(function (p) { return { name: p.name, chf: p.chf }; }), satz: 'Vergleich des Buchungssystems der Familie Maeder für das günstigste Angebot dieser Daten: dasselbe Zimmer, dieselben Daten. Frühstück, Stornierung, Steuern und Verfügbarkeit nennt jeder Anbieter bei seinem Preis.' });
      }
      raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + karte(best, d, true) + vg +
        (rest.length ? '<p class="mono dn-treffer__mehr">Ebenfalls frei im Waldhotel</p>' + rest.map(function (z) { return karte(z, d, false); }).join('') : '') +
        (rue.length ? '<p class="mono dn-treffer__mehr">Gleich gegenüber im Landgasthof Ruedihus</p>' + rue.map(function (z) { return karte(z, d, false); }).join('') : '');
      zaehle('finder', { z: best.id }); belebe(raum);
    }
    /* Preisvergleich als Beispiel, wenn das Buchungssystem gerade keinen Preis liefert (Robert 17.10.2026: «ja auch stanarisieren», Vorlage Carlton-Europe).
       Alle Zahlen sind erfunden und stehen ausdrücklich so da. */
    function beispielVergleich(n) {
      var wir = 190 * n;
      return vergleichHTML({ wir: wir, klein: '', portale: [{ name: 'Booking.com', chf: Math.round(wir * 1.12) }, { name: 'Expedia', chf: Math.round(wir * 1.15) }], beispiel: true,
        satz: 'Beispiel mit erfundenen Zahlen, keine echten Preise. Auf beiden Seiten gleich: dasselbe Zimmer und dieselben Daten, mit Frühstück, gleiche Stornierung, inklusive Steuern und Kurtaxe. So erscheint der Vergleich, sobald das Buchungssystem des Hauses die Preise für Ihre Daten und die der Portale liefert.' });
    }
    function ohnePreis(an, ab, gz) {
      var n = Math.max(1, tageZw(an, ab)), d = { an: an, ab: ab, naechte: n, gaeste: gz };
      var ids = Object.keys(ZIM).filter(function (k) { return !ZIM[k].ruedihus; });
      dlg.classList.add('dn-breit');
      var karten = ids.map(function (k, i) { var z = ZIM[k]; return '<article class="dn-zi' + (i ? '' : ' dn-zi--oben') + '">' + (i ? '' : '<span class="dn-zi__b"><img src="' + esc(z.bild) + '" alt="" loading="lazy"></span>') + '<div class="dn-zi__t"><h3>' + esc(z.name) + '</h3><p>' + esc(z.satz) + '</p>' + (z.ab ? '<div class="dn-zi__raten"><span class="dn-rate"><i>ab</i><b>CHF ' + esc(chf(parseFloat(z.ab.replace(/[^\d.]/g, '')) || 0)) + '</b></span></div>' : '') + '<small>' + esc(z.pers) + (z.ab ? ' · pro Nacht, laut Preisliste des Hauses' : '') + '</small></div><a class="kn' + (i ? ' kn--klein kn--dunkel' : '') + '" href="' + esc(link(an, ab, gz)) + '" target="_blank" rel="noopener" data-zimmer-wahl="' + k + '">Preis und buchen<i>' + PFEIL + '</i></a></article>'; });
      raum.innerHTML = kopfZeile(an, ab, n, gz) + '<p class="dn-hinweis">Ab-Preise des Hauses. Den genauen Preis für Ihre Daten zeigt Ihnen das Buchungssystem.</p>' +
        karten[0] + beispielVergleich(n) + karten.slice(1).join('');
      belebe(raum);
      zaehle('finder', { z: ids[0] });
    }
    raum.addEventListener('click', function (e) {
      if (e.target.closest('[data-zurueck]')) { zurueck(); return; }
      var w = e.target.closest('[data-zimmer-wahl]'); if (w) zaehle('zimmer', { z: w.getAttribute('data-zimmer-wahl') });
    });
    document.addEventListener('submit', function (e) {
      if (e.target !== f || !window.fetch) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var an = f.elements.an.value, ab = f.elements.ab.value, gz = +g.value;
      f.hidden = true; if (klein) klein.hidden = true; raum.hidden = false; if (titelH) titelH.innerHTML = 'Ihr <span class="gold">Zimmer.</span>';
      raum.innerHTML = '<p class="dn-hinweis">Einen Moment, wir fragen die freien Zimmer ab.</p>';
      var url = '/api/dienste?was=preise&an=' + an + '&ab=' + ab + '&g=' + gz, hole = function () { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
      hole().catch(function () { return new Promise(function (ok) { setTimeout(ok, 1200); }).then(hole); })   // das Buchungssystem lässt Abfragen zeitweise nicht durch: ein zweiter Versuch
        .then(zeige).catch(function () { ohnePreis(an, ab, gz); });
    }, true);
  })();

  /* ---------- Tisch-Reiter: Lokal, Tag, Zeit, Personen, Menü → Anfrage per E-Mail ---------- */
  $$('form[data-tisch]').forEach(function (t) {
    var lokal = t.elements.lokal, zeit = $('.dn-tisch__zeit', t), karte = $('[data-karte-link]', t), tag = t.elements.tag;
    tag.min = iso(new Date()); tag.value = iso(new Date());
    var neu = function () { var o = lokal.options[lokal.selectedIndex]; zeit.textContent = o.getAttribute('data-zeit') || ''; karte.setAttribute('href', o.getAttribute('data-karte') || 'kueche.html'); };
    lokal.addEventListener('change', neu); neu();
    t.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new Date(tag.value + 'T12:00');
      var z = ['Lokal: ' + lokal.value, 'Tag: ' + TAGE_L[d.getDay()] + ', ' + d.toLocaleDateString('de-CH'), 'Uhrzeit: ' + t.elements.zeit.value, 'Personen: ' + t.elements.pers.value, 'Menü: ' + t.elements.menu.value, 'Name: ' + t.elements.name.value];
      if (t.elements.wunsch.value) z.push('Wünsche: ' + t.elements.wunsch.value);
      zaehle('tisch', { p: lokal.value });
      anfrage((DATEN.mail || ''), 'Tischreservation ' + lokal.value + ', ' + d.toLocaleDateString('de-CH'), z.join('\n'), tag.value, t.elements.pers.value);
    });
  });
  /* Anfragen gehen ins Anfrage-Fenster des Hauses (assets/js/anfrage.js), nie ins Mailprogramm (Robert 16.10.2026) */
  var anfrage = function (an, betreff, text, tag, personen) { if (window.DHAnfrage) window.DHAnfrage.oeffne({ an: an, betreff: betreff, text: text, tag: tag, personen: personen }); else location.href = 'mailto:' + an + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text); };
  /* ---------- Drucken: Entwurf und Gutschein als PDF (Druckansicht nur mit dem einen Blatt) ---------- */
  function drucke(html, randlos) {
    var d = $('#dn-druck') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dn-druck' }));
    d.innerHTML = html; doc.classList.add('dn-druckt');
    var seite = randlos ? document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '@page{size:A4;margin:0}' })) : null;   // randloses Blatt: ohne Kopf- und Fusszeilen des Browsers
    var weg = function () { doc.classList.remove('dn-druckt'); if (seite && seite.parentNode) seite.parentNode.removeChild(seite); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    var bilder = [].slice.call(d.querySelectorAll('img')).filter(function (im) { return !im.complete; }).map(function (im) { return new Promise(function (ok) { im.onload = im.onerror = ok; }); });
    var los = function () { window.print(); setTimeout(weg, 1500); };
    if (!bilder.length || !window.Promise) setTimeout(los, 60);
    else Promise.race([Promise.all(bilder), new Promise(function (ok) { setTimeout(ok, 4000); })]).then(function () { setTimeout(los, 60); });   // Foto und Wortmarke sollen im PDF stehen
  }
  /* Entwurf als Blatt im Stil des Briefbogens: nachtblauer Kopf mit der Wortmarke (sie trägt das Zeichen schon), Foto des Anlasses, Eckdaten, Posten, Richtpreis, Fuss mit Goldlinie */
  var FOTO = function (key) { var im = $('img[src*="assets/img/' + key + '-"]'); return im ? im.getAttribute('src').replace(/-[a-z]\.webp/, '-l.webp') : ''; };
  var MARKE = function () { var w = $('img[src*="wortmarke-leiste"]'); return w ? '<img class="dn-ent__marke" src="' + w.getAttribute('src') + '" alt="Waldhotel Doldenhorn Kandersteg">' : '<p class="dn-ent__name">Waldhotel Doldenhorn</p>'; };
  var LOGO = function () { var l = $('.fuss__logo img'); return l ? '<img src="' + l.getAttribute('src') + '" alt="Waldhotel Doldenhorn" style="width:62mm;height:auto">' : ''; };
  var ADRESSE = 'Waldhotel Doldenhorn · Doldenhornstrasse 26 · 3718 Kandersteg · ' + (DATEN.tel || '') + ' · ' + (DATEN.mail || '');

  /* ---------- Anfrage-Rechner Feste: Hochzeit oder Seminar ---------- */
  $$('form[data-rechner]').forEach(function (box) {
    var D; try { D = JSON.parse($('[data-rechner-daten]', box).textContent); } catch (e) { return; }
    var anlass = 'hochzeit', el = box.elements, stand = null;
    var n = function (k) { return Math.max(0, parseInt(el[k].value, 10) || 0); };
    function rechne() {
      var zeilen = [], summe = 0, hinweise = [], gaeste = 0;
      if (anlass === 'hochzeit') {
        var p = D.hochzeit[+el.paket.value] || D.hochzeit[0], erw = Math.max(1, n('erw')), ki = n('kinder'); gaeste = erw + ki;
        zeilen.push([p.name + ', ' + erw + ' × CHF ' + chf(p.preis, true), erw * p.preis]); summe += erw * p.preis;
        if (ki && p.kinder) { zeilen.push(['Kinder ' + p.kinder_alter + ', ' + ki + ' × CHF ' + chf(p.kinder, true), ki * p.kinder]); summe += ki * p.kinder; }
        if (el.spirit.checked) { zeilen.push(['Spirituosenwagen, ' + gaeste + ' × CHF ' + chf(D.spirit, true), gaeste * D.spirit]); summe += gaeste * D.spirit; }
        var h = +el.verl.value; if (h) { zeilen.push(['Verlängerung ' + h + ' Std., ' + gaeste + ' × ' + h + ' × CHF ' + chf(D.verl, true), gaeste * h * D.verl]); summe += gaeste * h * D.verl; }
        hinweise.push('Package bis ' + p.bis + ' Uhr. Übernachtung im Hochzeitszimmer ab 50 zahlenden Gästen inbegriffen.');
      } else {
        var ps = Math.max(1, n('pers')), tg = Math.max(1, n('tage')), nt = n('naechte'), S = D.seminar, preis = (el.zimmer.value === 'superior' ? S.superior : S.standard)[ps >= 8 ? 1 : 0]; gaeste = ps;
        zeilen.push(['Seminarpauschale ' + (el.zimmer.value === 'superior' ? 'Superiorzimmer' : 'Standardzimmer') + ', ' + ps + ' × ' + tg + ' Tage × CHF ' + chf(preis, true), ps * tg * preis]); summe += ps * tg * preis;
        if (el.gourmet.checked) { zeilen.push(['7-Gang-Gourmetmenü, ' + ps + ' × CHF ' + chf(S.gourmet, true), ps * S.gourmet]); summe += ps * S.gourmet; }
        if (el.halbtag.checked) { zeilen.push(['Zusätzlicher Halbtag, ' + ps + ' × CHF ' + chf(S.halbtag, true), ps * S.halbtag]); summe += ps * S.halbtag; }
        if (nt) { zeilen.push(['Energiezuschlag, ' + ps + ' × ' + nt + ' Nächte × CHF ' + chf(S.energie, true), ps * nt * S.energie]); summe += ps * nt * S.energie; }
        hinweise.push('Pauschalpreise pro Person und Tag, inklusive Kurtaxe und MwSt.' + (ps < 8 ? ' Bis 7 Personen gilt der höhere Pauschalpreis.' : ''));
      }
      var saal = D.saele.slice().sort(function (a, b) { return a.pers - b.pers; }).filter(function (x) { return x.pers >= gaeste; })[0];
      $('[data-summe]', box).textContent = chf(summe);
      $('[data-zeilen]', box).innerHTML = zeilen.map(function (z) { return '<li><span>' + esc(z[0]) + '</span><b>' + chf(z[1], true) + '</b></li>'; }).join('');
      $('[data-saal]', box).innerHTML = saal ? 'Passender Saal: <b>' + esc(saal.name) + '</b>, bis ' + saal.pers + ' Personen.' : 'So viele Gäste fasst kein einzelner Saal. Das Event-Team findet eine Lösung.';
      $('[data-hinweis]', box).textContent = hinweise.join(' ');
      stand = { zeilen: zeilen, summe: summe, saal: saal, gaeste: gaeste, hinweise: hinweise };
    }
    $$('[data-anlass]', box).forEach(function (b) { b.addEventListener('click', function () { anlass = b.getAttribute('data-anlass'); $$('[data-anlass]', box).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); $$('[data-nur]', box).forEach(function (t) { t.hidden = t.getAttribute('data-nur') !== anlass; }); rechne(); }); });
    box.addEventListener('input', rechne); box.addEventListener('change', rechne);
    var titelText = function () { return anlass === 'hochzeit' ? 'Hochzeit' : 'Seminar'; };
    $('[data-offerte]', box).addEventListener('click', function () {
      var datum = el.datum.value ? new Date(el.datum.value).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'noch offen';
      var heute = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }), hz = anlass === 'hochzeit', foto = FOTO(hz ? 'hochzeit' : 'seminar');
      drucke('<div class="dn-ent dn-ent--' + anlass + '">' +
        '<header class="dn-ent__kopf">' + MARKE() + '<span class="dn-ent__linie"></span>' +
          '<p class="dn-ent__kl">Erster Entwurf · Stand ' + heute + '</p><h1>' + (hz ? 'Ihre <em>Hochzeit.</em>' : 'Ihr <em>Seminar.</em>') + '</h1></header>' +
        (foto ? '<figure class="dn-ent__foto"><img src="' + foto + '" alt=""></figure>' : '<div class="dn-ent__ohne"></div>') +
        '<div class="dn-ent__eck"><div><span>Datum</span><b>' + esc(datum) + '</b></div><div><span>' + (hz ? 'Gäste' : 'Personen') + '</span><b>' + stand.gaeste + '</b></div>' +
          '<div><span>Saal</span><b>' + (stand.saal ? esc(stand.saal.name) : 'nach Absprache') + '</b>' + (stand.saal ? '<small>bis ' + stand.saal.pers + ' Personen</small>' : '') + '</div></div>' +
        '<section class="dn-ent__posten"><p class="dn-ent__kl">Ihre Zusammenstellung</p><table>' + stand.zeilen.map(function (z) { return '<tr><td>' + esc(z[0]) + '</td><td>' + chf(z[1], true) + '</td></tr>'; }).join('') + '</table>' +
          '<div class="dn-ent__summe"><span>Richtpreis</span><b><small>CHF</small>' + chf(stand.summe, true) + '</b></div></section>' +
        '<p class="dn-ent__hinweis">' + esc(stand.hinweise.join(' ')) + '</p>' +
        '<p class="dn-ent__klein">Erster Entwurf nach dem Hochzeitsflyer und dem Seminarflyer 2026 des Hauses, keine Offerte und keine Bestätigung. Der endgültige Preis hängt von vielen Dingen ab: Menü und Getränke, Raum, Dauer, Dekoration und Ihre Wünsche. Die verbindliche Offerte schreibt Ihnen unser Event-Team.</p>' +
        '<footer class="dn-ent__fuss"><span class="dn-ent__linie"></span><p>Waldhotel Doldenhorn · Doldenhornstrasse 26 · 3718 Kandersteg</p><p>' + esc(DATEN.tel || '') + ' · ' + esc(DATEN.mail || '') + ' · doldenhorn-ruedihus.ch</p></footer>' +
        '</div>', true);
    });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Anlass: ' + titelText(), 'Datum: ' + (el.datum.value || 'offen'), 'Gäste: ' + stand.gaeste].concat(stand.zeilen.map(function (x) { return x[0] + ': CHF ' + chf(x[1], true); }));
      z.push('Richtpreis (erster Entwurf): CHF ' + chf(stand.summe, true)); if (stand.saal) z.push('Saal: ' + stand.saal.name); if (el.name.value) z.push('Name: ' + el.name.value); if (el.wunsch.value) z.push('Wünsche: ' + el.wunsch.value);
      zaehle('formular', { f: 'feste' });
      anfrage(D.mail, titelText() + ' im Waldhotel Doldenhorn', z.join('\n'), el.datum.value, stand.gaeste);
    });
    rechne();
  });

  /* ---------- Gutschein online: Wert, Gourmet-Abend, Massage oder Aufenthalt, Bezahlschritt als Probe, Gutschein als PDF ---------- */
  $$('form[data-gutschein]').forEach(function (fo) {
    var D; try { D = JSON.parse($('[data-gutschein-daten]', fo).textContent); } catch (e) { return; }
    var el = fo.elements, art = 'wert', nr = '', teile = $$('[data-teil]', fo), schritt = $('.dn-gs', fo), reihe = $('.dn-betraege', fo);
    var wk = $('[data-wahl-knopf]', fo), wl = $('[data-wahl-liste]', fo), gruppen = [];
    D.massagen.forEach(function (m, i) { var g = gruppen.filter(function (x) { return x.n === m.gruppe; })[0]; if (!g) gruppen.push(g = { n: m.gruppe, l: [] }); g.l.push(i); });
    wl.innerHTML = gruppen.map(function (g) { return '<div class="dn-wahl__gruppe"><span class="mono">' + esc(g.n) + '</span>' + g.l.map(function (i) { var m = D.massagen[i]; return '<button type="button" role="option" class="dn-wahl__z" data-i="' + i + '"><b>' + esc(m.name) + '</b><i>' + esc(m.dauer) + '</i><em>CHF ' + chf(m.preis) + '</em></button>'; }).join('') + '</div>'; }).join('');
    var zeigeWahl = function () { var m = D.massagen[+el.massage.value] || D.massagen[0]; wk.innerHTML = '<span><small>' + esc(m.gruppe) + '</small><b>' + esc(m.name) + '</b></span><i>' + esc(m.dauer) + '</i><em>CHF ' + chf(m.preis) + '</em><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>'; $$('.dn-wahl__z', wl).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.i === el.massage.value)); }); };
    var auf = function (ja) { wl.hidden = !ja; wk.setAttribute('aria-expanded', String(ja)); };
    wk.addEventListener('click', function () { auf(wl.hidden); });
    wl.addEventListener('click', function (e) { var b = e.target.closest('.dn-wahl__z'); if (!b) return; el.massage.value = b.dataset.i; zeigeWahl(); auf(false); fo.dispatchEvent(new Event('change')); });
    document.addEventListener('click', function (e) { if (!wl.hidden && !e.target.closest('.dn-wahl')) auf(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') auf(false); });
    zeigeWahl();
    el.zimmer.innerHTML = D.aufenthalt.map(function (m, i) { return '<option value="' + i + '">' + esc(m.name) + '</option>'; }).join('');
    reihe.innerHTML = D.betraege.map(function (b) { return '<button class="opt taste" type="button" data-betrag="' + b + '">CHF ' + chf(b) + '</button>'; }).join('');
    function wert() {
      if (art === 'menu') return (+el.menu_pers.value) * (el.menu_wein.checked ? D.menu_wein : D.menu);
      if (art === 'massage') return (D.massagen[+el.massage.value] || {}).preis || 0;
      if (art === 'aufenthalt') { var a = D.aufenthalt[+el.zimmer.value] || {}; return 2 * ((a.preise || [])[+el.naechte.value] || 0); }
      return Math.max(0, +el.betrag.value || 0);
    }
    function was() {
      if (art === 'menu') return 'Le Grand Menu' + (el.menu_wein.checked ? ' mit Weinen' : '') + ' für ' + el.menu_pers.value + (el.menu_pers.value === '1' ? ' Person' : ' Personen') + ', Au Gourmet';
      if (art === 'massage') { var m = D.massagen[+el.massage.value] || {}; return (m.gruppe || '') + ' · ' + (m.name || '') + ', ' + (m.dauer || ''); }
      if (art === 'aufenthalt') return 'Gourmet-Aufenthalt für 2, ' + (D.aufenthalt[+el.zimmer.value] || {}).name + ', ' + el.naechte.options[el.naechte.selectedIndex].text;
      return 'Wertgutschein';
    }
    function neu() {
      zeigeWahl();
      $$('[data-nur-art]', fo).forEach(function (t) { t.hidden = t.getAttribute('data-nur-art') !== art; });
      $$('[data-betrag]', reihe).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.betrag === el.betrag.value)); });
      (function (n) { if (n) n.textContent = chf(wert()); })($('[data-wert]', fo));  // fehlt das Feld (Text im Studio umgeschrieben), läuft der Rest weiter
    }
    $$('[data-art]', fo).forEach(function (b) { b.addEventListener('click', function () { art = b.getAttribute('data-art'); $$('[data-art]', fo).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); neu(); }); });
    reihe.addEventListener('click', function (e) { var b = e.target.closest('[data-betrag]'); if (b) { el.betrag.value = b.dataset.betrag; neu(); } });
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    function karte() {
      var z = $('svg.zier'), zz = z ? z.outerHTML.replace('class="zier"', 'class="dn-gk__z"') : '';
      return '<div class="dn-gk">' + zz + '<span class="mono">Gutschein</span><b class="dn-gk__wert">CHF ' + chf(wert()) + '</b><span class="dn-gk__was">' + esc(was()) + '</span>' +
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
        var t = new Date(); nr = 'WD-' + String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        zaehle('formular', { f: 'gutschein' });
        zeige('<p class="dn-gs__ok">Bezahlt.</p>' + karte() + '<p class="dn-gs__satz">Ihr Gutschein ist fertig. Sichern Sie ihn als PDF, drucken Sie ihn aus oder schicken Sie ihn weiter.</p><div class="knoepfe"><button class="kn" type="button" data-pdf>Gutschein als PDF<i>' + PFEIL + '</i></button><button class="kn kn--dunkel" type="button" data-neu>Neuer Gutschein<i>' + PFEIL + '</i></button></div>');
      }
      if (e.target.closest('[data-pdf]')) drucke('<div class="dn-gutschein-druck">' + karte() + '<p class="dn-d-kl">' + esc(ADRESSE) + '</p></div>');
    });
  });
  /* ---------- Vorschlag aus dem Angebot des Hauses (klar: Oeschinensee, nass: Hallenbad und Saunen) ---------- */
  var istKlar = function (t) { return t && t.code <= 2 && t.wolken < 35 && (t.regen == null || t.regen < 40); };
  function vorschlag(box, titel, satz, knoepfe) {
    if (!box) return;
    box.innerHTML = '<span class="dn-vorschlag__z" aria-hidden="true">' + ($('svg.zier') ? $('svg.zier').outerHTML : '') + '</span><div><h3 class="d3">' + titel[0] + ' <span class="gold">' + titel[1] + '</span></h3><p>' + satz + '</p><div class="knoepfe">' + knoepfe + '</div></div>';
    box.hidden = false;
  }
  var knA = function (t, h, dunkel, ext) { return '<a class="kn kn--klein' + (dunkel ? ' kn--dunkel' : '') + '" href="' + h + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '<i>' + PFEIL + '</i></a>'; };
  function vorschlagFuer(box, tage, kand) {
    var klar = tage.filter(istKlar)[0];
    if (klar) {
      var d = new Date(klar.datum + 'T12:00'), heute = klar.datum === iso(new Date());
      vorschlag(box, [heute ? 'Heute klar' : 'Am ' + TAGE_L[d.getDay()] + ' klar', 'am Oeschinensee.'], 'Ein Tag für den Bergsee über Kandersteg. Ihr Tisch am Abend wartet im Au Gourmet, im Restaurant oder im Bistro.', knA('Tisch reservieren', '#', false).replace('href="#"', 'href="#" data-buchen="tisch"') + knA('Oeschinensee', 'https://www.oeschinensee.ch/', true, true));
    } else {
      vorschlag(box, ['Ein Tag', 'für das Hallenbad.'], 'Draussen ist es nass. Das Hallenbad mit Wasser aus der hauseigenen Quelle und die Saunen sind geöffnet, Montag bis Sonntag, 8 bis 22 Uhr.', knA('Spa', 'spa.html', false) + knA('Termin im Spa', 'https://calendly.com/spa-doldenhorn', true, true));
    }
    var b = $('[data-buchen]', box); if (b) b.addEventListener('click', function (e) { e.preventDefault(); var t = $('[data-buchen="tisch"]:not(.dn-vorschlag [data-buchen])'); if (t) t.click(); });
  }

  /* ---------- Heute in Kandersteg (Angebote) ---------- */
  $$('[data-wetter-heute]').forEach(function (feld) {
    fetch('/api/dienste?was=wetter').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var orte = ['kandersteg', 'oeschinen'].map(function (k) { return w[k]; }).filter(Boolean);
      feld.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Jetzt und heute</span></div><div class="dn-rw__reihe">' + orte.map(function (o, i) {
        var t = o.tage[0];
        return '<div class="dn-rw__tag dn-rw__tag--ort" style="--i:' + i + '"><span class="dn-rw__wt">' + esc(o.name) + '</span><span class="dn-rw__dt">' + esc(wmo(o.jetzt.code)) + '</span><span class="dn-rw__ic">' + icon(o.jetzt.code, o.jetzt.tag) + '</span><b class="dn-rw__max"><span data-hoch="' + Math.round(o.jetzt.temp) + '">' + Math.round(o.jetzt.temp) + '</span>°</b><span class="dn-rw__min">heute ' + Math.round(t.min) + '° bis ' + Math.round(t.max) + '°</span><span class="dn-rw__nass"><i style="--h:' + Math.max(.04, (t.regen || 0) / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em></div>';
      }).join('') + '</div></div>';
      var wv = feld.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', orte.length);
      belebe(feld);
      vorschlagFuer($('[data-vorschlag]', feld.parentNode), [w.oeschinen ? w.oeschinen.tage[0] : null].filter(Boolean));
    }).catch(function () { feld.innerHTML = '<p class="dn-hinweis">Das Wetter ist gerade nicht abrufbar. Aktuelle Werte bei <a href="https://www.meteoschweiz.admin.ch/" target="_blank" rel="noopener">MeteoSchweiz</a>.</p>'; });
  });

  /* ---------- Vor Ihrer Anreise ---------- */
  $$('[data-zaehler]').forEach(function (z) {
    var inp = $('input', z);
    $$('[data-schritt]', z).forEach(function (b) { b.addEventListener('click', function () { inp.value = Math.max(+inp.min || 0, Math.min(+inp.max || 99, (+inp.value || 0) + (+b.dataset.schritt))); inp.dispatchEvent(new Event('input', { bubbles: true })); }); });
  });
  /* Ankunftsbrief (Robert 17.10.2026): jede Wahl als Zeile mit Punktlinie bis zum Preis; ohne Wahl ein Satz statt «Noch nichts gewählt» */
  function brief(fo, z) {
    var el = fo.elements, zeilen = [], d = function (v) { return v ? new Date(v + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'long' }) : ''; };
    if (el.an.value) zeilen.push(['Ankunft', d(el.an.value) + (el.ankunft.value ? ', ' + el.ankunft.value : '')]);
    $$('[data-ueb]', fo).forEach(function (r) { var n = +$('input', r).value || 0, p = +r.dataset.preis || 0; if (n) zeilen.push([n + ' × ' + r.dataset.ueb, p ? 'CHF ' + chf(n * p, true) : 'nach Wahl']); });
    if (el.lokal.value) zeilen.push(['Tisch im ' + el.lokal.value, (el.tischtag.value ? d(el.tischtag.value) + ', ' : '') + el.tischzeit.value + ' Uhr, ' + el.tischpers.value + ' Pers.']);
    if (!zeilen.length || (zeilen.length === 1 && !z.length)) zeilen.push(['Ihre Wahl', 'erscheint hier']);
    return zeilen.map(function (x) { return '<li><span>' + esc(x[0]) + '</span><i></i><b>' + esc(x[1]) + '</b></li>'; }).join('');
  }
  $$('form[data-anreise]').forEach(function (fo) {
    var el = fo.elements, q = new URLSearchParams(location.search), heute = new Date();
    el.an.min = iso(heute);
    ['an', 'ab'].forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(q.get(k) || '')) el[k].value = q.get(k); });
    if (q.get('name')) el.name.value = q.get('name').slice(0, 80);
    if (q.get('nr')) el.nr.value = q.get('nr').slice(0, 40);
    var wf = $('[data-anreise-wetter]', fo), vs = $('[data-vorschlag]', fo), stand = { w: [], extras: 0, z: [] };
    function wetter() {
      if (!wf) return;   // Wetter-Abschnitt entfernt (Robert 10.10.2026)
      if (!(el.an.value && el.ab.value && el.ab.value > el.an.value)) { wf.innerHTML = '<p class="dn-hinweis">Mit Anreise und Abreise steht hier das Wetter für Ihre Tage.</p>'; vs.hidden = true; return; }
      reiseWetter(el.an.value, el.ab.value, wf);
      fetch('/api/dienste?was=wetter').then(function (r) { return r.json(); }).then(function (w) {
        var drin = (w.oeschinen ? w.oeschinen.tage : []).filter(function (t) { return t.datum >= el.an.value && t.datum <= el.ab.value; });
        if (drin.length) vorschlagFuer(vs, drin); else vs.hidden = true;
      }).catch(function () { vs.hidden = true; });
    }
    function neu() {
      var w = [], z = [], extras = 0;
      $$('[data-ueb]', fo).forEach(function (r) { var n = +$('input', r).value || 0; if (n) { var p = +r.dataset.preis || 0; w.push(n + ' × ' + r.dataset.ueb + (p ? '' : ' (Preis nach Wahl)')); extras += n * p; } });
      if (w.length) z.push('Überraschung bei der Ankunft: ' + w.join(', '));
      var o = el.lokal.options ? el.lokal.options[el.lokal.selectedIndex] : $('input[name=lokal]:checked', fo); $('[data-lokal-zeit]', fo).textContent = o && o.getAttribute('data-zeit') || '';
      $$('[data-ueb]', fo).forEach(function (r) { r.classList.toggle('gewaehlt', (+$('input', r).value || 0) > 0); });
      if (el.lokal.value) z.push('Tisch: ' + el.lokal.value + ', ' + (el.tischtag.value ? new Date(el.tischtag.value + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' : '') + el.tischzeit.value + ', ' + el.tischpers.value + ' Personen, ' + el.tischmenu.value);
      $('[data-extras]', fo).textContent = chf(extras, true);
      $('[data-wuensche]', fo).innerHTML = brief(fo, z);
      stand = { z: z, extras: extras };
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', function (e) { neu(); if (e.target === el.an || e.target === el.ab) wetter(); }); neu(); wetter();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Name: ' + el.name.value, 'Buchungsnummer: ' + (el.nr.value || '-'), 'Anreise: ' + el.an.value, 'Abreise: ' + el.ab.value, 'Ankunft: ' + el.ankunft.value].concat(stand.z, ['Extras: CHF ' + chf(stand.extras, true)]);
      zaehle('formular', { f: 'anreise' });
      anfrage((DATEN.mail || ''), 'Vor der Anreise: ' + el.name.value + ', ' + el.an.value, z.join('\n'), el.an.value);
    });
  });
})();
