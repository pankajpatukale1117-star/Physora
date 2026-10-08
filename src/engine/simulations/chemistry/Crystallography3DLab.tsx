import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

export interface Crystallography3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

type LatticeType = 'SC' | 'BCC' | 'FCC' | 'DIAMOND' | 'HCP';

export const Crystallography3DLab: React.FC<Crystallography3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: _externalSpeed,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xrdCanvasRef = useRef<HTMLCanvasElement>(null);

  // Core Crystallographic Parameters
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [latticeType, setLatticeType] = useState<LatticeType>('FCC');
  const [latticeConstantA, setLatticeConstantA] = useState<number>(4.05); // Angstroms (e.g. Aluminum ~ 4.05 A)
  const [hIndex, setHIndex] = useState<number>(1);
  const [kIndex, setKIndex] = useState<number>(1);
  const [lIndex, setLIndex] = useState<number>(1);
  const [atomicRadiusRatio, setAtomicRadiusRatio] = useState<number>(0.65); // 0.2 (Ball-and-stick) to 1.0 (Hard-sphere)
  const [cellRepeat, setCellRepeat] = useState<number>(1); // 1x1x1 or 2x2x2
  const [showMillerPlane, setShowMillerPlane] = useState<boolean>(true);
  const [showUnitCellBox, setShowUnitCellBox] = useState<boolean>(true);

  useEffect(() => {
    if (externalIsPlaying !== undefined) setIsPlaying(externalIsPlaying);
  }, [externalIsPlaying]);

  // Sync external parameters from control drawer
  useEffect(() => {
    if (!params) return;
    if (params.latticeType !== undefined) {
      const types: LatticeType[] = ['SC', 'BCC', 'FCC', 'DIAMOND', 'HCP'];
      const idx = Math.min(types.length - 1, Math.max(0, Math.round(params.latticeType)));
      if (types[idx] && types[idx] !== latticeType) {
        setLatticeType(types[idx]);
      }
    }
    if (params.hIndex !== undefined && Math.round(params.hIndex) !== hIndex) {
      setHIndex(Math.round(params.hIndex));
    }
    if (params.kIndex !== undefined && Math.round(params.kIndex) !== kIndex) {
      setKIndex(Math.round(params.kIndex));
    }
    if (params.lIndex !== undefined && Math.round(params.lIndex) !== lIndex) {
      setLIndex(Math.round(params.lIndex));
    }
    if (params.atomicRadius !== undefined && Math.abs(params.atomicRadius - atomicRadiusRatio) > 0.02) {
      setAtomicRadiusRatio(params.atomicRadius);
    }
    if (params.latticeConstant !== undefined && Math.abs(params.latticeConstant - latticeConstantA) > 0.05) {
      setLatticeConstantA(params.latticeConstant);
    }
    if (params.cellRepeat !== undefined && Math.round(params.cellRepeat) !== cellRepeat) {
      setCellRepeat(Math.round(params.cellRepeat));
    }
  }, [params]);

  // Derived Crystallography Telemetry
  const telemetry = useMemo(() => {
    // Interplanar spacing d_hkl = a / sqrt(h^2 + k^2 + l^2)
    const h2k2l2 = hIndex * hIndex + kIndex * kIndex + lIndex * lIndex;
    const dSpacing = h2k2l2 > 0 ? latticeConstantA / Math.sqrt(h2k2l2) : latticeConstantA;

    // Bragg condition: lambda = 1.5406 A (Cu K-alpha). 2*theta = 2*arcsin(lambda / (2*d))
    const lambdaCu = 1.5406;
    const sinTheta = lambdaCu / (2 * dSpacing);
    const twoThetaDeg = sinTheta <= 1.0 ? ((2 * Math.asin(sinTheta) * 180) / Math.PI) : null;

    let coordNum = 6;
    let apf = 0.524;
    let latticeName = 'Simple Cubic (SC)';

    if (latticeType === 'BCC') {
      coordNum = 8;
      apf = 0.680;
      latticeName = 'Body-Centered Cubic (BCC)';
    } else if (latticeType === 'FCC') {
      coordNum = 12;
      apf = 0.740;
      latticeName = 'Face-Centered Cubic (FCC)';
    } else if (latticeType === 'DIAMOND') {
      coordNum = 4;
      apf = 0.340;
      latticeName = 'Diamond Cubic';
    } else if (latticeType === 'HCP') {
      coordNum = 12;
      apf = 0.740;
      latticeName = 'Hexagonal Close-Packed (HCP)';
    }

    return {
      latticeName,
      coordNum: `${coordNum}`,
      apf: `${(apf * 100).toFixed(1)}%`,
      dSpacing: `${dSpacing.toFixed(3)} Å`,
      twoTheta: twoThetaDeg ? `${twoThetaDeg.toFixed(2)}°` : 'Extinct (No Bragg Reflection)',
      millerNotation: `(${hIndex} ${kIndex} ${lIndex})`
    };
  }, [latticeType, latticeConstantA, hIndex, kIndex, lIndex]);

  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        lattice: telemetry.latticeName,
        coordination: telemetry.coordNum,
        apf: telemetry.apf,
        d_hkl: telemetry.dSpacing,
        bragg_2theta: telemetry.twoTheta,
        plane: telemetry.millerNotation
      });
    }
  }, [telemetry, onTelemetryUpdate]);

  // Draw Powder XRD Spectrum on canvas
  useEffect(() => {
    const canvas = xrdCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark sleek background
    ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 30; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, h - 22);
      ctx.stroke();
    }

    // Baseline noise
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, h - 24);

    // Generate characteristic peaks for current lattice
    const lambdaCu = 1.5406;
    const peaks: { hkl: [number, number, number]; label: string; intensity: number }[] = [];

    if (latticeType === 'FCC') {
      peaks.push({ hkl: [1, 1, 1], label: '(111)', intensity: 1.0 });
      peaks.push({ hkl: [2, 0, 0], label: '(200)', intensity: 0.52 });
      peaks.push({ hkl: [2, 2, 0], label: '(220)', intensity: 0.35 });
      peaks.push({ hkl: [3, 1, 1], label: '(311)', intensity: 0.38 });
      peaks.push({ hkl: [2, 2, 2], label: '(222)', intensity: 0.15 });
    } else if (latticeType === 'BCC') {
      peaks.push({ hkl: [1, 1, 0], label: '(110)', intensity: 1.0 });
      peaks.push({ hkl: [2, 0, 0], label: '(200)', intensity: 0.20 });
      peaks.push({ hkl: [2, 1, 1], label: '(211)', intensity: 0.38 });
      peaks.push({ hkl: [2, 2, 0], label: '(220)', intensity: 0.12 });
    } else {
      peaks.push({ hkl: [1, 0, 0], label: '(100)', intensity: 0.8 });
      peaks.push({ hkl: [1, 1, 0], label: '(110)', intensity: 1.0 });
      peaks.push({ hkl: [1, 1, 1], label: '(111)', intensity: 0.6 });
      peaks.push({ hkl: [2, 0, 0], label: '(200)', intensity: 0.4 });
    }

    // Draw baseline
    for (let x = 10; x <= w - 10; x += 3) {
      const twoTheta = 10 + ((x - 10) / (w - 20)) * 80;
      let yIntensity = 4 + Math.sin(x * 0.4) * 1.5;

      peaks.forEach(p => {
        const h2 = p.hkl[0] ** 2 + p.hkl[1] ** 2 + p.hkl[2] ** 2;
        const d = latticeConstantA / Math.sqrt(h2);
        const sTheta = lambdaCu / (2 * d);
        if (sTheta <= 1.0) {
          const peak2Theta = (2 * Math.asin(sTheta) * 180) / Math.PI;
          const dist = Math.abs(twoTheta - peak2Theta);
          if (dist < 3.5) {
            yIntensity += p.intensity * 48 * Math.exp(-(dist * dist) / 0.8);
          }
        }
      });

      const yPixel = h - 22 - yIntensity;
      ctx.lineTo(x, yPixel);
    }
    ctx.stroke();

    // Highlight current active (hkl) peak
    const activeH2 = hIndex ** 2 + kIndex ** 2 + lIndex ** 2;
    if (activeH2 > 0) {
      const dActive = latticeConstantA / Math.sqrt(activeH2);
      const sActive = lambdaCu / (2 * dActive);
      if (sActive <= 1.0) {
        const peak2T = (2 * Math.asin(sActive) * 180) / Math.PI;
        if (peak2T >= 10 && peak2T <= 90) {
          const xActive = 10 + ((peak2T - 10) / 80) * (w - 20);
          ctx.strokeStyle = '#f59e0b';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(xActive, 10);
          ctx.lineTo(xActive, h - 22);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`(${hIndex}${kIndex}${lIndex})`, xActive - 12, 14);
        }
      }
    }

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('10°', 10, h - 8);
    ctx.fillText('2θ Bragg Angle (Cu-Kα)', w / 2 - 50, h - 8);
    ctx.fillText('90°', w - 24, h - 8);
  }, [latticeType, latticeConstantA, hIndex, kIndex, lIndex]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const crystalGroupRef = useRef<THREE.Group | null>(null);
  const millerPlaneMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Camera Orbit Interaction
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.65,
    phi: 0.45,
    radius: 14
  });
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(12, 18, 14);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-10, -12, -8);
    scene.add(dirLight2);

    // Crystal group
    const crystalGroup = new THREE.Group();
    scene.add(crystalGroup);
    crystalGroupRef.current = crystalGroup;

    // Dynamic Miller Plane mesh
    const planeGeo = new THREE.BufferGeometry();
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1
    });
    const millerMesh = new THREE.Mesh(planeGeo, planeMat);
    scene.add(millerMesh);
    millerPlaneMeshRef.current = millerMesh;

    // Resize handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (crystalGroupRef.current && isPlaying) {
        crystalGroupRef.current.rotation.y += 0.002;
        if (millerPlaneMeshRef.current) {
          millerPlaneMeshRef.current.rotation.y = crystalGroupRef.current.rotation.y;
        }
      }

      const cam = cameraRef.current;
      if (cam) {
        const { theta, phi, radius } = cameraAngleRef.current;
        cam.position.set(
          radius * Math.cos(phi) * Math.sin(theta),
          radius * Math.sin(phi),
          radius * Math.cos(phi) * Math.cos(theta)
        );
        cam.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D Crystal Lattice whenever type, radius, or supercell changes
  useEffect(() => {
    const group = crystalGroupRef.current;
    if (!group) return;

    // Clear previous atoms & bonds
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const L = 3.6; // Visual unit cell side length
    const offset = -(L * cellRepeat) / 2;

    // Determine atom positions inside one unit cell (0 to 1 normalized)
    const unitAtoms: { pos: THREE.Vector3; color: number }[] = [];

    // Corners (8 atoms)
    const corners = [
      [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
      [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]
    ];
    corners.forEach(c => unitAtoms.push({ pos: new THREE.Vector3(...c), color: 0x38bdf8 }));

    if (latticeType === 'BCC') {
      // Body Center (1 atom)
      unitAtoms.push({ pos: new THREE.Vector3(0.5, 0.5, 0.5), color: 0xa855f7 });
    } else if (latticeType === 'FCC') {
      // Face Centers (6 atoms)
      const faces = [
        [0.5, 0.5, 0], [0.5, 0.5, 1],
        [0.5, 0, 0.5], [0.5, 1, 0.5],
        [0, 0.5, 0.5], [1, 0.5, 0.5]
      ];
      faces.forEach(f => unitAtoms.push({ pos: new THREE.Vector3(...f), color: 0x10b981 }));
    } else if (latticeType === 'DIAMOND') {
      // FCC + 4 tetrahedral interstitials
      const faces = [
        [0.5, 0.5, 0], [0.5, 0.5, 1],
        [0.5, 0, 0.5], [0.5, 1, 0.5],
        [0, 0.5, 0.5], [1, 0.5, 0.5]
      ];
      faces.forEach(f => unitAtoms.push({ pos: new THREE.Vector3(...f), color: 0x10b981 }));
      const interstitials = [
        [0.25, 0.25, 0.25], [0.75, 0.75, 0.25],
        [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]
      ];
      interstitials.forEach(it => unitAtoms.push({ pos: new THREE.Vector3(...it), color: 0xec4899 }));
    } else if (latticeType === 'HCP') {
      // Hexagonal basis
      unitAtoms.push({ pos: new THREE.Vector3(0.33, 0.5, 0.33), color: 0xf59e0b });
      unitAtoms.push({ pos: new THREE.Vector3(0.66, 0.5, 0.66), color: 0xf59e0b });
    }

    // Calculate maximum touching radius
    let maxR = 0.5 * L;
    if (latticeType === 'BCC') maxR = (Math.sqrt(3) / 4) * L;
    if (latticeType === 'FCC') maxR = (Math.sqrt(2) / 4) * L;
    if (latticeType === 'DIAMOND') maxR = (Math.sqrt(3) / 8) * L;

    const atomR = Math.max(0.12 * L, maxR * atomicRadiusRatio);
    const atomGeo = new THREE.SphereGeometry(atomR, 24, 24);

    // Duplicate across unit cells
    const placedPositions: THREE.Vector3[] = [];

    for (let cx = 0; cx < cellRepeat; cx++) {
      for (let cy = 0; cy < cellRepeat; cy++) {
        for (let cz = 0; cz < cellRepeat; cz++) {
          unitAtoms.forEach(u => {
            const worldPos = new THREE.Vector3(
              offset + (cx + u.pos.x) * L,
              offset + (cy + u.pos.y) * L,
              offset + (cz + u.pos.z) * L
            );

            // Avoid duplicates on shared cell boundaries
            const isDup = placedPositions.some(p => p.distanceTo(worldPos) < 0.05);
            if (!isDup) {
              placedPositions.push(worldPos);
              const mat = new THREE.MeshStandardMaterial({
                color: u.color,
                roughness: 0.25,
                metalness: 0.4
              });
              const mesh = new THREE.Mesh(atomGeo, mat);
              mesh.position.copy(worldPos);
              group.add(mesh);
            }
          });

          // Draw Unit Cell Wireframe Box
          if (showUnitCellBox) {
            const boxGeo = new THREE.BoxGeometry(L, L, L);
            const edges = new THREE.EdgesGeometry(boxGeo);
            const line = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35 })
            );
            line.position.set(
              offset + (cx + 0.5) * L,
              offset + (cy + 0.5) * L,
              offset + (cz + 0.5) * L
            );
            group.add(line);
          }
        }
      }
    }
  }, [latticeType, atomicRadiusRatio, cellRepeat, showUnitCellBox]);

  // Update Miller Indices Plane Polygon
  useEffect(() => {
    const mesh = millerPlaneMeshRef.current;
    if (!mesh) return;

    if (!showMillerPlane) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    const L = 3.6; // Unit cell size
    const offset = -L / 2;

    // Normal vector n = (h, k, l)
    const normal = new THREE.Vector3(hIndex, kIndex, lIndex);
    if (normal.lengthSq() === 0) {
      mesh.visible = false;
      return;
    }
    normal.normalize();

    // Generate plane polygon cutting through unit cell [-L/2, L/2]^3
    const vertices: number[] = [];
    const h = hIndex || 0.001;
    const k = kIndex || 0.001;
    const l = lIndex || 0.001;

    // Find intercepts on cell boundaries
    const d = 0.5; // Plane distance parameter
    const p1 = new THREE.Vector3(offset + (d / h) * L, offset, offset);
    const p2 = new THREE.Vector3(offset, offset + (d / k) * L, offset);
    const p3 = new THREE.Vector3(offset, offset, offset + (d / l) * L);

    // Construct triangular or quad facet
    vertices.push(p1.x, p1.y, p1.z);
    vertices.push(p2.x, p2.y, p2.z);
    vertices.push(p3.x, p3.y, p3.z);

    const geo = mesh.geometry;
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
  }, [hIndex, kIndex, lIndex, showMillerPlane]);

  // Pointer & Drag Controls for 3D Camera Orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - lastPointerPosRef.current.x;
    const dy = e.clientY - lastPointerPosRef.current.y;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    cameraAngleRef.current.theta -= dx * 0.007;
    cameraAngleRef.current.phi = Math.max(-1.4, Math.min(1.4, cameraAngleRef.current.phi + dy * 0.007));
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(6, Math.min(35, cameraAngleRef.current.radius + e.deltaY * 0.02));
  };

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.65, phi: 0.45, radius: 14 };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#060914',
        overflow: 'hidden',
        userSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Viewport */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Top Left Flagship Badge & Theoretical Formulation */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          background: 'rgba(6, 12, 28, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          maxWidth: 380,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            Solid State &amp; Materials
          </span>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            3D Crystallography &amp; Miller Indices
          </h3>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
          Bravais cubic unit cells, atomic packing fraction (APF), crystal plane slicing via Miller Indices $(hkl)$, and Powder X-ray diffraction (XRD) Bragg peaks.
        </div>

        <div
          style={{
            marginTop: 8,
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}
        >
          <span style={{ color: '#00f0ff', fontWeight: 600 }}>Interplanar Spacing:</span>
          <MathView math="d_{hkl} = \frac{a}{\sqrt{h^2 + k^2 + l^2}}" block={false} />
        </div>
      </div>

      {/* Top Right Live Crystallography Telemetry Readout */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 20,
          background: 'rgba(6, 12, 28, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          minWidth: 240,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8 }}>
          Lattice &amp; Plane Telemetry
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: '0.76rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>System</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{latticeType}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Coordination No.</div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.coordNum}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Packing Factor (APF)</div>
            <div style={{ color: '#00f0ff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.apf}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Miller Plane (hkl)</div>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.millerNotation}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Spacing d_hkl</div>
            <div style={{ color: '#a855f7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.dSpacing}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>XRD Peak 2θ</div>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.twoTheta}</div>
          </div>
        </div>
      </div>

      {/* Bottom Center Simulated Powder XRD Spectrum HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(6, 12, 28, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
            Simulated Cu-Kα Powder XRD Spectrum (λ = 1.5406 Å)
          </span>
          <span style={{ fontSize: '0.70rem', color: '#f59e0b', fontWeight: 700 }}>
            Active Plane: {telemetry.millerNotation}
          </span>
        </div>
        <canvas ref={xrdCanvasRef} width={380} height={70} style={{ borderRadius: '4px', display: 'block' }} />
      </div>

      {/* Floating 3D Navigation & Controls (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn btn-secondary btn-xs"
          style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}
          title={isPlaying ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          onClick={() => setShowMillerPlane(!showMillerPlane)}
          className={`btn btn-xs ${showMillerPlane ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '3px 9px', fontSize: '0.72rem' }}
          title="Toggle Miller Cutting Plane"
        >
          Miller Plane
        </button>
        <button
          onClick={() => setShowUnitCellBox(!showUnitCellBox)}
          className={`btn btn-xs ${showUnitCellBox ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '3px 9px', fontSize: '0.72rem' }}
          title="Toggle Unit Cell Box"
        >
          Cell Frame
        </button>
        <button
          onClick={handleResetCamera}
          className="btn btn-secondary btn-xs"
          style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}
          title="Reset Camera"
        >
          <Compass size={13} />
        </button>
      </div>
    </div>
  );
};
