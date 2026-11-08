/* Familie Zurbriggen · Einstiegsseite · Designstudie Tasty Studios (18.10.2026)
   Titelzeilen aus dem Schlitz, Stücke steigen deckend von unten, Fotos zoomen in ihren Rahmen, grosse Zahlen zählen hoch,
   Fenster nur sichtbar, wenn es nah ist, Band zum Blättern, «Was suchen Sie?», Auswahl im Hausstil. Nur transform, nativer Scroll. */
(function () {
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = document;

  /* Leiste: verschwindet beim Runterscrollen, kommt beim Hochscrollen zurück */
  var leiste = D.querySelector('[data-leiste]'), letzt = scrollY, tick = false;
  addEventListener('scroll', function () {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      var y = scrollY; if (leiste) leiste.classList.toggle('weg', y > 160 && y > letzt + 2 ? true : (y < letzt - 2 ? false : leiste.classList.contains('weg')));
      letzt = y; tick = false;
    });
  }, { passive: true });

  /* Titel in echte Zeilen zerlegen (nach dem wirklichen Umbruch) */
  function zeilen(el) {
    if (!el.dataset.orig) el.dataset.orig = el.innerHTML; else el.innerHTML = el.dataset.orig;
    var woerter = [];
    (function teile(knoten, hulle) {
      Array.prototype.slice.call(knoten.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/([ \t\n\r]+)/).forEach(function (t) {   /* geschützte Leerzeichen bleiben im Wort */
            if (!t) return;
            if (/^[ \t\n\r]+$/.test(t)) { woerter.push(null); return; }
            var s = D.createElement(hulle || 'span'); s.className = 'w'; s.textContent = t; woerter.push(s);
          });
        } else if (n.nodeType === 1) teile(n, n.tagName.toLowerCase());
      });
    })(el, null);
    el.innerHTML = '';
    woerter.forEach(function (w) { el.appendChild(w || D.createTextNode(' ')); });
    var reihen = [], oben = null;
    Array.prototype.forEach.call(el.querySelectorAll('.w'), function (w) {
      var t = w.offsetTop; if (oben === null || Math.abs(t - oben) > 4) { reihen.push([]); oben = t; } reihen[reihen.length - 1].push(w);
    });
    el.innerHTML = '';
    reihen.forEach(function (r, i) {
      var z = D.createElement('span'); z.className = 'zl'; var s = D.createElement('span'); s.style.setProperty('--z', i);
      r.forEach(function (w, j) { if (j) s.appendChild(D.createTextNode(' ')); s.appendChild(w); });
      z.appendChild(s); el.appendChild(z);
    });
  }
  var titel = D.querySelectorAll('[data-zeilen]');
  function alleZeilen() { Array.prototype.forEach.call(titel, zeilen); }
  if (!ruhig) {
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(alleZeilen); else alleZeilen();
    var rb = 0, bw = innerWidth; addEventListener('resize', function () { if (innerWidth === bw) return; bw = innerWidth; clearTimeout(rb); rb = setTimeout(alleZeilen, 180); });
  }

  /* Staffel innerhalb einer Gruppe */
  var gruppe = new Map();
  Array.prototype.forEach.call(D.querySelectorAll('[data-s]'), function (el) {
    var g = el.parentElement, n = gruppe.get(g) || 0; gruppe.set(g, n + 1); el.style.setProperty('--i', Math.min(n, 4));
  });

  /* Sichtbar: .da setzen, sobald der Bereich den unteren Rand erreicht (nichts wartet) */
  var ziele = D.querySelectorAll('[data-s],[data-zeilen],.auftakt,.person__bild,.jahr--bild,[data-zahlen]');
  if (ruhig || !('IntersectionObserver' in window)) { Array.prototype.forEach.call(ziele, function (e) { e.classList.add('da'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); if (e.target.hasAttribute('data-zahlen')) zaehle(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(ziele, function (e) { io.observe(e); });
  }
  /* Auftakt sofort */
  var auf = D.querySelector('.auftakt'); if (auf) requestAnimationFrame(function () { auf.classList.add('da'); auf.querySelectorAll('[data-s],[data-zeilen]').forEach(function (e) { e.classList.add('da'); }); });

  /* Grosse Zahlen zählen hoch (Jahreszahlen nur die letzten Schritte) */
  function zaehle(box) {
    if (ruhig) return;
    box.querySelectorAll('[data-bis]').forEach(function (b) {
      var bis = +b.dataset.bis, ab = +(b.dataset.ab || 0); if (bis <= 3) return;
      var t0 = performance.now(), dau = 1700;
      (function lauf(t) { var p = Math.min(1, (t - t0) / dau), e = 1 - Math.pow(1 - p, 3); b.textContent = Math.round(ab + (bis - ab) * e); if (p < 1) requestAnimationFrame(lauf); })(t0);
    });
  }

  /* Fenster: Bild nur, wenn das Fenster nah ist */
  var fen = D.querySelector('.fenster');
  if (fen && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { fen.classList.toggle('nah', e.isIntersecting); }); }, { rootMargin: '120% 0px 120% 0px' }).observe(fen);
  } else if (fen) fen.classList.add('nah');

  /* Band zum Blättern */
  D.querySelectorAll('[data-band]').forEach(function (band) {
    var spur = band.querySelector('.band__spur'), lauf = band.querySelector('.band__lauf span');
    function stand() { var max = spur.scrollWidth - spur.clientWidth; var a = spur.clientWidth / spur.scrollWidth; var p = max > 0 ? spur.scrollLeft / max : 0; lauf.style.transform = 'translateX(' + (p * (1 - a) * 100 / a) + '%) scaleX(1)'; lauf.style.width = (a * 100) + '%'; }
    spur.addEventListener('scroll', stand, { passive: true }); addEventListener('resize', stand); stand();
    band.querySelectorAll('.band__pfeil').forEach(function (k) {
      k.addEventListener('click', function () { var karte = spur.querySelector('.jahr'); var w = karte ? karte.getBoundingClientRect().width + 20 : 320; spur.scrollBy({ left: w * +k.dataset.richtung, behavior: ruhig ? 'auto' : 'smooth' }); });
    });
  });

  /* Auswahl im Hausstil (Kontakt) */
  var wahl = D.querySelector('[data-wahl]');
  function setzeHaus(wert) {
    if (!wahl) return;
    var li = wahl.querySelector('[data-wert="' + wert + '"]'); if (!li) return;
    wahl.querySelectorAll('[role=option]').forEach(function (o) { o.setAttribute('aria-selected', o === li ? 'true' : 'false'); });
    wahl.querySelector('[data-wahl-text]').textContent = li.textContent; wahl.querySelector('input').value = wert;
    D.querySelectorAll('.adresse').forEach(function (a) { a.classList.toggle('an', a.dataset.haus === wert); });
  }
  if (wahl) {
    var k = wahl.querySelector('.wahl__k'), liste = wahl.querySelector('.wahl__liste');
    function zu() { liste.hidden = true; k.setAttribute('aria-expanded', 'false'); }
    k.addEventListener('click', function () { var o = liste.hidden; liste.hidden = !o; k.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    liste.addEventListener('click', function (e) { var li = e.target.closest('[data-wert]'); if (li) { setzeHaus(li.dataset.wert); zu(); } });
    D.addEventListener('click', function (e) { if (!wahl.contains(e.target)) zu(); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
    setzeHaus('wellness');
  }
  D.querySelectorAll('[data-anfrage]').forEach(function (a) { a.addEventListener('click', function () { setzeHaus(a.dataset.anfrage); }); });

  /* «Was suchen Sie?»: die passende Karte hebt sich, die anderen treten zurück; Kontakt wählt dasselbe Haus */
  var gast = D.querySelector('.gastgeber');
  D.querySelectorAll('[data-finder] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var an = b.getAttribute('aria-pressed') !== 'true';
      D.querySelectorAll('[data-finder] button').forEach(function (x) { x.setAttribute('aria-pressed', x === b && an ? 'true' : 'false'); });
      gast.classList.toggle('wahl-an', an);
      gast.querySelectorAll('.karte').forEach(function (kt) { kt.classList.toggle('gewaehlt', an && kt.dataset.haus === b.dataset.ziel); });
      if (an) setzeHaus(b.dataset.ziel);
    });
  });

  /* Anfrage: in der Studie wird nichts verschickt */
  var form = D.querySelector('[data-anfrage-form]');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); form.querySelector('.anfrage__probe').hidden = false; });
})();
