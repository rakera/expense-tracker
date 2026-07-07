# Transactions module

## Goal

Central income/expense ledger. Full JWT-protected CRUD following the `categories/` pattern
(entity, class-validator DTOs implementing shared interfaces, service, controller, module),
cross-module user verification via the CQRS `QueryBus`, a generated TypeORM migration, and an
FSD frontend slice (entity + create feature + page).

## Data model

`TransactionEntity` (`transactions` table):

- `id` uuid PK
- `amount` numeric(12,2) — column transformer returns a JS `number` (pg returns strings)
- `type` Postgres enum `transactions_type_enum` (`income` | `expense`)
- `description` varchar
- `date` date
- `category_id` uuid, nullable, FK → `categories(id)` `ON DELETE SET NULL`
- `user_id` uuid, FK → `users(id)` `ON DELETE CASCADE`
- `created_at` / `updated_at`

Inverse `@OneToMany transactions` relations added to `UserEntity` and `CategoryEntity`.

## CQRS interaction

`TransactionsService.create` verifies the owning user through the `QueryBus`
(`GetUserByIdQuery`, owned by `UsersModule`) — no `UsersService`/`UsersModule` import, same as
`categories`. `TransactionsModule` imports `CqrsModule`.

## Endpoints (all under `/api`, JWT-guarded, scoped to `@CurrentUser('userId')`)

- `POST /transactions` — create for current user
- `GET /transactions?month&year&type` — list + aggregation (`{ items, summary }` where summary is
  `{ income, expense, balance }`); optional `month` (1-12), `year`, and `type` filters build a date
  range (month defaults to the current year when only `month` is given)
- `GET /transactions/:id` — one owned transaction
- `PATCH /transactions/:id` — update owned transaction
- `DELETE /transactions/:id` — delete owned transaction (204)

## Design decisions

- Validation lives in backend DTO classes (class-validator); the shared package only holds
  interfaces/enums. `QueryTransactionsDto` uses `class-transformer` `@Type(() => Number)` so query
  strings coerce to numbers under the global `ValidationPipe` (`transform: true`).
- `amount` uses `@IsNumber({ maxDecimalPlaces: 2 })` + `@IsPositive`; `type` uses `@IsEnum(TransactionType)`.
- `GET /transactions` returns entities (with `Date` fields), so the service/controller return a
  local `TransactionListResult` (entities) instead of the shared `TransactionList` (string dates),
  mirroring how `categories`/`expenses` return entities directly.
- The summary is computed in JS from the fetched rows (amounts already numbers via the transformer).
- `TransactionType` is a real `enum` in `packages/shared` so backend DTOs (`@IsEnum`), the entity
  (`enum` column), and the frontend (`z.nativeEnum`, comparisons) share one source of truth.

## Frontend (FSD)

- `entities/transaction` — `transaction.api.ts` (`list`/`create`/`update`/`remove`, builds the
  `?month&year&type` query string) + `useTransactions` hook (items, summary, `create`, `remove`,
  `refresh`); exposed via `index.ts` barrel.
- `features/transaction/create-transaction` — react-hook-form + zod form; `amount` is a string
  field converted to a number on submit (avoids the `z.coerce` / `zodResolver` input≠output type
  clash); calls an injected `onSubmit(dto)`.
- `pages/transactions` — income/expense/balance summary cards, the create form, and the history
  list with per-row delete. Wired into `app/router.tsx` (`ROUTES.transactions = '/transactions'`)
  under `RequireAuth`/`AppLayout`, plus a navbar link.

## Task checklist

- [x] Shared: `TransactionType` enum, `Transaction`, `TransactionSummary`, `TransactionList`,
      `CreateTransactionDto`, `UpdateTransactionDto`, `QueryTransactionsDto`; rebuild shared `dist`.
- [x] Backend: entity, DTOs, service (CRUD + aggregation + `QueryBus` user check), controller,
      module; register in `AppModule`; inverse relations on user/category entities.
- [x] Migration `*-Transactions.ts` generated and applied.
- [x] Frontend: entity slice, create feature, page, route + navbar link.
- [x] `npm run build && npm run lint` (0 errors; 2 pre-existing shadcn fast-refresh warnings).
- [x] Update `CLAUDE.md`; confirm no `UsersService`/`UsersModule` import inside `transactions/`.

## Files

- `packages/shared/src/types/index.ts`, `packages/shared/src/dto/index.ts`
- `apps/backend/src/transactions/{transaction.entity,transactions.service,transactions.controller,transactions.module}.ts`
- `apps/backend/src/transactions/dto/{create-transaction,update-transaction,query-transactions}.dto.ts`
- `apps/backend/src/{app.module.ts,users/user.entity.ts,categories/category.entity.ts}`
- `apps/backend/src/migrations/*-Transactions.ts`
- `apps/frontend/src/entities/transaction/**`, `apps/frontend/src/features/transaction/create-transaction/**`
- `apps/frontend/src/pages/transactions/**`, `apps/frontend/src/app/router.tsx`
- `apps/frontend/src/shared/config/routes.ts`, `apps/frontend/src/widgets/navbar/ui/Navbar.tsx`

## Verification

- `npm run build` and `npm run lint` from the repo root.
- Migration: `set -a && . apps/backend/.env && set +a` then
  `npm run migration:run --workspace @expense-tracker/backend`.
- Manual: obtain a JWT via `POST /api/auth/login`, then exercise the CRUD + `GET /transactions`
  aggregation with `Authorization: Bearer <accessToken>`.
