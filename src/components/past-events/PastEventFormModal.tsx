import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, History, CalendarDays, MapPin, Users, TrendingUp, Sparkles, Image as ImageIcon, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { PastEventStory } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';
import { supabase } from '../../lib/supabase';

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
  const [coverMode, setCoverMode] = useState<'preset' | 'upload'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      if (eventToEdit.coverImage && (eventToEdit.coverImage.startsWith('http') || eventToEdit.coverImage.startsWith('data:'))) {
        setCoverMode('upload');
      } else {
        setCoverMode('preset');
      }
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
      setCoverMode('preset');
    }
    setUploadError(null);
    setUploadSuccessName(null);
  }, [eventToEdit, reset, isOpen]);

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
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `pastevent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${cleanFileName}`;

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
        // Fallback to Data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string ?? '';
          setValue('coverImage', result);
          setUploadSuccessName(file.name);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err: any) {
      console.error('Past event image upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: PastEventFormData) => {
    const parsedTags = data.tagsInput
      ? data.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const existingPhotos = eventToEdit?.photos ?? [data.coverImage, '/images/2.jpg'];
    const updatedPhotos = [data.coverImage, ...existingPhotos.filter(p => p !== data.coverImage)];

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
        photos: updatedPhotos,
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
        photos: updatedPhotos,
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                Cover Photo *
              </label>
              <div className="flex items-center bg-cream-100 dark:bg-white/5 p-0.5 rounded-lg border border-sage-200 dark:border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCoverMode('preset')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    coverMode === 'preset'
                      ? 'bg-white dark:bg-white/20 text-charcoal shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    coverMode === 'upload'
                      ? 'bg-white dark:bg-white/20 text-charcoal shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  Device Upload
                </button>
              </div>
            </div>

            {coverMode === 'preset' ? (
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
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-sage-600 bg-sage-50/50 dark:bg-white/10'
                      : 'border-sage-200 dark:border-white/15 hover:border-sage-400 dark:hover:border-white/30 bg-white/50 dark:bg-white/[0.02]'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-2 text-sage-700 dark:text-sage-300">
                      <Loader2 className="w-6 h-6 animate-spin mb-1" />
                      <span className="text-xs font-semibold">Uploading to Supabase Storage...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-white/10 flex items-center justify-center text-sage-800 dark:text-sage-300 mb-1.5">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-charcoal mb-0.5">Click to choose image or drag & drop</span>
                      <span className="text-[10px] text-charcoal-muted font-medium">PNG, JPG, or WebP up to 15MB</span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-rose-600 text-xs">{uploadError}</p>
                )}

                {selectedCover && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-cream-50 dark:bg-white/5 border border-sage-200 dark:border-white/10">
                    <img src={selectedCover} alt="Cover preview" className="w-12 h-10 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-charcoal block truncate">
                        {uploadSuccessName || 'Custom Uploaded Photo'}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Ready to publish
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
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
