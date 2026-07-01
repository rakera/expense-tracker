import { DataSource } from 'typeorm';

import { buildTypeOrmOptions } from './config/typeorm.config';

/**
 * Standalone DataSource, используется TypeORM CLI для миграций.
 */
export const AppDataSource = new DataSource(buildTypeOrmOptions());
