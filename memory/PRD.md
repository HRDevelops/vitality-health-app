# Vitality Health & Fitness App — PRD / Memory

## Original problem statement
Implement "Vitality Health & Fitness App" as a mobile-first responsive web app
(React + Vite + TypeScript + Tailwind CSS) backed by a decoupled REST API,
converting 7 raw Stitch HTML templates (`client/raw_stitch_screens/`) per
`ARCHITECTURE.md` and `client/raw_stitch_screens/vibrant_wellness/DESIGN.md`.
Source repo: https://github.com/HRDevelops/vitality-health-app.git

## User choices (gathered upfront)
- Database: **MongoDB (Mongoose)** instead of Postgres/Prisma (platform fit).
- Screens: converted exactly from the cloned repo's raw_stitch_screens + ARCHITECTURE.md.
- Auth: **none** — single seeded demo user "Grace", no login/signup.
- Data: all mocked/seeded, no real 3rd-party integrations.
- Backend: **Node.js/Express + TypeScript**, Repository → Service → Controller pattern.

## Architecture (adapted to Emergent's supervisor constraints)
- Supervisor's `backend` program is hardcoded to run `uvicorn server:app` on port 8001
  from `/app/backend`. Since the real backend is Node/Express (per user's explicit
  choice), `/app/backend/server.py` is a thin FastAPI reverse-proxy shim: on startup it
  spawns the real Express app (`/app/server`, `yarn dev` → `ts-node src/index.ts`) as a
  child process on an internal port (`NODE_SERVER_PORT` in `/app/backend/.env`, currently
  **8090** — NOTE: port 8010 collides with an unrelated platform system process, do not
  reuse it) and transparently proxies every `/api/*` request to it. Zero business logic
  lives in server.py.
- `/app/frontend` is the Vite + React + TS + Tailwind client (maps to the platform's
  `frontend` supervisor slot, port 3000). Internal structure mirrors the spec's
  `client/src/{core,features,services/api}` layout.
- `/app/server` is the real Express + TS backend: `src/models` (Mongoose schemas with
  `toJSON` transform for `_id`→`id`), `src/repositories`, `src/services`,
  `src/controllers`, `src/routes` (mounted at `/api/v1`), `src/seed.ts`.
- MongoDB via `MONGO_URL`/`DB_NAME` in `/app/backend/.env` (`vitality_health_app` db).
- Frontend env: `REACT_APP_BACKEND_URL` (protected/platform-managed) and
  `VITE_BACKEND_URL` (actually consumed by the Vite client code, in
  `src/services/api/client.ts`) — **must be kept in sync manually**, platform only
  auto-syncs `REACT_APP_BACKEND_URL`.

## What's been implemented (as of 2026-09-03)
- 7 screens: Dashboard, Explore Fitness, Mindfulness/Podcast, Nutrition Journal,
  Activity Tracker, Add Action Modal (global overlay), User Profile.
- Persistent `AppLayout` (bottom nav + FAB) via `ActionModalContext`; back buttons use
  `navigate(-1)`.
- REST API: `/api/v1/dashboard/metrics`, `/activity/daily|trends|water|log`,
  `/nutrition/logs` (GET/POST), `/podcasts`, `/podcasts/:id`, `/user/profile|weight`,
  `/user/reminders` (GET/PUT), `/community/leaderboard`.
- Seed data: Grace (health score 84), 7-day step trends, today's breakfast/lunch meals,
  5 podcast tracks (2 free, 2 premium, 1 daily pick), 5-member leaderboard, 3 reminders.
- Fixed critical infra bugs: port 8010 collision with platform system process (moved to
  8090), Vite/PostCSS ESM-vs-CJS crash (removed `"type":"module"`), `ts-node-dev
  --respawn` orphaned processes (switched to plain `ts-node`), stale `VITE_BACKEND_URL`.
- Tested via testing_agent: 14/14 backend endpoints pass, all 7 frontend screens verified
  end-to-end with real seeded data, no critical issues.

## Known minor items (non-blocking, deferred)
- `POST /api/v1/nutrition/logs` returns 500 instead of 400 on invalid `mealType` enum
  (Mongoose ValidationError not mapped to 400).
- React Router v6 future-flag console warnings (cosmetic).

## What's been implemented (as of 2026-09-03, session 2)
- Notification Deep Links: tapping n1/n2/n3 in NotificationsSheet marks read, closes sheet,
  and navigates: n1 -> /profile (auto-scrolls to #friends-leaderboard-section), n2 ->
  /dashboard + opens Quick Actions modal, n3 -> /wellness/podcast.
- Workout History: ActivityLog model gained `workouts` subdocument array (title,
  caloriesBurned, activeMinutes, distanceKm, loggedAt). POST /activity/log now accepts
  `title` and pushes an entry while incrementing daily aggregates in one write. Activity
  Tracker screen shows a "Today's Workouts" section (cards or empty state) that
  auto-refreshes via React Query invalidation.
- Real Podcast Progress: User model gained `podcastSessionsCompleted` (seeded at 2). New
  POST /podcasts/:id/listen increments it; AudioPlayerContext calls this on every new
  track play. AchievementsModal's "Mindful Master" badge is now fully dynamic
  (`min(count,3)/3`, unlocks at 3) instead of hardcoded "unlocked".
- Confetti Moments: added `canvas-confetti` package + `/frontend/src/lib/celebration.ts`
  (`triggerCelebration()`, 2s dual burst, brand palette). Wired into: workout logged
  (always), water logged when crossing the 2000ml goal threshold, podcast session hitting
  3/3, and AchievementsModal detecting a newly-unlocked badge (tracked via localStorage
  key `vitality_unlocked_badges`) with a "🎉 Milestone Unlocked!" toast.
- Verified Mini-Player positioning (bottom-20 left-4 right-4 z-50, truncate on title) was
  already correct from prior session — no change needed, confirmed via testing_agent.
- Tested via testing_agent (iteration_6): backend 20/20 pytest, frontend all 5 features
  verified end-to-end. Fixed 1 minor cosmetic bug (uncapped "4/3" numerator after unlock).

- Workout Delete (2026-09-03): ActivityLog.workouts subdocs now retain `_id` and `steps`
  (was `_id:false`, no steps). New `DELETE /activity/workout/:workoutId` finds the entry,
  decrements steps/caloriesBurned/distanceKm/activeMinutes by its exact values, then $pull
  removes it; returns 404 "Workout not found" if missing. Frontend: trash icon per workout
  card in Today's Workouts (`todays-workout-delete-{i}`), `useDeleteWorkout()` hook
  invalidates SYNC_KEYS + shows "Workout removed" toast. Tested 100% pass (backend 6/6,
  frontend E2E) via testing_agent iteration_8, no regressions.
- Known non-blocking code review note: removeWorkoutEntry is findOne+findOneAndUpdate
  (not atomic) — fine for single-user demo, would need a transaction for multi-user.
- Iteration 9 features (2026-09-03): Undo Delete for Workouts (5s toast with Undo action
  re-logs via useLogWorkout, ToastContext extended to support {action,duration} while
  staying backward compatible), Session Streaks Badge (User.podcastStreakCount +
  lastListenDate track consecutive-day podcast listening; new "Mindful Streak" badge in
  AchievementsModal), Weekly Confetti Recap (tapping WeeklyRecapBanner fires
  triggerCelebration()+toast, X dismiss uses stopPropagation), In-App Reminder Push Nudge
  (new ReminderNudge.tsx mounted in AppLayout, checks enabled reminders whose time has
  passed + not yet nudged today via localStorage, shows toast with "Got it" action).
  Tested 100% pass (backend 5/5 new + 22/22 regression, frontend E2E) via testing_agent
  iteration_9. Fixed 2 low-priority issues it flagged: rounded distanceKm to 1 decimal in
  ActivityService.getDaily, and normalized POST /activity/log to return the full
  getDaily() shape ({id,...} workouts) instead of the raw Mongo doc for API consistency.
- Known non-blocking note: ReminderNudge's localStorage nudge key uses UTC date
  (toISOString slice) so it resets at UTC midnight, not local midnight — low priority.
- Auth & Onboarding flow (2026-09-03): New /login and /signup routes (shared
  AuthScreen.tsx component, mode prop), AuthContext (localStorage-persisted
  token+user, isAuthenticated defaults true via in-memory-only loggedOut flag so
  fresh loads/tests never hit a login wall), ProtectedRoute wraps the existing
  AppLayout route group in App.tsx (all 7 screens unchanged, just nested one level
  deeper). Backend: POST /api/v1/auth/{login,signup,demo} + GET /auth/me issue JWTs
  via jsonwebtoken (JWT_SECRET in backend/.env) — SIMPLIFIED DEMO SCOPE per explicit
  user choice: any valid-format email/password resolves to Grace's single profile,
  no real multi-user accounts. Google/Apple buttons + Forgot Password modal are
  UI-only simulations (no real OAuth/email). Logout clears in-memory auth state only
  (redirects to /login, but a hard reload auto-re-logs-in as Grace by design).
  Tested 100% pass (backend 9/9 pytest, frontend E2E incl. regression) via
  testing_agent iteration_10. Fixed 1 minor UX issue: added `noValidate` to the auth
  form so the styled inline error always shows instead of native browser tooltips.
- Map Mongoose ValidationErrors to 400 responses across controllers.
- Opt into React Router v7 future flags.
- Real health-score-history detail view (currently static placeholder).
- App Settings screen content.
- Consider making POST /podcasts/:id/listen idempotent per-track-per-day (currently
  increments on every play click, not just unique sessions) — deferred, non-blocking.

## What's been implemented (as of 2026-09-03, session 3 — fork resume)
- Root cause of prior session's "abrupt stop": the Express backend runs via plain
  `ts-node` with no file watcher, so the previously-coded `/dashboard/weekly-digest`
  route was 404ing until `sudo supervisorctl restart backend` was run this session.
  Verified 200 OK via curl post-restart.
- Signup Name Persistence: AuthContext gained `displayName`/`setDisplayName`
  (localStorage key `vitality_display_name`). AuthScreen signup calls
  `setDisplayName(name)` + toasts "Welcome to Vitality, {name}!"; login toasts
  "Welcome back, {displayName}!" if a name was previously persisted. Dashboard
  greeting header now reads `displayName ?? data?.greetingName` (falls back to
  "Grace" from backend if no local name yet) — cosmetic personalization layer only,
  backend/profile data still always Grace's, per explicit demo-scope user choice.
- Shareable Weekly Digest: WeeklyDigestModal gained a "Share Digest" button
  (`weekly-digest-share-button`) — uses `navigator.share()` when available, falls
  back to `navigator.clipboard.writeText()` + toast "Weekly digest copied to
  clipboard!", or a graceful "Unable to share right now." toast if neither works.
- Fixed low-priority toast race: ReminderNudge's initial reminder check now fires
  after a 4s delay (was immediate on mount) so it no longer overwrites the
  welcome/login toast that fires right after auth navigation.
- Tested via testing_agent (iteration_11): backend 41/41 pytest (added
  test_weekly_digest.py), frontend 100% — signup name persistence, Remember Me
  visibility/persistence, Weekly Digest Modal + Share button (success + fallback
  paths), Mindful Streak Flame icon, full regression on dashboard/activity/profile/
  podcast/auth. No critical or minor bugs; only a cosmetic toast-overlap note which
  was fixed post-test (see above, not re-tested but is a 1-line, low-risk timing
  change).
