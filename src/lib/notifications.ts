import { supabase } from './supabase';
import { NotificationType } from '@/types';

/**
 * Create a notification for a user
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  const { userId, type, title, message, metadata } = params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        metadata: metadata || {},
        is_read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create a stall request notification
 */
export async function createStallRequestNotification(params: {
  userId: string;
  vendorName: string;
  stallCode?: string;
  exhibitionName?: string;
}) {
  const { userId, vendorName, stallCode, exhibitionName } = params;
  
  const stallInfo = stallCode ? ` for Stall ${stallCode}` : '';
  const exhibitionInfo = exhibitionName ? ` in ${exhibitionName}` : '';
  
  return createNotification({
    userId,
    type: 'stall_request',
    title: 'New Stall Request',
    message: `${vendorName} has applied${stallInfo}${exhibitionInfo}.`,
    metadata: {
      vendorName,
      stallCode,
      exhibitionName
    }
  });
}

/**
 * Create an expense approval notification
 */
export async function createExpenseNotification(params: {
  userId: string;
  amount: number;
  category: string;
  enteredBy?: string;
}) {
  const { userId, amount, category, enteredBy } = params;
  
  const formattedAmount = `Rs. ${amount.toLocaleString()}`;
  const enteredByInfo = enteredBy ? ` by ${enteredBy}` : '';
  
  return createNotification({
    userId,
    type: 'expense_approval',
    title: 'Expense Logged for Approval',
    message: `${formattedAmount} for ${category}${enteredByInfo} needs approval.`,
    metadata: {
      amount,
      category,
      enteredBy
    }
  });
}

/**
 * Create a system notification
 */
export async function createSystemNotification(params: {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}) {
  return createNotification({
    userId: params.userId,
    type: 'system',
    title: params.title,
    message: params.message,
    metadata: params.metadata
  });
}

/**
 * Get formatted time ago string
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}