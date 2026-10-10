import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Zap,
  Bot,
  ArrowRight,
  Globe,
  Lock,
  ExternalLink
} from 'lucide-react';
import { MathView } from '../MathView';
import { useSubscription } from '../../context/SubscriptionContext';
import type { TopicData, SimulationConfig } from '../../data/topicsData';
import {
  sendMentorMessage,
  type MentorChatMessage
} from '../../services/aiMentorService';
import { audioFX } from '../../utils/audioEffects';

interface AiMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicData;
  simulation: SimulationConfig;
  params: Record<string, number>;
  telemetry: Record<string, string>;
  onOpenPricing: () => void;
}

export const AiMentorDrawer: React.FC<AiMentorDrawerProps> = ({
  isOpen,
  onClose,
  topic,
  simulation,
  params,
  telemetry,
  onOpenPricing
}) => {
  const {
    tier,
    remainingAiQueries,
    canUseAiTutor,
    incrementAiQueries,
    triggerPaywall
  } = useSubscription();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MentorChatMessage[]>([
    {
      role: 'assistant',
      text: `Yo! I'm Arya, your Physora study buddy & science partner. 🚀\n\nI'm watching your live simulation on **${simulation.name}** (${topic.title}) in real-time. Ask me literally anything—from how this physics works in real life to crazy sci-fi questions, JEE/NEET shortcuts, or tap a Sim Mission below to test your intuition!`,
      mathFormula: topic.keyFormulas[0]?.formula
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Addictive gamified quick prompts
  const addictivePrompts = [
    {
      label: '🎮 Give me a Sim Mission!',
      prompt: `Give me a fun, gamified Sim Mission based on this exact ${simulation.name} lab! Tell me what target values to hit with my sliders.`
    },
    {
      label: '🧠 Explain like I am 12',
      prompt: `Explain what is happening in this ${simulation.name} experiment using an absurdly fun everyday analogy (like gaming, sports, or food) so it clicks instantly.`
    },
    {
      label: '⚡ Why is this so cool in real life?',
      prompt: `Where does this exact principle of ${topic.title} show up in real-world technology, space exploration, or extreme engineering?`
    },
    {
      label: '🎯 JEE / NEET Exam Trap',
      prompt: `What is the trickiest conceptual trap examiners set on ${topic.title} in JEE Advanced and NEET? How do I spot it in 5 seconds?`
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    // Check Free tier limit (3 queries per session/day for free users)
    if (!canUseAiTutor()) {
      triggerPaywall('ai_tutor', 'PRO');
      onOpenPricing();
      return;
    }

    const allowed = incrementAiQueries();
    if (!allowed) {
      onOpenPricing();
      return;
    }

    audioFX.playTick();
    const userMsg: MentorChatMessage = { role: 'user', text: query.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMentorMessage(query.trim(), messages, {
        topicTitle: topic.title,
        topicCategory: topic.category,
        topicIntro: topic.conceptIntro,
        simulationName: simulation.name,
        simulationDesc: simulation.description,
        params,
        telemetry,
        keyFormulas: topic.keyFormulas
      });

      audioFX.playSuccessChime();
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          text: response.text,
          mathFormula: response.mathFormula,
          webSources: response.webSources,
          groundingUsed: response.groundingUsed
        }
      ]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          text: `Ayy, my neural connection had a momentary flicker. Let's try that again! What slider were you tweaking?`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '450px',
        zIndex: 10001,
        background: 'var(--bg-card, #FFFFFF)',
        borderLeft: '1px solid var(--border-medium, #E2E8F0)',
        boxShadow: '-12px 0 45px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'physoraDrawerIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle, #F1F5F9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Arya (AI Study Buddy)
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: tier !== 'FREE' ? '#10B98120' : remainingAiQueries > 0 ? '#2563EB20' : 'rgba(239, 68, 68, 0.2)',
                  color: tier !== 'FREE' ? '#10B981' : remainingAiQueries > 0 ? '#2563EB' : '#EF4444'
                }}
              >
                {tier !== 'FREE' ? 'PRO UNLIMITED' : `${remainingAiQueries}/3 FREE`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Socratic STEM Mentor
              </span>
              <span style={{ fontSize: '0.70rem', color: 'var(--text-tertiary)' }}>•</span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  color: '#059669'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 8px #10B981'
                  }}
                />
                <span>Live Gemini AI Active</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'var(--bg-subtle, #F1F5F9)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          aria-label="Close AI Tutor"
        >
          <X size={16} />
        </button>
      </div>

      {/* Real-time Telemetry Context Capsule */}
      <div
        style={{
          padding: '8px 18px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
          Lab: <strong>{simulation.name}</strong>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', color: '#2563EB', fontWeight: 700, fontSize: '0.72rem' }}>
          {Object.keys(params).length} controls • {Object.keys(telemetry).length} telemetry
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '10px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%'
            }}
          >
            {msg.role === 'assistant' && (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Bot size={15} />
              </div>
            )}

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    : 'var(--bg-subtle, #F8FAFC)',
                color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-medium)',
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

              {/* Render Math formula card if present */}
              {msg.mathFormula && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.18)' : 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.94rem'
                  }}
                >
                  <MathView math={msg.mathFormula} block={false} />
                </div>
              )}

              {/* Real-time Google Search grounding sources */}
              {msg.webSources && msg.webSources.length > 0 && (
                <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Globe size={11} />
                    <span>Verified via Google Search (Live Web):</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {msg.webSources.map((s, si) => (
                      <a
                        key={si}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.68rem',
                          color: '#2563EB',
                          background: 'var(--bg-card)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-medium)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.title}
                        </span>
                        <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Loading / Thinking Indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0
              }}
            >
              <Bot size={15} />
            </div>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span className="animate-spin">⚡</span>
              <span>Arya is analyzing simulation & computing response...</span>
            </div>
          </div>
        )}

        {/* Free Tier Callout if user exhausted queries */}
        {tier === 'FREE' && remainingAiQueries === 0 && (
          <div
            style={{
              margin: '10px 0',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))',
              border: '1px solid #2563EB40',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Addicted to the AI Mentor?
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
              Upgrade to <strong>Physora Pro</strong> for unlimited interactive tutoring, deep Socratic missions, and exam prep.
            </p>
            <button
              type="button"
              onClick={onOpenPricing}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFFFFF',
                fontSize: '0.80rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Zap size={14} /> Unlock Unlimited AI Mentor (₹499)
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Gamified Sim Mission Quick Buttons */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'var(--bg-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            ⚡ Socratic Power Prompts:
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {addictivePrompts.map((item, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(item.prompt)}
              style={{
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              <ArrowRight size={11} color="var(--text-tertiary)" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Field Bar */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'var(--bg-card)'
        }}
      >
        {tier === 'FREE' && remainingAiQueries === 0 ? (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontSize: '0.78rem', fontWeight: 700 }}>
              <Lock size={14} />
              <span>Free Query Limit Reached (3/3 used today)</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
              Upgrade to Physora Pro for unlimited step-by-step guidance, deep derivations, and live Socratic missions.
            </p>
            <button
              type="button"
              onClick={() => {
                triggerPaywall('ai_tutor', 'PRO');
                onOpenPricing();
              }}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                color: '#FFFFFF',
                fontSize: '0.80rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Sparkles size={13} />
              <span>Unlock Unlimited AI Mentor with Pro (₹499)</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={inputMessage}
              disabled={isLoading}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isLoading
                  ? 'Arya is thinking...'
                  : tier === 'FREE'
                  ? `Ask Arya anything (${remainingAiQueries} free left)...`
                  : 'Ask Arya any question, formula, or exam trap...'
              }
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-subtle)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              disabled={isLoading || !inputMessage.trim()}
              onClick={() => handleSendMessage()}
              style={{
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                background: inputMessage.trim() && !isLoading ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'var(--border-medium)',
                color: inputMessage.trim() && !isLoading ? '#FFFFFF' : 'var(--text-tertiary)',
                cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              aria-label="Send query"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
