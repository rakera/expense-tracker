import { createBrowserRouter } from 'react-router-dom';

import App from '../App';
import { CategoriesPage } from '../pages/CategoriesPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExpensesPage } from '../pages/ExpensesPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { ROUTES } from './paths';

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.expenses, element: <ExpensesPage /> },
      { path: ROUTES.categories, element: <CategoriesPage /> },
    ],
  },
  { path: ROUTES.login, element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
