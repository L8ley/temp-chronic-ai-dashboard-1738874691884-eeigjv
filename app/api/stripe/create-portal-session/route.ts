import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { manageSubscriptionSession } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the customer's Stripe ID from your database
    const { data: customer } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return new NextResponse('No subscription found', { status: 404 });
    }

    const portalSession = await manageSubscriptionSession(
      customer.stripe_customer_id,
      `${req.headers.get('origin')}/dashboard`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new NextResponse('Error creating portal session', { status: 500 });
  }
} 