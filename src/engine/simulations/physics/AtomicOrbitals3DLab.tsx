import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Atom,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

interface OrbitalPreset {
  id: string;
  name: string;
  n: number;
  l: number;
  m: number;
  label: string;
  harmonic: string;
  radialNodes: number;
  angularNodes: number;
  description: string;
}

const PRESETS: OrbitalPreset[] = [
  {
    id: '1s',
    name: '1s Ground State',
    n: 1,
    l: 0,
    m: 0,
    label: '1s (n=1, l=0, m=0)',
    harmonic: 'Y_{0}^{0} = \\frac{1}{\\sqrt{4\\pi}}',
    radialNodes: 0,
    angularNodes: 0,
    description: 'Spherical symmetry with maximum probability density at the nucleus. Lowest energy bound state (E₁ = -13.6 eV).'
  },
  {
    id: '2s',
    name: '2s Excited State',
    n: 2,
    l: 0,
    m: 0,
    label: '2s (n=2, l=0, m=0)',
    harmonic: 'Y_{0}^{0} = \\frac{1}{\\sqrt{4\\pi}}',
    radialNodes: 1,
    angularNodes: 0,
    description: 'Concentric spherical shells separated by 1 spherical radial node at r = 2 a₀ where electron density drops to zero.'
  },
  {
    id: '2pz',
    name: '2p_z Orbital',
    n: 2,
    l: 1,
    m: 0,
    label: '2p_z (n=2, l=1, m=0)',
    harmonic: 'Y_{1}^{0} = \\sqrt{\\frac{3}{4\\pi}} \\cos\\theta',
    radialNodes: 0,
    angularNodes: 1,
    description: 'Dumbbell-shaped dual lobes oriented along the z-axis with opposite quantum wavefunction phases (+ψ in cyan, -ψ in crimson).'
  },
  {
    id: '2px',
    name: '2p_x Orbital',
    n: 2,
    l: 1,
    m: 1,
    label: '2p_x (n=2, l=1, m=±1)',
    harmonic: 'Y_{1}^{1} = \\sqrt{\\frac{3}{8\\pi}} \\sin\\theta \\cos\\phi',
    radialNodes: 0,
    angularNodes: 1,
    description: 'Oriented along the x-axis, with a planar angular node on the yz-plane (x = 0).'
  },
  {
    id: '3dz2',
    name: '3d_z² Orbital',
    n: 3,
    l: 2,
    m: 0,
    label: '3d_z² (n=3, l=2, m=0)',
    harmonic: 'Y_{2}^{0} = \\sqrt{\\frac{5}{16\\pi}} (3\\cos^2\\theta - 1)',
    radialNodes: 0,
    angularNodes: 2,
    description: 'Characteristic dual lobes along the z-axis encircled by an equatorial toroidal ring (donut lobe) with 2 conical nodal surfaces.'
  },
  {
    id: '3dxy',
    name: '3d_xy Cloverleaf',
    n: 3,
    l: 2,
    m: -2,
    label: '3d_xy (n=3, l=2, m=-2)',
    harmonic: 'Y_{2}^{-2} = \\sqrt{\\frac{15}{16\\pi}} \\sin^2\\theta \\sin 2\\phi',
    radialNodes: 0,
    angularNodes: 2,
    description: 'Four cloverleaf lobes lying in the xy-plane with two perpendicular planar nodes along the x and y axes.'
  },
  {
    id: '3dx2y2',
    name: '3d_x²-y² Orbital',
    n: 3,
    l: 2,
    m: 2,
    label: '3d_x²-y² (n=3, l=2, m=+2)',
    harmonic: 'Y_{2}^{2} = \\sqrt{\\frac{15}{16\\pi}} \\sin^2\\theta \\cos 2\\phi',
    radialNodes: 0,
    angularNodes: 2,
    description: 'Four lobes pointing directly along the x and y axes, critical in octahedral transition metal crystal field theory.'
  },
  {
    id: '4fz3',
    name: '4f_z³ Orbital',
    n: 4,
    l: 3,
    m: 0,
    label: '4f_z³ (n=4, l=3, m=0)',
    harmonic: 'Y_{3}^{0} = \\sqrt{\\frac{7}{16\\pi}} (5\\cos^3\\theta - 3\\cos\\theta)',
    radialNodes: 0,
    angularNodes: 3,
    description: 'Complex 6-lobed fundamental f-orbital with 3 angular nodal cones, defining lanthanide and actinide chemistry.'
  }
];

export interface AtomicOrbitals3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const AtomicOrbitals3DLab: React.FC<AtomicOrbitals3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  onParamChange,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Orbital Configuration
  const [selectedPresetId, setSelectedPresetId] = useState<string>('2pz');
  const [renderMode, setRenderMode] = useState<'cloud' | 'isosurface' | 'nodal'>('cloud');
  const pointCloudDensity = 18000;
  const [cutawaySlice, setCutawaySlice] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const isRotatingRef = useRef(isRotating);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  // Synchronize with external params from the control settings drawer
  useEffect(() => {
    if (!params) return;
    const n = Math.round(params.principalN ?? 2);
    const l = Math.round(params.angularL ?? 1);
    const m = Math.round(params.magneticM ?? 0);

    const match = PRESETS.find(p => p.n === n && p.l === l && p.m === m)
      || PRESETS.find(p => p.n === n && p.l === l)
      || PRESETS.find(p => p.n === n)
      || PRESETS[0];

    if (match && match.id !== selectedPresetId) {
      setSelectedPresetId(match.id);
    }
  }, [params]);

  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsRotating(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  // Photon Quantum Jump State
  const [isEmittingPhoton, setIsEmittingPhoton] = useState<boolean>(false);
  const [activeTransition, setActiveTransition] = useState<{ from: number; to: number; lambda: string; name: string } | null>(null);

  // References for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cloudPointsRef = useRef<THREE.Points | null>(null);
  const nodalGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number>(0);

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[2],
    [selectedPresetId]
  );

  // Quantum Energy Level Calculation
  const quantumMetrics = useMemo(() => {
    const n = activePreset.n;
    const l = activePreset.l;
    const energy = -13.6 / (n * n);
    const radialNodes = n - l - 1;
    const angularNodes = l;
    const totalNodes = n - 1;
    const degeneracy = n * n;
    const rMaxBohr = n * n; // Peak of radial probability distribution

    return {
      energy: energy.toFixed(2),
      radialNodes,
      angularNodes,
      totalNodes,
      degeneracy,
      rMaxBohr: rMaxBohr.toFixed(1)
    };
  }, [activePreset]);

  // Telemetry reporting to control settings panel
  useEffect(() => {
    onTelemetryUpdate?.({
      energy: `${quantumMetrics.energy} eV`,
      radialNodes: `${quantumMetrics.radialNodes} Spherical`,
      angularNodes: `${quantumMetrics.angularNodes} Planar/Conical`,
      rMax: `${quantumMetrics.rMaxBohr} a₀`
    });
  }, [quantumMetrics, onTelemetryUpdate]);

  // Mouse interaction state for orbital orbit
  const mouseStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.35,
    rotY: 0.65,
    zoom: 24
  });

  // Quantum wave function evaluator: returns [psi_value, sign]
  const evaluateWavefunction = (
    r: number,
    theta: number,
    phi: number,
    n: number,
    l: number,
    _m: number,
    presetId: string
  ): { psi: number; sign: number } => {
    // 1. Radial Part R_nl(r)
    let R = 0;
    const rho = (2 * r) / n;
    const expTerm = Math.exp(-rho / 2);

    if (n === 1 && l === 0) {
      R = 2 * Math.exp(-r);
    } else if (n === 2 && l === 0) {
      R = (1 / Math.sqrt(8)) * (2 - r) * expTerm;
    } else if (n === 2 && l === 1) {
      R = (1 / Math.sqrt(24)) * r * expTerm;
    } else if (n === 3 && l === 0) {
      R = (2 / (81 * Math.sqrt(3))) * (27 - 18 * r + 2 * r * r) * expTerm;
    } else if (n === 3 && l === 1) {
      R = (4 / (81 * Math.sqrt(6))) * (6 * r - r * r) * expTerm;
    } else if (n === 3 && l === 2) {
      R = (4 / (81 * Math.sqrt(30))) * r * r * expTerm;
    } else if (n === 4 && l === 3) {
      R = (1 / 768) * Math.pow(r, 3) * expTerm;
    } else {
      R = Math.pow(r, l) * expTerm;
    }

    // 2. Real Angular Part Y_lm(theta, phi)
    let Y = 0;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    if (presetId === '1s' || presetId === '2s') {
      Y = 1 / Math.sqrt(4 * Math.PI);
    } else if (presetId === '2pz') {
      Y = Math.sqrt(3 / (4 * Math.PI)) * cosT;
    } else if (presetId === '2px') {
      Y = Math.sqrt(3 / (4 * Math.PI)) * sinT * Math.cos(phi);
    } else if (presetId === '3dz2') {
      Y = Math.sqrt(5 / (16 * Math.PI)) * (3 * cosT * cosT - 1);
    } else if (presetId === '3dxy') {
      Y = Math.sqrt(15 / (16 * Math.PI)) * sinT * sinT * Math.sin(2 * phi);
    } else if (presetId === '3dx2y2') {
      Y = Math.sqrt(15 / (16 * Math.PI)) * sinT * sinT * Math.cos(2 * phi);
    } else if (presetId === '4fz3') {
      Y = Math.sqrt(7 / (16 * Math.PI)) * (5 * Math.pow(cosT, 3) - 3 * cosT);
    } else {
      Y = cosT;
    }

    const psi = R * Y;
    const sign = psi >= 0 ? 1 : -1;
    return { psi, sign };
  };

  // Set up Three.js 3D Quantum Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060c); // Quantum deep space
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 16, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x334466, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00e5ff, 2.5);
    keyLight.position.set(20, 30, 20);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff0055, 2.0);
    rimLight.position.set(-20, -10, -20);
    scene.add(rimLight);

    // 3. Central Nucleus (Proton / Neutron cluster sphere)
    const nucleusGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffdd00,
      emissive: 0xff8800,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    scene.add(nucleusMesh);

    // 4. Subtle 3D Coordinate Cartesian Axes
    const axesGroup = new THREE.Group();
    const axisLen = 14;
    // X-axis (Red)
    const xLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-axisLen, 0, 0), new THREE.Vector3(axisLen, 0, 0)]),
      new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.25 })
    );
    // Y-axis (Green)
    const yLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -axisLen, 0), new THREE.Vector3(0, axisLen, 0)]),
      new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.25 })
    );
    // Z-axis (Blue)
    const zLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -axisLen), new THREE.Vector3(0, 0, axisLen)]),
      new THREE.LineBasicMaterial({ color: 0x0062ff, transparent: true, opacity: 0.25 })
    );
    axesGroup.add(xLine, yLine, zLine);
    scene.add(axesGroup);

    // 5. Generate Volumetric Probability Density Point Cloud (Monte Carlo Sampling)
    const pointCount = pointCloudDensity;
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    let ptIdx = 0;
    const maxR = activePreset.n * 5.2;

    for (let attempts = 0; attempts < pointCount * 6 && ptIdx < pointCount; attempts++) {
      // Rejection sampling in spherical coordinates
      const r = Math.pow(Math.random(), 0.5) * maxR;
      const costh = 2 * Math.random() - 1;
      const theta = Math.acos(costh);
      const phi = Math.random() * Math.PI * 2;

      const { psi, sign } = evaluateWavefunction(
        r,
        theta,
        phi,
        activePreset.n,
        activePreset.l,
        activePreset.m,
        activePreset.id
      );

      const prob = Math.min(1.0, psi * psi * 48.0);

      if (Math.random() < prob) {
        // Cutaway slice if enabled (remove quadrant y > 0 and x > 0)
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta); // Align z-quantum axis to Three.js Y
        const z = r * Math.sin(theta) * Math.sin(phi);

        if (cutawaySlice && x > 0 && z > 0) continue;

        positions[ptIdx * 3] = x;
        positions[ptIdx * 3 + 1] = y;
        positions[ptIdx * 3 + 2] = z;

        // Phase Coloration: +psi -> Cyan (#00E5FF), -psi -> Crimson (#FF0055)
        if (sign > 0) {
          colors[ptIdx * 3] = 0.0;
          colors[ptIdx * 3 + 1] = 0.9;
          colors[ptIdx * 3 + 2] = 1.0;
        } else {
          colors[ptIdx * 3] = 1.0;
          colors[ptIdx * 3 + 1] = 0.0;
          colors[ptIdx * 3 + 2] = 0.35;
        }

        ptIdx++;
      }
    }

    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions.subarray(0, ptIdx * 3), 3));
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(colors.subarray(0, ptIdx * 3), 3));

    const cloudMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const cloudPoints = new THREE.Points(cloudGeo, cloudMat);
    scene.add(cloudPoints);
    cloudPointsRef.current = cloudPoints;

    // 6. Nodal Surfaces Group
    const nodalGroup = new THREE.Group();
    if (activePreset.radialNodes > 0) {
      // Draw radial node sphere
      const nodeR = 2.0 * 2.0; // r = 2 a0 for 2s
      const nodeGeo = new THREE.SphereGeometry(nodeR, 28, 28);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        wireframe: true,
        transparent: true,
        opacity: 0.18
      });
      nodalGroup.add(new THREE.Mesh(nodeGeo, nodeMat));
    }
    if (activePreset.angularNodes > 0) {
      // Draw planar angular node
      const planeGeo = new THREE.PlaneGeometry(16, 16);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      if (activePreset.id === '2pz') planeMesh.rotateX(Math.PI / 2);
      nodalGroup.add(planeMesh);
    }
    scene.add(nodalGroup);
    nodalGroupRef.current = nodalGroup;
    nodalGroup.visible = renderMode === 'nodal';

    // 7. Mouse Orbit Controls
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
      mouseStateRef.current.rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, mouseStateRef.current.rotX + dy * 0.008));
      mouseStateRef.current.prevX = e.clientX;
      mouseStateRef.current.prevY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseStateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      mouseStateRef.current.zoom = Math.max(8, Math.min(60, mouseStateRef.current.zoom + e.deltaY * 0.03));
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
      mouseStateRef.current.rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, mouseStateRef.current.rotX + dy * 0.008));
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

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.015;

      // Update Camera Spherical Orbit
      const { rotX, rotY, zoom } = mouseStateRef.current;
      camera.position.x = zoom * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = zoom * Math.sin(rotX);
      camera.position.z = zoom * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      // Auto-rotation of the quantum orbital
      if (isRotatingRef.current && cloudPoints) {
        cloudPoints.rotation.y += 0.004;
        if (nodalGroup) nodalGroup.rotation.y += 0.004;
      }

      // Nucleus pulse
      nucleusMesh.scale.setScalar(1 + Math.sin(time * 3) * 0.06);

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup
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
      cloudGeo.dispose();
      cloudMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
    };
  }, [activePreset, renderMode, cutawaySlice, pointCloudDensity]);

  // Direct Button Camera Controls
  const handleRotateLeft = () => { mouseStateRef.current.rotY += 0.35; };
  const handleRotateRight = () => { mouseStateRef.current.rotY -= 0.35; };
  const handleTiltUp = () => { mouseStateRef.current.rotX = Math.max(-Math.PI / 2.2, mouseStateRef.current.rotX - 0.2); };
  const handleTiltDown = () => { mouseStateRef.current.rotX = Math.min(Math.PI / 2.2, mouseStateRef.current.rotX + 0.2); };
  const handleZoomIn = () => { mouseStateRef.current.zoom = Math.max(8, mouseStateRef.current.zoom - 3.5); };
  const handleZoomOut = () => { mouseStateRef.current.zoom = Math.min(60, mouseStateRef.current.zoom + 3.5); };
  const handleResetCamera = () => {
    mouseStateRef.current.rotX = 0.35;
    mouseStateRef.current.rotY = 0.65;
    mouseStateRef.current.zoom = 24;
  };

  // Trigger simulated photon emission
  const triggerTransition = (fromN: number, toN: number, lambda: string, name: string) => {
    setActiveTransition({ from: fromN, to: toN, lambda, name });
    setIsEmittingPhoton(true);
    setTimeout(() => {
      setIsEmittingPhoton(false);
    }, 2800);
  };

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
              background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 229, 255, 0.4)'
            }}
          >
            <Atom size={20} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              3D Quantum Atomic Orbitals &amp; Wavefunction Laboratory
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Schrödinger hydrogenic solution • Real-time probability density clouds • Phase sign lobes • Nodal topology
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="btn btn-sm"
            style={{
              background: isRotating ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: isRotating ? '#00E5FF' : '#FFFFFF',
              border: `1px solid ${isRotating ? '#00E5FF' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              gap: 6
            }}
          >
            {isRotating ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRotating ? 'Pause Spin' : 'Spin 3D'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedPresetId('1s');
              setRenderMode('cloud');
              setCutawaySlice(false);
            }}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-pill)', gap: 6 }}
          >
            <RotateCcw size={14} />
            <span>Reset 1s Ground</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Viewport with Overlays */}
      <div style={{ position: 'relative', width: '100%', height: 540, background: '#04060c' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Top-Left Quantum State Pill */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#FFFFFF'
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{activePreset.name}</span>
          <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            n={activePreset.n}, l={activePreset.l}, m={activePreset.m}
          </span>
        </div>

        {/* Top-Right Visualization Mode Toggles */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            zIndex: 10,
            display: 'flex',
            gap: 8,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: 5,
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <button
            onClick={() => setRenderMode('cloud')}
            style={{
              background: renderMode === 'cloud' ? '#00E5FF' : 'transparent',
              color: renderMode === 'cloud' ? '#0F172A' : '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Probability Cloud |ψ|²
          </button>
          <button
            onClick={() => setRenderMode('nodal')}
            style={{
              background: renderMode === 'nodal' ? '#FFaa00' : 'transparent',
              color: renderMode === 'nodal' ? '#0F172A' : '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Nodal Surfaces (ψ=0)
          </button>
          <button
            onClick={() => setCutawaySlice(!cutawaySlice)}
            style={{
              background: cutawaySlice ? '#EC4899' : 'transparent',
              color: cutawaySlice ? '#FFFFFF' : '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {cutawaySlice ? 'Close Cutaway' : 'Quadrant Cutaway'}
          </button>
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
              onClick={() => setIsRotating(!isRotating)}
              title={isRotating ? 'Pause Orbital Spin' : 'Start Orbital Spin'}
              style={{ height: 24, padding: '0 6px', borderRadius: 6, background: isRotating ? '#00E5FF' : 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)', color: isRotating ? '#000000' : '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 3, fontSize: '0.66rem', fontWeight: 800 }}
            >
              {isRotating ? <Pause size={10} /> : <Play size={10} />}
              <span>Spin</span>
            </button>
          </div>
        </div>

        {/* Phase Color Legend */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 16,
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.72rem',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#00E5FF' }} />
            <span>Positive Wave Phase (+ψ)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FF0055' }} />
            <span>Negative Wave Phase (-ψ)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFDD00' }} />
            <span>Proton Nucleus (r=0)</span>
          </div>
        </div>

        {/* Photon Jump Banner */}
        {isEmittingPhoton && activeTransition && (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid #00E5FF',
              boxShadow: '0 0 35px rgba(0, 229, 255, 0.6)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 24px',
              textAlign: 'center',
              color: '#FFFFFF',
              animation: 'pulse 1s infinite'
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#00E5FF', fontWeight: 800, textTransform: 'uppercase' }}>
              ✦ Quantum State Transition Active
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>
              {activeTransition.name} (n={activeTransition.from} → n={activeTransition.to})
            </div>
            <div style={{ fontSize: '0.92rem', color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              Emitted Photon: λ = {activeTransition.lambda}
            </div>
          </div>
        )}

        {/* Bottom Telemetry HUD */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 16,
            right: 16,
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
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
              Energy Level (E_n)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
              {quantumMetrics.energy} eV
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Radial Nodes (n - l - 1)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              {quantumMetrics.radialNodes} Spherical
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Angular Nodes (l)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              {quantumMetrics.angularNodes} Planar/Conical
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Peak Radius (r_max)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#EC4899', fontFamily: 'var(--font-mono)' }}>
              {quantumMetrics.rMaxBohr} a₀ ({ (parseFloat(quantumMetrics.rMaxBohr) * 0.0529).toFixed(2) } nm)
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Shell Degeneracy (n²)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#A78BFA', fontFamily: 'var(--font-mono)' }}>
              {quantumMetrics.degeneracy} Orbitals
            </div>
          </div>
        </div>
      </div>

      {/* 3. Preset Selector Buttons */}
      <div
        style={{
          padding: '16px 24px',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          SELECT ORBITAL:
        </span>
        {PRESETS.map((p) => {
          const isSelected = selectedPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPresetId(p.id);
                onParamChange?.('principalN', p.n);
                onParamChange?.('angularL', p.l);
                onParamChange?.('magneticM', p.m);
              }}
              style={{
                background: isSelected ? '#0062FF' : 'var(--bg-card)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: `1px solid ${isSelected ? '#0062FF' : 'var(--border-subtle)'}`,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 4px 12px rgba(0, 98, 255, 0.28)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* 4. Quantum Jump / Emission Simulator Buttons */}
      <div
        style={{
          padding: '16px 24px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={16} color="#00E5FF" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            SIMULATE ELECTRON JUMP &amp; PHOTON EMISSION:
          </span>
        </div>

        <button
          onClick={() => triggerTransition(3, 2, '656.3 nm (Red Hα)', 'Balmer Series')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', borderColor: '#EF4444', color: '#EF4444' }}
        >
          n=3 → n=2 (Balmer Hα Red, 656.3 nm)
        </button>

        <button
          onClick={() => triggerTransition(4, 2, '486.1 nm (Cyan Hβ)', 'Balmer Series')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', borderColor: '#00E5FF', color: '#00E5FF' }}
        >
          n=4 → n=2 (Balmer Hβ Cyan, 486.1 nm)
        </button>

        <button
          onClick={() => triggerTransition(2, 1, '121.6 nm (UV Lyman α)', 'Lyman Series')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.78rem', borderColor: '#7C3AED', color: '#7C3AED' }}
        >
          n=2 → n=1 (Lyman α UV, 121.6 nm)
        </button>
      </div>

      {/* 5. Rigorous KaTeX Mathematical Wavefunction Theory */}
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
            Hydrogenic Wavefunction &amp; Spherical Harmonics
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            Separation of variables in spherical coordinates yields radial polynomials R_nl(r) and spherical harmonics Y_l^m(θ, φ).
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="\psi_{nlm}(r, \theta, \phi) = R_{nl}(r) Y_{l}^{m}(\theta, \phi) \quad \bullet \quad E_n = -\frac{13.6 \text{ eV}}{n^2}" />
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Active Orbital Harmonic Formula
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            {activePreset.description}
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math={activePreset.harmonic} />
          </div>
        </div>
      </div>
    </div>
  );
};
