const PREFIX = 'pomo:';

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function loadRawJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private mode — ignore
  }
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Shift a YYYY-MM-DD key by `delta` calendar days. */
export function shiftDayKey(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return todayKey(dt);
}

export function pruneStudyHistory(
  history: Record<string, number>,
  keepDays = 90,
): Record<string, number> {
  const keys = Object.keys(history).sort();
  if (keys.length <= keepDays) return history;
  const next = { ...history };
  for (const key of keys.slice(0, keys.length - keepDays)) {
    delete next[key];
  }
  return next;
}

export function mergeStudyHistory(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const next = { ...a };
  for (const [day, ms] of Object.entries(b)) {
    if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) continue;
    next[day] = Math.max(next[day] || 0, ms);
  }
  return pruneStudyHistory(next);
}
