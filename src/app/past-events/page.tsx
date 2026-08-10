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

export default function PastEventsPage() {
  const { pastEvents, deletePastEvent } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<PastEventStory | null>(null);

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
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Track Record & Case Studies
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
            Past Events & Portfolio Editor
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
            className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between group border border-sage-200/80 hover:-translate-y-2 hover:shadow-soft-xl transition-all duration-300"
          >
            <div>
              {/* Cover image & tags */}
              <div className="relative h-56 overflow-hidden bg-sage-900">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-cream-50/95 backdrop-blur-md text-sage-900 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    {event.edition}
                  </span>
                  <span className="bg-charcoal/70 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full">
                    {event.city}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-sans text-xl font-extrabold leading-tight tracking-tight">
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
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-cream-50 border border-sage-200/70 text-center">
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Footfall</span>
                    <span className="font-sans text-sm font-extrabold text-charcoal">
                      {(event.footfallNumber / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="border-x border-sage-200">
                    <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">Vendors</span>
                    <span className="font-sans text-sm font-extrabold text-charcoal">
                      {event.vendorCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">GMV Sales</span>
                    <span className="font-sans text-sm font-extrabold text-sage-deep">
                      {event.totalRevenueGMV}
                    </span>
                  </div>
                </div>

                {/* Narrative excerpt */}
                <p className="text-xs text-charcoal-muted font-light leading-relaxed">
                  "{event.narrativeExcerpt}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white px-2.5 py-0.5 rounded-md border border-sage-200 text-charcoal-light font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-sage-100 flex items-center justify-between bg-white/40">
              <span className="text-[11px] text-sage-800 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{event.satisfactionRate} Satisfaction</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(event)}
                  className="p-2 rounded-xl hover:bg-sage-100 text-charcoal-muted hover:text-charcoal transition-colors"
                  title="Edit Story"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${event.title}" from portfolio?`)) {
                      deletePastEvent(event.id);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-rose-100 text-charcoal-muted hover:text-rose-700 transition-colors"
                  title="Delete Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      <PastEventFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        eventToEdit={eventToEdit}
      />

    </div>
  );
}
