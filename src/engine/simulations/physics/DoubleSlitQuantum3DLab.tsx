import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

export interface DoubleSlitQuantum3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const DoubleSlitQuantum3DLab: React.FC<DoubleSlitQuantum3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: externalSpeed,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intensityCanvasRef = useRef<HTMLCanvasElement>(null);

  // Core Quantum Parameters
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [wavelengthNm, setWavelengthNm] = useState<number>(500); // de Broglie wavelength lambda (nm)
  const [slitDistanceUm, setSlitDistanceUm] = useState<number>(4.0); // Slit separation d (micrometers)
  const [slitWidthUm, setSlitWidthUm] = useState<number>(0.8); // Slit width a (micrometers)
  const [observerIntensity, setObserverIntensity] = useState<number>(0.0); // 0.0 (Pure quantum) to 1.0 (Full decoherence)
  const [emissionRate, setEmissionRate] = useState<number>(120); // particles/sec
  const [simSpeed, setSimSpeed] = useState<number>(1.0);

  // Visualization mode
  const [accumulatedHits, setAccumulatedHits] = useState<number>(0);

  // Sync external parameters from control drawer
  useEffect(() => {
    if (!params) return;
    if (params.wavelength !== undefined && Math.abs(params.wavelength - wavelengthNm) > 5) {
      setWavelengthNm(params.wavelength);
    }
    if (params.slitDistance !== undefined && Math.abs(params.slitDistance - slitDistanceUm) > 0.1) {
      setSlitDistanceUm(params.slitDistance);
    }
    if (params.slitWidth !== undefined && Math.abs(params.slitWidth - slitWidthUm) > 0.05) {
      setSlitWidthUm(params.slitWidth);
    }
    if (params.observerIntensity !== undefined && Math.abs(params.observerIntensity - observerIntensity) > 0.02) {
      setObserverIntensity(params.observerIntensity);
    }
    if (params.emissionRate !== undefined && Math.round(params.emissionRate) !== emissionRate) {
      setEmissionRate(Math.round(params.emissionRate));
    }
  }, [params]);

  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  useEffect(() => {
    if (externalSpeed !== undefined && externalSpeed > 0) {
      setSimSpeed(externalSpeed);
    }
  }, [externalSpeed]);

  // Derived Quantum Telemetry
  const telemetry = useMemo(() => {
    const L_m = 1.2; // Screen distance (meters)
    const lambda_m = wavelengthNm * 1e-9;
    const d_m = slitDistanceUm * 1e-6;

    // Fringe spacing Delta y = lambda * L / d
    const fringeSpacingMm = (lambda_m * L_m / d_m) * 1000;
    // Quantum coherence factor gamma = 1 - observerIntensity
    const coherencePct = Math.round((1 - observerIntensity) * 100);
    // Fringe visibility V = (I_max - I_min) / (I_max + I_min)
    const visibility = (1 - observerIntensity).toFixed(2);

    return {
      lambda: `${wavelengthNm} nm`,
      fringeSpacing: `${fringeSpacingMm.toFixed(2)} mm`,
      coherence: `${coherencePct}%`,
      visibility: `${visibility}`,
      totalHits: `${accumulatedHits}`,
      quantumState: observerIntensity > 0.75 ? 'Classical Particle Collapse' : observerIntensity > 0.2 ? 'Partial Decoherence' : 'Coherent Wave Superposition'
    };
  }, [wavelengthNm, slitDistanceUm, observerIntensity, accumulatedHits]);

  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        deBroglieWavelength: telemetry.lambda,
        fringeSpacing: telemetry.fringeSpacing,
        quantumCoherence: telemetry.coherence,
        fringeVisibility: telemetry.visibility,
        accumulatedHits: telemetry.totalHits,
        regime: telemetry.quantumState
      });
    }
  }, [telemetry, onTelemetryUpdate]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Dynamic Scene Meshes
  const waveMeshRef = useRef<THREE.Mesh | null>(null);
  const detectorScreenRef = useRef<THREE.Mesh | null>(null);
  const hitsPointsRef = useRef<THREE.Points | null>(null);
  const hitsPositionsRef = useRef<Float32Array>(new Float32Array(3000 * 3));
  const hitsColorsRef = useRef<Float32Array>(new Float32Array(3000 * 3));
  const hitsCountRef = useRef<number>(0);

  // Camera Orbit Interaction
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.55,
    phi: 0.35,
    radius: 20
  });
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync refs for animation loop
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const wavelengthRef = useRef(wavelengthNm);
  useEffect(() => { wavelengthRef.current = wavelengthNm; }, [wavelengthNm]);

  const slitDistRef = useRef(slitDistanceUm);
  useEffect(() => { slitDistRef.current = slitDistanceUm; }, [slitDistanceUm]);

  const observerRef = useRef(observerIntensity);
  useEffect(() => { observerRef.current = observerIntensity; }, [observerIntensity]);

  const simSpeedRef = useRef(simSpeed);
  useEffect(() => { simSpeedRef.current = simSpeed; }, [simSpeed]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030612);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(12, 16, 10);
    scene.add(dirLight);

    // 1. Electron Gun / Source (x = -8)
    const gunGeo = new THREE.CylinderGeometry(0.5, 0.7, 2.5, 16);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.rotation.z = Math.PI / 2;
    gun.position.set(-8, 0, 0);
    scene.add(gun);

    // Glowing emitter tip
    const tipGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(-6.6, 0, 0);
    scene.add(tip);

    // 2. Double-Slit Barrier Screen (x = -2)
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    // Top plate
    const topPlateGeo = new THREE.BoxGeometry(0.3, 4, 8);
    const topPlate = new THREE.Mesh(topPlateGeo, barrierMat);
    topPlate.position.set(-2, 3.2, 0);
    scene.add(topPlate);

    // Bottom plate
    const bottomPlateGeo = new THREE.BoxGeometry(0.3, 4, 8);
    const bottomPlate = new THREE.Mesh(bottomPlateGeo, barrierMat);
    bottomPlate.position.set(-2, -3.2, 0);
    scene.add(bottomPlate);

    // Center divider between slits
    const dividerGeo = new THREE.BoxGeometry(0.3, 1.6, 8);
    const divider = new THREE.Mesh(dividerGeo, barrierMat);
    divider.position.set(-2, 0, 0);
    scene.add(divider);

    // Which-Way Observer Detector Glow Indicators (at each slit)
    const detGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const detMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.0 });
    const detTop = new THREE.Mesh(detGeo, detMat);
    detTop.position.set(-1.8, 1.0, 0);
    scene.add(detTop);

    const detBottom = new THREE.Mesh(detGeo, detMat);
    detBottom.position.set(-1.8, -1.0, 0);
    scene.add(detBottom);

    // 3. Phosphorescent Detection Screen (x = +8)
    const screenGeo = new THREE.BoxGeometry(0.2, 8.5, 9.5);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.2
    });
    const detScreen = new THREE.Mesh(screenGeo, screenMat);
    detScreen.position.set(8, 0, 0);
    scene.add(detScreen);
    detectorScreenRef.current = detScreen;

    // 4. Wavefront Dynamic Surface Mesh
    const planeW = 10;
    const planeH = 7;
    const waveGeo = new THREE.PlaneGeometry(planeW, planeH, 60, 40);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.set(3, -0.05, 0);
    scene.add(waveMesh);
    waveMeshRef.current = waveMesh;

    // 5. Accumulated Particle Hits on Detection Screen
    const maxHits = 3000;
    const hitsGeo = new THREE.BufferGeometry();
    hitsGeo.setAttribute('position', new THREE.BufferAttribute(hitsPositionsRef.current, 3));
    hitsGeo.setAttribute('color', new THREE.BufferAttribute(hitsColorsRef.current, 3));
    const hitsMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const hitsPoints = new THREE.Points(hitsGeo, hitsMat);
    scene.add(hitsPoints);
    hitsPointsRef.current = hitsPoints;

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
    let t = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const dt = 0.016 * simSpeedRef.current;
      if (isPlayingRef.current) {
        t += dt;

        // Animate Wavefront ripples between slit barrier and screen
        if (waveMeshRef.current) {
          const pos = waveMeshRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          const posArr = pos.array as Float32Array;
          const k = (2 * Math.PI) / (wavelengthRef.current * 0.005);
          const omega = 8.0;
          const dY = (slitDistRef.current / 4.0) * 1.5;

          for (let i = 0; i < posArr.length / 3; i++) {
            const x = posArr[i * 3];
            const z = posArr[i * 3 + 1];

            // Distance to slit 1 and slit 2
            const r1 = Math.hypot(x + 5, z - dY);
            const r2 = Math.hypot(x + 5, z + dY);

            // Coherent superposition Psi = cos(k r1 - wt) + (1 - obs)*cos(k r2 - wt)
            const obs = observerRef.current;
            const psi1 = Math.cos(k * r1 - omega * t) / Math.max(1, Math.sqrt(r1));
            const psi2 = (1 - obs) * Math.cos(k * r2 - omega * t) / Math.max(1, Math.sqrt(r2));
            const intensity = (psi1 + psi2) * 0.4;

            posArr[i * 3 + 2] = intensity; // Elevate Y
          }
          pos.needsUpdate = true;
        }

        // Emit discrete quantum particle hits onto detector screen
        if (Math.random() < 0.65) {
          const obs = observerRef.current;
          const count = hitsCountRef.current;
          if (count < maxHits) {
            // Sample Y position on screen using Born rule probability distribution
            let ySample = 0;
            const k = (2 * Math.PI) / (wavelengthRef.current * 0.005);
            const dY = (slitDistRef.current / 4.0) * 1.5;

            // Rejection sampling for interference vs classical distribution
            for (let attempt = 0; attempt < 12; attempt++) {
              const testY = (Math.random() - 0.5) * 7.5;
              const r1 = Math.hypot(10, testY - dY);
              const r2 = Math.hypot(10, testY + dY);

              // Classical envelope
              const iClass = Math.exp(-((testY - dY) ** 2) / 3.0) + Math.exp(-((testY + dY) ** 2) / 3.0);
              // Quantum interference fringes
              const phaseDiff = k * (r1 - r2);
              const iQuantum = Math.cos(phaseDiff / 2) ** 2 * Math.exp(-(testY ** 2) / 6.0);

              const prob = (1 - obs) * iQuantum + obs * (iClass * 0.5);
              if (Math.random() < prob) {
                ySample = testY;
                break;
              }
            }

            const zSample = (Math.random() - 0.5) * 8.0;

            const idx = count;
            hitsPositionsRef.current[idx * 3] = 7.89; // Just in front of screen
            hitsPositionsRef.current[idx * 3 + 1] = ySample;
            hitsPositionsRef.current[idx * 3 + 2] = zSample;

            // Color: Electric cyan for coherent hits, Warm amber if observed
            if (obs > 0.5) {
              hitsColorsRef.current[idx * 3] = 1.0;
              hitsColorsRef.current[idx * 3 + 1] = 0.6;
              hitsColorsRef.current[idx * 3 + 2] = 0.2;
            } else {
              hitsColorsRef.current[idx * 3] = 0.0;
              hitsColorsRef.current[idx * 3 + 1] = 0.94;
              hitsColorsRef.current[idx * 3 + 2] = 1.0;
            }

            hitsCountRef.current++;
            setAccumulatedHits(hitsCountRef.current);

            if (hitsPointsRef.current) {
              hitsPointsRef.current.geometry.attributes.position.needsUpdate = true;
              hitsPointsRef.current.geometry.attributes.color.needsUpdate = true;
            }
          }
        }
      }

      // Camera Orbit
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

  // Draw 2D Theoretical Intensity Pattern I(y) on HUD Canvas
  useEffect(() => {
    const canvas = intensityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // CRT styling
    ctx.fillStyle = 'rgba(6, 12, 28, 0.92)';
    ctx.fillRect(0, 0, w, h);

    // Grid center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 8);
    ctx.lineTo(w / 2, h - 8);
    ctx.stroke();

    // Baseline
    ctx.beginPath();
    ctx.moveTo(10, h - 14);
    ctx.lineTo(w - 10, h - 14);
    ctx.stroke();

    // Theoretical curve I(y)
    const L = 1.2;
    const lambda = wavelengthNm * 1e-9;
    const d = slitDistanceUm * 1e-6;
    const a = slitWidthUm * 1e-6;

    ctx.strokeStyle = observerIntensity > 0.5 ? '#f59e0b' : '#00f0ff';
    ctx.lineWidth = 2.0;
    ctx.beginPath();

    for (let x = 10; x <= w - 10; x++) {
      const yNorm = ((x - w / 2) / (w / 2)) * 0.008; // -4mm to +4mm on screen
      const sinTheta = yNorm / L;

      // Single slit diffraction envelope beta = (pi * a / lambda) * sinTheta
      const beta = (Math.PI * a / lambda) * sinTheta;
      const sinc = beta !== 0 ? Math.sin(beta) / beta : 1.0;
      const diffEnvelope = sinc * sinc;

      // Double slit interference alpha = (pi * d / lambda) * sinTheta
      const alpha = (Math.PI * d / lambda) * sinTheta;
      const cosInterference = Math.cos(alpha) ** 2;

      // Coherent vs Decoherent intensity
      const iQuantum = diffEnvelope * cosInterference;
      const iClassical = diffEnvelope * 0.5;
      const intensity = (1 - observerIntensity) * iQuantum + observerIntensity * iClassical;

      const yPixel = h - 16 - intensity * (h - 26);
      if (x === 10) ctx.moveTo(x, yPixel);
      else ctx.lineTo(x, yPixel);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = observerIntensity > 0.5 ? '#f59e0b' : '#00f0ff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(
      observerIntensity > 0.5 ? 'Classical Double Bands (No Fringes)' : 'Quantum Wave Interference Fringes',
      12,
      14
    );
  }, [wavelengthNm, slitDistanceUm, slitWidthUm, observerIntensity]);

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
    cameraAngleRef.current.radius = Math.max(6, Math.min(40, cameraAngleRef.current.radius + e.deltaY * 0.02));
  };

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.55, phi: 0.35, radius: 20 };
  };

  const handleResetScreen = () => {
    hitsCountRef.current = 0;
    setAccumulatedHits(0);
    if (hitsPointsRef.current) {
      hitsPositionsRef.current.fill(0);
      hitsPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#030612',
        overflow: 'hidden',
        userSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas Viewport */}
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
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#c084fc',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            Quantum Mechanics
          </span>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Double-Slit Wave-Particle Duality
          </h3>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
          Wavefunction interference fringes vs discrete quantum impacts. Toggle the Which-Way Observer to induce quantum decoherence and wavefunction collapse.
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
          <span style={{ color: '#00f0ff', fontWeight: 600 }}>Fringe Spacing:</span>
          <MathView math="\Delta y = \frac{\lambda L}{d}" block={false} />
        </div>
      </div>

      {/* Top Right Live Quantum Telemetry Readout */}
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
          Quantum Telemetry
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: '0.76rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Wavelength λ</div>
            <div style={{ color: '#00f0ff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.lambda}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Fringe Spacing</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.fringeSpacing}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Quantum Coherence</div>
            <div style={{ color: observerIntensity > 0.5 ? '#f59e0b' : '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {telemetry.coherence}
            </div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Fringe Visibility</div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.visibility}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Detected Hits</div>
            <div style={{ color: '#a855f7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.totalHits}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Slit Separation</div>
            <div style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{slitDistanceUm} μm</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
          Regime: {telemetry.quantumState}
        </div>
      </div>

      {/* Bottom Center Theoretical Intensity Distribution HUD */}
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
            Screen Intensity Distribution I(y)
          </span>
          <span style={{ fontSize: '0.70rem', color: observerIntensity > 0.5 ? '#f59e0b' : '#00f0ff', fontWeight: 700 }}>
            {observerIntensity > 0.5 ? 'Classical Collapse' : 'Wave Superposition'}
          </span>
        </div>
        <canvas ref={intensityCanvasRef} width={380} height={70} style={{ borderRadius: '4px', display: 'block' }} />
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
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          onClick={handleResetScreen}
          className="btn btn-secondary btn-xs"
          style={{ padding: '3px 9px', fontSize: '0.72rem' }}
          title="Clear Accumulated Hits"
        >
          Clear Screen
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
