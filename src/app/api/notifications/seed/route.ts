import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { seedSampleNotifications } from '@/lib/seedNotifications';

// POST /api/notifications/seed - Seed sample notifications for testing
export async function POST(req: Request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await seedSampleNotifications(user.id);

    return NextResponse.json({ success: true, message: 'Sample notifications seeded' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
