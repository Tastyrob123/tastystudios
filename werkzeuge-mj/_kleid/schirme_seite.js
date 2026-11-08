#!/usr/bin/env node
/* Bildschirme der sieben Maloja-Werkzeuge für die Werkzeuge-Seite der Restaurant-Fassung (werkzeuge_gastro.py, Atelier):
   je Werkzeug eine Ansicht der Vorführung, 1440 × 900 @2x, nach ../wz1-mj/<name>-1440.webp und -900.webp (wie wz1/ der Hotel-Fassung).
   node werkzeuge-mj/_kleid/schirme_seite.js [basis] */
const path = require('path'), os = require('os'), fs = require('fs');
const { execFileSync } = require('child_process');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const WZ = path.dirname(__dirname), ZIEL = path.join(path.dirname(WZ), 'wz1-mj');
const BASIS = (process.argv.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/werkzeuge-mj/').replace(/\/?$/, '/');
const w = (p, ms) => p.waitForTimeout(ms);
const still = p => p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre,.demo-hinweis').forEach(x => x.remove()));
const PLAN = [
  ['giebel-uebersicht', 'giebel/index.html'],
  ['kontor-stelle', 'kontor/index.html?ansicht=b:start', async p => { await w(p, 1500); }],
  ['lagerbuch-menue', 'lagerbuch/index.html#menue-herbst'],
  // Anfragen & Chat: der Eingang, nicht das offene Probe-Fenster (Robert 04.11.2026: «warum sind da diese riesigen Felder … mit diesen komischen Telefonen»)
  ['winde-chat-gespraech', 'winde/index.html', async p => { await p.getByText('Eingang').first().click(); await w(p, 1800); }],
  ['musterkammer-logo', 'musterkammer/index.html#dateien', async p => { await p.evaluate(() => document.querySelector('#d-logo').scrollIntoView()); await w(p, 1400); }],
  ['werkstatt-neu', 'werkstatt/index.html#neu'],
  ['logbuch-besuch', 'logbuch/index.html#besuche', async p => { await p.evaluate(() => window.scrollTo(0, 420)); await w(p, 2400); }],
];
(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  const b = await pw.webkit.launch({ headless: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mj-schirm-'));
  for (const [name, adr, vor] of PLAN) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'de-DE', reducedMotion: 'reduce' });
    const p = await c.newPage(); const fehler = [];
    p.on('pageerror', e => fehler.push(String(e).slice(0, 120)));
    await p.route('**/*', r => (['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort()));
    try {
      await p.goto(BASIS + adr, { waitUntil: 'load', timeout: 60000 }); await w(p, 3200); await still(p);
      if (vor) await vor(p);
      await still(p); await w(p, 400);
      const roh = path.join(tmp, name + '.png'); await p.screenshot({ path: roh });
      execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nfor b in (1440,900): im.resize((b,round(b*im.size[1]/im.size[0])),Image.LANCZOS).save(sys.argv[2]+"-"+str(b)+".webp","WEBP",quality=84)', roh, path.join(ZIEL, name)]);
      console.log('Bild', name, fehler.length ? 'Fehler: ' + fehler.join(' ; ') : '');
    } catch (e) { console.log('FEHLT', name, e.message.split('\n')[0]); }
    await c.close();
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
