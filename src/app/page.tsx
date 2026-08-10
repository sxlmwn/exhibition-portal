'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Store, 
  Receipt, 
  Users, 
  Plus, 
  ArrowRight, 
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Exhibition, VendorRequest } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { UpcomingExhibitionsWidget } from '../components/dashboard/UpcomingExhibitionsWidget';
import { RecentRequestsWidget } from '../components/dashboard/RecentRequestsWidget';
import { ExhibitionDetailModal } from '../components/exhibitions/ExhibitionDetailModal';
import { RequestDetailModal } from '../components/requests/RequestDetailModal';

export default function DashboardPage() {
  const { exhibitions, stalls, vendorRequests, expenses } = useAdmin();
  const [selectedExhibition, setSelectedExhibition] = React.useState<Exhibition | null>(null);
  const [selectedRequest, setSelectedRequest] = React.useState<VendorRequest | null>(null);

  // Calculated Stats
  const activeExhibitions = exhibitions.filter(e => e.status !== 'completed');
  const activeExhibitionsCount = activeExhibitions.length;
  
  const totalCapacity = exhibitions.reduce((acc, e) => acc + e.totalStallCapacity, 0);
  const totalBookedStalls = exhibitions.reduce((acc, e) => acc + e.bookedStallsCount, 0);
  
  const totalRevenue = exhibitions.reduce((acc, e) => acc + e.stallRevenueBooked, 0);
  const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((acc, e) => acc + e.amount, 0);
  
  const pendingRequestsCount = vendorRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Editorial Welcome Banner */}
      <div className="glass-card p-8 rounded-4xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal leading-tight tracking-tight">
            Curated Exhibition Management
          </h2>
          <p className="text-sm text-charcoal-muted mt-2 font-medium leading-relaxed">
            Manage live vendor allocations, inspect venue floor plans, and track expenditures with complete financial transparency.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/exhibitions"
            className="btn-primary glass-rise-btn px-6 py-3 text-xs uppercase tracking-wider font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exhibition</span>
          </Link>
          <Link
            href="/requests"
            className="btn-secondary glass-rise-btn px-6 py-3 text-xs uppercase tracking-wider font-bold flex items-center gap-2"
          >
            <Store className="w-4 h-4 text-sage-700" />
            <span>Allocate Stalls</span>
          </Link>
        </div>

        {/* Subtle background decorative glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-sage-200/40 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20" />
      </div>

      {/* 4 KPI Frosted Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Exhibitions"
          value={activeExhibitionsCount}
          subvalue="Lahore, Islamabad & Karachi"
          trend={{ value: '+1 Edition', isPositive: true, label: 'vs last season' }}
          icon={CalendarDays}
          iconBgColor="bg-sage-100"
          iconColor="text-sage-800"
        />

        <StatCard
          title="Total Stalls Booked"
          value={`${totalBookedStalls} / ${totalCapacity}`}
          subvalue={`${Math.round((totalBookedStalls / (totalCapacity || 1)) * 100)}% overall capacity locked`}
          trend={{ value: '+18 Stalls', isPositive: true, label: 'this week' }}
          icon={Store}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-800"
        />

        <StatCard
          title="Gross Revenue vs Costs"
          value={`Rs. ${(totalRevenue / 100000).toFixed(1)}L`}
          subvalue={`Logged Costs: Rs. ${(totalExpenses / 100000).toFixed(1)}L`}
          trend={{ value: `Net +Rs. ${((totalRevenue - totalExpenses) / 100000).toFixed(1)}L`, isPositive: true, label: 'margin' }}
          icon={Receipt}
          iconBgColor="bg-cream-200"
          iconColor="text-sage-900"
        />

        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          subvalue="Awaiting portfolio review"
          trend={{ value: `${pendingRequestsCount} Actionable`, isPositive: pendingRequestsCount > 0, label: 'in queue' }}
          icon={Users}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-900"
        />
      </div>

      {/* Trajectory Chart & Quick Stats */}
      <div className="grid grid-cols-1 gap-8">
        <RevenueChart />
      </div>

      {/* Two Column Panels: Schedule Mini-List + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingExhibitionsWidget 
          exhibitions={exhibitions} 
          onSelectExhibition={(exh) => setSelectedExhibition(exh)} 
        />
        <RecentRequestsWidget 
          requests={vendorRequests} 
          onSelectRequest={(req) => setSelectedRequest(req)} 
        />
      </div>

      {/* Exhibition Detail Modal with Full Screen Frosted Glass Blur */}
      <ExhibitionDetailModal
        exhibition={selectedExhibition}
        onClose={() => setSelectedExhibition(null)}
      />

      {/* Request Detail Modal with Full Screen Frosted Glass Blur */}
      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

    </div>
  );
}
