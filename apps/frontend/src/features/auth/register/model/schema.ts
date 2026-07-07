import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
