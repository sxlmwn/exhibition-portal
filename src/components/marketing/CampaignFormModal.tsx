'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Megaphone, DollarSign, CalendarDays } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { MarketingCampaign } from '../../types';

const campaignSchema = z.z.object({
  title: z.string().min(3, 'Campaign title is required'),
  platform: z.enum(['Instagram', 'TikTok', 'Meta Ads', 'Google Search', 'Influencer PR', 'Outdoor Billboard']),
  amountSpent: z.number().min(1000, 'Minimum spend is Rs. 1,000'),
  runDuration: z.string().min(3, 'Duration is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  linkedExhibitionId: z.string().min(1, 'Exhibition link is required'),
  leadsGenerated: z.number().min(0),
  reachImpressions: z.string().min(2, 'Reach estimate is required'),
  notes: z.string(),
  status: z.enum(['active', 'completed', 'scheduled']),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addCampaign, exhibitions } = useAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      platform: 'Instagram',
      amountSpent: 75000,
      runDuration: '14 Days',
      startDate: '2026-03-01',
      endDate: '2026-03-14',
      linkedExhibitionId: exhibitions[0]?.id || 'exh-1',
      leadsGenerated: 12,
      reachImpressions: '150,000 reach',
      notes: '',
      status: 'active',
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: CampaignFormData) => {
    const exh = exhibitions.find(e => e.id === data.linkedExhibitionId);

    addCampaign({
      title: data.title,
      platform: data.platform,
      amountSpent: data.amountSpent,
      runDuration: data.runDuration,
      startDate: data.startDate,
      endDate: data.endDate,
      linkedExhibitionId: data.linkedExhibitionId,
      linkedExhibitionName: exh ? exh.title : 'Exhibition',
      leadsGenerated: data.leadsGenerated,
      reachImpressions: data.reachImpressions,
      notes: data.notes,
      status: data.status,
    });

    reset();
    onClose();
  };

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
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
                Growth Log
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                Log Ad Campaign / Outreach
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
              Campaign Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Instagram Studio Reels — Karachi Edition"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
            />
            {errors.title && <p className="text-rose-600 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Platform *
              </label>
              <select
                {...register('platform')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Google Search">Google Search</option>
                <option value="Influencer PR">Influencer PR</option>
                <option value="Outdoor Billboard">Outdoor Billboard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Budget Spent (PKR) *
              </label>
              <input
                type="number"
                step="1000"
                {...register('amountSpent', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Linked Exhibition *
              </label>
              <select
                {...register('linkedExhibitionId')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              >
                {exhibitions.map((exh) => (
                  <option key={exh.id} value={exh.id}>
                    {exh.title} ({exh.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Duration String *
              </label>
              <input
                type="text"
                {...register('runDuration')}
                placeholder="e.g. 14 Days (Feb 20 – Mar 06)"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Estimated Reach / Impressions
              </label>
              <input
                type="text"
                {...register('reachImpressions')}
                placeholder="e.g. 240,000 impressions"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Direct Leads Generated
              </label>
              <input
                type="number"
                {...register('leadsGenerated', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Campaign Notes & Creative Angles
            </label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="Target demographics, influencer handles engaged, ad angles..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500 font-sans"
            />
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
              Log Campaign
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
