# Y-CHAP System Certification Audit Report

**Date:** 2026-09-13T00:41:56.982Z
**Target Environment:** Local API (http://localhost:8010/api/v1)
**Overall Result:** CERTIFIED PASS (100%)
**Total Assertions:** 39 | **Passed:** 39 | **Failed:** 0 | **Total Execution Time:** 859ms

## Executive Summary

The Y-CHAP End-to-End Certification Test Suite executed **39 automated assertions** spanning all 7 core functional engines with **zero regressions**.

| Test Suite | Total Assertions | Passed | Failed | Pass Rate | Execution Time |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Suite 1: Clinical Engine** | 10 | 10 | 0 | 100.0% | 72ms |
| **Suite 2: Move & Anti-Cheat** | 5 | 5 | 0 | 100.0% | 42ms |
| **Suite 3: Leaderboards** | 4 | 4 | 0 | 100.0% | 71ms |
| **Suite 4: Care Circle** | 6 | 6 | 0 | 100.0% | 72ms |
| **Suite 5: Nutrition & Sodium** | 6 | 6 | 0 | 100.0% | 51ms |
| **Suite 6: Gamification** | 3 | 3 | 0 | 100.0% | 351ms |
| **Suite 7: Onboarding & Demo** | 5 | 5 | 0 | 100.0% | 200ms |
| **OVERALL TOTAL** | **39** | **39** | **0** | **100.0%** | **859ms** |

## Detailed Assertion Log

### Suite 1: Clinical Engine

- [PASSED] **Assert Normal BP (118/76 mmHg) -> Category: Normal, uiToken: Fern** (9ms)
- [PASSED] **Assert Elevated BP (124/78 mmHg) -> Category: Elevated, uiToken: Saffron** (6ms)
- [PASSED] **Assert Stage 1 BP (134/84 mmHg) -> Category: High — Stage 1, uiToken: Saffron** (6ms)
- [PASSED] **Assert Stage 2 BP (144/92 mmHg) -> Category: High — Stage 2, uiToken: Clay** (6ms)
- [PASSED] **Assert Hypertensive Crisis (188/125 mmHg) -> Category: Hypertensive Crisis, uiToken: Clay, isCriticalAlert: true** (7ms)
- [PASSED] **Assert Fasting Normal Glucose (88 mg/dL) -> Category: Normal, uiToken: Fern** (9ms)
- [PASSED] **Assert Fasting Prediabetes (112 mg/dL) -> Category: Prediabetes, uiToken: Saffron** (7ms)
- [PASSED] **Assert Fasting Diabetes (135 mg/dL) -> Category: Diabetes, uiToken: Clay** (8ms)
- [PASSED] **Assert Hypoglycemia (62 mg/dL) -> Category: Hypoglycemia, uiToken: Clay** (5ms)
- [PASSED] **Assert Unit Conversion (5.5 mmol/L) -> Evaluated at 99.1 mg/dL, category Normal** (9ms)

### Suite 2: Move & Anti-Cheat

- [PASSED] **Assert Valid Walkathon (5.0 km, 45 min -> 6.67 km/h) -> isFlagged: false, co2: 0.96 kg** (13ms)
- [PASSED] **Assert Fraud Walkathon (10.0 km, 30 min -> 20.0 km/h > 12.0 km/h) -> isFlagged: true, co2: 0 kg** (6ms)
- [PASSED] **Assert Valid Cycling (20.0 km, 40 min -> 30.0 km/h <= 45.0 km/h) -> isFlagged: false, co2: 3.84 kg** (13ms)
- [PASSED] **Assert Fraud Cycling (30.0 km, 30 min -> 60.0 km/h > 45.0 km/h) -> isFlagged: true, co2: 0 kg** (6ms)
- [PASSED] **Assert /move/summary strictly excludes all flagged activities from verified distance & CO2 totals** (4ms)

### Suite 3: Leaderboards

- [PASSED] **Assert Individual Leaderboard ranks by verified distance and excludes fraud** (8ms)
- [PASSED] **Assert Teams Leaderboard verifies club member counts and aggregated team kilometers** (12ms)
- [PASSED] **Assert Campus Leaderboard verifies inter-university rankings** (11ms)
- [PASSED] **Assert Dynamic Join: Joining a new team recomputes team metrics in real-time** (40ms)

### Suite 4: Care Circle

- [PASSED] **Assert 6-character pairing code generation** (5ms)
- [PASSED] **Assert Code Acceptance (connecting diaspora relative to family member)** (25ms)
- [PASSED] **Assert Single-Use Security (re-entering used code returns 400 error)** (3ms)
- [PASSED] **Assert Self-Pairing Prevention (cannot pair with own account)** (8ms)
- [PASSED] **Assert Crisis Escalation Banner: Hypertensive Crisis triggers active crisis banner** (25ms)
- [PASSED] **Assert Link Revocation via DELETE endpoint** (6ms)

### Suite 5: Nutrition & Sodium

- [PASSED] **Assert Optimal Meal Scan (420 mg sodium) -> OPTIMAL (Fern)** (9ms)
- [PASSED] **Assert Moderate Meal Scan (650 mg sodium) -> MODERATE (Saffron)** (6ms)
- [PASSED] **Assert High Sodium Scan (890 mg sodium) -> EXCEEDS_LIMIT (Clay)** (6ms)
- [PASSED] **Assert Cooking Mode calculation (reduces sodium by 40%: 650mg -> 390mg)** (11ms)
- [PASSED] **Assert OCR Regex fallback parses sodium and calories from raw nutrition text** (10ms)
- [PASSED] **Assert Daily Nutrition Summary tracks today sodium against 1,500mg optimal and 2,300mg ceiling** (9ms)

### Suite 6: Gamification

- [PASSED] **Assert Catalog count: Exactly 100 achievements across 6 tiers (Common: 30, Uncommon: 25, Rare: 20, Epic: 12, Legendary: 8, Mythic: 5)** (0ms)
- [PASSED] **Assert Retroactive Reconciliation: Backfills Badge #3 (Walk), Badge #4 (First Spin), and BP/Glucose badges** (124ms)
- [PASSED] **Assert Compound Unique constraint: Repeated checks do not create duplicate unlock records** (227ms)

### Suite 7: Onboarding & Demo

- [PASSED] **Assert Guest Session creation (UNREGISTERED_GUEST)** (88ms)
- [PASSED] **Assert Logging vitals as a guest** (7ms)
- [PASSED] **Assert Claim Guest Account: Converts to ACTIVE_USER with zero data loss** (86ms)
- [PASSED] **Assert Sandbox Demo Mode toggle (isDemo: true)** (11ms)
- [PASSED] **Assert App 5-Star Rating submission** (8ms)

