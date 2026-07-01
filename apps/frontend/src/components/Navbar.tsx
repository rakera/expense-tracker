import { NavLink } from 'react-router-dom';

import { ROUTES } from '../router/paths';

const links = [
  { to: ROUTES.home, label: 'Дашборд' },
  { to: ROUTES.expenses, label: 'Расходы' },
  { to: ROUTES.categories, label: 'Категории' },
];

export function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <span className="text-lg font-bold text-brand">Expense Tracker</span>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === ROUTES.home}
                className={({ isActive }) =>
                  isActive ? 'font-semibold text-brand' : 'text-gray-600 hover:text-brand'
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
