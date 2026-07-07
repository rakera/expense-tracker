export const ROUTES = {
  home: '/',
  transactions: '/transactions',
  expenses: '/expenses',
  categories: '/categories',
  login: '/login',
  register: '/register',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
