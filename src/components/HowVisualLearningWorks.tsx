import React from 'react';
import { Compass, Sliders, Eye, BrainCircuit } from 'lucide-react';

export const HowVisualLearningWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      action: 'Explore',
      title: 'Choose a Phenomenon',
      desc: 'Select from 14 foundational domains in physics and mathematics. Enter a dedicated virtual laboratory with clean, calibrated models.',
      icon: Compass,
      accent: 'var(--brand-primary)'
    },
    {
      step: '02',
      action: 'Change',
      title: 'Manipulate Variables',
      desc: 'Use interactive sliders to vary velocity, angle, spring constant, or function coefficients. Direct cause-and-effect replaces rote memorization.',
      icon: Sliders,
      accent: 'var(--accent-teal)'
    },
    {
      step: '03',
      action: 'Observe',
      title: 'See Invisible Quantities',
      desc: 'Watch real-time motion, dynamic vector arrows (velocity, force, acceleration), live numerical telemetry, and synchronous graphs.',
      icon: Eye,
      accent: 'var(--electric-cyan)'
    },
    {
      step: '04',
      action: 'Understand',
      title: 'Connect to Equations',
      desc: 'See how the physical observations map directly onto exact KaTeX mathematical formulas (such as s = vt, F = ma, or Snell’s law).',
      icon: BrainCircuit,
      accent: 'var(--electric-violet)'
    }
  ];

  return (
    <section
      id="how-it-works"
      style={{
        padding: '70px 0',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 44px' }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="badge badge-primary">
              <span>Scientific Inquiry Method</span>
            </span>
          </div>
          <h2 className="text-h1" style={{ marginBottom: 12 }}>
            How <span style={{ color: 'var(--brand-primary)' }}>Physora</span> Works
          </h2>
          <p className="text-body">
            A 4-step pedagogical inquiry cycle designed to build durable mental models and deep conceptual understanding for Class 9–11 students.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20
          }}
        >
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="scientific-card"
                style={{
                  padding: '24px 20px',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
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
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: s.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      STEP {s.step}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: s.accent,
                      marginBottom: 4
                    }}
                  >
                    {s.action}
                  </div>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 750,
                      color: 'var(--text-primary)',
                      marginBottom: 8
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
