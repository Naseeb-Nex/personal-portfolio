import pytest
from app.infrastructure.adapters.llm import GeminiLLMProvider
from app.infrastructure.adapters.vector_store import ChromaDBAdapter
from app.infrastructure.services.agent import PortfolioAgent
from langchain_core.messages import AIMessage

class MockLLM:
    async def ainvoke(self, messages):
        return AIMessage(content="Hello from mock AI")

class MockGeminiProvider:
    def __init__(self):
        self.llm = MockLLM()

@pytest.mark.asyncio
async def test_agent_graph():
    llm = MockGeminiProvider()
    repo = ChromaDBAdapter()
    
    agent = PortfolioAgent(llm, repo)
    result = await agent.run("Hello")
    
    assert len(result) > 0
    assert result[-1].content == "Hello from mock AI"
