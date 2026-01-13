import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'child_process';
import * as path from 'node:path';
import fs from 'node:fs';
let nestProcess;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || '';
const isDev = !!DEV_SERVER_URL;
let win = null;
function logMain(...args) {
    const dir = app.getPath('userData');
    // 🔑 关键：确保目录存在
    fs.mkdirSync(dir, { recursive: true });
    const logFile = path.join(dir, 'main.log');
    const msg = `[${new Date().toISOString()}] ` +
        args.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ') +
        '\n';
    fs.appendFileSync(logFile, msg, 'utf8');
}
function attachNestLogs(proc) {
    proc.stdout?.on('data', (d) => logMain('[nest]', d.toString()));
    proc.stderr?.on('data', (d) => logMain('[nest err]', d.toString()));
    proc.on('error', (e) => logMain('Nest spawn error:', String(e)));
    proc.on('exit', (code, signal) => logMain('Nest exited:', { code, signal }));
}
function startNestServer() {
    logMain('resourcesPath:', process.resourcesPath);
    logMain('isPackaged:', app.isPackaged);
    if (app.isPackaged) {
        const serverEntry = path.join(process.resourcesPath, 'nest-server', 'dist', 'main.js');
        logMain('serverEntry:', serverEntry);
        logMain('exists:', fs.existsSync(serverEntry));
        if (!fs.existsSync(serverEntry)) {
            logMain('Nest entry not found, abort start.');
            return;
        }
        nestProcess = spawn(process.execPath, [serverEntry], {
            cwd: path.dirname(serverEntry),
            stdio: ['ignore', 'pipe', 'pipe'],
            windowsHide: true,
            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: '1',
                PORT: process.env.NEST_PORT || '3000',
                DB_DIR: app.getPath('userData'),
                NODE_ENV: 'production',
            },
        });
        nestProcess.stdout?.on('data', (d) => logMain('[nest]', d.toString()));
        nestProcess.stderr?.on('data', (d) => logMain('[nest err]', d.toString()));
        nestProcess.on('error', (e) => logMain('Nest spawn error:', String(e)));
        nestProcess.on('exit', (code, signal) => logMain('Nest exited:', { code, signal }));
    }
    else {
        nestProcess = spawn('pnpm', ['--filter', 'nest-server', 'run', 'start:dev'], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '../apps/nest-server'),
        });
    }
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
    }
    else {
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
    startNestServer();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('before-quit', () => {
    nestProcess?.kill();
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
/** ===== 示例 IPC（可按需扩展） ===== */
ipcMain.handle('app:getVersion', () => app.getVersion());
/** （可选）单实例防重开 */
if (!app.requestSingleInstanceLock()) {
    app.quit();
}
else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized())
                win.restore();
            win.focus();
        }
    });
}
