# Новая функциональность

Создать модуль транзакций.

## Контекст (что уже есть)

- Monorepo: NestJS + TypeORM + PostgreSQL (backend), Vite + React + FSD + shadcn/ui (frontend), `packages/shared`
- JWT-auth: `JwtAuthGuard`, `@CurrentUser('userId')`
- Cross-module — только через CQRS (`CommandBus` / `QueryBus`), без import чужих `*Service`
- Эталоны: backend `apps/backend/src/categories/`, frontend `features/auth/login`

## Задача

Центральный модуль учёта доходов и расходов.

## Модель данных

Транзакция: id, amount, type (income/expense), description, date, categoryId, userId

## Контроллер и эндпоинты

POST /transactions, GET /transactions (агрегация по month/year),
GET /transactions/:id, PATCH /transactions/:id, DELETE /transactions/:id

## Frontend (если нужен)

UI-компоненты — библиотека shadcn/ui (https://ui.shadcn.com).
Архитектура фронтенда — Feature Slice Design

## Паттерн

- Backend: структура как `categories/` — entity, dto (class-validator, implements shared), service, controller, module
- Shared: типы и DTO-интерфейсы в `packages/shared`, затем `npm run build --workspace @expense-tracker/shared`
- Frontend: FSD-слои, import через barrel `@/...`

## Ограничения

- Не добавлять зависимости без указания
- Schema — только через TypeORM migrations
- После реализации: `npm run build && npm run lint`
- Сохранить план в `.claude/plans/<name>.md`, обновить `CLAUDE.md`
