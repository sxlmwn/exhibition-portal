'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const { currentUser, currentRole, setCurrentRole, vendorRequests, expenses, theme, toggleTheme } = useAdmin();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

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

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    setLogoutMessage('Session reset.');
    setTimeout(() => {
      setLogoutMessage(null);
      setShowProfileMenu(false);
    }, 2000);
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
      className={`fixed top-0 left-0 bottom-0 z-40 glass-sidebar flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Wordmark & Logo */}
      <div>
        <div className="h-20 flex items-center justify-between px-5 border-b border-sage-200/40 dark:border-white/10">
          {!collapsed ? (
            <Link href="/" className="flex items-center group focus:outline-none py-1">
              <BrandLogo 
                size={36} 
                textColor={theme === 'dark' ? 'text-white' : 'text-charcoal'} 
                subtextColor={theme === 'dark' ? 'text-sage-300' : 'text-sage-800'} 
              />
            </Link>
          ) : (
            <div className="mx-auto flex items-center justify-center py-1">
              <BrandLogo size={32} showText={false} />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal transition-colors hidden lg:block"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-medium transition-all duration-200 relative group sidebar-nav-item glass-rise-btn ${
                  isActive
                    ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-soft font-bold'
                    : 'text-charcoal-light hover:bg-white dark:hover:bg-white/10 hover:text-charcoal hover:shadow-xs font-semibold'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cream' : 'text-sage-700 dark:text-sage-300'}`} />
                
                {!collapsed && (
                  <span className="flex-1 truncate tracking-wide">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                    isActive ? 'bg-cream-100 text-sage-900 border-cream-200' : (item.badgeColor || 'bg-sage-100 text-sage-800')
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
          <div className={`absolute bottom-full mb-3 ${collapsed ? 'left-2 w-72' : 'left-3 right-3'} bg-white/95 dark:bg-[#182018]/95 backdrop-blur-2xl rounded-3xl shadow-soft-xl border border-sage-200/90 dark:border-white/10 p-4 z-50 animate-fadeIn`}>
            
            {/* User Identity */}
            <div className="flex items-center gap-3 pb-3 border-b border-sage-100 dark:border-white/10">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-sage-300 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-charcoal truncate">
                  {currentUser.name}
                </span>
                <span className="block text-[11px] text-charcoal-muted truncate font-medium">
                  {currentUser.email}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                  currentRole === 'owner' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                  currentRole === 'admin' ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                  'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {currentRole}
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-2 space-y-1">
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal hover:bg-cream-100 dark:hover:bg-white/10 hover:text-sage-900 transition-colors"
              >
                <Settings className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <span>Profile & Settings</span>
              </Link>

              <a
                href="http://localhost:5173/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-charcoal hover:bg-cream-100 dark:hover:bg-white/10 hover:text-sage-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                  <span>Public Landing Page</span>
                </div>
                <span className="text-[10px] text-sage-600 dark:text-sage-300 font-bold bg-sage-50 dark:bg-sage-900/60 px-2 py-0.5 rounded-full">Live</span>
              </a>

              {/* Dark Theme Toggle inside Menu */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-charcoal hover:bg-cream-100 dark:hover:bg-white/10 hover:text-sage-900 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sage-700" />}
                  <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </div>
                <span className="text-[10px] text-charcoal-muted capitalize">{theme}</span>
              </button>
            </div>

            {/* Role Switcher */}
            <div className="pt-2 pb-1 border-t border-sage-100 dark:border-white/10">
              <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider block mb-1.5 px-3">
                Switch Role
              </span>
              <div className="grid grid-cols-3 gap-1 px-1">
                {(['owner', 'admin', 'staff'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`py-1 px-2 rounded-xl text-[10px] font-bold capitalize transition-all ${
                      currentRole === r
                        ? 'bg-sage-800 dark:bg-sage-600 text-cream shadow-xs'
                        : 'text-charcoal-muted hover:text-charcoal hover:bg-cream-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Out */}
            <div className="pt-2 border-t border-sage-100 dark:border-white/10">
              {logoutMessage ? (
                <div className="p-1.5 text-center text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 font-medium">
                  {logoutMessage}
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* The Clickable User Card Button */}
        {!collapsed ? (
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full p-3 rounded-2xl bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-sage-200/60 dark:border-white/10 shadow-xs flex items-center justify-between transition-all glass-rise-btn text-left group"
            title="Click for account options"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-sage-300 shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-charcoal truncate group-hover:text-sage-900">
                  {currentUser.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-sage-800 dark:text-sage-300">
                  <ShieldCheck className="w-3 h-3 text-sage-600 dark:text-sage-400" />
                  {currentRole.toUpperCase()}
                </span>
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-charcoal-muted transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="rounded-full p-0.5 hover:ring-2 hover:ring-sage-400 transition-all glass-rise-btn"
              title={`${currentUser.name} (${currentRole}) - Click for options`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-sage-300"
              />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
