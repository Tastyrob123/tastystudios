/* Landgasthof Ruedihus — jede Auswahl im Stil des Hauses (Tasty Studios 13.10.2026, feste Regel aus dem Master «Website-Bau», 2.9 Nr. 11).
   Listen (<select>), Kalender (input type=date) und Uhrzeit (input type=time) klappen nie mehr als Auswahl des Browsers auf, sondern als
   helle Tafel des Hauses: Gelasio, Kante in Balkenbraun, gewählt in dunklem Holz. Gestaltung: assets/css/wahl.css.
   Das echte Feld bleibt unsichtbar im Formular und trägt den Wert (jjjj-mm-tt, hh:mm, value der Liste). Darum laufen Buchung, Rechner,
   Mail-Anfragen und der Chat unverändert; jede Wahl löst «input» und «change» aus. min, max und step der Felder gelten.
   Gehören zwei Datumsfelder zusammen (name="an" und name="ab" im selben Formular), zeigt der Kalender den Zeitraum und öffnet nach der Anreise die Abreise.
   Auch Felder, die später dazukommen (Chat, Rechner), werden übernommen. Ausgenommen ist nur, was in [data-eigene-wahl] steht.
   Tastatur: Pfeile, Bild auf/ab, Pos1/Ende, Anfangsbuchstabe, Enter, Escape, Tab. Bewegung nur über transform. Prüfung: node _qa/wahl_pruef.js */
(function () {
  'use strict';
  var doc = document, LANG = doc.documentElement.lang || 'de-CH', SP = LANG.slice(0, 2).toLowerCase();
  var ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH', it: 'it-CH' }[SP] || 'de-CH';
  var W = { de: ['Vorheriger Monat', 'Nächster Monat', 'Stunde', 'Minute', 'Datum wählen', 'Uhrzeit wählen', ' Uhr'],
            en: ['Previous month', 'Next month', 'Hour', 'Minute', 'Choose a date', 'Choose a time', ''],
            fr: ['Mois précédent', 'Mois suivant', 'Heure', 'Minute', 'Choisir une date', 'Choisir une heure', ''],
            it: ['Mese precedente', 'Mese successivo', 'Ora', 'Minuto', 'Scegliere una data', 'Scegliere un’ora', ''] }[SP] || null;
  if (!W) W = ['Vorheriger Monat', 'Nächster Monat', 'Stunde', 'Minute', 'Datum wählen', 'Uhrzeit wählen', ' Uhr'];
  var fMonat, fTag, fLang, fKurz, fZahl;
  try {
    fMonat = new Intl.DateTimeFormat(ORT, { month: 'long' }); fTag = new Intl.DateTimeFormat(ORT, { weekday: 'short' });
    fLang = new Intl.DateTimeFormat(ORT, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    fKurz = new Intl.DateTimeFormat(ORT, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    fZahl = new Intl.DateTimeFormat(ORT, { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return; }
  var CHEV = '<svg class="rhw-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  var KAL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11v9.5h-11zM2.5 6.8h11M5.3 2.3v3M10.7 2.3v3"/></svg>';
  var UHR = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.5"/></svg>';
  var PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
  var lies = function (s) { var p = (s || '').split('-'); return p.length === 3 && +p[0] ? new Date(+p[0], p[1] - 1, +p[2]) : null; };
  var minuten = function (s) { return /^\d\d:\d\d/.test(s || '') ? +s.slice(0, 2) * 60 + +s.slice(3, 5) : null; };
  var offen = null, nr = 0;

  /* ---------- Gemeinsames: Feld einkleiden, Tafel öffnen, legen, schliessen ---------- */
  function titelVon(el) {
    var lab = el.closest('label'), sp = lab && lab.querySelector('span');
    return (sp ? sp.textContent : el.getAttribute('aria-label') || '').trim();
  }
  function huelle(el, zeichen) {
    var h = doc.createElement('span'); h.className = 'rhw';
    el.parentNode.insertBefore(h, el); h.appendChild(el);
    el.classList.add('rhw-nativ'); el.tabIndex = -1; el.setAttribute('aria-hidden', 'true');
    var k = doc.createElement('button'); k.type = 'button'; k.className = 'rhw-knopf';
    k.innerHTML = '<b class="rhw-wert"></b>' + zeichen;
    h.appendChild(k);
    /* Schrift und Farbe des Feldes übernehmen. Mehrmals: sofort, wenn die Stylesheets da sind, wenn die Schriften da sind.
       Läuft das Skript vor dem Stylesheet, hätte der Knopf sonst das Aussehen des Systems. */
    el._rhwKleide = function () {
      var cs = getComputedStyle(el);
      k.style.fontFamily = cs.fontFamily; k.style.fontSize = cs.fontSize; k.style.fontWeight = cs.fontWeight; k.style.color = cs.color; k.style.letterSpacing = cs.letterSpacing;
    };
    el._rhwKleide();
    var lab = el.closest('label');
    if (lab) lab.addEventListener('click', function (e) {   /* Klick auf Beschriftung oder Feldrand öffnet unsere Auswahl, nie die des Browsers */
      if (k.contains(e.target) || (offen && offen.pop.contains(e.target))) return;
      e.preventDefault(); k.click();
    });
    return { h: h, k: k };
  }
  function oeffne(z, inhalt, art) {
    schliesse(false);
    var pop = doc.createElement('div'); pop.className = 'rhw-pop rhw-pop--' + art;
    pop.innerHTML = '<div class="rhw-karte" role="' + (art === 'liste' ? 'presentation' : 'dialog') + '"></div>';
    var karte = pop.firstChild; if (z.titel && art !== 'liste') karte.setAttribute('aria-label', z.titel);
    (z.el.closest('dialog[open]') || doc.body).appendChild(pop);
    offen = { z: z, pop: pop, karte: karte, art: art };
    inhalt(karte);
    z.k.setAttribute('aria-expanded', 'true'); z.h.classList.add('rhw--offen'); z.h.classList.remove('rhw--fehlt');
    lege();
    requestAnimationFrame(function () { pop.classList.add('rhw-auf'); });
    addEventListener('scroll', mit, true); addEventListener('resize', mit);
  }
  var takt = 0;
  function mit(e) { if (!offen || takt || (e && e.target && e.target.nodeType === 1 && offen.pop.contains(e.target))) return; takt = requestAnimationFrame(function () { takt = 0; lege(); }); }
  function lege() {
    if (!offen) return;
    var pop = offen.pop, feld = offen.z.h.closest('label,.feld') || offen.z.h, r = feld.getBoundingClientRect();
    var vw = doc.documentElement.clientWidth, vh = window.innerHeight;
    if (offen.art === 'liste') pop.style.width = Math.min(Math.max(r.width, 236), vw - 16) + 'px';
    var b = pop.offsetWidth, h = pop.offsetHeight;
    var x = Math.max(8, Math.min(r.left, vw - b - 8));
    var unten = r.bottom + 8 + h <= vh - 6, oben = r.top - 8 - h >= 6;
    var y = unten ? r.bottom + 8 : oben ? r.top - 8 - h : Math.max(6, Math.round((vh - h) / 2));
    pop.classList.toggle('rhw-oben', !unten && oben);
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    var ist = pop.getBoundingClientRect();   /* steht die Tafel in einem Fenster mit eigener Lage (Dialog), die Abweichung ausgleichen */
    if (Math.abs(ist.left - x) > .5 || Math.abs(ist.top - y) > .5) { pop.style.left = (x + x - ist.left) + 'px'; pop.style.top = (y + y - ist.top) + 'px'; }
  }
  function schliesse(fokus) {
    var o = offen; if (!o) return;
    offen = null; o.z.k.setAttribute('aria-expanded', 'false'); o.z.h.classList.remove('rhw--offen');
    removeEventListener('scroll', mit, true); removeEventListener('resize', mit);
    if (o.pop.parentNode) o.pop.parentNode.removeChild(o.pop);
    if (fokus) o.z.k.focus({ preventScroll: true });
  }
  function melde(el) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  doc.addEventListener('cancel', function (e) { if (offen && e.target.contains && e.target.contains(offen.pop)) { e.preventDefault(); schliesse(true); } }, true);   /* Escape im Buchungsfenster schliesst erst die Tafel */
  doc.addEventListener('close', function (e) { if (offen && e.target.contains && e.target.contains(offen.pop)) schliesse(false); }, true);
  doc.addEventListener('pointerdown', function (e) { if (offen && !offen.pop.contains(e.target) && !offen.z.h.contains(e.target) && !(offen.z.h.closest('label') || offen.z.h).contains(e.target)) schliesse(false); }, true);

  /* ---------- Listen ---------- */
  function baueListe(s) {
    if (s._rhw || s.multiple || s.size > 1 || s.closest('[data-eigene-wahl]') || !s.parentNode) return;
    var t = huelle(s, CHEV), z = { el: s, h: t.h, k: t.k, art: 'liste', titel: titelVon(s), j: 0, id: 'rhw' + (++nr) };
    s._rhw = z;
    z.k.setAttribute('aria-haspopup', 'listbox'); z.k.setAttribute('aria-expanded', 'false');
    z.k.addEventListener('click', function () { offen && offen.z === z ? schliesse(true) : aufListe(z); });
    z.k.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); aufListe(z); } });
    s.addEventListener('change', function () { zeigeListe(z); });
    if (s.form) s.form.addEventListener('reset', function () { setTimeout(function () { zeigeListe(z); }, 0); });
    zeigeListe(z);
  }
  function zeigeListe(z) {
    var o = z.el.options[z.el.selectedIndex], t = o ? o.textContent : '';
    var w = z.k.querySelector('.rhw-wert'); if (w.textContent !== t) w.textContent = t;
    z.k.setAttribute('aria-label', (z.titel ? z.titel + ': ' : '') + t);
  }
  function aufListe(z) {
    oeffne(z, function (karte) {
      var l = doc.createElement('ul'); l.className = 'rhw-liste'; l.id = z.id; l.setAttribute('role', 'listbox'); l.tabIndex = -1;
      if (z.titel) l.setAttribute('aria-label', z.titel);
      [].forEach.call(z.el.options, function (o, i) {
        if (o.hidden) return;
        var li = doc.createElement('li'); li.setAttribute('role', 'option'); li.dataset.i = i; li.setAttribute('aria-selected', String(i === z.el.selectedIndex));
        if (o.disabled) li.setAttribute('aria-disabled', 'true');
        li.textContent = o.textContent; l.appendChild(li);
      });
      karte.appendChild(l); z.l = l;
      l.addEventListener('click', function (e) { var o = e.target.closest('[role=option]'); if (o) waehle(z, +o.dataset.i); });
      l.addEventListener('mousemove', function (e) { var o = e.target.closest('[role=option]'); if (o && +o.dataset.i !== z.j) markiere(z, +o.dataset.i, true); });
      l.addEventListener('keydown', function (e) { tasteListe(z, e); });
    }, 'liste');
    markiere(z, Math.max(0, z.el.selectedIndex));
    z.l.focus({ preventScroll: true });
  }
  function markiere(z, i, ohneRollen) {
    var lis = [].slice.call(z.l.children); if (!lis.length) return;
    var li = z.l.querySelector('[data-i="' + i + '"]') || lis[0];
    lis.forEach(function (x) { x.classList.toggle('rhw-hier', x === li); });
    z.j = +li.dataset.i;
    if (ohneRollen) return;
    var r = li.getBoundingClientRect(), rl = z.l.getBoundingClientRect();
    if (r.bottom > rl.bottom) z.l.scrollTop += r.bottom - rl.bottom; else if (r.top < rl.top) z.l.scrollTop -= rl.top - r.top;
  }
  function waehle(z, i) {
    var o = z.el.options[i]; if (!o || o.disabled) return;
    var neu = z.el.selectedIndex !== i; z.el.selectedIndex = i;
    if (neu) melde(z.el);
    zeigeListe(z); schliesse(true);
  }
  var suche = '', suchUhr = 0;
  function tasteListe(z, e) {
    var lis = [].slice.call(z.l.children).filter(function (x) { return !x.hasAttribute('aria-disabled'); }); if (!lis.length) return;
    var pos = lis.findIndex(function (x) { return +x.dataset.i === z.j; });
    if (e.key === 'ArrowDown') { e.preventDefault(); markiere(z, +lis[Math.min(lis.length - 1, pos + 1)].dataset.i); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); markiere(z, +lis[Math.max(0, pos - 1)].dataset.i); }
    else if (e.key === 'Home') { e.preventDefault(); markiere(z, +lis[0].dataset.i); }
    else if (e.key === 'End') { e.preventDefault(); markiere(z, +lis[lis.length - 1].dataset.i); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); waehle(z, z.j); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliesse(true); }
    else if (e.key === 'Tab') { schliesse(false); }
    else if (e.key.length === 1) {
      clearTimeout(suchUhr); suche += e.key.toLowerCase(); suchUhr = setTimeout(function () { suche = ''; }, 700);
      var t = lis.find(function (x) { return x.textContent.trim().toLowerCase().replace(/^[«"„]/, '').indexOf(suche) === 0; }); if (t) markiere(z, +t.dataset.i);
    }
  }

  /* ---------- Datum und Uhrzeit ---------- */
  function ruest(i) {
    if (i._rhw || (i.type !== 'date' && i.type !== 'time') || i.closest('[data-eigene-wahl]') || !i.parentNode) return;
    var art = i.type === 'date' ? 'datum' : 'zeit', t = huelle(i, art === 'datum' ? KAL : UHR);
    var z = { el: i, h: t.h, k: t.k, art: art, titel: titelVon(i) };
    i._rhw = z;
    z.k.setAttribute('aria-haspopup', 'dialog'); z.k.setAttribute('aria-expanded', 'false');
    z.k.addEventListener('click', function () { offen && offen.z === z ? schliesse(true) : (art === 'datum' ? aufKalender(z) : aufZeit(z)); });
    z.k.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); z.k.click(); } });
    ['input', 'change'].forEach(function (ev) { i.addEventListener(ev, function () { zeigeFeld(z); }); });
    if (i.form) i.form.addEventListener('reset', function () { setTimeout(function () { zeigeFeld(z); }, 0); });
    /* Pflichtfeld leer: statt der Sprechblase des Browsers die eigene Auswahl öffnen (nur das erste Feld je Absenden) */
    i.addEventListener('invalid', function (e) {
      e.preventDefault(); z.h.classList.add('rhw--fehlt');
      if (!ruest.gemeldet) { ruest.gemeldet = 1; setTimeout(function () { ruest.gemeldet = 0; z.k.scrollIntoView({ block: 'center', behavior: 'smooth' }); z.k.click(); }, 0); }
    });
    zeigeFeld(z);
  }
  function zeigeFeld(z) {
    var v = z.el.value, w = z.k.querySelector('.rhw-wert'), t, lang = '';
    if (z.art === 'datum') { var d = lies(v); t = d ? fKurz.format(d).replace(/^([^\s,.]+)\.,?/, '$1,') : W[4]; lang = d ? fLang.format(d) : W[4]; z.kurz = d ? fZahl.format(d) : ''; }
    else { t = v ? v.slice(0, 5) + W[6] : W[5]; lang = t; z.kurz = v ? v.slice(0, 5) : ''; }
    z.voll = t; z.gezeigt = v;
    if (w.textContent !== t) w.textContent = t;
    z.h.classList.toggle('rhw-leer', !v); if (v) z.h.classList.remove('rhw--fehlt');
    z.k.setAttribute('aria-label', (z.titel ? z.titel + ': ' : '') + lang);
    passe(z);
  }
  function passe(z) {   /* passt die lange Schreibweise nicht ins Feld, die kurze nehmen (13.10.2026 statt Di, 13. Okt. 2026) */
    var w = z.k.querySelector('.rhw-wert'); if (!z.kurz || !w.clientWidth) return;
    if (w.textContent !== z.voll) w.textContent = z.voll;
    if (w.scrollWidth > w.clientWidth + 1) w.textContent = z.kurz;
  }
  function partner(z) {   /* Anreise und Abreise im selben Formular gehören zusammen */
    var f = z.el.form, n = z.el.name; if (!f || (n !== 'an' && n !== 'ab')) return null;
    var p = f.elements[n === 'an' ? 'ab' : 'an']; return p && p.type === 'date' ? p : null;
  }
  function grenze(i, d) { var mn = lies(i.min), mx = lies(i.max); if (mn && d < mn) return mn; if (mx && d > mx) return mx; return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function aufKalender(z) {
    var d = lies(z.el.value) || grenze(z.el, new Date());
    z.blick = new Date(d.getFullYear(), d.getMonth(), 1); z.hier = d;
    oeffne(z, function (karte) {
      karte.addEventListener('keydown', function (e) { tasteKalender(z, e); });
      karte.addEventListener('click', function (e) {
        var p = e.target.closest('[data-schritt]'), tg = e.target.closest('.rhw-tag');
        if (p && !p.disabled) {
          var ri = p.getAttribute('data-schritt'); z.blick = new Date(z.blick.getFullYear(), z.blick.getMonth() + (+ri), 1); z.hier = z.blick; kalender(z, karte, true); lege();
          var np = karte.querySelector('[data-schritt="' + ri + '"]:not([disabled])') || karte.querySelector('.rhw-tag:not([disabled])'); if (np) np.focus({ preventScroll: true });
        }
        else if (tg && !tg.disabled) {
          z.el.value = tg.getAttribute('data-tag'); melde(z.el); zeigeFeld(z);
          var p2 = z.el.name === 'an' ? partner(z) : null;
          schliesse(!p2);
          if (p2 && p2._rhw) setTimeout(function () { zeigeFeld(p2._rhw); aufKalender(p2._rhw); }, 140);
        }
      });
      kalender(z, karte);
    }, 'datum');
  }
  function kalender(z, karte, pfeilFokus) {
    var i = z.el, mn = lies(i.min), mx = lies(i.max), wahl = lies(i.value), heute = iso(new Date()), b = z.blick, j = b.getFullYear(), m = b.getMonth();
    var p = partner(z), pd = p ? lies(p.value) : null, von = null, bis = null;
    if (wahl && pd) { von = i.name === 'an' ? wahl : pd; bis = i.name === 'an' ? pd : wahl; if (von >= bis) von = bis = null; }
    var vorAus = mn && new Date(j, m, 0) < mn, nachAus = mx && new Date(j, m + 1, 1) > mx;
    var h = (z.titel ? '<p class="rhw-titel">' + z.titel.replace(/</g, '&lt;') + '</p>' : '') +
      '<div class="rhw-kopf"><button type="button" class="rhw-pfeil rhw-pfeil--zur" data-schritt="-1" aria-label="' + W[0] + '"' + (vorAus ? ' disabled' : '') + '>' + PF + '</button>' +
      '<p class="rhw-monat" aria-live="polite"><b>' + fMonat.format(b) + '</b> ' + j + '</p>' +
      '<button type="button" class="rhw-pfeil" data-schritt="1" aria-label="' + W[1] + '"' + (nachAus ? ' disabled' : '') + '>' + PF + '</button></div><div class="rhw-wtage" aria-hidden="true">';
    for (var t = 0; t < 7; t++) h += '<span>' + fTag.format(new Date(2024, 0, 1 + t)).replace('.', '') + '</span>';   /* der 1.1.2024 war ein Montag */
    h += '</div><div class="rhw-raster" role="grid">';
    var leer = (new Date(j, m, 1).getDay() + 6) % 7, n = new Date(j, m + 1, 0).getDate();
    for (t = 0; t < leer; t++) h += '<span></span>';
    for (t = 1; t <= n; t++) {
      var d = new Date(j, m, t), s = iso(d), aus = (mn && d < mn) || (mx && d > mx), kl = 'rhw-tag';
      if (s === heute) kl += ' rhw-tag--heute';
      if (von && d > von && d < bis) kl += ' rhw-tag--zw';
      if (pd && iso(pd) === s && !(wahl && iso(wahl) === s)) kl += ' rhw-tag--ende';
      h += '<button type="button" class="' + kl + '" data-tag="' + s + '"' + (wahl && iso(wahl) === s ? ' aria-pressed="true"' : '') + (aus ? ' disabled' : '') + ' aria-label="' + fLang.format(d) + '" tabindex="-1">' + t + '</button>';
    }
    karte.innerHTML = h + '</div>';
    var ziel = pfeilFokus === true ? null : (karte.querySelector('[data-tag="' + iso(z.hier) + '"]:not([disabled])') || karte.querySelector('.rhw-tag[aria-pressed]:not([disabled])') || karte.querySelector('.rhw-tag:not([disabled])'));
    var erst = karte.querySelector('[data-tag="' + iso(z.hier) + '"]:not([disabled])') || karte.querySelector('.rhw-tag:not([disabled])'); if (erst) erst.tabIndex = 0;
    if (ziel) setTimeout(function () { if (offen && offen.z === z) ziel.focus({ preventScroll: true }); }, 30);
  }
  function tasteKalender(z, e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliesse(true); return; }
    if (e.key === 'Tab') { schliesse(false); return; }
    var a = doc.activeElement, d = a && a.getAttribute && lies(a.getAttribute('data-tag')); if (!d) return;
    var plus = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate()); }
    else if (e.key === 'Home') { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth(), 1); }
    else if (e.key === 'End') { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth() + 1, 0); }
    else if (plus) { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + plus); }
    else return;
    d = grenze(z.el, d); z.hier = d; z.blick = new Date(d.getFullYear(), d.getMonth(), 1); kalender(z, offen.karte); lege();
  }

  /* Uhrzeit: Stunden und Minuten nebeneinander. Schritt aus step (Sekunden), Grenzen aus min und max (Öffnungszeit). */
  function aufZeit(z) {
    var i = z.el, mn = minuten(i.min), mx = minuten(i.max);
    var schritt = Math.max(1, Math.min(30, Math.round((+i.step || 900) / 60))); if (60 % schritt) schritt = 5;
    var jetzt = minuten(i.value); if (jetzt === null) jetzt = mn !== null ? mn : 12 * 60;
    if (mn !== null && jetzt < mn) jetzt = mn; if (mx !== null && jetzt > mx) jetzt = mx;
    z.hh = Math.floor(jetzt / 60); z.mm = Math.round((jetzt % 60) / schritt) * schritt % 60;
    var geht = function (h, m) { var t = h * 60 + m; return (mn === null || t >= mn) && (mx === null || t <= mx); };
    var stundeGeht = function (h) { for (var m = 0; m < 60; m += schritt) if (geht(h, m)) return true; return false; };
    function male(karte, fokus) {
      var h = (z.titel ? '<p class="rhw-titel">' + z.titel.replace(/</g, '&lt;') + '</p>' : '') + '<div class="rhw-zeit"><div class="rhw-spalte" role="listbox" aria-label="' + W[2] + '" data-teil="h">';
      for (var t = 0; t < 24; t++) if (stundeGeht(t) || (mn === null && mx === null)) h += '<button type="button" role="option" class="rhw-z" data-w="' + t + '" aria-selected="' + (t === z.hh) + '" tabindex="' + (t === z.hh ? 0 : -1) + '">' + zwei(t) + '</button>';
      h += '</div><i class="rhw-punkt" aria-hidden="true">:</i><div class="rhw-spalte" role="listbox" aria-label="' + W[3] + '" data-teil="m">';
      for (t = 0; t < 60; t += schritt) h += '<button type="button" role="option" class="rhw-z" data-w="' + t + '" aria-selected="' + (t === z.mm) + '" tabindex="' + (t === z.mm ? 0 : -1) + '"' + (geht(z.hh, t) ? '' : ' disabled') + '>' + zwei(t) + '</button>';
      karte.innerHTML = h + '</div></div>';
      [].forEach.call(karte.querySelectorAll('.rhw-spalte'), function (sp) { var a = sp.querySelector('[aria-selected=true]'); if (a) sp.scrollTop = a.offsetTop - sp.offsetTop - sp.clientHeight / 2 + a.offsetHeight / 2; });
      var e = karte.querySelector('[data-teil=' + (fokus || 'h') + '] [aria-selected=true]') || karte.querySelector('[data-teil=' + (fokus || 'h') + '] .rhw-z:not([disabled])');
      if (e) setTimeout(function () { if (offen && offen.z === z) e.focus({ preventScroll: true }); }, 30);
    }
    oeffne(z, function (karte) {
      karte.addEventListener('click', function (e) {
        var zz = e.target.closest('.rhw-z'); if (!zz || zz.disabled) return;
        var teil = zz.parentNode.getAttribute('data-teil');
        if (teil === 'h') {
          z.hh = +zz.getAttribute('data-w');
          if (!geht(z.hh, z.mm)) { var best = null; for (var m = 0; m < 60; m += schritt) if (geht(z.hh, m) && (best === null || Math.abs(m - z.mm) < Math.abs(best - z.mm))) best = m; if (best !== null) z.mm = best; }
        } else z.mm = +zz.getAttribute('data-w');
        i.value = zwei(z.hh) + ':' + zwei(z.mm); melde(i); zeigeFeld(z);
        if (teil === 'm') schliesse(true); else male(karte, 'm');
      });
      karte.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); schliesse(true); return; }
        if (e.key === 'Tab') { schliesse(false); return; }
        var a = doc.activeElement; if (!a || !a.classList || !a.classList.contains('rhw-z')) return;
        var n = null, x = a;
        if (e.key === 'ArrowDown') { do { x = x.nextElementSibling; } while (x && x.disabled); n = x; }
        else if (e.key === 'ArrowUp') { do { x = x.previousElementSibling; } while (x && x.disabled); n = x; }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { n = karte.querySelector('[data-teil=' + (a.parentNode.getAttribute('data-teil') === 'h' ? 'm' : 'h') + '] [aria-selected=true]:not([disabled])') || karte.querySelector('[data-teil=' + (a.parentNode.getAttribute('data-teil') === 'h' ? 'm' : 'h') + '] .rhw-z:not([disabled])'); }
        else return;
        e.preventDefault(); if (n) n.focus();
      });
      male(karte);
    }, 'zeit');
  }

  /* ---------- Alles einsammeln, auch was später dazukommt oder von anderen Skripten gesetzt wird ---------- */
  function alle(wurzel) {
    var w = wurzel || doc;
    [].forEach.call(w.querySelectorAll('select'), baueListe);
    [].forEach.call(w.querySelectorAll('input[type=date],input[type=time]'), ruest);
  }
  function nachziehen() {   /* Werte, die ein anderes Skript direkt setzt (feld.value = …), und Listen, die später gefüllt werden */
    [].forEach.call(doc.querySelectorAll('.rhw-nativ'), function (el) {
      var z = el._rhw; if (!z) return;
      if (z.art === 'liste') zeigeListe(z); else if (z.gezeigt !== el.value) zeigeFeld(z); else passe(z);
    });
  }
  function neuKleiden() { [].forEach.call(doc.querySelectorAll('.rhw-nativ'), function (el) { if (el._rhwKleide) el._rhwKleide(); }); nachziehen(); }
  function start() { alle(); setTimeout(nachziehen, 80); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
  setInterval(nachziehen, 500);
  [].forEach.call(doc.querySelectorAll('link[rel=stylesheet]'), function (l) { l.addEventListener('load', neuKleiden); });
  window.addEventListener('load', neuKleiden); window.addEventListener('resize', function () { setTimeout(nachziehen, 60); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(neuKleiden);
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) {
      if (n.nodeType !== 1 || (n.classList && (n.classList.contains('rhw') || n.classList.contains('rhw-pop')))) return;
      if (n.tagName === 'SELECT') baueListe(n); else if (n.tagName === 'INPUT') ruest(n); else if (n.querySelector) alle(n);
    }); });
  }).observe(doc.documentElement, { childList: true, subtree: true });
  window.ruedihusWahl = { alle: alle, schliesse: schliesse };
})();
