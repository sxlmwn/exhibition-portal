'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus, ShieldCheck, Mail, Phone, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';

const staffSchema = z.z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number is required'),
  role: z.enum(['owner', 'admin', 'staff']),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffInviteModal: React.FC<StaffInviteModalProps> = ({
  isOpen,
  onClose
}) => {
  const { inviteStaffUser } = useAdmin();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '+92 300 ',
      role: 'staff',
    }
  });

  const selectedRole = watch('role');

  if (!isOpen) return null;

  const onSubmit = (data: StaffFormData) => {
    inviteStaffUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      permissions: {
        canManageExhibitions: data.role !== 'staff',
        canApproveRequests: data.role !== 'staff',
        canAllocateStalls: true,
        canApproveExpenses: data.role !== 'staff',
        canDeleteRecords: data.role === 'owner',
        canSendBulkMessages: data.role !== 'staff',
      }
    });

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Full-Screen Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 modal-glass-container dark:bg-[#161C16] dark:text-[#F7F5F0] rounded-4xl w-full max-w-lg p-6 sm:p-8 shadow-soft-2xl animate-scaleUp">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
                Access Control
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                Invite Staff Member
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Bilal Ahmed"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
            />
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Work Email *
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="bilal@exhibitionagency.com"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
            />
            {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Phone *
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+92 300 0000000"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Assigned Role *
              </label>
              <select
                {...register('role')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal bg-white outline-none focus:border-sage-500"
              >
                <option value="staff">Staff (Logistics & Entry)</option>
                <option value="admin">Admin (Approvals & CRM)</option>
                <option value="owner">Owner (Full Authority)</option>
              </select>
            </div>
          </div>

          {/* Role permissions summary preview */}
          <div className="p-3.5 rounded-2xl bg-cream-50 border border-sage-200 text-xs space-y-1">
            <span className="font-semibold text-charcoal block mb-1">
              Permission Preset ({selectedRole.toUpperCase()}):
            </span>
            <div className="text-[11px] text-charcoal-muted space-y-0.5 font-light">
              <p>• Stall allocations: {selectedRole ? 'Allowed' : 'Allowed'}</p>
              <p>• Expense entry: Allowed (Status: {selectedRole === 'staff' ? 'Pending Approval' : 'Auto-Approved'})</p>
              <p>• Expense & Vendor approvals: {selectedRole !== 'staff' ? 'Yes' : 'Restricted (Owner/Admin only)'}</p>
              <p>• Permanent record deletion: {selectedRole === 'owner' ? 'Yes' : 'Restricted'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              Send Staff Invite
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
