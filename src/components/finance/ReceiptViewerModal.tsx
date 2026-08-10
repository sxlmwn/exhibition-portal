'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';
import { ExpenseItem } from '../../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-soft-2xl border border-sage-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-sage-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sage-800 block">
              Receipt Voucher
            </span>
            <h3 className="font-sans text-lg font-bold text-charcoal tracking-tight">
              {expense.category} &bull; Rs. {expense.amount.toLocaleString()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Image Area */}
        <div className="p-6 bg-cream-50 flex flex-col items-center justify-center">
          {expense.receiptUrl ? (
            <div className="rounded-2xl overflow-hidden shadow-soft border border-sage-200 max-h-80">
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
        <div className="p-6 space-y-2 text-xs bg-white">
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-charcoal-muted">Exhibition:</span>
            <span className="font-semibold text-charcoal">{expense.exhibitionName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-charcoal-muted">Entered By:</span>
            <span className="text-charcoal">{expense.enteredByName} ({expense.enteredByRole})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100">
            <span className="text-charcoal-muted">Payment Mode:</span>
            <span className="font-medium text-charcoal">{expense.paymentMethod}</span>
          </div>
          <div className="pt-2 text-charcoal-muted font-light leading-relaxed">
            "{expense.description}"
          </div>
        </div>

        <div className="p-4 border-t border-sage-100 flex items-center justify-end bg-cream-50">
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2 text-xs font-semibold uppercase tracking-wider"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
