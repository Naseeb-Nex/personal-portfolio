from fastapi import APIRouter
from app.api.endpoints import health, session, chat

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(session.router, prefix="/session", tags=["session"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

