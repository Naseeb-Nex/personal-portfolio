# System Architecture & Technical Specifications

This document defines the internal architecture, technology stack, scope, and folder structure for the Portfolio Chat Agent. 

## 1. Scope & High-Level Architecture

The project is split into a decoupled frontend and backend.
- **Frontend**: A lightweight, fast, and responsive React + Vite application that serves the portfolio and the interactive chat widget.
- **Backend**: A robust, AI-powered FastAPI backend responsible for LLM orchestration, session management, vector search (RAG), and data persistence.

Communication between frontend and backend happens via REST APIs for sessions and Server-Sent Events (SSE) for real-time AI responses.

## 2. Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS (`global.css` and `App.css`). No complex CSS frameworks (like Tailwind) are used to keep it simple and flexible.
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python)
- **Dependency Injection**: Native FastAPI `Depends` system.
- **Database / Persistence**: PostgreSQL using native async connectors (`asyncpg`).
- **Caching & Rate Limiting**: Redis
- **Vector Store (RAG)**: ChromaDB (via abstracted `IKnowledgeRepository`)
- **AI/LLM Orchestration**: LangGraph for agent workflow and tool calling.
- **Default LLM Provider**: Gemini Models (via abstracted `ILLMProvider`)
- **Session Security**: PyJWT for stateless JSON Web Tokens.

## 3. Directory & Folder Structure

The project root separates concerns cleanly into two main folders:

```text
/
├── frontend/             # React + Vite UI application
│   ├── src/
│   │   ├── features/     # Feature-sliced domain & infrastructure logic
│   │   ├── shared/       # Cross-cutting UI and domain types
│   │   ├── pages/        # Route level components
│   │   ├── layouts/      # Layout wrappers
│   │   └── styles/       # Global vanilla styles (global.css, App.css)
│   └── gemini.md         # Frontend Architecture Rules & Guidelines
├── backend/              # FastAPI Python backend
│   ├── app/              # Core backend application (Clean Architecture)
│   │   └── infra/database/schema.json # Local copy of MCP database schemas
│   └── gemini.md         # FastAPI Backend Rules & Guidelines
├── ARCHITECTURE.md       # System Architecture & Technical Specifications
└── PRD.md                # Product Requirements Document
```

## 4. Backend Clean Architecture

The backend strictly follows a **Three-Layer Clean Architecture** to ensure testability, scalability, and separation of concerns.

### Dependency Flow Rule
`API Layer ──> Domain Layer <── Infrastructure Layer`
- **Domain Layer**: The core business logic. Pure Python. Zero imports from `api` or `infra`.
- **API Layer**: Route handlers, endpoints, and HTTP validation.
- **Infrastructure Layer**: Concrete implementations of domain interfaces (Database Repositories, LLM clients, Vector stores).

### Detailed Backend Structure

```text
backend/app/
├── main.py              # Application entry point & lifespan
├── config.py            # App settings (Pydantic settings)
├── dependencies.py      # DI Container setup & global dependency providers (using FastAPI Depends)
├── api/                 # API Layer
│   ├── v1/
│   │   ├── endpoints/   # Route handlers (Controllers: /chat, /session)
│   │   └── router.py    # Router aggregation
│   ├── schemas/         # Request/Response Pydantic models (DTOs)
│   └── middlewares/     # HTTP Middlewares (Rate limiting, auth)
├── domain/              # Domain Layer
│   ├── modules/         # Domain business domains
│   │   ├── session/     # Session entities, IRepository, service
│   │   ├── chat/        # Chat message entities, orchestrator interfaces
│   │   └── agent/       # LLM provider and Knowledge repo abstract interfaces
│   └── shared/          # Shared domain entities / values
└── infra/               # Infrastructure Layer
    ├── database/        # Asyncpg connections, migrations
    ├── repositories/    # Concrete DB Repositories (Postgres, Redis)
    ├── adapters/        # External service integration (Gemini LLM SDK, ChromaDB client)
    └── services/        # Concrete Service implementations (LangGraph workflow)
```

## 5. Implementation Patterns

1. **Domain Entities**: Defined using standard Python `@dataclass`. Pure business attributes only.
2. **Abstract Interfaces**: Defined using Python `abc.ABC`. The `domain` layer defines what is needed (e.g., `IKnowledgeRepository`, `ILLMProvider`).
3. **Concrete Implementations**: The `infra` layer implements these interfaces (e.g., `ChromaDBKnowledgeRepository`, `GeminiLLMProvider`).
4. **Endpoints**: Endpoints in `api` contain no business logic. They parse requests, inject dependencies using FastAPI `Depends`, call services, and return responses. All domain exceptions are caught by global exception handlers.

## 6. Frontend Clean Architecture

The frontend follows a strict Feature-Sliced Clean Architecture separating pure domain logic from impure React components and API calls.

### Dependency Flow
The domain layer stays testable without mocks and portable. The dependency arrow points one way:
`infrastructure/ ──> domain/`
- **`domain/`** never imports from `infrastructure/`, React, or any external library.
- **`infrastructure/`** can import from `domain/`.
- **`shared/domain/`** never imports from `infrastructure/`.

### Detailed Frontend Structure

```text
frontend/src/
├── features/
│   └── <feature>/
│       ├── domain/                  # PURE: no React/fetch imports
│       │   ├── <feature>.model.ts       # Types/interfaces for the domain
│       │   ├── <feature>.repository.ts  # SPI (interface) for data access
│       │   ├── <feature>.service.ts     # Pure business logic (validation, calculations)
│       │   └── referentials/            # Constants and option lists
│       └── infrastructure/          # IMPURE: external dependencies
│           ├── api/                     # Repository implementations (fetch)
│           ├── mappers/                 # API ↔ domain transformations
│           ├── hooks/                   # React orchestration (state + side-effects)
│           └── components/              # React components (Container + Presentation)
├── shared/
│   ├── domain/                      # Cross-cutting types and errors (ApiError)
│   └── infrastructure/
│       └── components/              # Reusable UI components (Button, Input)
├── pages/                           # Route level components
├── layouts/                         # Layout wrappers
└── styles/                          # Global CSS + tokens (global.css, App.css)
```

For more detailed rules, anti-patterns, and naming conventions, refer to `frontend/gemini.md`.
