from typing import List, Dict, Any
from app.domain.modules.agent.repository import IKnowledgeRepository

class ChromaDBAdapter(IKnowledgeRepository):
    def __init__(self):
        # In a real scenario, initialize chromadb client here
        pass

    async def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        # Mock search for now
        return [
            {"content": "Mock document about skills", "metadata": {"source": "resume"}},
            {"content": "Mock document about projects", "metadata": {"source": "portfolio"}}
        ]
