# CLAUDE.md

Guidance for AI agents (and humans) working in this repository.

## Overview

Expense Tracker — a monorepo for a personal expense-tracking application.

- Frontend: Vite + React 18 + TypeScript + Tailwind CSS + React Router v6 + shadcn/ui, organised with Feature-Sliced Design (see [Frontend architecture](#frontend-architecture-feature-sliced-design))
- Backend: NestJS + TypeScript + TypeORM + PostgreSQL
- Shared code: `packages/shared` (types, DTOs, constants) consumed by both apps
- Tooling: ESLint + Prettier, Docker Compose
- Package manager: npm workspaces (Node `>=20`, npm `>=10`)

Status: early-stage skeleton, but runnable. Dependencies are installed (`node_modules` + `package-lock.json` present), PostgreSQL runs via Docker Compose, and the initial schema migration has been generated and applied. Domain services are still mostly stubs.

## Repository layout

```text
expense-tracker/
├── apps/
│   ├── frontend/            # Vite + React + TS + Tailwind + shadcn/ui SPA (Feature-Sliced Design)
│   │   ├── components.json  # shadcn/ui config (aliases → @/shared/ui, @/shared/lib/cn)
│   │   └── src/             # FSD layers (top→bottom): app → pages → widgets → features → entities → shared
│   │       ├── app/         # App root, router, layouts/AppLayout, providers (route guards), global styles
│   │       ├── pages/       # One slice per route (login, register, dashboard, transactions, expenses, categories, not-found)
│   │       ├── widgets/     # Composite UI blocks (e.g. navbar)
│   │       ├── features/    # User interactions (auth/login, auth/register, auth/logout)
│   │       ├── entities/    # Business entities: session (auth store), expense (api + hooks)
│   │       └── shared/      # Feature-agnostic: ui (shadcn), api (client), lib (cn, token-storage), config (routes)
│   └── backend/             # NestJS API
│       └── src/
│           ├── auth/        # Auth module (controller/service)
│           ├── users/       # User entity + module/service
│           ├── expenses/    # Expense entity + module/service/controller
│           ├── categories/  # Category entity + module/service/controller
│           ├── transactions/ # Transaction entity + dto/service/controller/module (income/expense ledger)
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
- Backend modules: each domain (`auth`, `users`, `expenses`, `categories`, `transactions`) is a self-contained Nest module registering its TypeORM entities via `TypeOrmModule.forFeature`.
- Auth: JWT-based (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`), with `bcrypt` password hashing. `AuthService.register`/`login` return `{ user, tokens }` (`AuthResponse` in the shared package) with an access and refresh token. `JwtStrategy` validates the bearer token and `JwtAuthGuard` (+ the `@CurrentUser()` param decorator) protects routes; `expenses`/`categories` derive `userId` from the token instead of a `?userId=` query param. Token secret/expiry come from `JWT_SECRET` / `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN`.
- Cross-module interaction uses CQRS (`@nestjs/cqrs`), not direct imports: the `users` module registers the command/query handlers (`CreateUserCommand`, `GetUserByEmailQuery`, `GetUserByIdQuery`) and `auth` dispatches them through `CommandBus`/`QueryBus`. `AuthModule` does not import `UsersModule`/`UsersService`; the message classes under `users/commands` and `users/queries` are the only shared contract. Any module using the buses (and the ones owning handlers) must import `CqrsModule`. The `categories` and `transactions` modules follow the same rule: `CategoriesService.create` / `TransactionsService.create` verify the owning user via the `QueryBus` (`GetUserByIdQuery`) instead of importing `UsersService`.
- Categories: full CRUD under `/categories`, JWT-guarded, scoped to `@CurrentUser('userId')`. `CategoriesController` exposes `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` (204). `CategoriesService` owns the CRUD logic (`create`/`findAll`/`findOne`/`update`/`remove`); reads/updates/deletes are scoped on `{ id, userId }` (404 on miss). Request bodies validate through class-validator DTO classes in `categories/dto` (`CreateCategoryDto`, `UpdateCategoryDto`) — the global `ValidationPipe` only validates classes, not the shared interfaces, so DTOs live in the backend and `implements` the shared `@expense-tracker/shared` types. `color` is optional (entity default `#7c3aed`, validated with `@IsHexColor` when present).
- Transactions: the central income/expense ledger under `/transactions`, JWT-guarded, scoped to `@CurrentUser('userId')`. `TransactionsController` exposes `POST /`, `GET /` (aggregation), `GET /:id`, `PATCH /:id`, `DELETE /:id` (204). `TransactionEntity` has `amount` (numeric(12,2) with a transformer returning a JS `number`), `type` (Postgres enum `transactions_type_enum` = `income`/`expense`, from the shared `TransactionType` enum), `description`, `date`, nullable `categoryId` (FK `ON DELETE SET NULL`) and `userId` (FK `ON DELETE CASCADE`). `GET /transactions` accepts optional `month` (1-12), `year`, `type`, and pagination `page`/`pageSize` query params (validated/coerced via `class-transformer` `@Type(() => Number)` in `QueryTransactionsDto`) and returns `{ items, summary, total, page, pageSize }` where `summary` is `{ income, expense, balance }` computed in JS over the (date-range-filtered) rows; month without year defaults to the current year. Pagination is opt-in: `summary`/`total` always cover the full filtered set, but `items` are sliced with `take`/`skip` only when `page`/`pageSize` are provided (otherwise all rows are returned with `page=1`, `pageSize=total`); `pageSize` defaults to the shared `DEFAULT_PAGE_SIZE`. The service/controller return entities (a local `TransactionListResult`), not the shared `TransactionList` (whose dates are strings), like `categories`/`expenses`. DTO classes live in `transactions/dto` and `implements` the shared interfaces; the shared `TransactionType` enum is the single source of truth for backend (`@IsEnum` + enum column) and frontend (`z.nativeEnum`).
- Global API prefix comes from `API_PREFIX` in the shared package; a global `ValidationPipe`, exception filter, and logging interceptor are wired in `main.ts`.
- Vite dev server proxies `/api` to `http://localhost:3000`.

### Frontend architecture (Feature-Sliced Design)

The frontend follows [Feature-Sliced Design](https://feature-sliced.design). Code is organised into **layers**; each layer is split into **slices** (business domains), and each slice into **segments** (`ui`, `model`, `api`, `lib`, `config`).

Layers, highest to lowest (imports only ever point **downward**):

- `app/` — application composition: `App` root, `router.tsx` (`createBrowserRouter`), `layouts/AppLayout` (renders `<Navbar />` + `<Outlet />`), `providers/` route guards (`RequireAuth`, `GuestOnly`), and global `styles/index.css`. `main.tsx` renders `<App />`.
- `pages/` — one slice per route (`login`, `register`, `dashboard`, `transactions`, `expenses`, `categories`, `not-found`). Pages compose widgets/features/entities and hold no business logic. `dashboard` is the main screen: a name greeting from `useCurrentUser()`, a menu of `Card`/`Link` shortcuts to transactions/categories, and the `recent-transactions` widget.
- `widgets/` — self-contained composite UI blocks: `navbar`, and `recent-transactions` (paginated list of the last transactions, 10/page, via `usePaginatedTransactions`).
- `features/` — user interactions. Auth lives here: `features/auth/login`, `features/auth/register`, `features/auth/logout`; `features/transaction/create-transaction` is the transaction create form. Each owns its `ui` (react-hook-form + zod form), `model/schema.ts` (zod schema), and `api/*.ts` (typed `apiClient` call). Note: the create-transaction `amount` is a zod string coerced to a number on submit (avoids the `z.coerce` / `zodResolver` input≠output type clash).
- `entities/` — business entities: `session` (zustand store persisting the user + writing tokens via `tokenStorage`; exposes `useSessionStore`, `useCurrentUser`, `useIsAuthenticated`), `expense` (`api` + `useExpenses` hook), and `transaction` (`transaction.api` with `list`/`create`/`update`/`remove` + `useTransactions` hook exposing items, `{ income, expense, balance }` summary, and `create`/`remove`/`refresh`; plus `usePaginatedTransactions` which drives server pagination — `page`/`pageSize` params — and exposes `items`, `total`, `page`, `pageCount`, `hasPrev`/`hasNext`, `loading`, `prev`/`next`/`setPage`).
- `shared/` — feature-agnostic building blocks: `ui/` (shadcn/ui components + barrel), `api/` (auth-aware `apiClient` + `ApiError`), `lib/` (`cn`, `token-storage`), `config/` (`ROUTES`).

Rules of thumb: a slice's public API is its `index.ts` barrel — import across slices via the barrel (`@/features/auth/login`), not deep paths. The `@` alias maps to `src` (tsconfig `paths` + Vite alias). Never import "upward" (e.g. `shared` must not import from `entities`; that's why `apiClient` reads the token from `tokenStorage` in `shared/lib`, which the `session` store writes to). Add new shadcn/ui components under `shared/ui`.

### Frontend auth flow

- shadcn/ui is set up manually for Tailwind v3: `components.json`, CSS variables + `@layer base` in `src/app/styles/index.css`, tokens wired in `tailwind.config.ts` (`tailwindcss-animate` plugin), `cn` helper in `shared/lib/cn.ts`. Components live in `shared/ui` (`button`, `input`, `label`, `card`, `form`). The `--primary`/`--ring` tokens track the violet `brand` color (`#7c3aed`).
- `shared/api/client.ts` attaches `Authorization: Bearer <accessToken>` (read from `tokenStorage`) and throws a typed `ApiError` carrying the backend's `message` (parsed from the `AllExceptionsFilter` JSON body; joins array messages from `ValidationPipe`).
- Login/registration call `POST /auth/login` and `POST /auth/register`, then `useSessionStore.setSession({ user, tokens })` persists the user (localStorage key `expense-tracker:session`) and stores tokens (`tokenStorage`), and navigate to `/`.
- Routing: `GuestOnly` wraps `/login` + `/register` (redirects authenticated users to `/`); `RequireAuth` wraps `AppLayout` and its children (redirects anonymous users to `/login`). Route constants live in `shared/config/routes.ts`.
- Client-side `AuthResponse` only: no `GET /auth/me` refresh-on-load or token-refresh flow yet (backend lacks those endpoints). Session is restored from localStorage on reload.

## Conventions

- TypeScript strict mode everywhere (see `packages/tsconfig`).
- ESLint uses legacy `.eslintrc.cjs` extending `@expense-tracker/eslint-config` (`react.cjs` / `node.cjs`).
- Prettier: single quotes, semicolons, trailing commas (`all`), width 100.
- Do not add narration-style comments; comment only non-obvious intent.
- TypeORM entities are named `*.entity.ts` with `Entity` suffix classes; DB columns use snake_case via explicit `name`.
- Frontend: follow Feature-Sliced Design — put code in the lowest layer that fits, expose each slice through its `index.ts` barrel, and import across slices via `@/<layer>/<slice>` (never deep paths or "upward" layers).

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
