import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  PenTool,
  Eye,
  EyeOff,
  Flame,
  Radio
} from 'lucide-react';

interface PresenterModeOverlayProps {
  isActive: boolean;
  onClose: () => void;
  simulationName: string;
  topicTitle: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  telemetry: Record<string, string>;
  children?: React.ReactNode;
}

export const PresenterModeOverlay: React.FC<PresenterModeOverlayProps> = ({
  isActive,
  onClose,
  simulationName,
  topicTitle,
  isPlaying,
  onTogglePlay,
  onReset,
  telemetry,
  children
}) => {
  const [toolMode, setToolMode] = useState<'none' | 'laser' | 'pen'>('none');
  const [penColor, setPenColor] = useState<string>('#EF4444');
  const [hideTelemetryForClass, setHideTelemetryForClass] = useState<boolean>(false);
  const [revealedItems, setRevealedItems] = useState<Record<string, boolean>>({});

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Resize canvas to match window
  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isActive]);

  const clearDrawings = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode !== 'pen') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode === 'laser') {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }

    if (toolMode === 'pen' && isDrawing) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 10, 25, 0.96)',
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        userSelect: 'none'
      }}
    >
      {/* Top Smartboard Header */}
      <div
        style={{
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(10, 20, 45, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={14} className="animate-pulse" />
            Classroom Presenter HUD
          </div>
          <div>
            <span style={{ fontSize: '0.80rem', color: '#94A3B8' }}>{topicTitle} — </span>
            <strong style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>{simulationName}</strong>
          </div>
        </div>

        {/* Presenter Tools Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Laser Pointer Toggle */}
          <button
            type="button"
            onClick={() => setToolMode(toolMode === 'laser' ? 'none' : 'laser')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: toolMode === 'laser' ? '2px solid #EF4444' : '1px solid rgba(255,255,255,0.2)',
              background: toolMode === 'laser' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Flame size={15} color="#EF4444" />
            Laser Pointer
          </button>

          {/* Smartboard Pen Toggle */}
          <button
            type="button"
            onClick={() => setToolMode(toolMode === 'pen' ? 'none' : 'pen')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: toolMode === 'pen' ? `2px solid ${penColor}` : '1px solid rgba(255,255,255,0.2)',
              background: toolMode === 'pen' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PenTool size={15} color={penColor} />
            Smartboard Pen
          </button>

          {/* Color Switcher if Pen active */}
          {toolMode === 'pen' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
              {['#EF4444', '#06B6D4', '#F59E0B', '#FFFFFF'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPenColor(c)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: c,
                    border: penColor === c ? '2px solid #FFFFFF' : 'none',
                    cursor: 'pointer'
                  }}
                  aria-label={`Select ${c} pen`}
                />
              ))}
              <button
                type="button"
                onClick={clearDrawings}
                title="Clear all drawings"
                style={{
                  padding: '2px 8px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Hide/Reveal Telemetry Spoilers for Class Q&A */}
          <button
            type="button"
            onClick={() => {
              setHideTelemetryForClass(!hideTelemetryForClass);
              setRevealedItems({});
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: hideTelemetryForClass ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Hide calculated outputs so students predict them first"
          >
            {hideTelemetryForClass ? <EyeOff size={15} color="#F59E0B" /> : <Eye size={15} />}
            {hideTelemetryForClass ? 'Telemetry Hidden (Class Mode)' : 'Hide Spoilers'}
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={onTogglePlay}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: isPlaying ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
              color: isPlaying ? '#F87171' : '#34D399',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? 'Pause' : 'Resume'}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            title="Reset Simulation"
          >
            <RotateCcw size={15} />
          </button>

          {/* Close Presenter */}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.8)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={16} /> Exit
          </button>
        </div>
      </div>

      {/* Main Presentation Stage & Children */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}

        {/* Freehand Pen & Laser Transparent Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            pointerEvents: toolMode === 'pen' ? 'auto' : 'none',
            cursor: toolMode === 'pen' ? 'crosshair' : 'default'
          }}
        />

        {/* Laser pointer glow dot */}
        {toolMode === 'laser' && laserPos && (
          <div
            style={{
              position: 'fixed',
              left: laserPos.x - 10,
              top: laserPos.y - 10,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 20px 8px rgba(239, 68, 68, 0.8), 0 0 40px 15px rgba(239, 68, 68, 0.4)',
              pointerEvents: 'none',
              zIndex: 30,
              transition: 'transform 0.05s ease-out'
            }}
          />
        )}
      </div>

      {/* Bottom Large High-Visibility Smartboard Telemetry HUD */}
      <div
        style={{
          padding: '14px 32px',
          background: 'rgba(5, 12, 30, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>
            Live Smartboard Telemetry:
          </span>

          {Object.entries(telemetry).map(([k, v]) => {
            const isHidden = hideTelemetryForClass && !revealedItems[k];
            return (
              <div
                key={k}
                onClick={() => {
                  if (hideTelemetryForClass) {
                    setRevealedItems((prev) => ({ ...prev, [k]: !prev[k] }));
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: isHidden ? '1px dashed #F59E0B' : '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: hideTelemetryForClass ? 'pointer' : 'default'
                }}
              >
                <span style={{ fontSize: '0.80rem', color: '#94A3B8' }}>{k}:</span>
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: isHidden ? '#F59E0B' : '#38BDF8'
                  }}
                >
                  {isHidden ? '[Click to Reveal]' : v}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
          Touch/Pen enabled for Smartboards • Laser dot active on move
        </div>
      </div>
    </div>
  );
};
