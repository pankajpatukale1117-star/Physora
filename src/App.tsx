import { useState, useEffect } from 'react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BasicTopicPreview } from './components/BasicTopicPreview';
import { HowVisualLearningWorks } from './components/HowVisualLearningWorks';
import { LabGatewayCTA } from './components/LabGatewayCTA';
import { Footer } from './components/Footer';
import { TopicLabModal } from './components/TopicLabModal';
import { FormulaBankModal } from './components/FormulaBankModal';

export function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isFormulaBankOpen, setIsFormulaBankOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('physora-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Fallback
    }
    return 'dark'; // Dark obsidian theme default, inspired by physora.org
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('physora-theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToPreview = () => {
    const el = document.getElementById('curriculum-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEnterLab = () => {
    // Open default topic simulation (Motion or Algebra)
    setSelectedTopicId('motion');
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

      {/* 3. Hero Section with Live Interactive Physics Sandbox */}
      <main>
        <HeroSection
          onEnterLabClick={handleEnterLab}
          onExploreClick={scrollToPreview}
        />

        {/* 4. Basic Topic Previews (Click any topic to launch 2-3 simulations!) */}
        <BasicTopicPreview
          onSelectTopic={(topicId) => setSelectedTopicId(topicId)}
        />

        {/* 5. How Visual Learning Works for Class 11 & Below */}
        <HowVisualLearningWorks />

        {/* 6. Call to Action */}
        <LabGatewayCTA
          onEnterLabClick={handleEnterLab}
        />
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* 8. Interactive Simulation & Explanation Laboratory Modal (4-step workflow + Quiz) */}
      {selectedTopicId && (
        <TopicLabModal
          topicId={selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onSelectTopic={(topicId) => setSelectedTopicId(topicId)}
        />
      )}

      {/* 9. Formula Bank & Variable Index Explorer Modal */}
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
