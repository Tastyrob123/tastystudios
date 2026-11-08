/* Berghotel Gasterntal — jede Auswahl im Stil des Hauses (Tasty Studios 13.10.2026).
   Listen (select), Datum (input type=date) und Uhrzeit (input type=time) öffnen nie die Auswahl des Browsers, sondern eine Karte des Hauses:
   Schiefergrau mit heller Holzlinie wie der Kalender der Buchungsleiste, Schrift der Titel, gewählt = helle Taste. Keine Punkte.
   Das echte Feld bleibt im Formular und trägt den Wert; jede Wahl löst «input» und «change» aus, darum laufen Rechner und Anfragen unverändert.
   Datum: Woche ab Montag, vergangene Tage und die Schliesszeit des Hauses (html[data-schluss] bis html[data-auf]) sind gesperrt, min/max des Feldes gelten.
   Uhrzeit: Stunden und Minuten nebeneinander, Schritt aus step. Tastatur: Pfeile, Pos1/Ende, Bild auf/ab, Enter, Escape, Tab.
   Ausgenommen: alles in [data-eigene-wahl] (die Buchungsleiste hat ihren eigenen Zeitraum-Kalender). Bewegung nur über transform und opacity.
   Vorbild für die Funktion: Grand Beau-Rivage assets/js/auswahl.js. Gestaltung: assets/css/auswahl.css dieses Hauses. Prüfen: node _qa/auswahl_pruef.js */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement, offen = null, nr = 0;
  var PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  var VOR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>', ZUR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4"/></svg>';
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var iso = function (d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
  var lies = function (s) { var p = String(s || '').split('-'); return p.length === 3 && +p[0] ? new Date(+p[0], p[1] - 1, +p[2]) : null; };
  var kurz = function (d) { return zwei(d.getDate()) + '.' + zwei(d.getMonth() + 1) + '.' + d.getFullYear(); };
  var SCHLUSS = lies(html.getAttribute('data-schluss')), AUF = lies(html.getAttribute('data-auf'));
  function heute() {   // der Tag im Tal (Europe/Zurich), nicht der des Geräts
    try { var t = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); var d = lies(t); if (d) return d; } catch (e) {}
    var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function ausgenommen(el) { return !!el.closest('[data-eigene-wahl]') || el.disabled; }
  function titelVon(el) { var lab = el.closest('label,.feld'); var sp = lab && lab.querySelector('span'); return (sp ? sp.textContent : el.getAttribute('aria-label') || '').trim(); }
  function wirt(el) { return el.closest('dialog[open]') || doc.body; }

  /* Karte neben das Feld setzen: unter dem Feld, sonst darüber; nie aus dem Fenster. Steht fest im Fenster (auch im offenen Dialog). */
  function lage(karte, anker) {
    karte.style.transition = 'none'; karte.style.transform = 'none';   // ohne die Bewegung des Auftritts messen, sonst sitzt die Karte um deren Weg daneben
    var r = anker.getBoundingClientRect(), b = karte.offsetWidth, h = karte.offsetHeight, vw = html.clientWidth, vh = window.innerHeight;
    var x = Math.max(8, Math.min(r.left, vw - b - 8)), unten = r.bottom + 8 + h <= vh || r.top - 8 - h < 8, y = unten ? r.bottom + 8 : r.top - 8 - h;
    y = Math.max(8, Math.min(y, vh - h - 8));
    karte.classList.toggle('hw--oben', !unten);
    karte.style.left = x + 'px'; karte.style.top = y + 'px';
    var ist = karte.getBoundingClientRect(), dx = x - ist.left, dy = y - ist.top;   // steht die Karte in einem verschobenen Rahmen (Dialog mit transform), gleicht das den Versatz aus
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) { karte.style.left = (x + dx) + 'px'; karte.style.top = (y + dy) + 'px'; }
    karte.style.transform = ''; void karte.offsetWidth; karte.style.transition = '';
  }
  var takt = 0;
  function mit() { if (!offen || takt) return; takt = requestAnimationFrame(function () { takt = 0; if (offen) lage(offen.karte, offen.anker); }); }
  function zeig(o) {
    if (offen) zu(false);
    offen = o; wirt(o.feld).appendChild(o.karte); lage(o.karte, o.anker);
    o.knopf.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { if (offen === o) { lage(o.karte, o.anker); o.karte.classList.add('hw--auf'); } });
    addEventListener('scroll', mit, true); addEventListener('resize', mit);
  }
  function zu(fokus) {
    var o = offen; if (!o) return;
    offen = null; o.knopf.setAttribute('aria-expanded', 'false'); o.karte.classList.remove('hw--auf');
    removeEventListener('scroll', mit, true); removeEventListener('resize', mit);
    setTimeout(function () { if (offen !== o && o.karte.parentNode) o.karte.parentNode.removeChild(o.karte); }, 260);
    if (fokus) o.knopf.focus({ preventScroll: true });
  }
  function melde(feld) { feld.dispatchEvent(new Event('input', { bubbles: true })); feld.dispatchEvent(new Event('change', { bubbles: true })); }
  doc.addEventListener('pointerdown', function (e) { if (offen && !offen.karte.contains(e.target) && !offen.knopf.contains(e.target)) zu(false); }, true);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) { e.preventDefault(); e.stopPropagation(); zu(true); } }, true);

  /* ---------------------------------------------------------------- Listen */
  function liste(s) {
    if (s._hw || s.multiple || s.size > 1 || ausgenommen(s)) return;
    var hülle = doc.createElement('span'); hülle.className = 'hw'; s.parentNode.insertBefore(hülle, s); hülle.appendChild(s);
    s.classList.add('hw-nativ'); s.tabIndex = -1; s.setAttribute('aria-hidden', 'true');
    var k = doc.createElement('button'); k.type = 'button'; k.className = 'hw-knopf'; k.setAttribute('aria-haspopup', 'listbox'); k.setAttribute('aria-expanded', 'false');
    var t = titelVon(s); if (t) k.setAttribute('aria-label', t);
    k.innerHTML = '<b class="hw-wert"></b>' + PF; hülle.appendChild(k);
    var l = doc.createElement('ul'); l.className = 'hw-karte hw-liste'; l.id = 'hw' + (++nr); l.setAttribute('role', 'listbox'); l.tabIndex = -1; if (t) l.setAttribute('aria-label', t);
    k.setAttribute('aria-controls', l.id);
    var g = s._hw = { feld: s, knopf: k, karte: l, anker: hülle.closest('label,.feld') || hülle, j: 0 };
    function schreibe() { var o = s.options[s.selectedIndex]; k.querySelector('.hw-wert').textContent = o ? o.textContent : ''; }
    function fuelle() {
      l.innerHTML = '';
      [].forEach.call(s.options, function (o, i) {
        if (o.hidden) return;
        var li = doc.createElement('li'); li.setAttribute('role', 'option'); li.dataset.i = i; li.setAttribute('aria-selected', String(i === s.selectedIndex)); if (o.disabled) li.setAttribute('aria-disabled', 'true');
        li.textContent = o.textContent; l.appendChild(li);
      });
      l.style.minWidth = Math.max(200, g.anker.getBoundingClientRect().width) + 'px';
    }
    function markiere(i) {
      var lis = [].slice.call(l.children), li = l.querySelector('[data-i="' + i + '"]') || lis[0]; if (!li) return;
      lis.forEach(function (x) { x.classList.toggle('hw-hier', x === li); }); g.j = +li.dataset.i;
      var r = li.getBoundingClientRect(), rl = l.getBoundingClientRect();
      if (r.bottom > rl.bottom) l.scrollTop += r.bottom - rl.bottom; else if (r.top < rl.top) l.scrollTop -= rl.top - r.top;
    }
    function waehle(i) { var o = s.options[i]; if (!o || o.disabled) return; s.selectedIndex = i; melde(s); schreibe(); zu(true); }
    function auf() { fuelle(); zeig(g); markiere(Math.max(0, s.selectedIndex)); l.focus({ preventScroll: true }); }
    g.schreibe = schreibe;
    k.addEventListener('click', function () { offen === g ? zu(true) : auf(); });
    k.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); auf(); } });
    l.addEventListener('click', function (e) { var o = e.target.closest('[role=option]'); if (o) waehle(+o.dataset.i); });
    l.addEventListener('mousemove', function (e) { var o = e.target.closest('[role=option]'); if (o && +o.dataset.i !== g.j) markiere(+o.dataset.i); });
    var suche = '', uhr = 0;
    l.addEventListener('keydown', function (e) {
      var lis = [].slice.call(l.children).filter(function (x) { return !x.hasAttribute('aria-disabled'); }), pos = lis.findIndex(function (x) { return +x.dataset.i === g.j; });
      if (e.key === 'ArrowDown') { e.preventDefault(); markiere(+lis[Math.min(lis.length - 1, pos + 1)].dataset.i); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); markiere(+lis[Math.max(0, pos - 1)].dataset.i); }
      else if (e.key === 'Home') { e.preventDefault(); markiere(+lis[0].dataset.i); }
      else if (e.key === 'End') { e.preventDefault(); markiere(+lis[lis.length - 1].dataset.i); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); waehle(g.j); }
      else if (e.key === 'Tab') zu(false);
      else if (e.key.length === 1) {
        clearTimeout(uhr); suche += e.key.toLowerCase(); uhr = setTimeout(function () { suche = ''; }, 700);
        var tr = lis.find(function (x) { return x.textContent.trim().toLowerCase().indexOf(suche) === 0; }); if (tr) markiere(+tr.dataset.i);
      }
    });
    s.addEventListener('change', schreibe);
    if (s.form) s.form.addEventListener('reset', function () { setTimeout(schreibe, 0); });
    var lab = s.closest('label'); if (lab) lab.addEventListener('click', function (e) { if (!k.contains(e.target) && !l.contains(e.target)) { e.preventDefault(); k.click(); } });
    schreibe();
  }

  /* ---------------------------------------------------------------- Datum und Uhrzeit */
  function feld(i) {
    if (i._hw || ausgenommen(i) || (i.type !== 'date' && i.type !== 'time')) return;
    var art = i.type, hülle = doc.createElement('span'); hülle.className = 'hw hw--' + art; i.parentNode.insertBefore(hülle, i); hülle.appendChild(i);
    i.classList.add('hw-nativ'); i.tabIndex = -1; i.setAttribute('aria-hidden', 'true');
    var k = doc.createElement('button'); k.type = 'button'; k.className = 'hw-knopf'; k.setAttribute('aria-haspopup', 'dialog'); k.setAttribute('aria-expanded', 'false');
    k.innerHTML = '<b class="hw-wert"></b>' + PF; hülle.appendChild(k);
    var karte = doc.createElement('div'); karte.className = 'hw-karte ' + (art === 'date' ? 'hw-kal' : 'hw-zeit'); karte.setAttribute('role', 'dialog');
    var t = titelVon(i); if (t) karte.setAttribute('aria-label', t);
    var g = i._hw = { feld: i, knopf: k, karte: karte, anker: hülle.closest('label,.feld') || hülle };
    function schreibe() {
      var w = k.querySelector('.hw-wert'), d = art === 'date' ? lies(i.value) : null, leer = !i.value;
      w.textContent = art === 'date' ? (d ? kurz(d) : 'Tag wählen') : (i.value ? i.value.slice(0, 5) : 'Zeit wählen');
      k.classList.toggle('hw-leer', leer);
      k.setAttribute('aria-label', (t ? t + ': ' : '') + (d ? TAGE[(d.getDay() + 6) % 7] + ', ' + kurz(d) : (i.value || (art === 'date' ? 'Tag wählen' : 'Zeit wählen'))));
    }
    g.schreibe = schreibe;
    function gesperrt(d) {
      var mn = lies(i.min), mx = lies(i.max);
      if (mn ? d < mn : (!i.hasAttribute('data-frei') && d < heute())) return 1;
      if (SCHLUSS && AUF && d > SCHLUSS && d < AUF && !i.hasAttribute('data-frei')) return 2;   // Schliesszeit des Hauses: durchgestrichen, mit Hinweis
      if (mx && d > mx) return 1;
      return 0;
    }
    function erster() { var d = heute(); for (var n = 0; n < 400 && gesperrt(d); n++) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); return d; }
    function kalender() {
      var b = g.blick, j = b.getFullYear(), m = b.getMonth(), wahl = lies(i.value), h = iso(heute());
      var s = '<div class="hw-kal__kopf"><div><small>' + (t || 'Tag') + '</small><b>' + MONATE[m] + ' ' + j + '</b></div><div class="hw-kal__pf"><button type="button" data-m="-1" aria-label="Monat zurück">' + ZUR + '</button><button type="button" data-m="1" aria-label="Monat weiter">' + VOR + '</button></div></div><div class="hw-kal__woche" aria-hidden="true">';
      ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(function (x) { s += '<span>' + x + '</span>'; });
      s += '</div><div class="hw-kal__raster" role="grid">';
      var leer = (new Date(j, m, 1).getDay() + 6) % 7, n = new Date(j, m + 1, 0).getDate(), zuTage = 0;
      for (var x = 0; x < leer; x++) s += '<span></span>';
      for (x = 1; x <= n; x++) {
        var d = new Date(j, m, x), sp = gesperrt(d), id = iso(d), kl = (id === h ? ' hw-heute' : '') + (sp === 2 ? ' hw-zu' : ''); if (sp === 2) zuTage++;
        s += '<button type="button" class="hw-tag' + kl + '" data-tag="' + id + '"' + (wahl && iso(wahl) === id ? ' aria-pressed="true"' : '') + (sp ? ' disabled' : '') + ' aria-label="' + TAGE[(d.getDay() + 6) % 7] + ', ' + kurz(d) + (sp === 2 ? ', geschlossen' : '') + '" tabindex="-1">' + x + '</button>';
      }
      s += '</div>';
      if (zuTage && SCHLUSS && AUF) s += '<p class="hw-kal__fuss">Durchgestrichen: das Haus ist zu. Saisonschluss ' + kurz(SCHLUSS) + ', Eröffnung ' + kurz(AUF) + '.</p>';
      karte.innerHTML = s;
      var ziel = karte.querySelector('[data-tag="' + iso(g.hier) + '"]:not([disabled])') || karte.querySelector('.hw-tag[aria-pressed]:not([disabled])') || karte.querySelector('.hw-tag:not([disabled])');
      if (ziel) { ziel.tabIndex = 0; setTimeout(function () { if (offen === g) ziel.focus({ preventScroll: true }); }, 30); }
    }
    function zeit() {
      var w = /^\d\d:\d\d/.test(i.value) ? i.value : '12:00', hh = +w.slice(0, 2), mm = +w.slice(3, 5), schritt = Math.max(1, Math.min(30, Math.round((+i.step || 900) / 60))); if (60 % schritt) schritt = 5;
      mm = Math.round(mm / schritt) * schritt % 60; g.hh = hh; g.mm = mm;
      var s = '<div class="hw-zeit__kopf"><small>' + (t || 'Uhrzeit') + '</small></div><div class="hw-zeit__sp"><div class="hw-zeit__spalte" role="listbox" aria-label="Stunde" data-teil="h">';
      for (var x = 0; x < 24; x++) s += '<button type="button" role="option" class="hw-z" data-w="' + x + '" aria-selected="' + (x === hh) + '" tabindex="' + (x === hh ? 0 : -1) + '">' + zwei(x) + '</button>';
      s += '</div><i aria-hidden="true">:</i><div class="hw-zeit__spalte" role="listbox" aria-label="Minute" data-teil="m">';
      for (x = 0; x < 60; x += schritt) s += '<button type="button" role="option" class="hw-z" data-w="' + x + '" aria-selected="' + (x === mm) + '" tabindex="' + (x === mm ? 0 : -1) + '">' + zwei(x) + '</button>';
      karte.innerHTML = s + '</div></div>';
    }
    function mitte() { [].forEach.call(karte.querySelectorAll('.hw-zeit__spalte'), function (sp) { var a = sp.querySelector('[aria-selected=true]'); if (a) sp.scrollTop = a.offsetTop - sp.clientHeight / 2 + a.offsetHeight / 2; }); }
    function auf() {
      if (art === 'date') { var d = lies(i.value); if (!d || gesperrt(d)) d = erster(); g.hier = d; g.blick = new Date(d.getFullYear(), d.getMonth(), 1); kalender(); zeig(g); }
      else { zeit(); zeig(g); mitte(); var e = karte.querySelector('[data-teil=h] [aria-selected=true]'); if (e) setTimeout(function () { if (offen === g) e.focus({ preventScroll: true }); }, 30); }
    }
    k.addEventListener('click', function () { offen === g ? zu(true) : auf(); });
    k.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); auf(); } });
    karte.addEventListener('click', function (e) {
      var p = e.target.closest('[data-m]'), tg = e.target.closest('.hw-tag'), zz = e.target.closest('.hw-z');
      if (p) { g.blick = new Date(g.blick.getFullYear(), g.blick.getMonth() + (+p.getAttribute('data-m')), 1); g.hier = g.blick; kalender(); lage(karte, g.anker); }
      else if (tg && !tg.disabled) { i.value = tg.getAttribute('data-tag'); melde(i); schreibe(); zu(true); }
      else if (zz) {
        var teil = zz.parentNode.getAttribute('data-teil'); if (teil === 'h') g.hh = +zz.getAttribute('data-w'); else g.mm = +zz.getAttribute('data-w');
        [].forEach.call(zz.parentNode.children, function (x) { x.setAttribute('aria-selected', String(x === zz)); x.tabIndex = x === zz ? 0 : -1; });
        i.value = zwei(g.hh) + ':' + zwei(g.mm); melde(i); schreibe();
        if (teil === 'm') zu(true); else { var mi = karte.querySelector('[data-teil=m] [aria-selected=true]'); if (mi) mi.focus({ preventScroll: true }); }
      }
    });
    karte.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { zu(false); return; }
      var a = doc.activeElement;
      if (art === 'date') {
        var d = a && a.getAttribute && lies(a.getAttribute('data-tag')); if (!d) return;
        var plus = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), d.getDate()); }
        else if (plus) { e.preventDefault(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + plus); }
        else return;
        g.hier = d; g.blick = new Date(d.getFullYear(), d.getMonth(), 1); kalender(); lage(karte, g.anker);
      } else {
        if (!a || !a.classList || !a.classList.contains('hw-z')) return;
        var n = e.key === 'ArrowDown' ? a.nextElementSibling : e.key === 'ArrowUp' ? a.previousElementSibling : null;
        if (n) { e.preventDefault(); n.focus(); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var and = karte.querySelector('[data-teil=' + (a.parentNode.getAttribute('data-teil') === 'h' ? 'm' : 'h') + '] [aria-selected=true]'); if (and) and.focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); }
      }
    });
    ['input', 'change'].forEach(function (ev) { i.addEventListener(ev, schreibe); });
    var lab = i.closest('label'); if (lab) lab.addEventListener('click', function (e) { if (!k.contains(e.target) && !karte.contains(e.target)) { e.preventDefault(); k.click(); } });
    schreibe();
  }

  function alle(wurzel) {
    var w = wurzel && wurzel.querySelectorAll ? wurzel : doc;
    [].forEach.call(w.querySelectorAll('select'), liste);
    [].forEach.call(w.querySelectorAll('input[type=date],input[type=time]'), feld);
  }
  /* Werte, die andere Skripte direkt setzen (feld.value = …), beim nächsten Blick nachziehen */
  function nachziehen() { [].forEach.call(doc.querySelectorAll('.hw-nativ'), function (f) { if (f._hw && f._hw.schreibe && f._hw !== offen) f._hw.schreibe(); }); }
  function start() { alle(); setInterval(nachziehen, 600); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
  new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType !== 1) return; if (n.tagName === 'SELECT') liste(n); else if (n.tagName === 'INPUT') feld(n); else alle(n); }); }); }).observe(doc.documentElement, { childList: true, subtree: true });
  window.hausAuswahl = { alle: alle, zu: zu };
})();
