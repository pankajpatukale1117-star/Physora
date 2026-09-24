import React, { useState, useEffect } from 'react';
import { Atom, ArrowRight, Sun, Moon, BookOpen } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.25s ease',
        background: scrolled ? 'var(--bg-glass-heavy)' : 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none'
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
              justifyContent: 'center'
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
            <span
              className="font-mono"
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--electric-blue)'
              }}
            >
              CLASS 11 &amp; FOUNDATIONS • BY PANKAJ
            </span>
          </div>
        </a>

        {/* Links */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Switcher Toggle (physora.org inspired) */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#6366F1" />}
          </button>

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

          <button
            onClick={onEnterLabClick}
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
        </div>
      </div>
    </header>
  );
};
