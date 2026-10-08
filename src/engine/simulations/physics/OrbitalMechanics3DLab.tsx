import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Orbit,
  Play,
  Pause,
  RotateCcw,
  Rocket,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

export interface OrbitalMechanics3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const OrbitalMechanics3DLab: React.FC<OrbitalMechanics3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: externalSpeed,
  onParamChange,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeWarp, setTimeWarp] = useState<number>(1.0);
  const [targetEccentricity, setTargetEccentricity] = useState<number>(0.35);
  const [targetSemiMajorAxis, setTargetSemiMajorAxis] = useState<number>(8.0);
  const [labMode, setLabMode] = useState<'kepler' | 'hohmann' | 'vectors'>('kepler');

  // Synchronize state with incoming external params from the control settings panel
  useEffect(() => {
    if (!params) return;
    if (params.eccentricity !== undefined && Math.abs(params.eccentricity - targetEccentricity) > 0.001) {
      setTargetEccentricity(params.eccentricity);
    }
    if (params.semiMajorAxis !== undefined && Math.abs(params.semiMajorAxis - targetSemiMajorAxis) > 0.01) {
      setTargetSemiMajorAxis(params.semiMajorAxis);
    }
    if (params.timeWarp !== undefined && Math.abs(params.timeWarp - timeWarp) > 0.01) {
      setTimeWarp(params.timeWarp);
    }
  }, [params]);

  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  useEffect(() => {
    if (externalSpeed !== undefined && externalSpeed > 0) {
      setTimeWarp(externalSpeed);
    }
  }, [externalSpeed]);

  const onTelemetryUpdateRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    onTelemetryUpdateRef.current = onTelemetryUpdate;
  }, [onTelemetryUpdate]);

  // Visual Toggles
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showAreas, setShowAreas] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Real-time Telemetry State
  const [telemetry, setTelemetry] = useState({
    distanceR: '1.24 AU',
    velocityV: '29.78 km/s',
    periodT: '1.38 yrs',
    perihelion: '0.81 AU',
    aphelion: '1.68 AU',
    orbitalEnergy: '-148.2 MJ/kg',
    arealVelocity: '2.45 AU²/yr'
  });

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const probeMeshRef = useRef<THREE.Mesh | null>(null);
  const velocityArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const forceArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const trailLineRef = useRef<THREE.Line | null>(null);
  const orbitEllipseLineRef = useRef<THREE.Line | null>(null);
  const sectorMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Synchronized parameter refs for uninterrupted 60FPS animation loop
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const timeWarpRef = useRef(timeWarp);
  useEffect(() => { timeWarpRef.current = timeWarp; }, [timeWarp]);

  const showVectorsRef = useRef(showVectors);
  useEffect(() => { showVectorsRef.current = showVectors; }, [showVectors]);

  const showAreasRef = useRef(showAreas);
  useEffect(() => { showAreasRef.current = showAreas; }, [showAreas]);

  const showTrailsRef = useRef(showTrails);
  useEffect(() => { showTrailsRef.current = showTrails; }, [showTrails]);

  const isAutoRotatingRef = useRef(isAutoRotating);
  useEffect(() => { isAutoRotatingRef.current = isAutoRotating; }, [isAutoRotating]);

  // Time and angle tracking refs
  const simTimeRef = useRef<number>(0);
  const mouseStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.55,
    rotY: 0.78,
    zoom: 26
  });

  // Astronomical physics constants (scaled for numerical stability in 3D scene)
  const GM = 100.0; // Standard gravitational parameter

  // Calculated orbital metrics for current probe parameters
  const orbitalMetrics = useMemo(() => {
    const a = targetSemiMajorAxis;
    const e = Math.min(0.85, Math.max(0.0, targetEccentricity));
    const rPeri = a * (1 - e);
    const rAph = a * (1 + e);
    const period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / GM);
    const energy = -GM / (2 * a);
    const angularMom = Math.sqrt(GM * a * (1 - e * e));

    return {
      a,
      e,
      rPeri,
      rAph,
      period,
      energy,
      angularMom
    };
  }, [targetSemiMajorAxis, targetEccentricity]);

  const orbitalMetricsRef = useRef(orbitalMetrics);
  useEffect(() => {
    orbitalMetricsRef.current = orbitalMetrics;
  }, [orbitalMetrics]);

  // Set up Three.js 3D Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene, Camera, High-Precision WebGL Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep cosmic void
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 24);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Realistic Cosmic Lighting: Central Sun Emissive Glow & Fill
    const sunLight = new THREE.PointLight(0xfff4d6, 3.2, 120, 0.8);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x223355, 0.6);
    scene.add(ambientLight);

    // 3. Central Sun: Emissive Plasma Sphere with Corona Glow
    const sunGeo = new THREE.SphereGeometry(1.6, 36, 36);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Solar Corona Halo
    const coronaGeo = new THREE.SphereGeometry(2.3, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // 4. Background Starfield Skybox
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 140 + Math.random() * 80;
      starPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = dist * Math.cos(phi);

      const tint = Math.random();
      starColors[i * 3] = 0.8 + tint * 0.2;
      starColors[i * 3 + 1] = 0.85 + tint * 0.15;
      starColors[i * 3 + 2] = 1.0;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.85 });
    const starsPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starsPoints);

    // 5. Reference Orbital Plane Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x0062ff, 0x112244);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 6. Earth (Reference Inner Orbit)
    const earthOrbitR = 5.0;
    const earthOrbitGeo = new THREE.BufferGeometry();
    const earthOrbitPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const th = (i / 100) * Math.PI * 2;
      earthOrbitPts.push(new THREE.Vector3(earthOrbitR * Math.cos(th), 0, earthOrbitR * Math.sin(th)));
    }
    earthOrbitGeo.setFromPoints(earthOrbitPts);
    const earthOrbitLine = new THREE.Line(
      earthOrbitGeo,
      new THREE.LineBasicMaterial({ color: 0x00a8ff, transparent: true, opacity: 0.35 })
    );
    scene.add(earthOrbitLine);

    const earthMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x0088ff, roughness: 0.5, metalness: 0.1 })
    );
    scene.add(earthMesh);

    // 7. Mars (Reference Outer Orbit)
    const marsOrbitR = 9.5;
    const marsOrbitGeo = new THREE.BufferGeometry();
    const marsOrbitPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const th = (i / 100) * Math.PI * 2;
      marsOrbitPts.push(new THREE.Vector3(marsOrbitR * Math.cos(th), 0, marsOrbitR * Math.sin(th)));
    }
    marsOrbitGeo.setFromPoints(marsOrbitPts);
    const marsOrbitLine = new THREE.Line(
      marsOrbitGeo,
      new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.3 })
    );
    scene.add(marsOrbitLine);

    const marsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8, metalness: 0.1 })
    );
    scene.add(marsMesh);

    // 8. Interactive Probe / Spacecraft Mesh
    const probeGeo = new THREE.SphereGeometry(0.35, 18, 18);
    const probeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x005577,
      roughness: 0.3,
      metalness: 0.7
    });
    const probeMesh = new THREE.Mesh(probeGeo, probeMat);
    scene.add(probeMesh);
    probeMeshRef.current = probeMesh;

    // 9. Force & Velocity Vectors
    const velArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2.5, 0x00e5ff, 0.6, 0.3);
    scene.add(velArrow);
    velocityArrowRef.current = velArrow;

    const forceArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), 2.5, 0xef4444, 0.6, 0.3);
    scene.add(forceArrow);
    forceArrowRef.current = forceArrow;

    // 10. Probe Elliptical Orbit Path Line
    const orbitPathGeo = new THREE.BufferGeometry();
    const orbitPathMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.7, linewidth: 2 });
    const orbitPathLine = new THREE.Line(orbitPathGeo, orbitPathMat);
    scene.add(orbitPathLine);
    orbitEllipseLineRef.current = orbitPathLine;

    // 11. Orbital History Trail
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.6 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);
    trailLineRef.current = trailLine;

    // 12. Swept-out Area Sector Geometry for Kepler's 2nd Law
    const sectorGeo = new THREE.BufferGeometry();
    const sectorMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const sectorMesh = new THREE.Mesh(sectorGeo, sectorMat);
    scene.add(sectorMesh);
    sectorMeshRef.current = sectorMesh;

    // 13. Interactive Mouse & Touch Controls for Orbit View
    const handleMouseDown = (e: MouseEvent) => {
      mouseStateRef.current.isDragging = true;
      mouseStateRef.current.prevX = e.clientX;
      mouseStateRef.current.prevY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseStateRef.current.isDragging) return;
      const dx = e.clientX - mouseStateRef.current.prevX;
      const dy = e.clientY - mouseStateRef.current.prevY;
      mouseStateRef.current.rotY += dx * 0.008;
      mouseStateRef.current.rotX = Math.max(0.1, Math.min(Math.PI / 2.1, mouseStateRef.current.rotX + dy * 0.008));
      mouseStateRef.current.prevX = e.clientX;
      mouseStateRef.current.prevY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseStateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      mouseStateRef.current.zoom = Math.max(10, Math.min(65, mouseStateRef.current.zoom + e.deltaY * 0.035));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        mouseStateRef.current.isDragging = true;
        mouseStateRef.current.prevX = e.touches[0].clientX;
        mouseStateRef.current.prevY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!mouseStateRef.current.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - mouseStateRef.current.prevX;
      const dy = e.touches[0].clientY - mouseStateRef.current.prevY;
      mouseStateRef.current.rotY += dx * 0.008;
      mouseStateRef.current.rotX = Math.max(0.1, Math.min(Math.PI / 2.1, mouseStateRef.current.rotX + dy * 0.008));
      mouseStateRef.current.prevX = e.touches[0].clientX;
      mouseStateRef.current.prevY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      mouseStateRef.current.isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Handle Window / Container Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Trail history points
    const trailPoints: THREE.Vector3[] = [];

    // Animation & Physics Loop
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Auto-rotation of view if enabled and not dragging
      if (isAutoRotatingRef.current && !mouseStateRef.current.isDragging) {
        mouseStateRef.current.rotY += 0.005;
      }

      // Update Camera Spherical Orbit around Focus
      const { rotX, rotY, zoom } = mouseStateRef.current;
      camera.position.x = zoom * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = zoom * Math.sin(rotX);
      camera.position.z = zoom * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      // Rotate Sun Corona
      coronaMesh.rotation.y += 0.003;
      sunMesh.rotation.y += 0.001;

      // Update Earth & Mars orbits
      const earthTheta = now * 0.0006;
      earthMesh.position.set(earthOrbitR * Math.cos(earthTheta), 0, earthOrbitR * Math.sin(earthTheta));

      const marsTheta = now * 0.00032;
      marsMesh.position.set(marsOrbitR * Math.cos(marsTheta), 0, marsOrbitR * Math.sin(marsTheta));

      // Advance Simulation Time for Probe
      if (isPlayingRef.current) {
        simTimeRef.current += dt * timeWarpRef.current * 1.8;
      }

      // Calculate Probe Keplerian State
      const curMetrics = orbitalMetricsRef.current;
      const a = curMetrics.a;
      const e = curMetrics.e;
      const n = Math.sqrt(GM / Math.pow(a, 3)); // Mean motion
      const M = (n * simTimeRef.current) % (2 * Math.PI); // Mean anomaly

      // Solve Kepler's Equation M = E - e * sin(E) using Newton-Raphson
      let E_anom = M;
      for (let iter = 0; iter < 5; iter++) {
        const dE = (E_anom - e * Math.sin(E_anom) - M) / (1 - e * Math.cos(E_anom));
        E_anom -= dE;
        if (Math.abs(dE) < 1e-6) break;
      }

      // True anomaly theta
      const trueAnomaly = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E_anom / 2), Math.sqrt(1 - e) * Math.cos(E_anom / 2));

      // Radial distance r
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));
      const px = r * Math.cos(trueAnomaly);
      const pz = r * Math.sin(trueAnomaly);

      // Probe position
      probeMesh.position.set(px, 0, pz);

      // Velocity magnitude & direction: v = sqrt(GM * (2/r - 1/a))
      const vMag = Math.sqrt(Math.max(0.1, GM * (2.0 / r - 1.0 / a)));
      const vRadial = (Math.sqrt(GM / (a * (1 - e * e))) * e * Math.sin(trueAnomaly));
      const vTransverse = (Math.sqrt(GM / (a * (1 - e * e))) * (1 + e * Math.cos(trueAnomaly)));
      const vx = vRadial * Math.cos(trueAnomaly) - vTransverse * Math.sin(trueAnomaly);
      const vz = vRadial * Math.sin(trueAnomaly) + vTransverse * Math.cos(trueAnomaly);
      const vDir = new THREE.Vector3(vx, 0, vz).normalize();

      // Gravitational Force direction toward Sun at (0, 0, 0)
      const forceDir = new THREE.Vector3(-px, 0, -pz).normalize();
      const forceMag = (GM / (r * r)) * 0.45;

      // Update Vectors
      velArrow.position.set(px, 0, pz);
      velArrow.setDirection(vDir);
      velArrow.setLength(Math.min(5.5, vMag * 0.6), 0.5, 0.25);
      velArrow.visible = showVectorsRef.current;

      forceArrow.position.set(px, 0, pz);
      forceArrow.setDirection(forceDir);
      forceArrow.setLength(Math.min(4.5, forceMag), 0.5, 0.25);
      forceArrow.visible = showVectorsRef.current;

      // Update Trail
      if (showTrailsRef.current && isPlayingRef.current) {
        trailPoints.push(new THREE.Vector3(px, 0, pz));
        if (trailPoints.length > 180) trailPoints.shift();
        trailGeo.setFromPoints(trailPoints);
        trailLine.visible = true;
      } else if (!showTrailsRef.current) {
        trailLine.visible = false;
      }

      // Update Swept Area Sector (Kepler's Second Law)
      if (showAreasRef.current) {
        const sectorVertices: number[] = [];
        const startTh = trueAnomaly - 0.38;
        const endTh = trueAnomaly;
        const steps = 18;

        for (let i = 0; i < steps; i++) {
          const th1 = startTh + (i / steps) * (endTh - startTh);
          const th2 = startTh + ((i + 1) / steps) * (endTh - startTh);
          const r1 = (a * (1 - e * e)) / (1 + e * Math.cos(th1));
          const r2 = (a * (1 - e * e)) / (1 + e * Math.cos(th2));

          // Triangle: Sun(0,0,0) -> Pt1 -> Pt2
          sectorVertices.push(0, 0.02, 0);
          sectorVertices.push(r1 * Math.cos(th1), 0.02, r1 * Math.sin(th1));
          sectorVertices.push(r2 * Math.cos(th2), 0.02, r2 * Math.sin(th2));
        }

        sectorGeo.setAttribute('position', new THREE.Float32BufferAttribute(sectorVertices, 3));
        sectorGeo.computeVertexNormals();
        sectorMesh.visible = true;
      } else {
        sectorMesh.visible = false;
      }

      // Update Telemetry Display State periodically (every 5 frames)
      if (Math.round(now) % 5 === 0) {
        const rAU = (r / 5.0).toFixed(2);
        const vKmS = (vMag * 5.8).toFixed(1);
        const periodYrs = (curMetrics.period / 12.5).toFixed(2);
        const rPeriAU = (curMetrics.rPeri / 5.0).toFixed(2);
        const rAphAU = (curMetrics.rAph / 5.0).toFixed(2);

        const telemData = {
          distanceR: `${rAU} AU (${(parseFloat(rAU) * 149.6).toFixed(1)}M km)`,
          velocityV: `${vKmS} km/s`,
          periodT: `${periodYrs} Earth Yrs`,
          perihelion: `${rPeriAU} AU`,
          aphelion: `${rAphAU} AU`,
          orbitalEnergy: `${curMetrics.energy.toFixed(1)} MJ/kg`,
          arealVelocity: `${(curMetrics.angularMom * 0.5).toFixed(2)} AU²/yr`
        };
        setTelemetry(telemData);
        onTelemetryUpdateRef.current?.(telemData);
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      coronaGeo.dispose();
      coronaMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      earthOrbitGeo.dispose();
      marsOrbitGeo.dispose();
      probeGeo.dispose();
      probeMat.dispose();
      orbitPathGeo.dispose();
      orbitPathMat.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      sectorGeo.dispose();
      sectorMat.dispose();
    };
  }, []);

  // Direct Button Camera Controls
  const handleRotateLeft = () => { mouseStateRef.current.rotY += 0.35; };
  const handleRotateRight = () => { mouseStateRef.current.rotY -= 0.35; };
  const handleTiltUp = () => { mouseStateRef.current.rotX = Math.max(0.1, mouseStateRef.current.rotX - 0.2); };
  const handleTiltDown = () => { mouseStateRef.current.rotX = Math.min(Math.PI / 2.1, mouseStateRef.current.rotX + 0.2); };
  const handleZoomIn = () => { mouseStateRef.current.zoom = Math.max(10, mouseStateRef.current.zoom - 3.5); };
  const handleZoomOut = () => { mouseStateRef.current.zoom = Math.min(65, mouseStateRef.current.zoom + 3.5); };
  const handleResetCamera = () => {
    mouseStateRef.current.rotX = 0.55;
    mouseStateRef.current.rotY = 0.78;
    mouseStateRef.current.zoom = 26;
  };

  // Update Orbit Path line when orbital parameters change
  useEffect(() => {
    if (!orbitEllipseLineRef.current) return;
    const a = orbitalMetrics.a;
    const e = orbitalMetrics.e;
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const th = (i / segments) * Math.PI * 2;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(th));
      pts.push(new THREE.Vector3(r * Math.cos(th), 0, r * Math.sin(th)));
    }
    orbitEllipseLineRef.current.geometry.setFromPoints(pts);
  }, [orbitalMetrics]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)'
      }}
    >
      {/* 1. Scientific Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(15, 23, 42, 0.96)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#FFFFFF',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #FF6600, #FF0055)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255, 102, 0, 0.4)'
            }}
          >
            <Orbit size={20} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              3D Solar Orbital Mechanics &amp; Kepler's Laws Laboratory
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Interactive N-body celestial dynamics • Gravitational force vectors • Equal swept-out areas
            </p>
          </div>
        </div>

        {/* Global Playback & Reset Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-sm"
            style={{
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isPlaying ? '#EF4444' : '#10B981',
              border: `1px solid ${isPlaying ? '#EF4444' : '#10B981'}`,
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Sim' : 'Resume Sim'}</span>
          </button>

          <button
            onClick={() => {
              setTargetEccentricity(0.0);
              setTargetSemiMajorAxis(8.0);
              setTimeWarp(1.0);
              simTimeRef.current = 0;
            }}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-pill)', gap: 6 }}
            title="Reset to Circular Orbit"
          >
            <RotateCcw size={14} />
            <span>Reset Circular</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Canvas Viewport + Interactive Overlay HUD */}
      <div style={{ position: 'relative', width: '100%', height: 560, background: '#060913' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Top-Left Viewport Mode Pills */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            zIndex: 10,
            display: 'flex',
            gap: 8,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: 5,
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => {
              setLabMode('kepler');
              setShowAreas(true);
            }}
            style={{
              background: labMode === 'kepler' ? '#0062FF' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Kepler's Laws
          </button>
          <button
            onClick={() => {
              setLabMode('hohmann');
              setTargetSemiMajorAxis(7.25);
              setTargetEccentricity(0.31);
            }}
            style={{
              background: labMode === 'hohmann' ? '#FF6600' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Rocket size={12} />
            Hohmann Transfer
          </button>
          <button
            onClick={() => {
              setLabMode('vectors');
              setShowVectors(true);
            }}
            style={{
              background: labMode === 'vectors' ? '#7C3AED' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Force &amp; Velocity Vectors
          </button>
        </div>

        {/* Top-Right Visual Toggle Checkboxes */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            zIndex: 10,
            display: 'flex',
            gap: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.74rem',
            color: '#FFFFFF'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showVectors} onChange={(e) => setShowVectors(e.target.checked)} />
            <span>Vectors (F &amp; v)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showAreas} onChange={(e) => setShowAreas(e.target.checked)} />
            <span>Swept Area (dA/dt)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} />
            <span>Orbit Trail</span>
          </label>
        </div>

        {/* Floating 3D Camera Controls Widget */}
        <div
          style={{
            position: 'absolute',
            top: 58,
            right: 16,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 14,
            padding: '7px 9px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
            userSelect: 'none'
          }}
        >
          <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3D Orbit Controls
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 26px)', gridTemplateRows: 'repeat(3, 26px)', gap: 3, alignItems: 'center', justifyItems: 'center' }}>
            <div />
            <button
              type="button"
              onClick={handleTiltUp}
              title="Tilt Up"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronUp size={14} />
            </button>
            <div />

            <button
              type="button"
              onClick={handleRotateLeft}
              title="Rotate Left"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              title="Reset 3D View"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(0, 229, 255, 0.2)', border: '1px solid rgba(0, 229, 255, 0.4)', color: '#00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Compass size={13} />
            </button>
            <button
              type="button"
              onClick={handleRotateRight}
              title="Rotate Right"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={14} />
            </button>

            <div />
            <button
              type="button"
              onClick={handleTiltDown}
              title="Tilt Down"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronDown size={14} />
            </button>
            <div />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', marginTop: 2 }}>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In (+)"
              style={{ flex: 1, height: 24, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 2, fontSize: '0.66rem', fontWeight: 700 }}
            >
              <ZoomIn size={11} />
              <span>+</span>
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out (−)"
              style={{ flex: 1, height: 24, borderRadius: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 2, fontSize: '0.66rem', fontWeight: 700 }}
            >
              <ZoomOut size={11} />
              <span>−</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              title={isAutoRotating ? 'Pause Spin' : 'Auto-Spin'}
              style={{ height: 24, padding: '0 6px', borderRadius: 6, background: isAutoRotating ? '#00E5FF' : 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: isAutoRotating ? '#000000' : '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 3, fontSize: '0.66rem', fontWeight: 800 }}
            >
              {isAutoRotating ? <Pause size={10} /> : <Play size={10} />}
              <span>Spin</span>
            </button>
          </div>
        </div>

        {/* Bottom Floating Telemetry HUD */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 16,
            right: 16,
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 98, 255, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            color: '#FFFFFF'
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Instant Distance (r)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
              {telemetry.distanceR}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Orbital Velocity (v)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              {telemetry.velocityV}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Orbital Period (T)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              {telemetry.periodT}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Perihelion / Aphelion
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#EC4899', fontFamily: 'var(--font-mono)' }}>
              {telemetry.perihelion} / {telemetry.aphelion}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Specific Energy (ε)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#A78BFA', fontFamily: 'var(--font-mono)' }}>
              {telemetry.orbitalEnergy}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Laboratory Physical Controls Panel */}
      <div
        style={{
          padding: '24px',
          background: 'var(--bg-card)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        {/* Control 1: Eccentricity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Orbital Eccentricity (e)
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0062FF', fontFamily: 'var(--font-mono)' }}>
              {targetEccentricity.toFixed(2)} {targetEccentricity === 0 ? '(Circular)' : targetEccentricity > 0.6 ? '(Cometary)' : '(Elliptical)'}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.82"
            step="0.02"
            value={targetEccentricity}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTargetEccentricity(v);
              onParamChange?.('eccentricity', v);
            }}
            style={{ width: '100%', accentColor: '#0062FF' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>0.0 (Circle)</span>
            <span>0.20 (Earth ~0.017)</span>
            <span>0.50</span>
            <span>0.82 (High Ellipse)</span>
          </div>
        </div>

        {/* Control 2: Semi-Major Axis Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Semi-Major Axis (a)
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              {(targetSemiMajorAxis / 5.0).toFixed(2)} AU ({targetSemiMajorAxis.toFixed(1)} Sim Units)
            </span>
          </div>
          <input
            type="range"
            min="4.0"
            max="12.0"
            step="0.25"
            value={targetSemiMajorAxis}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTargetSemiMajorAxis(v);
              onParamChange?.('semiMajorAxis', v);
            }}
            style={{ width: '100%', accentColor: '#10B981' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>0.8 AU (Venus)</span>
            <span>1.0 AU (Earth)</span>
            <span>1.52 AU (Mars)</span>
            <span>2.4 AU (Asteroid)</span>
          </div>
        </div>

        {/* Control 3: Simulation Time Warp */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Simulation Time Warp
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              {timeWarp.toFixed(1)}x Realtime
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.5"
            step="0.1"
            value={timeWarp}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTimeWarp(v);
              onParamChange?.('timeWarp', v);
            }}
            style={{ width: '100%', accentColor: '#F59E0B' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>0.2x Slow-Mo</span>
            <span>1.0x Normal</span>
            <span>2.0x Fast</span>
            <span>3.5x Rapid</span>
          </div>
        </div>
      </div>

      {/* 4. Rigorous KaTeX Theory & Keplerian First-Principles */}
      <div
        style={{
          padding: '20px 24px',
          background: 'rgba(15, 23, 42, 0.03)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 20
        }}
      >
        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Kepler's First &amp; Third Laws
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            Planets move in ellipses with the Sun at one focus. The square of orbital period T is directly proportional to the cube of semi-major axis a.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="T^2 = \frac{4\pi^2}{GM} a^3 \quad \bullet \quad r(\theta) = \frac{a(1 - e^2)}{1 + e \cos\theta}" />
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Kepler's Second Law &amp; Vis-Viva Equation
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            A radius vector sweeps out equal areas in equal intervals of time due to conservation of angular momentum L. Instantaneous velocity follows Vis-Viva.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="\frac{dA}{dt} = \frac{L}{2m} = \text{const} \quad \bullet \quad v = \sqrt{GM\left(\frac{2}{r} - \frac{1}{a}\right)}" />
          </div>
        </div>
      </div>
    </div>
  );
};
