'use client';

import React, { useState } from 'react';
import { 
  History, 
  Plus, 
  MapPin, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Edit3, 
  Trash2, 
  CalendarDays,
  Award
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { PastEventStory } from '../../types';
import { PastEventFormModal } from '../../components/past-events/PastEventFormModal';
import { PastEventDetailModal } from '../../components/past-events/PastEventDetailModal';

export default function PastEventsPage() {
  const { pastEvents, deletePastEvent, currentUser } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<PastEventStory | null>(null);
  const [detailEvent, setDetailEvent] = useState<PastEventStory | null>(null);

  const handleOpenAdd = () => {
    setEventToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: PastEventStory) => {
    setEventToEdit(event);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            PAST EXHIBITIONS
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
            Past Exhibitions
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary glass-rise-btn px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Add Past Event</span>
        </button>
      </div>

      {/* Grid of Past Event Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pastEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => setDetailEvent(event)}
            className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-sage-200/80 dark:border-white/10 hover:-translate-y-2 hover:shadow-soft-xl transition-all duration-300 cursor-pointer"
          >
            <div>
              {/* Cover image & tags */}
              <div className="relative h-56 overflow-hidden bg-sage-900">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-cream-50 dark:bg-white/15 dark:backdrop-blur-md dark:border dark:border-white/20 text-[#33422f] dark:text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs dark:shadow-none">
                    {event.edition}
                  </span>
                  <span className="bg-charcoal/70 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full">
                    {event.city}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-sans text-xl font-bold leading-tight truncate tracking-tight text-white">
                    {event.title}
                  </h3>
                  <span className="text-xs text-cream-200 font-normal flex items-center gap-1 mt-0.5">
                    <CalendarDays className="w-3.5 h-3.5 text-sage-300" />
                    {event.dateRange}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                
                {/* Stats Counters */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-cream-50 dark:bg-white/5 border border-sage-200/70 dark:border-white/10 text-center">
                  <div>
                    <span className="text-[10px] text-charcoal-muted dark:text-cream-200 uppercase tracking-wider block font-bold">
                      Visitors
                    </span>
                    <span className="font-sans text-xs font-bold text-charcoal dark:text-white">
                      {event.footfallNumber.toLocaleString()}+
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted dark:text-cream-200 uppercase tracking-wider block font-bold">
                      Brands
                    </span>
                    <span className="font-sans text-xs font-bold text-charcoal dark:text-white">
                      {event.vendorCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted dark:text-cream-200 uppercase tracking-wider block font-bold">
                      Sales
                    </span>
                    <span className="font-sans text-xs font-bold text-sage-deep dark:text-sage-300">
                      {event.totalRevenueGMV}
                    </span>
                  </div>
                </div>

                {/* Narrative Excerpt */}
                <p className="text-xs text-charcoal-muted dark:text-cream-200 leading-relaxed line-clamp-3 font-medium">
                  {event.narrativeExcerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white dark:bg-white/10 px-2.5 py-0.5 rounded-md border border-sage-200 dark:border-white/10 text-charcoal-light dark:text-cream-100 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between bg-white/40 dark:bg-white/5" onClick={(e) => e.stopPropagation()}>
              <span className="text-[11px] text-sage-800 dark:text-sage-300 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{event.satisfactionRate} Rating</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(event)}
                  className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:text-white/70 dark:hover:text-white transition-colors"
                  title="Edit Event"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {currentUser.permissions.canDeleteRecords && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${event.title}" from portfolio?`)) {
                        deletePastEvent(event.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-charcoal-muted hover:text-rose-700 dark:text-white/70 dark:hover:text-rose-400 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Detail Modal with Full Screen Frosted Glass Blur */}
      <PastEventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onEdit={(e) => handleOpenEdit(e)}
      />

      {/* Modal */}
      <PastEventFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        eventToEdit={eventToEdit}
      />

    </div>
  );
}
