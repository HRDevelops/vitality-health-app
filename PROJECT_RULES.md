# Y-CHAP Architecture & System Invariants

## Core Principles
1. **Backend Stack**: Node.js + Express (TypeScript) located in `/server`. Do NOT modify `/backend/server.py` unless explicitly directed (it is a legacy gateway shim).
2. **Frontend Stack**: React 18 + Vite (TypeScript) + Tailwind CSS located in `/frontend`. Must maintain a strict mobile-first viewport (max-w-md / 390px-430px canvas).
3. **Database**: MongoDB via Mongoose. Connection string is managed in `/server/.env`.
4. **Authentication**: Dual-layer (httpOnly cookies with strict fallback to `Authorization: Bearer <token>` in `frontend/src/services/api/client.ts`). Never remove the Bearer token fallback.
5. **Ports**:
   - Express Backend: `http://localhost:8010`
   - Vite Frontend: `http://localhost:3000`
   - MongoDB Local: `mongodb://127.0.0.1:27017/vitality`

## Feature Specifications (Y-CHAP Migration)
- **Move Tab**: Distance (km) and estimated CO2 offset tracking (replacing raw step counts) with pace/speed anti-cheat filters (flagging speeds > 30 km/h).
- **Health Tab**: Color-coded clinical zones for Blood Pressure (AHA/ACC 2017: Normal, Elevated, Stage 1, Stage 2, Crisis) and Blood Glucose (ADA: Fasting, Post-Prandial, Bedtime).
- **Community & Family**: Care Circle role-based remote monitoring with permission-gated read access.
- **Heart Plate**: DASH-diet aligned sodium tracking (<1,500mg/day optimal, <2,300mg/day limit).