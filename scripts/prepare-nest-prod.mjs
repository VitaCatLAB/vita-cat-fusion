import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'apps/nest-server');
const DIST = path.join(ROOT, '.build/nest-server');

// 执行命令工具
function run(cmd, cwd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
}

async function main() {
  console.log('📦 Preparing isolated Nest production package...');

  // 1️⃣ 清空隔离目录
  await fs.remove(DIST);
  await fs.ensureDir(DIST);

  // 2️⃣ 复制必要文件（不复制 node_modules、src、.pnpm、test）
  await fs.copy(SRC, DIST, {
    filter: (src) => {
      return (
        !src.includes('node_modules') &&
        !src.includes('src') &&
        !src.includes('.pnpm') &&
        !src.includes('test')
      );
    },
  });

  console.log('✅ Nest files copied');

  // 3️⃣ 确保 dist 存在
  const distDir = path.join(DIST, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('❌ dist directory not found, did you run nest build?');
  }

  // 4️⃣ 安装 production 依赖
  run('npm install --production', DIST);
  // 5️⃣ 用 Electron Node 重新编译原生模块
  run('npx electron-rebuild -f -w better-sqlite3', DIST);
  // 6️⃣ 重命名 node_modules 为 node_deps（解决 electron-builder 不复制 node_modules 的问题）
  const nodeModulesPath = path.join(DIST, 'node_modules');
  const nodeDepsPath = path.join(DIST, 'node_deps');
  if (fs.existsSync(nodeModulesPath)) {
    await fs.move(nodeModulesPath, nodeDepsPath, { overwrite: true });
    console.log('✅ node_modules renamed to node_deps for Electron packaging');
  } else {
    console.warn('⚠️ node_modules not found, skipping rename');
  }

  console.log('\n🎉 Nest production package ready:');
  console.log(DIST);
  console.log(
    '\n💡 Tip: In Electron main process, start Nest with NODE_PATH pointing to node_deps',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
