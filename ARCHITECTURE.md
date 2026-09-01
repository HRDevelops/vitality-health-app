# Vitality Health & Fitness App — System Architecture & Implementation Contract

## 1. System Overview & Architectural Guardrails
This project strictly decouples the Presentation Layer (Frontend), Business / Application Layer (Backend API), and Persistence Layer (Database).

[ Client (React + TS + Tailwind) ] 
       ¦ (REST JSON via /api/v1/*)
       ?
[ Server (Node.js/Express + TS) ] 
       ¦ (Controllers -> Services -> Repositories)
       ?
[ Database (PostgreSQL via Prisma ORM) ]

### Decoupling Rules
- Zero Direct DB Access in UI: The React frontend must never import ORM clients, query databases, or contain backend secrets.
- Repository Pattern: All database interactions in server/ must go through isolated repository interfaces (NutritionRepository, ActivityRepository, UserRepository, PodcastRepository). Controllers handle HTTP requests/responses only.
- Strict Typing: Shared TypeScript domain contracts across frontend hooks and backend service layers.

---

## 2. Presentation Layer (/client)

### Source Screens & Conversion Target
The frontend converts the raw HTML exports located in client/raw_stitch_screens/ into modular, reusable React components:

1. dashboard_v2/code.html -> client/src/features/dashboard/Dashboard.tsx
2. explore_fitness_v2/code.html -> client/src/features/explore/ExploreFitness.tsx
3. mindfulness_podcast_v2/code.html -> client/src/features/wellness/MindfulnessPodcast.tsx
4. nutrition_journal_v2/code.html -> client/src/features/nutrition/NutritionJournal.tsx
5. activity_tracker_v2/code.html -> client/src/features/activity/ActivityTracker.tsx
6. add_action_menu_v2/code.html -> client/src/features/actions/AddActionModal.tsx
7. user_profile_v2/code.html -> client/src/features/profile/UserProfile.tsx

### Core Layout & Navigation
- Global Layout Shell: client/src/core/components/AppLayout.tsx wraps the persistent bottom navigation bar and the central floating action button [+].
- Bottom Navigation Tabs:
  - Home (/dashboard)
  - Explore (/explore)
  - Activity (/activity)
  - Profile (/profile)
- Central Action Button [+]: Opens AddActionModal as an overlay modal without unmounting or resetting the current active view.
- Back-Stack Contract: All top-bar back arrow buttons [<] must trigger navigate(-1) / history stack pop rather than redirecting hardcoded to /dashboard.

### Styling & Design Tokens
Incorporate color tokens, typography scales, and component radii defined in client/raw_stitch_screens/vibrant_wellness/DESIGN.md into client/tailwind.config.js.

---

## 3. Persistence Layer (/db)

### Entity-Relationship Models
The database engine is PostgreSQL managed via Prisma ORM (db/schema.prisma).

- User & Metrics: User profile, target weight, current weight, health score.
- ActivityLogs: Daily steps, active minutes, calories burned, distance.
- NutritionLogs: Meals consumed, calorie breakdown, macro grams (protein, carbs, fat).
- Podcasts & Tracks: Wellness audio tracks, authors, locked/premium statuses.

---

## 4. Backend API Layer (/server)

### Standard REST Endpoints (/api/v1)
- Dashboard: GET /api/v1/dashboard/metrics
- Activity:
  - GET /api/v1/activity/daily?date=YYYY-MM-DD
  - GET /api/v1/activity/trends?range=week|month
- Nutrition:
  - GET /api/v1/nutrition/logs?date=YYYY-MM-DD
  - POST /api/v1/nutrition/logs
- Wellness / Podcasts:
  - GET /api/v1/podcasts
  - GET /api/v1/podcasts/:id
- User Profile:
  - GET /api/v1/user/profile
  - PUT /api/v1/user/weight
