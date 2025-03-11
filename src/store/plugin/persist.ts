/**
 * Pinia Persist Plugin - 优化版
 * Pinia 持久化插件
 */
import type { Pinia } from 'pinia';
import { createPersistedState, Serializer } from 'pinia-plugin-persistedstate';
import type { PersistedStateFactoryOptions } from 'pinia-plugin-persistedstate';
import { getCommonStoragePrefix } from '@/utils/env';
import { Encryption, EncryptionFactory } from '@/utils/cipher';
import { cacheCipher, SHOULD_ENABLE_STORAGE_ENCRYPTION } from '@/settings/encryptionSetting';

export const PERSIST_KEY_PREFIX = getCommonStoragePrefix();

const persistEncryption: Encryption = EncryptionFactory.createAesEncryption({
  key: cacheCipher.key,
  iv: cacheCipher.iv,
});

/**
 * 自定义序列化器
 * @param shouldEnableEncryption 是否加密
 * @returns Serializer
 */
function customSerializer(shouldEnableEncryption: boolean): Serializer {
  if (shouldEnableEncryption) {
    return {
      deserialize: (value) => {
        if (!value) return null;
        try {
          const decrypted = persistEncryption.decrypt(value);
          return JSON.parse(decrypted);
        } catch (error) {
          console.warn('数据解密失败:', error);
          return null;
        }
      },
      serialize: (value) => {
        try {
          const serialized = JSON.stringify(value);
          return persistEncryption.encrypt(serialized);
        } catch (error) {
          console.warn('数据加密失败:', error);
          return '';
        }
      },
    };
  } else {
    return {
      deserialize: (value) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn('JSON 解析失败:', error);
          return null;
        }
      },
      serialize: (value) => {
        try {
          return JSON.stringify(value);
        } catch (error) {
          console.warn('JSON 序列化失败:', error);
          return '';
        }
      },
    };
  }
}

/**
 * 安全的存储操作
 */
const safeStorage = {
  getItem(storage: Storage, key: string) {
    try {
      return storage.getItem(key);
    } catch (error) {
      console.warn(`读取存储失败: ${error}`);
      return null;
    }
  },
  setItem(storage: Storage, key: string, value: string) {
    try {
      storage.setItem(key, value);
    } catch (error) {
      console.warn(`存储失败，可能是存储空间已满或浏览器限制: ${error}`);
    }
  },
};

/**
 * 创建 Pinia 持久化状态选项
 * @param keyPrefix 存储键前缀
 * @param storageType localStorage 或 sessionStorage
 */
export function createPersistedStateOptions(
  keyPrefix: string,
  storageType: Storage = localStorage,
): PersistedStateFactoryOptions {
  return {
    storage: {
      getItem: (key) => safeStorage.getItem(storageType, key),
      setItem: (key, value) => safeStorage.setItem(storageType, key, value),
    },
    key: (id) => `${keyPrefix}__${id}`,
    serializer: customSerializer(SHOULD_ENABLE_STORAGE_ENCRYPTION),
  };
}

/**
 * 注册 Pinia 持久化插件
 * @param pinia Pinia 实例
 * @param storageType localStorage 或 sessionStorage
 */
export function registerPiniaPersistPlugin(pinia: Pinia, storageType: Storage = localStorage) {
  pinia.use(createPersistedState(createPersistedStateOptions(PERSIST_KEY_PREFIX, storageType)));

  // 处理 sessionStorage 多 TAB 同步
  if (storageType === sessionStorage) {
    const channel = new BroadcastChannel('pinia-session-sync');

    channel.onmessage = (event) => {
      if (event.data && event.data.key && event.data.value !== undefined) {
        safeStorage.setItem(sessionStorage, event.data.key, event.data.value);
      }
    };

    window.addEventListener('storage', (event) => {
      if (event.storageArea === sessionStorage && event.key) {
        channel.postMessage({ key: event.key, value: event.newValue });
      }
    });
  }
}
