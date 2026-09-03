# Test Credentials

No authentication/login flow exists by design. The app opens directly to a single
seeded demo user profile.

- Demo user: **Grace** (email: grace@vitality.app) — no password, not used for login.
- Seed script: `cd /app/server && yarn seed` (re-seeds Grace, 7-day activity logs,
  today's meals, 5 podcasts, 5-person leaderboard, 3 reminders).
