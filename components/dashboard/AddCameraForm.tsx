'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { addCamera } from '@/lib/firebase/firestore';
import { Region, AnimalType } from '@/types';
import toast from 'react-hot-toast';
import { useUser } from '@/components/layout/UserProvider';

const REGIONS: Region[] = ['Africa', 'North America', 'South America', 'Asia', 'Europe', 'Australia', 'Antarctica'];
const ANIMAL_TYPES: AnimalType[] = ['Big Cats', 'Birds', 'Marine', 'Primates', 'Elephants', 'Bears', 'Reptiles', 'Other'];

export default function AddCameraForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lodge_name: '',
    region: '' as Region,
    animal_type: '' as AnimalType,
    rtmp_url: '',
    booking_url: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await addCamera({
        creator_id: user.id,
        name: formData.name,
        description: formData.description,
        lodge_name: formData.lodge_name,
        region: formData.region,
        animal_type: formData.animal_type,
        rtmp_url: formData.rtmp_url,
        cloudflare_stream_id: null,
        thumbnail_url: null,
        booking_url: formData.booking_url || null,
        status: 'pending',
        featured: false,
        viewer_count: 0,
        total_views: 0,
      });

      toast.success('Camera submitted for approval!');
      setFormData({
        name: '',
        description: '',
        lodge_name: '',
        region: '' as Region,
        animal_type: '' as AnimalType,
        rtmp_url: '',
        booking_url: '',
      });
      router.refresh();
    } catch (error) {
      console.error('Error adding camera:', error);
      toast.error((error as Error).message || 'Failed to add camera');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-earth-950 border border-earth-200 dark:border-earth-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-earth-900 dark:text-earth-50">Add New Camera</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
            Camera Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
            placeholder="Serengeti Watering Hole"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
            Lodge Name *
          </label>
          <input
            type="text"
            required
            value={formData.lodge_name}
            onChange={(e) => setFormData({ ...formData, lodge_name: e.target.value })}
            className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
            placeholder="Safari Paradise Lodge"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
            Region *
          </label>
          <select
            required
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value as Region })}
            className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
          >
            <option value="">Select Region</option>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
            Animal Type *
          </label>
          <select
            required
            value={formData.animal_type}
            onChange={(e) => setFormData({ ...formData, animal_type: e.target.value as AnimalType })}
            className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
          >
            <option value="">Select Animal Type</option>
            {ANIMAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
          placeholder="Describe what viewers can expect to see..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
          RTMP Ingest URL *
        </label>
        <input
          type="url"
          required
          value={formData.rtmp_url}
          onChange={(e) => setFormData({ ...formData, rtmp_url: e.target.value })}
          className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
          placeholder="rtmp://your-stream-server/live/streamkey"
        />
        <p className="mt-1 text-xs text-earth-500">Your camera&apos;s RTMP stream URL for ingestion</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
          Booking URL (Optional)
        </label>
        <input
          type="url"
          value={formData.booking_url}
          onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
          className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
          placeholder="https://yourlodge.com/book"
        />
        <p className="mt-1 text-xs text-earth-500">Link for viewers to book stays at your lodge</p>
      </div>

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full md:w-auto">
        Submit for Approval
      </Button>
    </form>
  );
}
