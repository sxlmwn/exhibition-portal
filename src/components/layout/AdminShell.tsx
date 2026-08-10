'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AdminProvider } from '../../context/AdminContext';

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#F7F5F0] text-charcoal flex relative overflow-x-hidden">
        
        {/* Subtle Ambient Tinted Background Photo of Exhibition Stalls */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="/images/Exhibition Agency BG.png"
            alt=""
            className="w-full h-full object-cover object-center grayscale contrast-125 opacity-[0.038] mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F7F5F0]/90 via-[#F7F5F0]/75 to-[#F7F5F0]/95" />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block relative z-30">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-50 w-72 h-full">
              <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}>
          <Topbar onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
          
          <main className="flex-1 p-6 sm:p-10 w-full max-w-[1700px] mx-auto">
            {children}
          </main>
        </div>

      </div>
    </AdminProvider>
  );
};
