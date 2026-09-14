'use client';

import Image from 'next/image';
import { TripPartnerMatchItem } from '@/lib/api';

interface PartnerCardProps {
  matchItem: TripPartnerMatchItem;
  onInquire: (matchItem: TripPartnerMatchItem) => void;
}

export default function PartnerCard({ matchItem, onInquire }: PartnerCardProps) {
  const { partner, match_score, matching_destinations, relevance_reason, estimated_cost_per_day } =
    matchItem;

  const typeLabels: Record<string, string> = {
    guide: 'Tour Guide',
    agency: 'Tour Agency',
    hotel: 'Hotel & Eco Lodge',
    vehicle: 'Vehicle Rental',
    transport: 'Transport Service',
  };

  const typeBadges: Record<string, string> = {
    guide: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    agency: 'bg-blue-50 text-blue-700 border-blue-200',
    hotel: 'bg-amber-50 text-amber-700 border-amber-200',
    vehicle: 'bg-purple-50 text-purple-700 border-purple-200',
    transport: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Header Image & Badges Overlay */}
      <div className="relative h-48 w-full bg-neutral-100">
        <Image
          src={partner.image_url || '/stitch_images/discover.png'}
          alt={partner.business_name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {partner.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              SLTDA Verified
            </span>
          )}
          {partner.is_featured && (
            <span className="rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {partner.featured_tier} Partner
            </span>
          )}
          {partner.hidden_gem_badge && (
            <span className="rounded-full bg-indigo-600/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              💎 Hidden-Gem Guide
            </span>
          )}
        </div>

        {/* Match Percentage Pill */}
        <div className="absolute right-3 top-3 rounded-full bg-teal-900/90 px-3 py-1 text-xs font-bold text-teal-200 backdrop-blur-sm">
          {match_score}% Match
        </div>

        {/* Category Label */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-medium backdrop-blur-md ${
              typeBadges[partner.partner_type] || 'bg-neutral-50 text-neutral-700'
            }`}
          >
            {typeLabels[partner.partner_type] || partner.partner_type}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{partner.business_name}</h3>
            <p className="text-xs text-neutral-500">
              {partner.name} • {partner.district}, {partner.province}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-teal-800">${estimated_cost_per_day}</div>
            <div className="text-[10px] text-neutral-400">per day baseline</div>
          </div>
        </div>

        {/* Contributor Reputation History Pill */}
        {partner.contributor_rank && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 border border-emerald-200/80">
            <span className="font-semibold">🏅 {partner.contributor_rank}</span>
            <span>{partner.contributor_eco_points || 750} Eco-Points</span>
          </div>
        )}

        {/* Relevance Explanation */}
        <div className="mt-3 rounded-xl bg-teal-50/60 p-3 text-xs text-teal-900 border border-teal-100">
          <span className="font-semibold text-teal-950">Trip Match: </span>
          {relevance_reason}
        </div>

        {/* Matching Destinations Tags */}
        {matching_destinations && matching_destinations.length > 0 && (
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Itinerary Destination Coverage
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matching_destinations.map((dest, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 font-medium"
                >
                  📍 {dest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Services Chips */}
        {partner.services && partner.services.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {partner.services.slice(0, 3).map((service, sIdx) => (
                <span
                  key={sIdx}
                  className="rounded bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-500 border border-neutral-100"
                >
                  ✓ {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rating & Contact Bar */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100 mt-4">
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-bold text-sm">★ {partner.rating}</span>
            <span className="text-xs text-neutral-400">
              ({partner.reviews_count > 0 ? partner.reviews_count : 'New'} reviews)
            </span>
          </div>

          <button
            onClick={() => onInquire(matchItem)}
            className="rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-700 active:scale-95 shadow-sm"
          >
            Arrange & Inquire
          </button>
        </div>
      </div>
    </div>
  );
}
