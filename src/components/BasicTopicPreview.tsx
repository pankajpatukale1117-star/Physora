import React from 'react';
import {
  Compass,
  TrendingUp,
  Shapes,
  Binary,
  Layers,
  Activity,
  Ruler,
  Car,
  Shield,
  Zap,
  Globe2,
  Waves,
  Play
} from 'lucide-react';

interface BasicTopicPreviewProps {
  onSelectTopic: (topicId: string) => void;
}

export const BasicTopicPreview: React.FC<BasicTopicPreviewProps> = ({ onSelectTopic }) => {
  const mathTopics = [
    {
      id: 'algebra',
      title: 'Algebra',
      summary: 'Linear equations, simple quadratics, and solving for unknowns.',
      icon: Binary,
      tag: 'x + y = 10',
      simCount: '3 Simulations'
    },
    {
      id: 'trigonometry',
      title: 'Trigonometry',
      summary: 'Right-angled triangles, the unit circle, and sine/cosine waves.',
      icon: Shapes,
      tag: 'sin θ = opp/hyp',
      simCount: '3 Simulations'
    },
    {
      id: 'coordinate_geometry',
      title: 'Coordinate Geometry',
      summary: 'Plotting points (x, y), straight lines, and distance between coordinates.',
      icon: Compass,
      tag: 'd = √[(Δx)² + (Δy)²]',
      simCount: '3 Simulations'
    },
    {
      id: 'functions',
      title: 'Functions',
      summary: 'Input-output relations, domain, range, and simple linear/parabolic curves.',
      icon: TrendingUp,
      tag: 'f(x) = 2x + 1',
      simCount: '3 Simulations'
    },
    {
      id: 'sequences',
      title: 'Sequences',
      summary: 'Predictable number patterns, arithmetic steps (AP), and geometric series.',
      icon: Layers,
      tag: 'a, a+d, a+2d...',
      simCount: '3 Simulations'
    },
    {
      id: 'basic_calculus',
      title: 'Basic Calculus',
      summary: 'Understanding rates of change and finding the slope of a curve.',
      icon: Activity,
      tag: 'slope = Δy / Δx',
      simCount: '3 Simulations'
    }
  ];

  const physicsTopics = [
    {
      id: 'units_dimensions',
      title: 'Units & Dimensions',
      summary: 'Measuring meters, seconds, kilograms, and how physical quantities scale.',
      icon: Ruler,
      tag: 'SI Units [M][L][T]',
      simCount: '3 Simulations'
    },
    {
      id: 'motion',
      title: 'Motion',
      summary: 'Speed, velocity, acceleration, and tracking objects moving in straight lines.',
      icon: Car,
      tag: 'v = u + at',
      simCount: '3 Simulations'
    },
    {
      id: 'newtons_laws',
      title: "Newton's Laws",
      summary: 'Inertia, force equals mass times acceleration (F = ma), and action-reaction pairs.',
      icon: Shield,
      tag: 'F = m · a',
      simCount: '3 Simulations'
    },
    {
      id: 'work_energy_power',
      title: 'Work, Energy & Power',
      summary: 'Kinetic energy, stored potential energy, and energy conservation.',
      icon: Zap,
      tag: 'KE = ½mv²',
      simCount: '3 Simulations'
    },
    {
      id: 'gravitation',
      title: 'Gravitation',
      summary: 'Why objects fall toward Earth and how moons orbit around planets.',
      icon: Globe2,
      tag: 'g = 9.8 m/s²',
      simCount: '3 Simulations'
    },
    {
      id: 'waves',
      title: 'Waves',
      summary: 'Ripples on water, sound vibrations, crests, troughs, and frequency.',
      icon: Waves,
      tag: 'v = f · λ',
      simCount: '3 Simulations'
    }
  ];

  return (
    <section
      id="curriculum-preview"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '70px 24px 90px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 46px' }}>
          <div className="lab-pill-badge" style={{ marginBottom: 14 }}>
            <span>⚡ CLICK ANY TOPIC TO LAUNCH SIMULATIONS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              lineHeight: 1.18,
              marginBottom: 14
            }}
          >
            Explore Topics &amp; <span className="gradient-text">Simulations</span>
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            Click on any topic below to open its dedicated laboratory with <strong>2 to 3 interactive simulations</strong> and step-by-step explanations.
          </p>
        </div>

        {/* Two Main Cards: MATHEMATICS & PHYSICS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: 32,
            alignItems: 'start'
          }}
        >
          {/* Card 1: MATHEMATICS */}
          <div
            className="glass-card"
            style={{
              padding: 32,
              background: 'rgba(255, 255, 255, 0.94)',
              border: '1.5px solid rgba(124, 58, 237, 0.22)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(124, 58, 237, 0.1)',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}
                >
                  π
                </div>
                <div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--electric-violet)',
                      letterSpacing: '0.08em'
                    }}
                  >
                    MATHEMATICS &bull; 6 MODULES
                  </span>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    MATHEMATICS
                  </h3>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--electric-violet)',
                  background: 'rgba(124, 58, 237, 0.08)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                18 Simulations
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Click any module to open interactive equation graphers, unit circles, and slope visualizers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mathTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <div
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 16px',
                      background: 'rgba(248, 250, 252, 0.85)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(124, 58, 237, 0.12)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="topic-item-hover"
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: '#FFFFFF',
                        border: '1px solid rgba(124, 58, 237, 0.18)',
                        color: 'var(--electric-violet)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {topic.title}
                        </h4>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--electric-violet)',
                            background: 'rgba(124, 58, 237, 0.08)',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-pill)'
                          }}
                        >
                          {topic.simCount}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {topic.summary}
                      </p>
                    </div>

                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(124, 58, 237, 0.08)',
                        color: 'var(--electric-violet)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Play size={12} fill="currentColor" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: PHYSICS */}
          <div
            className="glass-card"
            style={{
              padding: 32,
              background: 'rgba(255, 255, 255, 0.94)',
              border: '1.5px solid rgba(0, 98, 255, 0.22)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 98, 255, 0.1)',
                    color: '#0062FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}
                >
                  F⃗
                </div>
                <div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--electric-blue)',
                      letterSpacing: '0.08em'
                    }}
                  >
                    PHYSICS &bull; 6 MODULES
                  </span>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    PHYSICS
                  </h3>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--electric-blue)',
                  background: 'rgba(0, 98, 255, 0.08)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                18 Simulations
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Click any module to simulate motion tracks, Newton's carts, rollercoasters, and gravity orbits.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {physicsTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <div
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 16px',
                      background: 'rgba(248, 250, 252, 0.85)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(0, 98, 255, 0.12)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="topic-item-hover"
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: '#FFFFFF',
                        border: '1px solid rgba(0, 98, 255, 0.18)',
                        color: 'var(--electric-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {topic.title}
                        </h4>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--electric-blue)',
                            background: 'rgba(0, 98, 255, 0.08)',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-pill)'
                          }}
                        >
                          {topic.simCount}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {topic.summary}
                      </p>
                    </div>

                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(0, 98, 255, 0.08)',
                        color: 'var(--electric-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Play size={12} fill="currentColor" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
