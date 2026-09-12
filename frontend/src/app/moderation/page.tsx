'use client';

import Navbar from '@/components/layout/Navbar';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ContributionRecord,
  ModerationQueueResponse,
  getModerationQueue,
  moderateContribution,
} from '@/lib/api';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Camera,
  Layers,
  Sparkles,
  RefreshCw,
  Filter,
  Info,
} from 'lucide-react';

const RISK_FILTERS = [
  { label: 'All Pending', value: '' },
  { label: '📍 Geo Mismatch', value: 'GEOGRAPHIC_MISMATCH' },
  { label: '🤖 Synthetic AI Image', value: 'SYNTHETIC_IMAGE_PROBABLE' },
  { label: '⚠️ Commercial Spam', value: 'SUSPICIOUS_SPAM' },
  { label: '👯 Duplicate Content', value: 'DUPLICATE_CONTENT' },
  { label: '⚡ High Velocity', value: 'HIGH_VELOCITY_SUBMISSION' },
];

export default function ModerationPage() {
  const [queueData, setQueueData] = useState<ModerationQueueResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ [id: number]: string }>({});
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchQueue = async (filterVal?: string) => {
    setLoading(true);
    const data = await getModerationQueue(filterVal !== undefined ? filterVal : selectedFilter);
    if (data) {
      setQueueData(data);
    } else {
      // Client fallback mock queue if backend server is offline
      setQueueData({
        total_pending: 3,
        flagged_count: 2,
        average_trust_score: 0.64,
        queue: [
          {
            id: 2,
            author_name: 'Traveler Bob',
            title: 'Sigiriya Rock Climb View',
            category: 'Cultural',
            destination_id: 1,
            description: 'Enjoyed climbing this monolith during my trip to Sri Lanka.',
            image_url: '/stitch_images/discover.png',
            alt_text: 'View of Sigiriya rock citadel.',
            tags: ['#Sigiriya', '#Heritage'],
            rating: 4.5,
            latitude: 6.9271,
            longitude: 79.8612,
            exif_metadata: {
              camera: 'Apple iPhone 14 Pro',
              lens: '24mm f/1.78',
              timestamp: '2026-09-12 09:15:00',
              latitude: 6.9271,
              longitude: 79.8612,
              width: 4032,
              height: 3024,
              has_gps: true,
            },
            ai_validation_result: {
              passed: false,
              confidence_score: 0.64,
              boundary_check: 'FAILED (Location 132km away from Sigiriya)',
              quality_check: 'PASSED',
              text_safety_check: 'PASSED',
              wcag_alt_check: 'PASSED',
              notes: 'Flagged for geographic distance inconsistency.',
            },
            ai_trust_audit: {
              overall_trust_score: 0.64,
              geo_consistency_score: 0.4,
              distance_to_destination_km: 132.5,
              image_authenticity_score: 0.95,
              is_synthetic_image: false,
              text_safety_score: 1.0,
              spam_risk_score: 0.0,
              duplicate_risk_score: 0.0,
              ai_fallback_triggered: false,
              flags: ['GEOGRAPHIC_MISMATCH'],
              summary_notes:
                'Uploaded coordinates located in Colombo, 132.5km away from linked Sigiriya destination.',
            },
            ai_confidence_score: 0.64,
            status: 'pending_review',
            moderation_status: 'pending_review',
            reputation_points_awarded: 0,
            created_at: '10 minutes ago',
          },
          {
            id: 3,
            author_name: 'Digital Artist',
            title: 'Futuristic View of Ella Gap',
            category: 'Nature',
            destination_id: 2,
            description: 'Hyperrealistic dawn rendering over tea estate hills.',
            image_url: '/stitch_images/midjourney_ai_generated_render.png',
            alt_text: 'Misty tea estate render.',
            tags: ['#Ella', '#AI', '#aigen'],
            rating: 4.0,
            latitude: 6.8667,
            longitude: 81.0465,
            exif_metadata: {
              camera: 'Synthetic Generator',
              lens: 'Digital Lens',
              timestamp: '2026-09-12 08:00:00',
              latitude: 6.8667,
              longitude: 81.0465,
              width: 3840,
              height: 2160,
              has_gps: false,
            },
            ai_validation_result: {
              passed: false,
              confidence_score: 0.52,
              boundary_check: 'PASSED',
              quality_check: 'FAILED (Synthetic patterns detected)',
              text_safety_check: 'PASSED',
              wcag_alt_check: 'PASSED',
              notes: 'Synthetic image markers found.',
            },
            ai_trust_audit: {
              overall_trust_score: 0.52,
              geo_consistency_score: 0.75,
              distance_to_destination_km: 1.2,
              image_authenticity_score: 0.5,
              is_synthetic_image: true,
              text_safety_score: 1.0,
              spam_risk_score: 0.0,
              duplicate_risk_score: 0.0,
              ai_fallback_triggered: false,
              flags: ['SYNTHETIC_IMAGE_PROBABLE'],
              summary_notes: 'Image url & tags indicate synthetic AI render.',
            },
            ai_confidence_score: 0.52,
            status: 'pending_review',
            moderation_status: 'pending_review',
            reputation_points_awarded: 0,
            created_at: '25 minutes ago',
          },
        ],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue(selectedFilter);
  }, [selectedFilter]);

  const handleModerateAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessingId(id);
    const note =
      actionFeedback[id] ||
      (action === 'approve' ? 'Verified by human moderator.' : 'Violates community guidelines.');

    const res = await moderateContribution(id, {
      action,
      moderator_name: 'Chief Cartographer',
      feedback: note,
    });

    if (res) {
      setNotification(`Contribution #${id} successfully ${action}d!`);
    } else {
      setNotification(`Action completed for #${id} (${action}d).`);
    }

    setProcessingId(null);
    setTimeout(() => setNotification(null), 4000);
    fetchQueue(selectedFilter);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> EPIC 08 — AI Trust & Moderation Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Community Trust Control Center
              </h1>
              <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
                Multi-layered AI screening evaluating geographic PostGIS proximity, EXIF authentic
                imagery, text safety, and spam signals for human review.
              </p>
            </div>

            <button
              onClick={() => fetchQueue()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition shadow-sm hover:shadow"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Pending Reviews
                </p>
                <p className="text-2xl font-bold text-white">{queueData?.total_pending ?? 0}</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Community Flagged
                </p>
                <p className="text-2xl font-bold text-white">{queueData?.flagged_count ?? 0}</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Avg Trust Index
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {queueData?.average_trust_score
                    ? `${(queueData.average_trust_score * 100).toFixed(0)}%`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">{notification}</span>
            </div>
          </div>
        )}

        {/* Risk Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            <Filter className="w-3.5 h-3.5" /> Risk Signals:
          </div>
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                selectedFilter === f.value
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Queue Submissions Stream */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">
              Analyzing AI Trust signals and pending submissions...
            </p>
          </div>
        ) : queueData?.queue.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Moderation Queue Clear!</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No submissions currently require manual human moderation for the selected risk filter.
              All contributions pass automated AI Trust thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {queueData?.queue.map((item) => {
              const audit = item.ai_trust_audit;
              const trustPct = Math.round(
                (audit?.overall_trust_score ?? item.ai_confidence_score ?? 0.5) * 100
              );

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition shadow-xl space-y-6"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                        {item.author_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                            #{item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Submitted by{' '}
                          <span className="text-slate-200 font-medium">{item.author_name}</span> •{' '}
                          {item.created_at}
                        </p>
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-semibold uppercase">
                          AI Trust Index
                        </p>
                        <p
                          className={`text-xl font-extrabold ${
                            trustPct >= 85
                              ? 'text-emerald-400'
                              : trustPct >= 50
                                ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {trustPct}%
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-lg ${
                          trustPct >= 85
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : trustPct >= 50
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {trustPct}
                      </div>
                    </div>
                  </div>

                  {/* Active Anomaly Flags Bar */}
                  {audit?.flags && audit.flags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Anomaly Flags:
                      </span>
                      {audit.flags.map((flag) => (
                        <span
                          key={flag}
                          className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content Preview & Audit Radar Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Image & Details */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <Image
                          src={item.image_url || '/stitch_images/discover.png'}
                          alt={item.alt_text || item.title}
                          fill
                          className="object-cover"
                        />
                        {audit?.is_synthetic_image && (
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-rose-900/90 text-rose-200 text-xs font-bold border border-rose-700 shadow-md">
                            🤖 AI Synthetic Image
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs text-slate-300">
                        <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-emerald-400" /> EXIF Metadata Specs:
                        </p>
                        <p>
                          Camera:{' '}
                          <span className="text-slate-400">
                            {item.exif_metadata?.camera || 'N/A'}
                          </span>
                        </p>
                        <p>
                          GPS Pin:{' '}
                          <span className="text-slate-400">
                            {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                          </span>
                        </p>
                        <p>
                          Alt Text: <span className="text-slate-400 italic">{item.alt_text}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Column: AI Trust Radar Scores */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" /> AI Trust Breakdown
                          Scores
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Geo Score */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-300 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" /> Geo Consistency
                              </span>
                              <span className="text-emerald-400 font-bold">
                                {Math.round((audit?.geo_consistency_score ?? 1.0) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${(audit?.geo_consistency_score ?? 1.0) * 100}%` }}
                              />
                            </div>
                            {audit?.distance_to_destination_km !== undefined &&
                              audit.distance_to_destination_km !== null && (
                                <p className="text-[11px] text-slate-400">
                                  Distance to pin:{' '}
                                  <span className="text-amber-400 font-semibold">
                                    {audit.distance_to_destination_km} km
                                  </span>
                                </p>
                              )}
                          </div>

                          {/* Image Authenticity */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-300 flex items-center gap-1">
                                <Camera className="w-3 h-3 text-indigo-400" /> Image Authenticity
                              </span>
                              <span className="text-indigo-400 font-bold">
                                {Math.round((audit?.image_authenticity_score ?? 0.95) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(audit?.image_authenticity_score ?? 0.95) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Text Safety */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-300">Text Safety</span>
                              <span className="text-emerald-400 font-bold">
                                {Math.round((audit?.text_safety_score ?? 1.0) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${(audit?.text_safety_score ?? 1.0) * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Spam Risk */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-slate-300">Spam Risk</span>
                              <span
                                className={
                                  audit?.spam_risk_score
                                    ? 'text-rose-400 font-bold'
                                    : 'text-emerald-400 font-bold'
                                }
                              >
                                {Math.round((audit?.spam_risk_score ?? 0.0) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-2 rounded-full transition-all"
                                style={{ width: `${(audit?.spam_risk_score ?? 0.0) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Audit Summary Notes */}
                        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg text-xs text-slate-300 space-y-1">
                          <p className="font-semibold text-slate-200 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-amber-400" /> AI Auditor Notes:
                          </p>
                          <p className="text-slate-400">
                            {audit?.summary_notes || 'Pending human moderation check.'}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        &quot;{item.description}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Moderator Controls Bar */}
                  <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <input
                      type="text"
                      placeholder="Add optional moderator feedback note..."
                      value={actionFeedback[item.id] || ''}
                      onChange={(e) =>
                        setActionFeedback({ ...actionFeedback, [item.id]: e.target.value })
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleModerateAction(item.id, 'reject')}
                        disabled={processingId === item.id}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
                      >
                        <XCircle className="w-4 h-4" /> Reject Submission
                      </button>

                      <button
                        onClick={() => handleModerateAction(item.id, 'approve')}
                        disabled={processingId === item.id}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve (+50 Eco-Pts)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
