/* Speisekarten · Nachbau der Website für die Ansicht «Website» (Vorführung). Die Website von Maloja wird nie geöffnet; diese Seite zeigt nach
   ihrem Vorbild (Maloja/karte.html, index.html), wie der Entwurf dort stünde. Die Daten kommen vom Werkzeug: LB_SETZE({ z, daten, liste }).
   Texte, Rubriken und Preise liest sie mit satz.js des Werkzeugs aus dem Baum der Karte, Fotos nur aus ../../_haus/img. */
(function () {
  'use strict';
  var P = window.parent || window, SATZ = P.SATZ, H = P.HAUS || {};
  var SEITE = /index\.html$/.test(location.pathname) ? 'index' : 'karte';
  function h(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var FOTO = {};   // Foto je Gericht aus maloja.py MENUE (window.HAUS.MENUE: Gang, Zubereitung, Herkunft, Bild)
  (H.MENUE || []).forEach(function (g) { FOTO[String(g[0]).toLowerCase()] = g[3]; });
  function foto(n) { var k = String(n || '').toLowerCase().split(',')[0].trim(); return FOTO[k] || ''; }
  function img(k, alt) { return k ? '<img src="../../_haus/img/' + k + '-800.webp" alt="' + h(alt || '') + '" decoding="sync">' : ''; }

  /* Rubriken und Einträge aus dem Baum der Karte (wie die Liste im Werkzeug: SATZ.art, SATZ.felder) */
  function teile(d) {
    var aus = [], rub = null, titel = '', unter = '';
    if (d.art === 'abend') {
      var w = d.abend || {}, t = (w.tage || [])[0] || {}, G = SATZ.ABEND.GAENGE;
      var e = t.zu ? [] : G.filter(function (g) { return t[g[0]] || t[g[0] + '_z']; }).map(function (g) { var x = String(t[g[0]] || ''), i = x.indexOf(','); return { gang: g[1], n: i > 0 ? x.slice(0, i) : x, t: i > 0 ? x.slice(i + 1).trim() : '', veg: t[g[0] + '_z'] || '' }; });
      return { titel: w.motto || w.titel || 'Das Menü', unter: SATZ.ABEND.spanne(w.ab) + (w.mit ? ' · ' + w.mit : ''), rubriken: [{ t: t.zu ? (t.hinweis || 'Die Gänge dieser Woche folgen.') : 'Fünf Gänge', e: e }],
        preis: [[(w.preis || '').replace(/[^\d,.]/g, ''), 'Fünf Gänge'], [(w.zusatz || '').replace(/[^\d,.]/g, ''), (w.zusatz || '').replace(/[\d,.€\s]+$/, '')]].filter(function (p) { return p[0]; }), hinweis: w.hinweis || '' };
    }
    var preis = [];
    function geh(x, eltern) {
      if (!x || x.fn !== 'el' || x.aus) return;
      var a = SATZ.art(x, eltern), kl = SATZ.klasse(x);
      if (a === 'fest') return;
      if (a === 'titel' && !titel) { titel = SATZ.textVon(x).trim(); return; }
      if (a === 'text' && /sb-datum/.test(kl) && !unter) { unter = SATZ.textVon(x).trim(); return; }
      if (a === 'rubrik') { rub = { t: SATZ.textVon(x).trim(), e: [] }; aus.push(rub); return; }
      if (a === 'eintrag') {
        var f = SATZ.felder(x, a), w = function (re) { return f.filter(function (y) { return re.test(y.name) && String(y.wert).trim(); }).map(function (y) { return String(y.wert).trim(); }); };
        if (/sb-g/.test(kl)) { preis.push([w(/^Preis/)[0] || '', w(/^Angabe/)[0] || '']); return; }
        if (!rub) { rub = { t: '', e: [] }; aus.push(rub); }
        rub.e.push({ n: w(/^(Name|Gericht)/)[0] || '', t: w(/^Beschreibung/).join(' '), p: w(/^Preis/).join(' / '), a: w(/^Allergene/)[0] || '' });
        return;
      }
      x.a.slice(2).forEach(function (y) { geh(y, x); });
    }
    (d.seiten || []).forEach(function (s) { if (!s.aus) s.a.slice(1).forEach(function (y) { geh(y, s); }); });
    return { titel: titel, unter: unter, rubriken: aus.filter(function (r) { return r.e.length; }), preis: preis, hinweis: '' };
  }

  function kopf() {
    return '<header class="wk"><nav><span>Die Karte</span><span>Feiern</span></nav><i class="wk__logo" role="img" aria-label="Maloja"></i><nav class="r"><span>Anfahrt</span><b>Reservieren</b></nav></header>';
  }
  function karteSeite(t, k) {
    var gruen = /^(woche|menue)/.test(k.ziel || ''), Z = H.ZEITEN || {}, R = {};
    (H.REGELN || []).forEach(function (x) { R[x[0]] = x[1]; });
    var mitFoto = [];
    t.rubriken.forEach(function (r) { r.e.forEach(function (e) { if (foto(e.n) && mitFoto.length < 5 && !mitFoto.some(function (m) { return m.n === e.n; })) mitFoto.push(e); }); });
    var reihen = t.rubriken.map(function (r) {
      return '<div class="wl__r">' + (r.t ? '<p class="wl__rt">' + h(r.t) + '</p>' : '') + r.e.map(function (e) {
        return '<div class="wl__z"><b>' + h(e.n) + '</b><span>' + h(e.gang ? e.gang + (e.t ? ' · ' + e.t : '') : e.t) + (e.veg ? '<em>Vegetarisch: ' + h(e.veg) + '</em>' : '') + '</span>' + (e.p ? '<i>' + h(e.p) + '</i>' : '') + '</div>';
      }).join('') + '</div>';
    }).join('');
    return kopf() +
      '<section class="wh">' + img(gruen ? 'm-pass' : (k.foto || 'm-pass'), '') + '<div class="wh__t"><h1>' + h(gruen ? 'Die Karte.' : (t.titel || k.name) + '.') + '</h1><p>' + h(gruen ? 'Sieben Gänge aus der Schweiz und von der Küste, jeder von Hand angerichtet. ' + (Z.tage || 'Dienstag bis Samstag') + ' ab ' + (Z.ab || '18.30 Uhr') + '. ' + ((H.PLAETZE || {}).saal || 34) + ' Plätze im Kontorsaal.' : t.unter) + '</p></div></section>' +
      '<section class="wt' + (gruen ? ' wt--gruen' : '') + '"><div class="wt__k"><h2>' + h(k.ziel === 'woche' ? 'Die Gänge dieser Woche.' : (t.titel || k.name) + '.') + '</h2><p>' + h(k.ziel === 'woche' ? ((H.HAUS || {}).satz || t.unter) : t.unter) + '</p></div>' +
      (mitFoto.length >= 3 ? '<div class="wf">' + mitFoto.map(function (e) { return '<figure>' + img(foto(e.n), e.n) + '<figcaption><b>' + h(e.n) + '</b>' + h(e.t || e.gang || '') + '</figcaption></figure>'; }).join('') + '</div>' : '') +
      '<div class="wu"><div class="wl">' + reihen + '</div>' +
      (t.preis.length ? '<div class="wp">' + t.preis.map(function (p) { return '<div><span>' + h(p[1] || 'Preis') + '</span><b>' + h(p[0]) + ' €</b></div>'; }).join('') + '<p>' + h(t.hinweis || R.Tische || '') + '</p><span class="wp__kn">Tisch reservieren</span></div>' : '') +
      '</div></section>';
  }
  function startSeite(t, k) {
    var e = [];
    t.rubriken.forEach(function (r) { r.e.forEach(function (x) { if (e.length < 5) e.push(x); }); });
    return kopf() +
      '<section class="wh wh--gross">' + img('hero', '') + '<div class="wh__t"><h1>' + h((H.HAUS || {}).satz || '') + '</h1><p>' + h((H.HAUS || {}).kurz || '') + '</p></div></section>' +
      '<section class="wt wt--gruen"><div class="wt__k"><h2>' + h(k.ziel === 'woche' ? 'Diese Woche im Kontorsaal.' : (t.titel || k.name) + '.') + '</h2><p>' + h(t.unter) + '</p></div>' +
      '<div class="ws">' + e.map(function (x) { return '<div class="ws__e">' + img(foto(x.n), x.n) + '<b>' + h(x.n) + '</b><span>' + h(x.t || x.gang || '') + '</span>' + (x.p ? '<i>' + h(x.p) + ' €</i>' : '') + '</div>'; }).join('') + '</div>' +
      '<p class="ws__mehr">Die ganze Karte auf der Seite «Die Karte»</p></section>';
  }
  window.LB_SETZE = function (o) {
    if (!o || !o.daten || !SATZ) return;
    var k = (o.liste || []).filter(function (x) { return x.ziel === o.z; })[0] || { ziel: o.z, name: '' };
    k.foto = ((P.LB_DATEN || {}).fotos || {})[o.z];
    var t = teile(o.daten);
    document.getElementById('seite').innerHTML = SEITE === 'index' ? startSeite(t, k) : karteSeite(t, k);
  };
})();
