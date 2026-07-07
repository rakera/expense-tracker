import {
  DEFAULT_PAGE_SIZE,
  TransactionType,
  type TransactionSummary,
} from '@expense-tracker/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, type FindOptionsWhere, Repository } from 'typeorm';

import { GetUserByIdQuery } from '../users/queries/get-user-by-id.query';
import { UserEntity } from '../users/user.entity';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionEntity } from './transaction.entity';

export interface TransactionListResult {
  items: TransactionEntity[];
  summary: TransactionSummary;
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionsRepository: Repository<TransactionEntity>,
    private readonly queryBus: QueryBus,
  ) {}

  async findAll(userId: string, query: QueryTransactionsDto): Promise<TransactionListResult> {
    const where: FindOptionsWhere<TransactionEntity> = { userId };

    if (query.type) {
      where.type = query.type;
    }

    const range = this.buildDateRange(query.month, query.year);
    if (range) {
      where.date = Between(range.start, range.end);
    }

    const order = { date: 'DESC', createdAt: 'DESC' } as const;

    const summaryRows = await this.transactionsRepository.find({
      where,
      select: { amount: true, type: true },
    });
    const summary = this.summarize(summaryRows);
    const total = summaryRows.length;

    const paginate = query.page !== undefined || query.pageSize !== undefined;
    if (!paginate) {
      const items = await this.transactionsRepository.find({ where, order });
      return { items, summary, total, page: 1, pageSize: total };
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const items = await this.transactionsRepository.find({
      where,
      order,
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    return { items, summary, total, page, pageSize };
  }

  async findOne(userId: string, id: string): Promise<TransactionEntity> {
    const transaction = await this.transactionsRepository.findOne({ where: { id, userId } });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto): Promise<TransactionEntity> {
    const user = await this.queryBus.execute<GetUserByIdQuery, UserEntity | null>(
      new GetUserByIdQuery(userId),
    );

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const transaction = this.transactionsRepository.create({
      ...dto,
      categoryId: dto.categoryId ?? null,
      userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto): Promise<TransactionEntity> {
    const transaction = await this.findOne(userId, id);
    Object.assign(transaction, dto);
    return this.transactionsRepository.save(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.findOne(userId, id);
    await this.transactionsRepository.remove(transaction);
  }

  private buildDateRange(
    month?: number,
    year?: number,
  ): { start: string; end: string } | null {
    if (!month && !year) {
      return null;
    }

    const resolvedYear = year ?? new Date().getFullYear();

    if (month) {
      const start = new Date(Date.UTC(resolvedYear, month - 1, 1));
      const end = new Date(Date.UTC(resolvedYear, month, 0));
      return { start: this.toDateString(start), end: this.toDateString(end) };
    }

    const start = new Date(Date.UTC(resolvedYear, 0, 1));
    const end = new Date(Date.UTC(resolvedYear, 11, 31));
    return { start: this.toDateString(start), end: this.toDateString(end) };
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private summarize(items: TransactionEntity[]): TransactionSummary {
    const summary = items.reduce<TransactionSummary>(
      (acc, item) => {
        if (item.type === TransactionType.Income) {
          acc.income += Number(item.amount);
        } else {
          acc.expense += Number(item.amount);
        }
        return acc;
      },
      { income: 0, expense: 0, balance: 0 },
    );

    summary.balance = Number((summary.income - summary.expense).toFixed(2));
    summary.income = Number(summary.income.toFixed(2));
    summary.expense = Number(summary.expense.toFixed(2));
    return summary;
  }
}
