from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.domain.modules.agent.entity import ChatMessage

class IKnowledgeRepository(ABC):
    @abstractmethod
    async def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        pass

class ILLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, messages: List[ChatMessage], tools: List[Any] = None) -> Any:
        pass
