/* Landgasthof Ruedihus — BEWEGUNG beim Scrollen (Tasty Studios 13.10.2026). Gehört zu assets/css/bewegung.css, dort steht das Rezept.
   Dieses Skript teilt die Stücke der Seite ein, mehr nicht; bewegt wird allein im Stylesheet:
     .rb-s      einzelnes Stück (Bild, Tafel, Platte, Blatt): deckend, Weg am Scrollen, Pulsieren nach der Uhr
     .rb-g      Gruppe, die als Ganzes kommt (Raster, Bildgefüge, Galerie); ihre Teile bekommen .rb-still und stehen in ihr still
     .rb-p      nur pulsieren, kein Weg (Bilder, die übereinanderliegen)
     .rb-da     die Gruppe ist im Blick (eigener Auslöser, 6 % Vorlauf wie die Bilder in main.js)
     .rb-fertig das Stück hat einmal pulsiert und tut es nicht wieder
   Dazu stellt es Behälter, die über einem bewegten Stück mit overflow:hidden beschneiden, auf overflow:clip: sonst hinge das Stück nicht am Scrollen der Seite.
   Die eigenen Auftritte des Hauses (Aufhängen, Flug, Kippen, von links) fasst es nicht an. Ohne dieses Skript gelten die Auftritte aus main.css. */
(function () {
  'use strict';
  var doc = document.documentElement, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  if (doc.classList.contains('still') || !('IntersectionObserver' in window)) return;
  var EIGEN = '[data-r="haeng"],[data-r="flug"],[data-r="kipp"],[data-r="vonlinks"]';
  var STUECK = '[data-r="bild"],[data-r="schweb"],.tafel[data-r],.blatt[data-r],.gpl[data-r],.koord--platte[data-r],.ve-plan[data-r],.dn-karte-dunkel[data-r],.dn-summe[data-r],.gs-notiz[data-r],.dn-rechner[data-r],.dn-gs-form[data-r],.angaben[data-r]';
  var NICHT = '.auftakt,.bruch,dialog,.zs,.menue,.rk,.fa,.hk,.zeit--bilder';   /* Auftakt bleibt; Fenster, Galerie zum Durchklicken, Fächer, Kompass und Bilderfolge haben ihre eigene Bewegung */
  var UEBER = '.schicht,.fk__bilder';                                             /* hier liegen Bilder übereinander: nur pulsieren */
  var vh = window.innerHeight || 800;

  /* Gruppen: als Ganzes, wenn sie auf einen Schirm passen und nur Bilder und Kacheln enthalten */
  var gruppen = [];
  $$('[data-gruppe]').forEach(function (g) {
    if (g.closest(NICHT) || g.matches('[data-flug]')) return;
    var teile = $$('[data-r="bild"],[data-r="schweb"]', g); if (!teile.length || g.querySelector(EIGEN)) return;
    if (g.matches(UEBER)) { teile.forEach(function (t) { t.classList.add('rb-p'); }); return; }
    if (g.offsetHeight > vh * 1.08) { teile.forEach(function (t) { if (t.closest(UEBER)) t.classList.add('rb-p'); else { t.style.setProperty('--i', '0'); t.classList.add('rb-s'); } }); return; }   /* hohe Gruppen: jede Reihe kommt für sich, alle mit demselben Weg */
    g.classList.add('rb-g'); gruppen.push(g);
    teile.forEach(function (t) { t.classList.add('rb-still'); });
  });
  /* einzelne Stücke */
  $$(STUECK).forEach(function (el) {
    if (el.classList.contains('rb-still') || el.classList.contains('rb-p') || el.classList.contains('rb-s') || el.closest(NICHT) || el.matches(EIGEN)) return;
    if (el.closest('.rb-g') || el.closest('[data-flug]')) return;
    if (el.closest(UEBER)) { el.classList.add('rb-p'); return; }
    if (el.offsetHeight > vh * 1.6) return;                                       /* sehr hohe Blätter (Rechtstexte) steigen wie Schrift, ohne zu pulsieren */
    el.classList.add('rb-s');
  });
  /* Behälter über bewegten Stücken und gleitenden Fotos: beschneiden ohne eigenen Scroll */
  var gesehen = [];
  $$('.rb-s,.rb-g,.rb-rahmen').forEach(function (el) {
    for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (gesehen.indexOf(a) > -1) break; gesehen.push(a);
      var cs = getComputedStyle(a);
      if (cs.overflowY === 'hidden' && cs.overflowX === 'hidden') a.style.overflow = 'clip';
    }
  });
  /* Auslöser der Gruppen */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('rb-da'); } });
  }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });
  gruppen.forEach(function (g) { io.observe(g); });
  /* ein Stück pulsiert genau einmal */
  document.addEventListener('animationend', function (e) {
    if ((e.animationName === 'rb-puls' || e.animationName === 'rb-feder') && e.target && e.target.classList) e.target.classList.add('rb-fertig');
  }, true);

  /* ---------- BEGRÜSSUNG VON ALLEN SEITEN (17.10.2026, Stil am Ende von main.css): die Fotos schweben langsam von ihren Seiten herein, nach der Uhr,
     nur beim ersten Mal. Die obere Reihe (Terrasse, Schild, Gitter) startet gemeinsam, sobald der Block am unteren Rand auftaucht, das breite Foto unten,
     sobald es selbst dort ankommt. Die Ausgangslage wird ohne Übergang gesetzt (.rh-ruhe), sonst rutschten die Fotos erst sichtbar zurück. Was beim
     ersten Melden schon im Fenster oder darüber liegt, steht sofort an seinem Platz. ---------- */
  $$('.rh-block[data-seiten]').forEach(function (b) {
    var teile = $$(':scope > span', b); if (teile.length < 4) return;
    var oben = teile.slice(0, 3), unten = teile[3];
    var gelandet = function () { if (teile.every(function (t) { return t.classList.contains('los'); })) setTimeout(function () { b.classList.add('rh-gelandet'); }, 1600); };
    var los = function (gruppe, sofort) {
      if (sofort) b.classList.add('rh-ruhe');
      gruppe.forEach(function (t) { t.classList.add('los'); });
      if (sofort) requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.remove('rh-ruhe'); }); });
      gelandet();
    };
    b.classList.add('rh-ruhe', 'rh-warte');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      b.classList.remove('rh-ruhe');
      [[b, oben], [unten, [unten]]].forEach(function (paar) {
        var erst = true;
        var o = new IntersectionObserver(function (es) {
          var e = es[es.length - 1], r = e.boundingClientRect;
          if (e.isIntersecting || r.bottom < 0) { o.disconnect(); los(paar[1], erst && (r.top < (window.innerHeight || vh) * 0.9 || r.bottom < 0)); }
          erst = false;
        }, { rootMargin: '0px 0px 10% 0px', threshold: 0 });
        o.observe(paar[0]);
      });
    }); });
  });

  /* ---------- KE SCHWEBEN 17.10.2026 («Was führt Sie zu uns?», Stil «KE SCHWEBEN» am Ende von main.css): die Bühne und danach die Reihe der vier Kacheln
     steigen von unten, nach der Uhr, jede, sobald sie am unteren Rand auftaucht (10 % Vorlauf), nur beim ersten Mal. Ausgangslage ohne Übergang (.ke-ruhe).
     Was beim ersten Melden schon im Fenster oder darüber liegt, steht sofort an seinem Platz. ---------- */
  $$('.ke[data-ke]').forEach(function (b) {
    var teile = [b.querySelector('.ke__f'), b.querySelector('.ke__wahl')].filter(Boolean); if (!teile.length) return;
    b.classList.add('ke-ruhe', 'ke-warte');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      b.classList.remove('ke-ruhe');
      teile.forEach(function (t) {
        var erst = true;
        var o = new IntersectionObserver(function (es) {
          var e = es[es.length - 1], r = e.boundingClientRect;
          if (e.isIntersecting || r.bottom < 0) {
            o.disconnect();
            var sofort = erst && (r.top < (window.innerHeight || vh) * 0.9 || r.bottom < 0);
            if (sofort) b.classList.add('ke-ruhe');
            t.classList.add('los');
            if (sofort) requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.remove('ke-ruhe'); }); });
          }
          erst = false;
        }, { rootMargin: '0px 0px 10% 0px', threshold: 0 });
        o.observe(t);
      });
    }); });
  });

  /* ---------- Zeilen-Maske: Überschriften und grosse Sätze rollen zeilenweise hoch (Stil in bewegung.css, Abschnitt 2a) ----------
     Jede Überschrift wird nach ihrem echten Umbruch in Zeilen zerlegt: Wörter einzeln setzen, messen, welche auf einer Höhe stehen, daraus je Zeile
     ein Schlitz (.z) mit der Zeile darin. Nach jeder Breitenänderung (Drehen, Fenster ziehen) noch einmal. Vom Haus gesetzte Zeilen (titel() in bau.py)
     bleiben Zeilengrenzen. Nicht angefasst: der Auftakt, Fenster zum Öffnen, die Bausteine mit eigener Bewegung, alles in einem Stück, das selbst einblendet,
     und die Bearbeiten-Ansicht des Studios (/entwurf/). */
  if (/\/(entwurf|vorher)\//.test(location.pathname)) { doc.classList.add('rb-an'); return; }
  var ROLL = 'main h1,main h2,main h3,main .zs-satz,main .zitat,main .gs-blatt__auf,main .ausklang .wrap>p,.fuss__satz';
  var ROLL_NICHT = '.auftakt,dialog,.menue,.rk,.rk__text,.fa,.zs,.hk,.tri__titel,.gg2__karte,.dn-gs,[data-r="kipp"],[data-r="vonlinks"],[data-r="haeng"],[data-r="flug"],.um__blatt,[data-worte],.zj__jahr';
  var INLINE = /^(SPAN|B|EM|I|SMALL|STRONG|A)$/;
  function sammle(el) {   /* Wörter mit ihren Hüllen (z. B. das Gold der zweiten Zeile), dazu feste Umbrüche */
    var aus = [], ok = true;
    (function lauf(node, huelle) {
      [].forEach.call(node.childNodes, function (n) {
        if (!ok) return;
        if (n.nodeType === 3) { n.nodeValue.split(/(\s+)/).forEach(function (s) { if (!s) return; if (/^\s+$/.test(s)) aus.push({ leer: 1 }); else s.replace(/-(?=[^\s-])/g, '-\u0000').split('\u0000').forEach(function (st) { aus.push({ w: st, h: huelle }); }); }); }   /* nach einem Bindestrich darf die Zeile wechseln (Altjahr-Ländler-Stubete) */
        else if (n.nodeType === 1) {
          if (n.tagName === 'BR') aus.push({ br: 1 });
          else if (n.classList.contains('z')) { aus.push({ br: 1 }); lauf(n.children.length === 1 && n.firstElementChild.tagName === 'SPAN' && !n.firstElementChild.className ? n.firstElementChild : n, huelle); aus.push({ br: 1 }); }
          else if (INLINE.test(n.tagName) && !n.hasAttribute('data-zahl') && !n.hasAttribute('data-spiegel') && !n.querySelector('svg,img,button,[data-zahl]')) lauf(n, huelle.concat([n]));
          else ok = false;
        }
      });
    })(el, []);
    return ok && aus.some(function (x) { return x.w; }) ? aus : null;
  }
  function wort(x) {
    var w = document.createElement('span'); w.className = 'rb-w'; w.textContent = x.w; var k = w;
    for (var i = x.h.length - 1; i >= 0; i--) { var c = x.h[i].cloneNode(false); c.removeAttribute('id'); c.appendChild(k); k = c; }
    return { aussen: k, mass: w };
  }
  function teile(el) {
    var tok = el._rbTok || (el._rbTok = sammle(el)); if (!tok) return false;
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;   /* noch nicht zu sehen (Reiter): beim Erscheinen */
    /* 1. flach setzen und messen */
    el.textContent = ''; var teileL = [];
    tok.forEach(function (x) {
      if (x.br) { if (teileL.length && !teileL[teileL.length - 1].br) el.appendChild(document.createElement('br')); teileL.push({ br: 1 }); return; }   /* feste Zeilengrenze auch beim Messen setzen, sonst misst man einen anderen Umbruch */
      if (x.leer) { el.appendChild(document.createTextNode(' ')); teileL.push({ leer: 1 }); return; }
      var w = wort(x); el.appendChild(w.aussen); teileL.push({ x: x, mass: w.mass });
    });
    var zeilen = [[]], oben = null;
    teileL.forEach(function (p) {
      var z = zeilen[zeilen.length - 1];
      if (p.br) { if (z.length) { zeilen.push([]); oben = null; } return; }
      if (p.leer) { if (z.length) z.push(p); return; }
      var t = p.mass.offsetTop;
      if (oben !== null && Math.abs(t - oben) > 4 && z.length) { zeilen.push([]); z = zeilen[zeilen.length - 1]; }
      oben = t; z.push(p);
    });
    zeilen = zeilen.filter(function (z) { return z.some(function (p) { return p.x; }); });
    /* 2. je Zeile ein Schlitz */
    el.textContent = '';
    zeilen.forEach(function (z, n) {
      var s = document.createElement('span'); s.className = 'z'; s.style.setProperty('--i', n);
      var innen = document.createElement('span');
      while (z.length && z[z.length - 1].leer) z.pop();
      z.forEach(function (p) { if (p.leer) innen.appendChild(document.createTextNode(' ')); else innen.appendChild(wort(p.x).aussen); });
      s.appendChild(innen); el.appendChild(s);
      if (innen.scrollWidth > s.clientWidth + 2) s.classList.add('rb-lang');   /* ein einzelnes Wort ist breiter als die Spalte: es darf im Schlitz umbrechen statt abgeschnitten zu werden */
    });
    el.classList.add('rb-geteilt'); el._rbBreite = el.clientWidth;
    return true;
  }
  var rollen = [];
  $$(ROLL).forEach(function (el) {
    if (el.closest(ROLL_NICHT) || el.closest('.rb-roll') || !el.textContent.trim()) return;
    if (el.querySelector('h1,h2,h3')) return;
    var vorfahr = el.parentElement && el.parentElement.closest('[data-r]');
    if (vorfahr && !vorfahr.matches('.rb-s,.rb-still,.rb-p,[data-r="bild"],[data-r="schweb"]')) { if (vorfahr.closest(ROLL_NICHT) || vorfahr.querySelector('img,form,button.kn,a.kn')) return; vorfahr.classList.add('rb-fest'); }   /* Hülle, die sonst einblenden würde, steht fest; die Überschrift rollt */
    if (!sammle(el)) return;
    el.classList.add('rb-roll'); if (el.closest('.bruch')) el.classList.add('rb-mit-da');
    rollen.push(el);
  });
  function fertig(el) { el.classList.add('rb-gerollt'); }
  var rio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; var el = e.target; rio.unobserve(el);
      if (!el.classList.contains('rb-geteilt')) teile(el);
      el.getBoundingClientRect();   /* Zeilen stehen unten, erst dann rollen */
      requestAnimationFrame(function () { el.classList.add('rb-los'); setTimeout(function () { fertig(el); }, 1500 + el.children.length * 95 + 200); });
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
  function alleTeilen(nurNeu) {
    rollen.forEach(function (el) {
      if (nurNeu && el.classList.contains('rb-geteilt')) return;
      if (!nurNeu && el._rbBreite === el.clientWidth && el.classList.contains('rb-geteilt')) return;
      teile(el);
    });
  }
  function start() {
    alleTeilen(true);
    rollen.forEach(function (el) {
      if (el.classList.contains('rb-mit-da')) {   /* Satz im Fenster: rollt mit dem Auslöser des Fensters (main.js), danach frei */
        var mo = new MutationObserver(function () { if (el.classList.contains('da') || (el.closest('[data-r].da'))) { mo.disconnect(); setTimeout(function () { fertig(el); }, 1500 + el.children.length * 95 + 200); } });
        mo.observe(el, { attributes: true, attributeFilter: ['class'] });
      } else rio.observe(el);
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();   /* der Umbruch hängt an der Schrift */
  setTimeout(function () { rollen.forEach(function (el) { if (!el.classList.contains('rb-geteilt') && el.offsetParent) teile(el); }); }, 2500);
  var rt = 0, bw = window.innerWidth;
  window.addEventListener('resize', function () { if (window.innerWidth === bw) return; bw = window.innerWidth; clearTimeout(rt); rt = setTimeout(function () { alleTeilen(false); }, 180); }, { passive: true });
  doc.classList.add('rb-an');
})();
