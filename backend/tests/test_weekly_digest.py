# Weekly Digest endpoint regression test
import os
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
API = f"{BASE_URL}/api/v1"


def _token():
    r = requests.post(f"{API}/auth/demo", timeout=15)
    assert r.status_code == 200
    return r.json()["token"]


def test_weekly_digest_returns_all_fields():
    token = _token()
    r = requests.get(
        f"{API}/dashboard/weekly-digest",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    required = [
        "startDate", "endDate", "totalSteps", "bestStepDay",
        "totalCaloriesConsumed", "macroAdherencePercent",
        "mindfulnessMinutes", "podcastSessionsCompleted",
        "podcastStreakCount", "milestones",
    ]
    for k in required:
        assert k in data, f"Missing field {k}"
    best = data["bestStepDay"]
    assert "date" in best and "label" in best and "steps" in best
    assert isinstance(data["milestones"], list)
    assert isinstance(data["totalSteps"], int)


def test_weekly_digest_without_auth_returns_data():
    # Per prior test context, API is open; auth is only a client-side gate.
    r = requests.get(f"{API}/dashboard/weekly-digest", timeout=15)
    assert r.status_code == 200
