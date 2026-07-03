# CLAUDE.md

Guidance for AI agents (and humans) working in this repository.

## Overview

Expense Tracker — a monorepo for a personal expense-tracking application.

- Frontend: Vite + React 18 + TypeScript + Tailwind CSS + React Router v6
- Backend: NestJS + TypeScript + TypeORM + PostgreSQL
- Shared code: `packages/shared` (types, DTOs, constants) consumed by both apps
- Tooling: ESLint + Prettier, Docker Compose
- Package manager: npm workspaces (Node `>=20`, npm `>=10`)

Status: early-stage skeleton, but runnable. Dependencies are installed (`node_modules` + `package-lock.json` present), PostgreSQL runs via Docker Compose, and the initial schema migration has been generated and applied. Domain services are still mostly stubs.

## Repository layout

```text
expense-tracker/
├── apps/
│   ├── frontend/            # Vite + React + TS + Tailwind SPA
│   │   └── src/
│   │       ├── app/         # AppLayout and app-level composition
│   │       ├── components/  # Reusable UI (e.g. Navbar)
│   │       ├── pages/       # Route pages (Dashboard, Expenses, Categories, Login, NotFound)
│   │       ├── router/      # React Router config + route paths
│   │       ├── hooks/       # React hooks (e.g. useExpenses)
│   │       ├── services/    # API service layer
│   │       ├── store/       # Client state
│   │       ├── lib/         # apiClient and utilities
│   │       └── types/       # Frontend-only types
│   └── backend/             # NestJS API
│       └── src/
│           ├── auth/        # Auth module (controller/service)
│           ├── users/       # User entity + module/service
│           ├── expenses/    # Expense entity + module/service/controller
│           ├── categories/  # Category entity + module/service/controller
│           ├── common/      # Exception filter, logging interceptor
│           ├── config/      # typeorm.config.ts (env-driven options)
│           ├── migrations/  # TypeORM migrations (generated)
│           ├── data-source.ts   # Standalone DataSource for TypeORM CLI
│           ├── app.module.ts
│           └── main.ts      # Nest bootstrap
├── packages/
│   ├── shared/              # @expense-tracker/shared: types, dto, constants
│   ├── eslint-config/       # @expense-tracker/eslint-config: base/react/node
│   └── tsconfig/            # @expense-tracker/tsconfig: base/react/node presets
├── docker/
│   └── postgres/init.sql    # PostgreSQL init (extensions)
├── .github/workflows/ci.yml # CI: install, lint, build
├── docker-compose.yml       # PostgreSQL service
├── tsconfig.base.json       # Root TS config with @expense-tracker/shared paths
└── package.json             # Workspace root + scripts
```

## Common commands

Run from the repository root unless noted.

```bash
# Install (already done; re-run after changing dependencies)
npm install

# Dev (frontend + backend together)
npm run dev
npm run dev:frontend        # Vite dev server (port 5173)
npm run dev:backend         # Nest watch mode (port 3000)

# Build / lint / format across all workspaces
npm run build
npm run lint
npm run format
npm run format:check

# Database (Docker)
npm run db:up               # start PostgreSQL
npm run db:down             # stop containers
```

### Targeting a single workspace

```bash
npm run <script> --workspace @expense-tracker/frontend
npm run <script> --workspace @expense-tracker/backend
```

### Database migrations (backend)

TypeORM CLI uses `apps/backend/src/data-source.ts`. The CLI does not load `.env` on its own — export the vars first.

```bash
set -a && . apps/backend/.env && set +a

npm run migration:generate --workspace @expense-tracker/backend -- src/migrations/<Name>
npm run migration:run --workspace @expense-tracker/backend
npm run migration:revert --workspace @expense-tracker/backend
```

## Architecture notes

- Workspaces: `apps/*` and `packages/*`. Internal packages use the `@expense-tracker/*` scope and are referenced by `"*"` version.
- Shared package: `@expense-tracker/shared` ships its compiled `dist` (`main`/`types`/`exports` point at `dist/index.js` / `dist/index.d.ts`). The frontend resolves it via a Vite alias straight to the source (`packages/shared/src/index.ts`), so it never needs the build. The backend resolves it through normal Node/TS resolution to the built package, so `dist` must exist first — its `prebuild`/`prestart:dev` scripts build shared automatically. Do not point the backend `tsconfig` `paths` back at the shared source: that co-compiles the source into the backend output and breaks the `dist/main.js` entry.
- Backend config: `src/config/typeorm.config.ts` builds `DataSourceOptions` from env — either `DATABASE_URL` or discrete `POSTGRES_*` vars. `synchronize` is off; schema changes go through migrations.
- Backend modules: each domain (`auth`, `users`, `expenses`, `categories`) is a self-contained Nest module registering its TypeORM entities via `TypeOrmModule.forFeature`.
- Auth: JWT-based (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`), with `bcrypt` password hashing. `AuthService.register`/`login` return `{ user, tokens }` (`AuthResponse` in the shared package) with an access and refresh token. `JwtStrategy` validates the bearer token and `JwtAuthGuard` (+ the `@CurrentUser()` param decorator) protects routes; `expenses`/`categories` derive `userId` from the token instead of a `?userId=` query param. Token secret/expiry come from `JWT_SECRET` / `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN`.
- Cross-module interaction uses CQRS (`@nestjs/cqrs`), not direct imports: the `users` module registers the command/query handlers (`CreateUserCommand`, `GetUserByEmailQuery`, `GetUserByIdQuery`) and `auth` dispatches them through `CommandBus`/`QueryBus`. `AuthModule` does not import `UsersModule`/`UsersService`; the message classes under `users/commands` and `users/queries` are the only shared contract. Any module using the buses (and the ones owning handlers) must import `CqrsModule`.
- Global API prefix comes from `API_PREFIX` in the shared package; a global `ValidationPipe`, exception filter, and logging interceptor are wired in `main.ts`.
- Frontend routing: `src/router/index.tsx` uses `createBrowserRouter`; route constants live in `src/router/paths.ts`. `App.tsx` renders `AppLayout` with an `<Outlet />`.
- Vite dev server proxies `/api` to `http://localhost:3000`.

## Conventions

- TypeScript strict mode everywhere (see `packages/tsconfig`).
- ESLint uses legacy `.eslintrc.cjs` extending `@expense-tracker/eslint-config` (`react.cjs` / `node.cjs`).
- Prettier: single quotes, semicolons, trailing commas (`all`), width 100.
- Do not add narration-style comments; comment only non-obvious intent.
- TypeORM entities are named `*.entity.ts` with `Entity` suffix classes; DB columns use snake_case via explicit `name`.

## Environment

Two `.env` files (both git-ignored):

- `apps/backend/.env` — read by the NestJS app: `PORT`, `POSTGRES_*` / `DATABASE_URL`, `JWT_*` (see `apps/backend/.env.example`).
- Root `.env` — read by Docker Compose; mainly overrides the host DB port (`POSTGRES_PORT`) and the Postgres user/password/db.

```bash
cp apps/backend/.env.example apps/backend/.env
```

Default DB credentials: user `expense`, password `expense`, database `expense_tracker`, on host port **5433** (see Gotchas). Connection string: `postgres://expense:expense@localhost:5433/expense_tracker`.

Frontend optional: `VITE_API_URL` (defaults to the shared `API_PREFIX`).

## Gotchas

- Dependencies are installed (`node_modules` + `package-lock.json` are present). Re-run `npm install` from the root only after changing dependencies.
- Local dev maps Postgres to host port **5433**, not 5432, because a local PostgreSQL already occupies 5432. This is set via `POSTGRES_PORT=5433` in the root `.env` (read by Docker Compose) and mirrored in `apps/backend/.env` (`POSTGRES_PORT` + `DATABASE_URL`). If you free 5432, you can drop these overrides. Both `.env` files are git-ignored.
- The backend depends on the shared package's build output at runtime; `dist/` must exist before `nest start`/`node dist/main.js`. The backend `prebuild` and `prestart:dev` scripts build shared for you, but if you run the compiled entry directly, build shared first.
- `src/data-source.ts` must have exactly one export (the TypeORM CLI rejects a file with multiple `DataSource` exports), so it exports only `AppDataSource` — do not re-add a `default` export.
- The TypeORM CLI (`migration:*`) does not load `.env` itself. Export the vars first, e.g. `set -a && . apps/backend/.env && set +a`, then run the migration script.
- The initial schema lives in `src/migrations/*-Init.ts`. On a fresh database run `npm run migration:run --workspace @expense-tracker/backend` (with env loaded) before hitting the data endpoints, otherwise they 500 (`synchronize` is off).
- The local branch is `master` (and currently has no commits), but `.github/workflows/ci.yml` only triggers on `main`. Either rename the branch to `main` or update the workflow triggers, otherwise CI never runs.
- The GitHub remote was originally misspelled `expence-tracker`; it has since been renamed to `expense-tracker`, matching the local folder and package name. GitHub keeps a redirect from the old name, but `origin` already points at the corrected URL.
