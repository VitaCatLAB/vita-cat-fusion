import { defineStore } from 'pinia';
import { store } from '@/store';
import { createPersistConfig } from '@/utils/tabStorageHelper';
import { nanoid } from 'nanoid';

interface GraphState {
  text: string;
  canvas: {
    uuid: string;
  };
}

export const useGraphStore = defineStore({
  id: 'app-graph',
  persist: createPersistConfig('app-graph'), // 自带隔离+超时检测
  state: (): GraphState => ({
    text: 'app-graph',
    canvas: {
      uuid: '',
    },
  }),
  getters: {},
  actions: {
    setCanvasUUID() {
      const uuid = nanoid(10);
      this.canvas.uuid = uuid;
    },
    setText() {
      const text = Math.random().toString();
      this.text = text;
    },
  },
});

// Need to be used outside the setup
export function useGraphStoreWithOut() {
  return useGraphStore(store);
}
