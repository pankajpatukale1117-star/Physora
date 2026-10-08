import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

export interface BlackHole3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const BlackHole3DLab: React.FC<BlackHole3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: externalSpeed,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Core Simulation Physical Parameters
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [bhMass, setBhMass] = useState<number>(10); // Solar masses (M_sun)
  const [spinA, setSpinA] = useState<number>(0.65); // Dimensionless Kerr spin a (0 - 0.99)
  const [accretionRate, setAccretionRate] = useState<number>(1.2); // Accretion rate factor
  const [lensingStrength, setLensingStrength] = useState<number>(1.0); // Lensing warping factor
  const [jetPower, setJetPower] = useState<number>(0.8); // Relativistic jet emission
  const [simSpeed, setSimSpeed] = useState<number>(1.0);

  // Visual Overlays & Toggles
  const [showPhotonSphere, setShowPhotonSphere] = useState<boolean>(true);
  const [showIsco, setShowIsco] = useState<boolean>(true);
  const [showJets, setShowJets] = useState<boolean>(true);
  const [showDopplerShift, setShowDopplerShift] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'equatorial' | 'polar' | 'inclined'>('inclined');

  // Sync external parameters from control settings panel
  useEffect(() => {
    if (!params) return;
    if (params.mass !== undefined && Math.abs(params.mass - bhMass) > 0.05) {
      setBhMass(params.mass);
    }
    if (params.spin !== undefined && Math.abs(params.spin - spinA) > 0.01) {
      setSpinA(params.spin);
    }
    if (params.accretion !== undefined && Math.abs(params.accretion - accretionRate) > 0.05) {
      setAccretionRate(params.accretion);
    }
    if (params.lensing !== undefined && Math.abs(params.lensing - lensingStrength) > 0.05) {
      setLensingStrength(params.lensing);
    }
    if (params.jetPower !== undefined && Math.abs(params.jetPower - jetPower) > 0.05) {
      setJetPower(params.jetPower);
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

  // Relativistic telemetry calculations
  const telemetry = useMemo(() => {
    const rsKm = 2.95 * bhMass; // Schwarzschild radius in km
    const rPhotonKm = 1.5 * rsKm; // Photon sphere radius
    // Kerr ISCO decreases from 3.0 Rs down towards 0.5 Rs as spin approaches 1
    const iscoMultiplier = 3.0 - 2.0 * (spinA * spinA);
    const rIscoKm = rsKm * iscoMultiplier;
    // Gravitational time dilation factor at ISCO
    const timeDilation = Math.sqrt(Math.max(0.01, 1 - rsKm / rIscoKm));
    // Gravitational redshift z = 1/sqrt(1 - rs/r) - 1
    const redshiftZ = (1 / Math.max(0.05, Math.sqrt(1 - rsKm / (rIscoKm * 1.1)))) - 1;
    // Max Doppler boosting factor beta = v/c ~ sqrt(rs / 2 r_isco)
    const beta = Math.min(0.7, Math.sqrt(rsKm / (2 * rIscoKm)));
    const maxDopplerFactor = Math.sqrt((1 + beta) / (1 - beta));

    return {
      rs: `${rsKm.toFixed(1)} km`,
      rPhoton: `${rPhotonKm.toFixed(1)} km`,
      rIsco: `${rIscoKm.toFixed(1)} km`,
      timeDilation: `${(timeDilation * 100).toFixed(1)}%`,
      redshift: `z = +${redshiftZ.toFixed(2)}`,
      doppler: `${maxDopplerFactor.toFixed(2)}x`
    };
  }, [bhMass, spinA]);

  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        rsKm: telemetry.rs,
        rPhoton: telemetry.rPhoton,
        rIsco: telemetry.rIsco,
        timeDilation: telemetry.timeDilation,
        redshift: telemetry.redshift,
        dopplerBoost: telemetry.doppler
      });
    }
  }, [telemetry, onTelemetryUpdate]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Dynamic Mesh Refs
  const eventHorizonRef = useRef<THREE.Mesh | null>(null);
  const photonSphereMeshRef = useRef<THREE.Mesh | null>(null);
  const iscoRingRef = useRef<THREE.LineLoop | null>(null);
  const diskParticlesRef = useRef<THREE.Points | null>(null);
  const lensedHaloRef = useRef<THREE.Mesh | null>(null);
  const jetParticlesRef = useRef<THREE.Points | null>(null);

  // Particle positions and velocities
  const diskParticleDataRef = useRef<{ radius: number; angle: number; speed: number; baseColor: THREE.Color }[]>([]);
  const jetParticleDataRef = useRef<{ y: number; angle: number; speed: number; radius: number; dir: number }[]>([]);

  // Camera Orbit Interaction
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.35,
    phi: 0.28,
    radius: 38
  });
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync refs for the 60fps render loop
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const bhMassRef = useRef(bhMass);
  useEffect(() => { bhMassRef.current = bhMass; }, [bhMass]);

  const spinARef = useRef(spinA);
  useEffect(() => { spinARef.current = spinA; }, [spinA]);

  const accretionRateRef = useRef(accretionRate);
  useEffect(() => { accretionRateRef.current = accretionRate; }, [accretionRate]);

  const jetPowerRef = useRef(jetPower);
  useEffect(() => { jetPowerRef.current = jetPower; }, [jetPower]);

  const showDopplerShiftRef = useRef(showDopplerShift);
  useEffect(() => { showDopplerShiftRef.current = showDopplerShift; }, [showDopplerShift]);

  const simSpeedRef = useRef(simSpeed);
  useEffect(() => { simSpeedRef.current = simSpeed; }, [simSpeed]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02050c);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Ambient Starfield & Distant Gravitational Lensing Grid
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 180 + Math.random() * 80;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;

      // Color variation: White, light blue, warm orange
      const tempRnd = Math.random();
      if (tempRnd > 0.6) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
      } else if (tempRnd > 0.2) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.75; starColors[i * 3 + 2] = 0.5;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 4. Central Black Hole Event Horizon (R = 2.0 base units)
    const horizonGeo = new THREE.SphereGeometry(2.0, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    scene.add(eventHorizon);
    eventHorizonRef.current = eventHorizon;

    // 5. Photon Sphere Glow (R = 3.0 units = 1.5 * Rs)
    const photonSphereGeo = new THREE.SphereGeometry(3.0, 36, 36);
    const photonSphereMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const photonSphereMesh = new THREE.Mesh(photonSphereGeo, photonSphereMat);
    scene.add(photonSphereMesh);
    photonSphereMeshRef.current = photonSphereMesh;

    // 6. ISCO Reference Ring (R = 6.0 units for Schwarzschild, moves with Kerr spin)
    const iscoGeo = new THREE.BufferGeometry();
    const iscoPoints: THREE.Vector3[] = [];
    const iscoRadius = 6.0;
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      iscoPoints.push(new THREE.Vector3(Math.cos(angle) * iscoRadius, 0, Math.sin(angle) * iscoRadius));
    }
    iscoGeo.setFromPoints(iscoPoints);
    const iscoMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45 });
    const iscoRing = new THREE.LineLoop(iscoGeo, iscoMat);
    scene.add(iscoRing);
    iscoRingRef.current = iscoRing;

    // 7. Lensed Upper & Lower Gravitational Einstein Ring Halo
    const haloGeo = new THREE.RingGeometry(2.1, 4.4, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const lensedHalo = new THREE.Mesh(haloGeo, haloMat);
    lensedHalo.rotation.x = Math.PI / 2;
    scene.add(lensedHalo);
    lensedHaloRef.current = lensedHalo;

    // 8. Volumetric Accretion Disk Particles with Keplerian Rotation & Relativistic Beaming
    const diskCount = 4200;
    const diskGeo = new THREE.BufferGeometry();
    const diskPositions = new Float32Array(diskCount * 3);
    const diskColors = new Float32Array(diskCount * 3);
    const diskParticleData: { radius: number; angle: number; speed: number; baseColor: THREE.Color }[] = [];

    const innerRadius = 3.2; // just outside photon sphere
    const outerRadius = 16.5;

    for (let i = 0; i < diskCount; i++) {
      // Exponential distribution favoring inner hotter regions
      const radius = innerRadius + Math.pow(Math.random(), 1.6) * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      // Keplerian angular velocity omega ~ r^(-1.5)
      const speed = (0.9 / Math.pow(radius, 1.2));

      // Thermal gradient: Inner disk is brilliant incandescent cyan/white (10^7 K),
      // middle disk is yellow/orange, outer disk is deep red/crimson.
      const tNorm = (radius - innerRadius) / (outerRadius - innerRadius);
      const baseColor = new THREE.Color();
      if (tNorm < 0.25) {
        baseColor.setRGB(0.7 + (1 - tNorm * 4) * 0.3, 0.85 + (1 - tNorm * 4) * 0.15, 1.0);
      } else if (tNorm < 0.65) {
        baseColor.setRGB(1.0, 0.7 - (tNorm - 0.25) * 0.8, 0.1);
      } else {
        baseColor.setRGB(0.8 - (tNorm - 0.65) * 0.6, 0.12, 0.04);
      }

      diskParticleData.push({ radius, angle, speed, baseColor });

      const x = Math.cos(angle) * radius;
      // Disk vertical flare z increases slightly with radius
      const y = (Math.random() - 0.5) * (0.15 + 0.06 * radius);
      const z = Math.sin(angle) * radius;

      diskPositions[i * 3] = x;
      diskPositions[i * 3 + 1] = y;
      diskPositions[i * 3 + 2] = z;

      diskColors[i * 3] = baseColor.r;
      diskColors[i * 3 + 1] = baseColor.g;
      diskColors[i * 3 + 2] = baseColor.b;
    }

    diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));
    const diskMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const diskParticles = new THREE.Points(diskGeo, diskMat);
    scene.add(diskParticles);
    diskParticlesRef.current = diskParticles;
    diskParticleDataRef.current = diskParticleData;

    // 9. Relativistic Bipolar Jets (+Y and -Y axes)
    const jetCount = 1200;
    const jetGeo = new THREE.BufferGeometry();
    const jetPositions = new Float32Array(jetCount * 3);
    const jetColors = new Float32Array(jetCount * 3);
    const jetParticleData: { y: number; angle: number; speed: number; radius: number; dir: number }[] = [];

    for (let i = 0; i < jetCount; i++) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const y = (1.5 + Math.random() * 26.0) * dir;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 0.8;
      // Collimated jet with slight conical opening
      const radius = 0.2 + (Math.abs(y) / 26.0) * 1.8;

      jetParticleData.push({ y, angle, speed, radius, dir });

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      jetPositions[i * 3] = x;
      jetPositions[i * 3 + 1] = y;
      jetPositions[i * 3 + 2] = z;

      // Brilliant synchrotron blue/purple core
      const altitude = Math.abs(y) / 26.0;
      jetColors[i * 3] = 0.3 + 0.7 * (1 - altitude);
      jetColors[i * 3 + 1] = 0.6 + 0.4 * (1 - altitude);
      jetColors[i * 3 + 2] = 1.0;
    }

    jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
    jetGeo.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));
    const jetMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const jetParticles = new THREE.Points(jetGeo, jetMat);
    scene.add(jetParticles);
    jetParticlesRef.current = jetParticles;
    jetParticleDataRef.current = jetParticleData;

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
    let clockTime = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const dt = 0.016 * simSpeedRef.current;
      if (isPlayingRef.current) {
        clockTime += dt;
      }

      // Update camera position from orbit coordinates
      const cam = cameraRef.current;
      if (cam) {
        const { theta, phi, radius } = cameraAngleRef.current;
        const x = radius * Math.cos(phi) * Math.sin(theta);
        const y = radius * Math.sin(phi);
        const z = radius * Math.cos(phi) * Math.cos(theta);
        cam.position.set(x, y, z);
        cam.lookAt(0, 0, 0);
      }

      // Dynamic scaling according to black hole mass and spin
      const massScale = bhMassRef.current / 10;
      const rsRadius = 2.0 * Math.sqrt(massScale);
      const iscoMultiplier = 3.0 - 2.0 * (spinARef.current * spinARef.current);
      const currentIsco = rsRadius * (iscoMultiplier / 2.0);

      if (eventHorizonRef.current) {
        eventHorizonRef.current.scale.set(rsRadius / 2, rsRadius / 2, rsRadius / 2);
      }
      if (photonSphereMeshRef.current) {
        const rPh = rsRadius * 1.5;
        photonSphereMeshRef.current.scale.set(rPh / 3, rPh / 3, rPh / 3);
        photonSphereMeshRef.current.rotation.y += 0.003;
      }
      if (iscoRingRef.current) {
        iscoRingRef.current.scale.set(currentIsco / 6, currentIsco / 6, currentIsco / 6);
      }
      if (lensedHaloRef.current) {
        lensedHaloRef.current.scale.set(rsRadius / 2, rsRadius / 2, rsRadius / 2);
        lensedHaloRef.current.rotation.z += 0.005;
      }

      // Update Accretion Disk Particles & Relativistic Doppler Beaming
      if (diskParticlesRef.current && isPlayingRef.current) {
        const posAttr = diskParticlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        const colAttr = diskParticlesRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
        const pArray = posAttr.array as Float32Array;
        const cArray = colAttr.array as Float32Array;

        const observerAngle = cameraAngleRef.current.theta;

        for (let i = 0; i < diskParticleDataRef.current.length; i++) {
          const p = diskParticleDataRef.current[i];
          p.angle += p.speed * dt * 2.2;

          const r = p.radius * Math.sqrt(massScale);
          const x = Math.cos(p.angle) * r;
          const z = Math.sin(p.angle) * r;

          pArray[i * 3] = x;
          pArray[i * 3 + 2] = z;

          // Relativistic Doppler Factor:
          // Velocity vector is tangent: (-sin(angle), 0, cos(angle))
          // Dot product with line-of-sight vector to observer determine blue vs red shift
          if (showDopplerShiftRef.current) {
            const relAngle = p.angle - observerAngle;
            // Approaching observer: relAngle ~ 0 or sin(relAngle) < 0
            const dopplerSign = Math.sin(relAngle);
            const boost = 1.0 - dopplerSign * 0.45; // 0.55 to 1.45

            if (dopplerSign < 0) {
              // Approaching -> Blue-shifted & brighter
              cArray[i * 3] = Math.min(1.0, p.baseColor.r * boost * 0.8);
              cArray[i * 3 + 1] = Math.min(1.0, p.baseColor.g * boost * 1.15);
              cArray[i * 3 + 2] = Math.min(1.0, (p.baseColor.b + 0.2) * boost * 1.3);
            } else {
              // Receding -> Red-shifted & dimmer
              cArray[i * 3] = Math.min(1.0, p.baseColor.r * boost * 1.1);
              cArray[i * 3 + 1] = Math.max(0.05, p.baseColor.g * boost * 0.6);
              cArray[i * 3 + 2] = Math.max(0.02, p.baseColor.b * boost * 0.3);
            }
          }
        }
        posAttr.needsUpdate = true;
        if (showDopplerShiftRef.current) {
          colAttr.needsUpdate = true;
        }
      }

      // Update Relativistic Polar Jets
      if (jetParticlesRef.current && isPlayingRef.current) {
        const posAttr = jetParticlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        const pArray = posAttr.array as Float32Array;

        for (let i = 0; i < jetParticleDataRef.current.length; i++) {
          const jp = jetParticleDataRef.current[i];
          jp.y += jp.dir * jp.speed * dt * 12.0 * jetPowerRef.current;
          jp.angle += 0.08 * simSpeedRef.current; // Helical magnetic twist

          // Wrap particle back to base when it reaches jet boundary
          if (Math.abs(jp.y) > 28.0) {
            jp.y = jp.dir * (1.8 * Math.sqrt(massScale));
          }

          const currentRadius = jp.radius * (0.8 + Math.abs(jp.y) / 14.0);
          pArray[i * 3] = Math.cos(jp.angle) * currentRadius;
          pArray[i * 3 + 1] = jp.y;
          pArray[i * 3 + 2] = Math.sin(jp.angle) * currentRadius;
        }
        posAttr.needsUpdate = true;
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

  // Update Visual Toggles dynamically on Three.js objects
  useEffect(() => {
    if (photonSphereMeshRef.current) {
      photonSphereMeshRef.current.visible = showPhotonSphere;
    }
  }, [showPhotonSphere]);

  useEffect(() => {
    if (iscoRingRef.current) {
      iscoRingRef.current.visible = showIsco;
    }
  }, [showIsco]);

  useEffect(() => {
    if (jetParticlesRef.current) {
      jetParticlesRef.current.visible = showJets;
    }
  }, [showJets]);

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
    cameraAngleRef.current.phi = Math.max(-1.45, Math.min(1.45, cameraAngleRef.current.phi + dy * 0.007));
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(12, Math.min(90, cameraAngleRef.current.radius + e.deltaY * 0.04));
  };

  const handleZoom = (delta: number) => {
    cameraAngleRef.current.radius = Math.max(12, Math.min(90, cameraAngleRef.current.radius + delta));
  };

  const handleResetCamera = () => {
    cameraAngleRef.current = { theta: 0.35, phi: 0.28, radius: 38 };
    setCameraPreset('inclined');
  };

  const applyCameraPreset = (preset: 'equatorial' | 'polar' | 'inclined') => {
    setCameraPreset(preset);
    if (preset === 'equatorial') {
      cameraAngleRef.current = { theta: 0.0, phi: 0.02, radius: 32 };
    } else if (preset === 'polar') {
      cameraAngleRef.current = { theta: 0.0, phi: 1.42, radius: 42 };
    } else {
      cameraAngleRef.current = { theta: 0.35, phi: 0.32, radius: 38 };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#02050c',
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
          background: 'rgba(5, 10, 24, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          maxWidth: 360,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(0, 240, 255, 0.2)',
              color: '#00f0ff',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            General Relativity
          </span>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Kerr Black Hole &amp; Accretion Disk
          </h3>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
          Schwarzschild event horizon with photon sphere ($1.5 R_s$), ISCO frame dragging, Keplerian accretion disk with relativistic Doppler beaming, and gravitational lensing.
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
          <span style={{ color: '#00f0ff', fontWeight: 600 }}>Schwarzschild Radius:</span>
          <MathView math="R_s = \frac{2GM}{c^2}" block={false} />
        </div>
      </div>

      {/* Top Right Live Relativistic Telemetry Readout */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 20,
          background: 'rgba(5, 10, 24, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          minWidth: 230,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8 }}>
          Live Relativistic Telemetry
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: '0.76rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Horizon Radius (R_s)</div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.rs}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Photon Sphere</div>
            <div style={{ color: '#ffe066', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.rPhoton}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>ISCO Orbit</div>
            <div style={{ color: '#00f0ff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.rIsco}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Time Dilation (g)</div>
            <div style={{ color: '#a855f7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.timeDilation}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Gravitational Redshift</div>
            <div style={{ color: '#f97316', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.redshift}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Doppler Boosting</div>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.doppler}</div>
          </div>
        </div>
      </div>

      {/* Floating 3D Navigation & Viewport Controls (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        {/* Camera Orientation Presets */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px 6px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <span style={{ fontSize: '0.70rem', color: '#94a3b8', paddingLeft: 6, fontWeight: 700 }}>Angle:</span>
          <button
            onClick={() => applyCameraPreset('inclined')}
            className={`btn btn-xs ${cameraPreset === 'inclined' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 9px', fontSize: '0.72rem' }}
          >
            Inclined
          </button>
          <button
            onClick={() => applyCameraPreset('equatorial')}
            className={`btn btn-xs ${cameraPreset === 'equatorial' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 9px', fontSize: '0.72rem' }}
          >
            Equatorial
          </button>
          <button
            onClick={() => applyCameraPreset('polar')}
            className={`btn btn-xs ${cameraPreset === 'polar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '3px 9px', fontSize: '0.72rem' }}
          >
            Polar
          </button>
        </div>

        {/* Feature Toggles Pill Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '5px 8px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <button
            onClick={() => setShowPhotonSphere(!showPhotonSphere)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: showPhotonSphere ? 'rgba(255, 224, 102, 0.25)' : 'transparent',
              color: showPhotonSphere ? '#ffe066' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Photon Sphere
          </button>

          <button
            onClick={() => setShowIsco(!showIsco)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: showIsco ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
              color: showIsco ? '#00f0ff' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ISCO Orbit
          </button>

          <button
            onClick={() => setShowJets(!showJets)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: showJets ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: showJets ? '#c084fc' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Relativistic Jets
          </button>

          <button
            onClick={() => setShowDopplerShift(!showDopplerShift)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: showDopplerShift ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: showDopplerShift ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Doppler Shift
          </button>
        </div>
      </div>

      {/* Floating 3D Navigation Controls (Bottom Right) */}
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
          onClick={() => handleZoom(-5)}
          className="btn btn-secondary btn-xs"
          style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={() => handleZoom(5)}
          className="btn btn-secondary btn-xs"
          style={{ width: 28, height: 28, padding: 0, borderRadius: '50%' }}
          title="Zoom Out"
        >
          <ZoomOut size={13} />
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
