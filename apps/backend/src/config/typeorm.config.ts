import { join } from 'node:path';

import type { DataSourceOptions } from 'typeorm';

export function buildTypeOrmOptions(): DataSourceOptions {
  const useUrl = Boolean(process.env.DATABASE_URL);

  return {
    type: 'postgres',
    ...(useUrl
      ? { url: process.env.DATABASE_URL }
      : {
          host: process.env.POSTGRES_HOST ?? 'localhost',
          port: Number(process.env.POSTGRES_PORT ?? 5432),
          username: process.env.POSTGRES_USER ?? 'expense',
          password: process.env.POSTGRES_PASSWORD ?? 'expense',
          database: process.env.POSTGRES_DB ?? 'expense_tracker',
        }),
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  };
}
