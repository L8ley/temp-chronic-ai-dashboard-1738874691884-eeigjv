import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const signature = headers().get('Stripe-Signature');

  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.subscription) {
          return new NextResponse(null, { status: 200 });
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const customerId = session.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        // Determine the subscription tier based on the price ID
        const priceId = subscription.items.data[0].price.id;
        let tier: 'free' | 'pro' | 'enterprise' = 'free';
        
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          tier = 'pro';
        } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
          tier = 'enterprise';
        }

        // Get existing subscription to preserve created_at
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            tier,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            created_at: existingSubscription?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        const priceId = subscription.items.data[0].price.id;
        let tier: 'free' | 'pro' | 'enterprise' = 'free';
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          tier = 'pro';
        } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
          tier = 'enterprise';
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            tier,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) throw error;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.userId;

        if (!userId) {
          throw new Error('No userId found in customer metadata');
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            tier: 'free',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) throw error;
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
} 