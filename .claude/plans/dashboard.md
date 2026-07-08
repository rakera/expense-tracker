# Dashboard implementation

Build the dashboard (main screen) per `.claude/prompts/dashboard.md`: add server-side
pagination to transactions (shared + backend), then compose an FSD dashboard page showing
the user's name, navigation to transactions/categories, and a paginated list of the last
10 transactions. User name comes from the existing session store (no new endpoint).

## Backend + shared: server-side pagination

Pagination is opt-in so the existing Transactions page (calls `list()` with no params)
still gets the full list, while the dashboard passes `page`/`pageSize`.

- `packages/shared/src/dto/index.ts` — `QueryTransactionsDto` gains optional `page`, `pageSize`.
- `packages/shared/src/types/index.ts` — `TransactionList` gains `total`, `page`, `pageSize`
  (summary stays over the full filtered set).
- Rebuild shared: `npm run build --workspace @expense-tracker/shared`.
- `apps/backend/src/transactions/dto/query-transactions.dto.ts` — `page` (`@IsInt @Min(1)`),
  `pageSize` (`@IsInt @Min(1) @Max(100)`), both coerced via `@Type(() => Number)`.
- `apps/backend/src/transactions/transactions.service.ts` — `TransactionListResult` gains
  `total`/`page`/`pageSize`; `findAll` computes `summary`/`total` over the full filtered set,
  then paginates items with `take`/`skip` when `page`/`pageSize` are present (otherwise returns
  all rows with `page=1`, `pageSize=total`). `pageSize` defaults to shared `DEFAULT_PAGE_SIZE`.
- No migration (no schema change).

## Frontend (FSD)

- `apps/frontend/src/entities/transaction/api/transaction.api.ts` — `toQueryString` adds
  `page`/`pageSize`.
- `apps/frontend/src/entities/transaction/model/use-paginated-transactions.ts` (new) — manages
  `page` state, calls `transactionApi.list({ page, pageSize })`, exposes `items`, `total`,
  `page`, `pageCount`, `hasPrev`, `hasNext`, `loading`, `prev`/`next`/`setPage`. Exported from
  the entity barrel.
- `apps/frontend/src/widgets/recent-transactions/` (new) — `RecentTransactions` renders the
  paginated list (10/page) in a `Card` with prev/next controls, reusing the `ru-RU` currency
  formatting pattern.
- `apps/frontend/src/pages/dashboard/ui/DashboardPage.tsx` — greeting with
  `useCurrentUser()?.name`, menu of `Card`/`Link` shortcuts to `ROUTES.transactions` and
  `ROUTES.categories`, and `<RecentTransactions />`.

## Verify

- `npm run build && npm run lint` (root) — green (pre-existing shadcn fast-refresh warnings only).
