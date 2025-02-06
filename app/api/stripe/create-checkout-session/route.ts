import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const customerId = await createOrRetrieveCustomer(
      session.user.id,
      session.user.email || ''
    );

    const checkoutSession = await createCheckoutSession(
      customerId,
      priceId,
      `${req.headers.get('origin')}/dashboard`
    );

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Error creating checkout session', { status: 500 });
  }
} 