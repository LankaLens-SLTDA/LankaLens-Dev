'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  getAnalyticsDashboard,
  getAnalyticsEvents,
  AnalyticsDashboardMetrics,
  AnalyticsEventRecord,
} from '@/lib/api';

export default function AnalyticsDashboardPage() {
  const [metrics, setMetrics] = useState<AnalyticsDashboardMetrics | null>(null);
  const [events, setEvents] = useState<AnalyticsEventRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFunnelIndex, setSelectedFunnelIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    async function loadAnalyticsData() {
      setIsLoading(true);
      const data = await getAnalyticsDashboard();
      const eventList = await getAnalyticsEvents(selectedCategory, 50);

      if (data) {
        setMetrics(data);
      } else {
        // Fallback demo state if backend server is unreachable
        setMetrics({
          total_events: 1240,
          active_sessions: 184,
          alternative_acceptance_rate: 35.0,
          marketplace_conversion_rate: 14.8,
          sustainable_traffic_diversions: 42,
          category_breakdown: {
            discovery: 420,
            planning: 280,
            sustainability: 210,
            marketplace: 190,
            community: 140,
          },
          funnels: [
            {
              funnel_name: 'Sustainability & Crowd Redirection Funnel',
              overall_conversion_rate: 35.0,
              stages: [
                { stage_name: 'High-Crowd Warning Surfaced', count: 120, conversion_rate: 100.0 },
                {
                  stage_name: 'Alternative Destination Recommended',
                  count: 95,
                  conversion_rate: 79.2,
                },
                {
                  stage_name: 'Alternative Gem Accepted/Clicked',
                  count: 42,
                  conversion_rate: 44.2,
                },
              ],
            },
            {
              funnel_name: 'Local Partner Marketplace Funnel',
              overall_conversion_rate: 14.8,
              stages: [
                { stage_name: 'Partner Profile Viewed', count: 210, conversion_rate: 100.0 },
                { stage_name: 'Arrangement Broker Flow Entered', count: 84, conversion_rate: 40.0 },
                {
                  stage_name: 'Guide / Service Inquiry Referred',
                  count: 31,
                  conversion_rate: 36.9,
                },
              ],
            },
            {
              funnel_name: 'Discovery to Travel Plan Funnel',
              overall_conversion_rate: 19.4,
              stages: [
                { stage_name: 'Destination Discovery Search', count: 350, conversion_rate: 100.0 },
                { stage_name: 'Budget Calculator Engaged', count: 140, conversion_rate: 40.0 },
                { stage_name: 'Finalized Itinerary Created', count: 68, conversion_rate: 48.6 },
              ],
            },
          ],
          recent_events: [],
        });
      }

      if (eventList) {
        setEvents(eventList);
      }
      setIsLoading(false);
    }
    loadAnalyticsData();
  }, [selectedCategory, refreshKey]);

  const activeFunnel = metrics?.funnels[selectedFunnelIndex];

  return (
    <div className="min-h-screen bg-canvas-50 text-ink-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Active
              </span>
              <span className="px-3 py-1 bg-sky-100 text-sky-800 font-semibold text-xs rounded-full uppercase tracking-wider">
                Privacy-Preserving (Non-PII)
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-emerald-600">insights</span>
              Analytics & Intelligence Platform
            </h1>
            <p className="text-body-md text-ink-600 mt-1">
              Quantifying tourism discovery, crowd redirection efficacy, and local marketplace
              conversions.
            </p>
          </div>

          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="self-start md:self-auto px-4 py-2 bg-white border border-line-200 hover:bg-slate-50 text-ink-800 font-medium rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Dashboard
          </button>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Total Events */}
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-line-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink-500 uppercase tracking-wider">
                Telemetry Volume
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <span className="material-symbols-outlined">analytics</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-ink-950">
                {isLoading ? '...' : metrics?.total_events.toLocaleString()}
              </div>
              <p className="text-body-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                Real-time recorded actions
              </p>
            </div>
          </div>

          {/* Card 2: Active Explorer Sessions */}
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-line-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink-500 uppercase tracking-wider">
                Active Sessions
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-ink-950">
                {isLoading ? '...' : metrics?.active_sessions.toLocaleString()}
              </div>
              <p className="text-body-xs text-indigo-600 mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">devices</span>
                Unique anonymous travelers
              </p>
            </div>
          </div>

          {/* Card 3: Alternative Acceptance Rate */}
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-line-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink-500 uppercase tracking-wider">
                Alternative Acceptance
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined">eco</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-emerald-700">
                {isLoading ? '...' : `${metrics?.alternative_acceptance_rate}%`}
              </div>
              <p className="text-body-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">eco</span>
                {metrics?.sustainable_traffic_diversions} sustainable gems chosen
              </p>
            </div>
          </div>

          {/* Card 4: Marketplace Conversion */}
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-line-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink-500 uppercase tracking-wider">
                Marketplace Conversion
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined">storefront</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-amber-700">
                {isLoading ? '...' : `${metrics?.marketplace_conversion_rate}%`}
              </div>
              <p className="text-body-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">handshake</span>
                Guide & service inquiry leads
              </p>
            </div>
          </div>
        </div>

        {/* Funnel Visualizer Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-line-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-line-200">
            <div>
              <h2 className="text-xl font-bold text-ink-950 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">filter_alt</span>
                Multi-Stage Product Conversion Funnels
              </h2>
              <p className="text-body-sm text-ink-600">
                Measuring drop-off and conversion across critical user journeys.
              </p>
            </div>

            {/* Funnel Tab Selectors */}
            <div className="flex flex-wrap gap-2">
              {metrics?.funnels.map((funnel, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFunnelIndex(index)}
                  className={`px-3 py-1.5 rounded-lg text-body-xs font-semibold transition-all cursor-pointer ${
                    selectedFunnelIndex === index
                      ? 'bg-ink-950 text-white shadow'
                      : 'bg-slate-100 text-ink-700 hover:bg-slate-200'
                  }`}
                >
                  {funnel.funnel_name.split(' ')[0]} Funnel
                </button>
              ))}
            </div>
          </div>

          {activeFunnel && (
            <div>
              <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-body-xs font-bold text-ink-500 uppercase tracking-wider">
                    Selected Funnel
                  </span>
                  <h3 className="text-lg font-bold text-ink-950">{activeFunnel.funnel_name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-body-xs font-bold text-ink-500 uppercase tracking-wider">
                    End-to-End Conversion
                  </span>
                  <div className="text-2xl font-black text-emerald-600">
                    {activeFunnel.overall_conversion_rate}%
                  </div>
                </div>
              </div>

              {/* Stage Progress Bars */}
              <div className="space-y-4">
                {activeFunnel.stages.map((stage, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-semibold text-ink-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-ink-800 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {stage.stage_name}
                      </span>
                      <span className="font-bold text-ink-950">
                        {stage.count} events ({stage.conversion_rate}% stage yield)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-sky-500' : idx === 1 ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(stage.conversion_rate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown & Event Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Category Breakdown Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-line-200 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-950 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600">pie_chart</span>
                Event Category Distribution
              </h2>
              <p className="text-body-xs text-ink-500 mb-6">
                Volume of telemetry events by dimension.
              </p>

              <div className="space-y-4">
                {metrics?.category_breakdown &&
                  Object.entries(metrics.category_breakdown).map(([cat, count]) => {
                    const total = metrics.total_events || 1;
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-body-xs font-semibold capitalize">
                          <span className="text-ink-800">{cat}</span>
                          <span className="text-ink-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-line-200 text-body-xs text-ink-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-emerald-600">shield</span>
              100% PII-free privacy compliant tracking
            </div>
          </div>

          {/* Anonymized Telemetry Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-line-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">list_alt</span>
                  Recent Anonymized Telemetry Stream
                </h2>
                <p className="text-body-xs text-ink-500">
                  Live feed of user interactions across LankaLens.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'discovery', 'planning', 'sustainability', 'marketplace', 'community'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-ink-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Events Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-xs">
                <thead>
                  <tr className="border-b border-line-200 text-ink-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Event Name</th>
                    <th className="py-2.5 px-3">Session ID</th>
                    <th className="py-2.5 px-3">Device</th>
                    <th className="py-2.5 px-3">Payload Properties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-100">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-ink-400">
                        No telemetry events recorded for this category yet.
                      </td>
                    </tr>
                  ) : (
                    events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              evt.category === 'sustainability'
                                ? 'bg-emerald-100 text-emerald-800'
                                : evt.category === 'marketplace'
                                  ? 'bg-amber-100 text-amber-800'
                                  : evt.category === 'planning'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {evt.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-ink-900">{evt.event_name}</td>
                        <td className="py-3 px-3 text-ink-500 font-mono text-[11px]">
                          {evt.session_id}
                        </td>
                        <td className="py-3 px-3 capitalize text-ink-600">{evt.device_type}</td>
                        <td className="py-3 px-3">
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 text-[10px] block max-w-xs truncate">
                            {JSON.stringify(evt.properties)}
                          </code>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
