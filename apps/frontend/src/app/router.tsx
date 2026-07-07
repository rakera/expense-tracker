import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from './layouts/AppLayout';
import { GuestOnly } from './providers/GuestOnly';
import { RequireAuth } from './providers/RequireAuth';

import { CategoriesPage } from '@/pages/categories';
import { DashboardPage } from '@/pages/dashboard';
import { ExpensesPage } from '@/pages/expenses';
import { LoginPage } from '@/pages/login';
import { NotFoundPage } from '@/pages/not-found';
import { RegisterPage } from '@/pages/register';
import { ROUTES } from '@/shared/config/routes';


export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.home, element: <DashboardPage /> },
          { path: ROUTES.expenses, element: <ExpensesPage /> },
          { path: ROUTES.categories, element: <CategoriesPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
