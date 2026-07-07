import { TransactionRow, usePaginatedTransactions } from '@/entities/transaction';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

export function RecentTransactions() {
  const { items, page, pageCount, hasPrev, hasNext, loading, error, prev, next } =
    usePaginatedTransactions({ pageSize: 10 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние операции</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Операций пока нет.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
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
