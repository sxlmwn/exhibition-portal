import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bell, 
  Menu, 
  MessageSquare, 
  Sun, 
  Moon,
  Plus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';
import { getTimeAgo } from '../../lib/notifications';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar }) => {
  const pathname = usePathname();
  const { settings, theme, toggleTheme } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Fetch notifications on mount and when notifications panel opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notifications as read when panel opens
  useEffect(() => {
    if (showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
  }, [showNotifications, unreadCount]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        return;
      }

      setNotifications(notifications || []);
      setUnreadCount(notifications?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
        return;
      }

      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const seedSampleNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Sample stall request notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'stall_request',
          title: 'New Stall Request',
          message: 'Cuir Leather Goods applied for Stall B-02 (Lahore).',
          metadata: {
            vendorName: 'Cuir Leather Goods',
            stallCode: 'B-02',
            exhibitionName: 'Lahore Exhibition'
          },
          is_read: false
        }]);

      // Sample expense notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'expense_approval',
          title: 'Expense Logged for Approval',
          message: 'Hamza Tariq logged Rs. 150,000 for Security.',
          metadata: {
            amount: 150000,
            category: 'Security',
            enteredBy: 'Hamza Tariq'
          },
          is_read: false
        }]);

      // Sample system notification
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          type: 'system',
          title: 'System Update',
          message: 'Exhibition portal has been updated with new features.',
          metadata: {
            version: '2.0.0'
          },
          is_read: false
        }]);

      console.log('Sample notifications seeded successfully');
      fetchNotifications(); // Refresh the notifications
    } catch (error) {
      console.error('Error seeding sample notifications:', error);
    }
  };

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
          className="p-2 rounded-xl hover:bg-sage-100 dark:hover:bg-white/10 text-charcoal dark:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-charcoal dark:text-white tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-charcoal-muted dark:text-white/60 hidden sm:block font-medium">
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
            className="w-10 h-10 rounded-lg glass-pill hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-charcoal-light hover:text-charcoal dark:text-white/70 dark:hover:text-white relative transition-all glass-rise-btn"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-cream dark:ring-[#14171E]" />
            )}
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-3xl shadow-2xl border border-sage-200 dark:border-white/15 p-4 z-[9999] animate-fadeIn"
              style={{ 
                backdropFilter: 'none', 
                WebkitBackdropFilter: 'none',
                backgroundColor: theme === 'dark' ? '#14171E' : '#FFFFFF',
                opacity: 1,
                filter: 'none',
                WebkitFilter: 'none',
                boxShadow: theme === 'dark' ? '0 20px 40px -12px rgba(0, 0, 0, 0.8)' : '0 20px 40px -12px rgba(74, 93, 74, 0.15)'
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-sage-100 dark:border-white/10 mb-3">
                <span className="text-xs font-bold text-charcoal dark:text-white uppercase tracking-wider">
                  Live Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="status-badge text-[10px] bg-sage-100 dark:bg-emerald-900 text-sage-800 dark:text-emerald-300 border border-transparent dark:border-emerald-700 px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: theme === 'dark' ? '#064E3B' : '#EAEFE9' }}>
                    {unreadCount} New
                  </span>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-4 text-xs text-charcoal-muted dark:text-white/60">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-charcoal-muted dark:text-white/60 mb-3">
                    No notifications yet
                  </p>
                  <button
                    onClick={seedSampleNotifications}
                    className="text-xs bg-sage-100 dark:bg-emerald-900/50 text-sage-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-sage-200 dark:hover:bg-emerald-900/70 transition-colors flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-3 h-3" />
                    Add Sample Notifications
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-3 rounded-2xl border border-sage-100 dark:border-white/10 transition-colors cursor-pointer" 
                      style={{ 
                        backgroundColor: theme === 'dark' ? '#1A1E27' : '#FCFBF9',
                        opacity: notification.is_read ? 0.7 : 1
                      }}
                    >
                      <span className="font-bold text-charcoal dark:text-white block">{notification.title}</span>
                      <span className="text-charcoal-muted dark:text-white text-[11px] block mt-0.5">{notification.message}</span>
                      <span className="text-[10px] text-sage-700 dark:text-emerald-300 font-bold block mt-1">{getTimeAgo(notification.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
