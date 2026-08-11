'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UserPlus, ShieldCheck, Mail, Phone, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';
import { ModalPortal } from '../common/ModalPortal';

const staffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number is required'),
  role: z.enum(['owner', 'staff']),
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
    watch,
    reset,
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
    <ModalPortal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-lg">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full p-6 sm:p-8 shadow-soft-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="eyebrow-label">
                ACCESS CONTROL
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                Invite Staff Member
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal transition-colors"
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
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
            />
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Official Email *
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="bilal@exhibitionagency.pk"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
              {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
              {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Assigned Role *
            </label>
            <select
              {...register('role')}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal outline-none bg-white dark:bg-[#1A1D24]"
            >
              <option value="staff">Staff (Floor Plan Allocation & Entry Only)</option>
              <option value="owner">Owner (Full Unrestricted System Governance)</option>
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/[0.04] border border-sage-200/60 dark:border-white/10 space-y-1 text-xs text-charcoal-muted">
            <div className="font-semibold text-charcoal flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-800 dark:text-sage-300" />
              <span>Role Permissions Summary:</span>
            </div>
            <div className="space-y-0.5 text-[11px] pt-1">
              <p>• Floor plan stall assignment: <strong>Granted</strong></p>
              <p>• Vendor approval & waitlist: {selectedRole === 'staff' ? 'Restricted' : 'Granted'}</p>
              <p>• Financial ledger audit & expense approval: {selectedRole === 'staff' ? 'Restricted' : 'Granted'}</p>
              <p>• Permanent record deletion: {selectedRole === 'owner' ? 'Yes' : 'Restricted'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider"
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
    </ModalPortal>
  );
};
