import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { MembershipTier } from '../types/auth';

export type SubscriptionTier = 'FREE' | 'PRO' | 'EDUCATOR';

export type PaywallReason =
  | 'anatomy_explorer'
  | 'pro_simulation'
  | 'pdf_export'
  | 'ai_tutor'
  | 'exam_challenge'
  | 'ecorche_anatomy'
  | 'presenter_mode'
  | 'school_branding'
  | 'lms_embed';

export const FREE_TOPIC_IDS = new Set<string>([
  'algebra',
  'trigonometry',
  'motion',
  'units_dimensions',
  'newtons_laws',
  'work_energy_power',
  'gravitation',
  'waves',
  'optics',
  'functions'
]);

export interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  subscriptionPeriodEnd: string | null;
  isSubscriptionActive: boolean;
  daysRemaining: number | null;
  // Feature Access & Gating Checks
  canAccessTopic: (topicId: string) => boolean;
  canAccessAnatomy: () => boolean;
  canExportPdf: () => boolean;
  canUseAiTutor: () => boolean;
  canAccessChallenge: (challengeIndex: number) => boolean;
  canUseEcorcheModel: () => boolean;
  canUsePresenterMode: () => boolean;
  canUseSchoolBranding: () => boolean;
  // AI Tutor Limits
  aiQueriesUsed: number;
  maxFreeAiQueries: number;
  remainingAiQueries: number;
  incrementAiQueries: () => boolean;
  resetAiQueries: () => void;
  // Paywall Modal State
  isPaywallOpen: boolean;
  paywallReason: PaywallReason | null;
  paywallTargetTier: 'PRO' | 'EDUCATOR';
  triggerPaywall: (reason: PaywallReason, targetTier?: 'PRO' | 'EDUCATOR') => void;
  closePaywall: () => void;
  upgradeTier: (targetTier: SubscriptionTier, periodEnd?: string) => Promise<void>;
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

  // Keep in sync with AuthContext if user logs in with existing plan or expires
  useEffect(() => {
    if (auth.membershipTier === 'institution') {
      setTierState('EDUCATOR');
    } else if (auth.membershipTier === 'pro') {
      setTierState('PRO');
    } else if (auth.membershipTier === 'free') {
      setTierState('FREE');
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
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);
  const [paywallTargetTier, setPaywallTargetTier] = useState<'PRO' | 'EDUCATOR'>('PRO');

  const setTier = (newTier: SubscriptionTier) => {
    // If user has an active paid subscription, prevent switching to FREE mode until it ends
    if (newTier === 'FREE' && auth.isSubscriptionActive && auth.membershipTier !== 'free' && !auth.isFounder) {
      console.warn('[SubscriptionContext] User has an active paid subscription; cannot switch to FREE until period ends.');
      return;
    }
    setTierState(newTier);
    try {
      localStorage.setItem(STORAGE_KEY_TIER, newTier);
    } catch {
      // Ignore
    }
  };

  const remainingAiQueries = (auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR')
    ? 9999
    : Math.max(0, maxFreeAiQueries - aiQueriesUsed);

  // 1. Topic Access Check: 10 Core Foundation Topics are Free, rest are Pro
  const canAccessTopic = (topicId: string): boolean => {
    if (auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR') return true;
    return FREE_TOPIC_IDS.has(topicId);
  };

  // 2. AI Tutor: 3 queries per day for Free, unlimited for Pro & School
  const canUseAiTutor = (): boolean => {
    if (auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR') return true;
    return aiQueriesUsed < maxFreeAiQueries;
  };

  const incrementAiQueries = (): boolean => {
    if (auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR') {
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

  // 3. PDF Lab Report Export: Pro & School only
  const canExportPdf = (): boolean => {
    return Boolean(auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR');
  };

  // 4. Exam Challenges: Challenge 1 is free, Challenge 2+ require Pro
  const canAccessChallenge = (challengeIndex: number): boolean => {
    if (challengeIndex === 0) return true;
    return Boolean(auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR');
  };

  // 5. 3D Human Anatomy Full Écorché Layer (Muscular & Skeletal Solo systems): Pro & School only
  const canUseEcorcheModel = (): boolean => {
    return Boolean(auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR');
  };

  // 6. Smartboard Presenter Mode & Laser Pointer: Classroom & School (EDUCATOR) ONLY! Locked for Free AND Pro!
  const canUsePresenterMode = (): boolean => {
    return Boolean(auth.isFounder || tier === 'EDUCATOR');
  };

  // 7. Custom School Branding on Reports: Classroom & School (EDUCATOR) ONLY! Locked for Free AND Pro!
  const canUseSchoolBranding = (): boolean => {
    return Boolean(auth.isFounder || tier === 'EDUCATOR');
  };

  // 8. 3D Human Anatomy Explorer: Pro & School only (Locked for Free users)
  const canAccessAnatomy = (): boolean => {
    return Boolean(auth.isFounder || tier === 'PRO' || tier === 'EDUCATOR');
  };

  const triggerPaywall = (
    reason: PaywallReason,
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

  const upgradeTier = async (targetTier: SubscriptionTier, periodEnd?: string) => {
    const authTier: MembershipTier = targetTier === 'EDUCATOR' ? 'institution' : targetTier === 'PRO' ? 'pro' : 'free';
    try {
      const res = await auth.upgradeTier(authTier, undefined, periodEnd);
      if (!res.success && res.error) {
        console.warn('[SubscriptionContext] Upgrade blocked:', res.error);
        return;
      }
    } catch {
      // Auth might not be configured, local tier persists
    }
    setTier(targetTier);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        setTier,
        subscriptionPeriodEnd: auth.subscriptionPeriodEnd,
        isSubscriptionActive: auth.isSubscriptionActive,
        daysRemaining: auth.daysRemaining,
        canAccessTopic,
        canAccessAnatomy,
        canExportPdf,
        canUseAiTutor,
        canAccessChallenge,
        canUseEcorcheModel,
        canUsePresenterMode,
        canUseSchoolBranding,
        aiQueriesUsed,
        maxFreeAiQueries,
        remainingAiQueries,
        incrementAiQueries,
        resetAiQueries,
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
