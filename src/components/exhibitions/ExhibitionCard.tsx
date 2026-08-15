'use client';

import React from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Store, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  DollarSign,
  Users
} from 'lucide-react';
import { Exhibition } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onEdit: (exhibition: Exhibition) => void;
  onViewDetails: (exhibition: Exhibition) => void;
}

export const ExhibitionCard: React.FC<ExhibitionCardProps> = ({
  exhibition,
  onEdit,
  onViewDetails
}) => {
  const { deleteExhibition, currentUser } = useAdmin();

  const fillPct = Math.round((exhibition.bookedStallsCount / exhibition.totalStallCapacity) * 100);

  const getStatusBadge = (status: Exhibition['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80';
      case 'ongoing':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700/80';
      case 'completed':
        return 'bg-cream-200 dark:bg-white/10 text-charcoal dark:text-white border-sage-300 dark:border-white/10';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${exhibition.title}"?`)) {
      deleteExhibition(exhibition.id);
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(exhibition)}
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group border border-sage-200/80 dark:border-white/10 hover:border-sage-400 dark:hover:border-white/25 hover:shadow-soft-md transition-all duration-200"
    >
      <div>
        {/* Cover Image with Badges */}
        <div className="relative h-52 overflow-hidden bg-sage-900">
          <img
            src={exhibition.coverImage}
            alt={exhibition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-xs ${getStatusBadge(exhibition.status)}`}>
              {exhibition.status}
            </span>
          </div>

          {/* City Pill */}
          <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md text-charcoal dark:text-white text-[11px] font-bold px-3 py-1 rounded-full border border-sage-200 dark:border-white/10 shadow-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sage-600 dark:text-sage-400" />
            <span>{exhibition.city}</span>
          </div>

          {/* Bottom Overlay Title & Category */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] uppercase tracking-wider text-sage-300 font-bold block mb-0.5">
              {exhibition.category}
            </span>
            <h3 className="font-sans text-xl font-bold leading-tight truncate tracking-tight text-white">
              {exhibition.title}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Venue & Date */}
          <div className="space-y-1 text-xs text-charcoal-muted font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sage-700 dark:text-sage-400 shrink-0" />
              <span className="truncate text-charcoal dark:text-gray-200">{exhibition.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-sage-700 dark:text-sage-400 shrink-0" />
              <span className="text-charcoal-muted">{exhibition.startDate} &rarr; {exhibition.endDate}</span>
            </div>
          </div>

          {/* Stall Capacity Progress Bar (Clean Inset) */}
          <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/[0.04] border border-sage-200/60 dark:border-white/[0.08]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-charcoal dark:text-white flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-sage-700 dark:text-sage-400" />
                <span>Stalls Booked</span>
              </span>
              <span className="font-extrabold text-sage-deep dark:text-sage-300">
                {exhibition.bookedStallsCount} / {exhibition.totalStallCapacity} ({fillPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-cream-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPct >= 90 ? 'bg-amber-600' : 'bg-sage-600 dark:bg-sage-500'
                }`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>

          {/* Financial Snapshot (Clean High-Contrast Insets) */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-sage-200/60 dark:border-white/[0.08]">
              <span className="text-[10px] text-charcoal-muted uppercase tracking-wider block font-bold mb-0.5">
                Revenue
              </span>
              <span className="font-sans text-base font-bold text-sage-deep dark:text-sage-300">
                Rs. {(exhibition.stallRevenueBooked / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-sage-200/60 dark:border-white/[0.08]">
              <span className="text-[10px] text-charcoal-muted uppercase tracking-wider block font-bold mb-0.5">
                Budget
              </span>
              <span className="font-sans text-base font-bold text-charcoal dark:text-white">
                Rs. {(exhibition.budgetAllocated / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-6 py-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/[0.02]">
        <span className="text-xs font-bold text-sage-800 dark:text-sage-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(exhibition);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-sage-200 dark:border-white/10 hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Edit Exhibition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          
          {currentUser.permissions.canDeleteRecords && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-charcoal-muted hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
              title="Delete Exhibition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
