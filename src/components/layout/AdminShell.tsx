'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { supabase } from '../../lib/supabase';

const AdminShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { theme } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  // Client-side authentication session verification
  useEffect(() => {
    let isMounted = true;

    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuthSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (!session?.user) {
          setIsAuthenticated(false);
          router.replace('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (!isMounted) return;
        setIsAuthenticated(false);
        router.replace('/login');
      }
    };

    checkAuthSession();

    // Listen to real-time auth changes (sign-out, expiry, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (!session?.user && !isLoginPage) {
        setIsAuthenticated(false);
        router.replace('/login');
      } else if (session?.user) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  // Standalone Login Page without Shell chrome
  if (isLoginPage) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-[#0D0F13] text-[#F3F4F6]' : 'bg-[#F8F7F4] text-charcoal'
      }`}>
        {children}
      </div>
    );
  }

  // Loading state while verifying authentication session (prevents protected UI flash)
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-[#0D0F13] text-[#F3F4F6]' : 'bg-[#F8F7F4] text-charcoal'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-sage-400/30 border-t-sage-600 dark:border-t-sage-400 animate-spin" />
          <span className="text-xs uppercase tracking-widest font-semibold text-charcoal-muted dark:text-white/40">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 flex relative overflow-x-hidden ${
      theme === 'dark' 
        ? 'dark bg-[#0D0F13] text-[#F3F4F6]' 
        : 'bg-[#F8F7F4] text-charcoal'
    }`}>
      
      {/* Subtle Ambient Background Photo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/Exhibition Agency BG.png"
          alt=""
          className={`w-full h-full object-cover object-center grayscale contrast-125 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-[0.03] mix-blend-screen' : 'opacity-[0.025] mix-blend-multiply'
          }`}
        />
        <div className={`absolute inset-0 transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0D0F13]/98 via-[#0D0F13]/92 to-[#0D0F13]/98'
            : 'bg-gradient-to-b from-[#F8F7F4]/94 via-[#F8F7F4]/85 to-[#F8F7F4]/96'
        }`} />
      </div>

      {/* Desktop Sidebar (No stacking trap) */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-72 h-full">
            <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (Smooth Synchronized Transition, Natural Stacking Context) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[padding-left] duration-300 ease-in-out ${
        collapsed ? 'lg:pl-20' : 'lg:pl-56'
      }`}>
        <Topbar onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
        
        <main className="flex-1 p-6 sm:p-10 w-full max-w-[1700px] mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminProvider>
      <AdminShellContent>{children}</AdminShellContent>
    </AdminProvider>
  );
};
