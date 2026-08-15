# FastAPI Backend Rules & Guidelines

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
* **Domain Layer** is the core. It must be completely framework-agnostic and database-agnostic. It must **NEVER** import anything from the `api` or `infra` layers.
* **API Layer** depends on the `domain` layer (interfaces, exceptions, entities).
* **Infrastructure Layer** implements the interfaces defined in the `domain` layer and imports domain models.
* Use dependency injection (e.g., `dependency_injector` or FastAPI dependency system) to wire components together.

---

## 2. Directory Layout & Layer Responsibilities

```
backend/app/
├── main.py              # Application entry point & lifespan
├── config.py            # App settings (Pydantic settings)
├── dependencies.py      # DI Container setup & global dependency providers
├── api/                 # API Layer
│   ├── v1/
│   │   ├── endpoints/   # Route handlers (Controllers)
│   │   └── router.py    # Router aggregation
│   ├── schemas/         # Request/Response Pydantic models (DTOs)
│   └── middlewares/     # HTTP Middlewares (Auth, Error handling)
├── domain/              # Domain Layer
│   ├── modules/         # Domain business domains
│   │   ├── user/
│   │   │   ├── entity.py       # Domain entities (Dataclasses)
│   │   │   ├── repository.py   # Abstract IUserRepository
│   │   │   ├── service.py      # Abstract IUserService
│   │   │   └── exceptions.py   # Domain exceptions
│   └── shared/          # Shared domain entities / values
└── infra/               # Infrastructure Layer
    ├── database/        # DB Session, SQLAlchemy config, Migrations
    ├── repositories/    # Concrete DB Repositories (implementing domain contracts)
    ├── adapters/        # External service integration (SSO, Gateways, Email)
    └── services/        # Concrete Service implementations (business flow orchestrators)
```

---

## 3. Protocol & Implementation Patterns

### 1. Domain Entities (`domain/modules/*/entity.py`)
* Use standard Python `@dataclass`.
* Must contain pure business attributes and rules.
* Framework-free (no SQLAlchemy, no Pydantic, no FastAPI imports).

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
* Use Python `abc.ABC` to declare contract.
* Methods represent business data access needs, returning domain entities.

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
* Implements the domain contract interface.
* Uses SQLAlchemy ORM and translates ORM models to/from Domain Entities.

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.modules.user.entity import User
from app.domain.modules.user.repository import IUserRepository
from app.infra.database.models import UserModel # ORM Model

class UserRepository(IUserRepository):
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    def _to_entity(self, model: UserModel) -> User:
        return User(id=model.id, email=model.email, is_active=model.is_active, created_at=model.created_at)
```

### 4. Dependency Injection (`dependencies.py` / `config.py`)
* Wires up database session, repository factory, and service factory.
* Provides these dependencies to FastAPI endpoints via standard `Depends`.

---

## 4. Endpoints & Exception Flow

### Endpoint Rules
* **No business logic** in endpoints. Endpoints only handle parsing requests, executing the service, and returning response models.
* Annotate dependencies cleanly:
```python
DbSession = Annotated[AsyncSession, Depends(get_db)]
```

### Exception Flow Rule
* Services raise domain-specific exceptions (e.g. `UserNotFoundError`).
* Custom middleware or exception handlers catch domain exceptions and convert them to proper HTTP status code responses (e.g. `404 Not Found`).
* Endpoints do not require `try/except` blocks for standard domain exceptions.

---

## 5. Testing Protocols

Implement three levels of testing:
1. **Domain Unit Tests**: Test entity rules and pure business methods without mocking databases.
2. **Service / Repository Tests**: Test database integrations with mocked databases or in-memory sqlite engine.
3. **API Integration Tests**: Use `httpx.AsyncClient` to perform test requests and assert HTTP statuses and responses.

---

## 6. Database Schema

Information about the database schema from the MCP server is stored locally in `app/infra/database/schema.json`.
