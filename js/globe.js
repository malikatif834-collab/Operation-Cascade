/* ═══════════════════════════════════════════════════
   OPERATION CASCADE — THREE.JS GLOBE
   White/silver sphere, slow rotation, red arcs.
   ═══════════════════════════════════════════════════ */

window.Cascade = window.Cascade || {};

(function () {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  /* ── Scene / Camera ── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 2.8;

  /* ── Lights ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(2, 1.5, 2);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xcc1a1a, 0.6, 10);
  rimLight.position.set(-3, 0.5, -1);
  scene.add(rimLight);

  /* ── Globe group ── */
  const globe = new THREE.Group();
  scene.add(globe);

  /* Base sphere */
  const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0xe2e6eb,
    shininess: 40,
    specular: 0xffffff,
  });
  globe.add(new THREE.Mesh(sphereGeo, sphereMat));

  /* Lat/lon wireframe on a coarser sphere */
  const wireGeo = new THREE.SphereGeometry(1.001, 18, 12);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x9aa5b4,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  globe.add(new THREE.Mesh(wireGeo, wireMat));

  /* Atmosphere — slightly larger back-face sphere */
  const atmoGeo = new THREE.SphereGeometry(1.08, 32, 32);
  const atmoMat = new THREE.MeshPhongMaterial({
    color: 0xdde4f0,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  globe.add(new THREE.Mesh(atmoGeo, atmoMat));

  /* ── Red arcs ── */
  // Each arc defined as [lat1, lon1, lat2, lon2] in degrees
  const ARC_DEFS = [
    [51.5,  -0.1,   40.7,  -74.0],  // London → New York
    [48.8,   2.3,   35.7,  139.7],  // Paris → Tokyo
    [45.4,  -75.7,  51.5,   -0.1],  // Ottawa → London
    [35.7,  139.7, -33.9,  151.2],  // Tokyo → Sydney
    [40.7,  -74.0,  19.4,  -99.1],  // New York → Mexico City
    [55.7,   37.6,  48.8,    2.3],  // Moscow → Paris
    [1.35,  103.8,  22.3,  114.2],  // Singapore → Hong Kong
    [31.2,  121.5,  37.6,  126.9],  // Shanghai → Seoul
  ];

  function latLonToVec3(lat, lon, r) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  ARC_DEFS.forEach(([la1, lo1, la2, lo2]) => {
    const p0 = latLonToVec3(la1, lo1, 1.01);
    const p2 = latLonToVec3(la2, lo2, 1.01);
    const mid = p0.clone().add(p2).multiplyScalar(0.5);
    const lift = mid.clone().normalize().multiplyScalar(1.4);
    const curve = new THREE.QuadraticBezierCurve3(p0, lift, p2);
    const points = curve.getPoints(60);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xe31a1a,
      transparent: true,
      opacity: 0.75,
    });
    globe.add(new THREE.Line(geo, mat));
  });

  /* ── Node dots at arc endpoints ── */
  const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xe31a1a });
  const uniquePts = new Set();
  ARC_DEFS.forEach(([la1, lo1, la2, lo2]) => {
    [[la1, lo1], [la2, lo2]].forEach(([la, lo]) => {
      const key = `${la},${lo}`;
      if (!uniquePts.has(key)) {
        uniquePts.add(key);
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(latLonToVec3(la, lo, 1.015));
        globe.add(dot);
      }
    });
  });

  /* ── Animation ── */
  let animPaused = false;
  function animate() {
    requestAnimationFrame(animate);
    if (!animPaused) globe.rotation.y += 0.0012;
    renderer.render(scene, camera);
  }
  animate();

  /* ── Resize ── */
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  /* ── GSAP intro (fires after GSAP loads) ── */
  window.Cascade.initGlobe = function () {
    if (typeof gsap === 'undefined') return;
    gsap.from(canvas, {
      opacity: 0,
      scale: 0.85,
      duration: 1.4,
      ease: 'power3.out',
      delay: 0.3,
    });
  };
})();
