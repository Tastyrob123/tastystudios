/* Hotel Monte-Moro · Zimmeransicht (Robert 24.10.2026: «statt alle Ansichten für jedes Zimmer noch eine Zimmeransicht bauen mit allen infos die uns vorliegen»).
   Ein Knopf mit data-zimmer="id" öffnet <template id="zi-id"> über den ganzen Bildschirm auf Nachtblau: links laufen alle Fotos der Zimmerart
   (gross, dann Paare, bündig aneinander), rechts steht der Steckbrief fest (Ausstattung, Preise, Inklusive, Gut zu wissen, Knöpfe).
   Die Fotos laden erst beim Öffnen; sie kommen deckend von unten, sobald sie den Rand berühren. Esc oder «Schliessen» schliesst. */
(function () {
  'use strict';
  var D = document, dlg, leib, titel, beob;
  function baue() {
    dlg = D.body.appendChild(D.createElement('dialog'));
    dlg.className = 'zi'; dlg.setAttribute('aria-labelledby', 'zi-titel');
    dlg.innerHTML = '<div class="zi__kopf"><div><p class="zi__ueber">Hotel Monte-Moro · Zimmeransicht</p><p class="zi__titel" id="zi-titel"></p></div>' +
      '<button class="gal__zu zi__zu" type="button"><span>Schliessen</span><i aria-hidden="true">×</i></button></div><div class="zi__leib"></div>';
    leib = dlg.querySelector('.zi__leib'); titel = dlg.querySelector('.zi__titel');
    dlg.querySelector('.zi__zu').addEventListener('click', zu);
    dlg.addEventListener('close', function () { D.documentElement.classList.remove('gal-offen'); });
    if ('IntersectionObserver' in window) beob = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('zi__da'); beob.unobserve(en.target); } });
    }, { root: dlg, rootMargin: '0px 0px -4% 0px' });
  }
  function zu() { if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); D.documentElement.classList.remove('gal-offen'); } }
  function oeffne(id) {
    var t = D.getElementById('zi-' + id); if (!t) return;
    if (!dlg) baue();
    titel.textContent = t.getAttribute('data-titel') || '';
    leib.innerHTML = ''; leib.appendChild(t.content.cloneNode(true));
    var figs = [].slice.call(leib.querySelectorAll('.zi__bilder figure'));
    /* Rhythmus: das erste Foto gross, danach Paare; bleibt am Ende eines übrig, wird es gross */
    figs.forEach(function (f, i) {
      var gross = i === 0 || (i % 3 === 0) || (i === figs.length - 1 && (i % 3) === 1);
      f.className = gross ? 'zi__g' : 'zi__h';
      var im = f.querySelector('img'), ss = im.getAttribute('data-srcset'), s = im.getAttribute('data-src');
      if (ss) { im.setAttribute('srcset', ss); im.removeAttribute('data-srcset'); }
      if (s) { im.setAttribute('src', s); im.removeAttribute('data-src'); }
      im.setAttribute('sizes', gross ? '(max-width:900px) 100vw, 58vw' : '(max-width:900px) 50vw, 29vw');
      im.loading = 'eager';
    });
    D.documentElement.classList.add('gal-offen');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var steck = leib.querySelector('.zi__steck'); if (steck) steck.classList.add('zi__da');
      figs.forEach(function (f, i) { if (!beob || i < 3) f.classList.add('zi__da'); else beob.observe(f); });
    }); });
  }
  D.addEventListener('click', function (e) { var b = e.target.closest('[data-zimmer]'); if (!b) return; e.preventDefault(); oeffne(b.getAttribute('data-zimmer')); });
})();
