import type { Transaction } from '@expense-tracker/shared';
import { TransactionType } from '@expense-tracker/shared';

import { formatAmount } from '@/entities/transaction/lib/format-amount';
import { Button } from '@/shared/ui';

interface TransactionRowProps {
  transaction: Transaction;
  onRemove?: (id: string) => void;
}

export function TransactionRow({ transaction, onRemove }: TransactionRowProps) {
  return (
    <li className="flex items-center gap-4 py-3">
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
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(transaction.id)}
        >
          Удалить
        </Button>
      )}
    </li>
  );
}
