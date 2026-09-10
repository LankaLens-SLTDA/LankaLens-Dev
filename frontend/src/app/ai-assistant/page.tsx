'use client';

import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  hasCard?: boolean;
  cardData?: {
    title: string;
    type: string;
    desc: string;
    image: string;
    duration: string;
  };
  followUps?: string[];
}

export default function AIAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I've loaded your 10-day Ceylon Highlands & Coast itinerary. I can help you weave in hidden tea estates, adjust mountain train transit times, or suggest atmospheric dining spots along the south coast. What would you like to refine?",
      timestamp: '10:00 AM',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Can you suggest a scenic stop between Kandy and Ella? Preferably something involving tea plantations or mountain waterfalls.',
      timestamp: '10:02 AM',
    },
    {
      id: 3,
      sender: 'ai',
      text: "The journey from Kandy to Ella is one of the world's finest mountain passes. I recommend stopping at Nuwara Eliya for historic colonial architecture and sprawling mist-veiled plantations, followed by a quick trek to Ramboda Falls.",
      timestamp: '10:02 AM',
      hasCard: true,
      cardData: {
        title: 'Damro Labookellie High Tea Estate',
        type: 'Cultural Tea Estate',
        desc: 'Experience high-altitude Ceylon tea picking, factory tours steeped in 19th-century heritage, and panoramic tasting rooms.',
        image: '/stitch_images/planner.png',
        duration: 'Recommended: 3.5 hrs',
      },
      followUps: [
        'Add Nuwara Eliya stop to Day 3 of Itinerary',
        'Show nearby boutique heritage hotels',
        'Check train ticket availability for this stretch',
      ],
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const messageContent = textToSend || inputText;
    if (!messageContent.trim()) return;

    const newUserMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: messageContent,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!textToSend) setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const newAiMsg: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `I've updated your trip parameters based on "${messageContent}". Would you like me to adjust your accommodation bookings or sync this with your offline map?`,
        timestamp: 'Just now',
        followUps: ['Sync with Mapbox offline layer', 'Export PDF itinerary summary'],
      };
      setMessages((prev) => [...prev, newAiMsg]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="w-full pl-20 flex-1 bg-ink-950 text-surface flex flex-col min-h-screen">
        <div className="flex flex-col lg:flex-row flex-1 max-w-[1280px] mx-auto w-full px-6 lg:px-12 py-8 gap-8">
          {/* Left Context Sidebar */}
          <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            <div className="bg-surface/5 p-6 rounded-xl border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-heading-sm text-primary-fixed">Active Itinerary</span>
                <span className="px-2.5 py-1 bg-surface/10 rounded text-label-sm text-sky-300 font-semibold">10 Days</span>
              </div>
              <div>
                <h2 className="font-heading-md text-surface">Ceylon Highlands & Coast</h2>
                <p className="text-body-sm text-outline-variant mt-1">Kandy • Ella • Mirissa • Galle</p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-label-sm text-outline-variant">
                  <span>Trip Completeness</span>
                  <span className="text-sky-300 font-bold">75%</span>
                </div>
                <div className="w-full h-1.5 bg-surface/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-deep-teal-600 to-sky-300" />
                </div>
              </div>
            </div>

            {/* Quick Prompt Starters */}
            <div className="bg-surface/5 p-6 rounded-xl border border-white/10 flex flex-col gap-4">
              <span className="font-heading-sm text-surface">Assistant Capabilities</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSend('Optimize my mountain train schedule from Kandy to Ella')}
                  className="text-left p-3 rounded-lg bg-surface/5 hover:bg-surface/10 transition-colors text-body-sm text-outline-variant hover:text-surface flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-sky-300">train</span>
                  <span>Route Optimization</span>
                </button>
                <button
                  onClick={() => handleSend('Recommend secluded beach villas in Mirissa')}
                  className="text-left p-3 rounded-lg bg-surface/5 hover:bg-surface/10 transition-colors text-body-sm text-outline-variant hover:text-surface flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-sky-300">hotel</span>
                  <span>Accommodation Curations</span>
                </button>
                <button
                  onClick={() => handleSend('What are important cultural etiquette tips when visiting Kandy temple?')}
                  className="text-left p-3 rounded-lg bg-surface/5 hover:bg-surface/10 transition-colors text-body-sm text-outline-variant hover:text-surface flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-sky-300">local_library</span>
                  <span>Cultural Insights</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col justify-between min-h-[640px] bg-surface/5 rounded-2xl p-6 lg:p-8 border border-white/10 shadow-2xl">
            {/* Chat Feed */}
            <div className="flex flex-col gap-8 overflow-y-auto pr-2 pb-6 max-h-[500px] no-scrollbar">
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

                  <div className={`flex flex-col gap-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-heading-sm text-surface">
                        {msg.sender === 'ai' ? 'LankaLens AI' : 'You'}
                      </span>
                      <span className="text-label-sm text-outline-variant">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`text-body-md leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary-container text-on-primary px-5 py-3 rounded-2xl rounded-tr-none'
                          : 'text-surface/90'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Embedded Card */}
                    {msg.hasCard && msg.cardData && (
                      <div className="bg-surface/10 rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10 mt-2">
                        <div className="w-full md:w-48 h-36 relative shrink-0">
                          <Image src={msg.cardData.image} alt={msg.cardData.title} fill className="object-cover" />
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-heading-sm text-surface">{msg.cardData.title}</h4>
                              <span className="text-label-sm text-sky-300 font-medium">{msg.cardData.type}</span>
                            </div>
                            <p className="text-body-sm text-outline-variant mt-1">{msg.cardData.desc}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-label-sm text-surface/70">{msg.cardData.duration}</span>
                            <Link
                              href="/planner"
                              className="px-3 py-1.5 bg-gradient-to-r from-deep-teal-600 to-sky-300 text-on-primary rounded-lg text-label-sm font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              <span>Add to trip</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Follow up chips */}
                    {msg.followUps && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {msg.followUps.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(chip)}
                            className="px-3.5 py-1.5 rounded-full bg-surface/10 hover:bg-surface/20 text-body-sm text-surface transition-colors flex items-center gap-2 border border-white/10 cursor-pointer"
                          >
                            <span>{chip}</span>
                            <span className="material-symbols-outlined text-[14px] text-sky-300">arrow_forward</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
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
                className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-xl font-heading-sm transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
