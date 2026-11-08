#!/usr/bin/env node
/* Weitere echte Stücke von Maloja für die Beigaben (neben stuecke.js): die Mails aus «Newsletter & E-Mail», die Blätter des Markenbuchs
   (buch.html), die Karte auf dem Handy (lagerbuch/web/karte.html) und ein Antwortbrief aus «Anfragen & Chat».
   Nach ../beigaben-mj/stuecke/{mails,markenbuch,karte,briefe}/ und bilder.json.   node werkzeuge-mj/_kleid/beigaben_bilder.js [basis] [teil …] */
const path = require('path'), os = require('os'), fs = require('fs');
const { execFileSync } = require('child_process');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const WZ = path.dirname(__dirname), ZIEL = path.join(path.dirname(WZ), 'beigaben-mj', 'stuecke');
const arg = process.argv.slice(2);
const BASIS = (arg.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/werkzeuge-mj/').replace(/\/?$/, '/');
const NUR = arg.filter(a => !/^https?:/.test(a));
const w = (p, ms) => p.waitForTimeout(ms);
const jf = path.join(ZIEL, 'bilder.json');
const J = fs.existsSync(jf) ? JSON.parse(fs.readFileSync(jf, 'utf8')) : {};
let tmp;
async function ab(loc, teil, name, q = 86) {
  const roh = path.join(tmp, teil + '-' + name + '.png'); await loc.screenshot({ path: roh });
  fs.mkdirSync(path.join(ZIEL, teil), { recursive: true });
  const d = path.join(ZIEL, teil, name + '.webp');
  execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=int(sys.argv[3]))', roh, d, String(q)]);
  return 'stuecke/' + teil + '/' + name + '.webp';
}
const still = p => p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre,.demo-hinweis').forEach(x => x.remove()));
const TEILE = {
  async mails(b) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'de-DE', reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(BASIS + 'werkstatt/mail.html', { waitUntil: 'load' }); await w(p, 3000); await still(p);
    const n = await p.locator('#mlVorlagen [data-vorlage]').count(); const aus = [];
    for (let i = 0; i < n; i++) {
      const k = p.locator('#mlVorlagen [data-vorlage]').nth(i), key = await k.getAttribute('data-vorlage');
      const titel = (await k.locator('b').first().innerText()).replace(/\s+/g, ' ');
      if (/leer/i.test(key) || /Leere/.test(titel)) continue;
      await k.evaluate(x => x.click()); await w(p, 2200);
      const betreff = await p.locator('#mlBetreff').innerText(), vorschau = await p.locator('#mlVorschau').innerText();
      const hoch = await p.locator('#mlBlatt').evaluate(x => Math.ceil(x.getBoundingClientRect().height));
      await p.setViewportSize({ width: 1440, height: hoch + 400 }); await w(p, 900);
      await p.locator('#mlBlatt').scrollIntoViewIfNeeded(); await w(p, 600);
      const r = await p.evaluate(() => { const bl = document.querySelector('#mlBlatt'), q = bl.getBoundingClientRect(), t = document.querySelector('#mlRahmen').contentDocument.querySelector('body > table');
        return { x: q.left, y: q.top + scrollY, width: q.width, height: Math.min(q.height, t ? Math.ceil(t.getBoundingClientRect().bottom) : q.height) }; });
      const roh = path.join(tmp, 'mail.png'); await p.screenshot({ path: roh, clip: r, fullPage: true });
      fs.mkdirSync(path.join(ZIEL, 'mails'), { recursive: true });
      execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=86)', roh, path.join(ZIEL, 'mails', key + '.webp')]);
      aus.push({ key, titel, betreff, vorschau, datei: 'stuecke/mails/' + key + '.webp' });
      await p.setViewportSize({ width: 1440, height: 900 });
    }
    J.mails = aus; await c.close();
  },
  async markenbuch(b) {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-DE', reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(BASIS + 'musterkammer/buch.html', { waitUntil: 'load' }); await w(p, 2500);
    await p.evaluate(() => document.querySelectorAll('body *').forEach(x => { const c = getComputedStyle(x).position; if (c === 'fixed' || c === 'sticky') x.style.visibility = 'hidden'; }));
    const ids = await p.evaluate(() => [...document.querySelectorAll('main section[id], body > section[id], section[id]')].map(s => s.id));
    const aus = [];
    for (const id of [...new Set(ids)]) {
      const s = p.locator('section#' + id).first(); await s.scrollIntoViewIfNeeded(); await w(p, 1400);
      await p.evaluate(id => document.querySelectorAll('#' + id + ' img').forEach(i => { i.loading = 'eager'; }), id); await w(p, 600);
      const titel = await s.evaluate(x => { const h = x.querySelector('h1,h2'); return h ? h.innerText.replace(/\s+/g, ' ') : ''; });
      aus.push({ id, titel, datei: await ab(s, 'markenbuch', id, 84) });
    }
    J.markenbuch = aus; await c.close();
  },
  async karte(b) {
    const c = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, locale: 'de-DE', reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(BASIS + 'lagerbuch/index.html#menue-herbst', { waitUntil: 'load' }); await w(p, 3000); await still(p);
    await p.locator('[data-ansicht="website"]').first().evaluate(x => x.click()); await w(p, 2500);
    const fr = p.locator('iframe').filter({ has: p.locator(':scope') }).first();
    const rahmen = await p.evaluate(() => [...document.querySelectorAll('iframe')].filter(f => f.offsetParent && /web\//.test(f.src)).map(f => ({ src: f.src, w: f.clientWidth, h: f.clientHeight })));
    console.log('Rahmen', JSON.stringify(rahmen));
    await p.evaluate(() => document.querySelectorAll('.wo-leiste,.meldung,.wo-kopf').forEach(x => { x.style.visibility = 'hidden'; }));
    const f = p.locator('iframe[src*="web/"]').first();
    J.karte = [{ titel: 'Die Karte auf der Website', datei: await ab(f, 'karte', 'website') }];
    await c.close();
  },
  async briefe(b) {
    const c = await b.newContext({ viewport: { width: 1440, height: 2800 }, deviceScaleFactor: 2, locale: 'de-DE', reducedMotion: 'reduce' }); const p = await c.newPage();
    await p.goto(BASIS + 'winde/index.html#eingang', { waitUntil: 'load' }); await w(p, 3000); await still(p);
    const aus = [];
    for (const name of ['Katrin Hollmann', 'Dr. Ulrike Brandes']) {
      await p.evaluate(() => window.scrollTo(0, 0)); await p.locator('.re-liste .re-a', { hasText: name }).first().evaluate(x => x.click()); await w(p, 1200);
      await p.evaluate(() => document.querySelectorAll('.wo-kopf,.gs-werk,.wo-leiste,.meldung').forEach(x => { x.dataset.wegB = '1'; x.style.visibility = 'hidden'; }));
      await p.evaluate(() => window.scrollTo(0, 0)); await w(p, 500);
      const r = await p.locator('#brief').evaluate(x => { const q = x.getBoundingClientRect(); return { x: q.left, y: q.top, width: q.width, height: q.height }; });
      const roh = path.join(tmp, 'brief.png'); await p.screenshot({ path: roh, clip: r, timeout: 60000, animations: 'disabled' });
      const nm = name.toLowerCase().replace(/[^a-z]+/g, '-'); fs.mkdirSync(path.join(ZIEL, 'briefe'), { recursive: true });
      execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=86)', roh, path.join(ZIEL, 'briefe', nm + '.webp')]);
      aus.push({ titel: 'Antwort an ' + name, datei: 'stuecke/briefe/' + nm + '.webp' });
      await p.evaluate(() => document.querySelectorAll('[data-weg-b]').forEach(x => { x.style.visibility = ''; delete x.dataset.wegB; }));
    }
    J.briefe = aus; await c.close();
  },
};
(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mj-bb-'));
  const b = await pw.webkit.launch({ headless: true });
  for (const [k, f] of Object.entries(TEILE)) {
    if (NUR.length && !NUR.includes(k)) continue;
    try { await f(b); console.log(k, (J[k] || []).length); } catch (e) { console.log('FEHLT', k, e.message.split('\n')[0]); }
    fs.writeFileSync(jf, JSON.stringify(J, null, 1));
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})().catch(e => { console.log('ABBRUCH', e.message); process.exit(1); });
