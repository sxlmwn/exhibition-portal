/**
 * WhatsApp Helper Utilities for Exhibition Portal
 */

export const formatWhatsAppNumber = (phoneStr: string): string => {
  if (!phoneStr) return '';
  let digits = phoneStr.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  // Pakistan local mobile numbers 03XXXXXXXXX (11 digits) -> 923XXXXXXXXX
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '92' + digits.slice(1);
  }
  return digits;
};

export interface WhatsAppPayload {
  url: string;
  cleanPhone: string;
  interpolatedMessage: string;
}

export const buildWhatsAppUrl = (
  template: string,
  contact: {
    fullName?: string;
    name?: string;
    businessName?: string;
    exhibitionName?: string;
    phone: string;
  }
): WhatsAppPayload => {
  const name = contact.fullName || contact.name || contact.businessName || 'Exhibitor';
  const business = contact.businessName || contact.fullName || 'Brand';
  const exhibition = contact.exhibitionName || 'the upcoming exhibition';

  // Case-insensitive replacements for {Name}, {Business}, {Exhibition}
  let msg = (template || '')
    .replace(/\{name\}/gi, name)
    .replace(/\{business\}/gi, business)
    .replace(/\{exhibition\}/gi, exhibition);

  const cleanPhone = formatWhatsAppNumber(contact.phone);
  const encodedText = encodeURIComponent(msg);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  // Log in browser console for verification during testing
  if (typeof window !== 'undefined') {
    console.log(`[WhatsApp Dispatch] Generated URL for ${name} (${cleanPhone}):`, url);
  }

  return { url, cleanPhone, interpolatedMessage: msg };
};
