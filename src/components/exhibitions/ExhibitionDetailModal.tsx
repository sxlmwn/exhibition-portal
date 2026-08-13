'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, 
  CalendarDays, 
  MapPin, 
  Store, 
  Receipt, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Exhibition } from '../../types';
import { useAdmin } from '../../context/AdminContext';

import { ModalPortal } from '../common/ModalPortal';

interface ExhibitionDetailModalProps {
  exhibition: Exhibition | null;
  onClose: () => void;
}

export const ExhibitionDetailModal: React.FC<ExhibitionDetailModalProps> = ({
  exhibition,
  onClose
}) => {
  const { vendorRequests, stalls } = useAdmin();

  if (!exhibition) return null;

  const linkedRequests = vendorRequests.filter(r => r.exhibitionId === exhibition.id);
  const exhibitionStalls = stalls.filter(s => s.exhibitionId === exhibition.id);
  const availableStalls = exhibitionStalls.filter(s => s.status === 'available');

  const fillPct = Math.round((exhibition.bookedStallsCount / exhibition.totalStallCapacity) * 100);
  const netMargin = exhibition.stallRevenueBooked - exhibition.totalExpensesLogged;

  return (
    <ModalPortal isOpen={!!exhibition} onClose={onClose} maxWidthClass="max-w-4xl">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto shadow-soft-2xl">
        
        {/* Visual Cover Banner */}
        <div className="relative h-64 overflow-hidden bg-sage-900 rounded-t-4xl">
          <img
            src={exhibition.coverImage}
            alt={exhibition.title}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-sage-950/75 to-charcoal/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlaid Title & Meta */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cream-50 dark:bg-white/15 dark:backdrop-blur-md dark:border dark:border-white/20 text-[#33422f] dark:text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md dark:shadow-none">
                {exhibition.category}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-medium tracking-wider px-3 py-1 rounded-full">
                {exhibition.city}
              </span>
            </div>
            <div className="inline-block dark:bg-white/10 dark:backdrop-blur-xl dark:border dark:border-white/15 rounded-2xl px-4 py-2.5 -ml-4 dark:shadow-lg">
              <h2
                className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.65)' }}
              >
                {exhibition.title}
              </h2>
              <p
                className="text-xs sm:text-sm text-cream-100 font-normal mt-1 max-w-2xl"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
              >
                {exhibition.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-3xl bg-cream-50 dark:bg-white/[0.06] border border-sage-200/70 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-sage-800 uppercase tracking-wider mb-2">
                <Store className="w-4 h-4 text-sage-700" />
                <span>Stalls Booked</span>
              </div>
              <span className="font-sans text-3xl font-extrabold text-charcoal tracking-tight">
                {exhibition.bookedStallsCount} / {exhibition.totalStallCapacity}
              </span>
              <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-sage-600 rounded-full"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <span className="text-[11px] text-charcoal-muted mt-1.5 block">
                {availableStalls.length > 0 ? `${availableStalls.length} stalls available` : 'Sold out'}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-cream-50 dark:bg-white/[0.06] border border-sage-200/70 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-sage-800 uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4 text-sage-700" />
                <span>Total Revenue</span>
              </div>
              <span className="font-sans text-3xl font-extrabold text-sage-deep tracking-tight">
                Rs. {(exhibition.stallRevenueBooked / 100000).toFixed(1)}L
              </span>
              <span className="text-[11px] text-charcoal-muted mt-3 block">
                Goal: Rs. {((exhibition.totalStallCapacity * 85000) / 100000).toFixed(1)}L
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-cream-50 dark:bg-white/[0.06] border border-sage-200/70 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-sage-800 uppercase tracking-wider mb-2">
                <Receipt className="w-4 h-4 text-sage-700" />
                <span>Net Profit</span>
              </div>
              <span className={`font-sans text-3xl font-extrabold tracking-tight ${netMargin >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                Rs. {(netMargin / 100000).toFixed(1)}L
              </span>
              <span className="text-[11px] text-charcoal-muted mt-3 block">
                Total Costs: Rs. {(exhibition.totalExpensesLogged / 100000).toFixed(1)}L
              </span>
            </div>

          </div>

          {/* Description & Logistics */}
          <div>
            <h4 className="font-sans text-lg font-bold text-charcoal dark:text-white mb-2 tracking-tight">
              About this Exhibition
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-muted dark:text-white/75 font-normal leading-relaxed p-4 rounded-2xl bg-white dark:bg-white/[0.06] border border-sage-100 dark:border-white/10">
              {exhibition.description}
            </p>
          </div>

          {/* Linked Vendor Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-sans text-lg font-bold text-charcoal dark:text-white flex items-center gap-2 tracking-tight">
                <Users className="w-4 h-4 text-sage-700" />
                <span>Vendors ({linkedRequests.length})</span>
              </h4>
              <Link
                href="/requests"
                onClick={onClose}
                className="text-xs font-semibold text-sage-800 hover:underline flex items-center gap-1"
              >
                <span>View Floor Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {linkedRequests.length > 0 ? (
              <div className="space-y-2.5">
                {linkedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-2xl bg-cream-50/70 dark:bg-white/[0.05] border border-sage-200/60 dark:border-white/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-charcoal dark:text-white">{req.brandName}</span>
                      <span className="text-charcoal-muted ml-2">({req.vendorName} &bull; {req.phone})</span>
                      <span className="block text-[11px] text-sage-800 mt-0.5">{req.productCategory}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                        req.status === 'approved' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40' 
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40'
                      }`}>
                        {req.status}
                      </span>
                      {req.allocatedStallCode && (
                        <span className="block text-[11px] font-sans font-extrabold text-sage-deep mt-1">
                          Slot {req.allocatedStallCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-cream-50 text-center text-xs text-charcoal-muted">
                No vendors linked to this exhibition yet.
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-sage-100 flex items-center justify-between">
            <span className="text-xs text-charcoal-muted">
              Venue: <strong>{exhibition.venue}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider"
              >
                Close
              </button>
              <Link
                href="/requests"
                onClick={onClose}
                className="btn-primary px-7 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Manage Stalls</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
};
