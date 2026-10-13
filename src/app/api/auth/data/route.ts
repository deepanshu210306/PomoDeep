import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/lib/apiErrors';
import { getUserIdFromRequest } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { sanitizeCustomMedia } from '@/lib/sanitize';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const body = await req.json();
    let payload = body?.data;
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'Missing data payload.' },
        { status: 400 },
      );
    }

    payload = sanitizeCustomMedia(payload);

    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { data: payload } },
      { new: true },
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: user.data });
  } catch (err) {
    return jsonError(err, 'Could not save settings.');
  }
}
