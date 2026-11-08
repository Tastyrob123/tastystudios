/* Atelier der Werkzeuge (Robert 03.11.2026): Werkzeug wählen, Vorführung im Fenster öffnen. Aufbau in at.py. */
(function () {
  var at = document.querySelector('[data-w="at"]');
  if (!at) return;
  var knoepfe = at.querySelectorAll('.at-w'), tafeln = at.querySelectorAll('.at-b');

  function zeige(k) {
    knoepfe.forEach(function (b) { var an = b.dataset.at === k; b.classList.toggle('an', an); b.setAttribute('aria-pressed', an); });
    tafeln.forEach(function (t) { var an = t.dataset.at === k; t.classList.toggle('an', an); t.setAttribute('aria-hidden', !an); });
  }
  knoepfe.forEach(function (b) {
    b.addEventListener('click', function () {
      zeige(b.dataset.at);
      if (window.matchMedia('(max-width:860px)').matches) b.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'smooth' });
    });
  });

  var fenster = document.querySelector('.at-fenster');
  document.body.appendChild(fenster);  // raus aus der Ebene des Abschnitts, damit es über der Leiste liegt
  var rahmen = fenster.querySelector('iframe'), titel = fenster.querySelector('.at-fenster__kopf b'), zuletzt;
  function oeffne(k, name) {
    zuletzt = document.activeElement;
    titel.textContent = name;
    rahmen.src = 'werkzeuge/' + k + '/index.html';
    fenster.hidden = false;
    document.documentElement.classList.add('at-offen');
    requestAnimationFrame(function () { fenster.classList.add('da'); });
    fenster.querySelector('.at-zu').focus();
  }
  function schliesse() {
    fenster.classList.remove('da');
    document.documentElement.classList.remove('at-offen');
    setTimeout(function () { fenster.hidden = true; rahmen.src = 'about:blank'; }, 350);
    if (zuletzt) zuletzt.focus();
  }
  at.querySelectorAll('[data-oeffne]').forEach(function (b) {
    b.addEventListener('click', function () { oeffne(b.dataset.oeffne, b.closest('.at-b').querySelector('h3').textContent); });
  });
  fenster.querySelector('.at-zu').addEventListener('click', schliesse);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !fenster.hidden) schliesse(); });
})();
