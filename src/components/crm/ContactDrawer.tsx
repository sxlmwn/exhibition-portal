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
  Store,
  Sparkles,
  Send
} from 'lucide-react';
import { CRMContact } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

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
  const { updateContact, deleteContact, currentUser } = useAdmin();
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
    if (confirm(`Delete contact "${contact.fullName || contact.businessName}"?`)) {
      deleteContact(contact.id);
      onClose();
    }
  };

  const displayName = contact.fullName || contact.name || contact.businessName;

  return (
    <ModalPortal isOpen={!!contact} onClose={onClose} maxWidthClass="max-w-2xl">
      {/* Elevated Centered Modal Card */}
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-sage-100 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sage-800 dark:bg-sage-700 text-cream font-sans font-bold text-xl flex items-center justify-center shadow-xs">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-sage-200 dark:border-white/10 text-sage-800 dark:text-sage-300">
                  {contact.category}
                </span>
                <span className="status-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  {contact.status}
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-charcoal dark:text-white tracking-tight">
                {displayName}
              </h2>
              <span className="text-xs text-charcoal-muted dark:text-white/60 font-medium">
                Source: {contact.source || 'Direct Lead'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-0.5">
                Linked Exhibition Edition
              </span>
              <span className="font-sans text-base font-bold text-charcoal dark:text-white">
                {contact.exhibitionName || 'General / All Exhibitions'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-white/5 border border-sage-200/80 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-0.5">
                Last Activity / Entry
              </span>
              <span className="font-sans text-base font-bold text-charcoal dark:text-white">
                {contact.lastActivityDate || 'Season 2026'}
              </span>
            </div>

          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block">
                Direct Contact Channels
              </span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <a
                  href={`tel:${contact.phone}`}
                  className="font-bold text-charcoal dark:text-white hover:underline"
                >
                  {contact.phone || 'No phone'}
                </a>
              </div>
              <div className="flex items-center gap-2 text-charcoal-muted dark:text-white/60">
                <Mail className="w-4 h-4 text-sage-700 dark:text-sage-400" />
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:underline font-medium text-charcoal dark:text-white truncate"
                >
                  {contact.email || 'No email'}
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  WhatsApp Direct Action
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium">
                  Dispatch catalog or invitation on WhatsApp
                </span>
              </div>
              <a
                href={buildWhatsAppUrl(
                  'Hello {Name}, regarding your exhibition stall reservation for {Exhibition}...',
                  contact
                ).url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all glass-rise-btn flex items-center justify-center gap-1.5 self-start"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Chat</span>
              </a>
            </div>

          </div>

          {/* Notes & Activity Log */}
          <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-sage-200/70 dark:border-white/10">
            <span className="text-[10px] uppercase tracking-wider font-bold text-charcoal-muted dark:text-white/60 block mb-2">
              Curator Notes & Activity Log
            </span>
            <div className="p-3.5 rounded-xl bg-cream-50 dark:bg-white/5 border border-sage-200/60 dark:border-white/10 text-xs text-charcoal dark:text-white whitespace-pre-line leading-relaxed mb-3 max-h-36 overflow-y-auto font-medium">
              {contact.notes || 'No activity notes logged yet.'}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Append a CRM interaction note..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white dark:bg-white/5 outline-none focus:border-sage-500 font-medium"
              />
              <button
                onClick={handleAddNote}
                className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider glass-rise-btn flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onEdit(contact);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-lg border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 glass-rise-btn"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Contact</span>
            </button>

            {currentUser.permissions.canDeleteRecords && (
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
