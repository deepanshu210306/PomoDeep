/** Max custom background image/video size (raw file bytes). */
export const MAX_CUSTOM_MEDIA_BYTES = 5 * 1024 * 1024;

/** Marker stored in localStorage when the real media lives in IndexedDB. */
export const CUSTOM_MEDIA_IDB_MARKER = 'idb:customBackground';

const DB_NAME = 'pomo-media';
const STORE = 'media';
const KEY = 'customBackground';

export function isVideoSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith('data:video/')) return true;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src);
}

export function isImageSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith('data:image/')) return true;
  return /\.(png|jpe?g|gif|webp|avif|bmp)(\?|$)/i.test(src);
}

/** Approximate decoded byte size of a data URL. */
export function dataUrlByteLength(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return dataUrl.length;
  const b64 = dataUrl.slice(comma + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomMedia(dataUrl: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(dataUrl, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadCustomMedia(): Promise<string | null> {
  try {
    const db = await openDb();
    const value = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () =>
        resolve(typeof req.result === 'string' ? req.result : null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return value;
  } catch {
    return null;
  }
}

export async function clearCustomMedia(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}
