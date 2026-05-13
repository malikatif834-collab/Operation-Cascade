/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — TYPOGRAPHY HELPERS
   Ink-in reveals only. No drift, no jitter.
   ═══════════════════════════════════════════════════ */

window.Cascade = window.Cascade || {};

function setupInkReveal() {
  const sel = '.lede, .finding-fig, .finding-coda, .schematic, .corridor, .cascade, .intake-pre, .qs, .coalition';
  const targets = document.querySelectorAll(sel);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('inked');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(t => io.observe(t));
}

async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) { /* swallow */ }
  }
}

async function initTypography() {
  setupInkReveal();
  await waitForFonts();
}

window.Cascade.initTypography = initTypography;
