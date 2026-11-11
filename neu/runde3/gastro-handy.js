/* Handy-Auftritte der Gastronomie-Seite /gastronomie/ (Robert 11.11.2026: «die Animationen … wenn ich das scrolle, das fehlt mir noch
   auf dem Handy, diese luxuriöse und edle»). Nur unter 860 px und nur ohne «Bewegung reduzieren».
   Baustein «Hochschweben» aus dem UI-Fundus: Bilder, Geräte und Karten kommen von unten, werden dabei grösser, das Foto darin kommt zur Ruhe.
   Nebeneinander stehende Stücke folgen gestaffelt. Alles im ersten Bild bleibt unberührt (erster Blick komplett).
   Nur translate, scale und opacity, ein Beobachter für die ganze Seite. */
(function () {
  if (!window.matchMedia || !matchMedia('(max-width:860px)').matches) return;
  /* «Nach dem Start bleiben wir»: Schwung von der Linie zur Mitte, wo der Anker steht */
  function schwung() {
    var e = document.querySelector('.s-hbl .hbl-ende'), g = document.querySelector('.s-hbl .hbl-gold'); if (!e || !g) return;
    var alt = e.querySelector('.hbl-schwung'); if (alt) alt.remove();
    var er = e.getBoundingClientRect(), gr = g.getBoundingClientRect(), W = Math.round(er.width), x0 = Math.round(gr.left + gr.width / 2 - er.left), xm = Math.round(W / 2);
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'hbl-schwung'); svg.setAttribute('viewBox', '0 0 ' + W + ' 76'); svg.setAttribute('aria-hidden', 'true');
    var d = 'M' + x0 + ' 0 V30 H' + xm + ' V72';   // rechter Winkel: kurz runter, waagrecht nach rechts, gerade runter in den Anker (Robert 12.11.2026: «90 Grad … nicht so schräg»)
    ['spur', 'gold'].forEach(function (c) { var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('class', c); svg.appendChild(p); });
    e.insertBefore(svg, e.firstChild);
    svg.style.setProperty('--l', Math.ceil(svg.querySelector('.gold').getTotalLength()) + '');
  }
  addEventListener('resize', function () { clearTimeout(schwung._t); schwung._t = setTimeout(schwung, 200); });

  if (document.readyState === 'complete') schwung(); else addEventListener('load', schwung);
})();

(function () {
  if (!window.matchMedia || !matchMedia('(max-width:860px)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  var BLOCK = 'figure, .lo, .bb, .cg, [class*="karte"], [class*="kachel"], [class*="tel"], article, li';
  var NIE = '.fen, header, footer, nav, .gband, .ar-wand, .nav, [class*="insel"], .fr-band, .bz-band, .sprache';
  var KLEIN = 120;

  function sichtbar(e) { var s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden'; }
  function festOderKleben(e) {
    for (var k = e; k && k !== document.body; k = k.parentElement) { var p = getComputedStyle(k).position; if (p === 'fixed' || p === 'sticky') return true; }
    return false;
  }

  function sammle() {
    var H = innerHeight, W = innerWidth, sections = [].slice.call(document.querySelectorAll('main > section')).slice(1), gew = [];
    sections.forEach(function (sec) {
      if (sec.matches('.fen, [class*="fenster"]')) return;
      var kand = [];
      [].slice.call(sec.querySelectorAll('img, .bb, .cg')).forEach(function (el) {
        if (!sichtbar(el) || el.closest(NIE)) return;
        var r = el.getBoundingClientRect(); if (r.width < KLEIN || r.height < 80) return;
        var b = el.matches('img') ? (el.closest(BLOCK) || el) : el;
        if (!sec.contains(b) || b === sec) return;
        kand.push(b);
      });
      // nur die äussersten Stücke, keine doppelten
      kand = kand.filter(function (b, i) { return kand.indexOf(b) === i; });
      kand = kand.filter(function (b) { return !kand.some(function (o) { return o !== b && o.contains(b); }); });
      kand.forEach(function (b) {
        var r = b.getBoundingClientRect();
        if (r.width > W * 1.05 || r.width < 100) return;               // breiter als der Bildschirm: Band oder Bühne, bleibt
        if (r.left < -10 || r.right > W + 10) return;                   // halb ausserhalb: Karussell, bleibt
        if (r.top + scrollY < H) return;                                 // im ersten Bild: bleibt stehen
        if (festOderKleben(b)) return;
        if (b.hasAttribute('data-k') || b.hasAttribute('data-r') || b.closest('[data-k]')) return;   // hat schon einen eigenen Auftritt
        if (b.closest('[data-g], .v10-film, .ihs, .eb-buehne') || getComputedStyle(b).position === 'absolute') return;   // Teil einer eigenen Bildfolge oder Komposition
        gew.push(b);
      });
    });
    return gew;
  }

  function luftUnten(b) {
    var r = b.getBoundingClientRect(), unten = r.bottom - r.height * .03, best = 1e9;   // scale .94 hebt die Unterkante um 3 %
    var sec = b.closest('section') || document.body;
    [].slice.call(sec.querySelectorAll('h1,h2,h3,h4,p,small,span,b,a,li,dt,dd,img,button,figure')).forEach(function (n) {
      if (b.contains(n) || n.contains(b) || !sichtbar(n)) return;
      var q = n.getBoundingClientRect(); if (q.height < 2 || q.width < 2 || q.right < r.left || q.left > r.right) return;
      if (q.top >= r.bottom - 2 && q.top < best) best = q.top;
    });
    return best === 1e9 ? 92 : best - unten;
  }

  function los() {
    var stuecke = sammle();
    stuecke.forEach(function (b) {
      b.classList.add('hs');
      // Weg nie länger als die Luft bis zum nächsten Inhalt darunter: das Bild kreuzt beim Heraufschweben keine Schrift
      b.style.setProperty('--hs-y', Math.round(Math.max(18, Math.min(92, luftUnten(b) - 8))) + 'px');
      // gestaffelt, wenn Geschwister nebeneinander stehen
      var p = b.parentElement, geschw = stuecke.filter(function (o) { return o.parentElement === p; });
      if (geschw.length > 1) {
        var top = Math.round(b.getBoundingClientRect().top), reihe = geschw.filter(function (o) { return Math.abs(Math.round(o.getBoundingClientRect().top) - top) < 30; });
        b.style.setProperty('--hs-i', String(Math.min(3, reihe.indexOf(b))));
      }
      // Foto im Rahmen kommt zur Ruhe (nur echte Fotos in einem Rahmen, der abschneidet; keine Bildschirme in Geräten)
      var img = b.matches('img') ? null : b.querySelector('img');
      if (img && !b.matches('.lo') && !img.closest('.lo')) {
        var rahmen = img.parentElement, o = getComputedStyle(rahmen).overflow;
        if (/hidden|clip/.test(o) && img.getBoundingClientRect().width >= b.getBoundingClientRect().width * .6) img.classList.add('hs-foto');
      }
    });
    // Erster Eindruck: die Bestätigung segelt nach dem Laptop herein
    var bb = document.querySelector('.ek01-bb'), lap = document.querySelector('.ek01-lap');
    [bb, lap].forEach(function (x, n) {
      if (!x || x.getBoundingClientRect().top + scrollY <= innerHeight) return;
      [].slice.call(x.querySelectorAll('.hs')).forEach(function (i) { i.classList.remove('hs'); });   // nur das ganze Stück bewegt sich
      x.classList.add('hs'); if (n === 0) x.classList.add('hs-segel');
    });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('hs-da'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -9% 0px' });
    [].slice.call(document.querySelectorAll('.hs')).forEach(function (b) { io.observe(b); });
  }

  if (document.readyState === 'complete') los(); else addEventListener('load', los);
})();
