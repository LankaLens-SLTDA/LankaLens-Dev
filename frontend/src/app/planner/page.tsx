'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  calculateTripBudget,
  getBudgetRecommendations,
  BudgetCalculationResponse,
  Destination,
} from '@/lib/api';

export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [days, setDays] = useState([
    { id: 1, title: 'Colombo Arrival & Coastal Heritage', stopsCount: 3, duration: '4.5 hrs' },
    { id: 2, title: 'Sigiriya Rock Fortress & Dambulla', stopsCount: 4, duration: '6.0 hrs' },
    { id: 3, title: 'Kandy Temple of Tooth & Tea Gardens', stopsCount: 3, duration: '5.0 hrs' },
    { id: 4, title: 'Nuwara Eliya High Peaks Train', stopsCount: 2, duration: '3.5 hrs' },
    { id: 5, title: 'Ella Nine Arch Bridge & Ravana Falls', stopsCount: 4, duration: '6.5 hrs' },
  ]);

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
        // Fallback calculation if backend is unreachable
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
            { category: 'Accommodation', amount: acc, percentage: 37.5, color: '#0F5C56', description: 'Mid-range stay' },
            { category: 'Transport', amount: trans, percentage: 28.7, color: '#8FD3D6', description: 'Private Car' },
            { category: 'Food & Dining', amount: food, percentage: 15.4, color: '#5E2E19', description: 'Mid-tier dining' },
            { category: 'Activities & Experiences', amount: act, percentage: 11.0, color: '#E08A2C', description: 'Cultural sites' },
            { category: 'Miscellaneous & Emergency', amount: Math.round(misc), percentage: 7.4, color: '#6C757D', description: 'Emergency buffer' },
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
  }, [travellersCount, durationDays, accommodationStyle, transportMode, foodPreference, activityLevel]);

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

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1">
        <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-12 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-label-sm uppercase tracking-widest text-primary font-semibold">
                  EPIC 14 — Smart Budget Planner
                </span>
                <span className="text-line-200">/</span>
                <span className="text-label-sm text-on-surface-variant">Ceylon Odyssey</span>
              </div>
              <h1 className="font-display-lg text-on-surface">Curate Your Journey & Estimate Costs</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-canvas-50 text-on-surface hover:bg-surface-container rounded-lg text-body-sm font-medium transition-colors flex items-center gap-2 border border-line-200">
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
              {/* Travelers */}
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

              {/* Duration */}
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
                  <option value={14}>14 Days Complete Island</option>
                </select>
              </div>

              {/* Accommodation */}
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

              {/* Transport Mode */}
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

              {/* Food Preference */}
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

              {/* Activity Tier */}
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
            {/* Timeline Sidebar (Col Span 3) */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 px-1 font-semibold">
                Daily Timeline
              </div>
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group border ${
                    activeDay === day.id
                      ? 'bg-primary-container text-on-primary border-primary font-semibold shadow-sm'
                      : 'bg-canvas-50 hover:bg-surface-container text-on-surface border-line-200'
                  }`}
                >
                  <div>
                    <div
                      className={`text-label-sm uppercase ${activeDay === day.id ? 'opacity-80' : 'text-outline'}`}
                    >
                      Day 0{day.id}
                    </div>
                    <div className="font-heading-sm mt-0.5">{day.title}</div>
                  </div>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              ))}
              <button
                onClick={() =>
                  setDays((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      title: `Day ${prev.length + 1} Scenic Route`,
                      stopsCount: 2,
                      duration: '4.0 hrs',
                    },
                  ])
                }
                className="w-full py-3 px-4 border border-dashed border-outline-variant hover:border-primary text-primary rounded-xl text-body-sm font-semibold flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Day 0{days.length + 1}</span>
              </button>
            </div>

            {/* Schedule Items Column (Col Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-heading-md text-on-surface">
                    Day {activeDay}: {days.find((d) => d.id === activeDay)?.title}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    3 activities scheduled • {days.find((d) => d.id === activeDay)?.duration} total
                    travel
                  </p>
                </div>
                <button className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add activity</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Activity Item 1 */}
                <div className="p-4 bg-canvas-50 rounded-xl relative group transition-all hover:shadow-sm border border-line-200">
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab text-outline hover:text-on-surface pt-1">
                      <span className="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div className="w-16 h-16 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                      <Image
                        src="/stitch_images/discover.png"
                        alt="Activity thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm text-primary font-bold">
                          09:00 AM • 2 hrs
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-outline hover:text-on-surface rounded">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-1 text-outline hover:text-coral-500 rounded">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading-sm text-on-surface truncate mt-0.5">
                        Heritage Walk & Monument Inspection
                      </h3>
                      <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                        Stroll through colonial corridors & archaeological landmarks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-8 py-1 text-body-sm text-outline">
                  <div className="h-4 w-px bg-line-200 ml-2" />
                  <span className="material-symbols-outlined text-[16px]">directions_car</span>
                  <span>Auto-suggest: 35 min drive via Central Highway (18.4 km)</span>
                </div>

                {/* Activity Item 2 */}
                <div className="p-4 bg-canvas-50 rounded-xl relative group transition-all hover:shadow-sm border border-line-200">
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab text-outline hover:text-on-surface pt-1">
                      <span className="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div className="w-16 h-16 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                      <Image
                        src="/stitch_images/planner.png"
                        alt="Activity thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm text-primary font-bold">
                          01:30 PM • 3 hrs
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-outline hover:text-on-surface rounded">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-1 text-outline hover:text-coral-500 rounded">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading-sm text-on-surface truncate mt-0.5">
                        Spice Tasting & Local Market Trail
                      </h3>
                      <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                        Immersive aromatic walk through historical trading alleys.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget & Analytics Sidebar (Col Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Itemized Budget Card */}
              <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading-md text-on-surface">Calculated Budget</h3>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      ${budgetResponse?.per_person_budget || 0} / person • ${budgetResponse?.per_day_budget || 0} / day
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

                {/* 5-Category Itemized Breakdown List */}
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
                      <p className="text-label-sm text-outline pl-4 line-clamp-1">{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Budget-Fitted Destinations */}
              {recommendedDestinations.length > 0 && (
                <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading-sm text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                      <span>Budget-Fitted Places</span>
                    </h4>
                    <span className="text-label-sm text-primary font-semibold">
                      Matches Spend Limit
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recommendedDestinations.slice(0, 3).map((dest) => (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.id}`}
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
                            <div className="font-heading-sm text-on-surface text-body-sm group-hover:text-primary transition-colors">
                              {dest.name}
                            </div>
                            <div className="text-label-sm text-on-surface-variant">
                              {dest.district} • Rating {dest.rating}★
                            </div>
                          </div>
                        </div>
                        <span className="text-label-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ${dest.baseline_cost} Entry
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sri Lanka Travel Savings Tips */}
              <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-md flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sky-300 font-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">savings</span>
                  <span>Sri Lanka Travel Savings Tips</span>
                </div>
                <ul className="text-body-sm text-on-primary-container space-y-2 list-disc pl-4 leading-relaxed">
                  {budgetResponse?.savings_tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  )) || (
                    <>
                      <li>Book Sri Lanka Railways Observation Car 30 days in advance.</li>
                      <li>Hire SLTDA-certified local guides directly at site entrances.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
