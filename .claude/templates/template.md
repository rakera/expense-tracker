# Новая функциональность

## Контекст (что уже есть)

- Monorepo: NestJS + TypeORM + PostgreSQL (backend), Vite + React + FSD + shadcn/ui (frontend), `packages/shared`
- JWT-auth: `JwtAuthGuard`, `@CurrentUser('userId')`
- Cross-module — только через CQRS (`CommandBus` / `QueryBus`), без import чужих `*Service`
- Эталоны: backend `apps/backend/src/categories/`, frontend `features/auth/login`

## Задача

<!-- Что нужно реализовать -->

## Модель данных

<!-- Поля TypeORM entity; колонки snake_case; миграция если нужна -->

## Контроллер и эндпоинты

<!-- Список под /api; JWT-guard; scope по userId -->

## Frontend (если нужен)

<!-- FSD: entities / features / pages; react-hook-form + zod; apiClient с Bearer -->

## Паттерн

- Backend: структура как `categories/` — entity, dto (class-validator, implements shared), service, controller, module
- Shared: типы и DTO-интерфейсы в `packages/shared`, затем `npm run build --workspace @expense-tracker/shared`
- Frontend: FSD-слои, import через barrel `@/...`

## Ограничения

- Не добавлять зависимости без указания
- Schema — только через TypeORM migrations
- После реализации: `npm run build && npm run lint`
- Сохранить план в `.claude/plans/<name>.md`, обновить `CLAUDE.md`
