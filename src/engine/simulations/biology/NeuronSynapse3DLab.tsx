import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Compass
} from 'lucide-react';
import { MathView } from '../../../components/MathView';

export interface NeuronSynapse3DLabProps {
  params?: Record<string, number>;
  isPlaying?: boolean;
  speed?: number;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telemetry: Record<string, string>) => void;
}

export const NeuronSynapse3DLab: React.FC<NeuronSynapse3DLabProps> = ({
  params,
  isPlaying: externalIsPlaying,
  speed: externalSpeed,
  onTelemetryUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);

  // Core Physical & Biological Parameters
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [stimulusCurrent, setStimulusCurrent] = useState<number>(22); // uA/cm^2 (Threshold ~ 15)
  const [calciumConc, setCalciumConc] = useState<number>(2.0); // mM
  const [myelination, setMyelination] = useState<number>(0.85); // 0.1 to 1.0 (Conduction velocity scaling)
  const [vesiclePool, setVesiclePool] = useState<number>(30); // Synaptic vesicles
  const [simSpeed, setSimSpeed] = useState<number>(1.0);

  // View Mode: Macro Axon Conduction vs Micro Synaptic Cleft
  const [viewMode, setViewMode] = useState<'axon' | 'synapse'>('axon');

  // Sync external parameters from control drawer
  useEffect(() => {
    if (!params) return;
    if (params.stimulus !== undefined && Math.abs(params.stimulus - stimulusCurrent) > 0.5) {
      setStimulusCurrent(params.stimulus);
    }
    if (params.calcium !== undefined && Math.abs(params.calcium - calciumConc) > 0.1) {
      setCalciumConc(params.calcium);
    }
    if (params.myelin !== undefined && Math.abs(params.myelin - myelination) > 0.05) {
      setMyelination(params.myelin);
    }
    if (params.vesicles !== undefined && Math.round(params.vesicles) !== vesiclePool) {
      setVesiclePool(Math.round(params.vesicles));
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

  // Real-time Action Potential Oscilloscope State
  const oscHistoryRef = useRef<number[]>(new Array(160).fill(-70));
  const [currentVm, setCurrentVm] = useState<number>(-70);
  const [currentPhase, setCurrentPhase] = useState<string>('Resting (-70 mV)');

  // Derived Biological Telemetry
  const telemetry = useMemo(() => {
    const isAboveThreshold = stimulusCurrent >= 15;
    const firingRateHz = isAboveThreshold ? Math.round(12 + (stimulusCurrent - 15) * 2.8) : 0;
    // Saltatory conduction velocity v = 120 * myelination m/s
    const conductionVelocity = Math.round(15 + myelination * 105);
    // Synaptic cleft concentration
    const cleftConcMicroM = isAboveThreshold ? (calciumConc * 14.5 * (vesiclePool / 30)).toFixed(1) : '0.2';

    return {
      firingRate: `${firingRateHz} Hz`,
      velocity: `${conductionVelocity} m/s`,
      cleftConc: `${cleftConcMicroM} μM`,
      threshold: isAboveThreshold ? 'Excited (Suprathreshold)' : 'Subthreshold (No AP)'
    };
  }, [stimulusCurrent, calciumConc, myelination, vesiclePool]);

  useEffect(() => {
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        membranePotential: `${currentVm.toFixed(1)} mV`,
        phase: currentPhase,
        firingRate: telemetry.firingRate,
        conductionVelocity: telemetry.velocity,
        cleftNeurotransmitter: telemetry.cleftConc,
        excitability: telemetry.threshold
      });
    }
  }, [currentVm, currentPhase, telemetry, onTelemetryUpdate]);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Neuron Mesh References
  const neuronGroupRef = useRef<THREE.Group | null>(null);
  const synapseGroupRef = useRef<THREE.Group | null>(null);
  const actionPotentialWaveRef = useRef<THREE.Mesh | null>(null);
  const vesiclesParticlesRef = useRef<THREE.Points | null>(null);
  const ionParticlesRef = useRef<THREE.Points | null>(null);

  // Camera Orbit Interaction
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.45,
    phi: 0.25,
    radius: 22
  });
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync refs for animation loop
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const stimulusRef = useRef(stimulusCurrent);
  useEffect(() => { stimulusRef.current = stimulusCurrent; }, [stimulusCurrent]);

  const simSpeedRef = useRef(simSpeed);
  useEffect(() => { simSpeedRef.current = simSpeed; }, [simSpeed]);

  const viewModeRef = useRef(viewMode);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
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

    const pointLight = new THREE.PointLight(0x00f0ff, 2.0, 30);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(15, 20, 10);
    scene.add(dirLight);

    // ==========================================
    // 1. MACRO NEURON ANATOMY GROUP (Axon Scale)
    // ==========================================
    const neuronGroup = new THREE.Group();
    scene.add(neuronGroup);
    neuronGroupRef.current = neuronGroup;

    // Soma (Cell Body) - Organic deforming sphere
    const somaGeo = new THREE.DodecahedronGeometry(2.4, 2);
    const somaMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x0f172a,
      wireframe: false
    });
    const soma = new THREE.Mesh(somaGeo, somaMat);
    soma.position.set(-8, 0, 0);
    neuronGroup.add(soma);

    // Dendritic Arbors (Branching out from soma)
    const dendriteMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 1.6 - 0.8;
      const length = 3.5 + Math.random() * 2.5;
      const dendriteGeo = new THREE.CylinderGeometry(0.12, 0.35, length, 8);
      const dendrite = new THREE.Mesh(dendriteGeo, dendriteMat);
      dendrite.position.set(-8 + Math.cos(angle) * (2.2 + length / 2), Math.sin(angle) * (2.2 + length / 2), (Math.random() - 0.5) * 2);
      dendrite.rotation.z = angle - Math.PI / 2;
      neuronGroup.add(dendrite);
    }

    // Axon Hillock & Main Axon Shaft
    const axonShaftGeo = new THREE.CylinderGeometry(0.28, 0.38, 22, 16);
    const axonShaftMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.35 });
    const axonShaft = new THREE.Mesh(axonShaftGeo, axonShaftMat);
    axonShaft.rotation.z = Math.PI / 2;
    axonShaft.position.set(4, 0, 0);
    neuronGroup.add(axonShaft);

    // Myelin Sheaths with unmyelinated Nodes of Ranvier
    const myelinMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });

    const myelinCount = 5;
    for (let i = 0; i < myelinCount; i++) {
      const segLength = 3.2;
      const xPos = -4 + i * 4.2;
      const myelinGeo = new THREE.CylinderGeometry(0.68, 0.68, segLength, 16);
      const myelinMesh = new THREE.Mesh(myelinGeo, myelinMat);
      myelinMesh.rotation.z = Math.PI / 2;
      myelinMesh.position.set(xPos, 0, 0);
      neuronGroup.add(myelinMesh);

      // Node of Ranvier indicator ring
      const nodeGeo = new THREE.TorusGeometry(0.42, 0.08, 8, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.rotation.y = Math.PI / 2;
      nodeMesh.position.set(xPos + 2.1, 0, 0);
      neuronGroup.add(nodeMesh);
    }

    // Action Potential Traveling Wave Pulse
    const waveGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(-6, 0, 0);
    neuronGroup.add(waveMesh);
    actionPotentialWaveRef.current = waveMesh;

    // Axon Terminal Boutons
    const boutonGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const boutonMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 });
    const bouton = new THREE.Mesh(boutonGeo, boutonMat);
    bouton.position.set(15.2, 0, 0);
    neuronGroup.add(bouton);

    // ==========================================
    // 2. MICRO SYNAPTIC CLEFT GROUP (Synapse Scale)
    // ==========================================
    const synapseGroup = new THREE.Group();
    scene.add(synapseGroup);
    synapseGroup.visible = false;
    synapseGroupRef.current = synapseGroup;

    // Presynaptic Axon Terminal Membrane
    const preMembraneGeo = new THREE.CylinderGeometry(3.5, 4.2, 3, 24, 1, true);
    const preMembraneMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      roughness: 0.4
    });
    const preMembrane = new THREE.Mesh(preMembraneGeo, preMembraneMat);
    preMembrane.position.set(0, 2.5, 0);
    synapseGroup.add(preMembrane);

    // Postsynaptic Dendritic Spine Membrane
    const postMembraneGeo = new THREE.CylinderGeometry(4.5, 3.8, 2, 24, 1, true);
    const postMembraneMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      roughness: 0.4
    });
    const postMembrane = new THREE.Mesh(postMembraneGeo, postMembraneMat);
    postMembrane.position.set(0, -2.5, 0);
    synapseGroup.add(postMembrane);

    // Synaptic Vesicles Particles in Presynaptic Terminal
    const vesicleCount = 180;
    const vesicleGeo = new THREE.BufferGeometry();
    const vesiclePos = new Float32Array(vesicleCount * 3);
    for (let i = 0; i < vesicleCount; i++) {
      vesiclePos[i * 3] = (Math.random() - 0.5) * 3.8;
      vesiclePos[i * 3 + 1] = 0.5 + Math.random() * 3.2; // Inside presynaptic bulb
      vesiclePos[i * 3 + 2] = (Math.random() - 0.5) * 3.8;
    }
    vesicleGeo.setAttribute('position', new THREE.BufferAttribute(vesiclePos, 3));
    const vesicleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.35,
      transparent: true,
      opacity: 0.95
    });
    const vesiclesPoints = new THREE.Points(vesicleGeo, vesicleMat);
    synapseGroup.add(vesiclesPoints);
    vesiclesParticlesRef.current = vesiclesPoints;

    // Neurotransmitter Molecules in Synaptic Cleft (diffusing across gap)
    const ionCount = 350;
    const ionGeo = new THREE.BufferGeometry();
    const ionPos = new Float32Array(ionCount * 3);
    for (let i = 0; i < ionCount; i++) {
      ionPos[i * 3] = (Math.random() - 0.5) * 4.2;
      ionPos[i * 3 + 1] = -1.5 + Math.random() * 2.2; // In cleft gap (-1.5 to 0.7)
      ionPos[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
    }
    ionGeo.setAttribute('position', new THREE.BufferAttribute(ionPos, 3));
    const ionMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.22,
      transparent: true,
      opacity: 0.85
    });
    const ionPoints = new THREE.Points(ionGeo, ionMat);
    synapseGroup.add(ionPoints);
    ionParticlesRef.current = ionPoints;

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

    // Animation & Hodgkin-Huxley Oscilloscope Loop
    let t = 0;
    let waveX = -6;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const dt = 0.016 * simSpeedRef.current;
      if (isPlayingRef.current) {
        t += dt;

        // Propagate Action Potential along Axon
        if (stimulusRef.current >= 15) {
          waveX += dt * (18 * (0.3 + 0.7 * myelination));
          if (waveX > 15.2) {
            waveX = -6.0; // Reset back to soma/hillock
          }
          if (actionPotentialWaveRef.current) {
            actionPotentialWaveRef.current.position.x = waveX;
            actionPotentialWaveRef.current.scale.set(
              1 + Math.sin(t * 12) * 0.2,
              1 + Math.sin(t * 12) * 0.2,
              1 + Math.sin(t * 12) * 0.2
            );
          }
        }

        // Calculate Membrane Potential Vm(t) using Hodgkin-Huxley wave cycle
        if (stimulusRef.current >= 15) {
          // Normalized cycle phase in [0, 1]
          const cyclePeriod = 1.0 / (12 + (stimulusRef.current - 15) * 0.2);
          const phase = (t % cyclePeriod) / cyclePeriod;

          let vm = -70;
          let phaseLabel = 'Resting State';

          if (phase < 0.15) {
            // Depolarization up to threshold (-55) and peak (+40)
            const p = phase / 0.15;
            vm = -70 + p * 110;
            phaseLabel = 'Na+ Influx (Depolarization)';
          } else if (phase < 0.45) {
            // Repolarization (+40 down to -80)
            const p = (phase - 0.15) / 0.3;
            vm = 40 - p * 120;
            phaseLabel = 'K+ Efflux (Repolarization)';
          } else if (phase < 0.70) {
            // Hyperpolarization / Refractory (-80 up to -70)
            const p = (phase - 0.45) / 0.25;
            vm = -80 + p * 10;
            phaseLabel = 'Refractory Period (Na+/K+ Pump)';
          } else {
            vm = -70;
            phaseLabel = 'Resting Potential (-70 mV)';
          }

          setCurrentVm(vm);
          setCurrentPhase(phaseLabel);

          // Update Oscilloscope buffer
          oscHistoryRef.current.shift();
          oscHistoryRef.current.push(vm);
        } else {
          setCurrentVm(-70);
          setCurrentPhase('Subthreshold Resting (-70 mV)');
          oscHistoryRef.current.shift();
          oscHistoryRef.current.push(-70 + Math.sin(t * 8) * 1.5);
        }

        // Animate Neurotransmitter Cleft Diffusion in Synapse Mode
        if (ionParticlesRef.current && synapseGroup.visible) {
          const posAttr = ionParticlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
          const posArr = posAttr.array as Float32Array;
          for (let i = 0; i < ionCount; i++) {
            posArr[i * 3 + 1] -= dt * 1.2; // Diffuse downwards towards postsynaptic receptors
            if (posArr[i * 3 + 1] < -2.4) {
              posArr[i * 3 + 1] = 0.5; // Re-cycle back to presynaptic active zone
            }
          }
          posAttr.needsUpdate = true;
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

  // Toggle View Mode (Axon Scale vs Synapse Scale)
  useEffect(() => {
    if (neuronGroupRef.current && synapseGroupRef.current) {
      if (viewMode === 'axon') {
        neuronGroupRef.current.visible = true;
        synapseGroupRef.current.visible = false;
        cameraAngleRef.current = { theta: 0.45, phi: 0.25, radius: 22 };
      } else {
        neuronGroupRef.current.visible = false;
        synapseGroupRef.current.visible = true;
        cameraAngleRef.current = { theta: 0.8, phi: 0.35, radius: 10 };
      }
    }
  }, [viewMode]);

  // Draw 2D Membrane Potential Oscilloscope Trace
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark sleek CRT oscilloscope background
    ctx.fillStyle = 'rgba(6, 12, 28, 0.92)';
    ctx.fillRect(0, 0, w, h);

    // Grid lines (-70mV, -55mV threshold, 0mV, +40mV)
    const mapY = (vm: number) => h - 16 - ((vm + 90) / 140) * (h - 26);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [-70, -55, 0, 40].forEach(v => {
      const y = mapY(v);
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.fillText(`${v > 0 ? '+' : ''}${v}`, 8, y + 3);
    });

    // Threshold indicator line (-55 mV)
    const yThresh = mapY(-55);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(32, yThresh);
    ctx.lineTo(w - 10, yThresh);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Vm waveform trace
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const data = oscHistoryRef.current;
    const step = (w - 44) / data.length;

    for (let i = 0; i < data.length; i++) {
      const x = 34 + i * step;
      const y = mapY(data[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing sweep point at head
    const lastX = 34 + (data.length - 1) * step;
    const lastY = mapY(data[data.length - 1]);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [currentVm]);

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
    cameraAngleRef.current.radius = Math.max(5, Math.min(45, cameraAngleRef.current.radius + e.deltaY * 0.03));
  };

  const handleResetCamera = () => {
    if (viewMode === 'axon') {
      cameraAngleRef.current = { theta: 0.45, phi: 0.25, radius: 22 };
    } else {
      cameraAngleRef.current = { theta: 0.8, phi: 0.35, radius: 10 };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#040814',
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
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#38bdf8',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            Neurobiology &amp; Biophysics
          </span>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            3D Neuron Action Potential &amp; Synapse
          </h3>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>
          Saltatory conduction across Nodes of Ranvier, Hodgkin-Huxley membrane voltage dynamics, and neurotransmitter vesicle exocytosis across the synaptic cleft.
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
          <span style={{ color: '#00f0ff', fontWeight: 600 }}>Nernst Potential:</span>
          <MathView math="E_{ion} = \frac{RT}{zF} \ln \frac{[Ion]_{out}}{[Ion]_{in}}" block={false} />
        </div>
      </div>

      {/* Top Right Live Biophysical Telemetry Readout */}
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
          Live Biophysical Telemetry
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: '0.76rem' }}>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Membrane Vm</div>
            <div style={{ color: currentVm > -55 ? '#00f0ff' : '#94a3b8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {currentVm.toFixed(1)} mV
            </div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Conduction Speed</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.velocity}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Firing Frequency</div>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.firingRate}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.70rem' }}>Cleft Neurotransmitter</div>
            <div style={{ color: '#a855f7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{telemetry.cleftConc}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
          Phase: {currentPhase}
        </div>
      </div>

      {/* Bottom Center Hodgkin-Huxley Membrane Potential Oscilloscope HUD */}
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
            Live Membrane Voltage Oscilloscope V_m(t)
          </span>
          <span style={{ fontSize: '0.70rem', color: '#00f0ff', fontWeight: 700 }}>
            {currentVm.toFixed(1)} mV
          </span>
        </div>
        <canvas ref={oscCanvasRef} width={380} height={70} style={{ borderRadius: '4px', display: 'block' }} />
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
          onClick={() => setViewMode(viewMode === 'axon' ? 'synapse' : 'axon')}
          className="btn btn-primary btn-xs"
          style={{ padding: '3px 10px', fontSize: '0.72rem' }}
          title="Toggle Scale View"
        >
          {viewMode === 'axon' ? 'Zoom to Synapse' : 'Zoom to Axon'}
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
