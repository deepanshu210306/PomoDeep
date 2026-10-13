import { NextResponse } from 'next/server';
import { dbErrorMessage } from './db';
import { SanitizeError } from './sanitize';

export function jsonError(err: unknown, fallback: string) {
  if (err instanceof SanitizeError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  const dbMsg = dbErrorMessage(err);
  if (dbMsg !== 'Database error. Please try again.') {
    return NextResponse.json({ error: dbMsg }, { status: 503 });
  }
  console.error(err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
