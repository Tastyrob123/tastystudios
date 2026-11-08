/* Tasty Studios — ein Takt, nativer Scroll, Bewegung nur über transform/opacity. Fällt das Skript aus, steht alles sichtbar da. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var hatIO = 'IntersectionObserver' in window;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }

  /* Fotos früh holen: was in den nächsten zweieinhalb Fensterhöhen liegt, wird vorgezogen und vor dem Auftritt entpackt */
  var faul = alle('img[loading="lazy"]');
  if (faul.length && hatIO) {
    var nah = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        nah.unobserve(e.target);
        var ziel = e.target.tagName === 'IMG' ? [e.target] : alle('img[loading]', e.target);
        ziel.forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
      });
    }, { rootMargin: '250% 40% 250% 40%' });
    var gruppen = [];
    faul.forEach(function (im) {
      var z = im.closest('.bruch,.band,[data-gruppe]') || im;
      if (z !== im) { if (gruppen.indexOf(z) > -1) return; gruppen.push(z); }
      nah.observe(z);
    });
  }

  /* Auftritte */
  var ziele = alle('[data-r]');
  function wennBereit(el, dann) {
    var offen = alle('img', el).filter(function (im) { return im.offsetParent !== null; });
    if (el.tagName === 'IMG') offen = [el];
    var n = offen.length, los = false;
    var fertig = function () { if (los) return; los = true; dann(); };
    if (!n) return fertig();
    var eins = function () { if (--n <= 0) fertig(); };
    offen.forEach(function (im) {
      var entpackt = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
      if (im.complete && im.naturalWidth) return entpackt();
      im.loading = 'eager';
      im.addEventListener('load', entpackt, { once: true });
      im.addEventListener('error', eins, { once: true });
    });
    setTimeout(fertig, 1200);
  }
  if (ruhig || !hatIO) {
    ziele.forEach(function (el) { el.classList.add('da'); });
    alle('.gef,.kap').forEach(function (el) { el.classList.add('da'); });
  } else {
    /* Beobachter reichen nach oben weit über das Fenster hinaus: wer per Anker springt, lässt nichts unsichtbar zurück */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: '100000px 0px -9% 0px', threshold: 0.04 });
    var bio = new IntersectionObserver(function (es) {   /* Bilder: sobald die Oberkante ins Fenster rückt, und erst wenn sie geladen sind */
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        bio.unobserve(e.target);
        wennBereit(e.target, function () { e.target.classList.add('da'); });
      });
    }, { rootMargin: '100000px 0px 2% 0px', threshold: 0.01 });
    var gio = new IntersectionObserver(function (es) {   /* Gruppen: alle starten gemeinsam und kommen nacheinander */
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        gio.unobserve(e.target);
        wennBereit(e.target, function () { e.target.classList.add('da'); alle('[data-r]', e.target).forEach(function (k) { k.classList.add('da'); }); });
      });
    }, { rootMargin: '100000px 0px -4% 0px', threshold: 0.05 });
    alle('[data-gruppe]').forEach(function (g) { gio.observe(g); });
    /* Fenster: der Satz steht fest in der Mitte und startet, wenn der Ausschnitt ihn zu zwei Dritteln freigibt */
    alle('.bruch').forEach(function (b) {
      var fio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) return; fio.disconnect(); alle('[data-r]', b).forEach(function (k) { k.classList.add('da'); }); });
      }, { rootMargin: '100000px 0px -30% 0px', threshold: 0.01 });
      fio.observe(b);
    });
    ziele.forEach(function (el) {
      if (el.closest('.hero')) { requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('da'); }); }); return; }
      if (el.closest('.bruch') || el.closest('[data-gruppe]')) return;
      var art = el.getAttribute('data-r');
      if (art === 'bild' || art === 'schweb' || art === 'edel' || art === 'kachel') bio.observe(el); else io.observe(el);
    });
    alle('.kap:not([data-r])').forEach(function (k) { io.observe(k); });
  }
  /* Erster Blick komplett (Robert 31.10.2026): die Seite wird erst sichtbar, wenn die Bilder im ersten Bild geladen sind, dann kommt alles in einem Moment */
  var buehne = document.querySelector('.hero__buehne');
  function zeigeSeite() {
    doc.classList.remove('warte');
    if (buehne && !ruhig) requestAnimationFrame(function () { requestAnimationFrame(function () { alle('[data-r]', buehne).forEach(function (k) { k.classList.add('da'); }); }); });
  }
  if (buehne && !ruhig) {
    alle('[data-r]', buehne).forEach(function (k) { k.classList.remove('da'); });
    var erst = alle('img', buehne), offen = erst.length, los = false;
    var fertigAlle = function () { if (los) return; los = true; zeigeSeite(); };
    var einer = function () { if (--offen <= 0) fertigAlle(); };
    if (!offen) fertigAlle();
    erst.forEach(function (im) { if (im.complete && im.naturalWidth) return einer(); im.addEventListener('load', einer, { once: true }); im.addEventListener('error', einer, { once: true }); });
    setTimeout(fertigAlle, 3500);
  } else { zeigeSeite(); }

  /* Laufbänder: laufen nur, solange sie im Bild sind */
  var zuege = alle('.laufband,.fuss__band');
  if (zuege.length && !ruhig && hatIO) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); }, { rootMargin: '80px 0px' });
    zuege.forEach(function (z) { lio.observe(z); });
  }

  /* Grosse Zahlen: hochzählen, sobald sie im Bild sind */
  var zahlen = alle('[data-zahl]');
  if (zahlen.length && !ruhig && hatIO) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        zio.unobserve(e.target);
        var el = e.target, ziel = +el.getAttribute('data-zahl'), t0 = null, dauer = 1500;
        if (ziel <= 3) return;
        function schritt(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 4); el.firstChild.nodeValue = Math.round(ziel * w); if (p < 1) requestAnimationFrame(schritt); }
        el.firstChild.nodeValue = '0';
        setTimeout(function () { requestAnimationFrame(schritt); }, 250);
      });
    }, { threshold: 0.3 });
    zahlen.forEach(function (z) { zio.observe(z); });
  }

  /* Buchstaben-Rollen in der Leiste und im Fuss */
  alle('.rl').forEach(function (el) {
    var t = el.textContent; el.textContent = ''; el.setAttribute('aria-label', t);
    t.split('').forEach(function (c, k) { var i = document.createElement('i'); i.textContent = c; i.setAttribute('data-b', c); i.style.setProperty('--k', k); el.appendChild(i); });
  });

  /* Menü am Handy */
  var nav = document.querySelector('.nav'), burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var an = doc.classList.toggle('offen');
      burger.setAttribute('aria-expanded', an);
      document.body.style.overflow = an ? 'hidden' : '';
    });
    alle('.menue a').forEach(function (a) { a.addEventListener('click', function () { doc.classList.remove('offen'); document.body.style.overflow = ''; }); });
  }

  /* Bänder: Pfeile, Laufbalken, mit der Maus ziehen (Blättern selbst bleibt nativ) */
  alle('[data-band]').forEach(function (hof) {
    var band = hof.querySelector('.band'), balken = hof.querySelector('.laufbalken'), strich = balken && balken.querySelector('i');
    var pf = alle('.pfeile button', hof), frei = true;
    function richte() {
      var weg = band.scrollWidth - band.clientWidth;
      var teil = band.scrollWidth ? Math.min(1, band.clientWidth / band.scrollWidth) : 1;
      var p = weg > 0 ? band.scrollLeft / weg : 0;
      if (strich) { strich.style.width = (teil * 100).toFixed(1) + '%'; strich.style.transform = 'translateX(' + (p * balken.clientWidth * (1 - teil)).toFixed(1) + 'px)'; }
      if (pf.length) { pf[0].disabled = band.scrollLeft < 4; pf[1].disabled = band.scrollLeft > weg - 4; }
      var fuss = hof.querySelector('.bandfuss'); if (fuss) fuss.style.visibility = weg > 4 ? 'visible' : 'hidden';
    }
    band.addEventListener('scroll', function () { if (!frei) return; frei = false; requestAnimationFrame(function () { frei = true; richte(); }); }, { passive: true });
    pf.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var k = band.firstElementChild; if (!k) return;
        band.scrollBy({ left: (i ? 1 : -1) * (k.offsetWidth + 20) * (band.clientWidth > 900 ? 2 : 1), behavior: ruhig ? 'auto' : 'smooth' });
      });
    });
    var unten = false, x0 = 0, s0 = 0, weit = false;
    band.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; unten = true; weit = false; x0 = e.clientX; s0 = band.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!unten) return; var d = e.clientX - x0; if (Math.abs(d) > 4) { weit = true; band.classList.add('zieht'); } band.scrollLeft = s0 - d; });
    window.addEventListener('pointerup', function () { unten = false; band.classList.remove('zieht'); });
    band.addEventListener('click', function (e) { if (weit) { e.preventDefault(); e.stopPropagation(); weit = false; } }, true);
    band.addEventListener('dragstart', function (e) { e.preventDefault(); });
    window.addEventListener('resize', richte); window.addEventListener('load', richte); richte();
  });

  /* Gefüge: die Linien zeichnen sich, sobald das Gefüge im Bild ist; eine Seite überfahren hebt ihre Linie, die Mitte nennt ihre Rolle */
  alle('.gef').forEach(function (g) {
    var svg = g.querySelector('.gef__linien'), mitte = g.querySelector('.gef__mitte'), knoten = alle('.gefk', g);
    var klein = mitte && mitte.querySelector('.kachel__n small'), stand = klein ? klein.textContent : '';
    function zeichne() {
      if (!svg || !mitte) return;
      var r = (g.querySelector('.gef__raster') || g).getBoundingClientRect(), m = mitte.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
      var mx = m.left - r.left + m.width / 2, my = m.top - r.top + m.height / 2;
      var pfade = alle('path', svg);
      knoten.forEach(function (k, i) {
        var b = k.getBoundingClientRect(), x = b.left - r.left + b.width / 2, y = b.top - r.top + b.height / 2;
        var links = x < mx, ax = links ? b.right - r.left : b.left - r.left, bx = links ? m.left - r.left : m.right - r.left;
        var c = (ax + bx) / 2;
        if (pfade[i]) pfade[i].setAttribute('d', 'M' + ax + ' ' + y + ' C' + c + ' ' + y + ' ' + c + ' ' + my + ' ' + bx + ' ' + my);
      });
    }
    zeichne(); window.addEventListener('resize', zeichne); window.addEventListener('load', zeichne);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(zeichne);
    if (hatIO && !ruhig) new IntersectionObserver(function (es) { if (es[0].isIntersecting) { zeichne(); g.classList.add('da'); } }, { threshold: 0.25 }).observe(g);
    else g.classList.add('da');
    knoten.forEach(function (k, i) {
      var p = svg && alle('path', svg)[i];
      function rein() { if (p) p.classList.add('an'); if (klein) klein.textContent = k.getAttribute('data-rolle') || stand; }
      function raus() { if (p) p.classList.remove('an'); if (klein) klein.textContent = stand; }
      k.addEventListener('pointerenter', rein); k.addEventListener('pointerleave', raus); k.addEventListener('focusin', rein); k.addEventListener('focusout', raus);
    });
  });

  /* Ketten: die Glieder springen nacheinander an, solange die Kette im Bild ist, dann von vorn */
  alle('.kette').forEach(function (k) {
    var gl = alle('.kette__g span', k), uhr = null, sichtbar = false, ist = -1;
    function schritt() {
      if (!sichtbar || ruhig) return;
      ist++;
      if (ist >= gl.length + 2) { ist = -1; gl.forEach(function (s) { s.classList.remove('an'); }); uhr = setTimeout(schritt, 900); return; }
      if (gl[ist]) gl[ist].classList.add('an');
      uhr = setTimeout(schritt, ist >= gl.length ? 1600 : 700);
    }
    if (ruhig || !hatIO) { gl.forEach(function (s) { s.classList.add('an'); }); return; }
    new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; clearTimeout(uhr); if (sichtbar) uhr = setTimeout(schritt, 500); }, { threshold: 0.5 }).observe(k);
  });

  /* Tasten im Formular: gewählt = helle Fläche, kein Punkt */
  alle('.tasten').forEach(function (t) {
    alle('.taste', t).forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); }); });
  });
  /* Anfrage aus einem Knopf der Startseite (Robert 04.11.2026): ?anliegen= setzt Betreff und ersten Satz */
  var ANLIEGEN = {
    'branding': ['Mein Branding entdecken', 'Wir möchten sehen, wie Sie das Branding für unser Haus entwickeln würden.'],
    'ki-check': ['Mein KI-Check', 'Wir möchten wissen, wie ChatGPT und andere KIs unser Haus heute finden und beschreiben.']
  };
  var anl = ANLIEGEN[(/[?&]anliegen=([a-z-]+)/.exec(location.search) || [])[1]];
  if (anl) alle('form.form').forEach(function (f) {
    f.setAttribute('data-betreff', anl[0]);
    var t = f.querySelector('[name="text"]'); if (t && !t.value) t.value = anl[1];
  });
  /* Formular (Robert 04.11.2026: «direkt von der Website aus in mein Postfach, ohne Zwischenschritt»): schickt die Anfrage an
     tasty-besuche.vercel.app/api/anfrage, der Dienst mailt sie an robert@tasty-studios.de. Gespeichert wird nichts.
     Geht das schief (kein Netz, Dienst aus), öffnet sich wie früher eine fertige Mail im Mailprogramm, damit keine Anfrage verloren geht. */
  alle('form.form').forEach(function (f) {
    var falle = document.createElement('input');
    falle.name = 'firma2'; falle.tabIndex = -1; falle.autocomplete = 'off'; falle.setAttribute('aria-hidden', 'true');
    falle.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    f.appendChild(falle);
    var quittung = f.querySelector('.form__quittung'), knopf = f.querySelector('[type="submit"]'), laeuft = false;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (laeuft) return;
      var w = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var wahl = alle('.taste[aria-pressed="true"]', f).map(function (b) { return b.textContent.trim(); });
      var L = f.getAttribute('data-l') === 'de';
      var betreff = f.getAttribute('data-betreff') || 'Tasty Studios';
      function perMail() {
        var z = [(L ? 'Haus oder Marke: ' : 'Property or brand: ') + w('property'), 'Website: ' + w('website'), (L ? 'Was soll sich ändern: ' : 'What to change: ') + wahl.join(', '), '', w('text'), '', w('name'), w('mail')];
        location.href = 'mailto:robert@tasty-studios.de?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(z.join('\n'));
        if (quittung) quittung.textContent = 'robert@tasty-studios.de';
        f.classList.add('fertig');
      }
      if (!w('text') && !w('property') && !w('name')) { var t = f.querySelector('[name="text"]'); if (t) t.focus(); return; }
      if (!window.fetch) return perMail();
      laeuft = true; if (knopf) knopf.setAttribute('aria-busy', 'true');
      fetch('https://tasty-besuche.vercel.app/api/anfrage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betreff: betreff, property: w('property'), website: w('website'), wahl: wahl, text: w('text'), name: w('name'), mail: w('mail'), firma2: falle.value, seite: location.href.split('#')[0] })
      }).then(function (r) { return r.ok ? r.json() : { ok: false }; }).then(function (d) {
        if (!d || !d.ok) throw new Error('nicht angekommen');
        if (quittung) quittung.textContent = L ? 'Danke, Ihre Anfrage ist angekommen. Robert meldet sich bei Ihnen.' : 'Thank you, your message has arrived. Robert will get back to you.';
        f.classList.add('fertig');
        if (knopf) knopf.disabled = true;
      }).catch(perMail).then(function () { laeuft = false; if (knopf) knopf.removeAttribute('aria-busy'); });
    });
  });

  /* Scroll-Takt: Leiste weg beim Hinunterscrollen; Safari löst beim Scrollen unechte Hover aus, darum html.rollt für 300 ms */
  var yAlt = window.scrollY, wartet = false, rollUhr = null;
  function lies() {
    var y = window.scrollY;
    if (nav && !doc.classList.contains('offen')) {
      if (y > 140 && y > yAlt + 6) nav.classList.add('weg');
      else if (y < yAlt - 6 || y < 140) nav.classList.remove('weg');
    }
    yAlt = y;
  }
  window.addEventListener('scroll', function () {
    doc.classList.add('rollt'); clearTimeout(rollUhr); rollUhr = setTimeout(function () { doc.classList.remove('rollt'); }, 300);
    if (wartet) return; wartet = true;
    requestAnimationFrame(function () { wartet = false; lies(); });
  }, { passive: true });
  lies();
})();

/* Konzept-Fassung 01.11.2026: Vorführungen (Chat setzt sich zusammen, Gast ordnet die Seite neu) laufen nur im Bild */
(function () {
  'use strict';
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function alle(s, w) { return [].slice.call((w || document).querySelectorAll(s)); }
  /* Chat: Frage, dann leuchten die Quellen nacheinander auf, dann die Antwort; alle 10 s von vorn */
  alle('.chat').forEach(function (c) {
    var q = alle('.chat__q span', c), uhr = [], sichtbar = false;
    function lauf() {
      uhr.forEach(clearTimeout); uhr = [];
      c.classList.remove('da'); q.forEach(function (s) { s.classList.remove('an'); });
      uhr.push(setTimeout(function () { c.classList.add('da'); }, 300));
      q.forEach(function (s, i) { uhr.push(setTimeout(function () { s.classList.add('an'); }, 1500 + i * 260)); });
      uhr.push(setTimeout(function () { if (sichtbar && !ruhig) lauf(); }, 10500));
    }
    if (ruhig || !('IntersectionObserver' in window)) { c.classList.add('da'); q.forEach(function (s) { s.classList.add('an'); }); return; }
    new IntersectionObserver(function (es) {
      sichtbar = es[0].isIntersecting;
      if (sichtbar && !c.classList.contains('da')) lauf();
      if (!sichtbar) { uhr.forEach(clearTimeout); uhr = []; }
    }, { threshold: 0.35 }).observe(c);
  });
  /* Gast: Tasten wählen die Ordnung, ohne Hand wechselt sie alle 3,5 s */
  alle('.gast').forEach(function (g) {
    var tasten = alle('.gast__t button', g), bl = alle('.gast__b', g), ist = 0, uhr = null, sichtbar = false, hand = false;
    function setze(i) {
      ist = i; tasten.forEach(function (t, k) { t.classList.toggle('an', k === i); t.setAttribute('aria-pressed', k === i); });
      var ordnung = JSON.parse(tasten[i].getAttribute('data-o'));
      bl.forEach(function (b, k) { b.style.setProperty('--s', ordnung.indexOf(k)); b.classList.toggle('erst', ordnung[0] === k); });
    }
    function takt() { clearTimeout(uhr); if (!sichtbar || hand || ruhig) return; uhr = setTimeout(function () { setze((ist + 1) % tasten.length); takt(); }, 3500); }
    tasten.forEach(function (t, k) { t.addEventListener('click', function () { hand = true; setze(k); }); });
    setze(0);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { sichtbar = es[0].isIntersecting; takt(); }, { threshold: 0.4 }).observe(g);
  });
})();

/* Auftakt mit Hexagon-Film (Blender): spielt einmal, dann steht das Endbild. Bei verweigertem Abspielen bleibt das Startbild. */
(function () {
  var hg = document.querySelector('.hg'); if (!hg) return;
  var film = hg.querySelector('video'), ende = hg.querySelector('img.ende');
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches, handy = innerWidth < 700;
  function stehen() { hg.classList.add('steht'); hg.classList.remove('spielt'); }
  if (!film || ruhig) { stehen(); return; }
  film.src = film.getAttribute(handy ? 'data-handy' : 'data-pc');
  film.addEventListener('ended', stehen);
  film.addEventListener('playing', function () { hg.classList.add('spielt'); });
  var versuche = 0;
  function los() { var p = film.play(); if (p && p.catch) p.catch(function () { if (++versuche < 3) setTimeout(los, 400); }); }
  if (document.readyState === 'complete') los(); else addEventListener('load', los);
  setTimeout(function () { if (!hg.classList.contains('spielt')) stehen(); }, 5000);
  setTimeout(function () { if (!hg.classList.contains('steht')) stehen(); }, 9000);
})();
