import React from 'react';
import { Cpu, ShieldCheck, GitBranch, Terminal, CheckCircle2 } from 'lucide-react';
import { MathView } from './MathView';

export const EngineRigor: React.FC = () => {
  return (
    <section
      id="architecture"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '90px 24px',
        background: 'transparent',
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
              padding: 32,
              background: 'rgba(5, 9, 22, 0.85)',
              color: '#E2E8F0',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={18} color="var(--electric-cyan)" />
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--electric-cyan)', fontWeight: 700, letterSpacing: '0.06em' }}>
                  NUMERICAL SOLVER ARCHITECTURE
                </span>
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.7rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-success)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <CheckCircle2 size={11} />
                <span>RK4 ACTIVE</span>
              </span>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 20
              }}
            >
              <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 10 }}>
                // 4th-Order Runge-Kutta Symplectic Integrator
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <MathView math="k_1 = f(t_n, y_n)" />
                <MathView math="k_2 = f(t_n + \frac{1}{2}h, y_n + \frac{1}{2}h k_1)" />
                <MathView math="k_3 = f(t_n + \frac{1}{2}h, y_n + \frac{1}{2}h k_2)" />
                <MathView math="k_4 = f(t_n + h, y_n + h k_3)" />
                <div style={{ paddingTop: 10, borderTop: '1px dashed rgba(255, 255, 255, 0.15)', marginTop: 4 }}>
                  <MathView math="y_{n+1} = y_n + \frac{1}{6}h(k_1 + 2k_2 + 2k_3 + k_4)" style={{ color: '#FACC15' }} />
                </div>
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
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Energy Drift</span>
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                  ΔE &lt; 0.0001%
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Time Step (dt)</span>
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  0.0005 s
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Floating Point</span>
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--electric-cyan)' }}>
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
