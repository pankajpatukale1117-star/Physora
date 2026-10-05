import React, { useState, useEffect } from 'react';
import { Atom, ArrowRight, Sun, Moon, BookOpen, Menu, X, Search, FlaskConical, Compass } from 'lucide-react';
import { PhysoraLogo } from './PhysoraLogo';

interface NavbarProps {
  onEnterLabClick: () => void;
  onExploreClick: () => void;
  onSimulationsClick: () => void;
  onExperimentsClick: () => void;
  onOpenFormulas: () => void;
  onOpenSearch: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onEnterLabClick,
  onExploreClick,
  onSimulationsClick,
  onExperimentsClick,
  onOpenFormulas,
  onOpenSearch,
  theme,
  onToggleTheme
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global keyboard shortcut for search (Cmd+K or Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const handleMobileNavClick = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header className={`physora-header ${scrolled ? 'physora-header-scrolled' : ''}`}>
      <div
        className="section-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
          aria-label="Physora Home"
        >
          <PhysoraLogo variant="horizontal" size={38} />
        </a>

        {/* Desktop Primary Nav Links */}
        <nav
          className="hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <button onClick={onExploreClick} className="nav-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={15} />
              <span>Explore</span>
            </div>
          </button>

          <button onClick={onSimulationsClick} className="nav-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Atom size={15} />
              <span>Simulations</span>
            </div>
          </button>

          <button onClick={onExperimentsClick} className="nav-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FlaskConical size={15} />
              <span>Experiments</span>
            </div>
          </button>

          <button onClick={onOpenFormulas} className="nav-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={15} />
              <span>Formulas</span>
            </div>
          </button>
        </nav>

        {/* Right Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="btn btn-sm"
            style={{
              padding: '6px 12px',
              gap: 8,
              fontSize: '0.82rem',
              color: '#FFFFFF',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Search simulations (Ctrl+K or /)"
            aria-label="Search simulations"
          >
            <Search size={15} color="#FFC72C" />
            <span className="hide-mobile">Search</span>
            <kbd
              className="hide-mobile"
              style={{
                fontSize: '0.68rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#E2E8F0',
                fontFamily: 'var(--font-mono)'
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Clean Light Theme' : 'Switch to Dark Slate Theme'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#FFC72C" />
            ) : (
              <Moon size={17} color="#FFFFFF" />
            )}
          </button>

          {/* Primary Enter Lab CTA — PhET Play Orange */}
          <button
            onClick={onEnterLabClick}
            className="btn btn-sm hide-mobile"
            style={{
              background: '#FF6600',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 750,
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              boxShadow: '0 3px 10px rgba(255, 102, 0, 0.4)',
              cursor: 'pointer'
            }}
          >
            <span>Enter the Lab</span>
            <ArrowRight size={14} />
          </button>

          {/* Mobile Hamburger / Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="show-mobile-only nav-hamburger-btn"
            style={{ color: '#FFFFFF', background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean, Accessible) */}
      {isMobileMenuOpen && (
        <div
          className="show-mobile-only animate-fade-in"
          style={{
            flexDirection: 'column',
            width: '100%',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 20px 24px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Quick Search in Mobile Drawer */}
          <button
            onClick={() => handleMobileNavClick(onOpenSearch)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: 14
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} color="var(--brand-primary)" />
              <span>Search simulations &amp; topics...</span>
            </div>
            <kbd
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-tertiary)'
              }}
            >
              Search
            </kbd>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {/* 1. Explore */}
            <button
              onClick={() => handleMobileNavClick(onExploreClick)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Compass size={18} color="var(--brand-primary)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Explore Curriculum
                </span>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            {/* 2. Simulations */}
            <button
              onClick={() => handleMobileNavClick(onSimulationsClick)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Atom size={18} color="var(--brand-primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Simulations
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    42 Interactive Models (Class 9–11)
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            {/* 3. Experiments */}
            <button
              onClick={() => handleMobileNavClick(onExperimentsClick)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FlaskConical size={18} color="var(--accent-teal)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Digital Experiments
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    8 Scientific Inquiry Labs
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            {/* 4. Formulas */}
            <button
              onClick={() => handleMobileNavClick(onOpenFormulas)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={18} color="var(--electric-cyan)" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Formula Bank &amp; Variable Index
                </span>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>
          </div>

          {/* Full-Width Mobile CTA */}
          <button
            onClick={() => handleMobileNavClick(onEnterLabClick)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.95rem'
            }}
          >
            <span>Open Interactive Laboratory</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </header>
  );
};
