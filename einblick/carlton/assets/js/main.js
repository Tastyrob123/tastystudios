/* Jede Seite öffnet oben (Robert 18.10.2026 über den Oberchef: «Alle Seiten öffnen oben»), ausser ein Anker im Link verlangt eine Stelle */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);
/* Carlton-Europe — ein Takt, nativer Scroll, Bewegung nur über transform/opacity (Bausteine nach dem Referenzbau Salt & Silver) */
(function () {
  'use strict';
  var doc = document.documentElement, $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  /* Sprache der Seite (de, en, fr): Sätze, die das Skript selbst schreibt, und der Weg zu den Bildern aus en/ und fr/ */
  var SP = (doc.lang || 'de').slice(0, 2), WURZEL = SP === 'de' ? '' : '../';
  /* Entwurf (Robert 17.10.2026, Werkbank-Regel 12: «Formulare … an die echte Adresse des Hauses … abstellen oder als Demo kennzeichnen»):
     solange die Seite ein Entwurf ist (kein data-live="1"), öffnet keine Anfrage das Mailprogramm; an ihrer Stelle steht ein Hinweis. */
  var ENTWURF = doc.getAttribute('data-live') !== '1';
  var ENTWURF_SATZ = { de: 'Das ist ein Entwurf von Tasty Studios: Diese Anfrage wurde nicht verschickt. Auf der fertigen Seite geht sie direkt an das Haus.',
    en: 'This is a draft by Tasty Studios: this request was not sent. On the finished site it goes straight to the hotel.',
    fr: 'Ceci est une ébauche de Tasty Studios : cette demande n’a pas été envoyée. Sur le site définitif, elle parvient directement à l’hôtel.' };
  function entwurfHinweis(fo) {
    var alt = fo.querySelector('.formular__danke'); if (alt) alt.remove();
    var d = document.createElement('p'); d.className = 'lauf formular__danke formular__entwurf'; d.setAttribute('role', 'status');
    d.textContent = ENTWURF_SATZ[SP] || ENTWURF_SATZ.de; fo.appendChild(d);
  }
  var W = {
    de: { lupe: 'Bild in gross', zu: 'Schliessen', vor: 'Vorheriges Bild', nach: 'Nächstes Bild',
      zumRaum: 'Zum Raum', saal1: 'Ein Saal ist gross genug. Am genauesten passt: ', saalN: ' Säle sind gross genug. Am genauesten passt: ', saalE: 'Dafür ist ein Saal gross genug: ',
      bleibt1: 'Es bleibt', bleibtN: 'Es bleiben', von: ' von ', keine: 'Diese Mischung gibt es im Haus nicht. <i>Einen Wunsch weniger</i>, und es passt wieder.' },
    en: { lupe: 'Enlarged picture', zu: 'Close', vor: 'Previous picture', nach: 'Next picture',
      zumRaum: 'To the room', saal1: 'One room is large enough. The closest fit: ', saalN: ' rooms are large enough. The closest fit: ', saalE: 'One room is large enough for this: ',
      bleibt1: 'That leaves', bleibtN: 'That leaves', von: ' of ', keine: 'The house does not have this combination. <i>One wish fewer</i>, and it fits again.' },
    fr: { lupe: 'Image agrandie', zu: 'Fermer', vor: 'Image précédente', nach: 'Image suivante',
      zumRaum: 'Voir la salle', saal1: 'Une salle est assez grande. La plus adaptée\u00a0: ', saalN: ' salles sont assez grandes. La plus adaptée\u00a0: ', saalE: 'Une salle est assez grande pour cela\u00a0: ',
      bleibt1: 'Il reste', bleibtN: 'Il reste', von: ' sur ', keine: 'Cette combinaison n’existe pas dans la maison. <i>Un souhait de moins</i>, et cela convient à nouveau.' }
  }[SP] || {};
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nomotion/.test(location.search);
  try { sessionStorage.setItem('ce-da', '1'); } catch (e) {}

  /* ---------- Einblenden ---------- */
  /* Wie beim Grand Beau-Rivage (Robert 15.10.2026: «dieses Entstehen der Texte … auf der kompletten Website»): jede grosse Überschrift,
     die noch nicht in Zeilen gefasst ist, steigt aus einer Maske auf; der Hotelname im Auftakt rollt ebenso herein. */
  if (!ruhig) {
    $$('h2.d1, h2.d2, h3.d2, h2.d3, h3.d3, .d2, .d3').forEach(function (h) {
      if (h.querySelector('.z') || h.closest('nav,footer,.fuss,.gast,.vk,.zk-kissen,button,a,[data-feld][hidden]')) return;
      if (!h.textContent.trim()) return;
      h.innerHTML = '<span class="z"><span>' + h.innerHTML + '</span></span>';
      if (!h.hasAttribute('data-r') && !h.closest('[data-r]')) h.setAttribute('data-r', '');
    });
  }
  var ziele = $$('[data-r]');
  if (ruhig || !('IntersectionObserver' in window)) {
    ziele.forEach(function (el) { el.classList.add('da'); });
    $$('.z').forEach(function (el) { el.classList.add('da'); });
  } else {
    /* Bilder erst zeigen, wenn sie geladen und entpackt sind – sonst blitzen sie beim Einblenden auf */
    var wennBereit = function (el, dann) {
      var offen = $$('img', el).filter(function (im) { return im.offsetParent !== null; }), n = offen.length, los = false;
      var fertig = function () { if (los) return; los = true; dann(); };
      if (!n) return fertig();
      var eins = function () { if (--n <= 0) fertig(); };
      offen.forEach(function (im) {
        var entpackt = function () { (im.decode ? im.decode() : Promise.resolve()).then(eins, eins); };
        if (im.complete && im.naturalWidth) return eins();   /* schon geladen: nicht mehr aufs Entpacken warten (Robert 13.10.2026: «direkt hochkommen, ohne den kleinen Abwartungsmoment»); die Stücke stehen deckend da, bilder.js entpackt im Voraus */
        im.loading = 'eager';
        im.addEventListener('load', entpackt, { once: true });
        im.addEventListener('error', eins, { once: true });
      });
      setTimeout(fertig, 700);
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('da'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px 4% 0px', threshold: 0 });   /* Schrift und Zeilen starten kurz vor dem unteren Rand (13.10.2026: vorher 12 %, mit dem längeren, weicheren Lauf sieht man sie im Fenster aufsteigen) */
    /* grosse Bilder kommen früher: sobald die Oberkante unten ins Fenster rückt */
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { bio.unobserve(e.target); wennBereit(e.target, function () { e.target.classList.add('da'); }); } });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });   /* Bilder und Kacheln sind von Anfang an deckend und starten mit Vorlauf (Robert 13.10.2026: «sofort hochkommen», kein Warten im Fenster); der lange federnde Lauf endet im Blick */
    /* Fenster: der Satz steht fest in der Bildschirmmitte, der Ausschnitt wandert darüber. Der Satz startet erst,
       wenn die Oberkante des Ausschnitts ihn zu einem Drittel freigegeben hat. */
    $$('.bruch').forEach(function (b) {
      var t = $('.in', b), fio = null;
      var lausche = function () {
        if (fio) fio.disconnect();
        var r = t.getBoundingClientRect(), linie = r.top + r.height * 0.68;
        fio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            fio.disconnect(); fio = null; window.removeEventListener('resize', lausche);
            $$('[data-r]', b).forEach(function (k) { k.classList.add('da'); });
          });
        }, { rootMargin: '0px 0px -' + Math.max(0, Math.round(window.innerHeight - linie)) + 'px 0px', threshold: 0 });
        fio.observe(b);
      };
      lausche();
      window.addEventListener('resize', lausche, { passive: true });
    });
    /* Gruppen, deren Bilder gemeinsam starten und nacheinander aufsteigen (Dreiklang, Reihen) */
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        dio.unobserve(e.target);
        /* nacheinander starten (nicht alle im selben Augenblick): so verteilt sich das Zeichnen der Karten auf mehrere Bilder */
        wennBereit(e.target, function () { $$('[data-r]', e.target).forEach(function (k, n) { k.style.transitionDelay = '0s'; setTimeout(function () { k.classList.add('da'); }, n * 95); }); });
      });
    }, { rootMargin: '0px 0px 6% 0px', threshold: 0 });
    $$('.drei,[data-gruppe]').forEach(function (d) { dio.observe(d); });
    ziele.forEach(function (el) {
      if (el.closest('.hero')) { requestAnimationFrame(function () { el.classList.add('da'); }); }
      else if (!el.closest('.bruch') && !el.closest('.drei') && !el.closest('[data-gruppe]')) {
        var art = el.getAttribute('data-r');
        /* alles, was vor dem Auftritt schon deckend dasteht (Bilder, Kacheln, Blätter), und der Fuss am Seitenende nehmen den frühen Auslöser */
        if (art === 'bild' || art === 'schweb' || el.closest('footer') || getComputedStyle(el).opacity !== '0') bio.observe(el); else io.observe(el);
      }
    });
  }

  /* ---------- Laufband: läuft nur, solange es im Bild ist ---------- */
  var zuege = $$('[data-laufband]');
  if (zuege.length && !ruhig && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('laeuft', e.isIntersecting); }); }, { rootMargin: '80px 0px' });
    zuege.forEach(function (z) { lio.observe(z); });
  }

  /* ---------- Grosse Zahlen: hochzählen, sobald sie im Bild sind ---------- */
  var zahlen = $$('[data-zahl]');
  if (zahlen.length && !ruhig && 'IntersectionObserver' in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        zio.unobserve(e.target);
        var el = e.target, roh = el.getAttribute('data-zahl'), ziel = +roh, komma = (roh.split('.')[1] || '').length, nach = el.getAttribute('data-nach') || '';
        var gross = ziel > 5000, von = gross ? 0 : (ziel > 1000 ? ziel - 24 : 0), t0 = null, dauer = ziel > 1000 ? 2100 : 1500;
        var tsd = function (s) { return gross ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '’') : s; };
        if (ziel <= 3) return;
        function schritt(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / dauer), w = 1 - Math.pow(1 - p, 4);
          el.textContent = tsd((von + (ziel - von) * w).toFixed(komma)) + nach;
          if (p < 1) requestAnimationFrame(schritt);
        }
        el.textContent = tsd(von.toFixed(komma)) + nach;
        setTimeout(function () { requestAnimationFrame(schritt); }, 250);
      });
    }, { threshold: 0.3 });
    zahlen.forEach(function (z) { zio.observe(z); });
  }

  /* ---------- Leiste und Menü ---------- */
  var nav = $('.nav'), burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var an = doc.classList.toggle('offen');
      burger.setAttribute('aria-expanded', an);
      document.body.style.overflow = an ? 'hidden' : '';
    });
    $$('.menue a,.menue button').forEach(function (a) { a.addEventListener('click', function () { doc.classList.remove('offen'); document.body.style.overflow = ''; }); });
  }

  /* Startseite (Fassung 46): solange der Auftakt im Bild ist, steht oben nur das Zeichen, das Menü läuft unten im Auftakt; danach kommt die Insel */
  var auftakt = document.querySelector('.hero--boden');
  if (auftakt) {
    /* seit 15.10.2026 abends (Robert: «mit dem ersten Scroll kommen Sprache, Leiste und KI rein»): nicht mehr erst, wenn der Auftakt aus dem Bild ist */
    var oben = function () { doc.classList.toggle('kopf-oben', (window.scrollY || doc.scrollTop) < 8); };
    oben(); window.addEventListener('scroll', oben, { passive: true });
  }

  /* Hinweis für Gäste (Carlton Control): Leiste und Eck-Knöpfe rücken um die Höhe des Streifens nach unten */
  var band = $('.hinweisband');
  if (band && !band.hidden) { var bandMass = function () { doc.style.setProperty('--band', band.offsetHeight + 'px'); }; bandMass(); addEventListener('resize', bandMass); }

  /* ---------- Buchen: Fenster mit Datum und Gästen. Die Angaben gehen mit ins Buchungssystem des Hauses ---------- */
  var iso = function (t) { return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); };
  var dlg = $('dialog.buchen');
  if (dlg && dlg.showModal) {
    var f = $('form', dlg), an = f.elements.an, ab = f.elements.ab, heute = new Date();
    an.min = iso(heute); an.value = iso(heute); ab.min = iso(new Date(heute.getTime() + 864e5)); ab.value = iso(new Date(heute.getTime() + 2 * 864e5));
    an.addEventListener('change', function () { var t = new Date(an.value); if (isNaN(t)) return; var n = new Date(t.getTime() + 864e5); ab.min = iso(n); if (ab.value <= an.value) ab.value = iso(n); });
    /* Package-Modus (Robert 16.10.2026, wie beim Rivage): Name, Preis und Foto des Packages im Fenster; ohne Buchungsadresse wird daraus eine fertige Mail */
    var bTx = $('.buchen__t', dlg), bH = bTx && $('h2', bTx), bImg = $('.buchen__b img', dlg), bKn = $('button[type=submit]', f), pkAktiv = null;
    var bAlt = { h: bH ? bH.innerHTML : '', src: bImg ? bImg.getAttribute('src') : '', srcset: bImg ? bImg.getAttribute('srcset') : '', kn: bKn ? bKn.firstChild.nodeValue : '', lab: dlg.getAttribute('aria-label') };
    var pkEsc = function (t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var PKT = { de: ['Ihr Package', 'Package buchen', 'Package anfragen', 'Anfrage Package', 'Guten Tag\n\nGerne möchte ich das Package «{n}» anfragen.\n\nAnreise: {a}\nAbreise: {b}\nGäste: {g}\n\nFreundliche Grüsse'],
                en: ['Your package', 'Book package', 'Request package', 'Package request', 'Hello\n\nI would like to request the package «{n}».\n\nArrival: {a}\nDeparture: {b}\nGuests: {g}\n\nKind regards'],
                fr: ['Votre forfait', 'Réserver le forfait', 'Demander le forfait', 'Demande forfait', 'Bonjour\n\nJe souhaite demander le forfait «{n}».\n\nArrivée : {a}\nDépart : {b}\nPersonnes : {g}\n\nMeilleures salutations'] }[SP] || null;
    function paket(b) {
      var n = b.getAttribute('data-paket');
      pkAktiv = n ? { n: n, anfrage: b.hasAttribute('data-anfrage') } : null;
      dlg.classList.toggle('buchen--paket', !!pkAktiv);
      if (!bH || !bKn || !PKT) return;
      if (!pkAktiv) { if (bImg) { bImg.setAttribute('src', bAlt.src); if (bAlt.srcset) bImg.setAttribute('srcset', bAlt.srcset); } bKn.firstChild.nodeValue = bAlt.kn; dlg.setAttribute('aria-label', bAlt.lab); return; }
      var art = b.closest('article, .zwei > .t'), h3 = art && $('h3, h2', art), kb = art && $('.kerbe, .koord dd', art);   // Name und Preis so, wie sie auf der Seite stehen (auch übersetzt)
      if (h3 && h3.textContent.trim()) { n = ($$('.z', h3).length ? $$('.z', h3).map(function (z) { return z.textContent; }).join(' ') : h3.textContent).replace(/\s+/g, ' ').replace(/[\s.]+$/, '').replace(/- /g, '-').trim(); pkAktiv.n = n; }
      var pr = kb && kb.textContent.trim() ? kb.textContent.trim() : b.getAttribute('data-paket-preis'), im = b.getAttribute('data-paket-bild');
      var htm = '<span class="pk-art">' + PKT[0] + '</span>' + pkEsc(n) + (pr ? '<small class="pk-preis">' + pkEsc(pr) + '</small>' : '');
      requestAnimationFrame(function () { var h = $('.buchen__t h2', dlg); if (h && pkAktiv) h.innerHTML = htm; });   // nach dem Zurücksetzen des Zimmer-Finders
      /* Robert 17.10.2026 («Bilder schneller laden»): das Package-Foto lädt sofort und ohne den unscharfen Platzhalter des Zimmerfotos */
      if (bImg && im) {
        if (!/^(https?:|\.\.\/|\/)/.test(im)) im = WURZEL + im;
        /* dasselbe Foto steht meist schon geladen auf der Seite: dann dieses nehmen, das Fenster zeigt es sofort scharf */
        var name = (im.split('/').pop().split('?')[0].match(/^(.+?)-(?:s|l|m)(?:-\d+)?\.webp$/) || [])[1], schon = null;
        if (name) $$('img').some(function (x) { var u = x.currentSrc || ''; if (x !== bImg && x.complete && x.naturalWidth > 600 && u.indexOf('/' + name + '-') > -1) { schon = u; return true; } return false; });
        bImg.loading = 'eager'; bImg.style.background = '#0e2347'; bImg.removeAttribute('srcset'); bImg.setAttribute('src', schon || im);
      }
      bKn.firstChild.nodeValue = pkAktiv.anfrage ? PKT[2] : PKT[1]; dlg.setAttribute('aria-label', n);
    }
    /* Package-Fotos vorladen, sobald ihr Knopf in die Nähe kommt oder berührt wird: beim Öffnen des Fensters sind sie schon da (Robert 17.10.2026) */
    var pkVor = function (b) { var u = b.getAttribute('data-paket-bild'); if (!u || b.__v) return; b.__v = 1; if (!/^(https?:|\.\.\/|\/)/.test(u)) u = WURZEL + u; var v = new Image(); v.decoding = 'async'; v.fetchPriority = 'high'; v.src = u; if (v.decode) v.decode().catch(function () {}); };
    var pkKn = $$('[data-paket-bild]');
    if (pkKn.length) {
      pkKn.forEach(function (b) { b.addEventListener('pointerenter', function () { pkVor(b); }, { once: true }); b.addEventListener('touchstart', function () { pkVor(b); }, { once: true, passive: true }); b.addEventListener('focus', function () { pkVor(b); }, { once: true }); });
      if ('IntersectionObserver' in window) { var pkIo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { pkIo.unobserve(e.target); pkVor(e.target); } }); }, { rootMargin: '0px 0px 120% 0px' }); pkKn.forEach(function (b) { pkIo.observe(b); }); }
    }
    $$('[data-buchen]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        doc.classList.remove('offen'); document.body.style.overflow = '';
        f.dataset.ziel = b.getAttribute('data-buchen') || '';
        paket(b);
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    $('.zu', dlg).addEventListener('click', function () { dlg.close(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pkAktiv && pkAktiv.anfrage && PKT) {
        var ORT = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH' }[SP] || 'de-CH', tg = function (v) { var t = new Date(v + 'T12:00'); return isNaN(t) ? v : t.toLocaleDateString(ORT, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
        var o = f.elements.gaeste.options[f.elements.gaeste.selectedIndex], w = { n: pkAktiv.n, a: tg(an.value), b: tg(ab.value), g: o ? o.textContent : f.elements.gaeste.value };
        var fl = function (t) { return t.replace(/\{(\w)\}/g, function (m, k) { return w[k]; }); };
        if (ENTWURF) { entwurfHinweis(f); return; }
        location.href = 'mailto:info@carltoneurope.ch?subject=' + encodeURIComponent(PKT[3] + ' «' + pkAktiv.n + '»') + '&body=' + encodeURIComponent(fl(PKT[4]));
        dlg.close(); return;
      }
      var g = []; for (var i = 0; i < +f.elements.gaeste.value; i++) g.push('A');
      var basis = (f.dataset.ziel || doc.getAttribute('data-buchung') || 'https://www.simplebooking.it/ibe2/hotel/4401').split('?')[0];
      window.open(basis + '?lang=' + SP.toUpperCase() + '&cur=CHF&in=' + an.value + '&out=' + ab.value + '&guests=' + encodeURIComponent(g.join(',')), '_blank', 'noopener');
      dlg.close();
    });
  }
  /* Buchungsleiste auf der Seite: dieselbe Übergabe wie im Fenster */
  $$('form[data-leiste]').forEach(function (f) {
    var an = f.elements.an, ab = f.elements.ab, heute = new Date();
    an.min = iso(heute); an.value = iso(heute); ab.min = iso(new Date(heute.getTime() + 864e5)); ab.value = iso(new Date(heute.getTime() + 2 * 864e5));
    an.addEventListener('change', function () { var t = new Date(an.value); if (isNaN(t)) return; var n = new Date(t.getTime() + 864e5); ab.min = iso(n); if (ab.value <= an.value) ab.value = iso(n); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = []; for (var i = 0; i < +f.elements.gaeste.value; i++) g.push('A');
      window.open((doc.getAttribute('data-buchung') || 'https://www.simplebooking.it/ibe2/hotel/4401') + '?lang=' + SP.toUpperCase() + '&cur=CHF&in=' + an.value + '&out=' + ab.value + '&guests=' + encodeURIComponent(g.join(',')), '_blank', 'noopener');
    });
  });
  /* Ein Zimmer einzeln aufgemacht: Bühne mit Fotos, Daumenreihe, Pfeile und Pfeiltasten */
  $$('dialog.zb').forEach(function (d) {
    var bi = $$('.zb__bilder img', d), da = $$('.zb__daumen button', d), leg = $('[data-leg].kerbe', d), n = 0;
    var zeig = function (i) {
      n = (i + bi.length) % bi.length;
      bi.forEach(function (b, j) { b.classList.toggle('an', j === n); });
      da.forEach(function (b, j) { b.setAttribute('aria-pressed', j === n); });
      if (leg) leg.textContent = bi[n].getAttribute('data-leg') || '';
    };
    $$('[data-zb]', d).forEach(function (b) { b.addEventListener('click', function () { zeig(n + (+b.getAttribute('data-zb'))); }); });
    da.forEach(function (b, j) { b.addEventListener('click', function () { zeig(j); }); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    $('.zu', d).addEventListener('click', function () { d.close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') zeig(n + 1); else if (e.key === 'ArrowLeft') zeig(n - 1); });
    d.addEventListener('close', function () { document.body.style.overflow = ''; });
    zeig(0); d._zeig = zeig; d._bilder = bi;
  });
  $$('[data-zimmer]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var d = document.getElementById('zb-' + a.getAttribute('data-zimmer'));
      if (d && d.showModal) {
        e.preventDefault(); var k = a.getAttribute('data-foto');
        if (k && d._bilder) for (var i = 0; i < d._bilder.length; i++) if (d._bilder[i].getAttribute('src').indexOf('/' + k + '-') > -1) { d._zeig(i); break; }
        d.showModal(); document.body.style.overflow = 'hidden';
      }
    });
    if (a.getAttribute('role') === 'button') a.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.click(); } });
  });
  /* Anfragen (Bankett, Gutschein, Kontakt): öffnen das Mailprogramm mit den Angaben */
  /* Formulare: öffnen das Mailprogramm des Gastes. Hat das Haus in Carlton Control den Eingang eingeschaltet (data-formulare="eingang"),
     geht die Nachricht stattdessen an /control/api/formular und liegt im Eingang von Carlton Control; scheitert das, öffnet sich wieder die Mail. */
  var MAILAN = (function () { var a = $('.fuss__unten a[href^="mailto:"]'); return a ? a.getAttribute('href').slice(7) : 'info@carltoneurope.ch'; })();
  var DANKE = { de: 'Vielen Dank, Ihre Nachricht ist bei uns angekommen.', en: 'Thank you, your message has reached us.', fr: 'Merci, votre message nous est bien parvenu.' };
  $$('form[data-post]').forEach(function (fo) {
    fo.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = [], felder = {};
      $$('input,select,textarea', fo).forEach(function (x) { if (x.value && x.dataset.name) { z.push(x.dataset.name + ': ' + x.value); felder[x.dataset.name] = x.value; } });
      var mail = function () { if (ENTWURF) { entwurfHinweis(fo); return; } location.href = 'mailto:' + MAILAN + '?subject=' + encodeURIComponent(fo.dataset.post) + '&body=' + encodeURIComponent(z.join('\n')); };
      if (doc.getAttribute('data-formulare') !== 'eingang' || !window.fetch || !fo.dataset.formular) { mail(); return; }
      var fd = new FormData(); Object.keys(felder).forEach(function (k) { fd.append(k, felder[k]); }); fd.append('betreff', fo.dataset.post);
      var kn = $('button[type=submit]', fo); if (kn) kn.disabled = true;
      fetch(WURZEL + 'control/api/formular?f=' + encodeURIComponent(fo.dataset.formular) + '&seite=' + encodeURIComponent(location.pathname), { method: 'POST', body: fd })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () { fo.reset(); var d = doc.createElement('p'); d.className = 'lauf formular__danke'; d.setAttribute('role', 'status'); d.textContent = DANKE[SP] || DANKE.de; fo.appendChild(d); if (kn) kn.disabled = false; })
        .catch(function () { if (kn) kn.disabled = false; mail(); });
    });
  });

  /* ---------- Reiter: eine Bühne wechselt mit dem Reiter (Text über hidden, Bilder über Deckkraft) ---------- */
  /* «Wie viel Zeit haben Sie?»: die gewählte Karte wird gross und rutscht nach unten, die anderen werden klein.
     Den Übergang rechnet der Browser (View Transitions); ohne diese Technik wechselt die Ansicht ohne Fahrt. */
  $$('[data-zs]').forEach(function (zs) {
    var ks = $$('.zs__k', zs), text = $('.zs__text', zs), felder = $$('[data-feld]', text), zu = $('.zs__zu', zs), nav = $('.zs__nav', zs), offen = -1;
    ks.forEach(function (k, j) { if (k.getAttribute('aria-pressed') === 'true') offen = j; });   /* eine Karte steht schon im Markup offen */
    function setze(i) {
      offen = i; zs.classList.toggle('zs--offen', i >= 0);
      ks.forEach(function (k, j) {
        k.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      felder.forEach(function (f, j) { f.hidden = j !== i; });
      text.hidden = i < 0; if (zu) zu.hidden = i < 0;
    }
    /* wohin die Seite fahren muss, damit die offene Ansicht ganz im Fenster steht (null: sie steht schon richtig) */
    function sichtZiel() {
      var r = zs.getBoundingClientRect(), h = window.innerHeight;
      if (r.top >= 96 && r.bottom <= h - 12) return null;
      var y = Math.max(0, r.top + window.pageYOffset - (r.height > h - 130 ? 104 : (h - r.height) / 2));
      return Math.min(y, Math.max(0, document.documentElement.scrollHeight - h));
    }
    function inSicht() { var y = sichtZiel(); if (y !== null) window.scrollTo(0, y); }
    /* Wechsel ohne Wartezeit: Lage vorher messen, Anordnung sofort umstellen, Lage nachher messen und jede Karte samt Bild
       über transform von der alten zur neuen Lage fahren lassen. Nichts wird eingefroren, der Klick wirkt sofort.
       Das Bild bleibt dabei unverzerrt: Rahmen, Bildfeld und Foto bekommen je ihre eigene, aufeinander abgestimmte Fahrt. */
    var DAUER = 880, SCHRITTE = 44, lauf = [], geist = null;
    /* der Name jeder Karte bekommt eine eigene Hülle: so kann die Schrift während der Fahrt unverzerrt von der alten zur neuen Grösse wachsen */
    ks.forEach(function (k) { var nm = $('.zs__n', k); if (!nm || $('.zs__nt', nm)) return; var sp = document.createElement('span'); sp.className = 'zs__nt'; while (nm.firstChild) sp.appendChild(nm.firstChild); nm.appendChild(sp); });
    var schrift = function (k) { return parseFloat(getComputedStyle($('.zs__n', k)).fontSize) || 16; };
    var lage = function (e) { var r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    var misch = function (a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t }; };
    var fuell = function (b, a) { var w = Math.max(b.w, b.h * a), h = w / a; return { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w: w, h: h }; };
    /* weiche Fahrt: läuft sanft an und kommt lang und ruhig an (Kurve wie cubic-bezier(.36,0,.1,1)); vorher sprang die Karte
       in den ersten 100 ms schon die halbe Strecke */
    var kurve = function (x1, y1, x2, y2) { return function (t) { var a = 0, b = 1, s = t, i, x; for (i = 0; i < 24; i++) { s = (a + b) / 2; x = 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s; if (x < t) a = s; else b = s; } return 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s; }; };
    var weich = kurve(0.36, 0, 0.1, 1);
    /* transform, das ein Stück (Endlage L) an die Lage R bringt, wenn sein Träger (Endlage PL) gerade bei PR steht */
    var bezug = function (R, L, PR, PL) {
      var sx = PR.w / PL.w, sy = PR.h / PL.h;
      return 'translate(' + ((R.x - (PR.x + (L.x - PL.x) * sx)) / sx).toFixed(2) + 'px,' + ((R.y - (PR.y + (L.y - PL.y) * sy)) / sy).toFixed(2) + 'px) scale(' + (R.w / (L.w * sx)).toFixed(5) + ',' + (R.h / (L.h * sy)).toFixed(5) + ')';
    };
    /* Abschnitt, in dem die Karten stehen: er wird beim Öffnen höher. Damit nichts springt, gleitet alles darunter im Takt der Karten
       an seinen neuen Platz (nur transform), und die Seite fährt im selben Takt mit, egal auf welcher Scrollhöhe geklickt wird. */
    var sec = zs.closest('section') || zs.parentElement, rollt = 0, flick = null;
    var gleite = function (von, weg, uhr) {
      var nr = ++rollt, t0 = performance.now(), halt = function () { if (nr === rollt) rollt++; };
      ['wheel', 'touchstart', 'keydown'].forEach(function (n) { window.addEventListener(n, halt, { passive: true, once: true }); });
      (function f() {
        if (nr !== rollt) return;
        var z = uhr ? uhr.currentTime : performance.now() - t0;
        if (z === null || z === undefined) { window.scrollTo(0, von + weg); return; }
        var p = Math.max(0, Math.min(1, z / DAUER));
        window.scrollTo(0, von + weg * weich(p));
        if (p < 1) requestAnimationFrame(f);
      })();
    };
    var raeume = function () { if (flick) { flick.remove(); flick = null; } lauf.forEach(function (a) { try { a.cancel(); } catch (e) {} }); lauf = []; ks.forEach(function (k) { var b = $('.zs__b', k), im = $('img', k); k.style.transformOrigin = b.style.transformOrigin = $('.zs__n', k).style.transformOrigin = ''; if (im) im.style.cssText = im.dataset.st || ''; }); };
    function wechsle(i) {
      if (i === offen) { if (i < 0) return; i = -1; }
      zs.classList.add('zs--bereit'); ks.forEach(function (k) { k.classList.add('da'); });
      if (ruhig || !zs.animate) { setze(i); if (i >= 0) inSicht(); return; }
      rollt++; raeume();
      var h0 = sec.getBoundingClientRect().height, war = offen;
      var vor = ks.map(function (k) { return { k: lage(k), b: lage($('.zs__b', k)), n: lage($('.zs__n', k)), f: schrift(k) }; });
      /* der bisherige Text bleibt als Abzug stehen und blendet weich aus, statt mit dem Klick zu verschwinden */
      if (geist) { geist.remove(); geist = null; }
      if (!text.hidden) {
        var tr = text.getBoundingClientRect(), zr = zs.getBoundingClientRect(), g = text.cloneNode(true);
        g.setAttribute('aria-hidden', 'true'); g.classList.add('zs__geist');
        g.style.cssText = 'display:' + (getComputedStyle(text).display === 'flex' ? 'flex' : 'block') + ';position:absolute;grid-column:auto;grid-row:auto;box-sizing:border-box;margin:0;pointer-events:none;z-index:2;left:' + (tr.left - zr.left).toFixed(1) + 'px;top:' + (tr.top - zr.top).toFixed(1) + 'px;width:' + tr.width.toFixed(1) + 'px;height:' + tr.height.toFixed(1) + 'px';
        zs.appendChild(g); geist = g;
        g.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { g.remove(); if (geist === g) geist = null; };
      }
      /* Ziellage ohne Anheben unter der Maus messen und das Anheben während der Fahrt abstellen: sonst endet die Fahrt
         ein paar Pixel neben der wahren Lage und die Karte rastet danach sichtbar ein */
      zs.classList.add('zs--faehrt'); setze(i);
      var nach = ks.map(function (k) { return { k: lage(k), b: lage($('.zs__b', k)), n: lage($('.zs__n', k)), f: schrift(k) }; }), zeit = { duration: DAUER, easing: 'linear' };
      ks.forEach(function (k, j) {
        var b = $('.zs__b', k), im = $('img', k), F = vor[j], L = nach[j], a = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1.5;
        if (Math.abs(F.k.x - L.k.x) < 1 && Math.abs(F.k.y - L.k.y) < 1 && Math.abs(F.k.w - L.k.w) < 1 && Math.abs(F.k.h - L.k.h) < 1) return;
        /* das Foto für die Fahrt als ganzes Bild ins Feld legen (sieht in Ruhe gleich aus wie vorher), damit es beim Wachsen nichts nachschneiden muss */
        var CL = fuell(L.b, a);
        if (im) { if (im.dataset.st === undefined) im.dataset.st = im.style.cssText; im.style.cssText += ';inset:auto;left:' + (CL.x - L.b.x).toFixed(2) + 'px;top:' + (CL.y - L.b.y).toFixed(2) + 'px;width:' + CL.w.toFixed(2) + 'px;height:' + CL.h.toFixed(2) + 'px;max-width:none;object-fit:fill;transform-origin:0 0;transition:none'; }
        var nm = $('.zs__n', k), gleich = Math.abs(F.k.w - L.k.w) < 1 && Math.abs(F.k.h - L.k.h) < 1;
        k.style.transformOrigin = b.style.transformOrigin = nm.style.transformOrigin = '0 0';
        var fk = [], fb = [], fi = [], fn = [], ft = [], nt = $('.zs__nt', nm), u0 = F.f / L.f;
        for (var n = 0; n <= SCHRITTE; n++) {
          var t = weich(n / SCHRITTE), Rk = misch(F.k, L.k, t), Rb = misch(F.b, L.b, t);
          fk.push({ transform: 'translate(' + (Rk.x - L.k.x).toFixed(2) + 'px,' + (Rk.y - L.k.y).toFixed(2) + 'px) scale(' + (Rk.w / L.k.w).toFixed(5) + ',' + (Rk.h / L.k.h).toFixed(5) + ')' });
          fb.push({ transform: bezug(Rb, L.b, Rk, L.k) });
          fi.push({ transform: bezug(fuell(Rb, a), CL, Rb, L.b) });
          var Rn = misch(F.n, L.n, t), u = u0 + (1 - u0) * t;
          fn.push({ transform: bezug(Rn, L.n, Rk, L.k) });
          ft.push({ transform: 'scale(' + (u * L.n.w / Rn.w).toFixed(5) + ',' + (u * L.n.h / Rn.h).toFixed(5) + ')' });
        }
        lauf.push(k.animate(fk, zeit), b.animate(fb, zeit)); if (im) lauf.push(im.animate(fi, zeit));
        /* das Namensfeld fährt als Feld mit, die Schrift darin bleibt unverzerrt und wächst gleichmässig von der alten zur neuen Grösse (nichts blendet aus) */
        if (!gleich) { lauf.push(nm.animate(fn, zeit)); if (nt) lauf.push(nt.animate(ft, zeit)); }
        k.style.zIndex = j === i ? 3 : 1;
      });
      if (i >= 0) {
        lauf.push(text.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 300, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
        if (zu) lauf.push(zu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 520, fill: 'backwards' }));
        if (nav && war < 0) lauf.push(nav.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, delay: 520, fill: 'backwards' }));
      }
      var meins = lauf, ende = function () {
        if (lauf !== meins) return; raeume(); zs.classList.remove('zs--faehrt');
        /* die Bilder liegen von Anfang an in der grossen Datei vor (sizes im Markup): nach der Fahrt wird nichts getauscht, also rastet nichts ein */
        ks.forEach(function (k) { k.style.zIndex = ''; });
      };
      /* Höhe des Abschnitts vorher und nachher: alles darunter gleitet um diesen Unterschied nach (beim Öffnen von oben her, beim Schliessen von unten her) */
      var dh = sec.getBoundingClientRect().height - h0, y0 = window.pageYOffset, ziel = i >= 0 ? sichtZiel() : null, ds = ziel === null ? 0 : ziel - y0, uhr = lauf[0] || null;
      if (Math.abs(dh) > 1) {
        var H = window.innerHeight, e = sec, n, nb = [];
        while (e && e !== document.body) { n = e; while ((n = n.nextElementSibling)) nb.push(n); e = e.parentElement; }
        nb.forEach(function (n) {
          var c = getComputedStyle(n); if (c.display === 'none' || c.position === 'fixed' || /^(DIALOG|SCRIPT|STYLE)$/.test(n.tagName)) return;
          var o = n.getBoundingClientRect().top; if (Math.min(o - dh, o - ds) > H + 140) return;      /* bleibt die ganze Fahrt unter dem Fensterrand */
          var m = c.transform && c.transform !== 'none' ? ' ' + c.transform : '';
          lauf.push(n.animate([{ transform: 'translateY(' + (-dh).toFixed(1) + 'px)' + m }, { transform: m ? m.slice(1) : 'none' }], { duration: DAUER, easing: 'cubic-bezier(.36,0,.1,1)' }));
        });
        if (dh < 0) {
          /* beim Schliessen: der Grund des Abschnitts bleibt unter dem nachgleitenden Teil stehen, Muster im selben Lauf */
          var cs = getComputedStyle(sec), f = document.createElement('div'); f.setAttribute('aria-hidden', 'true');
          f.style.cssText = 'position:absolute;left:0;right:0;top:100%;pointer-events:none;height:' + (-dh).toFixed(1) + 'px';
          f.style.backgroundColor = cs.backgroundColor; f.style.backgroundImage = cs.backgroundImage; f.style.backgroundSize = cs.backgroundSize; f.style.backgroundRepeat = cs.backgroundRepeat;
          f.style.backgroundPosition = cs.backgroundPositionX + ' ' + (-(h0 + dh)).toFixed(1) + 'px';
          sec.appendChild(f); flick = f;
        }
      }
      if (!uhr) { uhr = zs.animate([], { duration: DAUER }); lauf.push(uhr); }
      setTimeout(ende, DAUER + 60);
      if (Math.abs(ds) > 1) gleite(y0, ds, uhr);
    }
    ks.forEach(function (k, i) { k.addEventListener('click', function () { if (i !== offen) wechsle(i); }); });
    if (zu) zu.addEventListener('click', function () { wechsle(-1); });
    /* Pfeile oben rechts: blättern zur vorigen oder nächsten Karte, am Ende geht es von vorn weiter */
    $$('[data-zs-nav]', zs).forEach(function (b) { b.addEventListener('click', function () { var n = ks.length; if (offen < 0 || n < 2) return; wechsle((offen + (+b.getAttribute('data-zs-nav')) + n) % n); }); });
    zs.addEventListener('pointerenter', function () { zs.classList.add('zs--bereit'); }, { once: true });
  });
  /* Lupe: Bilder ohne eigenes Ziel lassen sich anklicken, wachsen an ihrem Platz zur grossen Ansicht und lassen sich durchblättern */
  /* die grossen Bilder hinter einer Tafel (.ort__b) sind nur Bild: kein Rahmen unter der Maus, kein Vergrössern */
  var lupen = [];   /* Robert 10.10.2026: Bilder heben sich nicht mehr, kein Rahmen beim Überfahren, kein Vergrössern (überall) */
  if (lupen.length) {
    var lu = document.createElement('div'); lu.className = 'lupe'; lu.hidden = true; lu.setAttribute('role', 'dialog'); lu.setAttribute('aria-modal', 'true'); lu.setAttribute('aria-label', W.lupe);
    var pf = function (d) { return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="' + (d < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5') + '"/></svg>'; };
    lu.innerHTML = '<button class="lupe__zu" type="button" aria-label="' + W.zu + '"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg></button><button class="lupe__pf lupe__pf--l" type="button" aria-label="' + W.vor + '">' + pf(-1) + '</button><figure><img alt=""><figcaption></figcaption></figure><button class="lupe__pf lupe__pf--r" type="button" aria-label="' + W.nach + '">' + pf(1) + '</button>';
    document.body.appendChild(lu);
    var lim = $('img', lu), lcap = $('figcaption', lu), lsatz = [], lpos = 0, lvon = null, lvt = !ruhig && !!document.startViewTransition;
    var gross = function (f) { var im = $('img', f); return (im.getAttribute('src') || '').replace(/-s\.webp/, '-l.webp'); };
    var fuelle = function (i) { lpos = (i + lsatz.length) % lsatz.length; var f = lsatz[lpos], im = $('img', f), c = $('figcaption', f); lim.src = gross(f); lim.alt = im.alt; lcap.textContent = c ? c.textContent : im.alt; lu.classList.toggle('lupe--eins', lsatz.length < 2); };
    var auf = function (f) {
      lsatz = $$('.frei,[data-lupe]', f.closest('[data-gruppe]') || f.parentNode).filter(function (x) { return lupen.indexOf(x) > -1; }); if (lsatz.indexOf(f) < 0) lsatz = [f]; lvon = f; var i = lsatz.indexOf(f), k = $('.rahmen__k', f), pre = new Image();
      var tu = function () { k.style.viewTransitionName = ''; fuelle(i); lu.hidden = false; lim.style.viewTransitionName = 'lupe'; document.body.style.overflow = 'hidden'; $('.lupe__zu', lu).focus(); };
      var los = function () { if (lvt) { k.style.viewTransitionName = 'lupe'; document.startViewTransition(tu).finished.then(function () { lim.style.viewTransitionName = ''; }, function () { lim.style.viewTransitionName = ''; }); } else tu(); };
      pre.src = gross(f); (pre.decode ? pre.decode() : Promise.resolve()).then(los, los);
    };
    var zu = function () {
      if (lu.hidden) return; var f = lsatz[lpos], k = $('.rahmen__k', f);
      var tu = function () { lim.style.viewTransitionName = ''; lu.hidden = true; k.style.viewTransitionName = 'lupe'; document.body.style.overflow = ''; };
      if (lvt) { lim.style.viewTransitionName = 'lupe'; document.startViewTransition(tu).finished.then(function () { k.style.viewTransitionName = ''; }, function () { k.style.viewTransitionName = ''; }); } else tu();
      if (lvon) lvon.focus({ preventScroll: true });
    };
    lupen.forEach(function (f) {
      f.classList.add('frei--lupe'); f.setAttribute('role', 'button'); f.setAttribute('tabindex', '0');
      f.addEventListener('click', function () { auf(f); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); auf(f); } });
    });
    $('.lupe__zu', lu).addEventListener('click', zu);
    $('.lupe__pf--l', lu).addEventListener('click', function (e) { e.stopPropagation(); fuelle(lpos - 1); });
    $('.lupe__pf--r', lu).addEventListener('click', function (e) { e.stopPropagation(); fuelle(lpos + 1); });
    lu.addEventListener('click', function (e) { if (e.target === lu || e.target.tagName === 'FIGURE') zu(); });
    document.addEventListener('keydown', function (e) { if (lu.hidden) return; if (e.key === 'Escape') zu(); else if (e.key === 'ArrowRight') fuelle(lpos + 1); else if (e.key === 'ArrowLeft') fuelle(lpos - 1); });
  }
  /* Grundriss: beim Überfahren (oder Antippen) eines Raums zeigt die Karte unten rechts, welcher Raum es ist */
  $$('[data-plan]').forEach(function (pl) {
    var info = $('.gplan__info', pl), zs = $$('[data-z]', pl), ruhe = info.innerHTML, akt = null;
    zs.forEach(function (z) { var b = z.getAttribute('data-b'); if (b) { z._bild = new Image(); z._vor = function () { if (!z._bild.src) z._bild.src = WURZEL + 'assets/img/' + b + '-s.webp'; }; } });
    pl.addEventListener('pointerenter', function () { zs.forEach(function (z) { if (z._vor) z._vor(); }); }, { once: true });
    var zeig = function (z) {
      if (z === akt) return; akt = z; zs.forEach(function (x) { x.classList.toggle('an', x === z); });
      if (!z) { info.innerHTML = ruhe; info.classList.remove('voll', 'geht'); return; }
      var b = z.getAttribute('data-b'), a = z.getAttribute('data-a'), c = z.getAttribute('data-c'); if (z._vor) z._vor();
      info.innerHTML = (b ? '<span class="gplan__ib"><img src="' + WURZEL + 'assets/img/' + b + '-s.webp" alt=""></span>' : '') + '<b></b>' + (a ? '<span></span>' : '') + (c ? '<small></small>' : '');
      $('b', info).textContent = z.getAttribute('data-n'); if (a) $('span:not(.gplan__ib)', info).textContent = a; if (c) $('small', info).textContent = c; info.classList.add('voll');
      info.classList.toggle('geht', !!z.getAttribute('data-ziel')); if (z.getAttribute('data-ziel')) info.insertAdjacentHTML('beforeend', '<em class="gplan__hin">' + W.zumRaum + '<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></i></em>');
    };
    /* Robert 16.10.2026: Klick auf den Raum oder die Karte führt zum Raum; am Finger zeigt das erste Tippen, das zweite führt hin */
    var hin = function (z) {
      var d = z && z.getAttribute('data-ziel'); if (!d) return;
      if (d !== '#saele') { location.href = WURZEL + d; return; }
      var n = z.getAttribute('data-n'), t = $$('#saele .sth').filter(function (x) { var k = $('.sth__n', x); return k && k.textContent.trim() === n; })[0];
      if (t) t.click(); var s = document.getElementById('saele'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    zs.forEach(function (z) {
      z.addEventListener('pointerenter', function () { zeig(z); }); z.addEventListener('focus', function () { zeig(z); });
      z.addEventListener('click', function (e) { var schon = akt === z; zeig(z); if (schon || e.pointerType === 'mouse' || !e.pointerType) hin(z); });
      z.addEventListener('keydown', function (e) { if (e.key === 'Enter') hin(z); });
    });
    info.addEventListener('click', function () { if (akt) hin(akt); });
    pl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') zeig(null); });
  });
  /* Säle: der Regler stellt die Gästezahl, zu kleine Säle treten zurück, die Bühne zeigt den Saal, der am genauesten passt */
  $$('[data-saalwahl]').forEach(function (w) {
    var r = $('input[type=range]', w), zahl = $('[data-personen]', w), tr = $('[data-treffer]', w), ps = $$('[data-saal]', w), bs = $$('.sbuehne__bild', w), ts = $$('.sth', w), akt = -1;
    ps.forEach(function (p, j) { if (!p.hidden) akt = j; });
    function zeige(i) {
      if (i === akt) return; akt = i;
      ps.forEach(function (p, j) { p.hidden = j !== i; }); ts.forEach(function (t, j) { t.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      /* Robert 17.10.2026 («wartet in der kachel das bild schon / wird somit doppelt angezeigt»): fliegt das Foto aus der Reihe ein (seitenbau.js setzt w._flug),
         bleibt das alte bis zur Landung stehen und das neue steht erst mit der Landung, als Schnitt ohne Überblenden. */
      var setz = function () { bs.forEach(function (b, j) { b.classList.toggle('an', j === i); }); };
      var im = $('img', bs[i]), an = function () {
        if (akt !== i) return;
        if (!w._flug) { setz(); return; }
        w._flug.then(function () { if (akt !== i) return; w.classList.add('sb-schnitt'); setz(); requestAnimationFrame(function () { requestAnimationFrame(function () { w.classList.remove('sb-schnitt'); }); }); });
      };
      if (im && im.decode) { im.loading = 'eager'; im.decode().then(an, an); } else an();
    }
    function rechne(waehle) {
      var n = +r.value, best = -1, anz = 0; zahl.textContent = n; r.style.setProperty('--p', ((n - r.min) / (r.max - r.min) * 100) + '%');
      ps.forEach(function (p, j) { var m = +p.getAttribute('data-max'), ok = m >= n; ts[j].classList.toggle('matt', !ok); if (ok) { anz++; if (best < 0 || m < +ps[best].getAttribute('data-max')) best = j; } });
      tr.innerHTML = (anz === 1 ? W.saal1 : anz + W.saalN) + '<b>' + ps[best].getAttribute('data-name') + '.</b>';
      if (waehle) zeige(best);
    }
    r.addEventListener('input', function () { rechne(true); });
    ts.forEach(function (t, j) { t.addEventListener('click', function () { zeige(j); }); });
    rechne(false);
  });
  $$('[data-reiter]').forEach(function (leiste) {
    var tabs = $$('.tab', leiste), ziel = document.getElementById(leiste.getAttribute('data-reiter'));
    var felder = ziel ? $$('[data-feld]', ziel) : [], bilder = ziel ? $$('[data-bilder] img', ziel) : [];
    var zeig = function (i) {
      tabs.forEach(function (o, j) { o.setAttribute('aria-pressed', j === i); });
      felder.forEach(function (x, j) { x.hidden = j !== i; });
      bilder.forEach(function (x, j) { x.classList.toggle('an', j === i); });
    };
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { zeig(i); }); });
    zeig(0);
  });

  /* ---------- Grosse Liste mit Bildstapel ---------- */
  $$('.wahl').forEach(function (wl) {
    var li = $$('.wahl__l li', wl), bi = $$('.wahl__b img', wl), fein = matchMedia('(hover:hover) and (pointer:fine)').matches;
    var zeig = function (i) { li.forEach(function (x, j) { x.classList.toggle('an', j === i); }); bi.forEach(function (x, j) { x.classList.toggle('an', j === i); }); };
    li.forEach(function (x, i) {
      if (fein) x.addEventListener('mouseenter', function () { zeig(i); });
      var k = $('a,button', x); if (k) k.addEventListener('focus', function () { zeig(i); });
      if (k && k.tagName === 'BUTTON') k.addEventListener('click', function () { zeig(i); });
    });
    zeig(0);
  });

  /* ---------- Auswahl nach Wünschen: was nicht passt, tritt zurück ---------- */
  $$('[data-finder]').forEach(function (fd) {
    var opts = $$('.opt', fd), ziele = $$('[data-merk]', fd), satz = $('[data-treffer]', fd), neuB = $('[data-reset]', fd);
    var zeig = function () {
      var w = opts.filter(function (o) { return o.getAttribute('aria-pressed') === 'true'; }).map(function (o) { return o.dataset.wert; }), pass = [];
      ziele.forEach(function (z) { var m = z.dataset.merk.split(' '), ok = w.every(function (x) { return m.indexOf(x) > -1; }); z.classList.toggle('matt', !ok); if (ok) pass.push(z); });
      satz.innerHTML = !w.length ? (satz.dataset.leer || '') : pass.length ? (pass.length === 1 ? W.bleibt1 : W.bleibtN) + ' <i>' + pass.length + W.von + ziele.length + '</i>' + (SP === 'fr' ? '\u00a0: ' : ': ') + pass.map(function (z) { return z.dataset.name; }).join(', ') + '.' : W.keine;
      if (neuB) neuB.style.visibility = w.length ? 'visible' : 'hidden';
    };
    opts.forEach(function (o) { o.addEventListener('click', function () { o.setAttribute('aria-pressed', o.getAttribute('aria-pressed') !== 'true'); zeig(); }); });
    if (neuB) neuB.addEventListener('click', function () { opts.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); }); zeig(); });
    zeig();
  });
  var h1f = $('.hero--f .d1'); if (h1f) setTimeout(function () { h1f.classList.add('ruhe'); }, doc.classList.contains('kein-vorhang') ? 2200 : 4200);
  /* ---------- Regler ---------- */
  $$('[data-stufen]').forEach(function (st) {
    var reg = $('.regler,.wahlfeld', st), bi = $$('.stufe__b img', st), daten = JSON.parse($('script[type="application/json"]', st).textContent);
    var nr = $('.stufe__nr', st), name = $('h3', st), text = $('.lauf', st), mit = $('.stufe__mit', st), kn = $('[data-stufe-kn]', st);
    var zeig = function (i) {
      var x = daten[i], bn = x.b !== undefined ? x.b : i; bi.forEach(function (b, j) { b.classList.toggle('an', j === bn); });
      nr.classList.toggle('stufe__nr--ohne', !x.gross); if (!x.gross && name && nr.previousElementSibling !== name) name.after(nr); nr.innerHTML = (x.gross || '') + (x.klein ? '<small>' + x.klein + '</small>' : '');
      if (name) name.textContent = x.name; if (text) text.textContent = x.text; if (mit) mit.textContent = x.mit || '';
      if (kn && x.ziel !== undefined) kn.setAttribute('data-buchen', x.ziel);
      reg.setAttribute('aria-valuetext', x.name);
    };
    reg.addEventListener('input', function () { zeig(+reg.value); }); zeig(+reg.value);
    /* Jahresband: zwölf Säulen (Höhe = Preis) und ein Regler darunter, beide stellen den Monat */
    var mt = $$('.jahr__m', st), rg = $('.jahr__regler', st);
    var monat = function (j) { reg.value = j; if (rg) { rg.value = j; rg.style.setProperty('--p', (j / (mt.length - 1) * 100) + '%'); } mt.forEach(function (x, k) { x.setAttribute('aria-pressed', k === j ? 'true' : 'false'); }); zeig(j); };
    mt.forEach(function (b, j) { b.addEventListener('click', function () { monat(j); }); });
    if (rg) { rg.addEventListener('input', function () { monat(+rg.value); }); monat(+reg.value); }
    else if (mt.length) monat(+reg.value);
  });
  /* Säle nach Personenzahl: was zu klein ist, tritt zurück; das Band rückt zum ersten passenden Saal */
  $$('[data-saele]').forEach(function (s) {
    var reg = $('.regler,.wahlfeld', s), zahl = $('[data-personen]', s), satz = $('[data-treffer]', s), karten = $$('[data-max]', s), band = $('.band', s);
    var zeig = function () {
      var n = +reg.value, k = 0, kl = null; zahl.textContent = n;
      karten.forEach(function (x) { var max = +x.dataset.max, ok = max >= n; x.style.opacity = ok ? '' : '.28'; if (ok) { k++; if (!kl || max < +kl.dataset.max) kl = x; } });
      satz.textContent = k === 1 ? W.saalE + $('h3', kl).textContent + '.' : k + W.saalN + $('h3', kl).textContent + '.';
    };
    reg.addEventListener('input', zeig); zeig();
  });

  /* ---------- Band: blättern mit Pfeilen, Laufbalken, Ziehen mit der Maus (das Blättern selbst bleibt nativ) ---------- */
  function richte(g) {
    var band = $('.band', g), balken = $('.laufbalken', g), pf = $$('.pfeile button', g); if (!band) return;
    var weg = band.scrollWidth - band.clientWidth, teil = band.scrollWidth ? Math.min(1, band.clientWidth / band.scrollWidth) : 1, p = weg > 0 ? band.scrollLeft / weg : 0;
    if (balken) { var strich = $('i', balken); strich.style.width = (teil * 100).toFixed(1) + '%'; balken.style.visibility = weg > 4 ? 'visible' : 'hidden'; strich.style.transform = 'translateX(' + (p * (balken.clientWidth * (1 - teil))).toFixed(1) + 'px)'; }
    if (pf.length) { pf[0].disabled = band.scrollLeft < 4; pf[1].disabled = band.scrollLeft > weg - 4; }
  }
  var gaenge = $$('.gang');
  gaenge.forEach(function (g) {
    var band = $('.band', g), frei = true; if (!band) return;
    band.addEventListener('scroll', function () { if (!frei) return; frei = false; requestAnimationFrame(function () { frei = true; richte(g); }); }, { passive: true });
    $$('.pfeile button', g).forEach(function (b) {
      b.addEventListener('click', function () { var k = band.firstElementChild; if (!k) return; band.scrollBy({ left: (+b.getAttribute('data-richtung')) * (k.offsetWidth + 20), behavior: ruhig ? 'auto' : 'smooth' }); });
    });
    richte(g);
  });
  if (gaenge.length) { var ra = function () { gaenge.forEach(richte); }; window.addEventListener('resize', ra); window.addEventListener('load', ra); }
  $$('.band').forEach(function (b) {
    var unten = false, x0 = 0, s0 = 0, weit = false;
    b.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; unten = true; weit = false; x0 = e.clientX; s0 = b.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!unten) return; var d = e.clientX - x0; if (Math.abs(d) > 4) { weit = true; b.classList.add('zieht'); } b.scrollLeft = s0 - d; });
    window.addEventListener('pointerup', function () { unten = false; b.classList.remove('zieht'); });
    b.addEventListener('click', function (e) { if (weit) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- Rechtsseiten: im Inhaltsfeld den Abschnitt markieren, der gerade gelesen wird ---------- */
  (function () {
    var feld = $('.recht__inhalt'); if (!feld || !('IntersectionObserver' in window)) return;
    var punkte = {}, jetzt = null;
    $$('a', feld).forEach(function (l) { punkte[l.getAttribute('href').slice(1)] = l; });
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting || !punkte[e.target.id]) return; if (jetzt) jetzt.classList.remove('an'); jetzt = punkte[e.target.id]; jetzt.classList.add('an'); });
    }, { rootMargin: '-10% 0px -72% 0px' });
    Object.keys(punkte).forEach(function (id) { var h = document.getElementById(id); if (h) rio.observe(h); });
  })();

  /* ---------- Scroll-Takt: Leiste, Auftaktbild, Dreiklang, Bühne ---------- */
  var heroBild = $('.hero__bild'), hero = $('.hero');
  var strecke = $('.buehne__strecke'), haeuser = $$('.buehne .haus'), bilder = $$('.buehne__bilder .polas');
  var abzuege = bilder.map(function (b) { return $$('.pola', b); }), liegt = bilder.map(function () { return 0; });
  var etagen = $$('.lift li'), kabine = $('.lift .kabine');
  var breit = matchMedia('(min-width: 861px)');
  var schweb = $$('.schweb'), drei = $('.drei');
  var paare = $$('.paar .klein > .rahmen'), pZiel = [], pIst = [], pLaeuft = false;
  function paarlauf() { var weiter = false; for (var i = 0; i < paare.length; i++) { if (pZiel[i] === undefined) continue; pIst[i] = (pIst[i] || 0) + (pZiel[i] - (pIst[i] || 0)) * 0.12; if (Math.abs(pZiel[i] - pIst[i]) > 0.2) weiter = true; else pIst[i] = pZiel[i]; paare[i].style.transform = 'translate3d(0,' + pIst[i].toFixed(1) + 'px,0)'; } if (weiter) requestAnimationFrame(paarlauf); else pLaeuft = false; }
  var sZiel = 0, sIst = 0, sLaeuft = false;
  function schwebe() {
    sIst += (sZiel - sIst) * 0.12;
    if (Math.abs(sZiel - sIst) < 0.15) { sIst = sZiel; sLaeuft = false; }
    for (var i = 0; i < schweb.length; i++) schweb[i].style.transform = 'translate3d(0,' + (sIst * (+schweb[i].getAttribute('data-tempo'))).toFixed(1) + 'px,0)';
    if (sLaeuft) requestAnimationFrame(schwebe);
  }
  var yAlt = window.scrollY, daRicht = 0, daAnker = yAlt, ziel = 0, ist = 0, laeuft = false, aktiv = -1;
  function setze(n) {
    if (n === aktiv) return; aktiv = n;
    haeuser.forEach(function (h, i) { h.classList.toggle('an', i === n); });
    bilder.forEach(function (b, i) { b.classList.toggle('an', i === n); });
    etagen.forEach(function (t, i) { t.classList.toggle('an', i === n); });
    /* die Kabine fährt nach oben: Keller steht unten in der Anzeige */
    if (kabine && etagen.length) kabine.style.transform = 'translateY(' + ((etagen.length - 1 - n) * 40) + 'px)';
  }
  if (haeuser.length) setze(0);
  function lege(n, wieviel) {
    for (var i = 0; i < bilder.length; i++) {
      var soll = i === n ? wieviel : 0;
      if (soll === liegt[i]) continue;
      var neu = 0;
      for (var k = 0; k < abzuege[i].length; k++) {
        var an2 = k < soll, war = k < liegt[i];
        if (an2 && !war) { abzuege[i][k].style.transitionDelay = (i === n ? 0.1 + neu * 0.14 + (k === 4 ? 0.12 : 0) : 0) + 's'; neu++; }
        else if (i === n) abzuege[i][k].style.transitionDelay = '0s';
        else abzuege[i][k].style.transitionDelay = '';
        abzuege[i][k].classList.toggle('da', an2);
      }
      liegt[i] = soll;
    }
  }
  if (bilder.length) {
    if (ruhig || !('IntersectionObserver' in window)) lege(0, 5);
    else {
      var erst = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { erst.disconnect(); if (aktiv === 0) lege(0, 5); } }, { threshold: 0.25 }); erst.observe($('.buehne__bilder'));
      /* Fotos der Abzüge vorab entpacken, damit das Hochfliegen nur noch Bewegung ist */
      var vor = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; vor.disconnect(); $$('.buehne__bilder img').forEach(function (b) { b.loading = 'eager'; if (b.decode) b.decode().catch(function () {}); }); }, { rootMargin: '120% 0px' });
      vor.observe(strecke);
    }
  }
  /* Handy: der Stapel je Etage fliegt ein, sobald er im Bild ist */
  var mpolas = $$('.polas--m');
  if (mpolas.length) {
    if (ruhig || !('IntersectionObserver' in window)) mpolas.forEach(function (m) { m.classList.add('an'); });
    else { var mio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('an'); mio.unobserve(e.target); } }); }, { threshold: 0.35 }); mpolas.forEach(function (m) { mio.observe(m); }); }
  }
  /* Gleiten: das Bild wandert beim Scrollen sacht in seinem Rahmen und kommt in der Bildschirmmitte am nächsten.
     Gerechnet wird nur, was im Fenster steht; die Bewegung läuft dem Scrollen weich nach (0,1 je Bild). */
  var gl = [], glLaeuft = false, glNurZA = false;
  /* Gleiten über die Scroll-Zeitachse wie beim Grand Beau-Rivage (Robert 13.10.2026: «mach mehr wie Rivage … zum Scrollen»): wo der Browser es kann,
     koppelt er die Bewegung des Fotos selbst an den Scroll (main.css, FASSUNG 45: .za-gl / .gleit--za), ohne Nachlauf und ohne Rechnen im Takt.
     Sonst läuft es wie bisher dem Scrollen weich nach. Das Auftaktfoto ist ausgenommen (bleibt wie es ist). */
  var ZA = !ruhig && !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()') && CSS.supports('overflow: clip'));
  var zaFrei = function (o) { return o === 'visible' || o === 'clip'; };
  var zaWurzel = function (el) { for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) { var s = getComputedStyle(a); if (!zaFrei(s.overflowX) || !zaFrei(s.overflowY)) return false; } return true; };
  var zaQuelle = function (rahmen) {   /* wessen Lage im Fenster zählt: der Rahmen selbst, in einem Band zum Blättern das Band (alle Bilder einer Reihe stehen gleich hoch) */
    for (var a = rahmen.parentElement; a && a !== document.body; a = a.parentElement) {
      var s = getComputedStyle(a); if (zaFrei(s.overflowX) && zaFrei(s.overflowY)) continue;
      if (/auto|scroll/.test(s.overflowX) && !/auto|scroll/.test(s.overflowY)) return zaWurzel(a) ? a : null;
      return null;
    }
    return rahmen;
  };
  var zaWege = function () { for (var i = 0; i < gl.length; i++) if (gl[i].za) gl[i].el.style.setProperty('--glw', Math.min(58, gl[i].rahmen.offsetHeight * 0.07).toFixed(1) + 'px'); };
  if (!ruhig && 'IntersectionObserver' in window) {
    $$('[data-r="bild"] .rahmen__k img, [data-r="schweb"] .rahmen__k img, .ce-sw > img, .zk__b img, .lk__b img, .ih-eins .rahmen__k img, .fz-b img, .kb-bild img, .se-b-bild img, .se-k-b img').forEach(function (im) {
      if (im.closest('[data-bilder],.wahl__b,.zeitreihe,.zs,.zmos,.dienst,.pakete__b,.stufe__b,.uk-l,.rg-ziel')) return;   /* region.html (14.10.2026): kleine Fotos zoomen nur herein, sie gleiten nicht (der Ausschnitt ist auf das Schild geschnitten) */
      if (im.parentNode.querySelectorAll('img').length > 1) return;
      var fig = im.closest('[data-r]'), alt = !!im.closest('#willkommen'), bild = fig && fig.getAttribute('data-r') === 'bild';   /* «Das Vintage Hotel» bleibt, wie es ist (Robert 13.10.2026: «ohne den Hero und ohne das») */
      im.classList.add('gleit'); gl.push({ el: im, rahmen: im.parentNode, fig: fig, da: false, ziel: 0, ist: 0, zs: 1.16, is: 1.16, alt: alt,
        auf: fig && !fig.classList.contains('da') ? 0 : -1, az: alt ? (bild ? 0.13 : 0.14) : 0.08, ad: alt ? (bild ? 1900 : 1400) : 2800, za: false, w: '' });   /* sonst Auftritt des Fotos wie beim Grand Beau-Rivage: weniger Vergrösserung, längere Zeit */
    });
    /* Auftritt (Robert 10.10.2026: «die sollen ganz elegant mit dem Zoom rein»): sobald das Foto auftaucht, zoomt es von selbst aus der Vergrösserung
       in seine Ruhe, nach der Uhr und nicht nach dem Scrollen. Danach gleitet es. */
    if ('MutationObserver' in window) {
      var glMO = new MutationObserver(function (ms) {
        ms.forEach(function (m) { for (var i = 0; i < gl.length; i++) { var g = gl[i];
          if (g.fig === m.target && g.auf === 0 && g.fig.classList.contains('da')) {
            g.auf = performance.now() + (parseFloat(getComputedStyle(g.fig).transitionDelay) || 0) * 1000;
            if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
          } } });
      });
      gl.forEach(function (g) { if (g.auf === 0) glMO.observe(g.fig, { attributes: true, attributeFilter: ['class'] }); });
    } else gl.forEach(function (g) { g.auf = -1; });
    if (ZA) gl.forEach(function (g) { if (g.alt) return; var q = zaQuelle(g.rahmen); if (!q) return; g.za = true; q.classList.add('za-gl'); g.el.classList.add('gleit--za'); });
    var glIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { for (var i = 0; i < gl.length; i++) if (gl[i].rahmen === e.target) gl[i].da = e.isIntersecting; });
      gleitLies();
    }, { rootMargin: '12% 0px 12% 0px' });
    gl.forEach(function (g) { if (!g.za) glIO.observe(g.rahmen); });
    if (ZA) { zaWege(); var zaRuhe = 0; window.addEventListener('resize', function () { clearTimeout(zaRuhe); zaRuhe = setTimeout(zaWege, 150); }, { passive: true }); window.addEventListener('load', zaWege); }
    /* Läuft alles über die Zeitachse, muss beim Scrollen gar nichts gerechnet werden; einmal die Ausgangsgrösse setzen, den Rest macht der Auftritt */
    glNurZA = ZA && gl.every(function (g) { return g.za; });
    if (glNurZA && gl.length) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
  }
  /* Tiefe wie beim Grand Beau-Rivage: in einer Zweierreihe (Text und Bild) läuft die Bildseite leicht versetzt zum Scrollen, nur am breiten Bildschirm */
  var tf = [];
  if (!ruhig && breit.matches) $$('.zwei>.b, .vz-zg, .wd-pp--l, .wd-pp--r, .td-abzug, .kb-abzug').forEach(function (b, i) {
    tf.push({ el: b, f: b.classList.contains('wd-pp--r') || b.classList.contains('td-abzug--r') ? -0.5 : 0.4, ist: 0, ziel: 0 });
  });
  /* Packages (Robert 15.10.2026): die äusseren Kacheln laufen beim Scrollen nach unten, die mittlere nach oben, gegenläufig */
  /* 16.10.2026 abgeschaltet (Robert: Kacheln wackeln beim Hereinschweben) */
  if (false) $$('#pakete .pk9').forEach(function (k, i) { tf.push({ el: k, f: i % 3 === 1 ? 0.75 : -0.75, ist: 0, ziel: 0 }); });
  var tfLaeuft = false;
  function tiefeLies() {
    var vh = window.innerHeight, los = false;
    for (var i = 0; i < tf.length; i++) { var r = tf[i].el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      tf[i].ziel = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)) * 70 * tf[i].f; los = true; }
    if (los && !tfLaeuft) { tfLaeuft = true; requestAnimationFrame(tiefeLauf); }
  }
  function tiefeLauf() {
    var weiter = false;
    for (var i = 0; i < tf.length; i++) { var t = tf[i]; var d = t.ziel - t.ist; if (Math.abs(d) < 0.15) continue;
      t.ist += d * 0.1; weiter = true; t.el.style.translate = '0 ' + t.ist.toFixed(1) + 'px'; }
    if (weiter) requestAnimationFrame(tiefeLauf); else tfLaeuft = false;
  }
  window.addEventListener('scroll', function () { if (tf.length) tiefeLies(); }, { passive: true });
  function gleitLies() {
    if (glNurZA || !gl.length) return; var vh = window.innerHeight;
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (!g.da || g.za) continue;
      var r = g.rahmen.getBoundingClientRect(), p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p = Math.max(-1, Math.min(1, p)); g.ziel = p * Math.min(58, r.height * 0.07); g.zs = 1.16; }   /* feste Grösse beim Gleiten: nur noch verschieben, nicht bei jedem Scrollschritt neu zeichnen */
    if (!glLaeuft) { glLaeuft = true; requestAnimationFrame(gleitLauf); }
  }
  function gleitLauf() {
    var weiter = false, jetzt = performance.now();
    for (var i = 0; i < gl.length; i++) { var g = gl[i]; if (g.za ? (g.auf < 0 && g.w) : (!g.da && g.auf <= 0)) continue;
      if (!g.za) { g.ist += (g.ziel - g.ist) * 0.1; g.is += (g.zs - g.is) * 0.1;
        if (Math.abs(g.ziel - g.ist) > 0.12 || Math.abs(g.zs - g.is) > 0.0006) weiter = true; }
      var e = 1;
      if (g.auf === 0) e = 1 + g.az;
      else if (g.auf > 0) { var t = (jetzt - g.auf) / g.ad;
        if (t >= 1) g.auf = -1; else { weiter = true; t = Math.max(0, t); e = 1 + g.az * (1 - (1 - Math.pow(2, -10 * t)) / 0.99902); } }
      var w = (g.za ? '' : 'translate3d(0,' + g.ist.toFixed(2) + 'px,0) ') + 'scale(' + (g.is * e).toFixed(4) + ')';
      if (w !== g.w) { g.w = w; g.el.style.transform = w; } }
    if (weiter) requestAnimationFrame(gleitLauf); else glLaeuft = false;
  }
  function lies() {
    gleitLies();
    var y = window.scrollY;
    if (nav && !doc.classList.contains('offen')) {
      if (y > 140 && y > yAlt + 6) nav.classList.add('weg');
      else if (y < yAlt - 6 || y < 140) nav.classList.remove('weg');
      /* Leiste oben am Rechner (Robert 16.10.2026): erst sichtbar, wenn man wieder hochscrollt; oben auf der Seite und beim Runterscrollen weg.
         Gezählt wird der Weg seit dem letzten Richtungswechsel (wie beim Rivage), damit kleine Scrollschritte bei 120 Bildern/s mitzählen. */
      if ((y - yAlt) * daRicht < 0 || (!daRicht && y !== yAlt)) { daRicht = y > yAlt ? 1 : -1; daAnker = yAlt; }
      if (y < 140) nav.classList.remove('da');
      else if (daRicht > 0 && y - daAnker > 24) nav.classList.remove('da');
      else if (daRicht < 0 && daAnker - y > 24) nav.classList.add('da');
    }
    yAlt = y;
    if (heroBild && !ruhig) ziel = Math.min(y, hero.offsetHeight) * 0.16;
    if (drei && !ruhig && breit.matches) {
      var dr = drei.getBoundingClientRect(), vh = window.innerHeight;
      if (dr.bottom > -100 && dr.top < vh + 100) {
        sZiel = Math.max(-1, Math.min(1, (dr.top + dr.height / 2 - vh / 2) / vh)) * 70;
        if (!sLaeuft && Math.abs(sZiel - sIst) > 0.15) { sLaeuft = true; requestAnimationFrame(schwebe); }
      }
    }
    if (paare.length && !ruhig && breit.matches) {
      var vh2 = window.innerHeight, los = false;
      for (var pi = 0; pi < paare.length; pi++) { var pr = paare[pi].closest('.paar').getBoundingClientRect(); if (pr.bottom > -80 && pr.top < vh2 + 80) { pZiel[pi] = Math.max(-1, Math.min(1, (pr.top + pr.height / 2 - vh2 / 2) / vh2)) * 46; los = true; } }
      if (los && !pLaeuft) { pLaeuft = true; requestAnimationFrame(paarlauf); }
    }
    if (strecke && breit.matches) {
      var r = strecke.getBoundingClientRect(), weg = r.height - window.innerHeight;
      var p = weg > 0 ? Math.min(1, Math.max(0, -r.top / weg)) : 0;
      var hn = Math.min(haeuser.length - 1, Math.floor(p * haeuser.length * 0.999));
      setze(hn);
      if (r.top < window.innerHeight * 0.72) lege(hn, 5);
    }
  }
  function bild() {
    ist += (ziel - ist) * 0.12;
    if (Math.abs(ziel - ist) < 0.2) { ist = ziel; laeuft = false; }
    if (heroBild) heroBild.style.transform = 'translate3d(0,' + ist.toFixed(1) + 'px,0)';
    if (laeuft) requestAnimationFrame(bild);
  }
  var wartet = false;
  window.addEventListener('scroll', function () {
    if (wartet) return; wartet = true;
    requestAnimationFrame(function () {
      wartet = false; lies();
      if (heroBild && !ruhig && !laeuft && Math.abs(ziel - ist) > 0.2 && window.scrollY < hero.offsetHeight * 1.1) { laeuft = true; requestAnimationFrame(bild); }
    });
  }, { passive: true });
  lies();
  /* Etagen im Plan und in der Lift-Anzeige führen an die richtige Stelle der Bühne */
  $$('[data-etage]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!strecke) return; e.preventDefault();
      var n = +a.getAttribute('data-etage'), r = strecke.getBoundingClientRect();
      var y = breit.matches ? r.top + window.scrollY + (r.height - window.innerHeight) * ((n + 0.4) / haeuser.length) : haeuser[n].getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: ruhig ? 'auto' : 'smooth' });
    });
  });
})();

/* Sprachwahl mit allen sechs Sprachen (Robert 18.10.2026: «auf allen vier Websites bitte auch die Sprachen auswählbar machen. Wenn man sie anklickt,
   dann passiert zwar nichts, aber dass zumindest sichtbar ist, dass da noch andere Sprachen kommen sollen.»). Aus jedem «DE / EN / FR» wird ein Knopf
   mit der aktuellen Sprache; er öffnet eine Liste: Deutsch, English, Français führen wie bisher auf ihre Seite, 한국어, 中文, العربية stehen mit «folgt»,
   ein Klick schliesst nur die Liste, die Seite bleibt. */
(function () {
  var SP = [['de', 'DE', 'Deutsch'], ['en', 'EN', 'English'], ['fr', 'FR', 'Français'], ['ko', 'KO', '한국어', 1], ['zh', 'ZH', '中文', 1], ['ar', 'AR', 'العربية', 1]];
  var FOLGT = { de: 'folgt', en: 'coming soon', fr: 'bientôt' };
  var akt = (document.documentElement.lang || 'de').slice(0, 2);
  var alle = [];
  /* Handy und Tablet (unter 1061 px) hatten keine Sprachwahl: eine Kopie kommt ins Menü, über «Zimmer buchen» */
  var fuss = document.querySelector('.menue__fuss'), vorlage = document.querySelector('body > .sprache');
  if (fuss && vorlage && !fuss.querySelector('.sprache')) {
    var m = document.createElement('div'); m.className = 'sprache sp-menue'; m.setAttribute('aria-label', vorlage.getAttribute('aria-label') || 'Sprache');
    m.innerHTML = vorlage.innerHTML; fuss.insertBefore(m, fuss.firstChild);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.sprache'), function (s, n) {
    var links = {};
    Array.prototype.forEach.call(s.querySelectorAll('a[lang]'), function (a) { links[a.getAttribute('lang')] = a.getAttribute('href'); });
    if (!links.de || !links.en || !links.fr) return;
    var id = 'sp-liste-' + n, h = '<button type="button" class="sp-knopf" aria-haspopup="true" aria-expanded="false" aria-controls="' + id + '">' + akt.toUpperCase()
      + '<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button><div class="sp-liste" id="' + id + '" hidden>';
    SP.forEach(function (x) {
      if (x[3]) h += '<button type="button" class="sp-eintrag sp-folgt" lang="' + x[0] + '"><span' + (x[0] === 'ar' ? ' dir="rtl"' : '') + '>' + x[2] + '</span><small>' + (FOLGT[akt] || 'folgt') + '</small></button>';
      else h += '<a class="sp-eintrag" lang="' + x[0] + '" href="' + links[x[0]] + '"' + (x[0] === akt ? ' aria-current="true"' : '') + '><span>' + x[2] + '</span><small>' + x[1] + '</small></a>';
    });
    s.innerHTML = h + '</div>';
    s.classList.add('sp-wahl');
    var k = s.querySelector('.sp-knopf'), l = s.querySelector('.sp-liste');
    var zu = function () { if (l.hidden) return; l.hidden = true; k.setAttribute('aria-expanded', 'false'); s.classList.remove('sp-auf'); };
    alle.push(zu);
    k.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!l.hidden) { zu(); return; }
      alle.forEach(function (f) { f(); });
      s.classList.toggle('sp-oben', s.getBoundingClientRect().top > window.innerHeight * 0.55);
      l.hidden = false; k.setAttribute('aria-expanded', 'true'); s.classList.add('sp-auf');
    });
    Array.prototype.forEach.call(l.querySelectorAll('.sp-folgt'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); zu(); });
    });
  });
  if (!alle.length) return;
  var allesZu = function () { alle.forEach(function (f) { f(); }); };
  document.addEventListener('click', function (e) { if (!e.target.closest || !e.target.closest('.sp-wahl')) allesZu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') allesZu(); });
  window.addEventListener('scroll', allesZu, { passive: true });
})();

/* Film des Hauses spielt von selbst, stumm, ohne Knopf und ohne Leiste (Robert 18.10.2026 20:30 «Den Film bitte direkt abspielen lassen. Auch kein Playbutton.»).
   Laden ab 800 px vor dem Bild, am Handy die leichte Fassung; abspielen, sobald ein Drittel zu sehen ist, ausserhalb pausieren. */
(function () {
  var v = document.querySelector('video[data-film-auto]'); if (!v) return;
  v.muted = true; v.defaultMuted = true; v.setAttribute('muted', '');
  var geladen = false;
  function lade() { if (geladen) return; geladen = true; var s = v.querySelector('source'); if (s && v.getAttribute('data-klein') && window.innerWidth < 861) s.src = v.getAttribute('data-klein'); v.preload = 'auto'; v.load(); }
  function spiel() { lade(); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  v.addEventListener('click', spiel);
  if (!('IntersectionObserver' in window)) { spiel(); return; }
  new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) lade(); }, { rootMargin: '0px 0px 800px 0px' }).observe(v);
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) spiel(); else if (!v.paused) v.pause(); }); }, { threshold: .33 }).observe(v);
})();
