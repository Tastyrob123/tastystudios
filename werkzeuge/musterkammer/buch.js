/* Die Hausregeln · Ihr Haus · «Als PDF sichern» (wie die Vorlage: erst alle Fotos holen), in der Vorführung läuft es sichtbar durch und endet mit DEMO.hinweis.
   Es entsteht keine Datei, es wird nichts gedruckt. Die Dateien in «Zum Mitnehmen» laufen genauso durch. */
'use strict';
(function () {
  const alle = () => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }); }));
  const css = document.createElement('style');
  css.textContent = '.bu-q{position:fixed;z-index:200;left:50%;bottom:28px;transform:translateX(-50%);display:grid;gap:5px;min-width:min(360px,calc(100vw - 32px));max-width:calc(100vw - 32px);padding:14px 18px;border-radius:14px;background:#10151d;color:#efe7da;box-shadow:0 0 0 1px rgba(226,174,104,.4),0 20px 30px -14px rgba(0,0,0,.8);font:500 11px/1.35 "Instrument Sans",system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase}'
    + '.bu-q small{font:400 12px/1.35 "Instrument Sans",system-ui,sans-serif;letter-spacing:.02em;text-transform:none;color:rgba(239,231,218,.72);overflow-wrap:anywhere}'
    + '.bu-q span{display:block;height:2px;margin-top:4px;border-radius:2px;background:rgba(226,174,104,.18);overflow:hidden}'
    + '.bu-q span i{display:block;height:100%;background:#e2ae68;transform:scaleX(0);transform-origin:left;transition:transform 1.4s cubic-bezier(.3,.7,.2,1)}.bu-q.laeuft span i{transform:scaleX(1)}';
  document.head.appendChild(css);
  function lauf(name) {
    const alt = document.querySelector('.bu-q'); if (alt) alt.remove();
    const q = document.createElement('div'); q.className = 'bu-q'; q.setAttribute('role', 'status');
    q.innerHTML = '<b>Wird vorbereitet</b><small></small><span><i></i></span>'; q.querySelector('small').textContent = name;
    document.body.appendChild(q);
    requestAnimationFrame(() => requestAnimationFrame(() => q.classList.add('laeuft')));
    setTimeout(() => { q.querySelector('b').textContent = 'Bereit'; if (window.DEMO) DEMO.hinweis('In der Vorführung entsteht keine Datei. Im echten Werkzeug liegt sie jetzt in Ihrem Download-Ordner.'); }, 1500);
    setTimeout(() => q.remove(), 5200);
  }
  const b = document.getElementById('bu-pdf');
  if (b) b.addEventListener('click', () => alle().then(() => lauf('ihr-haus-hausregeln.pdf · je Kapitel eine Seite, A4 quer')));
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-vlad]'); if (a) { e.preventDefault(); lauf(a.getAttribute('data-vlad')); } });
  addEventListener('beforeprint', () => { [...document.images].forEach(i => { i.loading = 'eager'; }); });
  addEventListener('load', () => setTimeout(alle, 1200));
})();
