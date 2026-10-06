import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Move } from 'lucide-react';

interface InstrumentProps {
  onClose: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Interactive Draggable & Rotatable Metric Ruler
 */
export const VirtualRuler: React.FC<InstrumentProps> = ({ onClose }) => {
  const [pos, setPos] = useState({ x: 60, y: 120 });
  const [angle, setAngle] = useState(0); // in degrees
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initX: 0, initY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initX: pos.x,
      initY: pos.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({
      x: dragStartRef.current.initX + dx,
      y: dragStartRef.current.initY + dy
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 320,
        height: 54,
        background: 'rgba(240, 249, 255, 0.88)',
        border: '1.5px solid rgba(14, 165, 233, 0.6)',
        borderRadius: 4,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(4px)',
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'top left',
        userSelect: 'none',
        zIndex: 40,
        touchAction: 'none'
      }}
    >
      {/* Top Handle Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: '100%',
          height: 20,
          background: 'rgba(14, 165, 233, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontWeight: 700, color: '#0369a1' }}>
          <Move size={10} />
          <span>RULER (30 cm)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setAngle((a) => (a + 15) % 360); }}
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: 3,
              background: '#e0f2fe',
              border: '1px solid #7dd3fc',
              color: '#0369a1',
              cursor: 'pointer'
            }}
            title="Rotate 15 degrees"
          >
            {angle}° ↻
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: '#0369a1', cursor: 'pointer', padding: 0 }}
            title="Close ruler"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Metric Tick Marks (0 - 30 cm scale) */}
      <div style={{ width: '100%', height: 34, position: 'relative', overflow: 'hidden' }}>
        {Array.from({ length: 31 }).map((_, cm) => {
          const leftPercent = (cm / 30) * 100;
          return (
            <div
              key={cm}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                bottom: 0,
                width: 1,
                height: cm % 5 === 0 ? 22 : 12,
                background: '#0284c7'
              }}
            >
              {cm % 5 === 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: -6,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: '#0369a1',
                    fontFamily: 'monospace'
                  }}
                >
                  {cm}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Interactive Draggable Protractor (0 - 180 degrees)
 */
export const VirtualProtractor: React.FC<InstrumentProps> = ({ onClose }) => {
  const [pos, setPos] = useState({ x: 200, y: 140 });
  const [angle, setAngle] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initX: 0, initY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initX: pos.x,
      initY: pos.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({
      x: dragStartRef.current.initX + dx,
      y: dragStartRef.current.initY + dy
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 220,
        height: 120,
        background: 'rgba(240, 253, 250, 0.85)',
        border: '1.5px solid rgba(13, 148, 136, 0.6)',
        borderTopLeftRadius: 110,
        borderTopRightRadius: 110,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(4px)',
        transform: `rotate(${angle}deg)`,
        userSelect: 'none',
        zIndex: 40,
        touchAction: 'none'
      }}
    >
      {/* Drag & Controls Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'absolute',
          bottom: 2,
          left: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isDragging ? 'grabbing' : 'grab',
          background: 'rgba(13, 148, 136, 0.15)',
          borderRadius: 4,
          padding: '2px 6px'
        }}
      >
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0f766e' }}>
          PROTRACTOR: {needleAngle}°
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            onClick={() => setAngle((a) => (a + 15) % 360)}
            style={{
              fontSize: '0.6rem',
              padding: '1px 4px',
              borderRadius: 3,
              background: '#ccfbf1',
              border: '1px solid #99f6e4',
              color: '#0f766e',
              cursor: 'pointer'
            }}
          >
            ↻
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#0f766e', cursor: 'pointer', padding: 0 }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Degree ticks (0 - 180 deg) */}
      <svg
        viewBox="0 0 220 110"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.bottom;
          const deg = Math.round(Math.atan2(-(e.clientY - centerY), e.clientX - centerX) * (180 / Math.PI));
          if (deg >= 0 && deg <= 180) {
            setNeedleAngle(deg);
          }
        }}
      >
        {Array.from({ length: 19 }).map((_, i) => {
          const deg = i * 10;
          const rad = (deg * Math.PI) / 180;
          const rInner = deg % 30 === 0 ? 82 : 92;
          const rOuter = 104;
          const x1 = 110 + rInner * Math.cos(Math.PI - rad);
          const y1 = 110 - rInner * Math.sin(Math.PI - rad);
          const x2 = 110 + rOuter * Math.cos(Math.PI - rad);
          const y2 = 110 - rOuter * Math.sin(Math.PI - rad);

          return (
            <g key={deg}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0d9488" strokeWidth={deg % 30 === 0 ? 1.5 : 1} />
              {deg % 30 === 0 && (
                <text
                  x={110 + 72 * Math.cos(Math.PI - rad)}
                  y={110 - 72 * Math.sin(Math.PI - rad) + 3}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="600"
                  fill="#0f766e"
                >
                  {deg}°
                </text>
              )}
            </g>
          );
        })}

        {/* Needle Line */}
        <line
          x1={110}
          y1={110}
          x2={110 + 96 * Math.cos((needleAngle * Math.PI) / 180)}
          y2={110 - 96 * Math.sin((needleAngle * Math.PI) / 180)}
          stroke="#ef4444"
          strokeWidth="2"
        />
        <circle cx={110} cy={110} r={4} fill="#ef4444" />
      </svg>
    </div>
  );
};

/**
 * Interactive Virtual Stopwatch with Lap Timer
 */
export const VirtualStopwatch: React.FC<InstrumentProps> = ({ onClose }) => {
  const [pos, setPos] = useState({ x: 30, y: 70 });
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initX: 0, initY: 0 });

  useEffect(() => {
    let timer: number | null = null;
    if (isRunning) {
      const start = performance.now() - elapsedMs;
      timer = window.setInterval(() => {
        setElapsedMs(Math.round(performance.now() - start));
      }, 20);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, elapsedMs]);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initX: pos.x,
      initY: pos.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPos({
      x: dragStartRef.current.initX + dx,
      y: dragStartRef.current.initY + dy
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 170,
        background: 'rgba(15, 23, 42, 0.94)',
        border: '1.5px solid rgba(59, 130, 246, 0.5)',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        padding: '8px 10px',
        userSelect: 'none',
        zIndex: 40,
        touchAction: 'none'
      }}
    >
      {/* Drag Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isDragging ? 'grabbing' : 'grab',
          marginBottom: 6
        }}
      >
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.04em' }}>
          STOPWATCH
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Digital Readout */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 6,
          padding: '6px 8px',
          textAlign: 'center',
          fontSize: '1.15rem',
          fontFamily: 'monospace',
          fontWeight: 800,
          color: isRunning ? '#38bdf8' : '#e2e8f0',
          letterSpacing: '0.05em',
          marginBottom: 8
        }}
      >
        {formatTime(elapsedMs)}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '4px 6px',
            borderRadius: 5,
            background: isRunning ? '#ef4444' : '#22c55e',
            color: '#fff',
            border: 'none',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {isRunning ? <Pause size={10} /> : <Play size={10} />}
          <span>{isRunning ? 'STOP' : 'START'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isRunning) {
              setLaps((prev) => [...prev, elapsedMs]);
            } else {
              setElapsedMs(0);
              setLaps([]);
            }
          }}
          style={{
            padding: '4px 8px',
            borderRadius: 5,
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.7rem',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'LAP' : <RotateCcw size={10} />}
        </button>
      </div>

      {/* Laps List */}
      {laps.length > 0 && (
        <div style={{ marginTop: 6, maxHeight: 48, overflowY: 'auto', fontSize: '0.62rem', color: '#94a3b8' }}>
          {laps.slice(-3).map((l, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
              <span>Lap {idx + 1}</span>
              <span>{formatTime(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
