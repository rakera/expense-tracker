import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui';

export function LogoutButton() {
  const navigate = useNavigate();
  const clearSession = useSessionStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Выйти
    </Button>
  );
}
