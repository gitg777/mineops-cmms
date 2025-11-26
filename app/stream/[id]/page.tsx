'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, MapPin, Heart, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import VideoPlayer from '@/components/stream/VideoPlayer';
import StreamChat from '@/components/stream/StreamChat';
import { getCamera, getActiveAlerts } from '@/lib/firebase/firestore';

interface Camera {
  id: string;
  name: string;
  description: string;
  region: string;
  animal_type: string;
  status: string;
  viewer_count: number;
  thumbnail_url?: string;
  cloudflare_stream_id?: string;
  lodge_name: string;
  booking_url?: string;
  creator?: { full_name: string };
}

interface Alert {
  id: string;
  type: string;
  message: string;
}

export default function StreamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const cameraData = await getCamera(params.id);
        if (!cameraData || cameraData.status !== 'active') {
          router.push('/404');
          return;
        }
        setCamera(cameraData as Camera);
        const alertsData = await getActiveAlerts(params.id);
        setAlerts(alertsData as Alert[]);
      } catch (err) {
        console.error('Error loading stream:', err);
        setError('Failed to load stream');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nature-600" />
      </div>
    );
  }

  if (error || !camera) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-2">Stream Not Found</h1>
          <p className="text-earth-600 dark:text-earth-400 mb-4">{error || 'This stream is not available'}</p>
          <Link href="/browse"><Button variant="primary">Browse Streams</Button></Link>
        </div>
      </div>
    );
  }

  const streamUrl = camera.cloudflare_stream_id
    ? `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE}.cloudflarestream.com/${camera.cloudflare_stream_id}/manifest/video.m3u8`
    : '/placeholder-stream.m3u8';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900 dark:text-amber-100">{alert.type}</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <VideoPlayer src={streamUrl} poster={camera.thumbnail_url || undefined} />
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-lg flex items-center gap-2 backdrop-blur-sm">
              <Eye className="w-4 h-4" />
              {camera.viewer_count.toLocaleString()} watching
            </div>
          </div>
          <div className="bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-earth-900 dark:text-earth-50 mb-2">{camera.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-earth-600 dark:text-earth-400">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{camera.region}</span></div>
                  <span className="px-2 py-1 bg-nature-100 dark:bg-nature-900 text-nature-700 dark:text-nature-400 rounded">{camera.animal_type}</span>
                </div>
              </div>
              <div className="flex gap-2"><Button variant="outline" size="sm"><Heart className="w-4 h-4" /></Button></div>
            </div>
            <p className="text-earth-700 dark:text-earth-300 mb-4">{camera.description}</p>
            <div className="border-t border-earth-200 dark:border-earth-700 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-earth-600 dark:text-earth-400">Hosted by</div>
                  <div className="font-semibold text-earth-900 dark:text-earth-100">{camera.lodge_name}</div>
                  {camera.creator && <div className="text-sm text-earth-500">by {camera.creator.full_name}</div>}
                </div>
                {camera.booking_url && (
                  <Link href={camera.booking_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary">Book Lodge<ExternalLink className="w-4 h-4 ml-2" /></Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-20 h-[calc(100vh-7rem)]"><StreamChat cameraId={camera.id} /></div>
        </div>
      </div>
    </div>
  );
}