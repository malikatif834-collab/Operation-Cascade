/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — INFRASTRUCTURE SECTORS
   GSAP-pinned scroll sequence. Five full-viewport
   panels cycling through critical sectors.
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
      'Medical supply chain coordination AI sources pharmaceuticals, devices, and biologics across 20+ jurisdictions without a common trust framework.',
      '31% of healthcare organizations currently have at least one autonomous agent in production. No accredited standard governs cross-border instruction authentication.',
      'Multi-agent procurement chains produce no human-readable authorization trail. Bill C-8 personal director liability applies regardless of whether a human directed the harm.',
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
      'Cross-border payment and trade-finance AI operates across 12+ regulatory jurisdictions simultaneously — no interoperable trust standard exists for this interaction.',
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

  /* Set all panels stacked on top of each other, all hidden except first */
  gsap.set(panels, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });
  gsap.set(panels.slice(1), { opacity: 0 });

  /* Pin the wrapper for 5 × 100vh = 500vh of scroll */
  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: `+=${SECTOR_DATA.length * 100}%`,
    pin: true,
    pinSpacing: true,
  });

  /* Each panel gets its own trigger window */
  panels.forEach((panel, i) => {
    const totalScrollLength = SECTOR_DATA.length * 100;
    const startPct = i * 100;
    const endPct   = (i + 1) * 100;

    ScrollTrigger.create({
      trigger: wrapper,
      start: `top+=${startPct}% top`,
      end:   `top+=${endPct}% top`,
      onEnter:     () => activatePanel(panels, i),
      onEnterBack: () => activatePanel(panels, i),
    });
  });
}

function activatePanel(panels, i) {
  /* Fade out all */
  panels.forEach((p, j) => {
    if (j !== i) gsap.to(p, { opacity: 0, duration: 0.3, ease: 'power2.in' });
  });

  /* Animate in the target panel */
  gsap.fromTo(
    panels[i],
    { opacity: 0, scale: 1.04 },
    { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }
  );

  /* Stagger risk points */
  const risks = panels[i].querySelectorAll('.risk-point');
  gsap.fromTo(
    risks,
    { x: 40, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out', delay: 0.35 }
  );

  /* Draw the stat line */
  const statLine = panels[i].querySelector('.sp-stat-line');
  if (statLine) {
    gsap.fromTo(statLine, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.out', delay: 0.6 });
  }

  gsap.fromTo(
    panels[i].querySelector('.sp-stat-text'),
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.85 }
  );
}

window.Cascade.initSectors = initSectors;
