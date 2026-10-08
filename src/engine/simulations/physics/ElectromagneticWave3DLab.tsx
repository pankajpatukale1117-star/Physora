import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Activity,
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

export interface ElectromagneticWave3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const ElectromagneticWave3DLab: React.FC<ElectromagneticWave3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: externalSpeed,
  onParamChange,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [polarizationMode, setPolarizationMode] = useState<'linear' | 'circular_r' | 'circular_l' | 'elliptical'>('linear');
  const [polarizerAngle, setPolarizerAngle] = useState<number>(45); // degrees
  const [analyzerAngle, setAnalyzerAngle] = useState<number>(90); // degrees
  const [wavelengthNm, setWavelengthNm] = useState<number>(550); // green 550nm
  const [waveSpeed, setWaveSpeed] = useState<number>(1.0);

  // Synchronize state with incoming external params from the control settings panel
  useEffect(() => {
    if (!params) return;
    if (params.polarizerAngle !== undefined && Math.abs(params.polarizerAngle - polarizerAngle) > 0.1) {
      setPolarizerAngle(params.polarizerAngle);
    }
    if (params.analyzerAngle !== undefined && Math.abs(params.analyzerAngle - analyzerAngle) > 0.1) {
      setAnalyzerAngle(params.analyzerAngle);
    }
    if (params.wavelength !== undefined && Math.abs(params.wavelength - wavelengthNm) > 0.1) {
      setWavelengthNm(params.wavelength);
    }
  }, [params]);

  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  useEffect(() => {
    if (externalSpeed !== undefined && externalSpeed > 0) {
      setWaveSpeed(externalSpeed);
    }
  }, [externalSpeed]);

  // Visual Toggles
  const [showEField, setShowEField] = useState<boolean>(true);
  const [showBField, setShowBField] = useState<boolean>(true);
  const [showPoynting, setShowPoynting] = useState<boolean>(true);
  const [showTipHelix, setShowTipHelix] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // References for Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Synchronized parameter refs for uninterrupted 60FPS animation loop
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const polarizationModeRef = useRef(polarizationMode);
  useEffect(() => { polarizationModeRef.current = polarizationMode; }, [polarizationMode]);

  const polarizerAngleRef = useRef(polarizerAngle);
  useEffect(() => { polarizerAngleRef.current = polarizerAngle; }, [polarizerAngle]);

  const analyzerAngleRef = useRef(analyzerAngle);
  useEffect(() => { analyzerAngleRef.current = analyzerAngle; }, [analyzerAngle]);

  const waveSpeedRef = useRef(waveSpeed);
  useEffect(() => { waveSpeedRef.current = waveSpeed; }, [waveSpeed]);

  const showEFieldRef = useRef(showEField);
  useEffect(() => { showEFieldRef.current = showEField; }, [showEField]);

  const showBFieldRef = useRef(showBField);
  useEffect(() => { showBFieldRef.current = showBField; }, [showBField]);

  const showPoyntingRef = useRef(showPoynting);
  useEffect(() => { showPoyntingRef.current = showPoynting; }, [showPoynting]);

  const showTipHelixRef = useRef(showTipHelix);
  useEffect(() => { showTipHelixRef.current = showTipHelix; }, [showTipHelix]);

  const isAutoRotatingRef = useRef(isAutoRotating);
  useEffect(() => { isAutoRotatingRef.current = isAutoRotating; }, [isAutoRotating]);

  // Dynamic 3D Object Groups
  const eArrowsGroupRef = useRef<THREE.Group | null>(null);
  const bArrowsGroupRef = useRef<THREE.Group | null>(null);
  const poyntingArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const tipHelixLineRef = useRef<THREE.Line | null>(null);

  // Malus's Law & Wave Physics Metrics
  const opticalMetrics = useMemo(() => {
    // Malus angle delta
    const deltaAngleDeg = Math.abs(analyzerAngle - polarizerAngle);
    const deltaAngleRad = (deltaAngleDeg * Math.PI) / 180;
    const transmissionRatio = Math.pow(Math.cos(deltaAngleRad), 2);
    const intensityPercent = (transmissionRatio * 100).toFixed(1);

    // Speed of light c and frequency
    const c = 3.0e8; // m/s
    const lambdaM = wavelengthNm * 1e-9;
    const frequencyTHz = ((c / lambdaM) / 1e12).toFixed(1);

    // E and B fields
    const E0 = 100; // V/m nominal
    const B0 = (E0 / c * 1e9).toFixed(2); // nT
    const poyntingS = (0.5 * 8.854e-12 * c * E0 * E0).toFixed(1); // W/m^2

    return {
      deltaAngleDeg,
      transmissionRatio,
      intensityPercent,
      frequencyTHz,
      E0,
      B0,
      poyntingS
    };
  }, [polarizerAngle, analyzerAngle, wavelengthNm]);

  // Telemetry reporting to control settings panel
  useEffect(() => {
    onTelemetryUpdate?.({
      intensity: `${opticalMetrics.intensityPercent}%`,
      deltaAngle: `${opticalMetrics.deltaAngleDeg}°`,
      frequency: `${opticalMetrics.frequencyTHz} THz`,
      poynting: `${opticalMetrics.poyntingS} W/m²`
    });
  }, [opticalMetrics, onTelemetryUpdate]);

  // Mouse Orbit Tracking
  const mouseStateRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    rotX: 0.38,
    rotY: -0.65,
    zoom: 26
  });

  // Set up Three.js 3D Electromagnetic Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060c); // Deep dark optical bench
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-18, 14, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 2.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 3. Optical Propagation Axis (Z-Axis along bench)
    const benchLength = 28;
    const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, benchLength, 12);
    axisGeo.rotateX(Math.PI / 2);
    const axisMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 });
    const axisMesh = new THREE.Mesh(axisGeo, axisMat);
    scene.add(axisMesh);

    // Grid Floor
    const grid = new THREE.GridHelper(32, 32, 0x0062ff, 0x111e38);
    grid.position.y = -6.0;
    scene.add(grid);

    // 4. Polarizer Filters (Optical Disks)
    // Polarizer 1 at z = -6
    const filterR = 5.2;
    const p1Geo = new THREE.CylinderGeometry(filterR, filterR, 0.2, 36);
    p1Geo.rotateX(Math.PI / 2);
    const p1Mat = new THREE.MeshStandardMaterial({
      color: 0x0062ff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.2,
      metalness: 0.8
    });
    const p1Mesh = new THREE.Mesh(p1Geo, p1Mat);
    p1Mesh.position.z = -6;
    scene.add(p1Mesh);

    // Transmission axis slit line on Polarizer 1
    const p1AxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -filterR * 0.9, 0),
      new THREE.Vector3(0, filterR * 0.9, 0)
    ]);
    const p1AxisMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
    const p1AxisLine = new THREE.Line(p1AxisGeo, p1AxisMat);
    p1Mesh.add(p1AxisLine);

    // Polarizer 2 (Analyzer) at z = +6
    const p2Geo = new THREE.CylinderGeometry(filterR, filterR, 0.2, 36);
    p2Geo.rotateX(Math.PI / 2);
    const p2Mat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.25,
      roughness: 0.2,
      metalness: 0.8
    });
    const p2Mesh = new THREE.Mesh(p2Geo, p2Mat);
    p2Mesh.position.z = 6;
    scene.add(p2Mesh);

    const p2AxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -filterR * 0.9, 0),
      new THREE.Vector3(0, filterR * 0.9, 0)
    ]);
    const p2AxisMat = new THREE.LineBasicMaterial({ color: 0xec4899, linewidth: 2 });
    const p2AxisLine = new THREE.Line(p2AxisGeo, p2AxisMat);
    p2Mesh.add(p2AxisLine);

    // 5. Dynamic Vector Arrow Groups
    const eGroup = new THREE.Group();
    scene.add(eGroup);
    eArrowsGroupRef.current = eGroup;

    const bGroup = new THREE.Group();
    scene.add(bGroup);
    bArrowsGroupRef.current = bGroup;

    // Create 36 sample points along the z-axis
    const numPoints = 42;
    const zStart = -13;
    const zEnd = 13;
    const zStep = (zEnd - zStart) / numPoints;

    const eArrows: THREE.ArrowHelper[] = [];
    const bArrows: THREE.ArrowHelper[] = [];

    for (let i = 0; i < numPoints; i++) {
      const zPos = zStart + i * zStep;

      // E-field Arrow (Cyan)
      const eArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, zPos),
        1,
        0x00e5ff,
        0.35,
        0.18
      );
      eGroup.add(eArrow);
      eArrows.push(eArrow);

      // B-field Arrow (Crimson)
      const bArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, zPos),
        1,
        0xef4444,
        0.35,
        0.18
      );
      bGroup.add(bArrow);
      bArrows.push(bArrow);
    }

    // 6. Poynting Vector Arrow (Green, at the leading wavefront)
    const pArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, zEnd),
      3.5,
      0x10b981,
      0.65,
      0.35
    );
    scene.add(pArrow);
    poyntingArrowRef.current = pArrow;

    // 7. Continuous Helix Spiral Tip Line (for circular polarization)
    const helixGeo = new THREE.BufferGeometry();
    const helixMat = new THREE.LineBasicMaterial({ color: 0xffdd00, linewidth: 2 });
    const helixLine = new THREE.Line(helixGeo, helixMat);
    scene.add(helixLine);
    tipHelixLineRef.current = helixLine;

    // 8. Interactive Mouse & Touch Drag for 3D Camera Orbit
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
      mouseStateRef.current.zoom = Math.max(10, Math.min(65, mouseStateRef.current.zoom + e.deltaY * 0.035));
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

    // 9. Animation & Wave Physics Loop
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isPlayingRef.current) {
        timeRef.current += dt * waveSpeedRef.current * 3.5;
      }
      const t = timeRef.current;

      // Auto rotation
      if (isAutoRotatingRef.current) {
        mouseStateRef.current.rotY += 0.005;
      }

      // Update Camera Spherical Orbit
      const { rotX, rotY, zoom } = mouseStateRef.current;
      camera.position.x = zoom * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = zoom * Math.sin(rotX);
      camera.position.z = zoom * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      // Rotate polarizers according to sliders
      p1Mesh.rotation.z = (polarizerAngleRef.current * Math.PI) / 180;
      p2Mesh.rotation.z = (analyzerAngleRef.current * Math.PI) / 180;

      // Wave parameters
      const k = 0.55; // Wavenumber
      const amp = 3.2; // Maximum field amplitude
      const polAngleRad = (polarizerAngleRef.current * Math.PI) / 180;
      const anaAngleRad = (analyzerAngleRef.current * Math.PI) / 180;
      const currentMode = polarizationModeRef.current;

      const tipPoints: THREE.Vector3[] = [];

      // Update each field vector arrow along the bench
      for (let i = 0; i < numPoints; i++) {
        const z = zStart + i * zStep;
        const phase = k * z - t;

        let Ex = 0;
        let Ey = 0;

        // Wave propagation logic through optical bench elements
        if (z < -6) {
          // Region 1: Before Polarizer 1 (Input wave)
          if (currentMode === 'linear') {
            Ex = amp * Math.cos(polAngleRad) * Math.cos(phase);
            Ey = amp * Math.sin(polAngleRad) * Math.cos(phase);
          } else if (currentMode === 'circular_r') {
            Ex = amp * Math.cos(phase);
            Ey = amp * Math.sin(phase);
          } else if (currentMode === 'circular_l') {
            Ex = amp * Math.cos(phase);
            Ey = -amp * Math.sin(phase);
          } else {
            // Elliptical
            Ex = amp * Math.cos(phase);
            Ey = amp * 0.5 * Math.sin(phase + 0.8);
          }
        } else if (z >= -6 && z < 6) {
          // Region 2: Between Polarizer 1 and Analyzer
          // Linearly polarized along Polarizer 1 axis
          const E_lin = amp * Math.cos(phase);
          Ex = E_lin * Math.cos(polAngleRad);
          Ey = E_lin * Math.sin(polAngleRad);
        } else {
          // Region 3: After Analyzer (Malus's Law applies!)
          const E_after = amp * Math.cos(anaAngleRad - polAngleRad) * Math.cos(phase);
          Ex = E_after * Math.cos(anaAngleRad);
          Ey = E_after * Math.sin(anaAngleRad);
        }

        // B-field is perpendicular: B = (1/c) * (k_hat x E)
        // With k along +z: Bx = -Ey, By = Ex
        const Bx = -Ey;
        const By = Ex;

        const eMag = Math.hypot(Ex, Ey);
        const bMag = Math.hypot(Bx, By);

        // Update E-arrow
        const eArrow = eArrows[i];
        if (eMag > 0.05) {
          eArrow.position.set(0, 0, z);
          eArrow.setDirection(new THREE.Vector3(Ex, Ey, 0).normalize());
          eArrow.setLength(eMag, Math.min(0.35, eMag * 0.3), 0.15);
          eArrow.visible = showEFieldRef.current;
        } else {
          eArrow.visible = false;
        }

        // Update B-arrow
        const bArrow = bArrows[i];
        if (bMag > 0.05) {
          bArrow.position.set(0, 0, z);
          bArrow.setDirection(new THREE.Vector3(Bx, By, 0).normalize());
          bArrow.setLength(bMag, Math.min(0.35, bMag * 0.3), 0.15);
          bArrow.visible = showBFieldRef.current;
        } else {
          bArrow.visible = false;
        }

        // Record tip for 3D trajectory ribbon / helix
        tipPoints.push(new THREE.Vector3(Ex, Ey, z));
      }

      // Update Tip Helix trajectory line
      if (showTipHelixRef.current) {
        helixGeo.setFromPoints(tipPoints);
        helixLine.visible = true;
      } else {
        helixLine.visible = false;
      }

      // Update Poynting vector
      pArrow.visible = showPoyntingRef.current;

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
      axisGeo.dispose();
      axisMat.dispose();
      p1Geo.dispose();
      p1Mat.dispose();
      p2Geo.dispose();
      p2Mat.dispose();
      helixGeo.dispose();
      helixMat.dispose();
    };
  }, []);

  // Direct Button Camera Controls
  const handleRotateLeft = () => { mouseStateRef.current.rotY -= 0.2; };
  const handleRotateRight = () => { mouseStateRef.current.rotY += 0.2; };
  const handleTiltUp = () => { mouseStateRef.current.rotX = Math.min(Math.PI / 2.3, mouseStateRef.current.rotX + 0.15); };
  const handleTiltDown = () => { mouseStateRef.current.rotX = Math.max(-Math.PI / 2.3, mouseStateRef.current.rotX - 0.15); };
  const handleZoomIn = () => { mouseStateRef.current.zoom = Math.max(10, mouseStateRef.current.zoom - 3); };
  const handleZoomOut = () => { mouseStateRef.current.zoom = Math.min(65, mouseStateRef.current.zoom + 3); };
  const handleResetCamera = () => {
    mouseStateRef.current.rotX = 0.38;
    mouseStateRef.current.rotY = -0.65;
    mouseStateRef.current.zoom = 26;
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
              background: 'linear-gradient(135deg, #00E5FF, #EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0, 229, 255, 0.4)'
            }}
          >
            <Activity size={20} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              3D Electromagnetic Wave &amp; Polarization Optical Bench
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
              Maxwell transverse wave • Orthogonal E &amp; B fields • Malus's Law • Circular &amp; Elliptical Helices
            </p>
          </div>
        </div>

        {/* Global Controls */}
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
              gap: 6
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Freeze Wave' : 'Propagate'}</span>
          </button>

          <button
            onClick={() => {
              setPolarizationMode('linear');
              setPolarizerAngle(45);
              setAnalyzerAngle(45); // Maximum transmission
              setWaveSpeed(1.0);
            }}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-pill)', gap: 6 }}
          >
            <RotateCcw size={14} />
            <span>Reset 100% Transmission</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Viewport with Overlays */}
      <div style={{ position: 'relative', width: '100%', height: 540, background: '#04060c' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Top-Left Mode Selectors */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
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
            onClick={() => setPolarizationMode('linear')}
            style={{
              background: polarizationMode === 'linear' ? '#0062FF' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Linear Polarization
          </button>
          <button
            onClick={() => setPolarizationMode('circular_r')}
            style={{
              background: polarizationMode === 'circular_r' ? '#00E5FF' : 'transparent',
              color: polarizationMode === 'circular_r' ? '#0F172A' : '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Circular RHCP Helix
          </button>
          <button
            onClick={() => setPolarizationMode('circular_l')}
            style={{
              background: polarizationMode === 'circular_l' ? '#EC4899' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Circular LHCP Helix
          </button>
          <button
            onClick={() => setPolarizationMode('elliptical')}
            style={{
              background: polarizationMode === 'elliptical' ? '#7C3AED' : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '5px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Elliptical
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
            <input type="checkbox" checked={showEField} onChange={(e) => setShowEField(e.target.checked)} />
            <span style={{ color: '#00E5FF', fontWeight: 700 }}>E-Field (Cyan)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showBField} onChange={(e) => setShowBField(e.target.checked)} />
            <span style={{ color: '#EF4444', fontWeight: 700 }}>B-Field (Red)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showPoynting} onChange={(e) => setShowPoynting(e.target.checked)} />
            <span style={{ color: '#10B981', fontWeight: 700 }}>Poynting S (Green)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={showTipHelix} onChange={(e) => setShowTipHelix(e.target.checked)} />
            <span style={{ color: '#FFDD00', fontWeight: 700 }}>Tip Helix</span>
          </label>
        </div>

        {/* Malus Law Gauge Spotlight Indicator */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 16,
            zIndex: 10,
            background: 'rgba(15, 23, 42, 0.9)',
            border: `1.5px solid ${parseFloat(opticalMetrics.intensityPercent) > 50 ? '#10B981' : '#EF4444'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            color: '#FFFFFF',
            textAlign: 'right'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>
            Malus Transmitted Intensity
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: parseFloat(opticalMetrics.intensityPercent) > 50 ? '#10B981' : '#EF4444' }}>
            {opticalMetrics.intensityPercent}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A78BFA' }}>
            Δθ = {opticalMetrics.deltaAngleDeg}° (cos²Δθ)
          </div>
        </div>

        {/* Floating 3D Camera Controls Widget */}
        <div
          style={{
            position: 'absolute',
            top: 155,
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
                background: 'rgba(0, 229, 255, 0.2)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#00E5FF',
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
                background: isAutoRotating ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${isAutoRotating ? '#00E5FF' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: 'var(--radius-sm)',
                color: isAutoRotating ? '#00E5FF' : '#FFFFFF',
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
              Wavelength (λ)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
              {wavelengthNm} nm
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Optical Frequency (f)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              {opticalMetrics.frequencyTHz} THz
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Electric Field (E₀)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              {opticalMetrics.E0} V/m
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Magnetic Field (B₀ = E/c)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
              {opticalMetrics.B0} nT
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
              Poynting Flux (S)
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
              {opticalMetrics.poyntingS} W/m²
            </div>
          </div>
        </div>
      </div>

      {/* 3. Optical Controls Sliders */}
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
        {/* Polarizer 1 Transmission Axis */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Polarizer 1 Angle (θ₁)
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0062FF', fontFamily: 'var(--font-mono)' }}>
              {polarizerAngle}°
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={polarizerAngle}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setPolarizerAngle(v);
              onParamChange?.('polarizerAngle', v);
            }}
            style={{ width: '100%', accentColor: '#0062FF' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>0° (Horizontal)</span>
            <span>45° (Diagonal)</span>
            <span>90° (Vertical)</span>
            <span>180°</span>
          </div>
        </div>

        {/* Polarizer 2 (Analyzer) Angle */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Analyzer Angle (θ₂)
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'var(--font-mono)' }}>
              {analyzerAngle}° (Δθ = {opticalMetrics.deltaAngleDeg}°)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={analyzerAngle}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setAnalyzerAngle(v);
              onParamChange?.('analyzerAngle', v);
            }}
            style={{ width: '100%', accentColor: '#7C3AED' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span>0°</span>
            <span>90° (Crossed: 0% light)</span>
            <span>180°</span>
          </div>
        </div>

        {/* Wavelength Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Wavelength (λ) &amp; Color
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
              {wavelengthNm} nm
            </span>
          </div>
          <input
            type="range"
            min="380"
            max="750"
            step="10"
            value={wavelengthNm}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setWavelengthNm(v);
              onParamChange?.('wavelength', v);
            }}
            style={{ width: '100%', accentColor: '#00E5FF' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            <span style={{ color: '#7C3AED' }}>380nm (Violet)</span>
            <span style={{ color: '#10B981' }}>550nm (Green)</span>
            <span style={{ color: '#EF4444' }}>750nm (Red)</span>
          </div>
        </div>
      </div>

      {/* 4. Rigorous KaTeX Theory & Maxwell Equations */}
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
            Malus's Law &amp; Optical Transmission
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            When completely plane-polarized light is incident on an analyzer, the transmitted intensity I varies directly as the square of the cosine of the angle between the transmission axes.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="I = I_0 \cos^2(\theta_2 - \theta_1) \quad \bullet \quad \vec{S} = \frac{1}{\mu_0} (\vec{E} \times \vec{B})" />
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Maxwell Transverse Wave Propagation
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            Electric field E and magnetic field B oscillate strictly in phase and mutually perpendicular to the direction of propagation vector k in vacuum.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '6px 12px', borderRadius: 'var(--radius-md)' }}>
            <MathView math="c = \frac{1}{\sqrt{\mu_0 \varepsilon_0}} \quad \bullet \quad B_0 = \frac{E_0}{c} \quad \bullet \quad \vec{E} \perp \vec{B} \perp \hat{k}" />
          </div>
        </div>
      </div>
    </div>
  );
};
