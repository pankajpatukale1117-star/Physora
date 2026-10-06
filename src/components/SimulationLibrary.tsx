import React, { useState, useMemo } from 'react';
import {
  Atom,
  Search,
  Compass,
  BookOpen,
  Play,
  Target,
  Dna
} from 'lucide-react';
import { TOPICS_DATA } from '../data/topicsData';
import { SimulationPoster } from './SimulationPoster';

interface SimulationLibraryProps {
  onSelectTopic: (topicId: string) => void;
  onOpenFormulas: () => void;
  onOpenAnatomy?: (organId?: string) => void;
}

export const SimulationLibrary: React.FC<SimulationLibraryProps> = ({
  onSelectTopic,
  onOpenFormulas,
  onOpenAnatomy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Mathematics' | 'Biology'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Available topics
  const topics = useMemo(() => Object.values(TOPICS_DATA), []);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      // Subject filter
      if (selectedSubject === 'Physics' && t.subject !== 'physics') return false;
      if (selectedSubject === 'Mathematics' && t.subject !== 'maths') return false;
      if (selectedSubject === 'Biology' && t.subject !== 'biology') return false;

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
        background: 'transparent',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="section-container">
        {/* Section Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="badge badge-primary">
              <Atom size={13} />
              <span>Simulations Catalog • 54 Interactive Models</span>
            </span>
          </div>
          <h2 className="text-h1" style={{ marginBottom: 10 }}>
            Interactive Simulations for <span style={{ color: 'var(--brand-primary)' }}>Physics, Math &amp; Biology</span>
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

          {/* Card 3: Biology */}
          <div
            className={`phet-category-card ${selectedSubject === 'Biology' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSubject('Biology');
              setSelectedCategory('All');
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-success-soft, #ECFDF5)',
                color: 'var(--accent-success, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Dna size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Biology &amp; Anatomy
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.35)'
                  }}
                >
                  3D CORE
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                3D Human Body, 8 Systems &amp; PhET Sims
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
                Full Standard &amp; Advanced Syllabus (54 Sims)
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
              {(['All', 'Physics', 'Mathematics', 'Biology'] as const).map((sub) => {
                const count =
                  sub === 'All'
                    ? topics.length
                    : topics.filter((t) =>
                        sub === 'Physics'
                          ? t.subject === 'physics'
                          : sub === 'Mathematics'
                          ? t.subject === 'maths'
                          : t.subject === 'biology'
                      ).length;
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

        {/* FEATURED: 3D HUMAN ANATOMY EXPLORER HERO CARD (Core of Physora Biology) */}
        {(selectedSubject === 'Biology' || selectedSubject === 'All') && onOpenAnatomy && (
          <div
            style={{
              marginBottom: 32,
              padding: '28px 32px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.18) 0%, rgba(15, 23, 42, 0.85) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ maxWidth: 650 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: '0.70rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(16, 185, 129, 0.25)',
                      color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      letterSpacing: '0.05em'
                    }}
                  >
                    PHYSORA BIOLOGY CORE EXPERIENCE
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>• Full Real-Time WebGL 3D</span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Interactive 3D Human Anatomy Explorer
                </h3>
                <p style={{ fontSize: '0.90rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Enter an interactive 3D human body. Freely rotate, zoom, pan, select organs, isolate individual anatomical structures, toggle 8 physiological systems with real-time opacity sliders, and follow live biological processes across multi-scale dimensions.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'center' }}>
                <button
                  onClick={() => onOpenAnatomy()}
                  className="btn btn-primary btn-lg"
                  style={{
                    background: '#10B981',
                    borderColor: '#10B981',
                    color: '#000000',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Dna size={18} />
                  <span>Enter 3D Human Body</span>
                </button>
              </div>
            </div>

            {/* Quick Organ Fly-To Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                Inspect Direct 3D Structures:
              </span>
              {[
                { name: 'Heart & Blood Flow', id: 'heart' },
                { name: 'Lungs & Alveoli', id: 'lungs' },
                { name: 'Brain & Synapses', id: 'brain' },
                { name: 'Kidneys & Nephrons', id: 'kidneys' },
                { name: 'Stomach & GI Tract', id: 'stomach' },
                { name: 'Spine & Ribcage', id: 'spine' }
              ].map((org) => (
                <button
                  key={org.id}
                  onClick={() => onOpenAnatomy(org.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: 'var(--bg-surface)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {org.name}
                </button>
              ))}
            </div>
          </div>
        )}

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
                        topic.subject === 'physics'
                          ? 'badge-physics'
                          : topic.subject === 'biology'
                          ? 'badge-biology'
                          : 'badge-math'
                      }`}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {topic.subject === 'physics'
                        ? 'Physics'
                        : topic.subject === 'biology'
                        ? 'Biology'
                        : 'Mathematics'}
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
                    padding: '16px 18px 18px',
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
                        marginBottom: 14,
                        minHeight: 38
                      }}
                    >
                      {topic.shortDesc}
                    </p>

                    {/* Sub-models Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {topic.simulations.map((sim) => (
                        <span
                          key={sim.id}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {sim.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom PhET Play Simulation Action */}
                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTopic(topic.id);
                      }}
                      className="btn"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-pill)',
                        background: '#FF6600',
                        color: '#FFFFFF',
                        border: 'none',
                        justifyContent: 'center',
                        gap: 8,
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        boxShadow: '0 3px 10px rgba(255, 102, 0, 0.35)',
                        cursor: 'pointer'
                      }}
                    >
                      <Play size={16} fill="#FFFFFF" />
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
