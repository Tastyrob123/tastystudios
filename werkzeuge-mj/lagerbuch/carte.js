/* Speisekarten · Maloja (Vorführung) — Bedienung. 1:1 aus La Carte der Vorlage (über die Tafeln des Schäfli,
   Schlössli, Gasterntal, Ruedihus, Doldenhorn, Carlton-Europe und mc.js des Grand Beau-Rivage). Geändert sind nur das Kleid (Maloja), der Inhalt
   (Karten des Hauses, window.HAUS) und der Vorführ-Betrieb: statt des Servers antwortet LB_API (vorfuehrung.js) im Arbeitsspeicher, es entsteht keine PDF,
   nichts geht auf die Website; die Ansicht «Website» zeigt einen Nachbau (web/). Die Karte ist ein Baum aus dem Satz (satz/satz.js, gesetzt von bau/bau.py);
   Einträge, Rubriken und Texte erkennt SATZ.art(), die Felder eines Eintrags SATZ.felder(). Zwei Wege «Einfach» (Liste und Fenster) und «Fortgeschritten»
   (direkt in der Karte schreiben), jede Änderung zuerst als Entwurf. «Die Karte der Woche»: Gänge der Tafel mit vegetarischer Fassung (C08/C24 in der Form
   des Hauses). Kein Auswahlfeld des Betriebssystems. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kopie = x => JSON.parse(JSON.stringify(x));
const PF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
const SYM = {
  hoch: '<svg viewBox="0 0 14 14"><path d="m2.5 9 4.5-4.5L11.5 9"/></svg>', runter: '<svg viewBox="0 0 14 14"><path d="m2.5 5 4.5 4.5L11.5 5"/></svg>',
  zu: '<svg viewBox="0 0 16 16"><path d="M6 9.67 2.67 6.33 6 3M2.67 6.33h7.33a3.33 3.33 0 0 1 0 6.67h-2"/></svg>', auge: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><circle cx="8" cy="7" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><path d="m3 1 10 12"/></svg>',
  korb: '<svg viewBox="0 0 14 14"><path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4l.6 7.5h5.8L10.5 4"/></svg>', stift: '<svg viewBox="0 0 14 14"><path d="M9.5 2.5 11.5 4.5 5 11H3V9z"/></svg>',
  plus: '<svg viewBox="0 0 14 14"><path d="M7 2.5v9M2.5 7h9"/></svg>', haken: '<svg viewBox="0 0 14 14"><path d="m2.5 7.5 3 3 6-7"/></svg>',
  links: '<svg viewBox="0 0 14 14"><path d="m9 2.5-4.500 4.500L9 11.500"/></svg>', rechts: '<svg viewBox="0 0 14 14"><path d="m5 2.5 4.500 4.500L5 11.500"/></svg>',
  kopie: '<svg viewBox="0 0 14 14"><rect x="4.500" y="4.500" width="7" height="7" rx="1.200"/><path d="M9.500 4.500V3a.8.8 0 0 0-.8-.8H3A.8.8 0 0 0 2.200 3v5.700a.8.8 0 0 0 .8.8h1.500"/></svg>',
};
/* Hauswerte Maloja: Foto je Karte (Kachel im Rand und Startbild) aus den Fotos des Restaurants (../_haus/img/<schlüssel>-<breite>.webp):
   je Karte ihr Raum (Kontorsaal, Arvenstube, Bar, Weinwand …), «Die Gänge der Woche» der Pass der Küche. Die Zuordnung schreibt bau/bau.py nach daten.js (eine Stelle). */
let FOTO = {};
const fotoKlein = z => `../_haus/img/${FOTO[z] || 'm-pass'}-800.webp`;   // Fotos des Hauses (../_haus/img)
const fotoGross = z => `../_haus/img/${FOTO[z] || 'm-pass'}-1400.webp`;
const ROLLEN = { kueche: 'Küche', service: 'Service', direktion: 'Direktion' };
/* Namen der Werkzeuge nur aus kleid/ihrhaus.js (WO_HAUS.namen, eine Stelle) */
const NAME = (window.WO && WO.name('karten')) || 'Speisekarten', STUBE = (window.WO && WO.name('zentrale')) || 'Kontrollpanel', SCHREIBTISCH = (window.WO && WO.name('website')) || 'Website bearbeiten';   // Namen nur aus kleid/ihrhaus.js (window.HAUS.WERKZEUGE)
const klein = n => n.replace(/^(Das|Die|Der) /, a => a.toLowerCase());   // Name mitten im Satz
/* Die anderen Werkzeuge des Hauses liegen als Nachbarordner (kleid/ihrhaus.js WO_HAUS.wege); die Website öffnet sich in der Vorführung nie */
const PORTE = (window.WO_HAUS && WO_HAUS.ports) || { zentrale: 9081, website: 9082, karten: 9083, gaeste: 9084, marke: 9085, besuche: 9086, druck: 9087, werkbank: 9088, website_lokal: 8765 };
const HAUS = '#website';   // Vorführung: die Website wird nie geöffnet, «Website» zeigt den Nachbau in der Vorschau
const PORT_WERKZEUG = PORTE;
const API = 'api/';   // Vorführung: kein Server, LB_API (vorfuehrung.js) antwortet im Arbeitsspeicher
/* Wo die Karte auf der Website steht: alle Karten auf der Seite «Die Karte» (karte.html), die Gänge der Woche auch auf der Startseite */
const SEITE_DER_KARTE = {};
const ORT_DER_KARTE = { 'karte.html': 'Die Karte', 'index.html': 'Startseite' };
const WEBSEITEN = [['karte.html', 'Die Karte'], ['index.html', 'Startseite']];
let WEBSEITE = 'karte.html';
/* Bildzeichen an Gerichten hat keine Karte des Hauses */
const SYMBOLE = [];
/* Die Website verlinkt keine Karte als PDF (Vorführung) */
const PDF_DER_WEBSITE = {};
void PORT_WERKZEUG;   // Wege der Oberfläche: die Werkzeuge liegen als Nachbarordner (kleid/ihrhaus.js WO_HAUS.wege)

let NEU_KARTE = false, ANSICHT = 'karte';
let LISTE = [], Z = '', STAND = null, D = null, BASIS = '', MODUS = 'einfach', OFFEN = false, UNDO = [], BLITZ = null, ERWARTET = null, SCHRIFT = null;
const ZM_STD = { einfach: 0.62, frei: 0.8 };   // Doldenhorn: ab dem ersten «+» darf die Vorschau breiter werden als ihr Platz (seitlich schieben)
let WER = 'Team Maloja', ROLLE = 'direktion',   /* Robert 20.10.2026: «Entfernen diese, wer arbeitet hier? Abfrage.» Fester Eintrag im Protokoll, volle Rechte; Anmeldung erst bei der Auslieferung */
    ZM = { einfach: 0.6, frei: 0.78 }, BEREIT = false, TEXTGEAENDERT = false, TIMER = null, BERICHT = null, GESCHRIEBEN = [], EINST = {}, RECHTE = {};
try { MODUS = localStorage.getItem('lc-modus') || 'einfach'; ZM.einfach = +(localStorage.getItem('lc-zoom-einfach') || 0.62); ZM.frei = +(localStorage.getItem('lc-zoom-frei') || 0.8); } catch (e) { /* ohne Speicher geht es auch */ }

// ---------------------------------------------------------------- Verbindung
/* Vorführung: dieselben Wege wie der Server der Vorlage, beantwortet im Arbeitsspeicher (vorfuehrung.js). Nichts geht ins Netz. */
async function api(was, daten) {
  if (!window.LB_API) { const f = new Error('Keine Verbindung. Ihre Eingaben sind noch da; bitte gleich noch einmal versuchen.'); f.stichwort = 'VERBINDUNG'; throw f; }
  return window.LB_API(was, daten);
}
function sag(titel, text = '', knoepfe = [], fehl = false, dauer = 0) {
  const m = document.createElement('div');
  m.className = 'quit' + (fehl ? ' fehl' : '');
  m.innerHTML = `<div style="flex:1;min-width:0"><b>${h(titel)}</b>${text ? `<span>${h(text)}</span>` : ''}</div>` + knoepfe.map((k, i) => k.href ? `<a href="${h(k.href)}">${h(k.t)}</a>` : `<button type="button" data-i="${i}">${h(k.t)}</button>`).join('');
  m.addEventListener('click', ev => { const b = ev.target.closest('button[data-i]'); if (b) { knoepfe[+b.dataset.i].f(); m.remove(); } });
  const ort = $('#meldung');
  [...ort.children].forEach(x => { if (x.textContent === m.textContent) x.remove(); });   // dieselbe Meldung nicht doppelt (Speichern und Verlassen des Feldes zugleich, 16.10.2026)
  ort.appendChild(m);
  while (ort.children.length > 2) ort.firstElementChild.remove();
  setTimeout(() => m.remove(), dauer || (fehl ? 12000 : 6000));
}
const fehlerSagen = (titel, e) => sag(titel, e.message + (e.stichwort ? ` (${e.stichwort})` : ''), e.stichwort ? [{ t: 'Was tun?', href: 'anleitung.html#' + e.stichwort }] : [], true);

// ---------------------------------------------------------------- Daten-Hilfen
const istKnoten = x => x && typeof x === 'object' && !Array.isArray(x) && x.fn;
const inhalt = d => JSON.stringify({ s: d.seiten, w: d.abend, c: d.css });
const geaendert = () => inhalt(D) !== inhalt(STAND);
const liesPfad = (o, p) => p.split('.').reduce((x, k) => x == null ? x : x[/^\d+$/.test(k) ? +k : k], o);
function setzePfad(o, pfad, wert) {
  const kp = /^(.*)~kap(\d)$/.exec(pfad);   // Name oder Rubrik in Kapitälchen: ganzer Wortlaut, gesetzt wie die Werkbank (satz.js kapBau)
  if (kp) { const e = liesPfad(o, kp[1]); e.a = [e.a[0], e.a[1]].concat(SATZ.kapBau(String(wert), kp[2] === '1')).concat(e.a.slice(2).filter(y => y && y.fn === 'el' && /(^| )sb-mp( |$)/.test(SATZ.klasse(y)))); return; }
  const k = pfad.split('.'); let x = o;
  for (let i = 0; i < k.length - 1; i++) x = x[/^\d+$/.test(k[i]) ? +k[i] : k[i]];
  const l = k[k.length - 1]; x[/^\d+$/.test(l) ? +l : l] = wert;
}
function vater(pfad) { const k = pfad.split('.'), i = +k.pop(); return { arr: liesPfad(D, k.join('.')), idx: i, arrPfad: k.join('.') }; }
const istEl = x => istKnoten(x) && x.fn === 'el';
const nachbar = (arr, i, r) => { for (let j = i + r; j >= 0 && j < arr.length; j += r) if (istEl(arr[j]) && !arr[j].aus) return j; return -1; };
/* Preis in der Schreibweise der Karten des Hauses (haus.py: «89 €», «4,50»): «89» bleibt «89», «4.5» → «4,50», die Währung wie bei den Nachbarn */
function nachbarPreise() {
  const aus = [];
  (D.seiten || []).forEach((s, i) => zeilenSeite(i).forEach(r => SATZ.felder(r.n, r.art).forEach(f => { if (f.preis && /\d/.test(f.wert)) aus.push(f.wert.trim()); })));
  if (D.abend && /\d/.test(D.abend.preis || '')) aus.push(D.abend.preis);
  return aus.slice(0, 120);
}
function preisForm(v, mitWaehrung) {
  const t = String(v ?? '').trim();
  const m = /^(\d{1,4})(?:[.,](\d{1,2}))?(\s*(?:€|eur|euro))?$/i.exec(t);
  if (!m) return t;
  const z = m[1] + (m[2] && +m[2] ? ',' + m[2].padEnd(2, '0') : '');
  const eur = m[3] || mitWaehrung === true;   // der Preis der Tafel steht immer mit «€» wie auf der Website (haus.py TAFEL)
  return z + (eur && mitWaehrung !== false ? ' €' : '');
}

/* Arten der Einträge (satz.js art): was die Liste zeigt und wie das Fenster heisst */
const FN = { eintrag: 'Eintrag', rubrik: 'Rubrik', zwischen: 'Zwischentitel', titel: 'Titel', text: 'Text' };
const LANG = /^(Beschreibung|Übersetzung|Gericht|Vegetarisch|Text)/;
function artVon(pfad, d = D) { const k = pfad.split('.'), e = liesPfad(d, k.slice(0, -2).join('.')); return SATZ.art(liesPfad(d, pfad), istKnoten(e) ? e : null); }
function titelVon(n, art) {
  const f = SATZ.felder(n, art || SATZ.art(n));
  const w = f.find(x => /^(Gericht|Name|Tag|Rubrik|Titel|Zwischentitel|Überschrift)/.test(x.name) && String(x.wert).trim()) || f.find(x => String(x.wert).trim() && !x.preis);
  return w ? String(w.wert).replace(/\s+/g, ' ').trim() : (FN[art] || 'Eintrag');
}
function unterVon(n, art) {
  const f = SATZ.felder(n, art || SATZ.art(n)), t = titelVon(n, art);
  return f.filter(x => /^(Vegetarisch|Beschreibung|Zusatz|Hinweis|Angabe|Allergene|Rolle)/.test(x.name) && String(x.wert).trim() && String(x.wert).trim() !== t).map(x => String(x.wert).trim()).join(' · ').slice(0, 160);
}
function vollerGang(r) { const f = SATZ.felder(r.n, r.art).map(x => x.name); return f.includes('Gericht') && f.includes('Beschreibung'); }   // Vorlage für neue Gänge: einer mit Gericht und Zeile (nie der Preis)
const GANG = () => /^(menue|feier)/.test(Z) ? 'Gang' : 'Eintrag';   // Maloja: auf Karten ohne Gänge (Bar, Wein) heisst es «Eintrag»
function gangVon(n, art) { const g = SATZ.felder(n, art || SATZ.art(n)).find(x => x.name === 'Gang'); return g ? String(g.wert).trim() : ''; }
function preisVon(n, art) { return SATZ.felder(n, art || SATZ.art(n)).filter(x => x.preis && String(x.wert).trim()).map(x => String(x.wert).trim()).join(' · '); }

/* Zeilen der Liste je Seite: Einträge, Rubriken und Texte; in Behälter wird hineingegangen, Rahmen (Fusszeile, Bilder) gehört nicht dazu */
function zeilenSeite(i, d = D) {
  const s = d.seiten[i], aus = [];
  if (!s) return aus;
  const geh = (x, pfad, eltern, tiefe) => {
    if (!istEl(x)) return;
    const a = SATZ.art(x, eltern);
    if (a === 'fest') return;
    if (a) { aus.push({ pfad, n: x, art: a, tiefe, arr: pfad.replace(/\.\d+$/, '') }); return; }
    x.a.slice(2).forEach((y, j) => geh(y, pfad + '.a.' + (j + 2), x, tiefe));
  };
  s.a.slice(1).forEach((y, j) => geh(y, 'seiten.' + i + '.a.' + (j + 1), s, 0));
  return aus;
}

// ---------------------------------------------------------------- Vergleich Stand ↔ Entwurf
function eintraege(d) {
  const aus = [];
  const T = x => String(x ?? '').replace(/\*\*|__|~/g, '');
  if (d.art === 'abend') {
    const w = d.abend, bi = h(imgUrl(FOTO[Z] || 'm-pass'));
    aus.push({ key: 'abend', ort: 'Die Woche', text: `<span class="vgl__b" aria-hidden="true" style="background-image:${bi}"></span><b>${h(SATZ.ABEND.spanne(w.ab))}</b><span>${h(w.motto || w.titel)}</span><span>${h(w.mit || '')}</span><span>${h(w.preis)} ${h(w.zusatz || '')}</span><span>${h(w.hinweis || '')}</span>` });
    w.tage.forEach((t, i) => aus.push({ key: 'tag' + i, ort: 'Fünf Gänge', text: `<span class="vgl__b" aria-hidden="true" style="background-image:${bi}"></span>` + (t.zu ? `<b>Gänge folgen</b><span>${h(t.hinweis)}</span>` : `<b>Fünf Gänge</b>` + SATZ.ABEND.GAENGE.filter(g => t[g[0]] || t[g[0] + '_z']).map(g => `<span>${h(g[1])}: ${h(t[g[0]])}${t[g[0] + '_z'] ? ' · ' + h(t[g[0] + '_z']) : ''}</span>`).join('')) }));
    return aus;
  }
  d.seiten.forEach((s, i) => {
    const ort = 'Seite ' + (i + 1);
    zeilenSeite(i, d).forEach(r => {
      const x = r.n, t = titelVon(x, r.art), bi = bildVon(r);
      const ohne = JSON.parse(JSON.stringify(x)); delete ohne.lage;
      aus.push({ key: r.art + '|' + t, ort, text: `${bi ? `<span class="vgl__b" aria-hidden="true" style="background-image:${h(bi)}"></span>` : ''}<b>${h(T(t))}</b>${unterVon(x, r.art) ? `<span>${h(T(unterVon(x, r.art)))}</span>` : ''}${preisVon(x, r.art) ? `<span class="mono">${h(preisVon(x, r.art))}</span>` : ''}${x.aus ? '<i class="chip grau">ausgeblendet</i>' : ''}`, json: JSON.stringify(ohne) });
    });
    if (s.aus) aus.push({ key: 'seite|' + i, ort, text: '<i class="chip grau">Seite ausgeblendet</i>' });
  });
  return aus;
}
function vergleich(a, b) {
  const A = eintraege(a), B = eintraege(b), n = A.length, m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i].key === B[j].key ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const aus = [], wegA = [], neuB = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i].key === B[j].key) { if ((A[i].json || A[i].text) !== (B[j].json || B[j].text)) aus.push({ art: 'anders', a: A[i], b: B[j] }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) wegA.push(A[i++]); else neuB.push(B[j++]);
  }
  while (i < n) wegA.push(A[i++]); while (j < m) neuB.push(B[j++]);
  wegA.slice().forEach(x => { const k = neuB.findIndex(y => y.key === x.key); if (k >= 0) { const y = neuB.splice(k, 1)[0]; wegA.splice(wegA.indexOf(x), 1); aus.push({ art: (x.json || x.text) === (y.json || y.text) ? 'verschoben' : 'anders', a: x, b: y }); } });
  wegA.forEach(x => aus.push({ art: 'weg', a: x })); neuB.forEach(y => aus.push({ art: 'neu', b: y }));
  const na = lageAnders(a, b); if (na) aus.push({ art: 'anordnung', n: na, b: { ort: 'Auf den Seiten' } });
  return aus;
}
function zustand() {   // je Eintrag im Entwurf: neu / anders (Schlüssel: Titel)
  const st = {};
  if (!STAND || D.art === 'abend') return st;
  vergleich(STAND, D).forEach(v => { if (v.b) st[v.b.key] = v.art; });
  return st;
}

// ---------------------------------------------------------------- Kopfleiste, Rand, Kopf
function wann() { return WER && ROLLE ? `${WER}` : 'Wer sind Sie?'; }
function oben() {
  const el = $('#oben'); if (!el) return;
  const k = LISTE.find(x => x.ziel === Z) || {}, g = D && geaendert();
  el.innerHTML = WO.kopf({ werkzeug: 'karten', unter: 'Karte', titel: k.name || NAME, markeHref: 'index.html',
    stand: OFFEN ? 'Nicht gespeichert' : g ? 'Entwurf wartet' : k.pdf_zeit ? 'PDF vom ' + k.pdf_zeit : 'Noch keine PDF veröffentlicht',
    pruefung: 'pruefung.html', anleitung: 'anleitung.html', website: HAUS });
  vorfuehrungWege(el);
  /* dazu wie in jeder Tafel: Protokoll, Zustand und wer gerade arbeitet (R05, Rollen); Der Schreibtisch steht im Rand unter «Wege» */
  const r = $('.wo-kopf__r', el), tr = r && $('.wo-trenn', r);
  if (tr) tr.insertAdjacentHTML('beforebegin', `<button class="wo-kn wo-kn--rund" type="button" data-akt="protokoll" title="Protokoll" aria-label="Protokoll">${WO.ic('verlauf')}</button><button class="zustand${STATUS_ROT ? ' rot' : ''}" type="button" data-akt="gesund"><span>${STATUS_ROT ? 'Prüfen' : 'Alles in Ordnung'}</span></button>`);
  const m = $('.wo-marke-w', el); if (m) m.setAttribute('aria-label', NAME + ' · Übersicht');
}
let STATUS_ROT = false, SATZ_ZEICHEN = { ZEICHEN: '', WORTMARKE: '' };
/* Zeichen des Hauses (aus dem Band der Karte), eingefärbt über currentColor */
/* Vorführung: «Website ansehen» zeigt den Nachbau der Website in der Vorschau (nie die Website selbst); Anleitung und Prüfung öffnen im selben Fenster,
   neue Fenster gibt es in der Vorführung nicht (../_kleid/demo.js) */
function vorfuehrungWege(wurzel) {
  $$('a[href="#website"]', wurzel).forEach(a => { a.removeAttribute('target'); a.removeAttribute('rel'); a.setAttribute('data-akt', 'web-nachbau'); });
  $$('a[target="_blank"]', wurzel).forEach(a => { if (/^(anleitung|pruefung)\.html|^\.\.\/[a-z]+\/index\.html/.test(a.getAttribute('href') || '')) { a.removeAttribute('target'); a.removeAttribute('rel'); } });
}
function zeichenHaus(kl) { return (SATZ_ZEICHEN.ZEICHEN || '').replace('<svg ', `<svg class="${kl}" `); }
function rand() {
  /* Maloja: oben «Die Gänge der Woche», darunter das Menü, Bar und Wein und die Feiern (Gruppen mit Zwischentitel, R06) */
  const eins = k => `<li><button class="wo-rk kw" type="button" data-z="${k.ziel}" aria-current="${k.ziel === Z}"><span class="wo-rk__b" style="background-image:url('${fotoKlein(k.ziel)}')"></span><span class="wo-rk__t"><b>${h(k.name)}</b><small>${h(k.unter || 'Karte des Hauses').replace(/(\S+-\S+)/g, '<span class="nw">$1</span>')}</small></span>${k.entwurf || (k.ziel === Z && D && geaendert()) ? '<em class="wo-marke">Entwurf</em>' : ''}</button></li>`;
  const gruppen = [...new Set(LISTE.map(k => k.gruppe))];
  const karten = gruppen.map((g, i) => `${i ? `<li class="kw-gruppe"><p class="wo-mk">${h(g)}</p></li>` : ''}${LISTE.filter(k => k.gruppe === g).map(eins).join('')}`).join('');
  const wege = [
    { text: 'Frühere Fassungen', attr: 'data-akt="verlauf"' }, { text: 'Veröffentlichte PDF', attr: 'data-akt="pdf-live"' },
    { text: 'Die Karte auf der Website', attr: 'data-akt="web-nachbau"' },
    { text: SCHREIBTISCH, href: (WO.haus.wege || {}).website || '../kontor/index.html' },
    { text: 'Anschluss an die Website', attr: 'data-akt="einst"' }, { text: 'Kurzer Rundgang', attr: 'data-akt="rundgang"' }];
  $('#rand').innerHTML = `<div class="wo-rand__g karten"><p class="wo-mk">${h(gruppen[0] || 'Ihre Karten')}</p><ul>${karten}</ul></div>
    <div class="wo-rand__g modus-g"><p class="wo-mk">Bearbeiten</p><div class="wo-seg modus" role="group" aria-label="Art der Bearbeitung"><button type="button" data-m="einfach" aria-pressed="${MODUS === 'einfach'}">Einfach</button><button type="button" data-m="frei" aria-pressed="${MODUS === 'frei'}">Fortgeschritten</button></div>
    <p class="modus__t">${MODUS === 'einfach' ? 'Gerichte und Getränke in einer Liste: hinzufügen, ändern, ausblenden, entfernen, verschieben. Ein Klick zeigt den Eintrag links und rechts auf derselben Höhe.' : 'Sie gestalten direkt in der Karte: jedes Element verschieben, grösser oder kleiner ziehen, jeden Text ändern, auch Titel, Datum und Fusszeile. Dazu die Daten der Karte als Text.'}</p></div>
    ${WO.rand([{ titel: 'Wege', eintraege: wege }], { website: HAUS, anleitung: 'anleitung.html', pruefung: 'pruefung.html' }).replace('<div class="wo-rand__g">', '<div class="wo-rand__g wege">')}`;
  vorfuehrungWege($('#rand'));
  oben();
}
/* Startbild jeder Ansicht (Oberfläche der Häuser, «Bühne»): Foto des Raums rechts, Zier mit dem Zeichen, Titel mit Akzent, ein Satz, die
   Angaben der Karte und der Knopf der Ansicht. Der Auftritt läuft nur beim Wechsel der Karte (schweben.js). */
const SATZ_KOPF = {
  einfach: 'Ein Klick auf einen Eintrag zeigt ihn links und rechts auf derselben Höhe und lässt ihn kurz aufblinken; Doppelklick oder der Stift öffnet ihn. Jede Änderung wartet als Entwurf und steht sofort rechts in der Karte. PDF und Website bleiben, wie sie sind, bis Sie unten auf «Veröffentlichen» drücken.',
  frei: 'Ein Klick wählt ein Element der Karte. Ziehen verschiebt es, die Ecken machen es grösser oder kleiner, ein Doppelklick schreibt in den Text, rechts gestalten Sie Schrift, Farbe und Ausrichtung. ⌘Z nimmt zurück. Neue Einträge legen Sie im Modus «Einfach» an.',
};
const SATZ_ABEND = 'Für jede Woche die fünf Gänge im Kontorsaal: zu jedem Gang das Gericht und die vegetarische Fassung eintragen, rechts steht es sofort auf der Karte. Gespeichert wird beim Verlassen des Feldes, die PDF ändert sich erst mit «Veröffentlichen». Das darf die Küche selbst.';
function kopf() {
  const k = LISTE.find(x => x.ziel === Z) || {}, neu = kopf.letzte !== Z; kopf.letzte = Z;
  const datum = k.pdf_zeit ? k.pdf_zeit.slice(0, 10) : (k.stand_zeit ? k.stand_zeit.slice(8, 10) + '.' + k.stand_zeit.slice(5, 7) + '.' + k.stand_zeit.slice(0, 4) : '');
  const fm = (D && D.format) || [210, 297], gr = Math.max(fm[0], fm[1]) >= 400 ? 'A3' : Math.max(fm[0], fm[1]) >= 290 ? 'A4' : 'A5', format = gr + (fm[0] > fm[1] ? ' quer' : '');
  const zahlen = [[k.seiten || 0, (k.seiten === 1 ? 'Seite' : 'Seiten') + ' in der PDF'], [format, 'Format'], [datum || '–', k.pdf_zeit ? 'PDF vom' : 'Stand vom']];
  const kn = Z === 'woche' && MODUS === 'einfach' ? WO.knopf('Nächste Woche anlegen', 'plus', 'gold', { attr: 'data-akt="abend-neu"' }) : MODUS === 'einfach' ? WO.knopf('Neuer Eintrag', 'plus', 'gold', { attr: 'data-akt="neu"' }) : WO.knopf('Daten der Karte', 'pfeil', 'hell', { attr: 'data-akt="daten"' });
  $('#kopf').innerHTML = WO.startbild({ werkzeug: 'karten', art: 'buehne', foto: fotoGross(Z),
    zier: `${h(NAME)} · ${h(k.gruppe || '')}`,   // Tor 5 30.10.2026 (K7/K12): ohne «· Einfach» (stand am Handy allein, «·» am Zeilenende); der Weg steht im Rand
    h1: `${h(k.name || '')} <em>${h(k.unter || 'Karte des Hauses')}</em>`, satz: h(Z === 'woche' && MODUS === 'einfach' ? SATZ_ABEND : SATZ_KOPF[MODUS === 'frei' ? 'frei' : 'einfach']),
    knoepfe: kn + (D && D.abend && D.abend.beispiel ? `<p class="kopf__bsp">Beispiel: die Karte vom ${h(SATZ.ABEND.spanne(D.abend.ab))}. Mit «Nächste Woche anlegen» beginnt die Karte der nächsten Woche.</p>` : '') + `<dl class="kopf__zahlen">${zahlen.map(([z, t]) => `<div><dt>${h(t)}</dt><dd>${h(String(z))}</dd></div>`).join('')}</dl>` });
  const sb = $('#kopf .wo-sb'); if (sb && neu) sb.classList.add('auftritt');
  const img = $('#kopf .wo-sb__foto img'); if (img) { img.alt = ''; img.setAttribute('decoding', 'async'); }
}
function buehneFoto() {}

// ---------------------------------------------------------------- Liste (Einfach)
function reiheHTML(r, st, bild) {
  const n = r.n, a = r.art, t = titelVon(n, a), u = unterVon(n, a), p = preisVon(n, a);
  const k0 = a + '|' + t;
  const chip = st[k0] === 'neu' ? '<i class="chip">Neu</i>' : st[k0] === 'anders' ? '<i class="chip">Geändert</i>' : st[k0] === 'verschoben' ? '<i class="chip grau">Verschoben</i>' : '';
  const aus = n.aus ? '<i class="chip grau">Ausgeblendet</i>' : '';
  const k = `<div class="r__k">${a === 'rubrik' ? WO.knopf('Eintrag hinzufügen', 'plus', 'gold', { klein: true, attr: 'data-akt="neu-hier"' }) : ''}<button class="rund" type="button" data-akt="edit" title="Bearbeiten" aria-label="Bearbeiten">${SYM.stift}</button><button class="rund" type="button" data-akt="kopie" title="Kopieren" aria-label="Kopieren">${SYM.kopie}</button><button class="rund" type="button" data-akt="hoch" title="Nach oben" aria-label="Nach oben">${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" title="Nach unten" aria-label="Nach unten">${SYM.runter}</button><button class="rund" type="button" data-akt="aus" title="${n.aus ? 'Wieder zeigen' : 'Ausblenden'}" aria-label="${n.aus ? 'Wieder zeigen' : 'Ausblenden'}">${n.aus ? SYM.augezu : SYM.auge}</button><button class="rund gefahr" type="button" data-akt="weg" title="Entfernen" aria-label="Entfernen">${SYM.korb}</button></div>`;
  const kl = ['r', n.aus ? 'aus' : '', a === 'rubrik' ? 'r--rubrik' : '', ['zwischen', 'titel'].includes(a) ? 'r--klein' : '', a === 'text' ? 'r--text' : ''].filter(Boolean).join(' ');
  return `<div class="${kl}${bild ? ' r--bild' : ''}" data-pfad="${h(r.pfad)}">${bild ? `<span class="r__b" aria-hidden="true" data-bild="${h(bild)}"></span>` : ''}<div class="r__t" data-akt="waehle">${gangVon(n, a) && gangVon(n, a) !== t ? `<small class="r__gang">${h(gangVon(n, a))}</small>` : ''}<b${gangVon(n, a) && gangVon(n, a) !== t ? ' class="wo-rudi"' : ''}>${h(t)}</b>${a !== 'eintrag' && a !== 'rubrik' ? `<small>${h(FN[a])}</small>` : ''}${chip}${aus}${a !== 'rubrik' && u ? `<span>${h(u)}</span>` : ''}</div><span class="r__p">${h(p)}</span>${k}</div>`;
}
function abendHTML() {   // Maloja: je Woche fünf Gänge aus der Karte der Saison, zu jedem Gang das Gericht und die vegetarische Fassung, wie die Karte am Platz
  const w = D.abend, M = SATZ.ABEND, t = w.tage[0];
  const f = (pfad, titel, wert, ph = '') => `<label class="feld"><span>${titel}</span><textarea class="mw-t" rows="1" data-mw="${pfad}"${ph ? ` placeholder="${h(ph)}"` : ''}>${h(wert)}</textarea></label>`;
  const gang = g => `<p class="mw-gang">${h(g[1])}</p><div class="feld zw2">${f(`tage.0.${g[0]}`, 'Gericht', t[g[0]] || '', 'z. B. Steinbutt, Chasselas-Sauce, junger Lauch')}${f(`tage.0.${g[0]}_z`, 'Vegetarisch', t[g[0] + '_z'] || '', 'z. B. Sellerie Zürcher Art, Rahm und Pilze')}</div>`;
  const menue = `<div class="teil mw-tag${t.zu ? ' mw-tag--zu' : ''}" style="--i:0"><div class="mw-in">
      <p class="mw-name">Fünf Gänge und vegetarisch</p>
      ${t.zu ? f('tage.0.hinweis', 'Satz auf der Karte', t.hinweis, 'Die Gänge dieser Woche folgen.') : M.GAENGE.map(gang).join('')}
      <div class="feld"><span class="schalter" role="switch" tabindex="0" aria-checked="${!!t.zu}" data-akt="tagzu" data-i="0"><b></b>Die Gänge stehen noch nicht fest</span></div>
    </div></div>`;
  const vorschlag = (LISTE.find(k => k.ziel !== 'woche') || {}).name;
  return `<div class="teil"><div class="mw-in"><p class="mw-name">Die Woche · Dienstag bis Samstag</p>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><button class="rund" type="button" data-akt="abend" data-r="-1" aria-label="Eine Woche früher">${SYM.links}</button><b class="mw-datum">${h(M.spanne(w.ab))}</b><button class="rund" type="button" data-akt="abend" data-r="1" aria-label="Eine Woche später">${SYM.rechts}</button>
      </div></div></div>${menue}
    <div class="teil"><div class="mw-in"><p class="mw-name">Kopf und Fuss der Karte</p>
      <div class="feld zw2">${f('motto', 'Motto der Woche', w.motto || '', 'Leer: Titel unten')}${f('titel', 'Titel', w.titel, 'Das Menü')}</div>${f('mit', 'Zeile unter dem Datum', w.mit || '', 'Von Hand angerichtet, Gang für Gang')}
      <div class="feld zw2">${f('preis', 'Preis der fünf Gänge', w.preis, vorschlag ? 'wie die Website, z. B. 138 €' : '')}${f('zusatz', 'Unter dem Preis', w.zusatz || '')}</div>${f('hinweis', 'Hinweis', w.hinweis || '', 'z. B. auch vegetarisch möglich')}${f('fuss', 'Fusszeile', w.fuss || '', 'Leer: die Adresse wie unten auf der Karte')}
    </div></div>`;
}
/* Bild je Zeile (Fehlerbuch 10a, Robert 19.10.2026: «in allen Tools Bilder dazu»): nur Fotos des Hauses. Ein Eintrag zeigt nur ein Foto, das wirklich ihn
   zeigt; darum trägt die Karte ihr Bild einmal am Titel (der Raum der Karte), nie in jeder Zeile wiederholt (Fehlerbuch 10a, Schlössli 20.10.2026). */
const imgUrl = n => `url('../_haus/img/${n}-800.webp')`;   // Fotos des Hauses (../_haus/img)
function rubrikBild(t) { return imgUrl(FOTO[Z] || 'm-pass'); }
function bildVon(r) {
  if (r.art === 'titel') return imgUrl(FOTO[Z] || 'm-pass');
  return '';
}
function liste() {
  const el = $('#liste');
  if (Z === 'woche') { el.innerHTML = abendHTML(); mwWachsen(); return; }
  const st = zustand();
  el.innerHTML = D.seiten.map((s, i) => {
    const zl = zeilenSeite(i), rub = zl.some(r => r.art === 'rubrik'), ein = zl.some(r => r.art === 'eintrag');
    const inn = zl.map(r => reiheHTML(r, st, bildVon(r))).join('') + `<div class="neu-zeile">${ein ? `${WO.knopf(GANG() + ' am Ende', 'plus', 'gold', { klein: true, attr: `data-akt="neu-ende" data-i="${i}"` })}` : ''}${rub ? `${WO.knopf('Neue Rubrik', 'plus', 'gold', { klein: true, attr: `data-akt="rubrik-neu" data-i="${i}"` })}` : ''}</div>`;
    return `<div class="teil${s.aus ? ' aus' : ''}" data-teil="${i}" style="--i:${Math.min(i, 6)}"><div class="teil__k"><b>Seite ${i + 1}</b><span>${zl.filter(r => r.art === 'eintrag').length} ${zl.filter(r => r.art === 'eintrag').length === 1 ? 'Eintrag' : 'Einträge'}</span><div style="display:flex;gap:6px"><button class="rund" type="button" data-akt="s-hoch" data-i="${i}" aria-label="Seite nach vorn">${SYM.hoch}</button><button class="rund" type="button" data-akt="s-runter" data-i="${i}" aria-label="Seite nach hinten">${SYM.runter}</button><button class="rund" type="button" data-akt="s-aus" data-i="${i}" aria-label="Seite ausblenden">${s.aus ? SYM.augezu : SYM.auge}</button></div></div>${inn}</div>`;
  }).join('');
  if (BLITZ) { const r = $(`.r[data-pfad="${BLITZ}"]`); if (r) { r.classList.add('blitz'); r.scrollIntoView({ block: 'nearest' }); } BLITZ = null; }
  bilderZeigen();
}
/* Zeilenbilder erst laden, wenn die Zeile ins Bild kommt (Weinkarte: 172 Flaschen; gedrosselt stand die Karte sonst erst nach 6,2 s) */
let BILD_BEOB = null;
function bilderZeigen() {
  const alle = $$('#liste .r__b[data-bild]');
  const zeig = el => { el.style.backgroundImage = el.dataset.bild; el.removeAttribute('data-bild'); };
  if (!('IntersectionObserver' in window)) return alle.forEach(zeig);
  if (BILD_BEOB) BILD_BEOB.disconnect();
  BILD_BEOB = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { zeig(e.target); BILD_BEOB.unobserve(e.target); } }), { rootMargin: '400px 0px' });
  alle.forEach(el => BILD_BEOB.observe(el));
}

// ---------------------------------------------------------------- Vorschau (Rahmen blatt.html)
/* Ansicht «Website» (wie GBR): die Seite «Die Karte» mit dem Entwurf dieser Karte, dazu die Startseite. Vorführung: ein Nachbau im Werkzeug (web/),
   die Website selbst wird nie geöffnet. */
function website() {
  const an = ANSICHT === 'website';
  $('#vf').hidden = an; $('#web').hidden = !an; $('#webwahl').hidden = !an; $('.vorschau__z').hidden = an;   // Zoom gilt nur für die Karte
  $$('.ansicht button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ansicht === ANSICHT));
  $$('#webwahl button').forEach(b => b.setAttribute('aria-pressed', b.dataset.webseite === WEBSEITE));
  if (!an) return vorschau();
  const seite = WEBSEITE, f = $('#web-f');
  $('#v-zahl').textContent = 'Website'; $('#v-warn').hidden = true;
  f.onload = () => {
    try {
      WEB_ENTWURF = true;
      if (f.contentWindow && f.contentWindow.LB_SETZE) f.contentWindow.LB_SETZE({ z: Z, daten: D, liste: LISTE });
      $('#v-zahl').textContent = (ORT_DER_KARTE[seite] || 'Website') + ' · Nachbau, so stünde der Entwurf auf der Website';
    } catch (e) { /* gleiche Herkunft, sollte gehen */ }
  };
  const src = `web/${seite}?z=${encodeURIComponent(Z)}`;
  const schl = Z + seite + inhalt(D);
  if (f.dataset.z !== schl) { f.dataset.z = schl; f.src = src; } else f.onload();
}
let WEB_ENTWURF = false;
function vorschau() {
  if (ANSICHT === 'website') return;
  const f = $('#vf');
  if (!BEREIT || !f.contentWindow || !D) return;
  f.contentWindow.postMessage({ carte: 'setze', daten: D, modus: MODUS, zoom: ZM[MODUS], eigen: ZM[MODUS] > ZM_STD[MODUS], geschrieben: GESCHRIEBEN, wahl: MODUS === 'frei' ? WAHLID : null, neu: NEU_KARTE }, location.origin);
  NEU_KARTE = false;
}
/* Schlössli 19.10.2026: unter Last schickte die Vorschau ihr «bereit», bevor dieses Skript zuhörte, und blieb grau. Darum fragt das Werkzeug nach,
   bis die Antwort da ist (beim Laden des Rahmens und alle 700 ms, höchstens 40 Mal). */
const halloVorschau = () => { const f = $('#vf'); try { if (f && f.contentWindow) f.contentWindow.postMessage({ carte: 'hallo' }, location.origin); } catch (e) { /* noch nicht da */ } };
{ const f = $('#vf'); if (f) f.addEventListener('load', () => { if (!BEREIT) halloVorschau(); }); let n = 0; const t = setInterval(() => { if (BEREIT || ++n > 40) return clearInterval(t); halloVorschau(); }, 700); }
window.addEventListener('message', ev => {
  if (ev.origin !== location.origin || !ev.data || !ev.data.carte) return;
  const m = ev.data;
  if (m.carte === 'bereit') { BEREIT = true; vorschau(); }
  if (m.carte === 'gesetzt') {
    buehneFoto();
    BERICHT = m.bericht;
    const n = m.bericht.seiten;
    $('#v-zahl').textContent = `${n} ${n === 1 ? 'Seite' : 'Seiten'}, wie in der PDF`;
    const w = $('#v-warn'), t = m.bericht.fehler.concat(m.bericht.warn);
    w.hidden = !t.length; w.textContent = t.length ? '⚠ ' + t[0] : ''; w.title = t.join('\n');
  }
  if (m.carte === 'fehler') sag('Vorschau', m.text, [], true);
  if (m.carte === 'klick' && MODUS === 'einfach' && Z !== 'woche') waehleAusVorschau(m.pfad);
  if (m.carte === 'klick' && MODUS === 'einfach' && Z === 'woche') mwAusVorschau(m.pfad);
  if (m.carte === 'doppel' && MODUS === 'einfach' && Z !== 'woche') oeffneAusVorschau(m.pfad);
  if (m.carte === 'text' && MODUS === 'frei') { if (Z === 'woche') { if (!abendSchreiben(m.pfad, m.wert)) return; } else setzePfad(D, m.pfad, m.wert); GESCHRIEBEN.push(m.pfad); TEXTGEAENDERT = true; OFFEN = inhalt(D) !== BASIS; clearTimeout(TIMER); leiste(); oben(); }
  if (m.carte === 'speichern' && OFFEN) speichern('Im Entwurf gespeichert');
  if (m.carte === 'wahl' && MODUS === 'frei') { WAHLINFO = m.info; WAHLID = m.info ? m.info.id : null; if (!m.still) GST_OFFEN = !!m.info; seitenleiste(); }
  if (m.carte === 'lage' && MODUS === 'frei') { merken(stand()); setz(m.id, m.v); geaendertAnzeigen(); if (m.id === WAHLID) seitenleiste(); }
  if (m.carte === 'entf' && MODUS === 'frei') entf(m.id);
  if (m.carte === 'taste' && MODUS === 'frei') { if (m.was === 'zurueck') zurueckNehmen(); else if (m.was === 'vor') wiederholen(); else if (m.was === 'esc') abwaehlen(); }
  if (m.carte === 'taste' && m.was === 'speichern') { if (OFFEN) speichern('Im Entwurf gespeichert'); }
  if (m.carte === 'seite-zurueck' && MODUS === 'frei') { const vor = stand(); m.ids.forEach(id => setz(id, { x: 0, y: 0, s: 1 })); if (stand() !== vor) { merken(vor); WAHLID = null; neuSetzen(); sag('Anordnung zurückgesetzt', `Seite ${m.seite} steht wieder wie gesetzt. ⌘Z holt sie zurück.`); } }
  if (m.carte === 'schreibt') SCHREIB_VOR = stand();
  if (m.carte === 'fertig-geschrieben' && SCHREIB_VOR != null) { if (stand() !== SCHREIB_VOR) merken(SCHREIB_VOR); SCHREIB_VOR = null; }
  if (m.carte === 'fertig-geschrieben' && TEXTGEAENDERT) { clearTimeout(TIMER); TIMER = setTimeout(() => { TEXTGEAENDERT = false; vorschau(); }, 200); }
});
/* Klick links oder rechts: die andere Seite springt auf dieselbe Stelle und blinkt kurz (Robert 15.10.2026) */
function eintragPfad(pfad) {   // Pfad eines Textes in der Karte → Pfad des Eintrags, den die Liste zeigt
  const m = /^seiten\.(\d+)/.exec(pfad); if (!m) return null;
  const r = zeilenSeite(+m[1]).find(z => pfad === z.pfad || pfad.startsWith(z.pfad + '.'));
  return r ? r.pfad : null;
}
function markiere(pfad) {
  const r = $(`#liste .r[data-pfad="${pfad}"]`), vor = r ? r.getBoundingClientRect().top : 0;
  $$('#liste .r.gewaehlt').forEach(x => { if (x !== r) x.classList.remove('gewaehlt'); });
  if (!r) return null;
  /* Schlössli 20.10.2026: die Knöpfe stehen unter dem gewählten Eintrag; schliessen sie sich weiter oben, bleibt die angeklickte Zeile trotzdem an ihrem Platz
     (sonst springt die Liste und ein Doppelklick trifft die Nachbarzeile) */
  const nach = r.getBoundingClientRect().top; if (Math.abs(nach - vor) > 1) window.scrollBy(0, nach - vor);
  r.classList.add('gewaehlt'); r.classList.remove('blitz'); void r.offsetWidth; r.classList.add('blitz');
  return r;
}
function blitzRechts(pfad, y) {   // y: Höhe im Fenster, auf der die Zeile links steht (oder stehen wird); die Karte zieht auf dieselbe Höhe
  if (ANSICHT === 'website') return;
  const f = $('#vf'); f.contentWindow.postMessage({ carte: 'blitz', pfad, y: y == null ? null : y - f.getBoundingClientRect().top }, location.origin);
}
function linksMitte(r) {           // Zeile links mittig ins Fenster; liefert die Höhe, auf der sie danach steht
  const rr = r.getBoundingClientRect(), max = document.documentElement.scrollHeight - innerHeight;
  const ziel = Math.min(max, Math.max(0, scrollY + rr.top + rr.height / 2 - innerHeight / 2));
  window.scrollTo({ top: ziel, behavior: 'smooth' });
  return rr.top + rr.height / 2 - (ziel - scrollY);
}
function waehle(pfad) {       // aus der Liste: Karte rechts springt auf dieselbe Höhe
  const r = markiere(pfad); if (!r) return;
  const rr = r.getBoundingClientRect(); blitzRechts(pfad, rr.top + rr.height / 2);
}
function waehleAusVorschau(pfad) {   // aus der Karte: Liste links springt hin, Karte zieht auf dieselbe Höhe nach
  const np = eintragPfad(pfad); if (!np) return;
  const r = markiere(np); if (!r) return;
  blitzRechts(np, linksMitte(r));
}
/* ---------------------------------------------------------------- Freie Anordnung und Gestalten (Fortgeschritten), 1:1 nach La Carte des Grand Beau-Rivage
   (anordnen.js, 15./16.10.2026). Gewählt, gezogen und gezeigt wird in der Vorschau (blatt.js, ANR); hier liegen die Daten, der Verlauf für ⌘Z / ⌘⇧Z
   und die Seitenleiste «Gestalten» rechts (öffnet beim Wählen, × oder Esc schliesst, nie über der Karte).
   Wo die lage steht: Eintrag (Pfad «seiten.…») → n.lage, seine Linie («…:lin») → n.lage.lin; Bankett-Zeile → u.lage; Teile der Seite
   «b:» Band, «l:» Logo, «k:» Kopfzeile, «z:» Zeichen, «f:» Fusszeile, «s:» Titel der Seite → seite.lage[…]; Der nächste Abend → abend.lage['t<Tag>.<Rolle>'] bzw. ['t<Tag>#']. */
const HIST = [], ZUK = [];
let WAHLID = null, WAHLINFO = null, GST_OFFEN = false, SCHREIB_VOR = null;
const RUND = (x, n) => Math.round(x * n) / n;
const SEITENTEIL = { b: 'band', l: 'logo', k: 'kopf', z: 'zeichen', f: 'fuss', s: 'titel' };
function stand() { return JSON.stringify({ s: D.seiten, w: D.abend, c: D.css }); }
function merken(vor) { HIST.push(vor); if (HIST.length > 200) HIST.shift(); ZUK.length = 0; }
function zurueckHolen(x) { const j = JSON.parse(x); D.seiten = j.s; D.abend = j.w; D.css = j.c; OFFEN = inhalt(D) !== BASIS; leiste(); oben(); vorschau(); if (MODUS === 'einfach') liste(); }
function zurueckNehmen() { if (!HIST.length) return sag('Nichts zum Zurücknehmen'); ZUK.push(stand()); zurueckHolen(HIST.pop()); }
function wiederholen() { if (!ZUK.length) return sag('Nichts zum Wiederholen'); HIST.push(stand()); zurueckHolen(ZUK.pop()); }
function ort(id) {
  if (!id || !D) return null;
  const m = id.match(/^([blkzfs]):(\d+)$/);
  if (m) {
    const name = SEITENTEIL[m[1]];
    let wirt;
    if (Z === 'woche') { const gen = SATZ.ABEND.seiten(D.abend)[+m[2]]; if (!gen) return null; const W = () => (D.abend.lage = D.abend.lage || {}); wirt = { get: () => ((D.abend.lage || {})[gen.lk] || {})[name], set: v => { const w = W(); if (v) { w[gen.lk] = w[gen.lk] || {}; w[gen.lk][name] = v; } else if (w[gen.lk]) { delete w[gen.lk][name]; if (!Object.keys(w[gen.lk]).length) delete w[gen.lk]; } if (!Object.keys(w).length) delete D.abend.lage; } }; return wirt; }
    const s = D.seiten[+m[2]]; if (!s) return null;
    return { get: () => (s.lage || {})[name], set: v => { if (v) { s.lage = s.lage || {}; s.lage[name] = v; } else if (s.lage) { delete s.lage[name]; if (!Object.keys(s.lage).length) delete s.lage; } } };
  }
  const lin = /:lin$/.test(id), pf = id.replace(/:lin$/, '');
  if (Z === 'woche') {
    const n = liesPfad({ seiten: SATZ.ABEND.seiten(D.abend) }, pf); if (!n || !n.lk) return null;
    const W = () => (D.abend.lage = D.abend.lage || {}), weg = () => { if (D.abend.lage && !Object.keys(D.abend.lage).length) delete D.abend.lage; };
    if (lin) return { node: n, get: () => ((D.abend.lage || {})[n.lk] || {}).lin, set: v => { const w = W(); if (v) { w[n.lk] = w[n.lk] || {}; w[n.lk].lin = v; } else if (w[n.lk]) { delete w[n.lk].lin; if (!Object.keys(w[n.lk]).length) delete w[n.lk]; } weg(); } };
    return { node: n, get: () => { const x = Object.assign({}, (D.abend.lage || {})[n.lk] || {}); delete x.lin; return x; }, set: v => { const w = W(), l0 = (w[n.lk] || {}).lin, x = Object.assign({}, v || {}); if (l0) x.lin = l0; if (Object.keys(x).length) w[n.lk] = x; else delete w[n.lk]; weg(); } };
  }
  const u = liesPfad(D, pf); if (!u || typeof u !== 'object') return null;
  if (lin) return { u, get: () => (u.lage || {}).lin, set: v => { if (v) { u.lage = u.lage || {}; u.lage.lin = v; } else if (u.lage) { delete u.lage.lin; if (!Object.keys(u.lage).length) delete u.lage; } } };
  return { u, get: () => { const x = Object.assign({}, u.lage || {}); delete x.lin; return x; }, set: v => { const l0 = (u.lage || {}).lin, x = Object.assign({}, v || {}); if (l0) x.lin = l0; if (Object.keys(x).length) u.lage = x; else delete u.lage; } };
}
function roh(id) { const o = ort(id); return Object.assign({}, (o && o.get()) || {}); }
function liesLage(id) { const v = roh(id); return Object.assign(v, { x: +v.x || 0, y: +v.y || 0, s: +v.s || 1 }); }
function setz(id, patch) {   // Felder ändern, alles Neutrale fällt weg (null/leer = wie in der Vorlage), wie GBR anordnen.js setz()
  const o = ort(id); if (!o) return;
  if (/^b:/.test(id)) { const n = Object.assign(roh(id), patch); if (n.h != null) n.h = RUND(+n.h, 10); Object.keys(n).forEach(k => { if (n[k] == null || n[k] === '') delete n[k]; }); return o.set(Object.keys(n).length ? n : null); }
  const n = Object.assign(roh(id), patch);
  if (n.x != null) n.x = RUND(+n.x, 10); if (n.y != null) n.y = RUND(+n.y, 10);
  if (n.s != null) n.s = RUND(+n.s, 100); if (n.t != null) n.t = RUND(+n.t, 1000);
  [['b', 10], ['d', 100], ['z', 100], ['mt', 10], ['mb', 10]].forEach(([f, r]) => { if (n[f] != null && n[f] !== '') n[f] = RUND(+n[f], r); });
  if (Math.abs(n.x || 0) < 0.05) delete n.x; if (Math.abs(n.y || 0) < 0.05) delete n.y;
  if (n.s != null && Math.abs(n.s - 1) < 0.005) delete n.s; if (n.t != null && Math.abs(n.t - 1) < 0.002) delete n.t;
  Object.keys(n).forEach(k => { if (n[k] == null || n[k] === '' || n[k] === false) delete n[k]; });
  o.set(Object.keys(n).length ? n : null);
}
function geaendertAnzeigen() { OFFEN = inhalt(D) !== BASIS; leiste(); oben(); }
function neuSetzen() { geaendertAnzeigen(); vorschau(); }
function entf(id) {   // Entf: Einträge gehen von der Karte (wie «Ausblenden» im Modus Einfach), Linien, Zeichen und Teile der Seite werden unsichtbar
  const o = ort(id); if (!o) return;
  merken(stand());
  const eintrag = !/:lin$/.test(id) && !/^[blkzfs]:/.test(id) && Z !== 'woche';
  if (eintrag && o.u) o.u.aus = true; else setz(id, { aus: true });
  WAHLID = null; GST_OFFEN = false; seitenleiste(); neuSetzen(); sag('Ausgeblendet', '⌘Z holt es zurück.');
}
function abwaehlen() { WAHLID = null; WAHLINFO = null; GST_OFFEN = false; seitenleiste(); const f = $('#vf'); if (f && f.contentWindow) f.contentWindow.postMessage({ carte: 'abwaehlen' }, location.origin); }

/* Seitenleiste «Gestalten» (GBR: «Schriftarten, Schriftgrösse und Textart ändern … so ein kleines Side-Menü»), Begriffe wie in L’Imprimerie */
const SCHRIFTEN = [['titel', 'Tenor Sans'], ['instrument', 'Hanken Grotesk']];
const TEXTART = [['normal', 'Normal'], ['versal', 'Versalien']];   // nie fett, nie kursiv (Kleid von Maloja)
const AUSR = [['links', 'Links'], ['mitte', 'Mitte'], ['rechts', 'Rechts']];
const FARBNAME = { nacht: 'Nacht', schiefer: 'Schiefer', tinte: 'Tinte', leise: 'Leise', kerze: 'Kerze', kerzet: 'Kerze tief', kerzeh: 'Kerze hell', papier: 'Warmweiss', weiss: 'Weiss' };
const segment = (feld, liste, an, kl = '') => `<div class="gst-seg ${kl}">${liste.map(([k, t]) => `<button type="button" data-feld="${feld}" data-wert="${k}" class="${an === k ? 'an' : ''}"${feld === 'f' ? ` style="font-family:${SATZ.SCHRIFT[k].replace(/"/g, "'")}"` : ''}>${t}</button>`).join('')}</div>`;
const groesse = (feld, wert, einheit) => `<div class="gst-gr"><button type="button" data-schritt="${feld}" data-r="-1" aria-label="Kleiner">−</button><input type="text" inputmode="decimal" data-zahl="${feld}" value="${wert}"><span>${einheit}</span><button type="button" data-schritt="${feld}" data-r="1" aria-label="Grösser">+</button></div>`;
const farben = an => `<div class="gst-farben">${Object.entries(SATZ.FARBE).map(([k, v]) => `<button type="button" data-feld="c" data-wert="${k}" title="${FARBNAME[k] || k}" aria-label="${FARBNAME[k] || k}" style="background:${v}" class="${an === k ? 'an' : ''}"></button>`).join('')}</div>`;
const gruppe = (titel, html) => `<div class="gst-gruppe"><label>${titel}</label>${html}</div>`;
function seitenleiste() {
  let g = $('#gst');
  if (!g) {
    g = document.createElement('aside'); g.id = 'gst'; g.className = 'gst'; g.setAttribute('aria-label', 'Gestalten'); document.body.appendChild(g);
    g.addEventListener('click', klickLeiste); g.addEventListener('change', zahlLeiste);
    g.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('[data-zahl]')) { ev.preventDefault(); ev.target.blur(); } });
  }
  const an = MODUS === 'frei' && GST_OFFEN;
  document.body.classList.toggle('gst-offen', an);
  g.hidden = !an;
  if (!an) return;
  const kopf = `<div class="gst-kopf"><b>Gestalten</b><button type="button" class="gst-zu" data-tu="zu" aria-label="Leiste schliessen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3"/></svg></button></div>`;
  const i = WAHLINFO;
  if (!i) { g.innerHTML = kopf + '<p class="gst-leer">Ein Element der Karte anklicken: Titel, Datum, Rubrik, Gericht, Zeile, Preis, Strich oder Fusszeile.</p>'; return; }
  const v = liesLage(WAHLID);
  let html = kopf + `<p class="gst-name">${h(i.name)}</p>`;
  if (i.art === 'linie') html += gruppe('Stärke', groesse('d', i.dicke.toFixed(2), 'mm')) + gruppe('Länge', groesse('b', i.laenge.toFixed(1), 'mm')) + gruppe('Farbe', farben(v.c));
  else if (i.art === 'zeichen') html += gruppe('Grösse', groesse('s', Math.round(v.s * 100), '%')) + gruppe('Farbe', farben(v.c));
  else if (i.art === 'band') html += gruppe('Höhe', groesse('h', (+roh(WAHLID).h || i.hoehe).toFixed(1), 'mm'));
  else {
    html += gruppe('Schriftart', segment('f', SCHRIFTEN, v.f, 'gst-seg--schrift')) + gruppe('Schriftgrösse', groesse('pt', i.pt.toFixed(1), 'pt'))
      + gruppe('Textart', segment('a', TEXTART, v.a)) + gruppe('Farbe', farben(v.c)) + gruppe('Ausrichtung', segment('al', AUSR, v.al))
      + gruppe('Zeilenabstand', groesse('z', (v.z || i.lh).toFixed(2), '×'));
    if (i.art === 'eintrag') html += gruppe('Abstand davor', groesse('mt', i.mt.toFixed(1), 'mm')) + gruppe('Abstand danach', groesse('mb', i.mb.toFixed(1), 'mm'));
  }
  html += `<div class="gst-fuss">${i.art === 'band' ? '' : '<button type="button" class="gst-kn" data-tu="aus">Entfernen</button>'}<button type="button" class="gst-kn" data-tu="vorlage">Teil zurücksetzen</button></div><p class="gst-tipp">${i.art === 'band' ? 'Höhe mit − und +, oder eine Zahl eingeben.' : `Ziehen verschiebt, die Ecken ändern die Grösse${i.art === 'linie' ? ', die Enden die Länge' : ''}. Entf entfernt, Esc schliesst, ⌘Z nimmt zurück.`}</p>`;
  g.innerHTML = html;
}
function aendern(patch, schrift) {   // eine Änderung aus der Leiste: merken, setzen, neu setzen (Schriftgrösse und Abstände verteilen die Seiten neu)
  if (!WAHLID) return;
  merken(stand()); setz(WAHLID, patch);
  if (schrift) document.fonts.load('16px ' + SATZ.SCHRIFT[schrift]).then(neuSetzen, neuSetzen); else neuSetzen();
}
function wertNeu(feld, zahl) {
  const i = WAHLINFO; if (!i || !isFinite(zahl)) return;
  const v = liesLage(WAHLID);
  if (feld === 'pt') { const alt = i.pt, nz = Math.max(4, Math.min(80, zahl)); if (Math.abs(nz - alt) < 0.05) return; return aendern(i.art === 'eintrag' ? { t: (+v.t || 1) * nz / alt } : { s: Math.max(0.4, Math.min(3, v.s * nz / alt)) }); }
  if (feld === 's') return aendern({ s: Math.max(0.4, Math.min(3, zahl / 100)) });
  if (feld === 'z') return aendern({ z: Math.max(0.8, Math.min(3, zahl)) });
  if (feld === 'mt' || feld === 'mb') return aendern({ [feld]: Math.max(-20, Math.min(60, zahl)) });
  if (feld === 'b') return aendern({ b: Math.max(2, Math.min(i.blattB, zahl)) });
  if (feld === 'd') return aendern({ d: Math.max(0.1, Math.min(3, zahl)) });
  if (feld === 'h') return aendern({ h: Math.max(4, Math.min(120, zahl)) });
}
const SCHRITT = { pt: 0.5, s: 10, z: 0.05, mt: 0.5, mb: 0.5, b: 1, d: 0.1, h: 1 };
function klickLeiste(ev) {
  const b = ev.target.closest('button'); if (!b) return;
  if (b.dataset.tu === 'zu') return abwaehlen();
  if (b.dataset.tu === 'aus') return entf(WAHLID);
  if (b.dataset.tu === 'vorlage') { const o = WAHLID && ort(WAHLID); if (!o) return; merken(stand()); o.set(null); neuSetzen(); return sag('Wie in der Vorlage', '⌘Z holt die Gestaltung zurück.'); }
  if (b.dataset.feld) { const f = b.dataset.feld, w = b.dataset.wert, an = liesLage(WAHLID)[f] === w; return aendern({ [f]: an ? null : w }, f === 'f' && !an ? w : ''); }
  if (b.dataset.schritt) { const f = b.dataset.schritt, i = $(`#gst [data-zahl="${f}"]`); return wertNeu(f, parseFloat(String(i.value).replace(',', '.')) + (+b.dataset.r) * SCHRITT[f]); }
}
function zahlLeiste(ev) { const i = ev.target.closest('[data-zahl]'); if (i) wertNeu(i.dataset.zahl, parseFloat(String(i.value).replace(',', '.'))); }
/* Tasten im Werkzeug (der Zeiger ist nicht in der Vorschau): Pfeile, Entf, Esc, ⌘Z wie in der Karte */
document.addEventListener('keydown', ev => {
  if (MODUS !== 'frei' || !D || !$('#fenster').hidden) return;
  if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
  const cmd = ev.metaKey || ev.ctrlKey, k = ev.key.toLowerCase();
  if (cmd && k === 'z') { ev.preventDefault(); return ev.shiftKey ? wiederholen() : zurueckNehmen(); }
  if (cmd && k === 'y') { ev.preventDefault(); return wiederholen(); }
  if (!WAHLID) return;
  if (ev.key === 'Escape') return abwaehlen();
  if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); return entf(WAHLID); }
  if (/^Arrow/.test(ev.key)) { ev.preventDefault(); $('#vf').contentWindow.postMessage({ carte: 'pfeil', key: ev.key, shift: ev.shiftKey }, location.origin); }
});
/* Anordnung je Element, für «Vorher / nachher» (GBR lagen()): Schlüssel wie im Vergleich, gleiche Namen durchgezählt */
function lagen(d) {
  const m = {}, n = {};
  const nimm = (k, l) => { n[k] = (n[k] || 0) + 1; if (l && Object.keys(l).length) m[k + '#' + n[k]] = JSON.stringify(l); };
  if (d.art === 'abend') { Object.entries((d.abend || {}).lage || {}).forEach(([k, l]) => nimm(k, l)); return m; }
  (d.seiten || []).forEach((s, i) => {
    Object.entries(s.lage || {}).forEach(([k, l]) => nimm('seite' + i + '|' + k, l));
    const geh = (x, k) => { if (!istEl(x) && !(istKnoten(x) && x.fn === 'seite')) return; if (x.lage) nimm(k + '|' + SATZ.textVon(x).replace(/\s+/g, ' ').trim().slice(0, 60), x.lage); x.a.slice(x.fn === 'seite' ? 1 : 2).forEach((y, j) => geh(y, k + '.' + j)); };
    geh(s, 's' + i);
  });
  return m;
}
function lageAnders(a, b) { const A = lagen(a), B = lagen(b); return new Set([...Object.keys(A), ...Object.keys(B)].filter(k => A[k] !== B[k])).size; }

/* Der nächste Abend: ein Text in der Karte gehört zu einem Feld des Abends (satz.js: w und vor); Gang-Namen und Datum sind fest */
function abendSchreiben(pfad, wert) {
  const gen = { seiten: SATZ.ABEND.seiten(D.abend) }, k = pfad.split('.');
  const knoten = liesPfad(gen, k.slice(0, -2).join('.'));
  if (!knoten || !knoten.w) return false;
  const vor = knoten.vor || '';
  setzePfad(D.abend, knoten.w, vor && wert.startsWith(vor) ? wert.slice(vor.length) : wert);
  return true;
}
function oeffneAusVorschau(pfad) { const p = eintragPfad(pfad); if (p) eintragFenster(p); }

// ---------------------------------------------------------------- Leiste
function darfVeroeffentlichen() { return !!(RECHTE.veroeffentlichen && RECHTE.veroeffentlichen.includes(ROLLE)) || (ROLLE === 'kueche' && Z === 'woche'); }   // die Karte des nächsten Abends veröffentlicht die Küche selbst
function leiste() {
  oben();
  const g = geaendert(), n = g ? vergleich(STAND, D).length : 0;
  const sp = OFFEN ? 'wartet' : (leiste.gruen ? 'fertig' : 'glas');
  const darf = darfVeroeffentlichen(), k = LISTE.find(x => x.ziel === Z) || {};
  $('#leiste').innerHTML = WO.leiste({ entwurf: g && !OFFEN,
    /* Robert 20.10.2026 («dieser Button unten mit alles ist veröffentlicht, PDF und so, das ist auch alles irgendwie falsch»): Zustand stimmt mit dem Kopf
       überein, der Satz ist kurz und ganz, und es stehen nur Knöpfe da, die gerade etwas tun (keine ausgegrauten). Speichern zeigt immer seinen Zustand (R09). */
    titel: OFFEN ? 'Noch nicht gespeichert' : g ? `Entwurf: ${n} ${n === 1 ? 'Änderung' : 'Änderungen'}` : (k.live || k.pdf_zeit) ? 'Alles veröffentlicht' : 'Noch nicht veröffentlicht',
    satz: OFFEN ? 'Speichern legt die Eingaben im Entwurf ab.' : g ? 'Noch nicht in der PDF.' : (k.live || k.pdf_zeit) ? 'Die PDF ist auf dem neuesten Stand.' : 'Die Karte ist bereit für die erste PDF.',
    knoepfe: (g ? WO.knopf('Verwerfen', 'zurueck', 'glas', { klein: true, attr: 'data-akt="verwerfen" title="Entwurf verwerfen"' }) : '')
      + (g ? WO.knopf('Vorher, nachher', 'auge', 'glas', { klein: true, attr: 'data-akt="vgl"' }) : '')
      + WO.knopf('Probe-PDF', 'pdf', 'glas', { klein: true, attr: 'data-akt="probe"' })
      + WO.knopf(OFFEN ? 'Speichern' : sp === 'fertig' ? 'Gespeichert' : 'Alles gespeichert', sp === 'fertig' || !OFFEN ? 'haken' : 'pfeil', sp, { klein: true, id: 'l-sp', attr: 'data-akt="speichern"' })
      + (g && !OFFEN && darf ? WO.knopf('Veröffentlichen', 'hoch', 'gold', { klein: true, id: 'l-raus', attr: 'data-akt="veroeffentlichen"' }) : '') });
  leistePasst();
}
/* Robert 20.10.2026, 01:24 (Bild: «Entwurf: 1 Änderung» läuft in «Verwerfen»): reicht der Platz nicht, zeigen die Knöpfe nur ihr Zeichen, dann fällt der Satz weg.
   Der Titel bleibt ganz und überdeckt nie einen Knopf. */
function leistePasst() {
  const l = $('#leiste'), t = l && l.querySelector('.wo-leiste__t b'); if (!t) return;
  l.classList.remove('eng', 'enger');
  const zu = () => t.scrollWidth > t.parentElement.clientWidth + 1 || l.scrollWidth > l.clientWidth + 1;
  if (zu()) l.classList.add('eng');
  if (zu()) l.classList.add('enger');
}
window.addEventListener('resize', () => leistePasst());
function alles() {
  if (MODUS !== 'frei') { WAHLID = null; WAHLINFO = null; GST_OFFEN = false; }
  if (MODUS === 'frei' && ANSICHT === 'website') { ANSICHT = 'karte'; }   // gestaltet wird in der Karte (GBR: an() nur in der Ansicht Karte)
  $('#vf').hidden = ANSICHT === 'website'; $('#web').hidden = ANSICHT !== 'website'; $('#webwahl').hidden = ANSICHT !== 'website'; $('.vorschau__z').hidden = ANSICHT === 'website'; $$('.ansicht button').forEach(b => b.setAttribute('aria-pressed', b.dataset.ansicht === ANSICHT));
  seitenleiste();
  document.body.classList.toggle('frei', MODUS === 'frei');
  rand(); kopf(); if (MODUS === 'einfach') liste(); if (ANSICHT === 'website') website(); else vorschau(); leiste();
}

// ---------------------------------------------------------------- Speichern
let KETTE = Promise.resolve();   // Speichern nacheinander: zwei schnelle Eingaben dürfen sich nicht selbst in die Quere kommen (WebKit, 15.10.2026: Konflikt mit der eigenen Eingabe)
function speichern(was, text, ohneUndo) { const r = KETTE.then(() => speichernEcht(was, text, ohneUndo)); KETTE = r.catch(() => {}); return r; }
async function speichernEcht(was, text, ohneUndo) {
  const vorher = BASIS;
  let r;
  try { r = await api('entwurf', { z: Z, daten: D, was, erwartet: ERWARTET || '' }); } catch (e) { fehlerSagen('Nicht gespeichert', e); OFFEN = inhalt(D) !== BASIS; leiste();  return false; }   // Doldenhorn 17.10.2026: abgewiesene Eingaben bleiben und warten gelb (R10), statt «Alles gespeichert»
  OFFEN = false; GESCHRIEBEN = [];
  if (!r.geaendert) { sag('Nichts geändert, nichts gespeichert.'); leiste(); return true; }
  ERWARTET = r.zeit;
  if (!ohneUndo) UNDO.push(vorher);
  BASIS = inhalt(D);
  leiste.gruen = true; setTimeout(() => { leiste.gruen = false; if (!OFFEN) leiste(); }, 2600);
  const k = LISTE.find(x => x.ziel === Z); if (k) k.entwurf = geaendert();
  rand(); leiste();
  const tippt = Z === 'woche' && document.activeElement && document.activeElement.matches && document.activeElement.matches('#liste input');   // im Formular wird gerade geschrieben: nicht neu zeichnen, sonst springt die Eingabe weg
  if (MODUS === 'einfach' && !tippt) liste();
  sag(was || 'Im Entwurf gespeichert', text || 'Die PDF ändert sich erst beim Veröffentlichen.', [{ t: 'Rückgängig', f: rueckgaengig }, { t: 'Vorher, nachher', f: vglFenster }]);
  return true;
}
async function rueckgaengig() {
  if (!UNDO.length) return sag('Nichts zum Zurücknehmen.');
  const x = UNDO.pop(); const j = JSON.parse(x);
  D.seiten = j.s; D.abend = j.w; D.css = j.c;
  if (await speichern('Zurückgenommen', 'Der Entwurf steht wieder wie vor der letzten Änderung.', true)) alles();
}
async function tun(fn, was, text, blitz) {
  const alt = inhalt(D);
  fn();
  if (inhalt(D) === alt) return sag('Nichts geändert, nichts gespeichert.');
  BLITZ = blitz || null;
  if (MODUS === 'einfach' || Z === 'woche') liste();
  vorschau();
  await speichern(was, text);
}

// ---------------------------------------------------------------- Fenster
function fenster(html, breit) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${breit ? ' breit' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Schliessen">${SYM.zu}</button>${html}</div>`;
  f.hidden = false;
  f.onclick = ev => { if (ev.target === f || ev.target.closest('[data-zu]')) zu(); };
  const erst = $('input:not([type=hidden]),textarea', f); if (erst) setTimeout(() => erst.focus(), 30);
}
let BEIM_ZU = null;
function zu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; f.oninput = null; f.onclick = null; if (BEIM_ZU) { const b = BEIM_ZU; BEIM_ZU = null; b(); } }
function frage(titel, text, ja, f) {
  fenster(`<h2>${titel}</h2><p class="satz">${h(text)}</p><div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="ja">${h(ja)}<i>${PF}</i></button></div>`);
  $('#ja').addEventListener('click', () => { BEIM_ZU = null; zu(); f(); });
}
function chips(id, wahl, art) { return `<div class="chips" id="${id}">${wahl.map(([v, t]) => `<button type="button" data-v="${h(v)}" aria-pressed="${v === art}">${h(t)}</button>`).join('')}</div>`; }

/* Wer arbeitet hier? (kein Passwort, Master 7a und Robert 15.10.2026: vorerst keines; bei der Auslieferung kommt die Anmeldung davor) */

/* ---------- Eintrag bearbeiten: jedes Feld ist ein Text des Eintrags (SATZ.felder), dazu die Zeichen des Hauses ---------- */
const NB_AT = ' class="dh-nb"', BILD_AT = t => ` class="dh-z" src="${t}" alt=""`;
function symbole() { return (D.teile || []).map((t, i) => { const s = SYMBOLE.find(([k]) => String(t).slice(22, 22 + k.length) === k); return s ? [i, s[1]] : null; }).filter(Boolean); }
function eltern(pfad) { const k = pfad.split('.'); return liesPfad(D, k.slice(0, -2).join('.')); }
function kette(pfad) {   // Behälter zwischen Seite und Eintrag (für die Vorschau im Fenster)
  const k = pfad.split('.'), aus = [];
  for (let x = 4; x < k.length; x += 2) { const n = liesPfad(D, k.slice(0, x).join('.')); if (istEl(n)) aus.push({ tag: n.a[0], at: n.a[1] }); }
  return aus;
}
function ohneIds(x) { if (Array.isArray(x)) x.forEach(ohneIds); else if (x && typeof x === 'object') { delete x.id; Object.values(x).forEach(ohneIds); } return x; }
function eintragFenster(pfad, neu) {
  const n = liesPfad(D, pfad); if (!istEl(n)) return;
  const art = artVon(pfad), fe = SATZ.felder(n, art);
  const sy = symbole(), zeichenOk = sy.length && SATZ.hatZeichenOrt(n), zAlt = zeichenOk ? SATZ.zeichenVon(n) : [];
  let zWahl = zAlt.slice();
  const rub = (() => { const r = zeilenSeite(+pfad.split('.')[1]); let t = ''; for (const z of r) { if (z.pfad === pfad) break; if (z.art === 'rubrik') t = titelVon(z.n, 'rubrik'); } return t; })();
  const feld = (f, i) => { const lang = LANG.test(f.name) || String(f.wert).length > 64; return `<label class="feld"><span>${h(f.name)}</span>${lang ? `<textarea id="f-${i}" rows="${Math.min(6, Math.max(2, Math.ceil(String(f.wert).length / 70)))}">${h(f.wert)}</textarea>` : `<input id="f-${i}" value="${h(f.wert)}"${f.preis ? ' inputmode="decimal"' : ''}>`}</label>`; };
  fenster(`<h2>${neu ? 'Neuer <em>Eintrag.</em>' : `${h(FN[art] || 'Eintrag')} <em>bearbeiten.</em>`}</h2>
    <p class="satz">${rub ? `Rubrik «${h(rub)}». ` : ''}${neu ? 'Dieser Eintrag ist eine Kopie, damit er genau dasselbe Format hat wie die anderen. Ändern Sie, was anders sein soll.' : 'Rechts in der Karte sehen Sie den Eintrag, sobald Sie speichern.'} Ein leeres Feld nimmt die Zeile aus dem Eintrag.</p>
    <div class="zwei"><div class="felder">${fe.map(feld).join('') || '<p class="satz">Dieser Eintrag hat keinen Text.</p>'}
    ${zeichenOk ? `<div class="feld"><span>Zeichen des Hauses</span><div class="chips" id="f-z">${sy.map(([t, nm]) => `<button type="button" data-t="${t}" aria-pressed="${zWahl.includes(t)}">${h(nm)}</button>`).join('')}</div></div>` : ''}
    ${neu ? '' : `<div class="feld"><span class="schalter" role="switch" tabindex="0" aria-checked="${!n.aus}" id="f-zeigen"><b></b>Auf der Karte zeigen</span></div>`}</div>
    ${miniHTML()}</div>
    <p class="fehler" id="f-fehler" role="alert"></p>
    <div class="fenster__kn">${neu ? '' : '<button class="textknopf" type="button" id="f-weg" style="margin-right:auto">Von der Karte nehmen</button>'}<button class="kn kn--hell" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="f-ok">${neu ? 'Auf die Karte setzen' : 'Speichern'}<i>${PF}</i></button></div>`, true);
  if (neu) BEIM_ZU = () => { const v = vater(pfad); v.arr.splice(v.idx, 1); liste(); vorschau(); };
  const cz = $('#f-z'); if (cz) cz.addEventListener('click', ev => { const b = ev.target.closest('[data-t]'); if (!b) return; const t = +b.dataset.t; zWahl = zWahl.includes(t) ? zWahl.filter(x => x !== t) : sy.map(([x]) => x).filter(x => x === t || zWahl.includes(x)); b.setAttribute('aria-pressed', zWahl.includes(t)); miniNeu(); });
  const zs = $('#f-zeigen'); if (zs) { const umsch = () => zs.setAttribute('aria-checked', zs.getAttribute('aria-checked') !== 'true'); zs.addEventListener('click', umsch); zs.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); umsch(); } }); }
  const weg = $('#f-weg'); if (weg) weg.addEventListener('click', () => { BEIM_ZU = null; entfernen(pfad); });
  const bauen = (fertig) => {
    const x = kopie(n);
    fe.forEach((f, i) => { /* Schlössli 20.10.2026: geschützte Leerzeichen des Satzes (vor «–») bleiben */ let w = $('#f-' + i).value.replace(/[ \t\r\n]+/g, ' ').replace(/^ +| +$/g, ''); if (f.preis && fertig) w = preisForm(w, false); SATZ.setzeFeld(x, f, w); });
    if (zeichenOk && JSON.stringify(zWahl) !== JSON.stringify(zAlt)) SATZ.setzeZeichen(x, zWahl, BILD_AT, NB_AT);
    delete x.aus;
    return x;
  };
  const sende = () => { try { miniSenden({ knoten: bauen(false), kette: kette(pfad), seite: D.seiten[+pfad.split('.')[1]].a[0] }); } catch (e) { /* unfertige Eingabe */ } };
  function miniNeu() { setTimeout(sende, 0); }
  miniLos(() => ({ knoten: bauen(false), kette: kette(pfad), seite: D.seiten[+pfad.split('.')[1]].a[0] }));
  $('#fenster').oninput = sende;
  $('#f-ok').addEventListener('click', async () => {
    const x = bauen(true);
    if (zs) { if (zs.getAttribute('aria-checked') !== 'true') x.aus = true; else delete x.aus; }
    const fn = SATZ.felder(x, art), nm = fn.find(f => /^(Name|Tag)/.test(f.name));
    if (art === 'eintrag' && fe.some(f => /^(Name|Tag)/.test(f.name)) && !(nm && String(nm.wert).trim())) { $('#f-fehler').textContent = 'Bitte einen Namen eintragen.'; return; }
    if (art === 'eintrag' && fe.some(f => f.name === 'Gang') && !fn.some(f => /^(Gericht|Vegetarisch)/.test(f.name) && String(f.wert).trim())) { $('#f-fehler').textContent = 'Bitte ein Gericht eintragen.'; return; }   // ein Gang trägt ein Gericht
    if (art !== 'eintrag' && fe.length && !fn.some(f => String(f.wert).trim())) { $('#f-fehler').textContent = 'Bitte einen Text eintragen.'; return; }
    const t = titelVon(x, art);
    if (!neu && JSON.stringify(x) === JSON.stringify(n)) { BEIM_ZU = null; zu(); return sag('Nichts geändert, nichts gespeichert.'); }
    BEIM_ZU = null; zu();
    const v = vater(pfad);
    if (neu) { v.arr[v.idx] = x; await speichern(`${FN[art] || 'Eintrag'} auf der Karte`, `«${t}» steht jetzt im Entwurf.`); BLITZ = pfad; liste(); vorschau(); }
    else await tun(() => { v.arr[v.idx] = x; }, `${FN[art] || 'Eintrag'} gespeichert`, `«${t}»`, pfad);
  });
}
/* «So steht es auf der Karte» (GBR mini()): der Eintrag allein, gesetzt wie in der PDF, im kleinen Rahmen rechts im Fenster */
function miniHTML() { return `<div><p class="mono" style="margin:0 0 8px">So steht es auf der Karte</p><div class="mini"><iframe id="f-mini" title="Der Eintrag, wie er in der PDF steht" src="satz/blatt.html?mini=1"></iframe></div></div>`; }
let MINI_LETZT = null;
function miniSenden(x) {
  MINI_LETZT = x;
  const f = $('#f-mini'); if (!f || !f.contentWindow) return;
  f.contentWindow.postMessage(Object.assign({ carte: 'mini', karte: { art: D.art, format: D.format, teile: D.teile } }, x), location.origin);
}
function miniLos(f) { const fr = $('#f-mini'); if (!fr) return; fr.addEventListener('load', () => { try { miniSenden(f()); } catch (e) { /* egal */ } }); }
window.addEventListener('message', ev => { if (ev.origin === location.origin && ev.data && ev.data.carte === 'mini-hoehe') { const f = $('#f-mini'); if (f) f.style.height = Math.min(420, Math.max(60, ev.data.h)) + 'px'; } });
const istRub = (arr, j, el) => istEl(arr[j]) && SATZ.art(arr[j], el) === 'rubrik';
function entfernen(pfad) {
  const v = vater(pfad), el = eltern(pfad), n = v.arr[v.idx], t = titelVon(n, artVon(pfad));
  const rubrik = istRub(v.arr, v.idx, el);
  let bis = v.idx + 1;
  if (rubrik) while (bis < v.arr.length && !istRub(v.arr, bis, el)) bis++;
  const anz = rubrik ? v.arr.slice(v.idx + 1, bis).filter(istEl).length : 0;
  frage(rubrik ? 'Rubrik <em>entfernen?</em>' : 'Von der Karte <em>nehmen?</em>', rubrik && anz ? `«${t}» und die ${anz} Einträge darunter verschwinden aus der Karte. Bis zum Veröffentlichen holen Sie alles mit «Rückgängig» oder «Entwurf verwerfen» zurück.` : `«${t}» verschwindet aus der Karte. Wenn es nur vorübergehend ist, blende es lieber aus (Auge). Bis zum Veröffentlichen lässt es sich zurückholen.`, 'Von der Karte nehmen',
    () => tun(() => { v.arr.splice(v.idx, rubrik ? bis - v.idx : 1); }, rubrik ? 'Rubrik entfernt' : 'Von der Karte genommen', t));
}
function schiebe(pfad, r) {
  const v = vater(pfad), el = eltern(pfad), n = v.arr[v.idx];
  if (istRub(v.arr, v.idx, el)) {   // ganze Rubrik mit ihren Einträgen gegen die Nachbar-Rubrik tauschen
    const st = []; v.arr.forEach((x, i) => { if (istRub(v.arr, i, el)) st.push(i); });
    const k = st.indexOf(v.idx), nach = st[k + r];
    if (nach === undefined && el && /(^| )sb-r( |$)/.test(SATZ.klasse(el))) {   // Schlössli 20.10.2026: Werkbank-Satz, jede Rubrik in ihrem Abschnitt (section.sb-r): den ganzen Abschnitt tauschen
      const kp = pfad.split('.'), ep = kp.slice(0, -2).join('.'), w = vater(ep);
      let j = w.idx + r; while (j >= 0 && j < w.arr.length && !(istEl(w.arr[j]) && /(^| )sb-r( |$)/.test(SATZ.klasse(w.arr[j])))) j += r;
      if (j >= 0 && j < w.arr.length) return tun(() => { [w.arr[w.idx], w.arr[j]] = [w.arr[j], w.arr[w.idx]]; }, 'Reihenfolge gespeichert', `«${titelVon(n, 'rubrik')}» steht jetzt weiter ${r < 0 ? 'oben' : 'unten'}`, w.arrPfad + '.' + j + '.' + kp.slice(-2).join('.'));
    }
    if (nach === undefined) return sag(r < 0 ? 'Diese Rubrik steht schon zuoberst.' : 'Diese Rubrik steht schon zuunterst.', 'Rubriken lassen sich innerhalb ihres Abschnitts verschieben.');
    const ende = i => (st[st.indexOf(i) + 1] ?? v.arr.length);
    const [a, c] = r < 0 ? [nach, v.idx] : [v.idx, nach];
    return tun(() => { const vorn = v.arr.slice(a, ende(a)), hinten = v.arr.slice(c, ende(c)); v.arr.splice(a, ende(c) - a, ...hinten, ...vorn); }, 'Reihenfolge gespeichert', `«${titelVon(n, 'rubrik')}» steht jetzt weiter ${r < 0 ? 'oben' : 'unten'}`, v.arrPfad + '.' + (r < 0 ? a : a + (ende(c) - c)));
  }
  const j = nachbar(v.arr, v.idx, r); if (j < 0) return sag(r < 0 ? 'Steht schon zuoberst.' : 'Steht schon zuunterst.', 'Ein Eintrag bleibt in seinem Abschnitt; in einen anderen kommt er mit Kopieren und Entfernen.');
  tun(() => { [v.arr[v.idx], v.arr[j]] = [v.arr[j], v.arr[v.idx]]; }, 'Reihenfolge gespeichert', `«${titelVon(n, artVon(pfad))}» steht jetzt weiter ${r < 0 ? 'oben' : 'unten'}`, v.arrPfad + '.' + j);
}
function kopieren(pfad) {
  const v = vater(pfad), n = ohneIds(kopie(v.arr[v.idx])); delete n.aus;
  v.arr.splice(v.idx + 1, 0, n);
  liste(); vorschau();
  eintragFenster(v.arrPfad + '.' + (v.idx + 1), true);
}
function neuAmEnde(i) {
  const alle = zeilenSeite(i).filter(r => r.art === 'eintrag' && gangVon(r.n, r.art)), zl = alle.filter(vollerGang).length ? alle.filter(vollerGang) : alle;   // Vorlage ist der letzte volle Eintrag, nie der Preis der Karte
  const letzte = zl[zl.length - 1];
  if (!letzte) return sag('Auf dieser Seite gibt es noch keinen Eintrag als Vorlage.', 'Kopier zuerst einen Eintrag einer anderen Seite.', [], true);
  kopieren(letzte.pfad);
}
function rubrikBlock(pfad) {   // Rubrik → letzter Eintrag ihres Blocks (bis zur nächsten Rubrik, im selben Behälter; in Behälter darunter hinein)
  const v = vater(pfad), el = eltern(pfad); let letzt = null;
  const tiefster = (x, p) => { let r = null; (function geh(y, q, e) { if (!istEl(y)) return; const a = SATZ.art(y, e); if (a === 'eintrag') { r = q; return; } if (a === null) y.a.slice(2).forEach((z, k) => geh(z, q + '.a.' + (k + 2), y)); })(x, p, el); return r; };
  for (let j = v.idx + 1; j < v.arr.length; j++) {
    if (istRub(v.arr, j, el)) break;
    const x = v.arr[j]; if (!istEl(x)) continue;
    const a = SATZ.art(x, el);
    if (a === 'eintrag') letzt = v.arrPfad + '.' + j;
    else if (a === null) { const t = tiefster(x, v.arrPfad + '.' + j); if (t) letzt = t; }
  }
  return letzt;
}
function neuHier(pfad) {
  const l = rubrikBlock(pfad);
  if (!l) return sag('Unter dieser Rubrik gibt es noch keinen Eintrag als Vorlage.', 'Kopier einen Eintrag einer anderen Rubrik und schieb ihn hierher.', [], true);
  kopieren(l);
}
function neuGlobal() {
  const opts = [];
  D.seiten.forEach((s, i) => zeilenSeite(i).forEach(r => { if (r.art === 'rubrik' && rubrikBlock(r.pfad)) opts.push([r.pfad, titelVon(r.n, 'rubrik') + (D.seiten.length > 1 ? ` · S. ${i + 1}` : '')]); }));
  if (!opts.length) { const e = D.seiten.map((s, i) => { const a = zeilenSeite(i).filter(r => r.art === 'eintrag' && gangVon(r.n, r.art)); return (a.filter(vollerGang).length ? a.filter(vollerGang) : a).pop(); }).filter(Boolean).pop(); return e ? kopieren(e.pfad) : sag('Diese Karte hat keine Einträge als Vorlage.', '', [], true); }
  fenster(`<h2>${GANG() === 'Gang' ? 'Neuer <em>Gang.</em>' : 'Neuer <em>Eintrag.</em>'}</h2><p class="satz">Wohin? Der neue Eintrag kommt ans Ende, als Kopie des letzten Eintrags darin, damit er dasselbe Format hat. Verschieben lässt er sich danach mit den Pfeilen.</p>
    <div class="chips g-wahl" id="g-r" style="margin-bottom:6px">${opts.map(([p, t], k) => `<button type="button" data-k="${k}" aria-pressed="false"><span class="g-b" aria-hidden="true" style="background-image:${rubrikBild(t)}"></span>${h(t)}</button>`).join('')}</div>`);
  $('#g-r').addEventListener('click', ev => { const b = ev.target.closest('[data-k]'); if (!b) return; zu(); neuHier(opts[+b.dataset.k][0]); });
}
function rubrikNeu(i) {
  const rr = zeilenSeite(i).filter(r => r.art === 'rubrik'); if (!rr.length) return;
  const letzte = rr[rr.length - 1], v = vater(letzte.pfad), x = ohneIds(kopie(letzte.n)); delete x.aus;
  const f = SATZ.felder(x, 'rubrik'); f.forEach((ff, k) => SATZ.setzeFeld(x, ff, k ? '' : 'Neue Rubrik'));
  v.arr.push(x); liste(); vorschau();
  eintragFenster(v.arrPfad + '.' + (v.arr.length - 1), true);
}

// ---------------------------------------------------------------- Der nächste Abend
function mwKnoten(pfad) { const k = pfad.split('.'), gen = { seiten: SATZ.ABEND.seiten(D.abend) }; for (let x = k.length; x > 2; x--) { const n = liesPfad(gen, k.slice(0, x).join('.')); if (istKnoten(n)) return n; } return null; }
function mwAusVorschau(pfad) {
  const n = mwKnoten(pfad), feld = n && n.w; if (!feld) return;
  const t = $(`#liste [data-mw="${feld}"]`); if (!t) return;
  const f = t.closest('label.feld') || t;
  $$('#liste .mw-an').forEach(x => x.classList.remove('mw-an', 'mw-blitz'));
  f.classList.add('mw-an'); void f.offsetWidth; f.classList.add('mw-blitz');
  linksMitte(f);
  setTimeout(() => { t.focus({ preventScroll: true }); const l = t.value.length; try { t.setSelectionRange(l, l); } catch (e) { /* egal */ } }, 450);
}
function mwRechts(feld) {   // ein Feld zeigt beim Hineinklicken seine Zeile rechts, auf derselben Höhe, und lässt sie blinken
  if (Z !== 'woche' || MODUS !== 'einfach' || ANSICHT !== 'karte') return;
  const gen = SATZ.ABEND.seiten(D.abend); let pf = null;
  const such = (n, pfad) => { if (pf || !istKnoten(n)) return; if (n.w === feld) { pf = pfad; return; } (n.a || []).forEach((y, j) => { if (j > 0 || n.fn === 'seite') such(y, `${pfad}.a.${j}`); }); };
  gen.forEach((s, i) => s.a.forEach((n, j) => such(n, `seiten.${i}.a.${j}`)));
  const t = $(`#liste [data-mw="${feld}"]`); if (!pf || !t) return;
  const r = t.getBoundingClientRect(); blitzRechts(pf, r.top + r.height / 2);
}
function beispielWeg() { if (!D.abend.beispiel) return; delete D.abend.beispiel; const b = $('#kopf .kopf__bsp'); if (b) b.remove(); }
function abendSetzen(pfad, wert) { if (pfad === 'preis') wert = preisForm(wert, true); setzePfad(D.abend, pfad, wert); beispielWeg(); }   // die erste eigene Eingabe macht aus dem Beispiel den Abend des Hauses
function abendSchieben(r, leeren) {
  const M = SATZ.ABEND;
  if (leeren) {   // der nächste Dienstag ab heute (Maloja ist Dienstag bis Samstag geöffnet), mindestens eine Woche nach der bisherigen Woche
    const heute = M.iso(new Date()), ab = M.freitag(heute > D.abend.ab ? heute : M.iso(M.datum(D.abend.ab, 7)));
    return frage('Nächste Woche <em>anlegen?</em>', `Die Karte gilt dann für ${M.spanne(ab)}. Die Gänge werden geleert, Zeile, Preis und Fusszeile bleiben, das Motto auch (mit den Pfeilen verschieben Sie das Datum). Die bisherige Woche bleibt unter «Frühere Fassungen».`, 'Nächste Woche',
      () => tun(() => { D.abend.tage = D.abend.tage.map(() => M.leererTag()); D.abend.ab = ab; beispielWeg(); }, 'Nächste Woche angelegt', 'Jetzt die fünf Gänge und die vegetarische Fassung eintragen.'));
  }
  const neu = M.iso(M.datum(D.abend.ab, 7 * r));
  tun(() => { D.abend.ab = neu; }, 'Datum geändert', `Die Karte gilt für ${M.spanne(neu)}. Die Gänge bleiben.`);
}

// ---------------------------------------------------------------- Vorher / nachher, Verlauf, Daten, Protokoll, Zustand, Anschluss
function vglFenster() {
  const v = vergleich(STAND, D), W = { neu: 'Neu', weg: 'Entfernt', anders: 'Geändert', verschoben: 'Verschoben', anordnung: 'Anordnung' };
  const darf = darfVeroeffentlichen();
  const markiere = (a, b) => { const wa = new Set(a.replace(/<[^>]+>/g, ' ').split(/\s+/)); return b.replace(/>([^<]+)</g, (m, t) => '>' + t.split(/(\s+)/).map(w => w.trim() && !wa.has(w) ? `<mark>${w}</mark>` : w).join('') + '<'); };
  fenster(`<h2>Vorher <em>und nachher.</em></h2><p class="satz">${v.length ? `${v.length} ${v.length === 1 ? 'Stelle' : 'Stellen'} im Entwurf. Links steht, was heute in der PDF steht, rechts der Entwurf. Was neu ist, ist markiert.` : 'Der Entwurf ist gleich wie die PDF.'}</p>
    <div class="vgl__k"><span></span><span class="mono">Heute in der PDF</span><span class="mono">Im Entwurf</span></div>
    <div class="vgl">${v.map(x => { if (x.art === 'anordnung') return `<div class="vgl__z"><span class="mono">${W[x.art]}<br><small style="text-transform:none;letter-spacing:0;color:var(--leise)">${h(x.b.ort)}</small></span><div>Wie gesetzt</div><div>${x.n} ${x.n === 1 ? 'Element verschoben, in der Grösse oder Gestaltung geändert' : 'Elemente verschoben, in der Grösse oder Gestaltung geändert'}</div></div>`; const a = x.a ? x.a.text : '', b = x.b ? x.b.text : ''; return `<div class="vgl__z"><span class="mono">${W[x.art]}<br><small style="text-transform:none;letter-spacing:0;color:var(--leise)">${h((x.b || x.a).ort || '')}</small></span><div class="${a ? '' : 'leer'}">${a ? (x.art === 'weg' ? `<del>${a}</del>` : a) : 'stand noch nicht da'}</div><div class="${b ? '' : 'leer'}">${b ? (x.art === 'anders' ? markiere(a, b) : b) : 'nicht mehr auf der Karte'}</div></div>`; }).join('')}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button>${v.length && darf ? `<button class="kn kn--gold" type="button" id="v-ok">Veröffentlichen<i>${PF}</i></button>` : ''}</div>`, true);
  const ok = $('#v-ok'); if (ok) ok.addEventListener('click', veroeffentlichen);
}
async function verlaufFenster() {
  let l = [];
  try { l = (await api('verlauf?z=' + Z)).liste; } catch (e) { return fehlerSagen('Verlauf nicht lesbar', e); }
  fenster(`<h2>Frühere <em>Fassungen.</em></h2><p class="satz">Jede veröffentlichte Fassung bleibt aufbewahrt, dazu jeder verworfene Entwurf und der Stand, mit dem das Werkzeug begonnen hat. Eine Fassung zurückholen legt sie in den Entwurf; die PDF ändert sich erst beim Veröffentlichen. Zurückholen darf die Direktion.</p>
    <div class="verlauf"><div class="verlauf__z"><span class="verlauf__b" aria-hidden="true" style="background-image:url('${fotoKlein(Z)}')"></span><div><b>Ursprünglicher Stand</b><br><span class="mono">so, wie die Karte eingelesen wurde</span></div><div>${WO.knopf('In den Entwurf holen', 'pfeil', 'hell', { klein: true, attr: 'data-d="grundstand"' })}</div></div>
    ${l.map(x => `<div class="verlauf__z"><span class="verlauf__b" aria-hidden="true" style="background-image:url('${fotoKlein(Z)}')"></span><div><b>${x.art === 'verworfen' ? 'Verworfener Entwurf' : 'Veröffentlicht'}</b><br><span class="mono">${h(x.zeit)}${x.wer ? ' · ' + h(x.wer) : ''}</span></div><div>${x.pdf ? `` : ''}${WO.knopf('In den Entwurf holen', 'pfeil', 'hell', { klein: true, attr: `data-d="${h(x.datei)}"` })}</div></div>`).join('') || [   /* M27 (Robert 18.10.2026): nie leer, solange nichts veröffentlicht ist, stehen beschriftete Beispiele da */
      ['Veröffentlicht', '16.10.2026 17:20 · Direktion'], ['Verworfener Entwurf', '12.10.2026 10:45 · Küche'], ['Veröffentlicht', '05.10.2026 09:10 · Direktion']]
      .map(([t, z]) => `<div class="verlauf__z verlauf__z--bsp"><span class="verlauf__b" aria-hidden="true" style="background-image:url('${fotoKlein(Z)}')"></span><div><b>${t}</b><br><span class="mono">Beispiel · ${z}</span></div><div><span class="kn kn--klein kn--hell" aria-disabled="true">In den Entwurf holen</span></div></div>`).join('')
      + '<p class="verlauf__bsp">Beispiele. So steht hier jede Fassung, sobald die erste PDF veröffentlicht ist.</p>'}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button></div>`);
  $('#fenster').addEventListener('click', async ev => {
    const b = ev.target.closest('[data-d]'); if (!b) return;
    try { await api('zurueckholen', { z: Z, datei: b.dataset.d }); } catch (e) { return fehlerSagen('Nicht geholt', e); }
    zu(); await lade(Z); sag('Fassung im Entwurf', 'Prüfen Sie vorher und nachher, dann veröffentlichen.', [{ t: 'Vorher, nachher', f: vglFenster }]);
  });
}
function datenFenster() {
  if (Z === 'woche') return datenFensterAbend();
  fenster(`<h2>Daten <em>der Karte.</em></h2><p class="satz">Für Fortgeschrittene: die Seiten der Karte als Text. Jeder Eintrag ist ein Baustein (fn) mit seinen Angaben (a, k). «aus»: true blendet einen Eintrag aus. Nach «Übernehmen» steht die Karte rechts, gespeichert wird mit dem Knopf unten; der Server prüft jede Eingabe.</p>
    <textarea class="daten" id="j-t" spellcheck="false">${h(JSON.stringify(D.seiten, null, 1))}</textarea><p class="fehler" id="j-f"></p>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="j-ok">Übernehmen<i>${PF}</i></button></div>`, true);
  $('#j-ok').addEventListener('click', () => {
    let x; try { x = JSON.parse($('#j-t').value); } catch (e) { $('#j-f').textContent = 'Der Text ist kein gültiges Format: ' + e.message; return; }
    if (!Array.isArray(x) || !x.length) { $('#j-f').textContent = 'Es fehlen die Seiten der Karte.'; return; }
    D.seiten = x; OFFEN = inhalt(D) !== BASIS; zu(); vorschau(); leiste();
    sag('Übernommen', 'Noch nicht gespeichert. Mit «Speichern» unten landet es im Entwurf.');
  });
}
function datenFensterAbend() {
  fenster(`<h2>Daten <em>der Woche.</em></h2><p class="satz">Für Fortgeschrittene: die Woche als Text. «ab» ist der Donnerstag, ein Menü je Woche (tage hat genau einen Eintrag): vorweg, vorspeise, fisch, haupt, dessert sind die Gerichte, je mit der vegetarischen Fassung (…_z); «zu»: true, solange die Gänge noch nicht feststehen. Nach «Übernehmen» steht die Karte rechts, gespeichert wird mit dem Knopf unten.</p>
    <textarea class="daten" id="j-t" spellcheck="false">${h(JSON.stringify(D.abend, null, 1))}</textarea><p class="fehler" id="j-f"></p>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="j-ok">Übernehmen<i>${PF}</i></button></div>`, true);
  $('#j-ok').addEventListener('click', () => {
    let x; try { x = JSON.parse($('#j-t').value); } catch (e) { $('#j-f').textContent = 'Der Text ist kein gültiges Format: ' + e.message; return; }
    if (!x || !/^\d{4}-\d\d-\d\d$/.test(x.ab || '') || !Array.isArray(x.tage) || x.tage.length !== 1) { $('#j-f').textContent = 'Es fehlen das Datum (ab) oder das Menü der Woche (genau ein Eintrag unter «tage»).'; return; }
    D.abend = x; OFFEN = inhalt(D) !== BASIS; zu(); vorschau(); leiste();
    sag('Übernommen', 'Noch nicht gespeichert. Mit «Speichern» unten landet es im Entwurf.');
  });
}
async function protokollFenster() {
  let l = [];
  try { l = (await api('protokoll?z=' + Z)).liste; } catch (e) { return fehlerSagen('Protokoll nicht lesbar', e); }
  const T = { entwurf: 'hat gespeichert', verworfen: 'hat den Entwurf verworfen', probe: 'hat eine Probe gedruckt', veroeffentlicht: 'hat veröffentlicht', 'veroeffentlichen-abgebrochen': 'Veröffentlichen abgebrochen', einstellungen: 'hat Einstellungen geändert', 'aus-sicherung': 'Datei aus der Sicherung geholt' };
  fenster(`<h2>Wer hat was <em>getan?</em></h2><p class="satz">Die letzten Einträge zu dieser Karte, neueste zuerst.</p><div class="prot">${l.map(x => `<div><span class="mono">${h(x.zeit)}</span><span><b style="font-weight:600">${h(x.wer)}</b> ${h(ROLLEN[x.rolle] ? '(' + ROLLEN[x.rolle] + ')' : '')} ${h(T[x.was] || x.was)}${x.text ? `<small>${h(x.text)}</small>` : ''}${x.grund ? `<small>${h(x.grund)}</small>` : ''}</span></div>`).join('') || '<div><span></span><span>Noch nichts eingetragen.</span></div>'}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button></div>`, true);
}
async function gesundFenster() {
  let g; try { g = await api('gesund'); } catch (e) { return fehlerSagen('Zustand nicht lesbar', e); }
  STATUS_ROT = !g.ok; oben();
  const z = (t, ok) => `<div><span>${h(t)}</span><b class="${ok ? 'ja' : 'nein'}">${ok ? 'in Ordnung' : 'fehlt'}</b></div>`;
  const W = { node: 'Druck der PDF', playwright: 'Druckprogramm', pdftotext: 'Prüfung der PDF', speicher: 'Speicher', druck: 'Druck der PDF', pdfpruefung: 'Prüfung der PDF' };
  const bf = (g.browserfehler || [])[0];
  fenster(`<h2>Ist alles <em>in Ordnung?</em></h2><p class="satz">Der Zustand des Werkzeugs, in der Vorführung direkt im Browser gelesen.${g.vorfuehrung ? ' Vorführ-Betrieb: Gespeichertes hält nicht.' : ''}</p><div class="gesund">${Object.entries(g.karten).map(([k, ok]) => z('Daten ' + ((LISTE.find(x => x.ziel === k) || {}).name || k), ok)).join('')}${Object.entries(g.werkzeug).map(([k, ok]) => z(W[k] || k, ok)).join('')}
    <div><span>Speicher des Werkzeugs</span><b>${g.speicher_mb} MB</b></div><div><span>Läuft seit</span><b>${Math.round(g.seit / 60)} Min.</b></div>${g.fehler.length ? `<div><span>Letzter Fehler im Server</span><b class="nein">${h(g.fehler[g.fehler.length - 1].slice(0, 160))}</b></div>` : ''}${bf ? `<div><span>Letzter Fehler im Browser</span><b class="nein">${h(bf.zeit + ' · ' + bf.text.slice(0, 120))}</b></div>` : ''}</div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button><a class="kn" href="pruefung.html">Prüfung öffnen<i>${PF}</i></a></div>`);
}
async function einstFenster() {
  const s = (await api('status')).einstellungen; EINST = s;
  if (s.demo) return fenster(`<h2>Anschluss an die <em>Website.</em></h2><p class="satz"><b>Vorführung.</b> In der Vorführung arbeitet das Werkzeug für sich: «Veröffentlichen» setzt die Karte nur hier im Werkzeug, es entsteht keine PDF und die Website bleibt, wie sie ist. Im echten Werkzeug ist der Anschluss eingeschaltet; dann erscheinen veröffentlichte Karten auch auf der Website.</p>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button></div>`);   // Demo-Check 21.10.2026
  fenster(`<h2>Anschluss an die <em>Website.</em></h2><p class="satz">Die Website zeigt die Karten des Hauses heute aus ihren eigenen Daten. Solange der Anschluss aus ist, arbeitet das Werkzeug für sich; in der Vorführung bleibt er aus. Mit Anschluss legt «Veröffentlichen» die neue PDF auf die Website (unterlagen/pdf/), die vorige wird vorher gesichert; die Karten in der Form der Website stehen nach jedem Veröffentlichen in karten.json bereit. Nur die Direktion darf das ändern.</p>
    <div class="felder" style="margin-top:20px"><div class="feld"><span class="schalter" role="switch" tabindex="0" aria-checked="${!!s.anschluss_pdf}" id="e-a"><b></b>Veröffentlichte PDF auf die Website übernehmen</span></div></div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button><button class="kn" type="button" id="e-ok">Speichern<i>${PF}</i></button></div>`);
  const sw = $('#e-a'); const um = () => sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true'); sw.addEventListener('click', um); sw.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); um(); } });
  $('#e-ok').addEventListener('click', async () => { try { await api('einstellungen', { anschluss_pdf: sw.getAttribute('aria-checked') === 'true' }); zu(); sag('Gespeichert', sw.getAttribute('aria-checked') === 'true' ? 'Veröffentlichte PDFs gehen jetzt auch auf die Website.' : 'Die Website bleibt, wie sie ist.'); } catch (e) { fehlerSagen('Nicht gespeichert', e); } });
}

// ---------------------------------------------------------------- Probe, Veröffentlichen, Verwerfen
async function probe() {
  if (OFFEN && !(await speichern('Im Entwurf gespeichert', 'Vor der Probe gespeichert.'))) return;
  /* Endprüfung 19.10.2026: die Probe öffnet sich im neuen Tab, sobald sie fertig ist (der Tab wird beim Klick geöffnet, sonst blockt Safari ihn);
     dazu bleibt die Meldung mit «Probe öffnen» 30 s stehen */
  /* Vorführung: statt eines neuen Tabs mit der PDF zeigt ein Fenster die Seite gross, so wie sie gedruckt würde; es entsteht keine Datei */
  sag('Probe-PDF wird gesetzt', 'Einen Moment, sie erscheint gleich gross im Fenster.', [], false, 3000);
  try {
    const r = await api('probe', { z: Z });
    pdfFenster(D, `Probe-PDF · ${r.seiten} ${r.seiten === 1 ? 'Seite' : 'Seiten'}, ${r.art === 'entwurf' ? 'aus dem Entwurf' : 'wie veröffentlicht'}`);
    sag('Probe-PDF fertig', `${r.seiten} ${r.seiten === 1 ? 'Seite' : 'Seiten'}, ${r.art === 'entwurf' ? 'aus dem Entwurf' : 'wie veröffentlicht'}. Die echte PDF bleibt unverändert.`, [], false, 8000);
  } catch (e) { fehlerSagen('Keine Probe-PDF', e); }
}
/* Vorführung: die PDF als grosse Seite im Fenster (dasselbe Blatt wie die Vorschau, satz/blatt.html); Herunterladen und Drucken sagen nur, was geschähe */
function pdfFenster(daten, titel) {
  const breit = Math.min(innerWidth - 40, 980), zoom = Math.max(.32, Math.min(1, (breit - 120) / 794));
  fenster(`<h2>${h(titel)} <em>· ${h((LISTE.find(x => x.ziel === Z) || {}).name || '')}</em></h2><p class="satz">So steht die Karte in der PDF, Seite für Seite. In der Vorführung entsteht keine Datei und es wird nichts gedruckt.</p>
    <div class="pdf-gross"><iframe id="pdf-f" title="Die Karte als PDF (Vorführung)" src="satz/blatt.html"></iframe></div>
    <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button><button class="kn kn--hell" type="button" data-lb-drucken>Drucken<i>${PF}</i></button><button class="kn kn--gold" type="button" data-lb-laden>Herunterladen<i>${PF}</i></button></div>`, true);
  const f = $('#pdf-f'); if (!f) return;
  const setze = () => { try { f.contentWindow.postMessage({ carte: 'setze', daten: kopie(daten), modus: 'einfach', zoom, eigen: false, geschrieben: [], wahl: null, neu: true }, location.origin); } catch (e) { /* noch nicht da */ } };
  f.addEventListener('load', () => { setze(); setTimeout(setze, 250); });
}
document.addEventListener('click', ev => {
  if (ev.target.closest('[data-lb-pdf]')) { zu(); return pdfFenster(STAND, 'Veröffentlichte PDF'); }
  if (ev.target.closest('[data-lb-laden]')) return DEMO.hinweis('In der Vorführung entsteht keine Datei. Die Seite zeigt, wie die PDF aussähe.');
  if (ev.target.closest('[data-lb-drucken]')) return window.print();
});
async function veroeffentlichen() {
  if (OFFEN && !(await speichern('Im Entwurf gespeichert', 'Vor dem Veröffentlichen gespeichert.'))) return;
  if (!geaendert()) { zu(); return sag('Nichts geändert, nichts veröffentlicht.'); }
  const SCHRITTE = ['Der Entwurf wird geprüft', 'Die Karte wird gesetzt und gedruckt', 'PDF und Daten werden verglichen', 'Die neue Fassung wird übernommen'];
  fenster(`<div class="lade"><div class="lade__r"></div><h2>Die Karte <em>entsteht.</em></h2><p class="satz" style="margin:0">Die PDF wird gedruckt und Wort für Wort gegen die Daten geprüft. Erst wenn alles stimmt, ersetzt sie die bisherige; sonst bleibt alles, wie es ist. In der Vorführung entsteht dabei keine Datei.</p><ol id="l-s">${SCHRITTE.map(s => `<li>${h(s)}</li>`).join('')}</ol></div>`);
  $('#fenster').onclick = null;
  try { const r0 = await api('veroeffentlichen', { z: Z }); if (r0.geaendert === false) { zu(); await lade(Z, true); return sag('Nichts geändert, nichts veröffentlicht.'); } } catch (e) { zu(); return fehlerSagen('Nicht veröffentlicht', e); }
  const t0 = Date.now();
  for (;;) {
    await new Promise(r => setTimeout(r, 700));
    let s; try { s = (await api('status')).bau; } catch (e) { continue; }
    const k = s.schritte.indexOf(s.schritt);
    $$('#l-s li').forEach((li, i) => { li.className = s.laeuft ? (i < k ? 'fertig' : i === k ? 'jetzt' : '') : (s.fehler ? '' : 'fertig'); });
    if (!s.laeuft) {
      if (s.fehler) { zu(); await lade(Z); return sag('Nicht veröffentlicht', 'Die PDF ist unverändert, Ihr Entwurf ist noch da. ' + s.fehler.slice(0, 220), [], true); }
      await lade(Z, true);
      const b = s.bericht || {};
      return fenster(`<h2>Veröffentlicht. <em>Die neue Fassung steht.</em></h2><p class="satz">${h(s.fertig)}. ${b.mass ? `Schriftmass ${Math.min(...b.mass)} bis ${Math.max(...b.mass)} %. ` : ''}${/^demo/.test(b.anschluss || '') ? 'Vorführung: Die Website bleibt, wie sie ist; im echten Werkzeug stünde die neue Karte jetzt auch dort.' : b.anschluss && !/^aus/.test(b.anschluss) ? `Die PDF liegt auch auf der Website (${h(b.anschluss)}).` : 'Die Website bleibt bei ihrer Karte, solange der Anschluss aus ist.'} Die vorige Fassung liegt unter «Frühere Fassungen».</p>
        <div class="fenster__kn"><button class="kn kn--hell" type="button" data-zu>Schliessen</button><button class="kn kn--gold" type="button" data-lb-pdf>PDF ansehen<i>${PF}</i></button></div>`);
    }
    if (Date.now() - t0 > 300000) { zu(); return sag('Das dauert ungewöhnlich lange', 'Bitte die Seite später neu laden.', [], true); }
  }
}
function verwerfen() {
  frage('Entwurf <em>verwerfen?</em>', 'Alle Änderungen seit der letzten PDF fallen weg. Der verworfene Entwurf bleibt unter «Frühere Fassungen» aufbewahrt.', 'Verwerfen', async () => {
    try { await api('verwerfen', { z: Z }); } catch (e) { return fehlerSagen('Nicht verworfen', e); }
    await lade(Z); sag('Entwurf verworfen', 'Die Karte steht wieder wie in der PDF.');
  });
}

// ---------------------------------------------------------------- Laden
async function lade(z, still) {
  const r = await api('karte?z=' + encodeURIComponent(z));
  if (z !== Z) { WAHLID = null; WAHLINFO = null; GST_OFFEN = false; NEU_KARTE = true; WEBSEITE = SEITE_DER_KARTE[z] || 'karte.html'; }   // Ansicht «Website» zeigt die Seite dieser Karte, nicht die zuletzt gewählte
  HIST.length = 0; ZUK.length = 0;
  Z = z; STAND = r.stand; D = kopie(r.entwurf || r.stand); BASIS = inhalt(D); OFFEN = false; UNDO = []; GESCHRIEBEN = [];
  ERWARTET = r.entwurf_zeit || STAND.veroeffentlicht;   // auch ein Entwurf, der dem Stand gleicht (nach «Rückgängig»), hat seine eigene Zeit
  try { const st = await api('status'); LISTE = st.karten; RECHTE = st.rechte; EINST = st.einstellungen; } catch (e) { /* Liste bleibt */ }
  try { localStorage.setItem('lc-karte', z); } catch (e) { /* egal */ }
  history.replaceState(null, '', '#' + z);
  alles();
  if (!still && r.entwurf) sag('Entwurf geöffnet', `Gespeichert am ${r.entwurf_zeit}${r.entwurf_wer ? ' von ' + r.entwurf_wer : ''}, noch nicht in der PDF.`);
}
async function wechsel(z) {
  document.documentElement.classList.remove('wo-rand-auf');   // R07: am Handy schliesst sich der Rand nach der Wahl (oberflaeche.js tut es auch)
  if (z === Z) return;
  await KETTE;   // läuft gerade ein Speichern (der nächste Abend speichert beim Verlassen des Feldes, 16.10.2026), erst abwarten: dann ist nichts mehr offen
  if (OFFEN) return frage('Nicht <em>gespeichert.</em>', 'Sie haben in dieser Karte Änderungen, die noch nicht gespeichert sind.', 'Verwerfen und wechseln', () => lade(z));
  await lade(z);
}

// ---------------------------------------------------------------- Ereignisse
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-akt],[data-z],[data-m],[data-zoom],[data-ansicht],[data-webseite]');
  if (!b || (b.closest('#fenster') && !['tagzu'].includes(b.dataset.akt)) || !D) return;
  if (b.dataset.ansicht) { ANSICHT = b.dataset.ansicht; return website(); }
  if (b.dataset.webseite) { WEBSEITE = b.dataset.webseite; return website(); }
  if (b.dataset.z) return wechsel(b.dataset.z);
  if (b.dataset.m) { if (OFFEN && b.dataset.m === 'einfach') return frage('Nicht <em>gespeichert.</em>', 'Erst speichern, dann wechseln?', 'Speichern', async () => { if (await speichern('Im Entwurf gespeichert')) { MODUS = 'einfach'; alles(); } }); MODUS = b.dataset.m; try { localStorage.setItem('lc-modus', MODUS); } catch (e) { /* egal */ } return alles(); }
  if (b.dataset.zoom) { ZM[MODUS] = Math.min(1.3, Math.max(.35, +(ZM[MODUS] + (+b.dataset.zoom) * .1).toFixed(2))); try { localStorage.setItem('lc-zoom-' + MODUS, ZM[MODUS]); } catch (e) { /* egal */ } return $('#vf').contentWindow.postMessage({ carte: 'zoom', zoom: ZM[MODUS], eigen: ZM[MODUS] > ZM_STD[MODUS], wahl: MODUS === 'frei' ? WAHLID : null }, location.origin); }
  const a = b.dataset.akt, r = b.closest('.r'), pfad = r ? r.dataset.pfad : '';
  if (a === 'speichern') return OFFEN ? speichern('Im Entwurf gespeichert') : sag(leiste.gruen ? 'Gespeichert.' : 'Alles ist gespeichert.', 'Offene Eingaben gibt es gerade nicht.');
  if (a === 'veroeffentlichen') return OFFEN || geaendert() ? (OFFEN ? speichern('Im Entwurf gespeichert').then(ok => ok && vglFenster()) : vglFenster()) : null;
  if (a === 'vgl') return vglFenster();
  if (a === 'pdf-live') return pdfFenster(STAND, (LISTE.find(x => x.ziel === Z) || {}).pdf_zeit ? 'Veröffentlichte PDF' : 'Noch keine PDF, so stünde sie');
  if (a === 'web-nachbau') { ev.preventDefault(); if (MODUS === 'frei') { MODUS = 'einfach'; alles(); } ANSICHT = 'website'; document.documentElement.classList.remove('wo-rand-auf'); website(); const v = $('.vorschau'); if (v) v.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
  if (a === 'probe') return probe();
  if (a === 'verwerfen') return verwerfen();
  if (a === 'verlauf') return verlaufFenster();
  if (a === 'daten') return datenFenster();
  if (a === 'protokoll') return protokollFenster();
  if (a === 'gesund') return gesundFenster();
  if (a === 'einst') return einstFenster();
  if (a === 'rundgang') return window.rundgang && window.rundgang();
  if (a === 'abend') return abendSchieben(+b.dataset.r);
  if (a === 'mw-vor') return abendSchieben(-1);
  if (a === 'mw-neu') return abendSchieben(1, true);
  if (a === 'neu') return neuGlobal();
  if (a === 'neu-hier') return neuHier(pfad);
  if (a === 'abend-neu') return abendSchieben(1, true);
  if (a === 'tagzu') { const i = +b.dataset.i; return tun(() => { D.abend.tage[i].zu = !D.abend.tage[i].zu; beispielWeg(); }, D.abend.tage[i].zu ? 'Gänge wieder auf der Karte' : 'Gänge folgen noch'); }
  if (a === 'edit') return eintragFenster(pfad);
  if (a === 'waehle') return waehle(pfad);
  if (a === 'kopie') return kopieren(pfad);
  if (a === 'neu-ende') return neuAmEnde(+b.dataset.i);
  if (a === 'rubrik-neu') return rubrikNeu(+b.dataset.i);
  if (a === 'hoch') return schiebe(pfad, -1);
  if (a === 'runter') return schiebe(pfad, 1);
  if (a === 'weg') return entfernen(pfad);
  if (a === 'aus') { const v = vater(pfad), u = v.arr[v.idx], wird = !u.aus; return tun(() => { if (wird) u.aus = true; else delete u.aus; }, wird ? 'Ausgeblendet' : 'Wieder auf der Karte', `«${istKnoten(u) ? titelVon(u) : u.text}»`, pfad); }
  const si = +b.dataset.i;
  if (a === 's-aus' && !D.seiten[si].aus && D.seiten.filter(x => !x.aus).length === 1) return sag('Die einzige Seite bleibt.', 'Auf der Karte steht sonst keine Seite mehr. Einzelne Einträge blenden Sie mit dem Auge aus.');   // jede Karte des Hauses hat eine Seite
  if (a === 's-aus') return tun(() => { const s = D.seiten[si]; if (s.aus) delete s.aus; else s.aus = true; }, D.seiten[si].aus ? 'Seite ausgeblendet' : 'Seite wieder auf der Karte', 'Seite ' + (si + 1));
  if (a === 's-hoch' || a === 's-runter') { const j = si + (a === 's-hoch' ? -1 : 1); if (j < 0 || j >= D.seiten.length) return; return tun(() => { [D.seiten[si], D.seiten[j]] = [D.seiten[j], D.seiten[si]]; }, 'Seite verschoben', `Seite ${si + 1} steht jetzt als Seite ${j + 1}`); }
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && !$('#fenster').hidden && $('#fenster [data-zu]')) zu();
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); if (OFFEN) speichern('Im Entwurf gespeichert'); }
  const sw = ev.target.closest && ev.target.closest('.schalter[data-akt]'); if (sw && (ev.key === ' ' || ev.key === 'Enter')) { ev.preventDefault(); sw.click(); }
});
/* Der nächste Abend: Eingaben gehen sofort in die Karte rechts, gespeichert wird beim Verlassen des Feldes */
$('#liste').addEventListener('dblclick', ev => { const t = ev.target.closest('.r__t'); const r = t && t.closest('.r'); if (r && r.dataset.pfad && !/\.titel$/.test(r.dataset.pfad)) eintragFenster(r.dataset.pfad); });
$('#liste').addEventListener('input', ev => {
  const el = ev.target.closest('[data-mw]'); if (!el || Z !== 'woche') return;
  setzePfad(D.abend, el.dataset.mw, el.value); beispielWeg(); OFFEN = inhalt(D) !== BASIS; clearTimeout(TIMER); TIMER = setTimeout(vorschau, 250); leiste();
});
$('#liste').addEventListener('focusin', ev => {
  const t = ev.target.closest && ev.target.closest('[data-mw]'); if (!t || Z !== 'woche') return;
  $$('#liste .mw-an').forEach(x => { if (!x.contains(t)) x.classList.remove('mw-an', 'mw-blitz'); });
  (t.closest('label.feld') || t).classList.add('mw-an');
  mwRechts(t.dataset.mw);
});
/* Felder des Abends wachsen mit dem Text (kein Abschneiden nach rechts), Enter schreibt keine neue Zeile (GBR mwWachsen) */
function mwWachsen(el) { (el ? [el] : $$('#liste textarea.mw-t')).forEach(t => { t.style.height = 'auto'; let hoch = t.scrollHeight;   // Tor 30.10.2026 (K2): leeres Feld so hoch wie sein Platzhalter, nie abgeschnitten
  if (!t.value && t.placeholder) { t.value = t.placeholder; hoch = Math.max(hoch, t.scrollHeight); t.value = ''; } t.style.height = hoch + 2 + 'px'; }); }
document.addEventListener('input', ev => { if (ev.target.matches && ev.target.matches('textarea.mw-t')) mwWachsen(ev.target); });
document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('textarea.mw-t')) ev.preventDefault(); });
window.addEventListener('resize', () => mwWachsen());
$('#liste').addEventListener('change', ev => {
  const el = ev.target.closest('[data-mw]'); if (!el || Z !== 'woche') return;
  abendSetzen(el.dataset.mw, el.value); if (el.dataset.mw === 'preis' && el.value !== D.abend.preis) { el.value = D.abend.preis; vorschau(); }
  if (inhalt(D) !== BASIS) speichern('Im Entwurf gespeichert');
});
window.addEventListener('beforeunload', ev => { if (OFFEN) { ev.preventDefault(); ev.returnValue = ''; } });

// ---------------------------------------------------------------- Start
(async () => {
  /* Langsame oder belegte Leitung (Robert 18.10.2026 23:54): der Start wird still bis zu dreimal versucht, erst danach steht die Meldung */
  for (let versuch = 0; ; versuch++) {
  try {
    const z0 = (window.LB_DATEN || {}).zeichen; if (!z0) throw new Error('Die Karten des Hauses fehlen (daten.js).');
    SATZ.zeichen(z0); SATZ_ZEICHEN = z0;
    FOTO = (window.LB_DATEN || {}).fotos || {};   // Fotos je Karte (bau/bau.py)
    const st0 = await api('status'); LISTE = st0.karten; RECHTE = st0.rechte; EINST = st0.einstellungen;
    let z = location.hash.slice(1); if (!LISTE.some(k => k.ziel === z)) { try { z = (/\/giebel\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload')) ? '' : localStorage.getItem('lc-karte'); } catch (e) { z = ''; } }
    if (!LISTE.some(k => k.ziel === z)) z = LISTE[0].ziel;
    await lade(z);
    api('gesund').then(g => { STATUS_ROT = !g.ok; oben(); }).catch(() => { STATUS_ROT = true; oben(); });
    break;
  } catch (e) {
    if (versuch < 2) { await new Promise(z => setTimeout(z, versuch ? 3000 : 1200)); continue; }
    document.body.innerHTML = `<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#201812;color:#d6c9bc;font-family:system-ui,sans-serif;text-align:center"><div><p style="font-size:1.4rem;margin:0 0 10px">${h(NAME)} startet nicht.</p><p style="margin:0 0 22px;color:rgba(214,201,188,.7)">${h(e.message)}</p><a href="pruefung.html" style="display:inline-block;padding:12px 22px;border-radius:10px;background:#bf9163;color:#201812;text-decoration:none">Prüfung öffnen</a></div></div>`;
    if (window.carteMerk) window.carteMerk('Start: ' + e.message);
    break;
  }
  }
})();
})();
