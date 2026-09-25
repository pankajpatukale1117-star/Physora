import React, { useState, useEffect } from 'react';
import { Atom, ArrowRight, Sun, Moon, BookOpen, Menu, X, Sparkles, Compass } from 'lucide-react';

interface NavbarProps {
  onEnterLabClick: () => void;
  onExploreClick: () => void;
  onOpenFormulas: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onEnterLabClick,
  onExploreClick,
  onOpenFormulas,
  theme,
  onToggleTheme
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileNavClick = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.25s ease',
        background: scrolled || isMobileMenuOpen ? 'var(--bg-glass-heavy)' : 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: scrolled || isMobileMenuOpen ? 'var(--shadow-md)' : 'none'
      }}
    >
      <div
        className="section-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px'
        }}
      >
        {/* Brand */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
            color: 'var(--text-primary)'
          }}
          onClick={() => {
            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              boxShadow: '0 3px 12px rgba(0, 98, 255, 0.15)',
              border: '1px solid rgba(0, 98, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Atom size={22} color="#0062FF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1
              }}
            >
              Phys<span className="gradient-text">ora</span>
            </span>
            {/* Desktop Subtitle */}
            <span
              className="font-mono hide-mobile"
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--electric-blue)'
              }}
            >
              CLASS 11 &amp; FOUNDATIONS • BY PANKAJ
            </span>
            {/* Mobile Subtitle */}
            <span
              className="font-mono show-mobile-only"
              style={{
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--electric-blue)'
              }}
            >
              CLASS 11 LAB • BY PANKAJ
            </span>
          </div>
        </a>

        {/* Desktop Links (Unchanged) */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28
          }}
          className="hide-mobile"
        >
          <a
            href="#curriculum-preview"
            onClick={(e) => {
              e.preventDefault();
              onExploreClick();
            }}
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            Mathematics
          </a>
          <a
            href="#curriculum-preview"
            onClick={(e) => {
              e.preventDefault();
              onExploreClick();
            }}
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            Physics
          </a>
          <button
            onClick={onOpenFormulas}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              padding: 0
            }}
          >
            <BookOpen size={15} />
            <span>Formulas</span>
          </button>
          <a
            href="#how-it-works"
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            How Visual Learning Works
          </a>
        </nav>

        {/* Right Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#6366F1" />}
          </button>

          {/* Desktop Badge */}
          <span
            className="hide-mobile font-mono"
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--electric-blue-soft)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Crafted by <strong style={{ color: 'var(--electric-blue)' }}>Pankaj</strong>
          </span>

          {/* Desktop Enter Lab CTA */}
          <button
            onClick={onEnterLabClick}
            className="hide-mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 20px',
              background: 'linear-gradient(135deg, #0062FF 0%, #0050D8 100%)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 98, 255, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Enter the Lab</span>
            <ArrowRight size={14} />
          </button>

          {/* Mobile Hamburger / Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="show-mobile-only nav-hamburger-btn"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu (Only rendered when open on mobile) */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-drawer show-mobile-only"
          style={{
            flexDirection: 'column',
            width: '100%',
            background: 'var(--bg-glass-heavy)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '18px 20px 24px',
            boxShadow: 'var(--shadow-xl)',
            animation: 'mobileMenuFadeIn 0.25s var(--ease-spring)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <button
              onClick={() => handleMobileNavClick(onExploreClick)}
              className="mobile-nav-link-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="font-math" style={{ fontSize: '1.1rem', color: '#7C3AED', width: 22, textAlign: 'center' }}>π</span>
                <span>Mathematics (6 Modules)</span>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            <button
              onClick={() => handleMobileNavClick(onExploreClick)}
              className="mobile-nav-link-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1rem', color: '#0062FF', width: 22, textAlign: 'center' }}>⚡</span>
                <span>Physics (8 Modules)</span>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            <button
              onClick={() => handleMobileNavClick(onOpenFormulas)}
              className="mobile-nav-link-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BookOpen size={16} color="#00B4D8" />
                <span>Formulas &amp; Variable Index</span>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </button>

            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-nav-link-btn"
              style={{ textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Compass size={16} color="#10B981" />
                <span>How Visual Learning Works</span>
              </div>
              <ArrowRight size={15} color="var(--text-tertiary)" />
            </a>
          </div>

          {/* Prominent Full-Width Mobile CTA */}
          <button
            onClick={() => handleMobileNavClick(onEnterLabClick)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #0062FF 0%, #0050D8 100%)',
              color: '#FFFFFF',
              fontSize: '0.98rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 98, 255, 0.35)',
              marginBottom: 12
            }}
          >
            <span>Enter the Interactive Lab</span>
            <ArrowRight size={16} />
          </button>

          {/* Micro Footer Inside Drawer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: '0.74rem',
              color: 'var(--text-secondary)'
            }}
          >
            <Sparkles size={12} color="var(--electric-blue)" />
            <span>Class 11 &amp; Below • Crafted by Pankaj</span>
          </div>
        </div>
      )}
    </header>
  );
};
