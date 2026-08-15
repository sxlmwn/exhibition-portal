'use client';

import React, { useState } from 'react';
import { 
  Store, 
  CheckCircle2, 
  UserCheck, 
  X, 
  Sparkles, 
  DoorOpen, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Tag,
  Lock
} from 'lucide-react';
import { StallSlot, VendorRequest, Exhibition } from '../../types';
import { useAdmin, getAllocationWindowDaysRemaining } from '../../context/AdminContext';

interface StallAllocationGridProps {
  selectedExhibitionId: string;
  onSelectExhibition: (id: string) => void;
  allocationWindowExhibitions?: any[];
  showAllocationWindowOnly?: boolean;
}

export const StallAllocationGrid: React.FC<StallAllocationGridProps> = ({
  selectedExhibitionId,
  onSelectExhibition,
  allocationWindowExhibitions = [],
  showAllocationWindowOnly = false
}) => {
  const { exhibitions, stalls, vendorRequests, allocateStall, releaseStall, currentUser } = useAdmin();
  const isOwner = currentUser.permissions.canApproveRequests || currentUser.role === 'owner';

  const [selectedStall, setSelectedStall] = useState<StallSlot | null>(null);
  const [vendorToAssignId, setVendorToAssignId] = useState<string>('');

  const displayExhibitions = showAllocationWindowOnly ? allocationWindowExhibitions : exhibitions;
  const currentExhibition = displayExhibitions.find(e => e.id === selectedExhibitionId) || displayExhibitions[0];
  const exhibitionStalls = stalls.filter(s => s.exhibitionId === (currentExhibition ? currentExhibition.id : selectedExhibitionId));

  // Eligible vendors for assignment sorted with specific stall applicants first
  const eligibleRequests = vendorRequests
    .filter(r => 
      r.exhibitionId === (currentExhibition ? currentExhibition.id : selectedExhibitionId) && 
      (r.status === 'pending' || r.status === 'approved' || r.status === 'waitlisted') &&
      !r.allocatedStallCode
    )
    .sort((a, b) => {
      const aMatches = selectedStall && (a.requestedStallId === selectedStall.id || a.preferredStallCode === selectedStall.code) ? -1 : 0;
      const bMatches = selectedStall && (b.requestedStallId === selectedStall.id || b.preferredStallCode === selectedStall.code) ? -1 : 0;
      return aMatches - bMatches;
    });

  const handleStallClick = (stall: StallSlot) => {
    setSelectedStall(stall);
    const matchingReq = eligibleRequests.find(
      r => (r.requestedStallId && r.requestedStallId === stall.id) || (r.preferredStallCode && r.preferredStallCode === stall.code)
    );
    if (matchingReq) {
      setVendorToAssignId(matchingReq.id);
    } else if (eligibleRequests.length > 0) {
      setVendorToAssignId(eligibleRequests[0].id);
    }
  };

  const handleConfirmAllocation = () => {
    if (!selectedStall || !vendorToAssignId) return;
    if (selectedStall.status === 'booked') {
      alert('This stall is already booked.');
      return;
    }
    const req = vendorRequests.find(r => r.id === vendorToAssignId);
    if (!req) return;

    allocateStall(selectedStall.id, req.id, req.vendorName, req.brandName);
    setSelectedStall(null);
  };

  const handleRelease = (stallId: string) => {
    if (confirm('Release this stall back to available status?')) {
      releaseStall(stallId);
      setSelectedStall(null);
    }
  };

  // Sort stalls ascending by stall number (A-01 to A-06, B-01 to B-06, C-01 to C-06)
  const sortedStalls = [...exhibitionStalls].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  const rowAStalls = sortedStalls.filter(s => s.code.startsWith('A'));
  const rowBStalls = sortedStalls.filter(s => s.code.startsWith('B'));
  const rowCStalls = sortedStalls.filter(s => s.code.startsWith('C'));

  const availableCount = sortedStalls.filter(s => s.status === 'available').length;
  const bookedCount = sortedStalls.filter(s => s.status !== 'available').length;

  return (
    <div className="space-y-6">
      
      {/* Top Selector & Legend */}
      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block mb-1">
            Floor Map & Stall Allocation
          </span>
          <div className="flex items-center gap-3">
            <select
              value={selectedExhibitionId}
              onChange={(e) => onSelectExhibition(e.target.value)}
              className="font-sans text-lg sm:text-xl font-bold text-charcoal dark:text-white bg-white/70 dark:bg-[#1A1D24] hover:bg-white border-2 border-sage-200 dark:border-white/10 hover:border-sage-400 focus:border-sage-700 outline-none px-3.5 py-1.5 rounded-lg cursor-pointer tracking-tight glass-select"
            >
              {displayExhibitions.map((exh) => (
                <option key={exh.id} value={exh.id}>
                  {exh.title} ({exh.city})
                  {showAllocationWindowOnly && exh.stallRegistrationDeadline && ` (${getAllocationWindowDaysRemaining(exh)}d left)`}
                </option>
              ))}
            </select>
            {showAllocationWindowOnly && currentExhibition?.stallRegistrationDeadline && (
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/60">
                {getAllocationWindowDaysRemaining(currentExhibition)} days remaining
              </span>
            )}
          </div>
        </div>

        {/* High-Contrast Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-white/80 dark:bg-white/5 px-5 py-2.5 rounded-lg border border-sage-200 dark:border-white/10 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950" />
            <span className="text-charcoal-muted dark:text-white/60 font-medium">Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-700 dark:bg-emerald-600 ring-2 ring-emerald-300" />
            <span className="text-charcoal dark:text-white font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-white/20 border border-slate-300 dark:border-white/30 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-slate-600 dark:text-white/70" />
            </span>
            <span className="text-charcoal-muted dark:text-white/60 font-medium">Booked ({bookedCount})</span>
          </div>
        </div>
      </div>

      {/* Main Floor Grid + Detail Assignment Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Blueprint Layout Area (8 Cols) */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-sage-200 dark:border-white/10 relative overflow-hidden">
          
          {/* Main Entrance Marker */}
          <div className="w-full mb-8 pb-4 border-b border-dashed border-sage-200 dark:border-white/10 flex items-center justify-between text-xs text-charcoal-muted dark:text-white/60">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              <span className="font-bold uppercase tracking-wider text-charcoal dark:text-white">Main Entrance</span>
            </div>
            <span className="text-[11px] bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 px-3 py-1 rounded-full font-semibold">
              Entry Gate
            </span>
          </div>

          {/* Row A */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted dark:text-white/60 mb-3 uppercase tracking-wider">
              <span>Row A &bull; Front Row</span>
              <span className="text-sage-700 dark:text-sage-300 font-medium">Corner & Medium</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {rowAStalls.map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 min-h-[105px] text-center border-2 glass-rise-btn cursor-pointer ${
                      isBooked
                        ? 'bg-slate-100/90 dark:bg-white/5 border-dashed border-slate-300 dark:border-white/20 opacity-60 text-slate-700 dark:text-white/80'
                        : isSelected
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-soft-lg ring-4 ring-emerald-300 dark:ring-emerald-900 scale-105 z-10'
                        : 'bg-white dark:bg-white/10 border-emerald-300/80 dark:border-emerald-500/40 hover:border-emerald-500 text-charcoal dark:text-white shadow-2xs'
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : isBooked ? 'text-slate-600 dark:text-white/60' : 'text-charcoal dark:text-white'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-0.5 px-1.5 py-0.2 rounded ${
                      isSelected 
                        ? 'text-emerald-100 bg-white/10' 
                        : 'text-charcoal-muted dark:text-white/60 bg-cream-100 dark:bg-white/5'
                    }`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-slate-700 dark:text-white/90 mt-1 truncate max-w-[95%] block bg-slate-200/90 dark:bg-black/40 px-1.5 py-0.5 rounded flex items-center justify-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{stall.assignedBrandName || 'Booked'}</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold mt-1 ${isSelected ? 'text-white' : 'text-emerald-800 dark:text-emerald-400'}`}>
                        Rs. {(stall.price / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Walkway */}
          <div className="my-6 py-2.5 bg-cream-200/80 dark:bg-white/5 rounded-lg border border-dashed border-sage-300 dark:border-white/10 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-sage-800 dark:text-sage-300">
              &larr; Central Walkway &bull; Main Aisle &rarr;
            </span>
          </div>

          {/* Row B */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted dark:text-white/60 mb-3 uppercase tracking-wider">
              <span>Row B &bull; Middle Row</span>
              <span className="text-sage-700 dark:text-sage-300 font-medium">Premium & Medium</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {rowBStalls.map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 min-h-[105px] text-center border-2 glass-rise-btn cursor-pointer ${
                      isBooked
                        ? 'bg-slate-100/90 dark:bg-white/5 border-dashed border-slate-300 dark:border-white/20 opacity-60 text-slate-700 dark:text-white/80'
                        : isSelected
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-soft-lg ring-4 ring-emerald-300 dark:ring-emerald-900 scale-105 z-10'
                        : 'bg-white dark:bg-white/10 border-emerald-300/80 dark:border-emerald-500/40 hover:border-emerald-500 text-charcoal dark:text-white shadow-2xs'
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : isBooked ? 'text-slate-600 dark:text-white/60' : 'text-charcoal dark:text-white'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-0.5 px-1.5 py-0.2 rounded ${
                      isSelected 
                        ? 'text-emerald-100 bg-white/10' 
                        : 'text-charcoal-muted dark:text-white/60 bg-cream-100 dark:bg-white/5'
                    }`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-slate-700 dark:text-white/90 mt-1 truncate max-w-[95%] block bg-slate-200/90 dark:bg-black/40 px-1.5 py-0.5 rounded flex items-center justify-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{stall.assignedBrandName || 'Booked'}</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold mt-1 ${isSelected ? 'text-white' : 'text-emerald-800 dark:text-emerald-400'}`}>
                        Rs. {(stall.price / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row C */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted dark:text-white/60 mb-3 uppercase tracking-wider">
              <span>Row C &bull; Back Row</span>
              <span className="text-sage-700 dark:text-sage-300 font-medium">Standard</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {rowCStalls.map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 min-h-[105px] text-center border-2 glass-rise-btn cursor-pointer ${
                      isBooked
                        ? 'bg-slate-100/90 dark:bg-white/5 border-dashed border-slate-300 dark:border-white/20 opacity-60 text-slate-700 dark:text-white/80'
                        : isSelected
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-soft-lg ring-4 ring-emerald-300 dark:ring-emerald-900 scale-105 z-10'
                        : 'bg-white dark:bg-white/10 border-emerald-300/80 dark:border-emerald-500/40 hover:border-emerald-500 text-charcoal dark:text-white shadow-2xs'
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : isBooked ? 'text-slate-600 dark:text-white/60' : 'text-charcoal dark:text-white'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-0.5 px-1.5 py-0.2 rounded ${
                      isSelected 
                        ? 'text-emerald-100 bg-white/10' 
                        : 'text-charcoal-muted dark:text-white/60 bg-cream-100 dark:bg-white/5'
                    }`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-slate-700 dark:text-white/90 mt-1 truncate max-w-[95%] block bg-slate-200/90 dark:bg-black/40 px-1.5 py-0.5 rounded flex items-center justify-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{stall.assignedBrandName || 'Booked'}</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold mt-1 ${isSelected ? 'text-white' : 'text-emerald-800 dark:text-emerald-400'}`}>
                        Rs. {(stall.price / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Stage Marker */}
          <div className="w-full mt-8 pt-4 border-t border-dashed border-sage-200 dark:border-white/10 flex items-center justify-between text-xs text-charcoal-muted dark:text-white/60">
            <span className="font-bold uppercase tracking-wider text-charcoal dark:text-white">Back Stage Area</span>
            <span className="text-[11px] bg-cream-200 dark:bg-white/10 text-charcoal-muted dark:text-white/60 px-3 py-1 rounded-full">
              Exit
            </span>
          </div>

        </div>

        {/* Stall Inspector & Assignment Desk (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-3xl sticky top-28">
          
          {selectedStall ? (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block">
                    Stall Details
                  </span>
                  <h3 className="font-sans text-3xl font-extrabold text-charcoal dark:text-white tracking-tight">
                    Stall {selectedStall.code}
                  </h3>
                </div>
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-sage-200 dark:border-white/10 bg-cream-100 dark:bg-white/5 text-charcoal dark:text-white">
                  {selectedStall.tierName}
                </span>
              </div>

              {/* Specs Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-sage-100 dark:border-white/10">
                  <span className="text-charcoal-muted dark:text-white/60">Size:</span>
                  <span className="font-semibold text-charcoal dark:text-white">{selectedStall.dimensions}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sage-100 dark:border-white/10">
                  <span className="text-charcoal-muted dark:text-white/60">Price:</span>
                  <span className="font-sans text-base font-extrabold text-sage-deep dark:text-sage-300">
                    Rs. {selectedStall.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sage-100 dark:border-white/10">
                  <span className="text-charcoal-muted dark:text-white/60">Status:</span>
                  <span className={`font-bold capitalize ${selectedStall.status === 'booked' ? 'text-slate-600 dark:text-white/70' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {selectedStall.status}
                  </span>
                </div>
              </div>

              {/* If already booked: Show assigned vendor details & release option */}
              {selectedStall.status === 'booked' ? (
                <div className="p-4 rounded-xl bg-cream-100 dark:bg-white/5 border border-sage-200 dark:border-white/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block mb-1">
                    Booked By
                  </span>
                  <h4 className="font-sans text-lg font-bold text-charcoal dark:text-white tracking-tight">
                    {selectedStall.assignedBrandName || 'Booked Vendor'}
                  </h4>
                  {selectedStall.assignedVendorName && (
                    <p className="text-xs text-charcoal-muted dark:text-white/60 font-light mt-0.5">
                      Contact: {selectedStall.assignedVendorName}
                    </p>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleRelease(selectedStall.id)}
                      className="w-full mt-4 py-2.5 rounded-lg border border-rose-300 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Free Up Stall
                    </button>
                  )}
                </div>
              ) : (
                /* If available: Show dropdown to assign to an applicant */
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                      Assign to Vendor Applicant *
                    </label>
                    
                    {eligibleRequests.length > 0 ? (
                      <select
                        value={vendorToAssignId}
                        onChange={(e) => setVendorToAssignId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-sage-200 dark:border-white/10 bg-white dark:bg-[#1A1D24] text-xs font-medium text-charcoal dark:text-white outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200 cursor-pointer"
                      >
                        {eligibleRequests.map((req) => {
                          const isSpecificallyRequested = selectedStall && (req.requestedStallId === selectedStall.id || req.preferredStallCode === selectedStall.code);
                          return (
                            <option key={req.id} value={req.id}>
                              {isSpecificallyRequested ? '★ [Requested This Stall] ' : ''}
                              {req.brandName} — {req.vendorName} ({req.productCategory})
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <p className="text-xs text-charcoal-muted dark:text-white/60 p-3 rounded-lg bg-cream-50 dark:bg-white/5 border border-sage-200 dark:border-white/10">
                        No pending vendor applications available for this edition.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleConfirmAllocation}
                    disabled={eligibleRequests.length === 0}
                    className="w-full btn-primary py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assign Stall</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 text-center text-charcoal-muted dark:text-white/50">
              <Store className="w-10 h-10 text-sage-400 mx-auto mb-3" />
              <h4 className="font-sans text-lg font-bold text-charcoal dark:text-white mb-1 tracking-tight">
                Select a Stall
              </h4>
              <p className="text-xs font-light max-w-xs mx-auto">
                Click any stall slot on the floor map to assign it to an applicant or view booking details.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
