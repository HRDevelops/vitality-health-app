"""Auth endpoint tests for Vitality backend (Node/Express, mounted at /api/v1/auth)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://health-hub-802.preview.emergentagent.com").rstrip("/")
AUTH = f"{BASE_URL}/api/v1/auth"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_demo_login(client):
    r = client.post(f"{AUTH}/demo")
    assert r.status_code == 200
    body = r.json()
    assert "token" in body and isinstance(body["token"], str) and len(body["token"]) > 20
    assert "user" in body
    assert body["user"]["email"] == "grace@vitality.app"
    assert body["user"]["name"] == "Grace"


def test_login_success(client):
    r = client.post(f"{AUTH}/login", json={"email": "a@b.co", "password": "secret1"})
    assert r.status_code == 200
    body = r.json()
    assert "token" in body
    assert body["user"]["name"] == "Grace"


def test_login_missing_fields(client):
    r = client.post(f"{AUTH}/login", json={})
    assert r.status_code == 400
    assert r.json().get("message") == "Email and password are required"


def test_login_missing_password(client):
    r = client.post(f"{AUTH}/login", json={"email": "a@b.co"})
    assert r.status_code == 400


def test_signup_success(client):
    r = client.post(f"{AUTH}/signup", json={"email": "new@user.com", "password": "abcdef"})
    assert r.status_code == 201
    body = r.json()
    assert "token" in body
    assert body["user"]["email"] == "grace@vitality.app"


def test_signup_missing_fields(client):
    r = client.post(f"{AUTH}/signup", json={})
    assert r.status_code == 400


def test_me_no_token(client):
    r = client.get(f"{AUTH}/me")
    assert r.status_code == 401


def test_me_invalid_token(client):
    r = client.get(f"{AUTH}/me", headers={"Authorization": "Bearer bad.token.here"})
    assert r.status_code == 401


def test_me_valid_token(client):
    demo = client.post(f"{AUTH}/demo").json()
    token = demo["token"]
    r = client.get(f"{AUTH}/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    user = r.json()
    assert user["email"] == "grace@vitality.app"
