import { supabase } from './supabase';

/**
 * Client-side function to seed sample notifications
 * Call this from the browser console or a dev button
 */
export async function seedSampleNotificationsClient() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('User not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    // Sample stall request notification
    const { error: error1 } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        type: 'stall_request',
        title: 'New Stall Request',
        message: 'Cuir Leather Goods applied for Stall B-02 (Lahore).',
        metadata: {
          vendorName: 'Cuir Leather Goods',
          stallCode: 'B-02',
          exhibitionName: 'Lahore Exhibition'
        },
        is_read: false
      }]);

    if (error1) console.error('Error creating stall request notification:', error1);

    // Sample expense notification
    const { error: error2 } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        type: 'expense_approval',
        title: 'Expense Logged for Approval',
        message: 'Hamza Tariq logged Rs. 150,000 for Security.',
        metadata: {
          amount: 150000,
          category: 'Security',
          enteredBy: 'Hamza Tariq'
        },
        is_read: false
      }]);

    if (error2) console.error('Error creating expense notification:', error2);

    // Sample system notification
    const { error: error3 } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        type: 'system',
        title: 'System Update',
        message: 'Exhibition portal has been updated with new features.',
        metadata: {
          version: '2.0.0'
        },
        is_read: false
      }]);

    if (error3) console.error('Error creating system notification:', error3);

    console.log('Sample notifications seeded successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding sample notifications:', error);
    return { success: false, error };
  }
}