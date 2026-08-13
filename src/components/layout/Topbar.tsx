import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bell, 
  Menu, 
  MessageSquare, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const pathname = usePathname();
  const { settings, theme, toggleTheme } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-charcoal-muted hidden sm:block font-medium">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions: Dark/Light Mode + WhatsApp + Notifications */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg glass-pill hover:bg-white dark:hover:bg-white/10 text-charcoal-light hover:text-charcoal transition-all shadow-xs border border-sage-300/80 glass-rise-btn flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
          ) : (
            <Moon className="w-4 h-4 text-sage-800 animate-fadeIn" />
          )}
        </button>

        {/* WhatsApp Lead Desk Quick Link */}
        <a
          href={`https://wa.me/${settings.coordinatorWhatsApp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold tracking-wide transition-all glass-rise-btn"
          title="Open WhatsApp Vendor Support Desk"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Vendor WhatsApp</span>
        </a>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg glass-pill hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-charcoal-light hover:text-charcoal relative transition-all glass-rise-btn"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-cream" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#14171E] backdrop-blur-2xl rounded-3xl shadow-2xl border border-sage-200 dark:border-white/15 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-sage-100 dark:border-white/10 mb-3">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Live Notifications
                </span>
                <span className="text-[10px] bg-sage-100 dark:bg-emerald-950/80 text-sage-800 dark:text-emerald-300 border border-transparent dark:border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                  3 New
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-cream-50 dark:bg-white/[0.04] hover:bg-sage-50 dark:hover:bg-white/[0.08] border border-sage-100 dark:border-white/10 transition-colors">
                  <span className="font-bold text-charcoal block">New Stall Request</span>
                  <span className="text-charcoal-muted text-[11px] block mt-0.5">Cuir Leather Goods applied for Stall B-02 (Lahore).</span>
                  <span className="text-[10px] text-sage-700 dark:text-sage-300 font-bold block mt-1">10 mins ago</span>
                </div>
                <div className="p-3 rounded-2xl bg-cream-50 dark:bg-white/[0.04] hover:bg-sage-50 dark:hover:bg-white/[0.08] border border-sage-100 dark:border-white/10 transition-colors">
                  <span className="font-bold text-charcoal block">Expense Logged for Approval</span>
                  <span className="text-charcoal-muted text-[11px] block mt-0.5">Hamza Tariq logged Rs. 150,000 for Security.</span>
                  <span className="text-[10px] text-sage-700 dark:text-sage-300 font-bold block mt-1">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
