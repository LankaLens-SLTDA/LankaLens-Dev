'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Destination, searchDestinations } from '@/lib/api';

export default function MapPage() {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [crowdFilter, setCrowdFilter] = useState<string>('');
  const [maxCostFilter, setMaxCostFilter] = useState<number | undefined>(undefined);
  const [minRatingFilter, setMinRatingFilter] = useState<number | undefined>(undefined);
  const [useProximity, setUseProximity] = useState<boolean>(false);
  const [radiusKm, setRadiusKm] = useState<number>(50);

  // Selected Destination ID for side panel inspection
  const [selectedDestId, setSelectedDestId] = useState<number>(1);

  // Colombo default coordinates for spatial proximity search
  const colomboLat = 6.9271;
  const colomboLng = 79.8612;

  // React Query with live searchDestinations backend call
  const { data: searchResult, isLoading } = useQuery({
    queryKey: [
      'searchDestinations',
      searchQuery,
      selectedCategory,
      selectedActivity,
      crowdFilter,
      maxCostFilter,
      minRatingFilter,
      useProximity,
      radiusKm,
    ],
    queryFn: async () => {
      const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
      const res = await searchDestinations({
        q: searchQuery || undefined,
        category: categoryParam,
        activity: selectedActivity || undefined,
        crowd_level: crowdFilter || undefined,
        max_cost: maxCostFilter,
        min_rating: minRatingFilter,
        lat: useProximity ? colomboLat : undefined,
        lng: useProximity ? colomboLng : undefined,
        radius_km: useProximity ? radiusKm : undefined,
        limit: 20,
      });
      return res;
    },
  });

  const fallbackDestinations: Destination[] = [
    {
      id: 1,
      name: 'Sigiriya Ancient Rock Fortress',
      title: 'Sigiriya Ancient Rock Fortress',
      category: 'temple',
      district: 'Matale',
      province: 'Central Province',
      latitude: 7.957,
      longitude: 80.76,
      description:
        '5th-century royal citadel towering 200 meters over emerald jungle, famous for frescoes and water gardens.',
      desc: '5th-century royal citadel towering 200 meters over emerald jungle, famous for frescoes and water gardens.',
      activities: ['Hiking', 'Photography', 'Heritage'],
      estimated_visit_duration_minutes: 180,
      baseline_cost: 30,
      popularity: 98,
      rating: 4.9,
      reviews: 320,
      trust_score: 95,
      verification_state: 'verified',
      publication_status: 'published',
      is_verified: true,
      crowd_info: { density: 'High', peak_hours: '08:00 - 11:00' },
      community_stats: { upvotes: 450, save_count: 210 },
      images: ['/stitch_images/planner.png'],
      image_url: '/stitch_images/planner.png',
      image: '/stitch_images/planner.png',
      coord_x: '28%',
      coord_y: '22%',
      coords: { x: '28%', y: '22%' },
      elevation: '349 m',
      distance_from_colombo: '165 km from Colombo',
      distance: '165 km from Colombo',
    },
    {
      id: 2,
      name: 'Ella Nine Arch Bridge & Demodara',
      title: 'Ella Nine Arch Bridge & Demodara',
      category: 'nature',
      district: 'Badulla',
      province: 'Uva Province',
      latitude: 6.8768,
      longitude: 81.0608,
      description:
        'Iconic colonial viaduct tucked into dense tea hills, where blue trains cross scenic mountain valleys.',
      desc: 'Iconic colonial viaduct tucked into dense tea hills, where blue trains cross scenic mountain valleys.',
      activities: ['Photography', 'Hiking', 'Tea Tasting'],
      estimated_visit_duration_minutes: 120,
      baseline_cost: 0,
      popularity: 95,
      rating: 4.9,
      reviews: 512,
      trust_score: 92,
      verification_state: 'verified',
      publication_status: 'published',
      is_verified: true,
      crowd_info: { density: 'Moderate', peak_hours: '09:00 - 12:00' },
      community_stats: { upvotes: 620, save_count: 340 },
      images: ['/stitch_images/discover.png'],
      image_url: '/stitch_images/discover.png',
      image: '/stitch_images/discover.png',
      coord_x: '52%',
      coord_y: '48%',
      coords: { x: '52%', y: '48%' },
      elevation: '1,041 m',
      distance_from_colombo: '200 km from Colombo',
      distance: '200 km from Colombo',
    },
    {
      id: 3,
      name: 'Mirissa Coconut Tree Hill & Secret Beach',
      title: 'Mirissa Coconut Tree Hill & Secret Beach',
      category: 'beach',
      district: 'Matara',
      province: 'Southern Province',
      latitude: 5.9483,
      longitude: 80.4578,
      description:
        'Dramatic red-clay headland lined with coconut palms overlooking turquoise Indian Ocean waves.',
      desc: 'Dramatic red-clay headland lined with coconut palms overlooking turquoise Indian Ocean waves.',
      activities: ['Surfing', 'Photography', 'Whale Watching'],
      estimated_visit_duration_minutes: 90,
      baseline_cost: 10,
      popularity: 90,
      rating: 4.8,
      reviews: 240,
      trust_score: 88,
      verification_state: 'verified',
      publication_status: 'published',
      is_verified: true,
      crowd_info: { density: 'High', peak_hours: '16:30 - 18:30' },
      community_stats: { upvotes: 380, save_count: 190 },
      images: ['/stitch_images/map.png'],
      image_url: '/stitch_images/map.png',
      image: '/stitch_images/map.png',
      coord_x: '70%',
      coord_y: '75%',
      coords: { x: '70%', y: '75%' },
      elevation: '15 m',
      distance_from_colombo: '150 km from Colombo',
      distance: '150 km from Colombo',
    },
  ];

  const destinationsList = searchResult?.destinations || fallbackDestinations;
  const activeDest =
    destinationsList.find((d) => d.id === selectedDestId) ||
    destinationsList[0] ||
    fallbackDestinations[0];

  const activityOptions = [
    'Hiking',
    'Photography',
    'Wildlife',
    'Surfing',
    'Heritage',
    'Tea Tasting',
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden">
      <Navbar />

      <main className="w-full pl-20 flex-1 flex flex-col h-screen bg-ink-950 text-surface overflow-hidden relative">
        {/* Top Floating Search & Multi-Attribute Filter Bar */}
        <div className="absolute top-4 left-6 right-6 z-30 flex flex-col gap-2.5 bg-ink-950/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-6xl mx-auto">
          {/* Main Search Input & Category Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 flex-1 min-w-[280px]">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search by destination name, activity, region, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-surface text-body-sm focus:outline-none w-full placeholder:text-outline"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-outline hover:text-surface text-label-sm"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-surface'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setSelectedCategory('temple')}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'temple'
                    ? 'bg-signal-amber-500 text-on-secondary font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-signal-amber-500" />
                <span>Culture & Heritage</span>
              </button>
              <button
                onClick={() => setSelectedCategory('nature')}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'nature'
                    ? 'bg-success-600 text-white font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-success-600" />
                <span>Nature & Peaks</span>
              </button>
              <button
                onClick={() => setSelectedCategory('beach')}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'beach'
                    ? 'bg-sky-300 text-ink-950 font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-300" />
                <span>Coastal & Beaches</span>
              </button>
              <button
                onClick={() => setSelectedCategory('wildlife')}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'wildlife'
                    ? 'bg-emerald-400 text-ink-950 font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Wildlife & Safari</span>
              </button>
            </div>
          </div>

          {/* Detailed Filters & Spatial Discovery Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-label-sm">
            {/* Activity Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-outline text-label-xs font-semibold mr-1">Activity:</span>
              <button
                onClick={() => setSelectedActivity('')}
                className={`px-2 py-1 rounded text-label-xs ${
                  !selectedActivity
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'bg-white/5 text-outline'
                }`}
              >
                Any
              </button>
              {activityOptions.map((act) => (
                <button
                  key={act}
                  onClick={() => setSelectedActivity(selectedActivity === act ? '' : act)}
                  className={`px-2 py-1 rounded text-label-xs transition-colors ${
                    selectedActivity === act
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-surface'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>

            {/* Crowd Level & Cost & Spatial Proximity Controls */}
            <div className="flex items-center gap-3">
              {/* Crowd Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-outline text-label-xs">Crowd:</span>
                <select
                  value={crowdFilter}
                  onChange={(e) => setCrowdFilter(e.target.value)}
                  className="bg-white/5 text-surface text-label-xs px-2 py-1 rounded border border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-ink-950">
                    All Levels
                  </option>
                  <option value="Low" className="bg-ink-950">
                    Low Density
                  </option>
                  <option value="Moderate" className="bg-ink-950">
                    Moderate
                  </option>
                  <option value="High" className="bg-ink-950">
                    High Density
                  </option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-outline text-label-xs">Rating:</span>
                <select
                  value={minRatingFilter || ''}
                  onChange={(e) =>
                    setMinRatingFilter(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="bg-white/5 text-surface text-label-xs px-2 py-1 rounded border border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-ink-950">
                    Any
                  </option>
                  <option value="4.0" className="bg-ink-950">
                    ★ 4.0+
                  </option>
                  <option value="4.5" className="bg-ink-950">
                    ★ 4.5+
                  </option>
                  <option value="4.8" className="bg-ink-950">
                    ★ 4.8+
                  </option>
                </select>
              </div>

              {/* Max Cost Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-outline text-label-xs">Max Cost:</span>
                <select
                  value={maxCostFilter !== undefined ? maxCostFilter.toString() : ''}
                  onChange={(e) =>
                    setMaxCostFilter(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="bg-white/5 text-surface text-label-xs px-2 py-1 rounded border border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-ink-950">
                    Any Budget
                  </option>
                  <option value="0" className="bg-ink-950">
                    Free
                  </option>
                  <option value="15" className="bg-ink-950">
                    Under $15
                  </option>
                  <option value="35" className="bg-ink-950">
                    Under $35
                  </option>
                  <option value="50" className="bg-ink-950">
                    Under $50
                  </option>
                </select>
              </div>

              {/* Spatial Proximity Toggle */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-label-xs text-sky-300">
                  <input
                    type="checkbox"
                    checked={useProximity}
                    onChange={(e) => setUseProximity(e.target.checked)}
                    className="accent-primary rounded cursor-pointer"
                  />
                  <span>Proximity (Colombo)</span>
                </label>
                {useProximity && (
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min="10"
                      max="250"
                      step="10"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
                      className="w-16 h-1 accent-primary cursor-pointer"
                    />
                    <span className="text-label-xs text-outline w-10">{radiusKm}km</span>
                  </div>
                )}
              </div>

              {/* Backend Query Execution Metadata Pill */}
              {searchResult && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10 text-label-xs text-primary-fixed">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>
                    {searchResult.total} results ({searchResult.query_time_ms}ms{' '}
                    {searchResult.cached ? 'cached' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Split View: Map Canvas + Synchronized Results Panel */}
        <div className="flex flex-1 w-full h-full overflow-hidden relative pt-28">
          {/* Interactive Map Canvas */}
          <div className="flex-1 h-full relative bg-[#0B1210] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
            {/* SVG Contour & Polyline overlay */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="#8FD3D6"
                    strokeWidth="0.5"
                    strokeOpacity="0.2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path
                d="M-100,100 Q300,50 600,300 T1200,200"
                fill="none"
                stroke="#8FD3D6"
                strokeWidth="1"
                strokeOpacity="0.15"
              />
              <path
                d="M0,400 Q400,200 800,500 T1400,400"
                fill="none"
                stroke="#8FD3D6"
                strokeWidth="1"
                strokeOpacity="0.15"
              />
              <path
                className="animate-pulse"
                d="M 280 220 Q 420 310 520 480 T 720 620"
                fill="none"
                stroke="#abefe7"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Custom Interactive Pins */}
            {isLoading ? (
              <div className="z-20 text-primary flex items-center gap-2 bg-ink-950/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="material-symbols-outlined animate-spin">sync</span>
                <span>Searching destination network...</span>
              </div>
            ) : destinationsList.length === 0 ? (
              <div className="z-20 text-outline flex flex-col items-center gap-2 bg-ink-950/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md text-center max-w-sm">
                <span className="material-symbols-outlined text-[36px] text-signal-amber-500">
                  search_off
                </span>
                <span className="font-semibold text-surface">No Destinations Match Filters</span>
                <span className="text-body-xs text-outline">
                  Try expanding your search query, radius, or activity filters.
                </span>
              </div>
            ) : (
              destinationsList.map((dest) => {
                const posX =
                  dest.coords?.x ||
                  `${Math.min(85, Math.max(15, ((dest.longitude - 79.5) / 2.5) * 100))}%`;
                const posY =
                  dest.coords?.y ||
                  `${Math.min(85, Math.max(15, (1 - (dest.latitude - 5.8) / 4.0) * 100))}%`;

                return (
                  <div
                    key={dest.id}
                    onClick={() => setSelectedDestId(dest.id)}
                    style={{ top: posY, left: posX }}
                    className="absolute z-20 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                  >
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg ${
                        selectedDestId === dest.id
                          ? 'ring-4 ring-white ring-offset-2 ring-offset-ink-950 scale-110'
                          : ''
                      } ${
                        dest.category === 'temple'
                          ? 'bg-signal-amber-500 text-on-secondary'
                          : dest.category === 'nature'
                            ? 'bg-success-600 text-white'
                            : dest.category === 'wildlife'
                              ? 'bg-emerald-400 text-ink-950'
                              : 'bg-sky-300 text-ink-950'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {dest.category === 'temple'
                          ? 'temple_buddhist'
                          : dest.category === 'nature'
                            ? 'landscape'
                            : dest.category === 'wildlife'
                              ? 'pets'
                              : 'surfing'}
                      </span>
                      <div
                        className={`absolute -bottom-1 w-2 h-2 transform rotate-45 ${
                          dest.category === 'temple'
                            ? 'bg-signal-amber-500'
                            : dest.category === 'nature'
                              ? 'bg-success-600'
                              : dest.category === 'wildlife'
                                ? 'bg-emerald-400'
                                : 'bg-sky-300'
                        }`}
                      />
                    </div>
                    <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-ink-950/95 text-surface text-label-sm px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap pointer-events-none">
                      {dest.title || dest.name}
                    </div>
                  </div>
                );
              })
            )}

            {/* HUD Scale & Controls */}
            <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-ink-950/80 backdrop-blur-md p-1.5 rounded-xl shadow-2xl border border-white/10">
              <button
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-surface transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <button
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-surface transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <div className="w-full h-[1px] bg-white/10 my-0.5" />
              <button
                className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-lg shadow-md transition-colors"
                title="Current Location"
              >
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
            </div>

            {/* Active Route HUD Pill */}
            <div className="absolute top-6 right-6 z-20 hidden lg:flex items-center gap-4 bg-ink-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed">route</span>
                <div>
                  <div className="text-label-sm text-outline">Search Discovery Results</div>
                  <div className="text-body-sm text-surface font-semibold">
                    {destinationsList.length} Destinations Discovered
                  </div>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <Link
                href="/planner"
                className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-label-sm font-semibold transition-colors"
              >
                Open Itinerary
              </Link>
            </div>
          </div>

          {/* Synchronized Side Results Panel */}
          {activeDest && (
            <div className="w-full lg:w-[420px] bg-surface text-on-surface border-l border-line-200 flex flex-col h-full z-20 shadow-2xl">
              <div className="p-6 border-b border-line-200 flex items-center justify-between">
                <div>
                  <span className="text-label-sm text-primary uppercase font-bold tracking-wider">
                    Location Inspection
                  </span>
                  <h2 className="font-heading-lg text-on-surface mt-0.5">
                    {activeDest.title || activeDest.name}
                  </h2>
                </div>
                <span className="px-2.5 py-1 bg-canvas-50 rounded-full text-label-sm text-primary font-semibold border border-line-200">
                  {activeDest.district || activeDest.province}
                </span>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-md bg-ink-950">
                  <Image
                    src={activeDest.image || activeDest.image_url || '/stitch_images/planner.png'}
                    alt={activeDest.title || activeDest.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-signal-amber-500 text-[14px]">
                      star
                    </span>
                    <span>
                      {activeDest.rating} ({activeDest.reviews})
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading-md text-on-surface">
                      {activeDest.title || activeDest.name}
                    </h3>
                    {activeDest.is_verified && (
                      <span className="px-2 py-0.5 bg-success-600/10 text-success-600 rounded text-label-xs font-bold flex items-center gap-1 border border-success-600/20">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                    {activeDest.description || activeDest.desc}
                  </p>
                </div>

                {/* Activities Badges */}
                {activeDest.activities && activeDest.activities.length > 0 && (
                  <div>
                    <span className="text-label-xs text-outline font-semibold block mb-1.5">
                      Activities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDest.activities.map((act) => (
                        <span
                          key={act}
                          className="px-2.5 py-1 bg-canvas-50 text-on-surface text-label-xs rounded-lg border border-line-200 font-medium"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line-200">
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Crowd Density</span>
                    <strong className="text-body-md font-semibold text-on-surface">
                      {activeDest.crowd_info?.density || 'Moderate'}
                    </strong>
                  </div>
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Distance</span>
                    <strong className="text-body-md font-semibold text-on-surface">
                      {activeDest.distance || activeDest.distance_from_colombo || '150 km'}
                    </strong>
                  </div>
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Baseline Cost</span>
                    <strong className="text-body-md font-semibold text-on-surface">
                      {activeDest.baseline_cost ? `$${activeDest.baseline_cost}` : 'Free'}
                    </strong>
                  </div>
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Trust Rating</span>
                    <strong className="text-body-md font-semibold text-primary">
                      {activeDest.trust_score || 90}% Trust
                    </strong>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Link
                    href="/planner"
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-heading-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Add to Daily Itinerary</span>
                  </Link>
                  <Link
                    href="/ai-assistant"
                    className="w-full bg-canvas-50 hover:bg-surface-container text-primary font-label-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-line-200 font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>Ask AI Assistant About This Location</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
