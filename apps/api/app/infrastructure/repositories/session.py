import asyncpg
from typing import Optional
from app.domain.modules.session.entity import Session
from app.domain.modules.session.repository import ISessionRepository

class SessionRepository(ISessionRepository):
    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    async def get_by_id(self, session_id: str) -> Optional[Session]:
        async with self._pool.acquire() as conn:
            record = await conn.fetchrow('SELECT id, ip_address, user_agent, created_at, last_active_at, is_active FROM sessions WHERE id = $1', session_id)
            return self._to_entity(record) if record else None

    async def create(self, session: Session) -> Session:
        async with self._pool.acquire() as conn:
            await conn.execute(
                'INSERT INTO sessions (id, ip_address, user_agent, created_at, last_active_at, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                session.id, session.ip_address, session.user_agent, session.created_at, session.last_active_at, session.is_active
            )
        return session

    async def update(self, session: Session) -> Session:
        async with self._pool.acquire() as conn:
            await conn.execute(
                'UPDATE sessions SET is_active = $1, last_active_at = $2 WHERE id = $3',
                session.is_active, session.last_active_at, session.id
            )
        return session

    def _to_entity(self, record: asyncpg.Record) -> Session:
        return Session(
            id=record['id'],
            ip_address=record['ip_address'],
            user_agent=record['user_agent'],
            created_at=record['created_at'],
            last_active_at=record['last_active_at'],
            is_active=record['is_active']
        )
