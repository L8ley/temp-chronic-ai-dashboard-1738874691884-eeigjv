import { PlanType } from './stripe';

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  tier: PlanType;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureLimits {
  messagesPerMonth: number;
  customTemplates: boolean;
  advancedAI: boolean;
  prioritySupport: boolean;
  teamCollaboration: boolean;
  customAITraining: boolean;
  apiAccess: boolean;
}

const TIER_LIMITS: Record<PlanType, FeatureLimits> = {
  free: {
    messagesPerMonth: 100,
    customTemplates: false,
    advancedAI: false,
    prioritySupport: false,
    teamCollaboration: false,
    customAITraining: false,
    apiAccess: false,
  },
  pro: {
    messagesPerMonth: Infinity,
    customTemplates: true,
    advancedAI: true,
    prioritySupport: true,
    teamCollaboration: false,
    customAITraining: false,
    apiAccess: false,
  },
  enterprise: {
    messagesPerMonth: Infinity,
    customTemplates: true,
    advancedAI: true,
    prioritySupport: true,
    teamCollaboration: true,
    customAITraining: true,
    apiAccess: true,
  },
};

export function getFeatureLimits(subscription: Subscription | null): FeatureLimits {
  if (!subscription || subscription.status !== 'active') {
    return TIER_LIMITS.free;
  }
  return TIER_LIMITS[subscription.tier];
}

export function hasAccess(subscription: Subscription | null, feature: keyof FeatureLimits): boolean {
  const limits = getFeatureLimits(subscription);
  if (feature === 'messagesPerMonth') {
    return limits.messagesPerMonth > 0;
  }
  return limits[feature];
}

export function getMessageLimit(subscription: Subscription | null): number {
  return getFeatureLimits(subscription).messagesPerMonth;
}

export function getUpgradeOptions(currentTier: PlanType): PlanType[] {
  switch (currentTier) {
    case 'free':
      return ['pro', 'enterprise'];
    case 'pro':
      return ['enterprise'];
    case 'enterprise':
      return [];
    default:
      return ['pro', 'enterprise'];
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
} 