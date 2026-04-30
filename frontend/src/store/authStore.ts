import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Utilizador } from '../types/auth';

interface AuthState {
  token: string | null;
  utilizador: Utilizador | null;
  isAuthenticated: boolean;
  login: (token: string, utilizador: Utilizador) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      utilizador: null,
      isAuthenticated: false,

      login: (token, utilizador) =>
        set({ token, utilizador, isAuthenticated: true }),

      logout: () =>
        set({ token: null, utilizador: null, isAuthenticated: false }),
    }),
    { name: 'patudos-auth' }
  )
);
