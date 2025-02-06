'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Subscription } from '@/lib/subscription';
import type { PlanType } from '@/lib/stripe';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  userId?: string;
  plan: {
    name: string;
    description: string;
    price: number;
    features: string[];
    stripe_price_id: string;
    tier: PlanType;
  };
  subscription: Subscription | null;
}

const TIER_RANK = {
  free: 0,
  pro: 1,
  enterprise: 2,
} as const;

export function PricingCard({ userId, plan, subscription }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubscribe = async () => {
    if (!userId) {
      return router.push('/login');
    }

    try {
      setLoading(true);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: plan.stripe_price_id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = subscription?.tier === plan.tier && subscription?.status === 'active';
  const currentTierRank = subscription?.status === 'active' ? TIER_RANK[subscription.tier] : -1;
  const planTierRank = TIER_RANK[plan.tier];
  
  const isDowngrade = planTierRank < currentTierRank;
  const isUpgrade = planTierRank > currentTierRank;
  const canSubscribe = !isCurrentPlan && (isUpgrade || currentTierRank === -1);

  let buttonText = 'Get Started';
  if (loading) buttonText = 'Loading...';
  else if (isCurrentPlan) buttonText = 'Current Plan';
  else if (isDowngrade) buttonText = 'Contact Support to Downgrade';
  else if (plan.price > 0) buttonText = 'Upgrade';

  return (
    <Card className={cn(
      "relative flex flex-col overflow-hidden transition-colors",
      isCurrentPlan && "border-2 border-primary bg-primary/5",
      plan.tier === 'pro' && "shadow-lg scale-105 border-primary/50"
    )}>
      {isCurrentPlan && (
        <Badge className="absolute right-4 top-4">
          Current Plan
        </Badge>
      )}
      {plan.tier === 'pro' && (
        <Badge variant="secondary" className="absolute right-4 top-4">
          Most Popular
        </Badge>
      )}
      <CardHeader className="flex-1 pb-8 pt-6">
        <CardTitle className="flex flex-col gap-4">
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${plan.price}</span>
            {plan.price > 0 && (
              <span className="text-muted-foreground">/month</span>
            )}
          </div>
        </CardTitle>
        <p className="text-muted-foreground mt-2">{plan.description}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pb-8 pt-6">
        <Button
          className="w-full"
          size="lg"
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={handleSubscribe}
          disabled={loading || !plan.stripe_price_id || isCurrentPlan || isDowngrade}
          title={isDowngrade ? "Please contact support to downgrade your plan" : undefined}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
} 