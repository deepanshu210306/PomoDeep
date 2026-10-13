import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, dbErrorMessage, isDbConfigured } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, mongo: 'unconfigured', error: 'MONGODB_URI is not set' },
      { status: 503 },
    );
  }
  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        mongo: 'disconnected',
        error: dbErrorMessage(err),
      },
      { status: 503 },
    );
  }
}
