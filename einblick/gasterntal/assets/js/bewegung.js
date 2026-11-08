/* Berghotel Gasterntal — BEWEGUNG beim Scrollen (Tasty Studios 13.10.2026). Gestaltung und Erklärung: assets/css/bewegung.css.
   Dieses Skript sagt nur, WAS ein Stück ist und WANN es pulsiert:
     bw-s      Stück (Bild, Karte, Kachel, Blatt): immer deckend, der Weg nach oben hängt am Scrollen
     bw-g      Gruppe (am Rechner): kommt als Ganzes, ihre Teile stehen still. Am Handy stehen die Teile untereinander und kommen einzeln
     bw-los    das Stück rückt unten ins Fenster: jetzt pulsiert es, nach der Uhr, genau einmal
     bw-fertig das Pulsieren ist vorbei
   Läuft nach main.js (das .still setzt). Ohne dieses Skript gilt die Bewegung aus main.css weiter. */
(function () {
  'use strict';
  var doc = document.documentElement, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  if (doc.classList.contains('still') || !('IntersectionObserver' in window)) return;
  var eng = matchMedia('(max-width: 900px)').matches;
  var AUS = '.auftakt,.seitenkopf,.bruch,dialog,.menue,.nicht,.stoss,.stapel,.polas,.tisch__p,.blaetter__lauf .band,.tafel,.zstage__tafel';   /* .tafel: dort ist das Stück nur der Inhalt einer hellen Fläche, er schwebt wie Schrift herein */
  var STUECK = '[data-r="bild"],[data-r="schweb"],[data-r="rechts"],[data-r="links"],.blatt[data-r],.kachel[data-r],.anlass[data-r],.sockel[data-r],.dn-karte-dunkel[data-r],.dn-summe[data-r],.dn-rechner[data-r],.dn-gs-form[data-r],.sb-woche[data-r],.sb-karte[data-r],.gaeste[data-r],.takt[data-r]';
  var liste = [];
  $$('[data-gruppe]').forEach(function (g) { if (g.closest(AUS) || eng) return; g.classList.add('bw-s', 'bw-g'); liste.push(g); });
  $$(STUECK).forEach(function (el) { if (el.closest(AUS) || el.closest('.bw-g') || (el.parentElement && el.parentElement.closest('.bw-s'))) return; el.classList.add('bw-s'); liste.push(el); });
  /* was beim Laden schon über dem Fenster liegt (Sprung zu einem Anker, neu geladen in der Seitenmitte), steht still an seinem Platz */
  var vh = window.innerHeight;
  liste = liste.filter(function (el) { if (!el.getClientRects().length || el.getBoundingClientRect().bottom < 0) { el.classList.add('bw-los', 'bw-fertig'); return false; } return true; });   /* ebenso, was beim Laden ausgeblendet ist (zweiter Reiter der Karte, ein vergangener Anlass): es steht, wenn es später gezeigt wird */
  /* Robert 18.10.2026 18:17 («zu früh, zu schnell»): los, wenn rund ein Fünftel des Stücks im Bild ist (bei sehr hohen ein Fünftel des Fensters); nach oben weit offen: wer springt, überspringt nichts */
  var fuenftel = function (e) { return e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= window.innerHeight * 0.2); }, FUENFTEL = { rootMargin: '100000px 0px 0px 0px', threshold: [0, 0.05, 0.1, 0.15, 0.2] };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!fuenftel(e)) return; io.unobserve(e.target); e.target.classList.add('bw-los'); });
  }, FUENFTEL);   /* 18.10.2026 früher (Robert «direkt reinschweben»); nach oben weit offen: wer springt, überspringt nichts */
  liste.forEach(function (el) { io.observe(el); });

  /* ---------- Überschriften rollen zeilenweise aus einem Schlitz (Zeilen-Maske, Robert 13.10.2026: «die Überschriften sollen schon hochrollen, nicht so erscheinen») ----------
     Wo eine Überschrift ihre Zeilen schon trägt (.z aus bau.py), bleibt sie so. Sonst legt dieses Skript die Zeilen an, nach dem echten Umbruch
     (jedes Wort wird gemessen), auch nach dem Drehen des Handys. Überschriften mit eigenen Teilen darin (kleine Zeile, Link) rollen als ein Block.
     Gerollt wird, wenn die Überschrift im Fenster steht (7 % über dem unteren Rand), nicht davor. Die Schrift ist dabei voll deckend.
     Steht die Überschrift in einem Kasten, der bisher als Ganzes eingeblendet wurde (bw-fest), bleibt der Kasten stehen und seine übrigen Teile
     schweben einzeln herein (bw-t). Zahlen und Zeilen, die ein Skript laufend neu schreibt, tragen ihre Zeile schon im HTML. */
  var ROLL = 'main h2,main h3,main h4,.fuss h3,.fuss h4,.kachel__kopf,.betrieb,.saison__zahl,.saison__wort,.sb-tel,.blatt__satz';
  var NICHT = '.auftakt,.seitenkopf,.bruch,dialog,.menue,.nicht,.sr,.stapel,.stoss,.polas,.hw-karte,[hidden]';
  var vorschau = /\/(entwurf|vorher)\//.test(location.pathname);   /* im Studio bleiben die Texte, wie sie sind (dort wird hineingeklickt) */
  var rollen = [], teilen = [];
  if (!vorschau) $$(ROLL).forEach(function (el) {
    if (el.closest(NICHT) || (el.parentElement && el.parentElement.closest('.bw-zeilen')) || !el.textContent.trim()) return;
    if (el.querySelector('.z')) { el.classList.add('bw-zeilen'); rollen.push(el); return; }
    if (el.querySelector('svg,img,button,input,[data-zaehl],[data-saison],[data-ab],[data-jetzt],[data-fest]') || el.matches('[data-saison],[data-ab],[data-jetzt],[data-fest],[data-zaehl]')) return;
    el.classList.add('bw-zeilen'); rollen.push(el);
    if (el.children.length) { var z = document.createElement('span'), inn = document.createElement('span'); z.className = 'z'; while (el.firstChild) inn.appendChild(el.firstChild); z.appendChild(inn); el.appendChild(z); }
    else { el._bwText = el.textContent.replace(/\s+/g, ' ').trim(); teilen.push(el); }
  });
  function umbrechen(els) {   /* drei Schritte für alle zusammen: Wörter einzeln setzen, einmal messen, Zeilen bauen */
    var worte = els.map(function (el) { el.textContent = ''; return el._bwText.split(' ').map(function (w, i, a) { var sp = document.createElement('span'); sp.style.display = 'inline-block'; sp.textContent = w; el.appendChild(sp); if (i < a.length - 1) el.appendChild(document.createTextNode(' ')); return sp; }); });
    var lagen = worte.map(function (ws) { return ws.map(function (sp) { return sp.offsetTop; }); });
    els.forEach(function (el, n) {
      var zeilen = [], oben = null; worte[n].forEach(function (sp, i) { var t = lagen[n][i]; if (oben === null || Math.abs(t - oben) > 4) { zeilen.push([]); oben = t; } zeilen[zeilen.length - 1].push(sp.textContent); });
      el.textContent = ''; zeilen.forEach(function (zl, i) { var z = document.createElement('span'), inn = document.createElement('span'); z.className = 'z'; z.style.setProperty('--i', i); inn.textContent = zl.join(' '); z.appendChild(inn); el.appendChild(z); });
    });
  }
  if (teilen.length) {
    umbrechen(teilen);
    var breite = window.innerWidth, warte = 0;
    window.addEventListener('resize', function () { clearTimeout(warte); warte = setTimeout(function () { if (window.innerWidth === breite) return; breite = window.innerWidth; umbrechen(teilen); }, 220); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { umbrechen(teilen); });   /* mit der geladenen Schrift bricht manche Zeile anders */
  }
  /* Kästen, die bisher als Ganzes eingeblendet wurden und eine rollende Überschrift tragen: der Kasten steht, die übrigen Teile schweben einzeln */
  var schweben = [];
  rollen.forEach(function (el) {
    var k = el.parentElement && el.parentElement.closest('[data-r]'); if (!k || k.classList.contains('bw-s') || k.classList.contains('bw-fest') || k.closest('.auftakt,.seitenkopf')) return;
    k.classList.add('bw-fest');
    [].slice.call(k.children).forEach(function (kind, i) { if (kind.classList.contains('bw-zeilen') || kind.querySelector('.bw-zeilen') || kind.hidden) return; kind.classList.add('bw-t'); kind.style.setProperty('--bw-i', Math.min(i, 4)); schweben.push(kind); });
  });
  /* Robert 18.10.2026 17:46 («da fehlen die ganzen Animationen … stell das bitte überall sicher»): Schrift, die bisher ohne Auftritt dastand
     (Listen und Links im Fuss, «Ehrlich», Zitate, Sätze unter Zahlen, Rechtliches), schwebt wie die übrige Schrift herein, Geschwister 0,12 s auseinander */
  var STEHT = 'main p,main li,main blockquote,main figcaption,main h3,main h4,.fuss p,.fuss li';
  var BEWEGT = '[data-r],.bw-s,.bw-t,.bw-zeilen,.z,.bw-g,[data-an],.auftakt,.seitenkopf,.bruch,[data-tempo],.stoss,.polas,.stapel,.tafel,dialog,.menue,nav,[data-laufband],[hidden],.sr,.nicht,.leiste,.takt,form,label,.hw-karte';
  if (!vorschau) $$(STEHT).forEach(function (el) {
    if (el.closest(BEWEGT) || !el.getClientRects().length || !el.textContent.trim()) return;
    var i = [].indexOf.call(el.parentElement.children, el);
    el.classList.add('bw-t'); el.style.setProperty('--bw-i', Math.min(i, 4)); schweben.push(el);
  });
  var zio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!fuenftel(e)) return; zio.unobserve(e.target); e.target.classList.add('bw-auf'); });
  }, FUENFTEL);
  rollen.concat(schweben).forEach(function (el) { if (!el.getClientRects().length || el.getBoundingClientRect().bottom < 0) el.classList.add('bw-auf'); else zio.observe(el); });

  document.addEventListener('animationend', function (e) { if ((e.animationName === 'bw-puls' || e.animationName === 'bw-feder') && e.target.classList && e.target.classList.contains('bw-s')) e.target.classList.add('bw-fertig'); }, true);
})();
