from typing import List, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from app.domain.modules.agent.repository import ILLMProvider
from app.domain.modules.agent.entity import ChatMessage
from app.config import settings

class GeminiLLMProvider(ILLMProvider):
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,
            google_api_key=settings.GEMINI_API_KEY
        )

    async def generate_response(self, messages: List[ChatMessage], tools: List[Any] = None) -> Any:
        # Convert internal ChatMessage to LangChain format if needed
        # Assuming we just pass it to the bound LLM
        formatted = [(m.role, m.content) for m in messages]
        
        if tools:
            bound_llm = self.llm.bind_tools(tools)
            return await bound_llm.ainvoke(formatted)
        return await self.llm.ainvoke(formatted)
