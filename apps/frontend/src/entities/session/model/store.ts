import type { AuthResponse, User } from '@expense-tracker/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { tokenStorage } from '@/shared/lib/token-storage';

interface SessionState {
  user: User | null;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setSession: ({ user, tokens }) => {
        tokenStorage.setTokens(tokens);
        set({ user });
      },
      clearSession: () => {
        tokenStorage.clear();
        set({ user: null });
      },
    }),
    {
      name: 'expense-tracker:session',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const useCurrentUser = (): User | null => useSessionStore((state) => state.user);

export const useIsAuthenticated = (): boolean =>
  useSessionStore((state) => Boolean(state.user));
