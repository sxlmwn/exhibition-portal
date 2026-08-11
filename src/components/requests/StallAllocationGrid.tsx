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
  Tag
} from 'lucide-react';
import { StallSlot, VendorRequest, Exhibition } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface StallAllocationGridProps {
  selectedExhibitionId: string;
  onSelectExhibition: (id: string) => void;
}

export const StallAllocationGrid: React.FC<StallAllocationGridProps> = ({
  selectedExhibitionId,
  onSelectExhibition
}) => {
  const { exhibitions, stalls, vendorRequests, allocateStall, releaseStall, currentUser } = useAdmin();
  const isOwner = currentUser.permissions.canApproveRequests || currentUser.role === 'owner';

  const [selectedStall, setSelectedStall] = useState<StallSlot | null>(null);
  const [vendorToAssignId, setVendorToAssignId] = useState<string>('');

  const currentExhibition = exhibitions.find(e => e.id === selectedExhibitionId) || exhibitions[0];
  const exhibitionStalls = stalls.filter(s => s.exhibitionId === (currentExhibition ? currentExhibition.id : selectedExhibitionId));

  // Eligible vendors for assignment
  const eligibleRequests = vendorRequests.filter(r => 
    r.exhibitionId === (currentExhibition ? currentExhibition.id : selectedExhibitionId) && 
    (r.status === 'pending' || r.status === 'approved' || r.status === 'waitlisted') &&
    !r.allocatedStallCode
  );

  const handleStallClick = (stall: StallSlot) => {
    setSelectedStall(stall);
    if (eligibleRequests.length > 0) {
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

  const getTierColor = (tier: StallSlot['tier']) => {
    switch (tier) {
      case 'corner': return 'border-amber-400 dark:border-amber-500/50 bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100';
      case 'premium': return 'border-purple-400 dark:border-purple-500/50 bg-purple-50/80 dark:bg-purple-950/30 text-purple-950 dark:text-purple-100';
      case 'medium': return 'border-sage-400 dark:border-sage-500/50 bg-sage-50/80 dark:bg-sage-950/30 text-sage-950 dark:text-sage-100';
      case 'small': return 'border-sage-300 dark:border-white/10 bg-cream-50 dark:bg-white/[0.04] text-charcoal dark:text-white/90';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Selector & Legend */}
      <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block mb-1">
            Visual Floor Plan Blueprint
          </span>
          <div className="flex items-center gap-3">
            <select
              value={selectedExhibitionId}
              onChange={(e) => onSelectExhibition(e.target.value)}
              className="font-sans text-lg sm:text-xl font-bold text-charcoal dark:text-white bg-white/70 dark:bg-[#1A1D24] hover:bg-white border-2 border-sage-200 dark:border-white/10 hover:border-sage-400 focus:border-sage-700 outline-none px-3.5 py-1.5 rounded-2xl cursor-pointer tracking-tight glass-select"
            >
              {exhibitions.map((exh) => (
                <option key={exh.id} value={exh.id}>
                  {exh.title} ({exh.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-white/80 dark:bg-white/5 px-5 py-2.5 rounded-2xl border border-sage-200 dark:border-white/10 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md border-2 border-sage-500 bg-sage-50 dark:bg-sage-900" />
            <span className="text-charcoal-muted dark:text-white/60 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-sage-800 dark:bg-sage-700" />
            <span className="text-charcoal dark:text-white font-bold">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-200 dark:bg-amber-900 border border-amber-400" />
            <span className="text-charcoal-muted dark:text-white/60 font-medium">Corner Slot</span>
          </div>
        </div>
      </div>

      {/* Main Floor Grid + Detail Assignment Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Blueprint Layout Area (8 Cols) */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-10 rounded-4xl border border-sage-200 dark:border-white/10 relative overflow-hidden">
          
          {/* Main Entrance Marker */}
          <div className="w-full mb-8 pb-4 border-b border-dashed border-sage-200 dark:border-white/10 flex items-center justify-between text-xs text-charcoal-muted dark:text-white/60">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              <span className="font-bold uppercase tracking-wider text-charcoal dark:text-white">Main Visitor Entrance & Registration</span>
            </div>
            <span className="text-[11px] bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 px-3 py-1 rounded-full font-semibold">
              Primary Footfall Gate
            </span>
          </div>

          {/* Row A */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted dark:text-white/60 mb-3 uppercase tracking-wider">
              <span>Row A &bull; Entrance Boulevard</span>
              <span className="text-sage-700 dark:text-sage-300 font-medium">Corner & Medium</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {exhibitionStalls.slice(0, 6).map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-h-[105px] text-center border-2 glass-rise-btn ${
                      isBooked
                        ? 'bg-sage-800/15 dark:bg-sage-800/30 border-sage-600/30 dark:border-sage-500/30 text-charcoal dark:text-sage-100 hover:bg-sage-800/25 hover:shadow-soft'
                        : isSelected
                        ? 'bg-sage-800 dark:bg-sage-700 text-white shadow-soft-lg ring-4 ring-sage-300 dark:ring-sage-600 scale-105 z-10'
                        : `${getTierColor(stall.tier)} hover:border-sage-600 hover:shadow-soft`
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : 'text-charcoal dark:text-white'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-1 ${isSelected ? 'text-cream-100' : 'text-charcoal-muted dark:text-white/60'}`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-sage-900 dark:text-emerald-300 mt-1 truncate max-w-[90%] block bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded">
                        {stall.assignedBrandName || 'Booked'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-white' : 'text-sage-700 dark:text-sage-300'}`}>
                        Rs. {(stall.price / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Promenade */}
          <div className="my-6 py-2.5 bg-cream-200/80 dark:bg-white/5 rounded-xl border border-dashed border-sage-300 dark:border-white/10 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-sage-800 dark:text-sage-300">
              &larr; Central Promenade Walkway &bull; Acoustic Lounge &rarr;
            </span>
          </div>

          {/* Row B */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted dark:text-white/60 mb-3 uppercase tracking-wider">
              <span>Row B &bull; Center Aisle</span>
              <span className="text-sage-700 dark:text-sage-300 font-medium">Premium & Medium</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {exhibitionStalls.slice(6, 12).map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-h-[105px] text-center border-2 glass-rise-btn ${
                      isBooked
                        ? 'bg-sage-800/15 dark:bg-sage-800/30 border-sage-600/30 dark:border-sage-500/30 text-charcoal dark:text-sage-100 hover:bg-sage-800/25 hover:shadow-soft'
                        : isSelected
                        ? 'bg-sage-800 dark:bg-sage-700 text-white shadow-soft-lg ring-4 ring-sage-300 dark:ring-sage-600 scale-105 z-10'
                        : `${getTierColor(stall.tier)} hover:border-sage-600 hover:shadow-soft`
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : 'text-charcoal dark:text-white'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-1 ${isSelected ? 'text-cream-100' : 'text-charcoal-muted dark:text-white/60'}`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-sage-900 dark:text-emerald-300 mt-1 truncate max-w-[90%] block bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded">
                        {stall.assignedBrandName || 'Booked'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-white' : 'text-sage-700 dark:text-sage-300'}`}>
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
              <span>Row C &bull; South Courtyard</span>
              <span className="text-sage-700 dark:text-sage-300 font-medium">Artisan & Studio</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {exhibitionStalls.slice(12, 18).map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-h-[105px] text-center border-2 glass-rise-btn ${
                      isBooked
                        ? 'bg-sage-800/15 dark:bg-sage-800/30 border-sage-600/30 dark:border-sage-500/30 text-charcoal dark:text-sage-100 hover:bg-sage-800/25 hover:shadow-soft'
                        : isSelected
                        ? 'bg-sage-800 dark:bg-sage-700 text-white shadow-soft-lg ring-4 ring-sage-300 dark:ring-sage-600 scale-105 z-10'
                        : `${getTierColor(stall.tier)} hover:border-sage-600 hover:shadow-soft`
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : 'text-charcoal dark:text-white'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-1 ${isSelected ? 'text-cream-100' : 'text-charcoal-muted dark:text-white/60'}`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-sage-900 dark:text-emerald-300 mt-1 truncate max-w-[90%] block bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded">
                        {stall.assignedBrandName || 'Booked'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-white' : 'text-sage-700 dark:text-sage-300'}`}>
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
            <span className="font-bold uppercase tracking-wider text-charcoal dark:text-white">South Exhibition Stage & VIP Lounge</span>
            <span className="text-[11px] bg-cream-200 dark:bg-white/10 text-charcoal-muted dark:text-white/60 px-3 py-1 rounded-full">
              Emergency Exit
            </span>
          </div>

        </div>

        {/* Stall Inspector & Assignment Desk (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-4xl sticky top-28">
          
          {selectedStall ? (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block">
                    Slot Inspector
                  </span>
                  <h3 className="font-sans text-3xl font-extrabold text-charcoal dark:text-white tracking-tight">
                    Stall {selectedStall.code}
                  </h3>
                </div>
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${getTierColor(selectedStall.tier)}`}>
                  {selectedStall.tierName}
                </span>
              </div>

              {/* Specs Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-sage-100 dark:border-white/10">
                  <span className="text-charcoal-muted dark:text-white/60">Dimensions:</span>
                  <span className="font-semibold text-charcoal dark:text-white">{selectedStall.dimensions}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sage-100 dark:border-white/10">
                  <span className="text-charcoal-muted dark:text-white/60">Standard Tariff:</span>
                  <span className="font-sans text-base font-extrabold text-sage-deep dark:text-sage-300">
                    Rs. {selectedStall.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sage-100 dark:border-white/10">
                  <span className="text-charcoal-muted dark:text-white/60">Current Status:</span>
                  <span className={`font-bold capitalize ${selectedStall.status === 'booked' ? 'text-charcoal dark:text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {selectedStall.status}
                  </span>
                </div>
              </div>

              {/* If already booked: Show assigned vendor details & release option */}
              {selectedStall.status === 'booked' ? (
                <div className="p-4 rounded-2xl bg-cream-100 dark:bg-white/5 border border-sage-200 dark:border-white/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block mb-1">
                    Allocated Brand
                  </span>
                  <h4 className="font-sans text-lg font-bold text-charcoal dark:text-white tracking-tight">
                    {selectedStall.assignedBrandName || 'Booked Exhibitor'}
                  </h4>
                  {selectedStall.assignedVendorName && (
                    <p className="text-xs text-charcoal-muted dark:text-white/60 font-light mt-0.5">
                      Contact: {selectedStall.assignedVendorName}
                    </p>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => handleRelease(selectedStall.id)}
                      className="w-full mt-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Release Stall Back to Pool
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
                        className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 bg-white dark:bg-[#1A1D24] text-xs font-medium text-charcoal dark:text-white outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                      >
                        {eligibleRequests.map((req) => (
                          <option key={req.id} value={req.id}>
                            {req.brandName} — {req.vendorName} ({req.productCategory})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-charcoal-muted dark:text-white/60 p-3 rounded-xl bg-cream-50 dark:bg-white/5 border border-sage-200 dark:border-white/10">
                        No unallocated vendor applications available for this edition.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleConfirmAllocation}
                    disabled={eligibleRequests.length === 0}
                    className="w-full btn-primary py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Lock Stall Allocation</span>
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
                Click any slot on the blueprint to inspect dimensions, view current booking status, or assign to an approved vendor.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
