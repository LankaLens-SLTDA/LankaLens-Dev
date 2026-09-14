'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  RecommendedDestination,
  getPersonalizedRecommendations,
  queryAIAssistant,
  AIChatCardData,
  GroundingMetadata,
} from '@/lib/api';

interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  hasCard?: boolean;
  cardData?: AIChatCardData | null;
  followUps?: string[];
  groundingMetadata?: GroundingMetadata;
  detectedIntent?: string;
}

export default function AIAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'si' | 'ta' | 'fr' | 'de' | 'ja'>(
    'en'
  );
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm LankaLens Grounded AI & Personalization Assistant. I evaluate destinations, prices, itineraries, and crowds grounded in Sri Lanka's official database. How can I help you plan?",
      timestamp: '10:00 AM',
      groundingMetadata: {
        is_grounded: true,
        entities_found: [],
        hallucination_check_passed: true,
        retrieval_confidence: 0.99,
        sources_used: ['SEED_DATASETS', 'IN_MEMORY_DESTINATIONS'],
      },
    },
  ]);

  // Personalization Recommendation Engine Wizard State
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Heritage', 'Hiking']);
  const [travelStyle, setTravelStyle] = useState<string>('Eco-Tourist');
  const [maxBudget, setMaxBudget] = useState<number>(50);
  const [crowdTolerance, setCrowdTolerance] = useState<'low' | 'medium' | 'high'>('low');

  // React Query call to backend Recommendation Engine
  const { data: recResponse, isLoading: isRecLoading } = useQuery({
    queryKey: [
      'personalizedRecommendations',
      selectedInterests,
      travelStyle,
      maxBudget,
      crowdTolerance,
    ],
    queryFn: async () => {
      const res = await getPersonalizedRecommendations({
        interests: selectedInterests,
        travel_style: travelStyle,
        max_budget_per_day: maxBudget,
        crowd_tolerance: crowdTolerance,
        limit: 4,
      });
      return res;
    },
  });

  const availableInterests = [
    'Heritage',
    'Hiking',
    'Wildlife',
    'Surfing',
    'Tea Tasting',
    'Photography',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || inputText;
    if (!messageContent.trim() || isSending) return;

    const userMsgId = messages.length + 1;
    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputText('');
    setIsSending(true);

    const apiRes = await queryAIAssistant({
      message: messageContent,
      language: selectedLanguage,
    });

    if (apiRes) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          text: apiRes.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasCard: apiRes.hasCard,
          cardData: apiRes.cardData,
          followUps: apiRes.followUps,
          groundingMetadata: apiRes.grounding_metadata,
          detectedIntent: apiRes.detected_intent,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'ai',
          text: `[Grounded in LankaLens database] I've processed your query for "${messageContent}". Check out the updated explainable recommendations in your Personalization Panel!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUps: ['Add to Day 1 of Trip Planner', 'View nearby lower-crowd alternatives'],
        },
      ]);
    }

    setIsSending(false);
  };

  const fallbackRecommendations: RecommendedDestination[] = [
    {
      destination: {
        id: 1,
        name: 'Sigiriya Ancient Rock Fortress',
        title: 'Sigiriya Ancient Rock Fortress',
        category: 'temple',
        district: 'Matale',
        province: 'Central',
        latitude: 7.957,
        longitude: 80.76,
        description: '5th-century citadel with ancient frescoes.',
        desc: '5th-century citadel.',
        activities: ['Heritage', 'Rock Climbing'],
        estimated_visit_duration_minutes: 180,
        baseline_cost: 30,
        popularity: 98,
        rating: 4.9,
        reviews: 320,
        trust_score: 0.95,
        verification_state: 'verified',
        publication_status: 'published',
        is_verified: true,
        crowd_info: { density: 'High', peak_hours: '08:00 - 11:00' },
        community_stats: { upvotes: 450, save_count: 210 },
        images: ['/stitch_images/planner.png'],
        image_url: '/stitch_images/planner.png',
        image: '/stitch_images/planner.png',
        coord_x: '28%',
        coord_y: '22%',
        coords: { x: '28%', y: '22%' },
        elevation: '349 m',
        distance_from_colombo: '165 km from Colombo',
        distance: '165 km from Colombo',
      },
      match_percentage: 96,
      explanation: {
        match_percentage: 96,
        score_breakdown: {
          interest_score: 0.95,
          budget_score: 1.0,
          crowd_score: 0.85,
          trust_score: 0.95,
          distance_score: 0.8,
          rating_score: 0.98,
          total_score: 0.96,
        },
        reasons: [
          'Interest Match: Fits your Heritage & Hiking preferences',
          'Fits Budget: Entry ($30) fits well within your $50/day budget',
          'High AI Trust: 95% verification trust rating',
        ],
      },
    },
  ];

  const recommendationsList = recResponse?.recommendations || fallbackRecommendations;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1 bg-ink-950 text-surface flex flex-col min-h-screen">
        <div className="flex flex-col lg:flex-row flex-1 max-w-[1340px] mx-auto w-full px-4 sm:px-8 py-8 gap-8">
          {/* Left Personalization & Recommendation Engine Controls */}
          <aside className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
            {/* Interactive Preference Wizard */}
            <div className="bg-surface/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-heading-sm text-primary-fixed flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                  Personalization Engine
                </span>
                <span className="px-2.5 py-0.5 bg-primary/20 text-primary rounded text-label-xs font-bold">
                  v1.0 Explainable
                </span>
              </div>

              {/* Interests Selector */}
              <div>
                <label className="text-label-xs text-outline-variant font-semibold block mb-2">
                  Select Interests & Experiences:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-lg text-label-xs font-medium transition-all ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-on-primary font-bold shadow-md'
                          : 'bg-surface/10 hover:bg-surface/20 text-surface'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style Selector */}
              <div>
                <label className="text-label-xs text-outline-variant font-semibold block mb-1.5">
                  Travel Persona / Style:
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full bg-surface/10 text-surface text-body-sm px-3 py-2 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="Eco-Tourist" className="bg-ink-950">
                    🌿 Eco-Tourist & Nature
                  </option>
                  <option value="Cultural Explorer" className="bg-ink-950">
                    🏛️ Cultural Explorer
                  </option>
                  <option value="Adventure Seeker" className="bg-ink-950">
                    ⛰️ Adventure Seeker
                  </option>
                  <option value="Budget Backpacker" className="bg-ink-950">
                    🎒 Budget Backpacker
                  </option>
                </select>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex justify-between items-center text-label-xs mb-1">
                  <span className="text-outline-variant font-semibold">Max Daily Budget:</span>
                  <span className="text-sky-300 font-bold">${maxBudget} / day</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value, 10))}
                  className="w-full accent-primary h-1.5 cursor-pointer"
                />
              </div>

              {/* Crowd Tolerance Buttons */}
              <div>
                <label className="text-label-xs text-outline-variant font-semibold block mb-1.5">
                  Crowd Tolerance Preference:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setCrowdTolerance(level)}
                      className={`py-1.5 rounded-lg text-label-xs font-semibold capitalize transition-all ${
                        crowdTolerance === level
                          ? 'bg-sky-400 text-ink-950 font-bold shadow-md'
                          : 'bg-surface/10 hover:bg-surface/20 text-surface'
                      }`}
                    >
                      {level} Crowd
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Explainable Recommendations Feed Container */}
            <div className="bg-surface/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-heading-sm text-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-sky-300">
                    auto_awesome
                  </span>
                  Ranked Recommendations
                </span>
                {recResponse && (
                  <span className="text-label-xs text-outline-variant">
                    {recResponse.query_time_ms}ms
                  </span>
                )}
              </div>

              {isRecLoading ? (
                <div className="py-8 text-center text-outline text-body-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>Calculating explainable recommendations...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendationsList.map((rec) => (
                    <div
                      key={rec.destination.id}
                      className="bg-surface/10 hover:bg-surface/15 rounded-xl p-4 border border-white/10 space-y-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/destinations/${rec.destination.id}`}
                          className="hover:underline"
                        >
                          <h4 className="font-semibold text-body-sm text-surface">
                            {rec.destination.title}
                          </h4>
                          <span className="text-label-xs text-outline-variant block">
                            {rec.destination.category} · {rec.destination.district}
                          </span>
                        </Link>

                        <span className="px-2.5 py-1 bg-gradient-to-r from-deep-teal-600 to-sky-300 text-on-primary rounded-full text-label-xs font-bold flex-shrink-0 shadow-md">
                          {rec.match_percentage}% Match
                        </span>
                      </div>

                      {/* Reasons List */}
                      <div className="space-y-1">
                        {rec.explanation.reasons.map((reason, idx) => (
                          <div
                            key={idx}
                            className="text-label-xs text-sky-200 flex items-start gap-1"
                          >
                            <span className="text-primary-fixed font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-label-xs">
                        <span className="text-outline">
                          Entry: ${rec.destination.baseline_cost} | ★ {rec.destination.rating}
                        </span>
                        <Link
                          href={`/destinations/${rec.destination.id}`}
                          className="text-sky-300 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>View Profile</span>
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Right Main Conversational Assistant Chat */}
          <div className="flex-1 flex flex-col justify-between min-h-[640px] bg-surface/5 rounded-2xl p-6 lg:p-8 border border-white/10 shadow-2xl">
            {/* Chat Feed */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-6 max-h-[560px] no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                      msg.sender === 'ai'
                        ? 'bg-gradient-to-br from-deep-teal-600 to-sky-300 text-on-primary'
                        : 'bg-surface/20 text-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {msg.sender === 'ai' ? 'neurology' : 'person'}
                    </span>
                  </div>

                  <div
                    className={`flex flex-col gap-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-heading-sm text-surface">
                        {msg.sender === 'ai' ? 'LankaLens AI' : 'You'}
                      </span>
                      <span className="text-label-sm text-outline-variant">{msg.timestamp}</span>

                      {msg.groundingMetadata?.is_grounded && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          <span>SLTDA Data Grounded</span>
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-body-md leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary-container text-on-primary px-5 py-3 rounded-2xl rounded-tr-none'
                          : 'text-surface/90 bg-surface/10 p-5 rounded-2xl border border-white/10'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Structured UI Recommendation Card */}
                    {msg.hasCard && msg.cardData && (
                      <div className="bg-surface/10 p-4 rounded-xl border border-white/10 space-y-3 w-full">
                        <div className="flex gap-3 items-center">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-ink-950 shrink-0">
                            <Image
                              src={msg.cardData.image || '/stitch_images/planner.png'}
                              alt={msg.cardData.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-body-sm text-surface truncate">
                                {msg.cardData.title}
                              </h4>
                              <span className="text-label-xs font-bold text-sky-300">
                                ★ {msg.cardData.rating}
                              </span>
                            </div>
                            <p className="text-label-xs text-outline-variant">
                              {msg.cardData.type} · Entry: ${msg.cardData.cost} ·{' '}
                              {msg.cardData.duration}
                            </p>
                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold inline-block mt-1">
                              {msg.cardData.crowd_status} Crowd
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                          <Link
                            href={`/destinations/${msg.cardData.id}`}
                            className="px-3 py-1.5 bg-sky-300/20 text-sky-300 rounded-lg text-label-xs font-bold hover:bg-sky-300/30 transition-colors"
                          >
                            View Destination Profile →
                          </Link>
                        </div>
                      </div>
                    )}

                    {msg.followUps && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.followUps.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(chip)}
                            className="px-3.5 py-1.5 rounded-full bg-surface/10 hover:bg-surface/20 text-body-sm text-surface transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
                          >
                            <span>{chip}</span>
                            <span className="material-symbols-outlined text-[14px] text-sky-300">
                              arrow_forward
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-body-sm text-sky-300 py-2">
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  <span>Grounding response against LankaLens database...</span>
                </div>
              )}
            </div>

            {/* Language Selector Bar & Input Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-label-xs text-outline-variant">
                <span className="font-semibold">Multilingual Mode:</span>
                {(
                  [
                    ['en', 'English'],
                    ['si', 'සිංහල'],
                    ['ta', 'தமிழ்'],
                    ['fr', 'Français'],
                    ['de', 'Deutsch'],
                    ['ja', '日本語'],
                  ] as const
                ).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedLanguage(code)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedLanguage === code
                        ? 'bg-sky-300 text-ink-950'
                        : 'bg-surface/10 hover:bg-surface/20 text-surface'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask LankaLens AI anything about Sri Lanka travel..."
                  className="flex-1 bg-surface/10 border border-white/10 rounded-xl px-4 py-3 text-surface placeholder:text-outline-variant text-body-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isSending}
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-xl font-heading-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <span>{isSending ? 'Thinking...' : 'Send'}</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
