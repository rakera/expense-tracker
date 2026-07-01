import type { User } from '@expense-tracker/shared';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
};
