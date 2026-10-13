import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();

const MAX_CUSTOM_MEDIA_BYTES = 5 * 1024 * 1024;

function publicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

function dataUrlByteLength(dataUrl) {
  const comma = String(dataUrl).indexOf(',');
  if (comma < 0) return String(dataUrl).length;
  const b64 = String(dataUrl).slice(comma + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

function sanitizeCustomMedia(payload) {
  const media = payload?.theme?.customBackground;
  if (!media || typeof media !== 'string') return payload;
  if (media === 'idb:customBackground') {
    return {
      ...payload,
      theme: { ...payload.theme, customBackground: null },
    };
  }
  if (dataUrlByteLength(media) > MAX_CUSTOM_MEDIA_BYTES) {
    const err = new Error('Custom image/video must be 5 MB or smaller.');
    err.status = 400;
    throw err;
  }
  return payload;
}

router.post('/register', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const name = String(req.body.name || '').trim();
    const password = String(req.body.password || '');

    if (!email || !name || password.length < 6) {
      return res.status(400).json({
        error: 'Name, email, and a password of at least 6 characters are required.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    let data = req.body.data || {};
    try {
      data = sanitizeCustomMedia(data);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      name,
      passwordHash,
      data,
    });

    const token = signToken(user._id.toString());
    res.status(201).json({
      token,
      user: publicUser(user),
      data: user.data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id.toString());
    res.json({
      token,
      user: publicUser(user),
      data: user.data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: publicUser(user), data: user.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profile.' });
  }
});

router.put('/data', requireAuth, async (req, res) => {
  try {
    let payload = req.body?.data;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Missing data payload.' });
    }

    payload = sanitizeCustomMedia(payload);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { data: payload } },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true, data: user.data });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Could not save settings.' });
  }
});

export default router;
