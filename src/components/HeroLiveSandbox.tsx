import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowUpRight, Zap, Maximize2, Minimize2 } from 'lucide-react';

interface HeroLiveSandboxProps {
  onOpenFullLab: () => void;
}

export const HeroLiveSandbox: React.FC<HeroLiveSandboxProps> = ({ onOpenFullLab }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const lastTimeRef = useRef<number | null>(null);

  // Simulation parameters
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [speed, setSpeed] = useState<number>(24);
  const [planet, setPlanet] = useState<'earth' | 'moon' | 'mars'>('earth');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [touchHud, setTouchHud] = useState<string | null>(null);
  const [isFullWindow, setIsFullWindow] = useState<boolean>(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      lastTimeRef.current = performance.now();
    }
  }, [isPlaying]);

  // Handle Escape key to exit full window mode
  useEffect(() => {
    if (!isFullWindow) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullWindow(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullWindow]);

  // Lock body scroll when in full window mode
  useEffect(() => {
    if (isFullWindow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullWindow]);

  const handleSandboxPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);

    const isMobileViewport = window.innerWidth < 768;
    const originX = isMobileViewport ? 24 : 50;
    const originY = canvas.height - 35;

    const dx = cx - originX;
    const dy = originY - cy;

    if (dx > 5) {
      let deg = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
      deg = Math.max(15, Math.min(75, deg));
      setAngleDeg(deg);

      const dist = Math.hypot(dx, dy);
      const computedSpeed = Math.max(12, Math.min(36, Math.round(12 + dist * 0.08)));
      setSpeed(computedSpeed);

      setTouchHud(`Angle: ${deg}° | Speed: ${computedSpeed} m/s`);
    }
  };

  // Gravity per environment in m/s^2
  const gravityMap = {
    earth: 9.8,
    moon: 1.62,
    mars: 3.72
  };
  const g = gravityMap[planet];

  // Calculated Physics Metrics
  const theta = (angleDeg * Math.PI) / 180;
  const maxHeight = (speed * speed * Math.pow(Math.sin(theta), 2)) / (2 * g);
  const totalRange = (speed * speed * Math.sin(2 * theta)) / g;
  const flightTime = (2 * speed * Math.sin(theta)) / g;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    
    // Auto-sync canvas resolution to displayed container width & height
    const updateCanvasDims = () => {
      const parentW = canvas.parentElement?.clientWidth || 672;
      const parentH = canvas.parentElement?.clientHeight || (window.innerWidth < 768 ? 175 : 230);
      canvas.width = parentW;
      canvas.height = parentH;
    };
    updateCanvasDims();

    window.addEventListener('resize', updateCanvasDims);

    const isMobileViewport = window.innerWidth < 768;
    const originX = isMobileViewport ? 24 : 50;

    const render = () => {
      const now = performance.now();
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const originY = canvas.height - 35;

      // Dynamic responsive scale for full window vs card mode
      const availableW = canvas.width - originX - 40;
      const availableH = originY - 30;
      const fitScaleX = availableW / Math.max(totalRange * 1.15, 50);
      const fitScaleY = availableH / Math.max(maxHeight * 1.35, 20);
      const dynamicScale = Math.min(fitScaleX, fitScaleY);
      const scale = isFullWindow 
        ? Math.max(3.8, Math.min(dynamicScale, 11))
        : (isMobileViewport ? 3.4 : 5.2);

      // 1. Grid & Ground
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      for (let x = originX; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height - 40);
        ctx.stroke();
      }

      // Ground line
      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(canvas.width, originY);
      ctx.stroke();

      // Ground meters markers
      ctx.fillStyle = 'rgba(100, 116, 139, 0.85)';
      ctx.font = '10px JetBrains Mono';
      for (let m = 0; m <= 80; m += 10) {
        const markX = originX + m * scale;
        if (markX > canvas.width - 20) break;
        ctx.beginPath();
        ctx.moveTo(markX, originY - 4);
        ctx.lineTo(markX, originY + 4);
        ctx.stroke();
        ctx.fillText(`${m}m`, markX - 8, originY + 16);
      }

      // Target Flag at 50m
      const targetM = 50;
      const targetX = originX + targetM * scale;
      const isTargetHit = Math.abs(totalRange - 50) < 1.8;
      if (targetX < canvas.width - 15) {
        // Red flag pole
        ctx.strokeStyle = isTargetHit ? '#059669' : '#DC2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(targetX, originY);
        ctx.lineTo(targetX, originY - 34);
        ctx.stroke();

        // Flag triangle
        ctx.fillStyle = isTargetHit ? '#10B981' : '#EF4444';
        ctx.beginPath();
        ctx.moveTo(targetX, originY - 34);
        ctx.lineTo(targetX + 18, originY - 25);
        ctx.lineTo(targetX, originY - 16);
        ctx.closePath();
        ctx.fill();

        // Target base bullseye
        ctx.fillStyle = isTargetHit ? '#10B981' : '#DC2626';
        ctx.beginPath();
        ctx.arc(targetX, originY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        if (isTargetHit) {
          // Celebratory hit rings
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(targetX, originY, 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Target label
        ctx.fillStyle = isTargetHit ? '#059669' : '#DC2626';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(isTargetHit ? 'HIT! 50m' : 'TARGET 50m', targetX - 22, originY - 38);
      }

      // Protractor angle arc at cannon
      ctx.strokeStyle = 'rgba(29, 78, 216, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(originX, originY, 22, 0, -theta, true);
      ctx.stroke();
      ctx.fillStyle = '#1D4ED8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(`${angleDeg}°`, originX + 24, originY - 8);

      // 2. Ideal Trajectory Path (Dotted Arc)
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(10, 102, 194, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const dtSample = 0.03;
      for (let timeStep = 0; timeStep <= flightTime; timeStep += dtSample) {
        const px = originX + speed * Math.cos(theta) * timeStep * scale;
        const py = originY - (speed * Math.sin(theta) * timeStep - 0.5 * g * timeStep * timeStep) * scale;
        if (timeStep === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Cannon Barrel
      const barrelLen = 28;
      const barrelEndX = originX + Math.cos(theta) * barrelLen;
      const barrelEndY = originY - Math.sin(theta) * barrelLen;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(barrelEndX, barrelEndY);
      ctx.stroke();

      // 4. Projectile Ball & Vectors
      // Advance flight time ONLY if active (not paused)
      if (isPlayingRef.current) {
        simTimeRef.current += dt * 1.25;
        if (simTimeRef.current > flightTime + 0.4) {
          simTimeRef.current = 0; // Loop flight
        }
      }

      // Exact current time elapsed in flight
      const curT = Math.min(simTimeRef.current, flightTime);
      const currX = originX + speed * Math.cos(theta) * curT * scale;
      const currY = originY - (speed * Math.sin(theta) * curT - 0.5 * g * curT * curT) * scale;
      const vx = speed * Math.cos(theta);
      const vy = speed * Math.sin(theta) - g * curT;

      // Projectile ball with clean stroke (PhET Vibrant Orange)
      ctx.save();
      ctx.fillStyle = '#FF6A00';
      ctx.beginPath();
      ctx.arc(currX, currY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.restore();


      // Tangent Velocity Vector Arrow
      const vScale = 1.6;
      const arrowTipX = currX + vx * vScale;
      const arrowTipY = currY - vy * vScale;

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currX, currY);
      ctx.lineTo(arrowTipX, arrowTipY);
      ctx.stroke();

      // Component vx arrow
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(currX, currY);
      ctx.lineTo(currX + vx * vScale, currY);
      ctx.stroke();

      // Component vy arrow
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.8)';
      ctx.beginPath();
      ctx.moveTo(currX, currY);
      ctx.lineTo(currX, currY - vy * vScale);
      ctx.stroke();

      // Apex marker
      const apexX = originX + (speed * Math.cos(theta) * (flightTime / 2)) * scale;
      const apexY = originY - maxHeight * scale;
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(apexX, apexY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`Apex: ${maxHeight.toFixed(1)} m`, apexX - 25, apexY - 8);

      // Paused status badge overlay on canvas
      if (!isPlaying) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.font = '700 11px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`⏸ PAUSED (t = ${curT.toFixed(2)}s)`, canvas.width - 16, 22);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasDims);
    };
  }, [angleDeg, speed, planet, isPlaying, theta, g, flightTime, maxHeight, isFullWindow]);

  return (
    <div
      className="scientific-card hero-sandbox-card"
      style={isFullWindow ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'var(--bg-surface)',
        padding: '16px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'none',
        margin: 0,
        borderRadius: 0,
        overflow: 'hidden'
      } : {
        width: '100%',
        maxWidth: 780,
        margin: '28px auto 0',
        padding: '20px 24px',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Header Bar */}
      <div
        className="hero-sandbox-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isFullWindow ? 14 : 16,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-primary)' }} />
          <span className="hero-sandbox-title" style={{ fontSize: '0.84rem', fontWeight: 750, letterSpacing: '0.03em', color: 'var(--text-primary)' }}>
            INTERACTIVE LABORATORY MODEL • 2D TRAJECTORY
          </span>
          {isFullWindow && (
            <span
              className="badge badge-primary font-mono"
              style={{
                fontSize: '0.68rem',
                padding: '2px 8px'
              }}
            >
              FULL SCREEN
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Planet Presets */}
          <div className="hero-sandbox-presets" style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPlanet('earth')}
              className={`btn btn-sm ${planet === 'earth' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Earth (9.8 m/s²)
            </button>
            <button
              onClick={() => setPlanet('moon')}
              className={`btn btn-sm ${planet === 'moon' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Moon (1.6 m/s²)
            </button>
            <button
              onClick={() => setPlanet('mars')}
              className={`btn btn-sm ${planet === 'mars' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Mars (3.7 m/s²)
            </button>
          </div>


          {isFullWindow && (
            <button
              onClick={() => setIsFullWindow(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#F87171',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Exit Full View (Esc)"
              aria-label="Exit Full View"
            >
              <Minimize2 size={13} />
              <span>Exit Full View</span>
              <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>Esc</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Challenge Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: Math.abs(totalRange - 50) < 1.8 ? 'var(--accent-success-soft)' : 'var(--bg-subtle)',
          border: `1px solid ${Math.abs(totalRange - 50) < 1.8 ? 'var(--accent-success)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🎯</span>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
            Target Challenge:
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Hit the 50m red flag!
          </span>
        </div>
        {Math.abs(totalRange - 50) < 1.8 ? (
          <span className="badge" style={{ background: 'var(--accent-success)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.75rem', padding: '4px 10px' }}>
            🎯 BULLSEYE HIT! ({totalRange.toFixed(1)}m)
          </span>
        ) : (
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Current: {totalRange.toFixed(1)}m ({totalRange < 50 ? `${(50 - totalRange).toFixed(1)}m short` : `${(totalRange - 50).toFixed(1)}m past`})
          </span>
        )}
      </div>

      {/* Main Studio Area (Row in full window, Column in card) */}
      <div
        style={isFullWindow ? {
          display: 'flex',
          flex: 1,
          minHeight: 0,
          gap: 18,
          overflow: 'hidden',
          flexDirection: window.innerWidth < 900 ? 'column' : 'row'
        } : {
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Canvas Box */}
        <div
          className="hero-sandbox-canvas-box"
          onPointerDown={(e) => {
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
            handleSandboxPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) handleSandboxPointer(e);
          }}
          onPointerUp={() => {
            setTimeout(() => setTouchHud(null), 1800);
          }}
          style={isFullWindow ? {
            flex: 1,
            height: '100%',
            minHeight: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            position: 'relative',
            touchAction: 'none',
            userSelect: 'none',
            cursor: 'crosshair',
            boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.7)'
          } : {
            width: '100%',
            height: 230,
            background: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            position: 'relative',
            touchAction: 'none',
            userSelect: 'none',
            cursor: 'crosshair'
          }}
        >
          {/* Small Full Graph & Settings Button inside Canvas Area */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullWindow(!isFullWindow);
            }}
            className="sim-full-view-btn"
            title={isFullWindow ? 'Exit Full View (Esc)' : 'Open full graph with settings covering whole window'}
            aria-label={isFullWindow ? 'Exit Full View' : 'Open full graph and settings view'}
          >
            {isFullWindow ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullWindow ? 'Exit Full View' : 'Full Graph & Settings'}</span>
          </button>

          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {/* Floating Touch Status Badge — CSS-hidden on desktop via mobile-touch-hud-row */}
          <div
            className="mobile-touch-hud-row"
            style={{
              position: 'absolute',
              top: 8,
              left: 10,
              pointerEvents: 'none'
            }}
          >
            <div className={`canvas-touch-badge ${touchHud ? 'dragging' : ''}`}>
              <span>{touchHud || '👆 Touch & Drag to Aim Cannon'}</span>
            </div>
          </div>
        </div>

        {/* Controls & Metrics Dock (Side Dock in Full Window, Bottom Grid in Card) */}
        <div
          style={isFullWindow ? {
            width: window.innerWidth < 900 ? '100%' : '340px',
            minWidth: window.innerWidth < 900 ? '100%' : '310px',
            maxWidth: window.innerWidth < 900 ? '100%' : '360px',
            height: window.innerWidth < 900 ? '45vh' : '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '18px 20px',
            background: 'var(--bg-glass-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflowY: 'auto',
            boxSizing: 'border-box'
          } : {
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            marginTop: 16
          }}
        >
          {isFullWindow && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                CONTROLS &amp; SETTINGS
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Zero Scroll Mode
              </span>
            </div>
          )}

          {/* Sliders Area */}
          <div
            className={isFullWindow ? '' : 'hero-sandbox-controls'}
            style={isFullWindow ? {
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            } : {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              alignItems: 'center'
            }}
          >
            {/* Angle Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>Launch Angle (θ)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="number"
                    min={15}
                    max={75}
                    value={angleDeg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setAngleDeg(Math.min(75, Math.max(15, val)));
                    }}
                    title="Type launch angle (15° to 75°)"
                    className="control-number-badge-input font-mono"
                    style={{
                      width: '54px',
                      padding: '2px 4px',
                      textAlign: 'right',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--electric-blue)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--electric-blue)', fontWeight: 700 }}>°</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setAngleDeg(Math.max(15, angleDeg - 1))}
                  className="phet-stepper-btn"
                  title="Decrease angle 1°"
                  aria-label="Decrease angle"
                >
                  -
                </button>
                <input
                  type="range"
                  min={15}
                  max={75}
                  value={angleDeg}
                  onChange={(e) => setAngleDeg(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--electric-blue)', cursor: 'pointer' }}
                />
                <button
                  type="button"
                  onClick={() => setAngleDeg(Math.min(75, angleDeg + 1))}
                  className="phet-stepper-btn"
                  title="Increase angle 1°"
                  aria-label="Increase angle"
                >
                  +
                </button>
              </div>
            </div>

            {/* Speed Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>Launch Speed (v₀)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    min={12}
                    max={36}
                    value={speed}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setSpeed(Math.min(36, Math.max(12, val)));
                    }}
                    title="Type launch speed (12 to 36 m/s)"
                    className="control-number-badge-input font-mono"
                    style={{
                      width: '54px',
                      padding: '2px 4px',
                      textAlign: 'right',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--electric-violet)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--electric-violet)', fontWeight: 600 }}>m/s</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSpeed(Math.max(12, speed - 1))}
                  className="phet-stepper-btn"
                  title="Decrease speed 1 m/s"
                  aria-label="Decrease speed"
                >
                  -
                </button>
                <input
                  type="range"
                  min={12}
                  max={36}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--electric-violet)', cursor: 'pointer' }}
                />
                <button
                  type="button"
                  onClick={() => setSpeed(Math.min(36, speed + 1))}
                  className="phet-stepper-btn"
                  title="Increase speed 1 m/s"
                  aria-label="Increase speed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Live Telemetry Chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '100px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Range (R)</div>
                <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--electric-cyan)' }}>
                  {totalRange.toFixed(1)} m
                </div>
              </div>
              <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '100px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Flight Time</div>
                <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {flightTime.toFixed(2)} s
                </div>
              </div>
              {isFullWindow && (
                <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '100px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max Apex (H)</div>
                  <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#EC4899' }}>
                    {maxHeight.toFixed(1)} m
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons (Pause / Resume, Reset, Open Full Lab) */}
          <div
            className="hero-sandbox-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: isFullWindow ? 'auto' : 0,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  if (!isPlaying && simTimeRef.current >= flightTime) {
                    simTimeRef.current = 0;
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="btn btn-secondary btn-sm"
                id="heroSandboxPauseBtn"
                aria-label={isPlaying ? 'Pause simulation' : 'Resume simulation'}
                title={isPlaying ? 'Pause at exact position' : 'Resume trajectory'}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>
              <button
                onClick={() => {
                  setAngleDeg(45);
                  setSpeed(24);
                  setPlanet('earth');
                  simTimeRef.current = 0;
                }}
                className="btn btn-secondary btn-sm"
                id="heroSandboxResetBtn"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setIsFullWindow(!isFullWindow)}
                className="btn btn-secondary btn-sm"
                title={isFullWindow ? 'Exit Full View (Esc)' : 'Open full graph and settings covering whole window'}
              >
                {isFullWindow ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                <span>{isFullWindow ? 'Exit Full Screen' : 'Full Screen'}</span>
              </button>
            </div>

            <button
              onClick={onOpenFullLab}
              className="btn btn-sm"
              style={{
                background: '#FF6600',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 750,
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                boxShadow: '0 3px 10px rgba(255, 102, 0, 0.35)',
                cursor: 'pointer'
              }}
            >
              <Zap size={14} />
              <span>Open 42-Sim Laboratory</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
