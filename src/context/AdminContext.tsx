'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Exhibition, 
  StallSlot, 
  StallTier,
  VendorRequest, 
  CRMContact, 
  ContactStatus,
  ExpenseItem, 
  ExpenseCategory,
  ExpenseStatus,
  MarketingCampaign, 
  PastEventStory, 
  StaffUser, 
  AgencySettings,
  UserRole,
  RequestStatus
} from '../types';
import { 
  INITIAL_AGENCY_SETTINGS 
} from '../data/mockData';
import { supabase } from '../lib/supabase';
import { createExpenseNotification, createStallRequestNotification } from '../lib/notifications';

// Admin allocation window: number of days after deadline when staff can finalize allocations
export const ALLOCATION_WINDOW_DAYS = 3;

/**
 * Checks if an exhibition is currently in the admin allocation window.
 * The allocation window runs from the day after the deadline until deadline + ALLOCATION_WINDOW_DAYS.
 * @param exhibition - Exhibition object with optional stallRegistrationDeadline
 * @returns true if in allocation window, false otherwise
 */
export const isInAllocationWindow = (exhibition: Exhibition): boolean => {
  if (!exhibition.stallRegistrationDeadline) {
    return false; // No deadline set, not in allocation window
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(exhibition.stallRegistrationDeadline);
  deadline.setHours(0, 0, 0, 0);

  const windowEnd = new Date(deadline);
  windowEnd.setDate(windowEnd.getDate() + ALLOCATION_WINDOW_DAYS);
  windowEnd.setHours(0, 0, 0, 0);

  // Allocation window: deadline < today <= deadline + ALLOCATION_WINDOW_DAYS
  return today > deadline && today <= windowEnd;
};

/**
 * Calculates remaining days in the allocation window.
 * @param exhibition - Exhibition object with optional stallRegistrationDeadline
 * @returns number of days remaining in allocation window, or 0 if not in window
 */
export const getAllocationWindowDaysRemaining = (exhibition: Exhibition): number => {
  if (!exhibition.stallRegistrationDeadline || !isInAllocationWindow(exhibition)) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(exhibition.stallRegistrationDeadline);
  deadline.setHours(0, 0, 0, 0);

  const windowEnd = new Date(deadline);
  windowEnd.setDate(windowEnd.getDate() + ALLOCATION_WINDOW_DAYS);
  windowEnd.setHours(0, 0, 0, 0);

  const diffTime = windowEnd.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Helper mappers between Supabase Postgres columns and frontend Exhibition type
export const mapExhibitionFromDB = (row: any): Exhibition => {
  let venue = row.venue || row.location || 'Exhibition Grounds';
  let city = row.city || 'Lahore';
  if (row.location && typeof row.location === 'string') {
    const parts = row.location.split(',').map((s: string) => s.trim());
    if (parts.length >= 2) {
      city = parts[parts.length - 1];
      venue = parts.slice(0, parts.length - 1).join(', ');
    } else {
      venue = row.location;
    }
  }

  const title = row.name || row.title || 'Untitled Exhibition';
  const totalStalls = Number(row.total_stalls ?? row.total_stall_capacity ?? row.totalStallCapacity ?? 40);
  const bookedStalls = Number(row.booked_stalls_count ?? row.booked_stalls ?? row.bookedStallsCount ?? 0);
  const budget = Number(row.budget_allocated ?? row.budgetAllocated ?? 2000000);
  const budgetReceived = row.budget_received != null ? Number(row.budget_received) : undefined;
  const revenue = Number(row.stall_revenue_booked ?? row.revenue_booked ?? row.stallRevenueBooked ?? 0);
  const expenses = Number(row.total_expenses_logged ?? row.total_expenses ?? row.totalExpensesLogged ?? 0);

  return {
    id: String(row.id),
    title,
    tagline: row.tagline || (row.description ? (row.description.length > 80 ? row.description.slice(0, 80) + '...' : row.description) : 'Curated Premier Exhibition Edition'),
    city,
    venue,
    startDate: row.start_date || row.startDate || '',
    endDate: row.end_date || row.endDate || '',
    status: (row.status as any) || 'upcoming',
    category: row.category || 'Fashion & Lifestyle',
    coverImage: row.image_url || row.cover_image || row.coverImage || '/images/1.jpg',
    totalStallCapacity: totalStalls,
    bookedStallsCount: bookedStalls,
    budgetAllocated: budget,
    budgetReceived,
    stallRevenueBooked: revenue,
    totalExpensesLogged: expenses,
    description: row.description || '',
    daysLeft: row.days_left ?? row.daysLeft,
    stallRegistrationDeadline: row.stall_registration_deadline || undefined,
  };
};

export const mapExhibitionToDB = (exh: Partial<Exhibition>): any => {
  const payload: any = {};
  if (exh.id !== undefined && !String(exh.id).startsWith('exh-') && !isNaN(Number(exh.id))) {
    payload.id = Number(exh.id);
  }
  if (exh.title !== undefined) {
    payload.name = exh.title;
  }
  if (exh.venue !== undefined || exh.city !== undefined) {
    if (exh.venue && exh.city) {
      payload.location = `${exh.venue}, ${exh.city}`;
    } else {
      payload.location = exh.venue || exh.city || '';
    }
  }
  if (exh.description !== undefined) {
    payload.description = exh.description;
  }
  if (exh.startDate !== undefined) {
    payload.start_date = exh.startDate;
  }
  if (exh.endDate !== undefined) {
    payload.end_date = exh.endDate;
  }
  if (exh.stallRegistrationDeadline !== undefined) {
    payload.stall_registration_deadline = exh.stallRegistrationDeadline;
  }
  if (exh.status !== undefined) {
    payload.status = exh.status;
  }
  if (exh.totalStallCapacity !== undefined) {
    payload.total_stalls = Number(exh.totalStallCapacity);
  }
  if (exh.budgetAllocated !== undefined) {
    payload.budget_allocated = Number(exh.budgetAllocated);
  }
  if (exh.budgetReceived !== undefined) {
    payload.budget_received = Number(exh.budgetReceived);
  }
  if (exh.coverImage !== undefined) {
    payload.image_url = exh.coverImage;
  }
  return payload;
};

// Helper mappers for Vendor Requests
export const mapVendorRequestFromDB = (row: any): VendorRequest => {
  const brandName = row.business_name || row.brand_name || 'Vendor Brand';
  const vendorName = row.vendor_name || row.contact_name || row.business_name || 'Exhibitor';
  const phone = row.contact_number || row.phone || '';
  const email = row.email || (phone ? `${phone.replace(/[^0-9]/g, '')}@exhibitor.pk` : 'vendor@exhibitionportal.com');
  const stallsWanted = Number(row.stalls_wanted || row.stalls_requested || 1);
  const budgetRange = row.budget_range || 'Rs. 100,000 - 200,000';
  const productCategory = row.category || row.product_category || 'Lifestyle & Craft';
  const status: RequestStatus = row.status || 'pending';
  const exhibitionName = row.exhibitions?.name || row.exhibition_name || (row.exhibition_id ? `Exhibition #${row.exhibition_id}` : 'Exhibition Edition');
  const referenceId = row.reference_id || `REQ-${row.id}`;
  const requestedStallId = row.requested_stall_id ? String(row.requested_stall_id) : undefined;

  return {
    id: String(row.id),
    referenceId,
    vendorName,
    brandName,
    email,
    phone,
    exhibitionId: String(row.exhibition_id || ''),
    exhibitionName,
    stallsWanted,
    stallTierPreference: (row.stall_tier_preference as StallTier) || 'medium',
    preferredStallCode: row.preferred_stall_code || undefined,
    requestedStallId,
    allocatedStallCode: row.allocated_stall_code || undefined,
    productCategory,
    budgetRange,
    notes: row.notes || '',
    submittedDate: row.submitted_date || (row.created_at ? row.created_at.split('T')[0] : '2026-03-01'),
    status,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    createdAt: row.created_at || row.submitted_date || undefined,
  };
};

export const mapVendorRequestToDB = (req: Partial<VendorRequest>): any => {
  const payload: any = {};
  if (req.id !== undefined && !String(req.id).startsWith('vr-') && !String(req.id).startsWith('req-') && !isNaN(Number(req.id))) {
    payload.id = Number(req.id);
  }
  if (req.referenceId !== undefined) {
    payload.reference_id = req.referenceId;
  }
  if (req.exhibitionId !== undefined && !isNaN(Number(req.exhibitionId))) {
    payload.exhibition_id = Number(req.exhibitionId);
  }
  if (req.requestedStallId !== undefined && req.requestedStallId !== null && !isNaN(Number(req.requestedStallId))) {
    payload.requested_stall_id = Number(req.requestedStallId);
  }
  if (req.brandName !== undefined) {
    payload.business_name = req.brandName;
  }
  if (req.vendorName !== undefined) {
    payload.vendor_name = req.vendorName;
    if (!payload.business_name) {
      payload.business_name = req.vendorName;
    }
  }
  if (req.email !== undefined) {
    payload.email = req.email;
  }
  if (req.phone !== undefined) {
    payload.contact_number = req.phone;
  }
  if (req.stallsWanted !== undefined) {
    payload.stalls_wanted = Number(req.stallsWanted);
  }
  if (req.budgetRange !== undefined) {
    payload.budget_range = req.budgetRange;
  }
  if (req.productCategory !== undefined) {
    payload.category = req.productCategory;
  }
  if (req.notes !== undefined) {
    payload.notes = req.notes;
  }
  if (req.preferredStallCode !== undefined) {
    payload.preferred_stall_code = req.preferredStallCode;
  }
  if (req.stallTierPreference !== undefined) {
    payload.stall_tier_preference = req.stallTierPreference;
  }
  if (req.status !== undefined) {
    payload.status = req.status;
  }
  return payload;
};

// Helper mappers for Stall Slots
export const mapStallSlotFromDB = (row: any): StallSlot => {
  const code = (row.stall_number || row.code || `S-${row.id}`).toUpperCase();
  const rowLetter = code.includes('-') ? `Row ${code.split('-')[0]}` : 'Row A';
  
  let tier: StallTier = 'medium';
  if (row.size_category && ['small', 'medium', 'premium', 'corner'].includes(row.size_category)) {
    tier = row.size_category as StallTier;
  } else if (code.endsWith('01') || code.endsWith('06')) {
    tier = 'corner';
  } else if (code.startsWith('B')) {
    tier = 'premium';
  } else if (code.endsWith('03') || code.endsWith('05')) {
    tier = 'small';
  }

  const tierNames: Record<StallTier, string> = {
    corner: 'Corner Boulevard',
    premium: 'Premium Stall',
    medium: 'Medium Stall',
    small: 'Small Stall'
  };

  const dimensionsMap: Record<StallTier, string> = {
    corner: '12x12 ft',
    premium: '12x10 ft',
    medium: '9x9 ft',
    small: '6x6 ft'
  };

  const price = Number(row.price || 85000);
  const status = (row.status as 'available' | 'booked' | 'reserved') || 'available';

  return {
    id: String(row.id),
    code,
    exhibitionId: String(row.exhibition_id || ''),
    tier,
    tierName: tierNames[tier] || 'Medium Stall',
    dimensions: dimensionsMap[tier] || '9x9 ft',
    price,
    status,
    assignedVendorId: row.assigned_vendor_id ? String(row.assigned_vendor_id) : undefined,
    assignedVendorName: row.assigned_vendor_name || undefined,
    assignedBrandName: row.assigned_brand_name || undefined,
    assignedAt: row.assigned_at || undefined,
    row: rowLetter,
  };
};

export const mapStallSlotToDB = (slot: Partial<StallSlot>): any => {
  const payload: any = {};
  if (slot.id !== undefined && !String(slot.id).startsWith('stl-') && !isNaN(Number(slot.id))) {
    payload.id = Number(slot.id);
  }
  if (slot.exhibitionId !== undefined && !isNaN(Number(slot.exhibitionId))) {
    payload.exhibition_id = Number(slot.exhibitionId);
  }
  if (slot.code !== undefined) {
    payload.stall_number = slot.code;
  }
  if (slot.tier !== undefined) {
    payload.size_category = slot.tier;
  }
  if (slot.price !== undefined) {
    payload.price = Number(slot.price);
  }
  if (slot.status !== undefined) {
    payload.status = slot.status;
  }
  if (slot.assignedVendorId !== undefined) {
    payload.assigned_vendor_id = slot.assignedVendorId && !isNaN(Number(slot.assignedVendorId)) ? Number(slot.assignedVendorId) : null;
  }
  if (slot.assignedVendorName !== undefined) {
    payload.assigned_vendor_name = slot.assignedVendorName || null;
  }
  if (slot.assignedBrandName !== undefined) {
    payload.assigned_brand_name = slot.assignedBrandName || null;
  }
  if (slot.assignedAt !== undefined) {
    payload.assigned_at = slot.assignedAt || null;
  }
  return payload;
};

// Helper mappers for CRM Contacts
export const mapCRMContactFromDB = (row: any): CRMContact => {
  const fullName = row.full_name || row.name || 'Exhibitor Contact';
  const phone = row.phone || row.contact_number || '';
  const email = row.email || '';
  const category = row.category || 'General';
  const status: ContactStatus = (row.status as ContactStatus) || 'enquired';
  const source = row.source || 'Website Lead';
  const exhibitionId = String(row.exhibition_id || '');
  const exhibitionName = row.exhibitions?.name || row.exhibition_name || (row.exhibition_id ? `Exhibition #${row.exhibition_id}` : 'General / All Exhibitions');

  return {
    id: String(row.id),
    fullName,
    name: fullName,
    businessName: fullName,
    phone,
    email,
    category,
    status,
    source,
    exhibitionId,
    exhibitionName,
    tags: [source, status],
    exhibitionIds: exhibitionId ? [exhibitionId] : [],
    totalSpend: 0,
    lastActivityDate: row.created_at ? row.created_at.split('T')[0] : '2026-03-01',
    notes: `Source: ${source}`,
  };
};

export const mapCRMContactToDB = (c: Partial<CRMContact>): any => {
  const payload: any = {};
  if (c.id !== undefined && !String(c.id).startsWith('cnt-') && !isNaN(Number(c.id))) {
    payload.id = Number(c.id);
  }
  if (c.fullName !== undefined || c.name !== undefined || c.businessName !== undefined) {
    payload.full_name = c.fullName || c.name || c.businessName;
  }
  if (c.phone !== undefined) {
    payload.phone = c.phone;
  }
  if (c.email !== undefined) {
    payload.email = c.email;
  }
  if (c.category !== undefined) {
    payload.category = c.category;
  }
  if (c.status !== undefined) {
    payload.status = c.status;
  }
  if (c.source !== undefined) {
    payload.source = c.source;
  }
  if (c.exhibitionId !== undefined && !isNaN(Number(c.exhibitionId))) {
    payload.exhibition_id = Number(c.exhibitionId);
  }
  return payload;
};

// Helper mappers for Expense Items
export const mapExpenseItemFromDB = (row: any): ExpenseItem => {
  const id = String(row.id);
  const exhibitionId = String(row.exhibition_id || '');
  const exhibitionName = row.exhibitions?.name || row.exhibition_name || (row.exhibition_id ? `Exhibition #${row.exhibition_id}` : 'General Exhibition');
  const category = (row.category as ExpenseCategory) || 'Miscellaneous';
  const amount = Number(row.amount || 0);
  const date = row.expense_date || row.date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
  const description = row.description || '';
  const receiptUrl = row.receipt_url || undefined;
  const status: ExpenseStatus = (row.status as ExpenseStatus) || 'approved';

  return {
    id,
    exhibitionId,
    exhibitionName,
    category,
    amount,
    date,
    description,
    receiptUrl,
    enteredById: 'usr-curator',
    enteredByName: 'Curation Desk',
    enteredByRole: 'owner',
    status,
    paymentMethod: 'Bank Transfer',
  };
};

export const mapExpenseItemToDB = (exp: Partial<ExpenseItem>): any => {
  const payload: any = {};
  if (exp.id !== undefined && !String(exp.id).startsWith('exp-') && !isNaN(Number(exp.id))) {
    payload.id = Number(exp.id);
  }
  if (exp.exhibitionId !== undefined && !isNaN(Number(exp.exhibitionId))) {
    payload.exhibition_id = Number(exp.exhibitionId);
  }
  if (exp.category !== undefined) {
    payload.category = exp.category;
  }
  if (exp.amount !== undefined) {
    payload.amount = Number(exp.amount);
  }
  if (exp.date !== undefined) {
    payload.expense_date = exp.date;
  }
  if (exp.description !== undefined) {
    payload.description = exp.description;
  }
  if (exp.receiptUrl !== undefined) {
    payload.receipt_url = exp.receiptUrl;
  }
  return payload;
};

// Helper mappers for Marketing Campaigns
export const mapCampaignFromDB = (row: any): MarketingCampaign => {
  const id = String(row.id);
  const exhibitionId = String(row.exhibition_id || '');
  const exhibitionName = row.exhibitions?.name || (row.exhibition_id ? `Exhibition #${row.exhibition_id}` : 'General Exhibition');
  const platform = row.platform || 'Instagram';
  const amountSpent = Number(row.amount_spent || 0);
  const startDate = row.start_date || new Date().toISOString().split('T')[0];
  const endDate = row.end_date || new Date().toISOString().split('T')[0];
  const leadsGenerated = Number(row.leads_generated || 0);

  // Compute duration in days & human duration label
  let runDuration = 'Ongoing';
  if (row.start_date && row.end_date) {
    const diffMs = new Date(row.end_date).getTime() - new Date(row.start_date).getTime();
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    runDuration = `${days} Days (${row.start_date} – ${row.end_date})`;
  }

  // Derive status based on current date vs start/end date
  const nowStr = new Date().toISOString().split('T')[0];
  let status: 'active' | 'completed' | 'scheduled' = 'active';
  if (endDate < nowStr) {
    status = 'completed';
  } else if (startDate > nowStr) {
    status = 'scheduled';
  }

  // Derive title, reach impressions & notes
  const title = row.title || `${platform} Outreach — ${exhibitionName}`;
  const reachImpressions = row.reach_impressions || `${(Math.max(1, leadsGenerated) * 350).toLocaleString()} impressions`;
  const notes = row.notes || `${platform} ad campaign targeting visitors and exhibitors for ${exhibitionName}.`;

  return {
    id,
    title,
    platform: platform as any,
    amountSpent,
    runDuration,
    startDate,
    endDate,
    linkedExhibitionId: exhibitionId,
    linkedExhibitionName: exhibitionName,
    leadsGenerated,
    reachImpressions,
    notes,
    status,
  };
};

export const mapCampaignToDB = (cmp: Partial<MarketingCampaign>): any => {
  const payload: any = {};
  if (cmp.id !== undefined && !String(cmp.id).startsWith('cmp-') && !isNaN(Number(cmp.id))) {
    payload.id = Number(cmp.id);
  }
  if (cmp.linkedExhibitionId !== undefined && !isNaN(Number(cmp.linkedExhibitionId))) {
    payload.exhibition_id = Number(cmp.linkedExhibitionId);
  }
  if (cmp.platform !== undefined) {
    payload.platform = cmp.platform;
  }
  if (cmp.amountSpent !== undefined) {
    payload.amount_spent = Number(cmp.amountSpent);
  }
  if (cmp.startDate !== undefined) {
    payload.start_date = cmp.startDate;
  }
  if (cmp.endDate !== undefined) {
    payload.end_date = cmp.endDate;
  }
  if (cmp.leadsGenerated !== undefined) {
    payload.leads_generated = Number(cmp.leadsGenerated);
  }
  return payload;
};

// Helper mappers for Past Event Stories
export const mapPastEventFromDB = (row: any): PastEventStory => {
  const id = String(row.id);
  const title = row.title || 'Untitled Past Exhibition';
  const location = row.location || 'Lahore';
  let city = location;
  if (location.includes(',')) {
    const parts = location.split(',').map((s: string) => s.trim());
    city = parts[parts.length - 1] || location;
  }

  // Parse photo_urls safely (supports JSON array, raw array, or comma-separated string)
  let photos: string[] = [];
  if (Array.isArray(row.photo_urls)) {
    photos = row.photo_urls;
  } else if (typeof row.photo_urls === 'string') {
    try {
      const parsed = JSON.parse(row.photo_urls);
      if (Array.isArray(parsed)) {
        photos = parsed;
      } else if (parsed) {
        photos = [String(parsed)];
      }
    } catch {
      photos = row.photo_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  if (photos.length === 0) {
    photos = ['/images/1.jpg', '/images/2.jpg'];
  }

  const coverImage = photos[0] || '/images/1.jpg';
  const footfallNumber = Number(row.footfall || 12000);
  const vendorCount = Number(row.vendor_count || 45);
  const eventDate = row.event_date || '2025-03-01';

  // Format human-readable date range
  let dateRange = eventDate;
  try {
    const d = new Date(eventDate);
    if (!isNaN(d.getTime())) {
      dateRange = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch {
    dateRange = eventDate;
  }

  const yearMatch = title.match(/\b(20\d\d)\b/) || eventDate.match(/\b(20\d\d)\b/);
  const editionYear = yearMatch ? yearMatch[1] : '2025';
  const edition = row.edition || `${editionYear} Edition`;
  const totalRevenueGMV = row.total_revenue_gmv || `Rs. ${Math.max(15, Math.round(vendorCount * 0.45))}M+`;
  const satisfactionRate = row.satisfaction_rate || '98%';
  const narrativeExcerpt = row.narrative || row.narrativeExcerpt || 'A celebrated showcase featuring leading artisans, designers, and craft houses.';
  const tags = row.tags || ['Artisan Craft', 'Curated Runway', city];
  const isPublished = row.is_published !== undefined ? Boolean(row.is_published) : false;
  const quoteText = row.quote_text || row.quoteText || '';
  const quoteAuthor = row.quote_author || row.quoteAuthor || '';
  const quoteBrand = row.quote_brand || row.quoteBrand || '';

  return {
    id,
    title,
    edition,
    city,
    dateRange,
    footfallNumber,
    vendorCount,
    totalRevenueGMV,
    satisfactionRate,
    narrativeExcerpt,
    coverImage,
    photos,
    tags,
    isPublished,
    quoteText,
    quoteAuthor,
    quoteBrand,
  };
};

export const mapPastEventToDB = (story: Partial<PastEventStory>): any => {
  const payload: any = {};
  if (story.id !== undefined && !String(story.id).startsWith('pe-') && !String(story.id).startsWith('pst-') && !isNaN(Number(story.id))) {
    payload.id = Number(story.id);
  }
  if (story.title !== undefined) {
    payload.title = story.title;
  }
  if (story.city !== undefined) {
    payload.location = story.city;
  }
  if (story.footfallNumber !== undefined) {
    payload.footfall = Number(story.footfallNumber);
  }
  if (story.vendorCount !== undefined) {
    payload.vendor_count = Number(story.vendorCount);
  }
  if (story.narrativeExcerpt !== undefined) {
    payload.narrative = story.narrativeExcerpt;
  }

  // Handle dateRange -> event_date (YYYY-MM-DD)
  if (story.dateRange !== undefined) {
    const dateMatch = story.dateRange.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (dateMatch) {
      payload.event_date = dateMatch[0];
    } else {
      const parsedDate = new Date(story.dateRange);
      if (!isNaN(parsedDate.getTime())) {
        payload.event_date = parsedDate.toISOString().split('T')[0];
      } else {
        payload.event_date = '2025-10-15';
      }
    }
  }

  // Handle photos / coverImage -> photo_urls JSON string
  if (story.photos !== undefined && story.photos.length > 0) {
    payload.photo_urls = JSON.stringify(story.photos);
  } else if (story.coverImage !== undefined) {
    payload.photo_urls = JSON.stringify([story.coverImage]);
  }

  if (story.isPublished !== undefined) {
    payload.is_published = Boolean(story.isPublished);
  }

  if (story.quoteText !== undefined) {
    payload.quote_text = story.quoteText;
  }
  if (story.quoteAuthor !== undefined) {
    payload.quote_author = story.quoteAuthor;
  }
  if (story.quoteBrand !== undefined) {
    payload.quote_brand = story.quoteBrand;
  }

  return payload;
};

// Helper mappers for Staff Users
export const mapStaffUserFromDB = (row: any): StaffUser => {
  const isOwner = row.role === 'owner';
  return {
    id: String(row.id),
    name: row.full_name || row.name || row.email,
    email: row.email,
    role: (row.role as UserRole) || 'staff',
    avatar: row.avatar || (isOwner
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'),
    phone: row.phone || '+92 300 123 4567',
    status: (row.status as any) || 'active',
    joinedDate: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Verified Member',
    lastActive: 'Active',
    permissions: {
      canManageExhibitions: isOwner,
      canApproveRequests: isOwner,
      canAllocateStalls: true,
      canApproveExpenses: isOwner,
      canDeleteRecords: isOwner,
      canSendBulkMessages: true,
    }
  };
};

export const mapStaffUserToDB = (user: Partial<StaffUser>): any => {
  const payload: any = {};
  if (user.id !== undefined && !String(user.id).startsWith('usr-') && !isNaN(Number(user.id))) {
    payload.id = Number(user.id);
  }
  if (user.name !== undefined) {
    payload.full_name = user.name;
  }
  if (user.email !== undefined) {
    payload.email = user.email;
  }
  if (user.role !== undefined) {
    payload.role = user.role;
  }
  if (user.phone !== undefined) {
    payload.phone = user.phone;
  }
  return payload;
};

interface AdminContextType {
  // Current user & role
  currentUser: StaffUser;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  staffUsers: StaffUser[];
  fetchStaffUsers: () => Promise<void>;
  inviteStaffUser: (user: Omit<StaffUser, 'id' | 'joinedDate' | 'lastActive'>) => Promise<void> | void;
  updateStaffRole: (userId: string, newRole: UserRole) => Promise<void> | void;
  deleteStaffUser: (userId: string) => Promise<void> | void;

  // Exhibitions
  exhibitions: Exhibition[];
  addExhibition: (exhibition: Omit<Exhibition, 'id' | 'bookedStallsCount' | 'stallRevenueBooked' | 'totalExpensesLogged'>) => void;
  updateExhibition: (id: string, updates: Partial<Exhibition>) => void;
  deleteExhibition: (id: string) => void;

  // Stalls
  stalls: StallSlot[];
  allocateStall: (stallId: string, vendorRequestId: string, vendorName: string, brandName: string) => void;
  releaseStall: (stallId: string) => void;

  // Vendor Requests
  vendorRequests: VendorRequest[];
  updateRequestStatus: (requestId: string, status: RequestStatus, allocatedStallCode?: string) => void;
  addVendorRequest: (request: Omit<VendorRequest, 'id' | 'submittedDate' | 'status'>) => void;
  deleteVendorRequest: (id: string) => void;

  // CRM Contacts
  contacts: CRMContact[];
  addContact: (contact: Omit<CRMContact, 'id' | 'lastActivityDate'>) => void;
  updateContact: (id: string, updates: Partial<CRMContact>) => void;
  deleteContact: (id: string) => void;

  // Expenses
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'status' | 'enteredById' | 'enteredByName' | 'enteredByRole'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  updateExpenseStatus: (expenseId: string, status: ExpenseStatus) => void;
  deleteExpense: (expenseId: string) => void;

  // Marketing Campaigns
  campaigns: MarketingCampaign[];
  fetchCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => Promise<void> | void;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => Promise<void> | void;
  deleteCampaign: (id: string) => Promise<void> | void;

  // Past Events
  pastEvents: PastEventStory[];
  fetchPastEvents: () => Promise<void>;
  addPastEvent: (event: Omit<PastEventStory, 'id'>) => Promise<void> | void;
  updatePastEvent: (id: string, updates: Partial<PastEventStory>) => Promise<void> | void;
  deletePastEvent: (id: string) => Promise<void> | void;

  // Agency Settings
  settings: AgencySettings;
  updateSettings: (updates: Partial<AgencySettings>) => void;

  // Theme Management
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [stalls, setStalls] = useState<StallSlot[]>([]);
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [pastEvents, setPastEvents] = useState<PastEventStory[]>([]);
  const [settings, setSettings] = useState<AgencySettings>(INITIAL_AGENCY_SETTINGS);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // Supabase Fetchers
  const fetchStaffUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setStaffUsers(data.map(mapStaffUserFromDB));
      } else if (error) {
        console.error('Failed to load staff_users from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching staff_users from Supabase:', err);
    }
  };

  const fetchExhibitions = async () => {
    try {
      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        setExhibitions(data.map(mapExhibitionFromDB));
      } else if (error) {
        console.error('Failed to load exhibitions from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching exhibitions from Supabase:', err);
    }
  };

  const fetchVendorRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_requests')
        .select('*, exhibitions(id, name, location)')
        .order('id', { ascending: false });

      if (!error && data) {
        setVendorRequests(data.map(mapVendorRequestFromDB));
      } else if (error) {
        console.error('Failed to load vendor_requests from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching vendor_requests from Supabase:', err);
    }
  };

  const fetchStalls = async () => {
    try {
      console.log('[AdminContext] fetchStalls called - fetching ALL stalls (no exhibition filter)');
      const { data, error } = await supabase
        .from('stall_slots')
        .select('*')
        .order('id', { ascending: true });

      console.log('[AdminContext] fetchStalls result - error:', error, 'data length:', data?.length);
      if (data && data.length > 0) {
        console.log('[AdminContext] Sample stall:', data[0]);
      }

      if (!error && data) {
        setStalls(data.map(mapStallSlotFromDB));
      } else if (error) {
        console.error('Failed to load stall_slots from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching stall_slots from Supabase:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*, exhibitions(id, name, location)')
        .order('id', { ascending: false });

      let loadedContacts: CRMContact[] = [];
      if (!error && data) {
        loadedContacts = data.map(mapCRMContactFromDB);
      } else if (error) {
        console.error('Failed to load crm_contacts from Supabase:', error.message);
      }

      // Also query referrals table so referral partner leads appear seamlessly in CRM
      try {
        const { data: refData, error: refError } = await supabase
          .from('referrals')
          .select('*, exhibitions(id, name, location)')
          .order('id', { ascending: false });

        if (!refError && refData && refData.length > 0) {
          const mappedReferrals: CRMContact[] = refData.map((row: any) => ({
            id: `ref-${row.id}`,
            fullName: row.referrer_name || row.referred_business_name || 'Referral Partner',
            name: row.referrer_name || 'Referral Partner',
            businessName: `${row.referrer_name} ➔ ${row.referred_business_name}`,
            phone: row.referrer_contact || row.referred_contact || '',
            email: '',
            category: 'Referral Partner',
            status: 'referral' as ContactStatus,
            source: 'referral',
            exhibitionId: String(row.exhibition_id || ''),
            exhibitionName: row.exhibitions?.name || (row.exhibition_id ? `Exhibition #${row.exhibition_id}` : 'General Referral Program'),
            tags: ['Referral', '10% Discount Eligible', `Referred: ${row.referred_business_name}`, `Status: ${row.status || 'pending'}`],
            exhibitionIds: row.exhibition_id ? [String(row.exhibition_id)] : [],
            totalSpend: 0,
            lastActivityDate: row.created_at ? row.created_at.split('T')[0] : '2026-03-01',
            notes: `[Referral Program — 10% Mutual Credit]\n• Referring Brand: ${row.referrer_name} (${row.referrer_contact})\n• Referred Brand: ${row.referred_business_name}\n• Referred Contact: ${row.referred_contact}\n• Linked Exhibition: ${row.exhibitions?.name || 'General'}\n• Status: ${row.status || 'pending'}`
          }));

          loadedContacts = [...mappedReferrals, ...loadedContacts];
        }
      } catch (refErr) {
        console.warn('Notice loading referrals in CRM:', refErr);
      }

      if (loadedContacts.length > 0) {
        setContacts(loadedContacts);
      }
    } catch (err) {
      console.error('Error fetching crm_contacts from Supabase:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_items')
        .select('*, exhibitions(id, name, location, start_date, end_date, budget_allocated, budget_received)')
        .order('expense_date', { ascending: false });

      if (!error && data) {
        setExpenses(data.map(mapExpenseItemFromDB));
      } else if (error) {
        console.error('Failed to load expense_items from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching expense_items from Supabase:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*, exhibitions(id, name, location)')
        .order('id', { ascending: false });

      if (!error && data) {
        setCampaigns(data.map(mapCampaignFromDB));
      } else if (error) {
        console.error('Failed to load marketing_campaigns from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching marketing_campaigns from Supabase:', err);
    }
  };

  const fetchPastEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('past_event_stories')
        .select('*')
        .order('event_date', { ascending: false });

      if (!error && data) {
        setPastEvents(data.map(mapPastEventFromDB));
      } else if (error) {
        console.error('Failed to load past_event_stories from Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error fetching past_event_stories from Supabase:', err);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('exhibition_admin_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Initial fetch from Supabase
    fetchStaffUsers();
    fetchExhibitions();
    fetchVendorRequests();
    fetchStalls();
    fetchContacts();
    fetchExpenses();
    fetchCampaigns();
    fetchPastEvents();

    // Check initial auth session and sync user role from staff_users
    const syncAuthUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: staffData } = await supabase
            .from('staff_users')
            .select('role')
            .eq('auth_id', session.user.id)
            .single();

          if (staffData?.role) {
            setCurrentRole(staffData.role as UserRole);
          }
        }
      } catch (err) {
        console.error('Error syncing auth session in AdminContext:', err);
      }
    };
    syncAuthUser();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: staffData } = await supabase
          .from('staff_users')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();

        if (staffData?.role) {
          setCurrentRole(staffData.role as UserRole);
        }
        fetchStaffUsers();
        fetchExhibitions();
        fetchVendorRequests();
        fetchStalls();
        fetchContacts();
        fetchExpenses();
        fetchCampaigns();
        fetchPastEvents();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('exhibition_admin_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const defaultFallbackUser: StaffUser = {
    id: 'usr-admin',
    name: 'Sal (Owner)',
    email: 'admin@exhibitionportal.com',
    role: currentRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+92 300 123 4567',
    status: 'active',
    joinedDate: 'Verified',
    lastActive: 'Just now',
    permissions: {
      canManageExhibitions: currentRole === 'owner',
      canApproveRequests: currentRole === 'owner',
      canAllocateStalls: true,
      canApproveExpenses: currentRole === 'owner',
      canDeleteRecords: currentRole === 'owner',
      canSendBulkMessages: true,
    }
  };

  const currentUser = staffUsers.find(u => u.role === currentRole) || staffUsers[0] || defaultFallbackUser;

  // Staff Management
  const inviteStaffUser = async (user: Omit<StaffUser, 'id' | 'joinedDate' | 'lastActive'>) => {
    try {
      const response = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const res = await response.json();
      if (!response.ok || !res.success) {
        alert(res.error || 'Failed to invite staff member');
        return;
      }
      if (res.user) {
        setStaffUsers(prev => [...prev, mapStaffUserFromDB(res.user)]);
      }
    } catch (err: any) {
      console.error('Error inviting staff user:', err);
      alert(err.message || 'Failed to invite staff member');
    }
  };

  const updateStaffRole = async (userId: string, newRole: UserRole) => {
    if (currentRole !== 'owner') {
      alert('Only owners can modify staff roles.');
      return;
    }

    setStaffUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      role: newRole,
      permissions: {
        ...u.permissions,
        canManageExhibitions: newRole === 'owner',
        canApproveRequests: newRole === 'owner',
        canApproveExpenses: newRole === 'owner',
        canDeleteRecords: newRole === 'owner',
      }
    } : u));

    try {
      const numericId = Number(userId);
      if (!isNaN(numericId)) {
        const { error } = await supabase
          .from('staff_users')
          .update({ role: newRole })
          .eq('id', numericId);

        if (error) {
          console.error('Error updating staff role in Supabase:', error.message);
        }
      }
    } catch (err) {
      console.error('Error syncing updateStaffRole to Supabase:', err);
    }
  };

  const deleteStaffUser = async (userId: string) => {
    if (currentRole !== 'owner') {
      alert('Only owners can remove staff members.');
      return;
    }

    setStaffUsers(prev => prev.filter(u => u.id !== userId));

    try {
      const numericId = Number(userId);
      if (!isNaN(numericId)) {
        const { error } = await supabase
          .from('staff_users')
          .delete()
          .eq('id', numericId);

        if (error) {
          console.error('Error deleting staff user from Supabase:', error.message);
        }
      }
    } catch (err) {
      console.error('Error syncing deleteStaffUser to Supabase:', err);
    }
  };

  // Exhibition Actions
  const addExhibition = async (newExh: Omit<Exhibition, 'id' | 'bookedStallsCount' | 'stallRevenueBooked' | 'totalExpensesLogged'>) => {
    const tempId = `exh-${Date.now()}`;
    const localCreated: Exhibition = {
      ...newExh,
      id: tempId,
      bookedStallsCount: 0,
      stallRevenueBooked: 0,
      totalExpensesLogged: 0,
    };
    setExhibitions(prev => [localCreated, ...prev]);

    // Sync to Supabase
    try {
      const dbPayload = mapExhibitionToDB({
        ...newExh,
        bookedStallsCount: 0,
        stallRevenueBooked: 0,
        totalExpensesLogged: 0,
      });

      const { data, error } = await supabase
        .from('exhibitions')
        .insert([dbPayload])
        .select()
        .single();

      if (!error && data) {
        const serverExh = mapExhibitionFromDB(data);
        setExhibitions(prev => prev.map(e => e.id === tempId ? serverExh : e));

        // Auto-seed initial stall slots for the newly created exhibition
        const stallsToInsert = [];
        const rows = ['A', 'B', 'C'];
        for (const r of rows) {
          for (let s = 1; s <= 6; s++) {
            const stall_number = `${r}-0${s}`;
            const isCorner = s === 1 || s === 6;
            stallsToInsert.push({
              exhibition_id: data.id,
              stall_number,
              size_category: isCorner ? 'corner' : s % 2 === 0 ? 'medium' : 'small',
              price: isCorner ? 145000 : s % 2 === 0 ? 85000 : 55000,
              status: 'available'
            });
          }
        }
        const { data: insertedStalls } = await supabase.from('stall_slots').insert(stallsToInsert).select();
        if (insertedStalls) {
          setStalls(prev => [...prev, ...insertedStalls.map(mapStallSlotFromDB)]);
        }
      }
    } catch (err) {
      console.error('Error inserting exhibition into Supabase:', err);
    }
  };

  const updateExhibition = async (id: string, updates: Partial<Exhibition>) => {
    setExhibitions(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    try {
      const dbPayload = mapExhibitionToDB(updates);
      await supabase.from('exhibitions').update(dbPayload).eq('id', id);
    } catch (err) {
      console.error('Error updating exhibition in Supabase:', err);
    }
  };

  const deleteExhibition = async (id: string) => {
    setExhibitions(prev => prev.filter(e => e.id !== id));
    try {
      await supabase.from('exhibitions').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting exhibition from Supabase:', err);
    }
  };

  // Stall Allocation
  const allocateStall = async (stallId: string, vendorRequestId: string, vendorName: string, brandName: string) => {
    const stall = stalls.find(s => s.id === stallId);
    if (!stall || stall.status === 'booked') {
      alert('This stall is already booked or unavailable.');
      return;
    }

    setStalls(prev => prev.map(s => s.id === stallId ? {
      ...s,
      status: 'booked',
      assignedVendorId: vendorRequestId,
      assignedVendorName: vendorName,
      assignedBrandName: brandName,
      assignedAt: new Date().toISOString()
    } : s));

    // Update vendor request status
    setVendorRequests(prev => prev.map(r => r.id === vendorRequestId ? {
      ...r,
      status: 'approved',
      allocatedStallCode: stall.code,
      reviewedBy: currentUser.name,
      reviewedAt: new Date().toISOString()
    } : r));

    // Update exhibition booked stalls counter and revenue
    setExhibitions(prev => prev.map(e => e.id === stall.exhibitionId ? {
      ...e,
      bookedStallsCount: e.bookedStallsCount + 1,
      stallRevenueBooked: e.stallRevenueBooked + stall.price
    } : e));

    // Add or update CRM contact
    setContacts(prev => {
      const existing = prev.find(c => c.businessName.toLowerCase() === brandName.toLowerCase());
      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          status: 'booked',
          totalSpend: (c.totalSpend || 0) + stall.price,
          assignedStallCodes: Array.from(new Set([...(c.assignedStallCodes || []), stall.code])),
          tags: Array.from(new Set([...(c.tags || []), 'Booked', `Stall ${stall.code}`])),
          lastActivityDate: new Date().toISOString().split('T')[0]
        } : c);
      }
      return prev;
    });

    // Sync to Supabase
    try {
      const assignedAtIso = new Date().toISOString();
      const numericStallId = Number(stallId);
      if (!isNaN(numericStallId)) {
        const numericRequestId = Number(vendorRequestId);
        const stallPayload: any = {
          status: 'booked',
          assigned_vendor_id: !isNaN(numericRequestId) ? numericRequestId : null,
          assigned_vendor_name: vendorName || null,
          assigned_brand_name: brandName || null,
          assigned_at: assignedAtIso
        };

        const { error: stallErr } = await supabase
          .from('stall_slots')
          .update(stallPayload)
          .eq('id', numericStallId);

        // If assignment columns are pending in DB schema, gracefully fallback to status update only
        if (stallErr && stallErr.message && stallErr.message.includes('assigned_')) {
          await supabase
            .from('stall_slots')
            .update({ status: 'booked' })
            .eq('id', numericStallId);
        }
      }

      const numericRequestId = Number(vendorRequestId);
      if (!isNaN(numericRequestId)) {
        await supabase
          .from('vendor_requests')
          .update({ status: 'approved' })
          .eq('id', numericRequestId);
      }
    } catch (err) {
      console.error('Error syncing allocateStall to Supabase:', err);
    }
  };

  const releaseStall = async (stallId: string) => {
    const stall = stalls.find(s => s.id === stallId);
    if (!stall || stall.status === 'available') return;

    setStalls(prev => prev.map(s => s.id === stallId ? {
      ...s,
      status: 'available',
      assignedVendorId: undefined,
      assignedVendorName: undefined,
      assignedBrandName: undefined,
      assignedAt: undefined
    } : s));

    setExhibitions(prev => prev.map(e => e.id === stall.exhibitionId ? {
      ...e,
      bookedStallsCount: Math.max(0, e.bookedStallsCount - 1),
      stallRevenueBooked: Math.max(0, e.stallRevenueBooked - stall.price)
    } : e));

    try {
      const numericStallId = Number(stallId);
      if (!isNaN(numericStallId)) {
        const releasePayload: any = {
          status: 'available',
          assigned_vendor_id: null,
          assigned_vendor_name: null,
          assigned_brand_name: null,
          assigned_at: null
        };

        const { error: releaseErr } = await supabase
          .from('stall_slots')
          .update(releasePayload)
          .eq('id', numericStallId);

        // If assignment columns are pending in DB schema, gracefully fallback to status update only
        if (releaseErr && releaseErr.message && releaseErr.message.includes('assigned_')) {
          await supabase
            .from('stall_slots')
            .update({ status: 'available' })
            .eq('id', numericStallId);
        }
      }
    } catch (err) {
      console.error('Error syncing releaseStall to Supabase:', err);
    }
  };

  // Vendor Requests
  const updateRequestStatus = async (requestId: string, status: RequestStatus, allocatedStallCode?: string) => {
    setVendorRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status,
      allocatedStallCode: allocatedStallCode || r.allocatedStallCode,
      reviewedBy: currentUser.name,
      reviewedAt: new Date().toISOString().split('T')[0]
    } : r));

    try {
      const numericId = Number(requestId);
      if (!isNaN(numericId)) {
        await supabase
          .from('vendor_requests')
          .update({ status })
          .eq('id', numericId);
      }
    } catch (err) {
      console.error('Error updating vendor request status in Supabase:', err);
    }
  };

  const addVendorRequest = async (req: Omit<VendorRequest, 'id' | 'submittedDate' | 'status'>) => {
    const tempId = `req-${Date.now()}`;
    const localCreated: VendorRequest = {
      ...req,
      id: tempId,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setVendorRequests(prev => [localCreated, ...prev]);

    // Register in local CRM
    const newContact: CRMContact = {
      id: `cnt-${Date.now()}`,
      fullName: req.vendorName,
      name: req.vendorName,
      businessName: req.brandName,
      phone: req.phone,
      email: req.email,
      category: req.productCategory,
      source: 'Exhibitor Application',
      exhibitionId: req.exhibitionId,
      exhibitionName: req.exhibitionName,
      tags: [req.exhibitionName || '', 'New Enquiry'],
      exhibitionIds: [req.exhibitionId || ''],
      status: 'enquired',
      totalSpend: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      notes: req.notes || 'Submitted online stall application.'
    };
    setContacts(prev => [newContact, ...prev]);

    // Sync to Supabase
    try {
      const dbPayload = mapVendorRequestToDB(localCreated);
      const { data, error } = await supabase
        .from('vendor_requests')
        .insert([dbPayload])
        .select('*, exhibitions(id, name, location)')
        .single();

      if (!error && data) {
        const serverVR = mapVendorRequestFromDB(data);
        setVendorRequests(prev => prev.map(r => r.id === tempId ? serverVR : r));
        
        // Create notification for new stall request
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.id) {
          createStallRequestNotification({
            userId: authUser.id,
            vendorName: req.vendorName,
            stallCode: req.preferredStallCode,
            exhibitionName: req.exhibitionName
          });
        }
      }
    } catch (err) {
      console.error('Error inserting vendor request into Supabase:', err);
    }
  };

  const deleteVendorRequest = async (requestId: string) => {
    setVendorRequests(prev => prev.filter(r => r.id !== requestId));
    try {
      const numericId = Number(requestId);
      if (!isNaN(numericId)) {
        await supabase
          .from('vendor_requests')
          .delete()
          .eq('id', numericId);
      }
    } catch (err) {
      console.error('Error deleting vendor request from Supabase:', err);
    }
  };

  // CRM Contacts
  const addContact = async (contact: Omit<CRMContact, 'id' | 'lastActivityDate'>) => {
    const tempId = `cnt-${Date.now()}`;
    const localCreated: CRMContact = {
      ...contact,
      id: tempId,
      lastActivityDate: new Date().toISOString().split('T')[0]
    };
    setContacts(prev => [localCreated, ...prev]);

    try {
      const dbPayload = mapCRMContactToDB(localCreated);
      const { data, error } = await supabase
        .from('crm_contacts')
        .insert([dbPayload])
        .select('*, exhibitions(id, name, location)')
        .single();

      if (!error && data) {
        const serverContact = mapCRMContactFromDB(data);
        setContacts(prev => prev.map(c => c.id === tempId ? serverContact : c));
      }
    } catch (err) {
      console.error('Error inserting crm_contact into Supabase:', err);
    }
  };

  const updateContact = async (id: string, updates: Partial<CRMContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates, lastActivityDate: new Date().toISOString().split('T')[0] } : c));
    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        const dbPayload = mapCRMContactToDB(updates);
        await supabase.from('crm_contacts').update(dbPayload).eq('id', numericId);
      }
    } catch (err) {
      console.error('Error updating crm_contact in Supabase:', err);
    }
  };

  const deleteContact = async (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        await supabase.from('crm_contacts').delete().eq('id', numericId);
      }
    } catch (err) {
      console.error('Error deleting crm_contact from Supabase:', err);
    }
  };

  // Expenses
  const addExpense = async (expense: Omit<ExpenseItem, 'id' | 'status' | 'enteredById' | 'enteredByName' | 'enteredByRole'>) => {
    const tempId = `exp-${Date.now()}`;
    const localCreated: ExpenseItem = {
      ...expense,
      id: tempId,
      status: 'approved',
      enteredById: currentUser.id,
      enteredByName: currentUser.name,
      enteredByRole: currentRole,
      approvedBy: currentUser.name
    };
    setExpenses(prev => [localCreated, ...prev]);

    setExhibitions(prev => prev.map(e => e.id === expense.exhibitionId ? {
      ...e,
      totalExpensesLogged: e.totalExpensesLogged + expense.amount
    } : e));

    try {
      const dbPayload = mapExpenseItemToDB(localCreated);
      const { data, error } = await supabase
        .from('expense_items')
        .insert([dbPayload])
        .select('*, exhibitions(id, name, location, start_date, end_date, budget_allocated, budget_received)')
        .single();

      if (!error && data) {
        const serverExpense = mapExpenseItemFromDB(data);
        setExpenses(prev => prev.map(e => e.id === tempId ? serverExpense : e));
        
        // Create notification for expense approval
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.id) {
          createExpenseNotification({
            userId: authUser.id,
            amount: expense.amount,
            category: expense.category,
            enteredBy: currentUser.name
          });
        }
      } else if (error) {
        console.error('Error inserting expense into Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error syncing addExpense to Supabase:', err);
    }
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseItem>) => {
    const oldExpense = expenses.find(e => e.id === id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

    if (oldExpense && updates.amount !== undefined && updates.amount !== oldExpense.amount) {
      const diff = updates.amount - oldExpense.amount;
      const targetExhId = updates.exhibitionId || oldExpense.exhibitionId;
      setExhibitions(prev => prev.map(e => e.id === targetExhId ? {
        ...e,
        totalExpensesLogged: e.totalExpensesLogged + diff
      } : e));
    }

    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        const dbPayload = mapExpenseItemToDB(updates);
        await supabase.from('expense_items').update(dbPayload).eq('id', numericId);
      }
    } catch (err) {
      console.error('Error updating expense in Supabase:', err);
    }
  };

  const updateExpenseStatus = async (expenseId: string, status: ExpenseStatus) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? {
      ...e,
      status,
      approvedBy: status === 'approved' ? currentUser.name : undefined
    } : e));
  };

  const deleteExpense = async (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));

    if (expense) {
      setExhibitions(prev => prev.map(e => e.id === expense.exhibitionId ? {
        ...e,
        totalExpensesLogged: Math.max(0, e.totalExpensesLogged - expense.amount)
      } : e));
    }

    try {
      const numericId = Number(expenseId);
      if (!isNaN(numericId)) {
        await supabase.from('expense_items').delete().eq('id', numericId);
      }
    } catch (err) {
      console.error('Error deleting expense from Supabase:', err);
    }
  };

  // Marketing Campaigns
  const addCampaign = async (campaign: Omit<MarketingCampaign, 'id'>) => {
    const tempId = `cmp-${Date.now()}`;
    const localCreated: MarketingCampaign = {
      ...campaign,
      id: tempId
    };
    setCampaigns(prev => [localCreated, ...prev]);

    try {
      const dbPayload = mapCampaignToDB(localCreated);
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert([dbPayload])
        .select('*, exhibitions(id, name, location)')
        .single();

      if (!error && data) {
        const serverCmp = mapCampaignFromDB(data);
        setCampaigns(prev => prev.map(c => c.id === tempId ? serverCmp : c));
      } else if (error) {
        console.error('Error inserting campaign into Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error syncing addCampaign to Supabase:', err);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        const dbPayload = mapCampaignToDB(updates);
        await supabase
          .from('marketing_campaigns')
          .update(dbPayload)
          .eq('id', numericId);
      }
    } catch (err) {
      console.error('Error updating campaign in Supabase:', err);
    }
  };

  const deleteCampaign = async (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));

    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        await supabase
          .from('marketing_campaigns')
          .delete()
          .eq('id', numericId);
      }
    } catch (err) {
      console.error('Error deleting campaign from Supabase:', err);
    }
  };

  // Past Events
  const addPastEvent = async (event: Omit<PastEventStory, 'id'>) => {
    const tempId = `pe-${Date.now()}`;
    const localCreated: PastEventStory = {
      ...event,
      id: tempId
    };
    setPastEvents(prev => [localCreated, ...prev]);

    try {
      const dbPayload = mapPastEventToDB(localCreated);
      const { data, error } = await supabase
        .from('past_event_stories')
        .insert([dbPayload])
        .select()
        .single();

      if (!error && data) {
        const serverEvent = mapPastEventFromDB(data);
        setPastEvents(prev => prev.map(p => p.id === tempId ? serverEvent : p));
      } else if (error) {
        console.error('Error inserting past event into Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error syncing addPastEvent to Supabase:', err);
    }
  };

  const updatePastEvent = async (id: string, updates: Partial<PastEventStory>) => {
    setPastEvents(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        const dbPayload = mapPastEventToDB(updates);
        await supabase
          .from('past_event_stories')
          .update(dbPayload)
          .eq('id', numericId);
      }
    } catch (err) {
      console.error('Error updating past event in Supabase:', err);
    }
  };

  const deletePastEvent = async (id: string) => {
    setPastEvents(prev => prev.filter(p => p.id !== id));

    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        await supabase
          .from('past_event_stories')
          .delete()
          .eq('id', numericId);
      }
    } catch (err) {
      console.error('Error deleting past event from Supabase:', err);
    }
  };

  // Settings
  const updateSettings = (updates: Partial<AgencySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <AdminContext.Provider value={{
      currentUser,
      currentRole,
      setCurrentRole,
      staffUsers,
      fetchStaffUsers,
      inviteStaffUser,
      updateStaffRole,
      deleteStaffUser,
      exhibitions,
      addExhibition,
      updateExhibition,
      deleteExhibition,
      stalls,
      allocateStall,
      releaseStall,
      vendorRequests,
      updateRequestStatus,
      addVendorRequest,
      deleteVendorRequest,
      contacts,
      addContact,
      updateContact,
      deleteContact,
      expenses,
      addExpense,
      updateExpense,
      updateExpenseStatus,
      deleteExpense,
      campaigns,
      fetchCampaigns,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      pastEvents,
      fetchPastEvents,
      addPastEvent,
      updatePastEvent,
      deletePastEvent,
      settings,
      updateSettings,
      theme,
      toggleTheme,
      setTheme
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
