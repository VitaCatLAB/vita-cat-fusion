import { defineStore } from 'pinia';
import { store } from '@/store';
import localforage from 'localforage';

interface DBState {
  graphDB: LocalForage;
  usersDB: LocalForage;
  filesDB: LocalForage;
}

export const useDBStore = defineStore({
  id: 'app-DB',

  state: (): DBState => ({
    graphDB: localforage.createInstance({
      name: 'graphDB',
    }),
    usersDB: localforage.createInstance({
      name: 'usersDB',
    }),
    filesDB: localforage.createInstance({
      name: 'filesDB',
    }),
  }),
  getters: {},
  actions: {
    async setFilesDB(key: string, value: any) {
      this.filesDB.setItem(key, value);
    },
    async getFilesDB(key: string) {
      return this.filesDB.getItem(key);
    },
    async setUsersDB(key: string, value: any) {
      this.usersDB.setItem(key, value);
    },
    async getUsersDB(key: string) {
      return this.usersDB.getItem(key);
    },
    async setGraphDB(key: string, value: any) {
      this.graphDB.setItem(key, value);
    },
    async getGraphDB(key: string) {
      return this.graphDB.getItem(key);
    },
  },
});

// Need to be used outside the setup
export function useDBStoreWithOut() {
  return useDBStore(store);
}
