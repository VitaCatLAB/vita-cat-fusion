import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// 获取完整和短哈希值
const commitHash = execSync('git rev-parse HEAD').toString().trim();
const shortCommitHash = execSync('git rev-parse --short HEAD').toString().trim();

// 写入到 `.env` 文件
const envContent = `VITE_COMMIT_HASH=${commitHash}\nVITE_SHORT_COMMIT_HASH=${shortCommitHash}\n`;
writeFileSync('.env', envContent, { flag: 'a' });

console.log('Git 提交编号已写入 .env 文件');
