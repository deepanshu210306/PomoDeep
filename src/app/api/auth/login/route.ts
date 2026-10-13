import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { publicUser, User } from '@/lib/models/User';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '');

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      token: signToken(user._id.toString()),
      user: publicUser(user),
      data: user.data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not sign in.' }, { status: 500 });
  }
}
