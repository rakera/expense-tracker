# CLAUDE.md — Backend (`apps/backend`)

Guidance for the NestJS API. See the root [`CLAUDE.md`](../../CLAUDE.md) for monorepo-wide setup, the shared package, git workflow, conventions, and environment. This file covers backend-specific details.

## Stack

NestJS + TypeScript + TypeORM + PostgreSQL. JWT auth (`@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` + `bcrypt`). Cross-module communication via CQRS (`@nestjs/cqrs`). Validation via `class-validator` / `class-transformer`.

## Layout

```text
apps/backend/
├── nest-cli.json
├── tsconfig.json / tsconfig.build.json
├── .eslintrc.cjs
├── .env.example
└── src/
    ├── app.module.ts
    ├── main.ts               # Nest bootstrap
    ├── data-source.ts        # standalone DataSource for the TypeORM CLI
    ├── auth/
    │   ├── auth.controller.ts / auth.service.ts / auth.module.ts
    │   ├── jwt-payload.interface.ts
    │   ├── decorators/current-user.decorator.ts
    │   ├── guards/jwt-auth.guard.ts
    │   └── strategies/jwt.strategy.ts
    ├── users/
    │   ├── user.entity.ts / users.service.ts / users.module.ts
    │   ├── commands/create-user.command.ts (+ handlers/)
    │   └── queries/get-user-by-email.query.ts, get-user-by-id.query.ts (+ handlers/)
    ├── expenses/             # expense.entity.ts + controller/service/module
    ├── categories/           # category.entity.ts + controller/service/module + dto/
    ├── transactions/         # transaction.entity.ts + controller/service/module + dto/
    ├── common/               # http-exception.filter.ts, logging.interceptor.ts
    ├── config/               # typeorm.config.ts (env-driven options)
    └── migrations/           # 1782932796218-Init.ts, 1783459710073-Transactions.ts, README.md
```

## Scripts (`--workspace @expense-tracker/backend`)

| Script | Command |
|--------|---------|
| `dev` / `start:dev` | `nest start --watch` (port 3000) |
| `build` | `nest build` (`prebuild` builds the shared package first) |
| `start` | `nest start` |
| `start:prod` | `node dist/main.js` (needs shared `dist/` present) |
| `lint` | `eslint "src/**/*.ts"` |
| `typecheck` | `tsc --noEmit -p tsconfig.json` |
| `typeorm` | `typeorm-ts-node-commonjs -d src/data-source.ts` |
| `migration:generate` / `migration:run` / `migration:revert` | wrap `typeorm` |

There is no `test`, `format`, or `format:check` script in this workspace — Prettier runs from the repo root.

## Bootstrap (`main.ts`)

- Global prefix `api`, derived from the shared `API_PREFIX` (`/api`) with the leading slash stripped.
- Global `ValidationPipe({ whitelist: true, transform: true })`, `AllExceptionsFilter`, `LoggingInterceptor`.
- CORS enabled (`app.enableCors()`).
- Port: `process.env.PORT ?? 3000`.

## Cross-module interaction: CQRS, not direct imports

The `users` module owns the command/query handlers (`CreateUserCommand`, `GetUserByEmailQuery`, `GetUserByIdQuery`) and registers them; other modules dispatch through `CommandBus` / `QueryBus`. The message classes under `users/commands` and `users/queries` are the only shared contract — `AuthModule` does **not** import `UsersModule`/`UsersService`. Any module using the buses (and the ones owning handlers) must import `CqrsModule`. `CategoriesService.create` / `TransactionsService.create` and `JwtStrategy` verify the owning user via the `QueryBus` (`GetUserByIdQuery`) rather than importing `UsersService`.

## Modules

Each domain is a self-contained Nest module registering its TypeORM entities via `TypeOrmModule.forFeature`.

### auth

- Endpoints: `POST /api/auth/register`, `POST /api/auth/login` (returns 200). No logout, no refresh endpoint, no `GET /auth/me` yet — a refresh token is issued but never consumed server-side.
- `AuthService.register`/`login` return `{ user, tokens: { accessToken, refreshToken } }` (shared `AuthResponse`). Passwords hashed with `bcrypt` (`SALT_ROUNDS = 10`).
- `JwtStrategy` extracts the bearer token (`ExtractJwt.fromAuthHeaderAsBearerToken()`), validates the user via `GetUserByIdQuery`, and puts `{ userId, email }` on `request.user`. `JwtAuthGuard` extends `AuthGuard('jwt')`; the `@CurrentUser('userId' | 'email')` param decorator reads from `request.user`.
- `AuthModule` imports `CqrsModule`; providers `[AuthService, JwtStrategy]`; exports `[PassportModule, JwtStrategy]`. `JwtAuthGuard` is imported by other modules via relative path, not module export.
- Token secret/expiry come from `JWT_SECRET` / `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN`.
- IMPORTANT: `RegisterDto` / `LoginDto` are shared **interfaces**, not class-validator classes, so the global `ValidationPipe` does not validate auth request bodies.

### users

- `UserEntity`: `id` (uuid), `email` (unique), `name`, `passwordHash` (column `password_hash`), `createdAt` / `updatedAt`, and `OneToMany` relations to expenses/categories/transactions.
- No controller and no `exports` — users are never exposed over REST; the only entry points are the CQRS handlers.

### expenses (partial — superseded by transactions)

- `ExpenseEntity`: `id`, `amount` (numeric(12,2)), `currency` (default `USD`), `description`, `date`, `categoryId` (FK, `onDelete: SET NULL` on the relation but the column is **NOT nullable**), `userId` (FK CASCADE), timestamps.
- Controller (JWT-guarded, `@CurrentUser('userId')`): `GET /expenses` and `POST /expenses` only — no `:id`, `PATCH`, or `DELETE`. Uses the shared `CreateExpenseDto` **interface** (no class-validator DTO, no CQRS user-existence check). This module predates `transactions` and is effectively legacy.

### categories (full CRUD)

- Under `/categories`, JWT-guarded, scoped to `@CurrentUser('userId')`. Endpoints: `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` (204). `:id` params use `ParseUUIDPipe`.
- `CategoriesService` owns the CRUD logic; reads/updates/deletes are scoped on `{ id, userId }` (404 on miss); `create` verifies the user via `GetUserByIdQuery`.
- DTO classes in `categories/dto` (`CreateCategoryDto`, `UpdateCategoryDto`) `implements` the shared interfaces so the `ValidationPipe` can validate them. `color` is optional (`@IsHexColor`), entity default `#7c3aed`; `icon` optional.
- `CategoryEntity`: `id`, `name`, `color`, `icon?`, `userId`. No timestamp columns.

### transactions (full CRUD + aggregation)

- The central income/expense ledger under `/transactions`, JWT-guarded, scoped to `@CurrentUser('userId')`. Endpoints: `POST /`, `GET /` (list + aggregation), `GET /:id`, `PATCH /:id`, `DELETE /:id` (204).
- `TransactionEntity`: `amount` (numeric(12,2) with a transformer returning a JS `number`), `type` (Postgres enum `transactions_type_enum` = `income`/`expense`, from the shared `TransactionType` enum), `description`, `date`, nullable `categoryId` (FK `ON DELETE SET NULL`), `userId` (FK `ON DELETE CASCADE`), timestamps.
- `GET /transactions` accepts optional `month` (1–12), `year`, `type`, and pagination `page` / `pageSize` (coerced via `@Type(() => Number)` in `QueryTransactionsDto`) and returns `{ items, summary, total, page, pageSize }`.
- `summary` (`{ income, expense, balance }`) and `total` are computed with a **SQL aggregate** in `computeAggregate` (a `createQueryBuilder` with `COUNT(*)` and `SUM(CASE WHEN type = 'income'/'expense' ...)`), not by iterating rows in JS. `balance = income − expense` (rounded to 2 dp). The aggregate respects the same filters (`userId`, optional `type`, optional date range), so a `type` filter also narrows the summary.
- Date range: `month` without `year` defaults to the current year; `year` alone spans the whole year; both narrow to that month.
- Pagination is opt-in: `summary`/`total` always cover the full filtered set, but `items` are sliced with `take`/`skip` only when `page` or `pageSize` is provided (otherwise all rows are returned with `page=1`, `pageSize=total`). `pageSize` defaults to the shared `DEFAULT_PAGE_SIZE` (20). Ordering: `date DESC, createdAt DESC`.
- The service/controller return entities via the local `TransactionListResult` (dates are `Date`), not the shared `TransactionList` (whose dates are strings). DTO classes in `transactions/dto` `implements` the shared interfaces; the shared `TransactionType` enum is the single source of truth (backend `@IsEnum` + enum column, frontend `z.nativeEnum`).

## Database / TypeORM

- `config/typeorm.config.ts` (`buildTypeOrmOptions`) builds `DataSourceOptions` from env — either `DATABASE_URL` or discrete `POSTGRES_*` vars (defaults host `localhost`, port `5432`, user/pass `expense`, db `expense_tracker`). `synchronize` is off; `logging` is on when `NODE_ENV === 'development'`. Entities/migrations are resolved by glob.
- `data-source.ts` exports exactly one `DataSource` (`AppDataSource`) — the TypeORM CLI rejects a file with multiple `DataSource` exports, so do not add a `default` export.
- Migrations: `1782932796218-Init.ts` (users/categories/expenses) and `1783459710073-Transactions.ts` (transactions table + `transactions_type_enum`). On a fresh DB run `migration:run` before hitting data endpoints, otherwise they 500.

### Running migrations

The TypeORM CLI does not load `.env` — export the vars first:

```bash
set -a && . apps/backend/.env && set +a

npm run migration:generate --workspace @expense-tracker/backend -- src/migrations/<Name>
npm run migration:run --workspace @expense-tracker/backend
npm run migration:revert --workspace @expense-tracker/backend
```

## Environment (`apps/backend/.env`)

Read by the NestJS app: `NODE_ENV`, `PORT`, `POSTGRES_*` / `DATABASE_URL`, `JWT_SECRET` / `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` (see `.env.example`). Note `.env.example` ships port **5432**, but local dev uses **5433** (see the root `CLAUDE.md` Gotchas) — mirror `POSTGRES_PORT=5433` and the `DATABASE_URL` in your backend `.env`.

```bash
cp apps/backend/.env.example apps/backend/.env
```

## Conventions

- TypeORM entities are named `*.entity.ts` with `*Entity` classes; DB columns use snake_case via explicit `name`.
- Request bodies validate through class-validator DTO classes in `<module>/dto` that `implements` the shared `@expense-tracker/shared` interfaces — the global `ValidationPipe` validates classes, not interfaces, which is why auth/expenses (which use the shared interfaces directly) are not validated.
- The backend resolves `@expense-tracker/shared` through normal Node/TS resolution to the built `dist`, so the shared `dist/` must exist before `nest start` / `node dist/main.js` (`prebuild` / `prestart:dev` build it for you). Do not point the backend `tsconfig` `paths` at the shared source: that co-compiles the source into the backend output and breaks the `dist/main.js` entry.
