'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail, 
  ArrowRight,
  Sparkles,
  LayoutGrid,
  List
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { VendorRequest, RequestStatus } from '../../types';
import { StallAllocationGrid } from '../../components/requests/StallAllocationGrid';
import { RequestActionModal } from '../../components/requests/RequestActionModal';
import { RequestDetailModal } from '../../components/requests/RequestDetailModal';

export default function VendorRequestsPage() {
  const { vendorRequests, exhibitions } = useAdmin();

  const [activeTab, setActiveTab] = useState<'table' | 'floor-plan'>('table');
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>(exhibitions[0]?.id || 'exh-1');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<VendorRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<RequestStatus | null>(null);
  const [detailRequest, setDetailRequest] = useState<VendorRequest | null>(null);

  const filteredRequests = vendorRequests.filter((req) => {
    const matchesExh = selectedExhibitionId === 'All' || req.exhibitionId === selectedExhibitionId;
    const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || req.productCategory === selectedCategory;
    const matchesSearch = req.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.phone.includes(searchQuery);
    return matchesExh && matchesStatus && matchesCategory && matchesSearch;
  });

  const handleOpenAction = (req: VendorRequest, status: RequestStatus) => {
    setSelectedRequest(req);
    setTargetStatus(status);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40';
      case 'rejected':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700/40';
      case 'waitlisted':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700/40';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            EXHIBITOR ONBOARDING
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Vendor Requests & Stalls
          </h2>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-white/[0.06] p-1.5 rounded-full border border-sage-200/60 dark:border-white/10 self-start sm:self-auto shadow-soft-xs backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all glass-rise-btn ${
              activeTab === 'table'
                ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-xs'
                : 'text-charcoal dark:text-white/70 hover:text-charcoal dark:hover:text-white hover:bg-sage-50 dark:hover:bg-white/10'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Applications Table</span>
          </button>
          
          <button
            onClick={() => setActiveTab('floor-plan')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all glass-rise-btn ${
              activeTab === 'floor-plan'
                ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-xs'
                : 'text-charcoal dark:text-white/70 hover:text-charcoal dark:hover:text-white hover:bg-sage-50 dark:hover:bg-white/10'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Interactive Floor Plan</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'table' ? (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-sage-600 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, vendor, phone..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-sage-200 text-xs text-charcoal bg-white/80 outline-none focus:border-sage-500 font-medium glass-input"
              />
            </div>

            {/* Exhibition & Status Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              
              <select
                value={selectedExhibitionId}
                onChange={(e) => setSelectedExhibitionId(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-sage-200 bg-white/80 text-xs font-bold text-charcoal outline-none glass-select"
              >
                <option value="All">All Exhibitions</option>
                {exhibitions.map((exh) => (
                  <option key={exh.id} value={exh.id}>
                    {exh.title} ({exh.city})
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-sage-200 bg-white/80 text-xs font-bold text-charcoal outline-none glass-select"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="rejected">Rejected</option>
              </select>

            </div>

          </div>

          {/* Applications Table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-sage-200/80 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100/90 border-b border-sage-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
                  <tr>
                    <th className="py-4 px-5">Brand & Vendor</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Exhibition</th>
                    <th className="py-4 px-4">Stalls / Budget</th>
                    <th className="py-4 px-4">Contact Details</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {filteredRequests.map((req) => (
                    <tr 
                      key={req.id} 
                      onClick={() => setDetailRequest(req)}
                      className="glass-rise-row hover:bg-white/90 transition-all cursor-pointer"
                    >
                      
                      {/* Brand & Vendor */}
                      <td className="py-4 px-5">
                        <span className="font-sans font-bold text-sm text-charcoal block tracking-tight">
                          {req.brandName}
                        </span>
                        <span className="text-charcoal-muted text-[11px] font-normal">
                          {req.vendorName}
                        </span>
                        {req.notes && (
                          <span className="text-[10px] text-sage-800 italic block mt-0.5 max-w-xs truncate">
                            "{req.notes}"
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-charcoal-light font-medium">
                        {req.productCategory}
                      </td>

                      {/* Exhibition */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-charcoal block">
                          {req.exhibitionName}
                        </span>
                        <span className="text-[10px] text-charcoal-muted font-light">
                          Applied: {req.submittedDate}
                        </span>
                      </td>

                      {/* Stalls & Budget */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-sage-deep block">
                          {req.allocatedStallCode ? `Stall ${req.allocatedStallCode}` : `${req.stallsWanted} Stall(s)`}
                        </span>
                        <span className="text-[10px] text-charcoal-muted font-light">
                          {req.budgetRange}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-medium text-emerald-800 hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{req.phone}</span>
                        </a>
                        <span className="text-[10px] text-charcoal-muted font-light block mt-0.5 truncate max-w-[140px]">
                          {req.email}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status !== 'approved' && (
                            <button
                              onClick={() => handleOpenAction(req, 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors glass-rise-btn"
                              title="Approve Applicant"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {req.status !== 'waitlisted' && (
                            <button
                              onClick={() => handleOpenAction(req, 'waitlisted')}
                              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors glass-rise-btn"
                              title="Move to Waitlist"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {req.status !== 'rejected' && (
                            <button
                              onClick={() => handleOpenAction(req, 'rejected')}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors glass-rise-btn"
                              title="Reject Application"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedExhibitionId(req.exhibitionId);
                              setActiveTab('floor-plan');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sage-800 hover:bg-sage-900 text-cream text-[11px] font-semibold uppercase tracking-wider ml-1 glass-rise-btn"
                          >
                            Allocate
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Visual Floor Plan Grid View */
        <StallAllocationGrid
          selectedExhibitionId={selectedExhibitionId}
          onSelectExhibition={setSelectedExhibitionId}
        />
      )}

      {/* Detail Modal */}
      <RequestDetailModal
        request={detailRequest}
        onClose={() => setDetailRequest(null)}
        onOpenAction={(status) => {
          if (detailRequest) {
            handleOpenAction(detailRequest, status);
          }
        }}
      />

      {/* Action Confirmation Modal */}
      <RequestActionModal
        request={selectedRequest}
        targetStatus={targetStatus}
        onClose={() => {
          setSelectedRequest(null);
          setTargetStatus(null);
        }}
      />

    </div>
  );
}
