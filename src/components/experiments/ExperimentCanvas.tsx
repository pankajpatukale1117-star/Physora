import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Hand } from 'lucide-react';
import type { ExperimentControl } from '../../data/experimentsData';

interface ExperimentCanvasProps {
  experimentId: string;
  params: Record<string, number>;
  isPlaying: boolean;
  onParamChange: (id: string, value: number) => void;
  onTelemetryUpdate: (telemetry: Record<string, string>) => void;
  controls: ExperimentControl[];
  onTogglePlay: () => void;
  onReset: () => void;
  accentColor: string;
}

export const ExperimentCanvas: React.FC<ExperimentCanvasProps> = ({
  experimentId,
  params,
  isPlaying,
  onParamChange,
  onTelemetryUpdate,
  controls: _controls,
  onTogglePlay,
  onReset,
  accentColor: _accentColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const motionHistoryRef = useRef<{ t: number; s: number; v: number }[]>([]);

  // Track viewport width for canvas-drawn elements (can't use CSS for canvas rendering)
  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => { isMobileRef.current = window.innerWidth < 768; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const dimsRef = useRef<{
    cssWidth: number;
    cssHeight: number;
    dpr: number;
    virtualW: number;
    virtualH: number;
  }>({
    cssWidth: 780,
    cssHeight: 420,
    dpr: 1,
    virtualW: 780,
    virtualH: 420
  });

  const [touchState, setTouchState] = useState<{
    isDragging: boolean;
    hudText: string | null;
  }>({
    isDragging: false,
    hudText: null
  });

  const touchReticleRef = useRef<{ active: boolean; x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; params: Record<string, number> }>({
    x: 0,
    y: 0,
    params: {}
  });

  const showHudMessage = (msg: string) => {
    setTouchState(prev => ({ ...prev, hudText: msg }));
  };

  // ResizeObserver for High-DPI Sharpness
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 3);

      const virtualW = 780;
      const virtualH = Math.max(380, Math.round(virtualW * (cssH / cssW)));

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      dimsRef.current = {
        cssWidth: cssW,
        cssHeight: cssH,
        dpr,
        virtualW,
        virtualH
      };
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Direct Touch and Pointer Drag Handling
  const processPointerInteraction = (cx: number, cy: number, _isInitial = false) => {
    const startX = dragStartRef.current.x;
    const startY = dragStartRef.current.y;
    const startP = dragStartRef.current.params;

    if (experimentId === 'motion_exp') {
      // Drag horizontal velocity or time
      const dx = cx - startX;
      const baseV = startP.velocity ?? 12;
      const newV = Math.max(0, Math.min(30, Math.round(baseV + (dx / 300) * 30)));
      onParamChange('velocity', newV);
      showHudMessage(`Velocity v = ${newV} m/s`);
    } else if (experimentId === 'force_exp') {
      // Drag force arrow tip horizontally
      const cartX = 260;
      if (cx > cartX) {
        const rawF = Math.round(((cx - cartX) / 280) * 50);
        const f = Math.max(2, Math.min(50, rawF));
        onParamChange('force', f);
        showHudMessage(`Applied Force F = ${f} N`);
      } else {
        // Drag vertical to change mass
        const dy = startY - cy;
        const baseM = startP.mass ?? 2;
        const newM = Math.max(1, Math.min(10, parseFloat((baseM + (dy / 150) * 5).toFixed(1))));
        onParamChange('mass', newM);
        showHudMessage(`Cart Mass m = ${newM} kg`);
      }
    } else if (experimentId === 'gravity_exp') {
      // Drag drop height vertically
      const groundY = 330;
      const topY = 70;
      const ratio = Math.max(0, Math.min(1, (groundY - cy) / (groundY - topY)));
      const h = Math.max(10, Math.min(100, Math.round(10 + ratio * 90)));
      onParamChange('height', h);
      showHudMessage(`Drop Height h = ${h} m`);
    } else if (experimentId === 'spring_exp') {
      // Drag spring mass vertically to adjust load force
      const anchorY = 60;
      const stretch = Math.max(20, Math.min(220, cy - anchorY - 60));
      const f = Math.max(5, Math.min(100, Math.round((stretch / 200) * 100)));
      onParamChange('force', f);
      showHudMessage(`Hanging Force F = ${f} N`);
    } else if (experimentId === 'wave_exp') {
      // Drag vertical for amplitude, horizontal for frequency
      const centerY = 190;
      const amp = Math.max(15, Math.min(60, Math.round(Math.abs(cy - centerY))));
      onParamChange('amplitude', amp);

      const dx = cx - startX;
      const baseF = startP.frequency ?? 1.5;
      const newF = Math.max(0.5, Math.min(3.5, parseFloat((baseF + (dx / 350) * 2).toFixed(2))));
      onParamChange('frequency', newF);
      showHudMessage(`Amp: ${amp}px | Freq: ${newF}Hz`);
    } else if (experimentId === 'vector_exp') {
      // Direct drag tip of vector arrow on Cartesian plane
      const originX = 180;
      const originY = 270;
      const dx = cx - originX;
      const dy = originY - cy; // positive up
      if (dx > 0 && dy >= 0) {
        const rad = Math.atan2(dy, dx);
        const deg = Math.max(0, Math.min(90, Math.round((rad * 180) / Math.PI)));
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mag = Math.max(10, Math.min(80, Math.round((dist / 240) * 80)));
        onParamChange('angle', deg);
        onParamChange('magnitude', mag);
        showHudMessage(`Vector: ${mag} N @ ${deg}°`);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    try {
      container.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const rect = container.getBoundingClientRect();
    const { virtualW, virtualH } = dimsRef.current;
    const cx = Math.max(0, Math.min(virtualW, (e.clientX - rect.left) * (virtualW / rect.width)));
    const cy = Math.max(0, Math.min(virtualH, (e.clientY - rect.top) * (virtualH / rect.height)));

    dragStartRef.current = {
      x: cx,
      y: cy,
      params: { ...params }
    };
    touchReticleRef.current = { active: true, x: cx, y: cy };
    setTouchState({ isDragging: true, hudText: null });
    processPointerInteraction(cx, cy, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchReticleRef.current?.active) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const { virtualW, virtualH } = dimsRef.current;
    const cx = Math.max(0, Math.min(virtualW, (e.clientX - rect.left) * (virtualW / rect.width)));
    const cy = Math.max(0, Math.min(virtualH, (e.clientY - rect.top) * (virtualH / rect.height)));

    touchReticleRef.current.x = cx;
    touchReticleRef.current.y = cy;
    processPointerInteraction(cx, cy, false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    touchReticleRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    setTouchState(prev => ({ ...prev, isDragging: false }));
    setTimeout(() => {
      setTouchState(prev => (prev.isDragging ? prev : { ...prev, hudText: null }));
    }, 2000);
  };

  // 60FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        timeRef.current += 0.025;
      }
      const t = timeRef.current;
      const { dpr, virtualW, virtualH, cssWidth } = dimsRef.current;
      const scale = (cssWidth / virtualW) * dpr;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);

      const w = virtualW;
      const h = virtualH;

      // Draw Digital Lab Grid & Sci-Fi Ambient Glow
      drawLaboratoryGrid(ctx, w, h);

      // Render Active Experiment
      switch (experimentId) {
        case 'motion_exp':
          renderMotionExperiment(ctx, w, h, params, t, onTelemetryUpdate, motionHistoryRef);
          break;
        case 'force_exp':
          renderForceExperiment(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'gravity_exp':
          renderGravityExperiment(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'spring_exp':
          renderSpringExperiment(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'wave_exp':
          renderWaveExperiment(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'vector_exp':
          renderVectorExperiment(ctx, w, h, params, t, onTelemetryUpdate);
          break;
      }

      // Draw Interactive Finger Touch Reticle — mobile viewport only
      if (isMobileRef.current && touchReticleRef.current?.active) {
        const { x: tx, y: ty } = touchReticleRef.current;
        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [experimentId, params, isPlaying, onTelemetryUpdate]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="canvas-simulator-wrapper"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: 'var(--radius-lg)',
          background: 'radial-gradient(ellipse at 50% 30%, #070e1e 0%, #02050e 100%)',
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(0, 240, 255, 0.25)'
        }}
      />

      {/* Floating HUD: Touch status & Quick Action Buttons — CSS-hidden on desktop */}
      <div
        className="mobile-touch-hud-row"
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div className={`canvas-touch-badge ${touchState.isDragging ? 'dragging' : ''}`}>
          <Hand size={12} className="touch-icon" />
          <span>{touchState.hudText || 'Touch & Drag on Screen to Experiment'}</span>
        </div>

        <div className="canvas-touch-actions" style={{ pointerEvents: 'auto', display: 'flex', gap: 6 }}>
          {experimentId !== 'vector_exp' && onTogglePlay && (
            <button
              type="button"
              onClick={onTogglePlay}
              className="canvas-action-btn"
              title={isPlaying ? 'Pause Experiment' : 'Play Experiment'}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                background: isPlaying ? 'rgba(0, 240, 255, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="canvas-action-btn"
            title="Reset Experiment"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(15, 23, 42, 0.85)',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// BACKGROUND LAB GRID DRAWING
// ==========================================
function drawLaboratoryGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;

  const gridSize = 40;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Soft laboratory spotlight
  const grad = ctx.createRadialGradient(w / 2, h / 3, 20, w / 2, h / 2, Math.max(w, h));
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.06)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ==========================================
// 1. MOTION EXPERIMENT (Class 9)
// ==========================================
function renderMotionExperiment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelemetry: (t: Record<string, string>) => void,
  _historyRef: React.MutableRefObject<{ t: number; s: number; v: number }[]>
) {
  const v = params.velocity ?? 12;
  const duration = params.time ?? 6;

  // Track position: loops cleanly based on duration
  const cycleTime = t % (duration + 1);
  const currentT = Math.min(cycleTime, duration);
  const currentS = v * currentT;
  const maxS = Math.max(60, v * duration);

  // Send live telemetry
  onTelemetry({
    velocity: `${v} m/s`,
    time: `${currentT.toFixed(1)} s`,
    distance: `${currentS.toFixed(1)} m`,
    slope: `${v} m/s`
  });

  // Top Section: Physical Motion Track
  const trackY = 130;
  const trackStart = 60;
  const trackEnd = w - 60;
  const trackLen = trackEnd - trackStart;

  // Track base & graduation ticks
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(trackStart, trackY + 24);
  ctx.lineTo(trackEnd, trackY + 24);
  ctx.stroke();

  // Graduation marks every 20m
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.textAlign = 'center';
  for (let m = 0; m <= maxS; m += Math.max(10, Math.round(maxS / 5))) {
    const px = trackStart + (m / maxS) * trackLen;
    ctx.beginPath();
    ctx.moveTo(px, trackY + 24);
    ctx.lineTo(px, trackY + 32);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillText(`${m}m`, px, trackY + 45);
  }

  // Moving Glider / Vehicle
  const carX = trackStart + (currentS / maxS) * trackLen;
  const carY = trackY;

  // Trail
  const trailGrad = ctx.createLinearGradient(trackStart, trackY, carX, trackY);
  trailGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
  trailGrad.addColorStop(1, 'rgba(0, 240, 255, 0.4)');
  ctx.fillStyle = trailGrad;
  ctx.fillRect(trackStart, trackY + 6, carX - trackStart, 16);

  // Cart body
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.roundRect(carX - 24, carY - 6, 48, 26, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Cart details
  ctx.fillStyle = '#0B132B';
  ctx.beginPath();
  ctx.roundRect(carX - 18, carY - 2, 36, 18, 4);
  ctx.fill();
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 9px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${v} m/s`, carX, carY + 10);

  // Velocity arrow vector pointing right
  if (v > 0) {
    const arrowLen = Math.min(80, Math.max(20, v * 2.5));
    drawVectorArrow(ctx, carX + 26, carY + 7, arrowLen, 0, '#10B981', `v = ${v} m/s`);
  }

  // Bottom Section: Live Synchronized Distance-Time Graph
  const graphX = 80;
  const graphY = 220;
  const graphW = w - 160;
  const graphH = h - graphY - 45;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeRect(graphX, graphY, graphW, graphH);

  // Graph axes labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Distance s (m) → [Max ${maxS.toFixed(0)}m]`, graphX - 8, graphY + 14);
  ctx.textAlign = 'center';
  ctx.fillText(`Time t (s) → [${duration}s]`, graphX + graphW / 2, graphY + graphH + 22);

  // Target linear distance curve s = v * t
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(graphX, graphY + graphH);
  ctx.lineTo(graphX + graphW, graphY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Live drawing progress
  const progressRatio = currentT / duration;
  const currentGx = graphX + progressRatio * graphW;
  const currentGy = graphY + graphH - (currentS / maxS) * graphH;

  // Solid drawn line
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(graphX, graphY + graphH);
  ctx.lineTo(currentGx, currentGy);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Glowing point on graph
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(currentGx, currentGy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Slope callout
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.fillStyle = '#10B981';
  ctx.textAlign = 'left';
  ctx.fillText(`Slope = Δs / Δt = ${v} m/s`, currentGx + 10, Math.max(graphY + 20, currentGy - 8));

  ctx.restore();
}

// ==========================================
// 2. FORCE & ACCELERATION EXPERIMENT (Class 9 & 10)
// ==========================================
function renderForceExperiment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  _t: number,
  onTelemetry: (t: Record<string, string>) => void
) {
  const f = params.force ?? 20;
  const m = params.mass ?? 2;
  const a = f / m;

  onTelemetry({
    force: `${f} N`,
    mass: `${m} kg`,
    accel: `${a.toFixed(2)} m/s²`,
    forceVector: `→ ${f} N`
  });

  const centerY = 190;
  const blockX = 260;
  const blockSize = Math.max(48, Math.min(100, 40 + m * 6));

  ctx.save();

  // Floor / low friction track
  const floorY = centerY + blockSize / 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, floorY);
  ctx.lineTo(w - 60, floorY);
  ctx.stroke();

  // Mass Block
  ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(blockX - blockSize / 2, centerY - blockSize / 2, blockSize, blockSize, 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Mass label inside block
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${m} kg`, blockX, centerY + 5);

  // Big Applied Force Vector Arrow (proportional length)
  const arrowLen = Math.min(260, Math.max(50, f * 5));
  drawVectorArrow(ctx, blockX + blockSize / 2, centerY, arrowLen, 0, '#00F0FF', `F = ${f} N`);

  // Resulting Acceleration Vector Arrow (above block)
  const accelArrowLen = Math.min(220, Math.max(40, a * 12));
  drawVectorArrow(ctx, blockX, centerY - blockSize / 2 - 35, accelArrowLen, 0, '#F59E0B', `a = F/m = ${a.toFixed(2)} m/s²`);

  // Formula & Direct Relationship Display in Box
  const boxY = h - 110;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(80, boxY, w - 160, 75, 10);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`Newton's Second Law:  a = F / m`, w / 2, boxY + 28);

  ctx.font = '13px JetBrains Mono, monospace';
  ctx.fillStyle = '#10B981';
  ctx.fillText(`a = ${f} N / ${m} kg = ${a.toFixed(2)} m/s²`, w / 2, boxY + 54);

  ctx.restore();
}

// ==========================================
// 3. GRAVITY & FREE FALL EXPERIMENT (Class 10)
// ==========================================
function renderGravityExperiment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelemetry: (t: Record<string, string>) => void
) {
  const g = params.gravity ?? 9.8;
  const dropHeight = params.height ?? 45;
  const mass = params.mass ?? 5;

  const totalFallTime = Math.sqrt((2 * dropHeight) / g);
  const impactSpeed = Math.sqrt(2 * g * dropHeight);

  // Time loop for falling animation
  const cycleT = t % (totalFallTime + 1.2);
  const currentT = Math.min(cycleT, totalFallTime);
  const currentFallY = 0.5 * g * currentT * currentT;
  const currentSpeed = g * currentT;

  onTelemetry({
    gravity: `${g} m/s²`,
    height: `${dropHeight} m`,
    fallTime: `${totalFallTime.toFixed(2)} s`,
    impactVel: `${impactSpeed.toFixed(1)} m/s (${(impactSpeed * 3.6).toFixed(0)} km/h)`
  });

  ctx.save();

  // Drop Tower / Height Scale
  const towerX = 140;
  const topY = 60;
  const groundY = h - 60;
  const towerH = groundY - topY;

  // Ground platform
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(80, groundY, w - 160, 8);
  ctx.fillStyle = '#F59E0B';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GROUND LEVEL (h = 0m)', w - 240, groundY + 24);

  // Tower vertical scale
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(towerX, topY);
  ctx.lineTo(towerX, groundY);
  ctx.stroke();

  // Graduation marks
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'right';
  for (let dh = 0; dh <= dropHeight; dh += Math.max(10, Math.round(dropHeight / 5))) {
    const py = groundY - (dh / dropHeight) * towerH;
    ctx.beginPath();
    ctx.moveTo(towerX - 6, py);
    ctx.lineTo(towerX, py);
    ctx.stroke();
    ctx.fillText(`${dh}m`, towerX - 10, py + 4);
  }

  // Falling Ball
  const ballX = towerX + 110;
  const ballY = topY + (currentFallY / dropHeight) * towerH;
  const ballRadius = Math.max(12, Math.min(26, 12 + mass * 0.7));

  // Trailing ghost particles
  if (currentT > 0.1) {
    for (let i = 1; i <= 3; i++) {
      const pastT = Math.max(0, currentT - i * 0.12);
      const pastY = topY + (0.5 * g * pastT * pastT / dropHeight) * towerH;
      ctx.beginPath();
      ctx.arc(ballX, pastY, ballRadius * (1 - i * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${0.3 - i * 0.08})`;
      ctx.fill();
    }
  }

  // Sphere
  const ballGrad = ctx.createRadialGradient(ballX - 4, ballY - 4, 3, ballX, ballY, ballRadius);
  ballGrad.addColorStop(0, '#FDE68A');
  ballGrad.addColorStop(1, '#F59E0B');
  ctx.fillStyle = ballGrad;
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${mass}kg`, ballX, ballY + 4);

  // Downward Velocity Vector
  if (currentSpeed > 0) {
    const vArrowLen = Math.min(100, Math.max(15, currentSpeed * 1.8));
    drawVectorArrow(ctx, ballX + ballRadius + 14, ballY, vArrowLen, Math.PI / 2, '#00F0FF', `v = ${currentSpeed.toFixed(1)} m/s`);
  }

  // Right Side: Live Stats Board & Gravity Presets Indicator
  const boardX = ballX + 100;
  const boardW = w - boardX - 50;
  const boardY = topY + 10;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boardX, boardY, boardW, 160, 8);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Drop Telemetry', boardX + 16, boardY + 28);

  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(`Height (h):  ${dropHeight} m`, boardX + 16, boardY + 54);
  ctx.fillText(`Gravity (g): ${g} m/s²`, boardX + 16, boardY + 76);
  ctx.fillText(`Fall Time:   ${totalFallTime.toFixed(2)} s`, boardX + 16, boardY + 98);
  ctx.fillStyle = '#00F0FF';
  ctx.fillText(`Impact Speed: ${impactSpeed.toFixed(1)} m/s`, boardX + 16, boardY + 124);
  ctx.fillText(`            = ${(impactSpeed * 3.6).toFixed(0)} km/h`, boardX + 16, boardY + 144);

  ctx.restore();
}

// ==========================================
// 4. SPRING & HOOKE'S LAW EXPERIMENT (Class 10 & 11)
// ==========================================
function renderSpringExperiment(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  params: Record<string, number>,
  _t: number,
  onTelemetry: (t: Record<string, string>) => void
) {
  const f = params.force ?? 40;
  const k = params.stiffness ?? 100;
  const x = f / k;
  const cm = x * 100;
  const pe = 0.5 * k * x * x;

  onTelemetry({
    force: `${f} N`,
    stiffness: `${k} N/m`,
    extension: `${x.toFixed(2)} m (${cm.toFixed(1)} cm)`,
    storedPE: `${pe.toFixed(2)} J`
  });

  const anchorX = 220;
  const anchorY = 70;
  const baseSpringLen = 90;
  const stretchPixels = (x / 1.0) * 160; // scale
  const totalSpringLen = baseSpringLen + stretchPixels;

  ctx.save();

  // Ceiling Anchor
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(anchorX - 50, anchorY - 14, 100, 14);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(anchorX - 50, anchorY - 14, 100, 14);

  // Equilibrium Line (Dashed)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(anchorX - 80, anchorY + baseSpringLen);
  ctx.lineTo(anchorX + 80, anchorY + baseSpringLen);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'right';
  ctx.fillText('Equilibrium (x = 0)', anchorX - 88, anchorY + baseSpringLen + 4);

  // Draw Realistic Helical Coil Spring
  ctx.strokeStyle = '#8B5CF6';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = '#8B5CF6';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);

  const coils = 12;
  const stepY = totalSpringLen / coils;
  for (let i = 0; i < coils; i++) {
    const curY = anchorY + i * stepY;
    const midY = curY + stepY / 2;
    const endY = curY + stepY;
    const offset = i % 2 === 0 ? 18 : -18;
    ctx.quadraticCurveTo(anchorX + offset, midY, anchorX, endY);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Hanging Mass Block
  const massY = anchorY + totalSpringLen;
  ctx.fillStyle = '#6366F1';
  ctx.shadowColor = '#6366F1';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(anchorX - 30, massY, 60, 44, 8);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${f} N`, anchorX, massY + 26);

  // Extension Bracket & Indicator
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.5;
  const bracketX = anchorX + 60;
  ctx.beginPath();
  ctx.moveTo(bracketX, anchorY + baseSpringLen);
  ctx.lineTo(bracketX + 10, anchorY + baseSpringLen);
  ctx.lineTo(bracketX + 10, massY);
  ctx.lineTo(bracketX, massY);
  ctx.stroke();

  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`x = ${cm.toFixed(1)} cm`, bracketX + 16, (anchorY + baseSpringLen + massY) / 2 + 4);

  // Right Side: Hooke's Law F vs x Graph
  const graphX = w - 300;
  const graphY = 80;
  const graphW = 240;
  const graphH = 180;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeRect(graphX, graphY, graphW, graphH);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Hooke’s Law Graph: F = k · x', graphX + graphW / 2, graphY - 14);

  // Diagonal line representing slope = k
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(graphX, graphY + graphH);
  ctx.lineTo(graphX + graphW, graphY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Active operating point on graph
  const plotX = graphX + Math.min(graphW, (x / 1.0) * graphW);
  const plotY = graphY + graphH - Math.min(graphH, (f / 100) * graphH);

  ctx.strokeStyle = '#8B5CF6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(graphX, graphY + graphH);
  ctx.lineTo(plotX, plotY);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(plotX, plotY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.textAlign = 'left';
  ctx.fillText(`F = ${f}N, x = ${x.toFixed(2)}m`, Math.min(graphX + graphW - 130, plotX + 10), Math.max(graphY + 20, plotY - 8));

  ctx.restore();
}

// ==========================================
// 5. WAVE FREQUENCY & WAVELENGTH EXPERIMENT (Class 9 & 11)
// ==========================================
function renderWaveExperiment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  t: number,
  onTelemetry: (t: Record<string, string>) => void
) {
  const f = params.frequency ?? 1.5;
  const a = params.amplitude ?? 35;
  const waveSpeed = 160; // virtual speed px/s
  const lambda = waveSpeed / f;
  const period = 1 / f;

  onTelemetry({
    frequency: `${f} Hz`,
    amplitude: `${a} px`,
    wavelength: `${lambda.toFixed(0)} px`,
    period: `${period.toFixed(2)} s`
  });

  const centerY = h / 2 - 10;
  const startX = 60;
  const endX = w - 60;

  ctx.save();

  // Equilibrium center line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(startX, centerY);
  ctx.lineTo(endX, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Traveling Sine Wave
  const omega = 2 * Math.PI * f;
  const k = (2 * Math.PI) / lambda;

  ctx.beginPath();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#38BDF8';
  ctx.shadowBlur = 12;

  for (let x = startX; x <= endX; x += 3) {
    const y = centerY + a * Math.sin(k * (x - startX) - omega * t);
    if (x === startX) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Wave Particles / Nodes
  const particleSpacing = Math.max(20, Math.round(lambda / 4));
  for (let x = startX + 20; x < endX - 20; x += particleSpacing) {
    const y = centerY + a * Math.sin(k * (x - startX) - omega * t);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Wavelength (λ) Bracket Callout between two successive crests
  const firstCrestX = startX + ((((omega * t) / k) % lambda) + lambda) % lambda;
  const secondCrestX = firstCrestX + lambda;

  if (secondCrestX < endX) {
    const bracketY = centerY - a - 26;
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(firstCrestX, bracketY + 8);
    ctx.lineTo(firstCrestX, bracketY);
    ctx.lineTo(secondCrestX, bracketY);
    ctx.lineTo(secondCrestX, bracketY + 8);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Wavelength λ = ${lambda.toFixed(0)} px`, (firstCrestX + secondCrestX) / 2, bracketY - 6);
  }

  // Amplitude (A) Callout
  const ampX = startX + 40;
  ctx.strokeStyle = '#EC4899';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ampX, centerY);
  ctx.lineTo(ampX, centerY - a);
  ctx.stroke();

  ctx.fillStyle = '#EC4899';
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`A = ${a}px`, ampX + 8, centerY - a / 2 + 4);

  // Bottom Formula Bar
  const boxY = h - 75;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(80, boxY, w - 160, 52, 8);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`Wave Speed Formula:  v = f · λ`, w / 2, boxY + 22);

  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillStyle = '#38BDF8';
  ctx.fillText(`v = ${f} Hz × ${lambda.toFixed(0)} px = ${waveSpeed} px/s (Constant)`, w / 2, boxY + 42);

  ctx.restore();
}

// ==========================================
// 6. VECTOR RESOLUTION EXPERIMENT (Class 11)
// ==========================================
function renderVectorExperiment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: Record<string, number>,
  _t: number,
  onTelemetry: (t: Record<string, string>) => void
) {
  const r = params.magnitude ?? 50;
  const deg = params.angle ?? 35;
  const rad = (deg * Math.PI) / 180;
  const rx = r * Math.cos(rad);
  const ry = r * Math.sin(rad);

  onTelemetry({
    magnitude: `${r} N`,
    angle: `${deg}°`,
    xComp: `${rx.toFixed(1)} N (Horizontal)`,
    yComp: `${ry.toFixed(1)} N (Vertical)`
  });

  const originX = 180;
  const originY = h - 110;
  const scale = 3.2; // pixels per Newton

  const tipX = originX + rx * scale;
  const tipY = originY - ry * scale;

  ctx.save();

  // Cartesian Axes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;

  // X Axis
  ctx.beginPath();
  ctx.moveTo(originX - 30, originY);
  ctx.lineTo(w - 60, originY);
  ctx.stroke();

  // Y Axis
  ctx.beginPath();
  ctx.moveTo(originX, originY + 30);
  ctx.lineTo(originX, 50);
  ctx.stroke();

  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'right';
  ctx.fillText('X Axis (Horizontal)', w - 70, originY - 10);
  ctx.fillText('Y Axis (Vertical)', originX - 10, 65);

  // Origin point
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(originX, originY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Angle θ Arc
  const arcRadius = 45;
  ctx.beginPath();
  ctx.arc(originX, originY, arcRadius, -rad, 0);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`θ = ${deg}°`, originX + arcRadius + 8, originY - arcRadius / 2);

  // Horizontal Component Vector (Rx along X)
  drawVectorArrow(ctx, originX, originY, rx * scale, 0, '#10B981', `R_x = ${rx.toFixed(1)} N`);

  // Vertical Component Vector (Ry along Y)
  drawVectorArrow(ctx, originX, originY, ry * scale, -Math.PI / 2, '#38BDF8', `R_y = ${ry.toFixed(1)} N`);

  // Dashed Resolution Box (Completing the right-angled triangle)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(tipX, originY);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(originX, tipY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Main Resultant Vector Arrow (R)
  drawVectorArrow(ctx, originX, originY, r * scale, -rad, '#EC4899', `R = ${r} N`);

  // Right Side: Vector Equations & Component Box
  const boxX = w - 280;
  const boxY = 80;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, 230, 180, 10);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Vector Components', boxX + 16, boxY + 28);

  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillStyle = '#10B981';
  ctx.fillText(`R_x = R · cos θ`, boxX + 16, boxY + 58);
  ctx.fillText(`    = ${r} · cos(${deg}°)`, boxX + 16, boxY + 76);
  ctx.fillText(`    = ${rx.toFixed(1)} N`, boxX + 16, boxY + 94);

  ctx.fillStyle = '#38BDF8';
  ctx.fillText(`R_y = R · sin θ`, boxX + 16, boxY + 120);
  ctx.fillText(`    = ${r} · sin(${deg}°)`, boxX + 16, boxY + 138);
  ctx.fillText(`    = ${ry.toFixed(1)} N`, boxX + 16, boxY + 156);

  ctx.restore();
}

// ==========================================
// HELPER: Vector Arrow Drawing with Glowing Head
// ==========================================
function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  length: number,
  angleRad: number,
  color: string,
  label: string
) {
  if (length <= 2) return;
  const toX = fromX + length * Math.cos(angleRad);
  const toY = fromY + length * Math.sin(angleRad);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrowhead
  const headLen = 10;
  const headAngle = Math.PI / 7;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angleRad - headAngle), toY - headLen * Math.sin(angleRad - headAngle));
  ctx.lineTo(toX - headLen * Math.cos(angleRad + headAngle), toY - headLen * Math.sin(angleRad + headAngle));
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Label text
  if (label) {
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const normX = -Math.sin(angleRad);
    const normY = Math.cos(angleRad);
    ctx.fillText(label, midX + normX * 14, midY + normY * 14);
  }

  ctx.restore();
}
