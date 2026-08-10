'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
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
    currentRole, 
    settings, 
    updateSettings 
  } = useAdmin();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    updateSettings(agencyForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'admin': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'staff': return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
            System Administration
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal">
            Agency Settings & Access Roles
          </h2>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="btn-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto shadow-soft"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Staff & Roles Management Section */}
      <div className="glass-card p-6 sm:p-8 rounded-4xl border border-sage-200 shadow-soft space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
              Team Directory
            </span>
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Staff Members & Role Permissions
            </h3>
          </div>
          <span className="text-xs font-semibold bg-sage-50 text-sage-800 px-3.5 py-1.5 rounded-full border border-sage-200">
            {staffUsers.length} Active Accounts
          </span>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/80 border-b border-sage-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
              <tr>
                <th className="py-4 px-4">Member</th>
                <th className="py-4 px-4">Role Badge</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-5 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {staffUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/80 transition-colors">
                  
                  {/* User info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-sage-300 ring-2 ring-cream"
                      />
                      <div>
                        <span className="font-bold text-charcoal block">
                          {user.name}
                        </span>
                        <span className="text-charcoal-muted text-[11px] font-light">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 text-charcoal-muted font-light">
                    {user.phone}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 text-charcoal-muted font-light">
                    {user.joinedDate}
                  </td>

                  {/* Role Assignment dropdown & delete */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateStaffRole(user.id, e.target.value as UserRole)}
                        disabled={currentRole !== 'owner' && user.role === 'owner'}
                        className="px-3 py-1.5 rounded-xl border border-sage-200 bg-white text-xs font-semibold text-charcoal outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>

                      {currentRole === 'owner' && user.role !== 'owner' && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove staff access for ${user.name}?`)) {
                              deleteStaffUser(user.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-charcoal-muted hover:text-rose-700 transition-colors"
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

        {/* Permissions Matrix Reference Table */}
        <div className="pt-6 border-t border-sage-100">
          <span className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-3">
            Role Permission Matrix Breakdown
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Owner Role</span>
              </div>
              <ul className="space-y-1 text-[11px] text-emerald-800 font-light">
                <li>&bull; Full administrative authority</li>
                <li>&bull; Manage & delete exhibitions</li>
                <li>&bull; Approve/reject expense vouchers</li>
                <li>&bull; Invite staff & change roles</li>
                <li>&bull; Permanent record deletion</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>Admin Role</span>
              </div>
              <ul className="space-y-1 text-[11px] text-purple-800 font-light">
                <li>&bull; Add/edit exhibitions</li>
                <li>&bull; Review & approve vendor requests</li>
                <li>&bull; Floor plan stall allocations</li>
                <li>&bull; Expense review & CRM blasts</li>
                <li>&bull; Cannot delete core financial ledgers</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Staff Role</span>
              </div>
              <ul className="space-y-1 text-[11px] text-amber-800 font-light">
                <li>&bull; Floor plan stall assignments</li>
                <li>&bull; Log expense vouchers (marked Pending)</li>
                <li>&bull; View vendor contacts & directory</li>
                <li>&bull; Approvals & deletes restricted</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* General Agency Settings Form */}
      <div className="glass-card p-6 sm:p-8 rounded-4xl border border-sage-200 shadow-soft">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
              Organization Info
            </span>
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Agency Profile & Defaults
            </h3>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved Successfully</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveAgency} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Agency Name *
              </label>
              <input
                type="text"
                value={agencyForm.agencyName}
                onChange={(e) => setAgencyForm({ ...agencyForm, agencyName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={agencyForm.tagline}
                onChange={(e) => setAgencyForm({ ...agencyForm, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Curation Desk Email *
              </label>
              <input
                type="email"
                value={agencyForm.supportEmail}
                onChange={(e) => setAgencyForm({ ...agencyForm, supportEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Lead Coordinator WhatsApp *
              </label>
              <input
                type="text"
                value={agencyForm.coordinatorWhatsApp}
                onChange={(e) => setAgencyForm({ ...agencyForm, coordinatorWhatsApp: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Default Currency
              </label>
              <select
                value={agencyForm.currency}
                onChange={(e) => setAgencyForm({ ...agencyForm, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal bg-white outline-none"
              >
                <option value="PKR (Rs.)">PKR (Rs.)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="AED (AED)">AED (AED)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Headquarters Office Address
            </label>
            <input
              type="text"
              value={agencyForm.headquartersAddress}
              onChange={(e) => setAgencyForm({ ...agencyForm, headquartersAddress: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
            />
          </div>

          <div className="pt-4 border-t border-sage-100 flex items-center justify-end">
            <button
              type="submit"
              className="btn-primary px-8 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-soft"
            >
              <Check className="w-4 h-4" />
              <span>Save Agency Settings</span>
            </button>
          </div>

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
