/* Leiste oben, Sprache unten links, Chat unten rechts (Robert 04.11.2026, wie beim Grand Beau-Rivage):
   im Auftakt sichtbar, beim Runterscrollen weg, beim Hochscrollen zurück. Gezählt wird der Weg seit dem letzten Richtungswechsel (24 px),
   nicht je Bild, sonst verschwindet bei 120 Bildern/s nichts. Oberhalb von 140 px immer sichtbar. Nach dem ersten Scrollen liegt eine Platte hinter der Leiste. */
(function () {
  var d = document.documentElement, nav = document.querySelector('.nav');
  var auftakt = document.getElementById('auftakt');
  var yAlt = scrollY, richt = 0, anker = yAlt, frei = true;
  function weg(an) { d.classList.toggle('kopf-weg', an); if (nav) nav.classList.toggle('kopf-aus', an); }   /* nicht «weg»: die Klasse ist auf der Seite schon das Raster des Ablaufs */
  function lies() {
    frei = true;
    var y = scrollY;
    d.classList.toggle('kopf-unten', y > 40 || d.classList.contains('kopf-platte'));
    /* Sprache und Chat-Knopf nur im Auftakt (Robert 04.11.2026: «bitte nur im Hero anzeigen»): weg, sobald der Auftakt zur Hälfte aus dem Bild ist */
    if (auftakt) d.classList.toggle('ecken-aus', auftakt.getBoundingClientRect().bottom < innerHeight * .5);
    if (!d.classList.contains('offen') && !d.classList.contains('fc-offen')) {
      if ((y - yAlt) * richt < 0 || (!richt && y !== yAlt)) { richt = y > yAlt ? 1 : -1; anker = yAlt; }
      if (y < 140) weg(false);
      else if (richt > 0 && y - anker > 24) weg(true);
      else if (richt < 0 && anker - y > 24) weg(false);
    }
    yAlt = y;
  }
  /* Menü oben rechts (Robert 04.11.2026 23:10: «kann oben rechts die leiste nicht öffnen»): main.js, das es bisher öffnete, laden diese Seiten nicht */
  var burger = document.querySelector('.burger');
  function menue(an) { d.classList.toggle('offen', an); if (burger) burger.setAttribute('aria-expanded', String(an)); document.body.style.overflow = an ? 'hidden' : ''; if (an) weg(false); }
  if (burger) {
    burger.addEventListener('click', function () { menue(!d.classList.contains('offen')); });
    document.querySelectorAll('.menue a').forEach(function (a) { a.addEventListener('click', function () { menue(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('offen')) menue(false); });
  }
  addEventListener('scroll', function () { if (frei) { frei = false; requestAnimationFrame(lies); } }, { passive: true });
  addEventListener('resize', function () { if (frei) { frei = false; requestAnimationFrame(lies); } });
  lies();

  /* Sprache: Deutsch, Englisch, Französisch. Die Übersetzung folgt (Robert 04.11.2026: «machen wir im Nachgang»);
     bis dahin merkt sich die Wahl die Sprache, setzt lang am Dokument und meldet «tasty-sprache», woran die Übersetzung andocken wird. */
  var sp = document.querySelector('.sprache');
  if (sp) {
    var setze = function (l, melden) {
      sp.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('lang') === l)); });
      d.setAttribute('lang', l);
      try { localStorage.setItem('tasty-sprache', l); } catch (e) {}
      if (melden) dispatchEvent(new CustomEvent('tasty-sprache', { detail: l }));
    };
    var gemerkt = null; try { gemerkt = localStorage.getItem('tasty-sprache'); } catch (e) {}
    if (gemerkt && sp.querySelector('button[lang="' + gemerkt + '"]')) setze(gemerkt, false);
    sp.addEventListener('click', function (e) { var b = e.target.closest('button[lang]'); if (b) setze(b.getAttribute('lang'), true); });
  }
})();

/* Umschalter auf jeder Seite (Robert 04.11.2026: «von überall auf der Seite aus zwischen Restaurant und Hotel wechseln»):
   die beiden Felder führen auf dieselbe Seite in der anderen Welt (Arbeiten Hotel <-> Arbeiten Restaurant), Team ist für beide gleich.
   Seiten ohne feste Welt bekommen sie hier: Hotel-Unterseiten «hotel», Team die zuletzt gewählte. */
(function () {
  var d = document.documentElement, wa = document.querySelector('.wahl');
  var PAAR = {'01': 'restaurant', 'werkzeuge': 'werkzeuge-r', 'studio': 'studio-r', 'work': 'work-r'};
  var BEIG = {'markenbuch': 'beigabe-markenbuch-r', 'gaestemappe': 'beigabe-tischkarte-r', 'mails': 'beigabe-mails-r', 'drucksachen': 'beigabe-drucksachen-r',
    'unterlagen': 'beigabe-unterlagen-r', 'feed': 'beigabe-feed-r', 'materialordner': 'beigabe-materialordner-r', 'aufkleber': 'beigabe-gutscheine-r'};
  var f = (location.pathname.split('/').pop() || '01.html').replace(/\.html$/, ''), h = f + '.html', g = f + '.html', k;
  if (PAAR[f]) { g = PAAR[f] + '.html'; if (!d.getAttribute('data-welt')) d.setAttribute('data-welt', 'hotel'); }
  else {
    for (k in PAAR) if (PAAR[k] === f) h = k + '.html';
    for (k in BEIG) if (BEIG[k] === f) h = 'beigaben/' + k + '/index.html';
  }
  if (!d.getAttribute('data-welt')) {
    var m = null; try { m = localStorage.getItem('tasty-welt'); } catch (e) {}
    d.setAttribute('data-welt', m === 'gastro' ? 'gastro' : 'hotel');
  }
  if (!wa) return;
  var w = d.getAttribute('data-welt'), as = wa.querySelectorAll('.wahl__k');
  for (var i = 0; i < as.length; i++) (function (a) {
    var x = a.getAttribute('data-welt');
    a.setAttribute('href', './' + (x === 'gastro' ? g : h) + location.hash);
    if (x === w) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    a.addEventListener('click', function () { try { localStorage.setItem('tasty-welt', x); } catch (e) {} });
  })(as[i]);
})();

/* Hotel | Restaurant (Robert 04.11.2026): zwei Startseiten mit demselben Aufbau. Die Startseite merkt sich, welche gewählt ist;
   auf den Unterseiten führen «Tasty Studios» und jede Verbindung zur Startseite dann in diese Fassung. */
(function () {
  var w = document.documentElement.getAttribute('data-welt');
  try { if (w) localStorage.setItem('tasty-welt', w); else w = localStorage.getItem('tasty-welt'); } catch (e) {}
  if (w !== 'gastro') return;
  var as = document.querySelectorAll('a[href^="01.html"]');
  for (var i = 0; i < as.length; i++) {
    if (as[i].classList.contains('wahl__k')) continue;
    as[i].setAttribute('href', as[i].getAttribute('href').replace(/^01\.html/, 'restaurant.html'));
  }
  /* Seiten mit Hotel-Inhalt haben in der Restaurant-Welt ein Gegenstück (Robert 04.11.2026: «die komplette Seite umstellen, wenn ich auf Restaurant gehe»),
     gleiche Liste wie welt_r.py GEGEN. Team bleibt für beide gleich. */
  var GEGEN = {'werkzeuge': 'werkzeuge-r', 'studio': 'studio-r', 'work': 'work-r', 'beigabe-markenbuch': 'beigabe-markenbuch-r', 'beigabe-gaestemappe': 'beigabe-tischkarte-r',
    'beigabe-mails': 'beigabe-mails-r', 'beigabe-drucksachen': 'beigabe-drucksachen-r', 'beigabe-unterlagen': 'beigabe-unterlagen-r', 'beigabe-feed': 'beigabe-feed-r',
    'beigabe-materialordner': 'beigabe-materialordner-r', 'beigabe-aufkleber': 'beigabe-gutscheine-r'};
  /* die Hotel-Beigaben liegen unter beigaben/<ordner>/index.html (Werkbank-Seiten), ihr Gegenstück ist beigabe-*-r.html */
  var BEIGABEN = {'markenbuch': 'beigabe-markenbuch-r', 'gaestemappe': 'beigabe-tischkarte-r', 'mails': 'beigabe-mails-r', 'drucksachen': 'beigabe-drucksachen-r',
    'unterlagen': 'beigabe-unterlagen-r', 'feed': 'beigabe-feed-r', 'materialordner': 'beigabe-materialordner-r', 'aufkleber': 'beigabe-gutscheine-r'};
  var ls = document.querySelectorAll('a[href]');
  for (var j = 0; j < ls.length; j++) {
    var h = ls[j].getAttribute('href'), m = h.match(/^((?:\.\.\/)*)([a-z-]+)\.html(#.*)?$/), b = h.match(/^((?:\.\.\/)*)beigaben\/([a-z]+)\/index\.html(#.*)?$/);
    if (m && GEGEN[m[2]]) ls[j].setAttribute('href', m[1] + GEGEN[m[2]] + '.html' + (m[3] || ''));
    else if (b && BEIGABEN[b[2]]) ls[j].setAttribute('href', b[1] + BEIGABEN[b[2]] + '.html' + (b[3] || ''));
  }
})();
