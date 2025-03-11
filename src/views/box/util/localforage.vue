<template>
  <div>
    <button @click="init">init</button>
    <button @click="getStoreItem">getStoreItem</button>
    <button @click="setStoreItem">setStoreItem</button>
    <button @click="getItem">getItem</button>
    <button @click="setItem">setItem</button>
    <button @click="setTabItem">setTabItem</button>
  </div>
</template>

<script lang="ts" setup>
  import { useDBStore } from '@/store/modules/db';
  import { useTabStore } from '@/store/modules/tab';
  import { getStorageShortName } from '@/utils/env';
  import localforage from 'localforage';

  const tabStore = useTabStore();

  const key = 'demo-localforage';

  const DBStore = useDBStore();
  const init = () => {
    localforage.config({
      name: getStorageShortName(),
    });
  };

  const setTabItem = () => {
    tabStore.setText();
  };

  const getStoreItem = () => {
    DBStore.getUsersDB('name');
  };

  const setStoreItem = () => {
    DBStore.setUsersDB('name1', Math.random().toString());
  };
  const getItem = () => {
    localforage.getItem(key).then((value) => {
      console.log('value', value);
    });
  };

  const setItem = () => {
    localforage.setItem(key, 'hello world' + Math.random()).then((value) => {
      console.log('value', value);
    });
  };
</script>

<style lang="less" scoped></style>
