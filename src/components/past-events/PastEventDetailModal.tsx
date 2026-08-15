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
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { PastEventStory } from '../../types';
import { useAdmin } from '../../context/AdminContext';

import { ModalPortal } from '../common/ModalPortal';

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
    <ModalPortal isOpen={!!event} onClose={onClose} maxWidthClass="max-w-4xl">
      {/* Elevated Modal Container */}
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto shadow-soft-2xl">
        
        {/* Cover Photo Banner */}
        <div className="relative h-64 sm:h-72 overflow-hidden bg-sage-900 rounded-t-4xl">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-sage-950/75 to-charcoal/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlaid Meta */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cream-50 dark:bg-white/15 dark:backdrop-blur-md dark:border dark:border-white/20 text-[#2b3a26] dark:text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md dark:shadow-none">
                {event.edition}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-medium tracking-wider px-3 py-1 rounded-full">
                {event.city} &bull; {event.dateRange}
              </span>
              <span className={`flex items-center gap-1 text-[11px] font-medium tracking-wider px-3 py-1 rounded-full backdrop-blur-md ${
                event.isPublished 
                  ? 'bg-emerald-500/80 text-white' 
                  : 'bg-slate-500/60 text-white'
              }`}>
                {event.isPublished ? (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Draft</span>
                  </>
                )}
              </span>
            </div>
            <div className="inline-block dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/15 rounded-2xl px-4 py-2.5 -ml-4 dark:shadow-lg">
              <h2
                className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-white"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.65)' }}
              >
                {event.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Verified Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-cream-200 block mb-1">
                Verified Footfall
              </span>
              <span className="font-sans text-2xl font-bold text-charcoal dark:text-white">
                {event.footfallNumber.toLocaleString()}+
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-cream-200 block mb-1">
                Total Brands
              </span>
              <span className="font-sans text-2xl font-bold text-charcoal dark:text-white">
                {event.vendorCount} Stalls
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-cream-200 block mb-1">
                Vendor Gross Sales
              </span>
              <span className="font-sans text-2xl font-bold text-sage-deep dark:text-sage-300">
                {event.totalRevenueGMV}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-cream-200 block mb-1">
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
            <p className="text-sm text-charcoal dark:text-cream-100 leading-relaxed font-medium">
              {event.narrativeExcerpt}
            </p>
          </div>

          {/* Testimonial Quote */}
          {event.quoteText && (
            <div className="p-4 sm:p-5 rounded-2xl bg-cream-50/80 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <div className="flex gap-3">
                <Quote className="w-5 h-5 text-sage-600 dark:text-sage-400 shrink-0 mt-0.5 rotate-180" />
                <div>
                  <p className="text-xs sm:text-sm text-charcoal dark:text-cream-100 italic font-medium leading-relaxed mb-2">
                    &ldquo;{event.quoteText}&rdquo;
                  </p>
                  {(event.quoteAuthor || event.quoteBrand) && (
                    <div className="text-xs text-charcoal-muted dark:text-cream-200/80">
                      {event.quoteAuthor && <strong className="text-charcoal dark:text-white font-semibold">{event.quoteAuthor}</strong>}
                      {event.quoteAuthor && event.quoteBrand && ' • '}
                      {event.quoteBrand && <span>{event.quoteBrand}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
              Record ID: <strong className="text-charcoal font-mono">{event.id}</strong>
            </span>

            {onEdit && (
              <button
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-lg bg-sage-800 hover:bg-sage-900 text-cream text-xs font-bold uppercase tracking-wider flex items-center gap-2 glass-rise-btn shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
