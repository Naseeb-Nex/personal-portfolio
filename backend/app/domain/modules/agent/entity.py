from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class ChatMessage:
    role: str
    content: str

@dataclass
class AgentResponse:
    messages: List[ChatMessage]
    ui_components: List[Dict[str, Any]]
