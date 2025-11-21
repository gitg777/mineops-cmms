'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import CameraCard from '@/components/stream/CameraCard';
import { createClient } from '@/lib/supabase/client';
import { Camera, Region, AnimalType } from '@/types';

const REGIONS: Region[] = ['Africa', 'North America', 'South America', 'Asia', 'Europe', 'Australia', 'Antarctica'];
const ANIMAL_TYPES: AnimalType[] = ['Big Cats', 'Birds', 'Marine', 'Primates', 'Elephants', 'Bears', 'Reptiles', 'Other'];

export default function BrowsePage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<Camera[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'all'>('all');
  const [selectedAnimalType, setSelectedAnimalType] = useState<AnimalType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchCameras = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('cameras')
        .select('*')
        .eq('status', 'active')
        .order('viewer_count', { ascending: false });

      setCameras(data || []);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const filterCameras = useCallback(() => {
    let filtered = cameras;

    if (searchQuery) {
      filtered = filtered.filter(
        (camera) =>
          camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camera.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camera.lodge_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter((camera) => camera.region === selectedRegion);
    }

    if (selectedAnimalType !== 'all') {
      filtered = filtered.filter((camera) => camera.animal_type === selectedAnimalType);
    }

    setFilteredCameras(filtered);
  }, [cameras, searchQuery, selectedRegion, selectedAnimalType]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  useEffect(() => {
    filterCameras();
  }, [filterCameras]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    setSelectedAnimalType('all');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-earth-900 dark:text-earth-50 mb-2">
          Browse Wildlife Cameras
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          Discover live wildlife streams from around the world
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-earth-400" />
          <input
            type="text"
            placeholder="Search cameras, lodges, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as Region | 'all')}
              className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
            >
              <option value="all">All Regions</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              Animal Type
            </label>
            <select
              value={selectedAnimalType}
              onChange={(e) => setSelectedAnimalType(e.target.value as AnimalType | 'all')}
              className="w-full px-4 py-2 border border-earth-300 dark:border-earth-700 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100"
            >
              <option value="all">All Animals</option>
              {ANIMAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedRegion !== 'all' || selectedAnimalType !== 'all') && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-earth-600 dark:text-earth-400">
        {isLoading ? (
          <p>Loading cameras...</p>
        ) : (
          <p>
            Showing {filteredCameras.length} of {cameras.length} camera{cameras.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Camera Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-earth-200 dark:bg-earth-800 aspect-video rounded-t-lg"></div>
              <div className="bg-earth-100 dark:bg-earth-900 p-4 rounded-b-lg space-y-3">
                <div className="h-4 bg-earth-200 dark:bg-earth-800 rounded w-3/4"></div>
                <div className="h-3 bg-earth-200 dark:bg-earth-800 rounded"></div>
                <div className="h-3 bg-earth-200 dark:bg-earth-800 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCameras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-earth-100 dark:bg-earth-900 rounded-lg">
          <Search className="w-12 h-12 mx-auto mb-4 text-earth-400" />
          <p className="text-earth-600 dark:text-earth-400 mb-4">
            No cameras found matching your criteria
          </p>
          <Button variant="primary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
