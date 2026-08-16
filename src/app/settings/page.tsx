'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  UserPlus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Trash2, 
  Sparkles,
  Lock,
  Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';
import { StaffInviteModal } from '../../components/settings/StaffInviteModal';

export default function SettingsPage() {
  const { 
    staffUsers, 
    updateStaffRole, 
    deleteStaffUser, 
    currentUser,
    settings, 
    updateSettings 
  } = useAdmin();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwner = currentUser.permissions.canDeleteRecords || currentUser.role === 'owner';

  const [agencyForm, setAgencyForm] = useState({
    agencyName: settings.agencyName,
    tagline: settings.tagline,
    supportEmail: settings.supportEmail,
    coordinatorWhatsApp: settings.coordinatorWhatsApp,
    headquartersAddress: settings.headquartersAddress,
    currency: settings.currency,
  });

  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    updateSettings(agencyForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40';
      case 'staff': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/40';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="eyebrow-label">
            SETTINGS & TEAM
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
            Settings & Team Members
          </h2>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="btn-primary glass-rise-btn px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-soft"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Staff & Roles Management Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-sage-200 dark:border-white/10 shadow-soft space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-sage-800 dark:text-sage-300 block">
              Team Directory
            </span>
            <h3 className="font-sans text-2xl font-bold text-charcoal dark:text-white tracking-tight">
              Team Members & Permissions
            </h3>
          </div>
          <span className="text-xs font-semibold bg-sage-50 dark:bg-white/10 text-sage-800 dark:text-sage-300 px-3.5 py-1.5 rounded-full border border-sage-200 dark:border-white/10">
            {staffUsers.length} Active Accounts
          </span>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/80 dark:bg-white/5 border-b border-sage-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-charcoal-muted dark:text-white/60">
              <tr>
                <th className="py-4 px-4">Member</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Phone</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Joined</th>
                <th className="py-4 px-5 text-right">Role / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-white/5">
              {staffUsers.map((user) => (
                <tr key={user.id} className="glass-rise-row hover:bg-white/90 dark:hover:bg-white/5 transition-all">
                  
                  {/* User info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-sage-300 ring-2 ring-cream dark:ring-transparent"
                      />
                      <div>
                        <span className="font-bold text-charcoal dark:text-white block">
                          {user.name}
                        </span>
                        <span className="text-charcoal-muted dark:text-white/60 text-[11px] font-light">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="py-4 px-4">
                    <span className={`status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 text-charcoal-muted dark:text-white/70 font-medium">
                    {user.phone}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 text-charcoal-muted dark:text-white/60 font-light">
                    {user.joinedDate}
                  </td>

                  {/* Role Assignment dropdown & delete */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateStaffRole(user.id, e.target.value as UserRole)}
                        disabled={!isOwner || user.id === currentUser.id}
                        className="px-3 py-1.5 rounded-lg border border-sage-200 dark:border-white/10 bg-white dark:bg-[#1A1D24] text-xs font-bold text-charcoal dark:text-white outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed glass-select shadow-2xs"
                      >
                        <option value="owner">Owner</option>
                        <option value="staff">Staff</option>
                      </select>

                      {isOwner && user.role !== 'owner' && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove staff access for ${user.name}?`)) {
                              deleteStaffUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-charcoal-muted hover:text-rose-700 transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* General Agency Settings Form */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-sage-200 dark:border-white/10 shadow-soft">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 dark:text-sage-300 block">
              Organization Info
            </span>
            <h3 className="font-sans text-2xl font-extrabold text-charcoal dark:text-white tracking-tight">
              Company Profile & Defaults
            </h3>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveAgency} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Company / Agency Name *
              </label>
              <input
                type="text"
                value={agencyForm.agencyName}
                onChange={(e) => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                disabled={!isOwner}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input disabled:opacity-60 disabled:bg-cream-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={agencyForm.tagline}
                onChange={(e) => setAgencyForm({ ...agencyForm, tagline: e.target.value })}
                disabled={!isOwner}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input disabled:opacity-60 disabled:bg-cream-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Support / Team Email *
              </label>
              <input
                type="email"
                value={agencyForm.supportEmail}
                onChange={(e) => setAgencyForm({ ...agencyForm, supportEmail: e.target.value })}
                disabled={!isOwner}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input disabled:opacity-60 disabled:bg-cream-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Coordinator WhatsApp *
              </label>
              <input
                type="text"
                value={agencyForm.coordinatorWhatsApp}
                onChange={(e) => setAgencyForm({ ...agencyForm, coordinatorWhatsApp: e.target.value })}
                disabled={!isOwner}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input disabled:opacity-60 disabled:bg-cream-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Default Currency
              </label>
              <select
                value={agencyForm.currency}
                onChange={(e) => setAgencyForm({ ...agencyForm, currency: e.target.value })}
                disabled={!isOwner}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-[#1A1D24] outline-none font-bold glass-select disabled:opacity-60 disabled:bg-cream-50"
              >
                <option value="PKR (Rs.)">PKR (Rs.)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="AED (AED)">AED (AED)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Headquarters Office Address
            </label>
            <input
              type="text"
              value={agencyForm.headquartersAddress}
              onChange={(e) => setAgencyForm({ ...agencyForm, headquartersAddress: e.target.value })}
              disabled={!isOwner}
              className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white/80 dark:bg-white/5 outline-none focus:border-sage-500 font-medium glass-input disabled:opacity-60 disabled:bg-cream-50"
            />
          </div>

          {isOwner ? (
            <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end">
              <button
                type="submit"
                className="btn-primary glass-rise-btn px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-soft"
              >
                <Check className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-sage-100 dark:border-white/10 text-right">
              <span className="text-xs text-charcoal-muted dark:text-white/60 font-medium italic">
                Agency defaults and settings can only be modified by Owners.
              </span>
            </div>
          )}

        </form>

      </div>

      {/* Invite Modal */}
      <StaffInviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

    </div>
  );
}
