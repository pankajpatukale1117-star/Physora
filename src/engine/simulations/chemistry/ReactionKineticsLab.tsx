import React, { useState, useEffect, useRef } from 'react';
import { ReactionKineticsSimulation } from '../../chemistry/KineticsEngine';
import { LiveGraph } from '../../graphs/LiveGraph';
import { VirtualStopwatch } from '../../instruments/ScientificInstruments';
import { UniversalPlaybackBar } from '../../ui/UniversalPlaybackBar';
import type { ActiveInstruments, GraphDataPoint } from '../../types';
import { FlaskConical, Flame, Zap, RefreshCw } from 'lucide-react';

export const ReactionKineticsLab: React.FC = () => {
  // Reaction conditions
  const [temperatureK, setTemperatureK] = useState(350); // Kelvin
  const [activationEa, setActivationEa] = useState(35); // kJ/mol
  const [hasCatalyst, setHasCatalyst] = useState(false);
  const [initialCountA, setInitialCountA] = useState(40);
  const [initialCountB, setInitialCountB] = useState(40);

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
  const simRef = useRef<ReactionKineticsSimulation | null>(null);
  const timeRef = useRef(0);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

  // Telemetry state
  const [stats, setStats] = useState({
    concA: 40,
    concB: 40,
    concC: 0,
    totalCollisions: 0,
    effectiveCollisions: 0,
    efficiencyPercent: 0
  });

  // Initialize simulation engine
  const initEngine = () => {
    const vessel = new ReactionKineticsSimulation({
      width: 500,
      height: 380,
      temperatureKelvin: temperatureK,
      activationEnergyEa: activationEa,
      hasCatalyst,
      deltaH: -25
    });
    vessel.initMixture(initialCountA, initialCountB, 0);
    simRef.current = vessel;
    timeRef.current = 0;
    setGraphData([{
      t: 0,
      concA: initialCountA,
      concB: initialCountB,
      concC: 0
    }]);
  };

  useEffect(() => {
    initEngine();
  }, []);

  // Update dynamic vessel parameters when inputs change
  useEffect(() => {
    if (simRef.current) {
      simRef.current.config.temperatureKelvin = temperatureK;
      simRef.current.config.activationEnergyEa = activationEa;
      simRef.current.config.hasCatalyst = hasCatalyst;
    }
  }, [temperatureK, activationEa, hasCatalyst]);

  // Main Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000) * speed;
      lastTime = now;

      if (isPlaying && simRef.current) {
        simRef.current.step(dt);
        timeRef.current += dt;

        const concs = simRef.current.getConcentrations();
        const total = simRef.current.totalCollisions;
        const eff = simRef.current.effectiveCollisions;
        const effPct = total > 0 ? (eff / total) * 100 : 0;

        setStats({
          concA: concs.countA,
          concB: concs.countB,
          concC: concs.countC,
          totalCollisions: total,
          effectiveCollisions: eff,
          efficiencyPercent: Math.round(effPct * 10) / 10
        });

        // Push to graph periodically
        setGraphData(prev => {
          const next = [...prev, {
            t: Math.round(timeRef.current * 10) / 10,
            concA: concs.countA,
            concB: concs.countB,
            concC: concs.countC
          }];
          return next.slice(-200);
        });
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas || !sim) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sim.config.width = w;
      sim.config.height = h;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Vessel Chamber Background (Dark Glass Reaction Tube)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Chamber Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Catalyst mesh overlay along bottom of vessel if active
    if (hasCatalyst) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(0, h - 22, w, 22);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, h - 22, w, 22);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ PLATINUM CATALYST SURFACE (ACTIVATION BARRIER REDUCED BY 45%)', w / 2, h - 8);
    }

    // Draw Particles
    for (const p of sim.particles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Velocity trail / motion tick
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
      ctx.stroke();
    }

    ctx.restore();
  };

  const handleToggleInstrument = (k: keyof ActiveInstruments) => {
    setActiveInstruments(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const graphChannels = [
    { key: 'concA', label: 'Reactant [A]', color: '#ef4444', unit: 'mol/L' },
    { key: 'concB', label: 'Reactant [B]', color: '#3b82f6', unit: 'mol/L' },
    { key: 'concC', label: 'Product [C]', color: '#10b981', unit: 'mol/L' }
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
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <FlaskConical size={13} />
            <span>FLAGSHIP CHEMISTRY LAB</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
            Reaction Kinetics, Collision Theory &amp; Equilibrium: A + B ⇌ C
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setHasCatalyst(!hasCatalyst)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 5,
              background: hasCatalyst ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${hasCatalyst ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
              color: hasCatalyst ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Zap size={12} fill={hasCatalyst ? '#38bdf8' : 'none'} />
            Catalyst {hasCatalyst ? 'ACTIVE' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Parameter Panel */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#93c5fd' }}>
              REACTION VARIABLES
            </span>
            <button
              type="button"
              onClick={initEngine}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 4,
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={10} />
              Reset Mix
            </button>
          </div>

          {/* Temperature Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={12} color="#f97316" /> Temperature (T):
              </span>
              <span style={{ fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>
                {temperatureK} K ({temperatureK - 273}°C)
              </span>
            </div>
            <input
              type="range"
              min={250}
              max={650}
              step={10}
              value={temperatureK}
              onChange={(e) => setTemperatureK(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316' }}
            />
          </div>

          {/* Activation Energy Barrier Ea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Activation Energy (Ea):</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {hasCatalyst ? `${Math.round(activationEa * 0.55)} kJ/mol (Catalyzed)` : `${activationEa} kJ/mol`}
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={5}
              value={activationEa}
              onChange={(e) => setActivationEa(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Initial Concentration Sliders */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700 }}>Reactant [A]: {initialCountA}</div>
              <input
                type="range"
                min={10}
                max={70}
                value={initialCountA}
                onChange={(e) => setInitialCountA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 700 }}>Reactant [B]: {initialCountB}</div>
              <input
                type="range"
                min={10}
                max={70}
                value={initialCountB}
                onChange={(e) => setInitialCountB(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>
          </div>

          {/* Live Chemical Kinetics Telemetry */}
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
            <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#93c5fd', marginBottom: 2 }}>
              VESSEL CONCENTRATIONS:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#ef4444' }}>[A] Red:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{stats.concA}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#3b82f6' }}>[B] Blue:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{stats.concB}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#10b981' }}>[C] Product (Green):</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{stats.concC}</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, paddingTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1' }}>
                <span>Total Collisions:</span>
                <span style={{ fontFamily: 'monospace' }}>{stats.totalCollisions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1' }}>
                <span>Effective (E ≥ Ea):</span>
                <span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>{stats.effectiveCollisions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1' }}>
                <span>Reaction Efficiency:</span>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'monospace' }}>{stats.efficiencyPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reaction Chamber Canvas */}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'default' }}
        />

        {/* Stopwatch */}
        {activeInstruments.stopwatch && (
          <VirtualStopwatch onClose={() => handleToggleInstrument('stopwatch')} containerRef={containerRef} />
        )}

        {/* Real-time Concentration vs Time Graph */}
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
              title="Kinetics: Concentration vs Time [A], [B], [C]"
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
        onReset={initEngine}
        activeInstruments={activeInstruments}
        onToggleInstrument={handleToggleInstrument}
        availableInstruments={{ stopwatch: true, liveGraph: true }}
      />
    </div>
  );
};
