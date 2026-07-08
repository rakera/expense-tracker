import type {
  CreateTransactionDto,
  QueryTransactionsDto,
  Transaction,
  TransactionSummary,
} from '@expense-tracker/shared';
import { useCallback, useEffect, useState } from 'react';

import { transactionApi } from '@/entities/transaction/api/transaction.api';

const EMPTY_SUMMARY: TransactionSummary = { income: 0, expense: 0, balance: 0 };

export function useTransactions(params: QueryTransactionsDto = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);

  const { month, year, type } = params;

  const refresh = useCallback(() => {
    setLoading(true);
    return transactionApi
      .list({ month, year, type })
      .then((result) => {
        setTransactions(result.items);
        setSummary(result.summary);
      })
      .finally(() => setLoading(false));
  }, [month, year, type]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    transactionApi
      .list({ month, year, type })
      .then((result) => {
        if (active) {
          setTransactions(result.items);
          setSummary(result.summary);
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
  }, [month, year, type]);

  const create = useCallback(
    async (dto: CreateTransactionDto) => {
      await transactionApi.create(dto);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await transactionApi.remove(id);
      await refresh();
    },
    [refresh],
  );

  return { transactions, summary, loading, refresh, create, remove };
}
