'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Camera as CameraIcon, DollarSign, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Camera } from '@/types';
import { useUser } from '@/components/layout/UserProvider';
import { getPlatformStats, getPendingCameras } from '@/lib/firebase/firestore';

export default function AdminPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalCameras: 0, activeCameras: 0, pendingCameras: 0 });
  const [pendingCameras, setPendingCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!userLoading && user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      Promise.all([getPlatformStats(), getPendingCameras()])
        .then(([statsData, camerasData]) => {
          setStats(statsData);
          setPendingCameras(camerasData);
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, userLoading, router]);

  if (userLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-earth-900 dark:text-earth-50 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          Platform overview and moderation tools
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-earth-600 dark:text-earth-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-earth-900 dark:text-earth-50">
                {stats.totalUsers}
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-earth-600 dark:text-earth-400">
              Total Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-earth-900 dark:text-earth-50">
                {stats.totalCameras}
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CameraIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-earth-600 dark:text-earth-400">
              Active Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-earth-900 dark:text-earth-50">
                {stats.activeCameras}
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-earth-600 dark:text-earth-400">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-earth-900 dark:text-earth-50">
                {stats.pendingCameras}
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Camera Approvals */}
      <div className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-6">
          Pending Camera Approvals
        </h2>

        {pendingCameras.length > 0 ? (
          <div className="space-y-4">
            {pendingCameras.map((camera) => (
              <div
                key={camera.id}
                className="border border-earth-200 dark:border-earth-700 rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-50 mb-1">
                      {camera.name}
                    </h3>
                    <p className="text-sm text-earth-600 dark:text-earth-400 mb-2">
                      {camera.lodge_name} - {camera.region}
                    </p>
                    <p className="text-sm text-earth-700 dark:text-earth-300 mb-4">
                      {camera.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-earth-500">
                      <span>Creator: {camera.creator?.full_name || 'Unknown'}</span>
                      <span>-</span>
                      <span>Type: {camera.animal_type}</span>
                      <span>-</span>
                      <span>Submitted: {new Date(camera.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="danger" size="sm">
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-earth-600 dark:text-earth-400">
            No cameras pending approval
          </div>
        )}
      </div>
    </div>
  );
}
