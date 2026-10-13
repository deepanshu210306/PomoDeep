import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { publicUser, User } from '@/lib/models/User';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user: publicUser(user), data: user.data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Could not load profile.' },
      { status: 500 },
    );
  }
}
