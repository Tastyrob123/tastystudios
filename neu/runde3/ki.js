/* KI-Fassungen: Abläufe der ChatGPT-Oberflächen. data-folge="Zeit:Schritt,…": «tipp» tippt die Frage, «tipp-q» tippt auf die Quelle,
   «strom»/«stromN» lässt die Antwort Wort für Wort laufen wie in der App, alles andere wird als Klasse am Behälter gesetzt.
   «lesen» lässt die Leselinie über die Seite fahren, «zieh»: jede Angabe (data-quelle)
   leuchtet im Text auf, ihre Zeile (data-ziel) erscheint als Ziffernfolge und entschlüsselt sich zum Klartext (Robert: «aus Zahlencode, Matrix-Stil»).
   Läuft vor runde2/r.js, das _start/_stop beim Sichtbarwerden aufruft. Bewegt wird nur transform; Wörter erscheinen wie beim echten Antworten. */
(function () {
  'use strict';
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Antwort in Wörter zerlegen; Quellen-Pillen zählen als ein Wort */
  function zerlege(a) {
    var teile = [];
    (function geh(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'wd'; s.textContent = w; f.appendChild(s); teile.push(s);
          });
          n.replaceChild(f, c);
        } else if (c.nodeType === 1) {
          if (c.classList.contains('cg-zit') || c.classList.contains('v14-karte')) { c.classList.add('wd'); teile.push(c); }
          else geh(c);
        }
      });
    })(a);
    return teile;
  }

  alle('[data-w="kv"]').forEach(function (w) {
    var schritte = (w.getAttribute('data-folge') || '').split(',').filter(Boolean).map(function (x) { var p = x.split(':'); return [+p[0], p[1]]; });
    var dauer = +w.getAttribute('data-dauer') || 16000, uhren = [], an = false, klassen = [];
    var stroeme = {};
    alle('[data-strom]', w).forEach(function (a) { var k = a.getAttribute('data-strom'); (stroeme[k] = stroeme[k] || []).push({ a: a, t: zerlege(a) }); });
    var tipps = alle('[data-tipp]', w).map(function (t) { return { el: t, txt: t.textContent }; });
    schritte.forEach(function (s) { if (!/^(tipp|strom\d*|lesen|zieh)$/.test(s[1])) klassen.push(s[1]); });
    var zeilen = alle('[data-ziel]', w), quellen = {}, zaehler = w.querySelector('.kmz-n i'), cur = w.querySelector('.kmz-cur');
    alle('[data-quelle]', w).forEach(function (q) { quellen[q.getAttribute('data-quelle')] = q; });
    /* Zeilen: Beschriftung und Wert merken, beim Erscheinen aus Ziffern entschlüsseln */
    zeilen.forEach(function (z) { z._t = [].slice.call(z.querySelectorAll('b, .kmz-v')).map(function (x) { return { el: x, txt: x.textContent }; }); });
    function ziffern(t) { return t.replace(/\S/g, function () { return (Math.random() * 10 | 0) + ''; }); }
    function zeile_zurueck(z) { z._t.forEach(function (t) { t.el.textContent = t.txt; }); }


    function zuruck() {
      uhren.forEach(clearTimeout); uhren = [];
      klassen.concat(['tippt', 'getippt', 'fertig']).forEach(function (c) { w.classList.remove('k-' + c); });
      alle('.wd', w).forEach(function (x) { x.classList.remove('da'); });
      alle('[data-strom] li, [data-strom] p', w).forEach(function (x) { x.classList.remove('da'); });
      alle('[data-strom]', w).forEach(function (x) { x.classList.remove('laeuft', 'da'); });
      tipps.forEach(function (t) { t.el.textContent = ''; });
      w.classList.remove('k-lesen', 'k-zieht');
      zeilen.forEach(function (z) { z.classList.remove('da', 'neu', 'roh'); zeile_zurueck(z); });
      pkte.forEach(function (p) { p.classList.remove('an'); });
      alle('.zl', w).forEach(function (x) { x.classList.remove('zl'); });
      if (zaehler) zaehler.textContent = '0';
    }
    function lesen() { w.classList.add('k-lesen'); uhren.push(setTimeout(function () { w.classList.remove('k-lesen'); }, 1250)); }
    /* Eine Angabe: Stelle im Text leuchtet, die Zeile erscheint als Ziffernfolge und entschlüsselt sich von links */
    function entschluessle(z, n) {
      var q = quellen[z.getAttribute('data-ziel')];
      if (cur) z.appendChild(cur);
      if (q) q.classList.add('zl');
      z._t.forEach(function (t) { t.el.textContent = ziffern(t.txt); });
      z.classList.add('da', 'roh');
      var T = 480, t0 = performance.now();
      (function schritt() {
        var f = Math.min(1, (performance.now() - t0) / T);
        z._t.forEach(function (t) {
          var k = Math.floor(f * t.txt.length);
          t.el.innerHTML = '';
          t.el.appendChild(document.createTextNode(t.txt.slice(0, k)));
          var rest = document.createElement('i'); rest.className = 'kmz-z'; rest.textContent = ziffern(t.txt.slice(k)); t.el.appendChild(rest);
        });
        if (f < 1) { uhren.push(setTimeout(schritt, 40)); return; }
        zeile_zurueck(z); z.classList.remove('roh'); z.classList.add('neu');
        if (zaehler) zaehler.textContent = String(n + 1);
        if (q) q.classList.remove('zl');
        uhren.push(setTimeout(function () { z.classList.remove('neu'); }, 60));
      })();
    }
    function zieh() {
      w.classList.add('k-zieht');
      zeilen.forEach(function (z, n) { uhren.push(setTimeout(function () { entschluessle(z, n); }, 150 + n * 520)); });
      uhren.push(setTimeout(function () { w.classList.remove('k-zieht'); }, zeilen.length * 520 + 500));
    }
    function tippe() {
      w.classList.add('k-tippt');
      tipps.forEach(function (t) {
        var i = 0;
        (function n() { t.el.textContent = t.txt.slice(0, ++i); if (i < t.txt.length) uhren.push(setTimeout(n, 26 + Math.random() * 30)); else w.classList.add('k-getippt'); })();
      });
    }
    /* nach der fertigen Antwort leuchten die drei Punkte unter den Tablets nacheinander auf (Robert 02.11.2026) */
    var pkte = alle('.kv-pk', w.closest('section') || document);
    function leuchte() { pkte.forEach(function (p, n) { uhren.push(setTimeout(function () { p.classList.add('an'); }, 250 + n * 550)); }); }
    function stroem(k) {
      (stroeme[k] || []).forEach(function (s) {
        s.a.classList.add('laeuft', 'da'); var i = 0;
        (function n() {
          var x = s.t[i]; if (!x) { s.a.classList.remove('laeuft'); leuchte(); return; }
          x.classList.add('da');
          var blk = x.closest('li, p'); if (blk && !blk.classList.contains('da')) { blk.classList.add('da'); var c = blk.getAttribute('data-setzt'); if (c) w.classList.add('k-' + c); }
          i++; uhren.push(setTimeout(n, x.classList.contains('cg-zit') ? 120 : 34 + Math.random() * 26));
        })();
      });
    }
    function tu(s) { if (s === 'tipp') tippe(); else if (s === 'tipp-q') w.classList.add('k-' + s); else if (s === 'lesen') lesen(); else if (s === 'zieh') zieh(); else if (s.indexOf('strom') === 0) stroem(s.slice(5) || '1'); else w.classList.add('k-' + s); }
    function fertig() { zuruck(); klassen.forEach(function (c) { if (c !== 'denkt') w.classList.add('k-' + c); }); tipps.forEach(function (t) { t.el.textContent = t.txt; });
      alle('.wd,[data-strom],[data-strom] li,[data-strom] p', w).forEach(function (x) { x.classList.add('da'); });
      zeilen.forEach(function (z) { z.classList.add('da'); }); pkte.forEach(function (p) { p.classList.add('an'); }); if (zaehler) zaehler.textContent = String(zeilen.length); w.classList.remove('k-denkt'); w.classList.add('k-fertig'); }
    function einmal() {
      zuruck();
      schritte.forEach(function (s) { uhren.push(setTimeout(function () { tu(s[1]); }, s[0])); });
      uhren.push(setTimeout(function () { w.classList.add('k-fertig'); }, schritte.length ? schritte[schritte.length - 1][0] + 4000 : 0));
      uhren.push(setTimeout(einmal, dauer));
    }
    w._start = function () { if (an) return; an = true; if (ruhig) fertig(); else einmal(); };
    w._stop = function () { an = false; uhren.forEach(clearTimeout); uhren = []; fertig(); };   /* ausser Sicht: fertige Antwort stehen lassen, nie ein halb leerer Chat (11.11.2026) */
    fertig(); /* Ausgangslage: fertige Antwort, falls der Ablauf nie startet */
    w._start0 = true;
  });
})();
