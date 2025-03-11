import { defineStore } from 'pinia';
import { store } from '@/store';

interface TabState {
  text: string;
}

export const useTabStore = defineStore({
  id: 'app-tab1',
  persist: {
    storage: sessionStorage,
  },
  state: (): TabState => ({
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
export function useTabStoreWithOut() {
  return useTabStore(store);
}
