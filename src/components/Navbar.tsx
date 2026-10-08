import React, { useState, useEffect } from 'react';
import { Atom, ArrowRight, Sun, Moon, BookOpen, Menu, X, Search, FlaskConical, Compass, Dna, User } from 'lucide-react';
import { PhysoraLogo } from './PhysoraLogo';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onEnterLabClick: () => void;
  onExploreClick: () => void;
  onSimulationsClick: () => void;
  onExperimentsClick: () => void;
  onOpenFormulas: () => void;
  onOpenSearch: () => void;
  onOpenAnatomy: () => void;
  onOpenAuth: (view?: 'login' | 'signup') => void;
  onOpenProfile: () => void;
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
  onOpenAnatomy,
  onOpenAuth,
  onOpenProfile,
  theme,
  onToggleTheme
}) => {
  const { user, profile, isAuthenticated } = useAuth();

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

          <button onClick={onOpenAnatomy} className="nav-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Dna size={15} color="#10B981" />
              <span>3D Anatomy</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  letterSpacing: '0.04em'
                }}
              >
                3D
              </span>
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

          {/* User Account / Profile Button (Desktop) */}
          {isAuthenticated ? (
            <button
              onClick={onOpenProfile}
              className="btn btn-sm hide-mobile"
              style={{
                padding: '4px 12px 4px 6px',
                gap: 8,
                fontSize: '0.82rem',
                fontWeight: 650,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="View Researcher Profile"
              aria-label="View Researcher Profile"
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                {(profile?.display_name || user?.email || 'P').charAt(0).toUpperCase()}
              </div>
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.display_name?.split(' ')[0] || profile?.username || 'Researcher'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="btn btn-sm hide-mobile"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 650,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Sign In to Physora"
              aria-label="Sign In to Physora"
            >
              <User size={15} color="#38BDF8" />
              <span>Sign In</span>
            </button>
          )}

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
                    76 Interactive Models (34 Topics)
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            {/* 3. 3D Anatomy */}
            <button
              onClick={() => handleMobileNavClick(onOpenAnatomy)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Dna size={18} color="#10B981" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                    3D Human Anatomy
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#34D399' }}>
                    Interactive 3D Body &amp; 8 Systems
                  </span>
                </div>
              </div>
              <ArrowRight size={15} color="#10B981" />
            </button>

            {/* 4. Experiments */}
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

          {/* Mobile Authentication / Account Profile */}
          {isAuthenticated ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                marginTop: 14,
                marginBottom: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: 'var(--phet-navy)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}
                >
                  {(profile?.display_name || user?.email || 'P').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {profile?.display_name || 'Physora Scientist'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    @{profile?.username || 'user'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleMobileNavClick(onOpenProfile)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '5px 10px' }}
              >
                Profile
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, marginBottom: 12 }}>
              <button
                onClick={() => handleMobileNavClick(() => onOpenAuth('login'))}
                className="btn btn-secondary"
                style={{
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 650,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <User size={15} />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => handleMobileNavClick(() => onOpenAuth('signup'))}
                className="btn btn-sm"
                style={{
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 650,
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}

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
