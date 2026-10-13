const API_BASE = '/api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type CloudData = {
  theme?: unknown;
  settings?: unknown;
  tasks?: unknown[];
  focusTaskId?: string | null;
  streak?: unknown;
  pomodoro?: unknown;
  stopwatch?: unknown;
  study?: unknown;
  studyHistory?: Record<string, number>;
};

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body as T;
}

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  data?: CloudData;
}) {
  return request<{ token: string; user: AuthUser; data: CloudData }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export function loginAccount(input: { email: string; password: string }) {
  return request<{ token: string; user: AuthUser; data: CloudData }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export function fetchMe(token: string) {
  return request<{ user: AuthUser; data: CloudData }>('/auth/me', { token });
}

export function saveCloudData(token: string, data: CloudData) {
  return request<{ ok: boolean; data: CloudData }>('/auth/data', {
    method: 'PUT',
    token,
    body: JSON.stringify({ data }),
  });
}
