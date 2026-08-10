'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Receipt, Upload, DollarSign, CalendarDays } from 'lucide-react';
import { ExpenseCategory, ExpenseItem } from '../../types';
import { useAdmin } from '../../context/AdminContext';

const expenseSchema = z.z.object({
  exhibitionId: z.string().min(1, 'Exhibition is required'),
  category: z.enum([
    'Venue Rent',
    'Marketing & Ads',
    'Staff & Labour',
    'Logistics & Freight',
    'Setup, Decor & Lighting',
    'Security & Protocol',
    'Refreshments',
    'Miscellaneous'
  ]),
  amount: z.number().min(100, 'Amount must be at least Rs. 100'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Description is required'),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Cheque', 'Card']),
  receiptUrl: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExhibitionId?: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  defaultExhibitionId
}) => {
  const { addExpense, exhibitions } = useAdmin();
  const [selectedReceipt, setSelectedReceipt] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400'
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      exhibitionId: defaultExhibitionId || exhibitions[0]?.id || 'exh-1',
      category: 'Venue Rent',
      amount: 150000,
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'Bank Transfer',
      receiptUrl: selectedReceipt,
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: ExpenseFormData) => {
    const exh = exhibitions.find(e => e.id === data.exhibitionId);

    addExpense({
      exhibitionId: data.exhibitionId,
      exhibitionName: exh ? exh.title : 'Exhibition',
      category: data.category as ExpenseCategory,
      amount: data.amount,
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod,
      receiptUrl: selectedReceipt,
    });

    reset();
    onClose();
  };

  const sampleReceipts = [
    { label: 'Venue Contract Receipt', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400' },
    { label: 'Marketing Invoice', url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=400' },
    { label: 'Logistics Bill', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Full-Screen Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl animate-scaleUp">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
                Accounting
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                Log New Expense
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Associated Exhibition *
            </label>
            <select
              {...register('exhibitionId')}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
            >
              {exhibitions.map((exh) => (
                <option key={exh.id} value={exh.id}>
                  {exh.title} ({exh.city})
                </option>
              ))}
            </select>
            {errors.exhibitionId && <p className="text-rose-600 text-xs mt-1">{errors.exhibitionId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Expense Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              >
                <option value="Venue Rent">Venue Rent</option>
                <option value="Marketing & Ads">Marketing & Ads</option>
                <option value="Staff & Labour">Staff & Labour</option>
                <option value="Logistics & Freight">Logistics & Freight</option>
                <option value="Setup, Decor & Lighting">Setup, Decor & Lighting</option>
                <option value="Security & Protocol">Security & Protocol</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Amount (PKR) *
              </label>
              <input
                type="number"
                step="500"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.amount && <p className="text-rose-600 text-xs mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Date Incurred *
              </label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.date && <p className="text-rose-600 text-xs mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Payment Mode *
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Description / Vendor Memo *
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="e.g. 50% advance deposit for main entrance archway and branding..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500 font-sans"
            />
            {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Receipt selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
              Attach Receipt / Invoice (Mock Preview)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {sampleReceipts.map((rcp, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedReceipt(rcp.url)}
                  className={`p-2 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                    selectedReceipt === rcp.url ? 'border-sage-800 bg-sage-50' : 'border-sage-200 hover:border-sage-400'
                  }`}
                >
                  <img src={rcp.url} alt={rcp.label} className="w-full h-16 object-cover rounded-xl mb-1.5" />
                  <span className="text-[10px] text-charcoal font-medium truncate block">{rcp.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              Record Expense
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
