import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getMessageLimit } from './subscription';
import type { Subscription } from './subscription';

export interface MessageUsage {
  id: string;
  user_id: string;
  count: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUsage(userId: string): Promise<MessageUsage | null> {
  const supabase = createClientComponentClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data, error } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', startOfMonth)
    .lte('period_end', endOfMonth)
    .single();

  if (error && error.code !== 'PGSQL_ERROR') {
    console.error('Error fetching message usage:', error);
    return null;
  }

  return data;
}

export async function incrementMessageCount(userId: string): Promise<{ success: boolean; remaining: number }> {
  const supabase = createClientComponentClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  // Get current subscription to check limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  const limit = getMessageLimit(subscription);

  // Get or create usage record for current month
  const { data: usage, error: usageError } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', startOfMonth)
    .lte('period_end', endOfMonth)
    .single();

  if (usageError && usageError.code === 'PGSQL_ERROR') {
    // Create new usage record for this month
    const { error: insertError } = await supabase
      .from('message_usage')
      .insert({
        user_id: userId,
        count: 1,
        period_start: startOfMonth,
        period_end: endOfMonth,
      });

    if (insertError) {
      console.error('Error creating message usage:', insertError);
      return { success: false, remaining: 0 };
    }

    return { success: true, remaining: limit - 1 };
  }

  if (usage) {
    // Check if user has reached their limit
    if (usage.count >= limit) {
      return { success: false, remaining: 0 };
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from('message_usage')
      .update({ count: usage.count + 1, updated_at: now.toISOString() })
      .eq('id', usage.id);

    if (updateError) {
      console.error('Error updating message usage:', updateError);
      return { success: false, remaining: 0 };
    }

    return { success: true, remaining: limit - (usage.count + 1) };
  }

  return { success: false, remaining: 0 };
}

export function getUsagePercentage(usage: number, limit: number): number {
  if (limit === Infinity) return 0;
  return Math.min(Math.round((usage / limit) * 100), 100);
}

export function formatRemainingMessages(remaining: number): string {
  if (remaining === Infinity) return 'Unlimited';
  return remaining.toString();
} 