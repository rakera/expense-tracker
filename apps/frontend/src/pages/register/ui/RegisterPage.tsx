import { Link } from 'react-router-dom';

import { RegisterForm } from '@/features/auth/register';
import { ROUTES } from '@/shared/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-brand">Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт, чтобы отслеживать расходы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link to={ROUTES.login} className="font-medium text-brand hover:underline">
              Войдите
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
