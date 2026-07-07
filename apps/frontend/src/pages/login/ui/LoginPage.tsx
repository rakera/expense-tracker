import { Link } from 'react-router-dom';

import { LoginForm } from '@/features/auth/login';
import { ROUTES } from '@/shared/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-brand">Вход</CardTitle>
          <CardDescription>Войдите в свой аккаунт Expense Tracker</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link to={ROUTES.register} className="font-medium text-brand hover:underline">
              Зарегистрируйтесь
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
