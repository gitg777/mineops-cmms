'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Subscription } from '@/types';
import { useUser } from '@/components/layout/UserProvider';
import { getSubscriptions } from '@/lib/firebase/firestore';

export default function SubscriptionsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      getSubscriptions(user.id)
        .then(setSubscriptions)
        .finally(() => setIsLoading(false));
    }
  }, [user, userLoading, router]);

  const plans = [
    {
      id: 'single',
      name: 'Single Camera',
      price: '$4.99',
      interval: 'month',
      features: [
        'Access to 1 camera',
        'HD streaming',
        'Basic chat',
        'No ads on subscribed camera',
      ],
    },
    {
      id: 'all-access',
      name: 'All Access Pass',
      price: '$19.99',
      interval: 'month',
      popular: true,
      features: [
        'Access to ALL cameras',
        '4K streaming where available',
        'Premium chat features',
        'Ad-free experience',
        'Early access to new cameras',
        'Exclusive wildlife alerts',
      ],
    },
  ];

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-earth-900 dark:text-earth-50 mb-2">
          Subscriptions
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          Manage your camera subscriptions and upgrade your plan
        </p>
      </div>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-4">
            Active Subscriptions
          </h2>
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-50">
                      {sub.tier === 'all-access' ? 'All Access Pass' : sub.camera?.name}
                    </h3>
                    <p className="text-sm text-earth-600 dark:text-earth-400">
                      {sub.tier === 'single' && sub.camera?.lodge_name}
                    </p>
                    <p className="text-xs text-earth-500 mt-1">
                      Renews on {new Date(sub.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                    <Button variant="danger" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-4">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-earth-950 border-2 rounded-lg p-8 relative ${
                plan.popular
                  ? 'border-nature-600 dark:border-nature-500'
                  : 'border-earth-200 dark:border-earth-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-nature-600 text-white text-sm font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-earth-900 dark:text-earth-50">
                    {plan.price}
                  </span>
                  <span className="text-earth-600 dark:text-earth-400">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-earth-700 dark:text-earth-300">
                    <Check className="w-5 h-5 text-nature-600 dark:text-nature-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.popular ? 'primary' : 'outline'} size="lg" className="w-full">
                Subscribe
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
