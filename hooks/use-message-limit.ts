'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { incrementMessageCount } from '@/lib/message-limits';
import { useToast } from '@/hooks/use-toast';

export function useMessageLimit() {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    async function getAuthUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting authenticated user:', error);
        return;
      }
      setUserId(user?.id || null);
    }

    getAuthUser();
  }, [supabase.auth]);

  const incrementMessage = useCallback(async () => {
    if (!userId) return false;
    
    try {
      setIsLoading(true);
      const { success, remaining } = await incrementMessageCount(userId);

      if (!success) {
        toast({
          title: 'Message limit reached',
          description: 'Please upgrade your plan to continue sending messages.',
          variant: 'destructive',
        });
        return false;
      }

      // Show warning when running low on messages
      if (remaining <= 5 && remaining > 0) {
        toast({
          title: 'Running low on messages',
          description: `You have ${remaining} message${remaining === 1 ? '' : 's'} remaining this month.`,
          variant: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error incrementing message count:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message count. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  return {
    incrementMessage,
    isLoading,
  };
} 