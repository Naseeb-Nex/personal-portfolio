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

The project root separates concerns into applications, packages, and infra:

```text
/
├── apps/
│   ├── web/              # React + Vite UI application (FSD v2.1)
│   │   ├── src/
│   │   │   ├── app/      # Providers, global styles, entry points
│   │   │   ├── pages/    # Route-level page components (HomePage)
│   │   │   ├── widgets/  # Autonomous composite UI blocks
│   │   │   ├── features/ # User interactions & flows (chat, theme-toggle)
│   │   │   ├── entities/ # Business domain entities
│   │   │   └── shared/   # Reusable UI, theme, assets, libs
│   │   └── gemini.md     # Frontend Architecture Rules & Guidelines
│   └── api/              # FastAPI Python backend (Clean Architecture)
│       ├── app/
│       │   ├── presentation/ # HTTP endpoints, routers, dependencies
│       │   ├── domain/       # Core entities and repository interfaces
│       │   └── infrastructure/ # DB repos, LLM/vector adapters, agent service
│       │       └── database/schema.json # Database schema definition
│       └── gemini.md     # FastAPI Backend Rules & Guidelines
├── packages/             # Shared contracts, UI, configurations
├── infra/                # Infrastructure and deployment assets
├── docs/                 # Documentation & ADRs
├── ARCHITECTURE.md       # System Architecture & Technical Specifications
└── PRD.md                # Product Requirements Document
```

## 4. Backend Clean Architecture

The backend strictly follows **Clean Architecture** to ensure testability, scalability, and separation of concerns.

### Dependency Flow Rule
`Presentation Layer ──> Domain Layer <── Infrastructure Layer`
- **Domain Layer**: The core business logic. Pure Python. Zero imports from `presentation` or `infrastructure`.
- **Presentation Layer**: Route handlers, endpoints, dependency injection, and HTTP validation.
- **Infrastructure Layer**: Concrete implementations of domain interfaces (Database Repositories, LLM clients, Vector stores, Services).

### Detailed Backend Structure

```text
apps/api/app/
├── main.py              # Application entry point & lifespan
├── config.py            # App settings (Pydantic settings)
├── dependencies.py      # Global DI container & dependency providers
├── presentation/        # Presentation Layer
│   ├── endpoints/       # Route handlers (chat, session, health)
│   ├── router.py        # Router aggregation
│   └── deps.py          # Presentation dependencies
├── domain/              # Domain Layer
│   └── modules/         # Domain business modules
│       ├── session/     # Session entities & repository interfaces
│       └── agent/       # Agent entities & repository interfaces
└── infrastructure/      # Infrastructure Layer
    ├── database/        # Asyncpg connections & schema.json
    ├── repositories/    # Concrete DB Repositories (session repository)
    ├── adapters/        # External service integration (LLM, Vector store)
    └── services/        # Concrete Service implementations (Agent service)
```

## 5. Implementation Patterns

1. **Domain Entities**: Defined using standard Python `@dataclass`. Pure business attributes only.
2. **Abstract Interfaces**: Defined using Python `abc.ABC`. The `domain` layer defines what is needed (e.g., `IAgentRepository`, `ISessionRepository`).
3. **Concrete Implementations**: The `infrastructure` layer implements these interfaces (e.g., `SessionRepository`, LLM adapters).
4. **Endpoints**: Endpoints in `presentation/endpoints` contain no business logic. They parse requests, inject dependencies using FastAPI `Depends`, call services, and return responses.

## 6. Frontend Architecture (Feature-Sliced Design)

The frontend strictly follows **Feature-Sliced Design (FSD v2.1)** architecture.

### Layer Hierarchy & Dependency Direction
Imports flow strictly downward:
`app` ──> `pages` ──> `widgets` ──> `features` ──> `entities` ──> `shared`
- Cross-slice imports within the same layer are forbidden.
- External imports must import only through the slice's public API (`index.ts`).

### Detailed Frontend Structure

```text
apps/web/src/
├── app/                 # Application initialization, root App, global styles
│   ├── styles/          # Vanilla global styles (global.css, App.css)
│   ├── App.tsx          # Root application component
│   └── main.tsx         # Entry point
├── pages/               # Composition layer for complete views
│   └── home/            # Home page (index.ts, ui/HomePage.tsx)
├── widgets/             # Autonomous composition blocks combining features/entities
├── features/            # User interactions and business workflows
│   ├── chat/            # Chat widget feature
│   │   ├── api/         # API repository implementations (SSE / fetch)
│   │   ├── model/       # Models, types, state hooks (useChat)
│   │   ├── ui/          # UI components (ChatWidget, Cards)
│   │   └── index.ts     # Public API
│   └── theme-toggle/    # Theme toggle feature (ui/ThemeToggle.tsx, index.ts)
├── entities/            # Business entities (types, state, UI fragments)
└── shared/              # Reusable foundation
    ├── assets/          # Icons, fonts, images, 3D models
    ├── theme/           # Theme provider and tokens
    └── ui/              # Reusable UI primitives (Preloader, CinematicName, etc.)
```

For more detailed rules, anti-patterns, and naming conventions, refer to `apps/web/gemini.md` and `apps/api/gemini.md`.
