import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Hand } from 'lucide-react';

export interface SimControlDef {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
}

interface CanvasSimulatorProps {
  simId: string;
  params: Record<string, number>;
  isPlaying: boolean;
  onTelemetryUpdate: (telemetry: Record<string, string>) => void;
  controls?: SimControlDef[];
  onParamChange?: (id: string, value: number) => void;
  onTogglePlay?: () => void;
  onReset?: () => void;
}

export const CanvasSimulator: React.FC<CanvasSimulatorProps> = ({
  simId,
  params,
  isPlaying,
  onTelemetryUpdate,
  controls,
  onParamChange,
  onTogglePlay,
  onReset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);

  // Active touch and gesture state
  const [activeControlIdx, setActiveControlIdx] = useState(0);
  const [touchState, setTouchState] = useState<{
    isDragging: boolean;
    hudText: string | null;
  }>({
    isDragging: false,
    hudText: null
  });

  const touchReticleRef = useRef<{ active: boolean; x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    params: Record<string, number>;
  }>({ x: 0, y: 0, params: {} });

  const showHudMessage = (msg: string) => {
    setTouchState(prev => ({ ...prev, hudText: msg }));
  };

  const processPointerMove = (cx: number, cy: number, isInitial = false) => {
    if (!controls || controls.length === 0 || !onParamChange) return;

    const startX = dragStartRef.current.x;
    const startY = dragStartRef.current.y;
    const startP = dragStartRef.current.params;

    let hudMsg = '';

    // Direct Natural Touch Manipulation for Specific Physics / Math Modules
    if (simId === 'trig_unit_circle') {
      const centerX = 390;
      const centerY = 190;
      let deg = Math.round(Math.atan2(-(cy - centerY), cx - centerX) * (180 / Math.PI));
      if (deg < 0) deg += 360;
      onParamChange('theta', deg);
      hudMsg = `Angle θ = ${deg}°`;
    } else if (simId === 'work_angle_pull') {
      const boxX = 280;
      const boxY = 250;
      let deg = Math.round(Math.atan2(-(cy - boxY), cx - boxX) * (180 / Math.PI));
      deg = Math.max(0, Math.min(85, deg));
      onParamChange('theta', deg);
      hudMsg = `Pull Angle θ = ${deg}°`;
    } else if (simId === 'optics_snells_law') {
      const normX = 390;
      const normY = 190;
      let deg = Math.round(Math.atan2(normX - cx, normY - cy) * (180 / Math.PI));
      deg = Math.max(5, Math.min(85, Math.abs(deg)));
      onParamChange('theta1', deg);
      hudMsg = `Incident Angle θ₁ = ${deg}°`;
    } else if (simId === 'motion_free_fall') {
      const groundY = 320;
      const topY = 60;
      const ratio = Math.max(0, Math.min(1, (groundY - cy) / (groundY - topY)));
      const hCtrl = controls.find(c => c.id === 'h');
      if (hCtrl) {
        const val = Math.round(hCtrl.min + ratio * (hCtrl.max - hCtrl.min));
        onParamChange('h', val);
        hudMsg = `Release Height h = ${val} m`;
      }
    } else if (simId === 'energy_spring_mass') {
      const neutralX = 390;
      const deltaX = (cx - neutralX) / 120;
      const xCtrl = controls.find(c => c.id === 'x0' || c.id === 'x');
      if (xCtrl) {
        const val = Math.max(xCtrl.min, Math.min(xCtrl.max, parseFloat(deltaX.toFixed(2))));
        onParamChange(xCtrl.id, val);
        hudMsg = `Displacement x = ${val} m`;
      }
    } else if (simId === 'optics_thin_lens') {
      const lensX = 390;
      const dist = Math.max(10, Math.min(120, Math.round((lensX - cx) * 0.35)));
      const doCtrl = controls.find(c => c.id === 'do');
      if (doCtrl) {
        onParamChange('do', dist);
        hudMsg = `Object Distance do = ${dist} cm`;
      }
    } else if (simId === 'calc_secant_tangent') {
      const normX = (cx - 120) / 450;
      const xCtrl = controls.find(c => c.id === 'x');
      if (xCtrl) {
        const val = Math.max(xCtrl.min, Math.min(xCtrl.max, parseFloat((xCtrl.min + normX * (xCtrl.max - xCtrl.min)).toFixed(2))));
        onParamChange('x', val);
        hudMsg = `Curve Point x = ${val}`;
      }
    } else {
      // Universal Tactile Engine for ALL Other Simulations
      const primaryCtrl = controls[activeControlIdx] || controls[0];
      const spanX = primaryCtrl.max - primaryCtrl.min;
      const sensitivityX = 400; // pixels to sweep full parameter scale
      const dx = cx - startX;
      const startVal = startP[primaryCtrl.id] ?? primaryCtrl.defaultValue;
      let nextVal = startVal + (dx / sensitivityX) * spanX;
      nextVal = Math.max(primaryCtrl.min, Math.min(primaryCtrl.max, nextVal));

      const step = primaryCtrl.step || 1;
      const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
      nextVal = parseFloat((Math.round(nextVal / step) * step).toFixed(precision));

      onParamChange(primaryCtrl.id, nextVal);
      hudMsg = `${primaryCtrl.label}: ${nextVal} ${primaryCtrl.unit || ''}`;

      // 2D Gesture: Vertical drag modulates 2nd control (if present)
      if (controls.length > 1 && !isInitial) {
        const secIdx = activeControlIdx === 0 ? 1 : 0;
        const secCtrl = controls[secIdx];
        const spanY = secCtrl.max - secCtrl.min;
        const sensitivityY = 320;
        const dy = startY - cy; // Dragging upwards increases value
        const secStartVal = startP[secCtrl.id] ?? secCtrl.defaultValue;
        let secNextVal = secStartVal + (dy / sensitivityY) * spanY;
        secNextVal = Math.max(secCtrl.min, Math.min(secCtrl.max, secNextVal));
        const secStep = secCtrl.step || 1;
        const secPrec = secStep.toString().includes('.') ? secStep.toString().split('.')[1].length : 0;
        secNextVal = parseFloat((Math.round(secNextVal / secStep) * secStep).toFixed(secPrec));
        onParamChange(secCtrl.id, secNextVal);
      }
    }

    setTouchState({
      isDragging: true,
      hudText: hudMsg
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    // Quick double-tap anywhere on canvas toggles play/pause
    if (now - lastTapTimeRef.current < 320) {
      if (onTogglePlay) onTogglePlay();
      showHudMessage(isPlaying ? 'Simulation Paused' : 'Simulation Playing');
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    const container = containerRef.current;
    if (!container) return;

    try {
      container.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if browser prevents pointer capture
    }

    const rect = container.getBoundingClientRect();
    const scaleX = 780 / rect.width;
    const scaleY = 380 / rect.height;
    const cx = Math.max(0, Math.min(780, (e.clientX - rect.left) * scaleX));
    const cy = Math.max(0, Math.min(380, (e.clientY - rect.top) * scaleY));

    dragStartRef.current = {
      x: cx,
      y: cy,
      params: { ...params }
    };

    touchReticleRef.current = { active: true, x: cx, y: cy };
    processPointerMove(cx, cy, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchReticleRef.current?.active) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scaleX = 780 / rect.width;
    const scaleY = 380 / rect.height;
    const cx = Math.max(0, Math.min(780, (e.clientX - rect.left) * scaleX));
    const cy = Math.max(0, Math.min(380, (e.clientY - rect.top) * scaleY));

    touchReticleRef.current.x = cx;
    touchReticleRef.current.y = cy;

    processPointerMove(cx, cy, false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    touchReticleRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    setTouchState(prev => ({
      ...prev,
      isDragging: false
    }));
    setTimeout(() => {
      setTouchState(prev => (prev.isDragging ? prev : { ...prev, hudText: null }));
    }, 2000);
  };

  const handleNudge = (deltaSteps: number) => {
    if (!controls || controls.length === 0 || !onParamChange) return;
    const ctrl = controls[activeControlIdx] || controls[0];
    const curVal = params[ctrl.id] ?? ctrl.defaultValue;
    const step = ctrl.step || 1;
    let nextVal = curVal + deltaSteps * step;
    nextVal = Math.max(ctrl.min, Math.min(ctrl.max, nextVal));
    const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
    nextVal = parseFloat(nextVal.toFixed(precision));
    onParamChange(ctrl.id, nextVal);
    showHudMessage(`${ctrl.label} = ${nextVal} ${ctrl.unit || ''}`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        timeRef.current += 0.02;
      }
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw subtle background grid
      drawCoordinateGrid(ctx, w, h);

      // Dispatch to specific simulation renderer
      switch (simId) {
        // --- ALGEBRA ---
        case 'algebra_linear':
          renderLinearEquation(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'algebra_quadratic':
          renderQuadraticParabola(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'algebra_system':
          renderLinearSystem(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- TRIGONOMETRY ---
        case 'trig_unit_circle':
          renderUnitCircle(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'trig_wave_unroll':
          renderWaveUnroll(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'trig_triangle':
          renderRightTriangle(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- COORDINATE GEOMETRY ---
        case 'coord_distance':
          renderDistanceMidpoint(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'coord_circle':
          renderCircleEquation(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'coord_section':
          renderSectionFormula(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- FUNCTIONS ---
        case 'func_machine':
          renderFunctionMachine(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'func_transform':
          renderFunctionTransform(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'func_vertical_line':
          renderVerticalLineTest(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- SEQUENCES ---
        case 'seq_ap_staircase':
          renderAPStaircase(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'seq_gp_growth':
          renderGPGrowth(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'seq_golden_spiral':
          renderGoldenSpiral(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- BASIC CALCULUS ---
        case 'calc_secant_tangent':
          renderSecantTangent(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'calc_riemann_area':
          renderRiemannArea(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'calc_kinematics_deriv':
          renderKinematicDeriv(ctx, w, h, params, t, onTelemetryUpdate);
          break;

        // --- UNITS & DIMENSIONS ---
        case 'units_scaling':
          renderScaleUniverse(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'units_checker':
          renderDimensionalChecker(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'units_vernier':
          renderVernierCaliper(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- MOTION ---
        case 'motion_car_track':
          renderKinematicCar(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'motion_free_fall':
          renderFreeFall(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'motion_relative':
          renderRelativeMotion(ctx, w, h, params, t, onTelemetryUpdate);
          break;

        // --- NEWTON'S LAWS ---
        case 'newton_inertia_friction':
          renderInertiaFriction(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'newton_f_ma':
          renderFEqualsMA(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'newton_action_reaction':
          renderActionReaction(ctx, w, h, params, t, onTelemetryUpdate);
          break;

        // --- WORK, ENERGY & POWER ---
        case 'energy_rollercoaster':
          renderEnergyRollercoaster(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'work_angle_pull':
          renderWorkAtAngle(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'energy_spring_mass':
          renderSpringEnergy(ctx, w, h, params, t, onTelemetryUpdate);
          break;

        // --- GRAVITATION ---
        case 'grav_two_body':
          renderTwoBodyGrav(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'grav_orbit_satellite':
          renderKeplerOrbit(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'grav_altitude_g':
          renderGravityAltitude(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- WAVES ---
        case 'wave_transverse_string':
          renderTransverseWave(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'wave_sound_particles':
          renderSoundWaves(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'wave_superposition':
          renderWaveSuperposition(ctx, w, h, params, t, onTelemetryUpdate);
          break;

        // --- OPTICS ---
        case 'optics_snells_law':
          renderSnellsLaw(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'optics_thin_lens':
          renderThinLens(ctx, w, h, params, onTelemetryUpdate);
          break;
        case 'optics_prism_dispersion':
          renderPrismDispersion(ctx, w, h, params, onTelemetryUpdate);
          break;

        // --- THERMODYNAMICS ---
        case 'thermo_ideal_gas_chamber':
          renderIdealGasChamber(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'thermo_carnot_cycle':
          renderCarnotCycle(ctx, w, h, params, t, onTelemetryUpdate);
          break;
        case 'thermo_heat_conduction':
          renderHeatConduction(ctx, w, h, params, t, onTelemetryUpdate);
          break;

        default:
          renderDefaultFallback(ctx, w, h);
      }

      // Live 60fps touch indicator and ripple on canvas
      if (touchReticleRef.current?.active) {
        const tx = touchReticleRef.current.x;
        const ty = touchReticleRef.current.y;
        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, 22 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(tx, ty, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [simId, params, isPlaying, onTelemetryUpdate]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <canvas
        ref={canvasRef}
        width={780}
        height={380}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: 'var(--radius-lg)',
          background: 'radial-gradient(ellipse at 50% 35%, #0B132B 0%, #050814 100%)',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(0, 240, 255, 0.22)'
        }}
      />

      {/* TOP FLOATING HUD ROW: Touch Status Badge & Quick Actions */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div className={`canvas-touch-badge ${touchState.isDragging ? 'dragging' : ''}`}>
          <Hand size={12} className="touch-icon" />
          <span>{touchState.hudText || 'Touch & Drag Screen to Operate'}</span>
        </div>

        <div className="canvas-touch-actions">
          {onTogglePlay && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="canvas-action-btn"
              title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="canvas-action-btn"
              title="Reset Simulation"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM FLOATING CONTROLS: Parameter Chips & Stepper Nudge */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10,
          gap: 8
        }}
      >
        {controls && controls.length > 0 ? (
          <div className="canvas-param-selector">
            {controls.map((c, idx) => {
              const val = params[c.id] ?? c.defaultValue;
              const isSelected = idx === activeControlIdx;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveControlIdx(idx);
                    showHudMessage(`Active Touch: ${c.label} (${val}${c.unit ? ` ${c.unit}` : ''})`);
                  }}
                  className={`param-chip-btn ${isSelected ? 'active' : ''}`}
                >
                  <span>{c.label}:</span>
                  <strong>{val}{c.unit ? ` ${c.unit}` : ''}</strong>
                </button>
              );
            })}
          </div>
        ) : <div />}

        {controls && controls.length > 0 && onParamChange && (
          <div className="canvas-nudge-group">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNudge(-1); }}
              className="canvas-nudge-btn"
              title="Step decrease"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNudge(1); }}
              className="canvas-nudge-btn"
              title="Step increase"
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   HELPER UTILITIES: Grids, Arrows & Axes (Futuristic Lab Viewport)
   ========================================================================== */

function drawCoordinateGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  // 1. Subtle Blueprint / Oscilloscope Dark Lab Minor Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const step = 35;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 2. Major Grid Lines every 140px with higher contrast
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1.2;
  for (let x = 0; x < w; x += 140) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 140) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 3. Precision HUD Corner Reticles [  ]
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 1.5;
  const rSize = 14;
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(12, 12 + rSize);
  ctx.lineTo(12, 12);
  ctx.lineTo(12 + rSize, 12);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(w - 12 - rSize, 12);
  ctx.lineTo(w - 12, 12);
  ctx.lineTo(w - 12, 12 + rSize);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(12, h - 12 - rSize);
  ctx.lineTo(12, h - 12);
  ctx.lineTo(12 + rSize, h - 12);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(w - 12 - rSize, h - 12);
  ctx.lineTo(w - 12, h - 12);
  ctx.lineTo(w - 12, h - 12 - rSize);
  ctx.stroke();

  // 4. Engine Telemetry Stamp (Bottom Right)
  ctx.font = '700 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.textAlign = 'right';
  ctx.fillText('PHYSORA LAB // 60 FPS PRECISION SENSOR VIEW', w - 18, h - 8);

  ctx.restore();
}

function drawAxes(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1.5;

  // X axis
  ctx.beginPath();
  ctx.moveTo(20, cy);
  ctx.lineTo(w - 20, cy);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, h - 20);
  ctx.stroke();

  // Glowing Origin Point (0,0)
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00F0FF';
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('X', w - 16, cy + 4);
  ctx.fillText('Y', cx + 6, 26);
  ctx.fillText('(0,0)', cx - 30, cy + 16);
  ctx.restore();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  tx: number,
  ty: number,
  color: string,
  label = '',
  headSize = 8
) {
  const dx = tx - fx;
  const dy = ty - fy;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - headSize * Math.cos(angle - Math.PI / 6), ty - headSize * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tx - headSize * Math.cos(angle + Math.PI / 6), ty - headSize * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.shadowBlur = 0;
    ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(label, tx + 6, ty - 3);
  }
  ctx.restore();
}

/* ==========================================================================
   01. ALGEBRA SIMULATIONS
   ========================================================================== */

function renderLinearEquation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = 24;

  const m = p.m ?? 1.5;
  const c = p.c ?? 2;

  drawAxes(ctx, cx, cy, w, h);

  // Line equation: y = m*x + c
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;

  const xStart = -14;
  const xEnd = 14;
  const yStart = m * xStart + c;
  const yEnd = m * xEnd + c;

  ctx.moveTo(cx + xStart * scale, cy - yStart * scale);
  ctx.lineTo(cx + xEnd * scale, cy - yEnd * scale);
  ctx.stroke();

  // Highlight Y-intercept (0, c)
  const yIntX = cx;
  const yIntY = cy - c * scale;
  ctx.beginPath();
  ctx.arc(yIntX, yIntY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#7C3AED';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#7C3AED';
  ctx.font = '600 11px JetBrains Mono';
  ctx.fillText(`(0, ${c})`, yIntX + 8, yIntY - 6);

  // Highlight X-intercept (-c/m, 0) if m != 0
  let rootVal = 'None (Parallel)';
  if (Math.abs(m) > 0.001) {
    const rootX = -c / m;
    rootVal = `x = ${rootX.toFixed(2)}`;
    const rScreenX = cx + rootX * scale;
    const rScreenY = cy;

    if (rScreenX >= 30 && rScreenX <= w - 30) {
      ctx.beginPath();
      ctx.arc(rScreenX, rScreenY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#10B981';
      ctx.fillText(`(${rootX.toFixed(1)}, 0)`, rScreenX - 20, rScreenY + 18);
    }
  }

  const sign = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  onTelem({
    equation: `y = ${m}x ${sign}`,
    root: rootVal,
    steepness: `${(Math.atan(m) * 180 / Math.PI).toFixed(1)}°`
  });
}

function renderQuadraticParabola(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2 + 30;
  const scale = 22;

  const a = p.a ?? 1;
  const b = p.b ?? -2;
  const c = p.c ?? -3;

  drawAxes(ctx, cx, cy, w, h);

  // Plot Parabola: y = ax^2 + bx + c
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;

  let started = false;
  for (let x = -12; x <= 12; x += 0.1) {
    const y = a * x * x + b * x + c;
    const sx = cx + x * scale;
    const sy = cy - y * scale;

    if (sy >= 10 && sy <= h - 10) {
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else { ctx.lineTo(sx, sy); }
    }
  }
  ctx.stroke();

  // Vertex: x_v = -b / (2a), y_v = c - b^2 / (4a)
  const xv = -b / (2 * a);
  const yv = a * xv * xv + b * xv + c;
  const svx = cx + xv * scale;
  const svy = cy - yv * scale;

  ctx.beginPath();
  ctx.arc(svx, svy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#EC4899';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#EC4899';
  ctx.font = '600 11px JetBrains Mono';
  ctx.fillText(`Vertex (${xv.toFixed(1)}, ${yv.toFixed(1)})`, svx + 8, svy - 6);

  // Discriminant D = b^2 - 4ac
  const D = b * b - 4 * a * c;
  let rootsDisplay = 'No Real Roots';

  if (D >= 0) {
    const r1 = (-b - Math.sqrt(D)) / (2 * a);
    const r2 = (-b + Math.sqrt(D)) / (2 * a);
    rootsDisplay = `x₁ = ${r1.toFixed(1)}, x₂ = ${r2.toFixed(1)}`;

    [r1, r2].forEach(r => {
      const rx = cx + r * scale;
      ctx.beginPath();
      ctx.arc(rx, cy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  onTelem({
    d: `D = ${D.toFixed(1)} ${D > 0 ? '(2 Roots)' : D === 0 ? '(1 Root)' : '(Complex)'}`,
    roots: rootsDisplay,
    vertex: `(${xv.toFixed(2)}, ${yv.toFixed(2)})`
  });
}

function renderLinearSystem(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = 22;

  const m1 = p.m1 ?? 2;
  const c1 = p.c1 ?? -1;
  const m2 = p.m2 ?? -0.5;
  const c2 = p.c2 ?? 4;

  drawAxes(ctx, cx, cy, w, h);

  // Line 1 (Blue)
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.2;
  ctx.moveTo(cx - 12 * scale, cy - (m1 * -12 + c1) * scale);
  ctx.lineTo(cx + 12 * scale, cy - (m1 * 12 + c1) * scale);
  ctx.stroke();

  // Line 2 (Purple)
  ctx.beginPath();
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 2.2;
  ctx.moveTo(cx - 12 * scale, cy - (m2 * -12 + c2) * scale);
  ctx.lineTo(cx + 12 * scale, cy - (m2 * 12 + c2) * scale);
  ctx.stroke();

  // Intersection: m1*x + c1 = m2*x + c2 => x = (c2 - c1) / (m1 - m2)
  if (Math.abs(m1 - m2) > 0.001) {
    const ix = (c2 - c1) / (m1 - m2);
    const iy = m1 * ix + c1;

    const isx = cx + ix * scale;
    const isy = cy - iy * scale;

    ctx.beginPath();
    ctx.arc(isx, isy, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillText(`Intersect (${ix.toFixed(1)}, ${iy.toFixed(1)})`, isx + 10, isy - 8);

    onTelem({
      intersect: `(${ix.toFixed(2)}, ${iy.toFixed(2)})`,
      status: 'Unique Consistent Solution'
    });
  } else {
    onTelem({
      intersect: 'No Intersection',
      status: 'Parallel Lines (Inconsistent)'
    });
  }
}

/* ==========================================================================
   02. TRIGONOMETRY SIMULATIONS
   ========================================================================== */

function renderUnitCircle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const R = 110;

  const deg = p.theta ?? 45;
  const rad = (deg * Math.PI) / 180;

  drawAxes(ctx, cx, cy, w, h);

  // 1. Glowing Unit Circle Reticle with Degree Ticks
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Degree tick marks (30°, 45°, 60°, 90°, etc.)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1;
  for (let a = 0; a < 360; a += 15) {
    const aRad = (a * Math.PI) / 180;
    const isMajor = a % 90 === 0;
    const isSemi = a % 45 === 0;
    const tickLen = isMajor ? 10 : isSemi ? 6 : 3;
    const x1 = cx + Math.cos(aRad) * (R - tickLen);
    const y1 = cy - Math.sin(aRad) * (R - tickLen);
    const x2 = cx + Math.cos(aRad) * R;
    const y2 = cy - Math.sin(aRad) * R;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Shaded Reference Triangle
  const px = cx + Math.cos(rad) * R;
  const py = cy - Math.sin(rad) * R;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, cy);
  ctx.lineTo(px, py);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.fill();
  ctx.restore();

  // 3. Cosine Bar (Horizontal Emerald Beam with Bloom)
  ctx.save();
  ctx.strokeStyle = '#10B981';
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, cy);
  ctx.stroke();
  ctx.restore();

  // 4. Sine Bar (Vertical Rose Beam with Bloom)
  ctx.save();
  ctx.strokeStyle = '#F43F5E';
  ctx.shadowColor = '#F43F5E';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(px, cy);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.restore();

  // 5. Radius Arm Phasor (Electric Cyan)
  ctx.save();
  ctx.strokeStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.restore();

  // 6. Glowing Orbital Point on Circle
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#00F0FF';
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(px, py, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Coordinate Tag
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const tanVal = Math.abs(cosVal) > 0.001 ? (sinVal / cosVal).toFixed(3) : 'Undefined';

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText(`(${cosVal.toFixed(2)}, ${sinVal.toFixed(2)})`, px + (cosVal >= 0 ? 8 : -75), py + (sinVal >= 0 ? -10 : 18));

  // Angle Arc
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, 32, -rad, 0);
  ctx.stroke();
  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`θ=${deg}°`, cx + 38, cy - 8);

  onTelem({
    radians: `${rad.toFixed(2)} rad (${(rad / Math.PI).toFixed(2)}π)`,
    sin: sinVal.toFixed(3),
    cos: cosVal.toFixed(3),
    tan: tanVal
  });
}

function renderWaveUnroll(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const circleX = 140;
  const circleY = h / 2;
  const R = p.amplitude ?? 50;
  const omega = p.freq ?? 1.2;

  const currentAngle = t * omega * 2;
  const px = circleX + Math.cos(currentAngle) * R;
  const py = circleY - Math.sin(currentAngle) * R;

  // Circle
  ctx.beginPath();
  ctx.arc(circleX, circleY, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 98, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arm & Pointer
  ctx.beginPath();
  ctx.moveTo(circleX, circleY);
  ctx.lineTo(px, py);
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();

  // Unrolling Sine Wave Line
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;

  const waveStartX = 240;
  for (let x = waveStartX; x < w - 20; x += 3) {
    const waveT = currentAngle - (x - waveStartX) * 0.035;
    const wy = circleY - Math.sin(waveT) * R;
    if (x === waveStartX) ctx.moveTo(x, wy);
    else ctx.lineTo(x, wy);
  }
  ctx.stroke();

  // Connecting horizontal dashed line
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.moveTo(px, py);
  ctx.lineTo(waveStartX, py);
  ctx.stroke();
  ctx.setLineDash([]);

  onTelem({
    wavelength: `${((2 * Math.PI) / 0.035).toFixed(0)} px`,
    peak: `±${R.toFixed(0)}`
  });
}

function renderRightTriangle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const ox = w / 2 - 120;
  const oy = h / 2 + 80;
  const scale = 22;

  const base = p.base ?? 6;
  const height = p.height ?? 4.5;
  const hyp = Math.hypot(base, height);
  const thetaRad = Math.atan2(height, base);

  const bx = ox + base * scale;
  const by = oy;
  const ax = bx;
  const ay = oy - height * scale;

  // Triangle body
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(bx, by);
  ctx.lineTo(ax, ay);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 98, 255, 0.08)';
  ctx.fill();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Right angle indicator
  const sq = 14;
  ctx.strokeRect(bx - sq, by - sq, sq, sq);

  // Labels
  ctx.fillStyle = '#0F172A';
  ctx.font = '600 12px JetBrains Mono';
  ctx.fillText(`Base: ${base}`, ox + (base * scale) / 2 - 20, oy + 20);
  ctx.fillText(`Height: ${height}`, bx + 12, oy - (height * scale) / 2);
  ctx.fillText(`Hyp: ${hyp.toFixed(1)}`, ox + 15, ay + 20);

  onTelem({
    hyp: `${hyp.toFixed(2)}`,
    angle: `${(thetaRad * 180 / Math.PI).toFixed(1)}°`,
    pythagoras: `${(base * base).toFixed(1)} + ${(height * height).toFixed(1)} = ${(hyp * hyp).toFixed(1)}`
  });
}

/* ==========================================================================
   03. COORDINATE GEOMETRY SIMULATIONS
   ========================================================================== */

function renderDistanceMidpoint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = 22;

  const x1 = p.x1 ?? -4;
  const y1 = p.y1 ?? -2;
  const x2 = p.x2 ?? 5;
  const y2 = p.y2 ?? 4;

  drawAxes(ctx, cx, cy, w, h);

  const sx1 = cx + x1 * scale;
  const sy1 = cy - y1 * scale;
  const sx2 = cx + x2 * scale;
  const sy2 = cy - y2 * scale;

  // Right triangle under the segment
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#94A3B8';
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Main hypotenuse distance line
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Points A and B
  ctx.beginPath();
  ctx.arc(sx1, sy1, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();
  ctx.fillText(`A(${x1}, ${y1})`, sx1 - 35, sy1 - 10);

  ctx.beginPath();
  ctx.arc(sx2, sy2, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#7C3AED';
  ctx.fill();
  ctx.fillText(`B(${x2}, ${y2})`, sx2 + 10, sy2 - 10);

  // Midpoint M
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const smx = cx + mx * scale;
  const smy = cy - my * scale;

  ctx.beginPath();
  ctx.arc(smx, smy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#10B981';
  ctx.fill();

  const dist = Math.hypot(x2 - x1, y2 - y1);
  const slope = x2 !== x1 ? ((y2 - y1) / (x2 - x1)).toFixed(2) : 'Vertical';

  onTelem({
    distance: `${dist.toFixed(2)} units`,
    midpoint: `M(${mx.toFixed(1)}, ${my.toFixed(1)})`,
    slope: slope
  });
}

function renderCircleEquation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = 22;

  const hVal = p.h ?? 1;
  const kVal = p.k ?? 0;
  const rVal = p.r ?? 4;

  drawAxes(ctx, cx, cy, w, h);

  const scx = cx + hVal * scale;
  const scy = cy - kVal * scale;
  const sRadius = rVal * scale;

  // Circle
  ctx.beginPath();
  ctx.arc(scx, scy, sRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(0, 98, 255, 0.05)';
  ctx.fill();
  ctx.stroke();

  // Center (h, k)
  ctx.beginPath();
  ctx.arc(scx, scy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#EC4899';
  ctx.fill();
  ctx.fillStyle = '#EC4899';
  ctx.font = '600 11px JetBrains Mono';
  ctx.fillText(`Center (${hVal}, ${kVal})`, scx + 8, scy - 6);

  // Rotating radius vector
  const rx = scx + Math.cos(t) * sRadius;
  const ry = scy - Math.sin(t) * sRadius;
  drawArrow(ctx, scx, scy, rx, ry, '#7C3AED', `r=${rVal}`);

  onTelem({
    eq: `(x - ${hVal})² + (y - ${kVal})² = ${rVal * rVal}`,
    area: `${(Math.PI * rVal * rVal).toFixed(1)} sq units`,
    circ: `${(2 * Math.PI * rVal).toFixed(1)} units`
  });
}

function renderSectionFormula(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = 22;

  const m = p.m ?? 2;
  const n = p.n ?? 3;

  const x1 = -6, y1 = -3;
  const x2 = 6, y2 = 4;

  drawAxes(ctx, cx, cy, w, h);

  const sx1 = cx + x1 * scale;
  const sy1 = cy - y1 * scale;
  const sx2 = cx + x2 * scale;
  const sy2 = cy - y2 * scale;

  // Segment AB
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Section Point P = (m*x2 + n*x1)/(m+n)
  const px = (m * x2 + n * x1) / (m + n);
  const py = (m * y2 + n * y1) / (m + n);
  const spx = cx + px * scale;
  const spy = cy - py * scale;

  // Color segment AP (blue) and PB (purple)
  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(spx, spy);
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(spx, spy);
  ctx.lineTo(sx2, sy2);
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Point P
  ctx.beginPath();
  ctx.arc(spx, spy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#10B981';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText(`P(${px.toFixed(1)}, ${py.toFixed(1)})`, spx - 20, spy - 12);

  onTelem({
    ratio: `${m} : ${n}`,
    px: `(${px.toFixed(2)}, ${py.toFixed(2)})`
  });
}

/* ==========================================================================
   04. FUNCTIONS SIMULATIONS
   ========================================================================== */

function renderFunctionMachine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const xIn = p.x_in ?? 2;
  const a = p.multiplier ?? 2;
  const b = p.adder ?? 1;
  const yOut = a * xIn + b;

  const cx = w / 2;
  const cy = h / 2;

  // Function Machine Box
  ctx.fillStyle = 'rgba(0, 98, 255, 0.08)';
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  ctx.roundRect(cx - 90, cy - 60, 180, 120, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('f(x) Machine', cx, cy - 20);
  ctx.fillStyle = '#7C3AED';
  ctx.font = 'bold 13px JetBrains Mono';
  ctx.fillText(`f(x) = ${a}x + ${b}`, cx, cy + 10);

  // Rotating Gear inside machine
  ctx.save();
  ctx.translate(cx, cy + 32);
  ctx.rotate(t * 1.5);
  ctx.strokeStyle = 'rgba(0, 98, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Input Pipe (Left)
  ctx.fillStyle = '#00E5FF';
  ctx.beginPath();
  ctx.arc(cx - 160, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText(`x=${xIn}`, cx - 160, cy + 4);
  drawArrow(ctx, cx - 130, cy, cx - 95, cy, '#00E5FF', 'Input');

  // Output Pipe (Right)
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(cx + 160, cy, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText(`y=${yOut}`, cx + 160, cy + 4);
  drawArrow(ctx, cx + 95, cy, cx + 130, cy, '#10B981', 'Output');

  onTelem({
    rule: `f(x) = ${a}x + ${b}`,
    out: `f(${xIn}) = ${yOut}`,
    coord: `(${xIn}, ${yOut})`
  });
}

function renderFunctionTransform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2 + 30;
  const scale = 22;

  const hVal = p.h ?? 2;
  const kVal = p.k ?? -1;
  const aVal = p.scale ?? 1;

  drawAxes(ctx, cx, cy, w, h);

  // Original parent graph: y = x^2 (dashed grey)
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  for (let x = -8; x <= 8; x += 0.2) {
    const y = x * x;
    const sx = cx + x * scale;
    const sy = cy - y * scale;
    if (x === -8) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Transformed graph: y = a*(x - h)^2 + k
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;

  let started = false;
  for (let x = -8; x <= 8; x += 0.1) {
    const y = aVal * Math.pow(x - hVal, 2) + kVal;
    const sx = cx + x * scale;
    const sy = cy - y * scale;
    if (sy >= 10 && sy <= h - 10) {
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else { ctx.lineTo(sx, sy); }
    }
  }
  ctx.stroke();

  // Highlight new vertex
  const vx = cx + hVal * scale;
  const vy = cy - kVal * scale;
  ctx.beginPath();
  ctx.arc(vx, vy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#7C3AED';
  ctx.fill();

  onTelem({
    trans_eq: `y = ${aVal}(x - ${hVal})² + ${kVal}`,
    vertex_pos: `(${hVal}, ${kVal})`
  });
}

function renderVerticalLineTest(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = 24;

  const sweepX = p.sweep_x ?? 0;
  drawAxes(ctx, cx, cy, w, h);

  // Draw Circle: x^2 + y^2 = 16 (Not a function!)
  ctx.beginPath();
  ctx.arc(cx, cy, 4 * scale, 0, Math.PI * 2);
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Sweep vertical line
  const lineScreenX = cx + sweepX * scale;
  ctx.beginPath();
  ctx.moveTo(lineScreenX, 20);
  ctx.lineTo(lineScreenX, h - 20);
  ctx.strokeStyle = '#EC4899';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Check intersections with circle x^2 + y^2 = 16 => y = ±sqrt(16 - x^2)
  let hits = 0;
  if (Math.abs(sweepX) <= 4) {
    const yVal = Math.sqrt(16 - sweepX * sweepX);
    hits = Math.abs(yVal) > 0.05 ? 2 : 1;

    [yVal, -yVal].forEach(y => {
      ctx.beginPath();
      ctx.arc(lineScreenX, cy - y * scale, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#EC4899';
      ctx.fill();
    });
  }

  onTelem({
    hits: `${hits} Point${hits !== 1 ? 's' : ''}`,
    valid: hits > 1 ? 'NO (Fails Vertical Line Test)' : 'YES'
  });
}

/* ==========================================================================
   05. SEQUENCES SIMULATIONS
   ========================================================================== */

function renderAPStaircase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const a = p.a ?? 2;
  const d = p.d ?? 3;
  const n = p.n ?? 6;

  const ox = 70;
  const oy = h - 60;
  const barW = Math.min(50, (w - 140) / n - 10);

  let totalSum = 0;
  let lastTerm = a;

  for (let i = 0; i < n; i++) {
    const term = a + i * d;
    totalSum += term;
    lastTerm = term;

    const bx = ox + i * (barW + 12);
    const bh = Math.max(10, Math.abs(term) * 8);
    const by = term >= 0 ? oy - bh : oy;

    ctx.fillStyle = 'rgba(0, 98, 255, 0.7)';
    ctx.fillRect(bx, by, barW, bh);
    ctx.strokeStyle = '#0062FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, barW, bh);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${term}`, bx + barW / 2, by - 6);
  }

  onTelem({
    nth: `a_${n} = ${lastTerm}`,
    sum: `S_${n} = ${totalSum}`,
    formula_display: `aₙ = ${a} + (n-1)·${d}`
  });
}

function renderGPGrowth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const a = p.a_gp ?? 2;
  const r = p.r_gp ?? 1.5;
  const n = p.n_gp ?? 5;

  const ox = 80;
  const oy = h - 60;
  const stepX = (w - 160) / (n - 1);

  ctx.beginPath();
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 2.5;

  let lastVal = a;
  for (let i = 0; i < n; i++) {
    const term = a * Math.pow(r, i);
    lastVal = term;
    const px = ox + i * stepX;
    const py = Math.max(40, oy - term * 6);

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#7C3AED';
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.fillText(`${term.toFixed(1)}`, px, py - 10);
  }
  ctx.stroke();

  onTelem({
    last_term: `Term ${n} = ${lastVal.toFixed(2)}`,
    gp_type: r > 1 ? 'Exponential Growth' : r === 1 ? 'Constant' : 'Decay toward Zero'
  });
}

function renderGoldenSpiral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const steps = p.steps ?? 6;
  const cx = w / 2;
  const cy = h / 2;

  const fib = [1, 1, 2, 3, 5, 8, 13, 21];
  const scale = 7;

  ctx.save();
  ctx.translate(cx - 30, cy + 20);

  // Draw Fibonacci tiling and spiral arc
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2;

  let x = 0, y = 0;
  for (let i = 0; i < Math.min(steps, fib.length); i++) {
    const s = fib[i] * scale;
    ctx.strokeRect(x, y, s, s);
    x += s * 0.4;
    y -= s * 0.3;
  }
  ctx.restore();

  const ratio = fib[steps - 1] / fib[steps - 2];
  onTelem({
    sequence: fib.slice(0, steps).join(', '),
    ratio: `φ ≈ ${ratio.toFixed(4)} (Golden Ratio)`
  });
}

/* ==========================================================================
   06. BASIC CALCULUS SIMULATIONS
   ========================================================================== */

function renderSecantTangent(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2 - 30;
  const cy = h - 60;
  const scale = 36;

  const pxVal = p.px ?? 1;
  const dx = p.delta_x ?? 1.5;

  drawAxes(ctx, cx, cy, w, h);

  // Function: f(x) = 0.3 * x^2
  const f = (x: number) => 0.3 * x * x;
  const fPrime = (x: number) => 0.6 * x;

  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  for (let x = -4; x <= 5; x += 0.1) {
    const sx = cx + x * scale;
    const sy = cy - f(x) * scale;
    if (x === -4) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Point P
  const pyVal = f(pxVal);
  const spx = cx + pxVal * scale;
  const spy = cy - pyVal * scale;

  // Point Q (P + dx)
  const qxVal = pxVal + dx;
  const qyVal = f(qxVal);
  const sqx = cx + qxVal * scale;
  const sqy = cy - qyVal * scale;

  // Secant Line through P and Q
  const secantSlope = (qyVal - pyVal) / dx;
  ctx.beginPath();
  ctx.strokeStyle = '#EC4899';
  ctx.lineWidth = 2;
  ctx.moveTo(spx - 3 * scale, spy + 3 * secantSlope * scale);
  ctx.lineTo(sqx + 2 * scale, sqy - 2 * secantSlope * scale);
  ctx.stroke();

  // Tangent Line at P (Exact derivative)
  const tanSlope = fPrime(pxVal);
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.moveTo(spx - 3 * scale, spy + 3 * tanSlope * scale);
  ctx.lineTo(spx + 3 * scale, spy - 3 * tanSlope * scale);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw P and Q
  [spx, spy].forEach(() => {
    ctx.beginPath();
    ctx.arc(spx, spy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0062FF';
    ctx.fill();
  });

  ctx.beginPath();
  ctx.arc(sqx, sqy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#EC4899';
  ctx.fill();

  onTelem({
    secant_slope: secantSlope.toFixed(3),
    tangent_slope: tanSlope.toFixed(3),
    error: Math.abs(secantSlope - tanSlope).toFixed(3)
  });
}

function renderRiemannArea(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = 80;
  const cy = h - 60;
  const scaleX = 85;
  const scaleY = 22;

  const n = p.n_slices ?? 8;
  const b = p.upper_bound ?? 3;
  const a = 0;

  drawAxes(ctx, cx, cy, w, h);

  const f = (x: number) => 0.4 * x * x + 1;
  const dx = (b - a) / n;
  let approxArea = 0;

  // Rectangles
  for (let i = 0; i < n; i++) {
    const xi = a + i * dx;
    const height = f(xi + dx / 2);
    approxArea += height * dx;

    const rx = cx + xi * scaleX;
    const ry = cy - height * scaleY;
    const rw = dx * scaleX;
    const rh = height * scaleY;

    ctx.fillStyle = 'rgba(124, 58, 237, 0.2)';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(rx, ry, rw, rh);
  }

  // Exact curve
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  for (let x = 0; x <= b + 0.5; x += 0.1) {
    const sx = cx + x * scaleX;
    const sy = cy - f(x) * scaleY;
    if (x === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Exact integral: ∫ (0.4 x^2 + 1) dx = [0.4/3 x^3 + x]
  const exactArea = (0.4 / 3) * Math.pow(b, 3) + b;

  onTelem({
    approx_area: approxArea.toFixed(2),
    exact_area: exactArea.toFixed(2),
    accuracy: `${((1 - Math.abs(approxArea - exactArea) / exactArea) * 100).toFixed(1)}%`
  });
}

function renderKinematicDeriv(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const accel = p.accel_rate ?? 1.5;
  const cy = 70;

  // Car moving on track
  const loopT = (t * 0.6) % 5;
  const pos = 0.5 * accel * loopT * loopT;
  const vel = accel * loopT;

  const carX = 60 + pos * 15;

  // Road Track
  ctx.beginPath();
  ctx.moveTo(40, cy + 20);
  ctx.lineTo(w - 40, cy + 20);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Car Box
  ctx.fillStyle = '#0062FF';
  ctx.roundRect(carX - 20, cy - 10, 40, 20, 4);
  ctx.fill();

  // Velocity Arrow on car
  drawArrow(ctx, carX, cy, carX + vel * 6, cy, '#00E5FF', `v=${vel.toFixed(1)}`);

  // Synchronized Mini Graphs below
  ctx.fillStyle = '#64748B';
  ctx.font = '600 11px JetBrains Mono';
  ctx.fillText(`Position s(t) = ½at² = ${pos.toFixed(1)} m`, 60, h - 80);
  ctx.fillText(`Velocity v(t) = ds/dt = ${vel.toFixed(1)} m/s`, 60, h - 50);
  ctx.fillText(`Acceleration a(t) = dv/dt = ${accel.toFixed(1)} m/s²`, 60, h - 20);

  onTelem({
    car_pos: `${pos.toFixed(1)} m`,
    car_vel: `${vel.toFixed(1)} m/s`,
    car_acc: `${accel.toFixed(1)} m/s²`
  });
}

/* ==========================================================================
   07. UNITS & DIMENSIONS SIMULATIONS
   ========================================================================== */

function renderScaleUniverse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const exp = p.scale_exp ?? 0;
  const cx = w / 2;
  const cy = h / 2;

  const objects: Record<number, { name: string; unit: string; r: number; color: string }> = {
    [-9]: { name: 'Atom Diameter', unit: '0.1 Nanometer (10⁻⁹ m)', r: 15, color: '#00E5FF' },
    [-6]: { name: 'Bacteria Cell', unit: '1 Micrometer (10⁻⁶ m)', r: 35, color: '#10B981' },
    [-3]: { name: 'Ant / Water Drop', unit: '1 Millimeter (10⁻³ m)', r: 50, color: '#F59E0B' },
    [0]: { name: 'Human Scale', unit: '1 Meter (10⁰ m)', r: 70, color: '#0062FF' },
    [3]: { name: 'Mountain Peak', unit: '1 Kilometer (10³ m)', r: 90, color: '#7C3AED' },
    [6]: { name: 'Planet Earth', unit: '1,000 Kilometers (10⁶ m)', r: 110, color: '#EC4899' },
    [9]: { name: 'Sun Diameter', unit: '1 Million km (10⁹ m)', r: 130, color: '#F59E0B' },
    [12]: { name: 'Solar System Orbit', unit: '1 Billion km (10¹² m)', r: 150, color: '#0062FF' }
  };

  const closestKey = Object.keys(objects)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - exp) < Math.abs(prev - exp) ? curr : prev));

  const info = objects[closestKey];

  ctx.beginPath();
  ctx.arc(cx, cy, info.r, 0, Math.PI * 2);
  ctx.fillStyle = `${info.color}15`;
  ctx.fill();
  ctx.strokeStyle = info.color;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText(info.name, cx, cy - 10);
  ctx.font = '600 12px JetBrains Mono';
  ctx.fillStyle = info.color;
  ctx.fillText(info.unit, cx, cy + 15);

  onTelem({
    sci_notation: `10^${exp} meters`,
    reference_object: info.name,
    unit_name: info.unit
  });
}

function renderDimensionalChecker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const choice = p.eq_choice ?? 1;
  const cx = w / 2;
  const cy = h / 2;

  const data: Record<number, { name: string; left: string; right: string; valid: string }> = {
    1: { name: 'Velocity: v = u + at', left: '[L][T]⁻¹', right: '[L][T]⁻¹ + [L][T]⁻²', valid: 'YES (Valid)' },
    2: { name: 'Distance: s = ut + ½at²', left: '[L]', right: '[L] + [L]', valid: 'YES (Valid)' },
    3: { name: 'Force: F = m · v²', left: '[M][L][T]⁻²', right: '[M][L]²[T]⁻²', valid: 'NO (Mismatch!)' }
  };

  const cur = data[choice];

  // Visual Balance Scale
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 60);
  ctx.lineTo(cx, cy - 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 120, cy - 30);
  ctx.lineTo(cx + 120, cy - 30);
  ctx.stroke();

  // Left Pan
  ctx.fillStyle = '#0062FF';
  ctx.font = 'bold 13px JetBrains Mono';
  ctx.fillText(cur.left, cx - 120, cy - 50);

  // Right Pan
  ctx.fillStyle = cur.valid.includes('YES') ? '#10B981' : '#EF4444';
  ctx.fillText(cur.right, cx + 120, cy - 50);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 15px JetBrains Mono';
  ctx.fillText(cur.name, cx, cy + 100);

  onTelem({
    left_dim: cur.left,
    right_dim: cur.right,
    is_valid: cur.valid
  });
}

function renderVernierCaliper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  // Clamp distance to 0 - 60 mm
  const rawDist = p.jaw_dist ?? 23.4;
  const distMm = Math.max(0, Math.min(60, Number(rawDist.toFixed(1))));

  // Mathematical Vernier Caliper Calculations:
  // 1 Main Scale Division (MSD) = 1.0 mm
  // 10 Vernier Scale Divisions (VSD) = 9 MSD = 9.0 mm
  // 1 VSD = 0.9 mm
  // Least Count (LC) = 1 MSD - 1 VSD = 0.1 mm (0.01 cm)
  const msr = Math.floor(distMm); // Main scale reading (mm)
  const fraction = distMm - msr; // e.g. 0.4
  const vsr = Math.round(fraction * 10) % 10; // Vernier coinciding division (0 to 9)
  const totalMeasured = (msr + vsr * 0.1).toFixed(1);

  // Geometry layout parameters
  const originX = 145; // Pixel X where Main Scale 0 mm and Fixed Jaw inner face align
  const scale = 7.0; // 7.0 pixels per mm (allows 0 to 65 mm on a 780px wide canvas)
  const beamY = 170; // Top of the main scale beam
  const beamH = 50; // Height of the main scale beam
  const beamBottom = beamY + beamH;
  const jawBottomY = 355; // Bottom tip of external jaws
  const intJawTopY = 118; // Top tip of internal jaws

  const sliderX = originX + distMm * scale; // Position of the Vernier zero mark

  // --------------------------------------------------------------------------
  // 0. Background & Workshop Lighting
  // --------------------------------------------------------------------------
  ctx.save();
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#090D1A');
  bgGrad.addColorStop(0.5, '#0E172A');
  bgGrad.addColorStop(1, '#070B14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle millimeter workbench grid
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // --------------------------------------------------------------------------
  // 1. Depth Probe Rod (Extends out of the right side of the caliper)
  // --------------------------------------------------------------------------
  const rodWidth = 5;
  const rodLength = 40 + distMm * scale;
  const rodX = w - 60;
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(rodX, beamY + beamH / 2 - 2, rodLength, rodWidth);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1;
  ctx.strokeRect(rodX, beamY + beamH / 2 - 2, rodLength, rodWidth);

  // --------------------------------------------------------------------------
  // 2. Fixed Main Scale Beam & Jaws (Stainless Steel Body)
  // --------------------------------------------------------------------------
  // Main Beam
  const beamGrad = ctx.createLinearGradient(0, beamY, 0, beamBottom);
  beamGrad.addColorStop(0, '#F8FAFC');
  beamGrad.addColorStop(0.15, '#E2E8F0');
  beamGrad.addColorStop(0.7, '#CBD5E1');
  beamGrad.addColorStop(1, '#94A3B8');

  ctx.fillStyle = beamGrad;
  ctx.fillRect(originX - 70, beamY, w - originX + 20, beamH);

  // Fixed External Jaw (Left Lower Jaw)
  ctx.beginPath();
  ctx.moveTo(originX - 70, beamY);
  ctx.lineTo(originX, beamY);
  ctx.lineTo(originX, jawBottomY); // Flat vertical inner measuring face
  ctx.lineTo(originX - 12, jawBottomY); // Pointed beveled tip
  ctx.bezierCurveTo(originX - 25, jawBottomY - 40, originX - 55, jawBottomY - 90, originX - 70, beamBottom);
  ctx.closePath();
  ctx.fillStyle = beamGrad;
  ctx.fill();
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fixed Internal Jaw (Left Upper Jaw for measuring internal bores)
  ctx.beginPath();
  ctx.moveTo(originX - 70, beamY);
  ctx.lineTo(originX - 60, intJawTopY + 12);
  ctx.lineTo(originX - 10, intJawTopY);
  ctx.lineTo(originX, intJawTopY); // Outer measuring face
  ctx.lineTo(originX, beamY);
  ctx.closePath();
  ctx.fillStyle = beamGrad;
  ctx.fill();
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Stainless steel border along the beam
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(originX - 70, beamY, w - originX + 20, beamH);

  // --------------------------------------------------------------------------
  // 3. Main Scale Graduations (0 to 65 mm)
  // --------------------------------------------------------------------------
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.2;

  // Scale baseline
  const scaleBaseY = beamY + 34;

  for (let mm = 0; mm <= 65; mm++) {
    const tx = originX + mm * scale;
    if (tx > w - 40) break;

    const isCm = mm % 10 === 0;
    const isHalfCm = mm % 5 === 0 && !isCm;
    const tickLen = isCm ? 18 : isHalfCm ? 12 : 7;

    ctx.beginPath();
    ctx.moveTo(tx, scaleBaseY);
    ctx.lineTo(tx, scaleBaseY - tickLen);
    ctx.stroke();

    if (isCm) {
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${mm / 10}`, tx, scaleBaseY - 21);
    }
  }

  // Label "cm" on the main scale
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'left';
  ctx.fillText('cm', originX + 66 * scale, scaleBaseY - 20);
  ctx.fillText('MAIN SCALE (1 div = 1 mm)', originX + 5, beamY + 12);

  // --------------------------------------------------------------------------
  // 4. Clamped Object (Specimen between the Jaws)
  // --------------------------------------------------------------------------
  if (distMm > 0.05) {
    const objW = distMm * scale;
    const objTop = beamBottom + 18;
    const objH = 85;

    // Realistic Machined Brass Cylinder Specimen
    const objGrad = ctx.createLinearGradient(originX, 0, originX + objW, 0);
    objGrad.addColorStop(0, '#B45309');
    objGrad.addColorStop(0.2, '#F59E0B');
    objGrad.addColorStop(0.5, '#FDE68A');
    objGrad.addColorStop(0.8, '#D97706');
    objGrad.addColorStop(1, '#92400E');

    ctx.save();
    ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = objGrad;
    ctx.fillRect(originX, objTop, objW, objH);
    ctx.restore();

    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(originX, objTop, objW, objH);

    // Specimen specular line and measurement arrow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(originX + objW * 0.45, objTop);
    ctx.lineTo(originX + objW * 0.45, objTop + objH);
    ctx.stroke();

    // Measurement Dimension Callout Line
    const dimY = objTop + objH / 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(originX + 4, dimY);
    ctx.lineTo(originX + objW - 4, dimY);
    ctx.stroke();

    // Left and right arrows
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(originX + 2, dimY);
    ctx.lineTo(originX + 7, dimY - 3);
    ctx.lineTo(originX + 7, dimY + 3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(originX + objW - 2, dimY);
    ctx.lineTo(originX + objW - 7, dimY - 3);
    ctx.lineTo(originX + objW - 7, dimY + 3);
    ctx.fill();

    // Specimen text badge
    if (objW > 45) {
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1E1B4B';
      const labelW = 46;
      ctx.fillRect(originX + objW / 2 - labelW / 2, dimY - 8, labelW, 16);
      ctx.fillStyle = '#00F0FF';
      ctx.fillText(`${distMm}mm`, originX + objW / 2, dimY + 4);
    }
  }

  // --------------------------------------------------------------------------
  // 5. Sliding Vernier Scale & Movable Jaws Assembly
  // --------------------------------------------------------------------------
  const sliderWidth = 115;
  const sliderGrad = ctx.createLinearGradient(0, beamY - 8, 0, beamBottom + 12);
  sliderGrad.addColorStop(0, '#E2E8F0');
  sliderGrad.addColorStop(0.2, '#CBD5E1');
  sliderGrad.addColorStop(0.8, '#94A3B8');
  sliderGrad.addColorStop(1, '#64748B');

  // Slider body that rides on the beam
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = sliderGrad;
  ctx.beginPath();
  // Top lip over beam
  ctx.moveTo(sliderX - 8, beamY - 8);
  ctx.lineTo(sliderX + sliderWidth, beamY - 8);
  ctx.lineTo(sliderX + sliderWidth, beamBottom + 10);
  // Thumb roll knob bump on bottom right
  ctx.arc(sliderX + sliderWidth - 12, beamBottom + 14, 8, 0, Math.PI / 2);
  ctx.lineTo(sliderX, beamBottom + 10);
  // Movable Lower External Jaw
  ctx.lineTo(sliderX, jawBottomY); // Flat vertical left measuring face
  ctx.lineTo(sliderX + 12, jawBottomY);
  ctx.bezierCurveTo(sliderX + 25, jawBottomY - 40, sliderX + 45, jawBottomY - 90, sliderX + 55, beamBottom + 10);
  ctx.lineTo(sliderX - 8, beamBottom + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Movable Upper Internal Jaw
  ctx.beginPath();
  ctx.moveTo(sliderX, beamY - 8);
  ctx.lineTo(sliderX, intJawTopY); // Outer vertical measuring face
  ctx.lineTo(sliderX + 10, intJawTopY);
  ctx.lineTo(sliderX + 40, beamY - 8);
  ctx.closePath();
  ctx.fillStyle = sliderGrad;
  ctx.fill();
  ctx.stroke();

  // Thumbscrew / Locking Screw on Top
  const screwX = sliderX + 45;
  const screwY = beamY - 14;
  ctx.fillStyle = '#64748B';
  ctx.fillRect(screwX - 8, screwY - 6, 16, 7);
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(screwX - 10, screwY - 13, 20, 7);
  // Knurled ridges on screw
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  for (let sx = screwX - 8; sx <= screwX + 8; sx += 3) {
    ctx.beginPath();
    ctx.moveTo(sx, screwY - 13);
    ctx.lineTo(sx, screwY - 6);
    ctx.stroke();
  }

  // Thumb Grip Ridges on Slider Bottom
  const gripX = sliderX + sliderWidth - 22;
  const gripY = beamBottom + 14;
  for (let gx = gripX - 10; gx <= gripX + 8; gx += 3) {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gx, gripY - 4);
    ctx.lineTo(gx, gripY + 4);
    ctx.stroke();
  }

  // Precision Vernier Cutout Window
  const winX = sliderX + 2;
  const winY = beamY + 18;
  const winW = sliderWidth - 14;
  const winH = 34;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fillRect(winX, winY, winW, winH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(winX, winY, winW, winH);

  // --------------------------------------------------------------------------
  // 6. Vernier Scale Markings (10 VSD = 9 MSD)
  // Each VSD = 0.9 mm = 0.9 * scale px (6.3 px)
  // --------------------------------------------------------------------------
  const vsdStepPx = 0.9 * scale;
  const vScaleY = winY;

  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#0F172A';

  for (let v = 0; v <= 10; v++) {
    const vx = sliderX + v * vsdStepPx;
    const isMajor = v === 0 || v === 5 || v === 10;
    const vTickLen = isMajor ? 14 : 9;

    // Vernier tick mark extending down from the window edge
    const isCoinciding = v === vsr;

    ctx.save();
    if (isCoinciding) {
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2.2;
    } else {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.2;
    }

    ctx.beginPath();
    ctx.moveTo(vx, vScaleY);
    ctx.lineTo(vx, vScaleY + vTickLen);
    ctx.stroke();
    ctx.restore();

    // Numbering: 0, 5, 10 (or every 2 divisions: 0, 2, 4, 6, 8, 10)
    if (v % 2 === 0 || v === 5) {
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isCoinciding ? '#EC4899' : '#334155';
      ctx.fillText(`${v}`, vx, vScaleY + 23);
    }
  }

  // Label on Vernier Window
  ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'left';
  ctx.fillText('VERNIER (0.1 mm)', winX + 4, winY + winH - 3);

  // --------------------------------------------------------------------------
  // 7. Coinciding Division Indicator on Main & Vernier Scale
  // --------------------------------------------------------------------------
  const coincX = sliderX + vsr * vsdStepPx;
  ctx.save();
  // Glowing alignment line through both scales
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(coincX, scaleBaseY - 14);
  ctx.lineTo(coincX, vScaleY + 16);
  ctx.stroke();
  ctx.setLineDash([]);

  // Small pointer triangle at coinciding division
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.moveTo(coincX, vScaleY + 26);
  ctx.lineTo(coincX - 4, vScaleY + 32);
  ctx.lineTo(coincX + 4, vScaleY + 32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // --------------------------------------------------------------------------
  // 8. Inspection Zoom Loupe (3.0x Magnifier HUD in Upper Right)
  // --------------------------------------------------------------------------
  const loupeX = w - 245;
  const loupeY = 16;
  const loupeW = 225;
  const loupeH = 115;

  ctx.save();
  // Glass HUD card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(loupeX, loupeY, loupeW, loupeH);
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(loupeX, loupeY, loupeW, loupeH);

  // Title Bar
  ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
  ctx.fillRect(loupeX, loupeY, loupeW, 20);
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('🔍 PRECISION COINCIDENCE LOUPE (3×)', loupeX + 8, loupeY + 14);

  // Loupe Scale Center (centered around coincidence point)
  const loupeZoom = 3.0;
  const loupeCenterX = loupeX + loupeW / 2;
  const loupeMainY = loupeY + 50;
  const loupeVernierY = loupeY + 56;

  // Clip within loupe viewport
  ctx.beginPath();
  ctx.rect(loupeX + 4, loupeY + 24, loupeW - 8, loupeH - 28);
  ctx.clip();

  // Draw magnified Main Scale ticks
  ctx.strokeStyle = '#94A3B8';
  ctx.fillStyle = '#F8FAFC';
  const mainCoincMm = msr + vsr;

  for (let mm = mainCoincMm - 4; mm <= mainCoincMm + 4; mm++) {
    const tickX = loupeCenterX + (mm - mainCoincMm) * (scale * loupeZoom);
    const isCm = mm % 10 === 0;
    const isCoinc = mm === mainCoincMm;

    ctx.strokeStyle = isCoinc ? '#EC4899' : '#94A3B8';
    ctx.lineWidth = isCoinc ? 2.5 : 1.5;

    ctx.beginPath();
    ctx.moveTo(tickX, loupeMainY);
    ctx.lineTo(tickX, loupeMainY - (isCm ? 18 : 12));
    ctx.stroke();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isCoinc ? '#EC4899' : '#CBD5E1';
    ctx.fillText(`${mm}`, tickX, loupeMainY - 21);
  }

  // Draw magnified Vernier Scale ticks
  for (let v = 0; v <= 10; v++) {
    const vOffsetMm = (v - vsr) * 0.9;
    const tickX = loupeCenterX + vOffsetMm * (scale * loupeZoom);
    const isCoinc = v === vsr;

    ctx.strokeStyle = isCoinc ? '#EC4899' : '#38BDF8';
    ctx.lineWidth = isCoinc ? 2.5 : 1.5;

    ctx.beginPath();
    ctx.moveTo(tickX, loupeVernierY);
    ctx.lineTo(tickX, loupeVernierY + (v % 5 === 0 ? 18 : 12));
    ctx.stroke();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isCoinc ? '#EC4899' : '#7DD3FC';
    ctx.fillText(`${v}`, tickX, loupeVernierY + 27);
  }

  // Target Reticle & Coincidence Line
  ctx.strokeStyle = '#EC4899';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(loupeCenterX, loupeMainY - 18);
  ctx.lineTo(loupeCenterX, loupeVernierY + 18);
  ctx.stroke();

  // Status tag in Loupe
  ctx.fillStyle = '#EC4899';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`COINCIDENCE: VSR = ${vsr}`, loupeCenterX, loupeY + loupeH - 6);
  ctx.restore();

  // --------------------------------------------------------------------------
  // 9. Laboratory Spec / Formula HUD (Top Left)
  // --------------------------------------------------------------------------
  const hudX = 20;
  const hudY = 16;
  const hudW = 215;
  const hudH = 115;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(hudX, hudY, hudW, hudH);
  ctx.strokeStyle = 'rgba(0, 98, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(hudX, hudY, hudW, hudH);

  // Header
  ctx.fillStyle = 'rgba(0, 98, 255, 0.15)';
  ctx.fillRect(hudX, hudY, hudW, 20);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('🔬 VERNIER LAB FORMULA', hudX + 8, hudY + 14);

  // Live Formula Breakdown
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('1 MSD = 1.0 mm | 1 VSD = 0.9 mm', hudX + 10, hudY + 36);

  ctx.fillStyle = '#00F0FF';
  ctx.fillText('LC = 1 MSD - 1 VSD = 0.1 mm', hudX + 10, hudY + 52);

  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(`MSR = ${msr} mm`, hudX + 10, hudY + 69);
  ctx.fillText(`VSR = ${vsr} div × 0.1 = ${(vsr * 0.1).toFixed(1)} mm`, hudX + 10, hudY + 84);

  // Highlighted Total Reading
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText(`TOTAL = ${totalMeasured} mm (${(Number(totalMeasured) / 10).toFixed(2)} cm)`, hudX + 10, hudY + 103);
  ctx.restore();

  // --------------------------------------------------------------------------
  // 10. Send High-Precision Telemetry to Parent UI
  // --------------------------------------------------------------------------
  onTelem({
    main_reading: `${msr} mm`,
    vernier_reading: `${vsr} div (${(vsr * 0.1).toFixed(1)} mm)`,
    least_count: '0.1 mm (0.01 cm)',
    total_reading: `${totalMeasured} mm (${(Number(totalMeasured) / 10).toFixed(2)} cm)`
  });
}

/* ==========================================================================
   08. MOTION (KINEMATICS) SIMULATIONS
   ========================================================================== */

function renderKinematicCar(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const u = p.u_init ?? 0;
  const a = p.a_acc ?? 2;

  // Real kinematics cycle
  const maxT = 4.0;
  const loopT = (t * 0.75) % maxT;
  const v = u + a * loopT;
  const s = u * loopT + 0.5 * a * loopT * loopT;

  const roadY = 96;

  // 1. High-Tech Obsidian Proving Ground Track
  const roadGrad = ctx.createLinearGradient(0, roadY - 28, 0, roadY + 28);
  roadGrad.addColorStop(0, '#060B18');
  roadGrad.addColorStop(0.5, '#0E172E');
  roadGrad.addColorStop(1, '#050914');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(16, roadY - 26, w - 32, 52);

  // Glowing Neon Track Curb Edges
  ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.fillRect(16, roadY - 26, w - 32, 2.5);
  ctx.fillRect(16, roadY + 23.5, w - 32, 2.5);

  // Laser Dashed Track Center Guide Line
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 6;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(16, roadY);
  ctx.lineTo(w - 16, roadY);
  ctx.stroke();
  ctx.restore();

  // Metric Distance Telemetry Gate Posts along Track
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  for (let m = 0; m <= 60; m += 10) {
    const mx = 60 + m * 10;
    if (mx < w - 35) {
      // Glow marker
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.fillRect(mx - 0.5, roadY - 24, 1.5, 48);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(mx - 1.5, roadY + 23, 3, 5);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`${m}m`, mx - 8, roadY + 38);
    }
  }

  // 2. High-Tech Aerodynamic Electric Hyper-EV Lab Vehicle
  const carX = Math.min(w - 85, 60 + s * 10);
  const carY = roadY - 7;
  const carW = 76;
  const carH = 22;

  // Neon Underglow Halo on Asphalt
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 18;
  ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(carX, roadY + 10, 36, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Wind-Tunnel Aerodynamic Streamlines trailing the vehicle
  if (v > 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const offY = -12 + i * 9;
      const trailLen = Math.min(65, v * 4.5);
      ctx.beginPath();
      ctx.moveTo(carX - carW / 2 - 4, carY + offY);
      ctx.lineTo(carX - carW / 2 - 4 - trailLen, carY + offY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Aerodynamic Carbon-Composite Body Gradient
  const carGrad = ctx.createLinearGradient(carX - carW / 2, carY - carH, carX + carW / 2, carY);
  carGrad.addColorStop(0, '#00F0FF');
  carGrad.addColorStop(0.35, '#0284C7');
  carGrad.addColorStop(0.85, '#0F172A');
  carGrad.addColorStop(1, '#020617');

  ctx.beginPath();
  ctx.moveTo(carX - carW / 2, carY - 2); // Rear diffuser
  ctx.lineTo(carX - carW / 2 + 5, carY - 10); // Rear spoiler wing
  ctx.lineTo(carX - carW / 2 + 20, carY - 11); // Rear deck
  ctx.lineTo(carX - carW / 2 + 32, carY - carH); // Roof rake
  ctx.lineTo(carX + carW / 2 - 20, carY - carH); // Roof line
  ctx.lineTo(carX + carW / 2 - 6, carY - 8); // Windshield slope
  ctx.lineTo(carX + carW / 2 + 2, carY - 3); // Front nose aero splitter
  ctx.lineTo(carX + carW / 2 - 2, carY); // Front bumper
  ctx.closePath();
  ctx.fillStyle = carGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Polarized Tint Glass Canopy
  ctx.beginPath();
  ctx.moveTo(carX - carW / 2 + 22, carY - 11);
  ctx.lineTo(carX - carW / 2 + 32, carY - carH + 2.5);
  ctx.lineTo(carX + carW / 2 - 22, carY - carH + 2.5);
  ctx.lineTo(carX + carW / 2 - 8, carY - 9);
  ctx.closePath();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Glass Specular Sheen
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(carX - 2, carY - carH + 4);
  ctx.lineTo(carX + 16, carY - 10);
  ctx.stroke();
  ctx.restore();

  // Laser Projector Headlight Beam
  const hlX = carX + carW / 2 + 2;
  const hlY = carY - 3;
  ctx.save();
  const beamGrad = ctx.createLinearGradient(hlX, hlY, hlX + 85, hlY);
  beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
  beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(hlX, hlY - 2);
  ctx.lineTo(hlX + 85, hlY - 12);
  ctx.lineTo(hlX + 85, hlY + 14);
  ctx.lineTo(hlX, hlY + 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Alloy Wheels with Rotating Spokes
  const wheelR = 7.5;
  const wheelDist = s * 10;
  const wheelAngle = wheelDist / wheelR;

  [-20, 20].forEach(ox => {
    const wx = carX + ox;
    const wy = carY + 3;

    // Tire Rubber
    ctx.beginPath();
    ctx.arc(wx, wy, wheelR, 0, Math.PI * 2);
    ctx.fillStyle = '#020617';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cyan Neon Wheel Core
    ctx.beginPath();
    ctx.arc(wx, wy, wheelR - 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0B132B';
    ctx.fill();

    // Rotating Spokes
    ctx.save();
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(wx - Math.cos(wheelAngle) * (wheelR - 3), wy - Math.sin(wheelAngle) * (wheelR - 3));
    ctx.lineTo(wx + Math.cos(wheelAngle) * (wheelR - 3), wy + Math.sin(wheelAngle) * (wheelR - 3));
    ctx.moveTo(wx - Math.sin(wheelAngle) * (wheelR - 3), wy + Math.cos(wheelAngle) * (wheelR - 3));
    ctx.lineTo(wx + Math.sin(wheelAngle) * (wheelR - 3), wy - Math.cos(wheelAngle) * (wheelR - 3));
    ctx.stroke();
    ctx.restore();
  });

  // Dynamic Velocity Vector HUD Ribbon
  if (v > 0) {
    const vArrowLen = Math.min(80, v * 5.2);
    drawArrow(ctx, carX + carW / 2 + 5, carY - 14, carX + carW / 2 + 5 + vArrowLen, carY - 14, '#00F0FF', `v=${v.toFixed(1)} m/s`);
  }

  // 3. Synchronized Dual Cyber Oscilloscope Graphs (s-t and v-t)
  const graphW = 325;
  const graphH = 145;
  const g1X = 40;
  const g2X = w / 2 + 25;
  const gY = 190;

  // Helper for drawing holographic HUD container
  const drawHudCard = (x: number, y: number, gw: number, gh: number, title: string, badgeCol: string) => {
    ctx.save();
    // Glass card background
    ctx.fillStyle = 'rgba(7, 12, 27, 0.88)';
    ctx.beginPath();
    ctx.roundRect(x, y, gw, gh, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Corner brackets [ ]
    ctx.strokeStyle = badgeCol;
    ctx.lineWidth = 1.5;
    const bLen = 8;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2 + bLen);
    ctx.lineTo(x + 2, y + 2);
    ctx.lineTo(x + 2 + bLen, y + 2);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + gw - 2 - bLen, y + 2);
    ctx.lineTo(x + gw - 2, y + 2);
    ctx.lineTo(x + gw - 2, y + 2 + bLen);
    ctx.stroke();

    // Minor oscilloscope grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let gx = x + 30; gx < x + gw - 15; gx += 28) {
      ctx.beginPath();
      ctx.moveTo(gx, y + 15);
      ctx.lineTo(gx, y + gh - 22);
      ctx.stroke();
    }
    for (let gy = y + 20; gy < y + gh - 20; gy += 25) {
      ctx.beginPath();
      ctx.moveTo(x + 30, gy);
      ctx.lineTo(x + gw - 15, gy);
      ctx.stroke();
    }

    // Title
    ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = badgeCol;
    ctx.fillText(title, x + 35, y + 17);
    ctx.restore();
  };

  // --- GRAPH 1: Position-Time s(t) = ut + 0.5 a t^2 ---
  drawHudCard(g1X, gY, graphW, graphH, 's(t) = ut + ½at² [POSITION PARABOLA]', '#00F0FF');

  // Axes
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(g1X + 30, gY + 18);
  ctx.lineTo(g1X + 30, gY + graphH - 22);
  ctx.lineTo(g1X + graphW - 15, gY + graphH - 22);
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText('s(m)', g1X + 4, gY + 28);
  ctx.fillText('t(s)', g1X + graphW - 25, gY + graphH - 8);

  const maxSScale = Math.max(20, u * maxT + 0.5 * Math.abs(a) * maxT * maxT);
  const scaleT1 = (graphW - 55) / maxT;
  const scaleS1 = (graphH - 45) / maxSScale;

  // Luminous s(t) curve
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let stepT = 0; stepT <= maxT; stepT += 0.08) {
    const curPos = Math.max(0, u * stepT + 0.5 * a * stepT * stepT);
    const px = g1X + 30 + stepT * scaleT1;
    const py = gY + graphH - 22 - curPos * scaleS1;
    if (stepT === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  // Current s(t) position indicator beacon
  const curPtX = g1X + 30 + loopT * scaleT1;
  const curPtY = gY + graphH - 22 - s * scaleS1;
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#00F0FF';
  ctx.beginPath();
  ctx.arc(curPtX, curPtY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();

  // --- GRAPH 2: Velocity-Time v(t) = u + at ---
  drawHudCard(g2X, gY, graphW, graphH, 'v(t) = u + at [VELOCITY & AREA = DISPLACEMENT]', '#A855F7');

  // Axes
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(g2X + 30, gY + 18);
  ctx.lineTo(g2X + 30, gY + graphH - 22);
  ctx.lineTo(g2X + graphW - 15, gY + graphH - 22);
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText('v(m/s)', g2X + 2, gY + 28);
  ctx.fillText('t(s)', g2X + graphW - 25, gY + graphH - 8);

  const maxVScale = Math.max(15, u + Math.abs(a) * maxT);
  const scaleT2 = (graphW - 55) / maxT;
  const scaleV2 = (graphH - 45) / maxVScale;

  // Luminous Integral Area under v(t) representing displacement s = ∫ v dt
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(g2X + 30, gY + graphH - 22);
  for (let st = 0; st <= loopT; st += 0.08) {
    const curVel = u + a * st;
    const px = g2X + 30 + st * scaleT2;
    const py = gY + graphH - 22 - curVel * scaleV2;
    ctx.lineTo(px, py);
  }
  const curVtX = g2X + 30 + loopT * scaleT2;
  const curVtY = gY + graphH - 22 - v * scaleV2;
  ctx.lineTo(curVtX, gY + graphH - 22);
  ctx.closePath();
  const areaGrad = ctx.createLinearGradient(0, gY, 0, gY + graphH);
  areaGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
  areaGrad.addColorStop(1, 'rgba(0, 240, 255, 0.08)');
  ctx.fillStyle = areaGrad;
  ctx.fill();
  ctx.restore();

  // v(t) laser line
  ctx.save();
  ctx.shadowColor = '#A855F7';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let stepT = 0; stepT <= maxT; stepT += 0.08) {
    const curVel = u + a * stepT;
    const px = g2X + 30 + stepT * scaleT2;
    const py = gY + graphH - 22 - curVel * scaleV2;
    if (stepT === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();

  // Current v(t) cursor beacon
  ctx.save();
  ctx.shadowColor = '#A855F7';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#A855F7';
  ctx.beginPath();
  ctx.arc(curVtX, curVtY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();

  // Area Label
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText('Area = ∫ v dt = s', g2X + 45, gY + graphH - 35);

  onTelem({
    cur_vel: `${v.toFixed(1)} m/s (${(v * 3.6).toFixed(0)} km/h)`,
    cur_pos: `${s.toFixed(1)} m`,
    elapsed_t: `${loopT.toFixed(2)} s`
  });
}

function renderFreeFall(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const H = p.drop_height ?? 45;
  const g = 9.8;
  const totalFallTime = Math.sqrt((2 * H) / g);
  const vImpact = Math.sqrt(2 * g * H);

  const cycleTime = totalFallTime + 1.2;
  const fallT = t % cycleTime;
  const curT = Math.min(fallT, totalFallTime);
  const curDistanceFallen = 0.5 * g * curT * curT;
  const curHeightAboveGround = Math.max(0, H - curDistanceFallen);
  const curSpeed = g * curT;

  const groundY = h - 45;
  const towerTopY = 50;
  const towerH = groundY - towerTopY;
  const towerX = w / 2 - 95;
  const ballX = towerX + 55;

  // 1. High-Tech Vacuum Drop Chamber (Titanium & Glass Column)
  // Transparent vacuum column glass background
  const tubeGrad = ctx.createLinearGradient(towerX, 0, towerX + 110, 0);
  tubeGrad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
  tubeGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.02)');
  tubeGrad.addColorStop(1, 'rgba(0, 240, 255, 0.08)');
  ctx.fillStyle = tubeGrad;
  ctx.fillRect(towerX, towerTopY, 110, towerH);

  // Column structural alloy uprights
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(towerX, groundY);
  ctx.lineTo(towerX, towerTopY);
  ctx.lineTo(towerX + 26, towerTopY);
  ctx.lineTo(towerX + 26, groundY);
  ctx.stroke();

  // Cross-bracing laser lattice
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let ty = groundY; ty > towerTopY; ty -= 24) {
    ctx.beginPath();
    ctx.moveTo(towerX, ty);
    ctx.lineTo(towerX + 26, ty - 24);
    ctx.moveTo(towerX + 26, ty);
    ctx.lineTo(towerX, ty - 24);
    ctx.stroke();
  }

  // Laser Height Scale (0m to H meters)
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  const numMarks = 5;
  for (let i = 0; i <= numMarks; i++) {
    const frac = i / numMarks;
    const markH = (H * frac).toFixed(0);
    const my = groundY - frac * towerH;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.fillRect(towerX - 8, my, 8, 1.5);
    ctx.fillStyle = '#00F0FF';
    ctx.fillText(`${markH}m`, towerX - 38, my + 3.5);
  }

  // Ground Impact Electromagnetic Cushion Pad
  ctx.fillStyle = '#091124';
  ctx.fillRect(towerX - 45, groundY, 210, 14);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(towerX - 45, groundY, 210, 14);

  // Active emerald sensor pad
  ctx.save();
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#10B981';
  ctx.fillRect(ballX - 25, groundY - 3, 50, 4);
  ctx.restore();

  // Electromagnet Release Gantry at Tower Top
  ctx.fillStyle = '#0B132B';
  ctx.fillRect(towerX, towerTopY - 12, 70, 12);
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(towerX, towerTopY - 12, 70, 12);
  ctx.fillStyle = '#F43F5E';
  ctx.fillRect(ballX - 8, towerTopY, 16, 5);

  // 2. Galileo Strobe Ghost Markers (showing quadratic distance ratio 1 : 3 : 5 : 7 ...)
  const strobeInterval = 0.25;
  for (let st = strobeInterval; st <= curT; st += strobeInterval) {
    const sFall = 0.5 * g * st * st;
    const sy = towerTopY + (sFall / H) * towerH;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(ballX, sy, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText(`${st.toFixed(2)}s`, ballX + 16, sy + 3);
    ctx.restore();
  }

  // 3. Falling Quantum Sphere with Specular Shading & Particle Wake
  const ballY = towerTopY + (curDistanceFallen / H) * towerH;

  // Trailing Energy Spark Particles
  if (curSpeed > 2) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(ballX + (Math.sin(t * 15 + i) * 3), ballY - i * 9, 3 - i * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Metallic Chrome / Neon Cyan Core Sphere
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 14;
  const ballGrad = ctx.createRadialGradient(ballX - 3, ballY - 3, 2, ballX, ballY, 12);
  ballGrad.addColorStop(0, '#FFFFFF');
  ballGrad.addColorStop(0.3, '#00F0FF');
  ballGrad.addColorStop(0.7, '#0284C7');
  ballGrad.addColorStop(1, '#051329');

  ctx.beginPath();
  ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
  ctx.fillStyle = ballGrad;
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Gravity vector arrow (pointing down)
  drawArrow(ctx, ballX + 24, ballY, ballX + 24, ballY + 38, '#F43F5E', 'g=9.8 m/s²');

  // Velocity vector arrow (length proportional to current speed)
  if (curSpeed > 0) {
    const vLen = Math.min(65, curSpeed * 1.5);
    drawArrow(ctx, ballX - 24, ballY, ballX - 24, ballY + vLen, '#00F0FF', `v=${curSpeed.toFixed(1)} m/s`);
  }

  // 4. Cyber Holographic Telemetry HUD Card on Right
  const gaugeX = w / 2 + 85;
  const gaugeY = 55;
  const gaugeW = 245;
  const gaugeH = 245;

  ctx.save();
  ctx.fillStyle = 'rgba(7, 12, 27, 0.9)';
  ctx.beginPath();
  ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // HUD corner brackets
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.6;
  const bSize = 10;
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(gaugeX + 3, gaugeY + 3 + bSize);
  ctx.lineTo(gaugeX + 3, gaugeY + 3);
  ctx.lineTo(gaugeX + 3 + bSize, gaugeY + 3);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(gaugeX + gaugeW - 3 - bSize, gaugeY + 3);
  ctx.lineTo(gaugeX + gaugeW - 3, gaugeY + 3);
  ctx.lineTo(gaugeX + gaugeW - 3, gaugeY + 3 + bSize);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(gaugeX + 3, gaugeY + gaugeH - 3 - bSize);
  ctx.lineTo(gaugeX + 3, gaugeY + gaugeH - 3);
  ctx.lineTo(gaugeX + 3 + bSize, gaugeY + gaugeH - 3);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(gaugeX + gaugeW - 3 - bSize, gaugeY + gaugeH - 3);
  ctx.lineTo(gaugeX + gaugeW - 3, gaugeY + gaugeH - 3);
  ctx.lineTo(gaugeX + gaugeW - 3, gaugeY + gaugeH - 3 - bSize);
  ctx.stroke();

  // Telemetry Header
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText('FREE FALL TELEMETRY HUD', gaugeX + 16, gaugeY + 26);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = '8.5px "JetBrains Mono", monospace';
  ctx.fillText('GRAVITATIONAL ACCELERATION SENSOR', gaugeX + 16, gaugeY + 40);

  const drawTelemRow = (lbl: string, val: string, col: string, yPos: number) => {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '9.5px "JetBrains Mono", monospace';
    ctx.fillText(lbl, gaugeX + 16, yPos);
    ctx.save();
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 6;
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText(val, gaugeX + 16, yPos + 18);
    ctx.restore();
  };

  drawTelemRow('Height Above Ground (h)', `${curHeightAboveGround.toFixed(1)} m`, '#00F0FF', gaugeY + 68);
  drawTelemRow('Current Fall Speed (v = gt)', `${curSpeed.toFixed(1)} m/s (${(curSpeed * 3.6).toFixed(0)} km/h)`, '#38BDF8', gaugeY + 112);
  drawTelemRow('Elapsed Time (t)', `${curT.toFixed(2)} s / ${totalFallTime.toFixed(2)} s`, '#A855F7', gaugeY + 156);
  drawTelemRow('Impact Speed (v² = 2gh)', `${vImpact.toFixed(1)} m/s (${(vImpact * 3.6).toFixed(0)} km/h)`, '#10B981', gaugeY + 200);

  ctx.restore();

  onTelem({
    fall_time: `${totalFallTime.toFixed(2)} s`,
    impact_vel: `${vImpact.toFixed(1)} m/s (${(vImpact * 3.6).toFixed(0)} km/h)`
  });
}

// Detailed helper for realistic aerodynamic MagLev railway track
function drawRealisticRailwayTrack(
  ctx: CanvasRenderingContext2D,
  y: number,
  w: number,
  trackOffset: number,
  trackLabel: string
) {
  // 1. Dark obsidian ballast track bed
  const ballastTop = y - 16;
  const ballastBottom = y + 26;
  const grad = ctx.createLinearGradient(0, ballastTop, 0, ballastBottom);
  grad.addColorStop(0, '#060B18');
  grad.addColorStop(0.3, '#0E172E');
  grad.addColorStop(0.7, '#080D1A');
  grad.addColorStop(1, '#030712');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(15, ballastTop, w - 30, ballastBottom - ballastTop, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Subtle ballast speckles
  ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
  for (let gx = 25; gx < w - 25; gx += 20) {
    ctx.fillRect(gx + ((gx * 7) % 11), y - 10 + ((gx * 3) % 16), 2, 2);
  }

  // 2. High-Tech Ties / Stator Coils spaced every 22px
  const sleeperSpacing = 22;
  const sleeperWidth = 9;
  const sleeperHeight = 32;
  const sleeperY = y - 11;
  const startOffset = ((trackOffset % sleeperSpacing) + sleeperSpacing) % sleeperSpacing;

  for (let sx = 20 - sleeperSpacing + startOffset; sx < w - 20; sx += sleeperSpacing) {
    if (sx < 20 || sx > w - 32) continue;
    // Tie body
    const tieGrad = ctx.createLinearGradient(sx, sleeperY, sx + sleeperWidth, sleeperY);
    tieGrad.addColorStop(0, '#0F172A');
    tieGrad.addColorStop(0.5, '#1E293B');
    tieGrad.addColorStop(1, '#0B132B');
    ctx.fillStyle = tieGrad;
    ctx.fillRect(sx, sleeperY, sleeperWidth, sleeperHeight);

    // Fastening clips with neon accent
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.fillRect(sx + 1.5, y - 5, 6, 2.5);
    ctx.fillRect(sx + 1.5, y + 12, 6, 2.5);
  }

  // 3. Parallel Laser Steel Running Rails
  const drawRail = (ry: number) => {
    // Glowing laser rail body
    ctx.save();
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 6;
    const railGrad = ctx.createLinearGradient(0, ry - 3, 0, ry + 3);
    railGrad.addColorStop(0, '#0284C7');
    railGrad.addColorStop(0.5, '#00F0FF'); // Specular highlight
    railGrad.addColorStop(1, '#0369A1');
    ctx.fillStyle = railGrad;
    ctx.fillRect(20, ry - 2, w - 40, 4);
    ctx.restore();
  };

  drawRail(y - 3);  // Upper rail
  drawRail(y + 13); // Lower rail

  // Overhead catenary guide line
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y - 36);
  ctx.lineTo(w - 20, y - 36);
  ctx.stroke();

  // Track label HUD badge on left
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText(trackLabel, 28, y - 22);
}

// Detailed helper for realistic aerodynamic passenger train
function drawDetailedTrain(
  ctx: CanvasRenderingContext2D,
  x: number, // Head/Locomotive front x coordinate (train faces right)
  y: number, // Rail reference center y
  options: {
    name: string;
    speedKmH: number;
    primaryColor: string; // e.g. '#0062FF' (Train A) or '#7C3AED' (Train B)
    stripeColor: string;  // e.g. '#00E5FF' or '#F59E0B'
    isRider?: boolean;
    distRolled: number;
  }
) {
  const totalLength = 195;
  const coachLen = 85;
  const bellowLen = 6;
  const locoLen = 104;
  const trainH = 34;
  const trainBottom = y + 10;
  const trainTop = trainBottom - trainH;

  const rearCoachX = x - totalLength;
  const locoX = rearCoachX + coachLen + bellowLen;

  // 1. Bogie Trucks & Steel Wheels
  const drawBogie = (bx: number) => {
    // Bogie frame
    ctx.fillStyle = '#1E293B';
    ctx.roundRect(bx - 16, trainBottom - 6, 32, 7, 2);
    ctx.fill();

    // Coil spring
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - 3, trainBottom - 6);
    ctx.lineTo(bx + 3, trainBottom - 1);
    ctx.stroke();

    // Two dual wheels with rotating spokes
    const wheelR = 6;
    const wheelY = trainBottom + 1;
    const wheelAngle = options.distRolled / wheelR;

    [-10, 10].forEach(ox => {
      const wx = bx + ox;
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(wheelAngle) * (wheelR - 1), wheelY - Math.sin(wheelAngle) * (wheelR - 1));
      ctx.lineTo(wx + Math.cos(wheelAngle) * (wheelR - 1), wheelY + Math.sin(wheelAngle) * (wheelR - 1));
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(wx, wheelY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();
    });
  };

  drawBogie(rearCoachX + 18);
  drawBogie(rearCoachX + coachLen - 18);
  drawBogie(locoX + 24);
  drawBogie(locoX + locoLen - 32);

  // 2. Flexible Gangway Bellow
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(rearCoachX + coachLen, trainTop + 4, bellowLen, trainH - 6);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  for (let by = trainTop + 6; by < trainBottom - 4; by += 4) {
    ctx.beginPath();
    ctx.moveTo(rearCoachX + coachLen, by);
    ctx.lineTo(rearCoachX + coachLen + bellowLen, by);
    ctx.stroke();
  }

  // 3. Passenger Coach Body
  const coachGrad = ctx.createLinearGradient(0, trainTop, 0, trainBottom);
  coachGrad.addColorStop(0, '#FFFFFF');
  coachGrad.addColorStop(0.25, '#F8FAFC');
  coachGrad.addColorStop(0.7, '#E2E8F0');
  coachGrad.addColorStop(1, '#94A3B8');

  ctx.fillStyle = coachGrad;
  ctx.beginPath();
  ctx.roundRect(rearCoachX, trainTop, coachLen, trainH - 2, [4, 2, 2, 4]);
  ctx.fill();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Livery Stripe on Coach
  ctx.fillStyle = options.primaryColor;
  ctx.fillRect(rearCoachX, trainTop + 14, coachLen, 5);
  ctx.fillStyle = options.stripeColor;
  ctx.fillRect(rearCoachX, trainTop + 19, coachLen, 2);

  // Coach Windows with glowing warm interior and silhouettes
  for (let wx = rearCoachX + 10; wx < rearCoachX + coachLen - 10; wx += 17) {
    ctx.fillStyle = '#0F172A';
    ctx.roundRect(wx, trainTop + 6, 12, 7, 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.roundRect(wx + 1, trainTop + 7, 10, 5, 1);
    ctx.fill();

    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.beginPath();
    ctx.arc(wx + 6, trainTop + 10, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Roof AC pod
  ctx.fillStyle = '#94A3B8';
  ctx.roundRect(rearCoachX + 24, trainTop - 4, 38, 4, 2);
  ctx.fill();

  // 4. Locomotive Power Car (Aerodynamic Bullet Nose)
  const locoGrad = ctx.createLinearGradient(0, trainTop, 0, trainBottom);
  locoGrad.addColorStop(0, '#FFFFFF');
  locoGrad.addColorStop(0.2, '#F8FAFC');
  locoGrad.addColorStop(0.7, '#E2E8F0');
  locoGrad.addColorStop(1, '#94A3B8');

  ctx.beginPath();
  ctx.moveTo(locoX, trainTop);
  ctx.lineTo(locoX + locoLen - 35, trainTop);
  ctx.bezierCurveTo(
    locoX + locoLen - 15, trainTop + 2,
    locoX + locoLen - 4, trainTop + 16,
    locoX + locoLen, trainTop + 22
  );
  ctx.lineTo(locoX + locoLen - 4, trainBottom - 2);
  ctx.lineTo(locoX, trainBottom - 2);
  ctx.closePath();
  ctx.fillStyle = locoGrad;
  ctx.fill();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Swept aerodynamic livery stripe
  ctx.fillStyle = options.primaryColor;
  ctx.beginPath();
  ctx.moveTo(locoX, trainTop + 14);
  ctx.lineTo(locoX + locoLen - 30, trainTop + 14);
  ctx.bezierCurveTo(
    locoX + locoLen - 16, trainTop + 16,
    locoX + locoLen - 6, trainTop + 22,
    locoX + locoLen - 2, trainTop + 24
  );
  ctx.lineTo(locoX + locoLen - 4, trainTop + 29);
  ctx.lineTo(locoX, trainTop + 20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = options.stripeColor;
  ctx.fillRect(locoX, trainTop + 20, locoLen - 25, 2);

  // Aerodynamic Cockpit Windshield
  ctx.beginPath();
  ctx.moveTo(locoX + locoLen - 36, trainTop + 4);
  ctx.lineTo(locoX + locoLen - 18, trainTop + 8);
  ctx.lineTo(locoX + locoLen - 14, trainTop + 17);
  ctx.lineTo(locoX + locoLen - 32, trainTop + 17);
  ctx.closePath();
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(locoX + locoLen - 34, trainTop + 6);
  ctx.lineTo(locoX + locoLen - 22, trainTop + 9);
  ctx.stroke();

  // Locomotive Windows
  for (let wx = locoX + 12; wx < locoX + locoLen - 45; wx += 17) {
    ctx.fillStyle = '#0F172A';
    ctx.roundRect(wx, trainTop + 6, 12, 7, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.roundRect(wx + 1, trainTop + 7, 10, 5, 1);
    ctx.fill();
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.beginPath();
    ctx.arc(wx + 6, trainTop + 10, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Aerodynamic Pantograph reaching catenary wire
  const pantoBaseX = locoX + 35;
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pantoBaseX, trainTop);
  ctx.lineTo(pantoBaseX + 6, trainTop - 12);
  ctx.lineTo(pantoBaseX + 18, trainTop - 12);
  ctx.lineTo(pantoBaseX + 12, trainTop);
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(pantoBaseX + 4, trainTop - 14, 16, 2);

  // High-Intensity Headlights
  const hlX = locoX + locoLen - 3;
  const hlY = trainTop + 24;

  const coneGrad = ctx.createLinearGradient(hlX, hlY, hlX + 90, hlY);
  coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
  coneGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
  coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(hlX, hlY - 2);
  ctx.lineTo(hlX + 90, hlY - 14);
  ctx.lineTo(hlX + 90, hlY + 16);
  ctx.lineTo(hlX, hlY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(hlX, hlY - 1, 2.5, 0, Math.PI * 2);
  ctx.arc(hlX, hlY + 3, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FEF08A';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Train Label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 9px JetBrains Mono';
  ctx.fillText(options.name, locoX + 12, trainTop + 18);

  // Passenger Rider Indicator
  if (options.isRider) {
    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.fillText('YOU ARE HERE', rearCoachX + 14, trainTop - 8);
    ctx.beginPath();
    ctx.arc(rearCoachX + 8, trainTop - 11, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
  }

  // Velocity Vector Arrow on top
  if (options.speedKmH !== 0) {
    const absSpd = Math.abs(options.speedKmH);
    const arrowDir = options.speedKmH > 0 ? 1 : -1;
    const arrowLen = Math.min(65, absSpd * 0.9) * arrowDir;
    drawArrow(
      ctx,
      locoX + locoLen - 10,
      trainTop - 6,
      locoX + locoLen - 10 + arrowLen,
      trainTop - 6,
      options.stripeColor,
      `${options.speedKmH > 0 ? '+' : ''}${options.speedKmH} km/h`
    );
  }
}

function renderRelativeMotion(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const vA = p.vA ?? 30; // km/h
  const vB = p.vB ?? 45; // km/h
  const frame = Math.round(p.frame ?? 0); // 0 = Ground, 1 = Train A Rider

  const yA = 115; // Track A
  const yB = 250; // Track B

  // Conversions: 1 km/h = (1000/3600) m/s = 5/18 m/s
  const vA_ms = vA * (5 / 18);
  const vB_ms = vB * (5 / 18);
  const vRel_kmh = vB - vA;
  const vRel_ms = vRel_kmh * (5 / 18);

  // Virtual distance rolled in simulation units
  // In Ground Frame: track is fixed, trains move at vA and vB
  // In Train A Frame: Train A is fixed at x=260, ground scrolls at -vA, Train B moves at vB - vA!
  const wrapLength = w + 260;

  let trainAx: number;
  let trainBx: number;
  let trackOffsetA: number;
  let trackOffsetB: number;
  let distRolledA: number;
  let distRolledB: number;

  if (frame === 0) {
    // Ground Observer Frame: Stationary ground
    trackOffsetA = 0;
    trackOffsetB = 0;
    distRolledA = t * vA * 4.5;
    distRolledB = t * vB * 4.5;

    trainAx = ((distRolledA % wrapLength) + wrapLength) % wrapLength;
    trainBx = ((distRolledB % wrapLength) + wrapLength) % wrapLength;
  } else {
    // Train A Passenger Frame: Camera locks to Train A!
    // Train A sits stationary at fixed x position:
    trainAx = 260;
    // Track scrolls backward at speed -vA:
    const scrollGround = -t * vA * 4.5;
    trackOffsetA = scrollGround;
    trackOffsetB = scrollGround;
    distRolledA = 0; // wheels appear stationary or relative to frame

    // Train B travels at relative speed (vB - vA):
    const relDistance = t * vRel_kmh * 4.5;
    trainBx = (((260 + relDistance) % wrapLength) + wrapLength) % wrapLength;
    distRolledB = relDistance;
  }

  // 1. Draw Overhead Catenary Support Masts along the tracks
  const mastX1 = 120;
  const mastX2 = w - 160;
  [mastX1, mastX2].forEach(mx => {
    ctx.fillStyle = '#64748B';
    ctx.fillRect(mx, 40, 7, yB - 20); // Vertical steel mast
    // Horizontal cantilever arms
    ctx.fillRect(mx - 8, yA - 38, 35, 3);
    ctx.fillRect(mx - 8, yB - 38, 35, 3);
    // Insulators
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(mx + 18, yA - 42, 5, 8);
    ctx.fillRect(mx + 18, yB - 42, 5, 8);
  });

  // 2. Draw Realistic Railway Tracks (Track A & Track B)
  drawRealisticRailwayTrack(ctx, yA, w, trackOffsetA, 'TRACK 1 (NORTHBOUND)');
  drawRealisticRailwayTrack(ctx, yB, w, trackOffsetB, 'TRACK 2 (SOUTHBOUND / PARALLEL)');

  // 3. Railway Signal Post between tracks
  const sigX = w - 60;
  ctx.fillStyle = '#334155';
  ctx.fillRect(sigX, yA + 26, 4, yB - yA - 42); // Post
  ctx.fillStyle = '#0F172A';
  ctx.roundRect(sigX - 6, yA + 35, 16, 30, 4); // Housing
  ctx.fill();
  // Green signal LED aspect
  ctx.beginPath();
  ctx.arc(sigX + 2, yA + 50, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#10B981';
  ctx.fill();
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 4. Draw Detailed Passenger Trains
  // Train A: Silver & Electric Blue Express
  drawDetailedTrain(ctx, trainAx, yA, {
    name: 'TRAIN A (EXPRESS)',
    speedKmH: frame === 0 ? vA : 0,
    primaryColor: '#0062FF',
    stripeColor: '#00E5FF',
    isRider: frame === 1,
    distRolled: distRolledA
  });

  // Train B: Pearl White & Royal Violet Express
  drawDetailedTrain(ctx, trainBx, yB, {
    name: 'TRAIN B (BULLET)',
    speedKmH: frame === 0 ? vB : vRel_kmh,
    primaryColor: '#7C3AED',
    stripeColor: '#F59E0B',
    isRider: false,
    distRolled: distRolledB
  });

  // 5. Central Relativity HUD Banner (Top of Canvas)
  ctx.save();
  ctx.fillStyle = 'rgba(7, 12, 27, 0.92)';
  ctx.beginPath();
  ctx.roundRect(w / 2 - 235, 8, 470, 42, 8);
  ctx.fill();
  ctx.strokeStyle = frame === 0 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Corner HUD brackets
  ctx.strokeStyle = frame === 0 ? '#00F0FF' : '#F43F5E';
  ctx.lineWidth = 1.5;
  const rbLen = 6;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 233, 10 + rbLen);
  ctx.lineTo(w / 2 - 233, 10);
  ctx.lineTo(w / 2 - 233 + rbLen, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w / 2 + 233 - rbLen, 10);
  ctx.lineTo(w / 2 + 233, 10);
  ctx.lineTo(w / 2 + 233, 10 + rbLen);
  ctx.stroke();

  ctx.fillStyle = frame === 0 ? '#00F0FF' : '#F43F5E';
  ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';

  if (frame === 0) {
    ctx.fillText('OBSERVER: Ground Frame // Both trains moving relative to stationary Earth', w / 2, 24);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(`vA = ${vA} km/h (${vA_ms.toFixed(1)} m/s)  |  vB = ${vB} km/h (${vB_ms.toFixed(1)} m/s)  |  v(B/A) = ${vRel_kmh >= 0 ? '+' : ''}${vRel_kmh} km/h`, w / 2, 38);
  } else {
    ctx.fillText('OBSERVER: Inside Train A // Inertial Moving Reference Frame', w / 2, 24);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '9px "JetBrains Mono", monospace';
    if (vRel_kmh === 0) {
      ctx.fillText('vA = 0 km/h (In your frame) | Train B appears COMPLETELY FROZEN outside!', w / 2, 38);
    } else if (vRel_kmh > 0) {
      ctx.fillText(`Train A stationary | Train B slowly overtaking at +${vRel_kmh} km/h (+${vRel_ms.toFixed(1)} m/s)`, w / 2, 38);
    } else {
      ctx.fillText(`Train A stationary | Train B appears to drift BACKWARDS at ${Math.abs(vRel_kmh)} km/h`, w / 2, 38);
    }
  }
  ctx.textAlign = 'left';
  ctx.restore();

  // Motion perception interpretation
  let perceptionText = '';
  if (frame === 0) {
    perceptionText = `Both moving: Train B is ${vRel_kmh > 0 ? 'faster' : vRel_kmh < 0 ? 'slower' : 'matching speed'}`;
  } else {
    if (vRel_kmh === 0) perceptionText = 'Train B looks FROZEN in place outside your window!';
    else if (vRel_kmh > 0) perceptionText = `Train B is slowly overtaking you at +${vRel_kmh} km/h`;
    else perceptionText = `Train B appears to move BACKWARD at ${Math.abs(vRel_kmh)} km/h`;
  }

  onTelem({
    v_rel: `${vRel_kmh >= 0 ? '+' : ''}${vRel_kmh} km/h`,
    v_ms: `${vRel_ms >= 0 ? '+' : ''}${vRel_ms.toFixed(2)} m/s`,
    view_mode: frame === 0 ? 'Ground Observer (Stationary Track)' : 'Train A Rider (Moving Frame)',
    perception: perceptionText
  });
}

/* ==========================================================================
   09. NEWTON'S LAWS SIMULATIONS
   ========================================================================== */

function renderInertiaFriction(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const mu = p.friction_coeff ?? 0.1;
  const force = p.push_force ?? 15;
  const cy = h / 2 + 10;

  // 1. High-Tech Precision Linear Test Bench
  const benchY = cy + 24;
  const benchGrad = ctx.createLinearGradient(0, benchY, 0, benchY + 30);
  benchGrad.addColorStop(0, '#0F172A');
  benchGrad.addColorStop(0.5, '#1E293B');
  benchGrad.addColorStop(1, '#0B132B');
  ctx.fillStyle = benchGrad;
  ctx.beginPath();
  ctx.roundRect(30, benchY, w - 60, 24, 4);
  ctx.fill();
  ctx.strokeStyle = mu === 0 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Metric Laser Calibration Ticks
  ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
  for (let mx = 50; mx < w - 50; mx += 35) {
    ctx.fillRect(mx, benchY, 1.5, 4);
    ctx.fillText(`${((mx - 50) / 10).toFixed(0)}`, mx - 3, benchY + 14);
  }

  // Deceleration a = -mu * g
  const v0 = force * 0.42;
  const a = -mu * 9.8;
  const stopTime = mu > 0 ? v0 / (mu * 9.8) : 999;
  const curT = mu === 0 ? t % 8 : Math.min(t % (stopTime + 1.2), stopTime);
  const s = mu === 0 ? v0 * curT : v0 * curT + 0.5 * a * curT * curT;
  const curV = Math.max(0, v0 + a * curT);
  const px = Math.min(w - 75, 75 + s * 14);

  // Dynamic Friction Heat Sparks when mu > 0 and moving
  if (mu > 0 && curV > 0.5) {
    ctx.save();
    ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
    for (let i = 0; i < 4; i++) {
      const sx = px - 16 - Math.random() * 20;
      const sy = benchY - 1 - Math.random() * 5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. High-Tech Precision Hover Puck / Mass Core
  ctx.save();
  // Under-puck glow
  ctx.shadowColor = mu === 0 ? '#00F0FF' : '#F59E0B';
  ctx.shadowBlur = mu === 0 ? 16 : 8;
  const puckGrad = ctx.createRadialGradient(px - 4, cy - 4, 3, px, cy, 18);
  puckGrad.addColorStop(0, '#FFFFFF');
  puckGrad.addColorStop(0.3, mu === 0 ? '#00F0FF' : '#38BDF8');
  puckGrad.addColorStop(0.8, '#0369A1');
  puckGrad.addColorStop(1, '#082F49');
  ctx.fillStyle = puckGrad;
  ctx.beginPath();
  ctx.arc(px, cy, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Quantum core ring
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(px, cy, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 3. Force & Velocity Vector HUD Arrows
  if (curV > 0) {
    drawArrow(ctx, px + 18, cy, px + 18 + Math.min(65, curV * 5), cy, '#00F0FF', `v=${curV.toFixed(1)} m/s`);
  }

  if (mu > 0 && curT < stopTime) {
    const fFric = mu * 9.8;
    drawArrow(ctx, px - 18, cy, px - 18 - Math.min(55, fFric * 6), cy, '#F43F5E', `f_k=${fFric.toFixed(1)} N`);
  }

  // Normal and Gravity vectors
  drawArrow(ctx, px, cy - 18, px, cy - 46, '#10B981', 'N');
  drawArrow(ctx, px, cy + 18, px, cy + 46, '#FBBF24', 'mg');

  // Surface status badge
  ctx.fillStyle = mu === 0 ? '#00F0FF' : '#94A3B8';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText(mu === 0 ? '✦ ZERO FRICTION (SUPERCONDUCTING AIR TRACK)' : `FRICTION SURFACE (μ = ${mu.toFixed(2)})`, 40, cy - 50);

  onTelem({
    stop_distance: mu === 0 ? 'Infinite (Inertia in Space)' : `${s.toFixed(1)} m`,
    f_fric: mu === 0 ? '0 N' : `${(mu * 9.8).toFixed(1)} N`,
    state: curT >= stopTime ? 'Stopped' : 'In Motion'
  });
}

function renderFEqualsMA(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const F = p.force_val ?? 10;
  const m = p.cart_mass ?? 2;
  const a = F / m;

  const cy = h / 2 + 15;
  const loopT = (t * 0.6) % 4;
  const pos = 0.5 * a * loopT * loopT;
  const cartX = Math.min(w - 95, 75 + pos * 12);
  const curV = a * loopT;

  // 1. Heavy Precision Laboratory Dynamics Bench
  const benchY = cy + 22;
  ctx.fillStyle = '#0B132B';
  ctx.beginPath();
  ctx.roundRect(35, benchY, w - 70, 20, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Calibration scale
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  for (let sx = 45; sx < w - 45; sx += 25) {
    ctx.fillRect(sx, benchY, 1, 3);
  }

  // 2. High-Tech Carbon Composite Dynamics Cart
  const cartW = 74;
  const cartH = 30;
  const cartTop = cy - 10;

  // Cart Chassis
  const cartGrad = ctx.createLinearGradient(cartX - cartW / 2, cartTop, cartX + cartW / 2, cartTop + cartH);
  cartGrad.addColorStop(0, '#0284C7');
  cartGrad.addColorStop(0.5, '#0F172A');
  cartGrad.addColorStop(1, '#020617');
  ctx.fillStyle = cartGrad;
  ctx.beginPath();
  ctx.roundRect(cartX - cartW / 2, cartTop, cartW, cartH, 6);
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Machined Brass Slotted Mass Weights Stacked on Deck
  const massLayers = Math.min(5, Math.max(1, Math.round(m)));
  for (let mi = 0; mi < massLayers; mi++) {
    const mwY = cartTop - 4 - mi * 5;
    const mwGrad = ctx.createLinearGradient(0, mwY, 0, mwY + 4);
    mwGrad.addColorStop(0, '#FDE047');
    mwGrad.addColorStop(0.5, '#CA8A04');
    mwGrad.addColorStop(1, '#854D0E');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(cartX - 22, mwY, 44, 4);
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(cartX - 22, mwY, 44, 4);
  }

  // Cart Mass Label
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`m = ${m} kg`, cartX, cartTop + 18);
  ctx.textAlign = 'left';

  // Precision Low-Friction Bearing Wheels
  [-22, 22].forEach(ox => {
    const wx = cartX + ox;
    const wy = cartTop + cartH + 2;
    ctx.beginPath();
    ctx.arc(wx, wy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#020617';
    ctx.fill();
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(wx, wy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  });

  // 3. Digital Load Cell Pull Cable & Force Vector Arrow
  const cableX = cartX + cartW / 2;
  const cableY = cartTop + 14;
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 2]);
  ctx.beginPath();
  ctx.moveTo(cableX, cableY);
  ctx.lineTo(cableX + 16, cableY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Active Applied Force Vector F
  drawArrow(ctx, cableX + 16, cableY, cableX + 16 + Math.min(85, F * 4.5), cableY, '#10B981', `F = ${F} N`);

  // Acceleration Vector a = F/m
  drawArrow(ctx, cartX - cartW / 2, cartTop - 28, cartX - cartW / 2 + Math.min(75, a * 12), cartTop - 28, '#00F0FF', `a = ${a.toFixed(2)} m/s²`);

  // Velocity Indicator
  if (curV > 0) {
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(`v = ${curV.toFixed(1)} m/s`, cartX - 25, cartTop + 40);
  }

  // Telemetry HUD formula badge
  ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(`NEWTON'S 2ND LAW // a = F / m = ${F} / ${m} = ${a.toFixed(2)} m/s²`, 40, cy - 70);

  onTelem({
    calc_accel: `${a.toFixed(2)} m/s²`,
    ratio_check: `a = ${F} / ${m} = ${a.toFixed(2)}`
  });
}

function renderActionReaction(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const m1 = p.mass_skater1 ?? 40;
  const m2 = p.mass_skater2 ?? 80;

  const cy = h / 2 + 10;
  const loopT = (t * 0.8) % 4.2;
  const pushImpulse = 80;
  const v1 = -pushImpulse / m1;
  const v2 = pushImpulse / m2;

  const x1 = w / 2 - 30 + v1 * loopT * 18;
  const x2 = w / 2 + 30 + v2 * loopT * 18;

  // 1. Air Track Bed
  const trackY = cy + 24;
  ctx.fillStyle = '#080D1A';
  ctx.beginPath();
  ctx.roundRect(30, trackY, w - 60, 16, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2. Action-Reaction Shockwave Ripples at Push Origin
  if (loopT < 0.8) {
    const ripR = loopT * 40;
    ctx.save();
    ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 - loopT})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, cy, ripR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Glider Cart 1 (Cyan / Lighter Mass)
  const r1 = Math.max(16, 12 + m1 * 0.12);
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  const g1Grad = ctx.createRadialGradient(x1 - 4, cy - 4, 3, x1, cy, r1);
  g1Grad.addColorStop(0, '#FFFFFF');
  g1Grad.addColorStop(0.3, '#00F0FF');
  g1Grad.addColorStop(0.8, '#0284C7');
  g1Grad.addColorStop(1, '#082F49');
  ctx.fillStyle = g1Grad;
  ctx.beginPath();
  ctx.arc(x1, cy, r1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${m1} kg`, x1, cy + 3.5);

  // 4. Glider Cart 2 (Ultraviolet / Heavier Mass)
  const r2 = Math.max(18, 12 + m2 * 0.12);
  ctx.save();
  ctx.shadowColor = '#A855F7';
  ctx.shadowBlur = 10;
  const g2Grad = ctx.createRadialGradient(x2 - 4, cy - 4, 3, x2, cy, r2);
  g2Grad.addColorStop(0, '#FFFFFF');
  g2Grad.addColorStop(0.3, '#A855F7');
  g2Grad.addColorStop(0.8, '#7C3AED');
  g2Grad.addColorStop(1, '#2E1065');
  ctx.fillStyle = g2Grad;
  ctx.beginPath();
  ctx.arc(x2, cy, r2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(`${m2} kg`, x2, cy + 3.5);
  ctx.textAlign = 'left';

  // 5. Equal & Opposite Force Vectors during impulse
  if (loopT < 1.0) {
    drawArrow(ctx, w / 2, cy - 25, w / 2 - 55, cy - 25, '#00F0FF', `F₁₂ = -${pushImpulse}N`);
    drawArrow(ctx, w / 2, cy - 25, w / 2 + 55, cy - 25, '#A855F7', `F₂₁ = +${pushImpulse}N`);
  }

  // Recoil velocity vector arrows
  drawArrow(ctx, x1 - r1, cy, x1 - r1 + v1 * 12, cy, '#00F0FF', `v₁ = ${v1.toFixed(1)} m/s`);
  drawArrow(ctx, x2 + r2, cy, x2 + r2 + v2 * 12, cy, '#A855F7', `v₂ = +${v2.toFixed(1)} m/s`);

  // Header HUD
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText("NEWTON'S 3RD LAW // F₁₂ = -F₂₁  (MOMENTUM IS CONSERVED: m₁v₁ + m₂v₂ = 0)", 35, cy - 70);

  onTelem({
    v1_recoil: `${v1.toFixed(2)} m/s`,
    v2_recoil: `${v2.toFixed(2)} m/s`,
    force_equality: 'Equal and Opposite'
  });
}

/* ==========================================================================
   10. WORK, ENERGY & POWER SIMULATIONS
   ========================================================================== */

function renderEnergyRollercoaster(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const m = p.skater_mass ?? 50;
  const H = p.release_height ?? 6;
  const g = 9.8;
  const maxPE = m * g * H;

  // High-Tech Curved Neon Track
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(70, 90);
  ctx.quadraticCurveTo(w / 2 - 70, h - 45, w - 240, 90);
  ctx.stroke();
  ctx.restore();

  // Track support scaffolding truss
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let tx = 110; tx < w - 260; tx += 45) {
    const normalizedX = (tx - 70) / (w - 240 - 70);
    const ty = 90 + 4 * (h - 135) * normalizedX * (1 - normalizedX);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx, h - 35);
    ctx.stroke();
  }

  // Oscillator position
  const oscAngle = Math.sin(t * 2.2);
  const curHeight = H * (oscAngle * oscAngle);
  const curPE = m * g * curHeight;
  const curKE = Math.max(0, maxPE - curPE);
  const curSpeed = Math.sqrt((2 * curKE) / m);

  const cartX = w / 2 - 70 + oscAngle * 145;
  const cartY = h - 48 - (curHeight / H) * (h - 138);

  // Aerodynamic Coaster Capsule
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 12;
  const capsuleGrad = ctx.createRadialGradient(cartX - 3, cartY - 3, 2, cartX, cartY, 12);
  capsuleGrad.addColorStop(0, '#FFFFFF');
  capsuleGrad.addColorStop(0.3, '#00F0FF');
  capsuleGrad.addColorStop(0.8, '#0284C7');
  capsuleGrad.addColorStop(1, '#051329');
  ctx.fillStyle = capsuleGrad;
  ctx.beginPath();
  ctx.arc(cartX, cartY, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Dynamic Velocity Vector on Capsule
  if (curSpeed > 0.5) {
    const vDir = -Math.cos(t * 2.2);
    const arrowLen = Math.min(45, curSpeed * 4) * vDir;
    drawArrow(ctx, cartX, cartY - 14, cartX + arrowLen, cartY - 14, '#38BDF8', `v=${curSpeed.toFixed(1)} m/s`);
  }

  // Holographic Live Energy Bar Instrument on Right
  const barBoxX = w - 195;
  const barBoxY = 50;
  const barBoxW = 180;
  const barBoxH = 250;

  ctx.save();
  ctx.fillStyle = 'rgba(7, 12, 27, 0.9)';
  ctx.beginPath();
  ctx.roundRect(barBoxX, barBoxY, barBoxW, barBoxH, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // HUD Header
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('ENERGY SPECTRUM (J)', barBoxX + 16, barBoxY + 24);

  const barMaxH = 145;
  const barBaseY = barBoxY + barBoxH - 45;
  const bW = 32;

  // 1. Kinetic Energy (Electric Cyan)
  const keH = (curKE / maxPE) * barMaxH;
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.fillRect(barBoxX + 20, barBaseY - keH, bW, keH);

  // 2. Potential Energy (Ultraviolet)
  const peH = (curPE / maxPE) * barMaxH;
  ctx.fillStyle = '#A855F7';
  ctx.shadowColor = '#A855F7';
  ctx.shadowBlur = 8;
  ctx.fillRect(barBoxX + 68, barBaseY - peH, bW, peH);

  // 3. Total Mechanical Energy (Hyper Emerald)
  ctx.fillStyle = '#10B981';
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 8;
  ctx.fillRect(barBoxX + 116, barBaseY - barMaxH, bW, barMaxH);
  ctx.shadowBlur = 0;

  // Labels & Values below bars
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('KE', barBoxX + 28, barBaseY + 16);
  ctx.fillText(`${Math.round(curKE)}J`, barBoxX + 20, barBaseY + 30);

  ctx.fillStyle = '#A855F7';
  ctx.fillText('PE', barBoxX + 76, barBaseY + 16);
  ctx.fillText(`${Math.round(curPE)}J`, barBoxX + 68, barBaseY + 30);

  ctx.fillStyle = '#10B981';
  ctx.fillText('TOTAL', barBoxX + 118, barBaseY + 16);
  ctx.fillText(`${Math.round(maxPE)}J`, barBoxX + 116, barBaseY + 30);
  ctx.restore();

  onTelem({
    ke_val: `${Math.round(curKE)} J`,
    pe_val: `${Math.round(curPE)} J`,
    tot_e: `${Math.round(maxPE)} J`
  });
}

function renderWorkAtAngle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const F = p.pull_force ?? 50;
  const deg = p.rope_angle ?? 30;
  const d = p.pull_dist ?? 5;
  const rad = (deg * Math.PI) / 180;

  const effF = F * Math.cos(rad);
  const liftF = F * Math.sin(rad);
  const work = effF * d;

  const cy = h / 2 + 25;
  const boxX = w / 2 - 90;

  // High-Tech Floor
  ctx.fillStyle = '#080D1A';
  ctx.beginPath();
  ctx.roundRect(40, cy + 25, w - 80, 16, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Precision Cargo Crate
  const crateGrad = ctx.createLinearGradient(boxX, cy - 25, boxX + 50, cy + 25);
  crateGrad.addColorStop(0, '#0284C7');
  crateGrad.addColorStop(0.5, '#0F172A');
  crateGrad.addColorStop(1, '#020617');
  ctx.fillStyle = crateGrad;
  ctx.beginPath();
  ctx.roundRect(boxX, cy - 25, 52, 50, 6);
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hazard warning diagonal strip on crate
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxX + 10, cy + 20);
  ctx.lineTo(boxX + 42, cy - 12);
  ctx.stroke();

  // Rope and Angle
  const ropeLen = 100;
  const rx = boxX + 52 + Math.cos(rad) * ropeLen;
  const ry = cy - Math.sin(rad) * ropeLen;

  // Pulling Force Vector
  drawArrow(ctx, boxX + 52, cy, rx, ry, '#F43F5E', `F = ${F} N (at ${deg}°)`);

  // Effective Horizontal Vector F cos θ
  drawArrow(ctx, boxX + 52, cy, boxX + 52 + effF * 1.5, cy, '#10B981', `F cosθ = ${effF.toFixed(1)} N`);

  // Vertical Lift Vector F sin θ
  drawArrow(ctx, boxX + 52, cy, boxX + 52, cy - liftF * 1.5, '#FBBF24', `F sinθ = ${liftF.toFixed(1)} N`);

  // Angle Arc
  ctx.save();
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(boxX + 52, cy, 32, -rad, 0);
  ctx.stroke();
  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`θ = ${deg}°`, boxX + 90, cy - 10);
  ctx.restore();

  // Work Formula HUD Banner
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(`WORK DONE = (F cosθ) × d = ${effF.toFixed(1)} N × ${d} m = ${work.toFixed(0)} Joules`, 45, cy - 75);

  onTelem({
    eff_force: `${effF.toFixed(1)} N`,
    work_done: `${work.toFixed(0)} J`
  });
}

function renderSpringEnergy(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const k = p.spring_k ?? 150;
  const A = p.compression_x ?? 0.4;
  const mass = 1;
  const omega = Math.sqrt(k / mass);

  const oscX = A * Math.cos(t * omega * 0.7);
  const cy = h / 2 + 10;
  const wallX = 70;
  const blockX = w / 2 - 20 + oscX * 125;

  // Wall Anchor
  ctx.fillStyle = '#0B132B';
  ctx.fillRect(wallX - 14, cy - 45, 14, 90);
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(wallX - 14, cy - 45, 14, 90);

  // 3D Helical Steel Spring
  ctx.save();
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2.8;
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(wallX, cy);

  const coils = 14;
  const springLen = blockX - 25 - wallX;
  for (let i = 0; i <= coils; i++) {
    const sx = wallX + (i / coils) * springLen;
    const sy = i === 0 || i === coils ? cy : cy + (i % 2 === 0 ? 15 : -15);
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.restore();

  // Test Mass Block
  const blockGrad = ctx.createLinearGradient(blockX - 25, cy - 25, blockX + 25, cy + 25);
  blockGrad.addColorStop(0, '#A855F7');
  blockGrad.addColorStop(0.5, '#0F172A');
  blockGrad.addColorStop(1, '#020617');
  ctx.fillStyle = blockGrad;
  ctx.beginPath();
  ctx.roundRect(blockX - 25, cy - 25, 50, 50, 6);
  ctx.fill();
  ctx.strokeStyle = '#C084FC';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('1.0 kg', blockX, cy + 3.5);
  ctx.textAlign = 'left';

  const maxPE = 0.5 * k * A * A;
  const maxV = A * omega;
  const curPE = 0.5 * k * oscX * oscX;
  const curKE = Math.max(0, maxPE - curPE);

  // Harmonic Energy HUD on right
  const hudX = w - 190;
  const hudY = 55;
  ctx.fillStyle = 'rgba(7, 12, 27, 0.9)';
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, 175, 140, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('HARMONIC OSCILLATOR', hudX + 12, hudY + 22);

  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#A855F7';
  ctx.fillText(`Spring PE: ${curPE.toFixed(1)} J`, hudX + 12, hudY + 50);
  ctx.fillStyle = '#00F0FF';
  ctx.fillText(`Kinetic KE: ${curKE.toFixed(1)} J`, hudX + 12, hudY + 75);
  ctx.fillStyle = '#10B981';
  ctx.fillText(`Total E: ${maxPE.toFixed(1)} J`, hudX + 12, hudY + 100);
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(`Max Speed: ${maxV.toFixed(1)} m/s`, hudX + 12, hudY + 122);

  onTelem({
    spring_pe: `${maxPE.toFixed(1)} Joules`,
    max_speed: `${maxV.toFixed(1)} m/s`
  });
}

/* ==========================================================================
   11. GRAVITATION SIMULATIONS
   ========================================================================== */

function renderTwoBodyGrav(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const m1 = p.m1_grav ?? 40;
  const m2 = p.m2_grav ?? 60;
  const r = p.r_dist ?? 5;

  const cy = h / 2;
  const dPix = r * 30;
  const cx1 = w / 2 - dPix / 2;
  const cx2 = w / 2 + dPix / 2;

  // Mass 1
  ctx.beginPath();
  ctx.arc(cx1, cy, Math.max(10, m1 * 0.35), 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();

  // Mass 2
  ctx.beginPath();
  ctx.arc(cx2, cy, Math.max(10, m2 * 0.35), 0, Math.PI * 2);
  ctx.fillStyle = '#7C3AED';
  ctx.fill();

  // Attractive Force Arrows (Equal & Opposite)
  const fVal = (m1 * m2) / (r * r);
  const arrowScale = Math.min(60, fVal * 0.5);

  drawArrow(ctx, cx1, cy, cx1 + arrowScale, cy, '#10B981', 'F_grav');
  drawArrow(ctx, cx2, cy, cx2 - arrowScale, cy, '#10B981', 'F_grav');

  onTelem({
    grav_force: `${fVal.toFixed(1)} G Units`,
    inv_sq_factor: `1/${(r * r).toFixed(0)}`
  });
}

function renderKeplerOrbit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const cx = w / 2 - 30;
  const cy = h / 2;
  const vLaunch = p.v_launch ?? 24;
  const planetM = p.planet_mass ?? 100;

  // Orbital parameters
  const a = 135 + (vLaunch - 15) * 2.5; // Semi-major axis
  const b = 90 + (vLaunch - 15) * 1.2;  // Semi-minor axis
  const e = Math.sqrt(Math.max(0.05, 1 - (b * b) / (a * a))); // Eccentricity
  const c = a * e; // Focus distance from center

  // Focus 1 (Sun is at Focus 1)
  const sunX = cx - c;
  const sunY = cy;

  // Kepler's equation solver: M = E - e * sin(E)
  // Orbital frequency omega = 2pi / T. Mean anomaly M = omega * t
  const omega = 0.45 * Math.sqrt(planetM / 100) / Math.pow(a / 135, 1.5);
  const M = (t * omega * 2.2) % (Math.PI * 2);

  // Newton-Raphson solver for Eccentric Anomaly E
  let E = M;
  for (let iter = 0; iter < 5; iter++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  // Position of satellite relative to center of ellipse
  // Coordinates: x = cx - c + a*cos(E), y = cy + b*sin(E)
  const satX = cx - c + a * Math.cos(E);
  const satY = cy + b * Math.sin(E);

  // Radius vector from Sun to Satellite: r = a * (1 - e * cos(E))
  const rNorm = a * (1 - e * Math.cos(E));

  // True Vis-Viva Orbital Speed: v = sqrt(GM * (2/r - 1/a))
  const GM = planetM * 180;
  const curSpeed = Math.sqrt(Math.max(1, GM * (2 / Math.max(10, rNorm) - 1 / a)));
  const periSpeed = Math.sqrt(GM * (2 / (a * (1 - e)) - 1 / a));
  const aphSpeed = Math.sqrt(GM * (2 / (a * (1 + e)) - 1 / a));

  // 1. Draw Elliptical Orbit Track with Cyan Glow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx - c, cy, a, b, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Major axis dashed line
  ctx.beginPath();
  ctx.moveTo(cx - c - a - 15, cy);
  ctx.lineTo(cx - c + a + 15, cy);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2. Kepler's Second Law: Shaded Swept Area Sector in time dt
  ctx.beginPath();
  ctx.moveTo(sunX, sunY);
  const sweepAngleSteps = 12;
  const dM = 0.25;
  for (let i = 0; i <= sweepAngleSteps; i++) {
    const sweepM = M - (dM * i) / sweepAngleSteps;
    let swE = sweepM;
    for (let it = 0; it < 3; it++) {
      swE = swE - (swE - e * Math.sin(swE) - sweepM) / (1 - e * Math.cos(swE));
    }
    const sx = cx - c + a * Math.cos(swE);
    const sy = cy + b * Math.sin(swE);
    ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.fill();

  // 3. Radius Vector Line from Sun to Satellite
  ctx.beginPath();
  ctx.moveTo(sunX, sunY);
  ctx.lineTo(satX, satY);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // 4. Glowing Sun at Focus 1 with Luminous Solar Corona
  const sunR = Math.max(14, planetM * 0.14);
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, sunR * 2.5);
  sunGrad.addColorStop(0, '#FFFFFF');
  sunGrad.addColorStop(0.25, '#FEF08A');
  sunGrad.addColorStop(0.65, '#F59E0B');
  sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 2.5, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();

  ctx.save();
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('☀️ Sun (Focus 1)', sunX - 38, sunY + sunR + 18);

  // 5. Satellite with Photovoltaic Solar Panels
  ctx.save();
  ctx.translate(satX, satY);
  const vx = -a * Math.sin(E);
  const vy = b * Math.cos(E);
  const vAngle = Math.atan2(vy, vx);
  ctx.rotate(vAngle);

  // Satellite body with cyan glow
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-7, -7, 14, 14);
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.fillRect(-5, -5, 10, 10);

  // Solar panel wings
  ctx.fillStyle = '#6366F1';
  ctx.fillRect(-20, -5, 13, 10);
  ctx.fillRect(8, -5, 13, 10);
  ctx.strokeStyle = '#A78BFA';
  ctx.lineWidth = 1;
  ctx.strokeRect(-20, -5, 13, 10);
  ctx.strokeRect(8, -5, 13, 10);
  ctx.restore();

  // Tangent velocity vector arrow
  const vArrowLen = Math.min(50, curSpeed * 1.5);
  drawArrow(ctx, satX, satY, satX + Math.cos(vAngle) * vArrowLen, satY + Math.sin(vAngle) * vArrowLen, '#00F0FF', `v=${curSpeed.toFixed(1)} km/s`);

  // Perihelion and Aphelion indicators
  const periX = cx - c + a;
  const aphX = cx - c - a;
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`Perihelion (v_max=${periSpeed.toFixed(1)})`, periX - 85, cy + 20);
  ctx.fillStyle = '#F472B6';
  ctx.fillText(`Aphelion (v_min=${aphSpeed.toFixed(1)})`, aphX - 25, cy + 20);

  onTelem({
    orbit_shape: `Ellipse (e = ${e.toFixed(2)}, a = ${a.toFixed(0)} units)`,
    period_t: `Kepler 2nd: Swept Area = Const | Speed: ${curSpeed.toFixed(1)} km/s`
  });
}

function renderGravityAltitude(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const alt = p.altitude_km ?? 0;
  const R_earth = 6400; // km
  const g0 = 9.8;

  let gEff = g0;
  if (alt < 0) {
    // Inside Earth: Shell theorem proves g increases linearly with depth from center:
    // g(r) = g0 * (r / R)
    const r = (R_earth + alt) / R_earth;
    gEff = g0 * Math.max(0, r);
  } else {
    // Above Earth: Inverse square law:
    // g(r) = g0 * (R / (R + h))^2
    gEff = g0 / Math.pow(1 + alt / R_earth, 2);
  }

  const earthX = 180;
  const earthY = h / 2;
  const earthRadius = 90;

  // 1. Geological Cross Section of Earth
  // Mantle
  const mantleGrad = ctx.createRadialGradient(earthX, earthY, 10, earthX, earthY, earthRadius);
  mantleGrad.addColorStop(0, '#FEF08A'); // Inner core
  mantleGrad.addColorStop(0.25, '#F97316'); // Outer core
  mantleGrad.addColorStop(0.65, '#B91C1C'); // Lower mantle
  mantleGrad.addColorStop(0.92, '#7F1D1D'); // Upper mantle
  mantleGrad.addColorStop(1, '#0062FF'); // Crust & Oceans

  ctx.beginPath();
  ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
  ctx.fillStyle = mantleGrad;
  ctx.fill();
  ctx.strokeStyle = '#60A5FA';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Core boundary circles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthRadius * 0.2, 0, Math.PI * 2); // Inner core
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthRadius * 0.55, 0, Math.PI * 2); // Outer core
  ctx.stroke();

  // Atmosphere Glow
  const atmoGrad = ctx.createRadialGradient(earthX, earthY, earthRadius, earthX, earthY, earthRadius + 18);
  atmoGrad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
  atmoGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthRadius + 18, 0, Math.PI * 2);
  ctx.fillStyle = atmoGrad;
  ctx.fill();

  // Probe Position on / in / above Earth
  const currentR = R_earth + alt;
  const probeDistPix = (currentR / R_earth) * earthRadius;
  const probeX = earthX + probeDistPix;
  const probeY = earthY;

  // Probe Body
  ctx.beginPath();
  ctx.arc(probeX, probeY, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5FF';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gravity arrow pointing to center of Earth
  if (gEff > 0) {
    const arrowLen = Math.min(50, gEff * 4.5);
    drawArrow(ctx, probeX, probeY, probeX - arrowLen, probeY, '#EC4899', `g=${gEff.toFixed(2)}`);
  }

  // 2. Exact g(r) Graph on the Right Side
  const graphX = w / 2 + 70;
  const graphY = 60;
  const graphW = 275;
  const graphH = 230;

  ctx.save();
  ctx.fillStyle = 'rgba(7, 12, 27, 0.9)';
  ctx.beginPath();
  ctx.roundRect(graphX, graphY, graphW, graphH, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Corner brackets
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(graphX + 2, graphY + 10);
  ctx.lineTo(graphX + 2, graphY + 2);
  ctx.lineTo(graphX + 10, graphY + 2);
  ctx.stroke();

  // Oscilloscope Minor Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let gx = graphX + 35; gx < graphX + graphW - 15; gx += 30) {
    ctx.beginPath();
    ctx.moveTo(gx, graphY + 20);
    ctx.lineTo(gx, graphY + graphH - 30);
    ctx.stroke();
  }

  // Graph Axes
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(graphX + 35, graphY + 20);
  ctx.lineTo(graphX + 35, graphY + graphH - 30);
  ctx.lineTo(graphX + graphW - 15, graphY + graphH - 30);
  ctx.stroke();

  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('GRAVITY FIELD g(r) HUD', graphX + 45, graphY + 20);
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('g', graphX + 18, graphY + 28);
  ctx.fillText('r', graphX + graphW - 20, graphY + graphH - 12);

  // Surface boundary dashed line
  const surfaceGraphX = graphX + 35 + 65;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
  ctx.beginPath();
  ctx.moveTo(surfaceGraphX, graphY + 28);
  ctx.lineTo(surfaceGraphX, graphY + graphH - 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('R (Surface)', surfaceGraphX - 25, graphY + graphH - 12);

  // Plot g(r) curve
  // Inside Earth: Linear ramp from 0 to g0
  ctx.save();
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(graphX + 35, graphY + graphH - 30); // Center: g=0
  const peakY = graphY + graphH - 30 - 130;
  ctx.lineTo(surfaceGraphX, peakY); // Surface: g=g0 (9.8)

  // Outside Earth: 1/r^2 decay
  for (let px = surfaceGraphX; px <= graphX + graphW - 20; px += 2) {
    const rFrac = (px - (graphX + 35)) / 65; // r in units of R_earth
    const curG = g0 / (rFrac * rFrac);
    const py = graphY + graphH - 30 - (curG / g0) * 130;
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Current probe dot on graph
  const curFracR = Math.max(0, currentR / R_earth);
  const curGraphPtX = graphX + 35 + curFracR * 65;
  const curGraphPtY = graphY + graphH - 30 - (gEff / g0) * 130;

  if (curGraphPtX >= graphX + 35 && curGraphPtX <= graphX + graphW - 15) {
    ctx.beginPath();
    ctx.arc(curGraphPtX, curGraphPtY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#EC4899';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  onTelem({
    g_eff: `${gEff.toFixed(2)} m/s²`,
    weight_scale: `${(60 * (gEff / 9.8)).toFixed(1)} kg (${(60 * gEff).toFixed(0)} N)`
  });
}

/* ==========================================================================
   12. WAVES SIMULATIONS
   ========================================================================== */

function renderTransverseWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const A = p.amp_val ?? 35;
  const f = p.freq_val ?? 1.25;
  const v = p.wave_spd ?? 2.5;

  const cy = h / 2 - 10;
  const lambda = (v / f) * 75; // wavelength in pixels

  // 1. Oscillating Wave Generator Piston on Left
  const driverX = 55;
  const driverY = cy - A * Math.sin(2 * Math.PI * f * t);

  ctx.fillStyle = '#1E293B';
  ctx.roundRect(driverX - 25, driverY - 12, 25, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(driverX - 4, driverY - 3, 8, 6);

  // 2. Continuous Transverse Wave Line
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;

  const startX = driverX + 4;
  const endX = w - 45;
  for (let x = startX; x <= endX; x += 3) {
    const k = (2 * Math.PI) / lambda;
    const y = cy - A * Math.sin(k * (x - startX) - 2 * Math.PI * f * t);
    if (x === startX) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 3. Discrete Elastic Beads along String (showing particles move vertically only!)
  for (let x = startX + 25; x < endX - 10; x += 35) {
    const k = (2 * Math.PI) / lambda;
    const phi = k * (x - startX) - 2 * Math.PI * f * t;
    const y = cy - A * Math.sin(phi);
    const vy = -A * 2 * Math.PI * f * Math.cos(phi); // Transverse velocity dy/dt

    // Bead
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#7C3AED';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Particle velocity arrow (showing particle moves UP and DOWN, not forward!)
    if (Math.abs(vy) > 8) {
      const arrowY = y + (vy > 0 ? 1 : -1) * Math.min(22, Math.abs(vy) * 0.18);
      drawArrow(ctx, x, y, x, arrowY, '#EC4899', '', 5);
    }
  }

  // 4. Equilibrium center dashed line
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.beginPath();
  ctx.moveTo(startX, cy);
  ctx.lineTo(endX, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  // Wavelength ruler indicator
  const rulerY = cy + A + 25;
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(startX + 40, rulerY);
  ctx.lineTo(startX + 40 + lambda, rulerY);
  ctx.moveTo(startX + 40, rulerY - 6);
  ctx.lineTo(startX + 40, rulerY + 6);
  ctx.moveTo(startX + 40 + lambda, rulerY - 6);
  ctx.lineTo(startX + 40 + lambda, rulerY + 6);
  ctx.stroke();

  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText(`Wavelength λ = ${lambda.toFixed(0)} px`, startX + 40 + lambda / 2 - 50, rulerY - 8);

  onTelem({
    wavelength_disp: `${lambda.toFixed(0)} px`,
    period_disp: `${(1 / f).toFixed(2)} s`,
    speed_disp: `${(f * (lambda / 75)).toFixed(2)} m/s (v = fλ)`
  });
}

function renderSoundWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const f = p.sound_freq ?? 2;
  const A = p.sound_amp ?? 25;
  const cy = 110;

  // 1. Loudspeaker Driver Cone on Left
  const speakerX = 55;
  const coneDisp = (A / 3) * Math.sin(2 * Math.PI * f * t);

  // Speaker cabinet
  ctx.fillStyle = '#1E293B';
  ctx.roundRect(speakerX - 40, cy - 45, 40, 90, 4);
  ctx.fill();

  // Vibrating speaker diaphragm
  ctx.beginPath();
  ctx.moveTo(speakerX, cy - 35);
  ctx.lineTo(speakerX + 20 + coneDisp, cy - 20);
  ctx.lineTo(speakerX + 20 + coneDisp, cy + 20);
  ctx.lineTo(speakerX, cy + 35);
  ctx.closePath();
  ctx.fillStyle = '#334155';
  ctx.fill();
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Air Molecule Grid (Longitudinal Vibration)
  const cols = 36;
  const rows = 7;
  const startAirX = 90;
  const spacingX = (w - 120) / cols;

  for (let c = 0; c < cols; c++) {
    const eqX = startAirX + c * spacingX;
    // Longitudinal displacement: s(x, t) = A * cos(k*x - omega*t)
    const k = 0.38;
    const phase = k * c - 2 * Math.PI * f * t * 0.8;
    const displacement = A * Math.cos(phase);
    // Compression factor: derivative -ds/dx => density
    const compression = Math.sin(phase);

    for (let r = 0; r < rows; r++) {
      const px = eqX + displacement;
      const py = cy - 36 + r * 12;

      // Color molecules based on local density: high density (cyan), low density (slate)
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = compression > 0.3 ? '#00E5FF' : compression < -0.3 ? '#64748B' : '#0062FF';
      ctx.fill();
    }
  }

  // 3. Synchronized Acoustic Pressure Wave Graph Delta P(x) below
  const graphY = 220;
  const graphH = 100;
  ctx.save();
  ctx.fillStyle = 'rgba(7, 12, 27, 0.9)';
  ctx.beginPath();
  ctx.roundRect(startAirX - 10, graphY, w - startAirX - 10, graphH, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pressure centerline
  const pCenterY = graphY + graphH / 2;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(startAirX - 10, pCenterY);
  ctx.lineTo(w - 20, pCenterY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText('ACOUSTIC PRESSURE WAVE // ΔP(x) = ΔP₀ sin(kx - ωt)', startAirX + 12, graphY + 18);
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('+ΔP [COMPRESSION PEAK]', startAirX + 12, graphY + 32);
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('-ΔP [RAREFACTION TROUGH]', startAirX + 12, graphY + graphH - 10);
  ctx.restore();

  // Plot pressure wave curve
  ctx.beginPath();
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 2.5;

  for (let x = startAirX; x < w - 20; x += 3) {
    const cFrac = (x - startAirX) / spacingX;
    const phase = 0.38 * cFrac - 2 * Math.PI * f * t * 0.8;
    const pVal = Math.sin(phase) * 32;
    const py = pCenterY - pVal;
    if (x === startAirX) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();

  onTelem({
    pressure_state: 'Compressions (High P) & Rarefactions (Low P)',
    particle_motion: 'Longitudinal: Vibration parallel to wave propagation'
  });
}

function renderWaveSuperposition(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const A1 = p.pulse1_amp ?? 30;
  const A2 = p.pulse2_amp ?? 30;
  const cy = h / 2 - 10;

  // Pulse 1 moving right, Pulse 2 moving left
  const cyclePeriod = 5.0;
  const loopT = t % cyclePeriod;

  const startX = 60;
  const endX = w - 60;
  const length = endX - startX;

  const center1 = startX + loopT * (length / (cyclePeriod * 0.8));
  const center2 = endX - loopT * (length / (cyclePeriod * 0.8));

  const sigma = 35; // Pulse width

  // 1. Component Wave 1 (Cyan Dashed Line)
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 1.5;
  for (let x = startX; x <= endX; x += 4) {
    const d1 = x - center1;
    const y1 = A1 * Math.exp(-(d1 * d1) / (2 * sigma * sigma));
    const py = cy - y1;
    if (x === startX) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();

  // 2. Component Wave 2 (Violet Dashed Line)
  ctx.beginPath();
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 1.5;
  for (let x = startX; x <= endX; x += 4) {
    const d2 = x - center2;
    const y2 = A2 * Math.exp(-(d2 * d2) / (2 * sigma * sigma));
    const py = cy - y2;
    if (x === startX) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Composite Superposed Wave: y_total = y1 + y2 (Solid Thick Electric Blue)
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 3.5;
  for (let x = startX; x <= endX; x += 3) {
    const d1 = x - center1;
    const d2 = x - center2;
    const y1 = A1 * Math.exp(-(d1 * d1) / (2 * sigma * sigma));
    const y2 = A2 * Math.exp(-(d2 * d2) / (2 * sigma * sigma));
    const totalY = cy - (y1 + y2);
    if (x === startX) ctx.moveTo(x, totalY);
    else ctx.lineTo(x, totalY);
  }
  ctx.stroke();

  // Baseline
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, cy);
  ctx.lineTo(endX, cy);
  ctx.stroke();

  // Legend at bottom
  ctx.save();
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 6;
  ctx.fillRect(startX + 20, h - 48, 14, 4);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillText(`Pulse 1 (→): A₁ = ${A1}px`, startX + 40, h - 44);

  ctx.fillStyle = '#A855F7';
  ctx.shadowColor = '#A855F7';
  ctx.shadowBlur = 6;
  ctx.fillRect(startX + 240, h - 48, 14, 4);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillText(`Pulse 2 (←): A₂ = ${A2}px`, startX + 260, h - 44);

  ctx.fillStyle = '#0062FF';
  ctx.shadowColor = '#0062FF';
  ctx.shadowBlur = 6;
  ctx.fillRect(startX + 460, h - 48, 14, 4);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#38BDF8';
  ctx.fillText('Superposed: y = y₁ + y₂', startX + 480, h - 44);
  ctx.restore();

  const isConstructive = (A1 > 0 && A2 > 0) || (A1 < 0 && A2 < 0);
  const maxCombinedAmp = Math.abs(A1 + A2);

  onTelem({
    interference_type: isConstructive ? 'Constructive Interference (Peaks Combine)' : 'Destructive Interference (Waves Cancel)',
    combined_amp: `Max Peak: ${maxCombinedAmp} px`
  });
}

/* ==========================================================================
   OPTICS & LIGHT RENDERERS
   ========================================================================== */

function renderSnellsLaw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const theta1Deg = p.theta1 ?? 35;
  const n1 = p.n1 ?? 1.5;
  const n2 = p.n2 ?? 1.0;

  const cy = h / 2;
  const cx = w / 2;

  // Medium 1 (Top) - Sleek Optical Layer
  const m1Grad = ctx.createLinearGradient(0, 0, 0, cy);
  m1Grad.addColorStop(0, 'rgba(8, 14, 28, 0.4)');
  m1Grad.addColorStop(1, n1 > 1.2 ? 'rgba(0, 229, 255, 0.12)' : 'rgba(15, 23, 42, 0.2)');
  ctx.fillStyle = m1Grad;
  ctx.fillRect(0, 0, w, cy);

  // Medium 2 (Bottom) - Denser Crystal Layer
  const m2Grad = ctx.createLinearGradient(0, cy, 0, h);
  m2Grad.addColorStop(0, n2 > 1.2 ? 'rgba(124, 58, 237, 0.18)' : 'rgba(15, 23, 42, 0.2)');
  m2Grad.addColorStop(1, 'rgba(8, 14, 28, 0.6)');
  ctx.fillStyle = m2Grad;
  ctx.fillRect(0, cy, w, h - cy);

  // Interface boundary line with neon glow
  ctx.save();
  ctx.strokeStyle = '#00E5FF';
  ctx.shadowColor = '#00E5FF';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(w, cy);
  ctx.stroke();
  ctx.restore();

  // Normal line (vertical dashed in glowing slate)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, 16);
  ctx.lineTo(cx, h - 16);
  ctx.stroke();
  ctx.setLineDash([]);

  // Labels for media in HUD cards
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.textAlign = 'left';
  ctx.fillText(`MEDIUM 1 (n₁ = ${n1.toFixed(2)})`, 24, 30);
  ctx.fillStyle = '#A78BFA';
  ctx.fillText(`MEDIUM 2 (n₂ = ${n2.toFixed(2)})`, 24, cy + 30);

  const theta1Rad = (theta1Deg * Math.PI) / 180;
  const rayLen = Math.min(w, h) * 0.44;

  // Incident ray start
  const inStartX = cx - rayLen * Math.sin(theta1Rad);
  const inStartY = cy - rayLen * Math.cos(theta1Rad);

  // Emitter Housing at start of incident ray
  ctx.save();
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(inStartX, inStartY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Draw Incident Ray (Emerald Green Laser with Bloom)
  ctx.save();
  ctx.strokeStyle = '#10B981';
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(inStartX, inStartY);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  ctx.restore();

  drawArrow(ctx, inStartX, inStartY, cx, cy, '#10B981', '', 8);

  // Angle arc for theta1
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, 46, -Math.PI / 2 - theta1Rad, -Math.PI / 2);
  ctx.stroke();
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#34D399';
  ctx.fillText(`θ₁ = ${theta1Deg.toFixed(0)}°`, cx - 65, cy - 48);

  // Check critical angle if n1 > n2
  let isTIR = false;
  let critAngleDeg = 0;
  if (n1 > n2) {
    critAngleDeg = (Math.asin(n2 / n1) * 180) / Math.PI;
    if (theta1Deg > critAngleDeg) {
      isTIR = true;
    }
  }

  // Reflected Ray
  const refEndX = cx + rayLen * Math.sin(theta1Rad);
  const refEndY = cy - rayLen * Math.cos(theta1Rad);

  ctx.save();
  ctx.strokeStyle = isTIR ? '#10B981' : 'rgba(16, 185, 129, 0.45)';
  ctx.shadowColor = isTIR ? '#10B981' : 'transparent';
  ctx.shadowBlur = isTIR ? 16 : 0;
  ctx.lineWidth = isTIR ? 3.5 : 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(refEndX, refEndY);
  ctx.stroke();
  ctx.restore();

  if (isTIR) {
    drawArrow(ctx, cx, cy, refEndX, refEndY, '#10B981', '', 8);

    // Glowing Banner for TIR
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.fillRect(cx - 150, cy + 40, 300, 48);
    ctx.strokeRect(cx - 150, cy + 40, 300, 48);

    ctx.fillStyle = '#F87171';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ TOTAL INTERNAL REFLECTION (TIR)', cx, cy + 60);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(`θ₁ (${theta1Deg}°) > θ_crit (${critAngleDeg.toFixed(1)}°) • No light enters medium 2`, cx, cy + 76);
    ctx.restore();

    onTelem({
      refracted_angle: 'None (Total Internal Reflection)',
      critical_angle: `${critAngleDeg.toFixed(1)}°`,
      optical_state: '100% Total Internal Reflection (TIR)',
      speed_ratio: `v₁/v₂ = ${(n2 / n1).toFixed(2)}`
    });
  } else {
    // Refracted Ray (Snell's Law)
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    const theta2Rad = Math.asin(Math.min(1, Math.max(-1, sinTheta2)));
    const theta2Deg = (theta2Rad * 180) / Math.PI;

    const outEndX = cx + rayLen * Math.sin(theta2Rad);
    const outEndY = cy + rayLen * Math.cos(theta2Rad);

    ctx.save();
    ctx.strokeStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(outEndX, outEndY);
    ctx.stroke();
    ctx.restore();

    drawArrow(ctx, cx, cy, outEndX, outEndY, '#00F0FF', '', 8);

    // Angle arc for theta2
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 50, Math.PI / 2 - theta2Rad, Math.PI / 2);
    ctx.stroke();
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(`θ₂ = ${theta2Deg.toFixed(1)}°`, cx + 22, cy + 46);

    const bendsToward = theta2Deg < theta1Deg;
    onTelem({
      refracted_angle: `${theta2Deg.toFixed(1)}°`,
      critical_angle: n1 > n2 ? `${critAngleDeg.toFixed(1)}°` : 'None (n₁ ≤ n₂)',
      optical_state: bendsToward ? 'Bends TOWARD normal (Slows down)' : 'Bends AWAY from normal (Speeds up)',
      speed_ratio: `v₁/v₂ = ${(n2 / n1).toFixed(2)}`
    });
  }
}

function renderThinLens(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const f = p.focal_len ?? 60; // mm, can be positive (convex) or negative (concave)
  const u = Math.abs(p.obj_dist ?? 100); // object distance to left
  const ho = p.obj_height ?? 35; // object height

  const cx = w / 2;
  const cy = h / 2;

  // Scale: 1 mm = 1.6 px
  const scale = 1.6;
  const fPx = f * scale;
  const uPx = u * scale;
  const hoPx = ho * scale;

  // Optical Principal Axis
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(30, cy);
  ctx.lineTo(w - 30, cy);
  ctx.stroke();

  // Draw Polished Glass Lens with Caustics
  const isConvex = f > 0;
  ctx.save();
  const lensGrad = ctx.createLinearGradient(cx - 16, cy, cx + 16, cy);
  lensGrad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
  lensGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
  lensGrad.addColorStop(1, 'rgba(124, 58, 237, 0.35)');
  ctx.fillStyle = lensGrad;
  ctx.strokeStyle = isConvex ? '#00E5FF' : '#A78BFA';
  ctx.shadowColor = isConvex ? '#00E5FF' : '#A78BFA';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  if (isConvex) {
    ctx.ellipse(cx, cy, 14, 120, 0, 0, 2 * Math.PI);
  } else {
    ctx.rect(cx - 8, cy - 120, 16, 240);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Foci marks with glowing cyan points
  const fAbsPx = Math.abs(fPx);
  const foci = [
    { x: cx - fAbsPx, label: 'F₁' },
    { x: cx - 2 * fAbsPx, label: '2F₁' },
    { x: cx + fAbsPx, label: 'F₂' },
    { x: cx + 2 * fAbsPx, label: '2F₂' }
  ];

  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  foci.forEach(fc => {
    if (fc.x >= 30 && fc.x <= w - 30) {
      ctx.beginPath();
      ctx.arc(fc.x, cy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#00F0FF';
      ctx.fill();
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(fc.label, fc.x, cy + 16);
    }
  });

  // Object arrow at (cx - uPx, cy)
  const objX = cx - uPx;
  const objTipY = cy - hoPx;

  drawArrow(ctx, objX, cy, objX, objTipY, '#10B981', 'Object', 8);

  // Thin lens equation: 1/f = 1/v - 1/(-u) => 1/v = 1/f - 1/u => v = (u * f) / (u - f)
  let v = 0;
  let isAtInfinity = false;
  if (Math.abs(u - f) < 0.01) {
    isAtInfinity = true;
  } else {
    v = (u * f) / (u - f);
  }

  const m = isAtInfinity ? Infinity : -v / u; // magnification m = -v/u for inverted
  const hi = isAtInfinity ? 0 : m * ho;
  const vPx = v * scale;
  const hiPx = hi * scale;
  const imgX = cx + vPx;
  const imgTipY = cy + hiPx;

  // Ray 1: Parallel to axis, then through right focus (if convex) or diverged (if concave)
  ctx.save();
  ctx.strokeStyle = '#F59E0B';
  ctx.shadowColor = '#F59E0B';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(objX, objTipY);
  ctx.lineTo(cx, objTipY);

  if (isConvex) {
    const slope1 = (cy - objTipY) / fAbsPx;
    const ray1EndX = w - 20;
    const ray1EndY = cy + slope1 * (ray1EndX - (cx + fAbsPx));
    ctx.lineTo(ray1EndX, ray1EndY);
  } else {
    const slope1 = (objTipY - cy) / fAbsPx;
    ctx.lineTo(w - 20, objTipY + slope1 * (w - 20 - cx));
    ctx.stroke();
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(cx, objTipY);
    ctx.lineTo(cx - fAbsPx, cy);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.restore();

  // Ray 2: Directly through Optical Center (cx, cy)
  ctx.save();
  ctx.strokeStyle = '#EC4899';
  ctx.shadowColor = '#EC4899';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(objX, objTipY);
  const slope2 = (cy - objTipY) / (cx - objX);
  ctx.lineTo(w - 20, cy + slope2 * (w - 20 - cx));
  if (v < 0) {
    ctx.stroke();
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.moveTo(cx, cy);
    ctx.lineTo(Math.max(20, imgX - 30), cy - slope2 * (cx - Math.max(20, imgX - 30)));
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.stroke();
  }
  ctx.restore();

  // Draw Image if not at infinity and within canvas
  if (!isAtInfinity && imgX >= 20 && imgX <= w - 20) {
    const isReal = v > 0;
    drawArrow(ctx, imgX, cy, imgX, imgTipY, isReal ? '#00E5FF' : '#A78BFA', isReal ? 'Real Image' : 'Virtual Image', 8);
  }

  // Legend at bottom
  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Amber Ray: Parallel → Focus | Pink Ray: Through Optical Center (O)', 30, h - 16);

  onTelem({
    image_dist: isAtInfinity ? 'Infinity (Parallel Rays)' : `${v.toFixed(1)} mm (${v > 0 ? 'Right/Real' : 'Left/Virtual'})`,
    magnification: isAtInfinity ? 'Undefined' : `${Math.abs(m).toFixed(2)}x (${Math.abs(hi).toFixed(1)} mm)`,
    image_nature: isAtInfinity ? 'Focus at Infinity' : v > 0 ? 'Real & Inverted' : 'Virtual & Upright',
    lens_mode: isConvex ? `Convex (+${f} mm)` : `Concave (${f} mm)`
  });
}

function renderPrismDispersion(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  onTelem: (t: Record<string, string>) => void
) {
  const iDeg = p.incident_angle ?? 48;
  const apexDeg = p.prism_apex ?? 60;
  const dispDelta = p.glass_dispersion ?? 0.04;

  const cx = w / 2 - 20;
  const cy = h / 2 + 10;
  const side = 180;

  // Prism vertices
  const apexY = cy - (side * Math.sqrt(3)) / 3;
  const baseLeftX = cx - side / 2;
  const baseRightX = cx + side / 2;
  const baseY = cy + (side * Math.sqrt(3)) / 6;

  // Draw Glass Prism with Crystal Caustic Gradient
  ctx.save();
  const prismGrad = ctx.createLinearGradient(baseLeftX, apexY, baseRightX, baseY);
  prismGrad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
  prismGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
  prismGrad.addColorStop(1, 'rgba(124, 58, 237, 0.25)');
  ctx.fillStyle = prismGrad;
  ctx.strokeStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.moveTo(cx, apexY);
  ctx.lineTo(baseLeftX, baseY);
  ctx.lineTo(baseRightX, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Prism Apex Angle label
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#00F0FF';
  ctx.textAlign = 'center';
  ctx.fillText(`A = ${apexDeg}°`, cx, apexY - 12);

  // Incident ray hitting left face
  const hitY = cy - 10;
  const leftFaceSlope = (baseY - apexY) / (baseLeftX - cx);
  const hitX = cx + (hitY - apexY) / leftFaceSlope;

  const iRad = (iDeg * Math.PI) / 180;
  const faceAngle = Math.atan2(baseY - apexY, baseLeftX - cx);
  const normalAngle = faceAngle + Math.PI / 2;

  // Collimated White Light Beam with Intense Core & Glow
  const rayInLen = 140;
  const inStartX = hitX - rayInLen * Math.cos(normalAngle - iRad);
  const inStartY = hitY - rayInLen * Math.sin(normalAngle - iRad);

  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(inStartX, inStartY);
  ctx.lineTo(hitX, hitY);
  ctx.stroke();
  ctx.restore();

  drawArrow(ctx, inStartX, inStartY, hitX, hitY, '#38BDF8', 'White Light', 8);

  // Spectral refraction inside and out
  const wavelengths = [
    { color: '#EF4444', n: 1.505, name: 'Red' },
    { color: '#F59E0B', n: 1.512, name: 'Orange' },
    { color: '#EAB308', n: 1.518, name: 'Yellow' },
    { color: '#10B981', n: 1.524, name: 'Green' },
    { color: '#00E5FF', n: 1.530 + dispDelta * 0.5, name: 'Cyan' },
    { color: '#8B5CF6', n: 1.538 + dispDelta, name: 'Violet' }
  ];

  const screenX = w - 40;
  let devRed = 0;
  let devViolet = 0;

  wavelengths.forEach((wl, idx) => {
    // Snell at Face 1: sin(r1) = sin(i) / n
    const sinR1 = Math.sin(iRad) / wl.n;
    const r1 = Math.asin(Math.min(1, sinR1));

    // Internal ray angle relative to prism base
    const internalAngle = normalAngle - r1;
    const rayInternalLen = 85 + idx * 2.5;
    const exitX = hitX + rayInternalLen * Math.cos(internalAngle + 0.3);
    const exitY = hitY + rayInternalLen * Math.sin(internalAngle + 0.3);

    // Draw internal ray
    ctx.strokeStyle = wl.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(exitX, exitY);
    ctx.stroke();

    // Snell at Face 2: prism apex relation r1 + r2 = A => r2 = A - r1
    const A_rad = (apexDeg * Math.PI) / 180;
    const r2 = Math.max(0, A_rad - r1);
    const sinE = Math.min(1, wl.n * Math.sin(r2));
    const e = Math.asin(sinE);

    // Total deviation: delta = i + e - A
    const delta = (iRad + e - A_rad) * (180 / Math.PI);
    if (idx === 0) devRed = delta;
    if (idx === wavelengths.length - 1) devViolet = delta;

    // Exit ray to screen
    const exitAngle = 0.25 + (delta * Math.PI) / 180;
    const outEndY = exitY + (screenX - exitX) * Math.sin(exitAngle);

    ctx.save();
    ctx.strokeStyle = wl.color;
    ctx.shadowColor = wl.color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(exitX, exitY);
    ctx.lineTo(screenX, outEndY);
    ctx.stroke();

    // Phosphor glow spot on detector screen
    ctx.fillStyle = wl.color;
    ctx.beginPath();
    ctx.arc(screenX, outEndY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Projection Screen on right with glass HUD styling
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.fillRect(screenX, 35, 8, h - 70);
  ctx.strokeRect(screenX, 35, 8, h - 70);

  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#CBD5E1';
  ctx.textAlign = 'center';
  ctx.fillText('SCREEN', screenX + 4, 25);
  ctx.restore();

  const spread = Math.abs(devViolet - devRed);
  const minDevEstimated = 2 * iDeg - apexDeg;

  onTelem({
    dev_red: `${devRed.toFixed(1)}°`,
    dev_violet: `${devViolet.toFixed(1)}°`,
    angular_spread: `${spread.toFixed(2)}°`,
    deviation_state: `Symmetric Min Deviation ~ ${minDevEstimated.toFixed(1)}°`
  });
}

/* ==========================================================================
   THERMODYNAMICS & HEAT RENDERERS
   ========================================================================== */

function renderIdealGasChamber(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const T = p.temperature ?? 300; // Kelvin (150 - 750)
  const V = p.volume ?? 25; // Liters (10 - 45)
  const n = p.particles_count ?? 2; // Moles (1 - 5)

  // Ideal Gas Law: P = nRT / V
  // R = 8.314 J/mol·K. P in kPa:
  const R = 8.314;
  const P_kPa = (n * R * T) / V;
  const P_atm = P_kPa / 101.325;
  const v_rms = Math.sqrt((3 * R * T) / 0.004); // Helium M = 4 g/mol
  const U_kJ = (1.5 * n * R * T) / 1000;

  const leftX = 70;
  const topY = 90;
  const chamberH = 180;
  const maxChamberW = 380;
  const currentChamberW = Math.min(maxChamberW, 80 + V * 6.5);
  const pistonX = leftX + currentChamberW;

  // Cylinder walls (Titanium alloy container with cyan rim lighting)
  ctx.save();
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.lineWidth = 1.5;

  // Top wall
  ctx.fillRect(leftX - 10, topY - 12, maxChamberW + 40, 12);
  ctx.strokeRect(leftX - 10, topY - 12, maxChamberW + 40, 12);
  // Bottom wall
  ctx.fillRect(leftX - 10, topY + chamberH, maxChamberW + 40, 12);
  ctx.strokeRect(leftX - 10, topY + chamberH, maxChamberW + 40, 12);
  // Left closed wall
  ctx.fillRect(leftX - 12, topY - 12, 12, chamberH + 24);
  ctx.strokeRect(leftX - 12, topY - 12, 12, chamberH + 24);
  ctx.restore();

  // Gas Chamber Interior Fill (Energetic thermal atmosphere)
  const heatRatio = Math.min(1, Math.max(0, (T - 150) / 600));
  const chamberGrad = ctx.createLinearGradient(leftX, topY, pistonX, topY + chamberH);
  if (heatRatio > 0.5) {
    chamberGrad.addColorStop(0, `rgba(239, 68, 68, ${0.08 + heatRatio * 0.16})`);
    chamberGrad.addColorStop(1, `rgba(245, 158, 11, ${0.08 + heatRatio * 0.16})`);
  } else {
    chamberGrad.addColorStop(0, `rgba(0, 98, 255, ${0.14 - heatRatio * 0.08})`);
    chamberGrad.addColorStop(1, `rgba(0, 229, 255, ${0.14 - heatRatio * 0.08})`);
  }
  ctx.fillStyle = chamberGrad;
  ctx.fillRect(leftX, topY, currentChamberW, chamberH);

  // Sliding Piston Head with Machined Metal Gradient
  const pGrad = ctx.createLinearGradient(pistonX, topY, pistonX + 18, topY);
  pGrad.addColorStop(0, '#475569');
  pGrad.addColorStop(0.5, '#94A3B8');
  pGrad.addColorStop(1, '#334155');
  ctx.fillStyle = pGrad;
  ctx.fillRect(pistonX, topY, 18, chamberH);
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 1;
  ctx.strokeRect(pistonX, topY, 18, chamberH);

  // Piston Rod
  const rodGrad = ctx.createLinearGradient(pistonX + 18, topY + chamberH / 2 - 8, pistonX + 18, topY + chamberH / 2 + 8);
  rodGrad.addColorStop(0, '#64748B');
  rodGrad.addColorStop(0.5, '#CBD5E1');
  rodGrad.addColorStop(1, '#475569');
  ctx.fillStyle = rodGrad;
  ctx.fillRect(pistonX + 18, topY + chamberH / 2 - 8, maxChamberW - currentChamberW + 40, 16);

  // Bouncing Gas Particles with Energetic Glow
  const particleCount = Math.min(60, 15 * n);
  const speed = Math.sqrt(T / 300) * 1.8;

  ctx.save();
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137.5;
    const px = leftX + 8 + ((seed + t * speed * 40 * ((i % 3) + 1)) % (currentChamberW - 16));
    const py = topY + 8 + ((seed * 1.618 + Math.sin(t * speed + i) * 60 + 80) % (chamberH - 16));

    const pColor = heatRatio > 0.4 ? '#F43F5E' : '#00E5FF';
    ctx.shadowColor = pColor;
    ctx.shadowBlur = 6;
    ctx.fillStyle = pColor;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
    ctx.fill();

    // Particle velocity vector trail
    ctx.strokeStyle = heatRatio > 0.4 ? 'rgba(244, 63, 94, 0.45)' : 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - Math.cos(seed) * 8 * speed, py - Math.sin(seed) * 8 * speed);
    ctx.stroke();
  }
  ctx.restore();

  // Pressure Gauge Dial on top with Dark Glass Finish
  const gaugeX = leftX + 80;
  const gaugeY = topY - 50;
  const gaugeR = 30;

  ctx.save();
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, gaugeR, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Scale ticks
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1;
  for (let a = -Math.PI * 0.8; a <= Math.PI * 0.8; a += Math.PI * 0.32) {
    ctx.beginPath();
    ctx.moveTo(gaugeX + Math.cos(a) * (gaugeR - 6), gaugeY + Math.sin(a) * (gaugeR - 6));
    ctx.lineTo(gaugeX + Math.cos(a) * (gaugeR - 2), gaugeY + Math.sin(a) * (gaugeR - 2));
    ctx.stroke();
  }

  // Gauge needle with glowing tip
  const pAngle = -Math.PI * 0.8 + (Math.min(P_kPa, 600) / 600) * Math.PI * 1.6;
  ctx.strokeStyle = '#F43F5E';
  ctx.shadowColor = '#F43F5E';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(gaugeX + Math.cos(pAngle) * (gaugeR - 6), gaugeY + Math.sin(pAngle) * (gaugeR - 6));
  ctx.stroke();

  // Center hub
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();

  ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'center';
  ctx.fillText('PRESSURE', gaugeX, gaugeY - gaugeR - 6);
  ctx.fillStyle = '#00F0FF';
  ctx.fillText(`${P_kPa.toFixed(0)} kPa`, gaugeX, gaugeY + 12);

  // Heating Burner / Cold Block below cylinder
  const burnerX = leftX + currentChamberW / 2;
  const burnerY = topY + chamberH + 14;

  if (T >= 280) {
    // Dynamic plasma fire flames
    ctx.save();
    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 10;
    const flameH = (T / 750) * 28;
    for (let f = -30; f <= 30; f += 15) {
      ctx.beginPath();
      ctx.moveTo(burnerX + f - 6, burnerY);
      ctx.quadraticCurveTo(
        burnerX + f,
        burnerY + flameH + Math.sin(t * 8 + f) * 4,
        burnerX + f + 6,
        burnerY
      );
      ctx.fill();
    }
    ctx.restore();
    ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(`🔥 HEAT RESERVOIR (T = ${T} K)`, burnerX, burnerY + 36);
  } else {
    // Ice coolant blocks
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.2;
    ctx.fillRect(burnerX - 25, burnerY + 4, 18, 18);
    ctx.strokeRect(burnerX - 25, burnerY + 4, 18, 18);
    ctx.fillRect(burnerX + 7, burnerY + 4, 18, 18);
    ctx.strokeRect(burnerX + 7, burnerY + 4, 18, 18);
    ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(`❄️ CRYOGENIC COOLING (T = ${T} K)`, burnerX, burnerY + 36);
  }

  // Telemetry readout
  onTelem({
    pressure: `${P_kPa.toFixed(1)} kPa (${P_atm.toFixed(2)} atm)`,
    v_rms: `${v_rms.toFixed(0)} m/s (Helium)`,
    internal_energy: `${U_kJ.toFixed(2)} kJ`,
    collision_freq: `${((P_kPa * currentChamberW) / 120).toFixed(0)} collisions/ms`
  });
}

function renderCarnotCycle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const TH = p.thot ?? 750; // K (450 - 1200)
  const TC = p.tcold ?? 300; // K (200 - 400)
  const r = p.compression_ratio ?? 3.5; // (2 - 6)

  const eta = 1 - TC / TH;
  const QH = 1000; // J base
  const W_net = QH * eta;
  const QC = QH - W_net;

  const originX = 90;
  const originY = h - 60;
  const plotW = w - 160;
  const plotH = h - 130;

  // Axes (P vs V)
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + plotW, originY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX, originY - plotH);
  ctx.stroke();

  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'left';
  ctx.fillText('Volume (V) →', originX + plotW - 60, originY + 24);
  ctx.fillText('Pressure (P) ↑', originX - 65, originY - plotH + 10);

  // Carnot 4 Corner States (Normalized coordinates)
  // State 1: Highest P, lowest V (Start of isothermal expansion at TH)
  const p1 = { x: originX + 50, y: originY - plotH + 20 };
  // State 2: End of isothermal expansion at TH (V increased to V2)
  const p2 = { x: originX + 160, y: originY - plotH + 70 };
  // State 3: End of adiabatic expansion down to TC (V increased to V3)
  const p3 = { x: originX + 320, y: originY - 30 };
  // State 4: End of isothermal compression at TC (V decreased to V4)
  const p4 = { x: originX + 140, y: originY - 70 };

  // Fill enclosed work area with amber glow
  ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.quadraticCurveTo((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 10, p2.x, p2.y);
  ctx.quadraticCurveTo((p2.x + p3.x) / 2, (p2.y + p3.y) / 2 - 10, p3.x, p3.y);
  ctx.quadraticCurveTo((p3.x + p4.x) / 2, (p3.y + p4.y) / 2 + 10, p4.x, p4.y);
  ctx.quadraticCurveTo((p4.x + p1.x) / 2, (p4.y + p1.y) / 2 + 10, p1.x, p1.y);
  ctx.closePath();
  ctx.fill();

  // Curve 1 -> 2: Isothermal Expansion at TH (Ruby Red)
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.quadraticCurveTo((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 10, p2.x, p2.y);
  ctx.stroke();

  // Curve 2 -> 3: Adiabatic Expansion TH -> TC (Orange)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.quadraticCurveTo((p2.x + p3.x) / 2, (p2.y + p3.y) / 2 - 10, p3.x, p3.y);
  ctx.stroke();

  // Curve 3 -> 4: Isothermal Compression at TC (Cyan/Blue)
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.quadraticCurveTo((p3.x + p4.x) / 2, (p3.y + p4.y) / 2 + 10, p4.x, p4.y);
  ctx.stroke();

  // Curve 4 -> 1: Adiabatic Compression TC -> TH (Purple)
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.quadraticCurveTo((p4.x + p1.x) / 2, (p4.y + p1.y) / 2 + 10, p1.x, p1.y);
  ctx.stroke();

  // State labels
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillStyle = '#EF4444';
  ctx.fillText('1 (TH)', p1.x - 10, p1.y - 8);
  ctx.fillText('2 (TH)', p2.x + 8, p2.y - 6);
  ctx.fillStyle = '#0062FF';
  ctx.fillText('3 (TC)', p3.x + 8, p3.y + 12);
  ctx.fillText('4 (TC)', p4.x - 18, p4.y + 16);

  // Net Work Label in loop center
  ctx.fillStyle = '#D97706';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText(`Net Work ∮ P·dV = ${W_net.toFixed(0)} J`, (p1.x + p3.x) / 2, (p1.y + p3.y) / 2);

  // Animated tracer bead moving through the 4 stages
  const cycleT = (t * 0.4) % 4;
  let beadX = p1.x;
  let beadY = p1.y;
  let stageName = '';

  if (cycleT < 1) {
    const s = cycleT;
    beadX = p1.x + s * (p2.x - p1.x);
    beadY = p1.y + s * (p2.y - p1.y);
    stageName = '1→2: Isothermal Expansion (Heat In Q_H)';
  } else if (cycleT < 2) {
    const s = cycleT - 1;
    beadX = p2.x + s * (p3.x - p2.x);
    beadY = p2.y + s * (p3.y - p2.y);
    stageName = '2→3: Adiabatic Expansion (Gas Cools)';
  } else if (cycleT < 3) {
    const s = cycleT - 2;
    beadX = p3.x + s * (p4.x - p3.x);
    beadY = p3.y + s * (p4.y - p3.y);
    stageName = '3→4: Isothermal Compression (Heat Out Q_C)';
  } else {
    const s = cycleT - 3;
    beadX = p4.x + s * (p1.x - p4.x);
    beadY = p4.y + s * (p1.y - p4.y);
    stageName = '4→1: Adiabatic Compression (Gas Heats)';
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(beadX, beadY, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Active stage banner
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText(stageName, originX + plotW / 2, 28);

  onTelem({
    carnot_efficiency: `${(eta * 100).toFixed(1)}% (1 - TC/TH, r = ${r.toFixed(1)})`,
    work_per_cycle: `${W_net.toFixed(0)} J`,
    heat_input: `${QH.toFixed(0)} J (from ${TH} K)`,
    heat_rejected: `${QC.toFixed(0)} J (to ${TC} K)`
  });
}

function renderHeatConduction(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  p: Record<string, number>,
  t: number,
  onTelem: (t: Record<string, string>) => void
) {
  const TH = p.t_hot_source ?? 160; // °C
  const TC = p.t_cold_sink ?? 20; // °C
  const k = p.conductivity_k ?? 205; // W/m·K
  const L_cm = p.bar_length ?? 15; // cm

  const L_m = L_cm / 100;
  const deltaT = TH - TC;
  const grad = deltaT / L_m; // °C / m
  const area_m2 = 0.0025; // 5cm x 5cm cross-section
  const heatFlux_W = k * area_m2 * grad; // Fourier's Law: dQ/dt = k*A*grad

  const barStartX = 110;
  const barW = Math.min(460, 100 + L_cm * 12);
  const barEndX = barStartX + barW;
  const barY = 175;
  const barH = 75;

  // 1. Hot Reservoir on Left
  const hotGrad = ctx.createLinearGradient(barStartX - 60, barY, barStartX, barY);
  hotGrad.addColorStop(0, '#DC2626');
  hotGrad.addColorStop(1, '#EF4444');
  ctx.fillStyle = hotGrad;
  ctx.fillRect(barStartX - 60, barY - 15, 60, barH + 30);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('HOT SINK', barStartX - 30, barY + 28);
  ctx.fillText(`${TH}°C`, barStartX - 30, barY + 46);

  // 2. Cold Sink on Right
  const coldGrad = ctx.createLinearGradient(barEndX, barY, barEndX + 60, barY);
  coldGrad.addColorStop(0, '#00E5FF');
  coldGrad.addColorStop(1, '#0284C7');
  ctx.fillStyle = coldGrad;
  ctx.fillRect(barEndX, barY - 15, 60, barH + 30);

  ctx.fillStyle = '#0F172A';
  ctx.fillText('COLD SINK', barEndX + 30, barY + 28);
  ctx.fillText(`${TC}°C`, barEndX + 30, barY + 46);

  // 3. Conduction Bar with Thermal Gradient
  const barGrad = ctx.createLinearGradient(barStartX, 0, barEndX, 0);
  barGrad.addColorStop(0, '#EF4444');
  barGrad.addColorStop(0.35, '#F59E0B');
  barGrad.addColorStop(0.7, '#64748B');
  barGrad.addColorStop(1, '#00E5FF');

  ctx.fillStyle = barGrad;
  ctx.fillRect(barStartX, barY, barW, barH);
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.strokeRect(barStartX, barY, barW, barH);

  // 4. Moving heat flux carriers (phonons/electrons)
  const carrierSpeed = Math.min(5, 0.5 + (heatFlux_W / 100) * 1.5);
  ctx.fillStyle = '#FDE047';
  const numCarriers = 24;
  for (let i = 0; i < numCarriers; i++) {
    const cx = barStartX + ((i * 22 + t * 45 * carrierSpeed) % barW);
    const cy = barY + 12 + ((i * 17) % (barH - 24));

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Heat trail
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 10 * carrierSpeed, cy);
    ctx.stroke();
  }

  // 5. Temperature Profile Graph Above Bar
  const graphH = 65;
  const graphY = barY - 75;

  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(barStartX, graphY + graphH);
  ctx.lineTo(barEndX, graphY + graphH);
  ctx.stroke();

  // Linear T(x) drop line
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(barStartX, graphY + 10);
  ctx.lineTo(barEndX, graphY + graphH - 5);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText('Temperature Profile: T(x) = T_H - (ΔT/L)·x', barStartX, graphY - 6);

  let materialName = 'Custom';
  if (k >= 350) materialName = 'Copper (k ≈ 385 W/m·K)';
  else if (k >= 180) materialName = 'Aluminum (k ≈ 205 W/m·K)';
  else if (k >= 40) materialName = 'Iron/Steel (k ≈ 50 W/m·K)';
  else materialName = 'Thermal Insulator / Glass';

  onTelem({
    heat_flux: `${heatFlux_W.toFixed(1)} W (Joules/s)`,
    temp_gradient: `${grad.toFixed(1)} °C/m`,
    material_spec: materialName,
    midpoint_temp: `${((TH + TC) / 2).toFixed(1)} °C`
  });
}

function renderDefaultFallback(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#64748B';
  ctx.font = '14px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('Simulation Initializing...', w / 2, h / 2);
}
