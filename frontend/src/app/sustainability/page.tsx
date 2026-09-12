'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function SustainabilityPage() {
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const densityData = [
    { hour: '06:00', density: 120 },
    { hour: '08:00', density: 450 },
    { hour: '10:00', density: 1100 },
    { hour: '12:00', density: 1420 },
    { hour: '14:00', density: 1250 },
    { hour: '16:00', density: 780 },
    { hour: '18:00', density: 310 },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1 bg-surface pb-24">
        {/* Banner Section */}
        <section className="w-full bg-primary text-on-primary py-12 px-6 lg:px-12 relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container text-label-sm uppercase tracking-wider font-bold">
                  Layer 5 Intelligence
                </span>
                <span className="text-sky-300 text-body-sm">• Live Environmental Guard</span>
              </div>
              <h1 className="font-display-lg text-white tracking-tight mb-3">
                Sustainability & Hazard Surveillance
              </h1>
              <p className="font-body-lg text-on-primary-container">
                Monitor crowd density thresholds, report trail and ecosystem anomalies, and discover
                regenerative alternative routes across Sri Lanka.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-signal-amber-500/20 flex items-center justify-center text-signal-amber-500">
                <span className="material-symbols-outlined text-[28px]">warning</span>
              </div>
              <div>
                <div className="text-body-sm text-sky-300 font-medium">Active System Alerts</div>
                <div className="font-heading-lg text-white text-[24px]">14 Reports Live</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Crowd Demand Matrix */}
            <div className="bg-canvas-50 rounded-2xl p-6 lg:p-8 border border-line-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-heading-md text-on-surface">
                    Regional Crowd Density & Hazard Levels
                  </h2>
                  <p className="text-body-sm text-on-surface-variant">
                    Real-time visitor density calculated from sensor nodes & ranger reports
                  </p>
                </div>
                <span className="text-body-sm text-primary font-bold">Updated 3m ago</span>
              </div>

              {/* Recharts Density Curve */}
              <div className="h-48 w-full mb-6 pt-2">
                <span className="text-label-sm text-outline block mb-2 font-semibold">
                  Hourly Visitor Load (Sigiriya Central Triangle)
                </span>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={densityData}>
                    <XAxis dataKey="hour" stroke="#6f7977" fontSize={12} />
                    <YAxis stroke="#6f7977" fontSize={12} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="density"
                      stroke="#0F5C56"
                      fill="#0F5C56"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-4 border border-line-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-heading-sm text-on-surface">Sigiriya Rock Fortress</span>
                    <span className="px-2 py-0.5 rounded bg-coral-500/10 text-coral-500 text-label-sm font-bold">
                      Over Capacity
                    </span>
                  </div>
                  <div className="w-full bg-canvas-50 h-2 rounded-full overflow-hidden mb-3">
                    <div className="bg-coral-500 h-full rounded-full w-[92%]" />
                  </div>
                  <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                    <span>Density: 1,420 /hr</span>
                    <Link href="/map" className="text-coral-500 font-semibold hover:underline">
                      View Alternative →
                    </Link>
                  </div>
                </div>

                <div className="bg-surface rounded-xl p-4 border border-line-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-heading-sm text-on-surface">Ella Rock Trail</span>
                    <span className="px-2 py-0.5 rounded bg-signal-amber-500/10 text-signal-amber-500 text-label-sm font-bold">
                      Near Capacity
                    </span>
                  </div>
                  <div className="w-full bg-canvas-50 h-2 rounded-full overflow-hidden mb-3">
                    <div className="bg-signal-amber-500 h-full rounded-full w-[78%]" />
                  </div>
                  <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
                    <span>Density: 850 /hr</span>
                    <Link
                      href="/map"
                      className="text-signal-amber-500 font-semibold hover:underline"
                    >
                      View Alternative →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Hazard Report Form */}
            <div className="bg-canvas-50 rounded-2xl p-6 lg:p-8 border border-line-200 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary">report_problem</span>
                  <h2 className="font-heading-md text-on-surface">Submit Field Hazard Report</h2>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Help protect ecosystems and fellow travelers. Reports are verified within 2 hours.
                </p>
              </div>

              {reportSubmitted ? (
                <div className="p-6 bg-primary/10 rounded-xl border border-primary text-center">
                  <span className="material-symbols-outlined text-primary text-[36px] mb-2">
                    check_circle
                  </span>
                  <h3 className="font-heading-sm text-primary">Report Submitted Successfully</h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Transmitted to LankaLens Ranger Network. Eco-credits credited to your profile!
                  </p>
                  <button
                    onClick={() => setReportSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-sm font-semibold"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReportSubmitted(true);
                  }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-label-sm text-on-surface font-semibold block mb-2">
                      Location / Landmark Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pidurangala Rock North Access Trail"
                      className="w-full bg-surface border border-line-200 rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-label-sm text-on-surface font-semibold block mb-2">
                      Hazard / Observation Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe erosion, fallen trees, or heavy overcrowding..."
                      className="w-full bg-surface border border-line-200 rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-heading-sm py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Transmit Report to Rangers
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols) */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-md">
              <span className="text-label-sm text-sky-300 font-bold uppercase tracking-wider block mb-2">
                Regenerative Recommendation
              </span>
              <h3 className="font-heading-md mb-2">Visit Pidurangala Instead of Sigiriya</h3>
              <p className="text-body-sm text-on-primary-container leading-relaxed">
                Sigiriya is currently experiencing a 92% visitor density. Climbing Pidurangala
                offers panoramic views of Sigiriya itself with 80% lower crowd congestion.
              </p>
              <Link
                href="/map"
                className="mt-4 inline-flex items-center gap-2 text-sky-300 font-semibold text-body-sm hover:underline"
              >
                <span>Navigate to Pidurangala</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
