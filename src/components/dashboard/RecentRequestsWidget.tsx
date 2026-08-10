'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Store, Tag } from 'lucide-react';
import { VendorRequest } from '../../types';

interface RecentRequestsWidgetProps {
  requests: VendorRequest[];
}

export const RecentRequestsWidget: React.FC<RecentRequestsWidgetProps> = ({ requests }) => {
  const recentList = requests.slice(0, 4);

  const getStatusBadge = (status: VendorRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'waitlisted':
        return 'bg-purple-100 text-purple-900 border-purple-300';
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
              Applications
            </span>
            <h3 className="font-sans text-xl font-bold text-charcoal tracking-tight">
              Recent Vendor Requests
            </h3>
          </div>
          <Link
            href="/requests"
            className="text-xs font-bold text-sage-800 hover:text-sage-950 flex items-center gap-1 transition-colors glass-rise-btn px-3 py-1 rounded-full hover:bg-white"
          >
            <span>Allocation Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentList.map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-2xl bg-white/75 hover:bg-white border border-sage-200/60 shadow-2xs flex items-center justify-between gap-3 glass-rise-row"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-charcoal truncate">
                    {req.brandName}
                  </h4>
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-charcoal-muted mt-1 font-normal truncate">
                  <span className="truncate">{req.vendorName}</span>
                  <span>&bull;</span>
                  <span className="truncate">{req.productCategory}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="block text-xs font-sans font-extrabold text-sage-deep">
                  {req.allocatedStallCode ? `Stall ${req.allocatedStallCode}` : `${req.stallsWanted} Stall(s)`}
                </span>
                <span className="text-[10px] text-charcoal-muted font-light flex items-center gap-0.5 justify-end">
                  <Clock className="w-3 h-3 text-sage-500" />
                  {req.submittedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-sage-100 flex items-center justify-between text-xs text-charcoal-muted">
        <span>Review vendor lookbooks & budgets</span>
        <Link href="/requests" className="font-semibold text-sage-800 hover:underline">
          Assign Stalls &rarr;
        </Link>
      </div>
    </div>
  );
};
