from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from typing import Annotated
import asyncpg
from datetime import datetime, timezone
import uuid
import jwt
from app.infra.database.database import get_db
from app.infra.repositories.session import SessionRepository
from app.domain.modules.session.entity import Session
from app.config import settings

router = APIRouter()

class SessionResponse(BaseModel):
    token: str
    session_id: str

@router.post("/init", response_model=SessionResponse)
async def init_session(request: Request, db: Annotated[asyncpg.Pool, Depends(get_db)]):
    repo = SessionRepository(db)
    session_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)
    now_naive = now_utc.replace(tzinfo=None)
    
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    new_session = Session(
        id=session_id,
        ip_address=ip_address,
        user_agent=user_agent,
        created_at=now_naive,
        last_active_at=now_naive,
        is_active=True
    )
    
    await repo.create(new_session)
    
    token = jwt.encode(
        {"sub": session_id, "exp": int(now_utc.timestamp()) + 3600},
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    
    return SessionResponse(token=token, session_id=session_id)
