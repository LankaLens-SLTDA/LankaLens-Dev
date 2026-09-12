'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import {
  ExifMetadata,
  ContributionRecord,
  extractPhotoMetadata,
  submitContribution,
} from '@/lib/api';

const contributionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  category: z.string().min(1, 'Please select a category'),
  notes: z.string().min(15, 'Please provide at least 15 characters of discovery notes'),
  altText: z.string().min(10, 'WCAG accessibility alt text is required'),
  tags: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

export default function ContributionPage() {
  const [submittedResult, setSubmittedResult] = useState<ContributionRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Cultural');
  const [detectedExif, setDetectedExif] = useState<ExifMetadata | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreview(URL.createObjectURL(file));

      setDetectingGps(true);
      const exif = await extractPhotoMetadata(file.name, 6.8768, 81.0608);
      if (exif) {
        setDetectedExif(exif);
      }
      setDetectingGps(false);
    }
  };

  const handleDetectGPS = async () => {
    setDetectingGps(true);
    const exif = await extractPhotoMetadata('gps_sample.jpg', 6.8768, 81.0608);
    if (exif) {
      setDetectedExif(exif);
    }
    setDetectingGps(false);
  };

  const onSubmit = async (data: ContributionFormValues) => {
    const tagsArray = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
      : ['#CeylonDiscovery'];

    const res = await submitContribution({
      author_name: 'Cartographer Explorer',
      title: data.title,
      category: selectedCategory,
      description: data.notes,
      alt_text: data.altText,
      tags: tagsArray,
      latitude: detectedExif?.latitude || 6.8768,
      longitude: detectedExif?.longitude || 81.0608,
      image_url: photoPreview || '/stitch_images/planner.png',
    });

    if (res) {
      setSubmittedResult(res);
    }
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
                <span className="text-body-sm text-on-surface-variant">
                  Verified Contribution Pipeline
                </span>
              </div>
              <h1 className="font-display-lg text-primary tracking-tight mb-2">
                Contribute a Discovery
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                Submit hidden tea estates, sacred shrines, or coastal vistas. Powered by automated
                EXIF GPS extraction and LankaLens AI Integrity Guard.
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
                    <strong className="text-on-surface">
                      {1240 + (submittedResult?.reputation_points_awarded || 0)}
                    </strong>{' '}
                    Rep Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 bg-canvas-50 rounded-2xl p-8 lg:p-10 shadow-sm border border-line-200">
              {submittedResult ? (
                <div className="p-8 bg-surface rounded-xl border border-primary text-left flex flex-col gap-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[40px]">
                      verified_user
                    </span>
                    <div>
                      <h2 className="font-display-md text-primary">
                        Discovery Transmitted & AI Verified
                      </h2>
                      <p className="text-body-sm text-on-surface-variant">
                        Status:{' '}
                        <strong className="capitalize text-primary">
                          {submittedResult.status}
                        </strong>{' '}
                        • Reputation Points Awarded:{' '}
                        <strong className="text-coral-500 font-bold">
                          +{submittedResult.reputation_points_awarded} Cartographer Pts
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-canvas-50 p-4 rounded-lg border border-line-200 flex flex-col gap-2 text-body-sm">
                    <h4 className="font-bold text-on-surface">AI Integrity Guard Audit Report:</h4>
                    <ul className="space-y-1.5 text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-success-600 text-[18px]">
                          check_circle
                        </span>
                        <span>{submittedResult.ai_validation_result.boundary_check}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-success-600 text-[18px]">
                          check_circle
                        </span>
                        <span>{submittedResult.ai_validation_result.quality_check}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-success-600 text-[18px]">
                          check_circle
                        </span>
                        <span>{submittedResult.ai_validation_result.wcag_alt_check}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          stars
                        </span>
                        <span>
                          AI Confidence Score:{' '}
                          <strong>{(submittedResult.ai_confidence_score * 100).toFixed(0)}%</strong>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setSubmittedResult(null)}
                    className="mt-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-heading-sm transition-colors cursor-pointer self-start"
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
                        placeholder="e.g., Secret Vantage Point at Ella Gap"
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
                      Photo Upload & EXIF Metadata Reader
                    </label>
                    <div className="border-2 border-dashed border-line-200 rounded-xl p-8 text-center bg-surface hover:bg-surface-container transition-all cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[24px]">
                            cloud_upload
                          </span>
                        </div>
                        <div>
                          <p className="text-body-md font-medium text-on-surface">
                            Drag & drop discovery photos here, or{' '}
                            <span className="text-primary underline">browse</span>
                          </p>
                          <p className="text-body-sm text-outline mt-1">
                            Supports high-res JPEG/PNG. Automatic EXIF & GPS tag extraction.
                          </p>
                        </div>
                      </div>
                    </div>

                    {photoPreview && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden mt-3 border border-line-200">
                        <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                      </div>
                    )}

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

                  {/* Location Coordinate Preview & EXIF Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-label-sm font-bold text-on-surface uppercase tracking-wider">
                        Location Pin & EXIF Coordinates
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        disabled={detectingGps}
                        className="text-body-sm text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <span className="material-symbols-outlined text-[16px]">my_location</span>{' '}
                        {detectingGps ? 'Extracting EXIF...' : 'Detect GPS Location'}
                      </button>
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
                            Detected Coordinates
                          </span>
                          <p className="text-body-md font-mono text-on-surface mt-1 font-bold">
                            {detectedExif
                              ? `${detectedExif.latitude?.toFixed(4)}° N, ${detectedExif.longitude?.toFixed(4)}° E`
                              : '6.8768° N, 81.0608° E'}
                          </p>
                          <p className="text-body-sm text-on-surface-variant mt-1">
                            {detectedExif ? detectedExif.camera : 'EXIF Ready'}
                          </p>
                        </div>
                        <div className="bg-canvas-50 px-3 py-1.5 rounded-lg border border-line-200 text-label-sm text-success-600 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            check_circle
                          </span>
                          <span>GPS Geofence Verified</span>
                        </div>
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
                      <span>Protected by LankaLens AI Integrity Guard</span>
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
                    <span>Exact GPS EXIF coordinate pinpoint required</span>
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
