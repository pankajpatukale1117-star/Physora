// ============================================================================
// PHYSORA ANATOMICAL SEARCH MODAL
// Fast Real-Time Search across 100+ Anatomical Structures & Micro-Regions
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Layers, ArrowRight } from 'lucide-react';
import { buildAnatomySearchIndex } from '../../data/anatomyData';

interface AnatomySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStructure: (structureId: string) => void;
}

export const AnatomySearchModal: React.FC<AnatomySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStructure
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const searchIndex = useMemo(() => buildAnatomySearchIndex(), []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      // Default: show featured major organs
      return searchIndex.filter((item) => !item.isSubstructure).slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return searchIndex
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.latinName.toLowerCase().includes(q) ||
          item.systemName.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      })
      .slice(0, 15);
  }, [query, searchIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 230,
        backgroundColor: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#0B1120',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 14,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <Search size={20} color="#10B981" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anatomy (e.g. Heart, Left Ventricle, Femur, Lungs, Alveoli, Brain)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: 500
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '0.68rem',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              fontFamily: 'monospace'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Quick Suggestion Pills */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Quick:</span>
          {['Heart', 'Lungs', 'Brain', 'Kidneys', 'Skull', 'Spine', 'Stomach', 'Diaphragm'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              style={{
                padding: '3px 8px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '10px' }}>
          {filteredResults.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>No anatomical structures found for "{query}"</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.78rem' }}>
                Try searching for major organs, bones, or systems like "circulatory" or "nervous".
              </p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectStructure(item.targetStructureId);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  marginBottom: 4
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Layers size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                        {item.name}
                      </span>
                      {item.isSubstructure && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: '#38BDF8',
                            border: '1px solid rgba(56, 189, 248, 0.3)'
                          }}
                        >
                          Sub-structure
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                      {item.systemName} • <span style={{ fontStyle: 'italic' }}>{item.latinName}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: '0.76rem', fontWeight: 600 }}>
                  <span>Fly to 3D</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
