import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // 文件选择 / 系统调用 / 读取本地配置等，可在此继续挂载安全封装后的接口
  // pickFile: () => ipcRenderer.invoke('fs:pickFile'),
});
