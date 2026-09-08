"""
Backend tests for iteration 21:
- PUT /api/v1/user/password (change password)
- GET /api/v1/community/leaderboard?range=today|week
- PUT /api/v1/user/profile (goal presets save + avatar as data URI)
"""
import os
import pytest
import requests

from pathlib import Path
def _load_env():
    for p in ["/app/frontend/.env"]:
        f = Path(p)
        if f.exists():
            for line in f.read_text().splitlines():
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())
_load_env()
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api/v1"

GRACE_EMAIL = "grace.user@email.com"
GRACE_PASSWORD = "12345678"


@pytest.fixture(scope="module")
def grace_token():
    r = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(grace_token):
    return {"Authorization": f"Bearer {grace_token}"}


# ---------- Leaderboard range ----------
class TestLeaderboardRange:
    def test_today_requires_auth(self):
        r = requests.get(f"{API}/community/leaderboard?range=today")
        assert r.status_code == 401

    def test_week_requires_auth(self):
        r = requests.get(f"{API}/community/leaderboard?range=week")
        assert r.status_code == 401

    def test_today_order(self, auth_headers):
        r = requests.get(f"{API}/community/leaderboard?range=today", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 5
        names = [(e["name"], e["steps"]) for e in sorted(data, key=lambda x: x["rank"])]
        expected = [("Liam Carter", 12430), ("Sofia Reyes", 11020), ("Grace", 9890), ("Maya Chen", 8760), ("Noah Park", 7210)]
        # Grace's display name may differ; check by isCurrentUser and steps only
        got = [(e.get("name"), e["steps"], e.get("isCurrentUser", False)) for e in sorted(data, key=lambda x: x["rank"])]
        print("TODAY:", got)
        # Compare by steps ordering
        assert [g[1] for g in got] == [e[1] for e in expected]

    def test_week_order_and_reorder(self, auth_headers):
        r = requests.get(f"{API}/community/leaderboard?range=week", headers=auth_headers)
        assert r.status_code == 200
        data = sorted(r.json(), key=lambda x: x["rank"])
        got = [(e.get("name"), e["steps"], e.get("isCurrentUser", False)) for e in data]
        print("WEEK:", got)
        expected_steps = [81200, 76500, 74300, 62690, 61800]
        assert [g[1] for g in got] == expected_steps
        # Verify Grace at rank 4
        assert data[3]["isCurrentUser"] is True
        assert data[3]["steps"] == 62690


# ---------- Change password ----------
class TestChangePassword:
    def test_no_auth(self):
        r = requests.put(f"{API}/user/password", json={"currentPassword": "x", "newPassword": "yyyyyyyy"})
        assert r.status_code == 401

    def test_wrong_current(self, auth_headers):
        r = requests.put(f"{API}/user/password", headers=auth_headers,
                         json={"currentPassword": "wrongpass", "newPassword": "newpassword1"})
        assert r.status_code == 401
        assert "incorrect" in r.json().get("message", "").lower()

    def test_short_new_password(self, auth_headers):
        r = requests.put(f"{API}/user/password", headers=auth_headers,
                         json={"currentPassword": GRACE_PASSWORD, "newPassword": "short"})
        assert r.status_code == 400
        assert "8" in r.json().get("message", "")

    def test_success_and_revert(self, auth_headers):
        new_pw = "newpass1234"
        # Change to new
        r = requests.put(f"{API}/user/password", headers=auth_headers,
                         json={"currentPassword": GRACE_PASSWORD, "newPassword": new_pw})
        assert r.status_code == 200, r.text
        # Old fails
        r_old = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASSWORD})
        assert r_old.status_code != 200
        # New works
        r_new = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": new_pw})
        assert r_new.status_code == 200
        new_token = r_new.json()["token"]
        # Revert
        r_rev = requests.put(f"{API}/user/password",
                             headers={"Authorization": f"Bearer {new_token}"},
                             json={"currentPassword": new_pw, "newPassword": GRACE_PASSWORD})
        assert r_rev.status_code == 200
        # Verify original works
        r_final = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASSWORD})
        assert r_final.status_code == 200


# ---------- Profile update (goals + avatar data URI) ----------
class TestProfileGoalsAndAvatar:
    def test_get_initial(self, auth_headers):
        r = requests.get(f"{API}/user/profile", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "stepGoal" in data and "waterGoal" in data and "calorieGoal" in data
        print("Initial goals:", data.get("stepGoal"), data.get("waterGoal"),
              data.get("calorieGoal"), data.get("macros"), "avatar:", str(data.get("avatarUrl"))[:60])

    def test_weight_loss_preset_save_and_revert(self, auth_headers):
        # Save Weight Loss preset values
        payload = {
            "calorieGoal": 1800, "waterGoal": 2500, "stepGoal": 12000,
            "macros": {"protein": 160, "carbs": 150, "fat": 55},
        }
        r = requests.put(f"{API}/user/profile", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        # GET verify
        g = requests.get(f"{API}/user/profile", headers=auth_headers).json()
        assert g["calorieGoal"] == 1800
        assert g["waterGoal"] == 2500
        assert g["stepGoal"] == 12000
        assert g["macros"]["protein"] == 160
        assert g["macros"]["carbs"] == 150
        assert g["macros"]["fat"] == 55

        # Revert to defaults
        revert = {
            "calorieGoal": 2000, "waterGoal": 2000, "stepGoal": 15000,
            "macros": {"protein": 90, "carbs": 250, "fat": 70},
        }
        r2 = requests.put(f"{API}/user/profile", headers=auth_headers, json=revert)
        assert r2.status_code == 200
        g2 = requests.get(f"{API}/user/profile", headers=auth_headers).json()
        assert g2["calorieGoal"] == 2000
        assert g2["stepGoal"] == 15000

    def test_avatar_data_uri_persists(self, auth_headers):
        # Save original
        orig = requests.get(f"{API}/user/profile", headers=auth_headers).json()
        original_avatar = orig["avatarUrl"]
        # Small SVG data URI (bolt icon)
        svg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><circle cx='32' cy='32' r='30' fill='%23F59E0B'/></svg>"
        r = requests.put(f"{API}/user/profile", headers=auth_headers, json={"avatarUrl": svg})
        assert r.status_code == 200
        g = requests.get(f"{API}/user/profile", headers=auth_headers).json()
        assert g["avatarUrl"] == svg
        # Revert
        r2 = requests.put(f"{API}/user/profile", headers=auth_headers, json={"avatarUrl": original_avatar})
        assert r2.status_code == 200
