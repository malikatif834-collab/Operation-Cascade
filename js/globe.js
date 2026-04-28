/* ═══════════════════════════════════════════════
   OPERATION CASCADE · GLOBE
   Three.js r128 — procedural, no texture deps
   ═══════════════════════════════════════════════ */

class CascadeGlobe {
  constructor(canvasId) {
    this.canvas       = document.getElementById(canvasId);
    this.state        = 'pristine';
    this.time         = 0;
    this.scrollProg   = 0;
    this.infectedSet  = new Set();
    this.cascadeArmed = false;

    // Randomise the origin node each page load for probabilistic feel
    this.originIdx = Math.floor(Math.random() * 12);

    this._targetAtmoColor = new THREE.Color(0x0055bb);
    this._currentAtmoColor = new THREE.Color(0x0055bb);

    this.init();
    this._loop();
  }

  init() {
    /* ── Scene / Camera / Renderer ── */
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
    this.camera.position.set(0, 0.15, 2.9);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    /* ── Globe group (rotates) ── */
    this.group = new THREE.Group();
    this.scene.add(this.group);

    /* ── Components ── */
    this._buildEarth();
    this._buildAtmosphere();
    this._buildGrid();
    this._buildNodes();
    this._buildConnections();
    this._buildParticles();

    /* ── Lights ── */
    this.scene.add(new THREE.AmbientLight(0x112244, 0.6));
    const sun = new THREE.DirectionalLight(0x4488ff, 1.2);
    sun.position.set(5, 3, 5);
    this.scene.add(sun);

    window.addEventListener('resize', () => this._onResize());
  }

  /* ─────────────────────────────────
     BUILD: Earth sphere
  ───────────────────────────────── */
  _buildEarth() {
    const geo = new THREE.SphereGeometry(1, 64, 64);
    this.earthMat = new THREE.MeshPhongMaterial({
      color:    0x020d1f,
      emissive: 0x000e28,
      shininess: 60,
    });
    this.earth = new THREE.Mesh(geo, this.earthMat);
    this.group.add(this.earth);
  }

  /* ─────────────────────────────────
     BUILD: Atmosphere rim shader
  ───────────────────────────────── */
  _buildAtmosphere() {
    const geo = new THREE.SphereGeometry(1.09, 64, 64);
    this.atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x0055bb) },
        intensity:  { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        void main() {
          float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          rim = pow(clamp(rim, 0.0, 1.0), 2.2);
          gl_FragColor = vec4(glowColor, rim * intensity * 0.9);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.group.add(new THREE.Mesh(geo, this.atmoMat));
  }

  /* ─────────────────────────────────
     BUILD: Lat/lon grid
  ───────────────────────────────── */
  _buildGrid() {
    this.gridMat = new THREE.LineBasicMaterial({
      color: 0x0d3366,
      transparent: true,
      opacity: 0.22,
    });

    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = [];
      const ry = Math.sin(lat * Math.PI / 180);
      const r  = Math.cos(lat * Math.PI / 180);
      for (let lon = 0; lon <= 360; lon += 6) {
        const a = lon * Math.PI / 180;
        pts.push(new THREE.Vector3(r * Math.cos(a), ry, r * Math.sin(a)));
      }
      this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.gridMat));
    }

    for (let lon = 0; lon < 360; lon += 20) {
      const pts = [];
      const a = lon * Math.PI / 180;
      for (let lat = -90; lat <= 90; lat += 6) {
        const ry = Math.sin(lat * Math.PI / 180);
        const r  = Math.cos(lat * Math.PI / 180);
        pts.push(new THREE.Vector3(r * Math.cos(a), ry, r * Math.sin(a)));
      }
      this.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.gridMat));
    }
  }

  /* ─────────────────────────────────
     BUILD: Network nodes
  ───────────────────────────────── */
  _buildNodes() {
    const POSITIONS = [
      { lat: 51.9,  lon:  4.5  }, // Rotterdam
      { lat:  1.3,  lon: 103.8 }, // Singapore
      { lat: 31.2,  lon: 121.5 }, // Shanghai
      { lat: 33.7,  lon:-118.2 }, // Los Angeles
      { lat: 40.7,  lon: -74.0 }, // New York
      { lat: 25.2,  lon:  55.3 }, // Dubai
      { lat: 51.5,  lon:  -0.1 }, // London
      { lat: 50.1,  lon:   8.7 }, // Frankfurt
      { lat: 35.7,  lon: 139.7 }, // Tokyo
      { lat:-33.9,  lon: 151.2 }, // Sydney
      { lat: 19.1,  lon:  72.9 }, // Mumbai
      { lat:-23.5,  lon: -46.6 }, // São Paulo
      { lat: 41.9,  lon: -87.6 }, // Chicago
      { lat: 43.7,  lon: -79.4 }, // Toronto
      { lat: 52.4,  lon:   4.9 }, // Amsterdam
      { lat: 37.6,  lon: 126.9 }, // Seoul
      { lat: -1.3,  lon:  36.8 }, // Nairobi
      { lat: 19.4,  lon: -99.1 }, // Mexico City
    ];

    const geo  = new THREE.SphereGeometry(0.013, 8, 8);
    this.nodes = [];

    POSITIONS.forEach((p, i) => {
      const mat  = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(this._ll2v3(p.lat, p.lon, 1.02));
      mesh.userData = { state: 'clean', index: i };
      this.group.add(mesh);
      this.nodes.push(mesh);
    });
  }

  /* ─────────────────────────────────
     BUILD: Connection arcs
  ───────────────────────────────── */
  _buildConnections() {
    const PAIRS = [
      [0,6],[0,7],[0,14],
      [1,2],[1,8],[1,9],
      [2,8],[2,15],
      [3,4],[3,12],[3,13],
      [4,6],[4,7],
      [5,7],[5,10],
      [6,14],
      [7,14],
      [9,10],
      [11,4],
      [12,13],
      [16,5],
      [17,3],
    ];

    this.connections = [];

    PAIRS.forEach(([ai, bi]) => {
      const a = this.nodes[ai].position;
      const b = this.nodes[bi].position;
      const pts = this._arc(a, b, 20);
      const mat = new THREE.LineBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
      line.userData = { from: ai, to: bi, state: 'clean' };
      this.group.add(line);
      this.connections.push({ line, from: ai, to: bi, pts });
    });
  }

  /* ─────────────────────────────────
     BUILD: Flowing particles
  ───────────────────────────────── */
  _buildParticles() {
    const n = this.connections.length;
    const pos = new Float32Array(n * 3);

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.016,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(this.particleGeo, this.particleMat);
    this.group.add(this.particleSystem);

    // Each particle tracks its t-value along its connection's arc
    this.particleT = this.connections.map(() => Math.random());
  }

  /* ═══════════════════════════════════════════════
     STATE MACHINE
  ═══════════════════════════════════════════════ */

  setState(s) {
    if (this.state === s) return;
    this.state = s;

    if (s === 'pristine')     this._toPristine();
    if (s === 'surveillance') this._toSurveillance();
    if (s === 'cascade')      this._toCascade();
    if (s === 'recovery')     this._toRecovery();
  }

  _toPristine() {
    this.earthMat.color.set(0x020d1f);
    this.earthMat.emissive.set(0x000e28);
    this._targetAtmoColor.set(0x0055bb);
    this.gridMat.opacity = 0.22;
    this.nodes.forEach(n => { n.material.opacity = 0; });
    this.connections.forEach(c => { c.line.material.opacity = 0; });
    this.particleMat.opacity = 0;
  }

  _toSurveillance() {
    this.earthMat.color.set(0x010810);
    this.earthMat.emissive.set(0x000820);
    this._targetAtmoColor.set(0x003c99);
    this.gridMat.opacity = 0.38;

    this.nodes.forEach(n => {
      n.material.color.set(0xffd700);
      n.material.opacity = 1;
      n.userData.state = 'clean';
    });
    this.connections.forEach(c => {
      c.line.material.color.set(0xffd700);
      c.line.material.opacity = 0.35;
    });
    this.particleMat.color.set(0xffd700);
    this.particleMat.opacity = 0.8;
  }

  _toCascade() {
    if (this.cascadeArmed) return;
    this.cascadeArmed = true;

    this.infectedSet.clear();
    this.nodes.forEach(n => { n.userData.state = 'clean'; n.material.color.set(0xffd700); });
    this.connections.forEach(c => { c.line.userData.state = 'clean'; c.line.material.color.set(0xffd700); });

    this.earthMat.color.set(0x080007);
    this.earthMat.emissive.set(0x100005);
    this._targetAtmoColor.set(0x550011);

    this._spread(this.originIdx, 0);
  }

  _spread(idx, depth) {
    if (this.infectedSet.has(idx) || depth > 5) return;
    this.infectedSet.add(idx);

    const node = this.nodes[idx];
    node.userData.state = 'infected';

    setTimeout(() => {
      node.material.color.set(0xff2244);
    }, depth * 600);

    const linked = this.connections.filter(c => c.from === idx || c.to === idx);
    linked.forEach((conn, i) => {
      const next = conn.from === idx ? conn.to : conn.from;
      const delay = depth * 600 + (i + 1) * 350;

      setTimeout(() => {
        conn.line.material.color.set(0xff2244);
        conn.line.userData.state = 'infected';
        conn.line.material.opacity = 0.55;
        setTimeout(() => this._spread(next, depth + 1), 250);
      }, delay);
    });
  }

  _toRecovery() {
    this.earthMat.color.set(0x010d08);
    this.earthMat.emissive.set(0x001a0a);
    this._targetAtmoColor.set(0x004422);

    this.nodes.forEach((n, i) => {
      n.material.color.set(this.infectedSet.has(i) ? 0x222222 : 0x00ff88);
      n.material.opacity = 1;
    });

    this.connections.forEach(c => {
      const infected = c.line.userData.state === 'infected';
      c.line.material.color.set(infected ? 0x331111 : 0x00ff88);
      c.line.material.opacity = infected ? 0.08 : 0.28;
    });

    this.particleMat.color.set(0x00ff88);
    this.particleMat.opacity = 0.5;
  }

  /* ═══════════════════════════════════════════════
     ANIMATION LOOP
  ═══════════════════════════════════════════════ */

  _loop() {
    requestAnimationFrame(() => this._loop());
    this.time += 0.008;

    /* Globe rotation — scroll-linked */
    this.group.rotation.y += 0.0008 + this.scrollProg * 0.002;
    this.group.rotation.x = Math.sin(this.time * 0.12) * 0.04;

    /* Atmosphere color lerp */
    this._currentAtmoColor.lerp(this._targetAtmoColor, 0.03);
    this.atmoMat.uniforms.glowColor.value.copy(this._currentAtmoColor);

    /* Node pulse */
    this.nodes.forEach((n, i) => {
      if (n.userData.state === 'infected') {
        const flicker = 0.8 + Math.sin(this.time * 9 + i * 1.3) * 0.4;
        n.scale.setScalar(flicker);
      } else {
        n.scale.setScalar(0.85 + Math.sin(this.time * 1.8 + i * 0.7) * 0.15);
      }
    });

    /* Particle flow */
    this._tickParticles();

    this.renderer.render(this.scene, this.camera);
  }

  _tickParticles() {
    const attr = this.particleGeo.attributes.position;
    const speed = this.state === 'cascade' ? 0.0015 : 0.004;

    this.connections.forEach((conn, i) => {
      this.particleT[i] += speed * (0.8 + Math.random() * 0.4);
      if (this.particleT[i] > 1) this.particleT[i] = 0;

      const t   = this.particleT[i];
      const pts = conn.pts;
      const raw = t * (pts.length - 1);
      const lo  = Math.floor(raw);
      const hi  = Math.min(lo + 1, pts.length - 1);
      const frac = raw - lo;

      const p = new THREE.Vector3().lerpVectors(pts[lo], pts[hi], frac);
      attr.setXYZ(i, p.x, p.y, p.z);
    });

    attr.needsUpdate = true;
  }

  /* ─── Helpers ─── */

  _ll2v3(lat, lon, r = 1.02) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  _arc(a, b, seg = 20) {
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const t   = i / seg;
      const mid = new THREE.Vector3().lerpVectors(a, b, t);
      const alt = 1 + Math.sin(t * Math.PI) * 0.28;
      pts.push(mid.normalize().multiplyScalar(alt));
    }
    return pts;
  }

  _onResize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }
}
