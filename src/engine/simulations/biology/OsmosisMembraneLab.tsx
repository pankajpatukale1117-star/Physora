import React, { useState, useEffect, useRef } from 'react';
import { LiveGraph } from '../../graphs/LiveGraph';
import { VirtualStopwatch } from '../../instruments/ScientificInstruments';
import { UniversalPlaybackBar } from '../../ui/UniversalPlaybackBar';
import type { ActiveInstruments, GraphDataPoint } from '../../types';
import { Droplets, RefreshCw } from 'lucide-react';

interface WaterMolecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SoluteMolecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  side: 'left' | 'right';
}

export interface OsmosisMembraneLabProps {
  isCompact?: boolean;
}

export const OsmosisMembraneLab: React.FC<OsmosisMembraneLabProps> = ({ isCompact = false }) => {
  // Environmental Solute Concentrations (mM)
  const [extracellularSolute, setExtracellularSolute] = useState(150); // Right side
  const [intracellularSolute, setIntracellularSolute] = useState(300); // Left side (Cell interior)
  const [aquaporinCount, setAquaporinCount] = useState(6); // number of open channels

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
  const timeRef = useRef(0);

  // Particles
  const watersRef = useRef<WaterMolecule[]>([]);
  const solutesRef = useRef<SoluteMolecule[]>([]);
  const cellWaterVolumeRef = useRef(100); // relative % volume

  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [telemetry, setTelemetry] = useState({
    stateName: 'Hypotonic Swelling',
    cellVolumePercent: 100,
    osmoticPressureAtm: 3.6,
    netFluxDirection: 'Into Cell (Left)'
  });

  // Initialize Particles
  const initParticles = () => {
    const waters: WaterMolecule[] = [];
    const solutes: SoluteMolecule[] = [];

    // 160 water molecules randomly distributed
    for (let i = 0; i < 180; i++) {
      waters.push({
        x: Math.random() * 500,
        y: 40 + Math.random() * 260,
        vx: (Math.random() - 0.5) * 140,
        vy: (Math.random() - 0.5) * 140
      });
    }

    // Solute molecules (Left side = intracellular, Right side = extracellular)
    const numLeft = Math.round((intracellularSolute / 100) * 12);
    const numRight = Math.round((extracellularSolute / 100) * 12);

    for (let i = 0; i < numLeft; i++) {
      solutes.push({
        x: 40 + Math.random() * 190,
        y: 40 + Math.random() * 260,
        vx: (Math.random() - 0.5) * 70,
        vy: (Math.random() - 0.5) * 70,
        side: 'left'
      });
    }

    for (let i = 0; i < numRight; i++) {
      solutes.push({
        x: 270 + Math.random() * 190,
        y: 40 + Math.random() * 260,
        vx: (Math.random() - 0.5) * 70,
        vy: (Math.random() - 0.5) * 70,
        side: 'right'
      });
    }

    watersRef.current = waters;
    solutesRef.current = solutes;
    cellWaterVolumeRef.current = 100;
    timeRef.current = 0;
  };

  useEffect(() => {
    initParticles();
  }, [intracellularSolute, extracellularSolute]);

  // Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000) * speed;
      lastTime = now;

      if (isPlaying) {
        timeRef.current += dt;
        const membraneX = 250;
        const membraneHalfThick = 14;

        // Channel vertical y-positions
        const channelYs = Array.from({ length: aquaporinCount }).map((_, i) => {
          return 70 + (i * 200) / Math.max(1, aquaporinCount - 1);
        });

        // Water particles motion
        let waterCountLeft = 0;
        let waterCountRight = 0;

        for (const w of watersRef.current) {
          w.x += w.vx * dt;
          w.y += w.vy * dt;

          // Left/Right boundaries
          if (w.x < 20) { w.x = 20; w.vx = Math.abs(w.vx); }
          else if (w.x > 480) { w.x = 480; w.vx = -Math.abs(w.vx); }

          // Top/Bottom boundaries
          if (w.y < 35) { w.y = 35; w.vy = Math.abs(w.vy); }
          else if (w.y > 325) { w.y = 325; w.vy = -Math.abs(w.vy); }

          // Semipermeable membrane interaction at membraneX
          const distToMembrane = Math.abs(w.x - membraneX);
          if (distToMembrane < membraneHalfThick) {
            // Check if near any aquaporin pore
            const nearPore = channelYs.some(py => Math.abs(w.y - py) < 10);
            if (nearPore) {
              // Net osmotic bias: water moves toward higher solute concentration
              const deltaC = intracellularSolute - extracellularSolute; // positive means left has higher solute
              const biasVx = deltaC * 0.08;
              w.vx += (w.x < membraneX ? -biasVx : -biasVx) * dt * 5;
            } else {
              // Bounce off hydrophobic lipid bilayer
              if (w.x < membraneX) { w.x = membraneX - membraneHalfThick; w.vx = -Math.abs(w.vx); }
              else { w.x = membraneX + membraneHalfThick; w.vx = Math.abs(w.vx); }
            }
          }

          if (w.x < membraneX) waterCountLeft++;
          else waterCountRight++;
        }

        // Solute particles motion (Impermeable to membrane!)
        for (const s of solutesRef.current) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;

          if (s.side === 'left') {
            if (s.x < 25) { s.x = 25; s.vx = Math.abs(s.vx); }
            else if (s.x > membraneX - 18) { s.x = membraneX - 18; s.vx = -Math.abs(s.vx); }
          } else {
            if (s.x < membraneX + 18) { s.x = membraneX + 18; s.vx = Math.abs(s.vx); }
            else if (s.x > 475) { s.x = 475; s.vx = -Math.abs(s.vx); }
          }

          if (s.y < 40) { s.y = 40; s.vy = Math.abs(s.vy); }
          else if (s.y > 320) { s.y = 320; s.vy = -Math.abs(s.vy); }
        }

        // Osmotic pressure calculation: Pi = delta_C * R * T (Van 't Hoff)
        const deltaC = intracellularSolute - extracellularSolute; // in mM
        const piAtm = Math.abs(deltaC) * 0.024; // atm at 25 deg C
        const relVolume = Math.max(65, Math.min(145, 100 + (waterCountLeft - 90) * 0.8));
        cellWaterVolumeRef.current = relVolume;

        const tonicity = deltaC > 40
          ? 'Hypotonic Environment (Cell Swelling)'
          : deltaC < -40
          ? 'Hypertonic Environment (Cell Crenation)'
          : 'Isotonic Equilibrium';

        setTelemetry({
          stateName: tonicity,
          cellVolumePercent: Math.round(relVolume),
          osmoticPressureAtm: Math.round(piAtm * 10) / 10,
          netFluxDirection: deltaC > 10 ? 'Net Influx (Water → Cell)' : deltaC < -10 ? 'Net Efflux (Water → Outside)' : 'Dynamic Equilibrium'
        });

        setGraphData(prev => {
          const next = [...prev, {
            t: Math.round(timeRef.current * 10) / 10,
            volume: Math.round(relVolume),
            osmoticP: Math.round(piAtm * 10) / 10
          }];
          return next.slice(-200);
        });
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, intracellularSolute, extracellularSolute, aquaporinCount]);

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

    // Vessel / Chamber
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const memX = w * 0.5;

    // Left Chamber (Cell Interior)
    const leftGrad = ctx.createLinearGradient(0, 0, memX, 0);
    leftGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    leftGrad.addColorStop(1, 'rgba(56, 189, 248, 0.16)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(20, 30, memX - 20, h - 60);

    // Right Chamber (Extracellular Fluid)
    const rightGrad = ctx.createLinearGradient(memX, 0, w, 0);
    rightGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
    rightGrad.addColorStop(1, 'rgba(16, 185, 129, 0.16)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(memX, 30, w - memX - 20, h - 60);

    // Semipermeable Phospholipid Bilayer Membrane in Middle
    ctx.fillStyle = '#334155';
    ctx.fillRect(memX - 10, 30, 20, h - 60);

    // Draw Lipid Heads (yellow circles) & Aquaporin Pores
    const channelYs = Array.from({ length: aquaporinCount }).map((_, i) => {
      return 60 + (i * (h - 120)) / Math.max(1, aquaporinCount - 1);
    });

    for (let y = 35; y < h - 35; y += 12) {
      const isChannel = channelYs.some(cy => Math.abs(y - cy) < 9);
      if (isChannel) {
        // Aquaporin Water Channel (Cyan pore)
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(memX - 10, y - 4, 20, 8);
      } else {
        // Hydrophobic Bilayer heads
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(memX - 8, y, 3, 0, Math.PI * 2);
        ctx.arc(memX + 8, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Chamber Borders
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 30, w - 40, h - 60);

    // Water Molecules (Small Blue Spheres)
    ctx.fillStyle = '#38bdf8';
    for (const wt of watersRef.current) {
      // Scale positions to canvas dimensions
      const px = 20 + (wt.x / 500) * (w - 40);
      const py = 30 + (wt.y / 360) * (h - 60);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Solute Molecules (Large Purple/Red Spheres with hydration shells)
    for (const s of solutesRef.current) {
      const px = 20 + (s.x / 500) * (w - 40);
      const py = 30 + (s.y / 360) * (h - 60);

      // Hydration shell halo
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fill();

      // Solute core
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(px, py, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Chamber Headers
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`CELL INTERIOR: ${intracellularSolute} mM`, memX * 0.5, 20);

    ctx.fillStyle = '#34d399';
    ctx.fillText(`EXTRACELLULAR FLUID: ${extracellularSolute} mM`, memX + (w - memX) * 0.5, 20);

    ctx.restore();
  };

  const handleToggleInstrument = (k: keyof ActiveInstruments) => {
    setActiveInstruments(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const graphChannels = [
    { key: 'volume', label: 'Cell Volume %', color: '#38bdf8', unit: '%' },
    { key: 'osmoticP', label: 'Osmotic Pressure Π', color: '#ec4899', unit: 'atm' }
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
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                fontWeight: 800,
                fontSize: '0.70rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Droplets size={11} />
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
            {isCompact ? 'Osmosis Controls' : 'Cellular Osmosis, Aquaporin Transport & Tonicity'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              padding: '3px 8px',
              borderRadius: 5,
              whiteSpace: 'nowrap'
            }}
          >
            {telemetry.netFluxDirection}
          </span>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Control Panel */}
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
              TONICITY &amp; GRADIENTS
            </span>
            <button
              type="button"
              onClick={initParticles}
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
              Reset
            </button>
          </div>

          {/* Extracellular Solute Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Extracellular Solute:</span>
              <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                {extracellularSolute} mM
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={600}
              step={25}
              value={extracellularSolute}
              onChange={(e) => setExtracellularSolute(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#34d399' }}
            />
          </div>

          {/* Intracellular Solute Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Intracellular Solute:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {intracellularSolute} mM
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={500}
              step={25}
              value={intracellularSolute}
              onChange={(e) => setIntracellularSolute(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Aquaporin Channels Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Open Aquaporin Pores:</span>
              <span style={{ fontWeight: 700, color: '#06b6d4', fontFamily: 'monospace' }}>
                {aquaporinCount}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={aquaporinCount}
              onChange={(e) => setAquaporinCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Quick Tonicity Presets */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginBottom: 4 }}>
              Tonicity Environments:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              <button
                type="button"
                onClick={() => { setIntracellularSolute(300); setExtracellularSolute(100); }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Hypotonic
              </button>
              <button
                type="button"
                onClick={() => { setIntracellularSolute(300); setExtracellularSolute(300); }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Isotonic
              </button>
              <button
                type="button"
                onClick={() => { setIntracellularSolute(300); setExtracellularSolute(550); }}
                style={{
                  padding: '4px 6px',
                  borderRadius: 4,
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Hypertonic
              </button>
            </div>
          </div>

          {/* Measurements */}
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
            <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#93c5fd' }}>
              OBSERVED CELL RESPONSE:
            </div>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
              {telemetry.stateName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span>Relative Cell Volume:</span>
              <span style={{ fontWeight: 700, color: '#facc15', fontFamily: 'monospace' }}>
                {telemetry.cellVolumePercent}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span>Osmotic Pressure (Π):</span>
              <span style={{ fontWeight: 700, color: '#ec4899', fontFamily: 'monospace' }}>
                {telemetry.osmoticPressureAtm} atm
              </span>
            </div>
          </div>
        </div>

        {/* Canvas Simulation Viewport */}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'default' }}
        />

        {/* Stopwatch */}
        {activeInstruments.stopwatch && (
          <VirtualStopwatch onClose={() => handleToggleInstrument('stopwatch')} containerRef={containerRef} />
        )}

        {/* Live Graph */}
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
              title="Osmosis: Cell Volume & Osmotic Pressure vs Time"
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
        onReset={initParticles}
        activeInstruments={activeInstruments}
        onToggleInstrument={handleToggleInstrument}
        availableInstruments={{ stopwatch: true, liveGraph: true }}
      />
    </div>
  );
};
