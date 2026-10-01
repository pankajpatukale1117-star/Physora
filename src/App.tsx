import { useState, useEffect } from 'react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BasicTopicPreview } from './components/BasicTopicPreview';
import { SimulationCurriculum } from './components/SimulationCurriculum';
import { HowVisualLearningWorks } from './components/HowVisualLearningWorks';
import { EngineRigor } from './components/EngineRigor';
import { LabGatewayCTA } from './components/LabGatewayCTA';
import { Footer } from './components/Footer';
import { TopicLabModal } from './components/TopicLabModal';
import { FormulaBankModal } from './components/FormulaBankModal';

export function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#sim/')) return hash.replace('#sim/', '');
      if (hash.startsWith('#topic/')) return hash.replace('#topic/', '');
    }
    return null;
  });
  const [isFormulaBankOpen, setIsFormulaBankOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('physora-theme-v2');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Fallback
    }
    return 'dark'; // Cyber-Obsidian Quantum Laboratory theme default
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('physora-theme-v2', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Synchronize browser history / URL hash and reset legacy experiment hashes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#experiments')) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#experiments')) {
        window.history.replaceState(null, '', window.location.pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#sim/') || hash.startsWith('#topic/')) {
        const id = hash.replace(/^#(sim|topic)\//, '');
        if (id) setSelectedTopicId(id);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToPreview = () => {
    const el = document.getElementById('curriculum-preview');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnterLab = () => {
    // Open primary interactive simulation laboratory modal
    setSelectedTopicId('motion');
    window.location.hash = '#sim/motion';
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. Anime.js-inspired Interactive Background with Math & Physics animations */}
      <InteractiveBackground />

      {/* 2. Top Navigation Bar with Theme Switcher & Formula Bank */}
      <Navbar
        onEnterLabClick={handleEnterLab}
        onExploreClick={scrollToPreview}
        onOpenFormulas={() => setIsFormulaBankOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 3. Main Views: Interactive Simulation Curriculum & Physics Engine */}
      <main>
        {/* Hero Section with Live Interactive Physics Sandbox */}
        <HeroSection
          onEnterLabClick={handleEnterLab}
          onExploreClick={scrollToPreview}
        />

        {/* Basic Topic Previews (Click any topic to launch 2-3 simulations!) */}
        <BasicTopicPreview
          onSelectTopic={(topicId) => {
            setSelectedTopicId(topicId);
            window.location.hash = `#sim/${topicId}`;
          }}
        />

        {/* Interactive Simulation Curriculum: 6 Live Micro-Laboratories */}
        <SimulationCurriculum
          onEnterLabClick={handleEnterLab}
          onLaunchSimulation={(topicId) => {
            setSelectedTopicId(topicId);
            window.location.hash = `#sim/${topicId}`;
          }}
        />

        {/* How Visual Learning Works for Class 11 & Below */}
        <HowVisualLearningWorks />

        {/* Numerical Engine Rigor & 4th-Order Symplectic Architecture */}
        <EngineRigor />

        {/* Call to Action */}
        <LabGatewayCTA
          onEnterLabClick={handleEnterLab}
        />
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Interactive Simulation & Explanation Laboratory Modal (4-step workflow + Quiz) */}
      {selectedTopicId && (
        <TopicLabModal
          topicId={selectedTopicId}
          onClose={() => {
            setSelectedTopicId(null);
            if (window.location.hash.startsWith('#sim/') || window.location.hash.startsWith('#topic/')) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          onSelectTopic={(topicId) => {
            setSelectedTopicId(topicId);
            window.location.hash = `#sim/${topicId}`;
          }}
        />
      )}

      {/* 6. Formula Bank & Variable Index Explorer Modal */}
      {isFormulaBankOpen && (
        <FormulaBankModal
          onClose={() => setIsFormulaBankOpen(false)}
          onSelectTopic={(topicId) => {
            setIsFormulaBankOpen(false);
            setSelectedTopicId(topicId);
          }}
        />
      )}
    </div>
  );
}

export default App;
