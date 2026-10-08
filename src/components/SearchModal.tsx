import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Atom, FlaskConical, ArrowRight, BookOpen, Dna } from 'lucide-react';
import { TOPICS_DATA } from '../data/topicsData';
import { EXPERIMENTS_DATA } from '../data/experimentsData';
import { FORMULAS_DATA } from './FormulaBankModal';
import { ANATOMY_STRUCTURES } from '../data/anatomyData';

interface SearchResultItem {
  id: string;
  type: 'simulation' | 'experiment' | 'formula' | 'anatomy';
  title: string;
  subtitle: string;
  topicId: string;
  category: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
  keywords: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
  onSelectExperiment: (experimentId: string) => void;
  onOpenFormulas: () => void;
  onOpenAnatomy?: (organId?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
  onSelectExperiment,
  onOpenFormulas,
  onOpenAnatomy
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Compile search index
  const searchIndex: SearchResultItem[] = React.useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. All topic simulations
    Object.values(TOPICS_DATA).forEach((topic) => {
      // Main topic
      items.push({
        id: topic.id,
        type: 'simulation',
        title: topic.title,
        subtitle: topic.shortDesc,
        topicId: topic.id,
        category: topic.category,
        subject: topic.subject === 'physics' ? 'Physics' : topic.subject === 'chemistry' ? 'Chemistry' : topic.subject === 'biology' ? 'Biology' : 'Mathematics',
        keywords: [
          topic.title.toLowerCase(),
          topic.category.toLowerCase(),
          ...topic.keyFormulas.map((f) => f.formula.toLowerCase()),
          ...topic.keyTakeaways.map((t) => t.toLowerCase())
        ]
      });

      // Individual simulations
      topic.simulations.forEach((sim) => {
        items.push({
          id: `${topic.id}_${sim.id}`,
          type: 'simulation',
          title: sim.name,
          subtitle: `${sim.tagline} • Part of ${topic.title}`,
          topicId: topic.id,
          category: topic.title,
          subject: topic.subject === 'physics' ? 'Physics' : topic.subject === 'chemistry' ? 'Chemistry' : topic.subject === 'biology' ? 'Biology' : 'Mathematics',
          keywords: [
            sim.name.toLowerCase(),
            sim.tagline.toLowerCase(),
            sim.description.toLowerCase(),
            topic.title.toLowerCase()
          ]
        });
      });
    });

    // 2. All 8 digital experiments
    EXPERIMENTS_DATA.forEach((exp) => {
      items.push({
        id: exp.id,
        type: 'experiment',
        title: exp.title,
        subtitle: `${exp.objective} • ${exp.domain}`,
        topicId: exp.id,
        category: exp.domain,
        subject: 'Physics',
        keywords: [
          exp.title.toLowerCase(),
          exp.domain.toLowerCase(),
          exp.objective.toLowerCase(),
          'experiment',
          'inquiry',
          'lab'
        ]
      });
    });

    // 3. Formula Bank Formulas
    FORMULAS_DATA.forEach((formula) => {
      items.push({
        id: formula.id,
        type: 'formula',
        title: formula.name,
        subtitle: `${formula.plainEnglish} • ${formula.domain}`,
        topicId: formula.targetTopicId,
        category: formula.domain,
        subject: formula.category as 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology',
        keywords: [
          formula.name.toLowerCase(),
          formula.domain.toLowerCase(),
          formula.plainEnglish.toLowerCase(),
          formula.latex.toLowerCase(),
          ...formula.variables.map((v) => `${v.name} ${v.sym}`.toLowerCase()),
          'formula',
          'equation'
        ]
      });
    });

    // 4. 3D Human Anatomy Structures
    Object.values(ANATOMY_STRUCTURES).forEach((organ) => {
      items.push({
        id: `anatomy_${organ.id}`,
        type: 'anatomy',
        title: organ.name,
        subtitle: `${organ.latinName ? `${organ.latinName} • ` : ''}${organ.category} • ${organ.system.toUpperCase()} SYSTEM`,
        topicId: organ.id,
        category: organ.category,
        subject: 'Biology',
        keywords: [
          organ.name.toLowerCase(),
          organ.latinName.toLowerCase(),
          organ.category.toLowerCase(),
          organ.system.toLowerCase(),
          organ.primaryFunction.toLowerCase(),
          organ.clinicalRelevance.toLowerCase(),
          ...organ.subStructures.map((s) => s.toLowerCase()),
          'anatomy',
          'organ',
          '3d',
          'biology'
        ]
      });
    });

    return items;
  }, []);

  // Filtered results
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return popular items if empty
      return searchIndex.slice(0, 6);
    }
    return searchIndex
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      })
      .slice(0, 10);
  }, [query, searchIndex]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="search-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search Simulations and Experiments"
    >
      <div
        className="search-modal-box animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)'
          }}
        >
          <Search size={20} color="var(--brand-primary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search simulations, experiments, variables (e.g. projectile, velocity, vectors, Snell)..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: 4
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '0.72rem',
              padding: '3px 6px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Quick Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            Quick:
          </span>
          {['Projectile', 'Velocity', 'Natural Selection', 'Genetics', 'Force', 'Optics', 'Vectors', 'Membrane', 'Trigonometry'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="btn btn-sm"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                padding: '3px 8px'
              }}
            >
              {tag}
            </button>
          ))}
          <button
            onClick={() => {
              onClose();
              onOpenFormulas();
            }}
            className="btn btn-sm"
            style={{
              background: 'var(--brand-primary-soft)',
              border: '1px solid var(--brand-primary-border)',
              color: 'var(--brand-primary)',
              fontSize: '0.75rem',
              padding: '3px 8px',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <BookOpen size={12} />
            <span>Formulas</span>
          </button>

          {onOpenAnatomy && (
            <button
              onClick={() => {
                onClose();
                onOpenAnatomy();
              }}
              className="btn btn-sm"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#059669',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Dna size={12} />
              <span>3D Anatomy</span>
            </button>
          )}
        </div>

        {/* Results List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-tertiary)'
              }}
            >
              <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                No simulations found for "{query}"
              </p>
              <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
                Try searching for broader terms like "motion", "force", "wave", "slope", or "energy".
              </p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onClose();
                  if (item.type === 'experiment') {
                    onSelectExperiment(item.topicId);
                  } else if (item.type === 'anatomy') {
                    if (onOpenAnatomy) {
                      onOpenAnatomy(item.topicId);
                    }
                  } else if (item.type === 'formula') {
                    onSelectTopic(item.topicId);
                  } else {
                    onSelectTopic(item.topicId);
                  }
                }}
                className="scientific-card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-sm)',
                      background:
                        item.type === 'experiment'
                          ? 'var(--accent-teal-soft)'
                          : item.type === 'anatomy'
                          ? 'rgba(16, 185, 129, 0.16)'
                          : item.type === 'formula'
                          ? 'var(--accent-amber-soft)'
                          : item.subject === 'Physics'
                          ? 'var(--brand-primary-soft)'
                          : item.subject === 'Biology'
                          ? 'rgba(16, 185, 129, 0.16)'
                          : 'var(--electric-violet-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {item.type === 'experiment' ? (
                      <FlaskConical size={18} color="var(--accent-teal)" />
                    ) : item.type === 'anatomy' ? (
                      <Dna size={18} color="#10B981" />
                    ) : item.type === 'formula' ? (
                      <BookOpen size={18} color="#D97706" />
                    ) : item.subject === 'Biology' ? (
                      <Dna size={18} color="#10B981" />
                    ) : (
                      <Atom
                        size={18}
                        color={
                          item.subject === 'Physics'
                            ? 'var(--brand-primary)'
                            : 'var(--electric-violet)'
                        }
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`badge ${
                          item.type === 'experiment'
                            ? 'badge-primary'
                            : item.type === 'anatomy'
                            ? 'badge-biology'
                            : item.type === 'formula'
                            ? 'badge-math'
                            : item.subject === 'Physics'
                            ? 'badge-physics'
                            : item.subject === 'Biology'
                            ? 'badge-biology'
                            : 'badge-math'
                        }`}
                        style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                      >
                        {item.type === 'experiment'
                          ? 'Experiment'
                          : item.type === 'anatomy'
                          ? '3D Anatomy'
                          : item.type === 'formula'
                          ? 'Formula'
                          : item.subject}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-tertiary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 2
                      }}
                    >
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: 'var(--brand-primary)'
                    }}
                    className="hide-mobile"
                  >
                    Open
                  </span>
                  <ArrowRight size={14} color="var(--brand-primary)" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)'
          }}
        >
          <span>76 Interactive Models • 34 Topics • 34 Formulas • 36+ Organs</span>
          <span className="font-mono">Physora Laboratory</span>
        </div>
      </div>
    </div>
  );
};
