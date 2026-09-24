import React from 'react';
import { Layers, Activity, Compass, Orbit, Box, ArrowRight } from 'lucide-react';

interface TransformationShowcaseProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
}

export const TransformationShowcase: React.FC<TransformationShowcaseProps> = ({
  currentStage,
  onSelectStage
}) => {
  const stages = [
    {
      step: '01',
      title: '2D Curves → 3D Unfolding',
      icon: Layers,
      math: 'x(t) = A sin(pt), y(t) = B sin(qt), z(t) = C cos(rt)',
      desc: 'Watch flat planar coordinate curves gain vertical differential amplitude, lifting into 3D Torus Knots and spatial helical geodesics.',
      highlight: 'Calculus & Parametric Geometry',
      color: '#0062FF'
    },
    {
      step: '02',
      title: 'Continuous Wave Formations',
      icon: Activity,
      math: 'ψ(x, y, t) = A₁ sin(k₁x - ω₁t) · cos(k₂y - ω₂t)',
      desc: 'The spatial curves dissolve into Fourier wave packets, demonstrating quantum superposition and wave optics interference fringes.',
      highlight: 'Wave Optics & Fourier Analysis',
      color: '#00E5FF'
    },
    {
      step: '03',
      title: '3D Vector & Flux Fields',
      icon: Compass,
      math: '∮ E⃗ · dA⃗ = Q_enc / ε₀  •  ∇ × B⃗ = μ₀J⃗',
      desc: 'Wave crests transform into a multi-directional vector field of glowing arrows aligning along electrostatic Coulomb lines of force.',
      highlight: 'Electrodynamics & Gauss Law',
      color: '#7C3AED'
    },
    {
      step: '04',
      title: 'Orbital Gravity Wells',
      icon: Orbit,
      math: 'F⃗_g = -G(M m / r²) r̂  •  T² = (4π² / GM) a³',
      desc: 'Field lines collapse toward a massive central potential well, spawning Keplerian elliptical orbits that conserve mechanical energy.',
      highlight: 'Newtonian & Rotational Dynamics',
      color: '#EC4899'
    },
    {
      step: '05',
      title: 'Geometric Hyper-Formations',
      icon: Box,
      math: 'A · v⃗ = λ v⃗  •  x² + y² + z² = R²',
      desc: 'Orbital paths crystallize into hyper-dimensional geometric formations (nested icosahedrons and tesseracts) reflecting eigenvalue symmetries.',
      highlight: '3D Coordinate Geometry & Linear Algebra',
      color: '#10B981'
    }
  ];

  return (
    <section
      id="transformations"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '100px 24px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 60px' }}>
          <div className="lab-pill-badge" style={{ marginBottom: 16 }}>
            <span>✦ CINEMATIC SCROLL MORPHING PIPELINE</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
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
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            As you scroll through Physora, abstract algebra continuously evolves into physical dynamics.
            From 2D harmonic curves to 3D wave interference, vector flux, and planetary gravity.
          </p>
        </div>

        {/* 5 Stages Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 40
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
                  padding: 28,
                  cursor: 'pointer',
                  borderColor: isCurrent ? 'var(--electric-blue)' : 'var(--border-subtle)',
                  background: isCurrent ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.82)',
                  boxShadow: isCurrent
                    ? '0 18px 45px -8px rgba(0, 98, 255, 0.22), 0 0 0 1.5px var(--electric-blue)'
                    : 'var(--shadow-md)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? 'var(--electric-blue)' : 'rgba(0, 98, 255, 0.08)',
                      color: isCurrent ? '#FFFFFF' : 'var(--electric-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isCurrent ? 'var(--electric-blue)' : 'var(--text-tertiary)'
                    }}
                  >
                    PHASE {stage.step}
                  </span>
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(0, 98, 255, 0.06)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: stage.color,
                    marginBottom: 10
                  }}
                >
                  {stage.highlight}
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 10,
                    letterSpacing: '-0.015em'
                  }}
                >
                  {stage.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    marginBottom: 18
                  }}
                >
                  {stage.desc}
                </p>

                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    borderLeft: `3px solid ${stage.color}`,
                    fontFamily: 'var(--font-math)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{stage.math}</span>
                  <ArrowRight size={14} color={stage.color} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
