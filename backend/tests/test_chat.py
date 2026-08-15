import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_chat_stream():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        pass

    # A better test uses mocked dependencies, but for now we just verify the endpoint exists
    # To prevent LLM API calls in CI, we'll mock the PortfolioAgent in the endpoint
    from unittest.mock import patch
    with patch("app.api.endpoints.chat.PortfolioAgent.run") as mock_run:
        from langchain_core.messages import AIMessage
        mock_run.return_value = [AIMessage(content="Mocked answer")]
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/chat/stream", json={"message": "Hi"})
            
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"
        content = response.content.decode("utf-8")
        assert "data:" in content
        assert "[DONE]" in content
        assert "Mocked answer" in content
