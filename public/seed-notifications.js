// Add this to your browser console to seed sample notifications
// Copy and paste this entire script into the browser console while logged in

(async function seedNotifications() {
  try {
    // Get the Supabase client from the window (if exposed) or use fetch
    const response = await fetch('/api/notifications/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Sample notifications seeded successfully!');
      console.log('Refresh the page to see them in the notification bell.');
    } else {
      console.error('❌ Failed to seed notifications:', result.error);
    }
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    console.log('Make sure you are logged in and the notifications table exists in your database.');
  }
})();