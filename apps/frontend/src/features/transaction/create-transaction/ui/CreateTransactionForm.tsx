import type { CreateTransactionDto } from '@expense-tracker/shared';
import { TransactionType } from '@expense-tracker/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createTransactionSchema, type CreateTransactionValues } from '../model/schema';

import { ApiError } from '@/shared/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui';

interface CreateTransactionFormProps {
  onSubmit: (dto: CreateTransactionDto) => Promise<void>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateTransactionForm({ onSubmit }: CreateTransactionFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateTransactionValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: TransactionType.Expense,
      amount: '',
      description: '',
      date: today(),
    },
  });

  const submit = async (values: CreateTransactionValues) => {
    setFormError(null);
    try {
      await onSubmit({
        type: values.type,
        amount: Number(values.amount),
        description: values.description,
        date: values.date,
      });
      form.reset({
        type: values.type,
        amount: '',
        description: '',
        date: today(),
      });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Не удалось сохранить операцию. Попробуйте позже.',
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value={TransactionType.Expense}>Расход</option>
                    <option value={TransactionType.Income}>Доход</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сумма</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Input placeholder="Например, продукты" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError ? <p className="text-sm font-medium text-destructive">{formError}</p> : null}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Добавить операцию
        </Button>
      </form>
    </Form>
  );
}
