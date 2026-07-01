import type { Expense } from '@expense-tracker/shared';
import { useEffect, useState } from 'react';

import { expensesService } from '../services/expenses.service';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    expensesService
      .list()
      .then((result) => {
        if (active) {
          setExpenses(result.items);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { expenses, loading };
}
