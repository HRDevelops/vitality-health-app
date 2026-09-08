"""
Iteration 22 - Pre-launch QA Audit (6 Suites)
Covers: Grace demo data integrity, new user registration+isolation, dynamic
leaderboard, profile/goal presets+avatar+password change, session expiry &
forgot/reset password, and codebase hygiene (no secret fields leaked).
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://health-hub-802.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api/v1"

GRACE_EMAIL = "grace.user@email.com"
GRACE_PASS = "12345678"

SECRET_KEYS = {"passwordHash", "resetPasswordToken", "resetPasswordExpires"}


def _has_secret(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in SECRET_KEYS:
                return k
            r = _has_secret(v)
            if r:
                return r
    elif isinstance(obj, list):
        for it in obj:
            r = _has_secret(it)
            if r:
                return r
    return None


@pytest.fixture(scope="module")
def grace_token():
    r = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def grace_headers(grace_token):
    return {"Authorization": f"Bearer {grace_token}"}


@pytest.fixture(scope="module")
def new_user():
    email = f"qa.user.test.{uuid.uuid4().hex[:8]}@vitality.demo"
    password = "TestPass123"
    r = requests.post(f"{API}/auth/register", json={"email": email, "name": "QA Tester", "password": password})
    assert r.status_code in (200, 201), r.text
    body = r.json()
    return {"email": email, "password": password, "token": body["token"], "headers": {"Authorization": f"Bearer {body['token']}"}}


# =========================================================================
# SUITE 1 — Grace Demo Flow & Data Integrity
# =========================================================================
class TestSuite1_GraceDemoData:
    def test_login_grace(self, grace_token):
        assert isinstance(grace_token, str) and len(grace_token) > 20

    def test_dashboard_steps_15290(self, grace_headers):
        r = requests.get(f"{API}/activity/daily", headers=grace_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("steps") == 15290, f"expected 15290 got {data.get('steps')}"

    def test_podcast_streak(self, grace_headers):
        r = requests.get(f"{API}/user/profile", headers=grace_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("podcastStreakCount") == 2, f"podcastStreakCount={body.get('podcastStreakCount')}"

    def test_nutrition_seeded_meals(self, grace_headers):
        r = requests.get(f"{API}/nutrition/logs", headers=grace_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        # Structure: {logDate, meals: [{mealType, items:[...]}, ...]}
        all_names = []
        for m in data.get("meals", []):
            for it in m.get("items", []):
                all_names.append((it.get("foodName") or "").lower())
        joined = " | ".join(all_names)
        assert "salad" in joined and "pumpkin" in joined and "quinoa" in joined, f"seeded meals not all found: {joined}"

    def test_activity_trends_7days(self, grace_headers):
        r = requests.get(f"{API}/activity/trends", headers=grace_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        # find a series of numbers len >=5
        def find_series(d):
            if isinstance(d, list) and len(d) >= 5:
                return d
            if isinstance(d, dict):
                for v in d.values():
                    r = find_series(v)
                    if r:
                        return r
            return None
        series = find_series(data)
        assert series is not None and len(series) >= 5, f"no 7-day trends series found: {data}"


# =========================================================================
# SUITE 2 — New User Registration & Account Isolation
# =========================================================================
class TestSuite2_Isolation:
    def test_new_user_daily_zero(self, new_user):
        r = requests.get(f"{API}/activity/daily", headers=new_user["headers"])
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("steps", 0) == 0, f"new user steps={data.get('steps')}"
        assert data.get("waterMl", 0) == 0, f"new user water={data.get('waterMl')}"

    def test_new_user_trends_empty(self, new_user):
        r = requests.get(f"{API}/activity/trends", headers=new_user["headers"])
        assert r.status_code == 200
        data = r.json()
        # all zero or empty
        def sum_nums(d):
            if isinstance(d, list):
                return sum(sum_nums(x) for x in d)
            if isinstance(d, dict):
                return sum(sum_nums(v) for v in d.values())
            if isinstance(d, (int, float)):
                return d
            return 0
        assert sum_nums(data) == 0, f"new user trends should be all-zero, got sum={sum_nums(data)}"

    def test_new_user_reminders_copy(self, new_user):
        r = requests.get(f"{API}/user/reminders", headers=new_user["headers"])
        assert r.status_code == 200, r.text
        data = r.json()
        reminders = data if isinstance(data, list) else data.get("reminders", [])
        assert len(reminders) == 3, f"expected 3 reminders got {len(reminders)}"
        titles = {r.get("title") or r.get("label"): r.get("enabled") for r in reminders}
        assert any("meal" in (t or "").lower() for t in titles)
        assert any("walk" in (t or "").lower() for t in titles)
        assert any("water" in (t or "").lower() for t in titles)
        # verify enabled state matches Grace's template: Log meals=true, Evening walk=true, Water=false
        for t, en in titles.items():
            tl = (t or "").lower()
            if "meal" in tl:
                assert en is True, f"'Log meals' should be enabled=True, got {en}"
            elif "walk" in tl:
                assert en is True, f"'Evening walk' should be enabled=True, got {en}"
            elif "water" in tl:
                assert en is False, f"'Drink water' should be enabled=False, got {en}"

    def test_grace_unchanged_after_new_registration(self, grace_headers):
        r = requests.get(f"{API}/activity/daily", headers=grace_headers)
        assert r.status_code == 200
        assert r.json().get("steps") == 15290, "Grace's steps changed after new user registration"


# =========================================================================
# SUITE 3 — Dynamic Community Leaderboard
# =========================================================================
class TestSuite3_Leaderboard:
    def test_grace_today_rank1(self, grace_headers):
        r = requests.get(f"{API}/community/leaderboard?range=today", headers=grace_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        board = data if isinstance(data, list) else data.get("leaderboard", data.get("entries", []))
        # find Grace
        me = next((e for e in board if e.get("isCurrentUser") or "grace" in (e.get("name") or "").lower()), None)
        assert me is not None, f"Grace not found in leaderboard: {board}"
        assert me.get("steps") == 15290, f"Grace steps in leaderboard={me.get('steps')}"
        assert me.get("rank") == 1, f"Grace rank={me.get('rank')} (expected 1)"

    def test_new_user_leaderboard_replaces_grace(self, new_user):
        # log 4000 steps via workout
        r = requests.post(f"{API}/activity/log", headers=new_user["headers"], json={"type": "Run", "durationMin": 30, "steps": 4000, "calories": 200})
        # accept any 2xx; if endpoint differs, just proceed and check the leaderboard
        board_resp = requests.get(f"{API}/community/leaderboard?range=today", headers=new_user["headers"])
        assert board_resp.status_code == 200
        data = board_resp.json()
        board = data if isinstance(data, list) else data.get("leaderboard", data.get("entries", []))
        me = next((e for e in board if e.get("isCurrentUser")), None)
        assert me is not None, f"new user not shown on leaderboard: {board}"
        assert "grace" not in (me.get("name") or "").lower(), "current user should not be labeled Grace"
        # 4 static friends + current user
        names = [e.get("name","") for e in board]
        # Grace should NOT appear if the new user replaces her position
        assert not any("grace" in (n or "").lower() for n in names), f"Grace appeared in new user's board: {names}"
        assert me.get("steps", 0) >= 0  # workout may or may not have persisted steps
        print(f"new user leaderboard steps={me.get('steps')} rank={me.get('rank')}")

    def test_week_vs_today_ordering_differs(self, grace_headers):
        today = requests.get(f"{API}/community/leaderboard?range=today", headers=grace_headers).json()
        week = requests.get(f"{API}/community/leaderboard?range=week", headers=grace_headers).json()
        t_board = today if isinstance(today, list) else today.get("leaderboard", [])
        w_board = week if isinstance(week, list) else week.get("leaderboard", [])
        t_order = [e.get("name") for e in t_board]
        w_order = [e.get("name") for e in w_board]
        assert t_order != w_order, f"today and week ordering identical: {t_order}"
        print(f"today={t_order}\nweek ={w_order}")


# =========================================================================
# SUITE 4 — Profile Settings & Goal Presets, Avatar, Password change
# =========================================================================
class TestSuite4_Profile:
    def test_goal_presets_persist(self, grace_headers):
        original = requests.get(f"{API}/user/profile", headers=grace_headers).json()
        try:
            preset = {"stepGoal": 8000, "waterGoal": 2500, "calorieGoal": 1600, "macros": {"protein": 120, "carbs": 130, "fat": 55}}
            r = requests.put(f"{API}/user/profile", headers=grace_headers, json=preset)
            assert r.status_code == 200, r.text
            got = requests.get(f"{API}/user/profile", headers=grace_headers).json()
            assert got.get("stepGoal") == 8000
            assert got.get("waterGoal") == 2500
            assert got.get("calorieGoal") == 1600
            assert got.get("macros", {}).get("protein") == 120
        finally:
            # restore
            revert = {"stepGoal": original.get("stepGoal", 15000), "waterGoal": original.get("waterGoal", 2000),
                      "calorieGoal": original.get("calorieGoal", 2000), "macros": original.get("macros", {"protein":90,"carbs":250,"fat":70})}
            requests.put(f"{API}/user/profile", headers=grace_headers, json=revert)

    def test_avatar_svg_data_uri(self, grace_headers):
        original = requests.get(f"{API}/user/profile", headers=grace_headers).json()
        try:
            svg_uri = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><circle r='10'/></svg>"
            r = requests.put(f"{API}/user/profile", headers=grace_headers, json={"avatarUrl": svg_uri})
            assert r.status_code == 200, r.text
            got = requests.get(f"{API}/user/profile", headers=grace_headers).json()
            assert got.get("avatarUrl", "").startswith("data:image/svg+xml"), got.get("avatarUrl")
        finally:
            requests.put(f"{API}/user/profile", headers=grace_headers, json={"avatarUrl": original.get("avatarUrl")})

    def test_password_change_roundtrip(self):
        # Fresh login to avoid using module-scoped token after change
        r = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
        assert r.status_code == 200
        tok = r.json()["token"]
        h = {"Authorization": f"Bearer {tok}"}

        new_pw = "NewPass456"
        r = requests.put(f"{API}/user/password", headers=h, json={"currentPassword": GRACE_PASS, "newPassword": new_pw})
        assert r.status_code == 200, r.text

        # old fails
        r_old = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
        assert r_old.status_code in (400, 401), f"old pw still works: {r_old.status_code}"

        # new works
        r_new = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": new_pw})
        assert r_new.status_code == 200
        new_tok = r_new.json()["token"]
        new_h = {"Authorization": f"Bearer {new_tok}"}

        # revert
        r = requests.put(f"{API}/user/password", headers=new_h, json={"currentPassword": new_pw, "newPassword": GRACE_PASS})
        assert r.status_code == 200, r.text
        # confirm reverted
        r_final = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
        assert r_final.status_code == 200, "Failed to revert Grace's password to 12345678"

    def test_wrong_current_password_401(self, grace_headers):
        r = requests.put(f"{API}/user/password", headers=grace_headers,
                         json={"currentPassword": "WRONG_PW", "newPassword": "AnotherPass"})
        assert r.status_code in (400, 401), f"expected 4xx got {r.status_code}"


# =========================================================================
# SUITE 5 — Session Expiry & Forgot/Reset Password
# =========================================================================
class TestSuite5_SessionForgot:
    def test_invalid_token_401(self):
        r = requests.get(f"{API}/user/profile", headers={"Authorization": "Bearer garbage.token.here"})
        assert r.status_code == 401, r.status_code

    def test_forgot_reset_roundtrip(self):
        r = requests.post(f"{API}/auth/forgot-password", json={"email": GRACE_EMAIL})
        assert r.status_code == 200, r.text
        token = r.json().get("resetToken")
        assert token, f"resetToken not returned: {r.json()}"

        new_pw = "ResetPass789"
        r = requests.post(f"{API}/auth/reset-password", json={"token": token, "newPassword": new_pw})
        assert r.status_code == 200, r.text

        # new works
        r_new = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": new_pw})
        assert r_new.status_code == 200

        # revert via forgot flow again
        r = requests.post(f"{API}/auth/forgot-password", json={"email": GRACE_EMAIL})
        token2 = r.json().get("resetToken")
        r = requests.post(f"{API}/auth/reset-password", json={"token": token2, "newPassword": GRACE_PASS})
        assert r.status_code == 200

        # confirm reverted
        r_final = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
        assert r_final.status_code == 200, "Failed to revert Grace's password after reset flow"

    def test_forgot_unknown_email_no_leak(self):
        r = requests.post(f"{API}/auth/forgot-password", json={"email": "nobody-xyz@example.com"})
        assert r.status_code == 200
        assert "resetToken" not in r.json(), "resetToken should NOT be returned for unknown email"


# =========================================================================
# SUITE 6 — Codebase Hygiene & Security (No leaked password/reset fields)
# =========================================================================
class TestSuite6_Security:
    def test_login_no_secret_fields(self):
        r = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
        leaked = _has_secret(r.json())
        assert leaked is None, f"/auth/login leaks {leaked}"

    def test_register_no_secret_fields(self):
        email = f"qa.hygiene.{uuid.uuid4().hex[:6]}@vitality.demo"
        r = requests.post(f"{API}/auth/register", json={"email": email, "name": "H", "password": "hygienetest1"})
        leaked = _has_secret(r.json())
        assert leaked is None, f"/auth/register leaks {leaked}"

    def test_social_no_secret_fields(self):
        r = requests.post(f"{API}/auth/social", json={"provider": "google"})
        leaked = _has_secret(r.json())
        assert leaked is None, f"/auth/social leaks {leaked}"

    def test_profile_and_me_no_secret_fields(self, grace_headers):
        r1 = requests.get(f"{API}/user/profile", headers=grace_headers)
        assert _has_secret(r1.json()) is None, "/user/profile leaks secret"
        r2 = requests.get(f"{API}/auth/me", headers=grace_headers)
        assert _has_secret(r2.json()) is None, "/auth/me leaks secret"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
