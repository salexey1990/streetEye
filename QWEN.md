# streetEye - Project Context

## Project Overview

**streetEye** is a monorepo built with [Turborepo](https://turborepo.dev/) that contains a full-stack application with:

- **NestJS API** (`apps/api`) - Backend REST API running on port 3000
- **Next.js Web App** (`apps/web`) - Frontend application running on port 3001
- **Content Service** (`apps/content-service`) - Additional NestJS backend running on port 3002
- **Challenge Service** (`apps/challenge-service`) - Photography challenges backend running on port 3002
- **Shared Packages** (`packages/*`) - Reusable libraries and configurations

### Architecture

```
streetEye/
├── apps/
│   ├── api/                 # NestJS backend (port 3000)
│   ├── web/                 # Next.js frontend (port 3001)
│   ├── content-service/     # NestJS backend (port 3002)
│   └── challenge-service/   # NestJS backend (port 3002)
├── packages/
│   ├── @repo/api            # Shared NestJS resources, guards, filters, services
│   ├── @repo/ui             # Shared React UI components
│   ├── @repo/eslint-config  # Shared ESLint configurations
│   ├── @repo/jest-config    # Shared Jest configurations
│   └── @repo/typescript-config  # Shared TypeScript configurations
└── docker-compose.yml       # Infrastructure services (PostgreSQL, Redis, RabbitMQ)
```

### Tech Stack

- **Package Manager:** pnpm (v8.15.5) with workspaces
- **Build Tool:** Turborepo v2
- **Backend:** NestJS v11 with Express
- **Frontend:** Next.js 16 with React 19
- **Language:** TypeScript (strict mode)
- **Testing:** Jest, Supertest, Playwright (e2e)
- **Linting:** ESLint v9 + Prettier
- **Documentation:** Swagger/OpenAPI

## Building and Running

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.5
- Docker & Docker Compose (for infrastructure services)

### Installation

```bash
pnpm install
```

### Infrastructure Services

Start Redis, RabbitMQ, and PostgreSQL databases:

```bash
docker-compose up -d
```

This starts:
- **Redis** on port 6379 (cache & session storage)
- **RabbitMQ** on port 5672 (AMQP) and 15672 (Management UI)
- **PostgreSQL** databases on ports 5432-5435

### Development

Run all apps and packages in development mode:

```bash
pnpm dev
```

This starts:
- NestJS API on http://localhost:3000
- Next.js Web on http://localhost:3001
- Content Service on http://localhost:3002
- Challenge Service on http://localhost:3002

### Build

Build all packages and apps:

```bash
pnpm build
```

### Testing

Run all tests:

```bash
pnpm test
```

Run end-to-end tests:

```bash
pnpm test:e2e
```

### Linting & Formatting

```bash
pnpm lint          # Run ESLint on all projects
pnpm format        # Format code with Prettier
```

## Development Conventions

### Code Style

- **TypeScript:** Strict mode enabled with `strictNullChecks`
- **ESLint:** Custom configs in `@repo/eslint-config` for different project types:
  - `base` - Base configuration
  - `library` - For shared libraries
  - `next-js` - For Next.js projects
  - `nest-js` - For NestJS projects
  - `react-internal` - For internal React components
- **Prettier:** Configured via `@repo/eslint-config/prettier-base`

### Module System

- Uses ES Modules (`"type": "module"` in web app)
- TypeScript module resolution: `NodeNext`

### Testing Practices

- Unit tests with Jest (configured in `@repo/jest-config`)
- E2E tests with Playwright
- Test commands are run via Turborepo for parallel execution

## API Documentation

### Swagger UI

Each NestJS service provides Swagger documentation:

| Service | Swagger URL |
|---------|-------------|
| API | http://localhost:3000/api/docs |
| Challenge Service | http://localhost:3002/api/docs |

### API Endpoints

#### API Service (`apps/api`)

- `GET /api/v1/links` - Get all links
- `GET /api/v1/links/:id` - Get link by ID
- `POST /api/v1/links` - Create new link
- `PATCH /api/v1/links/:id` - Update link
- `DELETE /api/v1/links/:id` - Delete link

#### Challenge Service (`apps/challenge-service`)

**Challenges:**
- `GET /api/v1/challenges` - List challenges with filters
- `GET /api/v1/challenges/:id` - Get challenge by ID
- `GET /api/v1/challenges/random` - Get random challenge
- `GET /api/v1/challenges/categories` - Get categories
- `POST /api/v1/challenges` - Create challenge (admin)
- `PUT /api/v1/challenges/:id` - Update challenge (admin)
- `DELETE /api/v1/challenges/:id` - Delete challenge (admin)

**Heat Mode:**
- `POST /api/v1/challenges/heat-mode/start` - Start session
- `GET /api/v1/challenges/heat-mode/active` - Get active session
- `POST /api/v1/challenges/heat-mode/:sessionId/next` - Get next challenge
- `DELETE /api/v1/challenges/heat-mode/:sessionId` - End session

See full documentation in `apps/challenge-service/API.md`

## Project-Specific Notes

### API (`apps/api`)

- NestJS application with Links module
- Uses shared guards, filters, and services from `@repo/api`
- Swagger documentation enabled
- CORS enabled for frontend communication

### Challenge Service (`apps/challenge-service`)

- NestJS application for photography challenges
- Features:
  - Challenge CRUD operations
  - Random challenge selection with weighted algorithms
  - Heat Mode timed sessions
  - Multi-language support (Ukrainian, Russian, English)
- Uses shared infrastructure:
  - PostgreSQL for data persistence
  - Redis for caching
  - RabbitMQ for event publishing
- Swagger documentation enabled
- Refactored with SOLID principles (2024)

### Content Service (`apps/content-service`)

- NestJS application
- Uses shared configurations from `@repo/*` packages
- CORS enabled for frontend communication

### Web (`apps/web`)

- Next.js App Router (not Pages Router)
- Server Components by default
- Fetches data from API at build time (with `cache: 'no-store'`)
- Uses shared UI components from `@repo/ui`

### Shared API Package (`packages/@repo/api`)

Contains shared NestJS resources:

**Guards:**
- `AuthGuard` - Authentication guard
- `RolesGuard` - Role-based authorization guard

**Filters:**
- `AllExceptionsFilter` - Global exception filter

**Decorators:**
- `Roles()` - Role-based authorization decorator

**Services:**
- `RedisService` - Redis cache service
- `RabbitMQService` - RabbitMQ message broker service
- `AuthContextService` - Authentication context service

**Utils:**
- `calculatePagination()` - Pagination utility
- `createPaginatedResult()` - Paginated result helper

**Exports:**
- Built with TypeScript (`tsc -b`)
- Exports via `dist/entry.js`
- Import: `import { AuthGuard, RedisService } from '@repo/api'`

### Shared UI Package (`packages/@repo/ui`)

- React component library
- Exports components from `src/*.tsx`
- Used by the Next.js web app

## Infrastructure

### Docker Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | challenge-service-db | 5434 | Challenge Service DB |
| PostgreSQL | challenge-service-db-test | 5435 | Challenge Service Test DB |
| PostgreSQL | content-service-db | 5432 | Content Service DB |
| PostgreSQL | content-service-db-test | 5433 | Content Service Test DB |
| Redis | redis | 6379 | Shared cache |
| RabbitMQ | rabbitmq | 5672, 15672 | Message broker |

### Environment Variables

See `.env.example` for all required variables:

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis

# RabbitMQ
RABBITMQ_URI=amqp://rabbitmq:rabbitmq@localhost:5672
RABBITMQ_EXCHANGE=streetEye

# Database
CHALLENGE_SERVICE_DB_HOST=localhost
CHALLENGE_SERVICE_DB_PORT=5434
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all projects |
| `pnpm test` | Run all tests |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm lint` | Lint all projects |
| `pnpm format` | Format code |
| `docker-compose up -d` | Start infrastructure services |
| `docker-compose down` | Stop infrastructure services |
| `docker-compose logs -f` | View service logs |
| `turbo run <task> --filter=<package>` | Run task for specific package |

## Remote Caching

Enable Vercel Remote Cache for team/CI sharing:

```bash
npx turbo login
npx turbo link
```

## Recent Changes

### 2024 Refactoring

- **Code Refactoring:** Comprehensive refactoring of challenge-service
  - Extracted services (HeatModeSessionManager, HeatModeEventPublisher, HeatModeCacheService)
  - Implemented Strategy pattern for weight calculation
  - Added custom exceptions
  - Created ChallengeMapper for DTO mapping
  - Added pagination utilities
  - Improved guard clauses and naming

- **Shared Package:** Moved common code to `@repo/api`
  - Guards, filters, decorators
  - Redis and RabbitMQ services
  - Pagination utilities

- **API Documentation:** Added Swagger/OpenAPI documentation
  - Decorated all DTOs and controllers
  - Added request/response examples
  - Configured Bearer authentication

- **Infrastructure:** Added Redis and RabbitMQ to docker-compose.yml
  - Shared cache for all microservices
  - Message broker for event-driven architecture
  - Health checks configured
