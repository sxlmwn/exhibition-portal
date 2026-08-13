'use client';

import React from 'react';
import { X, FileText, Download, ExternalLink, Receipt } from 'lucide-react';
import { ExpenseItem } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { isPdfUrl, openReceiptUrl } from '../../lib/storage';

interface ReceiptViewerModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  expense,
  onClose
}) => {
  if (!expense) return null;

  const isPdf = isPdfUrl(expense.receiptUrl);

  const handleOpenNewTab = () => {
    if (expense.receiptUrl) {
      openReceiptUrl(expense.receiptUrl);
    }
  };

  return (
    <ModalPortal isOpen={!!expense} onClose={onClose} maxWidthClass="max-w-xl">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full overflow-hidden shadow-soft-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-sage-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="eyebrow-label">
              RECEIPT VOUCHER ATTACHMENT
            </span>
            <h3 className="font-sans text-lg font-bold text-charcoal dark:text-white tracking-tight">
              {expense.category} &bull; Rs. {expense.amount.toLocaleString()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Display Area */}
        <div className="p-6 bg-cream-50 dark:bg-white/[0.04] flex flex-col items-center justify-center min-h-[220px]">
          {expense.receiptUrl ? (
            isPdf ? (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="w-full max-h-80 rounded-2xl overflow-hidden border border-sage-200 dark:border-white/10 shadow-soft bg-white dark:bg-[#1A1D24]">
                  <iframe
                    src={expense.receiptUrl}
                    className="w-full h-72 rounded-2xl"
                    title="PDF Receipt Document Preview"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="px-6 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all glass-rise-btn"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Full PDF in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-soft border border-sage-200 dark:border-white/10 max-h-80 relative group">
                <img
                  src={expense.receiptUrl}
                  alt="Receipt Scan"
                  className="w-full h-full object-contain"
                />
              </div>
            )
          ) : (
            <div className="p-8 text-center text-charcoal-muted dark:text-white/50 text-xs">
              No receipt image or PDF attached to this voucher.
            </div>
          )}
        </div>

        {/* Details & Metadata */}
        <div className="p-6 space-y-2 text-xs bg-white dark:bg-[#121418]">
          <div className="flex justify-between py-1 border-b border-sage-100 dark:border-white/10">
            <span className="text-charcoal-muted dark:text-white/60">Exhibition:</span>
            <span className="font-semibold text-charcoal dark:text-white">{expense.exhibitionName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-sage-100 dark:border-white/10">
            <span className="text-charcoal-muted dark:text-white/60">Expense Incurred Date:</span>
            <span className="font-medium text-charcoal dark:text-white">{expense.date}</span>
          </div>
          {expense.description && (
            <div className="pt-2 text-charcoal-muted dark:text-white/70 leading-relaxed">
              <strong className="text-charcoal dark:text-white">Memo:</strong> {expense.description}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-sage-100 dark:border-white/10 flex justify-between items-center bg-cream-50/50 dark:bg-white/[0.02]">
          {expense.receiptUrl && (
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="text-xs font-bold text-sage-800 dark:text-sage-300 hover:underline flex items-center gap-1"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider ml-auto transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </ModalPortal>
  );
};
