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
  CreditCard
} from 'lucide-react';
import { ExpenseItem, ExpenseStatus } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface ExpenseDetailModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
  onViewReceipt?: (url: string) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  onClose,
  onViewReceipt
}) => {
  const { updateExpenseStatus, currentRole } = useAdmin();

  if (!expense) return null;

  const handleStatusChange = (status: ExpenseStatus) => {
    updateExpenseStatus(expense.id, status);
  };

  const getStatusBadge = (status: ExpenseStatus) => {
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
      default:
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          label: 'Pending Approval'
        };
    }
  };

  const statusBadge = getStatusBadge(expense.status);

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
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-800 dark:text-rose-300 font-bold">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-sage-200 dark:border-white/10 text-sage-800 dark:text-sage-300">
                  {expense.category}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                {expense.category}
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
          
          {/* Key Amount Callout */}
          <div className="p-5 rounded-3xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-charcoal-muted block mb-0.5">
                Total Expense Amount
              </span>
              <span className="font-sans text-3xl font-bold text-charcoal">
                Rs. {expense.amount.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider font-bold text-charcoal-muted block mb-0.5">
                Voucher Date
              </span>
              <span className="text-xs font-bold text-charcoal">
                {expense.date}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block">
                Exhibition & Payment Mode
              </span>
              <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                <Store className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>{expense.exhibitionName}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <CreditCard className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Method: <strong className="text-charcoal font-medium">{expense.paymentMethod}</strong></span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block">
                Entered / Logged By
              </span>
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <User className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>{expense.enteredByName}</span>
                <span className="text-[10px] bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 px-2 py-0.5 rounded-full capitalize">
                  {expense.enteredByRole}
                </span>
              </div>
              {expense.approvedBy && (
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approved by {expense.approvedBy}</span>
                </div>
              )}
            </div>

          </div>

          {/* Description */}
          {expense.description && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Itemized Narrative & Purpose
              </span>
              <p className="text-xs text-charcoal leading-relaxed font-medium">
                {expense.description}
              </p>
            </div>
          )}

          {/* Receipt Proof Preview */}
          {expense.receiptUrl && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={expense.receiptUrl}
                  alt="Receipt thumbnail"
                  className="w-12 h-12 rounded-xl object-cover border border-sage-300"
                />
                <div>
                  <span className="text-xs font-bold text-charcoal block">Attached Invoice / Voucher</span>
                  <span className="text-[11px] text-charcoal-muted">Verified digital voucher proof</span>
                </div>
              </div>
              {onViewReceipt && (
                <button
                  onClick={() => onViewReceipt(expense.receiptUrl!)}
                  className="px-3.5 py-1.5 rounded-xl border border-sage-300 dark:border-white/10 bg-cream-50 dark:bg-white/10 hover:bg-white text-xs font-bold text-charcoal transition-all glass-rise-btn"
                >
                  View Full
                </button>
              )}
            </div>
          )}

          {/* Approval Controls */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10">
            <span className="text-xs uppercase tracking-wider font-bold text-charcoal-muted block mb-3">
              Expense Verification & Approval
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={currentRole === 'staff'}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  expense.status === 'approved'
                    ? 'bg-emerald-700 text-white shadow-soft'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                } disabled:opacity-50`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Expense</span>
              </button>

              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={currentRole === 'staff'}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  expense.status === 'rejected'
                    ? 'bg-rose-700 text-white shadow-soft'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                } disabled:opacity-50`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => handleStatusChange('pending_approval')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 glass-rise-btn ${
                  expense.status === 'pending_approval'
                    ? 'bg-amber-600 text-white shadow-soft'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Pending</span>
              </button>
            </div>
            {currentRole === 'staff' && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 font-medium">
                * Staff role cannot authorize expense ledgers. Only Owner and Admin can approve.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
