import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { spawn } from 'child_process';
import * as path from 'node:path';
import fs from 'node:fs';

let nestProcess: any;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || '';
const isDev = !!DEV_SERVER_URL;
let win: BrowserWindow | null = null;

function logMain(...args: any[]) {
  const dir = app.getPath('userData');

  // 🔑 关键：确保目录存在
  fs.mkdirSync(dir, { recursive: true });

  const logFile = path.join(dir, 'main.log');

  const msg =
    `[${new Date().toISOString()}] ` +
    args.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ') +
    '\n';

  fs.appendFileSync(logFile, msg, 'utf8');
}

function startNestServer() {
  logMain('resourcesPath:', process.resourcesPath);
  logMain('resourcesPath:', app.isPackaged);

  if (app.isPackaged) {
    const serverEntry = path.join(process.resourcesPath, 'nest-server/dist/main.js');

    logMain('serverEntry:', serverEntry);
    logMain('exists:', fs.existsSync(serverEntry));
    nestProcess = spawn(process.execPath, [serverEntry], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });
  } else {
    // 开发态直接用 NestJS watch
    nestProcess = spawn('pnpm', ['--filter', 'nest-server', 'run', 'start:dev'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../apps/nest-server'), // 🔑 确保 cwd 正确
    });
  }

  nestProcess.stdout?.on('data', (d: any) => logMain('[nest]', d.toString()));
  nestProcess.stderr?.on('data', (d: any) => logMain('[nest err]', d.toString()));
  nestProcess.on('exit', (code: any) => logMain('Nest exited with code:', code));
}

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
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.webContents.openDevTools({ mode: 'detach' });
  if (isDev && DEV_SERVER_URL) {
    win.loadURL(DEV_SERVER_URL);
  } else {
    // vben 构建后 index.html 在 dist/
    const indexHtml = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).toString();
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
  startNestServer();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('before-quit', () => {
  nestProcess?.kill();
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
