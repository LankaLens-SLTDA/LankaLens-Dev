'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchFromBackend } from '@/lib/api';

interface Destination {
  id: number;
  title: string;
  category: 'temple' | 'nature' | 'beach' | 'wildlife';
  region: string;
  rating: number;
  reviews: number;
  desc: string;
  image: string;
  coords: { x: string; y: string };
  elevation: string;
  distance: string;
}

export default function MapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDestId, setSelectedDestId] = useState<number>(1);
  const [regionFilter, setRegionFilter] = useState<string>('');

  const fallbackDestinations: Destination[] = [
    {
      id: 1,
      title: 'Sigiriya Ancient Rock Fortress',
      category: 'temple',
      region: 'Cultural Triangle',
      rating: 4.9,
      reviews: 320,
      desc: '5th-century royal citadel towering 200 meters over emerald jungle, famous for frescoes and water gardens.',
      image: '/stitch_images/planner.png',
      coords: { x: '28%', y: '22%' },
      elevation: '349 m',
      distance: '165 km from Colombo',
    },
    {
      id: 2,
      title: 'Ella Nine Arch Bridge & Demodara',
      category: 'nature',
      region: 'Hill Country',
      rating: 4.9,
      reviews: 512,
      desc: 'Iconic colonial viaduct tucked into dense tea hills, where blue trains cross scenic mountain valleys.',
      image: '/stitch_images/discover.png',
      coords: { x: '52%', y: '48%' },
      elevation: '1,041 m',
      distance: '200 km from Colombo',
    },
    {
      id: 3,
      title: 'Mirissa Coconut Tree Hill & Secret Beach',
      category: 'beach',
      region: 'Southern Coast',
      rating: 4.8,
      reviews: 240,
      desc: 'Dramatic red-clay headland lined with coconut palms overlooking turquoise Indian Ocean waves.',
      image: '/stitch_images/map.png',
      coords: { x: '70%', y: '75%' },
      elevation: '15 m',
      distance: '150 km from Colombo',
    },
  ];

  const { data: apiData } = useQuery({
    queryKey: ['destinations', selectedCategory, regionFilter],
    queryFn: async () => {
      const res = await fetchFromBackend<{ destinations: Destination[] }>('/destinations');
      return res?.destinations || null;
    },
  });

  const destinations = apiData || fallbackDestinations;

  const filtered = destinations.filter((d) => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesRegion = !regionFilter || d.region.toLowerCase().includes(regionFilter.toLowerCase());
    return matchesCat && matchesRegion;
  });

  const selectedDest = destinations.find((d) => d.id === selectedDestId) || destinations[0];

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden">
      <Navbar />

      <main className="w-full pl-20 flex-1 flex flex-col h-screen bg-ink-950 text-surface overflow-hidden relative">
        {/* Filter & Search Bar Overlay */}
        <div className="absolute top-4 left-6 right-6 z-30 flex flex-wrap items-center justify-between gap-3 bg-ink-950/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-white/10 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 flex-1">
              <span className="material-symbols-outlined text-sky-300 text-[18px]">explore</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-transparent text-surface text-body-sm focus:outline-none w-full cursor-pointer"
              >
                <option value="" className="bg-ink-950 text-surface">All Regions (Sri Lanka)</option>
                <option value="Hill Country" className="bg-ink-950 text-surface">Hill Country & Tea Estates</option>
                <option value="Cultural" className="bg-ink-950 text-surface">Cultural Triangle</option>
                <option value="Southern" className="bg-ink-950 text-surface">Southern Coast & Beaches</option>
              </select>
            </div>
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
              All Pins
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

        {/* Split View: Map Canvas + Synchronized Results Panel */}
        <div className="flex flex-1 w-full h-full overflow-hidden relative">
          {/* Interactive Map Canvas */}
          <div className="flex-1 h-full relative bg-[#0B1210] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
            {/* SVG Contour & Polyline overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#8FD3D6" strokeWidth="0.5" strokeOpacity="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path d="M-100,100 Q300,50 600,300 T1200,200" fill="none" stroke="#8FD3D6" strokeWidth="1" strokeOpacity="0.15" />
              <path d="M0,400 Q400,200 800,500 T1400,400" fill="none" stroke="#8FD3D6" strokeWidth="1" strokeOpacity="0.15" />
              <path className="animate-pulse" d="M 280 220 Q 420 310 520 480 T 720 620" fill="none" stroke="#abefe7" strokeWidth="3" strokeDasharray="6 4" />
            </svg>

            {/* Custom Interactive Pins */}
            {filtered.map((dest) => (
              <div
                key={dest.id}
                onClick={() => setSelectedDestId(dest.id)}
                style={{ top: dest.coords.y, left: dest.coords.x }}
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
                      : 'bg-sky-300 text-ink-950'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {dest.category === 'temple' ? 'temple_buddhist' : dest.category === 'nature' ? 'landscape' : 'surfing'}
                  </span>
                  <div
                    className={`absolute -bottom-1 w-2 h-2 transform rotate-45 ${
                      dest.category === 'temple'
                        ? 'bg-signal-amber-500'
                        : dest.category === 'nature'
                        ? 'bg-success-600'
                        : 'bg-sky-300'
                    }`}
                  />
                </div>
                <div className="absolute left-1/2 -top-10 transform -translate-x-1/2 bg-ink-950/95 text-surface text-label-sm px-2.5 py-1 rounded-md shadow-xl border border-white/10 whitespace-nowrap pointer-events-none">
                  {dest.title.split(' ')[0]} {dest.title.split(' ')[1]}
                </div>
              </div>
            ))}

            {/* HUD Scale & Controls */}
            <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-ink-950/80 backdrop-blur-md p-1.5 rounded-xl shadow-2xl border border-white/10">
              <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-surface transition-colors" title="Zoom In">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-surface transition-colors" title="Zoom Out">
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <div className="w-full h-[1px] bg-white/10 my-0.5" />
              <button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-lg shadow-md transition-colors" title="Current Location">
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
            </div>

            {/* Active Route HUD Pill */}
            <div className="absolute top-20 right-6 z-20 hidden lg:flex items-center gap-4 bg-ink-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed">route</span>
                <div>
                  <div className="text-label-sm text-outline">Active Spatial Route</div>
                  <div className="text-body-sm text-surface font-semibold">3 Landmarks · 240 km Total</div>
                </div>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <Link
                href="/planner"
                className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-label-sm font-semibold transition-colors"
              >
                Send to Planner
              </Link>
            </div>
          </div>

          {/* Synchronized Side Results Panel */}
          <div className="w-full lg:w-[420px] bg-surface text-on-surface border-l border-line-200 flex flex-col h-full z-20 shadow-2xl">
            <div className="p-6 border-b border-line-200 flex items-center justify-between">
              <div>
                <span className="text-label-sm text-primary uppercase font-bold tracking-wider">Location Inspection</span>
                <h2 className="font-heading-lg text-on-surface mt-0.5">Point Details</h2>
              </div>
              <span className="px-2.5 py-1 bg-canvas-50 rounded-full text-label-sm text-primary font-semibold border border-line-200">
                {selectedDest.region}
              </span>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-md">
                <Image
                  src={selectedDest.image}
                  alt={selectedDest.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-signal-amber-500 text-[14px]">star</span>
                  <span>{selectedDest.rating} ({selectedDest.reviews})</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading-md text-on-surface">{selectedDest.title}</h3>
                <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">{selectedDest.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line-200">
                <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                  <span className="text-label-sm text-outline block">Elevation</span>
                  <strong className="text-body-md font-semibold text-on-surface">{selectedDest.elevation}</strong>
                </div>
                <div className="bg-canvas-50 p-3 rounded-lg border border-line-200">
                  <span className="text-label-sm text-outline block">Distance</span>
                  <strong className="text-body-md font-semibold text-on-surface">{selectedDest.distance}</strong>
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
        </div>
      </main>
    </div>
  );
}
