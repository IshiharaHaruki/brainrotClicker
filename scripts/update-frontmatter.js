#!/usr/bin/env node

/**
 * 更新游戏 frontmatter 脚本
 *
 * 功能：
 * - 读取 HOT 游戏列表（从 calculate-hot-games.js 生成的 JSON）
 * - 遍历所有语言版本的游戏 MDX 文件
 * - 更新 frontmatter 中的 `filter` 字段：
 *   - HOT 游戏：添加或更新为 `filter: hot`
 *   - 非 HOT 游戏：保留现有 `filter: new` 或删除 `filter`
 *
 * 使用：
 * node scripts/update-frontmatter.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// ========== 配置 ==========

const CONFIG = {
  // HOT 游戏列表路径
  hotGamesPath: path.join(__dirname, '../.cache/hot-games.json'),

  // 支持的语言
  locales: ['en', 'es', 'cn'],

  // 游戏文件路径模式
  gamesPattern: 'pages/{locale}/games/**/*.mdx',

  // 排除的文件（分类页和首页）
  excludePatterns: [
    '**/index.mdx',
    '**/clicker.mdx',
    '**/brainrot.mdx',
  ],
};

// ========== 工具函数 ==========

/**
 * 从路由路径提取游戏 slug
 * 例如：/en/games/clicker/cookie-clicker → /games/clicker/cookie-clicker
 */
function extractSlug(filePath) {
  // 移除 .mdx 后缀
  let slug = filePath.replace(/\.mdx$/, '');

  // 移除 pages/ 前缀
  slug = slug.replace(/^pages\//, '');

  // 移除语言前缀 (en/, es/, cn/)
  slug = slug.replace(/^(en|es|cn)\//, '/');

  return slug;
}

/**
 * 检查文件是否应该被排除
 */
function shouldExclude(filePath) {
  return CONFIG.excludePatterns.some(pattern => {
    return filePath.includes(pattern.replace('**/', ''));
  });
}

/**
 * 更新单个文件的 frontmatter
 */
function updateFileFrontmatter(filePath, hotGames) {
  try {
    // 读取文件
    const content = fs.readFileSync(filePath, 'utf-8');

    // 解析 frontmatter
    const { data, content: body } = matter(content);

    // 提取 slug
    const slug = extractSlug(filePath);

    // 判断是否为 HOT 游戏
    const isHot = hotGames.includes(slug);

    let changed = false;

    if (isHot) {
      // 标记为 HOT
      if (data.filter !== 'hot') {
        data.filter = 'hot';
        changed = true;
      }
    } else {
      // 非 HOT 游戏：保留 'new' 或删除 'filter'
      if (data.filter === 'hot') {
        // 如果之前是 HOT，现在不是了，删除 filter
        delete data.filter;
        changed = true;
      }
      // 保留 'new' 标记不变
    }

    // 如果有变化，写回文件
    if (changed) {
      const updated = matter.stringify(body, data);
      fs.writeFileSync(filePath, updated, 'utf-8');
      return { changed: true, slug, isHot };
    }

    return { changed: false, slug, isHot };

  } catch (error) {
    console.error(`❌ 更新文件失败: ${filePath}`);
    console.error(`   错误: ${error.message}`);
    return { changed: false, error: true };
  }
}

// ========== 主函数 ==========

async function main() {
  console.log('🚀 开始更新游戏 frontmatter...\n');

  try {
    // 1. 读取 HOT 游戏列表
    if (!fs.existsSync(CONFIG.hotGamesPath)) {
      console.error(`❌ HOT 游戏列表不存在: ${CONFIG.hotGamesPath}`);
      console.error('   请先运行: node scripts/calculate-hot-games.js');
      process.exit(1);
    }

    const hotData = JSON.parse(fs.readFileSync(CONFIG.hotGamesPath, 'utf-8'));
    const hotGames = hotData.hotGames;

    console.log(`📊 HOT 游戏列表: ${hotGames.length} 个游戏`);
    console.log(`   生成时间: ${hotData.generatedAt}`);
    console.log(`   统计周期: ${hotData.period}\n`);

    // 2. 遍历所有语言
    let totalFiles = 0;
    let totalChanged = 0;
    let totalHot = 0;

    for (const locale of CONFIG.locales) {
      console.log(`\n🌐 处理语言: ${locale}`);

      // 查找所有游戏文件
      const pattern = CONFIG.gamesPattern.replace('{locale}', locale);
      const files = glob.sync(pattern, { cwd: path.join(__dirname, '..') });

      console.log(`   找到 ${files.length} 个文件`);

      // 过滤排除的文件
      const validFiles = files.filter(f => !shouldExclude(f));
      console.log(`   有效文件: ${validFiles.length} 个`);

      // 更新每个文件
      for (const file of validFiles) {
        const filePath = path.join(__dirname, '..', file);
        const result = updateFileFrontmatter(filePath, hotGames);

        if (result.error) continue;

        totalFiles++;
        if (result.changed) {
          totalChanged++;
          const action = result.isHot ? '➕ HOT' : '➖ 移除 HOT';
          console.log(`   ${action}: ${result.slug}`);
        }
        if (result.isHot) {
          totalHot++;
        }
      }
    }

    // 3. 输出统计
    console.log('\n' + '='.repeat(60));
    console.log('📈 更新统计:');
    console.log(`   总文件数: ${totalFiles}`);
    console.log(`   已更新: ${totalChanged}`);
    console.log(`   HOT 游戏: ${totalHot}`);
    console.log('='.repeat(60));

    console.log('\n✅ frontmatter 更新完成！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行
main();
