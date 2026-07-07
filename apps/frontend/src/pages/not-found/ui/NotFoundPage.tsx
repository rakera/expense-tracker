import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/routes';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Страница не найдена.</p>
      <Link to={ROUTES.home} className="text-brand hover:underline">
        На главную
      </Link>
    </div>
  );
}
