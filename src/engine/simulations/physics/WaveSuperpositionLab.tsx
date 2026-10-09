import React, { useState, useEffect, useRef } from 'react';
import { LiveGraph } from '../../graphs/LiveGraph';
import { VirtualStopwatch, VirtualRuler } from '../../instruments/ScientificInstruments';
import { UniversalPlaybackBar } from '../../ui/UniversalPlaybackBar';
import type { ActiveInstruments, GraphDataPoint } from '../../types';
import { Waves } from 'lucide-react';

export interface WaveSuperpositionLabProps {
  isCompact?: boolean;
}

export const WaveSuperpositionLab: React.FC<WaveSuperpositionLabProps> = ({ isCompact = false }) => {
  // Wave 1 parameters
  const [amp1, setAmp1] = useState(25); // px
  const [freq1, setFreq1] = useState(1.5); // Hz
  const [lambda1] = useState(180); // px wavelength

  // Wave 2 parameters
  const [amp2, setAmp2] = useState(25);
  const [freq2, setFreq2] = useState(1.5);
  const [lambda2] = useState(180);
  const [phaseDeg2, setPhaseDeg2] = useState(0); // degrees
  const [dir2, setDir2] = useState<'forward' | 'backward'>('backward'); // backward = standing wave!

  // Display toggles
  const [showComponentWaves, setShowComponentWaves] = useState(true);
  const [showNodes, setShowNodes] = useState(true);

  // Probe sensor at x0
  const [probeX, setProbeX] = useState(300);

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

  const timeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

  // Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000) * speed;
      lastTime = now;

      if (isPlaying) {
        timeRef.current += dt;

        // Sample probe displacement at probeX
        const t = timeRef.current;
        const k1 = (2 * Math.PI) / lambda1;
        const w1 = 2 * Math.PI * freq1;
        const y1 = amp1 * Math.sin(k1 * probeX - w1 * t);

        const k2 = (2 * Math.PI) / lambda2;
        const w2 = 2 * Math.PI * freq2;
        const phi = (phaseDeg2 * Math.PI) / 180;
        const y2 = dir2 === 'forward'
          ? amp2 * Math.sin(k2 * probeX - w2 * t + phi)
          : amp2 * Math.sin(-k2 * probeX - w2 * t + phi);

        const ySum = y1 + y2;

        setGraphData(prev => {
          const next = [...prev, {
            t: Math.round(t * 100) / 100,
            ySum: Math.round(ySum * 10) / 10,
            y1: Math.round(y1 * 10) / 10,
            y2: Math.round(y2 * 10) / 10
          }];
          return next.slice(-250);
        });
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, amp1, freq1, lambda1, amp2, freq2, lambda2, phaseDeg2, dir2, probeX]);

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

    const midY = h * 0.48;

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Center equilibrium line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    const t = timeRef.current;
    const k1 = (2 * Math.PI) / lambda1;
    const w1 = 2 * Math.PI * freq1;

    const k2 = (2 * Math.PI) / lambda2;
    const w2 = 2 * Math.PI * freq2;
    const phi = (phaseDeg2 * Math.PI) / 180;

    // Optional: Draw Component Wave 1 (Cyan)
    if (showComponentWaves) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y1 = amp1 * Math.sin(k1 * x - w1 * t);
        if (x === 0) ctx.moveTo(x, midY - y1);
        else ctx.lineTo(x, midY - y1);
      }
      ctx.stroke();

      // Draw Component Wave 2 (Orange)
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y2 = dir2 === 'forward'
          ? amp2 * Math.sin(k2 * x - w2 * t + phi)
          : amp2 * Math.sin(-k2 * x - w2 * t + phi);
        if (x === 0) ctx.moveTo(x, midY - y2);
        else ctx.lineTo(x, midY - y2);
      }
      ctx.stroke();
    }

    // Superposition Wave (Neon Green / Bright)
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y1 = amp1 * Math.sin(k1 * x - w1 * t);
      const y2 = dir2 === 'forward'
        ? amp2 * Math.sin(k2 * x - w2 * t + phi)
        : amp2 * Math.sin(-k2 * x - w2 * t + phi);
      const ySum = y1 + y2;
      if (x === 0) ctx.moveTo(x, midY - ySum);
      else ctx.lineTo(x, midY - ySum);
    }
    ctx.stroke();

    // Standing Wave Node Markers (if opposing direction and equal frequency)
    if (showNodes && dir2 === 'backward' && Math.abs(freq1 - freq2) < 0.05 && Math.abs(lambda1 - lambda2) < 2) {
      // Nodes occur where sin(kx) = 0 => kx = n * pi => x = n * lambda / 2
      const halfLambda = lambda1 / 2;
      for (let x = halfLambda / 2; x <= w; x += halfLambda) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, midY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '8px monospace';
        ctx.fillStyle = '#f87171';
        ctx.textAlign = 'center';
        ctx.fillText('NODE', x, midY + 14);
      }
    }

    // Draggable Probe Sensor Line
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(probeX, 20);
    ctx.lineTo(probeX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Probe Handle & Tag
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(probeX - 18, 12, 36, 18);
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('PROBE', probeX, 24);

    // Current displacement dot at probe
    const curY1 = amp1 * Math.sin(k1 * probeX - w1 * t);
    const curY2 = dir2 === 'forward'
      ? amp2 * Math.sin(k2 * probeX - w2 * t + phi)
      : amp2 * Math.sin(-k2 * probeX - w2 * t + phi);
    const curSum = curY1 + curY2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(probeX, midY - curSum, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  };

  const handlePointerDownCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setProbeX(Math.max(40, Math.min(rect.width - 40, x)));
  };

  const handleToggleInstrument = (k: keyof ActiveInstruments) => {
    setActiveInstruments(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const graphChannels = [
    { key: 'ySum', label: 'Superposition y_tot', color: '#4ade80', unit: 'px' },
    { key: 'y1', label: 'Wave 1 (y₁)', color: '#38bdf8', unit: 'px' },
    { key: 'y2', label: 'Wave 2 (y₂)', color: '#fb923c', unit: 'px' }
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
          padding: '6px 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20,
          gap: 10,
          flexWrap: 'wrap',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 1 }}>
          {!isCompact && (
            <div
              style={{
                padding: '3px 7px',
                borderRadius: 5,
                background: 'rgba(74, 222, 128, 0.2)',
                border: '1px solid #4ade80',
                color: '#4ade80',
                fontWeight: 800,
                fontSize: '0.70rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Waves size={11} />
              <span>FLAGSHIP LAB</span>
            </div>
          )}
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#f1f5f9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isCompact ? 'Superposition Controls' : 'Wave Interference, Superposition & Standing Waves'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowComponentWaves(!showComponentWaves)}
            style={{
              padding: '3px 8px',
              borderRadius: 5,
              background: showComponentWaves ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showComponentWaves ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
              color: showComponentWaves ? '#38bdf8' : '#94a3b8',
              fontSize: '0.70rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Components {showComponentWaves ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowNodes(!showNodes)}
            style={{
              padding: '3px 8px',
              borderRadius: 5,
              background: showNodes ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showNodes ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
              color: showNodes ? '#f87171' : '#94a3b8',
              fontSize: '0.70rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Nodes {showNodes ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Floating Left Control Panel */}
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
          {/* Wave 1 Section */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#38bdf8', marginBottom: 6 }}>
              WAVE 1 (CYAN • TRAVELING RIGHT)
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span>Amplitude A₁:</span>
              <span style={{ fontWeight: 700 }}>{amp1} px</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={amp1}
              onChange={(e) => setAmp1(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: 4 }}>
              <span>Frequency f₁:</span>
              <span style={{ fontWeight: 700 }}>{freq1.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={freq1}
              onChange={(e) => setFreq1(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Wave 2 Section */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fb923c', marginBottom: 6 }}>
              WAVE 2 (ORANGE)
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span>Amplitude A₂:</span>
              <span style={{ fontWeight: 700 }}>{amp2} px</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              value={amp2}
              onChange={(e) => setAmp2(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#fb923c' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: 4 }}>
              <span>Frequency f₂:</span>
              <span style={{ fontWeight: 700 }}>{freq2.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={freq2}
              onChange={(e) => setFreq2(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#fb923c' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: 4 }}>
              <span>Phase Offset ϕ:</span>
              <span style={{ fontWeight: 700 }}>{phaseDeg2}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={15}
              value={phaseDeg2}
              onChange={(e) => setPhaseDeg2(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#fb923c' }}
            />

            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setDir2('backward')}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: dir2 === 'backward' ? '#c2410c' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: dir2 === 'backward' ? '#fff' : '#94a3b8',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Opposing (Standing)
              </button>
              <button
                type="button"
                onClick={() => setDir2('forward')}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: dir2 === 'forward' ? '#0369a1' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: dir2 === 'forward' ? '#fff' : '#94a3b8',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Same Direction
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginBottom: 4 }}>
              Preset Experiments:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                type="button"
                onClick={() => {
                  setAmp1(25); setFreq1(1.5);
                  setAmp2(25); setFreq2(1.5);
                  setPhaseDeg2(0); setDir2('backward');
                }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  fontSize: '0.68rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                1. Perfect Standing Wave (Nodes/Antinodes)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAmp1(25); setFreq1(1.4);
                  setAmp2(25); setFreq2(1.6);
                  setPhaseDeg2(0); setDir2('forward');
                }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  fontSize: '0.68rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                2. Acoustic Beats (|f₁ - f₂| = 0.2 Hz)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAmp1(25); setFreq1(1.5);
                  setAmp2(25); setFreq2(1.5);
                  setPhaseDeg2(180); setDir2('forward');
                }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                  fontSize: '0.68rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                3. Total Destructive Cancellation (ϕ = 180°)
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Simulation Viewport */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDownCanvas}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
          title="Click anywhere to reposition probe sensor"
        />

        {/* Live Virtual Instruments */}
        {activeInstruments.ruler && (
          <VirtualRuler onClose={() => handleToggleInstrument('ruler')} containerRef={containerRef} />
        )}
        {activeInstruments.stopwatch && (
          <VirtualStopwatch onClose={() => handleToggleInstrument('stopwatch')} containerRef={containerRef} />
        )}

        {/* Live Oscilloscope Trace Graph */}
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
              title={`Probe Oscilloscope at x = ${probeX}px`}
              data={graphData}
              channels={graphChannels}
              height={150}
              onClearData={() => setGraphData([])}
            />
          </div>
        )}
      </div>

      {/* Universal Playback Bar */}
      <UniversalPlaybackBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStepForward={() => {
          setIsPlaying(false);
          timeRef.current += 0.05;
        }}
        speed={speed}
        onChangeSpeed={setSpeed}
        onReset={() => {
          timeRef.current = 0;
          setGraphData([]);
        }}
        activeInstruments={activeInstruments}
        onToggleInstrument={handleToggleInstrument}
      />
    </div>
  );
};
