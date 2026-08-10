'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, History, CalendarDays, MapPin, Users, TrendingUp, Sparkles, Image as ImageIcon } from 'lucide-react';
import { PastEventStory } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';

const pastEventSchema = z.object({
  title: z.string().min(3, 'Event title is required'),
  edition: z.string().min(2, 'Edition label is required'),
  city: z.string().min(2, 'City is required'),
  dateRange: z.string().min(3, 'Date range is required'),
  footfallNumber: z.number().min(100, 'Footfall must be at least 100'),
  vendorCount: z.number().min(5, 'Vendor count is required'),
  totalRevenueGMV: z.string().min(2, 'GMV estimate is required'),
  satisfactionRate: z.string().min(2, 'Satisfaction rate is required'),
  narrativeExcerpt: z.string().min(10, 'Narrative excerpt is required'),
  coverImage: z.string().min(1, 'Cover image is required'),
  tagsInput: z.string(),
});

type PastEventFormData = z.infer<typeof pastEventSchema>;

interface PastEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: PastEventStory | null;
}

export const PastEventFormModal: React.FC<PastEventFormModalProps> = ({
  isOpen,
  onClose,
  eventToEdit
}) => {
  const { addPastEvent, updatePastEvent } = useAdmin();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PastEventFormData>({
    resolver: zodResolver(pastEventSchema),
    defaultValues: {
      title: '',
      edition: 'Edition 15',
      city: 'Lahore',
      dateRange: 'November 20 – 22, 2025',
      footfallNumber: 18000,
      vendorCount: 75,
      totalRevenueGMV: 'Rs. 38M+',
      satisfactionRate: '97%',
      narrativeExcerpt: '',
      coverImage: '/images/1.jpg',
      tagsInput: 'Artisan Craft, Festive Edition',
    }
  });

  const selectedCover = watch('coverImage');

  useEffect(() => {
    if (eventToEdit) {
      reset({
        title: eventToEdit.title,
        edition: eventToEdit.edition,
        city: eventToEdit.city,
        dateRange: eventToEdit.dateRange,
        footfallNumber: eventToEdit.footfallNumber,
        vendorCount: eventToEdit.vendorCount,
        totalRevenueGMV: eventToEdit.totalRevenueGMV,
        satisfactionRate: eventToEdit.satisfactionRate,
        narrativeExcerpt: eventToEdit.narrativeExcerpt,
        coverImage: eventToEdit.coverImage,
        tagsInput: eventToEdit.tags ? eventToEdit.tags.join(', ') : '',
      });
    } else {
      reset({
        title: '',
        edition: 'Edition 15',
        city: 'Lahore',
        dateRange: 'November 20 – 22, 2025',
        footfallNumber: 18000,
        vendorCount: 75,
        totalRevenueGMV: 'Rs. 38M+',
        satisfactionRate: '97%',
        narrativeExcerpt: '',
        coverImage: '/images/1.jpg',
        tagsInput: 'Artisan Craft, Festive Edition',
      });
    }
  }, [eventToEdit, reset, isOpen]);

  const onSubmit = (data: PastEventFormData) => {
    const parsedTags = data.tagsInput
      ? data.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    if (eventToEdit) {
      updatePastEvent(eventToEdit.id, {
        title: data.title,
        edition: data.edition,
        city: data.city,
        dateRange: data.dateRange,
        footfallNumber: Number(data.footfallNumber),
        vendorCount: Number(data.vendorCount),
        totalRevenueGMV: data.totalRevenueGMV,
        satisfactionRate: data.satisfactionRate,
        narrativeExcerpt: data.narrativeExcerpt,
        coverImage: data.coverImage,
        tags: parsedTags,
      });
    } else {
      addPastEvent({
        title: data.title,
        edition: data.edition,
        city: data.city,
        dateRange: data.dateRange,
        footfallNumber: Number(data.footfallNumber),
        vendorCount: Number(data.vendorCount),
        totalRevenueGMV: data.totalRevenueGMV,
        satisfactionRate: data.satisfactionRate,
        narrativeExcerpt: data.narrativeExcerpt,
        coverImage: data.coverImage,
        photos: [data.coverImage, '/images/2.jpg'],
        tags: parsedTags,
      });
    }
    onClose();
  };

  const sampleImages = [
    { label: 'Artisan Boutique Stalls', path: '/images/1.jpg' },
    { label: 'Design Pavilion & Exhibits', path: '/images/2.jpg' },
    { label: 'Exhibition Hall (Hero)', path: '/images/More Stalls Added.png' },
    { label: 'Outdoor Bazaar Greenery', path: '/images/Exhibition Agency BG.png' },
  ];

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <span className="eyebrow-label">
                PORTFOLIO SHOWCASE
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                {eventToEdit ? 'Edit Archive Story' : 'Add Past Exhibition Edition'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Exhibition Name *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Winter Artisan Gala 2025"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
              {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Edition Label *
              </label>
              <input
                type="text"
                {...register('edition')}
                placeholder="e.g. Edition 12 / Spring"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                City / Region *
              </label>
              <input
                type="text"
                {...register('city')}
                placeholder="Lahore / Islamabad / Karachi"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Held Dates *
              </label>
              <input
                type="text"
                {...register('dateRange')}
                placeholder="e.g. November 20 – 22, 2025"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Footfall *
              </label>
              <input
                type="number"
                {...register('footfallNumber', { valueAsNumber: true })}
                placeholder="15000"
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Vendors *
              </label>
              <input
                type="number"
                {...register('vendorCount', { valueAsNumber: true })}
                placeholder="75"
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Total GMV *
              </label>
              <input
                type="text"
                {...register('totalRevenueGMV')}
                placeholder="Rs. 35M+"
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Satisfaction *
              </label>
              <input
                type="text"
                {...register('satisfactionRate')}
                placeholder="98%"
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Narrative & Highlights Excerpt *
            </label>
            <textarea
              rows={3}
              {...register('narrativeExcerpt')}
              placeholder="Describe the atmosphere, attendee engagement, and vendor feedback..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 font-sans bg-white/80 dark:bg-white/5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Cover Image Selection
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {sampleImages.map((img) => (
                <button
                  key={img.path}
                  type="button"
                  onClick={() => setValue('coverImage', img.path)}
                  className={`p-2 rounded-2xl border text-left text-xs transition-all relative overflow-hidden group ${
                    selectedCover === img.path
                      ? 'border-sage-800 dark:border-sage-400 bg-sage-50 dark:bg-white/10 ring-2 ring-sage-400'
                      : 'border-sage-200 dark:border-white/10 bg-cream-50 dark:bg-white/[0.04] hover:bg-cream-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <img src={img.path} alt={img.label} className="w-full h-14 object-cover rounded-lg mb-1.5" />
                  <span className="block text-[11px] font-bold text-charcoal truncate">{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Categories & Tags (Comma-separated)
            </label>
            <input
              type="text"
              {...register('tagsInput')}
              placeholder="e.g. Couture, Handcrafted, Festive"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
            />
          </div>

          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              {eventToEdit ? 'Save Story' : 'Publish Story'}
            </button>
          </div>

        </form>

      </div>
    </ModalPortal>
  );
};
