import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/apiErrors';
import { signToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { publicUser, User } from '@/lib/models/User';
import { sanitizeCustomMedia } from '@/lib/sanitize';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');

    if (!email || !name || password.length < 6) {
      return NextResponse.json(
        {
          error:
            'Name, email, and a password of at least 6 characters are required.',
        },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    let data = body.data || {};
    data = sanitizeCustomMedia(data);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      name,
      passwordHash,
      data,
    });

    return NextResponse.json(
      {
        token: signToken(user._id.toString()),
        user: publicUser(user),
        data: user.data,
      },
      { status: 201 },
    );
  } catch (err) {
    return jsonError(err, 'Could not create account.');
  }
}
