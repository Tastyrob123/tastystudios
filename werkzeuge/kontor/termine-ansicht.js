/* termine-ansicht.js · Website bearbeiten (Ihr Haus, Kopie der Vorlage): Ansicht «Termine» im Schreibtisch des Stamms (window.WS_EIGEN, website.js).
   Die nächsten Abende der Tafel sind auf der Website Daten, kein Text: in der Vorführung antwortet termine-vorfuehrung.js im Arbeitsspeicher, hier werden sie
   gepflegt. Eingaben warten gelb und zählen in der Leiste mit; «Speichern» der Leiste legt sie in den Entwurf, «Veröffentlichen» bringt sie
   (mit den Änderungen an Texten und Fotos) auf die Website (in der Vorführung nur sichtbar, nichts geht online). Frühere Fassungen und der ursprüngliche Stand lassen sich zurückholen.
   Vor website.js laden (die Ansicht muss beim Start bekannt sein). Kein fester Farbwert: alles aus dem Kleid (--wo-*). */
(function () {
  'use strict';
  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var FARBEN = ['var(--wo-kerze)', 'var(--wo-akzent)', 'var(--wo-papier)', 'var(--wo-gold)'];   // je Abend eine Akzentfarbe wie die Plakate, nur aus dem Kleid (Ihr Haus: Leinen statt der Nacht, die auf dem Plakat verschwände)
  var L = null, liste = [], weg = {}, H = null, vorschauBreite = 'rechner';

  function kopie(x) { return JSON.parse(JSON.stringify(x)); }
  function basis() { return L ? (L.entwurf || L.stand) : []; }
  function gleich(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function nach(id, l) { return (l || []).find(function (t) { return t.id === id; }); }
  function datum(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function wann(t) { if (!t.datum) return 'Datum fehlt'; var d = datum(t.datum); return TAGE[d.getDay()] + ', ' + d.getDate() + '. ' + MONATE[d.getMonth()] + ' ' + d.getFullYear() + ' ab ' + t.zeit; }
  function eur(n) { return Number(n).toFixed(2).replace('.', ',') + ' EUR'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  async function ruf(methode, weg_, daten) {
    var r;
    try {
      r = await window.WS_TERMINE(methode, weg_, daten);   // Vorführung: statt des Servers der Speicher im Arbeitsspeicher (termine-vorfuehrung.js)
    } catch (e) { if (e && e.status) throw e; throw { fehler: 'NETZ · Der Server des Werkzeugs antwortet nicht. Ihre Eingaben bleiben stehen.', stichwort: 'netz' }; }
    return r;
  }
  function uebernehmen(neu, eingabenBehalten) {
    L = neu;
    if (!eingabenBehalten) liste = kopie(basis());
  }
  /* Was geändert ist: zwischen zwei Listen, je Termin, mit den Feldern, die sich unterscheiden */
  function unterschiede(alt, neu) {
    var aus = [];
    neu.forEach(function (t) {
      var a = nach(t.id, alt);
      if (!a) aus.push({ art: 'neu', t: t });
      else if (!gleich(a, t)) aus.push({ art: 'geaendert', t: t, a: a });
    });
    alt.forEach(function (a) { if (!nach(a.id, neu)) aus.push({ art: 'weg', t: a }); });
    return aus;
  }
  function zeile(u) {
    if (u.art === 'neu') return 'neuer Abend ' + wann(u.t) + ', ' + eur(u.t.preis) + ', ' + u.t.plaetze + ' Plätze';
    if (u.art === 'weg') return 'von der Seite genommen: ' + wann(u.t);
    var d = [];
    if (u.a.datum !== u.t.datum || u.a.zeit !== u.t.zeit) d.push('«' + wann(u.a) + '» wird «' + wann(u.t) + '»');
    if (u.a.preis !== u.t.preis) d.push('Preis «' + eur(u.a.preis) + '» wird «' + eur(u.t.preis) + '»');
    if (u.a.plaetze !== u.t.plaetze) d.push('Plätze «' + u.a.plaetze + '» werden «' + u.t.plaetze + '»');
    return wann(u.t) + ': ' + d.join(', ');
  }
  function offen() { return L ? unterschiede(basis(), sortiert(liste)).length : 0; }
  function sortiert(l) { return l.slice().sort(function (a, b) { return (a.datum + a.zeit).localeCompare(b.datum + b.zeit); }); }
  function istHier() { return H && H.ansicht() === 'e:termine' && document.querySelector('#ws-mitte[data-ws-ansicht="e:termine"]'); }

  async function speichern() {
    try {
      var a = await ruf('POST', 'speichern', { termine: sortiert(liste), erwartet: L.kennung });
      uebernehmen(a, false);
      if (a.nichts) { H && H.melde(a.meldung); } else {
        var n = unterschiede(a.vorher, basis()), k = H.quit('Gespeichert', 'Termine · ' + zeile(n[0] || { art: 'neu', t: basis()[0] || {} }) + (n.length > 1 ? ' und ' + H.mz(n.length - 1, 'weitere Änderung', 'weitere Änderungen') : ''), [
          H.taste('Vorher/nachher ansehen', function () { k.remove(); H.geh('e:termine').then(function () { var v = document.getElementById('cu-tv'); if (v) v.scrollIntoView({ block: 'start' }); }); }),
          H.taste('Rückgängig', function () { k.remove(); rueckgaengig(a.vorher); })], { 'data-ws-quittung': n.length, 'data-cu-termine': 'gespeichert' });
        setTimeout(function () { if (k.isConnected) k.remove(); }, 9000);
      }
      if (istHier()) zeichne(document.getElementById('ws-mitte'), H);
      return true;
    } catch (e) {
      if (e.status === 409) { return konflikt(); }
      H.fehler(e);
      return false;
    }
  }
  async function rueckgaengig(vorher) {
    try { uebernehmen(await ruf('POST', 'speichern', { termine: vorher, erwartet: L.kennung }), false); H.melde('Rückgängig gemacht', { mehr: 'Die Termine sind wie vor diesem Speichern.' }); }
    catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
    H.neu(); if (istHier()) zeichne(document.getElementById('ws-mitte'), H);
  }
  async function neuLaden(behalten) { uebernehmen(await ruf('GET', ''), behalten); }
  function konflikt() {
    return neuLaden(true).then(function () {
      return new Promise(function (fertig) {
        H.fenster('Zwei haben', 'gleichzeitig geändert.', H.el('div', { class: 'ws-form' },
          H.el('p', {}, 'In einem anderen Fenster wurden die Termine inzwischen gespeichert. Ihre Eingaben sind nicht verloren und nichts wurde überschrieben.'),
          H.el('p', {}, 'Speichern Sie, gilt Ihre Liste, so wie sie hier steht.')), [
          { text: 'Meine Eingaben verwerfen', tun: function (zu) { zu(); liste = kopie(basis()); H.neu(); if (istHier()) zeichne(document.getElementById('ws-mitte'), H); fertig(false); } },
          { text: 'Meine Eingaben speichern', haupt: true, tun: function (zu) { zu(); speichern().then(fertig); } }], { name: 'konflikt' });
      });
    });
  }

  /* ---------- Zeichnen */
  function plakat(t, i, beispiel) {   // das Bild eines Termins: sein Plakat, wie die Seite «Die Tafel» es zeigt (Wortmarke, Datum, Akzentfarbe)
    var d = t.datum ? datum(t.datum) : null, frei = Math.max(0, t.plaetze - (t.gebucht || 0));
    return '<figure class="cu-pl' + (frei === 0 ? ' cu-pl--voll' : '') + '" style="--ak:' + FARBEN[i % FARBEN.length] + '" aria-hidden="true">' +
      '<span class="cu-pl__zeile">DIE TAFEL</span><span class="cu-pl__marke cu-pl__marke--ih"></span>' +
      '<b class="cu-pl__tag">' + (d ? d.getDate() + '.' : '–') + '</b><span class="cu-pl__monat">' + (d ? MONATE[d.getMonth()] : '') + '</span>' +
      '<span class="cu-pl__frei">' + (beispiel ? 'Beispiel' : frei === 0 ? 'ausgebucht' : frei + ' frei') + '</span></figure>';
  }
  function feld(label, inhalt, art) { return H.el('label', { class: 'cu-f' + (art ? ' cu-f--' + art : '') }, H.el('span', { class: 'cu-f__l' }, label), inhalt); }
  function auswahlZeit(t, beiWahl) {
    var o = [], h, m;
    for (h = 16; h <= 21; h++) for (m = 0; m < 60; m += 30) o.push(('0' + h).slice(-2) + ':' + (m ? '30' : '00'));
    if (o.indexOf(t.zeit) < 0) o.push(t.zeit);
    return H.auswahl(o.sort().map(function (z) { return { wert: z, text: z + ' Uhr' }; }), t.zeit, beiWahl, 'Beginn');
  }
  function auswahlDatum(t, beiWahl) {   // Datum im Stil des Hauses (R21): Tag, Monat, Jahr als Auswahl, nie die des Betriebssystems
    var p = (t.datum || '').split('-'), j0 = new Date().getFullYear(), tage = [], mon = [], jahre = [];
    for (var i = 1; i <= 31; i++) tage.push({ wert: ('0' + i).slice(-2), text: i + '.' });
    MONATE.forEach(function (n, i) { mon.push({ wert: ('0' + (i + 1)).slice(-2), text: n }); });
    for (var j = j0; j <= j0 + 2; j++) jahre.push({ wert: String(j), text: String(j) });
    if (p[0] && !jahre.some(function (x) { return x.wert === p[0]; })) jahre.unshift({ wert: p[0], text: p[0] });
    var setze = function (k, w) { p[k] = w; beiWahl(p.join('-')); };
    return H.el('span', { class: 'cu-datum' }, H.auswahl(tage, p[2], function (w) { setze(2, w); }, 'Tag'), H.auswahl(mon, p[1], function (w) { setze(1, w); }, 'Monat'), H.auswahl(jahre, p[0], function (w) { setze(0, w); }, 'Jahr'));
  }
  function zahlFeld(wert, name, beiTippen) {
    var i = H.el('input', { type: 'text', inputmode: name === 'preis' ? 'decimal' : 'numeric', class: 'cu-zahl', name: name, value: String(wert).replace('.', ','), autocomplete: 'off', 'aria-label': name === 'preis' ? 'Preis in Euro' : 'Plätze' });
    i.addEventListener('input', function () { beiTippen(i.value); });
    return i;
  }
  function pruefeEingabe(t) {
    if (!t.datum || isNaN(datum(t.datum).getTime()) || datum(t.datum).getMonth() + 1 !== +t.datum.split('-')[1]) return 'Diesen Tag gibt es nicht.';
    if (!(t.preis > 0 && t.preis <= 999)) return 'Der Preis liegt zwischen 1 und 999 Euro.';
    if (!(t.plaetze >= 1 && t.plaetze <= 40) || t.plaetze !== Math.round(t.plaetze)) return 'Ein Abend hat zwischen 1 und 40 Plätze.';
    if ((t.gebucht || 0) > t.plaetze) return 'Es sind schon ' + t.gebucht + ' Plätze vergeben.';
    if (liste.some(function (x) { return x !== t && x.datum === t.datum && x.zeit === t.zeit; })) return 'An diesem Tag steht zur selben Zeit schon ein Abend.';
    return '';
  }
  function karte(t, i) {
    var b = nach(t.id, basis()), neu = !b, geaendert = b && !gleich(b, t);
    var fehler = pruefeEingabe(t);
    var meld = H.el('p', { class: 'cu-t__fehler', role: 'alert', hidden: !fehler }, fehler);
    var kopfZeile = H.el('p', { class: 'cu-t__wann' }, wann(t));
    var bild = H.el('div', { class: 'cu-t__bild', html: plakat(t, i) });
    function neuZeichnen() {
      var f = pruefeEingabe(t); meld.textContent = f; meld.hidden = !f;
      kopfZeile.textContent = wann(t); bild.innerHTML = plakat(t, i);
      var bb = nach(t.id, basis());
      k.classList.toggle('cu-t--offen', !bb || !gleich(bb, t));
      H.leiste();
    }
    var k = H.el('article', { class: 'cu-t' + (neu || geaendert ? ' cu-t--offen' : ''), 'data-cu-termin': t.id },
      bild,
      H.el('div', { class: 'cu-t__felder' },
        H.el('div', { class: 'cu-t__kopf' }, kopfZeile, neu ? H.el('span', { class: 'cu-t__marke' }, 'Neu') : null),
        H.el('div', { class: 'cu-t__reihe' },
          feld('Datum', auswahlDatum(t, function (w) { t.datum = w; neuZeichnen(); }), 'datum'),
          feld('Beginn', auswahlZeit(t, function (w) { t.zeit = w; neuZeichnen(); })),
          feld('Preis in Euro', zahlFeld(t.preis, 'preis', function (v) { t.preis = Number(String(v).replace(',', '.').replace(/[^\d.]/g, '')) || 0; neuZeichnen(); }), 'zahl'),
          feld('Plätze', zahlFeld(t.plaetze, 'plaetze', function (v) { t.plaetze = parseInt(v, 10) || 0; neuZeichnen(); }), 'zahl')),
        H.el('p', { class: 'cu-t__frei' }, (t.gebucht || 0) + ' von ' + t.plaetze + ' Plätzen vergeben. Die Buchungen kommen über die Seite; hier ändern Sie den Abend selbst.'),
        meld,
        H.el('div', { class: 'cu-t__kn' },
          b && geaendert ? H.link('Wie gespeichert', function () { liste[liste.indexOf(t)] = kopie(b); zeichne(document.getElementById('ws-mitte'), H); H.leiste(); }) : null,
          H.link(neu ? 'Wieder entfernen' : 'Von der Seite nehmen', function () {
            var nr = liste.indexOf(t); liste.splice(nr, 1); zeichne(document.getElementById('ws-mitte'), H); H.leiste(); H.neu();
            if (!neu) H.melde('Von der Seite genommen', { mehr: wann(t) + '. Erst mit «Speichern» im Entwurf; jeder veröffentlichte Stand lässt sich zurückholen.' });
          }, { 'data-cu-weg': t.id }))));
    return k;
  }
  function neuerAbend() {   // Vorschlag aus den Abenden, die schon stehen: eine Woche nach dem letzten, gleiche Zeit, gleicher Preis, gleiche Plätze
    var l = sortiert(liste.length ? liste : basis().length ? basis() : (L ? L.ursprung : [])), letzter = l[l.length - 1];
    var d = letzter ? datum(letzter.datum) : new Date(); d.setDate(d.getDate() + 7);
    var iso = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var t = { id: 'n' + Date.now().toString(36).slice(-8), datum: iso, zeit: letzter ? letzter.zeit : '19:00', preis: letzter ? letzter.preis : 0, plaetze: letzter ? letzter.plaetze : 28, gebucht: 0 };
    liste.push(t);
    zeichne(document.getElementById('ws-mitte'), H); H.neu();
    var k = document.querySelector('[data-cu-termin="' + t.id + '"]'); if (k) { k.scrollIntoView({ block: 'center' }); k.classList.add('cu-t--leuchtet'); }
  }

  function vergleich() {   // «Vorher, nachher»: veröffentlicht (durchgestrichen) gegen Entwurf (markiert)
    var u = L.wartet ? unterschiede(L.stand, L.entwurf) : [];
    var box = H.el('section', { class: 'cu-v', id: 'cu-tv' }, H.el('h2', { class: 'wo-zw' }, 'Vorher, ', H.el('em', {}, 'nachher')));
    if (!u.length) {
      box.append(H.el('p', { class: 'cu-leise' }, 'Im Entwurf wartet nichts. Was Sie speichern, steht hier: links, was jetzt auf der Website steht, rechts, was nach dem Veröffentlichen gilt.'),
        H.el('div', { class: 'cu-v__z cu-v__z--beispiel' }, H.el('span', { class: 'cu-v__mk' }, 'Beispiel'), H.el('s', {}, 'Freitag, 27. November 2026 ab 19:00 · 89,00 EUR'), H.el('mark', {}, 'Freitag, 27. November 2026 ab 19:30 · 89,00 EUR')));
      return box;
    }
    u.forEach(function (x) {
      box.append(H.el('div', { class: 'cu-v__z', 'data-cu-v': x.art },
        H.el('span', { class: 'cu-v__mk' }, x.art === 'neu' ? 'Neu' : x.art === 'weg' ? 'Entfällt' : 'Geändert'),
        x.art !== 'neu' ? H.el('s', {}, wann(x.a || x.t) + ' · ' + eur((x.a || x.t).preis) + ' · ' + (x.a || x.t).plaetze + ' Plätze') : null,
        x.art !== 'weg' ? H.el('mark', {}, wann(x.t) + ' · ' + eur(x.t.preis) + ' · ' + x.t.plaetze + ' Plätze') : null));
    });
    box.append(H.el('div', { class: 'ws-reihe' }, H.link('Entwurf der Termine verwerfen', function () {
      H.fenster('Entwurf der Termine', 'verwerfen?', H.el('p', {}, H.mz(u.length, 'Änderung geht', 'Änderungen gehen') + ' verloren. Die Website bleibt, wie sie ist.'), [
        { text: 'Abbrechen' },
        { text: 'Ja, verwerfen', haupt: true, tun: async function (zu) {
          zu();
          try { var a = await ruf('POST', 'verwerfen', { erwartet: L.kennung }); var vorher = a.vorher; uebernehmen(a, false); H.neu(); zeichne(document.getElementById('ws-mitte'), H);
            var k = H.quit('Entwurf verworfen', 'Die Termine stehen, wie sie veröffentlicht sind.', [H.taste('Rückgängig', function () { k.remove(); rueckgaengig(vorher); })]);
          } catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
        } }], { name: 'verwerfen' });
    }, { 'data-cu-verwerfen': '1' })));
    return box;
  }
  function verlauf() {   // Frühere Fassungen (R14): Datum, Zahl, Notiz, «In den Entwurf holen», unten immer der ursprüngliche Stand
    var box = H.el('section', { class: 'cu-vl' }, H.el('h2', { class: 'wo-zw' }, 'Frühere ', H.el('em', {}, 'Fassungen')));
    var holen = function (nr, was) {
      return H.taste('In den Entwurf holen', async function () {
        try { uebernehmen(await ruf('POST', 'zurueckholen', { nr: nr, erwartet: L.kennung }), false); H.neu(); zeichne(document.getElementById('ws-mitte'), H);
          H.melde('In den Entwurf geholt', { mehr: was + '. Auf der Website erscheint es erst, wenn Sie veröffentlichen.' });
        } catch (e) { if (e.status === 409) { await neuLaden(true); H.melde('Inzwischen hat jemand anderes gespeichert.', { stichwort: 'konflikt' }); } else H.fehler(e); }
      }, { 'data-cu-holen': String(nr) });
    };
    if (!L.verlauf.length) box.append(H.el('div', { class: 'cu-vl__z cu-vl__z--beispiel' }, H.el('span', { class: 'cu-v__mk' }, 'Beispiel'),
      H.el('b', {}, '28.10.2026, 18:30 Uhr'), H.el('span', {}, 'Veröffentlicht · 12 Abende · Notiz «Abende im Dezember»')));
    L.verlauf.forEach(function (v) {
      box.append(H.el('div', { class: 'cu-vl__z' }, H.el('b', {}, H.zeit(v.zeit)), H.el('span', {}, 'Veröffentlicht · ' + H.mz(v.zahl, 'Abend', 'Abende') + (v.notiz ? ' · Notiz «' + v.notiz + '»' : '')), holen(v.nr, 'Die Fassung vom ' + H.zeit(v.zeit))));
    });
    box.append(H.el('div', { class: 'cu-vl__z cu-vl__z--ur' }, H.el('b', {}, 'Ursprünglicher Stand'), H.el('span', {}, 'Wie die Website gebaut ist · ' + H.mz(L.ursprung.length, 'Abend', 'Abende')), holen('ursprung', 'Der ursprüngliche Stand')));
    return box;
  }
  /* Vorführung: die Seite «Die Tafel» aus den aufgenommenen Seiten (vorfuehrung.js), darin nach «Die Karte dieser Woche» die Plakate der Abende,
     mit den Terminen des Entwurfs. Kein Laden einer Website: das Bild der Seite entsteht hier und steht als srcdoc im Rahmen. */
  function seiteMitTerminen() {
    var t = L.entwurf || L.stand, h = window.WS_VORFUEHRUNG.vorschau('entwurf', 'de', 'tafel.html').html;
    var tage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    var plakate = t.map(function (x) {
      var d = datum(x.datum), frei = Math.max(0, x.plaetze - (x.gebucht || 0));
      return '<li class="ih-ab' + (frei ? '' : ' ih-ab--voll') + '"><span class="ih-ab__tag">' + tage[d.getDay()] + '</span><b>' + d.getDate() + '.</b><span class="ih-ab__mon">' + MONATE[d.getMonth()] + '</span>' +
        '<span class="ih-ab__z">ab ' + esc(x.zeit) + ' Uhr · ' + esc(String(x.preis).replace('.', ',')) + ' €</span><span class="ih-ab__frei">' + (frei ? 'noch ' + frei + (frei === 1 ? ' Platz' : ' Plätze') : 'ausgebucht') + '</span></li>';
    }).join('');
    var teil = '<section class="ih-abende" id="termine-buchen"><style>' +
      '.ih-abende{background:var(--leinen);color:var(--tinte);padding:clamp(64px,7vw,110px) var(--rand)}.ih-abende__w{max-width:var(--weit);margin:0 auto}' +
      '.ih-abende .kopf p{color:rgba(28,32,41,.78)}.ih-abende ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--fuge)}' +
      '.ih-ab{position:relative;aspect-ratio:3/4;background:var(--gruen);color:var(--leinen);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:inset 0 -3px 0 var(--licht)}' +
      '.ih-ab b{font:500 52px/1 var(--serif)}.ih-ab__tag,.ih-ab__mon,.ih-ab__z,.ih-ab__frei{font:500 11px/1.2 var(--sans);letter-spacing:.12em;text-transform:uppercase}' +
      '.ih-ab__tag,.ih-ab__frei{color:var(--licht)}.ih-ab__z{margin-top:8px;color:rgba(239,231,218,.8);letter-spacing:.06em}.ih-ab__frei{position:absolute;bottom:14px}' +
      '.ih-ab--voll{background:var(--nacht2)}.ih-ab--voll b{opacity:.55}</style><div class="ih-abende__w"><div class="kopf"><h2 class="t1 t1--dunkel">Die nächsten Abende an der Tafel.</h2>' +
      '<p>Donnerstag bis Samstag ab 19 Uhr, Einlass um halb sieben. Fünf Gänge, von Hand angerichtet, 89 € je Gast.</p></div>' +
      (t.length ? '<ol>' + plakate + '</ol>' : '<p>Gerade steht kein Termin fest.</p>') + '</div></section>';
    var i = h.indexOf('<section class="herkunft"');
    return i < 0 ? h : h.slice(0, i) + teil + h.slice(i);
  }
  function rahmenMitTerminen(klasse, titel) {
    var rahmen = H.el('iframe', { class: klasse, title: titel });
    function rolle() { try { var z = rahmen.contentDocument.getElementById('termine-buchen'); if (z) rahmen.contentWindow.scrollTo(0, z.getBoundingClientRect().top + rahmen.contentWindow.scrollY); } catch (e) { /* ohne Rollen */ } }
    rahmen.addEventListener('load', function () { rolle(); setTimeout(rolle, 300); setTimeout(rolle, 1000); });   // die Seite setzt sich nach dem Laden noch (Schriften, Bilder)
    rahmen.srcdoc = seiteMitTerminen();
    return rahmen;
  }
  function gross() {   // «Gross öffnen», «Auf der Seite ansehen»: die Seite im eigenen Fenster des Werkzeugs, nie ausserhalb
    var breite = vorschauBreite, huelle = H.el('div', { class: 'cu-vs__huelle cu-vs__huelle--gross', 'data-breite': breite }, rahmenMitTerminen('cu-vs__rahmen', 'Die Seite «Die Tafel» mit den Terminen'));
    H.fenster('Die Seite «Die Tafel»', 'mit den Terminen.', H.el('div', {},
      H.el('div', { class: 'cu-vs__kopf' }, H.el('p', { class: 'cu-leise' }, L.wartet ? 'Mit den Terminen des Entwurfs.' : 'So steht die Seite gerade auf der Website.'),
        H.wahl2([{ wert: 'rechner', text: 'Rechner' }, { wert: 'handy', text: 'Handy' }], breite, function (w) { huelle.setAttribute('data-breite', w); }, 'Breite der Vorschau', true)), huelle), [{ text: 'Schliessen' }], { name: 'termine-seite' });
  }
  function vorschau() {
    /* ohne Anker laden: ein Anker im Rahmen rollt auch die Seite des Werkzeugs dorthin (Fund 28.10.2026); gerollt wird nur innen */
    var rahmen = rahmenMitTerminen('cu-vs__rahmen', 'Vorschau der Seite «Die Tafel» mit den Terminen des Entwurfs');
    var huelle = H.el('div', { class: 'cu-vs__huelle', 'data-breite': vorschauBreite }, rahmen);
    var wahl = H.wahl2([{ wert: 'rechner', text: 'Rechner' }, { wert: 'handy', text: 'Handy' }], vorschauBreite, function (w) { vorschauBreite = w; huelle.setAttribute('data-breite', w); }, 'Breite der Vorschau', true);
    return H.el('section', { class: 'cu-vs' }, H.el('h2', { class: 'wo-zw' }, 'So sieht es ', H.el('em', {}, 'auf der Seite aus')),
      H.el('div', { class: 'cu-vs__kopf' }, H.el('p', { class: 'cu-leise' }, L.wartet ? 'Mit den Terminen des Entwurfs. Noch nicht gespeicherte Eingaben erscheinen nach «Speichern».' : 'Die Seite «Die Tafel», wie sie gerade auf der Website steht.'), wahl,
        H.el('a', { class: 'ws-taste', href: '#termine-buchen', onclick: function (ev) { ev.preventDefault(); gross(); } }, 'Gross öffnen')), huelle);
  }

  var vsKennung = '';
  function zeichne(ort, h) {
    H = h;
    var m = ort || document.getElementById('ws-mitte');
    var y = window.scrollY;
    /* Neu zeichnen nach einer Eingabe (Neuer Abend, Entfernen): nur Liste, Vergleich und Verlauf; die eingebettete Vorschau bleibt stehen, solange
       der Entwurf derselbe ist (ein iframe lädt bei jedem Einsetzen neu: «Neuer Abend» brauchte so 0,9 s, Messung 28.10.2026) */
    if (m.querySelector(':scope > .cu-vs') && m.querySelector(':scope > .cu-liste') && vsKennung === L.kennung) {
      m.querySelector(':scope > .cu-liste').replaceWith(listeBox(h));
      m.querySelector(':scope > .cu-v').replaceWith(vergleich());
      m.querySelector(':scope > .cu-vl').replaceWith(verlauf());
      m.setAttribute('data-cu-termine', String(liste.length));
      return;
    }
    vsKennung = L.kennung;
    m.textContent = '';
    m.append(h.titel('Die nächsten Abende', 'Termine', 'pflegen.', 'Jeder Abend, für den Gäste einen Platz an der Tafel buchen können: Tag, Beginn, Preis und wie viele Plätze es gibt. Auf der Seite «Die Tafel» steht jeder als eigenes Plakat.',
      [h.el('button', { class: 'wo-kn wo-kn--gold', type: 'button', 'data-cu-neu': '1', html: '<span>Neuer Abend</span><i>' + (window.WO ? WO.ic('plus') : '') + '</i>', onclick: neuerAbend }),
       h.el('a', { class: 'wo-kn', href: '#termine-buchen', onclick: function (ev) { ev.preventDefault(); gross(); }, html: '<span>Auf der Seite ansehen</span><i>' + (window.WO ? WO.ic('auge') : '') + '</i>' })]));
    var s = sortiert(liste);
    m.append(listeBox(h), vergleich(), vorschau(), verlauf(),
      h.el('p', { class: 'cu-quelle' }, 'Ursprung der Termine: ' + L.quelle + '. Die Website wird hier nie verändert; in der Vorführung geht nichts online.'));
    if (h.opt && h.opt.halten) window.scrollTo(0, y);
    m.setAttribute('data-cu-termine', String(s.length));
  }
  function listeBox(h) {
    var s = sortiert(liste);
    var box = h.el('section', { class: 'cu-liste', 'aria-label': 'Termine' });
    if (!s.length) {
      box.append(h.el('div', { class: 'cu-leer' }, h.el('p', {}, 'Gerade steht kein Abend fest. Auf der Website sehen Gäste dann den Satz «Gerade steht kein Termin fest» und den Weg zur Reservierung.'),
        h.el('div', { class: 'cu-t cu-t--beispiel' }, h.el('div', { class: 'cu-t__bild', html: plakat({ datum: '2026-11-27', zeit: '19:00', preis: 89, plaetze: 28, gebucht: 0 }, 0, true) }),
          h.el('div', { class: 'cu-t__felder' }, h.el('p', { class: 'cu-t__wann' }, 'Beispiel: Freitag, 27. November 2026 ab 19:00'), h.el('p', { class: 'cu-t__frei' }, '89,00 EUR · 28 Plätze. Mit «Neuer Abend» legen Sie den ersten an.')))));
    }
    s.forEach(function (t, i) { box.append(karte(t, i)); });
    return box;
  }

  window.WS_EIGEN = window.WS_EIGEN || {};
  window.WS_EIGEN.termine = {
    name: 'Termine', gruppe: 'Das Haus', aufgabe: ['Neuer Abend', 'Termin eintragen, verschieben oder von der Seite nehmen.'],
    bereit: function () { return ruf('GET', '').then(function (a) { uebernehmen(a, false); }); },
    zeichne: async function (ort, h) { H = h; if (h.opt && h.opt.neuLaden) await neuLaden(true); zeichne(ort, h); },
    offen: offen,
    wartet: function () { return L && L.wartet ? unterschiede(L.stand, L.entwurf).length : 0; },
    speichern: function () { if (!H) return Promise.resolve(false); return speichern(); },
    zeilen: function () { return L && L.wartet ? unterschiede(L.stand, L.entwurf).map(zeile) : []; },
    veroeffentlichen: async function (notiz) {
      var n = this.wartet();
      uebernehmen(await ruf('POST', 'veroeffentlichen', { erwartet: L.kennung, notiz: notiz }), true);
      if (istHier()) zeichne(document.getElementById('ws-mitte'), H);
      return n;
    }
  };
})();

/* Abnahme-Tor 2, 30.10.2026 (S2, K7): Kacheltitel und -unterschriften der Übersicht («Einen Text ändern», «Preis oder Öffnungszeit») ohne einzelnes Wort in der
   letzten Zeile: die letzten zwei Wörter bleiben zusammen (Safari kennt den Umbruch «pretty» noch nicht) */
(function () {
  function fest() {
    document.querySelectorAll(':is(.wo-ag__t, .wo-bk__t) > :is(b, span):not([data-fest]):not(:has(*))').forEach(function (b) {
      b.setAttribute('data-fest', '');
      var t = b.textContent.trim(), i = t.lastIndexOf(' '), j = i > 0 ? t.lastIndexOf(' ', i - 1) : -1;
      if (j < 0) return;
      b.textContent = t.slice(0, j + 1) + t.slice(j + 1).replace(' ', '\u00a0');
    });
  }
  /* Fenster «Foto tauschen»: der Bildtitel steht ganz (das gemeinsame Werkzeug kürzt ihn auf 48 Zeichen mit «…»; der volle steht im title) */
  function ganz() {
    document.querySelectorAll('.ws-fwahl:not([data-ganz])').forEach(function (k) {
      k.setAttribute('data-ganz', '');
      var t = k.querySelector('.ws-fwahl__t'), voll = k.getAttribute('title');
      if (!t || !voll || !/…$/.test(t.textContent)) return;
      t.textContent = (/^Eigenes Foto · /.test(t.textContent) ? 'Eigenes Foto · ' : '') + voll;
    });
  }
  /* Kein «×» als Zählzeichen (K24, Tor 2, 30.10.2026): «Link · 4× auf der Seite» heisst «Link · an 4 Stellen der Seite», «Steht 9× …» heisst «Steht an 9 Stellen …» */
  function ohneX() {
    document.querySelectorAll('.ws-st small, .ws-ang__lage, .ws-hoch, .ws-hoch *').forEach(function (e) {
      if (e.children.length) return;
      var t = e.textContent; if (t.indexOf('×') < 0) return;
      e.textContent = t.replace(/(\d+)× auf der Seite/g, '$1-mal auf der Seite').replace(/Steht (\d+)×/g, 'Steht an $1 Stellen').replace(/(\d+)\s*×\s*(\d+)/g, '$1 auf $2').replace(/(\d+)×/g, '$1-mal');   /* Masse wie in der Werkstatt: «1600 auf 1067» */
    });
  }
  var plan = 0;
  function alles() { plan = 0; fest(); ganz(); ohneX(); }
  if (window.MutationObserver) new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(alles); }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
