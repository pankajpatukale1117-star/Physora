import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LiveGraph } from '../../graphs/LiveGraph';
import { VirtualStopwatch } from '../../instruments/ScientificInstruments';
import { UniversalPlaybackBar } from '../../ui/UniversalPlaybackBar';
import type { ActiveInstruments, GraphDataPoint } from '../../types';
import {
  Heart,
  Stethoscope,
  Volume2,
  VolumeX,
  Sliders,
  ChevronUp,
  Zap,
  Activity
} from 'lucide-react';

export interface CardiacHemodynamicsLabProps {
  isCompact?: boolean;
  params?: Record<string, number>;
  onParamChange?: (id: string, value: number) => void;
  onTelemetryUpdate?: (telem: Record<string, string>) => void;
}

// Particle interface for hemodynamic blood flow simulation
interface HemodynamicParticle {
  id: number;
  circuit: 'deox' | 'oxy';
  progress: number; // 0 to 1 along anatomical path
  offset: number; // lateral offset across lumen
  speedVariance: number;
}

export const CardiacHemodynamicsLab: React.FC<CardiacHemodynamicsLabProps> = ({
  isCompact = false,
  params,
  onParamChange,
  onTelemetryUpdate
}) => {
  // Physiological variables
  const [heartRateBpm, setHeartRateBpm] = useState(() => (params?.hr ?? 72)); // 40 - 180 bpm
  const [strokeVolumeMl, setStrokeVolumeMl] = useState(() => (params?.sv ?? 70)); // 40 - 120 mL
  const [contractility, setContractility] = useState(1.0); // inotropic state 0.6 - 1.5

  // Synchronize with external params (e.g. from challenge or state)
  useEffect(() => {
    if (params) {
      if (params.hr !== undefined && Math.abs(params.hr - heartRateBpm) > 0.5) {
        setHeartRateBpm(params.hr);
      }
      if (params.sv !== undefined && Math.abs(params.sv - strokeVolumeMl) > 0.5) {
        setStrokeVolumeMl(params.sv);
      }
    }
  }, [params]);

  // Playback state - defaults to 1.0x Normal physiological resting heart rate (72 BPM)
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Layer visualization toggles
  const [showConduction, setShowConduction] = useState(true);
  const [showBloodFlow, setShowBloodFlow] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showCoronaries, setShowCoronaries] = useState(true);

  const [activeInstruments, setActiveInstruments] = useState<ActiveInstruments>({
    ruler: false,
    protractor: false,
    stopwatch: false,
    forceMeter: false,
    multimeter: false,
    phMeter: false,
    liveGraph: true
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyclePhaseRef = useRef(0); // 0 to 1 normalized cardiac cycle phase
  const lastPhaseIndexRef = useRef(4); // track phase transitions for S1/S2 sound triggers
  const lastStateUpdateRef = useRef(0);
  const lastGraphSampleRef = useRef(0);

  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

  // Telemetry state
  const [telemetry, setTelemetry] = useState({
    phaseIndex: 4, // 0: Atrial Systole, 1: Isovolumetric Contraction, 2: Ventricular Ejection, 3: Isovolumetric Relaxation, 4: Passive Filling
    phaseName: 'Ventricular Passive Filling',
    cardiacOutputLpm: 5.04,
    ventricularPressureMmHg: 12,
    aorticPressureMmHg: 80,
    atrialPressureMmHg: 8,
    pulmonaryPressureMmHg: 12,
    mitralValveOpen: true,
    tricuspidValveOpen: true,
    aorticValveOpen: false,
    pulmonaryValveOpen: false,
    heartSound: 'Diastole',
    ejectionFractionPercent: 58
  });

  // Sound ripple animation ref (for visual pulse on S1/S2)
  const soundWaveRef = useRef<{ type: 's1' | 's2'; time: number } | null>(null);

  // Hemodynamic flow particles ref (40 deoxygenated + 40 oxygenated for rich fluid streams)
  const particlesRef = useRef<HemodynamicParticle[]>((() => {
    const list: HemodynamicParticle[] = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        id: i,
        circuit: 'deox',
        progress: i / 40,
        offset: ((i % 5) - 2) * 5,
        speedVariance: 0.88 + ((i % 7) / 7) * 0.25
      });
    }
    for (let i = 40; i < 80; i++) {
      list.push({
        id: i,
        circuit: 'oxy',
        progress: (i - 40) / 40,
        offset: (((i - 40) % 5) - 2) * 5,
        speedVariance: 0.88 + (((i - 40) % 7) / 7) * 0.25
      });
    }
    return list;
  })());

  // Synthesize realistic acoustic stethoscope heart sound using Web Audio API
  const playHeartSound = useCallback((type: 's1' | 's2') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 's1') {
        // S1 "LUB": Deeper, resonant thud (~70Hz tapering down to 42Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(72, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      } else {
        // S2 "DUB": Slightly sharper, higher snap (~105Hz down to 55Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio playback silently gracefully ignored if restricted by browser
    }
  }, [soundEnabled]);

  // Jump to specific cardiac cycle phase
  const handleJumpToPhase = (targetPhase: number) => {
    const phaseMarkers = [0.02, 0.16, 0.28, 0.53, 0.65];
    cyclePhaseRef.current = phaseMarkers[targetPhase] ?? 0;
  };

  // Step forward by 4% of cycle
  const handleStepForward = (stepFraction: number = 0.04) => {
    cyclePhaseRef.current = (cyclePhaseRef.current + stepFraction) % 1;
  };

  // Main Hemodynamics & Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDelta = (now - lastTime) / 1000;
      const deltaSec = Math.min(0.04, rawDelta) * speed;
      lastTime = now;

      // Cycle duration in seconds: T = 60 / BPM
      const cycleDuration = 60 / heartRateBpm;

      if (isPlaying) {
        cyclePhaseRef.current = (cyclePhaseRef.current + deltaSec / cycleDuration) % 1;
      }
      const phase = cyclePhaseRef.current;

      // Wiggers Diagram curves & phase logic calculation
      let pV = 10;
      let pAo = 80;
      let pLA = 8;
      let pRV = 5;
      let pPA = 12;
      let ecg = 0;
      let pName = 'Ventricular Passive Filling';
      let currentPhaseIdx = 4;
      let mitralOpen = true;
      let tricuspidOpen = true;
      let aorticOpen = false;
      let pulmonaryOpen = false;
      let sound = '';
      let particleVelocityFactor = 1.0;

      if (phase < 0.15) {
        currentPhaseIdx = 0;
        pName = 'Atrial Systole';
        const pSub = phase / 0.15;
        ecg = Math.sin(pSub * Math.PI) * 0.28; // P wave
        pV = 8 + pSub * 4;
        pLA = 8 + Math.sin(pSub * Math.PI) * 5; // atrial a-wave
        pAo = 82 - pSub * 3;
        pRV = 4 + pSub * 2;
        pPA = 13 - pSub * 1;
        mitralOpen = true;
        tricuspidOpen = true;
        aorticOpen = false;
        pulmonaryOpen = false;
        particleVelocityFactor = 1.4;
      } else if (phase < 0.22) {
        currentPhaseIdx = 1;
        pName = 'Isovolumetric Contraction (S₁ Lub)';
        const pSub = (phase - 0.15) / 0.07;
        ecg = pSub < 0.4 ? -0.35 + pSub * 3.8 : 1.25 - pSub * 2.2; // QRS complex
        pV = 12 + pSub * (80 - 12) * contractility;
        pAo = 79;
        pRV = 6 + pSub * (16 - 6);
        pPA = 12;
        pLA = 9;
        mitralOpen = false;
        tricuspidOpen = false;
        aorticOpen = false;
        pulmonaryOpen = false;
        sound = 'S₁ (Lub - AV Valves Snap Shut)';
        particleVelocityFactor = 0.2; // Swirling under pressure
      } else if (phase < 0.52) {
        currentPhaseIdx = 2;
        pName = 'Ventricular Ejection';
        const pSub = (phase - 0.22) / 0.30;
        ecg = 0.04;
        const peakP = 120 * contractility;
        pV = 80 + Math.sin(pSub * Math.PI) * (peakP - 80);
        pAo = pV - 2;
        pRV = 16 + Math.sin(pSub * Math.PI) * 11;
        pPA = pRV - 1;
        pLA = 7 + pSub * 3;
        mitralOpen = false;
        tricuspidOpen = false;
        aorticOpen = true;
        pulmonaryOpen = true;
        particleVelocityFactor = 2.8 * contractility; // Ejection rush
      } else if (phase < 0.58) {
        currentPhaseIdx = 3;
        pName = 'Isovolumetric Relaxation (S₂ Dub)';
        const pSub = (phase - 0.52) / 0.06;
        ecg = Math.sin(pSub * Math.PI) * 0.38; // T wave
        pV = 75 - pSub * (75 - 10);
        pAo = 94 - pSub * 12; // Dicrotic notch
        pRV = 18 - pSub * 13;
        pPA = 16 - pSub * 3;
        pLA = 9;
        mitralOpen = false;
        tricuspidOpen = false;
        aorticOpen = false;
        pulmonaryOpen = false;
        sound = 'S₂ (Dub - Semilunar Valves Snap Shut)';
        particleVelocityFactor = 0.3;
      } else {
        currentPhaseIdx = 4;
        pName = 'Ventricular Passive Filling';
        const pSub = (phase - 0.58) / 0.42;
        ecg = 0;
        pV = 8 + pSub * 4;
        pAo = 82 - pSub * 4;
        pRV = 4 + pSub * 2;
        pPA = 13 - pSub * 1;
        pLA = 8;
        mitralOpen = true;
        tricuspidOpen = true;
        aorticOpen = false;
        pulmonaryOpen = false;
        particleVelocityFactor = 1.1; // Steady passive inflow
      }

      // Check for S1 and S2 sound triggers on phase entrance
      if (currentPhaseIdx !== lastPhaseIndexRef.current) {
        if (currentPhaseIdx === 1) {
          playHeartSound('s1');
          soundWaveRef.current = { type: 's1', time: now };
        } else if (currentPhaseIdx === 3) {
          playHeartSound('s2');
          soundWaveRef.current = { type: 's2', time: now };
        }
        lastPhaseIndexRef.current = currentPhaseIdx;
      }

      // Advance particles in their circuits
      if (isPlaying) {
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          const adv = (deltaSec / cycleDuration) * particleVelocityFactor * pt.speedVariance * 0.9;
          pt.progress = (pt.progress + adv) % 1;
        }
      }

      // Throttle React state updates to ~60ms
      if (now - lastStateUpdateRef.current > 60) {
        lastStateUpdateRef.current = now;
        const co = (heartRateBpm * strokeVolumeMl) / 1000;
        const edv = 120; // standard End-Diastolic Volume mL
        const ef = Math.round((strokeVolumeMl / edv) * 100);

        const nextTelem = {
          phaseIndex: currentPhaseIdx,
          phaseName: pName,
          cardiacOutputLpm: Math.round(co * 100) / 100,
          ventricularPressureMmHg: Math.round(pV),
          aorticPressureMmHg: Math.round(pAo),
          atrialPressureMmHg: Math.round(pLA),
          pulmonaryPressureMmHg: Math.round(pPA),
          mitralValveOpen: mitralOpen,
          tricuspidValveOpen: tricuspidOpen,
          aorticValveOpen: aorticOpen,
          pulmonaryValveOpen: pulmonaryOpen,
          heartSound: sound || (phase > 0.52 ? 'Diastole' : 'Systole'),
          ejectionFractionPercent: ef
        };
        setTelemetry(nextTelem);
        onTelemetryUpdate?.({
          co: `${nextTelem.cardiacOutputLpm} L/min`,
          ef: `${nextTelem.ejectionFractionPercent}%`,
          phase: nextTelem.phaseName,
          pv: `${nextTelem.ventricularPressureMmHg} mmHg`,
          pao: `${nextTelem.aorticPressureMmHg} mmHg`
        });
      }

      // Sample graph data every 45ms
      if (now - lastGraphSampleRef.current > 45) {
        lastGraphSampleRef.current = now;
        setGraphData(prev => {
          const next = [
            ...prev,
            {
              t: Math.round(now / 100) / 10,
              pV: Math.round(pV),
              pAo: Math.round(pAo),
              ecg: Math.round(ecg * 25 + 40)
            }
          ];
          return next.slice(-180);
        });
      }

      renderCanvas(now);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, heartRateBpm, strokeVolumeMl, contractility, playHeartSound, onTelemetryUpdate]);

  // Comprehensive Medical-Atlas Anatomical Heart Renderer
  const renderCanvas = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep obsidian medical background with subtle vignette
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 50, w * 0.5, h * 0.45, w * 0.7);
    bgGrad.addColorStop(0, '#0c1222');
    bgGrad.addColorStop(1, '#050811');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle medical coordinate grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const phase = cyclePhaseRef.current;

    // Physiological chamber mechanical deformation calculation
    let atriaContraction = 0;
    let ventContraction = 0;

    if (phase < 0.15) {
      atriaContraction = Math.sin((phase / 0.15) * Math.PI) * 0.20;
      ventContraction = -0.04 * Math.sin((phase / 0.15) * Math.PI); // slight diastolic filling stretch
    } else if (phase < 0.22) {
      ventContraction = 0.06 * contractility;
    } else if (phase < 0.52) {
      const pSub = (phase - 0.22) / 0.30;
      ventContraction = Math.sin(pSub * Math.PI) * 0.22 * contractility;
    } else if (phase < 0.58) {
      const pSub = (phase - 0.52) / 0.06;
      ventContraction = (1 - pSub) * 0.10 * contractility;
    }

    // Adaptive responsive scaling: keeps heart centered and majestic
    const scale = Math.min(w / 540, h / 560, 1.25) * 0.95;
    const cx = w * 0.5;
    const cy = h * 0.47;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // =========================================================================
    // 1. PERICARDIAL SAC AURA & BACKGROUND CONTOUR
    // =========================================================================
    const apexX = 46 * (1 - ventContraction * 0.4);
    const apexY = 165 * (1 - ventContraction * 0.6);

    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.06)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(apexX * 0.3, 35, 145, 175, 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // =========================================================================
    // 2. GREAT VESSELS (Drawn behind chambers with 3D cylindrical lighting)
    // =========================================================================

    // A. Superior Vena Cava (SVC) - Right Superior Blue Trunk with Brachiocephalic junction
    const svcGrad = ctx.createLinearGradient(-115, -230, -70, -230);
    svcGrad.addColorStop(0, '#1e3a8a');
    svcGrad.addColorStop(0.3, '#3b82f6');
    svcGrad.addColorStop(0.7, '#60a5fa');
    svcGrad.addColorStop(1, '#1d4ed8');

    ctx.fillStyle = svcGrad;
    ctx.beginPath();
    ctx.moveTo(-118, -230);
    // Flaring brachiocephalic junction at top
    ctx.bezierCurveTo(-125, -210, -112, -180, -110, -120);
    ctx.lineTo(-72, -120);
    ctx.bezierCurveTo(-72, -180, -68, -210, -60, -230);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Azygos Vein arch entering SVC
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-112, -165, 10, -0.5 * Math.PI, 0.5 * Math.PI);
    ctx.stroke();

    // B. Inferior Vena Cava (IVC) - Ascends into Right Atrium from inferior aspect
    const ivcGrad = ctx.createLinearGradient(-125, 60, -85, 60);
    ivcGrad.addColorStop(0, '#1e3a8a');
    ivcGrad.addColorStop(0.4, '#3b82f6');
    ivcGrad.addColorStop(1, '#1d4ed8');

    ctx.fillStyle = ivcGrad;
    ctx.beginPath();
    ctx.moveTo(-125, 45);
    ctx.bezierCurveTo(-128, 90, -124, 120, -120, 140);
    ctx.lineTo(-86, 140);
    ctx.bezierCurveTo(-88, 120, -90, 85, -92, 45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // C. Ascending Aorta, Bulb & Massive Aortic Arch (Arterial Red with 3D Specular Highlight)
    // Originates from LV base with Sinuses of Valsalva bulges, arches up and loops over pulmonary bifurcation
    const aortaGrad = ctx.createLinearGradient(-35, -240, 65, -90);
    aortaGrad.addColorStop(0, '#991b1b');
    aortaGrad.addColorStop(0.3, '#dc2626');
    aortaGrad.addColorStop(0.6, '#ef4444');
    aortaGrad.addColorStop(1, '#7f1d1d');

    ctx.fillStyle = aortaGrad;
    ctx.beginPath();
    // Aortic root & Sinuses of Valsalva (bulb)
    ctx.moveTo(-18, -85);
    ctx.bezierCurveTo(-32, -95, -34, -130, -28, -170);
    // Outer arch curve
    ctx.bezierCurveTo(-22, -225, 20, -235, 35, -235);
    ctx.bezierCurveTo(80, -235, 102, -180, 102, -100);
    ctx.lineTo(72, -100);
    // Inner arch curve
    ctx.bezierCurveTo(72, -160, 56, -196, 32, -196);
    ctx.bezierCurveTo(6, -196, 10, -155, 18, -90);
    ctx.closePath();
    ctx.fill();

    // Specular vascular highlight along the curve of the aortic arch
    ctx.strokeStyle = 'rgba(254, 205, 211, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-20, -170);
    ctx.bezierCurveTo(-14, -220, 18, -228, 35, -228);
    ctx.bezierCurveTo(70, -228, 92, -180, 92, -115);
    ctx.stroke();

    // Three Branches of the Aortic Arch:
    // 1. Brachiocephalic Trunk (Innominate artery) - wide takeoff with bifurcation flare
    ctx.fillStyle = aortaGrad;
    ctx.beginPath();
    ctx.moveTo(-12, -226);
    ctx.bezierCurveTo(-16, -245, -22, -255, -24, -265);
    ctx.lineTo(-6, -265);
    ctx.bezierCurveTo(-4, -255, 2, -240, 6, -228);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(254, 205, 211, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2. Left Common Carotid Artery
    ctx.beginPath();
    ctx.moveTo(14, -232);
    ctx.lineTo(14, -270);
    ctx.lineTo(28, -270);
    ctx.lineTo(28, -232);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Left Subclavian Artery
    ctx.beginPath();
    ctx.moveTo(38, -230);
    ctx.bezierCurveTo(40, -248, 44, -260, 48, -268);
    ctx.lineTo(60, -268);
    ctx.bezierCurveTo(56, -255, 52, -240, 50, -228);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ligamentum Arteriosum (Fibrous band between underside of aortic arch and pulmonary trunk)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(22, -192);
    ctx.lineTo(10, -165);
    ctx.stroke();
    ctx.setLineDash([]);

    // D. Pulmonary Trunk & Arteries (Arises from RV Infundibulum, crosses anterior to ascending aorta)
    const pulmGrad = ctx.createLinearGradient(-45, -165, 30, -75);
    pulmGrad.addColorStop(0, '#1e3a8a');
    pulmGrad.addColorStop(0.3, '#2563eb');
    pulmGrad.addColorStop(0.7, '#3b82f6');
    pulmGrad.addColorStop(1, '#1d4ed8');

    ctx.fillStyle = pulmGrad;
    ctx.beginPath();
    // Conus arteriosus outflow
    ctx.moveTo(-46, -55);
    ctx.bezierCurveTo(-52, -115, -38, -145, -8, -150);
    // Right Pulmonary Artery branch (passes horizontally under aortic arch toward right lung)
    ctx.lineTo(-95, -166);
    ctx.bezierCurveTo(-102, -175, -102, -185, -95, -190);
    ctx.lineTo(-8, -166);
    // Left Pulmonary Artery branch (branches leftward toward left lung)
    ctx.lineTo(52, -160);
    ctx.bezierCurveTo(58, -150, 58, -140, 52, -135);
    ctx.lineTo(16, -135);
    ctx.bezierCurveTo(-5, -110, -16, -80, -18, -55);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // E. Pulmonary Veins (Oxygenated Red - 4 distinct vascular ostia entering LA)
    ctx.fillStyle = '#dc2626';
    // Right superior and inferior pulmonary veins
    ctx.beginPath();
    ctx.roundRect(112, -118, 32, 15, [0, 6, 6, 0]);
    ctx.fill();
    ctx.roundRect(112, -94, 32, 15, [0, 6, 6, 0]);
    ctx.fill();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1;
    ctx.stroke();

    // =========================================================================
    // 3. MAIN MYOCARDIUM (Anatomical Heart Contour with Spiral Striations & Sulci)
    // =========================================================================
    ctx.save();

    // Rich volumetric myocardial muscle gradient
    const myoGrad = ctx.createRadialGradient(apexX * 0.4, 35, 25, 0, 30, 220);
    myoGrad.addColorStop(0, '#9f1239'); // Rich muscular crimson
    myoGrad.addColorStop(0.5, '#881337'); // Deep cardiac muscle red
    myoGrad.addColorStop(0.85, '#6b0c26'); // Compact deep myocardium
    myoGrad.addColorStop(1, '#4c0519'); // Dark epicardium border

    ctx.fillStyle = myoGrad;
    ctx.beginPath();
    // Right Atrium lateral border with pectinate auricle tip
    ctx.moveTo(-116, -45 - atriaContraction * 14);
    ctx.bezierCurveTo(-148, -98, -60, -136, -15, -105);
    // Base across fibrous skeleton
    ctx.bezierCurveTo(0, -95, 22, -95, 36, -105);
    // Left Atrium lateral border with left auricle flap
    ctx.bezierCurveTo(78, -132, 142, -98, 122, -45 - atriaContraction * 14);
    // Left Ventricle thick free wall curving down to Apex
    ctx.bezierCurveTo(
      150 * (1 - ventContraction * 0.25),
      35,
      126 * (1 - ventContraction * 0.35),
      130,
      apexX,
      apexY
    );
    // Right Ventricle free wall curving back up to base
    ctx.bezierCurveTo(
      -36 * (1 - ventContraction * 0.3),
      148,
      -132 * (1 - ventContraction * 0.22),
      68,
      -116,
      -45 - atriaContraction * 14
    );
    ctx.closePath();
    ctx.fill();

    // Outer Epicardium sleek perimeter line with subtle glow
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Helical & Spiral Myofibril Muscle Striation Lines (Authentic ventricular fiber orientation)
    ctx.strokeStyle = 'rgba(254, 205, 211, 0.14)';
    ctx.lineWidth = 1;
    for (let r = 60; r < 160; r += 15) {
      ctx.beginPath();
      ctx.arc(apexX * 0.35, 25, r, 0.42 * Math.PI, 1.28 * Math.PI);
      ctx.stroke();
    }
    for (let r = 45; r < 135; r += 15) {
      ctx.beginPath();
      ctx.arc(apexX * 0.72, 38, r, -0.22 * Math.PI, 0.58 * Math.PI);
      ctx.stroke();
    }

    // Epicardial Adipose Tissue Fat Pads along the sulci (Realistic yellow/amber accents)
    ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
    ctx.beginPath();
    ctx.ellipse(8, -22, 18, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(apexX * 0.5, 45, 12, 6, 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // =========================================================================
    // 4. INTERNAL CHAMBER LUMENS (Endocardial Cavities & Blood Pools)
    // =========================================================================

    // A. Right Atrium (RA) - Top Left Chamber with Pectinate Muscles & Crista Terminalis
    const raW = 40 * (1 - atriaContraction);
    const raH = 35 * (1 - atriaContraction * 0.8);
    const raX = -74;
    const raY = -70 + atriaContraction * 8;

    const raGrad = ctx.createRadialGradient(raX, raY, 4, raX, raY, raW);
    raGrad.addColorStop(0, 'rgba(59, 130, 246, 0.75)');
    raGrad.addColorStop(0.7, 'rgba(30, 64, 175, 0.5)');
    raGrad.addColorStop(1, 'rgba(15, 23, 42, 0.45)');
    ctx.fillStyle = raGrad;
    ctx.beginPath();
    ctx.ellipse(raX, raY, raW, raH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Musculi Pectinati (Combed muscular ridges in RA anterior wall)
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.25)';
    ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(raX - raW * 0.8, raY + i * 8);
      ctx.lineTo(raX - raW * 0.2, raY + i * 6);
      ctx.stroke();
    }

    // Fossa Ovalis (Thin oval depression on interatrial septum with raised limbus border)
    ctx.fillStyle = 'rgba(30, 58, 138, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-26, -65, 9, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Limbus Fossae Ovalis (muscular rim)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // B. Left Atrium (LA) - Top Right Chamber receiving 4 Pulmonary Veins
    const laW = 38 * (1 - atriaContraction);
    const laH = 35 * (1 - atriaContraction * 0.8);
    const laX = 68;
    const laY = -68 + atriaContraction * 8;

    const laGrad = ctx.createRadialGradient(laX, laY, 4, laX, laY, laW);
    laGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
    laGrad.addColorStop(0.7, 'rgba(185, 28, 28, 0.5)');
    laGrad.addColorStop(1, 'rgba(15, 23, 42, 0.45)');
    ctx.fillStyle = laGrad;
    ctx.beginPath();
    ctx.ellipse(laX, laY, laW, laH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(252, 165, 165, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // C. Right Ventricle (RV) - Crescent Chamber with Trabeculae Carneae & Moderator Band
    const rvSqueeze = ventContraction * 0.85;
    const rvGrad = ctx.createRadialGradient(-58, 40, 10, -58, 40, 60);
    rvGrad.addColorStop(0, 'rgba(59, 130, 246, 0.85)');
    rvGrad.addColorStop(0.65, 'rgba(29, 78, 216, 0.6)');
    rvGrad.addColorStop(1, 'rgba(15, 23, 42, 0.55)');
    ctx.fillStyle = rvGrad;
    ctx.beginPath();
    ctx.moveTo(-25, -25);
    // Crescent muscular free wall
    ctx.bezierCurveTo(
      -78 * (1 - rvSqueeze * 0.3),
      -10,
      -98 * (1 - rvSqueeze * 0.35),
      48,
      -46 * (1 - rvSqueeze * 0.4),
      110
    );
    // Along interventricular septum
    ctx.bezierCurveTo(-32, 90, -18, 30, -18, -25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Trabeculae Carneae (Rich muscular ridges lining RV wall)
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.28)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-62, 22);
    ctx.lineTo(-46, 48);
    ctx.moveTo(-82, 50);
    ctx.lineTo(-62, 75);
    ctx.moveTo(-52, 78);
    ctx.lineTo(-38, 98);
    ctx.stroke();

    // Moderator Band (Septomarginal Trabecula - Iconic anatomical bridge carrying Right Bundle branch!)
    const modBandGrad = ctx.createLinearGradient(-22, 65, -68, 55);
    modBandGrad.addColorStop(0, '#7f1d1d');
    modBandGrad.addColorStop(1, '#9f1239');
    ctx.strokeStyle = modBandGrad;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, 65);
    ctx.lineTo(-65 * (1 - rvSqueeze * 0.3), 56 * (1 - rvSqueeze * 0.2));
    ctx.stroke();
    // Inner electrical wire inside moderator band
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // D. Left Ventricle (LV) - Massive Thick Conical Chamber with Apical Trabeculations
    const lvSqueeze = ventContraction * 1.0;
    const lvGrad = ctx.createRadialGradient(48, 45, 10, 48, 45, 60);
    lvGrad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
    lvGrad.addColorStop(0.65, 'rgba(185, 28, 28, 0.65)');
    lvGrad.addColorStop(1, 'rgba(15, 23, 42, 0.55)');
    ctx.fillStyle = lvGrad;
    ctx.beginPath();
    ctx.moveTo(18, -25);
    // Outflow tract & septum boundary
    ctx.bezierCurveTo(16, 30, 22, 98, apexX - 6, apexY - 24);
    // Thick lateral free wall
    ctx.bezierCurveTo(
      88 * (1 - lvSqueeze * 0.35),
      120 * (1 - lvSqueeze * 0.4),
      98 * (1 - lvSqueeze * 0.3),
      42,
      76,
      -25
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(252, 165, 165, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // LV Apical Trabeculae Carneae
    ctx.strokeStyle = 'rgba(254, 205, 211, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 95);
    ctx.lineTo(48, 120);
    ctx.moveTo(56, 85);
    ctx.lineTo(68, 105);
    ctx.stroke();

    // =========================================================================
    // 5. INTERVENTRICULAR SEPTUM & CARDIAC FIBROUS SKELETON
    // =========================================================================

    // Central Muscular Septum (IVS - ~20px thick)
    ctx.fillStyle = '#6b0c26';
    ctx.beginPath();
    ctx.moveTo(-16, -26);
    ctx.lineTo(16, -26);
    ctx.bezierCurveTo(20, 30, 22, 98, apexX - 4, apexY - 20);
    ctx.bezierCurveTo(10, 98, -15, 60, -22, -26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9f1239';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Membranous Upper Septum (Thin fibrous portion beneath aortic root)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, -26, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cardiac Fibrous Skeleton (Annuli Fibrosi rings around AV valves)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Tricuspid annulus
    ctx.ellipse(-62, -26, 20, 4, 0, 0, Math.PI * 2);
    // Mitral annulus
    ctx.ellipse(54, -26, 20, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // =========================================================================
    // 6. SUBVALVULAR APPARATUS (Papillary Muscles & Branching Chordae Tendineae)
    // =========================================================================

    // RV Papillary Muscles (Anterior & Septal pillars)
    const rvPapX = -65 * (1 - rvSqueeze * 0.3);
    const rvPapY = 56 * (1 - rvSqueeze * 0.2);
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(rvPapX - 11, rvPapY + 22);
    ctx.lineTo(rvPapX, rvPapY);
    ctx.lineTo(rvPapX + 11, rvPapY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // LV Papillary Muscles (Stout Anterolateral & Posteromedial pillars)
    const lvPap1X = 42 * (1 - lvSqueeze * 0.2);
    const lvPap1Y = 66 * (1 - lvSqueeze * 0.2);
    const lvPap2X = 76 * (1 - lvSqueeze * 0.3);
    const lvPap2Y = 62 * (1 - lvSqueeze * 0.2);

    ctx.fillStyle = '#7f1d1d';
    // Pillar 1
    ctx.beginPath();
    ctx.moveTo(lvPap1X - 9, lvPap1Y + 24);
    ctx.lineTo(lvPap1X, lvPap1Y);
    ctx.lineTo(lvPap1X + 9, lvPap1Y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Pillar 2
    ctx.beginPath();
    ctx.moveTo(lvPap2X - 9, lvPap2Y + 22);
    ctx.lineTo(lvPap2X, lvPap2Y);
    ctx.lineTo(lvPap2X + 9, lvPap2Y + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // =========================================================================
    // 7. FOUR CARDIAC VALVES (Realistic Curved Cusps, Coaptation & Chordae)
    // =========================================================================

    // A. Tricuspid Valve (RA -> RV)
    const triOpen = telemetry.tricuspidValveOpen;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';

    if (triOpen) {
      // Leaflets flared open downward into RV cavity with curved cusps
      ctx.beginPath();
      ctx.moveTo(-80, -25);
      ctx.quadraticCurveTo(-76, -14, -70, -5);
      ctx.moveTo(-44, -25);
      ctx.quadraticCurveTo(-48, -14, -54, -5);
      ctx.stroke();

      // Branching chordae tendineae (fan-like attachments)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-70, -5);
      ctx.lineTo(rvPapX - 3, rvPapY);
      ctx.moveTo(-70, -5);
      ctx.lineTo(rvPapX + 3, rvPapY);
      ctx.moveTo(-54, -5);
      ctx.lineTo(rvPapX, rvPapY);
      ctx.stroke();
    } else {
      // Billowing upward dome closure in systole against RV pressure
      ctx.beginPath();
      ctx.moveTo(-80, -25);
      ctx.quadraticCurveTo(-70, -21, -62, -22);
      ctx.quadraticCurveTo(-54, -21, -44, -25);
      ctx.stroke();

      // Taut, tensed branching chordae tendineae holding leaflets
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-62, -22);
      ctx.lineTo(rvPapX - 4, rvPapY);
      ctx.moveTo(-62, -22);
      ctx.lineTo(rvPapX + 4, rvPapY);
      ctx.moveTo(-71, -23);
      ctx.lineTo(rvPapX - 2, rvPapY);
      ctx.stroke();
    }

    // B. Mitral / Bicuspid Valve (LA -> LV)
    const mitOpen = telemetry.mitralValveOpen;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.4;

    if (mitOpen) {
      // Curved anterior and scalloped posterior leaflets open into LV
      ctx.beginPath();
      ctx.moveTo(34, -25);
      ctx.quadraticCurveTo(38, -12, 45, -4);
      ctx.moveTo(74, -25);
      ctx.quadraticCurveTo(68, -12, 60, -4);
      ctx.stroke();

      // Branching fan-like chordae tendineae to dual papillary muscles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(45, -4);
      ctx.lineTo(lvPap1X - 3, lvPap1Y);
      ctx.moveTo(45, -4);
      ctx.lineTo(lvPap1X + 3, lvPap1Y);
      ctx.moveTo(60, -4);
      ctx.lineTo(lvPap2X - 2, lvPap2Y);
      ctx.moveTo(60, -4);
      ctx.lineTo(lvPap2X + 3, lvPap2Y);
      ctx.stroke();
    } else {
      // Snapped firmly shut (Systole) - Leaflets coapt tightly with central seal
      ctx.beginPath();
      ctx.moveTo(34, -25);
      ctx.quadraticCurveTo(44, -21, 54, -22);
      ctx.quadraticCurveTo(64, -21, 74, -25);
      ctx.stroke();

      // Taut chordae tendineae under maximum 120 mmHg systolic tension
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(54, -22);
      ctx.lineTo(lvPap1X, lvPap1Y);
      ctx.moveTo(54, -22);
      ctx.lineTo(lvPap2X, lvPap2Y);
      ctx.moveTo(44, -23);
      ctx.lineTo(lvPap1X + 2, lvPap1Y);
      ctx.moveTo(64, -23);
      ctx.lineTo(lvPap2X - 2, lvPap2Y);
      ctx.stroke();
    }

    // C. Pulmonary Semilunar Valve (RV -> Pulmonary Trunk)
    const pulmOpen = telemetry.pulmonaryValveOpen;
    ctx.strokeStyle = pulmOpen ? '#60a5fa' : '#ffffff';
    ctx.lineWidth = 2.5;
    if (pulmOpen) {
      // Ejecting: cusps push against sinus walls
      ctx.beginPath();
      ctx.moveTo(-42, -56);
      ctx.lineTo(-44, -74);
      ctx.moveTo(-20, -56);
      ctx.lineTo(-18, -74);
      ctx.stroke();

      // Ejection surge jet
      ctx.fillStyle = 'rgba(96, 165, 250, 0.55)';
      ctx.beginPath();
      ctx.arc(-31, -74, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Closed 3-pocket crescent cusps with central nodule
      ctx.beginPath();
      ctx.moveTo(-42, -58);
      ctx.quadraticCurveTo(-31, -50, -20, -58);
      ctx.stroke();
      // Central nodule
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-31, -54, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // D. Aortic Semilunar Valve (LV -> Aortic Root / Sinuses of Valsalva)
    const aoOpen = telemetry.aorticValveOpen;
    ctx.strokeStyle = aoOpen ? '#facc15' : '#ffffff';
    ctx.lineWidth = 2.6;
    if (aoOpen) {
      // High-pressure systolic ejection surge
      ctx.beginPath();
      ctx.moveTo(2, -76);
      ctx.lineTo(-2, -96);
      ctx.moveTo(24, -76);
      ctx.lineTo(28, -96);
      ctx.stroke();

      // High velocity blood jet into aortic arch
      const jetGrad = ctx.createRadialGradient(13, -98, 2, 13, -98, 20);
      jetGrad.addColorStop(0, '#fef08a');
      jetGrad.addColorStop(0.4, '#ef4444');
      jetGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = jetGrad;
      ctx.beginPath();
      ctx.arc(13, -98, 20, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Closed crescent cusps supporting 80 mmHg with central Nodule of Arantius
      ctx.beginPath();
      ctx.moveTo(2, -76);
      ctx.quadraticCurveTo(13, -68, 24, -76);
      ctx.stroke();
      // Nodule of Arantius
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(13, -72, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // =========================================================================
    // 8. CORONARY SURFACE MICRO-VASCULATURE (LAD, RCA, Cardiac Veins & Sulcus)
    // =========================================================================
    if (showCoronaries) {
      ctx.save();
      // Left Anterior Descending (LAD) Artery - branching down anterior interventricular sulcus
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, -26);
      ctx.bezierCurveTo(4, 25, 12, 75, apexX - 5, apexY - 16);
      ctx.stroke();

      // LAD Diagonal and Septal perforator branches
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      // Diagonal 1
      ctx.moveTo(8, 15);
      ctx.lineTo(28, 35);
      // Diagonal 2
      ctx.moveTo(12, 50);
      ctx.lineTo(34, 75);
      // Septal branch (leftward)
      ctx.moveTo(7, 30);
      ctx.lineTo(-8, 45);
      ctx.stroke();

      // Great Cardiac Vein (Cyan venous vessel traveling parallel to LAD)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(14, -26);
      ctx.bezierCurveTo(8, 22, 16, 70, apexX, apexY - 20);
      ctx.stroke();

      // Right Coronary Artery (RCA) - tracing right AV groove
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -26);
      ctx.bezierCurveTo(-45, -24, -75, -20, -95, -15);
      ctx.stroke();

      ctx.restore();
    }

    // =========================================================================
    // 9. CARDIAC CONDUCTION SYSTEM (SA Node, AV Node, His, Branches & Purkinje)
    // =========================================================================
    if (showConduction) {
      ctx.save();

      // Conduction pathway lines
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([3, 3]);

      // Internodal pathways from SA node to AV node
      ctx.beginPath();
      ctx.moveTo(-82, -88);
      ctx.bezierCurveTo(-65, -70, -35, -50, -5, -34);
      ctx.stroke();

      // Bundle of His through membranous septum
      ctx.beginPath();
      ctx.moveTo(-5, -34);
      ctx.lineTo(-2, -6);
      ctx.stroke();

      // Left & Right Bundle Branches down septum
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(-12, 60); // Right branch
      ctx.moveTo(-2, -6);
      ctx.lineTo(14, 75); // Left branch
      ctx.stroke();

      // Right branch continuing through Moderator Band to anterior wall
      ctx.beginPath();
      ctx.moveTo(-12, 60);
      ctx.lineTo(-65 * (1 - rvSqueeze * 0.3), 56 * (1 - rvSqueeze * 0.2));
      ctx.stroke();

      // Purkinje fibers arborizing up ventricular free walls
      ctx.beginPath();
      ctx.moveTo(-12, 60);
      ctx.lineTo(-42, 85);
      ctx.lineTo(-65, 45);

      ctx.moveTo(14, 75);
      ctx.lineTo(apexX - 4, apexY - 25);
      ctx.lineTo(78, 55);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Animated traveling electric spark / wavefront synchronized with ECG
      let sparkX = -82;
      let sparkY = -88;
      let sparkGlow = 0;

      if (phase < 0.12) {
        // Atrial conduction (P wave)
        const tSub = phase / 0.12;
        sparkX = -82 + tSub * (-5 - -82);
        sparkY = -88 + tSub * (-34 - -88);
        sparkGlow = 1;
      } else if (phase < 0.18) {
        // AV Node physiological delay (~0.12s)
        sparkX = -5;
        sparkY = -34;
        sparkGlow = 0.8;
      } else if (phase < 0.24) {
        // Ventricular rapid excitation (QRS)
        const tSub = (phase - 0.18) / 0.06;
        sparkX = -5 + tSub * (apexX - -5);
        sparkY = -34 + tSub * (apexY - 25 - -34);
        sparkGlow = 1.4;
      }

      // Draw active electrical spark
      if (sparkGlow > 0) {
        const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, 14 * sparkGlow);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.3, '#fde047');
        sparkGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 14 * sparkGlow, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sinoatrial (SA) Node - Pulsing Golden Pacemaker Beacon
      const saPulsing = Math.sin(now * 0.008) * 2;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-82, -88, 5.5 + saPulsing * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Atrioventricular (AV) Node - Relay Hub
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-5, -34, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // =========================================================================
    // 10. HEMODYNAMIC BLOOD FLOW PARTICLES (Dynamic Pulsatile Circulation)
    // =========================================================================
    if (showBloodFlow) {
      ctx.save();
      const particles = particlesRef.current;

      const getDeoxCoord = (p: number, off: number) => {
        let x = 0;
        let y = 0;
        if (p < 0.25) {
          const t = p / 0.25;
          x = -95 + t * (-74 - -95) + off * 0.4;
          y = -190 + t * (-70 - -190);
        } else if (p < 0.45) {
          const t = (p - 0.25) / 0.20;
          x = -74 + t * (-62 - -74) + off * 0.6;
          y = -70 + t * (-25 - -70);
        } else if (p < 0.70) {
          const t = (p - 0.45) / 0.25;
          x = -62 + Math.sin(t * Math.PI) * -15 + t * (-31 - -62) + off * 0.8;
          y = -25 + t * (60 - -25) - (t > 0.5 ? (t - 0.5) * 2 * 115 : 0);
        } else {
          const t = (p - 0.70) / 0.30;
          x = -31 + t * (-65 - -31) + off * 0.4;
          y = -55 + t * (-160 - -55);
        }
        return { x, y };
      };

      const getOxyCoord = (p: number, off: number) => {
        let x = 0;
        let y = 0;
        if (p < 0.25) {
          const t = p / 0.25;
          x = 120 + t * (68 - 120) + off * 0.4;
          y = -95 + t * (-68 - -95);
        } else if (p < 0.45) {
          const t = (p - 0.25) / 0.20;
          x = 68 + t * (54 - 68) + off * 0.6;
          y = -68 + t * (-25 - -68);
        } else if (p < 0.70) {
          const t = (p - 0.45) / 0.25;
          x = 54 + Math.sin(t * Math.PI) * 12 + t * (13 - 54) + off * 0.8;
          y = -25 + t * (75 - -25) - (t > 0.5 ? (t - 0.5) * 2 * 150 : 0);
        } else {
          const t = (p - 0.70) / 0.30;
          x = 13 + t * (35 - 13) + off * 0.4;
          y = -76 + t * (-230 - -76);
        }
        return { x, y };
      };

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        if (pt.circuit === 'deox') {
          const ptPos = getDeoxCoord(pt.progress, pt.offset);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(ptPos.x, ptPos.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const ptPos = getOxyCoord(pt.progress, pt.offset);
          ctx.fillStyle = '#ff4b72';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(ptPos.x, ptPos.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // =========================================================================
    // 11. S1 / S2 HEART SOUND SHOCKWAVE PULSE
    // =========================================================================
    if (soundWaveRef.current) {
      const elapsedMs = now - soundWaveRef.current.time;
      if (elapsedMs < 600) {
        const soundProgress = elapsedMs / 600;
        const waveRadius = 40 + soundProgress * 140;
        const alpha = (1 - soundProgress) * 0.6;
        const waveColor = soundWaveRef.current.type === 's1' ? `rgba(244, 63, 94, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;

        ctx.save();
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 3 * (1 - soundProgress);
        ctx.beginPath();
        ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = waveColor;
        ctx.textAlign = 'center';
        ctx.fillText(soundWaveRef.current.type === 's1' ? '⚡ S₁ (LUB)' : '⚡ S₂ (DUB)', 0, -waveRadius - 6);
        ctx.restore();
      } else {
        soundWaveRef.current = null;
      }
    }

    // =========================================================================
    // 12. CLEAN MEDICAL-ATLAS LABELS & PRESSURE PILLS
    // =========================================================================
    if (showLabels) {
      ctx.save();
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';

      // Great Vessels Labels
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('SVC', -95, -234);
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('AORTIC ARCH', 24, -238);
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('PULM TRUNK', -32, -170);

      // Chambers Labels & Live Pressure Readings
      // Right Atrium
      ctx.fillStyle = '#ffffff';
      ctx.fillText('RA', raX, raY - 4);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '7.5px monospace';
      ctx.fillText(`${telemetry.atrialPressureMmHg} mmHg`, raX, raY + 9);

      // Left Atrium
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('LA', laX, laY - 4);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '7.5px monospace';
      ctx.fillText(`${telemetry.atrialPressureMmHg} mmHg`, laX, laY + 9);

      // Right Ventricle
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('RV', -55, 34);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '7.5px monospace';
      ctx.fillText(`${telemetry.pulmonaryPressureMmHg} mmHg`, -55, 47);

      // Left Ventricle
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('LV', 52, 34);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '7.5px monospace';
      ctx.fillText(`${telemetry.ventricularPressureMmHg} mmHg`, 52, 47);

      // Valve Status Badges
      ctx.font = '8px system-ui, sans-serif';
      // Tricuspid
      ctx.fillStyle = telemetry.tricuspidValveOpen ? '#34d399' : '#f87171';
      ctx.fillText(`Tricuspid: ${telemetry.tricuspidValveOpen ? 'OPEN' : 'SHUT'}`, -62, -36);

      // Mitral
      ctx.fillStyle = telemetry.mitralValveOpen ? '#34d399' : '#f87171';
      ctx.fillText(`Mitral: ${telemetry.mitralValveOpen ? 'OPEN' : 'SHUT'}`, 54, -36);

      ctx.restore();
    }

    ctx.restore(); // Restore heart center translation

    // Anatomical Orientation Note (Bottom Left of Canvas)
    ctx.font = '8.5px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'left';
    ctx.fillText('ANATOMICAL ANTERIOR CORONAL VIEW (PATIENT RIGHT IS CANVAS LEFT)', 14, h - 14);

    ctx.restore(); // Restore root canvas scale
  };

  const handleToggleInstrument = (k: keyof ActiveInstruments) => {
    setActiveInstruments(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const graphChannels = [
    { key: 'pV', label: 'LV Pressure (Pv)', color: '#ef4444', unit: 'mmHg' },
    { key: 'pAo', label: 'Aortic Pressure (Pao)', color: '#f59e0b', unit: 'mmHg' },
    { key: 'ecg', label: 'ECG Trace', color: '#10b981' }
  ];

  const phaseList = [
    { id: 0, name: 'Atrial Systole', ecg: 'P Wave', valves: 'AV Open, SL Shut', start: 0, end: 15 },
    { id: 1, name: 'Isovolumetric Contraction', ecg: 'QRS Complex', valves: 'All 4 Shut (S₁ Lub)', start: 15, end: 22 },
    { id: 2, name: 'Ventricular Ejection', ecg: 'ST Segment', valves: 'SL Open, AV Shut', start: 22, end: 52 },
    { id: 3, name: 'Isovolumetric Relaxation', ecg: 'T Wave', valves: 'All 4 Shut (S₂ Dub)', start: 52, end: 58 },
    { id: 4, name: 'Passive Ventricular Filling', ecg: 'Isoelectric', valves: 'AV Open, SL Shut', start: 58, end: 100 }
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#080d1a',
        color: '#f8fafc',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 25,
          gap: 12,
          flexWrap: 'wrap',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexShrink: 1 }}>
          <div
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid #f43f5e',
              color: '#fb7185',
              fontWeight: 800,
              fontSize: '0.70rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Heart size={12} fill="#f43f5e" />
            <span>PHYSIOLOGY ENGINE</span>
          </div>

          <span
            style={{
              fontWeight: 700,
              fontSize: '0.86rem',
              color: '#f1f5f9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isCompact ? 'Cardiac Hemodynamics' : '4-Chamber Cardiac Cycle & Hemodynamics Lab'}
          </span>
        </div>

        {/* Speed & Layer Controls in Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {/* Speed Presets */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '3px 6px',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginRight: 2 }}>Pacing:</span>
            {[
              { label: '0.25x Slow-Mo', val: 0.25 },
              { label: '0.5x Half-Speed', val: 0.5 },
              { label: '1.0x Normal', val: 1.0 }
            ].map(p => (
              <button
                key={p.val}
                onClick={() => setSpeed(p.val)}
                style={{
                  background: speed === p.val ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  border: speed === p.val ? '1px solid #38bdf8' : '1px solid transparent',
                  color: speed === p.val ? '#38bdf8' : '#cbd5e1',
                  borderRadius: 4,
                  fontSize: '0.68rem',
                  fontWeight: speed === p.val ? 700 : 500,
                  padding: '2px 6px',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Stethoscope Audio Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable Heart Sounds' : 'Enable Acoustic Stethoscope Audio'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: 6,
              background: soundEnabled ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: soundEnabled ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.70rem',
              color: soundEnabled ? '#34d399' : '#cbd5e1',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Stethoscope size={13} />
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'Stethoscope: ON' : 'Stethoscope: OFF'}</span>
          </button>

          {/* Toggle Controls Panel Button (Mobile / Desktop) */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.70rem',
              color: '#f8fafc',
              cursor: 'pointer'
            }}
          >
            <Sliders size={12} />
            <span>{panelOpen ? 'Hide Controls' : 'Show Controls'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Cardiac Phase Selector Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          background: 'rgba(11, 18, 33, 0.92)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto',
          zIndex: 20
        }}
      >
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap', marginRight: 4 }}>
          PHASE SCRUB:
        </span>
        {phaseList.map(item => {
          const isActive = telemetry.phaseIndex === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleJumpToPhase(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 20,
                background: isActive ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#fecdd3' : '#94a3b8',
                fontSize: '0.70rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isActive ? '#f43f5e' : 'rgba(255,255,255,0.2)'
                }}
              />
              <span>{item.name}</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.7 }}>({item.ecg})</span>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Viewport */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Physiological Controls Drawer */}
        {panelOpen && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 290,
              maxHeight: 'calc(100% - 24px)',
              background: 'rgba(11, 18, 33, 0.94)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: 10,
              backdropFilter: 'blur(12px)',
              padding: '14px',
              zIndex: 30,
              overflowY: 'auto',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fb7185', letterSpacing: '0.04em' }}>
                HEMODYNAMICS & PACING
              </span>
              <button
                onClick={() => setPanelOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
              >
                <ChevronUp size={16} />
              </button>
            </div>

            {/* Heart Rate Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 3 }}>
                <span style={{ color: '#cbd5e1' }}>Heart Rate (HR):</span>
                <span style={{ fontWeight: 700, color: '#fb7185', fontFamily: 'monospace' }}>
                  {heartRateBpm} BPM
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={160}
                step={2}
                value={heartRateBpm}
                onChange={e => {
                  const val = Number(e.target.value);
                  setHeartRateBpm(val);
                  onParamChange?.('hr', val);
                }}
                style={{ width: '100%', accentColor: '#fb7185' }}
              />
            </div>

            {/* Stroke Volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 3 }}>
                <span style={{ color: '#cbd5e1' }}>Stroke Volume (SV):</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                  {strokeVolumeMl} mL/beat
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={110}
                step={5}
                value={strokeVolumeMl}
                onChange={e => {
                  const val = Number(e.target.value);
                  setStrokeVolumeMl(val);
                  onParamChange?.('sv', val);
                }}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Myocardial Contractility */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 3 }}>
                <span style={{ color: '#cbd5e1' }}>Contractility (Inotropy):</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                  {contractility.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.5}
                step={0.1}
                value={contractility}
                onChange={e => setContractility(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24' }}
              />
            </div>

            {/* Visual Overlays Toggles */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '8px 10px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>ANATOMICAL OVERLAYS:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.70rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showConduction}
                  onChange={e => setShowConduction(e.target.checked)}
                  style={{ accentColor: '#fbbf24' }}
                />
                <Zap size={12} color="#fbbf24" />
                <span style={{ color: '#fde68a' }}>Conduction System (SA/AV/Purkinje)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.70rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showCoronaries}
                  onChange={e => setShowCoronaries(e.target.checked)}
                  style={{ accentColor: '#f43f5e' }}
                />
                <span style={{ color: '#fca5a5' }}>Coronary Microvasculature (LAD & RCA)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.70rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showBloodFlow}
                  onChange={e => setShowBloodFlow(e.target.checked)}
                  style={{ accentColor: '#38bdf8' }}
                />
                <span style={{ color: '#bae6fd' }}>Blood Flow Fluid Particles</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.70rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={e => setShowLabels(e.target.checked)}
                  style={{ accentColor: '#34d399' }}
                />
                <span style={{ color: '#a7f3d0' }}>Anatomy Labels & Pressures</span>
              </label>
            </div>

            {/* Real-time Hemodynamics Readings */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: '0.72rem', color: '#fb7185', marginBottom: 2 }}>
                <Activity size={13} />
                <span>HEMODYNAMIC METRICS:</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Cardiac Output (CO):</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                  {telemetry.cardiacOutputLpm} L/min
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Ejection Fraction (EF):</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                  {telemetry.ejectionFractionPercent}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>LV Pressure:</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>
                  {telemetry.ventricularPressureMmHg} mmHg
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Aortic Pressure:</span>
                <span style={{ fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                  {telemetry.aorticPressureMmHg} mmHg
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Mitral Valve:</span>
                <span style={{ fontWeight: 700, color: telemetry.mitralValveOpen ? '#34d399' : '#f87171' }}>
                  {telemetry.mitralValveOpen ? 'OPEN (Filling)' : 'SHUT (Closed)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Aortic Valve:</span>
                <span style={{ fontWeight: 700, color: telemetry.aorticValveOpen ? '#34d399' : '#f87171' }}>
                  {telemetry.aorticValveOpen ? 'OPEN (Ejecting)' : 'SHUT (Closed)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Anatomical Canvas Viewport */}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'default' }}
        />

        {activeInstruments.stopwatch && (
          <VirtualStopwatch onClose={() => handleToggleInstrument('stopwatch')} containerRef={containerRef} />
        )}

        {/* Live Synchronized Wiggers Diagram Graph */}
        {activeInstruments.liveGraph && (
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              width: 380,
              maxWidth: 'calc(100% - 28px)',
              zIndex: 30
            }}
          >
            <LiveGraph
              title="Wiggers Diagram: Pressures & ECG vs Time"
              data={graphData}
              channels={graphChannels}
              height={140}
              onClearData={() => setGraphData([])}
            />
          </div>
        )}
      </div>

      {/* Universal Bottom Playback Bar */}
      <UniversalPlaybackBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStepForward={() => handleStepForward(0.04)}
        speed={speed}
        onChangeSpeed={setSpeed}
        onReset={() => {
          cyclePhaseRef.current = 0;
          setGraphData([]);
        }}
        activeInstruments={activeInstruments}
        onToggleInstrument={handleToggleInstrument}
        availableInstruments={{ stopwatch: true, liveGraph: true }}
      />
    </div>
  );
};
