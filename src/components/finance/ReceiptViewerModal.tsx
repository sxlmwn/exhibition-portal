'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';
import { ExpenseItem } from '../../types';

import { ModalPortal } from '../common/ModalPortal';

interface ReceiptViewerModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  expense,
  onClose
}) => {
  if (!expense) return null;

  return (
    <ModalPortal isOpen={!!expense} onClose={onClose} maxWidthClass="max-w-lg">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full overflow-hidden shadow-soft-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-sage-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">
              RECEIPT VOUCHER
            </span>
            <h3 className="font-sans text-lg font-bold text-charcoal tracking-tight">
              {expense.category} &bull; Rs. {expense.amount.toLocaleString()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Image Area */}
        <div className="p-6 bg-cream-50 dark:bg-white/[0.04] flex flex-col items-center justify-center">
          {expense.receiptUrl ? (
            <div className="rounded-2xl overflow-hidden shadow-soft border border-sage-200 dark:border-white/10 max-h-80">
              <img
                src={expense.receiptUrl}
                alt="Receipt Scan"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="p-8 text-center text-charcoal-muted text-xs">
              No receipt image attached to this voucher.
            </div>
          )}
        </div>

        {/* Details & Metadata */}
        <div className="p-6 space-y-2 text-xs bg-white dark:bg-[#121418]">
          <div className="flex justify-between py-1 border-b border-sage-100 dark:border-white/10">
            <span className="text-charcoal-muted">Exhibition:</span>
            <span className="font-semibold text-charcoal">{expense.exhibitionName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100 dark:border-white/10">
            <span className="text-charcoal-muted">Entered By:</span>
            <span className="text-charcoal">{expense.enteredByName} ({expense.enteredByRole})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100 dark:border-white/10">
            <span className="text-charcoal-muted">Payment Mode:</span>
            <span className="font-medium text-charcoal">{expense.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100 dark:border-white/10">
            <span className="text-charcoal-muted">Date:</span>
            <span className="text-charcoal">{expense.date}</span>
          </div>
          {expense.description && (
            <div className="pt-2 text-charcoal-muted leading-relaxed">
              <strong className="text-charcoal">Note:</strong> {expense.description}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-sage-100 dark:border-white/10 flex justify-end gap-2 bg-cream-50/50 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider"
          >
            Close
          </button>
        </div>

      </div>
    </ModalPortal>
  );
};
