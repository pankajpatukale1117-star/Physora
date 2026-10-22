// ============================================================================
// PHYSORA 3D HUMAN ANATOMY QUIZ & STUDY ENGINE
// Gamified 3D Spatial Identification Challenges with Real-Time Medical Feedback
// ============================================================================

import React, { useState } from 'react';
import {
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Eye,
  X,
  Sparkles
} from 'lucide-react';
import { ANATOMY_STRUCTURES } from '../../data/anatomyData';

export interface QuizQuestion {
  id: string;
  targetStructureId: string;
  name: string;
  latinName: string;
  systemName: string;
  systemColor: string;
  hint: string;
  educationalFact: string;
}

const ANATOMY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q_heart',
    targetStructureId: 'heart',
    name: 'Heart',
    latinName: 'Cor',
    systemName: 'Cardiovascular',
    systemColor: '#EF4444',
    hint: 'Located inside the thoracic cavity in the mediastinum, tilted slightly to the left.',
    educationalFact: 'The human heart beats approximately 100,000 times each day, circulating 2,000 gallons of blood.'
  },
  {
    id: 'q_brain',
    targetStructureId: 'brain',
    name: 'Brain',
    latinName: 'Encephalon',
    systemName: 'Nervous',
    systemColor: '#A855F7',
    hint: 'Enclosed within the neurocranium at the superior pole of the body.',
    educationalFact: 'Containing ~86 billion neurons, the brain consumes 20% of the body\'s total resting metabolic energy.'
  },
  {
    id: 'q_lungs',
    targetStructureId: 'lungs',
    name: 'Lungs',
    latinName: 'Pulmones',
    systemName: 'Respiratory',
    systemColor: '#06B6D4',
    hint: 'Paired spongy organs flanking the heart within the rib cage.',
    educationalFact: 'The total surface area of all alveoli in human lungs is roughly 70 square meters—about the size of half a tennis court!'
  },
  {
    id: 'q_liver',
    targetStructureId: 'liver',
    name: 'Liver',
    latinName: 'Hepar',
    systemName: 'Digestive',
    systemColor: '#F59E0B',
    hint: 'The largest internal visceral organ, situated in the upper right abdominal quadrant beneath the diaphragm.',
    educationalFact: 'The liver performs over 500 vital metabolic functions and is the only human organ capable of complete self-regeneration.'
  },
  {
    id: 'q_kidneys',
    targetStructureId: 'kidneys',
    name: 'Kidneys',
    latinName: 'Renes',
    systemName: 'Urinary',
    systemColor: '#EAB308',
    hint: 'Bean-shaped retroperitoneal organs positioned on either side of the vertebral column.',
    educationalFact: 'Every 24 hours, the kidneys filter about 180 liters of blood plasma, excreting metabolic wastes as urine.'
  },
  {
    id: 'q_spine',
    targetStructureId: 'spine',
    name: 'Vertebral Column (Spine)',
    latinName: 'Columna vertebralis',
    systemName: 'Skeletal',
    systemColor: '#E2E8F0',
    hint: 'Forms the posterior central axis of the human skeleton, protecting the spinal cord.',
    educationalFact: 'Humans are born with 33 vertebrae, which fuse into 26 distinct articulated bones in adults.'
  },
  {
    id: 'q_skull',
    targetStructureId: 'skull',
    name: 'Cranium (Skull)',
    latinName: 'Cranium',
    systemName: 'Skeletal',
    systemColor: '#E2E8F0',
    hint: 'The bony vault supporting the structures of the face and enclosing the brain.',
    educationalFact: 'The adult human skull comprises 22 bones joined together by rigid, fibrous interlocking sutures.'
  },
  {
    id: 'q_stomach',
    targetStructureId: 'stomach',
    name: 'Stomach',
    latinName: 'Gaster',
    systemName: 'Digestive',
    systemColor: '#F59E0B',
    hint: 'J-shaped muscular organ in the upper left quadrant between the esophagus and duodenum.',
    educationalFact: 'Stomach acid (hydrochloric acid, pH 1.5–2.0) is potent enough to dissolve metal, requiring the mucosa to renew every 3–4 days.'
  },
  {
    id: 'q_deltoids',
    targetStructureId: 'deltoids',
    name: 'Deltoid Muscle',
    latinName: 'Musculus deltoideus',
    systemName: 'Muscular',
    systemColor: '#EF4444',
    hint: 'Triangular muscle capping the rounded contour of the anatomical shoulder joint.',
    educationalFact: 'The deltoid is the prime mover of arm abduction along the frontal plane, divided into anterior, lateral, and posterior heads.'
  },
  {
    id: 'q_quads',
    targetStructureId: 'quadriceps_femoris',
    name: 'Quadriceps Femoris',
    latinName: 'Musculus quadriceps femoris',
    systemName: 'Muscular',
    systemColor: '#EF4444',
    hint: 'Large four-headed extensor muscle group covering the anterior compartment of the thigh.',
    educationalFact: 'The quadriceps is the strongest muscle group in the human body, generating the power required to walk, jump, and run.'
  }
];

export interface AnatomyQuizEngineProps {
  isMobile: boolean;
  onSelectStructure: (id: string | null) => void;
  onExitQuiz: () => void;
  activeAnswerId: string | null;
  onResetAnswer: () => void;
}

export const AnatomyQuizEngine: React.FC<AnatomyQuizEngineProps> = ({
  isMobile,
  onSelectStructure,
  onExitQuiz,
  activeAnswerId,
  onResetAnswer
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'answering' | 'correct' | 'incorrect' | 'revealed'>('answering');
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = ANATOMY_QUIZ_QUESTIONS[questionIndex];

  // Handle external structure click from 3D Canvas
  React.useEffect(() => {
    if (!activeAnswerId || status !== 'answering') return;

    const answerId = activeAnswerId;
    onResetAnswer();

    queueMicrotask(() => {
      setLastClickedId(answerId);
      if (answerId === currentQ.targetStructureId) {
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => (newStreak > b ? newStreak : b));
          setScore((sc) => sc + 100 + newStreak * 20);
          return newStreak;
        });
        setStatus('correct');
      } else {
        setStreak(0);
        setStatus('incorrect');
      }
    });
  }, [activeAnswerId, currentQ, status, onResetAnswer]);

  const handleNext = () => {
    if (questionIndex >= ANATOMY_QUIZ_QUESTIONS.length - 1) {
      setIsCompleted(true);
    } else {
      setQuestionIndex((prev) => prev + 1);
      setStatus('answering');
      setShowHint(false);
      setLastClickedId(null);
      onSelectStructure(null);
    }
  };

  const handleReveal = () => {
    setStatus('revealed');
    setStreak(0);
    onSelectStructure(currentQ.targetStructureId);
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setStatus('answering');
    setShowHint(false);
    setLastClickedId(null);
    setIsCompleted(false);
    onSelectStructure(null);
  };

  // --------------------------------------------------------------------------
  // COMPLETED SUMMARY VIEW
  // --------------------------------------------------------------------------
  if (isCompleted) {
    const accuracy = Math.round((score / (ANATOMY_QUIZ_QUESTIONS.length * 120)) * 100);
    return (
      <div
        style={{
          position: 'absolute',
          top: isMobile ? 64 : 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 80,
          width: isMobile ? 'calc(100vw - 32px)' : 440,
          background: 'rgba(11, 17, 32, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 20,
          padding: '24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
          textAlign: 'center',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(56, 189, 248, 0.25))',
            border: '2px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#10B981'
          }}
        >
          <Award size={32} />
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px', color: '#FFFFFF' }}>
          Anatomy Lab Mastery
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 20px' }}>
          You completed all {ANATOMY_QUIZ_QUESTIONS.length} clinical 3D identification challenges!
        </p>

        {/* Score Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 20
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: '12px 6px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38BDF8' }}>{score}</div>
            <div style={{ fontSize: '0.66rem', color: '#94A3B8', textTransform: 'uppercase' }}>Points</div>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: '12px 6px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981' }}>{accuracy}%</div>
            <div style={{ fontSize: '0.66rem', color: '#94A3B8', textTransform: 'uppercase' }}>Accuracy</div>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: '12px 6px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F59E0B' }}>{bestStreak} 🔥</div>
            <div style={{ fontSize: '0.66rem', color: '#94A3B8', textTransform: 'uppercase' }}>Best Streak</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleRestart}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <RotateCcw size={15} />
            <span>Play Again</span>
          </button>
          <button
            type="button"
            onClick={onExitQuiz}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none',
              color: '#000000',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Sparkles size={15} />
            <span>Explore 3D</span>
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ACTIVE QUESTION BANNER (RESPONSIVE DESKTOP & MOBILE)
  // --------------------------------------------------------------------------
  const clickedStructure = lastClickedId ? ANATOMY_STRUCTURES[lastClickedId] : null;

  return (
    <div
      style={{
        position: 'absolute',
        ...(isMobile
          ? {
              bottom: 84,
              left: 12,
              right: 12,
              maxWidth: 520,
              margin: '0 auto'
            }
          : {
              top: 72,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 580,
              maxWidth: 'calc(100vw - 32px)'
            }),
        zIndex: 65,
        background: 'rgba(11, 17, 32, 0.94)',
        backdropFilter: 'blur(16px)',
        border:
          status === 'correct'
            ? '1px solid #10B981'
            : status === 'incorrect'
            ? '1px solid #EF4444'
            : '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: 18,
        padding: isMobile ? '12px 14px' : '14px 18px',
        boxShadow:
          status === 'correct'
            ? '0 16px 40px rgba(16, 185, 129, 0.35)'
            : '0 16px 40px rgba(0, 0, 0, 0.7)',
        color: '#FFFFFF',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top Meta Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Question {questionIndex + 1}/{ANATOMY_QUIZ_QUESTIONS.length}
          </span>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 12,
              background: `${currentQ.systemColor}22`,
              color: currentQ.systemColor,
              border: `1px solid ${currentQ.systemColor}44`
            }}
          >
            {currentQ.systemName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {streak > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: '0.70rem',
                fontWeight: 800,
                color: '#F59E0B'
              }}
            >
              <Flame size={13} fill="#F59E0B" />
              <span>{streak} Streak</span>
            </div>
          )}
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8' }}>
            {score} pts
          </div>
          <button
            type="button"
            onClick={onExitQuiz}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center'
            }}
            title="Exit Quiz"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Prompt */}
      {status === 'answering' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: '0.80rem', color: '#94A3B8' }}>Locate on 3D body:</span>
            <strong style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 900 }}>
              {currentQ.name}
            </strong>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontStyle: 'italic' }}>
              ({currentQ.latinName})
            </span>
          </div>

          {/* Hint Disclosure */}
          {showHint ? (
            <div
              style={{
                marginTop: 6,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontSize: '0.72rem',
                color: '#BAE6FD',
                lineHeight: 1.4
              }}
            >
              <strong style={{ color: '#38BDF8' }}>Clue: </strong>
              {currentQ.hint}
            </div>
          ) : null}

          {/* Prompt Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: showHint ? '#38BDF8' : '#CBD5E1',
                  borderRadius: 14,
                  padding: '3px 9px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <HelpCircle size={12} />
                <span>{showHint ? 'Hide Clue' : 'Hint'}</span>
              </button>

              <button
                type="button"
                onClick={handleReveal}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94A3B8',
                  borderRadius: 14,
                  padding: '3px 9px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Eye size={12} />
                <span>Reveal</span>
              </button>
            </div>

            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
              Rotate &amp; tap structure
            </span>
          </div>
        </div>
      )}

      {/* Correct Feedback */}
      {status === 'correct' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#10B981',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={16} />
            </div>
            <strong style={{ fontSize: '0.94rem', color: '#34D399', fontWeight: 900 }}>
              Correct! Identified {currentQ.name}!
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800, marginLeft: 'auto' }}>
              +100 pts
            </span>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: '0.73rem', color: '#CBD5E1', lineHeight: 1.45 }}>
            {currentQ.educationalFact}
          </p>

          <button
            type="button"
            onClick={handleNext}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: 10,
              background: '#10B981',
              border: 'none',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>Next Question</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Incorrect Feedback */}
      {status === 'incorrect' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#EF4444',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <XCircle size={16} />
            </div>
            <strong style={{ fontSize: '0.88rem', color: '#F87171', fontWeight: 800 }}>
              {clickedStructure ? `That was the ${clickedStructure.name}.` : 'Incorrect structure.'}
            </strong>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: '0.72rem', color: '#CBD5E1', lineHeight: 1.4 }}>
            Look closer for the <strong style={{ color: '#FFFFFF' }}>{currentQ.name}</strong>. {currentQ.hint}
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setStatus('answering')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleReveal}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.18)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38BDF8',
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <Eye size={13} />
              <span>Show Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Revealed Feedback */}
      {status === 'revealed' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Eye size={18} color="#38BDF8" />
            <strong style={{ fontSize: '0.88rem', color: '#38BDF8', fontWeight: 800 }}>
              Revealed: {currentQ.name} ({currentQ.latinName})
            </strong>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: '0.72rem', color: '#CBD5E1', lineHeight: 1.45 }}>
            {currentQ.educationalFact}
          </p>

          <button
            type="button"
            onClick={handleNext}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.25)',
              border: '1px solid #38BDF8',
              color: '#38BDF8',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>Continue to Next Question</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
