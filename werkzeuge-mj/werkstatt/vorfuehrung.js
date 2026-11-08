/* Drucksachen & Feed · Vorführung: Speichern, PDF, Bild, ZIP und Arbeitsdatei laufen sichtbar durch, es entsteht keine Datei.
   Wo die Vorlage eine Datei herunterlädt, zeigt dieses Werkzeug, wie sie aussähe (die Seiten als Bild, gerechnet wie für den Druck),
   nennt Format, Beschnitt und Schriften und sagt mit DEMO.hinweis, dass in der Vorführung nichts entsteht. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dataUrl = blob => new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => nein(r.error); r.readAsDataURL(blob); });
  const warte = ms => new Promise(ok => setTimeout(ok, ms));

  const ART = {
    pdf: { t: 'PDF für die Druckerei', schritte: ['Schriften einbetten', 'Fotos in Druckqualität setzen', '3 mm Beschnitt anlegen', 'PDF zusammenstellen'], satz: 'Endformat mit 3 mm Beschnitt, Schriften eingebettet, Fotos bis 300 dpi.', endung: 'pdf' },
    marken: { t: 'PDF mit Schnittmarken', schritte: ['Schriften einbetten', 'Fotos in Druckqualität setzen', 'Schnittmarken setzen', 'PDF zusammenstellen'], satz: 'Für die Hausdruckerei oder den Copyshop: mit Schnittmarken und 3 mm Beschnitt.', endung: 'pdf' },
    png: { t: 'Bild dieser Seite', schritte: ['Seite rechnen', 'Bild in voller Schärfe ablegen'], satz: 'PNG zum Verschicken oder für den Feed.', endung: 'png' },
    zip: { t: 'Alle Bilder des Karussells', schritte: ['Bilder rechnen', 'Bildtext beilegen', 'ZIP-Datei packen'], satz: 'Nummerierte Bilder 1080 auf 1350, dazu der Bildtext.', endung: 'zip' },
    json: { t: 'Arbeitsdatei', schritte: ['Seiten und Texte sammeln', 'Arbeitsdatei schreiben'], satz: 'Zum späteren Weiterbearbeiten, auch auf einem anderen Rechner.', endung: 'json' },
  };

  function karte(innen) {
    let d = document.getElementById('vfDialog');
    if (!d) {
      d = document.createElement('div'); d.id = 'vfDialog'; d.className = 'dialog vf';
      d.innerHTML = '<div class="dialog__karte vf__karte" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(d);
      d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-vf-zu]')) d.hidden = true; });
      addEventListener('keydown', e => { if (e.key === 'Escape') d.hidden = true; });
    }
    d.querySelector('.vf__karte').innerHTML = innen; d.hidden = false;
    return d;
  }

  async function ausgabe(art, k) {
    const a = ART[art] || ART.pdf, doc = k.doc, M = k.M;
    if (!doc || !M) return;
    const f = DS.FORMATE[doc.formatKey] || {}, name = (k.name || 'drucksache') + '.' + a.endung;
    const seiten = art === 'png' ? [k.seite || 0] : doc.seiten.map((s, i) => i);
    const d = karte(`<h2>${esc(a.t)}</h2><p class="leise">${esc(doc.name || '')} · ${esc(f.name || '')} · ${f.b || ''} × ${f.h || ''} mm</p>
      <ol class="vf__schritte">${a.schritte.map(s => `<li><i></i><span>${esc(s)}</span></li>`).join('')}</ol>
      <div class="vf__seiten"></div><div class="vf__fuss"></div>`);
    const li = [...d.querySelectorAll('.vf__schritte li')], box = d.querySelector('.vf__seiten');
    for (let n = 0; n < li.length; n++) {
      li[n].classList.add('jetzt');
      if (n === 0 && art !== 'json') {
        for (const i of seiten.slice(0, 4)) {
          try {
            const px = Math.round(Math.min(900, (f.b || 148) * 4));
            const url = await dataUrl(await DS.png(M, doc, i, px));
            const fig = document.createElement('figure'); fig.className = 'vf__seite' + (art === 'marken' ? ' vf__seite--marken' : '');
            fig.innerHTML = `<img src="${url}" alt="Seite ${i + 1}"><figcaption>Seite ${i + 1}</figcaption>`; box.appendChild(fig);
          } catch (e) { console.warn('Vorschau', e); }
        }
      } else await warte(520);
      li[n].classList.remove('jetzt'); li[n].classList.add('fertig');
    }
    d.querySelector('.vf__fuss').innerHTML = `<p class="vf__datei"><b>${esc(name)}</b><small>${esc(a.satz)}${art === 'pdf' || art === 'marken' ? ` ${doc.seiten.length} ${doc.seiten.length === 1 ? 'Seite' : 'Seiten'}.` : ''}</small></p>
      <p class="leise">In der Vorführung entsteht keine Datei. So sähe sie aus.</p>
      <div class="dialog__knoepfe"><button class="kn" data-vf-zu><span>Zurück zum Blatt</span><i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button></div>`;
    if (window.DEMO) DEMO.hinweis(art === 'json' ? 'Vorführung: Die Arbeitsdatei entsteht nicht. Ihre Änderungen leben nur in diesem Fenster.' : 'Vorführung: Es entsteht keine Datei. Die Vorschau zeigt, wie sie aussähe.');
    if (k.melde) k.melde(a.t + ': in der Vorführung nur als Vorschau.');
  }


  /* ---------- Sprungadressen für das Atelier (index.html#<zustand>) ----------
     #start · #events · #abend · #motive · #abteilungen · #hinweise · #newsletter · #meine · #freigegeben · #neu · #fotos · #marke
     #livre (Das Markenbuch) · #logo (Editor mit der Leiste «Logo & Farben») · #fuehrung (Führung, Schritt 2 mit Bildfolge) · #demo (Demo mit Kapiteln)
     #editor (Menükarte der Woche im Editor) · #speichern (dazu das Menü «Druckfertig speichern») · #feed (Beitrag mit Handy-Vorschau) · #pdf (Speichern als PDF, Vorschau) · #entwuerfe (fünf Entwürfe) */
  const ANSICHTEN = ['start', 'events', 'abend', 'motive', 'abteilungen', 'hinweise', 'newsletter', 'meine', 'freigegeben', 'neu', 'fotos', 'marke', 'livre'];
  const vorlage = (art, n) => ((window.DS_DATEIEN || {})['haeuser/ihrhaus/vorlagen/' + art + '.json'] || { vorlagen: [] }).vorlagen.slice(0, n || 1);
  function oeffne(name, fmt, liste) {
    const d = DS.dokument(DS.M, { name, format: fmt, seiten: liste.map(v => ({ vorlage: v.vorlage, ton: v.ton, inhalt: JSON.parse(JSON.stringify(v.inhalt)), stil: v.stil })) });
    DSStudio.oeffne(d); if (DSStart.offen()) DSStart.zu();
    return d;
  }
  /* Für Bilder im Atelier: Ein- und Ausblenden der Fenster sofort zu Ende führen, damit die Sprungadresse den fertigen Zustand zeigt */
  function fertig(ms) {
    setTimeout(() => {
      document.querySelectorAll('.hs').forEach(e => e.classList.add('an'));
      void document.body.offsetWidth;
      (document.getAnimations ? document.getAnimations() : []).forEach(a => { try { if (a.effect && a.effect.getTiming().iterations !== Infinity) a.finish(); } catch (e) { } });
    }, ms);
  }
  function zustand() {
    const h = decodeURIComponent(location.hash.slice(1)); if (!h || !window.DSStudio || !window.DSStart) return;
    if (window.DSHilfe && DSHilfe.zu) DSHilfe.zu();   // die Begrüssung steht einer Sprungadresse nicht im Weg
    if (ANSICHTEN.includes(h)) {
      if (!DSStart.offen()) DSStart.zeige();
      setTimeout(() => { const b = document.querySelector('#msNav [data-ansicht="' + h + '"]') || document.querySelector('[data-ansicht="' + h + '"]'); if (b) b.click(); const m = document.querySelector('.ms-haupt'); if (m) m.scrollTo(0, 0); fertig(120); }, 60);
      return;
    }
    if (h === 'editor' || h === 'speichern') { const v = vorlage('menuekarte'); if (v.length) oeffne(v[0].titel, 'dlh', v); fertig(h === 'speichern' ? 800 : 200); if (h === 'speichern') setTimeout(() => { const b = document.getElementById('btnSpeichern'); if (b) b.click(); }, 600); return; }
    if (h === 'logo') { const v = vorlage('menuekarte'); if (v.length) { oeffne(v[0].titel, 'dlh', v); setTimeout(() => { if (window.DSLivre) DSLivre.fachAuf(); fertig(60); }, 250); } return; }
    if (h === 'fuehrung') { if (DSStart.offen()) DSStart.zu(); setTimeout(() => { DSHilfe.starte(1); fertig(60); }, 50); return; }
    if (h === 'demo') { setTimeout(() => { DSHilfe.video(); fertig(150); }, 50); return; }
    if (h === 'feed') { const v = vorlage('instagram', 4); if (v.length) { oeffne('Feed · Maloja', 'insta', v); setTimeout(() => window.DSIg && DSIg.vorschau(), 700); } return; }
    if (h === 'pdf') { const v = vorlage('gutschein'); if (v.length) { const d = oeffne(v[0].titel, 'dlq', [v[0], { vorlage: v[0].rueck.vorlage, ton: v[0].ton, inhalt: v[0].rueck.inhalt }]); setTimeout(() => ausgabe('pdf', { M: DS.M, doc: d, seite: 0, name: 'gutschein-tafel-dlq' }), 600); } return; }
    if (h === 'entwuerfe') {
      if (!DSStart.offen()) DSStart.zeige();
      setTimeout(() => { const f = document.getElementById('startFrei'), b = document.querySelector('[data-st="frei"]'); if (f && b) { f.value = 'Untersetzer für die Bar mit dem Chasselas'; b.click(); } }, 120);
    }
  }
  const los = () => setTimeout(zustand, 300);
  if (window.DSStudio) los(); else document.addEventListener('ds:bereit', los, { once: true });
  addEventListener('hashchange', zustand);
  if (new URLSearchParams(location.search).get('hilfe')) document.addEventListener('ds:bereit', () => fertig(400), { once: true });

  /* Vorgeschriebene Texte (Bildtext) erscheinen, als würden sie gerade geschrieben: Wort für Wort in das Feld, die Handy-Vorschau läuft mit */
  function tippen(feld, text, jedes) {
    const worte = String(text).split(/(\s+)/), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !feld) { if (feld) feld.value = text; if (jedes) jedes(text); return Promise.resolve(); }
    let i = 0, jetzt = '';
    feld.value = '';
    return new Promise(ok => {
      (function weiter() {
        if (!feld.isConnected) return ok();
        const n = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n && i < worte.length; k++) jetzt += worte[i++];
        feld.value = jetzt; feld.scrollTop = feld.scrollHeight; if (jedes) jedes(jetzt);
        if (i < worte.length) setTimeout(weiter, 45 + Math.random() * 55); else ok();
      })();
    });
  }
  window.DS_VORF = { ausgabe, dataUrl, zustand, tippen };
})();
