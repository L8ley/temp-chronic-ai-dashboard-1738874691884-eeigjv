'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Subscription, FeatureLimits } from '@/lib/subscription';
import { getFeatureLimits, hasAccess, getMessageLimit } from '@/lib/subscription';
import { useAuth } from '@/hooks/use-auth';

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadSubscription() {
      try {
        if (!user?.id) {
          setSubscription(null);
          return;
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading subscription:', error);
          setSubscription(null);
          return;
        }

        setSubscription(data);
      } catch (error) {
        console.error('Error in loadSubscription:', error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [user?.id, supabase]);

  const limits = getFeatureLimits(subscription);
  
  const checkAccess = (feature: keyof FeatureLimits) => {
    return hasAccess(subscription, feature);
  };

  const messageLimit = getMessageLimit(subscription);

  return {
    subscription,
    loading,
    limits,
    checkAccess,
    messageLimit,
  };
} 