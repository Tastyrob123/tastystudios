/* Stellen und Bewerbung im Fenster, Landgasthof Ruedihus (Robert 17.10.2026: «die Stellenanzeigen, die auf den Seiten sind, die schreiben wir schon für die vor.
   Das heisst, wenn man da draufklickt, dann öffnet sich kein Mail-Programm, sondern es öffnet sich die Stellenanzeige in so einem Fenster, was zentriert ist»).
   Übernommen vom Waldhotel Doldenhorn (assets/js/anfrage.js), Kleid aus dem Ruedihus (assets/css/anfrage.css).
   - Ein Klick auf eine offene Stelle ([data-stelle]) öffnet ihre Ausschreibung aus <template id="stelle-N"> (bau.py stellen_vorlagen, Texte daten.py STELLEN_TEXT).
   - «Jetzt bewerben» und jeder Verweis auf jobs@doldenhorn.ch öffnen das Bewerbungs-Fenster; «Bewerbung senden» legt sie per POST /api/anfragen ab
     (online: api/anfragen.js mit dem Blob-Speicher des Hauses, lokal: studio.py → _dienste/anfragen.jsonl). Nie das Mailprogramm.
   Fenster mit show() und eigenem Hintergrund; Auftritt nur über transform, das Blatt ist ab dem ersten Bild deckend. */
(function () {
  if (window.RHAnfrage) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var JOBS = 'jobs@doldenhorn.ch', TEL = '(+41) 033 675 81 81', TEL_ROH = '+41336758181';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var zeichen = function () {
    var u = document.querySelector('svg use[href="#zeichen"]'), vb = u && u.closest('svg').getAttribute('viewBox');
    return vb ? '<svg class="anf__zeichen" viewBox="' + vb + '" aria-hidden="true" fill="currentColor"><use href="#zeichen"/></svg>' : '';
  };
  var offen = function (an) { document.documentElement.classList.toggle('anf-offen', an); };

  /* ---------- Bewerbungs-Fenster ---------- */
  var hinter, dlg, f, E, danke, meldung, senden, vorher = null;
  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'anf__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'anf'; dlg.setAttribute('aria-labelledby', 'anf-titel');
    dlg.innerHTML = '<div class="anf__blatt">' +
      '<button class="anf__zu" type="button" aria-label="Schliessen"><span></span><span></span></button>' +
      '<header class="anf__kopf">' + zeichen() + '<p class="anf__kl">Bewerbung · Ruedihus &amp; Doldenhorn</p><h2 class="anf__titel" id="anf-titel" data-titel></h2><span class="anf__linie" aria-hidden="true"></span></header>' +
      '<form class="anf__form" novalidate>' +
        '<label class="anf__feld anf__feld--ganz"><span>Stelle</span><input name="anliegen" maxlength="160"></label>' +
        '<label class="anf__feld anf__feld--ganz"><span>Ein paar Zeilen zu dir</span><textarea name="nachricht" rows="5" maxlength="4000"></textarea></label>' +
        '<label class="anf__feld"><span>Dein Name</span><input name="name" autocomplete="name" maxlength="120"></label>' +
        '<label class="anf__feld"><span>E-Mail oder Telefon</span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
        '<input class="anf__honig" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="anf__meldung" role="alert" hidden></p>' +
        '<div class="anf__fuss"><button class="kn kn--dunkel" type="submit">Bewerbung senden<i>' + PFEIL + '</i></button>' +
        '<p class="anf__klein">Entwurf von Tasty Studios: Die Bewerbung geht nicht an das Haus, sie wird nur zur Ansicht gesammelt.</p></div>' +
      '</form>' +
      '<div class="anf__danke" hidden><p class="anf__dank" data-danke></p><p class="anf__dank-satz">So sieht die Bestätigung aus. Im Entwurf geht die Bewerbung nicht an das Haus.</p>' +
        '<dl class="anf__zettel" data-zettel></dl><div class="anf__fuss anf__fuss--mitte"><button class="kn" type="button" data-zu>Schliessen<i>' + PFEIL + '</i></button></div></div>' +
      '</div>';
    f = $('form', dlg); E = f.elements; danke = $('.anf__danke', dlg); meldung = $('.anf__meldung', dlg); senden = $('button[type=submit]', f);
    var zu = function () { if (dlg.open) dlg.close(); };
    hinter.addEventListener('click', zu); $('.anf__zu', dlg).addEventListener('click', zu); $('[data-zu]', dlg).addEventListener('click', zu);
    dlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } });
    dlg.addEventListener('close', function () { hinter.hidden = true; offen(false); if (vorher && vorher.focus) vorher.focus({ preventScroll: true }); });
    f.addEventListener('submit', schicke);
  }
  function oeffne(o) {
    o = o || {}; if (!dlg) baue();
    [].forEach.call(document.querySelectorAll('dialog[open]'), function (d) { if (d !== dlg) d.close(); });
    var betreff = String(o.betreff || 'Bewerbung').trim();
    $('[data-titel]', dlg).textContent = betreff.replace(/^Bewerbung als /, '') === betreff ? 'Deine Bewerbung.' : betreff.replace(/^Bewerbung als /, '');
    E.anliegen.value = betreff; E.nachricht.value = String(o.text || '').trim();
    f.hidden = false; danke.hidden = true; meldung.hidden = true;
    [].forEach.call(dlg.querySelectorAll('.falsch'), function (x) { x.classList.remove('falsch'); });
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0; offen(true);
    setTimeout(function () { (E.name.value ? E.kontakt : E.name).focus({ preventScroll: true }); }, 80);
  }
  function schicke(e) {
    e.preventDefault();
    var name = E.name.value.trim(), kontakt = E.kontakt.value.trim();
    E.name.parentNode.classList.toggle('falsch', !name); E.kontakt.parentNode.classList.toggle('falsch', !kontakt);
    if (!name || !kontakt) { meldung.textContent = 'Bitte deinen Namen und eine E-Mail-Adresse oder Telefonnummer angeben, damit wir dir antworten können.'; meldung.hidden = false; (name ? E.kontakt : E.name).focus(); return; }
    senden.disabled = true; var alt = senden.firstChild.nodeValue; senden.firstChild.nodeValue = 'Wird gesendet'; meldung.hidden = true;
    fetch('/api/anfragen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ an: JOBS, anliegen: E.anliegen.value.trim(), datum: '', personen: '', nachricht: E.nachricht.value.trim(), name: name, kontakt: kontakt,
        seite: location.pathname, sprache: (document.documentElement.lang || 'de').slice(0, 2), website: E.website.value })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.ok) throw new Error(d.fehler || r.status); }); })
      .then(function () {
        $('[data-danke]', dlg).textContent = 'Vielen Dank, ' + name.split(' ')[0] + '.';
        $('[data-zettel]', dlg).innerHTML = [['Stelle', E.anliegen.value.trim()], ['Antwort an', kontakt]].filter(function (z) { return z[1]; })
          .map(function (z) { return '<div><dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd></div>'; }).join('');
        f.hidden = true; danke.hidden = false; dlg.scrollTop = 0; f.reset();
        try { if (window.rhZaehle) window.rhZaehle('formular', { f: 'bewerbung' }); } catch (x) {}
      })
      .catch(function () { meldung.innerHTML = 'Das hat gerade nicht geklappt. Bitte versuche es noch einmal oder ruf uns an: <a href="tel:' + TEL_ROH + '">' + esc(TEL) + '</a>'; meldung.hidden = false; })
      .then(function () { senden.disabled = false; senden.firstChild.nodeValue = alt; });
  }
  /* Verweise auf jobs@ öffnen das Bewerbungs-Fenster (die Karten der Stellen öffnen zuerst ihre Ausschreibung, siehe unten) */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]'); if (!a || a.hasAttribute('data-stelle')) return;
    var h = a.getAttribute('href').slice(7), adr = decodeURIComponent(h.split('?')[0]).toLowerCase(), m = /(?:^|&)subject=([^&]*)/i.exec(h.split('?')[1] || '');
    if (adr !== JOBS) return;
    e.preventDefault(); oeffne({ betreff: m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '' });
  }, true);
  /* «Spontan bewerben» (data-bewerbung, ohne mailto, Werkbank-Chat 17.10.2026): öffnet dasselbe Bewerbungs-Fenster */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('[data-bewerbung]'); if (!a) return;
    e.preventDefault(); oeffne({ betreff: 'Spontanbewerbung' });
  }, true);
  window.RHAnfrage = { oeffne: oeffne };

  /* ---------- Ausschreibung einer offenen Stelle ---------- */
  var sHinter, sDlg, inhalt, titel, aktuell = '', sVorher = null;
  function baueStelle() {
    sHinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'anf__hinter', hidden: true }));
    sDlg = document.body.appendChild(document.createElement('dialog'));
    sDlg.className = 'anf anf--stelle'; sDlg.setAttribute('aria-labelledby', 'stb-titel');
    sDlg.innerHTML = '<div class="anf__blatt"><button class="anf__zu" type="button" aria-label="Schliessen"><span></span><span></span></button>' +
      '<header class="anf__kopf">' + zeichen() + '<p class="anf__kl">Offene Stelle · Landgasthof Ruedihus</p><h2 class="anf__titel" id="stb-titel"></h2><span class="anf__linie" aria-hidden="true"></span></header>' +
      '<div class="stb"></div><div class="anf__fuss anf__fuss--mitte"><button class="kn kn--dunkel" type="button" data-bewerben>Jetzt bewerben<i>' + PFEIL + '</i></button></div></div>';
    inhalt = $('.stb', sDlg); titel = $('#stb-titel', sDlg);
    var zu = function () { if (sDlg.open) sDlg.close(); };
    sHinter.addEventListener('click', zu); $('.anf__zu', sDlg).addEventListener('click', zu);
    sDlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); zu(); } });
    sDlg.addEventListener('close', function () { sHinter.hidden = true; if (!dlg || !dlg.open) offen(false); if (sVorher && sVorher.focus && (!dlg || !dlg.open)) sVorher.focus({ preventScroll: true }); });
    $('[data-bewerben]', sDlg).addEventListener('click', function () { vorher = sVorher; sDlg.close(); oeffne({ betreff: 'Bewerbung als ' + aktuell }); });
  }
  document.addEventListener('click', function (e) {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('[data-stelle]'); if (!a) return;
    var t = document.getElementById('stelle-' + a.getAttribute('data-stelle')); if (!t) return;
    e.preventDefault(); e.stopPropagation(); if (!sDlg) baueStelle();
    aktuell = t.getAttribute('data-titel') || ''; titel.textContent = aktuell;
    inhalt.innerHTML = ''; inhalt.appendChild(t.content.cloneNode(true));
    sVorher = document.activeElement; sHinter.hidden = false; sDlg.show(); sDlg.scrollTop = 0; offen(true);
    setTimeout(function () { $('.anf__zu', sDlg).focus({ preventScroll: true }); }, 60);
  }, true);
})();
