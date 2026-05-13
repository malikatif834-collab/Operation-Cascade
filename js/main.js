/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — ORCHESTRATOR
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ─── Schematic ─── */
  const atlas = window.Cascade.buildAtlas();

  /* ─── Globe intro ─── */
  if (window.Cascade.initGlobe) window.Cascade.initGlobe();

  /* ─── Sectors ─── */
  if (window.Cascade.initSectors) window.Cascade.initSectors();

  /* ─── GSAP scroll reveals ─── */
  if (window.Cascade.initTypography) window.Cascade.initTypography();

  /* ─── Cascade trigger: fires when .cascade-block enters viewport ─── */
  let cascadeFired = false;
  const cascadeBlock = document.querySelector('.cascade-block');

  if (cascadeBlock && atlas) {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: cascadeBlock,
        start: 'top 70%',
        onEnter: () => {
          if (!cascadeFired) {
            cascadeFired = true;
            window.Cascade.triggerCascade(null, atlas);
            window.Cascade.showMarginalia();
            startCounters();
          }
        },
      });
    } else {
      /* Fallback: IntersectionObserver if GSAP not available */
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !cascadeFired) {
            cascadeFired = true;
            window.Cascade.triggerCascade(null, atlas);
            window.Cascade.showMarginalia();
            startCounters();
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      io.observe(cascadeBlock);
    }
  }

  /* ─── Modal ─── */
  setupModal();
});

/* ─── Cascade counters ─── */
function startCounters() {
  const nE = document.getElementById('ctr-nodes');
  const jE = document.getElementById('ctr-jur');
  const tE = document.getElementById('ctr-trust');
  if (!nE || !jE || !tE) return;

  let n = 0, j = 0, t = 0;
  const NMAX = 14, JMAX = 12, TMAX = 9847;

  const iv = setInterval(() => {
    if (n < NMAX) n = Math.min(NMAX, n + 1);
    if (j < JMAX) j = Math.min(JMAX, j + (Math.random() > 0.45 ? 1 : 0));
    t = Math.min(TMAX, t + Math.floor(Math.random() * 120) + 30);

    nE.textContent = String(n).padStart(2, '0');
    jE.textContent = String(j).padStart(2, '0');
    tE.textContent = String(t).padStart(4, '0');

    if (n >= NMAX && j >= JMAX && t >= TMAX) clearInterval(iv);
  }, 230);
}

/* ─── Modal ─── */
function setupModal() {
  const modal = document.getElementById('modal');
  const open  = document.getElementById('open-modal');
  const close = document.getElementById('modal-close');
  const form  = document.getElementById('intake-form');
  const err   = document.getElementById('m-err');
  const recv  = document.getElementById('m-received');
  const num   = document.getElementById('rcv-num');

  if (!modal || !open) return;

  function show() {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }
  function hide() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.hidden = true;
      form.hidden = false;
      recv.hidden = true;
      form.reset();
      err.hidden = true;
    }, 320);
  }

  open.addEventListener('click', show);
  close.addEventListener('click', hide);
  modal.addEventListener('click', e => { if (e.target === modal) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) hide(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!data.institution || !data.contribution || !data.motivation || !data.email) {
      err.hidden = false;
      return;
    }
    err.hidden = true;

    const ctl = `OPC-2026-${String(Math.floor(Math.random() * 9000) + 1000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;
    num.textContent = ctl;
    form.hidden = true;
    recv.hidden = false;

    const body = encodeURIComponent(
      `Control: ${ctl}\n\n` +
      `i. Who: ${data.institution}\n\n` +
      `ii. Bring: ${data.contribution}\n\n` +
      `iii. Why: ${data.motivation}\n\n` +
      `Contact: ${data.email}`
    );
    setTimeout(() => {
      window.location.href = `mailto:cascade@operationcascade.org?subject=${encodeURIComponent('OP-Cascade Intake · ' + ctl)}&body=${body}`;
    }, 1800);
  });
}
