import React from 'react';
import { FlaskConical, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { EXPERIMENTS_DATA, type ExperimentItem } from '../data/experimentsData';

interface FeaturedExperimentsProps {
  onSelectExperiment: (experimentId: string) => void;
}

export const FeaturedExperiments: React.FC<FeaturedExperimentsProps> = ({
  onSelectExperiment
}) => {
  return (
    <section
      id="experiments-lab"
      style={{
        padding: '70px 0',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 40px' }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span
              className="badge"
              style={{
                background: 'var(--accent-teal-soft)',
                color: 'var(--accent-teal)',
                borderColor: 'rgba(13, 148, 136, 0.25)'
              }}
            >
              <FlaskConical size={13} />
              <span>Scientific Discovery Laboratory</span>
            </span>
          </div>

          <h2 className="text-h1" style={{ marginBottom: 12 }}>
            Digital Experiments Lab: <span style={{ color: 'var(--accent-teal)' }}>Inquiry in Action</span>
          </h2>

          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Instead of just watching a simulation, step into the role of a researcher. Formulate a
            hypothesis, alter independent variables, log live empirical trials, and derive the governing laws.
          </p>

          {/* 4-Step Inquiry Badge Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 20
            }}
          >
            {['1. PREDICT', '2. EXPERIMENT', '3. OBSERVE DATA', '4. EXPLAIN & CONCLUDE'].map(
              (step, idx) => (
                <span
                  key={step}
                  className="font-mono"
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: idx === 1 ? 'var(--accent-teal)' : 'var(--text-secondary)'
                  }}
                >
                  {step}
                </span>
              )
            )}
          </div>
        </div>

        {/* 8 Digital Experiments Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
        >
          {EXPERIMENTS_DATA.map((exp: ExperimentItem) => (
            <div
              key={exp.id}
              className="scientific-card scientific-card-interactive"
              onClick={() => onSelectExperiment(exp.id)}
              style={{
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)'
              }}
            >
              <div>
                {/* Domain & Level */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.72rem',
                      background: 'var(--accent-teal-soft)',
                      color: 'var(--accent-teal)',
                      borderColor: 'rgba(13, 148, 136, 0.2)'
                    }}
                  >
                    {exp.domain}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-tertiary)'
                    }}
                  >
                    Trial Lab
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 750,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                    lineHeight: 1.3
                  }}
                >
                  {exp.title}
                </h3>

                {/* Objective */}
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: 14
                  }}
                >
                  {exp.objective}
                </p>

                {/* Prediction Prompt Box */}
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: 14
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--accent-teal)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: 4
                    }}
                  >
                    <HelpCircle size={12} />
                    <span>Inquiry Question</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      fontStyle: 'italic'
                    }}
                  >
                    "{exp.question}"
                  </div>
                </div>

                {/* Apparatus Summary */}
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-tertiary)',
                      marginBottom: 4
                    }}
                  >
                    Key Apparatus:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {exp.apparatus.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <CheckCircle2 size={12} color="var(--accent-teal)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Launch Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--accent-teal)'
                  }}
                >
                  Launch Experiment
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-teal-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-teal)'
                  }}
                >
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
