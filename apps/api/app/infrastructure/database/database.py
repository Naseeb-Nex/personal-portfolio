import asyncpg
import os
from typing import AsyncGenerator

from app.config import settings

DB_URL = settings.DATABASE_URL or os.getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/portfolio")

pool = None

async def get_db() -> AsyncGenerator[asyncpg.Pool, None]:
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(DB_URL)
    yield pool
