'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DropdownBusinessItem {
  name: string;
  href: string;
  tagline?: string;
  description?: string;
}

const defaultItems: DropdownBusinessItem[] = [
  {
    name: 'Digital & Growth',
    href: '/businesses/digital-growth',
    tagline: 'Brand strategy, web development & SEO dominance',
    description: 'Brand strategy, web development & SEO dominance',
  },
  {
    name: 'Technology',
    href: '/businesses/technology',
    tagline: 'Custom software platforms, web & mobile applications',
    description: 'Custom software platforms, web & mobile applications',
  },
  {
    name: 'Talent Solutions',
    href: '/businesses/talent-solutions',
    tagline: 'Dedicated engineering pods, direct hire & staffing',
    description: 'Dedicated engineering pods, direct hire & staffing',
  },
  {
    name: 'AI and Intellegence',
    href: '/businesses/ai-and-intellegence',
    tagline: 'something something something something',
    description: 'something something something something',
  },
];

let cachedBusinessItems: DropdownBusinessItem[] = defaultItems;

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [businessItems, setBusinessItems] = useState<DropdownBusinessItem[]>(cachedBusinessItems);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/businesses')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          cachedBusinessItems = json.data;
          setBusinessItems(json.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching dynamic business items for MegaMenu:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const columnCount = Math.max(1, Math.ceil(businessItems.length / 3));

  // Chunk businessItems into columns with at most 3 items each
  const columns: DropdownBusinessItem[][] = [];
  for (let i = 0; i < businessItems.length; i += 3) {
    columns.push(businessItems.slice(i, i + 3));
  }

  const getPositionAndWidth = () => {
    if (columnCount === 1) {
      return 'left-0 sm:left-1/2 sm:-translate-x-1/2 w-[340px] sm:w-[380px]';
    }
    if (columnCount === 2) {
      return 'left-0 sm:-left-12 md:-left-16 w-[680px] sm:w-[740px]';
    }
    return 'left-0 sm:-left-24 md:-left-36 w-[980px] sm:w-[1060px]';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="megamenu-panel"
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-full ${getPositionAndWidth()} max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto mt-2.5 p-2 rounded-2xl bg-white dark:bg-[#0B101B] border border-slate-200 dark:border-white/10 shadow-[0_15px_35px_-5px_rgba(15,23,42,0.12),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] z-50 before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3`}
        >
          {/* Horizontal multi-column layout: 3 elements per column */}
          <div className={`flex flex-row items-start ${columns.length > 1 ? 'gap-2' : 'gap-0'}`}>
            {columns.map((colItems, colIdx) => (
              <div key={colIdx} className="flex-1 min-w-[300px] sm:min-w-[340px] space-y-1 shrink-0">
                {colItems.map((item) => {
                  const subtitle = item.tagline || item.description;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        analytics.trackCtaClick(`MegaMenu: ${item.name}`, 'MegaMenu', item.href);
                        onClose();
                      }}
                      className="group block p-3 rounded-xl transition-all duration-150 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight group-hover:text-rose-600 dark:group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-rose-600 dark:group-hover:text-white transition-all shrink-0" />
                      </div>
                      {subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-1 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">
                          {subtitle}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
