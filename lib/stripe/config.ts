import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

export const SUBSCRIPTION_PLANS = {
  single: {
    id: 'single',
    name: 'Single Camera',
    description: 'Access to one wildlife camera',
    price: 499, // $4.99
    interval: 'month' as const,
    features: [
      'Access to 1 camera',
      'HD streaming',
      'Basic chat',
      'No ads on subscribed camera',
    ],
  },
  allAccess: {
    id: 'all-access',
    name: 'All Access Pass',
    description: 'Unlimited access to all cameras',
    price: 1999, // $19.99
    interval: 'month' as const,
    features: [
      'Access to ALL cameras',
      '4K streaming where available',
      'Premium chat features',
      'Ad-free experience',
      'Early access to new cameras',
      'Exclusive wildlife alerts',
    ],
  },
} as const;

export const CREATOR_REVENUE_SPLIT = parseInt(process.env.CREATOR_REVENUE_SPLIT || '60') / 100;
