# Frontend Clean Architecture Rules & Guidelines

## Architecture

```text
src/
├── features/
│   └── <feature>/
│       ├── domain/                  ← PURE: no React/fetch imports
│       │   ├── <feature>.model.ts       types/interfaces for the domain
│       │   ├── <feature>.repository.ts  SPI (interface) for data access
│       │   ├── <feature>.service.ts     pure business logic (validation, calculations)
│       │   └── referentials/            constants and option lists
│       └── infrastructure/          ← IMPURE: external dependencies
│           ├── api/                     repository implementations (fetch)
│           ├── mappers/                 API ↔ domain transformations
│           ├── hooks/                   React orchestration (state + side-effects)
│           └── components/              React components (Container + Presentation)
├── shared/
│   ├── domain/                      cross-cutting types and errors
│   └── infrastructure/
│       └── components/              reusable UI components
├── styles/                          global CSS + tokens
```

## Rules

### Dependency Direction

The domain layer stays testable without mocks and portable across frameworks only if it never depends on how data is fetched or rendered. So the dependency arrow points one way:

- `domain/` never imports from `infrastructure/`, React, or any external library.
- `infrastructure/` can import from `domain/`.
- `shared/domain/` never imports from `infrastructure/`.

### Domain Layer (`domain/`)

- **Models** (`<feature>.model.ts`): TypeScript types and interfaces describing domain concepts. No framework types.
- **Repository interfaces** (`<feature>.repository.ts`): SPI (Service Provider Interface). Defines WHAT data access is needed.
- **Services** (`<feature>.service.ts`): Pure functions only. No fetch, no useState. Input → output. Testable without mocks.
- **Referentials** (`referentials/*.referentials.ts`): Constants and generator functions for option lists.

### Infrastructure Layer (`infrastructure/`)

- **API** (`api/<feature>.api-repository.ts`): Implements the repository interface from domain. Contains `fetch` calls, error handling, HTTP concerns.
- **Mappers** (`mappers/<feature>.mapper.ts`): Transformation between API types and domain types.
- **Hooks** (`hooks/use<Feature>.ts`): Orchestrate React state + domain services + repository calls. Glue between pure domain and impure React.
- **Components** (`components/`): Follow Container/Presentation pattern.

### Anti-patterns to Avoid

- `fetch()` in a component → move to `api/` repository
- Formatting logic inline in JSX → move to domain service
- Business logic in a hook → extract to domain service, hook only orchestrates
- Mapping API response fields in a component → use a mapper
