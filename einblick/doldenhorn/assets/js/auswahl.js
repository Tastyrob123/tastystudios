/* Waldhotel Doldenhorn — Listen, Kalender und Uhrzeit im Stil des Hauses (Seitenbau 13.10.2026).
   Feste Regel: nichts klappt als Auswahl des Browsers auf. Jedes <select>, jedes Datumsfeld und jedes Zeitfeld der Seite bekommt die Auswahl des Hauses:
   Liste als Karte aus Elfenbein, Datum als Blatt vom Abreisskalender, Uhrzeit als Blatt mit zwei Spalten (Gestalt: assets/css/auswahl.css).
   Das echte Feld bleibt unsichtbar im Formular und trägt den Wert (Liste: value, Datum: jjjj-mm-tt, Zeit: hh:mm). Darum laufen Buchung, Rechner und
   Mail-Anfragen unverändert; jede Wahl löst «input» und «change» aus, min, max, step und required gelten weiter.
   Auch Felder, die ein anderes Skript später einfügt oder füllt, werden übernommen. Ausgenommen ist nur, was in [data-eigene-wahl] steht.
   Tastatur: Pfeile, Pos1/Ende, Bild auf/ab (Monat), Anfangsbuchstabe, Enter, Escape, Tab. Die Auswahl hängt am <body> oder im offenen <dialog>. */
(function () {
  'use strict';
  var doc = document, offen = null, nr = 0;
  var PF = '<svg class="dw-pf" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  var KAL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11v9.5h-11zM2.5 7h11M5.5 2v3M10.5 2v3"/></svg>';
  var UHR = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.6"/><path d="M8 4.8V8l2.2 1.4"/></svg>';
  var VOR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>', ZUR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
  var fMonat, fTag, fKurz, fLang;
  try {
    fMonat = new Intl.DateTimeFormat('de-CH', { month: 'long', year: 'numeric' }); fTag = new Intl.DateTimeFormat('de-CH', { weekday: 'short' });
    fKurz = new Intl.DateTimeFormat('de-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    fLang = new Intl.DateTimeFormat('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return; }
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
  var lies = function (s) { var p = (s || '').split('-'); return p.length === 3 && +p[0] ? new Date(+p[0], p[1] - 1, +p[2]) : null; };
  var melde = function (el) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };

  /* ---------- ein Feld übernehmen ---------- */
  function art(el) {
    if (el.tagName === 'SELECT') return el.multiple || el.size > 1 ? '' : 'liste';
    if (el.tagName === 'INPUT') return el.type === 'date' ? 'datum' : el.type === 'time' ? 'zeit' : '';
    return '';
  }
  function ruest(el) {
    var a = art(el);
    if (!a || el._dw || el.closest('[data-eigene-wahl]')) return;
    var huelle = doc.createElement('span'); huelle.className = 'dw dw--' + a;
    var k = doc.createElement('button'); k.type = 'button'; k.className = 'dw-knopf';
    k.innerHTML = '<b></b>' + (a === 'liste' ? PF : a === 'datum' ? KAL : UHR);
    var lab = el.closest('label'), sp = lab && lab.querySelector('span');
    var titel = (sp ? sp.textContent : el.getAttribute('aria-label') || '').trim();
    var st = { el: el, k: k, a: a, titel: titel, id: 'dw' + (++nr), huelle: huelle };
    el._dw = st;
    /* Schrift und Farbe des Feldes übernehmen, solange es noch sichtbar ist; noch einmal, wenn Stylesheets und Schriften da sind */
    st.kleide = function () {
      var cs = getComputedStyle(el);
      k.style.fontFamily = cs.fontFamily; k.style.fontSize = cs.fontSize; k.style.fontWeight = cs.fontWeight; k.style.letterSpacing = cs.letterSpacing; k.style.color = cs.color;
    };
    st.kleide();
    el.parentNode.insertBefore(huelle, el); huelle.appendChild(el); huelle.appendChild(k);
    el.classList.add('dw-nativ'); el.tabIndex = -1; el.setAttribute('aria-hidden', 'true');
    k.setAttribute('aria-haspopup', a === 'liste' ? 'listbox' : 'dialog'); k.setAttribute('aria-expanded', 'false');
    k.addEventListener('click', function (e) { e.preventDefault(); if (offen && offen.st === st) zu(true); else auf(st); });
    k.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); auf(st); } });
    if (lab) lab.addEventListener('click', function (e) {   /* ein Klick auf die Beschriftung öffnet die Auswahl des Hauses, nie das echte Feld */
      if (e.target.closest('.dw-knopf') || (offen && offen.f.contains(e.target))) return;
      if (e.target === el || e.target === lab || e.target === sp || e.target === huelle) { e.preventDefault(); k.click(); }
    });
    ['input', 'change'].forEach(function (ev) { el.addEventListener(ev, function () { zeige(st); }); });
    if (el.form) el.form.addEventListener('reset', function () { setTimeout(function () { zeige(st); }, 0); });
    zeige(st);
  }
  function wert(st) {
    var el = st.el;
    if (st.a === 'liste') { var o = el.options[el.selectedIndex]; return o ? o.textContent : ''; }
    if (st.a === 'datum') { var d = lies(el.value); return d ? fKurz.format(d).replace(/\./g, function (m, i, s) { return /\d/.test(s[i - 1] || '') ? '.' : ''; }) : ''; }
    return /^\d\d:\d\d/.test(el.value) ? el.value.slice(0, 5) + ' Uhr' : '';
  }
  function zeige(st) {
    var w = wert(st), b = st.k.firstChild;
    var t = w || (st.a === 'datum' ? 'Datum wählen' : st.a === 'zeit' ? 'Zeit wählen' : '');
    if (b.textContent !== t) b.textContent = t;
    st.k.classList.toggle('dw-leer', !w);
    var lang = st.a === 'datum' && lies(st.el.value) ? fLang.format(lies(st.el.value)) : t;
    st.k.setAttribute('aria-label', (st.titel ? st.titel + ': ' : '') + lang);
    st.gezeigt = st.el.value + '|' + t;
  }

  /* ---------- öffnen und schliessen ---------- */
  function auf(st) {
    zu(false);
    var wirt = st.el.closest('dialog[open]') || doc.body, f;
    if (st.a === 'liste') { f = doc.createElement('ul'); f.className = 'dw-liste'; f.setAttribute('role', 'listbox'); f.tabIndex = -1; }
    else { f = doc.createElement('div'); f.className = 'dw-blatt ' + (st.a === 'datum' ? 'dw-kal' : 'dw-zeit'); f.setAttribute('role', 'dialog'); }
    f.id = st.id; if (st.titel) f.setAttribute('aria-label', st.titel);
    wirt.appendChild(f);
    offen = { st: st, f: f, fest: wirt !== doc.body };
    if (offen.fest) f.classList.add('dw-fest');
    st.k.setAttribute('aria-expanded', 'true'); st.k.setAttribute('aria-controls', st.id); st.huelle.classList.add('dw--offen');
    if (st.a === 'liste') liste();
    else if (st.a === 'datum') { var d = lies(st.el.value) || grenze(st.el, new Date()); offen.blick = new Date(d.getFullYear(), d.getMonth(), 1); offen.hier = d; kalender(); }
    else zeit();
    lage();
    requestAnimationFrame(function () { f.classList.add('dw-auf'); });
    f.addEventListener('keydown', taste);
    addEventListener('scroll', mit, true); addEventListener('resize', mit);
  }
  function zu(fokus) {
    var o = offen; if (!o) return;
    offen = null; o.st.k.setAttribute('aria-expanded', 'false'); o.st.huelle.classList.remove('dw--offen'); o.f.classList.remove('dw-auf');
    removeEventListener('scroll', mit, true); removeEventListener('resize', mit);
    setTimeout(function () { if (o.f.parentNode) o.f.parentNode.removeChild(o.f); }, 300);
    if (fokus) o.st.k.focus({ preventScroll: true });
  }
  var takt = 0;
  function mit(e) {   /* im offenen Fenster (fest) wandert die Auswahl mit dem Feld; auf der Seite steht sie an ihrer Stelle und scrollt von selbst mit */
    if (!offen || takt || (e && e.target && e.target.nodeType === 1 && offen.f.contains(e.target))) return;
    if (!offen.fest && e && e.type === 'scroll') return;
    takt = requestAnimationFrame(function () { takt = 0; lage(); });
  }
  function lage() {
    var o = offen; if (!o) return;
    var f = o.f, feld = o.st.huelle.closest('label,.feld') || o.st.huelle, r = feld.getBoundingClientRect();
    var vw = doc.documentElement.clientWidth, vh = window.innerHeight, platzU = vh - r.bottom - 18, platzO = r.top - 18;
    if (o.st.a === 'liste') {   /* die Liste nimmt die Seite mit mehr Platz und wird nie höher als dieser Platz: sie bleibt ganz im Bild und rollt innen */
      f.style.width = Math.max(r.width, Math.min(250, vw - 20)) + 'px';
      f.style.maxHeight = '';
      var voll = f.scrollHeight + 2, grenzeH = Math.min(430, vh * 0.54);
      var untenL = platzU >= Math.min(voll, grenzeH) || platzU >= platzO;
      f.style.maxHeight = Math.max(120, Math.min(grenzeH, untenL ? platzU : platzO)) + 'px';
    }
    var b = f.offsetWidth, h = f.offsetHeight;
    var x = Math.max(10, Math.min(r.left, vw - b - 10));
    var unten = o.st.a === 'liste' ? untenL : (platzU >= h || platzU >= platzO), y = unten ? r.bottom + 10 : r.top - 10 - h;
    y = Math.max(8, Math.min(y, vh - h - 8));   /* Kalender und Uhrzeit haben eine feste Höhe: reicht der Platz auf keiner Seite, rücken sie ins Bild */
    f.classList.toggle('dw-oben', !unten);
    if (o.fest) { f.style.left = x + 'px'; f.style.top = y + 'px'; }
    else { f.style.left = (x + window.scrollX) + 'px'; f.style.top = (y + window.scrollY) + 'px'; }
  }
  function grenze(el, d) { var mn = lies(el.min), mx = lies(el.max); if (mn && d < mn) return mn; if (mx && d > mx) return mx; return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function setze(st, w) { st.el.value = w; melde(st.el); zeige(st); }

  /* ---------- Liste ---------- */
  function liste() {
    var o = offen, s = o.st.el, h = '';
    [].forEach.call(s.options, function (op, i) {
      if (op.hidden) return;
      h += '<li role="option" data-i="' + i + '" aria-selected="' + (i === s.selectedIndex) + '"' + (op.disabled ? ' aria-disabled="true"' : '') + '></li>';
    });
    o.f.innerHTML = h;
    [].forEach.call(o.f.children, function (li) { li.textContent = s.options[+li.getAttribute('data-i')].textContent; });
    markiere(Math.max(0, s.selectedIndex));
    setTimeout(function () { if (offen === o) o.f.focus({ preventScroll: true }); }, 20);
  }
  function markiere(i) {
    var o = offen, lis = [].slice.call(o.f.children); if (!lis.length) return;
    var li = o.f.querySelector('[data-i="' + i + '"]') || lis[0];
    lis.forEach(function (x) { x.classList.toggle('dw-hier', x === li); });
    o.j = +li.getAttribute('data-i');
    var r = li.getBoundingClientRect(), rl = o.f.getBoundingClientRect();
    if (r.bottom > rl.bottom) o.f.scrollTop += r.bottom - rl.bottom; else if (r.top < rl.top) o.f.scrollTop -= rl.top - r.top;
  }
  function waehle(i) {
    var o = offen, s = o.st.el, op = s.options[i]; if (!op || op.disabled) return;
    s.selectedIndex = i; melde(s); zeige(o.st); zu(true);
  }

  /* ---------- Kalender: ein Monat, Woche ab Montag ---------- */
  function kalender() {
    var o = offen, el = o.st.el, mn = lies(el.min), mx = lies(el.max), wahl = lies(el.value), heute = iso(new Date()), b = o.blick, j = b.getFullYear(), m = b.getMonth();
    var h = '<div class="dw-kopf"><button type="button" class="dw-pfeil" data-schritt="-1" aria-label="Vorheriger Monat">' + ZUR + '</button><p>' + fMonat.format(b) + '</p><button type="button" class="dw-pfeil" data-schritt="1" aria-label="Nächster Monat">' + VOR + '</button></div><div class="dw-tage" aria-hidden="true">';
    for (var t = 0; t < 7; t++) h += '<span>' + fTag.format(new Date(2024, 0, 1 + t)).replace('.', '') + '</span>';   /* der 1.1.2024 war ein Montag */
    h += '</div><div class="dw-raster" role="grid">';
    var leer = (new Date(j, m, 1).getDay() + 6) % 7, n = new Date(j, m + 1, 0).getDate();
    for (t = 0; t < leer; t++) h += '<span></span>';
    for (t = 1; t <= n; t++) {
      var d = new Date(j, m, t), s = iso(d), aus = (mn && d < mn) || (mx && d > mx);
      h += '<button type="button" class="dw-tag' + (s === heute ? ' dw-tag--heute' : '') + '" data-tag="' + s + '"' + (wahl && iso(wahl) === s ? ' aria-pressed="true"' : '') + (aus ? ' disabled' : '') + ' aria-label="' + fLang.format(d) + '" tabindex="-1">' + t + '</button>';
    }
    o.f.innerHTML = h + '</div>';
    var ziel = o.f.querySelector('[data-tag="' + iso(o.hier) + '"]:not([disabled])') || o.f.querySelector('.dw-tag[aria-pressed]') || o.f.querySelector('.dw-tag:not([disabled])');
    if (ziel) { ziel.tabIndex = 0; setTimeout(function () { if (offen === o) ziel.focus({ preventScroll: true }); }, 20); }
  }
  /* ---------- Uhrzeit: Stunden und Minuten nebeneinander, Schritt aus dem Feld (step in Sekunden) ---------- */
  function zeit() {
    var o = offen, el = o.st.el, w = /^\d\d:\d\d/.test(el.value) ? el.value : '12:00', hh = +w.slice(0, 2), mm = +w.slice(3, 5);
    var schritt = Math.max(1, Math.min(30, Math.round((+el.step || 900) / 60))); if (60 % schritt) schritt = 5;
    mm = Math.round(mm / schritt) * schritt % 60;
    var h = '<div class="dw-kopf dw-kopf--zeit"><p>Uhrzeit</p></div><div class="dw-spalten"><div class="dw-spalte" role="listbox" aria-label="Stunde" data-teil="h">';
    for (var t = 0; t < 24; t++) h += '<button type="button" role="option" class="dw-z" data-w="' + t + '" aria-selected="' + (t === hh) + '" tabindex="' + (t === hh ? 0 : -1) + '">' + zwei(t) + '</button>';
    h += '</div><i class="dw-doppel" aria-hidden="true">:</i><div class="dw-spalte" role="listbox" aria-label="Minute" data-teil="m">';
    for (t = 0; t < 60; t += schritt) h += '<button type="button" role="option" class="dw-z" data-w="' + t + '" aria-selected="' + (t === mm) + '" tabindex="' + (t === mm ? 0 : -1) + '">' + zwei(t) + '</button>';
    o.f.innerHTML = h + '</div></div>';
    o.hh = hh; o.mm = mm;
    [].forEach.call(o.f.querySelectorAll('.dw-spalte'), function (sp) { var a = sp.querySelector('[aria-selected=true]'); if (a) sp.scrollTop = a.offsetTop - sp.offsetTop - sp.clientHeight / 2 + a.offsetHeight / 2; });
    var e1 = o.f.querySelector('[data-teil=h] [aria-selected=true]'); if (e1) setTimeout(function () { if (offen === o) e1.focus({ preventScroll: true }); }, 20);
  }

  /* ---------- Klicks und Tasten ---------- */
  doc.addEventListener('click', function (e) {
    var o = offen; if (!o || !o.f.contains(e.target)) return;
    var li = e.target.closest('[role=option][data-i]'), p = e.target.closest('[data-schritt]'), tg = e.target.closest('.dw-tag'), zz = e.target.closest('.dw-z');
    if (li) waehle(+li.getAttribute('data-i'));
    else if (p) { o.blick = new Date(o.blick.getFullYear(), o.blick.getMonth() + (+p.getAttribute('data-schritt')), 1); o.hier = o.blick; kalender(); lage(); }
    else if (tg && !tg.disabled) { setze(o.st, tg.getAttribute('data-tag')); zu(true); }
    else if (zz) {
      var teil = zz.parentNode.getAttribute('data-teil'); if (teil === 'h') o.hh = +zz.getAttribute('data-w'); else o.mm = +zz.getAttribute('data-w');
      [].forEach.call(zz.parentNode.children, function (x) { x.setAttribute('aria-selected', String(x === zz)); x.tabIndex = x === zz ? 0 : -1; });
      setze(o.st, zwei(o.hh) + ':' + zwei(o.mm));
      if (teil === 'm') zu(true); else { var m = o.f.querySelector('[data-teil=m] [aria-selected=true]'); if (m) m.focus({ preventScroll: true }); }
    }
  });
  doc.addEventListener('mousemove', function (e) { var o = offen; if (!o || o.st.a !== 'liste') return; var li = e.target.closest && e.target.closest('.dw-liste [data-i]'); if (li && o.f.contains(li) && +li.getAttribute('data-i') !== o.j) markiere(+li.getAttribute('data-i')); });
  var suche = '', suchUhr = 0;
  function taste(e) {
    var o = offen; if (!o) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); zu(true); return; }
    if (e.key === 'Tab') { zu(false); return; }
    if (o.st.a === 'liste') {
      var lis = [].slice.call(o.f.children).filter(function (x) { return !x.hasAttribute('aria-disabled'); }), pos = -1;
      lis.forEach(function (x, n) { if (+x.getAttribute('data-i') === o.j) pos = n; });
      if (e.key === 'ArrowDown') { e.preventDefault(); markiere(+lis[Math.min(lis.length - 1, pos + 1)].getAttribute('data-i')); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); markiere(+lis[Math.max(0, pos - 1)].getAttribute('data-i')); }
      else if (e.key === 'Home') { e.preventDefault(); markiere(+lis[0].getAttribute('data-i')); }
      else if (e.key === 'End') { e.preventDefault(); markiere(+lis[lis.length - 1].getAttribute('data-i')); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); waehle(o.j); }
      else if (e.key.length === 1) {
        clearTimeout(suchUhr); suche += e.key.toLowerCase(); suchUhr = setTimeout(function () { suche = ''; }, 700);
        var t = lis.filter(function (x) { return x.textContent.trim().toLowerCase().indexOf(suche) === 0; })[0]; if (t) markiere(+t.getAttribute('data-i'));
      }
    } else if (o.st.a === 'datum') {
      var a = doc.activeElement, d = a && a.getAttribute && lies(a.getAttribute('data-tag')); if (!d) return;
      var plus = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate()); }
      else if (plus) { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + plus); }
      else return;
      d = grenze(o.st.el, d); o.hier = d; o.blick = new Date(d.getFullYear(), d.getMonth(), 1); kalender(); lage();
    } else {
      var z = doc.activeElement; if (!z || !z.classList || !z.classList.contains('dw-z')) return;
      var n2 = e.key === 'ArrowDown' ? z.nextElementSibling : e.key === 'ArrowUp' ? z.previousElementSibling : null;
      if (n2) { e.preventDefault(); n2.focus(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var and = o.f.querySelector('[data-teil=' + (z.parentNode.getAttribute('data-teil') === 'h' ? 'm' : 'h') + '] [aria-selected=true]'); if (and) and.focus(); }
    }
  }
  doc.addEventListener('pointerdown', function (e) { if (offen && !offen.f.contains(e.target) && !offen.st.k.contains(e.target)) zu(false); }, true);

  /* ---------- alle Felder der Seite, auch später eingefügte; Werte, die ein Skript direkt setzt, zieht der nächste Blick nach ---------- */
  var WAS = 'select,input[type=date],input[type=time]';
  function alle(w) { [].forEach.call((w || doc).querySelectorAll(WAS), ruest); }
  function nach() { [].forEach.call(doc.querySelectorAll('.dw-nativ'), function (el) { var st = el._dw; if (st && st.gezeigt !== el.value + '|' + st.k.firstChild.textContent) zeige(st); if (st && st.a === 'liste' && st.k.firstChild.textContent !== wert(st)) zeige(st); }); }
  function neuKleiden() { [].forEach.call(doc.querySelectorAll('.dw-nativ'), function (el) { if (el._dw) el._dw.kleide(); }); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { alle(); }); else alle();
  setInterval(nach, 500);
  window.addEventListener('load', function () { alle(); neuKleiden(); nach(); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(neuKleiden);
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType !== 1 || (n.classList && (n.classList.contains('dw') || n.classList.contains('dw-liste') || n.classList.contains('dw-blatt')))) return; if (n.matches && n.matches(WAS)) ruest(n); else if (n.querySelector) alle(n); }); });
  }).observe(doc.documentElement, { childList: true, subtree: true });
  window.dhAuswahl = { alle: alle, zu: zu };
})();
