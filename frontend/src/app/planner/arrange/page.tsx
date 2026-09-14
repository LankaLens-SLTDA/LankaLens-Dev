'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import PartnerCard from '@/components/arrangements/PartnerCard';
import {
  matchTripArrangements,
  createReferralInquiry,
  ArrangementMode,
  TripPartnerMatchItem,
  TripArrangementResponse,
  ReferralInquiryRecord,
} from '@/lib/api';

export default function TripArrangeBrokerPage() {
  const [mode, setMode] = useState<ArrangementMode>('guided');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>('');
  const [arrangementsData, setArrangementsData] = useState<TripArrangementResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inquiry Modal State
  const [selectedMatch, setSelectedMatch] = useState<TripPartnerMatchItem | null>(null);
  const [customerName, setCustomerName] = useState<string>('Jane Doe');
  const [customerContact, setCustomerContact] = useState<string>('+94771234567');
  const [customerEmail, setCustomerEmail] = useState<string>('jane@example.com');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-05');
  const [groupSize, setGroupSize] = useState<number>(2);
  const [customNotes, setCustomNotes] = useState<string>(
    'Looking forward to a memorable Sri Lanka trip!'
  );

  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false);
  const [confirmedReferral, setConfirmedReferral] = useState<ReferralInquiryRecord | null>(null);

  // Fetch arrangement matches on mode/filter change
  useEffect(() => {
    let isSubscribed = true;

    async function loadArrangements() {
      setLoading(true);
      const res = await matchTripArrangements({
        trip_id: 1,
        mode,
        destination_ids: [1, 2, 4],
        starting_location: 'Colombo',
        partner_type_filter: partnerTypeFilter || undefined,
      });

      if (!isSubscribed) return;
      setArrangementsData(res);
      setLoading(false);
    }

    loadArrangements();
    return () => {
      isSubscribed = false;
    };
  }, [mode, partnerTypeFilter]);

  const handleInquireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    setSubmittingInquiry(true);
    const res = await createReferralInquiry({
      trip_id: 1,
      partner_id: selectedMatch.partner.id,
      arrangement_mode: mode,
      customer_name: customerName,
      customer_contact: customerContact,
      customer_email: customerEmail,
      start_date: startDate,
      end_date: endDate,
      group_size: groupSize,
      custom_notes: customNotes,
    });

    setSubmittingInquiry(false);
    if (res) {
      setConfirmedReferral(res);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 pb-20">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 pt-28 pb-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-teal-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300 border border-teal-700/50 mb-3">
              EPIC 20 • Trip Arrangement Broker
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Turn Your Itinerary into Verified Local Arrangements
            </h1>
            <p className="mt-3 text-base sm:text-lg text-teal-100/90 leading-relaxed">
              Connect directly with SLTDA-verified local guides, tour agencies, vehicle rentals,
              hotels, and transport services tailored to your trip destinations.
            </p>
          </div>
        </div>
      </section>

      {/* Main Controls & Listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Mode Selector Tabs Card */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-xl border border-neutral-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            {/* Guided vs Independent Mode Tabs */}
            <div className="flex w-full sm:w-auto rounded-xl bg-neutral-100 p-1.5">
              <button
                onClick={() => {
                  setMode('guided');
                  setPartnerTypeFilter('');
                }}
                className={`flex-1 sm:flex-initial rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                  mode === 'guided'
                    ? 'bg-teal-900 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                🧭 Guided Trip Path
              </button>
              <button
                onClick={() => {
                  setMode('independent');
                  setPartnerTypeFilter('');
                }}
                className={`flex-1 sm:flex-initial rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                  mode === 'independent'
                    ? 'bg-teal-900 text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                🚗 Independent Travel Path
              </button>
            </div>

            {/* Sub-type Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs font-semibold text-neutral-400 whitespace-nowrap">
                Filter:
              </span>
              <button
                onClick={() => setPartnerTypeFilter('')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  partnerTypeFilter === ''
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                All Types
              </button>
              {mode === 'guided' ? (
                <>
                  <button
                    onClick={() => setPartnerTypeFilter('guide')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      partnerTypeFilter === 'guide'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Tour Guides
                  </button>
                  <button
                    onClick={() => setPartnerTypeFilter('agency')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      partnerTypeFilter === 'agency'
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Tour Agencies
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setPartnerTypeFilter('hotel')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      partnerTypeFilter === 'hotel'
                        ? 'bg-amber-700 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Hotels & Lodges
                  </button>
                  <button
                    onClick={() => setPartnerTypeFilter('vehicle')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      partnerTypeFilter === 'vehicle'
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    Vehicle Rentals
                  </button>
                  <button
                    onClick={() => setPartnerTypeFilter('transport')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      partnerTypeFilter === 'transport'
                        ? 'bg-teal-700 text-white'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    Transport
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description & Stats Bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2">
            <div>
              {mode === 'guided' ? (
                <span>
                  <strong>Guided Trip:</strong> Matching certified local guides and licensed
                  agencies for all destinations in your trip itinerary.
                </span>
              ) : (
                <span>
                  <strong>Independent Travel:</strong> Matching verified vehicle fleets, driver
                  collectives, hotels, and transport services.
                </span>
              )}
            </div>
            {arrangementsData && (
              <div className="flex items-center gap-3 font-medium text-neutral-700">
                <span className="rounded bg-teal-50 px-2 py-1 text-teal-800 border border-teal-100">
                  {arrangementsData.total_matched} Matched Options
                </span>
                <span>
                  ({arrangementsData.guided_options_count} Guided /{' '}
                  {arrangementsData.independent_options_count} Independent available)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl bg-white p-8 text-neutral-400">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-teal-800 border-t-transparent mb-3" />
                <p className="text-sm font-medium">
                  Matching verified partners against trip destinations...
                </p>
              </div>
            </div>
          ) : arrangementsData && arrangementsData.matched_partners.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {arrangementsData.matched_partners.map((matchItem, idx) => (
                <PartnerCard
                  key={idx}
                  matchItem={matchItem}
                  onInquire={(item) => {
                    setSelectedMatch(item);
                    setConfirmedReferral(null);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              <p className="text-base font-semibold text-neutral-700">
                No arrangement options found for this filter.
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Try adjusting your mode or partner type sub-filter above.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-900 to-emerald-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-teal-800/80 px-2.5 py-0.5 text-xs font-semibold text-teal-200">
                    Arrangement Inquiry
                  </span>
                  <h3 className="mt-1 text-xl font-bold">{selectedMatch.partner.business_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {confirmedReferral ? (
                /* Referral Confirmation State */
                <div className="text-center py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold mb-3">
                    ✓
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">
                    Inquiry Submitted Successfully!
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500">
                    Your referral booking inquiry has been recorded and transmitted to the partner.
                  </p>

                  <div className="mt-5 rounded-2xl bg-teal-50/70 p-4 border border-teal-100 text-left space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-500">
                        Referral Tracking Code:
                      </span>
                      <span className="font-mono font-bold text-teal-900 bg-white px-2.5 py-1 rounded border border-teal-200 text-sm">
                        {confirmedReferral.referral_code}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-700">
                      <span>Status:</span>
                      <span className="font-semibold capitalize text-emerald-700">
                        {confirmedReferral.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-700">
                      <span>Partner:</span>
                      <span className="font-semibold">{confirmedReferral.partner_name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-700">
                      <span>Traveler:</span>
                      <span>{confirmedReferral.customer_name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-700">
                      <span>Estimated Baseline:</span>
                      <span className="font-bold text-teal-900">
                        ${confirmedReferral.estimated_cost}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="mt-6 w-full rounded-xl bg-teal-900 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-800 transition-all"
                  >
                    Done & Return to Broker
                  </button>
                </div>
              ) : (
                /* Inquiry Form State */
                <form onSubmit={handleInquireSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    <div>
                      <span className="text-neutral-400">Match Confidence:</span>
                      <div className="font-bold text-teal-800">
                        {selectedMatch.match_score}% Match
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Baseline Rate:</span>
                      <div className="font-bold text-neutral-800">
                        ${selectedMatch.estimated_cost_per_day}/day
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        required
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-2.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-2.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Group Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={groupSize}
                        onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                        className="w-full rounded-xl border border-neutral-300 px-2.5 py-2 text-xs focus:border-teal-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Special Requests / Custom Notes
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full rounded-xl bg-teal-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-teal-800 transition-all disabled:opacity-50 mt-2"
                  >
                    {submittingInquiry
                      ? 'Submitting Referral Inquiry...'
                      : 'Submit Inquiry & Get Tracking Code'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
