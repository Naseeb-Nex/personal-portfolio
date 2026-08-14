# Portfolio Chat Agent — Backend Implementation Plan

## Goal Description
Implement the backend for a public-facing portfolio website chat widget. The backend will use FastAPI for edge routing/SSE streaming, LangGraph for agent orchestration, ChromaDB for profile data RAG, and Redis/Postgres for session/rate limiting/bot protection. The system is designed for public access without user login, featuring robust abuse prevention and tool calling for rendering structured UI cards.

## User Review Required
> [!IMPORTANT]
> - **Clean Architecture Layout**: This plan strictly adheres to the Clean Architecture layout specified in `backend/gemini.md`, overriding the flat structure initially suggested in the BRD.
> - **ChromaDB Mode**: Assuming local ephemeral or persistent ChromaDB instance inside a Docker container (client/server mode).

## Open Questions
> [!WARNING]
> - **Database Migrations**: Does the Postgres database already exist, or do I need to initialize it with Alembic? I assume Alembic is required.
> - **LLM Provider**: The BRD mentions "Anthropic" as default. Do we need an Anthropic API key to proceed with local testing during implementation?

## Proposed Changes

### Docker & Infrastructure
Sets up the foundational containers (Postgres, Redis, ChromaDB).

#### [NEW] `docker-compose.yml`
#### [NEW] `Dockerfile`
#### [NEW] `backend/.env.example`

### Application Root (`app/`)
#### [NEW] `backend/app/main.py`
Application entry point, FastAPI app initialization, router inclusion, and lifespan events (DB connection, Redis connection).
#### [NEW] `backend/app/config.py`
Pydantic Settings for env vars (DB URLs, keys).
#### [NEW] `backend/app/dependencies.py`
DI Container setup (DB session, repositories, services).

### API Layer (`app/api/`)
API Layer (Controllers, Routes, Schemas/DTOs). Depends only on Domain.

#### [NEW] `backend/app/api/v1/router.py`
Aggregates routers.
#### [NEW] `backend/app/api/v1/endpoints/session.py`
`POST /session/init` endpoint issuing JWTs.
#### [NEW] `backend/app/api/v1/endpoints/chat.py`
`POST /chat` SSE streaming endpoint.
#### [NEW] `backend/app/api/schemas/session.py`
DTOs for session initialization.
#### [NEW] `backend/app/api/schemas/chat.py`
DTOs for chat requests and card JSON schemas.
#### [NEW] `backend/app/api/middlewares/rate_limit.py`
HTTP Middleware for Redis rate limiting.

### Domain Layer (`app/domain/`)
Domain Layer (Pure Business Logic, Entities, Abstract Interfaces). Framework-agnostic.

#### Session Module
#### [NEW] `backend/app/domain/modules/session/entity.py`
`Session`, `AbuseEvent` dataclasses.
#### [NEW] `backend/app/domain/modules/session/repository.py`
`ISessionRepository` abstract base class.
#### [NEW] `backend/app/domain/modules/session/service.py`
`ISessionService` abstract base class (init session, validate token).
#### [NEW] `backend/app/domain/modules/session/exceptions.py`
Domain exceptions (`SessionInvalidError`, `RateLimitExceededError`).

#### Chat Module
#### [NEW] `backend/app/domain/modules/chat/entity.py`
`Message`, `CardType`, `CardPayload`, `LLMResponse`, `LLMChunk` dataclasses.
#### [NEW] `backend/app/domain/modules/chat/repository.py`
`IChatLogRepository` abstract base class.
#### [NEW] `backend/app/domain/modules/chat/service.py`
`IChatAgentService` abstract base class (handle stream chat).
#### [NEW] `backend/app/domain/modules/chat/exceptions.py`
Domain exceptions (`ChatProcessingError`).

#### Knowledge Module
#### [NEW] `backend/app/domain/modules/knowledge/entity.py`
`KnowledgeChunk` dataclass.
#### [NEW] `backend/app/domain/modules/knowledge/repository.py`
`IKnowledgeRepository` abstract base class (semantic search).

### Infrastructure Layer (`app/infra/`)
Infrastructure Layer (DB models, Repositories, Adapters, Concrete Services). Implements Domain contracts.

#### Database Config & ORM Models
#### [NEW] `backend/app/infra/database/postgres.py`
SQLAlchemy AsyncSession setup.
#### [NEW] `backend/app/infra/database/redis_client.py`
Redis async client connection.
#### [NEW] `backend/app/infra/database/models.py`
SQLAlchemy ORM Models (`SessionModel`, `ChatLogModel`, `AbuseEventModel`).

#### Concrete Repositories
#### [NEW] `backend/app/infra/repositories/session.py`
Implements `ISessionRepository` using Postgres.
#### [NEW] `backend/app/infra/repositories/chat.py`
Implements `IChatLogRepository` using Postgres.
#### [NEW] `backend/app/infra/repositories/knowledge.py`
Implements `IKnowledgeRepository` using ChromaDB client.

#### External Adapters
#### [NEW] `backend/app/infra/adapters/llm/provider.py`
Implements `LLMProvider` using Anthropic/OpenAI async SDKs.

#### Concrete Services (Business Orchestrators)
#### [NEW] `backend/app/infra/services/session_service.py`
Implements `ISessionService` (manages tokens, talks to session repo).
#### [NEW] `backend/app/infra/services/chat_agent_service.py`
Implements `IChatAgentService`. This contains the **LangGraph orchestrator**. It wires up the LLM provider, tools, and executes the graph, yielding chunks.
#### [NEW] `backend/app/infra/services/agent_tools.py`
LangGraph tools implementation (Profile cards, fetching from knowledge repo).

## Verification Plan

### Automated Tests
1. **Domain Tests**: Test entity logic and validation in `app/domain/`.
2. **Infrastructure Tests**: Test Postgres mapping, Redis rate limit, and LangGraph flow with mocked LLM.
3. **API Integration Tests**: 
   - `pytest tests/api/v1/test_session.py`
   - `pytest tests/api/v1/test_chat.py`

### Manual Verification
- `docker-compose up --build`
- Use `curl` or Postman to initialize a session and obtain a JWT.
- Send a `POST /chat` request with the JWT and verify SSE chunked stream output.
