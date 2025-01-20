import { defineStore } from 'pinia';
import { store } from '@/store';

interface BakState {
  text: string;
}

export const useBakStore = defineStore({
  id: 'app-bak',
  persist: true,
  state: (): BakState => ({
    text: 'app-bak',
  }),
  getters: {},
  actions: {
    setText() {
      const text = Math.random().toString();
      this.text = text;
    },
  },
});

// Need to be used outside the setup
export function useBakStoreWithOut() {
  return useBakStore(store);
}
