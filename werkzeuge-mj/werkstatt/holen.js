/* Drucksachen & Feed · Vorführung: Daten aus dem Arbeitsspeicher statt aus dem Netz.
   Wo die Vorlage beim Server nachfragt (fetch), fragt dieses Werkzeug DS_HOLEN. Die Antworten stehen in daten.js (window.DS_DATEIEN)
   oder werden hier vorgeschrieben (Entwürfe, Plakat-Vorschläge, Vorschaubilder). Es geht nichts hinaus und es entsteht keine Datei. */
(function () {
  'use strict';
  function antwort(wert, ok) {
    var text = typeof wert === 'string' ? wert : JSON.stringify(wert);
    return {
      ok: ok !== false, status: ok === false ? 404 : 200,
      headers: { get: function (k) { return /content-type/i.test(k) ? 'application/json' : null; } },
      json: function () { return Promise.resolve(typeof wert === 'string' ? JSON.parse(wert) : JSON.parse(text)); },
      text: function () { return Promise.resolve(text); },
      blob: function () { return Promise.resolve(new Blob([text])); },
      arrayBuffer: function () { return Promise.resolve(new TextEncoder().encode(text).buffer); },
      clone: function () { return antwort(wert, ok); }
    };
  }
  function pfad(url) {
    var u = String(url && url.url || url || '');
    try { u = new URL(u, location.href).pathname; } catch (e) {}
    var i = u.indexOf('/werkstatt/'), h = u.indexOf('/_haus/');
    if (i >= 0) u = u.slice(i + 11);
    else if (h >= 0) u = u.slice(h + 1);
    return u.replace(/^\//, '');
  }
  window.DS_HOLEN = function (url, opt) {
    var p = pfad(url), D = window.DS_DATEIEN || {}, A = window.DS_ANTWORTEN || {};
    var handler = A[p];
    return new Promise(function (ok, nein) {
      setTimeout(function () {
        try {
          if (typeof handler === 'function') {
            var body = opt && opt.body ? JSON.parse(opt.body) : null;
            Promise.resolve().then(function () { return handler(body, opt); }).then(function (w) { ok(antwort(w)); }, function (e) { ok(antwort({ fehler: String(e && e.message || e) }, false)); });
            return;
          }
          if (Object.prototype.hasOwnProperty.call(D, p)) return ok(antwort(D[p]));
          if (/^blob:|^data:/.test(String(url))) return nein(new Error('Vorführung: keine Datei'));
          ok(antwort({}, false));
        } catch (e) { nein(e); }
      }, 0);
    });
  };
})();
