import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowUpRight, Zap } from 'lucide-react';

interface HeroLiveSandboxProps {
  onOpenFullLab: () => void;
}

export const HeroLiveSandbox: React.FC<HeroLiveSandboxProps> = ({ onOpenFullLab }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation parameters
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const [speed, setSpeed] = useState<number>(24);
  const [planet, setPlanet] = useState<'earth' | 'moon' | 'mars'>('earth');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

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
    let t = 0;
    const scale = 5.2; // pixels per meter
    const originX = 50;
    const originY = canvas.height - 45;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(canvas.width, originY);
      ctx.stroke();

      // Ground meters markers
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
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

      // 2. Ideal Trajectory Path (Dotted Arc)
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
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
      ctx.strokeStyle = '#7C3AED';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(barrelEndX, barrelEndY);
      ctx.stroke();

      // 4. Projectile Ball & Vectors
      if (isPlaying) {
        t += 0.025;
        if (t > flightTime + 0.4) {
          t = 0; // Loop flight
        }
      }

      const curT = Math.min(t, flightTime);
      const currX = originX + speed * Math.cos(theta) * curT * scale;
      const currY = originY - (speed * Math.sin(theta) * curT - 0.5 * g * curT * curT) * scale;
      const vx = speed * Math.cos(theta);
      const vy = speed * Math.sin(theta) - g * curT;

      // Projectile ball with glow
      ctx.save();
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(currX, currY, 7, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.fillText(`Apex: ${maxHeight.toFixed(1)}m`, apexX - 25, apexY - 8);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [angleDeg, speed, planet, isPlaying, theta, g, flightTime, maxHeight]);

  return (
    <div
      className="glass-card"
      style={{
        width: '100%',
        maxWidth: 720,
        margin: '32px auto 0',
        padding: '20px 24px',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
            LIVE HERO SANDBOX • 2D VECTOR TRAJECTORY
          </span>
        </div>

        {/* Planet Presets */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setPlanet('earth')}
            className={`env-preset-pill ${planet === 'earth' ? 'active' : ''}`}
          >
            🌍 Earth (9.8)
          </button>
          <button
            onClick={() => setPlanet('moon')}
            className={`env-preset-pill ${planet === 'moon' ? 'active' : ''}`}
          >
            🌕 Moon (1.6)
          </button>
          <button
            onClick={() => setPlanet('mars')}
            className={`env-preset-pill ${planet === 'mars' ? 'active' : ''}`}
          >
            🔴 Mars (3.7)
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ width: '100%', height: 230, background: 'rgba(0, 0, 0, 0.03)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={672}
          height={230}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* Controls & Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16, alignItems: 'center' }}>
        {/* Angle Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Launch Angle (θ)</span>
            <strong className="font-mono" style={{ color: 'var(--electric-blue)' }}>{angleDeg}°</strong>
          </div>
          <input
            type="range"
            min={15}
            max={75}
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--electric-blue)' }}
          />
        </div>

        {/* Speed Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Launch Speed (v₀)</span>
            <strong className="font-mono" style={{ color: 'var(--electric-violet)' }}>{speed} m/s</strong>
          </div>
          <input
            type="range"
            min={12}
            max={36}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--electric-violet)' }}
          />
        </div>

        {/* Live Telemetry Chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flex: 1 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Range (R)</div>
            <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--electric-cyan)' }}>
              {totalRange.toFixed(1)}m
            </div>
          </div>
          <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', flex: 1 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Flight Time</div>
            <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {flightTime.toFixed(2)}s
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-glass-card)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isPlaying ? 'Pause' : <Play size={12} />}
            <span>{isPlaying ? 'Freeze' : 'Launch'}</span>
          </button>
          <button
            onClick={() => { setAngleDeg(45); setSpeed(24); setPlanet('earth'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-glass-card)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        <button
          onClick={onOpenFullLab}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: 'linear-gradient(135deg, #0062FF 0%, #7C3AED 100%)',
            color: '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 98, 255, 0.3)'
          }}
        >
          <Zap size={14} />
          <span>Open Full 42-Sim Lab</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
