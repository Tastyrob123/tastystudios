/* Landgasthof Ruedihus — Seitenbau 13.10.2026 (Tasty Studios): Umgebungskarte, Abfahrten ab Kandersteg, Wünsche zur Abreise.
   Die Abfahrten kommen live aus dem Fahrplan der SBB (transport.opendata.ch, frei, ohne Schlüssel). Uhrzeiten stehen immer in Schweizer Zeit,
   egal wo das Gerät steht. Fällt der Dienst aus, steht der Weg zum Fahrplan der SBB da. Nichts wird geschätzt. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ZONE = 'Europe/Zurich';

  /* ---------- Umgebungskarte: Ort auf dem Blatt und Zeile in der Liste gehören zusammen ---------- */
  $$('[data-um]').forEach(function (um) {
    function zeige(id, rollen) {
      $$('[data-ort]', um).forEach(function (x) {
        var an = x.getAttribute('data-ort') === id;
        x.classList.toggle('an', an);
        if (x.tagName === 'BUTTON') x.setAttribute('aria-pressed', String(an));
      });
      if (rollen) { var z = $('.um__z[data-ort="' + id + '"]', um); if (z && z.scrollIntoView && matchMedia('(max-width:900px)').matches) z.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
    um.addEventListener('click', function (e) {
      var o = e.target.closest('[data-ort]'); if (!o || !um.contains(o)) return;
      zeige(o.getAttribute('data-ort'), o.tagName !== 'BUTTON');
    });
  });

  /* ---------- Abfahrten ---------- */
  var heuteCH = function () { try { return new Intl.DateTimeFormat('sv-SE', { timeZone: ZONE }).format(new Date()); } catch (e) { return ''; } };
  var uhrCH = function () { try { return new Intl.DateTimeFormat('de-CH', { timeZone: ZONE, hour: '2-digit', minute: '2-digit' }).format(new Date()); } catch (e) { return ''; } };
  var tagName = function (iso) { var p = iso.split('-'); try { return new Intl.DateTimeFormat('de-CH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(+p[0], p[1] - 1, +p[2]))); } catch (e) { return iso; } };
  $$('[data-abfahrt]').forEach(function (brett) {
    var merk = {}, gewaehlt = null, form = brett.closest('form'), uhr = $('[data-uhr]', brett);
    function tick() { if (uhr) { var u = uhrCH(); uhr.textContent = u ? 'Kandersteg · ' + u + ' Uhr' : ''; } }
    tick(); setInterval(tick, 20000);
    function male(tafel, daten) {
      var heute = heuteCH(), letzter = heute, h = '', n = 0, art = tafel.getAttribute('data-art');
      (daten.stationboard || []).forEach(function (x) {
        var ab = (x.stop && x.stop.departure) || ''; if (ab.length < 16) return;
        var tag = ab.slice(0, 10), zeit = ab.slice(11, 16), spaet = +(x.stop.delay || 0);
        if (tag !== letzter) { h += '<p class="ab-tag">' + esc(tagName(tag)) + '</p>'; letzter = tag; }
        var linie = art === 'Bus' ? 'Bus ' + (x.number || '') : ((x.category || '') + ' ' + (x.number || '')).trim();
        var ziel = String(x.to || '').replace(/^Kandersteg, /, '').replace(/^Talstat\./, 'Talstation');   /* im Ort reicht der Name der Haltestelle */
        var gleis = x.stop.platform ? (art === 'Bus' ? 'Kante ' : 'Gleis ') + x.stop.platform : '';
        var text = zeit + ' Uhr, ' + linie + ' nach ' + ziel + (gleis ? ', ' + gleis : '') + ' (' + (tag === heute ? 'heute' : tagName(tag)) + ', ab ' + tafel.getAttribute('data-halt') + ')';
        h += '<button class="ab-z" type="button" aria-pressed="' + (gewaehlt === text) + '" style="--i:' + (n++) + '" data-fahrt="' + esc(text) + '"><time>' + esc(zeit) + '</time><span><b>' + esc(ziel) + '</b><small>' + esc(linie) + (gleis ? ' · ' + esc(gleis) : '') + '</small></span>' +
          '<em' + (spaet > 0 ? ' class="spaet"' : '') + '>' + (spaet > 0 ? '+' + spaet + ' Min.' : 'pünktlich') + '</em></button>';
      });
      if (!n) { leer(tafel, 'Für die nächsten Stunden steht keine Abfahrt im Fahrplan.'); return; }
      tafel.innerHTML = h; tafel.classList.remove('da');
      requestAnimationFrame(function () { requestAnimationFrame(function () { tafel.classList.add('da'); }); });
    }
    function leer(tafel, satz) { tafel.innerHTML = '<p class="ab-warte">' + esc(satz) + ' Den Fahrplan finden Sie bei der <a href="https://www.sbb.ch/de" target="_blank" rel="noopener">SBB</a>.</p>'; }
    function lade(tafel) {
      if (!tafel || tafel.hidden) return;
      var halt = tafel.getAttribute('data-halt'), m = merk[halt];
      if (m && Date.now() - m.um < 45000) { if (!tafel.querySelector('.ab-z')) male(tafel, m.daten); return; }
      if (!window.fetch) { leer(tafel, 'Die Abfahrten lassen sich hier nicht abrufen.'); return; }
      fetch('https://transport.opendata.ch/v1/stationboard?station=' + encodeURIComponent(halt) + '&limit=7')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (d) { merk[halt] = { um: Date.now(), daten: d }; male(tafel, d); })
        .catch(function () { if (!tafel.querySelector('.ab-z')) leer(tafel, 'Die Abfahrten sind gerade nicht abrufbar.'); });
    }
    function offene() { return $$('.ab-tafel', brett).filter(function (t) { return !t.hidden; })[0]; }
    brett.addEventListener('click', function (e) {
      var z = e.target.closest('.ab-z');
      if (z) {
        var neu = z.getAttribute('aria-pressed') !== 'true'; gewaehlt = neu ? z.getAttribute('data-fahrt') : null;
        $$('.ab-z', brett).forEach(function (x) { x.setAttribute('aria-pressed', String(neu && x === z)); });
        if (form) { form._fahrt = gewaehlt; form.dispatchEvent(new Event('input', { bubbles: true })); }
        return;
      }
      if (e.target.closest('[role=tab]')) setTimeout(function () { lade(offene()); }, 60);
    });
    var gestartet = false;
    function start() { if (gestartet) return; gestartet = true; lade(offene()); setInterval(function () { if (!document.hidden) lade(offene()); }, 60000); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, io) { if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' }).observe(brett); else start();
  });

  /* ---------- Wünsche zur Abreise: Zusammenfassung und Nachricht an die Rezeption ---------- */
  $$('form[data-abreise]').forEach(function (fo) {
    var el = fo.elements, q = new URLSearchParams(location.search), heute = new Date();
    var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
    el.tag.min = iso(heute);
    if (/^\d{4}-\d{2}-\d{2}$/.test(q.get('ab') || '')) el.tag.value = q.get('ab');
    if (q.get('name')) el.name.value = q.get('name').slice(0, 80);
    if (q.get('nr')) el.nr.value = q.get('nr').slice(0, 40);
    var stand = [];
    function datum(v) { try { return new Date(v + 'T12:00').toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return v; } }
    function neu() {
      var z = [], o = el.lokal.options[el.lokal.selectedIndex], mit = !!el.lokal.value;
      $('[data-lokal-zeit]', fo).textContent = o && o.getAttribute('data-zeit') || '';
      $$('[data-tisch-feld]', fo).forEach(function (x) { x.hidden = !mit; });
      z.push('Abreise: ' + (el.tag.value ? datum(el.tag.value) : 'Tag noch offen') + (el.zeit.value ? ', ' + el.zeit.value + ' Uhr' : ''));
      if (fo._fahrt) z.push('Abfahrt: ' + fo._fahrt);
      if (mit) z.push('Zmittag: ' + el.lokal.value + ', ' + el.tischzeit.value + ' Uhr, ' + el.tischpers.value + ' Personen');
      if (el.wunsch.value.trim()) z.push('Nachricht: ' + el.wunsch.value.trim());
      $('[data-wuensche]', fo).innerHTML = z.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      stand = z;
    }
    fo.addEventListener('input', neu); fo.addEventListener('change', neu); neu();
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = ['Name: ' + el.name.value, 'Zimmer oder Buchungsnummer: ' + (el.nr.value || '-')].concat(stand);
      /* kein Mailprogramm (17.10.2026): das Formular nimmt assets/js/formular.js, hier öffnet sich nichts mehr */
    });
  });
})();

/* JAHRESLAUF FILMSTREIFEN 17.10.2026: Pfeile blättern um eine Karte (veranstaltungen.html, Stil in seiten.css) */
(function () {
  document.querySelectorAll('[data-jf]').forEach(function (w) {
    var s = w.querySelector('.jf__band');
    function d() { var k = s.firstElementChild; return k ? k.getBoundingClientRect().width + parseFloat(getComputedStyle(s).columnGap || 24) : 300; }
    w.querySelector('[data-jf-l]').addEventListener('click', function () { s.scrollBy({ left: -d(), behavior: 'smooth' }); });
    w.querySelector('[data-jf-r]').addEventListener('click', function () { s.scrollBy({ left: d(), behavior: 'smooth' }); });
  });
})();
