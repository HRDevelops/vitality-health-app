"""Backend regression tests for Vitality Health app (Node/Express via FastAPI shim)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://health-hub-802.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api/v1"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- health ----------
def test_health(client):
    r = client.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- dashboard ----------
def test_dashboard_metrics(client):
    r = client.get(f"{API}/dashboard/metrics", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    # Should contain fields for the seeded user Grace
    assert isinstance(data, dict)
    # loose validation: expect some seeded metric fields
    text = str(data).lower()
    assert "grace" in text or "healthscore" in text or "health_score" in text or "score" in text


# ---------- activity ----------
def test_activity_daily(client):
    r = client.get(f"{API}/activity/daily", timeout=15)
    assert r.status_code == 200, r.text


def test_activity_trends(client):
    r = client.get(f"{API}/activity/trends?range=week", timeout=15)
    assert r.status_code == 200, r.text


def test_activity_log_water(client):
    r = client.post(f"{API}/activity/water", json={"amount": 250}, timeout=15)
    assert r.status_code in (200, 201), r.text


def test_activity_log_workout(client):
    r = client.post(
        f"{API}/activity/log",
        json={"type": "run", "duration": 20, "calories": 150, "distance": 3},
        timeout=15,
    )
    assert r.status_code in (200, 201), r.text


# ---------- nutrition ----------
def test_nutrition_logs_get(client):
    r = client.get(f"{API}/nutrition/logs", timeout=15)
    assert r.status_code == 200, r.text


def test_nutrition_logs_post(client):
    payload = {"mealType": "BREAKFAST", "foodName": "TEST_ Oatmeal", "calories": 320}
    r = client.post(f"{API}/nutrition/logs", json=payload, timeout=15)
    assert r.status_code in (200, 201), r.text


def test_nutrition_logs_post_invalid_mealtype_returns_400(client):
    """FIX 5: Invalid mealType should return 400 (not 500) via handleControllerError."""
    payload = {"mealType": "INVALID", "foodName": "TEST_ Bad", "calories": 100}
    r = client.post(f"{API}/nutrition/logs", json=payload, timeout=15)
    assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"
    body = r.json()
    assert "message" in body or "error" in body, body


def test_activity_log_no_500_on_invalid(client):
    """FIX 5: Activity log with invalid payload must not return 500.

    Note: activity controllers default/coerce values (Number(...) with defaults),
    so bad payloads may still yield 200/201. Key requirement: never 500.
    """
    r = client.post(f"{API}/activity/log", json={"type": "", "duration": "notANumber"}, timeout=15)
    assert r.status_code != 500, f"Got 500: {r.text}"
    assert r.status_code in (200, 201, 400), r.text


def test_activity_water_no_500_on_invalid(client):
    """FIX 5: Water log with invalid payload must not return 500."""
    r = client.post(f"{API}/activity/water", json={"amountMl": "notANumber"}, timeout=15)
    assert r.status_code != 500, f"Got 500: {r.text}"
    assert r.status_code in (200, 201, 400), r.text



# ---------- podcasts ----------
def test_podcasts_list(client):
    r = client.get(f"{API}/podcasts", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list) or isinstance(data, dict)


# ---------- user ----------
def test_user_profile(client):
    r = client.get(f"{API}/user/profile", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "grace" in str(data).lower()


def test_user_update_weight_and_persist(client):
    new_w = 58.5
    r = client.put(f"{API}/user/weight", json={"weightKg": new_w}, timeout=15)
    assert r.status_code in (200, 204), r.text
    # verify via profile
    p = client.get(f"{API}/user/profile", timeout=15).json()
    # find weight field somewhere in payload
    found = False
    def walk(obj):
        nonlocal found
        if isinstance(obj, dict):
            for k, v in obj.items():
                if "weight" in k.lower() and isinstance(v, (int, float)) and abs(v - new_w) < 0.01:
                    found = True
                walk(v)
        elif isinstance(obj, list):
            for x in obj: walk(x)
    walk(p)
    assert found, f"Weight {new_w} not reflected in profile: {p}"


def test_user_reminders_list_and_toggle(client):
    r = client.get(f"{API}/user/reminders", timeout=15)
    assert r.status_code == 200, r.text
    reminders = r.json()
    assert isinstance(reminders, list) and len(reminders) >= 1, reminders
    rid = reminders[0].get("id") or reminders[0].get("_id")
    assert rid, reminders[0]
    original = reminders[0].get("enabled", True)
    tog = client.put(f"{API}/user/reminders/{rid}", json={"enabled": not original}, timeout=15)
    assert tog.status_code in (200, 204), tog.text


# ---------- community ----------
def test_community_leaderboard(client):
    r = client.get(f"{API}/community/leaderboard", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    lst = data if isinstance(data, list) else data.get("members") or data.get("data") or []
    assert len(lst) >= 5, f"Expected >=5 leaderboard members, got {len(lst)}"


# ---------- 404 for undefined ----------
def test_unknown_route_404(client):
    r = client.get(f"{API}/does-not-exist", timeout=15)
    assert r.status_code == 404
