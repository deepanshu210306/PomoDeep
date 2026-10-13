import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  } catch {
    return NextResponse.json(
      { ok: false, mongo: 'disconnected' },
      { status: 503 },
    );
  }
}
