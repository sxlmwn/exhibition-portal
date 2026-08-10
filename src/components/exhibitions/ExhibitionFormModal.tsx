'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, CalendarDays, MapPin, Store, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Exhibition } from '../../types';
import { useAdmin } from '../../context/AdminContext';

const exhibitionSchema = z.z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  venue: z.string().min(3, 'Venue name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  category: z.string().min(2, 'Category is required'),
  totalStallCapacity: z.number().min(10, 'Capacity must be at least 10 stalls').max(500, 'Capacity cannot exceed 500'),
  budgetAllocated: z.number().min(100000, 'Budget must be at least Rs. 100,000'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  coverImage: z.string().min(1, 'Cover image is required'),
  status: z.enum(['upcoming', 'ongoing', 'completed']),
});

type ExhibitionFormData = z.infer<typeof exhibitionSchema>;

interface ExhibitionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  exhibitionToEdit?: Exhibition | null;
}

export const ExhibitionFormModal: React.FC<ExhibitionFormModalProps> = ({
  isOpen,
  onClose,
  exhibitionToEdit
}) => {
  const { addExhibition, updateExhibition } = useAdmin();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ExhibitionFormData>({
    resolver: zodResolver(exhibitionSchema),
    defaultValues: {
      title: '',
      tagline: '',
      city: 'Lahore',
      venue: '',
      startDate: '',
      endDate: '',
      category: 'Lifestyle & Artisan Craft',
      totalStallCapacity: 50,
      budgetAllocated: 3000000,
      description: '',
      coverImage: '/images/More Stalls Added.png',
      status: 'upcoming',
    }
  });

  useEffect(() => {
    if (exhibitionToEdit) {
      reset({
        title: exhibitionToEdit.title,
        tagline: exhibitionToEdit.tagline,
        city: exhibitionToEdit.city,
        venue: exhibitionToEdit.venue,
        startDate: exhibitionToEdit.startDate,
        endDate: exhibitionToEdit.endDate,
        category: exhibitionToEdit.category,
        totalStallCapacity: exhibitionToEdit.totalStallCapacity,
        budgetAllocated: exhibitionToEdit.budgetAllocated,
        description: exhibitionToEdit.description,
        coverImage: exhibitionToEdit.coverImage,
        status: exhibitionToEdit.status,
      });
    } else {
      reset({
        title: '',
        tagline: '',
        city: 'Lahore',
        venue: '',
        startDate: '2026-06-15',
        endDate: '2026-06-17',
        category: 'Lifestyle & Artisan Craft',
        totalStallCapacity: 50,
        budgetAllocated: 3000000,
        description: '',
        coverImage: '/images/More Stalls Added.png',
        status: 'upcoming',
      });
    }
  }, [exhibitionToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: ExhibitionFormData) => {
    if (exhibitionToEdit) {
      updateExhibition(exhibitionToEdit.id, data);
    } else {
      addExhibition(data);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Full-Screen Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-soft-2xl animate-scaleUp">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-sage-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
              {exhibitionToEdit ? 'Edit Edition' : 'New Exhibition'}
            </span>
            <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
              {exhibitionToEdit ? 'Update Exhibition Details' : 'Create Exhibition Edition'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          
          {/* Title & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Exhibition Title *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Spring Artisan Showcase 2026"
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                One-Sentence Tagline *
              </label>
              <input
                type="text"
                {...register('tagline')}
                placeholder="e.g. Premier collective of studio pottery, sustainable apparel, and indie jewelry."
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.tagline && <p className="text-rose-600 text-xs mt-1">{errors.tagline.message}</p>}
            </div>
          </div>

          {/* City, Venue, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Host City *
              </label>
              <select
                {...register('city')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              >
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Multan">Multan</option>
              </select>
              {errors.city && <p className="text-rose-600 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Venue Name *
              </label>
              <input
                type="text"
                {...register('venue')}
                placeholder="e.g. Expo Centre, Hall 1"
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.venue && <p className="text-rose-600 text-xs mt-1">{errors.venue.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              >
                <option value="Lifestyle & Artisan Craft">Lifestyle & Artisan Craft</option>
                <option value="Home, Decor & Wellness">Home, Decor & Wellness</option>
                <option value="Haute Couture & Fine Jewelry">Haute Couture & Fine Jewelry</option>
                <option value="Contemporary Art & Design">Contemporary Art & Design</option>
              </select>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.startDate && <p className="text-rose-600 text-xs mt-1">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.endDate && <p className="text-rose-600 text-xs mt-1">{errors.endDate.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Stalls Capacity & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Total Stall Capacity *
              </label>
              <input
                type="number"
                {...register('totalStallCapacity', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.totalStallCapacity && <p className="text-rose-600 text-xs mt-1">{errors.totalStallCapacity.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Allocated Budget / Funding (PKR) *
              </label>
              <input
                type="number"
                step="50000"
                {...register('budgetAllocated', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
              />
              {errors.budgetAllocated && <p className="text-rose-600 text-xs mt-1">{errors.budgetAllocated.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Description & Logistics Overview *
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Provide event details, VIP preview timing, hall facilities, and booth setups..."
              className="w-full px-4 py-3 rounded-2xl border border-sage-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal bg-cream-50/50"
            />
            {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Cover Image Selector */}
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
                  className="group relative rounded-2xl overflow-hidden border-2 transition-all text-left h-24"
                >
                  <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/20 transition-colors flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">{img.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 py-3 text-xs font-semibold uppercase tracking-wider"
            >
              {exhibitionToEdit ? 'Save Changes' : 'Publish Exhibition'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
