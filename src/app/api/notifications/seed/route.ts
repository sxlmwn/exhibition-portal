import { NextResponse } from 'next/server';
import { verifyAuthUser } from '@/lib/serverAuth';
import { seedSampleNotifications } from '@/lib/seedNotifications';

export const dynamic = 'force-dynamic';

// POST /api/notifications/seed - Seed sample notifications for testing
export async function POST(req: Request) {
  try {
    const user = await verifyAuthUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await seedSampleNotifications(user.id);

    return NextResponse.json({ success: true, message: 'Sample notifications seeded' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
