/* Anfrage-Fenster des Landgasthof Ruedihus (Baustein für die Website, Master Werkzeug-Bau E12, Bau 17.10.2026).
   Eingebaut vom Werkbank-Chat 17.10.2026 als assets/js/formular.js + assets/css/formular.css (Quelle _werkzeuge/reception/baustein/anfrage.*):
   Vorsatz «afr» statt «anf», weil assets/js/anfrage.js (Stellen und Bewerbung im Fenster, live seit 17.10. 18:15) die Klassen «anf» schon trägt.
   Dazu öffnet jeder Verweis auf #anfrage (die Mail-Adresse im Fuss und im Menü) das Fenster für eine Nachricht an die Rezeption.
   Die Formulare der Website (Tisch in der Stube, Fest-Rechner, Vor Ihrer Anreise, Ihre Abreise) öffneten bisher das Mailprogramm. Mit diesem Baustein
   geht jede Anfrage direkt in den Eingang des Gastgebers (La Réception): Name und E-Mail oder Telefon im Fenster, «Senden», fertig. Nie mailto.
   Ausserdem öffnet jeder Knopf mit data-anfrage (z. B. data-anfrage="gutschein") das Fenster für eine freie Anfrage.

   Einbinden (macht der Werkbank-Chat über bau.py, nicht von Hand): nach dienste.js und seiten.js
     <link rel="stylesheet" href="assets/css/formular.css?v={V}">
     <script src="assets/js/formular.js?v={V}" defer></script>
   Ziel der Anfragen: /_werkzeuge/reception/api/formular (lokal der Server des Gastgebers, online die Umleitung aus online.json);
   anders mit <script … data-api="/pfad"> oder window.RH_ANFRAGE_API.
   Fängt das Abschicken der Formulare im Fang-Durchlauf ab (vor dienste.js), ändert an deren Dateien nichts. Bewegung nur über opacity und transform. */
(function () {
  'use strict';
  var skript = document.currentScript;
  var API = window.RH_ANFRAGE_API || (skript && skript.getAttribute('data-api')) || '/_werkzeuge/reception/api/formular';
  var TEL = '(+41) 033 675 81 81', TEL_L = 'tel:+41336758181';
  var INFO = 'info@doldenhorn.ch', EVENT = 'event@doldenhorn.ch', JOBS = 'jobs@doldenhorn.ch';
  var SPRACHE = (document.documentElement.lang || 'de').slice(0, 2);
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var PFEIL = '<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg></i>';
  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var datumLang = function (v) { if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return v || ''; var d = new Date(v + 'T12:00'); return TAGE[d.getDay()] + ', ' + d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }); };
  var wert = function (f, n) { var e = f.elements[n]; return e ? String(e.value || '').trim() : ''; };
  var text = function (e) { return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
  var seiteName = function () { var t = (document.title || '').split(' · ')[0]; return t === 'Landgasthof Ruedihus' ? 'Startseite' : t; };

  /* ---------- Was jedes Formular der Website mitschickt (gleiche Angaben wie bisher in der Mail) ---------- */
  var FORMULARE = {
    tisch: function (f) {
      var tag = wert(f, 'tag'), z = ['Stube: ' + wert(f, 'lokal'), 'Tag: ' + datumLang(tag), 'Uhrzeit: ' + wert(f, 'zeit'), 'Personen: ' + wert(f, 'pers'), 'Menü: ' + wert(f, 'menu')];
      if (wert(f, 'wunsch')) z.push('Wünsche: ' + wert(f, 'wunsch'));
      return { art: 'tisch', an: INFO, titel: 'Ein Tisch in der Stube', anliegen: 'Tisch in der ' + wert(f, 'lokal'), datum: datumLang(tag) + (wert(f, 'zeit') ? ', ' + wert(f, 'zeit') + ' Uhr' : ''), personen: wert(f, 'pers'), name: wert(f, 'name'), zeilen: z };
    },
    fest: function (f) {
      var an = wert(f, 'anlass'), erw = +wert(f, 'erw') || 0, ki = +wert(f, 'kinder') || 0, z = ['Anlass: ' + an, 'Datum: ' + (datumLang(wert(f, 'datum')) || 'noch offen'), 'Gäste: ' + (erw + ki) + (ki ? ' (davon ' + ki + ' Kinder)' : '')];
      $$('[data-zeilen] li', f).forEach(function (li) { var s = text($('span', li)), b = text($('b', li)); z.push(s && b ? s + ': CHF ' + b : text(li)); });
      var summe = text($('[data-summe]', f)), saal = text($('[data-saal]', f));
      if (saal) z.push(saal);
      if (summe) z.push('Richtpreis (erster Entwurf): CHF ' + summe);
      if (wert(f, 'wunsch')) z.push('Wünsche: ' + wert(f, 'wunsch'));
      var mail = EVENT; try { mail = JSON.parse(text($('[data-rechner-daten]', f))).mail || EVENT; } catch (e) { /* bleibt event@ */ }
      return { art: /sitzung/i.test(an) ? 'tagung' : 'feier', an: mail, titel: 'Ihr Fest im Ruedihus', anliegen: an + ' mit ' + (erw + ki) + ' Gästen', datum: datumLang(wert(f, 'datum')), personen: erw + ki, name: wert(f, 'name'), zeilen: z };
    },
    anreise: function (f) {
      var z = ['Buchungsnummer: ' + (wert(f, 'nr') || '-'), 'Anreise: ' + datumLang(wert(f, 'an')), 'Abreise: ' + datumLang(wert(f, 'ab'))];
      $$('[data-wuensche] li', f).forEach(function (li) { z.push(text(li)); });
      return { art: 'aufenthalt', an: INFO, titel: 'Vor Ihrer Anreise', anliegen: 'Wünsche vor der Anreise', datum: [datumLang(wert(f, 'an')), datumLang(wert(f, 'ab'))].filter(Boolean).join(' bis '), name: wert(f, 'name'), zeilen: z };
    },
    abreise: function (f) {
      var z = ['Zimmer oder Buchungsnummer: ' + (wert(f, 'nr') || '-')];
      $$('[data-wuensche] li', f).forEach(function (li) { z.push(text(li)); });
      var mail = f.getAttribute('data-mail'); mail = [INFO, EVENT, JOBS].indexOf(mail) >= 0 ? mail : INFO;
      return { art: 'aufenthalt', an: mail, titel: 'Ihre Abreise', anliegen: 'Nachricht zur Abreise', datum: datumLang(wert(f, 'tag')), name: wert(f, 'name'), zeilen: z };
    }
  };
  var WAHL = { 'form[data-tisch]': 'tisch', 'form[data-rechner]': 'fest', 'form[data-anreise]': 'anreise', 'form[data-abreise]': 'abreise' };

  /* ---------- Freie Anfrage über einen Knopf mit data-anfrage="zimmer|tisch|fest|gutschein|stelle|nachricht" ---------- */
  var FREI = {
    zimmer: ['Ein Zimmer', 'zimmer', INFO], tisch: ['Ein Tisch in der Stube', 'tisch', INFO], fest: ['Ein Fest im Ruedihus', 'feier', EVENT],
    gutschein: ['Ein Gutschein', 'gutschein', INFO], stelle: ['Eine Bewerbung', 'nachricht', JOBS], nachricht: ['Eine Nachricht an die Rezeption', 'nachricht', INFO]
  };

  /* ---------- Das Fenster ---------- */
  var dlg, stand = null;
  function zeichen() { var z = $('svg.zier'); return z ? z.outerHTML.replace('class="zier"', 'class="zier afr__z"') : ''; }
  function bau() {
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'afr';
    dlg.setAttribute('aria-labelledby', 'afr-t');
    dlg.innerHTML =
      '<div class="afr__in"><button class="zu rund afr__zu" type="button" aria-label="Schliessen"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg></button>' +
      '<div class="afr__kopf">' + zeichen() + '<p class="mono">An die Rezeption</p><h2 class="d3" id="afr-t">Ihre Anfrage.</h2></div>' +
      '<form class="afr__f" novalidate>' +
        '<ul class="afr__zus" aria-label="Ihre Angaben"></ul>' +
        '<div class="felder afr__frei">' +
          '<label class="feld feld--ganz"><span>Worum geht es?</span><select name="art"><option value="zimmer">Ein Zimmer</option><option value="tisch">Ein Tisch in der Stube</option><option value="fest">Ein Fest im Ruedihus</option><option value="gutschein">Ein Gutschein</option><option value="stelle">Eine Bewerbung</option><option value="nachricht">Etwas anderes</option></select></label>' +
          '<label class="feld"><span>Datum</span><input type="text" name="datum" maxlength="120" placeholder="wenn schon bekannt"></label>' +
          '<label class="feld"><span>Personen</span><input type="number" name="personen" min="1" max="60" inputmode="numeric"></label>' +
        '</div>' +
        '<div class="felder">' +
          '<label class="feld feld--ganz"><span>Ihr Name</span><input type="text" name="name" autocomplete="name" maxlength="120" required></label>' +
          '<label class="feld feld--ganz"><span>E-Mail oder Telefon</span><input type="text" name="kontakt" autocomplete="email" maxlength="160" required></label>' +
          '<label class="feld feld--ganz"><span>Ihre Nachricht</span><textarea name="nachricht" rows="2" maxlength="1200"></textarea></label>' +
          '<label class="afr__weg" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '</div>' +
        '<p class="afr__meldung" role="status" aria-live="polite"></p>' +
        '<div class="knoepfe"><button class="kn kn--dunkel afr__los" type="submit">Senden' + PFEIL + '</button></div>' +
        '<p class="buchen__klein afr__klein">Entwurf von Tasty Studios: Die Anfrage geht nicht an das Haus und an keine Adresse, sie liegt nur zur Ansicht im Gastgeber, dem Werkzeug für das Team. Lieber persönlich? <a href="' + TEL_L + '">' + TEL + '</a></p>' +
      '</form>' +
      '<div class="afr__danke" hidden>' + zeichen() + '<p class="d4 afr__dt"></p><p class="afr__dk">Lieber gleich persönlich? <a href="' + TEL_L + '">' + TEL + '</a></p><div class="knoepfe"><button class="kn afr__fertig" type="button">Schliessen' + PFEIL + '</button></div></div>' +
      '</div>';
    document.body.appendChild(dlg);
    $('.afr__zu', dlg).addEventListener('click', zu);
    $('.afr__fertig', dlg).addEventListener('click', zu);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) zu(); });   // Klick daneben schliesst
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); zu(); });
    var ta = $('textarea', dlg), wachse = function () { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 240) + 'px'; };
    ta.addEventListener('input', wachse);   // Eingabe bricht um und wächst (Robert 15.10.2026)
    $('form', dlg).addEventListener('submit', senden);
    $('select[name=art]', dlg).addEventListener('change', function (e) { if (stand && stand.frei) kopf((FREI[e.target.value] || FREI.nachricht)[2]); });
    return dlg;
  }
  function zu() { if (!dlg) return; dlg.classList.remove('offen'); if (dlg.open) dlg.close(); stand = null; }
  function oeffne(d) {
    bau(); stand = d;
    var f = $('form', dlg), frei = !!d.frei;
    f.hidden = false; $('.afr__danke', dlg).hidden = true; $('.afr__meldung', dlg).textContent = '';
    $('#afr-t', dlg).textContent = d.titel + '.';
    $('.afr__frei', dlg).hidden = !frei;
    $('.afr__zus', dlg).hidden = frei;
    $('.afr__zus', dlg).innerHTML = (d.zeilen || []).map(function (z) { return '<li>' + esc(z) + '</li>'; }).join('');
    if (frei) f.elements.art.value = d.schluessel;
    kopf(frei ? (FREI[f.elements.art.value] || FREI.nachricht)[2] : d.an);
    if (d.name && !f.elements.name.value) f.elements.name.value = d.name;
    $('.afr__los', dlg).disabled = false;
    if (!dlg.open) dlg.showModal();
    requestAnimationFrame(function () { dlg.classList.add('offen'); });
    var erstes = !f.elements.name.value ? f.elements.name : (frei ? f.elements.art : f.elements.kontakt);
    setTimeout(function () { try { erstes.focus({ preventScroll: true }); } catch (e) { /* */ } }, 30);
  }
  function melde(t) { $('.afr__meldung', dlg).innerHTML = t; }
  function kopf(an) { $('.afr__kopf .mono', dlg).textContent = an === INFO ? 'An die Rezeption' : 'An das Team des Hauses'; }   // Fest und Bewerbung gehen nicht an die Rezeption (Prüfung 17.10.2026)
  function senden(e) {
    e.preventDefault();
    var f = e.target, d = stand || {}, kontakt = f.elements.kontakt.value.trim(), name = f.elements.name.value.trim(), nachricht = f.elements.nachricht.value.trim();
    if (!name) { melde('Bitte Ihren Namen angeben.'); f.elements.name.focus(); return; }
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$|^\+?[\d\s/().-]{7,24}$/.test(kontakt)) { melde('Bitte eine E-Mail-Adresse oder Telefonnummer angeben, damit das Haus antworten kann.'); f.elements.kontakt.focus(); return; }
    var b = { website: f.elements.website.value, name: name, kontakt: kontakt, sprache: ['de', 'en', 'fr'].indexOf(SPRACHE) >= 0 ? SPRACHE : 'de', seite: location.pathname + location.hash, seite_name: seiteName() };
    if (d.frei) {
      var w = FREI[f.elements.art.value] || FREI.nachricht;
      b.art = w[1]; b.an = w[2]; b.formular = f.elements.art.value === 'gutschein' ? 'gutschein' : f.elements.art.value === 'stelle' ? 'stelle' : 'allgemein';
      b.anliegen = w[0]; b.datum = f.elements.datum.value.trim(); b.personen = f.elements.personen.value || null; b.nachricht = nachricht;
    } else {
      b.art = d.art; b.an = d.an; b.formular = d.formular; b.anliegen = d.anliegen; b.datum = d.datum; b.personen = d.personen || null;
      b.nachricht = (d.zeilen || []).join('\n') + (nachricht ? '\nNachricht: ' + nachricht : '');
    }
    if (new Blob([JSON.stringify(b)]).size > 11500) { melde('Ihre Angaben sind zu lang zum Senden. Bitte die Nachricht oder die Wünsche etwas kürzen, alles andere bleibt hier.'); return; }   // der Server nimmt höchstens 12 kB (Prüfung 17.10.2026: sonst «Gerade lässt sich nichts senden»)
    var los = $('.afr__los', dlg); los.disabled = true; melde('Wird gesendet …');
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b), credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j, code: r.status }; }); })
      .then(function (x) {
        if (x.ok && x.j.ok) {
          f.hidden = true; var dk = $('.afr__danke', dlg); $('.afr__dt', dk).textContent = x.j.danke || 'Danke. Dies ist ein Entwurf von Tasty Studios: Die Anfrage geht nicht an das Haus, sie liegt nur zur Ansicht im Gastgeber.'; dk.hidden = false;
          f.elements.nachricht.value = ''; $('.afr__fertig', dk).focus();
          return;
        }
        los.disabled = false;
        var m = String((x.j && x.j.fehler) || '').replace(/^[A-ZÄÖÜ-]+ · /, '');
        melde(x.code === 429 ? 'Gerade kamen viele Anfragen. Bitte in einer Minute noch einmal senden, Ihre Angaben bleiben hier.' :
          m && x.code < 500 && x.code !== 404 ? esc(m) : 'Gerade lässt sich nichts senden. Ihre Angaben bleiben hier. Lieber persönlich? <a href="' + TEL_L + '">' + TEL + '</a>');
      })
      .catch(function () { los.disabled = false; melde('Keine Verbindung. Ihre Angaben bleiben hier, bitte gleich noch einmal senden. Lieber persönlich? <a href="' + TEL_L + '">' + TEL + '</a>'); });
  }

  /* ---------- Abfangen: vor dienste.js und seiten.js (Fang-Durchlauf am Dokument), damit kein Mailprogramm mehr aufgeht ---------- */
  document.addEventListener('submit', function (e) {
    var f = e.target, art = null;
    if (!f || !f.matches) return;
    Object.keys(WAHL).forEach(function (s) { if (!art && f.matches(s)) art = WAHL[s]; });
    if (!art) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var d = FORMULARE[art](f); d.formular = art;
    oeffne(d);
  }, true);
  document.addEventListener('click', function (e) {
    var k = e.target.closest && e.target.closest('[data-anfrage], a[href="#anfrage"]');
    if (!k) return;
    e.preventDefault();
    var s = FREI[k.getAttribute('data-anfrage')] ? k.getAttribute('data-anfrage') : 'nachricht';
    oeffne({ frei: true, schluessel: s, titel: FREI[s][0] });
  });

  /* Hinweise unter den Formularen: das Mailprogramm geht nicht mehr auf */
  function hinweise() {
    $$('.buchen__klein, .dn-hinweis, p').forEach(function (p) {
      if (p.closest('.afr')) return;
      [].slice.call(p.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && /(Die Anfrage|Die Nachricht) öffnet Ihr Mailprogramm\./.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/(Die Anfrage|Die Nachricht) öffnet Ihr Mailprogramm\./, 'Entwurf von Tasty Studios: $1 geht nicht an das Haus.');
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hinweise); else hinweise();
})();
