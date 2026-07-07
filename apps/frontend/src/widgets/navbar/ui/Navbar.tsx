import { NavLink } from 'react-router-dom';

import { useCurrentUser } from '@/entities/session';
import { LogoutButton } from '@/features/auth/logout';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

const links = [
  { to: ROUTES.home, label: 'Дашборд' },
  { to: ROUTES.transactions, label: 'Транзакции' },
  { to: ROUTES.expenses, label: 'Расходы' },
  { to: ROUTES.categories, label: 'Категории' },
];

export function Navbar() {
  const user = useCurrentUser();

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <span className="text-lg font-bold text-brand">Expense Tracker</span>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === ROUTES.home}
                className={({ isActive }) =>
                  cn(
                    'text-muted-foreground transition-colors hover:text-brand',
                    isActive && 'font-semibold text-brand',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <span className="text-sm text-muted-foreground">{user.email}</span>
          ) : null}
          <LogoutButton />
        </div>
      </nav>
    </header>
  );
}
