# Y-CHAP Technical Architecture & System Invariants

## 1. Core Stack & Infrastructure

- **Backend**: Node.js + Express (TypeScript) in `/server`. Pattern: Controller -> Service -> Repository/Model.
- **Frontend**: React 18 + Vite (TypeScript) + Tailwind CSS in `/frontend`. Viewport strictly locked to mobile (max-w-md / 390px–430px canvas).
- **Database**: MongoDB via Mongoose (Local: `mongodb://127.0.0.1:27017/vitality`).
- **Auth Guard**: Dual-layer system (httpOnly cookie + Bearer token fallback in `client.ts`). Never delete the Bearer fallback.
- **Ports**: Backend `8010`, Frontend `3000`.

## 2. Design System & Clinical Standards

- **Font**: Manrope with tabular numerals (`tabular-nums`) for numeric data alignment.
- **Icons**: Lucide React line icons only (strictly zero emojis in clinical and data flows).
- **6-Token Palette**:
  - Pine (`#0B2B26`): Deep brand headers and primary navigation active states.
  - Fern (`#1E5E4D`): Success states, optimal BP/Glucose target zones.
  - Mist (`#E3EFE9`): Background tints, light borders, subtle card fills.
  - Bone (`#F8F9F5`): Canvas surface, high-contrast readable backgrounds.
  - Saffron (`#E29528`): Warnings, Elevated BP, Prediabetes glycemic zones.
  - Clay (`#C2452D`): Strictly reserved for clinical risk (Stage 2, Crisis, Hypoglycemia).
- **Clinical Boundary**: Strictly educational and monitoring support. Non-diagnostic disclaimer must render on all clinical cards and exports.

## 3. Clinical Rules & Computation Engines

### 3.1 Blood Pressure (AHA/ACC 2017)

Evaluates Systolic (S) and Diastolic (D) in mmHg. Assigned to the higher risk zone:

- **Normal**: S < 120 AND D < 80 (Fern)
- **Elevated**: S 120–129 AND D < 80 (Saffron)
- **Stage 1 Hypertension**: S 130–139 OR D 80–89 (Saffron)
- **Stage 2 Hypertension**: S >= 140 OR D >= 90 (Clay)
- **Hypertensive Crisis**: S > 180 AND/OR D > 120 (Clay + Trigger Emergency Modal + Immediate Physician Disclaimer)

### 3.2 Blood Glucose (ADA Guidelines)

Supports mg/dL (primary) and mmol/L (conversion: mg/dL = mmol/L \* 18.0182):

- **Hypoglycemia**: < 70 mg/dL (Clay)
- **Fasting Normal**: 70–99 mg/dL (Fern) | **Random Normal**: 70–139 mg/dL (Fern)
- **Fasting Prediabetes**: 100–125 mg/dL (Saffron) | **Random Prediabetes**: 140–199 mg/dL (Saffron)
- **Diabetes Range**: Fasting >= 126 mg/dL OR Random >= 200 mg/dL (Clay)

### 3.3 Move & Anti-Cheat Engine

- Metric: Distance (km) and CO2 savings (`distance_km * 0.192 kg CO2`). Raw step count is excluded.
- Modes: `WALKATHON` and `CYCLING`.
- Anti-Cheat Pace Validation:
  - Walkathon speed > 12.0 km/h: Flagged as motorized vehicle fraud.
  - Cycling speed > 45.0 km/h: Flagged as motorized vehicle fraud.
  - Flagged activities void CO2/distance credit and increment user `strikeCount`.

## 4. Mongoose Data Schemas

```typescript
// HealthMetric: models/HealthMetric.ts
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['blood_pressure', 'blood_glucose'], required: true, index: true },
  systolic: { type: Number },
  diastolic: { type: Number },
  pulse: { type: Number },
  glucoseValue: { type: Number },
  glucoseUnit: { type: String, enum: ['MG_DL', 'MMOL_L'], default: 'MG_DL' },
  isFasting: { type: Boolean, default: false },
  category: { type: String, required: true },
  uiToken: { type: String, enum: ['Fern', 'Saffron', 'Clay'], required: true },
  isCriticalAlert: { type: Boolean, default: false },
  notes: { type: String, maxlength: 280 },
  loggedAt: { type: Date, default: Date.now, index: true }
}

// MoveActivity: models/MoveActivity.ts
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

// CareCircle: models/CareCircle.ts
{
  observerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Diaspora relative
  subjectId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Family member
  relationship: { type: String, required: true },
  accessLevel: { type: String, enum: ['VIEW_VITALS', 'EMERGENCY_ONLY'], default: 'VIEW_VITALS' },
  createdAt: { type: Date, default: Date.now }
}
```
