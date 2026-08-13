'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  UploadCloud,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Exhibition } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';
import { ModalPortal } from '../common/ModalPortal';

const exhibitionSchema = z.object({
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
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'End date cannot be earlier than start date',
  path: ['endDate'],
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
  const [coverMode, setCoverMode] = useState<'preset' | 'upload'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      coverImage: '/images/1.jpg',
      status: 'upcoming',
    }
  });

  const selectedCover = watch('coverImage');

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
      if (exhibitionToEdit.coverImage && (exhibitionToEdit.coverImage.startsWith('http') || exhibitionToEdit.coverImage.startsWith('data:'))) {
        setCoverMode('upload');
      }
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
        coverImage: '/images/1.jpg',
        status: 'upcoming',
      });
      setCoverMode('preset');
    }
    setUploadError(null);
    setUploadSuccessName(null);
  }, [exhibitionToEdit, reset, isOpen]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessName(null);

    try {
      const fileExt = file.name.split('.').pop() ?? 'jpg';
      const cleanFileName = `exhibition-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${cleanFileName}`;

      // 1. Attempt upload directly to Supabase Storage
      const { data, error } = await supabase.storage
        .from('exhibitions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: pubUrl } = supabase.storage.from('exhibitions').getPublicUrl(filePath);
        setValue('coverImage', pubUrl.publicUrl);
        setUploadSuccessName(file.name);
      } else {
        if (error?.message?.includes('Bucket not found')) {
          const { error: createErr } = await supabase.storage.createBucket('exhibitions', { public: true });
          if (!createErr) {
            const { data: retryData, error: retryErr } = await supabase.storage
              .from('exhibitions')
              .upload(filePath, file, { cacheControl: '3600', upsert: true });
            if (!retryErr && retryData) {
              const { data: pubUrl } = supabase.storage.from('exhibitions').getPublicUrl(filePath);
              setValue('coverImage', pubUrl.publicUrl);
              setUploadSuccessName(file.name);
              setIsUploading(false);
              return;
            }
          }
        }

        // Fallback to Data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setValue('coverImage', result);
          setUploadSuccessName(file.name);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

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
    { label: 'Textile & Heritage Hall', path: '/images/3.jpg' },
    { label: 'Contemporary Art & Studio', path: '/images/4.jpg' },
    { label: 'Culinary Gala & Botanicals', path: '/images/5.jpg' },
    { label: 'Luxury Jewels & Couture', path: '/images/6.jpg' },
    { label: 'Exhibition Hall (Hero)', path: '/images/More Stalls Added.png' },
    { label: 'Outdoor Bazaar Greenery', path: '/images/Exhibition Agency BG.png' },
  ];

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="relative z-10 modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto shadow-soft-2xl">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-sage-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block mb-1">
              {exhibitionToEdit ? 'Edit Exhibition' : 'New Exhibition'}
            </span>
            <h3 className="font-sans text-2xl font-extrabold text-charcoal dark:text-white tracking-tight">
              {exhibitionToEdit ? 'Update Details' : 'Create Exhibition'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          
          {/* Title & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                Event Name *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Spring Artisan Showcase 2026"
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-white/5"
              />
              {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                Short Tagline *
              </label>
              <input
                type="text"
                {...register('tagline')}
                placeholder="e.g. Luxury Crafts & Fashion Apparel"
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-white/5"
              />
              {errors.tagline && <p className="text-rose-600 text-xs mt-1">{errors.tagline.message}</p>}
            </div>
          </div>

          {/* City & Venue & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                City *
              </label>
              <select
                {...register('city')}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-[#1A1D24]"
              >
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Karachi">Karachi</option>
              </select>
              {errors.city && <p className="text-rose-600 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                Venue / Location *
              </label>
              <input
                type="text"
                {...register('venue')}
                placeholder="e.g. Expo Centre, Hall 1"
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-white/5"
              />
              {errors.venue && <p className="text-rose-600 text-xs mt-1">{errors.venue.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-[#1A1D24]"
              >
                <option value="Lifestyle & Artisan Craft">Lifestyle & Artisan Craft</option>
                <option value="Home, Decor & Wellness">Home, Decor & Wellness</option>
                <option value="Haute Couture & Fine Jewelry">Haute Couture & Fine Jewelry</option>
                <option value="Contemporary Art & Design">Contemporary Art & Design</option>
              </select>
            </div>
          </div>

          {/* Dates — always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-white/5"
              />
              {errors.startDate && <p className="text-rose-600 text-xs mt-1">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-white/5"
              />
              {errors.endDate && <p className="text-rose-600 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Describe the event — what's being showcased, where, and any important details for vendors..."
              className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-cream-50/50 dark:bg-white/5"
            />
            {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* More Options Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold text-sage-800 dark:text-sage-300 hover:text-sage-950 dark:hover:text-white transition-colors"
            >
              <span className={`w-4 h-4 rounded border border-sage-300 dark:border-white/20 flex items-center justify-center transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1l4 3-4 3V1z"/></svg>
              </span>
              <span>{showAdvanced ? 'Hide extra options' : 'More options'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 rounded-2xl bg-cream-50/60 dark:bg-white/[0.03] border border-sage-200/60 dark:border-white/10">
                <p className="text-[11px] text-charcoal-muted dark:text-white/50 font-medium">These fields have sensible defaults — only change them if needed.</p>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Stalls & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                      Number of Stalls
                    </label>
                    <input
                      type="number"
                      {...register('totalStallCapacity', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-white/80 dark:bg-white/5"
                    />
                    {errors.totalStallCapacity && <p className="text-rose-600 text-xs mt-1">{errors.totalStallCapacity.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal dark:text-white mb-1.5">
                      Budget (PKR)
                    </label>
                    <input
                      type="number"
                      step="50000"
                      {...register('budgetAllocated', { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal dark:text-white bg-white/80 dark:bg-white/5"
                    />
                    {errors.budgetAllocated && <p className="text-rose-600 text-xs mt-1">{errors.budgetAllocated.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cover Image Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white">
                  Cover Image *
                </label>
                <p className="text-[11px] text-charcoal-muted">Choose from preset agency stock or upload directly from your device</p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-cream-100 dark:bg-white/10 p-1 rounded-lg border border-sage-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setCoverMode('preset')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    coverMode === 'preset'
                      ? 'bg-sage-800 text-cream shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal dark:hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode('upload')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                    coverMode === 'upload'
                      ? 'bg-sage-800 text-cream shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal dark:hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {coverMode === 'preset' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sampleImages.map((img) => {
                  const isSelected = selectedCover === img.path;
                  return (
                    <button
                      type="button"
                      key={img.path}
                      onClick={() => setValue('coverImage', img.path)}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all text-left h-24 ${
                        isSelected 
                          ? 'border-sage-800 ring-2 ring-sage-800/40 shadow-sm' 
                          : 'border-sage-200/60 hover:border-sage-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          {isSelected && (
                            <span className="bg-sage-800 text-cream p-0.5 rounded-full shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-white font-medium truncate">{img.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Dropzone Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-sage-800 bg-sage-50/80 dark:bg-sage-950/30'
                      : 'border-sage-300 dark:border-white/20 bg-cream-50/50 dark:bg-white/[0.02] hover:bg-cream-100/70 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-4 text-sage-800 dark:text-sage-300">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-xs font-bold">Uploading image to Supabase Storage...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center mb-2 shadow-2xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-charcoal dark:text-white">
                        Click to browse or drag & drop image
                      </p>
                      <p className="text-[11px] text-charcoal-muted mt-1 font-light">
                        PNG, JPG, or WebP up to 15MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Error feedback */}
                {uploadError && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Active Cover Preview Bar */}
            {selectedCover && (
              <div className="mt-3 p-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-sage-200/80 dark:border-white/10 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedCover}
                    alt="Selected cover"
                    className="w-12 h-10 rounded-xl object-cover border border-sage-200 dark:border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-sage-800 dark:text-sage-300 block">
                      Active Cover Image
                    </span>
                    <span className="text-xs font-semibold text-charcoal dark:text-white truncate block">
                      {uploadSuccessName || selectedCover.split('/').pop()}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                  Ready
                </span>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="btn-primary px-8 py-3 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {exhibitionToEdit ? 'Save Changes' : 'Save Exhibition'}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
};
