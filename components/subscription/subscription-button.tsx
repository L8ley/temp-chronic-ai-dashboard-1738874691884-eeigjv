'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/use-subscription';

export function SubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { subscription } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { url } = await response.json();
      window.location.href = url;
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

  if (!subscription) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleManageSubscription}
      disabled={loading}
      className="w-full sm:w-auto"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
} 