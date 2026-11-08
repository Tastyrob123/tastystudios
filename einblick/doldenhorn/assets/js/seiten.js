/* Waldhotel Doldenhorn — Bedienung der Seiten vom 13.10.2026 (Veranstaltungen, Reisen ohne Stress, Abreise, Umgebungskarte).
   Kein Scroll-Lauscher, keine Bewegung: nur Klicks, Rechnen und das Zusammenstellen einer E-Mail an das Haus. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var h = new Date(), zwei = function (n) { return (n < 10 ? '0' : '') + n; };
  var heute = h.getFullYear() + '-' + zwei(h.getMonth() + 1) + '-' + zwei(h.getDate());
  var chf = function (n) { return n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var tagLang = function (s) { var p = (s || '').split('-'); if (p.length !== 3) return s; return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  var mail = function (an, betreff, zeilen) { if (window.DHAnfrage) window.DHAnfrage.oeffne({ an: an, betreff: betreff, text: zeilen.join('\n') }); else location.href = 'mailto:' + an + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(zeilen.join('\n')); };   // ins Anfrage-Fenster, nie ins Mailprogramm (Robert 16.10.2026)

  /* Veranstaltungen: sind alle Blätter vorbei (main.js nimmt sie heraus und versteckt das Raster), steht stattdessen ein Satz da */
  $$('[data-wochen]').forEach(function (g) { var l = g.parentNode && $('[data-leer]', g.parentNode); if (l && (g.hidden || !g.children.length)) l.hidden = false; });

  /* Datumsfelder, die nicht in der Vergangenheit liegen dürfen */
  $$('input[data-ab-heute]').forEach(function (i) { i.min = heute; });

  /* Formulare, die als E-Mail an das Haus gehen: jede ausgefüllte Zeile mit ihrer Beschriftung */
  $$('form[data-post]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = [];
      [].forEach.call(f.elements, function (el) {
        if (!el.name || el.type === 'submit' || el.type === 'button') return;
        var lab = el.closest('label'), sp = lab && lab.querySelector('span'), w = el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).textContent : el.value;
        if (!w) return;
        if (el.type === 'date') w = tagLang(w); else if (el.type === 'time') w += ' Uhr';
        z.push((sp ? sp.textContent.trim() : el.name) + ': ' + w);
      });
      mail(f.getAttribute('data-an'), f.getAttribute('data-betreff') || 'Anfrage', z);
    });
  });

  /* Reisen ohne Stress: Richtpreis aus der Preisliste des Hausmagazins, Anfrage als E-Mail */
  var fr = $('form[data-reise]');
  if (fr) (function () {
    var D = JSON.parse($('[data-reise-daten]', fr).textContent), el = fr.elements, summeEl = $('[data-summe]', fr), zeilenEl = $('[data-zeilen]', fr), hinEl = $('[data-hinweis]', fr), ortFeld = $('[data-nur-abholen]', fr);
    [].slice.call(el.woche.options).forEach(function (o) { var ab = o.getAttribute('data-ab'); if (ab && ab < heute) el.woche.removeChild(o); });   /* Wochen, deren Anreisetag vorbei ist */
    var stand = {};
    function rechne() {
      var z = D.zimmer[+el.zimmer.value] || D.zimmer[0], n = +el.pers.value || 1, mit = el.abholen.value === 'mit';
      if (!z) return;
      var abhol = mit && n >= 2, preis = abhol ? z.mit : z.ohne, zeilen = [[n + ' × ' + z.name + (abhol ? ', mit Abholservice' : ', ohne Abholservice'), n * preis]], summe = n * preis, hin = '';
      if (n === 1 && z.einzel) { zeilen.push(['Einzelzimmerzuschlag', z.einzel]); summe += z.einzel; }
      if (mit && n < 2) hin = 'Der Abholservice ist laut Hausmagazin ab 2 Personen inbegriffen. Für eine Person rechnet der Richtpreis ohne ihn; den Preis für die Fahrt nennt Ihnen die Rezeption.';
      summeEl.textContent = chf(summe);
      zeilenEl.innerHTML = zeilen.map(function (x) { return '<li><span></span><b>CHF ' + chf(x[1]) + '</b></li>'; }).join('') + '<li><span>' + D.naechte + ' Nächte, Sonntag bis Samstag</span><b></b></li>';
      $$('li span', zeilenEl).forEach(function (s, i) { if (zeilen[i]) s.textContent = zeilen[i][0]; });
      hinEl.textContent = hin; hinEl.hidden = !hin;
      if (ortFeld) ortFeld.hidden = !mit;
      stand = { zimmer: z.name, n: n, mit: mit, abhol: abhol, summe: summe };
    }
    fr.addEventListener('input', rechne); fr.addEventListener('change', rechne); rechne();
    fr.addEventListener('submit', function (e) {
      e.preventDefault(); rechne();
      var w = el.woche.options[el.woche.selectedIndex];
      mail(D.mail, 'Reisen ohne Stress', ['Guten Tag', '', 'ich interessiere mich für «Reisen ohne Stress».', '',
        'Woche: ' + (w ? w.textContent : ''), 'Zimmer: ' + stand.zimmer, 'Personen: ' + stand.n, 'Abholservice: ' + (stand.mit ? 'ja' : 'nein') + (stand.mit && el.ort.value ? ', Abholort ' + el.ort.value : ''),
        'Richtpreis laut Hausmagazin: CHF ' + chf(stand.summe), '', 'Name: ' + el.name.value, el.tel.value ? 'Telefon: ' + el.tel.value : '', el.wunsch.value ? 'Hinweis: ' + el.wunsch.value : ''].filter(function (x, i, a) { return x !== '' || a[i - 1] !== ''; }));
    });
  })();

  /* Umgebungskarte: Ort in der Liste und Zeichen auf der Karte gehören zusammen. Ein Klick wählt, die Karte hebt den Ort hervor */
  var uk = $('[data-umgebung]');
  if (uk) (function () {
    var zeilen = $$('.uk-zeile', uk), orte = $$('.uk-ort', uk), seen = $$('.uk-see', uk);
    function waehle(key) {
      zeilen.forEach(function (z) { z.setAttribute('aria-pressed', String(z.getAttribute('data-ort') === key)); });
      orte.forEach(function (o) { o.classList.toggle('an', o.getAttribute('data-ort') === key); });
      seen.forEach(function (s) { var k = s.getAttribute('data-see'); s.classList.toggle('an', (key === 'oeschinen' && k === 'oeschinensee') || key === k); });
    }
    /* Robert 18.10.2026, 14:03: «den Übergang beim Klicken noch sanfter machen, dass die Sachen sich noch sanfter öffnen. Die Kacheln rechts.»
       Die Zeilen springen nicht mehr an ihren neuen Platz, sie gleiten dorthin (nur transform, Regel 55); die geöffnete Karte blendet ihren Inhalt weich ein. */
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* Robert 18.10.2026, 18:19: «da den Effekt Übergang bearbeiten. Das ist nicht sanft, sondern springt richtig einmal nach unten.»
       Der neue Ort klappt in 0,5 s weich auf, der vorige gleichzeitig weich zu (sein Inhalt bleibt dabei stehen und blendet aus).
       Die Seite springt nicht und scrollt nicht von selbst, die Karte links bleibt ruhig; die Zeilen rücken weich nach. */
    var DAUER = 520, KURVE = 'cubic-bezier(.22,1,.36,1)';
    function gleite(key, zeile) {
      if (still || !zeilen[0] || !zeilen[0].animate) { waehle(key); return; }
      var alt = zeilen.filter(function (z) { return z.getAttribute('aria-pressed') === 'true'; })[0];
      var neu = zeilen.filter(function (z) { return z.getAttribute('data-ort') === key; })[0];
      if (!neu || neu === alt) { waehle(key); return; }
      var halt = zeile || neu, oben = halt.getBoundingClientRect().top;
      var h0 = { alt: alt ? alt.offsetHeight : 0, neu: neu.offsetHeight };
      zeilen.forEach(function (z) { (z._lauf || []).forEach(function (a) { a.cancel(); }); z._lauf = []; z.classList.remove('zu'); z.style.overflow = ''; });
      waehle(key);
      var h1 = { alt: alt ? alt.offsetHeight : 0, neu: neu.offsetHeight };
      if (alt) {
        alt.classList.add('zu'); alt.style.overflow = 'hidden';
        alt._lauf.push(alt.animate([{ height: h0.alt + 'px' }, { height: h1.alt + 'px' }], { duration: DAUER, easing: KURVE }));
        Array.prototype.forEach.call(alt.children, function (k) { if (k.tagName !== 'B') alt._lauf.push(k.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DAUER * .6, easing: 'ease-out', fill: 'forwards' })); });
        alt._lauf[0].onfinish = function () { alt.classList.remove('zu'); alt.style.overflow = ''; alt._lauf.forEach(function (a) { a.cancel(); }); alt._lauf = []; };
      }
      neu.style.overflow = 'hidden';
      neu._lauf.push(neu.animate([{ height: h0.neu + 'px' }, { height: h1.neu + 'px' }], { duration: DAUER, easing: KURVE }));
      neu._lauf[0].onfinish = function () { neu.style.overflow = ''; neu._lauf = []; };
      var t0 = performance.now();
      /* Die Seite scrollt nicht (die Karte links bleibt ruhig); nur wenn die angetippte Zeile beim Nachrücken unter die Kopfleiste geriete, geht die Seite so weit mit, dass sie sichtbar bleibt */
      var rand = 116;
      (function halte() { var d = halt.getBoundingClientRect().top; if (d < rand && oben >= rand) scrollBy(0, d - rand); if (performance.now() - t0 < DAUER + 80) requestAnimationFrame(halte); })();
    }
    zeilen.forEach(function (z) { z.addEventListener('click', function () { if (z.getAttribute('aria-pressed') !== 'true') gleite(z.getAttribute('data-ort'), z); }); });
    /* Robert 17.10.2026: beim Drüberfahren zeigt die Karte den Ort vor, ohne ihn zu wählen */
    function vor(key) { orte.forEach(function (o) { o.classList.toggle('vor', o.getAttribute('data-ort') === key); }); seen.forEach(function (s) { var k = s.getAttribute('data-see'); s.classList.toggle('vor', !!key && ((key === 'oeschinen' && k === 'oeschinensee') || key === k)); }); }
    zeilen.forEach(function (z) { z.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') vor(z.getAttribute('data-ort')); }); z.addEventListener('pointerleave', function () { vor(''); }); });
    orte.forEach(function (o) { o.addEventListener('click', function () { gleite(o.getAttribute('data-ort')); }); });
    waehle((zeilen[0] && zeilen[0].getAttribute('data-ort')) || 'hotel');
  })();
})();

/* Gutschein auf «Angebote» (Robert 15.10.2026): die Karte links zeigt, was gerade gewählt ist (Wert, Art, für wen). Liest nur aus dem Formular, das dienste.js rechnet. */
(function () {
  var b = document.querySelector('[data-gs-bild]'), fo = document.querySelector('form[data-gutschein]'); if (!b || !fo) return;
  var el = fo.elements, q = function (s) { return b.querySelector(s); };
  var ART = { wert: 'Wertgutschein', menu: 'Le Grand Menu im Au Gourmet', massage: 'Eine Behandlung im Spa', aufenthalt: 'Gourmet-Aufenthalt für zwei' };
  function neu() {
    var a = (fo.querySelector('[data-art][aria-pressed="true"]') || {}).getAttribute ? fo.querySelector('[data-art][aria-pressed="true"]').getAttribute('data-art') : 'wert';
    var w = fo.querySelector('[data-wert]');
    b.setAttribute('data-art', a);
    q('[data-gs-wert]').textContent = 'CHF ' + (w ? w.textContent : '');
    var t = ART[a] || ART.wert;
    if (a === 'massage') { var k = fo.querySelector('[data-wahl-knopf] b'); if (k) t = k.textContent; }
    if (a === 'aufenthalt' && el.zimmer && el.zimmer.selectedIndex >= 0) t = 'Gourmet-Aufenthalt, ' + el.zimmer.options[el.zimmer.selectedIndex].text;
    q('[data-gs-was]').textContent = t;
    q('[data-gs-fuer]').textContent = 'für ' + ((el.fuer && el.fuer.value.trim()) || 'Sie');
  }
  fo.addEventListener('input', function () { setTimeout(neu, 0); });
  fo.addEventListener('change', function () { setTimeout(neu, 0); });
  fo.addEventListener('click', function () { setTimeout(neu, 0); });
  neu();
})();

/* Küchenfest-Galerie (16.10.2026): das Band läuft nur, solange es im Bild ist */
(function () {
  var g = document.querySelectorAll('.kfg'); if (!g.length || !window.IntersectionObserver) { [].forEach.call(g, function (x) { x.classList.add('laeuft'); }); return; }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); }, { rootMargin: '10% 0px' });
  [].forEach.call(g, function (x) { io.observe(x); });
})();

/* ---------- Zimmerseiten: Fotos tauschen den Platz (Robert 17.10.2026: «auf die Bilder klicken … das Bild wird gross, die tauschen»; dann «noch nicht ideal:
   blendet, tauscht nochmal falsch aus, das Einsetzen ist nicht schön»). Neu gebaut: die echten Fotos bleiben in ihrem Rahmen und behalten ihre Bewegung
   (Gleiten, Zoom); fliegen tun zwei Abbilder, die über der Seite liegen. Ablauf: (1) das Foto für den grossen Platz in seiner grossen Fassung vorladen und
   entschlüsseln, (2) beide Abbilder deckungsgleich über die Rahmen legen, die echten Fotos verstecken und tauschen, (3) Flug 0,9 s, nur transform, das Abbild
   endet genau in der Ruhelage des Ziels (Massstab und Versatz des Gleitens), (4) erst wenn die echten Fotos fertig gezeichnet sind, verschwinden die Abbilder.
   Kein Einblenden, kein Neustart einer Bewegung, kein Nachladen im Bild. ---------- */
(function () {
  var reihe = document.querySelector('#zimmer .stock--reihe'), gross = document.querySelector('#zimmer .paar > .rahmen'); if (!reihe || !gross) return;
  var WAS = ['src', 'srcset', 'alt', 'width', 'height'], busy = false;
  var still = function () { return document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var bild = function (f) { return f.querySelector('.rahmen__k img'); }, platte = function (f) { return f.querySelector('.rahmen__k'); };
  var lies = function (im) { var w = {}; WAS.forEach(function (n) { w[n] = im.getAttribute(n); }); w.hg = im.style.background; return w; };
  var setze = function (im, w) { WAS.forEach(function (n) { if (w[n] === null || w[n] === undefined) im.removeAttribute(n); else im.setAttribute(n, w[n]); }); im.style.background = w.hg || ''; };
  var sanft = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var fertig = function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); };
  /* Ruhelage eines Fotos in seinem Rahmen (Gleiten und Zoom setzen translate, scale und transform) */
  function ruhe(im) {
    var c = getComputedStyle(im), m = c.transform && c.transform !== 'none' ? new DOMMatrix(c.transform) : new DOMMatrix(), s = m.a || 1, y = m.f || 0;
    if (c.translate && c.translate !== 'none') y += parseFloat(c.translate.split(' ')[1]) || 0;
    if (c.scale && c.scale !== 'none') s *= parseFloat(c.scale) || 1;
    return { s: s, y: y };
  }
  function vorladen(quelle, ziel) {   /* die Fassung, die der Zielplatz zeigen wird (srcset der Quelle, sizes des Ziels) */
    var im = new Image(); im.decoding = 'sync'; im.alt = '';
    if (ziel.getAttribute('sizes')) im.sizes = ziel.getAttribute('sizes');
    if (quelle.getAttribute('srcset')) im.srcset = quelle.getAttribute('srcset');
    im.src = quelle.getAttribute('src');
    return fertig(im).then(function () { return im; });
  }
  /* Abbild: liegt im Dokument am Zielplatz, startet über dem Quellplatz und fliegt mit transform an seinen Platz */
  function abbild(im, von, nach, rad, r0, r1, oben) {
    var a = (+im.naturalWidth || 3) / (+im.naturalHeight || 2), fuell = function (w, h) { var cw = Math.max(w, h * a); return { w: cw, h: cw / a }; };
    var d = document.createElement('div'), x = scrollX, y = scrollY;
    d.className = 'tausch-abbild';
    d.style.cssText = 'position:absolute;left:' + (nach.left + x) + 'px;top:' + (nach.top + y) + 'px;width:' + nach.width + 'px;height:' + nach.height + 'px;border-radius:' + rad + ';overflow:hidden;z-index:' + (oben ? 41 : 40) + ';pointer-events:none;transform-origin:0 0;contain:paint';
    var CL = fuell(nach.width, nach.height);
    im.style.cssText = 'position:absolute;left:' + ((nach.width - CL.w) / 2) + 'px;top:' + ((nach.height - CL.h) / 2) + 'px;width:' + CL.w + 'px;height:' + CL.h + 'px;max-width:none;transform-origin:50% 50%;display:block';
    d.appendChild(im); document.body.appendChild(d);
    var kd = [], ki = [], N = 30, i, t, sx, sy, w, h, CR, g, v;
    for (i = 0; i <= N; i++) { t = sanft(i / N);
      w = von.width + (nach.width - von.width) * t; h = von.height + (nach.height - von.height) * t; sx = w / nach.width; sy = h / nach.height;
      CR = fuell(w, h); g = r0.s + (r1.s - r0.s) * t; v = r0.y + (r1.y - r0.y) * t;
      kd.push({ transform: 'translate(' + ((von.left - nach.left) * (1 - t)).toFixed(2) + 'px,' + ((von.top - nach.top) * (1 - t)).toFixed(2) + 'px) scale(' + sx.toFixed(5) + ',' + sy.toFixed(5) + ')' });
      ki.push({ transform: 'translate(0,' + (v / sy).toFixed(2) + 'px) scale(' + (g * CR.w / CL.w / sx).toFixed(5) + ',' + (g * CR.h / CL.h / sy).toFixed(5) + ')' }); }
    var zeit = { duration: still() ? 1 : 900, easing: 'linear', fill: 'forwards' };
    d.animate(kd, zeit); var lauf = im.animate(ki, zeit);
    return { el: d, fertig: lauf.finished.catch(function () {}) };
  }
  function tausche(a, b) {
    if (busy) return; busy = true;
    var ia = bild(a), ib = bild(b), ka = platte(a), kb = platte(b), wa = lies(ia), wb = lies(ib);
    Promise.all([vorladen(ib, ia), vorladen(ia, ib)]).then(function (pre) {
      var ra = ka.getBoundingClientRect(), rb = kb.getBoundingClientRect(), ua = ruhe(ia), ub = ruhe(ib);
      var rada = getComputedStyle(ka).borderRadius, radb = getComputedStyle(kb).borderRadius;
      /* Abbild von b fliegt nach a (oben, es wird gross oder klein je nach Richtung), Abbild von a nach b */
      var gA = abbild(pre[0], rb, ra, rada, ub, ua, ra.width > rb.width), gB = abbild(pre[1], ra, rb, radb, ua, ub, rb.width > ra.width);
      [ia, ib].forEach(function (im) { im.style.visibility = 'hidden'; });
      a.classList.add('tauscht'); b.classList.add('tauscht');
      setze(ia, wb); setze(ib, wa); ia.loading = ib.loading = 'eager';
      return Promise.all([gA.fertig, gB.fertig, fertig(ia), fertig(ib)]).then(function () {
        [ia, ib].forEach(function (im) { im.style.visibility = ''; });
        requestAnimationFrame(function () { requestAnimationFrame(function () { gA.el.remove(); gB.el.remove(); a.classList.remove('tauscht'); b.classList.remove('tauscht'); busy = false; }); });
      });
    }).catch(function () { busy = false; });
  }
  [].forEach.call(reihe.parentNode.querySelectorAll('.stock--reihe > figure[role="button"]'), function (f) {
    f.addEventListener('click', function (e) { e.preventDefault(); tausche(f, gross); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tausche(f, gross); } });
  });
})();

/* Leiste: Untermenüs ohne Flackern (Robert 17.10.2026). Öffnen nach 130 ms Ruhe auf dem Menüpunkt, Schliessen 260 ms nach dem Verlassen, immer nur eines offen. */
(function () {
  if (!matchMedia('(hover:hover)').matches) return;
  var gs = [].slice.call(document.querySelectorAll('.nav__g')); if (!gs.length) return;
  var auf = null, tAuf = 0, tZu = 0;
  function zeige(g) { clearTimeout(tZu); if (auf && auf !== g) auf.classList.remove('offen'); auf = g; if (g) g.classList.add('offen'); }
  gs.forEach(function (g) {
    g.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; clearTimeout(tZu); clearTimeout(tAuf); tAuf = setTimeout(function () { zeige(g); }, auf ? 0 : 130); });
    g.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'mouse') return; clearTimeout(tAuf); tZu = setTimeout(function () { if (auf === g) { g.classList.remove('offen'); auf = null; } }, 260); });
  });
  addEventListener('scroll', function () { if (auf) { auf.classList.remove('offen'); auf = null; } }, { passive: true });
})();
