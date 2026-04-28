/* ═══════════════════════════════════════════════
   OPERATION CASCADE · MAIN ORCHESTRATOR
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Boot sequence ──────────────────────────── */
  const globe = new CascadeGlobe('globe-canvas');

  /* ═══════════════════════════════════════════
     CLASSIFICATION ESCALATOR
  ═══════════════════════════════════════════ */

  const clEl     = document.getElementById('classification-level');
  const clLevels = [
    { label: 'UNCLASSIFIED',      cls: 'cl-unclassified',  at: 0.00 },
    { label: 'RESTRICTED',        cls: 'cl-restricted',    at: 0.28 },
    { label: 'CONFIDENTIAL',      cls: 'cl-confidential',  at: 0.55 },
    { label: 'TOP SECRET // SCI', cls: 'cl-topsecret',     at: 0.78 },
  ];
  let clCurrent = 0;

  function updateClassification(ratio) {
    let next = 0;
    for (let i = clLevels.length - 1; i >= 0; i--) {
      if (ratio >= clLevels[i].at) { next = i; break; }
    }
    if (next === clCurrent) return;
    clCurrent = next;
    const lvl = clLevels[next];
    clEl.textContent = lvl.label;
    clEl.className   = lvl.cls;
    flashChromatic(180);
  }

  /* ═══════════════════════════════════════════
     GLITCH / CHROMATIC FLASH
  ═══════════════════════════════════════════ */

  const glitchEl = document.getElementById('glitch-overlay');

  function flashChromatic(ms = 120) {
    glitchEl.style.opacity = '1';
    clearTimeout(glitchEl._t);
    glitchEl._t = setTimeout(() => { glitchEl.style.opacity = '0'; }, ms);
  }

  // Random ambient interference
  (function scheduleGlitch() {
    setTimeout(() => {
      flashChromatic(60 + Math.random() * 80);
      scheduleGlitch();
    }, 6000 + Math.random() * 14000);
  })();

  /* ═══════════════════════════════════════════
     TEXT DECODE EFFECT
  ═══════════════════════════════════════════ */

  const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*><[]';

  function decodeText(el, finalText, duration = 1200) {
    const STEPS = 28;
    let step = 0;
    const tick = () => {
      if (step > STEPS) { el.textContent = finalText; return; }
      const prog = step / STEPS;
      const revealed = Math.floor(prog * finalText.length);
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ' || finalText[i] === '\n') { out += finalText[i]; }
        else if (i < revealed)                             { out += finalText[i]; }
        else                                               { out += NOISE[Math.floor(Math.random() * NOISE.length)]; }
      }
      el.textContent = out;
      step++;
      setTimeout(tick, duration / STEPS);
    };
    tick();
  }

  // Fire hero hook decode after initial fade-in
  setTimeout(() => {
    const hookEl = document.getElementById('hero-hook');
    if (hookEl) decodeText(hookEl, hookEl.textContent.trim(), 1600);
  }, 2800);

  /* ═══════════════════════════════════════════
     INTERSECTION OBSERVER — REVEAL LINES
  ═══════════════════════════════════════════ */

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const lines = entry.target.querySelectorAll('.reveal-line');
      lines.forEach((ln, i) => {
        setTimeout(() => ln.classList.add('revealed'), i * 140);
      });
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.chapter').forEach(ch => revealObs.observe(ch));

  /* ═══════════════════════════════════════════
     CHAPTER 3 · PIN-AND-SCRUB
  ═══════════════════════════════════════════ */

  const ch3      = document.getElementById('ch3');
  const pinTrack = document.getElementById('pin-track');
  const scanRows = document.querySelectorAll('.scan-row');

  let stage2Fired   = false;
  let counterActive = false;

  function updatePinStage(progress) {
    // progress 0→1 through ch3's scroll range
    if (progress < 0.33) {
      pinTrack.style.transform = 'translateX(0%)';
      // Animate the model count when stage 0 is first visible
      const el = document.getElementById('stat-models');
      if (el && !el.dataset.done && progress > 0.05) {
        el.dataset.done = '1';
        countUp(el, 18, 1400);
      }

    } else if (progress < 0.66) {
      pinTrack.style.transform = 'translateX(-33.333%)';
      // Cascade-in the infrastructure scan rows
      scanRows.forEach(row => {
        const d = parseInt(row.dataset.d) || 0;
        setTimeout(() => row.classList.add('active'), d);
      });

    } else {
      pinTrack.style.transform = 'translateX(-66.666%)';
      if (!stage2Fired) {
        stage2Fired = true;
        globe.setState('cascade');
        flashChromatic(350);
        startCounters();
      }
    }
  }

  function countUp(el, target, duration) {
    const steps = 30;
    let step = 0;
    const iv = setInterval(() => {
      const v = Math.round((step / steps) * target);
      el.textContent = String(v).padStart(2, '0');
      step++;
      if (step > steps) { clearInterval(iv); el.textContent = String(target).padStart(2, '0'); }
    }, duration / steps);
  }

  function startCounters() {
    if (counterActive) return;
    counterActive = true;

    const nodesEl = document.getElementById('ctr-nodes');
    const jurEl   = document.getElementById('ctr-jur');
    const trustEl = document.getElementById('ctr-trust');

    let nodes = 0, jur = 0, trust = 0;

    const iv = setInterval(() => {
      if (nodes < 14) nodes  = Math.min(14,   nodes  + Math.floor(Math.random() * 2) + 1);
      if (jur   < 12) jur    = Math.min(12,   jur    + (Math.random() > 0.4 ? 1 : 0));
      trust = Math.min(9847,  trust  + Math.floor(Math.random() * 120) + 30);

      nodesEl.textContent = String(nodes).padStart(3, '0');
      jurEl.textContent   = String(jur).padStart(2,  '0');
      trustEl.textContent = String(trust).padStart(4, '0');

      if (nodes >= 14 && jur >= 12 && trust >= 9847) clearInterval(iv);
    }, 180);
  }

  /* ═══════════════════════════════════════════
     SCROLL HANDLER
  ═══════════════════════════════════════════ */

  // Cache layout values (refresh on resize)
  let ch2Top, ch3Top, ch3H, ch4Top, ch5Top, docH, winH;

  function cacheLayout() {
    winH  = innerHeight;
    docH  = document.documentElement.scrollHeight - winH;
    ch2Top = document.getElementById('ch2').offsetTop;
    ch3Top = ch3.offsetTop;
    ch3H   = ch3.offsetHeight;
    ch4Top = document.getElementById('ch4').offsetTop;
    ch5Top = document.getElementById('ch5').offsetTop;
  }

  cacheLayout();
  window.addEventListener('resize', cacheLayout);

  window.addEventListener('scroll', onScroll, { passive: true });

  function onScroll() {
    const sy    = scrollY;
    const ratio = sy / docH;

    // Classification
    updateClassification(ratio);

    // Globe scroll progress (drives rotation speed)
    globe.scrollProg = ratio;

    // Globe state by chapter
    if (sy < ch2Top - winH * 0.4) {
      globe.setState('pristine');
    } else if (sy < ch3Top - winH * 0.3) {
      globe.setState('surveillance');
    } else if (sy >= ch4Top - winH * 0.3) {
      globe.setState('recovery');
    }

    // Pin-and-scrub: ch3
    if (sy >= ch3Top && sy < ch4Top) {
      const scrubRange = ch3H - winH;
      const prog       = scrubRange > 0 ? (sy - ch3Top) / scrubRange : 0;
      updatePinStage(Math.max(0, Math.min(1, prog)));
    }
  }

  /* ═══════════════════════════════════════════
     MODAL
  ═══════════════════════════════════════════ */

  const overlay   = document.getElementById('modal-overlay');
  const closeBtn  = document.getElementById('modal-close');
  const ctaBtn    = document.getElementById('cta-btn');
  const form      = document.getElementById('access-form');
  const formError = document.getElementById('form-error');

  ctaBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    if (!data.institution || !data.contribution || !data.motivation || !data.email) {
      formError.hidden = false;
      return;
    }

    formError.hidden = true;

    const sub  = encodeURIComponent('Operation Cascade — Access Request');
    const body = encodeURIComponent(
      `WHO ARE YOU:\n${data.institution}\n\n` +
      `WHAT DO YOU BRING:\n${data.contribution}\n\n` +
      `WHY THIS MATTERS:\n${data.motivation}\n\n` +
      `CONTACT: ${data.email}`
    );

    window.location.href = `mailto:cascade@operationcascade.org?subject=${sub}&body=${body}`;
  });

  /* ═══════════════════════════════════════════
     INITIAL GLOBE STATE
  ═══════════════════════════════════════════ */

  globe.setState('pristine');

  // Run one scroll pass so state is correct if user lands mid-page
  onScroll();

});
