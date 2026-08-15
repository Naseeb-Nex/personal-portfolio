import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

import jwt
from app.config import settings

# removed setup_db

@pytest.mark.asyncio
async def test_init_session():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/session/init")
    
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "session_id" in data
    
    # Verify token
    decoded = jwt.decode(data["token"], settings.SECRET_KEY, algorithms=["HS256"])
    assert decoded["sub"] == data["session_id"]
