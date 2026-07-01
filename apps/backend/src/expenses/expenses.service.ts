import type { CreateExpenseDto } from '@expense-tracker/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ExpenseEntity } from './expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expensesRepository: Repository<ExpenseEntity>,
  ) {}

  findAll(userId: string): Promise<ExpenseEntity[]> {
    return this.expensesRepository.find({ where: { userId } });
  }

  create(userId: string, dto: CreateExpenseDto): Promise<ExpenseEntity> {
    const expense = this.expensesRepository.create({ ...dto, userId });
    return this.expensesRepository.save(expense);
  }
}
