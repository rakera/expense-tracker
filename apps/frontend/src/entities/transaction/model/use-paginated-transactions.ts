import type { Transaction } from '@expense-tracker/shared';
import { useEffect, useState } from 'react';

import { transactionApi } from '@/entities/transaction/api/transaction.api';

interface UsePaginatedTransactionsOptions {
  pageSize?: number;
}

export function usePaginatedTransactions({ pageSize = 10 }: UsePaginatedTransactionsOptions = {}) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    transactionApi
      .list({ page, pageSize })
      .then((result) => {
        if (active) {
          setItems(result.items);
          setTotal(result.total);
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
  }, [page, pageSize]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const prev = () => setPage((current) => Math.max(1, current - 1));
  const next = () => setPage((current) => current + 1);

  return { items, total, page, pageSize, pageCount, hasPrev, hasNext, loading, prev, next, setPage };
}
