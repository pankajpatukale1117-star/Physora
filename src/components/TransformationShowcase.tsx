import React, { useRef, useEffect } from 'react';
import { Layers, Activity, Compass, Orbit, Box, ArrowRight, Play, Sparkles } from 'lucide-react';
import { MathView } from './MathView';

interface TransformationShowcaseProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
  onLaunchTopic?: (topicId: string) => void;
}

export const TransformationShowcase: React.FC<TransformationShowcaseProps> = ({
  currentStage,
  onSelectStage,
  onLaunchTopic
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    {
      step: '01',
      title: '2D Curves → 3D Unfolding',
      icon: Layers,
      math: 'x(t) = A \\sin(pt),\\quad y(t) = B \\sin(qt),\\quad z(t) = C \\cos(rt)',
      desc: 'Watch flat planar coordinate curves gain vertical differential amplitude, lifting into 3D Torus Knots and spatial helical geodesics.',
      highlight: 'Calculus & Parametric Geometry',
      color: '#0062FF',
      topicId: 'calculus',
      badge: 'Calculus & Spatial Geometry'
    },
    {
      step: '02',
      title: 'Continuous Wave Formations',
      icon: Activity,
      math: '\\psi(x, y, t) = A_1 \\sin(k_1 x - \\omega_1 t) \\cdot \\cos(k_2 y - \\omega_2 t)',
      desc: 'The spatial curves dissolve into Fourier wave packets, demonstrating quantum superposition and wave optics interference fringes.',
      highlight: 'Wave Optics & Fourier Analysis',
      color: '#00E5FF',
      topicId: 'wave_optics',
      badge: 'Wave Superposition'
    },
    {
      step: '03',
      title: '3D Vector & Flux Fields',
      icon: Compass,
      math: '\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0} \\quad \\bullet \\quad \\nabla \\times \\vec{B} = \\mu_0 \\vec{J}',
      desc: 'Wave crests transform into a multi-directional vector field of glowing arrows aligning along electrostatic Coulomb lines of force.',
      highlight: 'Electrodynamics & Gauss Law',
      color: '#7C3AED',
      topicId: 'magnetism',
      badge: 'Flux & Field Theory'
    },
    {
      step: '04',
      title: 'Orbital Gravity Wells',
      icon: Orbit,
      math: '\\vec{F}_g = -G \\frac{M m}{r^2} \\hat{r} \\quad \\bullet \\quad T^2 = \\frac{4\\pi^2}{GM} a^3',
      desc: 'Field lines collapse toward a massive central potential well, spawning Keplerian elliptical orbits that conserve mechanical energy.',
      highlight: 'Newtonian & Rotational Dynamics',
      color: '#EC4899',
      topicId: 'gravitation',
      badge: 'Keplerian Mechanics'
    },
    {
      step: '05',
      title: 'Geometric Hyper-Formations',
      icon: Box,
      math: 'A \\cdot \\vec{v} = \\lambda \\vec{v} \\quad \\bullet \\quad x^2 + y^2 + z^2 = R^2',
      desc: 'Orbital paths crystallize into hyper-dimensional geometric formations reflecting linear algebra eigenvectors and rotational symmetries.',
      highlight: '3D Coordinate Geometry & Linear Algebra',
      color: '#10B981',
      topicId: 'vectors',
      badge: 'Eigen-Symmetry & Matrices'
    }
  ];

  const activeStage = stages[currentStage] || stages[0];

  // Live Canvas 2D Mathematical Interactive Spotlight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Subtle coordinate background grid
      ctx.strokeStyle = 'rgba(0, 98, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridGap = 28;
      for (let x = 0; x < w; x += gridGap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (currentStage === 0) {
        // Stage 0: 3D Torus Knot / Lissajous Unfolding
        const p = 3;
        const q = 7;
        const steps = 300;
        const rotY = t * 0.7;
        const rotX = 0.45 + Math.sin(t * 0.3) * 0.15;
        const rMajor = Math.min(w, h) * 0.28;
        const rMinor = rMajor * 0.4;

        ctx.lineWidth = 2.4;
        ctx.beginPath();

        for (let i = 0; i <= steps; i++) {
          const u = (i / steps) * Math.PI * 4;
          const r = rMajor + rMinor * Math.cos(q * u);
          const px = r * Math.cos(p * u);
          const py = r * Math.sin(p * u);
          const pz = rMinor * Math.sin(q * u);

          // 3D Rotation
          const x1 = px * Math.cos(rotY) + pz * Math.sin(rotY);
          const z1 = -px * Math.sin(rotY) + pz * Math.cos(rotY);
          const y2 = py * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = py * Math.sin(rotX) + z1 * Math.cos(rotX);

          const scale = 1 + z2 / (rMajor * 3);
          const screenX = cx + x1 * scale * 0.75;
          const screenY = cy + y2 * scale * 0.75;

          if (i === 0) {
            ctx.moveTo(screenX, screenY);
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }

        ctx.strokeStyle = '#0062FF';
        ctx.stroke();

        // Lead particle
        const leadU = (t * 0.8) % (Math.PI * 4);
        const lr = rMajor + rMinor * Math.cos(q * leadU);
        const lpx = lr * Math.cos(p * leadU);
        const lpy = lr * Math.sin(p * leadU);
        const lpz = rMinor * Math.sin(q * leadU);
        const lx1 = lpx * Math.cos(rotY) + lpz * Math.sin(rotY);
        const lz1 = -lpx * Math.sin(rotY) + lpz * Math.cos(rotY);
        const ly2 = lpy * Math.cos(rotX) - lz1 * Math.sin(rotX);
        const lscale = 1 + lz1 / (rMajor * 3);

        ctx.fillStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx + lx1 * lscale * 0.75, cy + ly2 * lscale * 0.75, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (currentStage === 1) {
        // Stage 1: Continuous Wave Formations (Superposition & Fourier)
        const waveLen = w - 40;
        const amp1 = h * 0.16;
        const amp2 = h * 0.1;
        const k1 = 0.024;
        const k2 = 0.048;

        // Wave 1 (Subtle Cyan)
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = 20; x <= w - 20; x += 3) {
          const y = cy + amp1 * Math.sin((x - 20) * k1 - t * 2.2);
          if (x === 20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2 (Subtle Violet)
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.35)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = 20; x <= w - 20; x += 3) {
          const y = cy + amp2 * Math.sin((x - 20) * k2 + t * 1.8);
          if (x === 20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Superposed Resultant Wave (Bold Glowing)
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = 20; x <= w - 20; x += 2) {
          const y1 = amp1 * Math.sin((x - 20) * k1 - t * 2.2);
          const y2 = amp2 * Math.sin((x - 20) * k2 + t * 1.8);
          const y = cy + (y1 + y2) * 0.85;
          if (x === 20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Peak nodes
        for (let i = 0; i < 5; i++) {
          const sampleX = 40 + i * (waveLen / 5);
          const y1 = amp1 * Math.sin((sampleX - 20) * k1 - t * 2.2);
          const y2 = amp2 * Math.sin((sampleX - 20) * k2 + t * 1.8);
          const sampleY = cy + (y1 + y2) * 0.85;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sampleX, sampleY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (currentStage === 2) {
        // Stage 2: 3D Vector & Flux Fields (Coulomb Dipole Field)
        const d = 55;
        const q1 = { x: cx - d, y: cy, q: 1 };
        const q2 = { x: cx + d, y: cy, q: -1 };

        const step = 28;
        for (let x = 24; x < w - 24; x += step) {
          for (let y = 24; y < h - 24; y += step) {
            const rx1 = x - q1.x;
            const ry1 = y - q1.y;
            const r1 = Math.max(Math.sqrt(rx1 * rx1 + ry1 * ry1), 18);

            const rx2 = x - q2.x;
            const ry2 = y - q2.y;
            const r2 = Math.max(Math.sqrt(rx2 * rx2 + ry2 * ry2), 18);

            // E = k * q / r^2
            const Ex = (q1.q * rx1) / (r1 * r1 * r1) + (q2.q * rx2) / (r2 * r2 * r2);
            const Ey = (q1.q * ry1) / (r1 * r1 * r1) + (q2.q * ry2) / (r2 * r2 * r2);
            const mag = Math.sqrt(Ex * Ex + Ey * Ey);
            const angle = Math.atan2(Ey, Ex);

            const len = Math.min(step * 0.45, mag * 2800);
            const endX = x + Math.cos(angle) * len;
            const endY = y + Math.sin(angle) * len;

            ctx.strokeStyle = 'rgba(124, 58, 237, 0.42)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Arrow head
            ctx.fillStyle = '#7C3AED';
            ctx.beginPath();
            ctx.arc(endX, endY, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Charge poles
        ctx.fillStyle = '#EC4899';
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(q1.x, q1.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0062FF';
        ctx.shadowColor = '#0062FF';
        ctx.beginPath();
        ctx.arc(q2.x, q2.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (currentStage === 3) {
        // Stage 3: Orbital Gravity Wells (Keplerian orbits + potential contours)
        // Draw potential well contours
        ctx.lineWidth = 1;
        for (let r = 25; r <= 130; r += 26) {
          ctx.strokeStyle = `rgba(236, 72, 153, ${0.35 - (r / 130) * 0.25})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.55, -0.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Central sun / star
        ctx.fillStyle = '#FF9900';
        ctx.shadowColor = '#FF9900';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Orbiting planets
        const planets = [
          { a: 52, b: 28, speed: 1.4, col: '#00E5FF', size: 4 },
          { a: 86, b: 46, speed: 0.9, col: '#10B981', size: 5 },
          { a: 122, b: 68, speed: 0.6, col: '#EC4899', size: 4.5 }
        ];

        planets.forEach((p, idx) => {
          const theta = t * p.speed + idx * 2.1;
          const rot = -0.2;
          const px = p.a * Math.cos(theta);
          const py = p.b * Math.sin(theta);
          const rx = cx + px * Math.cos(rot) - py * Math.sin(rot);
          const ry = cy + px * Math.sin(rot) + py * Math.cos(rot);

          // Velocity vector
          const vx = -p.a * Math.sin(theta) * 0.25;
          const vy = p.b * Math.cos(theta) * 0.25;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + vx, ry + vy);
          ctx.stroke();

          ctx.fillStyle = p.col;
          ctx.shadowColor = p.col;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(rx, ry, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });

      } else {
        // Stage 4: Geometric Hyper-Formations (4D Tesseract projection)
        const vertices4D: number[][] = [];
        for (let i = 0; i < 16; i++) {
          vertices4D.push([
            (i & 1 ? 1 : -1),
            (i & 2 ? 1 : -1),
            (i & 4 ? 1 : -1),
            (i & 8 ? 1 : -1)
          ]);
        }

        const radA = t * 0.65;
        const radB = t * 0.45;
        const size = Math.min(w, h) * 0.22;

        const projected = vertices4D.map(([x, y, z, w4]) => {
          // 4D Rotation in XW and YZ planes
          const x1 = x * Math.cos(radA) - w4 * Math.sin(radA);
          const w1 = x * Math.sin(radA) + w4 * Math.cos(radA);

          const y1 = y * Math.cos(radB) - z * Math.sin(radB);
          const z1 = y * Math.sin(radB) + z * Math.cos(radB);

          // Stereographic 4D -> 3D projection
          const dist4D = 2.4;
          const f4 = 1 / (dist4D - w1 * 0.4);
          const px = x1 * f4;
          const py = y1 * f4;
          const pz = z1 * f4;

          // 3D -> 2D
          const screenX = cx + px * size * 1.5;
          const screenY = cy + py * size * 1.5;
          return { x: screenX, y: screenY, z: pz };
        });

        // Draw 32 hypercube edges
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1.3;
        for (let i = 0; i < 16; i++) {
          for (let bit = 1; bit < 16; bit <<= 1) {
            if (i & bit) {
              const j = i ^ bit;
              ctx.beginPath();
              ctx.moveTo(projected[i].x, projected[i].y);
              ctx.lineTo(projected[j].x, projected[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw vertex nodes
        projected.forEach((p) => {
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentStage]);

  return (
    <section
      id="transformations"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '90px 24px',
        pointerEvents: 'auto',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 98, 255, 0.02) 50%, transparent 100%)'
      }}
    >
      <div className="section-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto 48px' }}>
          <div className="lab-pill-badge" style={{ marginBottom: 14 }}>
            <Sparkles size={13} color="var(--brand-primary)" />
            <span>5-PHASE MATHEMATICAL & PHYSICAL CONTINUUM</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 16
            }}
          >
            A Living Mathematical <span className="gradient-text">Continuum</span>
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 680,
              margin: '0 auto'
            }}
          >
            Observe how abstract mathematical relations continuously evolve into physical dynamics.
            From 2D harmonic curves to quantum wave interference, vector flux fields, orbital gravity wells, and spatial eigen-symmetry.
          </p>
        </div>

        {/* Dynamic Interactive Stage Spotlight */}
        <div
          className="glass-card"
          style={{
            maxWidth: 1040,
            margin: '0 auto 40px',
            padding: '28px',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeStage.color}33`,
            boxShadow: `0 18px 45px -10px ${activeStage.color}22`,
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.2fr)',
            gap: 28,
            alignItems: 'center'
          }}
        >
          {/* Spotlight Left: Real-time Live Canvas Visualizer */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 290,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <canvas
              ref={canvasRef}
              width={420}
              height={290}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            {/* Live Indicator Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#FFFFFF'
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: activeStage.color,
                  boxShadow: `0 0 8px ${activeStage.color}`
                }}
              />
              <span>PHASE {activeStage.step} • {activeStage.badge}</span>
            </div>
          </div>

          {/* Spotlight Right: Mathematical Rigor & Direct Lab Trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: activeStage.color,
                  background: `${activeStage.color}15`,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                STAGE {activeStage.step} OF 05
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {activeStage.highlight}
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              {activeStage.title}
            </h3>

            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {activeStage.desc}
            </p>

            {/* Formal KaTeX Formulation */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                borderLeft: `4px solid ${activeStage.color}`,
                overflowX: 'auto'
              }}
            >
              <MathView math={activeStage.math} block />
            </div>

            {/* Action Buttons: Launch Lab Model */}
            {onLaunchTopic && (
              <div style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => onLaunchTopic(activeStage.topicId)}
                  className="btn btn-primary"
                  style={{
                    background: activeStage.color,
                    borderColor: activeStage.color,
                    boxShadow: `0 4px 14px ${activeStage.color}44`,
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Launch {activeStage.title.split('→')[0].trim()} Lab</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 5 Stages Interactive Selector Grid */}
        <div
          className="transformation-stages-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}
        >
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCurrent = currentStage === idx;

            return (
              <div
                key={idx}
                onClick={() => onSelectStage(idx)}
                className="glass-card"
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  borderColor: isCurrent ? stage.color : 'var(--border-subtle)',
                  background: isCurrent ? 'var(--bg-card)' : 'rgba(255, 255, 255, 0.65)',
                  boxShadow: isCurrent
                    ? `0 12px 30px -8px ${stage.color}33, 0 0 0 1.5px ${stage.color}`
                    : 'var(--shadow-sm)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isCurrent ? 'translateY(-3px)' : 'none'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? stage.color : `${stage.color}15`,
                      color: isCurrent ? '#FFFFFF' : stage.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isCurrent ? stage.color : 'var(--text-tertiary)'
                    }}
                  >
                    PHASE {stage.step}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                    lineHeight: 1.3
                  }}
                >
                  {stage.title}
                </h4>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {stage.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
