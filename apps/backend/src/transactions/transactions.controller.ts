import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionEntity } from './transaction.entity';
import { TransactionsService, type TransactionListResult } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @CurrentUser('userId') userId: string,
    @Query() query: QueryTransactionsDto,
  ): Promise<TransactionListResult> {
    return this.transactionsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionEntity> {
    return this.transactionsService.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionEntity> {
    return this.transactionsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    return this.transactionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.transactionsService.remove(userId, id);
  }
}
