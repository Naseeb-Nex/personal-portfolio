# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Architecture & Monorepo Standard

All agents in this repository must strictly adhere to the monorepo clean-architecture standard defined in `.pi/skills/monorepo-clean-architecture/SKILL.md`.

### Monorepo Layout
```
apps/web/       # Frontend Feature-Sliced Design (FSD) application
apps/api/       # Backend Clean Architecture FastAPI application
packages/       # Shared contracts, UI, configurations
infra/          # Docker, deployment, infrastructure assets
docs/           # Documentation, ADRs, migration maps
scripts/        # Maintenance and generation scripts
```

### Frontend Architecture (FSD v2.1)
- Source root: `apps/web/src/{app,pages,widgets,features,entities,shared}`
- **Layer Hierarchy (downward imports only):**
  `app` > `pages` > `widgets` > `features` > `entities` > `shared`
- **Horizontal Imports Forbidden:** Slices on the same layer cannot import from each other. Coordinate via upper layer or extract to lower layer.
- **Slice Structure:** `<slice>/ui`, `<slice>/model`, `<slice>/api`, `<slice>/lib`, and `<slice>/index.ts`.
- **Public API Rule:** External imports must ONLY import from the slice root (`@/layer/slice` or relative `./index`). Deep slice imports (e.g. `@/features/foo/ui/Bar`) are forbidden.
- **Design System:** Pure `#000000` dark background, light/dark theme persistence (`portfolio-theme`), animations, and CSS classes must remain intact.

### Backend Architecture (Clean Architecture)
- Source root: `apps/api/app/{domain,application,infrastructure,presentation}`
- **Inward Dependency Rule:** Dependencies point strictly inward. Outer layers depend on inner abstractions.
  - `domain/`: Business entities, value objects, ports (abstract interfaces). Zero framework or external I/O imports.
  - `application/`: Use cases, application business logic, DTOs. Imports `domain/` only.
  - `infrastructure/`: Concrete database adapters, external APIs, repository implementations.
  - `presentation/`: FastAPI routes, endpoints, controllers, request/response models.

### Boundary Validation
Before creating or modifying files, validate placement and imports:
```bash
python3 .pi/skills/monorepo-clean-architecture/scripts/validate_placement.py --path <path>
python3 .pi/skills/monorepo-clean-architecture/scripts/validate_placement.py --check-imports <path>
```

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
