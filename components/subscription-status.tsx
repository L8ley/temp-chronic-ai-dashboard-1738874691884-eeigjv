import { Subscription, formatDate } from '@/lib/subscription';
import { PLANS } from '@/lib/stripe';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatusProps {
  subscription: Subscription | null;
}

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const isActive = subscription?.status === 'active';
  const currentPlan = subscription?.tier || 'free';
  const plan = PLANS[currentPlan];

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Plan: {plan.name}</CardTitle>
            <CardDescription className="mt-1.5">
              {isActive && subscription.cancel_at_period_end
                ? 'Your subscription will end on '
                : 'Your subscription will renew on '}
              {subscription?.current_period_end
                ? formatDate(subscription.current_period_end)
                : 'N/A'}
            </CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : 'destructive'} className="capitalize">
            {subscription?.status || 'inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Features included:</h4>
          <ul className="grid gap-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href={isActive ? '/account/billing' : '/pricing'}>
              {isActive ? 'Manage Subscription' : 'Upgrade Plan'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 