const MAX_CUSTOM_MEDIA_BYTES = 5 * 1024 * 1024;

function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return dataUrl.length;
  const b64 = dataUrl.slice(comma + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

export class SanitizeError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
  }
}

type CloudPayload = {
  theme?: { customBackground?: string | null; [key: string]: unknown };
  [key: string]: unknown;
};

export function sanitizeCustomMedia<T extends CloudPayload>(payload: T): T {
  const media = payload?.theme?.customBackground;
  if (!media || typeof media !== 'string') return payload;
  if (media === 'idb:customBackground') {
    return {
      ...payload,
      theme: { ...payload.theme, customBackground: null },
    };
  }
  if (dataUrlByteLength(media) > MAX_CUSTOM_MEDIA_BYTES) {
    throw new SanitizeError('Custom image/video must be 5 MB or smaller.');
  }
  return payload;
}
