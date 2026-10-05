import { useState, useEffect } from 'react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SimulationLibrary } from './components/SimulationLibrary';
import { SimulationCurriculum } from './components/SimulationCurriculum';
import { HowVisualLearningWorks } from './components/HowVisualLearningWorks';
import { FeaturedExperiments } from './components/FeaturedExperiments';
import { WhyPhysora } from './components/WhyPhysora';
import { LabGatewayCTA } from './components/LabGatewayCTA';
import { Footer } from './components/Footer';
import { TopicLabModal } from './components/TopicLabModal';
import { ExperimentsView } from './components/experiments/ExperimentsView';
import { FormulaBankModal } from './components/FormulaBankModal';
import { SearchModal } from './components/SearchModal';
import { X } from 'lucide-react';

export function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#sim/')) return hash.replace('#sim/', '');
      if (hash.startsWith('#topic/')) return hash.replace('#topic/', '');
    }
    return null;
  });

  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#exp/')) return hash.replace('#exp/', '');
      if (hash.startsWith('#experiments/')) return hash.replace('#experiments/', '');
    }
    return null;
  });

  const [isFormulaBankOpen, setIsFormulaBankOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Clean Light-First Scientific Laboratory Theme Default
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('physora-theme-v5');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Fallback
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('physora-theme-v5', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Synchronize browser history / URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#sim/') || hash.startsWith('#topic/')) {
        const id = hash.replace(/^#(sim|topic)\//, '');
        if (id) {
          setSelectedTopicId(id);
          setSelectedExperimentId(null);
        }
      } else if (hash.startsWith('#exp/') || hash.startsWith('#experiments/')) {
        const id = hash.replace(/^#(exp|experiments)\//, '');
        if (id) {
          setSelectedExperimentId(id);
          setSelectedTopicId(null);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToSimulations = () => {
    const el = document.getElementById('simulations-library');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToExperiments = () => {
    const el = document.getElementById('experiments-lab');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToExplore = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnterLab = () => {
    setSelectedTopicId('motion');
    window.location.hash = '#sim/motion';
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setSelectedExperimentId(null);
    window.location.hash = `#sim/${topicId}`;
  };

  const handleSelectExperiment = (expId: string) => {
    setSelectedExperimentId(expId);
    setSelectedTopicId(null);
    window.location.hash = `#exp/${expId}`;
  };

  const handleCloseExperiment = () => {
    setSelectedExperimentId(null);
    if (window.location.hash.startsWith('#exp/') || window.location.hash.startsWith('#experiments/')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. Calm, lightweight scientific technical grid background */}
      <InteractiveBackground />

      {/* 2. Professional Top Navigation Bar */}
      <Navbar
        onEnterLabClick={handleEnterLab}
        onExploreClick={scrollToExplore}
        onSimulationsClick={scrollToSimulations}
        onExperimentsClick={scrollToExperiments}
        onOpenFormulas={() => setIsFormulaBankOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 3. Main Educational Application Structure */}
      <main>
        {/* Hero Section with Live 2D Physics Laboratory Sandbox */}
        <HeroSection
          onEnterLabClick={handleEnterLab}
          onExploreSimulations={scrollToSimulations}
          onExploreExperiments={scrollToExperiments}
          onOpenFormulas={() => setIsFormulaBankOpen(true)}
        />

        {/* 14 Curriculum Topics & 42-Simulation Discovery Library */}
        <SimulationLibrary
          onSelectTopic={handleSelectTopic}
          onOpenFormulas={() => setIsFormulaBankOpen(true)}
        />

        {/* 6 Featured Micro-Laboratories */}
        <SimulationCurriculum
          onEnterLabClick={handleEnterLab}
          onLaunchSimulation={handleSelectTopic}
        />

        {/* 4-Step Scientific Inquiry Cycle: Explore → Change → Observe → Understand */}
        <HowVisualLearningWorks />

        {/* Digital Experiments Lab (Predict → Experiment → Observe → Explain) */}
        <FeaturedExperiments onSelectExperiment={handleSelectExperiment} />

        {/* Why Physora: 4 Core Educational Pillars */}
        <WhyPhysora />

        {/* Lab Gateway Call to Action Banner */}
        <LabGatewayCTA onEnterLabClick={handleEnterLab} />
      </main>

      {/* 4. Clean Academic Footer */}
      <Footer />

      {/* 5. Virtual Laboratory Simulation Modal (42 Active Models) */}
      {selectedTopicId && (
        <TopicLabModal
          topicId={selectedTopicId}
          onClose={() => {
            setSelectedTopicId(null);
            if (window.location.hash.startsWith('#sim/') || window.location.hash.startsWith('#topic/')) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {/* 6. Digital Experiments Laboratory Modal (8 Scientific Inquiry Labs) */}
      {selectedExperimentId && (
        <div
          className="experiment-modal-overlay"
          onClick={handleCloseExperiment}
          role="dialog"
          aria-modal="true"
          aria-label="Digital Experiment Studio"
        >
          <div
            className="experiment-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Close Button Bar */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 18,
                zIndex: 100
              }}
            >
              <button
                onClick={handleCloseExperiment}
                className="btn btn-secondary btn-sm"
                style={{
                  width: 34,
                  height: 34,
                  padding: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)'
                }}
                title="Close Experiment Lab (Esc)"
                aria-label="Close Experiment Lab"
              >
                <X size={18} />
              </button>
            </div>

            {/* Experiment Studio View */}
            <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
              <ExperimentsView
                initialExperimentId={selectedExperimentId}
                onBackToSimulations={handleCloseExperiment}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. Formula Bank & Variable Index Explorer Modal */}
      {isFormulaBankOpen && (
        <FormulaBankModal
          onClose={() => setIsFormulaBankOpen(false)}
          onSelectTopic={(topicId) => {
            setIsFormulaBankOpen(false);
            handleSelectTopic(topicId);
          }}
        />
      )}

      {/* 8. Global Instant Search Modal (Cmd+K or /) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTopic={handleSelectTopic}
        onSelectExperiment={handleSelectExperiment}
        onOpenFormulas={() => setIsFormulaBankOpen(true)}
      />
    </div>
  );
}

export default App;
