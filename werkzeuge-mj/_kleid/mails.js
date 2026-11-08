#!/usr/bin/env node
/* Mails von Maloja für die Beigabe «Mails» (beigaben_mj_mails.py): das fertige HTML jeder Vorlage aus «Newsletter & E-Mail» (window.__ML.html),
   Wege auf die Fotos und Marke von werkzeuge-mj/_haus. template.html behält die Platzhalter, index.html zeigt einen Beispielgast.
   node werkzeuge-mj/_kleid/mails.js [basis]   → beigaben-mj/mails/<nr-name>/{index,template}.html und mails.json */
const path = require('path'), os = require('os'), fs = require('fs');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const R3 = path.resolve(__dirname, '../..'), Z = path.join(R3, 'beigaben-mj', 'mails');
const BASIS = (process.argv.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/werkzeuge-mj/').replace(/\/?$/, '/');
// Reihenfolge wie beim Hotel: von der Reservierung bis nach dem Abend; «Wann» nach der Bezeichnung im Werkzeug
const REIHE = [['ticket', 'Als Bestätigung, sobald ein Tisch reserviert ist.'], ['warteliste', 'An die Warteliste, sobald ein Tisch frei wird.'],
  ['danke', 'Am Tag nach dem Abend.'], ['rueckblick', 'An die Gäste des Abends.'], ['abend', 'An alle Gäste, die Post von Maloja möchten.'],
  ['einladung', 'An ausgewählte Gäste.']];
const wege = h => h.replace(/https?:\/\/[^'"()\s]*?\/werkzeuge-mj\//g, '../../../werkzeuge-mj/').replace(/\.\.\/_haus\//g, '../../../werkzeuge-mj/_haus/').replace(/\.\.\/_kleid\//g, '../../../werkzeuge-mj/_kleid/');
(async () => {
  fs.mkdirSync(Z, { recursive: true });
  const b = await pw.webkit.launch({ headless: true }); const p = await b.newPage();
  await p.goto(BASIS + 'werkstatt/mail.html', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  const aus = [];
  for (const [i, [key, wann]] of REIHE.entries()) {
    const k = p.locator(`#mlVorlagen [data-vorlage="${key}"]`); if (!(await k.count())) { console.log('FEHLT', key); continue; }
    const titel = (await k.locator('b').first().innerText()).replace(/\s+/g, ' ');
    await k.evaluate(x => x.click()); await p.waitForTimeout(1500);
    const h = await p.evaluate(() => window.__ML.html()), betreff = (await p.locator('#mlBetreff').innerText()).trim();
    const ordner = String(i + 1).padStart(2, '0') + '-' + key;
    fs.mkdirSync(path.join(Z, ordner), { recursive: true });
    fs.writeFileSync(path.join(Z, ordner, 'template.html'), wege(h));
    fs.writeFileSync(path.join(Z, ordner, 'index.html'), wege(h).replace(/\[Name\]/g, 'Frau Hollmann').replace(/\*\|(ARCHIVE|UNSUB)\|\*/g, '#'));
    aus.push({ key, ordner, titel, betreff, wann });
  }
  fs.writeFileSync(path.join(Z, 'mails.json'), JSON.stringify(aus, null, 1));
  console.log('Mails', aus.length);
  await b.close();
})();
