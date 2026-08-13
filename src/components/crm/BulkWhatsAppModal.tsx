'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  Send, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { CRMContact } from '../../types';
import { ModalPortal } from '../common/ModalPortal';
import { buildWhatsAppUrl } from '../../lib/whatsapp';

interface BulkWhatsAppModalProps {
  contacts: CRMContact[];
  initialTemplate?: string;
  onClose: () => void;
}

export const BulkWhatsAppModal: React.FC<BulkWhatsAppModalProps> = ({
  contacts,
  initialTemplate,
  onClose
}) => {
  const [template, setTemplate] = useState<string>(
    initialTemplate ||
    `Hello {Name}! 👋 We are reaching out from the Curation Desk regarding {Exhibition}. Please let us know if you'd like to reserve your booth slot!`
  );

  const [openedContacts, setOpenedContacts] = useState<Record<string, boolean>>({});

  // Compute pending contacts in order
  const pendingContacts = useMemo(() => {
    return contacts.filter(c => !openedContacts[c.id]);
  }, [contacts, openedContacts]);

  const currentNextContact = pendingContacts[0] || null;
  const openedCount = Object.keys(openedContacts).length;
  const progressPercent = contacts.length > 0 ? Math.round((openedCount / contacts.length) * 100) : 0;
  const isAllComplete = openedCount === contacts.length && contacts.length > 0;

  // Open single contact via genuine user click
  const handleOpenContact = (contact: CRMContact) => {
    const { url, cleanPhone, interpolatedMessage } = buildWhatsAppUrl(template, {
      fullName: contact.fullName,
      name: contact.name,
      businessName: contact.businessName,
      exhibitionName: contact.exhibitionName,
      phone: contact.phone,
    });

    console.log(`[Bulk WhatsApp Modal] Opening chat for ${contact.fullName || contact.name} (${cleanPhone}):`, url);
    window.open(url, '_blank');
    setOpenedContacts(prev => ({ ...prev, [contact.id]: true }));
  };

  // One-click sequential step (Guaranteed No Popup Blocker)
  const handleDispatchNext = () => {
    if (!currentNextContact) return;
    handleOpenContact(currentNextContact);
  };

  // Optional: Attempt staggered open of all remaining
  const handleOpenAllStaggered = () => {
    if (pendingContacts.length === 0) return;
    
    pendingContacts.forEach((contact, idx) => {
      setTimeout(() => {
        handleOpenContact(contact);
      }, idx * 400);
    });
  };

  return (
    <ModalPortal isOpen={contacts.length > 0} onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="modal-glass-container dark:bg-[#121418] dark:text-[#F3F4F6] rounded-4xl w-full max-h-[90vh] overflow-y-auto shadow-soft-2xl">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-sage-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="eyebrow-label">
                DIRECT WHATSAPP OUTREACH DESK
              </span>
              <h3 className="font-sans text-2xl font-extrabold text-charcoal dark:text-white tracking-tight">
                WhatsApp Dispatch Queue ({contacts.length} Recipients)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-200 dark:hover:bg-white/10 text-charcoal-muted hover:text-charcoal dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Main Action Launcher Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 to-sage-50 dark:from-emerald-950/40 dark:to-sage-950/30 border border-emerald-200/80 dark:border-emerald-800/40 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                  1-Click Sequence Dispatcher (Popup-Safe)
                </span>
                {isAllComplete ? (
                  <h4 className="font-sans text-lg font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>All {contacts.length} WhatsApp chats launched!</span>
                  </h4>
                ) : currentNextContact ? (
                  <div>
                    <h4 className="font-sans text-lg font-bold text-charcoal dark:text-white tracking-tight">
                      Next: {currentNextContact.fullName || currentNextContact.name}
                    </h4>
                    <p className="text-xs text-charcoal-muted dark:text-white/60">
                      Recipient {openedCount + 1} of {contacts.length} &bull; {currentNextContact.phone}
                    </p>
                  </div>
                ) : null}
              </div>

              {!isAllComplete ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDispatchNext}
                    className="px-6 py-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 glass-rise-btn"
                  >
                    <span>Send to {(currentNextContact?.fullName?.split(' ')[0]) ?? 'Next'} ({openedCount + 1} of {contacts.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg bg-sage-800 dark:bg-sage-700 hover:bg-sage-900 text-cream text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  Done / Close
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-between text-xs">
              <span className="text-charcoal-muted dark:text-white/60 font-medium">
                Progress: <strong className="text-charcoal dark:text-white">{openedCount}</strong> / {contacts.length} opened
              </span>
              <div className="w-32 sm:w-48 bg-white/80 dark:bg-white/10 h-2.5 rounded-full overflow-hidden border border-emerald-200 dark:border-emerald-800/50">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal dark:text-white">
                Message Template
              </label>
              <span className="text-[11px] text-charcoal-muted dark:text-white/60 font-medium">
                Variables: <code className="text-sage-800 dark:text-sage-300 font-bold">{'{Name}'}</code>, <code className="text-sage-800 dark:text-sage-300 font-bold">{'{Business}'}</code>, <code className="text-sage-800 dark:text-sage-300 font-bold">{'{Exhibition}'}</code>
              </span>
            </div>
            <textarea
              rows={3}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white/80 dark:bg-white/5 font-sans leading-relaxed shadow-2xs"
            />
          </div>

          {/* Contact Queue List */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal dark:text-white mb-3">
              <span>Recipients List & Live Preview</span>
              {pendingContacts.length > 1 && (
                <button
                  onClick={handleOpenAllStaggered}
                  className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1"
                  title="If browser allows popups, launches all remaining tabs"
                >
                  <Play className="w-3 h-3" />
                  <span>Launch All Remaining ({pendingContacts.length})</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {contacts.map((contact, index) => {
                const isSent = !!openedContacts[contact.id];
                const { url, cleanPhone, interpolatedMessage } = buildWhatsAppUrl(template, {
                  fullName: contact.fullName,
                  name: contact.name,
                  businessName: contact.businessName,
                  exhibitionName: contact.exhibitionName,
                  phone: contact.phone,
                });

                return (
                  <div
                    key={contact.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                      isSent
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 opacity-90'
                        : 'bg-white dark:bg-white/5 border-sage-200/80 dark:border-white/10 hover:border-sage-400'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                        isSent 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-cream-200 dark:bg-white/10 text-charcoal dark:text-white'
                      }`}>
                        {isSent ? '✓' : index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-charcoal dark:text-white truncate">
                            {contact.fullName || contact.name}
                          </span>
                          <span className="text-[10px] text-charcoal-muted dark:text-white/50">
                            ({cleanPhone || contact.phone})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-sage-50 dark:bg-white/5 border border-sage-200 dark:border-white/10 text-sage-800 dark:text-sage-300 font-medium truncate max-w-[140px]">
                            {contact.exhibitionName || 'Exhibition'}
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal-muted dark:text-white/60 italic mt-1 line-clamp-1">
                          &ldquo;{interpolatedMessage}&rdquo;
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenContact(contact)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-colors ${
                        isSent
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Re-open</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Open Chat</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between text-xs text-charcoal-muted dark:text-white/60">
            <span>
              Tip: Clicking opens the direct <code className="text-emerald-700 dark:text-emerald-400 font-bold">wa.me</code> link with the message pre-filled in your WhatsApp client.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-sage-300 dark:border-white/20 text-charcoal dark:text-white hover:bg-cream-100 dark:hover:bg-white/10 font-semibold uppercase tracking-wider"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </ModalPortal>
  );
};
