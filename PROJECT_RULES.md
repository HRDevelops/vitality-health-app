# Y-CHAP Technical Architecture & Complete Product Specification

## 1. System Invariants & Infrastructure

- **Stack**: Node.js + Express (TypeScript) in `/server`, React 18 + Vite (TypeScript) + Tailwind CSS in `/frontend`.
- **Architecture**: Strict Controller -> Service -> Model/Repository pattern in `/server`.
- **Database**: MongoDB via Mongoose (Local dev: `mongodb://127.0.0.1:27017/vitality`).
- **Auth Guard**: Dual-layer (httpOnly cookies with strict fallback to `Authorization: Bearer <token>` in `frontend/src/services/api/client.ts`). Never modify or remove this fallback.
- **Runtime Ports**: Backend `8010`, Frontend `3000`.
- **Viewport**: Mobile-first layout strictly bounded to 390px–430px canvas (`max-w-md mx-auto min-h-screen`).
- **Legal Boundary**: Educational and monitoring support only (Non-Diagnostic). Every clinical screen, reading modal, and export MUST display:
  > _"Educational & tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care."_

## 2. Design System & Tokens

- **Typography**: Manrope font with `tabular-nums` enabled across all metric values, charts, timers, and tables for strict vertical numeric alignment.
- **Icons**: Lucide React line icons only. **Strictly ZERO emojis** in clinical cards, forms, logs, and system alerts.
- **6-Token Clinical Palette**:
  - Pine (`#0B2B26`): Deep brand surfaces, primary navigation active states, high-contrast headings.
  - Fern (`#1E5E4D`): Success states, optimal BP/Glucose target zones.
  - Mist (`#E3EFE9`): Background tints, light borders, subtle card fills.
  - Bone (`#F8F9F5`): Canvas background surface, neutral high-readability containers.
  - Saffron (`#E29528`): Warnings, Elevated BP, Stage 1 Hypertension, Prediabetes glycemic zones.
  - Clay (`#C2452D`): **Strictly reserved for genuine clinical alerts** (Stage 2, Hypertensive Crisis, Hypoglycemia).

## 3. Clinical Engines & Logic Rules

### 3.1 Blood Pressure Engine (AHA/ACC 2017 Guidelines)

Evaluates Systolic (S) and Diastolic (D) in mmHg. Assigned to the higher risk zone:

- **Normal**: S < 120 AND D < 80 | Token: `Fern` | Action: Standard log confirmation.
- **Elevated**: S 120–129 AND D < 80 | Token: `Saffron` | Action: Activity nudge & lifestyle tips.
- **High — Stage 1**: S 130–139 OR D 80–89 | Token: `Saffron` | Action: DASH diet recommendation & tracking prompt.
- **High — Stage 2**: S >= 140 OR D >= 90 | Token: `Clay` | Action: High reading alert, prompt to schedule clinical checkup.
- **Hypertensive Crisis**: S > 180 AND/OR D > 120 | Token: `Clay` | Action: **Intercept UI with full-screen emergency care prompt & clinical disclaimer modal**. Flag `isCriticalAlert: true`.

### 3.2 Blood Glucose Engine (ADA Guidelines)

Supports dual units: `mg/dL` (internal storage) and `mmol/L` (UI toggle: `mg/dL = mmol/L * 18.0182`).

- **Low (Hypoglycemia)**: < 70 mg/dL (< 3.9 mmol/L) | Token: `Clay` | Action: Hypoglycemia warning, prompt immediate fast-acting carb intake and re-test.
- **Normal**:
  - Fasting: 70–99 mg/dL (3.9–5.5 mmol/L) | Token: `Fern`
  - Random / Post-Prandial: 70–139 mg/dL (3.9–7.7 mmol/L) | Token: `Fern`
- **Prediabetes**:
  - Fasting: 100–125 mg/dL (5.6–6.9 mmol/L) | Token: `Saffron`
  - Random / Post-Prandial: 140–199 mg/dL (7.8–11.0 mmol/L) | Token: `Saffron`
- **Diabetes Range**:
  - Fasting: >= 126 mg/dL (>= 7.0 mmol/L) | Token: `Clay`
  - Random / Post-Prandial: >= 200 mg/dL (>= 11.1 mmol/L) | Token: `Clay` | Action: Physician consultation advisory.

### 3.3 Move & Anti-Cheat Engine

- **Primary Metrics**: Distance (`km`) and CO2 offset (`co2_kg = distance_km * 0.192`). **Raw step counting is completely excluded.**
- **Modes**: `WALKATHON` and `CYCLING`.
- **Anti-Cheat Validation**:
  - Walkathon pace threshold: Average speed > 12.0 km/h is flagged as motorized vehicle fraud.
  - Cycling pace threshold: Average speed > 45.0 km/h is flagged as motorized vehicle fraud.
  - System Action on Fraud: Void distance and CO2 credit, increment user `strikeCount`, and set `isFlagged: true`.

### 3.4 Evidence & Population Data Anchors

Clinical stat cards rendered on Home/Health tabs:

- Hypertension Burden: ~1.4 billion adults live with hypertension worldwide.
- Mortality Impact: High systolic BP contributes to ~10.8 million deaths annually.
- Activity Efficacy: Physical activity reduces hypertension risk by ~19% (high vs. low) and ~11% (moderate vs. low).

### 3.5 Heart Plate & Product Scanner Engine

- **Heart Plate**: Photo meal scan evaluating sodium density against DASH diet rules (<1,500 mg/day optimal, <2,300 mg/day limit). Includes Cooking Mode and Calorie Ring Card.
- **Product Scanner**: Packaged food & cosmetics scanning via camera with OCR label fallback and lab-verified scoring.

## 4. Complete Mongoose Schemas

```typescript
// 1. User: models/User.ts (extensions to existing schema)
{
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  universityId: { type: Schema.Types.ObjectId, ref: 'University' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  accountStatus: { type: String, enum: ['UNREGISTERED_GUEST', 'ACTIVE_USER'], default: 'ACTIVE_USER' },
  strikeCount: { type: Number, default: 0 },
  isDemo: { type: Boolean, default: false }
}

// 2. HealthMetric: models/HealthMetric.ts
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['blood_pressure', 'blood_glucose'], required: true, index: true },
  systolic: { type: Number },
  diastolic: { type: Number },
  pulse: { type: Number },
  glucoseValue: { type: Number }, // stored in mg/dL
  glucoseUnit: { type: String, enum: ['MG_DL', 'MMOL_L'], default: 'MG_DL' },
  isFasting: { type: Boolean, default: false },
  category: { type: String, required: true },
  uiToken: { type: String, enum: ['Fern', 'Saffron', 'Clay'], required: true },
  isCriticalAlert: { type: Boolean, default: false },
  notes: { type: String, maxlength: 280 },
  loggedAt: { type: Date, default: Date.now, index: true }
}

// 3. MoveActivity: models/MoveActivity.ts
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activityType: { type: String, enum: ['WALKATHON', 'CYCLING'], required: true },
  distanceKm: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  co2SavingsKg: { type: Number, required: true },
  averagePaceKmh: { type: Number, required: true },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  loggedAt: { type: Date, default: Date.now, index: true }
}

// 4. CareCircleLink: models/CareCircleLink.ts
{
  observerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Diaspora relative
  subjectId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },   // Family member back home
  relationshipType: { type: String, required: true },
  accessLevel: { type: String, enum: ['VIEW_VITALS', 'EMERGENCY_ONLY'], default: 'VIEW_VITALS' },
  createdAt: { type: Date, default: Date.now }
}

// 5. ProductScan: models/ProductScan.ts
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scanType: { type: String, enum: ['HEART_PLATE', 'PRODUCT'], required: true },
  imageUrl: { type: String },
  ocrText: { type: String },
  labVerifiedScore: { type: Number },
  sodiumMg: { type: Number },
  scannedAt: { type: Date, default: Date.now }
}

// 6. UserAchievement: models/UserAchievement.ts
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  achievementId: { type: Number, required: true },
  rarity: { type: String, enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'], required: true },
  unlockedAt: { type: Date, default: Date.now }
}
```
