/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — TYPOGRAPHY / GSAP REVEALS
   ═══════════════════════════════════════════════════ */

window.Cascade = window.Cascade || {};

function initTypography() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Hero — fires on load */
  gsap.from('.hero-cls',     { opacity: 0, y: -12, duration: 0.7, ease: 'power2.out', delay: 0.2 });
  gsap.from('.hero-eyebrow', { opacity: 0, y: 20,  duration: 0.8, ease: 'power3.out', delay: 0.4 });
  gsap.from('.hero-title',   { opacity: 0, y: 40, rotation: -0.8, duration: 1.1, ease: 'power3.out', delay: 0.6 });
  gsap.from('.hero-hook',    { opacity: 0, y: 30,  duration: 0.9, ease: 'power2.out', delay: 1.0 });
  gsap.from('.hero-byline',  { opacity: 0, duration: 0.7, ease: 'power2.out', delay: 1.3 });

  /* Red rule draw */
  const rule = document.getElementById('mandate-rule');
  if (rule) {
    gsap.to(rule, {
      width: '100%', duration: 1.0, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.mandate', start: 'top 65%' },
    });
  }

  /* Mandate */
  gsap.from('.mandate-kicker', {
    opacity: 0, x: -30, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: '.mandate', start: 'top 70%' },
  });
  gsap.from('.mandate-headline', {
    opacity: 0, y: 50, rotation: -0.8, duration: 1.0, ease: 'power3.out',
    scrollTrigger: { trigger: '.mandate', start: 'top 65%' },
  });
  gsap.from('.mandate-body', {
    opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.mandate', start: 'top 60%' },
  });
  gsap.from('.mandate-reqs li', {
    opacity: 0, x: -20, duration: 0.6, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: '.mandate-reqs', start: 'top 75%' },
  });
  gsap.from('.ms-item', {
    opacity: 0, y: 30, rotation: -1.0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.mandate-stats', start: 'top 78%' },
  });

  /* Finding */
  gsap.from('.finding-stats', {
    opacity: 0, y: 60, rotation: -0.5, duration: 1.0, ease: 'power3.out',
    scrollTrigger: { trigger: '.finding', start: 'top 65%' },
  });
  gsap.from('.finding-source', {
    opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '.finding-source', start: 'top 80%' },
  });
  gsap.from('.finding-coda', {
    opacity: 0, y: 40, rotation: -0.6, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.finding-coda', start: 'top 80%' },
  });
  gsap.from('.schematic-wrap', {
    opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.schematic-wrap', start: 'top 75%' },
  });
  gsap.from('.cascade-block', {
    opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.cascade-block', start: 'top 80%' },
  });
  gsap.from('.corridor-block', {
    opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.corridor-block', start: 'top 80%' },
  });
  gsap.from('.lt-col', {
    opacity: 0, y: 40, rotation: -0.8, duration: 0.8, stagger: 0.14, ease: 'power3.out',
    scrollTrigger: { trigger: '.legal-triptych', start: 'top 78%' },
  });

  /* Response */
  gsap.from('.response-kicker', {
    opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: '.response', start: 'top 72%' },
  });
  gsap.from('.response-intro', {
    opacity: 0, y: 50, rotation: -0.6, duration: 1.0, ease: 'power3.out',
    scrollTrigger: { trigger: '.response-intro', start: 'top 75%' },
  });
  gsap.from('.pillar', {
    opacity: 0, y: 60, rotation: -1.2, duration: 0.9, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '.pillars', start: 'top 72%' },
  });
  gsap.from('.ib-item', {
    opacity: 0, x: -30, duration: 0.7, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: '.impact-branches', start: 'top 78%' },
  });
  gsap.from('.coalition-list li', {
    opacity: 0, x: -20, duration: 0.6, stagger: 0.08, ease: 'power2.out',
    scrollTrigger: { trigger: '.coalition-block', start: 'top 78%' },
  });
  gsap.from('.response-kicker-final', {
    opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.response-kicker-final', start: 'top 80%' },
  });

  /* Intake */
  gsap.from('.intake-kicker', {
    opacity: 0, y: 40, rotation: -0.8, duration: 1.0, ease: 'power3.out',
    scrollTrigger: { trigger: '.intake', start: 'top 70%' },
  });
  gsap.from('.intake-pre', {
    opacity: 0, y: 40, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.intake-pre', start: 'top 75%' },
  });
  gsap.from('.qs li', {
    opacity: 0, y: 30, rotation: -0.6, duration: 0.75, stagger: 0.14, ease: 'power3.out',
    scrollTrigger: { trigger: '.qs', start: 'top 75%' },
  });
  gsap.from('.intake-act', {
    opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: '.intake-act', start: 'top 82%' },
  });
}

window.Cascade.initTypography = initTypography;
