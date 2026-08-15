import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frfbfymhdpfeqjadpmcj.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    let { data, error } = await supabaseAdmin
      .from('vendor_requests')
      .insert([payload])
      .select()
      .single();

    if (error && (error.message.includes('reference_id') || error.message.includes('requested_stall_id'))) {
      const fallback = { ...payload };
      if (error.message.includes('reference_id')) delete fallback.reference_id;
      if (error.message.includes('requested_stall_id')) delete fallback.requested_stall_id;
      const retryResult = await supabaseAdmin
        .from('vendor_requests')
        .insert([fallback])
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('API vendor-requests insert error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
