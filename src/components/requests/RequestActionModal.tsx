'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, Send } from 'lucide-react';
import { VendorRequest, RequestStatus } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface RequestActionModalProps {
  request: VendorRequest | null;
  targetStatus: RequestStatus | null;
  onClose: () => void;
}

export const RequestActionModal: React.FC<RequestActionModalProps> = ({
  request,
  targetStatus,
  onClose
}) => {
  const { updateRequestStatus } = useAdmin();
  const [adminNote, setAdminNote] = useState('');

  if (!request || !targetStatus) return null;

  const handleConfirm = () => {
    updateRequestStatus(request.id, targetStatus);
    onClose();
  };

  const getModalConfig = () => {
    switch (targetStatus) {
      case 'approved':
        return {
          title: 'Approve Vendor Application',
          description: `Confirm approval for "${request.brandName}". They will be marked as eligible for stall allocation.`,
          btnClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
          btnText: 'Confirm Approval',
          icon: CheckCircle2,
          iconColor: 'text-emerald-700 bg-emerald-50'
        };
      case 'rejected':
        return {
          title: 'Reject Vendor Application',
          description: `Are you sure you want to reject "${request.brandName}"?`,
          btnClass: 'bg-rose-700 hover:bg-rose-800 text-white',
          btnText: 'Confirm Rejection',
          icon: XCircle,
          iconColor: 'text-rose-700 bg-rose-50'
        };
      case 'waitlisted':
        return {
          title: 'Move to Waitlist',
          description: `Move "${request.brandName}" to waitlist queue for "${request.exhibitionName}".`,
          btnClass: 'bg-purple-700 hover:bg-purple-800 text-white',
          btnText: 'Confirm Waitlist',
          icon: Clock,
          iconColor: 'text-purple-700 bg-purple-50'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-soft-2xl border border-sage-200 w-full max-w-lg p-6 sm:p-8">
        
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${config.iconColor} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
          {config.title}
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-muted font-light leading-relaxed mb-6">
          {config.description}
        </p>

        {/* Applicant Summary */}
        <div className="p-4 rounded-2xl bg-cream-50 border border-sage-200 text-xs space-y-1.5 mb-6">
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Brand:</span>
            <span className="font-bold text-charcoal">{request.brandName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Contact:</span>
            <span className="text-charcoal">{request.vendorName} ({request.phone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Category:</span>
            <span className="text-charcoal">{request.productCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Target Edition:</span>
            <span className="text-sage-800 font-semibold">{request.exhibitionName}</span>
          </div>
        </div>

        {/* Admin note */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
            Internal Note / Curator Remarks (Optional)
          </label>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="e.g. Approved for Corner slot after Instagram review..."
            className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors ${config.btnClass}`}
          >
            {config.btnText}
          </button>
        </div>

      </div>
    </div>
  );
};
