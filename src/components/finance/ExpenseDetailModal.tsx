'use client';

import React from 'react';
import { 
  X, 
  Receipt, 
  CalendarDays, 
  DollarSign, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Store, 
  ShieldCheck,
  CreditCard,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { ExpenseItem, ExpenseStatus } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';
import { isPdfUrl, openReceiptUrl } from '../../lib/storage';

interface ExpenseDetailModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
  onEdit?: (expense: ExpenseItem) => void;
  onViewReceipt?: (receiptUrl: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  onClose,
  onEdit,
  onViewReceipt
}) => {
  const { deleteExpense, currentUser } = useAdmin();

  if (!expense) return null;

  const isOwner = currentUser.permissions.canApproveExpenses || currentUser.role === 'owner';
  const isPdf = isPdfUrl(expense.receiptUrl);

  const handleDelete = () => {
    if (!isOwner) return;
    if (confirm(`Delete this ${expense.category} expense record of Rs. ${expense.amount.toLocaleString()}?`)) {
      deleteExpense(expense.id);
      onClose();
    }
  };

  const handleOpenReceipt = () => {
    if (expense.receiptUrl) {
      openReceiptUrl(expense.receiptUrl);
    }
  };

  return (
    <ModalPortal isOpen={!!expense} onClose={onClose} maxWidthClass="max-w-2xl">
      {/* Elevated Modal Card */}
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-800 dark:text-rose-300 font-bold shadow-xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-sage-200 dark:border-white/10 text-sage-800 dark:text-sage-300">
                  {expense.category}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                  Logged Entry
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-charcoal dark:text-white tracking-tight">
                {expense.category}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          
          {/* Key Amount Callout */}
          <div className="p-5 rounded-3xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-0.5">
                Total Expense Amount
              </span>
              <span className="font-sans text-3xl font-bold text-charcoal dark:text-white">
                Rs. {expense.amount.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-0.5">
                Expense Incurred Date
              </span>
              <span className="text-xs font-bold text-charcoal dark:text-white">
                {expense.date}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block">
                Exhibition Association
              </span>
              <div className="flex items-center gap-2 text-charcoal dark:text-white font-bold text-sm">
                <Store className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>{expense.exhibitionName}</span>
              </div>
              <span className="text-[11px] text-charcoal-muted dark:text-white/50 block">
                Exhibition ID #{expense.exhibitionId}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block">
                Ledger Entry Origin
              </span>
              <div className="flex items-center gap-2 text-charcoal dark:text-white font-bold">
                <User className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>{expense.enteredByName || 'Curation Desk'}</span>
              </div>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">
                ✓ Recorded in Supabase Ledger
              </span>
            </div>

          </div>

          {/* Description */}
          {expense.description && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-1">
                Itemized Narrative & Purpose
              </span>
              <p className="text-xs text-charcoal dark:text-white/90 leading-relaxed font-medium">
                {expense.description}
              </p>
            </div>
          )}

          {/* Receipt Proof Preview */}
          {expense.receiptUrl && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {isPdf ? (
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                ) : (
                  <img
                    src={expense.receiptUrl}
                    alt="Receipt thumbnail"
                    className="w-12 h-12 rounded-xl object-cover border border-sage-300 dark:border-white/10 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-charcoal dark:text-white block truncate">
                    Attached Invoice Voucher
                  </span>
                  <span className="text-[11px] text-charcoal-muted dark:text-white/50 block">
                    {isPdf ? 'PDF digital document' : 'Verified image proof'}
                  </span>
                </div>
              </div>

              {isPdf ? (
                <button
                  type="button"
                  onClick={handleOpenReceipt}
                  className="px-3.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1 shrink-0 glass-rise-btn"
                >
                  <span>Open PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onViewReceipt && onViewReceipt(expense.receiptUrl!)}
                  className="px-3.5 py-1.5 rounded-lg border border-sage-300 dark:border-white/20 bg-cream-50 dark:bg-white/10 hover:bg-white text-xs font-bold text-charcoal dark:text-white transition-all glass-rise-btn shrink-0"
                >
                  View Full
                </button>
              )}
            </div>
          )}

          {/* Action buttons (Edit & Delete for Owner) */}
          {isOwner && (
            <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Expense</span>
              </button>

              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(expense);
                    onClose();
                  }}
                  className="btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Expense</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </ModalPortal>
  );
};
