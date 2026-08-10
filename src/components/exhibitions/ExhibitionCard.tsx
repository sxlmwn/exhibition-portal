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
  const { deleteExhibition, currentRole } = useAdmin();

  const fillPct = Math.round((exhibition.bookedStallsCount / exhibition.totalStallCapacity) * 100);

  const getStatusBadge = (status: Exhibition['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ongoing':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'completed':
        return 'bg-cream-200 text-charcoal border-sage-300';
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
      className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer group border border-sage-200/80"
    >
      <div>
        {/* Cover Image with Badges */}
        <div className="relative h-52 overflow-hidden bg-sage-100">
          <img
            src={exhibition.coverImage}
            alt={exhibition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-xs ${getStatusBadge(exhibition.status)}`}>
              {exhibition.status}
            </span>
          </div>

          {/* City Pill */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-charcoal text-[11px] font-semibold px-3 py-1 rounded-full border border-sage-200 shadow-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sage-600" />
            <span>{exhibition.city}</span>
          </div>

          {/* Bottom Overlay Title & Category */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] uppercase tracking-wider text-sage-200 font-medium block">
              {exhibition.category}
            </span>
            <h3 className="font-serif text-xl font-bold leading-tight truncate">
              {exhibition.title}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Venue & Date */}
          <div className="space-y-1.5 mb-4 text-xs text-charcoal-muted font-light">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span className="truncate">{exhibition.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>{exhibition.startDate} &rarr; {exhibition.endDate}</span>
            </div>
          </div>

          {/* Stall Capacity Progress Bar */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-sage-200/60 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-charcoal flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-sage-700" />
                Stall Capacity
              </span>
              <span className="font-bold text-sage-deep">
                {exhibition.bookedStallsCount} / {exhibition.totalStallCapacity} ({fillPct}%)
              </span>
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

          {/* Financial Snapshot */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-white/70 border border-sage-100">
              <span className="text-[10px] text-charcoal-muted uppercase tracking-wider block">Stall Revenue</span>
              <span className="font-serif text-sm font-bold text-sage-deep">
                Rs. {(exhibition.stallRevenueBooked / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 border border-sage-100">
              <span className="text-[10px] text-charcoal-muted uppercase tracking-wider block">Funding/Budget</span>
              <span className="font-serif text-sm font-bold text-charcoal">
                Rs. {(exhibition.budgetAllocated / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-6 py-4 border-t border-sage-100 flex items-center justify-between bg-white/40">
        <span className="text-xs font-semibold text-sage-800 flex items-center gap-1 group-hover:text-sage-950">
          <span>Inspect Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(exhibition);
            }}
            className="p-2 rounded-xl hover:bg-sage-100 text-charcoal-muted hover:text-charcoal transition-colors"
            title="Edit Exhibition"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          
          {currentRole !== 'staff' && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-rose-100 text-charcoal-muted hover:text-rose-700 transition-colors"
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
