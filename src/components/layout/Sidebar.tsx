import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '../BrandLogo';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Store, 
  Users, 
  Receipt, 
  Megaphone, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
  LogOut,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, currentRole, vendorRequests, expenses, theme, toggleTheme } = useAdmin();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setShowProfileMenu(false);
      router.push('/login');
    }
  };

  const pendingRequestsCount = vendorRequests.filter(r => r.status === 'pending').length;
  const pendingExpensesCount = expenses.filter(e => e.status === 'pending_approval').length;

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Exhibitions',
      href: '/exhibitions',
      icon: CalendarDays,
      badge: null
    },
    {
      label: 'Vendor Requests',
      href: '/requests',
      icon: Store,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60'
    },
    {
      label: 'Contacts & CRM',
      href: '/crm',
      icon: Users,
      badge: null
    },
    {
      label: 'Finance & Costs',
      href: '/finance',
      icon: Receipt,
      badge: pendingExpensesCount > 0 ? `${pendingExpensesCount}` : null,
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60'
    },
    {
      label: 'Marketing Logs',
      href: '/marketing',
      icon: Megaphone,
      badge: null
    },
    {
      label: 'Past Editions',
      href: '/past-events',
      icon: History,
      badge: null
    },
    {
      label: 'Settings & Roles',
      href: '/settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 glass-sidebar flex flex-col justify-between transition-[width] duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-56'
      }`}
      style={{ overflow: 'visible' }}
    >
      {/* Top Section: Wordmark & Logo */}
      <div>
        <div className={`h-20 flex items-center border-b border-sage-200/40 dark:border-white/10 transition-all duration-300 ${
          collapsed ? 'justify-center px-2 relative' : 'justify-between px-3.5'
        }`}>
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'min-w-0'}`}>
            <Link href="/" className="flex items-center group focus:outline-none py-1">
              <div className="shrink-0 flex items-center justify-center">
                <BrandLogo 
                  size={30} 
                  showText={false}
                />
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                collapsed ? 'max-w-0 opacity-0 ml-0 pointer-events-none' : 'max-w-[140px] opacity-100 ml-2'
              }`}>
                <div className="flex flex-col whitespace-nowrap">
                  <span className={`font-sans font-extrabold text-xs tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-charcoal'}`}>
                    Exhibition Agency
                  </span>
                  <span className={`font-sans text-[9px] font-semibold tracking-wider uppercase leading-tight ${theme === 'dark' ? 'text-sage-300' : 'text-sage-800'}`}>
                    Portal
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-xl hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal transition-all hidden lg:flex items-center justify-center shrink-0 ${
              collapsed 
                ? 'absolute -right-2.5 top-7 bg-white dark:bg-[#1A1E26] shadow-md border border-sage-200 dark:border-white/15 rounded-full p-1 z-30 hover:scale-110' 
                : 'ml-0.5'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 relative group sidebar-nav-item glass-rise-btn ${
                  isActive
                    ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-soft font-bold'
                    : 'text-charcoal-light hover:bg-white dark:hover:bg-white/10 hover:text-charcoal hover:shadow-xs font-semibold'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cream' : 'text-sage-700 dark:text-sage-300'}`} />
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[130px] opacity-100 flex-1'
                }`}>
                  <span className="truncate tracking-wide block whitespace-nowrap text-xs">
                    {item.label}
                  </span>
                </div>

                {!collapsed && item.badge !== null && (
                  <span className={`status-badge text-[10px] px-1.5 py-0.5 rounded-full border font-bold shrink-0 ${
                    isActive 
                      ? 'bg-charcoal text-white border-charcoal/40 dark:bg-[#0B0D10] dark:text-white dark:border-white/20 shadow-xs' 
                      : (item.badgeColor || 'bg-sage-100 text-sage-800 border-sage-200 dark:bg-sage-900/60 dark:text-sage-300 dark:border-sage-700/60')
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Dot */}
                {collapsed && item.badge !== null && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-cream" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active User Card with Working Interactive Menu */}
      <div className="p-3 border-t border-sage-200/40 dark:border-white/10 relative" ref={profileRef}>
        
        {/* Profile Popover / Dropdown Menu */}
        {showProfileMenu && (
          <div 
            className={`absolute z-[200] bg-white dark:bg-[#14171C] rounded-3xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.3)] dark:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.7)] border border-sage-200/80 dark:border-white/10 p-4 animate-fadeIn ${
              collapsed 
                ? 'bottom-2 left-[calc(100%+8px)] w-80' 
                : 'bottom-full mb-3 left-2 right-2'
            }`}
            style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
          >
            
            {/* User Identity */}
            <div className="flex items-center gap-3 pb-3 border-b border-sage-100 dark:border-white/10">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-sage-300 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-charcoal dark:text-white truncate">
                  {currentUser.name}
                </span>
                <span className="block text-[11px] text-charcoal-muted dark:text-cream-200 truncate font-medium">
                  {currentUser.email}
                </span>
                <span className={`status-badge inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                  currentRole === 'owner' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>{currentRole} Role</span>
                </span>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <div className="py-2.5 border-b border-sage-100 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal dark:text-white flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-sage-300" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
                <span>Theme Mode</span>
              </span>
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-xl bg-cream-100 dark:bg-white/10 hover:bg-cream-200 dark:hover:bg-white/20 text-[11px] font-bold text-charcoal dark:text-white transition-colors flex items-center gap-1"
              >
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                <span className="text-[10px] opacity-60">Switch</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="py-2 space-y-1">
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-charcoal dark:text-white/90 hover:bg-cream-50 dark:hover:bg-white/10 transition-colors font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-sage-700 dark:text-sage-400" />
                <span>Account Settings</span>
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_PUBLIC_SHOWCASE_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-charcoal dark:text-white/90 hover:bg-cream-50 dark:hover:bg-white/10 transition-colors font-medium"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-sage-700 dark:text-sage-400" />
                  <span>Public Showcase</span>
                </div>
              </a>
              <Link
                href="/login"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-charcoal dark:text-white/90 hover:bg-cream-50 dark:hover:bg-white/10 transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-sage-700 dark:text-sage-400" />
                <span>Switch / Sign In Page</span>
              </Link>
            </div>

            {/* Sign Out */}
            <div className="pt-2 border-t border-sage-100 dark:border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        )}

        {/* Profile Trigger Button */}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all text-left group border border-transparent hover:border-sage-200/60 dark:hover:border-white/10 ${
            showProfileMenu ? 'bg-white dark:bg-white/10 border-sage-300 shadow-soft-xs' : ''
          } ${collapsed ? 'justify-center' : ''}`}
          title="Account profile and role settings"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-sage-300"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-cream dark:ring-[#14171C]" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-bold text-charcoal truncate group-hover:text-sage-900">
                  {currentUser.name}
                </span>
                <ChevronUp className={`w-3.5 h-3.5 text-charcoal-muted transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180 text-sage-800' : ''
                }`} />
              </div>
              <span className="block text-[10px] text-charcoal-muted uppercase font-bold tracking-wider truncate">
                {currentRole}
              </span>
            </div>
          )}
        </button>

      </div>

    </aside>
  );
};
