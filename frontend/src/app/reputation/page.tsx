'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  getUserReputationProfile,
  getReputationLeaderboard,
  checkGuideEligibility,
  upgradeContributorToPartner,
  UserReputationProfile,
  EligibilityCheckResponse,
  ConvertedPartnerGuideResponse,
} from '@/lib/api';

export default function ReputationPortalPage() {
  const [selectedAuthor, setSelectedAuthor] = useState<string>('Chaminda Perera');
  const [profile, setProfile] = useState<UserReputationProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserReputationProfile[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [contactNumber, setContactNumber] = useState<string>('+94771239988');
  const [district, setDistrict] = useState<string>('Matale');
  const [province, setProvince] = useState<string>('Central');
  const [sltdaLicense, setSltdaLicense] = useState<string>('SLTDA/NTG/2026/0991');
  const [nicheSpecialization, setNicheSpecialization] = useState<string>(
    'Sigiriya Wildlife & Cultural Heritage'
  );
  const [baselineRate, setBaselineRate] = useState<number>(45);

  const [submittingUpgrade, setSubmittingUpgrade] = useState<boolean>(false);
  const [upgradeResult, setUpgradeResult] = useState<ConvertedPartnerGuideResponse | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function loadReputationData() {
      setLoading(true);
      const [profData, leadData, eligData] = await Promise.all([
        getUserReputationProfile(selectedAuthor),
        getReputationLeaderboard(),
        checkGuideEligibility(selectedAuthor),
      ]);

      if (!isSubscribed) return;
      setProfile(profData);
      setLeaderboard(leadData || []);
      setEligibility(eligData);
      setLoading(false);
    }

    loadReputationData();
    return () => {
      isSubscribed = false;
    };
  }, [selectedAuthor]);

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUpgrade(true);
    const res = await upgradeContributorToPartner({
      author_name: selectedAuthor,
      contact_number: contactNumber,
      district,
      province,
      sltda_license_number: sltdaLicense,
      niche_specialization: nicheSpecialization,
      baseline_rate: baselineRate,
      custom_title: `${selectedAuthor} — ${nicheSpecialization} Guide`,
    });

    setSubmittingUpgrade(false);
    if (res) {
      setUpgradeResult(res);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 pb-20">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-950 via-teal-900 to-neutral-900 pt-28 pb-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-emerald-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-700/50 mb-3">
              EPIC 21 • Contributor → Trusted Guide Pipeline
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Community Reputation & Guide Marketplace Upgrade
            </h1>
            <p className="mt-3 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
              Earn Eco-Points, unlock badges, and automatically qualify for the SLTDA Guide
              Marketplace with 5% preferential fees and matching visibility boosts.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Author Selector Bar */}
        <div className="rounded-2xl bg-white p-4 shadow-xl border border-neutral-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Select Contributor:
            </span>
            <select
              value={selectedAuthor}
              onChange={(e) => {
                setSelectedAuthor(e.target.value);
                setUpgradeResult(null);
              }}
              className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm font-bold text-neutral-800 focus:border-teal-700 focus:outline-none"
            >
              <option value="Chaminda Perera">Chaminda Perera (Trusted Guide)</option>
              <option value="Clara Dupont">Clara Dupont (Verified Local)</option>
              <option value="Tariq Mansoor">Tariq Mansoor (Verified Local)</option>
              <option value="NewbieExplorer">NewbieExplorer (New Contributor)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/planner/arrange"
              className="rounded-xl bg-teal-900 px-4 py-2 font-bold text-white shadow-sm hover:bg-teal-800 transition-all"
            >
              Browse Broker Arrangements →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Column 1 & 2: Reputation Profile & Guide Upgrade Eligibility */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl bg-white p-8 border border-neutral-200">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent mb-3" />
                  <p className="text-sm font-medium text-neutral-500">
                    Calculating reputation metrics & guide eligibility...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Reputation Profile Card */}
                {profile && (
                  <div className="rounded-3xl bg-white p-6 shadow-sm border border-neutral-200/80">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900 text-white font-extrabold text-xl shadow-md">
                          {profile.author_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-neutral-900">
                              {profile.author_name}
                            </h2>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              {profile.rank}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {profile.approved_count} Approved Contributions •{' '}
                            {profile.total_likes_received} Community Likes
                          </p>
                        </div>
                      </div>

                      <div className="text-right bg-neutral-50 p-3 rounded-2xl border border-neutral-100 w-full sm:w-auto">
                        <div className="text-2xl font-black text-emerald-800">
                          {profile.eco_points}
                        </div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Total Eco-Points
                        </div>
                      </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="rounded-2xl bg-neutral-50 p-3 border border-neutral-100">
                        <div className="text-lg font-bold text-neutral-900">
                          {profile.reputation_score} / 100
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium">
                          Reputation Score
                        </div>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 p-3 border border-neutral-100">
                        <div className="text-lg font-bold text-emerald-700">
                          {profile.ai_pass_rate}%
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium">AI Pass Rate</div>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 p-3 border border-neutral-100">
                        <div className="text-lg font-bold text-neutral-900">
                          {profile.approved_count}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium">
                          Approved Submissions
                        </div>
                      </div>
                      <div className="rounded-2xl bg-neutral-50 p-3 border border-neutral-100">
                        <div className="text-lg font-bold text-teal-800">
                          {profile.daily_points_accrued}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-medium">
                          24h Points Accrued
                        </div>
                      </div>
                    </div>

                    {/* Badges Showcase */}
                    {profile.badges && profile.badges.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                          Unlocked Badges
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.badges.map((badge, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex items-center gap-2 rounded-xl bg-teal-50/80 px-3 py-1.5 border border-teal-100 text-xs font-semibold text-teal-900"
                            >
                              <span>🛡️</span>
                              <span>{badge.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Guide Eligibility Checklist Card (EPIC 21) */}
                {eligibility && (
                  <div className="rounded-3xl bg-white p-6 shadow-sm border border-neutral-200/80">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                          EPIC 21 Automatic Multi-Factor Assessment
                        </span>
                        <h3 className="text-lg font-bold text-neutral-900">
                          Guide Marketplace Onboarding Eligibility
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          eligibility.is_eligible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {eligibility.is_eligible ? '✓ Fully Eligible' : 'In Progress'}
                      </span>
                    </div>

                    {/* Checklist Items */}
                    <div className="mt-5 space-y-3">
                      {eligibility.criteria_breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-xs border border-neutral-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.passed
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-neutral-300 text-neutral-600'
                              }`}
                            >
                              {item.passed ? '✓' : '✕'}
                            </span>
                            <div>
                              <div className="font-semibold text-neutral-900">{item.metric}</div>
                              <div className="text-[11px] text-neutral-400">
                                Required: {item.required_value}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${item.passed ? 'text-emerald-700' : 'text-neutral-500'}`}
                            >
                              {item.actual_value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sustainability Incentives Callout */}
                    <div className="mt-6 rounded-2xl bg-gradient-to-r from-teal-900 to-emerald-900 p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold">Sustainability Incentives Unlocked</h4>
                          <p className="text-xs text-emerald-100/90 mt-0.5">
                            High-trust contributors receive preferential platform terms upon guide
                            upgrade.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                          <div className="font-extrabold text-amber-300">
                            {eligibility.preferential_commission_pct}% Fee
                          </div>
                          <div className="text-[10px] text-emerald-200">5% vs 15% standard</div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                          <div className="font-extrabold text-emerald-300">
                            +{eligibility.matching_boost_pct}% Match
                          </div>
                          <div className="text-[10px] text-emerald-200">
                            Broker visibility boost
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                          <div className="font-extrabold text-teal-200">💎 Hidden-Gem</div>
                          <div className="text-[10px] text-emerald-200">Special Explorer Tag</div>
                        </div>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="mt-6 flex justify-end">
                      {eligibility.is_eligible ? (
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="rounded-xl bg-emerald-800 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
                        >
                          🚀 Upgrade to Listed Partner Guide Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="rounded-xl bg-neutral-200 px-6 py-3 text-xs font-bold text-neutral-400 cursor-not-allowed"
                        >
                          Complete Eligibility Criteria to Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Column 3: Leaderboard */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-neutral-200/80">
              <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                🏆 Top Contributor Leaderboard
              </h3>
              <div className="mt-4 space-y-3">
                {leaderboard.map((item, lIdx) => (
                  <div
                    key={lIdx}
                    onClick={() => setSelectedAuthor(item.author_name)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedAuthor === item.author_name
                        ? 'bg-teal-50/80 border-teal-200 shadow-sm'
                        : 'bg-neutral-50/60 border-neutral-100 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
                        #{lIdx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">{item.author_name}</div>
                        <div className="text-[10px] text-neutral-400">{item.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-800">
                        {item.eco_points} pts
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {item.reputation_score} rep
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-emerald-800/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
                    Guide Onboarding Pipeline
                  </span>
                  <h3 className="mt-1 text-xl font-bold">
                    Upgrade {selectedAuthor} to Listed Guide
                  </h3>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {upgradeResult ? (
                /* Success View */
                <div className="text-center py-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold mb-3">
                    ✓
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">
                    Guide Profile Created & Listed!
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500">{upgradeResult.message}</p>

                  <div className="mt-5 rounded-2xl bg-teal-50/70 p-4 border border-teal-100 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-500">Partner ID:</span>
                      <span className="font-mono font-bold text-teal-900">
                        #{upgradeResult.partner_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-500">Business Title:</span>
                      <span className="font-semibold text-neutral-900">
                        {upgradeResult.business_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-500">Preferential Fee:</span>
                      <span className="font-bold text-emerald-700">
                        {upgradeResult.preferential_commission_pct}% Fee Tier
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-neutral-500">Matching Boost:</span>
                      <span className="font-bold text-teal-800">
                        +{upgradeResult.matching_boost_pct}% Broker Boost
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href="/planner/arrange"
                      className="flex-1 rounded-xl bg-teal-900 py-3 text-center text-xs font-bold text-white shadow-md hover:bg-teal-800 transition-all"
                    >
                      View in Arrangement Broker →
                    </Link>
                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="rounded-xl bg-neutral-100 px-4 py-3 text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Contact Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Operating District
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Province
                      </label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      SLTDA License Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={sltdaLicense}
                      onChange={(e) => setSltdaLicense(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Niche Specialization
                    </label>
                    <input
                      type="text"
                      required
                      value={nicheSpecialization}
                      onChange={(e) => setNicheSpecialization(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Baseline Daily Rate ($ USD)
                    </label>
                    <input
                      type="number"
                      required
                      value={baselineRate}
                      onChange={(e) => setBaselineRate(parseFloat(e.target.value) || 25)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs focus:border-emerald-700 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingUpgrade}
                    className="w-full rounded-xl bg-emerald-900 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 transition-all disabled:opacity-50 mt-2"
                  >
                    {submittingUpgrade
                      ? 'Creating Partner Guide Profile...'
                      : 'Confirm Upgrade & List as Partner Guide'}
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
