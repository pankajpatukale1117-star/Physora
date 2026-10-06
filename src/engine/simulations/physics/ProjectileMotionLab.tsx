import React, { useState, useEffect, useRef, useMemo } from 'react';
import { rk4Step2D, type ParticleState2D } from '../../physics/Integrator';
import { drawVector2D } from '../../physics/Vector2D';
import { LiveGraph } from '../../graphs/LiveGraph';
import { VirtualRuler, VirtualProtractor, VirtualStopwatch } from '../../instruments/ScientificInstruments';
import { UniversalPlaybackBar } from '../../ui/UniversalPlaybackBar';
import type { ActiveInstruments, GraphDataPoint } from '../../types';
import { Target, Zap } from 'lucide-react';

export const ProjectileMotionLab: React.FC = () => {
  // Physical parameters
  const [v0, setV0] = useState(25); // m/s
  const [angleDeg, setAngleDeg] = useState(45); // degrees
  const [h0, setH0] = useState(10); // initial height in m
  const [mass, setMass] = useState(2); // kg
  const [dragCd, setDragCd] = useState(0.15); // drag coefficient (0 = vacuum)
  const [gravityPreset, setGravityPreset] = useState<'earth' | 'moon' | 'mars' | 'jupiter'>('earth');

  const gValue = useMemo(() => {
    switch (gravityPreset) {
      case 'moon': return 1.62;
      case 'mars': return 3.71;
      case 'jupiter': return 24.79;
      default: return 9.81;
    }
  }, [gravityPreset]);

  // Simulation execution state
  const [isPlaying, setIsPlaying] = useState(false);
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

  const [showVectors, setShowVectors] = useState(true);
  const [targetDist, setTargetDist] = useState(65); // target at 65 meters

  // Trajectory history & simulation clock
  const simTimeRef = useRef(0);
  const trajectoryPointsRef = useRef<{ x: number; y: number; vx: number; vy: number; t: number }[]>([]);
  const stateRef = useRef<ParticleState2D>({
    x: 0,
    y: 10,
    vx: 25 * Math.cos((45 * Math.PI) / 180),
    vy: 25 * Math.sin((45 * Math.PI) / 180),
    ax: 0,
    ay: -9.81,
    m: 2
  });

  const [hasLanded, setHasLanded] = useState(false);
  const [landingStats, setLandingStats] = useState<{
    range: number;
    flightTime: number;
    maxHeight: number;
    impactSpeed: number;
  } | null>(null);

  // Graph telemetry points
  const [graphPoints, setGraphPoints] = useState<GraphDataPoint[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset simulation state
  const resetSimulation = () => {
    const rad = (angleDeg * Math.PI) / 180;
    stateRef.current = {
      x: 0,
      y: h0,
      vx: v0 * Math.cos(rad),
      vy: v0 * Math.sin(rad),
      ax: 0,
      ay: -gValue,
      m: mass
    };
    simTimeRef.current = 0;
    trajectoryPointsRef.current = [{
      x: 0,
      y: h0,
      vx: stateRef.current.vx,
      vy: stateRef.current.vy,
      t: 0
    }];
    setHasLanded(false);
    setLandingStats(null);
    setGraphPoints([{
      t: 0,
      y: h0,
      speed: v0,
      Ek: 0.5 * mass * v0 * v0,
      Ep: mass * gValue * h0
    }]);
  };

  // Launch projectile
  const launchProjectile = () => {
    resetSimulation();
    setIsPlaying(true);
  };

  // On parameters change while not running, reset state
  useEffect(() => {
    if (!isPlaying) {
      resetSimulation();
    }
  }, [v0, angleDeg, h0, mass, dragCd, gValue]);

  // Main Physics Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const deltaSec = Math.min(0.04, (now - lastTime) / 1000) * speed;
      lastTime = now;

      if (isPlaying && !hasLanded) {
        const dt = 0.005; // fixed sub-step for RK4 accuracy
        const steps = Math.ceil(deltaSec / dt);

        for (let i = 0; i < steps; i++) {
          if (stateRef.current.y <= 0 && stateRef.current.x > 0.05) {
            // Landed on ground
            setHasLanded(true);
            setIsPlaying(false);

            // Compute landing stats
            const traj = trajectoryPointsRef.current;
            const maxH = Math.max(...traj.map(p => p.y));
            const range = stateRef.current.x;
            const impactSpeed = Math.hypot(stateRef.current.vx, stateRef.current.vy);
            setLandingStats({
              range,
              flightTime: simTimeRef.current,
              maxHeight: maxH,
              impactSpeed
            });
            break;
          }

          // Aerodynamic force function: F = F_gravity + F_drag
          const forceFn = (_x: number, _y: number, vx: number, vy: number) => {
            const spd = Math.hypot(vx, vy);
            // Drag: Fd = 0.5 * rho * Cd * A * v^2
            const rho = 1.225; // kg/m^3 air density
            const dragMag = 0.5 * rho * dragCd * 0.04 * spd * spd;
            const fDragX = spd > 0.001 ? -dragMag * (vx / spd) : 0;
            const fDragY = spd > 0.001 ? -dragMag * (vy / spd) : 0;
            const fGravY = -mass * gValue;

            return {
              fx: fDragX,
              fy: fGravY + fDragY
            };
          };

          stateRef.current = rk4Step2D(stateRef.current, simTimeRef.current, dt, forceFn);
          simTimeRef.current += dt;

          trajectoryPointsRef.current.push({
            x: stateRef.current.x,
            y: Math.max(0, stateRef.current.y),
            vx: stateRef.current.vx,
            vy: stateRef.current.vy,
            t: simTimeRef.current
          });
        }

        // Push to live graph (throttled)
        const spd = Math.hypot(stateRef.current.vx, stateRef.current.vy);
        const curY = Math.max(0, stateRef.current.y);
        const ek = 0.5 * mass * spd * spd;
        const ep = mass * gValue * curY;

        setGraphPoints(prev => {
          const next = [...prev, {
            t: Math.round(simTimeRef.current * 100) / 100,
            y: Math.round(curY * 10) / 10,
            speed: Math.round(spd * 10) / 10,
            Ek: Math.round(ek),
            Ep: Math.round(ep)
          }];
          return next.slice(-250);
        });
      }

      // Render Canvas
      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, hasLanded, speed, mass, dragCd, gValue]);

  // Render Canvas Viewport
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

    // World coordinate transform
    // (0, 0) world is at ground level, offset from left
    const groundY = h - 60;
    const originX = 70;
    const scale = Math.min(6.5, (w - 120) / Math.max(80, targetDist * 1.3));

    // Sky & background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Coordinate grid lines (every 10 meters)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.textAlign = 'center';

    for (let meterX = 0; meterX <= 150; meterX += 10) {
      const px = originX + meterX * scale;
      if (px > w) break;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, groundY);
      ctx.stroke();
      ctx.fillText(`${meterX}m`, px, groundY + 14);
    }

    for (let meterY = 10; meterY <= 80; meterY += 10) {
      const py = groundY - meterY * scale;
      if (py < 0) break;
      ctx.beginPath();
      ctx.moveTo(originX, py);
      ctx.lineTo(w, py);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(`${meterY}m`, originX - 8, py + 3);
    }

    // Ground platform
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, '#1e293b');
    groundGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // Launcher Tower (Height h0)
    const towerTopY = groundY - h0 * scale;
    ctx.fillStyle = '#334155';
    ctx.fillRect(originX - 18, towerTopY, 20, h0 * scale);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(originX - 18, towerTopY, 20, h0 * scale);

    // Cannon Barrel
    const rad = (angleDeg * Math.PI) / 180;
    const barrelLen = 28;
    ctx.save();
    ctx.translate(originX, towerTopY);
    ctx.rotate(-rad);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, -5, barrelLen, 10);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -5, barrelLen, 10);
    ctx.restore();

    // Cannon Pivot Base
    ctx.beginPath();
    ctx.arc(originX, towerTopY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#0369a1';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Target Marker
    const targetPx = originX + targetDist * scale;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(targetPx - 15, groundY - 2, 30, 4);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetPx, groundY);
    ctx.lineTo(targetPx, groundY - 32);
    ctx.stroke();

    // Target Flag
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(targetPx, groundY - 32);
    ctx.lineTo(targetPx + 14, groundY - 24);
    ctx.lineTo(targetPx, groundY - 16);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText(`TARGET: ${targetDist}m`, targetPx, groundY - 38);

    // Trajectory Path
    const traj = trajectoryPointsRef.current;
    if (traj.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(originX + traj[0].x * scale, groundY - traj[0].y * scale);
      for (let i = 1; i < traj.length; i++) {
        ctx.lineTo(originX + traj[i].x * scale, groundY - traj[i].y * scale);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Apex Marker (Highest point reached)
      let apexPt = traj[0];
      for (const p of traj) {
        if (p.y > apexPt.y) apexPt = p;
      }
      if (apexPt.y > h0 + 0.5) {
        const apexPx = originX + apexPt.x * scale;
        const apexPy = groundY - apexPt.y * scale;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(apexPx, apexPy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '9px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(`Apex: ${apexPt.y.toFixed(1)}m`, apexPx, apexPy - 8);
      }
    }

    // Active Projectile Position
    const curX = stateRef.current.x;
    const curY = Math.max(0, stateRef.current.y);
    const projPx = originX + curX * scale;
    const projPy = groundY - curY * scale;

    // Glowing projectile ball
    const projGrad = ctx.createRadialGradient(projPx, projPy, 1, projPx, projPy, 8);
    projGrad.addColorStop(0, '#ffffff');
    projGrad.addColorStop(0.5, '#38bdf8');
    projGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = projGrad;
    ctx.beginPath();
    ctx.arc(projPx, projPy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Physical Force & Velocity Vectors
    if (showVectors && (isPlaying || !hasLanded)) {
      // 1. Velocity vector (Green)
      const vScale = 1.2;
      drawVector2D(
        ctx,
        { x: projPx, y: projPy },
        { x: stateRef.current.vx * vScale, y: -stateRef.current.vy * vScale },
        {
          color: '#22c55e',
          lineWidth: 2.5,
          label: `v = ${Math.hypot(stateRef.current.vx, stateRef.current.vy).toFixed(1)} m/s`,
          showComponents: true,
          componentColor: 'rgba(34, 197, 94, 0.4)'
        }
      );

      // 2. Gravity vector (Yellow)
      drawVector2D(
        ctx,
        { x: projPx, y: projPy },
        { x: 0, y: (mass * gValue) * 1.5 },
        { color: '#eab308', lineWidth: 2, label: `Fg = ${(mass * gValue).toFixed(1)} N` }
      );

      // 3. Air Drag vector (Orange-Red)
      if (dragCd > 0) {
        const spd = Math.hypot(stateRef.current.vx, stateRef.current.vy);
        const dragMag = 0.5 * 1.225 * dragCd * 0.04 * spd * spd;
        if (spd > 0.01 && dragMag > 0.1) {
          const dScale = 2.5;
          drawVector2D(
            ctx,
            { x: projPx, y: projPy },
            { x: (-stateRef.current.vx / spd) * dragMag * dScale, y: (stateRef.current.vy / spd) * dragMag * dScale },
            { color: '#f97316', lineWidth: 2, label: `Fd = ${dragMag.toFixed(1)} N` }
          );
        }
      }
    }

    ctx.restore();
  };

  const handleToggleInstrument = (k: keyof ActiveInstruments) => {
    setActiveInstruments(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const graphChannels = [
    { key: 'y', label: 'Height y', color: '#38bdf8', unit: 'm' },
    { key: 'speed', label: 'Speed |v|', color: '#22c55e', unit: 'm/s' },
    { key: 'Ek', label: 'Kinetic Energy', color: '#a855f7', unit: 'J' },
    { key: 'Ep', label: 'Potential Energy', color: '#eab308', unit: 'J' }
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
      {/* Top Laboratory HUD Banner */}
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
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Zap size={13} />
            <span>FLAGSHIP PHYSICS LAB</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
            Advanced Projectile Dynamics &amp; Aerodynamic Drag
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Target Distance Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
            <Target size={13} color="#ef4444" />
            <span style={{ color: '#94a3b8' }}>Target:</span>
            <input
              type="number"
              min={20}
              max={140}
              value={targetDist}
              onChange={(e) => setTargetDist(Number(e.target.value))}
              style={{
                width: 55,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            />
            <span style={{ color: '#94a3b8' }}>m</span>
          </div>

          {/* Vectors Toggle */}
          <button
            type="button"
            onClick={() => setShowVectors(!showVectors)}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              background: showVectors ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showVectors ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
              color: showVectors ? '#22c55e' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Vectors {showVectors ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Workspace (Canvas + Parameters Drawer) */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* Left Floating Parameter Controls */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 280,
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
            gap: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#93c5fd' }}>
              LAUNCH PARAMETERS
            </span>
            <button
              type="button"
              onClick={launchProjectile}
              style={{
                padding: '4px 10px',
                borderRadius: 5,
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Zap size={12} fill="#fff" />
              FIRE!
            </button>
          </div>

          {/* Launch Velocity v0 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Velocity v₀:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{v0} m/s</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={v0}
              onChange={(e) => setV0(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Launch Angle theta */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Launch Angle θ:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{angleDeg}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={1}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Initial Height h0 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Tower Height h₀:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{h0} m</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={2}
              value={h0}
              onChange={(e) => setH0(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Mass */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Projectile Mass:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{mass} kg</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={20}
              step={0.5}
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          {/* Air Drag Coefficient Cd */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
              <span style={{ color: '#cbd5e1' }}>Air Drag (Cd):</span>
              <span style={{ fontWeight: 700, color: dragCd === 0 ? '#4ade80' : '#f97316', fontFamily: 'monospace' }}>
                {dragCd === 0 ? 'Vacuum (0.0)' : dragCd.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.05}
              value={dragCd}
              onChange={(e) => setDragCd(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316' }}
            />
          </div>

          {/* Gravity Environment */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: 4 }}>
              Gravity Environment (g = {gValue} m/s²):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {(['earth', 'moon', 'mars', 'jupiter'] as const).map(planet => (
                <button
                  key={planet}
                  type="button"
                  onClick={() => setGravityPreset(planet)}
                  style={{
                    padding: '3px 6px',
                    borderRadius: 4,
                    background: gravityPreset === planet ? '#0284c7' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: gravityPreset === planet ? '#fff' : '#94a3b8',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer'
                  }}
                >
                  {planet}
                </button>
              ))}
            </div>
          </div>

          {/* Live Flight Telemetry & Results */}
          {landingStats && (
            <div
              style={{
                marginTop: 6,
                padding: '8px 10px',
                borderRadius: 6,
                background: Math.abs(landingStats.range - targetDist) < 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                border: `1px solid ${Math.abs(landingStats.range - targetDist) < 2 ? '#22c55e' : '#38bdf8'}`
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.74rem', color: '#fff', marginBottom: 4 }}>
                {Math.abs(landingStats.range - targetDist) < 2 ? '🎯 BULLSEYE HIT!' : '📊 LANDING RESULTS:'}
              </div>
              <div style={{ fontSize: '0.68rem', display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'monospace' }}>
                <div>Range (X): <span style={{ color: '#38bdf8', fontWeight: 700 }}>{landingStats.range.toFixed(2)} m</span></div>
                <div>Max Height (H): <span style={{ color: '#fbbf24', fontWeight: 700 }}>{landingStats.maxHeight.toFixed(2)} m</span></div>
                <div>Flight Time (t): <span style={{ color: '#a855f7', fontWeight: 700 }}>{landingStats.flightTime.toFixed(2)} s</span></div>
                <div>Impact Speed: <span style={{ color: '#22c55e', fontWeight: 700 }}>{landingStats.impactSpeed.toFixed(2)} m/s</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Simulation Viewport */}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'default' }}
        />

        {/* Live Virtual Instruments */}
        {activeInstruments.ruler && (
          <VirtualRuler onClose={() => handleToggleInstrument('ruler')} containerRef={containerRef} />
        )}
        {activeInstruments.protractor && (
          <VirtualProtractor onClose={() => handleToggleInstrument('protractor')} containerRef={containerRef} />
        )}
        {activeInstruments.stopwatch && (
          <VirtualStopwatch onClose={() => handleToggleInstrument('stopwatch')} containerRef={containerRef} />
        )}

        {/* Live Floating Graph Drawer */}
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
              title="Trajectory Telemetry (Height, Speed, Energy)"
              data={graphPoints}
              channels={graphChannels}
              height={150}
              onClearData={() => setGraphPoints([])}
            />
          </div>
        )}
      </div>

      {/* Universal Bottom Playback Bar */}
      <UniversalPlaybackBar
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (hasLanded) resetSimulation();
          setIsPlaying(!isPlaying);
        }}
        onStepForward={() => {
          setIsPlaying(false);
          // advance step
          simTimeRef.current += 0.05;
        }}
        speed={speed}
        onChangeSpeed={setSpeed}
        onReset={resetSimulation}
        activeInstruments={activeInstruments}
        onToggleInstrument={handleToggleInstrument}
      />
    </div>
  );
};
