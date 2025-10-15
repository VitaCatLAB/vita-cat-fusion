// scripts/dev-electron.mjs
import { createServer } from 'vite';
import { spawn } from 'node:child_process';

async function main() {
  // 1) 启动 Vite（会自动读取你的 vite.config.ts / .env）
  const server = await createServer({ root: process.cwd() });
  await server.listen();

  const urls = server.resolvedUrls?.local ?? [];
  const devUrl = urls[0] ?? `http://localhost:${server.config.server.port}`;
  console.log(`[dev-electron] Vite dev server: ${devUrl}`);

  // 2) 启动 Electron，并把 URL 注入给主进程
  const electronBin = process.platform === 'win32' ? 'electron.cmd' : 'electron';
  const child = spawn(electronBin, ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: devUrl, // ⭐ 主进程里可用
    },
  });

  // 3) 退出处理：任一方退出都清理
  const cleanup = () => server.close().catch(() => {});
  process.on('SIGINT', () => {
    child.kill('SIGINT');
    cleanup();
  });
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    cleanup();
  });
  child.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });
}

main().catch((e) => {
  console.error('[dev-electron] failed:', e);
  process.exit(1);
});
