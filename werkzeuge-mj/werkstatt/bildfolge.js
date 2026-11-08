/* Drucksachen & Feed · Vorführung: Bildfolgen statt Filme.
   Die Führung der Vorlage zeigt zu jedem Schritt einen Kurzfilm und dazu ein Demo-Video mit Kapiteln. Hier spielt an derselben Stelle eine Bildfolge
   aus diesem Werkzeug mit Maloja (hilfe/s*.jpg, aufgenommen mit _bau/filme.py): Bild für Bild überblendet, langsam herangezoomt, mit Zeitleiste.
   <ds-bildfolge data-film="schritt-1" autoplay loop> verhält sich für fuehrung.js wie <video>: play(), pause(), paused, currentTime, duration,
   Ereignisse loadedmetadata und error. Bewegung nur über transform und opacity. */
(function () {
  'use strict';
  const SEK = 4.5;   // Sekunden je Bild
  // Bild, Ursprung des Zooms (wohin die Maus zeigt) in Prozent
  const B = {
    s1a: [22, 52], s1b: [30, 55], s2a: [62, 45], s2b: [40, 70], s3a: [50, 45], s3b: [40, 30], s4a: [50, 45], s4b: [50, 45],
    s5a: [62, 22], s5b: [55, 40], s6a: [20, 30], s6b: [20, 40], s6c: [25, 30], s7a: [30, 10], s7b: [30, 10], s8a: [40, 55], s9a: [60, 30], s9b: [45, 50]
  };
  const FILME = {
    'schritt-1': ['s1a', 's1b'], 'schritt-2': ['s2a', 's2b'], 'schritt-3': ['s3a', 's3b'], 'schritt-4': ['s4a', 's4b'], 'schritt-5': ['s5a', 's5b'],
    'schritt-6': ['s6a', 's6b', 's6c'], 'schritt-7': ['s7a', 's7b'], 'schritt-8': ['s8a'], 'schritt-9': ['s9a', 's9b'],
    demo: ['s1a', 's1b', 's2b', 's3b', 's4a', 's4b', 's5b', 's6a', 's6b', 's7a', 's8a', 's9a', 's9b']
  };
  // Kapitel des Demos (fuehrung.js holt sie wie die Vorlage als hilfe/kapitel.json)
  const KAPITEL = [{ titel: 'Sagen', b: 's1a' }, { titel: 'Anpassen', b: 's3b' }, { titel: 'Format', b: 's6a' }, { titel: 'Drucken', b: 's8a' }];
  window.DS_DATEIEN = window.DS_DATEIEN || {};
  window.DS_DATEIEN['hilfe/kapitel.json'] = KAPITEL.map(k => ({ titel: k.titel, t: FILME.demo.indexOf(k.b) * SEK }));
  const zeit = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  class Bildfolge extends HTMLElement {
    connectedCallback() {
      if (this._bilder) return;
      this._bilder = FILME[this.dataset.film] || [];
      this._t = 0; this.paused = true; this._i = -1;
      if (!this._bilder.length) { setTimeout(() => this.dispatchEvent(new Event('error'))); return; }
      this.innerHTML = this._bilder.map(b => `<img src="hilfe/${b}.jpg" alt="" decoding="async" style="transform-origin:${B[b][0]}% ${B[b][1]}%">`).join('')
        + `<span class="bf__zeit"><i></i></span><span class="bf__knauf" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg></span>`;
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', 'Bildfolge: so sieht der Schritt im Werkzeug aus');
      const erstes = this.querySelector('img');
      const da = () => this.dispatchEvent(new Event('loadedmetadata'));
      if (erstes.complete) setTimeout(da); else erstes.addEventListener('load', da, { once: true });
      erstes.addEventListener('error', () => this.dispatchEvent(new Event('error')), { once: true });
      this.addEventListener('click', () => this.paused ? this.play() : this.pause());
      if (this.hasAttribute('controls')) this._leiste();
      this._zeige();
      if (this.hasAttribute('autoplay')) this.play();
    }
    disconnectedCallback() { this.pause(); }
    /* Bedienleiste wie beim Video der Vorlage (controls): Abspielen/Anhalten, Zeit, Fortschritt zum Ziehen, Vollbild */
    _leiste() {
      const L = document.createElement('div'); L.className = 'bf__leiste';
      L.innerHTML = `<button class="bf__k bf__spiel" type="button" aria-label="Abspielen"><svg viewBox="0 0 24 24"><path class="an" d="M8 5.5v13l10.5-6.5z"/><path class="aus" d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z"/></svg></button>
        <span class="bf__t">0:00 / ${zeit(this.duration)}</span><span class="bf__balken" role="slider" aria-label="Fortschritt" tabindex="0"><span><i></i><b></b></span></span>
        <button class="bf__k bf__voll" type="button" aria-label="Vollbild"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>`;
      this.appendChild(L); this.classList.add('bf--leiste');
      L.addEventListener('click', e => e.stopPropagation());
      L.querySelector('.bf__spiel').addEventListener('click', () => this.paused ? this.play() : this.pause());
      L.querySelector('.bf__voll').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else if (this.requestFullscreen) this.requestFullscreen().catch(() => { }); });
      const balken = L.querySelector('.bf__balken');
      const setze = e => { const r = balken.getBoundingClientRect(); this.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * this.duration; };
      balken.addEventListener('pointerdown', e => { balken.setPointerCapture(e.pointerId); setze(e); const zieh = ev => setze(ev), los = () => { balken.removeEventListener('pointermove', zieh); balken.removeEventListener('pointerup', los); }; balken.addEventListener('pointermove', zieh); balken.addEventListener('pointerup', los); });
      balken.addEventListener('keydown', e => { if (e.key === 'ArrowRight') this.currentTime = this._t + 5; if (e.key === 'ArrowLeft') this.currentTime = this._t - 5; });
    }
    get duration() { return (this._bilder || []).length * SEK; }
    get currentTime() { return this._t; }
    set currentTime(t) { this._t = Math.max(0, Math.min(+t || 0, this.duration - .01)); this._zeige(); }
    play() {
      if (!this.paused || !this._bilder || !this._bilder.length) return Promise.resolve();
      if (this._t >= this.duration - .02) this._t = 0;
      this.paused = false; this.classList.add('spielt'); this._zeige();
      let vorher = performance.now();
      const tick = jetzt => {
        if (this.paused) return;
        this._t += Math.max(0, jetzt - vorher) / 1000; vorher = Math.max(vorher, jetzt);
        if (this._t >= this.duration) { if (this.hasAttribute('loop')) this._t = 0; else { this._t = this.duration - .01; this._zeige(); this.pause(); return; } }
        this._zeige();
        this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
      return Promise.resolve();
    }
    pause() { this.paused = true; cancelAnimationFrame(this._raf); this.classList.remove('spielt'); this._zeige(); }
    _zeige() {
      const bilder = this.querySelectorAll('img'); if (!bilder.length) return;
      const i = Math.max(0, Math.min(bilder.length - 1, Math.floor(this._t / SEK))), p = Math.max(0, Math.min(1, (this._t - i * SEK) / SEK));
      if (i !== this._i) { bilder.forEach((im, k) => im.classList.toggle('jetzt', k === i)); this._i = i; }
      if (!still()) bilder[i].style.transform = `scale(${(1.015 + .075 * p).toFixed(4)})`;
      const z = this.querySelector('.bf__zeit i'); if (z) z.style.transform = `scaleX(${(this._t / this.duration).toFixed(4)})`;
      const q = (this._t / this.duration).toFixed(4), lb = this.querySelector('.bf__balken i'), lk = this.querySelector('.bf__balken b'), lt = this.querySelector('.bf__t');
      if (lb) { lb.style.transform = `scaleX(${q})`; lk.style.left = (q * 100) + '%'; lt.textContent = zeit(this._t) + ' / ' + zeit(this.duration); }
      const sp = this.querySelector('.bf__spiel'); if (sp) sp.setAttribute('aria-label', this.paused ? 'Abspielen' : 'Anhalten');
    }
  }
  if (!customElements.get('ds-bildfolge')) customElements.define('ds-bildfolge', Bildfolge);
})();
