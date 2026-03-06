# streetEye - Project Context

## Project Overview

**streetEye** is a monorepo built with [Turborepo](https://turborepo.dev/) that contains a full-stack application with:

- **NestJS API** (`apps/api`) - Backend REST API running on port 3000
- **Next.js Web App** (`apps/web`) - Frontend application running on port 3001
- **Shared Packages** (`packages/*`) - Reusable libraries and configurations

### Architecture

```
streetEye/
├── apps/
│   ├── api/           # NestJS backend (port 3000)
│   └── web/           # Next.js frontend (port 3001)
└── packages/
    ├── @repo/api      # Shared NestJS resources, DTOs, entities
    ├── @repo/ui       # Shared React UI components
    ├── @repo/eslint-config  # Shared ESLint configurations
    ├── @repo/jest-config    # Shared Jest configurations
    └── @repo/typescript-config  # Shared TypeScript configurations
```

### Tech Stack

- **Package Manager:** pnpm (v8.15.5) with workspaces
- **Build Tool:** Turborepo v2
- **Backend:** NestJS v11 with Express
- **Frontend:** Next.js 16 with React 19
- **Language:** TypeScript (strict mode)
- **Testing:** Jest, Supertest, Playwright (e2e)
- **Linting:** ESLint v9 + Prettier

## Building and Running

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.5

### Installation

```bash
pnpm install
```

### Development

Run all apps and packages in development mode:

```bash
pnpm dev
```

This starts:
- NestJS API on http://localhost:3000
- Next.js Web on http://localhost:3001

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

### Project-Specific Notes

#### API (`apps/api`)

- NestJS application with modular structure
- Current module: `LinksModule` for managing links
- Uses class-based DTOs for validation
- CORS enabled for frontend communication

#### Web (`apps/web`)

- Next.js App Router (not Pages Router)
- Server Components by default
- Fetches data from API at build time (with `cache: 'no-store'`)
- Uses shared UI components from `@repo/ui`

#### Shared API Package (`packages/@repo/api`)

- Contains shared DTOs, entities, and types
- Built with TypeScript (`tsc -b`)
- Exports via `dist/entry.js`

#### Shared UI Package (`packages/@repo/ui`)

- React component library
- Exports components from `src/*.tsx`
- Used by the Next.js web app

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all projects |
| `pnpm test` | Run all tests |
| `pnpm test:e2e` | Run e2e tests |
| `pnpm lint` | Lint all projects |
| `pnpm format` | Format code |
| `turbo run <task> --filter=<package>` | Run task for specific package |

## Remote Caching

Enable Vercel Remote Cache for team/CI sharing:

```bash
npx turbo login
npx turbo link
```
