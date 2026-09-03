# Test Credentials

## Auth flow (added 2026-09-03)
Simplified demo auth: ANY valid-format email + password (6+ chars) logs in successfully
— all paths resolve to Grace's single seeded profile. No real per-user accounts/passwords
are stored. Google/Apple buttons are simulated (1s delay, then logs in as Grace).

- **Continue as Grace (Demo)** button on /login — no credentials needed, one tap in.
- Email/password Sign In or Create Account: e.g. `anything@example.com` / `password123`
  (any valid email format + password length >= 6 works).
- Default behavior: fresh page load / new browser tab is ALWAYS auto-authenticated as
  Grace (by design, so tests never get blocked by a login wall). Logout only clears
  in-memory state for the current session — navigating within the same tab after logout
  correctly redirects to /login, but a hard reload logs back in as Grace automatically.

## Demo user
- Demo user: **Grace** (email: grace@vitality.app).
- Seed script: `cd /app/server && npx ts-node src/seed.ts` (re-seeds Grace, 7-day activity
  logs, today's meals, 5 podcasts, 5-person leaderboard, 3 reminders).
