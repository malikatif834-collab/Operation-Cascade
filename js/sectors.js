/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — INFRASTRUCTURE SECTORS
   Scroll-scrubbed panel sequence. Animation progress
   is tied directly to scroll position and reverses
   on scroll-up. No independent timers.
   ═══════════════════════════════════════════════════ */

window.Cascade = window.Cascade || {};

const SECTOR_DATA = [
  {
    id:    'energy',
    name:  'Energy',
    sub:   'Power Grid & Utilities',
    stat:  '11 G7 cross-border grid interconnections — zero with a shared agent authorization standard',
    risks: [
      'SCADA-adjacent AI across eleven G7 grid interconnections operates without a shared identity layer — the trust assumption is built into the architecture.',
      'A compromised scheduling agent can propagate load-shedding instructions before human operators receive the first alert.',
      'Cross-border grid AI has no unified authorization standard. Machine-speed propagation eclipses the 277-day average breach detection lifecycle.',
    ],
  },
  {
    id:    'healthcare',
    name:  'Healthcare',
    sub:   'Medical Supply & Patient Systems',
    stat:  '31% of healthcare organizations have at least one autonomous agent in production — none governed by an accredited inter-agent standard',
    risks: [
      'Medical supply chain coordination AI sources pharmaceuticals, devices, and biologics across multiple jurisdictions without a common trust framework.',
      '31% of healthcare organizations currently have at least one autonomous agent in production. No accredited standard governs cross-border instruction authentication.',
      'Multi-agent procurement chains produce no human-readable authorization trail. Personal director liability applies regardless of whether a human directed the harm.',
    ],
  },
  {
    id:    'logistics',
    name:  'Transportation',
    sub:   'Ports, Freight & Customs',
    stat:  'Four-to-six subcontractor agent pipelines per shipment — no single regulatory body has standing over the full chain',
    risks: [
      'Port automation AI, customs pre-clearance agents, and freight-routing systems form four-to-six-subcontractor pipelines per shipment.',
      'A compromised routing agent at a third-tier logistics provider can re-route sensitive cargo across jurisdictions before the primary operator\'s monitoring system registers an anomaly.',
      'No single regulatory body has standing over the full agent chain when harm crosses jurisdictions. No authorization trail survives the handoff.',
    ],
  },
  {
    id:    'defence',
    name:  'Defence',
    sub:   'Defence-Industrial & Dual-Use',
    stat:  'Classified supply chains contain unclassified AI subagents — no standard governs the boundary',
    risks: [
      'Classified supply chains contain unclassified AI subagents that inherit trust from the tier above. No existing standard governs the boundary between cleared and commercial agentic systems.',
      'Dual-use component sourcing increasingly relies on AI-managed procurement chains with no authorization audit trail that survives cross-organizational handoffs.',
      'A decision by an autonomous agent at a fourth-tier subcontractor can cross four organizational and jurisdictional lines before downstream harm occurs at the primary operator.',
    ],
  },
  {
    id:    'finance',
    name:  'Finance',
    sub:   'Banking, Payments & Trade Finance',
    stat:  'Multi-agent orchestration in financial services: 1% → 22% in two years. 80% of workers use unapproved AI tools.',
    risks: [
      'Cross-border payment and trade-finance AI operates across multiple regulatory jurisdictions simultaneously — no interoperable trust standard exists for this interaction.',
      'Multi-agent orchestration in financial services jumped from 1% to 22% of deployments in two years. The governance infrastructure has not moved.',
      '80% of workers use unapproved AI tools; only 11% using generative AI at work do so through governed corporate channels. In finance, that is systemic risk.',
    ],
  },
];

function buildSectors() {
  const wrapper = document.getElementById('sectors');
  if (!wrapper) return;

  SECTOR_DATA.forEach((s, i) => {
    const panel = document.createElement('div');
    panel.className = 'sector-panel';
    panel.id = `sector-${s.id}`;
    panel.setAttribute('data-index', i);
    if (i === 0) panel.classList.add('active');

    panel.classList.add(s.id === 'healthcare' ? 'sp-light' : 'sp-dark');
    panel.innerHTML = `
      <div class="sp-bg sp-bg--${s.id}" aria-hidden="true"></div>
      <div class="sp-content">
        <div class="sp-left">
          <p class="sp-index mono">0${i + 1} / 05</p>
          <h2 class="sp-name">${s.name}</h2>
          <p class="sp-sub">${s.sub}</p>
        </div>
        <div class="sp-right">
          <ul class="sp-risks">
            ${s.risks.map(r => `<li class="risk-point"><span class="rp-bullet" aria-hidden="true"></span><span class="rp-text">${r}</span></li>`).join('')}
          </ul>
          <div class="sp-stat">
            <span class="sp-stat-line" aria-hidden="true"></span>
            <p class="sp-stat-text">${s.stat}</p>
          </div>
        </div>
      </div>
    `;

    wrapper.appendChild(panel);
  });
}

function initSectors() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  buildSectors();

  const panels = Array.from(document.querySelectorAll('.sector-panel'));
  if (!panels.length) return;

  const wrapper = document.getElementById('sectors');
  const N = SECTOR_DATA.length;

  /* Stack panels, all hidden except first */
  gsap.set(panels, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });
  gsap.set(panels, { opacity: 0 });
  gsap.set(panels[0], { opacity: 1 });

  /* Pre-hide all content so the scrub timeline reveals it */
  panels.forEach(panel => {
    gsap.set(panel.querySelectorAll('.risk-point'), { opacity: 0, x: 32 });
    const line = panel.querySelector('.sp-stat-line');
    const text = panel.querySelector('.sp-stat-text');
    if (line) gsap.set(line, { scaleX: 0 });
    if (text) gsap.set(text, { opacity: 0, y: 8 });
  });

  /* ── Master scrub timeline ──
     Each step occupies 1 unit of timeline-space.
     Transitions fire at the 100 / 200 / 300 / 400 vh marks.
     Cross-fade overlap = 0.4 units.
     Content animation starts 0.1 units after panel is visible.          */
  const STEP   = 1;
  const XFADE  = 0.4;

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  /* Panel 0: reveal content immediately at time 0 */
  const p0risks = panels[0].querySelectorAll('.risk-point');
  const p0line  = panels[0].querySelector('.sp-stat-line');
  const p0text  = panels[0].querySelector('.sp-stat-text');
  tl.to(p0risks, { opacity: 1, x: 0, duration: 0.22, stagger: 0.05 }, 0.02);
  if (p0line) tl.fromTo(p0line, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power3.out' }, 0.18);
  if (p0text) tl.to(p0text, { opacity: 1, y: 0, duration: 0.22 }, 0.42);

  for (let i = 1; i < N; i++) {
    const base         = (i - 1) * STEP;
    const fadeOutStart = base + STEP - XFADE;
    const fadeInStart  = base + STEP - XFADE * 0.5;
    const contentAt    = base + STEP + 0.1;

    /* Outgoing panel fades out */
    tl.to(panels[i - 1], { opacity: 0, scale: 0.97, duration: XFADE }, fadeOutStart);

    /* Incoming panel fades in */
    tl.fromTo(panels[i],
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: XFADE },
      fadeInStart
    );

    /* Content appears shortly after the panel is visible */
    const risks = panels[i].querySelectorAll('.risk-point');
    tl.to(risks, { opacity: 1, x: 0, duration: 0.22, stagger: 0.05 }, contentAt);

    const line = panels[i].querySelector('.sp-stat-line');
    if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power3.out' }, contentAt + 0.18);

    const text = panels[i].querySelector('.sp-stat-text');
    if (text) tl.to(text, { opacity: 1, y: 0, duration: 0.22 }, contentAt + 0.38);
  }

  /* ── Single pinned ScrollTrigger drives the whole timeline ── */
  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: `+=${N * 100}%`,
    pin: true,
    pinSpacing: true,
    scrub: 1.5,   /* animation lags scroll by 1.5s for cinematic smoothness */
    animation: tl,
  });
}

window.Cascade.initSectors = initSectors;
