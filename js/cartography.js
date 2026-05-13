/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — THE SCHEMATIC
   A deliberately hand-placed agentic-pipeline diagram.
   Every coordinate is set by hand. No procedural jitter.
   ═══════════════════════════════════════════════════ */

const NS = 'http://www.w3.org/2000/svg';

/* Nodes — coordinates chosen, not generated.
   Tiers: 0=operator, 1=prime, 2=sub-agent, 3=marketplace */
const NODES = [
  /* 0 */  { x:  600, y:  60, w: 200, h: 38, label: 'CORRIDOR OPERATOR',     tier: 0 },

  /* 1 */  { x:  220, y: 175, w: 116, h: 32, label: 'PRIME · α',              tier: 1 },
  /* 2 */  { x:  600, y: 175, w: 116, h: 32, label: 'PRIME · β',              tier: 1 },
  /* 3 */  { x:  980, y: 175, w: 116, h: 32, label: 'PRIME · γ',              tier: 1 },

  /* 4 */  { x:   95, y: 305, w:  92, h: 28, label: 'SUB·01',                 tier: 2 },
  /* 5 */  { x:  225, y: 305, w:  92, h: 28, label: 'SUB·02',                 tier: 2 },
  /* 6 */  { x:  355, y: 305, w:  92, h: 28, label: 'SUB·03',                 tier: 2 },
  /* 7 */  { x:  490, y: 305, w:  92, h: 28, label: 'SUB·04',                 tier: 2 },
  /* 8 */  { x:  605, y: 305, w:  92, h: 28, label: 'SUB·05',                 tier: 2 },
  /* 9 */  { x:  720, y: 305, w:  92, h: 28, label: 'SUB·06',                 tier: 2 },
  /* 10 */ { x:  855, y: 305, w:  92, h: 28, label: 'SUB·07',                 tier: 2 },
  /* 11 */ { x:  985, y: 305, w:  92, h: 28, label: 'SUB·08',                 tier: 2 },
  /* 12 */ { x: 1115, y: 305, w:  92, h: 28, label: 'SUB·09',                 tier: 2 },

  /* 13 */ { x:  160, y: 460, w: 104, h: 32, label: 'MKT·01',                 tier: 3 },
  /* 14 */ { x:  400, y: 460, w: 104, h: 32, label: 'MKT·02',                 tier: 3 },
  /* 15 */ { x:  605, y: 460, w: 104, h: 32, label: 'MKT·03',                 tier: 3, originCandidate: true },
  /* 16 */ { x:  815, y: 460, w: 104, h: 32, label: 'MKT·04',                 tier: 3 },
  /* 17 */ { x: 1055, y: 460, w: 104, h: 32, label: 'MKT·05',                 tier: 3 },
];

/* Edges. Type:
     'h' = hierarchical (operator → prime → sub, etc.)
     'x' = cross-trust (lateral — the dangerous ones)
     'm' = marketplace ingress
*/
const EDGES = [
  // operator → primes
  { a:  0, b:  1, type: 'h' },
  { a:  0, b:  2, type: 'h' },
  { a:  0, b:  3, type: 'h' },

  // primes → subs
  { a:  1, b:  4, type: 'h' }, { a:  1, b:  5, type: 'h' }, { a:  1, b:  6, type: 'h' },
  { a:  2, b:  7, type: 'h' }, { a:  2, b:  8, type: 'h' }, { a:  2, b:  9, type: 'h' },
  { a:  3, b: 10, type: 'h' }, { a:  3, b: 11, type: 'h' }, { a:  3, b: 12, type: 'h' },

  // subs ← marketplaces (ingress)
  { a: 13, b:  4, type: 'm' }, { a: 13, b:  5, type: 'm' },
  { a: 14, b:  6, type: 'm' }, { a: 14, b:  7, type: 'm' },
  { a: 15, b:  8, type: 'm' },
  { a: 16, b:  9, type: 'm' }, { a: 16, b: 10, type: 'm' },
  { a: 17, b: 11, type: 'm' }, { a: 17, b: 12, type: 'm' },

  // cross-trust (no governance layer)
  { a:  5, b:  8, type: 'x' },
  { a:  9, b: 10, type: 'x' },
  { a:  1, b:  2, type: 'x' },
  { a:  2, b:  3, type: 'x' },
];

const ORIGIN_INDEX = 15; // MKT·03 — one point of entry

/* ─── helpers ─── */
function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}

function nodeCenter(n) {
  return [n.x, n.y + n.h / 2];
}

/* Compute the connection point on the edge of a node closest to a target. */
function nodeAnchor(n, towardX, towardY) {
  const cx = n.x;
  const cy = n.y + n.h / 2;
  const dx = towardX - cx;
  const dy = towardY - cy;
  const halfW = n.w / 2 + 1;
  const halfH = n.h / 2 + 1;
  if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
    // exits through left/right
    return [cx + Math.sign(dx) * halfW, cy + (dy / Math.abs(dx)) * halfW];
  }
  // exits through top/bottom
  return [cx + (dx / Math.abs(dy)) * halfH, cy + Math.sign(dy) * halfH];
}

/* Build a path between two anchor points.
   Hierarchical/marketplace = soft S-curve. Cross-trust = lateral bow. */
function edgePath(a, b, type) {
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;

  if (type !== 'x' && Math.abs(dy) > Math.abs(dx) * 0.25) {
    // Soft S-curve for vertical connectors
    const midY = ay + dy / 2;
    return `M${ax.toFixed(1)} ${ay.toFixed(1)} C${ax.toFixed(1)} ${midY.toFixed(1)}, ${bx.toFixed(1)} ${midY.toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  // Cross-trust: lateral bow above the line
  const arc = Math.min(34, Math.abs(dx) * 0.16);
  const cy1 = ay - arc;
  const cy2 = by - arc;
  return `M${ax.toFixed(1)} ${ay.toFixed(1)} C${(ax + dx * 0.3).toFixed(1)} ${cy1.toFixed(1)}, ${(ax + dx * 0.7).toFixed(1)} ${cy2.toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

/* ─── Render the schematic ─── */
function buildAtlas() {
  const svg = document.getElementById('schematic-svg');
  if (!svg) return null;

  /* Title block — drawn by hand, off-grid */
  const title = el('g', { transform: 'translate(28, 32)' }, svg);
  const tt1 = el('text', {
    x: 0, y: 0,
    'font-family': 'DM Serif Display, serif',
    'font-size': 22, fill: '#111214',
  }, title);
  tt1.textContent = 'Subject Pipeline';
  const tt2 = el('text', {
    x: 0, y: 16,
    'font-family': 'Source Serif 4, serif',
    'font-style': 'italic',
    'font-size': 11, fill: '#9aa5b4',
  }, title);
  tt2.textContent = 'topology · sketched from procurement records';

  /* Legend in the upper-right corner */
  const legend = el('g', { transform: 'translate(940, 32)' }, svg);
  const lentries = [
    { y:  0, color: '#9aa5b4', dash: '', label: 'hierarchical trust' },
    { y: 16, color: '#9aa5b4', dash: '4 3', label: 'marketplace ingress' },
    { y: 32, color: '#e31a1a', dash: '2 3', label: 'cross-trust · no governance' },
  ];
  lentries.forEach(le => {
    el('line', {
      x1: 0, y1: le.y - 4, x2: 28, y2: le.y - 4,
      stroke: le.color, 'stroke-width': 1,
      'stroke-dasharray': le.dash,
    }, legend);
    const t = el('text', {
      x: 36, y: le.y,
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 9.5, fill: '#9aa5b4',
      'letter-spacing': '0.05em',
    }, legend);
    t.textContent = le.label;
  });

  /* Edges layer (rendered first so nodes paint on top) */
  const edgeLayer = el('g', { class: 'edges' }, svg);
  const edgeRecs = [];
  EDGES.forEach((e, i) => {
    const A = NODES[e.a];
    const B = NODES[e.b];
    const [cax, cay] = nodeCenter(A);
    const [cbx, cby] = nodeCenter(B);
    const a = nodeAnchor(A, cbx, cby);
    const b = nodeAnchor(B, cax, cay);
    const d = edgePath(a, b, e.type);

    const stroke = e.type === 'x' ? '#e31a1a' : '#9aa5b4';
    const dash   = e.type === 'm' ? '4 3' : (e.type === 'x' ? '2 3' : '');
    const opacity = e.type === 'x' ? 0.65 : 0.5;
    const sw     = e.type === 'h' ? 0.85 : 0.7;

    const path = el('path', {
      d,
      fill: 'none',
      stroke,
      'stroke-width': sw,
      'stroke-linecap': 'round',
      'stroke-dasharray': dash,
      opacity,
      'data-edge': i,
    }, edgeLayer);
    edgeRecs.push({ el: path, a: e.a, b: e.b, type: e.type, idx: i });
  });

  /* Nodes layer */
  const nodeLayer = el('g', { class: 'nodes' }, svg);
  const nodeEls = NODES.map((n, i) => {
    const g = el('g', {
      transform: `translate(${(n.x - n.w / 2).toFixed(1)},${n.y.toFixed(1)})`,
      'data-node': i,
    }, nodeLayer);

    // outer rectangle
    el('rect', {
      x: 0, y: 0, width: n.w, height: n.h,
      fill: '#f4f6f8',
      stroke: '#6b7a8d',
      'stroke-width': n.tier === 0 ? 1.3 : 0.9,
      rx: 1.4, ry: 1.4,
    }, g);

    // marketplace agents get a small "M" badge in the corner
    if (n.tier === 3) {
      el('circle', {
        cx: n.w - 8, cy: 8, r: 6,
        fill: '#f4f6f8',
        stroke: '#6b7a8d',
        'stroke-width': 0.7,
      }, g);
      const mt = el('text', {
        x: n.w - 8, y: 11,
        'text-anchor': 'middle',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': 7, 'font-weight': 700,
        fill: '#111214',
      }, g);
      mt.textContent = 'M';
    }

    // label
    const lbl = el('text', {
      x: n.w / 2, y: n.h / 2 + 3.5,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': n.tier === 0 ? 11 : 9.5,
      'font-weight': n.tier <= 1 ? 600 : 500,
      'letter-spacing': '0.1em',
      fill: '#111214',
    }, g);
    lbl.textContent = n.label;

    return g;
  });

  /* Mark the point of entry — small ink dot next to MKT·03 */
  const origin = NODES[ORIGIN_INDEX];
  const arrowG = el('g', { transform: `translate(${origin.x},${origin.y + origin.h + 18})` }, svg);
  el('path', {
    d: 'M0 -10 L0 0 M-4 -4 L0 0 L4 -4',
    stroke: '#e31a1a', 'stroke-width': 1.1, fill: 'none',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }, arrowG);
  const at = el('text', {
    x: 0, y: 16,
    'text-anchor': 'middle',
    'font-family': 'Caveat, cursive',
    'font-size': 17, fill: '#e31a1a',
  }, arrowG);
  at.textContent = 'point of entry';

  return { svg, nodeEls, edgeRecs };
}

/* ─── Trigger the cascade ─── */
function triggerCascade(_unused, atlas) {
  if (!atlas) return;
  const { nodeEls, edgeRecs } = atlas;
  const infected = new Set();

  function stampNode(idx, delay) {
    setTimeout(() => {
      const g = nodeEls[idx];
      const rect = g.querySelector('rect');
      if (rect) {
        rect.setAttribute('fill', '#fff0f0');
        rect.setAttribute('stroke', '#e31a1a');
        rect.setAttribute('stroke-width', '1.4');
      }
      // Slap an angled "VOID" stamp on top
      const n = NODES[idx];
      const angle = (idx % 5 - 2) * 3.4;
      const sg = el('g', {
        transform: `translate(${(n.w / 2).toFixed(1)},${(n.h / 2 + 2).toFixed(1)}) rotate(${angle})`,
        class: 'void-stamp',
      }, g);
      el('rect', {
        x: -22, y: -8, width: 44, height: 14,
        fill: 'none', stroke: '#e31a1a', 'stroke-width': 1.1,
        filter: 'url(#ink)',
      }, sg);
      const st = el('text', {
        x: 0, y: 2.5, 'text-anchor': 'middle',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': 8, 'font-weight': 700,
        'letter-spacing': '0.18em',
        fill: '#e31a1a',
      }, sg);
      st.textContent = 'VOID';
    }, delay);
  }

  function inkEdge(rec, delay) {
    const path = rec.el;
    setTimeout(() => {
      const total = path.getTotalLength();
      path.setAttribute('stroke', '#e31a1a');
      path.setAttribute('stroke-width', 1.6);
      path.setAttribute('opacity', 0.95);
      path.setAttribute('stroke-dasharray', total);
      path.setAttribute('stroke-dashoffset', total);
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 650ms cubic-bezier(.4,0,.6,1)';
      path.setAttribute('stroke-dashoffset', '0');
    }, delay);
  }

  function spread(idx, depth) {
    if (infected.has(idx) || depth > 6) return;
    infected.add(idx);

    stampNode(idx, depth * 520);

    const outs = edgeRecs.filter(r => r.a === idx || r.b === idx);
    outs.forEach((r, i) => {
      const next = r.a === idx ? r.b : r.a;
      if (infected.has(next)) return;
      const t = depth * 520 + 260 + i * 140;
      inkEdge(r, t);
      setTimeout(() => spread(next, depth + 1), t + 180);
    });
  }

  spread(ORIGIN_INDEX, 0);
}

/* ─── Marginalia (penciled annotations) ─── */
function showMarginalia() {
  const c = document.getElementById('sc-marginalia');
  if (!c) return;

  const notes = [
    { txt: 'point of entry —\nconfirmed.',     x: '38%', y: '88%', delay:  600 },
    { txt: 'no governance\nlayer.',             x: '2%',  y: '36%', delay: 1600 },
    { txt: 'cross-trust —\nuncontrolled.',      x: '78%', y: '38%', delay: 2700 },
    { txt: 'cascade reaches\noperator.',        x: '64%', y: '6%',  delay: 4000 },
  ];

  notes.forEach(n => {
    const div = document.createElement('div');
    div.className = 'marg';
    div.style.left = n.x;
    div.style.top  = n.y;
    div.style.transform = `rotate(${(n.delay % 7 - 3).toFixed(1)}deg)`;
    div.textContent = n.txt;
    c.appendChild(div);
    setTimeout(() => div.classList.add('shown'), n.delay);
  });
}

window.Cascade = window.Cascade || {};
window.Cascade.buildAtlas      = buildAtlas;
window.Cascade.triggerCascade  = triggerCascade;
window.Cascade.showMarginalia  = showMarginalia;
window.Cascade.ORIGIN_INDEX    = ORIGIN_INDEX;
