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
- All `/api/v1/{dashboard,activity,nutrition,user,community}/*` routes require
  `Authorization: Bearer <token>` (401 without it). `/api/v1/podcasts` list/detail are
  public; `POST /podcasts/:id/listen` requires auth.
- Seed script: `cd /app/server && npx ts-node src/seed.ts` (re-seeds ONLY Grace + her
  7-day activity logs/meals/podcasts/leaderboard/reminders — does not affect other
  registered users, but re-running will wipe ALL collections including other test users
  since it clears the full DB first).

### Per-user daily targets (session 11)
- Grace: stepGoal 15000, waterGoal 2000ml, calorieGoal 2000, macros protein/carbs/fat
  90/250/70g (all editable via Profile > pencil icon > Edit Profile modal).
- New/social accounts get the schema defaults (stepGoal 10000, same water/calorie/macros).

### Forgot / reset password (session 11)
- `POST /api/v1/auth/forgot-password {email}` returns `{message, resetToken}` if the
  email exists (token also logged to server console), or just `{message}` if not (no
  enumeration leak).
- `POST /api/v1/auth/reset-password {token, newPassword}` sets the new bcrypt password
  hash; 400 on invalid/expired token. Frontend modal auto-fills the token for one-flow
  demo testing.
- Session-expiry: any 401 on a protected route (not login/register/social/demo/forgot-
  password/reset-password/`user/password`) clears localStorage and redirects to `/login`
  with a toast.

### In-app password change (session 12)
- `PUT /api/v1/user/password {currentPassword, newPassword}` — verifies bcrypt hash,
  enforces 8+ char new password. Profile > Activity & Settings > "Change Password".
- Note: `/user/password` is excluded from the global 401-session-expiry interceptor so a
  wrong-current-password attempt shows an inline error instead of logging the user out.

### Leaderboard Today/This Week (session 12)
- `GET /api/v1/community/leaderboard?range=today|week` — today = live steps; week = sum
  of the user's real last-7-days ActivityLog steps vs each friend's separate seeded
  `weeklySteps` value (Liam 74300, Sofia 81200, Maya 76500, Noah 61800; Grace's real
  weekly sum from seed ≈ 62690) — rankings genuinely differ between the two tabs.
