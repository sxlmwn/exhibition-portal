'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  Receipt, 
  Upload, 
  DollarSign, 
  CalendarDays, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { ExpenseCategory, ExpenseItem } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';
import { supabase } from '../../lib/supabase';
import { isPdfUrl, openReceiptUrl } from '../../lib/storage';

const expenseCategories = [
  'Venue Rent',
  'Marketing & Ads',
  'Staff & Labour',
  'Logistics & Freight',
  'Setup, Decor & Lighting',
  'Security & Protocol',
  'Refreshments',
  'Miscellaneous'
] as const;

const expenseSchema = z.object({
  exhibitionId: z.string().min(1, 'Please select an exhibition'),
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Please select a valid expense category' })
  }),
  amount: z.number({ invalid_type_error: 'Amount is required' })
    .positive('Expense amount must be a positive number greater than 0'),
  date: z.string().min(1, 'Incurred date is required'),
  description: z.string().min(3, 'Detailed description / memo is required'),
  receiptUrl: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: ExpenseItem | null;
  defaultExhibitionId?: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  defaultExhibitionId
}) => {
  const { exhibitions, addExpense, updateExpense } = useAdmin();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const initialExhId = expenseToEdit?.exhibitionId ?? defaultExhibitionId ?? exhibitions[0]?.id ?? '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      exhibitionId: initialExhId,
      category: 'Venue Rent',
      amount: 50000,
      date: new Date().toISOString().split('T')[0],
      description: '',
      receiptUrl: ''
    }
  });

  const selectedExhibitionId = watch('exhibitionId');
  const selectedDate = watch('date');
  const currentReceiptUrl = watch('receiptUrl');
  const isReceiptPdf = isPdfUrl(currentReceiptUrl);

  // Find linked exhibition to calculate allowable date window (start_date - 7d to end_date + 7d)
  const linkedExhibition = useMemo(() => {
    return exhibitions.find(e => e.id === selectedExhibitionId) || exhibitions[0];
  }, [exhibitions, selectedExhibitionId]);

  const dateWindow = useMemo(() => {
    if (!linkedExhibition || !linkedExhibition.startDate || !linkedExhibition.endDate) {
      return null;
    }
    const startMs = new Date(linkedExhibition.startDate).getTime();
    const endMs = new Date(linkedExhibition.endDate).getTime();
    const bufferMs = 7 * 24 * 60 * 60 * 1000; // ±7 days buffer

    const minDate = new Date(startMs - bufferMs).toISOString().split('T')[0];
    const maxDate = new Date(endMs + bufferMs).toISOString().split('T')[0];

    return {
      minDate,
      maxDate,
      startDate: linkedExhibition.startDate,
      endDate: linkedExhibition.endDate
    };
  }, [linkedExhibition]);

  // Date range validation check
  const isDateOutOfRange = useMemo(() => {
    if (!dateWindow || !selectedDate) return false;
    return selectedDate < dateWindow.minDate || selectedDate > dateWindow.maxDate;
  }, [dateWindow, selectedDate]);

  useEffect(() => {
    if (expenseToEdit) {
      reset({
        exhibitionId: expenseToEdit.exhibitionId ?? initialExhId,
        category: expenseToEdit.category,
        amount: expenseToEdit.amount,
        date: expenseToEdit.date,
        description: expenseToEdit.description,
        receiptUrl: expenseToEdit.receiptUrl || ''
      });
      if (expenseToEdit.receiptUrl) {
        setUploadedFileName(expenseToEdit.receiptUrl.split('/').pop() || 'Existing Receipt');
      }
    } else {
      reset({
        exhibitionId: defaultExhibitionId ?? exhibitions[0]?.id ?? '',
        category: 'Venue Rent',
        amount: 50000,
        date: new Date().toISOString().split('T')[0],
        description: '',
        receiptUrl: ''
      });
      setUploadedFileName(null);
    }
    setUploadError(null);
  }, [expenseToEdit, reset, isOpen, defaultExhibitionId, exhibitions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Primary Path: Upload to Supabase Storage 'exhibitions' bucket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds 20MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const cleanFileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `receipts/${cleanFileName}`;

    try {
      // 1. Primary path: Direct Supabase Storage Upload
      const { data, error } = await supabase.storage
        .from('exhibitions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || (fileExt === 'pdf' ? 'application/pdf' : 'image/jpeg')
        });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from('exhibitions').getPublicUrl(filePath);
        console.log('[Supabase Storage] Successfully uploaded receipt to bucket "exhibitions":', pubData.publicUrl);
        setValue('receiptUrl', pubData.publicUrl);
        setUploadedFileName(file.name);
        setIsUploading(false);
        return;
      }

      // Storage failed - log clear diagnostics
      console.warn('[Supabase Storage Warning] Storage upload failed:', error?.message ?? 'Unknown error');

      // 2. Safety Net Fallback: Only if remote Storage is genuinely unconfigured/down
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string ?? '';
        console.warn('[Supabase Storage] Stored receipt via safety net fallback (Data URL). Note: Ensure the "exhibitions" bucket is created in Supabase Storage.');
        setValue('receiptUrl', result);
        setUploadedFileName(file.name);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read selected file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.warn('[Supabase Storage] Upload exception:', err);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string ?? '';
        setValue('receiptUrl', result);
        setUploadedFileName(file.name);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = () => {
    setValue('receiptUrl', '');
    setUploadedFileName(null);
  };

  const onSubmit = (data: ExpenseFormData) => {
    if (isDateOutOfRange) {
      alert('Please correct the expense date to fall within the allowable exhibition window before submitting.');
      return;
    }

    const exh = exhibitions.find(e => e.id === data.exhibitionId);
    const exhibitionName = exh ? exh.title : 'Exhibition';

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        exhibitionId: data.exhibitionId,
        exhibitionName,
        category: data.category,
        amount: Number(data.amount),
        date: data.date,
        description: data.description,
        receiptUrl: data.receiptUrl || undefined
      });
    } else {
      addExpense({
        exhibitionId: data.exhibitionId,
        exhibitionName,
        category: data.category,
        amount: Number(data.amount),
        date: data.date,
        description: data.description,
        receiptUrl: data.receiptUrl || undefined,
        paymentMethod: 'Bank Transfer'
      });
    }

    reset();
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/50 text-sage-800 dark:text-sage-300 flex items-center justify-center shadow-xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="eyebrow-label">
                FINANCE & EXPENDITURES
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal dark:text-white tracking-tight">
                {expenseToEdit ? 'Edit Expense Record' : 'Log New Expense Voucher'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Associated Exhibition */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Associated Exhibition *
            </label>
            <select
              {...register('exhibitionId')}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none focus:border-sage-500 font-medium glass-select"
            >
              {exhibitions.map((exh) => (
                <option key={exh.id} value={exh.id}>
                  {exh.title} ({exh.city})
                </option>
              ))}
            </select>
            {errors.exhibitionId && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">{errors.exhibitionId.message}</p>
            )}
          </div>

          {/* Category & Amount (PKR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Expense Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none focus:border-sage-500 font-medium glass-select"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Amount (PKR) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                {...register('amount', { valueAsNumber: true })}
                placeholder="e.g. 380000"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5 font-bold"
              />
              {errors.amount && (
                <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Date Incurred with Window Validation */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Date Incurred (Expense Date) *
            </label>
            <input
              type="date"
              {...register('date')}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs text-charcoal dark:text-white outline-none font-medium bg-white/80 dark:bg-white/5 ${
                isDateOutOfRange 
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900' 
                  : 'border-sage-200 dark:border-white/10 focus:border-sage-500'
              }`}
            />

            {/* Sub-label showing the allowed date window */}
            {dateWindow && (
              <div className="mt-1.5 flex items-start gap-1 text-[11px] text-charcoal-muted dark:text-white/60">
                <span>
                  Exhibition Period: <strong className="text-charcoal dark:text-white">{dateWindow.startDate}</strong> to <strong className="text-charcoal dark:text-white">{dateWindow.endDate}</strong> (Allowable logging window: {dateWindow.minDate} to {dateWindow.maxDate} with ±7 days prep/wind-down buffer).
                </span>
              </div>
            )}

            {/* Inline validation error if out of range */}
            {isDateOutOfRange && (
              <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Date {selectedDate} is outside allowable window ({dateWindow?.minDate ?? 'N/A'} to {dateWindow?.maxDate ?? 'N/A'}). Please select a valid date within ±7 days of the exhibition.
                </span>
              </div>
            )}
            {errors.date && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Description / Vendor Memo *
            </label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="e.g. 50% advance deposit for main entrance archway and staging equipment..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 font-sans bg-white/80 dark:bg-white/5"
            />
            {errors.description && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Receipt / Bill Upload Field (Image or PDF) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Receipt / Bill Voucher Attachment (Image or PDF)
            </label>
            
            {currentReceiptUrl ? (
              <div className="p-3.5 rounded-2xl border border-sage-200 dark:border-white/10 bg-white/80 dark:bg-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {isReceiptPdf ? (
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                  ) : (
                    <img 
                      src={currentReceiptUrl} 
                      alt="Receipt" 
                      className="w-12 h-12 object-cover rounded-xl border border-sage-200 shrink-0" 
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-charcoal dark:text-white truncate block">
                      {uploadedFileName || (isReceiptPdf ? 'PDF Receipt Document' : 'Attached Image Receipt')}
                    </span>
                    <button
                      type="button"
                      onClick={() => openReceiptUrl(currentReceiptUrl)}
                      className="text-[11px] text-sage-800 dark:text-sage-300 hover:underline flex items-center gap-1 mt-0.5 font-semibold"
                    >
                      <span>Preview Voucher</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                  title="Remove receipt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-sage-200 dark:border-white/15 hover:border-sage-400 dark:hover:border-white/30 rounded-2xl p-4 text-center bg-cream-50/50 dark:bg-white/[0.02] transition-colors relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-sage-600 animate-spin" />
                      <span className="text-xs font-bold text-charcoal dark:text-white">Uploading voucher to Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                      <span className="text-xs font-bold text-charcoal dark:text-white">
                        Click or drag to upload invoice / receipt
                      </span>
                      <span className="text-[11px] text-charcoal-muted dark:text-white/50">
                        Supports PNG, JPG, WEBP, or PDF files (up to 20MB)
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{uploadError}</span>
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || isDateOutOfRange}
              className="btn-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {expenseToEdit ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>

        </form>
      </div>
    </ModalPortal>
  );
};
