'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2 } from 'lucide-react';
import { CRMContact } from '../../types';

interface BulkEmailModalProps {
  contacts: CRMContact[];
  onClose: () => void;
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({
  contacts,
  onClose
}) => {
  const [subject, setSubject] = useState('Invitation: Exclusive Stall Booking for Upcoming Exhibition');
  const [message, setMessage] = useState(
    `Dear Exhibitor,\n\nWe are curating our next premier showcase and would love to feature your brand.\n\nPlease find attached the layout schematic and pricing breakdown. Reply to this email to lock your preferred stall.\n\nWarm regards,\nExhibition Agency Curation Team`
  );
  const [isSent, setIsSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-4xl shadow-soft-2xl border border-sage-200 w-full max-w-2xl p-6 sm:p-8">
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-sage-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-sage-800 block">
                Broadcast Email
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal">
                Compose Blast to {contacts.length} Contact(s)
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

        {!isSent ? (
          <form onSubmit={handleSend} className="space-y-4">
            
            {/* Recipients summary */}
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-sage-200 text-xs">
              <span className="text-charcoal-muted block mb-1">Recipients:</span>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {contacts.map((c) => (
                  <span key={c.id} className="bg-white px-2.5 py-0.5 rounded-md border border-sage-200 text-[11px] font-medium text-charcoal">
                    {c.businessName} &lt;{c.email}&gt;
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-1.5">
                Email Message Body *
              </label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-sage-200 text-xs text-charcoal outline-none focus:border-sage-500 font-sans leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-full border border-sage-300 text-charcoal hover:bg-cream-100 text-xs font-semibold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-8 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Broadcast</span>
              </button>
            </div>

          </form>
        ) : (
          <div className="py-12 text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Email Blast Dispatched
            </h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-light">
              Sent broadcast message to {contacts.length} vendor contacts successfully.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
