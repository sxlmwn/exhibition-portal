'use client';

import React from 'react';
import { 
  X, 
  Megaphone, 
  CalendarDays, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Sparkles, 
  Store, 
  Trash2
} from 'lucide-react';
import { MarketingCampaign } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface CampaignDetailModalProps {
  campaign: MarketingCampaign | null;
  onClose: () => void;
}

export const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({
  campaign,
  onClose
}) => {
  const { deleteCampaign, currentRole } = useAdmin();

  if (!campaign) return null;

  const costPerLead = campaign.leadsGenerated > 0 
    ? Math.round(campaign.amountSpent / campaign.leadsGenerated) 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'completed':
        return 'bg-sage-100 dark:bg-sage-900/60 text-sage-900 dark:text-sage-200 border-sage-300 dark:border-sage-700';
      default:
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200';
      case 'meta ads':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200';
      case 'tiktok':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200';
    }
  };

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
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 flex items-center justify-center text-sage-800 dark:text-sage-300 font-bold">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getPlatformBadge(campaign.platform)}`}>
                  {campaign.platform}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                {campaign.title}
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
          
          {/* Key Metrics Counter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Ad Investment
              </span>
              <span className="font-sans text-2xl font-bold text-charcoal">
                Rs. {campaign.amountSpent.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Verified Leads
              </span>
              <span className="font-sans text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                {campaign.leadsGenerated} Vendors
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Cost Per Lead (CPL)
              </span>
              <span className="font-sans text-2xl font-bold text-sage-800 dark:text-sage-300">
                Rs. {costPerLead}
              </span>
            </div>

          </div>

          {/* Campaign Scope & Dates */}
          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block">
              Associated Exhibition & Timeline
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-charcoal">
                <Store className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>{campaign.linkedExhibitionName}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted">
                <CalendarDays className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Duration: <strong className="text-charcoal">{campaign.runDuration}</strong></span>
              </div>
            </div>
          </div>

          {/* Notes & Strategy */}
          {campaign.notes && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted block mb-1">
                Creative Strategy & Ad Notes
              </span>
              <p className="text-xs text-charcoal leading-relaxed font-medium">
                {campaign.notes}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-charcoal-muted font-medium">
              Campaign ID: <strong className="text-charcoal font-mono">{campaign.id}</strong>
            </span>

            {currentRole === 'owner' && (
              <button
                onClick={() => {
                  if (confirm(`Delete campaign "${campaign.title}"?`)) {
                    deleteCampaign(campaign.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Log</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
