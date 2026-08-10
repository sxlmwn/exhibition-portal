'use client';

import React from 'react';
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
  Building2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const { currentUser, currentRole, vendorRequests, expenses } = useAdmin();

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
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      label: 'Contacts / CRM',
      href: '/crm',
      icon: Users,
      badge: null
    },
    {
      label: 'Finance & Costs',
      href: '/finance',
      icon: Receipt,
      badge: (currentRole !== 'staff' && pendingExpensesCount > 0) ? pendingExpensesCount : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      label: 'Marketing Log',
      href: '/marketing',
      icon: Megaphone,
      badge: null
    },
    {
      label: 'Past Events',
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
        <div className="h-20 flex items-center justify-between px-5 border-b border-sage-200/40">
          {!collapsed ? (
            <Link href="/" className="flex items-center group focus:outline-none py-1">
              <BrandLogo size={36} textColor="text-charcoal" subtextColor="text-sage-800" />
            </Link>
          ) : (
            <div className="mx-auto flex items-center justify-center py-1">
              <BrandLogo size={32} showText={false} />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-sage-100 text-charcoal-muted hover:text-charcoal transition-colors hidden lg:block"
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
                    ? 'bg-sage-800 text-cream shadow-soft font-bold'
                    : 'text-charcoal-light hover:bg-white hover:text-charcoal hover:shadow-xs font-semibold'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cream' : 'text-sage-700'}`} />
                
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

      {/* Bottom Section: Active User Card */}
      <div className="p-3 border-t border-sage-200/40">
        {!collapsed ? (
          <div className="p-3 rounded-2xl bg-white/70 border border-sage-200/60 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-sage-300 shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-charcoal truncate">
                  {currentUser.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-sage-800">
                  <ShieldCheck className="w-3 h-3 text-sage-600" />
                  {currentRole.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-sage-300"
              title={`${currentUser.name} (${currentRole})`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
