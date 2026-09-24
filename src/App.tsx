import { useState } from 'react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BasicTopicPreview } from './components/BasicTopicPreview';
import { HowVisualLearningWorks } from './components/HowVisualLearningWorks';
import { LabGatewayCTA } from './components/LabGatewayCTA';
import { Footer } from './components/Footer';
import { TopicLabModal } from './components/TopicLabModal';

export function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const scrollToPreview = () => {
    const el = document.getElementById('curriculum-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEnterLab = () => {
    // Open default topic simulation (Algebra or Motion)
    setSelectedTopicId('algebra');
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. Anime.js-inspired Interactive Background with Math & Physics animations */}
      <InteractiveBackground />

      {/* 2. Top Navigation Bar */}
      <Navbar
        onEnterLabClick={handleEnterLab}
        onExploreClick={scrollToPreview}
      />

      {/* 3. Hero Section ("See Mathematics. Feel Physics.") */}
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

      {/* 8. Interactive Simulation & Explanation Laboratory Modal */}
      {selectedTopicId && (
        <TopicLabModal
          topicId={selectedTopicId}
          onClose={() => setSelectedTopicId(null)}
          onSelectTopic={(topicId) => setSelectedTopicId(topicId)}
        />
      )}
    </div>
  );
}

export default App;
