# Expense Tracker

Монорепозиторий трекера расходов.

- Frontend: Vite + React 18 + TypeScript + Tailwind CSS
- Backend: NestJS + TypeScript + TypeORM + PostgreSQL
- Общий код: `packages/shared`
- Tooling: ESLint + Prettier, Docker Compose
- Пакетный менеджер: npm workspaces

## Структура

```text
expense-tracker/
├── apps/
│   ├── frontend/        # Vite + React + TS + Tailwind
│   └── backend/         # NestJS + TypeORM
├── packages/
│   ├── shared/          # общие типы/DTO/константы
│   ├── eslint-config/   # общий ESLint + Prettier конфиг
│   └── tsconfig/        # базовые tsconfig пресеты
├── docker/
│   └── postgres/        # init.sql для PostgreSQL
├── .github/workflows/   # CI
├── docker-compose.yml
├── tsconfig.base.json
└── package.json
```

## Требования

- Node.js `>=20`
- npm `>=10`
- Docker + Docker Compose (для PostgreSQL)

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env файлы (см. раздел «Переменные окружения»)

# 3. Поднять PostgreSQL
npm run db:up

# 4. Применить миграции (создать схему БД)
set -a && . apps/backend/.env && set +a
npm run migration:run --workspace @expense-tracker/backend

# 5. Запустить оба приложения в dev-режиме
npm run dev
```

После запуска:

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3000/api>

### Переменные окружения

Backend читает настройки из `apps/backend/.env`. Скопируйте пример:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Docker Compose читает корневой `.env` (там же переопределяется хостовый порт БД).
Оба файла в `.gitignore`.

> **Порт БД:** по умолчанию используется хостовый порт **5433** (`POSTGRES_PORT=5433`),
> так как `5432` часто уже занят локальным PostgreSQL. Если `5432` свободен —
> можно убрать переопределение и использовать стандартный порт.

### Доступ к базе данных

Значения по умолчанию (из `docker-compose.yml` / `.env`):

| Параметр        | Значение         |
| --------------- | ---------------- |
| Host            | `localhost`      |
| Port (host)     | `5433`           |
| User            | `expense`        |
| Password        | `expense`        |
| Database        | `expense_tracker`|

Строка подключения:

```text
postgres://expense:expense@localhost:5433/expense_tracker
```

Подключиться через `psql` в контейнере:

```bash
docker exec -it expense-tracker-postgres psql -U expense -d expense_tracker
```

## Скрипты (корень)

| Скрипт                | Описание                             |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Запуск frontend и backend            |
| `npm run build`       | Сборка всех workspace                |
| `npm run lint`        | Линтинг всех workspace               |
| `npm run format`      | Форматирование Prettier              |
| `npm run db:up`       | Поднять PostgreSQL в Docker          |
| `npm run db:down`     | Остановить контейнеры Docker Compose |
