'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import {
  getCrowdStatus,
  getCrowdAlternatives,
  getVisitorLoadCurve,
  submitHazardReport,
  getHazardReports,
  CrowdStatusInfo,
  AlternativeDestinationSuggestion,
  VisitorLoadCurveResponse,
  EnvironmentalReportRecord,
} from '@/lib/api';

const FEATURED_DESTINATIONS = [
  { id: 1, name: 'Sigiriya Rock Fortress' },
  { id: 2, name: 'Ella Rock Trail' },
  { id: 3, name: 'Galle Fort' },
  { id: 4, name: 'Yala National Park' },
  { id: 5, name: 'Nine Arch Bridge' },
  { id: 6, name: "Adam's Peak (Sri Pada)" },
];

export default function SustainabilityPage() {
  const [selectedDestId, setSelectedDestId] = useState<number>(1);
  const [crowdStatus, setCrowdStatus] = useState<CrowdStatusInfo | null>(null);
  const [visitorLoad, setVisitorLoad] = useState<VisitorLoadCurveResponse | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeDestinationSuggestion[]>([]);
  const [hazardReports, setHazardReports] = useState<EnvironmentalReportRecord[]>([]);

  // Hazard Report Form state
  const [reportLocation, setReportLocation] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCrowd, setLoadingCrowd] = useState(false);

  // Fetch Crowd status, load curves, and alternatives when selected destination changes
  useEffect(() => {
    async function loadDestinationSustainability() {
      setLoadingCrowd(true);
      const [statusRes, loadRes, altRes] = await Promise.all([
        getCrowdStatus(selectedDestId),
        getVisitorLoadCurve(selectedDestId),
        getCrowdAlternatives(selectedDestId),
      ]);

      if (statusRes) {
        setCrowdStatus(statusRes);
      } else {
        setCrowdStatus({
          destination_id: selectedDestId,
          destination_name:
            FEATURED_DESTINATIONS.find((d) => d.id === selectedDestId)?.name || 'Selected Landmark',
          crowd_score: selectedDestId === 1 ? 0.92 : 0.45,
          crowd_status: selectedDestId === 1 ? 'High' : 'Moderate',
          is_overcrowded: selectedDestId === 1,
          current_capacity_pct: selectedDestId === 1 ? 92 : 45,
          peak_hours: '10:00 - 14:00',
          warning_message:
            selectedDestId === 1
              ? 'High visitor density detected! High queue times expected.'
              : null,
        });
      }

      if (loadRes) {
        setVisitorLoad(loadRes);
      } else {
        setVisitorLoad({
          destination_id: selectedDestId,
          destination_name:
            FEATURED_DESTINATIONS.find((d) => d.id === selectedDestId)?.name || 'Selected Landmark',
          hourly_curve: [
            { hour: '06:00', density: 120 },
            { hour: '08:00', density: 450 },
            { hour: '10:00', density: 1100 },
            { hour: '12:00', density: 1420 },
            { hour: '14:00', density: 1250 },
            { hour: '16:00', density: 780 },
            { hour: '18:00', density: 310 },
          ],
          peak_hour: '12:00',
          recommended_offpeak_hours: ['06:00 - 08:00', '16:30 - 18:00'],
        });
      }

      if (altRes && altRes.length > 0) {
        setAlternatives(altRes);
      } else {
        setAlternatives([
          {
            destination_id: 101,
            name: 'Pidurangala Rock',
            category: 'Ancient Ruins & Viewpoint',
            district: 'Matale',
            crowd_status: 'Low',
            crowd_reduction_pct: 78,
            distance_km: 2.4,
            rating: 4.8,
            image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800',
            recommendation_reason: 'Panoramic view of Sigiriya with 78% lower crowd density.',
          },
        ]);
      }
      setLoadingCrowd(false);
    }

    loadDestinationSustainability();
  }, [selectedDestId]);

  // Fetch initial hazard reports
  useEffect(() => {
    async function loadReports() {
      const reports = await getHazardReports();
      if (reports && reports.length > 0) {
        setHazardReports(reports);
      } else {
        setHazardReports([
          {
            id: 1,
            location: 'Pidurangala North Access Trail',
            description:
              'Fallen timber blocking path at marker 4B. Minor soil erosion on steep pitch.',
            reporter_name: 'Amara P.',
            status: 'Verified',
            reward_points_awarded: 50,
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 2,
            location: 'Ella Rock South Summit Trail',
            description:
              'Heavy overcrowding near steep ridge section. Trail maintenance suggested.',
            reporter_name: 'Kasun D.',
            status: 'Under Review',
            reward_points_awarded: 50,
            created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
        ]);
      }
    }
    loadReports();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLocation || !reportDescription) return;

    setSubmitting(true);
    const res = await submitHazardReport({
      location: reportLocation,
      description: reportDescription,
      reporter_name: reporterName || 'Anonymous Traveler',
    });

    if (res) {
      setAwardedPoints(res.rewardPoints || 50);
    } else {
      setAwardedPoints(50);
    }

    // Append to list locally
    setHazardReports((prev) => [
      {
        id: Date.now(),
        location: reportLocation,
        description: reportDescription,
        reporter_name: reporterName || 'Anonymous Traveler',
        status: 'Under Review',
        reward_points_awarded: 50,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    setReportSubmitted(true);
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded bg-coral-500/10 text-coral-500 text-label-sm font-bold">
            High Crowd Level
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-1 rounded bg-signal-amber-500/10 text-signal-amber-500 text-label-sm font-bold">
            Moderate Level
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 text-label-sm font-bold">
            Low Crowd Level
          </span>
        );
    }
  };

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
                Sustainability & Crowd Management
              </h1>
              <p className="font-body-lg text-on-primary-container">
                Monitor real-time crowd density thresholds, explore lower-crowd nearby alternatives,
                and contribute crowdsourced trail hazard reports for Eco-Rewards.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-signal-amber-500/20 flex items-center justify-center text-signal-amber-500">
                <span className="material-symbols-outlined text-[28px]">warning</span>
              </div>
              <div>
                <div className="text-body-sm text-sky-300 font-medium">Active Hazard Reports</div>
                <div className="font-heading-lg text-white text-[24px]">
                  {hazardReports.length} Active Surveillance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Destination Selection Toolbar */}
            <div className="bg-canvas-50 rounded-2xl p-6 border border-line-200 shadow-sm">
              <label className="text-label-sm text-on-surface font-bold uppercase tracking-wider block mb-3">
                Select Destination to Inspect Live Visitor Load
              </label>
              <div className="flex flex-wrap gap-2">
                {FEATURED_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedDestId(dest.id)}
                    className={`px-3.5 py-2 rounded-xl text-body-sm font-semibold transition-all cursor-pointer ${
                      selectedDestId === dest.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface text-on-surface-variant hover:bg-canvas-100 border border-line-200'
                    }`}
                  >
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Crowd & Capacity Status */}
            <div className="bg-canvas-50 rounded-2xl p-6 lg:p-8 border border-line-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-heading-md text-on-surface">
                    {crowdStatus?.destination_name || 'Destination Status'}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant">
                    Real-time capacity tracking & peak visitor load engine
                  </p>
                </div>
                {crowdStatus && getStatusBadge(crowdStatus.crowd_status)}
              </div>

              {/* Overcrowding Warning Banner */}
              {crowdStatus?.is_overcrowded && (
                <div className="mb-6 p-4 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-start gap-3">
                  <span className="material-symbols-outlined text-coral-500 text-[24px]">
                    warning
                  </span>
                  <div>
                    <h4 className="font-heading-sm text-coral-500">Overcrowding Warning Active</h4>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      {crowdStatus.warning_message ||
                        'High visitor density detected. Queue times exceed 45 mins.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Progress bar for capacity */}
              <div className="mb-6 bg-surface rounded-xl p-4 border border-line-200">
                <div className="flex justify-between items-center text-body-sm mb-2">
                  <span className="font-semibold text-on-surface">Current Capacity Load</span>
                  <span className="font-bold text-primary">
                    {crowdStatus?.current_capacity_pct ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-canvas-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (crowdStatus?.current_capacity_pct ?? 0) > 75
                        ? 'bg-coral-500'
                        : (crowdStatus?.current_capacity_pct ?? 0) > 40
                          ? 'bg-signal-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${crowdStatus?.current_capacity_pct ?? 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-label-sm text-on-surface-variant mt-2">
                  <span>Peak Hours: {crowdStatus?.peak_hours || '10:00 - 14:00'}</span>
                  <span>Score: {((crowdStatus?.crowd_score ?? 0) * 100).toFixed(0)} / 100</span>
                </div>
              </div>

              {/* Recharts Hourly Visitor Load Curve */}
              <div className="h-56 w-full mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-label-sm text-outline font-semibold">
                    Hourly Visitor Load (Sensor & Simulation Data)
                  </span>
                  {visitorLoad?.peak_hour && (
                    <span className="text-label-sm text-coral-500 font-medium">
                      Peak Hour: {visitorLoad.peak_hour}
                    </span>
                  )}
                </div>
                {loadingCrowd ? (
                  <div className="h-full flex items-center justify-center text-body-sm text-outline">
                    Loading crowd analytics...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitorLoad?.hourly_curve || []}>
                      <XAxis dataKey="hour" stroke="#6f7977" fontSize={12} />
                      <YAxis stroke="#6f7977" fontSize={12} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="density"
                        stroke="#0F5C56"
                        fill="#0F5C56"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Recommended Off-Peak Hours */}
              {visitorLoad?.recommended_offpeak_hours && (
                <div className="flex items-center gap-2 text-body-sm bg-emerald-500/10 text-emerald-700 p-3 rounded-lg border border-emerald-500/20">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                  <span>
                    <strong>Recommended Off-Peak Window:</strong>{' '}
                    {visitorLoad.recommended_offpeak_hours.join(' or ')}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Field Hazard Report Form */}
            <div className="bg-canvas-50 rounded-2xl p-6 lg:p-8 border border-line-200 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary">report_problem</span>
                  <h2 className="font-heading-md text-on-surface">Submit Field Hazard Report</h2>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Help protect fragile ecosystems & keep trails safe. Verified reports earn{' '}
                  <strong>+50 Eco-Reward Points</strong>.
                </p>
              </div>

              {reportSubmitted ? (
                <div className="p-6 bg-primary/10 rounded-xl border border-primary text-center">
                  <span className="material-symbols-outlined text-primary text-[40px] mb-2">
                    check_circle
                  </span>
                  <h3 className="font-heading-sm text-primary">Report Successfully Transmitted</h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Logged with LankaLens Ranger Network. You earned{' '}
                    <strong>+{awardedPoints} Eco-Reward Points</strong>!
                  </p>
                  <button
                    onClick={() => {
                      setReportSubmitted(false);
                      setReportLocation('');
                      setReportDescription('');
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-sm font-semibold hover:bg-primary-container cursor-pointer"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-label-sm text-on-surface font-semibold block mb-1">
                      Reporter Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Kasun Kalhara"
                      className="w-full bg-surface border border-line-200 rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-label-sm text-on-surface font-semibold block mb-1">
                      Location / Landmark Name <span className="text-coral-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reportLocation}
                      onChange={(e) => setReportLocation(e.target.value)}
                      placeholder="e.g. Pidurangala Rock North Access Trail"
                      className="w-full bg-surface border border-line-200 rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-label-sm text-on-surface font-semibold block mb-1">
                      Hazard / Observation Description <span className="text-coral-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Describe erosion, fallen trees, litter accumulation, or extreme overcrowding..."
                      className="w-full bg-surface border border-line-200 rounded-lg px-4 py-2.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-heading-sm py-3 rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Transmitting Report...' : 'Transmit Report (+50 Eco-Points)'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (5 Cols) */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            {/* Crowd-Aware Lower-Density Alternatives */}
            <div className="bg-canvas-50 rounded-2xl p-6 border border-line-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">nature_people</span>
                <h3 className="font-heading-md text-on-surface">Lower-Crowd Alternatives</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-4">
                Recommended alternative destinations nearby with reduced visitor strain:
              </p>

              <div className="flex flex-col gap-4">
                {alternatives.map((alt) => (
                  <div
                    key={alt.destination_id}
                    className="bg-surface p-4 rounded-xl border border-line-200 shadow-xs"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-heading-sm text-on-surface">{alt.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-label-sm font-bold">
                        -{alt.crowd_reduction_pct}% Crowd
                      </span>
                    </div>
                    <p className="text-label-sm text-outline mb-2">
                      {alt.category} • {alt.district} ({alt.distance_km} km away)
                    </p>
                    <p className="text-body-sm text-on-surface-variant mb-3 leading-relaxed">
                      {alt.recommendation_reason}
                    </p>
                    <Link
                      href={`/destinations/${alt.destination_id}`}
                      className="inline-flex items-center gap-1.5 text-body-sm text-primary font-semibold hover:underline"
                    >
                      <span>Explore Destination</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Environmental Surveillance Log */}
            <div className="bg-canvas-50 rounded-2xl p-6 border border-line-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading-md text-on-surface">Surveillance Reports Log</h3>
                <span className="text-label-sm text-outline font-semibold">Live Feed</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {hazardReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-surface p-3.5 rounded-xl border border-line-200"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-heading-sm text-on-surface text-body-sm">
                        {report.location}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          report.status === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-signal-amber-500/10 text-signal-amber-600'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant mb-2">
                      {report.description}
                    </p>
                    <div className="flex justify-between items-center text-[11px] text-outline">
                      <span>Reported by {report.reporter_name}</span>
                      <span className="text-primary font-bold">
                        +{report.reward_points_awarded} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
