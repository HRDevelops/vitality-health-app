# Test Credentials

## Auth flow (rewritten 2026-09-07 — real multi-tenant JWT auth)
Real per-user accounts with bcrypt-hashed passwords. Each registered/social account is
fully isolated (own steps, water, workouts, nutrition, streaks, reminders).

### Grace demo account (rich pre-seeded profile)
- Email: `grace.user@email.com`
- Password: `12345678`
- One-tap options on /login: **Fill Demo Credentials** button (auto-fills + auto-submits
  this login) or **Continue as Grace (Demo)** button (instant shortcut, same account).
- OLD email `grace@vitality.app` no longer works (replaced).

### New registrations
- `POST /api/v1/auth/register` with any unique email + name + password (6+ chars)
  creates a brand-new isolated user: 0 steps, 0ml water, empty workout/nutrition
  history, default macro goals, and a COPY of Grace's 3 default reminders as a starting
  template (editing them does not affect Grace's own reminders).
- Duplicate email registration returns 409.

### Social login simulation (no real OAuth)
- Google button → creates/reuses one dedicated account `google.user@vitality.demo`
  (no password; endpoint is `POST /api/v1/auth/social {"provider":"google"}`).
- Apple button → creates/reuses `apple.user@vitality.demo` (`provider":"apple"`).
- Idempotent: repeated Google/Apple sign-ins reuse the same account, not new ones.

### General
- `POST /api/v1/auth/login` checks bcrypt hash against ANY registered email.
- All `/api/v1/{dashboard,activity,nutrition,user}/*` routes require
  `Authorization: Bearer <token>` (401 without it). `/api/v1/podcasts` list/detail are
  public; `POST /podcasts/:id/listen` requires auth.
- Seed script: `cd /app/server && npx ts-node src/seed.ts` (re-seeds ONLY Grace + her
  7-day activity logs/meals/podcasts/leaderboard/reminders — does not affect other
  registered users, but re-running will wipe ALL collections including other test users
  since it clears the full DB first).
