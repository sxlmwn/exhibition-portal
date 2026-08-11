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
  INITIAL_CAMPAIGNS, 
  INITIAL_PAST_EVENTS, 
  INITIAL_STAFF_USERS, 
  INITIAL_AGENCY_SETTINGS 
} from '../data/mockData';
import { supabase } from '../lib/supabase';

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

  return {
    id: String(row.id),
    vendorName,
    brandName,
    email,
    phone,
    exhibitionId: String(row.exhibition_id || ''),
    exhibitionName,
    stallsWanted,
    stallTierPreference: (row.stall_tier_preference as StallTier) || 'medium',
    preferredStallCode: row.preferred_stall_code || undefined,
    allocatedStallCode: row.allocated_stall_code || undefined,
    productCategory,
    budgetRange,
    notes: row.notes || '',
    submittedDate: row.submitted_date || (row.created_at ? row.created_at.split('T')[0] : '2026-03-01'),
    status,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
  };
};

export const mapVendorRequestToDB = (req: Partial<VendorRequest>): any => {
  const payload: any = {};
  if (req.id !== undefined && !String(req.id).startsWith('vr-') && !String(req.id).startsWith('req-') && !isNaN(Number(req.id))) {
    payload.id = Number(req.id);
  }
  if (req.exhibitionId !== undefined && !isNaN(Number(req.exhibitionId))) {
    payload.exhibition_id = Number(req.exhibitionId);
  }
  if (req.brandName !== undefined || req.vendorName !== undefined) {
    payload.business_name = req.brandName || req.vendorName;
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
  if (req.status !== undefined) {
    payload.status = req.status;
  }
  return payload;
};

// Helper mappers for Stall Slots
export const mapStallSlotFromDB = (row: any): StallSlot => {
  const code = row.stall_number || row.code || `S-${row.id}`;
  const rowLetter = code.includes('-') ? `Row ${code.split('-')[0]}` : 'Row A';
  const tier: StallTier = (row.size_category as StallTier) || (code.endsWith('01') || code.endsWith('06') ? 'corner' : 'medium');
  const tierName = tier === 'corner' ? 'Corner Boulevard' : tier === 'premium' ? 'Premium Pavilion' : tier === 'medium' ? 'Standard Medium' : 'Artisan Stall';
  const dimensions = tier === 'corner' ? '12x12 ft' : tier === 'premium' ? '10x10 ft' : '9x9 ft';
  const price = Number(row.price || (tier === 'corner' ? 145000 : tier === 'premium' ? 110000 : 78000));
  const status = (row.status as 'available' | 'booked' | 'reserved') || 'available';

  return {
    id: String(row.id),
    code,
    exhibitionId: String(row.exhibition_id || ''),
    tier,
    tierName,
    dimensions,
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

interface AdminContextType {
  // Current user & role
  currentUser: StaffUser;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  staffUsers: StaffUser[];
  inviteStaffUser: (user: Omit<StaffUser, 'id' | 'joinedDate' | 'lastActive'>) => void;
  updateStaffRole: (userId: string, newRole: UserRole) => void;
  deleteStaffUser: (userId: string) => void;

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
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;
  deleteCampaign: (id: string) => void;

  // Past Events
  pastEvents: PastEventStory[];
  addPastEvent: (event: Omit<PastEventStory, 'id'>) => void;
  updatePastEvent: (id: string, updates: Partial<PastEventStory>) => void;
  deletePastEvent: (id: string) => void;

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
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [stalls, setStalls] = useState<StallSlot[]>([]);
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(INITIAL_CAMPAIGNS);
  const [pastEvents, setPastEvents] = useState<PastEventStory[]>(INITIAL_PAST_EVENTS);
  const [settings, setSettings] = useState<AgencySettings>(INITIAL_AGENCY_SETTINGS);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // Supabase Fetchers
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
      const { data, error } = await supabase
        .from('stall_slots')
        .select('*')
        .order('id', { ascending: true });

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

      if (!error && data) {
        setContacts(data.map(mapCRMContactFromDB));
      } else if (error) {
        console.error('Failed to load crm_contacts from Supabase:', error.message);
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
    fetchExhibitions();
    fetchVendorRequests();
    fetchStalls();
    fetchContacts();
    fetchExpenses();

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
        fetchExhibitions();
        fetchVendorRequests();
        fetchStalls();
        fetchContacts();
        fetchExpenses();
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

  const currentUser = staffUsers.find(u => u.role === currentRole) || staffUsers[0];

  // Staff Management
  const inviteStaffUser = (user: Omit<StaffUser, 'id' | 'joinedDate' | 'lastActive'>) => {
    const newUser: StaffUser = {
      ...user,
      id: `usr-${Date.now()}`,
      joinedDate: 'Just now',
      lastActive: 'Just now'
    };
    setStaffUsers(prev => [...prev, newUser]);
  };

  const updateStaffRole = (userId: string, newRole: UserRole) => {
    setStaffUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const deleteStaffUser = (userId: string) => {
    setStaffUsers(prev => prev.filter(u => u.id !== userId));
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
      const numericStallId = Number(stallId);
      if (!isNaN(numericStallId)) {
        await supabase
          .from('stall_slots')
          .update({ status: 'booked' })
          .eq('id', numericStallId);
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
        await supabase
          .from('stall_slots')
          .update({ status: 'available' })
          .eq('id', numericStallId);
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
  const addCampaign = (campaign: Omit<MarketingCampaign, 'id'>) => {
    const newCmp: MarketingCampaign = {
      ...campaign,
      id: `cmp-${Date.now()}`
    };
    setCampaigns(prev => [newCmp, ...prev]);
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  // Past Events
  const addPastEvent = (event: Omit<PastEventStory, 'id'>) => {
    const newEvent: PastEventStory = {
      ...event,
      id: `pst-${Date.now()}`
    };
    setPastEvents(prev => [newEvent, ...prev]);
  };

  const updatePastEvent = (id: string, updates: Partial<PastEventStory>) => {
    setPastEvents(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePastEvent = (id: string) => {
    setPastEvents(prev => prev.filter(p => p.id !== id));
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
      addCampaign,
      deleteCampaign,
      pastEvents,
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
