'use client';

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Tag, 
  CalendarDays, 
  DollarSign, 
  MessageSquare, 
  Edit3, 
  Trash2,
  CheckCircle2,
  Store
} from 'lucide-react';
import { CRMContact } from '../../types';
import { useAdmin } from '../../context/AdminContext';

interface ContactDrawerProps {
  contact: CRMContact | null;
  onClose: () => void;
  onEdit: (contact: CRMContact) => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  onClose,
  onEdit
}) => {
  const { updateContact, deleteContact } = useAdmin();
  const [newNote, setNewNote] = useState('');

  if (!contact) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updatedNotes = contact.notes 
      ? `${contact.notes}\n• [${new Date().toISOString().split('T')[0]}] ${newNote}`
      : `• [${new Date().toISOString().split('T')[0]}] ${newNote}`;
    updateContact(contact.id, { notes: updatedNotes });
    setNewNote('');
  };

  const handleDelete = () => {
    if (confirm(`Delete contact "${contact.businessName}"?`)) {
      deleteContact(contact.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full shadow-soft-2xl border-l border-sage-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sage-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sage-800 text-cream font-sans font-extrabold text-xl flex items-center justify-center">
                {contact.businessName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-sans text-2xl font-extrabold text-charcoal leading-tight tracking-tight">
                  {contact.businessName}
                </h3>
                <span className="text-xs text-charcoal-muted font-normal">
                  {contact.name}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-sage-200 text-xs">
              <Phone className="w-4 h-4 text-sage-700" />
              <div className="flex-1">
                <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider font-semibold">Phone / WhatsApp</span>
                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-sage-200 text-xs">
              <Mail className="w-4 h-4 text-sage-700" />
              <div className="flex-1">
                <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider font-semibold">Email</span>
                <span className="font-medium text-charcoal">{contact.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-cream-50 border border-sage-200">
                <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider font-semibold">Total Spend</span>
                <span className="font-sans text-lg font-extrabold text-sage-deep">
                  Rs. {contact.totalSpend.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-cream-50 border border-sage-200">
                <span className="text-charcoal-muted text-[10px] block uppercase tracking-wider">Status</span>
                <span className="font-bold text-charcoal capitalize">
                  {contact.status}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-2">
              Assigned Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-sage-100 text-sage-900 px-3 py-1 rounded-full border border-sage-200 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Notes & Activity Log */}
          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-2">
              Curator Notes & Activity Log
            </span>
            <div className="p-4 rounded-2xl bg-cream-50 border border-sage-200 text-xs font-light text-charcoal-muted whitespace-pre-line leading-relaxed mb-3 max-h-40 overflow-y-auto">
              {contact.notes || 'No notes logged yet.'}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Append a note..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-sage-200 text-xs outline-none focus:border-sage-500"
              />
              <button
                onClick={handleAddNote}
                className="btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="pt-4 border-t border-sage-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onEdit(contact);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl hover:bg-rose-100 text-rose-700 transition-colors"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
