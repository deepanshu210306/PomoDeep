import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'pomo';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};
global.mongooseCache = cached;

export function isDbConfigured() {
  return Boolean(MONGODB_URI);
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env.local');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function dbErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/ENOTFOUND|querySrv|ECONNREFUSED|ETIMEOUT|Server selection/i.test(msg)) {
    return 'Cannot reach MongoDB. Check MONGODB_URI in .env.local (Atlas hostname / network / IP allowlist).';
  }
  if (/MONGODB_URI is not set/i.test(msg)) {
    return 'Database is not configured. Add MONGODB_URI to .env.local.';
  }
  if (/bad auth|Authentication failed/i.test(msg)) {
    return 'MongoDB authentication failed. Check username/password in MONGODB_URI.';
  }
  return 'Database error. Please try again.';
}
