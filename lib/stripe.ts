import Stripe from 'stripe';

// This ensures the error is thrown at runtime, not during build time
const getStripKey = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Please add it to your .env.local file'
    );
  }
  return key;
};

export const stripe = new Stripe(getStripKey(), {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    description: 'For personal use',
    price: 0,
    features: [
      '100 messages per month',
      'Basic chat features',
      'Community support',
    ] as string[],
    stripe_price_id: '',  // Free plan doesn't need a price ID
  },
  pro: {
    name: 'Pro',
    description: 'For professionals',
    price: 19,
    features: [
      'Unlimited messages',
      'Advanced AI features',
      'Priority support',
      'Custom chat templates',
    ] as string[],
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID || '',
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For teams and organizations',
    price: 99,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom AI model training',
      'Dedicated support',
      'API access',
    ] as string[],
    stripe_price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createOrRetrieveCustomer(
  userId: string,
  email: string,
) {
  if (!userId || !email) {
    throw new Error('userId and email are required');
  }

  // First try to find by metadata
  const { data: existingCustomersByMetadata } = await stripe.customers.search({
    query: `metadata['userId']:'${userId}'`,
  });

  if (existingCustomersByMetadata?.[0]?.id) {
    return existingCustomersByMetadata[0].id;
  }

  // If not found by metadata, try to find by email
  const { data: existingCustomersByEmail } = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomersByEmail?.[0]?.id) {
    const customer = existingCustomersByEmail[0];
    
    // If found by email but missing userId in metadata, update it
    if (!customer.metadata?.userId) {
      const updatedCustomer = await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          userId,
        },
      });
      return updatedCustomer.id;
    }
    
    return customer.id;
  }

  // If no existing customer found, create a new one
  const newCustomer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
  
  return newCustomer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  returnUrl: string,
) {
  // Verify the customer exists and has userId in metadata
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  
  if (!customer.metadata?.userId) {
    throw new Error('Customer is missing userId in metadata');
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    subscription_data: {
      metadata: {
        customerId,
        userId: customer.metadata.userId,
      },
    },
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    allow_promotion_codes: true,
  });
  
  return checkoutSession;
}

export async function manageSubscriptionSession(
  customerId: string,
  returnUrl: string,
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
} 