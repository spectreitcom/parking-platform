# Project Guidelines

This document provides essential information for future development and maintenance of the Parking Platform project.

## Apps

### Api

The project main catalog is in the `apps/api` directory.
The Api app is the backend application of the Parking Platform.

#### Architecture

- The api is written in the hexagonal architecture.
- It uses also the CQRS pattern (the `@nestjs/cqrs` package)

The `bounded contexts` are in the `apps/api/src/modules` directory.
The basic structure of the bounded context is:

- `bounded-context-name/`
  - `application/`
    - `commands/`
    - `commands-handlers/`
    - `event-handlers/`
    - `queries/`
    - `query-handlers/`
    - `ports/`
    - `bounded-context-name.module.ts`
    - `bounded-context-name.facade.ts`
  - `domain/`
  - `infrastructure/`

#### Build/Configuration

- **Node.js**: >= 18.
- **Package Manager**: `npm` (workspaces are used).
- **Monorepo**: Turbo is used for task orchestration.
- **Infrastructure**: Local development requires PostgreSQL and Redis, which are provided via `docker-compose.yml` in the root directory.
- **Environment Variables**: Managed via `.env` file in `apps/api`. A schema is defined in `apps/api/env-schema.ts`.
- **Database (Prisma)**:
  - Generate client: `npm run prisma:generate` (inside `apps/api`).
  - Apply migrations: `npx prisma migrate dev --name migration-name` (inside `apps/api`).
- **Build Commands**:
  - Build all: `npm run build` (at root).
  - Build API: `npm run build --workspace api`.
  - Dev API: `npm run dev --workspace api`.

#### Testing

- **Framework**: Jest.
- **Types of tests**:
  - **Unit Tests**: Located in `__tests__` directories near the code (e.g., `src/shared/value-objects/__tests__`).
  - **E2E Tests**: Configured to look for `.e2e-spec.ts` files, managed via `apps/api/test/jest-e2e.json`.
- **Running Tests**:
  - Run all unit tests: `npm test` (inside `apps/api`).
  - Run specific test: `npm test <path_to_test_file>`.
  - Run e2e tests: `npm run test:e2e` (inside `apps/api`).
- **Adding Tests**:
  - For domain logic and value objects, create a `.spec.ts` file in a `__tests__` directory near the code.
  - For command/query handlers, mock ports and dependencies using `@nestjs/testing`.

##### Example Test Case

```typescript
import { Email } from "../email";

describe("Email Value Object", () => {
  it("should create a valid email object", () => {
    const emailValue = "test@example.com";
    const email = Email.fromString(emailValue);
    expect(email.value).toBe(emailValue);
  });

  it("should throw an error if email is invalid", () => {
    const invalidEmail = "invalid-email";
    expect(() => Email.fromString(invalidEmail)).toThrow("Invalid email");
  });
});
```

#### Development Information

- **Code Style**:
  - Formatting: Prettier (`singleQuote: true`, `trailingComma: "all"`).
  - Linting: ESLint with strict TypeScript rules.
  - Consistency: Follow the hexagonal architecture strictly. Domain should contain pure logic, application should coordinate tasks, and infrastructure should handle external concerns.
- **Custom CLI Tools**:
  - Generate Super Admin: `npm run generate-super-admin` (inside `apps/api`).
- **Prisma**: The project uses Prisma as the ORM. Ensure to run `npx prisma generate` after any schema changes.
