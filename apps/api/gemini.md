# FastAPI Backend Rules &amp; Guidelines

This document defines the rules and protocols for building the FastAPI backend using **Clean Architecture** and **SOLID** principles.

---

## 1. Core Architecture Principles

### Three-Layer Architecture

The project is structured into three distinct layers to ensure separation of concerns:

```
backend/app/
├── api/              # API Layer (Controllers, Routes, Schemas/DTOs)
├── domain/           # Domain Layer (Pure Business Logic, Entities, Abstract Interfaces)
└── infra/            # Infrastructure Layer (DB models, Repositories, Adapters, Concrete Services)
```

### Dependency Flow Rule

```
API Layer ──> Domain Layer <── Infrastructure Layer
```

- **Domain Layer** is the core. It must be completely framework-agnostic and database-agnostic. It must **NEVER** import anything from the `api` or `infra` layers.
- **API Layer** depends on the `domain` layer (interfaces, exceptions, entities).
- **Infrastructure Layer** implements the interfaces defined in the `domain` layer and imports domain models.
- Use dependency injection (e.g., `dependency_injector` or FastAPI dependency system) to wire components together.

---

## 2. Directory Layout &amp; Layer Responsibilities

```
backend/app/
├── api/             # API layer (v1/, schemas/, middlewares/)
├── domain/          # Core entities, interfaces, exceptions
└── infra/           # Native DB access, repos, adapters, services
├── main.py          # Entry point
├── config.py        # App settings
└── dependencies.py  # DI Container setup
```

---

## 3. Protocol &amp; Implementation Patterns

### 1. Domain Entities (`domain/modules/*/entity.py`)

- Use standard Python `@dataclass`.
- Must contain pure business attributes and rules.
- Framework-free (no SQLAlchemy, no Pydantic, no FastAPI imports).

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    id: int | None
    email: str
    is_active: bool
    created_at: datetime

    def deactivate(self) -> None:
        self.is_active = False
```

### 2. Repository Interface (`domain/modules/*/repository.py`)

- Use Python `abc.ABC` to declare contract.
- Methods represent business data access needs, returning domain entities.

```python
from abc import ABC, abstractmethod
from app.domain.modules.user.entity import User

class IUserRepository(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: int) -> User | None:
        pass

    @abstractmethod
    async def create(self, user: User) -> User:
        pass
```

### 3. Concrete Repository (`infra/repositories/*.py`)

- Implements the domain contract interface.
- Uses asynchronous PostgreSQL native packages (e.g. `asyncpg`), **NOT** an ORM.
- Maps native DB records directly to Domain Entities.

```python
import asyncpg
from app.domain.modules.user.entity import User
from app.domain.modules.user.repository import IUserRepository

class UserRepository(IUserRepository):
    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    async def get_by_id(self, user_id: int) -> User | None:
        async with self._pool.acquire() as conn:
            record = await conn.fetchrow('SELECT id, email, is_active, created_at FROM users WHERE id = $1', user_id)
            return self._to_entity(record) if record else None

    def _to_entity(self, record: asyncpg.Record) -> User:
        return User(id=record['id'], email=record['email'], is_active=record['is_active'], created_at=record['created_at'])
```

### 4. Dependency Injection (`dependencies.py` / `config.py`)

- Wires native DB pool, repository, and service factories. Provides dependencies to endpoints via standard `Depends`.

---

## 4. Endpoints &amp; Exception Flow

- **Endpoint Rules:** No business logic in endpoints. They handle parsing, executing service, and returning response models. Annotate dependencies cleanly (e.g. `DbPool = Annotated[asyncpg.Pool, Depends(get_db)]`).
- **Exception Flow:** Services raise domain-specific exceptions. Middlewares convert domain exceptions to proper HTTP status codes. Endpoints do not require `try/except` blocks for these standard domain exceptions.

---

## 5. Testing Protocols

- **Real-World E2E Testing:** Testing must happen with the backend server running properly in a terminal.
- **HTTP Requests:** Tests must use HTTP methods to hit the endpoint directly, simulating a real-world frontend scenario.
- **No Mock APIs:** Do not test APIs without real HTTP requests to the running server.
- **Completion Condition:** Only after this real-world endpoint testing is successful can a task be considered "completed". Never state a task is completed without this explicit testing protocol.

---

## 6. Database Schema

Information about the database schema from the MCP server is stored locally in `app/infra/database/schema.json`.