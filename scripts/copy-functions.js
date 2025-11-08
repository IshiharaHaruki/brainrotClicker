/**
 * 复制 Cloudflare Pages Functions 到构建输出目录
 *
 * Cloudflare Pages 期望 Functions 在构建输出的 functions/ 目录下
 * 此脚本在 Next.js 构建后运行，将 functions/ 复制到输出目录
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../functions');
const TARGET_DIR = path.join(__dirname, '../.vercel/output/static/functions');

/**
 * 递归复制目录
 */
function copyDirectory(src, dest) {
  // 创建目标目录
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 递归复制子目录
      copyDirectory(srcPath, destPath);
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${entry.name}`);
    }
  }
}

// 主执行逻辑
try {
  console.log('📦 Copying Cloudflare Pages Functions...');
  console.log(`   Source: ${SOURCE_DIR}`);
  console.log(`   Target: ${TARGET_DIR}`);
  console.log('');

  // 检查源目录是否存在
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('❌ Error: functions/ directory not found');
    process.exit(1);
  }

  // 检查构建输出目录是否存在
  if (!fs.existsSync(path.join(__dirname, '../.vercel/output/static'))) {
    console.error('❌ Error: Build output directory not found');
    console.error('   Please run `next build` first');
    process.exit(1);
  }

  // 执行复制
  copyDirectory(SOURCE_DIR, TARGET_DIR);

  console.log('');
  console.log('✅ Functions copied successfully!');
  console.log('');
  console.log('📝 Files will be deployed to:');
  console.log('   /api/track (POST) - Analytics tracking endpoint');
  console.log('   /api/stats/:slug (GET) - Stats query endpoint');
  console.log('');

} catch (error) {
  console.error('❌ Error copying functions:', error.message);
  process.exit(1);
}
