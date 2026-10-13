# Pomodoro Timer

Desktop-first Pomodoro productivity app with an independent study stopwatch, tasks, lofi music, ambient effects, and local persistence.

## Run

Terminal 1 — API + MongoDB:

```bash
cd server
npm install
# Edit .env if needed (MONGODB_URI, JWT_SECRET)
npm run dev
```

Terminal 2 — frontend:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in from **Settings → Account** so themes, timer settings, and tasks sync to MongoDB and reload on open.

Set `MONGODB_URI` (and optional `MONGODB_DB_NAME`) in `server/.env` — same Atlas cluster as DataSense works; Pomo uses the `pomo` database by default.

## Features

- Pomodoro countdown (focus / short break / long break) with timestamp-based timing
- Independent study stopwatch with daily totals
- Tasks with statuses, search, filter/sort, focus task, and per-task time tracking
- Settings: language, backgrounds, accent colors, ambient effects, durations
- Account login — settings and tasks saved to MongoDB and restored on open
- Lofi track list with ambient sound toggle and volume
- Streak and daily challenge panels
- Local fallback via `localStorage`

## Stack

Vite · React · TypeScript · Express · MongoDB · Lucide icons · Space Grotesk
