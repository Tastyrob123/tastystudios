/* Berghotel Gasterntal — Seitenbau 13.10.2026 (Tasty Studios). Nur auf: abreise.html, offen.html, sauna.html, picknick.html, lage.html.
   Der Weg hinunter: die nächsten Fahrten durch die Chluse, gerechnet aus den Minuten des Studios (data-av/ab = am Hotel los, data-rv/rb = Chluse talwärts offen).
   Sind wir offen?: Antwort für heute aus Saisonschluss und Eröffnung (html[data-schluss], [data-auf]) und dem Wochentag; heute in der Wochenleiste.
   Anfragen (Sauna, Picknick, Fahrt hinunter): öffnen das Mailprogramm des Gastes, wie die übrigen Anfragen der Seite. Das Tal: Ort auf der Skizze wählen.
   Alle Zeiten sind die Zeit im Tal (Europe/Zurich), nicht die des Geräts. Nichts geschätzt: Preise und Minuten stehen im HTML, das bau.py aus den Angaben des Hauses schreibt. */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  /* Jetzt im Tal: Jahr, Monat, Tag, Stunde, Minute, Wochentag (0 = Sonntag). ?jetzt=2026-10-19T11:07 stellt die Uhr für Prüfungen. */
  function tal() {
    var probe = /[?&]jetzt=(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(location.search);
    if (probe) { var p = probe.slice(1).map(Number); return { j: p[0], m: p[1], t: p[2], h: p[3], min: p[4], sek: 0, wt: new Date(p[0], p[1] - 1, p[2]).getDay() }; }
    try {
      var o = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).forEach(function (x) { o[x.type] = +x.value; });
      if (o.year) return { j: o.year, m: o.month, t: o.day, h: o.hour % 24, min: o.minute, sek: o.second, wt: new Date(o.year, o.month - 1, o.day).getDay() };
    } catch (e) {}
    var d = new Date(); return { j: d.getFullYear(), m: d.getMonth() + 1, t: d.getDate(), h: d.getHours(), min: d.getMinutes(), sek: d.getSeconds(), wt: d.getDay() };
  }
  var isoVon = function (z) { return z.j + '-' + zwei(z.m) + '-' + zwei(z.t); };
  var tagVon = function (s) { var p = String(s || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; };
  var kurz = function (d) { return zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.' + d.getFullYear(); };
  var isoD = function (d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
  var SCHLUSS = tagVon(doc.getAttribute('data-schluss')), AUF = tagVon(doc.getAttribute('data-auf'));
  function imWinter(d) { return !!(SCHLUSS && AUF && d > SCHLUSS && d < AUF); }

  /* ---------------------------------------------------------------- Der Weg hinunter: die nächsten Fahrten */
  var tafel = $('[data-abtakt]');
  if (tafel) (function () {
    var z = function (n, s) { var v = parseInt(tafel.getAttribute(n), 10); return isNaN(v) ? s : ((v % 60) + 60) % 60; };
    var av = z('data-av', 5), ab = z('data-ab', 10), rv = z('data-rv', 15), rb = z('data-rb', 35);
    var dauer = ((rb - rv + 60) % 60) || 60, vor = (rv - av + 60) % 60, hotelD = ((ab - av + 60) % 60);   // Länge der Talfahrt, Vorlauf vom Hotel, Länge des Fensters am Hotel
    var jetzt = $('[data-ab="jetzt"]'), dann = $('[data-ab="dann"]'), zahl = $('[data-ab="zahl"]'), wort = $('[data-ab="wort"]'), reihen = $('[data-ab="reihen"]');
    var uhr = function (min) { min = ((min % 1440) + 1440) % 1440; return Math.floor(min / 60) + ':' + zwei(min % 60); };
    function rechne() {
      var n = tal(), m = n.h * 60 + n.min, liste = [];
      // die Fenster der Talfahrt um jetzt herum: Beginn je Stunde bei Minute rv
      for (var st = n.h - 1; liste.length < 3 && st < n.h + 6; st++) { var a = st * 60 + rv; if (a + dauer > m) liste.push(a); }
      var erstes = liste[0], offen = m >= erstes, bis = erstes - m;
      if (jetzt) jetzt.textContent = offen ? 'Talfahrt offen' : 'Talfahrt in ' + bis + ' Min.';
      if (dann) dann.textContent = offen ? 'noch ' + (erstes + dauer - m) + ' Min., bis ' + uhr(erstes + dauer) + ' Uhr' : 'am Hotel los zwischen ' + uhr(erstes - vor) + ' und ' + uhr(erstes - vor + hotelD) + ' Uhr';
      if (zahl) zahl.textContent = offen ? (erstes + dauer - m) : bis;
      if (wort) wort.textContent = offen ? (erstes + dauer - m === 1 ? 'Minute' : 'Minuten') + ' ist die Chluse talwärts noch offen, bis ' + uhr(erstes + dauer) + ' Uhr' : (bis === 1 ? 'Minute' : 'Minuten') + ' bis zur nächsten Fahrt hinunter, um ' + uhr(erstes) + ' Uhr';
      if (reihen) reihen.innerHTML = liste.map(function (a, i) {
        var wann = i === 0 && offen ? 'Jetzt offen' : a - m < 60 ? 'In ' + (a - m) + ' Min.' : 'Um ' + uhr(a);
        return '<div class="angabe' + (i === 0 && offen ? ' jetzt' : '') + '"><span>' + wann + '</span><b>Chluse offen ' + uhr(a) + ' bis ' + uhr(a + dauer) + '<small>Am Hotel los zwischen ' + uhr(a - vor) + ' und ' + uhr(a - vor + hotelD) + '</small></b></div>';
      }).join('');
      var zone = $('[data-ab="zone"]'); if (zone) zone.textContent = 'Zeit im Tal: ' + zwei(n.h) + ':' + zwei(n.min) + ' Uhr. Der Takt gilt jede Stunde.';
      // Vorschlag im Formular: die nächste Abfahrt am Hotel, die noch zu schaffen ist
      var zf = $('form[data-sb="fahrt"]'); if (zf && !zf._gesetzt) { var nn = liste.filter(function (a) { return a - vor > m; })[0]; if (nn != null) { zf.elements.zeit.value = zwei(Math.floor((((nn - vor) % 1440) + 1440) % 1440 / 60)) + ':' + zwei((((nn - vor) % 60) + 60) % 60); zf._gesetzt = 1; } }
    }
    rechne(); setInterval(function () { if (!document.hidden) rechne(); }, 20000);
  })();

  /* ---------------------------------------------------------------- Sind wir offen?: Antwort für heute */
  var antwort = $('[data-offen]');
  if (antwort || $('[data-woche]')) (function () {
    var n = tal(), heute = new Date(n.j, n.m - 1, n.t), winter = imWinter(heute), wt = n.wt === 0 ? 7 : n.wt;   // 1 = Montag … 7 = Sonntag
    var feld = $('[data-woche] [data-wt="' + wt + '"]'), art = feld ? (/--(\w+)/.exec(feld.className) || [])[1] : '';
    var fall = winter ? 'winter' : art === 'wetter' ? 'montag' : art === 'offen' ? 'ja' : 'neutral';
    if (antwort) $$('[data-wenn]', antwort).forEach(function (el) { el.hidden = el.getAttribute('data-wenn') !== fall; });
    if (feld && !winter) { feld.classList.add('heute'); var s = $('span', feld); if (s) s.textContent = 'Heute, ' + s.textContent; }
  })();

  /* ---------------------------------------------------------------- Anfragen ans Haus: Sauna, Picknick, Fahrt hinunter */
  $$('form[data-sb]').forEach(function (f) {
    var art = f.getAttribute('data-sb'), el = f.elements, mail = f.getAttribute('data-mail') || '';
    var preisEl = $('[data-sb-preis]', f), hinweis = $('[data-sb-hinweis]', f), gast = 0;
    var n0 = tal(), heute = new Date(n0.j, n0.m - 1, n0.t), erster = heute;
    if (imWinter(heute)) erster = AUF;
    else if (SCHLUSS && heute <= SCHLUSS) el.tag.max = isoD(SCHLUSS);   // in dieser Saison nur bis Saisonschluss; der Kalender sperrt die Schliesszeit ohnehin
    el.tag.min = isoD(erster); if (!el.tag.value) el.tag.value = isoD(erster);
    $$('[data-gast]', f).forEach(function (b) { b.addEventListener('click', function () { gast = +b.getAttribute('data-gast'); $$('[data-gast]', f).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); neu(); }); });
    function frueh() {   // Sauna: Vorlauf des Hauses in Stunden. Gibt die früheste Zeit für heute zurück oder ''.
      var vl = +f.getAttribute('data-vorlauf') || 0; if (!vl || el.tag.value !== isoVon(tal())) return '';
      var n = tal(), jetztMin = n.h * 60 + n.min, z = (el.zeit.value || '00:00').split(':'), gew = +z[0] * 60 + (+z[1]);
      if (gew - jetztMin >= vl * 60) return '';
      var f0 = jetztMin + vl * 60; return f0 >= 1440 ? 'morgen' : zwei(Math.floor(f0 / 60)) + ':' + zwei(f0 % 60);
    }
    function neu() {
      if (art !== 'sauna') return;
      var p = +f.getAttribute(gast ? 'data-gastpreis' : 'data-preis') || +f.getAttribute('data-preis') || 0, d = +f.getAttribute('data-dauer') || 90;
      if (preisEl) preisEl.textContent = p ? 'CHF ' + p + ' pauschal für ' + d + ' Minuten' + (gast ? ', Spezialpreis für Hotelgäste' : '') : '';
      var fr = frueh();
      if (hinweis) { hinweis.hidden = !fr; hinweis.textContent = fr ? (fr === 'morgen' ? 'Für heute ist es zu spät: Die Sauna braucht ' + f.getAttribute('data-vorlauf') + ' Stunden Vorlauf. Bitte einen anderen Tag wählen oder anrufen.' : 'Die Sauna braucht ' + f.getAttribute('data-vorlauf') + ' Stunden Vorlauf. Für heute frühestens ' + fr + ' Uhr.') : ''; }
    }
    f.addEventListener('change', neu); f.addEventListener('input', neu); neu();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = tagVon(el.tag.value); if (!d) return;
      var tagT = TAGE[d.getDay()] + ', ' + kurz(d), z = [], betreff;
      if (art === 'sauna') {
        betreff = 'Sauna in der alten Käserei, ' + kurz(d);
        z = ['Reservation: Sauna in der alten Käserei', 'Tag: ' + tagT, 'Beginn: ' + el.zeit.value + ' Uhr', 'Personen: ' + el.pers.value, 'Hotelgast: ' + (gast ? 'Ja' : 'Nein'), 'Name: ' + el.name.value];
        if (preisEl && preisEl.textContent) z.push(preisEl.textContent);
        if (hinweis && !hinweis.hidden) z.push('Hinweis der Seite: ' + hinweis.textContent);
      } else if (art === 'picknick') {
        betreff = 'Luxus-Picknick, ' + kurz(d);
        z = ['Anfrage: Luxus-Picknick', 'Tag: ' + tagT, 'Abholen um: ' + el.zeit.value + ' Uhr', 'Personen: ' + el.pers.value, 'Name: ' + el.name.value, 'Bitte nennen Sie mir, was Sie richten, und den Preis.'];
      } else {
        betreff = 'Fahrt hinunter nach Kandersteg, ' + kurz(d);
        z = ['Anfrage: Fahrt von Selden nach Kandersteg', 'Abreisetag: ' + tagT, 'Abfahrt am Hotel: ' + el.zeit.value + ' Uhr', 'Personen: ' + el.pers.value, 'Name: ' + el.name.value, 'Bitte bestätigen Sie mir Zeit und Preis.'];
      }
      if (el.wunsch && el.wunsch.value) z.push((art === 'fahrt' ? 'Dazu: ' : 'Wünsche: ') + el.wunsch.value);
      f._mail = 'An: ' + mail + '\nBetreff: ' + betreff + '\n\n' + z.join('\n');   // für die Prüfung (_qa/seitenbau_klick.js)
      if (window.bgSchreibe) return window.bgSchreibe(betreff, z, el.tag && el.tag.value, el.pers && +el.pers.value);   // Robert 17.10.2026: Anfrage-Fenster auf der Seite statt Mailprogramm (assets/js/anfrage.js)
      location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent('Guten Tag\n\n' + z.join('\n') + '\n\nFreundliche Grüsse\n');
    });
  });

  /* ---------------------------------------------------------------- Das Tal: Ort auf der Skizze und in der Liste gehören zusammen */
  var karte = $('[data-karte]');
  if (karte) (function () {
    var zeilen = $$('[data-ortz]');
    function waehle(i, rollen) {
      $$('.sk-ort', karte).forEach(function (o) { o.classList.toggle('an', o.getAttribute('data-ort') === String(i)); });
      zeilen.forEach(function (zl) { zl.classList.toggle('an', zl.getAttribute('data-ortz') === String(i)); });
      if (rollen) { var zl = zeilen[i]; if (zl) { var r = zl.getBoundingClientRect(); if (r.top < 90 || r.bottom > innerHeight - 20) zl.scrollIntoView({ block: 'center', behavior: doc.classList.contains('still') ? 'auto' : 'smooth' }); } }
    }
    $$('.sk-ort', karte).forEach(function (o) { o.addEventListener('click', function (e) { e.preventDefault(); waehle(+o.getAttribute('data-ort'), true); }); });
    zeilen.forEach(function (zl) { zl.addEventListener('click', function () { waehle(+zl.getAttribute('data-ortz'), false); }); });
    waehle(zeilen.length - 1, false);   // das Haus zuerst
  })();
})();
