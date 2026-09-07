"""Backend tests for Vitality: leaderboard, profile goals, forgot/reset password."""
import os
import secrets
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/") + "/api/v1"

GRACE_EMAIL = "grace.user@email.com"
GRACE_PASS = "12345678"


@pytest.fixture(scope="module")
def grace_token():
    r = requests.post(f"{BASE}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def grace_headers(grace_token):
    return {"Authorization": f"Bearer {grace_token}"}


# --- Leaderboard ---
def test_leaderboard_requires_auth():
    r = requests.get(f"{BASE}/community/leaderboard")
    assert r.status_code == 401


def test_leaderboard_grace_merged(grace_headers):
    r = requests.get(f"{BASE}/community/leaderboard", headers=grace_headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    names = [e["name"] for e in data]
    assert any("Grace" in n for n in names), names
    steps = [e["steps"] for e in data]
    assert steps == sorted(steps, reverse=True)
    current = [e for e in data if e.get("isCurrentUser")]
    assert len(current) == 1
    assert "Grace" in current[0]["name"]


def test_leaderboard_new_user_zero_steps():
    email = f"TEST_leader_{secrets.token_hex(4)}@example.com"
    reg = requests.post(f"{BASE}/auth/register", json={
        "email": email, "password": "test1234", "name": "Test Leader"
    })
    assert reg.status_code in (200, 201), reg.text
    token = reg.json()["token"]
    h = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE}/community/leaderboard", headers=h)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    current = [e for e in data if e.get("isCurrentUser")]
    assert len(current) == 1
    assert current[0]["name"] != "Grace"
    assert current[0]["steps"] == 0
    assert data[-1]["isCurrentUser"] is True


# --- Profile / Goals ---
def test_profile_no_sensitive_fields(grace_headers):
    r = requests.get(f"{BASE}/user/profile", headers=grace_headers)
    assert r.status_code == 200
    d = r.json()
    assert "passwordHash" not in d
    assert "resetPasswordToken" not in d
    assert "resetPasswordExpires" not in d
    assert d.get("stepGoal") == 15000
    assert d.get("waterGoal") == 2000
    assert d.get("calorieGoal") == 2000
    assert d.get("macros", {}).get("protein") == 90


def test_update_profile_goals_reflected(grace_headers):
    orig = requests.get(f"{BASE}/user/profile", headers=grace_headers).json()
    try:
        payload = {"stepGoal": 5000, "calorieGoal": 1800, "waterGoal": 3000,
                   "macros": {"protein": 100, "carbs": 200, "fat": 60}}
        r = requests.put(f"{BASE}/user/profile", headers=grace_headers, json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["stepGoal"] == 5000
        assert d["calorieGoal"] == 1800
        assert d["waterGoal"] == 3000
        assert d["macros"]["protein"] == 100
        dash = requests.get(f"{BASE}/dashboard/metrics", headers=grace_headers)
        assert dash.status_code == 200
        assert "5000" in dash.text
    finally:
        restore = {
            "stepGoal": orig.get("stepGoal", 15000),
            "waterGoal": orig.get("waterGoal", 2000),
            "calorieGoal": orig.get("calorieGoal", 2000),
            "macros": orig.get("macros", {"protein": 90, "carbs": 250, "fat": 70}),
        }
        if orig.get("avatarUrl"):
            restore["avatarUrl"] = orig["avatarUrl"]
        requests.put(f"{BASE}/user/profile", headers=grace_headers, json=restore)


# --- Forgot / Reset Password ---
def test_forgot_password_unknown_email_no_leak():
    r = requests.post(f"{BASE}/auth/forgot-password", json={"email": "nobody_xyz_zzz@nope.com"})
    assert r.status_code == 200
    body = r.json()
    assert not body.get("resetToken")


def test_reset_password_invalid_token():
    r = requests.post(f"{BASE}/auth/reset-password",
                      json={"token": "garbage_invalid_token", "newPassword": "newpass123"})
    assert r.status_code == 400


def test_forgot_and_reset_flow_for_new_user():
    email = f"TEST_reset_{secrets.token_hex(4)}@example.com"
    reg = requests.post(f"{BASE}/auth/register", json={
        "email": email, "password": "originalpw", "name": "Reset User"
    })
    assert reg.status_code in (200, 201)

    r = requests.post(f"{BASE}/auth/forgot-password", json={"email": email})
    assert r.status_code == 200
    token = r.json().get("resetToken")
    assert token, "resetToken must be present for known email"

    r2 = requests.post(f"{BASE}/auth/reset-password",
                       json={"token": token, "newPassword": "newpassword123"})
    assert r2.status_code == 200

    old = requests.post(f"{BASE}/auth/login", json={"email": email, "password": "originalpw"})
    assert old.status_code == 401
    new = requests.post(f"{BASE}/auth/login", json={"email": email, "password": "newpassword123"})
    assert new.status_code == 200
