from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Annotated
from app.infra.database.database import get_db, DB_URL
import asyncpg
from app.infra.services.agent import PortfolioAgent
from app.infra.adapters.llm import GeminiLLMProvider
from app.infra.adapters.vector_store import ChromaDBAdapter
import json
import asyncio
from app.api.deps import get_current_session_id

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

async def generate_chat_events(message: str, agent: PortfolioAgent, session_id: str, db_url: str):
    # This is a mock streaming generator for SSE
    # In a real app we would stream directly from the LangGraph astream_events
    result = await agent.run(message, session_id, db_url)
    # Simulate processing delay
    await asyncio.sleep(0.1)
    
    # We yield a thinking state
    yield f"data: {json.dumps({'type': 'thinking', 'content': '...'})}\n\n"
    
    # Simulate UI Component generation
    ui_component = {
        "type": "ui",
        "component": "ProjectCard",
        "data": {"title": "Portfolio Backend", "tech": "FastAPI"}
    }
    yield f"data: {json.dumps(ui_component)}\n\n"
    
    # Yield final text answer
    final_text = result[-1].content if result else "No answer"
    yield f"data: {json.dumps({'type': 'text', 'content': final_text})}\n\n"
    yield "data: [DONE]\n\n"

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    session_id: Annotated[str, Depends(get_current_session_id)],
    db: Annotated[asyncpg.Pool, Depends(get_db)]
):
    # Dependencies usually injected better, this is simplified
    llm = GeminiLLMProvider()
    repo = ChromaDBAdapter()
    agent = PortfolioAgent(llm, repo)
    
    return StreamingResponse(
        generate_chat_events(request.message, agent, session_id, DB_URL),
        media_type="text/event-stream"
    )
