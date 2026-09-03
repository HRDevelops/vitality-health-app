# Vitality — Health & Fitness App

A high-fidelity, mobile-first health & fitness web app: step tracking, nutrition
journaling, guided workouts, mindfulness podcasts, and social/gamified progress —
built as a decoupled **React (Vite)** client talking to a **Node.js/Express** REST
API backed by **MongoDB**.

## Architecture Overview

```
┌─────────────────────────┐        REST /api/v1/*        ┌──────────────────────────┐
│   client (Vite + React) │ ────────────────────────────▶ │  server (Express + TS)   │
│   TypeScript + Tailwind │ ◀──────────────────────────── │  Repository→Service→     │
│   TanStack Query        │            JSON                │  Controller pattern      │
└─────────────────────────┘                                └───────────┬──────────────┘
                                                                          │ Mongoose
                                                                          ▼
                                                              ┌──────────────────────┐
                                                              │      MongoDB          │
                                                              │ User / ActivityLog /  │
                                                              │ NutritionLog /        │
                                                              │ Podcast / Reminder /  │
                                                              │ CommunityMember       │
                                                              └──────────────────────┘
```

The client **never** talks to the database directly — every read/write goes through
the versioned `/api/v1` REST surface, keeping the frontend and backend fully decoupled.

### Backend layers (Repository Pattern)
- **`repositories/`** — pure Mongoose data access (no business logic).
- **`services/`** — business logic, aggregation, calculations (macro %, streaks, etc.).
- **`controllers/`** — HTTP request/response handling, status codes, validation errors.
- **`routes/`** — Express routers, all mounted under `/api/v1`.

> **Infra note:** this workspace's process supervisor expects a Python/FastAPI
> process on port 8001. Since this backend is Node/Express, `server.py` (Python) acts
> as a **thin reverse-proxy shim** — on boot it spawns the real Express app as a child
> process on an internal port and transparently forwards every `/api/*` request to it.
> All business logic lives in the Express app; the shim contains none.

## Feature Highlights

| Screen | Route | Highlights |
|---|---|---|
| **Dashboard** | `/dashboard` | Health score ring, dismissible weekly milestone banner, 4 live metric cards (calories, weight, water, steps), health score breakdown modal, notifications |
| **Explore Fitness** | `/explore` | Live search + category filtering of workouts, workout detail sheets with a 3-step preview and one-tap activity logging, topic shortcuts |
| **Mindfulness / Podcast** | `/wellness/podcast` | Daily-pick hero player, searchable/filterable episode grid, premium paywall on locked tracks, **persistent mini-player** that follows you to any other tab |
| **Nutrition Journal** | `/nutrition` | Weekly day picker, live meal search, macro progress bars, meal detail sheets, quick "add meal" flow |
| **Activity Tracker** | `/activity` | Steps progress ring, Daily/Week/Month trend chart, tappable quick-metric tiles opening a detailed insight breakdown |
| **Add Action** (global FAB) | overlay | Add Meal / Add Workout / Add Drink / Update Weight / Set Reminder — opens as a floating overlay without losing your place |
| **Profile & Community** | `/profile` | Biometrics, editable profile & weight, friends leaderboard, reminders with toggles, achievements/badges (some computed live from real activity data), app settings, subscription upsell |

## Local Development Setup

### Prerequisites
- Node.js 20+, Yarn 1.x
- MongoDB running locally (or any reachable `MONGO_URL`)

### Ports & processes
| Process | Directory | Port | Command |
|---|---|---|---|
| Client (Vite) | `frontend/` | `3000` | `yarn dev` |
| Server (Express) | `server/` | internal (proxied) | `yarn dev` |
| Gateway shim (FastAPI) | `backend/` | `8001` | `uvicorn server:app` (spawns the Express server automatically) |

### Environment variables
**`backend/.env`** (read by the gateway shim, values are also inherited by the Express process):
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=vitality_health_app
NODE_SERVER_PORT=8090
```

**`frontend/.env`**:
```
REACT_APP_BACKEND_URL=<public backend URL>
VITE_BACKEND_URL=<public backend URL>       # actually consumed by the client at runtime
```

### Install & seed
```bash
cd server && yarn install && yarn seed   # creates demo user "Grace", 7 days of
                                          # activity, today's meals, podcasts,
                                          # leaderboard and reminders
cd ../frontend && yarn install
```

### Run
In this workspace both processes are managed by the platform's process supervisor.
For a fully standalone run outside this workspace:
```bash
# terminal 1
cd server && yarn dev

# terminal 2
cd frontend && yarn dev
```

### Type-checking
```bash
cd server && yarn typecheck
cd frontend && yarn typecheck
```

## REST API Reference

All endpoints are prefixed with `/api/v1`. No authentication — the app operates as a
single seeded demo user ("Grace").

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check for the Express app |
| `GET` | `/dashboard/metrics` | Aggregated health score, steps, water, calories consumed for today |
| `GET` | `/activity/daily?date=YYYY-MM-DD` | Steps/calories/distance/active-minutes for a given day (defaults to today) |
| `GET` | `/activity/trends?range=week\|month` | Step trend series for charting |
| `POST` | `/activity/water` | Body `{ amountMl }` — increments today's water intake |
| `POST` | `/activity/log` | Body `{ steps?, caloriesBurned?, distanceKm?, activeMinutes? }` — logs a workout |
| `GET` | `/nutrition/logs?date=YYYY-MM-DD` | Meals grouped by type + macro breakdown for a day |
| `POST` | `/nutrition/logs` | Body `{ mealType, foodName, calories, carbsGrams?, proteinGrams?, fatGrams?, logDate? }` — logs a meal |
| `GET` | `/podcasts` | All podcast tracks |
| `GET` | `/podcasts/:id` | Single podcast track |
| `GET` | `/user/profile` | Current user's profile |
| `PUT` | `/user/profile` | Body `{ name?, heightCm?, targetWeightKg? }` — updates profile/biometrics |
| `PUT` | `/user/weight` | Body `{ weightKg }` — logs a new current weight |
| `GET` | `/user/reminders` | All reminders for the current user |
| `PUT` | `/user/reminders/:id` | Body `{ enabled }` — toggles a reminder |
| `GET` | `/community/leaderboard` | Friends leaderboard ranked by steps |

All responses are JSON. Validation errors (e.g. an invalid `mealType`) return
`400` with a `{ message }` body; unexpected errors return `500`.

## Data Model (MongoDB / Mongoose)
- **User** — profile, biometrics, health score
- **ActivityLog** — one document per `(user, date)`: steps, calories, distance, active minutes, water
- **NutritionLog** — one document per meal item logged
- **Podcast** — episode catalog (free/premium, category, daily pick flag)
- **CommunityMember** — leaderboard entries
- **Reminder** — user reminders with enable/disable state

## Tech Stack
- **Client:** Vite, React 18, TypeScript, Tailwind CSS, TanStack Query, React Router 6, lucide-react
- **Server:** Node.js, Express, TypeScript, Mongoose
- **Database:** MongoDB
