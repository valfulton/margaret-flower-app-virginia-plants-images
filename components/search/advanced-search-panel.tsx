'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface LookupOption {
  code: number;
  display: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedSearchPanel({ isOpen, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter state
  const [filters, setFilters] = useState({
    cat_code: 0,
    height_code: 0,
    bloom_code: 0,
    moist_code: 0,
    sun_code: 0,
    wild_code: 0,
    soil_code: 0,
    deer_code: 0,
  });

  // Lookup options
  const [lookupOptions, setLookupOptions] = useState<{
    categories: LookupOption[];
    height: LookupOption[];
    bloom: LookupOption[];
    moisture: LookupOption[];
    sun: LookupOption[];
    wildlife: LookupOption[];
    soil: LookupOption[];
    deer: LookupOption[];
  }>({
    categories: [],
    height: [],
    bloom: [],
    moisture: [],
    sun: [],
    wildlife: [],
    soil: [],
    deer: [],
  });

  // Load lookup options on mount
  useEffect(() => {
    loadLookupOptions();
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setFilters({
      cat_code: parseInt(params.cat_code || '0'),
      height_code: parseInt(params.height_code || '0'),
      bloom_code: parseInt(params.bloom_code || '0'),
      moist_code: parseInt(params.moist_code || '0'),
      sun_code: parseInt(params.sun_code || '0'),
      wild_code: parseInt(params.wild_code || '0'),
      soil_code: parseInt(params.soil_code || '0'),
      deer_code: parseInt(params.deer_code || '0'),
    });
  }, [searchParams]);

  const loadLookupOptions = async () => {
    try {
      const response = await fetch('/api/lookup-options');
      if (response.ok) {
        const options = await response.json();
        setLookupOptions(options);
      }
    } catch (error) {
      console.error('Failed to load lookup options:', error);
    }
  };

  const handleFilterChange = (filterKey: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: parseInt(value) || 0,
    }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    // Keep existing text search
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    
    // Add filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value > 0) {
        params.set(key, value.toString());
      }
    });

    router.push(`/?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      cat_code: 0,
      height_code: 0,
      bloom_code: 0,
      moist_code: 0,
      sun_code: 0,
      wild_code: 0,
      soil_code: 0,
      deer_code: 0,
    });
    
    // Keep only text search
    const q = searchParams.get('q');
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-blue-700 text-white z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Select Characteristics</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <select
                value={filters.cat_code}
                onChange={(e) => handleFilterChange('cat_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select a plant type"
              >
                <option value="0" disabled>Category</option>
                {lookupOptions.categories.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div>
              <select
                value={filters.height_code}
                onChange={(e) => handleFilterChange('height_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select a specific height range"
              >
                <option value="0" disabled>Height</option>
                {lookupOptions.height.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Bloom Time */}
            <div>
              <select
                value={filters.bloom_code}
                onChange={(e) => handleFilterChange('bloom_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select a blooming season"
              >
                <option value="0" disabled>Bloom time</option>
                {lookupOptions.bloom.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Moisture */}
            <div>
              <select
                value={filters.moist_code}
                onChange={(e) => handleFilterChange('moist_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select a specific moisture requirement"
              >
                <option value="0" disabled>Moisture</option>
                {lookupOptions.moisture.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Sun */}
            <div>
              <select
                value={filters.sun_code}
                onChange={(e) => handleFilterChange('sun_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select an amount of sunshine available"
              >
                <option value="0" disabled>Level of Sunshine</option>
                {lookupOptions.sun.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Wildlife */}
            <div>
              <select
                value={filters.wild_code}
                onChange={(e) => handleFilterChange('wild_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select wildlife"
              >
                <option value="0" disabled>Wildlife</option>
                {lookupOptions.wildlife.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <select
                value={filters.soil_code}
                onChange={(e) => handleFilterChange('soil_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select soil type"
              >
                <option value="0" disabled>Soil Type</option>
                {lookupOptions.soil.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>

            {/* Deer Resistance */}
            <div>
              <select
                value={filters.deer_code}
                onChange={(e) => handleFilterChange('deer_code', e.target.value)}
                className="w-full p-2 rounded bg-white text-black"
                title="Select deer resistance"
              >
                <option value="0" disabled>Deer Resistance</option>
                {lookupOptions.deer.map(option => (
                  <option key={option.code} value={option.code}>
                    {option.display}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <Button
              onClick={handleSearch}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Search
            </Button>
            
            <Button
              onClick={handleReset}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Reset
            </Button>
          </div>

          <div className="mt-6 text-sm">
            <p>Click <span className="bg-white text-green-600 px-2 py-1 rounded font-semibold">Search</span> to apply filters.</p>
            <p className="mt-2">Click <span className="bg-white text-red-600 px-2 py-1 rounded font-semibold">Reset</span> between searches.</p>
          </div>
        </div>
      </div>
    </>
  );
}
