---
name: monorepo-clean-architecture
description: "Enforce architectural boundaries and file placement in monorepos combining Feature-Sliced Design (FSD) for frontend/client and Clean Architecture for backend/services. Use when creating, moving, or refactoring files, adding features, use cases, domain entities, repositories, controllers, widgets, or slices, or when deciding folder structure and checking dependency rules."
version: "3.4"
---

# Monorepo Architecture Guide & Pre-Creation Protocol

## Enterprise Monorepo Layout

Use this root layout for deployable Graph2Do workspaces:

```
apps/web/   # frontend FSD application
apps/api/   # backend Clean Architecture application
packages/   # shared contracts, UI, and configuration packages
infra/      # Docker, Terraform, and Kubernetes assets
docs/       # ADRs, API docs, and setup docs
scripts/    # maintenance and generation scripts
```

Frontend source lives under `apps/web/src/{app,pages,widgets,features,entities,shared}`. Backend source lives under `apps/api/app/{domain,application,infrastructure,presentation}`. CI and repository standards live under `.github/`.

## MANDATORY PRE-CREATION PROTOCOL

Before creating or moving ANY file, execute this thinking process:

1. **Target Area Identification:** Is this client/frontend or backend/service?
2. **Layer Selection & Justification:** State target layer and justify why it belongs there per FSD or Clean Architecture rules.
3. **Dependency Check:** Verify dependency direction (Inward for backend, Downward for frontend).
4. **Pre-Creation Path Validation (Level 3):** Run the deterministic validator:
   ```bash
   python .claude/skills/monorepo-clean-architecture/scripts/validate_placement.py --path <proposed/file/path>
   ```
5. **Post-Creation Import Validation (Level 3):** If code has imports, verify boundary compliance:
   ```bash
   python .claude/skills/monorepo-clean-architecture/scripts/validate_placement.py --check-imports <path/to/file>
   ```
6. **Public API Validation:** Ensure frontend slices export only through their `index.*` boundary.

---

## Architecture References (Level 3 Progressive Disclosure)

Read the specific reference guide only when working in that area:

| Area | Reference File | When to Consult |
|------|----------------|-----------------|
| Frontend | [`references/frontend-fsd.md`](references/frontend-fsd.md) | Client applications, UI components, FSD slices, state models |
| Backend | [`references/backend-clean-arch.md`](references/backend-clean-arch.md) | Services, domain logic, use cases, persistence adapters, APIs |

---

## Concrete Scenarios & Counter-Examples

### Scenario 1: New Backend Business Flow
- **Task:** "Add user registration workflow"
- **Thinking:** Core business logic orchestrating rules and ports → belongs in `application/use-cases`.
- **Placement:** `apps/api/src/application/use-cases/register-user.use-case.ts`
- **Dependency:** Inward only; depends on abstract `IUserRepository` (port in `domain/`).
- **❌ Violation:** Putting database queries or ORM models directly inside the use case or domain entity.

### Scenario 2: New Frontend Interactive Element
- **Task:** "Add dark/light theme switch button"
- **Thinking:** User action/feature → belongs in `features/`.
- **Placement:** `apps/web/src/features/theme-switcher/ui/theme-switch.tsx`
- **Public API:** `apps/web/src/features/theme-switcher/index.ts`
- **Dependency:** Downward only; imports from `shared/ui/button`.
- **❌ Violation:** Directly importing internal paths (`@/features/theme-switcher/ui/theme-switch`) from another feature or page.
