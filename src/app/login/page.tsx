'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '../../components/BrandLogo';
import { ModalPortal } from '../../components/common/ModalPortal';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentRole, setCurrentRole, theme, toggleTheme } = useAdmin();
  
  const [email, setEmail] = useState('zainab.farooq@exhibitionagency.pk');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessRequestSuccess, setAccessRequestSuccess] = useState(false);
  const [accessEmail, setAccessEmail] = useState('');
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX - window.innerWidth / 2) / 28;
    const y = (e.clientY - window.innerHeight / 2) / 28;
    setParallax({ x, y });
  };

  const handleRolePreset = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'owner') {
      setEmail('zainab.farooq@exhibitionagency.pk');
    } else if (role === 'admin') {
      setEmail('bilal.hassan@exhibitionagency.pk');
    } else {
      setEmail('aisha.khan@exhibitionagency.pk');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 600);
  };

  const handleAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessEmail) return;
    setAccessRequestSuccess(true);
    setTimeout(() => {
      setAccessRequestSuccess(false);
      setShowAccessModal(false);
      setAccessEmail('');
    }, 2200);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-[#0B0C0E] text-[#F3F4F6]'
          : 'bg-[#F7F5F0] text-charcoal'
      }`}
    >
      {/* Subtle Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/Exhibition Agency BG.png"
          alt=""
          className={`w-full h-full object-cover object-center grayscale contrast-125 transition-opacity duration-500 ${
            theme === 'dark' ? 'opacity-[0.04] mix-blend-screen' : 'opacity-[0.035] mix-blend-multiply'
          }`}
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0B0C0E]/95 via-[#0E1013]/90 to-[#0B0C0E]/98'
            : 'bg-gradient-to-b from-[#F7F5F0]/90 via-[#F7F5F0]/75 to-[#F7F5F0]/95'
        }`} />
      </div>

      {/* Ambient Sage/Emerald Glow Orbs */}
      <div className={`absolute top-1/6 left-1/5 w-[480px] h-[480px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
        theme === 'dark' ? 'bg-emerald-800/15' : 'bg-sage-400/25'
      }`} />
      <div className={`absolute bottom-1/6 right-1/5 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
        theme === 'dark' ? 'bg-sage-900/20' : 'bg-emerald-300/25'
      }`} />

      {/* Top Navbar Utility Bar */}
      <header className="w-full max-w-[1100px] flex items-center justify-between py-4 mb-3 relative z-20">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <BrandLogo size={32} showText={false} />
          <span className={`font-sans font-extrabold text-sm tracking-tight ${theme === 'dark' ? 'text-white' : 'text-charcoal'}`}>
            Exhibition Agency <span className="font-semibold text-[10px] text-sage-800 dark:text-sage-300 uppercase tracking-widest ml-1">Portal</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-charcoal hover:text-sage-800 dark:hover:text-sage-300 transition-colors"
          >
            <span>Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5 text-sage-600" />
          </a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white border border-sage-200/80 dark:border-white/10 text-charcoal transition-all shadow-2xs flex items-center gap-1.5 text-xs font-bold"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sage-800" />}
            <span className="hidden md:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* Main Floating Card Container */}
      <main className="w-full max-w-[1100px] relative z-10 animate-scaleUp">
        <div className={`relative w-full flex flex-col md:flex-row rounded-4xl shadow-soft-2xl overflow-hidden border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-[#121418] border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]'
            : 'bg-white/95 backdrop-blur-2xl border-sage-200/90 shadow-[0_24px_60px_-15px_rgba(36,53,36,0.14)]'
        }`}>
          
          {/* =========================================================================
             LEFT PANEL: Brand Heritage & Interactive Parallax Showcase
             ========================================================================= */}
          <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-[#1E2E1E] via-[#283E28] to-[#152215] p-10 lg:p-12 flex-col justify-between overflow-hidden text-white min-h-[640px]">
            
            {/* Interactive Mouse Parallax Background Ornament */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${parallax.x}px, ${parallax.y}px)`,
              }}
            >
              <svg className="w-[170%] h-[170%] animate-[spin_80s_linear_infinite]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#A4C2A3"
                  d="M44.7,-76.4C58.3,-69.2,70.1,-58.5,78.5,-45.3C86.9,-32.1,91.9,-16.1,90.4,-0.9C88.8,14.4,80.7,28.8,71.2,40.9C61.7,53,50.7,62.8,38.1,70.1C25.5,77.4,12.7,82.2,-0.9,83.7C-14.5,85.2,-29,83.4,-42,76.5C-54.9,69.5,-66.4,57.4,-73.9,43.5C-81.4,29.7,-85,14.8,-83.9,0.7C-82.7,-13.4,-76.8,-26.8,-68.2,-38.7C-59.5,-50.5,-48.1,-60.8,-35.3,-68.4C-22.5,-76,-11.2,-81,2.3,-84.9C15.8,-88.8,31.1,-83.6,44.7,-76.4Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>

            {/* Top Brand Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <BrandLogo size={28} showText={false} />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white block leading-tight">
                    Exhibition Agency
                  </span>
                  <span className="text-[10px] text-sage-300 font-bold uppercase tracking-widest">
                    Curator & Administrative Suite
                  </span>
                </div>
              </div>

              <h1 className="font-sans text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white mt-8">
                Curating extraordinary <br />
                exhibitions, <br />
                <span className="text-sage-200 italic font-serif">seamlessly.</span>
              </h1>

              {/* Feature Highlight Pills */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cream-100 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-sage-300" />
                  Real-Time Floor Plan Sync
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cream-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Zero-Cost WhatsApp Desk
                </span>
              </div>
            </div>

            {/* Testimonial Box */}
            <div className="relative z-10 mt-auto pt-8">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl space-y-4">
                <p className="text-xs font-medium text-cream-100 italic leading-relaxed">
                  "The interactive stall allocator and WhatsApp vendor broadcast trimmed our operational overhead by over 80%. An indispensable system for premium showcases."
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sage-300/60 shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src="/images/1.jpg"
                      alt="Zainab Farooq"
                    />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-white">Zainab Farooq</p>
                    <p className="text-[10px] text-sage-300 uppercase tracking-wider font-bold">
                      Lead Curator & Operations Director
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================================
             RIGHT PANEL: Authentication Form & SSO Controls
             ========================================================================= */}
          <div className={`w-full md:w-1/2 p-8 sm:p-10 lg:p-14 flex flex-col justify-center transition-colors ${
            theme === 'dark' ? 'bg-[#121418]' : 'bg-white'
          }`}>
            
            {/* Mobile Header Wordmark */}
            <div className="flex md:hidden items-center gap-3 mb-6">
              <BrandLogo size={32} showText={false} />
              <div>
                <span className="font-bold text-lg text-charcoal leading-none">Exhibition Agency</span>
                <span className="text-[10px] text-sage-800 font-bold tracking-widest uppercase block">Admin Portal</span>
              </div>
            </div>

            {/* Form Title */}
            <div className="mb-6">
              <span className="eyebrow-label">
                SECURITY AUTHENTICATION
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-charcoal-muted mt-1 font-medium">
                Enter your credentials to access the exhibition management suite.
              </p>
            </div>

            {/* Demo Quick Role Selector (1-Click Switch) */}
            <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-white/[0.04] border border-sage-200/60 dark:border-white/10 mb-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block mb-2">
                Quick Role Autofill (Demo Mode)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['owner', 'admin', 'staff'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRolePreset(r)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold capitalize transition-all glass-rise-btn ${
                      currentRole === r
                        ? 'bg-sage-800 dark:bg-sage-700 text-cream shadow-xs'
                        : 'bg-white dark:bg-white/10 text-charcoal hover:bg-cream-100 dark:hover:bg-white/15 border border-sage-200/80 dark:border-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal-muted uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-sage-600 dark:text-sage-400 group-focus-within:text-sage-900 dark:group-focus-within:text-sage-200 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="curator@exhibitionagency.pk"
                    className="w-full pl-11 pr-4 py-3.5 bg-cream-50 dark:bg-[#1A1D24] rounded-2xl font-medium text-xs text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400/40 border border-sage-200/80 dark:border-white/10 transition-all placeholder:text-charcoal-muted"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <label className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccessModal(true)}
                    className="text-xs font-bold text-sage-800 dark:text-sage-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-sage-600 dark:text-sage-400 group-focus-within:text-sage-900 dark:group-focus-within:text-sage-200 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-11 py-3.5 bg-cream-50 dark:bg-[#1A1D24] rounded-2xl font-medium text-xs text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400/40 border border-sage-200/80 dark:border-white/10 transition-all placeholder:text-charcoal-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-charcoal-muted hover:text-charcoal transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2.5 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-sage-300 text-sage-800 focus:ring-sage-600 cursor-pointer accent-sage-800"
                />
                <label htmlFor="remember" className="text-xs font-semibold text-charcoal-muted cursor-pointer select-none">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 btn-primary rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-sage-100 dark:border-white/10 flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-widest">
                Or authenticate via enterprise SSO
              </span>

              {/* SSO Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-cream-50 dark:bg-white/[0.04] hover:bg-cream-100 dark:hover:bg-white/[0.08] border border-sage-200/80 dark:border-white/10 rounded-2xl transition-all font-bold text-xs text-charcoal cursor-pointer glass-rise-btn"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 py-3 px-4 flex items-center justify-center gap-2 bg-cream-50 dark:bg-white/[0.04] hover:bg-cream-100 dark:hover:bg-white/[0.08] border border-sage-200/80 dark:border-white/10 rounded-2xl transition-all font-bold text-xs text-charcoal cursor-pointer glass-rise-btn"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.89 1.7-.87 2.76.99.08 1.95-.51 2.57-1.26z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>
            </div>

            {/* Bottom Request Access Link */}
            <div className="mt-6 text-center text-xs font-semibold text-charcoal-muted">
              New organizer or partner?{' '}
              <button
                type="button"
                onClick={() => setShowAccessModal(true)}
                className="text-sage-800 dark:text-sage-300 hover:underline font-bold"
              >
                Request curator access
              </button>
            </div>

          </div>

        </div>

        {/* Small Muted Trust Badge Row Centered Below Card */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-60 text-[10px] font-bold uppercase tracking-widest text-charcoal-muted text-center">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-700" />
            Zero-Cost WhatsApp Protocol
          </span>
          <span className="hidden sm:inline">•</span>
          <span>PCI-DSS Financial Ledger</span>
          <span className="hidden sm:inline">•</span>
          <span>ISO 27001 Certified Infrastructure</span>
          <span className="hidden sm:inline">•</span>
          <span>Real-Time Floor Plan Sync</span>
        </div>

      </main>

      {/* Access Request / Password Reset Modal */}
      <ModalPortal isOpen={showAccessModal} onClose={() => setShowAccessModal(false)} maxWidthClass="max-w-md">
        <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full p-6 sm:p-8 shadow-soft-2xl">
          <span className="eyebrow-label">
            VERIFIED ONBOARDING
          </span>
          <h3 className="font-sans text-xl font-extrabold text-charcoal mb-2">
            Request Curator Credentials
          </h3>
          <p className="text-xs text-charcoal-muted mb-6 leading-relaxed">
            Curator and organizer credentials are restricted to verified team leads. Submit your email to receive an onboarding verification link.
          </p>

          {accessRequestSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Verification request dispatched! Check your mailbox.</span>
            </div>
          ) : (
            <form onSubmit={handleAccessRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-muted uppercase tracking-wider mb-1.5">
                  Official Work Email
                </label>
                <input
                  type="email"
                  required
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  placeholder="organizer@exhibitionagency.pk"
                  className="w-full px-4 py-3 bg-cream-50 dark:bg-white/[0.05] rounded-2xl text-xs font-semibold text-charcoal border border-sage-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccessModal(false)}
                  className="flex-1 py-3 btn-secondary rounded-2xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 btn-primary rounded-2xl text-xs font-bold uppercase tracking-wider"
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalPortal>

    </div>
  );
}
