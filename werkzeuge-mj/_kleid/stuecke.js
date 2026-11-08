#!/usr/bin/env node
/* Echte Stücke von Maloja für die Beigaben: jede Vorlage der Werkstatt «Drucksachen & Feed», so wie die Werkstatt sie setzt (Vorderseite),
   als Bild nach ../beigaben-mj/stuecke/<art>/<id>.webp, dazu stuecke.json (Titel, Bereich, Art, Format). Wie die Hotel-Fassung ihre Stücke
   aus der Werkstatt von Ihr Haus nimmt (bz/). node werkzeuge-mj/_kleid/stuecke.js [basis] [art …] */
const path = require('path'), os = require('os'), fs = require('fs');
const { execFileSync } = require('child_process');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const WZ = path.dirname(__dirname), ZIEL = path.join(path.dirname(WZ), 'beigaben-mj', 'stuecke');
const arg = process.argv.slice(2);
const BASIS = (arg.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/werkzeuge-mj/').replace(/\/?$/, '/');
const NUR = arg.filter(a => !/^https?:/.test(a)).map(a => a.normalize('NFC'));
const w = (p, ms) => p.waitForTimeout(ms);
(async () => {
  fs.mkdirSync(ZIEL, { recursive: true });
  const jf = path.join(ZIEL, 'stuecke.json');
  const alt = fs.existsSync(jf) ? JSON.parse(fs.readFileSync(jf, 'utf8')) : {};
  const b = await pw.webkit.launch({ headless: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mj-st-'));
  const c0 = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p0 = await c0.newPage();
  await p0.goto(BASIS + 'werkstatt/index.html#neu', { waitUntil: 'load' }); await w(p0, 3500);
  const arten = await p0.evaluate(() => [...document.querySelectorAll('#neu button.stueck, button.stueck')].map(x => (x.querySelector('.stueck__name') || {}).innerText).filter(Boolean).map(a => a.replace(/[\u00ad\u200b]/g, '').replace(/\u00a0/g, ' ').trim().normalize('NFC')));
  await c0.close();
  const liste = [...new Set(arten)].filter(a => a !== 'Leeres Blatt' && (!NUR.length || NUR.includes(a)));
  for (const art of liste) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: +(process.env.DPR || 5), locale: 'de-DE', reducedMotion: 'reduce' });
    const p = await c.newPage();
    await p.route('**/*', r => (['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort()));
    await p.goto(BASIS + 'werkstatt/index.html#neu', { waitUntil: 'load' }); await w(p, 3000);
    await p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre,.demo-hinweis').forEach(x => x.remove()));
    await p.locator('button.stueck', { has: p.locator('.stueck__name', { hasText: new RegExp('^' + art.split('').map(ch => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\u00ad\u200b]?').replace(/ /g, '[ \u00a0]') + '$') }) }).first().evaluate(x => x.click()); await w(p, 2500);
    await p.addStyleTag({ content: '#startVorlagen .stueck{--r:0deg!important}#startVorlagen .stueck__buehne,#startVorlagen .stueck__satz,#startVorlagen .papier{transform:none!important;rotate:none!important;box-shadow:none!important;filter:none!important}' });
    const n = await p.locator('#startVorlagen button.stueck--vorlage[data-vid]').count();
    const ordner = path.join(ZIEL, art.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    fs.mkdirSync(ordner, { recursive: true });
    alt[art] = [];
    for (let i = 0; i < n; i++) {
      const s = p.locator('#startVorlagen button.stueck--vorlage[data-vid]').nth(i);
      await s.scrollIntoViewIfNeeded(); await w(p, 900);
      const vid = await s.getAttribute('data-vid');
      const pap = s.locator('.papier--vorn').first();
      await p.waitForFunction(el => el && el.querySelector('.blatt'), await pap.elementHandle(), { timeout: 8000 }).catch(() => {});
      await p.evaluate(el => Promise.all([...el.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))), await pap.elementHandle());
      await w(p, 250);
      const info = await s.evaluate(x => ({ titel: (x.querySelector('.zl__name') || x.querySelector('b') || {}).innerText || '', format: (x.querySelector('.stueck__format') || {}).innerText || '', satz: (x.querySelector('.stueck__satztext') || {}).innerText || '' }));
      const roh = path.join(tmp, vid + '.png');
      try { await pap.screenshot({ path: roh }); } catch (e) { console.log('FEHLT', art, vid, e.message.split('\n')[0]); continue; }
      const datei = path.join(ordner, vid + '.webp');
      execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=86)', roh, datei]);
      alt[art].push(Object.assign({ id: vid, datei: path.relative(path.dirname(ZIEL), datei) }, info));
    }
    console.log(art, alt[art].length); fs.writeFileSync(jf, JSON.stringify(alt, null, 1));
    await c.close();
  }
  fs.writeFileSync(jf, JSON.stringify(alt, null, 1));
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.log("ABBRUCH", e.message); process.exit(1); });
