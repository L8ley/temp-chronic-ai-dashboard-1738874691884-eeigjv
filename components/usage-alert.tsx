'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getCurrentUsage, getUsagePercentage, formatRemainingMessages } from '@/lib/message-limits';
import type { MessageUsage } from '@/lib/message-limits';

export function UsageAlert() {
  const [usage, setUsage] = useState<MessageUsage | null>(null);
  const [messageLimit, setMessageLimit] = useState<number>(100); // Default to free tier
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        console.error('Error getting authenticated user:', userError);
        return;
      }

      // Get user's subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError) {
        console.error('Error getting subscription:', subError);
      }

      // Set message limit based on subscription
      if (subscription?.status === 'active') {
        if (subscription.tier === 'pro' || subscription.tier === 'enterprise') {
          setMessageLimit(Infinity);
        }
      }

      // Get current usage
      const currentUsage = await getCurrentUsage(user.id);
      setUsage(currentUsage);
    }

    loadData();
  }, [supabase]);

  if (!usage || messageLimit === Infinity) return null;

  const usagePercentage = getUsagePercentage(usage.count, messageLimit);
  const remaining = messageLimit - usage.count;
  const isLow = remaining <= 20;
  const isVeryLow = remaining <= 5;
  const isExhausted = remaining <= 0;

  if (!isLow) return null;

  return (
    <Alert variant={isExhausted ? 'destructive' : isVeryLow ? 'default' : 'default'}>
      <AlertTitle>
        {isExhausted
          ? 'Message limit reached'
          : isVeryLow
          ? 'Almost out of messages'
          : 'Message limit running low'}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-sm">
            {isExhausted
              ? "You've used all your messages for this month."
              : `You have ${formatRemainingMessages(remaining)} message${
                  remaining === 1 ? '' : 's'
                } remaining this month.`}
          </p>
          <Button
            variant={isExhausted ? 'default' : 'outline'}
            className="mt-2"
            onClick={() => router.push('/pricing')}
          >
            Upgrade your plan
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
} 