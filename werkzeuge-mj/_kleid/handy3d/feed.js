#!/usr/bin/env node
/* Feed-Handy der Bühne «Der Feed» wie bz/ig-ganz der Hotel-Fassung: das ganze Instagram-Profil von Maloja aus der Feed-Seite (beigaben-mj/feed),
   ein Bild in Bildschirmbreite (786 px) zum Scrollen im Handy, nach beigaben-mj/stuecke/ig-ganz.webp.   node werkzeuge-mj/_kleid/handy3d/feed.js [basis] */
const path = require('path'), os = require('os'), fs = require('fs');
const { execFileSync } = require('child_process');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const R3 = path.resolve(__dirname, '../../..');
const BASIS = (process.argv.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/').replace(/\/?$/, '/');
(async () => {
  const b = await pw.webkit.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 3 });
  await p.goto(BASIS + 'beigaben-mj/feed/index.html', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.evaluate(() => { document.querySelectorAll('#scroll img').forEach(i => { i.loading = 'eager'; }); });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const s = document.querySelector('#scroll'); s.style.height = s.scrollHeight + 'px'; s.style.maxHeight = 'none'; s.style.overflow = 'visible';
    let e = s.parentElement; while (e && e !== document.body) { e.style.height = 'auto'; e.style.maxHeight = 'none'; e.style.overflow = 'visible'; e = e.parentElement; }
    return s.getBoundingClientRect().width; });
  await p.evaluate(() => Promise.all([...document.querySelectorAll('#scroll img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  await p.waitForTimeout(800);
  const roh = path.join(os.tmpdir(), 'mj-ig-ganz.png');
  await p.locator('#scroll').screenshot({ path: roh });
  execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nim=im.resize((786,round(786*im.size[1]/im.size[0])),Image.LANCZOS)\nim.save(sys.argv[2],"WEBP",quality=84)\nprint(im.size)', roh, path.join(R3, 'beigaben-mj/stuecke/ig-ganz.webp')], { stdio: 'inherit' });
  console.log('Profilbreite', r);
  await b.close();
})();
