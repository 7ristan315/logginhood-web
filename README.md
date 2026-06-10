# Logginhood Web

The web hub for archers, clubs, and scores — built with Next.js (App Router)
and Supabase. The companion to the [Logginhood](https://github.com/7ristan315/logginhood)
scoring app.

## Stack

- **Next.js** (App Router, JavaScript)
- **Tailwind CSS**
- **Supabase** — Postgres database, auth, and row-level security

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migration in
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates the `profiles`, `clubs`, `club_members`, and `scores` tables
   with row-level security policies.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key (Project Settings > API):

   ```bash
   cp .env.example .env.local
   ```

4. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## What's here

- `app/login`, `app/signup`, `app/auth/*` — Supabase email/password auth
- `app/dashboard` — a logged-in archer's score history
- `app/clubs`, `app/clubs/[id]` — browse/create/join clubs and view a club
  leaderboard
- `app/scores/new` — log a new round
- `lib/supabase` — browser, server, and middleware Supabase clients
- `lib/rounds.js` — round definitions (ends, arrows per end, scoring) ported
  from the Logginhood scoring app
- `supabase/migrations` — SQL schema

## Deploying

Push to GitHub and import the repo into [Vercel](https://vercel.com/new).
Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
environment variables in the Vercel project settings.
