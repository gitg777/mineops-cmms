import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Eye, MapPin, Heart } from 'lucide-react';
import { Camera as CameraType } from '@/types';

interface CameraCardProps {
  camera: CameraType;
  isFavorite?: boolean;
}

export default function CameraCard({ camera, isFavorite }: CameraCardProps) {
  const thumbnailUrl = camera.thumbnail_url || '/images/camera-placeholder.jpg';

  return (
    <Link href={`/stream/${camera.id}`}>
      <Card hover className="overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-earth-900 overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={camera.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Live Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>

          {/* Viewer Count */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {camera.viewer_count.toLocaleString()}
          </div>

          {/* Favorite Badge */}
          {isFavorite && (
            <div className="absolute bottom-3 right-3 p-2 bg-red-500 rounded-full">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-earth-900 dark:text-earth-50 mb-1 line-clamp-1">
            {camera.name}
          </h3>

          <p className="text-sm text-earth-600 dark:text-earth-400 mb-2 line-clamp-2">
            {camera.description}
          </p>

          <div className="flex items-center justify-between text-xs text-earth-500 dark:text-earth-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{camera.region}</span>
            </div>
            <span className="px-2 py-1 bg-nature-100 dark:bg-nature-900 text-nature-700 dark:text-nature-400 rounded">
              {camera.animal_type}
            </span>
          </div>

          <div className="mt-3 text-xs text-earth-500 dark:text-earth-500">
            {camera.lodge_name}
          </div>
        </div>
      </Card>
    </Link>
  );
}
