/* Kopie von Maloja/maloja.js für die eingebaute Vorschau von «Website bearbeiten» (Vorführung). Einzige Änderung: Fotos aus ../_haus/img. */
/* Maloja: erster Blick komplett, Auftritte am Rand, Leiste kommt und geht, ein Gang der Karte zeigt seinen Teller. Nativer Scroll, nur transform. */
(function () {
  var doc = document.documentElement;
  if ('scrollRestoration' in history && !location.hash) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }

  // Erster Blick komplett: sichtbar erst, wenn die Bilder im ersten Bild geladen sind
  function zeigen() { doc.classList.remove('warte'); void doc.offsetWidth; setTimeout(function () { doc.classList.add('los'); }, 20); }
  var erste = [].slice.call(document.querySelectorAll('main img')).filter(function (i) {
    var r = i.getBoundingClientRect(); return r.bottom > -50 && r.top < window.innerHeight + 50 && r.width > 0;
  });
  erste.forEach(function (i) { i.loading = 'eager'; });
  var offen = erste.filter(function (i) { return !i.complete; });
  if (!offen.length) zeigen();
  else { var n = offen.length; offen.forEach(function (i) { function f() { if (--n <= 0) zeigen(); } i.addEventListener('load', f, { once: true }); i.addEventListener('error', f, { once: true }); }); }

  // Auftritte: sobald der Bereich den unteren Rand berührt
  var ziele = document.querySelectorAll('.sw, .sw-feld, [data-zwei]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('da'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    ziele.forEach(function (z) { io.observe(z); });
  } else ziele.forEach(function (z) { z.classList.add('da'); });

  // Leiste: verschwindet beim Hinunterscrollen, kommt beim Hinaufscrollen
  var leiste = document.querySelector('[data-leiste]'), letzt = 0, tick = false;
  function leisteNach() {
    var y = window.scrollY, h = window.innerHeight;
    if (y > h * .9 && y > letzt + 4) leiste.classList.add('weg');
    else if (y < letzt - 4 || y < h * .9) leiste.classList.remove('weg');
    letzt = y; tick = false;
  }
  if (leiste) window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(leisteNach); } }, { passive: true });

  // Das Menü: ein Gang zeigt seinen Teller, das neue Bild steigt im Rahmen von unten auf
  var teller = document.querySelector('[data-teller]');
  if (teller) {
    var vorrat = {};
    function bild(b) {
      if (vorrat[b]) return vorrat[b];
      var br = (window.MJ_B || {})[b];
      var el;
      if (br) {
        el = document.createElement('img');
        el.src = '../_haus/img/' + b + '-' + br[Math.min(1, br.length - 1)] + '.webp';
        el.srcset = br.map(function (w) { return '../_haus/img/' + b + '-' + w + '.webp ' + w + 'w'; }).join(', ');
        el.sizes = '(max-width:900px) 50vw, 36vw'; el.decoding = 'async'; el.alt = '';
      } else {
        el = document.createElement('span'); el.className = 'bildplatz';
        el.innerHTML = '<small>Bild folgt</small><b></b>';
      }
      return (vorrat[b] = el);
    }
    var gaenge = [].slice.call(document.querySelectorAll('.ga'));
    gaenge.forEach(function (g) { bild(g.dataset.bild); });
    function waehle(g) {
      if (g.classList.contains('an')) return;
      gaenge.forEach(function (x) { x.classList.remove('an'); }); g.classList.add('an');
      var neu = bild(g.dataset.bild).cloneNode(true);
      var name = g.querySelector('b').textContent + ', ' + g.querySelector('span').textContent;
      if (neu.tagName === 'IMG') neu.alt = name; else neu.querySelector('b').textContent = name;
      neu.classList.add('neu'); teller.appendChild(neu);
      function los() { void neu.offsetWidth; setTimeout(function () { neu.classList.add('rein'); }, 16); }
      if (neu.tagName !== 'IMG' || neu.complete) los(); else neu.addEventListener('load', los, { once: true });
      setTimeout(function () {
        var vor = neu.previousElementSibling;
        while (vor) { var v = vor.previousElementSibling; vor.remove(); vor = v; }
      }, 1050);
    }
    gaenge.forEach(function (g) {
      g.addEventListener('click', function () { waehle(g); });
      g.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) waehle(g); });
    });
  }

  // Reservieren: Tisch oder Feier, Abschicken → Dank (noch ohne Server)
  var af = document.getElementById('af');
  if (af) {
    var arten = [].slice.call(af.querySelectorAll('.art'));
    function art(k) {
      arten.forEach(function (a) { a.classList.toggle('an', a.dataset.art === k); });
      [].forEach.call(af.querySelectorAll('[data-nur]'), function (f) { f.hidden = f.dataset.nur !== k; });
    }
    arten.forEach(function (a) { a.addEventListener('click', function () { art(a.dataset.art); }); });
    art(/feier/.test(location.hash) ? 'feier' : 'tisch');
    af.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (af.querySelector('[name=website]').value) return;
      var n = af.querySelector('[name=name]'), c = af.querySelector('[name=kontakt]');
      if (!n.value.trim() || !c.value.trim()) { (n.value.trim() ? c : n).focus(); return; }
      af.classList.add('fertig'); af.querySelector('.af-danke').hidden = false;
    });
  }
})();
