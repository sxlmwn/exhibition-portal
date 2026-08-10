'use client';

import React from 'react';
import { 
  X, 
  Store, 
  User, 
  Phone, 
  Mail, 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  Building
} from 'lucide-react';
import { VendorRequest, RequestStatus } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface RequestDetailModalProps {
  request: VendorRequest | null;
  onClose: () => void;
  onOpenAction?: (status: RequestStatus) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onOpenAction
}) => {
  const { updateRequestStatus, currentRole } = useAdmin();

  if (!request) return null;

  const handleStatusChange = (status: RequestStatus) => {
    updateRequestStatus(request.id, status);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          label: request.allocatedStallCode ? `Approved (Stall ${request.allocatedStallCode})` : 'Approved'
        };
      case 'rejected':
        return {
          bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700',
          label: 'Rejected'
        };
      case 'waitlisted':
        return {
          bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700',
          label: 'Waitlisted'
        };
      default:
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          label: 'Pending Review'
        };
    }
  };

  const statusBadge = getStatusBadge(request.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Full-Screen Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Elevated Modal Card */}
      <div className="relative z-10 modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 flex items-center justify-center text-sage-800 dark:text-sage-300 font-bold text-lg">
              {request.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-sage-200 dark:border-white/10 text-sage-800 dark:text-sage-300">
                  {request.productCategory}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                {request.brandName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          
          {/* Target Exhibition Info */}
          <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block mb-1">
              Target Exhibition & Stall Preference
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-sm text-charcoal">
                {request.exhibitionName}
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-muted">
                <span>Tier: <strong className="text-charcoal uppercase">{request.stallTierPreference}</strong></span>
                <span>&bull;</span>
                <span>Wanted: <strong className="text-charcoal">{request.stallsWanted} Stall(s)</strong></span>
                {request.allocatedStallCode && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                    Slot: {request.allocatedStallCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block">
                Primary Contact
              </span>
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <User className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>{request.vendorName}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <Mail className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <a href={`mailto:${request.email}`} className="hover:underline text-charcoal font-medium">
                  {request.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <Phone className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <a href={`tel:${request.phone}`} className="hover:underline text-charcoal font-medium">
                  {request.phone}
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block">
                Financial Scope & Meta
              </span>
              <div className="flex items-center gap-2 text-charcoal">
                <Tag className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Budget: <strong className="font-bold">{request.budgetRange}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <CalendarDays className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Submitted on: <strong className="text-charcoal">{request.submittedDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <Store className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Request ID: <strong className="text-charcoal font-mono">{request.id}</strong></span>
              </div>
            </div>

          </div>

          {/* Description & Notes */}
          {request.notes && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Vendor Application Notes & Special Requests
              </span>
              <p className="text-xs text-charcoal leading-relaxed font-medium">
                {request.notes}
              </p>
            </div>
          )}

          {/* Direct WhatsApp Action */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                  Quick WhatsApp Exhibitor Desk
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                  Dispatch instant booth confirmation or stall details.
                </span>
              </div>
            </div>
            <a
              href={`https://wa.me/${request.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${request.vendorName}, regarding your stall application for "${request.brandName}" at ${request.exhibitionName}...`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all glass-rise-btn flex items-center gap-1.5"
            >
              <span>Chat WhatsApp</span>
            </a>
          </div>

          {/* Status Changer Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10">
            <span className="text-xs uppercase tracking-wider font-bold text-charcoal-muted block mb-3">
              Application Decision & Status
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleStatusChange('approved')}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  request.status === 'approved'
                    ? 'bg-emerald-700 text-white shadow-soft'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => handleStatusChange('waitlisted')}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  request.status === 'waitlisted'
                    ? 'bg-purple-700 text-white shadow-soft'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Waitlist</span>
              </button>

              <button
                onClick={() => handleStatusChange('rejected')}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  request.status === 'rejected'
                    ? 'bg-rose-700 text-white shadow-soft'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => handleStatusChange('pending')}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  request.status === 'pending'
                    ? 'bg-amber-600 text-white shadow-soft'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <span>Pending</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
