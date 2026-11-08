#!/usr/bin/env node
/* Bilder der Anleitungen · Maloja: ein Bildschirmfoto je Kapitel aus der Vorführung des Werkzeugs, wie anleitung_bilder.js der Vorlagen
   (Le Bureau, La Réception, Le Livre, Le Registre). Nichts wird geschrieben ausser den Bildern; Eingaben bleiben im Arbeitsspeicher der Vorführung.
   node _kleid/anleitung_bilder.js [basis] [werkzeug …]     basis: Adresse des Ordners werkzeuge-mj/ (Standard: Kette-Server :8978) */
const path = require('path'), os = require('os'), fs = require('fs');
const { execFileSync } = require('child_process');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const WZ = path.dirname(__dirname);
const arg = process.argv.slice(2);
const BASIS = (arg.find(a => /^https?:/.test(a)) || 'http://localhost:8978/haus/Tasty%20Studios%20Website/_varianten/runde3/werkzeuge-mj/').replace(/\/?$/, '/');
const NUR = arg.filter(a => !/^https?:/.test(a));
const w = (p, ms) => p.waitForTimeout(ms);
const still = async p => { await p.evaluate(() => document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre,.demo-hinweis').forEach(x => x.remove())); };

/* je Werkzeug: Ordner der Bilder, Art (webp breit 1440 / jpg 1200), Bildgrösse, Schritte [name, adresse, vor] */
const PLAN = {
  kontor: { ordner: 'kontor/anleitung', art: 'webp', vp: [1440, 900], schritte: [
    ['uebersicht', '?ansicht=start'],
    ['termine', '?ansicht=e:termine', async p => { const f = p.locator('[data-cu-termin] input[name="preis"]').first(); if (await f.count()) { await f.fill('172'); await p.locator('#ws-speichern').click().catch(() => {}); await w(p, 1200); } await p.evaluate(() => window.scrollTo(0, 330)); await w(p, 700); }],
    ['bereich', '?ansicht=b:start', async p => { await w(p, 1500); }],
    ['foto', '?ansicht=haus:saele', async p => { await p.locator('details.ws-eintrag summary').first().click(); await w(p, 600); const f = p.locator('#ws-mitte button.ws-foto:not([disabled])').first(); await f.scrollIntoViewIfNeeded(); await f.click(); await p.waitForSelector('[data-ws-fenster="bild"]'); await w(p, 1200); }],
    ['angaben', '?ansicht=angaben'],
    ['google', '?ansicht=google', async p => { const t = p.locator('[data-ws-seo="karte.html"] [data-ws-gt="titel"]'); if (await t.count()) { await t.fill('Die Karte · Maloja, Speicherstadt Hamburg'); await p.locator('#ws-speichern').click().catch(() => {}); await w(p, 1200); await t.scrollIntoViewIfNeeded(); await w(p, 600); } }],
    ['entwurf', '?ansicht=entwurf'],
    ['verlauf', '?ansicht=verlauf']] },
  winde: { ordner: 'winde/bilder', art: 'jpg-voll', vp: [1440, 900], schritte: [
    ['rez-uebersicht', '#start'],
    ['rez-eingang', '#eingang', async p => { await p.locator('.re-liste .re-a', { hasText: 'Katrin Hollmann' }).click(); await w(p, 900); }],
    ['rez-gestalten', '#eingang', async p => { await p.locator('.re-liste .re-a', { hasText: 'Katrin Hollmann' }).click(); await w(p, 900); const g = p.locator('#brief .gs--p').nth(1); await g.scrollIntoViewIfNeeded(); await g.click(); await w(p, 500); }],
    ['rez-pdf', '#eingang', async p => { await p.locator('.re-liste .re-a', { hasText: 'Katrin Hollmann' }).click(); await w(p, 900); const b = p.locator('#brief').first(); await b.scrollIntoViewIfNeeded(); await w(p, 500); }],
    ['rez-deutsch', '#eingang', async p => { await p.locator('.re-liste .re-a', { hasText: 'James Whitfield' }).click(); await w(p, 900); await p.click('#detail [data-akt="deutsch"]'); await p.waitForSelector('.re-de__text'); await w(p, 600); await p.locator('.re-de').scrollIntoViewIfNeeded(); }],
    ['rez-gefragt', '#gefragt'],
    ['rez-nachtragen', '#gefragt', async p => { await p.click('.filter [data-wahl="luecke"]'); await w(p, 600); await p.locator('.re-f [data-akt="nachtragen"]').first().click(); await p.waitForSelector('#f-antwort'); await w(p, 500); }],
    ['rez-nachgetragen', '#nachgetragen'],
    ['rez-wissen', '#wissen'],
    ['rez-probe', '#wissen', async p => { await p.click('#k-probe'); await p.waitForSelector('.ws-handy'); await w(p, 1200); await p.click('.probe__fragen [data-frage]'); await p.waitForFunction(() => document.querySelectorAll('#probe-l .ws-bl--haus').length >= 2 && !document.querySelector('.ws-bl--wartet'), null, { timeout: 20000 }); await w(p, 600); }]] },
  musterkammer: { ordner: 'musterkammer/anleitung', art: 'jpg', vp: [1512, 900], schritte: [
    ['k01', '#start'],
    ['k02', '#bilder', async p => { await p.fill('#li-q', 'stube'); await w(p, 900); }],
    ['k03', '#bilder', async p => { const f = p.locator('#li-raster .li-f').nth(2); await f.scrollIntoViewIfNeeded(); await f.click({ force: true }); await p.waitForSelector('#fenster .li-det'); await w(p, 900); await p.locator('#fenster .li-gr').nth(0).hover(); await w(p, 700); }],
    ['k04', '#bilder', async p => { const f = p.locator('#li-raster .li-f').nth(1); await f.scrollIntoViewIfNeeded(); await w(p, 400); await f.click({ force: true }); await p.waitForSelector('#fenster .li-det'); await w(p, 900); }],
    ['k05', '#dateien', async p => { await p.evaluate(() => document.querySelector('#d-logo').scrollIntoView()); await w(p, 1200); }],
    ['k06', '#dateien', async p => { await p.evaluate(() => document.querySelector('#d-farben').scrollIntoView()); await w(p, 1200); }],
    ['k07', '#pruefung'],
    ['k08', '#pruefung', async p => { await p.locator('#li-bsp').click(); await w(p, 1600); await p.evaluate(() => document.querySelector('.li-erg').scrollIntoView()); await w(p, 1000); }],
    ['k09', 'buch.html']] },
  logbuch: { ordner: 'logbuch/anleitung', art: 'jpg', vp: [1512, 900], schritte: [
    ['k01', '#start'], ['k02', '#start', async p => { await p.evaluate(() => window.scrollTo(0, 520)); await w(p, 2600); }],
    ['k03', '#besuche', async p => { await p.evaluate(() => window.scrollTo(0, 540)); await w(p, 2600); }],
    ['k04', '#besuche', async p => { await p.evaluate(() => window.scrollTo(0, 540)); await w(p, 1600); await p.click('[data-filter="buchung"]').catch(() => {}); await w(p, 800); }],
    ['k05', '#herkunft', async p => { await p.evaluate(() => window.scrollTo(0, 400)); await w(p, 2600); }],
    ['k06', '#zeit', async p => { await p.evaluate(() => window.scrollTo(0, 470)); await w(p, 2600); }],
    ['k07', '#seiten', async p => { await p.evaluate(() => window.scrollTo(0, 470)); await w(p, 2600); }],
    ['k08', '#verlauf', async p => { await p.evaluate(() => window.scrollTo(0, 470)); await w(p, 2600); }],
    ['k09', '#buchung', async p => { await p.evaluate(() => window.scrollTo(0, 470)); await w(p, 2600); }],
    ['k10', '#zaehlung']] },
};

(async () => {
  const b = await pw.webkit.launch({ headless: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mj-anl-'));
  for (const [k, plan] of Object.entries(PLAN)) {
    if (NUR.length && !NUR.includes(k)) continue;
    const ziel = path.join(WZ, plan.ordner); fs.mkdirSync(ziel, { recursive: true });
    for (const [name, adr, vor] of plan.schritte) {
      const c = await b.newContext({ viewport: { width: plan.vp[0], height: plan.vp[1] }, deviceScaleFactor: 1, locale: 'de-DE', reducedMotion: 'reduce' });
      const p = await c.newPage(); const fehler = [];
      p.on('pageerror', e => fehler.push(String(e).slice(0, 120)));
      await p.route('**/*', r => (['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort()));
      const url = BASIS + k + '/' + (adr.endsWith('.html') ? adr : 'index.html' + adr);
      try {
        await p.goto(url, { waitUntil: 'load', timeout: 60000 }); await w(p, 3200); await still(p);
        for (let n = 0; n < 2; n++) { const d = await p.$('dialog[open]'); if (!d || !(await d.isVisible())) break; await p.keyboard.press('Escape'); await w(p, 400); }
        if (vor) await vor(p);
        await still(p); await w(p, 400);
        const roh = path.join(tmp, k + '-' + name + '.png'); await p.screenshot({ path: roh });
        if (plan.art === 'webp') execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=82)', roh, path.join(ziel, name + '.webp')]);
        else if (plan.art === 'jpg-voll') execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', roh, '--out', path.join(ziel, name + '.jpg')], { stdio: 'ignore' });
        else execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '--resampleWidth', '1200', roh, '--out', path.join(ziel, name + '.jpg')], { stdio: 'ignore' });
        console.log('Bild', k, name, fehler.length ? 'Fehler: ' + fehler.join(' ; ') : '');
      } catch (e) { console.log('FEHLT', k, name, e.message.split('\n')[0]); }
      await c.close();
    }
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
})();
