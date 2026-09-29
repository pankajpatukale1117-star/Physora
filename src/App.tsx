import { useState, useEffect } from 'react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BasicTopicPreview } from './components/BasicTopicPreview';
import { SimulationCurriculum } from './components/SimulationCurriculum';
import { HowVisualLearningWorks } from './components/HowVisualLearningWorks';
import { LabGatewayCTA } from './components/LabGatewayCTA';
import { Footer } from './components/Footer';
import { TopicLabModal } from './components/TopicLabModal';
import { FormulaBankModal } from './components/FormulaBankModal';
import { ExperimentsView } from './components/experiments/ExperimentsView';

export function App() {
  const [activeNavTab, setActiveNavTab] = useState<'simulations' | 'experiments'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#experiments')) {
      return 'experiments';
    }
    return 'simulations';
  });

  const [initialExperimentId, setInitialExperimentId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#experiments/')) {
      return window.location.hash.replace('#experiments/', '');
    }
    return null;
  });

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

  // Synchronize browser history / URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#experiments')) {
        setActiveNavTab('experiments');
        const parts = hash.split('/');
        if (parts.length > 1 && parts[1]) {
          setInitialExperimentId(parts[1]);
        }
      } else if (hash.startsWith('#sim/') || hash.startsWith('#topic/')) {
        setActiveNavTab('simulations');
        const id = hash.replace(/^#(sim|topic)\//, '');
        if (id) setSelectedTopicId(id);
      } else {
        setActiveNavTab('simulations');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectNavTab = (tab: 'simulations' | 'experiments') => {
    setActiveNavTab(tab);
    if (tab === 'experiments') {
      window.location.hash = '#experiments';
    } else {
      if (window.location.hash.startsWith('#experiments')) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToPreview = () => {
    if (activeNavTab !== 'simulations') {
      setActiveNavTab('simulations');
      setTimeout(() => {
        const el = document.getElementById('curriculum-preview');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const el = document.getElementById('curriculum-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEnterLab = () => {
    // When clicking enter lab, switch to experiments lab or scroll to curriculum
    handleSelectNavTab('experiments');
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. Anime.js-inspired Interactive Background with Math & Physics animations */}
      <InteractiveBackground />

      {/* 2. Top Navigation Bar with Theme Switcher, Experiments Tab & Formula Bank */}
      <Navbar
        onEnterLabClick={handleEnterLab}
        onExploreClick={scrollToPreview}
        onOpenFormulas={() => setIsFormulaBankOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeTab={activeNavTab}
        onSelectTab={handleSelectNavTab}
      />

      {/* 3. Main Views: 'simulations' (Homepage / Conceptual Curriculum) or 'experiments' (Digital Laboratory) */}
      {activeNavTab === 'simulations' ? (
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
          />

          {/* How Visual Learning Works for Class 11 & Below */}
          <HowVisualLearningWorks />

          {/* Call to Action */}
          <LabGatewayCTA
            onEnterLabClick={handleEnterLab}
          />
        </main>
      ) : (
        <main>
          <ExperimentsView
            initialExperimentId={initialExperimentId}
            onBackToSimulations={() => handleSelectNavTab('simulations')}
          />
        </main>
      )}

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
