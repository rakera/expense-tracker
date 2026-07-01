import { Link } from 'react-router-dom';

import { ROUTES } from '../router/paths';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Страница не найдена.</p>
      <Link to={ROUTES.home} className="text-brand hover:underline">
        На главную
      </Link>
    </div>
  );
}
