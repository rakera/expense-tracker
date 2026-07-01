export interface CreateExpenseDto {
  amount: number;
  currency: string;
  description: string;
  date: string;
  categoryId: string;
}

export type UpdateExpenseDto = Partial<CreateExpenseDto>;

export interface CreateCategoryDto {
  name: string;
  color: string;
  icon?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}
