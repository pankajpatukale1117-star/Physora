import React from 'react';
import { Cpu, ShieldCheck, GitBranch, Terminal } from 'lucide-react';

export const EngineRigor: React.FC = () => {
  return (
    <section
      id="architecture"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '90px 24px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(248, 250, 252, 0.85) 100%)',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 48,
            alignItems: 'center'
          }}
        >
          {/* Left Column: RK4 Terminal Diagram */}
          <div
            className="glass-card"
            style={{
              padding: 36,
              background: '#0B1528',
              color: '#E2E8F0',
              border: '1px solid rgba(0, 98, 255, 0.25)',
              boxShadow: '0 25px 50px -12px rgba(11, 21, 40, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} color="#00E5FF" />
                <span className="font-mono" style={{ fontSize: '0.74rem', color: '#00E5FF', fontWeight: 700 }}>
                  NUMERICAL SOLVER ARCHITECTURE
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.7rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                RK4 ACTIVE
              </span>
            </div>

            <div
              className="font-mono"
              style={{
                fontSize: '0.84rem',
                lineHeight: 1.6,
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 20
              }}
            >
              <div style={{ color: '#94A3B8' }}>// 4th Order Runge-Kutta Differential Solver</div>
              <div><span style={{ color: '#00E5FF' }}>k₁</span> = f(tₙ, yₙ)</div>
              <div><span style={{ color: '#00E5FF' }}>k₂</span> = f(tₙ + ½h, yₙ + ½h·k₁)</div>
              <div><span style={{ color: '#00E5FF' }}>k₃</span> = f(tₙ + ½h, yₙ + ½h·k₂)</div>
              <div><span style={{ color: '#00E5FF' }}>k₄</span> = f(tₙ + h, yₙ + h·k₃)</div>
              <div style={{ color: '#FACC15', paddingTop: 8, borderTop: '1px dashed rgba(255, 255, 255, 0.15)', marginTop: 8 }}>
                yₙ₊₁ = yₙ + ⅙h (k₁ + 2k₂ + 2k₃ + k₄)
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                paddingTop: 14,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8' }}>Energy Drift</span>
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>
                  ΔE &lt; 0.0001%
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8' }}>Time Step (dt)</span>
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                  0.0005 s
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8' }}>Precision</span>
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00E5FF' }}>
                  Float64
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div>
            <div className="lab-pill-badge" style={{ marginBottom: 16 }}>
              <ShieldCheck size={14} color="#0062FF" />
              <span>RIGOROUS NUMERICAL FOUNDATION</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.1rem, 3.8vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: 20
              }}
            >
              Why Ordinary Physics Engines Fail <span className="gradient-text">JEE Advanced</span>
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 28
              }}
            >
              Most web simulations use simplified Euler integration that leaks energy within seconds.
              JEE Advanced tests subtle boundary conditions: rolling without slipping on accelerating wedges,
              non-conservative friction limits, and coupled oscillators. Physora computes exact differential equations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 98, 255, 0.08)',
                    color: 'var(--electric-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Lagrangian Multipliers & Constraints
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Rigid rods, taut strings, and banked tracks enforce geometrical constraints analytically without elastic jitter.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(124, 58, 237, 0.08)',
                    color: 'var(--electric-violet)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <GitBranch size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Dual Math-Physics Synapses
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Every physical motion links directly to its mathematical counterpart: simple harmonic motion maps onto phase-space circles and Taylor series expansions.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
