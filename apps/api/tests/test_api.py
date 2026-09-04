import pytest
import pytest_asyncio
import httpx
from app.main import app
from app.database import init_db, AsyncSessionLocal
from app.services.demo_seed import seed_demo_data

@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    await init_db()
    async with AsyncSessionLocal() as db:
        await seed_demo_data(db)

@pytest.mark.asyncio
async def test_health_check():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert "VentureForge" in data["service"]

@pytest.mark.asyncio
async def test_list_projects_and_pitch():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. List projects
        resp = await client.get("/api/projects")
        assert resp.status_code == 200
        projects = resp.json()
        assert len(projects) >= 1
        demo_id = projects[0]["id"]

        # 2. Get 10-slide pitch blueprint
        pitch_resp = await client.get(f"/api/projects/{demo_id}/pitch")
        assert pitch_resp.status_code == 200
        pitch_data = pitch_resp.json()
        assert len(pitch_data["slides"]) == 10
        assert pitch_data["slides"][0]["slide_type"] == "problem"
        assert pitch_data["slides"][1]["slide_type"] == "solution"
        assert pitch_data["slides"][2]["slide_type"] == "market"
        assert pitch_data["slides"][9]["slide_type"] == "funding"

        # 3. Test Red Team critique endpoint
        red_resp = await client.post(f"/api/projects/{demo_id}/investor-red-team")
        assert red_resp.status_code == 200
        red_data = red_resp.json()
        assert "readiness_score" in red_data
        assert len(red_data["vc_tough_questions"]) >= 1

        # 4. Test Consistency Check endpoint
        con_resp = await client.post(f"/api/projects/{demo_id}/consistency-check")
        assert con_resp.status_code == 200
        assert "consistency_score" in con_resp.json()
