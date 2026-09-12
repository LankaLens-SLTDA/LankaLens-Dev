'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  calculateTripBudget,
  getBudgetRecommendations,
  getUserTrips,
  createTrip,
  removeDestinationFromTrip,
  addDestinationToTrip,
  exportTrip,
  BudgetCalculationResponse,
  Destination,
  TripRecord,
  TripExportResponse,
} from '@/lib/api';

export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [userTrips, setUserTrips] = useState<TripRecord[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);

  // New Trip Modal / Controls State
  const [showNewTripModal, setShowNewTripModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [exportData, setExportData] = useState<TripExportResponse | null>(null);

  const [newTripTitle, setNewTripTitle] = useState<string>('Ceylon Cultural & Wildlife Odyssey');
  const [newStartDate, setNewStartDate] = useState<string>('2026-10-01');
  const [newDurationDays, setNewDurationDays] = useState<number>(5);
  const [newGroupSize, setNewGroupSize] = useState<number>(2);
  const [newTotalBudget, setNewTotalBudget] = useState<number>(1200);
  const [newStartLocation, setNewStartLocation] = useState<string>('Colombo');

  // Add Stop Modal State
  const [showAddStopModal, setShowAddStopModal] = useState<boolean>(false);
  const [addStopDestId, setAddStopDestId] = useState<number>(1);
  const [addStopTime, setAddStopTime] = useState<string>('10:00 AM');
  const [addStopNotes, setAddStopNotes] = useState<string>('Visit early morning');

  // Interactive Budget Wizard State
  const [travellersCount, setTravellersCount] = useState<number>(2);
  const [durationDays, setDurationDays] = useState<number>(5);
  const [accommodationStyle, setAccommodationStyle] = useState<string>('mid_range');
  const [transportMode, setTransportMode] = useState<string>('private_car');
  const [foodPreference, setFoodPreference] = useState<string>('mid_tier_restaurants');
  const [activityLevel, setActivityLevel] = useState<string>('moderate_cultural');

  const [budgetResponse, setBudgetResponse] = useState<BudgetCalculationResponse | null>(null);
  const [recommendedDestinations, setRecommendedDestinations] = useState<Destination[]>([]);
  const [loadingBudget, setLoadingBudget] = useState<boolean>(false);

  // Load User Trips
  useEffect(() => {
    let isSubscribed = true;
    async function loadTrips() {
      const trips = await getUserTrips();
      if (isSubscribed && trips && trips.length > 0) {
        setUserTrips(trips);
        setSelectedTrip(trips[0]);
      }
    }
    loadTrips();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Fetch Budget Estimate
  useEffect(() => {
    let isSubscribed = true;

    async function loadBudget() {
      setLoadingBudget(true);
      const res = await calculateTripBudget({
        travellers_count: travellersCount,
        duration_days: durationDays,
        accommodation_style: accommodationStyle,
        transport_mode: transportMode,
        food_preference: foodPreference,
        activity_level: activityLevel,
      });

      if (!isSubscribed) return;

      if (res) {
        setBudgetResponse(res);
        const recRes = await getBudgetRecommendations({
          max_budget: res.total_budget,
          travellers_count: travellersCount,
          duration_days: durationDays,
        });
        if (isSubscribed && recRes?.recommended_destinations) {
          setRecommendedDestinations(recRes.recommended_destinations);
        }
      } else {
        const rooms = Math.ceil(travellersCount / 2);
        const acc = rooms * 85 * durationDays;
        const trans = 65 * durationDays;
        const food = 35 * durationDays * travellersCount;
        const act = 25 * durationDays * travellersCount;
        const subtotal = acc + trans + food + act;
        const misc = subtotal * 0.08;
        const total = subtotal + misc;

        setBudgetResponse({
          total_budget: Math.round(total),
          per_person_budget: Math.round(total / travellersCount),
          per_day_budget: Math.round(total / durationDays),
          currency: 'USD',
          breakdown: [
            {
              category: 'Accommodation',
              amount: acc,
              percentage: 37.5,
              color: '#0F5C56',
              description: 'Mid-range stay',
            },
            {
              category: 'Transport',
              amount: trans,
              percentage: 28.7,
              color: '#8FD3D6',
              description: 'Private Car',
            },
            {
              category: 'Food & Dining',
              amount: food,
              percentage: 15.4,
              color: '#5E2E19',
              description: 'Mid-tier dining',
            },
            {
              category: 'Activities & Experiences',
              amount: act,
              percentage: 11.0,
              color: '#E08A2C',
              description: 'Cultural sites',
            },
            {
              category: 'Miscellaneous & Emergency',
              amount: Math.round(misc),
              percentage: 7.4,
              color: '#6C757D',
              description: 'Emergency buffer',
            },
          ],
          travel_style_tier: 'Mid-Range Explorer',
          calculation_model: 'Fallback Estimator',
          savings_tips: [
            'Book Sri Lanka Railways Observation Car 30 days in advance.',
            'Hire SLTDA-certified local guides directly at site entrances.',
          ],
          query_time_ms: 0.5,
        });
      }
      setLoadingBudget(false);
    }

    loadBudget();

    return () => {
      isSubscribed = false;
    };
  }, [
    travellersCount,
    durationDays,
    accommodationStyle,
    transportMode,
    foodPreference,
    activityLevel,
  ]);

  // Handle Trip Creation
  const handleCreateTrip = async () => {
    const created = await createTrip({
      title: newTripTitle,
      start_date: newStartDate,
      duration_days: newDurationDays,
      group_size: newGroupSize,
      total_budget: newTotalBudget,
      starting_location: newStartLocation,
      destination_ids: [1, 2, 3, 4],
    });

    if (created) {
      setUserTrips((prev) => [created, ...prev]);
      setSelectedTrip(created);
      setShowNewTripModal(false);
    }
  };

  // Handle Removing Destination Stop
  const handleRemoveStop = async (destId: number) => {
    if (!selectedTrip) return;
    const updated = await removeDestinationFromTrip(selectedTrip.id, destId, activeDay);
    if (updated) {
      setSelectedTrip(updated);
      setUserTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  // Handle Adding Destination Stop
  const handleAddStop = async () => {
    if (!selectedTrip) return;
    const updated = await addDestinationToTrip(selectedTrip.id, {
      destination_id: addStopDestId,
      target_day: activeDay,
      scheduled_time: addStopTime,
      notes: addStopNotes,
    });
    if (updated) {
      setSelectedTrip(updated);
      setUserTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setShowAddStopModal(false);
    }
  };

  // Handle Export / Share Trip
  const handleShareTrip = async () => {
    if (!selectedTrip) return;
    const exp = await exportTrip(selectedTrip.id);
    if (exp) {
      setExportData(exp);
      setShowShareModal(true);
    }
  };

  const chartData = budgetResponse?.breakdown.map((b) => ({
    name: b.category.split(' ')[0],
    cost: b.amount,
    color: b.color,
  })) || [
    { name: 'Stay', cost: 425, color: '#0F5C56' },
    { name: 'Transport', cost: 325, color: '#8FD3D6' },
    { name: 'Dining', cost: 175, color: '#5E2E19' },
    { name: 'Activities', cost: 125, color: '#E08A2C' },
    { name: 'Misc', cost: 84, color: '#6C757D' },
  ];

  const currentDayObj =
    selectedTrip?.days.find((d) => d.day_number === activeDay) || selectedTrip?.days[0];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1">
        <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-12 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-label-sm uppercase tracking-widest text-primary font-semibold">
                  EPIC 15 — Trip Planner & Itinerary
                </span>
                <span className="text-line-200">/</span>
                <span className="text-label-sm text-on-surface-variant">
                  Multi-Day Route Builder
                </span>
              </div>
              <h1 className="font-display-lg text-on-surface">
                {selectedTrip ? selectedTrip.title : 'Curate Your Journey'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewTripModal(true)}
                className="px-4 py-2 bg-secondary text-on-secondary hover:bg-secondary-container rounded-lg text-body-sm font-semibold transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Create New Trip</span>
              </button>
              <button
                onClick={handleShareTrip}
                className="px-4 py-2 bg-canvas-50 text-on-surface hover:bg-surface-container rounded-lg text-body-sm font-medium transition-colors flex items-center gap-2 border border-line-200"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share Trip</span>
              </button>
              <Link
                href="/ai-assistant"
                className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-body-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                <span>AI Optimize Route</span>
              </Link>
            </div>
          </div>

          {/* Active Trip Selection Dropdown */}
          {userTrips.length > 0 && (
            <div className="flex items-center gap-4 bg-canvas-50 p-4 rounded-xl border border-line-200 mb-8">
              <span className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                Select Active Trip:
              </span>
              <select
                value={selectedTrip?.id || userTrips[0].id}
                onChange={(e) => {
                  const found = userTrips.find((t) => t.id === Number(e.target.value));
                  if (found) {
                    setSelectedTrip(found);
                    setActiveDay(1);
                  }
                }}
                className="bg-surface text-on-surface border border-line-200 rounded-lg p-2 text-body-sm font-semibold outline-none focus:ring-2 focus:ring-primary"
              >
                {userTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title} ({trip.duration_days} Days • ${trip.total_budget} Budget)
                  </option>
                ))}
              </select>

              {selectedTrip && (
                <div className="flex items-center gap-4 ml-auto text-body-sm">
                  <span className="text-on-surface-variant font-medium">
                    Total Drive:{' '}
                    <strong className="text-on-surface">
                      {selectedTrip.total_travel_distance_km} km
                    </strong>
                  </span>
                  <span className="text-on-surface-variant font-medium">
                    Per Person:{' '}
                    <strong className="text-on-surface">${selectedTrip.per_person_cost}</strong>
                  </span>
                  <span
                    className={`text-label-sm px-2.5 py-0.5 rounded font-bold border ${
                      selectedTrip.budget_fit_status === 'Under Budget'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedTrip.budget_fit_status}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Interactive Smart Budget Estimator Control Bar */}
          <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
                <h2 className="font-heading-md text-on-surface">Smart Budget Estimator Controls</h2>
              </div>
              {budgetResponse && (
                <span className="text-label-sm bg-primary-container text-on-primary px-3 py-1 rounded-full font-bold">
                  {budgetResponse.travel_style_tier}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1.5">
                  Travelers
                </label>
                <select
                  value={travellersCount}
                  onChange={(e) => setTravellersCount(Number(e.target.value))}
                  className="w-full bg-surface text-on-surface border border-line-200 rounded-lg p-2.5 text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={1}>1 Solo Traveler</option>
                  <option value={2}>2 Couple / Pair</option>
                  <option value={4}>4 Small Group</option>
                  <option value={6}>6 Family Co-op</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1.5">
                  Duration (Days)
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-surface text-on-surface border border-line-200 rounded-lg p-2.5 text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value={3}>3 Days Quick Weekend</option>
                  <option value={5}>5 Days Classic Route</option>
                  <option value={7}>7 Days Heritage Circuit</option>
                  <option value={10}>10 Days Ceylon Odyssey</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1.5">
                  Accommodation
                </label>
                <select
                  value={accommodationStyle}
                  onChange={(e) => setAccommodationStyle(e.target.value)}
                  className="w-full bg-surface text-on-surface border border-line-200 rounded-lg p-2.5 text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="homestay">Organic Homestay ($25/n)</option>
                  <option value="budget">Budget Guesthouse ($40/n)</option>
                  <option value="mid_range">Mid-Range Eco Lodge ($85/n)</option>
                  <option value="luxury">Luxury Heritage Hotel ($220/n)</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1.5">
                  Transport Mode
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full bg-surface text-on-surface border border-line-200 rounded-lg p-2.5 text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="public_train">Scenic Public Train ($8/d)</option>
                  <option value="express_bus">Express Intercity Bus ($12/d)</option>
                  <option value="tuk_tuk">Local Eco-Tuk Co-op ($25/d)</option>
                  <option value="private_car">Private Chauffeur Car ($65/d)</option>
                  <option value="flight">Domestic Air Taxi ($140/d)</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1.5">
                  Dining Style
                </label>
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  className="w-full bg-surface text-on-surface border border-line-200 rounded-lg p-2.5 text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="self_catering">Self Catering ($10/d)</option>
                  <option value="local_eateries">Local Rice & Curry ($18/d)</option>
                  <option value="mid_tier_restaurants">Mid-Tier Restaurants ($35/d)</option>
                  <option value="fine_dining">Fine Dining & Seafood ($80/d)</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1.5">
                  Activity Tier
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-surface text-on-surface border border-line-200 rounded-lg p-2.5 text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="budget_free">Budget Free Trails ($8/d)</option>
                  <option value="moderate_cultural">Moderate Cultural ($25/d)</option>
                  <option value="all_inclusive_safari">All-Inclusive Safari ($75/d)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Planner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Daily Timeline Sidebar */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 px-1 font-semibold">
                Daily Itinerary Timeline
              </div>

              {selectedTrip?.days.map((day) => (
                <button
                  key={day.day_number}
                  onClick={() => setActiveDay(day.day_number)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group border ${
                    activeDay === day.day_number
                      ? 'bg-primary-container text-on-primary border-primary font-semibold shadow-sm'
                      : 'bg-canvas-50 hover:bg-surface-container text-on-surface border-line-200'
                  }`}
                >
                  <div>
                    <div
                      className={`text-label-sm uppercase ${activeDay === day.day_number ? 'opacity-80' : 'text-outline'}`}
                    >
                      Day 0{day.day_number} • {day.date}
                    </div>
                    <div className="font-heading-sm mt-0.5 line-clamp-1">{day.title}</div>
                    <div className="text-label-sm text-outline mt-0.5">
                      {day.stops.length} stops • {day.estimated_travel_time} drive
                    </div>
                  </div>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              ))}
            </div>

            {/* Schedule Items Column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-heading-md text-on-surface">
                    {currentDayObj?.title || `Day ${activeDay} Schedule`}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    {currentDayObj?.stops.length || 0} activities scheduled •{' '}
                    {currentDayObj?.estimated_travel_time || '0 min'} drive (
                    {currentDayObj?.estimated_travel_distance_km || 0} km)
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStopModal(true)}
                  className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add Stop</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {currentDayObj?.stops.map((stop, sIdx) => (
                  <div key={stop.id || sIdx} className="flex flex-col gap-2">
                    <div className="p-4 bg-canvas-50 rounded-xl relative group transition-all hover:shadow-sm border border-line-200">
                      <div className="flex items-start gap-4">
                        <div className="cursor-grab text-outline hover:text-on-surface pt-1">
                          <span className="material-symbols-outlined">drag_indicator</span>
                        </div>
                        <div className="w-16 h-16 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                          <Image
                            src={stop.image || '/stitch_images/discover.png'}
                            alt={stop.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-label-sm text-primary font-bold">
                              {stop.scheduled_time} • {stop.estimated_duration}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleRemoveStop(stop.destination_id)}
                                className="p-1 text-outline hover:text-coral-500 rounded"
                                title="Remove stop"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                          <h3 className="font-heading-sm text-on-surface truncate mt-0.5">
                            {stop.name}
                          </h3>
                          <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                            {stop.notes || `${stop.district} • Entry Fee: $${stop.visit_cost}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {sIdx < currentDayObj.stops.length - 1 && (
                      <div className="flex items-center gap-3 px-8 py-1 text-body-sm text-outline">
                        <div className="h-4 w-px bg-line-200 ml-2" />
                        <span className="material-symbols-outlined text-[16px]">
                          directions_car
                        </span>
                        <span>Auto Drive Route: ~25 min scenic drive (14.2 km)</span>
                      </div>
                    )}
                  </div>
                ))}

                {(!currentDayObj?.stops || currentDayObj.stops.length === 0) && (
                  <div className="p-8 text-center bg-canvas-50 rounded-xl border border-dashed border-line-200">
                    <p className="text-body-sm text-on-surface-variant mb-2">
                      No destination stops scheduled for Day {activeDay} yet.
                    </p>
                    <button
                      onClick={() => setShowAddStopModal(true)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-semibold"
                    >
                      + Add First Stop
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Budget & Analytics Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Itemized Budget Card */}
              <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading-md text-on-surface">Calculated Budget</h3>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      ${budgetResponse?.per_person_budget || 0} / person • $
                      {budgetResponse?.per_day_budget || 0} / day
                    </p>
                  </div>
                  <span className="text-label-sm bg-surface-container px-3 py-1 rounded-full font-bold text-primary">
                    ${budgetResponse?.total_budget.toLocaleString() || '0'} Total
                  </span>
                </div>

                {loadingBudget ? (
                  <div className="h-48 flex items-center justify-center text-body-sm text-on-surface-variant">
                    Calculating budget allocations...
                  </div>
                ) : (
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#6f7977" fontSize={11} />
                        <YAxis stroke="#6f7977" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-line-200">
                  {budgetResponse?.breakdown.map((b, i) => (
                    <div key={i} className="flex flex-col gap-0.5 text-body-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: b.color }}
                          />
                          {b.category}
                        </span>
                        <strong className="text-on-surface font-semibold">
                          ${b.amount} ({b.percentage}%)
                        </strong>
                      </div>
                      <p className="text-label-sm text-outline pl-4 line-clamp-1">
                        {b.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Budget-Fitted Destinations */}
              {recommendedDestinations.length > 0 && (
                <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        explore
                      </span>
                      <span>Budget-Fitted Places</span>
                    </h4>
                    <span className="text-label-sm text-primary font-semibold">
                      Matches Spend Limit
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recommendedDestinations.slice(0, 3).map((dest) => (
                      <div
                        key={dest.id}
                        className="flex items-center justify-between p-2.5 bg-surface hover:bg-surface-container rounded-xl transition-all border border-line-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                            <Image
                              src={dest.image_url || '/stitch_images/discover.png'}
                              alt={dest.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-heading-sm text-on-surface text-body-sm">
                              {dest.name}
                            </div>
                            <div className="text-label-sm text-on-surface-variant">
                              {dest.district} • Rating {dest.rating}★
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setAddStopDestId(dest.id);
                            setShowAddStopModal(true);
                          }}
                          className="text-label-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Trip Creation Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-canvas-50 p-6 rounded-2xl max-w-md w-full border border-line-200 shadow-xl">
            <h3 className="font-heading-md text-on-surface mb-4">Create New Multi-Day Trip</h3>

            <div className="flex flex-col gap-3 mb-6">
              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newDurationDays}
                    onChange={(e) => setNewDurationDays(Number(e.target.value))}
                    className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Group Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newGroupSize}
                    onChange={(e) => setNewGroupSize(Number(e.target.value))}
                    className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Total Budget ($)
                  </label>
                  <input
                    type="number"
                    value={newTotalBudget}
                    onChange={(e) => setNewTotalBudget(Number(e.target.value))}
                    className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                  Starting Origin City
                </label>
                <input
                  type="text"
                  value={newStartLocation}
                  onChange={(e) => setNewStartLocation(e.target.value)}
                  className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  placeholder="e.g. Colombo, Kandy, Negombo"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewTripModal(false)}
                className="px-4 py-2 bg-surface text-on-surface hover:bg-surface-container rounded-lg text-body-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-semibold"
              >
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-canvas-50 p-6 rounded-2xl max-w-md w-full border border-line-200 shadow-xl">
            <h3 className="font-heading-md text-on-surface mb-4">Add Stop to Day {activeDay}</h3>

            <div className="flex flex-col gap-3 mb-6">
              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                  Select Destination
                </label>
                <select
                  value={addStopDestId}
                  onChange={(e) => setAddStopDestId(Number(e.target.value))}
                  className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                >
                  <option value={1}>Sigiriya Ancient Rock Fortress</option>
                  <option value={2}>Ella Nine Arch Bridge & Demodara</option>
                  <option value={3}>Galle Dutch Fort Ramparts</option>
                  <option value={4}>Dambulla Royal Cave Temple</option>
                  <option value={5}>Yala National Park Safari</option>
                  <option value={6}>Kandy Temple of Tooth</option>
                  <option value={7}>Horton Plains World&apos;s End</option>
                </select>
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={addStopTime}
                  onChange={(e) => setAddStopTime(e.target.value)}
                  className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  placeholder="09:00 AM"
                />
              </div>

              <div>
                <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                  Custom Notes
                </label>
                <input
                  type="text"
                  value={addStopNotes}
                  onChange={(e) => setAddStopNotes(e.target.value)}
                  className="w-full bg-surface border border-line-200 rounded-lg p-2 text-body-sm outline-none"
                  placeholder="e.g. Hire certified guide at entrance"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddStopModal(false)}
                className="px-4 py-2 bg-surface text-on-surface rounded-lg text-body-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStop}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-semibold"
              >
                Add Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / Export Modal */}
      {showShareModal && exportData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-canvas-50 p-6 rounded-2xl max-w-md w-full border border-line-200 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">share</span>
              <h3 className="font-heading-md text-on-surface">Share & Export Trip</h3>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Your trip payload has been exported. Copy your unique shareable token or link below:
            </p>

            <div className="bg-surface p-3 rounded-xl border border-line-200 font-mono text-xs text-on-surface break-all mb-4">
              {exportData.share_url}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportData.share_url);
                  alert('Share URL copied to clipboard!');
                }}
                className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-body-sm font-semibold"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
