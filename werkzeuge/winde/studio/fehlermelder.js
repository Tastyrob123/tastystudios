/* Fehler mitschreiben, bevor irgendetwas anderes läuft (Master R03): liest pruefung.html. Vorführung: nur im Speicher dieser Seite, nach dem Neuladen leer */
(function(){var zahl=0;function merk(t){t=String(t);if(++zahl>20||/Load failed|access control|abort|NetworkError|Failed to fetch/i.test(t))return;/* Netzfehler nie melden, höchstens 20 je Seite (Safari-Schleife 15.10.2026) */
try{var a=JSON.parse(localStorage.getItem('reception-fehler')||'[]');a.push({zeit:new Date().toISOString(),text:t.slice(0,600)});localStorage.setItem('reception-fehler',JSON.stringify(a.slice(-30)))}catch(e){}
/* Vorführung: kein Server-Teil, die Meldung bleibt im Speicher dieser Seite */}
window.addEventListener('error',function(e){merk((e.message||'Fehler')+' · '+(e.filename||'').split('/').pop()+':'+(e.lineno||''))});
window.addEventListener('unhandledrejection',function(e){merk('Versprechen: '+((e.reason&&e.reason.message)||e.reason))});window.receptionMerk=merk})();
