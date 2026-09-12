'use client';

import Navbar from '@/components/layout/Navbar';
import { useEffect, useState } from 'react';
import { UserReputationProfile, getUserReputationProfile, submitGuideApplication } from '@/lib/api';
import {
  Award,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Send,
  ThumbsUp,
  MessageSquare,
  BadgeCheck,
} from 'lucide-react';

const MOCK_FALLBACK_PROFILE: UserReputationProfile = {
  author_name: 'Master Cartographer',
  rank: 'Trusted Guide',
  eco_points: 850,
  reputation_score: 92.4,
  ai_pass_rate: 94.5,
  approved_count: 17,
  rejected_count: 1,
  total_submissions: 18,
  total_likes_received: 284,
  total_comments_received: 42,
  badges: [
    {
      id: 'pioneer_cartographer',
      title: 'Pioneer Cartographer',
      description: 'Submitted 1st verified Sri Lankan tourism discovery.',
      icon: 'map_pin',
      unlocked_at: '2026-09-01',
    },
    {
      id: 'geofence_sentinel',
      title: 'Geofence Sentinel',
      description: 'Achieved high geographic accuracy across 5+ contributions.',
      icon: 'shield_check',
      unlocked_at: '2026-09-05',
    },
    {
      id: 'verified_local',
      title: 'Verified Local',
      description: 'Reached Verified Local recognition threshold (250+ pts).',
      icon: 'award',
      unlocked_at: '2026-09-08',
    },
    {
      id: 'trusted_guide',
      title: 'Trusted Guide Elite',
      description: 'Achieved top-tier Trusted Guide status & Marketplace eligibility.',
      icon: 'star',
      unlocked_at: '2026-09-12',
    },
  ],
  is_guide_eligible: true,
  guide_upgrade_status: 'eligible',
  daily_points_accrued: 150,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserReputationProfile | null>(null);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [submittingApp, setSubmittingApp] = useState<boolean>(false);
  const [appSubmitted, setAppSubmitted] = useState<boolean>(false);

  // Guide Application Form State
  const [contactNumber, setContactNumber] = useState<string>('');
  const [sltdaLicense, setSltdaLicense] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('Cultural Heritage & Trekking');
  const [bioSummary, setBioSummary] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    getUserReputationProfile('Master Cartographer').then((data) => {
      if (!isMounted) return;
      if (data) {
        setProfile(data);
      } else {
        setProfile(MOCK_FALLBACK_PROFILE);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactNumber || !bioSummary) return;

    setSubmittingApp(true);
    const res = await submitGuideApplication({
      author_name: profile?.author_name || 'Master Cartographer',
      contact_number: contactNumber,
      sltda_license_number: sltdaLicense || undefined,
      niche_specialization: specialization,
      bio_summary: bioSummary,
    });

    setSubmittingApp(false);
    if (res) {
      setAppSubmitted(true);
      if (profile) {
        setProfile({
          ...profile,
          guide_upgrade_status: 'applied',
        });
      }
    }
  };

  const getRankBadgeStyle = (rank: string) => {
    switch (rank) {
      case 'Trusted Guide':
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-300';
      case 'Verified Local':
        return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Contributor Profile Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center font-extrabold text-2xl text-slate-950 shadow-lg">
                {profile?.author_name.charAt(0) || 'M'}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {profile?.author_name || 'Master Cartographer'}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider flex items-center gap-1.5 ${getRankBadgeStyle(
                      profile?.rank || 'New Contributor'
                    )}`}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" /> {profile?.rank || 'New Contributor'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  LankaLens Cartographic Explorer • Member since 2026
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <div className="text-center px-3 border-r border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-semibold">Eco-Points</p>
                <p className="text-2xl font-black text-emerald-400">{profile?.eco_points ?? 0}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-xs text-slate-400 uppercase font-semibold">Reputation Score</p>
                <p className="text-2xl font-black text-amber-400">
                  {profile?.reputation_score?.toFixed(1) ?? '0.0'}/100
                </p>
              </div>
            </div>
          </div>

          {/* Recognition Ladder Milestones */}
          <div className="border-t border-slate-800/80 pt-6 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Recognition Ladder
                Progression
              </span>
              <span>
                Next Milestone:{' '}
                {profile?.rank === 'Trusted Guide' ? 'Max Rank Achieved 🎉' : '750 Eco-Points'}
              </span>
            </div>

            <div className="relative w-full bg-slate-950 border border-slate-800 h-4 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, ((profile?.eco_points ?? 0) / 750) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 text-center text-xs font-semibold text-slate-400 pt-1">
              <div className="text-left font-bold text-slate-300">New Contributor (0 pts)</div>
              <div className="text-center font-bold text-emerald-400">Verified Local (250 pts)</div>
              <div className="text-right font-bold text-amber-400">Trusted Guide (750 pts)</div>
            </div>
          </div>
        </div>

        {/* Reputation Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              AI Pass Rate
            </p>
            <p className="text-3xl font-black text-emerald-400">
              {profile?.ai_pass_rate?.toFixed(1) ?? '100'}%
            </p>
            <p className="text-xs text-slate-400">Automated verification integrity</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Approved Posts
            </p>
            <p className="text-3xl font-black text-white">{profile?.approved_count ?? 0}</p>
            <p className="text-xs text-slate-400">{profile?.rejected_count ?? 0} rejected</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" /> Community Likes
            </p>
            <p className="text-3xl font-black text-indigo-400">
              {profile?.total_likes_received ?? 0}
            </p>
            <p className="text-xs text-slate-400">Total engagement upvotes</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> Discussions
            </p>
            <p className="text-3xl font-black text-teal-400">
              {profile?.total_comments_received ?? 0}
            </p>
            <p className="text-xs text-slate-400">Community comments</p>
          </div>
        </div>

        {/* Trusted Guide Marketplace Upgrade Portal */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Marketplace Onboarding Tier
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                SLTDA Trusted Guide Marketplace
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
                Top-tier contributors who achieve{' '}
                <span className="text-amber-300 font-semibold">Trusted Guide</span> status unlock
                direct onboarding into the LankaLens Marketplace to host verified local tours and
                experiences.
              </p>
            </div>

            {profile?.is_guide_eligible ? (
              profile.guide_upgrade_status === 'applied' ? (
                <div className="px-5 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" /> Application Pending
                  Verification
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-sm transition shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" /> Apply for Guide Certification
                </button>
              )
            ) : (
              <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" /> Locked until 750 Eco-Pts & 90%+ AI Pass
                Rate
              </div>
            )}
          </div>
        </div>

        {/* Unlocked Badges Showcase */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Earned Recognition Badges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profile?.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{badge.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Guide Marketplace Application Form */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Apply for SLTDA Guide Certification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Submit your details for official Marketplace onboarding
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {appSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Application Submitted!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your SLTDA Guide verification request has been logged. Our cartographic
                    verification team will review your profile.
                  </p>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGuideSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Contact Number (WhatsApp)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+94 77 123 4567"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      SLTDA License Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="SLTDA/NTG/2026/0892"
                      value={sltdaLicense}
                      onChange={(e) => setSltdaLicense(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Guide Specialization Niche
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cultural Heritage & Trekking"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Bio & Experience Summary
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Briefly describe your guiding experience and region focus..."
                      value={bioSummary}
                      onChange={(e) => setBioSummary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApp}
                      className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />{' '}
                      {submittingApp ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
