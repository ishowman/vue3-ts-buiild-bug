import { defineStore } from 'pinia';
import { StorageKeys } from '@/constants';
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
const id = 'auth';
export interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
}

export const useAuthStore = defineStore(id, {
  state: () =>
    ({
      accessToken: null,
      refreshToken: null,
    } as IAuthState),
  actions: {
    setToken(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem(StorageKeys.accessToken, accessToken);
      localStorage.setItem(StorageKeys.refreshToken, refreshToken);
    },
    clearTokens() {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem(StorageKeys.accessToken);
      localStorage.removeItem(StorageKeys.refreshToken);
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
});

export const authStore = useAuthStore();
