'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  Menu, 
  MessageSquare, 
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const pathname = usePathname();
  const { currentRole, setCurrentRole, currentUser, staffUsers, settings } = useAdmin();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return { title: 'Dashboard Overview', subtitle: 'Live exhibition KPIs, stall conversions, and incoming vendor applications.' };
      case '/exhibitions': return { title: 'Exhibitions Manager', subtitle: 'Curated calendar, capacity targets, and financial health.' };
      case '/requests': return { title: 'Vendor Requests & Allocation', subtitle: 'Review vendor portfolios and map stalls directly onto venue floor plans.' };
      case '/crm': return { title: 'Vendor CRM & Contacts', subtitle: 'Unified exhibitor directory with zero-cost bulk WhatsApp and email dispatch.' };
      case '/finance': return { title: 'Finance & Expenditure', subtitle: 'Track venue costs, logistics invoices, and vendor stall revenue.' };
      case '/marketing': return { title: 'Marketing Logs & Leads', subtitle: 'Campaign ROI tracking and lead-attribution analytics.' };
      case '/past-events': return { title: 'Past Events Portfolio', subtitle: 'Curate public track record and verified footfall narratives.' };
      case '/settings': return { title: 'Agency Settings & Roles', subtitle: 'Configure staff permissions, WhatsApp hotlines, and organization branding.' };
      default: return { title: 'Admin Portal', subtitle: 'Exhibition Management' };
    }
  };

  const pageInfo = getPageTitle();

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleDropdown(false);
  };

  return (
    <header className="h-20 glass-topbar sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-between gap-4">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl hover:bg-sage-100 text-charcoal lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-charcoal-muted hidden sm:block font-light">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions: Search + Role Switcher + WhatsApp + Notifications + Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Role Simulator Pill (Allows testing Owner vs Staff permissions live) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-pill hover:bg-white text-xs font-medium transition-all shadow-xs border border-sage-300/80"
            title="Switch User Role to test permissions"
          >
            <span className={`w-2 h-2 rounded-full ${
              currentRole === 'owner' ? 'bg-emerald-600' : currentRole === 'admin' ? 'bg-purple-600' : 'bg-amber-600'
            }`} />
            <span className="text-charcoal-muted text-[11px] uppercase tracking-wider">Role:</span>
            <span className="font-bold text-charcoal capitalize">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-sage-200 p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-sage-100 text-[11px] text-charcoal-muted font-medium">
                Switch Role (Permission Test)
              </div>
              {(['owner', 'admin', 'staff'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    currentRole === role ? 'bg-sage-100 text-sage-900 font-semibold' : 'text-charcoal-light hover:bg-cream-100'
                  }`}
                >
                  <span className="capitalize">{role === 'owner' ? 'Owner (Full Access)' : role === 'admin' ? 'Admin' : 'Staff (Restricted)'}</span>
                  {currentRole === role && <CheckCircle2 className="w-4 h-4 text-sage-700" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Lead Desk Quick Link */}
        <a
          href={`https://wa.me/${settings.coordinatorWhatsApp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold tracking-wide transition-colors"
          title="Open WhatsApp Vendor Support Desk"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Vendor WhatsApp</span>
        </a>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full glass-pill hover:bg-white flex items-center justify-center text-charcoal-light hover:text-charcoal relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-cream" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-lg border border-sage-200 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-sage-100 mb-3">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Live Notifications
                </span>
                <span className="text-[10px] bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full font-bold">
                  3 New
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-cream-50 hover:bg-sage-50 transition-colors">
                  <span className="font-semibold text-charcoal block">New Stall Request</span>
                  <span className="text-charcoal-muted text-[11px] block">Cuir Leather Goods applied for Stall B-02 (Lahore).</span>
                  <span className="text-[10px] text-sage-700 font-medium">10 mins ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-cream-50 hover:bg-sage-50 transition-colors">
                  <span className="font-semibold text-charcoal block">Expense Logged for Approval</span>
                  <span className="text-charcoal-muted text-[11px] block">Hamza Tariq logged Rs. 150,000 for Security.</span>
                  <span className="text-[10px] text-sage-700 font-medium">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-sage-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-sage-300 ring-2 ring-cream"
          />
        </div>

      </div>

    </header>
  );
};
