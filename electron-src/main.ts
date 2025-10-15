import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 开发态：由脚本注入 http://localhost:5173
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || '';
const isDev = !!DEV_SERVER_URL;
let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 840,
    show: false,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      // 安全基线
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  win.webContents.openDevTools({ mode: 'detach' });
  if (isDev && DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL);
  } else {
    // vben 构建后 index.html 在 dist/
    const indexHtml = pathToFileURL(join(__dirname, '..', 'dist', 'index.html')).toString();
    win.loadURL(indexHtml);
  }

  win.once('ready-to-show', () => win?.show());

  // 拦截新开窗口，改为外部浏览器打开（防止在应用内加载不受控页面）
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

/** ===== 应用生命周期 ===== */
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/** ===== 示例 IPC（可按需扩展） ===== */
ipcMain.handle('app:getVersion', () => app.getVersion());

/** （可选）单实例防重开 */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}
