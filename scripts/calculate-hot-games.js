#!/usr/bin/env node

/**
 * 计算 HOT 游戏评分脚本
 *
 * 功能：
 * - 从 Cloudflare KV 获取游戏统计数据
 * - 计算综合评分（PV + 卡片点击 + 游戏启动 + 停留时长）
 * - 生成 HOT 游戏列表（Top 10）
 * - 输出到 JSON 文件
 *
 * 环境变量：
 * - CLOUDFLARE_ACCOUNT_ID: Cloudflare 账户 ID
 * - CLOUDFLARE_API_TOKEN: Cloudflare API Token
 * - CLOUDFLARE_KV_NAMESPACE_ID: KV Namespace ID
 */

const fs = require('fs');
const path = require('path');

// ========== 配置 ==========

const CONFIG = {
  // Cloudflare 配置（从环境变量读取）
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  kvNamespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID,

  // 评分权重配置
  weights: {
    pv: 0.30,          // 页面浏览权重 30%
    cardClick: 0.25,   // 卡片点击权重 25%
    gameStart: 0.30,   // 游戏启动权重 30%
    timeSpent: 0.15    // 停留时长权重 15%
  },

  // 统计周期（天数）
  periodDays: 7,

  // HOT 游戏数量
  hotGamesCount: 10,

  // 输出文件路径
  outputPath: path.join(__dirname, '../.cache/hot-games.json'),
};

// 验证环境变量
if (!CONFIG.accountId || !CONFIG.apiToken || !CONFIG.kvNamespaceId) {
  console.error('❌ 缺少必需的环境变量:');
  console.error('   - CLOUDFLARE_ACCOUNT_ID');
  console.error('   - CLOUDFLARE_API_TOKEN');
  console.error('   - CLOUDFLARE_KV_NAMESPACE_ID');
  process.exit(1);
}

// ========== Cloudflare KV API ==========

/**
 * 从 Cloudflare KV 获取所有键
 */
async function listAllKeys() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/storage/kv/namespaces/${CONFIG.kvNamespaceId}/keys`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${CONFIG.apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list keys: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result.map(item => item.name);
}

/**
 * 从 Cloudflare KV 获取键值
 */
async function getKeyValue(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CONFIG.accountId}/storage/kv/namespaces/${CONFIG.kvNamespaceId}/values/${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${CONFIG.apiToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

// ========== 数据处理 ==========

/**
 * 解析 KV 键格式：stats:{gameSlug}:{type}:{date}
 */
function parseKey(key) {
  const match = key.match(/^stats:([^:]+):([^:]+):([^:]+)$/);
  if (!match) return null;

  return {
    gameSlug: match[1],
    type: match[2],  // pv, card_click, game_start, time_spent
    date: match[3],  // YYYY-MM-DD
  };
}

/**
 * 检查日期是否在指定天数内
 */
function isWithinDays(dateStr, days) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/**
 * 聚合游戏统计数据
 */
async function aggregateGameStats(keys) {
  console.log(`📊 正在聚合 ${keys.length} 个数据键...`);

  const gameStats = {};

  for (const key of keys) {
    const parsed = parseKey(key);
    if (!parsed) continue;

    // 只统计最近 N 天的数据
    if (!isWithinDays(parsed.date, CONFIG.periodDays)) {
      continue;
    }

    const { gameSlug, type } = parsed;

    // 初始化游戏统计
    if (!gameStats[gameSlug]) {
      gameStats[gameSlug] = {
        pv: { count: 0, total: 0 },
        card_click: { count: 0, total: 0 },
        game_start: { count: 0, total: 0 },
        time_spent: { count: 0, total: 0 },
      };
    }

    // 获取值并累加
    const value = await getKeyValue(key);
    if (value && value.count) {
      gameStats[gameSlug][type].count += value.count;
      gameStats[gameSlug][type].total += value.total || 0;
    }
  }

  console.log(`✅ 聚合完成，共 ${Object.keys(gameStats).length} 个游戏`);
  return gameStats;
}

/**
 * 计算综合评分
 */
function calculateScores(gameStats) {
  console.log('🧮 正在计算综合评分...');

  const games = Object.entries(gameStats).map(([slug, stats]) => ({
    slug,
    stats,
  }));

  // 找出各指标的最大值（用于归一化）
  const max = {
    pv: Math.max(...games.map(g => g.stats.pv.count), 1),
    cardClick: Math.max(...games.map(g => g.stats.card_click.count), 1),
    gameStart: Math.max(...games.map(g => g.stats.game_start.count), 1),
    timeSpent: Math.max(...games.map(g => {
      return g.stats.time_spent.count > 0
        ? g.stats.time_spent.total / g.stats.time_spent.count
        : 0;
    }), 1),
  };

  // 计算每个游戏的评分
  const scores = games.map(game => {
    const { stats } = game;

    // 归一化处理（0-1 范围）
    const normalized = {
      pv: stats.pv.count / max.pv,
      cardClick: stats.card_click.count / max.cardClick,
      gameStart: stats.game_start.count / max.gameStart,
      timeSpent: stats.time_spent.count > 0
        ? (stats.time_spent.total / stats.time_spent.count) / max.timeSpent
        : 0,
    };

    // 加权求和（总分 100）
    const score = (
      normalized.pv * CONFIG.weights.pv +
      normalized.cardClick * CONFIG.weights.cardClick +
      normalized.gameStart * CONFIG.weights.gameStart +
      normalized.timeSpent * CONFIG.weights.timeSpent
    ) * 100;

    return {
      slug: game.slug,
      score: Math.round(score * 100) / 100,  // 保留两位小数
      stats: {
        pv: stats.pv.count,
        cardClick: stats.card_click.count,
        gameStart: stats.game_start.count,
        avgTimeSpent: stats.time_spent.count > 0
          ? Math.round(stats.time_spent.total / stats.time_spent.count)
          : 0,
      },
    };
  });

  // 按评分降序排序
  scores.sort((a, b) => b.score - a.score);

  console.log(`✅ 评分计算完成`);
  return scores;
}

/**
 * 生成 HOT 游戏列表
 */
function generateHotList(scores) {
  const topGames = scores.slice(0, CONFIG.hotGamesCount);

  console.log('\n🔥 HOT 游戏 TOP 10:');
  console.log('━'.repeat(80));
  topGames.forEach((game, index) => {
    console.log(`${index + 1}. ${game.slug} (评分: ${game.score})`);
    console.log(`   PV: ${game.stats.pv} | 点击: ${game.stats.cardClick} | 启动: ${game.stats.gameStart} | 停留: ${game.stats.avgTimeSpent}s`);
  });
  console.log('━'.repeat(80));

  return {
    generatedAt: new Date().toISOString(),
    period: `最近 ${CONFIG.periodDays} 天`,
    total: scores.length,
    hotGames: topGames.map(g => g.slug),
    details: topGames,
  };
}

// ========== 主函数 ==========

async function main() {
  console.log('🚀 开始计算 HOT 游戏...\n');

  try {
    // 1. 获取所有键
    console.log('📡 正在从 Cloudflare KV 获取数据...');
    const keys = await listAllKeys();
    console.log(`✅ 获取到 ${keys.length} 个数据键\n`);

    // 2. 聚合数据
    const gameStats = await aggregateGameStats(keys);

    // 3. 计算评分
    const scores = calculateScores(gameStats);

    // 4. 生成 HOT 列表
    const hotList = generateHotList(scores);

    // 5. 保存到文件
    const outputDir = path.dirname(CONFIG.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      CONFIG.outputPath,
      JSON.stringify(hotList, null, 2),
      'utf-8'
    );

    console.log(`\n💾 结果已保存到: ${CONFIG.outputPath}`);
    console.log('\n✅ 计算完成！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 执行
main();
