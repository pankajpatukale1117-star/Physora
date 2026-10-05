import React, { useState, useMemo } from 'react';
import {
  Atom,
  Search,
  Compass,
  BookOpen,
  Play,
  FlaskConical,
  Target
} from 'lucide-react';
import { TOPICS_DATA } from '../data/topicsData';
import { MathView } from './MathView';
import { SimulationPoster } from './SimulationPoster';

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
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="badge badge-primary">
              <Atom size={13} />
              <span>Simulations Catalog • 42 Interactive Models</span>
            </span>
          </div>
          <h2 className="text-h1" style={{ marginBottom: 10 }}>
            Interactive Simulations for <span style={{ color: 'var(--brand-primary)' }}>Physics &amp; Mathematics</span>
          </h2>
          <p
            className="text-body"
            style={{ maxWidth: 640, margin: '0 auto', color: 'var(--text-secondary)' }}
          >
            Research-based interactive learning tools. Manipulate physical parameters, observe real-time vector
            fields, and test first-principles mathematical behavior.
          </p>
        </div>

        {/* PhET Subject Category Cards (The Subject Bar) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 28
          }}
        >
          {/* Card 1: Physics */}
          <div
            className={`phet-category-card ${selectedSubject === 'Physics' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSubject('Physics');
              setSelectedCategory('All');
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-primary-soft)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Atom size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Physics
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Motion, Waves, Energy, Optics, Thermo (24 Sims)
              </div>
            </div>
          </div>

          {/* Card 2: Mathematics */}
          <div
            className={`phet-category-card ${selectedSubject === 'Mathematics' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSubject('Mathematics');
              setSelectedCategory('All');
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--electric-violet-soft)',
                color: 'var(--electric-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Compass size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Mathematics
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Calculus, Trigonometry, Vectors (18 Sims)
              </div>
            </div>
          </div>

          {/* Card 3: Discovery Experiments */}
          <div
            className="phet-category-card"
            onClick={() => {
              const el = document.getElementById('experiments-lab');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-teal-soft)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FlaskConical size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Discovery Labs
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Predict → Experiment → Explain (8 Labs)
              </div>
            </div>
          </div>

          {/* Card 4: Class 11 & JEE Rigor */}
          <div
            className={`phet-category-card ${selectedSubject === 'All' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSubject('All');
              setSelectedCategory('All');
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-amber-soft)',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Target size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Class 9–11 &amp; JEE
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Full Standard &amp; Advanced Syllabus (42 Sims)
              </div>
            </div>
          </div>
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
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Visual Simulation Poster at Top (PhET Vector Graphic) */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 155,
                    overflow: 'hidden',
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <SimulationPoster topicId={topic.id} subject={topic.subject} title={topic.title} />

                  {/* Overlaid Subject Badge at top-left */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span
                      className={`badge ${
                        topic.subject === 'physics' ? 'badge-physics' : 'badge-math'
                      }`}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {topic.subject === 'physics' ? 'Physics' : 'Mathematics'}
                    </span>
                    <span
                      className="badge font-mono"
                      style={{
                        fontSize: '0.68rem',
                        background: 'rgba(255, 255, 255, 0.94)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                      }}
                    >
                      3 Models
                    </span>
                  </div>

                  {/* Iconic PhET Circular Orange Play Button at bottom-right */}
                  <div
                    className="phet-play-badge"
                    title={`Launch ${topic.title}`}
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 12
                    }}
                  >
                    <Play size={20} fill="#FFFFFF" style={{ marginLeft: 2 }} />
                  </div>
                </div>

                {/* Card Content Body */}
                <div
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
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

                  {/* Bottom PhET Play Simulation Action */}
                  <div
                    style={{
                      paddingTop: 14,
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTopic(topic.id);
                      }}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-pill)',
                        justifyContent: 'center',
                        gap: 8,
                        fontWeight: 700,
                        fontSize: '0.86rem'
                      }}
                    >
                      <Play size={15} fill="#FFFFFF" />
                      <span>Play Simulation</span>
                    </button>
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
