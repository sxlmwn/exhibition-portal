'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Exhibition, 
  StallSlot, 
  VendorRequest, 
  CRMContact, 
  ExpenseItem, 
  MarketingCampaign, 
  PastEventStory, 
  StaffUser, 
  AgencySettings,
  UserRole,
  RequestStatus,
  ExpenseStatus
} from '../types';
import { 
  INITIAL_EXHIBITIONS, 
  INITIAL_STALLS, 
  INITIAL_VENDOR_REQUESTS, 
  INITIAL_CRM_CONTACTS, 
  INITIAL_EXPENSES, 
  INITIAL_CAMPAIGNS, 
  INITIAL_PAST_EVENTS, 
  INITIAL_STAFF_USERS, 
  INITIAL_AGENCY_SETTINGS 
} from '../data/mockData';

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

  // CRM Contacts
  contacts: CRMContact[];
  addContact: (contact: Omit<CRMContact, 'id' | 'lastActivityDate'>) => void;
  updateContact: (id: string, updates: Partial<CRMContact>) => void;
  deleteContact: (id: string) => void;

  // Expenses
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'status' | 'enteredById' | 'enteredByName' | 'enteredByRole'>) => void;
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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [exhibitions, setExhibitions] = useState<Exhibition[]>(INITIAL_EXHIBITIONS);
  const [stalls, setStalls] = useState<StallSlot[]>(INITIAL_STALLS);
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>(INITIAL_VENDOR_REQUESTS);
  const [contacts, setContacts] = useState<CRMContact[]>(INITIAL_CRM_CONTACTS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(INITIAL_CAMPAIGNS);
  const [pastEvents, setPastEvents] = useState<PastEventStory[]>(INITIAL_PAST_EVENTS);
  const [settings, setSettings] = useState<AgencySettings>(INITIAL_AGENCY_SETTINGS);

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
  const addExhibition = (newExh: Omit<Exhibition, 'id' | 'bookedStallsCount' | 'stallRevenueBooked' | 'totalExpensesLogged'>) => {
    const created: Exhibition = {
      ...newExh,
      id: `exh-${Date.now()}`,
      bookedStallsCount: 0,
      stallRevenueBooked: 0,
      totalExpensesLogged: 0,
    };
    setExhibitions(prev => [created, ...prev]);

    // Generate initial stalls for this exhibition
    const generatedStalls: StallSlot[] = [];
    const rows = ['Row A', 'Row B', 'Row C', 'Row D'];
    for (let r = 0; r < 3; r++) {
      for (let s = 1; s <= 6; s++) {
        const code = `${String.fromCharCode(65 + r)}-0${s}`;
        const tier = s === 1 || s === 6 ? 'corner' : s % 2 === 0 ? 'medium' : 'small';
        generatedStalls.push({
          id: `stl-${created.id}-${code}`,
          code,
          exhibitionId: created.id,
          tier,
          tierName: tier === 'corner' ? 'Corner Boulevard' : tier === 'medium' ? 'Medium Stall' : 'Small Stall',
          dimensions: tier === 'corner' ? '12x12 ft' : tier === 'medium' ? '9x9 ft' : '6x6 ft',
          price: tier === 'corner' ? 145000 : tier === 'medium' ? 78000 : 45000,
          status: 'available',
          row: rows[r]
        });
      }
    }
    setStalls(prev => [...prev, ...generatedStalls]);
  };

  const updateExhibition = (id: string, updates: Partial<Exhibition>) => {
    setExhibitions(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExhibition = (id: string) => {
    setExhibitions(prev => prev.filter(e => e.id !== id));
  };

  // Stall Allocation
  const allocateStall = (stallId: string, vendorRequestId: string, vendorName: string, brandName: string) => {
    const stall = stalls.find(s => s.id === stallId);
    if (!stall) return;

    setStalls(prev => prev.map(s => s.id === stallId ? {
      ...s,
      status: 'booked',
      assignedVendorId: vendorRequestId,
      assignedVendorName: vendorName,
      assignedBrandName: brandName,
      assignedAt: new Date().toISOString()
    } : s));

    // Update vendor request status if applicable
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
          totalSpend: c.totalSpend + stall.price,
          assignedStallCodes: Array.from(new Set([...(c.assignedStallCodes || []), stall.code])),
          tags: Array.from(new Set([...c.tags, 'Booked', `Stall ${stall.code}`])),
          lastActivityDate: new Date().toISOString().split('T')[0]
        } : c);
      }
      return prev;
    });
  };

  const releaseStall = (stallId: string) => {
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
  };

  // Vendor Requests
  const updateRequestStatus = (requestId: string, status: RequestStatus, allocatedStallCode?: string) => {
    setVendorRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status,
      allocatedStallCode: allocatedStallCode || r.allocatedStallCode,
      reviewedBy: currentUser.name,
      reviewedAt: new Date().toISOString().split('T')[0]
    } : r));
  };

  const addVendorRequest = (req: Omit<VendorRequest, 'id' | 'submittedDate' | 'status'>) => {
    const newReq: VendorRequest = {
      ...req,
      id: `req-${Date.now()}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setVendorRequests(prev => [newReq, ...prev]);

    // Also register in CRM
    const newContact: CRMContact = {
      id: `cnt-${Date.now()}`,
      name: req.vendorName,
      businessName: req.brandName,
      phone: req.phone,
      email: req.email,
      category: req.productCategory,
      tags: [req.exhibitionName, 'New Enquiry'],
      exhibitionIds: [req.exhibitionId],
      status: 'enquired',
      totalSpend: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      notes: req.notes || 'Submitted online stall application.'
    };
    setContacts(prev => [newContact, ...prev]);
  };

  // CRM Contacts
  const addContact = (contact: Omit<CRMContact, 'id' | 'lastActivityDate'>) => {
    const newContact: CRMContact = {
      ...contact,
      id: `cnt-${Date.now()}`,
      lastActivityDate: new Date().toISOString().split('T')[0]
    };
    setContacts(prev => [newContact, ...prev]);
  };

  const updateContact = (id: string, updates: Partial<CRMContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates, lastActivityDate: new Date().toISOString().split('T')[0] } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Expenses
  const addExpense = (expense: Omit<ExpenseItem, 'id' | 'status' | 'enteredById' | 'enteredByName' | 'enteredByRole'>) => {
    const newExpense: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}`,
      status: currentRole === 'staff' ? 'pending_approval' : 'approved',
      enteredById: currentUser.id,
      enteredByName: currentUser.name,
      enteredByRole: currentRole,
      approvedBy: currentRole !== 'staff' ? currentUser.name : undefined
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Update exhibition total expenses
    if (newExpense.status === 'approved') {
      setExhibitions(prev => prev.map(e => e.id === expense.exhibitionId ? {
        ...e,
        totalExpensesLogged: e.totalExpensesLogged + expense.amount
      } : e));
    }
  };

  const updateExpenseStatus = (expenseId: string, status: ExpenseStatus) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    setExpenses(prev => prev.map(e => e.id === expenseId ? {
      ...e,
      status,
      approvedBy: status === 'approved' ? currentUser.name : undefined
    } : e));

    if (status === 'approved' && expense.status !== 'approved') {
      setExhibitions(prev => prev.map(e => e.id === expense.exhibitionId ? {
        ...e,
        totalExpensesLogged: e.totalExpensesLogged + expense.amount
      } : e));
    }
  };

  const deleteExpense = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    setExpenses(prev => prev.filter(e => e.id !== expenseId));

    if (expense.status === 'approved') {
      setExhibitions(prev => prev.map(e => e.id === expense.exhibitionId ? {
        ...e,
        totalExpensesLogged: Math.max(0, e.totalExpensesLogged - expense.amount)
      } : e));
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
      contacts,
      addContact,
      updateContact,
      deleteContact,
      expenses,
      addExpense,
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
      updateSettings
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
