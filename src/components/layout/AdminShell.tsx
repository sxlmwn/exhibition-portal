'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AdminProvider, useAdmin } from '../../context/AdminContext';

const AdminShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useAdmin();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Standalone Login Page without Shell chrome
  if (isLoginPage) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark' ? 'dark bg-[#0B0C0E] text-[#F3F4F6]' : 'bg-[#F7F5F0] text-charcoal'
      }`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex relative overflow-x-hidden ${
      theme === 'dark' 
        ? 'dark bg-[#0B0C0E] text-[#F3F4F6]' 
        : 'bg-[#F7F5F0] text-charcoal'
    }`}>
      
      {/* Subtle Ambient Background Photo */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/Exhibition Agency BG.png"
          alt=""
          className={`w-full h-full object-cover object-center grayscale contrast-125 transition-opacity duration-500 ${
            theme === 'dark' ? 'opacity-[0.04] mix-blend-screen' : 'opacity-[0.038] mix-blend-multiply'
          }`}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0B0C0E]/96 via-[#0E1013]/90 to-[#0B0C0E]/98'
            : 'bg-gradient-to-b from-[#F7F5F0]/90 via-[#F7F5F0]/75 to-[#F7F5F0]/95'
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
