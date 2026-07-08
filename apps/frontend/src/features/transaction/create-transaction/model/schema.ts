import { TransactionType } from '@expense-tracker/shared';
import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z
    .string()
    .min(1, 'Введите сумму')
    .refine((value) => Number(value) > 0, 'Сумма должна быть больше 0'),
  description: z.string().min(1, 'Введите описание').max(255, 'Не более 255 символов'),
  date: z.string().min(1, 'Выберите дату'),
});

export type CreateTransactionValues = z.infer<typeof createTransactionSchema>;
