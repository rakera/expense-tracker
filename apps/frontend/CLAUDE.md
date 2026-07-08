# CLAUDE.md — Frontend (`apps/frontend`)

Guidance for the SPA. See the root [`CLAUDE.md`](../../CLAUDE.md) for monorepo-wide setup, the shared package, git workflow, conventions, and environment. This file covers frontend-specific details.

## Stack

Vite + React 18 + TypeScript + Tailwind CSS v3 + React Router v6 + shadcn/ui, organised with [Feature-Sliced Design](https://feature-sliced.design). State via zustand; forms via react-hook-form + zod. The UI is written in **Russian**.

Key versions: `react`/`react-dom` ^18.3, `react-router-dom` ^6.26, `zustand` ^5, `react-hook-form` ^7.80 + `@hookform/resolvers` ^5, `zod` ^4, `tailwindcss` ^3.4 + `tailwindcss-animate`, `vite` ^5, `lucide-react`, `@radix-ui/react-label` / `react-slot`.

## Scripts (`--workspace @expense-tracker/frontend`)

- `dev` — `vite` (port 5173)
- `build` — `tsc -b && vite build`
- `preview` — `vite preview`
- `lint` — `eslint "src/**/*.{ts,tsx}"`
- `typecheck` — `tsc --noEmit`

## Feature-Sliced Design

Code is organised into **layers**; each layer is split into **slices** (business domains), and each slice into **segments** (`ui`, `model`, `api`, `lib`, `config`). Imports only ever point **downward**. A slice's public API is its `index.ts` barrel — import across slices via the barrel (`@/features/auth/login`), not deep paths. The `@` alias maps to `src` (tsconfig `paths` + Vite alias). Slices only use the segments they need.

Layers, highest to lowest:

### `app/`
Application composition: `App` (renders `<RouterProvider router={router} />`), `router.tsx` (`createBrowserRouter`), `layouts/AppLayout` (renders `<Navbar />` + `<Outlet />`), `providers/` route guards (`RequireAuth`, `GuestOnly`), and global `styles/index.css`. `main.tsx` renders `<StrictMode><App /></StrictMode>`.

Routing: `GuestOnly` wraps `/login` + `/register` (redirects authenticated users to `/`); `RequireAuth` wraps `AppLayout` and its children (`/`, `/transactions`, `/expenses`, `/categories`; redirects anonymous users to `/login`, preserving `state.from`). `NotFoundPage` (`*`) sits outside both guards.

### `pages/`
One slice per route: `login`, `register`, `dashboard`, `transactions`, `expenses`, `categories`, `not-found`. Pages compose widgets/features/entities and hold no business logic.

- `transactions` is fully implemented (summary cards, create form, deletable history).
- `dashboard` is the main screen: a greeting from `useCurrentUser()` (falls back to "Дашборд"), `Card`/`Link` shortcuts to **transactions and categories** (expenses is only in the navbar), and the `recent-transactions` widget.
- `expenses` and `categories` pages are currently **placeholder stubs** (heading + text), not wired to the backend.

### `widgets/`
Self-contained composite UI blocks:
- `navbar` — links (Dashboard, Transactions, Expenses, Categories), the current user's email, and the `<LogoutButton />`.
- `recent-transactions` — a server-paginated list of recent transactions (`pageSize: 10`) via `usePaginatedTransactions`, rendering `TransactionRow` rows with prev/next controls and loading/error/empty states.

### `features/`
User interactions:
- `auth/login`, `auth/register` — each has `ui` (react-hook-form + `zodResolver`), `model/schema.ts` (zod schema; register `.refine`s password match), and `api/*.ts` (typed `apiClient` call to `POST /auth/login` / `POST /auth/register`).
- `auth/logout` — `ui` only (client-side `clearSession()` + navigate); no `model`/`api`.
- `transaction/create-transaction` — `ui` + `model/schema.ts`, **no `api` segment**: the form receives `onSubmit` from the parent and the API call lives in `useTransactions().create`. `amount` is a zod **string** coerced with `Number(...)` on submit (avoids the `z.coerce` / `zodResolver` input≠output type clash).

### `entities/`
Business entities:
- `session` — a zustand store with `persist` (localStorage key `expense-tracker:session`, `partialize` persists only `{ user }`; tokens are written to `tokenStorage`). Exposes `useSessionStore` (`{ user, setSession, clearSession }`), `useCurrentUser()`, `useIsAuthenticated()`.
- `expense` — `expenseApi` (`list` → `GET /expenses`, `create` → `POST /expenses`) + `useExpenses()` (`{ expenses, loading }`). Currently unused by the UI (legacy alongside `transaction`).
- `transaction` — `transactionApi` (`list(params)` with `month`/`year`/`type`/`page`/`pageSize`, `create`, `update`, `remove`), plus:
  - `useTransactions(params?)` → `{ transactions, summary: { income, expense, balance }, loading, refresh, create, remove }` (accepts optional `{ month, year, type }`; `update` is **not** exposed by the hook even though `transactionApi.update` exists).
  - `usePaginatedTransactions({ pageSize = 10 })` → `{ items, total, page, pageSize, pageCount, hasPrev, hasNext, loading, error, prev, next, setPage }`.
  - `ui/TransactionRow` (row component) and `lib/format-amount` (`Intl.NumberFormat('ru-RU', { currency: 'USD' })`).

### `shared/`
Feature-agnostic building blocks:
- `ui/` — shadcn/ui primitives (`button`, `input`, `label`, `card`, `form` — five components) + `index.ts` barrel. There is no `select` component; `create-transaction` uses a native `<select>`. Add new shadcn/ui components here.
- `api/` — auth-aware `apiClient` + `ApiError` (`client.ts` + barrel).
- `lib/` — `cn` (`clsx` + `tailwind-merge`) and `token-storage` (keys `expense-tracker:access-token` / `-refresh-token`); imported by full path, no barrel.
- `config/` — `routes.ts` (`ROUTES`); no barrel.

Never import "upward" (e.g. `shared` must not import from `entities`; that's why `apiClient` reads the token from `tokenStorage` in `shared/lib`, which the `session` store writes to).

## Auth flow

- Login/registration call `POST /auth/login` / `POST /auth/register`, then `useSessionStore.setSession({ user, tokens })` persists the user and writes tokens via `tokenStorage`, and navigate to `/`.
- `shared/api/client.ts` attaches `Authorization: Bearer <accessToken>` (from `tokenStorage`), parses the backend's `message` (string or array from the `AllExceptionsFilter` / `ValidationPipe`) into a typed `ApiError(status, message)`, and treats 204 as `undefined`.
- Client-side `AuthResponse` only: no `GET /auth/me` refresh-on-load and no token-refresh flow yet (the backend lacks those endpoints). Session is restored from localStorage on reload.

## shadcn/ui + Tailwind setup (manual, Tailwind v3)

- `components.json`: style `default`, `baseColor` violet, aliases `components`/`ui` → `@/shared/ui`, `utils` → `@/shared/lib/cn`, `lib`/`hooks` → `@/shared/lib`.
- CSS variables + `@layer base` in `src/app/styles/index.css`; tokens wired in `tailwind.config.ts` (`darkMode: ['class']`, `tailwindcss-animate` plugin). `brand` = `#7c3aed` (`.dark` `#5b21b6`, `.light` `#a78bfa`); the `--primary`/`--ring` tokens track the violet brand color (`262 83% 58%`).

## Vite config

- Aliases: `@` → `src`; `@expense-tracker/shared` → `../../packages/shared/src/index.ts` (source, so the shared build is never needed for the frontend).
- Dev server on port 5173; proxies `/api` → `http://localhost:3000` (`changeOrigin`).
- API base URL: `import.meta.env.VITE_API_URL ?? API_PREFIX` (shared `API_PREFIX` = `/api`). `VITE_API_URL` is optional (typed in `vite-env.d.ts`).

## Conventions

Follow FSD: put code in the lowest layer that fits, expose each slice through its `index.ts` barrel, and import across slices via `@/<layer>/<slice>` (never deep paths or "upward" layers).
