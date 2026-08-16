'use client';

import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { MarketingCampaign } from '../../types';
import { CampaignFormModal } from '../../components/marketing/CampaignFormModal';
import { LeadSourceChart } from '../../components/marketing/LeadSourceChart';
import { CampaignDetailModal } from '../../components/marketing/CampaignDetailModal';

export default function MarketingPage() {
  const { campaigns, deleteCampaign, exhibitions, currentUser } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState<MarketingCampaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  const filteredCampaigns = campaigns.filter((cmp) => {
    const matchesSearch = cmp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cmp.linkedExhibitionName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlat = selectedPlatform === 'All' || cmp.platform === selectedPlatform;
    return matchesSearch && matchesPlat;
  });

  const totalMarketingSpend = campaigns.reduce((acc, c) => acc + c.amountSpent, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            MARKETING & ADS
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
            Marketing & Campaigns
          </h2>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary glass-rise-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Campaign</span>
        </button>
      </div>

      {/* 2 Column Stats / Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Summary cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="kpi-card p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-sage-200 dark:border-white/10 shadow-soft">
            <span className="eyebrow-label">
              TOTAL AD SPEND
            </span>
            <span className="font-sans text-3xl font-bold text-charcoal dark:text-white tracking-tight">
              Rs. {(totalMarketingSpend / 100000).toFixed(1)}L
            </span>
            <p className="text-xs text-charcoal-muted dark:text-white/60 mt-2 font-medium">
              Instagram, TikTok, Meta Ads & Outdoor promotions
            </p>
          </div>

          <div className="kpi-card p-6 rounded-2xl bg-white/80 dark:bg-white/5 border border-sage-200 dark:border-white/10 shadow-soft">
            <span className="eyebrow-label">
              VENDOR LEADS
            </span>
            <span className="font-sans text-3xl font-bold text-sage-deep dark:text-sage-200 tracking-tight">
              {totalLeads} Applicants
            </span>
            <p className="text-xs text-charcoal-muted dark:text-white/60 mt-2 font-medium">
              Avg Cost per Lead: Rs. {totalLeads > 0 ? Math.round(totalMarketingSpend / totalLeads).toLocaleString() : 0}
            </p>
          </div>
        </div>

        {/* Right: Recharts Lead Source breakdown (8 Cols) */}
        <div className="lg:col-span-8">
          <LeadSourceChart campaigns={campaigns} />
        </div>

      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-sage-200/80 dark:border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-sage-600 dark:text-sage-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name or event..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input"
          />
        </div>

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 bg-white/80 dark:bg-[#1A1D24] text-xs font-bold text-charcoal dark:text-white outline-none cursor-pointer self-start sm:self-auto glass-select"
        >
          <option value="All">All Platforms</option>
          <option value="Instagram">Instagram</option>
          <option value="TikTok">TikTok</option>
          <option value="Meta Ads">Meta Ads</option>
          <option value="Google Search">Google Search</option>
          <option value="Influencer PR">Influencer PR</option>
        </select>
      </div>

      {/* Campaigns Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-sage-200/80 dark:border-white/10 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/90 dark:bg-white/5 border-b border-sage-200 dark:border-white/10 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted dark:text-white/60">
              <tr>
                <th className="py-4 px-5">Campaign</th>
                <th className="py-4 px-4">Platform</th>
                <th className="py-4 px-4">Ad Spend</th>
                <th className="py-4 px-4">Event</th>
                <th className="py-4 px-4">Leads / Reach</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-white/5">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-muted dark:text-white/50">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No campaigns found</p>
                    <p className="text-xs">Try adjusting your filters or add a new campaign.</p>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((cmp) => (
                  <tr 
                    key={cmp.id} 
                    onClick={() => setDetailCampaign(cmp)}
                    className="glass-rise-row hover:bg-white/90 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    
                    {/* Title & Notes */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-charcoal dark:text-white block">
                        {cmp.title}
                      </span>
                      <span className="text-charcoal-muted dark:text-white/60 text-[11px] font-normal block max-w-xs truncate mt-0.5">
                        {cmp.runDuration}{cmp.notes ? ` • ${cmp.notes}` : ''}
                      </span>
                    </td>

                    {/* Platform */}
                    <td className="py-4 px-4 font-medium text-charcoal dark:text-white">
                      {cmp.platform}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-sans text-sm font-extrabold text-sage-deep dark:text-sage-300">
                      Rs. {cmp.amountSpent.toLocaleString()}
                    </td>

                    {/* Linked Exhibition */}
                    <td className="py-4 px-4 font-medium text-charcoal dark:text-white">
                      {cmp.linkedExhibitionName}
                    </td>

                    {/* Leads / Reach */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-charcoal dark:text-white block">
                        {cmp.leadsGenerated} Leads
                      </span>
                      <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-light">
                        {cmp.reachImpressions}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                        cmp.status === 'active' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                          : 'bg-cream-200 dark:bg-white/10 text-charcoal dark:text-white/80 border-sage-300 dark:border-white/10'
                      }`}>
                        {cmp.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      {currentUser.permissions.canDeleteRecords && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this campaign log?')) {
                              deleteCampaign(cmp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-charcoal-muted hover:text-rose-700 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal with Full Screen Frosted Glass Blur */}
      <CampaignDetailModal
        campaign={detailCampaign}
        onClose={() => setDetailCampaign(null)}
      />

      {/* Add Campaign Modal */}
      <CampaignFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

    </div>
  );
}
