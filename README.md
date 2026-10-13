# PomoDeep

Pomodoro + study stopwatch app with tasks, themes, ambient effects, and MongoDB cloud sync.

Built with **Next.js** — UI and API in one deploy (Vercel-ready).

## Local development

```bash
npm install
# Copy secrets
cp .env.example .env.local
# Fill MONGODB_URI, MONGODB_DB_NAME, JWT_SECRET

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel (single project)

1. Push this repo to GitHub.
2. Import the project on [vercel.com](https://vercel.com).
3. Framework: **Next.js** (auto-detected).
4. Add environment variables:
   - `MONGODB_URI` — Atlas connection string
   - `MONGODB_DB_NAME` — e.g. `pomo`
   - `JWT_SECRET` — long random string
5. Deploy.

The frontend and `/api/*` auth routes ship together. No separate backend host needed.

> Note: Vercel Hobby has a ~4.5 MB request body limit. Custom backgrounds up to 5 MB may need a smaller file or a paid plan.

## What syncs to MongoDB

When signed in:

- Study stopwatch history (daily totals)
- Tasks
- Settings / theme
- Custom image or video background (≤ 5 MB)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
