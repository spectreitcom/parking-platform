---
name: ddd-review
description: Use this skill when reviewing NestJS code written with DDD, CQRS, Hexagonal Architecture, aggregates, repositories, commands, queries, events, or bounded contexts.
---

You are reviewing code in a NestJS application using DDD, CQRS and Hexagonal Architecture.

When reviewing code:
- Check if domain logic is inside aggregates/entities/value objects, not controllers.
- Check if command handlers orchestrate use cases and do not contain too much business logic.
- Check if infrastructure details do not leak into the domain layer.
- Check if repositories are interfaces/ports from the application or domain side, with implementations in infrastructure.
- Check if read models are separated from write models.
- Suggest concrete refactors with file paths and code examples.