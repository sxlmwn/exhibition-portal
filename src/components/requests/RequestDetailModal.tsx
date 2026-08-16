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
import { ModalPortal } from '../common/ModalPortal';

import { isFollowUpNeeded, getPendingDays, FOLLOW_UP_THRESHOLD_DAYS } from '../../lib/followUp';
import { AlternativeStallsModal } from './AlternativeStallsModal';

interface RequestDetailModalProps {
  request: VendorRequest | null;
  onClose: () => void;
  onOpenAction?: (status: RequestStatus) => void;
  onAllocateStallClick?: (request: VendorRequest) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onOpenAction,
  onAllocateStallClick
}) => {
  const { updateRequestStatus, exhibitions, stalls, allocateStall, currentUser } = useAdmin();
  const isOwner = currentUser.permissions.canApproveRequests || currentUser.role === 'owner';
  const [isAlternativesOpen, setIsAlternativesOpen] = React.useState(false);

  if (!request) return null;

  const targetExhibition = exhibitions.find(e => e.id === request.exhibitionId);

  // Look up specifically requested stall if applicable
  const requestedStall = stalls.find(
    s => (request.requestedStallId && s.id === request.requestedStallId) ||
         (request.preferredStallCode && s.code === request.preferredStallCode)
  );
  const isRequestedStallAvailable = requestedStall ? requestedStall.status === 'available' : false;

  const handleAssignRequestedStall = () => {
    if (!requestedStall || !isRequestedStallAvailable) return;
    allocateStall(requestedStall.id, request.id, request.vendorName, request.brandName);
    updateRequestStatus(request.id, 'approved', requestedStall.code);
  };

  const handleStatusChange = (status: RequestStatus) => {
    if (!isOwner) return;
    updateRequestStatus(request.id, status);
  };

  const getStatusBadge = (status: VendorRequest['status']) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          label: 'Approved'
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
    <ModalPortal isOpen={!!request} onClose={onClose} maxWidthClass="max-w-2xl">
      {/* Elevated Modal Card */}
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 flex items-center justify-center text-sage-800 dark:text-sage-300 font-bold text-lg">
              {request.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {request.referenceId && (
                  <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cream-200 dark:bg-white/10 text-charcoal dark:text-white border border-sage-200 dark:border-white/15">
                    {request.referenceId}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-sage-200 dark:border-white/10 text-sage-800 dark:text-sage-300">
                  {request.productCategory}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-charcoal dark:text-white tracking-tight">
                {request.brandName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          
          {/* Target Exhibition Info */}
          <div className="p-4 rounded-3xl bg-cream-50 dark:bg-white/[0.03] border border-sage-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-sage-700 dark:text-sage-300 shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block">
                  Target Exhibition Edition
                </span>
                <span className="text-sm font-bold text-charcoal dark:text-white">
                  {request.exhibitionName}
                </span>
                {targetExhibition && (
                  <span className="text-xs text-charcoal-muted dark:text-white/60 block">
                    {targetExhibition.city} &bull; {targetExhibition.startDate}
                  </span>
                )}
              </div>
            </div>

            {request.allocatedStallCode ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 text-xs font-bold">
                Allocated: Stall {request.allocatedStallCode}
              </span>
            ) : (
              <span className="text-xs font-semibold text-sage-800 dark:text-sage-300">
                Wants {request.stallsWanted} stall(s)
              </span>
            )}
          </div>

          {/* Specific Requested Stall Decision Banner */}
          {requestedStall && !request.allocatedStallCode && (
            <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isRequestedStallAvailable
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
            }`}>
              <div className="flex items-start gap-3">
                <Store className={`w-5 h-5 shrink-0 mt-0.5 ${
                  isRequestedStallAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                }`} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60">
                      Applicant Specifically Requested:
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isRequestedStallAvailable
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-300 border-rose-300'
                    }`}>
                      {isRequestedStallAvailable ? 'Available' : 'Already Booked'}
                    </span>
                  </div>
                  <h4 className="font-sans text-base font-bold text-charcoal dark:text-white">
                    Stall {requestedStall.code} ({requestedStall.tierName} &bull; {requestedStall.dimensions} &bull; Rs. {requestedStall.price.toLocaleString()})
                  </h4>
                  <p className="text-xs text-charcoal-muted dark:text-white/60 font-light mt-0.5">
                    {isRequestedStallAvailable
                      ? 'This exact stall is free and ready for 1-click confirmation.'
                      : 'This stall is already occupied. Propose 1-3 available alternatives via WhatsApp or Email.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isRequestedStallAvailable ? (
                  isOwner && (
                    <button
                      onClick={handleAssignRequestedStall}
                      className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Assign Stall {requestedStall.code}</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => setIsAlternativesOpen(true)}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Send Alternatives</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Follow-up Reminder Flag */}
          {isFollowUpNeeded(request) && (
            <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[11px]">
                  Staff Follow-up Reminder ({getPendingDays(request)} Days Pending)
                </span>
                <p className="mt-0.5 text-amber-800 dark:text-amber-300/80 leading-relaxed font-medium">
                  This enquiry was submitted on <strong>{request.submittedDate}</strong> and has remained unconfirmed for over {FOLLOW_UP_THRESHOLD_DAYS} days. Reach out to the vendor via WhatsApp to assist them in locking their stall.
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block">
                Exhibitor & Representative
              </span>
              <div className="flex items-center gap-2 text-charcoal dark:text-white">
                <User className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span className="font-bold">{request.vendorName}</span>
              </div>
              {request.email && (
                <div className="flex items-center gap-2 text-charcoal-muted dark:text-white/60">
                  <Mail className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                  <a href={`mailto:${request.email}`} className="hover:underline text-charcoal dark:text-white">
                    {request.email}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-charcoal-muted dark:text-white/60">
                <Phone className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <a href={`tel:${request.phone}`} className="hover:underline text-charcoal dark:text-white font-medium">
                  {request.phone || 'No phone'}
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block">
                Financial Scope & Meta
              </span>
              <div className="flex items-center gap-2 text-charcoal dark:text-white">
                <Tag className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Budget: <strong className="font-bold">{request.budgetRange}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted dark:text-white/60">
                <CalendarDays className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Submitted: <strong className="text-charcoal dark:text-white">{request.submittedDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted dark:text-white/60">
                <Store className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Request ID: <strong className="text-charcoal dark:text-white font-mono">{request.id}</strong></span>
              </div>
            </div>

          </div>

          {/* Description & Notes */}
          {request.notes && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-1">
                Vendor Application Notes & Special Requests
              </span>
              <p className="text-xs text-charcoal dark:text-white leading-relaxed font-medium">
                {request.notes}
              </p>
            </div>
          )}

          {/* Direct WhatsApp Action */}
          {request.phone && (
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
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all glass-rise-btn flex items-center gap-1.5"
              >
                <span>Chat WhatsApp</span>
              </a>
            </div>
          )}

          {/* Status Changer Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10">
            <span className="text-xs uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-3">
              Application Decision & Status
            </span>

            {!isOwner ? (
              <div className="p-3.5 rounded-2xl bg-sage-50 dark:bg-white/5 border border-sage-200 dark:border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-charcoal-muted dark:text-white/60">
                  <ShieldCheck className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                  <span>Application decisions require <strong>Owner</strong> role permissions.</span>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleStatusChange('approved')}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
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
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
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
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
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
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                    request.status === 'pending'
                      ? 'bg-amber-600 text-white shadow-soft'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <span>Pending</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {isAlternativesOpen && (
        <AlternativeStallsModal
          request={request}
          exhibition={targetExhibition}
          onClose={() => setIsAlternativesOpen(false)}
        />
      )}
    </ModalPortal>
  );
};
