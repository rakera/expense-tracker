import { formatAmount, TransactionRow, useTransactions } from '@/entities/transaction';
import { CreateTransactionForm } from '@/features/transaction/create-transaction';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

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
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onRemove={(id) => void remove(id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
