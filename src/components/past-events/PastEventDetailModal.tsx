'use client';

import React from 'react';
import { 
  X, 
  History, 
  CalendarDays, 
  MapPin, 
  Users, 
  TrendingUp, 
  Quote, 
  Edit3, 
  Sparkles,
  Store,
  Award
} from 'lucide-react';
import { PastEventStory } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface PastEventDetailModalProps {
  event: PastEventStory | null;
  onClose: () => void;
  onEdit?: (event: PastEventStory) => void;
}

export const PastEventDetailModal: React.FC<PastEventDetailModalProps> = ({
  event,
  onClose,
  onEdit
}) => {
  const { currentRole } = useAdmin();

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Full-Screen Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Elevated Modal Container */}
      <div className="relative z-10 modal-glass-container dark:bg-[#161C16] dark:text-[#F7F5F0] rounded-4xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-soft-2xl animate-scaleUp">
        
        {/* Cover Photo Banner */}
        <div className="relative h-64 sm:h-72 overflow-hidden bg-sage-900 rounded-t-4xl">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-sage-950/60 to-charcoal/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlaid Meta */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cream-50/95 text-sage-950 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
                {event.edition}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-medium tracking-wider px-3 py-1 rounded-full">
                {event.city} &bull; {event.dateRange}
              </span>
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Verified Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Verified Footfall
              </span>
              <span className="font-sans text-2xl font-bold text-charcoal">
                {event.footfallNumber.toLocaleString()}+
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Total Brands
              </span>
              <span className="font-sans text-2xl font-bold text-charcoal">
                {event.vendorCount} Stalls
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Vendor Gross Sales
              </span>
              <span className="font-sans text-2xl font-bold text-sage-deep dark:text-sage-300">
                {event.totalRevenueGMV}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Vendor Rating
              </span>
              <span className="font-sans text-2xl font-bold text-amber-600 flex items-center gap-1">
                <Award className="w-5 h-5 text-amber-600" />
                <span>{event.satisfactionRate}</span>
              </span>
            </div>

          </div>

          {/* Story Narrative */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block">
              Curated Event Highlights & Narrative
            </span>
            <p className="text-sm text-charcoal dark:text-charcoal-light leading-relaxed font-medium">
              {event.narrativeExcerpt}
            </p>
          </div>

          {/* Photo Gallery */}
          {event.photos && event.photos.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block mb-3">
                Archived Exhibition Atmosphere Gallery
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {event.photos.map((photo: string, i: number) => (
                  <div key={i} className="h-32 rounded-2xl overflow-hidden border border-sage-200 dark:border-white/10 group">
                    <img
                      src={photo}
                      alt={`Gallery ${i}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block mb-2">
                Event Themes & Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs bg-sage-100 dark:bg-sage-900/60 text-sage-900 dark:text-sage-200 px-3 py-1 rounded-full border border-sage-200 dark:border-white/10 font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-charcoal-muted font-medium">
              Archived Record ID: <strong className="text-charcoal font-mono">{event.id}</strong>
            </span>

            {onEdit && (
              <button
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-2xl bg-sage-800 hover:bg-sage-900 text-cream text-xs font-bold uppercase tracking-wider flex items-center gap-2 glass-rise-btn shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Case Study</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
