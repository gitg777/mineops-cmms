import Link from 'next/link';
import { ArrowRight, Play, Globe, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import CameraCard from '@/components/stream/CameraCard';
import { getCameras } from '@/lib/firebase/firestore';
import { Camera } from '@/types';

async function getFeaturedCameras(): Promise<Camera[]> {
  try {
    const cameras = await getCameras({
      status: 'active',
      featured: true,
      orderByField: 'viewer_count',
      orderDirection: 'desc',
      limitCount: 6,
    });
    return cameras;
  } catch (error) {
    console.error('Error fetching featured cameras:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredCameras = await getFeaturedCameras();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-nature-600 to-nature-800 dark:from-nature-800 dark:to-nature-950 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Experience Wildlife From Anywhere
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-nature-100">
              Watch live wildlife cameras from lodges around the world. Support conservation and connect with nature in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/browse">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Play className="w-5 h-5 mr-2" />
                  Browse Cameras
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* Featured Cameras Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-earth-900 dark:text-earth-50 mb-2">
              Featured Live Streams
            </h2>
            <p className="text-earth-600 dark:text-earth-400">
              Most popular wildlife cameras right now
            </p>
          </div>
          <Link href="/browse">
            <Button variant="ghost">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {featuredCameras.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCameras.map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-earth-100 dark:bg-earth-900 rounded-lg">
            <Globe className="w-12 h-12 mx-auto mb-4 text-earth-400" />
            <p className="text-earth-600 dark:text-earth-400 mb-4">
              No live cameras available at the moment
            </p>
            <Link href="/creator/dashboard">
              <Button variant="primary">Become a Creator</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-earth-100 dark:bg-earth-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-nature-600 text-white rounded-full mb-4">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live 24/7</h3>
              <p className="text-earth-600 dark:text-earth-400">
                Watch wildlife in real-time from cameras around the globe, broadcasting day and night.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-nature-600 text-white rounded-full mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
              <p className="text-earth-600 dark:text-earth-400">
                Access cameras from Africa, Asia, Americas, and beyond. Experience diverse ecosystems.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-nature-600 text-white rounded-full mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Conservation</h3>
              <p className="text-earth-600 dark:text-earth-400">
                Your subscription directly supports lodge owners and wildlife conservation efforts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-nature text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Watching?
          </h2>
          <p className="text-xl mb-8 text-nature-100">
            Get unlimited access to all cameras for just $19.99/month
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Cameras
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
