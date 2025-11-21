'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useUser } from '@/components/layout/UserProvider';

export default function AccountPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-earth-900 dark:text-earth-50 mb-2">
          Account Settings
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-6">
          Profile Information
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              <UserIcon className="inline w-4 h-4 mr-1" />
              Full Name
            </label>
            <div className="text-earth-900 dark:text-earth-100 text-lg">
              {user?.full_name || 'Not set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email
            </label>
            <div className="text-earth-900 dark:text-earth-100 text-lg">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              <Shield className="inline w-4 h-4 mr-1" />
              Account Type
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-nature-100 dark:bg-nature-900 text-nature-700 dark:text-nature-400 rounded-full font-medium">
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-earth-200 dark:border-earth-700">
          <Button variant="primary">Edit Profile</Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/account/subscriptions"
          className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-50 mb-2">
            Subscriptions
          </h3>
          <p className="text-sm text-earth-600 dark:text-earth-400">
            Manage your camera subscriptions and billing
          </p>
        </a>

        <a
          href="/account/favorites"
          className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-50 mb-2">
            Favorite Cameras
          </h3>
          <p className="text-sm text-earth-600 dark:text-earth-400">
            View and manage your bookmarked cameras
          </p>
        </a>
      </div>
    </div>
  );
}
