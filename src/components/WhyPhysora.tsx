import React from 'react';
import { Layers, ShieldCheck, Compass, Eye, Sparkles } from 'lucide-react';

export const WhyPhysora: React.FC = () => {
  const pillars = [
    {
      title: 'Multiple Representations',
      desc: 'Connect visual motion, real-time telemetry, dynamic graphs, and mathematical KaTeX equations simultaneously to see how they express the exact same concept.',
      icon: Layers,
      accent: 'var(--brand-primary)'
    },
    {
      title: 'Inquiry-First Methodology',
      desc: 'Adopt the scientific method: formulate a prediction, adjust experimental variables, record trials into empirical data tables, and discover the underlying relationships.',
      icon: Compass,
      accent: 'var(--accent-teal)'
    },
    {
      title: 'Calibrated for Class 9–11',
      desc: 'Every model is scientifically tuned for foundational secondary and higher-secondary curricula, making physics laws and mathematical curves immediately accessible.',
      icon: ShieldCheck,
      accent: 'var(--electric-cyan)'
    },
    {
      title: 'Distraction-Free Environment',
      desc: 'No flashiness, no ads, no gaming gimmicks. A clean, light-first digital laboratory designed for comfortable 30–60 minute focused study and classroom exploration.',
      icon: Eye,
      accent: 'var(--electric-violet)'
    }
  ];

  return (
    <section
      id="why-physora"
      style={{
        padding: '70px 0',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 44px' }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="badge badge-primary">
              <Sparkles size={13} />
              <span>Educational Philosophy</span>
            </span>
          </div>
          <h2 className="text-h1" style={{ marginBottom: 12 }}>
            Why <span style={{ color: 'var(--brand-primary)' }}>Physora</span>?
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            We believe that mathematics and physics should not be memorized as dead formulas on a blackboard.
            They are living laws of nature meant to be explored, tested, and understood.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20
          }}
        >
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="scientific-card"
                style={{
                  padding: '24px 20px',
                  background: 'var(--bg-surface)'
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: p.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 750,
                    color: 'var(--text-primary)',
                    marginBottom: 8
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55
                  }}
                >
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
