"""Tests for multi-tenant JWT auth (Jan 2026 rewrite)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api/v1"

GRACE_EMAIL = "grace.user@email.com"
GRACE_PASS = "12345678"


def _unique_email():
    return f"TEST_{uuid.uuid4().hex[:10]}@example.com"


# ---------- Auth basics ----------

def test_grace_login_new_email():
    r = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data
    assert "user" in data
    assert "passwordHash" not in str(data)
    assert data["user"]["email"] == GRACE_EMAIL


def test_grace_old_email_fails():
    r = requests.post(f"{API}/auth/login", json={"email": "grace@vitality.app", "password": GRACE_PASS})
    assert r.status_code in (401, 404)


def test_wrong_password_401():
    r = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": "wrongpass!!"})
    assert r.status_code == 401


def test_protected_no_token_401():
    for path in ["/dashboard/metrics", "/activity/daily", "/user/reminders", "/user/profile"]:
        r = requests.get(f"{API}{path}")
        assert r.status_code == 401, f"{path} expected 401 got {r.status_code}"


def test_me_endpoint_with_token():
    tok = requests.post(f"{API}/auth/login", json={"email": GRACE_EMAIL, "password": GRACE_PASS}).json()["token"]
    r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    body = r.json()
    assert "passwordHash" not in str(body)
    # user may be at top-level or nested
    email = body.get("email") or body.get("user", {}).get("email")
    assert email == GRACE_EMAIL


# ---------- Registration ----------

def test_register_new_user_zeroed_and_isolated():
    email = _unique_email()
    r = requests.post(f"{API}/auth/register", json={"name": "TestNewbie", "email": email, "password": "abcdef"})
    assert r.status_code in (200, 201), r.text
    data = r.json()
    assert "token" in data
    assert "passwordHash" not in str(data)
    tok = data["token"]
    h = {"Authorization": f"Bearer {tok}"}

    # Dashboard should be zeroed
    m = requests.get(f"{API}/dashboard/metrics", headers=h)
    assert m.status_code == 200
    metrics = m.json()
    txt = str(metrics).lower()
    # Should NOT contain grace's steps like 9890
    assert "9890" not in str(metrics)

    # Profile name matches
    p = requests.get(f"{API}/user/profile", headers=h)
    assert p.status_code == 200
    prof = p.json()
    name = prof.get("name") or prof.get("user", {}).get("name")
    assert name == "TestNewbie"

    # Reminders copied from Grace's template (3)
    rem = requests.get(f"{API}/user/reminders", headers=h)
    assert rem.status_code == 200
    rem_data = rem.json()
    reminders = rem_data if isinstance(rem_data, list) else rem_data.get("reminders", [])
    assert len(reminders) == 3, f"Expected 3 template reminders, got {len(reminders)}"


def test_duplicate_registration_409():
    email = _unique_email()
    r1 = requests.post(f"{API}/auth/register", json={"name": "Dup", "email": email, "password": "abcdef"})
    assert r1.status_code in (200, 201)
    r2 = requests.post(f"{API}/auth/register", json={"name": "Dup2", "email": email, "password": "abcdef"})
    assert r2.status_code == 409, f"Expected 409 got {r2.status_code}: {r2.text}"


# ---------- Social login ----------

def test_social_google_creates_isolated_and_reuses():
    r1 = requests.post(f"{API}/auth/social", json={"provider": "google"})
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert "token" in d1
    assert "passwordHash" not in str(d1)
    email1 = d1["user"]["email"]
    assert "google" in email1.lower()

    # Second call reuses same account
    r2 = requests.post(f"{API}/auth/social", json={"provider": "google"})
    assert r2.status_code == 200
    assert r2.json()["user"]["email"] == email1


def test_social_apple():
    r = requests.post(f"{API}/auth/social", json={"provider": "apple"})
    assert r.status_code == 200
    email = r.json()["user"]["email"]
    assert "apple" in email.lower()


# ---------- Data isolation ----------

def test_new_user_does_not_see_grace_data():
    email = _unique_email()
    tok = requests.post(f"{API}/auth/register", json={"name": "Iso", "email": email, "password": "abcdef"}).json()["token"]
    h = {"Authorization": f"Bearer {tok}"}
    a = requests.get(f"{API}/activity/daily", headers=h)
    assert a.status_code == 200
    body = str(a.json())
    # Grace's steps figure should not appear
    assert "9890" not in body
