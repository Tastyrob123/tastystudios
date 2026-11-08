/* Anfrage-Fenster des Berghotel Gasterntal (Robert 17.10.2026: «auf der kompletten Seite einstellen, dass ich in keinem E-Mail-Fenster lande, wo ich selber
   E-Mails abschicken muss, sondern dass ich immer in solchen Interfaces lande, wo ich selber Abfragen schicken kann, von der Website aus direkt … wirklich in allen Seiten»).
   Übernommen vom Waldhotel Doldenhorn (dort assets/js/anfrage.js, 16.10.2026), Kleid dieses Hauses.
   - Jeder Verweis auf die Mail-Adresse des Hauses öffnet dieses Fenster statt des Mailprogramms (Adresse, Betreff und Text aus dem Verweis), auf allen Seiten.
   - Die Formulare der Seite (Zimmer, Tisch und Sauna, Exklusiv, Vor der Anreise, Sauna, Picknick, Fahrt hinunter) rufen window.BGAnfrage.oeffne({an, betreff, text}).
   - «Anfrage senden» legt die Anfrage per POST /api/anfragen im Speicher des Hauses ab (online: api/anfragen.js mit dem Blob-Speicher, lokal: studio.py → _dienste/anfragen.jsonl).
   Fenster mit show() und eigenem Hintergrund; Auftritt nur über transform, das Blatt ist ab dem ersten Bild deckend. Stil: assets/css/anfrage.css. */
(function () {
  if (window.BGAnfrage) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var HAUS = 'gasterntal@doldenhorn.ch', TEL = '033 675 81 81', TEL_H = '+41336758181';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var PFEIL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
  var zeichen = function () { var z = $('.fuss__z') || $('.leiste svg'); if (!z) return ''; var k = z.cloneNode(true); k.setAttribute('class', 'anf__zeichen'); return k.outerHTML; };

  var hinter, dlg, f, E, eingabe, danke, meldung, senden, an = HAUS, vorher = null;
  function baue() {
    hinter = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'anf__hinter', hidden: true }));
    dlg = document.body.appendChild(document.createElement('dialog'));
    dlg.className = 'anf'; dlg.setAttribute('aria-labelledby', 'anf-titel');
    dlg.innerHTML = '<div class="anf__blatt">' +
      '<button class="anf__zu" type="button" aria-label="Schliessen"><span></span><span></span></button>' +
      '<header class="anf__kopf">' + zeichen() + '<p class="anf__kl">Anfrage ans Haus</p><h2 class="anf__titel" id="anf-titel" data-titel></h2><span class="anf__linie" aria-hidden="true"></span></header>' +
      '<form class="anf__form" data-seite="eingabe" novalidate>' +
        '<label class="anf__feld anf__feld--ganz"><span>Ihr Anliegen</span><input name="anliegen" maxlength="160"></label>' +
        '<label class="anf__feld"><span>Wunschdatum</span><input type="date" name="tag"></label>' +
        '<label class="anf__feld"><span>Personen</span><input type="number" name="personen" min="1" max="500" inputmode="numeric"></label>' +
        '<label class="anf__feld anf__feld--ganz"><span>Ihre Nachricht</span><textarea name="nachricht" rows="5" maxlength="4000"></textarea></label>' +
        '<label class="anf__feld"><span>Ihr Name</span><input name="name" autocomplete="name" maxlength="120"></label>' +
        '<label class="anf__feld"><span>E-Mail oder Telefon</span><input name="kontakt" autocomplete="email" maxlength="160"></label>' +
        '<input class="anf__honig" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="anf__meldung" role="alert" hidden></p>' +
        '<div class="anf__fuss"><button class="kn kn--dunkel" type="submit">Anfrage senden<i>' + PFEIL + '</i></button>' +
        '<p class="anf__klein">Vorschau von Tasty Studios: Ihre Anfrage landet im Eingang des Gastgebers, dem Werkzeug fürs Team, und geht nicht an das Berghotel Gasterntal.</p></div>' +
      '</form>' +
      '<div class="anf__danke" data-seite="danke" hidden><p class="anf__dank" data-danke></p><p class="anf__dank-satz">So sieht die Bestätigung aus. Ihre Anfrage liegt jetzt im Eingang des Gastgebers; in dieser Vorschau geht sie nicht an das Haus.</p>' +
        '<dl class="anf__zettel" data-zettel></dl><div class="anf__fuss anf__fuss--mitte"><button class="kn" type="button" data-zu>Schliessen<i>' + PFEIL + '</i></button></div></div>' +
      '</div>';
    f = $('form', dlg); E = f.elements; eingabe = f; danke = $('[data-seite=danke]', dlg); meldung = $('.anf__meldung', dlg); senden = $('button[type=submit]', f);
    E.tag.min = iso(new Date());
    hinter.addEventListener('click', zu); $('.anf__zu', dlg).addEventListener('click', zu); $('[data-zu]', dlg).addEventListener('click', zu);
    dlg.addEventListener('close', function () {
      if (dlg.open) return;   // gleich wieder geöffnet: das späte close-Ereignis darf den Hintergrund nicht verstecken
      hinter.hidden = true; document.documentElement.classList.remove('anf-offen'); document.removeEventListener('keydown', taste);
      if (vorher && vorher.focus) vorher.focus({ preventScroll: true });
    });
    f.addEventListener('submit', schicke);
  }
  var taste = function (e) { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); zu(); } };
  function zu() { if (dlg && dlg.open) dlg.close(); }

  /* o = {an, betreff, text, tag, personen}: Fenster öffnen, vorbelegt. Jedes andere offene Fenster der Seite schliesst, die Anfrage steht vorn. */
  function oeffne(o) {
    o = o || {}; if (!dlg) baue();
    [].forEach.call(document.querySelectorAll('dialog[open]'), function (d) { if (d !== dlg) d.close(); });
    an = HAUS;
    var text = String(o.text || '').trim(), name = (text.match(/^(?:Name|Ihr Name): *(.+)$/m) || [])[1] || '';
    var betreff = String(o.betreff || '').replace(/,? *(im|ans?) (dem )?Berghotel Gasterntal$/i, '').trim();
    $('[data-titel]', dlg).textContent = betreff || 'Ihre Anfrage';
    E.anliegen.value = o.betreff || 'Ihre Anfrage';
    E.nachricht.value = text; if (name && !E.name.value) E.name.value = name.trim();
    E.tag.value = /^\d{4}-\d{2}-\d{2}$/.test(o.tag || '') ? o.tag : ''; E.personen.value = +o.personen > 0 ? String(+o.personen) : '';
    eingabe.hidden = false; danke.hidden = true; meldung.hidden = true;
    [].forEach.call(dlg.querySelectorAll('.falsch'), function (x) { x.classList.remove('falsch'); });
    vorher = document.activeElement; hinter.hidden = false; dlg.show(); dlg.scrollTop = 0;
    document.documentElement.classList.add('anf-offen'); document.addEventListener('keydown', taste);
    setTimeout(function () { (E.name.value ? E.kontakt : E.name).focus({ preventScroll: true }); }, 80);
  }

  function schicke(e) {
    e.preventDefault();
    var name = E.name.value.trim(), kontakt = E.kontakt.value.trim();
    E.name.parentNode.classList.toggle('falsch', !name); E.kontakt.parentNode.classList.toggle('falsch', !kontakt);
    if (!name || !kontakt) { meldung.textContent = 'Bitte Ihren Namen und eine E-Mail-Adresse oder Telefonnummer angeben, damit das Haus Ihnen antworten kann.'; meldung.hidden = false; (name ? E.kontakt : E.name).focus(); return; }
    var t = E.tag.value ? new Date(E.tag.value + 'T12:00') : null, datum = t && !isNaN(t) ? t.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
    senden.disabled = true; var knText = senden.firstChild.nodeValue; senden.firstChild.nodeValue = 'Wird gesendet'; meldung.hidden = true;
    fetch('/api/anfragen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ an: an, anliegen: E.anliegen.value.trim(), datum: datum, personen: E.personen.value, nachricht: E.nachricht.value.trim(),
        name: name, kontakt: kontakt, seite: location.pathname, sprache: (document.documentElement.lang || 'de').slice(0, 2), website: E.website.value })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok || !d.ok) throw new Error(d.fehler || r.status); return d; }); })
      .then(function () {
        $('[data-danke]', dlg).textContent = 'Vielen Dank, ' + name.split(' ')[0] + '.';
        $('[data-zettel]', dlg).innerHTML = [['Anliegen', E.anliegen.value.trim()], ['Datum', datum], ['Personen', E.personen.value], ['Antwort an', kontakt]]
          .filter(function (z) { return z[1]; }).map(function (z) { return '<div><dt>' + esc(z[0]) + '</dt><dd>' + esc(z[1]) + '</dd></div>'; }).join('');
        eingabe.hidden = true; danke.hidden = false; dlg.scrollTop = 0; f.reset();
      })
      .catch(function () { meldung.innerHTML = 'Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder rufen Sie das Haus an: <a href="tel:' + TEL_H + '">' + esc(TEL) + '</a>'; meldung.hidden = false; })
      .then(function () { senden.disabled = false; senden.firstChild.nodeValue = knText; });
  }

  /* Jeder Verweis auf die Mail-Adresse des Hauses → Fenster, auf allen Seiten (auch Fuss und Rechtliches; die Adresse bleibt als Text sichtbar) */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]'); if (!a) return;
    var h = a.getAttribute('href').slice(7), adr = decodeURIComponent(h.split('?')[0]), q = h.split('?')[1] || '', p = {};
    q.split('&').forEach(function (x) { var i = x.indexOf('='); if (i > 0) { try { p[x.slice(0, i).toLowerCase()] = decodeURIComponent(x.slice(i + 1).replace(/\+/g, ' ')); } catch (y) {} } });
    if (adr.toLowerCase() !== HAUS) return;
    e.preventDefault(); oeffne({ an: adr, betreff: p.subject || '', text: p.body || '' });
  }, true);

  /* Für die Formulare der Seite: statt location.href = 'mailto:…' */
  window.BGAnfrage = { oeffne: oeffne };
  window.bgSchreibe = function (betreff, zeilen, tag, personen) {
    var text = (zeilen || []).join('\n');
    if (window.BGAnfrage) return oeffne({ an: HAUS, betreff: betreff, text: text, tag: tag, personen: personen });
    location.href = 'mailto:' + HAUS + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent('Guten Tag\n\n' + text + '\n\nFreundliche Grüsse\n');
  };
})();
