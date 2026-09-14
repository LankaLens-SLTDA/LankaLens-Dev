'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  getAdminMetrics,
  getAdminModerationQueue,
  moderateContentItem,
  getAdminReports,
  resolveAdminReport,
  updateAdminDestination,
  approveAdminPartner,
  verifyAdminGuide,
  verifyAdminHazard,
  getAdminAuditLogs,
  AdminDashboardMetrics,
  ModerationQueueResponse,
  AdminAuditLogRecord,
  Contribution,
} from '@/lib/api';

export default function AdminPlatformPage() {
  const [adminRole, setAdminRole] = useState<string>('super_admin');
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'moderation' | 'partners' | 'destinations' | 'reports' | 'audit'
  >('analytics');

  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [modQueue, setModQueue] = useState<ModerationQueueResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);
  const [reports, setReports] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Moderation Action State
  const [moderatorFeedback, setModeratorFeedback] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Destination Edit State
  const [editDestId, setEditDestId] = useState<number>(1);
  const [destName, setDestName] = useState<string>('Sigiriya Ancient Rock Fortress');
  const [destCost, setDestCost] = useState<number>(36.0);
  const [destCrowd, setDestCrowd] = useState<string>('Moderate');

  // Partner Approval State
  const [partnerIdInput, setPartnerIdInput] = useState<number>(1);
  const [featuredTierInput, setFeaturedTierInput] = useState<string>('gold');

  useEffect(() => {
    let isSubscribed = true;

    async function loadAdminData() {
      setLoading(true);
      const [metRes, qRes, logsRes, repRes] = await Promise.all([
        getAdminMetrics(adminRole),
        getAdminModerationQueue(adminRole),
        getAdminAuditLogs(50, adminRole),
        getAdminReports(adminRole),
      ]);

      if (!isSubscribed) return;
      setMetrics(metRes);
      setModQueue(qRes);
      setAuditLogs(logsRes || []);
      setReports(repRes || []);
      setLoading(false);
    }

    loadAdminData();
    return () => {
      isSubscribed = false;
    };
  }, [adminRole, activeTab]);

  const handleModerate = async (contribId: number, action: 'approve' | 'reject') => {
    const res = await moderateContentItem(
      contribId,
      action,
      `Admin (${adminRole})`,
      moderatorFeedback,
      adminRole
    );
    if (res) {
      setActionSuccessMsg(res.message);
      setModeratorFeedback('');
      // Refresh Queue & Audit Logs
      const updatedQueue = await getAdminModerationQueue(adminRole);
      const updatedLogs = await getAdminAuditLogs(50, adminRole);
      setModQueue(updatedQueue);
      if (updatedLogs) setAuditLogs(updatedLogs);
    }
  };

  const handleUpdateDestinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateAdminDestination(
      editDestId,
      { name: destName, baseline_cost: destCost, crowd_status: destCrowd },
      `Admin Editor (${adminRole})`,
      adminRole
    );
    if (res) {
      setActionSuccessMsg(res.message);
      const updatedLogs = await getAdminAuditLogs(50, adminRole);
      if (updatedLogs) setAuditLogs(updatedLogs);
    }
  };

  const handleApprovePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await approveAdminPartner(
      partnerIdInput,
      {
        partner_id: partnerIdInput,
        is_verified: true,
        verification_state: 'verified',
        is_featured: true,
        featured_tier: featuredTierInput,
      },
      `Partner Manager (${adminRole})`,
      adminRole
    );
    if (res) {
      setActionSuccessMsg(res.message);
      const updatedLogs = await getAdminAuditLogs(50, adminRole);
      if (updatedLogs) setAuditLogs(updatedLogs);
    }
  };

  const handleResolveReport = async (reportId: number) => {
    const res = await resolveAdminReport(
      reportId,
      `Admin (${adminRole})`,
      'Reviewed and resolved by admin.',
      adminRole
    );
    if (res) {
      setActionSuccessMsg(res.message);
      const updatedLogs = await getAdminAuditLogs(50, adminRole);
      if (updatedLogs) setAuditLogs(updatedLogs);
    }
  };

  const handleVerifyGuide = async (appId: number) => {
    const res = await verifyAdminGuide(
      appId,
      { application_id: appId, status: 'certified', admin_notes: 'Verified SLTDA registry.' },
      `Guide Certifier (${adminRole})`,
      adminRole
    );
    if (res) {
      setActionSuccessMsg(res.message);
      const updatedLogs = await getAdminAuditLogs(50, adminRole);
      if (updatedLogs) setAuditLogs(updatedLogs);
    }
  };

  const handleVerifyHazard = async (hazardId: number) => {
    const res = await verifyAdminHazard(
      hazardId,
      { hazard_id: hazardId, status: 'verified', admin_notes: 'Verified trail hazard.' },
      `Environmental Inspector (${adminRole})`,
      adminRole
    );
    if (res) {
      setActionSuccessMsg(res.message);
      const updatedLogs = await getAdminAuditLogs(50, adminRole);
      if (updatedLogs) setAuditLogs(updatedLogs);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 pb-20">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-teal-950 pt-28 pb-12 border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-teal-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300 border border-teal-700/50 mb-3">
                EPIC 22 • Admin & Moderation Operations Platform
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Platform Operations Control System
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                Centralized administration for content moderation, partner approvals, destination
                management, hazard reviews, and audit logs.
              </p>
            </div>

            {/* Admin Role Selector */}
            <div className="rounded-2xl bg-neutral-800/90 p-3 border border-neutral-700 backdrop-blur-md">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Active Authorization Role Header:
              </label>
              <select
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                className="rounded-xl border border-neutral-600 bg-neutral-900 px-3 py-1.5 text-xs font-bold text-teal-300 focus:border-teal-500 focus:outline-none"
              >
                <option value="super_admin">🔑 Super Admin (Full Control)</option>
                <option value="moderator">🛡️ Content Moderator</option>
                <option value="partner_manager">🤝 Partner & Guide Manager</option>
                <option value="content_editor">✏️ Cartographic Content Editor</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Notification Toast */}
      {actionSuccessMsg && (
        <div className="mx-auto max-w-7xl px-4 mt-4">
          <div className="flex items-center justify-between rounded-xl bg-teal-900/90 border border-teal-700 px-4 py-3 text-xs font-bold text-teal-100 shadow-lg">
            <span>✓ {actionSuccessMsg}</span>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-teal-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex overflow-x-auto gap-2 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            📊 Operations Analytics
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'moderation'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            🛡️ AI Moderation Queue
            {modQueue && modQueue.total_pending > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-black font-extrabold">
                {modQueue.total_pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'partners'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            🤝 Partners & Guides
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'destinations'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            📍 Destination Editor
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            ⚠️ Reports & Hazards
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-neutral-800/80 text-neutral-400 hover:text-white'
            }`}
          >
            📜 Audit Trail Logs
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-8">
          {loading && (
            <div className="mb-6 flex h-20 items-center justify-center rounded-2xl bg-neutral-800 p-4 border border-neutral-700">
              <div className="flex items-center gap-3 text-xs text-teal-400 font-semibold">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
                <span>Fetching operational metrics & analytics...</span>
              </div>
            </div>
          )}
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && metrics && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700">
                  <div className="text-3xl font-black text-white">{metrics.total_destinations}</div>
                  <div className="text-xs text-neutral-400 mt-1 font-semibold">
                    Active Destinations
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700">
                  <div className="text-3xl font-black text-emerald-400">
                    {metrics.active_partners_count}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-semibold">
                    Verified Local Partners
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700">
                  <div className="text-3xl font-black text-amber-400">
                    {metrics.pending_moderation_count}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-semibold">
                    Pending Moderation Items
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700">
                  <div className="text-3xl font-black text-teal-400">
                    {metrics.platform_health_score}%
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-semibold">
                    Platform Health Score
                  </div>
                </div>
              </div>

              {/* System Status Summary */}
              <div className="rounded-2xl bg-neutral-800 p-6 border border-neutral-700 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    System Status: {metrics.system_status.toUpperCase()}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    All core API endpoints, PostGIS spatial RPC functions, and AI verification
                    decision guards are operational.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/40">
                  ● 100% Operational
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: AI MODERATION QUEUE */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700">
                <h3 className="text-lg font-bold text-white">AI Cartographic Moderation Queue</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Submissions requiring human moderator review due to AI anomaly detection or
                  missing EXIF tags.
                </p>
              </div>

              {modQueue && modQueue.queue.length > 0 ? (
                <div className="space-y-4">
                  {modQueue.queue.map((item: Contribution, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700 flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40">
                            {item.status.toUpperCase()}
                          </span>
                          <h4 className="text-base font-bold text-white">{item.title}</h4>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Author: {item.author_name} • Category: {item.category}
                        </p>
                        <p className="text-xs text-neutral-300">{item.description}</p>

                        <div className="rounded-xl bg-neutral-900 p-3 text-xs border border-neutral-700 space-y-1">
                          <div>
                            <span className="font-semibold text-neutral-400">AI Confidence: </span>
                            <span className="font-bold text-teal-400">
                              {item.ai_confidence_score}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-400">EXIF GPS: </span>
                            <span>{item.exif_metadata?.has_gps ? '✓ Detected' : '✕ Missing'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Moderator Action Box */}
                      <div className="flex flex-col justify-between items-end gap-3 min-w-[240px]">
                        <input
                          type="text"
                          placeholder="Optional feedback note..."
                          value={moderatorFeedback}
                          onChange={(e) => setModeratorFeedback(e.target.value)}
                          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleModerate(item.id, 'approve')}
                            className="flex-1 rounded-xl bg-emerald-700 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-all shadow"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleModerate(item.id, 'reject')}
                            className="flex-1 rounded-xl bg-rose-700 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-all shadow"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-800/50 p-12 text-center text-neutral-400">
                  ✓ Moderation queue is empty! All submitted discoveries have been reviewed.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARTNERS & GUIDES */}
          {activeTab === 'partners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partner Approval Box */}
              <div className="rounded-2xl bg-neutral-800 p-6 border border-neutral-700">
                <h3 className="text-lg font-bold text-white">Partner Listing Approval</h3>
                <p className="text-xs text-neutral-400 mt-1 mb-4">
                  Set partner verification state and assign featured tiers.
                </p>
                <form onSubmit={handleApprovePartnerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Partner ID
                    </label>
                    <input
                      type="number"
                      value={partnerIdInput}
                      onChange={(e) => setPartnerIdInput(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Featured Tier
                    </label>
                    <select
                      value={featuredTierInput}
                      onChange={(e) => setFeaturedTierInput(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white"
                    >
                      <option value="gold">Gold Tier Partner</option>
                      <option value="silver">Silver Tier Partner</option>
                      <option value="standard">Standard Partner</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-600 transition-all"
                  >
                    Confirm Partner Approval
                  </button>
                </form>
              </div>

              {/* Guide Verification Box */}
              <div className="rounded-2xl bg-neutral-800 p-6 border border-neutral-700">
                <h3 className="text-lg font-bold text-white">Guide Marketplace Certifications</h3>
                <p className="text-xs text-neutral-400 mt-1 mb-4">
                  Certify or review guide upgrade applications.
                </p>
                <div className="rounded-xl bg-neutral-900 p-4 border border-neutral-700 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Application #1 — Chaminda Perera</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-semibold">
                      CERTIFIED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Specialization: Sigiriya Wildlife & Cultural Heritage
                  </p>
                  <button
                    onClick={() => handleVerifyGuide(1)}
                    className="w-full rounded-lg bg-teal-800 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-all mt-2"
                  >
                    ✓ Verify & Certify Guide #1
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DESTINATION EDITOR */}
          {activeTab === 'destinations' && (
            <div className="rounded-2xl bg-neutral-800 p-6 border border-neutral-700 max-w-xl">
              <h3 className="text-lg font-bold text-white">Destination Attribute Editor</h3>
              <p className="text-xs text-neutral-400 mt-1 mb-4">
                Edit baseline pricing, titles, and real-time site crowd status.
              </p>
              <form onSubmit={handleUpdateDestinationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Target Destination ID
                  </label>
                  <input
                    type="number"
                    value={editDestId}
                    onChange={(e) => setEditDestId(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Destination Name
                  </label>
                  <input
                    type="text"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Baseline Cost ($ USD)
                    </label>
                    <input
                      type="number"
                      value={destCost}
                      onChange={(e) => setDestCost(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Crowd Status
                    </label>
                    <select
                      value={destCrowd}
                      onChange={(e) => setDestCrowd(e.target.value)}
                      className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs text-white"
                    >
                      <option value="Low">Low Density</option>
                      <option value="Moderate">Moderate Density</option>
                      <option value="High">High Density</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-600 transition-all"
                >
                  Save Destination Updates
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: REPORTS & HAZARDS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-neutral-800 p-5 border border-neutral-700">
                <h3 className="text-lg font-bold text-white">
                  Community Reports & Environmental Hazards
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Review crowdsourced hazard alerts and inaccurate GPS pins.
                </p>
              </div>

              {reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      className="rounded-xl bg-neutral-800 p-4 border border-neutral-700 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">
                          Report #{String(r.id)} — Reason: {String(r.reason || 'General Report')}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          Status: {String(r.status || 'pending')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyHazard(Number(r.id) || 1)}
                          className="rounded-xl bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                        >
                          ⚠️ Verify Hazard
                        </button>
                        <button
                          onClick={() => handleResolveReport(Number(r.id) || 1)}
                          className="rounded-xl bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          ✓ Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-800/50 p-8 text-center text-neutral-400 text-xs">
                  No active unresolved community reports.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL LOGS */}
          {activeTab === 'audit' && (
            <div className="rounded-2xl bg-neutral-800 p-6 border border-neutral-700 space-y-4">
              <h3 className="text-lg font-bold text-white">
                Administrative Action Audit Trail Logs
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {auditLogs.map((log, lIdx) => (
                  <div
                    key={lIdx}
                    className="rounded-xl bg-neutral-900 p-3.5 border border-neutral-700/80 flex flex-col sm:flex-row justify-between gap-2"
                  >
                    <div>
                      <span className="rounded bg-teal-900/80 text-teal-300 px-2 py-0.5 font-bold uppercase text-[10px] mr-2">
                        {log.admin_role}
                      </span>
                      <span className="font-bold text-white">{log.admin_name}</span> executed{' '}
                      <span className="text-emerald-400">{log.action_type}</span> on{' '}
                      {log.target_type} #{log.target_id}
                      <p className="text-neutral-400 font-sans mt-1 text-[11px]">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                      {log.created_at}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
