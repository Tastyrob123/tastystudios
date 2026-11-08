/* vorfuehrung.js · Website bearbeiten (Ihr Haus), Vorführung.
   Der Server der Vorlage (Stamm _Werkzeuge/werkzeuge/website/api.py mit schicht.py und unterbau/speicher.py), nachgebaut im Arbeitsspeicher des Browsers:
   dieselben Wege, dieselben Antworten. website.js ruft statt fetch() WS_RUF(methode, weg, daten). Die Seiten, ihre Stellen und die früheren Fassungen
   kommen aus daten-website.js (aufgenommen mit dem Code der Vorlage über die gebauten Seiten von Ihr Haus). Nichts wird gespeichert oder verschickt:
   neu laden oder «Zurücksetzen» stellt den Anfang wieder her. */
(function () {
  'use strict';
  var D = window.WS_DATEN, HAUS = 'ihrhaus';
  var FEST_NAME = { header: 'Kopf und Menü', nav: 'Menü', footer: 'Fuss der Seite' };
  var OBER = { h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, b: 1, strong: 1, dt: 1, th: 1, summary: 1, legend: 1 };
  var ZAHL = /(CHF|Fr\.|€|\bUhr\b|\d+\s?(Minuten|Min\.|m²|m2|Personen|Pers\.|Nächte?|Nacht|Betten|Plätze|km|m ü\. M\.)|\d{1,2}[.:]\d{2}\s?(?:[–-]|bis)\s?\d{1,2}[.:]\d{2}|\d{1,2}[.:]\d{2}\s?Uhr)/;
  var FELD = { texte: 'h', bilder: 'b', links: 'h', aus: 'h', seo: 'h' };
  var FOTOS_DA = {};   // Fassungen, die im gemeinsamen Ordner ../_haus/img liegen
  (D.da || []).forEach(function (n) { FOTOS_DA[n] = 1; });

  function kopie(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function leer() { return { texte: [], bilder: [], links: [], aus: [], hinweis: {}, seo: [], angaben: {} }; }
  function istLeer(c) { c = c || {}; return !['texte', 'bilder', 'links', 'aus', 'seo'].some(function (k) { return (c[k] || []).length; }) && !Object.keys(c.hinweis || {}).length && !Object.keys(c.angaben || {}).length; }
  function schicht(d) {
    var c = leer();
    if (d && typeof d === 'object') Object.keys(c).forEach(function (k) { if (Array.isArray(c[k]) ? Array.isArray(d[k]) : (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]))) c[k] = d[k]; });
    return c;
  }
  function sortiert(x) { if (Array.isArray(x)) return x.map(sortiert); if (x && typeof x === 'object') { var o = {}; Object.keys(x).sort().forEach(function (k) { o[k] = sortiert(x[k]); }); return o; } return x; }
  function kennung(d) {   // wie speicher.kennung: Fingerabdruck des Stands (hier ein kurzer Hash statt sha256, er wird nur verglichen)
    var s = JSON.stringify(sortiert(d)), h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822507); }
    return ('0000000' + (h1 >>> 0).toString(16)).slice(-8) + ('0000000' + (h2 >>> 0).toString(16)).slice(-8);
  }
  var ent = document.createElement('textarea');
  function unesc(s) { ent.innerHTML = String(s); return ent.value; }
  function klar(s) { return unesc(String(s == null ? '' : s).replace(/<[^>]*>/g, ' ')).replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim(); }
  function esc(s, quote) { s = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); return quote ? s.replace(/"/g, '&quot;').replace(/'/g, '&#x27;') : s; }
  function jetzt() { var d = new Date(), z = function (n) { return ('0' + n).slice(-2); }; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + 'T' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds()); }
  function Fehler(status, stichwort, fehler, mehr) { var e = { status: status, stichwort: stichwort, fehler: fehler }; for (var k in mehr || {}) e[k] = mehr[k]; return e; }

  // ------------------------------------------------------------------ Speicher (wie unterbau/speicher.py, im Arbeitsspeicher)
  var SP;
  function anfang() {
    SP = { live: leer(), entwurf: null, verlauf: kopie(D.fassungen), protokoll: kopie(D.protokoll) };
  }
  anfang();
  function lesen() {
    var kl = kennung(SP.live), ke = SP.entwurf ? kennung(SP.entwurf) : null;
    return { live: SP.live, entwurf: SP.entwurf, kennung_live: kl, kennung_entwurf: ke, offen: !!SP.entwurf && ke !== kl };
  }
  function vermerk(was, wer, mehr) { var z = { zeit: jetzt(), was: was, wer: wer || '' }; for (var k in mehr || {}) z[k] = mehr[k]; SP.protokoll.unshift(z); }
  function arbeits(s) { return schicht(s.entwurf != null ? s.entwurf : s.live); }

  // ------------------------------------------------------------------ Seiten und Stellen
  function seiten() { return Object.keys(D.seiten); }
  function seite(n) { var p = D.seiten[n]; if (!p) throw Fehler(404, 'seite-unbekannt', 'Diese Seite gehört nicht zur Website.'); return p; }
  function name(n) { return D.namen[n] || n; }
  function stelleVon(n, h, nr) { return seite(n).texte.filter(function (t) { return t.h === h && t.n === nr; })[0] || null; }
  function html(n, st) { return seite(n).src.slice(st.s, st.e); }
  function regel(c, art, s, a, n) { var f = FELD[art]; return (c[art] || []).filter(function (x) { return x.seite === s && x[f] === a && +(x.n || 0) === n; })[0] || null; }
  function weg(c, art, s, a, n) { var f = FELD[art]; c[art] = (c[art] || []).filter(function (x) { return !(x.seite === s && x[f] === a && +(x.n || 0) === n); }); }
  function schluessel(art, s, a, n) { return art + '|' + s + '|' + a + '|' + n; }
  function kontext(n, st) { return seite(n).kontext[st.h + '|' + st.n] || ['', '', '', 0]; }
  function gleiche(n, st) {
    var kx = JSON.stringify(kontext(n, st)), aus = [];
    seiten().forEach(function (m) {
      var p = seite(m);
      Object.keys(p.kontext).forEach(function (key) {
        var i = key.lastIndexOf('|'), h = key.slice(0, i), nr = +key.slice(i + 1);
        if (h === st.h && JSON.stringify(p.kontext[key]) === kx && !(stelleVon(m, h, nr) || {}).zu) aus.push({ seite: m, n: nr });
      });
    });
    return aus;
  }
  function kurz(b) { return D.kurz[b] || ''; }
  function ahnen(n, blk, c) {
    var p = seite(n), aus = [];
    while (blk != null) {
      var b = p.bloecke[blk];
      if (!b.fest && !b.zu) aus.push({ h: b.h, n: b.n, tag: b.tag, t: b.t.slice(0, 90), aus: !!regel(c, 'aus', n, b.h, b.n) });
      blk = b.eltern;
    }
    return aus;
  }

  // ------------------------------------------------------------------ Was offen ist
  function paar(art, c, s) {
    var f = FELD[art], a = {}, b = {}, keys = [];
    (s[art] || []).forEach(function (x) { var k = x.seite + '\u0001' + x[f] + '\u0001' + (+(x.n || 0)); a[k] = x; if (keys.indexOf(k) < 0) keys.push(k); });
    (c[art] || []).forEach(function (x) { var k = x.seite + '\u0001' + x[f] + '\u0001' + (+(x.n || 0)); b[k] = x; if (keys.indexOf(k) < 0) keys.push(k); });
    return keys.filter(function (k) { return JSON.stringify(a[k]) !== JSON.stringify(b[k]); }).map(function (k) { var t = k.split('\u0001'); return [[t[0], t[1], +t[2]], a[k], b[k]]; });
  }
  function aenderungen(c, s) {
    var aus = [];
    paar('texte', c, s).forEach(function (p) {
      var k = p[0], a = p[1], b = p[2], x = b || a;
      aus.push({ key: schluessel('text', k[0], k[1], k[2]), art: 'text', seite: k[0], h: k[1], n: k[2], wo: name(k[0]), was: 'Text',
        vorher: a ? klar(a.neu) : (x.alt || ''), nachher: b ? klar(b.neu) : (x.alt || ''), zurueck: !b });
    });
    paar('bilder', c, s).forEach(function (p) {
      var k = p[0], a = p[1], b = p[2], x = b || a;
      aus.push({ key: schluessel('bild', k[0], k[1], k[2]), art: 'bild', seite: k[0], b: k[1], n: k[2], wo: name(k[0]), was: 'Foto',
        vorher: (a || {}).neu || k[1], nachher: (b || {}).neu || k[1], vorher_bild: kurz((a || {}).neu || k[1]), nachher_bild: kurz((b || {}).neu || k[1]),
        alt: (b || {}).alt || x.alt_alt || '', zurueck: !b });
    });
    paar('links', c, s).forEach(function (p) {
      var k = p[0], a = p[1], b = p[2], x = b || a;
      aus.push({ key: schluessel('link', k[0], k[1], k[2]), art: 'link', seite: k[0], h: k[1], n: k[2], wo: name(k[0]), was: 'Link «' + (x.t || '') + '»',
        vorher: a ? a.neu : (x.alt || ''), nachher: b ? b.neu : (x.alt || ''), zurueck: !b });
    });
    paar('aus', c, s).forEach(function (p) {
      var k = p[0], a = p[1], b = p[2], x = b || a;
      aus.push({ key: schluessel('aus', k[0], k[1], k[2]), art: 'aus', seite: k[0], h: k[1], n: k[2], wo: name(k[0]),
        was: b ? 'Abschnitt ausgeblendet' : 'Abschnitt wieder gezeigt', vorher: b ? (x.t || '') : '', nachher: b ? '' : (x.t || ''), zurueck: !b });
    });
    var aS = {}, bS = {}, ks = [];
    (s.seo || []).forEach(function (x) { aS[x.seite] = x; if (ks.indexOf(x.seite) < 0) ks.push(x.seite); });
    (c.seo || []).forEach(function (x) { bS[x.seite] = x; if (ks.indexOf(x.seite) < 0) ks.push(x.seite); });
    ks.forEach(function (n) {
      var a = aS[n], b = bS[n];
      if (JSON.stringify(a) === JSON.stringify(b)) return;
      var x = b || a, alt = [x.alt_titel || '', x.alt_beschreibung || ''].filter(Boolean).join(' · ');
      var t = function (y) { return [(y || {}).titel || '', (y || {}).beschreibung || ''].filter(Boolean).join(' · '); };
      aus.push({ key: schluessel('seo', n, 'kopf', 0), art: 'seo', seite: n, h: 'kopf', n: 0, wo: name(n), was: 'Google-Texte', vorher: t(a) || alt, nachher: t(b) || alt, zurueck: !b });
    });
    if (JSON.stringify(s.hinweis || {}) !== JSON.stringify(c.hinweis || {})) {
      var ha = s.hinweis || {}, hb = c.hinweis || {};
      aus.push({ key: 'hinweis', art: 'hinweis', seite: '', wo: 'Alle Seiten', was: 'Hinweis für Gäste', vorher: ha.an ? (ha.text || '') : '', nachher: hb.an ? (hb.text || '') : '', zurueck: false });
    }
    return aus;
  }
  function stand() {
    var s = lesen(), live = schicht(s.live), c = arbeits(s), ae = s.offen ? aenderungen(c, live) : [];
    var zuletzt = SP.protokoll.filter(function (z) { return z.was === 'veroeffentlicht'; })[0] || null;
    return { kennung: s.kennung_entwurf || s.kennung_live, kennung_live: s.kennung_live, offen: s.offen, aenderungen: ae, zuletzt: zuletzt, fehlt: 0, daten: c };
  }

  // ------------------------------------------------------------------ Verzeichnis, Stelle, Foto
  function verzeichnis(n, c) {
    var p = seite(n);
    var gruppen = p.gruppen.map(function (g) {
      var ng = { h: g.h, n: g.n, titel: g.titel, tag: g.tag, fest: g.fest, zu: g.zu };
      ng.aus = g.h ? !!regel(c, 'aus', n, g.h, g.n) : false;
      ng.stellen = g.stellen.map(function (st) {
        var r = regel(c, 'texte', n, st.h, st.n), x = Object.assign({}, st, { gleich: p.mal[st.h] || 1 });
        if (r) { x.neu = klar(r.neu); x.nur = !!r.nur_sprachen; }
        return x;
      });
      ng.fotos = g.fotos.map(function (f) { var r = regel(c, 'bilder', n, f.b, f.n); return Object.assign({}, f, { klein: kurz((r || {}).neu || f.b), neu: !!r }); });
      return ng;
    });
    return { seite: n, name: name(n), gruppen: gruppen, ausgeblendet: (c.aus || []).filter(function (a) { return a.seite === n; }).map(function (a) { return { h: a.h, n: +(a.n || 0), t: a.t || '' }; }) };
  }
  function stelle(n, h, nr, c, live) {
    var st = stelleVon(n, h, nr);
    if (!st) throw Fehler(404, 'stelle-fehlt', 'Diese Stelle gibt es auf der Seite nicht mehr.');
    var r = regel(c, 'texte', n, h, nr), rl = regel(live, 'texte', n, h, nr), original = html(n, st), kx = kontext(n, st);
    return { seite: n, seite_name: name(n), h: h, n: nr, tag: st.tag, art: st.art, zu: st.zu || '', original: original, original_text: st.t, wert: r ? r.neu : original, stand: rl ? rl.neu : original,
      geaendert: !!r, nur: !!(r && r.nur_sprachen), abschnitt: FEST_NAME[kx[0]] || kx[0], ober: kx[1] !== kx[2] ? kx[1] : '', vor: kx[2], zahl: ZAHL.test(st.t), gleiche: gleiche(n, st), sprachen: [],
      bloecke: ahnen(n, st.blk, c) };
  }
  function foto(n, b, nr, c) {
    var f = seite(n).fotos.filter(function (x) { return x.b === b && x.n === nr; })[0];
    if (!f) throw Fehler(404, 'stelle-fehlt', 'Dieses Foto gibt es auf der Seite nicht mehr.');
    var r = regel(c, 'bilder', n, b, nr), j = (r || {}).neu || b;
    return { seite: n, seite_name: name(n), b: b, n: nr, zu: f.zu || '', original: b, wert: j, klein: kurz(j), klein_original: kurz(b), alt_original: f.alt, alt: (r || {}).alt || f.alt,
      geaendert: !!r, sprachen: [], bloecke: ahnen(n, f.blk, c) };
  }

  // ------------------------------------------------------------------ Zeiten und Preise, Bereiche, Google, Angaben
  function zahlen(c) {
    var d = kopie(D.zahlen);
    d.gruppen.forEach(function (g) {
      g.zeilen.forEach(function (z) {
        var werte = {}, alle = true;
        z.orte.forEach(function (o) { var r = regel(c, 'texte', o.seite, z.h, o.n); if (r) werte[klar(r.neu)] = 1; else alle = false; });
        var w = Object.keys(werte);
        z.neu = w.length === 1 && alle ? w[0] : '';
        z.teils = w.length > 0 && !z.neu;
      });
    });
    return d;
  }
  function bereich(key, c) {
    var d = kopie(D.bereiche[key]);
    if (!d) throw Fehler(404, 'bereich-aus', 'Diesen Bereich hat das Haus nicht.');
    d.eintraege.forEach(function (e) {
      if (e.blk) e.aus = !!regel(c, 'aus', e.seite, e.blk.h, e.blk.n);
      e.felder.forEach(function (f) {
        f.teile.forEach(function (x) {
          if ('b' in x) { var rb = regel(c, 'bilder', e.seite, x.b, x.n); x.klein = kurz((rb || {}).neu || x.b); x.alt = (rb || {}).alt || x.alt; x.neu = !!rb; }
          else if ('t' in x && 'original' in x && !('wert' in x)) { var r = regel(c, 'texte', e.seite, x.h, x.n); x.t = r ? klar(r.neu) : x.original; x.neu = !!r; }
        });
      });
      var tf = e.felder.filter(function (f) { return f.teile.length && 't' in f.teile[0]; })[0];
      if (tf) e.titel = tf.teile.map(function (x) { return x.t; }).join(' ').slice(0, 120);
    });
    return d;
  }
  function google(c) {
    var d = kopie(D.google);
    d.seiten.forEach(function (x) {
      var r = regel(c, 'seo', x.seite, 'kopf', 0) || {};
      x.titel = r.titel || x.original_titel; x.beschreibung = r.beschreibung || x.original_beschreibung; x.geaendert = !!regel(c, 'seo', x.seite, 'kopf', 0);
    });
    return d;
  }
  function wortRegex(wert) {
    var teile = wert.split(/\s+/).filter(Boolean).map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '(?:&|&amp;)'); });
    return new RegExp('(?<![\\p{L}\\p{N}_])' + teile.join('(?:\\s|&nbsp;|&#160;|\\u00a0)+') + (/[\p{L}\p{N}_]$/u.test(wert) ? '(?![\\p{L}\\p{N}_])' : ''), 'gu');
  }
  function telLink(w) { var z = w.replace(/\D/g, ''); return w.trim().charAt(0) === '+' ? 'tel:+' + z : (z.charAt(0) === '0' ? 'tel:+49' + z.slice(1) : 'tel:' + z); }
  function angabeDef(key) { var a = D.angaben_def.filter(function (x) { return x.key === key; })[0]; if (!a) throw Fehler(404, 'angabe-unbekannt', 'Diese Angabe kennt das Werkzeug nicht.'); return a; }
  function angabeOrte(c, a) {
    var jetzt_ = (c.angaben || {})[a.key] || a.wert, werte = [jetzt_, a.wert].filter(function (w, i, l) { return w && l.indexOf(w) === i; });
    var hrefAlt = {}; hrefAlt[a.wert] = a.link || (a.art === 'mail' ? 'mailto:' + a.wert : a.art === 'link' ? a.wert : a.art === 'telefon' ? telLink(a.wert) : null);
    hrefAlt[jetzt_] = a.art === 'telefon' ? telLink(jetzt_) : a.art === 'mail' ? 'mailto:' + jetzt_ : a.art === 'link' ? jetzt_ : null;
    var hrefs = Object.keys(hrefAlt).map(function (k) { return hrefAlt[k]; }).filter(Boolean), texte = [], links = [];
    seiten().forEach(function (n) {
      var p = seite(n);
      if (a.art !== 'link') p.texte.forEach(function (st) {
        if (st.zu) return;
        var r = regel(c, 'texte', n, st.h, st.n), h = r ? r.neu : html(n, st);
        if (werte.some(function (w) { return wortRegex(w).test(h); })) texte.push({ seite: n, h: st.h, n: st.n, html: h, t: klar(h) });
      });
      p.links.forEach(function (x) {
        if (x.zu) return;
        var r = regel(c, 'links', n, x.h, x.n), href = unesc(r ? r.neu : x.href);
        if (hrefs.indexOf(href) >= 0) links.push({ seite: n, h: x.h, n: x.n, href: href, t: x.t });
      });
    });
    return [jetzt_, texte, links];
  }
  function kurzSatz(t, n) { n = n || 110; return t.length <= n ? t : t.slice(0, n - 1) + '…'; }
  function angaben(c) {
    return { angaben: D.angaben_def.map(function (a) {
      var o = angabeOrte(c, a), s = {};
      o[1].concat(o[2]).forEach(function (x) { s[x.seite] = 1; });
      return { key: a.key, label: a.label, art: a.art, wert: o[0], original: a.wert, geaendert: o[0] !== a.wert, stellen: o[1].length, links: o[2].length, seiten: Object.keys(s).length,
        beispiel: o[1].slice(0, 3).map(function (x) { return { seite: x.seite, name: name(x.seite), t: kurzSatz(x.t) }; }) };
    }) };
  }

  // ------------------------------------------------------------------ Eingaben säubern (wie schicht.sauber)
  function linkGut(l) { return /^(https?:\/\/[^\s"<>]+|mailto:[^\s"<>]+|tel:[+\d][\d ]*|#[\w-]*|[\w\-./]+\.(?:html|pdf)(?:#[\w-]*)?)$/.test(l || '') && !/[\s"'<>`]/.test(l); }
  function klassenIn(h) { var k = {}; String(h || '').replace(/class="([^"]*)"/g, function (m, g) { g.split(/\s+/).forEach(function (x) { if (x) k[x] = 1; }); }); return k; }
  var ERLAUBT = { b: 1, strong: 1, i: 1, em: 1, span: 1, small: 1, a: 1, br: 1, sup: 1, sub: 1 };
  function sauber(h, klassen) {
    var tpl = document.createElement('template'); tpl.innerHTML = String(h);
    var aus = [];
    function gang(k) {
      k.childNodes.forEach(function (x) {
        if (x.nodeType === 3) { aus.push(x.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00a0/g, '&nbsp;')); return; }
        if (x.nodeType !== 1) return;
        var t = x.tagName.toLowerCase();
        if ((t === 'div' || t === 'p') && aus.length && aus[aus.length - 1] !== '<br>') aus.push('<br>');
        if (!ERLAUBT[t]) { gang(x); return; }
        if (t === 'br') { aus.push('<br>'); return; }
        var o = '', kl = (x.getAttribute('class') || '').split(/\s+/).filter(function (z) { return z && klassen[z]; }).join(' ');
        if (kl) o += ' class="' + kl + '"';
        if (t === 'a') { var hr = x.getAttribute('href') || ''; if (!linkGut(hr)) { gang(x); return; } o += ' href="' + esc(hr, true) + '"' + (/^http/.test(hr) ? ' target="_blank" rel="noopener"' : ''); }
        aus.push('<' + t + o + '>'); gang(x); aus.push('</' + t + '>');
      });
    }
    gang(tpl.content);
    return aus.join('').replace(/(<br>\s*)+$/, '').replace(/[ \t\r\n]+/g, ' ').trim();
  }

  // ------------------------------------------------------------------ Speichern in den Entwurf (wie api._op)
  function op_(c, live, op, quittung) {
    var art = op.art, s = op.seite || '';
    if (['text', 'bild', 'link', 'aus'].indexOf(art) >= 0 && !D.seiten[s]) throw Fehler(404, 'seite-unbekannt', 'Diese Seite gehört nicht zur Website.');
    if (art === 'text') {
      var orte = op.orte || [{ seite: s, n: +(op.n || 0) }], erste = stelleVon(s, op.h, +(op.n || 0));
      if (!erste) throw Fehler(404, 'stelle-fehlt', 'Diese Stelle gibt es auf der Seite nicht mehr. Bitte die Seite neu laden.');
      var erlaubt = {}; (op.orte ? gleiche(s, erste) : []).forEach(function (o) { erlaubt[o.seite + '|' + o.n] = 1; }); erlaubt[s + '|' + erste.n] = 1;
      orte.forEach(function (o) {
        if (!erlaubt[o.seite + '|' + (+(o.n || 0))]) throw Fehler(422, 'stelle-fehlt', 'Eine der Stellen passt nicht zu dieser Angabe.');
        var st = stelleVon(o.seite, op.h, +o.n);
        if (st.zu) throw Fehler(423, 'gesperrt', 'Diese Stelle pflegt ein anderes Werkzeug.', { werkzeug: st.zu });
        var original = html(o.seite, st), neu = sauber(op.neu || '', klassenIn(original));
        if (!klar(neu)) throw Fehler(422, 'leer', 'Ein leerer Text bleibt als Lücke stehen. Zum Entfernen gibt es «Abschnitt ausblenden».');
        if (neu.length > 6000) throw Fehler(422, 'zu-lang', 'Dieser Text ist zu lang für eine Stelle.');
        var vor = regel(c, 'texte', o.seite, st.h, st.n);
        weg(c, 'texte', o.seite, st.h, st.n);
        var form = function (x) { return x.replace(/<[^>]*>/g, '<>').replace(/\s+/g, ' '); };
        var gleich = klar(neu) === st.t && form(neu) === form(sauber(original, klassenIn(original)));
        if (!gleich) c.texte.push({ seite: o.seite, h: st.h, n: st.n, neu: neu, alt: st.t, sprachen: {} });
        var rl = regel(live, 'texte', o.seite, st.h, st.n);
        quittung.push({ key: schluessel('text', o.seite, st.h, st.n), wo: name(o.seite), was: 'Text', vorher: vor ? klar(vor.neu) : st.t, nachher: klar(neu), stand: rl ? klar(rl.neu) : st.t });
      });
    } else if (art === 'bild') {
      var f = seite(s).fotos.filter(function (x) { return x.b === op.b && x.n === +(op.n || 0); })[0];
      if (!f) throw Fehler(404, 'stelle-fehlt', 'Dieses Foto gibt es auf der Seite nicht mehr.');
      if (f.zu) throw Fehler(423, 'gesperrt', 'Dieses Foto pflegt ein anderes Werkzeug.', { werkzeug: f.zu });
      var ziel = op.neu || f.b;
      if (!D.spender[ziel]) throw Fehler(422, 'foto-unbekannt', 'Dieses Foto gibt es auf der Website nicht.');
      var alt = String(op.alt != null ? op.alt : f.alt).replace(/\s+/g, ' ').trim().slice(0, 400), vb = regel(c, 'bilder', s, f.b, f.n);
      weg(c, 'bilder', s, f.b, f.n);
      if (ziel !== f.b || alt !== f.alt) c.bilder.push({ seite: s, b: f.b, n: f.n, neu: ziel, alt: alt, alt_alt: f.alt, alt_sprachen: {} });
      quittung.push({ key: schluessel('bild', s, f.b, f.n), wo: name(s), was: 'Foto', vorher: (vb || {}).neu || f.b, nachher: ziel, vorher_bild: kurz((vb || {}).neu || f.b), nachher_bild: kurz(ziel) });
    } else if (art === 'link') {
      var x = seite(s).links.filter(function (l) { return l.h === op.h && l.n === +(op.n || 0); })[0];
      if (!x) throw Fehler(404, 'stelle-fehlt', 'Diesen Link gibt es auf der Seite nicht mehr.');
      if (x.zu) throw Fehler(423, 'gesperrt', 'Diesen Link pflegt ein anderes Werkzeug.', { werkzeug: x.zu });
      var zl = String(op.neu || '').trim();
      if (!linkGut(zl)) throw Fehler(422, 'link', 'Eine Adresse beginnt mit https://, mailto: oder tel:, oder sie nennt eine Seite oder ein PDF der Website.');
      var vl = regel(c, 'links', s, x.h, x.n);
      weg(c, 'links', s, x.h, x.n);
      if (zl !== x.href) c.links.push({ seite: s, h: x.h, n: x.n, neu: zl, alt: x.href, t: x.t });
      quittung.push({ key: schluessel('link', s, x.h, x.n), wo: name(s), was: 'Link «' + x.t + '»', vorher: vl ? vl.neu : x.href, nachher: zl });
    } else if (art === 'aus') {
      var blk = seite(s).bloecke.filter(function (b) { return b.h === op.h && b.n === +(op.n || 0); })[0];
      if (!blk) throw Fehler(404, 'stelle-fehlt', 'Diesen Abschnitt gibt es auf der Seite nicht mehr.');
      if (blk.fest || blk.zu) throw Fehler(423, 'gesperrt', 'Dieser Abschnitt lässt sich hier nicht ausblenden.', { werkzeug: blk.zu || '' });
      var war = !!regel(c, 'aus', s, blk.h, blk.n);
      weg(c, 'aus', s, blk.h, blk.n);
      if (op.an) c.aus.push({ seite: s, h: blk.h, n: blk.n, t: blk.t.slice(0, 120) });
      quittung.push({ key: schluessel('aus', s, blk.h, blk.n), wo: name(s), was: 'Abschnitt', vorher: war ? 'ausgeblendet' : 'zu sehen', nachher: op.an ? 'ausgeblendet' : 'zu sehen' });
    } else if (art === 'hinweis') {
      var ha = c.hinweis || {}, text = String(op.text || '').replace(/\s+/g, ' ').trim().slice(0, 300), link = String(op.link || '').trim();
      if (link && !linkGut(link)) throw Fehler(422, 'link', 'Eine Adresse beginnt mit https://, mailto: oder tel:, oder sie nennt eine Seite oder ein PDF der Website.');
      var von = datum(op.von), bis = datum(op.bis);
      if (von && bis && von > bis) throw Fehler(422, 'datum', '«Bis» liegt vor «Von».');
      if (op.an && !text) throw Fehler(422, 'leer', 'Ein Hinweis ohne Text bleibt unsichtbar. Bitte einen Satz schreiben oder den Hinweis ausschalten.');
      var nh = { an: !!op.an, text: text, von: von, bis: bis, link: link, linktext: String(op.linktext || '').replace(/\s+/g, ' ').trim().slice(0, 60), sprachen: {} };
      c.hinweis = (nh.an || text) ? nh : {};
      quittung.push({ key: 'hinweis', wo: 'Alle Seiten', was: 'Hinweis für Gäste', vorher: ha.an ? (ha.text || '') : 'aus', nachher: nh.an ? text : 'aus' });
    } else if (art === 'weg') {
      var key = String(op.key || '');
      if (key === 'hinweis') { c.hinweis = kopie(live.hinweis || {}); quittung.push({ key: key, wo: 'Alle Seiten', was: 'Hinweis für Gäste', vorher: 'geändert', nachher: 'wie veröffentlicht' }); }
      else {
        var t = key.split('|');
        if (t.length !== 4 || ['text', 'bild', 'link', 'aus', 'seo'].indexOf(t[0]) < 0) throw Fehler(422, 'stelle-fehlt', 'Diese Änderung gibt es nicht.');
        var fe = { text: 'texte', bild: 'bilder', link: 'links', aus: 'aus', seo: 'seo' }[t[0]], nn = +t[3], alt_ = regel(live, fe, t[1], t[2], nn);
        weg(c, fe, t[1], t[2], nn);
        if (alt_) c[fe].push(kopie(alt_));
        quittung.push({ key: key, wo: name(t[1]), was: 'Änderung zurückgenommen', vorher: 'geändert', nachher: 'wie veröffentlicht' });
      }
    } else if (art === 'seo') {
      if (!D.seiten[s]) throw Fehler(404, 'seite-unbekannt', 'Diese Seite gehört nicht zur Website.');
      var o0 = seite(s).seo, titel = klar(String(op.titel || '')).replace(/\s+/g, ' ').trim(), be = klar(String(op.beschreibung || '')).replace(/\s+/g, ' ').trim();
      if (!titel) throw Fehler(422, 'leer', 'Ohne Titel zeigt Google die Seite mit ihrer Adresse. Bitte einen Titel schreiben.');
      if (titel.length > 120 || be.length > 320) throw Fehler(422, 'zu-lang', 'Google schneidet so lange Texte ab. Titel höchstens 120, Beschreibung höchstens 320 Zeichen.');
      if (be && !o0[2]) throw Fehler(422, 'stelle-fehlt', 'Diese Seite hat keine Beschreibung für Google, die sich ändern liesse.');
      var vs = regel(c, 'seo', s, 'kopf', 0);
      weg(c, 'seo', s, 'kopf', 0);
      if (titel !== o0[0] || (be && be !== o0[1])) c.seo.push({ seite: s, h: 'kopf', n: 0, titel: titel, beschreibung: be !== o0[1] ? be : '', alt_titel: o0[0], alt_beschreibung: o0[1] });
      quittung.push({ key: schluessel('seo', s, 'kopf', 0), wo: name(s), was: 'Google-Texte', vorher: (vs || {}).titel || o0[0], nachher: titel });
    } else if (art === 'angabe') {
      var a = angabeDef(op.key), neuW = String(op.neu || '').replace(/\s+/g, ' ').trim();
      if (!neuW) throw Fehler(422, 'leer', 'Eine Angabe ohne Wert bleibt als Lücke auf der Website stehen.');
      if (a.art === 'telefon' && !/^\+?[\d ]{8,20}$/.test(neuW)) throw Fehler(422, 'angabe-telefon', 'Eine Telefonnummer besteht nur aus Ziffern und Leerzeichen, vorne höchstens ein «+».');
      if (a.art === 'mail' && !/^[^@\s<>"]+@[^@\s<>"]+\.[a-z]{2,}$/i.test(neuW)) throw Fehler(422, 'angabe-mail', 'Eine E-Mail-Adresse sieht so aus: name@haus.de');
      if (neuW.length > 200) throw Fehler(422, 'zu-lang', 'Diese Angabe ist zu lang.');
      var or = angabeOrte(c, a), jw = or[0];
      if (neuW === jw) return;
      if (!or[1].length && !or[2].length) throw Fehler(422, 'stelle-fehlt', 'Diese Angabe steht auf keiner Seite mehr.');
      var ersatz = esc(neuW);
      or[1].forEach(function (x) {
        var hh = x.html;
        [jw, a.wert].filter(function (w, i, l) { return l.indexOf(w) === i; }).forEach(function (w) { hh = hh.replace(wortRegex(w), function () { return ersatz; }); });
        op_(c, live, { art: 'text', seite: x.seite, h: x.h, n: x.n, neu: hh }, []);
      });
      var zg = a.art === 'telefon' ? telLink(neuW) : a.art === 'mail' ? 'mailto:' + neuW : a.art === 'link' ? neuW : null;
      if (zg) or[2].forEach(function (x) { op_(c, live, { art: 'link', seite: x.seite, h: x.h, n: x.n, neu: zg }, []); });
      c.angaben = c.angaben || {}; c.angaben[a.key] = neuW;
      if (neuW === a.wert) delete c.angaben[a.key];
      var sz = {}; or[1].concat(or[2]).forEach(function (x) { sz[x.seite] = 1; });
      quittung.push({ key: 'angabe|' + a.key, wo: or[1].length + ' Stellen auf ' + Object.keys(sz).length + ' Seiten', was: a.label, vorher: jw, nachher: neuW });
    } else throw Fehler(400, 'anfrage', 'Diese Art von Änderung kennt das Werkzeug nicht.');
  }
  function datum(t) {
    t = String(t || '').trim();
    if (!t) return '';
    var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(t);
    if (m) t = m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) throw Fehler(422, 'datum', 'Ein Datum schreiben Sie so: 24.12.2026');
    var d = new Date(t + 'T12:00:00');
    if (isNaN(d) || d.toISOString().slice(0, 10) !== t) throw Fehler(422, 'datum', 'Dieses Datum gibt es nicht.');
    return t;
  }
  function aendern(d) {
    var ops = d.ops;
    if (!Array.isArray(ops) || !ops.length || ops.length > 400) throw Fehler(400, 'anfrage', 'Es fehlt, was geändert werden soll.');
    var s = lesen(), j = s.kennung_entwurf || s.kennung_live;
    if (d.erwartet !== j) throw Fehler(409, 'konflikt', 'Der Stand wurde inzwischen geändert');
    var live = schicht(s.live), c = kopie(arbeits(s)), vorher = kopie(c), quittung = [];
    ops.forEach(function (o) { op_(c, live, o, quittung); });
    ['texte', 'bilder', 'links', 'aus', 'seo'].forEach(function (k) {
      c[k].sort(function (a, b) { var x = (a.seite || '') + '\u0001' + String(a.h || a.b) + '\u0001' + ('00000' + (+(a.n || 0))).slice(-6), y = (b.seite || '') + '\u0001' + String(b.h || b.b) + '\u0001' + ('00000' + (+(b.n || 0))).slice(-6); return x < y ? -1 : x > y ? 1 : 0; });
    });
    if (kennung(c) === kennung(vorher)) return { nichts: true, meldung: 'Nichts geändert, nichts gespeichert.', stand: stand() };
    SP.entwurf = c; vermerk('entwurf', d.wer, { kennung: kennung(c) });
    return { nichts: false, quittung: quittung, vorher_daten: vorher, stand: stand() };
  }
  function veroeffentlichen(d) {
    var s = lesen();
    if (!s.offen) throw Fehler(409, 'nichts-offen', 'Nichts geändert, nichts veröffentlicht.');
    if (d.erwartet && d.erwartet !== s.kennung_entwurf) throw Fehler(409, 'konflikt', 'Der Entwurf wurde inzwischen geändert');
    var c = schicht(SP.entwurf), n = aenderungen(c, schicht(SP.live)).length, z = jetzt(), betroffen = {};
    aenderungen(c, schicht(SP.live)).forEach(function (a) { if (a.seite) betroffen[a.seite] = 1; else seiten().forEach(function (x) { betroffen[x] = 1; }); });
    SP.verlauf.unshift({ fassung: z.replace(/[-:]/g, '').replace('T', '-') + '-' + s.kennung_live, abgeloest: z, wer: d.wer || '', notiz: String(d.notiz || '').slice(0, 300), daten: SP.live });
    SP.live = c; SP.entwurf = null;
    vermerk('veroeffentlicht', d.wer, { kennung: kennung(c), notiz: String(d.notiz || '') });
    setTimeout(function () { if (window.DEMO) DEMO.hinweis('Vorführung: Es ging nichts online. Die Vorschau zeigt, wie die Website jetzt aussähe.'); }, 600);
    return { geschrieben: Object.keys(betroffen), aenderungen: n, fehlt: {}, online: '', stand: stand() };
  }
  function verlauf() {
    var live = schicht(SP.live);
    var aus = SP.verlauf.map(function (v) { return { fassung: v.fassung, abgeloest: v.abgeloest, wer: v.wer, notiz: v.notiz, unterschiede: aenderungen(schicht(v.daten), live).length, ursprung: false }; });
    if (aus.length && istLeer(schicht(SP.verlauf[SP.verlauf.length - 1].daten))) aus[aus.length - 1].ursprung = true;
    return { verlauf: aus, protokoll: SP.protokoll.slice(0, 30) };
  }
  function fassungLesen(name_) { var f = SP.verlauf.filter(function (v) { return v.fassung === name_; })[0]; if (!f) throw Fehler(404, 'fassung-unbekannt', 'Diese Fassung gibt es nicht.'); return f; }

  // ------------------------------------------------------------------ Vorschau: die Schicht über die Seite legen (wie schicht.anwenden)
  function rohAttr(tag, n) { var m = new RegExp('\\s' + n.replace(/-/g, '\\-') + '="([^"]*)"').exec(tag); return m ? m[1] : null; }
  function setzeRoh(tag, n, roh) {
    var mu = new RegExp('(\\s)' + n.replace(/-/g, '\\-') + '="[^"]*"');
    if (roh == null) return tag.replace(mu, '');
    if (mu.test(tag)) return tag.replace(mu, function (m, g) { return g + n + '="' + roh + '"'; });
    var e = tag.length - (/\/>$/.test(tag) ? 2 : 1);
    return tag.slice(0, e).replace(/\s+$/, '') + ' ' + n + '="' + roh + '"' + tag.slice(e);
  }
  function attr(tag, n, wert) {
    var mu = new RegExp('(\\s)' + n + '(?:=(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?(?=[\\s/>])');
    if (wert == null) return tag.replace(mu, '');
    var neu = n + '="' + esc(wert, true) + '"';
    if (mu.test(tag)) return tag.replace(mu, function (m, g) { return g + neu; });
    var e = tag.length - (/\/>$/.test(tag) ? 2 : 1);
    return tag.slice(0, e).replace(/\s+$/, '') + ' ' + neu + tag.slice(e);
  }
  function bildTag(tag, spender, alt) {
    var quelle = rohAttr(spender, 'data-src') || rohAttr(spender, 'src') || '', satz = rohAttr(spender, 'data-srcset') || rohAttr(spender, 'srcset'), spaet = rohAttr(tag, 'data-src') != null;
    tag = setzeRoh(tag, spaet ? 'data-src' : 'src', quelle.trim());
    tag = setzeRoh(tag, spaet ? 'data-srcset' : 'srcset', satz ? satz.split(',').map(function (t) { return t.trim(); }).join(', ') : null);
    var w = rohAttr(spender, 'width'), h = rohAttr(spender, 'height');
    if (w && h) tag = setzeRoh(setzeRoh(tag, 'width', w), 'height', h);
    var stil = rohAttr(tag, 'style');
    if (stil != null) {
      var neu = stil.replace(/background:[^;"]*url\([^)]*\)[^;"]*;?/g, '').replace(/object-position:[^;"]*;?/g, '').trim().replace(/;$/, '');
      tag = setzeRoh(tag, 'style', neu || null);
    }
    if (alt != null) tag = attr(tag, 'alt', alt);
    return tag;
  }
  function hinweisHtml(h) {
    if (!h || !h.an || !String(h.text || '').trim()) return '';
    var text = String(h.text).trim(), von = /^\d{4}-\d{2}-\d{2}$/.test(h.von || '') ? h.von : '', bis = /^\d{4}-\d{2}-\d{2}$/.test(h.bis || '') ? h.bis : '', link = String(h.link || '').trim(), knopf = '';
    if (link && linkGut(link)) knopf = ' <a href="' + esc(link, true) + '" style="color:inherit;text-decoration:underline;text-underline-offset:3px;white-space:nowrap">' + esc(h.linktext || 'Mehr erfahren') + '</a>';
    var zeit = (von ? ' data-von="' + von + '"' : '') + (bis ? ' data-bis="' + bis + '"' : '');
    var selbst = zeit ? '<script>(function(b){var d=new Date(),h=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2),v=b.getAttribute("data-von"),e=b.getAttribute("data-bis");b.hidden=!!(v&&h<v||e&&h>e)})(document.currentScript.previousElementSibling)<\/script>' : '';
    return '<div class="ws-hinweis" role="status"' + zeit + ' style="position:relative;z-index:5;padding:14px max(20px,4vw);text-align:center;border-bottom:1px solid currentColor;font:inherit;line-height:1.5"><p style="margin:0 auto;max-width:72ch">' + esc(text) + knopf + '</p></div>' + selbst;
  }
  function anwenden(n, c, nurNeu) {
    var p = seite(n), src = p.src, schnitte = [], wegs = [];
    var neuMarke = function (key, r) { return (nurNeu == null ? !!r : !!nurNeu[key]) ? ' data-ws-neu' : ''; };
    p.bloecke.forEach(function (b) {
      var r = regel(c, 'aus', n, b.h, b.n);
      if (r && !b.fest && !b.zu) wegs.push([b.s, b.ee]);
      else schnitte.push([b.se - 1, b.se - 1, ' data-ws-blk="' + b.h + '" data-ws-bln="' + b.n + '"' + (b.zu ? ' data-ws-zu="' + b.zu + '"' : '') + (nurNeu && nurNeu[schluessel('aus', n, b.h, b.n)] ? ' data-ws-neu' : '')]);
    });
    var drin = function (s) { return wegs.some(function (w) { return w[0] <= s && s < w[1]; }); };
    p.texte.forEach(function (st) {
      if (drin(st.s)) return;
      var r = st.zu ? null : regel(c, 'texte', n, st.h, st.n), key = schluessel('text', n, st.h, st.n), neu = r ? (r.neu || '') : null;
      var at = ' data-ws-e="' + st.h + '" data-ws-n="' + st.n + '"' + (st.zu ? ' data-ws-zu="' + st.zu + '"' : '') + neuMarke(key, r);
      if (st.art === 'el') { if (neu != null) schnitte.push([st.s, st.e, neu]); schnitte.push([st.ein, st.ein, at]); }
      else schnitte.push([st.s, st.e, '<span' + at + ' data-ws-lauf>' + (neu != null ? neu : src.slice(st.s, st.e)) + '</span>']);
    });
    p.fotos.forEach(function (f) {
      if (drin(f.s)) return;
      var r = f.zu ? null : regel(c, 'bilder', n, f.b, f.n), tag = src.slice(f.s, f.se), key = schluessel('bild', n, f.b, f.n);
      if (r) {
        var alt = String(r.alt || '').trim() ? r.alt : null, ziel = r.neu || f.b;
        if (ziel !== f.b && D.spender[ziel]) tag = bildTag(tag, D.spender[ziel], alt); else if (alt != null) tag = attr(tag, 'alt', alt);
      }
      var e = tag.length - (/\/>$/.test(tag) ? 2 : 1);
      tag = tag.slice(0, e).replace(/\s+$/, '') + ' data-ws-b="' + f.b + '" data-ws-bn="' + f.n + '"' + (f.zu ? ' data-ws-zu="' + f.zu + '"' : '') + neuMarke(key, r) + tag.slice(e);
      schnitte.push([f.s, f.se, tag]);
    });
    p.links.forEach(function (x) {
      if (drin(x.s)) return;
      var r = x.zu ? null : regel(c, 'links', n, x.h, x.n), marke = neuMarke(schluessel('link', n, x.h, x.n), r), tag = src.slice(x.s, x.se), alt = tag;
      if (r && linkGut(String(r.neu || ''))) tag = attr(tag, 'href', String(r.neu));
      if (marke) tag = tag.slice(0, -1) + marke + '>';
      if (tag !== alt) schnitte.push([x.s, x.se, tag]);
    });
    wegs.forEach(function (w) { schnitte.push([w[0], w[1], '']); });
    schnitte.sort(function (a, b) { return b[0] - a[0] || b[1] - a[1]; });
    schnitte.forEach(function (sn) {
      var s = sn[0], e = sn[1];
      if (wegs.some(function (w) { return !(w[0] === s && w[1] === e) && ((w[0] < s && s < w[1]) || (w[0] < e && e < w[1])); })) return;
      src = src.slice(0, s) + sn[2] + src.slice(e);
    });
    var band = hinweisHtml(c.hinweis || {});
    if (band) {
      if (nurNeu && nurNeu.hinweis) band = band.replace('<div class="ws-hinweis"', '<div class="ws-hinweis" data-ws-neu');
      src = /<main\b[^>]*>/.test(src) ? src.replace(/<main\b[^>]*>/, function (m) { return m + band; }) : src.replace(/<body\b[^>]*>/, function (m) { return m + band; });
    }
    (c.seo || []).forEach(function (x) {
      if (x.seite !== n) return;
      if (String(x.titel || '').trim()) src = src.replace(/(<title\b[^>]*>)([\s\S]*?)(<\/title>)/, function (m, a, b, d) { return a + esc(x.titel) + d; });
      if (String(x.beschreibung || '').trim()) src = src.replace(/(<meta\b[^>]*\bname="description"[^>]*\bcontent=")([^"]*)(")/, function (m, a, b, d) { return a + esc(x.beschreibung, true) + d; });
    });
    return src;
  }
  function fotoAdresse(name_, breite) {   // die Website von Ihr Haus nutzt dieselben Fotos wie ../_haus/img; dort liegen 800 und 1400 Pixel
    var gr = [800, 1400].filter(function (b) { return FOTOS_DA[name_ + '-' + b]; });
    if (!gr.length) gr = [600, 1000].filter(function (b) { return FOTOS_DA[name_ + '-' + b]; });
    if (!gr.length) return null;
    var b = gr.reduce(function (x, y) { return Math.abs(y - breite) < Math.abs(x - breite) ? y : x; });
    return '../_haus/img/' + name_ + '-' + b + '.webp';
  }
  function adressen(h) {
    h = h.replace(/(\s(?:srcset|imagesrcset)=")([^"]+)"/g, function (m, a, satz) {
      var gesehen = {}, teile = satz.split(',').map(function (t) { return t.trim(); }).filter(Boolean).map(function (t) {
        var w = t.split(/\s+/), mm = /assets\/img\/([a-z0-9-]+?)-(\d+)\.webp/.exec(w[0]);
        if (!mm) return t;
        var adr = fotoAdresse(mm[1], +mm[2]);
        if (!adr || gesehen[adr]) return '';
        gesehen[adr] = 1;
        return adr + ' ' + (/-(\d+)\.webp$/.exec(adr)[1]) + 'w';
      }).filter(Boolean);
      return a + teile.join(', ') + '"';
    });
    h = h.replace(/assets\/img\/([a-z0-9-]+?)-(\d+)\.webp/g, function (m, n, b) { return fotoAdresse(n, +b) || m; });
    return h.replace(/assets\/fonts\//g, '../_haus/fonts/').replace(/assets\/marke\//g, '../_haus/marke/').replace(/(<script\b[^>]*\bsrc=")ihrhaus\.js[^"]*"/g, '$1seite/ihrhaus.js"');
  }
  function vorschau(zustand, sp, n) {
    if (['entwurf', 'stand', 'vorher', 'nachher'].indexOf(zustand) < 0) throw Fehler(404, 'weg-unbekannt', 'Diese Vorschau gibt es nicht.');
    seite(n);
    var s = lesen(), live = schicht(s.live), c = arbeits(s), nur = null;
    if (zustand === 'vorher' || zustand === 'nachher') { nur = {}; aenderungen(c, live).forEach(function (a) { nur[a.key] = 1; }); }
    var h = anwenden(n, zustand === 'stand' || zustand === 'vorher' ? live : c, nur);
    h = h.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, function (m, href) { var css = D.css[href]; return css == null ? m : '<style data-ws-von="' + href.split('?')[0] + '">' + css + '</style>'; });
    h = h.replace(/\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g, '(min-width:0)').replace(/\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/g, '(max-width:0)');
    h = adressen(h);
    var basis = new URL('./', location.href).href;
    var kopf = '<base href="' + basis + '"><script src="../_kleid/demo.js"><\/script>' + D.ruhig_js + (D.zusatz_css ? '<style>' + D.zusatz_css + '</style>' : '');
    h = h.replace(/<head\b[^>]*>/, function (m) { return m + kopf; });
    var skript = D.vorschau_js.replace('<script>', '<script data-modus="' + (nur ? 'vgl' : 'an') + '">');
    h = h.indexOf('</body>') >= 0 ? h.replace('</body>', skript + '</body>') : h + skript;
    return { html: h, seite: n, sprache: 'de', zustand: zustand, marken: nur ? Object.keys(nur).length : null };
  }

  // ------------------------------------------------------------------ Wege (wie api.bearbeite und unterbau/serve.py)
  function bearbeite(methode, weg_, daten) {
    var pfad = decodeURIComponent(weg_.split('?')[0]), t = pfad.split('/').filter(Boolean).map(decodeURIComponent);
    if (t[0] === 'api' && t[1] === 'entwurf' && t[2] === HAUS) {
      if (methode === 'PUT') { var l = lesen(); if (daten.erwartet && daten.erwartet !== (l.kennung_entwurf || l.kennung_live)) throw Fehler(409, 'konflikt', 'Der Stand wurde inzwischen geändert'); SP.entwurf = kopie(daten.daten); vermerk('entwurf', daten.wer); return lesen(); }
      if (methode === 'DELETE') { SP.entwurf = null; vermerk('verworfen', daten && daten.wer); return lesen(); }
    }
    if (t[0] === 'api' && t[1] === 'zurueckholen' && methode === 'POST') { SP.entwurf = kopie(fassungLesen(daten.fassung).daten); vermerk('zurueckgeholt', daten.wer, { fassung: daten.fassung }); return lesen(); }
    if (t[0] === 'api' && t[1] === 'haus') return { kennung: HAUS, name: D.info.name, welt: D.info.welt };
    if (t[0] !== 'api' || t[1] !== 'x' || t[2] !== 'website') throw Fehler(404, 'weg-unbekannt', 'Weg unbekannt.');
    var was = t[3], mehr = t.slice(5);
    if (t[4] !== HAUS) throw Fehler(404, 'haus-unbekannt', 'Für dieses Haus liegt keine Beschreibung vor.');
    if (methode === 'GET') {
      if (was === 'haus') return kopie(D.info);
      if (was === 'stand') return stand();
      var s = lesen(), live = schicht(s.live), c = arbeits(s);
      if (was === 'seite' && mehr.length === 1) return verzeichnis(mehr[0], c);
      if (was === 'stelle' && mehr.length === 3) return stelle(mehr[0], mehr[1], +mehr[2], c, live);
      if (was === 'foto' && mehr.length === 3) return foto(mehr[0], mehr[1], +mehr[2], c);
      if (was === 'fotos') return kopie(D.fotos);
      if (was === 'google') return google(c);
      if (was === 'angaben') return angaben(c);
      if (was === 'vorschau' && mehr.length === 3) return vorschau(mehr[0], mehr[1], mehr[2]);
      if (was === 'zahlen') return zahlen(c);
      if (was === 'bereich' && mehr.length === 1) return bereich(mehr[0], c);
      if (was === 'sprachen') return { sprachen: [], zeilen: [] };
      if (was === 'verlauf') return verlauf();
      if (was === 'fassung' && mehr.length === 1) { var f = fassungLesen(mehr[0]); return { fassung: f.fassung, abgeloest: f.abgeloest, wer: f.wer, notiz: f.notiz, aenderungen: aenderungen(schicht(f.daten), live) }; }
    }
    if (methode === 'POST') {
      if (was === 'aendern') return aendern(daten || {});
      if (was === 'veroeffentlichen') return veroeffentlichen(daten || {});
      if (was === 'hochladen') throw Fehler(422, 'vorfuehrung', 'In der Vorführung wird nichts hochgeladen. Wählen Sie eines der Fotos des Hauses.');
    }
    throw Fehler(404, 'weg-unbekannt', 'Weg unbekannt.');
  }

  /* Antwort wie vom Server: kurz verzögert (damit Lade-Zustände der Vorlage sichtbar bleiben), als Kopie, Fehler mit Status und Stichwort */
  window.WS_RUF = function (methode, weg_, daten) {
    return new Promise(function (ja, nein) {
      setTimeout(function () {
        try { ja(kopie(bearbeite(methode, weg_, daten ? kopie(daten) : daten))); }
        catch (e) { if (e && e.status) nein(e); else { if (window.console) console.error(e); nein(Fehler(500, 'unerwartet', 'Unerwarteter Fehler: ' + (e && e.message || e))); } }
      }, methode === 'GET' ? 40 : 160);
    });
  };
  /* Beispiel-Entwurf für die Sprungadressen #vergleich und #veroeffentlichen: fünf Änderungen, gespeichert wie von Hand (aendern), nichts erfunden ausser dem neuen Wortlaut */
  function finde(n, t) { var st = seite(n).texte.filter(function (x) { return x.t === t; })[0]; if (!st) throw new Error('Stelle fehlt: ' + t); return st; }
  function beispiel() {
    var o = [], f = finde('index.html', 'Ein Speicher'), e = finde('index.html', 'Wo früher Kaffee und Tabak lagerten, steht heute eine lange Theke aus Eiche. Ihr Schlüssel liegt bereit, und wer mag, setzt sich mit dem ersten Glas in die Halle ans Fenster.');
    var preis = seite('zimmer.html').texte.filter(function (x) { return x.t === '199 €'; })[0], bild = seite('index.html').fotos.filter(function (x) { return x.b === 's-fensterplatz'; })[0];
    o.push({ art: 'text', seite: 'index.html', h: f.h, n: f.n, neu: 'Ein Haus' });
    o.push({ art: 'text', seite: 'index.html', h: e.h, n: e.n, neu: 'Wo früher Kaffee und Tabak lagerten, steht heute eine lange Theke aus Eiche. Ihr Schlüssel liegt bereit, und wer mag, setzt sich mit dem ersten Glas ans Fenster zum Wasser.' });
    if (preis) o.push({ art: 'text', seite: 'zimmer.html', h: preis.h, n: preis.n, neu: '209 €' });
    if (bild) o.push({ art: 'bild', seite: 'index.html', b: bild.b, n: bild.n, neu: 'z-leseecke' });
    o.push({ art: 'hinweis', an: true, text: 'Die Tafel am Samstag ist ausgebucht. Für Freitag gibt es noch Plätze.', von: '', bis: '', link: 'tafel.html', linktext: '' });
    var l = lesen();
    aendern({ ops: o, erwartet: l.kennung_entwurf || l.kennung_live, wer: 'Team Ihr Haus' });
  }
  window.WS_VORFUEHRUNG = { zuruecksetzen: anfang, vorschau: vorschau, beispiel: beispiel, _anwenden: anwenden, _aenderungen: aenderungen, _schicht: schicht };
})();
