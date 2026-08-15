export type UserRole = 'owner' | 'staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActive: string;
  permissions: {
    canManageExhibitions: boolean;
    canApproveRequests: boolean;
    canAllocateStalls: boolean;
    canApproveExpenses: boolean;
    canDeleteRecords: boolean;
    canSendBulkMessages: boolean;
  };
}

export type ExhibitionStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Exhibition {
  id: string;
  title: string;
  tagline: string;
  city: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  category: string;
  coverImage: string;
  totalStallCapacity: number;
  bookedStallsCount: number;
  budgetAllocated: number; // Funding received / Allocated budget in PKR
  budgetReceived?: number; // Actual funds received to date in PKR
  stallRevenueBooked: number;
  totalExpensesLogged: number;
  description: string;
  daysLeft?: number;
  stallRegistrationDeadline?: string; // ISO date string (YYYY-MM-DD)
}

export type StallTier = 'small' | 'medium' | 'premium' | 'corner';

export interface StallSlot {
  id: string;
  code: string;
  exhibitionId?: string;
  tier: StallTier;
  tierName: string;
  dimensions: string;
  price: number;
  status: 'available' | 'booked' | 'reserved';
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedBrandName?: string;
  assignedAt?: string;
  row: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted';

export interface VendorRequest {
  id: string;
  referenceId?: string;
  vendorName: string;
  brandName: string;
  email: string;
  phone: string;
  exhibitionId?: string;
  exhibitionName?: string;
  stallsWanted: number;
  stallTierPreference: StallTier;
  preferredStallCode?: string;
  requestedStallId?: string;
  requestedStallCode?: string;
  allocatedStallCode?: string;
  productCategory: string;
  budgetRange: string;
  notes: string;
  submittedDate: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export type ContactStatus = 'booked' | 'enquired' | 'waitlisted' | 'past-client' | 'referral';

export interface CRMContact {
  id: string;
  fullName?: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  category: string;
  status: ContactStatus;
  source?: string;
  exhibitionId?: string;
  exhibitionName?: string;
  tags?: string[];
  exhibitionIds?: string[];
  totalSpend?: number;
  lastActivityDate?: string;
  notes?: string;
  assignedStallCodes?: string[];
}

export type ExpenseCategory = 
  | 'Venue Rent' 
  | 'Marketing & Ads' 
  | 'Staff & Labour' 
  | 'Logistics & Freight' 
  | 'Setup, Decor & Lighting' 
  | 'Security & Protocol' 
  | 'Refreshments' 
  | 'Miscellaneous';

export type ExpenseStatus = 'pending_approval' | 'approved' | 'rejected';

export interface ExpenseItem {
  id: string;
  exhibitionId?: string;
  exhibitionName?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
  enteredById?: string;
  enteredByName?: string;
  enteredByRole?: UserRole;
  status?: ExpenseStatus;
  approvedBy?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Card' | string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  platform: 'Instagram' | 'TikTok' | 'Meta Ads' | 'Google Search' | 'Influencer PR' | 'Outdoor Billboard';
  amountSpent: number;
  runDuration: string;
  startDate: string;
  endDate: string;
  linkedExhibitionId: string;
  linkedExhibitionName: string;
  leadsGenerated: number;
  reachImpressions: string;
  notes: string;
  status: 'active' | 'completed' | 'scheduled';
}

export interface PastEventStory {
  id: string;
  title: string;
  edition: string;
  city: string;
  dateRange: string;
  footfallNumber: number;
  vendorCount: number;
  totalRevenueGMV: string;
  satisfactionRate: string;
  narrativeExcerpt: string;
  coverImage: string;
  photos: string[];
  tags: string[];
  isPublished?: boolean; // Controls visibility on public landing page
  quoteText?: string;
  quoteAuthor?: string;
  quoteBrand?: string;
}

export interface AgencySettings {
  agencyName: string;
  tagline: string;
  supportEmail: string;
  coordinatorWhatsApp: string;
  headquartersAddress: string;
  currency: string;
  logoUrl?: string;
}

export type NotificationType = 'stall_request' | 'expense_approval' | 'system' | 'info' | 'alert' | 'success';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
