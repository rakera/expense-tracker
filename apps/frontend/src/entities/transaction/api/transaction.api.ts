import type {
  CreateTransactionDto,
  QueryTransactionsDto,
  Transaction,
  TransactionList,
  UpdateTransactionDto,
} from '@expense-tracker/shared';

import { apiClient } from '@/shared/api';

function toQueryString(params: QueryTransactionsDto): string {
  const search = new URLSearchParams();
  if (params.month) {
    search.set('month', String(params.month));
  }
  if (params.year) {
    search.set('year', String(params.year));
  }
  if (params.type) {
    search.set('type', params.type);
  }
  if (params.page) {
    search.set('page', String(params.page));
  }
  if (params.pageSize) {
    search.set('pageSize', String(params.pageSize));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const transactionApi = {
  list: (params: QueryTransactionsDto = {}) =>
    apiClient<TransactionList>(`/transactions${toQueryString(params)}`),
  create: (dto: CreateTransactionDto) =>
    apiClient<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: UpdateTransactionDto) =>
    apiClient<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),
  remove: (id: string) =>
    apiClient<void>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
};
