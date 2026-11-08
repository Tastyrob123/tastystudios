/* Hotel Monte-Moro · Alle Ansichten im Fenster (Plan Unterseiten 19.10.2026; neu nach Robert 20.10.2026 14:18: «alle Ansichten soll noch viel schöner sein»).
   Ein Knopf mit data-galerie="id" öffnet die Fotos aus <template id="gal-id"> über den ganzen Bildschirm auf Nachtblau: ein grosses Foto, dann Paare
   und Zweier-Drittel, bündig aneinander. Die Fotos laden erst beim Öffnen; die ersten kommen in einem Zug von unten, die weiteren, sobald sie den Rand
   berühren. Esc, Klick auf «Schliessen» oder ← → zum Blättern im Fenster (Pfeiltasten scrollen zum nächsten Foto). */
(function () {
  'use strict';
  var D = document, dlg, gitter, titel, zahl, beob;
  function baue() {
    dlg = D.body.appendChild(D.createElement('dialog'));
    dlg.className = 'gal'; dlg.setAttribute('aria-labelledby', 'gal-titel');
    dlg.innerHTML = '<div class="gal__kopf"><div><p class="gal__ueber">Hotel Monte-Moro · Alle Ansichten</p><p class="gal__titel" id="gal-titel"></p></div>' +
      '<p class="gal__zahl"></p><button class="gal__zu" type="button"><span>Schliessen</span><i aria-hidden="true">×</i></button></div>' +
      '<div class="gal__gitter"></div><p class="gal__ende"><button class="gal__zurueck" type="button">Zurück zur Seite</button></p>';
    gitter = dlg.querySelector('.gal__gitter'); titel = dlg.querySelector('.gal__titel'); zahl = dlg.querySelector('.gal__zahl');
    dlg.querySelector('.gal__zu').addEventListener('click', zu);
    dlg.querySelector('.gal__zurueck').addEventListener('click', zu);
    dlg.addEventListener('close', function () { D.documentElement.classList.remove('gal-offen'); });
    if ('IntersectionObserver' in window) beob = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('gal__da'); beob.unobserve(en.target); } });
    }, { root: dlg, rootMargin: '0px 0px -4% 0px' });
  }
  function zu() { if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); D.documentElement.classList.remove('gal-offen'); } }
  /* Rhythmus: gross · Paar · zwei Drittel + ein Drittel · gross … ; bleibt am Ende eines übrig, wird es gross. */
  function ordne(figs) {
    var muster = ['g', 'h', 'h', 'z', 'd'], i = 0, n = figs.length;
    while (i < n) {
      var rest = n - i, m = muster[i % 5];
      if ((m === 'h' || m === 'z') && rest === 1) m = 'g';
      figs[i].className = 'gal__' + m;
      i++;
    }
  }
  function oeffne(id) {
    var t = D.getElementById('gal-' + id); if (!t) return;
    if (!dlg) baue();
    titel.textContent = t.getAttribute('data-titel') || '';
    gitter.innerHTML = ''; gitter.appendChild(t.content.cloneNode(true));
    var figs = [].slice.call(gitter.querySelectorAll('figure'));
    zahl.textContent = figs.length + (figs.length === 1 ? ' Foto' : ' Fotos');
    ordne(figs);
    figs.forEach(function (f, i) {
      var im = f.querySelector('img'), ss = im.getAttribute('data-srcset'), s = im.getAttribute('data-src');
      if (ss) { im.setAttribute('srcset', ss); im.removeAttribute('data-srcset'); }
      if (s) { im.setAttribute('src', s); im.removeAttribute('data-src'); }
      im.setAttribute('sizes', f.className === 'gal__g' ? '100vw' : (f.className === 'gal__d' ? '34vw' : '66vw'));
      im.loading = 'eager';
    });
    D.documentElement.classList.add('gal-offen');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      figs.forEach(function (f, i) { if (!beob || i < 3) f.classList.add('gal__da'); else beob.observe(f); });
    }); });
  }
  D.addEventListener('click', function (e) { var b = e.target.closest('[data-galerie]'); if (!b) return; e.preventDefault(); oeffne(b.getAttribute('data-galerie')); });
})();
