import React from 'react';
import { Eye, Sliders, Sparkles } from 'lucide-react';

export const HowVisualLearningWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'See the Concept in Motion',
      desc: 'Instead of memorizing flat textbook formulas, watch waves ripple, pendulums swing, and graphs bend in real time.',
      icon: Eye,
      color: '#0062FF'
    },
    {
      num: '02',
      title: 'Tweak Sliders & Experiment',
      desc: 'Change gravity, alter launch angles, or adjust equation coefficients to see immediate cause and effect.',
      icon: Sliders,
      color: '#7C3AED'
    },
    {
      num: '03',
      title: 'Build Lifelong Intuition',
      desc: 'Master the basics clearly so Class 11, school exams, and future sciences feel intuitive rather than stressful.',
      icon: Sparkles,
      color: '#00B4D8'
    }
  ];

  return (
    <section
      id="how-it-works"
      style={{
        position: 'relative',
        zIndex: 5,
        padding: '70px 24px 80px',
        pointerEvents: 'auto'
      }}
    >
      <div className="section-container">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
          <div className="lab-pill-badge" style={{ marginBottom: 14 }}>
            <span>💡 WHY VISUAL LEARNING WORKS</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginBottom: 12
            }}
          >
            Science and Maths Made <span className="gradient-text">Intuitive</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Designed specifically for students who want to truly understand how things work.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24
          }}
        >
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: 30,
                  background: 'rgba(255, 255, 255, 0.88)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 18
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: `${s.color}15`,
                      color: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    STEP {s.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
