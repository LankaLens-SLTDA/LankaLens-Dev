'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DestinationDetailsResponse, getDestinationDetails } from '@/lib/api';

export default function DestinationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const destId = parseInt(resolvedParams.id, 10) || 1;

  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<
    'hotels' | 'vehicles' | 'guides'
  >('hotels');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Fetch full authoritative destination profile payload via React Query
  const { data: detailsData } = useQuery({
    queryKey: ['destinationDetails', destId],
    queryFn: async () => {
      const res = await getDestinationDetails(destId);
      return res;
    },
  });

  const fallbackData: DestinationDetailsResponse = {
    destination: {
      id: destId,
      name: 'Sigiriya Ancient Rock Fortress',
      title: 'Sigiriya Ancient Rock Fortress',
      category: 'temple',
      district: 'Matale',
      province: 'Central',
      latitude: 7.957,
      longitude: 80.76,
      description:
        '5th-century royal citadel towering 200 meters over emerald jungle, famous for ancient frescoes, water gardens, and the iconic Lion Gate.',
      desc: '5th-century royal citadel towering 200 meters over emerald jungle.',
      activities: ['Rock Climbing', 'Heritage Tour', 'Photography', 'Nature Walk'],
      estimated_visit_duration_minutes: 180,
      baseline_cost: 30,
      popularity: 98,
      rating: 4.9,
      reviews: 320,
      trust_score: 0.95,
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
      images: [
        '/stitch_images/planner.png',
        '/stitch_images/discover.png',
        '/stitch_images/map.png',
      ],
      image_url: '/stitch_images/planner.png',
      image: '/stitch_images/planner.png',
      coord_x: '28%',
      coord_y: '22%',
      coords: { x: '28%', y: '22%' },
      elevation: '349 m',
      distance_from_colombo: '165 km from Colombo',
      distance: '165 km from Colombo',
    },
    community_posts: [
      {
        id: 1001,
        author: 'Dinuka Silva',
        role: 'Verified Local Guide',
        avatar: '/stitch_images/planner.png',
        time: '2 hours ago',
        verified: true,
        location: 'Sigiriya Summit Viewpoint',
        destination_id: destId,
        rating: 5.0,
        image: '/stitch_images/planner.png',
        caption:
          'Early morning sunrise view at Sigiriya. Best time to ascend is before 09:00 AM to beat heat and crowd queues!',
        tags: ['Photography', 'Tip', 'CrowdFree'],
        likes_count: 84,
        comments_count: 12,
        comments: [],
        ecoPoints: 120,
        commentsCount: 12,
        saves_count: 15,
      },
      {
        id: 1002,
        author: 'Clara Dupont',
        role: 'Eco-Traveler',
        avatar: '/stitch_images/discover.png',
        time: 'Yesterday',
        verified: true,
        location: 'Sigiriya Water Gardens',
        destination_id: destId,
        rating: 4.8,
        image: '/stitch_images/discover.png',
        caption:
          'Unforgettable experience exploring the water gardens and frescoes. Make sure to hire a SLTDA certified guide for rich historical context.',
        tags: ['Heritage', 'SustainableTravel'],
        likes_count: 42,
        comments_count: 5,
        comments: [],
        ecoPoints: 80,
        commentsCount: 5,
        saves_count: 8,
      },
    ],
    trust_metrics: {
      overall_trust_score: 95.0,
      geo_consistency_score: 98.5,
      image_authenticity_score: 96.0,
      verification_badge: 'SLTDA Official Verified',
      spam_risk_score: 0.02,
      flags: [],
      summary_notes:
        'Passes all AI verification checks. GPS EXIF coordinates match Matale boundary with 98.5% confidence.',
    },
    hotels: [
      {
        id: 201,
        name: 'Sigiriya Heritage Eco Lodge',
        category: 'hotel',
        rating: 4.92,
        price_range: '$$$',
        contact: '+94 66 224 8899',
        image: '/stitch_images/planner.png',
        verified: true,
        location_note: '0.8 km from Sigiriya Citadel',
      },
      {
        id: 202,
        name: 'Matale Organic Farm & Homestay',
        category: 'hotel',
        rating: 4.85,
        price_range: '$$',
        contact: '+94 77 112 4455',
        image: '/stitch_images/discover.png',
        verified: true,
        location_note: '2.4 km from Sigiriya Citadel',
      },
    ],
    vehicles: [
      {
        id: 301,
        name: 'Sigiriya Eco-Tuk Drivers Collective',
        category: 'vehicle',
        rating: 4.9,
        price_range: '$',
        contact: '+94 77 998 1122',
        image: '/stitch_images/map.png',
        verified: true,
        location_note: 'On-demand dispatch at site entrance',
      },
      {
        id: 302,
        name: 'LankaLens Certified Safari & Van Express',
        category: 'vehicle',
        rating: 4.88,
        price_range: '$$',
        contact: '+94 71 445 6677',
        image: '/stitch_images/planner.png',
        verified: true,
        location_note: 'Inter-district transfer available',
      },
    ],
    guides: [
      {
        id: 401,
        name: 'Dinuka Silva (SLTDA License #4489)',
        category: 'guide',
        rating: 4.98,
        price_range: '$$',
        contact: '+94 77 334 5566',
        image: '/stitch_images/discover.png',
        verified: true,
        location_note: 'Specializes in Heritage & Flora History',
      },
      {
        id: 402,
        name: 'Chaminda Perera (SLTDA License #3120)',
        category: 'guide',
        rating: 4.92,
        price_range: '$$',
        contact: '+94 76 889 0011',
        image: '/stitch_images/planner.png',
        verified: true,
        location_note: 'Specializes in Trekking & Birdwatching',
      },
    ],
    nearby_alternatives: [
      {
        id: 2,
        name: 'Ella Nine Arch Bridge & Demodara',
        title: 'Ella Nine Arch Bridge & Demodara',
        category: 'nature',
        district: 'Badulla',
        province: 'Uva',
        latitude: 6.8768,
        longitude: 81.0608,
        description: 'Iconic colonial viaduct tucked into dense tea hills.',
        desc: 'Iconic colonial viaduct tucked into dense tea hills.',
        activities: ['Photography', 'Hiking'],
        estimated_visit_duration_minutes: 120,
        baseline_cost: 0,
        popularity: 95,
        rating: 4.9,
        reviews: 512,
        trust_score: 0.92,
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
    ],
    crowd_status: {
      density: 'High',
      peak_hours: '08:00 - 11:00',
      peak_months: ['Dec', 'Jan', 'Aug'],
    },
    budget_breakdown: {
      entry_fee: 30.0,
      avg_meal_cost: 12.0,
      local_transport_cost: 15.0,
      guide_fee_optional: 25.0,
      total_estimated_day_budget: 82.0,
    },
    query_time_ms: 0.45,
  };

  const payload = detailsData || fallbackData;
  const dest = payload.destination;
  const imagesList =
    dest.images && dest.images.length > 0 ? dest.images : [dest.image || dest.image_url];
  const activeImage = imagesList[activeImageIdx] || imagesList[0];

  const marketplaceServices =
    activeMarketplaceTab === 'hotels'
      ? payload.hotels
      : activeMarketplaceTab === 'vehicles'
        ? payload.vehicles
        : payload.guides;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-50 flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1 py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-label-sm text-outline">
          <Link
            href="/map"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Destinations Map</span>
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">{dest.title || dest.name}</span>
        </div>

        {/* Hero Gallery & Header Info Block */}
        <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-sm border border-line-200 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Photo & Thumbnail Gallery */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg bg-ink-950">
                <Image
                  src={activeImage}
                  alt={dest.title || dest.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Verification Badge Pill */}
                {dest.is_verified && (
                  <div className="absolute top-4 left-4 bg-success-600 text-white px-3 py-1 rounded-full text-label-xs font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>SLTDA Official Verified</span>
                  </div>
                )}
                {/* Trust Score Badge Pill */}
                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-label-xs font-bold text-primary flex items-center gap-1 shadow-md border border-line-200">
                  <span className="material-symbols-outlined text-[14px]">security</span>
                  <span>{Math.round((dest.trust_score || 0.95) * 100)}% AI Trust Score</span>
                </div>
              </div>

              {/* Thumbnails */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImageIdx === idx
                          ? 'border-primary ring-2 ring-primary/20 scale-105'
                          : 'border-line-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title, Category & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-xs font-bold uppercase tracking-wider">
                    {dest.category}
                  </span>
                  <span className="text-label-sm text-outline font-semibold">
                    {dest.district}, {dest.province} Province
                  </span>
                </div>
                <h1 className="font-heading-xl text-on-surface leading-tight">
                  {dest.title || dest.name}
                </h1>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {dest.description || dest.desc}
                </p>
              </div>

              {/* Activities Badges */}
              {dest.activities && dest.activities.length > 0 && (
                <div>
                  <span className="text-label-xs text-outline font-semibold block mb-2">
                    Experiences & Activities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dest.activities.map((act) => (
                      <span
                        key={act}
                        className="px-3 py-1 bg-canvas-50 text-on-surface text-label-xs rounded-lg border border-line-200 font-medium"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-line-200">
                <Link
                  href="/planner"
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-heading-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>Add to Daily Itinerary</span>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`w-full py-2.5 rounded-xl text-label-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
                      isSaved
                        ? 'bg-signal-amber-500/10 text-signal-amber-500 border-signal-amber-500/30'
                        : 'bg-canvas-50 hover:bg-surface-container text-on-surface border-line-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSaved ? 'bookmark' : 'bookmark_border'}
                    </span>
                    <span>{isSaved ? 'Saved in Trip' : 'Save Watchlist'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full py-2.5 bg-canvas-50 hover:bg-surface-container text-on-surface rounded-xl text-label-sm font-semibold transition-all flex items-center justify-center gap-2 border border-line-200"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span>{copiedShare ? 'Link Copied!' : 'Share Page'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-line-200">
            <div className="bg-canvas-50 p-4 rounded-xl border border-line-200">
              <span className="text-label-xs text-outline block">Visitor Rating</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-signal-amber-500 text-[20px]">
                  star
                </span>
                <strong className="text-heading-sm font-bold text-on-surface">{dest.rating}</strong>
                <span className="text-label-xs text-outline">({dest.reviews} reviews)</span>
              </div>
            </div>

            <div className="bg-canvas-50 p-4 rounded-xl border border-line-200">
              <span className="text-label-xs text-outline block">Est. Day Budget</span>
              <div className="mt-1">
                <strong className="text-heading-sm font-bold text-on-surface">
                  ${payload.budget_breakdown?.total_estimated_day_budget || 52}
                </strong>
                <span className="text-label-xs text-outline block">
                  Entry: ${dest.baseline_cost || 0}
                </span>
              </div>
            </div>

            <div className="bg-canvas-50 p-4 rounded-xl border border-line-200">
              <span className="text-label-xs text-outline block">Visit Duration</span>
              <strong className="text-heading-sm font-bold text-on-surface block mt-1">
                {dest.estimated_visit_duration_minutes || 180} mins
              </strong>
            </div>

            <div className="bg-canvas-50 p-4 rounded-xl border border-line-200">
              <span className="text-label-xs text-outline block">Distance & Elevation</span>
              <strong className="text-heading-sm font-bold text-on-surface block mt-1">
                {dest.distance || dest.distance_from_colombo || '165 km'}
              </strong>
              <span className="text-label-xs text-outline block">
                Elevation: {dest.elevation || '349 m'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Crowd, AI Trust, Community Feed, Marketplace */}
          <div className="lg:col-span-8 space-y-8">
            {/* Live Crowd Status Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
                  <h3 className="font-heading-md text-on-surface">
                    Live Crowd Status & Peak Periods
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-label-xs font-bold flex items-center gap-1.5 ${
                    payload.crowd_status.density === 'High'
                      ? 'bg-signal-amber-500/10 text-signal-amber-500 border border-signal-amber-500/30'
                      : payload.crowd_status.density === 'Moderate'
                        ? 'bg-sky-400/10 text-sky-400 border border-sky-400/30'
                        : 'bg-success-600/10 text-success-600 border border-success-600/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>{payload.crowd_status.density} Visitor Density</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-canvas-50 p-4 rounded-xl border border-line-200">
                  <span className="text-label-xs text-outline block font-semibold">
                    Typical Peak Visitor Hours
                  </span>
                  <strong className="text-body-md font-bold text-on-surface mt-1 block">
                    {payload.crowd_status.peak_hours || '10:00 - 14:00'}
                  </strong>
                  <p className="text-label-xs text-outline mt-1">
                    Recommended: Arrive before 08:30 AM or after 15:30 PM for quiet visits.
                  </p>
                </div>

                <div className="bg-canvas-50 p-4 rounded-xl border border-line-200">
                  <span className="text-label-xs text-outline block font-semibold">
                    Peak Travel Months
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(payload.crowd_status.peak_months || ['Dec', 'Jan', 'Aug']).map((month) => (
                      <span
                        key={month}
                        className="px-2.5 py-0.5 bg-primary/10 text-primary text-label-xs rounded font-bold"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                  <p className="text-label-xs text-outline mt-1">
                    High seasonal demand during major holiday periods.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Trust & Verification Breakdown Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-4">
              <div className="flex items-center justify-between border-b border-line-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    verified_user
                  </span>
                  <div>
                    <h3 className="font-heading-md text-on-surface">
                      AI Trust & Verification Audit
                    </h3>
                    <p className="text-label-xs text-outline">
                      Automated multi-factor authenticity scoring for tourist safety
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-heading-lg font-bold text-primary">
                    {payload.trust_metrics.overall_trust_score}%
                  </span>
                  <span className="text-label-xs text-outline block">Overall Trust</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-canvas-50 p-3.5 rounded-xl border border-line-200">
                  <span className="text-label-xs text-outline block">
                    Geographic EXIF Consistency
                  </span>
                  <strong className="text-body-md font-bold text-on-surface">
                    {payload.trust_metrics.geo_consistency_score}%
                  </strong>
                  <div className="w-full bg-line-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-success-600 h-full rounded-full"
                      style={{ width: `${payload.trust_metrics.geo_consistency_score}%` }}
                    />
                  </div>
                </div>

                <div className="bg-canvas-50 p-3.5 rounded-xl border border-line-200">
                  <span className="text-label-xs text-outline block">Image Authenticity</span>
                  <strong className="text-body-md font-bold text-on-surface">
                    {payload.trust_metrics.image_authenticity_score}%
                  </strong>
                  <div className="w-full bg-line-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${payload.trust_metrics.image_authenticity_score}%` }}
                    />
                  </div>
                </div>

                <div className="bg-canvas-50 p-3.5 rounded-xl border border-line-200">
                  <span className="text-label-xs text-outline block">Spam & Duplicate Risk</span>
                  <strong className="text-body-md font-bold text-success-600">
                    Low Risk ({(payload.trust_metrics.spam_risk_score * 100).toFixed(1)}%)
                  </strong>
                  <div className="w-full bg-line-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-success-600 h-full rounded-full" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-canvas-50 rounded-xl border border-line-200 text-body-xs text-on-surface-variant leading-relaxed">
                ℹ️ <strong>Audit Note:</strong> {payload.trust_metrics.summary_notes}
              </div>
            </div>

            {/* Integrated Community Contributions Feed */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-label-xs text-primary uppercase font-bold tracking-wider">
                    Crowdsourced Intelligence
                  </span>
                  <h3 className="font-heading-md text-on-surface mt-0.5">
                    Community Contributions for {dest.name}
                  </h3>
                </div>
                <Link
                  href="/contribution"
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-label-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
                  <span>Contribute Photo</span>
                </Link>
              </div>

              <div className="space-y-4">
                {payload.community_posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-canvas-50 rounded-xl border border-line-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-line-200">
                          <Image
                            src={post.avatar}
                            alt={post.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-body-sm text-on-surface">
                              {post.author}
                            </span>
                            {post.verified && (
                              <span className="material-symbols-outlined text-success-600 text-[14px]">
                                verified
                              </span>
                            )}
                          </div>
                          <span className="text-label-xs text-outline">
                            {post.role} · {post.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-label-xs font-bold text-signal-amber-500 bg-surface px-2.5 py-1 rounded-full border border-line-200">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>{post.rating}</span>
                      </div>
                    </div>

                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                      {post.caption}
                    </p>

                    {post.image && (
                      <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-sm bg-ink-950">
                        <Image
                          src={post.image}
                          alt="Community Photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-label-xs text-outline">
                      <div className="flex items-center gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-surface text-primary rounded border border-line-200 font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span>❤️ {post.likes_count} Likes</span>
                        <span>💬 {post.comments_count} Comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketplace Services Tabs (Hotels, Vehicles, Certified Guides) */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-200 pb-4">
                <div>
                  <span className="text-label-xs text-primary uppercase font-bold tracking-wider">
                    Ecosystem Directory
                  </span>
                  <h3 className="font-heading-md text-on-surface mt-0.5">
                    Nearby Verified Marketplace Services
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-canvas-50 p-1 rounded-xl border border-line-200">
                  <button
                    onClick={() => setActiveMarketplaceTab('hotels')}
                    className={`px-3 py-1.5 rounded-lg text-label-xs font-semibold transition-all ${
                      activeMarketplaceTab === 'hotels'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    Hotels & Lodges
                  </button>
                  <button
                    onClick={() => setActiveMarketplaceTab('vehicles')}
                    className={`px-3 py-1.5 rounded-lg text-label-xs font-semibold transition-all ${
                      activeMarketplaceTab === 'vehicles'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    Transport Co-ops
                  </button>
                  <button
                    onClick={() => setActiveMarketplaceTab('guides')}
                    className={`px-3 py-1.5 rounded-lg text-label-xs font-semibold transition-all ${
                      activeMarketplaceTab === 'guides'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    Certified Guides
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {marketplaceServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 bg-canvas-50 rounded-xl border border-line-200 flex gap-4 items-center"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-ink-950 flex-shrink-0">
                      <Image src={service.image} alt={service.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-body-sm text-on-surface truncate">
                          {service.name}
                        </h4>
                        <span className="text-label-xs font-bold text-signal-amber-500 flex items-center gap-0.5">
                          ★ {service.rating}
                        </span>
                      </div>
                      <p className="text-label-xs text-outline">
                        {service.location_note} · {service.price_range}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-label-xs">
                        <span className="text-primary font-semibold">📞 {service.contact}</span>
                        {service.verified && (
                          <span className="text-success-600 font-bold">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Budget Estimator, Map preview, Recommended Alternatives */}
          <div className="lg:col-span-4 space-y-8">
            {/* Itemized Budget Breakdown Card */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-line-200 pb-3">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                <h3 className="font-heading-md text-on-surface">Itemized Day Budget</h3>
              </div>

              <div className="space-y-3 text-body-sm">
                <div className="flex items-center justify-between py-1 border-b border-line-200">
                  <span className="text-on-surface-variant">Official Entry / Ticket Fee</span>
                  <span className="font-bold text-on-surface">
                    ${payload.budget_breakdown.entry_fee}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-line-200">
                  <span className="text-on-surface-variant">Est. Local Dining & Water</span>
                  <span className="font-bold text-on-surface">
                    ${payload.budget_breakdown.avg_meal_cost}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-line-200">
                  <span className="text-on-surface-variant">Local Tuk-Tuk / Bus Transport</span>
                  <span className="font-bold text-on-surface">
                    ${payload.budget_breakdown.local_transport_cost}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-line-200">
                  <span className="text-on-surface-variant">SLTDA Certified Guide (Optional)</span>
                  <span className="font-bold text-on-surface">
                    ${payload.budget_breakdown.guide_fee_optional}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 text-heading-sm">
                  <strong className="text-on-surface font-bold">Total Estimated Budget</strong>
                  <strong className="text-primary font-bold">
                    ${payload.budget_breakdown.total_estimated_day_budget}
                  </strong>
                </div>
              </div>
            </div>

            {/* Embedded Location Map Preview */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    pin_drop
                  </span>
                  <span>Location Coordinates</span>
                </h3>
                <Link href="/map" className="text-label-xs text-primary font-bold hover:underline">
                  Open Full Map
                </Link>
              </div>

              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#0B1210] flex items-center justify-center border border-line-200">
                <svg
                  className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 0 50 Q 150 20 300 100 T 600 50"
                    fill="none"
                    stroke="#8FD3D6"
                    strokeWidth="1"
                  />
                </svg>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary font-bold shadow-xl ring-4 ring-white/20">
                  <span className="material-symbols-outlined text-[20px]">temple_buddhist</span>
                </div>
                <div className="absolute bottom-2 left-2 bg-ink-950/90 backdrop-blur-md px-2.5 py-1 rounded text-label-xs text-white">
                  GPS: {dest.latitude}°N, {dest.longitude}°E
                </div>
              </div>
            </div>

            {/* Recommended Nearby Alternatives */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-line-200 space-y-4">
              <h3 className="font-heading-md text-on-surface flex items-center justify-between">
                <span>Nearby Alternatives</span>
                <span className="text-label-xs text-outline font-normal">Similar Category</span>
              </h3>

              <div className="space-y-3">
                {payload.nearby_alternatives.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/destinations/${alt.id}`}
                    className="p-3 bg-canvas-50 hover:bg-surface-container rounded-xl border border-line-200 transition-colors flex items-center gap-3 block"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-ink-950 flex-shrink-0">
                      <Image
                        src={alt.image || alt.image_url || '/stitch_images/planner.png'}
                        alt={alt.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-body-sm text-on-surface truncate">
                        {alt.title || alt.name}
                      </h4>
                      <span className="text-label-xs text-outline block">
                        {alt.category} · {alt.district}
                      </span>
                      <span className="text-label-xs font-bold text-signal-amber-500">
                        ★ {alt.rating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
