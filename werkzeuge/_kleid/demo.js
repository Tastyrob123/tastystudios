/* Ihr Haus · Vorführ-Schutz für alle sieben Werkzeuge.
   Als ERSTES Skript im <head> laden. Danach kann ein Werkzeug nichts mehr speichern,
   senden, herunterladen oder nach aussen öffnen. Alles, was der Gast ändert, lebt nur
   im Arbeitsspeicher und ist nach dem Neuladen wieder wie vorher.
   Werkzeuge rufen DEMO.hinweis('…') auf, wenn eine Handlung in echt etwas tun würde
   (Veröffentlichen, Senden, PDF), und zeigen das Ergebnis im Werkzeug selbst. */
(function(){
  'use strict';
  var leer = function(){ return Promise.reject(new Error('Vorführung: keine Verbindung')); };

  // Kein Netz: weder fetch noch XHR noch Beacons noch WebSockets.
  window.fetch = leer;
  window.XMLHttpRequest = function(){ throw new Error('Vorführung: keine Verbindung'); };
  if (navigator.sendBeacon) navigator.sendBeacon = function(){ return false; };
  window.WebSocket = function(){ throw new Error('Vorführung: keine Verbindung'); };
  window.EventSource = function(){ throw new Error('Vorführung: keine Verbindung'); };

  // Kein Speicher: localStorage/sessionStorage als flüchtige Attrappe, keine Cookies, keine IndexedDB.
  function attrappe(){ var d = {}; return {
    getItem:function(k){ return Object.prototype.hasOwnProperty.call(d,k) ? d[k] : null; },
    setItem:function(k,v){ d[k] = String(v); }, removeItem:function(k){ delete d[k]; },
    clear:function(){ d = {}; }, key:function(i){ return Object.keys(d)[i] || null; },
    get length(){ return Object.keys(d).length; } }; }
  try { Object.defineProperty(window, 'localStorage', { value: attrappe(), configurable: false }); } catch(e){}
  try { Object.defineProperty(window, 'sessionStorage', { value: attrappe(), configurable: false }); } catch(e){}
  try { Object.defineProperty(document, 'cookie', { get:function(){ return ''; }, set:function(){}, configurable: false }); } catch(e){}
  try { Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: false }); } catch(e){}

  // Nichts herunterladen, nichts drucken, keine neuen Fenster.
  window.open = function(){ DEMO.hinweis('In der Vorführung öffnet sich nichts nach aussen.'); return null; };
  window.print = function(){ DEMO.hinweis('In der Vorführung wird nichts gedruckt. Die Vorschau zeigt, wie es aussehen würde.'); };
  if (window.URL && URL.createObjectURL) URL.createObjectURL = function(){ return 'about:blank'; };

  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var intern = href === '' || href.charAt(0) === '#' || (/^\.\.?\//.test(href) && !/^\.\.\/\.\.\//.test(href)) || (!/^[a-z]+:/i.test(href) && href.charAt(0) !== '/');
    if (a.hasAttribute('download') || /^(mailto|tel|sms|blob|data):/i.test(href) || !intern || a.target === '_blank') {
      e.preventDefault(); e.stopPropagation();
      DEMO.hinweis('In der Vorführung bleibt alles hier im Werkzeug.');
    }
  }, true);

  // Formulare werden nie abgeschickt.
  document.addEventListener('submit', function(e){ e.preventDefault(); }, true);

  var t;
  window.DEMO = {
    aktiv: true,
    hinweis: function(text){
      var el = document.querySelector('.demo-hinweis');
      if (!el) { el = document.createElement('div'); el.className = 'demo-hinweis'; el.setAttribute('role','status'); document.body.appendChild(el); }
      el.textContent = text || 'Vorführung: Ihre Änderung wirkt nur hier und ist nach dem Neuladen wieder wie vorher.';
      requestAnimationFrame(function(){ el.classList.add('da'); });
      clearTimeout(t); t = setTimeout(function(){ el.classList.remove('da'); }, 3200);
    },
    haus: null
  };
})();
