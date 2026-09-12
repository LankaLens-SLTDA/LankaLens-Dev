'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

// Zod Schema for validation
const contributionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  category: z.string().min(1, 'Please select a category'),
  notes: z.string().min(15, 'Please provide at least 15 characters of discovery notes'),
  altText: z.string().min(10, 'WCAG accessibility alt text is required'),
  tags: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

export default function ContributionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Cultural');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      category: 'Cultural',
    },
  });

  const onSubmit = (data: ContributionFormValues) => {
    console.log('Submitted contribution:', data);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1 bg-surface pb-24">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12 w-full">
          {/* Header & Level Badge */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-body-sm tracking-wider uppercase text-primary font-bold">
                  Community Portal
                </span>
                <span className="text-outline">/</span>
                <span className="text-body-sm text-on-surface-variant">Contribution Form</span>
              </div>
              <h1 className="font-display-lg text-primary tracking-tight mb-2">
                Contribute a Discovery
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                Share hidden tea estates, sacred shrines, or secluded coastal spots with the
                LankaLens community.
              </p>
            </div>

            <div className="bg-canvas-50 rounded-2xl p-5 flex items-center gap-5 w-full lg:w-auto shadow-sm border border-line-200">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary font-display-lg text-xl shadow-inner">
                L3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading-sm text-primary">Level 3 Cartographer</span>
                  <span className="bg-primary/10 text-primary text-label-sm px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-body-sm text-on-surface-variant">
                  <span>
                    <strong className="text-on-surface">14</strong> Contributions
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline" />
                  <span>
                    <strong className="text-on-surface">1,240</strong> Rep Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 bg-canvas-50 rounded-2xl p-8 lg:p-10 shadow-sm border border-line-200">
              {submitted ? (
                <div className="p-8 bg-surface rounded-xl border border-primary text-center flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[48px]">
                    verified_user
                  </span>
                  <h2 className="font-display-lg text-primary">
                    Discovery Transmitted for AI Verification
                  </h2>
                  <p className="text-body-md text-on-surface-variant max-w-lg">
                    Thank you! Your submission is being analyzed for cartographic accuracy. You have
                    earned +50 Cartographer Points.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-3 bg-primary text-on-primary rounded-xl font-heading-sm transition-colors cursor-pointer"
                  >
                    Submit Another Discovery
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider">
                        Discovery Title
                      </label>
                      <input
                        {...register('title')}
                        type="text"
                        placeholder="e.g., Secret Waterfall at Ella Gap"
                        className="w-full px-4 py-3 bg-surface rounded-lg text-body-md text-on-surface placeholder:text-outline border border-line-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.title && (
                        <p className="text-coral-500 text-body-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider">
                        Category
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['Cultural', 'Nature', 'Beach', 'Dining', 'Stay'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setValue('category', cat);
                            }}
                            className={`px-3.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors cursor-pointer ${
                              selectedCategory === cat
                                ? 'bg-primary text-on-primary font-bold shadow-sm'
                                : 'bg-surface text-on-surface-variant hover:bg-surface-container border border-line-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo Dropzone Preview */}
                  <div className="space-y-2">
                    <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider">
                      Photo Upload & Accessibility Alt Text
                    </label>
                    <div className="border-2 border-dashed border-line-200 rounded-xl p-8 text-center bg-surface hover:bg-surface-container transition-all cursor-pointer relative group">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[24px]">
                            cloud_upload
                          </span>
                        </div>
                        <div>
                          <p className="text-body-md font-medium text-on-surface">
                            Drag and drop photos here, or{' '}
                            <span className="text-primary underline">browse</span>
                          </p>
                          <p className="text-body-sm text-outline mt-1">
                            High-res JPEG, PNG up to 25MB. WCAG compliant alt-text required below.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <input
                        {...register('altText')}
                        type="text"
                        placeholder="Describe the image for screen readers (e.g., A misty green tea plantation at sunrise)..."
                        className="w-full px-4 py-2.5 bg-surface border border-line-200 rounded-lg text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.altText && (
                        <p className="text-coral-500 text-body-sm mt-1">{errors.altText.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Location Coordinate Preview */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider">
                        Location Pin & Coordinates
                      </label>
                      <span className="text-body-sm text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                        <span className="material-symbols-outlined text-[16px]">my_location</span>{' '}
                        Detect GPS Location
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 relative h-40 rounded-xl overflow-hidden shadow-inner border border-line-200">
                        <Image
                          src="/stitch_images/map.png"
                          alt="Location preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[36px] text-coral-500 drop-shadow-md">
                            location_pin
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between bg-surface p-4 rounded-xl border border-line-200">
                        <div>
                          <span className="text-label-sm text-outline uppercase font-semibold">
                            Coordinates
                          </span>
                          <p className="text-body-md font-mono text-on-surface mt-1 font-bold">
                            6.8667° N, 81.0465° E
                          </p>
                          <p className="text-body-sm text-on-surface-variant mt-1">
                            Ella Rock Foothills
                          </p>
                        </div>
                        <button
                          type="button"
                          className="w-full py-2 px-3 bg-canvas-50 hover:bg-surface-container text-on-surface rounded-lg text-body-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-line-200"
                        >
                          <span className="material-symbols-outlined text-[18px]">map</span> Pick on
                          Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Tags */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider mb-2">
                        Discovery Story & Access Notes
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={4}
                        placeholder="Provide context, best times to visit, hidden pathways, or cultural significance..."
                        className="w-full px-4 py-3 bg-surface border border-line-200 rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors.notes && (
                        <p className="text-coral-500 text-body-sm mt-1">{errors.notes.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider mb-2">
                        Tags (Comma Separated)
                      </label>
                      <input
                        {...register('tags')}
                        type="text"
                        placeholder="e.g., waterfall, hidden-gem, sunrise, ceylon-tea"
                        className="w-full px-4 py-3 bg-surface border border-line-200 rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-4 flex items-center justify-between border-t border-line-200">
                    <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px] text-success-600">
                        verified_user
                      </span>
                      <span>Verified by LankaLens AI Integrity Guard</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-heading-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      Publish Discovery
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Side Status Sidebar */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm">
                <h3 className="font-heading-md text-on-surface mb-3">Moderation Guidelines</h3>
                <ul className="space-y-2.5 text-body-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                    <span>High-resolution unedited photos preferred</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                    <span>Exact GPS coordinate pinpoint required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                    <span>Respect sacred and private property boundaries</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
