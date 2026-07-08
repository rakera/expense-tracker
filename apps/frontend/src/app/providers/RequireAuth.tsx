import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useIsAuthenticated } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';

export function RequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
