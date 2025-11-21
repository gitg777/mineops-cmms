'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera as CameraIcon, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import AddCameraForm from '@/components/dashboard/AddCameraForm';
import CameraAnalytics from '@/components/dashboard/CameraAnalytics';
import { Camera } from '@/types';
import { useUser } from '@/components/layout/UserProvider';
import { getCameras } from '@/lib/firebase/firestore';

export default function CreatorDashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!userLoading && user && user.role !== 'creator' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user && (user.role === 'creator' || user.role === 'admin')) {
      getCameras({ creatorId: user.id, orderByField: 'created_at', orderDirection: 'desc' })
        .then(setCameras)
        .finally(() => setIsLoading(false));
    }
  }, [user, userLoading, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <CameraIcon className="w-5 h-5 text-earth-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      inactive: 'bg-earth-100 text-earth-800 dark:bg-earth-800 dark:text-earth-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-earth-900 dark:text-earth-50 mb-2">
          Creator Dashboard
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          Manage your wildlife cameras and track performance
        </p>
      </div>

      {/* Analytics */}
      <CameraAnalytics cameras={cameras} />

      {/* My Cameras */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-4">My Cameras</h2>

        {cameras.length > 0 ? (
          <div className="space-y-4">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-earth-100 dark:bg-earth-800 rounded-lg">
                    {getStatusIcon(camera.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-50">
                          {camera.name}
                        </h3>
                        <p className="text-sm text-earth-600 dark:text-earth-400">
                          {camera.lodge_name} - {camera.region}
                        </p>
                      </div>
                      {getStatusBadge(camera.status)}
                    </div>

                    <p className="text-sm text-earth-700 dark:text-earth-300 mb-4 line-clamp-2">
                      {camera.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-earth-600 dark:text-earth-400">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{camera.viewer_count} watching</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CameraIcon className="w-4 h-4" />
                        <span>{camera.total_views.toLocaleString()} total views</span>
                      </div>
                      <span className="px-2 py-1 bg-nature-100 dark:bg-nature-900 text-nature-700 dark:text-nature-400 rounded text-xs">
                        {camera.animal_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-earth-100 dark:bg-earth-900 rounded-lg">
            <CameraIcon className="w-12 h-12 mx-auto mb-4 text-earth-400" />
            <p className="text-earth-600 dark:text-earth-400 mb-4">
              You haven&apos;t added any cameras yet
            </p>
          </div>
        )}
      </div>

      {/* Add Camera Form */}
      <AddCameraForm />
    </div>
  );
}
