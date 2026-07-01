# Миграции TypeORM

Файлы миграций генерируются в эту папку.

```bash
# Сгенерировать миграцию по изменениям в сущностях
npm run migration:generate --workspace @expense-tracker/backend -- src/migrations/InitSchema

# Применить миграции
npm run migration:run --workspace @expense-tracker/backend

# Откатить последнюю миграцию
npm run migration:revert --workspace @expense-tracker/backend
```

DataSource для CLI: [`src/data-source.ts`](../data-source.ts).
