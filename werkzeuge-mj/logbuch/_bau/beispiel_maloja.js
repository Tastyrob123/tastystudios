// Besucher · Maloja: Beispielwerte von Ihr Haus (_bau/beispiel.ihrhaus.js, Rechenweg der Vorlage) auf die vier Seiten von Maloja gelegt.
// Zimmer → Die Karte, Die Tafel → Feiern, Kontakt → Reservieren, Anreise und Impressum → Startseite (Anfahrt steht dort). Zahlen bleiben, gleiche Seiten werden zusammengezählt.
//   node _bau/beispiel_maloja.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const HIER = __dirname, c = {}; c.window = c; vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(HIER, 'beispiel.ihrhaus.js'), 'utf8'), c);
const D = JSON.parse(JSON.stringify(c.LB_BEISPIEL));
const S = { 'zimmer.html': 'karte.html', 'tafel.html': 'feiern.html', 'kontakt.html': 'reservieren.html', 'anreise.html': 'index.html', 'impressum.html': 'index.html' };
const s = x => S[x] || x;
const HERK = { 'Booking.com': 'Google Maps' };
for (const t of Object.keys(D)) {
  const d = D[t];
  const m = {};
  (d.seiten || []).forEach(x => { const k = s(x.s), a = m[k] || (m[k] = { s: k, n: 0, sek: 0, buchung: 0 }); a.sek = Math.round((a.sek * a.n + x.sek * x.n) / Math.max(1, a.n + x.n)); a.n += x.n; a.buchung += x.buchung; });
  d.seiten = Object.values(m).sort((a, b) => b.n - a.n);
  const h = {};
  (d.herkunft || []).forEach(x => { const k = HERK[x.k] || x.k; h[k] = (h[k] || 0) + x.n; });
  d.herkunft = Object.entries(h).map(([k, n]) => ({ k, n })).sort((a, b) => b.n - a.n);
  if (d.roh && d.roh.seiten_sek) { const r = {}; for (const [k, v] of Object.entries(d.roh.seiten_sek)) { const z = s(k), a = r[z] || (r[z] = [0, 0]); a[0] += v[0]; a[1] += v[1]; } d.roh.seiten_sek = r; }
  (d.besuche || []).forEach(b => { b.h = HERK[b.h] || b.h; (b.weg || []).forEach(w => { w.s = s(w.s); }); });
}
const t = fs.readFileSync(path.join(HIER, 'beispiel.ihrhaus.js'), 'utf8');
const kopf = t.slice(0, t.indexOf('window.LB_BEISPIEL'));
let roh = JSON.stringify(D);
for (const [a, b] of Object.entries(S)) if (roh.includes(a)) throw new Error('Rest: ' + a);
fs.writeFileSync(path.join(HIER, '..', 'beispiel.js'), kopf.replace('Seiten, Orte und Wege von Maloja', 'gelegt auf die Seiten von Maloja (_bau/beispiel_maloja.js)') + 'window.LB_BEISPIEL = ' + roh + ';\n');
console.log('beispiel.js', Object.keys(D).map(k => k + ' Tage: ' + D[k].seiten.map(x => x.s + ' ' + x.n).join(', ')).join(' | '));
