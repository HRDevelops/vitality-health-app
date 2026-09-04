# Regression test for new Health Score History endpoint (iteration_12)
import os
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
API = f"{BASE_URL}/api/v1"


def test_health_score_history_week():
    r = requests.get(f"{API}/dashboard/health-score-history?range=week", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["range"] == "week"
    assert isinstance(data["points"], list)
    assert len(data["points"]) == 7
    for pt in data["points"]:
        assert "date" in pt and "label" in pt and "score" in pt
        assert isinstance(pt["score"], int)
        assert 0 <= pt["score"] <= 100
    assert isinstance(data["average"], int)
    assert 0 <= data["average"] <= 100


def test_health_score_history_month():
    r = requests.get(f"{API}/dashboard/health-score-history?range=month", timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["range"] == "month"
    assert len(data["points"]) == 30
    assert isinstance(data["average"], int)


def test_health_score_history_deterministic():
    r1 = requests.get(f"{API}/dashboard/health-score-history?range=week", timeout=15).json()
    r2 = requests.get(f"{API}/dashboard/health-score-history?range=week", timeout=15).json()
    # Past days should be deterministic (seeded pseudo-random per docs)
    assert r1["points"][:-1] == r2["points"][:-1]


def test_health_score_history_default_is_week():
    r = requests.get(f"{API}/dashboard/health-score-history", timeout=15)
    assert r.status_code == 200
    assert r.json()["range"] == "week"
