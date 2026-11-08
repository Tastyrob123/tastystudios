/* Hotel Monte-Moro · «Ein Tag am Grat» · Bewegung und Bedienung nach dem Drehbuch (Master 2.1 Punkt 6c): die Kapitel liegen still, nichts schiebt sich über ein anderes. Nur transform und opacity, nativer Scroll (Regel 55).
   Handschrift: Titelzeilen aus dem Schlitz [data-zeilen], Stücke steigen und pulsieren [data-s], Fotos zoomen im Grat-Rahmen.
   Neu: Staffelung (jede Szene liegt, bis die nächste mit dem Grat darüberfährt; die vorige weicht zurück und versinkt im Dunst),
   der Auftakt (man tritt näher an das Haus, der Morgen wird Tag), die Kabinen am Seil (fahren mit dem Scrollen), die Fensterläden,
   die Fallblatt-Tafel. Dazu Buchung mit Kalender im Hausstil, Tisch im Röstihüs, Sommer · Winter, Haus-Finder, Aktionen mit Ablaufdatum. */
(function () {
  'use strict';
  var D = document, W = window, $ = function (s, c) { return (c || D).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  var heute = new Date(); heute.setHours(0, 0, 0, 0);
  var probe = /[?&]heute=(\d{4})-(\d\d)-(\d\d)/.exec(location.search); if (probe) heute = new Date(+probe[1], probe[2] - 1, +probe[3]);   /* Prüfen: ?heute=2026-11-05 */
  var klemm = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  function hole(box) { $$('img[data-src]', box).forEach(function (im) { im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute('data-src'); im.removeAttribute('data-srcset'); im.loading = 'eager'; }); }

  /* ---------- Aktionen mit Datum laufen von selbst ab (Anreise geschenkt) ---------- */
  $$('[data-bis]').forEach(function (el) { var p = el.dataset.bis.split('-'); if (p.length === 3 && heute > new Date(+p[0], p[1] - 1, +p[2])) el.classList.add('vorbei'); });
  
  /* ---------- Titelzeilen schneiden: je echte Zeile ein Schlitz .zl, das Lärche-<em> bleibt ---------- */
  function zeilen(el) {
    if (!el.__orig) el.__orig = el.innerHTML; else el.innerHTML = el.__orig;
    var woerter = [];
    (function teile(knoten, hulle) {
      [].slice.call(knoten.childNodes).forEach(function (n) {
        if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return; if (/^\s+$/.test(t)) { woerter.push(null); return; }
          var s = D.createElement(hulle || 'span'); s.className = 'w'; s.textContent = t; woerter.push(s);
        });
        else if (n.nodeType === 1) teile(n, n.tagName.toLowerCase());
      });
    })(el, null);
    el.textContent = '';
    woerter.forEach(function (w) { el.appendChild(w === null ? D.createTextNode(' ') : w); });
    var reihen = [], oben = null;
    $$('.w', el).forEach(function (w) { var t = w.offsetTop; if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; } reihen[reihen.length - 1].push(w); });
    el.textContent = '';
    reihen.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'zl'; var s = D.createElement('span'); s.style.setProperty('--z', i);
      r.forEach(function (w, j) { if (j) s.appendChild(D.createTextNode(' ')); w.classList.remove('w'); if (!w.className) w.removeAttribute('class'); s.appendChild(w); });
      z.appendChild(s); el.appendChild(z);
    });
  }
  var titel = $$('[data-zeilen]');
  if (!ruhig) (D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve()).then(function () { titel.forEach(zeilen); });

  /* ---------- Auslöser: .da beim Erreichen des unteren Rands; Reihenfolge der Stücke je Gruppe (--i) ---------- */
  var gruppe = new Map();
  $$('[data-s]').forEach(function (el) { var g = el.parentElement, n = gruppe.get(g) || 0; gruppe.set(g, n + 1); el.style.setProperty('--i', Math.min(n, 6)); });
  var ziele = $$('[data-s],[data-zeilen],[data-bilder],[data-bon],[data-zaehl],[data-glaeser],[data-buch],[data-wege]');
  if (ruhig || !('IntersectionObserver' in W)) ziele.forEach(function (el) { el.classList.add('da'); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    ziele.forEach(function (el) { io.observe(el); });
  }
  var vh = innerHeight; addEventListener('resize', function () { vh = innerHeight; }, { passive: true });

  /* ---------- Flug ins Tal: die Karte zoomt mit dem Scrollen auf Saas-Almagell, dann laufen die Fussspuren (einziges bewegtes Element im Blick) ---------- */
  var handy = innerWidth < 800; addEventListener('resize', function () { handy = innerWidth < 800; }, { passive: true });
  var sanft = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var fluege = $$('[data-flug]').map(function (w) { return { w: w, svg: $('.flug', w), karte: $('[data-flugkarte]', w), eins: $('[data-flugeins]', w), zwei: $('[data-flugzwei]', w), p: -1 }; });
  function flugBild(F, p) {
    var z = sanft(klemm((p - .18) / .52, 0, 1)), s0 = handy ? .36 : 1, s = s0 + z * ((handy ? 4.4 : 7.5) - s0), cx = 500 + (575 + (handy ? -1 : 18) - 500) * z, cy = 300 + (318 + (handy ? -2 : 0) - 300) * z;   /* 24.10.2026: am Handy Bus, Haus und Lift der Dorfkarte im Bild */
    F.karte.setAttribute('transform', 'translate(' + (500 - cx * s).toFixed(2) + ' ' + (300 - cy * s).toFixed(2) + ') scale(' + s.toFixed(4) + ')');
    /* kein Moment ohne Inhalt: der Titelblock steht während des ganzen Flugs und weicht erst, wenn die Ziele kommen; die Ziele erscheinen schon im Anflug */
    F.svg.classList.toggle('nah', z > .55); F.svg.classList.toggle('flieg', z > .1);
    F.eins.style.opacity = klemm(1 - (p - .52) / .08, 0, 1).toFixed(3);
    var o = klemm((p - .58) / .14, 0, 1); F.zwei.style.opacity = o.toFixed(3); F.zwei.style.pointerEvents = o > .5 ? '' : 'none';
  }
  var ft = false;
  function fluegeBild() {
    ft = false;
    fluege.forEach(function (F) {
      var r = F.w.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = ruhig ? 1 : klemm(-r.top / Math.max(1, r.height - vh), 0, 1); p = Math.round(p * 400) / 400;
      if (p !== F.p) { F.p = p; flugBild(F, p); }
    });
  }
  if (fluege.length) { addEventListener('scroll', function () { if (!ft) { ft = true; requestAnimationFrame(fluegeBild); } }, { passive: true }); fluegeBild(); }

  /* ---------- Fallblatt: jedes Blatt klappt beim Erscheinen einmal kurz, die Zeichen stehen von Anfang an (vollständig lesbar) ---------- */
  var tafeln = $$('[data-tafel]');
  if (tafeln.length && !ruhig && 'IntersectionObserver' in W) {
    var tio = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) return; tio.unobserve(e.target);
      $$('li', e.target).forEach(function (li, z) { $$('.fb b', li).forEach(function (b, i) { if (b.animate) b.animate([{ transform: 'rotateX(-88deg)' }, { transform: 'none' }], { duration: 320, delay: z * 220 + i * 30, easing: 'cubic-bezier(.16,1,.3,1)' }); }); });
    }); }, { rootMargin: '0px 0px -15% 0px' });
    tafeln.forEach(function (t) { tio.observe(t); });
  }

  /* ---------- Kopf: weg beim Runterscrollen, zurück beim Hochscrollen; Rezeption erst nach dem Auftakt; Menü ---------- */
  var kopf = $('[data-kopf]'), ck = $('[data-chat-auf]'), letzt = scrollY, kt = false;
  addEventListener('scroll', function () {
    if (kt) return; kt = true;
    requestAnimationFrame(function () { var y = scrollY; if (kopf) { if (y > letzt + 2 && y > 160) kopf.classList.add('weg'); else if (y < letzt - 2 || y < 160) kopf.classList.remove('weg'); } if (ck) ck.classList.toggle('weg', y < vh * .9); letzt = y; kt = false; });
  }, { passive: true });
  var menue = $('[data-menue]'), mAuf = $('[data-menue-auf]');
  if (menue && mAuf) {
    var setz = function (a) { menue.classList.toggle('auf', a); menue.setAttribute('aria-hidden', String(!a)); mAuf.setAttribute('aria-expanded', String(a)); };
    mAuf.addEventListener('click', function () { setz(true); });
    $('[data-menue-zu]', menue).addEventListener('click', function () { setz(false); });
    $$('a', menue).forEach(function (a) { a.addEventListener('click', function () { setz(false); }); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape') setz(false); });
  }

  /* ---------- Buchung: Anreise, Abreise, Gäste mit Kalender und Zähler im Hausstil; dann das Buchungsfenster des Hauses (seekda bleibt) ---------- */
  var MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var zwei = function (n) { return (n < 10 ? '0' : '') + n; }, iso = function (d) { return d.getFullYear() + '-' + zwei(d.getMonth() + 1) + '-' + zwei(d.getDate()); };
  var zeig = function (d) { return d.getDate() + '. ' + MON[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
  var offen = null;
  function schliesse() { if (offen) { var k = offen; k.classList.remove('auf'); setTimeout(function () { k.remove(); }, 400); offen = null; } }
  D.addEventListener('click', function (e) { if (offen && !e.target.closest('.wahlkarte')) schliesse(); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape') schliesse(); });
  $$('form[data-buchen]').forEach(function (fo) {
    var an = new Date(heute); an.setDate(an.getDate() + 1); var ab = new Date(an); ab.setDate(ab.getDate() + 2); var erw = 2, ki = 0;
    var bAn = $('[data-an]', fo), bAb = $('[data-ab]', fo), bG = $('[data-g]', fo);
    function male() { bAn.textContent = zeig(an); bAb.textContent = zeig(ab); bG.textContent = erw + (erw === 1 ? ' Erwachsener' : ' Erwachsene') + (ki ? ' · ' + ki + (ki === 1 ? ' Kind' : ' Kinder') : ''); }
    function kalender(wahl) {
      var start = wahl === 'an' ? an : ab, monat = new Date(start.getFullYear(), start.getMonth(), 1), k = D.createElement('div'); k.className = 'wahlkarte';
      function bau() {
        var erster = (monat.getDay() + 6) % 7, tage = new Date(monat.getFullYear(), monat.getMonth() + 1, 0).getDate(), min = wahl === 'an' ? heute : new Date(an.getTime() + 864e5);
        var h = '<header><button type="button" data-m="-1" aria-label="Monat zurück">‹</button><span>' + MON[monat.getMonth()] + ' ' + monat.getFullYear() + '</span><button type="button" data-m="1" aria-label="Monat vor">›</button></header><div class="wt"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div><div class="tage">';
        for (var i = 0; i < erster; i++) h += '<span></span>';
        for (var t = 1; t <= tage; t++) { var d = new Date(monat.getFullYear(), monat.getMonth(), t), s = iso(d), kl = s === iso(start) ? ' class="gew"' : (d > an && d < ab ? ' class="zw"' : ''); h += '<button type="button" data-t="' + s + '"' + kl + (d < min ? ' disabled' : '') + '>' + t + '</button>'; }
        k.innerHTML = h + '</div>';
      }
      bau();
      k.addEventListener('click', function (e) {
        e.stopPropagation();
        var mm = e.target.closest('[data-m]'); if (mm) { monat.setMonth(monat.getMonth() + +mm.dataset.m); bau(); return; }
        var t = e.target.closest('[data-t]'); if (!t || t.disabled) return;
        var p = t.dataset.t.split('-'), d = new Date(+p[0], p[1] - 1, +p[2]);
        if (wahl === 'an') { an = d; if (ab <= an) { ab = new Date(an); ab.setDate(ab.getDate() + 1); } } else ab = d;
        male(); schliesse();
      });
      return k;
    }
    function zaehler() {
      var k = D.createElement('div'); k.className = 'wahlkarte';
      function bau() {
        var z = function (n, wort, v, min, max) { return '<div class="zaehler"><b>' + wort + '</b><div><button type="button" data-z="' + n + '" data-d="-1" aria-label="weniger"' + (v <= min ? ' disabled' : '') + '>−</button><span>' + v + '</span><button type="button" data-z="' + n + '" data-d="1" aria-label="mehr"' + (v >= max ? ' disabled' : '') + '>+</button></div></div>'; };
        k.innerHTML = '<header><span>Gäste</span><button type="button" data-fertig aria-label="Fertig">✓</button></header>' + z('e', 'Erwachsene', erw, 1, 6) + z('k', 'Kinder', ki, 0, 4);
      }
      bau();
      k.addEventListener('click', function (e) {
        e.stopPropagation();
        if (e.target.closest('[data-fertig]')) { schliesse(); return; }
        var b = e.target.closest('[data-z]'); if (!b || b.disabled) return;
        if (b.dataset.z === 'e') erw = klemm(erw + +b.dataset.d, 1, 6); else ki = klemm(ki + +b.dataset.d, 0, 4);
        male(); bau();
      });
      return k;
    }
    [[bAn, 'an'], [bAb, 'ab'], [bG, 'g']].forEach(function (p) {
      p[0].addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); var war_ = offen && offen.parentElement === p[0].parentElement; schliesse(); if (war_) return;
        var k = p[1] === 'g' ? zaehler() : kalender(p[1]); p[0].parentElement.appendChild(k); requestAnimationFrame(function () { k.classList.add('auf'); }); offen = k;
      });
    });
    fo.addEventListener('submit', function (e) { e.preventDefault(); W.open(fo.getAttribute('action'), '_blank', 'noopener'); });
    male();
  });

})();
