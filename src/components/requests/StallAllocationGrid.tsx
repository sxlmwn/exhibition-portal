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
  ShieldCheck
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
  const { exhibitions, stalls, vendorRequests, allocateStall, releaseStall } = useAdmin();

  const [selectedStall, setSelectedStall] = useState<StallSlot | null>(null);
  const [vendorToAssignId, setVendorToAssignId] = useState<string>('');

  const currentExhibition = exhibitions.find(e => e.id === selectedExhibitionId) || exhibitions[0];
  const exhibitionStalls = stalls.filter(s => s.exhibitionId === currentExhibition.id);

  // Eligible vendors for assignment
  const eligibleRequests = vendorRequests.filter(r => 
    r.exhibitionId === currentExhibition.id && 
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
      case 'corner': return 'border-amber-400 bg-amber-50/70 text-amber-950';
      case 'premium': return 'border-purple-400 bg-purple-50/70 text-purple-950';
      case 'medium': return 'border-sage-400 bg-sage-50 text-sage-950';
      case 'small': return 'border-slate-300 bg-slate-50 text-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Selector & Legend */}
      <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            Visual Floor Plan Blueprint
          </span>
          <div className="flex items-center gap-3">
            <select
              value={currentExhibition.id}
              onChange={(e) => onSelectExhibition(e.target.value)}
              className="font-sans text-xl sm:text-2xl font-extrabold text-charcoal bg-transparent border-b-2 border-sage-300 focus:border-sage-700 outline-none pb-0.5 cursor-pointer tracking-tight"
            >
              {exhibitions.map((exh) => (
                <option key={exh.id} value={exh.id} className="text-sm font-sans">
                  {exh.title} ({exh.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-white/80 px-5 py-2.5 rounded-2xl border border-sage-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md border-2 border-sage-500 bg-sage-50" />
            <span className="text-charcoal-muted">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-sage-800" />
            <span className="text-charcoal font-semibold">Booked / Allocated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-200 border border-amber-400" />
            <span className="text-charcoal-muted">Corner Slot</span>
          </div>
        </div>
      </div>

      {/* Main Floor Grid + Detail Assignment Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Blueprint Layout Area (8 Cols) */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-10 rounded-4xl border border-sage-200 relative overflow-hidden">
          
          {/* Main Entrance Marker */}
          <div className="w-full mb-8 pb-4 border-b border-dashed border-sage-200 flex items-center justify-between text-xs text-charcoal-muted">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-sage-600" />
              <span className="font-bold uppercase tracking-wider text-charcoal">Main Visitor Entrance & Registration</span>
            </div>
            <span className="text-[11px] bg-sage-100 text-sage-800 px-3 py-1 rounded-full font-semibold">
              Primary Footfall Gate
            </span>
          </div>

          {/* Row A */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted mb-3 uppercase tracking-wider">
              <span>Row A &bull; Entrance Boulevard</span>
              <span className="text-sage-700 font-medium">Corner & Medium</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {exhibitionStalls.slice(0, 6).map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all min-h-[105px] text-center border-2 ${
                      isBooked
                        ? 'bg-charcoal/10 border-charcoal/20 text-charcoal hover:bg-charcoal/15'
                        : isSelected
                        ? 'bg-sage text-white shadow-soft-lg ring-4 ring-sage-300 scale-105 z-10'
                        : `${getTierColor(stall.tier)} hover:border-sage-600 hover:scale-[1.02]`
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : 'text-charcoal'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-1 ${isSelected ? 'text-cream-100' : 'text-charcoal-muted'}`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-sage-900 mt-1 truncate max-w-[90%] block bg-white/70 px-1.5 py-0.5 rounded">
                        {stall.assignedBrandName || 'Booked'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-white' : 'text-sage-700'}`}>
                        Rs. {(stall.price / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Promenade */}
          <div className="my-6 py-2.5 bg-cream-200/80 rounded-xl border border-dashed border-sage-300 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-sage-800">
              &larr; Central Promenade Walkway &bull; Acoustic Lounge &rarr;
            </span>
          </div>

          {/* Row B */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted mb-3 uppercase tracking-wider">
              <span>Row B &bull; Center Aisle</span>
              <span className="text-sage-700 font-medium">Premium & Medium</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {exhibitionStalls.slice(6, 12).map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all min-h-[105px] text-center border-2 ${
                      isBooked
                        ? 'bg-charcoal/10 border-charcoal/20 text-charcoal hover:bg-charcoal/15'
                        : isSelected
                        ? 'bg-sage text-white shadow-soft-lg ring-4 ring-sage-300 scale-105 z-10'
                        : `${getTierColor(stall.tier)} hover:border-sage-600 hover:scale-[1.02]`
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : 'text-charcoal'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-1 ${isSelected ? 'text-cream-100' : 'text-charcoal-muted'}`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-sage-900 mt-1 truncate max-w-[90%] block bg-white/70 px-1.5 py-0.5 rounded">
                        {stall.assignedBrandName || 'Booked'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-white' : 'text-sage-700'}`}>
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
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-muted mb-3 uppercase tracking-wider">
              <span>Row C &bull; South Courtyard</span>
              <span className="text-sage-700 font-medium">Artisan & Studio</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {exhibitionStalls.slice(12, 18).map((stall) => {
                const isBooked = stall.status === 'booked';
                const isSelected = selectedStall?.id === stall.id;

                return (
                  <button
                    key={stall.id}
                    onClick={() => handleStallClick(stall)}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all min-h-[105px] text-center border-2 ${
                      isBooked
                        ? 'bg-charcoal/10 border-charcoal/20 text-charcoal hover:bg-charcoal/15'
                        : isSelected
                        ? 'bg-sage text-white shadow-soft-lg ring-4 ring-sage-300 scale-105 z-10'
                        : `${getTierColor(stall.tier)} hover:border-sage-600 hover:scale-[1.02]`
                    }`}
                  >
                    <span className={`text-xs font-extrabold font-sans ${isSelected ? 'text-white' : 'text-charcoal'}`}>
                      {stall.code}
                    </span>
                    <span className={`text-[9px] uppercase tracking-tighter mt-1 ${isSelected ? 'text-cream-100' : 'text-charcoal-muted'}`}>
                      {stall.tier}
                    </span>

                    {isBooked ? (
                      <span className="text-[9px] font-bold text-sage-900 mt-1 truncate max-w-[90%] block bg-white/70 px-1.5 py-0.5 rounded">
                        {stall.assignedBrandName || 'Booked'}
                      </span>
                    ) : (
                      <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-white' : 'text-sage-700'}`}>
                        Rs. {(stall.price / 1000).toFixed(0)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Stage Marker */}
          <div className="w-full mt-8 pt-4 border-t border-dashed border-sage-200 flex items-center justify-between text-xs text-charcoal-muted">
            <span className="font-bold uppercase tracking-wider text-charcoal">South Exhibition Stage & VIP Lounge</span>
            <span className="text-[11px] bg-cream-200 text-charcoal-muted px-3 py-1 rounded-full">
              Emergency Exit
            </span>
          </div>

        </div>

        {/* Stall Inspector & Assignment Desk (4 Cols) */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-4xl sticky top-28">
          
          {selectedStall ? (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-4 border-b border-sage-100">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-sage-800 block">
                    Slot Inspector
                  </span>
                  <h3 className="font-sans text-3xl font-extrabold text-charcoal tracking-tight">
                    Stall {selectedStall.code}
                  </h3>
                </div>
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${getTierColor(selectedStall.tier)}`}>
                  {selectedStall.tierName}
                </span>
              </div>

              {/* Specs Table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-sage-100">
                  <span className="text-charcoal-muted">Dimensions:</span>
                  <span className="font-semibold text-charcoal">{selectedStall.dimensions}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sage-100">
                  <span className="text-charcoal-muted">Standard Tariff:</span>
                  <span className="font-sans text-base font-extrabold text-sage-deep">
                    Rs. {selectedStall.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sage-100">
                  <span className="text-charcoal-muted">Current Status:</span>
                  <span className={`font-bold capitalize ${selectedStall.status === 'booked' ? 'text-charcoal' : 'text-emerald-700'}`}>
                    {selectedStall.status}
                  </span>
                </div>
              </div>

              {/* If already booked: Show assigned vendor details & release option */}
              {selectedStall.status === 'booked' ? (
                <div className="p-4 rounded-2xl bg-cream-100 border border-sage-200">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-sage-800 block mb-1">
                    Allocated Brand
                  </span>
                  <h4 className="font-sans text-lg font-bold text-charcoal tracking-tight">
                    {selectedStall.assignedBrandName}
                  </h4>
                  <p className="text-xs text-charcoal-muted font-light mt-0.5">
                    Contact: {selectedStall.assignedVendorName}
                  </p>

                  <button
                    onClick={() => handleRelease(selectedStall.id)}
                    className="w-full mt-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Release Stall Back to Pool
                  </button>
                </div>
              ) : (
                /* If available: Show dropdown to assign to an applicant */
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                      Assign to Vendor Applicant *
                    </label>
                    
                    {eligibleRequests.length > 0 ? (
                      <select
                        value={vendorToAssignId}
                        onChange={(e) => setVendorToAssignId(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-sage-200 bg-white text-xs font-medium text-charcoal outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-200"
                      >
                        {eligibleRequests.map((req) => (
                          <option key={req.id} value={req.id}>
                            {req.brandName} — {req.vendorName} ({req.productCategory})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-charcoal-muted p-3 rounded-xl bg-cream-50 border border-sage-200">
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
            <div className="py-12 text-center text-charcoal-muted">
              <Store className="w-10 h-10 text-sage-400 mx-auto mb-3" />
              <h4 className="font-sans text-lg font-bold text-charcoal mb-1 tracking-tight">
                Select a Stall
              </h4>
              <p className="text-xs font-light max-w-xs mx-auto">
                Click any slot on the blueprint above to inspect dimensions, view current booking status, or assign to an approved vendor.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
