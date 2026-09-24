import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface SimulationCurriculumProps {
  onEnterLabClick: () => void;
}

export const SimulationCurriculum: React.FC<SimulationCurriculumProps> = ({ onEnterLabClick }) => {
  const [filter, setFilter] = useState<'all' | 'physics' | 'maths'>('all');

  return (
    <section
      id="simulations"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '90px 24px 80px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 50px' }}>
          <div className="lab-pill-badge" style={{ marginBottom: 16 }}>
            <span>⚛️ HIGH-YIELD JEE ADVANCED EXPERIMENTS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.3rem, 4vw, 3.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 16
            }}
          >
            Precision Simulations for <span className="gradient-text">JEE Aspirants</span>
          </h2>

          <p
            style={{
              fontSize: '1.08rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 32
            }}
          >
            Built to deconstruct the most conceptually demanding problems in Mechanics, Electrodynamics, Calculus, and 3D Vectors.
          </p>

          {/* Filter Pills */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(241, 245, 249, 0.8)',
              backdropFilter: 'blur(12px)',
              padding: '6px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: filter === 'all' ? '#FFFFFF' : 'transparent',
                color: filter === 'all' ? 'var(--electric-blue)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              All Simulations (6)
            </button>
            <button
              onClick={() => setFilter('physics')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: filter === 'physics' ? '#FFFFFF' : 'transparent',
                color: filter === 'physics' ? 'var(--electric-blue)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: filter === 'physics' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Physics Modules
            </button>
            <button
              onClick={() => setFilter('maths')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                background: filter === 'maths' ? '#FFFFFF' : 'transparent',
                color: filter === 'maths' ? 'var(--electric-violet)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: filter === 'maths' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Mathematics Lab
            </button>
          </div>
        </div>

        {/* 6 High-Fidelity Simulation Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 28,
            marginBottom: 48
          }}
        >
          {/* CARD 1: PHYSICS - Projectile Motion */}
          {(filter === 'all' || filter === 'physics') && (
            <div className="glass-card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--electric-blue)',
                    background: 'rgba(0, 98, 255, 0.08)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  PHYSICS • KINEMATICS
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>JEE Advanced</span>
              </div>
              <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Projectile Motion & Drag Vectors
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Dynamic velocity vector decomposition into orthogonal components <em>v<sub>x</sub> = u cosθ</em> and <em>v<sub>y</sub> = u sinθ - gt</em> with live aerodynamic drag envelope.
              </p>
              {/* Interactive Micro Canvas */}
              <MiniProjectileCanvas />
              {/* Formula */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  borderLeft: '3px solid var(--electric-blue)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  marginTop: 14,
                  marginBottom: 16
                }}
              >
                y = x tanθ - [g x² / (2 u² cos²θ)]
              </div>
              <button
                onClick={onEnterLabClick}
                className="btn-secondary-lab"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 'auto' }}
              >
                <Play size={14} color="#0062FF" fill="#0062FF" />
                <span>Launch Interactive Module</span>
              </button>
            </div>
          )}

          {/* CARD 2: PHYSICS - Electric Field Lines */}
          {(filter === 'all' || filter === 'physics') && (
            <div className="glass-card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--electric-blue)',
                    background: 'rgba(0, 98, 255, 0.08)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  PHYSICS • ELECTRODYNAMICS
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>JEE Advanced</span>
              </div>
              <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Electric Field & Coulomb Dipoles
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Visualize Gauss's Law flux, equipotential surfaces, and electric field intensity vectors <strong>E⃗ = Σ kqᵢ / rᵢ² r̂ᵢ</strong> between opposite and like charges.
              </p>
              <MiniFieldCanvas />
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  borderLeft: '3px solid var(--electric-cyan)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  marginTop: 14,
                  marginBottom: 16
                }}
              >
                ∮ E⃗ · dA⃗ = Q_enc / ε₀  •  p⃗ = q · 2a⃗
              </div>
              <button
                onClick={onEnterLabClick}
                className="btn-secondary-lab"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 'auto' }}
              >
                <Play size={14} color="#0062FF" fill="#0062FF" />
                <span>Launch Interactive Module</span>
              </button>
            </div>
          )}

          {/* CARD 3: PHYSICS - Circular Motion */}
          {(filter === 'all' || filter === 'physics') && (
            <div className="glass-card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--electric-blue)',
                    background: 'rgba(0, 98, 255, 0.08)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  PHYSICS • MECHANICS
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>JEE Advanced</span>
              </div>
              <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Circular Motion & Banked Tracks
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Simulate centripetal acceleration <strong>a_c = ω²R</strong>, dynamic banking angles tanθ = v²/(Rg), and non-inertial pseudo centrifugal forces on curved roads.
              </p>
              <MiniCircularCanvas />
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  borderLeft: '3px solid var(--electric-blue)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  marginTop: 14,
                  marginBottom: 16
                }}
              >
                tanθ = v² / (R g)  •  a⃗_c = -(v² / R) r̂
              </div>
              <button
                onClick={onEnterLabClick}
                className="btn-secondary-lab"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 'auto' }}
              >
                <Play size={14} color="#0062FF" fill="#0062FF" />
                <span>Launch Interactive Module</span>
              </button>
            </div>
          )}

          {/* CARD 4: MATHS - Calculus Visualizer */}
          {(filter === 'all' || filter === 'maths') && (
            <div className="glass-card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--electric-violet)',
                    background: 'rgba(124, 58, 237, 0.08)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  MATHEMATICS • INTEGRAL CALCULUS
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>JEE Advanced</span>
              </div>
              <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Calculus Visualizer: Riemann Sums
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Experience definite integrals converging from discrete upper/lower Darboux rectangles into continuous analytic area as partition size <em>n → ∞</em>.
              </p>
              <MiniCalculusCanvas />
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  borderLeft: '3px solid var(--electric-violet)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  marginTop: 14,
                  marginBottom: 16
                }}
              >
                {"∫_a^b f(x)dx = lim_{n→∞} Σ f(xᵢ*) Δx"}
              </div>
              <button
                onClick={onEnterLabClick}
                className="btn-secondary-lab"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 'auto' }}
              >
                <Play size={14} color="#7C3AED" fill="#7C3AED" />
                <span>Launch Interactive Module</span>
              </button>
            </div>
          )}

          {/* CARD 5: MATHS - 3D Vectors & Cross Product */}
          {(filter === 'all' || filter === 'maths') && (
            <div className="glass-card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--electric-violet)',
                    background: 'rgba(124, 58, 237, 0.08)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  MATHEMATICS • 3D GEOMETRY
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>JEE Advanced</span>
              </div>
              <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Vectors, Cross Products & Planes
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Interactive 3D isometric representation of vector cross product <strong>a⃗ × b⃗ = |a||b|sinθ n̂</strong>, normal vectors, and plane coplanarity conditions.
              </p>
              <MiniVectorsCanvas />
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  borderLeft: '3px solid var(--electric-violet)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  marginTop: 14,
                  marginBottom: 16
                }}
              >
                a⃗ × b⃗ = |a⃗||b⃗| sinθ n̂  •  [a⃗, b⃗, c⃗] = 0
              </div>
              <button
                onClick={onEnterLabClick}
                className="btn-secondary-lab"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 'auto' }}
              >
                <Play size={14} color="#7C3AED" fill="#7C3AED" />
                <span>Launch Interactive Module</span>
              </button>
            </div>
          )}

          {/* CARD 6: MATHS - Coordinate Geometry (Conics) */}
          {(filter === 'all' || filter === 'maths') && (
            <div className="glass-card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--electric-violet)',
                    background: 'rgba(124, 58, 237, 0.08)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  MATHEMATICS • CONIC SECTIONS
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>JEE Advanced</span>
              </div>
              <h3 style={{ fontSize: '1.28rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Coordinate Geometry: Conic Loci
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                Morph conic curves dynamically by varying eccentricity <em>e = SP / PM</em> across Ellipse (<em>e &lt; 1</em>), Parabola (<em>e = 1</em>), and Hyperbola (<em>e &gt; 1</em>).
              </p>
              <MiniConicsCanvas />
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  borderLeft: '3px solid var(--electric-violet)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  marginTop: 14,
                  marginBottom: 16
                }}
              >
                SP / PM = e  •  (x² / a²) ± (y² / b²) = 1
              </div>
              <button
                onClick={onEnterLabClick}
                className="btn-secondary-lab"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', marginTop: 'auto' }}
              >
                <Play size={14} color="#7C3AED" fill="#7C3AED" />
                <span>Launch Interactive Module</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   Micro Canvas Renderers for Simulation Cards
   ========================================================================== */

function MiniProjectileCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId: number;

    const u = 16;
    const g = 9.8;
    const ox = 25;
    const oy = 110;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rad = (angle * Math.PI) / 180;
      const totalFlight = (2 * u * Math.sin(rad)) / g;

      // Ground
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, oy);
      ctx.lineTo(canvas.width - 10, oy);
      ctx.stroke();

      // Theoretical Parabola Arc
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.35)';
      ctx.lineWidth = 2;
      for (let s = 0; s <= totalFlight; s += 0.05) {
        const px = ox + u * Math.cos(rad) * s * 10;
        const py = oy - (u * Math.sin(rad) * s - 0.5 * g * s * s) * 10;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Particle
      t += 0.025;
      if (t > totalFlight + 0.4) t = 0;
      const curT = Math.min(t, totalFlight);
      const bx = ox + u * Math.cos(rad) * curT * 10;
      const by = oy - (u * Math.sin(rad) * curT - 0.5 * g * curT * curT) * 10;

      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0062FF';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animId);
  }, [angle]);

  return (
    <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: 10, border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} width={340} height={125} style={{ width: '100%', height: 125, display: 'block' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '0.74rem' }}>
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>Launch Angle θ: <strong>{angle}°</strong></span>
        <input
          type="range"
          min={20}
          max={75}
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          style={{ width: 140, cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}

function MiniFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const sep = 90;

      const c1 = { x: cx - sep / 2, y: cy, q: 1, col: '#EF4444' };
      const c2 = { x: cx + sep / 2, y: cy, q: -1, col: '#0062FF' };

      // Field Lines
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.22)';
      ctx.lineWidth = 1.2;
      const lines = 12;

      for (let i = 0; i < lines; i++) {
        const theta = (i / lines) * Math.PI * 2;
        let lx = c1.x + Math.cos(theta) * 10;
        let ly = c1.y + Math.sin(theta) * 10;
        ctx.beginPath();
        ctx.moveTo(lx, ly);

        for (let s = 0; s < 30; s++) {
          const d1 = Math.hypot(lx - c1.x, ly - c1.y);
          const d2 = Math.hypot(lx - c2.x, ly - c2.y);
          const ex = (100 * (lx - c1.x)) / (d1 * d1 * d1 + 20) - (100 * (lx - c2.x)) / (d2 * d2 * d2 + 20);
          const ey = (100 * (ly - c1.y)) / (d1 * d1 * d1 + 20) - (100 * (ly - c2.y)) / (d2 * d2 * d2 + 20);
          const eMag = Math.hypot(ex, ey);
          if (eMag < 0.05) break;

          lx += (ex / eMag) * 5;
          ly += (ey / eMag) * 5;
          ctx.lineTo(lx, ly);
          if (d2 < 8) break;
        }
        ctx.stroke();
      }

      // Charges
      [c1, c2].forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = c.col;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: 10, border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} width={340} height={125} style={{ width: '100%', height: 125, display: 'block' }} />
    </div>
  );
}

function MiniCircularCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let angle = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 45;

      angle += 0.04;

      // Circle track
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Particle
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      // Radius cord
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.4)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0062FF';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: 10, border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} width={340} height={125} style={{ width: '100%', height: 125, display: 'block' }} />
    </div>
  );
}

function MiniCalculusCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [partitions, setPartitions] = useState(12);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ox = 25;
      const oy = 105;
      const sx = 52;
      const sy = 24;

      const f = (x: number) => 0.12 * Math.pow(x - 2, 3) - 0.6 * (x - 2) + 2.0;

      // Riemann Rectangles
      const a = 0.4;
      const b = 5.2;
      const dx = (b - a) / partitions;

      for (let i = 0; i < partitions; i++) {
        const xi = a + i * dx;
        const h = f(xi + dx * 0.5);
        const rx = ox + xi * sx;
        const ry = oy - h * sy;
        const rw = dx * sx;
        const rh = h * sy;

        ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#7C3AED';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, ry, rw, rh);
      }

      // Smooth Curve
      ctx.beginPath();
      ctx.strokeStyle = '#0062FF';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 5.5; x += 0.1) {
        const px = ox + x * sx;
        const py = oy - f(x) * sy;
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [partitions]);

  return (
    <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: 10, border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} width={340} height={125} style={{ width: '100%', height: 125, display: 'block' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '0.74rem' }}>
        <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>Partitions n: <strong>{partitions}</strong></span>
        <input
          type="range"
          min={4}
          max={32}
          value={partitions}
          onChange={(e) => setPartitions(Number(e.target.value))}
          style={{ width: 140, cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}

function MiniVectorsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ox = canvas.width / 2 - 20;
      const oy = canvas.height / 2 + 25;

      const ax = ox + 60;
      const ay = oy - 8;
      const bx = ox + 35;
      const by = oy - 45;
      const cx = ax + (bx - ox);
      const cy = ay + (by - oy);

      // Parallelogram
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ax, ay);
      ctx.lineTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 98, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.3)';
      ctx.stroke();

      // Normal Vector
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - 55);
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vectors A and B
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ax, ay);
      ctx.strokeStyle = '#0062FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = '#7C3AED';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: 10, border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} width={340} height={125} style={{ width: '100%', height: 125, display: 'block' }} />
    </div>
  );
}

function MiniConicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Focus
      ctx.beginPath();
      ctx.arc(cx + 15, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#7C3AED';
      ctx.fill();

      // Ellipse curve
      ctx.beginPath();
      ctx.ellipse(cx, cy, 65, 40, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#0062FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: 10, border: '1px solid var(--border-subtle)' }}>
      <canvas ref={canvasRef} width={340} height={125} style={{ width: '100%', height: 125, display: 'block' }} />
    </div>
  );
}
