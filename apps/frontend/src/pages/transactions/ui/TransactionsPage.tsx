import { TransactionType } from '@expense-tracker/shared';

import { useTransactions } from '@/entities/transaction';
import { CreateTransactionForm } from '@/features/transaction/create-transaction';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
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

export function TransactionsPage() {
  const { transactions, summary, loading, create, remove } = useTransactions();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Транзакции</h1>
        <p className="mt-2 text-muted-foreground">Учёт доходов и расходов.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Доходы</CardDescription>
            <CardTitle className="text-emerald-600">{formatAmount(summary.income)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Расходы</CardDescription>
            <CardTitle className="text-destructive">{formatAmount(summary.expense)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Баланс</CardDescription>
            <CardTitle className="text-brand">{formatAmount(summary.balance)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новая операция</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTransactionForm onSubmit={create} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка…</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Операций пока нет.</p>
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((transaction) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void remove(transaction.id);
                    }}
                  >
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
