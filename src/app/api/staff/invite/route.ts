import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, phone } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local. To invite real Auth users, please obtain the service_role secret from Supabase Dashboard -> Project Settings -> API and set SUPABASE_SERVICE_ROLE_KEY in .env.local.'
      }, { status: 501 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Invite or create auth user via Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, role: role || 'staff' }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const authId = authData.user?.id;

    // 2. Insert into staff_users table
    const { data: staffRow, error: staffError } = await adminClient
      .from('staff_users')
      .insert([{
        full_name: name,
        email,
        role: role || 'staff',
        phone: phone || null,
        auth_id: authId
      }])
      .select()
      .single();

    if (staffError) {
      return NextResponse.json({ error: staffError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: staffRow });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
