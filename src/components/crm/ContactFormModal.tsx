'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, User, Building2, Phone, Mail, Tag } from 'lucide-react';
import { CRMContact } from '../../types';
import { useAdmin } from '../../context/AdminContext';

const contactSchema = z.z.object({
  name: z.string().min(2, 'Name is required'),
  businessName: z.string().min(2, 'Brand/Business name is required'),
  phone: z.string().min(8, 'Valid phone/WhatsApp is required'),
  email: z.string().email('Valid email is required'),
  category: z.string().min(2, 'Category is required'),
  status: z.enum(['booked', 'enquired', 'waitlisted', 'past-client', 'referral']),
  totalSpend: z.number().min(0),
  tagsInput: z.string(),
  notes: z.string(),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      businessName: '',
      phone: '',
      email: '',
      category: 'Lifestyle & Apparel',
      status: 'enquired',
      totalSpend: 0,
      tagsInput: 'Lahore 2026, New Lead',
      notes: '',
    }
  });

  useEffect(() => {
    if (contactToEdit) {
      reset({
        name: contactToEdit.name,
        businessName: contactToEdit.businessName,
        phone: contactToEdit.phone,
        email: contactToEdit.email,
        category: contactToEdit.category,
        status: contactToEdit.status,
        totalSpend: contactToEdit.totalSpend,
        tagsInput: contactToEdit.tags.join(', '),
        notes: contactToEdit.notes,
      });
    } else {
      reset({
        name: '',
        businessName: '',
        phone: '',
        email: '',
        category: 'Lifestyle & Apparel',
        status: 'enquired',
        totalSpend: 0,
        tagsInput: 'Lahore 2026, New Lead',
        notes: '',
      });
    }
  }, [contactToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: ContactFormData) => {
    const parsedTags = data.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (contactToEdit) {
      updateContact(contactToEdit.id, {
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        email: data.email,
        category: data.category,
        status: data.status,
        totalSpend: data.totalSpend,
        tags: parsedTags,
        notes: data.notes,
      });
    } else {
      addContact({
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        email: data.email,
        category: data.category,
        status: data.status,
        totalSpend: data.totalSpend,
        tags: parsedTags,
        exhibitionIds: [exhibitions[0]?.id || 'exh-1'],
        notes: data.notes,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-soft-2xl border border-sage-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-sage-100 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block mb-1">
              CRM Record
            </span>
            <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
              {contactToEdit ? 'Edit Exhibitor Contact' : 'Add New Exhibitor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Brand Name *
              </label>
              <input
                type="text"
                {...register('businessName')}
                placeholder="e.g. Terra Clayworks"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.businessName && <p className="text-rose-600 text-xs mt-1">{errors.businessName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Contact Person *
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Ayla Siddiqui"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                WhatsApp / Phone *
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="ayla@terraclay.com"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
              {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Category *
              </label>
              <input
                type="text"
                {...register('category')}
                placeholder="e.g. Studio Ceramics"
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none bg-white"
              >
                <option value="enquired">Enquiry / Lead</option>
                <option value="booked">Confirmed Booked</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="past-client">Past Client</option>
                <option value="referral">Referral Partner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              {...register('tagsInput')}
              placeholder="e.g. Lahore 2026, Corner Slot, High Demand"
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Curator Notes
            </label>
            <textarea
              rows={3}
              {...register('notes')}
              placeholder="Add history, past sales performance, or display requirements..."
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500 font-sans"
            />
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
              {contactToEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
