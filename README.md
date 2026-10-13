# PomoDeep

Desktop-first focus timer with Pomodoro sessions, an independent study stopwatch, tasks, ambient themes, and cloud sync.

Built with **Next.js** — UI and API in one app, ready for a single Vercel deploy.

## Features

- **Pomodoro** — focus / short break / long break with timestamp-based timing
- **Study stopwatch** — independent session timer with daily totals
- **Study graph** — sidebar chart of past days (Study tab only)
- **Tasks** — statuses (Backlog → Canceled), focus task, search & filters
- **Themes** — backgrounds, accents, ambient effects (motes, stars, rain, bubbles)
- **Custom media** — upload your own image or video background (max 5 MB)
- **Music** — lofi tracks with ambient volume controls
- **Streak & challenges** — daily focus tracking
- **Accounts** — register / sign in; settings sync to MongoDB and reload on open

## Stack

Next.js 15 · React 19 · TypeScript · MongoDB (Mongoose) · JWT auth · Lucide · Sora + IBM Plex Mono

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas (or local) connection string |
| `MONGODB_DB_NAME` | Database name (e.g. `pomo`) |
| `JWT_SECRET` | Long random string for session tokens |

Login/signup need a **reachable** MongoDB. In Atlas: create/resume a cluster → Database → Connect → Drivers → copy the URI. Also allow your IP (or `0.0.0.0/0` for testing) under Network Access.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Lint with oxlint |

## Deploy on Vercel

One project — no separate backend.

1. Push the repo to GitHub.
2. Import on [vercel.com](https://vercel.com) (Next.js is auto-detected).
3. Add the same env vars as `.env.local`.
4. Deploy.

Auth and data APIs live under `/api/auth/*` on the same domain.

> **Note:** Vercel Hobby limits request bodies to ~4.5 MB. Custom backgrounds near 5 MB may need a smaller file or a higher plan.

## Cloud sync (signed in)

Saved to MongoDB and restored on login:

- Study stopwatch history (per-day totals)
- Tasks & focus task
- Settings & theme
- Custom image / video background (≤ 5 MB)

Without an account, data stays in the browser (`localStorage` + IndexedDB for large media).
