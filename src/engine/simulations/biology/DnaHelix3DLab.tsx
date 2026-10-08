import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Dna,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

interface BasePair {
  index: number;
  base1: 'A' | 'T' | 'G' | 'C';
  base2: 'A' | 'T' | 'G' | 'C';
  hBonds: number;
  isMutated?: boolean;
}

const INITIAL_SEQUENCE: ('A' | 'T' | 'G' | 'C')[] = [
  'A', 'T', 'G', 'C', 'C', 'G', 'A', 'A', 'T', 'C', 'G', 'A', 'T', 'C', 'C', 'G', 'T', 'A'
];

export interface DnaHelix3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const DnaHelix3DLab: React.FC<DnaHelix3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: externalSpeed,
  onParamChange,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [temperatureC, setTemperatureC] = useState<number>(37); // Human body temp 37C
  const [unzipProgress, setUnzipProgress] = useState<number>(0); // 0.0 to 1.0 unzipping
  const [displayStyle, setDisplayStyle] = useState<'ribbon' | 'ball_stick' | 'space_filling'>('ball_stick');

  // Synchronize state with incoming external params from the control settings panel
  useEffect(() => {
    if (!params) return;
    if (params.unzip !== undefined && Math.abs(params.unzip - unzipProgress) > 0.01) {
      setUnzipProgress(params.unzip);
    }
    if (params.temperature !== undefined && Math.abs(params.temperature - temperatureC) > 0.1) {
      setTemperatureC(params.temperature);
    }
    if (params.speed !== undefined && Math.abs(params.speed - rotationSpeed) > 0.05) {
      setRotationSpeed(params.speed);
    }
  }, [params]);

  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  useEffect(() => {
    if (externalSpeed !== undefined && externalSpeed > 0) {
      setRotationSpeed(externalSpeed);
    }
  }, [externalSpeed]);

  // Visual Toggles
  const [showHBonds, setShowHBonds] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Genetic Sequence State
  const [sequence, setSequence] = useState<('A' | 'T' | 'G' | 'C')[]>(INITIAL_SEQUENCE);
  const [selectedBpIndex, setSelectedBpIndex] = useState<number>(0);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const helixGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Synchronized refs for smooth animation without scene reconstruction
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const rotationSpeedRef = useRef(rotationSpeed);
  useEffect(() => { rotationSpeedRef.current = rotationSpeed; }, [rotationSpeed]);

  const isAutoRotatingRef = useRef(isAutoRotating);
  useEffect(() => { isAutoRotatingRef.current = isAutoRotating; }, [isAutoRotating]);

  // Mouse Orbit Tracking
  const mouseStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.15,
    rotY: 0.5,
    zoom: 24
  });

  // Calculate Base Pairs & Biophysical Metrics
  const basePairs: BasePair[] = useMemo(() => {
    return sequence.map((b1, idx) => {
      let b2: 'A' | 'T' | 'G' | 'C' = 'T';
      let hBonds = 2;
      if (b1 === 'A') { b2 = 'T'; hBonds = 2; }
      else if (b1 === 'T') { b2 = 'A'; hBonds = 2; }
      else if (b1 === 'G') { b2 = 'C'; hBonds = 3; }
      else if (b1 === 'C') { b2 = 'G'; hBonds = 3; }

      return {
        index: idx,
        base1: b1,
        base2: b2,
        hBonds
      };
    });
  }, [sequence]);

  // Biophysical Calculations (Melting Temp Tm, GC Content, Hydrogen Bonds)
  const dnaMetrics = useMemo(() => {
    const totalBp = basePairs.length;
    let gcCount = 0;
    let totalHBonds = 0;

    basePairs.forEach((bp) => {
      if (bp.base1 === 'G' || bp.base1 === 'C') gcCount++;
      totalHBonds += bp.hBonds;
    });

    const gcPercent = ((gcCount / totalBp) * 100).toFixed(1);
    // Marmur-Doty formula for Tm
    const tm = (64.9 + 41 * (gcCount - 16.4) / totalBp).toFixed(1);

    return {
      totalBp,
      gcPercent,
      tm,
      totalHBonds
    };
  }, [basePairs]);

  // Telemetry reporting to control settings panel
  useEffect(() => {
    onTelemetryUpdate?.({
      basePairs: `${dnaMetrics.totalBp} bp`,
      gcContent: `${dnaMetrics.gcPercent}%`,
      tm: `${dnaMetrics.tm} °C`,
      hBonds: `${dnaMetrics.totalHBonds}`
    });
  }, [dnaMetrics, onTelemetryUpdate]);

  // Color mapping for bases
  const getBaseColor = (base: 'A' | 'T' | 'G' | 'C'): number => {
    switch (base) {
      case 'A': return 0x10b981; // Adenine: Green
      case 'T': return 0xef4444; // Thymine: Red
      case 'G': return 0x0062ff; // Guanine: Blue
      case 'C': return 0xf59e0b; // Cytosine: Yellow/Amber
    }
  };

  // Set up Three.js 3D DNA Helix Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep cellular micro-cosmos
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting: Crisp laboratory lighting for molecular geometry
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
    keyLight.position.set(20, 30, 20);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7c3aed, 1.8);
    fillLight.position.set(-20, -10, -20);
    scene.add(fillLight);

    // 3. DNA Helix Main Group
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);
    helixGroupRef.current = helixGroup;

    // B-DNA Geometry Constants
    const radius = 3.6; // Helix radius
    const bpRise = 0.95; // Rise per base pair along Y-axis (3.4 Å scaled)
    const twistPerBp = (36 * Math.PI) / 180; // 36 degrees twist per bp (10 bp per full 360 turn)
    const totalBp = basePairs.length;
    const yOffset = -((totalBp - 1) * bpRise) / 2;

    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    // Construct 3D Base Pairs & Helical Backbones
    basePairs.forEach((bp, idx) => {
      const angle = idx * twistPerBp;
      const y = yOffset + idx * bpRise;

      // Separation offset for DNA unzipping / thermal denaturation
      const unzipOffset = unzipProgress * Math.sin((idx / totalBp) * Math.PI) * 4.5;

      // Backbone 1 (Strand 1: 5' to 3') position
      const x1 = (radius + unzipOffset) * Math.cos(angle);
      const z1 = (radius + unzipOffset) * Math.sin(angle);
      const pos1 = new THREE.Vector3(x1, y, z1);
      strand1Points.push(pos1);

      // Backbone 2 (Strand 2: 3' to 5') position (opposite phase: angle + PI)
      const x2 = (radius + unzipOffset) * Math.cos(angle + Math.PI);
      const z2 = (radius + unzipOffset) * Math.sin(angle + Math.PI);
      const pos2 = new THREE.Vector3(x2, y, z2);
      strand2Points.push(pos2);

      // Backbone Phosphate Node Spheres
      const sphereRadius = displayStyle === 'space_filling' ? 1.4 : displayStyle === 'ball_stick' ? 0.65 : 0.45;
      const b1Node = new THREE.Mesh(
        new THREE.SphereGeometry(sphereRadius, 20, 20),
        new THREE.MeshStandardMaterial({
          color: 0x00e5ff,
          roughness: 0.25,
          metalness: 0.6
        })
      );
      b1Node.position.copy(pos1);
      helixGroup.add(b1Node);

      const b2Node = new THREE.Mesh(
        new THREE.SphereGeometry(sphereRadius, 20, 20),
        new THREE.MeshStandardMaterial({
          color: 0x7c3aed,
          roughness: 0.25,
          metalness: 0.6
        })
      );
      b2Node.position.copy(pos2);
      helixGroup.add(b2Node);

      // Nitrogenous Base 1 Cylinder (connected to backbone 1 pointing inwards)
      const mid1 = new THREE.Vector3().lerpVectors(pos1, new THREE.Vector3(0, y, 0), 0.55);
      const base1Mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, pos1.distanceTo(new THREE.Vector3(0, y, 0)) * 0.85, 16),
        new THREE.MeshStandardMaterial({
          color: getBaseColor(bp.base1),
          roughness: 0.3,
          metalness: 0.2
        })
      );
      base1Mesh.position.copy(mid1);
      base1Mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, y, 0).clone().sub(pos1).normalize());
      helixGroup.add(base1Mesh);

      // Nitrogenous Base 2 Cylinder (connected to backbone 2 pointing inwards)
      const mid2 = new THREE.Vector3().lerpVectors(pos2, new THREE.Vector3(0, y, 0), 0.55);
      const base2Mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, pos2.distanceTo(new THREE.Vector3(0, y, 0)) * 0.85, 16),
        new THREE.MeshStandardMaterial({
          color: getBaseColor(bp.base2),
          roughness: 0.3,
          metalness: 0.2
        })
      );
      base2Mesh.position.copy(mid2);
      base2Mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, y, 0).clone().sub(pos2).normalize());
      helixGroup.add(base2Mesh);

      // Hydrogen Bonds (Dashed glowing bridge between bases when not unzipped)
      if (showHBonds && unzipProgress < 0.6) {
        const hBondCount = bp.hBonds;
        for (let h = 0; h < hBondCount; h++) {
          const hY = y + (h - (hBondCount - 1) / 2) * 0.24;
          const hGeo = new THREE.SphereGeometry(0.12, 10, 10);
          const hMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x00e5ff,
            emissiveIntensity: 0.8
          });
          const hMesh = new THREE.Mesh(hGeo, hMat);
          hMesh.position.set(0, hY, 0);
          helixGroup.add(hMesh);
        }
      }
    });

    // Draw Continuous Backbone Ribbons (Strand 1 and Strand 2)
    const curve1 = new THREE.CatmullRomCurve3(strand1Points);
    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(curve1, 64, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.3, metalness: 0.5 })
    );
    helixGroup.add(tube1);

    const curve2 = new THREE.CatmullRomCurve3(strand2Points);
    const tube2 = new THREE.Mesh(
      new THREE.TubeGeometry(curve2, 64, 0.28, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.3, metalness: 0.5 })
    );
    helixGroup.add(tube2);

    // 4. Mouse & Touch Drag Orbit Controls
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
      mouseStateRef.current.rotX = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, mouseStateRef.current.rotX + dy * 0.008));
      mouseStateRef.current.prevX = e.clientX;
      mouseStateRef.current.prevY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseStateRef.current.isDragging = false;
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
      mouseStateRef.current.rotX = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, mouseStateRef.current.rotX + dy * 0.008));
      mouseStateRef.current.prevX = e.touches[0].clientX;
      mouseStateRef.current.prevY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      mouseStateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      mouseStateRef.current.zoom = Math.max(10, Math.min(55, mouseStateRef.current.zoom + e.deltaY * 0.035));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    const animate = () => {
      // Auto-rotation if enabled
      if (isAutoRotatingRef.current) {
        mouseStateRef.current.rotY += 0.005;
      }

      // Update Camera Orbit
      const { rotX, rotY, zoom } = mouseStateRef.current;
      camera.position.x = zoom * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = zoom * Math.sin(rotX);
      camera.position.z = zoom * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      // Rotate DNA Helix around vertical Y-axis
      if (isPlayingRef.current && helixGroup) {
        helixGroup.rotation.y += 0.006 * rotationSpeedRef.current;
      }

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
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      tube1.geometry.dispose();
      tube2.geometry.dispose();
    };
  }, [basePairs, unzipProgress, displayStyle, showHBonds]);

  // Direct Button Camera Controls
  const handleRotateLeft = () => { mouseStateRef.current.rotY -= 0.2; };
  const handleRotateRight = () => { mouseStateRef.current.rotY += 0.2; };
  const handleTiltUp = () => { mouseStateRef.current.rotX = Math.min(Math.PI / 2.3, mouseStateRef.current.rotX + 0.15); };
  const handleTiltDown = () => { mouseStateRef.current.rotX = Math.max(-Math.PI / 2.3, mouseStateRef.current.rotX - 0.15); };
  const handleZoomIn = () => { mouseStateRef.current.zoom = Math.max(10, mouseStateRef.current.zoom - 3); };
  const handleZoomOut = () => { mouseStateRef.current.zoom = Math.min(55, mouseStateRef.current.zoom + 3); };
  const handleResetCamera = () => {
    mouseStateRef.current.rotX = 0.15;
    mouseStateRef.current.rotY = 0.5;
    mouseStateRef.current.zoom = 24;
  };

  // Point mutation trigger
  const handleMutateBase = (idx: number, newBase: 'A' | 'T' | 'G' | 'C') => {
    const nextSeq = [...sequence];
    nextSeq[idx] = newBase;
    setSequence(nextSeq);
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
              background: 'linear-gradient(135deg, #10B981, #00E5FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Dna size={20} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              3D DNA Double Helix &amp; Molecular Genetics Laboratory
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Watson-Crick base pairing • Antiparallel backbones • Hydrogen bond bridges • Helicase unzipping
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-sm"
            style={{
              background: isPlaying ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: isPlaying ? '#00E5FF' : '#FFFFFF',
              border: `1px solid ${isPlaying ? '#00E5FF' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              gap: 6
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Spin' : 'Resume Spin'}</span>
          </button>

          <button
            onClick={() => {
              setSequence(INITIAL_SEQUENCE);
              setUnzipProgress(0);
              setTemperatureC(37);
              setRotationSpeed(1.0);
            }}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-pill)', gap: 6 }}
          >
            <RotateCcw size={14} />
            <span>Reset Wild-Type</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Viewport with Overlays */}
      <div style={{ position: 'relative', width: '100%', height: 540, background: '#060913' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Top-Left Nucleotide Color Legend */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            color: '#FFFFFF',
            fontSize: '0.74rem'
          }}
        >
          <div style={{ fontWeight: 800, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
            Base Pairing Legend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10B981' }} />
            <span>Adenine (A) = 2 H-Bonds = Thymine (T)</span>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#EF4444' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0062FF' }} />
            <span>Guanine (G) ≡ 3 H-Bonds ≡ Cytosine (C)</span>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#F59E0B' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: '#00E5FF' }}>● 5' → 3' Strand</span>
            <span style={{ color: '#7C3AED' }}>● 3' → 5' Strand</span>
          </div>
        </div>

        {/* Top-Right Display Mode Selector */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 16,
            zIndex: 10,
            display: 'flex',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: 5,
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <button
            onClick={() => setDisplayStyle('ball_stick')}
            style={{
              background: displayStyle === 'ball_stick' ? '#10B981' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Ball &amp; Stick
          </button>
          <button
            onClick={() => setDisplayStyle('ribbon')}
            style={{
              background: displayStyle === 'ribbon' ? '#0062FF' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Ladder &amp; Ribbon
          </button>
          <button
            onClick={() => setDisplayStyle('space_filling')}
            style={{
              background: displayStyle === 'space_filling' ? '#7C3AED' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Space-Filling VDW
          </button>
          <button
            onClick={() => setShowHBonds(!showHBonds)}
            style={{
              background: showHBonds ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
              color: showHBonds ? '#F472B6' : 'rgba(255, 255, 255, 0.6)',
              border: showHBonds ? '1px solid #EC4899' : '1px solid transparent',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {showHBonds ? 'H-Bonds: ON' : 'H-Bonds: OFF'}
          </button>
        </div>

        {/* Floating 3D Camera Controls Widget */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 16,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-lg)',
            padding: 8,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            3D Orbit
          </div>
          {/* D-Pad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(3, 28px)', gap: 3 }}>
            <div />
            <button
              onClick={handleTiltUp}
              title="Tilt Up"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <ChevronUp size={16} />
            </button>
            <div />

            <button
              onClick={handleRotateLeft}
              title="Rotate Left"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleResetCamera}
              title="Reset View"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#10B981',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <Compass size={14} />
            </button>
            <button
              onClick={handleRotateRight}
              title="Rotate Right"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <ChevronRight size={16} />
            </button>

            <div />
            <button
              onClick={handleTiltDown}
              title="Tilt Down"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              <ChevronDown size={16} />
            </button>
            <div />
          </div>

          <div style={{ height: 1, width: '100%', background: 'rgba(255, 255, 255, 0.08)', margin: '2px 0' }} />

          {/* Zoom & Auto-Spin */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              title={isAutoRotating ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
              style={{
                background: isAutoRotating ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${isAutoRotating ? '#10B981' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: 'var(--radius-sm)',
                color: isAutoRotating ? '#10B981' : '#FFFFFF',
                cursor: 'pointer',
                padding: '4px 6px',
                fontSize: '0.62rem',
                fontWeight: 700
              }}
            >
              {isAutoRotating ? 'Spinning' : 'Spin'}
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
            border: '1px solid rgba(16, 185, 129, 0.25)',
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
              Base Pairs Count
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
              {dnaMetrics.totalBp} bp
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              GC Content (%)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              {dnaMetrics.gcPercent}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Melting Temp (T_m)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              {dnaMetrics.tm}°C
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Hydrogen Bonds
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#EC4899', fontFamily: 'var(--font-mono)' }}>
              {dnaMetrics.totalHBonds} Total Bonds
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Helical Geometry
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#A78BFA', fontFamily: 'var(--font-mono)' }}>
              10.5 bp/turn (3.4 nm pitch)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Laboratory Physical Controls Sliders */}
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
        {/* Unzipping / Helicase Action Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Helicase Strand Unzipping
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
              {(unzipProgress * 100).toFixed(0)}% Unzipped
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={unzipProgress}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setUnzipProgress(v);
              onParamChange?.('unzip', v);
            }}
            style={{ width: '100%', accentColor: '#00E5FF' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>0% (Intact Double Helix)</span>
            <span>50% (Replication Fork)</span>
            <span>100% (Denatured ssDNA)</span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Temperature (Thermal Denaturation)
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: temperatureC > 70 ? '#EF4444' : '#10B981', fontFamily: 'var(--font-mono)' }}>
              {temperatureC}°C {temperatureC > parseFloat(dnaMetrics.tm) ? '(> Tm Denaturing)' : '(Native State)'}
            </span>
          </div>
          <input
            type="range"
            min="25"
            max="98"
            step="1"
            value={temperatureC}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTemperatureC(val);
              onParamChange?.('temperature', val);
              // Auto-adjust unzipping if temperature exceeds melting point
              if (val > parseFloat(dnaMetrics.tm)) {
                const uz = Math.min(1.0, (val - parseFloat(dnaMetrics.tm)) / 25);
                setUnzipProgress(uz);
                onParamChange?.('unzip', uz);
              } else {
                setUnzipProgress(0);
                onParamChange?.('unzip', 0);
              }
            }}
            style={{ width: '100%', accentColor: temperatureC > 70 ? '#EF4444' : '#10B981' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>25°C (Room)</span>
            <span>37°C (Body Temp)</span>
            <span>Tm ({dnaMetrics.tm}°C)</span>
            <span>98°C (PCR Denature)</span>
          </div>
        </div>

        {/* Interactive Mutation Editor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Point Mutation (bp #{selectedBpIndex + 1})
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              Current: {sequence[selectedBpIndex]}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['A', 'T', 'G', 'C'] as const).map((b) => (
              <button
                key={b}
                onClick={() => handleMutateBase(selectedBpIndex, b)}
                style={{
                  flex: 1,
                  background: sequence[selectedBpIndex] === b ? getBaseColor(b) : 'var(--bg-subtle)',
                  color: sequence[selectedBpIndex] === b ? '#FFFFFF' : 'var(--text-primary)',
                  border: `1px solid var(--border-subtle)`,
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 0',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {b}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Select base pair:</span>
            <input
              type="range"
              min="0"
              max={sequence.length - 1}
              value={selectedBpIndex}
              onChange={(e) => setSelectedBpIndex(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#F59E0B' }}
            />
          </div>
        </div>
      </div>

      {/* 4. Rigorous KaTeX Theory & Molecular Biophysics */}
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
            Watson-Crick Hydrogen Bonding &amp; Energetics
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            Purines pair with pyrimidines. Guanine-Cytosine has 3 hydrogen bonds (~65 kJ/mol), while Adenine-Thymine has 2 (~45 kJ/mol), making high GC content thermally more stable.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="A = T \;(2\text{ H-bonds}) \quad \bullet \quad G \equiv C \;(3\text{ H-bonds})" />
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Melting Temperature (Tm) &amp; B-DNA Geometry
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            Thermal denaturation melting point Tm reflects strand separation enthalpy. B-DNA has a helical pitch of 3.4 nm per 10.5 bp turn with distinct major (2.2 nm) and minor (1.2 nm) grooves.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="T_m = 64.9 + 41 \times \frac{G+C - 16.4}{N_{\text{bp}}} \quad \bullet \quad \Delta G^\circ = \Delta H^\circ - T\Delta S^\circ" />
          </div>
        </div>
      </div>
    </div>
  );
};
