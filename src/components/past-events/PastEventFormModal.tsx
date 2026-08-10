'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, History, MapPin, Users, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { PastEventStory } from '../../types';

const pastEventSchema = z.z.object({
  title: z.string().min(3, 'Title is required'),
  edition: z.string().min(2, 'Edition tag is required'),
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
    reset,
    setValue,
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
      coverImage: '/images/Exhibition Agency BG.png',
      tagsInput: 'Artisan Craft, Festive Edition',
    }
  });

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
        tagsInput: eventToEdit.tags.join(', '),
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
        coverImage: '/images/Exhibition Agency BG.png',
        tagsInput: 'Artisan Craft, Festive Edition',
      });
    }
  }, [eventToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: PastEventFormData) => {
    const parsedTags = data.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (eventToEdit) {
      updatePastEvent(eventToEdit.id, {
        title: data.title,
        edition: data.edition,
        city: data.city,
        dateRange: data.dateRange,
        footfallNumber: data.footfallNumber,
        vendorCount: data.vendorCount,
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
        footfallNumber: data.footfallNumber,
        vendorCount: data.vendorCount,
        totalRevenueGMV: data.totalRevenueGMV,
        satisfactionRate: data.satisfactionRate,
        narrativeExcerpt: data.narrativeExcerpt,
        coverImage: data.coverImage,
        photos: [data.coverImage, '/images/More Stalls Added.png'],
        tags: parsedTags,
      });
    }
    onClose();
  };

  const sampleImages = [
    { label: 'Outdoor Bazaar Greenery', path: '/images/Exhibition Agency BG.png' },
    { label: 'Exhibition Hall (Hero)', path: '/images/More Stalls Added.png' },
    { label: 'Artisan Pavilion Stalls', path: '/images/Landing Hero _ Wide Group_ No Slate.png' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-soft-2xl border border-sage-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
                Portfolio Showcase
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                {eventToEdit ? 'Edit Past Edition Story' : 'Add Past Edition Story'}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Edition Title *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Winter Artisan Gala 2025"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Edition Code / Label *
              </label>
              <input
                type="text"
                {...register('edition')}
                placeholder="e.g. Edition 14"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Host City *
              </label>
              <input
                type="text"
                {...register('city')}
                placeholder="e.g. Lahore"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Date Range *
              </label>
              <input
                type="text"
                {...register('dateRange')}
                placeholder="e.g. December 12 – 14, 2025"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Footfall Count *
              </label>
              <input
                type="number"
                {...register('footfallNumber', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Vendor Count *
              </label>
              <input
                type="number"
                {...register('vendorCount', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Total GMV *
              </label>
              <input
                type="text"
                {...register('totalRevenueGMV')}
                placeholder="Rs. 42M+"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Satisfaction Rate
              </label>
              <input
                type="text"
                {...register('satisfactionRate')}
                placeholder="96%"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Short Narrative / Impact Summary *
            </label>
            <textarea
              rows={3}
              {...register('narrativeExcerpt')}
              placeholder="A 3-day showcase of artisan studios and culinary craft with record urban footfall..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              {...register('tagsInput')}
              placeholder="e.g. Artisan Craft, Winter Edition, Record Sales"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
              Select Cover Image
            </label>
            <div className="grid grid-cols-3 gap-3">
              {sampleImages.map((img) => (
                <button
                  type="button"
                  key={img.path}
                  onClick={() => setValue('coverImage', img.path)}
                  className="group relative rounded-2xl overflow-hidden border-2 transition-all text-left h-20"
                >
                  <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/20 transition-colors flex items-end p-1.5">
                    <span className="text-[9px] text-white font-medium truncate">{img.label}</span>
                  </div>
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
              {eventToEdit ? 'Save Story' : 'Publish Story'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
