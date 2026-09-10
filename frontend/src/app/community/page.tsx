'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Post {
  id: number;
  author: string;
  role: string;
  avatar: string;
  time: string;
  verified: boolean;
  location: string;
  image: string;
  caption: string;
  tags: string[];
  ecoPoints: number;
  commentsCount: number;
  liked?: boolean;
}

export default function CommunityPage() {
  const [filter, setFilter] = useState<'all' | 'verified' | 'trending'>('all');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Chaminda Perera',
      role: 'Local Guide',
      avatar: '/stitch_images/discover.png',
      time: '2 hours ago',
      verified: true,
      location: 'Ella, Uva Province',
      image: '/stitch_images/discover.png',
      caption: 'Discovered this secret vantage point just past the second tea bungalow. The mist cleared right at 6:15 AM, revealing the full expanse of Little Adam\'s Peak. Make sure to bring sturdy boots!',
      tags: ['#EllaRock', '#HiddenVistas', '#CeylonTeaTrails'],
      ecoPoints: 248,
      commentsCount: 32,
    },
    {
      id: 2,
      author: 'Clara Dupont',
      role: 'Explorer',
      avatar: '/stitch_images/planner.png',
      time: '5 hours ago',
      verified: false,
      location: 'Polonnaruwa Ancient City',
      image: '/stitch_images/map.png',
      caption: 'Renting a bicycle to explore the ancient irrigation tanks and stone stupas was the best decision. Pro tip: start early at 7 AM before the afternoon heat.',
      tags: ['#CulturalTriangle', '#HeritageSites', '#BikeTour'],
      ecoPoints: 184,
      commentsCount: 19,
    },
  ]);

  const toggleEcoPoint = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = p.liked;
          return {
            ...p,
            ecoPoints: isLiked ? p.ecoPoints - 1 : p.ecoPoints + 1,
            liked: !isLiked,
          };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === 'verified') return p.verified;
    if (filter === 'trending') return p.ecoPoints > 200;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1 bg-surface pb-24">
        {/* Banner Header */}
        <div className="w-full bg-canvas-50 py-12 px-6 lg:px-12 border-b border-line-200/60 mb-8">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2 font-semibold">
                <span className="material-symbols-outlined text-[20px]">explore</span>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">Community Discovery Stream</span>
              </div>
              <h1 className="font-display-lg text-primary">The Ceylon Chronicle</h1>
              <p className="text-body-md text-on-surface-variant max-w-xl mt-2">
                Real-time dispatches, verified travel notes, and hidden vistas shared by top local guides and global explorers across the island.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl shadow-sm border border-line-200">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-all ${
                  filter === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Dispatches
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === 'verified' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>AI-Verified</span>
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === 'trending' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>Trending</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Feed Container */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Stream (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm border border-line-200/80 flex flex-col transition-all hover:shadow-md"
              >
                {/* Author Header */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full relative overflow-hidden bg-primary-container shrink-0">
                      <Image src={post.avatar} alt={post.author} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading-sm text-on-surface">{post.author}</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-label-sm font-bold">
                          {post.role}
                        </span>
                      </div>
                      <div className="text-body-sm text-outline flex items-center gap-2 mt-0.5">
                        <span>{post.time}</span>
                        {post.verified && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-success-600 font-semibold">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              <span>AI-Verified Route</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Image */}
                <div className="relative w-full h-[400px]">
                  <Image src={post.image} alt={post.caption} fill className="object-cover" />
                  <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-body-sm font-semibold text-on-surface shadow-sm border border-line-200">
                    <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                    <span>{post.location}</span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6 flex flex-col gap-4">
                  <p className="text-body-lg text-on-surface">{post.caption}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-surface-container rounded-lg text-body-sm text-on-surface-variant font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Reaction Bar */}
                  <div className="pt-4 border-t border-line-200 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => toggleEcoPoint(post.id)}
                        className={`flex items-center gap-2 transition-colors group ${
                          post.liked ? 'text-coral-500 font-bold' : 'text-on-surface-variant hover:text-coral-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">eco</span>
                        <span className="font-semibold text-body-md">{post.ecoPoints}</span>
                      </button>

                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[22px]">chat_bubble_outline</span>
                        <span className="font-semibold text-body-md">{post.commentsCount}</span>
                      </div>
                    </div>

                    <Link
                      href="/planner"
                      className="text-primary font-label-sm font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_location</span>
                      <span>Save Stop</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right Sidebar (Col 4) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm flex flex-col gap-4">
              <h3 className="font-heading-md text-on-surface">Top Community Contributors</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-sm font-bold">
                      CP
                    </div>
                    <div>
                      <div className="font-heading-sm text-body-sm">Chaminda Perera</div>
                      <div className="text-label-sm text-outline">142 verified stops</div>
                    </div>
                  </div>
                  <span className="text-label-sm text-primary font-bold">1,240 pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-label-sm font-bold">
                      CD
                    </div>
                    <div>
                      <div className="font-heading-sm text-body-sm">Clara Dupont</div>
                      <div className="text-label-sm text-outline">89 verified stops</div>
                    </div>
                  </div>
                  <span className="text-label-sm text-primary font-bold">980 pts</span>
                </div>
              </div>
            </div>

            <Link
              href="/contribution"
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-heading-sm py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-center"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Post Your Own Dispatch</span>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
