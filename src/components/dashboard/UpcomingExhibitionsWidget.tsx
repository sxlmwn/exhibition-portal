'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, ArrowRight, Store } from 'lucide-react';
import { Exhibition } from '../../types';

interface UpcomingExhibitionsWidgetProps {
  exhibitions: Exhibition[];
}

export const UpcomingExhibitionsWidget: React.FC<UpcomingExhibitionsWidgetProps> = ({ exhibitions }) => {
  const activeExhibitions = exhibitions.filter(e => e.status !== 'completed').slice(0, 3);

  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
              Active Editions
            </span>
            <h3 className="font-sans text-xl font-black text-charcoal tracking-tight">
              Upcoming Schedule
            </h3>
          </div>
          <Link
            href="/exhibitions"
            className="text-xs font-bold text-sage-800 hover:text-sage-950 flex items-center gap-1 transition-colors glass-rise-btn px-3 py-1 rounded-full hover:bg-white"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {activeExhibitions.map((exh) => {
            const fillPct = Math.round((exh.bookedStallsCount / exh.totalStallCapacity) * 100);

            return (
              <div
                key={exh.id}
                className="p-4 rounded-2xl bg-white/75 hover:bg-white border border-sage-200/60 shadow-2xs glass-rise-row"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-sans text-base font-extrabold text-charcoal leading-snug tracking-tight">
                      {exh.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-charcoal-muted mt-1 font-light">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sage-600" />
                        {exh.city}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-sage-600" />
                        {exh.startDate}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                    fillPct >= 90 
                      ? 'bg-amber-100 text-amber-900 border-amber-300' 
                      : 'bg-sage-100 text-sage-800 border-sage-200'
                  }`}>
                    {fillPct >= 100 ? 'Sold Out' : `${exh.daysLeft || 14}d Left`}
                  </span>
                </div>

                {/* Stall Fill Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-charcoal-light font-medium flex items-center gap-1">
                      <Store className="w-3 h-3 text-sage-600" />
                      Capacity: {exh.bookedStallsCount}/{exh.totalStallCapacity}
                    </span>
                    <span className="font-bold text-sage-deep">{fillPct}% Booked</span>
                  </div>
                  <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
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
          })}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-sage-100 flex items-center justify-between text-xs text-charcoal-muted">
        <span>3 editions scheduled for 2026</span>
        <Link href="/exhibitions" className="font-semibold text-sage-800 hover:underline">
          + Add Edition
        </Link>
      </div>
    </div>
  );
};
