# Frontend Architecture - Feature-Sliced Design (FSD v2.1)

Covers client/frontend applications.

---

## Core Philosophy: Anti-Speculation & Progressive Extraction

- **No Premature Complexity:** Do not create layers (`entities`, `features`, `widgets`) speculatively. Start with simple page-level organization (`app`, `pages`, `shared`) and introduce middle layers only when active reuse demands them.
- **Single-Use Locality:** If a component, view model, or utility is used in only one place, keep it local to that page/feature. Extract to `entities/` or `features/` *only* when actively used in multiple places, has stable boundaries, and represents a focused responsibility.

---

## Layer Hierarchy

```
app > pages > widgets > features > entities > shared
(imports flow downward only - never upward, never sideways between siblings)
```

| Layer | Purpose | Scope |
|-------|---------|-------|
| `app/` | Global initialization, composition root, global styles/routing setup | Application entry |
| `pages/` | Route/screen views - orchestration of widgets and features | Views / screens |
| `widgets/` | Autonomous composite UI blocks combining multiple features | Complex compositions |
| `features/` | User actions and interaction flows bringing business value | User actions |
| `entities/` | Business concepts/domain models with UI representation and state | Business concepts |
| `shared/` | Reusable primitives: UI kits, API clients, helpers, configurations | Base utilities |

---

## Slice Internal Structure

Every slice inside `pages/`, `widgets/`, `features/`, or `entities/` follows this standard segment breakdown:

```
<slice-name>/
├── ui/           # Visual presentation components
├── model/        # Business logic, state stores, selectors, actions
├── api/          # Data-fetching, queries, mutations, remote calls
├── lib/          # Utilities scoped strictly to this slice
└── index.*       # Public API - the ONLY entry point for external imports
```

### The Public API Rule
External code imports **ONLY** from a slice's root public API (`index.*`). Never reach into internal segment paths:

```ts
// ✅ correct
import { AddToCartButton } from '@/features/add-to-cart'

// ❌ violation - internal segment path exposed
import { AddToCartButton } from '@/features/add-to-cart/ui/add-to-cart-button'
```

---

## Dependency Rules

1. **Downward only:** Modules may only import from layers strictly below them in the hierarchy.
2. **Horizontal prohibition:** Cross-imports between slices on the same layer are strictly disallowed.
3. **The `@x` pattern:** When two slices on the same layer must interact, lift the shared responsibility down into an underlying entity or shared module, or coordinate them at a higher level (widget/page).

```ts
// ❌ horizontal coupling violation (features importing features)
import { cartItems } from '@/features/cart'

// ✅ correct resolution - extract shared data/state down to entities
import { cartItems } from '@/entities/cart'
```

---

## Layer Decision Guide

| Question | Target Layer |
|----------|--------------|
| Is it application startup, global providers, or entry configuration? | `app/` |
| Is it a route/screen entry point assembling widgets? | `pages/` |
| Does it combine multiple features into a self-contained visual block? | `widgets/` |
| Is it a specific user interaction, action, or workflow? | `features/` |
| Is it a core business concept with related data model and presentation? | `entities/` |
| Is it a domain-agnostic primitive, design system element, or utility? | `shared/` |
