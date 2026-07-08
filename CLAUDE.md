# CLAUDE.md

Guidance for AI agents (and humans) working in this repository.

This root file covers monorepo-wide concerns. App-specific details live in:

- [`apps/frontend/CLAUDE.md`](apps/frontend/CLAUDE.md) — the Vite + React SPA (Feature-Sliced Design, auth flow, shadcn/Tailwind, Vite config).
- [`apps/backend/CLAUDE.md`](apps/backend/CLAUDE.md) — the NestJS API (modules, JWT auth, CQRS, TypeORM, migrations).

## Overview

Expense Tracker — a monorepo for a personal expense-tracking application.

- Frontend: Vite + React 18 + TypeScript + Tailwind CSS + React Router v6 + shadcn/ui, organised with Feature-Sliced Design.
- Backend: NestJS + TypeScript + TypeORM + PostgreSQL, JWT auth, CQRS.
- Shared code: `packages/shared` (types, DTOs, constants) consumed by both apps.
- Tooling: ESLint + Prettier, Docker Compose.
- Package manager: npm workspaces (Node `>=20`, npm `>=10`).

Status: runnable, actively developed. Dependencies are installed (`node_modules` + `package-lock.json` present), PostgreSQL runs via Docker Compose, and migrations are generated/applied. Auth, categories, and transactions are implemented end to end; expenses is a partial legacy module (list + create) superseded by transactions; the frontend `expenses` and `categories` pages are still placeholder stubs.

## Repository layout

```text
expense-tracker/
├── apps/
│   ├── frontend/            # Vite + React SPA (see apps/frontend/CLAUDE.md)
│   └── backend/             # NestJS API (see apps/backend/CLAUDE.md)
├── packages/
│   ├── shared/              # @expense-tracker/shared: types, dto, constants
│   ├── eslint-config/       # @expense-tracker/eslint-config: index (base) / react / node
│   └── tsconfig/            # @expense-tracker/tsconfig: base / react / node presets
├── docker/
│   └── postgres/init.sql    # PostgreSQL init (extensions; schema is TypeORM-managed)
├── .github/workflows/ci.yml # CI: install, lint, build
├── .claude/                 # plans/, prompts/, templates/ for AI-assisted work
├── docker-compose.yml       # PostgreSQL service
├── tsconfig.base.json       # Root TS config with @expense-tracker/shared paths
├── README.md
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

`build` and `lint` fan out to each workspace (`--workspaces --if-present`); `format` / `format:check` run Prettier from the root. Database migrations are a backend concern — see [`apps/backend/CLAUDE.md`](apps/backend/CLAUDE.md).

### Targeting a single workspace

```bash
npm run <script> --workspace @expense-tracker/frontend
npm run <script> --workspace @expense-tracker/backend
```

## Architecture notes (monorepo)

- Workspaces: `apps/*` and `packages/*`. Internal packages use the `@expense-tracker/*` scope and are referenced by `"*"` version.
- Shared package: `@expense-tracker/shared` ships its compiled `dist` (`main`/`types`/`exports` point at `dist/index.js` / `dist/index.d.ts`). The **frontend** resolves it via a Vite alias straight to the source (`packages/shared/src/index.ts`), so it never needs the build. The **backend** resolves it through normal Node/TS resolution to the built package, so `dist` must exist first — its `prebuild`/`prestart:dev` scripts build shared automatically. Do not point the backend `tsconfig` `paths` back at the shared source: that co-compiles the source into the backend output and breaks the `dist/main.js` entry.
- Shared exports (single source of truth for both apps): types (`User`, `Category`, `Expense`, `Transaction`, `TransactionType` enum, `TransactionSummary`, `TransactionList`, `AuthTokens`, `AuthResponse`, `Paginated<T>`), DTO interfaces (`Create/Update` for expense/category/transaction, `QueryTransactionsDto`, `LoginDto`, `RegisterDto`), and constants (`DEFAULT_CURRENCY`, `SUPPORTED_CURRENCIES`, `DEFAULT_PAGE_SIZE = 20`, `API_PREFIX = '/api'`).
- Root `tsconfig.base.json` maps `@expense-tracker/shared` to `packages/shared/src` for editor/TS resolution.

## Conventions

- TypeScript strict mode everywhere (see `packages/tsconfig`).
- ESLint uses legacy `.eslintrc.cjs` extending `@expense-tracker/eslint-config`. The config files are `index.cjs` (base), `react.cjs`, and `node.cjs` (the react/node presets extend `./index.cjs`).
- Prettier: single quotes, semicolons, trailing commas (`all`), width 100, 2-space indent, `arrowParens: always`, LF.
- Do not add narration-style comments; comment only non-obvious intent.
- App-specific conventions (TypeORM entity naming, DTO validation, FSD layering) live in the respective `apps/*/CLAUDE.md`.

## Git workflow

**Работаем только в ветке `dev`.** Вся разработка и все коммиты идут напрямую в `dev` — не создавай feature-ветки и не переключайся на другие ветки без явной просьбы.

**Ветку `main` не трогаем:** не переключаться на неё, не коммитить, не мержить в неё, не пушить в неё и не открывать в неё pull request. `main` обновляется только вручную владельцем репозитория.

Любые git-операции (checkout, commit, push) выполняй только применительно к `dev`.

<Important if="нужно написать commit">
**Conventional Commits**

IMPORTANT: Использовать Conventional Commits (https://www.conventionalcommits.org/)

для сообщений коммитов:

- Тип: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`
- Область (scope): модуль или область изменений
- Описание на русском, кратко
- Breaking changes помечай `!` перед двоеточием
</important>

Pull request'ы в `main` из-под агента не создаём — при необходимости их открывает владелец репозитория вручную.

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
- Local dev maps Postgres to host port **5433**, not 5432, because a local PostgreSQL already occupies 5432. This is set via `POSTGRES_PORT=5433` in the root `.env` (read by Docker Compose) and should be mirrored in `apps/backend/.env` (`POSTGRES_PORT` + `DATABASE_URL`). Note `apps/backend/.env.example` still ships `5432`, so adjust after copying it. If you free 5432, you can drop these overrides. Both `.env` files are git-ignored.
- The backend depends on the shared package's build output at runtime; `dist/` must exist before `nest start`/`node dist/main.js`. The backend `prebuild` and `prestart:dev` scripts build shared for you, but if you run the compiled entry directly, build shared first.
- On a fresh database, run the backend migrations before hitting the data endpoints (`synchronize` is off), otherwise they 500. See [`apps/backend/CLAUDE.md`](apps/backend/CLAUDE.md).
- The active branch is `dev`, and all agent work stays on `dev` (see Git workflow). `.github/workflows/ci.yml` only triggers on `main` (`push`/`pull_request`), so CI does not run on `dev` pushes — promoting `dev` to `main` is done manually by the repo owner, not from the agent.
- `origin` points at `git@github-personal:rakera/expense-tracker.git`. The GitHub repo was originally misspelled `expence-tracker` and later renamed to `expense-tracker` (GitHub keeps a redirect from the old name); `origin` already uses the corrected URL.
