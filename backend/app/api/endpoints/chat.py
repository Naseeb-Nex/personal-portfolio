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
    # Run LangGraph Agent
    result = await agent.run(message, session_id, db_url)
    
    # We yield a thinking state
    yield f"data: {json.dumps({'type': 'thinking', 'content': '...'})}\n\n"
    
    # Stream UI Component if present
    ui_component = result.get("ui_component")
    if ui_component:
        yield f"data: {json.dumps(ui_component)}\n\n"
    
    # Yield final text answer
    messages = result.get("messages", [])
    final_text = messages[-1].content if messages else "No answer"
    yield f"data: {json.dumps({'type': 'text', 'content': final_text})}\n\n"
    yield "data: [DONE]\n\n"

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    session_id: Annotated[str, Depends(get_current_session_id)],
    db: Annotated[asyncpg.Pool, Depends(get_db)]
):
    llm = GeminiLLMProvider()
    repo = ChromaDBAdapter()
    agent = PortfolioAgent(llm, repo)
    
    return StreamingResponse(
        generate_chat_events(request.message, agent, session_id, DB_URL),
        media_type="text/event-stream"
    )
