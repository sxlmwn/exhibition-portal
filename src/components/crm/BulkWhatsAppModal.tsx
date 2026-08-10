'use client';

import React, { useState } from 'react';
import { X, MessageSquare, ExternalLink, Check, Sparkles, Send } from 'lucide-react';
import { CRMContact } from '../../types';

interface BulkWhatsAppModalProps {
  contacts: CRMContact[];
  onClose: () => void;
}

export const BulkWhatsAppModal: React.FC<BulkWhatsAppModalProps> = ({
  contacts,
  onClose
}) => {
  const [template, setTemplate] = useState<string>(
    `Hello {Name}! 👋\n\nThis is the Exhibition Agency Curation Desk. We are pleased to confirm that early-bird stall reservations are now open for our upcoming showcase.\n\nPlease reply here to view available premium slots or confirm your booking!`
  );

  const [openedContacts, setOpenedContacts] = useState<Record<string, boolean>>({});

  const handleOpenLink = (contact: CRMContact) => {
    const personalizedMessage = template
      .replace('{Name}', contact.name || contact.businessName)
      .replace('{Business}', contact.businessName);

    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;

    window.open(waUrl, '_blank');
    setOpenedContacts(prev => ({ ...prev, [contact.id]: true }));
  };

  const openedCount = Object.keys(openedContacts).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Full-Screen Frosted Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 modal-glass-container dark:bg-[#161C16] dark:text-[#F7F5F0] rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-soft-2xl animate-scaleUp">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-sage-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#161C16]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 block">
                Zero-Cost WhatsApp Dispatch
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal tracking-tight">
                Sequential WhatsApp Queue ({contacts.length})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-sage-200 text-xs text-charcoal-muted font-light leading-relaxed">
            <strong className="text-charcoal font-semibold">How this works:</strong> To keep this 100% free and ban-safe (without expensive API fees), each contact has a dedicated button that opens their personalized chat in WhatsApp Web/App sequentially.
          </div>

          {/* Template Editor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
              Message Template (Variables: <code className="text-sage-800 font-bold">{'{Name}'}</code>, <code className="text-sage-800 font-bold">{'{Business}'}</code>)
            </label>
            <textarea
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500 font-sans leading-relaxed"
            />
          </div>

          {/* Contact Queue Progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-3">
              <span>Dispatch Queue ({openedCount} of {contacts.length} opened)</span>
              <span className="text-sage-800 font-bold">{Math.round((openedCount / contacts.length) * 100)}%</span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {contacts.map((contact, index) => {
                const isSent = !!openedContacts[contact.id];

                return (
                  <div
                    key={contact.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isSent
                        ? 'bg-emerald-50/60 border-emerald-200 text-charcoal-muted'
                        : 'bg-white border-sage-200 hover:border-sage-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center font-bold text-[10px] text-charcoal shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-charcoal truncate block">
                          {contact.businessName}
                        </span>
                        <span className="text-charcoal-muted text-[11px] font-light truncate block">
                          {contact.name} &bull; {contact.phone}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenLink(contact)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors ${
                        isSent
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Sent</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send WA</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-sage-100 flex items-center justify-between">
            <span className="text-xs text-charcoal-muted">
              Total {contacts.length} vendor recipients
            </span>
            <button
              onClick={onClose}
              className="btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              Done / Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
