/* Hereinschweben wie beim Grand Beau-Rivage (26.10.2026). Kapitel: treten Sie ein, setzen Sie sich, entspannen Sie sich, folgen Sie uns,
   lesen Sie die Karten, Ihr Gepäck ist schon da.
   Verlauf mit Robert: (1) Auftritt nach Auslöser im Fenster: «warten noch, bis ich komme. Und springen dann erst hoch». (2) Starr am Scrollen:
   «viel zu doll schnell rein». (3) Gedämpft am Scrollen: Überlappen bei schnellem Scrollen. (4) Kurz gedämpft: «ploppen schnell nach oben».
   Darum jetzt: jedes Stück fliegt in seinem eigenen ruhigen Tempo (CSS 1,6 s, langes Auslaufen) wie beim Rivage, aber der Flug startet schon,
   sobald es unten ins Fenster kommt (12 % der Fensterhöhe vorher, gemessen an seiner sichtbaren Lage), ohne Staffel. Man sieht es nur im Flug, nie wartend.
   Kein Überlappen: alle Stücke fliegen denselben Weg; was weiter oben liegt, startet immer zuerst; Text direkt unter Bildern startet mit dem Bild.
   Danach gleitet jedes Foto beim Scrollen sacht im Rahmen (GBR «Gleiten»). Deckend von Anfang an, nur translate/scale. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var KAP = ['#haus', '#gourmet', '#spa', '#saastal', '#angebote', '#anreise'];
  var TEXT = '.ro, .rl, .rs, .r-knoepfe, ul, ol, dl, blockquote, h3, [class*="zeile"], [class*="zahlen"], [class*="dazu"], [class*="preis"], .bl, .leiste, .ed-z > p';
  var alle = [], gl = [];
  KAP.forEach(function (sel) {
    var S = document.querySelector(sel); if (!S) return;
    [].forEach.call(S.querySelectorAll('figure'), function (f) {
      if (f.parentElement.closest('figure')) return;
      if (getComputedStyle(f).transform !== 'none') return;   /* hat schon einen eigenen Auftritt des Kapitels (z. B. kleines Bild bei «setzen Sie sich») */
      f.classList.add('rv-b'); f._mit = []; alle.push(f);
      var im = f.querySelectorAll('img'); if (im.length === 1) { im[0].classList.add('rv-f'); gl.push({ im: im[0], f: f, da: false }); }
    });
    [].forEach.call(S.querySelectorAll(TEXT), function (t) {
      if (t.closest('figure') || t.closest('.rt') || t.closest('button') || t.closest('a') || t.parentElement.closest('.rv-t')) return;
      t.classList.add('rv-t');
      var vo = t.previousElementSibling, vf = null;   /* Text direkt unter Bildern (Bildunterschrift, «Dazu»-Zeile) startet mit dem Bild darüber */
      if (vo) { if (vo.tagName === 'FIGURE') vf = vo; else { var fs = vo.querySelectorAll('figure'); if (fs.length) vf = fs[fs.length - 1]; } }
      if (vf && vf._mit) vf._mit.push(t); else alle.push(t);
    });
  });
  var los = function (el) { el.classList.add('rv-da'); (el._mit || []).forEach(function (t) { t.classList.add('rv-da'); }); };
  /* Was beim Laden schon über dem Fenster liegt (Rücksprung), steht sofort ohne Flug */
  alle.forEach(function (el) {
    if (el.getBoundingClientRect().bottom < 0) [el].concat(el._mit || []).forEach(function (x) { x.classList.add('rv-sofort', 'rv-da'); });
  });
  requestAnimationFrame(function () { requestAnimationFrame(function () { [].forEach.call(document.querySelectorAll('.rv-sofort'), function (x) { x.classList.remove('rv-sofort'); }); }); });
  /* Start knapp bevor das Stück sichtbar unten hereinkommt; oben-zuerst ist durch die Lage gesichert */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { los(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
  alle.forEach(function (el) { if (!el.classList.contains('rv-da')) io.observe(el); });

  /* Gleiten: das Foto wandert beim Scrollen sacht in seinem Rahmen (höchstens 2 % der Rahmenhöhe, passt in die Ruhe-Vergrösserung 1,04) */
  var vh = innerHeight, offen = 0;
  var gio = new IntersectionObserver(function (es) { es.forEach(function (e) { gl.forEach(function (g) { if (g.f === e.target) g.da = e.isIntersecting; }); }); }, { rootMargin: '10% 0px 10% 0px' });
  gl.forEach(function (g) { gio.observe(g.f); });
  function gleite() {
    offen = 0;
    for (var i = 0; i < gl.length; i++) {
      var g = gl[i]; if (!g.da) continue;
      var r = g.f.getBoundingClientRect(), q = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      q = q < -1 ? -1 : q > 1 ? 1 : q;
      g.im.style.translate = '0 ' + (q * r.height * .02).toFixed(1) + 'px';
    }
  }
  addEventListener('scroll', function () { if (!offen) offen = requestAnimationFrame(gleite); }, { passive: true });
  addEventListener('resize', function () { vh = innerHeight; gleite(); }, { passive: true });
  gleite();
})();
