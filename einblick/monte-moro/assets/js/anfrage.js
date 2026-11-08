/* Hotel Monte-Moro · Anfrage-Fenster (Regel «Anfragen im Fenster, nie mailto»; Bauart Waldhotel Doldenhorn, assets/js/anfrage.js).
   Jeder Verweis mit data-anfrage (und jeder mailto-Verweis auf die Adresse des Hauses) öffnet dieses Fenster auf der Seite statt des Mailprogramms.
   «Anfrage senden» legt die Anfrage per POST /api/anfragen im Eingang dieser Vorschau ab (lokal: serve.py → _dienste/anfragen.jsonl).
   Designstudie: nichts geht an das Haus; das Fenster sagt es sichtbar. Ohne Skript bleibt der mailto-Verweis als Rückfall. */
(function () {
  'use strict';
  var D = document, dlg, form, danke, titel, meldung, art = '';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function baue() {
    dlg = D.body.appendChild(D.createElement('dialog'));
    dlg.className = 'anf'; dlg.setAttribute('aria-labelledby', 'anf-titel');
    dlg.innerHTML = '<div class="anf__blatt"><button class="anf__zu" type="button" aria-label="Schliessen">×</button>' +
      '<p class="ueber">Hotel Monte-Moro · Anfrage</p><p class="anf__titel" id="anf-titel"></p>' +
      '<form class="anf__form" novalidate><div class="anf__felder">' +
        '<label data-tisch><span>Tag</span><input type="date" name="tag"></label>' +
        '<label data-tisch><span>Uhrzeit</span><input type="time" name="zeit"></label>' +
        '<label data-tisch class="ganz"><span>Personen</span><input type="number" name="personen" min="1" max="40" value="2" inputmode="numeric"></label>' +
        '<label class="ganz"><span>Ihre Nachricht</span><textarea name="nachricht" rows="4" maxlength="4000"></textarea></label>' +
        '<label><span>Ihr Name</span><input name="name" autocomplete="name" maxlength="120" required></label>' +
        '<label><span>E-Mail oder Telefon</span><input name="kontakt" autocomplete="email" maxlength="160" required></label>' +
      '</div><input class="anf__honig" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<p class="anf__hinweis">Designstudie von Tasty Studios: Ihre Anfrage landet im Eingang dieser Vorschau und geht nicht an das Hotel Monte-Moro. Direkt erreichen Sie das Haus unter <a href="tel:+41279571012">+41 27 957 10 12</a>. Wie das Haus mit Ihren Angaben umgeht: <a href="datenschutz.html">Datenschutz</a>.</p>' +
      '<p class="anf__meldung" role="alert" hidden></p>' +
      '<button class="kn kn--laerche" type="submit"><span>Anfrage senden</span><i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg></i></button></form>' +
      '<div class="anf__danke" hidden><p class="anf__titel">Danke.</p><p>Ihre Anfrage liegt im Eingang dieser Vorschau. Im echten Betrieb antwortet die Rezeption des Hotel Monte-Moro.</p><button class="kn kn--linie" type="button" data-anf-zu><span>Schliessen</span><i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg></i></button></div></div>';
    form = dlg.querySelector('form'); danke = dlg.querySelector('.anf__danke'); titel = dlg.querySelector('#anf-titel'); meldung = dlg.querySelector('.anf__meldung');
    dlg.querySelector('.anf__zu').addEventListener('click', zu); danke.querySelector('[data-anf-zu]').addEventListener('click', zu);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) zu(); });
    form.addEventListener('submit', sende);
  }
  function zu() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  function oeffne(betreff, a) {
    if (!dlg) baue();
    art = a || ''; titel.textContent = betreff || 'Ihre Anfrage';
    [].forEach.call(dlg.querySelectorAll('[data-tisch]'), function (l) { l.hidden = art !== 'tisch'; });
    form.hidden = false; danke.hidden = true; meldung.hidden = true; form.reset();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { var f = dlg.querySelector(art === 'tisch' ? 'input[name=tag]' : 'textarea'); if (f) f.focus(); }, 60);
  }
  function sende(e) {
    e.preventDefault();
    var f = form, name = f.name.value.trim(), kontakt = f.kontakt.value.trim();
    if (!name || !kontakt) { meldung.textContent = 'Bitte Name und E-Mail oder Telefon angeben.'; meldung.hidden = false; return; }
    if (f.website.value) return;
    var daten = { haus: 'Hotel Monte-Moro', betreff: titel.textContent, art: art, tag: f.tag.value, zeit: f.zeit.value, personen: art === 'tisch' ? f.personen.value : '', nachricht: f.nachricht.value, name: name, kontakt: kontakt, seite: location.pathname, zeitpunkt: new Date().toISOString() };
    var fertig = function () { form.hidden = true; danke.hidden = false; };
    /* der Eingang läuft nur auf dem eigenen Vorschau-Server (serve.py, Port 8947); auf der Karte der Kette wird nichts abgelegt */
    if (location.port !== '8947') { fertig(); return; }
    try { fetch('/api/anfragen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) }).then(fertig, fertig); } catch (x) { fertig(); }
  }
  D.addEventListener('click', function (e) {
    var a = e.target.closest('[data-anfrage], a[href^="mailto:info@monte-moro.ch"]'); if (!a) return;
    e.preventDefault(); oeffne(a.getAttribute('data-anfrage') || 'Ihre Anfrage', a.getAttribute('data-art'));
  });
  window.MMAnfrage = { oeffne: oeffne, esc: esc };
})();
