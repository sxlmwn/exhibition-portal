'use client';

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  AlertTriangle,
  Info,
  KeyRound
} from 'lucide-react';
import { CRMContact } from '../../types';
import { ModalPortal } from '../common/ModalPortal';

interface BulkEmailModalProps {
  contacts: CRMContact[];
  onClose: () => void;
}

interface DispatchResult {
  success: boolean;
  total: number;
  sentCount: number;
  failedCount: number;
  failedEmails?: string[];
  message: string;
  error?: string;
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({
  contacts,
  onClose
}) => {
  const [subject, setSubject] = useState('Invitation: Exclusive Stall Booking for Upcoming Exhibition');
  const [senderName, setSenderName] = useState('Exhibition Agency Curation');
  const [message, setMessage] = useState(
    `Dear Exhibitor,\n\nWe are currently curating our next premier showcase edition and would love to feature your brand.\n\nPlease find attached the layout schematic and pricing breakdown. Reply directly to this email to lock your preferred stall slot or request custom power & lighting setups.\n\nWarm regards,\nExhibition Agency Curation Team`
  );

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<DispatchResult | null>(null);

  // Filter contacts with valid emails vs WhatsApp only
  const validEmailContacts = contacts.filter(
    (c) => c.email && typeof c.email === 'string' && c.email.includes('@') && c.email.includes('.')
  );
  const noEmailCount = contacts.length - validEmailContacts.length;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validEmailContacts.length === 0) return;

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: validEmailContacts.map((c) => c.email),
          subject,
          body: message,
          senderName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          total: validEmailContacts.length,
          sentCount: 0,
          failedCount: validEmailContacts.length,
          message: data.message || 'Failed to dispatch emails via Gmail SMTP.',
          error: data.error,
        });
      } else {
        setResult({
          success: data.success,
          total: data.total,
          sentCount: data.sentCount,
          failedCount: data.failedCount,
          failedEmails: data.failedEmails,
          message: data.message,
        });
      }
    } catch (err: any) {
      console.error('Error calling /api/send-bulk-email:', err);
      setResult({
        success: false,
        total: validEmailContacts.length,
        sentCount: 0,
        failedCount: validEmailContacts.length,
        message: err.message || 'Network error while attempting to send emails.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ModalPortal isOpen={contacts.length > 0} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="modal-glass-container dark:bg-[#15181E] dark:text-[#F3F4F6] rounded-3xl w-full p-6 sm:p-8 shadow-2xl border border-sage-200/80 dark:border-white/10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-sage-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/60 text-sage-800 dark:text-sage-300 flex items-center justify-center shrink-0 shadow-xs border border-sage-200/50">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="eyebrow-label">
                GMAIL SMTP BROADCAST
              </span>
              <h3 className="font-sans text-2xl font-bold text-charcoal dark:text-white tracking-tight">
                Bulk Email Blast ({validEmailContacts.length} Recipients)
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

        {/* Result view */}
        {result ? (
          <div className="space-y-6 animate-fadeIn py-4">
            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center ${
              result.success && result.failedCount === 0
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : result.sentCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
            }`}>
              {result.success && result.failedCount === 0 ? (
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : result.sentCount > 0 ? (
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center mb-3">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}

              <h4 className="font-sans text-xl font-bold mb-1">
                {result.success && result.failedCount === 0
                  ? 'All Emails Dispatched Successfully!'
                  : result.sentCount > 0
                  ? 'Partial Delivery Completed'
                  : 'Email Dispatch Failed'}
              </h4>
              <p className="text-xs font-medium max-w-md">
                {result.message}
              </p>

              {result.error === 'GMAIL_NOT_CONFIGURED' && (
                <div className="mt-4 p-4 rounded-xl bg-white dark:bg-black/30 border border-rose-200 dark:border-white/10 text-left text-xs text-charcoal dark:text-white space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                    <KeyRound className="w-4 h-4" />
                    <span>Setup Required: Gmail App Password</span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted dark:text-white/70 leading-relaxed font-normal">
                    To send real bulk emails, please add your agency Gmail credentials to <code className="bg-sage-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono">.env.local</code> (and Vercel dashboard):
                  </p>
                  <pre className="p-2 rounded bg-black/5 dark:bg-white/5 font-mono text-[10px] text-charcoal dark:text-white/90">
GMAIL_USER=your-agency@gmail.com&#10;GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
                  </pre>
                </div>
              )}
            </div>

            {/* Failed emails list if any */}
            {result.failedEmails && result.failedEmails.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-sage-200 dark:border-white/10 space-y-2 text-xs">
                <span className="font-bold text-rose-700 dark:text-rose-400 block">
                  Failed Email Addresses ({result.failedEmails.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {result.failedEmails.map((email, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-800 dark:text-rose-300 font-mono text-[10px]">
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="btn-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Compose Another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            
            {/* Warning for contacts without email */}
            {noEmailCount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="font-medium">
                  <strong>{noEmailCount} contact(s)</strong> have no email address on file and will be skipped (WhatsApp only). {validEmailContacts.length} valid email(s) will receive this blast.
                </span>
              </div>
            )}

            {/* Recipients Summary Preview */}
            <div className="p-3.5 rounded-xl bg-cream-50 dark:bg-white/[0.04] border border-sage-200 dark:border-white/10 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-charcoal dark:text-white uppercase text-[10px] tracking-wider">
                  Target Recipient List ({validEmailContacts.length}):
                </span>
                <span className="text-[10px] text-sage-800 dark:text-sage-300 font-semibold">
                  Individual Blind Delivery (BCC Privacy)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {validEmailContacts.map((c) => (
                  <span 
                    key={c.id} 
                    className="bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-sage-200/80 dark:border-white/10 text-[11px] font-medium text-charcoal dark:text-white"
                  >
                    {c.businessName || c.name} &lt;{c.email}&gt;
                  </span>
                ))}
              </div>
            </div>

            {/* Sender Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Sender Name / From Label
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Exhibition Agency Curation Team"
                disabled={isSending}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white dark:bg-white/5 outline-none focus:border-sage-500 font-medium disabled:opacity-50"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Type compelling subject line..."
                disabled={isSending}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white dark:bg-white/5 outline-none focus:border-sage-500 font-medium disabled:opacity-50"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal dark:text-white mb-1.5">
                Email Message Body *
              </label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                placeholder="Compose message body to send to exhibitors..."
                className="w-full px-4 py-3 rounded-xl border border-sage-200 dark:border-white/10 text-xs text-charcoal dark:text-white bg-white dark:bg-white/5 outline-none focus:border-sage-500 font-sans leading-relaxed disabled:opacity-50"
              />
            </div>

            {/* Footer Buttons & Loading Status */}
            <div className="pt-4 border-t border-sage-100 dark:border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-charcoal-muted dark:text-white/60 font-light flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Sent individually via Gmail SMTP</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="btn-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || validEmailContacts.length === 0}
                  className="btn-primary px-7 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send {validEmailContacts.length} Email(s)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </ModalPortal>
  );
};
