import { TransactionType } from '@expense-tracker/shared';

import { usePaginatedTransactions } from '@/entities/transaction';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

const numberFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

function formatAmount(value: number): string {
  return numberFormat.format(value);
}

export function RecentTransactions() {
  const { items, page, pageCount, hasPrev, hasNext, loading, prev, next } =
    usePaginatedTransactions({ pageSize: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние операции</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Операций пока нет.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((transaction) => (
              <li key={transaction.id} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <span
                  className={
                    transaction.type === TransactionType.Income
                      ? 'font-semibold text-emerald-600'
                      : 'font-semibold text-destructive'
                  }
                >
                  {transaction.type === TransactionType.Income ? '+' : '−'}
                  {formatAmount(transaction.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={!hasPrev || loading} onClick={prev}>
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Стр. {page} из {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={!hasNext || loading} onClick={next}>
            Вперёд
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
