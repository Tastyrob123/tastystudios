#!/usr/bin/env node
/* Bildschirme der Werkzeuge für das Kontrollpanel · Maloja (M08, M23): unsichtbar im Safari-Kern, 1440 × 900 @2x, nach roh/<name>.png.
   Kopie von schirme.js der Zentrale der Häuser. Die Werkzeuge liegen als statische Seiten neben dem Kontrollpanel (../<werkzeug>/index.html);
   aufgenommen wird über einen einfachen Dateiserver auf den Ordner werkzeuge/ (Standard http://127.0.0.1:8801/, sonst erstes Argument mit http).
   Jede Anfrage ausser GET/HEAD wird abgewiesen (nichts wird geschrieben). Weitere Ansichten je Werkzeug über ansichten.json:
   {"winde-chat": {"von": "winde", "adresse": "#probe"}}; Stücke der Säle (Karten, Drucksachen) über "element" als einzelnes Blatt nach roh/<ordner>/,
   liegt das Blatt in einer Vorschau (iframe), nennt "rahmen" sie; "dpr" setzt die Schärfe des Blatts (Standard 2).
   node werkzeuge/giebel/schirme.js [http://127.0.0.1:8801/] [werkzeug …] */
const path = require('path'), os = require('os'), fs = require('fs');
module.paths.push(path.join(os.homedir(), 'Aussen-Pruefung', 'node_modules'));
const pw = require('playwright');
const HIER = __dirname;
const TEIL = { kontor: 'website', lagerbuch: 'karten', werkstatt: 'druck', winde: 'gaeste', musterkammer: 'marke', logbuch: 'besuche' };
const ERSTE = { kontor: 'kontor', lagerbuch: 'lagerbuch', werkstatt: 'werkstatt', winde: 'winde', musterkammer: 'musterkammer-fotos', logbuch: 'logbuch' };
const ansichten = (() => { try { return JSON.parse(fs.readFileSync(path.join(HIER, 'ansichten.json'), 'utf8')); } catch (e) { return {}; } })();
(async () => {
  const arg = process.argv.slice(2);
  const basis = (arg.find(a => /^https?:/.test(a)) || 'http://127.0.0.1:8801/').replace(/\/?$/, '/');
  const nur = arg.filter(a => !/^https?:/.test(a));
  const browser = await pw.webkit.launch({ headless: true });
  const aus = [];
  for (const k of Object.keys(TEIL)) {
    if (nur.length && !nur.includes(k)) continue;
    const adresse = basis + k + '/index.html';
    try { const r = await fetch(adresse); if (!r.ok) throw new Error(r.status); } catch (e) { aus.push({ k, uebersprungen: 'Werkzeug antwortet nicht' }); continue; }
    const erste = ansichten[ERSTE[k]] && ansichten[ERSTE[k]].von === k ? [] : [[ERSTE[k], null]];
    const auftraege = erste.concat(Object.entries(ansichten).filter(([, a]) => a.von === k).map(([n, a]) => [n, a]));
    for (const [name, a] of auftraege) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: a && a.element ? 2400 : 900 }, deviceScaleFactor: (a && a.dpr) || 2, locale: 'de-DE', reducedMotion: 'reduce' });   /* ohne Bewegung: nichts mitten im Auftritt, Zahlen mit ihrem Endwert */
      const page = await ctx.newPage();
      const fehler = [];
      page.on('pageerror', e => fehler.push(String(e)));
      await page.route('**/*', r => (['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort()));
      await page.goto(adresse + ((a && a.adresse) || ''), { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(1800);
      // Begrüssungs- oder Anleitungsfenster schliessen, ohne etwas einzutragen
      for (let n = 0; n < 2; n++) { const d = await page.$('dialog[open], [role="dialog"]:not([hidden])'); if (!d || !(await d.isVisible()) || (a && a.fenster)) break;
        const zu = await d.$('button[aria-label*="chlie"], button.zu, .x, button:has-text("×")'); if (zu) await zu.click().catch(() => {}); else await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
      if (a && a.klick) { await (/^[#\[.]/.test(a.klick) ? page.locator(a.klick) : page.getByText(a.klick, { exact: false })).first().click({ timeout: 8000 }).catch(e => fehler.push('klick: ' + e.message.split('\n')[0])); await page.waitForTimeout(1500); }
      await page.evaluate(() => { document.querySelectorAll('.rdg-kegel,.rdg-karte,.rdg-sperre,.demo-hinweis').forEach(x => x.remove()); });
      if (a && a.element) {   /* ein Blatt (Karte, Drucksache) als Stück für den Saal */
        const ordner = path.join(HIER, 'roh', a.ordner || 'stuecke'); fs.mkdirSync(ordner, { recursive: true });
        if (!a.rahmen) await page.locator(a.element).first().evaluate(x => x.setAttribute('data-schirm-ziel', '')).catch(() => {});   /* das Blatt selbst und alles, worin es liegt, bleibt sichtbar */
        await page.evaluate(r => { const v = (r && document.querySelector(r)) || document.querySelector('[data-schirm-ziel]'); document.querySelectorAll('body *').forEach(x => { const p = getComputedStyle(x).position; if ((p === 'fixed' || p === 'sticky') && !(v && (x.contains(v) || v.contains(x)))) x.style.visibility = 'hidden'; }); }, a.rahmen || '');   /* feste Leisten decken das Blatt nicht zu; die Vorschau mit dem Blatt bleibt */
        const el = (a.rahmen ? page.frameLocator(a.rahmen).locator(a.element) : page.locator(a.element)).first();
        await el.evaluate(x => x.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400);
        await el.evaluate(async x => { await document.fonts.ready; await Promise.all([...x.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); }).catch(() => {}); await page.waitForTimeout(1200);   /* Blatt erst mit allen Schriften und Bildern aufnehmen */
        /* Blätter gerade aufnehmen: in der Werkstatt liegen sie gedreht, im Saal stehen sie gerade (Robert 04.11.2026: «quer und schief») */
        await el.evaluate(x => { for (let p = x; p && p !== document.body; p = p.parentElement) { p.style.setProperty('transform', 'none', 'important'); p.style.setProperty('rotate', 'none', 'important'); } });
        await el.screenshot({ path: path.join(ordner, a.datei + '.png'), type: 'png' }).catch(e => fehler.push('element: ' + e.message.split('\n')[0]));
        if (a.name) { const nj = path.join(ordner, 'namen.json'); let nm = {}; try { nm = JSON.parse(fs.readFileSync(nj, 'utf8')); } catch (e) {}
          nm[a.datei] = a.name; fs.writeFileSync(nj, JSON.stringify(nm, null, 1) + '\n'); }   /* Name des Stücks wie im Werkzeug, für die Beschriftung im Saal */
        aus.push({ k, name, element: a.element, fehler });
      } else {
        fs.mkdirSync(path.join(HIER, 'roh'), { recursive: true });
        await page.screenshot({ path: path.join(HIER, 'roh', name + '.png'), type: 'png' });
        aus.push({ k, name, adresse: (a && a.adresse) || '', fehler });
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(aus, null, 1));
})().catch(e => { console.error(String(e)); process.exit(1); });
