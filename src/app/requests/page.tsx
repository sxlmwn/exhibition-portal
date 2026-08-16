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
  List,
  ShieldAlert,
  ShieldCheck,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { VendorRequest, RequestStatus } from '../../types';
import { StallAllocationGrid } from '../../components/requests/StallAllocationGrid';
import { RequestActionModal } from '../../components/requests/RequestActionModal';
import { RequestDetailModal } from '../../components/requests/RequestDetailModal';
import { AlternativeStallsModal } from '../../components/requests/AlternativeStallsModal';
import { isFollowUpNeeded, getPendingDays, FOLLOW_UP_THRESHOLD_DAYS } from '../../lib/followUp';
import { isInAllocationWindow, getAllocationWindowDaysRemaining, ALLOCATION_WINDOW_DAYS } from '../../context/AdminContext';

export default function VendorRequestsPage() {
  const { vendorRequests, exhibitions, stalls, allocateStall, updateRequestStatus, currentUser } = useAdmin();
  const canApprove = currentUser.permissions.canApproveRequests;

  const [activeTab, setActiveTab] = useState<'table' | 'floor-plan'>('table');
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllocationWindowOnly, setShowAllocationWindowOnly] = useState<boolean>(false);

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<VendorRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<RequestStatus | null>(null);
  const [detailRequest, setDetailRequest] = useState<VendorRequest | null>(null);
  const [alternativesRequest, setAlternativesRequest] = useState<VendorRequest | null>(null);
  const [targetAlternativeVendor, setTargetAlternativeVendor] = useState<VendorRequest | null>(null);

  // Allocation window exhibitions & active (non-completed) exhibitions
  const allocationWindowExhibitions = exhibitions.filter(isInAllocationWindow);
  const allocationWindowCount = allocationWindowExhibitions.length;
  const activeExhibitions = exhibitions.filter(e => e.status !== 'completed');

  // Exclude requests tied to completed exhibitions unconditionally
  const activeVendorRequests = vendorRequests.filter((req) => {
    const parentExh = exhibitions.find(e => e.id === req.exhibitionId);
    return parentExh ? parentExh.status !== 'completed' : true;
  });

  // Dynamic counts for quick filter pills (computed reactively from active requests)
  const followUpCount = activeVendorRequests.filter((r) => isFollowUpNeeded(r)).length;
  const pendingCount = activeVendorRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = activeVendorRequests.filter((r) => r.status === 'approved').length;
  const waitlistedCount = activeVendorRequests.filter((r) => r.status === 'waitlisted').length;

  const filteredRequests = activeVendorRequests.filter((req) => {
    // If allocation window filter is on, only show requests for exhibitions in allocation window
    if (showAllocationWindowOnly) {
      const reqExhibition = exhibitions.find(e => e.id === req.exhibitionId);
      if (!reqExhibition || !isInAllocationWindow(reqExhibition)) {
        return false;
      }
    }

    const matchesExh = selectedExhibitionId === 'All' || req.exhibitionId === selectedExhibitionId;
    const matchesCategory = selectedCategory === 'All' || req.productCategory === selectedCategory;
    const matchesSearch = (req.brandName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.phone || '').includes(searchQuery) ||
                          (req.referenceId || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (selectedStatus === 'needs-follow-up') {
      matchesStatus = isFollowUpNeeded(req);
    } else if (selectedStatus !== 'All') {
      matchesStatus = req.status === selectedStatus;
    }

    return matchesExh && matchesCategory && matchesSearch && matchesStatus;
  });

  const handleOpenAction = (req: VendorRequest, status: RequestStatus) => {
    if (!canApprove) return;
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
            VENDOR REQUESTS
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
            Vendor Requests & Stalls
          </h2>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/[0.06] p-1.5 rounded-lg border border-sage-200/60 dark:border-white/10 self-start sm:self-auto shadow-soft-xs backdrop-blur-sm">
          <button
            onClick={() => {
              setActiveTab('table');
              setTargetAlternativeVendor(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all glass-rise-btn ${
              activeTab === 'table'
                ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-xs'
                : 'text-charcoal dark:text-white/70 hover:text-charcoal dark:hover:text-white hover:bg-sage-50 dark:hover:bg-white/10'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Applications</span>
          </button>
          
          <button
            onClick={() => setActiveTab('floor-plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all glass-rise-btn ${
              activeTab === 'floor-plan'
                ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-xs'
                : 'text-charcoal dark:text-white/70 hover:text-charcoal dark:hover:text-white hover:bg-sage-50 dark:hover:bg-white/10'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Floor Map</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'table' ? (
        <div className="space-y-6">
          
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedStatus('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedStatus === 'All'
                  ? 'bg-sage-800 text-cream dark:bg-sage-600 dark:text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 text-charcoal-muted dark:text-white/70 hover:bg-cream-100 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
              }`}
            >
              All Applications ({activeVendorRequests.length})
            </button>

            <button
              onClick={() => setShowAllocationWindowOnly(!showAllocationWindowOnly)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                showAllocationWindowOnly
                  ? 'bg-rose-800 text-white dark:bg-rose-700 dark:text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 text-rose-900 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-white/10 border border-rose-300 dark:border-rose-700/60'
              }`}
              title={`Show only exhibitions in allocation window (${ALLOCATION_WINDOW_DAYS} days after booking deadline)`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
              <span>Allocation Window ({allocationWindowCount})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('needs-follow-up')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                selectedStatus === 'needs-follow-up'
                  ? 'bg-amber-800 text-cream dark:bg-amber-700 dark:text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-white/10 border border-amber-300 dark:border-amber-700/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Needs Follow-up ({followUpCount})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedStatus === 'pending'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 text-charcoal-muted dark:text-white/70 hover:bg-cream-100 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
              }`}
            >
              Pending ({pendingCount})
            </button>

            <button
              onClick={() => setSelectedStatus('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                selectedStatus === 'approved'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 text-charcoal-muted dark:text-white/70 hover:bg-cream-100 dark:hover:bg-white/10 border border-sage-200 dark:border-white/10'
              }`}
            >
              Assigned ({approvedCount})
            </button>
          </div>

          {/* Filter Bar */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-sage-600 dark:text-sage-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor name, brand, phone, ref ID..."
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input"
              />
            </div>

            {/* Exhibition & Status Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              
              <select
                value={selectedExhibitionId}
                onChange={(e) => setSelectedExhibitionId(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 bg-white/80 dark:bg-[#1A1D24] text-xs font-bold text-charcoal dark:text-white outline-none glass-select cursor-pointer"
              >
                <option value="All">
                  {showAllocationWindowOnly ? 'Allocation Window Exhibitions' : 'All Active Exhibitions'}
                </option>
                {(showAllocationWindowOnly ? allocationWindowExhibitions : activeExhibitions).map((exh) => (
                  <option key={exh.id} value={exh.id}>
                    {exh.title} ({exh.city})
                    {showAllocationWindowOnly && ` (${getAllocationWindowDaysRemaining(exh)}d left)`}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 bg-white/80 dark:bg-[#1A1D24] text-xs font-bold text-charcoal dark:text-white outline-none glass-select cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="needs-follow-up">⚠️ Needs Follow-up ({FOLLOW_UP_THRESHOLD_DAYS}+ days pending)</option>
                <option value="pending">Pending</option>
                <option value="approved">Assigned</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

          </div>

          {/* Applications Table */}
          <div className="glass-card rounded-2xl overflow-hidden border border-sage-200/80 dark:border-white/10 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100/90 dark:bg-white/5 border-b border-sage-200 dark:border-white/10 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted dark:text-white/60">
                  <tr>
                    <th className="py-4 px-5">Vendor & Brand</th>
                    <th className="py-4 px-4">Event</th>
                    <th className="py-4 px-4">Stall / Budget</th>
                    <th className="py-4 px-4">Phone / WhatsApp</th>
                    <th className="py-4 px-4">Status & Flag</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100 dark:divide-white/5">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-charcoal-muted dark:text-white/50">
                        <Store className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-sm">No applications found</p>
                        <p className="text-xs">Try changing what you searched or selected above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const needsFollowUp = isFollowUpNeeded(req);
                      const pendingDays = getPendingDays(req);

                      return (
                        <tr 
                          key={req.id} 
                          onClick={() => setDetailRequest(req)}
                          className={`glass-rise-row hover:bg-white/90 dark:hover:bg-white/5 transition-all cursor-pointer ${
                            needsFollowUp ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          
                          {/* Vendor & Brand */}
                          <td className="py-4 px-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-sans font-bold text-sm text-charcoal dark:text-white block tracking-tight">
                                {req.brandName}
                              </span>
                              {needsFollowUp && (
                                <span 
                                  className="status-badge inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs"
                                  title={`Pending review for ${pendingDays} days without confirmed booking. Staff follow-up recommended.`}
                                >
                                  <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                  <span>Follow Up ({pendingDays}d)</span>
                                </span>
                              )}
                            </div>
                            <span className="text-charcoal-muted dark:text-white/60 text-[11px] font-normal block mt-0.5">
                              {req.vendorName} &bull; {req.productCategory}
                              {req.referenceId && ` • ref: ${req.referenceId}`}
                            </span>
                          </td>

                          {/* Event */}
                          <td className="py-4 px-4">
                            <span className="font-semibold text-charcoal dark:text-white block">
                              {req.exhibitionName}
                            </span>
                            <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-light">
                              Applied: {req.submittedDate}
                            </span>
                          </td>

                          {/* Stalls & Budget */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-sage-deep dark:text-sage-300 block">
                              {req.allocatedStallCode ? `Stall ${req.allocatedStallCode}` : `${req.stallsWanted} Stall(s)`}
                            </span>
                            <span className="text-[10px] text-charcoal-muted dark:text-white/50 font-light">
                              {req.budgetRange}
                            </span>
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
                            >
                              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                              <span>{req.phone || 'No phone'}</span>
                            </a>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className={`status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                              {req.status === 'approved' ? 'Assigned' : req.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {(() => {
                                // Fix 1: If stall is already allocated, render static non-interactive Assigned label
                                if (req.allocatedStallCode) {
                                  return (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/40 shadow-2xs">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Assigned — {req.allocatedStallCode}</span>
                                    </span>
                                  );
                                }

                                // Match requested stall if available
                                const reqStall = stalls.find(
                                  s => (req.requestedStallId && s.id === req.requestedStallId) ||
                                       (req.preferredStallCode && s.code === req.preferredStallCode)
                                );

                                const isRequestedStallAvailable = reqStall && reqStall.status === 'available';

                                return (
                                  <>
                                    {/* Reject Button (Only for pending requests) */}
                                    {canApprove && req.status === 'pending' && (
                                      <button
                                        onClick={() => handleOpenAction(req, 'rejected')}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition-colors glass-rise-btn flex items-center gap-1"
                                        title="Reject Application"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                      </button>
                                    )}

                                    {isRequestedStallAvailable ? (
                                      /* Option 1: Assign Requested Stall directly */
                                      <button
                                        onClick={() => {
                                          allocateStall(reqStall.id, req.id, req.vendorName, req.brandName);
                                          updateRequestStatus(req.id, 'approved', reqStall.code);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors glass-rise-btn flex items-center gap-1 shadow-2xs"
                                        title={`Assign Requested Stall ${reqStall.code}`}
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Assign {reqStall.code}</span>
                                      </button>
                                    ) : (
                                      /* Option 2: Assign Alternative via Floor Map */
                                      <button
                                        onClick={() => {
                                          if (req.exhibitionId) {
                                            setSelectedExhibitionId(req.exhibitionId);
                                          }
                                          setTargetAlternativeVendor(req);
                                          setActiveTab('floor-plan');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-sage-800 dark:bg-sage-700 hover:bg-sage-900 text-cream text-[11px] font-bold transition-colors glass-rise-btn flex items-center gap-1 shadow-2xs"
                                        title="Open Floor Map to choose and allocate an available stall"
                                      >
                                        <Store className="w-3.5 h-3.5" />
                                        <span>Assign Alternative</span>
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Visual Floor Plan Grid View */
        showAllocationWindowOnly && allocationWindowExhibitions.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="font-sans text-xl font-bold text-charcoal dark:text-white mb-1 tracking-tight">
              No Exhibitions in Allocation Window
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-white/50 max-w-sm mx-auto mb-5 font-light">
              There are currently no exhibitions that are within the {ALLOCATION_WINDOW_DAYS}-day allocation window after their booking deadline.
            </p>
            <button
              onClick={() => setShowAllocationWindowOnly(false)}
              className="text-xs font-semibold text-sage-800 dark:text-sage-300 underline"
            >
              View all exhibitions instead
            </button>
          </div>
        ) : (
          <StallAllocationGrid
            selectedExhibitionId={selectedExhibitionId === 'All' ? (allocationWindowExhibitions[0]?.id ?? exhibitions[0]?.id ?? '2') : selectedExhibitionId}
            onSelectExhibition={setSelectedExhibitionId}
            allocationWindowExhibitions={allocationWindowExhibitions}
            showAllocationWindowOnly={showAllocationWindowOnly}
            targetAlternativeVendor={targetAlternativeVendor}
            onClearTargetAlternativeVendor={() => setTargetAlternativeVendor(null)}
          />
        )
      )}

      {/* Detail Modal */}
      <RequestDetailModal
        request={detailRequest}
        onClose={() => setDetailRequest(null)}
        onOpenAction={(status) => {
          if (detailRequest && canApprove) {
            handleOpenAction(detailRequest, status);
          }
        }}
        onAllocateStallClick={(req) => {
          if (req.exhibitionId) {
            setSelectedExhibitionId(req.exhibitionId);
          }
          setTargetAlternativeVendor(req);
          setActiveTab('floor-plan');
          setDetailRequest(null);
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

      {/* Alternative Stalls Modal */}
      {alternativesRequest && (
        <AlternativeStallsModal
          request={alternativesRequest}
          exhibition={exhibitions.find(e => e.id === alternativesRequest.exhibitionId)}
          onClose={() => setAlternativesRequest(null)}
        />
      )}

    </div>
  );
}
