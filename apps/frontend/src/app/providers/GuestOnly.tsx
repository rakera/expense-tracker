import { Navigate, Outlet } from 'react-router-dom';

import { useIsAuthenticated } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';

export function GuestOnly() {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
