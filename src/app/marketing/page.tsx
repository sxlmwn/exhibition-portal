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

export default function MarketingPage() {
  const { campaigns, deleteCampaign, exhibitions } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
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
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Growth & Outreach
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-black text-charcoal tracking-tight">
            Marketing Logs & Lead Attribution
          </h2>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary glass-rise-btn px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>Add Campaign</span>
        </button>
      </div>

      {/* 2 Column Stats / Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Summary cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="kpi-card p-6 rounded-3xl bg-white/80 border border-sage-200 shadow-soft cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-800 block mb-1">
              Total Marketing Investment
            </span>
            <span className="font-sans text-3xl font-black text-charcoal tracking-tight">
              Rs. {(totalMarketingSpend / 100000).toFixed(1)}L
            </span>
            <p className="text-xs text-charcoal-muted mt-2 font-medium">
              Across Instagram Reels, TikTok, Meta Ads & Outdoor
            </p>
          </div>

          <div className="kpi-card p-6 rounded-3xl bg-white/80 border border-sage-200 shadow-soft cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-800 block mb-1">
              Direct Vendor Leads
            </span>
            <span className="font-sans text-3xl font-black text-sage-deep tracking-tight">
              {totalLeads} Applicants
            </span>
            <p className="text-xs text-charcoal-muted mt-2 font-medium">
              Avg Acquisition Cost: Rs. {totalLeads > 0 ? Math.round(totalMarketingSpend / totalLeads).toLocaleString() : 0} / Lead
            </p>
          </div>
        </div>

        {/* Right: Recharts Lead Source breakdown (8 Cols) */}
        <div className="lg:col-span-8">
          <LeadSourceChart campaigns={campaigns} />
        </div>

      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-sage-600 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaign, exhibition..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-sage-200 text-xs text-charcoal bg-white/80 outline-none focus:border-sage-500 font-medium glass-input"
          />
        </div>

        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-sage-200 bg-white/80 text-xs font-bold text-charcoal outline-none cursor-pointer self-start sm:self-auto glass-select"
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
      <div className="glass-card rounded-3xl overflow-hidden border border-sage-200/80 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/90 border-b border-sage-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
              <tr>
                <th className="py-4 px-5">Campaign Title</th>
                <th className="py-4 px-4">Platform</th>
                <th className="py-4 px-4">Spend (PKR)</th>
                <th className="py-4 px-4">Run Duration</th>
                <th className="py-4 px-4">Linked Edition</th>
                <th className="py-4 px-4">Leads / Reach</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {filteredCampaigns.map((cmp) => (
                <tr key={cmp.id} className="glass-rise-row hover:bg-white transition-all">
                  
                  {/* Title & Notes */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-charcoal block">
                      {cmp.title}
                    </span>
                    {cmp.notes && (
                      <span className="text-charcoal-muted text-[11px] font-light block max-w-xs truncate mt-0.5">
                        {cmp.notes}
                      </span>
                    )}
                  </td>

                  {/* Platform */}
                  <td className="py-4 px-4 font-medium text-charcoal">
                    {cmp.platform}
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-sans text-sm font-extrabold text-sage-deep">
                    Rs. {cmp.amountSpent.toLocaleString()}
                  </td>

                  {/* Duration */}
                  <td className="py-4 px-4 text-charcoal-muted font-light">
                    {cmp.runDuration}
                  </td>

                  {/* Linked Exhibition */}
                  <td className="py-4 px-4 font-medium text-charcoal">
                    {cmp.linkedExhibitionName}
                  </td>

                  {/* Leads / Reach */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-charcoal block">
                      {cmp.leadsGenerated} Leads
                    </span>
                    <span className="text-[10px] text-charcoal-muted font-light">
                      {cmp.reachImpressions}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      cmp.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : 'bg-cream-200 text-charcoal border-sage-300'
                    }`}>
                      {cmp.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => {
                        if (confirm('Delete this campaign log?')) {
                          deleteCampaign(cmp.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-charcoal-muted hover:text-rose-700 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Modal */}
      <CampaignFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

    </div>
  );
}
