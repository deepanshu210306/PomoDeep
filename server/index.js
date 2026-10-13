import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pomo';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'pomo';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'pomo-dev-secret-change-me';
  console.warn('[pomo] JWT_SECRET not set — using insecure dev default.');
}

const app = express();
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
);
// Custom image/video backgrounds are stored as data URLs (~5MB file ≈ 6.7MB JSON)
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[pomo] MongoDB connected (db: ${MONGODB_DB_NAME})`);
  } catch (err) {
    console.error('[pomo] MongoDB connection failed:', err.message);
    console.error(
      '[pomo] Start MongoDB locally or set MONGODB_URI (e.g. Atlas) in server/.env',
    );
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[pomo] API listening on http://localhost:${PORT}`);
  });
}

start();
