# Backend Architecture - Clean Architecture

Covers backend and service workspaces.

---

## Core Philosophy: Inward Dependency & Policy Isolation

- **Inward Dependency Rule:** Source code dependencies must point strictly inward — toward higher-level business policies. Outer details (databases, frameworks, network protocols) depend on inner abstractions, never the reverse.
- **Layer Isolation:** Inner circles have zero knowledge of outer circles. The core domain and use cases remain completely decoupled from technical specifics, enabling you to swap databases, drivers, or transport layers without modifying business logic.
- **Details as Plugins:** Delivery systems, ORMs/data access layers, and external APIs are plugins to the core application.

---

## Concentric Layer Structure

```
src/
├── domain/           # 1. Entities & Business Rules (innermost)
├── application/      # 2. Use Cases (application-specific business flows)
├── infrastructure/   # 3. Interface Adapters (persistence, external services, drivers)
└── presentation/     # 4. Delivery & Frameworks (controllers, handlers, entrypoints)
```

| Layer | Responsibility | Imports Allowed |
|-------|----------------|-----------------|
| `domain/` | Business entities, value objects, domain rules, abstract repository ports | **None** (zero framework or external library imports) |
| `application/` | Use cases orchestrating domain logic via ports, DTO definitions | `domain/` only |
| `infrastructure/` | Concrete database adapters, file storage, third-party API clients | `domain/`, `application/` |
| `presentation/` | API controllers, event handlers, request/response parsers, serialization | `application/`, `domain/` |

---

## Core Patterns

### 1. Use Case Implementation

Use cases orchestrate domain entities and port interfaces:

```ts
// application/use-cases/create-order.use-case
export class CreateOrderUseCase {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly payments: IPaymentService,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderDto> {
    const order = Order.create(dto)          // domain entity enforces business invariants
    await this.payments.charge(order.total)  // port interface abstraction
    await this.orders.save(order)            // persistence port abstraction
    return OrderMapper.toDto(order)
  }
}
```

### 2. Dependency Inversion Principle (DIP)

- **Port (Interface):** Declared in `domain/repositories/` or `application/ports/`.
- **Adapter (Implementation):** Declared in `infrastructure/repositories/`.

```ts
// domain/repositories/order.repository (Abstract contract)
export interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<void>
}

// infrastructure/repositories/database-order.repository (Concrete adapter)
export class DatabaseOrderRepository implements IOrderRepository {
  constructor(private readonly dbConnection: DatabaseClient) {}

  async findById(id: string): Promise<Order | null> {
    const record = await this.dbConnection.findRecord({ id })
    return record ? OrderMapper.toDomain(record) : null
  }

  async save(order: Order): Promise<void> {
    await this.dbConnection.persist(OrderMapper.toRecord(order))
  }
}
```

---

## Architectural Diagnostic Rubric (0–10 Score Band)

When evaluating or auditing backend architecture, score boundary integrity:

- **Score 9–10 (6–7 checks met):** Strict inward dependency maintained. Core domain and use cases operate with zero framework or database decorators/imports. Business rules are testable in complete isolation without mocks.
- **Score 6–8 (4–5 checks met):** High-level rules are isolated, but occasional framework decorators, ORM models, or transport utilities cross boundaries into domain/application.
- **Score 3–5 (2–3 checks met):** Database schema or framework conventions dictate application structure; business logic is tightly bound to persistence models or route handlers.
- **Score 0–2 (0–1 checks met):** Flat architecture where business rules reside directly inside controllers, handlers, and persistence models.

---

## Anti-Patterns

- Database/ORM annotations or decorators placed inside `domain/`
- Framework route handlers, controllers, or transport types inside `application/` or `domain/`
- Business rules residing inside controllers or entry handlers instead of use cases
- Repository interfaces defined in `infrastructure/` instead of `domain/` or `application/`
- Domain entities implemented as anemic data bags without business invariants
