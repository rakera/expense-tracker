export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface TransactionList {
  items: Transaction[];
  summary: TransactionSummary;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
