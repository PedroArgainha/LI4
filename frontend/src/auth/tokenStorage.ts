import type { Utilizador } from '../types/auth';

const TOKEN_KEY = 'patudos_token';
const USER_KEY = 'patudos_user';

export const tokenStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: (): Utilizador | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: Utilizador) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
