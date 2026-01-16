import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';

const ROOT = process.cwd();

const SRC = path.join(ROOT, 'apps/nest-server');
const DIST = path.join(ROOT, '.build/nest-server');

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

  // 2️⃣ 复制必要文件
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

  // 4️⃣ 使用 npm :
  run('npm install --production', DIST);

  console.log('\n🎉 Nest production package ready:');
  console.log(DIST);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
