"""Backend tests for iteration_9 new features:
1. Podcast streak (podcastStreakCount, lastListenDate)
2. User profile exposes new streak fields
3. Reminders seed sanity (Log your meals 08:00 enabled, Evening walk 18:00 enabled, Drink water 14:00 disabled)
Assumes DB was freshly seeded (podcastStreakCount=2, lastListenDate=yesterday).
"""
import os
import subprocess
import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
API = f"{BASE_URL}/api/v1"


@pytest.fixture(scope="module")
def client():
    # Re-seed for pristine state
    subprocess.run(
        ["npx", "ts-node", "src/seed.ts"],
        cwd="/app/server",
        capture_output=True,
        timeout=60,
        check=False,
    )
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_profile_has_streak_fields(client):
    p = client.get(f"{API}/user/profile", timeout=15).json()
    assert "podcastStreakCount" in p, p
    assert "lastListenDate" in p, p
    assert p["podcastStreakCount"] == 2
    # lastListenDate should be yesterday (string)
    assert isinstance(p["lastListenDate"], str) and len(p["lastListenDate"]) == 10


def test_podcast_first_listen_bumps_streak_to_3(client):
    plist = client.get(f"{API}/podcasts", timeout=15).json()
    non_premium = [p for p in plist if not p.get("isPremium")]
    assert non_premium
    pid = non_premium[0].get("id") or non_premium[0].get("_id")

    r = client.post(f"{API}/podcasts/{pid}/listen", json={}, timeout=15)
    assert r.status_code in (200, 201), r.text
    body = r.json()
    assert body.get("podcastStreakCount") == 3, body
    assert body.get("podcastSessionsCompleted") == 3, body

    # Verify on profile
    p = client.get(f"{API}/user/profile", timeout=15).json()
    assert p["podcastStreakCount"] == 3
    from datetime import date
    assert p["lastListenDate"] == date.today().isoformat()


def test_podcast_same_day_second_listen_streak_stays_sessions_increment(client):
    plist = client.get(f"{API}/podcasts", timeout=15).json()
    non_premium = [p for p in plist if not p.get("isPremium")]
    pid = non_premium[0].get("id") or non_premium[0].get("_id")

    r = client.post(f"{API}/podcasts/{pid}/listen", json={}, timeout=15)
    assert r.status_code in (200, 201), r.text
    body = r.json()
    # Streak stays 3, sessions increment to 4
    assert body.get("podcastStreakCount") == 3, body
    assert body.get("podcastSessionsCompleted") == 4, body


def test_reminders_seeded_correctly(client):
    r = client.get(f"{API}/user/reminders", timeout=15)
    assert r.status_code == 200
    reminders = r.json()
    assert isinstance(reminders, list) and len(reminders) == 3
    by_title = {x["title"]: x for x in reminders}
    assert "Log your meals" in by_title
    assert by_title["Log your meals"]["time"] == "08:00"
    assert by_title["Log your meals"]["enabled"] is True
    assert by_title["Evening walk"]["time"] == "18:00"
    assert by_title["Evening walk"]["enabled"] is True
    assert by_title["Drink water"]["time"] == "14:00"
    assert by_title["Drink water"]["enabled"] is False


def test_workout_log_and_delete_still_works(client):
    """Undo delete relies on POST /activity/log after DELETE."""
    r = client.post(
        f"{API}/activity/log",
        json={"title": "TEST_ undo workout", "activeMinutes": 10, "caloriesBurned": 80, "distanceKm": 1.0, "steps": 1000},
        timeout=15,
    )
    assert r.status_code in (200, 201), r.text
    workouts = r.json().get("workouts") or []
    entry = [w for w in workouts if w.get("title") == "TEST_ undo workout"][-1]
    wid = entry.get("id") or entry.get("_id")
    assert wid

    dr = client.delete(f"{API}/activity/workout/{wid}", timeout=15)
    assert dr.status_code == 200, dr.text
    # Re-log (undo path)
    r2 = client.post(
        f"{API}/activity/log",
        json={"title": "TEST_ undo workout", "activeMinutes": 10, "caloriesBurned": 80, "distanceKm": 1.0, "steps": 1000},
        timeout=15,
    )
    assert r2.status_code in (200, 201), r2.text
    workouts2 = r2.json().get("workouts") or []
    assert any(w.get("title") == "TEST_ undo workout" for w in workouts2)
