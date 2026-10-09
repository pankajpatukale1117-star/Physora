import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { MembershipTier } from '../types/auth';

export type SubscriptionTier = 'FREE' | 'PRO' | 'EDUCATOR';

export interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  // AI Tutor Limits
  aiQueriesUsed: number;
  maxFreeAiQueries: number;
  remainingAiQueries: number;
  canUseAiTutor: () => boolean;
  incrementAiQueries: () => boolean;
  resetAiQueries: () => void;
  // Feature Gating Checks
  canExportPdf: () => boolean;
  canUsePresenterMode: () => boolean;
  // Paywall Modal State
  isPaywallOpen: boolean;
  paywallReason: 'pdf_export' | 'ai_tutor' | 'presenter_mode' | null;
  paywallTargetTier: 'PRO' | 'EDUCATOR';
  triggerPaywall: (reason: 'pdf_export' | 'ai_tutor' | 'presenter_mode', targetTier?: 'PRO' | 'EDUCATOR') => void;
  closePaywall: () => void;
  upgradeTier: (targetTier: SubscriptionTier) => Promise<void>;
}

const STORAGE_KEY_TIER = 'physora_sub_tier_v2';
const STORAGE_KEY_AI_COUNT = 'physora_ai_queries_count_v2';
const STORAGE_KEY_AI_DATE = 'physora_ai_queries_date_v2';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  // Tier State: default FREE unless user profile or local storage indicates otherwise
  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TIER);
      if (stored === 'PRO' || stored === 'EDUCATOR' || stored === 'FREE') {
        return stored;
      }
    } catch {
      // Ignore
    }
    return 'FREE';
  });

  // Keep in sync with AuthContext if user logs in with existing plan
  useEffect(() => {
    if (auth.membershipTier === 'institution') {
      setTierState('EDUCATOR');
    } else if (auth.membershipTier === 'pro') {
      setTierState('PRO');
    }
  }, [auth.membershipTier]);

  // AI Tutor Query Usage tracking (reset daily or per session)
  const maxFreeAiQueries = 3;
  const [aiQueriesUsed, setAiQueriesUsed] = useState<number>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem(STORAGE_KEY_AI_DATE);
      if (savedDate !== today) {
        localStorage.setItem(STORAGE_KEY_AI_DATE, today);
        localStorage.setItem(STORAGE_KEY_AI_COUNT, '0');
        return 0;
      }
      const count = parseInt(localStorage.getItem(STORAGE_KEY_AI_COUNT) || '0', 10);
      return isNaN(count) ? 0 : count;
    } catch {
      return 0;
    }
  });

  // Paywall Modal Management
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'pdf_export' | 'ai_tutor' | 'presenter_mode' | null>(null);
  const [paywallTargetTier, setPaywallTargetTier] = useState<'PRO' | 'EDUCATOR'>('PRO');

  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    try {
      localStorage.setItem(STORAGE_KEY_TIER, newTier);
    } catch {
      // Ignore
    }
  };

  const remainingAiQueries = tier === 'FREE' ? Math.max(0, maxFreeAiQueries - aiQueriesUsed) : 9999;

  const canUseAiTutor = (): boolean => {
    if (tier === 'PRO' || tier === 'EDUCATOR') return true;
    return aiQueriesUsed < maxFreeAiQueries;
  };

  const incrementAiQueries = (): boolean => {
    if (tier === 'PRO' || tier === 'EDUCATOR') {
      return true;
    }
    if (aiQueriesUsed >= maxFreeAiQueries) {
      triggerPaywall('ai_tutor', 'PRO');
      return false;
    }
    const next = aiQueriesUsed + 1;
    setAiQueriesUsed(next);
    try {
      localStorage.setItem(STORAGE_KEY_AI_COUNT, String(next));
    } catch {
      // Ignore
    }
    return true;
  };

  const resetAiQueries = () => {
    setAiQueriesUsed(0);
    try {
      localStorage.setItem(STORAGE_KEY_AI_COUNT, '0');
    } catch {
      // Ignore
    }
  };

  const canExportPdf = (): boolean => {
    return tier === 'PRO' || tier === 'EDUCATOR';
  };

  const canUsePresenterMode = (): boolean => {
    return tier === 'EDUCATOR';
  };

  const triggerPaywall = (
    reason: 'pdf_export' | 'ai_tutor' | 'presenter_mode',
    targetTier: 'PRO' | 'EDUCATOR' = 'PRO'
  ) => {
    setPaywallReason(reason);
    setPaywallTargetTier(targetTier);
    setIsPaywallOpen(true);
  };

  const closePaywall = () => {
    setIsPaywallOpen(false);
    setPaywallReason(null);
  };

  const upgradeTier = async (targetTier: SubscriptionTier) => {
    setTier(targetTier);
    const authTier: MembershipTier = targetTier === 'EDUCATOR' ? 'institution' : targetTier === 'PRO' ? 'pro' : 'free';
    try {
      await auth.upgradeTier(authTier);
    } catch {
      // Auth might not be configured, local tier persists
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        aiQueriesUsed,
        maxFreeAiQueries,
        remainingAiQueries,
        canUseAiTutor,
        incrementAiQueries,
        resetAiQueries,
        canExportPdf,
        canUsePresenterMode,
        isPaywallOpen,
        paywallReason,
        paywallTargetTier,
        triggerPaywall,
        closePaywall,
        upgradeTier
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
