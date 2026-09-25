import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface MathUniverseProps {
  scrollProgress: number; // 0.0 to 1.0
  activeStage?: number;   // 0 to 4 optional override
  onStageChange?: (stage: number, stageName: string) => void;
}

const STAGE_NAMES = [
  '2D Curves → 3D Unfolding',
  'Continuous Wave Formations',
  '3D Vector & Flux Fields',
  'Orbital Gravity Wells',
  'Geometric Hyper-Formations'
];

export const MathUniverse3D: React.FC<MathUniverseProps> = ({
  scrollProgress,
  onStageChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [telemetry, setTelemetry] = useState({
    fps: 60,
    activeEntities: 1800,
    fieldFlux: '14.28 N/C',
    curvature: '-0.042 κ'
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // -----------------------------------------------------------------
    // 01. Scene, Camera, Renderer Setup
    // -----------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFAFCFF); // Clean bright scientific background
    scene.fog = new THREE.FogExp2(0xFAFCFF, 0.018);

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 48);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // -----------------------------------------------------------------
    // 02. Lighting (Bright Laboratory Ambient + Electric Accents)
    // -----------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x0062FF, 2.5);
    keyLight.position.set(30, 40, 50);
    scene.add(keyLight);

    const cyanFill = new THREE.PointLight(0x00E5FF, 3.0, 100);
    cyanFill.position.set(-25, -20, 30);
    scene.add(cyanFill);

    const violetRim = new THREE.PointLight(0x7C3AED, 2.5, 120);
    violetRim.position.set(20, -30, 20);
    scene.add(violetRim);

    // -----------------------------------------------------------------
    // 03. Mouse & Pointer Smooth Tracking
    // -----------------------------------------------------------------
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldY: 0 };
    const onPointerMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // -----------------------------------------------------------------
    // 04. LAYER A: 2D Curve Unfolding into 3D Torus Knot
    // -----------------------------------------------------------------
    const curvePointsCount = 600;
    const curvePositions = new Float32Array(curvePointsCount * 3);
    const curveColors = new Float32Array(curvePointsCount * 3);

    for (let i = 0; i < curvePointsCount; i++) {
      const u = (i / curvePointsCount) * Math.PI * 4;
      // Parametric Torus / Lissajous hybrid
      const p = 3;
      const q = 7;
      const r = 10 + 3 * Math.cos(q * u);
      const x = r * Math.cos(p * u);
      const y = r * Math.sin(p * u);
      const z = 4 * Math.sin(q * u);

      curvePositions[i * 3] = x;
      curvePositions[i * 3 + 1] = y;
      curvePositions[i * 3 + 2] = z;

      // Electric blue to violet gradient
      const t = i / curvePointsCount;
      const c = new THREE.Color().setHSL(0.58 + t * 0.18, 0.95, 0.52);
      curveColors[i * 3] = c.r;
      curveColors[i * 3 + 1] = c.g;
      curveColors[i * 3 + 2] = c.b;
    }

    const curveGeometry = new THREE.BufferGeometry();
    curveGeometry.setAttribute('position', new THREE.BufferAttribute(curvePositions, 3));
    curveGeometry.setAttribute('color', new THREE.BufferAttribute(curveColors, 3));

    const curveMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      linewidth: 2
    });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    // -----------------------------------------------------------------
    // 05. LAYER B: Deformable Spacetime Mathematical Grid
    // -----------------------------------------------------------------
    const gridRes = 36;
    const gridSpacing = 1.6;
    const gridGeo = new THREE.PlaneGeometry(
      gridRes * gridSpacing,
      gridRes * gridSpacing,
      gridRes,
      gridRes
    );
    gridGeo.rotateX(-Math.PI / 2.3);
    gridGeo.translate(0, -14, 0);

    const originalGridPos = gridGeo.attributes.position.array.slice() as Float32Array;
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0062FF,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    scene.add(gridMesh);

    // -----------------------------------------------------------------
    // 06. LAYER C: Dynamic 3D Wave Surface (Fourier Wave Packets)
    // -----------------------------------------------------------------
    const waveRes = 32;
    const waveGeo = new THREE.PlaneGeometry(45, 30, waveRes, waveRes);
    waveGeo.rotateX(-Math.PI / 2.8);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x00E5FF,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
      roughness: 0.2,
      metalness: 0.8
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0, -2, -5);
    scene.add(waveMesh);

    // -----------------------------------------------------------------
    // 07. LAYER D: 3D Vector Field Arrows
    // -----------------------------------------------------------------
    const vectorGroup = new THREE.Group();
    const vectorArrows: { arrow: THREE.ArrowHelper; origin: THREE.Vector3 }[] = [];
    const vGridX = 7;
    const vGridY = 5;
    const vGridZ = 3;

    for (let x = -vGridX; x <= vGridX; x += 2.5) {
      for (let y = -vGridY; y <= vGridY; y += 2.5) {
        for (let z = -vGridZ; z <= vGridZ; z += 3) {
          const origin = new THREE.Vector3(x * 2.2, y * 2.2, z * 2.2);
          const dir = new THREE.Vector3(0, 1, 0);
          const color = new THREE.Color().setHSL(0.55 + (x / 20) * 0.15, 0.9, 0.55);
          const arrow = new THREE.ArrowHelper(dir, origin, 1.8, color.getHex(), 0.5, 0.25);
          (arrow.line.material as THREE.Material).transparent = true;
          (arrow.line.material as THREE.Material).opacity = 0.0;
          (arrow.cone.material as THREE.Material).transparent = true;
          (arrow.cone.material as THREE.Material).opacity = 0.0;
          vectorGroup.add(arrow);
          vectorArrows.push({ arrow, origin });
        }
      }
    }
    scene.add(vectorGroup);

    // -----------------------------------------------------------------
    // 08. LAYER E: Multi-Body Planetary Orbitals & Gravitational Attractors
    // -----------------------------------------------------------------
    const orbitalGroup = new THREE.Group();
    orbitalGroup.visible = false;

    // Central Sun / Heavy Potential Core
    const sunGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0x0062FF,
      emissive: 0x0052D6,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    orbitalGroup.add(sunMesh);

    // Orbits
    const orbitCount = 4;
    const planets: { mesh: THREE.Mesh; r: number; speed: number; angle: number; inc: number }[] = [];

    for (let i = 0; i < orbitCount; i++) {
      const r = 8 + i * 5.5;
      const orbitRingGeo = new THREE.RingGeometry(r - 0.04, r + 0.04, 64);
      const orbitRingMat = new THREE.MeshBasicMaterial({
        color: 0x7C3AED,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
      orbitRing.rotation.x = Math.PI / 2 + (i * 0.15);
      orbitalGroup.add(orbitRing);

      // Planet sphere
      const pGeo = new THREE.SphereGeometry(0.65 + i * 0.15, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x00E5FF : 0xEC4899,
        roughness: 0.3,
        metalness: 0.6
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      orbitalGroup.add(pMesh);

      planets.push({
        mesh: pMesh,
        r,
        speed: (2.5 - i * 0.45) * 0.015,
        angle: (i * Math.PI) / 2,
        inc: (i * 0.15)
      });
    }
    scene.add(orbitalGroup);

    // -----------------------------------------------------------------
    // 09. LAYER F: Geometric Hyper-Formations (Icosahedron & Tesseract)
    // -----------------------------------------------------------------
    const geomGroup = new THREE.Group();
    geomGroup.visible = false;

    const icoGeo = new THREE.IcosahedronGeometry(9, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x0062FF,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    geomGroup.add(icoMesh);

    const innerIcoGeo = new THREE.OctahedronGeometry(5, 0);
    const innerIcoMat = new THREE.MeshStandardMaterial({
      color: 0x7C3AED,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const innerIcoMesh = new THREE.Mesh(innerIcoGeo, innerIcoMat);
    geomGroup.add(innerIcoMesh);

    scene.add(geomGroup);

    // -----------------------------------------------------------------
    // 10. LAYER G: Connected Particle Cloud (Plexus Network)
    // -----------------------------------------------------------------
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 75;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 45;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.025,
        y: (Math.random() - 0.5) * 0.025,
        z: (Math.random() - 0.5) * 0.025
      });
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Crisp circular particles using canvas texture
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(16, 16, 2, 16, 16, 15);
    pGrad.addColorStop(0, '#0062FF');
    pGrad.addColorStop(0.4, '#00E5FF');
    pGrad.addColorStop(1, 'transparent');
    pCtx.fillStyle = pGrad;
    pCtx.beginPath();
    pCtx.arc(16, 16, 15, 0, Math.PI * 2);
    pCtx.fill();

    const pTexture = new THREE.CanvasTexture(particleCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 1.1,
      map: pTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    const particleCloud = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleCloud);

    // Particle Connections (Dynamic Lines)
    const maxConnections = 600;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x0062FF,
      transparent: true,
      opacity: 0.16
    });
    const connectionLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(connectionLines);

    // -----------------------------------------------------------------
    // 11. Coordinate Axes Helper (Custom Precision Axis Lines)
    // -----------------------------------------------------------------
    const axisGroup = new THREE.Group();
    const axisLen = 14;
    // X Axis (Cyan)
    const xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLen, 0x00E5FF, 1.2, 0.5);
    // Y Axis (Electric Blue)
    const yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLen, 0x0062FF, 1.2, 0.5);
    // Z Axis (Violet)
    const zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLen, 0x7C3AED, 1.2, 0.5);
    axisGroup.add(xAxis);
    axisGroup.add(yAxis);
    axisGroup.add(zAxis);
    axisGroup.position.set(-28, -14, 0);
    scene.add(axisGroup);

    // -----------------------------------------------------------------
    // 12. Floating 3D Mathematical Equation Sprites
    // -----------------------------------------------------------------
    const mathSymbols = ['∇·B⃗ = 0', '∮E⃗·dA⃗ = Q/ε₀', 'F⃗ = ma⃗', 'L⃗ = r⃗×p⃗', 'eⁱᵖ + 1 = 0', '∫f(x)dx', 'a_c = v²/R'];
    const symbolSprites: THREE.Sprite[] = [];

    mathSymbols.forEach((sym, idx) => {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 256;
      sCanvas.height = 64;
      const sCtx = sCanvas.getContext('2d')!;
      sCtx.font = 'bold 26px "STIX Two Text", serif';
      sCtx.fillStyle = idx % 2 === 0 ? '#0062FF' : '#7C3AED';
      sCtx.textAlign = 'center';
      sCtx.textBaseline = 'middle';
      sCtx.fillText(sym, 128, 32);

      const sTex = new THREE.CanvasTexture(sCanvas);
      const sMat = new THREE.SpriteMaterial({ map: sTex, transparent: true, opacity: 0.65 });
      const sprite = new THREE.Sprite(sMat);

      const angle = (idx / mathSymbols.length) * Math.PI * 2;
      const rad = 24 + (idx % 3) * 6;
      sprite.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad * 0.7, (Math.random() - 0.5) * 15);
      sprite.scale.set(7, 1.8, 1);
      scene.add(sprite);
      symbolSprites.push(sprite);
    });

    // -----------------------------------------------------------------
    // 13. Window Resize Handler
    // -----------------------------------------------------------------
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // -----------------------------------------------------------------
    // 14. Animation & Continuous Scroll-Morphing Loop (60 FPS)
    // -----------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      clock.getDelta();
      const time = clock.getElapsedTime();

      // FPS Telemetry
      frameCount++;
      if (performance.now() - lastFpsTime > 800) {
        setTelemetry(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (performance.now() - lastFpsTime)),
          fieldFlux: `${(12 + Math.sin(time) * 4).toFixed(2)} N/C`,
          curvature: `${(-0.038 + Math.cos(time * 0.5) * 0.015).toFixed(3)} κ`
        }));
        frameCount = 0;
        lastFpsTime = performance.now();
      }

      // Smooth mouse spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // Camera Parallax & Subtle Drift
      const parallaxX = mouse.x * 4.5;
      const parallaxY = mouse.y * 3.5;
      camera.position.x = parallaxX;
      camera.position.y = parallaxY;
      camera.lookAt(0, 0, 0);

      // Light response
      keyLight.position.x = 30 + mouse.x * 15;
      keyLight.position.y = 40 + mouse.y * 15;

      // -------------------------------------------------------------
      // CINEMATIC SCROLL STAGES BLENDING:
      // Stage 0 (0.0 - 0.20): 2D Curve unfolds into 3D structure
      // Stage 1 (0.20 - 0.40): Waves Formations & Riemann Ripples
      // Stage 2 (0.40 - 0.60): 3D Vector Fields & Flux Lines
      // Stage 3 (0.60 - 0.80): Orbital Keplerian Systems
      // Stage 4 (0.80 - 1.00): Hyper-Geometric Formations
      // -------------------------------------------------------------
      const s = Math.max(0, Math.min(1, scrollProgress));
      const currentStage = Math.min(4, Math.floor(s * 5));
      if (onStageChange) {
        onStageChange(currentStage, STAGE_NAMES[currentStage]);
      }

      // 1. Morph Curve (2D flat Z -> 3D Torus amplitude -> disperse)
      const curvePositionsArr = curveGeometry.attributes.position.array as Float32Array;
      const zExpansion = Math.min(1.0, s * 4.0); // 0 -> 1 as you start scrolling
      const curveFade = s < 0.35 ? 1.0 : Math.max(0, 1.0 - (s - 0.35) * 4);
      curveMaterial.opacity = curveFade * 0.85;

      for (let i = 0; i < curvePointsCount; i++) {
        const u = (i / curvePointsCount) * Math.PI * 4 + time * 0.25;
        const p = 3;
        const q = 7;
        const r = 10 + 3 * Math.cos(q * u);
        const x = r * Math.cos(p * u);
        const y = r * Math.sin(p * u);
        const targetZ = 5 * Math.sin(q * u);

        // Z expands smoothly from 0 (2D) to targetZ (3D)
        curvePositionsArr[i * 3] = x;
        curvePositionsArr[i * 3 + 1] = y;
        curvePositionsArr[i * 3 + 2] = targetZ * zExpansion;
      }
      curveGeometry.attributes.position.needsUpdate = true;
      curveLine.rotation.z = time * 0.08 + mouse.x * 0.2;
      curveLine.rotation.y = time * 0.05 + mouse.y * 0.2;

      // 2. Deform Spacetime Grid with Pointer & Mass
      const gridPosArr = gridGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < gridPosArr.length; i += 3) {
        const ox = originalGridPos[i];
        const oy = originalGridPos[i + 1];
        const distToMouse = Math.hypot(ox - mouse.x * 18, oy - mouse.y * 14);
        const dip = Math.exp(-distToMouse * 0.12) * 5.5;
        const wave = Math.sin(ox * 0.18 + time) * Math.cos(oy * 0.18 + time) * 0.8;
        gridPosArr[i + 2] = originalGridPos[i + 2] - dip + wave;
      }
      gridGeo.attributes.position.needsUpdate = true;

      // 3. Wave Formations Layer (Stage 1: 0.15 - 0.45)
      const waveVisibility = Math.max(0, 1 - Math.abs(s - 0.3) * 5.0);
      waveMat.opacity = waveVisibility * 0.65;
      if (waveVisibility > 0.01) {
        waveMesh.visible = true;
        const wavePosArr = waveGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < wavePosArr.length; i += 3) {
          const wx = wavePosArr[i];
          const wy = wavePosArr[i + 1];
          // Double Fourier interference wave
          const z1 = Math.sin(wx * 0.35 + time * 1.8) * 2.2;
          const z2 = Math.cos(wy * 0.45 + time * 2.2) * 1.8;
          wavePosArr[i + 2] = z1 + z2;
        }
        waveGeo.attributes.position.needsUpdate = true;
        waveMesh.rotation.z = time * 0.05;
      } else {
        waveMesh.visible = false;
      }

      // 4. Vector Field Arrows (Stage 2: 0.35 - 0.65)
      const vectorVisibility = Math.max(0, 1 - Math.abs(s - 0.5) * 5.0);
      if (vectorVisibility > 0.01) {
        vectorGroup.visible = true;
        vectorArrows.forEach(({ arrow, origin }) => {
          (arrow.line.material as THREE.Material).opacity = vectorVisibility * 0.55;
          (arrow.cone.material as THREE.Material).opacity = vectorVisibility * 0.75;

          // Point towards dynamic attractor + cursor
          const target = new THREE.Vector3(mouse.x * 20, mouse.y * 15, 0);
          const dir = target.sub(origin).normalize();
          arrow.setDirection(dir);
        });
      } else {
        vectorGroup.visible = false;
      }

      // 5. Orbital Systems Layer (Stage 3: 0.55 - 0.85)
      const orbitalVisibility = Math.max(0, 1 - Math.abs(s - 0.7) * 5.0);
      if (orbitalVisibility > 0.01) {
        orbitalGroup.visible = true;
        orbitalGroup.position.set(0, 0, 0);
        planets.forEach(p => {
          p.angle += p.speed;
          p.mesh.position.x = Math.cos(p.angle) * p.r;
          p.mesh.position.z = Math.sin(p.angle) * p.r;
          p.mesh.position.y = Math.sin(p.angle * 2) * (p.r * 0.2);
        });
        orbitalGroup.rotation.y = time * 0.05;
        orbitalGroup.rotation.x = Math.PI * 0.15 + mouse.y * 0.2;
      } else {
        orbitalGroup.visible = false;
      }

      // 6. Hyper-Geometric Formations Layer (Stage 4: 0.75 - 1.0)
      const geomVisibility = Math.max(0, (s - 0.75) * 4.0);
      if (geomVisibility > 0.01) {
        geomGroup.visible = true;
        icoMat.opacity = geomVisibility * 0.7;
        innerIcoMat.opacity = geomVisibility * 0.85;
        icoMesh.rotation.x = time * 0.2 + mouse.y * 0.4;
        icoMesh.rotation.y = time * 0.25 + mouse.x * 0.4;
        innerIcoMesh.rotation.x = -time * 0.35;
        innerIcoMesh.rotation.y = -time * 0.4;
      } else {
        geomGroup.visible = false;
      }

      // 7. Update Connected Particle Cloud (Inertia & Dynamic Connections)
      const pArr = particlesGeo.attributes.position.array as Float32Array;
      let lineIndex = 0;

      for (let i = 0; i < particleCount; i++) {
        pArr[i * 3] += particleVelocities[i].x;
        pArr[i * 3 + 1] += particleVelocities[i].y;
        pArr[i * 3 + 2] += particleVelocities[i].z;

        // Boundaries bounce
        if (Math.abs(pArr[i * 3]) > 38) particleVelocities[i].x *= -1;
        if (Math.abs(pArr[i * 3 + 1]) > 28) particleVelocities[i].y *= -1;
        if (Math.abs(pArr[i * 3 + 2]) > 25) particleVelocities[i].z *= -1;

        // Subtle cursor attraction/repulsion
        const dx = pArr[i * 3] - mouse.x * 25;
        const dy = pArr[i * 3 + 1] - mouse.y * 20;
        const distToCursor = Math.hypot(dx, dy);
        if (distToCursor < 12) {
          pArr[i * 3] += (dx / distToCursor) * 0.15;
          pArr[i * 3 + 1] += (dy / distToCursor) * 0.15;
        }

        // Connect nearby particles with lines
        for (let j = i + 1; j < Math.min(i + 14, particleCount); j++) {
          const d = Math.hypot(
            pArr[i * 3] - pArr[j * 3],
            pArr[i * 3 + 1] - pArr[j * 3 + 1],
            pArr[i * 3 + 2] - pArr[j * 3 + 2]
          );

          if (d < 7.5 && lineIndex < maxConnections * 6 - 6) {
            linePositions[lineIndex++] = pArr[i * 3];
            linePositions[lineIndex++] = pArr[i * 3 + 1];
            linePositions[lineIndex++] = pArr[i * 3 + 2];
            linePositions[lineIndex++] = pArr[j * 3];
            linePositions[lineIndex++] = pArr[j * 3 + 1];
            linePositions[lineIndex++] = pArr[j * 3 + 2];
          }
        }
      }
      particlesGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.position.needsUpdate = true;

      // 8. Subtle drift for mathematical symbol sprites
      symbolSprites.forEach((sp, idx) => {
        sp.position.y += Math.sin(time + idx) * 0.008;
      });

      renderer.render(scene, camera);
    };

    animate();

    // -----------------------------------------------------------------
    // Cleanup on Component Unmount
    // -----------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      curveGeometry.dispose();
      curveMaterial.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      particlesGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      pTexture.dispose();
    };
  }, [scrollProgress, onStageChange]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {/* Real-time Laboratory 3D Telemetry Badge */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 98, 255, 0.16)',
          borderRadius: '9999px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 18px rgba(0, 98, 255, 0.08)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981'
            }}
          />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            WebGL 2.0 • {telemetry.fps} FPS
          </span>
        </div>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span>Flux: <strong style={{ color: 'var(--electric-blue)' }}>{telemetry.fieldFlux}</strong></span>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <span>Curvature: <strong style={{ color: 'var(--electric-violet)' }}>{telemetry.curvature}</strong></span>
      </div>
    </div>
  );
};
