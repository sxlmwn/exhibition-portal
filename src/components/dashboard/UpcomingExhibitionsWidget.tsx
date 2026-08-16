'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, ArrowRight, Store } from 'lucide-react';
import { Exhibition } from '../../types';

interface UpcomingExhibitionsWidgetProps {
  exhibitions: Exhibition[];
  onSelectExhibition?: (exhibition: Exhibition) => void;
}

export const UpcomingExhibitionsWidget: React.FC<UpcomingExhibitionsWidgetProps> = ({ exhibitions, onSelectExhibition }) => {
  const activeExhibitions = exhibitions.filter(e => e.status !== 'completed').slice(0, 3);

  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block mb-1">
              Active Editions
            </span>
            <h3 className="font-sans text-xl font-bold text-charcoal dark:text-white tracking-tight">
              Upcoming Schedule
            </h3>
          </div>
          <Link
            href="/exhibitions"
            className="text-xs font-bold text-sage-800 dark:text-sage-300 hover:text-sage-950 dark:hover:text-white flex items-center gap-1 transition-colors px-3 py-1 rounded-lg hover:bg-sage-50 dark:hover:bg-white/10"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {activeExhibitions.length > 0 ? (
            activeExhibitions.map((exh) => {
              const fillPct = Math.round((exh.bookedStallsCount / exh.totalStallCapacity) * 100);

              return (
                <div
                  key={exh.id}
                  onClick={() => onSelectExhibition && onSelectExhibition(exh)}
                  className="p-4 rounded-2xl bg-white/75 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-sage-200/60 dark:border-white/10 shadow-2xs glass-rise-row cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-sans text-base font-extrabold text-charcoal dark:text-white leading-snug tracking-tight">
                        {exh.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-charcoal-muted dark:text-white/60 mt-1 font-light">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                          {exh.city}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
                          {exh.startDate}
                        </span>
                      </div>
                    </div>
                    <span className={`status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      fillPct >= 90 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40' 
                        : 'bg-sage-100 dark:bg-sage-800/30 text-sage-800 dark:text-sage-300 border-sage-200 dark:border-sage-700/40'
                    }`}>
                      {fillPct >= 100 ? 'Sold Out' : `${exh.daysLeft || 14}d Left`}
                    </span>
                  </div>

                  {/* Stall Fill Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-charcoal-light dark:text-white/80 font-medium flex items-center gap-1">
                        <Store className="w-3 h-3 text-sage-600 dark:text-sage-400" />
                        Capacity: {exh.bookedStallsCount}/{exh.totalStallCapacity}
                      </span>
                      <span className="font-bold text-sage-deep dark:text-sage-300">{fillPct}% Booked</span>
                    </div>
                    <div className="w-full h-2 bg-cream-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fillPct >= 90 ? 'bg-amber-600' : 'bg-sage-600'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-charcoal-muted dark:text-white/60 font-light">
              No active editions scheduled yet.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between text-xs text-charcoal-muted dark:text-white/60">
        <span>{activeExhibitions.length} edition{activeExhibitions.length === 1 ? '' : 's'} scheduled for 2026</span>
        <Link href="/exhibitions" className="font-semibold text-sage-800 dark:text-sage-300 hover:underline">
          + Add Edition
        </Link>
      </div>
    </div>
  );
};
