/* Kopie von Ihr Haus/ihrhaus.js für die eingebaute Vorschau von «Website bearbeiten» (Vorführung). Einzige Änderung: Fotos der Zimmer aus ../_haus/img. */
/* Ihr Haus: erster Blick komplett, Auftritte am Rand, Leiste kommt und geht, Zimmer und Gänge wechseln. Nativer Scroll, nur transform. */
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
  var ziele = document.querySelectorAll('.sw, .sw-feld');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('da'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -4% 0px' });
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
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(leisteNach); } }, { passive: true });

  // Ein neues Bild steigt in seinem Rahmen von unten auf, das alte bleibt darunter liegen (keine Überblendung)
  function tausch(buehne, quelle) {
    var alt = buehne.querySelector('img:last-of-type');
    var neu = quelle.cloneNode(true);
    neu.removeAttribute('loading'); neu.className = 'neu';
    buehne.appendChild(neu);
    function los() { void neu.offsetWidth; setTimeout(function () { neu.classList.add('rein'); }, 16); }
    if (neu.complete) los(); else neu.addEventListener('load', los, { once: true });
    setTimeout(function () {
      if (!neu.parentNode) return;
      var vor = neu.previousElementSibling;
      while (vor) { var v = vor.previousElementSibling; if (vor.tagName === 'IMG') vor.remove(); vor = v; }
    }, 950);
  }

  // Zimmer
  var datenEl = document.getElementById('zimmer-daten');
  if (datenEl) {
    var Z = JSON.parse(datenEl.textContent), sec = document.getElementById('zimmer');
    var buehne = sec.querySelector('[data-buehne]'), daumen = sec.querySelector('.zi-daumen'), info = sec.querySelector('.zimmer__info');
    var linie = sec.querySelector('.zi-linie'), reiter = [].slice.call(sec.querySelectorAll('.zi-r')), name = info.querySelector('.zi-name');
    var vorrat = {};
    function bildEl(b, alt, sizes) {
      var i = document.createElement('img');
      var br = [800, 1400];   /* Vorschau im Werkzeug (Ihr Haus, Vorführung): dieselben Fotos aus ../_haus/img, dort in 800 und 1400 Pixeln */
      i.src = '../_haus/img/' + b + '-' + br[1] + '.webp';
      i.srcset = br.map(function (w) { return '../_haus/img/' + b + '-' + w + '.webp ' + w + 'w'; }).join(', ');
      i.width = 1600; i.height = 1000;
      i.sizes = sizes; i.alt = alt; i.decoding = 'async';
      return i;
    }
    // alle Zimmerbilder früh vorladen, damit jeder Wechsel sofort scharf ist
    Object.keys(Z).forEach(function (k) { Z[k].bilder.forEach(function (b) { vorrat[b[0]] = bildEl(b[0], b[1], '(max-width:900px) 100vw, 62vw'); }); });
    function linieNach(r) {
      if (!linie || !r) return;
      var p = r.parentNode.getBoundingClientRect(), q = r.getBoundingClientRect();
      linie.style.transform = 'translateX(' + (q.left - p.left) + 'px) scaleX(' + (q.width / 100) + ')';
    }
    function daumenBauen(k) {
      daumen.innerHTML = '';
      Z[k].bilder.forEach(function (b, i) {
        var d = document.createElement('button'); d.type = 'button'; d.className = 'zi-d' + (i === 0 ? ' an' : ''); d.setAttribute('aria-label', b[1]);
        var im = bildEl(b[0], b[1], '220px'); d.appendChild(im); daumen.appendChild(d);
        d.addEventListener('click', function () {
          if (d.classList.contains('an')) return;
          [].forEach.call(daumen.children, function (x) { x.classList.remove('an'); }); d.classList.add('an');
          tausch(buehne, vorrat[b[0]]);
        });
      });
    }
    [].forEach.call(daumen.children, function (d, i) {
      d.addEventListener('click', function () {
        if (d.classList.contains('an')) return;
        [].forEach.call(daumen.children, function (x) { x.classList.remove('an'); }); d.classList.add('an');
        tausch(buehne, vorrat[Z[reiter[0].dataset.zimmer].bilder[i][0]]);
      });
    });
    reiter.forEach(function (r) {
      r.addEventListener('click', function () {
        if (r.classList.contains('an')) return;
        reiter.forEach(function (x) { x.classList.remove('an'); }); r.classList.add('an'); linieNach(r);
        var z = Z[r.dataset.zimmer];
        tausch(buehne, vorrat[z.bilder[0][0]]);
        name.classList.add('raus');
        setTimeout(function () {
          name.querySelector('.sl>span').textContent = z.name;
          info.querySelector('.zi-satz').textContent = z.satz;
          info.querySelector('.zi-fakten').textContent = z.fakten;
          info.querySelector('.zi-preis b').textContent = z.preis + ' €';
          name.classList.remove('raus'); name.classList.add('unten'); info.classList.add('wechsel');
          void name.offsetWidth;
          name.classList.remove('unten'); info.classList.remove('wechsel');
          daumenBauen(r.dataset.zimmer);
        }, 290);
      });
    });
    requestAnimationFrame(function () { linieNach(reiter[0]); });
    window.addEventListener('resize', function () { linieNach(sec.querySelector('.zi-r.an')); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { linieNach(sec.querySelector('.zi-r.an')); });
  }

  // Die Tafel: ein Gang der Karte zeigt seinen Teller
  var teller = document.querySelector('[data-teller]');
  if (teller) {
    var vorlad = {};
    [].forEach.call(document.querySelectorAll('.tafel .vorlad img'), function (i) { var m = i.src.match(/img\/(.+?)-\d+\.webp/); if (m) vorlad[m[1]] = i; });
    vorlad['r-zander'] = teller.querySelector('img').cloneNode(true);
    var gaenge = [].slice.call(document.querySelectorAll('.ga'));
    function waehle(g) {
      if (g.classList.contains('an')) return;
      gaenge.forEach(function (x) { x.classList.remove('an'); }); g.classList.add('an');
      var q = vorlad[g.dataset.bild]; if (!q) return;
      var c = q.cloneNode(true); c.alt = g.querySelector('b').textContent + ', ' + g.querySelector('span').textContent;
      tausch(teller, c);
    }
    gaenge.forEach(function (g) {
      g.addEventListener('click', function () { waehle(g); });
      g.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) waehle(g); });
    });
  }

  // Anfrage-Fenster: Art wählen, passende Felder zeigen, Abschicken → Dank (noch ohne Server; später Die Winde)
  var af = document.getElementById('af');
  if (af) {
    var arten = [].slice.call(af.querySelectorAll('.art'));
    function art(k) {
      arten.forEach(function (a) { a.classList.toggle('an', a.dataset.art === k); });
      [].forEach.call(af.querySelectorAll('[data-nur]'), function (f) { f.hidden = f.dataset.nur !== k; });
      [].forEach.call(af.querySelectorAll('[data-tag]'), function (t) { t.hidden = t.dataset.tag.split(' ').indexOf(k) < 0; });
      var d2 = af.querySelector('[name=datum2]'); d2.type = k === 'zimmer' ? 'date' : 'text';
    }
    arten.forEach(function (a) { a.addEventListener('click', function () { art(a.dataset.art); }); });
    var h = location.hash; var k0 = /tisch/.test(h) ? 'tisch' : /feier/.test(h) ? 'feier' : 'zimmer';
    var zm = h.match(/zimmer=([a-z]+)/); if (zm) { var sel = af.querySelector('[name=zimmer]'); if (sel) sel.value = zm[1]; }
    art(k0);
    af.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (af.querySelector('[name=website]').value) return;
      var n = af.querySelector('[name=name]'), c = af.querySelector('[name=kontakt]');
      if (!n.value.trim() || !c.value.trim()) { (n.value.trim() ? c : n).focus(); return; }
      af.classList.add('fertig'); af.querySelector('.af-danke').hidden = false;
    });
  }
})();
