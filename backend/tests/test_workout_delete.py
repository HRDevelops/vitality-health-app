"""Backend tests for Workout Delete feature (POST /activity/log, GET /activity/daily, DELETE /activity/workout/:id)."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://health-hub-802.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api/v1"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _get_daily(client):
    r = client.get(f"{API}/activity/daily")
    assert r.status_code == 200, r.text
    return r.json()


def test_daily_shape(client):
    d = _get_daily(client)
    assert "workouts" in d
    for w in d["workouts"]:
        for k in ("id", "title", "steps", "caloriesBurned", "activeMinutes", "distanceKm", "loggedAt"):
            assert k in w, f"missing field {k} in workout: {w}"
        assert isinstance(w["id"], str)


def test_log_workout_returns_steps_and_id(client):
    baseline = _get_daily(client)
    payload = {"title": "TEST_Gym", "steps": 800, "caloriesBurned": 250, "distanceKm": 0.4, "activeMinutes": 45}
    r = client.post(f"{API}/activity/log", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert "workouts" in body and len(body["workouts"]) >= 1
    last = body["workouts"][-1]
    assert last.get("steps") == 800
    assert last.get("_id") or last.get("id"), f"expected _id/id in workout entry: {last}"
    # Aggregates increased
    assert body["steps"] == baseline["steps"] + 800
    assert body["caloriesBurned"] == baseline["caloriesBurned"] + 250
    assert body["activeMinutes"] == baseline["activeMinutes"] + 45
    assert round(body["distanceKm"] - baseline["distanceKm"], 2) == 0.4


def test_delete_workout_decrements_and_removes(client):
    baseline = _get_daily(client)
    # Log a workout
    payload = {"title": "TEST_Delete", "steps": 500, "caloriesBurned": 120, "distanceKm": 0.3, "activeMinutes": 20}
    r = client.post(f"{API}/activity/log", json=payload)
    assert r.status_code == 201
    after_log = _get_daily(client)
    # Find our workout id
    matched = [w for w in after_log["workouts"] if w["title"] == "TEST_Delete"]
    assert matched, "logged workout not found in daily"
    wid = matched[-1]["id"]

    # Delete
    r = client.delete(f"{API}/activity/workout/{wid}")
    assert r.status_code == 200, r.text
    resp = r.json()
    # Aggregates back to baseline
    assert resp["steps"] == baseline["steps"]
    assert resp["caloriesBurned"] == baseline["caloriesBurned"]
    assert resp["activeMinutes"] == baseline["activeMinutes"]
    assert round(resp["distanceKm"] - baseline["distanceKm"], 4) == 0
    # Workout gone
    assert all(w["id"] != wid for w in resp["workouts"])


def test_delete_invalid_workout_returns_404(client):
    # Try a well-formed but non-existent ObjectId
    r = client.delete(f"{API}/activity/workout/507f1f77bcf86cd799439011")
    assert r.status_code == 404, r.text
    assert r.json().get("message") == "Workout not found"


def test_delete_already_deleted_returns_404(client):
    payload = {"title": "TEST_DoubleDel", "steps": 100, "caloriesBurned": 10, "distanceKm": 0.05, "activeMinutes": 5}
    client.post(f"{API}/activity/log", json=payload)
    d = _get_daily(client)
    wid = [w for w in d["workouts"] if w["title"] == "TEST_DoubleDel"][-1]["id"]
    assert client.delete(f"{API}/activity/workout/{wid}").status_code == 200
    r = client.delete(f"{API}/activity/workout/{wid}")
    assert r.status_code == 404
    assert r.json().get("message") == "Workout not found"


def test_regression_endpoints(client):
    # Spot-check dashboard/nutrition/podcast endpoints still work
    for path in ["/dashboard/metrics", "/nutrition/logs", "/podcasts", "/user/profile", "/community/leaderboard", "/health"]:
        r = client.get(f"{API}{path}")
        assert r.status_code == 200, f"{path} -> {r.status_code}: {r.text[:200]}"
