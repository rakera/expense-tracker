import type { CreateExpenseDto, Expense, Paginated } from '@expense-tracker/shared';

import { apiClient } from '@/shared/api';

export const expenseApi = {
  list: () => apiClient<Paginated<Expense>>('/expenses'),
  create: (dto: CreateExpenseDto) =>
    apiClient<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
