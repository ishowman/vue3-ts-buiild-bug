import { defineStore } from 'pinia';
import { StorageKeys } from '@/constants';
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
const id = 'setting';
type Mode = 'test' | 'prod';
export interface ISettingState {
  mode: Mode;
}

export const useAuthStore = defineStore(id, {
  state: () =>
    ({
      mode: 'prod',
    } as ISettingState),
  actions: {
    setMode(mode: Mode) {
      this.mode = mode;
      localStorage.setItem(StorageKeys.mode, mode);
    },
  },
  getters: {
    isTestMode: (state) => state.mode === 'test',
  },
});

export const authStore = useAuthStore();
