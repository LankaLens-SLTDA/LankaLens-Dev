'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Destination,
  PartnerLocation,
  getMapViewportDiscovery,
  searchDestinations,
} from '@/lib/api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Map viewport and discovery state
  const [zoomLevel, setZoomLevel] = useState<number>(7.5);
  const [showPartners, setShowPartners] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [crowdFilter, setCrowdFilter] = useState<string>('');
  const [selectedDestId, setSelectedDestId] = useState<number>(1);

  // Initial Sri Lanka Viewport Bounding Box
  const [viewportBounds] = useState({
    min_lat: 5.0,
    min_lng: 79.0,
    max_lat: 10.0,
    max_lng: 82.0,
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // 1. Fetch Mapbox Viewport Discovery Data
  const { data: viewportData, isLoading: isViewportLoading } = useQuery({
    queryKey: [
      'mapViewportDiscovery',
      viewportBounds.min_lat,
      viewportBounds.min_lng,
      viewportBounds.max_lat,
      viewportBounds.max_lng,
      zoomLevel,
      selectedDestId,
      showPartners,
    ],
    queryFn: async () => {
      const res = await getMapViewportDiscovery({
        min_lat: viewportBounds.min_lat,
        min_lng: viewportBounds.min_lng,
        max_lat: viewportBounds.max_lat,
        max_lng: viewportBounds.max_lng,
        zoom: zoomLevel,
        selected_dest_id: selectedDestId,
        include_partners: showPartners,
      });
      return res;
    },
  });

  // 2. Fetch Multi-Attribute Search Results if Search Active
  const { data: searchResult } = useQuery({
    queryKey: [
      'searchDestinationsMap',
      searchQuery,
      selectedCategory,
      selectedActivity,
      crowdFilter,
    ],
    queryFn: async () => {
      const res = await searchDestinations({
        q: searchQuery || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        activity: selectedActivity || undefined,
        crowd_level: crowdFilter || undefined,
        limit: 25,
      });
      return res;
    },
  });

  // Initialize Mapbox GL canvas if token is available
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [80.7718, 7.8731],
      zoom: 7.5,
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  const fallbackDestinations: Destination[] = [
    {
      id: 1,
      name: 'Sigiriya Ancient Rock Fortress',
      title: 'Sigiriya Ancient Rock Fortress',
      category: 'temple',
      district: 'Matale',
      province: 'Central',
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
      crowd_info: {
        density: 'High',
        peak_hours: '08:00 - 11:00',
        peak_months: ['Dec', 'Jan', 'Aug'],
      },
      partner_info: {
        name: 'Sigiriya Eco-Tuk Transport Co-op',
        type: 'Transport Co-op',
        contact: '+94 66 223 1144',
        rating: 4.9,
        verified: true,
      },
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
      province: 'Uva',
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
      crowd_info: {
        density: 'Moderate',
        peak_hours: '09:00 - 12:00',
        peak_months: ['Jan', 'Feb', 'Jul'],
      },
      partner_info: {
        name: 'Ella Mountain Guides & Hiking Collective',
        type: 'Eco-Guide',
        contact: '+94 57 443 9090',
        rating: 4.88,
        verified: true,
      },
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
      province: 'Southern',
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
      crowd_info: {
        density: 'High',
        peak_hours: '16:30 - 18:30',
        peak_months: ['Dec', 'Jan', 'Mar'],
      },
      partner_info: {
        name: 'Mirissa Marine Tour Co-op',
        type: 'Eco-Guide',
        contact: '+94 41 225 9988',
        rating: 4.96,
        verified: true,
      },
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

  const fallbackPartners: PartnerLocation[] = [
    {
      id: 101,
      name: 'Sigiriya Eco-Tuk Transport Co-op',
      type: 'Transport Co-op',
      latitude: 7.952,
      longitude: 80.755,
      rating: 4.9,
      contact: '+94 66 223 1144',
      verified: true,
      associated_destination_id: 1,
    },
    {
      id: 103,
      name: 'Ella Mountain Guides Collective',
      type: 'Eco-Guide',
      latitude: 6.872,
      longitude: 81.055,
      rating: 4.88,
      contact: '+94 57 443 9090',
      verified: true,
      associated_destination_id: 2,
    },
  ];

  // Resolve list of active destinations
  const rawList = searchQuery ? searchResult?.destinations : viewportData?.destinations;
  const destinationsList = rawList || fallbackDestinations;

  const clustersList = viewportData?.clusters || [];
  const partnersList = showPartners ? viewportData?.partner_locations || fallbackPartners : [];
  const recommendedAlternatives =
    viewportData?.recommended_alternatives || fallbackDestinations.slice(1);

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
        {/* Floating Interactive Toolbar (Search, Filter, Viewport Controls) */}
        <div className="absolute top-4 left-6 right-6 z-30 flex flex-col gap-2.5 bg-ink-950/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/10 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 flex-1 min-w-[280px]">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search map destinations by name, activity, region..."
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

            {/* Category Selector Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-label-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-surface'
                }`}
              >
                All Category Pins
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
                <span>Temples & Culture</span>
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
            </div>
          </div>

          {/* Detailed Viewport & Partner Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-label-sm">
            {/* Activity Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-outline text-label-xs font-semibold mr-1">
                Filter Experience:
              </span>
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

            {/* Viewport Layer Toggles & Crowd Indicators */}
            <div className="flex items-center gap-3">
              {/* Local Partner Layer Toggle */}
              <button
                onClick={() => setShowPartners(!showPartners)}
                className={`px-2.5 py-1 rounded-lg text-label-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  showPartners
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-white/5 text-outline border-white/10 hover:text-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">storefront</span>
                <span>Local Partners ({partnersList.length})</span>
              </button>

              {/* Crowd Density Select Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-outline text-label-xs">Crowd Level:</span>
                <select
                  value={crowdFilter}
                  onChange={(e) => setCrowdFilter(e.target.value)}
                  className="bg-white/5 text-surface text-label-xs px-2 py-1 rounded border border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-ink-950">
                    All Densities
                  </option>
                  <option value="Low" className="bg-ink-950">
                    Low Crowd
                  </option>
                  <option value="Moderate" className="bg-ink-950">
                    Moderate
                  </option>
                  <option value="High" className="bg-ink-950">
                    High Density
                  </option>
                </select>
              </div>

              {/* Viewport Metadata HUD Pill */}
              {viewportData && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10 text-label-xs text-primary-fixed">
                  <span className="material-symbols-outlined text-[14px]">map</span>
                  <span>
                    {viewportData.total_in_viewport} Locations ({viewportData.query_time_ms}ms)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Split View Canvas & Side Inspection Panel */}
        <div className="flex flex-1 w-full h-full overflow-hidden relative pt-28">
          {/* Interactive Map Canvas Container */}
          <div className="flex-1 h-full relative bg-[#0B1210] overflow-hidden flex items-center justify-center">
            {/* Mapbox GL Target Ref */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

            {/* Fallback Vector Contour & Interactive Pin Canvas when Mapbox Token is absent/offline */}
            {!mapboxToken && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                {/* SVG Topographic Mesh */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="grid-map" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path
                        d="M 60 0 L 0 0 0 60"
                        fill="none"
                        stroke="#8FD3D6"
                        strokeWidth="0.5"
                        strokeOpacity="0.2"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-map)" />
                  <path
                    d="M-100,150 Q300,50 600,350 T1200,250"
                    fill="none"
                    stroke="#8FD3D6"
                    strokeWidth="1.5"
                    strokeOpacity="0.2"
                  />
                  <path
                    d="M0,450 Q400,250 800,550 T1400,450"
                    fill="none"
                    stroke="#8FD3D6"
                    strokeWidth="1.5"
                    strokeOpacity="0.2"
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

                {/* Spatial Clusters Overlay (Zoom < 10.0) */}
                {zoomLevel < 10.0 &&
                  clustersList.map((cluster) => {
                    const posX = `${Math.min(85, Math.max(15, ((cluster.longitude - 79.5) / 2.5) * 100))}%`;
                    const posY = `${Math.min(85, Math.max(15, (1 - (cluster.latitude - 5.8) / 4.0) * 100))}%`;

                    return (
                      <div
                        key={cluster.cluster_id}
                        style={{ top: posY, left: posX }}
                        className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-primary/90 text-on-primary font-bold text-label-md shadow-2xl border-2 border-white animate-bounce cursor-pointer"
                        title={`Cluster: ${cluster.point_count} destinations`}
                        onClick={() => setZoomLevel(11.0)}
                      >
                        <span>{cluster.point_count}</span>
                      </div>
                    );
                  })}

                {/* Destination Markers */}
                {isViewportLoading ? (
                  <div className="z-20 text-primary flex items-center gap-2 bg-ink-950/90 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    <span>Retrieving Map Viewport Discovery...</span>
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
                          className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-xl ${
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

                {/* Local Verified Partner Markers Layer */}
                {showPartners &&
                  partnersList.map((partner) => {
                    const posX = `${Math.min(85, Math.max(15, ((partner.longitude - 79.5) / 2.5) * 100))}%`;
                    const posY = `${Math.min(85, Math.max(15, (1 - (partner.latitude - 5.8) / 4.0) * 100))}%`;

                    return (
                      <div
                        key={partner.id}
                        style={{ top: posY, left: posX }}
                        className="absolute z-20 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                        title={`Partner: ${partner.name}`}
                      >
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400">
                          <span className="material-symbols-outlined text-[16px]">storefront</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Map HUD Zoom Controls */}
            <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-ink-950/90 backdrop-blur-md p-1.5 rounded-xl shadow-2xl border border-white/10">
              <button
                onClick={() => setZoomLevel((z) => Math.min(15, z + 1))}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-surface transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(5, z - 1))}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-surface transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <div className="w-full h-[1px] bg-white/10 my-0.5" />
              <button
                onClick={() => setZoomLevel(7.5)}
                className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-lg shadow-md transition-colors"
                title="Reset Sri Lanka View"
              >
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
            </div>
          </div>

          {/* Synchronized Inspection & Recommended Alternatives Panel */}
          {activeDest && (
            <div className="w-full lg:w-[440px] bg-surface text-on-surface border-l border-line-200 flex flex-col h-full z-20 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-line-200 flex items-center justify-between">
                <div>
                  <span className="text-label-sm text-primary uppercase font-bold tracking-wider">
                    Geographic Inspection
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
                {/* Destination Image & Crowd Level Badge */}
                <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-md bg-ink-950">
                  <Image
                    src={activeDest.image || activeDest.image_url || '/stitch_images/planner.png'}
                    alt={activeDest.title || activeDest.name}
                    fill
                    className="object-cover"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-label-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-signal-amber-500 text-[14px]">
                      star
                    </span>
                    <span>
                      {activeDest.rating} ({activeDest.reviews})
                    </span>
                  </div>

                  {/* Crowd Level Indicator Pill */}
                  <div className="absolute bottom-3 left-3 bg-ink-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-label-xs flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeDest.crowd_info?.density === 'High'
                          ? 'bg-signal-amber-500 animate-pulse'
                          : activeDest.crowd_info?.density === 'Moderate'
                            ? 'bg-sky-400'
                            : 'bg-success-600'
                      }`}
                    />
                    <span className="text-white font-semibold">
                      {activeDest.crowd_info?.density || 'Moderate'} Crowd
                    </span>
                    <span className="text-outline">
                      ({activeDest.crowd_info?.peak_hours || '10:00 - 14:00'})
                    </span>
                  </div>
                </div>

                {/* Description & Verification */}
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

                {/* Route & Travel Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line-200">
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Elevation</span>
                    <strong className="text-body-md font-semibold text-on-surface">
                      {activeDest.elevation || '350 m'}
                    </strong>
                  </div>
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Distance</span>
                    <strong className="text-body-md font-semibold text-on-surface">
                      {activeDest.distance || activeDest.distance_from_colombo || '165 km'}
                    </strong>
                  </div>
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Visit Duration</span>
                    <strong className="text-body-md font-semibold text-on-surface">
                      {activeDest.estimated_visit_duration_minutes || 180} mins
                    </strong>
                  </div>
                  <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                    <span className="text-label-sm text-outline block">Trust Score</span>
                    <strong className="text-body-md font-semibold text-primary">
                      {Math.round((activeDest.trust_score || 0.95) * 100)}% Verified
                    </strong>
                  </div>
                </div>

                {/* Verified Local Partner Info Card */}
                {activeDest.partner_info && (
                  <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-label-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">storefront</span>
                        Verified Local Ecosystem Partner
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-label-xs font-bold">
                        ★ {activeDest.partner_info.rating}
                      </span>
                    </div>
                    <h4 className="font-semibold text-body-sm text-indigo-950 mt-1">
                      {activeDest.partner_info.name}
                    </h4>
                    <p className="text-body-xs text-indigo-700 mt-0.5">
                      {activeDest.partner_info.type} · Contact: {activeDest.partner_info.contact}
                    </p>
                  </div>
                )}

                {/* Recommended Alternatives Section */}
                {recommendedAlternatives.length > 0 && (
                  <div className="pt-4 border-t border-line-200">
                    <h4 className="font-heading-sm text-on-surface flex items-center justify-between mb-3">
                      <span>Recommended Alternatives</span>
                      <span className="text-label-xs text-outline font-normal">
                        Surfaced spatially
                      </span>
                    </h4>
                    <div className="space-y-2.5">
                      {recommendedAlternatives.map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => setSelectedDestId(alt.id)}
                          className="p-3 bg-canvas-50 hover:bg-surface-container rounded-xl border border-line-200 transition-colors cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <h5 className="font-semibold text-body-sm text-on-surface">
                              {alt.title || alt.name}
                            </h5>
                            <span className="text-label-xs text-outline">
                              {alt.category} · {alt.district}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-label-xs font-bold text-signal-amber-500">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            <span>{alt.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
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
