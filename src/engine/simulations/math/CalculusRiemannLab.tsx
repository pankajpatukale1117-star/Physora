import React, { useState, useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

type FunctionId = 'sin' | 'quadratic' | 'cubic' | 'gaussian' | 'rational';

interface FunctionDef {
  id: FunctionId;
  name: string;
  formulaTex: string;
  f: (x: number) => number;
  df: (x: number) => number;
  integralF: (x: number) => number; // antiderivative
  defaultRange: [number, number];
}

const FUNCTIONS: FunctionDef[] = [
  {
    id: 'sin',
    name: 'Sine Wave',
    formulaTex: 'f(x) = 2.5 sin(x)',
    f: (x) => 2.5 * Math.sin(x),
    df: (x) => 2.5 * Math.cos(x),
    integralF: (x) => -2.5 * Math.cos(x),
    defaultRange: [-4, 4]
  },
  {
    id: 'quadratic',
    name: 'Parabola',
    formulaTex: 'f(x) = 0.5x² - 2',
    f: (x) => 0.5 * x * x - 2,
    df: (x) => x,
    integralF: (x) => (0.5 / 3) * x * x * x - 2 * x,
    defaultRange: [-3.5, 3.5]
  },
  {
    id: 'cubic',
    name: 'Cubic Polynomial',
    formulaTex: 'f(x) = 0.3(x³ - 3x)',
    f: (x) => 0.3 * (x * x * x - 3 * x),
    df: (x) => 0.3 * (3 * x * x - 3),
    integralF: (x) => 0.3 * (0.25 * x * x * x * x - 1.5 * x * x),
    defaultRange: [-3, 3]
  },
  {
    id: 'gaussian',
    name: 'Bell Curve',
    formulaTex: 'f(x) = 3 e^(-x² / 2)',
    f: (x) => 3 * Math.exp(-0.5 * x * x),
    df: (x) => -3 * x * Math.exp(-0.5 * x * x),
    integralF: (x) => 3 * Math.sqrt(Math.PI / 2) * Math.min(1, Math.max(-1, x * 0.7)), // numerical approx
    defaultRange: [-3.5, 3.5]
  },
  {
    id: 'rational',
    name: 'Witch of Agnesi',
    formulaTex: 'f(x) = 4 / (1 + x²)',
    f: (x) => 4 / (1 + x * x),
    df: (x) => (-8 * x) / Math.pow(1 + x * x, 2),
    integralF: (x) => 4 * Math.atan(x),
    defaultRange: [-4, 4]
  }
];

export const CalculusRiemannLab: React.FC = () => {
  const [selectedFuncId, setSelectedFuncId] = useState<FunctionId>('sin');
  const [mode, setMode] = useState<'derivative' | 'integral'>('integral');

  // Derivative Mode Parameters
  const [x0, setX0] = useState(1.0);
  const [deltaX, setDeltaX] = useState(0.8);
  const [showSecant, setShowSecant] = useState(true);

  // Integral Mode Parameters
  const [boundA, setBoundA] = useState(-2.0);
  const [boundB, setBoundB] = useState(2.0);
  const [numRectangles, setNumRectangles] = useState(12);
  const [riemannMethod, setRiemannMethod] = useState<'left' | 'right' | 'mid' | 'trapezoid'>('mid');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFn = FUNCTIONS.find(f => f.id === selectedFuncId) || FUNCTIONS[0];

  // Riemann Sum Calculation
  const riemannCalc = React.useMemo(() => {
    const a = Math.min(boundA, boundB);
    const b = Math.max(boundA, boundB);
    const n = Math.max(1, numRectangles);
    const dx = (b - a) / n;

    let approxSum = 0;
    for (let i = 0; i < n; i++) {
      let evalX = a + i * dx;
      if (riemannMethod === 'left') {
        evalX = a + i * dx;
        approxSum += currentFn.f(evalX) * dx;
      } else if (riemannMethod === 'right') {
        evalX = a + (i + 1) * dx;
        approxSum += currentFn.f(evalX) * dx;
      } else if (riemannMethod === 'mid') {
        evalX = a + (i + 0.5) * dx;
        approxSum += currentFn.f(evalX) * dx;
      } else if (riemannMethod === 'trapezoid') {
        const y1 = currentFn.f(a + i * dx);
        const y2 = currentFn.f(a + (i + 1) * dx);
        approxSum += 0.5 * (y1 + y2) * dx;
      }
    }

    // Exact analytical integral
    const exactArea = currentFn.integralF(b) - currentFn.integralF(a);
    const absError = Math.abs(approxSum - exactArea);
    const errorPct = exactArea !== 0 ? Math.min(100, (absError / Math.abs(exactArea)) * 100) : 0;

    return {
      dx: Math.round(dx * 1000) / 1000,
      approxSum: Math.round(approxSum * 100) / 100,
      exactArea: Math.round(exactArea * 100) / 100,
      errorPct: Math.round(errorPct * 10) / 10
    };
  }, [currentFn, boundA, boundB, numRectangles, riemannMethod]);

  // Render Canvas
  useEffect(() => {
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

    // Coordinate System Setup
    const originX = w * 0.5;
    const originY = h * 0.52;
    const scaleX = (w - 80) / 9; // ~9 units visible
    const scaleY = (h - 80) / 8;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.textAlign = 'center';

    for (let xUnit = -5; xUnit <= 5; xUnit++) {
      if (xUnit === 0) continue;
      const px = originX + xUnit * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
      ctx.fillText(`${xUnit}`, px, originY + 12);
    }

    for (let yUnit = -4; yUnit <= 4; yUnit++) {
      if (yUnit === 0) continue;
      const py = originY - yUnit * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(`${yUnit}`, originX - 6, py + 3);
    }

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // 1. Riemann Rectangles in Integral Mode
    if (mode === 'integral') {
      const a = Math.min(boundA, boundB);
      const b = Math.max(boundA, boundB);
      const n = Math.max(1, numRectangles);
      const dx = (b - a) / n;

      for (let i = 0; i < n; i++) {
        const xLeft = a + i * dx;
        const pxLeft = originX + xLeft * scaleX;
        const rectW = dx * scaleX;

        let evalX = xLeft;
        if (riemannMethod === 'right') evalX = a + (i + 1) * dx;
        else if (riemannMethod === 'mid') evalX = a + (i + 0.5) * dx;
        else if (riemannMethod === 'trapezoid') evalX = a + (i + 0.5) * dx;

        const fVal = currentFn.f(evalX);
        const rectH = fVal * scaleY;
        const pyTop = originY - rectH;

        // Rectangle Fill
        ctx.fillStyle = fVal >= 0 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(244, 63, 94, 0.28)';
        ctx.fillRect(pxLeft, Math.min(originY, pyTop), rectW, Math.abs(rectH));

        // Rectangle Border
        ctx.strokeStyle = fVal >= 0 ? '#38bdf8' : '#f43f5e';
        ctx.lineWidth = 1;
        ctx.strokeRect(pxLeft, Math.min(originY, pyTop), rectW, Math.abs(rectH));
      }

      // Bound Lines
      const pxA = originX + boundA * scaleX;
      const pxB = originX + boundB * scaleX;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(pxA, 20); ctx.lineTo(pxA, h - 20);
      ctx.moveTo(pxB, 20); ctx.lineTo(pxB, h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'center';
      ctx.fillText(`a = ${boundA.toFixed(1)}`, pxA, originY - 14);
      ctx.fillText(`b = ${boundB.toFixed(1)}`, pxB, originY - 14);
    }

    // 2. Continuous Function Curve
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= w; px += 2) {
      const xVal = (px - originX) / scaleX;
      const yVal = currentFn.f(xVal);
      const py = originY - yVal * scaleY;
      if (!started) { ctx.moveTo(px, py); started = true; }
      else { ctx.lineTo(px, py); }
    }
    ctx.stroke();

    // 3. Tangent & Secant Lines in Derivative Mode
    if (mode === 'derivative') {
      const y0 = currentFn.f(x0);
      const slope = currentFn.df(x0);
      const px0 = originX + x0 * scaleX;
      const py0 = originY - y0 * scaleY;

      // Tangent line: y - y0 = m * (x - x0)
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const tanX1 = x0 - 2.5;
      const tanY1 = y0 + slope * (tanX1 - x0);
      const tanX2 = x0 + 2.5;
      const tanY2 = y0 + slope * (tanX2 - x0);
      ctx.moveTo(originX + tanX1 * scaleX, originY - tanY1 * scaleY);
      ctx.lineTo(originX + tanX2 * scaleX, originY - tanY2 * scaleY);
      ctx.stroke();

      // Secant line if deltaX is active
      if (showSecant && Math.abs(deltaX) > 0.05) {
        const x1 = x0 + deltaX;
        const y1 = currentFn.f(x1);
        const secSlope = (y1 - y0) / deltaX;
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);

        const secX1 = x0 - 2.2;
        const secY1 = y0 + secSlope * (secX1 - x0);
        const secX2 = x1 + 2.2;
        const secY2 = y1 + secSlope * (secX2 - x1);

        ctx.beginPath();
        ctx.moveTo(originX + secX1 * scaleX, originY - secY1 * scaleY);
        ctx.lineTo(originX + secX2 * scaleX, originY - secY2 * scaleY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Point (x0 + dx, y1)
        const px1 = originX + x1 * scaleX;
        const py1 = originY - y1 * scaleY;
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(px1, py1, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Point (x0, y0)
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(px0, py0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }, [currentFn, mode, x0, deltaX, showSecant, boundA, boundB, numRectangles, riemannMethod]);

  const handlePointerDownCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const originX = rect.width * 0.5;
    const scaleX = (rect.width - 80) / 9;
    const clickX = (px - originX) / scaleX;

    if (mode === 'derivative') {
      setX0(Math.max(-4, Math.min(4, Math.round(clickX * 10) / 10)));
    } else {
      // Reposition nearest bound
      if (Math.abs(clickX - boundA) < Math.abs(clickX - boundB)) {
        setBoundA(Math.max(-4.5, Math.min(4.5, Math.round(clickX * 10) / 10)));
      } else {
        setBoundB(Math.max(-4.5, Math.min(4.5, Math.round(clickX * 10) / 10)));
      }
    }
  };

  return (
    <div
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
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid #a855f7',
              color: '#c084fc',
              fontWeight: 800,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Activity size={13} />
            <span>FLAGSHIP MATHEMATICS LAB</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>
            Calculus: Derivative Tangents &amp; Riemann Definite Integrals
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setMode('integral')}
            style={{
              padding: '4px 10px',
              borderRadius: 5,
              background: mode === 'integral' ? '#0284c7' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: mode === 'integral' ? '#fff' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ∫ Integral Area
          </button>

          <button
            type="button"
            onClick={() => setMode('derivative')}
            style={{
              padding: '4px 10px',
              borderRadius: 5,
              background: mode === 'derivative' ? '#059669' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: mode === 'derivative' ? '#fff' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            d/dx Derivative Slope
          </button>
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
          {/* Function Selector */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4, fontWeight: 700 }}>
              CHOOSE FUNCTION f(x):
            </div>
            <select
              value={selectedFuncId}
              onChange={(e) => setSelectedFuncId(e.target.value as FunctionId)}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 5,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              {FUNCTIONS.map(f => (
                <option key={f.id} value={f.id}>{f.name}: {f.formulaTex}</option>
              ))}
            </select>
          </div>

          {/* Integral Mode Controls */}
          {mode === 'integral' ? (
            <>
              {/* Bounds a and b */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Lower Bound (a): {boundA.toFixed(1)}</div>
                  <input
                    type="range"
                    min={-4}
                    max={0}
                    step={0.2}
                    value={boundA}
                    onChange={(e) => setBoundA(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#facc15' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Upper Bound (b): {boundB.toFixed(1)}</div>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={0.2}
                    value={boundB}
                    onChange={(e) => setBoundB(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#facc15' }}
                  />
                </div>
              </div>

              {/* Number of Rectangles N */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
                  <span style={{ color: '#cbd5e1' }}>Partitions (N rectangles):</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {numRectangles} (Δx = {riemannCalc.dx})
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={numRectangles}
                  onChange={(e) => setNumRectangles(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>

              {/* Riemann Rule Selector */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 4 }}>
                  Summation Rule:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {(['mid', 'trapezoid', 'left', 'right'] as const).map(rule => (
                    <button
                      key={rule}
                      type="button"
                      onClick={() => setRiemannMethod(rule)}
                      style={{
                        padding: '4px',
                        borderRadius: 4,
                        background: riemannMethod === rule ? '#0284c7' : 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: riemannMethod === rule ? '#fff' : '#94a3b8',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {rule === 'mid' ? 'Midpoint Sum' : rule === 'trapezoid' ? 'Trapezoidal' : `${rule} Sum`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Integral Results & Error % */}
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
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>RIEMANN SUM APPROXIMATION:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                    ∑ f(xᵢ) Δx = {riemannCalc.approxSum}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>EXACT DEFINITE INTEGRAL:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ade80', fontFamily: 'monospace' }}>
                    ∫ f(x) dx = {riemannCalc.exactArea}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 4 }}>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Approximation Error:</span>
                    <span style={{ color: riemannCalc.errorPct < 1 ? '#4ade80' : '#fbbf24', fontWeight: 700 }}>
                      {riemannCalc.errorPct}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Derivative Mode Controls */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
                  <span style={{ color: '#cbd5e1' }}>Tangent Point (x₀):</span>
                  <span style={{ fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                    x₀ = {x0.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-3.5}
                  max={3.5}
                  step={0.1}
                  value={x0}
                  onChange={(e) => setX0(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4ade80' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 2 }}>
                  <span style={{ color: '#cbd5e1' }}>Secant Step (Δx):</span>
                  <span style={{ fontWeight: 700, color: '#fb923c', fontFamily: 'monospace' }}>
                    Δx = {deltaX.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={2.0}
                  step={0.05}
                  value={deltaX}
                  onChange={(e) => setDeltaX(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fb923c' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Show Secant Chord:</span>
                <button
                  type="button"
                  onClick={() => setShowSecant(!showSecant)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: showSecant ? 'rgba(251, 146, 60, 0.25)' : 'rgba(255,255,255,0.06)',
                    border: showSecant ? '1px solid #fb923c' : '1px solid rgba(255,255,255,0.1)',
                    color: showSecant ? '#fb923c' : '#94a3b8'
                  }}
                >
                  {showSecant ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {/* Derivative Results */}
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
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>INSTANTANEOUS SLOPE f'(x₀):</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ade80', fontFamily: 'monospace' }}>
                    m = {currentFn.df(x0).toFixed(3)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SECANT AVERAGE RATE OF CHANGE:</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fb923c', fontFamily: 'monospace' }}>
                    Δy / Δx = {((currentFn.f(x0 + deltaX) - currentFn.f(x0)) / deltaX).toFixed(3)}
                  </div>
                </div>

                <div style={{ fontSize: '0.65rem', color: '#cbd5e1', lineHeight: 1.4, marginTop: 4 }}>
                  As Δx → 0, the secant line (orange) converges perfectly onto the tangent line (green), demonstrating the fundamental limit definition of the derivative!
                </div>
              </div>
            </>
          )}
        </div>

        {/* Canvas Plotting Viewport */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDownCanvas}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          title="Click to reposition points / bounds"
        />

        <div
          style={{
            position: 'absolute',
            bottom: 14,
            right: 14,
            padding: '6px 12px',
            borderRadius: 6,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.7rem',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}
        >
          🖱 Click on canvas to reposition {mode === 'derivative' ? 'point x₀' : 'integral bounds [a, b]'}
        </div>
      </div>
    </div>
  );
};
