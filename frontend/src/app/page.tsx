'use client';

import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, MapPin, ArrowRight, ShieldAlert, Users } from 'lucide-react';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredStops = [
    { title: 'Ella Rock & Nine Arch Bridge', region: 'Central Highlands', category: 'Hiking & Scenery', image: '/stitch_images/discover.png', rating: 4.9 },
    { title: 'Sigiriya Ancient Fortress', region: 'Cultural Triangle', category: 'Heritage & Archaeology', image: '/stitch_images/planner.png', rating: 5.0 },
    { title: 'Arugam Bay Surf Points', region: 'Eastern Coast', category: 'Surfing & Beaches', image: '/stitch_images/map.png', rating: 4.8 },
    { title: 'Yala Elephant Sanctuary', region: 'Southern Province', category: 'Wildlife & Safari', image: '/stitch_images/sustainability.png', rating: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1">
        {/* Hero Section with Immersive Map Fragment & Overlays */}
        <section className="relative w-full min-h-[800px] bg-canvas-0 overflow-hidden flex flex-col justify-between pt-12 pb-16 border-b border-line-200/50">
          {/* Background cartography grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#0F5C56 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 flex flex-col items-start gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full text-label-sm text-primary font-medium tracking-wide border border-line-200">
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>CARTOGRAPHIC TRAVEL DISCOVERY</span>
              </div>

              <h1 className="font-display-xl text-on-background tracking-tight">
                Uncover the soulful essence of <span className="text-primary italic">Lanka.</span>
              </h1>

              <p className="font-body-lg text-on-surface-variant max-w-xl">
                An editorial cartographic guide to Sri Lanka. Precision maps, bespoke itineraries, and AI-curated journeys through misty peaks, ancient temples, and golden coastlines.
              </p>

              {/* Overlaid Quick Search Bar */}
              <div className="w-full max-w-xl bg-surface shadow-md rounded-xl p-2 flex items-center gap-3 border border-line-200/80">
                <div className="flex items-center gap-2 pl-3 flex-1">
                  <span className="material-symbols-outlined text-outline">location_on</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Where do you want to explore? (e.g., Ella, Sigiriya)"
                    className="w-full bg-transparent text-on-surface placeholder:text-outline text-body-md focus:outline-none"
                  />
                </div>
                <Link
                  href={`/map?q=${encodeURIComponent(searchQuery)}`}
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-lg font-label-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Explore</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-8 pt-4 text-body-sm text-on-surface-variant border-t border-line-200/60 w-full">
                <div>
                  <strong className="text-on-surface block font-heading-lg text-[20px]">120+</strong>
                  <span>Curated Stops</span>
                </div>
                <div className="w-px h-8 bg-line-200" />
                <div>
                  <strong className="text-on-surface block font-heading-lg text-[20px]">4.9/5</strong>
                  <span>Traveler Rating</span>
                </div>
                <div className="w-px h-8 bg-line-200" />
                <div>
                  <strong className="text-on-surface block font-heading-lg text-[20px]">100%</strong>
                  <span>Bespoke AI</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Map Fragment Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="w-full h-[420px] rounded-xl overflow-hidden shadow-xl relative bg-surface-container flex items-center justify-center border border-line-200">
                <Image
                  src="/stitch_images/map.png"
                  alt="Cartographic Map Preview of Sri Lanka"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105 opacity-90"
                />

                {/* Map Interactive Pins */}
                <div className="absolute top-[35%] left-[45%] flex flex-col items-center group cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-secondary animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md relative z-10">
                    <span className="material-symbols-outlined text-[14px]">mountain_flag</span>
                  </div>
                  <div className="bg-surface/95 backdrop-blur-md px-2 py-1 rounded text-label-sm text-on-surface mt-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-line-200 whitespace-nowrap">
                    Ella Rock
                  </div>
                </div>

                <div className="absolute top-[25%] left-[30%] flex flex-col items-center group cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-secondary animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md relative z-10">
                    <span className="material-symbols-outlined text-[14px]">castle</span>
                  </div>
                  <div className="bg-surface/95 backdrop-blur-md px-2 py-1 rounded text-label-sm text-on-surface mt-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-line-200 whitespace-nowrap">
                    Sigiriya Fortress
                  </div>
                </div>

                <div className="absolute bottom-[30%] left-[60%] flex flex-col items-center group cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-secondary animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md relative z-10">
                    <span className="material-symbols-outlined text-[14px]">surfing</span>
                  </div>
                  <div className="bg-surface/95 backdrop-blur-md px-2 py-1 rounded text-label-sm text-on-surface mt-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-line-200 whitespace-nowrap">
                    Arugam Bay
                  </div>
                </div>

                {/* Map HUD Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-3 rounded-lg flex items-center justify-between text-body-sm text-on-surface shadow-sm border border-line-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
                    <span className="font-medium">Interactive Cartography Layer</span>
                  </div>
                  <span className="text-primary text-label-sm font-semibold">Live GPS Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Three Primary Entry Navigation Cards */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full py-20">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-label-sm text-primary uppercase tracking-widest mb-2 font-semibold">
              Tailored Navigation
            </span>
            <h2 className="font-display-lg text-on-background">Choose your way to discover</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Explore by map */}
            <Link
              href="/map"
              className="bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-8 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md border border-line-200/60"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">map</span>
                </div>
                <h3 className="font-heading-lg text-on-surface">Explore by Map</h3>
                <p className="font-body-md text-on-surface-variant">
                  Navigate through spatial clusters, terrain shifts, and hidden cultural points across the island with our high-fidelity interactive map.
                </p>
              </div>
              <div className="pt-8 flex items-center gap-2 text-primary font-label-sm tracking-wide font-semibold">
                <span>Open interactive map</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            {/* Card 2: Plan a trip */}
            <Link
              href="/planner"
              className="bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-8 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md border border-line-200/60"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">event_note</span>
                </div>
                <h3 className="font-heading-lg text-on-surface">Plan a Trip</h3>
                <p className="font-body-md text-on-surface-variant">
                  Craft custom day-by-day itineraries tailored to your pace, accommodation preferences, and must-see archaeological or natural wonders.
                </p>
              </div>
              <div className="pt-8 flex items-center gap-2 text-primary font-label-sm tracking-wide font-semibold">
                <span>Start planning</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            {/* Card 3: Ask AI assistant */}
            <Link
              href="/ai-assistant"
              className="bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-8 flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-md border border-line-200/60"
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-deep-teal-600 to-sky-300 text-on-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                </div>
                <h3 className="font-heading-lg text-on-surface">Ask AI Assistant</h3>
                <p className="font-body-md text-on-surface-variant">
                  Consult our intelligent travel companion for instant recommendations on local cuisine, train ticket bookings, and off-the-beaten-path advice.
                </p>
              </div>
              <div className="pt-8 flex items-center gap-2 text-primary font-label-sm tracking-wide font-semibold">
                <span>Chat with AI</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Curated Destinations Section */}
        <section className="bg-canvas-50 py-20 border-t border-line-200/60">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-label-sm text-primary uppercase tracking-widest mb-2 font-semibold">Curated Collections</span>
                <h2 className="font-display-lg text-on-background">Must-Visit Sri Lankan Landmarks</h2>
              </div>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 text-primary font-label-sm font-semibold hover:underline"
              >
                <span>View all 120+ stops</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStops.map((stop, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-line-200/60 transition-all flex flex-col group"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={stop.image}
                      alt={stop.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-label-sm font-semibold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-signal-amber-500 text-[14px]">star</span>
                      <span>{stop.rating}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <span className="text-label-sm text-primary font-medium">{stop.category}</span>
                      <h3 className="font-heading-sm text-on-surface mt-1 group-hover:text-primary transition-colors">
                        {stop.title}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-outline">location_on</span>
                        <span>{stop.region}</span>
                      </p>
                    </div>
                    <Link
                      href="/planner"
                      className="text-label-sm font-semibold text-primary flex items-center gap-1 pt-2 border-t border-line-200/60"
                    >
                      <span>Add to Itinerary</span>
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hazard & Sustainability Monitor Teaser */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full py-16">
          <div className="bg-primary text-on-primary rounded-2xl p-8 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-label-sm text-sky-300 font-medium mb-4">
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span>REAL-TIME SAFETY & ECO MONITORING</span>
              </div>
              <h2 className="font-display-lg mb-4 text-white">Travel safely with live weather & hazard data</h2>
              <p className="font-body-lg text-on-primary-container">
                Monitor coastal surf conditions, landslide risks in highland rail tracks, and eco-certified wildlife reserves in real time.
              </p>
            </div>
            <Link
              href="/sustainability"
              className="relative z-10 bg-secondary hover:bg-secondary-container text-on-secondary px-8 py-4 rounded-xl font-heading-sm transition-all whitespace-nowrap shadow-md cursor-pointer"
            >
              View Live Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-ink-950 text-canvas-50 py-12 border-t border-line-200/20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">map</span>
            </div>
            <span className="font-heading-lg tracking-tight">LankaLens</span>
          </div>
          <p className="text-body-sm text-line-200">
            © 2026 LankaLens. Precision Cartography & Intelligent Tourism for Sri Lanka.
          </p>
        </div>
      </footer>
    </div>
  );
}
