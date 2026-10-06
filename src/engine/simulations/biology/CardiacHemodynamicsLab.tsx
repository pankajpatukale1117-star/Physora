import React, { useState, useEffect, useRef } from 'react';
import { LiveGraph } from '../../graphs/LiveGraph';
import { VirtualStopwatch } from '../../instruments/ScientificInstruments';
import { UniversalPlaybackBar } from '../../ui/UniversalPlaybackBar';
import type { ActiveInstruments, GraphDataPoint } from '../../types';
import { Heart, Stethoscope } from 'lucide-react';

export const CardiacHemodynamicsLab: React.FC = () => {
  // Physiological variables
  const [heartRateBpm, setHeartRateBpm] = useState(72); // 40 - 180 bpm
  const [strokeVolumeMl, setStrokeVolumeMl] = useState(70); // 40 - 120 mL
  const [contractility, setContractility] = useState(1.0); // inotropic state 0.6 - 1.5

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
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
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

  // Telemetry
  const [telemetry, setTelemetry] = useState({
    phaseName: 'Ventricular Filling',
    cardiacOutputLpm: 5.04,
    ventricularPressureMmHg: 12,
    aorticPressureMmHg: 80,
    atrialPressureMmHg: 8,
    mitralValveOpen: true,
    aorticValveOpen: false,
    heartSound: 'Diastole'
  });

  // Main Hemodynamics Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const deltaSec = Math.min(0.04, (now - lastTime) / 1000) * speed;
      lastTime = now;

      if (isPlaying) {
        // Cycle duration in seconds: T = 60 / BPM
        const cycleDuration = 60 / heartRateBpm;
        cyclePhaseRef.current = (cyclePhaseRef.current + deltaSec / cycleDuration) % 1;
        const phase = cyclePhaseRef.current;

        // Wiggers Diagram curves calculation
        // Phase 0.00 - 0.15: Atrial Systole
        // Phase 0.15 - 0.20: Isovolumetric Contraction (S1 Lub)
        // Phase 0.20 - 0.50: Rapid & Reduced Ventricular Ejection
        // Phase 0.50 - 0.55: Isovolumetric Relaxation (S2 Dub)
        // Phase 0.55 - 1.00: Ventricular Filling
        let pV = 10;
        let pAo = 80;
        let pLA = 8;
        let ecg = 0;
        let pName = 'Ventricular Filling';
        let mitralOpen = true;
        let aorticOpen = false;
        let sound = '';

        if (phase < 0.15) {
          pName = 'Atrial Systole';
          const pSub = phase / 0.15;
          ecg = Math.sin(pSub * Math.PI) * 0.25; // P wave
          pV = 8 + pSub * 4;
          pLA = 8 + Math.sin(pSub * Math.PI) * 4;
          pAo = 82 - pSub * 3;
          mitralOpen = true;
          aorticOpen = false;
        } else if (phase < 0.22) {
          pName = 'Isovolumetric Contraction (S₁ Lub)';
          const pSub = (phase - 0.15) / 0.07;
          ecg = pSub < 0.5 ? -0.3 + pSub * 3.0 : 1.2 - pSub * 2.0; // QRS complex
          pV = 12 + pSub * (80 - 12) * contractility;
          pAo = 79;
          mitralOpen = false;
          aorticOpen = false;
          sound = 'S₁ (Lub - AV Valves Snap Shut)';
        } else if (phase < 0.50) {
          pName = 'Ventricular Ejection';
          const pSub = (phase - 0.22) / 0.28;
          ecg = 0.05;
          const peakP = 120 * contractility;
          pV = 80 + Math.sin(pSub * Math.PI) * (peakP - 80);
          pAo = pV - 2;
          mitralOpen = false;
          aorticOpen = true;
        } else if (phase < 0.56) {
          pName = 'Isovolumetric Relaxation (S₂ Dub)';
          const pSub = (phase - 0.50) / 0.06;
          ecg = Math.sin(pSub * Math.PI) * 0.35; // T wave
          pV = 75 - pSub * (75 - 10);
          pAo = 95 - pSub * 10;
          mitralOpen = false;
          aorticOpen = false;
          sound = 'S₂ (Dub - Semilunar Valves Snap Shut)';
        } else {
          pName = 'Ventricular Passive Filling';
          const pSub = (phase - 0.56) / 0.44;
          ecg = 0;
          pV = 8 + pSub * 4;
          pAo = 85 - pSub * 6;
          pLA = 8;
          mitralOpen = true;
          aorticOpen = false;
        }

        const co = (heartRateBpm * strokeVolumeMl) / 1000;

        setTelemetry({
          phaseName: pName,
          cardiacOutputLpm: Math.round(co * 100) / 100,
          ventricularPressureMmHg: Math.round(pV),
          aorticPressureMmHg: Math.round(pAo),
          atrialPressureMmHg: Math.round(pLA),
          mitralValveOpen: mitralOpen,
          aorticValveOpen: aorticOpen,
          heartSound: sound || (phase > 0.5 ? 'Diastole' : 'Systole')
        });

        // Graph points
        setGraphData(prev => {
          const next = [...prev, {
            t: Math.round(now / 100) / 10,
            pV: Math.round(pV),
            pAo: Math.round(pAo),
            ecg: Math.round(ecg * 25 + 40)
          }];
          return next.slice(-200);
        });
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, heartRateBpm, strokeVolumeMl, contractility]);

  const renderCanvas = () => {
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

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const phase = cyclePhaseRef.current;
    const isSystole = phase >= 0.15 && phase < 0.50;
    const contraction = isSystole ? Math.sin(((phase - 0.15) / 0.35) * Math.PI) * 0.16 : 0;

    const centerX = w * 0.5;
    const centerY = h * 0.46;
    const baseW = 190 * (1 - contraction);
    const baseH = 220 * (1 - contraction * 0.8);

    // Heart Myocardium Muscle Wall (Cross-section)
    ctx.save();
    ctx.translate(centerX, centerY);

    // Outer myocardium wall
    ctx.fillStyle = '#881337'; // Deep cardiac muscle red
    ctx.beginPath();
    ctx.ellipse(0, 15, baseW * 0.65, baseH * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Interventricular Septum (Middle divider)
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(-10, -baseH * 0.3, 20, baseH * 0.7);

    // Chambers:
    // Left Atrium (Top Right)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.arc(baseW * 0.28, -baseH * 0.28, baseW * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Right Atrium (Top Left)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.45)';
    ctx.beginPath();
    ctx.arc(-baseW * 0.28, -baseH * 0.28, baseW * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Left Ventricle (Bottom Right - Thick Wall)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.ellipse(baseW * 0.26, baseH * 0.15, baseW * 0.24, baseH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right Ventricle (Bottom Left)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-baseW * 0.26, baseH * 0.15, baseW * 0.24, baseH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Valve Leaflets:
    // Mitral Valve (between LA & LV)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    if (telemetry.mitralValveOpen) {
      // Open downward
      ctx.beginPath();
      ctx.moveTo(baseW * 0.16, -baseH * 0.05);
      ctx.lineTo(baseW * 0.22, baseH * 0.04);
      ctx.moveTo(baseW * 0.36, -baseH * 0.05);
      ctx.lineTo(baseW * 0.30, baseH * 0.04);
      ctx.stroke();
    } else {
      // Snapped shut
      ctx.beginPath();
      ctx.moveTo(baseW * 0.16, -baseH * 0.05);
      ctx.lineTo(baseW * 0.36, -baseH * 0.05);
      ctx.stroke();
    }

    // Aortic Valve (LV Outflow tract)
    if (telemetry.aorticValveOpen) {
      // Ejecting
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseW * 0.05, -baseH * 0.22);
      ctx.lineTo(baseW * 0.02, -baseH * 0.36);
      ctx.stroke();

      // Blood flow jets into Aorta
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(baseW * 0.04, -baseH * 0.42, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chamber Labels
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('RA (Deox)', -baseW * 0.28, -baseH * 0.28);
    ctx.fillText('LA (Oxy)', baseW * 0.28, -baseH * 0.28);
    ctx.fillText('RV', -baseW * 0.26, baseH * 0.15);
    ctx.fillText('LV', baseW * 0.26, baseH * 0.15);

    ctx.restore();

    // Current Phase Banner at Top Center of Canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(w / 2 - 160, 16, 320, 28);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(w / 2 - 160, 16, 320, 28);

    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = isSystole ? '#f43f5e' : '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`CURRENT PHASE: ${telemetry.phaseName.toUpperCase()}`, w / 2, 34);

    ctx.restore();
  };

  const handleToggleInstrument = (k: keyof ActiveInstruments) => {
    setActiveInstruments(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const graphChannels = [
    { key: 'pV', label: 'LV Pressure (Pv)', color: '#ef4444', unit: 'mmHg' },
    { key: 'pAo', label: 'Aortic Pressure (Pao)', color: '#f59e0b', unit: 'mmHg' },
    { key: 'ecg', label: 'ECG Trace', color: '#10b981' }
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
        background: '#090d16',
        color: '#f8fafc',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid #f43f5e',
              color: '#fb7185',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Heart size={13} fill="#f43f5e" />
            <span>FLAGSHIP BIOLOGY LAB</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
            Cardiac Cycle, Hemodynamics &amp; Wiggers Pressure-Volume Simulator
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 5,
              background: 'rgba(255,255,255,0.06)',
              fontSize: '0.72rem',
              color: '#34d399',
              fontWeight: 700
            }}
          >
            <Stethoscope size={13} />
            <span>{telemetry.heartSound}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Physiological Control Panel */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 290,
            maxHeight: 'calc(100% - 28px)',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            backdropFilter: 'blur(8px)',
            padding: '12px 14px',
            zIndex: 30,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fb7185' }}>
            HEMODYNAMIC VARIABLES
          </span>

          {/* Heart Rate Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
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
              onChange={(e) => setHeartRateBpm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#fb7185' }}
            />
          </div>

          {/* Stroke Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
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
              onChange={(e) => setStrokeVolumeMl(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Myocardial Contractility */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Myocardial Inotropy:</span>
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
              onChange={(e) => setContractility(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#fbbf24' }}
            />
          </div>

          {/* Real-time Hemodynamics Readings */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#fb7185', marginBottom: 2 }}>
              REAL-TIME MEASUREMENTS:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span>Cardiac Output (CO):</span>
              <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                {telemetry.cardiacOutputLpm} L/min
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
              <span>Mitral (AV) Valve:</span>
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
              height={150}
              onClearData={() => setGraphData([])}
            />
          </div>
        )}
      </div>

      {/* Universal Bottom Playback Bar */}
      <UniversalPlaybackBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
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
