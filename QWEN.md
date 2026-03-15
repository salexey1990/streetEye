# streetEye - Project Context

## Project Overview

**streetEye** is a monorepo built with [Turborepo](https://turborepo.dev/) that contains a full-stack application with:

- **API Gateway** (`apps/api-gateway`) - API Gateway running on port 3000
- **NestJS API** (`apps/api`) - Backend REST API (legacy, port 3000)
- **Auth Service** (`apps/auth-service`) - Authentication & authorization running on port 3001
- **User Service** (`apps/user-service`) - User profiles & subscriptions running on port 3002
- **Next.js Web App** (`apps/web`) - Frontend application running on port 3001
- **Content Service** (`apps/content-service`) - Additional NestJS backend running on port 3002
- **Challenge Service** (`apps/challenge-service`) - Photography challenges backend running on port 3002
- **Shared Packages** (`packages/*`) - Reusable libraries and configurations

### Architecture

```
streetEye/
├── apps/
│   ├── api-gateway/         # API Gateway (port 3000)
│   ├── api/                 # NestJS backend (legacy, port 3000)
│   ├── auth-service/        # Auth service (port 3001)
│   ├── user-service/        # User service (port 3002)
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
- API Gateway on http://localhost:3000
- Auth Service on http://localhost:3001
- User Service on http://localhost:3002
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
| API Gateway | http://localhost:3000/api/docs |
| Auth Service | http://localhost:3001/api/docs |
| User Service | http://localhost:3002/api/docs |
| Challenge Service | http://localhost:3003/api/docs |

### API Endpoints

#### API Service (`apps/api`)

- `GET /api/v1/links` - Get all links
- `GET /api/v1/links/:id` - Get link by ID
- `POST /api/v1/links` - Create new link
- `PATCH /api/v1/links/:id` - Update link
- `DELETE /api/v1/links/:id` - Delete link

#### Auth Service (`apps/auth-service`)

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token

**Email Verification:**
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification code

**Password Reset:**
- `POST /api/v1/auth/password/reset-request` - Request password reset
- `POST /api/v1/auth/password/reset` - Reset password with token

**2FA:**
- `POST /api/v1/auth/2fa/enable` - Enable 2FA
- `POST /api/v1/auth/2fa/verify` - Verify 2FA code
- `POST /api/v1/auth/2fa/disable` - Disable 2FA

**Sessions:**
- `GET /api/v1/auth/sessions` - Get active sessions
- `DELETE /api/v1/auth/sessions/:sessionId` - Terminate session
- `DELETE /api/v1/auth/sessions/all` - Terminate all sessions

See full documentation in `specs/auth-service-spec.md`

#### User Service (`apps/user-service`)

**Profile:**
- `GET /api/v1/users/:id/profile` - Get user profile
- `PUT /api/v1/users/:id/profile` - Update user profile
- `DELETE /api/v1/users/:id/account` - Delete user account (GDPR)

**Subscriptions:**
- `GET /api/v1/users/:id/subscription` - Get user subscription
- `POST /api/v1/users/:id/subscription/upgrade` - Upgrade subscription
- `POST /api/v1/users/:id/subscription/cancel` - Cancel subscription
- `POST /api/v1/users/:id/subscription/restore` - Restore subscription

**Purchases:**
- `GET /api/v1/users/:id/purchases` - Get purchase history
- `POST /api/v1/users/:id/purchases/courses/:courseId` - Purchase course

**Admin:**
- `GET /api/v1/admin/users` - List all users (admin only)
- `GET /api/v1/admin/users/:id` - Get user details (admin only)
- `POST /api/v1/admin/users/:id/ban` - Ban user (admin only)
- `POST /api/v1/admin/users/:id/unban` - Unban user (admin only)

See full documentation in `specs/user-service-spec.md`

#### API Gateway (`apps/api-gateway`)

The API Gateway routes all requests to appropriate microservices:

| Path Prefix | Target Service | Port |
|-------------|----------------|------|
| `/api/v1/auth/*` | Auth Service | 3001 |
| `/api/v1/users/*` | User Service | 3002 |
| `/api/v1/challenges/*` | Challenge Service | 3003 |
| `/api/v1/marathons/*` | Marathon Service | 3004 |
| `/api/v1/progress/*` | Progress Service | 3005 |
| `/api/v1/ai/*` | AI Service | 3006 |
| `/api/v1/notifications/*` | Notification Service | 3007 |
| `/api/v1/geo/*` | Geo Service | 3008 |
| `/api/v1/files/*` | File Service | 3009 |
| `/api/v1/analytics/*` | Analytics Service | 3010 |

**Features:**
- JWT authentication
- Rate limiting (100 req/min anonymous, 1000 req/min authenticated)
- Response caching (Redis, TTL 5-60 minutes)
- Circuit breaker for fault tolerance
- Retry with exponential backoff
- Request/Response logging with correlation ID

**Health & Monitoring:**
- `GET /api/v1/health` - Health check for all services
- `GET /api/v1/health/circuits` - Circuit breaker statistics

See full documentation in `specs/api-gateway-spec.md`

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

- NestJS application with Links module (legacy)
- Uses shared guards, filters, and services from `@repo/api`
- Swagger documentation enabled
- CORS enabled for frontend communication

### API Gateway (`apps/api-gateway`)

- NestJS API Gateway for routing requests to microservices
- Features:
  - Request routing to 10 microservices
  - JWT authentication and authorization
  - Rate limiting (100 req/min anon, 1000 req/min auth)
  - Response caching with Redis (TTL 5-60 min)
  - Circuit breaker for fault tolerance
  - Retry with exponential backoff
  - Request/Response logging with correlation ID
- Architecture:
  - Service discovery for path-based routing
  - Proxy service with retry logic
  - Health checks for all microservices
  - Circuit breaker per service
- Uses shared infrastructure:
  - Redis for caching and rate limiting
  - RabbitMQ for event publishing
- Swagger documentation enabled
- Port: 3000
- Swagger UI: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

### Auth Service (`apps/auth-service`)

- NestJS authentication & authorization service
- Features:
  - JWT-based authentication (access + refresh tokens)
  - Email verification with 6-digit codes
  - Password reset flow
  - TOTP-based 2FA with backup codes
  - Session management with token rotation
  - Rate limiting & brute force protection
- Architecture:
  - Extracted services (TokenService, PasswordService, TwoFactorService)
  - RefreshTokenStrategy pattern for token rotation
  - Custom exception classes
  - @CurrentUser() decorator
- Uses shared infrastructure:
  - PostgreSQL for data persistence
  - Redis for token blacklist & rate limiting
  - RabbitMQ for event publishing
- Swagger documentation enabled
- Port: 3001
- Swagger UI: http://localhost:3001/api/docs

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

### User Service (`apps/user-service`)

- NestJS user profile and subscription management service
- Features:
  - User profile management (GET/PUT)
  - Subscription management (Free/Premium/Masterclass)
  - Course purchases (Masterclass)
  - Achievements and statistics
  - GDPR compliance (export/delete data)
- Architecture:
  - Extracted services (SubscriptionService, PurchasesService, GDPRService)
  - Stripe integration for payments
  - Redis caching for profiles
  - Event publishing for analytics
- Uses shared infrastructure:
  - PostgreSQL for data persistence
  - Redis for caching
  - RabbitMQ for event publishing
- Swagger documentation enabled
- Port: 3002
- Swagger UI: http://localhost:3002/api/docs

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
| PostgreSQL | auth-service-db | 5431 | Auth Service DB |
| PostgreSQL | auth-service-db-test | 5436 | Auth Service Test DB |
| PostgreSQL | user-service-db | 5437 | User Service DB |
| PostgreSQL | user-service-db-test | 5438 | User Service Test DB |
| PostgreSQL | challenge-service-db | 5434 | Challenge Service DB |
| PostgreSQL | challenge-service-db-test | 5435 | Challenge Service Test DB |
| PostgreSQL | content-service-db | 5432 | Content Service DB |
| PostgreSQL | content-service-db-test | 5433 | Content Service Test DB |
| Redis | redis | 6379 | Shared cache |
| RabbitMQ | rabbitmq | 5672, 15672 | Message broker |
| API Gateway | api-gateway | 3000 | API Gateway |

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

# Auth Service
AUTH_SERVICE_DB_HOST=localhost
AUTH_SERVICE_DB_PORT=5431
AUTH_SERVICE_DB_USERNAME=postgres
AUTH_SERVICE_DB_PASSWORD=postgres
AUTH_SERVICE_DB_DATABASE=streeteye_auth
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800

# Challenge Service
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

### 2026 Refactoring

- **API Gateway Creation:** New API Gateway service
  - Request routing to 10 microservices
  - JWT authentication and authorization
  - Rate limiting (100 req/min anon, 1000 req/min auth)
  - Response caching with Redis (TTL 5-60 min)
  - Circuit breaker for fault tolerance
  - Retry with exponential backoff
  - Request/Response logging with correlation ID
  - Service discovery for path-based routing
  - Health checks for all microservices
  - 24 compiled JS files
  - Full refactoring with configuration constants

- **User Service Creation:** New user profile and subscription service
  - User profile management (GET/PUT/DELETE)
  - Subscription management (Free/Premium/Masterclass)
  - Course purchases with Stripe integration
  - Achievements and statistics
  - GDPR compliance (export/delete data)
  - 9 database tables
  - Full DTO validation
  - Custom exception classes
  - 49 compiled JS files

### 2025 Refactoring

- **Auth Service Creation:** New authentication service
  - JWT-based authentication with token rotation
  - Email verification flow
  - Password reset functionality
  - TOTP 2FA with backup codes
  - Session management
  - Rate limiting & brute force protection
  - Extracted services (TokenService, PasswordService, TwoFactorService)
  - RefreshTokenStrategy pattern
  - @CurrentUser() decorator
  - 91 unit tests

- **Code Refactoring:** Comprehensive refactoring of auth-service
  - Single Responsibility Principle applied
  - Strategy pattern for token rotation
  - Custom exception classes
  - Guard clauses and naming improvements
  - JSDoc documentation added

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
  - JWT authentication guard
  - Password validation

- **API Documentation:** Added Swagger/OpenAPI documentation
  - Decorated all DTOs and controllers
  - Added request/response examples
  - Configured Bearer authentication

- **Infrastructure:** Added Redis and RabbitMQ to docker-compose.yml
  - Shared cache for all microservices
  - Message broker for event-driven architecture
  - Health checks configured
