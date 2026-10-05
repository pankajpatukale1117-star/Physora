import React, { useState, useMemo } from 'react';
import {
  Atom,
  Search,
  ArrowRight,
  Compass,
  BookOpen
} from 'lucide-react';
import { TOPICS_DATA } from '../data/topicsData';
import { MathView } from './MathView';

interface SimulationLibraryProps {
  onSelectTopic: (topicId: string) => void;
  onOpenFormulas: () => void;
}

export const SimulationLibrary: React.FC<SimulationLibraryProps> = ({
  onSelectTopic,
  onOpenFormulas
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Mathematics'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Available topics
  const topics = useMemo(() => Object.values(TOPICS_DATA), []);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      // Subject filter
      if (selectedSubject === 'Physics' && t.subject !== 'physics') return false;
      if (selectedSubject === 'Mathematics' && t.subject !== 'maths') return false;

      // Category filter
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.shortDesc.toLowerCase().includes(q);
        const matchSims = t.simulations.some(
          (s) => s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q)
        );
        const matchFormulas = t.keyFormulas.some((f) => f.formula.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchSims && !matchFormulas) return false;
      }

      return true;
    });
  }, [topics, selectedSubject, selectedCategory, searchQuery]);

  return (
    <section
      id="simulations-library"
      style={{
        padding: '70px 0',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="section-container">
        {/* Section Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="badge badge-primary">
              <Atom size={13} />
              <span>Simulations Library</span>
            </span>
          </div>
          <h2 className="text-h1" style={{ marginBottom: 10 }}>
            Interactive Models for <span style={{ color: 'var(--brand-primary)' }}>Maths &amp; Physics</span>
          </h2>
          <p
            className="text-body"
            style={{ maxWidth: 640, margin: '0 auto', color: 'var(--text-secondary)' }}
          >
            Explore 14 curriculum domains and 42 interactive models. Adjust parameters, observe
            synchronous graphs, and connect visual concepts directly to scientific equations.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="scientific-card"
          style={{
            padding: '16px 20px',
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'var(--bg-surface)'
          }}
        >
          {/* Top row: Subject Tabs & Instant Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            {/* Subject Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['All', 'Physics', 'Mathematics'] as const).map((sub) => {
                const count =
                  sub === 'All'
                    ? topics.length
                    : topics.filter((t) => (sub === 'Physics' ? t.subject === 'physics' : t.subject === 'maths'))
                        .length;
                const active = selectedSubject === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setSelectedCategory('All');
                    }}
                    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 14px' }}
                  >
                    <span>{sub}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        opacity: active ? 0.9 : 0.6,
                        marginLeft: 2
                      }}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Keyword Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-subtle)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                minWidth: 260,
                flex: '1 1 260px',
                maxWidth: 400
              }}
            >
              <Search size={16} color="var(--text-tertiary)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, variable, or formula..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  outline: 'none',
                  width: '100%',
                  fontFamily: 'var(--font-sans)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Link to Formula Bank */}
            <button
              onClick={onOpenFormulas}
              className="btn btn-secondary btn-sm"
              style={{
                gap: 6,
                color: 'var(--text-secondary)'
              }}
              title="Open full KaTeX formula and variable index"
            >
              <BookOpen size={14} color="var(--brand-primary)" />
              <span>Formula Bank</span>
            </button>
          </div>
        </div>


        {/* Results Grid */}
        {filteredTopics.length === 0 ? (
          <div
            className="scientific-card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              background: 'var(--bg-surface)'
            }}
          >
            <Compass size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
              No simulations found matching "{searchQuery}"
            </h3>
            <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>
              Try searching for "velocity", "angle", "force", "optics", "energy", or clear your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSelectedCategory('All');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20
            }}
          >
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="scientific-card scientific-card-interactive"
                onClick={() => onSelectTopic(topic.id)}
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface)'
                }}
              >
                <div>
                  {/* Top Meta row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12
                    }}
                  >
                    <span
                      className={`badge ${
                        topic.subject === 'physics' ? 'badge-physics' : 'badge-math'
                      }`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {topic.subject === 'physics' ? 'Physics' : 'Mathematics'} • Class 9–11
                    </span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      3 Simulations
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 750,
                      color: 'var(--text-primary)',
                      marginBottom: 6,
                      lineHeight: 1.3
                    }}
                  >
                    {topic.title}
                  </h3>

                  {/* One-line explanation */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: 14
                    }}
                  >
                    {topic.shortDesc}
                  </p>

                  {/* Representative KaTeX Equation Box */}
                  {topic.keyFormulas.length > 0 && (
                    <div
                      style={{
                        background: 'var(--bg-subtle)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <MathView math={topic.keyFormulas[0].formula} />
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-tertiary)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        Model Formula
                      </span>
                    </div>
                  )}

                  {/* Sub-simulations Preview List */}
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--text-tertiary)',
                        marginBottom: 6
                      }}
                    >
                      Included Models:
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      {topic.simulations.map((sim, i) => (
                        <li
                          key={sim.id}
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: 'var(--bg-subtle)',
                              border: '1px solid var(--border-subtle)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-tertiary)'
                            }}
                          >
                            {i + 1}
                          </span>
                          <span>{sim.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA Button */}
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
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--brand-primary)'
                    }}
                  >
                    Open Topic Lab
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--brand-primary-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-primary)'
                    }}
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
