export const ROUTES = {
  home: '/',
  expenses: '/expenses',
  categories: '/categories',
  login: '/login',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
