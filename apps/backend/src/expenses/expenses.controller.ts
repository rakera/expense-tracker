import type { CreateExpenseDto } from '@expense-tracker/shared';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ExpenseEntity } from './expense.entity';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Query('userId') userId: string): Promise<ExpenseEntity[]> {
    return this.expensesService.findAll(userId);
  }

  @Post()
  create(
    @Query('userId') userId: string,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseEntity> {
    return this.expensesService.create(userId, dto);
  }
}
