import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { GraphChannelDef, GraphDataPoint } from '../types';
import { Eye, EyeOff, Maximize2, Minimize2, Trash2 } from 'lucide-react';

interface LiveGraphProps {
  title?: string;
  data: GraphDataPoint[];
  channels: GraphChannelDef[];
  timeWindowSeconds?: number;
  height?: number;
  autoScale?: boolean;
  fixedYRange?: [number, number];
  onClearData?: () => void;
  className?: string;
}

export const LiveGraph: React.FC<LiveGraphProps> = ({
  title = 'Real-Time Telemetry Graph',
  data,
  channels,
  timeWindowSeconds = 10,
  height = 180,
  autoScale = true,
  fixedYRange = [0, 100],
  onClearData,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChannels, setActiveChannels] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    channels.forEach(ch => { initial[ch.key] = true; });
    return initial;
  });
  const [hoverPoint, setHoverPoint] = useState<{
    t: number;
    values: Record<string, number>;
    screenX: number;
    screenY: number;
  } | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle channel visibility
  const toggleChannel = (key: string) => {
    setActiveChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute active Y range
  const { minY, maxY } = useMemo(() => {
    if (!autoScale && fixedYRange) {
      return { minY: fixedYRange[0], maxY: fixedYRange[1] };
    }

    if (data.length === 0) {
      return { minY: fixedYRange ? fixedYRange[0] : 0, maxY: fixedYRange ? fixedYRange[1] : 10 };
    }

    let min = Infinity;
    let max = -Infinity;

    const visibleKeys = channels.filter(ch => activeChannels[ch.key]).map(ch => ch.key);
    if (visibleKeys.length === 0) return { minY: 0, maxY: 10 };

    const recentData = data.slice(-400);
    for (const pt of recentData) {
      for (const k of visibleKeys) {
        const val = pt[k];
        if (typeof val === 'number' && !isNaN(val)) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }

    if (min === Infinity || max === -Infinity) {
      return { minY: 0, maxY: 10 };
    }

    // Add 10% breathing room
    const padding = Math.max(0.1, (max - min) * 0.12);
    return {
      minY: Math.floor((min - padding) * 10) / 10,
      maxY: Math.ceil((max + padding) * 10) / 10
    };
  }, [data, channels, activeChannels, autoScale, fixedYRange]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(100, rect.width);
    const currentHeight = isExpanded ? 320 : height;

    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(currentHeight * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(currentHeight * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const padLeft = 45;
    const padRight = 15;
    const padTop = 15;
    const padBottom = 26;
    const plotW = width - padLeft - padRight;
    const plotH = currentHeight - padTop - padBottom;

    // Background
    ctx.fillStyle = 'rgba(10, 15, 26, 0.9)';
    ctx.fillRect(0, 0, width, currentHeight);

    // Plot area background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(padLeft, padTop, plotW, plotH);

    // Grid lines & Y Ticks
    const numYTicks = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= numYTicks; i++) {
      const frac = i / numYTicks;
      const yVal = maxY - frac * (maxY - minY);
      const py = padTop + frac * plotH;

      ctx.beginPath();
      ctx.moveTo(padLeft, py);
      ctx.lineTo(padLeft + plotW, py);
      ctx.stroke();

      const label = Math.abs(yVal) >= 100 ? yVal.toFixed(0) : Math.abs(yVal) >= 10 ? yVal.toFixed(1) : yVal.toFixed(2);
      ctx.fillText(label, padLeft - 6, py);
    }

    // Determine time range [tMin, tMax]
    const latestT = data.length > 0 ? data[data.length - 1].t : 0;
    const tMax = Math.max(timeWindowSeconds, latestT);
    const tMin = Math.max(0, tMax - timeWindowSeconds);

    // X Ticks
    const numXTicks = 5;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= numXTicks; i++) {
      const frac = i / numXTicks;
      const tVal = tMin + frac * (tMax - tMin);
      const px = padLeft + frac * plotW;

      ctx.beginPath();
      ctx.moveTo(px, padTop);
      ctx.lineTo(px, padTop + plotH);
      ctx.stroke();

      ctx.fillText(`${tVal.toFixed(1)}s`, px, padTop + plotH + 6);
    }

    // Border around plot
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, plotW, plotH);

    // Draw lines for each active channel
    const yRange = Math.max(0.0001, maxY - minY);
    const visibleChannels = channels.filter(ch => activeChannels[ch.key]);

    // Filter data within time window
    const windowPoints = data.filter(pt => pt.t >= tMin - 0.2 && pt.t <= tMax + 0.2);

    for (const ch of visibleChannels) {
      if (windowPoints.length < 2) continue;

      ctx.strokeStyle = ch.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let started = false;
      for (let i = 0; i < windowPoints.length; i++) {
        const pt = windowPoints[i];
        const val = pt[ch.key];
        if (typeof val !== 'number' || isNaN(val)) continue;

        const xFrac = (pt.t - tMin) / (tMax - tMin);
        const yFrac = (val - minY) / yRange;

        const px = padLeft + xFrac * plotW;
        const py = padTop + plotH - yFrac * plotH;

        if (!started) {
          ctx.moveTo(px, Math.max(padTop, Math.min(padTop + plotH, py)));
          started = true;
        } else {
          ctx.lineTo(px, Math.max(padTop, Math.min(padTop + plotH, py)));
        }
      }
      ctx.stroke();

      // Draw glowing end dot at latest point
      if (windowPoints.length > 0) {
        const lastPt = windowPoints[windowPoints.length - 1];
        const lastVal = lastPt[ch.key];
        if (typeof lastVal === 'number' && !isNaN(lastVal)) {
          const xFrac = (lastPt.t - tMin) / (tMax - tMin);
          const yFrac = (lastVal - minY) / yRange;
          const px = padLeft + xFrac * plotW;
          const py = Math.max(padTop, Math.min(padTop + plotH, padTop + plotH - yFrac * plotH));

          ctx.fillStyle = ch.color;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw hover crosshair if active
    if (hoverPoint) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(hoverPoint.screenX, padTop);
      ctx.lineTo(hoverPoint.screenX, padTop + plotH);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [data, channels, activeChannels, minY, maxY, timeWindowSeconds, height, isExpanded, hoverPoint]);

  // Pointer move handler for tooltip
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 45;
    const padRight = 15;
    const plotW = rect.width - padLeft - padRight;

    if (x < padLeft || x > padLeft + plotW) {
      setHoverPoint(null);
      return;
    }

    const latestT = data[data.length - 1].t;
    const tMax = Math.max(timeWindowSeconds, latestT);
    const tMin = Math.max(0, tMax - timeWindowSeconds);
    const frac = (x - padLeft) / plotW;
    const targetT = tMin + frac * (tMax - tMin);

    // Find nearest point
    let closestPt = data[0];
    let minDiff = Infinity;
    for (const pt of data) {
      const diff = Math.abs(pt.t - targetT);
      if (diff < minDiff) {
        minDiff = diff;
        closestPt = pt;
      }
    }

    if (minDiff < 0.8) {
      const vals: Record<string, number> = {};
      channels.forEach(ch => {
        if (typeof closestPt[ch.key] === 'number') {
          vals[ch.key] = closestPt[ch.key];
        }
      });
      setHoverPoint({
        t: closestPt.t,
        values: vals,
        screenX: x,
        screenY: e.clientY - rect.top
      });
    } else {
      setHoverPoint(null);
    }
  };

  const handlePointerLeave = () => {
    setHoverPoint(null);
  };

  return (
    <div
      ref={containerRef}
      className={`live-graph-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 15, 26, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md, 8px)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}
    >
      {/* Top Header & Channels Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>
            {title}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
            ({data.length} pts)
          </span>
        </div>

        {/* Channel Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {channels.map(ch => {
            const isVisible = activeChannels[ch.key];
            return (
              <button
                key={ch.key}
                type="button"
                onClick={() => toggleChannel(ch.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isVisible ? `${ch.color}20` : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isVisible ? ch.color : 'rgba(255, 255, 255, 0.1)'}`,
                  color: isVisible ? ch.color : '#64748b',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Toggle ${ch.label}`}
              >
                {isVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                <span>{ch.label}</span>
                {ch.unit && <span style={{ opacity: 0.8 }}>({ch.unit})</span>}
              </button>
            );
          })}

          {onClearData && (
            <button
              type="button"
              onClick={onClearData}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear graph trace"
            >
              <Trash2 size={12} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isExpanded ? 'Collapse graph' : 'Expand graph'}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div style={{ position: 'relative', width: '100%', height: isExpanded ? 320 : height }}>
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />

        {/* Floating Tooltip */}
        {hoverPoint && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(hoverPoint.screenX + 12, (containerRef.current?.clientWidth || 300) - 140),
              top: Math.max(10, hoverPoint.screenY - 40),
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '0.7rem',
              color: '#fff',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 2 }}>
              t = {hoverPoint.t.toFixed(2)}s
            </div>
            {channels.map(ch => {
              if (hoverPoint.values[ch.key] !== undefined) {
                return (
                  <div key={ch.key} style={{ color: ch.color, fontWeight: 600 }}>
                    {ch.label}: {hoverPoint.values[ch.key].toFixed(2)} {ch.unit || ''}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
