'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Discover', href: '/', icon: 'explore', badge: null },
    { name: 'Map', href: '/map', icon: 'map', badge: 'GPS' },
    { name: 'Planner', href: '/planner', icon: 'event_note', badge: '10D' },
    { name: 'AI Assistant', href: '/ai-assistant', icon: 'auto_awesome', badge: 'AI' },
    { name: 'Community', href: '/community', icon: 'forum', badge: null },
    { name: 'Sustainability', href: '/sustainability', icon: 'security', badge: 'Live' },
    { name: 'Contribute', href: '/contribution', icon: 'add_location_alt', badge: null },
  ];

  const expanded = !isCollapsed || isHovered;

  return (
    <aside
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => isCollapsed && setIsHovered(false)}
      className={`fixed top-0 left-0 h-screen z-50 bg-ink-950/95 backdrop-blur-2xl text-surface border-r border-white/10 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
        expanded ? 'w-64 shadow-[8px_0_30px_rgba(0,0,0,0.5)]' : 'w-20'
      }`}
    >
      {/* Top Section: Brand & Toggle */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-full bg-canvas-0 p-1 flex items-center justify-center shrink-0 shadow-md border border-line-200 overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/stitch_images/logo.png"
                alt="LankaLens Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-heading-lg text-white tracking-tight font-bold whitespace-nowrap"
              >
                LankaLens
              </motion.span>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-surface flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-auto"
            title={isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Sidebar'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Global Quick Search (Expanded Mode Only) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-white/10"
            >
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-outline-variant">
                  <span className="material-symbols-outlined text-[16px]">search</span>
                </span>
                <input
                  type="text"
                  placeholder="Search map or stops..."
                  className="w-full pl-9 pr-3 py-2 bg-surface/10 rounded-lg text-surface placeholder:text-outline-variant text-body-sm focus:outline-none focus:ring-1 focus:ring-sky-300 border border-white/10"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Links */}
        <nav className="p-3 flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-deep-teal-600 to-primary text-white font-bold shadow-md'
                    : 'text-surface/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] shrink-0 ${isActive ? 'text-sky-300' : 'text-surface/70 group-hover:text-white'}`}>
                  {item.icon}
                </span>

                {expanded ? (
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <span className="text-body-sm font-medium whitespace-nowrap">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-white/10 text-sky-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Floating Tooltip in Collapsed Mode */
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-ink-950 text-surface text-label-sm rounded-md shadow-2xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shrink-0 shadow-sm border border-white/20">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          {expanded && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-body-sm font-bold text-white truncate">Explorer Account</span>
              <span className="text-label-sm text-sky-300 truncate">Level 3 Cartographer</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
