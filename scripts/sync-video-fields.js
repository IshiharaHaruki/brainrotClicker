#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  enDir: path.join(__dirname, '../pages/en/games'),
  cnDir: path.join(__dirname, '../pages/cn/games'),
  esDir: path.join(__dirname, '../pages/es/games'),
  categories: ['clicker', 'brainrot'],
};

// 统计
const stats = {
  total: 0,
  cnSuccess: 0,
  esSuccess: 0,
  cnFailed: [],
  esFailed: [],
};

/**
 * 从frontmatter中提取字段
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = match[1];
  const lines = frontmatter.split('\n');

  return { frontmatter, lines, fullContent: content };
}

/**
 * 从EN文件提取video相关字段
 */
function extractVideoFields(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = parseFrontmatter(content);

  if (!parsed) return null;

  const { lines } = parsed;
  let video = null;
  let videoTitle = null;
  let title = null;
  let insertAfterLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('title:')) {
      title = line.replace('title:', '').trim();
    }
    if (line.startsWith('video:')) {
      video = line.replace('video:', '').trim();
    }
    if (line.startsWith('videoTitle:')) {
      videoTitle = line.replace('videoTitle:', '').trim();
    }
    if (line.startsWith('breadcrumb:') || line.startsWith('filter:')) {
      insertAfterLine = i;
    }
  }

  if (!video) return null;

  return { title, video, videoTitle, insertAfterLine };
}

/**
 * 翻译videoTitle
 */
function translateVideoTitle(title, locale) {
  if (locale === 'cn') {
    return `${title} - 游戏演示`;
  }
  if (locale === 'es') {
    return `${title} - Gameplay`;
  }
  return title;
}

/**
 * 在目标文件中插入video字段
 */
function insertVideoFields(targetFilePath, videoFields, locale) {
  if (!fs.existsSync(targetFilePath)) {
    return { success: false, error: '文件不存在' };
  }

  const content = fs.readFileSync(targetFilePath, 'utf-8');
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    return { success: false, error: 'frontmatter解析失败' };
  }

  const { lines, fullContent } = parsed;

  // 检查是否已有video字段
  const hasVideo = lines.some(line => line.startsWith('video:'));
  if (hasVideo) {
    return { success: false, error: '已存在video字段', skipped: true };
  }

  // 找到插入位置 (breadcrumb或filter后)
  let insertIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('breadcrumb:') || lines[i].startsWith('filter:')) {
      insertIndex = i + 1;
    }
  }

  if (insertIndex === -1) {
    // 如果没找到breadcrumb/filter,插入在categories后
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('categories:')) {
        insertIndex = i + 1;
        break;
      }
    }
  }

  if (insertIndex === -1) {
    return { success: false, error: '无法找到插入位置' };
  }

  // 生成本地化的videoTitle
  const localizedVideoTitle = translateVideoTitle(videoFields.title, locale);

  // 插入video字段
  lines.splice(insertIndex, 0, `video: ${videoFields.video}`);
  lines.splice(insertIndex + 1, 0, `videoTitle: ${localizedVideoTitle}`);

  // 重新构建内容
  const newFrontmatter = lines.join('\n');
  const newContent = fullContent.replace(/^---\n[\s\S]*?\n---/, `---\n${newFrontmatter}\n---`);

  // 写入文件
  fs.writeFileSync(targetFilePath, newContent, 'utf-8');

  return { success: true };
}

/**
 * 同步单个游戏文件
 */
function syncGameFile(category, filename) {
  const enPath = path.join(CONFIG.enDir, category, filename);
  const cnPath = path.join(CONFIG.cnDir, category, filename);
  const esPath = path.join(CONFIG.esDir, category, filename);

  // 提取EN版本的video字段
  const videoFields = extractVideoFields(enPath);

  if (!videoFields) {
    console.log(`⏭️  跳过 ${category}/${filename} (无video字段)`);
    return;
  }

  console.log(`\n📹 处理: ${category}/${filename}`);
  console.log(`   标题: ${videoFields.title}`);
  console.log(`   视频: ${videoFields.video}`);

  stats.total++;

  // 同步到CN
  const cnResult = insertVideoFields(cnPath, videoFields, 'cn');
  if (cnResult.success) {
    console.log(`   ✅ CN: ${translateVideoTitle(videoFields.title, 'cn')}`);
    stats.cnSuccess++;
  } else if (cnResult.skipped) {
    console.log(`   ⏭️  CN: 已存在(跳过)`);
  } else {
    console.log(`   ❌ CN: ${cnResult.error}`);
    stats.cnFailed.push(`${category}/${filename}: ${cnResult.error}`);
  }

  // 同步到ES
  const esResult = insertVideoFields(esPath, videoFields, 'es');
  if (esResult.success) {
    console.log(`   ✅ ES: ${translateVideoTitle(videoFields.title, 'es')}`);
    stats.esSuccess++;
  } else if (esResult.skipped) {
    console.log(`   ⏭️  ES: 已存在(跳过)`);
  } else {
    console.log(`   ❌ ES: ${esResult.error}`);
    stats.esFailed.push(`${category}/${filename}: ${esResult.error}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始同步视频字段到CN和ES版本...\n');
  console.log('=' .repeat(60));

  // 遍历所有分类
  CONFIG.categories.forEach(category => {
    const categoryPath = path.join(CONFIG.enDir, category);

    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  目录不存在: ${category}`);
      return;
    }

    // 读取该分类下的所有MDX文件
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.mdx'));

    console.log(`\n📁 分类: ${category} (${files.length}个文件)`);
    console.log('-'.repeat(60));

    files.forEach(filename => {
      syncGameFile(category, filename);
    });
  });

  // 打印统计报告
  console.log('\n');
  console.log('='.repeat(60));
  console.log('📊 同步报告');
  console.log('='.repeat(60));
  console.log(`总计处理: ${stats.total} 个游戏`);
  console.log(`CN成功: ${stats.cnSuccess}/${stats.total}`);
  console.log(`ES成功: ${stats.esSuccess}/${stats.total}`);

  if (stats.cnFailed.length > 0) {
    console.log(`\n❌ CN失败 (${stats.cnFailed.length}):`);
    stats.cnFailed.forEach(err => console.log(`   - ${err}`));
  }

  if (stats.esFailed.length > 0) {
    console.log(`\n❌ ES失败 (${stats.esFailed.length}):`);
    stats.esFailed.forEach(err => console.log(`   - ${err}`));
  }

  const totalExpected = stats.total * 2; // CN + ES
  const totalSuccess = stats.cnSuccess + stats.esSuccess;

  console.log('\n' + '='.repeat(60));
  if (totalSuccess === totalExpected) {
    console.log('✅ 所有文件同步成功!');
  } else {
    console.log(`⚠️  ${totalSuccess}/${totalExpected} 文件同步成功`);
  }
  console.log('='.repeat(60));
}

// 执行
main();
