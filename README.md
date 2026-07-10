# Parking Platform

A comprehensive parking management system built with a modern TypeScript stack. This monorepo contains the backend API, multiple client applications, and shared packages.

## 🏗 Project Structure

- `apps/api`: NestJS backend using Hexagonal Architecture and CQRS.
- `apps/client`: Public-facing application (TanStack Start).
- `apps/manager-client`: Application for parking owners and managers (TanStack Start).
- `apps/admin-client`: Internal administrative portal (TanStack Start).
- `packages/api-contracts`: Shared TypeScript interfaces and DTOs.
- `packages/frontend-utils`: Shared utility functions for frontend apps.
- `packages/eslint-config`: Shared ESLint configurations.
- `packages/typescript-config`: Shared TypeScript configurations.
- `info/`: Architectural documentation, design decisions, and reviews.

## 🛠 Tech Stack

### Backend (`apps/api`)
- **Framework**: [NestJS](https://nestjs.com/)
- **Architecture**: Hexagonal (DDD) + CQRS
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Caching**: Redis
- **Auth**: Passport.js (JWT, Local)
- **Validation**: Joi & Class-validator
- **Observability**: OpenTelemetry, Jaeger, Sentry
- **Communications**: Nodemailer (via MailHog for development)

### Frontend (`apps/client`, `apps/manager-client`, `apps/admin-client`)
- **Framework**: [TanStack Start](https://tanstack.com/start) (React SSR)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Styling**: Tailwind CSS
- **Form Management**: [TanStack Form](https://tanstack.com/form)
- **Table Management**: [TanStack Table](https://tanstack.com/table) (in manager-client)
- **Build Tool**: Vite

### Monorepo Tooling
- **Orchestration**: [Turbo](https://turbo.build/)
- **Package Manager**: npm workspaces

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose

### Installation
1. Install dependencies from the root:
   ```bash
   npm install
   ```

2. Start the local infrastructure:
   ```bash
   docker-compose up -d
   ```

### Application Setup

#### API
1. Create a `.env` file in `apps/api` (refer to `env-schema.ts` for required variables).
2. Generate Prisma client:
   ```bash
   npm run prisma:generate --workspace api
   ```
3. Apply database migrations:
   ```bash
   npm run prisma:migrate --workspace api
   ```
4. (Optional) Generate a super admin user:
   ```bash
   npm run generate-super-admin --workspace api
   ```

#### Clients
Each client requires its own environment variables. Check `src/env.ts` in each client directory for details.

### Development
To run all applications in development mode:
```bash
npm run dev
```

To run a specific application:
```bash
npm run dev --workspace <app-name>
```
Apps: `api`, `client`, `manager-client`, `admin-client`.

## 🧪 Testing

### API
- Unit tests: `npm run test --workspace api`
- E2E tests: `npm run test:e2e --workspace api`

### Clients
- Unit/Component tests: `npm run test --workspace <client-name>`

## 🏛 Architecture (API)

The API follows **Hexagonal Architecture** combined with **CQRS**.

### Bounded Contexts
Located in `apps/api/src/modules`, each context follows a strict structure:
- `application/`: Commands, Queries, Handlers, and Ports (Interfaces).
- `domain/`: Pure domain logic, Aggregates, Entities, and Value Objects.
- `infrastructure/`: Persistence (Prisma), Adapters, and External services.

### Key Patterns
- **CQRS**: Clear separation between write (Commands) and read (Queries) operations, with dedicated Read Models in the database.
- **Outbox Pattern**: Reliable event delivery and integration between bounded contexts.
- **API Facades**: Each module exposes a `Facade` class in the application layer as a clean entry point.

## 📝 License
UNLICENSED
