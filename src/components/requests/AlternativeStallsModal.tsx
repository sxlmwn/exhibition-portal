'use client';

import React, { useState } from 'react';
import { 
  X, 
  Store, 
  MessageSquare, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { VendorRequest, StallSlot, Exhibition } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { ModalPortal } from '../common/ModalPortal';
import { supabase } from '../../lib/supabase';

interface AlternativeStallsModalProps {
  request: VendorRequest;
  exhibition?: Exhibition;
  onClose: () => void;
}

export const AlternativeStallsModal: React.FC<AlternativeStallsModalProps> = ({
  request,
  exhibition,
  onClose
}) => {
  const { stalls } = useAdmin();
  
  // Available stalls for this specific exhibition
  const availableStalls = stalls.filter(
    (s) => s.exhibitionId === request.exhibitionId && s.status === 'available'
  );

  const [selectedStallIds, setSelectedStallIds] = useState<string[]>(
    availableStalls.slice(0, 2).map((s) => s.id)
  );

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const toggleStall = (id: string) => {
    setSelectedStallIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedStallsData = availableStalls.filter((s) => selectedStallIds.includes(s.id));

  // Build Alternative Stalls summary text
  const stallSummaryLines = selectedStallsData.map(
    (s) => `• Stall ${s.code} (${s.tierName || s.tier} • ${s.dimensions} • Rs. ${s.price.toLocaleString()})`
  ).join('\n');

  const requestedCodeDisplay = request.preferredStallCode || (request.requestedStallId ? `Slot #${request.requestedStallId}` : 'your requested booth');
  const exhibitionTitle = exhibition?.title || request.exhibitionName || 'Upcoming Exhibition';

  const defaultMessage = `Hello ${request.vendorName || 'Exhibitor'}, 👋\n\nThank you for applying to showcase "${request.brandName}" at ${exhibitionTitle}.\n\nStall ${requestedCodeDisplay} was already locked by another exhibitor. We have shortlisted these premium alternative stalls for you with priority placement:\n\n${stallSummaryLines || '• Contact curator for live floor plan options'}\n\nPlease reply with your preferred stall number to reserve your spot!\n\nBest regards,\nExhibition Agency Curation Desk`;

  const [customMessage, setCustomMessage] = useState(defaultMessage);

  // Send via WhatsApp
  const handleSendWhatsApp = () => {
    const phoneClean = (request.phone || '').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(customMessage)}`;
    window.open(waUrl, '_blank');
  };

  // Send via Email API
  const handleSendEmail = async () => {
    if (!request.email) {
      alert('This vendor does not have an email address on file.');
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipients: [request.email],
          subject: `Alternative Stall Options — ${exhibitionTitle}`,
          body: customMessage,
          senderName: 'Exhibition Agency Curation',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setEmailStatus('Email proposal dispatched successfully!');
      } else {
        setEmailStatus(`Notice: ${json.message || 'Could not send email'}`);
      }
    } catch (err: any) {
      setEmailStatus(`Failed to send email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <ModalPortal isOpen={true} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="modal-glass-container dark:bg-[#15181E] dark:text-[#F3F4F6] rounded-3xl w-full p-6 sm:p-8 shadow-2xl border border-sage-200/80 dark:border-white/10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-sage-100 dark:border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="eyebrow-label text-amber-800 dark:text-amber-300">
                ALTERNATIVE STALL PROPOSAL
              </span>
              <h3 className="font-sans text-2xl font-bold text-charcoal dark:text-white tracking-tight">
                Send Alternative Stalls to {request.brandName}
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

        {/* Unavailable Stall Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span>
              Vendor originally requested <strong>Stall {requestedCodeDisplay}</strong>, which is currently booked or unavailable. Select 1-3 available stalls below to propose as alternatives:
            </span>
          </div>
        </div>

        {/* Available Stalls Selection Grid */}
        <div className="space-y-2 mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white">
            Select Alternative Available Stalls ({availableStalls.length} Available in Venue)
          </label>
          
          {availableStalls.length === 0 ? (
            <p className="text-xs text-charcoal-muted dark:text-white/60 p-4 rounded-xl bg-cream-50 dark:bg-white/5 border">
              No available stalls remaining for this exhibition edition.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
              {availableStalls.map((stall) => {
                const isSelected = selectedStallIds.includes(stall.id);
                return (
                  <div
                    key={stall.id}
                    onClick={() => toggleStall(stall.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sage-100 dark:bg-sage-900/60 border-sage-500 text-charcoal dark:text-white shadow-2xs'
                        : 'bg-white dark:bg-white/5 border-sage-200 dark:border-white/10 hover:border-sage-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-sage-800 dark:text-sage-300 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-charcoal-muted dark:text-white/40 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-xs block">
                          Stall {stall.code}
                        </span>
                        <span className="text-[11px] text-charcoal-muted dark:text-white/60 font-light">
                          {stall.tierName || stall.tier} &bull; {stall.dimensions}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-sage-deep dark:text-sage-300">
                      Rs. {(stall.price / 1000).toFixed(0)}k
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proposal Message Preview */}
        <div className="space-y-1.5 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white">
            Message Proposal Preview & Edit
          </label>
          <textarea
            rows={5}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white outline-none focus:border-sage-500 bg-white dark:bg-white/5 font-sans leading-relaxed"
          />
        </div>

        {emailStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 font-semibold mb-4 animate-fadeIn">
            {emailStatus}
          </div>
        )}

        {/* Dispatch Actions */}
        <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            {request.email && (
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail || selectedStallIds.length === 0}
                className="px-5 py-2.5 rounded-lg bg-sage-800 dark:bg-sage-700 hover:bg-sage-900 text-cream text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Proposal Email</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={selectedStallIds.length === 0 || !request.phone}
              className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </ModalPortal>
  );
};
