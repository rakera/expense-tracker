import type { CreateExpenseDto } from '@expense-tracker/shared';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ExpenseEntity } from './expense.entity';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@CurrentUser('userId') userId: string): Promise<ExpenseEntity[]> {
    return this.expensesService.findAll(userId);
  }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseEntity> {
    return this.expensesService.create(userId, dto);
  }
}
