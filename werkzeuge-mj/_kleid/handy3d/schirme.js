#!/usr/bin/env node
/* Bildschirme für die Handys der Bühnen «Mails» und «Die Karte am Tisch» (wie bz/handy3d-mails und -mappe der Hotel-Fassung):
   390 × 844 @3 = 1170 × 2532 nach schirme/<name>.png. Mails: Ansicht im Postfach (Absender Maloja) mit der Mail aus «Newsletter & E-Mail»;
   Karte: der Nachbau der Seite «Die Karte» aus «Speisekarten» in Handybreite.   node werkzeuge-mj/_kleid/handy3d/schirme.js [basis] */
const path = require('path'), os = require('os'), fs = require('fs');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const HIER = __dirname, R3 = path.resolve(HIER, '../../..'), OUT = path.join(HIER, 'schirme');
const BASIS = (process.argv.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/werkzeuge-mj/').replace(/\/?$/, '/');
const w = (p, ms) => p.waitForTimeout(ms);
const zeichen = fs.readFileSync(path.join(R3, 'werkzeuge-mj/_haus/marke/zeichen.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');
const font = f => 'data:font/woff2;base64,' + fs.readFileSync(path.join(R3, 'werkzeuge-mj/_haus/fonts', f)).toString('base64');
function postfach(mailBild, an, zeit, betreff) {
  const b64 = 'data:image/webp;base64,' + fs.readFileSync(path.join(R3, 'beigaben-mj', mailBild)).toString('base64');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:T;src:url(${font('TenorSans.woff2')})}@font-face{font-family:H;src:url(${font('HankenGrotesk-latin.woff2')});font-weight:200 800}
html,body{margin:0;background:#f4f1eb;width:390px;height:844px;overflow:hidden;font-family:H,sans-serif;color:#231a14}
.st{display:flex;justify-content:space-between;align-items:center;height:50px;padding:0 30px 0 34px;font:600 16px/1 -apple-system,Helvetica,sans-serif}
.st i{display:flex;gap:6px;align-items:center}.st svg{display:block}
.k{padding:6px 18px 12px;background:#f4f1eb}
.zu{display:flex;justify-content:space-between;color:#9a6f45;font-size:15px;margin:2px 0 14px}
.ab{display:flex;gap:11px;align-items:center}
.av{width:40px;height:40px;border-radius:50%;background:#231a14;display:grid;place-items:center}.av svg{width:26px;height:26px;color:#f4f1eb}
.ab b{display:block;font:600 15px/1.2 H}.ab span{font-size:13px;color:#6b655f}
h1{font:400 21px/1.25 T;margin:14px 0 0;letter-spacing:.01em}
.m{display:block;width:390px}
</style></head><body>
<div class="st"><span>9:41</span><i><svg width="18" height="12" viewBox="0 0 18 12" fill="#231a14"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="#231a14" opacity=".5"/><rect x="2" y="2" width="19" height="8" rx="2" fill="#231a14"/></svg></i></div>
<div class="k"><div class="zu"><span>‹ Eingang</span><span>⌃⌄</span></div>
<div class="ab"><span class="av">${zeichen.replace('<svg', '<svg fill="currentColor"')}</span><div><b>Maloja</b><span>An: ${an} · ${zeit}</span></div></div>
<h1>${betreff}</h1></div>
<img class="m" src="${b64}" alt="">
</body></html>`;
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const J = JSON.parse(fs.readFileSync(path.join(R3, 'beigaben-mj/stuecke/bilder.json'), 'utf8'));
  const mail = k => J.mails.find(m => m.key === k);
  const b = await pw.webkit.launch({ headless: true });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p = await c.newPage();
  for (const [name, k, an, zeit] of [['mail-ticket', 'ticket', 'Katrin Hollmann', '9:12'], ['mail-advent', 'abend', 'Katrin Hollmann', 'Gestern']]) {
    const m = mail(k);
    await p.setContent(postfach(m.datei, an, zeit, m.betreff)); await w(p, 800);
    await p.screenshot({ path: path.join(OUT, name + '.png') }); console.log('Schirm', name);
  }
  await c.close();
  // Karte: Nachbau der Seite «Die Karte» im Werkzeug, Rahmen auf Handybreite
  const c2 = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3 }); const q = await c2.newPage();
  await q.goto(BASIS + 'lagerbuch/index.html#menue-herbst', { waitUntil: 'load' }); await w(q, 3000);
  await q.locator('[data-ansicht="website"]').first().evaluate(x => x.click()); await w(q, 2500);
  await q.evaluate(() => { document.querySelectorAll('.wo-leiste,.meldung,.wo-kopf').forEach(x => { x.style.visibility = 'hidden'; });
    const f = document.querySelector('iframe[src*="web/"]'); f.style.width = '390px'; f.style.height = '844px'; f.style.maxWidth = 'none'; f.style.transform = 'none'; window.scrollTo(0, 0); });
  await q.addStyleTag({ content: 'iframe[src*="web/"]{width:390px!important;height:844px!important;max-width:none!important;max-height:none!important;transform:none!important;border-radius:0!important;box-shadow:none!important;border:0!important}' });
  await q.evaluate(() => { const f = document.querySelector('iframe[src*="web/"]'); f.removeAttribute('width'); f.removeAttribute('height');
    for (const [k, v] of [['width', '390px'], ['height', '844px'], ['min-width', '0'], ['max-width', 'none'], ['flex', 'none'], ['zoom', '1']]) f.style.setProperty(k, v, 'important');
    let e = f.parentElement; for (let i = 0; i < 4 && e; i++, e = e.parentElement) { e.style.setProperty('width', 'auto', 'important'); e.style.setProperty('transform', 'none', 'important'); e.style.setProperty('overflow', 'visible', 'important'); e.style.setProperty('height', 'auto', 'important'); e.style.setProperty('max-height', 'none', 'important'); e.style.setProperty('border-radius', '0', 'important'); e.style.setProperty('clip-path', 'none', 'important'); } });
  await w(q, 1800);
  console.log(await q.evaluate(() => { const f = document.querySelector('iframe[src*="web/"]'); const r = f.getBoundingClientRect(); return r.width + 'x' + r.height + ' innen ' + f.contentWindow.innerWidth; }));
  const f = q.locator('iframe[src*="web/"]').first();
  await f.screenshot({ path: path.join(OUT, 'karte-oben.png') }); console.log('Schirm karte-oben');
  await q.evaluate(() => { const d = document.querySelector('iframe[src*="web/"]').contentWindow; const h = d.document.querySelector('h2, .gaenge, section:nth-of-type(2)'); d.scrollTo(0, h ? h.getBoundingClientRect().top + d.scrollY - 20 : 760); });
  await w(q, 1500);
  await f.screenshot({ path: path.join(OUT, 'karte-gaenge.png') }); console.log('Schirm karte-gaenge');
  await b.close();
})().catch(e => { console.log('ABBRUCH', e.message); process.exit(1); });
