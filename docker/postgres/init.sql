-- Инициализация БД PostgreSQL для Expense Tracker.
-- Выполняется один раз при первом создании контейнера.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Схема таблиц управляется миграциями TypeORM (apps/backend/src/migrations).
