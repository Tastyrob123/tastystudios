/* Landgasthof Ruedihus — Gäste-Funktionen (Tasty Studios, 10.10.2026, Vorlage Waldhotel Doldenhorn und Carlton-Europe)
   Zimmer-Finder mit Preis aus dem gemeinsamen Buchungssystem der Familie Maeder, Preisvergleich des Buchungssystems, Wetter für die gewählten Tage,
   Tisch in der Stube, Fest-Rechner mit Stube, Gutschein online, Vor Ihrer Anreise, Zahlen fürs Haus. Preise aus /api/dienste und den Karten, nichts geschätzt.
   Fällt ein Dienst aus, bleibt der bisherige Weg (Buchungssystem, Telefon). */
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
  var TAGE_L = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var RUHIG = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var zierHTML = function (kl) { var z = $('svg.zier'); return z ? z.outerHTML.replace('class="zier"', 'class="' + kl + '"') : ''; };

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
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-buchen]'); if (b) zaehle('buchen', { p: b.getAttribute('data-buchen') || '' });
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

  /* ---------- Preisvergleich: Balken wachsen, Preise zählen hoch, die Ersparnis steht als Zahl beim Direktpreis ---------- */
  function vergleichHTML(o) {
    var alle = [o.wir].concat(o.portale.map(function (p) { return p.chf; })), hoechst = Math.max.apply(null, alle), spar = hoechst - o.wir;
    var zeile = function (name, klein, v, i, wir) {
      var weniger = wir && spar > 0 ? '<span class="dn-pv__weniger">CHF <span data-hoch="' + Math.round(spar) + '">' + chf(Math.round(spar)) + '</span> günstiger</span>' : '';
      return '<li class="dn-pv__z' + (wir ? ' dn-pv__z--wir' : '') + '" style="--i:' + i + '"><span class="dn-pv__n">' + esc(name) + (klein ? '<small>' + esc(klein) + '</small>' : '') + '</span>' +
        '<span class="dn-pv__spur"><i style="--w:' + Math.max(.08, v / hoechst).toFixed(3) + '"></i></span><span class="dn-pv__preis"><b>CHF <span data-hoch="' + Math.round(v) + '">' + chf(v) + '</span></b>' + weniger + '</span></li>';
    };
    return '<div class="dn-pv' + (o.beispiel ? ' dn-pv--beispiel' : '') + '" data-anim><div class="dn-edel__kopf"><span class="mono">Preisvergleich für Ihre Daten</span>' + (o.beispiel ? '<em>Beispielwerte</em>' : '') + '</div>' +
      '<ul class="dn-pv__liste">' + zeile('Direkt bei uns', o.klein, o.wir, 0, true) + o.portale.map(function (p, i) { return zeile(p.name, '', p.chf, i + 1, false); }).join('') + '</ul>' +
      (o.satz ? '<p class="dn-edel__satz">' + o.satz + '</p>' : '') + '</div>';
  }

  /* ---------- Buchen-Fenster: Foto passt zum Reiter (Zimmer: Liebeslaube, Tisch: Stube bei Kerzenlicht) ---------- */
  var dlg = $('dialog.buchen'), tTisch = $('#t-tisch');
  if (dlg && tTisch) {
    var setzeTab = function () { dlg.setAttribute('data-tab', tTisch.getAttribute('aria-selected') === 'true' ? 'tisch' : 'zimmer'); };
    setzeTab(); new MutationObserver(setzeTab).observe(tTisch, { attributes: true, attributeFilter: ['aria-selected'] });
  }
  /* Auswahlfelder: nach der Wahl kein Rahmen mehr stehen lassen */
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.tagName === 'SELECT' && t.closest('.dn-karte-dunkel, .dn-tisch, .dn-gs-form, .dn-rechner, dialog.buchen')) t.blur(); });

  /* ---------- Zimmer-Finder im Buchen-Fenster ---------- */
  var f = dlg && $('form[data-zimmer]', dlg);
  if (f) (function () {
    var g = f.elements.gaeste, panel = $('#b-zimmer', dlg), klein = $('.buchen__klein', panel), titelH = $('h2', dlg), titelAlt = titelH ? titelH.innerHTML : '';
    var lbl = g.closest('label'); if (lbl) $('span', lbl).textContent = 'Mit wem reisen Sie?';
    ['Allein', 'Zu zweit'].forEach(function (t, i) { if (g.options[i]) g.options[i].textContent = t; });
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
    var nameVon = function (id) { var i = ZIM[id] || {}; return i.bs || i.name || id; };
    function karte(z, d, oben) {
      var info = ZIM[z.id] || { name: z.name }, fr = z.raten.filter(function (r) { return /Frühstück/i.test(r.essen); })[0], hp = z.raten.filter(function (r) { return /Halbpension/i.test(r.essen); })[0];
      var raten = (fr ? '<span class="dn-rate"><i>mit Frühstück</i><b>CHF ' + chf(fr.chf) + '</b></span>' : '') + (hp ? '<span class="dn-rate"><i>mit Halbpension</i><b>CHF ' + chf(hp.chf) + '</b></span>' : '');
      var satz = info.bs_satz || info.satz;
      return '<article class="dn-zi' + (oben ? ' dn-zi--oben' : '') + '">' + (oben && info.bild ? '<span class="dn-zi__b"><img src="' + esc(info.bild) + '" alt="" loading="lazy" decoding="async"></span>' : '') +
        '<div class="dn-zi__t">' + (oben ? '<span class="mono">Passt am besten</span>' : '') + '<h3>' + esc(nameVon(z.id)) + '</h3>' + (satz ? '<p>' + esc(satz) + '</p>' : '') +
        '<div class="dn-zi__raten">' + raten + '</div><small>für ' + (d.naechte === 1 ? 'eine Nacht' : d.naechte + ' Nächte') + ', alle Personen, exkl. Kurtaxe</small></div>' +
        '<a class="kn' + (oben ? '' : ' kn--klein kn--dunkel') + '" href="' + esc(link(d.an, d.ab, d.gaeste)) + '" target="_blank" rel="noopener" data-zimmer-wahl="' + esc(z.id) + '">Buchen<i>' + PFEIL + '</i></a></article>';
    }
    function zeige(d) {
      dlg.classList.add('dn-breit');
      var L = d.zimmer.slice(), haus = L.filter(function (z) { return !(ZIM[z.id] || {}).doldenhorn; }), dh = L.filter(function (z) { return (ZIM[z.id] || {}).doldenhorn; });
      if (!L.length) { raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + '<p class="dn-hinweis">Für diese Daten zeigt das Buchungssystem kein freies Zimmer. Versuchen Sie andere Daten oder rufen Sie uns an: ' + esc(DATEN.tel) + '.</p>'; return; }
      var best = (haus.length ? haus : L)[0], rest = haus.filter(function (z) { return z !== best; });
      var vg = '';
      if (d.portale && d.portale.length && d.unser) {
        var r = L.filter(function (z) { return z.raten.some(function (x) { return x.chf === d.unser; }); })[0];
        if (!r) { r = L.slice().sort(function (a, b) { return a.raten[0].chf - b.raten[0].chf; })[0]; d.unser = r.raten[0].chf; }   // der Vergleich nennt nur einen Preis, der auch in der Liste steht
        vg = vergleichHTML({ wir: d.unser, klein: r ? nameVon(r.id) + ((ZIM[r.id] || {}).doldenhorn ? ', Waldhotel Doldenhorn' : '') : '', portale: d.portale.map(function (p) { return { name: p.name, chf: p.chf }; }), satz: 'Vergleich des Buchungssystems der Familie Maeder für das günstigste Angebot dieser Daten.' });
      }
      if (!vg) vg = beispielVergleich(d.naechte);   // ohne Portalpreise (kein Rate Match): Beispiel, echte Preise ersetzen es von selbst
      raum.innerHTML = kopfZeile(d.an, d.ab, d.naechte, d.gaeste) + (haus.length ? '' : '<p class="dn-hinweis">Im Ruedihus ist für diese Daten nichts frei. Gleich gegenüber im Waldhotel Doldenhorn:</p>') + karte(best, d, true) + vg +
        (rest.length ? '<p class="mono dn-treffer__mehr">Ebenfalls frei im Ruedihus</p>' + rest.map(function (z) { return karte(z, d, false); }).join('') : '') +
        (dh.length && haus.length ? '<p class="mono dn-treffer__mehr">Gleich gegenüber im Waldhotel Doldenhorn</p>' + dh.map(function (z) { return karte(z, d, false); }).join('') : '');
      zaehle('finder', { z: best.id }); belebe(raum);
    }
    /* Preisvergleich als Beispiel, wenn das Buchungssystem keinen Preis oder keine Portalpreise liefert (Robert 17.10.2026: «ja auch stanarisieren»,
       Vorlage Carlton-Europe und Waldhotel Doldenhorn, nur gelesen und kopiert). Alle Zahlen sind erfunden und stehen ausdrücklich so da. */
    function beispielVergleich(n) {
      var wir = 190 * n;
      return vergleichHTML({ wir: wir, klein: '', portale: [{ name: 'Booking.com', chf: Math.round(wir * 1.12) }, { name: 'Expedia', chf: Math.round(wir * 1.15) }], beispiel: true,
        satz: 'Beispiel mit erfundenen Zahlen, keine echten Preise. So erscheint der Vergleich, sobald das Buchungssystem des Hauses die Preise für Ihre Daten und die der Portale liefert.' });
    }
    function ohnePreis(an, ab, gz) {
      var n = Math.max(1, tageZw(an, ab)), ids = Object.keys(ZIM).filter(function (k) { return !ZIM[k].doldenhorn; });
      dlg.classList.add('dn-breit');
      raum.innerHTML = kopfZeile(an, ab, n, gz) + '<p class="dn-hinweis">Entwurf: Ab-Preise aus der Preisliste des Hauses, ohne Abfrage. Den genauen Preis für Ihre Daten zeigt Ihnen das Buchungssystem.</p>' +
        ids.map(function (k, i) { var z = ZIM[k], ab_ = parseFloat(String(z.ab).replace(/[^\d.]/g, '')) || 0; return '<article class="dn-zi' + (i ? '' : ' dn-zi--oben') + '">' + (i ? '' : '<span class="dn-zi__b"><img src="' + esc(z.bild) + '" alt="" loading="lazy"></span>') + '<div class="dn-zi__t"><h3>' + esc(z.name) + '</h3>' + (i ? '' : '<p>' + esc(z.satz) + '</p>') + (ab_ ? '<div class="dn-zi__raten"><span class="dn-rate"><i>ab</i><b>CHF ' + chf(ab_) + '</b></span></div>' : '') + '<small>' + esc(z.pers) + (ab_ ? ' · pro Nacht, laut Preisliste des Hauses' : '') + '</small></div><a class="kn' + (i ? ' kn--klein kn--dunkel' : '') + '" href="' + esc(link(an, ab, gz)) + '" target="_blank" rel="noopener" data-zimmer-wahl="' + k + '">Preis und buchen<i>' + PFEIL + '</i></a></article>' + (i ? '' : beispielVergleich(n)); }).join('');
      zaehle('finder', { z: ids[0] }); belebe(raum);   // DEMO 18.10.2026: Vergleich zählt hoch wie im normalen Fall (sonst blieb er leer)
    }
    raum.addEventListener('click', function (e) {
      if (e.target.closest('[data-zurueck]')) { zurueck(); return; }
      var w = e.target.closest('[data-zimmer-wahl]'); if (w) zaehle('zimmer', { z: w.getAttribute('data-zimmer-wahl') });
    });
    function suche(an, ab, gz) {
      f.hidden = true; if (klein) klein.hidden = true; raum.hidden = false; if (titelH) titelH.innerHTML = 'Ihr <span class="gold">Zimmer.</span>';
      /* DEMO 18.10.2026 (Oberchef nach der Prüfung, Pitch-Regel «simulieren, was sich simulieren lässt»): keine Abfrage beim Buchungssystem, die konnte mit 503
         abbrechen. Das Fenster zeigt die Ab-Preise aus der Preisliste des Hauses und den Vergleich als gekennzeichnetes Beispiel; «Preis und buchen» führt
         zum Buchungssystem des Hauses. Für den Betrieb wieder: fetch('/api/dienste?was=preise&an=…&ab=…&g=…') → zeige(d), Rückfall ohnePreis (Sicherung). */
      ohnePreis(an, ab, gz);
    }
    document.addEventListener('submit', function (e) {
      var q = e.target;
      if (!window.fetch || !q.matches || !q.matches('form[data-zimmer]')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var an = q.elements.an.value, ab = q.elements.ab.value, gz = +q.elements.gaeste.value;
      if (q !== f) {   // Buchungsleiste auf der Seite: dieselbe Suche im Fenster
        f.elements.an.value = an; f.elements.ab.value = ab; g.value = String(gz);
        var b = $('[data-buchen="zimmer"]'); if (b) b.click();
      }
      suche(an, ab, gz);
    }, true);
  })();

  /* ---------- Tisch in der Stube: Stube, Tag, Zeit, Personen, Menü → Anfrage per E-Mail ---------- */
  $$('form[data-tisch]').forEach(function (t) {
    var lokal = t.elements.lokal, zeit = $('.dn-tisch__zeit', t), karte = $('[data-karte-link]', t), tag = t.elements.tag;
    tag.min = iso(new Date()); tag.value = iso(new Date());
    var neu = function () { var o = lokal.options[lokal.selectedIndex]; zeit.textContent = o.getAttribute('data-zeit') || ''; karte.setAttribute('href', o.getAttribute('data-karte') || 'essen.html#karte'); };
    lokal.addEventListener('change', neu); neu();
    t.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new Date(tag.value + 'T12:00');
      var z = ['Stube: ' + lokal.value, 'Tag: ' + TAGE_L[d.getDay()] + ', ' + d.toLocaleDateString('de-CH'), 'Uhrzeit: ' + t.elements.zeit.value, 'Personen: ' + t.elements.pers.value, 'Menü: ' + t.elements.menu.value, 'Name: ' + t.elements.name.value];
      if (t.elements.wunsch.value) z.push('Wünsche: ' + t.elements.wunsch.value);
      zaehle('tisch', { p: lokal.value });
      /* kein Mailprogramm (17.10.2026): das Formular nimmt assets/js/formular.js, hier öffnet sich nichts mehr */
    });
  });

  /* ---------- Drucken: Entwurf und Gutschein als PDF (Druckansicht nur mit dem einen Blatt) ---------- */
  function drucke(html) {
    var d = $('#dn-druck') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'dn-druck' }));
    d.innerHTML = html; doc.classList.add('dn-druckt');
    var weg = function () { doc.classList.remove('dn-druckt'); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    // Fotos im Blatt (Gutschein) erst fertig laden, sonst druckt der Browser ein leeres Feld
    var bilder = $$('img', d).map(function (i) { return i.decode ? i.decode().catch(function () {}) : Promise.resolve(); });
    var los = function () { setTimeout(function () { window.print(); setTimeout(weg, 1500); }, 60); };
    Promise.race([Promise.all(bilder), new Promise(function (r) { setTimeout(r, 4000); })]).then(los);
  }
  var MARKE = function () { return '<p class="dn-d-marke">' + zierHTML('dn-d-zeichen') + '<b>RUEDIHUS</b></p>'; };
  var ADRESSE = 'Landgasthof Ruedihus · Hinder de Büele 6 · 3718 Kandersteg · ' + (DATEN.tel || '') + ' · ' + (DATEN.mail || '');

  /* ---------- Fest-Rechner: Gäste und Menü → Stube und Richtpreis ---------- */
  $$('form[data-rechner]').forEach(function (box) {
    var D; try { D = JSON.parse($('[data-rechner-daten]', box).textContent); } catch (e) { return; }
    var el = box.elements, stand = null, gewaehlt = null;   // gewaehlt: Stube, die der Gast selbst angeklickt hat
    el.menu.innerHTML = D.menues.map(function (m, i) { return '<option value="' + i + '">' + esc(m.name) + ' · CHF ' + chf(m.preis) + ' p. P.</option>'; }).join('');
    var n = function (k) { return Math.max(0, parseInt(el[k].value, 10) || 0); };
    var knoepfe = $$('[data-stube]', box);
    function passend(gaeste) { var s = D.stuben.filter(function (x) { return x.pers && x.pers >= gaeste; }).sort(function (a, b) { return a.pers - b.pers; })[0]; return s ? D.stuben.indexOf(s) : -1; }
    function rechne() {
      var erw = Math.max(1, n('erw')), ki = n('kinder'), gaeste = erw + ki, m = D.menues[+el.menu.value] || D.menues[0], zeilen = [], summe = 0;
      zeilen.push([m.name + ', ' + erw + ' × CHF ' + chf(m.preis, true), erw * m.preis]); summe += erw * m.preis;
      if (ki && D.kinder) { zeilen.push(['Für di Chline, ' + ki + ' × CHF ' + chf(D.kinder, true), ki * D.kinder]); summe += ki * D.kinder; }
      if (el.cuepli.checked && D.cuepli) { zeilen.push(['Cüpli zum Empfang, ' + erw + ' × CHF ' + chf(D.cuepli, true), erw * D.cuepli]); summe += erw * D.cuepli; }
      var auto = passend(gaeste), wahl = gewaehlt != null ? gewaehlt : auto, st = D.stuben[wahl];
      knoepfe.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.stube === wahl)); });
      var satz;
      if (wahl < 0) satz = 'Für ' + gaeste + ' Gäste ist keine Stube gross genug. Hochzeiten und Bankette richtet das Waldhotel Doldenhorn gleich gegenüber aus.';
      else if (st.pers && st.pers < gaeste) satz = '<b>' + esc(st.name) + '</b> hat ' + st.pers + ' Sitzplätze, für ' + gaeste + ' Gäste zu klein.' + (auto >= 0 ? ' Passend wäre die ' + esc(D.stuben[auto].name) + '.' : '');
      else if (!st.pers) satz = '<b>' + esc(st.name) + '</b>, ' + esc(st.wo.split(' · ')[0].toLowerCase()) + '. Die Platzzahl nennt Ihnen das Event-Team.';
      else satz = 'Passende Stube: <b>' + esc(st.name) + '</b>, ' + st.pers + ' Sitzplätze.';
      $('[data-summe]', box).textContent = chf(summe);
      $('[data-zeilen]', box).innerHTML = zeilen.map(function (z) { return '<li><span>' + esc(z[0]) + '</span><b>' + chf(z[1], true) + '</b></li>'; }).join('');
      $('[data-saal]', box).innerHTML = satz;
      stand = { zeilen: zeilen, summe: summe, stube: wahl >= 0 ? st.name : '', gaeste: gaeste, satz: satz.replace(/<[^>]+>/g, '') };
    }
    knoepfe.forEach(function (b) { b.addEventListener('click', function () { gewaehlt = +b.dataset.stube; rechne(); }); });
    box.addEventListener('input', rechne); box.addEventListener('change', rechne);
    $('[data-offerte]', box).addEventListener('click', function () {
      var datum = el.datum.value ? new Date(el.datum.value).toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'noch offen';
      drucke('<div class="dn-blatt-druck">' + MARKE() + '<p class="dn-d-kl">' + esc(ADRESSE) + '</p><h1>Erster Entwurf <em>' + esc(el.anlass.value) + '</em></h1><p class="dn-d-kl">Stand ' + new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · Datum: ' + datum + ' · ' + stand.gaeste + ' Gäste</p>' +
        '<table>' + stand.zeilen.map(function (z) { return '<tr><td>' + esc(z[0]) + '</td><td>CHF ' + chf(z[1], true) + '</td></tr>'; }).join('') + '<tr class="dn-d-summe"><td>Richtpreis</td><td>CHF ' + chf(stand.summe, true) + '</td></tr></table>' +
        '<p>' + esc(stand.satz) + '</p>' +
        '<p class="dn-d-kl">Erster Entwurf nach den Karten des Hauses ab 1.3.2026, keine Offerte und keine Bestätigung. Der endgültige Preis hängt von vielen Dingen ab: Menü und Getränke, Wein, Dauer und Ihre Wünsche. Die verbindliche Offerte schreibt Ihnen das Event-Team.</p></div>');
    });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Anlass: ' + el.anlass.value, 'Datum: ' + (el.datum.value || 'offen'), 'Gäste: ' + stand.gaeste, 'Stube: ' + (stand.stube || 'offen')].concat(stand.zeilen.map(function (x) { return x[0] + ': CHF ' + chf(x[1], true); }));
      z.push('Richtpreis (erster Entwurf): CHF ' + chf(stand.summe, true)); if (el.name.value) z.push('Name: ' + el.name.value); if (el.wunsch.value) z.push('Wünsche: ' + el.wunsch.value);
      zaehle('formular', { f: 'fest' });
      /* kein Mailprogramm (17.10.2026): das Formular nimmt assets/js/formular.js, hier öffnet sich nichts mehr */
    });
    rechne();
  });

  /* ---------- Gutschein online: Wert, Abend in der Stube oder Gourmetaufenthalt, Bezahlschritt als Probe, Gutschein als PDF ---------- */
  $$('form[data-gutschein]').forEach(function (fo) {
    var D; try { D = JSON.parse($('[data-gutschein-daten]', fo).textContent); } catch (e) { return; }
    var el = fo.elements, art = 'wert', nr = '', teile = $$('[data-teil]', fo), schritt = $('.dn-gs', fo), reihe = $('.dn-betraege', fo);
    el.menu.innerHTML = D.menues.map(function (m, i) { return '<option value="' + i + '">' + esc(m.name) + '</option>'; }).join('');
    reihe.innerHTML = D.betraege.map(function (b) { return '<button class="taste" type="button" data-betrag="' + b + '">CHF ' + chf(b) + '</button>'; }).join('');
    var gz = $('.dn-gs-zeilen', fo); if (gz) gz.textContent = (D.gourmet_text || []).join(' · ');
    var pers = function () { return +el.pers.value || 1; };
    function wert() {
      if (art === 'menu') return pers() * ((D.menues[+el.menu.value] || {}).preis || 0);
      if (art === 'gourmet') return pers() * (D.gourmet || 0);
      return Math.max(0, +el.betrag.value || 0);
    }
    function was() {
      var p = pers() + (pers() === 1 ? ' Person' : ' Personen');
      if (art === 'menu') { var m = D.menues[+el.menu.value] || {}; return (m.name || '') + ' für ' + p + ', ' + (m.wo || '') + ' im Ruedihus'; }
      if (art === 'gourmet') return 'Gourmetaufenthalt für ' + p + ': ' + (D.gourmet_text || []).join(', ');
      return 'Wertgutschein, im Ruedihus und im Waldhotel Doldenhorn';
    }
    function neu() {
      fo.setAttribute('data-art', art);
      $$('[data-nur-art]', fo).forEach(function (t) { t.hidden = t.getAttribute('data-nur-art').split(' ').indexOf(art) < 0; });
      $$('[data-betrag]', reihe).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.betrag === el.betrag.value)); });
      (function (n) { if (n) n.textContent = chf(wert()); })($('[data-wert]', fo));  // fehlt das Feld (Text im Studio umgeschrieben), läuft der Rest weiter
      (function (n) { if (n) n.textContent = art === 'gourmet' ? 'Wert, ab' : 'Wert'; })($('.dn-gs-summe .mono', fo));
    }
    $$('[data-art]', fo).forEach(function (b) { b.addEventListener('click', function () { waehle(b.getAttribute('data-art')); }); });
    function waehle(a) { art = a; $$('[data-art]', fo).forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-art') === a)); }); neu(); }
    reihe.addEventListener('click', function (e) { var b = e.target.closest('[data-betrag]'); if (b) { el.betrag.value = b.dataset.betrag; neu(); } });
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    $$('a[href="#gutschein-online"]').forEach(function (a) { a.addEventListener('click', function () { if (D.gourmet) waehle('gourmet'); }); });
    function karte() {
      return '<div class="dn-gk">' + zierHTML('dn-gk__z') + '<span class="mono">Gutschein · Landgasthof Ruedihus</span><b class="dn-gk__wert">CHF ' + chf(wert()) + '</b><span class="dn-gk__was">' + esc(was()) + '</span>' +
        (el.fuer.value ? '<span class="dn-gk__fuer">für ' + esc(el.fuer.value) + '</span>' : '') + (el.widmung.value ? '<span class="dn-gk__widmung">«' + esc(el.widmung.value) + '»</span>' : '') +
        (el.von.value ? '<span class="dn-gk__von">von ' + esc(el.von.value) + '</span>' : '') + (nr ? '<span class="dn-gk__nr">Gutschein-Nummer ' + nr + '</span>' : '') + '</div>';
    }
    /* Gutschein als ganzes Blatt (17.10.2026, Robert: «dass die ganze Seite auch gedruckt ist»): A4 randlos, oben das Haus in der Dämmerung,
       darunter Wert, Widmung und Nummer auf dem Grund der Stube mit den Butzenscheiben, Doppellinie wie im Fuss. Leere Felder bleiben als Linie zum Schreiben. */
    function blatt() {
      var zeile = function (k, v, kl) { return '<div class="gsd-zeile' + (kl ? ' ' + kl : '') + '"><span>' + k + '</span><b>' + (v ? esc(v) : '') + '</b></div>'; };
      var heute = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
      return '<div class="gsd-blatt"><div class="gsd-bild"><img src="assets/img/st/haus-daemmerung-l-2000.webp" alt="" loading="eager" decoding="sync"></div>' +
        '<div class="gsd-rahmen" aria-hidden="true"></div>' +
        '<div class="gsd-kopf"><span class="gsd-marke">RUEDIHUS</span><span class="gsd-ort">Landgasthof · Kandersteg · seit 1753</span></div>' +
        '<div class="gsd-mitte">' + zierHTML('gsd-zeichen') +
          '<span class="gsd-titel">Gutschein</span>' +
          '<b class="gsd-wert"><small>CHF</small>' + chf(wert()) + '</b>' +
          '<p class="gsd-was' + (was().length > 110 ? ' gsd-was--lang' : '') + '">' + esc(was()) + '</p>' +
          '<div class="gsd-linie" aria-hidden="true"><i></i></div>' +
          zeile('Für', el.fuer.value) +
          (el.widmung.value ? '<p class="gsd-widmung">«' + esc(el.widmung.value) + '»</p>' : zeile('', '', 'gsd-zeile--frei')) +
          zeile('Von', el.von.value) +
        '<div class="gsd-fuss"><div class="gsd-angaben"><div><span>Gutschein-Nummer</span><b>' + (nr || '') + '</b></div><div><span>Ausgestellt am</span><b>' + heute + '</b></div></div>' +
          '<p class="gsd-satz">Seit 1753. <em>Heute Abend Ihr Tisch, heute Nacht Ihr Bett.</em></p>' +
          '<p class="gsd-adresse">' + esc(ADRESSE) + '</p></div>' +
        '</div></div>';
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
        var t = new Date(); nr = 'RH-' + String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        zaehle('formular', { f: 'gutschein' });
        zeige('<p class="dn-gs__ok">Bezahlt.</p>' + karte() + '<p class="dn-gs__satz">Ihr Gutschein ist fertig. Sichern Sie ihn als PDF, drucken Sie ihn aus oder schicken Sie ihn weiter.</p><div class="knoepfe"><button class="kn" type="button" data-pdf>Gutschein als PDF<i>' + PFEIL + '</i></button><button class="kn kn--dunkel" type="button" data-neu>Neuer Gutschein<i>' + PFEIL + '</i></button></div>');
      }
      if (e.target.closest('[data-pdf]')) drucke(blatt());
    });
  });

  /* ---------- Vorschlag aus dem Haus: klar und warm → draussen, sonst → ein Abend in der Stube ---------- */
  var istKlar = function (t) { return t && t.code <= 2 && t.wolken < 35 && (t.regen == null || t.regen < 40); };
  var STUBE_SATZ = '«Unsere drei rustikalen Stuben im Parterre laden Sie ein zu einem gemütlichen Fondue, Raclette oder einer Röstispezialität.»';
  function vorschlag(box, titel, satz, knoepfe) {
    if (!box) return;
    box.innerHTML = '<span class="dn-vorschlag__z" aria-hidden="true">' + zierHTML('') + '</span><div><h3 class="d3">' + titel[0] + ' <span class="gold">' + titel[1] + '</span></h3><p>' + satz + '</p><div class="knoepfe">' + knoepfe + '</div></div>';
    box.hidden = false;
    $$('[data-tisch-auf]', box).forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); var t = $('[data-buchen="tisch"]'); if (t) t.click(); }); });
  }
  var knA = function (t, h, dunkel, ext) { return '<a class="kn kn--klein' + (dunkel ? ' kn--dunkel' : '') + '" href="' + h + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '<i>' + PFEIL + '</i></a>'; };
  var knT = '<a class="kn kn--klein" href="#" data-tisch-auf>Tisch reservieren<i>' + PFEIL + '</i></a>';
  function vorschlagHeute(box, t) {
    if (istKlar(t) && t.max >= 15) vorschlag(box, ['Heute', 'draussen.'], 'Ein Tag für den Oeschinensee über Kandersteg. Am Abend wartet Ihr Tisch in der Stube.', knT + knA('Oeschinensee', 'https://www.oeschinensee.ch/', true, true));
    else vorschlag(box, ['Ein Abend', 'für die Stube.'], STUBE_SATZ, knT + knA('Zur Karte', 'essen.html#karte', true));
  }
  function vorschlagReise(box, tage) {
    var klar = tage.filter(istKlar)[0];
    if (klar) {
      var d = new Date(klar.datum + 'T12:00'), heute = klar.datum === iso(new Date());
      vorschlag(box, [heute ? 'Heute klar' : 'Am ' + TAGE_L[d.getDay()] + ' klar', 'am Oeschinensee.'], 'Ein Tag für den Bergsee über Kandersteg. Am Abend wartet Ihr Tisch in der Stube.', knT + knA('Oeschinensee', 'https://www.oeschinensee.ch/', true, true));
    } else {
      vorschlag(box, ['Ein Abend', 'für die Stube.'], STUBE_SATZ + ' Tagsüber das Hallenbad im Waldhotel Doldenhorn, gleich gegenüber.', knT + knA('Termin im Spa', DATEN.spa || '#spa', true, true));
    }
  }

  /* ---------- Heute in Kandersteg (Essen) ---------- */
  $$('[data-wetter-heute]').forEach(function (feld) {
    fetch('/api/dienste?was=wetter').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (w) {
      var orte = ['kandersteg', 'oeschinen'].map(function (k) { return w[k]; }).filter(Boolean);
      feld.innerHTML = '<div class="dn-rw" data-anim><div class="dn-edel__kopf"><span class="mono">Jetzt und heute</span></div><div class="dn-rw__reihe">' + orte.map(function (o, i) {
        var t = o.tage[0];
        return '<div class="dn-rw__tag dn-rw__tag--ort" style="--i:' + i + '"><span class="dn-rw__wt">' + esc(o.name) + '</span><span class="dn-rw__dt">' + esc(wmo(o.jetzt.code)) + '</span><span class="dn-rw__ic">' + icon(o.jetzt.code, o.jetzt.tag) + '</span><b class="dn-rw__max"><span data-hoch="' + Math.round(o.jetzt.temp) + '">' + Math.round(o.jetzt.temp) + '</span>°</b><span class="dn-rw__min">heute ' + Math.round(t.min) + '° bis ' + Math.round(t.max) + '°</span><span class="dn-rw__nass"><i style="--h:' + Math.max(.04, (t.regen || 0) / 100) + '"></i></span><em>Niederschlag ' + t.regen + ' %</em></div>';
      }).join('') + '</div></div>';
      var wv = feld.closest('[data-wv]'); if (wv) wv.setAttribute('data-tage', orte.length);
      belebe(feld);
      vorschlagHeute($('[data-vorschlag]', feld.parentNode), w.kandersteg ? w.kandersteg.tage[0] : null);
    }).catch(function () { feld.innerHTML = '<p class="dn-hinweis">Das Wetter ist gerade nicht abrufbar. Aktuelle Werte bei <a href="https://www.meteoschweiz.admin.ch/" target="_blank" rel="noopener">MeteoSchweiz</a>.</p>'; });
  });

  /* ---------- Vor Ihrer Anreise ---------- */
  $$('form[data-anreise]').forEach(function (fo) {
    var el = fo.elements, q = new URLSearchParams(location.search), heute = new Date();
    el.an.min = iso(heute);
    ['an', 'ab'].forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(q.get(k) || '')) el[k].value = q.get(k); });
    if (q.get('name')) el.name.value = q.get('name').slice(0, 80);
    if (q.get('nr')) el.nr.value = q.get('nr').slice(0, 40);
    var wf = $('[data-anreise-wetter]', fo), vs = $('[data-vorschlag]', fo), stand = { z: [] };
    function wetter() {
      if (!wf) return;   // Wetter-Abschnitt entfernt (Robert 10.10.2026)
      if (!(el.an.value && el.ab.value && el.ab.value > el.an.value)) { wf.innerHTML = '<p class="dn-hinweis">Mit Anreise und Abreise steht hier das Wetter für Ihre Tage.</p>'; vs.hidden = true; var wv = wf.closest('[data-wv]'); if (wv) wv.removeAttribute('data-tage'); return; }
      reiseWetter(el.an.value, el.ab.value, wf);
      fetch('/api/dienste?was=wetter').then(function (r) { return r.json(); }).then(function (w) {
        var drin = (w.oeschinen ? w.oeschinen.tage : []).filter(function (t) { return t.datum >= el.an.value && t.datum <= el.ab.value; });
        if (drin.length) vorschlagReise(vs, drin); else vs.hidden = true;
      }).catch(function () { vs.hidden = true; });
    }
    function neu() {
      var z = [];
      var o = el.lokal.options[el.lokal.selectedIndex]; $('[data-lokal-zeit]', fo).textContent = o && o.getAttribute('data-zeit') || '';
      z.push('Ankunft: ' + el.ankunft.value);
      if (el.lokal.value) z.push('Tisch: ' + el.lokal.value + ', ' + (el.tischtag.value ? new Date(el.tischtag.value + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' : '') + el.tischzeit.value + ', ' + el.tischpers.value + ' Personen, ' + el.tischmenu.value);
      $('[data-wuensche]', fo).innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      stand = { z: z };
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', function (e) { neu(); if (e.target === el.an || e.target === el.ab) wetter(); }); neu(); wetter();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Name: ' + el.name.value, 'Buchungsnummer: ' + (el.nr.value || '-'), 'Anreise: ' + el.an.value, 'Abreise: ' + el.ab.value].concat(stand.z);
      zaehle('formular', { f: 'anreise' });
      /* kein Mailprogramm (17.10.2026): das Formular nimmt assets/js/formular.js, hier öffnet sich nichts mehr */
    });
  });
})();
