import React, { useEffect, useRef } from 'react';

interface CanvasSimulatorProps {
  simId: string;
  params: Record<string, number>;
  isPlaying: boolean;
  onTelemetryUpdate: (telemetry: Record<string, string>) => void;
}

export const CanvasSimulator: React.FC<CanvasSimulatorProps> = ({
  simId,
  params,
  isPlaying,
  onTelemetryUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

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

        default:
          renderDefaultFallback(ctx, w, h);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [simId, params, isPlaying, onTelemetryUpdate]);

  return (
    <canvas
      ref={canvasRef}
      width={780}
      height={380}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: 'var(--radius-lg)',
        background: '#FFFFFF'
      }}
    />
  );
};

/* ==========================================================================
   HELPER UTILITIES: Grids, Arrows & Axes
   ========================================================================== */

function drawCoordinateGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 98, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 35) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAxes(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = '#94A3B8';
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

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText('X', w - 16, cy + 4);
  ctx.fillText('Y', cx + 6, 26);
  ctx.fillText('(0,0)', cx - 28, cy + 16);
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
  ctx.lineWidth = 2;

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
    ctx.font = '600 11px JetBrains Mono';
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

  // Unit circle
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 98, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Radius arm
  const px = cx + Math.cos(rad) * R;
  const py = cy - Math.sin(rad) * R;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, py);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cosine bar (Horizontal blue)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(px, cy);
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Sine bar (Vertical violet)
  ctx.beginPath();
  ctx.moveTo(px, cy);
  ctx.lineTo(px, py);
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Point on circle
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5FF';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const tanVal = Math.abs(cosVal) > 0.001 ? (sinVal / cosVal).toFixed(3) : 'Undefined';

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
  const distMm = p.jaw_dist ?? 23.4;
  const cy = h / 2;

  // Main Ruler Scale (0 to 60 mm)
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(40, cy - 35, w - 80, 50);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, cy - 35, w - 80, 50);

  // Millimeter ticks
  ctx.fillStyle = '#0F172A';
  for (let mm = 0; mm <= 50; mm++) {
    const tx = 60 + mm * 11;
    const isCm = mm % 10 === 0;
    const tickH = isCm ? 20 : mm % 5 === 0 ? 14 : 8;

    ctx.beginPath();
    ctx.moveTo(tx, cy + 15);
    ctx.lineTo(tx, cy + 15 - tickH);
    ctx.stroke();

    if (isCm) {
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${mm / 10}`, tx - 3, cy + 30);
    }
  }

  // Gripped Object
  const objW = distMm * 11;
  ctx.fillStyle = 'rgba(0, 98, 255, 0.4)';
  ctx.fillRect(60, cy - 25, objW, 30);
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, cy - 25, objW, 30);

  onTelem({
    main_reading: `${Math.floor(distMm)} mm`,
    vernier_reading: `${Math.round((distMm % 1) * 10)} divisions (0.${Math.round((distMm % 1) * 10)} mm)`,
    total_reading: `${distMm.toFixed(1)} mm`
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

  const roadY = 110;

  // 1. Asphalt Road Track with Perspective & Markings
  const roadGrad = ctx.createLinearGradient(0, roadY - 30, 0, roadY + 25);
  roadGrad.addColorStop(0, '#1E293B');
  roadGrad.addColorStop(0.5, '#334155');
  roadGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(20, roadY - 24, w - 40, 48);

  // Road curb edges
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(20, roadY - 24, w - 40, 3);
  ctx.fillRect(20, roadY + 22, w - 40, 3);

  // Dashed white center road line
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.moveTo(20, roadY);
  ctx.lineTo(w - 20, roadY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Distance meter markings along the road curb
  ctx.fillStyle = '#64748B';
  ctx.font = '9px JetBrains Mono';
  for (let m = 0; m <= 60; m += 10) {
    const mx = 60 + m * 10;
    if (mx < w - 40) {
      ctx.fillRect(mx, roadY + 22, 1.5, 6);
      ctx.fillText(`${m}m`, mx - 6, roadY + 38);
    }
  }

  // 2. Realistic Aerodynamic Sports / Lab Car
  const carX = Math.min(w - 90, 60 + s * 10);
  const carY = roadY - 8;
  const carW = 68;
  const carH = 22;

  // Car chassis drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(carX, roadY + 12, 34, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Car Metallic Body Gradient (Electric Cyan / Royal Blue)
  const carGrad = ctx.createLinearGradient(carX - carW / 2, carY - carH, carX + carW / 2, carY);
  carGrad.addColorStop(0, '#00E5FF');
  carGrad.addColorStop(0.4, '#0062FF');
  carGrad.addColorStop(1, '#0038A8');

  ctx.beginPath();
  ctx.moveTo(carX - carW / 2, carY); // Rear bumper
  ctx.lineTo(carX - carW / 2 + 6, carY - 10); // Rear trunk
  ctx.lineTo(carX - carW / 2 + 18, carY - 10); // Rear glass start
  ctx.lineTo(carX - carW / 2 + 28, carY - carH); // Roof rear
  ctx.lineTo(carX + carW / 2 - 20, carY - carH); // Roof front
  ctx.lineTo(carX + carW / 2 - 8, carY - 8); // Windshield down to hood
  ctx.lineTo(carX + carW / 2, carY - 4); // Front nose
  ctx.lineTo(carX + carW / 2, carY); // Front bumper
  ctx.closePath();
  ctx.fillStyle = carGrad;
  ctx.fill();
  ctx.strokeStyle = '#93C5FD';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Dark Tinted Cockpit Windshield & Side Windows
  ctx.beginPath();
  ctx.moveTo(carX - carW / 2 + 20, carY - 10);
  ctx.lineTo(carX - carW / 2 + 28, carY - carH + 2);
  ctx.lineTo(carX + carW / 2 - 22, carY - carH + 2);
  ctx.lineTo(carX + carW / 2 - 10, carY - 8);
  ctx.closePath();
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  // Glass reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(carX - 2, carY - carH + 4);
  ctx.lineTo(carX + 16, carY - 10);
  ctx.stroke();

  // Dual Headlights casting forward illumination beam
  const hlX = carX + carW / 2;
  const hlY = carY - 3;
  const beamGrad = ctx.createLinearGradient(hlX, hlY, hlX + 70, hlY);
  beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
  beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(hlX, hlY - 2);
  ctx.lineTo(hlX + 70, hlY - 10);
  ctx.lineTo(hlX + 70, hlY + 12);
  ctx.lineTo(hlX, hlY + 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(hlX - 2, hlY - 2, 3, 4);

  // Wheels with rotating alloy spokes
  const wheelR = 7;
  const wheelDist = s * 10;
  const wheelAngle = wheelDist / wheelR;

  [-18, 18].forEach(ox => {
    const wx = carX + ox;
    const wy = carY + 2;

    // Tire (Rubber)
    ctx.beginPath();
    ctx.arc(wx, wy, wheelR, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Alloy Rim
    ctx.beginPath();
    ctx.arc(wx, wy, wheelR - 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#94A3B8';
    ctx.fill();

    // Spokes
    ctx.beginPath();
    ctx.moveTo(wx - Math.cos(wheelAngle) * (wheelR - 2.5), wy - Math.sin(wheelAngle) * (wheelR - 2.5));
    ctx.lineTo(wx + Math.cos(wheelAngle) * (wheelR - 2.5), wy + Math.sin(wheelAngle) * (wheelR - 2.5));
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });

  // Dynamic Velocity Vector Arrow on Car
  if (v > 0) {
    const vArrowLen = Math.min(75, v * 5);
    drawArrow(ctx, carX + carW / 2 + 4, carY - 12, carX + carW / 2 + 4 + vArrowLen, carY - 12, '#00E5FF', `v=${v.toFixed(1)} m/s`);
  }

  // 3. Synchronized Dual Kinematic Graphs (s-t and v-t) in lower canvas
  const graphW = 320;
  const graphH = 135;
  const g1X = 50;
  const g2X = w / 2 + 30;
  const gY = 200;

  // Graph 1: Position-Time s(t) = ut + 0.5 a t^2 (Parabolic curve)
  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
  ctx.fillRect(g1X, gY, graphW, graphH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(g1X, gY, graphW, graphH);

  // Graph 1 Axes
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(g1X + 30, gY + 15);
  ctx.lineTo(g1X + 30, gY + graphH - 22);
  ctx.lineTo(g1X + graphW - 15, gY + graphH - 22);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.fillText('s(t) = ut + ½at²', g1X + 35, gY + 18);
  ctx.fillText('s (m)', g1X + 6, gY + 25);
  ctx.fillText('t (s)', g1X + graphW - 25, gY + graphH - 8);

  // Plot s(t) curve
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.2;
  const maxSScale = Math.max(20, u * maxT + 0.5 * Math.abs(a) * maxT * maxT);
  const scaleT1 = (graphW - 55) / maxT;
  const scaleS1 = (graphH - 45) / maxSScale;

  for (let stepT = 0; stepT <= maxT; stepT += 0.1) {
    const curPos = Math.max(0, u * stepT + 0.5 * a * stepT * stepT);
    const px = g1X + 30 + stepT * scaleT1;
    const py = gY + graphH - 22 - curPos * scaleS1;
    if (stepT === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Current s(t) cursor dot
  const curPtX = g1X + 30 + loopT * scaleT1;
  const curPtY = gY + graphH - 22 - s * scaleS1;
  ctx.beginPath();
  ctx.arc(curPtX, curPtY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Graph 2: Velocity-Time v(t) = u + at (Straight Line, Area = Displacement)
  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
  ctx.fillRect(g2X, gY, graphW, graphH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(g2X, gY, graphW, graphH);

  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(g2X + 30, gY + 15);
  ctx.lineTo(g2X + 30, gY + graphH - 22);
  ctx.lineTo(g2X + graphW - 15, gY + graphH - 22);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.fillText('v(t) = u + at (Slope = a)', g2X + 35, gY + 18);
  ctx.fillText('v (m/s)', g2X + 2, gY + 25);
  ctx.fillText('t (s)', g2X + graphW - 25, gY + graphH - 8);

  const maxVScale = Math.max(15, u + Math.abs(a) * maxT);
  const scaleT2 = (graphW - 55) / maxT;
  const scaleV2 = (graphH - 45) / maxVScale;

  // Shaded area under v-t graph up to loopT (representing distance s = ∫ v dt)
  ctx.beginPath();
  ctx.moveTo(g2X + 30, gY + graphH - 22);
  for (let st = 0; st <= loopT; st += 0.1) {
    const curVel = u + a * st;
    const px = g2X + 30 + st * scaleT2;
    const py = gY + graphH - 22 - curVel * scaleV2;
    ctx.lineTo(px, py);
  }
  const curVtX = g2X + 30 + loopT * scaleT2;
  const curVtY = gY + graphH - 22 - v * scaleV2;
  ctx.lineTo(curVtX, gY + graphH - 22);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
  ctx.fill();

  // v(t) line
  ctx.beginPath();
  ctx.strokeStyle = '#7C3AED';
  ctx.lineWidth = 2.2;
  for (let stepT = 0; stepT <= maxT; stepT += 0.1) {
    const curVel = u + a * stepT;
    const px = g2X + 30 + stepT * scaleT2;
    const py = gY + graphH - 22 - curVel * scaleV2;
    if (stepT === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Current v(t) cursor dot
  ctx.beginPath();
  ctx.arc(curVtX, curVtY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#7C3AED';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Label shaded area
  ctx.fillStyle = '#0062FF';
  ctx.font = 'bold 9px JetBrains Mono';
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

  const cycleTime = totalFallTime + 1.0;
  const fallT = t % cycleTime;
  const curT = Math.min(fallT, totalFallTime);
  const curDistanceFallen = 0.5 * g * curT * curT;
  const curHeightAboveGround = Math.max(0, H - curDistanceFallen);
  const curSpeed = g * curT;

  const groundY = h - 45;
  const towerTopY = 55;
  const towerH = groundY - towerTopY;
  const towerX = w / 2 - 80;
  const ballX = towerX + 55;

  // 1. Metric Physics Drop Tower (Steel Truss Architecture)
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(towerX, groundY);
  ctx.lineTo(towerX, towerTopY);
  ctx.lineTo(towerX + 25, towerTopY);
  ctx.lineTo(towerX + 25, groundY);
  ctx.stroke();

  // Tower cross-bracing trusses
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let ty = groundY; ty > towerTopY; ty -= 25) {
    ctx.beginPath();
    ctx.moveTo(towerX, ty);
    ctx.lineTo(towerX + 25, ty - 25);
    ctx.moveTo(towerX + 25, ty);
    ctx.lineTo(towerX, ty - 25);
    ctx.stroke();
  }

  // Tower Metric Scale (0m to H meters)
  ctx.fillStyle = '#64748B';
  ctx.font = '10px JetBrains Mono';
  const numMarks = 5;
  for (let i = 0; i <= numMarks; i++) {
    const frac = i / numMarks;
    const markH = (H * frac).toFixed(0);
    const my = groundY - frac * towerH;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(towerX - 10, my, 10, 1.5);
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${markH}m`, towerX - 38, my + 4);
  }

  // Ground Impact Platform with shock-absorbing springs
  ctx.fillStyle = '#334155';
  ctx.fillRect(towerX - 50, groundY, 220, 12);
  ctx.fillStyle = '#10B981';
  ctx.fillRect(ballX - 25, groundY - 4, 50, 4);

  // Electromagnet at release gantry
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(towerX, towerTopY - 10, 65, 10);
  ctx.fillStyle = '#EC4899';
  ctx.fillRect(ballX - 8, towerTopY, 16, 6);

  // 2. Galileo Strobe Ghost Images (showing distance ratio 1 : 3 : 5 : 7 ...)
  const strobeInterval = 0.25;
  ctx.fillStyle = 'rgba(0, 98, 255, 0.15)';
  for (let st = strobeInterval; st <= curT; st += strobeInterval) {
    const sFall = 0.5 * g * st * st;
    const sy = towerTopY + (sFall / H) * towerH;
    ctx.beginPath();
    ctx.arc(ballX, sy, 7, 0, Math.PI * 2);
    ctx.fill();

    // Time stamp label
    ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
    ctx.font = '8px JetBrains Mono';
    ctx.fillText(`${st.toFixed(2)}s`, ballX + 16, sy + 3);
    ctx.fillStyle = 'rgba(0, 98, 255, 0.15)';
  }

  // 3. Falling Sphere with Realistic Metallic Shading
  const ballY = towerTopY + (curDistanceFallen / H) * towerH;

  // Ball glow
  const ballGrad = ctx.createRadialGradient(ballX - 3, ballY - 3, 2, ballX, ballY, 12);
  ballGrad.addColorStop(0, '#FFFFFF');
  ballGrad.addColorStop(0.3, '#00E5FF');
  ballGrad.addColorStop(0.8, '#0062FF');
  ballGrad.addColorStop(1, '#002B80');

  ctx.beginPath();
  ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
  ctx.fillStyle = ballGrad;
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Gravity vector arrow (pointing down)
  drawArrow(ctx, ballX + 22, ballY, ballX + 22, ballY + 36, '#EC4899', 'g=9.8 m/s²');

  // Velocity vector arrow (length proportional to current speed)
  if (curSpeed > 0) {
    const vLen = Math.min(60, curSpeed * 1.5);
    drawArrow(ctx, ballX - 22, ballY, ballX - 22, ballY + vLen, '#00E5FF', `v=${curSpeed.toFixed(1)} m/s`);
  }

  // 4. Real-Time Telemetry Gauges on Right
  const gaugeX = w / 2 + 110;
  ctx.fillStyle = '#FFFFFF';
  ctx.roundRect(gaugeX, 60, 220, 220, 12);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText('FREE FALL TELEMETRY', gaugeX + 16, 84);

  const drawTelemRow = (lbl: string, val: string, col: string, yPos: number) => {
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(lbl, gaugeX + 16, yPos);
    ctx.fillStyle = col;
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.fillText(val, gaugeX + 16, yPos + 16);
  };

  drawTelemRow('Height Above Ground (h)', `${curHeightAboveGround.toFixed(1)} m`, '#0062FF', 112);
  drawTelemRow('Current Fall Speed (v = gt)', `${curSpeed.toFixed(1)} m/s (${(curSpeed * 3.6).toFixed(0)} km/h)`, '#00E5FF', 154);
  drawTelemRow('Elapsed Time', `${curT.toFixed(2)} s / ${totalFallTime.toFixed(2)} s`, '#7C3AED', 196);
  drawTelemRow('Impact Speed (v² = 2gh)', `${vImpact.toFixed(1)} m/s (${(vImpact * 3.6).toFixed(0)} km/h)`, '#10B981', 238);

  onTelem({
    fall_time: `${totalFallTime.toFixed(2)} s`,
    impact_vel: `${vImpact.toFixed(1)} m/s (${(vImpact * 3.6).toFixed(0)} km/h)`
  });
}

// Detailed helper for realistic railway track
function drawRealisticRailwayTrack(
  ctx: CanvasRenderingContext2D,
  y: number,
  w: number,
  trackOffset: number,
  trackLabel: string
) {
  // 1. Ballast gravel bed (textured trapezoid with subtle grain)
  const ballastTop = y - 16;
  const ballastBottom = y + 26;
  const grad = ctx.createLinearGradient(0, ballastTop, 0, ballastBottom);
  grad.addColorStop(0, '#E2E8F0');
  grad.addColorStop(0.3, '#CBD5E1');
  grad.addColorStop(0.7, '#94A3B8');
  grad.addColorStop(1, '#64748B');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(15, ballastTop, w - 30, ballastBottom - ballastTop, 6);
  ctx.fill();

  // Subtle ballast gravel speckles
  ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
  for (let gx = 25; gx < w - 25; gx += 18) {
    ctx.fillRect(gx + ((gx * 7) % 11), y - 10 + ((gx * 3) % 16), 3, 2);
  }

  // 2. Concrete Sleepers / Ties spaced every 22px
  const sleeperSpacing = 22;
  const sleeperWidth = 10;
  const sleeperHeight = 32;
  const sleeperY = y - 11;
  const startOffset = ((trackOffset % sleeperSpacing) + sleeperSpacing) % sleeperSpacing;

  for (let sx = 20 - sleeperSpacing + startOffset; sx < w - 20; sx += sleeperSpacing) {
    if (sx < 20 || sx > w - 32) continue;
    // Sleeper drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(sx + 1, sleeperY + 2, sleeperWidth, sleeperHeight);

    // Concrete tie body
    const tieGrad = ctx.createLinearGradient(sx, sleeperY, sx + sleeperWidth, sleeperY);
    tieGrad.addColorStop(0, '#CBD5E1');
    tieGrad.addColorStop(0.5, '#F1F5F9');
    tieGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = tieGrad;
    ctx.fillRect(sx, sleeperY, sleeperWidth, sleeperHeight);

    // Fastening Pandrol clips (where rails meet ties)
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx + 2, y - 5, 6, 3);
    ctx.fillRect(sx + 2, y + 12, 6, 3);
  }

  // 3. Parallel Steel Rails (Dual running rails)
  const drawRail = (ry: number) => {
    // Rail shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(20, ry + 3, w - 40, 2);

    // Rail steel body
    const railGrad = ctx.createLinearGradient(0, ry - 3, 0, ry + 3);
    railGrad.addColorStop(0, '#475569');
    railGrad.addColorStop(0.3, '#94A3B8');
    railGrad.addColorStop(0.5, '#FFFFFF'); // Specular steel highlight
    railGrad.addColorStop(0.8, '#64748B');
    railGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = railGrad;
    ctx.fillRect(20, ry - 3, w - 40, 5);
  };

  drawRail(y - 3);  // Upper rail
  drawRail(y + 13); // Lower rail

  // Overhead contact wire (catenary line)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y - 36);
  ctx.lineTo(w - 20, y - 36);
  ctx.stroke();

  // Track label badge on left
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 10px JetBrains Mono';
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
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.roundRect(w / 2 - 230, 8, 460, 40, 8);
  ctx.fill();
  ctx.strokeStyle = frame === 0 ? '#0062FF' : '#EC4899';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = frame === 0 ? '#0062FF' : '#EC4899';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';

  if (frame === 0) {
    ctx.fillText('OBSERVER: Ground Frame (Both trains moving forward)', w / 2, 24);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`vA = ${vA} km/h (${vA_ms.toFixed(1)} m/s)  |  vB = ${vB} km/h (${vB_ms.toFixed(1)} m/s)  |  v(B/A) = ${vRel_kmh >= 0 ? '+' : ''}${vRel_kmh} km/h (${vRel_ms >= 0 ? '+' : ''}${vRel_ms.toFixed(1)} m/s)`, w / 2, 38);
  } else {
    ctx.fillText('OBSERVER: Inside Train A (Moving Reference Frame)', w / 2, 24);
    ctx.fillStyle = '#64748B';
    ctx.font = '10px JetBrains Mono';
    if (vRel_kmh === 0) {
      ctx.fillText('vA = 0 km/h (In your frame) | Train B is COMPLETELY FROZEN alongside you!', w / 2, 38);
    } else if (vRel_kmh > 0) {
      ctx.fillText(`Train A is stationary | Train B is overtaking you at +${vRel_kmh} km/h (+${vRel_ms.toFixed(1)} m/s)`, w / 2, 38);
    } else {
      ctx.fillText(`Train A is stationary | Train B appears to drift BACKWARDS at ${vRel_kmh} km/h`, w / 2, 38);
    }
  }
  ctx.textAlign = 'left';

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
  const cy = h / 2;

  // Track
  ctx.beginPath();
  ctx.moveTo(40, cy + 20);
  ctx.lineTo(w - 40, cy + 20);
  ctx.strokeStyle = mu === 0 ? '#00E5FF' : '#94A3B8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Deceleration a = -mu * g
  const v0 = force * 0.4;
  const a = -mu * 9.8;
  const stopTime = mu > 0 ? v0 / (mu * 9.8) : 999;
  const curT = mu === 0 ? t % 8 : Math.min(t % (stopTime + 1), stopTime);
  const s = mu === 0 ? v0 * curT : v0 * curT + 0.5 * a * curT * curT;
  const px = Math.min(w - 70, 70 + s * 14);

  // Puck
  ctx.beginPath();
  ctx.arc(px, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();

  if (mu > 0 && curT < stopTime) {
    drawArrow(ctx, px, cy, px - 35, cy, '#EC4899', 'f_friction');
  }

  onTelem({
    stop_distance: mu === 0 ? 'Infinite (Inertia in Space)' : `${(s).toFixed(1)} m`,
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

  const cy = h / 2;
  const loopT = (t * 0.6) % 4;
  const pos = 0.5 * a * loopT * loopT;
  const cartX = Math.min(w - 80, 80 + pos * 12);

  // Table
  ctx.beginPath();
  ctx.moveTo(50, cy + 25);
  ctx.lineTo(w - 50, cy + 25);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cart
  ctx.fillStyle = '#0062FF';
  ctx.roundRect(cartX - 30, cy - 10, 60, 30, 4);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText(`${m} kg`, cartX - 14, cy + 8);

  // Pull arrow
  drawArrow(ctx, cartX + 30, cy + 5, cartX + 30 + F * 4, cy + 5, '#10B981', `F=${F}N`);

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

  const cy = h / 2;
  const loopT = (t * 0.8) % 4;
  const pushImpulse = 80;
  const v1 = -pushImpulse / m1;
  const v2 = pushImpulse / m2;

  const x1 = w / 2 - 20 + v1 * loopT * 18;
  const x2 = w / 2 + 20 + v2 * loopT * 18;

  // Track
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, cy + 25);
  ctx.lineTo(w - 40, cy + 25);
  ctx.stroke();

  // Skater 1 (Blue)
  ctx.beginPath();
  ctx.arc(x1, cy, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.fillText(`${m1}kg`, x1 - 12, cy + 4);

  // Skater 2 (Purple)
  ctx.beginPath();
  ctx.arc(x2, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#7C3AED';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${m2}kg`, x2 - 12, cy + 4);

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

  // U-shaped track
  ctx.beginPath();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.quadraticCurveTo(w / 2 - 60, h - 50, w - 220, 100);
  ctx.stroke();

  // Oscillator position
  const oscAngle = Math.sin(t * 2);
  const curHeight = H * (oscAngle * oscAngle);
  const curPE = m * g * curHeight;
  const curKE = Math.max(0, maxPE - curPE);

  const cartX = w / 2 - 60 + oscAngle * 140;
  const cartY = h - 60 - curHeight * 18;

  ctx.beginPath();
  ctx.arc(cartX, cartY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#0062FF';
  ctx.fill();

  // Live Energy Bar Gauges on Right
  const barX = w - 160;
  const barMaxH = 140;

  // KE bar (Blue)
  const keH = (curKE / maxPE) * barMaxH;
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(barX, h - 60 - keH, 24, keH);

  // PE bar (Purple)
  const peH = (curPE / maxPE) * barMaxH;
  ctx.fillStyle = '#7C3AED';
  ctx.fillRect(barX + 35, h - 60 - peH, 24, peH);

  // Total bar (Green)
  ctx.fillStyle = '#10B981';
  ctx.fillRect(barX + 70, h - 60 - barMaxH, 24, barMaxH);

  ctx.fillStyle = '#0F172A';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText('KE', barX + 6, h - 40);
  ctx.fillText('PE', barX + 41, h - 40);
  ctx.fillText('Tot', barX + 72, h - 40);

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
  const work = effF * d;

  const cy = h / 2 + 30;
  const boxX = w / 2 - 80;

  // Floor
  ctx.beginPath();
  ctx.moveTo(50, cy + 25);
  ctx.lineTo(w - 50, cy + 25);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Crate
  ctx.fillStyle = '#0062FF';
  ctx.roundRect(boxX, cy - 25, 50, 50, 4);
  ctx.fill();

  // Rope and angle
  const ropeLen = 90;
  const rx = boxX + 50 + Math.cos(rad) * ropeLen;
  const ry = cy - Math.sin(rad) * ropeLen;

  drawArrow(ctx, boxX + 50, cy, rx, ry, '#EC4899', `F=${F}N`);
  drawArrow(ctx, boxX + 50, cy, boxX + 50 + effF * 1.5, cy, '#10B981', 'F cosθ');

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
  const cy = h / 2;
  const wallX = 60;
  const blockX = w / 2 + oscX * 120;

  // Wall
  ctx.fillStyle = '#64748B';
  ctx.fillRect(wallX - 10, cy - 40, 10, 80);

  // Coiled Spring
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
  ctx.moveTo(wallX, cy);

  const coils = 12;
  const springLen = blockX - 25 - wallX;
  for (let i = 0; i <= coils; i++) {
    const sx = wallX + (i / coils) * springLen;
    const sy = i === 0 || i === coils ? cy : cy + (i % 2 === 0 ? 14 : -14);
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Block
  ctx.fillStyle = '#7C3AED';
  ctx.fillRect(blockX - 25, cy - 25, 50, 50);

  const maxPE = 0.5 * k * A * A;
  const maxV = A * omega;

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

  // 1. Draw Elliptical Orbit Track
  ctx.beginPath();
  ctx.ellipse(cx - c, cy, a, b, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 98, 255, 0.3)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Major axis dashed line
  ctx.beginPath();
  ctx.moveTo(cx - c - a - 15, cy);
  ctx.lineTo(cx - c + a + 15, cy);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
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
  ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
  ctx.fill();

  // 3. Radius Vector Line from Sun to Satellite
  ctx.beginPath();
  ctx.moveTo(sunX, sunY);
  ctx.lineTo(satX, satY);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Glowing Sun at Focus 1
  const sunR = Math.max(14, planetM * 0.14);
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, sunR * 2.2);
  sunGrad.addColorStop(0, '#FFFFFF');
  sunGrad.addColorStop(0.2, '#FEF08A');
  sunGrad.addColorStop(0.6, '#F59E0B');
  sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 2.2, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.fillText('Sun (Focus 1)', sunX - 35, sunY + sunR + 15);

  // 5. Satellite with Solar Panels
  ctx.save();
  ctx.translate(satX, satY);
  // Velocity tangent angle: dx = -a*sin(E)*dE, dy = b*cos(E)*dE
  const vx = -a * Math.sin(E);
  const vy = b * Math.cos(E);
  const vAngle = Math.atan2(vy, vx);
  ctx.rotate(vAngle);

  // Satellite body
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-6, -6, 12, 12);
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(-4, -4, 8, 8);

  // Solar panel wings
  ctx.fillStyle = '#0062FF';
  ctx.fillRect(-18, -4, 11, 8);
  ctx.fillRect(7, -4, 11, 8);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(-18, -4, 11, 8);
  ctx.strokeRect(7, -4, 11, 8);
  ctx.restore();

  // Tangent velocity vector arrow
  const vArrowLen = Math.min(50, curSpeed * 1.5);
  drawArrow(ctx, satX, satY, satX + Math.cos(vAngle) * vArrowLen, satY + Math.sin(vAngle) * vArrowLen, '#00E5FF', `v=${curSpeed.toFixed(1)} km/s`);

  // Perihelion and Aphelion indicators
  const periX = cx - c + a;
  const aphX = cx - c - a;
  ctx.fillStyle = '#10B981';
  ctx.font = '9px JetBrains Mono';
  ctx.fillText(`Perihelion (r_min, v_max=${periSpeed.toFixed(1)})`, periX - 80, cy + 18);
  ctx.fillStyle = '#EC4899';
  ctx.fillText(`Aphelion (r_max, v_min=${aphSpeed.toFixed(1)})`, aphX - 20, cy + 18);

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
  const graphY = 65;
  const graphW = 270;
  const graphH = 220;

  ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
  ctx.fillRect(graphX, graphY, graphW, graphH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(graphX, graphY, graphW, graphH);

  // Graph Axes
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(graphX + 35, graphY + 20);
  ctx.lineTo(graphX + 35, graphY + graphH - 30);
  ctx.lineTo(graphX + graphW - 15, graphY + graphH - 30);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText('Gravity Field g(r)', graphX + 45, graphY + 22);
  ctx.fillText('g', graphX + 15, graphY + 30);
  ctx.fillText('r', graphX + graphW - 20, graphY + graphH - 12);

  // Surface boundary dashed line
  const surfaceGraphX = graphX + 35 + 65;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(surfaceGraphX, graphY + 30);
  ctx.lineTo(surfaceGraphX, graphY + graphH - 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText('R (Surface)', surfaceGraphX - 25, graphY + graphH - 12);

  // Plot g(r) curve
  // Inside Earth: Linear ramp from 0 to g0
  ctx.beginPath();
  ctx.strokeStyle = '#0062FF';
  ctx.lineWidth = 2.5;
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
  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
  ctx.fillRect(startAirX - 10, graphY, w - startAirX - 10, graphH);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.strokeRect(startAirX - 10, graphY, w - startAirX - 10, graphH);

  // Pressure centerline
  const pCenterY = graphY + graphH / 2;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(startAirX - 10, pCenterY);
  ctx.lineTo(w - 20, pCenterY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 10px JetBrains Mono';
  ctx.fillText('Pressure Wave ΔP(x) = ΔP₀ sin(kx - ωt)', startAirX + 10, graphY + 16);
  ctx.fillText('+ΔP (Compression)', startAirX + 10, graphY + 30);
  ctx.fillText('-ΔP (Rarefaction)', startAirX + 10, graphY + graphH - 10);

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
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(startX + 20, h - 50, 14, 4);
  ctx.fillStyle = '#0F172A';
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(`Pulse 1 (Moving Right: A₁ = ${A1}px)`, startX + 40, h - 46);

  ctx.fillStyle = '#7C3AED';
  ctx.fillRect(startX + 260, h - 50, 14, 4);
  ctx.fillStyle = '#0F172A';
  ctx.fillText(`Pulse 2 (Moving Left: A₂ = ${A2}px)`, startX + 280, h - 46);

  ctx.fillStyle = '#0062FF';
  ctx.fillRect(startX + 500, h - 50, 14, 4);
  ctx.fillStyle = '#0F172A';
  ctx.fillText('Composite: y = y₁ + y₂', startX + 520, h - 46);

  const isConstructive = (A1 > 0 && A2 > 0) || (A1 < 0 && A2 < 0);
  const maxCombinedAmp = Math.abs(A1 + A2);

  onTelem({
    interference_type: isConstructive ? 'Constructive Interference (Peaks Combine)' : 'Destructive Interference (Waves Cancel)',
    combined_amp: `Max Peak: ${maxCombinedAmp} px`
  });
}

function renderDefaultFallback(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#64748B';
  ctx.font = '14px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('Simulation Initializing...', w / 2, h / 2);
}
