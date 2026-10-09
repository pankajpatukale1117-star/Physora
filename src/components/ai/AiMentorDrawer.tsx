import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Zap,
  Bot,
  ArrowRight
} from 'lucide-react';
import { MathView } from '../MathView';
import { useAuth } from '../../context/AuthContext';
import type { TopicData, SimulationConfig } from '../../data/topicsData';

interface AiMentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicData;
  simulation: SimulationConfig;
  params: Record<string, number>;
  telemetry: Record<string, string>;
  onOpenPricing: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  mathFormula?: string;
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
  const { isPro } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hello! I'm your Physora AI Science Tutor. I'm actively analyzing your experiment on ${simulation.name} (${topic.title}) with ${Object.keys(params).length} controls configured. Ask me anything about the governing equations or what will happen if you tweak your sliders!`
    }
  ]);
  const [queryCount, setQueryCount] = useState(0);

  if (!isOpen) return null;

  // Preset Socratic Prompts
  const quickPrompts = [
    `Explain the mathematical relationship between the current controls and telemetry.`,
    `What happens if I double the primary control variable?`,
    `Give me a challenging concept question based on these exact values.`,
    `How does this concept appear in JEE Advanced / NEET / AP Physics?`
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setInputMessage('');
    setQueryCount((prev) => prev + 1);

    // Generate intelligent simulation-aware Socratic explanation
    setTimeout(() => {
      let responseText = '';
      let responseFormula = topic.keyFormulas[0]?.formula;

      const lower = query.toLowerCase();
      if (lower.includes('relationship') || lower.includes('mathematical') || lower.includes('equation')) {
        responseText = `In this ${simulation.name} model, your independent variables directly govern the system state via the fundamental equations of ${topic.title}. Notice that changes propagate non-linearly when quadratic or inverse-square dependencies are involved.`;
      } else if (lower.includes('double') || lower.includes('increase')) {
        responseText = `If you double your main parameter, watch your telemetry outputs closely. For example, if velocity doubles, kinetic energy quadruples ($E_k \\propto v^2$), while momentum merely doubles ($p \\propto v$). Test this right now by nudging the slider!`;
      } else if (lower.includes('jee') || lower.includes('neet') || lower.includes('exam')) {
        responseText = `In competitive examinations like JEE Advanced and NEET, examiners frequently test limiting cases: what happens as friction approaches zero, or when angles equal $45^\\circ$ or $90^\\circ$? In Physora, you can verify these edge cases visually before solving analytical derivations.`;
      } else if (lower.includes('challenge') || lower.includes('question')) {
        responseText = `Here is your conceptual challenge: Without altering the external constraints, calculate what exact parameter values are required to increase the primary telemetry output by exactly $50\\%$. Verify your calculation by setting the sliders!`;
      } else {
        responseText = `Based on your current telemetry (${Object.entries(telemetry).slice(0, 3).map(([k, v]) => `${k} = ${v}`).join(', ')}), the system is behaving strictly according to ${topic.keyFormulas[0]?.explanation || 'first-principles physics'}. Pay special attention to the conservation laws at play here.`;
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: responseText,
          mathFormula: responseFormula
        }
      ]);
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '430px',
        zIndex: 10001,
        background: 'var(--bg-card, #FFFFFF)',
        borderLeft: '1px solid var(--border-medium, #E2E8F0)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'physoraDrawerIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
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
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Physora AI Tutor
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isPro ? '#10B98120' : '#2563EB20',
                  color: isPro ? '#10B981' : '#2563EB'
                }}
              >
                {isPro ? 'PRO UNLIMITED' : 'FREE PREVIEW'}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Context-Aware Socratic Science Mentor
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Close AI Tutor"
        >
          <X size={20} />
        </button>
      </div>

      {/* Real-time Telemetry Context Capsule */}
      <div
        style={{
          padding: '10px 16px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>
          Observing: <strong>{simulation.name}</strong>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--electric-blue)' }}>
          {Object.keys(telemetry).length} telemetry points active
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
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <Bot size={14} />
              </div>
            )}

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background:
                  msg.role === 'user'
                    ? 'var(--electric-blue, #2563EB)'
                    : 'var(--bg-subtle, #F8FAFC)',
                color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '0.84rem',
                lineHeight: 1.55,
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-medium)'
              }}
            >
              <div>{msg.text}</div>

              {msg.mathFormula && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '6px 10px',
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.15)' : 'var(--bg-card)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.90rem'
                  }}
                >
                  <MathView math={msg.mathFormula} block={false} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Free Tier Callout if user asks several questions */}
        {!isPro && queryCount >= 3 && (
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
              Enjoying the AI Science Tutor?
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
              Upgrade to <strong>Physora Pro</strong> for unlimited AI tutoring, step-by-step derivations, and full exam prep.
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
              <Zap size={14} /> Unlock Unlimited AI Mentor
            </button>
          </div>
        )}
      </div>

      {/* Preset Quick Prompts */}
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
        <span style={{ fontSize: '0.70rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-tertiary)' }}>
          Suggested Socratic Prompts:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {quickPrompts.slice(0, 2).map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(p)}
              style={{
                textAlign: 'left',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p}
              </span>
              <ArrowRight size={12} color="var(--text-tertiary)" />
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
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card)'
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask AI tutor about these formulas or variables..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-subtle)',
            fontSize: '0.84rem',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          style={{
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--electric-blue, #2563EB)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Send query"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
