'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, User, Building2, Phone, Mail, Tag, Compass } from 'lucide-react';
import { CRMContact, ContactStatus } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(8, 'Valid phone/WhatsApp number is required'),
  email: z.string().email('Valid email address is required'),
  category: z.string().min(2, 'Category is required'),
  exhibitionId: z.string().min(1, 'Target exhibition is required'),
  status: z.enum(['booked', 'enquired', 'waitlisted', 'past-client', 'referral']),
  source: z.string().min(2, 'Lead source is required'),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: CRMContact | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  contactToEdit
}) => {
  const { addContact, updateContact, exhibitions } = useAdmin();

  const defaultExhibitionId = exhibitions[0]?.id || '2';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      category: 'Haute Couture & Fine Jewelry',
      exhibitionId: defaultExhibitionId,
      status: 'enquired',
      source: 'Instagram DM',
      notes: '',
    }
  });

  useEffect(() => {
    if (contactToEdit) {
      reset({
        fullName: contactToEdit.fullName || contactToEdit.name || '',
        phone: contactToEdit.phone || '',
        email: contactToEdit.email || '',
        category: contactToEdit.category || 'Haute Couture & Fine Jewelry',
        exhibitionId: contactToEdit.exhibitionId || defaultExhibitionId,
        status: contactToEdit.status || 'enquired',
        source: contactToEdit.source || 'Instagram DM',
        notes: contactToEdit.notes || '',
      });
    } else {
      reset({
        fullName: '',
        phone: '',
        email: '',
        category: 'Haute Couture & Fine Jewelry',
        exhibitionId: defaultExhibitionId,
        status: 'enquired',
        source: 'Instagram DM',
        notes: '',
      });
    }
  }, [contactToEdit, reset, isOpen, defaultExhibitionId]);

  const onSubmit = (data: ContactFormData) => {
    const targetExh = exhibitions.find(e => e.id === data.exhibitionId);
    const exhibitionName = targetExh ? targetExh.title : 'Exhibition Edition';

    if (contactToEdit) {
      updateContact(contactToEdit.id, {
        fullName: data.fullName,
        name: data.fullName,
        businessName: data.fullName,
        phone: data.phone,
        email: data.email,
        category: data.category,
        exhibitionId: data.exhibitionId,
        exhibitionName,
        status: data.status,
        source: data.source,
        notes: data.notes || '',
      });
    } else {
      addContact({
        fullName: data.fullName,
        name: data.fullName,
        businessName: data.fullName,
        phone: data.phone,
        email: data.email,
        category: data.category,
        exhibitionId: data.exhibitionId,
        exhibitionName,
        status: data.status,
        source: data.source,
        notes: data.notes || '',
      });
    }
    onClose();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-6">
          <div>
            <span className="eyebrow-label">
              CRM DIRECTORY
            </span>
            <h3 className="font-sans text-2xl font-extrabold text-charcoal dark:text-white tracking-tight">
              {contactToEdit ? 'Edit Exhibitor Contact' : 'Add New Exhibitor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Full Name / Business Entity *
            </label>
            <input
              type="text"
              {...register('fullName')}
              placeholder="e.g. Sania Maskatiya (Maskatiya Pret)"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
            />
            {errors.fullName && <p className="text-rose-600 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                WhatsApp / Phone Number *
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
              {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="sania@maskatiya.com"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
              {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Exhibition & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Linked Exhibition Edition *
              </label>
              <select
                {...register('exhibitionId')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-[#1A1D24]"
              >
                {exhibitions.map((exh) => (
                  <option key={exh.id} value={exh.id}>
                    {exh.title} ({exh.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Product Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-[#1A1D24]"
              >
                <option value="Haute Couture & Fine Jewelry">Haute Couture & Fine Jewelry</option>
                <option value="Home, Decor & Wellness">Home, Decor & Wellness</option>
                <option value="Lifestyle & Artisan Craft">Lifestyle & Artisan Craft</option>
                <option value="Contemporary Art & Design">Contemporary Art & Design</option>
                <option value="Textile & Apparel">Textile & Apparel</option>
                <option value="Studio Ceramics">Studio Ceramics</option>
                <option value="Beauty & Skincare">Beauty & Skincare</option>
                <option value="Leather & Accessories">Leather & Accessories</option>
              </select>
            </div>
          </div>

          {/* Status & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-[#1A1D24]"
              >
                <option value="enquired">Enquiry / Lead</option>
                <option value="booked">Confirmed Booked</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="past-client">Past Client</option>
                <option value="referral">Referral Partner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Lead Source *
              </label>
              <input
                type="text"
                {...register('source')}
                placeholder="e.g. Instagram DM, VIP Referral, Website"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
              />
              {errors.source && <p className="text-rose-600 text-xs mt-1">{errors.source.message}</p>}
            </div>
          </div>

          {/* Curator Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
              Internal Curator Notes (Optional)
            </label>
            <textarea
              rows={3}
              {...register('notes')}
              placeholder="Add details on exhibitor history, booth requirements, or communication history..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5"
            />
          </div>

          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              {contactToEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
};
