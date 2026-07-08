# Новая функциональность

Реализовать главный экран (dashboard).

## Контекст (что уже есть)

- Monorepo: NestJS + TypeORM + PostgreSQL (backend), Vite + React + FSD + shadcn/ui (frontend), `packages/shared`
- JWT-auth: `JwtAuthGuard`, `@CurrentUser('userId')`
- Cross-module — только через CQRS (`CommandBus` / `QueryBus`), без import чужих `*Service`
- Эталоны: backend `apps/backend/src/categories/`, frontend `features/auth/login`

## Задача

Создать главный экран expense tracker.

## Модель данных

Проверить.

## Контроллер и эндпоинты

Проверить.

## Frontend (если нужен)

Меню: переход к транзакциям и категориям.
Профиль пользователя (отображение имени).
Список последних 10 транзакций с пагинацией.
Архитектура — Feature Slice Design.

## Паттерн

- Backend: структура как `categories/` — entity, dto (class-validator, implements shared), service, controller, module
- Shared: типы и DTO-интерфейсы в `packages/shared`, затем `npm run build --workspace @expense-tracker/shared`
- Frontend: FSD-слои, import через barrel `@/...`

## Ограничения

- Не добавлять зависимости без указания
- Schema — только через TypeORM migrations
- После реализации: `npm run build && npm run lint`
- Сохранить план в `.claude/plans/<name>.md`, обновить `CLAUDE.md`
