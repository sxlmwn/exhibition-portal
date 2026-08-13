'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, Send } from 'lucide-react';
import { VendorRequest, RequestStatus } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';

interface RequestActionModalProps {
  request: VendorRequest | null;
  targetStatus?: RequestStatus | null;
  actionType?: RequestStatus | null;
  onClose: () => void;
}

export const RequestActionModal: React.FC<RequestActionModalProps> = ({
  request,
  targetStatus,
  actionType,
  onClose
}) => {
  const { updateRequestStatus, currentRole } = useAdmin();
  const isOwner = currentRole === 'owner';
  const [adminNote, setAdminNote] = useState('');

  const effectiveAction = targetStatus || actionType;

  if (!request || !effectiveAction) return null;

  const handleConfirm = () => {
    if (!isOwner) return;
    updateRequestStatus(request.id, effectiveAction);
    onClose();
  };

  const getModalConfig = () => {
    switch (effectiveAction) {
      case 'approved':
        return {
          title: 'Approve Vendor Request',
          description: 'This vendor will be marked as approved. You can assign a specific booth from the floor plan.',
          btnClass: 'btn-primary',
          btnText: 'Confirm Approval',
          icon: CheckCircle2,
          iconColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
        };
      case 'rejected':
        return {
          title: 'Reject Request',
          description: 'Are you sure you want to reject this application? This action can be reversed later.',
          btnClass: 'bg-rose-700 hover:bg-rose-800 text-white',
          btnText: 'Reject Vendor',
          icon: XCircle,
          iconColor: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
        };
      case 'waitlisted':
        return {
          title: 'Move to Waitlist',
          description: 'Place this applicant in the standby queue if stall capacity opens up.',
          btnClass: 'bg-purple-700 hover:bg-purple-800 text-white',
          btnText: 'Add to Waitlist',
          icon: Clock,
          iconColor: 'text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300'
        };
      default:
        return {
          title: 'Update Status',
          description: 'Change request status',
          btnClass: 'btn-primary',
          btnText: 'Save',
          icon: CheckCircle2,
          iconColor: 'text-sage-700 bg-sage-50'
        };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  return (
    <ModalPortal isOpen={!!request && !!effectiveAction} onClose={onClose} maxWidthClass="max-w-lg">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full p-6 sm:p-8 shadow-soft-2xl">
        
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${config.iconColor} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-sans text-2xl font-extrabold text-charcoal dark:text-white mb-2 tracking-tight">
          {config.title}
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted dark:text-white/60 font-normal leading-relaxed mb-6">
          {config.description}
        </p>

        {/* Applicant Summary */}
        <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/[0.04] border border-sage-200 dark:border-white/10 text-xs space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span className="text-charcoal-muted dark:text-white/60">Brand:</span>
            <span className="font-bold text-charcoal dark:text-white">{request.brandName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted dark:text-white/60">Contact:</span>
            <span className="text-charcoal dark:text-white">{request.vendorName} ({request.phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted dark:text-white/60">Category:</span>
            <span className="text-charcoal dark:text-white">{request.productCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted dark:text-white/60">Target Edition:</span>
            <span className="text-sage-800 dark:text-sage-300 font-semibold">{request.exhibitionName}</span>
          </div>
        </div>

        {/* Admin note */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
            Internal Note / Curator Remarks (Optional)
          </label>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="e.g. Approved for Corner slot after Instagram review..."
            className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isOwner}
            className={`px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50 ${config.btnClass}`}
          >
            {config.btnText}
          </button>
        </div>

      </div>
    </ModalPortal>
  );
};
