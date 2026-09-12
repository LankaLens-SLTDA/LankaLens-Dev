'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function PlannerPage() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [days, setDays] = useState([
    { id: 1, title: 'Colombo Arrival & Coastal Heritage', stopsCount: 3, duration: '4.5 hrs' },
    { id: 2, title: 'Sigiriya Rock Fortress & Dambulla', stopsCount: 4, duration: '6.0 hrs' },
    { id: 3, title: 'Kandy Temple of Tooth & Tea Gardens', stopsCount: 3, duration: '5.0 hrs' },
    { id: 4, title: 'Nuwara Eliya High Peaks Train', stopsCount: 2, duration: '3.5 hrs' },
    { id: 5, title: 'Ella Nine Arch Bridge & Ravana Falls', stopsCount: 4, duration: '6.5 hrs' },
  ]);

  // Recharts Budget breakdown data
  const budgetData = [
    { name: 'Stay', cost: 450, color: '#0F5C56' },
    { name: 'Transport', cost: 220, color: '#8FD3D6' },
    { name: 'Activities', cost: 310, color: '#E08A2C' },
    { name: 'Dining', cost: 180, color: '#5E2E19' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1">
        <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-12 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-label-sm uppercase tracking-widest text-primary font-semibold">
                  Itinerary Builder
                </span>
                <span className="text-line-200">/</span>
                <span className="text-label-sm text-on-surface-variant">10-Day Ceylon Odyssey</span>
              </div>
              <h1 className="font-display-lg text-on-surface">Curate Your Journey</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-canvas-50 text-on-surface hover:bg-surface-container rounded-lg text-body-sm font-medium transition-colors flex items-center gap-2 border border-line-200">
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share Trip</span>
              </button>
              <Link
                href="/ai-assistant"
                className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-body-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                <span>AI Optimize Route</span>
              </Link>
            </div>
          </div>

          {/* Planner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Timeline Sidebar (Col Span 3) */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 px-1 font-semibold">
                Daily Timeline
              </div>
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group border ${
                    activeDay === day.id
                      ? 'bg-primary-container text-on-primary border-primary font-semibold shadow-sm'
                      : 'bg-canvas-50 hover:bg-surface-container text-on-surface border-line-200'
                  }`}
                >
                  <div>
                    <div
                      className={`text-label-sm uppercase ${activeDay === day.id ? 'opacity-80' : 'text-outline'}`}
                    >
                      Day 0{day.id}
                    </div>
                    <div className="font-heading-sm mt-0.5">{day.title}</div>
                  </div>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              ))}
              <button
                onClick={() =>
                  setDays((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      title: `Day ${prev.length + 1} Scenic Route`,
                      stopsCount: 2,
                      duration: '4.0 hrs',
                    },
                  ])
                }
                className="w-full py-3 px-4 border border-dashed border-outline-variant hover:border-primary text-primary rounded-xl text-body-sm font-semibold flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Day 0{days.length + 1}</span>
              </button>
            </div>

            {/* Schedule Items Column (Col Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="font-heading-md text-on-surface">
                    Day {activeDay}: {days.find((d) => d.id === activeDay)?.title}
                  </h2>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    3 activities scheduled • {days.find((d) => d.id === activeDay)?.duration} total
                    travel
                  </p>
                </div>
                <button className="text-body-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add activity</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Activity Item 1 */}
                <div className="p-4 bg-canvas-50 rounded-xl relative group transition-all hover:shadow-sm border border-line-200">
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab text-outline hover:text-on-surface pt-1">
                      <span className="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div className="w-16 h-16 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                      <Image
                        src="/stitch_images/discover.png"
                        alt="Activity thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm text-primary font-bold">
                          09:00 AM • 2 hrs
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-outline hover:text-on-surface rounded">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-1 text-outline hover:text-coral-500 rounded">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading-sm text-on-surface truncate mt-0.5">
                        Heritage Walk & Monument Inspection
                      </h3>
                      <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                        Stroll through colonial corridors & archaeological landmarks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-8 py-1 text-body-sm text-outline">
                  <div className="h-4 w-px bg-line-200 ml-2" />
                  <span className="material-symbols-outlined text-[16px]">directions_car</span>
                  <span>Auto-suggest: 35 min drive via Central Highway (18.4 km)</span>
                </div>

                {/* Activity Item 2 */}
                <div className="p-4 bg-canvas-50 rounded-xl relative group transition-all hover:shadow-sm border border-line-200">
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab text-outline hover:text-on-surface pt-1">
                      <span className="material-symbols-outlined">drag_indicator</span>
                    </div>
                    <div className="w-16 h-16 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                      <Image
                        src="/stitch_images/planner.png"
                        alt="Activity thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-label-sm text-primary font-bold">
                          01:30 PM • 3 hrs
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-outline hover:text-on-surface rounded">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-1 text-outline hover:text-coral-500 rounded">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading-sm text-on-surface truncate mt-0.5">
                        Spice Tasting & Local Market Trail
                      </h3>
                      <p className="text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                        Immersive aromatic walk through historical trading alleys.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget & Analytics Sidebar (Col Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-canvas-50 p-6 rounded-2xl border border-line-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading-md text-on-surface">Estimated Budget</h3>
                  <span className="text-label-sm bg-surface-container px-2.5 py-1 rounded-full font-bold text-primary">
                    $1,160 Total
                  </span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <XAxis dataKey="name" stroke="#6f7977" fontSize={12} />
                      <YAxis stroke="#6f7977" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                        {budgetData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-line-200">
                  {budgetData.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-body-sm">
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.color }}
                        />
                        {b.name}
                      </span>
                      <strong className="text-on-surface font-semibold">${b.cost}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Itinerary Recommendations */}
              <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-md flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sky-300 font-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>AI Smart Travel Suggestion</span>
                </div>
                <h4 className="font-heading-sm">Highland Train Ticket Warning</h4>
                <p className="text-body-sm text-on-primary-container leading-relaxed">
                  First-class observation carriage seats for Kandy → Ella sell out 30 days in
                  advance. Would you like us to add auto-booking alerts?
                </p>
                <button className="bg-secondary hover:bg-secondary-container text-on-secondary py-2 px-4 rounded-lg font-label-sm font-semibold mt-2 transition-colors cursor-pointer text-center">
                  Enable Train Booking Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
