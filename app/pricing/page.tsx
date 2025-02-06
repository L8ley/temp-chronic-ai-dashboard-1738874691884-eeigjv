import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PLANS } from '@/lib/stripe';
import { PricingCard } from '@/components/pricing-card';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session?.user?.id)
    .single();

  const allPlans = Object.entries(PLANS).map(([tier, plan]) => ({
    ...plan,
    tier: tier as keyof typeof PLANS,
  }));

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-start py-16 px-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      </div>

      <div className="w-full max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-lg font-medium">Pricing</h2>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground">
            Whether you're just getting started or scaling up, we have a plan that's right for you.
            All plans include a 14-day free trial.
          </p>
        </div>

        {/* All Plans */}
        <div className="grid gap-8 md:grid-cols-3 lg:gap-8">
          {allPlans.map((plan) => (
            <PricingCard
              key={plan.tier}
              userId={session?.user?.id}
              plan={plan}
              subscription={subscription}
            />
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-16 text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">FAQ</h2>
          <p className="mt-2 text-lg font-bold tracking-tight">
            Have questions? We're here to help.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Can't find what you're looking for? Contact our support team and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
} 