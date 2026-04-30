---
name: nestjs-cqrs-ddd
description: Use this skill when designing or reviewing NestJS applications using DDD, CQRS, Prisma, Hexagonal Architecture, aggregates, repositories, domain events, outbox, inbox, sagas, or bounded contexts.
---

Follow these architectural rules:

## Layers

Domain layer:
- Contains aggregates, entities, value objects, domain services, domain events and policies.
- Must not import NestJS, Prisma, HTTP, RabbitMQ, Redis or framework-specific code.

Application layer:
- Contains commands, queries, handlers, ports, use cases and orchestration.
- May use domain objects and repository ports.
- Should not depend directly on Prisma or controllers.

Infrastructure layer:
- Contains Prisma repositories, RabbitMQ publishers, Redis adapters, S3 adapters and external API clients.
- Implements ports defined by application/domain.

Presentation layer:
- Contains controllers, DTOs, pipes, guards and HTTP-specific mappings.

## CQRS rules

- Commands mutate state.
- Queries return read models.
- Command handlers should load aggregate, call aggregate behavior, persist through repository, and publish/store events.
- Query handlers should use read repositories or optimized read models.

## Review output

When reviewing code, return:
1. What is correct.
2. What violates DDD/CQRS boundaries.
3. Suggested folder structure.
4. Concrete code-level refactor examples.