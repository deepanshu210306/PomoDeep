import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = () =>
  process.env.JWT_SECRET || 'pomo-dev-secret-change-me';

export type AuthUserId = string;

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET(), { expiresIn: '30d' });
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET()) as { sub?: string };
    return payload.sub || null;
  } catch {
    return null;
  }
}
