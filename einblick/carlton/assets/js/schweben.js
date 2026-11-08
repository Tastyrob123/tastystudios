/* Schweben überall (Robert 15.10.2026, 14:49–14:55: «Reinkriegen, Pulsieren, Federn, Zoomen … in den ganzen Bereichen … beides … auf der ganzen Seite, alle Seiten so»).
   Läuft vor main.js und gibt jedem grösseren Foto, das noch keinen eigenen Auftritt hat, den Auftritt des Hauses: data-r="schweb"
   (Weg nach oben am Scrollen, Pulsieren nach der Uhr, siehe seitenbau.css «ce-zug/ce-puls») und, wo das Foto allein in einem Rahmen sitzt,
   den Zoom mit anschliessendem Gleiten (main.js, Klasse .ce-sw am Rahmen). Überschriften und Lauftexte ohne Auftritt steigen auf (data-r).
   Ausgenommen: Kopf, Fuss, Auftakt, Fenster, Dialoge und Stellen mit eigener Bewegung. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search)) return;
  var AUS = '.band,header,nav,footer,.fuss,dialog,.hero,.sk2,.vk,.bruch,.gast,.buchen,.zs,.zmos,[data-finder],.galerie,.trio--frei,.lk__b,.fh__bild,[data-bilder],.wahl,.pk9-g,.sk-anz,[data-laufband],.lupe';
  var EIGEN = ['schweb', 'bild', 'rein'];
  var gruppe = new Map();
  /* Stücke in seitlich blätternden Bändern bleiben, wie sie sind: dort löst das Scrollen nach unten nichts aus */
  function quer(el) {
    for (var e = el.parentElement; e && e !== document.body; e = e.parentElement) { var o = getComputedStyle(e).overflowX; if (o === 'auto' || o === 'scroll') return true; }
    return false;
  }
  function hatEigenen(el, bis) {
    for (var e = el; e && e !== bis; e = e.parentElement) if (EIGEN.indexOf(e.getAttribute('data-r')) >= 0) return true;
    return false;
  }
  document.querySelectorAll('main img, .seite img, section img').forEach(function (im) {
    if (im.closest(AUS) || !im.offsetParent || quer(im)) return;
    var r = im.getBoundingClientRect();
    if (r.width < 160 || r.height < 110) return;
    var p = im.parentElement; if (p.tagName === 'PICTURE') p = p.parentElement;
    var fig = im.closest('figure');
    if (!fig || fig.querySelectorAll('img').length > 1) fig = p;
    if (fig.classList.contains('frei--kerbe') && fig.parentElement.querySelectorAll('figure').length === 1) fig = fig.parentElement;
    /* Übereinander liegende Bilder (Wechselbild) schweben gemeinsam, sonst schaut beim Federn das Bild darunter hervor (Robert 16.10.2026) */
    if (getComputedStyle(fig).position === 'absolute' && fig.parentElement.querySelectorAll('img').length > 1) fig = fig.parentElement;
    if (hatEigenen(fig, null)) return;
    fig.setAttribute('data-r', 'schweb');
    var g = fig.parentElement, n = gruppe.get(g) || 0; gruppe.set(g, n + 1);
    if (!fig.style.getPropertyValue('--i')) fig.style.setProperty('--i', Math.min(n, 4));
    /* Zoom und Gleiten nur, wo das Foto seinen Rahmen allein füllt */
    var q = im.parentElement, rq = q.getBoundingClientRect();
    if (!q.classList.contains('rahmen__k') && q.querySelectorAll('img').length === 1 && Math.abs(rq.width - r.width) < 3 && Math.abs(rq.height - r.height) < 3
        && getComputedStyle(im).transform === 'none' && getComputedStyle(im).outlineStyle === 'none') {
      q.classList.add('ce-sw'); q.style.borderRadius = getComputedStyle(im).borderRadius;
    }
  });
  document.querySelectorAll('main h2, main h3, main p.lauf, section h2, section h3, section p.lauf').forEach(function (t) {
    if (t.closest(AUS) || t.closest('[data-r]') || t.closest('a,button,[data-feld][hidden]') || !t.textContent.trim() || !t.offsetParent || quer(t)) return;
    t.setAttribute('data-r', '');
  });
})();
