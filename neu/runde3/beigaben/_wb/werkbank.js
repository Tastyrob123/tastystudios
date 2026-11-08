/* Werkbank Carlton-Europe: Hereinkommen, Zahlen, Bänder, Vergleich, Gefüge, Seiten-Bühne.
   Keine Bibliothek, nativer Scroll, ein Takt (requestAnimationFrame) für alles, was am Scroll hängt. */
(function () {
  'use strict';
  var doc = document, ruhig = matchMedia('(prefers-reduced-motion:reduce)').matches, fein = matchMedia('(pointer:fine)').matches;
  doc.documentElement.classList.add('js');
  var $ = function (s, e) { return (e || doc).querySelector(s); }, $$ = function (s, e) { return [].slice.call((e || doc).querySelectorAll(s)); };

  /* ---------- Text fassen: Buchstaben für große Zeilen, Wörter für Absätze ---------- */
  function fasse(el, wortweise) {
    var i = 0, label = el.textContent;
    (function geh(k) {
      [].slice.call(k.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = doc.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (teil) {
            if (!teil) return;
            if (/^\s+$/.test(teil)) { f.appendChild(doc.createTextNode(' ')); return; }
            var w = doc.createElement('span');
            if (wortweise) { w.className = 'wt'; w.style.setProperty('--w', i++); w.textContent = teil; }
            else { w.className = 'w'; teil.split('').forEach(function (z) { var b = doc.createElement('span'); b.className = 'b'; b.style.setProperty('--i', i++); b.textContent = z; w.appendChild(b); }); }
            f.appendChild(w);
          });
          k.replaceChild(f, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') geh(n);
      });
    })(el);
    if (!wortweise) el.setAttribute('aria-label', label);
  }
  $$('[data-a="worte"]').forEach(function (e) { fasse(e, true); });

  /* ---------- Grosse Zeilen passen immer in ihre Spalte: zu breite Titel werden als Ganzes kleiner gesetzt ---------- */
  function passe() {
    var zt = $$('.zt'); zt.forEach(function (t) { t.style.fontSize = ''; });
    if (innerWidth < 640) return;
    var mass = zt.map(function (t) { var b = t.clientWidth, w = 0; $$('.z>span', t).forEach(function (s) { w = Math.max(w, s.offsetWidth); }); return [b, w, parseFloat(getComputedStyle(t).fontSize)]; });
    zt.forEach(function (t, i) { var m = mass[i]; if (m[0] > 0 && m[1] > m[0]) t.style.fontSize = (m[2] * m[0] / m[1] * 0.985).toFixed(1) + 'px'; });
  }
  passe(); if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(passe);
  var pt = 0; addEventListener('resize', function () { clearTimeout(pt); pt = setTimeout(passe, 120); });

  /* ---------- Zahlen, die durchrollen ---------- */
  $$('.odo').forEach(function (o) {
    var z = o.getAttribute('data-z'); o.setAttribute('aria-label', z); o.textContent = '';
    z.split('').forEach(function (c, i) {
      if (!/\d/.test(c)) { var p = doc.createElement('i'); p.textContent = c; o.appendChild(p); return; }
      var s = doc.createElement('span'); s.className = 'od'; s.style.setProperty('--i', i); s.dataset.d = c;
      for (var d = 0; d < 10; d++) { var e = doc.createElement('i'); e.textContent = d; s.appendChild(e); }
      o.appendChild(s);
    });
  });
  function rolle(o) { $$('.od', o).forEach(function (s) { s.style.transform = 'translateY(' + (-10 * +s.dataset.d) + '%)'; }); }
  /* Serifen-Ziffern sind verschieden breit: jede Spalte bekommt die Breite ihrer Zielziffer */
  function odoBreite() {
    $$('.odo').forEach(function (o) {
      var m = doc.createElement('span'); m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; o.appendChild(m);
      $$('.od', o).forEach(function (s) { m.textContent = s.dataset.d; s.style.setProperty('--b', (m.getBoundingClientRect().width + 1).toFixed(1) + 'px'); });
      o.removeChild(m);
    });
  }
  odoBreite(); if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(odoBreite); addEventListener('resize', odoBreite);

  /* ---------- Hereinkommen ---------- */
  var spiel = null;
  var ziele = $$('[data-a],.odo,.zt,[data-sicht]');
  function zeig(el) {
    // Robert/Oberchef 18.10.2026: Beilagen schweben erst ein, wenn ihr Bild fertig ist (höchstens 2,5 s warten), nie eine leere Fläche im Flug
    if (el.getAttribute('data-a') === 'schweb' && !el.__w) {
      var im = el.querySelector('img');
      if (im && !(im.complete && im.naturalWidth)) {
        el.__w = 1; if (im.loading === 'lazy') im.loading = 'eager';
        var los = function () { if (el.__l) return; el.__l = 1; zeig(el); };
        im.addEventListener('load', los, { once: true }); im.addEventListener('error', los, { once: true }); setTimeout(los, 2500);
        return;
      }
    }
    el.classList.add('da');
    if (el.classList.contains('odo')) rolle(el);
    if (el.id === 'brett' && spiel) spiel();
  }
  var drifter = [], imBild = [];
  if (!('IntersectionObserver' in window) || ruhig) ziele.forEach(zeig);
  else {
    // Hereinkommen wird über mehrere Bilder verteilt, damit nie ein ganzer Schwung auf einmal rechnet
    var warte = [], dran = 0;
    function nimm() { dran = 0; for (var k = 0; k < 4 && warte.length; k++) zeig(warte.shift()); if (warte.length) dran = requestAnimationFrame(nimm); }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { warte.push(e.target); io.unobserve(e.target); } }); if (warte.length && !dran) dran = requestAnimationFrame(nimm); }, { rootMargin: '0px 0px 14% 0px', threshold: 0 });
    ziele.forEach(function (z) { io.observe(z); });
    var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('sichtbar', e.isIntersecting); }); }, { rootMargin: '10% 0px' });
    $$('[data-lauf]').forEach(function (z) { io2.observe(z); });
    var io3 = new IntersectionObserver(function (es) { es.forEach(function (e) { var i = imBild.indexOf(e.target); if (e.isIntersecting && i < 0) imBild.push(e.target); if (!e.isIntersecting && i >= 0) imBild.splice(i, 1); }); }, { rootMargin: '15% 0px' });
    /* 17.10.2026, Robert: «ich will nicht, dass die Bilder so mit runterscrollen». Bilder am Rand (Auftakt, Feed, Dateien) stehen fest,
       sie schweben nur einmal herein. Das Mitgleiten mit dem Scrollen (data-drift, data-zug) ist abgeschaltet. */
    drifter = [];
  }

  /* Robert 19.10.2026 01:18 «Zurücktaste … ein Bildschirm, wo nichts zu sehen ist»: kommt die Seite aus dem Speicher von Safari zurück,
     steht alles im Bild und darüber sofort fertig da */
  addEventListener('pageshow', function (e) { if (!e.persisted) return; doc.documentElement.classList.remove('wb-sofort');
    ziele.forEach(function (el) { if (!el.classList.contains('da') && el.getBoundingClientRect().top < innerHeight * 1.2) { if (typeof io !== 'undefined' && io) io.unobserve(el); zeig(el); } }); });
  /* ---------- Zurück aus einer Beilage (Robert 18.10.2026 ~23:00): genau an die Stelle, an der man die Werkbank verlassen hat ----------
     Die Beilagen hängen «?y=<Höhe>» an den Knopf «Alles auf einen Blick» (zur-werkbank.js). Alles darüber steht schon fertig da,
     alles darunter kommt beim Weiterscrollen wie sonst. Beim Browser-Zurück gilt die gemerkte Höhe, falls der Browser die Stelle nicht selbst hält. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  (function () {
    var m = /[?&]y=(\d{1,6})(?:&|$)/.exec(location.search), y = m ? +m[1] : -1;
    var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
    /* Endprüfung 19.10.2026: beim Zurück stellte der Browser selbst eine falsche Höhe her (5181 statt 28549), weil die Seite beim Zurückholen
       noch nicht ganz gebaut ist. Die Werkbank stellt die Stelle deshalb immer selbst her, aus der beim Verlassen gemerkten Höhe. */
    /* Zurück/Vor im Browser macht der Rücksprung (ruecksprung.js, am Inhalt ausgerichtet), hier nur ?y= vom Knopf (Robert 1.11.2026) */
    if (!(y > 0)) return;
    if (m) try { history.replaceState(history.state, '', location.pathname + location.search.replace(/([?&])y=\d+(&|$)/, function (x, a, b) { return b ? a : ''; }) + location.hash); } catch (e) {}
    var stil = doc.createElement('style');
    stil.textContent = '.wb-sofort *,.wb-sofort *::before,.wb-sofort *::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important}';
    doc.head.appendChild(stil);
    var root = doc.documentElement;
    function oben() {
      root.classList.add('wb-sofort');
      ziele.forEach(function (el) { if (el.classList.contains('da')) return; if (el.getBoundingClientRect().bottom <= 0) { if (typeof io !== 'undefined' && io) io.unobserve(el); zeig(el); } });
      requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.remove('wb-sofort'); }); });
    }
    function geh() { scrollTo(0, Math.min(y, root.scrollHeight - innerHeight)); oben(); }
    var still = true, weg = function () { still = false; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (n) { addEventListener(n, weg, { once: true, passive: true }); });
    geh();
    var nach = function () { if (still && Math.abs((window.scrollY || 0) - y) > 4) geh(); };
    addEventListener('load', nach);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(nach);
    setTimeout(nach, 1200);
  })();

  /* ---------- Bilder: drei Bildschirme voraus holen, in Reihenfolge, bis zu sechs auf einmal; jedes Foto blendet ein, sobald es da ist ---------- */
  (function () {
    var alle = $$('img.ld'), faul = alle.filter(function (im) { return im.getAttribute('loading') === 'lazy'; });
    function fertig(im) { if (im.__d) return; im.__d = 1; if (getComputedStyle(im).opacity === '1') im.style.animation = 'none'; im.classList.add('da'); }   // steht es schon (Sicherung nach 3 s), blendet es nicht noch einmal ein
    /* Robert 18.10.2026 13:31 (Chrome): «bei den werkbänken laden die bilder nicht». Ein Bild, das einmal nicht kommt (Abbruch, Auslieferung gerade
       im Wechsel), lädt bis zu zweimal selbst neu, die Zwischengrössen zuletzt ohne srcset; bis dahin bleibt der weiche Vorschatten, nie das Zeichen für ein kaputtes Bild. */
    function nochmal(im) {
      im.__n = (im.__n || 0) + 1; im.style.opacity = '0';   // solange es neu lädt, steht nur der Vorschatten
      if (im.__n > 2) return;
      setTimeout(function () {
        if (im.__n === 2 && im.hasAttribute('srcset')) im.removeAttribute('srcset');
        var s = im.getAttribute('src') || ''; im.src = s.replace(/([?&])r=\d+/, '') + (s.indexOf('?') < 0 ? '?' : '&') + 'r=' + im.__n;
      }, 900 * im.__n);
    }
    alle.forEach(function (im) { im.addEventListener('error', function () { if (!im.src.startsWith('data:')) nochmal(im); }); im.addEventListener('load', function () { if (im.__n) im.style.opacity = ''; }); });
    // Bilder ohne lazy laden schon vor diesem Skript; was dabei schon fehlgeschlagen ist, hier nachholen
    alle.forEach(function (im) { if (im.getAttribute('loading') !== 'lazy' && im.complete && !im.naturalWidth && im.getAttribute('src') && !im.src.startsWith('data:')) nochmal(im); });
    alle.forEach(function (im) { if (im.complete && im.naturalWidth) fertig(im); else { im.addEventListener('load', function () { fertig(im); }, { once: true }); im.addEventListener('error', function () { if (im.__n > 2) fertig(im); }, { once: true }); } });
    // Robert 17.10.2026 (Chrome): «wie kann es sein das hier das titelbild nicht lädt?» Nachlese: jedes fertig geladene Bild wird sichtbar,
    // auch wenn sein load-Ereignis vor dem Skript lag oder verpasst wurde (dazu in werkbank.css: nach 3 s ohnehin sichtbar).
    function nachlese() { alle.forEach(function (im) { if (im.complete && im.naturalWidth) fertig(im); }); }
    addEventListener('load', nachlese); addEventListener('pageshow', nachlese); setTimeout(nachlese, 1500); setTimeout(nachlese, 4000);
    if (!('IntersectionObserver' in window)) { faul.forEach(function (im) { im.loading = 'eager'; }); return; }
    var GLEICH = 6, laeuft = 0, warte = [];
    function hole(im) {
      if (im.__h) return; im.__h = 1;
      if (im.complete && im.naturalWidth) return;
      laeuft++;
      var f = function () { if (im.__f) return; im.__f = 1; laeuft--; weiter(); };
      im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }); setTimeout(f, 9000);
      im.loading = 'eager';
    }
    function weiter() { while (laeuft < GLEICH && warte.length) hole(warte.shift()); }
    var nah = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        nah.unobserve(e.target);
        if (e.target.getBoundingClientRect().top < innerHeight * 1.4) hole(e.target); else { warte.push(e.target); weiter(); }
      });
    }, { rootMargin: '300% 0px 300% 0px' });
    faul.forEach(function (im) { nah.observe(im); });
    // Bänder, Reiter und Karussells: nahe am Bildschirm werden alle ihre Bilder geholt, auch die seitlich oder hinter einem Reiter verborgenen
    // (die nächste und vorige Seite stehen damit schon, wenn man blättert)
    var gruppen = $$('.band,.ins-dev,.ins-leiste,.lu-seiten,.wfa__b,.mauer,.gst-band,[data-band],.vh-felder,.fz-band').filter(function (g) { return g.querySelector('img[loading="lazy"]'); });
    $$('[class*="band"],[class*="zug"],[class*="reihe"],[class*="leiste"],[class*="wahl"]').forEach(function (g) { if (g.scrollWidth > g.clientWidth + 20 && /auto|scroll/.test(getComputedStyle(g).overflowX) && g.querySelector('img[loading="lazy"]') && gruppen.indexOf(g) < 0) gruppen.push(g); });
    var grp = new IntersectionObserver(function (es) {
      // Robert 18.10.2026 22:09 «Ladezeiten der Bilder»: online stand der Gegenstand mitten im Register hinter vielen Bildern weiter unten in der Warteschlange.
      // Was im Band schon im Bild ist, lädt sofort und zuerst, der Rest des Bandes kommt vorn in die Schlange.
      es.forEach(function (e) { if (!e.isIntersecting) return; grp.unobserve(e.target); [].forEach.call(e.target.querySelectorAll('img[loading="lazy"]'), function (im) {
        var r = im.getBoundingClientRect();
        if (r.right > 0 && r.left < innerWidth && r.top < innerHeight * 1.4 && r.bottom > -innerHeight * .4) { try { im.fetchPriority = 'high'; } catch (_) {} hole(im); } else warte.unshift(im);
      }); weiter(); });
    }, { rootMargin: '120% 0px 120% 0px' });
    gruppen.forEach(function (g) { grp.observe(g); });
  })();

  /* ---------- Ein Takt für Leiste, Fortschritt, Treiben und Laufzeilen ---------- */
  var linie = $('.gang-linie'), links = $$('.insel nav a'), abschn = links.map(function (a) { return $(a.getAttribute('href')); }), takt = 0, breit = innerWidth > 900, anAlt = -2;
  function lauf() {
    takt = 0;
    var y = scrollY, vh = innerHeight, h = doc.documentElement.scrollHeight - vh;
    if (linie) linie.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    var an = -1;
    abschn.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.42) an = i; });
    if (an !== anAlt) { links.forEach(function (a, i) { a.classList.toggle('an', i === an); }); anAlt = an; }
    var werte = imBild.map(function (el) { var r = el.getBoundingClientRect(); return r.top + r.height / 2 - vh / 2; }); // erst alles lesen, dann alles schreiben
    imBild.forEach(function (el, i) {
      if (el.hasAttribute('data-zug')) el.style.transform = 'translate3d(' + (werte[i] * +el.getAttribute('data-zug')).toFixed(1) + 'px,0,0)';
      else if (breit) el.style.translate = '0 ' + (werte[i] * +el.getAttribute('data-drift')).toFixed(1) + 'px';
    });
  }
  addEventListener('scroll', function () { if (!takt) takt = requestAnimationFrame(lauf); }, { passive: true });
  addEventListener('resize', function () { breit = innerWidth > 900; lauf(); });
  lauf(); setTimeout(lauf, 400);

  /* ---------- Knöpfe, die der Maus ein Stück entgegenkommen ---------- */
  var zug = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zug')); if (isNaN(zug)) zug = 0.22;   // wie weit ein Knopf der Maus entgegenkommt: leicht (Robert 09.10.2026), 1 wäre die alte, starke Fassung
  if (fein && !ruhig && zug > 0) $$('.kn').forEach(function (k) {
    k.addEventListener('pointermove', function (e) { var r = k.getBoundingClientRect(); k.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.16 * zug).toFixed(1) + 'px'); k.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.28 * zug).toFixed(1) + 'px'); });
    k.addEventListener('pointerleave', function () { k.style.setProperty('--mx', '0px'); k.style.setProperty('--my', '0px'); });
  });

  /* ---------- Bänder zum Blättern ---------- */
  $$('.gang').forEach(function (g) {
    var band = $('.band', g), balken = $('.gang__b i', g), zahl = $('.gang__z', g), vor = $('[data-vor]', g), zur = $('[data-zur]', g), t = 0;
    function stand() {
      t = 0;
      var max = band.scrollWidth - band.clientWidth, k = [].slice.call(band.children), x = band.scrollLeft;
      if (balken) balken.style.transform = 'scaleX(' + Math.max(0.08, max > 0 ? x / max : 1) + ')';
      var pl = parseFloat(getComputedStyle(band).paddingLeft) || 0, nr = 1; k.forEach(function (el, i) { if (el.offsetLeft - band.offsetLeft - pl - 60 <= x) nr = i + 1; });
      if (max > 0 && x >= max - 2) nr = k.length;
      if (zahl) zahl.textContent = ('0' + nr).slice(-2) + ' / ' + ('0' + k.length).slice(-2);
      if (zur) zur.disabled = x <= 2;
      if (vor) vor.disabled = x >= max - 2;
    }
    function schritt(r) {   /* zur nächsten Karte, nie über das Ende hinaus (Safari sprang sonst auf die vorige Karte zurück) */
      var k = [].slice.call(band.children); if (!k.length) return;
      var max = band.scrollWidth - band.clientWidth, x = band.scrollLeft, pl = parseFloat(getComputedStyle(band).paddingLeft) || 0, ziel = x;
      var pos = k.map(function (el) { return Math.min(max, Math.max(0, el.offsetLeft - band.offsetLeft - pl)); });
      if (r > 0) { ziel = max; for (var i = 0; i < pos.length; i++) if (pos[i] > x + 4) { ziel = pos[i]; break; } }
      else { ziel = 0; for (var n = pos.length - 1; n >= 0; n--) if (pos[n] < x - 4) { ziel = pos[n]; break; } }
      band.scrollTo({ left: ziel, behavior: ruhig ? 'auto' : 'smooth' });
    }
    /* Bilder im Band (Robert 17.10.2026: Kacheln standen dunkel da, bis man hinblätterte): Was im Band zu sehen ist und die nächste Karte
       kommen, bevor das Band im Bild ist; nach jedem Blättern die übernächste. Der Beobachter der Seite sieht Karten rechts vom Rand nicht. */
    var bb = [].slice.call(band.children).map(function (c) { return $('img', c); }), bereit = false;
    function lade(im, hoch) { if (!im || im.__b) return; im.__b = 1; if (hoch) try { im.fetchPriority = 'high'; } catch (_) {} im.loading = 'eager'; }
    function vorhol() {
      if (!bereit) return;
      var x = band.scrollLeft, w = band.clientWidth, k = band.children, mehr = 2;
      for (var i = 0; i < k.length && mehr; i++) { if (k[i].offsetLeft - band.offsetLeft - x < w) lade(bb[i], 1); else { lade(bb[i], mehr === 2); mehr--; } }
    }
    if ('IntersectionObserver' in window) {
      var nahB = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { nahB.disconnect(); bereit = true; vorhol(); } }, { rootMargin: '250% 0px 250% 0px' });
      nahB.observe(band);
    } else { bereit = true; }
    band.addEventListener('scroll', function () { if (!t) t = requestAnimationFrame(function () { stand(); vorhol(); }); }, { passive: true });
    if (vor) vor.addEventListener('click', function () { schritt(1); });
    if (zur) zur.addEventListener('click', function () { schritt(-1); });
    /* Band blättert per Pfeil oder Wischgeste; senkrecht hat es keine eigene Scrollfläche (Robert 17.10.2026: beim Scrollen der Seite nie hängen bleiben) */
    var sx = null, sy = 0;
    band.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    band.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) schritt(dx < 0 ? 1 : -1);
    }, { passive: true });
    stand(); vorhol(); addEventListener('resize', function () { stand(); vorhol(); });
  });

  /* ---------- Vorher / Nachher ---------- */
  $$('.vgl').forEach(function (v) {
    var inp = $('input', v);
    inp.addEventListener('input', function () { v.style.setProperty('--x', inp.value + '%'); });
  });

  /* ---------- Seiten: Bühne zum Durchklicken ---------- */
  (function () {
    var S = window.SEITEN, schau = $('.schau'); if (!S || !schau) return;
    var buehne = $('.schau__s', schau), tel = $('.schau__r .tel div', schau), adr = $('.fen__k span', schau), pk = $('.schau__pk', schau), zahl = $('.schau__z', schau);
    var titel = $('.schau__t h3', schau), satz = $('.schau__t p', schau), offen = $('.schau__t a', schau), wahl = $$('.wahl button');
    var si = 0, bi = 0, bilder = [], handy = {};
    function img(src, alt) { var i = new Image(); i.decoding = 'async'; i.alt = alt || ''; i.src = src; return i; }
    function zeig(s, b, richtung) {
      var neu = s !== si || !bilder.length; si = s; var d = S[si];
      if (neu) {
        bilder.forEach(function (x) { x.remove(); }); bilder = [];
        for (var k = 0; k < d.n; k++) { var i = img('img/' + d.s + '-' + (k + 1) + '.webp', d.t + ', Ansicht ' + (k + 1)); buehne.appendChild(i); bilder.push(i); }

        titel.textContent = d.t; satz.textContent = d.x; offen.href = '../' + d.d; adr.textContent = 'carlton-europe / ' + (d.d === 'index.html' ? 'startseite' : d.d.replace('.html', ''));
        wahl.forEach(function (w, k) { w.setAttribute('aria-pressed', k === si); if (k === si) { var kiste = w.parentNode; kiste.scrollTo({ left: w.offsetLeft - kiste.clientWidth / 2 + w.offsetWidth / 2, behavior: ruhig ? 'auto' : 'smooth' }); } });
        pk.innerHTML = ''; for (var p = 0; p < d.n; p++) pk.appendChild(doc.createElement('i'));
        bi = -1;
      }
      var alt = bilder[bi], da = bilder[b];
      buehne.style.setProperty('--von', (richtung < 0 ? -6 : 6) + '%'); buehne.style.setProperty('--nach', (richtung < 0 ? 6 : -6) + '%');
      if (alt && alt !== da) { alt.classList.remove('an'); alt.classList.add('weg'); setTimeout(function () { alt.classList.remove('weg'); }, 700); }
      void da.offsetWidth; da.classList.add('an'); bi = b;
      [].forEach.call(pk.children, function (p, k) { p.classList.toggle('an', k === bi); });
      zahl.textContent = ('0' + (bi + 1)).slice(-2) + ' / ' + ('0' + d.n).slice(-2);
      /* das Telefon daneben zeigt dieselbe Stelle am Handy */
      var hk = si + '-' + bi;
      if (!handy[hk]) { handy[hk] = img('img/' + d.s + '-h' + (bi ? bi + 1 : '') + '.webp', d.t + ' am Handy, Ansicht ' + (bi + 1)); tel.appendChild(handy[hk]); }
      Object.keys(handy).forEach(function (k) { handy[k].classList.toggle('an', k === hk); });
    }
    function weiter(r) {
      var b = bi + r, s = si;
      if (b >= S[si].n) { s = (si + 1) % S.length; b = 0; }
      if (b < 0) { s = (si - 1 + S.length) % S.length; b = S[s].n - 1; }
      if (s !== si) { zeig(s, 0, r); if (b) zeig(s, b, r); } else zeig(s, b, r);
    }
    $('[data-vor]', schau).addEventListener('click', function () { weiter(1); });
    $('[data-zur]', schau).addEventListener('click', function () { weiter(-1); });
    wahl.forEach(function (w, k) { w.addEventListener('click', function () { zeig(k, 0, k < si ? -1 : 1); }); });
    schau.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') weiter(1); if (e.key === 'ArrowLeft') weiter(-1); });
    var x0 = null;
    buehne.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    buehne.addEventListener('pointerup', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 40) weiter(e.clientX < x0 ? 1 : -1); x0 = null; });
    var los = false;
    function start() { if (los) return; los = true; zeig(0, 0, 1); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { start(); o.disconnect(); } }, { rootMargin: '60% 0px' }).observe(schau); else start();
  })();

  /* ---------- Gefüge: Kacheln, Linien, Wege, Rundgang ---------- */
  var B = window.GEFUEGE, brett = $('#brett');
  if (B && brett) (function () {
    var NS = 'http://www.w3.org/2000/svg', svg = $('svg', brett), nodes = $('#brett-n'), nach = {}, kanten = [], gewaehlt = null, rund = null;
    var panel = $('.brett-p'), pk = $('#bp-k'), pt = $('#bp-t'), pp = $('#bp-p'), pw = $('#bp-w'), uhr = $('.brett-uhr'), kRund = $('#brett-rund'), kNoch = $('#brett-noch'), kopf = $$('.brett-k span');
    B.n.forEach(function (n, nr) {
      var o = { id: n[0], sp: n[1], z: n[2], titel: n[3], unter: n[4], art: n[5], lang: n[6], text: n[7], blatt: n[8] || [] };
      var d = doc.createElement('div'); d.className = 'bn' + (o.art ? ' bn--' + o.art : ''); d.style.setProperty('--kd', ((nr % 2 ? 1 : -1) * (2 + nr % 3)) + 'deg');
      var b = doc.createElement('button'); b.type = 'button';
      var hd = doc.createElement('span'); hd.className = 'hd'; hd.innerHTML = '<b></b><small></small>'; hd.firstChild.textContent = o.titel; hd.lastChild.textContent = o.unter; b.appendChild(hd);
      if (o.blatt.length) { var lv = doc.createElement('span'); lv.className = 'lv'; o.blatt.forEach(function (t) { var s = doc.createElement('span'); s.textContent = t; lv.appendChild(s); }); b.appendChild(lv); }
      d.appendChild(b); nodes.appendChild(d); o.el = d; nach[o.id] = o;
      b.addEventListener('click', function () { halt(); waehle(gewaehlt === o.id ? null : o.id); });
      // Robert 18.10.2026 13:55: «nicht so nacheinander der Reihe nach» / blasse Kacheln: Hervorheben nur bei echter Mausbewegung, nicht wenn die Seite
      // unter dem ruhenden Zeiger durchläuft, und nicht während des Auftritts
      if (fein) { b.addEventListener('pointerenter', function () { if (!gewaehlt && !rund && !brett.__auftritt && Date.now() - (window.__wbScroll || 0) > 450) waehle(o.id, false, true); }); b.addEventListener('pointerleave', function () { if (brett.dataset.schau === o.id) waehle(null); }); }
    });
    function ordne() {
      var W = brett.clientWidth, zeilen = 0, hoch = [];
      B.n.forEach(function (n) { zeilen = Math.max(zeilen, n[2] + 1); hoch[n[2]] = Math.max(hoch[n[2]] || 0, nach[n[0]].el.offsetHeight); });
      var y = 44, oben = [];
      for (var z = 0; z < zeilen; z++) { oben[z] = y; y += hoch[z] + 40; }
      var H = y + 4;
      brett.style.height = H + 'px'; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      B.n.forEach(function (n) {
        var o = nach[n[0]];
        o.x = W * B.fx[o.sp]; o.oben = oben[o.z]; o.hb = o.el.offsetWidth / 2; o.h = o.el.offsetHeight; o.y = o.oben + Math.min(34, o.h / 2);
        o.el.style.left = o.x + 'px'; o.el.style.top = o.oben + 'px';
      });
    }
    function weg(a, b, nr) {
      if (a.sp === b.sp) { var u = a.z < b.z; return { d: 'M' + a.x + ' ' + (u ? a.oben + a.h : a.oben) + ' V' + (u ? b.oben - 6 : b.oben + b.h + 6), ex: a.x, ey: u ? b.oben - 6 : b.oben + b.h + 6, w: u ? 90 : -90 }; }
      var r = b.x > a.x ? 1 : -1, x1 = a.x + r * a.hb, x2 = b.x - r * (b.hb + 7), mx = (x1 + x2) / 2 + ((nr % 5) - 2) * 10, rad = Math.min(14, Math.abs(b.y - a.y) / 2);
      if (Math.abs(b.y - a.y) < 2) return { d: 'M' + x1 + ' ' + a.y + ' H' + x2, ex: x2, ey: b.y, w: r > 0 ? 0 : 180 };
      var s = b.y > a.y ? 1 : -1;
      return { d: 'M' + x1 + ' ' + a.y + ' H' + (mx - r * rad) + ' Q' + mx + ' ' + a.y + ' ' + mx + ' ' + (a.y + s * rad) + ' V' + (b.y - s * rad) + ' Q' + mx + ' ' + b.y + ' ' + (mx + r * rad) + ' ' + b.y + ' H' + x2, ex: x2, ey: b.y, w: r > 0 ? 0 : 180 };
    }
    function zeichne() {
      ordne(); svg.innerHTML = '';
      kanten = B.k.map(function (k, i) {
        var a = nach[k[0]], b = nach[k[1]], w = weg(a, b, i);
        var p = doc.createElementNS(NS, 'path'); p.setAttribute('d', w.d); p.setAttribute('class', 'bl'); svg.appendChild(p);
        var kopf = doc.createElementNS(NS, 'path'); kopf.setAttribute('d', 'M-7,-4.5 L0,0 L-7,4.5'); kopf.setAttribute('class', 'bk');
        kopf.setAttribute('transform', 'translate(' + w.ex + ',' + w.ey + ') rotate(' + w.w + ')'); svg.appendChild(kopf);
        return { von: k[0], nach: k[1], p: p, kopf: kopf, len: p.getTotalLength() };
      });
      if (gewaehlt) waehle(gewaehlt, true);
    }
    function kette(id) {
      var drin = {}; drin[id] = 1;
      (function vor(x) { kanten.forEach(function (k) { if (k.von === x && !drin[k.nach]) { drin[k.nach] = 1; vor(k.nach); } }); })(id);
      (function zur(x) { kanten.forEach(function (k) { if (k.nach === x && !drin[k.von]) { drin[k.von] = 1; zur(k.von); } }); })(id);
      return drin;
    }
    function waehle(id, still, nurSchau) {
      if (!nurSchau) gewaehlt = id;
      brett.dataset.schau = nurSchau && id ? id : '';
      brett.classList.toggle('leise', !!id);
      var drin = id ? kette(id) : {};
      B.n.forEach(function (n) { var o = nach[n[0]]; o.el.classList.toggle('heiss', !!drin[o.id]); o.el.classList.toggle('gewaehlt', o.id === id && !nurSchau); });
      kanten.forEach(function (k) { var h = !!(drin[k.von] && drin[k.nach]); k.p.classList.toggle('heiss', h); k.kopf.classList.toggle('heiss', h); });
      if (still) return;
      panel.classList.add('neu'); void panel.offsetWidth;
      if (!id) { pk.textContent = B.start[0]; pt.textContent = B.start[1]; pp.textContent = B.start[2]; pw.textContent = ''; kopf.forEach(function (s) { s.style.color = ''; }); }
      else {
        var o = nach[id];
        pk.textContent = B.sp[o.sp]; pt.textContent = o.lang; pp.textContent = o.text;
        var namen = B.n.filter(function (n) { return drin[n[0]] && n[0] !== id; }).map(function (n) { return n[3]; });
        pw.textContent = namen.length ? 'Verbunden mit: ' + namen.join(' · ') : '';
        kopf.forEach(function (s, i) { s.style.color = i === o.sp ? '#fff' : ''; });
      }
      panel.classList.remove('neu');
    }
    function halt() { if (!rund) return; clearTimeout(rund.t); rund = null; uhr.classList.remove('laeuft'); kRund.firstChild.textContent = 'Rundgang starten'; }
    function rundgang() {
      if (rund) { halt(); waehle(null); return; }
      rund = { i: 0, t: 0 }; kRund.firstChild.textContent = 'Rundgang anhalten';
      (function naechster() {
        if (!rund) return;
        if (rund.i >= B.tour.length) { halt(); waehle(null); return; }
        var id = B.tour[rund.i++], o = nach[id];
        waehle(id);
        var sc = brett.closest('.brett-scroll'); if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollTo({ left: Math.max(0, o.x - sc.clientWidth / 2), behavior: 'smooth' });
        uhr.classList.remove('laeuft'); void uhr.offsetWidth; uhr.style.setProperty('--dauer', '4.2s'); uhr.classList.add('laeuft');
        rund.t = setTimeout(naechster, 4200);
      })();
    }
    var reihe = B.n.map(function (n) { return nach[n[0]]; }).sort(function (a, b) { return a.sp - b.sp || a.z - b.z; });
    addEventListener('scroll', function () { window.__wbScroll = Date.now(); }, { passive: true });
    spiel = function () {
      halt(); waehle(null);
      brett.__auftritt = 1; setTimeout(function () { brett.__auftritt = 0; }, reihe.length * 85 + 1600);
      if (ruhig) { brett.classList.remove('vor'); return; }
      brett.classList.add('vor');
      kanten.forEach(function (k) { k.p.style.transition = 'none'; k.p.style.strokeDasharray = k.len; k.p.style.strokeDashoffset = k.len; });
      requestAnimationFrame(function () { // in drei kleinen Schritten statt einem großen
        // der Reihe nach: Spalte für Spalte, in jeder Spalte von oben nach unten, jede Kachel im gleichen Abstand
        reihe.forEach(function (o, k) { o.dl = k * 0.085; o.el.style.transitionDelay = o.dl + 's'; var lv = $('.lv', o.el); if (lv) lv.style.transitionDelay = (o.dl + 0.45) + 's'; });
        requestAnimationFrame(function () {
          brett.classList.remove('vor');
          requestAnimationFrame(function () {
            kanten.forEach(function (k) {
              var a = nach[k.von], b = nach[k.nach], t = Math.max(a.dl || 0, b.dl || 0) + 0.35;   // die Linie zieht sich, sobald beide Kacheln stehen
              k.p.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1) ' + t + 's, opacity .45s, stroke .45s'; k.p.style.strokeDashoffset = 0;
              k.kopf.style.transition = 'opacity .4s ' + (t + 0.9) + 's, stroke .45s';
            });
          });
        });
      });
      setTimeout(function () {
        B.n.forEach(function (n) { var o = nach[n[0]]; o.el.style.transitionDelay = ''; var lv = $('.lv', o.el); if (lv) lv.style.transitionDelay = ''; });
        kanten.forEach(function (k) { k.p.style.strokeDasharray = ''; k.p.style.transition = ''; k.kopf.style.transition = ''; });
      }, reihe.length * 85 + 1600);
    };
    zeichne(); brett.classList.add('vor');
    var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(zeichne, 160); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(zeichne);
    kNoch.addEventListener('click', spiel); kRund.addEventListener('click', rundgang);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (!es[0].isIntersecting) halt(); }).observe(brett);
    if (brett.classList.contains('da') || ruhig || !('IntersectionObserver' in window)) spiel();
  })();

  /* ---------- Carlton Control: kurze Filme, Schritt für Schritt (kino.js macht sie auf Klick gross) ---------- */
  (function () {
    var st = $('.studio'); if (!st) return;
    var knoepfe = $$('.schritt', st), video = $('video', st), adr = $('.fen__k span', st), nochmal = $('[data-nochmal]', st);
    var n = -1, sichtbar = false, hand = false;
    function setz(i, spielen) {
      n = (i + knoepfe.length) % knoepfe.length;
      knoepfe.forEach(function (k, j) { k.setAttribute('aria-pressed', j === n); k.style.setProperty('--f', 0); });
      var k = knoepfe[n];
      video.poster = k.getAttribute('data-bild'); video.src = k.getAttribute('data-film'); adr.textContent = k.getAttribute('data-adr');
      if (spielen && !ruhig) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      if (hand && innerWidth < 1100) k.parentNode.scrollTo({ left: k.offsetLeft - 20, behavior: 'smooth' });
    }
    knoepfe.forEach(function (k, i) { k.addEventListener('click', function () { hand = true; setz(i, true); }); });
    video.addEventListener('timeupdate', function () { if (video.duration && n >= 0) knoepfe[n].style.setProperty('--f', (video.currentTime / video.duration).toFixed(3)); });
    video.addEventListener('ended', function () { if (n >= 0) knoepfe[n].style.setProperty('--f', 1); setTimeout(function () { if (sichtbar && !doc.body.classList.contains('kino-offen')) setz(n + 1, true); }, 900); });
    if (nochmal) nochmal.addEventListener('click', function () { video.currentTime = 0; video.play(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      sichtbar = es[0].isIntersecting;
      if (sichtbar) { if (n < 0) setz(0, true); else if (!ruhig) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } } else if (n >= 0) video.pause();
    }, { threshold: 0.35 }).observe($('.kino', st)); else setz(0, false);
  })();
})();
/* «Alles auf einen Blick» als Knopf zurück (Robert 18.10.2026 ~23:00): auf jeder Seite, die werkbank.js lädt, auch das gemeinsame Skript
   zur-werkbank.js (dasselbe wie in La Maison und den Werkzeugen). In der Werkbank hängt es die Herkunft samt Höhe an die Links, sonst zeigt es den Knopf. */
(function () {
  if (document.querySelector('script[src*="zur-werkbank.js"]')) return;
  var me = document.querySelector('script[src*="werkbank.js"]'); if (!me) return;
  var wurzel = me.src.replace(/werkbank\/werkbank\.js.*$/, ''); if (wurzel === me.src) return;
  var s = document.createElement('script'); s.src = wurzel + 'maison/zur-werkbank.js'; s.defer = true; document.head.appendChild(s);
})();
