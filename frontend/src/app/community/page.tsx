'use client';

import Navbar from '@/components/layout/Navbar';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CommunityPost,
  LeaderboardContributor,
  getCommunityPosts,
  getCommunityLeaderboard,
  interactWithCommunityPost,
  createCommunityPost,
} from '@/lib/api';

export default function CommunityPage() {
  const [filter, setFilter] = useState<'all' | 'verified' | 'trending'>('all');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCommentPostId, setOpenCommentPostId] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // New Post Form state
  const [authorName, setAuthorName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [captionText, setCaptionText] = useState('');
  const [postTags, setPostTags] = useState('');

  useEffect(() => {
    async function loadCommunityData() {
      setLoading(true);
      const fetchedPosts = await getCommunityPosts({
        sort_by: filter === 'trending' ? 'trending' : 'latest',
        verified_only: filter === 'verified',
      });
      const fetchedLeaderboard = await getCommunityLeaderboard();

      if (fetchedPosts) {
        setPosts(fetchedPosts);
      }
      if (fetchedLeaderboard) {
        setLeaderboard(fetchedLeaderboard);
      }
      setLoading(false);
    }

    loadCommunityData();
  }, [filter]);

  const handleLike = async (postId: number, isLiked?: boolean) => {
    const action = isLiked ? 'unlike' : 'like';
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            liked: !isLiked,
            ecoPoints: isLiked ? p.ecoPoints - 1 : p.ecoPoints + 1,
            likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1,
          };
        }
        return p;
      })
    );

    const updated = await interactWithCommunityPost(postId, { action });
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    }
  };

  const handleSaveWatchlist = async (postId: number, isSaved?: boolean) => {
    const action = isSaved ? 'unsave' : 'save';
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            saved: !isSaved,
            saves_count: isSaved ? p.saves_count - 1 : p.saves_count + 1,
          };
        }
        return p;
      })
    );

    const updated = await interactWithCommunityPost(postId, { action });
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!newCommentText.trim()) return;

    const updated = await interactWithCommunityPost(postId, {
      action: 'comment',
      comment_text: newCommentText.trim(),
      author_name: 'Explorer',
    });

    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setNewCommentText('');
    }
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !captionText.trim()) return;

    const tagsArray = postTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const created = await createCommunityPost({
      author: authorName.trim() || 'Community Explorer',
      role: 'Explorer',
      location: locationName.trim(),
      caption: captionText.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['#CeylonExploration'],
    });

    if (created) {
      setPosts((prev) => [created, ...prev]);
      setShowNewPostModal(false);
      setAuthorName('');
      setLocationName('');
      setCaptionText('');
      setPostTags('');
    }
  };

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
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Community Discovery Stream
                </span>
              </div>
              <h1 className="font-display-lg text-primary">The Ceylon Chronicle</h1>
              <p className="text-body-md text-on-surface-variant max-w-xl mt-2">
                Real-time dispatches, geo-tagged discovery photos, verified travel notes, and hidden
                vistas shared by top local guides and global explorers.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl shadow-sm border border-line-200">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Dispatches
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === 'verified'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>AI-Verified</span>
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`px-4 py-2 rounded-lg text-body-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === 'trending'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
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
            {loading ? (
              <div className="p-12 text-center text-on-surface-variant">
                Loading discovery stream...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-xl border border-line-200">
                No dispatches found for this filter. Be the first to share a travel note!
              </div>
            ) : (
              posts.map((post) => (
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
                                <span className="material-symbols-outlined text-[14px]">
                                  verified
                                </span>
                                <span>AI-Verified Route</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {post.rating && (
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[16px]">star</span>
                        <span>{post.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Media Image */}
                  <div className="relative w-full h-[400px]">
                    <Image src={post.image} alt={post.caption} fill className="object-cover" />
                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-body-sm font-semibold text-on-surface shadow-sm border border-line-200">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        location_on
                      </span>
                      <span>{post.location}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6 flex flex-col gap-4">
                    <p className="text-body-lg text-on-surface">{post.caption}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-surface-container rounded-lg text-body-sm text-on-surface-variant font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Reaction Bar */}
                    <div className="pt-4 border-t border-line-200 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id, post.liked)}
                          className={`flex items-center gap-2 transition-colors group ${
                            post.liked
                              ? 'text-coral-500 font-bold'
                              : 'text-on-surface-variant hover:text-coral-500'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">eco</span>
                          <span className="font-semibold text-body-md">{post.ecoPoints}</span>
                        </button>

                        <button
                          onClick={() =>
                            setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)
                          }
                          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            chat_bubble_outline
                          </span>
                          <span className="font-semibold text-body-md">{post.commentsCount}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleSaveWatchlist(post.id, post.saved)}
                        className={`flex items-center gap-1.5 font-label-sm font-semibold transition-colors px-3 py-1.5 rounded-lg border ${
                          post.saved
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-line-200 text-primary hover:bg-primary/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {post.saved ? 'bookmark' : 'bookmark_border'}
                        </span>
                        <span>{post.saved ? 'Watchlisted' : 'Save Stop'}</span>
                      </button>
                    </div>

                    {/* Comment Drawer / Section */}
                    {openCommentPostId === post.id && (
                      <div className="mt-4 pt-4 border-t border-line-200 flex flex-col gap-3">
                        <h4 className="font-heading-sm text-on-surface text-body-sm">
                          Comments ({post.comments?.length || 0})
                        </h4>
                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((c) => (
                              <div
                                key={c.id}
                                className="bg-surface p-3 rounded-lg border border-line-200/80 text-body-sm flex gap-3 items-start"
                              >
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-label-sm font-bold shrink-0">
                                  {c.author.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-on-surface">
                                      {c.author}
                                    </span>
                                    <span className="text-label-sm text-outline">{c.time}</span>
                                  </div>
                                  <p className="text-on-surface-variant mt-0.5">{c.text}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-body-sm text-outline italic">
                              No comments yet. Start the conversation!
                            </p>
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Add a travel comment or recommendation..."
                            className="flex-1 px-3 py-2 bg-surface border border-line-200 rounded-lg text-body-sm focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 bg-primary text-on-primary font-semibold text-body-sm rounded-lg hover:bg-primary-container transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Right Sidebar (Col 4) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm flex flex-col gap-4">
              <h3 className="font-heading-md text-on-surface">Top Community Contributors</h3>
              <div className="flex flex-col gap-3">
                {leaderboard.map((contrib, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-sm font-bold shrink-0">
                        {contrib.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-heading-sm text-body-sm">{contrib.name}</div>
                        <div className="text-label-sm text-outline">
                          {contrib.verified_count} verified stops
                        </div>
                      </div>
                    </div>
                    <span className="text-label-sm text-primary font-bold">
                      {contrib.eco_points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowNewPostModal(true)}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-heading-sm py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-center"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Post Your Own Dispatch</span>
            </button>
          </aside>
        </div>

        {/* Create Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface p-6 rounded-2xl border border-line-200 max-w-lg w-full shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-line-200 pb-3">
                <h3 className="font-heading-md text-on-surface">New Discovery Dispatch</h3>
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Saman Kumara"
                    className="w-full px-3 py-2 bg-canvas-50 border border-line-200 rounded-lg text-body-sm"
                  />
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Geo-Tagged Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Mirissa Secret Beach, Southern Province"
                    className="w-full px-3 py-2 bg-canvas-50 border border-line-200 rounded-lg text-body-sm"
                  />
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Dispatch Notes & Discovery Caption *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="Share trail conditions, secret viewpoints, or local eco tips..."
                    className="w-full px-3 py-2 bg-canvas-50 border border-line-200 rounded-lg text-body-sm resize-none"
                  />
                </div>

                <div>
                  <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                    Hashtags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    placeholder="e.g. #HiddenGem, #SecretBeach"
                    className="w-full px-3 py-2 bg-canvas-50 border border-line-200 rounded-lg text-body-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-line-200">
                  <button
                    type="button"
                    onClick={() => setShowNewPostModal(false)}
                    className="px-4 py-2 rounded-lg text-body-sm font-semibold text-on-surface-variant hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-on-primary font-semibold text-body-sm rounded-lg hover:bg-primary-container transition-colors"
                  >
                    Publish Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
