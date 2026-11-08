/* Prüfseite von La Réception (pruefung.html): eigenes Skript, weil die Website online keine eingebetteten Skripte zulässt (CSP). */
(function () {
  var LEX = {
    ANFRAGE: ['«Diese Anfrage gibt es nicht mehr.»', 'Jemand hat sie in einem anderen Fenster gelöscht, oder sie war älter als zwölf Monate.', 'Im Eingang «Neu laden». Die Liste zeigt dann den aktuellen Stand.'],
    BRIEF: ['«Zu dieser Anfrage gibt es noch keinen Brief.»', 'Der Brief wird beim ersten Öffnen geschrieben; das hat nicht geklappt.', 'Anfrage schliessen und wieder öffnen, oder «Neu schreiben lassen».'],
    ENTWURF: ['Der Brief liess sich nicht schreiben.', 'Der Assistent hat die Anfrage abgelehnt oder eine Vorlage aus dem Wortlaut der Website fehlt.', 'Brief selbst in «Nur Text» schreiben. In der Vorführung sind alle Briefe vorgeschrieben.'],
    KI: ['«Der Chat antwortet gerade nicht» oder «Guthaben aufgebraucht».', 'Der Dienst hinter dem Chat ist nicht erreichbar oder das Monatsguthaben ist leer.', 'Später noch einmal. Eingang, Brief gestalten, PDF und Wissen gehen trotzdem. Hält es an: Guthaben im Konto des Hauses prüfen.'],
    CHAT: ['«Der Assistent ist noch nicht geladen.»', 'Der Server-Teil ist gerade erst gestartet.', 'Einen Moment warten und noch einmal klicken; hilft das nicht, den Server neu starten.'],
    'ÜBERSETZEN': ['«Die Übersetzung kam unvollständig zurück.»', 'Der Assistent hat nicht alles übersetzt.', '«Neu übersetzen» klicken.'],
    PDF: ['Das PDF liess sich nicht setzen.', 'Auf dem Rechner fehlt node mit Chromium (Playwright), oder der Satz brauchte über zwei Minuten.', 'Oben unter «Brief» nachsehen, was fehlt. Bis dahin: Brief kopieren oder ⌘P im Brief.'],
    KONFLIKT: ['«Dieser Brief wurde inzwischen in einem anderen Fenster geändert.»', 'Zwei Fenster (oder zwei Personen) haben denselben Brief offen; das andere hat zuerst gespeichert. Nichts wurde überschrieben.', 'Eigene Änderung kopieren, «Neu laden», ansehen, was das andere Fenster geändert hat, und die eigene Änderung wieder einsetzen.'],
    FORMULAR: ['«Bitte Name und E-Mail oder Telefon angeben.»', 'Im Anfrage-Fenster der Website fehlte der Kontakt.', 'Nichts zu tun; der Gast sieht den Hinweis selbst.'],
    EINGABE: ['Eine Eingabe wurde abgewiesen.', 'Feld leer, zu lang oder in falscher Form.', 'Den Hinweis in der Meldung lesen und das Feld anpassen.'],
    NAME: ['«Bitte Ihren Namen eintragen.»', 'Jede Änderung am Wissen trägt einen Namen, damit man später weiss, wer was eingetragen hat.', 'Vor- und Nachname eintragen; der Name bleibt im Browser gemerkt.'],
    WISSEN: ['Eine Änderung am Wissen ging nicht.', 'Die Zeile oder der Eintrag gibt es nicht mehr, oder der Text fehlt.', 'Neu laden und noch einmal versuchen.'],
    AUSZUG: ['«Das Material liess sich nicht auswerten.»', 'Der Assistent fand im Link, Dokument oder Foto nichts Belegbares.', '«Neu einlesen» oder den Text selbst ins Feld kopieren.'],
    SEITE: ['«Die Seite zeigt ihren Inhalt erst im Browser.»', 'Die verlinkte Seite baut ihren Text erst mit Skripten auf.', 'Den Text der Seite kopieren und ins Feld einfügen.'],
    LINK: ['Der Link liess sich nicht lesen.', 'Adresse falsch, Seite nicht erreichbar oder eine Adresse im eigenen Netz (aus Sicherheitsgründen gesperrt).', 'Adresse im Browser öffnen und prüfen.'],
    DATEI: ['Eine Datei ist beschädigt oder zu gross.', 'Ablage: Datei unlesbar und ohne gute Sicherung. Hochladen: Datei über 20 MB oder unlesbar.', 'Ablage: oben unter «Daten» nachsehen und Robert melden. Hochladen: kleinere Datei oder Foto nehmen.'],
    FRAGE: ['Eine Frage gibt es nicht mehr.', 'Sie wurde gelöscht oder war älter als zwölf Monate.', 'Neu laden.'],
    GROESSE: ['«Die Anfrage ist zu gross.»', 'Mehr als 3 MB (beim Einlesen von Wissen 40 MB) in einer Anfrage.', 'Kleinere Datei nehmen oder Text kürzen.'],
    GRENZE: ['«Zu viele Anfragen in kurzer Zeit.»', 'Schutz gegen Fehlbedienung und Angriffe: höchstens 900 Aufrufe, 120 Änderungen und 8 PDF je Minute.', 'Eine Minute warten.'],
    HOST: ['«Falsche Adresse.»', 'Das Werkzeug wurde über einen fremden Namen aufgerufen.', 'Über localhost oder 127.0.0.1 öffnen.'],
    HERKUNFT: ['«Nicht erlaubt.»', 'Die Anfrage kam nicht vom Werkzeug selbst (fremde Seite, fremdes Gerät).', 'Das Werkzeug direkt öffnen, nicht eingebettet in eine fremde Seite.'],
    VERBINDUNG: ['«Der Server-Teil antwortet nicht.»', 'Der Server ist nicht gestartet, oder das Netz war kurz weg.', 'Server starten (python3 _werkzeuge/reception/server.py 9064) und neu laden.'],
    SERVER: ['Fehler im Server-Teil.', 'Etwas Unerwartetes; der genaue Grund steht in der Meldung.', 'Neu laden. Wiederholt es sich: Meldung mit Uhrzeit an Robert.'],
    FORMULAR: ['Ein Gast kann ein Formular der Website nicht abschicken.', 'Es fehlt eine E-Mail-Adresse oder Telefonnummer, oder sie hat eine Form, die keine sein kann. Der Gast sieht die Meldung direkt am Formular.', 'Nichts zu tun: der Gast ergänzt seine Angabe. Kommen viele solche Meldungen, das Formular auf der Website ansehen (Feld E-Mail oder Telefon).'],
    ANMELDUNG: ['Keine Anmeldung vor dem Werkzeug.', 'So gewollt bis zur Auslieferung an das Haus (Robert 15.10.2026).', 'Vor der Auslieferung: Anmeldung mit Passwort davorsetzen.']
  };
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  $('#lex').innerHTML = Object.keys(LEX).map(function (k) { var e = LEX[k]; return '<article id="' + k + '"><h3>' + k + '</h3><p><b>Sehen</b> ' + esc(e[0]) + '</p><p><b>Grund</b> ' + esc(e[1]) + '</p><p><b>Tun</b> ' + esc(e[2]) + '</p></article>'; }).join('');
  if (location.hash) { var z = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (z) z.scrollIntoView(); }

  function browser() {
    var p = [], ls = true;
    try { localStorage.setItem('__p', '1'); localStorage.removeItem('__p'); } catch (e) { ls = false; }
    p.push({ gruppe: 'Browser', was: 'Speicher im Browser', stand: ls ? 'gut' : 'gelb', text: ls ? 'vorhanden (Name, letzte Ansicht)' : 'gesperrt (privates Fenster?): Name und Ansicht werden nicht gemerkt' });
    var mod = !!(window.fetch && window.Promise && window.CSS && CSS.supports && CSS.supports('display', 'grid'));
    p.push({ gruppe: 'Browser', was: 'Browser kann das Werkzeug', stand: mod ? 'gut' : 'rot', text: mod ? navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 90) : 'zu alt: bitte Safari, Chrome, Edge oder Firefox in neuer Fassung', stichwort: mod ? '' : 'SERVER' });
    return p;
  }
  function zeichne(p) {
    var gr = '', h = '';
    p.forEach(function (x) {
      if (x.gruppe !== gr) { gr = x.gruppe; h += '<div class="gr">' + esc(gr) + '</div>'; }
      h += '<div class="z ' + esc(x.stand) + '"><i></i><b>' + esc(x.was) + '</b><span>' + esc(x.text) + '</span>' + (x.stichwort ? '<a href="#' + esc(x.stichwort) + '">' + esc(x.stichwort) + '</a>' : '<span></span>') + '</div>';
    });
    $('#punkte').innerHTML = h;
    var rot = p.filter(function (x) { return x.stand === 'rot'; }).length;
    $('#satz').textContent = rot ? rot + (rot === 1 ? ' Punkt braucht' : ' Punkte brauchen') + ' Aufmerksamkeit. Das Stichwort rechts führt zur Erklärung.' : 'Alles in Ordnung. Gelb heisst: bewusst so, kein Fehler.';
  }
  function fehlerListe(server) {
    var lokal = [];
    try { lokal = JSON.parse(localStorage.getItem('reception-fehler') || '[]').reverse(); } catch (e) { }
    var alle = lokal.map(function (x) { return { zeit: x.zeit, text: x.text, wo: 'dieser Browser' }; }).concat((server || []).map(function (x) { return { zeit: x.zeit, text: x.text, wo: 'Server-Protokoll' }; }));
    $('#fehler').innerHTML = alle.length ? alle.slice(0, 40).map(function (x) { return '<li><time>' + esc(new Date(x.zeit).toLocaleString('de-DE')) + '</time>' + esc(x.text) + ' <small>(' + esc(x.wo) + ')</small></li>'; }).join('') : '<li>Keine Fehler mitgeschrieben.</li>';
  }
  function pruefe() {
    var p = browser();
    /* Vorführung: kein Server-Teil; was sonst api/zustand meldet, steht hier fest */
    zeichne(p.concat([{ gruppe: 'Vorführung', was: 'Anfragen und Fragen', stand: 'gut', text: '15 Anfragen mit Brief, 14 Fragen an den Chat, nur im Arbeitsspeicher' },
      { gruppe: 'Vorführung', was: 'Wissen des Chats', stand: 'gut', text: 'aus den Angaben des Hauses, dreizehn Bereiche' },
      { gruppe: 'Vorführung', was: 'Chat', stand: 'gut', text: 'vorgeschriebene Antworten, keine KI, kein Schlüssel' },
      { gruppe: 'Vorführung', was: 'PDF-Satz', stand: 'gut', text: 'A4-Seite als Vorschau im Fenster, es entsteht keine Datei' },
      { gruppe: 'Vorführung', was: 'Speichern und Senden', stand: 'gelb', text: 'bewusst aus: nach dem Neuladen ist alles wie vorher, es geht nichts hinaus' }]));
    fehlerListe([]);
  }
  $('#neu').onclick = pruefe;
  document.querySelectorAll('[data-rep]').forEach(function (b) {
    var text = b.textContent, t = 0;
    b.onclick = function () {
      if (!b.classList.contains('scharf')) { b.classList.add('scharf'); b.textContent = 'Wirklich? Noch einmal klicken'; clearTimeout(t); t = setTimeout(function () { b.classList.remove('scharf'); b.textContent = text; }, 4000); return; }
      clearTimeout(t); b.classList.remove('scharf');
      if (b.dataset.rep === 'fehler') {
        try { localStorage.removeItem('reception-fehler'); } catch (e) { }
        /* Vorführung: die Liste lebt nur in diesem Fenster */
        b.textContent = 'Geleert'; setTimeout(function () { b.textContent = text; }, 2000); pruefe();
      } else {
        try { Object.keys(localStorage).forEach(function (k) { if (/^reception-|^rundgang-ce-reception|^rundgang-ce-savoir/.test(k)) localStorage.removeItem(k); }); sessionStorage.clear(); } catch (e) { }
        b.textContent = 'Zurückgesetzt'; setTimeout(function () { b.textContent = text; }, 2000);
      }
    };
  });
  /* Vorführung: statt api/export läuft das Packen sichtbar durch, es entsteht keine Datei */
  var ex = $('#export');
  if (ex) ex.onclick = function () {
    var text = ex.textContent; ex.disabled = true; ex.textContent = 'Wird gepackt …';
    setTimeout(function () { ex.textContent = 'Gepackt'; if (window.DEMO) DEMO.hinweis('In der Vorführung entsteht keine Datei. Im Haus kämen hier Anfragen mit Briefen, Fragen, Nachträge und das Wissen als eine Datei.');
      setTimeout(function () { ex.textContent = text; ex.disabled = false; }, 2400); }, 1100);
  };
  pruefe();
})();
