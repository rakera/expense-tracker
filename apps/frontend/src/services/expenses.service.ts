import type { CreateExpenseDto, Expense, Paginated } from '@expense-tracker/shared';

import { apiClient } from '../lib/apiClient';

export const expensesService = {
  list: () => apiClient<Paginated<Expense>>('/expenses'),
  create: (dto: CreateExpenseDto) =>
    apiClient<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
