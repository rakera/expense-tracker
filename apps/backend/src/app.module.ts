import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmOptions(),
    }),
    AuthModule,
    UsersModule,
    ExpensesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
