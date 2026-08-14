import { supabase } from './supabase';
import { createNotification } from './notifications';

/**
 * Seed sample notifications for testing
 * This should be called from a server-side route or script
 */
export async function seedSampleNotifications(userId: string) {
  try {
    // Sample stall request notification
    await createNotification({
      userId,
      type: 'stall_request',
      title: 'New Stall Request',
      message: 'Cuir Leather Goods applied for Stall B-02 (Lahore).',
      metadata: {
        vendorName: 'Cuir Leather Goods',
        stallCode: 'B-02',
        exhibitionName: 'Lahore Exhibition'
      }
    });

    // Sample expense notification
    await createNotification({
      userId,
      type: 'expense_approval',
      title: 'Expense Logged for Approval',
      message: 'Hamza Tariq logged Rs. 150,000 for Security.',
      metadata: {
        amount: 150000,
        category: 'Security',
        enteredBy: 'Hamza Tariq'
      }
    });

    // Sample system notification
    await createNotification({
      userId,
      type: 'system',
      title: 'System Update',
      message: 'Exhibition portal has been updated with new features.',
      metadata: {
        version: '2.0.0'
      }
    });

    console.log('Sample notifications seeded successfully');
  } catch (error) {
    console.error('Error seeding sample notifications:', error);
  }
}